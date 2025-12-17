# DCVS Project Setup and Workflow

## 🎯 Project Overview

DCVS is a simple static website for professional consulting services. This project uses minimal tooling and focuses on simplicity and maintainability.

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+
- **Git**

### Setup
```bash
# Clone repository
git clone https://github.com/uz0/dcversus.wtf
cd dcversus.wtf

# Install dependencies
npm install

# Build and start
npm run build
npm run start
```

## 📋 Available Scripts

```bash
# Development
npm run dev              # Start Vite dev server
npm run build            # Build TypeScript and copy to docs
npm run serve            # Serve static files from docs folder
npm run start            # Alias for serve

# Quality Assurance
npm run type-check       # TypeScript type checking
npm run lint             # ESLint code quality check

# Testing
npm test                 # Run unit and E2E tests
npm run test:unit        # Run Jest unit tests
npm run test:e2e         # Run Playwright E2E tests
npm run test:e2e:install # Install Playwright browsers
```

## 🏗️ Project Structure

```
dcversus.wtf/
├── src/
│   └── main.ts              # Simple entry point (console.log)
├── docs/
│   ├── index.html           # Main website (Russian content)
│   └── js/
│       └── main.js          # Built JavaScript
├── tests/
│   ├── unit/
│   │   ├── main.test.ts     # Unit test
│   │   └── setup.ts         # Jest setup
│   └── e2e/
│       └── visual.spec.ts   # E2E visual test
├── .github/workflows/
│   └── ci.yml               # Simple CI pipeline
├── vite.config.ts           # Vite build config
├── jest.config.js           # Jest test config
├── playwright.config.ts     # Playwright E2E config
├── tsconfig.json            # TypeScript config
└── package.json             # Dependencies and scripts
```

## 🧪 Testing Strategy

### Unit Testing
- **Single test file**: `tests/unit/main.test.ts`
- **Framework**: Jest with TypeScript
- **Coverage**: Tests main.ts functionality
- **Command**: `npm run test:unit`

### E2E Testing
- **Single test file**: `tests/e2e/visual.spec.ts`
- **Framework**: Playwright
- **Focus**: Visual regression and page content validation
- **Command**: `npm run test:e2e`

### Quality Gates
- TypeScript compilation (`npm run type-check`)
- ESLint code quality (`npm run lint`)
- Build verification (`npm run build`)

## 🔄 Development Workflow

### 1. Make Changes
- Edit source files in `src/`
- Edit HTML content in `docs/index.html`
- Update styles directly in HTML with Tailwind CSS

### 2. Test Changes
```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Testing
npm test
```

### 3. Build and Verify
```bash
# Build project
npm run build

# Serve locally
npm run start
```

### 4. Commit and Push
```bash
git add .
git commit -m "feat: description of changes"
git push
```

## 🚀 Deployment

The project uses static files in the `docs/` folder:

### GitHub Pages
- Configure repository settings to serve from `docs/` folder
- Automatic deployment on push to main branch

### Manual Deployment
```bash
npm run build
# Upload docs/ folder to web server
```

## 📝 Content Management

### Website Content
- **Main file**: `docs/index.html`
- **Language**: Russian
- **Sections**: Hero, About, Services, Pricing, Contact
- **Styling**: Tailwind CSS classes

### JavaScript
- **Entry point**: `src/main.ts`
- **Purpose**: Minimal functionality (console logging)
- **Build output**: `docs/js/main.js`

## 🔧 Configuration Files

### Vite Configuration
- Simple TypeScript compilation
- Outputs to `dist/` folder
- Minified JavaScript bundle

### Jest Configuration
- jsdom environment
- TypeScript support
- Single test file pattern

### Playwright Configuration
- Chromium browser
- Static file serving
- Visual regression testing

### CI/CD Pipeline
- Single job workflow
- Type checking, linting, building, testing
- Runs on push and pull requests

## 🎯 Success Criteria

A successful project state includes:
- ✅ TypeScript compilation without errors
- ✅ ESLint passes with 0 issues
- ✅ All tests pass (unit + E2E)
- ✅ Build process works correctly
- ✅ Static files serve properly
- ✅ Visual content matches expectations

## 🛠️ Troubleshooting

### Build Issues
- Clear `node_modules` and `package-lock.json`: `rm -rf node_modules package-lock.json && npm install`
- Check TypeScript errors: `npm run type-check`
- Verify build output: `ls -la dist/ docs/js/`

### Test Issues
- Install Playwright browsers: `npm run test:e2e:install`
- Run tests individually: `npm run test:unit` or `npm run test:e2e`
- Check test configuration files

### Server Issues
- Verify port 3000 is available
- Check docs folder exists and contains index.html
- Ensure JavaScript file exists: `docs/js/main.js`

This simplified workflow ensures the project remains maintainable and focused on delivering the consulting website content efficiently.