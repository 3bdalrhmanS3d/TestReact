import { LayoutDashboard, Settings, BookOpen } from "lucide-react"
import { Link } from "next/link"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import type { User } from "next-auth"

interface DashboardSidebarProps {
  user: User | null
}

export function DashboardSidebar({ user }: DashboardSidebarProps) {
  return (
    <Sidebar>
      <SidebarHeader>لوحة التحكم</SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <Link href="/dashboard">
              <LayoutDashboard className="h-4 w-4" />
              نظرة عامة
            </Link>
          </SidebarMenuItem>
          {user?.role === "Instructor" && (
            <SidebarMenuSub label="المدرب">
              <SidebarMenuSubItem>
                <SidebarMenuSubButton asChild>
                  <Link href="/dashboard/create-course">
                    <LayoutDashboard className="h-4 w-4" />
                    إنشاء دورة
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
              {user?.role === "Instructor" && (
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton asChild>
                    <Link href="/dashboard/my-courses">
                      <BookOpen className="h-4 w-4" />
                      إدارة المحتوى
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              )}
            </SidebarMenuSub>
          )}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <Link href="/dashboard/settings">
              <Settings className="h-4 w-4" />
              الإعدادات
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
