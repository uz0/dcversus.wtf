import crypto from 'crypto';
import type { FileInfo } from '@/types';

/**
 * Generate a SHA-256 hash for content (string or Buffer)
 *
 * Creates a cryptographic hash of the provided content, useful for
 * cache busting, content validation, or generating unique identifiers.
 *
 * @param content - The content to hash (string or Buffer)
 * @returns The first 8 characters of the SHA-256 hex digest
 *
 * @example
 * ```typescript
 * const hash = generateHash('hello world');
 * console.log(hash); // '2ef7bde6'
 *
 * const fileHash = generateHash(fileBuffer);
 * console.log(fileHash); // 'a1b2c3d4'
 * ```
 */
export function generateHash(content: string | Buffer): string {
  return crypto.createHash('sha256').update(content).digest('hex').substring(0, 8);
}

/**
 * Generate a unique file hash with timestamp for cache busting
 *
 * Creates a timestamped hash that combines the file path, content hash,
 * and current time to ensure unique identifiers for each build.
 * Useful for asset versioning and cache invalidation.
 *
 * @param filePath - The file path to include in the hash
 * @param content - The file content to hash
 * @returns A unique hash string for cache busting
 *
 * @example
 * ```typescript
 * const hash = generateFileHash('styles/main.css', cssContent);
 * console.log(hash); // 'f8e9a1b2'
 *
 * // Use in filenames
 * const fileName = `styles.main.${hash}.css`;
 * ```
 */
export function generateFileHash(filePath: string, content: string): string {
  const timestamp = Date.now().toString();
  const contentHash = generateHash(content);
  return generateHash(`${filePath}:${contentHash}:${timestamp}`);
}

/**
 * Creates a debounced function that delays execution until after wait milliseconds
 *
 * Debouncing ensures that a function is only executed once during a specified
 * time window, useful for optimizing performance of frequently called functions
 * like search handlers, resize listeners, or auto-save operations.
 *
 * @template T - Function type with any parameters and unknown return type
 * @param func - The function to debounce
 * @param wait - The delay in milliseconds to wait before executing
 * @returns A new debounced function that accepts the same parameters
 *
 * @example
 * ```typescript
 * const debouncedSearch = debounce((query: string) => {
 *   console.log('Searching for:', query);
 * }, 300);
 *
 * debouncedSearch('apple'); // Won't execute immediately
 * debouncedSearch('banana'); // Cancels previous, delays execution
 * // After 300ms: 'Searching for: banana'
 * ```
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Creates a throttled function that limits execution frequency
 *
 * Throttling ensures that a function can only be executed once every specified
 * time period, regardless of how many times it's called. Useful for performance
 * optimization of high-frequency events like scroll handlers, mouse movement, or
 * resize events.
 *
 * @template T - Function type with any parameters and unknown return type
 * @param func - The function to throttle
 * @param limit - The time limit in milliseconds between executions
 * @returns A new throttled function that accepts the same parameters
 *
 * @example
 * ```typescript
 * const throttledScroll = throttle(() => {
 *   console.log('Scroll handler executed');
 * }, 100);
 *
 * window.addEventListener('scroll', throttledScroll);
 * // Will only execute once every 100ms, regardless of scroll speed
 * ```
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number,
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Check if element is in viewport
 */
export function isInViewport(element: Element): boolean {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

/**
 * Get current scroll position
 */
export function getScrollPosition(): { x: number; y: number } {
  return {
    x: window.pageXOffset || document.documentElement.scrollLeft,
    y: window.pageYOffset || document.documentElement.scrollTop,
  };
}

/**
 * Smooth scroll to element
 */
export function scrollToElement(
  selector: string,
  offset: number = 0,
): void {
  const element = document.querySelector(selector);
  if (element) {
    const y = element.getBoundingClientRect().top + window.pageYOffset + offset;
    window.scrollTo({ top: y, behavior: 'smooth' });
  }
}

/**
 * Check if user is on mobile device
 */
export function isMobileDevice(): boolean {
  return (
    typeof window !== 'undefined' &&
    (window.innerWidth < 768 ||
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent,
      ))
  );
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))  } ${  sizes[i]}`;
}

/**
 * Get file information
 */
export function getFileInfo(filePath: string, content: string): FileInfo {
  const stats = { size: content.length, lastModified: new Date() };

  return {
    path: filePath,
    hash: generateHash(content),
    size: stats.size,
    lastModified: stats.lastModified,
  };
}

/**
 * Wait for specified time
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  baseDelay: number = 1000,
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt === maxAttempts) {
        throw lastError;
      }

      const delay = baseDelay * Math.pow(2, attempt - 1);
      await sleep(delay);
    }
  }

  throw lastError!;
}

/**
 * Clamp number between min and max
 */
export function clamp(num: number, min: number, max: number): number {
  return Math.min(Math.max(num, min), max);
}

/**
 * Generate random ID
 */
export function generateId(prefix: string = '', length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';

  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return prefix ? `${prefix}_${result}` : result;
}

/**
 * Deep merge objects
 */
export function deepMerge<T extends Record<string, unknown>>(target: T, ...sources: Partial<T>[]): T {
  if (!sources.length) return target;
  const source = sources.shift();

  if (source) {
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        if (!target[key]) (target as Record<string, unknown>)[key] = {};
        deepMerge(target[key] as Record<string, unknown>, source[key] as Record<string, unknown>);
      } else {
        (target as Record<string, unknown>)[key] = source[key];
      }
    }
  }

  return deepMerge(target, ...sources);
}

/**
 * Safe JSON parse with fallback
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}

/**
 * Check if value is empty
 */
export function isEmpty(value: unknown): boolean {
  if (value == null) return true;
  if (Array.isArray(value) || typeof value === 'string') return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}