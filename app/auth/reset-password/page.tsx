"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Eye, EyeOff, Lock, CheckCircle, XCircle } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import type { ResetPasswordRequestDto } from "@/types/auth"

export default function ResetPasswordPage() {
  const [formData, setFormData] = useState({
    email: "",
    code: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [passwordValidation, setPasswordValidation] = useState({
    minLength: false,
    hasUpper: false,
    hasLower: false,
    hasNumber: false,
    hasSpecial: false,
  })

  const { resetPassword, apiAvailable } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Get email and code from URL params or localStorage
    const emailFromUrl = searchParams.get("email")
    const codeFromUrl = searchParams.get("code")
    const emailFromStorage = localStorage.getItem("resetPasswordEmail")

    setFormData((prev) => ({
      ...prev,
      email: emailFromUrl || emailFromStorage || "",
      code: codeFromUrl || "",
    }))
  }, [searchParams])

  // Validate password in real-time
  useEffect(() => {
    const password = formData.newPassword
    setPasswordValidation({
      minLength: password.length >= 8,
      hasUpper: /[A-Z]/.test(password),
      hasLower: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    })
  }, [formData.newPassword])

  const isPasswordValid = () => {
    return Object.values(passwordValidation).every(Boolean)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    // Validation
    if (!formData.email.trim()) {
      setError("البريد الإلكتروني مطلوب")
      setLoading(false)
      return
    }

    if (!formData.code.trim()) {
      setError("رمز التحقق مطلوب")
      setLoading(false)
      return
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError("كلمات المرور غير متطابقة")
      setLoading(false)
      return
    }

    if (!isPasswordValid()) {
      setError("كلمة المرور لا تلبي جميع المتطلبات")
      setLoading(false)
      return
    }

    const data: ResetPasswordRequestDto = {
      email: formData.email.trim(),
      code: formData.code.trim(),
      newPassword: formData.newPassword,
    }

    const result = await resetPassword(data)

    if (result.success) {
      setSuccess("تم إعادة تعيين كلمة المرور بنجاح")
      // Clear stored email
      localStorage.removeItem("resetPasswordEmail")
      setTimeout(() => {
        router.push("/auth/signin")
      }, 2000)
    } else {
      setError(result.message || "فشل في إعادة تعيين كلمة المرور")
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-12 h-12 bg-gradient-to-br from-indigo-600 to-cyan-600 rounded-xl flex items-center justify-center">
            <Lock className="w-6 h-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-gray-900">إعادة تعيين كلمة المرور</CardTitle>
            <CardDescription className="text-gray-600 mt-2">أدخل رمز التحقق وكلمة المرور الجديدة</CardDescription>
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

            {!apiAvailable && (
              <Alert variant="destructive">
                <AlertDescription>⚠️ لا يمكن الاتصال بالخادم. تحقق من أن الخادم يعمل.</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                البريد الإلكتروني
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="h-11 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="أدخل بريدك الإلكتروني"
                required
                dir="ltr"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="code" className="text-sm font-medium text-gray-700">
                رمز التحقق
              </Label>
              <Input
                id="code"
                name="code"
                type="text"
                value={formData.code}
                onChange={handleChange}
                className="h-11 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="أدخل رمز التحقق"
                required
                dir="ltr"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-sm font-medium text-gray-700">
                كلمة المرور الجديدة
              </Label>
              <div className="relative">
                <Lock className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="newPassword"
                  name="newPassword"
                  type={showPassword ? "text" : "password"}
                  value={formData.newPassword}
                  onChange={handleChange}
                  className="pr-10 pl-10 h-11 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="أدخل كلمة المرور الجديدة"
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
              {formData.newPassword && (
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
                  className="pr-10 pl-10 h-11 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
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
              {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
                <p className="text-xs text-red-600 flex items-center">
                  <XCircle className="h-3 w-3 mr-1" />
                  كلمات المرور غير متطابقة
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white font-medium"
              disabled={loading || !apiAvailable}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  جاري إعادة التعيين...
                </>
              ) : (
                "إعادة تعيين كلمة المرور"
              )}
            </Button>
          </CardContent>

          <CardFooter className="text-center">
            <p className="text-sm text-gray-600">
              تذكرت كلمة المرور؟{" "}
              <Link href="/auth/signin" className="text-indigo-600 hover:text-indigo-800 font-medium transition-colors">
                تسجيل الدخول
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
