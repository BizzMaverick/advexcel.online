import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { Cell } from '../types/spreadsheet';
import { WorkbookData, WorksheetData } from '../types/workbook';
import { PerformanceOptimizer } from './performanceOptimizer';
import { StackOptimizer } from './stackOptimizer';
import { MemoryManager } from './memoryManager';

export class LargeFileHandler {
  private static readonly MAX_CELLS_PER_CHUNK = 1000; // Optimized chunk size
  private static readonly MAX_FILE_SIZE = 500 * 1024 * 1024; // Increased to 500MB
  private static readonly MEMORY_THRESHOLD = 100 * 1024 * 1024; // 100MB memory threshold
  private static readonly MAX_ROWS_PER_SHEET = 100000; // Increased row limit
  private static readonly MAX_COLS_PER_SHEET = 500; // Increased column limit

  static async readLargeExcelFile(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<WorkbookData> {
    // Initialize memory management
    MemoryManager.initialize();
    
    // Check file size and memory
    const canProcess = this.canProcessFile(file);
    if (!canProcess.canProcess) {
      throw new Error(canProcess.reason);
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
              cellDates: false,
              cellNF: false,
              cellText: false,
              sheetStubs: false,
              bookDeps: false,
              bookFiles: false,
              bookProps: false,
              bookSheets: false,
              bookVBA: false,
              dense: true,
              // Additional optimizations for large files
              raw: true,
              codepage: 65001, // UTF-8
              FS: '\t'
            });
            
            onProgress?.(30);
            
            if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
              throw new Error('No worksheets found in the file');
            }
            
            const worksheets: WorksheetData[] = [];
            const totalSheets = workbook.SheetNames.length;
            
            // Process sheets with stack optimization
            await StackOptimizer.processArraySafely(
              workbook.SheetNames.slice(0, 20), // Limit to 20 sheets max
              async (sheetName, index) => {
                try {
                  const worksheet = workbook.Sheets[sheetName];
                  if (!worksheet) return;
                  
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
              },
              { chunkSize: 1, concurrent: false }
            );
            
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
      const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:A1');
      const totalRows = range.e.r - range.s.r + 1;
      const totalCols = range.e.c - range.s.c + 1;
      const totalCells = totalRows * totalCols;
      
      // Apply intelligent limits based on file size and memory
      const maxRows = Math.min(totalRows, this.MAX_ROWS_PER_SHEET);
      const maxCols = Math.min(totalCols, this.MAX_COLS_PER_SHEET);
      
      if (totalCells > 500000) { // More than 500k cells
        console.warn(`Very large sheet detected (${totalCells} cells). Processing optimized subset: ${maxRows}x${maxCols}.`);
      }
      
      const cells: { [key: string]: Cell } = {};
      let maxRow = 0;
      let maxCol = 0;
      
      // Use stack-optimized processing
      await StackOptimizer.processRecursively(
        this.generateCellCoordinates(range.s.r, range.s.c, maxRows, maxCols),
        async (coord: { row: number; col: number }) => {
          const { row, col } = coord;
          const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
          const cellData = worksheet[cellAddress];
          
          if (cellData && this.isValidCellData(cellData)) {
            const cellId = `${this.numberToColumn(col + 1)}${row + 1}`;
            const value = this.processCellValueSafe(cellData);
            
            if (value !== null && value !== undefined && value !== '') {
              cells[cellId] = {
                id: cellId,
                row: row + 1,
                col: col + 1,
                value,
                type: this.determineCellType(value),
              };
              
              maxRow = Math.max(maxRow, row + 1);
              maxCol = Math.max(maxCol, col + 1);
            }
          }
        },
        1000 // Max recursion depth
      );
      
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
        const strValue = String(cellData.v);
        return strValue.length > 2000 ? strValue.substring(0, 2000) + '...' : strValue;
      } else if (cellData.t === 'b') {
        return Boolean(cellData.v);
      } else if (cellData.t === 'd') {
        return cellData.v instanceof Date ? cellData.v.toISOString().split('T')[0] : String(cellData.v);
      } else {
        const value = String(cellData.v);
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
    return result;
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
        
        Papa.parse(file, {
          step: (results: any) => {
            try {
              if (results.data && Array.isArray(results.data) && rowIndex < maxRows) {
                const row = results.data.slice(0, maxCols);
                
                // Use stack-safe processing for each row
                StackOptimizer.trampoline(() => {
                  row.forEach((cellValue: any, colIndex: number) => {
                    if (cellValue && String(cellValue).trim() && colIndex < maxCols) {
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
                  });
                  
                  return null; // End trampoline
                });
                
                rowIndex++;
                processedRows++;
                
                // Update progress every 500 rows for better performance
                if (processedRows % 500 === 0 && onProgress) {
                  const progress = Math.min((processedRows / maxRows) * 90, 90);
                  onProgress(progress);
                }
              }
            } catch (error) {
              console.warn('Error processing CSV row:', error);
            }
          },
          complete: () => {
            onProgress?.(100);
            resolve(cells);
          },
          error: (error: any) => {
            reject(new Error(`CSV parsing error: ${error.message}`));
          },
          header: false,
          skipEmptyLines: true,
          fastMode: true,
          chunk: 16384, // Larger chunks for better performance
          worker: false
        });
      });
    });
  }

  static canProcessFile(file: File): { canProcess: boolean; reason?: string } {
    if (file.size > this.MAX_FILE_SIZE) {
      return {
        canProcess: false,
        reason: `File too large. Maximum size is ${this.MAX_FILE_SIZE / 1024 / 1024}MB`
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
    const extension = file.name.toLowerCase().split('.').pop();
    
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