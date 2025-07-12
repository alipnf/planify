import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import {
  Course,
  CreateCourseData,
  UpdateCourseData,
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
      // Add small delay to allow authentication to initialize properly
      await new Promise((resolve) => setTimeout(resolve, 500));
      const data = await coursesService.getAllCourses();
      setCourses(data);
    } catch (error) {
      console.error('Error loading courses:', error);
      // Only show error if not on initial load (to avoid error on refresh)
      if (courses.length === 0) {
        // Retry once after a delay
        try {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          const data = await coursesService.getAllCourses();
          setCourses(data);
        } catch (retryError) {
          console.error('Error loading courses on retry:', retryError);
          toast.error('Gagal memuat data mata kuliah');
        }
      } else {
        toast.error('Gagal memuat data mata kuliah');
      }
    } finally {
      setIsLoading(false);
    }
  }, [courses.length]);

  const handleSaveCourse = useCallback(
    async (courseData: Partial<Course>) => {
      try {
        const isUpdating = !!editingCourse;
        setShowCourseModal(false);

        if (isUpdating && editingCourse) {
          const oldIdentifier = {
            course_code: editingCourse.code,
            class_name: editingCourse.class,
          };

          const newCode = courseData.code ?? editingCourse.code;
          const newClass = courseData.class ?? editingCourse.class;

          if (
            newCode !== editingCourse.code ||
            newClass !== editingCourse.class
          ) {
            // Delete old course
            await coursesService.deleteCourse(oldIdentifier);

            // Create new course with updated data
            const createData: CreateCourseData = {
              code: newCode,
              class: newClass,
              name: courseData.name ?? editingCourse.name,
              lecturer: courseData.lecturer ?? editingCourse.lecturer,
              credits: courseData.credits ?? editingCourse.credits,
              category: courseData.category ?? editingCourse.category,
              room: courseData.room ?? editingCourse.room,
              day: courseData.day ?? editingCourse.day,
              startTime: courseData.startTime ?? editingCourse.startTime,
              endTime: courseData.endTime ?? editingCourse.endTime,
              semester: courseData.semester ?? editingCourse.semester,
            };
            await coursesService.createCourse(createData);
          } else {
            // Regular update
            await coursesService.updateCourse(
              oldIdentifier,
              courseData as UpdateCourseData
            );
          }
        } else {
          await coursesService.createCourse(courseData as CreateCourseData);
        }

        await loadCourses();
        toast.success(
          `Mata kuliah berhasil ${isUpdating ? 'diperbarui' : 'ditambahkan'}`
        );
        setEditingCourse(null);
      } catch (error) {
        console.error('Error saving course:', error);
        toast.error('Gagal menyimpan mata kuliah');
        setShowCourseModal(true); // Re-open modal on error
      }
    },
    [editingCourse, loadCourses]
  );

  const handleImportCourses = useCallback(
    async (importedCourses: CreateCourseData[]) => {
      try {
        setShowImportModal(false);
        await coursesService.importCourses(importedCourses);
        await loadCourses();
        toast.success(
          `${importedCourses.length} mata kuliah berhasil diimport`
        );
      } catch (error) {
        console.error('Error importing courses:', error);
        toast.error('Gagal mengimpor mata kuliah');
      }
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
    link.download = `mata_kuliah_export_${new Date().toISOString().split('T')[0]}.json`;
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
      if (checked) {
        setSelectedCourses((prev) => [...prev, courseId]);
      } else {
        setSelectedCourses((prev) => prev.filter((id) => id !== courseId));
      }
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
    if (courseToDelete) {
      try {
        const courseName = `${getFullCourseCode(courseToDelete)} - ${
          courseToDelete.name
        }`;
        setShowDeleteDialog(false);
        await coursesService.deleteCourse({
          course_code: courseToDelete.code,
          class_name: courseToDelete.class,
        });
        await loadCourses();
        toast.success(`${courseName} berhasil dihapus`);
        setCourseToDelete(null);
      } catch (error) {
        console.error('Error deleting course:', error);
        toast.error('Gagal menghapus mata kuliah');
        setShowDeleteDialog(true); // Re-open on error
      }
    }
  }, [courseToDelete, loadCourses]);

  const handleConfirmBulkDelete = useCallback(async () => {
    try {
      const count = selectedCourses.length;
      const coursesToDelete = courses
        .filter((c) => selectedCourses.includes(c.id))
        .map((c) => ({ course_code: c.code, class_name: c.class }));

      if (coursesToDelete.length === 0) {
        toast.error('Tidak ada mata kuliah yang valid untuk dihapus.');
        return;
      }

      setShowBulkDeleteDialog(false);
      await coursesService.deleteCourses(coursesToDelete);
      await loadCourses();
      toast.success(`${count} mata kuliah berhasil dihapus`);
      setSelectedCourses([]);
    } catch (error) {
      console.error('Error deleting courses:', error);
      toast.error('Gagal menghapus mata kuliah');
      setShowBulkDeleteDialog(true); // Re-open on error
    }
  }, [selectedCourses, loadCourses, courses]);

  return {
    // State
    courses,
    filteredCourses,
    groupedCourses,
    availableClasses,
    selectedCourseNames,
    searchQuery,
    selectedCourses,
    selectedSemester,
    selectedClass,
    groupByCode,
    isLoading,
    showCourseModal,
    showImportModal,
    showDeleteDialog,
    showBulkDeleteDialog,
    editingCourse,
    courseToDelete,
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
