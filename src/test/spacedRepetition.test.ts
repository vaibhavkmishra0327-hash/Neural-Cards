import { describe, it, expect } from 'vitest';
import {
  calculateNextReview,
  initializeCardSchedule,
  isDueForReview,
  difficultyToQuality,
} from '../utils/spacedRepetition';

describe('Spaced Repetition Algorithm', () => {
  describe('initializeCardSchedule', () => {
    it('should return default schedule values', () => {
      const schedule = initializeCardSchedule();
      expect(schedule.easeFactor).toBe(2.5);
      expect(schedule.interval).toBe(1);
      expect(schedule.repetitions).toBe(0);
      expect(schedule.nextReview).toBeInstanceOf(Date);
    });
  });

  describe('calculateNextReview', () => {
    it('should reset repetitions for quality < 3', () => {
      const schedule = initializeCardSchedule();
      const result = calculateNextReview(schedule, 2);
      expect(result.repetitions).toBe(0);
      expect(result.interval).toBe(1);
    });

    it('should increase repetitions for quality >= 3', () => {
      const schedule = initializeCardSchedule();
      const result = calculateNextReview(schedule, 4);
      expect(result.repetitions).toBe(1);
      expect(result.interval).toBe(1);
    });

    it('should set interval to 6 on second correct review', () => {
      const firstReview = calculateNextReview(initializeCardSchedule(), 4);
      const secondReview = calculateNextReview(firstReview, 4);
      expect(secondReview.repetitions).toBe(2);
      expect(secondReview.interval).toBe(6);
    });

    it('should clamp ease factor to minimum 1.3', () => {
      const schedule = { ...initializeCardSchedule(), easeFactor: 1.3 };
      const result = calculateNextReview(schedule, 0);
      expect(result.easeFactor).toBeGreaterThanOrEqual(1.3);
    });

    it('should set next review date in the future', () => {
      const schedule = initializeCardSchedule();
      const result = calculateNextReview(schedule, 5);
      expect(result.nextReview.getTime()).toBeGreaterThan(Date.now() - 1000);
    });
  });

  describe('isDueForReview', () => {
    it('should return true for past dates', () => {
      const schedule = initializeCardSchedule();
      schedule.nextReview = new Date(Date.now() - 86400000); // Yesterday
      expect(isDueForReview(schedule)).toBe(true);
    });

    it('should return false for future dates', () => {
      const schedule = initializeCardSchedule();
      schedule.nextReview = new Date(Date.now() + 86400000); // Tomorrow
      expect(isDueForReview(schedule)).toBe(false);
    });
  });

  describe('difficultyToQuality', () => {
    it('should map easy to 5', () => {
      expect(difficultyToQuality('easy')).toBe(5);
    });

    it('should map medium to 3', () => {
      expect(difficultyToQuality('medium')).toBe(3);
    });

    it('should map hard to 1', () => {
      expect(difficultyToQuality('hard')).toBe(1);
    });
  });
});
