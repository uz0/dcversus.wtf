/**
 * Global setup for unit tests
 *
 * This file sets up the testing environment before running unit tests.
 * It configures global mocks and test utilities.
 */

import { type FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🧪 Setting up unit test environment...');

  // Set up global mocks for DOM APIs in Node.js environment
  global.IntersectionObserver = class IntersectionObserver {
    constructor() {}
    observe() {}
    unobserve() {}
    disconnect() {}
  } as any;

  global.ResizeObserver = class ResizeObserver {
    constructor() {}
    observe() {}
    unobserve() {}
    disconnect() {}
  } as any;

  global.performance = {
    now: () => Date.now(),
    mark: () => {},
    measure: () => {},
    getEntriesByType: () => [],
  } as Performance;

  // Mock crypto for Node.js environment
  if (typeof global.crypto === 'undefined') {
    const { createHash } = require('crypto');
    global.crypto = {
      createHash: (algorithm: string) => createHash(algorithm),
      getRandomValues: (arr: Uint8Array) => {
        for (let i = 0; i < arr.length; i++) {
          arr[i] = Math.floor(Math.random() * 256);
        }
        return arr;
      },
    } as any;
  }

  console.log('✅ Unit test environment setup complete');
}

export default globalSetup;