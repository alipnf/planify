import { Plus, Minus, Calendar } from 'lucide-react';
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
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface TimeConflict {
  courses: [Course, Course];
  course1: Course;
  course2: Course;
  day: string;
  time: string;
}

interface ScheduleStats {
  totalCredits: number;
  totalCourses: number;
  creditsPerDay: Record<string, number>;
  busiestDay: { day: string; credits: number };
  dailyDistribution: Array<{ day: string; credits: number; courses: number }>;
  timeSpan: { earliest: string; latest: string };
  conflicts: number;
  busyHours: number;
  earliestClass: string;
  latestClass: string;
  freeHours: number;
}

interface CourseSelectionPanelProps {
  courses: Course[];
  selectedCourses: Course[];
  onCourseToggle: (course: Course) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filterSemester: string;
  onFilterChange: (semester: string) => void;
  conflicts: TimeConflict[];
  stats: ScheduleStats;
  isLoading?: boolean;
}

export function CourseSelectionPanel({
  courses,
  selectedCourses,
  onCourseToggle,
  searchQuery,
  onSearchChange,
  filterSemester,
  onFilterChange,
  conflicts,
  stats,
  isLoading = false,
}: CourseSelectionPanelProps) {
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
                  {stats.totalCredits} SKS
                </div>
              </div>
              {conflicts.length > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {conflicts.length} Bentrok
                </Badge>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filter */}
          <div className="space-y-3">
            <Input
              placeholder="Cari mata kuliah..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />

            <Select value={filterSemester} onValueChange={onFilterChange}>
              <SelectTrigger>
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
          </div>

          {/* Course List */}
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {courses.map((course) => {
              const isSelected = selectedCourses.find(
                (c) => c.id === course.id
              );
              const isConflicted =
                isSelected &&
                conflicts.some(
                  (conflict) =>
                    conflict.course1.id === course.id ||
                    conflict.course2.id === course.id
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
                  }`}
                  onClick={() => onCourseToggle(course)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{course.name}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        <span className="font-medium">
                          {course.code}-{course.class}
                        </span>{' '}
                        • {course.credits} SKS • {course.lecturer}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {course.day}, {course.startTime}-{course.endTime} •{' '}
                        {course.room}
                      </div>
                      <Badge
                        variant="outline"
                        className={`mt-1 text-xs ${
                          course.category === 'wajib'
                            ? 'border-red-200 text-red-700'
                            : course.category === 'pilihan'
                              ? 'border-blue-200 text-blue-700'
                              : 'border-green-200 text-green-700'
                        }`}
                      >
                        {course.category.toUpperCase()}
                      </Badge>

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
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
