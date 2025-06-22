import type {
  SignupRequestDto,
  SigninRequestDto,
  VerifyAccountRequestDto,
  ForgetPasswordRequestDto,
  ResetPasswordRequestDto,
  RefreshTokenRequestDto,
  AutoLoginRequestDto,
  SigninResponseDto,
  RefreshTokenResponseDto,
  AutoLoginResponseDto,
  SecureAuthResponse,
} from "@/types/auth"

// API Endpoints with environment-based configuration
const API_ENDPOINTS = [
  process.env.NEXT_PUBLIC_API_URL,
  "http://localhost:5268/api",
  "https://localhost:7217/api", // الـ port الصحيح
].filter(Boolean) as string[]


class AuthApiClient {
  private baseUrl: string | null = null

  constructor() {
    this.findWorkingEndpoint()
  }

  private async findWorkingEndpoint(): Promise<string | null> {
    if (this.baseUrl) return this.baseUrl

    for (const endpoint of API_ENDPOINTS) {
      try {
        const testUrl = `${endpoint}/Auth/health-check`
        const response = await fetch(testUrl, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          signal: AbortSignal.timeout(5000),
        })

        if (response.ok || response.status === 404) {
          console.log(`✅ API endpoint found: ${endpoint}`)
          this.baseUrl = endpoint
          return endpoint
        }
      } catch (err) {
        console.log(`❌ Failed to connect to: ${endpoint}`)
      }
    }

    console.error("🚨 No working API endpoints found")
    return null
  }

  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<SecureAuthResponse<T>> {
    try {
      const baseUrl = await this.findWorkingEndpoint()
      if (!baseUrl) {
        return {
          success: false,
          message: `لا يمكن الاتصال بالخادم. الخوادم المفحوصة:\n${API_ENDPOINTS.join("\n")}`,
          timestamp: new Date().toISOString(),
          requestId: Math.random().toString(36).substr(2, 8),
        }
      }

      const url = `${baseUrl}${endpoint}`
      console.log(`🌐 API Request: ${options.method || "GET"} ${url}`)

      // Get token from localStorage if available
      const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null

      const defaultHeaders: HeadersInit = {
        "Content-Type": "application/json",
        Accept: "application/json",
      }

      if (token) {
        defaultHeaders.Authorization = `Bearer ${token}`
      }

      const config: RequestInit = {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
        signal: AbortSignal.timeout(30000),
      }

      const response = await fetch(url, config)
      console.log(`📡 Response Status: ${response.status}`)

      let data: SecureAuthResponse<T>
      const contentType = response.headers.get("content-type")

      if (contentType?.includes("application/json")) {
        data = await response.json()
      } else {
        const text = await response.text()
        data = {
          success: response.ok,
          message: text || response.statusText,
          timestamp: new Date().toISOString(),
          requestId: Math.random().toString(36).substr(2, 8),
          statusCode: response.status,
        }
      }

      console.log(`📋 Response Data:`, data)

      // Handle token expiration
      if (response.status === 401 && data.errorCode === "AUTH_005") {
        const refreshToken = localStorage.getItem("refreshToken")
        if (refreshToken) {
          console.log("🔄 Attempting token refresh...")
          const refreshResult = await this.refreshToken({ oldRefreshToken: refreshToken })
          if (refreshResult.success) {
            // Retry the original request with new token
            return this.request(endpoint, options)
          }
        }
        // Clear tokens if refresh failed
        localStorage.removeItem("accessToken")
        localStorage.removeItem("refreshToken")
      }

      return {
        ...data,
        statusCode: response.status,
      }
    } catch (err: any) {
      console.error("🚨 API Request Error:", err)

      if (err.name === "AbortError") {
        return {
          success: false,
          message: "انتهت مهلة الطلب. يرجى المحاولة مرة أخرى.",
          timestamp: new Date().toISOString(),
          requestId: Math.random().toString(36).substr(2, 8),
        }
      }

      if (err.name === "TypeError" && err.message.includes("fetch")) {
        return {
          success: false,
          message: `فشل في الاتصال بالخادم. الخوادم المفحوصة:\n${API_ENDPOINTS.join("\n")}`,
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
      
      // Store auto login token if provided
      if (response.data.autoLoginToken) {
        localStorage.setItem("autoLoginToken", response.data.autoLoginToken)
      }
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
      localStorage.removeItem("autoLoginToken")
    }
    return response
  }
}

export const authApi = new AuthApiClient()