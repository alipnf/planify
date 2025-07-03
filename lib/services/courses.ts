import { createClient } from '@/lib/supabase/client';
import { Course, CreateCourseData, UpdateCourseData } from '@/lib/types/course';

// Initialize Supabase client
const supabase = createClient();

// Utility function: Transform camelCase to snake_case for database
export function transformToDbFormat(
  data: CreateCourseData | Partial<CreateCourseData>
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  // Copy all properties except time fields
  Object.keys(data).forEach((key) => {
    if (key !== 'startTime' && key !== 'endTime') {
      result[key] = data[key as keyof typeof data];
    }
  });

  // Transform time fields
  if ('startTime' in data && data.startTime) {
    result.start_time = data.startTime;
  }
  if ('endTime' in data && data.endTime) {
    result.end_time = data.endTime;
  }

  return result;
}

// Utility function: Transform snake_case to camelCase for frontend
export function transformFromDbFormat(data: Record<string, unknown>): Course {
  const result: Record<string, unknown> = {};

  // Copy all properties except time fields
  Object.keys(data).forEach((key) => {
    if (key !== 'start_time' && key !== 'end_time') {
      result[key] = data[key];
    }
  });

  // Transform time fields
  if (data.start_time) {
    result.startTime = data.start_time;
  }
  if (data.end_time) {
    result.endTime = data.end_time;
  }

  return result as unknown as Course;
}

// Utility function: Get current authenticated user
export async function getCurrentUser() {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      console.error('Error getting current user:', error);
      return null;
    }

    return user;
  } catch (error) {
    console.error('Error in getCurrentUser:', error);
    return null;
  }
}

// Course service functions
export async function getAllCourses(): Promise<Course[]> {
  try {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .order('semester', { ascending: true })
      .order('code', { ascending: true })
      .order('class', { ascending: true });

    if (error) {
      console.error('Error fetching courses:', error);
      throw new Error(`Failed to fetch courses: ${error.message}`);
    }

    return (data || []).map((course) => transformFromDbFormat(course));
  } catch (error) {
    console.error('Error in getAllCourses:', error);
    throw error;
  }
}

export async function createCourse(
  courseData: CreateCourseData
): Promise<Course> {
  try {
    const user = await getCurrentUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    // Transform camelCase to snake_case for database
    const dbData = transformToDbFormat(courseData);

    const { data, error } = await supabase
      .from('courses')
      .insert({
        ...dbData,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating course:', error);
      throw new Error(`Failed to create course: ${error.message}`);
    }

    return transformFromDbFormat(data);
  } catch (error) {
    console.error('Error in createCourse:', error);
    throw error;
  }
}

export async function updateCourse(
  courseData: UpdateCourseData
): Promise<Course> {
  try {
    const { id, ...updateData } = courseData;

    // Transform camelCase to snake_case for database
    const dbUpdateData = transformToDbFormat(updateData);

    const { data, error } = await supabase
      .from('courses')
      .update(dbUpdateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating course:', error);
      throw new Error(`Failed to update course: ${error.message}`);
    }

    return transformFromDbFormat(data);
  } catch (error) {
    console.error('Error in updateCourse:', error);
    throw error;
  }
}

export async function deleteCourse(courseId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', courseId);

    if (error) {
      console.error('Error deleting course:', error);
      throw new Error(`Failed to delete course: ${error.message}`);
    }
  } catch (error) {
    console.error('Error in deleteCourse:', error);
    throw error;
  }
}

export async function deleteCourses(courseIds: string[]): Promise<void> {
  try {
    const { error } = await supabase
      .from('courses')
      .delete()
      .in('id', courseIds);

    if (error) {
      console.error('Error deleting courses:', error);
      throw new Error(`Failed to delete courses: ${error.message}`);
    }
  } catch (error) {
    console.error('Error in deleteCourses:', error);
    throw error;
  }
}

export async function importCourses(
  courses: CreateCourseData[]
): Promise<Course[]> {
  try {
    const user = await getCurrentUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    const coursesWithUserId = courses.map((course) => ({
      ...transformToDbFormat(course),
      user_id: user.id,
    }));

    const { data, error } = await supabase
      .from('courses')
      .insert(coursesWithUserId)
      .select();

    if (error) {
      console.error('Error importing courses:', error);
      throw new Error(`Failed to import courses: ${error.message}`);
    }

    return (data || []).map((course) => transformFromDbFormat(course));
  } catch (error) {
    console.error('Error in importCourses:', error);
    throw error;
  }
}

// Legacy object-style export for backward compatibility
export const coursesService = {
  getAllCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  deleteCourses,
  importCourses,
  getCurrentUser,
};

