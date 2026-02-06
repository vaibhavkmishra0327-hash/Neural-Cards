// SM-2 Spaced Repetition Algorithm Implementation

export interface ReviewResult {
  quality: number; // 0-5 rating
}

export interface CardSchedule {
  easeFactor: number;
  interval: number; // days
  repetitions: number;
  nextReview: Date;
}

/**
 * Calculate next review schedule using SM-2 algorithm
 * @param previousSchedule - Previous card schedule
 * @param quality - User's rating (0-5): 0=complete blackout, 5=perfect response
 * @returns New schedule for the card
 */
export function calculateNextReview(
  previousSchedule: CardSchedule,
  quality: number
): CardSchedule {
  let { easeFactor, interval, repetitions } = previousSchedule;

  // Quality must be 0-5
  quality = Math.max(0, Math.min(5, quality));

  // Update ease factor
  easeFactor = Math.max(
    1.3,
    easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  );

  // If quality < 3, reset repetitions
  if (quality < 3) {
    repetitions = 0;
    interval = 1;
  } else {
    repetitions += 1;

    // Calculate new interval
    if (repetitions === 1) {
      interval = 1;
    } else if (repetitions === 2) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
  }

  // Calculate next review date
  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + interval);

  return {
    easeFactor,
    interval,
    repetitions,
    nextReview
  };
}

/**
 * Initialize schedule for a new card
 */
export function initializeCardSchedule(): CardSchedule {
  return {
    easeFactor: 2.5,
    interval: 1,
    repetitions: 0,
    nextReview: new Date()
  };
}

/**
 * Determine if a card is due for review
 */
export function isDueForReview(schedule: CardSchedule): boolean {
  return new Date() >= schedule.nextReview;
}

/**
 * Get cards due for review from a collection
 */
export function getDueCards<T extends { schedule: CardSchedule }>(
  cards: T[]
): T[] {
  return cards.filter(card => isDueForReview(card.schedule));
}

/**
 * Convert user difficulty rating to quality score
 * 'easy' -> 5, 'medium' -> 3, 'hard' -> 1
 */
export function difficultyToQuality(difficulty: 'easy' | 'medium' | 'hard'): number {
  const mapping = {
    easy: 5,
    medium: 3,
    hard: 1
  };
  return mapping[difficulty];
}
