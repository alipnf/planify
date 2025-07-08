import { Course } from '@/lib/types/course';

export const getFullCourseCode = (course: Course): string => {
  return `${course.code}-${course.class}`;
};

export const groupCoursesByCode = (
  courses: Course[]
): Record<string, Course[]> => {
  return courses.reduce(
    (groups, course) => {
      const { code } = course;
      if (!groups[code]) {
        groups[code] = [];
      }
      groups[code].push(course);
      return groups;
    },
    {} as Record<string, Course[]>
  );
};

export const sortCourseClasses = (courses: Course[]): Course[] => {
  return courses.sort((a, b) => {
    // Sort by class name (A, B, C, AA, BB, etc.)
    if (a.class.length !== b.class.length) {
      return a.class.length - b.class.length;
    }
    return a.class.localeCompare(b.class);
  });
};

export const sortCourses = (courses: Course[]): Course[] => {
  return courses.sort((a, b) => {
    const semesterA = parseInt(a.semester);
    const semesterB = parseInt(b.semester);
    if (semesterA !== semesterB) {
      return semesterA - semesterB;
    }

    const codeCompare = a.code.localeCompare(b.code);
    if (codeCompare !== 0) {
      return codeCompare;
    }

    return a.class.localeCompare(b.class);
  });
};

export const filterCourses = (
  courses: Course[],
  searchQuery: string,
  selectedSemester: string,
  selectedClass: string
): Course[] => {
  return courses.filter((course) => {
    const matchesSearch =
      course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.lecturer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getFullCourseCode(course)
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    const matchesSemester =
      selectedSemester === 'all' || course.semester === selectedSemester;
    const matchesClass =
      selectedClass === 'all' || course.class === selectedClass;

    return matchesSearch && matchesSemester && matchesClass;
  });
};

export const getSelectedCourseNames = (
  courses: Course[],
  selectedCourseIds: string[]
): string[] => {
  return courses
    .filter((c) => selectedCourseIds.includes(c.id))
    .map((c) => `${getFullCourseCode(c)} - ${c.name}`);
};

export const getAvailableClasses = (courses: Course[]): string[] => {
  const classes = [...new Set(courses.map((c) => c.class))].sort();
  return classes;
};

export const formatTime = (time: string): string => {
  // Handles both HH:MM:SS and HH:MM, returns HH:MM
  if (time && time.length >= 5) {
    return time.substring(0, 5);
  }
  return time; // Return original if format is unexpected
};

export const formatTimeRange = (startTime: string, endTime: string): string => {
  return `${formatTime(startTime)} - ${formatTime(endTime)}`;
};
