"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { profileApi } from "@/lib/profile-api"
import { authApi } from "@/lib/auth-api"

export interface AuthUser {
  id: number
  fullName: string
  emailAddress: string
  role: string
  profilePhoto?: string
  createdAt: string
  birthDate?: string
  edu?: string
  national?: string
  progress?: UserProgressDto[]
}

export interface UserProgressDto {
  courseId: number
  courseName: string
  currentLevelId: number
  currentSectionId: number
  lastUpdated: string
}

export interface ProfileCompletionError {
  requiredFields: Record<string, string>
  profileCompletionUrl: string
}

interface AuthContextType {
  user: AuthUser | null
  profile: AuthUser | null
  isAuthenticated: boolean
  loading: boolean
  profileIncomplete: boolean
  profileCompletionData: ProfileCompletionError | null
  error: string | null
  apiAvailable: boolean
  signin: (email: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; message?: string }>
  signup: (data: {
    firstName: string
    lastName: string
    emailAddress: string
    password: string
    userConfPassword: string
  }) => Promise<{ success: boolean; message?: string }>
  logout: () => Promise<void>
  refreshToken: () => Promise<boolean>
  loadProfile: () => Promise<void>
  updateProfile: (data: {
    birthDate: string
    edu: string
    national: string
  }) => Promise<{ success: boolean; message?: string }>
  clearError: () => void
  isProfileComplete: boolean
  requiredFields: Record<string, string> | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [profile, setProfile] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [profileIncomplete, setProfileIncomplete] = useState(false)
  const [profileCompletionData, setProfileCompletionData] = useState<ProfileCompletionError | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [apiAvailable, setApiAvailable] = useState(true)
  const [isProfileComplete, setIsProfileComplete] = useState<boolean>(false)
  const [requiredFields, setRequiredFields] = useState<Record<string, string> | null>(null)
  const router = useRouter()

  const clearError = () => setError(null)

  const checkApiHealth = async () => {
    try {
      const isAvailable = await authApi.testConnection()
      setApiAvailable(isAvailable)
      return isAvailable
    } catch {
      setApiAvailable(false)
      return false
    }
  }

  const loadProfile = async () => {
    try {
      console.log("🔄 Loading user profile...")
      const token = localStorage.getItem("accessToken")
      if (!token) {
        console.log("❌ No access token found")
        setProfileIncomplete(false)
        setProfileCompletionData(null)
        setIsProfileComplete(false)
        setRequiredFields(null)
        return
      }

      const response = await profileApi.getProfile()
      console.log("📋 Profile API Response:", response)

      if (response.success && response.data) {
        const data = response.data
        console.log("✅ Profile loaded successfully")
        setProfile(data)
        setUser(data)
        setIsProfileComplete(data.isProfileComplete)
        setRequiredFields(data.requiredFields || null)
        if (!data.isProfileComplete) {
          setProfileIncomplete(true)
          setProfileCompletionData({
            requiredFields: data.requiredFields || {},
            profileCompletionUrl: "/api/profile/update"
          })
        } else {
          setProfileIncomplete(false)
          setProfileCompletionData(null)
        }
        setError(null)
      } else if (response.statusCode === 404) {
        console.log("❌ User not found - logging out")
        await logout()
        return
      } else {
        console.log("❌ Profile loading failed:", response.message)
        setError(response.message || "فشل في تحميل الملف الشخصي")
        setProfileIncomplete(false)
        setProfileCompletionData(null)
        setIsProfileComplete(false)
        setRequiredFields(null)
      }
    } catch (err: any) {
      console.error("🚨 Profile loading error:", err)
      setError("حدث خطأ أثناء تحميل الملف الشخصي")
      setProfileIncomplete(false)
      setProfileCompletionData(null)
      setIsProfileComplete(false)
      setRequiredFields(null)
    }
  }

  const updateProfile = async (data: { birthDate: string; edu: string; national: string }) => {
    try {
      console.log("🔄 Updating profile with data:", data)
      const response = await profileApi.updateProfile(data)
      console.log("📝 Profile update response:", response)

      if (response.success) {
        console.log("✅ Profile updated successfully")
        await loadProfile()
        return { success: true, message: response.message || "تم تحديث الملف الشخصي بنجاح" }
      }

      console.log("❌ Profile update failed:", response.message)
      return { success: false, message: response.message || "فشل في تحديث الملف الشخصي" }
    } catch (err: any) {
      console.error("🚨 Profile update error:", err)
      return { success: false, message: "حدث خطأ أثناء تحديث الملف الشخصي" }
    }
  }

