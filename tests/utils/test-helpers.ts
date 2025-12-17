import { test, expect, Page, BrowserContext } from '@playwright/test';

/**
 * Test helper utilities for Playwright tests
 */

export class TestHelpers {
  /**
   * Wait for all images to load on the page
   */
  static async waitForImagesToLoad(page: Page): Promise<void> {
    const images = page.locator('img');
    const imageCount = await images.count();

    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      await img.waitForElementState('stable');

      // Wait for image to load
      const isLoaded = await img.evaluate((img: HTMLImageElement) => {
        return img.complete && img.naturalWidth > 0;
      });

      if (!isLoaded) {
        await img.waitForFunction((img: HTMLImageElement) => {
          return img.complete && img.naturalWidth > 0;
        }, { timeout: 10000 });
      }
    }
  }

  /**
   * Get viewport size for testing
   */
  static getViewportSizes() {
    return [
      { width: 375, height: 667, name: 'Mobile' },
      { width: 768, height: 1024, name: 'Tablet' },
      { width: 1280, height: 720, name: 'Desktop' },
      { width: 1920, height: 1080, name: 'Large Desktop' },
    ];
  }

  /**
   * Test responsive behavior across different viewports
   */
  static async testResponsiveBehavior(
    page: Page,
    testFn: (page: Page, viewport: { width: number; height: number; name: string }) => Promise<void>
  ): Promise<void> {
    const viewports = this.getViewportSizes();

    for (const viewport of viewports) {
      console.log(`📱 Testing ${viewport.name} (${viewport.width}x${viewport.height})`);
      await page.setViewportSize(viewport);
      await page.waitForTimeout(200); // Wait for layout changes
      await testFn(page, viewport);
    }
  }

  /**
   * Check for console errors
   */
  static async checkConsoleErrors(page: Page): Promise<void> {
    const consoleErrors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(`Console Error: ${msg.text()}`);
      }
    });

    await page.waitForLoadState('networkidle');

    if (consoleErrors.length > 0) {
      throw new Error(`Console errors found:\n${consoleErrors.join('\n')}`);
    }
  }

  /**
   * Get accessibility violations using Axe
   */
  static async getAccessibilityViolations(page: Page) {
    const AxeBuilder = require('@axe-core/playwright').AxeBuilder;
    const results = await new AxeBuilder({ page }).analyze();
    return results.violations;
  }

  /**
   * Measure performance metrics
   */
  static async getPerformanceMetrics(page: Page) {
    return await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
        firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0,
        totalTransferSize: performance.getEntriesByType('resource')
          .reduce((sum: number, resource: any) => sum + (resource.transferSize || 0), 0),
        resourceCount: performance.getEntriesByType('resource').length,
      };
    });
  }

  /**
   * Take screenshots with consistent naming
   */
  static async takeScreenshot(page: Page, name: string): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    await page.screenshot({
      path: `test-results/screenshots/${name}-${timestamp}.png`,
      fullPage: true,
    });
  }

  /**
   * Simulate network conditions
   */
  static async simulateNetworkConditions(page: Page, conditions: {
    offline?: boolean;
    downloadThroughput?: number;
    uploadThroughput?: number;
    latency?: number;
  } = {}): Promise<void> {
    const context = page.context();

    if (conditions.offline) {
      await context.setOffline(true);
      return;
    }

    if (conditions.downloadThroughput || conditions.uploadThroughput || conditions.latency) {
      await context.route('**/*', async (route) => {
        // Simple simulation - in real implementation you'd use Chrome DevTools Protocol
        await route.continue();
      });
    }
  }

  /**
   * Get all interactive elements on the page
   */
  static async getInteractiveElements(page: Page) {
    return await page.locator(`
      button:not([disabled]),
      a[href],
      input:not([disabled]),
      select:not([disabled]),
      textarea:not([disabled]),
      [role="button"]:not([aria-disabled="true"]),
      [tabindex]:not([tabindex="-1"])
    `).all();
  }

  /**
   * Test keyboard navigation
   */
  static async testKeyboardNavigation(page: Page): Promise<void> {
    const interactiveElements = await this.getInteractiveElements(page);

    // Press Tab through all interactive elements
    for (let i = 0; i < Math.min(interactiveElements.length, 10); i++) {
      await page.keyboard.press('Tab');

      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();

      // Test Enter key on focused element
      if (i % 3 === 0) { // Test every 3rd element
        await page.keyboard.press('Enter');
        await page.waitForTimeout(100);
      }
    }
  }

  /**
   * Generate test report data
   */
  static generateTestReport(testResults: any[]): string {
    const totalTests = testResults.length;
    const passedTests = testResults.filter(test => test.status === 'passed').length;
    const failedTests = testResults.filter(test => test.status === 'failed').length;
    const skippedTests = testResults.filter(test => test.status === 'skipped').length;

    return `
# Test Report

## Summary
- **Total Tests**: ${totalTests}
- **Passed**: ${passedTests} ✅
- **Failed**: ${failedTests} ❌
- **Skipped**: ${skippedTests} ⏭️
- **Success Rate**: ${((passedTests / totalTests) * 100).toFixed(1)}%

## Failed Tests
${testResults.filter(test => test.status === 'failed')
  .map(test => `- ${test.title}: ${test.error}`)
  .join('\n')}

## Timestamp
${new Date().toISOString()}
    `.trim();
  }
}

/**
 * Custom test matchers
 */
export const customMatchers = {
  toHaveBrandColor: async (page: Page, color: string) => {
    const elements = page.locator(`[style*="${color}"], .text-${color}, .bg-${color}`);
    const count = await elements.count();
    return {
      pass: count > 0,
      message: () => `Expected to find elements with brand color ${color}`,
    };
  },

  toBeResponsive: async (page: Page) => {
    const viewports = TestHelpers.getViewportSizes();
    let isResponsive = true;
    const issues: string[] = [];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.waitForTimeout(100);

      try {
        // Check if main content is still visible
        const mainContent = page.locator('main, h1');
        await expect(mainContent.first()).toBeVisible();
      } catch (error) {
        isResponsive = false;
        issues.push(`${viewport.name} (${viewport.width}x${viewport.height}): ${error}`);
      }
    }

    return {
      pass: isResponsive,
      message: () => isResponsive
        ? 'Page is responsive across all viewports'
        : `Responsive issues found:\n${issues.join('\n')}`,
    };
  },
};

/**
 * Test data fixtures
 */
export const testData = {
  brandColors: {
    orange: '#FF6700',
    purple: '#6A0DAD',
    yellow: '#FFC107',
  },

  navigationItems: [
    { label: 'Services', href: '#services' },
    { label: 'About', href: '#about' },
    { label: 'Contact', href: '#contact' },
  ],

  viewports: TestHelpers.getViewportSizes(),

  performanceThresholds: {
    maxLoadTime: 3000,
    maxFirstContentfulPaint: 1500,
    maxTotalSize: 1024 * 1024, // 1MB
  },
};

/**
 * Mock data generators
 */
export class MockDataGenerator {
  static generateUserData() {
    return {
      name: 'Test User',
      email: 'test@example.com',
      company: 'Test Company',
    };
  }

  static generateFormData() {
    return {
      name: 'Test Name',
      email: 'test@example.com',
      message: 'This is a test message',
    };
  }

  static generatePerformanceData() {
    return {
      timestamp: new Date().toISOString(),
      metrics: {
        lcp: Math.random() * 2000 + 500,
        fid: Math.random() * 100 + 10,
        cls: Math.random() * 0.1,
      },
    };
  }
}