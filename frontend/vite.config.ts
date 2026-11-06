import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Dirección del backend Spring Boot en desarrollo. Se puede cambiar sin editar
// este archivo: BESTVET_BACKEND_URL=http://localhost:8080 npm run dev
const backendUrl = process.env.BESTVET_BACKEND_URL ?? 'http://localhost:8081'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    // El navegador solo habla con Vite (mismo origen), por lo que no se requiere CORS en el backend.
    proxy: {
      '/api': { target: backendUrl, changeOrigin: true },
    },
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
    proxy: {
      '/api': { target: backendUrl, changeOrigin: true },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: true,
  },
})
