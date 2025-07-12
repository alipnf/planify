import { useState, useEffect, useCallback, useMemo } from 'react';
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

export function useCourses(): CoursesState & CoursesActions {
  // State variables
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedSemester, setSelectedSemester] = useState<string>('all');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [groupByCode, setGroupByCode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Delete confirmation states
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);

  // Load courses on mount
  useEffect(() => {
    loadCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Computed values
  const filteredCourses = useMemo(() => {
    const filtered = filterCourses(
      courses,
      searchQuery,
      selectedSemester,
      selectedClass
    );
    return sortCourses(filtered);
  }, [courses, searchQuery, selectedSemester, selectedClass]);

  const groupedCourses = useMemo(() => {
    if (!groupByCode) return null;

    const grouped = groupCoursesByCode(filteredCourses);
    return Object.entries(grouped)
      .map(([code, coursesInGroup]) => ({
        code,
        courses: sortCourseClasses(coursesInGroup),
        totalClasses: coursesInGroup.length,
      }))
      .sort((a, b) => a.code.localeCompare(b.code));
  }, [filteredCourses, groupByCode]);

  const availableClasses = useMemo(() => {
    return getAvailableClasses(courses);
  }, [courses]);

  const selectedCourseNames = useMemo(() => {
    return getSelectedCourseNames(courses, selectedCourses);
  }, [courses, selectedCourses]);

  const allSelected = useMemo(() => {
    return (
      filteredCourses.length > 0 &&
      selectedCourses.length === filteredCourses.length
    );
  }, [filteredCourses.length, selectedCourses.length]);

  const someSelected = useMemo(() => {
    return (
      selectedCourses.length > 0 &&
      selectedCourses.length < filteredCourses.length
    );
  }, [selectedCourses.length, filteredCourses.length]);

  const hasFilters = useMemo(() => {
    return (
      searchQuery !== '' ||
      selectedSemester !== 'all' ||
      selectedClass !== 'all'
    );
  }, [searchQuery, selectedSemester, selectedClass]);

  // Data Actions
  const loadCourses = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await coursesService.getAllCourses();
      setCourses(data);
    } catch (error) {
      console.error('Error loading courses:', error);
      toast.error('Gagal memuat data mata kuliah.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSaveCourse = useCallback(
    async (courseData: Partial<CreateCourseData>) => {
      setIsSaving(true);
      const isUpdating = !!editingCourse;

      try {
        if (isUpdating && editingCourse) {
          await coursesService.updateCourse(
            {
              course_code: editingCourse.code,
              class_name: editingCourse.class,
            },
            courseData
          );
        } else {
          await coursesService.createCourse(courseData as CreateCourseData);
        }

        await loadCourses();
        toast.success(
          `Mata kuliah berhasil ${isUpdating ? 'diperbarui' : 'ditambahkan'}`
        );
        setShowCourseModal(false);
        setEditingCourse(null);
      } catch (error: any) {
        console.error('Error saving course:', error);
        toast.error(error.message || 'Gagal menyimpan mata kuliah');
      } finally {
        setIsSaving(false);
      }
    },
    [editingCourse, loadCourses]
  );

  const handleImportCourses = useCallback(
    async (importedCourses: CreateCourseData[]) => {
      if (importedCourses.length === 0) {
        toast.info('Tidak ada mata kuliah untuk diimpor.');
        return;
      }
      setShowImportModal(false);

      const promise = coursesService.importCourses(importedCourses);

      toast.promise(promise, {
        loading: 'Mengimpor mata kuliah...',
        success: (newCourses) => {
          loadCourses(); // Refresh data after successful import
          return `${newCourses.length} mata kuliah berhasil diimpor`;
        },
        error: (err) => err.message || 'Gagal mengimpor mata kuliah',
      });
    },
    [loadCourses]
  );

  const handleExportAll = useCallback(() => {
    const exportData = courses.map((course) => ({
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
    link.download = `mata_kuliah_export_${
      new Date().toISOString().split('T')[0]
    }.json`;
    link.click();

    URL.revokeObjectURL(url);
    const today = new Date().toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    toast.success(`${courses.length} mata kuliah berhasil diekspor (${today})`);
  }, [courses]);

  // Selection Actions
  const handleSelectAll = useCallback(
    (checked: boolean) => {
      if (checked) {
        setSelectedCourses(filteredCourses.map((c) => c.id));
      } else {
        setSelectedCourses([]);
      }
    },
    [filteredCourses]
  );

  const handleSelectCourse = useCallback(
    (courseId: string, checked: boolean) => {
      setSelectedCourses((prev) =>
        checked ? [...prev, courseId] : prev.filter((id) => id !== courseId)
      );
    },
    []
  );

  // CRUD Actions
  const handleAddCourse = useCallback(() => {
    setEditingCourse(null);
    setShowCourseModal(true);
  }, []);

  const handleEditCourse = useCallback((course: Course) => {
    setEditingCourse(course);
    setShowCourseModal(true);
  }, []);

  const handleDeleteCourseClick = useCallback((course: Course) => {
    setCourseToDelete(course);
    setShowDeleteDialog(true);
  }, []);

  const handleBulkDeleteClick = useCallback(() => {
    if (selectedCourses.length === 0) {
      toast.error('Pilih mata kuliah yang akan dihapus');
      return;
    }
    setShowBulkDeleteDialog(true);
  }, [selectedCourses.length]);

  const handleConfirmDelete = useCallback(async () => {
    if (!courseToDelete) return;

    try {
      const courseName = `${getFullCourseCode(courseToDelete)} - ${
        courseToDelete.name
      }`;
      await coursesService.deleteCourse({
        course_code: courseToDelete.code,
        class_name: courseToDelete.class,
      });
      await loadCourses();
      toast.success(`${courseName} berhasil dihapus`);
      setShowDeleteDialog(false);
      setCourseToDelete(null);
    } catch (error) {
      console.error('Error deleting course:', error);
      toast.error('Gagal menghapus mata kuliah');
    }
  }, [courseToDelete, loadCourses]);

  const handleConfirmBulkDelete = useCallback(async () => {
    if (selectedCourses.length === 0) return;

    const coursesToDelete = courses
      .filter((c) => selectedCourses.includes(c.id))
      .map((c) => ({ course_code: c.code, class_name: c.class }));

    try {
      await coursesService.deleteCourses(coursesToDelete);
      await loadCourses();
      toast.success(`${coursesToDelete.length} mata kuliah berhasil dihapus`);
      setShowBulkDeleteDialog(false);
      setSelectedCourses([]);
    } catch (error) {
      console.error('Error bulk deleting courses:', error);
      toast.error('Gagal menghapus beberapa mata kuliah');
    }
  }, [selectedCourses, courses, loadCourses]);

  // Return values
  return {
    // Data
    courses,
    filteredCourses,
    groupedCourses,
    availableClasses,
    selectedCourseNames,

    // UI State
    searchQuery,
    selectedCourses,
    selectedSemester,
    selectedClass,
    groupByCode,
    isLoading,
    isSaving,

    // Modal States
    showCourseModal,
    showImportModal,
    showDeleteDialog,
    showBulkDeleteDialog,
    editingCourse,
    courseToDelete,

    // Computed values
    allSelected,
    someSelected,
    hasFilters,

    // Actions
    loadCourses,
    handleSaveCourse,
    handleImportCourses,
    handleExportAll,
    setSearchQuery,
    setSelectedSemester,
    setSelectedClass,
    setGroupByCode,
    handleSelectAll,
    handleSelectCourse,
    handleAddCourse,
    handleEditCourse,
    handleDeleteCourseClick,
    handleBulkDeleteClick,
    handleConfirmDelete,
    handleConfirmBulkDelete,
    setShowCourseModal,
    setShowImportModal,
    setShowDeleteDialog,
    setShowBulkDeleteDialog,
  };
}
