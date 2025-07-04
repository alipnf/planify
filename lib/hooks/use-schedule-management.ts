import { useState, useMemo } from 'react';
import { Course } from '@/lib/types/course';
import {
  detectTimeConflicts,
  calculateScheduleStats,
  generateTimeSlots,
  findCourseAtTime,
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
  const timeSlots = useMemo(() => generateTimeSlots(), []);

  // Filter courses based on search and semester
  const filterCourses = (courses: Course[]) => {
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
  };

  // Toggle course selection
  const toggleCourse = (course: Course) => {
    setSelectedCourses((prev) => {
      const isSelected = prev.find((c) => c.id === course.id);
      if (isSelected) {
        return prev.filter((c) => c.id !== course.id);
      } else {
        return [...prev, course];
      }
    });
  };

  // Get course at specific day/time for preview
  const getCourseAtTime = (day: string, time: string): Course | undefined => {
    return findCourseAtTime(selectedCourses, day, time);
  };

  // Clear all selections
  const clearAllSelections = () => {
    setSelectedCourses([]);
  };

  // Set selected courses (for AI generation)
  const setSelectedCoursesDirectly = (courses: Course[]) => {
    setSelectedCourses(courses);
  };

  return {
    // State
    selectedCourses,
    searchQuery,
    filterSemester,

    // Computed values
    conflicts,
    stats,
    timeSlots,

    // Functions
    filterCourses,
    toggleCourse,
    getCourseAtTime,
    clearAllSelections,
    setSelectedCoursesDirectly,

    // Setters
    setSearchQuery,
    setFilterSemester,
  };
}
