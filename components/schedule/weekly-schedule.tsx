import { Calendar, AlertTriangle, RotateCcw, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Course } from '@/lib/types/course';
import { daysOfWeek, getCourseColor } from '@/lib/schedule-utils';

interface TimeConflict {
  courses: [Course, Course];
  course1: Course;
  course2: Course;
  day: string;
  time: string;
}

interface WeeklyScheduleProps {
  courses: Course[];
  conflicts: TimeConflict[];
  timeSlots: string[];
  getCourseAtTime: (day: string, time: string) => Course | undefined;
  onResetSchedule?: () => void;
  onSaveSchedule?: () => void;
  showActions?: boolean;
}

export function WeeklySchedule({
  courses,
  conflicts,
  timeSlots,
  getCourseAtTime,
  onResetSchedule,
  onSaveSchedule,
  showActions = true,
}: WeeklyScheduleProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Jadwal Mingguan</span>
          </CardTitle>

          {/* Action Buttons - Only show if showActions is true and callbacks are provided */}
          {showActions && onResetSchedule && onSaveSchedule && (
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onResetSchedule}
                disabled={courses.length === 0}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset Jadwal
              </Button>

              <Button
                size="sm"
                onClick={onSaveSchedule}
                disabled={courses.length === 0}
              >
                <Save className="h-4 w-4 mr-2" />
                Simpan Jadwal
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {conflicts.length > 0 && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Terdapat {conflicts.length} bentrok waktu. Klik mata kuliah yang
              bentrok untuk melihat detail.
            </AlertDescription>
          </Alert>
        )}

        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            <div className="grid grid-cols-8 gap-1 mb-2">
              <div className="p-2 text-xs font-medium text-gray-500">Waktu</div>
              {daysOfWeek.map((day) => (
                <div
                  key={day}
                  className="p-2 text-xs font-medium text-gray-500 text-center"
                >
                  {day}
                </div>
              ))}
            </div>

            {timeSlots.map((time) => (
              <div key={time} className="grid grid-cols-8 gap-1 mb-1">
                <div className="p-2 text-xs text-gray-500 border-r">{time}</div>
                {daysOfWeek.map((day) => {
                  const course = getCourseAtTime(day, time);
                  const isConflicted =
                    course &&
                    conflicts.some(
                      (conflict) =>
                        conflict.course1.id === course.id ||
                        conflict.course2.id === course.id
                    );

                  return (
                    <div
                      key={`${day}-${time}`}
                      className="min-h-[40px] border border-gray-100"
                    >
                      {course && (
                        <div
                          className={`p-1 rounded text-xs h-full ${getCourseColor(course.code)} ${
                            isConflicted ? 'ring-2 ring-red-400' : ''
                          }`}
                        >
                          <div className="font-medium truncate">
                            {course.code}-{course.class}
                          </div>
                          <div className="truncate">{course.room}</div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
