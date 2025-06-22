"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  BarChart3,
  Users,
  Star,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Calendar,
  DollarSign,
  TrendingUp,
  Clock,
  Play,
  CheckCircle,
  XCircle,
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useCourses } from "@/hooks/use-courses"
import Link from "next/link"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"
import { ar } from "date-fns/locale"

const CourseCard = ({ course, isInstructor = false }: { course: any; isInstructor?: boolean }) => {
  const { deleteCourse } = useCourses()
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const result = await deleteCourse(course.courseId)
      if (result.success) {
        toast.success("تم حذف الكورس بنجاح")
      } else {
        toast.error(result.message || "فشل في حذف الكورس")
      }
    } catch (error) {
      toast.error("حدث خطأ أثناء حذف الكورس")
    } finally {
      setDeleting(false)
    }
  }

  const formatPrice = (price: number) => {
    return price === 0 ? "مجاني" : `$${price}`
  }

  const getStatusBadge = () => {
    if (isInstructor) {
      return (
        <Badge variant={course.isActive ? "default" : "secondary"}>
          {course.isActive ? "نشط" : "غير نشط"}
        </Badge>
      )
    } else if (course.progress) {
      const percentage = course.progress.progressPercentage || 0
      if (percentage === 100) {
        return <Badge variant="default" className="bg-green-600">مكتمل</Badge>
      } else if (percentage > 0) {
        return <Badge variant="outline">في التقدم</Badge>
      } else {
        return <Badge variant="secondary">لم يبدأ</Badge>
      }
    }
    return null
  }

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg line-clamp-2 text-right">
              {course.courseName}
            </CardTitle>
            <CardDescription className="mt-1 text-right">
              {isInstructor ? (
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>{course.enrollmentCount} طالب</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs">
                      {course.instructorName?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span>{course.instructorName}</span>
                </div>
              )}
            </CardDescription>
          </div>
          
          <div className="flex items-center gap-2">
            {getStatusBadge()}
            
            {isInstructor && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <Link href={`/dashboard/my-courses/${course.courseId}`}>
                    <DropdownMenuItem className="cursor-pointer">
                      <Eye className="mr-2 h-4 w-4" />
                      عرض
                    </DropdownMenuItem>
                  </Link>
                  <Link href={`/dashboard/my-courses/${course.courseId}/edit`}>
                    <DropdownMenuItem className="cursor-pointer">
                      <Edit className="mr-2 h-4 w-4" />
                      تحرير
                    </DropdownMenuItem>
                  </Link>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem 
                        className="cursor-pointer text-red-600 focus:text-red-600"
                        onSelect={(e) => e.preventDefault()}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        حذف
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                        <AlertDialogDescription>
                          هل أنت متأكد من حذف الكورس "{course.courseName}"؟ 
                          هذا الإجراء لا يمكن التراجع عنه.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>إلغاء</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={handleDelete}
                          disabled={deleting}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          {deleting ? "جاري الحذف..." : "حذف"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Course Image */}
        <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
          {course.courseImage ? (
            <img 
              src={course.courseImage} 
              alt={course.courseName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <BookOpen className="h-12 w-12 text-gray-400" />
            </div>
          )}
        </div>

        {/* Course Description */}
        <p className="text-sm text-gray-600 line-clamp-2 text-right">
          {course.description}
        </p>

        {/* Progress for Students */}
        {!isInstructor && course.progress && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">التقدم</span>
              <span className="font-medium">
                {course.progress.progressPercentage || 0}%
              </span>
            </div>
            <Progress value={course.progress.progressPercentage || 0} className="h-2" />
            <div className="flex justify-between text-xs text-gray-500">
              <span>{course.progress.completedSections || 0} من {course.progress.totalSections || 0} قسم</span>
              <span>{course.progress.completedLevels || 0} من {course.progress.totalLevels || 0} مستوى</span>
            </div>
          </div>
        )}

        {/* Course Stats */}
        <div className="flex justify-between items-center text-sm text-gray-600">
          <div className="flex items-center gap-4">
            {course.averageRating && (
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span>{course.averageRating.toFixed(1)}</span>
              </div>
            )}
            
            {isInstructor && (
              <div className="flex items-center gap-1">
                <DollarSign className="h-4 w-4" />
                <span>{formatPrice(course.coursePrice)}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>
              {formatDistanceToNow(new Date(course.createdAt), { 
                addSuffix: true, 
                locale: ar 
              })}
            </span>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <Link 
            href={isInstructor 
              ? `/dashboard/my-courses/${course.courseId}` 
              : `/dashboard/my-courses/${course.courseId}/learn`
            }
            className="w-full"
          >
            <Button className="w-full">
              {isInstructor ? (
                <>
                  <BarChart3 className="h-4 w-4 mr-2" />
                  إدارة الكورس
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  {course.progress?.progressPercentage > 0 ? "متابعة التعلم" : "بدء التعلم"}
                </>
              )}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

const CourseCardSkeleton = () => (
  <Card>
    <CardHeader>
      <div className="flex justify-between items-start">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <Skeleton className="h-6 w-16" />
      </div>
    </CardHeader>
    <CardContent className="space-y-4">
      <Skeleton className="aspect-video w-full rounded-lg" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-10 w-full" />
    </CardContent>
  </Card>
)

export default function MyCoursesPage() {
  const { user } = useAuth()
  const { 
    enrolledCourses, 
    instructorCourses, 
    loading, 
    error,
    loadEnrolledCourses, 
    loadInstructorCourses 
  } = useCourses()
  
  const [searchTerm, setSearchTerm] = useState("")

  const isInstructor = user?.role === "Instructor" || user?.role === "Admin"
  const courses = isInstructor ? instructorCourses : enrolledCourses

  // Load courses on mount
  useEffect(() => {
    if (isInstructor) {
      loadInstructorCourses()
    } else {
      loadEnrolledCourses()
    }
  }, [isInstructor, loadInstructorCourses, loadEnrolledCourses])

  // Filter courses based on search term
  const filteredCourses = courses.filter(course =>
    course.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (course.instructorName && course.instructorName.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  // Calculate stats for instructors
  const stats = isInstructor ? {
    totalCourses: courses.length,
    activeCourses: courses.filter(c => c.isActive).length,
    totalStudents: courses.reduce((sum, c) => sum + (c.enrollmentCount || 0), 0),
    averageRating: courses.length > 0
      ? (courses.reduce((sum, c) => sum + (c.averageRating || 0), 0) / courses.length).toFixed(1)
      : "0.0"
  } : null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">
            {isInstructor ? "كورساتي" : "الكورسات المسجل بها"}
          </h1>
          <p className="text-gray-600 mt-2">
            {isInstructor ? 
              "إدارة الدورات التي تقوم بتدريسها" : 
              "الدورات المسجل بها والتقدم فيها"}
          </p>
        </div>
        
        {isInstructor && (
          <Link href="/dashboard/create-course">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              إنشاء دورة جديدة
            </Button>
          </Link>
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

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
      {isInstructor && stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">إجمالي الدورات</p>
                  <p className="text-2xl font-bold">{stats.totalCourses}</p>
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
                  <p className="text-2xl font-bold">{stats.activeCourses}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">إجمالي الطلاب</p>
                  <p className="text-2xl font-bold">{stats.totalStudents}</p>
                </div>
                <Users className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">متوسط التقييم</p>
                  <p className="text-2xl font-bold">{stats.averageRating}</p>
                </div>
                <Star className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Courses Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <CourseCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredCourses.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {searchTerm ? "لم يتم العثور على نتائج" : "لا توجد دورات"}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm ? (
                `لم يتم العثور على دورات تحتوي على "${searchTerm}"`
              ) : isInstructor ? (
                "لم تقم بإنشاء أي دورات بعد. ابدأ بإنشاء دورتك الأولى!"
              ) : (
                "لم تسجل في أي دورات بعد. تصفح الدورات المتاحة وابدأ رحلة التعلم!"
              )}
            </p>
            {!searchTerm && (
              <div>
                {isInstructor ? (
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
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <CourseCard 
              key={course.courseId} 
              course={course} 
              isInstructor={isInstructor} 
            />
          ))}
        </div>
      )}
    </div>
  )
}