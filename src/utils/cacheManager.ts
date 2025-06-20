export class CacheManager {
  private static readonly CACHE_PREFIX = 'excel_analyzer_';
  private static readonly MAX_CACHE_SIZE = 50 * 1024 * 1024; // 50MB
  private static readonly CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

  static setItem(key: string, data: any, expiryHours: number = 24): boolean {
    try {
      const cacheKey = this.CACHE_PREFIX + key;
      const cacheData = {
        data,
        timestamp: Date.now(),
        expiry: Date.now() + (expiryHours * 60 * 60 * 1000)
      };
      
      const serialized = JSON.stringify(cacheData);
      
      // Check if adding this item would exceed cache size
      if (this.getCacheSize() + serialized.length > this.MAX_CACHE_SIZE) {
        this.clearOldestItems();
      }
      
      localStorage.setItem(cacheKey, serialized);
      return true;
    } catch (error) {
      console.warn('Failed to cache item:', error);
      return false;
    }
  }

  static getItem<T>(key: string): T | null {
    try {
      const cacheKey = this.CACHE_PREFIX + key;
      const cached = localStorage.getItem(cacheKey);
      
      if (!cached) return null;
      
      const cacheData = JSON.parse(cached);
      
      // Check if expired
      if (Date.now() > cacheData.expiry) {
        localStorage.removeItem(cacheKey);
        return null;
      }
      
      return cacheData.data;
    } catch (error) {
      console.warn('Failed to retrieve cached item:', error);
      return null;
    }
  }

  static removeItem(key: string): void {
    const cacheKey = this.CACHE_PREFIX + key;
    localStorage.removeItem(cacheKey);
  }

  static clearCache(): void {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(this.CACHE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  }

  static getCacheSize(): number {
    let totalSize = 0;
    const keys = Object.keys(localStorage);
    
    keys.forEach(key => {
      if (key.startsWith(this.CACHE_PREFIX)) {
        const item = localStorage.getItem(key);
        if (item) {
          totalSize += item.length;
        }
      }
    });
    
    return totalSize;
  }

  static clearOldestItems(): void {
    const cacheItems: Array<{ key: string; timestamp: number }> = [];
    const keys = Object.keys(localStorage);
    
    keys.forEach(key => {
      if (key.startsWith(this.CACHE_PREFIX)) {
        try {
          const item = localStorage.getItem(key);
          if (item) {
            const data = JSON.parse(item);
            cacheItems.push({ key, timestamp: data.timestamp });
          }
        } catch (error) {
          // Remove corrupted items
          localStorage.removeItem(key);
        }
      }
    });
    
    // Sort by timestamp and remove oldest 25%
    cacheItems.sort((a, b) => a.timestamp - b.timestamp);
    const itemsToRemove = Math.ceil(cacheItems.length * 0.25);
    
    for (let i = 0; i < itemsToRemove; i++) {
      localStorage.removeItem(cacheItems[i].key);
    }
  }

  static getCacheStats(): { size: number; itemCount: number; sizeFormatted: string } {
    const size = this.getCacheSize();
    const keys = Object.keys(localStorage).filter(key => key.startsWith(this.CACHE_PREFIX));
    
    return {
      size,
      itemCount: keys.length,
      sizeFormatted: this.formatBytes(size)
    };
  }

  private static formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}