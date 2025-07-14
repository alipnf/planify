import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'sonner';
import { APISettings } from '@/lib/types/settings';

interface SettingsState {
  // API Settings
  apiSettings: APISettings;
  savedApiKey: string;

  // UI States
  showApiKey: boolean;
  isSaving: boolean;

  // Actions
  setShowApiKey: (show: boolean) => void;
  setApiSettings: (settings: APISettings) => void;
  handleApiKeyChange: (value: string) => void;
  handleSaveApiSettings: () => Promise<void>;
  handleDeleteApiKey: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      // Initial state
      apiSettings: {
        googleAiApiKey: '',
      },
      savedApiKey: '',
      showApiKey: false,
      isSaving: false,

      // Actions
      setShowApiKey: (show) => set({ showApiKey: show }),

      setApiSettings: (settings) => set({ apiSettings: settings }),

      handleApiKeyChange: (value) => {
        set((state) => ({
          apiSettings: {
            ...state.apiSettings,
            googleAiApiKey: value,
          },
        }));
      },

      handleSaveApiSettings: async () => {
        const { apiSettings } = get();

        if (!apiSettings.googleAiApiKey.trim()) {
          toast.error('Masukkan API key terlebih dahulu.');
          return;
        }

        set({ isSaving: true });

        try {
          const response = await fetch('/api/test-api', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ apiKey: apiSettings.googleAiApiKey }),
          });

          const result = await response.json();

          if (response.ok && result.success) {
            set({ savedApiKey: apiSettings.googleAiApiKey });
            toast.success('API key valid dan berhasil disimpan!');
          } else {
            toast.error(
              result.message || 'API key tidak valid. Gagal menyimpan.'
            );
          }
        } catch (error) {
          console.error('Error saving API key:', error);
          toast.error('Terjadi kesalahan saat validasi. Gagal menyimpan.');
        } finally {
          set({ isSaving: false });
        }
      },

      handleDeleteApiKey: () => {
        set({
          apiSettings: { googleAiApiKey: '' },
          savedApiKey: '',
        });
        toast.info('API key telah dihapus.');
      },
    }),
    {
      name: 'settings-storage',
      partialize: (state) => ({
        apiSettings: state.apiSettings,
        savedApiKey: state.savedApiKey,
      }),
    }
  )
);

