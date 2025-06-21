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
} from "@/types/auth"

// API endpoints configuration
const API_ENDPOINTS = ["http://localhost:5268/api", "https://localhost:7217/api"]

let CURRENT_API_BASE_URL = API_ENDPOINTS[0]

interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
  errors?: any
  timestamp: string
  requestId: string
}

class ProfileApiClient {
  private async findWorkingEndpoint(): Promise<string | null> {
    for (const endpoint of API_ENDPOINTS) {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 3000)

        const res = await fetch(`${endpoint.replace("/api", "")}/health`, { signal: controller.signal })
        clearTimeout(timeoutId)

        if (res.ok) {
          CURRENT_API_BASE_URL = endpoint
          return endpoint
        }
      } catch (err) {
        // Continue to next endpoint
      }
    }
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
        message: "الخادم غير متاح حالياً",
        timestamp: new Date().toISOString(),
        requestId: Math.random().toString(36).substr(2, 8),
      }
    }

    const url = `${base}${endpoint}`

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

      let data: any
      const ct = res.headers.get("content-type") || ""
      if (ct.includes("application/json")) {
        data = await res.json()
      } else {
        const txt = await res.text()
        data = { message: txt || res.statusText }
      }

      if (!res.ok) {
        return {
          success: false,
          message: data.message ?? res.statusText,
          errors: data.errors,
          timestamp: new Date().toISOString(),
          requestId: Math.random().toString(36).substr(2, 8),
        }
      }

      return {
        success: true,
        data: data.data ?? data,
        message: data.message ?? "Success",
        timestamp: new Date().toISOString(),
        requestId: Math.random().toString(36).substr(2, 8),
      }
    } catch (err: any) {
      return {
        success: false,
        message: "حدث خطأ في الشبكة",
        timestamp: new Date().toISOString(),
        requestId: Math.random().toString(36).substr(2, 8),
      }
    }
  }

  // Profile endpoints
  async getDashboard() {
    return this.request("/profile/dashboard")
  }

  async getProfile() {
    return this.request<UserProfileDto>("/profile")
  }

  async updateProfile(data: UserProfileUpdateDto) {
    return this.request("/profile/update", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async changeUserName(data: ChangeUserNameDto) {
    return this.request("/profile/change-name", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async changePassword(data: ChangePasswordDto) {
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
  async getMyCourses() {
    return this.request<MyCourseDto[]>("/profile/my-courses")
  }

  async getFavoriteCourses() {
    return this.request<CourseDto[]>("/profile/favorite-courses")
  }

  async addToFavorites(courseId: number) {
    return this.request(`/profile/favorites/${courseId}`, {
      method: "POST",
    })
  }

  async removeFromFavorites(courseId: number) {
    return this.request(`/profile/favorites/${courseId}`, {
      method: "DELETE",
    })
  }

  // Photo endpoints
  async uploadProfilePhoto(file: File) {
    const formData = new FormData()
    formData.append("file", file)

    const base = await this.findWorkingEndpoint()
    if (!base) {
      return {
        success: false,
        message: "الخادم غير متاح حالياً",
        timestamp: new Date().toISOString(),
        requestId: Math.random().toString(36).substr(2, 8),
      }
    }

    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null

    try {
      const res = await fetch(`${base}/profile/upload-photo`, {
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
        data: res.ok ? data.data : undefined,
        message: data.message,
        timestamp: new Date().toISOString(),
        requestId: Math.random().toString(36).substr(2, 8),
      }
    } catch (err) {
      return {
        success: false,
        message: "حدث خطأ أثناء رفع الصورة",
        timestamp: new Date().toISOString(),
        requestId: Math.random().toString(36).substr(2, 8),
      }
    }
  }

  async deleteProfilePhoto() {
    return this.request("/profile/delete-photo", {
      method: "DELETE",
    })
  }

  // Stats endpoint
  async getUserStats() {
    return this.request<StudentStatsDto>("/profile/stats")
  }

  // Activity endpoint
  async getRecentActivities(limit = 10) {
    return this.request<UserActivityDto[]>(`/profile/recent-activities?limit=${limit}`)
  }
}

export const profileApi = new ProfileApiClient()
