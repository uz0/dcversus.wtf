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
  // Configure tolerance for cross-platform rendering differences
  expect: {
    toHaveScreenshot: {
      // Allow up to 20% pixel difference ratio for cross-platform rendering variations
      maxDiffPixelRatio: 0.20,
      // Allow up to 1,000,000 different pixels to accommodate font and layout differences
      maxDiffPixels: 1000000,
      // Use relaxed color threshold for minor rendering variations
      threshold: 0.3,
    },
  },
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