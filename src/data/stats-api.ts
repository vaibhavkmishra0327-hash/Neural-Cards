import { supabase } from '../utils/supabase/client';
import { log } from '../utils/logger';

export interface UserStats {
  user_id: string;
  cards_learned_total: number;
  daily_goal_target: number;
  daily_cards_completed: number;
  current_streak: number;
  xp: number;
  last_study_date: string | null;
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
  { timeout: ReturnType<typeof setTimeout>; count: number }
>();
const DEBOUNCE_MS = 2000; // 2 seconds

export const incrementProgress = (userId: string, cardsCount: number = 1) => {
  const existing = pendingIncrements.get(userId);

  if (existing) {
    // Accumulate count and reset timer
    clearTimeout(existing.timeout);
    existing.count += cardsCount;
  } else {
    pendingIncrements.set(userId, { timeout: setTimeout(() => {}, 0), count: cardsCount });
  }

  const entry = pendingIncrements.get(userId)!;
  entry.timeout = setTimeout(() => {
    const totalCount = entry.count;
    pendingIncrements.delete(userId);
    flushIncrement(userId, totalCount);
  }, DEBOUNCE_MS);
};

async function flushIncrement(userId: string, cardsCount: number) {
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

  const updateData = {
    cards_learned_total: (currentStats.cards_learned_total || 0) + cardsCount,
    daily_cards_completed: newDailyCount + cardsCount,
    current_streak: newStreak,
    last_study_date: new Date().toISOString(),
    xp: (currentStats.xp || 0) + cardsCount * 10,
  };

  const { error } = await supabase.from('user_stats').update(updateData).eq('user_id', userId);

  if (error) {
    log.error('Stats update failed:', error);
  } else {
    log.info('Stats updated successfully');
  }
}
