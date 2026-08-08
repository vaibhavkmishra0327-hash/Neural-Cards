/**
 * Supabase Client Singleton
 * * This ensures only one Supabase client instance exists across the application.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './info';
// 👇 Type import (make sure the path is correct)
import { Database } from '../../types/database.types';

// 👇 Assign a type to the variable
let supabaseInstance: SupabaseClient<Database> | null = null;

/**
 * Get the singleton Supabase client instance
 */
export function getSupabaseClient(): SupabaseClient<Database> {
  if (!supabaseInstance) {
    // 👇 Pass generic type <Database> when creating the client
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
