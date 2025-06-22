"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, BookOpen, Users, Award, ArrowRight, Wifi, WifiOff } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const { isAuthenticated, loading, error, apiAvailable } = useAuth()
  const router = useRouter()
  const [showLanding, setShowLanding] = useState(false)

  useEffect(() => {
    if (!loading) {
      if (isAuthenticated) {
        router.push("/dashboard")
      } else {
        // Show landing page for a moment before redirecting
        setShowLanding(true)
        const timer = setTimeout(() => {
          router.push("/auth/signin")
        }, 3000)

        return () => clearTimeout(timer)
      }
    }
  }, [isAuthenticated, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <div className="space-y-2">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">جاري التحميل...</h2>
            <p className="text-gray-600">يتم فحص حالة تسجيل الدخول</p>
          </div>
        </div>
      </div>
    )
  }

  if (showLanding) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-2 space-x-reverse">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-gray-900">LearnQuest</span>
              </div>

              <div className="flex items-center space-x-4 space-x-reverse">
                {/* API Status */}
                <div className="flex items-center space-x-2 space-x-reverse">
                  {apiAvailable ? (
                    <div className="flex items-center text-green-600">
                      <Wifi className="h-4 w-4 mr-1" />
                      <span className="text-sm">متصل</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-red-600">
                      <WifiOff className="h-4 w-4 mr-1" />
                      <span className="text-sm">غير متصل</span>
                    </div>
                  )}
                </div>

                <Link href="/auth/signin">
                  <Button variant="outline">تسجيل الدخول</Button>
                </Link>
                <Link href="/auth/signup">
                  <Button>إنشاء حساب</Button>
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription className="flex items-center justify-between">
                <span>{error}</span>
              </AlertDescription>
            </Alert>
          )}

          {/* API Status Alert */}
          {!apiAvailable && (
            <Alert className="mb-6 border-yellow-200 bg-yellow-50">
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <div>
                    <strong>تنبيه:</strong> الخادم غير متاح حالياً. بعض الميزات قد لا تعمل بشكل صحيح.
                  </div>
                  <Link href="/debug">
                    <Button variant="ghost" size="sm">
                      فحص الاتصال
                    </Button>
                  </Link>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Hero Section */}
          <div className="text-center py-20">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mb-8">
              <BookOpen className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              مرحباً بك في{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                LearnQuest
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              منصة التعلم الإلكتروني المتقدمة التي تساعدك على تطوير مهاراتك ومعرفتك من خلال دورات تفاعلية ومحتوى عالي
              الجودة
            </p>
            <div className="flex items-center justify-center space-x-4 space-x-reverse">
              <Link href="/auth/signup">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  ابدأ رحلتك التعليمية
                  <ArrowRight className="mr-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/auth/signin">
                <Button size="lg" variant="outline">
                  تسجيل الدخول
                </Button>
              </Link>
            </div>

            {/* Auto redirect notice */}
            <p className="text-sm text-gray-500 mt-4">سيتم توجيهك تلقائياً إلى صفحة تسجيل الدخول خلال ثوانٍ...</p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-16">
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>دورات متنوعة</CardTitle>
                <CardDescription>مجموعة واسعة من الدورات في مختلف المجالات التقنية والأكاديمية</CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle>مدربين خبراء</CardTitle>
                <CardDescription>تعلم من أفضل المدربين والخبراء في مجالاتهم</CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Award className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle>شهادات معتمدة</CardTitle>
                <CardDescription>احصل على شهادات معتمدة عند إتمام الدورات بنجاح</CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* Stats */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-16">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-blue-600 mb-2">1000+</div>
                <div className="text-gray-600">طالب مسجل</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600 mb-2">50+</div>
                <div className="text-gray-600">دورة متاحة</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600 mb-2">95%</div>
                <div className="text-gray-600">معدل الرضا</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-orange-600 mb-2">24/7</div>
                <div className="text-gray-600">دعم فني</div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 space-x-reverse mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-bold">LearnQuest</span>
              </div>
              <p className="text-gray-400 mb-4">منصة التعلم الإلكتروني المتقدمة</p>
              <div className="flex items-center justify-center space-x-4 space-x-reverse">
                <Link href="/debug" className="text-gray-400 hover:text-white transition-colors">
                  فحص النظام
                </Link>
                <span className="text-gray-600">•</span>
                <Link href="/auth/signin" className="text-gray-400 hover:text-white transition-colors">
                  تسجيل الدخول
                </Link>
                <span className="text-gray-600">•</span>
                <Link href="/auth/signup" className="text-gray-400 hover:text-white transition-colors">
                  إنشاء حساب
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    )
  }

  return null
}
