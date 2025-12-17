import { chromium, FullConfig } from '@playwright/test';
import path from 'path';
import fs from 'fs';

/**
 * Global test setup
 *
 * This runs once before all tests and handles:
 * - Environment validation
 * - Browser installation verification
 * - Test data setup
 * - Cleanup of previous test results
 */
async function globalSetup(config: FullConfig) {
  console.log('🚀 Setting up E2E test environment...');

  // Clean up previous test results
  const testResultsDir = path.join(process.cwd(), 'test-results');
  if (fs.existsSync(testResultsDir)) {
    fs.rmSync(testResultsDir, { recursive: true, force: true });
  }

  // Create test artifacts directory
  fs.mkdirSync(testResultsDir, { recursive: true });

  // Verify browser installation
  try {
    const browser = await chromium.launch();
    const version = browser.version();
    console.log(`✅ Chromium ${version} available for testing`);
    await browser.close();
  } catch (error) {
    console.error('❌ Browser verification failed:', error);
    throw new Error('Playwright browsers not installed. Run "npm run test:e2e:install"');
  }

  // Validate test environment
  if (!process.env.BASE_URL && !process.env.CI) {
    console.log('ℹ️  Using local development server (http://localhost:3000)');
  }

  // Set up environment variables for tests
  process.env.TEST_ENVIRONMENT = 'e2e';
  process.env.TEST_TIMESTAMP = new Date().toISOString();

  console.log('✅ E2E test environment setup completed');
}

export default globalSetup;