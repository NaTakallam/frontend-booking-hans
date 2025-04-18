import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  css: {
    postcss: true,
  },
  server: {
    proxy: {
      '/api/ml': {
        target: 'https://ml.natakallam.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/ml/, ''),
      },
      '/api/booking': {
        target: 'https://booking.natakallam.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/booking/, ''),
      },
    },
  },
});
