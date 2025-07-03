'use client';

import { useRouter } from 'next/navigation';
import { Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMessage } from '@/lib/hooks/use-message';
import { MessageDisplay } from '@/components/ui/message-display';
import { GoogleSignInButton } from '@/components/auth/google-signin-button';
import { AuthLayout, AuthSeparator } from '@/components/auth/auth-layout';
import { PasswordInput } from '@/components/ui/password-input';
import { FormField } from '@/components/ui/form-field';
import { loginSchema, type LoginFormData } from '@/lib/schemas/auth';

export default function LoginPage() {
  const { message, showError, showSuccess, clearMessage } = useMessage();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    clearMessage();

    const supabase = createClient();
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          showError('Email atau password salah. Silakan periksa kembali.');
        } else {
          showError(error.message);
        }
      } else {
        showSuccess('Login berhasil! Mengalihkan...');
        setTimeout(() => router.push('/'), 1000);
      }
    } catch (error) {
      showError('Terjadi kesalahan. Silakan coba lagi.');
      console.error('Error logging in:', error);
    }
  };

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
        disabled={isSubmitting}
        onError={showError}
      />

      <AuthSeparator />

      <MessageDisplay message={message} className="mb-4" />

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
