import type { SavedSchedule } from '@/lib/services/schedules';
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ScheduleCard } from './schedule-card';

interface ScheduleGridProps {
  schedules: SavedSchedule[];
  isLoading: boolean;
  onDelete: (schedule: SavedSchedule) => void;
  onPreview: (schedule: SavedSchedule) => void;
  onExport: (schedule: SavedSchedule) => void;
  onShare: (schedule: SavedSchedule) => void;
}

function ScheduleSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent className="space-y-2">
        <Skeleton className="h-4 w-2/4" />
        <Skeleton className="h-4 w-2/4" />
      </CardContent>
      <CardFooter>
        <Skeleton className="h-8 w-24" />
      </CardFooter>
    </Card>
  );
}

export function ScheduleGrid({
  schedules,
  isLoading,
  onDelete,
  onPreview,
  onExport,
  onShare,
}: ScheduleGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <ScheduleSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {schedules.map((schedule) => (
        <ScheduleCard
          key={schedule.id}
          schedule={schedule}
          onDelete={onDelete}
          onPreview={onPreview}
          onExport={onExport}
          onShare={onShare}
        />
      ))}
    </div>
  );
}
