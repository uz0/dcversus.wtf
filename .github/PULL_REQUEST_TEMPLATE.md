## 🎯 **Pull Request Template**

**Please fill out this template when creating a pull request.**

### 📋 **Definition of Done (DoD)**

#### ✅ **Specification**
- [ ] Related `specs/[feature-name].md` exists and is complete
- [ ] All requirements from specification are implemented
- [ ] Technical decisions are documented

#### ✅ **Implementation**
- [ ] Code follows TypeScript strict mode
- [ ] ESLint rules compliance (0 errors)
- [ ] Prettier formatting applied
- [ ] Implementation matches specification
- [ ] Error handling and edge cases covered

#### ✅ **Testing**
- [ ] E2E tests cover all user journeys
- [ ] Cross-browser compatibility verified (Chrome, Firefox, Safari)
- [] Mobile responsive testing completed
- [ ] Accessibility compliance (WCAG 2.1)
- [ ] Performance benchmarks met (LCP < 2.5s, FID < 100ms, CLS < 0.1)
- [ ] Bundle size optimization checked (< 1MB)

#### ✅ **Quality Assurance**
- [ ] @claude reviewed architecture and technical implementation
- [ ] @coderabbit reviewed code quality and optimization
- [ ] All feedback addressed appropriately
- [ ] No TODO/FIXME/HACK comments in final code
- [ ] No security vulnerabilities detected

#### ✅ **Documentation**
- [ ] README.md updated (if needed)
- [ ] Code comments added for complex logic
- [ ] Dependencies updated in package.json
- [ ] CHANGELOG.md updated with release notes
- [ ] API documentation updated (if applicable)

#### ✅ **Deployment**
- [ ] All CI/CD checks passed
- [ ] Build process completed successfully
- [ ] Preview deployment tested and approved
- [ ] Production deployment completed
- [ ] Post-deployment verification completed

### 📄 **Technical Details**

#### **Files Changed**
```markdown
- `src/components/[ComponentName]/`
- `src/utils/[featureName]`
- `src/types/[featureName].ts`
- `tests/e2e/[feature-name].spec.ts`
```

#### **Dependencies**
```markdown
- Added: [package additions]
- Removed: [package removals]
- Updated: [package updates]
```

#### **Configuration**
```markdown
- [ ] TypeScript configuration updated
- [ ] Tailwind config extended
- [ ] Vite config adjusted
- [ ] ESLint rules added
```

### 🧪 **Testing Information**

#### **Test Coverage**
```markdown
- Total Tests: [number]
- E2E Tests: [number]
- Unit Tests: [number]
- Integration Tests: [number]
- Coverage Percentage: [percentage]
```

#### **Performance Metrics**
```markdown
- Bundle Size: [size]KB
- LCP: [time]ms
- FID: [time]ms
- CLS: [value]
- TTI: [time]ms
- TBT: [time]ms
```

#### **Accessibility Score**
```markdown
- WCAG 2.1 Compliance: [score]
- Color Contrast: [score]
- Keyboard Navigation: [score]
- Screen Reader Support: [score]
- ARIA Labels: [score]
```

### 🔗 **Links**

#### **Specification**
- **Spec File**: `specs/[feature-name].md`
- **Issue Link**: [GitHub issue link if applicable]

#### **Deployment**
- **Preview**: [Preview URL]
- **Production**: [Production URL]
- **Performance**: [Lighthouse report link]

#### **Testing**
- **CI/CD**: [GitHub Actions link]
- **Test Reports**: [Test report links]

### 📝 **Checklist**

#### **Development Standards**
- [ ] Follows TypeScript strict mode
- [ ] Uses ESLint rules
- [ ] Proper error handling
- [ ] Memory management
- [ ] Security best practices

#### **Code Quality**
- [ ] Single responsibility principle
- [ ] Proper naming conventions
- - [ ] Reusability considered
- [ ] Documentation provided
- [ ] Performance optimized
- [ ] Accessible implementation

#### **Testing Standards**
- [ ] All user flows tested
- [ ] Edge cases covered
- [ ] Error scenarios handled
- [ ] Cross-browser tested
- [ ] Mobile responsive
- [ ] Accessibility validated

#### **Review Standards**
- [ ] Peer reviews completed
- [ ] @claude review completed
- [ ] @coderabbit review completed
- [ ] All feedback addressed
- [ ] No merge conflicts
- [ ] Clean commit history

### 📊 **Metrics and Impact**

#### **Performance Impact**
```markdown
- Improvement: [description]
- Before: [before metrics]
- After: [after metrics]
- Change: [percentage change]
```

#### **User Experience Impact**
```markdown
- Feature: [description]
- Users affected: [number/type]
- Improvement: [description]
- Feedback: [feedback received]
```

#### **Technical Debt**
```markdown
- Resolved: [items removed]
- Added: [new items]
- Improved: [areas enhanced]
- Future considerations: [future plans]
```

### 🚀 **Deployment Information**

#### **Version Information**
```markdown
- Version: [semantic version]
- Release Type: [patch/minor/major]
- Breaking Changes: [yes/no]
- Migration Required: [yes/no]
```

#### **Deployment Steps**
```markdown
1. [Step 1]
2. [Step 2]
3. [Step 3]
4. [Step 4]
```

#### **Rollback Plan**
```markdown
- Previous Version: [version]
- Rollback Steps: [steps]
- Database Changes: [yes/no]
- Risk Assessment: [risk level]
```

### 💭 **Additional Notes**

```markdown
[Any additional context, challenges, or considerations]
```

---

**Ready for Review!** 🚀

Please ensure all items in the DoD checklist are completed before requesting merge.

**Links:**
- [ ] Spec: `specs/[feature-name].md`
- [ ] PR: [current PR link]
- [ ] Preview: [preview URL]