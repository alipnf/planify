'use client';

import { Suspense } from 'react';
import { Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MessageDisplay } from '@/components/ui/message-display';
import { GoogleSignInButton } from '@/components/auth/google-signin-button';
import { AuthLayout, AuthSeparator } from '@/components/auth/auth-layout';
import { PasswordInput } from '@/components/ui/password-input';
import { FormField } from '@/components/ui/form-field';
import { loginSchema, type LoginFormData } from '@/lib/schemas/auth';
import { useAuth } from '@/lib/hooks/use-auth';

function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    onSubmit,
  } = useAuth<LoginFormData>({
    schema: loginSchema,
    handler: async (supabase, data) => {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });
      return error;
    },
    successMessage: 'Login berhasil! Mengalihkan...',
    errorMaps: [
      {
        check: (msg) => msg.includes('Invalid login credentials'),
        message: 'Email atau password salah. Silakan periksa kembali.',
      },
      {
        check: (msg) => msg.includes('Email not confirmed'),
        message:
          'Silakan aktivasi email Anda terlebih dahulu. Cek email Anda untuk link aktivasi.',
      },
    ],
    redirectConfig: { path: '/courses' },
  });

  return (
    <AuthLayout
      title="Masuk ke Planify"
      subtitle="Kelola jadwal kuliah Anda dengan mudah"
      footerText="Belum punya akun?"
      footerLinkText="Daftar di sini"
      footerLinkHref="/auth/register"
    >
      <GoogleSignInButton
        text="Masuk dengan Google"
        loadingText="Masuk dengan Google..."
      />

      <AuthSeparator />

      <MessageDisplay className="mb-4" />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Masuk...</span>
            </div>
          ) : (
            'Masuk'
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}

// Loading fallback component for login page
function LoginLoading() {
  return (
    <AuthLayout
      title="Masuk ke Planify"
      subtitle="Kelola jadwal kuliah Anda dengan mudah"
      footerText="Belum punya akun?"
      footerLinkText="Daftar di sini"
      footerLinkHref="/auth/register"
    >
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    </AuthLayout>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginLoading />}>
      <LoginForm />
    </Suspense>
  );
}
