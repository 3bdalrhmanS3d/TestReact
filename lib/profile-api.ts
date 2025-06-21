import type {
  UserProfileDto,
  UserProfileUpdateDto,
  ChangeUserNameDto,
  ChangePasswordDto,
  ChangeUserNameResultDto,
  PaymentRequestDto,
  MyCourseDto,
  CourseDto,
  StudentStatsDto,
  UserActivityDto,
} from "@/types/auth"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7217/api"

interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
  errors?: any
  timestamp: string
  requestId: string
}

class ProfileApiClient {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem("accessToken")
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getAuthHeaders(),
          ...options.headers,
        },
        credentials: "include",
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          message: data.message || `HTTP ${response.status}`,
          errors: data.errors,
          timestamp: new Date().toISOString(),
          requestId: data.requestId || Math.random().toString(36).substr(2, 9),
        }
      }

      return {
        success: true,
        message: data.message || "Success",
        data: data.data || data,
        timestamp: new Date().toISOString(),
        requestId: data.requestId || Math.random().toString(36).substr(2, 9),
      }
    } catch (error) {
      console.error("Profile API Error:", error)
      return {
        success: false,
        message: "Network error occurred",
        timestamp: new Date().toISOString(),
        requestId: Math.random().toString(36).substr(2, 9),
      }
    }
  }

  // Profile Management
  async getProfile(): Promise<ApiResponse<UserProfileDto>> {
    return this.request<UserProfileDto>("/profile")
  }

  async updateProfile(data: UserProfileUpdateDto): Promise<ApiResponse> {
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

  async changePassword(data: ChangePasswordDto): Promise<ApiResponse> {
    return this.request("/profile/change-password", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  // Photo Management
  async uploadProfilePhoto(file: File): Promise<ApiResponse> {
    const formData = new FormData()
    formData.append("file", file)

    return this.request("/profile/upload-photo", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
      body: formData,
    })
  }

  async deleteProfilePhoto(): Promise<ApiResponse> {
    return this.request("/profile/delete-photo", {
      method: "DELETE",
    })
  }

  // Payment Management
  async payForCourse(data: PaymentRequestDto): Promise<ApiResponse> {
    return this.request("/profile/pay-course", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async confirmPayment(paymentId: number): Promise<ApiResponse> {
    return this.request(`/profile/confirm-payment/${paymentId}`, {
      method: "POST",
    })
  }

  // Course Management
  async getMyCourses(): Promise<ApiResponse<{ count: number; courses: MyCourseDto[] }>> {
    return this.request<{ count: number; courses: MyCourseDto[] }>("/profile/my-courses")
  }

  async getFavoriteCourses(): Promise<ApiResponse<{ count: number; favorites: CourseDto[] }>> {
    return this.request<{ count: number; favorites: CourseDto[] }>("/profile/favorite-courses")
  }

  async addToFavorites(courseId: number): Promise<ApiResponse> {
    return this.request(`/profile/favorites/${courseId}`, {
      method: "POST",
    })
  }

  async removeFromFavorites(courseId: number): Promise<ApiResponse> {
    return this.request(`/profile/favorites/${courseId}`, {
      method: "DELETE",
    })
  }

  // Statistics
  async getUserStats(): Promise<ApiResponse<StudentStatsDto>> {
    return this.request<StudentStatsDto>("/profile/stats")
  }

  // Dashboard
  async getDashboard(): Promise<ApiResponse> {
    return this.request("/profile/dashboard")
  }

  // Activities
  async getRecentActivities(limit = 10): Promise<ApiResponse<UserActivityDto[]>> {
    return this.request<UserActivityDto[]>(`/profile/activities?limit=${limit}`)
  }
}

export const profileApi = new ProfileApiClient()
