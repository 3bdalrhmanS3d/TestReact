# LearnQuest Frontend 🚀

## منصة التعلم الإلكتروني - الواجهة الأمامية

منصة تعليمية متطورة مبنية بـ Next.js 14 و TypeScript، تدعم اللغة العربية بالكامل مع واجهة مستخدم حديثة ومتجاوبة.

## ✨ المميزات الرئيسية

### 🔐 نظام المصادقة والأمان

- تسجيل دخول آمن مع JWT tokens
- تذكر المستخدم (Remember Me)
- إعادة تعيين كلمة المرور
- تأكيد البريد الإلكتروني
- حماية متقدمة ضد الهجمات

### 👤 إدارة الملف الشخصي

- ملف شخصي شامل للمستخدمين
- رفع وإدارة الصور الشخصية
- تحديث البيانات الشخصية
- تتبع التقدم في الكورسات

### 📚 إدارة الكورسات

- عرض الكورسات بشكل تفاعلي
- البحث والفلترة المتقدمة
- إدارة المحتوى للمدربين
- تتبع التقدم للطلاب
- نظام التقييمات والمراجعات

### 🔔 نظام الإشعارات

- إشعارات فورية ومباشرة
- إشعارات البريد الإلكتروني
- تخصيص تفضيلات الإشعارات
- إشعارات المتصفح

### 📱 تصميم متجاوب

- دعم كامل للأجهزة المختلفة
- واجهة مستخدم عصرية
- دعم الوضع الليلي
- تجربة مستخدم محسنة

## 🛠️ التقنيات المستخدمة

### Frontend Framework

- **Next.js 14** - React framework حديث
- **TypeScript** - للتطوير الآمن
- **Tailwind CSS** - للتصميم
- **Radix UI** - مكونات UI متقدمة

### State Management

- **React Context** - لإدارة الحالة
- **Custom Hooks** - للمنطق المُعاد استخدامه
- **Zustand** - لإدارة الحالة المعقدة

### API Integration

- **Fetch API** - للتواصل مع الباك إند
- **Custom API Classes** - لتنظيم الطلبات
- **Error Handling** - معالجة شاملة للأخطاء
- **Token Management** - إدارة متقدمة للرموز

### UI Components

- **Lucide React** - أيقونات حديثة
- **Framer Motion** - للحركات والانتقالات
- **Sonner** - للإشعارات
- **Date-fns** - لمعالجة التواريخ

## 🚀 بدء التشغيل

### متطلبات النظام

```bash
Node.js >= 18.17.0
npm >= 9.0.0
```

### 1. تحميل المشروع

```bash
git clone https://github.com/learnquest/frontend.git
cd learnquest-frontend
```

### 2. تثبيت التبعيات

```bash
npm install
```

### 3. إعداد البيئة

```bash
# نسخ ملف البيئة الافتراضي
cp .env.example .env.local

# تحرير الملف وإضافة القيم المطلوبة
nano .env.local
```

### 4. إعداد متغيرات البيئة الأساسية

```env
# في ملف .env.local
NEXT_PUBLIC_API_URL=https://learnquest.runasp.net/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. تشغيل المشروع

```bash
# تشغيل في وضع التطوير
npm run dev

# بناء المشروع للإنتاج
npm run build
npm run start
```

### 6. فتح المشروع

افتح [http://localhost:3000](http://localhost:3000) في المتصفح

## 🔗 ربط الباك إند

### إعداد الاتصال بالـ API

المشروع يدعم عدة خوادم API مع آلية fallback تلقائية:

```typescript
// ترتيب الأولوية للخوادم
const API_ENDPOINTS = [
  process.env.NEXT_PUBLIC_API_URL,           // الخادم الرئيسي
  "https://learnquest.runasp.net/api",       // خادم الإنتاج
  "http://localhost:5268/api",               // خادم التطوير المحلي
  "https://localhost:7217/api",              // خادم HTTPS المحلي
]
```

### تكوين الـ API

1. **Auth API** - `lib/auth-api.ts`
   - تسجيل الدخول والخروج
   - إدارة الرموز المميزة
   - تأكيد البريد الإلكتروني

2. **Profile API** - `lib/profile-api.ts`
   - إدارة الملف الشخصي
   - رفع الصور
   - تحديث البيانات

3. **Course API** - `lib/course-api.ts`
   - إدارة الكورسات
   - التسجيل في الكورسات
   - تتبع التقدم

4. **Notification API** - `lib/notification-api.ts`
   - إدارة الإشعارات
   - الإشعارات المباشرة
   - تفضيلات الإشعارات

### استخدام الـ Hooks

```typescript
// استخدام hook المصادقة
import { useAuth } from '@/hooks/use-auth'

function MyComponent() {
  const { user, signin, logout, loading } = useAuth()
  
  // باقي الكود...
}

// استخدام hook الكورسات
import { useCourses } from '@/hooks/use-courses'

