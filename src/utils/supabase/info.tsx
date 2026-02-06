/**
 * Supabase Configuration
 * Values loaded from environment variables (.env file)
 */

import { log } from '../logger';

export const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
export const publicAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!projectId || !publicAnonKey) {
  log.error('Missing Supabase environment variables! Check your .env file.');
}
