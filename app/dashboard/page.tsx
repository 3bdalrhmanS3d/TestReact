"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Heart, TrendingUp, Clock, Star } from "lucide-react"
import { apiClient } from "@/lib/api"
import { useAuth } from "@/hooks/use-auth"

interface DashboardStats {
  sharedCourses: number
  completedSections: number
  progress: Array<{
    courseId: number
    progressPercentage: number
  }>
}

interface Course {
  courseId: number
  courseName: string
  description: string
  courseImage: string
  coursePrice: number
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentCourses, setRecentCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const [statsResponse, coursesResponse] = await Promise.all([apiClient.getUserStats(), apiClient.searchCourses()])

      if (statsResponse.success) {
        setStats(statsResponse.data)
      }

      if (coursesResponse.success) {
        setRecentCourses(coursesResponse.data.slice(0, 3))
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">مرحباً بك، {user?.fullName}!</h2>
        <p className="text-blue-100">استمر في رحلتك التعليمية واكتشف المزيد من الدورات المميزة</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">دوراتي</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.sharedCourses || 0}</div>
            <p className="text-xs text-muted-foreground">الدورات المسجل بها</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الأقسام المكتملة</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.completedSections || 0}</div>
            <p className="text-xs text-muted-foreground">قسم مكتمل</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">متوسط التقدم</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.progress?.length
                ? Math.round(stats.progress.reduce((acc, p) => acc + p.progressPercentage, 0) / stats.progress.length)
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">نسبة الإنجاز</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Courses */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            الدورات المميزة
          </CardTitle>
          <CardDescription>اكتشف أحدث الدورات المتاحة</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentCourses.map((course) => (
              <div key={course.courseId} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="aspect-video bg-gray-100 rounded-md mb-3 flex items-center justify-center">
                  <BookOpen className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="font-semibold mb-2 line-clamp-2">{course.courseName}</h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{course.description}</p>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">${course.coursePrice}</Badge>
                  <Button size="sm" variant="outline">
                    عرض التفاصيل
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              استكمال التعلم
            </CardTitle>
            <CardDescription>تابع من حيث توقفت</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">الانتقال إلى دوراتي</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              استكشاف جديد
            </CardTitle>
            <CardDescription>اكتشف دورات جديدة في مجالك</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              تصفح الدورات
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
