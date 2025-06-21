"use client"

import React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { courseContentApi } from "@/lib/course-content-api"
import type { CreateSectionDto } from "@/types/course-content"
import { toast } from "sonner"

interface CreateSectionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  levelId: number | null
  onSuccess: () => void
}

export default function CreateSectionDialog({ open, onOpenChange, levelId, onSuccess }: CreateSectionDialogProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<CreateSectionDto>({
    sectionName: "",
    sectionDescription: "",
    sectionOrder: 1,
    isVisible: true,
    levelId: levelId || 0,
  })

  // Update levelId when prop changes
  React.useEffect(() => {
    if (levelId) {
      setFormData((prev) => ({ ...prev, levelId }))
    }
  }, [levelId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.sectionName.trim()) {
      toast.error("يرجى إدخال اسم القسم")
      return
    }

    if (!levelId) {
      toast.error("خطأ في تحديد المستوى")
      return
    }

    setLoading(true)
    try {
      await courseContentApi.createSection(formData)
      toast.success("تم إنشاء القسم بنجاح!")
      onSuccess()

      // Reset form
      setFormData({
        sectionName: "",
        sectionDescription: "",
        sectionOrder: 1,
        isVisible: true,
        levelId: levelId || 0,
      })
    } catch (error) {
      console.error("Error creating section:", error)
      toast.error("حدث خطأ أثناء إنشاء القسم")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>إنشاء قسم جديد</DialogTitle>
          <DialogDescription>أضف قسمًا جديدًا لتنظيم المحتوى داخل المستوى</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sectionName">اسم القسم *</Label>
            <Input
              id="sectionName"
              value={formData.sectionName}
              onChange={(e) => setFormData((prev) => ({ ...prev, sectionName: e.target.value }))}
              placeholder="مثال: الدرس الأول - التعريف بالموضوع"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sectionDescription">وصف القسم</Label>
            <Textarea
              id="sectionDescription"
              value={formData.sectionDescription}
              onChange={(e) => setFormData((prev) => ({ ...prev, sectionDescription: e.target.value }))}
              placeholder="وصف مختصر لما يحتويه هذا القسم..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sectionOrder">ترتيب القسم</Label>
            <Input
              id="sectionOrder"
              type="number"
              min="1"
              value={formData.sectionOrder}
              onChange={(e) => setFormData((prev) => ({ ...prev, sectionOrder: Number.parseInt(e.target.value) || 1 }))}
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
              {loading ? "جاري الإنشاء..." : "إنشاء القسم"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
