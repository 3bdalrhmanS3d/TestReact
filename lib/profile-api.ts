import type {
  UserProfileDto,
  UserProfileUpdateDto,
  ChangeUserNameDto,
  ChangePasswordDto,
  ChangeUserNameResultDto,
  SecureAuthResponse,
} from "@/types/auth"

// Single local API endpoint
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7217/api"

class ProfileApiClient {
  private baseUrl: string = API_BASE_URL

  private async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<SecureAuthResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`
      console.log(`👤 Profile API Request: ${options.method || "GET"} ${url}`)

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
        signal: AbortSignal.timeout(10000),
      }

      const response = await fetch(url, config)
      console.log(`📡 Profile Response Status: ${response.status}`)

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

      console.log(`📋 Profile Response Data:`, data)

      return {
        ...data,
        statusCode: response.status,
      }
    } catch (err: any) {
      console.error("🚨 Profile API Request Error:", err)

      if (err.name === "AbortError") {
        return {
          success: false,
          message: "انتهت مهلة الطلب.",
          timestamp: new Date().toISOString(),
          requestId: Math.random().toString(36).substr(2, 8),
        }
      }

      return {
        success: false,
        message: "حدث خطأ في الشبكة أثناء تحميل الملف الشخصي.",
        timestamp: new Date().toISOString(),
        requestId: Math.random().toString(36).substr(2, 8),
      }
    }
  }

  // Profile Management
  async getProfile(): Promise<SecureAuthResponse<UserProfileDto>> {
    console.log("👤 Fetching user profile...")
    return this.request<UserProfileDto>("/Profile/get-profile", {
      method: "GET",
    })
  }

  async updateProfile(data: UserProfileUpdateDto): Promise<SecureAuthResponse> {
    console.log("📝 Updating user profile:", data)
    return this.request("/Profile/update-profile", {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  async changeUserName(data: ChangeUserNameDto): Promise<SecureAuthResponse<ChangeUserNameResultDto>> {
    console.log("✏️ Changing username:", data.newFullName)
    return this.request<ChangeUserNameResultDto>("/Profile/change-username", {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  async changePassword(data: ChangePasswordDto): Promise<SecureAuthResponse> {
    console.log("🔒 Changing password...")
    return this.request("/Profile/change-password", {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  async uploadProfilePhoto(file: File): Promise<SecureAuthResponse<{ profilePhoto: string }>> {
    try {
      const url = `${this.baseUrl}/Profile/upload-photo`
      const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null

      const formData = new FormData()
      formData.append("profilePhoto", file)

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: formData,
        signal: AbortSignal.timeout(10000),
      })

      console.log(`📡 Photo Upload Response Status: ${response.status}`)

      let data: SecureAuthResponse<{ profilePhoto: string }>
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

      console.log(`📋 Photo Upload Response:`, data)
      return data
    } catch (err: any) {
      console.error("🚨 Photo Upload Error:", err)
      return {
        success: false,
        message: "حدث خطأ أثناء رفع الصورة",
        timestamp: new Date().toISOString(),
        requestId: Math.random().toString(36).substr(2, 8),
      }
    }
  }

  async deleteProfilePhoto(): Promise<SecureAuthResponse> {
    console.log("🗑️ Deleting profile photo...")
    return this.request("/Profile/delete-photo", {
      method: "DELETE",
    })
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: "GET",
        signal: AbortSignal.timeout(5000),
      })
      return response.ok
    } catch {
      return false
    }
  }
}

export const profileApi = new ProfileApiClient()
