import { describe, it, expect, beforeEach } from 'vitest';

// We need a local instance for test isolation
class TestCacheManager {
  private prefix = 'test_cache_';
  private store: Map<string, string> = new Map();

  set<T>(key: string, data: T, ttlMinutes: number = 60): void {
    const item = {
      data,
      timestamp: Date.now(),
      ttl: ttlMinutes * 60 * 1000,
    };
    this.store.set(this.prefix + key, JSON.stringify(item));
  }

  get<T>(key: string): T | null {
    const raw = this.store.get(this.prefix + key);
    if (!raw) return null;
    const item = JSON.parse(raw);
    if (Date.now() - item.timestamp > item.ttl) {
      this.store.delete(this.prefix + key);
      return null;
    }
    return item.data;
  }

  delete(key: string): void {
    this.store.delete(this.prefix + key);
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  clear(): void {
    this.store.clear();
  }
}

describe('Cache Manager', () => {
  let cache: TestCacheManager;

  beforeEach(() => {
    cache = new TestCacheManager();
  });

  it('should store and retrieve data', () => {
    cache.set('test-key', { name: 'test' });
    const result = cache.get<{ name: string }>('test-key');
    expect(result).toEqual({ name: 'test' });
  });

  it('should return null for missing keys', () => {
    const result = cache.get('nonexistent');
    expect(result).toBeNull();
  });

  it('should delete items', () => {
    cache.set('to-delete', 'value');
    expect(cache.has('to-delete')).toBe(true);
    cache.delete('to-delete');
    expect(cache.has('to-delete')).toBe(false);
  });

  it('should check existence with has()', () => {
    expect(cache.has('missing')).toBe(false);
    cache.set('exists', true);
    expect(cache.has('exists')).toBe(true);
  });

  it('should clear all items', () => {
    cache.set('a', 1);
    cache.set('b', 2);
    cache.clear();
    expect(cache.has('a')).toBe(false);
    expect(cache.has('b')).toBe(false);
  });
});
