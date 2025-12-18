import { defineConfig } from 'vite';
import { resolve } from 'path';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [tailwindcss()],
  build: {
    outDir: 'docs',
    emptyOutDir: false, // Preserve existing docs files (index.html, icons, etc.)
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/main.ts'),
        styles: resolve(__dirname, 'src/styles.css')
      },
      output: {
        entryFileNames: 'js/[name].js',
        assetFileNames: 'css/[name].[ext]'
      }
    },
    minify: 'terser'
  },

  server: {
    port: 3000,
    open: true
  }
});