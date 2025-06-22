import { apiClient } from "./api-client"
import type {
  Level,
  CreateLevelDto,
  UpdateLevelDto,
  Section,
  CreateSectionDto,
  UpdateSectionDto,
  Content,
  CreateContentDto,
  UpdateContentDto,
  Quiz,
  CourseStructure,
} from "@/types/course-content"

class CourseContentApiClient {
  // Course Structure
  async getCourseStructure(courseId: number): Promise<CourseStructure> {
    try {
      const response = await apiClient.get<CourseStructure>(`/Courses/${courseId}/structure`)

      if (response.success && response.data) {
        return response.data
      }

      throw new Error(response.message || "Failed to get course structure")
    } catch (error) {
      console.error("Error getting course structure:", error)
      throw error instanceof Error ? error : new Error("Unknown error occurred")
    }
  }

  // Level Management
  async getCourseLevels(courseId: number): Promise<Level[]> {
    try {
      const response = await apiClient.get<Level[]>(`/Courses/${courseId}/levels`)

      if (response.success && response.data) {
        return response.data
      }

      return []
    } catch (error) {
      console.error("Error getting course levels:", error)
      return []
    }
  }

  async getLevelDetails(levelId: number): Promise<Level> {
    try {
      const response = await apiClient.get<Level>(`/Levels/${levelId}`)

      if (response.success && response.data) {
        return response.data
      }

      throw new Error(response.message || "Level not found")
    } catch (error) {
      console.error("Error getting level details:", error)
      throw error instanceof Error ? error : new Error("Unknown error occurred")
    }
  }

  async createLevel(levelData: CreateLevelDto): Promise<number> {
    try {
      const response = await apiClient.post<number>("/Levels", levelData)

      if (response.success && response.data) {
        return response.data
      }

      throw new Error(response.message || "Failed to create level")
    } catch (error) {
      console.error("Error creating level:", error)
      throw error instanceof Error ? error : new Error("Unknown error occurred")
    }
  }

  async updateLevel(levelId: number, levelData: UpdateLevelDto): Promise<void> {
    try {
      const response = await apiClient.put(`/Levels/${levelId}`, levelData)

      if (!response.success) {
        throw new Error(response.message || "Failed to update level")
      }
    } catch (error) {
      console.error("Error updating level:", error)
      throw error instanceof Error ? error : new Error("Unknown error occurred")
    }
  }

  async deleteLevel(levelId: number): Promise<void> {
    try {
      const response = await apiClient.delete(`/Levels/${levelId}`)

      if (!response.success) {
        throw new Error(response.message || "Failed to delete level")
      }
    } catch (error) {
      console.error("Error deleting level:", error)
      throw error instanceof Error ? error : new Error("Unknown error occurred")
    }
  }

  async reorderLevels(courseId: number, levelOrders: { levelId: number; order: number }[]): Promise<void> {
    try {
      const response = await apiClient.request(`/Courses/${courseId}/levels/reorder`, {
        method: "PATCH",
        body: JSON.stringify(levelOrders),
      })

      if (!response.success) {
        throw new Error(response.message || "Failed to reorder levels")
      }
    } catch (error) {
      console.error("Error reordering levels:", error)
      throw error instanceof Error ? error : new Error("Unknown error occurred")
    }
  }

  // Section Management
  async getLevelSections(levelId: number): Promise<Section[]> {
    try {
      const response = await apiClient.get<Section[]>(`/Levels/${levelId}/sections`)

      if (response.success && response.data) {
        return response.data
      }

      return []
    } catch (error) {
      console.error("Error getting level sections:", error)
      return []
    }
  }

  async getSectionDetails(sectionId: number): Promise<Section> {
    try {
      const response = await apiClient.get<Section>(`/Sections/${sectionId}`)

      if (response.success && response.data) {
        return response.data
      }

      throw new Error(response.message || "Section not found")
    } catch (error) {
      console.error("Error getting section details:", error)
      throw error instanceof Error ? error : new Error("Unknown error occurred")
    }
  }

  async createSection(sectionData: CreateSectionDto): Promise<number> {
    try {
      const response = await apiClient.post<number>("/Sections", sectionData)

      if (response.success && response.data) {
        return response.data
      }

      throw new Error(response.message || "Failed to create section")
    } catch (error) {
      console.error("Error creating section:", error)
      throw error instanceof Error ? error : new Error("Unknown error occurred")
    }
  }

  async updateSection(sectionId: number, sectionData: UpdateSectionDto): Promise<void> {
    try {
      const response = await apiClient.put(`/Sections/${sectionId}`, sectionData)

      if (!response.success) {
        throw new Error(response.message || "Failed to update section")
      }
    } catch (error) {
      console.error("Error updating section:", error)
      throw error instanceof Error ? error : new Error("Unknown error occurred")
    }
  }

  async deleteSection(sectionId: number): Promise<void> {
    try {
      const response = await apiClient.delete(`/Sections/${sectionId}`)

      if (!response.success) {
        throw new Error(response.message || "Failed to delete section")
      }
    } catch (error) {
      console.error("Error deleting section:", error)
      throw error instanceof Error ? error : new Error("Unknown error occurred")
    }
  }

  async reorderSections(levelId: number, sectionOrders: { sectionId: number; order: number }[]): Promise<void> {
    try {
      const response = await apiClient.request(`/Levels/${levelId}/sections/reorder`, {
        method: "PATCH",
        body: JSON.stringify(sectionOrders),
      })

      if (!response.success) {
        throw new Error(response.message || "Failed to reorder sections")
      }
    } catch (error) {
      console.error("Error reordering sections:", error)
      throw error instanceof Error ? error : new Error("Unknown error occurred")
    }
  }

