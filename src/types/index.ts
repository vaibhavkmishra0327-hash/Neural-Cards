// Core types for NeuralCards platform

export interface Topic {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  learningPath: string;
  estimatedMinutes: number;
  prerequisites: string[];
  relatedTopics: string[];
}

export interface Flashcard {
  id: string;
  topicId: string;
  front: string;
  back: string;
  difficulty: 'easy' | 'medium' | 'hard';
  type: 'concept' | 'formula' | 'code' | 'interview';
  tags: string[];
  codeExample?: string;
  visualAid?: string;
  pitfalls?: string[];
  realWorldExample?: string;
}

export interface UserProgress {
  userId: string;
  topicId: string;
  completed: boolean;
  cardsReviewed: number;
  totalCards: number;
  lastStudied: string;
  masteryLevel: number; // 0-100
}

export interface FlashcardState {
  flashcardId: string;
  userId: string;
  lastReviewed: string;
  nextReview: string;
  easeFactor: number;
  repetitions: number;
  interval: number; // days
  isBookmarked: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  currentStreak: number;
  longestStreak: number;
  lastStudyDate: string;
  dailyGoal: number; // cards per day
  achievements: string[];
  isPremium: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  requirement: number;
  type: 'streak' | 'cards_reviewed' | 'topics_mastered' | 'perfect_week';
}

export interface LearningPath {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  topics: string[];
  estimatedHours: number;
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface SEOContent {
  title: string;
  description: string;
  canonical: string;
  ogImage?: string;
  schema?: any;
}
