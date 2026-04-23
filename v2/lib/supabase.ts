import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * ELITE SAFE CLIENT INITIALIZATION
 * -------------------------------
 * This prevents the app from crashing at runtime if environment variables
 * are missing. It allows the project to run in 'Local-First' mode.
 */

let supabaseClient: SupabaseClient;

if (!supabaseUrl || !supabaseAnonKey) {
  if (typeof window !== 'undefined') {
    console.warn("⚠️ SUPABASE CONFIG MISSING: Platform running in LOCAL-FIRST mode.");
  }
  
  const missingKeyError = (method: string) => {
    return { error: { message: `Supabase Error: ${method} called but NEXT_PUBLIC_SUPABASE_URL is missing. Check your .env.local file.` }, data: null };
  };

  supabaseClient = new Proxy({} as SupabaseClient, {
    get: (_, prop) => {
      if (prop === 'auth') return { 
        getSession: async () => ({ data: { session: null }, error: null }),
        getUser: async () => ({ data: { user: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        signInWithPassword: async () => missingKeyError('signInWithPassword'),
        signUp: async () => missingKeyError('signUp'),
        signOut: async () => ({ error: null }),
        resetPasswordForEmail: async () => missingKeyError('resetPasswordForEmail'),
      };
      
      const dbHandler = {
        select: () => dbHandler,
        insert: () => dbHandler,
        update: () => dbHandler,
        delete: () => dbHandler,
        eq: () => dbHandler,
        order: () => dbHandler,
        limit: () => dbHandler,
        single: () => dbHandler,
        maybeSingle: () => dbHandler,
        then: (onfulfilled: any) => onfulfilled(missingKeyError('database operation')),
      };

      return () => dbHandler;
    }
  });
} else {
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
}

export const supabase = supabaseClient;

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]
