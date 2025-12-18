import { defineConfig } from 'vite';
import { resolve } from 'path';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [tailwindcss()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/main.ts'),
        styles: resolve(__dirname, 'src/styles.css')
      },
      output: {
        entryFileNames: 'main-[hash].js',
        assetFileNames: '[name]-[hash].[ext]'
      }
    },
    minify: 'terser'
  },

  server: {
    port: 3000,
    open: true
  }
});