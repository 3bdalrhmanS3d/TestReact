// Level Types
export interface Level {
  levelId: number
  levelName: string
  levelDescription?: string
  levelOrder: number
  isVisible: boolean
  courseId: number
  courseName?: string
  sectionsCount: number
  contentsCount: number
  quizzesCount: number
  estimatedDurationMinutes: number
  createdAt: string
  sections?: Section[]
}

export interface CreateLevelDto {
  levelName: string
  levelDescription?: string
  levelOrder: number
  isVisible: boolean
  courseId: number
}

export interface UpdateLevelDto {
  levelName?: string
  levelDescription?: string
  levelOrder?: number
  isVisible?: boolean
}

// Section Types
export interface Section {
  sectionId: number
  sectionName: string
  sectionDescription?: string
  sectionOrder: number
  isVisible: boolean
  levelId: number
  levelName?: string
  contentsCount: number
  quizzesCount: number
  estimatedDurationMinutes: number
  createdAt: string
  contents?: Content[]
}

export interface CreateSectionDto {
  sectionName: string
  sectionDescription?: string
  sectionOrder: number
  isVisible: boolean
  levelId: number
}

export interface UpdateSectionDto {
  sectionName?: string
  sectionDescription?: string
  sectionOrder?: number
  isVisible?: boolean
}

// Content Types
export interface Content {
  contentId: number
  contentName: string
  contentDescription?: string
  contentType: ContentType
  contentOrder: number
  isVisible: boolean
  isFree: boolean
  sectionId: number
  sectionName?: string
  estimatedDurationMinutes: number
  createdAt: string

  // Content-specific data
  videoUrl?: string
  videoThumbnail?: string
  videoDurationSeconds?: number
  textContent?: string
  attachmentUrl?: string
  attachmentName?: string
  attachmentSize?: number
}

export interface CreateContentDto {
  contentName: string
  contentDescription?: string
  contentType: ContentType
  contentOrder: number
  isVisible: boolean
  isFree: boolean
  sectionId: number
  estimatedDurationMinutes: number

  // Content-specific data
  videoUrl?: string
  textContent?: string
  attachmentFile?: File
}

export interface UpdateContentDto {
  contentName?: string
  contentDescription?: string
  contentType?: ContentType
  contentOrder?: number
  isVisible?: boolean
  isFree?: boolean
  estimatedDurationMinutes?: number
  videoUrl?: string
  textContent?: string
}

export enum ContentType {
  Video = "Video",
  Text = "Text",
  Attachment = "Attachment",
  Quiz = "Quiz",
  Assignment = "Assignment",
}

// Quiz Types
export interface Quiz {
  quizId: number
  quizName: string
  quizDescription?: string
  sectionId: number
  sectionName?: string
  questionsCount: number
  timeLimit?: number
  passingScore: number
  maxAttempts: number
  isVisible: boolean
  createdAt: string
  questions?: QuizQuestion[]
}

export interface QuizQuestion {
  questionId: number
  questionText: string
  questionType: QuestionType
  questionOrder: number
  points: number
  options?: QuizOption[]
  correctAnswer?: string
}

export interface QuizOption {
  optionId: number
  optionText: string
  isCorrect: boolean
}

export enum QuestionType {
  MultipleChoice = "MultipleChoice",
  TrueFalse = "TrueFalse",
  ShortAnswer = "ShortAnswer",
  Essay = "Essay",
}

// Course Structure
export interface CourseStructure {
  courseId: number
  courseName: string
  levels: Level[]
  totalLevels: number
  totalSections: number
  totalContents: number
  totalQuizzes: number
  estimatedDurationMinutes: number
}
