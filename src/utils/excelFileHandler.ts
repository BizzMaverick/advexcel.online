import * as XLSX from 'xlsx';
import { Cell } from '../types/spreadsheet';
import { ExportOptions } from '../components/ExportModal';

export class ExcelFileHandler {
  static async readExcelFile(file: File): Promise<{ [key: string]: Cell }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Get the first worksheet
          const firstSheetName = workbook.SheetNames[0];
          if (!firstSheetName) {
            throw new Error('No worksheets found in the file');
          }
          
          const worksheet = workbook.Sheets[firstSheetName];
          if (!worksheet) {
            throw new Error('Unable to read worksheet data');
          }
          
          // Convert to JSON format
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
            header: 1,
            defval: '',
            raw: false
          }) as any[][];
          
          const cells: { [key: string]: Cell } = {};
          
          // Process each row and column
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
                }
              });
            }
          });
          
          resolve(cells);
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
  
  static exportToExcel(
    cells: { [key: string]: Cell }, 
    filename: string = 'spreadsheet_export.xlsx',
    options?: ExportOptions
  ): void {
    try {
      if (Object.keys(cells).length === 0) {
        throw new Error('No data to export');
      }
      
      // Find data boundaries
      const cellEntries = Object.entries(cells);
      const rows = new Set<number>();
      const cols = new Set<number>();
      
      cellEntries.forEach(([_, cell]) => {
        rows.add(cell.row);
        cols.add(cell.col);
      });
      
      if (rows.size === 0 || cols.size === 0) {
        throw new Error('No valid data found to export');
      }
      
      const maxRow = Math.max(...rows);
      const maxCol = Math.max(...cols);
      
      // Create worksheet data
      const wsData: any[][] = [];
      for (let row = 1; row <= maxRow; row++) {
        const rowData: any[] = [];
        for (let col = 1; col <= maxCol; col++) {
          const cellId = `${this.numberToColumn(col)}${row}`;
          const cell = cells[cellId];
          rowData.push(cell ? cell.value : '');
        }
        wsData.push(rowData);
      }
      
      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      
      // Add formatting for numeric cells
      const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
      for (let row = range.s.r; row <= range.e.r; row++) {
        for (let col = range.s.c; col <= range.e.c; col++) {
          const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
          const cellId = `${this.numberToColumn(col + 1)}${row + 1}`;
          const cell = cells[cellId];
          
          if (cell && ws[cellAddress]) {
            // Apply cell formatting based on type
            if (cell.type === 'number') {
              ws[cellAddress].t = 'n';
              ws[cellAddress].v = Number(cell.value);
            } else if (cell.type === 'formula') {
              ws[cellAddress].f = cell.formula?.startsWith('=') ? cell.formula.slice(1) : cell.formula;
            }
            
            // Apply visual formatting if available
            if (cell.format) {
              if (!ws[cellAddress].s) ws[cellAddress].s = {};
              
              if (cell.format.backgroundColor) {
                ws[cellAddress].s.fill = {
                  fgColor: { rgb: cell.format.backgroundColor.replace('#', '') }
                };
              }
              
              if (cell.format.fontWeight === 'bold') {
                ws[cellAddress].s.font = { bold: true };
              }
              
              if (cell.format.alignment) {
                ws[cellAddress].s.alignment = { horizontal: cell.format.alignment };
              }
            }
          }
        }
      }
      
      // Handle different export modes
      const sheetName = options?.sheetName || 'Sheet1';
      
      if (options?.mode === 'new_sheet') {
        // Add as new sheet to existing workbook (simulated)
        XLSX.utils.book_append_sheet(wb, ws, sheetName);
      } else if (options?.mode === 'replace_sheet') {
        // Replace existing sheet (simulated)
        XLSX.utils.book_append_sheet(wb, ws, sheetName);
      } else {
        // Default: new file
        XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
      }
      
      // Set workbook properties
      wb.Props = {
        Title: 'Excel Analyzer Pro Export',
        Subject: 'Spreadsheet Data Export',
        Author: 'Excel Analyzer Pro',
        CreatedDate: new Date()
      };
      
      // Determine file format based on extension
      const writeOpts: XLSX.WritingOptions = {
        bookType: filename.endsWith('.xls') ? 'xls' : 
                  filename.endsWith('.ods') ? 'ods' : 'xlsx',
        type: 'array'
      };
      
      // Save file
      XLSX.writeFile(wb, filename, writeOpts);
    } catch (error) {
      console.error('Export error:', error);
      throw new Error(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
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
  
  static getSupportedFormats(): string[] {
    return ['.xlsx', '.xls', '.csv', '.ods'];
  }
  
  static isExcelFile(filename: string): boolean {
    const extension = filename.toLowerCase().split('.').pop();
    return ['xlsx', 'xls', 'xlsm', 'xlsb'].includes(extension || '');
  }
  
  static isCSVFile(filename: string): boolean {
    const extension = filename.toLowerCase().split('.').pop();
    return extension === 'csv';
  }
}