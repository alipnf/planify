'use client';

import { Mail, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/hooks/use-auth';
import { MessageDisplay } from '@/components/ui/message-display';
import { GoogleSignInButton } from '@/components/auth/google-signin-button';
import { AuthLayout, AuthSeparator } from '@/components/auth/auth-layout';
import { PasswordInput } from '@/components/ui/password-input';
import { FormField } from '@/components/ui/form-field';
import { registerSchema, type RegisterFormData } from '@/lib/schemas/auth';
import { AuthError } from '@supabase/supabase-js';

export default function RegisterPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    onSubmit,
  } = useAuth<RegisterFormData>({
    schema: registerSchema,
    handler: async (supabase, data) => {
      const { data: signUpData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: { data: { full_name: data.name } },
      });

      if (error) {
        return error;
      }

      if (signUpData.user && signUpData.user.identities?.length === 0) {
        return new AuthError('User already registered');
      }

      return null;
    },
    successMessage: 'Pendaftaran berhasil! Cek email untuk konfirmasi akun.',
    errorMaps: [
      {
        check: (msg) => msg.includes('already registered'),
        message: 'Email sudah terdaftar. Silakan gunakan email lain.',
      },
    ],
  });

  return (
    <AuthLayout
      title="Daftar ke Planify"
      subtitle="Mulai kelola jadwal kuliah Anda dengan mudah"
      footerText="Sudah punya akun?"
      footerLinkText="Masuk di sini"
      footerLinkHref="/auth/login"
    >
      <GoogleSignInButton
        text="Daftar dengan Google"
        loadingText="Daftar dengan Google..."
      />

      <AuthSeparator />

      <MessageDisplay className="mb-4" />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          id="name"
          label="Nama Lengkap"
          type="text"
          placeholder="Masukkan nama lengkap"
          icon={User}
          error={errors.name?.message}
          {...register('name')}
        />

        <FormField
          id="email"
          label="Email"
          type="email"
          placeholder="nama@contoh.com"
          icon={Mail}
          error={errors.email?.message}
          {...register('email')}
        />

        <PasswordInput
          id="password"
          label="Kata Sandi"
          error={errors.password?.message}
          {...register('password')}
        />

        <PasswordInput
          id="confirmPassword"
          label="Konfirmasi Kata Sandi"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Mendaftar...</span>
            </div>
          ) : (
            'Daftar'
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}
