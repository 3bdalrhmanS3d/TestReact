import type {
  NotificationDto,
  NotificationFilterDto,
  NotificationPagedResponseDto,
  NotificationStatsDto,
  MarkNotificationsReadDto,
  NotificationPreferencesDto,
  RealTimeNotificationDto,
} from "@/types/notifications"
import type { SecureAuthResponse } from "@/types/auth"

// API Endpoints with environment-based configuration
const API_ENDPOINTS = [
  process.env.NEXT_PUBLIC_API_URL,
  "http://localhost:5268/api",
  "https://localhost:7217/api", // الـ port الصحيح
].filter(Boolean) as string[]

class NotificationApiClient {
  private baseUrl: string | null = null
  private eventSource: EventSource | null = null

  constructor() {
    this.findWorkingEndpoint()
  }

  private async findWorkingEndpoint(): Promise<string | null> {
    if (this.baseUrl) return this.baseUrl

    for (const endpoint of API_ENDPOINTS) {
      try {
        const testUrl = `${endpoint}/Notifications/health-check`
        const response = await fetch(testUrl, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          signal: AbortSignal.timeout(5000),
        })

        if (response.ok || response.status === 404) {
          console.log(`✅ Notifications API endpoint found: ${endpoint}`)
          this.baseUrl = endpoint
          return endpoint
        }
      } catch (err) {
        console.log(`❌ Failed to connect to Notifications API: ${endpoint}`)
      }
    }

    console.error("🚨 No working Notifications API endpoints found")
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
          message: `لا يمكن الاتصال بخادم الإشعارات. الخوادم المفحوصة:\n${API_ENDPOINTS.join("\n")}`,
          timestamp: new Date().toISOString(),
          requestId: Math.random().toString(36).substr(2, 8),
        }
      }

      const url = `${baseUrl}${endpoint}`
      console.log(`🔔 Notifications API Request: ${options.method || "GET"} ${url}`)

      // Get token from localStorage
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
      console.log(`📡 Notifications Response Status: ${response.status}`)

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

      console.log(`📋 Notifications Response Data:`, data)

      return {
        ...data,
        statusCode: response.status,
      }
    } catch (err: any) {
      console.error("🚨 Notifications API Request Error:", err)

      if (err.name === "AbortError") {
        return {
          success: false,
          message: "انتهت مهلة الطلب. يرجى المحاولة مرة أخرى.",
          timestamp: new Date().toISOString(),
          requestId: Math.random().toString(36).substr(2, 8),
        }
      }

      return {
        success: false,
        message: "حدث خطأ في الشبكة أثناء تحميل الإشعارات.",
        timestamp: new Date().toISOString(),
        requestId: Math.random().toString(36).substr(2, 8),
      }
    }
  }

  // Get paginated notifications
  async getNotifications(filter: NotificationFilterDto): Promise<SecureAuthResponse<NotificationPagedResponseDto>> {
    console.log("🔔 Fetching notifications with filter:", filter)
    
    const params = new URLSearchParams()
    params.append("pageNumber", filter.pageNumber.toString())
    params.append("pageSize", filter.pageSize.toString())
    
    if (filter.isRead !== undefined) params.append("isRead", filter.isRead.toString())
    if (filter.type) params.append("type", filter.type)
    if (filter.priority) params.append("priority", filter.priority)
    if (filter.fromDate) params.append("fromDate", filter.fromDate)
    if (filter.toDate) params.append("toDate", filter.toDate)
    if (filter.courseId) params.append("courseId", filter.courseId.toString())

    return this.request<NotificationPagedResponseDto>(`/Notifications/get-notifications?${params}`, {
      method: "GET",
    })
  }

  // Get notification statistics
  async getStats(): Promise<SecureAuthResponse<NotificationStatsDto>> {
    console.log("📊 Fetching notification stats...")
    return this.request<NotificationStatsDto>("/Notifications/stats", {
      method: "GET",
    })
  }

  // Mark notifications as read
  async markAsRead(data: MarkNotificationsReadDto): Promise<SecureAuthResponse> {
    console.log("✅ Marking notifications as read:", data.notificationIds)
    return this.request("/Notifications/mark-read", {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  // Mark all notifications as read
  async markAllAsRead(): Promise<SecureAuthResponse> {
    console.log("✅ Marking all notifications as read...")
    return this.request("/Notifications/mark-all-read", {
      method: "PUT",
    })
  }

  // Delete notification
  async deleteNotification(notificationId: number): Promise<SecureAuthResponse> {
    console.log("🗑️ Deleting notification:", notificationId)
    return this.request(`/Notifications/delete/${notificationId}`, {
      method: "DELETE",
    })
  }

  // Delete all notifications
  async deleteAllNotifications(): Promise<SecureAuthResponse> {
    console.log("🗑️ Deleting all notifications...")
    return this.request("/Notifications/delete-all", {
      method: "DELETE",
    })
  }

  // Get notification preferences
  async getPreferences(): Promise<SecureAuthResponse<NotificationPreferencesDto>> {
    console.log("⚙️ Fetching notification preferences...")
    return this.request<NotificationPreferencesDto>("/Notifications/preferences", {
      method: "GET",
    })
  }

  // Update notification preferences
  async updatePreferences(preferences: Partial<NotificationPreferencesDto>): Promise<SecureAuthResponse> {
    console.log("⚙️ Updating notification preferences:", preferences)
    return this.request("/Notifications/preferences", {
      method: "PUT",
      body: JSON.stringify(preferences),
    })
  }

  // Real-time notifications using Server-Sent Events
  connectToRealTimeNotifications(
    onNotification: (notification: RealTimeNotificationDto) => void,
    onError?: (error: Event) => void,
    onOpen?: (event: Event) => void
  ): () => void {
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null
    
    if (!token) {
      console.error("🚨 No token available for real-time notifications")
      return () => {}
    }

    this.findWorkingEndpoint().then((baseUrl) => {
      if (!baseUrl) {
        console.error("🚨 No working endpoint for real-time notifications")
        return
      }

      const url = `${baseUrl}/Notifications/real-time?token=${encodeURIComponent(token)}`
      
      try {
        this.eventSource = new EventSource(url)
        
        this.eventSource.onopen = (event) => {
          console.log("✅ Real-time notifications connected")
          onOpen?.(event)
        }
        
        this.eventSource.onmessage = (event) => {
          try {
            const data: RealTimeNotificationDto = JSON.parse(event.data)
            console.log("🔔 Real-time notification received:", data)
            onNotification(data)
          } catch (err) {
            console.error("🚨 Failed to parse real-time notification:", err)
          }
        }
        
        this.eventSource.onerror = (event) => {
          console.error("🚨 Real-time notifications error:", event)
          onError?.(event)
        }
      } catch (err) {
        console.error("🚨 Failed to establish real-time notifications:", err)
      }
    })

    // Return disconnect function
    return () => {
      if (this.eventSource) {
        console.log("🔌 Disconnecting real-time notifications...")
        this.eventSource.close()
        this.eventSource = null
      }
    }
  }

  // Disconnect real-time notifications
  disconnectRealTime(): void {
    if (this.eventSource) {
      console.log("🔌 Disconnecting real-time notifications...")
      this.eventSource.close()
      this.eventSource = null
    }
  }

  async testConnection(): Promise<boolean> {
    const endpoint = await this.findWorkingEndpoint()
    return endpoint !== null
  }
}

export const notificationApi = new NotificationApiClient()
