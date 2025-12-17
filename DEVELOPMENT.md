# Development Guide

This comprehensive guide covers everything you need to know about developing, testing, and deploying the DCVS application.

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ or **Bun** 1.0+
- **Git**
- **GitHub CLI (gh)** - for deployment automation
- **Playwright Browsers** - for testing

### Setup Commands

```bash
# Clone and setup
git clone <repository-url>
cd dcversus.wtf

# Install dependencies
bun install

# Install Playwright browsers
npm run test:e2e:install

# Start development server
npm run dev
```

## 📋 Available Commands

### Development Commands

```bash
# Start development server with HMR
npm run dev

# Type checking (src files)
npm run type-check

# Type checking (script files)
npm run type-check:scripts

# All type checking
npm run type-check:all

# ESLint code checking
npm run lint

# Format code with Prettier
npm run format

# Lint and format together
npm run lint && npm run format
```

### Testing Commands

```bash
# Run all E2E tests
npm test

# Run tests with visual interface
npm run test:e2e:ui

# Debug tests step-by-step
npm run test:e2e:debug

# Run tests with verbose output
npm run test:e2e -- --verbose

# Generate HTML test report
npm run test:e2e:report

# Run specific test file
npx playwright test tests/e2e/application.spec.ts

# Run tests in headed mode (show browser)
npx playwright test --headed

# Run tests on specific browser
npx playwright test --project=chromium
npx playwright test --project=webkit
npx playwright test --project=firefox
```

### Build Commands

```bash
# Full build process
npm run build

# Build without type checking
npm run build -- --skip-type-check

# Build without linting
npm run build -- --skip-lint

# Preview production build
npm run preview
```

### Deployment Commands

```bash
# Interactive deployment
npm run deploy

# Patch release (bug fixes)
npm run deploy --patch

# Minor release (new features)
npm run deploy --minor

# Major release (breaking changes)
npm run deploy --major

# Custom version
npm run deploy --version 2.1.0

# Dry run (test deployment process)
npm run deploy --dry-run

# Full CI pipeline
npm run test:ci
```

### Changelog Management

```bash
# Interactive changelog management
npm run changelog

# Add changes to unreleased section
npm run changelog add

# Release current version
npm run changelog release
```

## 🏗️ Project Structure

```
dcversus.wtf/
├── src/                           # TypeScript source files
│   ├── main.ts                    # Main application entry point
│   ├── types/                     # TypeScript type definitions
│   │   └── index.ts               # Central type exports
│   └── utils/                     # Utility functions
│       ├── theme.ts              # Theme system and brand colors
│       ├── helpers.ts            # General helper functions
│       └── dev-tools.ts          # Development utilities
├── scripts/                       # TypeScript automation scripts
│   ├── build.mts                 # Build automation
│   ├── deploy.mts                # Deployment automation
│   ├── changelog.mts             # Changelog management
│   ├── postbuild.mts             # Post-build tasks
│   ├── types.ts                  # Script type definitions
│   └── utils.ts                  # Script utilities
├── tests/                         # Playwright E2E tests
│   ├── e2e/                      # Application tests
│   │   ├── application.spec.ts  # Main functionality tests
│   │   ├── theme-system.spec.ts # Theme system tests
│   │   ├── build-system.spec.ts # Build system tests
│   │   └── visual-regression.spec.ts # Visual regression tests
│   ├── accessibility/            # Accessibility tests
│   │   └── accessibility.spec.ts
│   ├── performance/              # Performance tests
│   │   └── performance.spec.ts
│   ├── utils/                    # Test utilities
│   │   └── test-helpers.ts       # Test helper functions
│   ├── global-setup.ts           # Global test setup
│   └── global-teardown.ts        # Global test teardown
├── docs/                          # Production build output
│   ├── index.html                # Generated HTML file
│   ├── js/                       # Generated JavaScript files
│   ├── *.svg                     # Brand logos
│   └── build-*.json              # Build manifests and reports
├── [config files]                 # Various configuration files
└── [documentation]               # Project documentation
```

## 🎨 Theme System Development

### Using Brand Colors

```typescript
import { BRAND_COLORS, THEME_CONFIG } from '@/utils/theme';

// Use brand colors directly
const primaryColor = BRAND_COLORS.orange; // #FF6700
const accentColor = BRAND_COLORS.purple; // #6A0DAD
const warningColor = BRAND_COLORS.yellow; // #FFC107

// Use theme config for semantic colors
const primaryButtonColor = THEME_CONFIG.colors.primary[500];
const accentButtonColor = THEME_CONFIG.colors.accent[500];
```

### Adding New Colors

1. Update `src/utils/theme.ts`:
```typescript
export const BRAND_COLORS = {
  orange: '#FF6700',
  purple: '#6A0DAD',
  yellow: '#FFC107',
  // Add new color
  green: '#10B981',
};

export const THEME_CONFIG = {
  colors: {
    // Add semantic variations
    success: {
      50: '#ECFDF5',
      500: '#10B981',
      // ... other variations
    },
  },
};
```

2. Update Tailwind config if needed
3. Update documentation and tests

## 🧪 Testing Development

### Writing New Tests

```typescript
import { test, expect } from '@playwright/test';
import { TestHelpers } from '../utils/test-helpers';

test.describe('New Feature', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await TestHelpers.waitForImagesToLoad(page);
  });

  test('basic functionality', async ({ page }) => {
    // Test implementation
  });

  test('responsive behavior', async ({ page }) => {
    await TestHelpers.testResponsiveBehavior(page, async (page, viewport) => {
      // Test specific responsive behavior
    });
  });
});
```

### Test Helper Utilities

