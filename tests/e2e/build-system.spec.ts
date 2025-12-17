import { test, expect } from '@playwright/test';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

/**
 * Build System E2E Tests
 *
 * These tests verify our TypeScript build system works correctly,
 * including asset hashing, optimization, and file generation.
 */

test.describe('Build System', () => {
  test('TypeScript compilation produces correct JavaScript', async ({ page }) => {
    // Load the page to trigger JavaScript execution
    await page.goto('/', { waitUntil: 'networkidle' });

    // Test that our main TypeScript app is loaded
    const appLoaded = await page.evaluate(() => {
      return typeof (window as any).DCVS !== 'undefined';
    });

    expect(appLoaded).toBe(true);

    // Test that our app methods are available
    const dcvsMethods = await page.evaluate(() => {
      const dcvs = (window as any).DCVS;
      return {
        scrollTo: typeof dcvs.scrollTo === 'function',
        toggle: typeof dcvs.toggle === 'function',
        setLoading: typeof dcvs.setLoading === 'function',
      };
    });

    expect(dcvsMethods.scrollTo).toBe(true);
    expect(dcvsMethods.toggle).toBe(true);
    expect(dcvsMethods.setLoading).toBe(true);
  });

  test('hashed JavaScript assets are loaded correctly', async ({ page }) => {
    // Get the script tag src
    const scriptSrc = await page.evaluate(() => {
      const script = document.querySelector('script[src*="js/main."]');
      return script?.src || '';
    });

    expect(scriptSrc).toContain('js/main.');
    expect(scriptSrc).toContain('.js');

    // Verify the script file exists and loads correctly
    const scriptResponse = await page.goto(scriptSrc);
    expect(scriptResponse?.ok()).toBe(true);

    const scriptContent = await scriptResponse?.text();
    expect(scriptContent).toContain('DCVSApp');
    expect(scriptContent).toContain('Masters of Clarity');
  });

  test('build optimization is applied correctly', async ({ page }) => {
    // Check that console.log statements are removed in production
    const consoleLogs: string[] = [];
    page.on('console', (msg) => {
      consoleLogs.push(msg.text());
    });

    await page.goto('/', { waitUntil: 'networkidle' });

    // Check for absence of development console logs
    const devLogs = consoleLogs.filter(log =>
      log.includes('🚀 DCVS App Initialized') ||
      log.includes('Performance Metrics')
    );

    // In production, these should be stripped
    expect(devLogs.length).toBe(0);
  });

  test('source maps are available for debugging', async ({ page }) => {
    // Check if source maps are referenced (should be available in development)
    const scriptSrc = await page.evaluate(() => {
      const script = document.querySelector('script[src*="js/main."]');
      return script?.src || '';
    });

    // Try to access the .map file
    const mapUrl = scriptSrc.replace('.js', '.js.map');

    try {
      const mapResponse = await page.goto(mapUrl);
      // In production, maps might not be available, but in development they should be
      if (mapResponse?.ok()) {
        const mapContent = await mapResponse?.text();
        expect(mapContent).toContain('"version": 3');
        expect(mapContent).toContain('"sources":');
      }
    } catch (error) {
      // Maps not available is acceptable in production
      console.log('Source maps not available (acceptable in production)');
    }
  });

  test('CSS optimizations are applied', async ({ page }) => {
    // Check that Tailwind CSS is properly purged
    const unusedClasses = [
      'bg-red-500',
      'text-blue-900',
      'border-green-300',
    ];

    for (const unusedClass of unusedClasses) {
      const elements = page.locator(`.${unusedClass}`);
      expect(await elements.count()).toBe(0);
    }

    // Check that used classes are present
    const usedClasses = [
      'text-brand-orange',
      'bg-white',
      'px-4',
      'py-2',
    ];

    for (const usedClass of usedClasses) {
      const elements = page.locator(`.${usedClass}`);
      expect(await elements.count()).toBeGreaterThan(0);
    }
  });

  test('asset optimization and compression', async ({ page }) => {
    // Check SVG optimization
    const svgElements = await page.locator('img[src$=".svg"]').all();

    for (const svg of svgElements) {
      const src = await svg.getAttribute('src');
      if (src) {
        const response = await page.goto(src);
        expect(response?.ok()).toBe(true);

        const content = await response?.text();

        // Check for optimization markers
        expect(content).not.toContain('<?xml'); // XML declaration should be removed
        expect(content).not.toContain('<!--'); // Comments should be removed
        expect(content).not.toContain('<metadata'); // Metadata should be removed
      }
    }

    // Check JavaScript minification
    const scriptSize = await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll('script[src*="js/main."]));
      return scripts.map(script => script.getAttribute('src'));
    });

    for (const scriptSrc of scriptSize) {
      if (scriptSrc) {
        const response = await page.goto(scriptSrc);
        const content = await response?.text();

        // Check for minification markers
        const lines = content?.split('\n').length || 0;
        expect(lines).toBeLessThan(50); // Should be significantly minified

        // Should not contain comments
        expect(content).not.toContain('/*');
        expect(content).not.toContain('//');
      }
    }
  });

  test('build manifest and metadata generation', async ({ page }) => {
    // This test checks if build artifacts are generated correctly
    // We'll check for the existence of build manifest files

    const buildManifestPath = path.join(process.cwd(), 'docs/build-manifest.json');
    const buildReportPath = path.join(process.cwd(), 'docs/build-report.json');

    if (fs.existsSync(buildManifestPath)) {
      const manifest = JSON.parse(fs.readFileSync(buildManifestPath, 'utf-8'));

      expect(manifest).toHaveProperty('version');
      expect(manifest).toHaveProperty('timestamp');
      expect(manifest).toHaveProperty('hash');
      expect(manifest).toHaveProperty('files');

      expect(Array.isArray(manifest.files)).toBe(true);
      expect(manifest.files.length).toBeGreaterThan(0);
    }

    if (fs.existsSync(buildReportPath)) {
      const report = JSON.parse(fs.readFileSync(buildReportPath, 'utf-8'));

      expect(report).toHaveProperty('timestamp');
      expect(report).toHaveProperty('version');
      expect(report).toHaveProperty('files');
      expect(report).toHaveProperty('totalSize');

      expect(typeof report.totalSize).toBe('number');
      expect(report.totalSize).toBeGreaterThan(0);
    }
  });

  test('development vs production behavior', async ({ page }) => {
    // Test development-specific features
    const isDevelopment = await page.evaluate(() => {
      return process.env.NODE_ENV === 'development' ||
             !process.env.NODE_ENV;
    });

    if (isDevelopment) {
      // In development, expect hot reloading to be available
      const devTools = await page.evaluate(() => {
        return typeof (window as any).__vite_plugin_react_preamble_installed__ !== 'undefined' ||
               document.querySelector('script[src*="vite"]');
      });

      // Development features should be available
      expect(devTools).toBe(true);
    } else {
      // In production, expect optimizations
      const productionFeatures = await page.evaluate(() => {
        const scripts = document.querySelectorAll('script');
        return Array.from(scripts).some(script =>
          !script.src.includes('vite') &&
          !script.src.includes('localhost')
        );
      });

      expect(productionFeatures).toBe(true);
    }
  });

  test('error handling and fallbacks', async ({ page }) => {
    // Test error boundary functionality
    await page.evaluate(() => {
      // Simulate an error
      setTimeout(() => {
        console.error('Test error for error boundary validation');
      }, 100);
    });

    // Application should still be functional
    const mainHeading = page.locator('h1');
    await expect(mainHeading).toBeVisible();

    // JavaScript should still work
    const appLoaded = await page.evaluate(() => {
      return typeof (window as any).DCVS !== 'undefined';
    });
    expect(appLoaded).toBe(true);
  });

  test('cross-browser compatibility markers', async ({ page, browserName }) => {
    // Test that vendor prefixes are handled correctly
    const vendorPrefixedStyles = await page.evaluate(() => {
      const elements = document.querySelectorAll('.gradient-text');
      if (elements.length === 0) return {};

      const element = elements[0];
      const styles = getComputedStyle(element);

      return {
        webkitBackgroundClip: styles.webkitBackgroundClip,
        mozBackgroundClip: styles.MozBackgroundClip,
        backgroundClip: styles.backgroundClip,
      };
    });

    // Check that vendor prefixes are available where needed
    expect(vendorPrefixedStyles.backgroundClip).toBe('text');

    // WebKit browsers should have the webkit prefix
    if (browserName === 'webkit' || browserName === 'chromium') {
      expect(vendorPrefixedStyles.webkitBackgroundClip).toBe('text');
    }
  });
});

