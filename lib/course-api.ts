import type { SecureAuthResponse } from "@/types/auth"

// Course Types
export interface CourseDto {
  courseId: number
  courseName: string
  description: string
  coursePrice: number
  isActive: boolean
  instructorId: number
  instructorName: string
  courseImage?: string
  createdAt: string
  updatedAt: string
  enrollmentCount: number
  averageRating?: number
  totalRatings: number
  isEnrolled?: boolean
  enrollmentDate?: string
  progress?: CourseProgressDto
  aboutCourse: AboutCourseDto[]
  courseSkills: CourseSkillDto[]
}

export interface CourseProgressDto {
  courseId: number
  userId: number
  currentLevelId?: number
  currentSectionId?: number
  completedLevels: number
  totalLevels: number
  completedSections: number
  totalSections: number
  progressPercentage: number
  lastAccessedAt: string
}

export interface AboutCourseDto {
  aboutCourseId: number
  text: string
  type: string
}

export interface CourseSkillDto {
  courseSkillId: number
  skillName: string
}

export interface CreateCourseDto {
  courseName: string
  description: string
  coursePrice: number
  isActive: boolean
  aboutCourseInputs: AboutCourseInput[]
  courseSkillInputs: CourseSkillInput[]
}

export interface AboutCourseInput {
  text: string
  type: string
}

export interface CourseSkillInput {
  skillName: string
}

export interface UpdateCourseDto extends Partial<CreateCourseDto> {
  courseId: number
}

export interface CourseLevelDto {
  levelId: number
  levelName: string
  levelOrder: number
  isUnlocked: boolean
  sections: CourseSectionDto[]
}

export interface CourseSectionDto {
  sectionId: number
  sectionName: string
  sectionOrder: number
  isCompleted: boolean
  contents: CourseContentDto[]
}

export interface CourseContentDto {
  contentId: number
  title: string
  description?: string
  contentType: string
  contentUrl?: string
  duration?: number
  isCompleted: boolean
  order: number
}

export interface EnrollmentDto {
  courseId: number
  enrollmentDate: string
  isActive: boolean
}

export interface CourseFilterDto {
  pageNumber: number
  pageSize: number
  searchTerm?: string
  instructorId?: number
  isActive?: boolean
  minPrice?: number
  maxPrice?: number
  sortBy?: "name" | "price" | "rating" | "created"
  sortDirection?: "asc" | "desc"
}

export interface CoursePagedResponseDto {
  courses: CourseDto[]
  totalCount: number
  currentPage: number
  pageSize: number
  totalPages: number
  hasNext: boolean
  hasPrevious: boolean
}

// API Endpoint - local only
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7217/api"

class CourseApiClient {
  private baseUrl: string = API_BASE_URL

  private async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<SecureAuthResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`
      console.log(`📚 Courses API Request: ${options.method || "GET"} ${url}`)

      // Get token from localStorage
      const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null

      const defaultHeaders: HeadersInit = {
        "Content-Type": "application/json",
        Accept: "application/json",
      }

      if (token) {
        defaultHeaders.Authorization = `Bearer ${token}`
      }

      const config: RequestInit = {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
        signal: AbortSignal.timeout(10000),
      }

      const response = await fetch(url, config)
      console.log(`📡 Courses Response Status: ${response.status}`)

      let data: SecureAuthResponse<T>
      const contentType = response.headers.get("content-type")

      if (contentType?.includes("application/json")) {
        data = await response.json()
      } else {
        const text = await response.text()
        data = {
          success: response.ok,
          message: text || response.statusText,
          timestamp: new Date().toISOString(),
          requestId: Math.random().toString(36).substr(2, 8),
          statusCode: response.status,
        }
      }

      console.log(`📋 Courses Response Data:`, data)

      return {
        ...data,
        statusCode: response.status,
      }
    } catch (err: any) {
      console.error("🚨 Courses API Request Error:", err)

      if (err.name === "AbortError") {
        return {
          success: false,
          message: "انتهت مهلة الطلب.",
          timestamp: new Date().toISOString(),
          requestId: Math.random().toString(36).substr(2, 8),
        }
      }

      return {
        success: false,
        message: "حدث خطأ في الشبكة أثناء تحميل الكورسات.",
        timestamp: new Date().toISOString(),
        requestId: Math.random().toString(36).substr(2, 8),
      }
    }
  }

  // Get all courses with pagination and filters
  async getCourses(filter: CourseFilterDto): Promise<SecureAuthResponse<CoursePagedResponseDto>> {
    console.log("📚 Fetching courses with filter:", filter)

    const params = new URLSearchParams()
    params.append("pageNumber", filter.pageNumber.toString())
    params.append("pageSize", filter.pageSize.toString())

    if (filter.searchTerm) params.append("searchTerm", filter.searchTerm)
    if (filter.instructorId) params.append("instructorId", filter.instructorId.toString())
    if (filter.isActive !== undefined) params.append("isActive", filter.isActive.toString())
    if (filter.minPrice !== undefined) params.append("minPrice", filter.minPrice.toString())
    if (filter.maxPrice !== undefined) params.append("maxPrice", filter.maxPrice.toString())
    if (filter.sortBy) params.append("sortBy", filter.sortBy)
    if (filter.sortDirection)
      params.append("sortDirection)\
    return this.request<CoursePagedResponseDto>(`/Courses/get-courses?${params}`, {
      method: "GET",
  }
  )
}

// Get user\'s enrolled courses\
async
getEnrolledCourses()
: Promise<SecureAuthResponse<CourseDto[]>>
{
  \
    console.log("📚 Fetching enrolled courses...")
  return this.request<CourseDto[]>("/Courses/enrolled-courses", {
      method: "GET",
    })
}

// Get instructor's courses\
async
getInstructorCourses()
: Promise<SecureAuthResponse<CourseDto[]>>
{
  \
    console.log("👨‍🏫 Fetching instructor courses...")
  return this.request<CourseDto[]>("/Courses/instructor-courses", {
      method: "GET",
    })
}

// Get course by ID\
async
getCourse(courseId: number)
: Promise<SecureAuthResponse<CourseDto>>
{
  \
    console.log(\"📖 Fetching course:", courseId)
  return this.request<CourseDto>(`/Courses/get-course/${courseId}`, {
      method: "GET",
    })
}

// Create new course (Instructor/Admin only)\
async
createCourse(data: CreateCourseDto)
: Promise<SecureAuthResponse<CourseDto>>
{
  \
    console.log(\"➕ Creating course:", data.courseName)
  return this.request<CourseDto>("/Courses/create-course", {
      method: "POST",
      body: JSON.stringify(data),
    })
}

// Update course (Instructor/Admin only)\
async
updateCourse(data: UpdateCourseDto)
: Promise<SecureAuthResponse<CourseDto>>
{
  \
    console.log(\"✏️ Updating course:", data.courseId)
  return this.request<CourseDto>("/Courses/update-course", {
      method: "PUT",
      body: JSON.stringify(data),
    })
}

// Delete course (Instructor/Admin only)
async
deleteCourse(courseId: number)
: Promise<SecureAuthResponse>
{
  \
    console.log(\"🗑️ Deleting course:\", courseId)
  return this.request(\`/Courses/delete-course/${courseId}`, {
      method: "DELETE",
    })
}