```typescript
// Wait for all images to load
await TestHelpers.waitForImagesToLoad(page);

// Test across all viewports
await TestHelpers.testResponsiveBehavior(page, async (page, viewport) => {
  // Your test code
});

// Check for console errors
await TestHelpers.checkConsoleErrors(page);

// Get performance metrics
const metrics = await TestHelpers.getPerformanceMetrics(page);
```

### Debugging Tests

```bash
# Run tests with browser UI
npm run test:e2e:ui

# Run tests in headed mode
npx playwright test --headed

# Debug specific test
npx playwright test --debug tests/e2e/application.spec.ts

# Run tests with traces
npx playwright test --trace on
```

## 🔧 Build System Development

### Build Process Flow

1. **TypeScript Compilation**: Compile src/ files
2. **ESLint Checking**: Code quality validation
3. **Vite Build**: Bundle and optimize assets
4. **HTML Update**: Update index.html with hashed assets
5. **Manifest Generation**: Create build metadata
6. **Package.json Update**: Update with build info

### Build Customization

To modify the build process:

1. Edit `scripts/build.mts` for build logic
2. Edit `vite.config.ts` for Vite configuration
3. Update `tsconfig.json` for TypeScript settings

### Build Error Handling

The build system provides detailed error recovery suggestions:

```bash
# If TypeScript fails
npm run type-check:scripts

# If ESLint fails
npm run lint --fix

# If Vite build fails
rm -rf node_modules && npm install
```

## 🚀 Deployment Development

### Deployment Process

1. **Environment Validation**: Check git, dependencies, GitHub CLI
2. **Version Management**: Semantic versioning with changelog
3. **Build Process**: Compile and optimize assets
4. **Git Operations**: Commit, tag, push
5. **GitHub Integration**: Release creation and PR management

### Deployment Customization

Edit `scripts/deploy.mts` to customize:
- Version bumping logic
- Release notes generation
- PR management
- GitHub integration

### Testing Deployment

```bash
# Test deployment without actual deployment
npm run deploy --dry-run

# Test specific version bump
npm run deploy --patch --dry-run
```

## 🛠️ Development Tools

### Built-in Dev Tools

The application includes comprehensive development tools:

```typescript
// Performance metrics
window.DEV_TOOLS.logPerformance();

// Theme debugging
window.DEV_TOOLS.debugThemeSystem();

// Generate performance report
window.DEV_TOOLS.generatePerformanceReport();

// Quick accessibility check
window.DEV_TOOLS.quickAccessibilityCheck();

// Bundle size analysis
window.DEV_TOOLS.analyzeBundleSize();
```

### Keyboard Shortcuts

- `Ctrl+Shift+P`: Performance Report
- `Ctrl+Shift+T`: Theme Debug
- `Ctrl+Shift+A`: Accessibility Check
- `Ctrl+Shift+B`: Bundle Analysis

### Debug Panel

A floating debug panel appears in development mode showing:
- Load time metrics
- Resource counts
- Memory usage
- Quick action buttons

## 🔍 Performance Optimization

### Performance Monitoring

```typescript
// Monitor Core Web Vitals
import { DevTools } from '@/utils/dev-tools';

// Auto-monitoring is enabled in development
DevTools.logPerformance();

// Generate detailed report
DevTools.generatePerformanceReport();
```

### Performance Targets

- **Largest Contentful Paint (LCP)**: < 2.5s
- **First Input Delay (FID)**: < 100ms
- **Cumulative Layout Shift (CLS)**: < 0.1
- **Total Bundle Size**: < 1MB
- **Image Optimization**: All images compressed

### Bundle Analysis

```bash
# Analyze bundle sizes
npm run build

# Check build report
cat docs/build-report.json

# Monitor during development
# Debug panel shows real-time metrics
```

## ♿ Accessibility Development

### Accessibility Testing

```bash
# Run accessibility tests
npx playwright test tests/accessibility/

# Check specific accessibility rules
npx playwright test --grep "WCAG"

# Test with screen readers
npm run test:e2e:debug
```

### Development Guidelines

- Use semantic HTML
- Provide alt text for all images
- Ensure keyboard navigation
- Use ARIA labels appropriately
- Test with screen readers
- Verify color contrast

## 🐛 Troubleshooting

### Common Issues

**TypeScript Errors:**
```bash
# Check TypeScript configuration
npm run type-check

# Check script files separately
npm run type-check:scripts
```

**Test Failures:**
```bash
# Reinstall Playwright browsers
npm run test:e2e:install

# Clear test cache
rm -rf test-results
```

**Build Failures:**
```bash
# Clean build artifacts
rm -rf docs dist node_modules/.cache

# Reinstall dependencies
npm install
```

**Development Server Issues:**
```bash
# Clear Vite cache
rm -rf node_modules/.vite

# Restart dev server
npm run dev
```

### Getting Help

1. Check console output for detailed error messages
2. Review build logs in terminal
3. Use development tools for debugging
4. Check test reports for failures
5. Review documentation and examples

## 📝 Contributing Guidelines

### Code Style

- Use TypeScript strict mode
- Follow ESLint rules
- Format with Prettier
- Write descriptive comments
- Use semantic naming

### Testing Requirements

- All new features must have E2E tests
- Test responsive behavior
- Test accessibility compliance
- Test performance impact
- Use test helpers when appropriate

### Commit Messages

Follow conventional commits format:
- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation
- `test:` for tests
- `refactor:` for refactoring

### PR Process

1. Create feature branch from main
2. Implement changes with tests
3. Ensure all tests pass
4. Run full test suite
5. Create descriptive PR
6. Address review feedback
7. Merge to main with automated deployment

## 📚 Additional Resources

- [Playwright Documentation](https://playwright.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [ESLint Rules](https://eslint.org/docs/rules/)
- [Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)