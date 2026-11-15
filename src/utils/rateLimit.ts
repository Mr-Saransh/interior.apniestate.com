// ==============================================================================
// APNI ESTATE INTERIORS - CLIENT-SIDE RATE LIMITING & DEBOUNCE UTILITIES
// Prevents rapid-fire requests, action spamming, and optimizes performance.
// ==============================================================================

import { useState, useEffect } from 'react';

interface RateLimitBucket {
  tokens: number;
  lastRefill: number;
}

const buckets = new Map<string, RateLimitBucket>();

/**
 * Checks whether an action key has exceeded its rate limit.
 * Uses a token-bucket algorithm in-memory.
 * 
 * @param key Unique key for the action (e.g. 'export-csv', 'auth-submit')
 * @param maxHits Maximum actions allowed in the window (default 10)
 * @param windowMs Time window in milliseconds (default 10,000ms = 10s)
 * @returns true if action is allowed, false if rate-limited
 */
export function checkRateLimit(key: string, maxHits = 10, windowMs = 10000): boolean {
  const now = Date.now();
  let bucket = buckets.get(key);

  if (!bucket) {
    bucket = { tokens: maxHits - 1, lastRefill: now };
    buckets.set(key, bucket);
    return true;
  }

  // Refill tokens based on elapsed time
  const elapsed = now - bucket.lastRefill;
  const tokensToAdd = Math.floor(elapsed / (windowMs / maxHits));
  if (tokensToAdd > 0) {
    bucket.tokens = Math.min(maxHits, bucket.tokens + tokensToAdd);
    bucket.lastRefill = now;
  }

  if (bucket.tokens > 0) {
    bucket.tokens -= 1;
    return true;
  }

  return false;
}

/**
 * Creates a debounced function that delays invoking func until after
 * wait milliseconds have elapsed since the last time the debounced function was invoked.
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  waitMs = 300
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return function (this: any, ...args: Parameters<T>) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      fn.apply(this, args);
      timeoutId = null;
    }, waitMs);
  };
}

/**
 * Creates a throttled function that only invokes func at most once per
 * every limit milliseconds.
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limitMs = 500
): (...args: Parameters<T>) => void {
  let inThrottle = false;

  return function (this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      fn.apply(this, args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limitMs);
    }
  };
}

/**
 * React hook to debounce a fast-changing state value (e.g. search input).
 */
export function useDebounce<T>(value: T, delayMs = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delayMs]);

  return debouncedValue;
}
