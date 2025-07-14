import { Course } from '@/lib/types/course';
import { Badge } from '@/components/ui/badge';
import { CategoryBadge } from '@/components/ui/category-badge';
import { formatTimeRange } from '@/lib/course-utils';
import { cn } from '@/lib/utils';

interface CourseCardProps {
  course: Course;
  variant?: 'default' | 'compact' | 'minimal';
  className?: string;
  showCategory?: boolean;
  showSKSBadge?: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
}

export function CourseCard({
  course,
  variant = 'default',
  className,
  showCategory = true,
  showSKSBadge = false,
  onClick,
  children,
}: CourseCardProps) {
  const baseClassName = cn(
    'rounded-lg border transition-colors',
    onClick && 'cursor-pointer hover:bg-gray-50',
    className
  );

  if (variant === 'minimal') {
    return (
      <div className={cn(baseClassName, 'p-3 bg-white')} onClick={onClick}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h4 className="font-medium text-sm text-gray-900">{course.name}</h4>
            <div className="text-xs text-gray-600 mt-1">
              {course.code} • {course.credits} SKS • Kelas {course.class}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {course.day}, {formatTimeRange(course.startTime, course.endTime)}
            </div>
            {showSKSBadge && (
              <Badge variant="outline" className="text-xs mt-2">
                {course.credits} SKS
              </Badge>
            )}
          </div>
          <div className="flex flex-col space-y-1 ml-2 flex-shrink-0">
            {showCategory && (
              <CategoryBadge category={course.category} className="text-xs" />
            )}
          </div>
        </div>
        {children}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div
        className={cn(baseClassName, 'p-3 bg-white shadow-sm')}
        onClick={onClick}
      >
        <div className="space-y-2">
          {/* Header dengan nama mata kuliah */}
          <div className="flex items-start justify-between">
            <h4 className="font-medium text-sm text-gray-900 leading-tight">
              {course.name}
            </h4>
            {showCategory && (
              <CategoryBadge
                category={course.category}
                className="text-xs ml-2 flex-shrink-0"
              />
            )}
          </div>

          {/* Info dalam grid */}
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
            <div>
              <span className="font-medium">Kode:</span> {course.code}
            </div>
            <div>
              <span className="font-medium">SKS:</span> {course.credits}
            </div>
            <div>
              <span className="font-medium">Kelas:</span> {course.class}
            </div>
            <div>
              <span className="font-medium">Ruang:</span> {course.room}
            </div>
          </div>

          {/* Info dosen dan jadwal */}
          <div className="space-y-1 text-xs text-gray-600">
            <div>
              <span className="font-medium">Dosen:</span> {course.lecturer}
            </div>
            <div>
              <span className="font-medium">Jadwal:</span> {course.day},{' '}
              {formatTimeRange(course.startTime, course.endTime)}
            </div>
          </div>
        </div>
        {children}
      </div>
    );
  }

  // Default variant
  return (
    <div
      className={cn(baseClassName, 'p-4 bg-white shadow-sm space-y-3')}
      onClick={onClick}
    >
      {/* Header dengan nama mata kuliah dan badge kategori */}
      <div className="flex items-start justify-between">
        <h4 className="font-semibold text-sm text-gray-900 leading-tight">
          {course.name}
        </h4>
        {showCategory && (
          <CategoryBadge
            category={course.category}
            className="text-xs ml-2 flex-shrink-0"
          />
        )}
      </div>

      {/* Informasi dasar mata kuliah */}
      <div className="space-y-1">
        <div className="flex items-center text-xs text-gray-600">
          <span className="font-medium">Kode:</span>
          <span className="ml-1">{course.code}</span>
          <span className="mx-2">•</span>
          <span className="font-medium">SKS:</span>
          <span className="ml-1">{course.credits}</span>
          <span className="mx-2">•</span>
          <span className="font-medium">Kelas:</span>
          <span className="ml-1">{course.class}</span>
        </div>

        <div className="flex items-center text-xs text-gray-600">
          <span className="font-medium">Dosen:</span>
          <span className="ml-1">{course.lecturer}</span>
        </div>
      </div>

      {/* Informasi jadwal */}
      <div className="pt-2 border-t border-gray-100">
        <div className="flex items-center text-xs text-gray-600">
          <span className="font-medium">Waktu:</span>
          <span className="ml-1">
            {course.day}, {formatTimeRange(course.startTime, course.endTime)}
          </span>
        </div>
        <div className="flex items-center text-xs text-gray-600 mt-1">
          <span className="font-medium">Ruang:</span>
          <span className="ml-1">{course.room}</span>
        </div>
      </div>

      {children}
    </div>
  );
}
