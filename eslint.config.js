import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        console: 'readonly',
        document: 'readonly',
        window: 'readonly',
        navigator: 'readonly',
        performance: 'readonly',
        IntersectionObserver: 'readonly',
        MutationObserver: 'readonly',
        ResizeObserver: 'readonly',
        process: 'readonly'
      }
    },
    rules: {
      'no-unused-vars': 'off', // Turn off for TypeScript, use @typescript-eslint version
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'error',
      'no-var': 'error',
      'object-shorthand': 'warn',
      'prefer-template': 'warn'
    }
  },
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'docs/**',
      'scripts/**',
      '*.js',
      '*.mjs',
      'build-manifest.json',
      'site.webmanifest'
    ]
  }
];