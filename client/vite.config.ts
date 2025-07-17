import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5000,
    host: '0.0.0.0',
    allowedHosts: [
      '27c2bd66-3314-4d8d-8f5c-37d849710371-00-24lnnmpbcx8cg.sisko.replit.dev',
      'localhost',
      '.replit.dev'
    ]
  },
  preview: {
    port: 5000,
    host: '0.0.0.0',
    allowedHosts: 'all'
  }
})