/**
 * Adaptive Study — Smart card ordering based on spaced repetition + weakness analysis
 *
 * Prioritizes: (1) Due/overdue cards, (2) Weak cards (low ease), (3) New unseen cards
 * This is a client-side only feature that reads from Supabase user_progress table.
 */

import { supabase } from './supabase/client';
import { log } from './logger';
import type { Database } from '../types/database.types';

type Flashcard = Database['public']['Tables']['flashcards']['Row'];

interface CardPriority {
  cardId: string;
  priority: 'due' | 'weak' | 'new' | 'review';
  easeFactor: number;
  daysSinceReview: number;
}

export interface AdaptiveStudyDeck {
  cards: Flashcard[];
  priorities: Map<string, CardPriority>;
  stats: {
    dueCount: number;
    weakCount: number;
    newCount: number;
    reviewCount: number;
  };
  isAdaptive: boolean;
}

/**
 * Build an adaptive study deck by reordering cards based on user's review history
 */
export async function getAdaptiveStudyDeck(
  userId: string,
  flashcards: Flashcard[]
): Promise<AdaptiveStudyDeck> {
  if (!userId || flashcards.length === 0) {
    return {
      cards: flashcards,
      priorities: new Map(),
      stats: { dueCount: 0, weakCount: 0, newCount: 0, reviewCount: flashcards.length },
      isAdaptive: false,
    };
  }

  try {
    // Fetch user's review data for these cards
    const cardIds = flashcards.map((c) => c.id);
    const { data: progressData, error } = await supabase
      .from('user_progress')
      .select('flashcard_id, ease_factor, next_review_at, repetitions, is_mastered')
      .eq('user_id', userId)
      .in('flashcard_id', cardIds);

    if (error) {
      log.warn('Error fetching user progress, using default order:', error.message);
      return {
        cards: flashcards,
        priorities: new Map(),
        stats: { dueCount: 0, weakCount: 0, newCount: flashcards.length, reviewCount: 0 },
        isAdaptive: false,
      };
    }

    const now = new Date();
    const progressMap = new Map(progressData?.map((p) => [p.flashcard_id, p]) ?? []);

    // Categorize and prioritize each card
    const priorities = new Map<string, CardPriority>();
    const categories = {
      due: [] as Flashcard[],
      weak: [] as Flashcard[],
      newCards: [] as Flashcard[],
      review: [] as Flashcard[],
    };

    for (const card of flashcards) {
      const progress = progressMap.get(card.id);

      if (!progress) {
        // Never reviewed — new card
        priorities.set(card.id, {
          cardId: card.id,
          priority: 'new',
          easeFactor: 2.5,
          daysSinceReview: Infinity,
        });
        categories.newCards.push(card);
        continue;
      }

      const nextReview = progress.next_review_at ? new Date(progress.next_review_at) : now;
      const daysSinceReview = Math.floor(
        (now.getTime() - nextReview.getTime()) / (1000 * 60 * 60 * 24)
      );
      const easeFactor = progress.ease_factor ?? 2.5;
      const isOverdue = now >= nextReview;
      const isWeak = easeFactor < 2.0 || (progress.repetitions ?? 0) <= 1;

      if (progress.is_mastered) {
        // Mastered cards go to the end
        priorities.set(card.id, {
          cardId: card.id,
          priority: 'review',
          easeFactor,
          daysSinceReview,
        });
        categories.review.push(card);
      } else if (isOverdue) {
        priorities.set(card.id, { cardId: card.id, priority: 'due', easeFactor, daysSinceReview });
        categories.due.push(card);
      } else if (isWeak) {
        priorities.set(card.id, { cardId: card.id, priority: 'weak', easeFactor, daysSinceReview });
        categories.weak.push(card);
      } else {
        priorities.set(card.id, {
          cardId: card.id,
          priority: 'review',
          easeFactor,
          daysSinceReview,
        });
        categories.review.push(card);
      }
    }

    // Sort within each category:
    // Due cards — most overdue first
    categories.due.sort((a, b) => {
      const pA = priorities.get(a.id)!;
      const pB = priorities.get(b.id)!;
      return pB.daysSinceReview - pA.daysSinceReview;
    });

    // Weak cards — lowest ease factor first
    categories.weak.sort((a, b) => {
      const pA = priorities.get(a.id)!;
      const pB = priorities.get(b.id)!;
      return pA.easeFactor - pB.easeFactor;
    });

    // Interleave: due → weak → new → review
    const sortedCards: Flashcard[] = [
      ...categories.due,
      ...categories.weak,
      ...categories.newCards,
      ...categories.review,
    ];

    log.info(
      `Adaptive deck built: ${categories.due.length} due, ${categories.weak.length} weak, ${categories.newCards.length} new, ${categories.review.length} review`
    );

    return {
      cards: sortedCards,
      priorities,
      stats: {
        dueCount: categories.due.length,
        weakCount: categories.weak.length,
        newCount: categories.newCards.length,
        reviewCount: categories.review.length,
      },
      isAdaptive: true,
    };
  } catch (err) {
    log.error('Adaptive study deck error:', err);
    return {
      cards: flashcards,
      priorities: new Map(),
      stats: { dueCount: 0, weakCount: 0, newCount: flashcards.length, reviewCount: 0 },
      isAdaptive: false,
    };
  }
}

/**
 * Get a short label for a card's adaptive priority
 */
export function getPriorityLabel(priority: CardPriority['priority'] | undefined): {
  label: string;
  color: string;
  emoji: string;
} {
  switch (priority) {
    case 'due':
      return {
        label: 'Due for Review',
        color: 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400',
        emoji: '🔴',
      };
    case 'weak':
      return {
        label: 'Needs Practice',
        color: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400',
        emoji: '🟠',
      };
    case 'new':
      return {
        label: 'New Card',
        color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400',
        emoji: '🔵',
      };
    case 'review':
      return {
        label: 'Review',
        color: 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400',
        emoji: '🟢',
      };
    default:
      return {
        label: 'Study',
        color: 'text-gray-600 bg-gray-100 dark:bg-gray-900/30 dark:text-gray-400',
        emoji: '📘',
      };
  }
}
