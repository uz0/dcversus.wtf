# Contributing to DCVS

This is a simple static website project. Here's how to contribute:

## 🚀 Quick Start

1. **Fork and clone** the repository
2. **Install dependencies**: `npm install`
3. **Make changes** to source files
4. **Test your changes**: `npm test`
5. **Create pull request**

## 📁 Project Structure

```
dcversus.wtf/
├── src/main.ts           # TypeScript entry point
├── docs/index.html       # Main website content
├── tests/                # Test files
└── package.json          # Dependencies and scripts
```

## 🛠️ Development Commands

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Serve static files

# Quality checks
npm run type-check       # TypeScript checking
npm run lint             # Code linting
npm test                 # Run all tests

# Install testing dependencies
npm run test:e2e:install # Install Playwright browsers
```

## 🧪 Testing

- **Unit tests**: Test TypeScript code in `tests/unit/`
- **E2E tests**: Test website functionality in `tests/e2e/`

## 📝 Making Changes

### Content Updates
- Edit `docs/index.html` for website content
- Use Tailwind CSS classes for styling

### Code Changes
- Edit `src/main.ts` for JavaScript functionality
- Update tests accordingly

### Configuration
- Modify build process in `vite.config.ts`
- Update test configurations as needed

## ✅ Quality Standards

- TypeScript must compile without errors
- ESLint must pass without warnings
- All tests must pass
- Build process must work correctly

## 🔄 Pull Request Process

1. **Create feature branch**: `git checkout -b feature/your-change`
2. **Make changes** and test locally
3. **Commit changes**: `git commit -m "feat: description"`
4. **Push branch**: `git push origin feature/your-change`
5. **Create pull request** with clear description

## 📋 Pull Request Template

```markdown
## Changes
- What was changed
- Why it was changed

## Testing
- [ ] Tests pass locally
- [ ] Build works correctly
- [ ] Manual testing completed

## Checklist
- [ ] Code follows project style
- [ ] Self-review completed
- [ ] Ready for review
```

Keep it simple and focused on maintaining the minimal project structure.