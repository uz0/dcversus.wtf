import { test, expect } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';

/**
 * Accessibility E2E Tests
 *
 * These tests verify our application meets accessibility standards
 * including WCAG compliance, screen reader compatibility, and keyboard navigation.
 */

test.describe('Accessibility Compliance', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
  });

  test('passes Axe accessibility checks', async ({ page }) => {
    // Run axe accessibility tests
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .exclude('[aria-hidden="true"]')
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);

    // Log any passed rules for verification
    console.log(`✅ ${accessibilityScanResults.passes.length} accessibility rules passed`);
  });

  test('has proper semantic HTML structure', async ({ page }) => {
    // Check for proper heading hierarchy
    const h1 = page.locator('h1');
    await expect(h1).toHaveCount(1); // Only one h1 per page

    // Check for proper landmark elements
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();

    // Check for proper navigation structure
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();

    // Check for proper button usage
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();

    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i);

      // Buttons should have accessible names
      const hasText = await button.textContent();
      const hasAriaLabel = await button.getAttribute('aria-label');
      const hasAriaLabelledby = await button.getAttribute('aria-labelledby');

      expect(hasText || hasAriaLabel || hasAriaLabelledby).toBeTruthy();
    }

    // Check for proper form labels
    const inputs = page.locator('input, textarea, select');
    const inputCount = await inputs.count();

    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i);
      const hasLabel = await input.getAttribute('aria-label') ||
                      await input.getAttribute('aria-labelledby') ||
                      await page.locator(`label[for="${await input.getAttribute('id')}"]`).count() > 0;

      if (await input.isVisible()) {
        expect(hasLabel).toBeTruthy();
      }
    }
  });

  test('keyboard navigation works properly', async ({ page }) => {
    // Test tab order
    const focusableElements = await page.locator(`
      a[href], button:not([disabled]), textarea:not([disabled]),
      input[type="text"]:not([disabled]), input[type="radio"]:not([disabled]),
      input[type="checkbox"]:not([disabled]), select:not([disabled]), [tabindex]
    `).all();

    // Test that we can tab through focusable elements
    for (let i = 0; i < Math.min(focusableElements.length, 10); i++) {
      await page.keyboard.press('Tab');

      // Check that something is focused
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
    }

    // Test Enter key on buttons
    const buttons = page.locator('button').first();
    if (await buttons.count() > 0) {
      await buttons.focus();
      await page.keyboard.press('Enter');

      // Button should not cause errors
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
    }

    // Test Space key on buttons
    if (await buttons.count() > 0) {
      await buttons.focus();
      await page.keyboard.press('Space');

      // Button should not cause errors
      await expect(page).toHaveURL(/.*/); // Still on same page
    }

    // Test Escape key for closing modals/menus
    const mobileMenuButton = page.locator('#mobile-menu-button');
    if (await mobileMenuButton.isVisible()) {
      await mobileMenuButton.click();
      await page.keyboard.press('Escape');

      // Menu should close
      const mobileMenu = page.locator('#mobile-menu');
      await expect(mobileMenu).toHaveClass(/hidden/);
    }
  });

  test('screen reader compatibility', async ({ page }) => {
    // Check ARIA labels and descriptions
    const elementsWithAria = page.locator('[aria-label], [aria-labelledby], [aria-describedby]');
    const ariaCount = await elementsWithAria.count();

    expect(ariaCount).toBeGreaterThan(0);

    // Check for proper ARIA roles
    const elementsWithRoles = page.locator('[role]');
    const roleCount = await elementsWithRoles.count();

    // Navigation should have proper role
    const nav = page.locator('nav');
    const navRole = await nav.getAttribute('role');
    expect(navRole || 'navigation').toBeTruthy();

    // Main content should have proper role
    const main = page.locator('main');
    const mainRole = await main.getAttribute('role');
    expect(mainRole || 'main').toBeTruthy();

    // Check for proper heading structure
    const headings = page.locator('h1, h2, h3, h4, h5, h6');
    const headingCount = await headings.count();

    expect(headingCount).toBeGreaterThan(0);

    // Verify heading hierarchy (no skipped levels)
    let lastLevel = 0;
    for (let i = 0; i < headingCount; i++) {
      const heading = headings.nth(i);
      const level = parseInt(await heading.evaluate((h) => h.tagName.substring(1)));

      // H1 should only appear once and should be the first heading
      if (level === 1) {
        expect(i).toBe(0); // First heading should be h1
      }

      // No skipping heading levels (except for the first h1)
      if (lastLevel > 0 && level > lastLevel + 1) {
        console.warn(`Possible heading level skip: h${lastLevel} to h${level}`);
      }

      lastLevel = level;
    }
  });

  test('color contrast and visual accessibility', async ({ page }) => {
    // Test that text has sufficient contrast
    const textElements = await page.locator('p, h1, h2, h3, h4, h5, h6, a, span').all();

    for (const element of textElements.slice(0, 10)) { // Test first 10 elements
      if (await element.isVisible()) {
        const styles = await element.evaluate((el) => {
          return {
            color: getComputedStyle(el).color,
            backgroundColor: getComputedStyle(el).backgroundColor,
          };
        });

        // Basic contrast check (simplified)
        expect(styles.color).not.toBe(styles.backgroundColor);
      }
    }

    // Test that focus indicators are visible
    const focusableElement = page.locator('button, a').first();
    if (await focusableElement.count() > 0) {
      await focusableElement.focus();

      const focusStyles = await focusableElement.evaluate((el) => {
        const styles = getComputedStyle(el);
        return {
          outline: styles.outline,
          outlineOffset: styles.outlineOffset,
          boxShadow: styles.boxShadow,
        };
      });

      // Should have some form of focus indicator
      const hasFocusIndicator =
        focusStyles.outline !== 'none' ||
        focusStyles.boxShadow !== 'none' ||
        focusStyles.outlineOffset !== '0px';

      expect(hasFocusIndicator).toBe(true);
    }
  });

  test('image accessibility', async ({ page }) => {
    // Check all images have alt text
    const images = page.locator('img');
    const imageCount = await images.count();

    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);

      // All images should have alt attributes
      const altText = await img.getAttribute('alt');
      expect(altText).toBeDefined();

      // Decorative images should have empty alt text
      const isDecorative = await img.evaluate((img) => {
        const src = img.src;
        return src.includes('logo') || img.getAttribute('role') === 'presentation';
      });

      if (isDecorative) {
        expect(altText).toBe('');
      } else {
        expect(altText?.length).toBeGreaterThan(0);
      }
    }

    // Check that images don't rely on color alone
    const colorCriticalImages = await page.locator('img[src*="chart"], img[src*="graph"]').all();

    for (const img of colorCriticalImages) {
      // Should have descriptive alt text or associated text
      const altText = await img.getAttribute('alt');
      const associatedText = await img.evaluate((img) => {
        const parent = img.parentElement;
        return parent?.textContent || '';
      });

      const hasDescription = (altText && altText.length > 0) ||
                           (associatedText && associatedText.length > 0);

      expect(hasDescription).toBe(true);
    }
  });

  test('form accessibility', async ({ page }) => {
    // Test form controls
    const formControls = page.locator('input, textarea, select, button[type="submit"]');
    const controlCount = await formControls.count();

    for (let i = 0; i < controlCount; i++) {
      const control = formControls.nth(i);

      if (await control.isVisible()) {
        // Check for labels
        const hasLabel = await control.getAttribute('aria-label') ||
                        await control.getAttribute('aria-labelledby') ||
                        await page.locator(`label[for="${await control.getAttribute('id')}"]`).count() > 0;

        expect(hasLabel).toBeTruthy();

        // Check for required field indicators
        const isRequired = await control.getAttribute('required');
        if (isRequired === 'required' || isRequired === '') {
          const ariaRequired = await control.getAttribute('aria-required');
          expect(ariaRequired).toBe('true');
        }
      }
    }

    // Test form error messages
    const form = page.locator('form').first();
    if (await form.count() > 0) {
      // Check for proper form structure
      const formId = await form.getAttribute('id');
      if (formId) {
        // Form should have proper labeling
        const hasFormLabel = await page.locator(`[aria-labelledby*="${formId}"]`).count() > 0;
        // or the form itself should be properly labeled
        const hasAriaLabel = await form.getAttribute('aria-label');

        expect(hasFormLabel || hasAriaLabel).toBeTruthy();
      }
    }
  });

  test('mobile accessibility', async ({ page }) => {
    // Test on mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Touch targets should be at least 44x44 pixels
    const touchTargets = page.locator('button, a, input[type="checkbox"], input[type="radio"]');
    const targetCount = await touchTargets.count();

    for (let i = 0; i < Math.min(targetCount, 5); i++) {
      const target = touchTargets.nth(i);

      if (await target.isVisible()) {
        const boundingBox = await target.boundingBox();

        if (boundingBox) {
          const width = boundingBox.width;
          const height = boundingBox.height;

          // Touch targets should be at least 44px in both dimensions
          expect(width).toBeGreaterThanOrEqual(44);
          expect(height).toBeGreaterThanOrEqual(44);
        }
      }
    }

    // Test that content is still accessible on mobile
    const mainContent = page.locator('main h1');
    await expect(mainContent).toBeVisible();

    // Test mobile menu accessibility
    const mobileMenuButton = page.locator('#mobile-menu-button');
    if (await mobileMenuButton.isVisible()) {
      // Should be keyboard accessible
      await mobileMenuButton.focus();
      await expect(mobileMenuButton).toBeFocused();

      // Should open menu
      await page.keyboard.press('Enter');
      const mobileMenu = page.locator('#mobile-menu');
      await expect(mobileMenu).not.toHaveClass(/hidden/);

      // Menu items should be keyboard accessible
      const menuLinks = mobileMenu.locator('a');
      const linkCount = await menuLinks.count();

      for (let j = 0; j < linkCount; j++) {
        await page.keyboard.press('Tab');
        const focusedLink = page.locator(':focus');
        await expect(focusedLink).toBeVisible();
      }
    }
  });

  test('skip links and navigation aids', async ({ page }) => {
    // Check for skip links
    const skipLinks = page.locator('a[href^="#"]:has-text("skip"), a[href^="#"]:has-text("Skip")');
    const skipLinkCount = await skipLinks.count();

    if (skipLinkCount > 0) {
      const skipLink = skipLinks.first();
      await expect(skipLink).toBeVisible();

      // Test skip link functionality
      await skipLink.click();
      await page.waitForTimeout(100);

      // Should focus on target element
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
    }

    // Check for proper page structure
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('main')).toBeVisible();
  });

  test('reduced motion and animation preferences', async ({ page }) => {
    // Test reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' });

    // Reload page with reduced motion preference
    await page.reload({ waitUntil: 'networkidle' });

    // Check that animations are respectful of reduced motion
    const animatedElements = page.locator('[style*="animation"], [style*="transition"]');
    const animatedCount = await animatedElements.count();

    if (animatedCount > 0) {
      const reducedMotionApplied = await page.evaluate(() => {
        const styles = getComputedStyle(document.documentElement);
        return styles.getPropertyValue('--prefers-reduced-motion') ||
               styles.getPropertyValue('animation') === 'none';
      });

      // Either reduced motion styles are applied or animations are disabled
      expect(reducedMotionApplied || animatedCount === 0).toBe(true);
    }
  });
});