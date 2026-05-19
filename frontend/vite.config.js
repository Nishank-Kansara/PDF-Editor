import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 5173,
    proxy: {
      '/upload': 'https://pdf-editor-0eg9.onrender.com',
      '/edit': 'https://pdf-editor-0eg9.onrender.com',
      '/download': 'https://pdf-editor-0eg9.onrender.com',
      '/health': 'https://pdf-editor-0eg9.onrender.com',
    },
  },
})
