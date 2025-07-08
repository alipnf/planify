'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMessage } from '@/lib/hooks/use-message';
import { useUser } from '@/lib/hooks/use-auth';
import { SavedSchedule, saveSchedule } from '@/lib/services/schedules';

export const useSharePage = (schedule: SavedSchedule) => {
  const { user, loading } = useUser();
  const router = useRouter();
  const { showSuccess, showError } = useMessage();
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveClick = () => {
    if (!user) {
      router.push(`/auth/login?callbackUrl=/share/${schedule.share_id}`);
    } else {
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

  return {
    user,
    loading,
    showSaveDialog,
    isSaving,
    setShowSaveDialog,
    handleSaveClick,
    handleConfirmSave,
  };
};

