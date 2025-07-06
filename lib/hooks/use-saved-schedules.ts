'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  getSavedSchedules,
  deleteSavedSchedule,
  saveSchedule,
  updateScheduleSharing,
  type SavedSchedule,
} from '@/lib/services/schedules';
import { useMessage } from './use-message';
import { Course } from '@/lib/types/course';

export function useSavedSchedules() {
  const [schedules, setSchedules] = useState<SavedSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showSuccess, showError } = useMessage();

  const fetchSchedules = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getSavedSchedules();
      setSchedules(data);
    } catch (err) {
      console.error('Failed to fetch schedules:', err);
      setError('Gagal memuat jadwal. Silakan coba lagi nanti.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  const handleDeleteSchedule = async (scheduleId: string) => {
    try {
      const scheduleName = schedules.find(s => s.id === scheduleId)?.schedule_name || 'Jadwal';
      await deleteSavedSchedule(scheduleId);
      setSchedules(prev => prev.filter(s => s.id !== scheduleId));
      showSuccess(`Jadwal "${scheduleName}" berhasil dihapus.`);
      return true;
    } catch (err) {
      console.error('Failed to delete schedule:', err);
      showError('Gagal menghapus jadwal.');
      return false;
    }
  };

  const handleImportSchedule = async (name: string, courses: Course[]) => {
    try {
      const newSchedule = await saveSchedule(name, courses);
      setSchedules(prev => [newSchedule, ...prev]);
      showSuccess('Jadwal berhasil diimpor.');
      return newSchedule;
    } catch (err) {
      console.error('Failed to import schedule:', err);
      showError('Gagal menyimpan jadwal yang diimpor.');
      throw err;
    }
  };

  const handleUpdateSharing = async (scheduleId: string, isShared: boolean) => {
    try {
      const updatedSchedule = await updateScheduleSharing(scheduleId, isShared);
      setSchedules(prev =>
        prev.map(s => (s.id === scheduleId ? updatedSchedule : s)),
      );
      if (isShared) {
        showSuccess('Jadwal sekarang publik dan bisa dibagikan.');
      }
      return updatedSchedule;
    } catch (err) {
      console.error('Failed to update schedule sharing:', err);
      showError('Gagal memperbarui status berbagi jadwal.');
      throw err;
    }
  };

  return {
    schedules,
    isLoading,
    error,
    deleteSchedule: handleDeleteSchedule,
    importSchedule: handleImportSchedule,
    updateSharing: handleUpdateSharing,
    refreshSchedules: fetchSchedules,
  };
} 