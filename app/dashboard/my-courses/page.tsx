"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { BookOpen, Search, Filter, Plus, Eye, Edit, BarChart3 } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { courseApi } from "@/lib/course-api"
import type { Course } from "@/types/course"
import Link from "next/link"

export default function MyCoursesPage() {
  const { user } = useAuth()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    loadMyCourses()
  }, [])

  const loadMyCourses = async () => {
    try {
      if (user?.role === "Instructor") {
        const data = await courseApi.getMyCoursesAsInstructor()
        setCourses(data)
      } else {
        // For regular users, load enrolled courses
        // This would need a different API endpoint
        setCourses([])
      }
    } catch (error) {
      console.error("Error loading courses:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredCourses = courses.filter((course) => course.courseName.toLowerCase().includes(searchTerm.toLowerCase()))

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">دوراتي</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-32 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">دوراتي</h1>
          <p className="text-gray-600">
            {user?.role === "Instructor" ? "إدارة الدورات التي تقوم بتدريسها" : "الدورات المسجل بها"}
          </p>
        </div>
        {user?.role === "Instructor" && (
          <Link href="/dashboard/create-course">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              إنشاء دورة جديدة
            </Button>
          </Link>
        )}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="البحث في الدورات..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10"
          />
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          فلترة
        </Button>
      </div>

      {/* Stats Cards for Instructors */}
      {user?.role === "Instructor" && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">إجمالي الدورات</p>
                  <p className="text-2xl font-bold">{courses.length}</p>
                </div>
                <BookOpen className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">الدورات النشطة</p>
                  <p className="text-2xl font-bold">{courses.filter((c) => c.isActive).length}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">إجمالي الطلاب</p>
                  <p className="text-2xl font-bold">{courses.reduce((sum, c) => sum + c.enrollmentCount, 0)}</p>
                </div>
                <BookOpen className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">متوسط التقييم</p>
                  <p className="text-2xl font-bold">
                    {courses.length > 0
                      ? (courses.reduce((sum, c) => sum + (c.averageRating || 0), 0) / courses.length).toFixed(1)
                      : "0.0"}
                  </p>
                </div>
                <BarChart3 className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Courses Grid */}
      {filteredCourses.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">لا توجد دورات</h3>
            <p className="text-gray-600 mb-4">
              {user?.role === "Instructor"
                ? "لم تقم بإنشاء أي دورات بعد. ابدأ بإنشاء دورتك الأولى!"
                : "لم تسجل في أي دورات بعد. تصفح الدورات المتاحة وابدأ رحلة التعلم!"}
            </p>
            {user?.role === "Instructor" ? (
              <Link href="/dashboard/create-course">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  إنشاء دورة جديدة
                </Button>
              </Link>
            ) : (
              <Link href="/courses">
                <Button>
                  <Search className="h-4 w-4 mr-2" />
                  تصفح الدورات
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <Card key={course.courseId} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-2">{course.courseName}</CardTitle>
                    <CardDescription className="mt-1">{course.instructorName}</CardDescription>
                  </div>
                  <Badge variant={course.isActive ? "default" : "secondary"}>
                    {course.isActive ? "نشط" : "غير نشط"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                  {course.courseImage ? (
                    <img
                      src={course.courseImage || "/placeholder.svg"}
                      alt={course.courseName}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <BookOpen className="h-12 w-12 text-gray-400" />
                  )}
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">الطلاب:</span>
                    <span className="font-medium">{course.enrollmentCount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">التقييم:</span>
                    <span className="font-medium">
                      {course.averageRating ? `${course.averageRating.toFixed(1)} ⭐` : "لا يوجد"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">السعر:</span>
                    <span className="font-medium">${course.coursePrice}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    <Eye className="h-4 w-4 mr-1" />
                    عرض
                  </Button>
                  {user?.role === "Instructor" && (
                    <>
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <BarChart3 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
