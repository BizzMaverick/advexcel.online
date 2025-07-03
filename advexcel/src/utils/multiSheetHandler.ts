import * as XLSX from 'xlsx';
import { Cell } from '../types/spreadsheet';
import { WorkbookData, WorksheetData } from '../types/workbook';

export class MultiSheetHandler {
  static async readMultiSheetExcel(file: File): Promise<WorkbookData> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          
          if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
            throw new Error('No worksheets found in the file');
          }
          
          const worksheets: WorksheetData[] = [];
          
          workbook.SheetNames.forEach((sheetName, index) => {
            try {
              const worksheet = workbook.Sheets[sheetName];
              if (!worksheet) {
                console.warn(`Worksheet ${sheetName} could not be read`);
                return;
              }
              
              const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
                header: 1,
                defval: '',
                raw: false
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
              
              worksheets.push({
                name: sheetName,
                cells,
                isActive: index === 0,
                rowCount: maxRow,
                columnCount: maxCol
              });
            } catch (sheetError) {
              console.warn(`Error processing sheet ${sheetName}:`, sheetError);
            }
          });
          
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

  static exportMultiSheetExcel(workbook: WorkbookData, filename?: string): void {
    try {
      const wb = XLSX.utils.book_new();
      
      workbook.worksheets.forEach((worksheet) => {
        // Find data boundaries
        const cellEntries = Object.entries(worksheet.cells);
        if (cellEntries.length === 0) return;
        
        const rows = new Set<number>();
        const cols = new Set<number>();
        
        cellEntries.forEach(([_, cell]) => {
          rows.add(cell.row);
          cols.add(cell.col);
        });
        
        const maxRow = Math.max(...rows);
        const maxCol = Math.max(...cols);
        
        // Create worksheet data
        const wsData: any[][] = [];
        for (let row = 1; row <= maxRow; row++) {
          const rowData: any[] = [];
          for (let col = 1; col <= maxCol; col++) {
            const cellId = `${this.numberToColumn(col)}${row}`;
            const cell = worksheet.cells[cellId];
            rowData.push(cell ? cell.value : '');
          }
          wsData.push(rowData);
        }
        
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        XLSX.utils.book_append_sheet(wb, ws, worksheet.name);
      });
      
      // Set workbook properties
      wb.Props = {
        Title: workbook.name,
        Subject: 'Multi-sheet Excel Export',
        Author: 'Excel Analyzer Pro',
        CreatedDate: workbook.createdAt
      };
      
      const fileName = filename || `${workbook.name}.xlsx`;
      XLSX.writeFile(wb, fileName);
    } catch (error) {
      console.error('Export error:', error);
      throw new Error(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static addWorksheet(workbook: WorkbookData, name: string): WorkbookData {
    // Check if worksheet name already exists
    if (workbook.worksheets.some(ws => ws.name === name)) {
      throw new Error(`Worksheet with name "${name}" already exists`);
    }

    const newWorksheet: WorksheetData = {
      name,
      cells: {},
      isActive: false,
      rowCount: 0,
      columnCount: 0
    };

    return {
      ...workbook,
      worksheets: [...workbook.worksheets, newWorksheet],
      lastModified: new Date()
    };
  }

  static deleteWorksheet(workbook: WorkbookData, name: string): WorkbookData {
    if (workbook.worksheets.length <= 1) {
      throw new Error('Cannot delete the last worksheet');
    }

    const filteredWorksheets = workbook.worksheets.filter(ws => ws.name !== name);
    let activeWorksheet = workbook.activeWorksheet;
    
    if (activeWorksheet === name) {
      activeWorksheet = filteredWorksheets[0].name;
      filteredWorksheets[0].isActive = true;
    }

    return {
      ...workbook,
      worksheets: filteredWorksheets,
      activeWorksheet,
      lastModified: new Date()
    };
  }

  static renameWorksheet(workbook: WorkbookData, oldName: string, newName: string): WorkbookData {
    // Check if new name already exists
    if (workbook.worksheets.some(ws => ws.name === newName && ws.name !== oldName)) {
      throw new Error(`Worksheet with name "${newName}" already exists`);
    }

    const updatedWorksheets = workbook.worksheets.map(ws => 
      ws.name === oldName ? { ...ws, name: newName } : ws
    );

    return {
      ...workbook,
      worksheets: updatedWorksheets,
      activeWorksheet: workbook.activeWorksheet === oldName ? newName : workbook.activeWorksheet,
      lastModified: new Date()
    };
  }

  static switchWorksheet(workbook: WorkbookData, name: string): WorkbookData {
    const updatedWorksheets = workbook.worksheets.map(ws => ({
      ...ws,
      isActive: ws.name === name
    }));

    return {
      ...workbook,
      worksheets: updatedWorksheets,
      activeWorksheet: name,
      lastModified: new Date()
    };
  }

  static updateWorksheetCells(workbook: WorkbookData, worksheetName: string, cells: { [key: string]: Cell }): WorkbookData {
    const updatedWorksheets = workbook.worksheets.map(ws => {
      if (ws.name === worksheetName) {
        const cellEntries = Object.entries(cells);
        const maxRow = cellEntries.length > 0 ? Math.max(...cellEntries.map(([_, cell]) => cell.row)) : 0;
        const maxCol = cellEntries.length > 0 ? Math.max(...cellEntries.map(([_, cell]) => cell.col)) : 0;
        
        return {
          ...ws,
          cells,
          rowCount: maxRow,
          columnCount: maxCol
        };
      }
      return ws;
    });

    return {
      ...workbook,
      worksheets: updatedWorksheets,
      lastModified: new Date()
    };
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

  static processNaturalLanguageQuery(workbook: WorkbookData, query: string): {
    targetWorksheet?: string;
    processedQuery: string;
  } {
    const lowerQuery = query.toLowerCase();
    
    // Check if query mentions specific sheet
    for (const worksheet of workbook.worksheets) {
      const sheetName = worksheet.name.toLowerCase();
      if (lowerQuery.includes(sheetName) || lowerQuery.includes(`sheet ${sheetName}`) || lowerQuery.includes(`"${sheetName}"`)) {
        return {
          targetWorksheet: worksheet.name,
          processedQuery: query.replace(new RegExp(sheetName, 'gi'), '').trim()
        };
      }
    }
    
    // Check for sheet references like "sheet1", "sheet 2", etc.
    const sheetMatch = lowerQuery.match(/sheet\s*(\d+|[a-z]+)/);
    if (sheetMatch) {
      const sheetRef = sheetMatch[1];
      const targetSheet = workbook.worksheets.find(ws => 
        ws.name.toLowerCase().includes(sheetRef) || 
        ws.name.toLowerCase() === `sheet${sheetRef}`
      );
      
      if (targetSheet) {
        return {
          targetWorksheet: targetSheet.name,
          processedQuery: query.replace(sheetMatch[0], '').trim()
        };
      }
    }
    
    // Default to active worksheet
    return {
      targetWorksheet: workbook.activeWorksheet,
      processedQuery: query
    };
  }
}