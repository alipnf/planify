import { useRouter } from 'next/navigation';
import { useForm, type FieldValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/lib/stores/auth';
import type { ZodTypeAny } from 'zod';
import type { AuthError } from '@supabase/supabase-js';
import { useEffect } from 'react';

interface ErrorMap {
  check: (msg: string) => boolean;
  message: string;
}

interface RedirectConfig {
  path: string;
}

interface AuthConfig<T extends FieldValues> {
  schema: ZodTypeAny;
  handler: (
    supabase: ReturnType<typeof createClient>,
    data: T
  ) => Promise<AuthError | null>;
  successMessage: string;
  errorMaps?: ErrorMap[];
  redirectConfig?: RedirectConfig;
}

export function useAuth<T extends FieldValues>({
  schema,
  handler,
  successMessage,
  errorMaps = [],
  redirectConfig,
}: AuthConfig<T>) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<T>({ resolver: zodResolver(schema) });

  const setMessage = useAuthStore((state) => state.setMessage);
  const setSubmitting = useAuthStore((state) => state.setSubmitting);

  useEffect(() => {
    setSubmitting(isSubmitting);
  }, [isSubmitting, setSubmitting]);

  const onSubmit = async (data: T) => {
    setMessage(null);
    const supabase = createClient();
    try {
      const error = await handler(supabase, data);
      if (error) {
        const mapped = errorMaps.find(({ check }) => check(error.message));
        if (mapped) {
          setMessage({ type: 'error', text: mapped.message });
        } else {
          setMessage({ type: 'error', text: error.message });
        }
      } else {
        setMessage({ type: 'success', text: successMessage });
        if (redirectConfig) {
          router.push(redirectConfig.path);
        }
        setTimeout(() => {
          setMessage(null);
        }, 3000);
      }
    } catch (err) {
      setMessage({
        type: 'error',
        text: 'Terjadi kesalahan. Silakan coba lagi.',
      });
      console.error('Error in auth handler:', err);
    }
  };

  return {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    onSubmit,
  };
}

export function useUser() {
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);
  return { user, loading };
}
