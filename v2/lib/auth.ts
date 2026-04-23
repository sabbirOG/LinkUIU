import { supabase } from "./supabase";

export const authService = {
  /**
   * Register a new alumni/student
   */
  async signUp(email: string, password: string, fullName: string, studentId: string, userType: 'alumni' | 'student', dept: string, batch: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          student_id: studentId,
          user_type: userType,
          dept: dept,
          batch: batch
        }
      }
    });

    if (error) throw error;
    
    // Note: A database trigger should create the 'profiles' entry in Supabase,
    // but we can also do it manually here if needed.
    
    return data;
  },

  /**
   * Log into the platform
   */
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  /**
   * Log out
   */
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  /**
   * OAuth Authentication (Industry Standard)
   */
  async signInWithOAuth(provider: 'google' | 'github') {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
    if (error) throw error;
    return data;
  },

  /**
   * Get JWT Session (Industry Standard)
   */
  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  },

  /**
   * Password Reset Request
   */
  async resetPassword(email: string) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
    return data;
  }
};
