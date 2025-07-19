'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useMessage } from '@/lib/hooks/use-message';
import { useUser } from '@/lib/hooks/use-auth';
import { SavedSchedule } from '@/lib/interfaces/schedule';
import { saveSchedule, getSavedSchedules } from '@/lib/services/schedules';
import { Course } from '@/lib/interfaces/course';
import { useSavedSchedulesStore } from '@/lib/stores/saved';

// Helper function to check if two course arrays are the same
function areCourseArraysEqual(courses1: Course[], courses2: Course[]): boolean {
  if (courses1.length !== courses2.length) return false;

  // Sort both arrays by course id for comparison
  const sortedCourses1 = [...courses1].sort((a, b) => a.id.localeCompare(b.id));
  const sortedCourses2 = [...courses2].sort((a, b) => a.id.localeCompare(b.id));

  return sortedCourses1.every(
    (course, index) => course.id === sortedCourses2[index].id
  );
}

export function useSharePage(schedule: SavedSchedule) {
  const { user, loading } = useUser();
  const router = useRouter();
  const { showSuccess, showError } = useMessage();
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isCheckingExisting, setIsCheckingExisting] = useState(false);
  const [alreadyExists, setAlreadyExists] = useState(false);
  const [existingSchedule, setExistingSchedule] =
    useState<SavedSchedule | null>(null);

  const checkIfScheduleExists = useCallback(async () => {
    if (!user || !schedule.schedule_data) return;

    setIsCheckingExisting(true);
    try {
      const savedSchedules = await getSavedSchedules();

      // Check if schedule already exists by comparing:
      // 1. Schedule name (exact match)
      // 2. Schedule data (courses array)
      const existing = savedSchedules.find((savedSchedule) => {
        // Check by name
        if (savedSchedule.schedule_name === schedule.schedule_name) {
          return true;
        }

        // Check by schedule data
        if (savedSchedule.schedule_data && schedule.schedule_data) {
          return areCourseArraysEqual(
            savedSchedule.schedule_data,
            schedule.schedule_data
          );
        }

        return false;
      });

      if (existing) {
        setAlreadyExists(true);
        setExistingSchedule(existing);
      } else {
        setAlreadyExists(false);
        setExistingSchedule(null);
      }
    } catch (error) {
      console.error('Error checking existing schedules:', error);
      // If error, assume it doesn't exist to allow saving
      setAlreadyExists(false);
      setExistingSchedule(null);
    } finally {
      setIsCheckingExisting(false);
    }
  }, [user, schedule.schedule_data, schedule.schedule_name]);

  // Check if schedule already exists when user is loaded
  useEffect(() => {
    if (user && schedule.schedule_data) {
      checkIfScheduleExists();
    }
  }, [user, schedule.schedule_data, checkIfScheduleExists]);

  const handleSaveClick = () => {
    if (!user) {
      router.push(`/auth/login?callbackUrl=/share/${schedule.id}`);
    } else if (alreadyExists) {
      // If schedule already exists, redirect to saved schedules page
      router.push('/saved');
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
      await useSavedSchedulesStore.getState().loadSchedules(true);
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
    isCheckingExisting,
    alreadyExists,
    existingSchedule,
    setShowSaveDialog,
    handleSaveClick,
    handleConfirmSave,
  };
}
