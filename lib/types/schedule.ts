import { Course } from '@/lib/types/course';

export interface SavedSchedule {
  id: string;
  user_id: string;
  created_at: string;
  schedule_name: string;
  schedule_data: Course[] | null;
  is_shared: boolean;
}
