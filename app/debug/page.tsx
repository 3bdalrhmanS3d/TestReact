import ApiDebug from "@/components/debug/api-debug"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function DebugPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">صفحة التشخيص</h1>
          <p className="text-gray-600">فحص حالة الاتصال والإعدادات</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ApiDebug />

          <Card>
            <CardHeader>
              <CardTitle>متغيرات البيئة</CardTitle>
              <CardDescription>الإعدادات الحالية للتطبيق</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">NEXT_PUBLIC_API_URL:</span>
                  <Badge variant={process.env.NEXT_PUBLIC_API_URL ? "default" : "secondary"}>
                    {process.env.NEXT_PUBLIC_API_URL ? "محدد" : "افتراضي"}
                  </Badge>
                </div>
                <code className="block text-xs bg-gray-100 p-2 rounded break-all">
                  {process.env.NEXT_PUBLIC_API_URL || "https://localhost:7217/api (محدث)"}
                </code>
              </div>

              <div className="pt-3 border-t">
                <h4 className="font-medium mb-3">معلومات الخادم الحالي:</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span>HTTPS:</span>
                    <code className="bg-green-100 px-2 py-1 rounded">https://localhost:7217</code>
                  </div>
                  <div className="flex justify-between">
                    <span>HTTP:</span>
                    <code className="bg-blue-100 px-2 py-1 rounded">http://localhost:5268</code>
                  </div>
                  <div className="flex justify-between">
                    <span>Health Check:</span>
                    <code className="bg-purple-100 px-2 py-1 rounded">https://localhost:7217/health</code>
                  </div>
                  <div className="flex justify-between">
                    <span>Swagger:</span>
                    <code className="bg-orange-100 px-2 py-1 rounded">https://localhost:7217/swagger</code>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t">
                <h4 className="font-medium mb-3">إعدادات Program.cs المطلوبة:</h4>
                <div className="space-y-3">
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-1">1. CORS Configuration:</h5>
                    <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                      {`builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});`}
                    </pre>
                  </div>

                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-1">2. Middleware Order:</h5>
                    <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                      {`app.UseRouting();
app.UseCors("AllowReactApp");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();`}
                    </pre>
                  </div>

                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-1">3. Health Check (متوفر):</h5>
                    <pre className="text-xs bg-green-50 p-2 rounded overflow-x-auto">
                      {`✅ Health Check متوفر على: /health
✅ Swagger متوفر على: /swagger`}
                    </pre>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t">
                <h4 className="font-medium mb-2">خطوات التشغيل:</h4>
                <ol className="text-xs space-y-1 list-decimal list-inside text-gray-600">
                  <li>✅ الخادم الخلفي يعمل على المنفذ 7217</li>
                  <li>🔄 تحديث عنوان API في التطبيق</li>
                  <li>⚠️ تحقق من إعدادات CORS</li>
                  <li>🧪 اختبر الاتصال من صفحة التشخيص</li>
                </ol>
              </div>

              <div className="pt-3 border-t bg-blue-50 p-3 rounded">
                <h4 className="font-medium mb-2 text-blue-800">🔗 روابط مفيدة:</h4>
                <div className="space-y-1 text-xs">
                  <div>
                    <a
                      href="https://localhost:7217/health"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      🏥 Health Check
                    </a>
                  </div>
                  <div>
                    <a
                      href="https://localhost:7217/swagger"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      📚 Swagger Documentation
                    </a>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
