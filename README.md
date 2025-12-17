# DCVS - Professional Consulting Website

A simple static website for professional consulting services built with minimal complexity.

## 🚀 Quick Start

```bash
# Clone repository
git clone https://github.com/uz0/dcversus.wtf
cd dcversus.wtf

# Install dependencies
npm install

# Build and serve
npm run build
npm run start
```

## 📋 Available Scripts

```bash
# Development
npm run dev              # Start Vite dev server
npm run build            # Build TypeScript to docs/js/
npm run serve            # Serve static files from docs/
npm run start            # Alias for serve

# Quality checks
npm run type-check       # TypeScript compilation check
npm run lint             # ESLint code quality check

# Testing
npm test                 # Run all tests
npm run test:unit        # Run unit tests
npm run test:e2e         # Run E2E tests
npm run test:e2e:install # Install Playwright browsers
```

## 🏗️ Project Structure

```
dcversus.wtf/
├── src/
│   └── main.ts              # Simple TypeScript entry point
├── docs/
│   ├── index.html           # Main website (Russian content)
│   └── js/
│       └── main.js          # Built JavaScript
├── tests/
│   ├── unit/
│   │   └── main.test.ts     # Unit test
│   └── e2e/
│       └── visual.spec.ts   # E2E visual test
└── [config files]          # Vite, Jest, Playwright, etc.
```

## 🎯 Features

- **Static website**: No server-side complexity
- **Russian content**: Professional consulting services
- **Minimal JavaScript**: Simple console logging
- **Responsive design**: Mobile-friendly layout
- **Tailwind CSS**: Utility-first styling
- **TypeScript**: Type-safe development
- **Basic testing**: Unit and E2E tests

## 🧪 Testing

- **Unit tests**: Verify TypeScript functionality
- **E2E tests**: Visual regression testing
- **Quality gates**: Type checking and linting

## 🚀 Deployment

The project outputs static files to the `docs/` folder, making it suitable for:
- GitHub Pages
- Netlify
- Vercel
- Any static web server

## 📝 Content Management

- Edit `docs/index.html` for website content
- Use Tailwind CSS classes for styling
- Build process automatically copies JavaScript to `docs/js/main.js`

---

Built with ❤️ for simple, maintainable web development.