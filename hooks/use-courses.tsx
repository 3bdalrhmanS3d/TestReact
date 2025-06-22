"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import { courseApi, type CourseDto, type CourseFilterDto, type CreateCourseDto, type UpdateCourseDto } from "@/lib/course-api"
import { useAuth } from "@/hooks/use-auth"

interface CoursesContextType {
  courses: CourseDto[]
  enrolledCourses: CourseDto[]
  instructorCourses: CourseDto[]
  loading: boolean
  error: string | null
  
  // Actions
  loadCourses: (filter?: Partial<CourseFilterDto>) => Promise<void>
  loadEnrolledCourses: () => Promise<void>
  loadInstructorCourses: () => Promise<void>
  getCourse: (courseId: number) => Promise<CourseDto | null>
  createCourse: (data: CreateCourseDto) => Promise<{ success: boolean; message?: string; courseId?: number }>
  updateCourse: (data: UpdateCourseDto) => Promise<{ success: boolean; message?: string }>
  deleteCourse: (courseId: number) => Promise<{ success: boolean; message?: string }>
  enrollInCourse: (courseId: number) => Promise<{ success: boolean; message?: string }>
  uploadCourseImage: (courseId: number, file: File) => Promise<{ success: boolean; message?: string; imageUrl?: string }>
}

const CoursesContext = createContext<CoursesContextType | undefined>(undefined)

