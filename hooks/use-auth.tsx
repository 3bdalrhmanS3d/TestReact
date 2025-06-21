"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { authApi } from "@/lib/auth-api"
import { profileApi } from "@/lib/profile-api"
import type {
  SignupRequestDto,
  SigninRequestDto,
  VerifyAccountRequestDto,
  ForgetPasswordRequestDto,
  ResetPasswordRequestDto,
  AuthUser,
} from "@/types/auth"

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  error: string | null
  apiAvailable: boolean

  // Auth methods
  signup: (data: SignupRequestDto) => Promise<{ success: boolean; message?: string }>
  signin: (data: SigninRequestDto) => Promise<{ success: boolean; message?: string }>
  verifyAccount: (data: VerifyAccountRequestDto) => Promise<{ success: boolean; message?: string }>
  resendCode: () => Promise<{ success: boolean; message?: string }>
  forgetPassword: (data: ForgetPasswordRequestDto) => Promise<{ success: boolean; message?: string }>
  resetPassword: (data: ResetPasswordRequestDto) => Promise<{ success: boolean; message?: string }>
  logout: () => Promise<void>

  // Utility methods
  isAuthenticated: boolean
  clearError: () => void
  refreshToken: () => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [apiAvailable, setApiAvailable] = useState(false)

  const isAuthenticated = !!user

  useEffect(() => {
    checkAuth()
  }, [])

  const clearError = () => setError(null)

  const checkAuth = async () => {
    try {
      console.log("🔍 Checking authentication status...")
      setLoading(true)

      // Test API availability first
      const isApiAvailable = await authApi.testConnection()
      setApiAvailable(isApiAvailable)

      if (!isApiAvailable) {
        console.log("⚠️ API not available")
        setError("الخادم غير متاح حالياً")
        setLoading(false)
        return
      }

      // Check for stored tokens
      const accessToken = localStorage.getItem("accessToken")
      const refreshToken = localStorage.getItem("refreshToken")

      if (!accessToken) {
        // Try auto-login from cookie
        console.log("🔐 Attempting auto-login from cookie...")
        const autoLoginResult = await authApi.autoLoginFromCookie()

        if (autoLoginResult.success && autoLoginResult.data) {
          console.log("✅ Auto-login successful")
          const userData: AuthUser = {
            id: autoLoginResult.data.userId,
            userId: autoLoginResult.data.userId,
            email: autoLoginResult.data.emailAddress,
            emailAddress: autoLoginResult.data.emailAddress,
            name: autoLoginResult.data.fullName,
            fullName: autoLoginResult.data.fullName,
            role: autoLoginResult.data.role,
            profilePhoto: "/uploads/profile-pictures/default_user.webp",
          }

          setUser(userData)
          localStorage.setItem("accessToken", autoLoginResult.data.token)
          localStorage.setItem("refreshToken", autoLoginResult.data.refreshToken)
        } else {
          console.log("ℹ️ No valid auto-login session found")
        }
      } else {
        // Validate existing token by getting profile
        console.log("🔄 Validating existing token...")
        const profileResult = await profileApi.getProfile()

        if (profileResult.success && profileResult.data) {
          const userData: AuthUser = {
            id: profileResult.data.id,
            userId: profileResult.data.id,
            email: profileResult.data.emailAddress,
            emailAddress: profileResult.data.emailAddress,
            name: profileResult.data.fullName,
            fullName: profileResult.data.fullName,
            role: profileResult.data.role,
            profilePhoto: profileResult.data.profilePhoto,
          }
          setUser(userData)
        } else {
          // Token invalid, try refresh
          const refreshResult = await refreshTokenInternal()
          if (!refreshResult) {
            // Clear invalid tokens
            localStorage.removeItem("accessToken")
            localStorage.removeItem("refreshToken")
            setUser(null)
          }
        }
      }
    } catch (error) {
      console.error("🚨 Auth check failed:", error)
      setError("فشل في التحقق من حالة تسجيل الدخول")
      setApiAvailable(false)
    } finally {
      setLoading(false)
    }
  }

  const refreshTokenInternal = async (): Promise<boolean> => {
    try {
      const refreshToken = localStorage.getItem("refreshToken")
      if (!refreshToken) return false

      const result = await authApi.refreshToken({ oldRefreshToken: refreshToken })

      if (result.success && result.data) {
        localStorage.setItem("accessToken", result.data.token)
        localStorage.setItem("refreshToken", result.data.refreshToken)

        // Get updated profile
        const profileResult = await profileApi.getProfile()
        if (profileResult.success && profileResult.data) {
          const userData: AuthUser = {
            id: profileResult.data.id,
            userId: profileResult.data.id,
            email: profileResult.data.emailAddress,
            emailAddress: profileResult.data.emailAddress,
            name: profileResult.data.fullName,
            fullName: profileResult.data.fullName,
            role: profileResult.data.role,
            profilePhoto: profileResult.data.profilePhoto,
          }
          setUser(userData)
        }

        return true
      }

      return false
    } catch (error) {
      console.error("Token refresh failed:", error)
      return false
    }
  }

  const signup = async (data: SignupRequestDto) => {
    try {
      clearError()

      if (!apiAvailable) {
        return {
          success: false,
          message: "الخادم غير متاح حالياً. يرجى المحاولة لاحقاً.",
        }
      }

      const result = await authApi.signup(data)

      if (result.success) {
        setApiAvailable(true)
        // Store email for verification
        localStorage.setItem("pendingVerificationEmail", data.emailAddress)
      }

      return {
        success: result.success,
        message: result.message,
      }
    } catch (error) {
      console.error("🚨 Signup error:", error)
      setApiAvailable(false)
      return {
        success: false,
        message: "حدث خطأ أثناء التسجيل",
      }
    }
  }

  const signin = async (data: SigninRequestDto) => {
    try {
      clearError()

      if (!apiAvailable) {
        return {
          success: false,
          message: "الخادم غير متاح حالياً. يرجى المحاولة لاحقاً.",
        }
      }

      const result = await authApi.signin(data)

      if (result.success && result.data) {
        // Get user profile after successful signin
        const profileResult = await profileApi.getProfile()

        if (profileResult.success && profileResult.data) {
          const userData: AuthUser = {
            id: profileResult.data.id,
            userId: profileResult.data.id,
            email: profileResult.data.emailAddress,
            emailAddress: profileResult.data.emailAddress,
            name: profileResult.data.fullName,
            fullName: profileResult.data.fullName,
            role: profileResult.data.role,
            profilePhoto: profileResult.data.profilePhoto,
          }
          setUser(userData)
        } else {
          // Fallback user data from signin response
          const userData: AuthUser = {
            id: result.data.userId,
            userId: result.data.userId,
            email: data.email,
            emailAddress: data.email,
            name: "",
            fullName: "",
            role: result.data.role,
            profilePhoto: "/uploads/profile-pictures/default_user.webp",
          }
          setUser(userData)
        }

        setApiAvailable(true)
        return { success: true }
      }

      return {
        success: false,
        message: result.message || "فشل في تسجيل الدخول",
      }
    } catch (error) {
      console.error("🚨 Signin error:", error)
      setApiAvailable(false)
      return {
        success: false,
        message: "حدث خطأ أثناء تسجيل الدخول",
      }
    }
  }

  const verifyAccount = async (data: VerifyAccountRequestDto) => {
    try {
      clearError()

      if (!apiAvailable) {
        return {
          success: false,
          message: "الخادم غير متاح حالياً. يرجى المحاولة لاحقاً.",
        }
      }

      const result = await authApi.verifyAccount(data)

      if (result.success) {
        setApiAvailable(true)
        // Clear pending email
        localStorage.removeItem("pendingVerificationEmail")
      }

      return {
        success: result.success,
        message: result.message,
      }
    } catch (error) {
      console.error("🚨 Verify account error:", error)
      setApiAvailable(false)
      return {
        success: false,
        message: "حدث خطأ أثناء التحقق",
      }
    }
  }

  const resendCode = async () => {
    try {
      clearError()

      if (!apiAvailable) {
        return {
          success: false,
          message: "الخادم غير متاح حالياً. يرجى المحاولة لاحقاً.",
        }
      }

      const result = await authApi.resendVerificationCode()

      if (result.success) {
        setApiAvailable(true)
      }

      return {
        success: result.success,
        message: result.message,
      }
    } catch (error) {
      console.error("🚨 Resend code error:", error)
      setApiAvailable(false)
      return {
        success: false,
        message: "حدث خطأ أثناء إرسال الرمز",
      }
    }
  }

  const forgetPassword = async (data: ForgetPasswordRequestDto) => {
    try {
      clearError()

      if (!apiAvailable) {
        return {
          success: false,
          message: "الخادم غير متاح حالياً. يرجى المحاولة لاحقاً.",
        }
      }

      const result = await authApi.forgetPassword(data)

      return {
        success: result.success,
        message: result.message,
      }
    } catch (error) {
      console.error("🚨 Forget password error:", error)
      return {
        success: false,
        message: "حدث خطأ أثناء طلب إعادة تعيين كلمة المرور",
      }
    }
  }

  const resetPassword = async (data: ResetPasswordRequestDto) => {
    try {
      clearError()

      if (!apiAvailable) {
        return {
          success: false,
          message: "الخادم غير متاح حالياً. يرجى المحاولة لاحقاً.",
        }
      }

      const result = await authApi.resetPassword(data)

      return {
        success: result.success,
        message: result.message,
      }
    } catch (error) {
      console.error("🚨 Reset password error:", error)
      return {
        success: false,
        message: "حدث خطأ أثناء إعادة تعيين كلمة المرور",
      }
    }
  }

  const logout = async () => {
    try {
      if (apiAvailable) {
        await authApi.logout()
      }
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      setUser(null)
      localStorage.removeItem("accessToken")
      localStorage.removeItem("refreshToken")
      localStorage.removeItem("pendingVerificationEmail")
    }
  }

  const refreshToken = async (): Promise<boolean> => {
    return refreshTokenInternal()
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        apiAvailable,
        signup,
        signin,
        verifyAccount,
        resendCode,
        forgetPassword,
        resetPassword,
        logout,
        isAuthenticated,
        clearError,
        refreshToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
