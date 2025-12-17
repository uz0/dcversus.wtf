# DCVS: Cutting-Edge Web Development Environment

DCVS is the premier development environment for building modern web applications with confidence, speed, and agent-collaborated quality. Built with ❤️ and cutting-edge web technologies for exceptional developer experience.

## 🌟 Live Demo

**Website**: [dcversus.wtf](https://dcversus.wtf) • **Preview**: [GitHub Pages](https://uz0.github.io/dcversus.wtf)

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ or **Bun** 1.0+
- **Git**
- **GitHub CLI (gh)** - for deployment automation

### Setup

```bash
# Clone and setup
git clone https://github.com/uz0/dcversus.wtf
cd dcversus.wtf

# Install dependencies
bun install

# Install Playwright browsers
npm run test:e2e:install

# Start development server
npm run dev
```

**Instant Setup**: One-command setup with all dependencies and development tools configured out of the box.

## 📋 Development Workflow

### Step 1: Feature Specification
Create a detailed specification before implementation:

```bash
# Create feature spec
touch specs/your-feature-name.md
```

Your spec must include:
- 🎯 Objective and requirements
- 🏗️ Implementation plan and file structure
- 🧪 Testing strategy
- 📝 Acceptance criteria
- 🚀 Success metrics

**Get Approval**: Tag @claude and @coderabbit for review before implementation.

### Step 2: Implementation
```bash
# Create feature branch
git checkout -b feature/your-feature-name
git push -u origin feature/your-feature-name

# Develop with TypeScript strict mode
# Follow existing code patterns
# Test as you develop
# Use agents for reviews and clarification
```

### Step 3: Quality Assurance
```bash
# Full quality check
npm run type-check && npm run lint && npm run test

# Performance validation
npm run build && npm run test:e2e -- --grep "performance"
```

### Step 4: Code Review
Tag agents for comprehensive review:

**Architecture Review (@claude):**
```text
@claude Please review [feature] implementation
Focus: architecture, patterns, integration, security
Spec: specs/your-feature-name.md
```

**Code Quality Review (@coderabbit):**
```text
@coderabbit Please review code quality for [feature]
Focus: best practices, performance, optimization
PR: #[pr-number]
```

### Step 5: Pull Request & Deployment
```bash
# Create PR with detailed description
gh pr create --title "feat: [Feature Name]" --body "Follow template in .github/PULL_REQUEST_TEMPLATE.md"

# Automated CI/CD will:
# ✅ Type check, lint, and test
# ✅ Deploy preview for testing
# ⏳ Wait for manual approval
# ✅ Auto-deploy when merged
```

## 🛠️ Available Commands

### Development
```bash
npm run dev              # Start development server with HMR
npm run type-check       # Type check source files
npm run type-check:scripts # Type check script files
npm run lint            # Run ESLint
npm run format          # Format code with Prettier
```

### Testing
```bash
npm test                # Run all E2E tests
npm run test:e2e:ui     # Run tests with visual interface
npm run test:e2e:debug  # Debug tests step-by-step
npm run test:ci         # Full CI pipeline
```

### Build & Deploy
```bash
npm run build           # Build for production
npm run preview         # Preview production build
npm run deploy          # Deploy with version management
npm run deploy --patch  # Patch release (bug fixes)
npm run deploy --minor  # Minor release (new features)
```

## 🏗️ Project Structure

```
dcversus.wtf/
├── specs/              # Feature specifications
│   ├── 01-init.md     # Development workflow
│   └── feature-name.md # Individual feature specs
├── src/                # TypeScript source files
│   ├── main.ts        # Application entry point
│   ├── types/         # Type definitions
│   └── utils/         # Utility functions
├── scripts/            # Build and deploy automation
├── tests/              # Playwright E2E tests
├── .github/workflows/  # CI/CD pipeline
└── docs/               # Build output (GitHub Pages)
```

## 🤖 Agent Collaboration

### @claude - Architecture Specialist
- System architecture and design patterns
- TypeScript implementation and best practices
- Complex problem solving and debugging
- Performance optimization strategies
- Security considerations and threat modeling

### @coderabbit - Code Quality Specialist
- Code quality assessment and best practices
- Performance optimization and profiling
- Test coverage and quality assessment
- Security audit and vulnerability assessment
- Documentation review and improvement

## 🎨 PWA & Brand Features

### Progressive Web App
- **PWA Ready**: Installable as native app with offline support
- **Favicon Generation**: Auto-generated from dcversus.svg brand logo
- **Web Manifest**: Complete PWA configuration with icons and theme colors
- **Mobile Optimized**: Touch icons, splash screens, and responsive design
- **Performance**: Core Web Vitals monitoring and optimization

### Brand System
- **Consistent Branding**: TypeScript-powered design system
- **Color Palette**: Brand colors (#FF6700, #6A0DAD, #FFC107)
- **Responsive Components**: Mobile-first design approach
- **Accessibility**: WCAG 2.1 compliant with proper ARIA labels

## 🧪 Quality Standards

- ✅ **TypeScript strict mode** with comprehensive type coverage
- ✅ **ESLint rules compliance** (0 errors tolerance)
- ✅ **Prettier formatting applied** for consistent style
- ✅ **E2E tests cover all user journeys** with Playwright
- ✅ **Cross-browser compatibility** (Chrome, Firefox, Safari)
- ✅ **Mobile responsive testing** across all viewports
- ✅ **Accessibility compliance** (WCAG 2.1 standards)
- ✅ **Performance benchmarks met** (LCP < 2.5s, FID < 100ms, CLS < 0.1)
- ✅ **Bundle size optimization** (< 1MB with tree-shaking)
- ✅ **PWA functionality** with install capability

## 🚀 Deployment Process

### Automated CI/CD Pipeline
1. **Quality Checks**: Type checking, linting, testing
2. **Accessibility Tests**: WCAG compliance validation
3. **Performance Tests**: Core Web Vitals monitoring
4. **Security Scanning**: Vulnerability detection
5. **Build Verification**: Production build validation
6. **Preview Deployment**: Test deployment for PR review
7. **Production Deployment**: Automated deployment on merge

### Post-Deployment
- Semantic versioning with changelog
- GitHub release creation
- Performance monitoring at dcversus.wtf
- Automated rollback on issues

## 📚 Documentation

- **Development Workflow**: `specs/01-init.md`
- **Contribution Guide**: `CONTRIBUTING.md`
- **Agent Collaboration**: `AGENTS.md` (symlink to README.md)
- **Claude Usage**: `CLAUDE.md` (symlink to README.md)

---

Built with ❤️ and cutting-edge web technologies for exceptional developer experience.