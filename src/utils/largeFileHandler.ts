import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { Cell } from '../types/spreadsheet';
import { WorkbookData, WorksheetData } from '../types/workbook';
import { PerformanceOptimizer } from './performanceOptimizer';

export class LargeFileHandler {
  private static readonly MAX_CELLS_PER_CHUNK = 2000; // Reduced for better performance
  private static readonly MAX_FILE_SIZE = 100 * 1024 * 1024; // Increased to 100MB
  private static readonly MEMORY_THRESHOLD = 50 * 1024 * 1024; // 50MB memory threshold

  static async readLargeExcelFile(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<WorkbookData> {
    // Check file size
    if (file.size > this.MAX_FILE_SIZE) {
      throw new Error(`File too large. Maximum size is ${this.MAX_FILE_SIZE / 1024 / 1024}MB`);
    }

    onProgress?.(5);

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          onProgress?.(15);
          
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          
          // Use streaming options for large files
          const workbook = XLSX.read(data, { 
            type: 'array',
            cellDates: false, // Disable date parsing for performance
            cellNF: false,    // Disable number formatting
            cellText: false,  // Disable text formatting
            sheetStubs: false, // Skip empty cells
            bookDeps: false,  // Skip dependencies
            bookFiles: false, // Skip file list
            bookProps: false, // Skip properties
            bookSheets: false, // Skip sheet info
            bookVBA: false,   // Skip VBA
            dense: true       // Use dense mode for better memory usage
          });
          
          onProgress?.(30);
          
          if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
            throw new Error('No worksheets found in the file');
          }
          
          const worksheets: WorksheetData[] = [];
          const totalSheets = workbook.SheetNames.length;
          
          // Limit number of sheets for performance
          const maxSheets = Math.min(totalSheets, 10);
          
          for (let i = 0; i < maxSheets; i++) {
            const sheetName = workbook.SheetNames[i];
            
            try {
              const worksheet = workbook.Sheets[sheetName];
              if (!worksheet) continue;
              
              // Process sheet with memory management
              const sheetData = await this.processWorksheetOptimized(
                worksheet,
                sheetName,
                (sheetProgress) => {
                  const totalProgress = 30 + (i / maxSheets) * 60 + (sheetProgress / maxSheets) * 60;
                  onProgress?.(Math.min(totalProgress, 95));
                }
              );
              
              if (sheetData) {
                worksheets.push(sheetData);
              }
              
              // Force cleanup after each sheet
              await this.cleanupMemory();
              
            } catch (sheetError) {
              console.warn(`Error processing sheet ${sheetName}:`, sheetError);
              // Continue with other sheets
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
      
      // Limit processing for very large sheets
      const maxRows = Math.min(totalRows, 10000); // Limit to 10k rows
      const maxCols = Math.min(totalCols, 100);   // Limit to 100 columns
      
      if (totalCells > 100000) { // More than 100k cells
        console.warn(`Large sheet detected (${totalCells} cells). Processing first ${maxRows}x${maxCols} area.`);
      }
      
      const cells: { [key: string]: Cell } = {};
      let processedCells = 0;
      let maxRow = 0;
      let maxCol = 0;
      
      // Process in smaller chunks for better performance
      const rowChunkSize = Math.min(100, Math.floor(this.MAX_CELLS_PER_CHUNK / maxCols));
      
      for (let startRow = range.s.r; startRow < range.s.r + maxRows; startRow += rowChunkSize) {
        const endRow = Math.min(startRow + rowChunkSize - 1, range.s.r + maxRows - 1);
        
        // Process chunk of rows
        for (let row = startRow; row <= endRow; row++) {
          for (let col = range.s.c; col < range.s.c + maxCols; col++) {
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
            
            processedCells++;
          }
        }
        
        // Update progress more frequently
        if (onProgress && processedCells % 1000 === 0) {
          const progress = (processedCells / (maxRows * maxCols)) * 100;
          onProgress(Math.min(progress, 95));
        }
        
        // Yield control and check memory more frequently
        if (startRow % (rowChunkSize * 5) === 0) {
          await PerformanceOptimizer.yieldToMain();
          
          if (this.getMemoryUsage() > this.MEMORY_THRESHOLD) {
            await this.cleanupMemory();
          }
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

  private static isValidCellData(cellData: any): boolean {
    return cellData && 
           cellData.v !== null && 
           cellData.v !== undefined && 
           cellData.v !== '' &&
           cellData.v !== 0; // Skip zero values for performance
  }

  private static processCellValueSafe(cellData: any): any {
    try {
      if (cellData.t === 'n') {
        return Number(cellData.v);
      } else if (cellData.t === 's' || cellData.t === 'str') {
        const strValue = String(cellData.v);
        return strValue.length > 1000 ? strValue.substring(0, 1000) + '...' : strValue; // Truncate very long strings
      } else if (cellData.t === 'b') {
        return Boolean(cellData.v);
      } else if (cellData.t === 'd') {
        return cellData.v instanceof Date ? cellData.v.toISOString().split('T')[0] : String(cellData.v);
      } else {
        const value = String(cellData.v);
        return value.length > 1000 ? value.substring(0, 1000) + '...' : value;
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
      // Check if it's a date string
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

    return new Promise((resolve, reject) => {
      const cells: { [key: string]: Cell } = {};
      let rowIndex = 0;
      let processedRows = 0;
      const maxRows = 50000; // Limit CSV rows
      const maxCols = 100;   // Limit CSV columns
      
      Papa.parse(file, {
        step: (results: any) => {
          try {
            if (results.data && Array.isArray(results.data) && rowIndex < maxRows) {
              const row = results.data.slice(0, maxCols); // Limit columns
              
              row.forEach((cellValue: any, colIndex: number) => {
                if (cellValue && String(cellValue).trim() && colIndex < maxCols) {
                  const cellId = `${this.numberToColumn(colIndex + 1)}${rowIndex + 1}`;
                  const trimmedValue = String(cellValue).trim();
                  
                  // Truncate very long values
                  const finalValue = trimmedValue.length > 500 ? trimmedValue.substring(0, 500) + '...' : trimmedValue;
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
              
              rowIndex++;
              processedRows++;
              
              // Update progress every 100 rows
              if (processedRows % 100 === 0 && onProgress) {
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
        fastMode: true, // Enable fast mode for better performance
        chunk: 8192,   // Smaller chunks for better responsiveness
        worker: false  // Disable worker to avoid compatibility issues
      });
    });
  }

  private static async cleanupMemory(): Promise<void> {
    // Force garbage collection if available
    if ('gc' in window) {
      try {
        (window as any).gc();
      } catch (e) {
        // Ignore if gc is not available
      }
    }
    
    // Yield to allow cleanup
    await PerformanceOptimizer.yieldToMain();
  }

  private static getMemoryUsage(): number {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize || 0;
    }
    return 0;
  }

  static canProcessFile(file: File): { canProcess: boolean; reason?: string } {
    if (file.size > this.MAX_FILE_SIZE) {
      return {
        canProcess: false,
        reason: `File too large. Maximum size is ${this.MAX_FILE_SIZE / 1024 / 1024}MB`
      };
    }

    // Check available memory
    const availableMemory = this.getAvailableMemory();
    const estimatedMemory = this.estimateMemoryUsage(file);
    
    if (estimatedMemory > availableMemory * 0.8) { // Use 80% of available memory
      return {
        canProcess: false,
        reason: 'File may be too large for available memory. Try a smaller file or close other browser tabs.'
      };
    }

    return { canProcess: true };
  }

  private static estimateMemoryUsage(file: File): number {
    // More conservative estimation: file size * 2
    return file.size * 2;
  }

  private static getAvailableMemory(): number {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return memory.jsHeapSizeLimit - memory.usedJSHeapSize;
    }
    return 200 * 1024 * 1024; // Default 200MB
  }

  static getFileInfo(file: File): {
    size: string;
    estimatedCells: number;
    estimatedMemory: string;
    processingTime: string;
  } {
    const sizeInMB = file.size / (1024 * 1024);
    const estimatedCells = Math.floor(file.size / 20); // Rough estimate
    const estimatedMemory = this.estimateMemoryUsage(file) / (1024 * 1024);
    const processingTime = Math.max(5, Math.floor(sizeInMB * 2)); // Rough estimate in seconds

    return {
      size: `${sizeInMB.toFixed(1)} MB`,
      estimatedCells,
      estimatedMemory: `${estimatedMemory.toFixed(1)} MB`,
      processingTime: `${processingTime} seconds`
    };
  }
}