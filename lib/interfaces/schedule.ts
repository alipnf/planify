import { Course } from '@/lib/interfaces/course';

export interface SavedSchedule {
  id: string;
  user_id: string;
  created_at: string;
  schedule_name: string;
  schedule_data: Course[] | null;
  is_shared: boolean;
}

export interface SchedulePreferences {
  targetCredits: number;
  maxDailyCredits: number;
  preferredStartTime: string;
  preferredEndTime: string;
  offDays: string[];
  requiredCourses: string[];
  avoidedCourses: string[];
}

export interface TimeConflict {
  courses: [Course, Course];
  course1: Course;
  course2: Course;
  day: string;
  time: string;
}
