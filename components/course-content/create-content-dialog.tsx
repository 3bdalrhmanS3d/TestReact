"use client"

import React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, Video } from "lucide-react"
import { courseContentApi } from "@/lib/course-content-api"
import type { CreateContentDto } from "@/types/course-content"
import { ContentType } from "@/types/course-content"
import { toast } from "sonner"

interface CreateContentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sectionId: number | null
  onSuccess: () => void
}

export default function CreateContentDialog({ open, onOpenChange, sectionId, onSuccess }: CreateContentDialogProps) {
  const [loading, setLoading] = useState(false)
  const [uploadingVideo, setUploadingVideo] = useState(false)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null)

  const [formData, setFormData] = useState<CreateContentDto>({
    contentName: "",
    contentDescription: "",
    contentType: ContentType.Video,
    contentOrder: 1,
    isVisible: true,
    isFree: false,
    sectionId: sectionId || 0,
    estimatedDurationMinutes: 10,
    videoUrl: "",
    textContent: "",
  })

  // Update sectionId when prop changes
  React.useEffect(() => {
    if (sectionId) {
      setFormData((prev) => ({ ...prev, sectionId }))
    }
  }, [sectionId])

  const handleVideoUpload = async (file: File) => {
    setUploadingVideo(true)
    try {
      const videoUrl = await courseContentApi.uploadVideo(file)
      setFormData((prev) => ({ ...prev, videoUrl }))
      toast.success("تم رفع الفيديو بنجاح!")
    } catch (error) {
      console.error("Error uploading video:", error)
      toast.error("حدث خطأ أثناء رفع الفيديو")
    } finally {
      setUploadingVideo(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.contentName.trim()) {
      toast.error("يرجى إدخال اسم المحتوى")
      return
    }

    if (!sectionId) {
      toast.error("خطأ في تحديد القسم")
      return
    }

    // Validate content based on type
    if (formData.contentType === ContentType.Video && !formData.videoUrl && !videoFile) {
      toast.error("يرجى إضافة رابط الفيديو أو رفع ملف فيديو")
      return
    }

    if (formData.contentType === ContentType.Text && !formData.textContent?.trim()) {
      toast.error("يرجى إضافة المحتوى النصي")
      return
    }

    setLoading(true)
    try {
      const contentData: CreateContentDto = {
        ...formData,
        attachmentFile: attachmentFile || undefined,
      }

      await courseContentApi.createContent(contentData)
      toast.success("تم إنشاء المحتوى بنجاح!")
      onSuccess()

      // Reset form
      setFormData({
        contentName: "",
        contentDescription: "",
        contentType: ContentType.Video,
        contentOrder: 1,
        isVisible: true,
        isFree: false,
        sectionId: sectionId || 0,
        estimatedDurationMinutes: 10,
        videoUrl: "",
        textContent: "",
      })
      setVideoFile(null)
      setAttachmentFile(null)
    } catch (error) {
      console.error("Error creating content:", error)
      toast.error("حدث خطأ أثناء إنشاء المحتوى")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>إنشاء محتوى جديد</DialogTitle>
          <DialogDescription>أضف محتوى جديدًا للقسم (فيديو، نص، أو مرفق)</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contentName">اسم المحتوى *</Label>
                <Input
                  id="contentName"
                  value={formData.contentName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, contentName: e.target.value }))}
                  placeholder="مثال: مقدمة في البرمجة"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contentType">نوع المحتوى *</Label>
                <Select
                  value={formData.contentType}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, contentType: value as ContentType }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ContentType.Video}>فيديو</SelectItem>
                    <SelectItem value={ContentType.Text}>نص</SelectItem>
                    <SelectItem value={ContentType.Attachment}>مرفق</SelectItem>
                    <SelectItem value={ContentType.Quiz}>اختبار</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contentDescription">وصف المحتوى</Label>
              <Textarea
                id="contentDescription"
                value={formData.contentDescription}
                onChange={(e) => setFormData((prev) => ({ ...prev, contentDescription: e.target.value }))}
                placeholder="وصف مختصر للمحتوى..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contentOrder">ترتيب المحتوى</Label>
                <Input
                  id="contentOrder"
                  type="number"
                  min="1"
                  value={formData.contentOrder}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, contentOrder: Number.parseInt(e.target.value) || 1 }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="estimatedDuration">المدة المقدرة (دقيقة)</Label>
                <Input
                  id="estimatedDuration"
                  type="number"
                  min="1"
                  value={formData.estimatedDurationMinutes}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      estimatedDurationMinutes: Number.parseInt(e.target.value) || 10,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>الإعدادات</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Switch
                      id="isVisible"
                      checked={formData.isVisible}
                      onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isVisible: checked }))}
                    />
                    <Label htmlFor="isVisible">مرئي</Label>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Switch
                      id="isFree"
                      checked={formData.isFree}
                      onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isFree: checked }))}
                    />
                    <Label htmlFor="isFree">مجاني</Label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content-specific fields */}
          <div className="space-y-4">
            {formData.contentType === ContentType.Video && (
              <Tabs defaultValue="url" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="url">رابط الفيديو</TabsTrigger>
                  <TabsTrigger value="upload">رفع فيديو</TabsTrigger>
                </TabsList>
                <TabsContent value="url" className="space-y-2">
                  <Label htmlFor="videoUrl">رابط الفيديو</Label>
                  <Input
                    id="videoUrl"
                    value={formData.videoUrl}
                    onChange={(e) => setFormData((prev) => ({ ...prev, videoUrl: e.target.value }))}
                    placeholder="https://youtube.com/watch?v=..."
                  />
                </TabsContent>
                <TabsContent value="upload" className="space-y-2">
                  <Label>رفع ملف فيديو</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Video className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <div className="space-y-2">
                      <Label htmlFor="videoFile" className="cursor-pointer">
                        <span className="text-blue-600 hover:text-blue-500">اختر ملف فيديو</span>
                        <Input
                          id="videoFile"
                          type="file"
                          accept="video/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              setVideoFile(file)
                              handleVideoUpload(file)
                            }
                          }}
                          className="hidden"
                        />
                      </Label>
                      <p className="text-sm text-gray-500">MP4, AVI, MOV حتى 500MB</p>
                      {uploadingVideo && <p className="text-sm text-blue-600">جاري رفع الفيديو...</p>}
                      {videoFile && <p className="text-sm text-green-600">تم اختيار: {videoFile.name}</p>}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            )}

            {formData.contentType === ContentType.Text && (
              <div className="space-y-2">
                <Label htmlFor="textContent">المحتوى النصي *</Label>
                <Textarea
                  id="textContent"
                  value={formData.textContent}
                  onChange={(e) => setFormData((prev) => ({ ...prev, textContent: e.target.value }))}
                  placeholder="اكتب المحتوى النصي هنا..."
                  rows={8}
                  required
                />
              </div>
            )}

            {formData.contentType === ContentType.Attachment && (
              <div className="space-y-2">
                <Label>رفع مرفق</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <div className="space-y-2">
                    <Label htmlFor="attachmentFile" className="cursor-pointer">
                      <span className="text-blue-600 hover:text-blue-500">اختر ملف</span>
                      <Input
                        id="attachmentFile"
                        type="file"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            setAttachmentFile(file)
                          }
                        }}
                        className="hidden"
                      />
                    </Label>
                    <p className="text-sm text-gray-500">PDF, DOC, PPT, ZIP حتى 50MB</p>
                    {attachmentFile && <p className="text-sm text-green-600">تم اختيار: {attachmentFile.name}</p>}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              إلغاء
            </Button>
            <Button type="submit" disabled={loading || uploadingVideo}>
              {loading ? "جاري الإنشاء..." : "إنشاء المحتوى"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
