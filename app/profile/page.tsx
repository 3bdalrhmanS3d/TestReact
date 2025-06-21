"use client"

import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { User, Mail, Calendar, GraduationCap, Globe, BookOpen, Clock, Award, Edit } from "lucide-react"
import { format } from "date-fns"
import { ar } from "date-fns/locale"

export default function ProfilePage() {
  const { profile, user, loading } = useAuth()

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-600">لم يتم العثور على بيانات الملف الشخصي</p>
          </CardContent>
        </Card>
      </div>
    )
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
                <AvatarImage src={profile.profilePhoto || "/placeholder.svg"} alt={profile.fullName} />
                <AvatarFallback className="text-lg">
                  {profile.fullName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h2 className="text-2xl font-semibold">{profile.fullName}</h2>
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="h-4 w-4" />
                  {profile.emailAddress}
                </div>
                <Badge variant="secondary">{profile.role}</Badge>
              </div>
            </div>

            <Separator />

            <div className="grid gap-4 md:grid-cols-2">
              {profile.birthDate && (
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">تاريخ الميلاد</p>
                    <p className="font-medium">{format(new Date(profile.birthDate), "dd MMMM yyyy", { locale: ar })}</p>
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

              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">تاريخ التسجيل</p>
                  <p className="font-medium">{format(new Date(profile.createdAt), "dd MMMM yyyy", { locale: ar })}</p>
                </div>
              </div>
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
              <div className="text-3xl font-bold text-primary">{profile.progress.length}</div>
              <p className="text-sm text-gray-600">الدورات المسجلة</p>
            </div>

            <Separator />

            {profile.progress.length > 0 ? (
              <div className="space-y-3">
                <h4 className="font-medium">الدورات الحالية:</h4>
                {profile.progress.slice(0, 3).map((course) => (
                  <div key={course.courseId} className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium text-sm">{course.courseName}</p>
                    <p className="text-xs text-gray-600">
                      آخر تحديث: {format(new Date(course.lastUpdated), "dd/MM/yyyy", { locale: ar })}
                    </p>
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
