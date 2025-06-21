export interface Course {
  courseId: number
  courseName: string
  courseImage: string
  coursePrice: number
  isActive: boolean
  createdAt: string
  instructorName: string
  enrollmentCount: number
  averageRating?: number
  reviewCount: number
  levelsCount: number
  sectionsCount: number
  contentsCount: number
}

export interface CourseDetails {
  courseId: number
  courseName: string
  description: string
  courseImage: string
  coursePrice: number
  isActive: boolean
  createdAt: string
  instructorName: string
  instructorId: number
  aboutCourses: AboutCourseItem[]
  courseSkills: string[]
  levels: LevelOverview[]
}

export interface AboutCourseItem {
  aboutCourseId: number
  aboutCourseText: string
  outcomeType: string
}

export interface LevelOverview {
  levelId: number
  levelName: string
  levelOrder: number
  sectionsCount: number
  contentsCount: number
  quizzesCount: number
  isVisible: boolean
}

export interface CreateCourseDto {
  courseName: string
  description: string
  coursePrice: number
  isActive: boolean
  aboutCourseInputs?: AboutCourseInput[]
  courseSkillInputs?: string[]
}

export interface AboutCourseInput {
  aboutCourseId: number
  aboutCourseText: string
  outcomeType: string
}

export interface PublicCourse {
  courseId: number
  courseName: string
  courseDescription: string
  courseImage: string
  price: number
  instructorId: number
  instructorName: string
  instructorImage?: string
  enrollmentCount: number
  averageRating: number
  reviewCount: number
  totalLevels: number
  totalSections: number
  totalContents: number
  estimatedDurationMinutes: number
  courseLevel: string
  createdAt: string
  lastUpdated: string
  trackId?: number
  trackName?: string
  trackDescription?: string
  hasCertificate: boolean
  isFeatured: boolean
  isNew: boolean
  language: string
}

export interface CourseBrowseFilter {
  searchTerm?: string
  trackId?: number
  categoryIds?: number[]
  minPrice?: number
  maxPrice?: number
  isFree?: boolean
  level?: string
  hasCertificate?: boolean
  instructorId?: number
  isFeatured?: boolean
  isNew?: boolean
  minRating?: number
  minDuration?: number
  maxDuration?: number
  sortBy?: string
  pageNumber: number
  pageSize: number
}

export interface PagedResult<T> {
  items: T[]
  totalCount: number
  pageNumber: number
  pageSize: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}
