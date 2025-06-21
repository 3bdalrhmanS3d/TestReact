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
import type { ApiResponse } from "./api"

// API endpoints configuration
const API_ENDPOINTS = ["http://localhost:5268/api", "https://localhost:7217/api"]

let CURRENT_API_BASE_URL = API_ENDPOINTS[0]

class ProfileApiClient {
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

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const base = await this.findWorkingEndpoint()
    if (!base) {
      return {
        success: false,
        message: `لا يمكن الوصول للخادم. جرّب العناوين:\n${API_ENDPOINTS.join("\n")}`,
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
      const ct = res.headers.get("content-type") || ""
      if (ct.includes("application/json")) {
        data = await res.json()
        console.log("📥 Profile Response Data:", data)
      } else {
        const txt = await res.text()
        console.log("📄 Profile Response Text:", txt)
        data = { message: txt || res.statusText }
      }

      if (!res.ok) {
        console.warn("❌ Profile API Warning:", data)
        const msg = data.message ?? data.Message ?? res.statusText ?? `خطأ في الخادم (${res.status})`
        return {
          success: false,
          message: msg,
          errorCode: data.errorCode || data.ErrorCode,
          errors: data.errors || data.Errors,
          statusCode: res.status,
        }
      }

      return {
        success: true,
        data: data.data ?? data.Data ?? data,
        message: data.message ?? data.Message,
        statusCode: res.status,
      }
    } catch (err: any) {
      console.warn("🚨 Profile Network Warning:", err)
      if (err.name === "AbortError") {
        return { success: false, message: "انتهت مهلة الاتصال. حاول مجددًا." }
      }
      if (err.message.includes("fetch")) {
        return {
          success: false,
          message: `فشل في الاتصال بالخادم. العناوين المفحوصة:\n${API_ENDPOINTS.join("\n")}`,
        }
      }
      return {
        success: false,
        message: "حدث خطأ في الشبكة. تحقق من اتصالك بالإنترنت.",
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
    return this.request("/profile/dashboard", { method: "GET" })
  }

  async getProfile(): Promise<ApiResponse<UserProfileDto>> {
    return this.request<UserProfileDto>("/profile", { method: "GET" })
  }

  async updateProfile(data: UserProfileUpdateDto): Promise<ApiResponse<any>> {
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
  async payForCourse(data: PaymentRequestDto) {
    return this.request("/profile/pay-course", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async confirmPayment(paymentId: number) {
    return this.request(`/profile/confirm-payment/${paymentId}`, {
      method: "POST",
    })
  }

  // Course endpoints
  async getMyCourses(): Promise<ApiResponse<MyCourseDto[]>> {
    return this.request<MyCourseDto[]>("/profile/my-courses", { method: "GET" })
  }

  async getFavoriteCourses(): Promise<ApiResponse<CourseDto[]>> {
    return this.request<CourseDto[]>("/profile/favorite-courses", { method: "GET" })
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

    return this.request("/profile/upload-photo", {
      method: "POST",
      body: formData,
      headers: {
        // Don't set Content-Type, let browser set it with boundary for FormData
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    })
  }

  async deleteProfilePhoto(): Promise<ApiResponse<any>> {
    return this.request("/profile/delete-photo", { method: "DELETE" })
  }

  // Stats endpoint
  async getUserStats(): Promise<ApiResponse<StudentStatsDto>> {
    return this.request<StudentStatsDto>("/profile/stats", { method: "GET" })
  }

  // Activity endpoint
  async getRecentActivities(limit = 10) {
    return this.request<UserActivityDto[]>(`/profile/recent-activities?limit=${limit}`)
  }
}

export const profileApi = new ProfileApiClient()
