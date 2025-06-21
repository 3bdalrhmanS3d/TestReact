"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import {
  Home,
  BookOpen,
  Heart,
  User,
  BarChart3,
  Bell,
  Menu,
  X,
  Settings,
  Users,
  GraduationCap,
  FileText,
  CreditCard,
  Award,
  MessageSquare,
  HelpCircle,
  Shield,
  Database,
  TrendingUp,
  Search,
  Plus,
} from "lucide-react"

// Navigation items based on user role
const getNavigationItems = (userRole: string) => {
  const baseItems = [
    { name: "الرئيسية", href: "/dashboard", icon: Home },
    { name: "دوراتي", href: "/dashboard/my-courses", icon: BookOpen },
    { name: "المفضلة", href: "/dashboard/favorites", icon: Heart },
    { name: "الإشعارات", href: "/dashboard/notifications", icon: Bell },
    { name: "الملف الشخصي", href: "/dashboard/profile", icon: User },
  ]

  const instructorItems = [
    { name: "الرئيسية", href: "/dashboard", icon: Home },
    { name: "دوراتي", href: "/dashboard/my-courses", icon: BookOpen },
    { name: "إنشاء دورة", href: "/dashboard/create-course", icon: Plus },
    { name: "الطلاب", href: "/dashboard/students", icon: Users },
    { name: "الإحصائيات", href: "/dashboard/instructor-stats", icon: BarChart3 },
    { name: "المراجعات", href: "/dashboard/reviews", icon: MessageSquare },
    { name: "الأرباح", href: "/dashboard/earnings", icon: CreditCard },
    { name: "الإشعارات", href: "/dashboard/notifications", icon: Bell },
    { name: "الملف الشخصي", href: "/dashboard/profile", icon: User },
  ]

  const adminItems = [
    { name: "الرئيسية", href: "/dashboard", icon: Home },
    { name: "إدارة الدورات", href: "/dashboard/admin/courses", icon: BookOpen },
    { name: "إدارة المستخدمين", href: "/dashboard/admin/users", icon: Users },
    { name: "إدارة المدربين", href: "/dashboard/admin/instructors", icon: GraduationCap },
    { name: "التقارير", href: "/dashboard/admin/reports", icon: FileText },
    { name: "الإحصائيات", href: "/dashboard/admin/analytics", icon: TrendingUp },
    { name: "المدفوعات", href: "/dashboard/admin/payments", icon: CreditCard },
    { name: "الشهادات", href: "/dashboard/admin/certificates", icon: Award },
    { name: "المراجعات", href: "/dashboard/admin/reviews", icon: MessageSquare },
    { name: "الإعدادات", href: "/dashboard/admin/settings", icon: Settings },
    { name: "النسخ الاحتياطي", href: "/dashboard/admin/backup", icon: Database },
    { name: "الأمان", href: "/dashboard/admin/security", icon: Shield },
    { name: "الدعم الفني", href: "/dashboard/admin/support", icon: HelpCircle },
    { name: "الملف الشخصي", href: "/dashboard/profile", icon: User },
  ]

  switch (userRole?.toLowerCase()) {
    case "admin":
      return adminItems
    case "instructor":
      return instructorItems
    default:
      return baseItems
  }
}

export default function DashboardSidebar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const { user } = useAuth()

  const navigation = getNavigationItems(user?.role || "user")

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 right-4 z-50">
        <Button variant="outline" size="sm" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 right-0 z-40 w-64 bg-white border-l border-gray-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200">
            <Link href="/dashboard" className="flex items-center space-x-2 space-x-reverse">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">LearnQuest</span>
            </Link>
          </div>

          {/* User Role Badge */}
          <div className="px-4 py-2 border-b border-gray-100">
            <div className="text-xs text-gray-500 mb-1">الدور الحالي</div>
            <div
              className={cn(
                "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                user?.role === "Admin" && "bg-red-100 text-red-800",
                user?.role === "Instructor" && "bg-blue-100 text-blue-800",
                user?.role === "User" && "bg-green-100 text-green-800",
              )}
            >
              {user?.role === "Admin" && "مدير النظام"}
              {user?.role === "Instructor" && "مدرب"}
              {user?.role === "User" && "طالب"}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                    isActive
                      ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                  )}
                >
                  <item.icon className="mr-3 h-4 w-4" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* Quick Actions */}
          <div className="p-4 border-t border-gray-200">
            <div className="space-y-2">
              {user?.role === "Instructor" && (
                <Link href="/dashboard/create-course">
                  <Button size="sm" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    إنشاء دورة جديدة
                  </Button>
                </Link>
              )}
              {user?.role === "Admin" && (
                <Link href="/dashboard/admin/analytics">
                  <Button size="sm" variant="outline" className="w-full">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    عرض الإحصائيات
                  </Button>
                </Link>
              )}
              {user?.role === "User" && (
                <Link href="/courses">
                  <Button size="sm" className="w-full">
                    <Search className="h-4 w-4 mr-2" />
                    تصفح الدورات
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  )
}
