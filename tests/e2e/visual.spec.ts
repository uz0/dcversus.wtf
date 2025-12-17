/**
 * Simple visual regression test
 */

import { test, expect } from '@playwright/test';
import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

// Get current directory for ES modules
const __dirname = fileURLToPath(new URL('.', import.meta.url));

test('should match visual baseline', async ({ page }) => {
  // Get the absolute path to the docs directory
  const docsPath = join(__dirname, '../../docs');
  const indexPath = join(docsPath, 'index.html');

  // Load the actual docs/index.html file
  const htmlContent = readFileSync(indexPath, 'utf8');

  // Set the page content
  await page.setContent(htmlContent);
  await page.waitForLoadState('networkidle');

  // Set desktop viewport for baseline
  await page.setViewportSize({ width: 1280, height: 720 });

  // Take full page screenshot for visual regression
  await expect(page).toHaveScreenshot('docs-page-desktop.png', {
    fullPage: true,
    animations: 'disabled',
  });
});