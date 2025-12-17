/**
 * Unit tests for DCVSApp main application class
 *
 * This test suite covers the core application functionality including
 * initialization, state management, and public API methods.
 */

import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { mockElement } from './setup';

describe('DCVSApp', () => {
  let mockDocument: any;
  let mockWindow: any;

  beforeEach(() => {
    // Mock individual document methods instead of replacing the whole object
    mockDocument = {
      getElementById: jest.fn(),
      querySelector: jest.fn(),
      querySelectorAll: jest.fn(() => []),
      addEventListener: jest.fn(),
      readyState: 'complete',
    };

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

    // Mock document methods using jest.fn()
    document.getElementById = mockDocument.getElementById;
    document.querySelector = mockDocument.querySelector;
    document.querySelectorAll = mockDocument.querySelectorAll;
    document.addEventListener = mockDocument.addEventListener;
    Object.defineProperty(document, 'readyState', {
      writable: true,
      value: 'complete',
    });

    // Mock window properties
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      value: 1024,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      value: 768,
    });
    Object.defineProperty(window, 'pageYOffset', {
      writable: true,
      value: 0,
    });
    Object.defineProperty(window, 'pageXOffset', {
      writable: true,
      value: 0,
    });
    window.addEventListener = mockWindow.addEventListener;
    window.matchMedia = mockWindow.matchMedia;
    window.getComputedStyle = mockWindow.getComputedStyle;

    // Mock console to avoid noise
    global.console = {
      warn: jest.fn(),
      log: jest.fn(),
      error: jest.fn(),
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

      // Attempting to modify the frozen state should throw an error
      expect(() => {
        (state as any).isMobileMenuOpen = true;
      }).toThrow();

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
      Object.defineProperty(window, 'innerWidth', { value: 375 });
      Object.defineProperty(window, 'innerHeight', { value: 667 });
      window.matchMedia = jest.fn(() => ({ matches: true, media: '(max-width: 768px)' }));

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