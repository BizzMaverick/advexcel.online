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
        drop_console: false, // Keep console logs for debugging
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
    host: true,
    hmr: {
      overlay: false // Disable error overlay for better performance
    }
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
    // Increase stack size for large data processing
    'process.env.UV_THREADPOOL_SIZE': JSON.stringify('128'),
    'process.env.NODE_OPTIONS': JSON.stringify('--max-old-space-size=8192')
  },
  esbuild: {
    // Optimize for large data processing
    target: 'es2020',
    keepNames: true,
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  },
  worker: {
    format: 'es'
  },
  // Increase memory limit for node
  css: {
    devSourcemap: false // Disable sourcemaps for CSS in development for better performance
  },
  // Increase performance for large files
  json: {
    stringify: true
  }
});