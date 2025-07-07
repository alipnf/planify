import { useState, useMemo, useCallback } from 'react';
import { Course } from '@/lib/types/course';
import {
  detectTimeConflicts,
  calculateScheduleStats,
} from '@/lib/schedule-utils';

export function useScheduleManagement() {
  const [selectedCourses, setSelectedCourses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSemester, setFilterSemester] = useState('all');

  // Memoized computations
  const conflicts = useMemo(
    () => detectTimeConflicts(selectedCourses),
    [selectedCourses]
  );
  const stats = useMemo(
    () => calculateScheduleStats(selectedCourses),
    [selectedCourses]
  );

  // Filter courses based on search and semester
  const filterCourses = useCallback(
    (courses: Course[]) => {
      return courses.filter((course) => {
        const matchesSearch =
          searchQuery === '' ||
          course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
          course.lecturer.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesSemester =
          filterSemester === 'all' || course.semester === filterSemester;

        return matchesSearch && matchesSemester;
      });
    },
    [searchQuery, filterSemester]
  );

  // Toggle course selection
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

  // Clear all selections
  const clearAllSelections = useCallback(() => {
    setSelectedCourses([]);
  }, []);

  // Set selected courses (for AI generation or loading saved schedules)
  const setSelectedCoursesDirectly = useCallback((courses: Course[]) => {
    setSelectedCourses(courses);
  }, []);

  return {
    // State
    selectedCourses,
    searchQuery,
    filterSemester,

    // Computed values
    conflicts,
    stats,

    // Functions
    filterCourses,
    toggleCourse,
    clearAllSelections,
    setSelectedCoursesDirectly,

    // Setters
    setSearchQuery,
    setFilterSemester,
  };
}
