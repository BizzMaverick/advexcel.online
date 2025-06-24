import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
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
    chunkSizeWarningLimit: 2000, // Increased for large data handling
    target: 'es2020', // Updated for better performance
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      },
      mangle: {
        safari10: true
      }
    }
  },
  base: '/',
  server: {
    port: 3000,
    host: true
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
    // Increase stack size for large data processing
    'process.env.UV_THREADPOOL_SIZE': '128'
  },
  esbuild: {
    // Optimize for large data processing
    target: 'es2020',
    keepNames: true
  },
  worker: {
    format: 'es'
  }
});