import { useRouter } from 'next/navigation';
import { useForm, type FieldValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createClient } from '@/lib/supabase/client';
import { useMessage } from '@/lib/hooks/use-message';
import type { ZodTypeAny } from 'zod';
import type { AuthError } from '@supabase/supabase-js';

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
  const { message, showError, showSuccess, clearMessage } = useMessage();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<T>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: T) => {
    clearMessage();
    const supabase = createClient();
    try {
      const error = await handler(supabase, data);
      if (error) {
        const mapped = errorMaps.find(({ check }) => check(error.message));
        if (mapped) {
          showError(mapped.message);
        } else {
          showError(error.message);
        }
      } else {
        showSuccess(successMessage);
        if (redirectConfig) {
          router.push(redirectConfig.path);
        }
      }
    } catch (err) {
      showError('Terjadi kesalahan. Silakan coba lagi.');
      console.error('Error in auth handler:', err);
    }
  };

  return {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    message,
    showError,
    onSubmit,
  };
}
