-- ============================================================
-- Migration: Create notification_preferences table with RLS
-- Description: Stores per-user email notification preferences
--              for daily reminders, weekly digests, streak
--              alerts, and achievement notifications.
-- ============================================================

-- 1. Create the table
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  user_id       UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email_daily_reminder  BOOLEAN     DEFAULT false NOT NULL,
  email_weekly_digest   BOOLEAN     DEFAULT false NOT NULL,
  email_streak_alert    BOOLEAN     DEFAULT false NOT NULL,
  email_achievement     BOOLEAN     DEFAULT false NOT NULL,
  reminder_time         TEXT        DEFAULT '19:00' NOT NULL,
  updated_at            TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 2. Enable Row Level Security
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies

CREATE POLICY "Users can view own notification preferences"
  ON public.notification_preferences
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notification preferences"
  ON public.notification_preferences
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notification preferences"
  ON public.notification_preferences
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own notification preferences"
  ON public.notification_preferences
  FOR DELETE
  USING (auth.uid() = user_id);

-- 4. Grant access to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notification_preferences TO authenticated;

-- 5. Allow the service_role full access (used by Edge Functions)
GRANT ALL ON public.notification_preferences TO service_role;
