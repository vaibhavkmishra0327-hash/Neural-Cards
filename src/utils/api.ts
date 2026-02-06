/**
 * Optimized API Client
 *
 * Features:
 * - Automatic caching with TTL
 * - Stale-while-revalidate
 * - Parallel fetching
 * - Optimistic updates
 * - Retry logic
 * - Request deduplication
 */

import { cache, CacheKeys, CacheTTL } from './cache';
import { projectId } from './supabase/info';
import { log } from './logger';

const BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-f02c4c3b`;

// In-flight request tracker to prevent duplicate requests
const inflightRequests = new Map<string, Promise<any>>();

/**
 * Make API request with automatic retry
 */
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries: number = 3
): Promise<Response> {
  let lastError: Error | null = null;

  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      return response;
    } catch (error) {
      lastError = error as Error;
      log.warn(`Request failed (attempt ${i + 1}/${retries}):`, error);

      // Wait before retrying (exponential backoff)
      if (i < retries - 1) {
        await new Promise((resolve) => setTimeout(resolve, Math.pow(2, i) * 1000));
      }
    }
  }

  throw lastError || new Error('Request failed');
}

/**
 * Make API request with caching
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit & { accessToken?: string; cacheKey?: string; cacheTTL?: number } = {}
): Promise<T> {
  const { accessToken, cacheKey, cacheTTL, ...fetchOptions } = options;
  const url = `${BASE_URL}${endpoint}`;

  // Add authorization header if token provided
  const headers = new Headers(fetchOptions.headers || {});
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }
  headers.set('Content-Type', 'application/json');

  const requestOptions: RequestInit = {
    ...fetchOptions,
    headers,
  };

  // Check cache for GET requests
  if (fetchOptions.method === 'GET' || !fetchOptions.method) {
    if (cacheKey) {
      const cached = cache.getStale<T>(cacheKey);

      if (cached) {
        // Return cached data immediately
        if (!cached.isStale) {
          log.info(`Cache hit (fresh): ${cacheKey}`);
          return cached.data;
        }

        // Data is stale, return it but revalidate in background
        log.info(`Cache hit (stale): ${cacheKey}, revalidating...`);

        // Revalidate in background (stale-while-revalidate)
        fetchWithRetry(url, requestOptions)
          .then((response) => response.json())
          .then((data) => {
            if (cacheTTL) {
              cache.set(cacheKey, data, cacheTTL);
            }
          })
          .catch((error) => {
            log.warn('Background revalidation failed:', error);
          });

        return cached.data;
      }
    }
  }

  // Request deduplication for GET requests
  const requestKey = `${fetchOptions.method || 'GET'}_${url}`;
  if (fetchOptions.method === 'GET' || !fetchOptions.method) {
    if (inflightRequests.has(requestKey)) {
      log.info(`Deduplicating request: ${requestKey}`);
      return inflightRequests.get(requestKey)!;
    }
  }

  // Make the request
  const promise = fetchWithRetry(url, requestOptions)
    .then(async (response) => {
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error (${response.status}): ${errorText}`);
      }
      return response.json();
    })
    .then((data) => {
      // Cache successful GET responses
      if ((fetchOptions.method === 'GET' || !fetchOptions.method) && cacheKey && cacheTTL) {
        cache.set(cacheKey, data, cacheTTL);
      }
      return data;
    })
    .finally(() => {
      // Clean up inflight request tracker
      inflightRequests.delete(requestKey);
    });

  // Track inflight request
  if (fetchOptions.method === 'GET' || !fetchOptions.method) {
    inflightRequests.set(requestKey, promise);
  }

  return promise;
}

/**
 * API Client
 */
