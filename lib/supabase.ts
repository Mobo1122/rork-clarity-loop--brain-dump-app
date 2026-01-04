import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export type Tables = {
  loops: {
    id: string;
    user_id: string;
    title: string;
    description: string | null;
    notes: string | null;
    first_step: string | null;
    difficulty: string;
    category: string;
    loop_type: string;
    priority: string;
    is_quick_win: boolean;
    estimated_minutes: number | null;
    status: string;
    due_date: string | null;
    window_start_date: string | null;
    window_end_date: string | null;
    tags: string[];
    is_pinned: boolean;
    snoozed_until: string | null;
    created_at: string;
    closed_at: string | null;
    archived_at: string | null;
    completion_rating: number | null;
  };
  brain_dumps: {
    id: string;
    user_id: string;
    raw_content: string;
    created_at: string;
    loops_extracted: number;
  };
  user_streaks: {
    id: string;
    user_id: string;
    current_count: number;
    longest_count: number;
    started_at: string | null;
    last_closed_at: string | null;
    total_loops_closed: number;
  };
  user_preferences: {
    id: string;
    user_id: string;
    notifications_enabled: boolean;
    notification_time: string;
    sound_effects: boolean;
    confetti_enabled: boolean;
    theme: string;
  };
};
