// Main Course interface
export interface Course {
  id: string;
  code: string;
  name: string;
  lecturer: string;
  credits: number;
  room: string;
  day: string;
  startTime: string;
  endTime: string;
  semester: string;
  category: 'wajib' | 'pilihan';
  class: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

// For creating new courses (without id)
export interface CreateCourseData {
  code: string;
  name: string;
  lecturer: string;
  credits: number;
  room: string;
  day: string;
  startTime: string;
  endTime: string;
  semester: string;
  category: 'wajib' | 'pilihan';
  class: string;
}

// For updating courses (partial data with required id)
export interface UpdateCourseData {
  id: string;
  code?: string;
  name?: string;
  lecturer?: string;
  credits?: number;
  room?: string;
  day?: string;
  startTime?: string;
  endTime?: string;
  semester?: string;
  category?: 'wajib' | 'pilihan';
  class?: string;
}

// For importing courses from JSON
export interface ImportCourseData {
  code: string;
  name: string;
  lecturer: string;
  credits: number;
  room: string;
  day: string;
  startTime: string;
  endTime: string;
  semester: string;
  category: 'wajib' | 'pilihan';
  class: string;
}

// Course category type
export type CourseCategory = 'wajib' | 'pilihan';

// Day of week type
export type DayOfWeek = 'senin' | 'selasa' | 'rabu' | 'kamis' | 'jumat' | 'sabtu' | 'minggu';

// Course filter options
export interface CourseFilters {
  searchQuery: string;
  selectedSemester: string;
  selectedClass: string;
  category?: CourseCategory;
}

// Grouped courses (for display)
export interface GroupedCourse {
  code: string;
  courses: Course[];
  totalClasses: number;
} 