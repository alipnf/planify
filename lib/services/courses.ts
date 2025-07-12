import { createClient } from '@/lib/supabase/client';
import {
  Course,
  CreateCourseData,
  UpdateCourseData,
  CourseFromSupabase,
  CourseDefinition,
} from '@/lib/types/course';

const supabase = createClient();

async function getCurrentUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated.');
  return user;
}

function transformToCourse(data: CourseFromSupabase): Course {
  if (!data.course_definition || !data.lecturer) {
    console.warn('Incomplete course data received:', data);
    return {
      id: `${data.course_code}-${data.class_name}`,
      code: data.course_code,
      name: data.course_definition?.name || 'N/A',
      lecturer: data.lecturer?.name || 'N/A',
      credits: data.course_definition?.credits || 0,
      category: data.course_definition?.category || 'pilihan',
      class: data.class_name,
      room: data.room_name,
      day: data.day_of_week,
      startTime: data.start_time?.substring(0, 5) || '00:00',
      endTime: data.end_time?.substring(0, 5) || '00:00',
      semester: data.semester,
      user_id: data.user_id,
      created_at: data.created_at,
    };
  }

  return {
    id: `${data.course_code}-${data.class_name}`,
    code: data.course_code,
    name: data.course_definition.name,
    lecturer: data.lecturer.name,
    credits: data.course_definition.credits,
    category: data.course_definition.category,
    class: data.class_name,
    room: data.room_name,
    day: data.day_of_week,
    startTime: data.start_time.substring(0, 5),
    endTime: data.end_time.substring(0, 5),
    semester: data.semester,
    user_id: data.user_id,
    created_at: data.created_at,
  };
}

export async function getAllCourses(): Promise<Course[]> {
  const user = await getCurrentUser();
  const { data, error } = await supabase
    .from('courses')
    .select(
      `
      *,
      course_definition:course_definitions(*),
      lecturer:lecturers(*)
    `
    )
    .eq('user_id', user.id)
    .order('semester', { ascending: true })
    .order('course_code', { ascending: true })
    .order('class_name', { ascending: true });

  if (error) {
    console.error('Error fetching courses:', error);
    throw new Error(`Failed to fetch courses: ${error.message}`);
  }

  return (data || []).map(transformToCourse);
}

export async function createCourse(
  courseData: CreateCourseData
): Promise<Course> {
  const user = await getCurrentUser();

  const { data: lecturer, error: lecturerError } = await supabase
    .from('lecturers')
    .upsert({ name: courseData.lecturer }, { onConflict: 'name' })
    .select('id, name')
    .single();

  if (lecturerError) {
    console.error('Error upserting lecturer:', lecturerError);
    throw new Error(`Failed to upsert lecturer: ${lecturerError.message}`);
  }

  const { data: definition, error: definitionError } = await supabase
    .from('course_definitions')
    .upsert(
      {
        code: courseData.code,
        name: courseData.name,
        credits: courseData.credits,
        category: courseData.category,
      },
      { onConflict: 'code' }
    )
    .select('code, name, credits, category')
    .single();

  if (definitionError) {
    console.error('Error upserting course definition:', definitionError);
    throw new Error(
      `Failed to upsert course definition: ${definitionError.message}`
    );
  }

  const courseInsertData = {
    user_id: user.id,
    course_code: definition.code,
    lecturer_id: lecturer.id,
    class_name: courseData.class,
    room_name: courseData.room,
    day_of_week: courseData.day,
    start_time: courseData.startTime,
    end_time: courseData.endTime,
    semester: courseData.semester,
  };

  const { data: newCourse, error: courseError } = await supabase
    .from('courses')
    .upsert(courseInsertData, {
      onConflict: 'user_id, course_code, class_name'
    })
    .select('*')
    .single();

  if (courseError) {
    console.error('Error upserting course:', courseError);
    throw new Error(`Failed to upsert course: ${courseError.message}`);
  }

  return transformToCourse({
    ...newCourse,
    course_definition: definition,
    lecturer: lecturer,
  });
}

