// import { apiClient } from "./api"
// import type {
//   Level,
//   CreateLevelDto,
//   UpdateLevelDto,
//   Section,
//   CreateSectionDto,
//   UpdateSectionDto,
//   Content,
//   CreateContentDto,
//   UpdateContentDto,
//   Quiz,
//   CourseStructure,
// } from "@/types/course-content"

// class CourseContentApiClient {
//   // Course Structure
//   async getCourseStructure(courseId: number): Promise<CourseStructure> {
//     const response = await apiClient.request<CourseStructure>(`/Courses/${courseId}/structure`)

//     if (response.success && response.data) {
//       return response.data
//     }

//     throw new Error(response.message || "Failed to get course structure")
//   }

//   // Level Management
//   async getCourseLevels(courseId: number): Promise<Level[]> {
//     const response = await apiClient.request<Level[]>(`/Courses/${courseId}/levels`)

//     if (response.success && response.data) {
//       return response.data
//     }

//     return []
//   }

//   async getLevelDetails(levelId: number): Promise<Level> {
//     const response = await apiClient.request<Level>(`/Levels/${levelId}`)

//     if (response.success && response.data) {
//       return response.data
//     }

//     throw new Error(response.message || "Level not found")
//   }

//   async createLevel(levelData: CreateLevelDto): Promise<number> {
//     const response = await apiClient.request<number>("/Levels", {
//       method: "POST",
//       body: JSON.stringify(levelData),
//     })

//     if (response.success && response.data) {
//       return response.data
//     }

//     throw new Error(response.message || "Failed to create level")
//   }

//   async updateLevel(levelId: number, levelData: UpdateLevelDto): Promise<void> {
//     const response = await apiClient.request(`/Levels/${levelId}`, {
//       method: "PUT",
//       body: JSON.stringify(levelData),
//     })

//     if (!response.success) {
//       throw new Error(response.message || "Failed to update level")
//     }
//   }

//   async deleteLevel(levelId: number): Promise<void> {
//     const response = await apiClient.request(`/Levels/${levelId}`, {
//       method: "DELETE",
//     })

//     if (!response.success) {
//       throw new Error(response.message || "Failed to delete level")
//     }
//   }

//   async reorderLevels(courseId: number, levelOrders: { levelId: number; order: number }[]): Promise<void> {
//     const response = await apiClient.request(`/Courses/${courseId}/levels/reorder`, {
//       method: "PATCH",
//       body: JSON.stringify(levelOrders),
//     })

//     if (!response.success) {
//       throw new Error(response.message || "Failed to reorder levels")
//     }
//   }

//   // Section Management
//   async getLevelSections(levelId: number): Promise<Section[]> {
//     const response = await apiClient.request<Section[]>(`/Levels/${levelId}/sections`)

//     if (response.success && response.data) {
//       return response.data
//     }

//     return []
//   }

//   async getSectionDetails(sectionId: number): Promise<Section> {
//     const response = await apiClient.request<Section>(`/Sections/${sectionId}`)

//     if (response.success && response.data) {
//       return response.data
//     }

//     throw new Error(response.message || "Section not found")
//   }

//   async createSection(sectionData: CreateSectionDto): Promise<number> {
//     const response = await apiClient.request<number>("/Sections", {
//       method: "POST",
//       body: JSON.stringify(sectionData),
//     })

//     if (response.success && response.data) {
//       return response.data
//     }

//     throw new Error(response.message || "Failed to create section")
//   }

//   async updateSection(sectionId: number, sectionData: UpdateSectionDto): Promise<void> {
//     const response = await apiClient.request(`/Sections/${sectionId}`, {
//       method: "PUT",
//       body: JSON.stringify(sectionData),
//     })

//     if (!response.success) {
//       throw new Error(response.message || "Failed to update section")
//     }
//   }

//   async deleteSection(sectionId: number): Promise<void> {
//     const response = await apiClient.request(`/Sections/${sectionId}`, {
//       method: "DELETE",
//     })

//     if (!response.success) {
//       throw new Error(response.message || "Failed to delete section")
//     }
//   }

//   async reorderSections(levelId: number, sectionOrders: { sectionId: number; order: number }[]): Promise<void> {
//     const response = await apiClient.request(`/Levels/${levelId}/sections/reorder`, {
//       method: "PATCH",
//       body: JSON.stringify(sectionOrders),
//     })

//     if (!response.success) {
//       throw new Error(response.message || "Failed to reorder sections")
//     }
//   }

