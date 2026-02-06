import { Achievement } from '../types';

export const achievements: Achievement[] = [
  {
    id: 'first-card',
    title: 'First Step',
    description: 'Review your first flashcard',
    icon: '🎯',
    requirement: 1,
    type: 'cards_reviewed'
  },
  {
    id: 'quick-learner',
    title: 'Quick Learner',
    description: 'Review 50 flashcards',
    icon: '⚡',
    requirement: 50,
    type: 'cards_reviewed'
  },
  {
    id: 'dedicated-student',
    title: 'Dedicated Student',
    description: 'Review 500 flashcards',
    icon: '📚',
    requirement: 500,
    type: 'cards_reviewed'
  },
  {
    id: 'master-learner',
    title: 'Master Learner',
    description: 'Review 2000 flashcards',
    icon: '🏆',
    requirement: 2000,
    type: 'cards_reviewed'
  },
  {
    id: 'streak-3',
    title: '3-Day Streak',
    description: 'Study for 3 consecutive days',
    icon: '🔥',
    requirement: 3,
    type: 'streak'
  },
  {
    id: 'streak-7',
    title: 'Week Warrior',
    description: 'Study for 7 consecutive days',
    icon: '💪',
    requirement: 7,
    type: 'streak'
  },
  {
    id: 'streak-30',
    title: 'Monthly Master',
    description: 'Study for 30 consecutive days',
    icon: '🌟',
    requirement: 30,
    type: 'streak'
  },
  {
    id: 'streak-100',
    title: 'Centurion',
    description: 'Study for 100 consecutive days',
    icon: '👑',
    requirement: 100,
    type: 'streak'
  },
  {
    id: 'topic-master-1',
    title: 'Topic Master',
    description: 'Achieve 100% mastery in one topic',
    icon: '🎓',
    requirement: 1,
    type: 'topics_mastered'
  },
  {
    id: 'topic-master-5',
    title: 'Knowledge Seeker',
    description: 'Master 5 topics completely',
    icon: '🧠',
    requirement: 5,
    type: 'topics_mastered'
  },
  {
    id: 'perfect-week',
    title: 'Perfect Week',
    description: 'Meet your daily goal every day for a week',
    icon: '✨',
    requirement: 7,
    type: 'perfect_week'
  }
];
