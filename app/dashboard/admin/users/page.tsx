"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Users, Search, MoreHorizontal, Eye, Edit, Ban, CheckCircle, UserPlus, Download, Mail } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

export default function AdminUsersPage() {
  const { user } = useAuth()

  // Mock data - replace with actual API calls
  const users = [
    {
      userId: 1,
      fullName: "أحمد محمد",
      emailAddress: "ahmed@example.com",
      role: "User",
      isActive: true,
      createdAt: "2024-01-15",
      lastLogin: "2024-01-20",
      coursesEnrolled: 5,
    },
    {
      userId: 2,
      fullName: "فاطمة علي",
      emailAddress: "fatima@example.com",
      role: "Instructor",
      isActive: true,
      createdAt: "2024-01-10",
      lastLogin: "2024-01-19",
      coursesEnrolled: 0,
    },
    // Add more mock users...
  ]

  // Check if user is admin
  if (user?.role !== "Admin") {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold mb-2">غير مصرح</h3>
            <p className="text-gray-600">يجب أن تكون مديرًا للوصول لهذه الصفحة</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const totalUsers = users.length
  const activeUsers = users.filter((u) => u.isActive).length
  const instructors = users.filter((u) => u.role === "Instructor").length
  const students = users.filter((u) => u.role === "User").length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">إدارة المستخدمين</h1>
          <p className="text-gray-600">إدارة جميع المستخدمين في المنصة</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            تصدير
          </Button>
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            إضافة مستخدم
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">إجمالي المستخدمين</p>
                <p className="text-2xl font-bold">{totalUsers}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">المستخدمين النشطين</p>
                <p className="text-2xl font-bold">{activeUsers}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">المدربين</p>
                <p className="text-2xl font-bold">{instructors}</p>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">الطلاب</p>
                <p className="text-2xl font-bold">{students}</p>
              </div>
              <Users className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input placeholder="البحث في المستخدمين..." className="pr-10" />
        </div>
        <Select>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="نوع المستخدم" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع المستخدمين</SelectItem>
            <SelectItem value="user">طلاب</SelectItem>
            <SelectItem value="instructor">مدربين</SelectItem>
            <SelectItem value="admin">مديرين</SelectItem>
          </SelectContent>
        </Select>
        <Select>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="الحالة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع الحالات</SelectItem>
            <SelectItem value="active">نشط</SelectItem>
            <SelectItem value="inactive">غير نشط</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>المستخدمين ({totalUsers})</CardTitle>
          <CardDescription>قائمة بجميع المستخدمين في المنصة</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>المستخدم</TableHead>
                <TableHead>البريد الإلكتروني</TableHead>
                <TableHead>الدور</TableHead>
                <TableHead>الدورات</TableHead>
                <TableHead>آخر دخول</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>تاريخ التسجيل</TableHead>
                <TableHead className="text-left">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.userId}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-gray-500" />
                      </div>
                      <div>
                        <div className="font-medium">{user.fullName}</div>
                        <div className="text-sm text-gray-500">ID: {user.userId}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{user.emailAddress}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        user.role === "Admin" ? "destructive" : user.role === "Instructor" ? "default" : "secondary"
                      }
                    >
                      {user.role === "Admin" && "مدير"}
                      {user.role === "Instructor" && "مدرب"}
                      {user.role === "User" && "طالب"}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.coursesEnrolled}</TableCell>
                  <TableCell>{new Date(user.lastLogin).toLocaleDateString("ar-SA")}</TableCell>
                  <TableCell>
                    <Badge variant={user.isActive ? "default" : "secondary"}>{user.isActive ? "نشط" : "غير نشط"}</Badge>
                  </TableCell>
                  <TableCell>{new Date(user.createdAt).toLocaleDateString("ar-SA")}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          عرض الملف الشخصي
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          تعديل
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Mail className="mr-2 h-4 w-4" />
                          إرسال رسالة
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          {user.isActive ? (
                            <>
                              <Ban className="mr-2 h-4 w-4" />
                              إيقاف الحساب
                            </>
                          ) : (
                            <>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              تفعيل الحساب
                            </>
                          )}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
