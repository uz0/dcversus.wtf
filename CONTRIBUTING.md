# Contributing to DCVS

This guide covers how to contribute features to DCVS using our agent-collaborative development workflow.

## 🚀 Quick Start

1. **Read the Workflow**: `specs/01-init.md` - Complete development process
2. **Create Feature Spec**: Write specification before coding
3. **Collaborate with Agents**: Use @claude and @coderabbit throughout
4. **Follow CI/CD Pipeline**: Automated quality checks and deployment

## 📋 Feature Development Process

### 1. Specification Phase
```bash
# Create your feature spec
touch specs/your-feature-name.md
```

Include in your spec:
- 🎯 Objective and requirements
- 🏗️ Implementation plan
- 🧪 Testing strategy
- 📝 Acceptance criteria
- 🚀 Success metrics

**Get Approval**: Tag @claude and @coderabbit for review before implementation.

### 2. Implementation Phase
```bash
# Create feature branch
git checkout -b feature/your-feature-name
git push -u origin feature/your-feature-name
```

**Development Workflow:**
- Code from `/src` directory
- Follow TypeScript strict mode
- Write E2E tests
- Commit frequently with meaningful messages
- Ask agents for reviews and clarification

### 3. Testing Phase
```bash
# Full quality check
npm run type-check && npm run lint && npm run test

# Specific test suites
npm run test:e2e -- --grep "your-feature"
```

### 4. Code Review Phase
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

### 5. Pull Request Phase
```bash
# Create PR with detailed description
gh pr create --title "feat: [Feature Name]" --body "$(cat <<'EOF'
## 🎯 Summary
[Brief description]

## 📋 Changes
- [ ] Core functionality
- [ ] TypeScript types
- [ ] E2E tests
- [ ] Documentation

## 🧪 Testing
- [ ] All tests pass
- [ ] Cross-browser compatibility
- [ ] Accessibility compliant
- [ ] Performance benchmarks

## 🔗 Links
- **Spec**: specs/your-feature-name.md
EOF
)"
```

## 🤖 Agent Collaboration

### When to Tag @claude
- **Architecture decisions** and design patterns
- **Complex problem solving** and debugging
- **Integration challenges** with existing codebase
- **Performance optimization** strategies
- **Security considerations** and best practices
- **Code review** of technical implementation

### When to Tag @coderabbit
- **Code quality** and best practices review
- **Performance optimization** opportunities
- **Code style** and consistency improvements
- **Test coverage** and quality assessment
- **Documentation** review and improvement
- **Security audit** and vulnerability assessment

### Agent Interaction Examples

**Clarification Request:**
```text
@claude @coderabbit
I'm implementing user authentication. Should I:
1. Use JWT tokens with localStorage
2. Use HTTP-only cookies with refresh tokens
3. Implement both approaches

Context: SPA with TypeScript, need secure session management
```

**Architecture Review:**
```text
@claude
I've designed a new data pipeline component. Please review:

File: src/components/DataPipeline/
Focus: Performance, error handling, memory usage

Architecture:
- Uses Observable pattern for data flow
- Implements backpressure handling
- Includes retry logic for failed requests
```

**Code Quality Review:**
```text
@coderabbit
Please review the implementation of useAuth hook:

File: src/hooks/useAuth.ts
Focus: React best practices, TypeScript safety, error handling

Current approach:
- Custom hook with state management
- Session persistence with encryption
- Automatic token refresh
```

## 🔄 Development Workflow

### Daily Development Flow

1. **Morning Planning**
   ```bash
   # Check your branch
   git status

   # Pull latest main
   git checkout main
   git pull
   git checkout feature/your-branch

   # Sync with main
   git merge main
   ```

2. **Development**
   ```bash
   # Start development server
   npm run dev

   # Make changes and test
   npm run test:e2e -- --grep "your-feature"
   ```

3. **Quality Check**
   ```bash
   # Type checking
   npm run type-check

   # Linting
   npm run lint

   # Full test suite
   npm run test
   ```

4. **Progress Update**
   ```bash
   # Commit with meaningful message
   git add .
   git commit -m "feat: implement core functionality for your-feature

   - Add AuthService with TypeScript interfaces
   - Implement login/logout flows
   - Add E2E tests for auth scenarios
   - Update documentation"

   git push
   ```

