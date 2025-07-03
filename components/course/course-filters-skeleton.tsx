import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function CourseFiltersSkeleton() {
  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Main Controls Row */}
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search and Filters - Left Side */}
            <div className="flex flex-col sm:flex-row gap-3 flex-1">
              {/* Search Input */}
              <div className="relative flex-1 min-w-0">
                <Skeleton className="h-10 w-full" />
              </div>

              {/* Semester Filter */}
              <div className="w-full sm:w-48">
                <Skeleton className="h-10 w-full" />
              </div>

              {/* Class Filter */}
              <div className="w-full sm:w-32">
                <Skeleton className="h-10 w-full" />
              </div>
            </div>

            {/* Action Buttons - Right Side */}
            <div className="flex flex-wrap gap-2 lg:flex-nowrap">
              <Skeleton className="h-10 w-20" />
              <Skeleton className="h-10 w-20" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>

          {/* View Options Row */}
          <div className="flex items-center pt-2 border-t border-gray-100">
            <div className="flex items-center space-x-2">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 