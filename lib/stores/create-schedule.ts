import { create } from 'zustand';
import { toast } from 'sonner';
import { Course } from '@/lib/types/course';
import { saveSchedule } from '@/lib/services/schedules';
import {
  detectTimeConflicts,
  calculateScheduleStats,
} from '@/lib/schedule-utils';
import { useCoursesStore } from '@/lib/stores/courses';

type CreateScheduleState = {
  activeTab: string;
  isDialogOpen: boolean;
  isSaving: boolean;
  selectedCourses: Course[];
  searchQuery: string;
  filterSemester: string;
  filterClass: string;
  groupByCode: boolean;
  filteredCourses: () => Course[];
  conflicts: () => ReturnType<typeof detectTimeConflicts>;
  stats: () => ReturnType<typeof calculateScheduleStats>;
  setActiveTab: (tab: string) => void;
  setIsDialogOpen: (open: boolean) => void;
  setIsSaving: (saving: boolean) => void;
  toggleCourse: (course: Course) => void;
  clearAllSelections: () => void;
  setSelectedCoursesDirectly: (courses: Course[]) => void;
  setSearchQuery: (query: string) => void;
  setFilterSemester: (semester: string) => void;
  setFilterClass: (cls: string) => void;
  setGroupByCode: (group: boolean) => void;
  handleAIEdit: (aiSelectedCourses: Course[]) => void;
  handleAISave: (aiSelectedCourses: Course[]) => void;
  handleSaveSchedule: () => void;
  handleConfirmSave: (scheduleName: string) => Promise<void>;
};

export const useCreateScheduleStore = create<CreateScheduleState>(
  (set, get) => ({
    activeTab: 'manual',
    isDialogOpen: false,
    isSaving: false,
    selectedCourses: [],
    searchQuery: '',
    filterSemester: 'all',
    filterClass: 'all',
    groupByCode: false,

    filteredCourses: () => {
      const { searchQuery, filterSemester, filterClass } = get();
      const courses = useCoursesStore.getState().courses;
      return courses.filter((course) => {
        const matchesSearch =
          searchQuery === '' ||
          course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
          course.lecturer.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesSemester =
          filterSemester === 'all' || course.semester === filterSemester;
        const matchesClass =
          filterClass === 'all' || course.class === filterClass;
        return matchesSearch && matchesSemester && matchesClass;
      });
    },

    conflicts: () => detectTimeConflicts(get().selectedCourses),

    stats: () => calculateScheduleStats(get().selectedCourses),

    setActiveTab: (tab) => set({ activeTab: tab }),

    setIsDialogOpen: (open) => set({ isDialogOpen: open }),

    setIsSaving: (saving) => set({ isSaving: saving }),

    toggleCourse: (course) => {
      const current = get().selectedCourses;
      const isSelected = current.find((c) => c.id === course.id);
      if (isSelected) {
        set({ selectedCourses: current.filter((c) => c.id !== course.id) });
      } else {
        set({ selectedCourses: [...current, course] });
      }
    },

    clearAllSelections: () => set({ selectedCourses: [] }),

    setSelectedCoursesDirectly: (courses) => set({ selectedCourses: courses }),

    setSearchQuery: (query) => set({ searchQuery: query }),

    setFilterSemester: (semester) => set({ filterSemester: semester }),

    setFilterClass: (cls) => set({ filterClass: cls }),

    setGroupByCode: (group) => set({ groupByCode: group }),

    handleAIEdit: (aiSelectedCourses) => {
      get().setSelectedCoursesDirectly(aiSelectedCourses);
      get().setActiveTab('manual');
    },

    handleAISave: (aiSelectedCourses) => {
      get().setSelectedCoursesDirectly(aiSelectedCourses);
      if (aiSelectedCourses.length === 0) {
        toast.error('Jadwal yang dipilih kosong.');
        return;
      }
      get().setIsDialogOpen(true);
    },

    handleSaveSchedule: () => {
      if (get().selectedCourses.length === 0) {
        toast.error('Tidak ada mata kuliah yang dipilih untuk disimpan.');
        return;
      }
      get().setIsDialogOpen(true);
    },

    handleConfirmSave: async (scheduleName) => {
      set({ isSaving: true });
      try {
        await saveSchedule(scheduleName, get().selectedCourses);
        toast.success(`Jadwal "${scheduleName}" berhasil disimpan.`);
        set({ isDialogOpen: false });
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Terjadi kesalahan tidak dikenal.';
        toast.error(errorMessage);
      } finally {
        set({ isSaving: false });
      }
    },
  })
);

