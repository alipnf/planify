// Create the courses store using Zustand with persist middleware
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { toast } from 'sonner';
import {
  Course,
  CreateCourseData,
  CoursesState,
  CoursesActions,
} from '@/lib/types/course';
import * as coursesService from '@/lib/services/courses';
import {
  filterCourses,
  sortCourses,
  groupCoursesByCode,
  sortCourseClasses,
  getSelectedCourseNames,
  getAvailableClasses,
  getFullCourseCode,
} from '@/lib/course-utils';

// Utility function untuk generate deterministic ID dari course data
const generateCourseId = (course: { code: string; class: string }) => {
  return `${course.code}-${course.class}`;
};

type Store = Omit<
  CoursesState,
  | 'filteredCourses'
  | 'groupedCourses'
  | 'availableClasses'
  | 'selectedCourseNames'
  | 'allSelected'
  | 'someSelected'
  | 'hasFilters'
> &
  CoursesActions & {
    filteredCourses: () => Course[];
    groupedCourses: () =>
      | { code: string; courses: Course[]; totalClasses: number }[]
      | null;
    availableClasses: () => string[];
    selectedCourseNames: () => string[];
    allSelected: () => boolean;
    someSelected: () => boolean;
    hasFilters: () => boolean;
  };

export const useCoursesStore = create<Store>()(
  persist(
    (set, get) => ({
      // State variables
      courses: [],
      searchQuery: '',
      selectedCourses: [],
      editingCourse: null,
      showCourseModal: false,
      showImportModal: false,
      selectedSemester: 'all',
      selectedClass: 'all',
      groupByCode: false,
      isLoading: true,
      isSaving: false,
      showDeleteDialog: false,
      showBulkDeleteDialog: false,
      courseToDelete: null,

      // Computed values as getters
      filteredCourses: () => {
        const state = get();
        const filtered = filterCourses(
          state.courses,
          state.searchQuery,
          state.selectedSemester,
          state.selectedClass
        );
        return sortCourses(filtered);
      },
      groupedCourses: () => {
        const state = get();
        if (!state.groupByCode) return null;
        const grouped = groupCoursesByCode(state.filteredCourses());
        return Object.entries(grouped)
          .map(([code, coursesInGroup]) => ({
            code,
            courses: sortCourseClasses(coursesInGroup),
            totalClasses: coursesInGroup.length,
          }))
          .sort((a, b) => a.code.localeCompare(b.code));
      },
      availableClasses: () => {
        const state = get();
        return getAvailableClasses(state.courses);
      },
      selectedCourseNames: () => {
        const state = get();
        return getSelectedCourseNames(state.courses, state.selectedCourses);
      },
      allSelected: () => {
        const state = get();
        const filteredLength = state.filteredCourses().length;
        return (
          filteredLength > 0 && state.selectedCourses.length === filteredLength
        );
      },
      someSelected: () => {
        const state = get();
        return (
          state.selectedCourses.length > 0 &&
          state.selectedCourses.length < state.filteredCourses().length
        );
      },
      hasFilters: () => {
        const state = get();
        return (
          state.searchQuery !== '' ||
          state.selectedSemester !== 'all' ||
          state.selectedClass !== 'all'
        );
      },

      // Data Actions
      loadCourses: async (forceRefresh = false) => {
        const state = get();

        // Jika sudah ada data dan tidak force refresh, skip API call
        if (!forceRefresh && state.courses.length > 0) {
          set({ isLoading: false });
          return;
        }

        // Jika force refresh, hapus dari cache dulu
        if (forceRefresh) {
          useCoursesStore.persist.clearStorage();
        }

        set({ isLoading: true });
        try {
          const data = await coursesService.getAllCourses();
          // Transform courses untuk menggunakan deterministic ID dan remove sensitive data
          const sanitizedCourses = data.map((course) => ({
            id: generateCourseId(course), // Consistent deterministic ID
            code: course.code,
            name: course.name,
            lecturer: course.lecturer,
            credits: course.credits,
            room: course.room,
            day: course.day,
            startTime: course.startTime,
            endTime: course.endTime,
            semester: course.semester,
            category: course.category,
            class: course.class,
            // Exclude sensitive metadata: user_id, created_at, updated_at
          }));
          set({ courses: sanitizedCourses });
        } catch (error) {
          console.error('Error loading courses:', error);
          toast.error('Gagal memuat data mata kuliah.');
        } finally {
          set({ isLoading: false });
        }
      },

      handleSaveCourse: async (courseData: Partial<CreateCourseData>) => {
        const state = get();
        set({ isSaving: true });
        const isUpdating = !!state.editingCourse;

        try {
          if (isUpdating && state.editingCourse) {
            await coursesService.updateCourse(
              {
                course_code: state.editingCourse.code,
                class_name: state.editingCourse.class,
              },
              courseData
            );
          } else {
            await coursesService.createCourse(courseData as CreateCourseData);
          }

          await get().loadCourses(true); // Force refresh
          toast.success(
            `Mata kuliah berhasil ${isUpdating ? 'diperbarui' : 'ditambahkan'}`
          );
          set({ showCourseModal: false, editingCourse: null });
        } catch (error: unknown) {
          console.error('Error saving course:', error);
          toast.error('Gagal menyimpan mata kuliah');
        } finally {
          set({ isSaving: false });
        }
      },

      handleImportCourses: async (importedCourses: CreateCourseData[]) => {
        if (importedCourses.length === 0) {
          toast.info('Tidak ada mata kuliah untuk diimpor.');
          return;
        }
        set({ showImportModal: false });

        const promise = coursesService.importCourses(importedCourses);

        toast.promise(promise, {
          loading: 'Mengimpor mata kuliah...',
          success: (newCourses) => {
            get().loadCourses(true); // Force refresh
            return `${newCourses.length} mata kuliah berhasil diimpor`;
          },
          error: (err) => err.message || 'Gagal mengimpor mata kuliah',
        });
      },

      handleExportAll: () => {
        const state = get();
        const exportData = state.courses.map((course) => ({
          code: course.code,
          name: course.name,
          lecturer: course.lecturer,
          credits: course.credits,
          category: course.category,
          class: course.class,
          room: course.room,
          day: course.day,
          startTime: course.startTime,
          endTime: course.endTime,
          semester: course.semester,
        }));
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });

        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `mata_kuliah_export_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
        const today = new Date().toLocaleDateString('id-ID', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
        toast.success(
          `${state.courses.length} mata kuliah berhasil diekspor (${today})`
        );
      },

      // Selection Actions
      handleSelectAll: (checked: boolean) => {
        const state = get();
        if (checked) {
          set({
            selectedCourses: state.filteredCourses().map((c: Course) => c.id),
          });
        } else {
          set({ selectedCourses: [] });
        }
      },

      handleSelectCourse: (courseId: string, checked: boolean) => {
        const state = get();
        set({
          selectedCourses: checked
            ? [...state.selectedCourses, courseId]
            : state.selectedCourses.filter((id) => id !== courseId),
        });
      },

      // CRUD Actions
      handleAddCourse: () => {
        set({ editingCourse: null, showCourseModal: true });
      },

      handleEditCourse: (course: Course) => {
        set({ editingCourse: course, showCourseModal: true });
      },

      handleDeleteCourseClick: (course: Course) => {
        set({ courseToDelete: course, showDeleteDialog: true });
      },

      handleBulkDeleteClick: () => {
        const state = get();
        if (state.selectedCourses.length === 0) {
          toast.error('Pilih mata kuliah yang akan dihapus');
          return;
        }
        set({ showBulkDeleteDialog: true });
      },

      handleConfirmDelete: async () => {
        const state = get();
        if (!state.courseToDelete) return;

        try {
          const courseName = `${getFullCourseCode(state.courseToDelete)} - ${state.courseToDelete.name}`;
          await coursesService.deleteCourse({
            course_code: state.courseToDelete.code,
            class_name: state.courseToDelete.class,
          });
          await get().loadCourses(true); // Force refresh
          toast.success(`${courseName} berhasil dihapus`);
          set({ showDeleteDialog: false, courseToDelete: null });
        } catch (error) {
          console.error('Error deleting course:', error);
          toast.error('Gagal menghapus mata kuliah');
        }
      },

      handleConfirmBulkDelete: async () => {
        const state = get();
        if (state.selectedCourses.length === 0) return;

        const coursesToDelete = state.courses
          .filter((c) => state.selectedCourses.includes(c.id))
          .map((c) => ({ course_code: c.code, class_name: c.class }));

        try {
          await coursesService.deleteCourses(coursesToDelete);
          await get().loadCourses(true); // Force refresh
          toast.success(
            `${coursesToDelete.length} mata kuliah berhasil dihapus`
          );
          set({ showBulkDeleteDialog: false, selectedCourses: [] });
        } catch (error) {
          console.error('Error bulk deleting courses:', error);
          toast.error('Gagal menghapus beberapa mata kuliah');
        }
      },

      // Setter Actions
      setSearchQuery: (query) => set({ searchQuery: query }),
      setSelectedSemester: (semester) => set({ selectedSemester: semester }),
      setSelectedClass: (classValue) => set({ selectedClass: classValue }),
      setGroupByCode: (group) => set({ groupByCode: group }),
      setShowCourseModal: (show) => set({ showCourseModal: show }),
      setShowImportModal: (show) => set({ showImportModal: show }),
      setShowDeleteDialog: (show) => set({ showDeleteDialog: show }),
      setShowBulkDeleteDialog: (show) => set({ showBulkDeleteDialog: show }),
    }),
    {
      name: 'planify-courses-store', // Key untuk localStorage
      storage: createJSONStorage(() => localStorage),
      // ALTERNATIF untuk privacy lebih baik:
      // storage: createJSONStorage(() => sessionStorage), // Data hilang saat tab ditutup
      partialize: (state) => ({
        // Hanya persist data courses tanpa metadata sensitif
        courses: state.courses.map((course) => ({
          id: generateCourseId(course), // Generate deterministic ID
          code: course.code,
          name: course.name,
          lecturer: course.lecturer,
          credits: course.credits,
          room: course.room,
          day: course.day,
          startTime: course.startTime,
          endTime: course.endTime,
          semester: course.semester,
          category: course.category,
          class: course.class,
          // Exclude: user_id, created_at, updated_at (data sensitif)
        })),
        // UI preferences tetap di-persist (aman)
        selectedSemester: state.selectedSemester,
        selectedClass: state.selectedClass,
        groupByCode: state.groupByCode,
      }),
      version: 1, // Version untuk migration jika diperlukan di masa depan
      onRehydrateStorage: () => {
        // Callback yang dipanggil saat hydration selesai
        return (state) => {
          if (state) {
            // Jika ada data dari persist, set loading = false
            if (state.courses && state.courses.length > 0) {
              state.isLoading = false;
            }
          }
        };
      },
    }
  )
);
