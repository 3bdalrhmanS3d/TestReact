// Notification Types based on backend DTOs
export interface NotificationDto {
  notificationId: number
  userId: number
  title: string
  message: string
  type: string
  isRead: boolean
  createdAt: string
  readAt?: string
  courseId?: number
  courseName?: string
  contentId?: number
  contentTitle?: string
  achievementId?: number
  achievementName?: string
  actionUrl?: string
  icon?: string
  priority: string
  timeAgo: string
}

export interface CreateNotificationDto {
  userId: number
  title: string
  message: string
  type: string
  courseId?: number
  contentId?: number
  achievementId?: number
  actionUrl?: string
  icon?: string
  priority: string
}

export interface BulkCreateNotificationDto {
  userIds: number[]
  title: string
  message: string
  type: string
  courseId?: number
  contentId?: number
  achievementId?: number
  actionUrl?: string
  icon?: string
  priority: string
}

export interface MarkNotificationsReadDto {
  notificationIds: number[]
}

export interface NotificationFilterDto {
  pageNumber: number
  pageSize: number
  isRead?: boolean
  type?: string
  priority?: string
  fromDate?: string
  toDate?: string
  courseId?: number
}

export interface NotificationStatsDto {
  totalNotifications: number
  unreadCount: number
  highPriorityUnread: number
  todayCount: number
  weekCount: number
  typeCounts: Record<string, number>
  priorityCounts: Record<string, number>
}

export interface NotificationPagedResponseDto {
  notifications: NotificationDto[]
  totalCount: number
  currentPage: number
  pageSize: number
  totalPages: number
  hasNext: boolean
  hasPrevious: boolean
  stats: NotificationStatsDto
}

export interface NotificationPreferencesDto {
  userId: number
  emailNotifications: boolean
  pushNotifications: boolean
  courseUpdateNotifications: boolean
  achievementNotifications: boolean
  reminderNotifications: boolean
  marketingNotifications: boolean
  quietHoursStart?: string
  quietHoursEnd?: string
}

export interface RealTimeNotificationDto {
  event: string
  notification: NotificationDto
  stats: NotificationStatsDto
  timestamp: string
}
