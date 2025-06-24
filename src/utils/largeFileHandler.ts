import * as XLSX from 'xlsx';
import { Cell } from '../types/spreadsheet';
import { WorkbookData, WorksheetData } from '../types/workbook';
import { PerformanceOptimizer } from './performanceOptimizer';

export class LargeFileHandler {
  private static readonly MAX_CELLS_PER_CHUNK = 5000;
  private static readonly MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

  static async readLargeExcelFile(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<WorkbookData> {
    // Check file size
    if (file.size > this.MAX_FILE_SIZE) {
      throw new Error(`File too large. Maximum size is ${this.MAX_FILE_SIZE / 1024 / 1024}MB`);
    }

    onProgress?.(10);

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          onProgress?.(30);
          
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { 
            type: 'array',
            cellDates: true,
            cellNF: false,
            cellText: false
          });
          
          onProgress?.(50);
          
          if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
            throw new Error('No worksheets found in the file');
          }
          
          const worksheets: WorksheetData[] = [];
          const totalSheets = workbook.SheetNames.length;
          
          for (let i = 0; i < workbook.SheetNames.length; i++) {
            const sheetName = workbook.SheetNames[i];
            
            try {
              const worksheet = workbook.Sheets[sheetName];
              if (!worksheet) continue;
              
              // Process sheet in chunks to avoid memory issues
              const sheetData = await this.processWorksheetInChunks(
                worksheet,
                sheetName,
                (sheetProgress) => {
                  const totalProgress = 50 + (i / totalSheets) * 40 + (sheetProgress / totalSheets) * 40;
                  onProgress?.(totalProgress);
                }
              );
              
              worksheets.push(sheetData);
              
              // Yield control after each sheet
              await PerformanceOptimizer.yieldToMain();
              
            } catch (sheetError) {
              console.warn(`Error processing sheet ${sheetName}:`, sheetError);
            }
          }
          
          if (worksheets.length === 0) {
            throw new Error('No valid worksheets could be processed');
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
      
      reader.readAsArrayBuffer(file);
    });
  }

  private static async processWorksheetInChunks(
    worksheet: XLSX.WorkSheet,
    sheetName: string,
    onProgress?: (progress: number) => void
  ): Promise<WorksheetData> {
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:A1');
    const totalCells = (range.e.r - range.s.r + 1) * (range.e.c - range.s.c + 1);
    
    // If small dataset, process normally
    if (totalCells <= this.MAX_CELLS_PER_CHUNK) {
      return this.processWorksheetNormally(worksheet, sheetName);
    }
    
    // Process large dataset in chunks
    const cells: { [key: string]: Cell } = {};
    let processedCells = 0;
    let maxRow = 0;
    let maxCol = 0;
    
    // Process row by row to manage memory
    const rowChunkSize = Math.max(1, Math.floor(this.MAX_CELLS_PER_CHUNK / (range.e.c - range.s.c + 1)));
    
    for (let startRow = range.s.r; startRow <= range.e.r; startRow += rowChunkSize) {
      const endRow = Math.min(startRow + rowChunkSize - 1, range.e.r);
      
      // Process chunk of rows
      for (let row = startRow; row <= endRow; row++) {
        for (let col = range.s.c; col <= range.e.c; col++) {
          const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
          const cellData = worksheet[cellAddress];
          
          if (cellData && cellData.v !== null && cellData.v !== undefined && cellData.v !== '') {
            const cellId = `${this.numberToColumn(col + 1)}${row + 1}`;
            const value = this.processCellValue(cellData);
            
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
          
          processedCells++;
        }
      }
      
      // Update progress
      if (onProgress) {
        onProgress((processedCells / totalCells) * 100);
      }
      
      // Yield control periodically
      await PerformanceOptimizer.yieldToMain();
      
      // Check memory usage
      if (PerformanceOptimizer.getMemoryUsage() > 80 * 1024 * 1024) { // 80MB
        await PerformanceOptimizer.forceGarbageCollection();
      }
    }
    
    return {
      name: sheetName,
      cells,
      isActive: false,
      rowCount: maxRow,
      columnCount: maxCol
    };
  }

  private static processWorksheetNormally(
    worksheet: XLSX.WorkSheet,
    sheetName: string
  ): WorksheetData {
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
      header: 1,
      defval: '',
      raw: false,
      blankrows: false
    }) as any[][];
    
    const cells: { [key: string]: Cell } = {};
    let maxRow = 0;
    let maxCol = 0;
    
    jsonData.forEach((row, rowIndex) => {
      if (Array.isArray(row)) {
        row.forEach((cellValue, colIndex) => {
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
        });
      }
    });
    
    return {
      name: sheetName,
      cells,
      isActive: false,
      rowCount: maxRow,
      columnCount: maxCol
    };
  }

  private static processCellValue(cellData: any): any {
    if (cellData.t === 'n') {
      return Number(cellData.v);
    } else if (cellData.t === 'd') {
      return cellData.v; // Date
    } else if (cellData.t === 'b') {
      return Boolean(cellData.v);
    } else {
      return String(cellData.v);
    }
  }

  private static determineCellType(value: any): 'text' | 'number' | 'date' | 'formula' {
    if (typeof value === 'number') return 'number';
    if (value instanceof Date) return 'date';
    if (typeof value === 'string' && value.startsWith('=')) return 'formula';
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
      let processedBytes = 0;
      
      const Papa = require('papaparse');
      
      Papa.parse(file, {
        step: (results: any) => {
          if (results.data && Array.isArray(results.data)) {
            results.data.forEach((cellValue: any, colIndex: number) => {
              if (cellValue && cellValue.trim()) {
                const cellId = `${this.numberToColumn(colIndex + 1)}${rowIndex + 1}`;
                const numValue = Number(cellValue.trim());
                
                cells[cellId] = {
                  id: cellId,
                  row: rowIndex + 1,
                  col: colIndex + 1,
                  value: isNaN(numValue) ? cellValue.trim() : numValue,
                  type: isNaN(numValue) ? 'text' : 'number',
                };
              }
            });
            
            rowIndex++;
            processedBytes += JSON.stringify(results.data).length;
            
            // Update progress
            if (onProgress) {
              const progress = Math.min((processedBytes / file.size) * 100, 95);
              onProgress(progress);
            }
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
        chunk: 1024 * 1024, // 1MB chunks
        worker: false // Disable worker for now due to compatibility issues
      });
    });
  }

  static estimateMemoryUsage(file: File): number {
    // Rough estimation: file size * 3 (for processing overhead)
    return file.size * 3;
  }

  static canProcessFile(file: File): { canProcess: boolean; reason?: string } {
    if (file.size > this.MAX_FILE_SIZE) {
      return {
        canProcess: false,
        reason: `File too large. Maximum size is ${this.MAX_FILE_SIZE / 1024 / 1024}MB`
      };
    }

    const estimatedMemory = this.estimateMemoryUsage(file);
    const availableMemory = this.getAvailableMemory();
    
    if (estimatedMemory > availableMemory) {
      return {
        canProcess: false,
        reason: 'Insufficient memory to process this file'
      };
    }

    return { canProcess: true };
  }

  private static getAvailableMemory(): number {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return memory.jsHeapSizeLimit - memory.usedJSHeapSize;
    }
    return 100 * 1024 * 1024; // Default 100MB
  }
}