import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const apiTarget = process.env.VITE_API_URL || 'https://beholder-production.up.railway.app'

export default defineConfig({
  plugins: [react()],
  build: { outDir: '../static', emptyOutDir: true },
  server: { proxy: { '/api': { target: apiTarget, changeOrigin: true } } },
})
