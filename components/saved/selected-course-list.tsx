import { useSavedSchedulesStore } from '@/lib/stores/saved';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatTimeRange } from '@/lib/course-utils';
import { CategoryBadge } from '@/components/ui/category-badge';

export function SelectedCourseList() {
  const { selectedCourses } = useSavedSchedulesStore();
  const courses = selectedCourses();

  const totalCredits = courses.reduce((acc, course) => acc + course.credits, 0);

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
          {courses.length > 0 ? (
            courses.map((course) => (
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
                <CategoryBadge category={course.category} className="text-xs" />
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
