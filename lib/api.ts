// جرب كلا العنوانين - HTTP أولاً ثم HTTPS
const API_ENDPOINTS = ["http://localhost:5268/api", "https://localhost:7217/api"]

let CURRENT_API_BASE_URL = API_ENDPOINTS[0] // ابدأ بـ HTTP

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  errorCode?: string
  errors?: Record<string, string[]>
}

class ApiClient {
  private getAuthHeaders(): HeadersInit {
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }

  // جرب كل العناوين المتاحة
  async findWorkingEndpoint(): Promise<string | null> {
    for (const endpoint of API_ENDPOINTS) {
      try {
        console.log(`🔍 Testing endpoint: ${endpoint}`)

        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 3000)

        const response = await fetch(`${endpoint.replace("/api", "")}/health`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        if (response.ok) {
          console.log(`✅ Found working endpoint: ${endpoint}`)
          CURRENT_API_BASE_URL = endpoint
          return endpoint
        }
      } catch (error) {
        console.log(`❌ Endpoint failed: ${endpoint}`, error)
      }
    }

    console.log("🚨 No working endpoint found")
    return null
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    // جرب العثور على endpoint يعمل أولاً
    const workingEndpoint = await this.findWorkingEndpoint()

    if (!workingEndpoint) {
      return {
        success: false,
        message: `لا يمكن الوصول للخادم. جرب العناوين التالية يدوياً:\n${API_ENDPOINTS.join("\n")}`,
      }
    }

    const url = `${workingEndpoint}${endpoint}`
    console.log(`🌐 API Request: ${options.method || "GET"} ${url}`)

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 second timeout

      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getAuthHeaders(),
          ...options.headers,
        },
        credentials: "include",
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      console.log(`📡 Response Status: ${response.status} ${response.statusText}`)

      let data: any
      const contentType = response.headers.get("content-type")

      if (contentType && contentType.includes("application/json")) {
        data = await response.json()
        console.log(`📥 Response Data:`, data)
      } else {
        const text = await response.text()
        console.log(`📄 Response Text:`, text)
        data = { message: text || "استجابة غير متوقعة من الخادم" }
      }

      if (!response.ok) {
        console.error(`❌ API Error:`, data)

        let errorMessage = "حدث خطأ غير متوقع"

        if (data.message) {
          errorMessage = data.message
        } else if (data.Message) {
          errorMessage = data.Message
        } else if (response.status === 400) {
          errorMessage = "بيانات غير صحيحة"
        } else if (response.status === 401) {
          errorMessage = "غير مصرح لك بالوصول"
        } else if (response.status === 403) {
          errorMessage = "ممنوع الوصول"
        } else if (response.status === 404) {
          errorMessage = "المورد غير موجود"
        } else if (response.status === 500) {
          errorMessage = "خطأ في الخادم"
        } else if (response.status >= 500) {
          errorMessage = "خطأ في الخادم"
        }

        return {
          success: false,
          message: errorMessage,
          errorCode: data.errorCode || data.ErrorCode,
          errors: data.errors || data.Errors,
        }
      }

      console.log(`✅ API Success:`, data)

      return {
        success: true,
        data: data.data || data.Data || data,
        message: data.message || data.Message,
      }
    } catch (error) {
      console.error("🚨 Network Error:", error)

      if (error instanceof Error) {
        if (error.name === "AbortError") {
          return {
            success: false,
            message: "انتهت مهلة الاتصال. يرجى المحاولة مرة أخرى.",
          }
        }

        if (error.message.includes("fetch")) {
          return {
            success: false,
            message: `فشل في الاتصال بالخادم. العناوين المجربة:\n${API_ENDPOINTS.join("\n")}`,
          }
        }
      }

      return {
        success: false,
        message: "حدث خطأ في الشبكة. تحقق من اتصالك بالإنترنت.",
      }
    }
  }

  // Test connection method with better error handling
  async testConnection(): Promise<boolean> {
    const workingEndpoint = await this.findWorkingEndpoint()
    return workingEndpoint !== null
  }

  // Auth endpoints with better error handling
  async signup(data: {
    fullName: string
    emailAddress: string
    password: string
  }) {
    console.log("🔐 Attempting signup for:", data.emailAddress)
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
      autoLoginToken?: string
    }>("/Auth/signin", {
      method: "POST",
      body: JSON.stringify(data),
    })

    if (response.success && response.data && typeof window !== "undefined") {
      localStorage.setItem("accessToken", response.data.accessToken)
      localStorage.setItem("refreshToken", response.data.refreshToken)
      localStorage.setItem(
        "user",
        JSON.stringify({
          userId: response.data.userId,
          fullName: response.data.fullName,
          emailAddress: response.data.emailAddress,
          role: response.data.role,
        }),
      )
    }

    return response
  }

  async refreshToken() {
    if (typeof window === "undefined") {
      throw new Error("No refresh token available")
    }

    const refreshToken = localStorage.getItem("refreshToken")
    if (!refreshToken) {
      throw new Error("No refresh token available")
    }

    const response = await this.request<{
      accessToken: string
      refreshToken: string
    }>("/Auth/refresh-token", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    })

    if (response.success && response.data) {
      localStorage.setItem("accessToken", response.data.accessToken)
      localStorage.setItem("refreshToken", response.data.refreshToken)
    }

    return response
  }

  async autoLoginFromCookie() {
    return this.request("/Auth/auto-login-from-cookie", {
      method: "POST",
    })
  }

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
    const response = await this.request("/Auth/logout", {
      method: "POST",
    })

    // Clear local storage regardless of response
    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken")
      localStorage.removeItem("refreshToken")
      localStorage.removeItem("user")
    }

    return response
  }
}

export const apiClient = new ApiClient()
