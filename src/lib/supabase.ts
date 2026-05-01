import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://drzsclwnidfxjirwpcbz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRyenNjbHduaWRmeGppcndwY2J6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwMDEwODAsImV4cCI6MjA5MTU3NzA4MH0.FZS2D1hcfALEaYwkT2ZM1JB3B8gp05IUoNPmJqlG-20';

// Failsafe: Prevent crash if keys are missing
const isConfigured = supabaseUrl !== 'https://your-project-url.supabase.co' && supabaseAnonKey !== 'your-anon-key-here';

if (!isConfigured) {
  console.warn('⚠️ SUPABASE NOT CONFIGURED: Please add your keys in src/lib/supabase.ts');
}

export const supabase = isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : ({
    auth: {
      getUser: async () => ({ data: { user: null } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } }),
      signInWithOAuth: async () => ({ data: {}, error: null }),
      signInWithPassword: async () => ({ data: {}, error: null }),
      signUp: async () => ({ data: {}, error: null }),
      signOut: async () => { }
    }
  } as any);