  // Content Management
  async getSectionContents(sectionId: number): Promise<Content[]> {
    try {
      const response = await apiClient.get<Content[]>(`/Sections/${sectionId}/contents`)

      if (response.success && response.data) {
        return response.data
      }

      return []
    } catch (error) {
      console.error("Error getting section contents:", error)
      return []
    }
  }

  async getContentDetails(contentId: number): Promise<Content> {
    try {
      const response = await apiClient.get<Content>(`/Contents/${contentId}`)

      if (response.success && response.data) {
        return response.data
      }

      throw new Error(response.message || "Content not found")
    } catch (error) {
      console.error("Error getting content details:", error)
      throw error instanceof Error ? error : new Error("Unknown error occurred")
    }
  }

  async createContent(contentData: CreateContentDto): Promise<number> {
    try {
      const formData = new FormData()

      // Add basic fields
      formData.append("contentName", contentData.contentName)
      formData.append("contentType", contentData.contentType)
      formData.append("contentOrder", contentData.contentOrder.toString())
      formData.append("isVisible", contentData.isVisible.toString())
      formData.append("isFree", contentData.isFree.toString())
      formData.append("sectionId", contentData.sectionId.toString())
      formData.append("estimatedDurationMinutes", contentData.estimatedDurationMinutes.toString())

      if (contentData.contentDescription) {
        formData.append("contentDescription", contentData.contentDescription)
      }

      if (contentData.videoUrl) {
        formData.append("videoUrl", contentData.videoUrl)
      }

      if (contentData.textContent) {
        formData.append("textContent", contentData.textContent)
      }

      if (contentData.attachmentFile) {
        formData.append("attachmentFile", contentData.attachmentFile)
      }

      const response = await apiClient.request<number>("/Contents", {
        method: "POST",
        body: formData,
        headers: {
          // Remove Content-Type to let browser set it with boundary for FormData
        },
      })

      if (response.success && response.data) {
        return response.data
      }

      throw new Error(response.message || "Failed to create content")
    } catch (error) {
      console.error("Error creating content:", error)
      throw error instanceof Error ? error : new Error("Unknown error occurred")
    }
  }

  async updateContent(contentId: number, contentData: UpdateContentDto): Promise<void> {
    try {
      const response = await apiClient.put(`/Contents/${contentId}`, contentData)

      if (!response.success) {
        throw new Error(response.message || "Failed to update content")
      }
    } catch (error) {
      console.error("Error updating content:", error)
      throw error instanceof Error ? error : new Error("Unknown error occurred")
    }
  }

  async deleteContent(contentId: number): Promise<void> {
    try {
      const response = await apiClient.delete(`/Contents/${contentId}`)

      if (!response.success) {
        throw new Error(response.message || "Failed to delete content")
      }
    } catch (error) {
      console.error("Error deleting content:", error)
      throw error instanceof Error ? error : new Error("Unknown error occurred")
    }
  }

  async reorderContents(sectionId: number, contentOrders: { contentId: number; order: number }[]): Promise<void> {
    try {
      const response = await apiClient.request(`/Sections/${sectionId}/contents/reorder`, {
        method: "PATCH",
        body: JSON.stringify(contentOrders),
      })

      if (!response.success) {
        throw new Error(response.message || "Failed to reorder contents")
      }
    } catch (error) {
      console.error("Error reordering contents:", error)
      throw error instanceof Error ? error : new Error("Unknown error occurred")
    }
  }

  // File Upload
  async uploadVideo(file: File, onProgress?: (progress: number) => void): Promise<string> {
    try {
      const formData = new FormData()
      formData.append("video", file)

      const response = await apiClient.request<{ videoUrl: string }>("/Contents/upload-video", {
        method: "POST",
        body: formData,
        headers: {
          // Remove Content-Type to let browser set it with boundary for FormData
        },
      })

      if (response.success && response.data) {
        return response.data.videoUrl
      }

      throw new Error(response.message || "Failed to upload video")
    } catch (error) {
      console.error("Error uploading video:", error)
      throw error instanceof Error ? error : new Error("Unknown error occurred")
    }
  }

  async uploadAttachment(file: File): Promise<{ url: string; name: string; size: number }> {
    try {
      const formData = new FormData()
      formData.append("attachment", file)

      const response = await apiClient.request<{ url: string; name: string; size: number }>(
        "/Contents/upload-attachment",
        {
          method: "POST",
          body: formData,
          headers: {
            // Remove Content-Type to let browser set it with boundary for FormData
          },
        },
      )

      if (response.success && response.data) {
        return response.data
      }

      throw new Error(response.message || "Failed to upload attachment")
    } catch (error) {
      console.error("Error uploading attachment:", error)
      throw error instanceof Error ? error : new Error("Unknown error occurred")
    }
  }

  // Quiz Management
  async getSectionQuizzes(sectionId: number): Promise<Quiz[]> {
    try {
      const response = await apiClient.get<Quiz[]>(`/Sections/${sectionId}/quizzes`)

      if (response.success && response.data) {
        return response.data
      }

      return []
    } catch (error) {
      console.error("Error getting section quizzes:", error)
      return []
    }
  }

  async getQuizDetails(quizId: number): Promise<Quiz> {
    try {
      const response = await apiClient.get<Quiz>(`/Quizzes/${quizId}`)

      if (response.success && response.data) {
        return response.data
      }

      throw new Error(response.message || "Quiz not found")
    } catch (error) {
      console.error("Error getting quiz details:", error)
      throw error instanceof Error ? error : new Error("Unknown error occurred")
    }
  }
}

export const courseContentApi = new CourseContentApiClient()
