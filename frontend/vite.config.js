import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

const BACKEND_URL = 'https://voice-ai-observability-copilot-production-6604.up.railway.app';

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  },
  define: {
    __BACKEND_URL__: JSON.stringify(BACKEND_URL)
  }
});
