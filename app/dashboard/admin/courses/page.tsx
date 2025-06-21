"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  BookOpen,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Users,
  DollarSign,
  TrendingUp,
  Download,
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { courseApi } from "@/lib/course-api"
import type { Course } from "@/types/course"

export default function AdminCoursesPage() {
  const { user } = useAuth()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  useEffect(() => {
    if (user?.role === "Admin") {
      loadCourses()
    }
  }, [user])

  const loadCourses = async () => {
    try {
      const data = await courseApi.getAllCoursesForAdmin(
        1,
        50,
        searchTerm,
        statusFilter === "active" ? true : statusFilter === "inactive" ? false : undefined,
      )
      setCourses(data)
    } catch (error) {
      console.error("Error loading courses:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleStatus = async (courseId: number) => {
    try {
      await courseApi.toggleCourseStatus(courseId)
      await loadCourses() // Reload courses
    } catch (error) {
      console.error("Error toggling course status:", error)
    }
  }

  const handleDeleteCourse = async (courseId: number) => {
    if (confirm("هل أنت متأكد من حذف هذه الدورة؟")) {
      try {
        await courseApi.deleteCourse(courseId)
        await loadCourses() // Reload courses
      } catch (error) {
        console.error("Error deleting course:", error)
      }
    }
  }

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

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.instructorName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && course.isActive) ||
      (statusFilter === "inactive" && !course.isActive)
    return matchesSearch && matchesStatus
  })

  const totalStudents = courses.reduce((sum, course) => sum + course.enrollmentCount, 0)
  const totalRevenue = courses.reduce((sum, course) => sum + course.coursePrice * course.enrollmentCount, 0)
  const activeCourses = courses.filter((course) => course.isActive).length

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">إدارة الدورات</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">إدارة الدورات</h1>
          <p className="text-gray-600">إدارة جميع الدورات في المنصة</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            تصدير
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
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
                <p className="text-2xl font-bold">{activeCourses}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">إجمالي الطلاب</p>
                <p className="text-2xl font-bold">{totalStudents.toLocaleString()}</p>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">إجمالي الإيرادات</p>
                <p className="text-2xl font-bold">${totalRevenue.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="البحث في الدورات أو المدربين..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="حالة الدورة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع الدورات</SelectItem>
            <SelectItem value="active">نشطة</SelectItem>
            <SelectItem value="inactive">غير نشطة</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={loadCourses}>
          <Filter className="h-4 w-4 mr-2" />
          تطبيق الفلاتر
        </Button>
      </div>

      {/* Courses Table */}
      <Card>
        <CardHeader>
          <CardTitle>الدورات ({filteredCourses.length})</CardTitle>
          <CardDescription>قائمة بجميع الدورات في المنصة</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الدورة</TableHead>
                <TableHead>المدرب</TableHead>
                <TableHead>الطلاب</TableHead>
                <TableHead>السعر</TableHead>
                <TableHead>التقييم</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>تاريخ الإنشاء</TableHead>
                <TableHead className="text-left">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCourses.map((course) => (
                <TableRow key={course.courseId}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <BookOpen className="h-5 w-5 text-gray-500" />
                      </div>
                      <div>
                        <div className="font-medium line-clamp-1">{course.courseName}</div>
                        <div className="text-sm text-gray-500">
                          {course.levelsCount} مستوى • {course.sectionsCount} قسم
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{course.instructorName}</TableCell>
                  <TableCell>{course.enrollmentCount}</TableCell>
                  <TableCell>${course.coursePrice}</TableCell>
                  <TableCell>
                    {course.averageRating ? (
                      <div className="flex items-center gap-1">
                        <span>{course.averageRating.toFixed(1)}</span>
                        <span className="text-yellow-500">⭐</span>
                        <span className="text-sm text-gray-500">({course.reviewCount})</span>
                      </div>
                    ) : (
                      <span className="text-gray-500">لا يوجد</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={course.isActive ? "default" : "secondary"}>
                      {course.isActive ? "نشط" : "غير نشط"}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(course.createdAt).toLocaleDateString("ar-SA")}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          عرض التفاصيل
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          تعديل
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleStatus(course.courseId)}>
                          {course.isActive ? (
                            <>
                              <ToggleLeft className="mr-2 h-4 w-4" />
                              إلغاء التفعيل
                            </>
                          ) : (
                            <>
                              <ToggleRight className="mr-2 h-4 w-4" />
                              تفعيل
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteCourse(course.courseId)} className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          حذف
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
