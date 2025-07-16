import { useEffect } from 'react';
import { useCoursesStore } from '@/lib/stores/courses';

export function useCourses() {
  const store = useCoursesStore();

  useEffect(() => {
    store.loadCourses();
  }, [store]);

  return store;
}
