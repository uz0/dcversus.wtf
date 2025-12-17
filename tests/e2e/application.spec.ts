import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

/**
 * Application E2E Tests
 *
 * These tests verify the complete functionality of our DCVS application,
 * including all the TypeScript logic from src/main.ts and UI components.
 */

test.describe('DCVS Application', () => {
  test.beforeEach(async ({ page }) => {
    // Wait for the application to load completely
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForLoadState('domcontentloaded');
  });

  test('loads homepage with correct title and branding', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/DCVS - Masters of Clarity/);

    // Check main heading
    const mainHeading = page.locator('h1');
    await expect(mainHeading).toContainText('We help organizations');
    await expect(mainHeading).toContainText('achieve excellence');

    // Check brand colors are applied
    const brandOrangeElement = page.locator('.text-brand-orange, [style*="#FF6700"]');
    await expect(brandOrangeElement.first()).toBeVisible();
  });

  test('displays all three brand logos correctly', async ({ page }) => {
    // Check logo images exist and are loaded
    const logos = page.locator('img[src$=".svg"]');
    await expect(logos).toHaveCount(3); // dcversus, theedgestory, uz0

    // Verify each logo is loaded
    for (let i = 0; i < await logos.count(); i++) {
      const logo = logos.nth(i);
      await expect(logo).toBeVisible();

      // Check alt text
      const altText = await logo.getAttribute('alt');
      expect(altText).toBeDefined();
    }
  });

  test('mobile navigation menu works correctly', async ({ page }) => {
    // Test on mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Mobile menu button should be visible
    const mobileMenuButton = page.locator('#mobile-menu-button');
    await expect(mobileMenuButton).toBeVisible();

    // Menu should be hidden initially
    const mobileMenu = page.locator('#mobile-menu');
    await expect(mobileMenu).toHaveClass(/hidden/);

    // Click to open menu
    await mobileMenuButton.click();
    await expect(mobileMenu).not.toHaveClass(/hidden/);

    // Verify navigation links are visible
    const navLinks = page.locator('#mobile-menu a');
    await expect(navLinks).toHaveCount(4); // Services, About, Contact, Get Started

    // Close menu by clicking button again
    await mobileMenuButton.click();
    await expect(mobileMenu).toHaveClass(/hidden/);
  });

  test('desktop navigation works correctly', async ({ page }) => {
    // Test on desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 });

    // Desktop navigation should be visible
    const desktopNav = page.locator('nav.hidden.md\\:flex');
    await expect(desktopNav).toBeVisible();

    // Navigation links should work
    const servicesLink = page.locator('a[href="#services"]');
    await servicesLink.click();

    // Should scroll to services section
    await page.waitForTimeout(500); // Wait for smooth scroll
    const servicesSection = page.locator('#services');
    await expect(servicesSection).toBeInViewport();
  });

  test('hero section renders correctly with trust indicators', async ({ page }) => {
    // Check hero heading
    const heroHeading = page.locator('h1');
    await expect(heroHeading).toBeVisible();
    await expect(heroHeading).toContainText('Masters of Clarity');

    // Check trust indicators
    const trustIndicators = page.locator('[data-counter]');
    await expect(trustIndicators).toHaveCount(3);

    // Verify counter values
    const indicators = [
      { selector: '[data-counter="500+"]', text: '500+' },
      { selector: '[data-counter="15+"]', text: '15+' },
      { selector: '[data-counter="98%"]', text: '98%' },
    ];

    for (const indicator of indicators) {
      const element = page.locator(indicator.selector);
      await expect(element).toBeVisible();
      await expect(element).toContainText(indicator.text);
    }
  });

  test('call-to-action buttons work correctly', async ({ page }) => {
    // Find main CTA buttons
    const primaryButton = page.locator('button:has-text("Start Your Journey")');
    const secondaryButton = page.locator('button:has-text("Learn More")');

    await expect(primaryButton).toBeVisible();
    await expect(secondaryButton).toBeVisible();

    // Test button hover effects
    await primaryButton.hover();
    await expect(primaryButton).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, -2)');

    // Test button click (should not navigate away since we don't have the handlers)
    await primaryButton.click();
    // Just verify it doesn't throw an error
  });

  test('visual elements and animations load correctly', async ({ page }) => {
    // Check gradient text
    const gradientText = page.locator('.gradient-text');
    await expect(gradientText).toBeVisible();

    // Check animated elements
    const animatedElements = page.locator('.animate-fade-in, .animate-slide-up');
    await expect(animatedElements.first()).toBeVisible();

    // Check feature cards
    const featureCards = page.locator('.bg-white.rounded-3xl.shadow-2xl');
    await expect(featureCards).toBeVisible();

    // Check icon elements
    const icons = page.locator('.w-12.h-12.rounded-lg');
    await expect(icons).toHaveCount(3);
  });

  test('responsive design works across breakpoints', async ({ page }) => {
    // Test mobile
    await page.setViewportSize({ width: 375, height: 667 });
    const mobileLayout = page.locator('.md\\:grid');
    await expect(mobileLayout).not.toHaveClass(/md:grid/); // Should be single column

    // Test tablet
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(100); // Wait for layout changes

    // Test desktop
    await page.setViewportSize({ width: 1280, height: 720 });
    const desktopLayout = page.locator('.lg\\:grid-cols-2');
    await expect(desktopLayout).toHaveClass(/lg:grid-cols-2/); // Should be two columns
  });

  test('footer displays correctly with all elements', async ({ page }) => {
    // Scroll to footer
    const footer = page.locator('footer');
    await footer.scrollIntoViewIfNeeded();
    await expect(footer).toBeVisible();

    // Check footer content
    await expect(footer).toContainText('© 2025 DCVS - Masters of Clarity');

    // Check footer links
    const footerLinks = footer.locator('a');
    await expect(footerLinks).toHaveCount(3); // Privacy, Terms, Contact

    // Check footer logos
    const footerLogos = footer.locator('img');
    await expect(footerLogos).toHaveCount(3);
  });

  test('keyboard navigation works correctly', async ({ page }) => {
    // Test Tab navigation
    await page.keyboard.press('Tab');
    const firstFocusable = page.locator(':focus');
    await expect(firstFocusable).toBeVisible();

    // Tab through navigation
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Test Enter key on links
    const servicesLink = page.locator('a[href="#services"]').first();
    await servicesLink.focus();
    await page.keyboard.press('Enter');

    await page.waitForTimeout(500);
    const servicesSection = page.locator('#services');
    await expect(servicesSection).toBeInViewport();
  });

  test('error handling and edge cases', async ({ page }) => {
    // Test rapid navigation clicks
    const navLinks = page.locator('a[href^="#"]');
    const linkCount = await navLinks.count();

    for (let i = 0; i < linkCount; i++) {
      await navLinks.nth(i).click();
      await page.waitForTimeout(100);
    }

    // Test viewport resize handling
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(200);
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(200);

    // Application should still be functional
    const mainHeading = page.locator('h1');
    await expect(mainHeading).toBeVisible();
  });
});

/**
 * Performance and integration tests
 */
test.describe('Application Performance', () => {
  test('loads within performance budget', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/', { waitUntil: 'networkidle' });

    const loadTime = Date.now() - startTime;

    // Should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);

    // Check Core Web Vitals (basic checks)
    const performanceEntries = await page.evaluate(() => {
      return JSON.stringify(performance.getEntriesByType('navigation'));
    });

    const navigation = JSON.parse(performanceEntries);
    expect(navigation[0].loadEventEnd - navigation[0].loadEventStart).toBeLessThan(1000);
  });

  test('handles image loading correctly', async ({ page }) => {
    // Wait for all images to load
    await page.goto('/', { waitUntil: 'networkidle' });

    const images = page.locator('img');
    const imageCount = await images.count();

    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      await expect(img).toHaveAttribute('src');

      // Check if image loaded successfully
      const naturalWidth = await img.evaluate((img: HTMLImageElement) => img.naturalWidth);
      expect(naturalWidth).toBeGreaterThan(0);
    }
  });
});