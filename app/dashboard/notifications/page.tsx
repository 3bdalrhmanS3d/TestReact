"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Filter,
  Settings,
  Clock,
  BookOpen,
  Award,
  Zap,
  CircleDot,
  Loader2,
  RefreshCw,
  Wifi,
  WifiOff,
} from "lucide-react"
import { useNotifications } from "@/hooks/use-notifications"
import { formatDistanceToNow } from "date-fns"
import { ar } from "date-fns/locale"
import { toast } from "sonner"

const NotificationIcon = ({ type }: { type: string }) => {
  switch (type) {
    case "Enrollment":
    case "CourseUpdate":
      return <BookOpen className="h-5 w-5 text-blue-500" />
    case "Achievement":
    case "Certificate":
      return <Award className="h-5 w-5 text-yellow-500" />
    case "Quiz":
      return <Zap className="h-5 w-5 text-purple-500" />
    case "Reminder":
      return <Clock className="h-5 w-5 text-orange-500" />
    default:
      return <CircleDot className="h-5 w-5 text-gray-500" />
  }
}

const NotificationItem = ({ 
  notification, 
  onMarkAsRead, 
  onDelete 
}: { 
  notification: any, 
  onMarkAsRead: (id: number) => void, 
  onDelete: (id: number) => void 
}) => {
  return (
    <Card className={`${!notification.isRead ? 'border-r-4 border-blue-500 bg-blue-50/30' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 mt-1">
            <NotificationIcon type={notification.type} />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className={`text-sm font-medium text-right ${
                  !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                }`}>
                  {notification.title}
                </h3>
                <p className={`text-sm text-right mt-1 ${
                  !notification.isRead ? 'text-gray-700' : 'text-gray-500'
                }`}>
                  {notification.message}
                </p>
                
                {/* Course info */}
                {notification.courseName && (
                  <Badge variant="secondary" className="mt-2 text-xs">
                    {notification.courseName}
                  </Badge>
                )}
                
                {/* Priority badge */}
                {notification.priority === "High" && (
                  <Badge variant="destructive" className="mt-2 mr-2 text-xs">
                    أولوية عالية
                  </Badge>
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
              <div className="flex gap-2">
                {!notification.isRead && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onMarkAsRead(notification.notificationId)}
                    className="h-8 w-8 p-0"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(notification.notificationId)}
                  className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function NotificationsPage() {
  const {
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
  } = useNotifications()

  const [activeTab, setActiveTab] = useState("all")
  const [filterType, setFilterType] = useState("all")
  const [filterPriority, setFilterPriority] = useState("all")

  // Load data on mount
  useEffect(() => {
    loadNotifications()
    loadStats()
    loadPreferences()
  }, [])

  // Filter notifications based on active tab and filters
  const filteredNotifications = notifications.filter(notification => {
    let includeByTab = true
    let includeByType = true
    let includeByPriority = true

    // Filter by tab
    switch (activeTab) {
      case "unread":
        includeByTab = !notification.isRead
        break
      case "read":
        includeByTab = notification.isRead
        break
      default:
        includeByTab = true
    }

    // Filter by type
    if (filterType !== "all") {
      includeByType = notification.type === filterType
    }

    // Filter by priority
    if (filterPriority !== "all") {
      includeByPriority = notification.priority === filterPriority
    }

    return includeByTab && includeByType && includeByPriority
  })

  const handleMarkAsRead = async (notificationId: number) => {
    const success = await markAsRead([notificationId])
    if (success) {
      toast.success("تم تحديد الإشعار كمقروء")
    }
  }

  const handleMarkAllAsRead = async () => {
    const success = await markAllAsRead()
    if (success) {
      toast.success("تم تحديد جميع الإشعارات كمقروءة")
    }
  }

  const handleDelete = async (notificationId: number) => {
    const success = await deleteNotification(notificationId)
    if (success) {
      toast.success("تم حذف الإشعار")
    }
  }

  const handleDeleteAll = async () => {
    if (confirm("هل أنت متأكد من حذف جميع الإشعارات؟")) {
      const success = await deleteAllNotifications()
      if (success) {
        toast.success("تم حذف جميع الإشعارات")
      }
    }
  }

  const handleUpdatePreference = async (key: string, value: boolean) => {
    const success = await updatePreferences({ [key]: value })
    if (success) {
      toast.success("تم تحديث الإعدادات")
    }
  }

  const handleRefresh = () => {
    loadNotifications()
    loadStats()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">الإشعارات</h1>
          <p className="text-gray-600 mt-2">
            إدارة إشعاراتك وتفضيلاتك
          </p>
          
          {stats && (
            <div className="flex gap-4 mt-4">
              <Badge variant="outline">
                المجموع: {stats.totalNotifications}
              </Badge>
              <Badge variant="destructive">
                غير مقروء: {stats.unreadCount}
              </Badge>
              <Badge variant="secondary">
                اليوم: {stats.todayCount}
              </Badge>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          {/* Connection status */}
          <div className="flex items-center gap-2 text-sm">
            {connected ? (
              <>
                <Wifi className="h-4 w-4 text-green-500" />
                <span className="text-green-600">متصل</span>
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4 text-red-500" />
                <span className="text-red-600">غير متصل</span>
              </>
            )}
          </div>

          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            تحديث
          </Button>

          {stats && stats.unreadCount > 0 && (
            <Button size="sm" onClick={handleMarkAllAsRead}>
              <CheckCheck className="h-4 w-4 mr-2" />
              تحديد الكل كمقروء
            </Button>
          )}
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="all">جميع الإشعارات</TabsTrigger>
            <TabsTrigger value="unread">غير مقروء ({stats?.unreadCount || 0})</TabsTrigger>
            <TabsTrigger value="read">مقروء</TabsTrigger>
            <TabsTrigger value="settings">الإعدادات</TabsTrigger>
          </TabsList>

          {/* Filters */}
          {activeTab !== "settings" && (
            <div className="flex gap-2">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="نوع الإشعار" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الأنواع</SelectItem>
                  <SelectItem value="Enrollment">التسجيل</SelectItem>
                  <SelectItem value="Achievement">الإنجازات</SelectItem>
                  <SelectItem value="CourseUpdate">تحديثات الدورة</SelectItem>
                  <SelectItem value="Quiz">الاختبارات</SelectItem>
                  <SelectItem value="Reminder">التذكيرات</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="الأولوية" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الأولويات</SelectItem>
                  <SelectItem value="High">عالية</SelectItem>
                  <SelectItem value="Normal">عادية</SelectItem>
                  <SelectItem value="Low">منخفضة</SelectItem>
                </SelectContent>
              </Select>

              {filteredNotifications.length > 0 && (
                <Button variant="outline" size="sm" onClick={handleDeleteAll}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  حذف الكل
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Notifications List */}
        <TabsContent value="all" className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : filteredNotifications.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">لا توجد إشعارات</h3>
                <p className="text-gray-600">
                  {activeTab === "unread" 
                    ? "جميع إشعاراتك مقروءة!" 
                    : "ستظهر إشعاراتك هنا عندما تصل"}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredNotifications.map((notification) => (
              <NotificationItem
                key={notification.notificationId}
                notification={notification}
                onMarkAsRead={handleMarkAsRead}
                onDelete={handleDelete}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="unread" className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : filteredNotifications.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <CheckCheck className="h-12 w-12 text-green-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">رائع!</h3>
                <p className="text-gray-600">جميع إشعاراتك مقروءة</p>
              </CardContent>
            </Card>
          ) : (
            filteredNotifications.map((notification) => (
              <NotificationItem
                key={notification.notificationId}
                notification={notification}
                onMarkAsRead={handleMarkAsRead}
                onDelete={handleDelete}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="read" className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : filteredNotifications.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">لا توجد إشعارات مقروءة</h3>
                <p className="text-gray-600">الإشعارات التي قرأتها ستظهر هنا</p>
              </CardContent>
            </Card>
          ) : (
            filteredNotifications.map((notification) => (
              <NotificationItem
                key={notification.notificationId}
                notification={notification}
                onMarkAsRead={handleMarkAsRead}
                onDelete={handleDelete}
              />
            ))
          )}
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                إعدادات الإشعارات
              </CardTitle>
              <CardDescription>
                تخصيص تفضيلات الإشعارات الخاصة بك
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {preferences ? (
                <>
                  {/* Email Notifications */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">الإشعارات عبر البريد الإلكتروني</Label>
                      <p className="text-sm text-muted-foreground">
                        تلقي الإشعارات في بريدك الإلكتروني
                      </p>
                    </div>
                    <Switch
                      checked={preferences.emailNotifications}
                      onCheckedChange={(checked) => 
                        handleUpdatePreference("emailNotifications", checked)
                      }
                    />
                  </div>

                  <Separator />

                  {/* Push Notifications */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">الإشعارات المباشرة</Label>
                      <p className="text-sm text-muted-foreground">
                        تلقي الإشعارات الفورية في المتصفح
                      </p>
                    </div>
                    <Switch
                      checked={preferences.pushNotifications}
                      onCheckedChange={(checked) => 
                        handleUpdatePreference("pushNotifications", checked)
                      }
                    />
                  </div>

                  <Separator />

                  {/* Course Updates */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">تحديثات الدورات</Label>
                      <p className="text-sm text-muted-foreground">
                        إشعارات عند إضافة محتوى جديد للدورات
                      </p>
                    </div>
                    <Switch
                      checked={preferences.courseUpdateNotifications}
                      onCheckedChange={(checked) => 
                        handleUpdatePreference("courseUpdateNotifications", checked)
                      }
                    />
                  </div>

                  <Separator />

                  {/* Achievement Notifications */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">إشعارات الإنجازات</Label>
                      <p className="text-sm text-muted-foreground">
                        إشعارات عند حصولك على إنجاز أو شهادة
                      </p>
                    </div>
                    <Switch
                      checked={preferences.achievementNotifications}
                      onCheckedChange={(checked) => 
                        handleUpdatePreference("achievementNotifications", checked)
                      }
                    />
                  </div>

                  <Separator />

                  {/* Reminder Notifications */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">تذكيرات الدراسة</Label>
                      <p className="text-sm text-muted-foreground">
                        تذكيرات لمتابعة دراستك والمواظبة على التعلم
                      </p>
                    </div>
                    <Switch
                      checked={preferences.reminderNotifications}
                      onCheckedChange={(checked) => 
                        handleUpdatePreference("reminderNotifications", checked)
                      }
                    />
                  </div>

                  <Separator />

                  {/* Marketing Notifications */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">الإشعارات التسويقية</Label>
                      <p className="text-sm text-muted-foreground">
                        إشعارات حول العروض والدورات الجديدة
                      </p>
                    </div>
                    <Switch
                      checked={preferences.marketingNotifications}
                      onCheckedChange={(checked) => 
                        handleUpdatePreference("marketingNotifications", checked)
                      }
                    />
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}