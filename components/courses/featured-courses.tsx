"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import CourseCard from "./course-card"
import { courseApi } from "@/lib/course-api"
import type { PublicCourse } from "@/types/course"

export default function FeaturedCourses() {
  const [featuredCourses, setFeaturedCourses] = useState<PublicCourse[]>([])
  const [popularCourses, setPopularCourses] = useState<PublicCourse[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCourses()
  }, [])

  const loadCourses = async () => {
    try {
      setLoading(true)
      const [featured, popular] = await Promise.all([courseApi.getFeaturedCourses(6), courseApi.getPopularCourses(6)])
      setFeaturedCourses(featured)
      setPopularCourses(popular)
    } catch (error) {
      console.error("Error loading courses:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-8">
        {[1, 2].map((section) => (
          <Card key={section}>
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="aspect-video bg-gray-200 rounded-t-lg"></div>
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-12">
      {/* Featured Courses */}
      {featuredCourses.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-2xl">الدورات المميزة</CardTitle>
                <CardDescription>اكتشف أفضل الدورات المختارة بعناية من قبل خبرائنا</CardDescription>
              </div>
              <Link href="/courses?featured=true">
                <Button variant="outline" className="flex items-center gap-2">
                  عرض المزيد
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredCourses.map((course) => (
                <CourseCard key={course.courseId} course={course} variant="public" />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Popular Courses */}
      {popularCourses.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-2xl">الدورات الأكثر شعبية</CardTitle>
                <CardDescription>الدورات التي يختارها الطلاب أكثر من غيرها</CardDescription>
              </div>
              <Link href="/courses?sort=popular">
                <Button variant="outline" className="flex items-center gap-2">
                  عرض المزيد
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {popularCourses.map((course) => (
                <CourseCard key={course.courseId} course={course} variant="public" />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Call to Action */}
      <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <CardContent className="text-center py-12">
          <h2 className="text-3xl font-bold mb-4">ابدأ رحلتك التعليمية اليوم</h2>
          <p className="text-xl mb-6 text-blue-100">انضم إلى آلاف الطلاب واكتسب مهارات جديدة مع أفضل المدربين</p>
          <div className="flex justify-center gap-4">
            <Link href="/courses">
              <Button size="lg" variant="secondary">
                تصفح جميع الدورات
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button
                size="lg"
                variant="outline"
                className="text-white border-white hover:bg-white hover:text-blue-600"
              >
                إنشاء حساب مجاني
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
