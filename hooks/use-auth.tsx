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
  UserProfileDto,
  UserProfileUpdateDto,
  ProfileCompletionError,
} from "@/types/auth"

interface AuthContextType {
  user: AuthUser | null
  profile: UserProfileDto | null
  loading: boolean
  error: string | null
  apiAvailable: boolean
  profileIncomplete: boolean
  profileCompletionData: ProfileCompletionError | null

  // Auth methods
  signup: (data: SignupRequestDto) => Promise<{ success: boolean; message?: string }>
  signin: (data: SigninRequestDto) => Promise<{ success: boolean; message?: string }>
  verifyAccount: (data: VerifyAccountRequestDto) => Promise<{ success: boolean; message?: string }>
  resendCode: () => Promise<{ success: boolean; message?: string }>
  forgetPassword: (data: ForgetPasswordRequestDto) => Promise<{ success: boolean; message?: string }>
  resetPassword: (data: ResetPasswordRequestDto) => Promise<{ success: boolean; message?: string }>
  logout: () => Promise<void>

  // Profile methods
  updateProfile: (data: UserProfileUpdateDto) => Promise<{ success: boolean; message?: string }>
  refreshProfile: () => Promise<void>

  // Utility methods
  isAuthenticated: boolean
  clearError: () => void
  refreshToken: () => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [profile, setProfile] = useState<UserProfileDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [apiAvailable, setApiAvailable] = useState(false)
  const [profileIncomplete, setProfileIncomplete] = useState(false)
  const [profileCompletionData, setProfileCompletionData] = useState<ProfileCompletionError | null>(null)

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

          // Load profile after auto-login
          await loadProfile()
        } else {
          console.log("ℹ️ No valid auto-login session found")
        }
      } else {
        // Load profile with existing token
        await loadProfile()
      }
    } catch (error) {
      console.error("🚨 Auth check failed:", error)
      setError("فشل في التحقق من حالة تسجيل الدخول")
      setApiAvailable(false)
    } finally {
      setLoading(false)
    }
  }

  const loadProfile = async () => {
    try {
      console.log("📋 Loading user profile...")
      const profileResult = await profileApi.getProfile()

      if (profileResult.success && profileResult.data) {
        // Profile loaded successfully
        console.log("✅ Profile loaded successfully")
        setProfile(profileResult.data)
        setProfileIncomplete(false)
        setProfileCompletionData(null)

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
      } else if (profileResult.statusCode === 404) {
        // User not found - redirect to signin
        console.log("❌ User not found - clearing session")
        await logout()
      } else if (profileResult.statusCode === 400 && profileResult.errors) {
        // Profile incomplete
        console.log("⚠️ Profile incomplete")
        setProfileIncomplete(true)
        setProfileCompletionData(profileResult.errors as ProfileCompletionError)

        // Set basic user data from token
        const userData: AuthUser = {
          id: 0, // Will be updated after profile completion
          userId: 0,
          email: "",
          emailAddress: "",
          name: "",
          fullName: "",
          role: "RegularUser",
          profilePhoto: "/uploads/profile-pictures/default_user.webp",
        }
        setUser(userData)
      } else {
        // Other errors - try token refresh
        const refreshResult = await refreshTokenInternal()
        if (!refreshResult) {
          // Clear invalid tokens
          localStorage.removeItem("accessToken")
          localStorage.removeItem("refreshToken")
          setUser(null)
          setProfile(null)
        }
      }
    } catch (error) {
      console.error("🚨 Profile loading failed:", error)
      setError("فشل في تحميل الملف الشخصي")
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

        // Reload profile after token refresh
        await loadProfile()
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
        setApiAvailable(true)

        // Load profile after successful signin
        await loadProfile()
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

  const updateProfile = async (data: UserProfileUpdateDto) => {
    try {
      clearError()

      if (!apiAvailable) {
        return {
          success: false,
          message: "الخادم غير متاح حالياً. يرجى المحاولة لاحقاً.",
        }
      }

      const result = await profileApi.updateProfile(data)

      if (result.success) {
        // Reload profile after successful update
        await loadProfile()
        return { success: true, message: result.message }
      }

      return {
        success: false,
        message: result.message || "فشل في تحديث الملف الشخصي",
      }
    } catch (error) {
      console.error("🚨 Update profile error:", error)
      return {
        success: false,
        message: "حدث خطأ أثناء تحديث الملف الشخصي",
      }
    }
  }

  const refreshProfile = async () => {
    await loadProfile()
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
      setProfile(null)
      setProfileIncomplete(false)
      setProfileCompletionData(null)
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
        profile,
        loading,
        error,
        apiAvailable,
        profileIncomplete,
        profileCompletionData,
        signup,
        signin,
        verifyAccount,
        resendCode,
        forgetPassword,
        resetPassword,
        updateProfile,
        refreshProfile,
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
