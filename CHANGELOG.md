# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-12-17

### Added
- **Initial Project Setup**
  - Created hybrid development/production architecture with Vite
  - Configured Bun as package manager for fast development
  - Set up Tailwind CSS with brand-compliant color palette
  - Implemented shadcn/ui inspired design system

- **Brand System**
  - Extracted and implemented brand color palette:
    - Orange: `#FF6700` (Primary action)
    - Purple: `#6A0DAD` (Secondary accent)
    - Yellow: `#FFC107` (Warning/highlight)
  - Created semantic color variations from brand palette
  - Established responsive design system

- **Development Infrastructure**
  - Vite configuration with HMR for development
  - Legacy browser support via Vite Legacy plugin
  - Source maps and development tooling
  - Production build optimization with Terser

- **Project Structure**
  - Hybrid `/docs` (production) and `/src` (development) setup
  - GitHub Pages deployment configuration
  - Comprehensive documentation and README
  - Development workflow with `npm run dev` and `npm run start`

### Technical Details
- **Package Manager**: Bun 1.1.38 (with npm fallback)
- **Bundler**: Vite 5.4.10 with live reload
- **CSS Framework**: Tailwind CSS 4.0.0-alpha.26
- **UI Components**: shadcn/ui inspired with custom brand colors
- **Deployment**: GitHub Pages from `/docs` directory

### Development Features
- **Hot Module Replacement**: Instant development feedback
- **CDN-Only Production**: `/docs` uses only CDN dependencies
- **Local Dependencies**: Development mode uses full npm ecosystem
- **Fast Build**: Optimized for rapid iteration and deployment

### Brand Assets (Planned)
- SVG logo conversions for:
  - `dcversus.svg` (orange accent)
  - `theedgestory.svg` (purple accent)
  - `uz0.svg` (yellow accent)

### Next Milestones
- [ ] Complete SVG logo conversions
- [ ] Implement responsive landing page layout
- [ ] Add interactive components and animations
- [ ] Optimize for production performance
- [ ] Test across all target browsers

---

## Version History

### Development Phase
- **v0.1.0** - Project initialization and basic structure
- **v0.2.0** - Development environment setup with Vite
- **v0.3.0** - Tailwind CSS integration and brand colors
- **v0.4.0** - Documentation and deployment configuration
- **v1.0.0** - Production-ready initial release

---

## Notes

### Color Palette Usage Guidelines
- **Primary Actions**: Use `brand-orange` (`#FF6700`) for CTAs, buttons, links
- **Secondary Elements**: Use `brand-purple` (`#6A0DAD`) for accents, highlights
- **Warnings/Attention**: Use `brand-yellow` (`#FFC107`) for alerts, important info
- **Text & Borders**: Use gray variations derived from brand colors
- **Consistency**: Always use semantic color classes for maintainability

### Development Workflow
1. **Development**: `bun run dev` for HMR-enabled local development
2. **Production**: `/docs` directory contains CDN-only implementation
3. **Deployment**: Push to `main` branch triggers automatic GitHub Pages deployment
4. **Testing**: Test responsive design across all breakpoints

### Browser Support
- **Modern Browsers**: Full feature support
- **Legacy Browsers**: Polyfilled via Vite Legacy plugin
- **Mobile**: Responsive-first design approach
- **Accessibility**: ARIA labels and semantic HTML throughout