/**
 * Unit tests for theme utilities
 *
 * This test suite covers the theme system functionality including brand colors,
 * CSS variable generation, Tailwind configuration, and animation keyframes.
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';

describe('Theme Utilities', () => {
  beforeEach(() => {
    // Mock document and window for CSS testing
    Object.defineProperty(window, 'getComputedStyle', {
      writable: true,
      configurable: true,
      value: jest.fn(() => ({
        getPropertyValue: jest.fn((prop: string) => {
          // Mock some common CSS variables
          const mockValues: Record<string, string> = {
            '--brand-orange': '#ff6b35',
            '--brand-purple': '#4a5568',
            '--brand-yellow': '#f6d55c'
          };
          return mockValues[prop] || '';
        })
      }))
    });

    // Mock document.documentElement
    Object.defineProperty(document, 'documentElement', {
      writable: true,
      configurable: true,
      value: {
        style: {
          setProperty: jest.fn(),
          getPropertyValue: jest.fn((prop: string) => {
            const mockValues: Record<string, string> = {
              '--brand-orange': '#ff6b35',
              '--brand-purple': '#4a5568'
            };
            return mockValues[prop] || '';
          })
        }
      }
    });
  });

  describe('Brand Colors', () => {
    it('should export consistent brand color definitions', async () => {
      const { BRAND_COLORS } = await import('@/utils/theme');

      expect(BRAND_COLORS).toHaveProperty('orange', '#FF6700');
      expect(BRAND_COLORS).toHaveProperty('purple', '#6A0DAD');
      expect(BRAND_COLORS).toHaveProperty('yellow', '#FFC107');
    });

    it('should have valid hex color formats', async () => {
      const { BRAND_COLORS } = await import('@/utils/theme');

      Object.values(BRAND_COLORS).forEach(color => {
        expect(color).toMatch(/^#[0-9a-fA-F]{6}$/); // Valid hex color format
      });
    });
  });

  describe('CSS Variables', () => {
    it('should generate CSS variables string', async () => {
      const { generateCSSVariables } = await import('@/utils/theme');

      const cssVars = generateCSSVariables();

      expect(typeof cssVars).toBe('string');
      expect(cssVars).toContain('--brand-orange');
      expect(cssVars).toContain('--brand-purple');
      expect(cssVars).toContain('--brand-yellow');
      expect(cssVars).toContain('#FF6700'); // orange hex
    });

    it('should include all brand colors in CSS variables', async () => {
      const { CSS_VARIABLES, generateCSSVariables } = await import('@/utils/theme');

      const cssVars = generateCSSVariables();
      expect(cssVars).toContain('--brand-orange: #FF6700');
      expect(cssVars).toContain('--brand-purple: #6A0DAD');
      expect(cssVars).toContain('--brand-yellow: #FFC107');
    });
  });

  describe('Animation Keyframes', () => {
    it('should contain slide-up animation keyframes', async () => {
      const { ANIMATION_KEYFRAMES } = await import('@/utils/theme');

      expect(ANIMATION_KEYFRAMES).toHaveProperty('slideUp');
      expect(ANIMATION_KEYFRAMES.slideUp).toHaveProperty('0%');
      expect(ANIMATION_KEYFRAMES.slideUp).toHaveProperty('100%');
      expect(ANIMATION_KEYFRAMES.slideUp['0%']).toHaveProperty('opacity', '0');
      expect(ANIMATION_KEYFRAMES.slideUp['0%']).toHaveProperty('transform', 'translateY(20px)');
      expect(ANIMATION_KEYFRAMES.slideUp['100%']).toHaveProperty('opacity', '1');
      expect(ANIMATION_KEYFRAMES.slideUp['100%']).toHaveProperty('transform', 'translateY(0)');
    });

    it('should contain fade-in animation keyframes', async () => {
      const { ANIMATION_KEYFRAMES } = await import('@/utils/theme');

      expect(ANIMATION_KEYFRAMES).toHaveProperty('fadeIn');
      expect(ANIMATION_KEYFRAMES.fadeIn).toHaveProperty('0%');
      expect(ANIMATION_KEYFRAMES.fadeIn).toHaveProperty('100%');
      expect(ANIMATION_KEYFRAMES.fadeIn['0%']).toHaveProperty('opacity', '0');
      expect(ANIMATION_KEYFRAMES.fadeIn['100%']).toHaveProperty('opacity', '1');
    });

    it('should contain bounce-subtle animation keyframes', async () => {
      const { ANIMATION_KEYFRAMES } = await import('@/utils/theme');

      expect(ANIMATION_KEYFRAMES).toHaveProperty('bounceSubtle');
      expect(ANIMATION_KEYFRAMES.bounceSubtle).toHaveProperty('0%, 20%, 53%, 80%, 100%');
      expect(ANIMATION_KEYFRAMES.bounceSubtle['0%, 20%, 53%, 80%, 100%']).toHaveProperty('transform', 'translate3d(0,0,0)');
    });
  });

  describe('Theme Configuration', () => {
    it('should export theme configuration with proper structure', async () => {
      const { THEME_CONFIG } = await import('@/utils/theme');

      expect(THEME_CONFIG).toHaveProperty('colors');
      expect(THEME_CONFIG).toHaveProperty('fonts');
      expect(THEME_CONFIG).toHaveProperty('breakpoints');
    });

    it('should include brand colors in theme config', async () => {
      const { THEME_CONFIG } = await import('@/utils/theme');

      expect(THEME_CONFIG.colors).toHaveProperty('brand');
      expect(THEME_CONFIG.colors.brand).toHaveProperty('orange', '#FF6700');
      expect(THEME_CONFIG.colors.brand).toHaveProperty('purple', '#6A0DAD');
      expect(THEME_CONFIG.colors.brand).toHaveProperty('yellow', '#FFC107');
    });

    it('should include custom animations in theme config', async () => {
      const { ANIMATION_KEYFRAMES } = await import('@/utils/theme');

      expect(ANIMATION_KEYFRAMES).toHaveProperty('slideUp');
      expect(ANIMATION_KEYFRAMES).toHaveProperty('fadeIn');
      expect(ANIMATION_KEYFRAMES).toHaveProperty('bounceSubtle');
    });
  });

  describe('Z Index and Transitions', () => {
    it('should export consistent z-index values', async () => {
      const { Z_INDEX } = await import('@/utils/theme');

      expect(Z_INDEX).toHaveProperty('header', 50);
      expect(Z_INDEX).toHaveProperty('dropdown', 40);
      expect(Z_INDEX).toHaveProperty('modal', 100);
      expect(Z_INDEX).toHaveProperty('tooltip', 200);
    });

    it('should have logically ordered z-index values', async () => {
      const { Z_INDEX } = await import('@/utils/theme');

      expect(Z_INDEX.dropdown).toBeLessThan(Z_INDEX.header);
      expect(Z_INDEX.header).toBeLessThan(Z_INDEX.modal);
      expect(Z_INDEX.modal).toBeLessThan(Z_INDEX.tooltip);
    });

    it('should export transition durations and easings', async () => {
      const { TRANSITIONS } = await import('@/utils/theme');

      expect(TRANSITIONS).toHaveProperty('fast', '0.15s ease');
      expect(TRANSITIONS).toHaveProperty('normal', '0.2s ease');
      expect(TRANSITIONS).toHaveProperty('slow', '0.3s ease');
    });
  });

  describe('Tailwind Configuration Generation', () => {
    it('should generate valid Tailwind configuration', async () => {
      const { generateTailwindConfig } = await import('@/utils/theme');

      const config = generateTailwindConfig();

      expect(config).toHaveProperty('content');
      expect(config).toHaveProperty('theme');
      expect(config).toHaveProperty('plugins');
      expect(Array.isArray(config.content)).toBe(true);
    });

    it('should include proper content patterns in Tailwind config', async () => {
      const { generateTailwindConfig } = await import('@/utils/theme');

      const config = generateTailwindConfig();
      const contentPatterns = config.content;

      expect(contentPatterns).toContain('./src/**/*.{js,ts,jsx,tsx}');
      expect(contentPatterns).toContain('./index.html');
      expect(contentPatterns).toContain('./docs/**/*.{js,ts,jsx,tsx,html}');
    });
  });
});