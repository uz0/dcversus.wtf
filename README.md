# DCVS - Professional Consulting Landing Page

A modern, TypeScript-powered landing page with automated deployment, shadcn/ui inspired design system, and brand-compliant color palette.

## 🎨 Brand Colors

Our design system is built around three primary brand colors extracted from our logos:

- **Orange**: `#FF6700` - Primary action color
- **Purple**: `#6A0DAD` - Secondary accent color
- **Yellow**: `#FFC107` - Warning/highlight color

All gray variations and semantic colors are derived from this base palette to ensure brand consistency.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ or Bun 1.0+
- Git
- GitHub CLI (gh) - for deployment automation

### Development Setup

```bash
# Clone the repository
git clone https://github.com/dcversus/dcversus.wtf.git
cd dcversus.wtf

# Install dependencies
bun install  # or: npm install

# Start development server with HMR
bun run dev  # or: npm run dev
```

### Available Scripts

- `bun run dev` - Start development server with hot module replacement
- `bun run build` - Build TypeScript project and generate hashed assets
- `bun run deploy` - Build, version, and deploy to GitHub Pages with release
- `bun run type-check` - TypeScript type checking
- `bun run lint` - ESLint code linting
- `bun run format` - Prettier code formatting
- `bun run changelog` - Interactive CHANGELOG management
- `bun run start` - Preview production build
- `bun run preview` - Alternative preview command

## 📁 Project Structure

```
dcversus.wtf/
├── docs/                   # GitHub Pages deployment directory
│   ├── index.html         # Main landing page (generated)
│   ├── js/                # JavaScript files (hashed)
│   ├── dcversus.svg       # Logo 1 (orange)
│   ├── theedgestory.svg   # Logo 2 (purple)
│   └── uz0.svg           # Logo 3 (yellow)
├── src/                   # TypeScript development source
│   ├── main.ts           # Main application entry point
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Utility functions and helpers
│   └── components/       # React/Vue components (future)
├── scripts/               # TypeScript automation scripts
│   ├── build.mts         # Build automation
│   ├── deploy.mts        # Deployment automation
│   ├── changelog.mts     # CHANGELOG management
│   ├── postbuild.mts     # Post-build tasks
│   ├── types.ts          # Script type definitions
│   └── utils.ts          # Script utilities
├── package.json           # Dependencies and scripts
├── vite.config.ts         # Vite TypeScript configuration
├── tsconfig.json          # TypeScript configuration
├── tailwind.config.js     # Tailwind CSS configuration
├── .eslintrc.json         # ESLint configuration
├── .prettierrc            # Prettier configuration
├── CHANGELOG.md           # Version changelog
└── README.md             # This file
```

## 🔄 Development Workflow

### 1. Development Mode
```bash
# Start development with HMR
bun run dev

# Type checking in parallel
bun run type-check

# Linting and formatting
bun run lint
bun run format
```

### 2. Building
```bash
# Full TypeScript build with hashed assets
bun run build

# This automatically:
# - Compiles TypeScript
# - Runs linting
# - Builds with Vite
# - Updates index.html with hashed JS
# - Generates build manifest
# - Updates CHANGELOG
# - Optimizes assets
```

### 3. Deployment
```bash
# Automated deployment with versioning and releases
bun run deploy

# This automatically:
# - Validates environment
# - Updates version (patch/minor/major)
# - Builds project
# - Updates CHANGELOG
# - Creates commit and tag
# - Pushes to GitHub
# - Creates GitHub release
# - Manages pull requests

# Deployment options
bun run deploy --patch          # Patch release (default)
bun run deploy --minor          # Minor release
bun run deploy --major          # Major release
bun run deploy --version 2.1.0  # Custom version
bun run deploy --dry-run        # Dry run mode
```

## 🛠️ Technology Stack

### Core Technologies
- **TypeScript 5.6+**: Type-safe development
- **Vite 5.4+**: Fast build tool and dev server
- **Tailwind CSS 4.0**: Utility-first CSS framework
- **Bun 1.1+**: Fast package manager and runtime

### Development Tools
- **ESLint**: Code linting and quality
- **Prettier**: Code formatting
- **TypeScript**: Static type checking
- **Hot Module Replacement**: Instant development feedback
- **Source Maps**: Easy debugging

### Automation & Deployment
- **GitHub CLI**: Release and PR automation
- **SemVer**: Semantic versioning
- **Automated Changelog**: Git-based change tracking
- **Hashed Assets**: Cache-busting for production
- **GitHub Pages**: Static hosting

### UI Framework
- **shadcn/ui Inspired**: Modern, accessible components
- **Brand Compliant**: Custom color palette with TypeScript types
- **Responsive First**: Mobile-first design approach
- **Type Safety**: Full TypeScript coverage

## 🌐 Deployment

This project uses **automated deployment** with comprehensive versioning and release management:

### Automated Deployment Process
1. **Environment Validation**: Checks git status, dependencies, and GitHub CLI
2. **Version Management**: Semantic versioning with changelog updates
3. **Build Process**: TypeScript compilation with hashed assets
4. **Git Operations**: Automated commits, tags, and pushes
5. **GitHub Integration**: Release creation and PR management

### Deployment Commands
```bash
# Interactive deployment (recommended)
bun run deploy

# Automated deployment options
bun run deploy --patch          # Bug fixes
bun run deploy --minor          # New features
bun run deploy --major          # Breaking changes
bun run deploy --version 2.1.0  # Custom version
bun run deploy --dry-run        # Test without deploying
```