export function CoursesProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, user } = useAuth()
  const [courses, setCourses] = useState<CourseDto[]>([])
  const [enrolledCourses, setEnrolledCourses] = useState<CourseDto[]>([])
  const [instructorCourses, setInstructorCourses] = useState<CourseDto[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadCourses = useCallback(async (filter?: Partial<CourseFilterDto>) => {
    if (!isAuthenticated) return

    try {
      setLoading(true)
      setError(null)

      const defaultFilter: CourseFilterDto = {
        pageNumber: 1,
        pageSize: 50,
        isActive: true,
        sortBy: 'created',
        sortDirection: 'desc',
        ...filter,
      }

      console.log("📚 Loading courses with filter:", defaultFilter)
      const response = await courseApi.getCourses(defaultFilter)

      if (response.success && response.data) {
        console.log("✅ Courses loaded:", response.data.courses.length)
        setCourses(response.data.courses)
      } else {
        console.log("❌ Failed to load courses:", response.message)
        setError(response.message || "فشل في تحميل الكورسات")
      }
    } catch (err: any) {
      console.error("🚨 Error loading courses:", err)
      setError("حدث خطأ أثناء تحميل الكورسات")
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated])

  const loadEnrolledCourses = useCallback(async () => {
    if (!isAuthenticated) return

    try {
      setLoading(true)
      setError(null)

      console.log("📚 Loading enrolled courses...")
      const response = await courseApi.getEnrolledCourses()

      if (response.success && response.data) {
        console.log("✅ Enrolled courses loaded:", response.data.length)
        setEnrolledCourses(response.data)
      } else {
        console.log("❌ Failed to load enrolled courses:", response.message)
        setError(response.message || "فشل في تحميل الكورسات المسجل بها")
      }
    } catch (err: any) {
      console.error("🚨 Error loading enrolled courses:", err)
      setError("حدث خطأ أثناء تحميل الكورسات المسجل بها")
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated])

  const loadInstructorCourses = useCallback(async () => {
    if (!isAuthenticated || (user?.role !== "Instructor" && user?.role !== "Admin")) return

    try {
      setLoading(true)
      setError(null)

      console.log("👨‍🏫 Loading instructor courses...")
      const response = await courseApi.getInstructorCourses()

      if (response.success && response.data) {
        console.log("✅ Instructor courses loaded:", response.data.length)
        setInstructorCourses(response.data)
      } else {
        console.log("❌ Failed to load instructor courses:", response.message)
        setError(response.message || "فشل في تحميل كورسات المدرب")
      }
    } catch (err: any) {
      console.error("🚨 Error loading instructor courses:", err)
      setError("حدث خطأ أثناء تحميل كورسات المدرب")
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, user?.role])

  const getCourse = useCallback(async (courseId: number): Promise<CourseDto | null> => {
    if (!isAuthenticated) return null

    try {
      console.log("📖 Loading course:", courseId)
      const response = await courseApi.getCourse(courseId)

      if (response.success && response.data) {
        console.log("✅ Course loaded:", response.data.courseName)
        return response.data
      } else {
        console.log("❌ Failed to load course:", response.message)
        setError(response.message || "فشل في تحميل الكورس")
        return null
      }
    } catch (err: any) {
      console.error("🚨 Error loading course:", err)
      setError("حدث خطأ أثناء تحميل الكورس")
      return null
    }
  }, [isAuthenticated])

  const createCourse = useCallback(async (data: CreateCourseDto): Promise<{ success: boolean; message?: string; courseId?: number }> => {
    if (!isAuthenticated || (user?.role !== "Instructor" && user?.role !== "Admin")) {
      return { success: false, message: "غير مصرح لك بإنشاء الكورسات" }
    }

    try {
      console.log("➕ Creating course:", data.courseName)
      const response = await courseApi.createCourse(data)

      if (response.success && response.data) {
        console.log("✅ Course created successfully:", response.data.courseId)
        
        // Add to instructor courses list
        setInstructorCourses(prevCourses => {
          const newCourse = response.data as CourseDto
          return [newCourse, ...prevCourses]
        }) 
               
        return { 
          success: true, 
          message: response.message || "تم إنشاء الكورس بنجاح",
          courseId: response.data.courseId
        }
      } else {
        console.log("❌ Failed to create course:", response.message)
        return { success: false, message: response.message || "فشل في إنشاء الكورس" }
      }
    } catch (err: any) {
      console.error("🚨 Error creating course:", err)
      return { success: false, message: "حدث خطأ أثناء إنشاء الكورس" }
    }
  }, [isAuthenticated, user?.role])

  const updateCourse = useCallback(async (data: UpdateCourseDto): Promise<{ success: boolean; message?: string }> => {
    if (!isAuthenticated || (user?.role !== "Instructor" && user?.role !== "Admin")) {
      return { success: false, message: "غير مصرح لك بتحديث الكورسات" }
    }

    try {
      console.log("✏️ Updating course:", data.courseId)
      const response = await courseApi.updateCourse(data)

      if (response.success && response.data) {
        console.log("✅ Course updated successfully")
        
        const updatedCourse = response.data
        
        // Update in instructor courses list
        setInstructorCourses(prev => 
          prev.map(course => 
            course.courseId === data.courseId ? updatedCourse : course
          )
        )
        
        // Update in general courses list if exists
        setCourses(prev => 
          prev.map(course => 
            course.courseId === data.courseId ? updatedCourse : course
          )
        )
        
        return { success: true, message: response.message || "تم تحديث الكورس بنجاح" }
      } else {
        console.log("❌ Failed to update course:", response.message)
        return { success: false, message: response.message || "فشل في تحديث الكورس" }
      }
    } catch (err: any) {
      console.error("🚨 Error updating course:", err)
      return { success: false, message: "حدث خطأ أثناء تحديث الكورس" }
    }
  }, [isAuthenticated, user?.role])

  const deleteCourse = useCallback(async (courseId: number): Promise<{ success: boolean; message?: string }> => {
    if (!isAuthenticated || (user?.role !== "Instructor" && user?.role !== "Admin")) {
      return { success: false, message: "غير مصرح لك بحذف الكورسات" }
    }

    try {
      console.log("🗑️ Deleting course:", courseId)
      const response = await courseApi.deleteCourse(courseId)

      if (response.success) {
        console.log("✅ Course deleted successfully")
        
        // Remove from instructor courses list
        setInstructorCourses(prev => prev.filter(course => course.courseId !== courseId))
        
        // Remove from general courses list
        setCourses(prev => prev.filter(course => course.courseId !== courseId))
        
        return { success: true, message: response.message || "تم حذف الكورس بنجاح" }
      } else {
        console.log("❌ Failed to delete course:", response.message)
        return { success: false, message: response.message || "فشل في حذف الكورس" }
      }
    } catch (err: any) {
      console.error("🚨 Error deleting course:", err)
      return { success: false, message: "حدث خطأ أثناء حذف الكورس" }
    }
  }, [isAuthenticated, user?.role])

  const enrollInCourse = useCallback(async (courseId: number): Promise<{ success: boolean; message?: string }> => {
    if (!isAuthenticated) {
      return { success: false, message: "يجب تسجيل الدخول أولاً" }
    }

    try {
      console.log("📝 Enrolling in course:", courseId)
      const response = await courseApi.enrollInCourse(courseId)

      if (response.success) {
        console.log("✅ Enrolled in course successfully")
        
        // Reload enrolled courses
        await loadEnrolledCourses()
        
        return { success: true, message: response.message || "تم التسجيل في الكورس بنجاح" }
      } else {
        console.log("❌ Failed to enroll in course:", response.message)
        return { success: false, message: response.message || "فشل في التسجيل في الكورس" }
      }
    } catch (err: any) {
      console.error("🚨 Error enrolling in course:", err)
      return { success: false, message: "حدث خطأ أثناء التسجيل في الكورس" }
    }
  }, [isAuthenticated, loadEnrolledCourses])

  const uploadCourseImage = useCallback(async (courseId: number, file: File): Promise<{ success: boolean; message?: string; imageUrl?: string }> => {
    if (!isAuthenticated || (user?.role !== "Instructor" && user?.role !== "Admin")) {
      return { success: false, message: "غير مصرح لك برفع صور الكورسات" }
    }

    try {
      console.log("📸 Uploading course image for:", courseId)
      const response = await courseApi.uploadCourseImage(courseId, file)

      if (response.success && response.data) {
        console.log("✅ Course image uploaded successfully")
        
        // Update course image in lists
        const newImageUrl = response.data.courseImage
          if (newImageUrl) {
            const updateImage = (course: CourseDto): CourseDto => 
              course.courseId === courseId 
                ? { ...course, courseImage: newImageUrl }
                : course

            setInstructorCourses(prev => prev.map(updateImage))
            setCourses(prev => prev.map(updateImage))
          }

        
        return { 
          success: true, 
          message: response.message || "تم رفع صورة الكورس بنجاح",
          imageUrl: response.data.courseImage
        }
      } else {
        console.log("❌ Failed to upload course image:", response.message)
        return { success: false, message: response.message || "فشل في رفع صورة الكورس" }
      }
    } catch (err: any) {
      console.error("🚨 Error uploading course image:", err)
      return { success: false, message: "حدث خطأ أثناء رفع صورة الكورس" }
    }
  }, [isAuthenticated, user?.role])

  return (
    <CoursesContext.Provider
      value={{
        courses,
        enrolledCourses,
        instructorCourses,
        loading,
        error,
        loadCourses,
        loadEnrolledCourses,
        loadInstructorCourses,
        getCourse,
        createCourse,
        updateCourse,
        deleteCourse,
        enrollInCourse,
        uploadCourseImage,
      }}
    >
      {children}
    </CoursesContext.Provider>
  )
}

export function useCourses() {
  const context = useContext(CoursesContext)
  if (context === undefined) {
    throw new Error("useCourses must be used within a CoursesProvider")
  }
  return context
}
