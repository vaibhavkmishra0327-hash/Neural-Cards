import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Target,
  AlertTriangle,
  TrendingUp,
  BookOpen,
  ChevronRight,
  Loader2,
  Sparkles,
} from 'lucide-react';
import {
  analyzeStudyPatterns,
  enhanceInsightsWithAI,
  type InsightsData,
  type StudyInsight,
} from '../utils/ai-study-insights';
import type { UserStats } from '../data/stats-api';

interface AIStudyInsightsProps {
  userId: string;
  stats: UserStats | null;
  onNavigate: (page: string, data?: Record<string, string>) => void;
}

const insightIcons: Record<StudyInsight['type'], typeof Brain> = {
  strength: TrendingUp,
  weakness: AlertTriangle,
  recommendation: Target,
  pattern: BookOpen,
  milestone: Sparkles,
};

export function AIStudyInsights({ userId, stats, onNavigate }: AIStudyInsightsProps) {
  const [data, setData] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  const loadInsights = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Show heuristic result immediately (fast, no LLM)
      const result = await analyzeStudyPatterns(userId, stats);
      setData(result);
      setLoading(false);

      // Enhance with AI in background (non-blocking)
      if (stats) {
        enhanceInsightsWithAI(stats).then((aiRec) => {
          if (aiRec) {
            setData((prev) => (prev ? { ...prev, nextStudyRecommendation: aiRec } : prev));
          }
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load insights');
      setLoading(false);
    }
  }, [userId, stats]);

  useEffect(() => {
    loadInsights();
  }, [loadInsights]);

  if (loading) {
    return (
      <div className="mb-8 p-6 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <Brain className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <h2 className="font-bold text-lg">AI Study Insights</h2>
        </div>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
          <span className="ml-2 text-sm text-gray-500">Analyzing your study patterns...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-8 p-6 bg-white dark:bg-zinc-900 border border-red-200 dark:border-red-800 rounded-2xl">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
            <Brain className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="font-bold text-lg">AI Study Insights</h2>
        </div>
        <p className="text-sm text-red-600 dark:text-red-400 mb-3">
          Could not load insights. {error}
        </p>
        <button
          onClick={loadInsights}
          className="text-sm font-medium text-purple-600 dark:text-purple-400 hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="mb-8">
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 rounded-2xl p-[1px]">
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl text-white">
                <Brain className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-lg">AI Study Insights</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Personalized recommendations based on your progress
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full text-xs font-semibold">
              AI Powered
            </span>
          </div>

          {/* Next Study Recommendation */}
          <div className="mb-5 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <Target className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-1">
                  What to Study Next
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  {data.nextStudyRecommendation}
                </p>
              </div>
            </div>
          </div>

          {/* Streak & Daily Goal Row */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div
              className={`p-3 rounded-xl border ${
                data.studyStreak.isAtRisk
                  ? 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20'
                  : 'border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800/50'
              }`}
            >
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">
                Streak
              </p>
              <p
                className={`text-sm font-medium ${
                  data.studyStreak.isAtRisk
                    ? 'text-red-700 dark:text-red-400'
                    : 'text-gray-900 dark:text-white'
                }`}
              >
                {data.studyStreak.message}
              </p>
            </div>
            <div className="p-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800/50">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">
                Daily Goal
              </p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {data.dailyGoalProgress.message}
              </p>
              <div className="mt-1.5 h-1.5 bg-gray-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500"
                  style={{ width: `${data.dailyGoalProgress.percent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Insights List */}
          <div className="space-y-2.5">
            {(expanded ? data.insights : data.insights.slice(0, 3)).map((insight, idx) => {
              const IconComponent = insightIcons[insight.type] || BookOpen;
              return (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-zinc-800/50 rounded-xl"
                >
                  <span className="text-lg flex-shrink-0">{insight.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {insight.title}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                      {insight.description}
                    </p>
                  </div>
                  <IconComponent className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                </motion.div>
              );
            })}
          </div>

          {data.insights.length > 3 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-3 text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium"
            >
              {expanded ? 'Show less' : `Show ${data.insights.length - 3} more insights`}
            </button>
          )}

          {/* Weak Topics */}
          <AnimatePresence>
            {data.weakTopics.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-5 pt-5 border-t dark:border-zinc-700"
              >
                <p className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                  Topics Needing Review
                </p>
                <div className="space-y-2">
                  {data.weakTopics.slice(0, 3).map((topic) => (
                    <button
                      key={topic.topicSlug}
                      onClick={() =>
                        onNavigate('practice', { slug: topic.topicSlug, title: topic.topicTitle })
                      }
                      className="w-full flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800/50 rounded-xl hover:bg-orange-100 dark:hover:bg-orange-900/20 transition-colors text-left group"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {topic.topicTitle}
                        </p>
                        <p className="text-xs text-orange-600 dark:text-orange-400">
                          {topic.masteryPercent}% mastery • {topic.dueCards} cards due
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-orange-500 transition-colors flex-shrink-0" />
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
