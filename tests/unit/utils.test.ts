/**
 * Unit tests for utility functions
 *
 * This test suite covers the core utility functions in src/utils/helpers.ts
 * including hashing, debouncing, throttling, DOM utilities, and data manipulation functions.
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@playwright/test';

// Mock crypto for consistent testing in Node.js environment
const mockCrypto = {
  createHash: jest.fn(() => ({
    update: jest.fn(() => ({
      digest: jest.fn(() => '2ef7bde6029a7a5ad52d7ee0158e2b8f1b8c0e3f8d3e6a1b2c4d5e6f7a8b9c0d1')
    }))
  }))
};

// Mock process.env for testing
const originalEnv = process.env;

describe('Utility Functions', () => {
  beforeEach(() => {
    // Setup mocks
    global.crypto = mockCrypto as any;
    process.env = { ...originalEnv };

    // Mock DOM methods
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024
    });

    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 768
    });

    Object.defineProperty(window, 'pageYOffset', {
      writable: true,
      configurable: true,
      value: 0
    });

    Object.defineProperty(window, 'pageXOffset', {
      writable: true,
      configurable: true,
      value: 0
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    process.env = originalEnv;
  });

  describe('Hash Functions', () => {
    it('should generate consistent hash for string input', async () => {
      const { generateHash } = await import('@/utils/helpers');
      const hash1 = generateHash('test string');
      const hash2 = generateHash('test string');

      expect(hash1).toBe('2ef7bde6'); // First 8 chars of mocked hash
      expect(hash2).toBe(hash1); // Should be consistent
    });

    it('should generate different hashes for different inputs', async () => {
      const { generateHash } = await import('@/utils/helpers');
      const hash1 = generateHash('string1');
      const hash2 = generateHash('string2');

      expect(hash1).not.toBe(hash2);
    });

    it('should handle buffer input correctly', async () => {
      const { generateHash } = await import('@/utils/helpers');
      const buffer = Buffer.from('test buffer');
      const hash = generateHash(buffer);

      expect(hash).toBe('2ef7bde6');
    });

    it('should generate unique file hashes with timestamps', async () => {
      const { generateFileHash } = await import('@/utils/helpers');

      // Mock Date.now to return consistent values
      const mockDateNow = jest.fn()
        .mockReturnValueOnce(1000)
        .mockReturnValueOnce(2000);

      global.Date.now = mockDateNow;

      const hash1 = generateFileHash('test.js', 'console.log("test");');
      const hash2 = generateFileHash('test.js', 'console.log("test");');

      expect(hash1).not.toBe(hash2); // Should be different due to timestamp
    });
  });

  describe('Debounce Function', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should delay function execution', async () => {
      const { debounce } = await import('@/utils/helpers');
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn('test');
      expect(mockFn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledWith('test');
    });

    it('should cancel previous calls when called multiple times', async () => {
      const { debounce } = await import('@/utils/helpers');
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn('first');
      debouncedFn('second');
      debouncedFn('third');

      jest.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('third');
    });

    it('should preserve function context', async () => {
      const { debounce } = await import('@/utils/helpers');
      const obj = {
        value: 'test',
        method: jest.fn(function(this: any) {
          return this.value;
        })
      };

      const debouncedMethod = debounce(obj.method.bind(obj), 100);
      debouncedMethod();

      jest.advanceTimersByTime(100);
      expect(obj.method).toHaveBeenCalled();
    });
  });

  describe('Throttle Function', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should limit function execution frequency', async () => {
      const { throttle } = await import('@/utils/helpers');
      const mockFn = jest.fn();
      const throttledFn = throttle(mockFn, 100);

      throttledFn('test1');
      expect(mockFn).toHaveBeenCalledWith('test1');

      throttledFn('test2');
      throttledFn('test3');
      expect(mockFn).toHaveBeenCalledTimes(1); // Still only called once

      jest.advanceTimersByTime(100);
      throttledFn('test4');
      expect(mockFn).toHaveBeenCalledWith('test4');
      expect(mockFn).toHaveBeenCalledTimes(2);
    });

    it('should ignore calls within the throttle period', async () => {
      const { throttle } = await import('@/utils/helpers');
      const mockFn = jest.fn();
      const throttledFn = throttle(mockFn, 200);

      throttledFn('call1');
      throttledFn('call2'); // Should be ignored
      throttledFn('call3'); // Should be ignored

      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('call1');

      jest.advanceTimersByTime(200);
      throttledFn('call4'); // Should be called now

      expect(mockFn).toHaveBeenCalledTimes(2);
      expect(mockFn).toHaveBeenCalledWith('call4');
    });
  });

  describe('DOM Utilities', () => {
    it('should check if element is in viewport correctly', async () => {
      const { isInViewport } = await import('@/utils/helpers');

      // Mock getBoundingClientRect
      const mockElement = {
        getBoundingClientRect: jest.fn(() => ({
          top: 100,
          left: 100,
          bottom: 200,
          right: 200
        }))
      } as any;

      // Mock window dimensions
      Object.defineProperty(window, 'innerHeight', { value: 500, writable: true });
      Object.defineProperty(window, 'innerWidth', { value: 500, writable: true });

      expect(isInViewport(mockElement)).toBe(true);

      // Element outside viewport
      mockElement.getBoundingClientRect.mockReturnValue({
        top: 600,
        left: 100,
        bottom: 700,
        right: 200
      });

      expect(isInViewport(mockElement)).toBe(false);
    });

    it('should return correct scroll position', async () => {
      const { getScrollPosition } = await import('@/utils/helpers');

      Object.defineProperty(window, 'pageYOffset', { value: 150, writable: true });
      Object.defineProperty(window, 'pageXOffset', { value: 75, writable: true });

      const position = getScrollPosition();
      expect(position).toEqual({ x: 75, y: 150 });
    });

    it('should detect mobile device correctly', async () => {
      const { isMobileDevice } = await import('@/utils/helpers');

      // Mock desktop viewport
      Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true });
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        writable: true,
        configurable: true
      });

      expect(isMobileDevice()).toBe(false);

      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', { value: 375, writable: true });
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
        writable: true,
        configurable: true
      });

      expect(isMobileDevice()).toBe(true);
    });
  });

  describe('Data Utilities', () => {
    it('should format file sizes correctly', async () => {
      const { formatFileSize } = await import('@/utils/helpers');

      expect(formatFileSize(0)).toBe('0 Bytes');
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(1048576)).toBe('1 MB');
      expect(formatFileSize(1073741824)).toBe('1 GB');
      expect(formatFileSize(1536)).toBe('1.5 KB');
    });

    it('should clamp numbers correctly', async () => {
      const { clamp } = await import('@/utils/helpers');

      expect(clamp(5, 0, 10)).toBe(5); // Within range
      expect(clamp(-5, 0, 10)).toBe(0); // Below minimum
      expect(clamp(15, 0, 10)).toBe(10); // Above maximum
    });

    it('should generate random IDs', async () => {
      const { generateId } = await import('@/utils/helpers');

      const id1 = generateId();
      const id2 = generateId();

      expect(id1).toHaveLength(8);
      expect(id2).toHaveLength(8);
      expect(id1).not.toBe(id2); // Should be different

      const prefixedId = generateId('test', 12);
      expect(prefixedId).toBe('test_' + 'a'.repeat(12)); // Pattern check
      expect(prefixedId).toHaveLength(17); // 4 + 1 + 12
    });

    it('should check if values are empty', async () => {
      const { isEmpty } = await import('@/utils/helpers');

      expect(isEmpty(null)).toBe(true);
      expect(isEmpty(undefined)).toBe(true);
      expect(isEmpty('')).toBe(true);
      expect(isEmpty([])).toBe(true);
      expect(isEmpty({})).toBe(true);
      expect(isEmpty('test')).toBe(false);
      expect(isEmpty([1, 2, 3])).toBe(false);
      expect(isEmpty({ key: 'value' })).toBe(false);
    });

    it('should safely parse JSON with fallback', async () => {
      const { safeJsonParse } = await import('@/utils/helpers');

      const validJson = '{"name": "test", "value": 123}';
      const invalidJson = 'invalid json';
      const fallback = { name: 'fallback', value: 0 };

      expect(safeJsonParse(validJson, fallback)).toEqual({ name: 'test', value: 123 });
      expect(safeJsonParse(invalidJson, fallback)).toEqual(fallback);
    });
  });

  describe('Async Utilities', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should resolve sleep promise after specified time', async () => {
      const { sleep } = await import('@/utils/helpers');

      const sleepPromise = sleep(100);

      // Should not resolve immediately
      await expect(Promise.race([
        sleepPromise,
        Promise.resolve('timeout')
      ])).resolves.toBe('timeout');

      jest.advanceTimersByTime(100);

      await expect(sleepPromise).resolves.toBeUndefined();
    });
  });

  describe('Deep Merge Utility', () => {
    it('should merge objects correctly', async () => {
      const { deepMerge } = await import('@/utils/helpers');

      const target = { a: 1, b: { x: 1 } };
      const source1 = { b: { y: 2 }, c: 3 };
      const source2 = { d: 4, b: { z: 3 } };

      const result = deepMerge(target, source1, source2);

      expect(result).toEqual({
        a: 1,
        b: { x: 1, y: 2, z: 3 },
        c: 3,
        d: 4
      });
    });

    it('should handle empty sources', async () => {
      const { deepMerge } = await import('@/utils/helpers');

      const target = { a: 1 };
      const result = deepMerge(target);

      expect(result).toEqual(target);
    });

    it('should override with last source value for primitive types', async () => {
      const { deepMerge } = await import('@/utils/helpers');

      const target = { a: 1 };
      const source1 = { a: 2 };
      const source2 = { a: 3 };

      const result = deepMerge(target, source1, source2);

      expect(result.a).toBe(3);
    });
  });
});