'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, X, Upload } from 'lucide-react';
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
import { useScheduleManagement } from '@/lib/hooks/use-schedule-management';
import { ImportScheduleDialog } from '@/components/saved/import-schedule-dialog';
import { ShareDialog } from '@/components/saved/share-dialog';
import { EmptyState } from '@/components/saved/empty-state';
import { ScheduleGrid } from '@/components/saved/schedule-grid';
import { SelectedCourseList } from '@/components/saved/selected-course-list';
import { useSavedSchedules } from '@/lib/hooks/use-saved-schedules';
import type { SavedSchedule } from '@/lib/services/schedules';
import type { Course } from '@/lib/types/course';

export default function SavedSchedulesPage() {
  // --- Hooks ---
  const {
    schedules,
    isLoading,
    error,
    deleteSchedule,
    importSchedule,
    updateSharing,
  } = useSavedSchedules();

  const {
    selectedCourses,
    conflicts,
    timeSlots,
    getCourseAtTime,
    setSelectedCoursesDirectly,
  } = useScheduleManagement();

  // --- UI State ---
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [scheduleToDelete, setScheduleToDelete] =
    useState<SavedSchedule | null>(null);
  const [activeSchedule, setActiveSchedule] = useState<SavedSchedule | null>(
    null
  );
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  // --- Effects ---
  useEffect(() => {
    if (activeSchedule) {
      setSelectedCoursesDirectly(activeSchedule.schedule_data || []);
    } else {
      setSelectedCoursesDirectly([]);
    }
  }, [activeSchedule, setSelectedCoursesDirectly]);

  // --- Handlers ---
  const handleDeleteClick = (schedule: SavedSchedule) => {
    setScheduleToDelete(schedule);
    setShowDeleteAlert(true);
  };

  const handleConfirmDelete = async () => {
    if (!scheduleToDelete) return;
    const success = await deleteSchedule(scheduleToDelete.id);
    if (success && activeSchedule?.id === scheduleToDelete.id) {
      setActiveSchedule(null);
    }
    setShowDeleteAlert(false);
    setScheduleToDelete(null);
  };

  const handlePreviewClick = (schedule: SavedSchedule) => {
    setActiveSchedule(schedule);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const closePreview = () => {
    setActiveSchedule(null);
  };

  const handleExport = (schedule: SavedSchedule) => {
    const exportData = {
      type: 'planify-schedule',
      version: 1,
      scheduleName: schedule.schedule_name,
      data: schedule.schedule_data,
    };
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri =
      'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `${schedule.schedule_name}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleShareClick = async (schedule: SavedSchedule) => {
    let targetSchedule = schedule;
    if (!targetSchedule.is_shared) {
      const updatedSchedule = await updateSharing(targetSchedule.id, true);
      if (!updatedSchedule) return; // Error handled in hook
      targetSchedule = updatedSchedule;
    }
    const url = `${window.location.origin}/share/${targetSchedule.share_id}`;
    setShareUrl(url);
    setShowShareDialog(true);
  };

  const handleImport = async (name: string, courses: Course[]) => {
    await importSchedule(name, courses);
    setShowImportDialog(false);
  };

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
            <Upload className="h-4 w-4 mr-2" />
            Impor Jadwal
          </Button>
        </div>
      </div>

      <main className="flex-1 space-y-4 pt-6">
        {activeSchedule && (
          <div className="mb-8">
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
                      timeSlots={timeSlots}
                      getCourseAtTime={getCourseAtTime}
                      showActions={false}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

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
            onDelete={handleDeleteClick}
            onPreview={handlePreviewClick}
            onExport={handleExport}
            onShare={handleShareClick}
          />
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
