import { createClient } from '@/lib/supabase/client';
import { Course } from '@/lib/types/course';
import { SavedSchedule } from '@/lib/types/schedule';

const supabase = createClient();

// Utility function to get the currently authenticated user
async function getCurrentUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

// Save a schedule to Supabase
export async function saveSchedule(
  scheduleName: string,
  scheduleData: Course[]
): Promise<SavedSchedule> {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated.');

    // Validate 24 SKS limit
    const totalSKS = scheduleData.reduce(
      (sum, course) => sum + course.credits,
      0
    );
    if (totalSKS > 24) {
      throw new Error(
        `Jadwal tidak dapat disimpan karena melebihi batas maksimal 24 SKS (total: ${totalSKS} SKS).`
      );
    }

    const { data, error } = await supabase
      .from('saved_schedules')
      .insert({
        schedule_name: scheduleName,
        schedule_data: scheduleData,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Failed to save schedule:', error);
    if (
      error instanceof Error &&
      error.message.includes('melebihi batas maksimal 24 SKS')
    ) {
      throw error; // Re-throw the SKS limit error with the original message
    }
    throw new Error('Gagal menyimpan jadwal. Silakan coba lagi.');
  }
}

// Get all saved schedules for the current user
export async function getSavedSchedules(): Promise<SavedSchedule[]> {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated.');

    const { data, error } = await supabase
      .from('saved_schedules')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Failed to get saved schedules:', error);
    throw new Error('Gagal mengambil jadwal tersimpan.');
  }
}

// Delete a saved schedule by its ID
export async function deleteSavedSchedule(scheduleId: string): Promise<void> {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated.');

    const { error } = await supabase
      .from('saved_schedules')
      .delete()
      .eq('id', scheduleId)
      .eq('user_id', user.id);

    if (error) throw error;
  } catch (error) {
    console.error('Failed to delete schedule:', error);
    throw new Error('Gagal menghapus jadwal.');
  }
}

export async function getSharedScheduleById(
  scheduleId: string
): Promise<SavedSchedule | null> {
  try {
    const { data, error } = await supabase
      .from('saved_schedules')
      .select('*')
      .eq('id', scheduleId)
      .eq('is_shared', true)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Failed to get schedule by ID:', error);
    return null;
  }
}

export async function updateScheduleSharing(
  scheduleId: string,
  isShared: boolean
): Promise<SavedSchedule> {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('saved_schedules')
      .update({ is_shared: isShared })
      .eq('id', scheduleId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Failed to update schedule sharing status:', error);
    throw new Error('Gagal memperbarui status berbagi jadwal.');
  }
}
