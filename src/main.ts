import type { AppState } from '@/types';
import { debounce, throttle, scrollToElement, isMobileDevice } from '@/utils/helpers';
// import type { NavigationItem, TrustIndicator, FeatureCard } from '@/types';
// import { isInViewport } from '@/utils/helpers';

/**
 * Main application class for DCVS (Professional Consulting Landing Page)
 *
 * This class manages the entire client-side application including:
 * - Mobile menu navigation and responsive behavior
 * - Smooth scrolling and navigation handling
 * - Scroll-based animations and intersection observers
 * - Viewport management and responsive interactions
 * - State management for UI components
 *
 * @example
 * ```typescript
 * // App is automatically initialized when DOM is ready
 * document.addEventListener('DOMContentLoaded', () => {
 *   new DCVSApp();
 * });
 * ```
 */
class DCVSApp {
  private state: AppState;
  private elements: {
    mobileMenuButton: HTMLElement | null;
    mobileMenu: HTMLElement | null;
    navigationLinks: NodeListOf<HTMLElement>;
    sections: NodeListOf<HTMLElement>;
    header: HTMLElement | null;
  };

  /**
   * Initialize the DCVS application
   *
   * Sets up the initial application state, caches DOM elements,
   * and initializes all core functionality including event listeners,
   * viewport management, and animations.
   */
  constructor() {
    this.state = {
      isMobileMenuOpen: false,
      currentSection: '',
      scrollY: 0,
      viewport: { width: 0, height: 0 },
      isLoaded: false,
    };

    this.elements = {
      mobileMenuButton: document.getElementById('mobile-menu-button'),
      mobileMenu: document.getElementById('mobile-menu'),
      navigationLinks: document.querySelectorAll('a[href^="#"]'),
      sections: document.querySelectorAll('section[id]'),
      header: document.querySelector('header'),
    };

    this.init();
  }

  /**
   * Initialize all application functionality
   *
   * Sets up event listeners, viewport management, intersection observers,
   * and animations. Marks the application as loaded and ready.
   *
   * @private
   */
  private init(): void {
    this.setupEventListeners();
    this.updateViewport();
    this.setupIntersectionObserver();
    this.setupAnimations();

    // Mark as loaded
    this.state.isLoaded = true;
    console.warn('🚀 DCVS App Initialized Successfully');
  }

  /**
   * Set up all event listeners for the application
   *
   * Configures event handlers for mobile menu, navigation, scroll/resize events,
   * keyboard shortcuts, and image loading with appropriate throttling and debouncing.
   *
   * @private
   */
  private setupEventListeners(): void {
    // Mobile menu toggle
    this.elements.mobileMenuButton?.addEventListener('click', this.toggleMobileMenu.bind(this));

    // Navigation links
    this.elements.navigationLinks.forEach(link => {
      link.addEventListener('click', this.handleNavigationClick.bind(this));
    });

    // Scroll events (throttled)
    const throttledScroll = throttle(this.handleScroll.bind(this), 16); // ~60fps
    window.addEventListener('scroll', throttledScroll);

    // Resize events (debounced)
    const debouncedResize = debounce(this.handleResize.bind(this), 250);
    window.addEventListener('resize', debouncedResize);

    // Keyboard navigation
    document.addEventListener('keydown', this.handleKeyboard.bind(this));

    // Prevent layout shift on images load
    document.querySelectorAll('img').forEach(img => {
      img.addEventListener('load', this.handleImageLoad.bind(this));
    });
  }

  private toggleMobileMenu(): void {
    this.state.isMobileMenuOpen = !this.state.isMobileMenuOpen;

    const menu = this.elements.mobileMenu;
    const button = this.elements.mobileMenuButton;

    if (menu && button) {
      menu.classList.toggle('hidden');

      // Update button icon
      const icon = button.querySelector('svg');
      if (icon) {
        if (this.state.isMobileMenuOpen) {
          icon.innerHTML = `
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          `;
        } else {
          icon.innerHTML = `
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
          `;
        }
      }
    }
  }

  private handleNavigationClick(event: Event): void {
    event.preventDefault();
    const link = event.target as HTMLElement;
    const href = link.getAttribute('href');

    if (href && href.startsWith('#')) {
      // Close mobile menu if open
      if (this.state.isMobileMenuOpen) {
        this.toggleMobileMenu();
      }

      // Scroll to section
      scrollToElement(href, -100);
    }
  }

  private handleScroll(): void {
    this.state.scrollY = window.pageYOffset;
    this.updateActiveNavigation();
    this.updateHeaderAppearance();
  }

  private handleResize(): void {
    this.updateViewport();

    // Close mobile menu on resize to desktop
    if (!isMobileDevice() && this.state.isMobileMenuOpen) {
      this.toggleMobileMenu();
    }
  }

  private handleKeyboard(event: KeyboardEvent): void {
    // ESC to close mobile menu
    if (event.key === 'Escape' && this.state.isMobileMenuOpen) {
      this.toggleMobileMenu();
    }

    // '/' for quick navigation (if not in input)
    if (event.key === '/' && !event.ctrlKey && !event.metaKey) {
      const activeElement = document.activeElement;
      const isInput = activeElement?.tagName === 'INPUT' || activeElement?.tagName === 'TEXTAREA';

      if (!isInput) {
        event.preventDefault();
        // Could implement search functionality here
      }
    }
  }

