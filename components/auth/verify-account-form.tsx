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
import { Loader2, Shield, RefreshCw, Mail } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import type { VerifyAccountRequestDto } from "@/types/auth"

export default function VerifyAccountForm() {
  const [verificationCode, setVerificationCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [pendingEmail, setPendingEmail] = useState("")

  const { verifyAccount, resendCode, apiAvailable } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Get the email from localStorage if available
    const email = localStorage.getItem("pendingVerificationEmail")
    if (email) {
      setPendingEmail(email)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    if (!verificationCode.trim()) {
      setError("رمز التحقق مطلوب")
      setLoading(false)
      return
    }

    if (verificationCode.length !== 6) {
      setError("رمز التحقق يجب أن يكون 6 أرقام")
      setLoading(false)
      return
    }

    const data: VerifyAccountRequestDto = {
      verificationCode: verificationCode,
    }

    const result = await verifyAccount(data)

    if (result.success) {
      setSuccess(result.message || "تم تفعيل الحساب بنجاح")
      // Clear the pending email
      localStorage.removeItem("pendingVerificationEmail")
      setTimeout(() => {
        router.push("/auth/signin")
      }, 2000)
    } else {
      setError(result.message || "رمز التحقق غير صحيح")
    }

    setLoading(false)
  }

  const handleResendCode = async () => {
    setResendLoading(true)
    setError("")
    setSuccess("")

    const result = await resendCode()

    if (result.success) {
      setSuccess(result.message || "تم إرسال رمز جديد")
    } else {
      setError(result.message || "فشل في إرسال الرمز")
    }

    setResendLoading(false)
  }

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6) // Only numbers, max 6 digits
    setVerificationCode(value)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-gray-900">تفعيل الحساب</CardTitle>
            <CardDescription className="text-gray-600 mt-2">
              أدخل رمز التحقق المرسل إلى بريدك الإلكتروني
              {pendingEmail && (
                <div className="flex items-center justify-center mt-2 text-sm">
                  <Mail className="h-4 w-4 mr-1" />
                  <span className="font-medium">{pendingEmail}</span>
                </div>
              )}
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
              <Label htmlFor="verificationCode" className="text-sm font-medium text-gray-700">
                رمز التحقق (6 أرقام)
              </Label>
              <Input
                id="verificationCode"
                name="verificationCode"
                type="text"
                value={verificationCode}
                onChange={handleCodeChange}
                className="h-12 border-gray-200 focus:border-purple-500 focus:ring-purple-500 text-center text-xl tracking-widest font-mono"
                placeholder="000000"
                required
                maxLength={6}
                dir="ltr"
                inputMode="numeric"
                pattern="[0-9]*"
              />
              <p className="text-xs text-gray-500 text-center">
                أدخل الرمز المكون من 6 أرقام المرسل إلى بريدك الإلكتروني
              </p>
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium"
              disabled={loading || verificationCode.length !== 6 || !apiAvailable}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  جاري التحقق...
                </>
              ) : (
                "تفعيل الحساب"
              )}
            </Button>

            <div className="text-center">
              <Button
                type="button"
                variant="ghost"
                onClick={handleResendCode}
                disabled={resendLoading || !apiAvailable}
                className="text-purple-600 hover:text-purple-800"
              >
                {resendLoading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    جاري الإرسال...
                  </>
                ) : (
                  "إعادة إرسال الرمز"
                )}
              </Button>
            </div>
          </CardContent>

          <CardFooter className="text-center">
            <p className="text-sm text-gray-600">
              تذكرت بياناتك؟{" "}
              <Link href="/auth/signin" className="text-purple-600 hover:text-purple-800 font-medium transition-colors">
                تسجيل الدخول
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
