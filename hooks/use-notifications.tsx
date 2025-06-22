"use client"

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react"
import { notificationApi } from "@/lib/notification-api"
import { useAuth } from "@/hooks/use-auth"
import type {
  NotificationDto,
  NotificationFilterDto,
  NotificationStatsDto,
  NotificationPreferencesDto,
  RealTimeNotificationDto,
} from "@/types/notifications"

interface NotificationsContextType {
  notifications: NotificationDto[]
  stats: NotificationStatsDto | null
  preferences: NotificationPreferencesDto | null
  loading: boolean
  error: string | null
  connected: boolean
  
  // Actions
  loadNotifications: (filter?: Partial<NotificationFilterDto>) => Promise<void>
  loadStats: () => Promise<void>
  markAsRead: (notificationIds: number[]) => Promise<boolean>
  markAllAsRead: () => Promise<boolean>
  deleteNotification: (notificationId: number) => Promise<boolean>
  deleteAllNotifications: () => Promise<boolean>
  loadPreferences: () => Promise<void>
  updatePreferences: (preferences: Partial<NotificationPreferencesDto>) => Promise<boolean>
  
  // Real-time
  connectRealTime: () => void
  disconnectRealTime: () => void
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined)

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, user } = useAuth()
  const [notifications, setNotifications] = useState<NotificationDto[]>([])
  const [stats, setStats] = useState<NotificationStatsDto | null>(null)
  const [preferences, setPreferences] = useState<NotificationPreferencesDto | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [connected, setConnected] = useState(false)
  const [disconnectRealTime, setDisconnectRealTime] = useState<(() => void) | null>(null)

  // Load initial data when authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      loadNotifications()
      loadStats()
      loadPreferences()
      connectRealTime()
    } else {
      // Clear data when not authenticated
      setNotifications([])
      setStats(null)
      setPreferences(null)
      disconnectRealTimeInternal()
    }

    return () => {
      disconnectRealTimeInternal()
    }
  }, [isAuthenticated, user])

  const loadNotifications = useCallback(async (filter?: Partial<NotificationFilterDto>) => {
    if (!isAuthenticated) return

    try {
      setLoading(true)
      setError(null)

      const defaultFilter: NotificationFilterDto = {
        pageNumber: 1,
        pageSize: 50,
        ...filter,
      }

      console.log("🔔 Loading notifications with filter:", defaultFilter)
      const response = await notificationApi.getNotifications(defaultFilter)

      if (response.success && response.data) {
        console.log("✅ Notifications loaded:", response.data.notifications.length)
        setNotifications(response.data.notifications)
        setStats(response.data.stats)
      } else {
        console.log("❌ Failed to load notifications:", response.message)
        setError(response.message || "فشل في تحميل الإشعارات")
      }
    } catch (err: any) {
      console.error("🚨 Error loading notifications:", err)
      setError("حدث خطأ أثناء تحميل الإشعارات")
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated])

  const loadStats = useCallback(async () => {
    if (!isAuthenticated) return

    try {
      console.log("📊 Loading notification stats...")
      const response = await notificationApi.getStats()

      if (response.success && response.data) {
        console.log("✅ Stats loaded:", response.data)
        setStats(response.data)
      } else {
        console.log("❌ Failed to load stats:", response.message)
      }
    } catch (err: any) {
      console.error("🚨 Error loading stats:", err)
    }
  }, [isAuthenticated])

  const markAsRead = useCallback(async (notificationIds: number[]): Promise<boolean> => {
    if (!isAuthenticated) return false

    try {
      console.log("✅ Marking notifications as read:", notificationIds)
      const response = await notificationApi.markAsRead({ notificationIds })

      if (response.success) {
        console.log("✅ Notifications marked as read")
        
        // Update local state
        setNotifications(prev => 
          prev.map(notif => 
            notificationIds.includes(notif.notificationId)
              ? { ...notif, isRead: true, readAt: new Date().toISOString() }
              : notif
          )
        )
        
        // Reload stats
        await loadStats()
        return true
      } else {
        console.log("❌ Failed to mark as read:", response.message)
        setError(response.message || "فشل في تحديد الإشعارات كمقروءة")
        return false
      }
    } catch (err: any) {
      console.error("🚨 Error marking as read:", err)
      setError("حدث خطأ أثناء تحديد الإشعارات كمقروءة")
      return false
    }
  }, [isAuthenticated, loadStats])

  const markAllAsRead = useCallback(async (): Promise<boolean> => {
    if (!isAuthenticated) return false

    try {
      console.log("✅ Marking all notifications as read...")
      const response = await notificationApi.markAllAsRead()

      if (response.success) {
        console.log("✅ All notifications marked as read")
        
        // Update local state
        setNotifications(prev => 
          prev.map(notif => ({ 
            ...notif, 
            isRead: true, 
            readAt: new Date().toISOString() 
          }))
        )
        
        // Reload stats
        await loadStats()
        return true
      } else {
        console.log("❌ Failed to mark all as read:", response.message)
        setError(response.message || "فشل في تحديد جميع الإشعارات كمقروءة")
        return false
      }
    } catch (err: any) {
      console.error("🚨 Error marking all as read:", err)
      setError("حدث خطأ أثناء تحديد جميع الإشعارات كمقروءة")
      return false
    }
  }, [isAuthenticated, loadStats])

  const deleteNotification = useCallback(async (notificationId: number): Promise<boolean> => {
    if (!isAuthenticated) return false

    try {
      console.log("🗑️ Deleting notification:", notificationId)
      const response = await notificationApi.deleteNotification(notificationId)

      if (response.success) {
        console.log("✅ Notification deleted")
        
        // Update local state
        setNotifications(prev => prev.filter(notif => notif.notificationId !== notificationId))
        
        // Reload stats
        await loadStats()
        return true
      } else {
        console.log("❌ Failed to delete notification:", response.message)
        setError(response.message || "فشل في حذف الإشعار")
        return false
      }
    } catch (err: any) {
      console.error("🚨 Error deleting notification:", err)
      setError("حدث خطأ أثناء حذف الإشعار")
      return false
    }
  }, [isAuthenticated, loadStats])

  const deleteAllNotifications = useCallback(async (): Promise<boolean> => {
    if (!isAuthenticated) return false

    try {
      console.log("🗑️ Deleting all notifications...")
      const response = await notificationApi.deleteAllNotifications()

      if (response.success) {
        console.log("✅ All notifications deleted")
        
        // Update local state
        setNotifications([])
        setStats(prev => prev ? { ...prev, totalNotifications: 0, unreadCount: 0 } : null)
        
        return true
      } else {
        console.log("❌ Failed to delete all notifications:", response.message)
        setError(response.message || "فشل في حذف جميع الإشعارات")
        return false
      }
    } catch (err: any) {
      console.error("🚨 Error deleting all notifications:", err)
      setError("حدث خطأ أثناء حذف جميع الإشعارات")
      return false
    }
  }, [isAuthenticated])

  const loadPreferences = useCallback(async () => {
    if (!isAuthenticated) return

    try {
      console.log("⚙️ Loading notification preferences...")
      const response = await notificationApi.getPreferences()

      if (response.success && response.data) {
        console.log("✅ Preferences loaded:", response.data)
        setPreferences(response.data)
      } else {
        console.log("❌ Failed to load preferences:", response.message)
      }
    } catch (err: any) {
      console.error("🚨 Error loading preferences:", err)
    }
  }, [isAuthenticated])

  const updatePreferences = useCallback(async (newPreferences: Partial<NotificationPreferencesDto>): Promise<boolean> => {
    if (!isAuthenticated) return false

    try {
      console.log("⚙️ Updating notification preferences:", newPreferences)
      const response = await notificationApi.updatePreferences(newPreferences)

      if (response.success) {
        console.log("✅ Preferences updated")
        
        // Update local state
        setPreferences(prev => prev ? { ...prev, ...newPreferences } : null)
        return true
      } else {
        console.log("❌ Failed to update preferences:", response.message)
        setError(response.message || "فشل في تحديث إعدادات الإشعارات")
        return false
      }
    } catch (err: any) {
      console.error("🚨 Error updating preferences:", err)
      setError("حدث خطأ أثناء تحديث إعدادات الإشعارات")
      return false
    }
  }, [isAuthenticated])

  const connectRealTime = useCallback(() => {
    if (!isAuthenticated || connected) return

    console.log("🔌 Connecting to real-time notifications...")
    
    const disconnect = notificationApi.connectToRealTimeNotifications(
      (data: RealTimeNotificationDto) => {
        console.log("🔔 Real-time notification received:", data)
        
        // Add new notification to the list
        if (data.notification) {
          setNotifications(prev => [data.notification, ...prev])
        }
        
        // Update stats
        if (data.stats) {
          setStats(data.stats)
        }
        
        // Show browser notification if supported and allowed
        if ('Notification' in window && Notification.permission === 'granted' && data.notification) {
          new Notification(data.notification.title, {
            body: data.notification.message,
            icon: '/favicon.ico',
            tag: `notification-${data.notification.notificationId}`,
          })
        }
      },
      (error) => {
        console.error("🚨 Real-time notifications error:", error)
        setConnected(false)
        setError("انقطع الاتصال بالإشعارات المباشرة")
      },
      () => {
        console.log("✅ Real-time notifications connected")
        setConnected(true)
        setError(null)
      }
    )

    setDisconnectRealTime(() => disconnect)
  }, [isAuthenticated, connected])

  const disconnectRealTimeInternal = useCallback(() => {
    if (disconnectRealTime) {
      console.log("🔌 Disconnecting real-time notifications...")
      disconnectRealTime()
      setDisconnectRealTime(null)
      setConnected(false)
    }
  }, [disconnectRealTime])

  // Request notification permission
  useEffect(() => {
    if (isAuthenticated && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        console.log("🔔 Notification permission:", permission)
      })
    }
  }, [isAuthenticated])

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        stats,
        preferences,
        loading,
        error,
        connected,
        loadNotifications,
        loadStats,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        deleteAllNotifications,
        loadPreferences,
        updatePreferences,
        connectRealTime,
        disconnectRealTime: disconnectRealTimeInternal,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationsContext)
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationsProvider")
  }
  return context
}
