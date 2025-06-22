"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { apiClient } from "@/lib/api-client"

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
}

export interface ProfileCompletionError {
  requiredFields: {
    BirthDate?: string
    Education?: string
    Nationality?: string
  }
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
    fullName: string
    emailAddress: string
    password: string
    confirmPassword: string
  }) => Promise<{ success: boolean; message?: string }>
  logout: () => Promise<void>
  refreshToken: () => Promise<boolean>
  loadProfile: () => Promise<void>
  updateProfile: (data: {
    birthDate: string
    edu: string
    national: string
  }) => Promise<{ success: boolean; message?: string }>
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
  const router = useRouter()

  const checkApiHealth = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/health`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      })
      setApiAvailable(response.ok)
      return response.ok
    } catch {
      setApiAvailable(false)
      return false
    }
  }

  const loadProfile = async () => {
    try {
      const token = localStorage.getItem("accessToken")
      if (!token) {
        setProfileIncomplete(false)
        setProfileCompletionData(null)
        return
      }

      const response = await apiClient.get("/profile")

      if (response.success && response.data) {
        setProfile(response.data)
        setProfileIncomplete(false)
        setProfileCompletionData(null)
        setError(null)
      }
    } catch (err: any) {
      console.error("Profile loading error:", err)

      if (err.status === 404) {
        // User not found - logout and redirect
        await logout()
        return
      }

      if (err.status === 400 && err.data?.errors) {
        // Profile incomplete
        setProfileIncomplete(true)
        setProfileCompletionData(err.data.errors)
        setError(null)
        return
      }

      // Other errors
      setError(err.message || "فشل في تحميل الملف الشخصي")
      setProfileIncomplete(false)
      setProfileCompletionData(null)
    }
  }

  const updateProfile = async (data: { birthDate: string; edu: string; national: string }) => {
    try {
      const response = await apiClient.post("/profile/update", data)

      if (response.success) {
        // Reload profile after successful update
        await loadProfile()
        return { success: true, message: "تم تحديث الملف الشخصي بنجاح" }
      }

      return { success: false, message: response.message || "فشل في تحديث الملف الشخصي" }
    } catch (err: any) {
      console.error("Profile update error:", err)
      return { success: false, message: err.message || "حدث خطأ أثناء تحديث الملف الشخصي" }
    }
  }

  const signin = async (email: string, password: string, rememberMe = false) => {
    try {
      setLoading(true)
      setError(null)

      const response = await apiClient.post("/auth/signin", {
        emailAddress: email,
        password,
        rememberMe,
      })

      if (response.success && response.data) {
        const { user: userData, accessToken, refreshToken: refreshTokenValue } = response.data

        localStorage.setItem("accessToken", accessToken)
        if (refreshTokenValue) {
          localStorage.setItem("refreshToken", refreshTokenValue)
        }

        setUser(userData)

        // Load profile after successful signin
        await loadProfile()

        return { success: true }
      }

      return { success: false, message: response.message || "فشل في تسجيل الدخول" }
    } catch (err: any) {
      console.error("Signin error:", err)
      return { success: false, message: err.message || "حدث خطأ أثناء تسجيل الدخول" }
    } finally {
      setLoading(false)
    }
  }

  const signup = async (data: {
    fullName: string
    emailAddress: string
    password: string
    confirmPassword: string
  }) => {
    try {
      setLoading(true)
      setError(null)

      const response = await apiClient.pos("/auth/signup", data)

      if (response.success) {
        return { success: true, message: "تم إنشاء الحساب بنجاح. يرجى التحقق من بريدك الإلكتروني." }
      }

      return { success: false, message: response.message || "فشل في إنشاء الحساب" }
    } catch (err: any) {
      console.error("Signup error:", err)
      return { success: false, message: err.message || "حدث خطأ أثناء إنشاء الحساب" }
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken")
      if (refreshToken) {
        await apiClient.post("/auth/logout", { refreshToken })
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
      router.push("/auth/signin")
    }
  }

  const refreshToken = async (): Promise<boolean> => {
    try {
      const refreshTokenValue = localStorage.getItem("refreshToken")
      if (!refreshTokenValue) return false

      const response = await apiClient.post("/auth/refresh-token", {
        refreshToken: refreshTokenValue,
      })

      if (response.success && response.data) {
        const { accessToken, refreshToken: newRefreshToken } = response.data
        localStorage.setItem("accessToken", accessToken)
        if (newRefreshToken) {
          localStorage.setItem("refreshToken", newRefreshToken)
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
        setLoading(true)

        // Check API health
        const isApiHealthy = await checkApiHealth()
        if (!isApiHealthy) {
          setError("الخادم غير متاح حالياً")
          return
        }

        const token = localStorage.getItem("accessToken")
        if (!token) {
          return
        }

        // Try to refresh token first
        const refreshed = await refreshToken()
        if (!refreshed) {
          localStorage.removeItem("accessToken")
          localStorage.removeItem("refreshToken")
          return
        }

        // Load profile
        await loadProfile()

        // Set user as authenticated (we'll get user data from profile)
        setUser({ id: 0, fullName: "", emailAddress: "", role: "", createdAt: "" })
      } catch (err) {
        console.error("Auth initialization error:", err)
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
