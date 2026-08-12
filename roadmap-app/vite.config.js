import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Proxies to the PDL Prioritization Studio scoring server so Roadmap
    // can run AI prioritization directly, without going back to Studio.
    proxy: {
      '/api': 'http://localhost:4001',
    },
  },
})
