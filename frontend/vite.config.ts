import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Configure the development server to handle client-side routing
    proxy: {
      // If an API request is needed, it would be configured here
      '/api': 'http://localhost:3001'
    }
  },
  build: {
    // Generate a _redirects file for deployment platforms like Netlify
    // This ensures that any route is redirected to index.html for client-side routing
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  }
})
