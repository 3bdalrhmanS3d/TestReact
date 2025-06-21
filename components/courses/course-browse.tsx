"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Search, Filter, Grid, List } from "lucide-react"
import CourseCard from "./course-card"
import { courseApi } from "@/lib/course-api"
import type { PublicCourse, CourseBrowseFilter } from "@/types/course"

export default function CourseBrowse() {
  const [courses, setCourses] = useState<PublicCourse[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [showFilters, setShowFilters] = useState(false)

  const [filter, setFilter] = useState<CourseBrowseFilter>({
    pageNumber: 1,
    pageSize: 12,
    sortBy: "newest",
  })

  const [priceRange, setPriceRange] = useState([0, 1000])
  const [isFree, setIsFree] = useState<boolean | undefined>(undefined)

  useEffect(() => {
    loadCourses()
  }, [filter])

  const loadCourses = async () => {
    try {
      setLoading(true)
      const result = await courseApi.browseCourses(filter)
      setCourses(result.items)
    } catch (error) {
      console.error("Error loading courses:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (searchTerm: string) => {
    setFilter((prev) => ({
      ...prev,
      searchTerm,
      pageNumber: 1,
    }))
  }

  const handleSortChange = (sortBy: string) => {
    setFilter((prev) => ({
      ...prev,
      sortBy,
      pageNumber: 1,
    }))
  }

  const handlePriceFilter = () => {
    setFilter((prev) => ({
      ...prev,
      minPrice: priceRange[0],
      maxPrice: priceRange[1],
      isFree,
      pageNumber: 1,
    }))
  }

  const clearFilters = () => {
    setFilter({
      pageNumber: 1,
      pageSize: 12,
      sortBy: "newest",
    })
    setPriceRange([0, 1000])
    setIsFree(undefined)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="aspect-video bg-gray-200 rounded-t-lg"></div>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search and Controls */}
      <Card>
        <CardHeader>
          <CardTitle>تصفح الدورات</CardTitle>
          <CardDescription>اكتشف آلاف الدورات التعليمية في مختلف المجالات</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Bar */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="ابحث عن الدورات..."
                className="pl-10"
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              فلترة
            </Button>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="space-y-2">
                <Label>السعر</Label>
                <div className="space-y-2">
                  <Slider value={priceRange} onValueChange={setPriceRange} max={1000} step={10} className="w-full" />
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1]}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="free-only"
                    checked={isFree === true}
                    onCheckedChange={(checked) => setIsFree(checked ? true : undefined)}
                  />
                  <Label htmlFor="free-only">الدورات المجانية فقط</Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label>المستوى</Label>
                <Select onValueChange={(value) => setFilter((prev) => ({ ...prev, level: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر المستوى" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Beginner">مبتدئ</SelectItem>
                    <SelectItem value="Intermediate">متوسط</SelectItem>
                    <SelectItem value="Advanced">متقدم</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>الترتيب</Label>
                <Select value={filter.sortBy} onValueChange={handleSortChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">الأحدث</SelectItem>
                    <SelectItem value="oldest">الأقدم</SelectItem>
                    <SelectItem value="popular">الأكثر شعبية</SelectItem>
                    <SelectItem value="rating">الأعلى تقييماً</SelectItem>
                    <SelectItem value="price_low">السعر: من الأقل للأعلى</SelectItem>
                    <SelectItem value="price_high">السعر: من الأعلى للأقل</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-3 flex gap-2">
                <Button onClick={handlePriceFilter}>تطبيق الفلاتر</Button>
                <Button variant="outline" onClick={clearFilters}>
                  مسح الفلاتر
                </Button>
              </div>
            </div>
          )}

          {/* View Controls */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">{courses.length} دورة</span>
              {filter.searchTerm && <Badge variant="secondary">البحث: {filter.searchTerm}</Badge>}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Course Grid */}
      <div
        className={
          viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "space-y-4"
        }
      >
        {courses.map((course) => (
          <CourseCard key={course.courseId} course={course} variant="public" />
        ))}
      </div>

      {courses.length === 0 && !loading && (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-500">لم يتم العثور على دورات تطابق معايير البحث</p>
            <Button variant="outline" onClick={clearFilters} className="mt-4">
              مسح الفلاتر
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