export const api = {
  /**
   * Get user profile with caching
   */
  async getUserProfile(accessToken: string, forceFresh: boolean = false): Promise<any> {
    if (forceFresh) {
      cache.delete(CacheKeys.USER_PROFILE);
    }

    const response = await apiRequest<Record<string, any>>('/user/profile', {
      accessToken,
      cacheKey: CacheKeys.USER_PROFILE,
      cacheTTL: CacheTTL.PROFILE,
    });

    return response.profile;
  },

  /**
   * Get user progress with caching and pagination
   */
  async getUserProgress(
    accessToken: string,
    options: { limit?: number; forceFresh?: boolean } = {}
  ): Promise<any[]> {
    const { limit = 10, forceFresh = false } = options;

    if (forceFresh) {
      cache.delete(CacheKeys.USER_PROGRESS);
    }

    const response = await apiRequest<Record<string, any>>(`/progress?limit=${limit}`, {
      accessToken,
      cacheKey: CacheKeys.USER_PROGRESS,
      cacheTTL: CacheTTL.PROGRESS,
    });

    return response.progress || [];
  },

  /**
   * Get dashboard data (parallel fetch)
   */
  async getDashboardData(accessToken: string): Promise<{
    profile: any;
    progress: any[];
  }> {
    const startTime = performance.now();

    // Parallel fetch for speed
    const [profile, progress] = await Promise.all([
      api.getUserProfile(accessToken),
      api.getUserProgress(accessToken, { limit: 10 }),
    ]);

    const elapsed = performance.now() - startTime;
    log.info(`Dashboard data loaded in ${elapsed.toFixed(0)}ms`);

    return { profile, progress };
  },

  /**
   * Review flashcard (optimistic update)
   */
  async reviewFlashcard(
    accessToken: string,
    flashcardId: string,
    topicId: string,
    quality: number
  ): Promise<any> {
    // Don't cache POST requests
    const response = await apiRequest<Record<string, any>>('/flashcard/review', {
      method: 'POST',
      accessToken,
      body: JSON.stringify({ flashcardId, topicId, quality }),
    });

    // Invalidate progress cache after review
    cache.delete(CacheKeys.USER_PROGRESS);
    cache.delete(CacheKeys.USER_STATS);

    return response;
  },

  /**
   * Batch review flashcards (optimized)
   */
  async reviewFlashcardsBatch(
    accessToken: string,
    reviews: Array<{ flashcardId: string; topicId: string; quality: number }>
  ): Promise<any> {
    const response = await apiRequest<Record<string, any>>('/flashcard/review/batch', {
      method: 'POST',
      accessToken,
      body: JSON.stringify({ reviews }),
    });

    // Invalidate caches after batch review
    cache.delete(CacheKeys.USER_PROGRESS);
    cache.delete(CacheKeys.USER_STATS);

    return response;
  },

  /**
   * Update user profile
   */
  async updateUserProfile(accessToken: string, updates: any): Promise<any> {
    const response = await apiRequest<Record<string, any>>('/user/profile', {
      method: 'PUT',
      accessToken,
      body: JSON.stringify(updates),
    });

    // Update cache with new profile
    cache.set(CacheKeys.USER_PROFILE, response.profile, CacheTTL.PROFILE);

    return response.profile;
  },

  /**
   * Get streak data
   */
  async getStreak(accessToken: string): Promise<any> {
    const response = await apiRequest<Record<string, any>>('/streak', {
      accessToken,
      cacheKey: CacheKeys.STREAK_DATA,
      cacheTTL: CacheTTL.STREAK,
    });

    return response.streak;
  },

  /**
   * Bookmark flashcard
   */
  async bookmarkFlashcard(
    accessToken: string,
    flashcardId: string,
    isBookmarked: boolean
  ): Promise<any> {
    const response = await apiRequest<Record<string, any>>('/flashcard/bookmark', {
      method: 'POST',
      accessToken,
      body: JSON.stringify({ flashcardId, isBookmarked }),
    });

    return response.state;
  },

  /**
   * Get topic progress
   */
  async getTopicProgress(accessToken: string, topicId: string): Promise<any> {
    const response = await apiRequest<Record<string, any>>(`/progress/${topicId}`, {
      accessToken,
      cacheTTL: CacheTTL.PROGRESS,
    });

    return response.progress;
  },
};

/**
 * Optimistic update helper
 */
export class OptimisticUpdate<T> {
  private originalState: T;
  private updateFn: (state: T) => void;

  constructor(currentState: T, updateFn: (state: T) => void) {
    this.originalState = JSON.parse(JSON.stringify(currentState)); // Deep clone
    this.updateFn = updateFn;
  }

  /**
   * Apply optimistic update
   */
  apply(newState: T): void {
    this.updateFn(newState);
  }

  /**
   * Rollback to original state on failure
   */
  rollback(): void {
    this.updateFn(this.originalState);
  }

  /**
   * Commit the update (do nothing, already applied)
   */
  commit(): void {
    // Update is already applied, just cleanup
  }
}

/**
 * Prefetch data for faster navigation
 */
export function prefetchDashboard(accessToken: string): void {
  // Prefetch in background (don't await)
  api.getDashboardData(accessToken).catch((error) => {
    log.warn('Prefetch failed:', error);
  });
}

/**
 * Clear all API caches
 */
export function clearApiCache(): void {
  cache.clear();
  log.info('All API caches cleared');
}
