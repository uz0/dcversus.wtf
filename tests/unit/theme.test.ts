/**
 * Unit tests for theme utilities
 *
 * This test suite covers the theme system functionality including brand colors,
 * CSS variable generation, Tailwind configuration, and animation keyframes.
 */

import { describe, it, expect, jest, beforeEach } from '@playwright/test';

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

      expect(BRAND_COLORS).toHaveProperty('orange', '#ff6b35');
      expect(BRAND_COLORS).toHaveProperty('purple', '#4a5568');
      expect(BRAND_COLORS).toHaveProperty('yellow', '#f6d55c');
      expect(BRAND_COLORS).toHaveProperty('slate', '#1a202c');
      expect(BRAND_COLORS).toHaveProperty('white', '#ffffff');
      expect(BRAND_COLORS).toHaveProperty('gray', '#718096');
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
      expect(cssVars).toContain('#ff6b35'); // orange hex
    });

    it('should include all brand colors in CSS variables', async () => {
      const { CSS_VARIABLES } = await import('@/utils/theme');

      expect(CSS_VARIABLES).toContain('--brand-orange: #ff6b35');
      expect(CSS_VARIABLES).toContain('--brand-purple: #4a5568');
      expect(CSS_VARIABLES).toContain('--brand-yellow: #f6d55c');
      expect(CSS_VARIABLES).toContain('--slate: #1a202c');
    });
  });

  describe('Animation Keyframes', () => {
    it('should contain slide-up animation keyframes', async () => {
      const { ANIMATION_KEYFRAMES } = await import('@/utils/theme');

      expect(ANIMATION_KEYFRAMES).toContain('@keyframes slide-up');
      expect(ANIMATION_KEYFRAMES).toContain('from {');
      expect(ANIMATION_KEYFRAMES).toContain('to {');
      expect(ANIMATION_KEYFRAMES).toContain('opacity: 1');
      expect(ANIMATION_KEYFRAMES).toContain('transform: translateY(0)');
    });

    it('should contain fade-in animation keyframes', async () => {
      const { ANIMATION_KEYFRAMES } = await import('@/utils/theme');

      expect(ANIMATION_KEYFRAMES).toContain('@keyframes fade-in');
      expect(ANIMATION_KEYFRAMES).toContain('opacity: 1');
    });

    it('should contain pulse animation keyframes', async () => {
      const { ANIMATION_KEYFRAMES } = await import('@/utils/theme');

      expect(ANIMATION_KEYFRAMES).toContain('@keyframes pulse');
      expect(ANIMATION_KEYFRAMES).toContain('50%');
      expect(ANIMATION_KEYFRAMES).toContain('transform: scale(1.05)');
    });
  });

  describe('Theme Configuration', () => {
    it('should export theme configuration with proper structure', async () => {
      const { THEME_CONFIG } = await import('@/utils/theme');

      expect(THEME_CONFIG).toHaveProperty('extend');
      expect(THEME_CONFIG.extend).toHaveProperty('colors');
      expect(THEME_CONFIG.extend).toHaveProperty('fontFamily');
      expect(THEME_CONFIG.extend).toHaveProperty('animation');
      expect(THEME_CONFIG.extend).toHaveProperty('keyframes');
    });

    it('should include brand colors in theme config', async () => {
      const { THEME_CONFIG } = await import('@/utils/theme');

      expect(THEME_CONFIG.extend.colors).toHaveProperty('brand-orange');
      expect(THEME_CONFIG.extend.colors).toHaveProperty('brand-purple');
      expect(THEME_CONFIG.extend.colors).toHaveProperty('brand-yellow');
      expect(THEME_CONFIG.extend.colors['brand-orange']).toBe('#ff6b35');
    });

    it('should include custom animations in theme config', async () => {
      const { THEME_CONFIG } = await import('@/utils/theme');

      expect(THEME_CONFIG.extend.animation).toHaveProperty('slide-up');
      expect(THEME_CONFIG.extend.animation).toHaveProperty('fade-in');
      expect(THEME_CONFIG.extend.animation).toHaveProperty('pulse');
    });
  });

  describe('Z Index and Transitions', () => {
    it('should export consistent z-index values', async () => {
      const { Z_INDEX } = await import('@/utils/theme');

      expect(Z_INDEX).toHaveProperty('dropdown', 1000);
      expect(Z_INDEX).toHaveProperty('sticky', 1020);
      expect(Z_INDEX).toHaveProperty('fixed', 1030);
      expect(Z_INDEX).toHaveProperty('modal-backdrop', 1040);
      expect(Z_INDEX).toHaveProperty('modal', 1050);
      expect(Z_INDEX).toHaveProperty('popover', 1060);
      expect(Z_INDEX).toHaveProperty('tooltip', 1070);
    });

    it('should have logically ordered z-index values', async () => {
      const { Z_INDEX } = await import('@/utils/theme');

      expect(Z_INDEX.dropdown).toBeLessThan(Z_INDEX.sticky);
      expect(Z_INDEX.sticky).toBeLessThan(Z_INDEX.fixed);
      expect(Z_INDEX.fixed).toBeLessThan(Z_INDEX.modal);
      expect(Z_INDEX.modal).toBeLessThan(Z_INDEX.tooltip);
    });

    it('should export transition durations and easings', async () => {
      const { TRANSITIONS } = await import('@/utils/theme');

      expect(TRANSITIONS).toHaveProperty('duration');
      expect(TRANSITIONS).toHaveProperty('ease');
      expect(TRANSITIONS.duration).toHaveProperty('fast', '150ms');
      expect(TRANSITIONS.duration).toHaveProperty('normal', '300ms');
      expect(TRANSITIONS.duration).toHaveProperty('slow', '500ms');
      expect(TRANSITIONS.ease).toHaveProperty('in-out', 'cubic-bezier(0.4, 0, 0.2, 1)');
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