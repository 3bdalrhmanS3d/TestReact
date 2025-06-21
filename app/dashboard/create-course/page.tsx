"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Plus, X, Upload, Save, Eye } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { courseApi } from "@/lib/course-api"
import type { CreateCourseDto, AboutCourseInput } from "@/types/course"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export default function CreateCoursePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const [courseData, setCourseData] = useState<CreateCourseDto>({
    courseName: "",
    description: "",
    coursePrice: 0,
    isActive: false,
    aboutCourseInputs: [],
    courseSkillInputs: [],
  })

  const [newAboutCourse, setNewAboutCourse] = useState("")
  const [newSkill, setNewSkill] = useState("")

  // Handle image upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onload = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Add about course item
  const addAboutCourse = () => {
    if (newAboutCourse.trim()) {
      const newItem: AboutCourseInput = {
        aboutCourseId: 0,
        aboutCourseText: newAboutCourse.trim(),
        outcomeType: "Learn",
      }
      setCourseData((prev) => ({
        ...prev,
        aboutCourseInputs: [...(prev.aboutCourseInputs || []), newItem],
      }))
      setNewAboutCourse("")
    }
  }

  // Remove about course item
  const removeAboutCourse = (index: number) => {
    setCourseData((prev) => ({
      ...prev,
      aboutCourseInputs: prev.aboutCourseInputs?.filter((_, i) => i !== index) || [],
    }))
  }

  // Add skill
  const addSkill = () => {
    if (newSkill.trim() && !courseData.courseSkillInputs?.includes(newSkill.trim())) {
      setCourseData((prev) => ({
        ...prev,
        courseSkillInputs: [...(prev.courseSkillInputs || []), newSkill.trim()],
      }))
      setNewSkill("")
    }
  }

  // Remove skill
  const removeSkill = (skill: string) => {
    setCourseData((prev) => ({
      ...prev,
      courseSkillInputs: prev.courseSkillInputs?.filter((s) => s !== skill) || [],
    }))
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!courseData.courseName.trim() || !courseData.description.trim()) {
      toast.error("يرجى ملء جميع الحقول المطلوبة")
      return
    }

    setLoading(true)
    try {
      const courseId = await courseApi.createCourse(courseData, imageFile || undefined)
      toast.success("تم إنشاء الدورة بنجاح!")
      router.push(`/dashboard/my-courses`)
    } catch (error) {
      console.error("Error creating course:", error)
      toast.error("حدث خطأ أثناء إنشاء الدورة")
    } finally {
      setLoading(false)
    }
  }

  // Check if user is instructor
  if (user?.role !== "Instructor" && user?.role !== "Admin") {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold mb-2">غير مصرح</h3>
            <p className="text-gray-600">يجب أن تكون مدربًا لإنشاء الدورات</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">إنشاء دورة جديدة</h1>
        <p className="text-gray-600">أنشئ دورة تعليمية جديدة وشاركها مع الطلاب</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>المعلومات الأساسية</CardTitle>
            <CardDescription>أدخل المعلومات الأساسية للدورة</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="courseName">اسم الدورة *</Label>
                <Input
                  id="courseName"
                  value={courseData.courseName}
                  onChange={(e) => setCourseData((prev) => ({ ...prev, courseName: e.target.value }))}
                  placeholder="أدخل اسم الدورة"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="coursePrice">سعر الدورة ($)</Label>
                <Input
                  id="coursePrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={courseData.coursePrice}
                  onChange={(e) =>
                    setCourseData((prev) => ({ ...prev, coursePrice: Number.parseFloat(e.target.value) || 0 }))
                  }
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">وصف الدورة *</Label>
              <Textarea
                id="description"
                value={courseData.description}
                onChange={(e) => setCourseData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="اكتب وصفًا مفصلًا للدورة..."
                rows={4}
                required
              />
            </div>

            <div className="flex items-center space-x-2 space-x-reverse">
              <Switch
                id="isActive"
                checked={courseData.isActive}
                onCheckedChange={(checked) => setCourseData((prev) => ({ ...prev, isActive: checked }))}
              />
              <Label htmlFor="isActive">تفعيل الدورة فور الإنشاء</Label>
            </div>
          </CardContent>
        </Card>

        {/* Course Image */}
        <Card>
          <CardHeader>
            <CardTitle>صورة الدورة</CardTitle>
            <CardDescription>اختر صورة جذابة للدورة</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="courseImage"
                  className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                >
                  {imagePreview ? (
                    <img
                      src={imagePreview || "/placeholder.svg"}
                      alt="Course preview"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-4 text-gray-500" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">انقر لرفع صورة</span> أو اسحب وأفلت
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG أو GIF (الحد الأقصى 5MB)</p>
                    </div>
                  )}
                  <input
                    id="courseImage"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Course Outcomes */}
        <Card>
          <CardHeader>
            <CardTitle>أهداف الدورة</CardTitle>
            <CardDescription>ما الذي سيتعلمه الطلاب من هذه الدورة؟</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={newAboutCourse}
                onChange={(e) => setNewAboutCourse(e.target.value)}
                placeholder="أضف هدفًا تعليميًا..."
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addAboutCourse())}
              />
              <Button type="button" onClick={addAboutCourse} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2">
              {courseData.aboutCourseInputs?.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span>{item.aboutCourseText}</span>
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeAboutCourse(index)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Course Skills */}
        <Card>
          <CardHeader>
            <CardTitle>المهارات المطلوبة</CardTitle>
            <CardDescription>ما هي المهارات التي ستغطيها هذه الدورة؟</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="أضف مهارة..."
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
              />
              <Button type="button" onClick={addSkill} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {courseData.courseSkillInputs?.map((skill, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {skill}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => removeSkill(skill)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Submit Buttons */}
        <div className="flex gap-4 justify-end">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            إلغاء
          </Button>
          <Button type="button" variant="outline">
            <Eye className="h-4 w-4 mr-2" />
            معاينة
          </Button>
          <Button type="submit" disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? "جاري الإنشاء..." : "إنشاء الدورة"}
          </Button>
        </div>
      </form>
    </div>
  )
}