  const signin = async (email: string, password: string, rememberMe = false) => {
    try {
      console.log("🔐 Signing in user:", email)
      setLoading(true)
      setError(null)

      const response = await authApi.signin({ email, password, rememberMe })
      console.log("🔑 Signin response:", response)

      if (response.success && response.data) {
        console.log("✅ Signin successful")
        localStorage.setItem("accessToken", response.data.token)
        if (response.data.refreshToken) {
          localStorage.setItem("refreshToken", response.data.refreshToken)
        }
        await loadProfile()
        return { success: true }
      }

      console.log("❌ Signin failed:", response.message)
      return { success: false, message: response.message || "فشل في تسجيل الدخول" }
    } catch (err: any) {
      console.error("🚨 Signin error:", err)
      return { success: false, message: "حدث خطأ أثناء تسجيل الدخول" }
    } finally {
      setLoading(false)
    }
  }

  const signup = async (data: {
    firstName: string
    lastName: string
    emailAddress: string
    password: string
    userConfPassword: string
  }) => {
    try {
      console.log("📝 Signing up user:", data.emailAddress)
      setLoading(true)
      setError(null)

      const response = await authApi.signup(data)
      console.log("📋 Signup response:", response)

      if (response.success) {
        console.log("✅ Signup successful")
        return { success: true, message: response.message || "تم إنشاء الحساب بنجاح. يرجى التحقق من بريدك الإلكتروني." }
      }

      console.log("❌ Signup failed:", response.message)
      return { success: false, message: response.message || "فشل في إنشاء الحساب" }
    } catch (err: any) {
      console.error("🚨 Signup error:", err)
      return { success: false, message: "حدث خطأ أثناء إنشاء الحساب" }
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      console.log("🚪 Logging out user")
      const refreshToken = localStorage.getItem("refreshToken")
      if (refreshToken && apiAvailable) {
        await authApi.logout()
      }
    } catch (err) {
      console.error("Logout error:", err)
    } finally {
      localStorage.removeItem("accessToken")
      localStorage.removeItem("refreshToken")
      setUser(null)
      setProfile(null)
      setProfileIncomplete(false)
      setProfileCompletionData(null)
      setError(null)
      setIsProfileComplete(false)
      setRequiredFields(null)
      router.push("/auth/signin")
    }
  }

  const refreshToken = async (): Promise<boolean> => {
    try {
      const refreshTokenValue = localStorage.getItem("refreshToken")
      if (!refreshTokenValue) return false

      const response = await authApi.refreshToken({ oldRefreshToken: refreshTokenValue })
      if (response.success && response.data) {
        localStorage.setItem("accessToken", response.data.token)
        if (response.data.refreshToken) {
          localStorage.setItem("refreshToken", response.data.refreshToken)
        }
        return true
      }

      return false
    } catch (err) {
      console.error("Token refresh error:", err)
      return false
    }
  }

  useEffect(() => {
    const initAuth = async () => {
      try {
        console.log("🚀 Initializing authentication...")
        setLoading(true)

        const isApiHealthy = await checkApiHealth()
        if (!isApiHealthy) {
          console.log("❌ API not healthy")
          setError("الخادم غير متاح حالياً")
          return
        }

        const token = localStorage.getItem("accessToken")
        if (!token) {
          console.log("ℹ️ No token found, user not authenticated")
          return
        }

        const refreshed = await refreshToken()
        if (!refreshed) {
          console.log("❌ Token refresh failed, clearing tokens")
          localStorage.removeItem("accessToken")
          localStorage.removeItem("refreshToken")
          return
        }

        await loadProfile()
      } catch (err) {
        console.error("🚨 Auth initialization error:", err)
        setError("حدث خطأ أثناء تهيئة المصادقة")
      } finally {
        setLoading(false)
      }
    }

    initAuth()
  }, [])

  const value: AuthContextType = {
    user,
    profile,
    isAuthenticated: !!user,
    loading,
    profileIncomplete,
    profileCompletionData,
    error,
    apiAvailable,
    signin,
    signup,
    logout,
    refreshToken,
    loadProfile,
    updateProfile,
    clearError,
    isProfileComplete,
    requiredFields
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
