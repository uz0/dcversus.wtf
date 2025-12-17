import { FullConfig } from '@playwright/test';
import fs from 'fs';
import path from 'path';

/**
 * Global test teardown
 *
 * This runs once after all tests and handles:
 * - Cleanup of temporary files
 * - Report generation
 * - Test result summary
 */
async function globalTeardown(config: FullConfig) {
  console.log('🧹 Cleaning up E2E test environment...');

  // Generate test summary
  const testResultsDir = path.join(process.cwd(), 'test-results');
  const summaryFile = path.join(testResultsDir, 'summary.json');

  if (fs.existsSync(testResultsDir)) {
    const summary = {
      timestamp: new Date().toISOString(),
      environment: process.env.TEST_ENVIRONMENT,
      testResultsDir,
      artifacts: fs.readdirSync(testResultsDir),
    };

    fs.writeFileSync(summaryFile, JSON.stringify(summary, null, 2));
    console.log(`📊 Test summary written to: ${summaryFile}`);
  }

  console.log('✅ E2E test environment cleanup completed');
}

export default globalTeardown;