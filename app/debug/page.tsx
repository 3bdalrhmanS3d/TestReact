import AdvancedDebug from "@/components/debug/advanced-debug"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function DebugPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🔧 صفحة التشخيص المتقدم</h1>
          <p className="text-gray-600">فحص شامل لجميع المشاكل المحتملة</p>
        </div>

        <AdvancedDebug />

        <Card>
          <CardHeader>
            <CardTitle>خطوات التشخيص اليدوي</CardTitle>
            <CardDescription>جرب هذه الخطوات يدوياً للتأكد من المشكلة</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium">1. فحص الخادم مباشرة:</h4>
                <div className="space-y-1 text-sm">
                  <div>
                    <a
                      href="http://localhost:5268/health"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      🔗 http://localhost:5268/health
                    </a>
                  </div>
                  <div>
                    <a
                      href="https://localhost:7217/health"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      🔗 https://localhost:7217/health
                    </a>
                  </div>
                  <div>
                    <a
                      href="https://localhost:7217/swagger"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      🔗 https://localhost:7217/swagger
                    </a>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">2. فحص من Command Line:</h4>
                <div className="space-y-1">
                  <code className="block text-xs bg-gray-100 p-2 rounded">curl http://localhost:5268/health</code>
                  <code className="block text-xs bg-gray-100 p-2 rounded">curl https://localhost:7217/health -k</code>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">3. فحص المنافذ:</h4>
                <div className="space-y-1">
                  <code className="block text-xs bg-gray-100 p-2 rounded">netstat -an | findstr :5268</code>
                  <code className="block text-xs bg-gray-100 p-2 rounded">netstat -an | findstr :7217</code>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">4. فحص العمليات:</h4>
                <div className="space-y-1">
                  <code className="block text-xs bg-gray-100 p-2 rounded">tasklist | findstr LearnQuest</code>
                  <code className="block text-xs bg-gray-100 p-2 rounded">tasklist | findstr dotnet</code>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <h4 className="font-medium mb-2">🚨 إذا لم يعمل أي شيء:</h4>
              <ol className="text-sm space-y-1 list-decimal list-inside">
                <li>أعد تشغيل الـ Backend من Visual Studio</li>
                <li>تأكد من أن المشروع يعمل في وضع Development</li>
                <li>تحقق من أن لا يوجد خطأ في Console الخاص بالـ Backend</li>
                <li>
                  جرب تشغيل الـ Backend من Command Line: <code>dotnet run</code>
                </li>
                <li>تأكد من أن ملف appsettings.json صحيح</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
