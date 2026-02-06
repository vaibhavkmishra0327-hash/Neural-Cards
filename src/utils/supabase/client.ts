/**
 * Supabase Client Singleton
 * * This ensures only one Supabase client instance exists across the application.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './info';
// 👇 Type Import (Make sure path is correct)
import { Database } from '../../types/database.types';

// 👇 Variable ko Type assign kiya
let supabaseInstance: SupabaseClient<Database> | null = null;

/**
 * Get the singleton Supabase client instance
 */
export function getSupabaseClient(): SupabaseClient<Database> {
  if (!supabaseInstance) {
    // 👇 Create Client karte waqt Generic Type <Database> pass kiya
    supabaseInstance = createClient<Database>(`https://${projectId}.supabase.co`, publicAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      },
    });
  }

  return supabaseInstance;
}

/**
 * Reset the Supabase client instance
 */
export function resetSupabaseClient(): void {
  supabaseInstance = null;
}

// Export a default instance for convenience
export const supabase = getSupabaseClient();

export default supabase;
