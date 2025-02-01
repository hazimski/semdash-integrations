import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');


  return {
    plugins: [react()],
    server: {
      host: true,
      port: 5173
    },
    base: '/',
    define: {
      'process.env.NODE_ENV': JSON.stringify(mode),
      'process.env.VITE_APP_URL': JSON.stringify(env.VITE_APP_URL || '')
    },
    build: {
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            ui: ['@headlessui/react', 'lucide-react', 'react-hot-toast'],
            charts: ['recharts'],
            utils: ['date-fns', 'file-saver', 'html2canvas', 'jspdf']
          }
        }
      }
    }
  };
});
