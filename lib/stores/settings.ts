import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'sonner';

interface SettingsState {
  savedApiKey: string;

  // UI States
  tempApiKey: string; // untuk input form sementara
  showApiKey: boolean;
  isSaving: boolean;

  // Actions
  setShowApiKey: (show: boolean) => void;
  setTempApiKey: (value: string) => void;
  handleSaveApiSettings: () => Promise<void>;
  handleDeleteApiKey: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      // Initial state
      savedApiKey: '',
      tempApiKey: '',
      showApiKey: false,
      isSaving: false,

      // Actions
      setShowApiKey: (show) => set({ showApiKey: show }),

      setTempApiKey: (value) => set({ tempApiKey: value }),

      handleSaveApiSettings: async () => {
        const { tempApiKey } = get();

        if (!tempApiKey.trim()) {
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
            body: JSON.stringify({ apiKey: tempApiKey }),
          });

          const result = await response.json();

          if (response.ok && result.success) {
            set({ savedApiKey: tempApiKey });
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
          savedApiKey: '',
          tempApiKey: '',
        });
        toast.info('API key telah dihapus.');
      },
    }),
    {
      name: 'settings-storage',
      partialize: (state) => ({
        savedApiKey: state.savedApiKey,
        // tempApiKey tidak perlu disimpan di localStorage
      }),
    }
  )
);

// Helper untuk inisialisasi tempApiKey dengan savedApiKey
export const initializeTempApiKey = () => {
  const store = useSettingsStore.getState();
  if (store.savedApiKey && !store.tempApiKey) {
    store.setTempApiKey(store.savedApiKey);
  }
};
