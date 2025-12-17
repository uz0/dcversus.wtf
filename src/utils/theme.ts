import type { ThemeConfig, BrandColors } from '@/types';

export const BRAND_COLORS: BrandColors = {
  orange: '#FF6700',
  purple: '#6A0DAD',
  yellow: '#FFC107',
};

export const THEME_CONFIG: ThemeConfig = {
  colors: {
    brand: BRAND_COLORS,
    gray: {
      50: '#FEFEFE',
      100: '#F9FAFB',
      200: '#F3F4F6',
      300: '#E5E7EB',
      400: '#D1D5DB',
      500: '#9CA3AF',
      600: '#6B7280',
      700: '#374151',
      800: '#1F2937',
      900: '#111827',
    },
    primary: {
      50: '#FFF7ED',
      100: '#FFEDD5',
      200: '#FED7AA',
      300: '#FDBA74',
      400: '#FB923C',
      500: BRAND_COLORS.orange,
      600: '#EA580C',
      700: '#C2410C',
      800: '#9A3412',
      900: '#7C2D12',
    },
    accent: {
      50: '#FAF5FF',
      100: '#F3E8FF',
      200: '#E9D5FF',
      300: '#D8B4FE',
      400: '#C084FC',
      500: BRAND_COLORS.purple,
      600: '#9333EA',
      700: '#7C3AED',
      800: '#6D28D9',
      900: '#5B21B6',
    },
    warning: {
      50: '#FFFBEB',
      100: '#FEF3C7',
      200: '#FDE68A',
      300: '#FCD34D',
      400: '#FBBF24',
      500: BRAND_COLORS.yellow,
      600: '#F59E0B',
      700: '#D97706',
      800: '#B45309',
      900: '#92400E',
    },
  },
  fonts: {
    sans: [
      'Inter',
      'system-ui',
      '-apple-system',
      'BlinkMacSystemFont',
      'Segoe UI',
      'Roboto',
      'Helvetica Neue',
      'Arial',
      'sans-serif',
    ],
  },
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
  },
};

export const CSS_VARIABLES = {
  // Brand colors
  '--brand-orange': BRAND_COLORS.orange,
  '--brand-purple': BRAND_COLORS.purple,
  '--brand-yellow': BRAND_COLORS.yellow,

  // Semantic colors
  '--color-primary': BRAND_COLORS.orange,
  '--color-accent': BRAND_COLORS.purple,
  '--color-warning': BRAND_COLORS.yellow,

  // Typography
  '--font-sans': THEME_CONFIG.fonts.sans.join(', '),

  // Breakpoints
  '--breakpoint-sm': THEME_CONFIG.breakpoints.sm,
  '--breakpoint-md': THEME_CONFIG.breakpoints.md,
  '--breakpoint-lg': THEME_CONFIG.breakpoints.lg,
  '--breakpoint-xl': THEME_CONFIG.breakpoints.xl,
} as const;

export const ANIMATION_KEYFRAMES = {
  fadeIn: {
    '0%': { opacity: '0' },
    '100%': { opacity: '1' },
  },
  slideUp: {
    '0%': { transform: 'translateY(20px)', opacity: '0' },
    '100%': { transform: 'translateY(0)', opacity: '1' },
  },
  bounceSubtle: {
    '0%, 20%, 53%, 80%, 100%': { transform: 'translate3d(0,0,0)' },
    '40%, 43%': { transform: 'translate3d(0, -8px, 0)' },
    '70%': { transform: 'translate3d(0, -4px, 0)' },
    '90%': { transform: 'translate3d(0, -2px, 0)' },
  },
} as const;

export const Z_INDEX = {
  header: 50,
  dropdown: 40,
  modal: 100,
  tooltip: 200,
} as const;

export const TRANSITIONS = {
  fast: '0.15s ease',
  normal: '0.2s ease',
  slow: '0.3s ease',
} as const;

/**
 * Generate CSS custom properties string
 */
export function generateCSSVariables(): string {
  return Object.entries(CSS_VARIABLES)
    .map(([key, value]) => `${key}: ${value};`)
    .join('\n  ');
}

/**
 * Generate Tailwind CSS configuration
 */
export function generateTailwindConfig() {
  return {
    content: [
      './src/**/*.{js,ts,jsx,tsx}',
      './index.html',
      './docs/**/*.{js,ts,jsx,tsx,html}'
    ],
    theme: {
      extend: {
        colors: THEME_CONFIG.colors,
        fontFamily: THEME_CONFIG.fonts,
        animation: {
          'fade-in': 'fadeIn 0.5s ease-in-out',
          'slide-up': 'slideUp 0.6s ease-out',
          'bounce-subtle': 'bounceSubtle 2s infinite',
        },
        keyframes: ANIMATION_KEYFRAMES,
        zIndex: Z_INDEX,
        transitionDuration: {
          fast: '150ms',
          normal: '200ms',
          slow: '300ms',
        },
      },
    },
    plugins: [],
  };
}