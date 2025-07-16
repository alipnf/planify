import { create } from 'zustand';
import { type User, type Session } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';

interface Message {
  type: 'success' | 'error';
  text: string;
}

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isSubmitting: boolean;
  message: Message | null;
  setSubmitting: (isSubmitting: boolean) => void;
  setMessage: (message: Message | null) => void;
  initialize: () => () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  loading: true,
  isSubmitting: false,
  message: null,
  setSubmitting: (isSubmitting) => set({ isSubmitting }),
  setMessage: (message) => set({ message }),
  initialize: () => {
    const supabase = createClient();

    const fetchSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        set({
          user: session?.user ?? null,
          session,
          loading: false,
        });
      } catch (error) {
        set({ loading: false });
        console.error('Error fetching session:', error);
      }
    };

    fetchSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      set({ user: session?.user ?? null, session });
    });

    return () => {
      subscription.unsubscribe();
    };
  },
}));

// Initialize the store
if (typeof window !== 'undefined') {
  useAuthStore.getState().initialize();
}
