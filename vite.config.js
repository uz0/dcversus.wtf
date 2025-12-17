import { defineConfig } from 'vite'
import liveReload from 'vite-plugin-live-reload'
import legacy from '@vitejs/plugin-legacy'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    liveReload(['docs/**/*.html', 'docs/**/*.css', 'docs/**/*.js']),
    legacy({
      targets: ['defaults', 'not IE 11']
    }),
    tailwindcss()
  ],

  root: '.',
  base: '/dcversus.wtf/',

  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'docs/index.html')
      }
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },

  server: {
    port: 3000,
    open: true,
    host: true
  },

  preview: {
    port: 4173,
    host: true
  },

  css: {
    devSourcemap: true
  }
})