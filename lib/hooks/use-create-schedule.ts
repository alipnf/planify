'use client';

import { useState } from 'react';
import { useCourseManagement } from '@/lib/hooks/use-course-management';
import { useScheduleManagement } from '@/lib/hooks/use-schedule-management';
import { Course } from '@/lib/types/course';
import { saveSchedule } from '@/lib/services/schedules';
import { useMessage } from '@/lib/hooks/use-message';

export const useCreateSchedule = () => {
  const [activeTab, setActiveTab] = useState('manual');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { showSuccess, showError } = useMessage();

  const { courses, isLoading } = useCourseManagement();

  const {
    selectedCourses,
    searchQuery,
    filterSemester,
    filterClass,
    groupByCode,
    conflicts,
    stats,
    filterCourses,
    toggleCourse,
    clearAllSelections,
    setSelectedCoursesDirectly,
    setSearchQuery,
    setFilterSemester,
    setFilterClass,
    setGroupByCode,
  } = useScheduleManagement();

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
