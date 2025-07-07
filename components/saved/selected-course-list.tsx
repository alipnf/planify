import type { Course } from '@/lib/types/course';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatTimeRange } from '@/lib/course-utils';

interface SelectedCourseListProps {
  selectedCourses: Course[];
}

export function SelectedCourseList({
  selectedCourses,
}: SelectedCourseListProps) {
  const totalCredits = selectedCourses.reduce(
    (acc, course) => acc + course.credits,
    0
  );

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Mata Kuliah Terpilih</CardTitle>
          <Badge variant="secondary">{totalCredits} SKS</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-[calc(100vh-320px)] overflow-y-auto pr-4">
          {selectedCourses.length > 0 ? (
            selectedCourses.map((course) => (
              <div
                key={course.id}
                className="p-3 bg-gray-50 rounded-lg border space-y-1"
              >
                <div className="font-semibold text-sm">{course.name}</div>
                <div className="text-xs text-gray-600">
                  {course.code} • {course.credits} SKS • {course.lecturer}
                </div>
                <div className="text-xs text-gray-600">
                  {course.day},{' '}
                  {formatTimeRange(course.startTime, course.endTime)} • Ruang{' '}
                  {course.room}
                </div>
                <Badge
                  variant={
                    course.category === 'wajib' ? 'default' : 'secondary'
                  }
                  className="text-xs"
                >
                  {course.category === 'wajib' ? 'Wajib' : 'Pilihan'}
                </Badge>
              </div>
            ))
          ) : (
            <div className="text-center text-sm text-gray-500 py-8">
              Tidak ada mata kuliah dalam jadwal ini.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
