"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Loader2, CheckCircle, XCircle } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import type { SignupRequestDto } from "@/types/auth"

export default function SignupForm() {
  const router = useRouter()
  const { signup, loading } = useAuth()

  const [formData, setFormData] = useState<SignupRequestDto>({
    firstName: "",
    lastName: "",
    emailAddress: "",
    password: "",
    userConfPassword: "",
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Password validation
  const passwordValidation = {
    minLength: formData.password.length >= 8,
    hasUppercase: /[A-Z]/.test(formData.password),
    hasLowercase: /[a-z]/.test(formData.password),
    hasNumber: /\d/.test(formData.password),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password),
  }

  const isPasswordValid = Object.values(passwordValidation).every(Boolean)
  const passwordsMatch = formData.password === formData.userConfPassword && formData.userConfPassword.length > 0

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setMessage(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isPasswordValid) {
      setMessage({ type: "error", text: "كلمة المرور لا تلبي المتطلبات المطلوبة" })
      return
    }

    if (!passwordsMatch) {
      setMessage({ type: "error", text: "كلمات المرور غير متطابقة" })
      return
    }

    setIsSubmitting(true)

    try {
      const result = await signup(formData)

      if (result.success) {
        setMessage({ type: "success", text: result.message || "تم إرسال رمز التحقق إلى بريدك الإلكتروني" })
        setTimeout(() => {
          router.push("/auth/verify-account")
        }, 2000)
      } else {
        setMessage({ type: "error", text: result.message || "فشل في التسجيل" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "حدث خطأ غير متوقع" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFormValid =
    formData.firstName.trim() &&
    formData.lastName.trim() &&
    formData.emailAddress.trim() &&
    isPasswordValid &&
    passwordsMatch

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            إنشاء حساب جديد
          </CardTitle>
          <CardDescription className="text-gray-600">أدخل بياناتك لإنشاء حساب في LearnQuest</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {message && (
            <Alert className={message.type === "success" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
              <AlertDescription className={message.type === "success" ? "text-green-800" : "text-red-800"}>
                {message.text}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">الاسم الأول</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                  placeholder="أدخل اسمك الأول"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">الاسم الأخير</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                  placeholder="أدخل اسمك الأخير"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="emailAddress">البريد الإلكتروني</Label>
              <Input
                id="emailAddress"
                name="emailAddress"
                type="email"
                value={formData.emailAddress}
                onChange={handleInputChange}
                required
                className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                placeholder="example@domain.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 pr-10"
                  placeholder="أدخل كلمة مرور قوية"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute left-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>

              {/* Password Requirements */}
              {formData.password && (
                <div className="space-y-1 text-xs">
                  <div
                    className={`flex items-center gap-1 ${passwordValidation.minLength ? "text-green-600" : "text-red-600"}`}
                  >
                    {passwordValidation.minLength ? (
                      <CheckCircle className="h-3 w-3" />
                    ) : (
                      <XCircle className="h-3 w-3" />
                    )}
                    8 أحرف على الأقل
                  </div>
                  <div
                    className={`flex items-center gap-1 ${passwordValidation.hasUppercase ? "text-green-600" : "text-red-600"}`}
                  >
                    {passwordValidation.hasUppercase ? (
                      <CheckCircle className="h-3 w-3" />
                    ) : (
                      <XCircle className="h-3 w-3" />
                    )}
                    حرف كبير واحد على الأقل
                  </div>
                  <div
                    className={`flex items-center gap-1 ${passwordValidation.hasLowercase ? "text-green-600" : "text-red-600"}`}
                  >
                    {passwordValidation.hasLowercase ? (
                      <CheckCircle className="h-3 w-3" />
                    ) : (
                      <XCircle className="h-3 w-3" />
                    )}
                    حرف صغير واحد على الأقل
                  </div>
                  <div
                    className={`flex items-center gap-1 ${passwordValidation.hasNumber ? "text-green-600" : "text-red-600"}`}
                  >
                    {passwordValidation.hasNumber ? (
                      <CheckCircle className="h-3 w-3" />
                    ) : (
                      <XCircle className="h-3 w-3" />
                    )}
                    رقم واحد على الأقل
                  </div>
                  <div
                    className={`flex items-center gap-1 ${passwordValidation.hasSpecial ? "text-green-600" : "text-red-600"}`}
                  >
                    {passwordValidation.hasSpecial ? (
                      <CheckCircle className="h-3 w-3" />
                    ) : (
                      <XCircle className="h-3 w-3" />
                    )}
                    رمز خاص واحد على الأقل
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="userConfPassword">تأكيد كلمة المرور</Label>
              <div className="relative">
                <Input
                  id="userConfPassword"
                  name="userConfPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.userConfPassword}
                  onChange={handleInputChange}
                  required
                  className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 pr-10"
                  placeholder="أعد إدخال كلمة المرور"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute left-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>

              {formData.userConfPassword && (
                <div
                  className={`flex items-center gap-1 text-xs ${passwordsMatch ? "text-green-600" : "text-red-600"}`}
                >
                  {passwordsMatch ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                  {passwordsMatch ? "كلمات المرور متطابقة" : "كلمات المرور غير متطابقة"}
                </div>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
              disabled={!isFormValid || isSubmitting || loading}
            >
              {isSubmitting || loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  جاري التسجيل...
                </>
              ) : (
                "إنشاء حساب"
              )}
            </Button>
          </form>

          <div className="text-center text-sm text-gray-600">
            لديك حساب بالفعل؟{" "}
            <Button
              variant="link"
              className="p-0 h-auto font-semibold text-blue-600 hover:text-blue-700"
              onClick={() => router.push("/auth/signin")}
            >
              تسجيل الدخول
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
