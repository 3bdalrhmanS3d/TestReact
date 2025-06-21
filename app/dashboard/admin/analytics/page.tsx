"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart3, TrendingUp, Users, BookOpen, DollarSign, Download, Target } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

export default function AdminAnalyticsPage() {
  const { user } = useAuth()

  // Check if user is admin
  if (user?.role !== "Admin") {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold mb-2">غير مصرح</h3>
            <p className="text-gray-600">يجب أن تكون مديرًا للوصول لهذه الصفحة</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">الإحصائيات والتحليلات</h1>
          <p className="text-gray-600">تحليل شامل لأداء المنصة</p>
        </div>
        <div className="flex gap-2">
          <Select defaultValue="30">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="الفترة الزمنية" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">آخر 7 أيام</SelectItem>
              <SelectItem value="30">آخر 30 يوم</SelectItem>
              <SelectItem value="90">آخر 3 أشهر</SelectItem>
              <SelectItem value="365">آخر سنة</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            تصدير التقرير
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">إجمالي الإيرادات</p>
                <p className="text-3xl font-bold">$45,231</p>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  +12.5% من الشهر الماضي
                </p>
              </div>
              <DollarSign className="h-12 w-12 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">المستخدمين الجدد</p>
                <p className="text-3xl font-bold">1,234</p>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  +8.2% من الشهر الماضي
                </p>
              </div>
              <Users className="h-12 w-12 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">الدورات المنشورة</p>
                <p className="text-3xl font-bold">89</p>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  +15.3% من الشهر الماضي
                </p>
              </div>
              <BookOpen className="h-12 w-12 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">معدل الإكمال</p>
                <p className="text-3xl font-bold">78.5%</p>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  +3.1% من الشهر الماضي
                </p>
              </div>
              <Target className="h-12 w-12 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>نمو الإيرادات</CardTitle>
            <CardDescription>الإيرادات الشهرية خلال العام الماضي</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">مخطط الإيرادات</p>
                <p className="text-sm text-gray-400">سيتم إضافة المخطط هنا</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>نمو المستخدمين</CardTitle>
            <CardDescription>عدد المستخدمين الجدد شهريًا</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">مخطط المستخدمين</p>
                <p className="text-sm text-gray-400">سيتم إضافة المخطط هنا</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>أفضل الدورات</CardTitle>
            <CardDescription>الدورات الأكثر تسجيلاً</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "تطوير الويب الحديث", enrollments: 1234, revenue: "$12,340" },
                { name: "تعلم الذكاء الاصطناعي", enrollments: 987, revenue: "$9,870" },
                { name: "أساسيات البرمجة", enrollments: 756, revenue: "$7,560" },
                { name: "تصميم واجهات المستخدم", enrollments: 543, revenue: "$5,430" },
              ].map((course, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{course.name}</p>
                    <p className="text-sm text-gray-600">{course.enrollments} طالب</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">{course.revenue}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>أفضل المدربين</CardTitle>
            <CardDescription>المدربين الأكثر نجاحًا</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "د. أحمد محمد", courses: 12, students: 2340, rating: 4.9 },
                { name: "م. فاطمة علي", courses: 8, students: 1876, rating: 4.8 },
                { name: "د. محمد حسن", courses: 15, students: 1654, rating: 4.7 },
                { name: "م. سارة أحمد", courses: 6, students: 1432, rating: 4.9 },
              ].map((instructor, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{instructor.name}</p>
                    <p className="text-sm text-gray-600">
                      {instructor.courses} دورة • {instructor.students} طالب
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{instructor.rating} ⭐</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>الإحصائيات السريعة</CardTitle>
            <CardDescription>ملخص الأداء اليومي</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">تسجيلات اليوم</span>
                <span className="font-bold">47</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">إيرادات اليوم</span>
                <span className="font-bold text-green-600">$1,234</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">دورات جديدة</span>
                <span className="font-bold">3</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">مراجعات جديدة</span>
                <span className="font-bold">12</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">شهادات صادرة</span>
                <span className="font-bold">8</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
