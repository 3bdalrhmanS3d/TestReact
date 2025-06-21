"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Wifi, WifiOff, RefreshCw, Server, Globe } from "lucide-react"

export default function ApiDebug() {
  const [connectionStatus, setConnectionStatus] = useState<"checking" | "connected" | "disconnected">("checking")
  const [apiUrl, setApiUrl] = useState("")
  const [lastChecked, setLastChecked] = useState<Date | null>(null)
  const [testing, setTesting] = useState(false)
  const [testResults, setTestResults] = useState<{
    healthCheck: boolean
    baseApi: boolean
    corsEnabled: boolean
  }>({
    healthCheck: false,
    baseApi: false,
    corsEnabled: false,
  })

  useEffect(() => {
    setApiUrl(process.env.NEXT_PUBLIC_API_URL || "https://localhost:7001/api")
    testConnection()
  }, [])

  const testConnection = async () => {
    setTesting(true)
    setConnectionStatus("checking")

    const results = {
      healthCheck: false,
      baseApi: false,
      corsEnabled: false,
    }

    try {
      // Test 1: Health endpoint
      try {
        const healthResponse = await fetch(`${apiUrl.replace("/api", "")}/health`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        })
        results.healthCheck = healthResponse.ok
      } catch (error) {
        console.log("Health check failed:", error)
      }

      // Test 2: Base API endpoint
      try {
        const apiResponse = await fetch(apiUrl, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        })
        results.baseApi = true // Even 404 means server is responding
      } catch (error) {
        console.log("Base API test failed:", error)
      }

      // Test 3: CORS test with a simple endpoint
      try {
        const corsResponse = await fetch(`${apiUrl}/Auth/signup`, {
          method: "OPTIONS",
          headers: { "Content-Type": "application/json" },
        })
        results.corsEnabled = corsResponse.ok || corsResponse.status === 405 // 405 means method not allowed but CORS works
      } catch (error) {
        console.log("CORS test failed:", error)
      }

      setTestResults(results)

      const isConnected = results.healthCheck || results.baseApi
      setConnectionStatus(isConnected ? "connected" : "disconnected")
      setLastChecked(new Date())
    } catch (error) {
      console.error("Connection test failed:", error)
      setConnectionStatus("disconnected")
      setLastChecked(new Date())
    } finally {
      setTesting(false)
    }
  }

  const getStatusColor = () => {
    switch (connectionStatus) {
      case "connected":
        return "bg-green-500"
      case "disconnected":
        return "bg-red-500"
      default:
        return "bg-yellow-500"
    }
  }

  const getStatusText = () => {
    switch (connectionStatus) {
      case "connected":
        return "متصل"
      case "disconnected":
        return "غير متصل"
      default:
        return "جاري الفحص"
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {connectionStatus === "connected" ? (
            <Wifi className="h-5 w-5 text-green-600" />
          ) : (
            <WifiOff className="h-5 w-5 text-red-600" />
          )}
          حالة الاتصال بالخادم
        </CardTitle>
        <CardDescription>فحص الاتصال مع API الخلفي</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">الحالة:</span>
          <Badge variant="outline" className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
            {getStatusText()}
          </Badge>
        </div>

        <div className="space-y-2">
          <span className="text-sm font-medium">عنوان الخادم:</span>
          <code className="block text-xs bg-gray-100 p-2 rounded border break-all">{apiUrl}</code>
        </div>

        {/* Test Results */}
        <div className="space-y-2">
          <span className="text-sm font-medium">نتائج الفحص:</span>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1">
                <Server className="h-3 w-3" />
                Health Check
              </span>
              <Badge variant={testResults.healthCheck ? "default" : "destructive"} className="text-xs">
                {testResults.healthCheck ? "✓" : "✗"}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1">
                <Globe className="h-3 w-3" />
                Base API
              </span>
              <Badge variant={testResults.baseApi ? "default" : "destructive"} className="text-xs">
                {testResults.baseApi ? "✓" : "✗"}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1">
                <Wifi className="h-3 w-3" />
                CORS
              </span>
              <Badge variant={testResults.corsEnabled ? "default" : "destructive"} className="text-xs">
                {testResults.corsEnabled ? "✓" : "✗"}
              </Badge>
            </div>
          </div>
        </div>

        {lastChecked && (
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>آخر فحص:</span>
            <span>{lastChecked.toLocaleTimeString("ar-SA")}</span>
          </div>
        )}

        <Button onClick={testConnection} disabled={testing} variant="outline" className="w-full">
          {testing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              جاري الفحص...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              إعادة فحص الاتصال
            </>
          )}
        </Button>

        {connectionStatus === "disconnected" && (
          <Alert variant="destructive">
            <AlertDescription className="text-xs">
              <strong>نصائح لحل المشكلة:</strong>
              <ul className="mt-2 space-y-1 list-disc list-inside">
                <li>تأكد من تشغيل الخادم الخلفي على المنفذ الصحيح</li>
                <li>تحقق من إعدادات CORS في Program.cs</li>
                <li>تأكد من أن عنوان API صحيح في متغيرات البيئة</li>
                <li>تحقق من أن الخادم يقبل HTTPS requests</li>
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* CORS Configuration Help */}
        {!testResults.corsEnabled && connectionStatus === "connected" && (
          <Alert>
            <AlertDescription className="text-xs">
              <strong>إعدادات CORS المطلوبة في Program.cs:</strong>
              <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                {`builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

// في middleware pipeline:
app.UseCors("AllowReactApp");`}
              </pre>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
