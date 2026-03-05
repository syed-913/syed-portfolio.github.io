
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  // GitHub Pages configuration
  // Repository name is 'syed-portfolio.github.io', so it's a project page
  // Project pages deploy to: https://username.github.io/repo-name/
  base: '/syed-portfolio.github.io/',
  build: {
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          ui: ['lucide-react', 'recharts', 'react-markdown', 'react-syntax-highlighter']
        }
      }
    }
  }
})
