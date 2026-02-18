import { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Flame,
  Trophy,
  Target,
  RefreshCw,
  ArrowRight,
  PlayCircle,
  Zap,
  Map,
  Award,
  TrendingUp,
  Calendar,
  Brain,
  Sparkles,
  Bell,
} from 'lucide-react';
import { getUserStats, UserStats } from '../data/stats-api';
import { getSuggestedTopics } from '../data/api';
import { learningPaths } from '../data/learningPaths';
import { NotificationPreferences } from './NotificationPreferences';
import { UserStatsPanel } from './UserStatsPanel';
import { scheduleReminder, clearScheduledReminder } from '../utils/studyReminder';
import type { User } from '@supabase/supabase-js';
import type { Database } from '../types/database.types';

type Topic = Database['public']['Tables']['topics']['Row'];

interface DashboardProps {
  user: User;
  onNavigate: (page: string, data?: Record<string, string>) => void;
  onSignOut: () => void;
}

export function Dashboard({ user, onNavigate, onSignOut }: DashboardProps) {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(false);
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);

  const loadData = useCallback(async () => {
    if (user?.id) {
      setLoading(true);

      // 1. Stats lao
      const statsData = await getUserStats(user.id);
      if (statsData) setStats(statsData);

      // 2. Topics lao (Continue Learning ke liye)
      const topicsData = await getSuggestedTopics();
      setTopics(topicsData);

      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Schedule study reminders based on current stats
  useEffect(() => {
    if (stats) {
      scheduleReminder(stats.last_study_date);
    }
    return () => clearScheduledReminder();
  }, [stats]);

  const displayStats = stats || {
    current_streak: 0,
    cards_learned_total: 0,
    daily_cards_completed: 0,
    daily_goal_target: 20,
    xp: 0,
  };

  const dailyPercent = Math.min(
    (displayStats.daily_cards_completed / displayStats.daily_goal_target) * 100,
    100
  );

  // Motivational messages based on progress
  const getMotivation = () => {
    if (displayStats.current_streak >= 7) return '🔥 Unstoppable! Keep that streak alive!';
    if (displayStats.cards_learned_total >= 50) return "🚀 You're making incredible progress!";
    if (dailyPercent >= 100) return "🎉 Daily goal crushed! You're on fire!";
    if (dailyPercent >= 50) return '💪 Halfway to your daily goal. Keep pushing!';
    return '✨ Every card you learn builds your AI expertise!';
  };

  return (
    <div className="container mx-auto px-4 py-8 mt-16 text-foreground">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex flex-wrap items-center gap-2 sm:gap-3">
            Welcome back,{' '}
            <span className="bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
              {user?.email?.split('@')[0] || 'Learner'}
            </span>
            <button
              onClick={() => setShowNotificationPanel((v) => !v)}
              className={`p-2 rounded-full transition-all border border-transparent ${
                showNotificationPanel
                  ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 border-purple-300 dark:border-purple-700'
                  : 'bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 hover:border-gray-300 dark:hover:border-zinc-600'
              }`}
              title="Study Reminders"
              aria-label="Toggle study reminders"
            >
              <Bell className="w-4 h-4" />
            </button>
            <button
              onClick={loadData}
              disabled={loading}
              className="p-2 bg-gray-100 dark:bg-zinc-800 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-700 transition-all border border-transparent hover:border-gray-300 dark:hover:border-zinc-600"
              title="Refresh Data"
            >
              <RefreshCw
                className={`w-4 h-4 text-gray-500 dark:text-gray-400 ${loading ? 'animate-spin' : ''}`}
              />
            </button>
          </h1>
          <p className="text-muted-foreground mt-2">{getMotivation()}</p>
        </div>
        <button
          onClick={onSignOut}
          className="px-4 py-2 border border-gray-200 dark:border-zinc-700 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors text-sm font-medium"
        >
          Sign Out
        </button>
      </div>

      {/* Notification Preferences Panel */}
      <AnimatePresence>
        {showNotificationPanel && (
          <NotificationPreferences
            lastStudyDate={stats?.last_study_date ?? null}
            onClose={() => setShowNotificationPanel(false)}
            userId={user.id}
            userEmail={user.email || ''}
          />
        )}
      </AnimatePresence>

      {/* Stats Grid - Colorful & Modern */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
        {/* Streak */}
        <motion.div
          whileHover={{ y: -5 }}
          className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-4 sm:p-5 rounded-2xl shadow-sm hover:shadow-md transition-all"
        >
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-2.5 sm:p-3 bg-orange-100 dark:bg-orange-500/10 rounded-xl text-orange-600 dark:text-orange-500">
              <Flame className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-bold">
                {displayStats.current_streak}{' '}
                <span className="text-xs sm:text-sm font-medium text-muted-foreground">days</span>
              </h3>
              <p className="text-[10px] sm:text-xs font-bold text-orange-600 dark:text-orange-500 uppercase tracking-wider">
                Streak
              </p>
            </div>
          </div>
        </motion.div>

        {/* Learned */}
        <motion.div
          whileHover={{ y: -5 }}
          className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-4 sm:p-5 rounded-2xl shadow-sm hover:shadow-md transition-all"
        >
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-2.5 sm:p-3 bg-blue-100 dark:bg-blue-500/10 rounded-xl text-blue-600 dark:text-blue-500">
              <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-bold">
                {displayStats.cards_learned_total}{' '}
                <span className="text-xs sm:text-sm font-medium text-muted-foreground">cards</span>
              </h3>
              <p className="text-[10px] sm:text-xs font-bold text-blue-600 dark:text-blue-500 uppercase tracking-wider">
                Learned
              </p>
            </div>
          </div>
        </motion.div>

        {/* XP */}
        <motion.div
          whileHover={{ y: -5 }}
          className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-4 sm:p-5 rounded-2xl shadow-sm hover:shadow-md transition-all"
        >
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-2.5 sm:p-3 bg-yellow-100 dark:bg-yellow-500/10 rounded-xl text-yellow-600 dark:text-yellow-500">
              <Trophy className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-bold">
                {displayStats.xp}{' '}
                <span className="text-xs sm:text-sm font-medium text-muted-foreground">pts</span>
              </h3>
              <p className="text-[10px] sm:text-xs font-bold text-yellow-600 dark:text-yellow-500 uppercase tracking-wider">
                Total XP
              </p>
            </div>
          </div>
        </motion.div>

        {/* Daily Goal */}
        <motion.div
          whileHover={{ y: -5 }}
          className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-4 sm:p-5 rounded-2xl shadow-sm hover:shadow-md transition-all relative overflow-hidden group"
        >
          <div className="flex items-center gap-3 sm:gap-4 relative z-10">
            <div className="p-2.5 sm:p-3 bg-purple-100 dark:bg-purple-500/10 rounded-xl text-purple-600 dark:text-purple-500">
              <Target className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-bold">
                {displayStats.daily_cards_completed}
                <span className="text-muted-foreground text-base sm:text-lg">
                  /{displayStats.daily_goal_target}
                </span>
              </h3>
              <p className="text-[10px] sm:text-xs font-bold text-purple-600 dark:text-purple-500 uppercase tracking-wider">
                Daily Goal
              </p>
            </div>
          </div>
          <div
            className="absolute bottom-0 left-0 h-1.5 bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-1000"
            style={{ width: `${dailyPercent}%` }}
          />
        </motion.div>
      </div>

      {/* Detailed User Statistics */}
      <UserStatsPanel userId={user.id} stats={stats} />

      {/* Quick Actions Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onNavigate('paths')}
          className="flex items-center gap-3 p-4 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all"
        >
          <Map className="w-5 h-5 flex-shrink-0" />
          <span className="font-semibold text-sm">Learning Paths</span>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onNavigate('all-practice')}
          className="flex items-center gap-3 p-4 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition-all"
        >
          <Brain className="w-5 h-5 flex-shrink-0" />
          <span className="font-semibold text-sm">Practice Hub</span>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onNavigate('blog')}
          className="flex items-center gap-3 p-4 bg-gradient-to-br from-pink-500 to-pink-600 text-white rounded-2xl shadow-lg shadow-pink-500/20 hover:shadow-pink-500/40 transition-all"
        >
          <Sparkles className="w-5 h-5 flex-shrink-0" />
          <span className="font-semibold text-sm">AI Blog</span>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onNavigate('about')}
          className="flex items-center gap-3 p-4 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all"
        >
          <Award className="w-5 h-5 flex-shrink-0" />
          <span className="font-semibold text-sm">About Us</span>
        </motion.button>
      </div>

      {/* Learning Paths Progress */}
      <div className="mb-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
            Your Learning Paths
          </h2>
          <button
            onClick={() => onNavigate('paths')}
            className="text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 flex items-center gap-1 transition-colors"
          >
            View all <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {learningPaths.slice(0, 4).map((path, idx) => (
            <motion.div
              key={path.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              whileHover={{ y: -3 }}
              onClick={() => onNavigate('paths', { selectedPath: path.id })}
              className="cursor-pointer bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-5 hover:border-purple-500/50 dark:hover:border-purple-500/50 transition-all group"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{path.icon}</span>
                <h3 className="font-bold text-sm group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors line-clamp-1">
                  {path.title}
                </h3>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                <Calendar className="w-3.5 h-3.5" />
                <span>{path.topics.length} topics</span>
                <span className="text-gray-300 dark:text-zinc-600">•</span>
                <span>~{path.estimatedHours}h</span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full w-0 group-hover:w-[5%] transition-all duration-500" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Start Learning Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500 fill-current" />
            Start Learning
          </h2>
          <button
            onClick={() => onNavigate('all-practice')}
            className="text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 flex items-center gap-1 transition-colors"
          >
            View all topics <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {topics.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topics.map((topic, index) => (
              <motion.div
                key={topic.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                onClick={() => onNavigate('practice', { slug: topic.slug, title: topic.title })}
                className="group cursor-pointer bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:border-purple-500/50 dark:hover:border-purple-500/50 transition-all duration-300"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-gray-50 dark:bg-zinc-800 rounded-xl group-hover:bg-purple-100 dark:group-hover:bg-purple-900/30 transition-colors">
                    <span className="text-2xl">
                      {['🤖', '📐', '🐍', '🧠', '⚡', '🚀'][index % 6]}
                    </span>
                  </div>
                  <span className="px-3 py-1 bg-gray-100 dark:bg-zinc-800 text-xs font-semibold rounded-full text-gray-600 dark:text-gray-300 uppercase tracking-wide">
                    {topic.category || 'General'}
                  </span>
                </div>

                <h3 className="text-lg sm:text-xl font-bold mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  {topic.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-6">
                  {topic.description ||
                    'Master this topic with interactive flashcards and spaced repetition.'}
                </p>

                <div className="flex items-center text-purple-600 dark:text-purple-400 font-semibold text-sm">
                  <PlayCircle className="w-5 h-5 mr-2" />
                  Start Session
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 dark:bg-zinc-900/50 rounded-2xl border border-dashed border-gray-300 dark:border-zinc-700">
            <p className="text-muted-foreground">Loading topics for you...</p>
          </div>
        )}
      </div>
    </div>
  );
}
