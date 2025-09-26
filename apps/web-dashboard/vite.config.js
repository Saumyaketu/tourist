import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from '@tailwindcss/vite' // Existing import

export default defineConfig({
  plugins: [
    tailwindcss(),
    react()
  ],
  server: {
    port: 5173,
    proxy: {
      '/v1': {
        target: 'http://localhost:4200',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/v1/, '/v1'),
      },
      // 🚨 NEW: Proxy for Identity Service (Tourist details and credential issue)
      '/identity-api': {
        target: 'http://localhost:4100',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/identity-api/, '/v1'),
      },
    },
  },
});