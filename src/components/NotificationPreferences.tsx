import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Bell,
  Clock,
  Shield,
  X,
  Check,
  Mail,
  Calendar,
  Flame,
  Trophy,
  Loader2,
  AlertTriangle,
  Heart,
} from 'lucide-react';
import {
  getReminderPreferences,
  saveReminderPreferences,
  requestNotificationPermission,
  getNotificationPermission,
  scheduleReminder,
  type ReminderPreferences,
} from '../utils/studyReminder';
import {
  getEmailNotificationPrefs,
  saveEmailNotificationPrefs,
  type EmailNotificationPrefs,
} from '../data/email-notification-api';

interface NotificationPreferencesProps {
  lastStudyDate: string | null;
  onClose: () => void;
  userId: string;
  userEmail: string;
}

export function NotificationPreferences({
  lastStudyDate,
  onClose,
  userId,
  userEmail,
}: NotificationPreferencesProps) {
  const [prefs, setPrefs] = useState<ReminderPreferences>(getReminderPreferences);
  const [permission, setPermission] = useState<NotificationPermission>(getNotificationPermission);
  const [saved, setSaved] = useState(false);

  // Email notification state
  const [emailPrefs, setEmailPrefs] = useState<EmailNotificationPrefs>({
    user_id: userId,
    email_daily_reminder: false,
    email_weekly_digest: false,
    email_streak_alert: false,
    email_achievement: false,
    email_missed_class: true,
    email_reengagement: true,
    reminder_time: '19:00',
  });
  const [emailLoading, setEmailLoading] = useState(true);
  const [emailSaving, setEmailSaving] = useState(false);
  const [emailSaved, setEmailSaved] = useState(false);

  // Load email notification preferences
  useEffect(() => {
    let cancelled = false;
    getEmailNotificationPrefs(userId).then((data) => {
      if (!cancelled) {
        setEmailPrefs(data);
        setEmailLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  function flashSaved() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function flashEmailSaved() {
    setEmailSaved(true);
    setTimeout(() => setEmailSaved(false), 2000);
  }

  const handleToggle = useCallback(async () => {
    const newEnabled = !prefs.enabled;

    if (newEnabled && permission !== 'granted') {
      const result = await requestNotificationPermission();
      setPermission(result);
      if (result !== 'granted') return;
    }

    const updated = { ...prefs, enabled: newEnabled };
    setPrefs(updated);
    saveReminderPreferences(updated);
    scheduleReminder(lastStudyDate);
    flashSaved();
  }, [prefs, permission, lastStudyDate]);

  const handleTimeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const updated = { ...prefs, reminderTime: e.target.value, lastNotifiedDate: null };
      setPrefs(updated);
      saveReminderPreferences(updated);
      scheduleReminder(lastStudyDate);
      flashSaved();
    },
    [prefs, lastStudyDate]
  );

  const handleRequestPermission = useCallback(async () => {
    const result = await requestNotificationPermission();
    setPermission(result);
  }, []);

  // Email preference toggle handler
  const handleEmailToggle = useCallback(
    async (field: keyof Omit<EmailNotificationPrefs, 'user_id' | 'reminder_time'>) => {
      const updated = { ...emailPrefs, [field]: !emailPrefs[field] };
      setEmailPrefs(updated);
      setEmailSaving(true);
      const success = await saveEmailNotificationPrefs(updated);
      setEmailSaving(false);
      if (success) flashEmailSaved();
    },
    [emailPrefs]
  );

  const handleEmailTimeChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const updated = { ...emailPrefs, reminder_time: e.target.value };
      setEmailPrefs(updated);
      setEmailSaving(true);
      const success = await saveEmailNotificationPrefs(updated);
      setEmailSaving(false);
      if (success) flashEmailSaved();
    },
    [emailPrefs]
  );

  const emailOptions = [
    {
      key: 'email_daily_reminder' as const,
      label: 'Daily Study Reminder',
      description: "Get an email if you haven't studied today",
      icon: <Calendar className="w-4 h-4" />,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-100 dark:bg-blue-500/10',
    },
    {
      key: 'email_weekly_digest' as const,
      label: 'Weekly Progress Digest',
      description: 'Receive a summary of your weekly activity',
      icon: <Mail className="w-4 h-4" />,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-100 dark:bg-emerald-500/10',
    },
    {
      key: 'email_streak_alert' as const,
      label: 'Streak at Risk',
      description: 'Alert when your streak is about to break',
      icon: <Flame className="w-4 h-4" />,
      color: 'text-orange-600 dark:text-orange-400',
      bg: 'bg-orange-100 dark:bg-orange-500/10',
    },
    {
      key: 'email_achievement' as const,
      label: 'Achievement Unlocked',
      description: 'Celebrate when you earn new achievements',
      icon: <Trophy className="w-4 h-4" />,
      color: 'text-yellow-600 dark:text-yellow-400',
      bg: 'bg-yellow-100 dark:bg-yellow-500/10',
    },
    {
      key: 'email_missed_class' as const,
      label: '3-Day Missed Alert',
      description: 'Get notified if you miss studying for 3 days in a row',
      icon: <AlertTriangle className="w-4 h-4" />,
      color: 'text-red-600 dark:text-red-400',
      bg: 'bg-red-100 dark:bg-red-500/10',
    },
    {
      key: 'email_reengagement' as const,
      label: 'We Miss You',
      description: 'Receive a heartfelt reminder after 10+ days away',
      icon: <Heart className="w-4 h-4" />,
      color: 'text-pink-600 dark:text-pink-400',
      bg: 'bg-pink-100 dark:bg-pink-500/10',
    },
  ];

  const anyEmailEnabled = emailOptions.some((opt) => emailPrefs[opt.key]);

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden mb-6"
    >
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base flex items-center gap-2">
            <Bell className="w-4 h-4 text-purple-600" />
            Notification Settings
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Close notification settings"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* ── Push Notifications Section ────────────────────── */}
        <div>
          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
            <Bell className="w-3.5 h-3.5" />
            Push Notifications
          </h4>

          {permission === 'denied' && (
            <div className="mb-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-400 flex items-start gap-2">
              <Shield className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>
                Notifications are blocked by your browser. Please allow notifications in your
                browser settings for this site.
              </span>
            </div>
          )}

          {permission === 'default' && (
            <div className="mb-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl text-sm text-amber-700 dark:text-amber-400">
              <button
                onClick={handleRequestPermission}
                className="font-medium underline hover:no-underline"
              >
                Click here to allow notifications
              </button>{' '}
              so we can remind you to study.
            </div>
          )}

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={handleToggle}
                className={`relative w-12 h-7 rounded-full transition-colors duration-200 ${
                  prefs.enabled ? 'bg-purple-600' : 'bg-gray-300 dark:bg-zinc-700'
                }`}
                aria-label={prefs.enabled ? 'Disable reminders' : 'Enable reminders'}
              >
                <motion.div
                  className="absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-sm"
                  animate={{ left: prefs.enabled ? '22px' : '2px' }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              </button>
              <div>
                <p className="text-sm font-medium">
                  {prefs.enabled ? 'Reminders On' : 'Reminders Off'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {prefs.enabled
                    ? "We'll nudge you if you haven't studied"
                    : 'Enable to get daily study reminders'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <input
                type="time"
                value={prefs.reminderTime}
                onChange={handleTimeChange}
                disabled={!prefs.enabled}
                title="Study reminder time"
                className="bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg px-3 py-1.5 text-sm disabled:opacity-40 disabled:cursor-not-allowed focus:ring-2 focus:ring-purple-500 outline-none"
              />
            </div>
          </div>

          {saved && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 flex items-center gap-1 text-xs text-green-600 dark:text-green-400"
            >
              <Check className="w-3 h-3" />
              Preferences saved
            </motion.div>
          )}

          {prefs.enabled && permission === 'granted' && (
            <div className="mt-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl text-xs text-purple-700 dark:text-purple-300 flex items-start gap-2">
              <Bell className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
              <span>
                You&apos;ll receive a notification at{' '}
                <strong>
                  {new Date(`2000-01-01T${prefs.reminderTime}`).toLocaleTimeString([], {
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </strong>{' '}
                if you haven&apos;t studied that day. Keep the app open or installed as a PWA for
                best results.
              </span>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 dark:border-zinc-800" />

        {/* ── Email Notifications Section ───────────────────── */}
        <div>
          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-2">
            <Mail className="w-3.5 h-3.5" />
            Email Notifications
          </h4>
          <p className="text-xs text-muted-foreground mb-4">
            Sent to <span className="font-medium text-foreground">{userEmail}</span>
          </p>

          {emailLoading ? (
            <div className="flex items-center justify-center py-6 gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading preferences…
            </div>
          ) : (
            <div className="space-y-3">
              {emailOptions.map((opt) => (
                <div
                  key={opt.key}
                  className="flex items-center justify-between gap-4 p-3 bg-gray-50 dark:bg-zinc-800/50 rounded-xl transition-colors hover:bg-gray-100 dark:hover:bg-zinc-800"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`p-2 rounded-lg ${opt.bg}`}>
                      <span className={opt.color}>{opt.icon}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{opt.label}</p>
                      <p className="text-xs text-muted-foreground truncate">{opt.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleEmailToggle(opt.key)}
                    disabled={emailSaving}
                    className={`relative flex-shrink-0 w-12 h-7 rounded-full transition-colors duration-200 disabled:opacity-60 ${
                      emailPrefs[opt.key] ? 'bg-purple-600' : 'bg-gray-300 dark:bg-zinc-700'
                    }`}
                    aria-label={`${emailPrefs[opt.key] ? 'Disable' : 'Enable'} ${opt.label}`}
                  >
                    <motion.div
                      className="absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-sm"
                      animate={{ left: emailPrefs[opt.key] ? '22px' : '2px' }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  </button>
                </div>
              ))}

              {/* Email reminder time (shown when daily reminder is on) */}
              {emailPrefs.email_daily_reminder && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center justify-between gap-4 px-3 py-2"
                >
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>Email reminder time</span>
                  </div>
                  <input
                    type="time"
                    value={emailPrefs.reminder_time}
                    onChange={handleEmailTimeChange}
                    disabled={emailSaving}
                    title="Email reminder time"
                    className="bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg px-3 py-1.5 text-sm disabled:opacity-40 disabled:cursor-not-allowed focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </motion.div>
              )}

              {/* Save confirmation */}
              {emailSaved && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 px-1"
                >
                  <Check className="w-3 h-3" />
                  Email preferences saved
                </motion.div>
              )}

              {/* Info box when any email is enabled */}
              {anyEmailEnabled && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-xs text-blue-700 dark:text-blue-300 flex items-start gap-2">
                  <Mail className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                  <span>
                    Email notifications will be sent to <strong>{userEmail}</strong>. You can
                    unsubscribe anytime from here or via the link in any email.
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
