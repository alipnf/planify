import React, { useState, useMemo } from 'react';
import {
  Plus,
  Minus,
  ChevronDown,
  ChevronRight,
  Calendar,
  Search,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { Course } from '@/lib/interfaces/course';
import {
  formatTimeRange,
  getAvailableClasses,
  groupCoursesByCode,
  sortCourseClasses,
} from '@/lib/course-utils';
import { CategoryBadge } from '@/components/ui/category-badge';
import { useCreateSchedule } from '@/lib/hooks/use-create-schedule';
import Link from 'next/link';

export function CourseSelectionTable() {
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
    conflicts,
    stats,
    isLoading,
  } = useCreateSchedule();

  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const courses = filteredCourses();

  const availableClasses = useMemo(
    () => getAvailableClasses(courses),
    [courses]
  );

  // Group courses by semester and then by code
  const groupedCourses = useMemo(() => {
    // First group by semester
    const semesterGroups: Record<string, Course[]> = courses.reduce(
      (groups: Record<string, Course[]>, course) => {
        const semester = course.semester;
        if (!groups[semester]) {
          groups[semester] = [];
        }
        groups[semester].push(course);
        return groups;
      },
      {}
    );

    // Then for each semester, group by code
    return Object.entries(semesterGroups)
      .map(([semester, coursesInSemester]) => {
        const groupedByCode = groupCoursesByCode(coursesInSemester);
        const codeGroups = Object.entries(groupedByCode)
          .map(([code, coursesInGroup]) => ({
            code,
            courses: sortCourseClasses(coursesInGroup),
            totalClasses: coursesInGroup.length,
          }))
          .sort((a, b) => a.code.localeCompare(b.code));

        return {
          semester,
          codeGroups,
          totalCourses: coursesInSemester.length,
        };
      })
      .sort((a, b) => a.semester.localeCompare(b.semester));
  }, [courses]);

  // Auto-expand all groups when component mounts
  React.useEffect(() => {
    if (groupedCourses.length > 0 && expandedGroups.size === 0) {
      const allGroupCodes = new Set(
        groupedCourses.flatMap((sg) =>
          sg.codeGroups.map((cg) => `${sg.semester}-${cg.code}`)
        )
      );
      setExpandedGroups(allGroupCodes);
    }
  }, [groupedCourses.length]);

  const toggleGroup = (semester: string, code: string) => {
    const groupKey = `${semester}-${code}`;
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupKey)) {
      newExpanded.delete(groupKey);
    } else {
      newExpanded.add(groupKey);
    }
    setExpandedGroups(newExpanded);
  };

  const isSelected = (course: Course) =>
    selectedCourses.some((c) => c.id === course.id);

  const isConflicted = (course: Course) => {
    if (!isSelected(course)) return false;
    return conflicts().some(
      (conflict) =>
        conflict.course1.id === course.id || conflict.course2.id === course.id
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Pilih Mata Kuliah</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Pilih Mata Kuliah</span>
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">
                  {selectedCourses.length} Mata Kuliah
                </div>
                <div
                  className={`text-xs ${
                    stats().totalCredits > 24
                      ? 'text-red-600 font-semibold'
                      : stats().totalCredits >= 20
                        ? 'text-yellow-600 font-medium'
                        : 'text-gray-500'
                  }`}
                >
                  {stats().totalCredits}/24 SKS
                  {stats().totalCredits > 24 && ' (Melebihi batas)'}
                  {stats().totalCredits >= 20 &&
                    stats().totalCredits < 24 &&
                    ' (Mendekati batas)'}
                  {stats().totalCredits === 24 && ' (Batas maksimal)'}
                </div>
              </div>
              {conflicts().length > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {conflicts().length} Bentrok
                </Badge>
              )}
              {stats().totalCredits > 24 && (
                <Badge variant="destructive" className="text-xs">
                  Melebihi 24 SKS
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
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8"></TableHead>
                  <TableHead>Kode</TableHead>
                  <TableHead>Kelas</TableHead>
                  <TableHead>Mata Kuliah</TableHead>
                  <TableHead>Dosen</TableHead>
                  <TableHead>SKS</TableHead>
                  <TableHead>Jadwal</TableHead>
                  <TableHead>Ruang</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead className="w-16">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {groupedCourses.map((semesterGroup) => (
                  <React.Fragment key={semesterGroup.semester}>
                    {/* Semester header row */}
                    <TableRow className="bg-gray-100 border-b-2 hover:bg-gray-100">
                      <TableCell colSpan={11}>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-xl">
                            Semester {semesterGroup.semester}
                          </span>
                          <Badge variant="secondary">
                            {semesterGroup.totalCourses} kelas dalam{' '}
                            {semesterGroup.codeGroups.length} mata kuliah
                          </Badge>
                        </div>
                      </TableCell>
                    </TableRow>

                    {/* Code groups within semester */}
                    {semesterGroup.codeGroups.map((group) => {
                      const groupKey = `${semesterGroup.semester}-${group.code}`;
                      const isExpanded = expandedGroups.has(groupKey);

                      return (
                        <React.Fragment key={group.code}>
                          {/* Code group header row */}
                          <TableRow
                            className="bg-gray-50 cursor-pointer border-b-2 hover:bg-gray-50"
                            onClick={() =>
                              toggleGroup(semesterGroup.semester, group.code)
                            }
                          >
                            <TableCell>
                              <div className="flex items-center justify-center">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                >
                                  {isExpanded ? (
                                    <ChevronDown className="h-4 w-4" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell colSpan={10}>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <span className="font-semibold text-lg">
                                    {group.code}
                                  </span>
                                  <Badge variant="secondary">
                                    {group.totalClasses} kelas
                                  </Badge>
                                  <span className="text-sm text-gray-600">
                                    {group.courses[0]?.name}
                                  </span>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>

                          {/* Group courses (when expanded) */}
                          {isExpanded &&
                            group.courses.map((course: Course) => {
                              const courseSelected = isSelected(course);
                              const courseConflicted = isConflicted(course);

                              return (
                                <TableRow
                                  key={course.id}
                                  className={`${
                                    courseSelected
                                      ? courseConflicted
                                        ? 'bg-red-200 hover:bg-red-200'
                                        : 'bg-blue-200 hover:bg-blue-200'
                                      : 'hover:bg-transparent'
                                  } cursor-pointer`}
                                  onClick={() => toggleCourse(course)}
                                >
                                  <TableCell>
                                    <div className="flex items-center justify-center"></div>
                                  </TableCell>
                                  <TableCell className="font-medium">
                                    <div>{course.code}</div>
                                  </TableCell>
                                  <TableCell className="font-medium">
                                    <div>{course.class}</div>
                                  </TableCell>
                                  <TableCell className="whitespace-normal align-middle">
                                    <div className="font-medium max-w-[200px] lg:max-w-[300px]">
                                      {course.name}
                                    </div>
                                  </TableCell>
                                  <TableCell className="whitespace-normal align-middle">
                                    <div className="max-w-[150px] lg:max-w-[200px]">
                                      {course.lecturer}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant="outline">
                                      {course.credits} SKS
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <div className="text-sm">
                                      <div>{course.day}</div>
                                      <div className="text-gray-500">
                                        {formatTimeRange(
                                          course.startTime,
                                          course.endTime
                                        )}
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell>{course.room}</TableCell>
                                  <TableCell>
                                    <CategoryBadge category={course.category} />
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center justify-center">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          toggleCourse(course);
                                        }}
                                      >
                                        {courseSelected ? (
                                          <Minus className="h-4 w-4" />
                                        ) : (
                                          <Plus className="h-4 w-4" />
                                        )}
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                        </React.Fragment>
                      );
                    })}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
