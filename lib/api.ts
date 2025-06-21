// lib/api.ts

// جرب كلا العنوانين - HTTP أولاً ثم HTTPS
const API_ENDPOINTS = [
  "http://localhost:5268/api",
  "https://localhost:7217/api"
]

// نخزّن هنا العنوان الذي نجح
let CURRENT_API_BASE_URL = API_ENDPOINTS[0]

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  errorCode?: string
  errors?: Record<string, string[]>
}

class ApiClient {
  private getAuthHeaders(): HeadersInit {
    const token = typeof window !== "undefined"
      ? localStorage.getItem("accessToken")
      : null
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }

  // يجرب كل endpoint محفوظ
  private async findWorkingEndpoint(): Promise<string | null> {
    for (const endpoint of API_ENDPOINTS) {
      try {
        console.log(`🔍 Testing endpoint: ${endpoint}`)
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 3000)
        const res = await fetch(
          `${endpoint.replace("/api", "")}/health`,
          { signal: controller.signal }
        )
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

  // الدالة الرئيسية لإرسال الطلبات
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    // تأكد من endpoint صالح
    const base = await this.findWorkingEndpoint()
    if (!base) {
      return {
        success: false,
        message: `لا يمكن الوصول للخادم. جرّب العناوين:\n${API_ENDPOINTS.join("\n")}`,
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
        const msg =
          data.message ??
          data.Message ??
          res.statusText ??
          `خطأ في الخادم (${res.status})`
        return {
          success: false,
          message: msg,
          errorCode: data.errorCode || data.ErrorCode,
          errors: data.errors || data.Errors,
        }
      }

      return {
        success: true,
        data: data.data ?? data.Data ?? data,
        message: data.message ?? data.Message,
      }
    } catch (err: any) {
      console.warn("🚨 Network Warning:", err)
      if (err.name === "AbortError") {
        return { success: false, message: "انتهت مهلة الاتصال. حاول مجددًا." }
      }
      if (err.message.includes("fetch")) {
        return {
          success: false,
          message: `فشل في الاتصال بالخادم. العناوين المفحوصة:\n${API_ENDPOINTS.join(
            "\n"
          )}`,
        }
      }
      return {
        success: false,
        message: "حدث خطأ في الشبكة. تحقق من اتصالك بالإنترنت.",
      }
    }
  }

  // ==== Auth Endpoints ====
  async signup(data: {
    fullName: string
    emailAddress: string
    password: string
  }) {
    console.log("🔐 Signup for:", data.emailAddress)
    return this.request("/Auth/signup", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async verifyAccount(data: { verificationCode: string }) {
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

  async signin(data: {
    email: string
    password: string
    rememberMe: boolean
  }) {
    const response = await this.request<{
      accessToken: string
      refreshToken: string
      userId: number
      fullName: string
      emailAddress: string
      role: string
    }>("/Auth/signin", {
      method: "POST",
      body: JSON.stringify({
        email:      data.email,
        password:   data.password,
        rememberMe: data.rememberMe,
      }),
    })

    if (response.success && response.data && typeof window !== "undefined") {
      localStorage.setItem("accessToken", response.data.accessToken)
      localStorage.setItem("refreshToken", response.data.refreshToken)
      localStorage.setItem(
        "user",
        JSON.stringify({
          userId:       response.data.userId,
          fullName:     response.data.fullName,
          emailAddress: response.data.emailAddress,
          role:         response.data.role,
        })
      )
    }

    return response
  }

  // ==== Dashboard Endpoints ====
  async getUserStats() {
    return this.request<{
      sharedCourses: number
      completedSections: number
      progress: Array<{
        courseId: number
        progressPercentage: number
      }>
    }>("/User/stats", { method: "GET" })
  }

  async searchCourses(search?: string) {
    const params = search ? `?search=${encodeURIComponent(search)}` : ""
    return this.request<
      Array<{
        courseId: number
        courseName: string
        description: string
        courseImage: string
        coursePrice: number
      }>
    >(`/User/search-courses${params}`, { method: "GET" })
  }

  // ==== Token Management ====
  async refreshToken() {
    if (typeof window === "undefined") {
      throw new Error("No refresh token available")
    }
    const token = localStorage.getItem("refreshToken")
    if (!token) throw new Error("No refresh token available")

    const response = await this.request<{
      accessToken: string
      refreshToken: string
    }>("/Auth/refresh-token", {
      method: "POST",
      body: JSON.stringify({ refreshToken: token }),
    })

    if (response.success && response.data) {
      localStorage.setItem("accessToken", response.data.accessToken)
      localStorage.setItem("refreshToken", response.data.refreshToken)
    }
    return response
  }

  async autoLoginFromCookie() {
    return this.request("/Auth/auto-login-from-cookie", { method: "POST" })
  }

  // ==== Password Endpoints ====
  async forgetPassword(data: { email: string }) {
    return this.request("/Auth/forget-password", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async resetPassword(data: {
    token: string
    newPassword: string
  }) {
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
      localStorage.removeItem("user")
    }
    return response
  }
}

export const apiClient = new ApiClient()
