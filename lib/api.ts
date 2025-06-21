// Updated API client to match backend endpoints
import { profileApi } from "./profile-api"

// API endpoints configuration
const API_ENDPOINTS = ["http://localhost:5268/api", "https://localhost:7217/api"]

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
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }

  // Find working endpoint
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

  // Main request method
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    // Ensure we have a working endpoint
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
        const msg = data.message ?? data.Message ?? res.statusText ?? `خطأ في الخادم (${res.status})`
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

  // Dashboard Endpoints - Updated to match backend
  async getUserStats() {
    // Use profile API for user stats
    return profileApi.getUserStats()
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
    >(`/courses/search${params}`, { method: "GET" })
  }

  // Course endpoints
  async getCourses() {
    return this.request("/courses", { method: "GET" })
  }

  async getCourse(courseId: number) {
    return this.request(`/courses/${courseId}`, { method: "GET" })
  }

  // User endpoints
  async getProfile() {
    return profileApi.getProfile()
  }

  async updateProfile(data: any) {
    return profileApi.updateProfile(data)
  }
}

export const apiClient = new ApiClient()
