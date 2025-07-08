'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, X, Download } from 'lucide-react';
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
import { useSavedSchedules } from '@/lib/hooks/use-saved-schedules';

export default function SavedSchedulesPage() {
  const {
    previewRef,
    schedules,
    isLoading,
    error,
    selectedCourses,
    conflicts,
    showDeleteAlert,
    setShowDeleteAlert,
    scheduleToDelete,
    activeSchedule,
    showImportDialog,
    setShowImportDialog,
    showShareDialog,
    setShowShareDialog,
    shareUrl,
    handleDeleteClick,
    handleConfirmDelete,
    handlePreviewClick,
    closePreview,
    handleExport,
    handleShareClick,
    handleImport,
  } = useSavedSchedules();

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
          <ScheduleGrid
            schedules={schedules}
            isLoading={isLoading}
            activeScheduleId={activeSchedule?.id || null}
            onDelete={handleDeleteClick}
            onPreview={handlePreviewClick}
            onExport={handleExport}
            onShare={handleShareClick}
          />
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
                    <SelectedCourseList
                      selectedCourses={selectedCourses || []}
                    />
                  </div>
                  <div className="lg:col-span-2">
                    <WeeklySchedule
                      courses={selectedCourses || []}
                      conflicts={conflicts}
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
            <AlertDialogAction onClick={handleConfirmDelete}>
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ImportScheduleDialog
        open={showImportDialog}
        onOpenChange={setShowImportDialog}
        onImport={handleImport}
      />

      <ShareDialog
        open={showShareDialog}
        onOpenChange={setShowShareDialog}
        shareUrl={shareUrl}
      />
    </div>
  );
}
