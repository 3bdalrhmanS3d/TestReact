interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  errors?: string[]
}

interface RequestOptions extends RequestInit {
  timeout?: number
}

class ApiClient {
  private baseUrl: string
  private defaultTimeout = 30000

  constructor() {
    // Fix: Ensure proper environment variable handling
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7297/api"

    // Remove trailing slash if present
    if (this.baseUrl.endsWith("/")) {
      this.baseUrl = this.baseUrl.slice(0, -1)
    }
  }

  private async fetchWithTimeout(url: string, options: RequestOptions = {}): Promise<Response> {
    const { timeout = this.defaultTimeout, ...fetchOptions } = options

    // Fix: Proper AbortController usage
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          ...fetchOptions.headers,
        },
      })

      clearTimeout(timeoutId)
      return response
    } catch (error) {
      clearTimeout(timeoutId)

      if (error instanceof Error && error.name === "AbortError") {
        throw new Error("Request timeout")
      }
      throw error
    }
  }

  async request<T = any>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    try {
      // Fix: Proper URL construction
      const url = endpoint.startsWith("http") ? endpoint : `${this.baseUrl}${endpoint}`

      const response = await this.fetchWithTimeout(url, options)

      // Fix: Handle different response types
      let data: any
      const contentType = response.headers.get("content-type")

      if (contentType?.includes("application/json")) {
        data = await response.json()
      } else {
        data = await response.text()
      }

      if (!response.ok) {
        return {
          success: false,
          message: data?.message || `HTTP ${response.status}: ${response.statusText}`,
          errors: data?.errors || [],
        }
      }

      return {
        success: true,
        data,
        message: data?.message || "Success",
      }
    } catch (error) {
      console.error("API Request Error:", error)

      return {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error occurred",
        errors: [],
      }
    }
  }

  // Fix: Proper method implementations
  async get<T = any>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: "GET" })
  }

  async post<T = any>(endpoint: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T = any>(endpoint: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T = any>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: "DELETE" })
  }
}

export const apiClient = new ApiClient()
