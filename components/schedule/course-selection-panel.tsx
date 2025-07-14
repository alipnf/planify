import { Plus, Minus, Calendar, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Course } from '@/lib/types/course';
import { formatTimeRange } from '@/lib/course-utils';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  getAvailableClasses,
  groupCoursesByCode,
  sortCourseClasses,
  getFullCourseCode,
} from '@/lib/course-utils';
import React from 'react';
import { CategoryBadge } from '@/components/ui/category-badge';
import { useCreateSchedule } from '@/lib/hooks/use-create-schedule';

export function CourseSelectionPanel() {
  const {
    filteredCourses,
    selectedCourses,
    toggleCourse,
    searchQuery,
    setSearchQuery,
    filterSemester,
    setFilterSemester,
    filterClass,
    setFilterClass,
    groupByCode,
    setGroupByCode,
    conflicts,
    stats,
    isLoading,
  } = useCreateSchedule();

  const courses = filteredCourses();
  const availableClasses = React.useMemo(
    () => getAvailableClasses(courses),
    [courses]
  );
  const groupedCourses = React.useMemo(() => {
    if (!groupByCode) return null;
    const grouped = groupCoursesByCode(courses);
    return Object.entries(grouped)
      .map(([code, coursesInGroup]) => ({
        code,
        courses: sortCourseClasses(coursesInGroup),
        totalClasses: coursesInGroup.length,
      }))
      .sort((a, b) => a.code.localeCompare(b.code));
  }, [courses, groupByCode]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Pilih Mata Kuliah</span>
              {/* SKS Display - Loading State */}
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    0 Mata Kuliah
                  </div>
                  <div className="text-xs text-gray-500">0 SKS</div>
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search and Filter Skeleton */}
            <div className="space-y-3">
              <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
            </div>

            {/* Course List Skeleton */}
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="p-3 border rounded-lg animate-pulse">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                      <div className="h-5 bg-gray-200 rounded w-16"></div>
                    </div>
                    <div className="ml-2">
                      <div className="h-6 w-6 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Belum ada data mata kuliah
          </h3>
          <div className="flex flex-col items-center gap-3">
            <p className="text-gray-500 mb-4">
              Silakan tambahkan mata kuliah terlebih dahulu.
            </p>
            <Button asChild>
              <Link href="/courses">Buka Halaman Courses</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Course Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Pilih Mata Kuliah</span>
            {/* SKS Display */}
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">
                  {selectedCourses.length} Mata Kuliah
                </div>
                <div className="text-xs text-gray-500">
                  {stats().totalCredits} SKS
                </div>
              </div>
              {conflicts().length > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {conflicts().length} Bentrok
                </Badge>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filter */}
          <div className="space-y-4">
            <div className="flex flex-col gap-3 lg:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Cari mata kuliah..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-10 w-full pl-9"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Select
                  value={filterSemester}
                  onValueChange={setFilterSemester}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Filter Semester" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Semester</SelectItem>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                      <SelectItem key={sem} value={sem.toString()}>
                        Semester {sem}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={filterClass}
                  onValueChange={setFilterClass}
                  disabled={availableClasses.length === 0}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Filter Kelas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Kelas</SelectItem>
                    {availableClasses.map((classVal) => (
                      <SelectItem key={classVal} value={classVal}>
                        Kelas {classVal}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center pt-3 border-t border-gray-100">
              <div className="flex items-center space-x-2">
                <Switch
                  id="group-by-code"
                  checked={groupByCode}
                  onCheckedChange={setGroupByCode}
                />
                <Label
                  htmlFor="group-by-code"
                  className="text-sm font-medium text-gray-700"
                >
                  Kelompokkan berdasarkan kode mata kuliah
                </Label>
              </div>
            </div>
          </div>

          {/* Course List */}
          <div className="space-y-2 max-h-[calc(100vh-420px)] overflow-y-auto pr-4">
            {groupByCode && groupedCourses
              ? // Grouped View
                groupedCourses.map((group) => (
                  <div key={group.code} className="p-2 border rounded-lg">
                    <h4 className="font-semibold text-sm mb-2">
                      {group.code} - {group.courses[0]?.name} (
                      {group.totalClasses} kelas)
                    </h4>
                    {group.courses.map((course) => renderCourseItem(course))}
                  </div>
                ))
              : // Default List View
                courses.map((course) => renderCourseItem(course))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  function renderCourseItem(course: Course) {
    const isSelected = selectedCourses.some((c) => c.id === course.id);
    const isConflicted =
      isSelected &&
      conflicts().some(
        (conflict) =>
          conflict.course1.id === course.id || conflict.course2.id === course.id
      );

    return (
      <div
        key={course.id}
        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
          isSelected
            ? isConflicted
              ? 'border-red-200 bg-red-50 hover:bg-red-100'
              : 'border-blue-200 bg-blue-50 hover:bg-blue-100'
            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
        } ${groupByCode ? 'ml-4 my-2' : ''}`}
        onClick={() => toggleCourse(course)}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="font-medium text-sm">
              {groupByCode ? `Kelas ${course.class}` : course.name}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              <span className="font-medium">{getFullCourseCode(course)}</span> •{' '}
              {course.credits} SKS • {course.lecturer}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {course.day}, {formatTimeRange(course.startTime, course.endTime)}{' '}
              • {course.room}
            </div>
            <CategoryBadge
              category={course.category}
              className="text-xs mt-1"
            />

            {isConflicted && (
              <div className="text-xs text-red-600 mt-1">
                ⚠️ Bentrok waktu dengan mata kuliah lain
              </div>
            )}
          </div>

          <div className="ml-2">
            {isSelected ? (
              <div
                className={`p-1 rounded ${isConflicted ? 'text-red-600' : 'text-blue-600'}`}
              >
                <Minus className="h-4 w-4" />
              </div>
            ) : (
              <div className="p-1 rounded text-gray-400 hover:text-gray-600">
                <Plus className="h-4 w-4" />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}
