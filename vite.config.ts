import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/',
  build: {
    // Let Rollup preserve the lazy route/admin boundaries instead of forcing
    // Firebase, dashboard and writing-only libraries into shared startup chunks.
    chunkSizeWarningLimit: 900,
  },
});
