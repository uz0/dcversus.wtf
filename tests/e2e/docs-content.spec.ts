/**
 * E2E tests for actual docs content
 */

import { test, expect } from '@playwright/test';
import { execSync } from 'child_process';
import path from 'path';

test.describe('Documentation Content Tests', () => {
  test.beforeAll(async () => {
    // Ensure the project is built before tests
    execSync('npm run build', { stdio: 'inherit' });
  });

  test('should render the main consulting page correctly', async ({ page }) => {
    // Get the absolute path to the docs directory
    const docsPath = path.resolve(__dirname, '../../docs');
    const indexPath = path.join(docsPath, 'index.html');

    // Load the actual docs/index.html file
    const htmlContent = require('fs').readFileSync(indexPath, 'utf8');

    // Set the page content
    await page.setContent(htmlContent);

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Check main heading
    const mainHeading = page.locator('h1');
    await expect(mainHeading).toContainText('Василиса Версус');

    // Check for key sections
    await expect(page.locator('text=Типичные вопросы')).toBeVisible();
    await expect(page.locator('text=Меня зовут Василиса Версус')).toBeVisible();
    await expect(page.locator('text=Платная консультация')).toBeVisible();
    await expect(page.locator('text=Бесплатная консультация')).toBeVisible();

    // Check for important links
    const linkedinLink = page.locator('a[href*="linkedin.com"]');
    await expect(linkedinLink).toContainText('@dcversus');

    const telegramLink = page.locator('a[href*="t.me"]');
    await expect(telegramLink).toContainText('t.me/dcversus');

    // Check for YouTube videos
    const youtubeFrames = page.locator('iframe[src*="youtube.com"]');
    await expect(youtubeFrames).toHaveCount(2);

    // Check for project links
    const uz0Link = page.locator('a[href*="uz0.dev"]');
    await expect(uz0Link).toContainText('unity zone zero');

    const theedgestoryLink = page.locator('a[href*="theedgestory.org"]');
    await expect(theedgestoryLink).toContainText('the edge story');
  });

  test('should have proper page metadata', async ({ page }) => {
    const docsPath = path.resolve(__dirname, '../../docs');
    const indexPath = path.join(docsPath, 'index.html');
    const htmlContent = require('fs').readFileSync(indexPath, 'utf8');

    await page.setContent(htmlContent);

    // Check page title
    await expect(page).toHaveTitle('Василиса Версус - Профессиональные консультации');

    // Check language attribute
    const htmlElement = page.locator('html');
    await expect(htmlElement).toHaveAttribute('lang', 'ru');

    // Check viewport meta tag
    const viewportMeta = page.locator('meta[name="viewport"]');
    await expect(viewportMeta).toHaveAttribute('content', 'width=device-width, initial-scale=1.0');
  });

  test('should verify JavaScript functionality', async ({ page }) => {
    const docsPath = path.resolve(__dirname, '../../docs');
    const indexPath = path.join(docsPath, 'index.html');
    const htmlContent = require('fs').readFileSync(indexPath, 'utf8');

    // Capture console messages
    const consoleMessages: string[] = [];
    page.on('console', msg => {
      consoleMessages.push(msg.text());
    });

    await page.setContent(htmlContent);
    await page.waitForLoadState('networkidle');

    // Check if "it works" was logged (from our main.js)
    expect(consoleMessages).toContain('it works');
  });

  test('should have responsive design elements', async ({ page }) => {
    const docsPath = path.resolve(__dirname, '../../docs');
    const indexPath = path.join(docsPath, 'index.html');
    const htmlContent = require('fs').readFileSync(indexPath, 'utf8');

    await page.setContent(htmlContent);

    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('h1')).toBeVisible();

    // Test desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 });
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should match visual baseline on desktop', async ({ page }) => {
    const docsPath = path.resolve(__dirname, '../../docs');
    const indexPath = path.join(docsPath, 'index.html');
    const htmlContent = require('fs').readFileSync(indexPath, 'utf8');

    await page.setContent(htmlContent);
    await page.waitForLoadState('networkidle');

    // Set desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 });

    // Take full page screenshot for comparison
    await expect(page).toHaveScreenshot('docs-desktop-full.png', {
      fullPage: true,
      animations: 'disabled',
    });

    // Take hero section screenshot
    const heroSection = page.locator('section').first();
    await expect(heroSection).toHaveScreenshot('docs-hero-section.png', {
      animations: 'disabled',
    });
  });

  test('should match visual baseline on mobile', async ({ page }) => {
    const docsPath = path.resolve(__dirname, '../../docs');
    const indexPath = path.join(docsPath, 'index.html');
    const htmlContent = require('fs').readFileSync(indexPath, 'utf8');

    await page.setContent(htmlContent);
    await page.waitForLoadState('networkidle');

    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Take full page screenshot for comparison
    await expect(page).toHaveScreenshot('docs-mobile-full.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });
});