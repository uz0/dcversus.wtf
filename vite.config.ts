import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/main.ts')
      },
      output: {
        entryFileNames: 'main-[hash].js'
      }
    },
    minify: 'terser'
  },

  server: {
    port: 3000,
    open: true
  }
});