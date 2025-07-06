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
import { getFullCourseCode } from '@/lib/course-utils';

interface CourseTableProps {
  courses: Course[];
  selectedCourses: string[];
  onSelectAll: (checked: boolean) => void;
  onSelectCourse: (courseId: string, checked: boolean) => void;
  onEditCourse: (course: Course) => void;
  onDeleteCourse: (course: Course) => void;
  onBulkDelete: () => void;
  allSelected: boolean;
  someSelected: boolean;
  groupByCode?: boolean;
  groupedCourses?: Array<{
    code: string;
    courses: Course[];
    totalClasses: number;
  }> | null;
}

export function CourseTable({
  courses,
  selectedCourses,
  onSelectAll,
  onSelectCourse,
  onEditCourse,
  onDeleteCourse,
  onBulkDelete,
  allSelected,
  someSelected,
  groupByCode = false,
  groupedCourses = null,
}: CourseTableProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  // Auto-expand all groups when grouping is first enabled
  React.useEffect(() => {
    if (groupByCode && groupedCourses) {
      const allCodes = new Set(groupedCourses.map((group) => group.code));
      setExpandedGroups(allCodes);
    } else {
      setExpandedGroups(new Set());
    }
  }, [groupByCode, groupedCourses]);

  const toggleGroup = (code: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(code)) {
      newExpanded.delete(code);
    } else {
      newExpanded.add(code);
    }
    setExpandedGroups(newExpanded);
  };

  const displayCourses = groupByCode && groupedCourses ? groupedCourses : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Mata Kuliah Ditawarkan</span>
          <div className="flex items-center gap-3">
            {selectedCourses.length > 0 && (
              <Button
                variant="destructive"
                onClick={onBulkDelete}
                size="sm"
                className="h-8 px-3"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Hapus ({selectedCourses.length})
              </Button>
            )}
            <Badge variant="secondary">
              {groupedCourses
                ? `${courses.length} kelas dalam ${groupedCourses.length} mata kuliah`
                : `${courses.length} kelas dalam ${new Set(courses.map((c) => c.code)).size} mata kuliah`}
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
                  <Checkbox
                    checked={allSelected}
                    ref={(el) => {
                      if (el) {
                        const input = el.querySelector(
                          'input[type="checkbox"]'
                        ) as HTMLInputElement;
                        if (input) {
                          input.indeterminate = someSelected;
                        }
                      }
                    }}
                    onCheckedChange={onSelectAll}
                  />
                </TableHead>
                {groupByCode && displayCourses ? (
                  <TableHead className="w-8"></TableHead>
                ) : null}
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
              {groupByCode && displayCourses
                ? // Grouped display
                  displayCourses.map((group) => (
                    <React.Fragment key={group.code}>
                      {/* Group header row */}
                      <TableRow
                        className="bg-gray-50 hover:bg-gray-100 cursor-pointer border-b-2"
                        onClick={() => toggleGroup(group.code)}
                      >
                        <TableCell></TableCell>
                        <TableCell>
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
                        </TableCell>
                        <TableCell colSpan={8}>
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
                        group.courses.map((course) => (
                          <TableRow
                            key={course.id}
                            className={
                              selectedCourses.includes(course.id)
                                ? 'bg-blue-50'
                                : ''
                            }
                          >
                            <TableCell>
                              <Checkbox
                                checked={selectedCourses.includes(course.id)}
                                onCheckedChange={(checked) =>
                                  onSelectCourse(course.id, checked as boolean)
                                }
                              />
                            </TableCell>
                            <TableCell></TableCell>
                            <TableCell className="font-medium">
                              <div>{course.code}</div>
                              <div className="text-sm text-gray-500">
                                Semester {course.semester}
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">
                              <div>{course.class}</div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">{course.name}</div>
                            </TableCell>
                            <TableCell>{course.lecturer}</TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {course.credits} SKS
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <div>{course.day}</div>
                                <div className="text-gray-500">
                                  {course.startTime} - {course.endTime}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{course.room}</TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  course.category === 'wajib'
                                    ? 'default'
                                    : 'secondary'
                                }
                              >
                                {course.category === 'wajib'
                                  ? 'Wajib'
                                  : 'Pilihan'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => onEditCourse(course)}
                                  aria-label={`Edit mata kuliah ${getFullCourseCode(course)}`}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => onDeleteCourse(course)}
                                  aria-label={`Hapus mata kuliah ${getFullCourseCode(course)}`}
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                    </React.Fragment>
                  ))
                : // Regular display
                  courses.map((course) => (
                    <TableRow
                      key={course.id}
                      className={
                        selectedCourses.includes(course.id) ? 'bg-blue-50' : ''
                      }
                    >
                      <TableCell>
                        <Checkbox
                          checked={selectedCourses.includes(course.id)}
                          onCheckedChange={(checked) =>
                            onSelectCourse(course.id, checked as boolean)
                          }
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        <div>{course.code}</div>
                        <div className="text-sm text-gray-500">
                          Semester {course.semester}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        <div>{course.class}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{course.name}</div>
                      </TableCell>
                      <TableCell>{course.lecturer}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{course.credits} SKS</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{course.day}</div>
                          <div className="text-gray-500">
                            {course.startTime} - {course.endTime}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{course.room}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            course.category === 'wajib'
                              ? 'default'
                              : 'secondary'
                          }
                        >
                          {course.category === 'wajib' ? 'Wajib' : 'Pilihan'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEditCourse(course)}
                            aria-label={`Edit mata kuliah ${getFullCourseCode(course)}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDeleteCourse(course)}
                            aria-label={`Hapus mata kuliah ${getFullCourseCode(course)}`}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
