import { z } from 'zod';

// Base validation rules for course fields
export const courseValidation = {
  code: z
    .string({ required_error: 'Kode mata kuliah harus diisi' })
    .min(1, 'Kode mata kuliah harus diisi')
    .min(3, 'Kode mata kuliah minimal 3 karakter')
    .max(10, 'Kode mata kuliah maksimal 10 karakter')
    .transform((val) => val.toUpperCase())
    .refine(
      (val) => /^[A-Z0-9]+$/.test(val),
      'Kode mata kuliah hanya boleh menggunakan huruf besar dan angka'
    ),

  name: z
    .string({ required_error: 'Nama mata kuliah harus diisi' })
    .min(1, 'Nama mata kuliah harus diisi')
    .min(3, 'Nama mata kuliah minimal 3 karakter')
    .max(100, 'Nama mata kuliah maksimal 100 karakter'),

  lecturer: z
    .string({ required_error: 'Nama dosen harus diisi' })
    .min(1, 'Nama dosen harus diisi')
    .min(2, 'Nama dosen minimal 2 karakter')
    .max(50, 'Nama dosen maksimal 50 karakter'),

  credits: z
    .number({
      invalid_type_error: 'SKS harus berupa angka',
      required_error: 'SKS harus diisi',
    })
    .min(1, 'SKS minimal 1')
    .max(20, 'SKS maksimal 20'),

  room: z
    .string({ required_error: 'Ruang harus diisi' })
    .min(1, 'Ruang harus diisi')
    .min(1, 'Ruang minimal 1 karakter')
    .max(20, 'Ruang maksimal 20 karakter'),

  day: z
    .string({ required_error: 'Hari harus dipilih' })
    .min(1, 'Hari harus dipilih'),

  startTime: z
    .string({ required_error: 'Waktu mulai harus diisi' })
    .min(1, 'Waktu mulai harus diisi')
    .regex(
      /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
      'Format waktu tidak valid (HH:MM)'
    ),

  endTime: z
    .string({ required_error: 'Waktu selesai harus diisi' })
    .min(1, 'Waktu selesai harus diisi')
    .regex(
      /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
      'Format waktu tidak valid (HH:MM)'
    ),

  semester: z
    .string({ required_error: 'Semester harus dipilih' })
    .min(1, 'Semester harus dipilih'),

  category: z.enum(['wajib', 'pilihan'], {
    required_error: 'Kategori harus dipilih',
  }),

  class: z
    .string({ required_error: 'Kelas harus diisi' })
    .min(1, 'Kelas harus diisi')
    .min(1, 'Kelas minimal 1 karakter')
    .max(5, 'Kelas maksimal 5 karakter')
    .transform((val) => val.toUpperCase())
    .refine(
      (val) => /^[A-Z0-9]+$/.test(val),
      'Kelas hanya boleh menggunakan huruf besar dan angka'
    ),
};

// Base object schema without refinement, can be used for validation.
export const courseSchema = z.object({
  id: z.string().optional(),
  code: courseValidation.code,
  name: courseValidation.name,
  lecturer: courseValidation.lecturer,
  credits: courseValidation.credits,
  room: courseValidation.room,
  day: courseValidation.day,
  startTime: courseValidation.startTime,
  endTime: courseValidation.endTime,
  semester: courseValidation.semester,
  category: courseValidation.category,
  class: courseValidation.class,
});

// Create course schema
export const createCourseSchema = courseSchema.refine(
  (data) => {
    const start = new Date(`2000-01-01T${data.startTime}:00`);
    const end = new Date(`2000-01-01T${data.endTime}:00`);
    return start < end;
  },
  {
    message: 'Waktu selesai harus lebih dari waktu mulai',
    path: ['endTime'],
  }
);

// Update course schema
export const updateCourseSchema = courseSchema
  .partial()
  .extend({
    id: z.string().min(1, 'ID mata kuliah harus ada'),
  })
  .refine(
    (data) => {
      if (data.startTime && data.endTime) {
        const start = new Date(`2000-01-01T${data.startTime}:00`);
        const end = new Date(`2000-01-01T${data.endTime}:00`);
        return start < end;
      }
      return true;
    },
    {
      message: 'Waktu selesai harus lebih dari waktu mulai',
      path: ['endTime'],
    }
  );

// Import validation schema for JSON files
export const importCourseSchema = z.array(
  z.object({
    code: z.string(),
    name: z.string(),
    lecturer: z.string(),
    credits: z.number(),
    room: z.string(),
    day: z.string(),
    startTime: z.string(),
    endTime: z.string(),
    semester: z.string(),
    category: z.enum(['wajib', 'pilihan']),
    class: z.string(),
  })
);

// Type exports
export type CreateCourseFormData = z.infer<typeof createCourseSchema>;
export type UpdateCourseFormData = z.infer<typeof updateCourseSchema>;
export type ImportCourseData = z.infer<typeof importCourseSchema>;

// Validation helper functions
export function validateCourseCode(code: string): boolean {
  return courseValidation.code.safeParse(code).success;
}

export function validateCourseTime(
  startTime: string,
  endTime: string
): boolean {
  const start = new Date(`2000-01-01T${startTime}:00`);
  const end = new Date(`2000-01-01T${endTime}:00`);
  return start < end;
}

export function validateCourseCredits(credits: number): boolean {
  return courseValidation.credits.safeParse(credits).success;
}

// Simple validation helper for import
export function validateImportedCourse(
  course: unknown,
  index: number
): string[] {
  const errors: string[] = [];
  const courseIndex = index + 1;

  // Type checking
  if (typeof course !== 'object' || course === null) {
    errors.push(`Mata kuliah ${courseIndex}: Data tidak valid`);
    return errors;
  }

  const c = course as Record<string, unknown>;

  // Basic validation
  if (typeof c.code !== 'string' || c.code.length < 5) {
    errors.push(`Mata kuliah ${courseIndex}: Kode mata kuliah tidak valid`);
  }

  if (typeof c.name !== 'string' || c.name.length < 3) {
    errors.push(`Mata kuliah ${courseIndex}: Nama mata kuliah tidak valid`);
  }

  if (typeof c.lecturer !== 'string' || c.lecturer.length < 2) {
    errors.push(`Mata kuliah ${courseIndex}: Nama dosen tidak valid`);
  }

  if (typeof c.credits !== 'number' || c.credits < 1 || c.credits > 20) {
    errors.push(`Mata kuliah ${courseIndex}: SKS tidak valid (harus 1-20)`);
  }

  if (typeof c.room !== 'string' || c.room.length < 1) {
    errors.push(`Mata kuliah ${courseIndex}: Ruang tidak valid`);
  }

  if (typeof c.day !== 'string') {
    errors.push(`Mata kuliah ${courseIndex}: Hari tidak valid`);
  }

  if (typeof c.startTime !== 'string' || typeof c.endTime !== 'string') {
    errors.push(`Mata kuliah ${courseIndex}: Waktu tidak valid`);
  }

  if (typeof c.semester !== 'string') {
    errors.push(`Mata kuliah ${courseIndex}: Semester tidak valid`);
  }

  if (c.category !== 'wajib' && c.category !== 'pilihan') {
    errors.push(
      `Mata kuliah ${courseIndex}: Kategori tidak valid (harus 'wajib' atau 'pilihan')`
    );
  }

  if (typeof c.class !== 'string' || c.class.length < 1) {
    errors.push(`Mata kuliah ${courseIndex}: Kelas tidak valid`);
  }

  return errors;
}
