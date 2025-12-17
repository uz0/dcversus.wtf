/**
 * Global teardown for unit tests
 *
 * This file cleans up the testing environment after running unit tests.
 */

import { type FullConfig } from '@playwright/test';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Cleaning up unit test environment...');

  // Clean up any stored browser endpoints
  delete process.env.__BROWSER_WS_ENDPOINT__;

  // Clear any global test state
  if (global.gc) {
    global.gc();
  }

  console.log('✅ Unit test environment cleanup complete');
}

export default globalTeardown;