/**
 * Client-Side Cache Manager
 * 
 * Implements stale-while-revalidate caching strategy with TTL
 */

import { log } from './logger';

interface CachedItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class CacheManager {
  private prefix = 'neuralcards_cache_';

  /**
   * Set item in cache with TTL
   */
  set<T>(key: string, data: T, ttlMinutes: number = 60): void {
    const item: CachedItem<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttlMinutes * 60 * 1000, // Convert to milliseconds
    };

    try {
      localStorage.setItem(this.prefix + key, JSON.stringify(item));
    } catch (error) {
      log.warn('Cache write failed:', error);
      // Handle quota exceeded by clearing old items
      this.clearExpired();
    }
  }

  /**
   * Get item from cache
   * Returns null if not found or expired
   */
  get<T>(key: string): T | null {
    try {
      const raw = localStorage.getItem(this.prefix + key);
      if (!raw) return null;

      const item: CachedItem<T> = JSON.parse(raw);
      const now = Date.now();

      // Check if expired
      if (now - item.timestamp > item.ttl) {
        this.delete(key);
        return null;
      }

      return item.data;
    } catch (error) {
      log.warn('Cache read failed:', error);
      return null;
    }
  }

  /**
   * Get item even if stale, useful for stale-while-revalidate
   */
  getStale<T>(key: string): { data: T; isStale: boolean } | null {
    try {
      const raw = localStorage.getItem(this.prefix + key);
      if (!raw) return null;

      const item: CachedItem<T> = JSON.parse(raw);
      const now = Date.now();
      const isStale = now - item.timestamp > item.ttl;

      return { data: item.data, isStale };
    } catch (error) {
      log.warn('Cache read failed:', error);
      return null;
    }
  }

  /**
   * Delete item from cache
   */
  delete(key: string): void {
    try {
      localStorage.removeItem(this.prefix + key);
    } catch (error) {
      log.warn('Cache delete failed:', error);
    }
  }

  /**
   * Clear all cache items
   */
  clear(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      log.warn('Cache clear failed:', error);
    }
  }

  /**
   * Clear only expired items
   */
  clearExpired(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith(this.prefix)) {
          const raw = localStorage.getItem(key);
          if (raw) {
            const item: CachedItem<any> = JSON.parse(raw);
            const now = Date.now();
            if (now - item.timestamp > item.ttl) {
              localStorage.removeItem(key);
            }
          }
        }
      });
    } catch (error) {
      log.warn('Cache cleanup failed:', error);
    }
  }

  /**
   * Check if cache has a valid (non-expired) item
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Get cache size in bytes (approximate)
   */
  getSize(): number {
    let size = 0;
    try {
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith(this.prefix)) {
          const item = localStorage.getItem(key);
          if (item) {
            size += key.length + item.length;
          }
        }
      });
    } catch (error) {
      log.warn('Cache size calculation failed:', error);
    }
    return size;
  }
}

// Export singleton instance
export const cache = new CacheManager();

/**
 * Cache keys constants
 */
export const CacheKeys = {
  USER_PROFILE: 'user_profile',
  USER_PROGRESS: 'user_progress',
  USER_STATS: 'user_stats',
  FLASHCARD_STATES: 'flashcard_states',
  ACHIEVEMENTS: 'achievements',
  STREAK_DATA: 'streak_data',
} as const;

/**
 * Cache TTLs in minutes
 */
export const CacheTTL = {
  PROFILE: 60,        // 1 hour
  PROGRESS: 5,        // 5 minutes
  STATS: 10,          // 10 minutes
  FLASHCARDS: 10,     // 10 minutes
  ACHIEVEMENTS: 30,   // 30 minutes
  STREAK: 5,          // 5 minutes
} as const;
