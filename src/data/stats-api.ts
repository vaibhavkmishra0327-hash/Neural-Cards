import { supabase } from '../utils/supabase/client';
import { log } from '../utils/logger';

// ── Weekly Activity Types ─────────────────────────────────
export interface DayActivity {
  date: string;
  dayLabel: string;
  sessionCount: number;
  isToday: boolean;
}

export interface UserStats {
  user_id: string;
  cards_learned_total: number;
  daily_goal_target: number;
  daily_cards_completed: number;
  current_streak: number;
  xp: number;
  last_study_date: string | null;
  last_topic_slug: string | null;
}

// Helper: Stats create karne ke liye
const createInitialStats = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_stats')
    .insert([
      {
        user_id: userId,
        last_study_date: new Date().toISOString(),
        cards_learned_total: 0,
        current_streak: 0,
        daily_cards_completed: 0,
        daily_goal_target: 20,
        xp: 0,
      },
    ])
    .select()
    .single();

  if (error) log.error('Error creating stats:', error);
  return data;
};

export const getUserStats = async (userId: string): Promise<UserStats | null> => {
  const { data, error } = await supabase
    .from('user_stats')
    .select('*')
    .eq('user_id', userId)
    .single();

  // Agar row nahi mili, toh nayi banao
  if (error && error.code === 'PGRST116') {
    return await createInitialStats(userId);
  }

  if (error) {
    log.error('Stats fetch error:', error);
    return null;
  }

  // Streak Logic Check
  if (data) {
    const lastDate = data.last_study_date ? new Date(data.last_study_date).toDateString() : null;
    const today = new Date().toDateString();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    // Agar kal nahi padha tha aur aaj bhi nahi -> Reset streak
    if (lastDate !== today && lastDate !== yesterdayStr && lastDate !== null) {
      // Database mein update karo
      await supabase
        .from('user_stats')
        .update({ current_streak: 0, daily_cards_completed: 0 })
        .eq('user_id', userId);
      // UI ke liye return karo
      return { ...data, current_streak: 0, daily_cards_completed: 0 };
    }

    // Agar naya din hai par streak zinda hai (kal padha tha), to sirf daily count 0 dikhao
    if (lastDate === yesterdayStr) {
      return { ...data, daily_cards_completed: 0 };
    }
  }

  return data;
};

// Debounce map: userId -> { timeout, pendingCount }
const pendingIncrements = new Map<
  string,
  { timeout: ReturnType<typeof setTimeout>; count: number; topicSlug?: string }
>();
const DEBOUNCE_MS = 2000; // 2 seconds

export const incrementProgress = (userId: string, cardsCount: number = 1, topicSlug?: string) => {
  const existing = pendingIncrements.get(userId);

  if (existing) {
    // Accumulate count and reset timer
    clearTimeout(existing.timeout);
    existing.count += cardsCount;
    if (topicSlug) existing.topicSlug = topicSlug;
  } else {
    pendingIncrements.set(userId, {
      timeout: setTimeout(() => {}, 0),
      count: cardsCount,
      topicSlug,
    });
  }

  const entry = pendingIncrements.get(userId)!;
  entry.timeout = setTimeout(() => {
    const totalCount = entry.count;
    const lastSlug = entry.topicSlug;
    pendingIncrements.delete(userId);
    flushIncrement(userId, totalCount, lastSlug);
  }, DEBOUNCE_MS);
};

async function flushIncrement(userId: string, cardsCount: number, topicSlug?: string) {
  log.info(`Flushing progress increment for ${userId}: +${cardsCount} cards`);

  let { data: currentStats } = await supabase
    .from('user_stats')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (!currentStats) {
    log.warn('No stats found, creating new entry...');
    currentStats = await createInitialStats(userId);
    if (!currentStats) return;
  }

  const today = new Date().toDateString();
  const lastDate = currentStats.last_study_date
    ? new Date(currentStats.last_study_date).toDateString()
    : '';

  let newStreak = currentStats.current_streak || 0;
  let newDailyCount = currentStats.daily_cards_completed || 0;

  if (lastDate !== today) {
    newDailyCount = 0;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (lastDate === yesterday.toDateString()) {
      newStreak += 1;
    } else {
      newStreak = 1;
    }
  }

  const updateData: Record<string, unknown> = {
    cards_learned_total: (currentStats.cards_learned_total || 0) + cardsCount,
    daily_cards_completed: newDailyCount + cardsCount,
    current_streak: newStreak,
    last_study_date: new Date().toISOString(),
    xp: (currentStats.xp || 0) + cardsCount * 10,
  };

  // Save which topic the user last studied
  if (topicSlug) {
    updateData.last_topic_slug = topicSlug;
  }

  const { error } = await supabase.from('user_stats').update(updateData).eq('user_id', userId);

  if (error) {
    log.error('Stats update failed:', error);
  } else {
    log.info('Stats updated successfully');
  }

  // Record study session for activity tracking
  const todayDate = new Date().toISOString().split('T')[0];
  if (lastDate !== today) {
    supabase
      .from('study_sessions')
      .insert({ user_id: userId, studied_on: todayDate })
      .then(({ error: sessErr }) => {
        if (sessErr) log.warn('Study session insert skipped:', sessErr.message);
      });
  }
}

// ── Extended Stats Functions ──────────────────────────────

export const getWeeklyActivity = async (userId: string): Promise<DayActivity[]> => {
  const days: DayActivity[] = [];
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    days.push({
      date: dateStr,
      dayLabel: d.toLocaleDateString('en', { weekday: 'short' }),
      sessionCount: 0,
      isToday: dateStr === todayStr,
    });
  }

  const { data, error } = await supabase
    .from('study_sessions')
    .select('studied_on')
    .eq('user_id', userId)
    .gte('studied_on', days[0].date);

  if (error) {
    log.warn('Weekly activity fetch error:', error.message);
  }

  if (data) {
    for (const session of data) {
      const day = days.find((d) => d.date === session.studied_on);
      if (day) day.sessionCount += 1;
    }
  }

  // Fallback: if no sessions found but user_stats shows study today, mark today
  if (data?.length === 0) {
    const { data: statsData } = await supabase
      .from('user_stats')
      .select('last_study_date')
      .eq('user_id', userId)
      .single();

    if (statsData?.last_study_date) {
      const lastDate = new Date(statsData.last_study_date).toISOString().split('T')[0];
      const matchDay = days.find((d) => d.date === lastDate);
      if (matchDay) matchDay.sessionCount = 1;
    }
  }

  return days;
};

export const getCardsForReview = async (userId: string): Promise<number> => {
  const { count, error } = await supabase
    .from('user_progress')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .lte('next_review_at', new Date().toISOString())
    .eq('is_mastered', false);

  if (error) {
    log.warn('Cards for review fetch error:', error.message);
    return 0;
  }
  return count || 0;
};

export const getTotalStudyDays = async (userId: string): Promise<number> => {
  const { data, error } = await supabase
    .from('study_sessions')
    .select('studied_on')
    .eq('user_id', userId);

  if (error) {
    log.warn('Total study days fetch error:', error.message);
  }

  if (data && data.length > 0) {
    const uniqueDays = new Set(data.map((s) => s.studied_on));
    return uniqueDays.size;
  }

  // Fallback: check if user has any stats at all (at least 1 day)
  const { data: statsData } = await supabase
    .from('user_stats')
    .select('last_study_date, cards_learned_total')
    .eq('user_id', userId)
    .single();

  if (statsData?.last_study_date && statsData.cards_learned_total > 0) {
    return 1; // At minimum they studied once
  }

  return 0;
};
