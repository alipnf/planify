'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  getSavedSchedules,
  deleteSavedSchedule,
  saveSchedule,
  updateScheduleSharing,
} from '@/lib/services/schedules';
import { SavedSchedule } from '@/lib/types/schedule';
import { useMessage } from './use-message';
import type { Course } from '@/lib/types/course';
import { detectTimeConflicts } from '@/lib/schedule-utils';

export function useSavedSchedules() {
  // --- Core State ---
  const [schedules, setSchedules] = useState<SavedSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // --- Refs ---
  const previewRef = useRef<HTMLDivElement>(null);

  // --- Hooks ---
  const { showSuccess, showError } = useMessage();

  // --- Derived state for preview ---
  const selectedCourses = useMemo(
    () => activeSchedule?.schedule_data || [],
    [activeSchedule]
  );
  const conflicts = useMemo(
    () => detectTimeConflicts(selectedCourses),
    [selectedCourses]
  );

  // --- Data Fetching ---
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

  // --- Effects ---
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

  // --- Core Logic Handlers (internal) ---
  const internalDeleteSchedule = async (scheduleId: string) => {
    try {
      const scheduleName =
        schedules.find((s) => s.id === scheduleId)?.schedule_name || 'Jadwal';
      await deleteSavedSchedule(scheduleId);
      setSchedules((prev) => prev.filter((s) => s.id !== scheduleId));
      showSuccess(`Jadwal "${scheduleName}" berhasil dihapus.`);
      return true;
    } catch (err) {
      console.error('Failed to delete schedule:', err);
      showError('Gagal menghapus jadwal.');
      return false;
    }
  };

  const internalImportSchedule = async (name: string, courses: Course[]) => {
    try {
      const newSchedule = await saveSchedule(name, courses);
      setSchedules((prev) => [newSchedule, ...prev]);
      showSuccess('Jadwal berhasil diimpor.');
      return newSchedule;
    } catch (err) {
      console.error('Failed to import schedule:', err);
      showError('Gagal menyimpan jadwal yang diimpor.');
      throw err;
    }
  };

  const internalUpdateSharing = async (
    scheduleId: string,
    isShared: boolean
  ) => {
    try {
      const updatedSchedule = await updateScheduleSharing(scheduleId, isShared);
      setSchedules((prev) =>
        prev.map((s) => (s.id === scheduleId ? updatedSchedule : s))
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

  // --- UI-Facing Event Handlers ---
  const handleDeleteClick = (schedule: SavedSchedule) => {
    setScheduleToDelete(schedule);
    setShowDeleteAlert(true);
  };

  const handleConfirmDelete = async () => {
    if (!scheduleToDelete) return;
    const success = await internalDeleteSchedule(scheduleToDelete.id);
    if (success && activeSchedule?.id === scheduleToDelete.id) {
      setActiveSchedule(null);
    }
    setShowDeleteAlert(false);
    setScheduleToDelete(null);
  };

  const handlePreviewClick = (schedule: SavedSchedule) => {
    setActiveSchedule(schedule);
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
      const updatedSchedule = await internalUpdateSharing(
        targetSchedule.id,
        true
      );
      if (!updatedSchedule) return;
      targetSchedule = updatedSchedule;
    }
    const url = `${window.location.origin}/share/${targetSchedule.id}`;
    setShareUrl(url);
    setShowShareDialog(true);
  };

  const handleImport = async (name: string, courses: Course[]) => {
    await internalImportSchedule(name, courses);
    setShowImportDialog(false);
  };

  return {
    // State and Refs
    schedules,
    isLoading,
    error,
    previewRef,
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
    // Action Handlers
    handleDeleteClick,
    handleConfirmDelete,
    handlePreviewClick,
    closePreview,
    handleExport,
    handleShareClick,
    handleImport,
    refreshSchedules: fetchSchedules,
  };
}
