"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { apiClient } from "@/lib/api"

interface User {
  userId: number
  fullName: string
  emailAddress: string
  role: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  apiAvailable: boolean
  login: (email: string, password: string, rememberMe: boolean) => Promise<{ success: boolean; message?: string }>
  logout: () => Promise<void>
  signup: (fullName: string, email: string, password: string) => Promise<{ success: boolean; message?: string }>
  verifyAccount: (code: string) => Promise<{ success: boolean; message?: string }>
  resendCode: () => Promise<{ success: boolean; message?: string }>
  isAuthenticated: boolean
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
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

      // First check if we have stored user data
      if (typeof window !== "undefined") {
        const storedUser = localStorage.getItem("user")
        const accessToken = localStorage.getItem("accessToken")

        if (storedUser && accessToken) {
          console.log("✅ Found stored user data")
          setUser(JSON.parse(storedUser))
          setApiAvailable(true)
          setLoading(false)
          return
        }
      }

      // Test API availability first
      console.log("🌐 Testing API connection...")
      const isApiAvailable = await apiClient.testConnection()
      setApiAvailable(isApiAvailable)

      if (!isApiAvailable) {
        console.log("⚠️ API not available, skipping auto-login")
        setError("الخادم غير متاح حالياً")
        setLoading(false)
        return
      }

      // Try auto-login from cookie if API is available
      console.log("🔐 Attempting auto-login...")
      const response = await apiClient.autoLoginFromCookie()

      if (response.success && response.data) {
        console.log("✅ Auto-login successful")
        const userData = {
          userId: response.data.userId,
          fullName: response.data.fullName,
          emailAddress: response.data.emailAddress,
          role: response.data.role,
        }
        setUser(userData)
        localStorage.setItem("user", JSON.stringify(userData))
        localStorage.setItem("accessToken", response.data.accessToken)
        localStorage.setItem("refreshToken", response.data.refreshToken)
      } else {
        console.log("ℹ️ No valid auto-login session found")
      }
    } catch (error) {
      console.error("🚨 Auth check failed:", error)
      setError("فشل في التحقق من حالة تسجيل الدخول")
      setApiAvailable(false)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string, rememberMe: boolean) => {
    try {
      clearError()

      if (!apiAvailable) {
        return {
          success: false,
          message: "الخادم غير متاح حالياً. يرجى المحاولة لاحقاً.",
        }
      }

      const response = await apiClient.signin({ email, password, rememberMe })

      if (response.success && response.data) {
        const userData = {
          userId: response.data.userId,
          fullName: response.data.fullName,
          emailAddress: response.data.emailAddress,
          role: response.data.role,
        }
        setUser(userData)
        setApiAvailable(true)
        return { success: true }
      }

      return {
        success: false,
        message: response.message || "فشل في تسجيل الدخول",
      }
    } catch (error) {
      console.error("🚨 Login error:", error)
      setApiAvailable(false)
      return {
        success: false,
        message: "حدث خطأ أثناء تسجيل الدخول",
      }
    }
  }

  const logout = async () => {
    try {
      if (apiAvailable) {
        await apiClient.logout()
      }
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      setUser(null)
      if (typeof window !== "undefined") {
        localStorage.removeItem("accessToken")
        localStorage.removeItem("refreshToken")
        localStorage.removeItem("user")
      }
    }
  }

  const signup = async (fullName: string, emailAddress: string, password: string) => {
    console.log("🔐 Auth: Starting signup process for:", emailAddress)

    try {
      clearError()

      if (!apiAvailable) {
        return {
          success: false,
          message: "الخادم غير متاح حالياً. يرجى المحاولة لاحقاً.",
        }
      }

      const response = await apiClient.signup({ fullName, emailAddress, password })

      console.log("📡 Auth: Signup response:", {
        success: response.success,
        message: response.message,
        errorCode: response.errorCode,
      })

      if (response.success) {
        setApiAvailable(true)
      }

      return {
        success: response.success,
        message: response.message || (response.success ? "تم إرسال رمز التحقق" : "فشل في التسجيل"),
      }
    } catch (error) {
      console.error("🚨 Auth: Signup error:", error)
      setApiAvailable(false)
      return {
        success: false,
        message: "حدث خطأ أثناء التسجيل",
      }
    }
  }

  const verifyAccount = async (verificationCode: string) => {
    try {
      clearError()

      if (!apiAvailable) {
        return {
          success: false,
          message: "الخادم غير متاح حالياً. يرجى المحاولة لاحقاً.",
        }
      }

      const response = await apiClient.verifyAccount({ verificationCode })

      if (response.success) {
        setApiAvailable(true)
      }

      return {
        success: response.success,
        message: response.message || (response.success ? "تم تفعيل الحساب بنجاح" : "رمز التحقق غير صحيح"),
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

      const response = await apiClient.resendVerificationCode()

      if (response.success) {
        setApiAvailable(true)
      }

      return {
        success: response.success,
        message: response.message || (response.success ? "تم إرسال رمز جديد" : "فشل في إرسال الرمز"),
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

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        apiAvailable,
        login,
        logout,
        signup,
        verifyAccount,
        resendCode,
        isAuthenticated,
        clearError,
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
