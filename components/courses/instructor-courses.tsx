"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search } from "lucide-react"
import CourseCard from "./course-card"
import CreateCourseDialog from "./create-course-dialog"
import { courseApi } from "@/lib/course-api"
import { useAuth } from "@/hooks/use-auth"
import type { Course } from "@/types/course"

export default function InstructorCourses() {
  const { user } = useAuth()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  useEffect(() => {
    loadCourses()
  }, [])

  const loadCourses = async () => {
    try {
      setLoading(true)
      const data = await courseApi.getMyCoursesAsInstructor()
      setCourses(data)
    } catch (error) {
      console.error("Error loading courses:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (courseId: number) => {
    // Navigate to course edit page
    window.location.href = `/instructor/courses/${courseId}/edit`
  }

  const handleToggleStatus = async (courseId: number) => {
    try {
      await courseApi.toggleCourseStatus(courseId)
      await loadCourses() // Reload courses
    } catch (error) {
      console.error("Error toggling course status:", error)
    }
  }

  const handleCourseCreated = () => {
    setShowCreateDialog(false)
    loadCourses()
  }

  const filteredCourses = courses.filter((course) => course.courseName.toLowerCase().includes(searchTerm.toLowerCase()))

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
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
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>دوراتي</CardTitle>
              <CardDescription>إدارة الدورات التي تقوم بتدريسها</CardDescription>
            </div>
            <Button onClick={() => setShowCreateDialog(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              إنشاء دورة جديدة
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="ابحث في دوراتك..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{courses.length}</div>
            <p className="text-sm text-muted-foreground">إجمالي الدورات</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{courses.filter((c) => c.isActive).length}</div>
            <p className="text-sm text-muted-foreground">الدورات النشطة</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{courses.reduce((sum, c) => sum + c.enrollmentCount, 0)}</div>
            <p className="text-sm text-muted-foreground">إجمالي الطلاب</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {courses.filter((c) => c.averageRating && c.averageRating > 0).length > 0
                ? (
                    courses
                      .filter((c) => c.averageRating && c.averageRating > 0)
                      .reduce((sum, c) => sum + (c.averageRating || 0), 0) /
                    courses.filter((c) => c.averageRating && c.averageRating > 0).length
                  ).toFixed(1)
                : "0.0"}
            </div>
            <p className="text-sm text-muted-foreground">متوسط التقييم</p>
          </CardContent>
        </Card>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <CourseCard
            key={course.courseId}
            course={course}
            variant="instructor"
            onEdit={handleEdit}
            onToggleStatus={handleToggleStatus}
          />
        ))}
      </div>

      {filteredCourses.length === 0 && !loading && (
        <Card>
          <CardContent className="text-center py-12">
            {searchTerm ? (
              <p className="text-gray-500">لم يتم العثور على دورات تطابق البحث "{searchTerm}"</p>
            ) : (
              <div className="space-y-4">
                <p className="text-gray-500">لم تقم بإنشاء أي دورات بعد</p>
                <Button onClick={() => setShowCreateDialog(true)} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  إنشاء دورتك الأولى
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Create Course Dialog */}
      <CreateCourseDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} onSuccess={handleCourseCreated} />
    </div>
  )
}
