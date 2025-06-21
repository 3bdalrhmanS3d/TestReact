// Auth Types based on backend DTOs
export interface SignupRequestDto {
  firstName: string
  lastName: string
  emailAddress: string
  password: string
  userConfPassword: string
}

export interface SigninRequestDto {
  email: string
  password: string
  rememberMe: boolean
}

export interface VerifyAccountRequestDto {
  verificationCode: string
}

export interface ForgetPasswordRequestDto {
  email: string
}

export interface ResetPasswordRequestDto {
  email: string
  code: string
  newPassword: string
}

export interface RefreshTokenRequestDto {
  oldRefreshToken: string
}

export interface AutoLoginRequestDto {
  autoLoginToken: string
}

// Response DTOs
export interface SigninResponseDto {
  token: string
  expiration: string
  role: string
  refreshToken: string
  userId: number
  autoLoginToken?: string
}

export interface RefreshTokenResponseDto {
  token: string
  expiration: string
  refreshToken: string
  userId: number
}

export interface AutoLoginResponseDto {
  token: string
  expiration: string
  role: string
  refreshToken: string
  userId: number
  fullName: string
  emailAddress: string
}

// Auth Response Wrapper
export interface SecureAuthResponse<T = any> {
  success: boolean
  message: string
  data?: T
  errorCode?: string
  timestamp: string
  requestId: string
  statusCode?: number
  errors?: any
}

// AuthUser interface for our app
export interface AuthUser {
  id: number
  userId: number
  email: string
  emailAddress: string
  name?: string
  fullName?: string
  role: string
  profilePhoto?: string
}

// Profile Types
export interface UserProgressDto {
  courseId: number
  courseName: string
  currentLevelId: number
  currentSectionId: number
  lastUpdated: string
}

export interface UserProfileDto {
  id: number
  fullName: string
  emailAddress: string
  role: string
  profilePhoto: string
  createdAt: string
  birthDate?: string
  edu?: string
  national?: string
  progress: UserProgressDto[]
}

export interface UserProfileUpdateDto {
  birthDate: string
  edu: string
  national: string
}

export interface ChangeUserNameDto {
  newFullName: string
  changeReason?: string
}

export interface ChangePasswordDto {
  currentPassword: string
  newPassword: string
  confirmPassword: string
  changeReason?: string
}

export interface ChangeUserNameResultDto {
  success: boolean
  newFullName: string
  requiresTokenRefresh: boolean
  changedAt: string
}

// Profile Completion Error Structure
export interface ProfileCompletionError {
  requiredFields: {
    BirthDate?: string
    Education?: string
    Nationality?: string
  }
  profileCompletionUrl: string
}

// Payment Types
export interface PaymentRequestDto {
  courseId: number
  amount: number
  transactionId: string
  paymentMethod: string
}

// Course Types
export interface MyCourseDto {
  courseId: number
  courseName: string
  description: string
  courseImage: string
  coursePrice: number
  instructorName: string
  enrollmentDate: string
  progress: number
  isCompleted: boolean
  lastAccessed?: string
}

export interface CourseDto {
  courseId: number
  courseName: string
  description: string
  courseImage: string
  coursePrice: number
  instructorName: string
  averageRating: number
  reviewCount: number
  enrollmentCount: number
  isActive: boolean
  createdAt: string
}

// User Activity
export interface UserActivityDto {
  activityType: string
  description: string
  timestamp: string
  ipAddress?: string
  userAgent?: string
  timeAgo: string
  activityIcon: string
  formattedTimestamp: string
}

// Stats
export interface StudentStatsDto {
  sharedCourses: number
  completedSections: number
  progress: Array<{
    courseId: number
    progressPercentage: number
  }>
}

// API Response interface
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  errorCode?: string
  errors?: any
  statusCode?: number
}
