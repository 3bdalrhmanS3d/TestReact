"use client"

import type React from "react"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { useEffect, Suspense } from "react"
import { Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import dynamic from "next/dynamic"

// Dynamic imports to prevent chunk loading issues
const DashboardHeader = dynamic(() => import("@/components/dashboard/dashboard-header"), {
  loading: () => <div className="h-16 bg-white border-b animate-pulse" />,
  ssr: false,
})

const DashboardSidebar = dynamic(() => import("@/components/dashboard/dashboard-sidebar"), {
  loading: () => <div className="w-64 bg-white border-r animate-pulse" />,
  ssr: false,
})

const CompleteProfileModal = dynamic(() => import("@/components/profile/complete-profile-modal"), {
  loading: () => null,
  ssr: false,
})

const SidebarProvider = dynamic(
  () => import("@/components/ui/sidebar").then((mod) => ({ default: mod.SidebarProvider })),
  {
    loading: () => <div className="min-h-screen flex">جاري التحميل...</div>,
    ssr: false,
  },
)

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading, profileIncomplete, error, apiAvailable } = useAuth()
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

  if (!apiAvailable) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Alert className="max-w-md">
          <AlertDescription className="text-center">
            {error || "الخادم غير متاح حالياً. يرجى المحاولة لاحقاً."}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gray-50 flex">
        <Suspense fallback={<div className="w-64 bg-white border-r animate-pulse" />}>
          <DashboardSidebar />
        </Suspense>
        <div className="flex-1 lg:mr-64">
          <Suspense fallback={<div className="h-16 bg-white border-b animate-pulse" />}>
            <DashboardHeader />
          </Suspense>
          <main className="p-6">
            {profileIncomplete ? (
              <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                  <h2 className="text-xl font-semibold mb-2">مرحباً بك!</h2>
                  <p className="text-gray-600 mb-4">يرجى إكمال ملفك الشخصي للمتابعة</p>
                </div>
              </div>
            ) : (
              <Suspense
                fallback={
                  <div className="flex items-center justify-center min-h-[200px]">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                }
              >
                {children}
              </Suspense>
            )}
          </main>
        </div>
      </div>

      {/* Profile Completion Modal */}
      <Suspense fallback={null}>
        <CompleteProfileModal />
      </Suspense>
    </SidebarProvider>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      }
    >
      <DashboardContent>{children}</DashboardContent>
    </Suspense>
  )
}
