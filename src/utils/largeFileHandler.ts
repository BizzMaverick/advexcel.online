import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { Cell } from '../types/spreadsheet';
import { WorkbookData, WorksheetData } from '../types/workbook';
import { PerformanceOptimizer } from './performanceOptimizer';
import { StackOptimizer } from './stackOptimizer';
import { MemoryManager } from './memoryManager';

export class LargeFileHandler {
  private static readonly MAX_CELLS_PER_CHUNK = 1000; // Optimized chunk size
  private static readonly MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB
  private static readonly MEMORY_THRESHOLD = 100 * 1024 * 1024; // 100MB memory threshold
  private static readonly MAX_ROWS_PER_SHEET = 100000; // 100k rows limit
  private static readonly MAX_COLS_PER_SHEET = 500; // 500 columns limit

  static async readLargeExcelFile(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<WorkbookData> {
    // Initialize memory management
    MemoryManager.initialize();
    
    // Check file size and memory
    const canProcess = this.canProcessFile(file);
    if (!canProcess.canProcess) {
      throw new Error(canProcess.reason || 'Cannot process this file');
    }

    onProgress?.(5);

    return MemoryManager.allocateForLargeData(file.size, async () => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = async (e) => {
          try {
            onProgress?.(15);
            
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            
            // Use optimized reading options for very large files
            const workbook = XLSX.read(data, { 
              type: 'array',
              cellDates: true, // Enable date parsing
              cellNF: true,    // Keep number formats
              cellText: false,
              sheetStubs: true, // Include empty cells
              bookDeps: false,
              bookFiles: false,
              bookProps: false,
              bookSheets: false,
              bookVBA: false,
              dense: false,    // Changed to false to ensure proper cell addressing
              raw: false       // Changed to false to ensure proper value parsing
            });
            
            onProgress?.(30);
            
            if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
              throw new Error('No worksheets found in the file');
            }
            
            const worksheets: WorksheetData[] = [];
            const totalSheets = workbook.SheetNames.length;
            
            // Process sheets with stack optimization
            for (let index = 0; index < workbook.SheetNames.length; index++) {
              const sheetName = workbook.SheetNames[index];
              try {
                const worksheet = workbook.Sheets[sheetName];
                if (!worksheet) continue;
                
                const sheetData = await this.processWorksheetOptimized(
                  worksheet,
                  sheetName,
                  (sheetProgress) => {
                    const totalProgress = 30 + (index / totalSheets) * 60 + (sheetProgress / totalSheets) * 60;
                    onProgress?.(Math.min(totalProgress, 95));
                  }
                );
                
                if (sheetData) {
                  worksheets.push(sheetData);
                }
              } catch (sheetError) {
                console.warn(`Error processing sheet ${sheetName}:`, sheetError);
              }
            }
            
            if (worksheets.length === 0) {
              throw new Error('No valid worksheets could be processed');
            }
            
            // Set first sheet as active
            if (worksheets.length > 0) {
              worksheets[0].isActive = true;
            }
            
            const workbookData: WorkbookData = {
              id: Date.now().toString(),
              name: file.name.replace(/\.[^/.]+$/, ''),
              worksheets,
              activeWorksheet: worksheets[0]?.name || 'Sheet1',
              createdAt: new Date(),
              lastModified: new Date()
            };
            
            onProgress?.(100);
            resolve(workbookData);
            
          } catch (error) {
            reject(new Error(`Failed to read Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`));
          }
        };
        
        reader.onerror = () => {
          reject(new Error('Failed to read file'));
        };
        
        // Use readAsArrayBuffer for better performance with large files
        reader.readAsArrayBuffer(file);
      });
    });
  }

  private static async processWorksheetOptimized(
    worksheet: XLSX.WorkSheet,
    sheetName: string,
    onProgress?: (progress: number) => void
  ): Promise<WorksheetData | null> {
    try {
      // Safely get range with fallback
      let range;
      try {
        range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:A1');
      } catch (error) {
        console.warn(`Error decoding range for sheet ${sheetName}:`, error);
        range = { s: { r: 0, c: 0 }, e: { r: 0, c: 0 } };
      }
      
      const totalRows = Math.max(0, range.e.r - range.s.r + 1);
      const totalCols = Math.max(0, range.e.c - range.s.c + 1);
      
      // Apply intelligent limits based on file size and memory
      const maxRows = Math.min(totalRows, this.MAX_ROWS_PER_SHEET);
      const maxCols = Math.min(totalCols, this.MAX_COLS_PER_SHEET);
      
      if (totalRows * totalCols > 500000) { // More than 500k cells
        console.warn(`Very large sheet detected (${totalRows * totalCols} cells). Processing optimized subset: ${maxRows}x${maxCols}.`);
      }
      
      // Convert to JSON with headers
      const jsonData = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        defval: '',
        raw: false,
        range: 0
      }) as any[][];
      
      const cells: { [key: string]: Cell } = {};
      let maxRow = 0;
      let maxCol = 0;
      
      // Process each row and column
      for (let rowIndex = 0; rowIndex < Math.min(jsonData.length, maxRows); rowIndex++) {
        const row = jsonData[rowIndex];
        if (!Array.isArray(row)) continue;
        
        for (let colIndex = 0; colIndex < Math.min(row.length, maxCols); colIndex++) {
          const cellValue = row[colIndex];
          
          if (cellValue !== null && cellValue !== undefined && cellValue !== '') {
            const cellId = `${this.numberToColumn(colIndex + 1)}${rowIndex + 1}`;
            const numValue = Number(cellValue);
            
            cells[cellId] = {
              id: cellId,
              row: rowIndex + 1,
              col: colIndex + 1,
              value: isNaN(numValue) ? cellValue : numValue,
              type: isNaN(numValue) ? 'text' : 'number',
            };
            
            maxRow = Math.max(maxRow, rowIndex + 1);
            maxCol = Math.max(maxCol, colIndex + 1);
          }
        }
        
        // Update progress every 100 rows
        if (rowIndex % 100 === 0 && onProgress) {
          onProgress((rowIndex / Math.min(jsonData.length, maxRows)) * 100);
        }
      }
      
      onProgress?.(100);
      
      return {
        name: sheetName,
        cells,
        isActive: false,
        rowCount: maxRow,
        columnCount: maxCol
      };
      
    } catch (error) {
      console.error(`Error processing worksheet ${sheetName}:`, error);
      return null;
    }
  }

  private static generateCellCoordinates(
    startRow: number,
    startCol: number,
    maxRows: number,
    maxCols: number
  ): Array<{ row: number; col: number }> {
    const coordinates: Array<{ row: number; col: number }> = [];
    
    // Safety check to prevent excessive memory usage
    const totalCells = maxRows * maxCols;
    if (totalCells > 1000000) {
      console.warn(`Limiting cell coordinates generation from ${totalCells} to 1,000,000 cells`);
      maxRows = Math.min(maxRows, 1000);
      maxCols = Math.min(maxCols, 1000);
    }
    
    for (let row = startRow; row < startRow + maxRows; row++) {
      for (let col = startCol; col < startCol + maxCols; col++) {
        coordinates.push({ row, col });
      }
    }
    
    return coordinates;
  }

  private static isValidCellData(cellData: any): boolean {
    return cellData && 
           cellData.v !== null && 
           cellData.v !== undefined && 
           cellData.v !== '';
  }

  private static processCellValueSafe(cellData: any): any {
    try {
      if (cellData.t === 'n') {
        return Number(cellData.v);
      } else if (cellData.t === 's' || cellData.t === 'str') {
        const strValue = String(cellData.v || '');
        return strValue.length > 2000 ? strValue.substring(0, 2000) + '...' : strValue;
      } else if (cellData.t === 'b') {
        return Boolean(cellData.v);
      } else if (cellData.t === 'd') {
        return cellData.v instanceof Date ? cellData.v.toISOString().split('T')[0] : String(cellData.v);
      } else {
        const value = String(cellData.v || '');
        return value.length > 2000 ? value.substring(0, 2000) + '...' : value;
      }
    } catch (error) {
      return String(cellData.v || '');
    }
  }

  private static determineCellType(value: any): 'text' | 'number' | 'date' | 'formula' {
    if (typeof value === 'number') return 'number';
    if (value instanceof Date) return 'date';
    if (typeof value === 'string') {
      if (value.startsWith('=')) return 'formula';
      if (/^\d{4}-\d{2}-\d{2}/.test(value)) return 'date';
    }
    return 'text';
  }

  private static numberToColumn(num: number): string {
    let result = '';
    while (num > 0) {
      num--;
      result = String.fromCharCode(65 + (num % 26)) + result;
      num = Math.floor(num / 26);
    }
    return result || 'A'; // Fallback to 'A' if calculation fails
  }

  static async readLargeCSVFile(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<{ [key: string]: Cell }> {
    if (file.size > this.MAX_FILE_SIZE) {
      throw new Error(`File too large. Maximum size is ${this.MAX_FILE_SIZE / 1024 / 1024}MB`);
    }

    return MemoryManager.allocateForLargeData(file.size, async () => {
      return new Promise((resolve, reject) => {
        const cells: { [key: string]: Cell } = {};
        let rowIndex = 0;
        let processedRows = 0;
        const maxRows = this.MAX_ROWS_PER_SHEET;
        const maxCols = this.MAX_COLS_PER_SHEET;
        
        // Use a more robust error handling approach
        try {
          Papa.parse(file, {
            complete: (results) => {
              try {
                if (results.data && Array.isArray(results.data)) {
                  const rows = results.data as any[][];
                  
                  for (let rowIndex = 0; rowIndex < Math.min(rows.length, maxRows); rowIndex++) {
                    const row = rows[rowIndex];
                    if (!Array.isArray(row)) continue;
                    
                    for (let colIndex = 0; colIndex < Math.min(row.length, maxCols); colIndex++) {
                      const cellValue = row[colIndex];
                      
                      if (cellValue !== null && cellValue !== undefined && String(cellValue).trim()) {
                        const cellId = `${this.numberToColumn(colIndex + 1)}${rowIndex + 1}`;
                        const trimmedValue = String(cellValue).trim();
                        
                        const finalValue = trimmedValue.length > 1000 ? trimmedValue.substring(0, 1000) + '...' : trimmedValue;
                        const numValue = Number(finalValue);
                        
                        cells[cellId] = {
                          id: cellId,
                          row: rowIndex + 1,
                          col: colIndex + 1,
                          value: isNaN(numValue) ? finalValue : numValue,
                          type: isNaN(numValue) ? 'text' : 'number',
                        };
                      }
                    }
                    
                    // Update progress every 100 rows
                    if (rowIndex % 100 === 0 && onProgress) {
                      const progress = Math.min((rowIndex / Math.min(rows.length, maxRows)) * 100, 100);
                      onProgress(progress);
                    }
                  }
                  
                  onProgress?.(100);
                  resolve(cells);
                } else {
                  throw new Error('Invalid CSV data structure');
                }
              } catch (error) {
                reject(new Error(`Error processing CSV data: ${error instanceof Error ? error.message : 'Unknown error'}`));
              }
            },
            error: (error: any) => {
              reject(new Error(`CSV parsing error: ${error.message}`));
            },
            header: false,
            skipEmptyLines: true,
            worker: navigator.hardwareConcurrency > 4, // Use worker only if enough cores available
            preview: maxRows // Limit preview to max rows
          });
        } catch (error) {
          reject(new Error(`Failed to parse CSV: ${error instanceof Error ? error.message : 'Unknown error'}`));
        }
      });
    });
  }

  static canProcessFile(file: File): { canProcess: boolean; reason?: string } {
    if (file.size > this.MAX_FILE_SIZE) {
      return {
        canProcess: false,
        reason: `File too large. Maximum size is ${Math.floor(this.MAX_FILE_SIZE / 1024 / 1024)}MB`
      };
    }

    // Check available memory with more sophisticated calculation
    const memoryStats = MemoryManager.getMemoryStats();
    const estimatedMemory = this.estimateMemoryUsage(file);
    
    if (estimatedMemory > memoryStats.available * 0.7) {
      return {
        canProcess: false,
        reason: 'File may be too large for available memory. Try closing other browser tabs or use a smaller file.'
      };
    }

    // Check if browser supports required features
    if (!('ArrayBuffer' in window) || !('Uint8Array' in window)) {
      return {
        canProcess: false,
        reason: 'Browser does not support required features for large file processing.'
      };
    }

    return { canProcess: true };
  }

  private static estimateMemoryUsage(file: File): number {
    // More accurate estimation based on file type
    const extension = file.name.toLowerCase().split('.').pop() || '';
    
    switch (extension) {
      case 'xlsx':
      case 'xlsm':
        return file.size * 3; // Excel files expand more due to XML structure
      case 'xls':
        return file.size * 2.5;
      case 'csv':
        return file.size * 1.5; // CSV is more efficient
      default:
        return file.size * 2;
    }
  }

  static getFileInfo(file: File): {
    size: string;
    estimatedCells: number;
    estimatedMemory: string;
    processingTime: string;
    recommendations: string[];
  } {
    const sizeInMB = file.size / (1024 * 1024);
    const estimatedCells = Math.floor(file.size / 15); // More accurate estimate
    const estimatedMemory = this.estimateMemoryUsage(file) / (1024 * 1024);
    const processingTime = Math.max(3, Math.floor(sizeInMB * 1.5));

    const recommendations: string[] = [];
    
    if (sizeInMB > 50) {
      recommendations.push('Large file detected - processing may take several minutes');
    }
    
    if (estimatedMemory > 200) {
      recommendations.push('High memory usage expected - close other browser tabs for best performance');
    }
    
    if (estimatedCells > 100000) {
      recommendations.push('Large dataset - some rows/columns may be automatically limited for optimal performance');
    }

    return {
      size: `${sizeInMB.toFixed(1)} MB`,
      estimatedCells,
      estimatedMemory: `${estimatedMemory.toFixed(1)} MB`,
      processingTime: `${processingTime} seconds`,
      recommendations
    };
  }

  // Initialize optimizations
  static initialize(): void {
    StackOptimizer.initialize();
    MemoryManager.initialize();
    
    // Set up global error handling for large file operations
    window.addEventListener('error', (event) => {
      if (event.error && (
        event.error.message?.includes('out of memory') ||
        event.error.message?.includes('Maximum call stack')
      )) {
        console.error('Large file processing error:', event.error);
        MemoryManager.cleanup();
      }
    });
    
    console.log('Large file handler initialized with enhanced memory management and stack optimization');
  }
}