import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('[Supabase] Missing URL or Key');
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    ...(Platform.OS !== 'web' && {
      storageKey: 'loops-auth-token',
    }),
  },
  global: {
    headers: {
      'X-Client-Info': `expo-${Platform.OS}`,
    },
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

export type SupabaseLoop = {
  id: string;
  user_id: string;
  title: string;
  status: string;
  energy_level: number | null;
  description: string | null;
  created_at: string;
};

export type SupabaseLoopInsert = Omit<SupabaseLoop, 'id' | 'created_at'> & {
  id?: string;
  created_at?: string;
};
