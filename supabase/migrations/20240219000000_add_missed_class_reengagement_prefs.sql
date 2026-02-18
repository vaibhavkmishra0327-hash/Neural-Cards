-- ============================================================
-- Migration: Add missed class & re-engagement notification prefs
-- Description: Two new boolean columns for:
--   1. email_missed_class  - Alert after 3 consecutive days missed
--   2. email_reengagement  - Emotional "we miss you" email after 10-20 days
-- ============================================================

-- Add new columns (default true so existing users get these notifications)
ALTER TABLE public.notification_preferences
  ADD COLUMN IF NOT EXISTS email_missed_class   BOOLEAN DEFAULT true  NOT NULL,
  ADD COLUMN IF NOT EXISTS email_reengagement   BOOLEAN DEFAULT true  NOT NULL;
