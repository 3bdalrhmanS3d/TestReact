"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Mail, RefreshCw } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import type { VerifyAccountRequestDto } from "@/types/auth"

export default function VerifyAccountForm() {
  const router = useRouter()
  const { verifyAccount, resendCode, loading } = useAuth()

  const [formData, setFormData] = useState<VerifyAccountRequestDto>({
    verificationCode: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [pendingEmail, setPendingEmail] = useState<string>("")
  const [resendCooldown, setResendCooldown] = useState(0)

  useEffect(() => {
    // Get pending email from localStorage
    const email = localStorage.getItem("pendingVerificationEmail")
    if (email) {
      setPendingEmail(email)
    } else {
      // If no pending email, redirect to signup
      router.push("/auth/signup")
    }
  }, [router])

  useEffect(() => {
    // Cooldown timer
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    // Only allow numbers and limit to 6 digits
    const numericValue = value.replace(/\D/g, "").slice(0, 6)
    setFormData((prev) => ({ ...prev, [name]: numericValue }))
    setMessage(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.verificationCode.length !== 6) {
      setMessage({ type: "error", text: "يجب أن يكون رمز التحقق مكوناً من 6 أرقام" })
      return
    }

    setIsSubmitting(true)

    try {
      const result = await verifyAccount(formData)

      if (result.success) {
        setMessage({ type: "success", text: result.message || "تم تفعيل الحساب بنجاح" })
        setTimeout(() => {
          router.push("/auth/signin")
        }, 2000)
      } else {
        setMessage({ type: "error", text: result.message || "رمز التحقق غير صحيح" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "حدث خطأ غير متوقع" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResendCode = async () => {
    if (resendCooldown > 0) return

    setIsResending(true)

    try {
      const result = await resendCode()

      if (result.success) {
        setMessage({ type: "success", text: result.message || "تم إرسال رمز جديد" })
        setResendCooldown(60) // 60 seconds cooldown
      } else {
        setMessage({ type: "error", text: result.message || "فشل في إرسال الرمز" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "حدث خطأ أثناء إرسال الرمز" })
    } finally {
      setIsResending(false)
    }
  }

  const isFormValid = formData.verificationCode.length === 6

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-4">
            <Mail className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            تفعيل الحساب
          </CardTitle>
          <CardDescription className="text-gray-600">أدخل رمز التحقق المرسل إلى بريدك الإلكتروني</CardDescription>
          {pendingEmail && <p className="text-sm text-blue-600 font-medium">{pendingEmail}</p>}
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
            <div className="space-y-2">
              <Label htmlFor="verificationCode">رمز التحقق</Label>
              <Input
                id="verificationCode"
                name="verificationCode"
                type="text"
                value={formData.verificationCode}
                onChange={handleInputChange}
                required
                className="text-center text-2xl font-mono tracking-widest transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                placeholder="000000"
                maxLength={6}
              />
              <p className="text-xs text-gray-500 text-center">أدخل الرمز المكون من 6 أرقام</p>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
              disabled={!isFormValid || isSubmitting || loading}
            >
              {isSubmitting || loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  جاري التحقق...
                </>
              ) : (
                "تفعيل الحساب"
              )}
            </Button>
          </form>

          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">لم تستلم الرمز؟</p>
            <Button
              variant="outline"
              className="w-full"
              onClick={handleResendCode}
              disabled={resendCooldown > 0 || isResending}
            >
              {isResending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  جاري الإرسال...
                </>
              ) : resendCooldown > 0 ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  إعادة الإرسال خلال {resendCooldown}s
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  إرسال رمز جديد
                </>
              )}
            </Button>
          </div>

          <div className="text-center text-sm text-gray-600">
            <Button
              variant="link"
              className="p-0 h-auto font-semibold text-blue-600 hover:text-blue-700"
              onClick={() => router.push("/auth/signup")}
            >
              العودة للتسجيل
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
