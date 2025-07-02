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
import {
  AUTH_ERRORS,
  FORM_LABELS,
  FORM_PLACEHOLDERS,
  BUTTON_TEXTS,
} from '@/lib/constants/auth';

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
          showError(AUTH_ERRORS.EMAIL_EXISTS);
        } else {
          showError(error.message);
        }
      } else {
        showSuccess(AUTH_ERRORS.REGISTRATION_SUCCESS);
      }
    } catch (error) {
      showError(AUTH_ERRORS.GENERAL_ERROR);
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
        text={BUTTON_TEXTS.GOOGLE_REGISTER}
        loadingText={BUTTON_TEXTS.GOOGLE_REGISTER_LOADING}
        disabled={isSubmitting}
        onError={showError}
      />

      <AuthSeparator />

      <MessageDisplay message={message} className="mb-4" />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          id="name"
          label={FORM_LABELS.FULL_NAME}
          type="text"
          placeholder={FORM_PLACEHOLDERS.FULL_NAME}
          icon={User}
          error={errors.name?.message}
          {...register('name')}
        />

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

        <PasswordInput
          id="confirmPassword"
          label={FORM_LABELS.CONFIRM_PASSWORD}
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>{BUTTON_TEXTS.REGISTER_LOADING}</span>
            </div>
          ) : (
            BUTTON_TEXTS.REGISTER
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}
