import { Badge } from '@/components/ui/badge';
import type { Course } from '@/lib/types/course';

interface CategoryBadgeProps {
  category: Course['category'];
  className?: string;
}

export function CategoryBadge({ category, className }: CategoryBadgeProps) {
  const isWajib = category === 'wajib';

  return (
    <Badge variant={isWajib ? 'default' : 'secondary'} className={className}>
      {isWajib ? 'Wajib' : 'Pilihan'}
    </Badge>
  );
}

