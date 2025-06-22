"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { profileApi } from "@/lib/profile-api"
import { authApi } from "@/lib/auth-api"
import type {
  AuthUser,
  UserProgressDto,
  UserProfileUpdateDto,
  ChangeUserNameDto,
  ChangePasswordDto,
  ProfileCompletionError,
} from "@/types/auth"

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
  updateProfile: (data: UserProfileUpdateDto) => Promise<{ success: boolean; message?: string }>
  changeUserName: (data: ChangeUserNameDto) => Promise<{ success: boolean; message?: string }>
  changePassword: (data: ChangePasswordDto) => Promise<{ success: boolean; message?: string }>
  uploadProfilePhoto: (file: File) => Promise<{ success: boolean; message?: string; profilePhoto?: string }>
  deleteProfilePhoto: () => Promise<{ success: boolean; message?: string }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [profile, setProfile] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [profileIncomplete, setProfileIncomplete] = useState(false)
  const [profileCompletionData, setProfileCompletionData] = useState<ProfileCompletionError | null>(null)
  const [apiAvailable, setApiAvailable] = useState(true)
  const [isProfileComplete, setIsProfileComplete] = useState(false)
  const [requiredFields, setRequiredFields] = useState<Record<string, string> | null>(null)
  const router = useRouter()

  const isAuthenticated = !!user

  // Check API availability
  useEffect(() => {
    const checkApiAvailability = async () => {
      try {
        const authAvailable = await authApi.testConnection()
        const profileAvailable = await profileApi.testConnection()
        setApiAvailable(authAvailable || profileAvailable)
      } catch (err) {
        console.error("🚨 API availability check failed:", err)
        setApiAvailable(false)
      }
    }

    checkApiAvailability()
  }, [])

  // Auto login check on app start
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setLoading(true)
        
        // Check for existing token
        const accessToken = localStorage.getItem("accessToken")
        const refreshTokenValue = localStorage.getItem("refreshToken")
        
        if (accessToken) {
          console.log("🔑 Found access token, loading profile...")
          await loadProfile()
        } else if (refreshTokenValue) {
          console.log("🔄 Found refresh token, attempting refresh...")
          const success = await refreshToken()
          if (success) {
            await loadProfile()
          }
        } else {
          // Try auto login from cookie
          console.log("🍪 Attempting auto login from cookie...")
          const autoLoginResponse = await authApi.autoLoginFromCookie()
          if (autoLoginResponse.success && autoLoginResponse.data) {
            localStorage.setItem("accessToken", autoLoginResponse.data.token)
            localStorage.setItem("refreshToken", autoLoginResponse.data.refreshToken)
            await loadProfile()
          } else {
            console.log("❌ No valid authentication found")
            setLoading(false)
          }
        }
      } catch (err) {
        console.error("🚨 Auth initialization error:", err)
        setLoading(false)
      }
    }

    if (apiAvailable) {
      initializeAuth()
    } else {
      setLoading(false)
    }
  }, [apiAvailable])

  const loadProfile = async () => {
    try {
      console.log("👤 Loading user profile...")
      const response = await profileApi.getProfile()
      console.log("📋 Profile response:", response)

      if (response.success && response.data) {
        console.log("✅ Profile loaded successfully")
        const authUser: AuthUser = {
          userId: response.data.id,
          email: response.data.emailAddress,
          // Add other AuthUser properties here, mapping from response.data as needed
          ...(response.data as any)
        }
        setProfile(authUser)
        setUser(authUser)
        setIsProfileComplete(response.data.isProfileComplete)
        setRequiredFields(response.data.requiredFields || null)
        
        if (!response.data.isProfileComplete) {
          setProfileIncomplete(true)
          setProfileCompletionData({
            requiredFields: response.data.requiredFields || {},
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
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (data: UserProfileUpdateDto) => {
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

  const changeUserName = async (data: ChangeUserNameDto) => {
    try {
      console.log("✏️ Changing username:", data.newFullName)
      const response = await profileApi.changeUserName(data)
      console.log("📝 Username change response:", response)

      if (response.success) {
        console.log("✅ Username changed successfully")
        
        // If token refresh is required, reload the page
        if (response.data?.requiresTokenRefresh) {
          window.location.reload()
          return { success: true, message: "تم تغيير الاسم بنجاح. سيتم تحديث الصفحة..." }
        }
        
        await loadProfile()
        return { success: true, message: response.message || "تم تغيير الاسم بنجاح" }
      }

      console.log("❌ Username change failed:", response.message)
      return { success: false, message: response.message || "فشل في تغيير الاسم" }
    } catch (err: any) {
      console.error("🚨 Username change error:", err)
      return { success: false, message: "حدث خطأ أثناء تغيير الاسم" }
    }
  }

  const changePassword = async (data: ChangePasswordDto) => {
    try {
      console.log("🔒 Changing password...")
      const response = await profileApi.changePassword(data)
      console.log("📝 Password change response:", response)

      if (response.success) {
        console.log("✅ Password changed successfully")
        return { success: true, message: response.message || "تم تغيير كلمة المرور بنجاح" }
      }

      console.log("❌ Password change failed:", response.message)
      return { success: false, message: response.message || "فشل في تغيير كلمة المرور" }
    } catch (err: any) {
      console.error("🚨 Password change error:", err)
      return { success: false, message: "حدث خطأ أثناء تغيير كلمة المرور" }
    }
  }

  const uploadProfilePhoto = async (file: File) => {
    try {
      console.log("📸 Uploading profile photo...")
      const response = await profileApi.uploadProfilePhoto(file)
      console.log("📝 Photo upload response:", response)

      if (response.success) {
        console.log("✅ Photo uploaded successfully")
        await loadProfile()
        return { 
          success: true, 
          message: response.message || "تم رفع الصورة بنجاح",
          profilePhoto: response.data?.profilePhoto
        }
      }

      console.log("❌ Photo upload failed:", response.message)
      return { success: false, message: response.message || "فشل في رفع الصورة" }
    } catch (err: any) {
      console.error("🚨 Photo upload error:", err)
      return { success: false, message: "حدث خطأ أثناء رفع الصورة" }
    }
  }

  const deleteProfilePhoto = async () => {
    try {
      console.log("🗑️ Deleting profile photo...")
      const response = await profileApi.deleteProfilePhoto()
      console.log("📝 Photo delete response:", response)

      if (response.success) {
        console.log("✅ Photo deleted successfully")
        await loadProfile()
        return { success: true, message: response.message || "تم حذف الصورة بنجاح" }
      }

      console.log("❌ Photo delete failed:", response.message)
      return { success: false, message: response.message || "فشل في حذف الصورة" }
    } catch (err: any) {
      console.error("🚨 Photo delete error:", err)
      return { success: false, message: "حدث خطأ أثناء حذف الصورة" }
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
        if (response.data.autoLoginToken) {
          localStorage.setItem("autoLoginToken", response.data.autoLoginToken)
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

  const refreshToken = async (): Promise<boolean> => {
    try {
      const oldRefreshToken = localStorage.getItem("refreshToken")
      if (!oldRefreshToken) {
        console.log("❌ No refresh token available")
        return false
      }

      console.log("🔄 Refreshing token...")
      const response = await authApi.refreshToken({ oldRefreshToken })
      console.log("🔑 Token refresh response:", response)

      if (response.success && response.data) {
        console.log("✅ Token refreshed successfully")
        localStorage.setItem("accessToken", response.data.token)
        localStorage.setItem("refreshToken", response.data.refreshToken)
        return true
      }

      console.log("❌ Token refresh failed:", response.message)
      await logout()
      return false
    } catch (err: any) {
      console.error("🚨 Token refresh error:", err)
      await logout()
      return false
    }
  }

  const logout = async () => {
    try {
      console.log("🚪 Logging out...")
      setLoading(true)
      
      // Call logout API
      await authApi.logout()
      
      // Clear local state
      setUser(null)
      setProfile(null)
      setError(null)
      setProfileIncomplete(false)
      setProfileCompletionData(null)
      setIsProfileComplete(false)
      setRequiredFields(null)
      
      // Clear localStorage
      localStorage.removeItem("accessToken")
      localStorage.removeItem("refreshToken")
      localStorage.removeItem("autoLoginToken")
      
      console.log("✅ Logout successful")
      router.push("/auth/signin")
    } catch (err: any) {
      console.error("🚨 Logout error:", err)
      // Clear state anyway
      setUser(null)
      setProfile(null)
      router.push("/auth/signin")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAuthenticated,
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
        changeUserName,
        changePassword,
        uploadProfilePhoto,
        deleteProfilePhoto,
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
