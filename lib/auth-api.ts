import type {
  SignupRequestDto,
  SigninRequestDto,
  VerifyAccountRequestDto,
  ForgetPasswordRequestDto,
  ResetPasswordRequestDto,
  RefreshTokenRequestDto,
  AutoLoginRequestDto,
  SigninResponseDto,
  RefreshTokenResponseDto,
  AutoLoginResponseDto,
  SecureAuthResponse,
} from "@/types/auth"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7217/api"

class AuthApiClient {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<SecureAuthResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        credentials: "include",
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          message: data.message || `HTTP ${response.status}`,
          errorCode: data.errorCode,
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
      console.error("Auth API Error:", error)
      return {
        success: false,
        message: "Network error occurred",
        timestamp: new Date().toISOString(),
        requestId: Math.random().toString(36).substr(2, 9),
      }
    }
  }

  async signup(data: SignupRequestDto): Promise<SecureAuthResponse> {
    return this.request("/Auth/signup", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async verifyAccount(data: VerifyAccountRequestDto): Promise<SecureAuthResponse> {
    return this.request("/Auth/verify-account", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async resendVerificationCode(): Promise<SecureAuthResponse> {
    return this.request("/Auth/resend-verification-code", {
      method: "POST",
    })
  }

  async signin(data: SigninRequestDto): Promise<SecureAuthResponse<SigninResponseDto>> {
    return this.request<SigninResponseDto>("/Auth/signin", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async refreshToken(data: RefreshTokenRequestDto): Promise<SecureAuthResponse<RefreshTokenResponseDto>> {
    return this.request<RefreshTokenResponseDto>("/Auth/refresh-token", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async autoLogin(data: AutoLoginRequestDto): Promise<SecureAuthResponse<AutoLoginResponseDto>> {
    return this.request<AutoLoginResponseDto>("/Auth/auto-login", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async autoLoginFromCookie(): Promise<SecureAuthResponse<AutoLoginResponseDto>> {
    return this.request<AutoLoginResponseDto>("/Auth/auto-login-from-cookie", {
      method: "POST",
    })
  }

  async forgetPassword(data: ForgetPasswordRequestDto): Promise<SecureAuthResponse> {
    return this.request("/Auth/forget-password", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async resetPassword(data: ResetPasswordRequestDto): Promise<SecureAuthResponse> {
    return this.request("/Auth/reset-password", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async logout(): Promise<SecureAuthResponse> {
    const token = localStorage.getItem("accessToken")
    return this.request("/Auth/logout", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  }

  // Health check
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL.replace("/api", "")}/health`, {
        method: "GET",
        signal: AbortSignal.timeout(5000),
      })
      return response.ok
    } catch {
      return false
    }
  }
}

export const authApi = new AuthApiClient()
