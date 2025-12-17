/**
 * Unit tests for DCVSApp main application class
 *
 * This test suite covers the core application functionality including
 * initialization, state management, and public API methods.
 */

import { test, expect } from '@playwright/test';
import { mockElement } from './setup';

test.describe('DCVSApp', () => {
  let mockDocument: any;
  let mockWindow: any;

  test.beforeEach(() => {
    // Mock document methods
    mockDocument = {
      getElementById: jest.fn(),
      querySelector: jest.fn(),
      querySelectorAll: jest.fn(() => []),
      addEventListener: jest.fn(),
      body: {
        appendChild: jest.fn(),
      },
      readyState: 'complete',
    };

    // Mock window methods
    mockWindow = {
      addEventListener: jest.fn(),
      innerWidth: 1024,
      innerHeight: 768,
      pageYOffset: 0,
      pageXOffset: 0,
      matchMedia: jest.fn(() => ({
        matches: false,
        media: '(max-width: 768px)',
        addListener: jest.fn(),
        removeListener: jest.fn(),
      })),
      getComputedStyle: jest.fn(() => ({
        getPropertyValue: jest.fn(() => ''),
      })),
    };

    // Mock global objects
    Object.defineProperty(global, 'document', {
      writable: true,
      configurable: true,
      value: mockDocument,
    });

    Object.defineProperty(global, 'window', {
      writable: true,
      configurable: true,
      value: mockWindow,
    });

    // Mock IntersectionObserver
    global.IntersectionObserver = jest.fn(() => ({
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn(),
    })) as any;

    // Mock performance
    global.performance = {
      getEntriesByType: jest.fn(() => []),
      mark: jest.fn(),
      measure: jest.fn(),
      now: jest.fn(() => Date.now()),
    } as any;

    // Mock console to avoid noise
    global.console = {
      warn: jest.fn(),
      log: jest.fn(),
      error: jest.fn(),
    } as any;

    // Mock Node environment for crypto
    global.crypto = {
      createHash: jest.fn(() => ({
        update: jest.fn(() => ({
          digest: jest.fn(() => '2ef7bde6029a7a5ad52d7ee0158e2b8f1b8c0e3f8d3e6a1b2c4d5e6f7a8b9c0d1'),
        })),
      })),
    } as any;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Application Initialization', () => {
    it('should initialize with default state', async () => {
      const { default: DCVSApp } = await import('@/main');

      // Mock DOM elements
      mockDocument.getElementById.mockImplementation((id) => {
        if (id === 'mobile-menu-button') return mockElement('button');
        if (id === 'mobile-menu') return mockElement('div');
        return null;
      });

      mockDocument.querySelectorAll.mockReturnValue([]);
      mockDocument.querySelector.mockReturnValue(mockElement('header'));

      const app = new DCVSApp();
      const state = app.getState();

      expect(state.isMobileMenuOpen).toBe(false);
      expect(state.currentSection).toBe('');
      expect(state.scrollY).toBe(0);
      expect(state.viewport.width).toBe(1024);
      expect(state.viewport.height).toBe(768);
      expect(state.isLoaded).toBe(true);
    });

    it('should set up event listeners during initialization', async () => {
      const { default: DCVSApp } = await import('@/main');

      mockDocument.getElementById.mockImplementation((id) => {
        if (id === 'mobile-menu-button') return mockElement('button', { addEventListener: jest.fn() });
        if (id === 'mobile-menu') return mockElement('div', { addEventListener: jest.fn() });
        return null;
      });

      const mockLinks = [
        mockElement('a', { addEventListener: jest.fn() }),
        mockElement('a', { addEventListener: jest.fn() })
      ];
      mockDocument.querySelectorAll.mockReturnValue(mockLinks);
      mockDocument.querySelector.mockReturnValue(mockElement('header'));

      new DCVSApp();

      // Check that window event listeners were added
      expect(mockWindow.addEventListener).toHaveBeenCalledWith('scroll', expect.any(Function));
      expect(mockWindow.addEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
      expect(mockDocument.addEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
    });
  });

  describe('Public API Methods', () => {
    let app: any;

    beforeEach(async () => {
      mockDocument.getElementById.mockImplementation((id) => {
        if (id === 'mobile-menu-button') return mockElement('button', { addEventListener: jest.fn() });
        if (id === 'mobile-menu') return mockElement('div', { addEventListener: jest.fn() });
        return null;
      });

      mockDocument.querySelectorAll.mockReturnValue([]);
      mockDocument.querySelector.mockReturnValue(mockElement('header'));

      const { default: DCVSApp } = await import('@/main');
      app = new DCVSApp();
    });

    it('should provide scrollToSection method', () => {
      expect(typeof app.scrollToSection).toBe('function');
    });

    it('should provide toggleMenu method', () => {
      expect(typeof app.toggleMenu).toBe('function');
    });

    it('should provide getState method', () => {
      expect(typeof app.getState).toBe('function');

      const state = app.getState();
      expect(typeof state).toBe('object');
      expect(Object.isFrozen(state)).toBe(true); // Should be readonly
    });

    it('should return readonly state that cannot be modified', () => {
      const state = app.getState();

      // These operations should not throw errors, but they shouldn't affect the actual state
      expect(() => {
        (state as any).isMobileMenuOpen = true;
      }).not.toThrow();

      // Actual state should remain unchanged
      const freshState = app.getState();
      expect(freshState.isMobileMenuOpen).toBe(false);
    });
  });

  describe('State Management', () => {
    let app: any;

    beforeEach(async () => {
      const mobileButton = mockElement('button');
      const mobileMenu = mockElement('div');

      mockDocument.getElementById.mockImplementation((id) => {
        if (id === 'mobile-menu-button') return mobileButton;
        if (id === 'mobile-menu') return mobileMenu;
        return null;
      });

      mockDocument.querySelectorAll.mockReturnValue([]);
      mockDocument.querySelector.mockReturnValue(mockElement('header'));

      const { default: DCVSApp } = await import('@/main');
      app = new DCVSApp();
    });

    it('should handle mobile menu toggle', () => {
      const initialState = app.getState();
      expect(initialState.isMobileMenuOpen).toBe(false);

      app.toggleMenu();
      const afterToggleState = app.getState();
      expect(afterToggleState.isMobileMenuOpen).toBe(true);

      app.toggleMenu();
      const finalState = app.getState();
      expect(finalState.isMobileMenuOpen).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should handle missing DOM elements gracefully', async () => {
      // Mock all DOM queries to return null/empty
      mockDocument.getElementById.mockReturnValue(null);
      mockDocument.querySelectorAll.mockReturnValue([]);
      mockDocument.querySelector.mockReturnValue(null);

      const { default: DCVSApp } = await import('@/main');

      expect(() => {
        new DCVSApp();
      }).not.toThrow();
    });

    it('should handle invalid scrollToSection selectors', async () => {
      mockDocument.getElementById.mockImplementation((id) => {
        if (id === 'mobile-menu-button') return mockElement('button');
        if (id === 'mobile-menu') return mockElement('div');
        return null;
      });

      mockDocument.querySelectorAll.mockReturnValue([]);
      mockDocument.querySelector.mockReturnValue(mockElement('header'));

      const { default: DCVSApp } = await import('@/main');
      const app = new DCVSApp();

      expect(() => {
        app.scrollToSection('#non-existent');
      }).not.toThrow();
    });
  });

  describe('Environment Detection', () => {
    it('should work in different viewport sizes', async () => {
      // Test mobile viewport
      mockWindow.innerWidth = 375;
      mockWindow.innerHeight = 667;
      mockWindow.matchMedia.mockReturnValue({ matches: true, media: '(max-width: 768px)' });

      mockDocument.getElementById.mockImplementation((id) => {
        if (id === 'mobile-menu-button') return mockElement('button');
        if (id === 'mobile-menu') return mockElement('div');
        return null;
      });

      mockDocument.querySelectorAll.mockReturnValue([]);
      mockDocument.querySelector.mockReturnValue(mockElement('header'));

      const { default: DCVSApp } = await import('@/main');
      const app = new DCVSApp();

      const state = app.getState();
      expect(state.viewport.width).toBe(375);
      expect(state.viewport.height).toBe(667);
    });
  });
});