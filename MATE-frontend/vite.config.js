/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [react()],
  build: {
    rolldownOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          if (id.includes('/react/') || id.includes('/react-dom/') || id.includes('/react-router')) {
            return 'react';
          }
          if (id.includes('/@mui/') || id.includes('/@emotion/')) {
            return 'mui';
          }
          if (id.includes('/axios/') || id.includes('/zustand/')) {
            return 'data';
          }
          return 'vendor';
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
    include: ['src/**/*.{test,spec}.{js,jsx}'],
    css: false,
  },
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    allowedHosts: [
      'principally-somnambulistic-frank.ngrok-free.dev'
    ],
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})