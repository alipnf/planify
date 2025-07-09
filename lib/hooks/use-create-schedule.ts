'use client';

import { useState, useMemo, useCallback } from 'react';
import { useCourses } from '@/lib/hooks/use-courses';
import { Course } from '@/lib/types/course';
import { saveSchedule } from '@/lib/services/schedules';
import { useMessage } from '@/lib/hooks/use-message';
import {
  detectTimeConflicts,
  calculateScheduleStats,
} from '@/lib/schedule-utils';

export const useCreateSchedule = () => {
  const [activeTab, setActiveTab] = useState('manual');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { showSuccess, showError } = useMessage();

  const { courses, isLoading } = useCourses();

  // --- Merged from useScheduleManagement ---
  const [selectedCourses, setSelectedCourses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSemester, setFilterSemester] = useState('all');
  const [filterClass, setFilterClass] = useState('all');
  const [groupByCode, setGroupByCode] = useState(false);

  const conflicts = useMemo(
    () => detectTimeConflicts(selectedCourses),
    [selectedCourses]
  );
  const stats = useMemo(
    () => calculateScheduleStats(selectedCourses),
    [selectedCourses]
  );

  const filterCourses = useCallback(
    (coursesToFilter: Course[]) => {
      return coursesToFilter.filter((course) => {
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
    [searchQuery, filterSemester, filterClass]
  );

  const toggleCourse = useCallback((course: Course) => {
    setSelectedCourses((prev) => {
      const isSelected = prev.find((c) => c.id === course.id);
      if (isSelected) {
        return prev.filter((c) => c.id !== course.id);
      } else {
        return [...prev, course];
      }
    });
  }, []);

  const clearAllSelections = useCallback(() => {
    setSelectedCourses([]);
  }, []);

  const setSelectedCoursesDirectly = useCallback((courses: Course[]) => {
    setSelectedCourses(courses);
  }, []);
  // --- End of merge ---

  const filteredCourses = filterCourses(courses);

  const handleAIEdit = (aiSelectedCourses: Course[]) => {
    setSelectedCoursesDirectly(aiSelectedCourses);
    setActiveTab('manual');
  };

  const handleAISave = (aiSelectedCourses: Course[]) => {
    setSelectedCoursesDirectly(aiSelectedCourses);
    if (aiSelectedCourses.length === 0) {
      showError('Jadwal yang dipilih kosong.');
      return;
    }
    setIsDialogOpen(true);
  };

  const handleSaveSchedule = () => {
    if (selectedCourses.length === 0) {
      showError('Tidak ada mata kuliah yang dipilih untuk disimpan.');
      return;
    }
    setIsDialogOpen(true);
  };

  const handleConfirmSave = async (scheduleName: string) => {
    setIsSaving(true);
    try {
      await saveSchedule(scheduleName, selectedCourses);
      showSuccess(`Jadwal "${scheduleName}" berhasil disimpan.`);
      setIsDialogOpen(false);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Terjadi kesalahan tidak dikenal.';
      showError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  return {
    activeTab,
    setActiveTab,
    isDialogOpen,
    setIsDialogOpen,
    isSaving,
    courses,
    isLoading,
    selectedCourses,
    searchQuery,
    filterSemester,
    filterClass,
    groupByCode,
    conflicts,
    stats,
    filteredCourses,
    toggleCourse,
    clearAllSelections,
    setSearchQuery,
    setFilterSemester,
    setFilterClass,
    setGroupByCode,
    handleAIEdit,
    handleAISave,
    handleSaveSchedule,
    handleConfirmSave,
  };
};
