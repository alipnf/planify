import { useSavedSchedulesStore } from '@/lib/stores/saved';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CourseCard } from '@/components/ui/course-card';
import { Course } from '@/lib/interfaces/course';

interface SelectedCourseListProps {
  selectedCourses?: Course[];
}

export function SelectedCourseList({
  selectedCourses: propsCourses,
}: SelectedCourseListProps) {
  const { selectedCourses } = useSavedSchedulesStore();

  const courses = propsCourses || selectedCourses();

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
              <CourseCard key={course.id} course={course} variant="default" />
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
