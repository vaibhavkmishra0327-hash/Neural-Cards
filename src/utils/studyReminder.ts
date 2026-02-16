import { log } from './logger';

const PREFS_KEY = 'neuralcards-reminder-prefs';

export interface ReminderPreferences {
  enabled: boolean;
  reminderTime: string;
  lastNotifiedDate: string | null;
}

const DEFAULT_PREFS: ReminderPreferences = {
  enabled: false,
  reminderTime: '19:00',
  lastNotifiedDate: null,
};

export function getReminderPreferences(): ReminderPreferences {
  try {
    const stored = localStorage.getItem(PREFS_KEY);
    if (stored) return { ...DEFAULT_PREFS, ...JSON.parse(stored) };
  } catch {
    // ignore parse errors
  }
  return { ...DEFAULT_PREFS };
}

export function saveReminderPreferences(prefs: ReminderPreferences): void {
  localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) return 'denied';
  if (Notification.permission === 'granted') return 'granted';
  if (Notification.permission === 'denied') return 'denied';
  return await Notification.requestPermission();
}

export function getNotificationPermission(): NotificationPermission {
  if (!('Notification' in window)) return 'denied';
  return Notification.permission;
}

function hasStudiedToday(lastStudyDate: string | null): boolean {
  if (!lastStudyDate) return false;
  return new Date().toDateString() === new Date(lastStudyDate).toDateString();
}

const REMINDER_MESSAGES = [
  {
    title: '📚 Time to Study!',
    body: 'Your streak is waiting. Just 5 minutes of flashcards makes a difference!',
  },
  {
    title: '🔥 Keep Your Streak Alive!',
    body: "Don't break your learning streak. Open NeuralCards and review a few cards.",
  },
  {
    title: '🧠 Brain Training Time!',
    body: 'Spaced repetition works best with daily practice. Start now!',
  },
  { title: '⚡ Quick Review?', body: 'A short study session now will reinforce what you learned.' },
];

async function showStudyNotification(): Promise<void> {
  const msg = REMINDER_MESSAGES[Math.floor(Math.random() * REMINDER_MESSAGES.length)];

  try {
    const registration = await navigator.serviceWorker?.ready;
    if (registration) {
      await registration.showNotification(msg.title, {
        body: msg.body,
        icon: '/icons/icon-192x192.svg',
        badge: '/icons/icon-72x72.svg',
        data: { url: '/dashboard' },
      } as NotificationOptions);
      return;
    }
  } catch {
    // SW not available, fallback below
  }

  new Notification(msg.title, {
    body: msg.body,
    icon: '/icons/icon-192x192.svg',
  });
}

let reminderTimeout: ReturnType<typeof setTimeout> | null = null;

export function scheduleReminder(lastStudyDate: string | null): void {
  clearScheduledReminder();

  const prefs = getReminderPreferences();
  if (!prefs.enabled) return;
  if (getNotificationPermission() !== 'granted') return;

  const today = new Date().toISOString().split('T')[0];
  if (prefs.lastNotifiedDate === today) return;
  if (hasStudiedToday(lastStudyDate)) return;

  const [hours, minutes] = prefs.reminderTime.split(':').map(Number);
  const now = new Date();
  const reminderDate = new Date();
  reminderDate.setHours(hours, minutes, 0, 0);

  const delay = reminderDate.getTime() - now.getTime();

  if (delay <= 0) {
    showStudyNotification();
    saveReminderPreferences({ ...prefs, lastNotifiedDate: today });
    log.info('Study reminder sent (past scheduled time)');
  } else {
    reminderTimeout = setTimeout(() => {
      const currentPrefs = getReminderPreferences();
      if (!currentPrefs.enabled) return;
      showStudyNotification();
      saveReminderPreferences({ ...currentPrefs, lastNotifiedDate: today });
      log.info('Study reminder sent (on schedule)');
    }, delay);
    log.info(`Study reminder scheduled in ${Math.round(delay / 60000)} minutes`);
  }
}

export function clearScheduledReminder(): void {
  if (reminderTimeout) {
    clearTimeout(reminderTimeout);
    reminderTimeout = null;
  }
}
