import type {
  NotificationDto,
  CreateNotificationDto,
  BulkCreateNotificationDto,
  MarkNotificationsReadDto,
  NotificationFilterDto,
  NotificationStatsDto,
  NotificationPagedResponseDto,
  NotificationPreferencesDto,
} from "@/types/notifications"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7217/api"

interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
  errors?: any
  timestamp: string
  requestId: string
}

class NotificationApiClient {
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
      console.error("Notification API Error:", error)
      return {
        success: false,
        message: "Network error occurred",
        timestamp: new Date().toISOString(),
        requestId: Math.random().toString(36).substr(2, 9),
      }
    }
  }

  // Core Operations
  async getNotifications(
    filter: Partial<NotificationFilterDto> = {},
  ): Promise<ApiResponse<NotificationPagedResponseDto>> {
    const params = new URLSearchParams()
    Object.entries(filter).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString())
      }
    })

    return this.request<NotificationPagedResponseDto>(`/notification?${params.toString()}`)
  }

  async getRecentNotifications(limit = 5): Promise<ApiResponse<NotificationDto[]>> {
    return this.request<NotificationDto[]>(`/notification/recent?limit=${limit}`)
  }

  async getUnreadCount(): Promise<ApiResponse<number>> {
    return this.request<number>("/notification/unread-count")
  }

  async getNotificationStats(): Promise<ApiResponse<NotificationStatsDto>> {
    return this.request<NotificationStatsDto>("/notification/stats")
  }

  // Actions
  async markNotificationsAsRead(data: MarkNotificationsReadDto): Promise<ApiResponse> {
    return this.request("/notification/mark-read", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async markAllAsRead(): Promise<ApiResponse> {
    return this.request("/notification/mark-all-read", {
      method: "POST",
    })
  }

  async deleteNotification(notificationId: number): Promise<ApiResponse> {
    return this.request(`/notification/${notificationId}`, {
      method: "DELETE",
    })
  }

  async deleteNotifications(notificationIds: number[]): Promise<ApiResponse> {
    return this.request("/notification/bulk", {
      method: "DELETE",
      body: JSON.stringify(notificationIds),
    })
  }

  // Admin/Instructor Operations
  async createNotification(data: CreateNotificationDto): Promise<ApiResponse<string>> {
    return this.request<string>("/notification", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async createBulkNotification(data: BulkCreateNotificationDto): Promise<ApiResponse<number[]>> {
    return this.request<number[]>("/notification/bulk", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  // Specialized Notifications
  async createCourseNotification(
    userId: number,
    courseId: number,
    title: string,
    message: string,
    type = "CourseUpdate",
    priority = "Normal",
  ): Promise<ApiResponse> {
    const params = new URLSearchParams({
      userId: userId.toString(),
      courseId: courseId.toString(),
      title,
      message,
      type,
      priority,
    })

    return this.request(`/notification/course?${params.toString()}`, {
      method: "POST",
    })
  }

  async createAchievementNotification(
    userId: number,
    achievementId: number,
    achievementName: string,
    message?: string,
  ): Promise<ApiResponse> {
    const params = new URLSearchParams({
      userId: userId.toString(),
      achievementId: achievementId.toString(),
      achievementName,
    })

    if (message) {
      params.append("message", message)
    }

    return this.request(`/notification/achievement?${params.toString()}`, {
      method: "POST",
    })
  }

  async createReminderNotification(
    userId: number,
    title: string,
    message: string,
    courseId?: number,
    priority = "Normal",
  ): Promise<ApiResponse> {
    const params = new URLSearchParams({
      userId: userId.toString(),
      title,
      message,
      priority,
    })

    if (courseId) {
      params.append("courseId", courseId.toString())
    }

    return this.request(`/notification/reminder?${params.toString()}`, {
      method: "POST",
    })
  }

  // Admin Only
  async sendSystemNotification(
    title: string,
    message: string,
    type = "System",
    priority = "High",
  ): Promise<ApiResponse> {
    const params = new URLSearchParams({
      title,
      message,
      type,
      priority,
    })

    return this.request(`/notification/system?${params.toString()}`, {
      method: "POST",
    })
  }

  async cleanupOldNotifications(olderThanDays = 30): Promise<ApiResponse<number>> {
    return this.request<number>(`/notification/cleanup?olderThanDays=${olderThanDays}`, {
      method: "DELETE",
    })
  }

  async getNotificationAnalytics(startDate: string, endDate: string): Promise<ApiResponse<any>> {
    const params = new URLSearchParams({
      startDate,
      endDate,
    })

    return this.request<any>(`/notification/analytics?${params.toString()}`)
  }

  // Preferences
  async getNotificationPreferences(): Promise<ApiResponse<NotificationPreferencesDto>> {
    return this.request<NotificationPreferencesDto>("/notification/preferences")
  }

  async updateNotificationPreferences(preferences: NotificationPreferencesDto): Promise<ApiResponse> {
    return this.request("/notification/preferences", {
      method: "POST",
      body: JSON.stringify(preferences),
    })
  }
}

export const notificationApi = new NotificationApiClient()
