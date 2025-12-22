# DCVS - Professional Consulting Website

A simple bilingual (English/Russian) static website for professional career development and management consulting services.

## Quick Start

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

## Available Scripts

```bash
npm run build       # Build TypeScript to docs/js/
npm run start       # Serve static files from docs/ on port 3000
npm run type-check  # TypeScript compilation check
```

## Project Structure

```
dcversus.wtf/
├── src/
│   └── main.ts        # TypeScript entry point (language switcher)
├── docs/
│   ├── index.html     # Main website with bilingual support
│   ├── css/
│   │   └── styles.css # Tailwind CSS build output
│   └── js/
│       └── main.js    # Built JavaScript
└── package.json       # Project configuration
```

## Features

- **Bilingual Support**: English (default) and Russian languages
- **Language Switcher**: Fixed-position EN/RU toggle buttons
- **SEO Optimized**: Meta tags, Open Graph, Twitter Cards
- **Responsive Design**: Mobile-friendly layout with Tailwind CSS
- **Google Analytics**: Integrated tracking
- **Static Site**: No server-side complexity, suitable for GitHub Pages

## Language Switching

- Default: English
- Russian mode: Add `?lang=ru` to URL
- Toggle: Click EN/RU buttons in top-left corner

## Deployment

Outputs static files to `docs/` folder, making it suitable for:
- GitHub Pages
- Netlify
- Vercel
- Any static web server

## Content Management

- Edit `docs/index.html` for content changes
- Add translations using `data-i18n-ru` and `data-i18n-en` attributes
- Build process updates JavaScript automatically

---

Built with ❤️ for simple, maintainable bilingual web development.
