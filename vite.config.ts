import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          utils: ['xlsx', 'papaparse'],
          charts: ['recharts']
        }
      }
    },
    chunkSizeWarningLimit: 2000,
    target: 'es2020',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false,
        drop_debugger: true
      },
      mangle: {
        safari10: true
      }
    }
  },
  server: {
    port: 3000,
    host: true,
    hmr: {
      overlay: false
    }
  }
});