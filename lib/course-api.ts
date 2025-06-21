import { apiClient } from "./api"
import type {
  Course,
  CourseDetails,
  CreateCourseDto,
  PublicCourse,
  CourseBrowseFilter,
  PagedResult,
} from "@/types/course"

class CourseApiClient {
  // Public browsing methods
  async browseCourses(filter: CourseBrowseFilter): Promise<PagedResult<PublicCourse>> {
    const response = await apiClient.request<PagedResult<PublicCourse>>("/Courses/browse", {
      method: "POST",
      body: JSON.stringify(filter),
    })

    if (response.success && response.data) {
      return response.data
    }

    throw new Error(response.message || "Failed to browse courses")
  }

  async getFeaturedCourses(limit = 6): Promise<PublicCourse[]> {
    const response = await apiClient.request<PublicCourse[]>(`/Courses/featured?limit=${limit}`)

    if (response.success && response.data) {
      return response.data
    }

    return []
  }

  async getPopularCourses(limit = 6): Promise<PublicCourse[]> {
    const response = await apiClient.request<PublicCourse[]>(`/Courses/popular?limit=${limit}`)

    if (response.success && response.data) {
      return response.data
    }

    return []
  }

  async getPublicCourseDetails(courseId: number): Promise<any> {
    const response = await apiClient.request(`/Courses/${courseId}/public`)

    if (response.success && response.data) {
      return response.data
    }

    throw new Error(response.message || "Course not found")
  }

  // Instructor methods
  async getMyCoursesAsInstructor(pageNumber = 1, pageSize = 10): Promise<Course[]> {
    const response = await apiClient.request<Course[]>(
      `/Courses/instructor/my-courses?pageNumber=${pageNumber}&pageSize=${pageSize}`,
    )

    if (response.success && response.data) {
      return response.data
    }

    return []
  }

  async getCourseDetails(courseId: number): Promise<CourseDetails> {
    const response = await apiClient.request<CourseDetails>(`/Courses/${courseId}/details`)

    if (response.success && response.data) {
      return response.data
    }

    throw new Error(response.message || "Course not found")
  }

  async createCourse(courseData: CreateCourseDto, imageFile?: File): Promise<number> {
    const formData = new FormData()
    formData.append("courseName", courseData.courseName)
    formData.append("description", courseData.description)
    formData.append("coursePrice", courseData.coursePrice.toString())
    formData.append("isActive", courseData.isActive.toString())

    if (courseData.aboutCourseInputs) {
      courseData.aboutCourseInputs.forEach((about, index) => {
        formData.append(`aboutCourseInputs[${index}].aboutCourseText`, about.aboutCourseText)
        formData.append(`aboutCourseInputs[${index}].outcomeType`, about.outcomeType)
      })
    }

    if (courseData.courseSkillInputs) {
      courseData.courseSkillInputs.forEach((skill, index) => {
        formData.append(`courseSkillInputs[${index}]`, skill)
      })
    }

    if (imageFile) {
      formData.append("courseImage", imageFile)
    }

    const response = await apiClient.request<number>("/Courses", {
      method: "POST",
      body: formData,
      headers: {
        // Remove Content-Type to let browser set it with boundary for FormData
      },
    })

    if (response.success && response.data) {
      return response.data
    }

    throw new Error(response.message || "Failed to create course")
  }

  async updateCourse(courseId: number, courseData: Partial<CreateCourseDto>): Promise<void> {
    const response = await apiClient.request(`/Courses/${courseId}`, {
      method: "PUT",
      body: JSON.stringify(courseData),
    })

    if (!response.success) {
      throw new Error(response.message || "Failed to update course")
    }
  }

  async deleteCourse(courseId: number): Promise<void> {
    const response = await apiClient.request(`/Courses/${courseId}`, {
      method: "DELETE",
    })

    if (!response.success) {
      throw new Error(response.message || "Failed to delete course")
    }
  }

  async toggleCourseStatus(courseId: number): Promise<void> {
    const response = await apiClient.request(`/Courses/${courseId}/toggle-status`, {
      method: "PATCH",
    })

    if (!response.success) {
      throw new Error(response.message || "Failed to toggle course status")
    }
  }

  // Admin methods
  async getAllCoursesForAdmin(
    pageNumber = 1,
    pageSize = 10,
    searchTerm?: string,
    isActive?: boolean,
  ): Promise<Course[]> {
    const params = new URLSearchParams({
      pageNumber: pageNumber.toString(),
      pageSize: pageSize.toString(),
    })

    if (searchTerm) params.append("searchTerm", searchTerm)
    if (isActive !== undefined) params.append("isActive", isActive.toString())

    const response = await apiClient.request<Course[]>(`/Courses/admin/all?${params}`)

    if (response.success && response.data) {
      return response.data
    }

    return []
  }

  async transferCourseOwnership(courseId: number, newInstructorId: number): Promise<void> {
    const response = await apiClient.request(`/Courses/${courseId}/transfer-ownership`, {
      method: "PATCH",
      body: JSON.stringify({ newInstructorId }),
    })

    if (!response.success) {
      throw new Error(response.message || "Failed to transfer course ownership")
    }
  }

  // Shared methods
  async uploadCourseImage(courseId: number, file: File): Promise<string> {
    const formData = new FormData()
    formData.append("file", file)

    const response = await apiClient.request<string>(`/Courses/${courseId}/upload-image`, {
      method: "POST",
      body: formData,
      headers: {
        // Remove Content-Type to let browser set it with boundary for FormData
      },
    })

    if (response.success && response.data) {
      return response.data
    }

    throw new Error(response.message || "Failed to upload image")
  }

  async getAvailableSkills(
    searchTerm?: string,
    pageNumber = 1,
    pageSize = 50,
  ): Promise<{ skills: string[]; totalCount: number }> {
    const params = new URLSearchParams({
      pageNumber: pageNumber.toString(),
      pageSize: pageSize.toString(),
    })

    if (searchTerm) params.append("searchTerm", searchTerm)

    const response = await apiClient.request<{ skills: string[]; totalCount: number }>(`/Courses/skills?${params}`)

    if (response.success && response.data) {
      return response.data
    }

    return { skills: [], totalCount: 0 }
  }
}

export const courseApi = new CourseApiClient()
