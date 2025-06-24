export class PerformanceOptimizer {
  private static readonly CHUNK_SIZE = 500; // Reduced chunk size for better responsiveness
  private static readonly MAX_MEMORY_USAGE = 80 * 1024 * 1024; // 80MB limit

  static async processLargeDataset<T>(
    data: T[],
    processor: (chunk: T[]) => Promise<any>,
    onProgress?: (progress: number) => void
  ): Promise<any[]> {
    const results: any[] = [];
    const totalChunks = Math.ceil(data.length / this.CHUNK_SIZE);
    
    for (let i = 0; i < totalChunks; i++) {
      const start = i * this.CHUNK_SIZE;
      const end = Math.min(start + this.CHUNK_SIZE, data.length);
      const chunk = data.slice(start, end);
      
      try {
        // Process chunk with timeout protection
        const chunkResult = await Promise.race([
          processor(chunk),
          this.createTimeout(5000) // 5 second timeout per chunk
        ]);
        
        if (chunkResult !== 'TIMEOUT') {
          results.push(...(Array.isArray(chunkResult) ? chunkResult : [chunkResult]));
        }
      } catch (error) {
        console.warn(`Error processing chunk ${i}:`, error);
        // Continue with next chunk
      }
      
      // Update progress
      if (onProgress) {
        onProgress((i + 1) / totalChunks * 100);
      }
      
      // Yield control more frequently
      await this.yieldToMain();
      
      // Check memory usage every 10 chunks
      if (i % 10 === 0 && this.getMemoryUsage() > this.MAX_MEMORY_USAGE) {
        await this.forceGarbageCollection();
      }
    }
    
    return results;
  }

  static async yieldToMain(): Promise<void> {
    return new Promise(resolve => {
      if ('scheduler' in window && 'postTask' in (window as any).scheduler) {
        try {
          (window as any).scheduler.postTask(resolve, { priority: 'user-blocking' });
        } catch {
          setTimeout(resolve, 0);
        }
      } else {
        setTimeout(resolve, 0);
      }
    });
  }

  private static createTimeout(ms: number): Promise<string> {
    return new Promise(resolve => {
      setTimeout(() => resolve('TIMEOUT'), ms);
    });
  }

  static getMemoryUsage(): number {
    if ('memory' in performance) {
      try {
        return (performance as any).memory.usedJSHeapSize || 0;
      } catch {
        return 0;
      }
    }
    return 0;
  }

  static async forceGarbageCollection(): Promise<void> {
    // Force garbage collection if available
    if ('gc' in window) {
      try {
        (window as any).gc();
      } catch {
        // Ignore if not available
      }
    }
    
    // Multiple yields to allow cleanup
    await this.yieldToMain();
    await this.yieldToMain();
    await this.yieldToMain();
  }

  static createVirtualizedProcessor<T>(
    data: T[],
    itemHeight: number,
    containerHeight: number
  ) {
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const bufferSize = Math.min(visibleCount * 3, 200); // Increased buffer but with limit
    
    return {
      getVisibleItems: (scrollTop: number) => {
        const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - 10);
        const endIndex = Math.min(startIndex + bufferSize, data.length);
        
        return {
          items: data.slice(startIndex, endIndex),
          startIndex,
          endIndex,
          totalHeight: data.length * itemHeight,
          offsetY: startIndex * itemHeight
        };
      }
    };
  }

  static debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  static throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  static async processFileInWorker(file: File, workerScript: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const worker = new Worker(workerScript);
      
      worker.postMessage({ file });
      
      worker.onmessage = (event) => {
        if (event.data.error) {
          reject(new Error(event.data.error));
        } else {
          resolve(event.data.result);
        }
        worker.terminate();
      };
      
      worker.onerror = (error) => {
        reject(error);
        worker.terminate();
      };
      
      // Timeout after 2 minutes for large files
      setTimeout(() => {
        worker.terminate();
        reject(new Error('File processing timeout'));
      }, 2 * 60 * 1000);
    });
  }

  static monitorPerformance(): {
    memoryUsage: number;
    memoryLimit: number;
    memoryPercentage: number;
    isMemoryHigh: boolean;
  } {
    const memoryUsage = this.getMemoryUsage();
    const memoryLimit = this.getMemoryLimit();
    const memoryPercentage = memoryLimit > 0 ? (memoryUsage / memoryLimit) * 100 : 0;
    
    return {
      memoryUsage,
      memoryLimit,
      memoryPercentage,
      isMemoryHigh: memoryPercentage > 70
    };
  }

  private static getMemoryLimit(): number {
    if ('memory' in performance) {
      try {
        return (performance as any).memory.jsHeapSizeLimit || 0;
      } catch {
        return 0;
      }
    }
    return 0;
  }

  static async optimizeForLargeDataset<T>(
    data: T[],
    maxItems: number = 10000
  ): Promise<T[]> {
    if (data.length <= maxItems) {
      return data;
    }

    // Sample data to reduce size while maintaining representativeness
    const step = Math.ceil(data.length / maxItems);
    const optimized: T[] = [];
    
    for (let i = 0; i < data.length; i += step) {
      optimized.push(data[i]);
      
      // Yield control every 1000 items
      if (optimized.length % 1000 === 0) {
        await this.yieldToMain();
      }
    }
    
    return optimized;
  }
}