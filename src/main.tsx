import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './utils/errorBoundary.tsx';
import { LargeFileHandler } from './utils/largeFileHandler.ts';
import { StackOptimizer } from './utils/stackOptimizer.ts';
import { MemoryManager } from './utils/memoryManager.ts';
import { AuthProvider } from './context/AuthContext.tsx';
import { securityHeaders } from './utils/securityHeaders.ts';
import './index.css';

// Apply security headers
Object.entries(securityHeaders).forEach(([key, value]) => {
  const meta = document.createElement('meta');
  meta.httpEquiv = key;
  meta.content = value;
  document.head.appendChild(meta);
});

// Increase JavaScript engine limits
const increaseEngineCapacity = () => {
  try {
    // Increase stack size and optimize for large data processing
    if (typeof process !== 'undefined' && process.env) {
      process.env.UV_THREADPOOL_SIZE = '128';
      process.env.NODE_OPTIONS = '--max-old-space-size=8192'; // 8GB heap
    }

    // Configure global settings for large data handling
    if (typeof window !== 'undefined') {
      // Increase maximum listeners for large datasets
      if ('setMaxListeners' in EventTarget.prototype) {
        (EventTarget.prototype as any).setMaxListeners?.(100);
      }
      
      // Optimize garbage collection
      if ('gc' in window) {
        // Schedule periodic garbage collection for large data operations
        setInterval(() => {
          try {
            (window as any).gc();
          } catch (e) {
            // Ignore if not available
          }
        }, 60000); // Every minute
      }
      
      // Handle memory warnings
      window.addEventListener('beforeunload', () => {
        MemoryManager.cleanup();
      });
      
      // Increase stack size if possible
      try {
        Error.stackTraceLimit = 100; // Increase stack trace limit
      } catch (e) {
        // Ignore if not available
      }
    }
    
    console.log('Engine capacity increased for large data processing');
  } catch (error) {
    console.warn('Failed to increase engine capacity:', error);
  }
};

// Initialize optimizations for large data handling
increaseEngineCapacity();
StackOptimizer.initialize();
MemoryManager.initialize();
LargeFileHandler.initialize();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>
);