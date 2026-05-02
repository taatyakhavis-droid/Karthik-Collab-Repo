import { supabase } from '../lib/supabase';

export const authService = {
  getCurrentUser: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  isAdmin: async (): Promise<boolean> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    const adminEmail = import.meta.env.VITE_ADMIN_EMAIL as string;
    return !!(adminEmail && user.email === adminEmail);
  },

  signInWithEmail: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  logout: async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  },
};
