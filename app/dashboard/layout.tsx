"use client"

import type React from "react"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import DashboardHeader from "@/components/dashboard/dashboard-header"
import DashboardSidebar from "@/components/dashboard/dashboard-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Loader2 } from "lucide-react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/auth/signin")
    }
  }, [isAuthenticated, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gray-50 flex">
        <DashboardSidebar />
        <div className="flex-1 lg:mr-64">
          <DashboardHeader />
          <main className="p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  )
}
