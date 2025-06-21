"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Eye, EyeOff, Mail, Lock, User, CheckCircle, XCircle } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { apiClient } from "@/lib/api"

export default function SignupForm() {
  const [formData, setFormData] = useState({
    fullName: "",
    emailAddress: "",
    password: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [connectionStatus, setConnectionStatus] = useState<"checking" | "connected" | "disconnected">("checking")
  const [passwordValidation, setPasswordValidation] = useState({
    minLength: false,
    hasUpper: false,
    hasLower: false,
    hasNumber: false,
    hasSpecial: false,
  })

  const { signup } = useAuth()
  const router = useRouter()

  // Test API connection on component mount
  useEffect(() => {
    testApiConnection()
  }, [])

  // Validate password in real-time
  useEffect(() => {
    const password = formData.password
    setPasswordValidation({
      minLength: password.length >= 8,
      hasUpper: /[A-Z]/.test(password),
      hasLower: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    })
  }, [formData.password])

  const testApiConnection = async () => {
    try {
      const isConnected = await apiClient.testConnection()
      setConnectionStatus(isConnected ? "connected" : "disconnected")
    } catch {
      setConnectionStatus("disconnected")
    }
  }

  const isPasswordValid = () => {
    return Object.values(passwordValidation).every(Boolean)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    console.log("📝 Starting signup process...")

    // Test connection first
    if (connectionStatus === "disconnected") {
      setError("لا يمكن الاتصال بالخادم. تحقق من أن الخادم يعمل.")
      setLoading(false)
      return
    }

    // Validation
    if (!formData.fullName.trim()) {
      setError("الاسم الكامل مطلوب")
      setLoading(false)
      return
    }

    if (!formData.emailAddress.trim()) {
      setError("البريد الإلكتروني مطلوب")
      setLoading(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError("كلمات المرور غير متطابقة")
      setLoading(false)
      return
    }

    if (!isPasswordValid()) {
      setError("كلمة المرور لا تلبي جميع المتطلبات")
      setLoading(false)
      return
    }

    console.log("📝 Submitting signup form with data:", {
      fullName: formData.fullName,
      emailAddress: formData.emailAddress,
      passwordLength: formData.password.length,
    })

    try {
      const result = await signup(formData.fullName, formData.emailAddress, formData.password)

      console.log("📡 Signup result:", result)

      if (result.success) {
        setSuccess(result.message || "تم إرسال رمز التحقق إلى بريدك الإلكتروني")
        // Store email for verification page
        localStorage.setItem("pendingVerificationEmail", formData.emailAddress)
        setTimeout(() => {
          router.push("/auth/verify-account")
        }, 2000)
      } else {
        setError(result.message || "فشل في إنشاء الحساب")
      }
    } catch (error) {
      console.error("🚨 Signup error:", error)
      setError("حدث خطأ غير متوقع أثناء التسجيل")
    }

    setLoading(false)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const ValidationIcon = ({ isValid }: { isValid: boolean }) =>
    isValid ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Connection Status */}
        {connectionStatus === "checking" && (
          <Alert>
            <AlertDescription className="flex items-center">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              جاري فحص الاتصال بالخادم...
            </AlertDescription>
          </Alert>
        )}

        {connectionStatus === "disconnected" && (
          <Alert variant="destructive">
            <AlertDescription>
              ⚠️ لا يمكن الاتصال بالخادم. تأكد من تشغيل الخادم على:{" "}
              <code className="bg-red-100 px-1 rounded text-xs">
                {process.env.NEXT_PUBLIC_API_URL || "https://localhost:7001/api"}
              </code>
            </AlertDescription>
          </Alert>
        )}

        <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-12 h-12 bg-gradient-to-br from-green-600 to-blue-600 rounded-xl flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900">إنشاء حساب جديد</CardTitle>
              <CardDescription className="text-gray-600 mt-2">أدخل بياناتك لإنشاء حساب جديد</CardDescription>
            </div>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="border-green-200 bg-green-50 text-green-800">
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                  الاسم الكامل
                </Label>
                <div className="relative">
                  <User className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="fullName"
                    name="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="pr-10 h-11 border-gray-200 focus:border-green-500 focus:ring-green-500"
                    placeholder="أدخل اسمك الكامل"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="emailAddress" className="text-sm font-medium text-gray-700">
                  البريد الإلكتروني
                </Label>
                <div className="relative">
                  <Mail className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="emailAddress"
                    name="emailAddress"
                    type="email"
                    value={formData.emailAddress}
                    onChange={handleChange}
                    className="pr-10 h-11 border-gray-200 focus:border-green-500 focus:ring-green-500"
                    placeholder="أدخل بريدك الإلكتروني"
                    required
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  كلمة المرور
                </Label>
                <div className="relative">
                  <Lock className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    className="pr-10 pl-10 h-11 border-gray-200 focus:border-green-500 focus:ring-green-500"
                    placeholder="أدخل كلمة المرور"
                    required
                    dir="ltr"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {/* Password Requirements */}
                {formData.password && (
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs font-medium text-gray-700 mb-2">متطلبات كلمة المرور:</p>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <ValidationIcon isValid={passwordValidation.minLength} />
                        <span className="text-xs text-gray-600">8 أحرف على الأقل</span>
                      </div>
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <ValidationIcon isValid={passwordValidation.hasUpper} />
                        <span className="text-xs text-gray-600">حرف كبير واحد على الأقل</span>
                      </div>
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <ValidationIcon isValid={passwordValidation.hasLower} />
                        <span className="text-xs text-gray-600">حرف صغير واحد على الأقل</span>
                      </div>
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <ValidationIcon isValid={passwordValidation.hasNumber} />
                        <span className="text-xs text-gray-600">رقم واحد على الأقل</span>
                      </div>
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <ValidationIcon isValid={passwordValidation.hasSpecial} />
                        <span className="text-xs text-gray-600">رمز خاص واحد على الأقل</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                  تأكيد كلمة المرور
                </Label>
                <div className="relative">
                  <Lock className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="pr-10 pl-10 h-11 border-gray-200 focus:border-green-500 focus:ring-green-500"
                    placeholder="أعد إدخال كلمة المرور"
                    required
                    dir="ltr"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute left-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="text-xs text-red-600 flex items-center">
                    <XCircle className="h-3 w-3 mr-1" />
                    كلمات المرور غير متطابقة
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-medium"
                disabled={loading || connectionStatus === "disconnected"}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    جاري إنشاء الحساب...
                  </>
                ) : (
                  "إنشاء حساب"
                )}
              </Button>
            </CardContent>

            <CardFooter className="text-center">
              <p className="text-sm text-gray-600">
                لديك حساب بالفعل؟{" "}
                <Link href="/auth/signin" className="text-green-600 hover:text-green-800 font-medium transition-colors">
                  تسجيل الدخول
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
