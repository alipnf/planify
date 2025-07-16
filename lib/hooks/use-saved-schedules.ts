'use client';

import { useEffect } from 'react';
import { useSavedSchedulesStore } from '@/lib/stores/saved';

export function useSavedSchedules() {
  const store = useSavedSchedulesStore();

  useEffect(() => {
    store.loadSchedules();
  }, [store]);

  return store;
}
