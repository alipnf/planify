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
import { getFullCourseCode } from '@/lib/course-utils';
import { useCoursesStore } from '@/lib/stores/courses';
import { Loader2 } from 'lucide-react';

export function CourseDeleteDialogs() {
  const {
    showDeleteDialog,
    setShowDeleteDialog,
    courseToDelete,
    handleConfirmDelete,
    showBulkDeleteDialog,
    setShowBulkDeleteDialog,
    handleConfirmBulkDelete,
    selectedCourseNames,
    selectedCourses,
    isDeleting,
  } = useCoursesStore();

  const selectedCount = selectedCourses.length;
  const selCourseNames = selectedCourseNames();

  return (
    <>
      {/* Single Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
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
            <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleConfirmDelete();
              }}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
              disabled={isDeleting}
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Hapus Mata Kuliah
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog
        open={showBulkDeleteDialog}
        onOpenChange={setShowBulkDeleteDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus Mata Kuliah</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus {selectedCount} mata kuliah yang
              dipilih?
              {selCourseNames.length <= 3 ? (
                <span className="mt-2 block space-y-1">
                  {selCourseNames.map((name: string, index: number) => (
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
                  {selCourseNames
                    .slice(0, 3)
                    .map((name: string, index: number) => (
                      <span
                        key={index}
                        className="block text-sm font-medium text-gray-900"
                      >
                        • {name}
                      </span>
                    ))}
                  <span className="block text-sm text-gray-600">
                    dan {selCourseNames.length - 3} mata kuliah lainnya...
                  </span>
                </span>
              )}
              <span className="mt-2 block text-sm text-red-600">
                Tindakan ini tidak dapat dibatalkan.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleConfirmBulkDelete();
              }}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
              disabled={isDeleting}
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Hapus {selectedCount} Mata Kuliah
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