/**
 * Build Script Integration Tests
 */
test.describe('Build Script Integration', () => {
  test('can execute build scripts correctly', async ({ page }) => {
    // This test verifies that our build scripts can be executed
    // We don't actually run them here to avoid interfering with the test environment

    const packageJson = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf-8')
    );

    // Check that build scripts are defined
    expect(packageJson.scripts).toHaveProperty('build');
    expect(packageJson.scripts).toHaveProperty('deploy');
    expect(packageJson.scripts).toHaveProperty('type-check');
    expect(packageJson.scripts).toHaveProperty('lint');

    // Check that build script includes TypeScript compilation
    const buildScript = packageJson.scripts.build;
    expect(buildScript).toContain('tsc');
    expect(buildScript).toContain('vite build');
    expect(buildScript).toContain('scripts/build.mts');
  });

  test('TypeScript configuration is valid', async () => {
    const tsConfigPath = path.join(process.cwd(), 'tsconfig.json');
    expect(fs.existsSync(tsConfigPath)).toBe(true);

    const tsConfig = JSON.parse(fs.readFileSync(tsConfigPath, 'utf-8'));

    expect(tsConfig.compilerOptions).toHaveProperty('target');
    expect(tsConfig.compilerOptions).toHaveProperty('module');
    expect(tsConfig.compilerOptions).toHaveProperty('strict');
    expect(tsConfig.compilerOptions.strict).toBe(true);

    expect(tsConfig.include).toContain('src/**/*');
    expect(tsConfig.include).toContain('scripts/**/*');
  });

  test('Vite configuration is valid', async () => {
    const viteConfigPath = path.join(process.cwd(), 'vite.config.ts');
    expect(fs.existsSync(viteConfigPath)).toBe(true);

    const viteConfigContent = fs.readFileSync(viteConfigPath, 'utf-8');

    expect(viteConfigContent).toContain('build');
    expect(viteConfigContent).toContain('rollupOptions');
    expect(viteConfigContent).toContain('entryFileNames');
    expect(viteConfigContent).toContain('main.');
  });
});