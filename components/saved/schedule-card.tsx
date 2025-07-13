import { useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Book,
  Clock,
  Eye,
  Share2 as Share,
  Trash2,
  Upload,
} from 'lucide-react';
import type { SavedSchedule } from '@/lib/types/schedule';
import type { Course } from '@/lib/types/course';
import { useSavedSchedulesStore } from '@/lib/stores/saved';
import { cn } from '@/lib/utils';

interface ScheduleCardProps {
  schedule: SavedSchedule;
  isActive: boolean;
}

export function ScheduleCard({ schedule, isActive }: ScheduleCardProps) {
  const {
    handleDeleteClick,
    handlePreviewClick,
    handleExport,
    handleShareClick,
  } = useSavedSchedulesStore();

  const { totalCredits, courseCount } = useMemo(() => {
    const courses = schedule.schedule_data || [];
    return {
      totalCredits: courses.reduce(
        (sum: number, course: Course) => sum + course.credits,
        0
      ),
      courseCount: courses.length,
    };
  }, [schedule.schedule_data]);

  return (
    <Card
      className={cn(
        'transition-colors',
        isActive && 'bg-primary/10 border-primary'
      )}
    >
      <CardHeader>
        <CardTitle>{schedule.schedule_name}</CardTitle>
        <CardDescription>
          Dibuat pada:{' '}
          {new Date(schedule.created_at).toLocaleDateString('id-ID')}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-2">
        <div className="flex items-center text-sm text-gray-600">
          <Book className="h-4 w-4 mr-2" />
          <span>{courseCount} Mata Kuliah</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Clock className="h-4 w-4 mr-2" />
          <span>{totalCredits} SKS</span>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePreviewClick(schedule)}
        >
          <Eye className="h-4 w-4 mr-2" />
          Lihat
        </Button>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleShareClick(schedule)}
          >
            <Share className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleExport(schedule)}
          >
            <Upload className="h-4 w-4" />
          </Button>
          <Button
            variant="destructive"
            size="icon"
            onClick={() => handleDeleteClick(schedule)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
