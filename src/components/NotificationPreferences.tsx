import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Bell, Clock, Shield, X, Check } from 'lucide-react';
import {
  getReminderPreferences,
  saveReminderPreferences,
  requestNotificationPermission,
  getNotificationPermission,
  scheduleReminder,
  type ReminderPreferences,
} from '../utils/studyReminder';

interface NotificationPreferencesProps {
  lastStudyDate: string | null;
  onClose: () => void;
}

export function NotificationPreferences({ lastStudyDate, onClose }: NotificationPreferencesProps) {
  const [prefs, setPrefs] = useState<ReminderPreferences>(getReminderPreferences);
  const [permission, setPermission] = useState<NotificationPermission>(getNotificationPermission);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setPermission(getNotificationPermission());
  }, []);

  function flashSaved() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
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

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden mb-6"
    >
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-base flex items-center gap-2">
            <Bell className="w-4 h-4 text-purple-600" />
            Study Reminders
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Close notification settings"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {permission === 'denied' && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-400 flex items-start gap-2">
            <Shield className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>
              Notifications are blocked by your browser. Please allow notifications in your browser
              settings for this site.
            </span>
          </div>
        )}

        {permission === 'default' && (
          <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl text-sm text-amber-700 dark:text-amber-400">
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
              className="bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg px-3 py-1.5 text-sm disabled:opacity-40 disabled:cursor-not-allowed focus:ring-2 focus:ring-purple-500 outline-none"
            />
          </div>
        </div>

        {saved && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 flex items-center gap-1 text-xs text-green-600 dark:text-green-400"
          >
            <Check className="w-3 h-3" />
            Preferences saved
          </motion.div>
        )}

        {prefs.enabled && permission === 'granted' && (
          <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl text-xs text-purple-700 dark:text-purple-300 flex items-start gap-2">
            <Bell className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
            <span>
              You&apos;ll receive a notification at{' '}
              <strong>
                {new Date(`2000-01-01T${prefs.reminderTime}`).toLocaleTimeString([], {
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </strong>{' '}
              if you haven&apos;t studied that day. Keep the app open or installed as a PWA for best
              results.
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
