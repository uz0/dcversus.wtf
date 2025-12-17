import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for unit tests
 *
 * This configuration is optimized for unit testing with minimal browser
 * overhead and fast execution times.
 */

export default defineConfig({
  testDir: './tests/unit',

  // Run tests in files in parallel for unit tests
  fullyParallel: true,

  // Disable retries for unit tests (they should be deterministic)
  retries: 0,

  // Use all available workers for unit tests
  workers: process.env.CI ? 1 : undefined,

  // Simple reporter for unit tests
  reporter: 'list',

  // Global timeout for unit tests (shorter than E2E)
  timeout: 30 * 1000,

  // Expect timeout for unit tests
  expect: {
    timeout: 5 * 1000,
  },

  // Use the chromium browser for unit tests
  projects: [
    {
      name: 'unit-tests',
      use: {
        ...devices['Desktop Chrome'],
        // Unit tests don't need a real browser context
        headless: true,
        // Faster timeout for unit tests
        actionTimeout: 5 * 1000,
        navigationTimeout: 10 * 1000,
      },
    },
  ],

  // Global setup for unit tests
  globalSetup: './tests/unit/global-setup.ts',

  // Global teardown for unit tests
  globalTeardown: './tests/unit/global-teardown.ts',

  // Output directory for test artifacts
  outputDir: 'test-results/unit',

  // Test files pattern
  testMatch: '**/*.unit.spec.ts',

  // Files to ignore
  testIgnore: [
    '**/node_modules/**',
    '**/dist/**',
    '**/build/**',
    '**/e2e/**',
    '**/accessibility/**',
    '**/performance/**',
  ],
});