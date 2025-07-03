import { Edit, Trash2 } from 'lucide-react';
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
import { formatDay, getFullCourseCode } from '@/lib/course-utils';

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
}: CourseTableProps) {
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
            <Badge variant="secondary">{courses.length} mata kuliah</Badge>
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
              {courses.map((course) => (
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
                      <div>{formatDay(course.day)}</div>
                      <div className="text-gray-500">
                        {course.startTime} - {course.endTime}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{course.room}</TableCell>
                  <TableCell>
                    <Badge
                      variant="default"
                      className={
                        course.category === 'wajib'
                          ? 'bg-green-100 text-green-800 border-green-200'
                          : 'bg-blue-100 text-blue-800 border-blue-200'
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
