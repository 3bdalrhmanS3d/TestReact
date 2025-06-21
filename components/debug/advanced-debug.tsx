"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, RefreshCw, Server, AlertTriangle } from "lucide-react"

export default function AdvancedDebug() {
  const [testing, setTesting] = useState(false)
  const [results, setResults] = useState<any>({})
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    setLogs((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const testAllEndpoints = async () => {
    setTesting(true)
    setLogs([])
    setResults({})

    const endpoints = [
      { name: "HTTP Health", url: "http://localhost:5268/health" },
      { name: "HTTPS Health", url: "https://localhost:7217/health" },
      { name: "HTTP API", url: "http://localhost:5268/api" },
      { name: "HTTPS API", url: "https://localhost:7217/api" },
      { name: "HTTP Auth", url: "http://localhost:5268/api/Auth/signup", method: "OPTIONS" },
      { name: "HTTPS Auth", url: "https://localhost:7217/api/Auth/signup", method: "OPTIONS" },
    ]

    const testResults: any = {}

    for (const endpoint of endpoints) {
      addLog(`🔍 Testing ${endpoint.name}: ${endpoint.url}`)

      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 5000)

        const response = await fetch(endpoint.url, {
          method: endpoint.method || "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          signal: controller.signal,
          mode: "cors",
        })

        clearTimeout(timeoutId)

        testResults[endpoint.name] = {
          success: true,
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          url: endpoint.url,
        }

        addLog(`✅ ${endpoint.name}: ${response.status} ${response.statusText}`)

        // Try to read response
        try {
          const text = await response.text()
          if (text) {
            testResults[endpoint.name].body = text.substring(0, 200)
          }
        } catch (e) {
          addLog(`⚠️ ${endpoint.name}: Could not read response body`)
        }
      } catch (error: any) {
        testResults[endpoint.name] = {
          success: false,
          error: error.message,
          name: error.name,
          url: endpoint.url,
        }

        addLog(`❌ ${endpoint.name}: ${error.message}`)
      }
    }

    setResults(testResults)
    setTesting(false)
  }

  const testCorsSpecific = async () => {
    addLog("🔗 Testing CORS specifically...")

    try {
      // Test preflight request
      const preflightResponse = await fetch("http://localhost:5268/api/Auth/signup", {
        method: "OPTIONS",
        headers: {
          Origin: "http://localhost:3000",
          "Access-Control-Request-Method": "POST",
          "Access-Control-Request-Headers": "Content-Type",
        },
      })

      addLog(`🚁 Preflight: ${preflightResponse.status} ${preflightResponse.statusText}`)

      const corsHeaders = {
        "Access-Control-Allow-Origin": preflightResponse.headers.get("Access-Control-Allow-Origin"),
        "Access-Control-Allow-Methods": preflightResponse.headers.get("Access-Control-Allow-Methods"),
        "Access-Control-Allow-Headers": preflightResponse.headers.get("Access-Control-Allow-Headers"),
        "Access-Control-Allow-Credentials": preflightResponse.headers.get("Access-Control-Allow-Credentials"),
      }

      addLog(`📋 CORS Headers: ${JSON.stringify(corsHeaders, null, 2)}`)
    } catch (error: any) {
      addLog(`❌ CORS Test Failed: ${error.message}`)
    }
  }

  useEffect(() => {
    testAllEndpoints()
  }, [])

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            تشخيص متقدم للاتصال
          </CardTitle>
          <CardDescription>فحص شامل لجميع نقاط الاتصال المحتملة</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Button onClick={testAllEndpoints} disabled={testing}>
              {testing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  جاري الفحص...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  إعادة فحص شامل
                </>
              )}
            </Button>
            <Button onClick={testCorsSpecific} variant="outline" disabled={testing}>
              فحص CORS
            </Button>
          </div>

          <Tabs defaultValue="results" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="results">النتائج</TabsTrigger>
              <TabsTrigger value="logs">السجلات</TabsTrigger>
              <TabsTrigger value="solutions">الحلول</TabsTrigger>
            </TabsList>

            <TabsContent value="results" className="space-y-4">
              {Object.entries(results).map(([name, result]: [string, any]) => (
                <Card key={name} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{name}</h4>
                    <Badge variant={result.success ? "default" : "destructive"}>{result.success ? "✓" : "✗"}</Badge>
                  </div>

                  <div className="text-sm space-y-1">
                    <div>
                      <strong>URL:</strong> <code className="text-xs">{result.url}</code>
                    </div>

                    {result.success ? (
                      <>
                        <div>
                          <strong>Status:</strong> {result.status} {result.statusText}
                        </div>
                        {result.headers && (
                          <details className="mt-2">
                            <summary className="cursor-pointer text-blue-600">عرض Headers</summary>
                            <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto">
                              {JSON.stringify(result.headers, null, 2)}
                            </pre>
                          </details>
                        )}
                        {result.body && (
                          <details className="mt-2">
                            <summary className="cursor-pointer text-blue-600">عرض Response</summary>
                            <pre className="text-xs bg-gray-100 p-2 rounded mt-1">{result.body}</pre>
                          </details>
                        )}
                      </>
                    ) : (
                      <>
                        <div className="text-red-600">
                          <strong>Error:</strong> {result.error}
                        </div>
                        <div>
                          <strong>Type:</strong> {result.name}
                        </div>
                      </>
                    )}
                  </div>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="logs" className="space-y-2">
              <div className="bg-black text-green-400 p-4 rounded font-mono text-sm max-h-96 overflow-y-auto">
                {logs.map((log, index) => (
                  <div key={index}>{log}</div>
                ))}
                {logs.length === 0 && <div>لا توجد سجلات بعد...</div>}
              </div>
            </TabsContent>

            <TabsContent value="solutions" className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>المشاكل الشائعة والحلول:</strong>
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <Card className="p-4">
                  <h4 className="font-medium mb-2">🚫 مشكلة CORS</h4>
                  <p className="text-sm text-gray-600 mb-2">
                    إذا كانت الطلبات تفشل مع خطأ CORS، أضف هذا في Program.cs:
                  </p>
                  <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                    {`// في ConfigureServices
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

// في Configure (قبل UseAuthentication)
app.UseCors("AllowReactApp");`}
                  </pre>
                </Card>

                <Card className="p-4">
                  <h4 className="font-medium mb-2">🔒 مشكلة HTTPS Certificate</h4>
                  <p className="text-sm text-gray-600 mb-2">إذا كان HTTPS لا يعمل، جرب HTTP بدلاً منه:</p>
                  <pre className="text-xs bg-gray-100 p-2 rounded">
                    {`// استخدم HTTP بدلاً من HTTPS
const API_BASE_URL = "http://localhost:5268/api"`}
                  </pre>
                </Card>

                <Card className="p-4">
                  <h4 className="font-medium mb-2">🌐 مشكلة Network/Firewall</h4>
                  <p className="text-sm text-gray-600 mb-2">تأكد من:</p>
                  <ul className="text-xs space-y-1 list-disc list-inside">
                    <li>الـ Backend يعمل فعلاً</li>
                    <li>لا يوجد Firewall يحجب الاتصال</li>
                    <li>المنافذ متاحة (5268, 7217)</li>
                    <li>لا يوجد Antivirus يحجب الاتصال</li>
                  </ul>
                </Card>

                <Card className="p-4">
                  <h4 className="font-medium mb-2">⚙️ إعدادات launchSettings.json</h4>
                  <p className="text-sm text-gray-600 mb-2">تأكد من أن launchSettings.json يحتوي على:</p>
                  <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                    {`{
  "profiles": {
    "http": {
      "commandName": "Project",
      "dotnetRunMessages": true,
      "launchBrowser": true,
      "applicationUrl": "http://localhost:5268",
      "environmentVariables": {
        "ASPNETCORE_ENVIRONMENT": "Development"
      }
    },
    "https": {
      "commandName": "Project",
      "dotnetRunMessages": true,
      "launchBrowser": true,
      "applicationUrl": "https://localhost:7217;http://localhost:5268",
      "environmentVariables": {
        "ASPNETCORE_ENVIRONMENT": "Development"
      }
    }
  }
}`}
                  </pre>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
