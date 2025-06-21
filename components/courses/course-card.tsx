"use client"

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, Users, Clock, BookOpen, DollarSign } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import type { Course, PublicCourse } from "@/types/course"

interface CourseCardProps {
  course: Course | PublicCourse
  variant?: "admin" | "instructor" | "public"
  onEdit?: (courseId: number) => void
  onDelete?: (courseId: number) => void
  onToggleStatus?: (courseId: number) => void
}

export default function CourseCard({ course, variant = "public", onEdit, onDelete, onToggleStatus }: CourseCardProps) {
  const isPublicCourse = "courseDescription" in course
  const courseName = isPublicCourse ? course.courseName : course.courseName
  const courseImage = isPublicCourse ? course.courseImage : course.courseImage
  const price = isPublicCourse ? course.price : course.coursePrice
  const instructorName = isPublicCourse ? course.instructorName : course.instructorName
  const enrollmentCount = isPublicCourse ? course.enrollmentCount : course.enrollmentCount
  const averageRating = isPublicCourse ? course.averageRating : course.averageRating
  const reviewCount = isPublicCourse ? course.reviewCount : course.reviewCount

  const formatPrice = (price: number) => {
    if (price === 0) return "مجاني"
    return `$${price.toFixed(2)}`
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}س ${mins}د`
    }
    return `${mins}د`
  }

  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
      <CardHeader className="p-0">
        <div className="relative aspect-video">
          <Image
            src={courseImage || "/placeholder.svg?height=200&width=300"}
            alt={courseName}
            fill
            className="object-cover rounded-t-lg"
          />
          {variant !== "public" && (
            <div className="absolute top-2 right-2">
              <Badge variant={"isActive" in course && course.isActive ? "default" : "secondary"}>
                {"isActive" in course && course.isActive ? "نشط" : "غير نشط"}
              </Badge>
            </div>
          )}
          {isPublicCourse && course.isFeatured && (
            <div className="absolute top-2 left-2">
              <Badge variant="default" className="bg-yellow-500">
                مميز
              </Badge>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-4">
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-lg line-clamp-2 mb-1">{courseName}</h3>
            <p className="text-sm text-muted-foreground">بواسطة {instructorName}</p>
          </div>

          {isPublicCourse && course.courseDescription && (
            <p className="text-sm text-gray-600 line-clamp-2">{course.courseDescription}</p>
          )}

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{enrollmentCount}</span>
            </div>

            {averageRating && averageRating > 0 && (
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span>{averageRating.toFixed(1)}</span>
                <span>({reviewCount})</span>
              </div>
            )}

            {isPublicCourse && (
              <div className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" />
                <span>{course.totalLevels} مستوى</span>
              </div>
            )}

            {isPublicCourse && course.estimatedDurationMinutes > 0 && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{formatDuration(course.estimatedDurationMinutes)}</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              <span className="font-semibold text-lg">{formatPrice(price)}</span>
            </div>

            {isPublicCourse && course.courseLevel && <Badge variant="outline">{course.courseLevel}</Badge>}
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        {variant === "public" && (
          <div className="w-full space-y-2">
            <Link href={`/courses/${course.courseId}`} className="w-full">
              <Button className="w-full">عرض التفاصيل</Button>
            </Link>
          </div>
        )}

        {(variant === "admin" || variant === "instructor") && (
          <div className="w-full space-y-2">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1" onClick={() => onEdit?.(course.courseId)}>
                تعديل
              </Button>
              <Button variant="outline" size="sm" className="flex-1" onClick={() => onToggleStatus?.(course.courseId)}>
                {"isActive" in course && course.isActive ? "إلغاء تفعيل" : "تفعيل"}
              </Button>
            </div>

            {variant === "admin" && (
              <Button variant="destructive" size="sm" className="w-full" onClick={() => onDelete?.(course.courseId)}>
                حذف
              </Button>
            )}
          </div>
        )}
      </CardFooter>
    </Card>
  )
}
