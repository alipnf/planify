'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateScheduleStore } from '@/lib/stores/create-schedule';
import { useCoursesStore } from '@/lib/stores/courses';

export const useCreateSchedule = () => {
  const store = useCreateScheduleStore();
  const isLoading = useCoursesStore((state) => state.isLoading);
  const router = useRouter();

  useEffect(() => {
    useCoursesStore.getState().loadCourses();
  }, []);

  const handleConfirmSave = async (scheduleName: string) => {
    try {
      await store.handleConfirmSave(scheduleName);
      store.resetAllState();
      router.push('/saved');
    } catch (error) {
      throw error;
    }
  };

  return {
    ...store,
    isLoading,
    handleConfirmSave,
  };
};
