import { Calendar, AlertTriangle, RotateCcw, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Course } from '@/lib/types/course';
import { daysOfWeek, getCourseColor } from '@/lib/schedule-utils';
import { formatTimeRange } from '@/lib/course-utils';
import React from 'react';
import { useCreateSchedule } from '@/lib/hooks/use-create-schedule';

interface TimeConflict {
  course1: Course;
  course2: Course;
}

interface WeeklyScheduleProps {
  courses?: Course[];
  conflicts?: TimeConflict[];
  onResetSchedule?: () => void;
  onSaveSchedule?: () => void;
  showActions?: boolean;
}

export function WeeklySchedule({
  courses: propCourses,
  conflicts: propConflicts,
  onResetSchedule: propOnReset,
  onSaveSchedule: propOnSave,
  showActions = true,
}: WeeklyScheduleProps) {
  const { selectedCourses, conflicts, clearAllSelections, handleSaveSchedule } =
    useCreateSchedule();

  const finalCourses = propCourses || selectedCourses;
  const finalConflicts = propConflicts || conflicts();
  const finalOnReset = propOnReset || clearAllSelections;
  const finalOnSave = propOnSave || handleSaveSchedule;

  // Group courses by day
  const coursesByDay = daysOfWeek.reduce(
    (acc, day) => {
      acc[day] = finalCourses
        .filter((course) => course.day === day)
        .sort((a, b) => a.startTime.localeCompare(b.startTime));
      return acc;
    },
    {} as Record<string, Course[]>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Jadwal Mingguan</span>
          </CardTitle>
          {showActions && finalOnReset && finalOnSave && (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={finalOnReset}
                disabled={finalCourses.length === 0}
                className="w-full sm:w-auto"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset Jadwal
              </Button>
              <Button
                size="sm"
                onClick={finalOnSave}
                disabled={finalCourses.length === 0}
                className="w-full sm:w-auto"
              >
                <Save className="h-4 w-4 mr-2" />
                Simpan Jadwal
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {finalConflicts.length > 0 && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Terdapat {finalConflicts.length} bentrok waktu. Periksa mata
              kuliah yang ditandai.
            </AlertDescription>
          </Alert>
        )}

        <div className="overflow-x-auto pb-2">
          <div className="flex space-x-3 min-w-[900px]">
            {daysOfWeek.map((day) => (
              <div key={day} className="flex-1 min-w-[120px]">
                <div className="p-2 text-sm font-semibold text-center text-gray-700 bg-gray-100 rounded-t-lg">
                  {day}
                </div>
                <div className="p-2 space-y-2 bg-white border-x border-b rounded-b-lg min-h-[100px]">
                  {coursesByDay[day].length > 0 ? (
                    coursesByDay[day].map((course) => {
                      const isConflicted = finalConflicts.some(
                        (conflict) =>
                          conflict.course1.id === course.id ||
                          conflict.course2.id === course.id
                      );
                      return (
                        <div
                          key={course.id}
                          className={`p-2 rounded-lg text-xs ${getCourseColor(
                            course.code
                          )} ${
                            isConflicted
                              ? 'ring-2 ring-offset-1 ring-red-500'
                              : ''
                          }`}
                        >
                          <div className="font-bold truncate">
                            {course.name}
                          </div>
                          <div className="truncate font-medium">
                            {course.code}-{course.class}
                          </div>
                          <div className="mt-1">
                            {formatTimeRange(course.startTime, course.endTime)}
                          </div>
                          <div className="truncate">{course.room}</div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="flex items-center justify-center h-full text-xs text-gray-400 pt-4">
                      Tidak ada kelas
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