### Manual Build
```bash
# Build only (no deployment)
bun run build

# Build results in docs/ directory
# Files are automatically hashed for cache-busting
```

## 📝 Development Guidelines

### TypeScript Best Practices
- Use strict mode and proper type definitions
- Leverage utility types and generics
- Follow the established type patterns in `/src/types`
- Use proper error handling with typed exceptions

### Code Quality
- All TypeScript files must pass type checking
- Use ESLint for code quality and consistency
- Format with Prettier for consistent style
- Write descriptive commit messages
- All functionality must have E2E test coverage

### Testing
- Run full E2E test suite: `npm test`
- Run tests with UI: `npm run test:e2e:ui`
- Debug tests: `npm run test:e2e:debug`
- View test reports: `npm run test:e2e:report`
- Run CI tests: `npm run test:ci`

### Brand Guidelines
- Use the TypeScript color utilities from `/src/utils/theme.ts`
- Maintain brand consistency across all components
- Follow the established responsive breakpoints
- Ensure accessibility with proper ARIA labels

## 🎯 Design System (TypeScript-Powered)

### Type-Safe Colors
```typescript
import { BRAND_COLORS, THEME_CONFIG } from '@/utils/theme';

// Brand colors with type safety
const primaryColor = BRAND_COLORS.orange; // #FF6700
const accentColor = THEME_CONFIG.colors.accent[500]; // #6A0DAD
```

### Responsive Breakpoints
```typescript
// Built into the theme system
breakpoints: {
  sm: '640px',   // Mobile
  md: '768px',   // Tablet
  lg: '1024px',  // Desktop
  xl: '1280px',  // Large desktop
}
```

### Component Patterns
- Use TypeScript interfaces for props
- Leverage utility types for common patterns
- Follow the existing utility functions in `/src/utils`
- Maintain consistent naming conventions

## 🚀 Automation Features

### Build Automation
- **Hashed Assets**: Automatic cache-busting with SHA hashes
- **Manifest Generation**: Build metadata and file tracking
- **Asset Optimization**: SVG optimization and compression
- **Documentation Updates**: Automatic README and changelog updates

### Deployment Automation
- **Version Bumping**: Semantic versioning with validation
- **Git Integration**: Automated commits, tags, and pushes
- **GitHub Releases**: Automatic release creation with notes
- **PR Management**: Automated pull request creation and merging

### Quality Assurance
- **Type Checking**: Comprehensive TypeScript validation
- **Linting**: Code quality and consistency checks
- **Build Validation**: Artifact verification and size reporting
- **Error Handling**: Robust error reporting and recovery
- **E2E Testing**: Complete behavioral test coverage with Playwright

## 🧪 Testing Infrastructure

### E2E Testing with Playwright
Our comprehensive test suite covers all aspects of the application:

#### Test Coverage Areas
- **Application Tests**: Main functionality, navigation, user interactions
- **Theme System Tests**: Brand colors, responsive design, animations
- **Build System Tests**: Asset hashing, optimization, TypeScript compilation
- **Accessibility Tests**: WCAG compliance, screen readers, keyboard navigation
- **Performance Tests**: Core Web Vitals, loading speed, memory usage

#### Test Commands
```bash
# Run all tests
npm test

# Run with visual interface
npm run test:e2e:ui

# Debug tests step-by-step
npm run test:e2e:debug

# Generate HTML report
npm run test:e2e:report

# Install Playwright browsers
npm run test:e2e:install

# Full CI pipeline (build + test)
npm run test:ci
```

#### Browser Testing
- **Chrome**: Chromium-based browsers
- **Firefox**: Mozilla Firefox
- **Safari**: WebKit-based browsers
- **Mobile**: iPhone, iPad, Android viewports

#### Performance Testing
- **Core Web Vitals**: LCP, FID, CLS metrics
- **Loading Performance**: Resource optimization, caching
- **Memory Usage**: Leak detection and optimization
- **Network Performance**: Request optimization, compression

#### Accessibility Testing
- **WCAG 2.1 Compliance**: Full accessibility standards
- **Screen Reader Support**: Proper ARIA labels and roles
- **Keyboard Navigation**: Complete keyboard accessibility
- **Color Contrast**: Visual accessibility compliance

## 🐛 Troubleshooting

### Common Issues

**TypeScript compilation errors:**
```bash
# Check TypeScript configuration
bun run type-check

# Update dependencies
bun install
```

**Build failures:**
```bash
# Clean build artifacts
rm -rf docs dist

# Rebuild
bun run build
```

**Deployment issues:**
```bash
# Check GitHub CLI authentication
gh auth status

# Validate repository state
git status
```

**Development server issues:**
```bash
# Clear dependencies and reinstall
rm -rf node_modules
bun install
```

### Getting Help

- Check TypeScript compiler output for detailed errors
- Review build logs in `docs/build-report.json`
- Use `--verbose` flag for detailed script output
- Open an issue on GitHub with full error logs

## 📊 Build & Deployment Metrics

### Performance Metrics
- **Build Time**: Typically < 10 seconds
- **Bundle Size**: Optimized with tree-shaking
- **Type Checking**: Comprehensive coverage
- **Asset Hashing**: Automatic cache invalidation

### Deployment Pipeline
- **Validation**: Environment and dependency checks
- **Version Management**: Semantic versioning with changelog
- **Quality Assurance**: Automated testing and linting
- **Release Management**: GitHub integration with PR automation

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Team

- **DCVS Team** - Development and design
- **The Edge Story** - Brand strategy
- **UZ0** - Technical implementation

---

Built with ❤️, TypeScript, and modern web technologies.