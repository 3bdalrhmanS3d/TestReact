"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { RefreshCw, AlertTriangle } from "lucide-react"

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error Boundary caught an error:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>حدث خطأ في التطبيق</AlertTitle>
              <AlertDescription className="mt-2">
                عذراً، حدث خطأ غير متوقع. يرجى إعادة تحميل الصفحة أو المحاولة لاحقاً.
              </AlertDescription>
            </Alert>

            <div className="mt-4 space-y-2">
              <Button onClick={() => window.location.reload()} className="w-full" variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" />
                إعادة تحميل الصفحة
              </Button>

              <Button
                onClick={() => {
                  this.setState({ hasError: false })
                  window.location.href = "/"
                }}
                className="w-full"
              >
                العودة للصفحة الرئيسية
              </Button>
            </div>

            {process.env.NODE_ENV === "development" && this.state.error && (
              <details className="mt-4 p-4 bg-gray-100 rounded text-sm">
                <summary className="cursor-pointer font-medium">تفاصيل الخطأ (للمطوري��)</summary>
                <pre className="mt-2 whitespace-pre-wrap text-xs">{this.state.error.toString()}</pre>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
