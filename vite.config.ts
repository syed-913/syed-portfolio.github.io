
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
})