  private handleImageLoad(event: Event): void {
    const img = event.target as HTMLElement;
    img.classList.add('animate-fade-in');
  }

  private updateViewport(): void {
    this.state.viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
    };
  }

  private updateActiveNavigation(): void {
    if (this.elements.sections.length === 0) return;

    const scrollPosition = this.state.scrollY + 100;

    for (const section of this.elements.sections) {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');

      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        if (sectionId && sectionId !== this.state.currentSection) {
          this.state.currentSection = sectionId;
          this.updateNavigationClasses();
        }
        break;
      }
    }
  }

  private updateNavigationClasses(): void {
    this.elements.navigationLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href === `#${this.state.currentSection}`) {
        link.classList.add('text-brand-orange');
        link.classList.remove('text-gray-700');
      } else {
        link.classList.add('text-gray-700');
        link.classList.remove('text-brand-orange');
      }
    });
  }

  private updateHeaderAppearance(): void {
    const header = this.elements.header;
    if (!header) return;

    // Add background blur when scrolled
    if (this.state.scrollY > 10) {
      header.classList.add('shadow-lg');
    } else {
      header.classList.remove('shadow-lg');
    }
  }

  private setupIntersectionObserver(): void {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px',
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-slide-up');
        }
      });
    }, observerOptions);

    // Observe elements that should animate on scroll
    document.querySelectorAll('.animate-on-scroll').forEach(el => {
      observer.observe(el);
    });
  }

  private setupAnimations(): void {
    // Add hover effects to buttons
    document.querySelectorAll('button, .hover-lift').forEach(button => {
      button.addEventListener('mouseenter', () => {
        (button as HTMLElement).style.transform = 'translateY(-2px)';
      });

      button.addEventListener('mouseleave', () => {
        (button as HTMLElement).style.transform = 'translateY(0)';
      });
    });

    // Animate trust counters
    this.animateCounters();
  }

  private animateCounters(): void {
    const counters = document.querySelectorAll('[data-counter]');

    const animateCounter = (counter: HTMLElement) => {
      const target = parseInt(counter.getAttribute('data-counter') || '0');
      const duration = 2000;
      const step = target / (duration / 16);
      let current = 0;

      const timer = setInterval(() => {
        current += step;
        if (current >= target) {
          current = target;
          clearInterval(timer);
        }
        counter.textContent = Math.floor(current).toString();
      }, 16);
    };

    // Start animation when counter is visible
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
          animateCounter(entry.target as HTMLElement);
          entry.target.classList.add('animated');
        }
      });
    });

    counters.forEach(counter => observer.observe(counter));
  }

  // Public API for external usage

  /**
   * Scroll to a specific section of the page
   *
   * Provides smooth scrolling functionality to any DOM element selector
   * with an automatic offset for header navigation.
   *
   * @param selector - CSS selector for the target element
   *
   * @example
   * ```typescript
   * const app = new DCVSApp();
   * app.scrollToSection('#about');
   * app.scrollToSection('.contact-form');
   * ```
   */
  public scrollToSection(selector: string): void {
    scrollToElement(selector, -100);
  }

  /**
   * Toggle the mobile menu open/closed state
   *
   * Programmatically controls the mobile navigation menu visibility.
   * Useful for custom menu triggers or programmatic control.
   *
   * @example
   * ```typescript
   * const app = new DCVSApp();
   * app.toggleMenu(); // Toggle menu state
   * ```
   */
  public toggleMenu(): void {
    this.toggleMobileMenu();
  }

  /**
   * Get the current application state (read-only)
   *
   * Returns a read-only copy of the current application state including
   * mobile menu status, current section, scroll position, viewport dimensions,
   * and loading status.
   *
   * @returns Read-only application state object
   *
   * @example
   * ```typescript
   * const app = new DCVSApp();
   * const state = app.getState();
   * console.log(`Current section: ${state.currentSection}`);
   * console.log(`Mobile menu open: ${state.isMobileMenuOpen}`);
   * ```
   */
  public getState(): Readonly<AppState> {
    return this.state;
  }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new DCVSApp();
});

// Export for external usage
export default DCVSApp;

// Utility functions for global access
declare global {
  interface Window {
    DCVS: {
      scrollTo: (selector: string) => void;
      toggle: (elementId: string) => void;
      setLoading: (button: HTMLButtonElement, loading?: boolean) => void;
    };
  }
}

window.DCVS = {
  scrollTo: (selector: string) => {
    scrollToElement(selector, -100);
  },
  toggle: (elementId: string) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.classList.toggle('hidden');
    }
  },
  setLoading: (button: HTMLButtonElement, loading: boolean = true) => {
    if (loading) {
      button.disabled = true;
      button.dataset.originalText = button.textContent || '';
      button.innerHTML = `
        <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Loading...
      `;
    } else {
      button.disabled = false;
      button.textContent = button.dataset.originalText || 'Get Started';
    }
  },
};