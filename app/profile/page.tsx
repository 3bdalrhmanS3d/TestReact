"use client"

import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { User, Mail, Calendar, GraduationCap, Globe, BookOpen, Clock, Award, Edit, AlertCircle } from "lucide-react"

export default function ProfilePage() {
  const { profile, user, loading, error, profileIncomplete } = useAuth()

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="space-y-6">
          <Skeleton className="h-8 w-1/4" />
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="md:col-span-2">
              <CardHeader>
                <Skeleton className="h-6 w-1/3" />
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-20 w-20 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-64" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                </div>
                <Separator />
                <div className="grid gap-4 md:grid-cols-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="h-5 w-5" />
                      <div className="space-y-1">
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-4 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (profileIncomplete) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>يرجى إكمال الملف الشخصي للمتابعة</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">لم يتم العثور على بيانات الملف الشخصي</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("ar-SA", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    } catch {
      return dateString
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase()
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">الملف الشخصي</h1>
        <Button variant="outline" size="sm">
          <Edit className="h-4 w-4 mr-2" />
          تعديل الملف
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Overview */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              المعلومات الشخصية
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profile.profilePhoto || "/placeholder.svg"} alt={profile.fullName || "المستخدم"} />
                <AvatarFallback className="text-lg">{getInitials(profile.fullName || "مستخدم")}</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h2 className="text-2xl font-semibold">{profile.fullName || "غير محدد"}</h2>
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="h-4 w-4" />
                  {profile.emailAddress || "غير محدد"}
                </div>
                <Badge variant="secondary">{profile.role || "مستخدم"}</Badge>
              </div>
            </div>

            <Separator />

            <div className="grid gap-4 md:grid-cols-2">
              {profile.birthDate && (
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">تاريخ الميلاد</p>
                    <p className="font-medium">{formatDate(profile.birthDate)}</p>
                  </div>
                </div>
              )}

              {profile.edu && (
                <div className="flex items-center gap-3">
                  <GraduationCap className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">المستوى التعليمي</p>
                    <p className="font-medium">{profile.edu}</p>
                  </div>
                </div>
              )}

              {profile.national && (
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">الجنسية</p>
                    <p className="font-medium">{profile.national}</p>
                  </div>
                </div>
              )}

              {profile.createdAt && (
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">تاريخ التسجيل</p>
                    <p className="font-medium">{formatDate(profile.createdAt)}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Learning Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              التقدم الدراسي
            </CardTitle>
            <CardDescription>ملخص رحلتك التعليمية</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{profile.progress?.length || 0}</div>
              <p className="text-sm text-gray-600">الدورات المسجلة</p>
            </div>

            <Separator />

            {profile.progress && profile.progress.length > 0 ? (
              <div className="space-y-3">
                <h4 className="font-medium">الدورات الحالية:</h4>
                {profile.progress.slice(0, 3).map((course) => (
                  <div key={course.courseId} className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium text-sm">{course.courseName}</p>
                    <p className="text-xs text-gray-600">آخر تحديث: {formatDate(course.lastUpdated)}</p>
                  </div>
                ))}
                {profile.progress.length > 3 && (
                  <p className="text-xs text-gray-600 text-center">و {profile.progress.length - 3} دورات أخرى</p>
                )}
              </div>
            ) : (
              <div className="text-center py-4">
                <Award className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">لم تبدأ أي دورة بعد</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
