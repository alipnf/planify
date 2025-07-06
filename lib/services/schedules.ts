import { createClient } from '@/lib/supabase/client';
import { Course } from '@/lib/types/course';

const supabase = createClient();

// Utility function to get the currently authenticated user
async function getCurrentUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export interface SavedSchedule {
  id: string;
  user_id: string;
  created_at: string;
  schedule_name: string;
  schedule_data: Course[] | null;
  is_shared: boolean;
  share_id: string;
}

// Save a schedule to Supabase
export async function saveSchedule(
  scheduleName: string,
  scheduleData: Course[]
): Promise<SavedSchedule> {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated.');

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
    console.error('Error saving schedule:', error);
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
    console.error('Error fetching schedules:', error);
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
    console.error('Error deleting schedule:', error);
    throw new Error('Gagal menghapus jadwal.');
  }
}

export async function getScheduleByShareId(
  shareId: string
): Promise<SavedSchedule | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('saved_schedules')
    .select('*')
    .eq('share_id', shareId)
    .eq('is_shared', true)
    .single();

  if (error) {
    console.error('Error fetching shared schedule:', error);
    return null;
  }

  return data;
}

export async function updateScheduleSharing(
  scheduleId: string,
  isShared: boolean
): Promise<SavedSchedule> {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('saved_schedules')
    .update({ is_shared: isShared })
    .eq('id', scheduleId)
    .eq('user_id', userData.user.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating schedule sharing status:', error);
    throw new Error('Gagal memperbarui status berbagi jadwal.');
  }

  return data;
}
