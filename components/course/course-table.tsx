import React, { useState } from 'react';
import { Edit, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Course } from '@/lib/types/course';
import { getFullCourseCode, formatTimeRange } from '@/lib/course-utils';
import { CategoryBadge } from '@/components/ui/category-badge';
import { useCoursesStore } from '@/lib/stores/courses';

export function CourseTable() {
  const {
    selectedCourses,
    handleSelectAll,
    handleSelectCourse,
    handleEditCourse,
    handleDeleteCourseClick,
    handleBulkDeleteClick,
    allSelected,
    someSelected,
    filteredCourses,
    groupedCourses,
  } = useCoursesStore();

  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  // Auto-expand all groups when grouping is first enabled
  React.useEffect(() => {
    const allGroupCodes = new Set(
      groupedCourses()?.flatMap((sg) => sg.codeGroups.map((cg) => cg.code))
    );
    setExpandedGroups(allGroupCodes);
  }, [groupedCourses]);

  const toggleGroup = (code: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(code)) {
      newExpanded.delete(code);
    } else {
      newExpanded.add(code);
    }
    setExpandedGroups(newExpanded);
  };

  const displayCourses = groupedCourses();
  const courseList = filteredCourses();
  const allSel = allSelected();
  const someSel = someSelected();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Mata Kuliah Ditawarkan</span>
          <div className="flex items-center gap-3">
            {selectedCourses.length > 0 && (
              <Button
                variant="destructive"
                onClick={handleBulkDeleteClick}
                size="sm"
                className="h-8 px-3"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Hapus ({selectedCourses.length})
              </Button>
            )}
            <Badge variant="secondary">
              {displayCourses
                ? `${courseList.length} kelas dalam ${displayCourses.reduce((acc, semesterGroup) => acc + semesterGroup.codeGroups.length, 0)} mata kuliah`
                : `${courseList.length} kelas dalam ${new Set(courseList.map((c: Course) => c.code)).size} mata kuliah`}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <div className="flex items-center justify-center">
                    <Checkbox
                      checked={allSel}
                      ref={(el) => {
                        if (el) {
                          const input = el.querySelector(
                            'input[type="checkbox"]'
                          ) as HTMLInputElement;
                          if (input) {
                            input.indeterminate = someSel;
                          }
                        }
                      }}
                      onCheckedChange={handleSelectAll}
                    />
                  </div>
                </TableHead>
                <TableHead className="w-8"></TableHead>
                <TableHead>Kode</TableHead>
                <TableHead>Kelas</TableHead>
                <TableHead>Mata Kuliah</TableHead>
                <TableHead>Dosen</TableHead>
                <TableHead>SKS</TableHead>
                <TableHead>Jadwal</TableHead>
                <TableHead>Ruang</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayCourses &&
                displayCourses.map((semesterGroup) => (
                  <React.Fragment key={semesterGroup.semester}>
                    {/* Semester header row */}
                    <TableRow className="bg-gray-100 hover:bg-gray-200 cursor-pointer border-b-2">
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
                    {semesterGroup.codeGroups.map((group) => (
                      <React.Fragment key={group.code}>
                        {/* Code group header row */}
                        <TableRow
                          className="bg-gray-50 hover:bg-gray-100 cursor-pointer border-b-2"
                          onClick={() => toggleGroup(group.code)}
                        >
                          <TableCell>
                            <div className="flex items-center justify-center"></div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                              >
                                {expandedGroups.has(group.code) ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell colSpan={9}>
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
                        {expandedGroups.has(group.code) &&
                          group.courses.map((course: Course) => (
                            <TableRow
                              key={course.id}
                              className={
                                selectedCourses.includes(course.id)
                                  ? 'bg-blue-50'
                                  : ''
                              }
                            >
                              <TableCell>
                                <div className="flex items-center justify-center">
                                  <Checkbox
                                    checked={selectedCourses.includes(
                                      course.id
                                    )}
                                    onCheckedChange={(checked) =>
                                      handleSelectCourse(
                                        course.id,
                                        checked as boolean
                                      )
                                    }
                                  />
                                </div>
                              </TableCell>
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
                                <div
                                  className="font-medium max-w-[200px] lg:max-w-[300px]"
                                  title={course.name}
                                >
                                  {course.name}
                                </div>
                              </TableCell>
                              <TableCell className="whitespace-normal align-middle">
                                <div
                                  className="max-w-[150px] lg:max-w-[200px]"
                                  title={course.lecturer}
                                >
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
                                <div className="flex space-x-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditCourse(course)}
                                    aria-label={`Edit mata kuliah ${getFullCourseCode(
                                      course
                                    )}`}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      handleDeleteCourseClick(course)
                                    }
                                    aria-label={`Hapus mata kuliah ${getFullCourseCode(
                                      course
                                    )}`}
                                  >
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                      </React.Fragment>
                    ))}
                  </React.Fragment>
                ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
