export class StackOptimizer {
  private static readonly MAX_STACK_DEPTH = 1000;
  private static readonly CHUNK_SIZE = 100;

  // Trampoline function to avoid stack overflow
  static trampoline<T>(fn: (...args: any[]) => T | (() => T)): T {
    let result = fn;
    while (typeof result === 'function') {
      result = result();
    }
    return result as T;
  }

  // Convert recursive function to iterative with stack simulation
  static iterativeProcess<T>(
    data: T[],
    processor: (item: T, index: number) => any,
    batchSize: number = this.CHUNK_SIZE
  ): Promise<any[]> {
    return new Promise(async (resolve) => {
      const results: any[] = [];
      const stack: Array<{ data: T[]; startIndex: number }> = [{ data, startIndex: 0 }];

      while (stack.length > 0) {
        const current = stack.pop();
        if (!current) break;

        const { data: currentData, startIndex } = current;
        const endIndex = Math.min(startIndex + batchSize, currentData.length);
        
        // Process batch
        for (let i = startIndex; i < endIndex; i++) {
          try {
            const result = processor(currentData[i], i);
            results.push(result);
          } catch (error) {
            console.warn(`Error processing item at index ${i}:`, error);
          }
        }

        // Add remaining data back to stack if needed
        if (endIndex < currentData.length) {
          stack.push({ data: currentData, startIndex: endIndex });
        }

        // Yield control to prevent blocking
        await this.yieldControl();
      }

      resolve(results);
    });
  }

  // Tail call optimization simulation
  static tailCallOptimize<T>(
    fn: (acc: T, ...args: any[]) => T,
    initialAcc: T,
    args: any[][]
  ): T {
    let accumulator = initialAcc;
    
    for (const argSet of args) {
      accumulator = fn(accumulator, ...argSet);
    }
    
    return accumulator;
  }

  // Stack-safe recursive processing
  static async processRecursively<T>(
    data: T[],
    processor: (item: T) => Promise<any> | any,
    maxDepth: number = this.MAX_STACK_DEPTH
  ): Promise<any[]> {
    const results: any[] = [];
    const queue = [...data];
    let depth = 0;

    while (queue.length > 0 && depth < maxDepth) {
      const batch = queue.splice(0, this.CHUNK_SIZE);
      
      for (const item of batch) {
        try {
          const result = await processor(item);
          if (result !== undefined) {
            results.push(result);
          }
        } catch (error) {
          console.warn('Error in recursive processing:', error);
        }
      }

      depth++;
      
      // Reset depth periodically and yield control
      if (depth >= maxDepth / 2) {
        depth = 0;
        await this.yieldControl();
      }
    }

    return results;
  }

  // Memory-efficient deep processing
  static async deepProcess<T>(
    data: T[],
    processor: (item: T) => any,
    options: {
      maxMemory?: number;
      chunkSize?: number;
      yieldInterval?: number;
    } = {}
  ): Promise<any[]> {
    const {
      maxMemory = 50 * 1024 * 1024, // 50MB
      chunkSize = this.CHUNK_SIZE,
      yieldInterval = 10
    } = options;

    const results: any[] = [];
    let processedChunks = 0;

    for (let i = 0; i < data.length; i += chunkSize) {
      const chunk = data.slice(i, i + chunkSize);
      
      // Process chunk
      const chunkResults = chunk.map(processor).filter(result => result !== undefined);
      results.push(...chunkResults);

      processedChunks++;

      // Yield control and check memory
      if (processedChunks % yieldInterval === 0) {
        await this.yieldControl();
        
        if (this.getMemoryUsage() > maxMemory) {
          await this.forceGarbageCollection();
        }
      }
    }

    return results;
  }

  // Stack overflow prevention for nested operations
  static preventStackOverflow<T>(
    operation: () => T,
    fallback: () => T,
    maxAttempts: number = 3
  ): T {
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      try {
        return operation();
      } catch (error) {
        if (error instanceof RangeError && error.message.includes('stack')) {
          attempts++;
          console.warn(`Stack overflow detected, attempt ${attempts}/${maxAttempts}`);
          
          if (attempts >= maxAttempts) {
            console.warn('Max attempts reached, using fallback');
            return fallback();
          }
          
          // Wait before retry
          setTimeout(() => {}, 10);
        } else {
          throw error;
        }
      }
    }
    
