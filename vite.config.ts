import { defineConfig } from 'vite';
import liveReload from 'vite-plugin-live-reload';
import legacy from '@vitejs/plugin-legacy';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';
import crypto from 'crypto';

function generateHash(content: string): string {
  return crypto.createHash('sha256').update(content).digest('hex').substring(0, 8);
}

export default defineConfig({
  plugins: [
    liveReload(['docs/**/*.html', 'docs/**/*.css', 'src/**/*.{ts,js}']),
    legacy({
      targets: ['defaults', 'not IE 11']
    }),
    tailwindcss()
  ],

  root: '.',
  base: '/dcversus.wtf/',

  build: {
    outDir: 'docs',
    emptyOutDir: false,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/main.ts')
      },
      output: {
        entryFileNames: (chunkInfo) => {
          const hash = generateHash(Date.now().toString());
          return `js/main.${hash}.js`;
        },
        chunkFileNames: 'js/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash][extname]'
      }
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    sourcemap: true,
    manifest: true
  },

  server: {
    port: 3000,
    open: true,
    host: true,
    fs: {
      allow: ['..']
    }
  },

  preview: {
    port: 4173,
    host: true
  },

  css: {
    devSourcemap: true
  },

  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@/components': resolve(__dirname, 'src/components'),
      '@/utils': resolve(__dirname, 'src/utils'),
      '@/types': resolve(__dirname, 'src/types')
    }
  },

  esbuild: {
    target: 'es2020'
  }
});