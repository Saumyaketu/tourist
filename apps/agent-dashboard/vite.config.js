// apps/agent-dashboard/vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react()
  ],
  server: {
    port: 5174, // Choose a development port for the dashboard
    proxy: {
      '/v1': {
        // Target the Identity Service running on port 4100
        target: 'http://localhost:4100',
        changeOrigin: true,
        secure: false,
        // Rewrite rule is optional since the path already starts with /v1
        // rewrite: (path) => path.replace(/^\/v1/, '/v1'), 
      },
    },
  },
})