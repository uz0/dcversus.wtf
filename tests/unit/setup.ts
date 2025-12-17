/**
 * Unit test setup and global configurations
 *
 * This file sets up the testing environment for unit tests including
 * global mocks, DOM polyfills, and test utilities.
 */

import { expect, jest } from '@jest/globals';

// Mock DOM APIs for Node.js environment
Object.defineProperty(global, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: jest.fn(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  })),
});

Object.defineProperty(global, 'ResizeObserver', {
  writable: true,
  configurable: true,
  value: jest.fn(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  })),
});

Object.defineProperty(global, 'performance', {
  writable: true,
  configurable: true,
  value: {
    now: jest.fn(() => Date.now()),
    mark: jest.fn(),
    measure: jest.fn(),
    getEntriesByType: jest.fn(() => []),
  },
});

// Mock crypto for Node.js environment
if (typeof global.crypto === 'undefined') {
  const { createHash } = require('crypto');
  Object.defineProperty(global, 'crypto', {
    writable: true,
    configurable: true,
    value: {
      createHash: jest.fn((algorithm: string) => createHash(algorithm)),
      getRandomValues: jest.fn((arr: Uint8Array) => {
        for (let i = 0; i < arr.length; i++) {
          arr[i] = Math.floor(Math.random() * 256);
        }
        return arr;
      }),
    },
  });
}

// Extend expect with custom matchers if needed
expect.extend({
  toBeWithinRange(received: number, floor: number, ceiling: number) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () =>
          `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      };
    }
  },
});

// Global test utilities
export const testUtils = {
  /**
   * Create a mock DOM element with specified properties
   */
  createMockElement: (tag: string, properties: Record<string, any> = {}) => {
    const element = {
      tagName: tag.toUpperCase(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      classList: {
        add: jest.fn(),
        remove: jest.fn(),
        contains: jest.fn(),
        toggle: jest.fn(),
      },
      getBoundingClientRect: jest.fn(() => ({
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        width: 0,
        height: 0,
      })),
      querySelector: jest.fn(),
      querySelectorAll: jest.fn(() => []),
      setAttribute: jest.fn(),
      getAttribute: jest.fn(),
      style: {},
      ...properties,
    };
    return element as any;
  },

  /**
   * Mock performance.now for consistent timing tests
   */
  mockPerformanceNow: (value: number = 0) => {
    Object.defineProperty(global, 'performance', {
      writable: true,
      configurable: true,
      value: {
        now: jest.fn(() => value),
        getEntriesByType: jest.fn(() => []),
        mark: jest.fn(),
        measure: jest.fn(),
      },
    });
  },

  /**
   * Wait for a specified number of milliseconds
   */
  wait: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),
};

// Export commonly used mocks
export const mockElement = testUtils.createMockElement;
export const mockPerformanceNow = testUtils.mockPerformanceNow;