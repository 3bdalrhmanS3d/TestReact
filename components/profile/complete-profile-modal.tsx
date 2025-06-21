"use client"

import type React from "react"
import { useState, Suspense } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, User, Calendar, GraduationCap, Globe } from "lucide-react"
import { toast } from "sonner"

function CompleteProfileForm() {
  const { profileIncomplete, profileCompletionData, updateProfile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    birthDate: "",
    edu: "",
    national: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await updateProfile(formData)

      if (result.success) {
        toast.success("تم إكمال الملف الشخصي بنجاح!")
      } else {
        toast.error(result.message || "فشل في إكمال الملف الشخصي")
      }
    } catch (error) {
      console.error("Profile completion error:", error)
      toast.error("حدث خطأ أثناء إكمال الملف الشخصي")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  if (!profileIncomplete || !profileCompletionData) {
    return null
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Birth Date */}
      {profileCompletionData.requiredFields?.BirthDate && (
        <div className="space-y-2">
          <Label htmlFor="birthDate" className="flex items-center gap-2 text-right">
            <Calendar className="h-4 w-4" />
            تاريخ الميلاد
          </Label>
          <Input
            id="birthDate"
            type="date"
            value={formData.birthDate}
            onChange={(e) => handleInputChange("birthDate", e.target.value)}
            required
            max={new Date(Date.now() - 13 * 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]}
            className="text-right"
          />
          <p className="text-xs text-muted-foreground text-right">{profileCompletionData.requiredFields.BirthDate}</p>
        </div>
      )}

      {/* Education Level */}
      {profileCompletionData.requiredFields?.Education && (
        <div className="space-y-2">
          <Label htmlFor="edu" className="flex items-center gap-2 text-right">
            <GraduationCap className="h-4 w-4" />
            المستوى التعليمي
          </Label>
          <Select value={formData.edu} onValueChange={(value) => handleInputChange("edu", value)} required>
            <SelectTrigger className="text-right">
              <SelectValue placeholder="اختر المستوى التعليمي" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ابتدائي">ابتدائي</SelectItem>
              <SelectItem value="متوسط">متوسط</SelectItem>
              <SelectItem value="ثانوي">ثانوي</SelectItem>
              <SelectItem value="دبلوم">دبلوم</SelectItem>
              <SelectItem value="بكالوريوس">بكالوريوس</SelectItem>
              <SelectItem value="ماجستير">ماجستير</SelectItem>
              <SelectItem value="دكتوراه">دكتوراه</SelectItem>
              <SelectItem value="أخرى">أخرى</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground text-right">{profileCompletionData.requiredFields.Education}</p>
        </div>
      )}

      {/* Nationality */}
      {profileCompletionData.requiredFields?.Nationality && (
        <div className="space-y-2">
          <Label htmlFor="national" className="flex items-center gap-2 text-right">
            <Globe className="h-4 w-4" />
            الجنسية
          </Label>
          <Select value={formData.national} onValueChange={(value) => handleInputChange("national", value)} required>
            <SelectTrigger className="text-right">
              <SelectValue placeholder="اختر الجنسية" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="سعودي">سعودي</SelectItem>
              <SelectItem value="مصري">مصري</SelectItem>
              <SelectItem value="أردني">أردني</SelectItem>
              <SelectItem value="لبناني">لبناني</SelectItem>
              <SelectItem value="سوري">سوري</SelectItem>
              <SelectItem value="عراقي">عراقي</SelectItem>
              <SelectItem value="كويتي">كويتي</SelectItem>
              <SelectItem value="إماراتي">إماراتي</SelectItem>
              <SelectItem value="قطري">قطري</SelectItem>
              <SelectItem value="بحريني">بحريني</SelectItem>
              <SelectItem value="عماني">عماني</SelectItem>
              <SelectItem value="يمني">يمني</SelectItem>
              <SelectItem value="فلسطيني">فلسطيني</SelectItem>
              <SelectItem value="مغربي">مغربي</SelectItem>
              <SelectItem value="جزائري">جزائري</SelectItem>
              <SelectItem value="تونسي">تونسي</SelectItem>
              <SelectItem value="ليبي">ليبي</SelectItem>
              <SelectItem value="سوداني">سوداني</SelectItem>
              <SelectItem value="أخرى">أخرى</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground text-right">{profileCompletionData.requiredFields.Nationality}</p>
        </div>
      )}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            جاري الحفظ...
          </>
        ) : (
          "إكمال الملف الشخصي"
        )}
      </Button>
    </form>
  )
}

export default function CompleteProfileModal() {
  const { profileIncomplete, profileCompletionData } = useAuth()

  if (!profileIncomplete || !profileCompletionData) {
    return null
  }

  return (
    <Dialog open={profileIncomplete} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" hideCloseButton>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-right">
            <User className="h-5 w-5" />
            إكمال الملف الشخصي
          </DialogTitle>
          <DialogDescription className="text-right">
            يرجى إكمال المعلومات المطلوبة للمتابعة إلى لوحة التحكم
          </DialogDescription>
        </DialogHeader>

        <Alert>
          <AlertDescription className="text-right">
            هذه المعلومات مطلوبة لإنشاء ملفك الشخصي وتخصيص تجربة التعلم الخاصة بك.
          </AlertDescription>
        </Alert>

        <Suspense
          fallback={
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          }
        >
          <CompleteProfileForm />
        </Suspense>
      </DialogContent>
    </Dialog>
  )
}
