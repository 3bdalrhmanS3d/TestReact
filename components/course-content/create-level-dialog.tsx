"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { courseContentApi } from "@/lib/course-content-api"
import type { CreateLevelDto } from "@/types/course-content"
import { toast } from "sonner"

interface CreateLevelDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  courseId: number
  onSuccess: () => void
}

export default function CreateLevelDialog({ open, onOpenChange, courseId, onSuccess }: CreateLevelDialogProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<CreateLevelDto>({
    levelName: "",
    levelDescription: "",
    levelOrder: 1,
    isVisible: true,
    courseId,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.levelName.trim()) {
      toast.error("يرجى إدخال اسم المستوى")
      return
    }

    setLoading(true)
    try {
      await courseContentApi.createLevel(formData)
      toast.success("تم إنشاء المستوى بنجاح!")
      onSuccess()

      // Reset form
      setFormData({
        levelName: "",
        levelDescription: "",
        levelOrder: 1,
        isVisible: true,
        courseId,
      })
    } catch (error) {
      console.error("Error creating level:", error)
      toast.error("حدث خطأ أثناء إنشاء المستوى")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>إنشاء مستوى جديد</DialogTitle>
          <DialogDescription>أضف مستوى جديد للدورة لتنظيم المحتوى</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="levelName">اسم المستوى *</Label>
            <Input
              id="levelName"
              value={formData.levelName}
              onChange={(e) => setFormData((prev) => ({ ...prev, levelName: e.target.value }))}
              placeholder="مثال: المستوى الأول - المقدمة"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="levelDescription">وصف المستوى</Label>
            <Textarea
              id="levelDescription"
              value={formData.levelDescription}
              onChange={(e) => setFormData((prev) => ({ ...prev, levelDescription: e.target.value }))}
              placeholder="وصف مختصر لما يحتويه هذا المستوى..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="levelOrder">ترتيب المستوى</Label>
            <Input
              id="levelOrder"
              type="number"
              min="1"
              value={formData.levelOrder}
              onChange={(e) => setFormData((prev) => ({ ...prev, levelOrder: Number.parseInt(e.target.value) || 1 }))}
            />
          </div>

          <div className="flex items-center space-x-2 space-x-reverse">
            <Switch
              id="isVisible"
              checked={formData.isVisible}
              onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isVisible: checked }))}
            />
            <Label htmlFor="isVisible">مرئي للطلاب</Label>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              إلغاء
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "جاري الإنشاء..." : "إنشاء المستوى"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
