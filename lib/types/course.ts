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

export type GroupedCourses = Array<{
  code: string;
  courses: Course[];
  totalClasses: number;
}> | null;

export interface CoursesState {
  // Data
  courses: Course[];
  filteredCourses: Course[];
  groupedCourses: GroupedCourses;
  availableClasses: string[];
  selectedCourseNames: string[];

  // UI State
  searchQuery: string;
  selectedCourses: string[];
  selectedSemester: string;
  selectedClass: string;
  groupByCode: boolean;
  isLoading: boolean;

  // Modal States
  showCourseModal: boolean;
  showImportModal: boolean;
  showDeleteDialog: boolean;
  showBulkDeleteDialog: boolean;
  editingCourse: Course | null;
  courseToDelete: Course | null;

  // Computed values
  allSelected: boolean;
  someSelected: boolean;
  hasFilters: boolean;
}

export interface CoursesActions {
  // Data Actions
  loadCourses: () => Promise<void>;
  handleSaveCourse: (courseData: Partial<Course>) => Promise<void>;
  handleImportCourses: (importedCourses: CreateCourseData[]) => Promise<void>;
  handleExportAll: () => void;

  // UI Actions
  setSearchQuery: (query: string) => void;
  setSelectedSemester: (semester: string) => void;
  setSelectedClass: (classValue: string) => void;
  setGroupByCode: (group: boolean) => void;

  // Selection Actions
  handleSelectAll: (checked: boolean) => void;
  handleSelectCourse: (courseId: string, checked: boolean) => void;

  // CRUD Actions
  handleAddCourse: () => void;
  handleEditCourse: (course: Course) => void;
  handleDeleteCourseClick: (course: Course) => void;
  handleBulkDeleteClick: () => void;
  handleConfirmDelete: () => Promise<void>;
  handleConfirmBulkDelete: () => Promise<void>;

  // Modal Actions
  setShowCourseModal: (show: boolean) => void;
  setShowImportModal: (show: boolean) => void;
  setShowDeleteDialog: (show: boolean) => void;
  setShowBulkDeleteDialog: (show: boolean) => void;
}