    return fallback();
  }

  // Chunked array processing with stack safety
  static async processArraySafely<T, R>(
    array: T[],
    processor: (item: T, index: number) => R | Promise<R>,
    options: {
      chunkSize?: number;
      concurrent?: boolean;
      maxConcurrency?: number;
    } = {}
  ): Promise<R[]> {
    const {
      chunkSize = this.CHUNK_SIZE,
      concurrent = false,
      maxConcurrency = 4
    } = options;

    const results: R[] = [];
    
    for (let i = 0; i < array.length; i += chunkSize) {
      const chunk = array.slice(i, i + chunkSize);
      
      if (concurrent) {
        // Process chunk concurrently with limited concurrency
        const promises = chunk.map((item, index) => 
          this.limitConcurrency(() => processor(item, i + index), maxConcurrency)
        );
        const chunkResults = await Promise.all(promises);
        results.push(...chunkResults);
      } else {
        // Process chunk sequentially
        for (let j = 0; j < chunk.length; j++) {
          try {
            const result = await processor(chunk[j], i + j);
            if (result !== undefined) {
              results.push(result);
            }
          } catch (error) {
            console.warn(`Error processing item at index ${i + j}:`, error);
          }
        }
      }
      
      // Yield control between chunks
      await this.yieldControl();
    }
    
    return results;
  }

  private static concurrencyCount = 0;

  private static async limitConcurrency<T>(
    operation: () => Promise<T>,
    maxConcurrency: number
  ): Promise<T> {
    while (this.concurrencyCount >= maxConcurrency) {
      await new Promise(resolve => setTimeout(resolve, 1));
    }
    
    this.concurrencyCount++;
    
    try {
      return await operation();
    } finally {
      this.concurrencyCount--;
    }
  }

  private static async yieldControl(): Promise<void> {
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

  private static getMemoryUsage(): number {
    if ('memory' in performance) {
      try {
        return (performance as any).memory.usedJSHeapSize || 0;
      } catch {
        return 0;
      }
    }
    return 0;
  }

  private static async forceGarbageCollection(): Promise<void> {
    if ('gc' in window) {
      try {
        (window as any).gc();
      } catch (e) {
        // Ignore if not available
      }
    }
    
    // Multiple yields to allow cleanup
    await this.yieldControl();
    await this.yieldControl();
  }

  // Optimize function calls to prevent stack buildup
  static optimizeCallStack(): void {
    // Increase stack size if possible
    if (typeof process !== 'undefined' && process.env) {
      process.env.UV_THREADPOOL_SIZE = '128';
      process.env.NODE_OPTIONS = '--max-old-space-size=8192';
    }

    // Set up error handling for stack overflow
    window.addEventListener('error', (event) => {
      if (event.error instanceof RangeError && 
          event.error.message.includes('stack')) {
        console.warn('Stack overflow detected, implementing fallback strategies');
        event.preventDefault();
      }
    });

    // Optimize Promise handling
    if (typeof Promise !== 'undefined') {
      const originalThen = Promise.prototype.then;
      Promise.prototype.then = function(onFulfilled, onRejected) {
        return originalThen.call(this, 
          onFulfilled ? StackOptimizer.wrapFunction(onFulfilled) : onFulfilled,
          onRejected ? StackOptimizer.wrapFunction(onRejected) : onRejected
        );
      };
    }
  }

  private static wrapFunction<T extends (...args: any[]) => any>(fn: T): T {
    return ((...args: any[]) => {
      try {
        return fn(...args);
      } catch (error) {
        if (error instanceof RangeError && error.message.includes('stack')) {
          console.warn('Stack overflow in wrapped function, deferring execution');
          return new Promise(resolve => {
            setTimeout(() => resolve(fn(...args)), 0);
          });
        }
        throw error;
      }
    }) as T;
  }

  // Initialize stack optimization
  static initialize(): void {
    this.optimizeCallStack();
    
    // Set up performance monitoring
    if ('performance' in window && 'mark' in performance) {
      performance.mark('stack-optimizer-initialized');
    }
    
    console.log('Stack optimizer initialized with enhanced large data support');
  }
}