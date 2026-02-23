/**
 * AI Study Insights — Analyzes user stats to generate personalized recommendations
 *
 * Uses a combination of:
 * 1. Client-side pattern analysis (no LLM needed)
 * 2. Optional LLM-enhanced summary via ai-service
 */

import { supabase } from './supabase/client';
import { log } from './logger';
import type { UserStats } from '../data/stats-api';

export interface StudyInsight {
  id: string;
  type: 'strength' | 'weakness' | 'recommendation' | 'pattern' | 'milestone';
  icon: string;
  title: string;
  description: string;
  priority: number; // 1 = highest
}

export interface WeakTopic {
  topicSlug: string;
  topicTitle: string;
  avgEase: number;
  dueCards: number;
  totalCards: number;
  masteryPercent: number;
}

export interface InsightsData {
  insights: StudyInsight[];
  weakTopics: WeakTopic[];
  nextStudyRecommendation: string;
  studyStreak: { isAtRisk: boolean; message: string };
  dailyGoalProgress: { percent: number; message: string };
}

/**
 * Generate comprehensive study insights from user data
 */
export async function analyzeStudyPatterns(
  userId: string,
  stats: UserStats | null
): Promise<InsightsData> {
  const insights: StudyInsight[] = [];
  const weakTopics: WeakTopic[] = [];

  if (!stats) {
    return {
      insights: [
        {
          id: 'start',
          type: 'recommendation',
          icon: '🚀',
          title: 'Start Your Journey!',
          description: 'Begin studying to see personalized insights and recommendations here.',
          priority: 1,
        },
      ],
      weakTopics: [],
      nextStudyRecommendation: 'Pick any topic and start with flashcards!',
      studyStreak: { isAtRisk: false, message: 'Start a streak by studying today!' },
      dailyGoalProgress: { percent: 0, message: 'Complete your first card to get started.' },
    };
  }

  // ── 1. Fetch topic-level progress from user_progress ────
  try {
    const { data: progressData } = await supabase
      .from('user_progress')
      .select('flashcard_id, ease_factor, next_review_at, is_mastered, repetitions')
      .eq('user_id', userId);

    if (progressData && progressData.length > 0) {
      // Get flashcard->topic mapping
      const cardIds = progressData.map((p) => p.flashcard_id);
      const { data: cardData } = await supabase
        .from('flashcards')
        .select('id, topic_id')
        .in('id', cardIds);

      const { data: topicData } = await supabase.from('topics').select('id, slug, title');

      if (cardData && topicData) {
        // Group progress by topic
        const cardToTopic = new Map(cardData.map((c) => [c.id, c.topic_id]));
        const topicMap = new Map(topicData.map((t) => [t.id, t]));
        const topicProgress = new Map<
          string,
          { eases: number[]; dueCount: number; mastered: number; total: number }
        >();

        const now = new Date();
        for (const p of progressData) {
          const topicId = cardToTopic.get(p.flashcard_id);
          if (!topicId) continue;

          const entry = topicProgress.get(topicId) ?? {
            eases: [],
            dueCount: 0,
            mastered: 0,
            total: 0,
          };
          entry.total++;
          entry.eases.push(p.ease_factor ?? 2.5);
          if (p.is_mastered) entry.mastered++;
          if (p.next_review_at && new Date(p.next_review_at) <= now) entry.dueCount++;
          topicProgress.set(topicId, entry);
        }

        // Identify weak topics (avg ease < 2.0 or mastery < 40%)
        for (const [topicId, data] of topicProgress) {
          const topic = topicMap.get(topicId);
          if (!topic) continue;

          const avgEase = data.eases.reduce((a, b) => a + b, 0) / data.eases.length;
          const masteryPercent = Math.round((data.mastered / data.total) * 100);

          if (avgEase < 2.0 || masteryPercent < 40) {
            weakTopics.push({
              topicSlug: topic.slug,
              topicTitle: topic.title,
              avgEase: Math.round(avgEase * 100) / 100,
              dueCards: data.dueCount,
              totalCards: data.total,
              masteryPercent,
            });
          }
        }

        // Sort weak topics by mastery (lowest first)
        weakTopics.sort((a, b) => a.masteryPercent - b.masteryPercent);
      }
    }
  } catch (err) {
    log.warn('Error analyzing topic progress:', err);
  }

  // ── 2. Generate insights from stats ─────────────────────

  // Streak analysis
  const streak = stats.current_streak ?? 0;
  const lastStudyDate = stats.last_study_date ? new Date(stats.last_study_date) : null;
  const today = new Date();
  const daysSinceLastStudy = lastStudyDate
    ? Math.floor((today.getTime() - lastStudyDate.getTime()) / (1000 * 60 * 60 * 24))
    : Infinity;

  const streakAtRisk = streak > 0 && daysSinceLastStudy >= 1;

  if (streak >= 30) {
    insights.push({
      id: 'streak-30',
      type: 'milestone',
      icon: '🏆',
      title: `${streak}-Day Streak!`,
      description:
        "Incredible commitment! You're in the top tier of learners. Consistency is the key to mastery.",
      priority: 1,
    });
  } else if (streak >= 7) {
    insights.push({
      id: 'streak-7',
      type: 'milestone',
      icon: '🔥',
      title: `${streak}-Day Streak`,
      description:
        "You're building a strong study habit. Keep going to reach the 30-day milestone!",
      priority: 2,
    });
  } else if (streakAtRisk) {
    insights.push({
      id: 'streak-risk',
      type: 'recommendation',
      icon: '⚠️',
      title: 'Streak at Risk!',
      description: `Your ${streak}-day streak will break if you don't study today. Even 5 minutes helps!`,
      priority: 1,
    });
  }

  // Cards learned milestones
  const cardsLearned = stats.cards_learned_total ?? 0;
  if (cardsLearned >= 500) {
    insights.push({
      id: 'cards-500',
      type: 'milestone',
      icon: '🌟',
      title: `${cardsLearned} Cards Mastered`,
      description: "You've reviewed over 500 cards. Your knowledge foundation is rock-solid!",
      priority: 2,
    });
  } else if (cardsLearned >= 100) {
    insights.push({
      id: 'cards-100',
      type: 'strength',
      icon: '💪',
      title: `${cardsLearned} Cards Reviewed`,
      description: 'Great progress! You qualify for an intermediate-level study plan.',
      priority: 3,
    });
  }

  // Weak area insights
  if (weakTopics.length > 0) {
    const weakest = weakTopics[0];
    insights.push({
      id: 'weak-topic',
      type: 'weakness',
      icon: '🎯',
      title: `Focus Area: ${weakest.topicTitle}`,
      description: `Only ${weakest.masteryPercent}% mastery with ${weakest.dueCards} cards due. Review this topic to strengthen your understanding.`,
      priority: 1,
    });
  }

  if (weakTopics.length >= 3) {
    insights.push({
      id: 'multiple-weak',
      type: 'weakness',
      icon: '📊',
      title: `${weakTopics.length} Topics Need Attention`,
      description:
        'Consider focused review sessions on your weakest topics before moving to new material.',
      priority: 2,
    });
  }

  // XP insight
  const xp = stats.xp ?? 0;
  const level = Math.floor(xp / 500) + 1;
  insights.push({
    id: 'level',
    type: 'pattern',
    icon: '⚡',
    title: `Level ${level} Learner`,
    description: `${xp} XP earned. ${500 - (xp % 500)} more XP to reach Level ${level + 1}.`,
    priority: 4,
  });

  // Daily goal insight
  const dailyDone = stats.daily_cards_completed ?? 0;
  const dailyGoal = stats.daily_goal_target ?? 20;
  const dailyPercent = Math.min(Math.round((dailyDone / dailyGoal) * 100), 100);

  if (dailyPercent >= 100) {
    insights.push({
      id: 'daily-complete',
      type: 'milestone',
      icon: '✅',
      title: 'Daily Goal Crushed!',
      description: `You've completed ${dailyDone}/${dailyGoal} cards today. Consider reviewing weak topics or exploring new material.`,
      priority: 3,
    });
  } else if (dailyPercent >= 50) {
    insights.push({
      id: 'daily-half',
      type: 'pattern',
      icon: '📈',
      title: `${dailyPercent}% of Daily Goal`,
      description: `${dailyGoal - dailyDone} more cards to hit your daily target. You're almost there!`,
      priority: 3,
    });
  }

  // Study recommendation
  let nextStudyRecommendation = 'Start a study session to build your knowledge!';
  if (weakTopics.length > 0) {
    nextStudyRecommendation = `Review "${weakTopics[0].topicTitle}" — it has ${weakTopics[0].dueCards} cards due and only ${weakTopics[0].masteryPercent}% mastery.`;
  } else if (stats.last_topic_slug) {
    const titleFromSlug = stats.last_topic_slug
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
    nextStudyRecommendation = `Continue studying "${titleFromSlug}" or explore a new topic.`;
  }

  // Sort insights by priority
  insights.sort((a, b) => a.priority - b.priority);

  return {
    insights: insights.slice(0, 5), // Show top 5
    weakTopics: weakTopics.slice(0, 5),
    nextStudyRecommendation,
    studyStreak: {
      isAtRisk: streakAtRisk,
      message: streakAtRisk
        ? `Study now to save your ${streak}-day streak!`
        : streak > 0
          ? `${streak}-day streak — keep it going!`
          : 'Start a new streak today!',
    },
    dailyGoalProgress: {
      percent: dailyPercent,
      message:
        dailyPercent >= 100
          ? 'Daily goal completed!'
          : `${dailyDone}/${dailyGoal} cards — ${dailyGoal - dailyDone} more to go`,
    },
  };
}
