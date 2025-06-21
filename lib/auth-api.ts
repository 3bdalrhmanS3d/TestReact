import type {
  SignupRequestDto,
  SigninRequestDto,
  VerifyAccountRequestDto,
  ForgetPasswordRequestDto,
  ResetPasswordRequestDto,
  RefreshTokenRequestDto,
  SecureAuthResponse,
  SigninResponseDto,
  RefreshTokenResponseDto,
  AutoLoginResponseDto,
} from "@/types/auth"

// API endpoints configuration
const API_ENDPOINTS = ["http://localhost:5268/api", "https://localhost:7217/api"]

let CURRENT_API_BASE_URL = API_ENDPOINTS[0]

class AuthApiClient {
  private async findWorkingEndpoint(): Promise<string | null> {
    for (const endpoint of API_ENDPOINTS) {
      try {
        console.log(`🔍 Testing endpoint: ${endpoint}`)
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 3000)

        const res = await fetch(`${endpoint.replace("/api", "")}/health`, { signal: controller.signal })
        clearTimeout(timeoutId)

        if (res.ok) {
          console.log(`✅ Found working endpoint: ${endpoint}`)
          CURRENT_API_BASE_URL = endpoint
          return endpoint
        }
      } catch (err) {
        console.log(`❌ Endpoint failed: ${endpoint}`, err)
      }
    }
    console.log("🚨 No working endpoint found")
    return null
  }

  private getAuthHeaders(): HeadersInit {
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<SecureAuthResponse<T>> {
    const base = await this.findWorkingEndpoint()
    if (!base) {
      return {
        success: false,
        message: `لا يمكن الوصول للخادم. جرّب العناوين:\n${API_ENDPOINTS.join("\n")}`,
        timestamp: new Date().toISOString(),
        requestId: Math.random().toString(36).substr(2, 8),
      }
    }

    const url = `${base}${endpoint}`
    console.log(`🌐 API Request: ${options.method || "GET"} ${url}`)

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000)

      const res = await fetch(url, {
        ...options,
        headers: {
          ...this.getAuthHeaders(),
          ...options.headers,
        },
        credentials: "include",
        signal: controller.signal,
      })
      clearTimeout(timeoutId)

      console.log(`📡 Response Status: ${res.status} ${res.statusText}`)

      let data: any
      const ct = res.headers.get("content-type") || ""
      if (ct.includes("application/json")) {
        data = await res.json()
        console.log("📥 Response Data:", data)
      } else {
        const txt = await res.text()
        console.log("📄 Response Text:", txt)
        data = { message: txt || res.statusText }
      }

      if (!res.ok) {
        console.warn("❌ API Warning:", data)
        const msg = data.message ?? data.Message ?? res.statusText ?? `خطأ في الخادم (${res.status})`
        return {
          success: false,
          message: msg,
          errorCode: data.errorCode || data.ErrorCode,
          timestamp: new Date().toISOString(),
          requestId: Math.random().toString(36).substr(2, 8),
        }
      }

      return {
        success: true,
        data: data.data ?? data.Data ?? data,
        message: data.message ?? data.Message ?? "Success",
        timestamp: new Date().toISOString(),
        requestId: Math.random().toString(36).substr(2, 8),
      }
    } catch (err: any) {
      console.warn("🚨 Network Warning:", err)
      if (err.name === "AbortError") {
        return {
          success: false,
          message: "انتهت مهلة الاتصال. حاول مجددًا.",
          timestamp: new Date().toISOString(),
          requestId: Math.random().toString(36).substr(2, 8),
        }
      }
      if (err.message.includes("fetch")) {
        return {
          success: false,
          message: `فشل في الاتصال بالخادم. العناوين المفحوصة:\n${API_ENDPOINTS.join("\n")}`,
          timestamp: new Date().toISOString(),
          requestId: Math.random().toString(36).substr(2, 8),
        }
      }
      return {
        success: false,
        message: "حدث خطأ في الشبكة. تحقق من اتصالك بالإنترنت.",
        timestamp: new Date().toISOString(),
        requestId: Math.random().toString(36).substr(2, 8),
      }
    }
  }

  async testConnection(): Promise<boolean> {
    const endpoint = await this.findWorkingEndpoint()
    return endpoint !== null
  }

  // Auth Endpoints
  async signup(data: SignupRequestDto) {
    console.log("🔐 Signup for:", data.emailAddress)
    return this.request("/Auth/signup", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async verifyAccount(data: VerifyAccountRequestDto) {
    return this.request("/Auth/verify-account", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async resendVerificationCode() {
    return this.request("/Auth/resend-verification-code", {
      method: "POST",
    })
  }

  async signin(data: SigninRequestDto) {
    const response = await this.request<SigninResponseDto>("/Auth/signin", {
      method: "POST",
      body: JSON.stringify(data),
    })

    if (response.success && response.data && typeof window !== "undefined") {
      localStorage.setItem("accessToken", response.data.token)
      localStorage.setItem("refreshToken", response.data.refreshToken)
    }

    return response
  }

  async refreshToken(data: RefreshTokenRequestDto) {
    const response = await this.request<RefreshTokenResponseDto>("/Auth/refresh-token", {
      method: "POST",
      body: JSON.stringify(data),
    })

    if (response.success && response.data && typeof window !== "undefined") {
      localStorage.setItem("accessToken", response.data.token)
      localStorage.setItem("refreshToken", response.data.refreshToken)
    }
    return response
  }

  async autoLoginFromCookie() {
    return this.request<AutoLoginResponseDto>("/Auth/auto-login-from-cookie", {
      method: "POST",
    })
  }

  async forgetPassword(data: ForgetPasswordRequestDto) {
    return this.request("/Auth/forget-password", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async resetPassword(data: ResetPasswordRequestDto) {
    return this.request("/Auth/reset-password", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async logout() {
    const response = await this.request("/Auth/logout", { method: "POST" })
    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken")
      localStorage.removeItem("refreshToken")
    }
    return response
  }
}

export const authApi = new AuthApiClient()
