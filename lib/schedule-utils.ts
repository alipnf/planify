import { Course } from '@/lib/interfaces/course';

// Days of week array
export const daysOfWeek = [
  'Senin',
  'Selasa',
  'Rabu',
  'Kamis',
  'Jumat',
  'Sabtu',
  'Minggu',
];

// Time conflict detection
interface TimeConflict {
  courses: [Course, Course];
  course1: Course;
  course2: Course;
  day: string;
  time: string;
}

export const detectTimeConflicts = (courses: Course[]): TimeConflict[] => {
  const conflicts: TimeConflict[] = [];

  for (let i = 0; i < courses.length; i++) {
    for (let j = i + 1; j < courses.length; j++) {
      const course1 = courses[i];
      const course2 = courses[j];

      // Check if on same day
      if (course1.day.toLowerCase() === course2.day.toLowerCase()) {
        const start1 = timeToMinutes(course1.startTime);
        const end1 = timeToMinutes(course1.endTime);
        const start2 = timeToMinutes(course2.startTime);
        const end2 = timeToMinutes(course2.endTime);

        // Check for time overlap
        if (start1 < end2 && start2 < end1) {
          conflicts.push({
            courses: [course1, course2],
            course1: course1,
            course2: course2,
            day: course1.day,
            time: `${course1.startTime}-${course1.endTime} vs ${course2.startTime}-${course2.endTime}`,
          });
        }
      }
    }
  }

  return conflicts;
};

// Calculate schedule statistics
export const calculateScheduleStats = (courses: Course[]) => {
  const totalCredits = courses.reduce((sum, course) => sum + course.credits, 0);
  const totalCourses = courses.length;

  // Calculate credits per day
  const creditsPerDay: Record<string, number> = {};
  courses.forEach((course) => {
    const day = course.day.toLowerCase();
    creditsPerDay[day] = (creditsPerDay[day] || 0) + course.credits;
  });

  // Calculate busiest day
  const busiestDay = Object.entries(creditsPerDay).reduce(
    (max, [day, credits]) => (credits > max.credits ? { day, credits } : max),
    { day: '', credits: 0 }
  );

  // Calculate daily distribution
  const dailyDistribution = daysOfWeek.map((day) => ({
    day,
    credits: creditsPerDay[day] || 0,
    courses: courses.filter((c) => c.day.toLowerCase() === day).length,
  }));

  // Calculate time span
  const timeSpan =
    courses.length > 0
      ? calculateTimeSpan(courses)
      : { earliest: '', latest: '' };

  // Calculate busy hours (total class hours)
  const busyHours = courses.reduce((sum, course) => {
    const start = timeToMinutes(course.startTime);
    const end = timeToMinutes(course.endTime);
    return sum + (end - start) / 60;
  }, 0);

  // Calculate earliest and latest class times
  const earliestClass = timeSpan.earliest || 'N/A';
  const latestClass = timeSpan.latest || 'N/A';

  // Calculate free hours (basic estimation)
  const freeHours = Math.max(0, 40 - busyHours); // Assuming 40 hours work week

  return {
    totalCredits,
    totalCourses,
    creditsPerDay,
    busiestDay,
    dailyDistribution,
    timeSpan,
    conflicts: detectTimeConflicts(courses).length,
    busyHours: Math.round(busyHours),
    earliestClass,
    latestClass,
    freeHours: Math.round(freeHours),
  };
};

// Get course color based on course code
export const getCourseColor = (courseCode: string): string => {
  const colors = [
    'bg-blue-100 text-blue-800 border-blue-200',
    'bg-green-100 text-green-800 border-green-200',
    'bg-purple-100 text-purple-800 border-purple-200',
    'bg-yellow-100 text-yellow-800 border-yellow-200',
    'bg-red-100 text-red-800 border-red-200',
    'bg-indigo-100 text-indigo-800 border-indigo-200',
    'bg-pink-100 text-pink-800 border-pink-200',
    'bg-teal-100 text-teal-800 border-teal-200',
  ];

  // Simple hash function to get consistent color for same course code
  let hash = 0;
  for (let i = 0; i < courseCode.length; i++) {
    hash = ((hash << 5) - hash + courseCode.charCodeAt(i)) & 0xffffffff;
  }

  return colors[Math.abs(hash) % colors.length];
};

// Helper function to convert time string to minutes
const timeToMinutes = (timeString: string): number => {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
};

// Helper function to calculate time span
const calculateTimeSpan = (courses: Course[]) => {
  const times = courses.flatMap((course) => [
    { time: course.startTime, type: 'start' },
    { time: course.endTime, type: 'end' },
  ]);

  times.sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time));

  return {
    earliest: times[0]?.time || '',
    latest: times[times.length - 1]?.time || '',
  };
};

// Generate time slots for schedule display
export const generateTimeSlots = (): string[] => {
  const slots: string[] = [];
  for (let hour = 7; hour <= 21; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      slots.push(timeStr);
    }
  }
  return slots;
};

// Find the course for a given day and time (case-insensitive)
export function findCourseAtTime(
  courses: Course[],
  day: string,
  time: string
): Course | undefined {
  const dayLower = day.trim().toLowerCase();
  return courses.find((course) => {
    if (course.day.trim().toLowerCase() !== dayLower) return false;
    return time >= course.startTime && time < course.endTime;
  });
}
