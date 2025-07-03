import { BookOpen, Plus, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CourseEmptyStateProps {
  hasFilters: boolean;
  onAddCourse: () => void;
  onImport: () => void;
}

export function CourseEmptyState({
  hasFilters,
  onAddCourse,
  onImport,
}: CourseEmptyStateProps) {
  return (
    <div className="text-center py-12">
      <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {hasFilters
          ? 'Tidak ada mata kuliah ditemukan'
          : 'Belum ada mata kuliah'}
      </h3>
      <p className="text-gray-500 mb-4">
        {hasFilters
          ? 'Coba ubah filter atau kata kunci pencarian'
          : 'Tambahkan mata kuliah pertama untuk memulai'}
      </p>
      {!hasFilters && (
        <div className="flex justify-center gap-3">
          <Button onClick={onAddCourse}>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Mata Kuliah
          </Button>
          <Button onClick={onImport} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Import Mata Kuliah
          </Button>
        </div>
      )}
    </div>
  );
}
