export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startTiming(label: string): void {
    this.metrics.set(label, performance.now());
  }

  endTiming(label: string): number {
    const startTime = this.metrics.get(label);
    if (startTime === undefined) {
      console.warn(`No start time found for label: ${label}`);
      return 0;
    }
    
    const duration = performance.now() - startTime;
    this.metrics.delete(label);
    
    // Log slow operations in development
    if (process.env.NODE_ENV === 'development' && duration > 1000) {
      console.warn(`Slow operation detected: ${label} took ${duration.toFixed(2)}ms`);
    }
    
    return duration;
  }

  measureFileProcessing<T>(operation: () => Promise<T>, label: string): Promise<T> {
    return new Promise(async (resolve, reject) => {
      this.startTiming(label);
      
      try {
        const result = await operation();
        const duration = this.endTiming(label);
        
        if (process.env.NODE_ENV === 'development') {
          console.log(`${label} completed in ${duration.toFixed(2)}ms`);
        }
        
        resolve(result);
      } catch (error) {
        this.endTiming(label);
        reject(error);
      }
    });
  }

  getMemoryUsage(): { used: number; total: number } | null {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return {
        used: Math.round(memory.usedJSHeapSize / 1024 / 1024),
        total: Math.round(memory.totalJSHeapSize / 1024 / 1024)
      };
    }
    return null;
  }

  logPerformanceMetrics(): void {
    if (process.env.NODE_ENV === 'development') {
      const memory = this.getMemoryUsage();
      if (memory) {
        console.log(`Memory usage: ${memory.used}MB / ${memory.total}MB`);
      }
      
      // Log navigation timing
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        console.log(`Page load time: ${(navigation.loadEventEnd - navigation.fetchStart).toFixed(2)}ms`);
      }
    }
  }
}