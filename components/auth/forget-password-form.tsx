"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Mail, ArrowLeft } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import type { ForgetPasswordRequestDto } from "@/types/auth"

export default function ForgetPasswordForm() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const { forgetPassword, apiAvailable } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    if (!email.trim()) {
      setError("البريد الإلكتروني مطلوب")
      setLoading(false)
      return
    }

    const data: ForgetPasswordRequestDto = {
      email: email.trim(),
    }

    const result = await forgetPassword(data)

    if (result.success) {
      setSuccess("تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني")
      // Store email for reset password page
      localStorage.setItem("resetPasswordEmail", email.trim())
    } else {
      setError(result.message || "حدث خطأ أثناء طلب إعادة تعيين كلمة المرور")
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-12 h-12 bg-gradient-to-br from-orange-600 to-red-600 rounded-xl flex items-center justify-center">
            <Mail className="w-6 h-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-gray-900">نسيت كلمة المرور؟</CardTitle>
            <CardDescription className="text-gray-600 mt-2">
              أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة تعيين كلمة المرور
            </CardDescription>
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
              <div className="relative">
                <Mail className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pr-10 h-11 border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                  placeholder="أدخل بريدك الإلكتروني"
                  required
                  dir="ltr"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-medium"
              disabled={loading || !apiAvailable}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  جاري الإرسال...
                </>
              ) : (
                "إرسال رابط إعادة التعيين"
              )}
            </Button>
          </CardContent>

          <CardFooter className="text-center space-y-4">
            <div className="w-full">
              <Link href="/auth/signin">
                <Button variant="ghost" className="w-full text-orange-600 hover:text-orange-800">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  العودة إلى تسجيل الدخول
                </Button>
              </Link>
            </div>
            <p className="text-sm text-gray-600">
              ليس لديك حساب؟{" "}
              <Link href="/auth/signup" className="text-orange-600 hover:text-orange-800 font-medium transition-colors">
                إنشاء حساب جديد
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
