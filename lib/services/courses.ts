import { createClient } from '@/lib/supabase/client';
import {
  Course,
  CreateCourseData,
  CourseFromSupabase,
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

// A helper function to handle upserting related data (lecturer, definition)
async function upsertCourseDependencies(courseData: {
  code: string;
  name: string;
  lecturer: string;
  credits: number;
  category: 'wajib' | 'pilihan';
}) {
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

  return { lecturer, definition };
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

  const { lecturer, definition } = await upsertCourseDependencies(courseData);

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
    .insert(courseInsertData)
    .select('*')
    .single();

  if (courseError) {
    console.error('Error creating course:', courseError);
    if (courseError.code === '23505') {
      // Unique constraint violation
      throw new Error(
        `Mata kuliah dengan kode ${courseData.code} dan kelas ${courseData.class} sudah ada.`
      );
    }
    throw new Error(`Failed to create course: ${courseError.message}`);
  }

  return transformToCourse({
    ...newCourse,
    course_definition: definition,
    lecturer: lecturer,
  });
}

export async function updateCourse(
  courseIdentifier: { course_code: string; class_name: string },
  courseData: Partial<CreateCourseData>
): Promise<Course> {
  const user = await getCurrentUser();

  const fullCourseData = {
    // Fill with old data first
    code: courseIdentifier.course_code,
    name: '', // Will be fetched or provided
    lecturer: '', // Will be fetched or provided
    credits: 0, // Will be fetched or provided
    category: 'pilihan' as const, // Will be fetched or provided
    class: courseIdentifier.class_name,
    ...courseData, // Overwrite with new data
  };

  // If name, lecturer, etc. are not in courseData, we need to fetch them
  if (
    !fullCourseData.name ||
    !fullCourseData.lecturer ||
    !fullCourseData.credits
  ) {
    const { data: oldCourse, error: fetchError } = await supabase
      .from('courses')
      .select(
        '*, course_definition:course_definitions(*), lecturer:lecturers(*)'
      )
      .match(courseIdentifier)
      .single();

    if (fetchError || !oldCourse) {
      throw new Error('Could not find the original course to update.');
    }
    fullCourseData.name =
      fullCourseData.name || oldCourse.course_definition?.name || '';
    fullCourseData.lecturer =
      fullCourseData.lecturer || oldCourse.lecturer?.name || '';
    fullCourseData.credits =
      fullCourseData.credits || oldCourse.course_definition?.credits || 0;
    fullCourseData.category =
      courseData.category || oldCourse.course_definition?.category || 'pilihan';
  }

  const { lecturer, definition } =
    await upsertCourseDependencies(fullCourseData);

  const courseUpdateData = {
    user_id: user.id,
    course_code: definition.code,
    lecturer_id: lecturer.id,
    class_name: fullCourseData.class,
    room_name: fullCourseData.room,
    day_of_week: fullCourseData.day,
    start_time: fullCourseData.startTime,
    end_time: fullCourseData.endTime,
    semester: fullCourseData.semester,
  };

  const { data: updatedCourse, error: courseError } = await supabase
    .from('courses')
    .update(courseUpdateData)
    .match({
      user_id: user.id,
      course_code: courseIdentifier.course_code,
      class_name: courseIdentifier.class_name,
    })
    .select('*')
    .single();

  if (courseError) {
    console.error('Error updating course:', courseError);
    if (courseError.code === '23505') {
      // Unique constraint violation
      throw new Error(
        `Mata kuliah dengan kode ${fullCourseData.code} dan kelas ${fullCourseData.class} sudah ada.`
      );
    }
    throw new Error(`Failed to update course: ${courseError.message}`);
  }

  return transformToCourse({
    ...updatedCourse,
    course_definition: definition,
    lecturer: lecturer,
  });
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
  // We have to delete one by one because Supabase doesn't easily support
  // bulk deletes on composite primary keys without using an RPC.
  for (const identifier of courseIdentifiers) {
    const { error } = await supabase.from('courses').delete().match({
      user_id: user.id,
      course_code: identifier.course_code,
      class_name: identifier.class_name,
    });

    if (error) {
      console.error(
        `Error deleting course ${identifier.course_code}-${identifier.class_name}:`,
        error
      );
      // We'll continue trying to delete others even if one fails.
    }
  }
}

export async function importCourses(
  courses: CreateCourseData[]
): Promise<Course[]> {
  const user = await getCurrentUser();

  // 1. Upsert all lecturers in one go
  const lecturerNames = [...new Set(courses.map((c) => c.lecturer))];
  const { data: lecturers, error: lecturerError } = await supabase
    .from('lecturers')
    .upsert(
      lecturerNames.map((name) => ({ name })),
      { onConflict: 'name' }
    )
    .select('id, name');

  if (lecturerError) {
    console.error('Error bulk upserting lecturers:', lecturerError);
    throw new Error('Failed to import lecturers');
  }
  const lecturerMap = new Map(lecturers.map((l) => [l.name, l.id]));

  // 2. Upsert all course definitions in one go
  const definitionMap = new Map<string, CreateCourseData>();
  courses.forEach((c) => {
    // In case of duplicate codes, the last one wins. This is acceptable.
    definitionMap.set(c.code, c);
  });
  const definitionsToUpsert = [...definitionMap.values()].map((c) => ({
    code: c.code,
    name: c.name,
    credits: c.credits,
    category: c.category,
  }));

  const { data: definitions, error: definitionError } = await supabase
    .from('course_definitions')
    .upsert(definitionsToUpsert, { onConflict: 'code' })
    .select('code, name, credits, category');

  if (definitionError) {
    console.error('Error bulk upserting definitions:', definitionError);
    throw new Error('Failed to import course definitions');
  }

  const definitionResultMap = new Map(definitions.map((d) => [d.code, d]));

  // 3. Prepare course instances for insertion
  const coursesToInsert = courses.map((course) => {
    const lecturerId = lecturerMap.get(course.lecturer);
    if (!lecturerId) {
      // This should not happen if lecturer upsert was successful
      throw new Error(`Could not find lecturer ID for ${course.lecturer}`);
    }
    return {
      user_id: user.id,
      course_code: course.code,
      lecturer_id: lecturerId,
      class_name: course.class,
      room_name: course.room,
      day_of_week: course.day,
      start_time: course.startTime,
      end_time: course.endTime,
      semester: course.semester,
    };
  });

  // 4. Insert all course instances in one go
  const { data: newCourses, error: courseError } = await supabase
    .from('courses')
    .insert(coursesToInsert)
    .select('*');

  if (courseError) {
    console.error('Error bulk inserting courses:', courseError);
    if (courseError.code === '23505') {
      throw new Error('Gagal mengimpor: terdapat mata kuliah duplikat.');
    }
    throw new Error('Failed to import courses');
  }

  // 5. Transform and return the created courses
  return newCourses.map((course) =>
    transformToCourse({
      ...course,
      lecturer: lecturers.find((l) => l.id === course.lecturer_id) || null,
      course_definition: definitionResultMap.get(course.course_code) || null,
    })
  );
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
