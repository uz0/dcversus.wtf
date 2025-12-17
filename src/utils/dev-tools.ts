/**
 * Development Tools and Utilities
 *
 * These utilities are only available in development mode and help with debugging,
 * performance monitoring, and development workflow.
 */

export class DevTools {
  private static isDevelopment = process.env.NODE_ENV === 'development';

  /**
   * Log performance metrics
   */
  static logPerformance(): void {
    if (!this.isDevelopment) return;

    const metrics = this.getPerformanceMetrics();
    console.log('🚀 Performance Metrics:', metrics);

    // Log Core Web Vitals
    this.logCoreWebVitals();
  }

  /**
   * Get performance metrics
   */
  private static getPerformanceMetrics() {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

    return {
      // Navigation timing
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
      totalTime: navigation.loadEventEnd - navigation.navigationStart,

      // Resource timing
      resources: performance.getEntriesByType('resource').length,
      totalSize: performance.getEntriesByType('resource')
        .reduce((sum, resource: any) => sum + (resource.transferSize || 0), 0),

      // Memory usage (if available)
      memory: (performance as any).memory ? {
        used: Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024 * 100) / 100,
        total: Math.round((performance as any).memory.totalJSHeapSize / 1024 / 1024 * 100) / 100,
        limit: Math.round((performance as any).memory.jsHeapSizeLimit / 1024 / 1024 * 100) / 100,
      } : null,
    };
  }

  /**
   * Log Core Web Vitals
   */
  private static logCoreWebVitals(): void {
    // Largest Contentful Paint
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      console.log(`🎯 LCP: ${Math.round(lastEntry.startTime)}ms`);
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // First Input Delay
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const fid = entries[0].processingStart - entries[0].startTime;
      console.log(`⚡ FID: ${Math.round(fid)}ms`);
    }).observe({ entryTypes: ['first-input'] });

    // Cumulative Layout Shift
    let clsValue = 0;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as any[]) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      }
      console.log(`📐 CLS: ${clsValue.toFixed(3)}`);
    }).observe({ entryTypes: ['layout-shift'] });
  }

  /**
   * Debug theme system
   */
  static debugThemeSystem(): void {
    if (!this.isDevelopment) return;

    console.log('🎨 Theme System Debug:');
    console.log('Brand Colors:', {
      orange: getComputedStyle(document.documentElement).getPropertyValue('--brand-orange'),
      purple: getComputedStyle(document.documentElement).getPropertyValue('--brand-purple'),
      yellow: getComputedStyle(document.documentElement).getPropertyValue('--brand-yellow'),
    });

    // Log all CSS custom properties
    const rootStyles = getComputedStyle(document.documentElement);
    const cssVars: Record<string, string> = {};

    for (let i = 0; i < rootStyles.length; i++) {
      const property = rootStyles[i];
      if (property.startsWith('--')) {
        cssVars[property] = rootStyles.getPropertyValue(property);
      }
    }

    console.log('🎯 CSS Variables:', cssVars);
  }

  /**
   * Create a debug panel
   */
  static createDebugPanel(): void {
    if (!this.isDevelopment) return;

    const panel = document.createElement('div');
    panel.id = 'dev-debug-panel';
    panel.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 10px;
      border-radius: 8px;
      font-family: monospace;
      font-size: 12px;
      z-index: 9999;
      max-width: 300px;
    `;

    const metrics = this.getPerformanceMetrics();
    panel.innerHTML = `
      <div style="margin-bottom: 8px; font-weight: bold;">🛠️ Dev Panel</div>
      <div>Load Time: ${metrics.totalTime}ms</div>
      <div>Resources: ${metrics.resources}</div>
      <div>Size: ${(metrics.totalSize / 1024).toFixed(1)}KB</div>
      ${metrics.memory ? `<div>Memory: ${metrics.memory.used}MB</div>` : ''}
      <div style="margin-top: 8px;">
        <button onclick="window.DEV_TOOLS.logPerformance()" style="margin-right: 5px;">📊 Metrics</button>
        <button onclick="window.DEV_TOOLS.debugThemeSystem()" style="margin-right: 5px;">🎨 Theme</button>
        <button onclick="this.parentElement.parentElement.remove()">❌</button>
      </div>
    `;

    document.body.appendChild(panel);

    // Make methods globally available
    (window as any).DEV_TOOLS = {
      logPerformance: () => this.logPerformance(),
      debugThemeSystem: () => this.debugThemeSystem(),
    };
  }

  /**
   * Analyze bundle size
   */
  static analyzeBundleSize(): void {
    if (!this.isDevelopment) return;

    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    const bundles = resources.filter(r => r.name.includes('.js') || r.name.includes('.css'));

    console.log('📦 Bundle Analysis:');
    bundles.forEach(bundle => {
      const size = bundle.transferSize || 0;
      const sizeKB = (size / 1024).toFixed(1);
      const loadTime = bundle.duration.toFixed(0);

      console.log(`  ${bundle.name.split('/').pop()}: ${sizeKB}KB (${loadTime}ms)`);
    });

    const totalSize = bundles.reduce((sum, bundle) => sum + (bundle.transferSize || 0), 0);
    console.log(`  Total: ${(totalSize / 1024).toFixed(1)}KB`);
  }

  /**
   * Check accessibility on the fly
   */
  static quickAccessibilityCheck(): void {
    if (!this.isDevelopment) return;

    console.log('♿ Quick Accessibility Check:');

    // Check for alt text
    const imagesWithoutAlt = document.querySelectorAll('img:not([alt])');
    if (imagesWithoutAlt.length > 0) {
      console.warn(`  ⚠️ ${imagesWithoutAlt.length} images missing alt text`);
    }

    // Check for proper heading structure
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    console.log(`  📝 Found ${headings.length} headings`);

    // Check for focusable elements
    const focusableElements = document.querySelectorAll(
      'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled])'
    );
    console.log(`  🎯 Found ${focusableElements.length} focusable elements`);

    // Check for ARIA labels
    const elementsWithAria = document.querySelectorAll('[aria-label], [aria-labelledby], [role]');
    console.log(`  🏷️ Found ${elementsWithAria.length} elements with ARIA attributes`);
  }

  /**
   * Generate performance report
   */
  static generatePerformanceReport(): void {
    if (!this.isDevelopment) return;

    const report = {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      metrics: this.getPerformanceMetrics(),
      resources: performance.getEntriesByType('resource').length,
      domNodes: document.querySelectorAll('*').length,
      images: document.querySelectorAll('img').length,
      links: document.querySelectorAll('a').length,
    };

    console.log('📊 Performance Report:', report);

    // Also store in localStorage for later analysis
    localStorage.setItem('dev-performance-report', JSON.stringify(report));
  }

  /**
   * Monitor network requests
   */
  static monitorNetworkRequests(): void {
    if (!this.isDevelopment) return;

    const originalFetch = window.fetch;
    const requests: Array<{ url: string; method: string; status?: number; duration: number }> = [];

    window.fetch = async (...args) => {
      const start = performance.now();
      const [url, options] = args;
      const method = options?.method || 'GET';

      try {
        const response = await originalFetch(...args);
        const duration = performance.now() - start;

        requests.push({
          url: typeof url === 'string' ? url : url.toString(),
          method,
          status: response.status,
          duration,
        });

        return response;
      } catch (error) {
        const duration = performance.now() - start;

        requests.push({
          url: typeof url === 'string' ? url : url.toString(),
          method,
          duration,
        });

        throw error;
      }
    };

    // Log network summary every 10 requests
    setInterval(() => {
      if (requests.length > 0) {
        const avgDuration = requests.reduce((sum, req) => sum + req.duration, 0) / requests.length;
        const errors = requests.filter(req => !req.status || req.status >= 400).length;

        console.log(`🌐 Network: ${requests.length} requests, ${avgDuration.toFixed(0)}ms avg, ${errors} errors`);

        // Keep only last 50 requests
        if (requests.length > 50) {
          requests.splice(0, requests.length - 50);
        }
      }
    }, 10000);

    // Make network data available globally
    (window as any).DEV_NETWORK = {
      getRequests: () => [...requests],
      clear: () => requests.length = 0,
    };
  }

  /**
   * Initialize all dev tools
   */
  static initialize(): void {
    if (!this.isDevelopment) return;

    console.log('🛠️ Initializing Development Tools...');

    // Auto-log performance after page load
    setTimeout(() => {
      this.logPerformance();
      this.analyzeBundleSize();
    }, 2000);

    // Create debug panel
    this.createDebugPanel();

    // Start network monitoring
    this.monitorNetworkRequests();

    // Add keyboard shortcuts
    this.setupKeyboardShortcuts();

    console.log('✅ Development Tools initialized');
    console.log('🎮 Keyboard shortcuts:');
    console.log('  Ctrl+Shift+P: Performance Report');
    console.log('  Ctrl+Shift+T: Theme Debug');
    console.log('  Ctrl+Shift+A: Accessibility Check');
    console.log('  Ctrl+Shift+B: Bundle Analysis');
  }

  /**
   * Setup keyboard shortcuts for dev tools
   */
  private static setupKeyboardShortcuts(): void {
    document.addEventListener('keydown', (event) => {
      if (event.ctrlKey && event.shiftKey) {
        switch (event.key) {
          case 'P':
            event.preventDefault();
            this.generatePerformanceReport();
            break;
          case 'T':
            event.preventDefault();
            this.debugThemeSystem();
            break;
          case 'A':
            event.preventDefault();
            this.quickAccessibilityCheck();
            break;
          case 'B':
            event.preventDefault();
            this.analyzeBundleSize();
            break;
        }
      }
    });
  }
}

// Auto-initialize in development mode
if (typeof window !== 'undefined') {
  DevTools.initialize();
}