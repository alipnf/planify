'use client';

import { useMemo } from 'react';
import { WeeklySchedule } from '@/components/schedule/weekly-schedule';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Save, Eye, Loader2, Check } from 'lucide-react';
import { SaveScheduleDialog } from '@/components/schedule/save-schedule-dialog';
import { SelectedCourseList } from '@/components/saved/selected-course-list';
import { useSharePage } from '@/lib/hooks/use-share-page';
import { detectTimeConflicts } from '@/lib/schedule-utils';
import { SavedSchedule } from '@/lib/types/schedule';

export function ShareClientPage({ schedule }: { schedule: SavedSchedule }) {
  const {
    user,
    loading,
    showSaveDialog,
    isSaving,
    isCheckingExisting,
    alreadyExists,
    existingSchedule,
    setShowSaveDialog,
    handleSaveClick,
    handleConfirmSave,
  } = useSharePage(schedule);

  // Derived state from props
  const selectedCourses = useMemo(
    () => schedule?.schedule_data || [],
    [schedule]
  );
  const conflicts = useMemo(
    () => detectTimeConflicts(selectedCourses),
    [selectedCourses]
  );

  const totalCredits =
    selectedCourses.reduce((sum, course) => sum + course.credits, 0) ?? 0;

  // Function to render the action button based on different states
  const renderActionButton = () => {
    if (loading || isCheckingExisting) {
      return (
        <Button disabled>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Memeriksa jadwal...
        </Button>
      );
    }

    if (!user) {
      return (
        <Button onClick={handleSaveClick}>
          <Save className="mr-2 h-4 w-4" />
          Simpan Jadwal ke Akun Saya
        </Button>
      );
    }

    if (alreadyExists) {
      return (
        <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Check className="h-3 w-3" />
            Jadwal sudah ada
          </Badge>
          <Button onClick={handleSaveClick} variant="outline">
            <Eye className="mr-2 h-4 w-4" />
            Lihat di Jadwal Tersimpan
          </Button>
        </div>
      );
    }

    return (
      <Button onClick={handleSaveClick}>
        <Save className="mr-2 h-4 w-4" />
        Simpan Jadwal ke Akun Saya
      </Button>
    );
  };

  // Function to render additional info when schedule exists
  const renderExistingScheduleInfo = () => {
    if (!alreadyExists || !existingSchedule) return null;

    return (
      <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
        <p className="text-sm text-green-800">
          <strong>Jadwal ini sudah ada di akun Anda</strong>
          {existingSchedule.schedule_name !== schedule.schedule_name && (
            <>
              <br />
              <span className="text-green-600">
                Disimpan dengan nama: {existingSchedule.schedule_name}
              </span>
            </>
          )}
        </p>
      </div>
    );
  };

  return (
    <>
      <Card className="shadow-lg">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-2xl">{schedule.schedule_name}</CardTitle>
            <CardDescription>
              Total {selectedCourses.length || 0} mata kuliah ({totalCredits}{' '}
              SKS)
            </CardDescription>
          </div>
          <div className="mt-4 sm:mt-0">{renderActionButton()}</div>
        </CardHeader>
        <CardContent>
          {renderExistingScheduleInfo()}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
            <div className="lg:col-span-1">
              <SelectedCourseList selectedCourses={selectedCourses || []} />
            </div>
            <div className="lg:col-span-2">
              <WeeklySchedule
                courses={selectedCourses}
                conflicts={conflicts}
                showActions={false}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <SaveScheduleDialog
        isOpen={showSaveDialog}
        onClose={() => setShowSaveDialog(false)}
        onSave={handleConfirmSave}
        isSaving={isSaving}
        defaultScheduleName={`Salinan dari ${schedule.schedule_name}`}
      />
    </>
  );
}
