import { z } from 'zod';

// Base validation rules
export const authValidation = {
  email: z
    .string()
    .min(1, 'Email harus diisi')
    .email('Format email tidak valid'),
  password: z
    .string()
    .min(1, 'Kata sandi harus diisi')
    .min(6, 'Kata sandi minimal 6 karakter')
    .max(100, 'Kata sandi maksimal 100 karakter'),
  name: z
    .string()
    .min(1, 'Nama harus diisi')
    .min(2, 'Nama minimal 2 karakter')
    .max(50, 'Nama maksimal 50 karakter'),
  confirmPassword: z.string().min(1, 'Konfirmasi kata sandi harus diisi'),
};

// Login schema
export const loginSchema = z.object({
  email: authValidation.email,
  password: authValidation.password,
});

// Register schema
export const registerSchema = z
  .object({
    name: authValidation.name,
    email: authValidation.email,
    password: authValidation.password,
    confirmPassword: authValidation.confirmPassword,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Konfirmasi kata sandi tidak sama dengan kata sandi',
    path: ['confirmPassword'],
  });

// Type exports
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
