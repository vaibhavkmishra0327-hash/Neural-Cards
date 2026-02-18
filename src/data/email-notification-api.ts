import { supabase } from '../utils/supabase/client';
import { log } from '../utils/logger';

export interface EmailNotificationPrefs {
  user_id: string;
  email_daily_reminder: boolean;
  email_weekly_digest: boolean;
  email_streak_alert: boolean;
  email_achievement: boolean;
  email_missed_class: boolean;
  email_reengagement: boolean;
  reminder_time: string;
}

const DEFAULT_PREFS: Omit<EmailNotificationPrefs, 'user_id'> = {
  email_daily_reminder: false,
  email_weekly_digest: false,
  email_streak_alert: false,
  email_achievement: false,
  email_missed_class: true,
  email_reengagement: true,
  reminder_time: '19:00',
};

export async function getEmailNotificationPrefs(userId: string): Promise<EmailNotificationPrefs> {
  const { data, error } = await supabase
    .from('notification_preferences')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    log.warn('Email prefs fetch error:', error.message);
    return { user_id: userId, ...DEFAULT_PREFS };
  }

  if (!data) {
    return { user_id: userId, ...DEFAULT_PREFS };
  }

  return data as EmailNotificationPrefs;
}

export async function saveEmailNotificationPrefs(prefs: EmailNotificationPrefs): Promise<boolean> {
  const { error } = await supabase.from('notification_preferences').upsert(
    {
      user_id: prefs.user_id,
      email_daily_reminder: prefs.email_daily_reminder,
      email_weekly_digest: prefs.email_weekly_digest,
      email_streak_alert: prefs.email_streak_alert,
      email_achievement: prefs.email_achievement,
      email_missed_class: prefs.email_missed_class,
      email_reengagement: prefs.email_reengagement,
      reminder_time: prefs.reminder_time,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' }
  );

  if (error) {
    log.error('Email prefs save error:', error.message);
    return false;
  }

  log.info('Email notification preferences saved');
  return true;
}
