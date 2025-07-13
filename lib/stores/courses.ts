// Create the courses store using Zustand
import { create } from 'zustand';
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

export const useCoursesStore = create<Store>((set, get) => ({
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
    const filteredLength = state.filteredCourses.length;
    return (
      filteredLength > 0 && state.selectedCourses.length === filteredLength
    );
  },
  someSelected: () => {
    const state = get();
    return (
      state.selectedCourses.length > 0 &&
      state.selectedCourses.length < state.filteredCourses.length
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
  loadCourses: async () => {
    set({ isLoading: true });
    try {
      const data = await coursesService.getAllCourses();
      set({ courses: data });
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

      await get().loadCourses();
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
        get().loadCourses();
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
      await get().loadCourses();
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
      await get().loadCourses();
      toast.success(`${coursesToDelete.length} mata kuliah berhasil dihapus`);
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

  // Initialize loading courses (optional, can be called from components)
}));
