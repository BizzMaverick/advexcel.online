export class PerformanceOptimizer {
  private static readonly CHUNK_SIZE = 200; // Optimized for large data
  private static readonly MAX_MEMORY_USAGE = 150 * 1024 * 1024; // Increased to 150MB

  static async processLargeDataset<T>(
    data: T[],
    processor: (chunk: T[]) => Promise<any>,
    onProgress?: (progress: number) => void
  ): Promise<any[]> {
    const results: any[] = [];
    const totalChunks = Math.ceil(data.length / this.CHUNK_SIZE);
    
    // Use requestIdleCallback for better performance
    for (let i = 0; i < totalChunks; i++) {
      const start = i * this.CHUNK_SIZE;
      const end = Math.min(start + this.CHUNK_SIZE, data.length);
      const chunk = data.slice(start, end);
      
      try {
        // Process chunk with enhanced timeout protection
        const chunkResult = await Promise.race([
          processor(chunk),
          this.createTimeout(10000) // Increased timeout for large data
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
      
      // Enhanced yielding for large datasets
      await this.yieldToMainEnhanced();
      
      // More frequent memory checks for large data
      if (i % 5 === 0 && this.getMemoryUsage() > this.MAX_MEMORY_USAGE) {
        await this.forceGarbageCollection();
      }
    }
    
    return results;
  }

  static async yieldToMainEnhanced(): Promise<void> {
    return new Promise(resolve => {
      // Use scheduler API if available for better performance
      if ('scheduler' in window && 'postTask' in (window as any).scheduler) {
        try {
          (window as any).scheduler.postTask(resolve, { priority: 'user-blocking' });
        } catch {
          // Fallback to requestIdleCallback
          if ('requestIdleCallback' in window) {
            requestIdleCallback(() => resolve(), { timeout: 16 });
          } else {
            setTimeout(resolve, 0);
          }
        }
      } else if ('requestIdleCallback' in window) {
        requestIdleCallback(() => resolve(), { timeout: 16 });
      } else {
        setTimeout(resolve, 0);
      }
    });
  }

  static async yieldToMain(): Promise<void> {
    return this.yieldToMainEnhanced();
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
    // Enhanced garbage collection for large datasets
    if ('gc' in window) {
      try {
        (window as any).gc();
      } catch {
        // Ignore if not available
      }
    }
    
    // Multiple yields with different priorities
    await this.yieldToMainEnhanced();
    await this.yieldToMainEnhanced();
    await this.yieldToMainEnhanced();
    
    // Clear any temporary large objects
    if (typeof window !== 'undefined') {
      (window as any).tempLargeData = null;
      (window as any).processingCache = null;
    }
  }

  static createVirtualizedProcessor<T>(
    data: T[],
    itemHeight: number,
    containerHeight: number
  ) {
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const bufferSize = Math.min(visibleCount * 5, 500); // Increased buffer for large data
    
    return {
      getVisibleItems: (scrollTop: number) => {
        const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - 20);
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
      
      // Increased timeout for large files
      setTimeout(() => {
        worker.terminate();
        reject(new Error('File processing timeout'));
      }, 5 * 60 * 1000); // 5 minutes
    });
  }

  static monitorPerformance(): {
    memoryUsage: number;
    memoryLimit: number;
    memoryPercentage: number;
    isMemoryHigh: boolean;
    isMemoryCritical: boolean;
  } {
    const memoryUsage = this.getMemoryUsage();
    const memoryLimit = this.getMemoryLimit();
    const memoryPercentage = memoryLimit > 0 ? (memoryUsage / memoryLimit) * 100 : 0;
    
    return {
      memoryUsage,
      memoryLimit,
      memoryPercentage,
      isMemoryHigh: memoryPercentage > 70,
      isMemoryCritical: memoryPercentage > 85
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
    maxItems: number = 50000 // Increased for large data support
  ): Promise<T[]> {
    if (data.length <= maxItems) {
      return data;
    }

    // Intelligent sampling for very large datasets
    const step = Math.ceil(data.length / maxItems);
    const optimized: T[] = [];
    
    // Use different sampling strategies based on data size
    if (data.length > 1000000) {
      // For very large datasets, use stratified sampling
      const stratumSize = Math.floor(data.length / 10);
      for (let stratum = 0; stratum < 10; stratum++) {
        const stratumStart = stratum * stratumSize;
        const stratumEnd = Math.min(stratumStart + stratumSize, data.length);
        const stratumStep = Math.ceil(stratumSize / (maxItems / 10));
        
        for (let i = stratumStart; i < stratumEnd; i += stratumStep) {
          optimized.push(data[i]);
          
          // Yield control every 5000 items
          if (optimized.length % 5000 === 0) {
            await this.yieldToMainEnhanced();
          }
        }
      }
    } else {
      // For moderately large datasets, use systematic sampling
      for (let i = 0; i < data.length; i += step) {
        optimized.push(data[i]);
        
        // Yield control every 2000 items
        if (optimized.length % 2000 === 0) {
          await this.yieldToMainEnhanced();
        }
      }
    }
    
    return optimized;
  }

  // Enhanced batch processing for large datasets
  static async processBatches<T, R>(
    data: T[],
    processor: (batch: T[]) => Promise<R[]>,
    options: {
      batchSize?: number;
      maxConcurrency?: number;
      onProgress?: (progress: number) => void;
      onBatchComplete?: (batchIndex: number, results: R[]) => void;
    } = {}
  ): Promise<R[]> {
    const {
      batchSize = this.CHUNK_SIZE,
      maxConcurrency = 3,
      onProgress,
      onBatchComplete
    } = options;

    const results: R[] = [];
    const totalBatches = Math.ceil(data.length / batchSize);
    let completedBatches = 0;
    let activeBatches = 0;

    const processBatch = async (batchIndex: number): Promise<void> => {
      const start = batchIndex * batchSize;
      const end = Math.min(start + batchSize, data.length);
      const batch = data.slice(start, end);

      try {
        activeBatches++;
        const batchResults = await processor(batch);
        results.push(...batchResults);
        
        if (onBatchComplete) {
          onBatchComplete(batchIndex, batchResults);
        }
      } catch (error) {
        console.warn(`Error processing batch ${batchIndex}:`, error);
      } finally {
        activeBatches--;
        completedBatches++;
        
        if (onProgress) {
          onProgress((completedBatches / totalBatches) * 100);
        }
      }
    };

    // Process batches with controlled concurrency
    const batchPromises: Promise<void>[] = [];
    
    for (let i = 0; i < totalBatches; i++) {
      // Wait if we've reached max concurrency
      while (activeBatches >= maxConcurrency) {
        await new Promise(resolve => setTimeout(resolve, 10));
      }
      
      batchPromises.push(processBatch(i));
      
      // Yield control periodically
      if (i % 10 === 0) {
        await this.yieldToMainEnhanced();
      }
    }

    // Wait for all batches to complete
    await Promise.all(batchPromises);
    
    return results;
  }
}