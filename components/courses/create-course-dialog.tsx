"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { X, Plus, Upload } from "lucide-react"
import { courseApi } from "@/lib/course-api"
import type { CreateCourseDto, AboutCourseInput } from "@/types/course"

interface CreateCourseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export default function CreateCourseDialog({ open, onOpenChange, onSuccess }: CreateCourseDialogProps) {
  const [loading, setLoading] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const [formData, setFormData] = useState<CreateCourseDto>({
    courseName: "",
    description: "",
    coursePrice: 0,
    isActive: false,
    aboutCourseInputs: [],
    courseSkillInputs: [],
  })

  const [newAboutText, setNewAboutText] = useState("")
  const [newAboutType, setNewAboutType] = useState("Learn")
  const [newSkill, setNewSkill] = useState("")

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const addAboutCourse = () => {
    if (newAboutText.trim()) {
      const newAbout: AboutCourseInput = {
        aboutCourseId: 0,
        aboutCourseText: newAboutText.trim(),
        outcomeType: newAboutType,
      }

      setFormData((prev) => ({
        ...prev,
        aboutCourseInputs: [...(prev.aboutCourseInputs || []), newAbout],
      }))

      setNewAboutText("")
    }
  }

  const removeAboutCourse = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      aboutCourseInputs: prev.aboutCourseInputs?.filter((_, i) => i !== index) || [],
    }))
  }

  const addSkill = () => {
    if (newSkill.trim() && !formData.courseSkillInputs?.includes(newSkill.trim())) {
      setFormData((prev) => ({
        ...prev,
        courseSkillInputs: [...(prev.courseSkillInputs || []), newSkill.trim()],
      }))
      setNewSkill("")
    }
  }

  const removeSkill = (skill: string) => {
    setFormData((prev) => ({
      ...prev,
      courseSkillInputs: prev.courseSkillInputs?.filter((s) => s !== skill) || [],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.courseName.trim() || !formData.description.trim()) {
      alert("يرجى ملء جميع الحقول المطلوبة")
      return
    }

    try {
      setLoading(true)
      await courseApi.createCourse(formData, imageFile || undefined)
      onSuccess()

      // Reset form
      setFormData({
        courseName: "",
        description: "",
        coursePrice: 0,
        isActive: false,
        aboutCourseInputs: [],
        courseSkillInputs: [],
      })
      setImageFile(null)
      setImagePreview(null)
    } catch (error) {
      console.error("Error creating course:", error)
      alert("حدث خطأ أثناء إنشاء الدورة")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>إنشاء دورة جديدة</DialogTitle>
          <DialogDescription>أنشئ دورة تعليمية جديدة وابدأ في مشاركة معرفتك مع الطلاب</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="courseName">اسم الدورة *</Label>
              <Input
                id="courseName"
                value={formData.courseName}
                onChange={(e) => setFormData((prev) => ({ ...prev, courseName: e.target.value }))}
                placeholder="أدخل اسم الدورة"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">وصف الدورة *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="اكتب وصفاً شاملاً للدورة"
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="coursePrice">سعر الدورة ($)</Label>
                <Input
                  id="coursePrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.coursePrice}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, coursePrice: Number.parseFloat(e.target.value) || 0 }))
                  }
                  placeholder="0.00"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isActive: checked }))}
                />
                <Label htmlFor="isActive">تفعيل الدورة</Label>
              </div>
            </div>
          </div>

          {/* Course Image */}
          <div>
            <Label>صورة الدورة</Label>
            <div className="mt-2">
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview || "/placeholder.svg"}
                    alt="Course preview"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => {
                      setImageFile(null)
                      setImagePreview(null)
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-2">
                    <Label htmlFor="courseImage" className="cursor-pointer">
                      <span className="text-blue-600 hover:text-blue-500">اختر صورة</span>
                      <Input
                        id="courseImage"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </Label>
                  </div>
                  <p className="text-sm text-gray-500">PNG, JPG, GIF حتى 5MB</p>
                </div>
              )}
            </div>
          </div>

          {/* About Course */}
          <div>
            <Label>ما ستتعلمه في هذه الدورة</Label>
            <div className="space-y-2 mt-2">
              <div className="flex gap-2">
                <Input
                  value={newAboutText}
                  onChange={(e) => setNewAboutText(e.target.value)}
                  placeholder="أضف نقطة تعليمية..."
                  className="flex-1"
                />
                <select
                  value={newAboutType}
                  onChange={(e) => setNewAboutType(e.target.value)}
                  className="px-3 py-2 border rounded-md"
                >
                  <option value="Learn">تعلم</option>
                  <option value="Practice">تطبيق</option>
                  <option value="Build">بناء</option>
                </select>
                <Button type="button" onClick={addAboutCourse}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-1">
                {formData.aboutCourseInputs?.map((about, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <span className="text-sm">
                      <Badge variant="outline" className="mr-2">
                        {about.outcomeType}
                      </Badge>
                      {about.aboutCourseText}
                    </span>
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeAboutCourse(index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Skills */}
          <div>
            <Label>المهارات المطلوبة</Label>
            <div className="space-y-2 mt-2">
              <div className="flex gap-2">
                <Input
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="أضف مهارة..."
                  className="flex-1"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      addSkill()
                    }
                  }}
                />
                <Button type="button" onClick={addSkill}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {formData.courseSkillInputs?.map((skill) => (
                  <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                    {skill}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0"
                      onClick={() => removeSkill(skill)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              إلغاء
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "جاري الإنشاء..." : "إنشاء الدورة"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