export async function updateCourse(
  courseIdentifier: { course_code: string; class_name: string },
  courseData: Partial<UpdateCourseData>
): Promise<Course> {
  const user = await getCurrentUser();
  let lecturerId: string | undefined = undefined;

  if (courseData.lecturer) {
    const { data: lecturer, error: lecturerError } = await supabase
      .from('lecturers')
      .upsert({ name: courseData.lecturer }, { onConflict: 'name' })
      .select('id')
      .single();
    if (lecturerError) throw new Error('Failed to update lecturer');
    lecturerId = lecturer.id;
  }

  if (courseData.name || courseData.credits || courseData.category) {
    const definitionUpdate: Partial<Omit<CourseDefinition, 'code'>> = {};
    if (courseData.name) definitionUpdate.name = courseData.name;
    if (courseData.credits) definitionUpdate.credits = courseData.credits;
    if (courseData.category) definitionUpdate.category = courseData.category;

    const { error: definitionError } = await supabase
      .from('course_definitions')
      .update(definitionUpdate)
      .eq('code', courseIdentifier.course_code);
    if (definitionError) throw new Error('Failed to update course definition');
  }

  const courseUpdate: Partial<{
    lecturer_id: string;
    room_name: string;
    day_of_week: string;
    start_time: string;
    end_time: string;
    semester: string;
  }> = {};
  if (lecturerId) courseUpdate.lecturer_id = lecturerId;
  if (courseData.room) courseUpdate.room_name = courseData.room;
  if (courseData.day) courseUpdate.day_of_week = courseData.day;
  if (courseData.startTime) courseUpdate.start_time = courseData.startTime;
  if (courseData.endTime) courseUpdate.end_time = courseData.endTime;
  if (courseData.semester) courseUpdate.semester = courseData.semester;

  if (Object.keys(courseUpdate).length > 0) {
    const { error: courseError } = await supabase
      .from('courses')
      .update(courseUpdate)
      .match({
        user_id: user.id,
        course_code: courseIdentifier.course_code,
        class_name: courseIdentifier.class_name,
      });

    if (courseError) {
      console.error('Error updating course instance:', courseError);
      throw new Error('Failed to update course instance');
    }
  }

  const { data: updatedCourseData, error: fetchError } = await supabase
    .from('courses')
    .select('*, course_definition:course_definitions(*), lecturer:lecturers(*)')
    .match({
      user_id: user.id,
      course_code: courseIdentifier.course_code,
      class_name: courseIdentifier.class_name,
    })
    .single();

  if (fetchError) {
    console.error('Error fetching updated course:', fetchError);
    throw new Error('Failed to fetch updated course data');
  }

  return transformToCourse(updatedCourseData);
}

export async function deleteCourse(courseIdentifier: {
  course_code: string;
  class_name: string;
}): Promise<void> {
  const user = await getCurrentUser();
  const { error } = await supabase.from('courses').delete().match({
    user_id: user.id,
    course_code: courseIdentifier.course_code,
    class_name: courseIdentifier.class_name,
  });

  if (error) {
    console.error('Error deleting course:', error);
    throw new Error(`Failed to delete course: ${error.message}`);
  }
}

export async function deleteCourses(
  courseIdentifiers: { course_code: string; class_name: string }[]
): Promise<void> {
  const user = await getCurrentUser();
  const errors: string[] = [];
  for (const identifier of courseIdentifiers) {
    const { error } = await supabase.from('courses').delete().match({
      user_id: user.id,
      course_code: identifier.course_code,
      class_name: identifier.class_name,
    });
    if (error) {
      errors.push(`Failed to delete course ${identifier.course_code}-${identifier.class_name}: ${error.message}`);
    }
  }
  if (errors.length > 0) {
    console.error('Errors deleting courses:', errors);
    throw new Error(`Failed to delete some courses: ${errors.join('; ')}`);
  }
}

export async function importCourses(
  courses: CreateCourseData[]
): Promise<Course[]> {
  const imported: Course[] = [];
  for (const courseData of courses) {
    try {
      const newCourse = await createCourse(courseData);
      imported.push(newCourse);
    } catch (error) {
      console.error(
        `Failed to import course ${courseData.code} - ${courseData.class}:`,
        error
      );
    }
  }
  return imported;
}

export const coursesService = {
  getAllCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  deleteCourses,
  importCourses,
  getCurrentUser,
};
