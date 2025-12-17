import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: 'test-results.json' }],
  ],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  // Use platform-agnostic snapshots
  snapshotPathTemplate: '{testDir}/{testFileDir}/{testFileName}-{projectName}{ext}',
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testMatch: '**/e2e/**/*.spec.ts',
    },
  ],
  // Prevent global setup conflicts
  globalSetup: undefined,
  globalTeardown: undefined,
  // Isolate test runner to avoid conflicts with Vitest
  testIgnore: ['**/node_modules/**', '**/unit/**/*.test.ts'],
  });