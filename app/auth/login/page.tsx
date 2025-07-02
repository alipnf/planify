'use client';

import { useRouter } from 'next/navigation';
import { Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// Refactored imports
import { useMessage } from '@/lib/hooks/use-message';
import { MessageDisplay } from '@/components/ui/message-display';
import { GoogleSignInButton } from '@/components/auth/google-signin-button';
import { AuthLayout, AuthSeparator } from '@/components/auth/auth-layout';
import { PasswordInput } from '@/components/ui/password-input';
import { FormField } from '@/components/ui/form-field';
import { loginSchema, type LoginFormData } from '@/lib/schemas/auth';
import { AUTH_ERRORS, FORM_LABELS, FORM_PLACEHOLDERS, BUTTON_TEXTS } from '@/lib/constants/auth';

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
          showError(AUTH_ERRORS.INVALID_CREDENTIALS);
        } else {
          showError(error.message);
        }
      } else {
        showSuccess(AUTH_ERRORS.LOGIN_SUCCESS);
        setTimeout(() => router.push('/'), 1000);
      }
    } catch (error) {
      showError(AUTH_ERRORS.GENERAL_ERROR);
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
        text={BUTTON_TEXTS.GOOGLE_LOGIN}
        loadingText={BUTTON_TEXTS.GOOGLE_LOGIN_LOADING}
        disabled={isSubmitting}
        onError={showError}
      />

      <AuthSeparator />

      <MessageDisplay message={message} className="mb-4" />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          id="email"
          label={FORM_LABELS.EMAIL}
          type="email"
          placeholder={FORM_PLACEHOLDERS.EMAIL}
          icon={Mail}
          error={errors.email?.message}
          {...register('email')}
        />

        <PasswordInput
          id="password"
          label={FORM_LABELS.PASSWORD}
          error={errors.password?.message}
          {...register('password')}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>{BUTTON_TEXTS.LOGIN_LOADING}</span>
            </div>
          ) : (
            BUTTON_TEXTS.LOGIN
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}
