import { supabase } from "./supabase";

/**
 * ELITE STORAGE UTILITY
 * Handles profile photo uploads with minimal footprint
 */
export const storageService = {
  async uploadProfilePhoto(userId: string, file: File) {
    try {
      // 1. Fixed path (UserId/profile.jpg)
      // This ensures we always OVERWRITE the old one to save space
      const filePath = `${userId}/profile.jpg`;

      // 2. Upload to the 'profiles' bucket (upsert: true handles the overwrite)
      const { data, error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file, {
          cacheControl: '0', // No cache so it updates immediately
          upsert: true
        });

      if (uploadError) throw uploadError;

      // 3. Get the Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error: any) {
      console.error("Storage Error:", error.message);
      throw error;
    }
  }
};
