"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Plus,
  BookOpen,
  Video,
  FileText,
  PuzzleIcon as Quiz,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronRight,
} from "lucide-react"
import { courseContentApi } from "@/lib/course-content-api"
import { courseApi } from "@/lib/course-api"
import { useAuth } from "@/hooks/use-auth"
import type { CourseStructure } from "@/types/course-content"
import type { Course } from "@/types/course"
import { toast } from "sonner"
import CreateLevelDialog from "@/components/course-content/create-level-dialog"
import CreateSectionDialog from "@/components/course-content/create-section-dialog"
import CreateContentDialog from "@/components/course-content/create-content-dialog"

export default function CourseContentPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const courseId = Number(params.courseId)

  const [course, setCourse] = useState<Course | null>(null)
  const [courseStructure, setCourseStructure] = useState<CourseStructure | null>(null)
  const [loading, setLoading] = useState(true)
  const [expandedLevels, setExpandedLevels] = useState<Set<number>>(new Set())
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set())

  // Dialog states
  const [showCreateLevel, setShowCreateLevel] = useState(false)
  const [showCreateSection, setShowCreateSection] = useState(false)
  const [showCreateContent, setShowCreateContent] = useState(false)
  const [selectedLevelId, setSelectedLevelId] = useState<number | null>(null)
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null)

  useEffect(() => {
    loadCourseData()
  }, [courseId])

  const loadCourseData = async () => {
    try {
      setLoading(true)
      const [courseData, structureData] = await Promise.all([
        courseApi.getCourseDetails(courseId),
        courseContentApi.getCourseStructure(courseId),
      ])
      setCourse(courseData)
      setCourseStructure(structureData)
    } catch (error) {
      console.error("Error loading course data:", error)
      toast.error("حدث خطأ في تحميل بيانات الدورة")
    } finally {
      setLoading(false)
    }
  }

  const toggleLevelExpansion = (levelId: number) => {
    const newExpanded = new Set(expandedLevels)
    if (newExpanded.has(levelId)) {
      newExpanded.delete(levelId)
    } else {
      newExpanded.add(levelId)
    }
    setExpandedLevels(newExpanded)
  }

  const toggleSectionExpansion = (sectionId: number) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId)
    } else {
      newExpanded.add(sectionId)
    }
    setExpandedSections(newExpanded)
  }

  const handleCreateLevel = () => {
    setShowCreateLevel(true)
  }

  const handleCreateSection = (levelId: number) => {
    setSelectedLevelId(levelId)
    setShowCreateSection(true)
  }

  const handleCreateContent = (sectionId: number) => {
    setSelectedSectionId(sectionId)
    setShowCreateContent(true)
  }

  const handleLevelCreated = () => {
    setShowCreateLevel(false)
    loadCourseData()
  }

  const handleSectionCreated = () => {
    setShowCreateSection(false)
    setSelectedLevelId(null)
    loadCourseData()
  }

  const handleContentCreated = () => {
    setShowCreateContent(false)
    setSelectedSectionId(null)
    loadCourseData()
  }

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case "Video":
        return <Video className="h-4 w-4" />
      case "Text":
        return <FileText className="h-4 w-4" />
      case "Quiz":
        return <Quiz className="h-4 w-4" />
      default:
        return <BookOpen className="h-4 w-4" />
    }
  }

  const getContentTypeBadge = (type: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      Video: "default",
      Text: "secondary",
      Quiz: "destructive",
      Attachment: "outline",
    }
    return variants[type] || "outline"
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-6"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!course || !courseStructure) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold mb-2">الدورة غير موجودة</h3>
        <p className="text-gray-600 mb-4">لم يتم العثور على الدورة المطلوبة</p>
        <Button onClick={() => router.back()}>العودة</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">{course.courseName}</h1>
          <p className="text-gray-600 mt-2">إدارة محتوى الدورة والمستويات والأقسام</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push(`/courses/${courseId}`)}>
            <Eye className="h-4 w-4 mr-2" />
            معاينة الدورة
          </Button>
          <Button onClick={handleCreateLevel}>
            <Plus className="h-4 w-4 mr-2" />
            إضافة مستوى
          </Button>
        </div>
      </div>

      {/* Course Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{courseStructure.totalLevels}</div>
            <p className="text-sm text-muted-foreground">المستويات</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{courseStructure.totalSections}</div>
            <p className="text-sm text-muted-foreground">الأقسام</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{courseStructure.totalContents}</div>
            <p className="text-sm text-muted-foreground">المحتويات</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{Math.round(courseStructure.estimatedDurationMinutes / 60)}h</div>
            <p className="text-sm text-muted-foreground">المدة المقدرة</p>
          </CardContent>
        </Card>
      </div>

      {/* Course Content Structure */}
      <Card>
        <CardHeader>
          <CardTitle>هيكل الدورة</CardTitle>
          <CardDescription>إدارة المستويات والأقسام والمحتوى</CardDescription>
        </CardHeader>
        <CardContent>
          {courseStructure.levels.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">لا توجد مستويات بعد</h3>
              <p className="text-gray-600 mb-4">ابدأ بإنشاء المستوى الأول للدورة</p>
              <Button onClick={handleCreateLevel}>
                <Plus className="h-4 w-4 mr-2" />
                إنشاء المستوى الأول
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {courseStructure.levels.map((level) => (
                <Card key={level.levelId} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    {/* Level Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Button variant="ghost" size="sm" onClick={() => toggleLevelExpansion(level.levelId)}>
                          {expandedLevels.has(level.levelId) ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </Button>
                        <div>
                          <h3 className="font-semibold text-lg">{level.levelName}</h3>
                          {level.levelDescription && <p className="text-sm text-gray-600">{level.levelDescription}</p>}
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="outline">{level.sectionsCount} أقسام</Badge>
                          <Badge variant="outline">{level.contentsCount} محتوى</Badge>
                          {!level.isVisible && <Badge variant="secondary">مخفي</Badge>}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleCreateSection(level.levelId)}>
                          <Plus className="h-4 w-4 mr-2" />
                          إضافة قسم
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          {level.isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    {/* Sections */}
                    {expandedLevels.has(level.levelId) && level.sections && (
                      <div className="ml-8 space-y-3">
                        {level.sections.map((section) => (
                          <Card key={section.sectionId} className="border-l-4 border-l-green-500">
                            <CardContent className="p-3">
                              {/* Section Header */}
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => toggleSectionExpansion(section.sectionId)}
                                  >
                                    {expandedSections.has(section.sectionId) ? (
                                      <ChevronDown className="h-4 w-4" />
                                    ) : (
                                      <ChevronRight className="h-4 w-4" />
                                    )}
                                  </Button>
                                  <div>
                                    <h4 className="font-medium">{section.sectionName}</h4>
                                    {section.sectionDescription && (
                                      <p className="text-sm text-gray-600">{section.sectionDescription}</p>
                                    )}
                                  </div>
                                  <div className="flex gap-2">
                                    <Badge variant="outline">{section.contentsCount} محتوى</Badge>
                                    {!section.isVisible && <Badge variant="secondary">مخفي</Badge>}
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleCreateContent(section.sectionId)}
                                  >
                                    <Plus className="h-4 w-4 mr-2" />
                                    إضافة محتوى
                                  </Button>
                                  <Button variant="ghost" size="sm">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm">
                                    {section.isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                                  </Button>
                                </div>
                              </div>

                              {/* Contents */}
                              {expandedSections.has(section.sectionId) && section.contents && (
                                <div className="ml-8 space-y-2">
                                  {section.contents.map((content) => (
                                    <div
                                      key={content.contentId}
                                      className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                                    >
                                      <div className="flex items-center gap-3">
                                        <GripVertical className="h-4 w-4 text-gray-400" />
                                        {getContentTypeIcon(content.contentType)}
                                        <div>
                                          <span className="font-medium">{content.contentName}</span>
                                          <div className="flex gap-2 mt-1">
                                            <Badge variant={getContentTypeBadge(content.contentType)}>
                                              {content.contentType}
                                            </Badge>
                                            {content.isFree && <Badge variant="outline">مجاني</Badge>}
                                            {!content.isVisible && <Badge variant="secondary">مخفي</Badge>}
                                          </div>
                                        </div>
                                      </div>
                                      <div className="flex gap-2">
                                        <span className="text-sm text-gray-500">
                                          {content.estimatedDurationMinutes} دقيقة
                                        </span>
                                        <Button variant="ghost" size="sm">
                                          <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="sm">
                                          {content.isVisible ? (
                                            <Eye className="h-4 w-4" />
                                          ) : (
                                            <EyeOff className="h-4 w-4" />
                                          )}
                                        </Button>
                                        <Button variant="ghost" size="sm">
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <CreateLevelDialog
        open={showCreateLevel}
        onOpenChange={setShowCreateLevel}
        courseId={courseId}
        onSuccess={handleLevelCreated}
      />

      <CreateSectionDialog
        open={showCreateSection}
        onOpenChange={setShowCreateSection}
        levelId={selectedLevelId}
        onSuccess={handleSectionCreated}
      />

      <CreateContentDialog
        open={showCreateContent}
        onOpenChange={setShowCreateContent}
        sectionId={selectedSectionId}
        onSuccess={handleContentCreated}
      />
    </div>
  )
}
