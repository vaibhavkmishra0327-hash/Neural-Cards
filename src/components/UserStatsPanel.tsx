import { useEffect, useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  Calendar,
  Award,
  RefreshCw,
  Star,
  Zap,
  Clock,
  TrendingUp,
  CheckCircle,
  Lock,
} from 'lucide-react';
import type { UserStats, DayActivity } from '../data/stats-api';
import { getWeeklyActivity, getCardsForReview, getTotalStudyDays } from '../data/stats-api';
import { achievements } from '../data/achievements';
import type { Achievement } from '../types';

interface UserStatsPanelProps {
  userId: string;
  stats: UserStats | null;
}

export function UserStatsPanel({ userId, stats }: UserStatsPanelProps) {
  const [weeklyData, setWeeklyData] = useState<DayActivity[]>([]);
  const [cardsForReview, setCardsForReview] = useState(0);
  const [totalStudyDays, setTotalStudyDays] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadExtendedStats = useCallback(async () => {
    setLoading(true);
    const [weekly, reviewCount, studyDays] = await Promise.all([
      getWeeklyActivity(userId),
      getCardsForReview(userId),
      getTotalStudyDays(userId),
    ]);
    setWeeklyData(weekly);
    setCardsForReview(reviewCount);
    setTotalStudyDays(studyDays);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    loadExtendedStats(); // eslint-disable-line react-hooks/set-state-in-effect
  }, [loadExtendedStats]);

  const maxSessions = useMemo(
    () => Math.max(1, ...weeklyData.map((d) => d.sessionCount)),
    [weeklyData]
  );

  const activeDaysThisWeek = useMemo(
    () => weeklyData.filter((d) => d.sessionCount > 0).length,
    [weeklyData]
  );

  const avgDailyXP = useMemo(() => {
    if (!stats || totalStudyDays === 0) return 0;
    return Math.round(stats.xp / totalStudyDays);
  }, [stats, totalStudyDays]);

  const earnedAchievements = useMemo(() => {
    if (!stats) return [];
    return achievements.filter((a) => {
      if (a.type === 'streak') return stats.current_streak >= a.requirement;
      if (a.type === 'cards_reviewed') return stats.cards_learned_total >= a.requirement;
      return false;
    });
  }, [stats]);

  const nextAchievement = useMemo((): (Achievement & { progress: number }) | null => {
    if (!stats) return null;
    const unearned = achievements.filter((a) => {
      if (a.type === 'streak') return stats.current_streak < a.requirement;
      if (a.type === 'cards_reviewed') return stats.cards_learned_total < a.requirement;
      return true;
    });
    if (unearned.length === 0) return null;

    const next = unearned[0];
    let progress = 0;
    if (next.type === 'streak') progress = (stats.current_streak / next.requirement) * 100;
    if (next.type === 'cards_reviewed')
      progress = (stats.cards_learned_total / next.requirement) * 100;
    return { ...next, progress: Math.min(progress, 99) };
  }, [stats]);

  if (loading) {
    return (
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 className="w-5 h-5 text-purple-500" />
          <h2 className="text-xl sm:text-2xl font-bold">Your Statistics</h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-5 animate-pulse"
            >
              <div className="h-8 bg-gray-200 dark:bg-zinc-800 rounded w-16 mb-2" />
              <div className="h-4 bg-gray-100 dark:bg-zinc-800 rounded w-24" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
          <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500" />
          Your Statistics
        </h2>
        <button
          onClick={loadExtendedStats}
          className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
          aria-label="Refresh statistics"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      {/* Weekly Activity Chart */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-5 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Weekly Activity
          </h3>
          <span className="text-xs font-medium px-2 py-1 bg-purple-100 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-full">
            {activeDaysThisWeek}/7 active days
          </span>
        </div>

        <div className="flex items-end justify-between gap-2 h-32 px-2">
          {weeklyData.map((day, i) => {
            const heightPercent =
              day.sessionCount > 0 ? Math.max(15, (day.sessionCount / maxSessions) * 100) : 4;
            const isActive = day.sessionCount > 0;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                <span className="text-[10px] text-muted-foreground font-medium">
                  {day.sessionCount > 0 ? day.sessionCount : ''}
                </span>
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${heightPercent}%` }}
                  transition={{ delay: i * 0.05, duration: 0.5, ease: 'easeOut' }}
                  className={`w-full max-w-[40px] rounded-t-lg transition-colors ${
                    isActive
                      ? day.isToday
                        ? 'bg-gradient-to-t from-purple-600 to-pink-500'
                        : 'bg-gradient-to-t from-purple-500/70 to-purple-400/70'
                      : 'bg-gray-100 dark:bg-zinc-800'
                  }`}
                />
                <span
                  className={`text-[10px] font-semibold ${
                    day.isToday ? 'text-purple-600 dark:text-purple-400' : 'text-muted-foreground'
                  }`}
                >
                  {day.dayLabel}
                </span>
              </div>
            );
          })}
        </div>

        {activeDaysThisWeek === 0 && (
          <p className="text-center text-xs text-muted-foreground mt-3">
            Start studying to see your activity chart build up!
          </p>
        )}
      </div>

      {/* Performance Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <motion.div
          whileHover={{ y: -3 }}
          className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-4 rounded-2xl shadow-sm"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-green-100 dark:bg-green-500/10 rounded-lg">
              <Calendar className="w-4 h-4 text-green-600 dark:text-green-500" />
            </div>
          </div>
          <h4 className="text-xl font-bold">{totalStudyDays}</h4>
          <p className="text-[10px] font-bold text-green-600 dark:text-green-500 uppercase tracking-wider">
            Total Study Days
          </p>
        </motion.div>

        <motion.div
          whileHover={{ y: -3 }}
          className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-4 rounded-2xl shadow-sm"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-amber-100 dark:bg-amber-500/10 rounded-lg">
              <RefreshCw className="w-4 h-4 text-amber-600 dark:text-amber-500" />
            </div>
          </div>
          <h4 className="text-xl font-bold">{cardsForReview}</h4>
          <p className="text-[10px] font-bold text-amber-600 dark:text-amber-500 uppercase tracking-wider">
            Cards Due Review
          </p>
        </motion.div>

        <motion.div
          whileHover={{ y: -3 }}
          className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-4 rounded-2xl shadow-sm"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-purple-100 dark:bg-purple-500/10 rounded-lg">
              <Zap className="w-4 h-4 text-purple-600 dark:text-purple-500" />
            </div>
          </div>
          <h4 className="text-xl font-bold">{avgDailyXP}</h4>
          <p className="text-[10px] font-bold text-purple-600 dark:text-purple-500 uppercase tracking-wider">
            Avg Daily XP
          </p>
        </motion.div>

        <motion.div
          whileHover={{ y: -3 }}
          className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-4 rounded-2xl shadow-sm"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-500/10 rounded-lg">
              <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-500" />
            </div>
          </div>
          <h4 className="text-xl font-bold">
            {stats && totalStudyDays > 0
              ? Math.round(stats.cards_learned_total / totalStudyDays)
              : 0}
          </h4>
          <p className="text-[10px] font-bold text-blue-600 dark:text-blue-500 uppercase tracking-wider">
            Avg Cards/Day
          </p>
        </motion.div>
      </div>

      {/* Achievements Section */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-5 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <Award className="w-4 h-4" />
            Achievements ({earnedAchievements.length}/{achievements.length})
          </h3>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {achievements.map((achievement) => {
            const isEarned = earnedAchievements.some((a) => a.id === achievement.id);
            return (
              <motion.div
                key={achievement.id}
                whileHover={{ scale: 1.05 }}
                className={`relative flex flex-col items-center p-3 rounded-xl border transition-all ${
                  isEarned
                    ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800'
                    : 'bg-gray-50 dark:bg-zinc-800/50 border-gray-200 dark:border-zinc-700 opacity-50'
                }`}
              >
                <span className="text-2xl mb-1">{achievement.icon}</span>
                <span className="text-[10px] font-semibold text-center leading-tight">
                  {achievement.title}
                </span>
                {isEarned ? (
                  <CheckCircle className="absolute -top-1 -right-1 w-4 h-4 text-green-500 bg-white dark:bg-zinc-900 rounded-full" />
                ) : (
                  <Lock className="absolute -top-1 -right-1 w-4 h-4 text-gray-400 bg-white dark:bg-zinc-900 rounded-full" />
                )}
              </motion.div>
            );
          })}
        </div>

        {nextAchievement && (
          <div className="mt-4 p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-100 dark:border-purple-800">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="text-xs font-bold text-purple-700 dark:text-purple-300">
                Next Achievement: {nextAchievement.title}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 bg-purple-200 dark:bg-purple-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${nextAchievement.progress}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                />
              </div>
              <span className="text-xs font-medium text-purple-600 dark:text-purple-400 min-w-[40px] text-right">
                {Math.round(nextAchievement.progress)}%
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">{nextAchievement.description}</p>
          </div>
        )}
      </div>

      {/* Study Summary */}
      {stats && (
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-5">
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4" />
            Study Summary
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-zinc-800/50 rounded-xl">
              <span className="text-lg">📅</span>
              <div>
                <p className="text-xs text-muted-foreground">Last Studied</p>
                <p className="text-sm font-semibold">
                  {stats.last_study_date ? formatRelativeDate(stats.last_study_date) : 'Not yet'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-zinc-800/50 rounded-xl">
              <span className="text-lg">📖</span>
              <div>
                <p className="text-xs text-muted-foreground">Last Topic</p>
                <p className="text-sm font-semibold">
                  {stats.last_topic_slug ? formatSlug(stats.last_topic_slug) : 'None yet'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-zinc-800/50 rounded-xl">
              <span className="text-lg">⚡</span>
              <div>
                <p className="text-xs text-muted-foreground">Total XP Earned</p>
                <p className="text-sm font-semibold">{(stats.xp || 0).toLocaleString()} XP</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-zinc-800/50 rounded-xl">
              <span className="text-lg">🎯</span>
              <div>
                <p className="text-xs text-muted-foreground">Daily Goal</p>
                <p className="text-sm font-semibold">
                  {stats.daily_cards_completed}/{stats.daily_goal_target} cards today
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString();
}

function formatSlug(slug: string): string {
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}
