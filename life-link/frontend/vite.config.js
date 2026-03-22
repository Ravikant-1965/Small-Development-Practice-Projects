// vite.config.js — Configuration for Vite (our frontend build tool)
// The most important part here is the "proxy" section
// Without it, our React app (port 5173) can't talk to our backend (port 3001)
// The proxy automatically forwards any /api request to the backend

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Any request starting with /api will be forwarded to our backend
      // So axios.get('/api/profile') actually goes to http://localhost:3001/api/profile
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  }
})
