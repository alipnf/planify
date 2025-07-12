import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Course } from '@/lib/types/course';
import { getFullCourseCode } from '@/lib/course-utils';

interface CourseDeleteDialogsProps {
  // Single delete
  showDeleteDialog: boolean;
  courseToDelete: Course | null;
  onDeleteDialogChange: (open: boolean) => void;
  onConfirmDelete: () => Promise<void>;

  // Bulk delete
  showBulkDeleteDialog: boolean;
  selectedCourseNames: string[];
  selectedCount: number;
  onBulkDeleteDialogChange: (open: boolean) => void;
  onConfirmBulkDelete: () => Promise<void>;
}

export function CourseDeleteDialogs({
  showDeleteDialog,
  courseToDelete,
  onDeleteDialogChange,
  onConfirmDelete,
  showBulkDeleteDialog,
  selectedCourseNames,
  selectedCount,
  onBulkDeleteDialogChange,
  onConfirmBulkDelete,
}: CourseDeleteDialogsProps) {
  return (
    <>
      {/* Single Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={onDeleteDialogChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus Mata Kuliah</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus mata kuliah{' '}
              <span className="font-semibold text-gray-900">
                {courseToDelete &&
                  `${getFullCourseCode(courseToDelete)} - ${courseToDelete.name}`}
              </span>
              ? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={onConfirmDelete}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Hapus Mata Kuliah
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog
        open={showBulkDeleteDialog}
        onOpenChange={onBulkDeleteDialogChange}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus Mata Kuliah</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus {selectedCount} mata kuliah yang
              dipilih?
              {selectedCourseNames.length <= 3 ? (
                <span className="mt-2 block space-y-1">
                  {selectedCourseNames.map((name, index) => (
                    <span
                      key={index}
                      className="block text-sm font-medium text-gray-900"
                    >
                      • {name}
                    </span>
                  ))}
                </span>
              ) : (
                <span className="mt-2 block space-y-1">
                  {selectedCourseNames.slice(0, 3).map((name, index) => (
                    <span
                      key={index}
                      className="block text-sm font-medium text-gray-900"
                    >
                      • {name}
                    </span>
                  ))}
                  <span className="block text-sm text-gray-600">
                    dan {selectedCourseNames.length - 3} mata kuliah lainnya...
                  </span>
                </span>
              )}
              <span className="mt-2 block text-sm text-red-600">
                Tindakan ini tidak dapat dibatalkan.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={onConfirmBulkDelete}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Hapus {selectedCount} Mata Kuliah
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