//   // Content Management
//   async getSectionContents(sectionId: number): Promise<Content[]> {
//     const response = await apiClient.request<Content[]>(`/Sections/${sectionId}/contents`)

//     if (response.success && response.data) {
//       return response.data
//     }

//     return []
//   }

//   async getContentDetails(contentId: number): Promise<Content> {
//     const response = await apiClient.request<Content>(`/Contents/${contentId}`)

//     if (response.success && response.data) {
//       return response.data
//     }

//     throw new Error(response.message || "Content not found")
//   }

//   async createContent(contentData: CreateContentDto): Promise<number> {
//     const formData = new FormData()

//     // Add basic fields
//     formData.append("contentName", contentData.contentName)
//     formData.append("contentType", contentData.contentType)
//     formData.append("contentOrder", contentData.contentOrder.toString())
//     formData.append("isVisible", contentData.isVisible.toString())
//     formData.append("isFree", contentData.isFree.toString())
//     formData.append("sectionId", contentData.sectionId.toString())
//     formData.append("estimatedDurationMinutes", contentData.estimatedDurationMinutes.toString())

//     if (contentData.contentDescription) {
//       formData.append("contentDescription", contentData.contentDescription)
//     }

//     if (contentData.videoUrl) {
//       formData.append("videoUrl", contentData.videoUrl)
//     }

//     if (contentData.textContent) {
//       formData.append("textContent", contentData.textContent)
//     }

//     if (contentData.attachmentFile) {
//       formData.append("attachmentFile", contentData.attachmentFile)
//     }

//     const response = await apiClient.request<number>("/Contents", {
//       method: "POST",
//       body: formData,
//       headers: {
//         // Remove Content-Type to let browser set it with boundary for FormData
//       },
//     })

//     if (response.success && response.data) {
//       return response.data
//     }

//     throw new Error(response.message || "Failed to create content")
//   }

//   async updateContent(contentId: number, contentData: UpdateContentDto): Promise<void> {
//     const response = await apiClient.request(`/Contents/${contentId}`, {
//       method: "PUT",
//       body: JSON.stringify(contentData),
//     })

//     if (!response.success) {
//       throw new Error(response.message || "Failed to update content")
//     }
//   }

//   async deleteContent(contentId: number): Promise<void> {
//     const response = await apiClient.request(`/Contents/${contentId}`, {
//       method: "DELETE",
//     })

//     if (!response.success) {
//       throw new Error(response.message || "Failed to delete content")
//     }
//   }

//   async reorderContents(sectionId: number, contentOrders: { contentId: number; order: number }[]): Promise<void> {
//     const response = await apiClient.request(`/Sections/${sectionId}/contents/reorder`, {
//       method: "PATCH",
//       body: JSON.stringify(contentOrders),
//     })

//     if (!response.success) {
//       throw new Error(response.message || "Failed to reorder contents")
//     }
//   }

//   // File Upload
//   async uploadVideo(file: File, onProgress?: (progress: number) => void): Promise<string> {
//     const formData = new FormData()
//     formData.append("video", file)

//     const response = await apiClient.request<{ videoUrl: string }>("/Contents/upload-video", {
//       method: "POST",
//       body: formData,
//       headers: {
//         // Remove Content-Type to let browser set it with boundary for FormData
//       },
//     })

//     if (response.success && response.data) {
//       return response.data.videoUrl
//     }

//     throw new Error(response.message || "Failed to upload video")
//   }

//   async uploadAttachment(file: File): Promise<{ url: string; name: string; size: number }> {
//     const formData = new FormData()
//     formData.append("attachment", file)

//     const response = await apiClient.request<{ url: string; name: string; size: number }>(
//       "/Contents/upload-attachment",
//       {
//         method: "POST",
//         body: formData,
//         headers: {
//           // Remove Content-Type to let browser set it with boundary for FormData
//         },
//       },
//     )

//     if (response.success && response.data) {
//       return response.data
//     }

//     throw new Error(response.message || "Failed to upload attachment")
//   }

//   // Quiz Management
//   async getSectionQuizzes(sectionId: number): Promise<Quiz[]> {
//     const response = await apiClient.request<Quiz[]>(`/Sections/${sectionId}/quizzes`)

//     if (response.success && response.data) {
//       return response.data
//     }

//     return []
//   }

//   async getQuizDetails(quizId: number): Promise<Quiz> {
//     const response = await apiClient.request<Quiz>(`/Quizzes/${quizId}`)

//     if (response.success && response.data) {
//       return response.data
//     }

//     throw new Error(response.message || "Quiz not found")
//   }
// }

// export const courseContentApi = new CourseContentApiClient()
