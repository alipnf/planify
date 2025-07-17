'use client';

import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, X, Download, Loader2 } from 'lucide-react';
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
import { WeeklySchedule } from '@/components/schedule/weekly-schedule';
import { ImportScheduleDialog } from '@/components/saved/import-schedule-dialog';
import { ShareDialog } from '@/components/saved/share-dialog';
import { EmptyState } from '@/components/saved/empty-state';
import { ScheduleGrid } from '@/components/saved/schedule-grid';
import { SelectedCourseList } from '@/components/saved/selected-course-list';
import { useSavedSchedulesStore } from '@/lib/stores/saved';

export default function SavedSchedulesPage() {
  const previewRef = useRef<HTMLDivElement>(null);
  const {
    schedules,
    isLoading,
    isDeleting,
    error,
    selectedCourses,
    conflicts,
    showDeleteAlert,
    setShowDeleteAlert,
    scheduleToDelete,
    activeSchedule,
    setShowImportDialog,
    handleConfirmDelete,
    closePreview,
    loadSchedules,
  } = useSavedSchedulesStore();

  useEffect(() => {
    loadSchedules();
  }, [loadSchedules]);

  useEffect(() => {
    if (activeSchedule) {
      setTimeout(() => {
        previewRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }, 100);
    }
  }, [activeSchedule]);

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Jadwal Tersimpan</h1>
          <p className="text-gray-600">
            Lihat, kelola, dan bagikan jadwal yang telah Anda simpan.
          </p>
        </div>
        <div>
          <Button onClick={() => setShowImportDialog(true)}>
            <Download className="h-4 w-4 mr-2" />
            Impor Jadwal
          </Button>
        </div>
      </div>

      <main className="flex-1 space-y-4 pt-6">
        {error ? (
          <div className="text-red-500 flex items-center justify-center p-8 bg-red-50 rounded-lg">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span>{error}</span>
          </div>
        ) : !isLoading && schedules.length === 0 ? (
          <EmptyState />
        ) : (
          <ScheduleGrid />
        )}

        {activeSchedule && (
          <div ref={previewRef} className="mt-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>{activeSchedule.schedule_name}</CardTitle>
                </div>
                <Button variant="ghost" size="icon" onClick={closePreview}>
                  <X className="h-5 w-5" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-1">
                    <SelectedCourseList />
                  </div>
                  <div className="lg:col-span-2">
                    <WeeklySchedule
                      courses={selectedCourses() || []}
                      conflicts={conflicts()}
                      showActions={false}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Anda yakin ingin menghapus jadwal &quot;
              {scheduleToDelete?.schedule_name}&quot;?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat diurungkan. Jadwal akan dihapus secara
              permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleConfirmDelete();
              }}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ImportScheduleDialog />
      <ShareDialog />
    </div>
  );
}
