import { CourseFiltersSkeleton } from './course-filters-skeleton';
import { CourseTableSkeleton } from './course-table-skeleton';

interface CoursesSkeletonProps {
  rows?: number;
}

export function CoursesSkeleton({ rows = 5 }: CoursesSkeletonProps) {
  return (
    <>
      <CourseFiltersSkeleton />
      <CourseTableSkeleton rows={rows} />
    </>
  );
} 