function CoursesComponent() {
  const { courses, loadCourses, createCourse } = useCourses()
  
  // باقي الكود...
}
```

## 📁 هيكل المشروع

```File

   src/
   ├── app/                    # Next.js App Router
   │   ├── auth/              # صفحات المصادقة
   │   ├── dashboard/         # لوحة التحكم
   │   ├── courses/           # صفحات الكورسات
   │   └── layout.tsx         # Layout الرئيسي
   ├── components/            # React Components
   │   ├── ui/               # مكونات UI الأساسية
   │   ├── auth/             # مكونات المصادقة
   │   ├── dashboard/        # مكونات لوحة التحكم
   │   └── courses/          # مكونات الكورسات
   ├── hooks/                # Custom React Hooks
   │   ├── use-auth.tsx      # Hook المصادقة
   │   ├── use-courses.tsx   # Hook الكورسات
   │   └── use-notifications.tsx # Hook الإشعارات
   ├── lib/                  # Utilities ومكتبات مساعدة
   │   ├── auth-api.ts       # API المصادقة
   │   ├── profile-api.ts    # API الملف الشخصي
   │   ├── course-api.ts     # API الكورسات
   │   └── notification-api.ts # API الإشعارات
   ├── types/                # TypeScript Types
   │   ├── auth.ts          # أنواع المصادقة
   │   ├── course.ts        # أنواع الكورسات
   │   └── notifications.ts  # أنواع الإشعارات
   └── styles/              # CSS وملفات التصميم
      └── globals.css      # CSS العام

```

## 🔧 إعدادات التطوير

### Scripts المتاحة

```bash
# التطوير
npm run dev              # تشغيل في وضع التطوير
npm run build           # بناء للإنتاج
npm run start           # تشغيل الإنتاج
npm run lint            # فحص الكود
npm run type-check      # فحص TypeScript

# التحليل
npm run analyze         # تحليل حجم Bundle
npm run test            # تشغيل الاختبارات
npm run test:coverage   # تشغيل مع تقرير التغطية

# التنسيق
npm run format          # تنسيق الكود
npm run format:check    # فحص التنسيق
```

### متغيرات البيئة المطلوبة

```env
# أساسية
NEXT_PUBLIC_API_URL=https://learnquest.runasp.net/api
NEXT_PUBLIC_APP_URL=http://localhost:3000

# اختيارية
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn
```

## 🧪 الاختبار

```bash
# تشغيل جميع الاختبارات
npm run test

# تشغيل في وضع المراقبة
npm run test:watch

# تقرير التغطية
npm run test:coverage
```

## 📦 البناء والنشر

### بناء محلي

```bash
npm run build
npm run start
```

### النشر على Vercel

```bash
# تثبيت Vercel CLI
npm i -g vercel

# النشر
vercel --prod
```

### النشر باستخدام Docker

```bash
# بناء Docker image
docker build -t learnquest-frontend .

# تشغيل Container
docker run -p 3000:3000 learnquest-frontend
```

## 🔍 استكشاف الأخطاء

### مشاكل شائعة

1. **خطأ في الاتصال بالـ API**

   ```bash
   # تأكد من تشغيل الباك إند
   # تحقق من متغير NEXT_PUBLIC_API_URL
   ```

2. **مشاكل في المصادقة**

   ```bash
   # امسح localStorage
   localStorage.clear()
   # أعد تحميل الصفحة
   ```

3. **مشاكل في التثبيت**

   ```bash
   # امسح node_modules و package-lock.json
   rm -rf node_modules package-lock.json
   npm install
   ```

### تفعيل وضع Debug

```env
# في .env.local
NEXT_PUBLIC_DEBUG_MODE=true
NEXT_PUBLIC_SHOW_API_LOGS=true
```

## 🤝 المساهمة

### إرشادات المساهمة

1. **Fork** المشروع
2. **إنشاء branch** جديد (`git checkout -b feature/amazing-feature`)
3. **Commit** التغييرات (`git commit -m 'Add amazing feature'`)
4. **Push** إلى الـ branch (`git push origin feature/amazing-feature`)
5. **فتح Pull Request**

### معايير الكود

- استخدم TypeScript للتطوير الآمن
- اتبع ESLint rules المعرّفة
- اكتب اختبارات للميزات الجديدة
- استخدم Prettier لتنسيق الكود

## 📝 الترخيص

هذا المشروع مرخص تحت [MIT License](LICENSE)

## 📞 الدعم والتواصل

- **البريد الإلكتروني**:info@learnquest.com
- **الموقع**: [learnquest.com](https://learnquest.com)
- **GitHub Issues**: [المشاكل والطلبات](https://github.com/learnquest/frontend/issues)

## 🔄 التحديثات

للحصول على آخر التحديثات:

```bash
git pull origin main
npm install
npm run dev
```

---
