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
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://172.20.10.2:5000',
        changeOrigin: true
      },
      '/socket.io': {
        target: 'http://172.20.10.2:5000',
        ws: true
      }
    }
  }
})
