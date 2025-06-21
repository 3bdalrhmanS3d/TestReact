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
                  {process.env.NEXT_PUBLIC_API_URL || "https://localhost:7001/api (افتراضي)"}
                </code>
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
                    <h5 className="text-sm font-medium text-gray-700 mb-1">3. Health Check (اختياري):</h5>
                    <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                      {`builder.Services.AddHealthChecks();
app.MapHealthChecks("/health");`}
                    </pre>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t">
                <h4 className="font-medium mb-2">خطوات التشغيل:</h4>
                <ol className="text-xs space-y-1 list-decimal list-inside text-gray-600">
                  <li>تأكد من تشغيل الخادم الخلفي</li>
                  <li>تحقق من إعدادات CORS</li>
                  <li>تأكد من أن المنفذ صحيح (7001 أو 5000)</li>
                  <li>تحقق من أن HTTPS مفعل إذا كان مطلوباً</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
