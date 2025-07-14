'use client';

import { useEffect } from 'react';
import { useCreateScheduleStore } from '@/lib/stores/create-schedule';
import { useCoursesStore } from '@/lib/stores/courses';

export const useCreateSchedule = () => {
  const store = useCreateScheduleStore();
  const isLoading = useCoursesStore((state) => state.isLoading);

  useEffect(() => {
    useCoursesStore.getState().loadCourses();
  }, []);

  return { ...store, isLoading };
};
