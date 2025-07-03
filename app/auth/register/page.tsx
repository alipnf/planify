'use client';

import { Mail, User } from 'lucide-react';
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
import { registerSchema, type RegisterFormData } from '@/lib/schemas/auth';

export default function RegisterPage() {
  const { message, showError, showSuccess, clearMessage } = useMessage();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    clearMessage();

    const supabase = createClient();
    try {
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: { full_name: data.name },
        },
      });
      if (error) {
        if (error.message.includes('already registered')) {
          showError(
            'Email sudah terdaftar. Silakan gunakan email lain atau login.'
          );
        } else {
          showError(error.message);
        }
      } else {
        showSuccess('Pendaftaran berhasil! Cek email untuk konfirmasi akun.');
      }
    } catch (error) {
      showError('Terjadi kesalahan. Silakan coba lagi.');
      console.error('Error registering:', error);
    }
  };

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
        disabled={isSubmitting}
        onError={showError}
      />

      <AuthSeparator />

      <MessageDisplay message={message} className="mb-4" />

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
