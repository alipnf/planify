'use client';

import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/lib/stores/auth';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';

interface GoogleSignInButtonProps {
  text: string;
  loadingText: string;
  className?: string;
}

// Spinner component
const Spinner = () => (
  <svg className="w-4 h-4 mr-2 animate-spin" viewBox="0 0 24 24">
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
      fill="none"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

// Google icon component
const GoogleIcon = () => (
  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

export function GoogleSignInButton({
  text,
  loadingText,
  className = 'w-full mb-4',
}: GoogleSignInButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const setMessage = useAuthStore((state) => state.setMessage);
  const searchParams = useSearchParams();

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setMessage(null);
    const supabase = createClient();
    try {
      // Get the callbackUrl from the current URL if it exists
      const callbackUrl = searchParams.get('callbackUrl');

      // Build the redirect URL with callbackUrl parameter if present
      const redirectUrl = new URL(`${window.location.origin}/api/callback`);
      if (callbackUrl) {
        redirectUrl.searchParams.set('next', callbackUrl);
      }

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl.toString(),
        },
      });
      if (error) throw error;
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('An unknown error occurred during Google Sign-In.');
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Gagal dengan Google. Silakan coba lagi.',
      });
      console.error('Error signing in:', error);
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleGoogleSignIn}
      disabled={isLoading}
      variant="outline"
      className={className}
    >
      {isLoading ? <Spinner /> : <GoogleIcon />}
      {isLoading ? loadingText : text}
    </Button>
  );
}
