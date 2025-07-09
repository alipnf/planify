'use client';

import { useMemo } from 'react';
import { SavedSchedule } from '@/lib/services/schedules';
import { WeeklySchedule } from '@/components/schedule/weekly-schedule';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';
import { SaveScheduleDialog } from '@/components/schedule/save-schedule-dialog';
import { SelectedCourseList } from '@/components/saved/selected-course-list';
import { useSharePage } from '@/lib/hooks/use-share-page';
import { detectTimeConflicts } from '@/lib/schedule-utils';

interface ShareClientPageProps {
  schedule: SavedSchedule;
}

export function ShareClientPage({ schedule }: ShareClientPageProps) {
  const {
    loading,
    showSaveDialog,
    isSaving,
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
          <div className="mt-4 sm:mt-0">
            <Button onClick={handleSaveClick} disabled={loading}>
              <Save className="mr-2 h-4 w-4" />
              Simpan Jadwal ke Akun Saya
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
