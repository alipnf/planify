'use client';

import { useEffect, useState } from 'react';
import { SavedSchedule, saveSchedule } from '@/lib/services/schedules';
import { useScheduleManagement } from '@/lib/hooks/use-schedule-management';
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
import { useUser } from '@/lib/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { SaveScheduleDialog } from '@/components/schedule/save-schedule-dialog';
import { useMessage } from '@/lib/hooks/use-message';

interface ShareClientPageProps {
  schedule: SavedSchedule;
}

export function ShareClientPage({ schedule }: ShareClientPageProps) {
  const {
    selectedCourses,
    conflicts,
    timeSlots,
    getCourseAtTime,
    setSelectedCoursesDirectly,
  } = useScheduleManagement();

  const { user, loading } = useUser();
  const router = useRouter();
  const { showSuccess, showError } = useMessage();
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (schedule && schedule.schedule_data) {
      setSelectedCoursesDirectly(schedule.schedule_data);
    }
  }, [schedule, setSelectedCoursesDirectly]);

  const totalCredits =
    schedule.schedule_data?.reduce((sum, course) => sum + course.credits, 0) ??
    0;

  const handleSaveClick = () => {
    if (!user) {
      // Jika pengguna tidak login, arahkan ke halaman login
      // dengan callbackUrl untuk kembali ke halaman ini
      router.push(`/auth/login?callbackUrl=/share/${schedule.share_id}`);
    } else {
      // Jika pengguna sudah login, tampilkan dialog untuk menyimpan
      setShowSaveDialog(true);
    }
  };

  const handleConfirmSave = async (newScheduleName: string) => {
    if (!schedule.schedule_data) {
      showError('Tidak ada data jadwal untuk disimpan.');
      return;
    }

    setIsSaving(true);
    try {
      await saveSchedule(newScheduleName, schedule.schedule_data);
      showSuccess('Jadwal berhasil disimpan ke akun Anda!');
      setShowSaveDialog(false);
      router.push('/saved');
    } catch (err) {
      console.error('Failed to save shared schedule:', err);
      showError(
        'Gagal menyimpan jadwal. Mungkin sudah ada jadwal dengan nama yang sama.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Card className="shadow-lg">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-2xl">{schedule.schedule_name}</CardTitle>
            <CardDescription>
              Total {schedule.schedule_data?.length || 0} mata kuliah (
              {totalCredits} SKS)
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
          <WeeklySchedule
            courses={selectedCourses}
            conflicts={conflicts}
            timeSlots={timeSlots}
            getCourseAtTime={getCourseAtTime}
            showActions={false}
          />
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
