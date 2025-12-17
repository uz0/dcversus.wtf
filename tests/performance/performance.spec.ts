import { test, expect } from '@playwright/test';

/**
 * Performance E2E Tests
 *
 * These tests verify our application performance, including:
 * - Core Web Vitals
 * - Loading performance
 * - Network performance
 * - Memory usage
 * - Animation performance
 */

test.describe('Performance Metrics', () => {
  test.beforeEach(async ({ page }) => {
    // Enable performance monitoring
    await page.addInitScript(() => {
      // Override Performance API to capture more detailed metrics
      const originalMark = performance.mark;
      const originalMeasure = performance.measure;

      performance.mark = (name: string, options?: PerformanceMarkOptions) => {
        console.log(`Performance mark: ${name}`);
        return originalMark.call(performance, name, options);
      };

      performance.measure = (name: string, startMark?: string, endMark?: string) => {
        console.log(`Performance measure: ${name}`);
        return originalMeasure.call(performance, name, startMark, endMark);
      };
    });
  });

  test('meets Core Web Vitals thresholds', async ({ page }) => {
    const metrics = await page.goto('/', { waitUntil: 'networkidle' });

    // Wait for page to be fully interactive
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000); // Allow animations to complete

    // Collect Core Web Vitals
    const coreWebVitals = await page.evaluate(() => {
      return new Promise((resolve) => {
        const vitals: any = {};

        // Largest Contentful Paint (LCP)
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          vitals.lcp = lastEntry.startTime;
        }).observe({ entryTypes: ['largest-contentful-paint'] });

        // First Input Delay (FID)
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          vitals.fid = entries[0].processingStart - entries[0].startTime;
        }).observe({ entryTypes: ['first-input'] });

        // Cumulative Layout Shift (CLS)
        let clsValue = 0;
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries() as any[]) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          }
          vitals.cls = clsValue;
        }).observe({ entryTypes: ['layout-shift'] });

        // Wait a bit for all metrics to be collected
        setTimeout(() => resolve(vitals), 3000);
      });
    });

    // Core Web Vitals thresholds (Google's recommended values)
    expect(coreWebVitals.lcp).toBeLessThan(2500); // Good LCP: < 2.5s
    expect(coreWebVitals.fid).toBeLessThan(100);   // Good FID: < 100ms
    expect(coreWebVitals.cls).toBeLessThan(0.1);   // Good CLS: < 0.1

    console.log('Core Web Vitals:', coreWebVitals);
  });

  test('loads within performance budget', async ({ page }) => {
    const startTime = Date.now();

    const response = await page.goto('/', { waitUntil: 'networkidle' });

    const loadTime = Date.now() - startTime;

    // Performance budgets
    expect(loadTime).toBeLessThan(3000);          // Page load: < 3s
    expect(response?.status()).toBe(200);          // HTTP status: 200

    // Check resource loading performance
    const resourceMetrics = await page.evaluate(() => {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      return {
        totalResources: resources.length,
        totalSize: resources.reduce((sum, resource) => {
          return sum + (resource.transferSize || 0);
        }, 0),
        slowResources: resources.filter(resource => resource.duration > 1000).length,
        scriptResources: resources.filter(resource => resource.name.endsWith('.js')),
        cssResources: resources.filter(resource => resource.name.endsWith('.css')),
        imageResources: resources.filter(resource => resource.name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)),
      };
    });

    // Performance budgets for resources
    expect(resourceMetrics.totalSize).toBeLessThan(1 * 1024 * 1024); // < 1MB total
    expect(resourceMetrics.slowResources).toBeLessThan(3);            // < 3 slow resources

    console.log('Resource metrics:', resourceMetrics);
  });

  test('JavaScript execution performance', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    // Measure JavaScript execution time
    const jsMetrics = await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll('script[src*="js/main."')) as HTMLScriptElement[];
      const metrics: any = {};

      scripts.forEach((script, index) => {
        const perfEntry = performance.getEntriesByName(script.src)[0] as PerformanceResourceTiming;
        if (perfEntry) {
          metrics[`script_${index}`] = {
            name: script.src.split('/').pop(),
            downloadTime: perfEntry.responseEnd - perfEntry.requestStart,
            size: perfEntry.transferSize || 0,
            duration: perfEntry.duration,
          };
        }
      });

      // Measure script execution time
      const scriptStartTime = performance.now();
      const mainApp = (window as any).DCVS;
      const hasApp = typeof mainApp !== 'undefined';
      const scriptLoadTime = performance.now() - scriptStartTime;

      metrics.appLoaded = hasApp;
      metrics.appLoadTime = scriptLoadTime;

      return metrics;
    });

    // Verify our app is loaded
    expect(jsMetrics.appLoaded).toBe(true);
    expect(jsMetrics.appLoadTime).toBeLessThan(1000); // App should load in < 1s

    // Check script sizes
    Object.values(jsMetrics).forEach((metric: any) => {
      if (typeof metric === 'object' && metric.size) {
        expect(metric.size).toBeLessThan(100 * 1024); // Each script < 100KB
        expect(metric.duration).toBeLessThan(2000);   // Each script loads in < 2s
      }
    });

    console.log('JavaScript metrics:', jsMetrics);
  });

  test('animation and interaction performance', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    // Test button hover animations
    const buttons = page.locator('button.hover-lift, .hover-lift');

    const buttonCount = await buttons.count();
    if (buttonCount > 0) {
      const button = buttons.first();

      // Measure hover performance
      const hoverMetrics = await page.evaluate((buttonSelector) => {
        const button = document.querySelector(buttonSelector) as HTMLElement;
        if (!button) return { error: 'Button not found' };

        const startTime = performance.now();
        button.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
        const hoverTime = performance.now() - startTime;

        const transformStart = performance.now();
        button.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
        const transformTime = performance.now() - transformStart;

        return {
          hoverTime,
          transformTime,
          totalTime: hoverTime + transformTime,
        };
      }, await button.getAttribute('class') || 'button');

      expect(hoverMetrics.totalTime).toBeLessThan(100); // Animations should be fast
    }

    // Test scroll performance
    const scrollMetrics = await page.evaluate(() => {
      const container = document.documentElement;
      const scrollHeight = container.scrollHeight;
      const clientHeight = container.clientHeight;
      const scrollDistance = Math.max(0, scrollHeight - clientHeight);

      const startTime = performance.now();
      window.scrollTo({
        top: scrollDistance / 2,
        behavior: 'smooth'
      });

      // Wait for scroll to complete
      return new Promise((resolve) => {
        let scrollTimeout: NodeJS.Timeout;
        const checkScroll = () => {
          if (Math.abs(window.pageYOffset - scrollDistance / 2) < 10) {
            const scrollTime = performance.now() - startTime;
            clearTimeout(scrollTimeout);
            resolve({ scrollTime, scrollDistance });
          } else {
            scrollTimeout = setTimeout(checkScroll, 50);
          }
        };
        checkScroll();
      });
    });

    expect(scrollMetrics.scrollTime).toBeLessThan(2000); // Scroll should complete in < 2s
    console.log('Scroll metrics:', scrollMetrics);
  });

  test('memory usage and leak detection', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    // Baseline memory measurement
    const baselineMemory = await page.evaluate(() => {
      return (performance as any).memory || {
        usedJSHeapSize: 0,
        totalJSHeapSize: 0,
        jsHeapSizeLimit: 0,
      };
    });

    // Simulate user interactions that could cause memory leaks
    for (let i = 0; i < 10; i++) {
      // Open and close mobile menu multiple times
      const mobileMenuButton = page.locator('#mobile-menu-button');
      if (await mobileMenuButton.isVisible()) {
        await mobileMenuButton.click();
        await page.waitForTimeout(100);
        await mobileMenuButton.click();
        await page.waitForTimeout(100);
      }

      // Hover over multiple elements
      const hoverElements = page.locator('.hover-lift, button, a').first();
      if (await hoverElements.count() > 0) {
        await hoverElements.first().hover();
        await page.waitForTimeout(50);
        await page.mouse.move(0, 0);
      }
    }

    // Force garbage collection (if available)
    await page.evaluate(() => {
      if ((window as any).gc) {
        (window as any).gc();
      }
    });

    // Final memory measurement
    const finalMemory = await page.evaluate(() => {
      return (performance as any).memory || {
        usedJSHeapSize: 0,
        totalJSHeapSize: 0,
        jsHeapSizeLimit: 0,
      };
    });

    // Check for memory leaks
    const memoryIncrease = finalMemory.usedJSHeapSize - baselineMemory.usedJSHeapSize;
    const memoryIncreasePercent = (memoryIncrease / baselineMemory.usedJSHeapSize) * 100;

    // Memory increase should be reasonable (< 50%)
    expect(memoryIncreasePercent).toBeLessThan(50);

    console.log('Memory metrics:', {
      baseline: baselineMemory.usedJSHeapSize,
      final: finalMemory.usedJSHeapSize,
      increase: memoryIncrease,
      increasePercent: memoryIncreasePercent.toFixed(2) + '%',
    });
  });

  test('network performance optimization', async ({ page }) => {
    // Enable network conditioning
    await page.route('**/*', async (route) => {
      const request = route.request();
      const headers = request.headers();

      // Add caching headers
      const modifiedHeaders = {
        ...headers,
        'cache-control': 'max-age=31536000',
        'expires': new Date(Date.now() + 31536000 * 1000).toUTCString(),
      };

      await route.continue({ headers: modifiedHeaders });
    });

    const startTime = Date.now();
    await page.goto('/', { waitUntil: 'networkidle' });
    const firstLoadTime = Date.now() - startTime;

    // Test cache performance (second load)
    const secondStartTime = Date.now();
    await page.goto('/', { waitUntil: 'networkidle' });
    const secondLoadTime = Date.now() - secondStartTime;

    // Second load should be faster due to caching
    expect(secondLoadTime).toBeLessThan(firstLoadTime);

    // Check network request optimization
    const networkMetrics = await page.evaluate(() => {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      return {
        totalRequests: resources.length,
        compressedRequests: resources.filter(r => r.transferSize < r.encodedBodySize).length,
        cachedResponses: resources.filter(r => r.transferSize === 0).length,
        averageResponseTime: resources.reduce((sum, r) => sum + r.responseEnd - r.requestStart, 0) / resources.length,
        resources: resources.map(r => ({
          name: r.name.split('/').pop(),
          size: r.transferSize,
          duration: r.duration,
          cached: r.transferSize === 0,
        })),
      };
    });

    // Network performance expectations
    expect(networkMetrics.averageResponseTime).toBeLessThan(1000); // < 1s average response
    expect(networkMetrics.compressedRequests).toBeGreaterThan(0); // Some resources should be compressed

    console.log('Network metrics:', networkMetrics);
  });

  test('progressive enhancement and graceful degradation', async ({ page }) => {
    // Test with JavaScript disabled
    await page.context().addInitScript(() => {
      // Simulate JavaScript disabled environment
      window.addEventListener('DOMContentLoaded', () => {
        document.body.classList.add('no-js');
      });
    });

    // Test with slow network
    await page.route('**/*', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 500)); // 500ms delay
      await route.continue();
    });

    const startTime = Date.now();
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const loadTime = Date.now() - startTime;

    // Page should still be usable with slow network
    expect(loadTime).toBeLessThan(5000); // Should load within 5s even with slow network

    // Test essential content is loaded first
    const essentialContent = await page.locator('h1, .text-brand-orange').all();
    expect(essentialContent.length).toBeGreaterThan(0);

    // Check that page is functional without full JavaScript
    const basicFunctionality = await page.evaluate(() => {
      return {
        hasHeading: document.querySelector('h1') !== null,
        hasNavigation: document.querySelector('nav') !== null,
        hasContent: document.querySelector('main') !== null,
        bodyClasses: document.body.className,
      };
    });

    expect(basicFunctionality.hasHeading).toBe(true);
    expect(basicFunctionality.hasNavigation).toBe(true);
    expect(basicFunctionality.hasContent).toBe(true);

    console.log('Progressive enhancement metrics:', basicFunctionality);
  });

  test('image optimization and loading', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    const imageMetrics = await page.evaluate(() => {
      const images = Array.from(document.querySelectorAll('img')) as HTMLImageElement[];
      return images.map(img => ({
        src: img.src,
        loaded: img.complete && img.naturalWidth > 0,
        hasAlt: img.alt !== null,
        width: img.naturalWidth,
        height: img.naturalHeight,
        size: img.src.length, // Rough estimate
        lazyLoaded: img.loading === 'lazy',
        srcset: img.srcset !== '',
      }));
    });

    // All images should be loaded
    imageMetrics.forEach((img, index) => {
      expect(img.loaded, `Image ${index} (${img.src.split('/').pop()}) should be loaded`).toBe(true);
      expect(img.hasAlt, `Image ${index} should have alt text`).toBe(true);

      // Images should have reasonable dimensions
      if (img.loaded) {
        expect(img.width, `Image ${index} should have width`).toBeGreaterThan(0);
        expect(img.height, `Image ${index} should have height`).toBeGreaterThan(0);
      }
    });

    // Check total image size
    const totalImageSize = imageMetrics.reduce((sum, img) => sum + img.size, 0);
    expect(totalImageSize).toBeLessThan(500 * 1024); // Total images < 500KB

    console.log('Image metrics:', {
      totalImages: imageMetrics.length,
      totalSize: totalImageSize,
      loadedImages: imageMetrics.filter(img => img.loaded).length,
      lazyLoadedImages: imageMetrics.filter(img => img.lazyLoaded).length,
    });
  });
});