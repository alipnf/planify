import { Badge } from '@/components/ui/badge';
import type { Course } from '@/lib/types/course';
import { cn } from '@/lib/utils';

interface CategoryBadgeProps {
  category: Course['category'];
  className?: string;
}

export function CategoryBadge({ category, className }: CategoryBadgeProps) {
  const isWajib = category === 'wajib';

  return (
    <Badge
      variant={isWajib ? 'default' : 'secondary'}
      className={cn('min-w-[72px] justify-center', className)}
    >
      {isWajib ? 'Wajib' : 'Pilihan'}
    </Badge>
  );
}