// Enroll in course\
async
enrollInCourse(courseId: number)
: Promise<SecureAuthResponse<EnrollmentDto>>
{
  console.log(\"📝 Enrolling in course:", courseId)
  \
  return this.request<EnrollmentDto>("/Courses/enroll", {
      method: "POST",
      body: JSON.stringify({ courseId }),
    })
}

// Get course structure (levels, sections, content)\
async
getCourseStructure(courseId: number)
: Promise<SecureAuthResponse<CourseLevelDto[]>>
{
  console.log(\"🏗️ Fetching course structure:", courseId)
  \
  return this.request<CourseLevelDto[]>(`/Courses/structure/${courseId}`, {
      method: "GET",
    })
}

// Get course progress\
async
getCourseProgress(courseId: number)
: Promise<SecureAuthResponse<CourseProgressDto>>
{
  console.log(\"📊 Fetching course progress:", courseId)
  \
  return this.request<CourseProgressDto>(`/Courses/progress/${courseId}`, {
      method: "GET",
    })
}

// Upload course image\
async
uploadCourseImage(courseId: number, file: File)
: Promise<SecureAuthResponse<
{
  courseImage: string
}
>>
{
  \
  try {
    const url = `${this.baseUrl}/Courses/upload-image/${courseId}`
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null

    const formData = new FormData()
    formData.append("courseImage", file)

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: formData,
      signal: AbortSignal.timeout(10000),
    })

    console.log(`📡 Course Image Upload Response Status: ${response.status}`)

    let data: SecureAuthResponse<{ courseImage: string }>
    const contentType = response.headers.get("content-type")

    if (contentType?.includes("application/json")) {
      data = await response.json()
    } else {
      const text = await response.text()
      data = {
        success: response.ok,
        message: text || response.statusText,
        timestamp: new Date().toISOString(),
        requestId: Math.random().toString(36).substr(2, 8),
        statusCode: response.status,
      }
    }

    console.log(`📋 Course Image Upload Response:`, data)
    return data
  } catch (err: any) {
    console.error("🚨 Course Image Upload Error:", err)
    return {
        success: false,
        message: "حدث خطأ أثناء رفع صورة الكورس",
        timestamp: new Date().toISOString(),
        requestId: Math.random().toString(36).substr(2, 8),
      }
  }
}

// Get course statistics (for instructors)
async
getCourseStats(courseId: number)
: Promise<SecureAuthResponse<any>>
{
  console.log("📈 Fetching course stats:", courseId)
  return this.request(`/Courses/stats/${courseId}`, {
      method: "GET",
    })
}

async
testConnection()
: Promise<boolean>
{
  try {
    const response = await fetch(`${this.baseUrl}/health`, {
      method: "GET",
      signal: AbortSignal.timeout(5000),
    })
    return response.ok
  } catch {
    return false
  }
}
}

export const courseApi = new CourseApiClient()
