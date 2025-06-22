import type {
  UserProfileDto,
  UserProfileUpdateDto,
  ChangeUserNameDto,
  ChangePasswordDto,
  PaymentRequestDto,
  MyCourseDto,
  CourseDto,
  UserActivityDto,
  StudentStatsDto,
  ChangeUserNameResultDto,
} from "@/types/auth"

// API endpoints configuration
const API_ENDPOINTS = ["http://localhost:5268/api", "https://localhost:7217/api"]

let CURRENT_API_BASE_URL = API_ENDPOINTS[0]

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  errorCode?: string
  errors?: any
  statusCode?: number
}

class ProfileApiClient {
  private async findWorkingEndpoint(): Promise<string | null> {
    for (const endpoint of API_ENDPOINTS) {
      try {
        console.log(`🔍 Testing profile endpoint: ${endpoint}`)
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 3000)

        const healthUrl = endpoint.replace("/api", "") + "/health"
        const res = await fetch(healthUrl, {
          signal: controller.signal,
          method: "GET",
          headers: { "Content-Type": "application/json" },
        })
        clearTimeout(timeoutId)

        if (res.ok) {
          console.log(`✅ Profile endpoint working: ${endpoint}`)
          CURRENT_API_BASE_URL = endpoint
          return endpoint
        }
      } catch (err) {
        console.log(`❌ Profile endpoint failed: ${endpoint}`, err)
      }
    }
    console.log("🚨 No working profile endpoint found")
    return null
  }

  private getAuthHeaders(): HeadersInit {
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const base = await this.findWorkingEndpoint()
    if (!base) {
      return {
        success: false,
        message: "لا يمكن الوصول للخادم. تحقق من اتصالك بالإنترنت.",
        statusCode: 0,
      }
    }

    const url = `${base}${endpoint}`
    console.log(`🌐 Profile API Request: ${options.method || "GET"} ${url}`)

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

      console.log(`📡 Profile Response Status: ${res.status} ${res.statusText}`)

      let data: any
      const contentType = res.headers.get("content-type") || ""

      if (contentType.includes("application/json")) {
        data = await res.json()
        console.log("📥 Profile Response Data:", data)
      } else {
        const text = await res.text()
        console.log("📄 Profile Response Text:", text)
        data = { message: text || res.statusText }
      }

      if (!res.ok) {
        console.warn("❌ Profile API Error:", data)
        return {
          success: false,
          message: data.message || data.Message || res.statusText || `خطأ في الخادم (${res.status})`,
          errorCode: data.errorCode || data.ErrorCode,
          errors: data.errors || data.Errors,
          statusCode: res.status,
        }
      }

      return {
        success: true,
        data: data.data || data.Data || data,
        message: data.message || data.Message || "تم بنجاح",
        statusCode: res.status,
      }
    } catch (err: any) {
      console.error("🚨 Profile Network Error:", err)

      if (err.name === "AbortError") {
        return {
          success: false,
          message: "انتهت مهلة الاتصال. حاول مجددًا.",
          statusCode: 408,
        }
      }

      return {
        success: false,
        message: "حدث خطأ في الشبكة. تحقق من اتصالك بالإنترنت.",
        statusCode: 0,
      }
    }
  }

  // Test connection
  async testConnection(): Promise<boolean> {
    const endpoint = await this.findWorkingEndpoint()
    return endpoint !== null
  }

  // Profile endpoints
  async getDashboard(): Promise<ApiResponse<any>> {
    return this.request("/profile/dashboard")
  }

  async getProfile(): Promise<ApiResponse<UserProfileDto>> {
    return this.request<UserProfileDto>("/profile")
  }

  async updateProfile(data: UserProfileUpdateDto): Promise<ApiResponse<any>> {
    console.log("📝 Updating profile with data:", data)
    return this.request("/profile/update", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async changeUserName(data: ChangeUserNameDto): Promise<ApiResponse<ChangeUserNameResultDto>> {
    return this.request<ChangeUserNameResultDto>("/profile/change-name", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async changePassword(data: ChangePasswordDto): Promise<ApiResponse<any>> {
    return this.request("/profile/change-password", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  // Payment endpoints
  async payForCourse(data: PaymentRequestDto): Promise<ApiResponse<any>> {
    return this.request("/profile/pay-course", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async confirmPayment(paymentId: number): Promise<ApiResponse<any>> {
    return this.request(`/profile/confirm-payment/${paymentId}`, {
      method: "POST",
    })
  }

  // Course endpoints
  async getMyCourses(): Promise<ApiResponse<MyCourseDto[]>> {
    return this.request<MyCourseDto[]>("/profile/my-courses")
  }

  async getFavoriteCourses(): Promise<ApiResponse<CourseDto[]>> {
    return this.request<CourseDto[]>("/profile/favorite-courses")
  }

  async addToFavorites(courseId: number): Promise<ApiResponse<any>> {
    return this.request(`/profile/favorites/${courseId}`, { method: "POST" })
  }

  async removeFromFavorites(courseId: number): Promise<ApiResponse<any>> {
    return this.request(`/profile/favorites/${courseId}`, { method: "DELETE" })
  }

  // Photo endpoints
  async uploadProfilePhoto(file: File): Promise<ApiResponse<any>> {
    const formData = new FormData()
    formData.append("file", file)

    const base = await this.findWorkingEndpoint()
    if (!base) {
      return {
        success: false,
        message: "لا يمكن الوصول للخادم",
        statusCode: 0,
      }
    }

    const token = localStorage.getItem("accessToken")
    const url = `${base}/profile/upload-photo`

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        credentials: "include",
        body: formData,
      })

      const data = await res.json()

      return {
        success: res.ok,
        data: res.ok ? data.data || data : undefined,
        message: data.message || (res.ok ? "تم رفع الصورة بنجاح" : "فشل في رفع الصورة"),
        statusCode: res.status,
      }
    } catch (err) {
      return {
        success: false,
        message: "حدث خطأ أثناء رفع الصورة",
        statusCode: 0,
      }
    }
  }

  async deleteProfilePhoto(): Promise<ApiResponse<any>> {
    return this.request("/profile/delete-photo", { method: "DELETE" })
  }

  // Stats endpoint
  async getUserStats(): Promise<ApiResponse<StudentStatsDto>> {
    return this.request<StudentStatsDto>("/profile/stats")
  }

  // Activity endpoint
  async getRecentActivities(limit = 10): Promise<ApiResponse<UserActivityDto[]>> {
    return this.request<UserActivityDto[]>(`/profile/recent-activities?limit=${limit}`)
  }
}

export const profileApi = new ProfileApiClient()
