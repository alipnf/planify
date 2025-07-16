import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'sonner';
import { Course } from '@/lib/interfaces/course';
import { saveSchedule } from '@/lib/services/schedules';
import {
  detectTimeConflicts,
  calculateScheduleStats,
} from '@/lib/schedule-utils';
import { useCoursesStore } from '@/lib/stores/courses';

interface ScheduleOptionView {
  id: number;
  courses: Course[];
  totalCredits: number;
}

type CreateScheduleState = {
  activeTab: string;
  isDialogOpen: boolean;
  isSaving: boolean;
  selectedCourses: Course[];
  searchQuery: string;
  filterSemester: string;
  filterClass: string;
  groupByCode: boolean;
  // AI Scheduler State
  aiPrompt: string;
  isGenerating: boolean;
  scheduleOptions: ScheduleOptionView[];
  selectedOptionId: number | null;
  previewCourses: Course[];
  errorMessage: string | null;
  showApiKeyAlert: boolean;
  filteredCourses: () => Course[];
  conflicts: () => ReturnType<typeof detectTimeConflicts>;
  stats: () => ReturnType<typeof calculateScheduleStats>;
  setActiveTab: (tab: string) => void;
  setIsDialogOpen: (open: boolean) => void;
  setIsSaving: (saving: boolean) => void;
  toggleCourse: (course: Course) => void;
  clearAllSelections: () => void;
  resetAllState: () => void;
  setSelectedCoursesDirectly: (courses: Course[]) => void;
  setSearchQuery: (query: string) => void;
  setFilterSemester: (semester: string) => void;
  setFilterClass: (cls: string) => void;
  setGroupByCode: (group: boolean) => void;
  handleAIEdit: (aiSelectedCourses: Course[]) => void;
  handleAISave: (aiSelectedCourses: Course[]) => void;
  handleSaveSchedule: () => void;
  handleConfirmSave: (scheduleName: string) => Promise<void>;
  // AI Scheduler Actions
  setAiPrompt: (prompt: string) => void;
  setIsGenerating: (generating: boolean) => void;
  setScheduleOptions: (options: ScheduleOptionView[]) => void;
  setSelectedOptionId: (id: number | null) => void;
  setPreviewCourses: (courses: Course[]) => void;
  setErrorMessage: (message: string | null) => void;
  setShowApiKeyAlert: (show: boolean) => void;
  resetAiState: () => void;
};

export const useCreateScheduleStore = create<CreateScheduleState>()(
  persist(
    (set, get) => ({
      activeTab: 'manual',
      isDialogOpen: false,
      isSaving: false,
      selectedCourses: [],
      searchQuery: '',
      filterSemester: 'all',
      filterClass: 'all',
      groupByCode: false,
      // AI Scheduler State
      aiPrompt: '',
      isGenerating: false,
      scheduleOptions: [],
      selectedOptionId: null,
      previewCourses: [],
      errorMessage: null,
      showApiKeyAlert: false,

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
          // Check if adding this course would exceed 24 SKS limit
          const currentTotalSKS = current.reduce(
            (sum, c) => sum + c.credits,
            0
          );
          const newTotalSKS = currentTotalSKS + course.credits;

          if (newTotalSKS > 24) {
            toast.error(
              `Tidak dapat menambah mata kuliah. Total SKS akan menjadi ${newTotalSKS}, melebihi batas maksimal 24 SKS.`
            );
            return;
          }

          set({ selectedCourses: [...current, course] });
        }
      },

      clearAllSelections: () => set({ selectedCourses: [] }),

      resetAllState: () =>
        set({
          selectedCourses: [],
          searchQuery: '',
          filterSemester: 'all',
          filterClass: 'all',
          groupByCode: false,
          activeTab: 'manual',
          // Reset AI state
          aiPrompt: '',
          isGenerating: false,
          scheduleOptions: [],
          selectedOptionId: null,
          previewCourses: [],
          errorMessage: null,
          showApiKeyAlert: false,
        }),

      setSelectedCoursesDirectly: (courses) => {
        // Check if the courses exceed 24 SKS limit
        const totalSKS = courses.reduce((sum, c) => sum + c.credits, 0);

        if (totalSKS > 24) {
          toast.error(
            `Jadwal yang dipilih melebihi batas maksimal 24 SKS (total: ${totalSKS} SKS). Silakan pilih ulang mata kuliah.`
          );
          return;
        }

        set({ selectedCourses: courses });
      },

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

      // AI Scheduler Actions
      setAiPrompt: (prompt) => set({ aiPrompt: prompt }),

      setIsGenerating: (generating) => set({ isGenerating: generating }),

      setScheduleOptions: (options) => set({ scheduleOptions: options }),

      setSelectedOptionId: (id) => set({ selectedOptionId: id }),

      setPreviewCourses: (courses) => set({ previewCourses: courses }),

      setErrorMessage: (message) => set({ errorMessage: message }),

      setShowApiKeyAlert: (show) => set({ showApiKeyAlert: show }),

      resetAiState: () =>
        set({
          aiPrompt: '',
          isGenerating: false,
          scheduleOptions: [],
          selectedOptionId: null,
          previewCourses: [],
          errorMessage: null,
          showApiKeyAlert: false,
        }),
    }),
    {
      name: 'create-schedule-storage',
      partialize: (state) => ({
        activeTab: state.activeTab,
        selectedCourses: state.selectedCourses,
        searchQuery: state.searchQuery,
        filterSemester: state.filterSemester,
        filterClass: state.filterClass,
        groupByCode: state.groupByCode,
        // AI state to persist
        aiPrompt: state.aiPrompt,
        scheduleOptions: state.scheduleOptions,
        selectedOptionId: state.selectedOptionId,
        previewCourses: state.previewCourses,
      }),
    }
  )
);
