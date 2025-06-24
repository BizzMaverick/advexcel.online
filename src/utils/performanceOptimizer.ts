export class PerformanceOptimizer {
  private static readonly CHUNK_SIZE = 1000; // Process data in chunks
  private static readonly MAX_MEMORY_USAGE = 100 * 1024 * 1024; // 100MB limit

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
      
      // Process chunk
      const chunkResult = await processor(chunk);
      results.push(...(Array.isArray(chunkResult) ? chunkResult : [chunkResult]));
      
      // Update progress
      if (onProgress) {
        onProgress((i + 1) / totalChunks * 100);
      }
      
      // Yield control to prevent UI blocking
      await this.yieldToMain();
      
      // Check memory usage
      if (this.getMemoryUsage() > this.MAX_MEMORY_USAGE) {
        await this.forceGarbageCollection();
      }
    }
    
    return results;
  }

  static async yieldToMain(): Promise<void> {
    return new Promise(resolve => {
      if ('scheduler' in window && 'postTask' in (window as any).scheduler) {
        (window as any).scheduler.postTask(resolve, { priority: 'user-blocking' });
      } else {
        setTimeout(resolve, 0);
      }
    });
  }

  static getMemoryUsage(): number {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize;
    }
    return 0;
  }

  static async forceGarbageCollection(): Promise<void> {
    // Force garbage collection if available
    if ('gc' in window) {
      (window as any).gc();
    }
    
    // Yield to allow cleanup
    await this.yieldToMain();
  }

  static createVirtualizedProcessor<T>(
    data: T[],
    itemHeight: number,
    containerHeight: number
  ) {
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const bufferSize = Math.min(visibleCount * 2, 100);
    
    return {
      getVisibleItems: (scrollTop: number) => {
        const startIndex = Math.floor(scrollTop / itemHeight);
        const endIndex = Math.min(startIndex + bufferSize, data.length);
        
        return {
          items: data.slice(startIndex, endIndex),
          startIndex,
          endIndex,
          totalHeight: data.length * itemHeight
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
      
      // Timeout after 5 minutes
      setTimeout(() => {
        worker.terminate();
        reject(new Error('File processing timeout'));
      }, 5 * 60 * 1000);
    });
  }
}