import { createClient } from '@supabase/supabase-js';

const meta = import.meta as any;
const supabaseUrl = meta.env?.VITE_SUPABASE_URL || 'https://znkfcnquramfddcqwwoi.supabase.co';
const supabaseAnonKey = meta.env?.VITE_SUPABASE_ANON_KEY || 'sb_publishable_3ibiP0714sixKnsZ0Rcf-g_usJLSzaA';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// Lazy or safe initialization to avoid crashing on start
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    })
  : null;
