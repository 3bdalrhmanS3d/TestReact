"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Heart, Search, BookOpen, Star, Clock, Users } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

export default function FavoritesPage() {
  const { user } = useAuth()

  // Mock favorite courses data
  const favoriteCourses = [
    {
      courseId: 1,
      courseName: "تطوير الويب الحديث مع React",
      instructorName: "د. أحمد محمد",
      courseImage: "/placeholder.svg?height=200&width=300",
      coursePrice: 99.99,
      averageRating: 4.8,
      reviewCount: 234,
      enrollmentCount: 1234,
      estimatedDuration: 120,
      addedToFavoritesAt: "2024-01-15",
    },
    {
      courseId: 2,
      courseName: "أساسيات الذكاء الاصطناعي",
      instructorName: "م. فاطمة علي",
      courseImage: "/placeholder.svg?height=200&width=300",
      coursePrice: 149.99,
      averageRating: 4.9,
      reviewCount: 189,
      enrollmentCount: 876,
      estimatedDuration: 180,
      addedToFavoritesAt: "2024-01-10",
    },
    {
      courseId: 3,
      courseName: "تصميم واجهات المستخدم UX/UI",
      instructorName: "د. محمد حسن",
      courseImage: "/placeholder.svg?height=200&width=300",
      coursePrice: 79.99,
      averageRating: 4.7,
      reviewCount: 156,
      enrollmentCount: 654,
      estimatedDuration: 90,
      addedToFavoritesAt: "2024-01-08",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">المفضلة</h1>
          <p className="text-gray-600">الدورات التي أضفتها إلى قائمة المفضلة</p>
        </div>
        <div className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-red-500" />
          <span className="text-sm text-gray-600">{favoriteCourses.length} دورة</span>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input placeholder="البحث في المفضلة..." className="pr-10" />
      </div>

      {/* Favorites Grid */}
      {favoriteCourses.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">لا توجد دورات في المفضلة</h3>
            <p className="text-gray-600 mb-4">لم تضف أي دورات إلى قائمة المفضلة بعد. تصفح الدورات وأضف ما يعجبك!</p>
            <Button>
              <BookOpen className="h-4 w-4 mr-2" />
              تصفح الدورات
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favoriteCourses.map((course) => (
            <Card key={course.courseId} className="hover:shadow-lg transition-shadow">
              <CardHeader className="p-0">
                <div className="relative">
                  <img
                    src={course.courseImage || "/placeholder.svg"}
                    alt={course.courseName}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <Button size="sm" variant="ghost" className="absolute top-2 left-2 bg-white/80 hover:bg-white">
                    <Heart className="h-4 w-4 text-red-500 fill-current" />
                  </Button>
                  <Badge className="absolute bottom-2 right-2 bg-black/70 text-white">${course.coursePrice}</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-lg line-clamp-2">{course.courseName}</h3>
                    <p className="text-sm text-gray-600">{course.instructorName}</p>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span>{course.averageRating}</span>
                      <span>({course.reviewCount})</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{course.enrollmentCount.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>{course.estimatedDuration} دقيقة</span>
                  </div>

                  <div className="text-xs text-gray-500">
                    أُضيف في {new Date(course.addedToFavoritesAt).toLocaleDateString("ar-SA")}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button className="flex-1">عرض الدورة</Button>
                    <Button variant="outline" size="sm">
                      <Heart className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">إجمالي المفضلة</p>
                <p className="text-2xl font-bold">{favoriteCourses.length}</p>
              </div>
              <Heart className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">القيمة الإجمالية</p>
                <p className="text-2xl font-bold">
                  ${favoriteCourses.reduce((sum, course) => sum + course.coursePrice, 0).toFixed(2)}
                </p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">متوسط التقييم</p>
                <p className="text-2xl font-bold">
                  {favoriteCourses.length > 0
                    ? (
                        favoriteCourses.reduce((sum, course) => sum + course.averageRating, 0) / favoriteCourses.length
                      ).toFixed(1)
                    : "0.0"}
                </p>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
