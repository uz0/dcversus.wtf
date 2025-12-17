#!/usr/bin/env node

/**
 * Script to run Playwright tests in isolation
 * This prevents conflicts with Vitest's global matchers
 */

import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

try {
  console.log('🎭 Running Playwright tests in isolation...');

  // Set environment to prevent Vitest loading
  const env = {
    ...process.env,
    NODE_ENV: 'test-playwright',
    VITEST_DISABLE_GLOBALS: 'true',
  };

  // Run Playwright directly
  execSync('npx playwright test --project=chromium', {
    cwd: projectRoot,
    stdio: 'inherit',
    env,
  });

  console.log('✅ Playwright tests completed successfully');
} catch (error) {
  console.error('❌ Playwright tests failed:', error.message);
  process.exit(1);
}