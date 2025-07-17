import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'sonner';
import {
  getSavedSchedules,
  deleteSavedSchedule,
  saveSchedule,
  updateScheduleSharing,
} from '@/lib/services/schedules';
import { SavedSchedule } from '@/lib/interfaces/schedule';
import { Course } from '@/lib/interfaces/course';
import { detectTimeConflicts } from '@/lib/schedule-utils';

type SavedSchedulesState = {
  schedules: SavedSchedule[];
  isLoading: boolean;
  isDeleting: boolean;
  isSharing: boolean;
  scheduleBeingShared: string | null;
  error: string | null;
  showDeleteAlert: boolean;
  scheduleToDelete: SavedSchedule | null;
  activeSchedule: SavedSchedule | null;
  showImportDialog: boolean;
  showShareDialog: boolean;
  shareUrl: string;
  selectedCourses: () => Course[];
  conflicts: () => ReturnType<typeof detectTimeConflicts>;
  loadSchedules: (forceReload?: boolean) => Promise<void>;
  setShowDeleteAlert: (show: boolean) => void;
  setShowImportDialog: (show: boolean) => void;
  setShowShareDialog: (show: boolean) => void;
  handleDeleteClick: (schedule: SavedSchedule) => void;
  handleConfirmDelete: () => Promise<void>;
  handlePreviewClick: (schedule: SavedSchedule) => void;
  closePreview: () => void;
  handleExport: (schedule: SavedSchedule) => void;
  handleShareClick: (schedule: SavedSchedule) => Promise<void>;
  handleImport: (name: string, courses: Course[]) => Promise<void>;
  clearActiveSchedule: () => void;
};

export const useSavedSchedulesStore = create<SavedSchedulesState>()(
  persist(
    (set, get) => ({
      schedules: [],
      isLoading: true,
      isDeleting: false,
      isSharing: false,
      scheduleBeingShared: null,
      error: null,
      showDeleteAlert: false,
      scheduleToDelete: null,
      activeSchedule: null,
      showImportDialog: false,
      showShareDialog: false,
      shareUrl: '',
      selectedCourses: () => get().activeSchedule?.schedule_data || [],
      conflicts: () => detectTimeConflicts(get().selectedCourses()),
      loadSchedules: async (forceReload = false) => {
        if (!forceReload && get().schedules.length > 0) {
          set({ isLoading: false });
          return;
        }
        set({ isLoading: true });
        try {
          const data = await getSavedSchedules();
          set({ schedules: data, error: null });
        } catch (err) {
          console.error('Failed to fetch schedules:', err);
          set({ error: 'Gagal memuat jadwal. Silakan coba lagi nanti.' });
        } finally {
          set({ isLoading: false });
        }
      },
      setShowDeleteAlert: (show) => set({ showDeleteAlert: show }),
      setShowImportDialog: (show) => set({ showImportDialog: show }),
      setShowShareDialog: (show) => set({ showShareDialog: show }),
      handleDeleteClick: (schedule) => {
        set({ scheduleToDelete: schedule, showDeleteAlert: true });
      },
      handleConfirmDelete: async () => {
        const { scheduleToDelete, activeSchedule, schedules } = get();
        if (!scheduleToDelete) return;
        set({ isDeleting: true });
        try {
          const scheduleName = scheduleToDelete.schedule_name || 'Jadwal';
          await deleteSavedSchedule(scheduleToDelete.id);
          const newSchedules = schedules.filter(
            (s) => s.id !== scheduleToDelete.id
          );
          set({ schedules: newSchedules });
          toast.success(`Jadwal "${scheduleName}" berhasil dihapus.`);
          if (activeSchedule?.id === scheduleToDelete.id) {
            set({ activeSchedule: null });
          }
          get().loadSchedules(true); // Force reload after delete
        } catch (err) {
          console.error('Failed to delete schedule:', err);
          toast.error('Gagal menghapus jadwal.');
        } finally {
          set({
            showDeleteAlert: false,
            scheduleToDelete: null,
            isDeleting: false,
          });
        }
      },
      handlePreviewClick: (schedule) => {
        set({ activeSchedule: schedule });
      },
      closePreview: () => {
        set({ activeSchedule: null });
      },
      handleExport: (schedule) => {
        const exportData = {
          type: 'planify-schedule',
          scheduleName: schedule.schedule_name,
          data: schedule.schedule_data,
        };
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataUri =
          'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        const exportFileDefaultName = `${schedule.schedule_name}.json`;
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
      },
      handleShareClick: async (schedule) => {
        set({ isSharing: true, scheduleBeingShared: schedule.id });
        try {
          let targetSchedule = schedule;
          if (!targetSchedule.is_shared) {
            try {
              const updatedSchedule = await updateScheduleSharing(
                targetSchedule.id,
                true
              );
              set((state) => ({
                schedules: state.schedules.map((s) =>
                  s.id === targetSchedule.id ? updatedSchedule : s
                ),
              }));
              targetSchedule = updatedSchedule;
              toast.success('Jadwal sekarang publik dan bisa dibagikan.');
            } catch (err) {
              console.error('Failed to update schedule sharing:', err);
              toast.error('Gagal memperbarui status berbagi jadwal.');
              return;
            }
          }
          const url = `${window.location.origin}/share/${targetSchedule.id}`;
          set({ shareUrl: url, showShareDialog: true });
        } finally {
          set({ isSharing: false, scheduleBeingShared: null });
        }
      },
      handleImport: async (name, courses) => {
        try {
          const newSchedule = await saveSchedule(name, courses);
          set({ schedules: [newSchedule, ...get().schedules] });
          toast.success('Jadwal berhasil diimpor.');
          get().loadSchedules(true); // Force reload after import
        } catch (err) {
          console.error('Failed to import schedule:', err);
          toast.error('Gagal menyimpan jadwal yang diimpor.');
        } finally {
          set({ showImportDialog: false });
        }
      },
      clearActiveSchedule: () => {
        set({ activeSchedule: null });
      },
    }),
    {
      name: 'saved-schedules-storage', // unique name
      partialize: (state) => ({
        schedules: state.schedules.map((schedule) => ({
          schedule_name: schedule.schedule_name,
          schedule_data: schedule.schedule_data,
          is_shared: schedule.is_shared,
        })),
      }),
    }
  )
);
