"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { 
  Bell, 
  LogOut, 
  Settings, 
  User, 
  Check, 
  CheckCheck,
  Trash2,
  CircleDot,
  Clock,
  BookOpen,
  Award,
  Zap
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useNotifications } from "@/hooks/use-notifications"
import { formatDistanceToNow } from "date-fns"
import { ar } from "date-fns/locale"
import Link from "next/link"

const NotificationIcon = ({ type }: { type: string }) => {
  switch (type) {
    case "Enrollment":
    case "CourseUpdate":
      return <BookOpen className="h-4 w-4 text-blue-500" />
    case "Achievement":
    case "Certificate":
      return <Award className="h-4 w-4 text-yellow-500" />
    case "Quiz":
      return <Zap className="h-4 w-4 text-purple-500" />
    case "Reminder":
      return <Clock className="h-4 w-4 text-orange-500" />
    default:
      return <CircleDot className="h-4 w-4 text-gray-500" />
  }
}

const NotificationsList = () => {
  const { 
    notifications, 
    stats, 
    loading, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification,
    loadNotifications 
  } = useNotifications()

  const handleMarkAsRead = async (notificationId: number) => {
    await markAsRead([notificationId])
  }

  const handleMarkAllAsRead = async () => {
    await markAllAsRead()
  }

  const handleDeleteNotification = async (notificationId: number) => {
    await deleteNotification(notificationId)
  }

  if (loading) {
    return (
      <div className="p-4 text-center">
        <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
        <p className="text-sm text-gray-500 mt-2">جاري التحميل...</p>
      </div>
    )
  }

  if (!notifications || notifications.length === 0) {
    return (
      <div className="p-8 text-center">
        <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">لا توجد إشعارات</h3>
        <p className="text-gray-500">ستظهر إشعاراتك هنا عندما تصل</p>
      </div>
    )
  }

  return (
    <div className="w-96">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <h3 className="text-lg font-semibold">الإشعارات</h3>
          {stats && (
            <p className="text-sm text-gray-500">
              {stats.unreadCount} غير مقروء من أصل {stats.totalNotifications}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          {stats && stats.unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleMarkAllAsRead}
              className="text-xs"
            >
              <CheckCheck className="h-4 w-4 mr-1" />
              تحديد الكل كمقروء
            </Button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <ScrollArea className="h-96">
        <div className="p-2">
          {notifications.map((notification, index) => (
            <div key={notification.notificationId}>
              <div 
                className={`p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer ${
                  !notification.isRead ? 'bg-blue-50 border-r-4 border-blue-500' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    <NotificationIcon type={notification.type} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h4 className={`text-sm font-medium text-right ${
                          !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                        }`}>
                          {notification.title}
                        </h4>
                        <p className={`text-sm text-right mt-1 ${
                          !notification.isRead ? 'text-gray-700' : 'text-gray-500'
                        }`}>
                          {notification.message}
                        </p>
                        
                        {/* Course info */}
                        {notification.courseName && (
                          <p className="text-xs text-blue-600 mt-1 text-right">
                            {notification.courseName}
                          </p>
                        )}
                        
                        {/* Time */}
                        <p className="text-xs text-gray-400 mt-2 text-right">
                          {formatDistanceToNow(new Date(notification.createdAt), { 
                            addSuffix: true, 
                            locale: ar 
                          })}
                        </p>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex gap-1">
                        {!notification.isRead && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleMarkAsRead(notification.notificationId)
                            }}
                            className="h-8 w-8 p-0"
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteNotification(notification.notificationId)
                          }}
                          className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {index < notifications.length - 1 && (
                <Separator className="my-2" />
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="border-t p-4">
        <Link href="/dashboard/notifications">
          <Button variant="outline" className="w-full">
            عرض جميع الإشعارات
          </Button>
        </Link>
      </div>
    </div>
  )
}

export default function DashboardHeader() {
  const { user, logout } = useAuth()
  const { stats, connected } = useNotifications()
  const [notificationsOpen, setNotificationsOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
  }

  const unreadCount = stats?.unreadCount || 0

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">لوحة التحكم</h1>
          <p className="text-gray-600">مرحباً بك، {user?.fullName || user?.name}</p>
        </div>

        <div className="flex items-center space-x-4 space-x-reverse">
          {/* Notifications */}
          <Popover open={notificationsOpen} onOpenChange={setNotificationsOpen}>
            <PopoverTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="relative"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                  >
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Badge>
                )}
                {/* Connection indicator */}
                <div className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full ${
                  connected ? 'bg-green-500' : 'bg-gray-400'
                }`} />
              </Button>
            </PopoverTrigger>
            <PopoverContent 
              className="p-0 w-auto" 
              align="end"
              side="bottom"
              sideOffset={5}
            >
              <NotificationsList />
            </PopoverContent>
          </Popover>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={user?.profilePhoto || "/placeholder.svg?height=40&width=40"}
                    alt={user?.fullName || user?.name}
                  />
                  <AvatarFallback>
                    {(user?.fullName || user?.name || "")
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1 text-right">
                  <p className="text-sm font-medium leading-none">
                    {user?.fullName || user?.name}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.emailAddress || user?.email}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.role === "Student" ? "طالب" : 
                     user?.role === "Instructor" ? "مدرب" : 
                     user?.role === "Admin" ? "مدير" : user?.role}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <Link href="/dashboard/profile">
                <DropdownMenuItem className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>الملف الشخصي</span>
                </DropdownMenuItem>
              </Link>
              <Link href="/dashboard/settings">
                <DropdownMenuItem className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>الإعدادات</span>
                </DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="cursor-pointer text-red-600 focus:text-red-600"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>تسجيل الخروج</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
