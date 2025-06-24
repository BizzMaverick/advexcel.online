export class MemoryManager {
  private static readonly MEMORY_THRESHOLD = 0.8; // 80% of available memory
  private static readonly CLEANUP_INTERVAL = 30000; // 30 seconds
  private static readonly MAX_CACHE_SIZE = 100 * 1024 * 1024; // 100MB
  
  private static cache = new Map<string, any>();
  private static cleanupTimer: NodeJS.Timeout | null = null;

  static initialize(): void {
    this.startPeriodicCleanup();
    this.setupMemoryMonitoring();
    
    // Handle memory pressure events
    if ('memory' in performance) {
      this.setupMemoryPressureHandling();
    }
  }

  static async allocateForLargeData<T>(
    dataSize: number,
    processor: () => Promise<T>
  ): Promise<T> {
    // Check if we have enough memory
    const availableMemory = this.getAvailableMemory();
    const estimatedUsage = dataSize * 2; // Conservative estimate
    
    if (estimatedUsage > availableMemory * this.MEMORY_THRESHOLD) {
      // Clear cache and force cleanup
      await this.aggressiveCleanup();
      
      // Check again
      const newAvailableMemory = this.getAvailableMemory();
      if (estimatedUsage > newAvailableMemory * this.MEMORY_THRESHOLD) {
        throw new Error('Insufficient memory for processing this large dataset');
      }
    }

    try {
      return await processor();
    } catch (error) {
      if (this.isMemoryError(error)) {
        await this.emergencyCleanup();
        throw new Error('Memory limit exceeded. Please try with a smaller dataset or close other browser tabs.');
      }
      throw error;
    }
  }

  static async processLargeDataset<T, R>(
    data: T[],
    processor: (chunk: T[]) => Promise<R[]>,
    options: {
      chunkSize?: number;
      maxMemoryUsage?: number;
      onProgress?: (progress: number) => void;
    } = {}
  ): Promise<R[]> {
    const {
      chunkSize = this.calculateOptimalChunkSize(data.length),
      maxMemoryUsage = this.getAvailableMemory() * this.MEMORY_THRESHOLD,
      onProgress
    } = options;

    const results: R[] = [];
    const totalChunks = Math.ceil(data.length / chunkSize);
    
    for (let i = 0; i < totalChunks; i++) {
      const start = i * chunkSize;
      const end = Math.min(start + chunkSize, data.length);
      const chunk = data.slice(start, end);
      
      // Check memory before processing
      if (this.getMemoryUsage() > maxMemoryUsage) {
        await this.forceCleanup();
      }
      
      try {
        const chunkResults = await processor(chunk);
        results.push(...chunkResults);
      } catch (error) {
        if (this.isMemoryError(error)) {
          console.warn(`Memory error processing chunk ${i}, attempting recovery`);
          await this.emergencyCleanup();
          
          // Retry with smaller chunk
          const smallerChunk = chunk.slice(0, Math.floor(chunk.length / 2));
          if (smallerChunk.length > 0) {
            const retryResults = await processor(smallerChunk);
            results.push(...retryResults);
          }
        } else {
          throw error;
        }
      }
      
      // Update progress
      if (onProgress) {
        onProgress((i + 1) / totalChunks * 100);
      }
      
      // Yield control
      await this.yieldToMain();
    }
    
    return results;
  }

  static cacheData(key: string, data: any, ttl: number = 300000): void {
    // Check cache size
    if (this.getCacheSize() > this.MAX_CACHE_SIZE) {
      this.clearOldestCacheEntries();
    }
    
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  static getCachedData<T>(key: string): T | null {
    const cached = this.cache.get(key);
    
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  static clearCache(): void {
    this.cache.clear();
  }

  private static calculateOptimalChunkSize(dataLength: number): number {
    const availableMemory = this.getAvailableMemory();
    const memoryPerItem = 1024; // Estimate 1KB per item
    const maxItemsInMemory = Math.floor(availableMemory / memoryPerItem / 4); // Use 25% of available memory
    
    return Math.min(Math.max(100, maxItemsInMemory), 5000); // Between 100 and 5000 items
  }

  private static getMemoryUsage(): number {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize || 0;
    }
    return 0;
  }

  private static getAvailableMemory(): number {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return memory.jsHeapSizeLimit - memory.usedJSHeapSize;
    }
    return 100 * 1024 * 1024; // Default 100MB
  }

  private static getCacheSize(): number {
    let size = 0;
    for (const [key, value] of this.cache) {
      size += JSON.stringify(value).length;
    }
    return size;
  }

  private static clearOldestCacheEntries(): void {
    const entries = Array.from(this.cache.entries());
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
    
    // Remove oldest 25% of entries
    const toRemove = Math.ceil(entries.length * 0.25);
    for (let i = 0; i < toRemove; i++) {
      this.cache.delete(entries[i][0]);
    }
  }

  private static async forceCleanup(): Promise<void> {
    // Clear cache
    this.clearCache();
    
    // Force garbage collection
    if ('gc' in window) {
      try {
        (window as any).gc();
      } catch (e) {
        // Ignore if not available
      }
    }
    
    // Yield to allow cleanup
    await this.yieldToMain();
  }

  private static async aggressiveCleanup(): Promise<void> {
    // Clear all caches
    this.clearCache();
    
    // Clear browser caches if possible
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      } catch (e) {
        // Ignore if not available
      }
    }
    
    // Multiple GC attempts
    for (let i = 0; i < 3; i++) {
      if ('gc' in window) {
        try {
          (window as any).gc();
        } catch (e) {
          // Ignore if not available
        }
      }
      await this.yieldToMain();
    }
  }

  private static async emergencyCleanup(): Promise<void> {
    console.warn('Emergency memory cleanup initiated');
    
    await this.aggressiveCleanup();
    
    // Additional emergency measures
    if ('performance' in window && 'clearMarks' in performance) {
      performance.clearMarks();
      performance.clearMeasures();
    }
    
    // Clear any large objects from global scope
    if (typeof window !== 'undefined') {
      // Clear any large temporary variables
      (window as any).tempLargeData = null;
    }
  }

  private static isMemoryError(error: any): boolean {
    return error instanceof Error && (
      error.message.includes('out of memory') ||
      error.message.includes('Maximum call stack') ||
      error.message.includes('heap') ||
      error.name === 'RangeError'
    );
  }

  private static async yieldToMain(): Promise<void> {
    return new Promise(resolve => {
      if ('scheduler' in window && 'postTask' in (window as any).scheduler) {
        (window as any).scheduler.postTask(resolve, { priority: 'user-blocking' });
      } else {
        setTimeout(resolve, 0);
      }
    });
  }

  private static startPeriodicCleanup(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    
    this.cleanupTimer = setInterval(() => {
      this.performPeriodicCleanup();
    }, this.CLEANUP_INTERVAL);
  }

  private static performPeriodicCleanup(): void {
    // Remove expired cache entries
    const now = Date.now();
    for (const [key, value] of this.cache) {
      if (now - value.timestamp > value.ttl) {
        this.cache.delete(key);
      }
    }
    
    // Check memory usage
    const memoryUsage = this.getMemoryUsage();
    const availableMemory = this.getAvailableMemory();
    
    if (memoryUsage > availableMemory * this.MEMORY_THRESHOLD) {
      this.forceCleanup();
    }
  }

  private static setupMemoryMonitoring(): void {
    // Monitor memory usage
    setInterval(() => {
      const usage = this.getMemoryUsage();
      const available = this.getAvailableMemory();
      const percentage = (usage / (usage + available)) * 100;
      
      if (percentage > 85) {
        console.warn(`High memory usage detected: ${percentage.toFixed(1)}%`);
        this.forceCleanup();
      }
    }, 10000); // Check every 10 seconds
  }

  private static setupMemoryPressureHandling(): void {
    // Handle memory pressure events if available
    if ('onmemorywarning' in window) {
      (window as any).onmemorywarning = () => {
        console.warn('Memory warning received, performing emergency cleanup');
        this.emergencyCleanup();
      };
    }
    
    // Handle unhandled promise rejections that might be memory-related
    window.addEventListener('unhandledrejection', (event) => {
      if (this.isMemoryError(event.reason)) {
        console.warn('Memory-related promise rejection detected');
        this.emergencyCleanup();
      }
    });
  }

  static getMemoryStats(): {
    used: number;
    available: number;
    total: number;
    percentage: number;
    cacheSize: number;
  } {
    const used = this.getMemoryUsage();
    const available = this.getAvailableMemory();
    const total = used + available;
    const percentage = total > 0 ? (used / total) * 100 : 0;
    const cacheSize = this.getCacheSize();
    
    return {
      used,
      available,
      total,
      percentage,
      cacheSize
    };
  }

  static cleanup(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    this.clearCache();
  }
}