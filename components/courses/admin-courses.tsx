"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Download, MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import CourseCard from "./course-card"
import { courseApi } from "@/lib/course-api"
import type { Course } from "@/types/course"

export default function AdminCourses() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<boolean | undefined>(undefined)
  const [selectedCourses, setSelectedCourses] = useState<number[]>([])

  useEffect(() => {
    loadCourses()
  }, [searchTerm, statusFilter])

  const loadCourses = async () => {
    try {
      setLoading(true)
      const data = await courseApi.getAllCoursesForAdmin(1, 50, searchTerm, statusFilter)
      setCourses(data)
    } catch (error) {
      console.error("Error loading courses:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (courseId: number) => {
    window.location.href = `/admin/courses/${courseId}/edit`
  }

  const handleDelete = async (courseId: number) => {
    if (confirm("هل أنت متأكد من حذف هذه الدورة؟")) {
      try {
        await courseApi.deleteCourse(courseId)
        await loadCourses()
      } catch (error) {
        console.error("Error deleting course:", error)
        alert("حدث خطأ أثناء حذف الدورة")
      }
    }
  }

  const handleToggleStatus = async (courseId: number) => {
    try {
      await courseApi.toggleCourseStatus(courseId)
      await loadCourses()
    } catch (error) {
      console.error("Error toggling course status:", error)
    }
  }

  const handleTransferOwnership = async (courseId: number) => {
    const newInstructorId = prompt("أدخل معرف المدرب الجديد:")
    if (newInstructorId) {
      try {
        await courseApi.transferCourseOwnership(courseId, Number.parseInt(newInstructorId))
        await loadCourses()
        alert("تم نقل ملكية الدورة بنجاح")
      } catch (error) {
        console.error("Error transferring ownership:", error)
        alert("حدث خطأ أثناء نقل ملكية الدورة")
      }
    }
  }

  const toggleCourseSelection = (courseId: number) => {
    setSelectedCourses((prev) => (prev.includes(courseId) ? prev.filter((id) => id !== courseId) : [...prev, courseId]))
  }

  const selectAllCourses = () => {
    setSelectedCourses(courses.map((c) => c.courseId))
  }

  const clearSelection = () => {
    setSelectedCourses([])
  }

  const handleBulkAction = async (action: string) => {
    if (selectedCourses.length === 0) {
      alert("يرجى اختيار دورة واحدة على الأقل")
      return
    }

    if (confirm(`هل أنت متأكد من تطبيق العملية "${action}" على ${selectedCourses.length} دورة؟`)) {
      try {
        // This would call the bulk action API
        console.log(`Bulk ${action} for courses:`, selectedCourses)
        await loadCourses()
        setSelectedCourses([])
      } catch (error) {
        console.error("Error in bulk action:", error)
      }
    }
  }

  const totalRevenue = courses.reduce((sum, course) => sum + course.coursePrice * course.enrollmentCount, 0)

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
              <CardTitle>إدارة الدورات</CardTitle>
              <CardDescription>إدارة جميع الدورات في المنصة</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                تصدير
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleBulkAction("activate")}>تفعيل المحدد</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleBulkAction("deactivate")}>إلغاء تفعيل المحدد</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleBulkAction("delete")}>حذف المحدد</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filters */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="ابحث في الدورات..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select onValueChange={(value) => setStatusFilter(value === "all" ? undefined : value === "active")}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="حالة الدورة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الدورات</SelectItem>
                <SelectItem value="active">نشطة</SelectItem>
                <SelectItem value="inactive">غير نشطة</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Selection Controls */}
          {selectedCourses.length > 0 && (
            <div className="flex items-center justify-between bg-blue-50 p-3 rounded-lg">
              <span className="text-sm">تم اختيار {selectedCourses.length} دورة</span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={clearSelection}>
                  إلغاء التحديد
                </Button>
                <Button size="sm" onClick={selectAllCourses}>
                  تحديد الكل
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
            <p className="text-sm text-muted-foreground">إجمالي التسجيلات</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
            <p className="text-sm text-muted-foreground">إجمالي الإيرادات</p>
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
        {courses.map((course) => (
          <div key={course.courseId} className="relative">
            <input
              type="checkbox"
              checked={selectedCourses.includes(course.courseId)}
              onChange={() => toggleCourseSelection(course.courseId)}
              className="absolute top-2 left-2 z-10"
            />
            <CourseCard
              course={course}
              variant="admin"
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleStatus={handleToggleStatus}
            />
            <div className="absolute top-2 right-2 z-10">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleEdit(course.courseId)}>تعديل</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleToggleStatus(course.courseId)}>
                    {course.isActive ? "إلغاء تفعيل" : "تفعيل"}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleTransferOwnership(course.courseId)}>
                    نقل الملكية
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDelete(course.courseId)} className="text-red-600">
                    حذف
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}
      </div>

      {courses.length === 0 && !loading && (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-500">لم يتم العثور على دورات</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
