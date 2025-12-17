export interface BrandColors {
  orange: string;
  purple: string;
  yellow: string;
}

export interface ThemeConfig {
  colors: {
    brand: BrandColors;
    gray: Record<string, string>;
    primary: Record<string, string>;
    accent: Record<string, string>;
    warning: Record<string, string>;
  };
  fonts: {
    sans: string[];
  };
  breakpoints: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
}

export interface NavigationItem {
  label: string;
  href: string;
  isActive?: boolean;
}

export interface TrustIndicator {
  value: string;
  label: string;
  color?: string;
}

export interface FeatureCard {
  icon: string;
  title: string;
  description: string;
  color: string;
}

export interface BuildConfig {
  version: string;
  buildTime: Date;
  hash: string;
  environment: 'development' | 'production';
}

export interface ChangelogEntry {
  version: string;
  date: string;
  changes: {
    added?: string[];
    changed?: string[];
    deprecated?: string[];
    removed?: string[];
    fixed?: string[];
    security?: string[];
  };
}

export interface DeployOptions {
  version: 'patch' | 'minor' | 'major' | 'custom';
  customVersion?: string;
  createRelease: boolean;
  createTag: boolean;
  pushToMain: boolean;
  skipTests: boolean;
}

export interface FileInfo {
  path: string;
  hash: string;
  size: number;
  lastModified: Date;
}

export interface BuildOutput {
  files: FileInfo[];
  version: string;
  timestamp: Date;
  hash: string;
}

// DOM Types
export interface MobileMenuElement extends HTMLElement {
  classList: DOMTokenList;
}

export interface NavigationLink extends HTMLAnchorElement {
  href: string;
}

// Event Types
export interface ScrollEvent {
  scrollY: number;
  target: Element;
}

export interface ResizeEvent {
  width: number;
  height: number;
}

// Application State
export interface AppState {
  isMobileMenuOpen: boolean;
  currentSection: string;
  scrollY: number;
  viewport: {
    width: number;
    height: number;
  };
  isLoaded: boolean;
}

// Utility Types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;