## 📋 Quality Standards

### Code Quality Requirements
- ✅ TypeScript strict mode
- ✅ ESLint rules compliance
- ✅ Prettier formatting
- ✅ Test coverage > 80%
- ✅ No console errors in production

### Testing Requirements
- ✅ E2E tests for user journeys
- ✅ Cross-browser compatibility (Chrome, Firefox, Safari)
- ✅ Mobile responsive testing
- ✅ Accessibility compliance (WCAG 2.1)
- ✅ Performance benchmarks met

### Documentation Requirements
- ✅ Updated README.md (if needed)
- ✅ Code comments for complex logic
- ✅ Updated package.json dependencies
- ✅ CHANGELOG.md entries

## 🚀 Pull Request Guidelines

### PR Requirements
- **Descriptive title** following conventional commits
- **Comprehensive description** with checklist
- **Reference to specification** file
- **Evidence of testing** and quality checks
- **Performance metrics** and benchmarks

### PR Checklist Template
```markdown
## 📝 Checklist

### Development
- [ ] Implementation follows spec requirements
- [ ] TypeScript strict mode used
- [ ] Code follows project conventions
- [ ] Error handling implemented
- [ ] Performance optimized

### Testing
- [ ] Unit tests cover core functionality
- [ ] E2E tests cover user journeys
- [ ] Cross-browser tested
- [ ] Mobile responsive tested
- [ ] Accessibility compliant

### Documentation
- [ ] README.md updated (if needed)
- [ ] Code comments added where necessary
- [ ] Dependencies updated in package.json
- [ ] CHANGELOG.md updated

### Review
- [ ] @claude reviewed architecture
- [ ] @coderabbit reviewed code quality
- [ ] All feedback addressed
- [ ] CI/CD checks passing
```

## 🔧 Useful Commands

### Development Commands
```bash
# Development server
npm run dev

# Type checking
npm run type-check
npm run type-check:scripts

# Code quality
npm run lint
npm run format

# Testing
npm test                     # All E2E tests
npm run test:e2e:ui        # Visual test interface
npm run test:e2e:debug      # Debug mode
npm run test:ci            # Full CI pipeline
```

### Agent Review Commands
```bash
# Request architecture review
@claude Please review the implementation for technical correctness

# Request code quality review
@coderabbit Please review the code for optimization opportunities

# Ask for clarification
@claude @coderabbit I need guidance on the best approach for [specific problem]
```

### Git Commands
```bash
# Create feature branch
git checkout -b feature/name

# Sync with main
git merge main

# Commit with conventional format
git commit -m "feat: description

- Change 1
- Change 2"

# Push and create PR
git push
gh pr create
```

## 🌐 Deployment Process

### Pre-deployment
```bash
# Final quality check
npm run type-check && npm run lint && npm run test:ci

# Build verification
npm run build
npm run preview
```

### Deployment (Automated)
- ✅ CI checks pass automatically
- ✅ Version number updated
- ✅ CHANGELOG.md updated
- ✅ GitHub release created
- ✅ Deployed to dcversus.wtf

### Post-deployment
```bash
# Verify deployment
curl https://dcversus.wtf

# Monitor performance
npm run test:e2e -- --project=chromium --baseUrl=https://dcversus.wtf
```

## 🆘 Getting Help

### For Architecture Questions
```text
@claude I need help designing [component/feature]

Current approach: [describe your current approach]
Challenges: [describe challenges]
Questions: [specific questions]
```

### For Code Quality Issues
```text
@coderabbit Please help optimize [code area]

Current implementation: [code snippet]
Performance concerns: [specific issues]
Looking for: [desired improvements]
```

### For Process Questions
- Check `specs/01-init.md` for detailed workflow
- Review existing PRs for examples
- Ask for clarification in PR comments

## 📚 Additional Resources

- [Development Guide](DEVELOPMENT.md)
- [Agent Collaboration Guide](AGENTS.md)
- [Claude Usage](CLAUDE.md)
- [GitHub Actions](.github/workflows/)
- [Project Roadmap](README.md)

---

Thank you for contributing to DCVS! We love building cutting-edge web technologies with excellent developer experience. ❤️