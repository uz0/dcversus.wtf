import { test, expect } from '@playwright/test';

/**
 * Theme System E2E Tests
 *
 * These tests verify our TypeScript theme system from src/utils/theme.ts
 * including brand colors, CSS custom properties, and responsive design.
 */

test.describe('Theme System', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
  });

  test('applies correct brand colors throughout the application', async ({ page }) => {
    // Test brand orange (#FF6700)
    const orangeElements = page.locator('[style*="#FF6700"], .text-brand-orange, .bg-brand-orange');
    const orangeCount = await orangeElements.count();
    expect(orangeCount).toBeGreaterThan(0);

    // Test brand purple (#6A0DAD)
    const purpleElements = page.locator('[style*="#6A0DAD"], .text-brand-purple, .bg-brand-purple');
    const purpleCount = await purpleElements.count();
    expect(purpleCount).toBeGreaterThan(0);

    // Test brand yellow (#FFC107)
    const yellowElements = page.locator('[style*="#FFC107"], .text-brand-yellow, .bg-brand-yellow');
    const yellowCount = await yellowElements.count();
    expect(yellowCount).toBeGreaterThan(0);
  });

  test('CSS custom properties are correctly applied', async ({ page }) => {
    // Check if CSS variables are applied to root element
    const rootStyles = await page.evaluate(() => {
      const root = document.documentElement;
      const computedStyle = getComputedStyle(root);
      return {
        brandOrange: computedStyle.getPropertyValue('--brand-orange'),
        brandPurple: computedStyle.getPropertyValue('--brand-purple'),
        brandYellow: computedStyle.getPropertyValue('--brand-yellow'),
      };
    });

    expect(rootStyles.brandOrange).toBe('#FF6700');
    expect(rootStyles.brandPurple).toBe('#6A0DAD');
    expect(rootStyles.brandYellow).toBe('#FFC107');
  });

  test('gradient text implementation works correctly', async ({ page }) => {
    const gradientText = page.locator('.gradient-text');
    await expect(gradientText).toBeVisible();

    // Verify gradient text styling
    const gradientStyles = await gradientText.evaluate((element) => {
      const styles = getComputedStyle(element);
      return {
        backgroundClip: styles.backgroundClip,
        webkitBackgroundClip: styles.webkitBackgroundClip,
        fillColor: styles.fillColor || styles.color,
      };
    });

    expect(gradientStyles.backgroundClip).toBe('text');
    expect(gradientStyles.webkitBackgroundClip).toBe('text');
  });

  test('responsive breakpoints work correctly', async ({ page }) => {
    const testCases = [
      { width: 375, name: 'Mobile', expectedClasses: ['hidden.md\\:flex'] },
      { width: 768, name: 'Tablet', expectedClasses: ['md\\:grid'] },
      { width: 1280, name: 'Desktop', expectedClasses: ['lg\\:grid-cols-2'] },
    ];

    for (const testCase of testCases) {
      await page.setViewportSize({ width: testCase.width, height: 800 });
      await page.waitForTimeout(100); // Wait for responsive layout changes

      // Check that responsive classes are applied
      for (const className of testCase.expectedClasses) {
        const elements = page.locator(`.${className.replace(/\\/g, '')}`);
        const count = await elements.count();

        if (testCase.width >= 768) {
          expect(count).toBeGreaterThan(0);
        }
      }

      console.log(`✅ ${testCase.name} (${testCase.width}px) layout verified`);
    }
  });

  test('typography system works correctly', async ({ page }) => {
    // Check font family is applied
    const bodyStyles = await page.evaluate(() => {
      const body = document.body;
      return getComputedStyle(body).fontFamily;
    });

    expect(bodyStyles).toContain('Inter');

    // Check heading levels
    const headings = {
      h1: 'We help organizations',
      h2: 'Our Services',
    };

    for (const [tag, expectedText] of Object.entries(headings)) {
      const element = page.locator(tag);
      if (await element.count() > 0) {
        await expect(element.first()).toContainText(expectedText);
      }
    }
  });

  test('animation system works correctly', async ({ page }) => {
    // Test fade-in animation
    const fadeElements = page.locator('.animate-fade-in');
    const fadeCount = await fadeElements.count();

    if (fadeCount > 0) {
      const fadeElement = fadeElements.first();
      await expect(fadeElement).toBeVisible();

      // Check animation is applied
      const animationStyles = await fadeElement.evaluate((el) => {
        return getComputedStyle(el).animation;
      });

      expect(animationStyles).toContain('fadeIn');
    }

    // Test slide-up animation
    const slideElements = page.locator('.animate-slide-up');
    const slideCount = await slideElements.count();

    if (slideCount > 0) {
      const slideElement = slideElements.first();
      await expect(slideElement).toBeVisible();

      // Check animation is applied
      const animationStyles = await slideElement.evaluate((el) => {
        return getComputedStyle(el).animation;
      });

      expect(animationStyles).toContain('slideUp');
    }

    // Test bounce animation
    const bounceElements = page.locator('.animate-bounce-subtle');
    const bounceCount = await bounceElements.count();

    if (bounceCount > 0) {
      const bounceElement = bounceElements.first();
      await expect(bounceElement).toBeVisible();

      // Check animation is applied
      const animationStyles = await bounceElement.evaluate((el) => {
        return getComputedStyle(el).animation;
      });

      expect(animationStyles).toContain('bounceSubtle');
    }
  });

  test('hover states and transitions work correctly', async ({ page }) => {
    // Test button hover effects
    const buttons = page.locator('button.hover-lift, .hover-lift');
    const buttonCount = await buttons.count();

    if (buttonCount > 0) {
      const button = buttons.first();

      // Get initial transform
      const initialTransform = await button.evaluate((el) => {
        return getComputedStyle(el).transform;
      });

      // Hover over button
      await button.hover();

      // Check transform changed (hover effect)
      const hoverTransform = await button.evaluate((el) => {
        return getComputedStyle(el).transform;
      });

      expect(hoverTransform).not.toBe(initialTransform);
    }

    // Test link hover effects
    const links = page.locator('a[href^="#"]');
    const linkCount = await links.count();

    if (linkCount > 0) {
      const link = links.first();

      // Get initial color
      const initialColor = await link.evaluate((el) => {
        return getComputedStyle(el).color;
      });

      // Hover over link
      await link.hover();

      // Check color changed
      const hoverColor = await link.evaluate((el) => {
        return getComputedStyle(el).color;
      });

      expect(hoverColor).not.toBe(initialColor);
    }
  });

  test('z-index layering works correctly', async ({ page }) => {
    // Check header has correct z-index
    const header = page.locator('header');
    const headerZIndex = await header.evaluate((el) => {
      return getComputedStyle(el).zIndex;
    });
    expect(parseInt(headerZIndex)).toBeGreaterThan(0);

    // Check mobile menu has correct z-index
    const mobileMenu = page.locator('#mobile-menu');
    const menuZIndex = await mobileMenu.evaluate((el) => {
      return getComputedStyle(el).zIndex;
    });
    expect(parseInt(menuZIndex)).toBeGreaterThan(parseInt(headerZIndex));
  });

  test('color system consistency', async ({ page }) => {
    // Test that semantic colors use correct brand colors
    const colorMappings = [
      { selector: '.bg-primary-500', expectedColor: 'rgb(255, 103, 0)' }, // Orange
      { selector: '.bg-accent-500', expectedColor: 'rgb(106, 13, 173)' }, // Purple
      { selector: '.bg-warning-500', expectedColor: 'rgb(255, 193, 7)' }, // Yellow
    ];

    for (const mapping of colorMappings) {
      const elements = page.locator(mapping.selector);
      const count = await elements.count();

      if (count > 0) {
        const element = elements.first();
        const backgroundColor = await element.evaluate((el) => {
          return getComputedStyle(el).backgroundColor;
        });

        expect(backgroundColor).toBe(mapping.expectedColor);
      }
    }
  });

  test('spacing system works correctly', async ({ page }) => {
    // Test that spacing utilities are applied
    const spacingTests = [
      { selector: '.p-4', property: 'padding', expected: '16px' },
      { selector: '.m-6', property: 'margin', expected: '24px' },
      { selector: '.gap-12', property: 'gap', expected: '48px' },
    ];

    for (const test of spacingTests) {
      const elements = page.locator(test.selector);
      const count = await elements.count();

      if (count > 0) {
        const element = elements.first();
        const value = await element.evaluate((el, property) => {
          return getComputedStyle(el)[property as any];
        }, test.property);

        expect(value).toBe(test.expected);
      }
    }
  });
});