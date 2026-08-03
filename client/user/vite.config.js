import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000', // <-- Replace 5000 with your Express server port if different
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
