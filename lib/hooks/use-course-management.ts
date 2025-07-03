import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { Course, CreateCourseData, UpdateCourseData } from '@/lib/types/course';
import * as coursesService from '@/lib/services/courses';
import {
  filterCourses,
  sortCourses,
  groupCoursesByCode,
  sortCourseClasses,
  getSelectedCourseNames,
  getAvailableClasses,
  getFullCourseCode,
} from '@/lib/utils/course-utils';

export interface CourseManagementState {
  // Data
  courses: Course[];
  filteredCourses: Course[];
  groupedCourses: Array<{
    code: string;
    courses: Course[];
    totalClasses: number;
  }> | null;
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
}

export interface CourseManagementActions {
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

export function useCourseManagement(): CourseManagementState &
  CourseManagementActions {
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
  }, []); // Add empty dependency array to only run once on mount

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
    return Object.entries(grouped).map(([code, coursesInGroup]) => ({
      code,
      courses: sortCourseClasses(coursesInGroup),
      totalClasses: coursesInGroup.length,
    }));
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

  // Data Actions
  const loadCourses = useCallback(async () => {
    try {
      setIsLoading(true);
      // Add small delay to allow authentication to initialize properly
      await new Promise(resolve => setTimeout(resolve, 500));
      const data = await coursesService.getAllCourses();
      setCourses(data);
    } catch (error) {
      console.error('Error loading courses:', error);
      // Only show error if not on initial load (to avoid error on refresh)
      if (courses.length === 0) {
        // Retry once after a delay
        try {
          await new Promise(resolve => setTimeout(resolve, 1000));
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
        if (editingCourse) {
          // Update existing course
          await coursesService.updateCourse({
            id: editingCourse.id,
            ...courseData,
          } as UpdateCourseData);
          toast.success('Mata kuliah berhasil diperbarui');
        } else {
          // Add new course
          await coursesService.createCourse(courseData as CreateCourseData);
          toast.success('Mata kuliah berhasil ditambahkan');
        }
        await loadCourses(); // Reload courses
        setShowCourseModal(false);
        setEditingCourse(null);
      } catch (error) {
        console.error('Error saving course:', error);
        toast.error('Gagal menyimpan mata kuliah');
      }
    },
    [editingCourse, loadCourses]
  );

  const handleImportCourses = useCallback(
    async (importedCourses: CreateCourseData[]) => {
      try {
        await coursesService.importCourses(importedCourses);
        await loadCourses(); // Reload courses
        setShowImportModal(false);
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
    const dataStr = JSON.stringify(courses, null, 2);
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
      day: 'numeric'
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
        await coursesService.deleteCourse(courseToDelete.id);
        await loadCourses(); // Reload courses
        toast.success(
          `${getFullCourseCode(courseToDelete)} - ${courseToDelete.name} berhasil dihapus`
        );
        setShowDeleteDialog(false);
        setCourseToDelete(null);
      } catch (error) {
        console.error('Error deleting course:', error);
        toast.error('Gagal menghapus mata kuliah');
      }
    }
  }, [courseToDelete, loadCourses]);

  const handleConfirmBulkDelete = useCallback(async () => {
    try {
      await coursesService.deleteCourses(selectedCourses);
      await loadCourses(); // Reload courses
      setSelectedCourses([]);
      toast.success(`${selectedCourses.length} mata kuliah berhasil dihapus`);
      setShowBulkDeleteDialog(false);
    } catch (error) {
      console.error('Error deleting courses:', error);
      toast.error('Gagal menghapus mata kuliah');
    }
  }, [selectedCourses, loadCourses]);

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
