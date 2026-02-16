-- ============================================================
-- Migration: Create study_sessions table with RLS policies
-- Description: Tracks daily study activity per user for
--              weekly activity charts and streak calculations.
-- ============================================================

-- 1. Create the table
CREATE TABLE IF NOT EXISTS public.study_sessions (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  studied_on DATE        NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 2. Add a unique constraint so each user gets at most one row per day
--    (the app inserts once per new study day via stats-api.ts)
ALTER TABLE public.study_sessions
  ADD CONSTRAINT study_sessions_user_date_unique UNIQUE (user_id, studied_on);

-- 3. Create index for date-range queries (the unique constraint already covers user_id lookups)
CREATE INDEX IF NOT EXISTS idx_study_sessions_user_studied_on
  ON public.study_sessions(user_id, studied_on DESC);

-- 4. Enable Row Level Security
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies

-- Users can read only their own study sessions
CREATE POLICY "Users can view own study sessions"
  ON public.study_sessions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert only their own study sessions
CREATE POLICY "Users can insert own study sessions"
  ON public.study_sessions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update only their own study sessions (if needed)
CREATE POLICY "Users can update own study sessions"
  ON public.study_sessions
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete only their own study sessions
CREATE POLICY "Users can delete own study sessions"
  ON public.study_sessions
  FOR DELETE
  USING (auth.uid() = user_id);

-- 6. Grant access to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.study_sessions TO authenticated;

-- 7. Allow the service_role full access (used by Edge Functions)
GRANT ALL ON public.study_sessions TO service_role;
