import { Cell } from '../types/spreadsheet';
import { ExcelFunctions } from './excelFunctions';

export class ExcelCommandProcessor {
  private cells: { [key: string]: Cell };

  constructor(cells: { [key: string]: Cell }) {
    this.cells = cells;
  }

  processCommand(command: string): { 
    success: boolean; 
    message: string; 
    data?: any;
    cellUpdates?: { [key: string]: Cell };
    formatting?: { cellId: string; format: any }[];
  } {
    const lowerCommand = command.toLowerCase().trim();

    try {
      // Data entry commands
      if (this.isDataEntryCommand(lowerCommand)) {
        return this.handleDataEntry(command);
      }

      // Formula application commands
      if (this.isFormulaCommand(lowerCommand)) {
        return this.handleFormulaApplication(command);
      }

      // Conditional formatting commands
      if (this.isFormattingCommand(lowerCommand)) {
        return this.handleConditionalFormatting(command);
      }

      // Data manipulation commands
      if (this.isDataManipulationCommand(lowerCommand)) {
        return this.handleDataManipulation(command);
      }

      // Cell operations
      if (this.isCellOperationCommand(lowerCommand)) {
        return this.handleCellOperations(command);
      }

      // Range operations
      if (this.isRangeOperationCommand(lowerCommand)) {
        return this.handleRangeOperations(command);
      }

      return {
        success: false,
        message: 'Command not recognized. Try commands like "add data", "apply formula", "format cells", "insert row", etc.'
      };

    } catch (error) {
      return {
        success: false,
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private isDataEntryCommand(command: string): boolean {
    const keywords = ['add data', 'enter data', 'input data', 'set value', 'put value', 'insert data'];
    return keywords.some(keyword => command.includes(keyword));
  }

  private handleDataEntry(command: string): any {
    // Parse command for cell reference and value
    const cellMatch = command.match(/(?:in|to|at)\s+(?:cell\s+)?([A-Z]+\d+)/i);
    const valueMatch = command.match(/(?:value|data|text)\s+['"]?([^'"]+)['"]?/i);

    if (!cellMatch || !valueMatch) {
      return {
        success: false,
        message: 'Please specify cell and value. Example: "add data value 100 to cell A1"'
      };
    }

    const cellId = cellMatch[1].toUpperCase();
    const value = valueMatch[1];
    const numValue = Number(value);

    const cell: Cell = {
      id: cellId,
      row: this.getRowFromCellId(cellId),
      col: this.getColFromCellId(cellId),
      value: isNaN(numValue) ? value : numValue,
      type: isNaN(numValue) ? 'text' : 'number'
    };

    return {
      success: true,
      message: `Added "${value}" to cell ${cellId}`,
      cellUpdates: { [cellId]: cell }
    };
  }

  private isFormulaCommand(command: string): boolean {
    const keywords = ['apply formula', 'add formula', 'set formula', 'create formula', 'use formula'];
    return keywords.some(keyword => command.includes(keyword));
  }

  private handleFormulaApplication(command: string): any {
    const cellMatch = command.match(/(?:in|to|at)\s+(?:cell\s+)?([A-Z]+\d+)/i);
    const formulaMatch = command.match(/formula\s+['"]?([^'"]+)['"]?/i);

    if (!cellMatch || !formulaMatch) {
      return {
        success: false,
        message: 'Please specify cell and formula. Example: "apply formula =SUM(A1:A10) to cell B1"'
      };
    }

    const cellId = cellMatch[1].toUpperCase();
    let formula = formulaMatch[1];
    
    // Ensure formula starts with =
    if (!formula.startsWith('=')) {
      formula = '=' + formula;
    }

    // Calculate result
    let result;
    try {
      result = this.evaluateFormula(formula);
    } catch (error) {
      result = '#ERROR!';
    }

    const cell: Cell = {
      id: cellId,
      row: this.getRowFromCellId(cellId),
      col: this.getColFromCellId(cellId),
      value: result,
      formula: formula,
      type: 'formula'
    };

    return {
      success: true,
      message: `Applied formula ${formula} to cell ${cellId}`,
      cellUpdates: { [cellId]: cell }
    };
  }

  private isFormattingCommand(command: string): boolean {
    const keywords = ['format', 'highlight', 'color', 'background', 'bold', 'italic', 'underline'];
    return keywords.some(keyword => command.includes(keyword));
  }

  private handleConditionalFormatting(command: string): any {
    const rangeMatch = command.match(/(?:range|cells)\s+([A-Z]+\d+:[A-Z]+\d+)/i);
    const conditionMatch = command.match(/(?:if|where|when)\s+(.+?)(?:\s+(?:with|in|using)|$)/i);
    const colorMatch = command.match(/(?:color|background)\s+(red|green|blue|yellow|orange|purple)/i);

    if (!rangeMatch) {
      return {
        success: false,
        message: 'Please specify a range. Example: "format range A1:A10 if value > 100 with red background"'
      };
    }

    const range = rangeMatch[1];
    const condition = conditionMatch ? conditionMatch[1] : 'value > 0';
    const color = colorMatch ? colorMatch[1] : 'yellow';

    const format = {
      backgroundColor: this.getColorCode(color),
      textColor: this.getTextColor(color)
    };

    const cellIds = this.parseRange(range);
    const formatting = cellIds.map(cellId => ({ cellId, format }));

    return {
      success: true,
      message: `Applied conditional formatting to ${range} where ${condition}`,
      formatting
    };
  }

  private isDataManipulationCommand(command: string): boolean {
    const keywords = ['sort', 'filter', 'copy', 'move', 'delete', 'clear'];
    return keywords.some(keyword => command.includes(keyword));
  }

  private handleDataManipulation(command: string): any {
    if (command.includes('sort')) {
      return this.handleSort(command);
    }
    if (command.includes('filter')) {
      return this.handleFilter(command);
    }
    if (command.includes('copy')) {
      return this.handleCopy(command);
    }
    if (command.includes('clear')) {
      return this.handleClear(command);
    }

    return {
      success: false,
      message: 'Data manipulation command not recognized'
    };
  }

  private handleSort(command: string): any {
    const rangeMatch = command.match(/(?:range|data)\s+([A-Z]+\d+:[A-Z]+\d+)/i);
    const orderMatch = command.match(/(ascending|descending|asc|desc)/i);

    if (!rangeMatch) {
      return {
        success: false,
        message: 'Please specify range to sort. Example: "sort range A1:A10 ascending"'
      };
    }

    const range = rangeMatch[1];
    const order = orderMatch ? orderMatch[1].toLowerCase() : 'ascending';

    return {
      success: true,
      message: `Sorted ${range} in ${order} order`,
      data: { type: 'sort', range, order }
    };
  }

  private handleFilter(command: string): any {
    const rangeMatch = command.match(/(?:range|data)\s+([A-Z]+\d+:[A-Z]+\d+)/i);
    const criteriaMatch = command.match(/(?:where|if)\s+(.+)/i);

    if (!rangeMatch) {
      return {
        success: false,
        message: 'Please specify range to filter. Example: "filter range A1:A10 where value > 100"'
      };
    }

    const range = rangeMatch[1];
    const criteria = criteriaMatch ? criteriaMatch[1] : 'value > 0';

    return {
      success: true,
      message: `Applied filter to ${range} where ${criteria}`,
      data: { type: 'filter', range, criteria }
    };
  }

  private handleCopy(command: string): any {
    const fromMatch = command.match(/(?:from|copy)\s+([A-Z]+\d+(?::[A-Z]+\d+)?)/i);
    const toMatch = command.match(/(?:to|into)\s+([A-Z]+\d+)/i);

    if (!fromMatch || !toMatch) {
      return {
        success: false,
        message: 'Please specify source and destination. Example: "copy A1:A5 to B1"'
      };
    }

    const from = fromMatch[1];
    const to = toMatch[1];

    return {
      success: true,
      message: `Copied ${from} to ${to}`,
      data: { type: 'copy', from, to }
    };
  }

  private handleClear(command: string): any {
    const rangeMatch = command.match(/(?:range|cells)\s+([A-Z]+\d+(?::[A-Z]+\d+)?)/i);

    if (!rangeMatch) {
      return {
        success: false,
        message: 'Please specify range to clear. Example: "clear range A1:A10"'
      };
    }

    const range = rangeMatch[1];
    const cellIds = this.parseRange(range);
    const cellUpdates: { [key: string]: Cell } = {};

    cellIds.forEach(cellId => {
      cellUpdates[cellId] = {
        id: cellId,
        row: this.getRowFromCellId(cellId),
        col: this.getColFromCellId(cellId),
        value: '',
        type: 'text'
      };
    });

    return {
      success: true,
      message: `Cleared ${range}`,
      cellUpdates
    };
  }

  private isCellOperationCommand(command: string): boolean {
    const keywords = ['insert row', 'insert column', 'delete row', 'delete column', 'merge cells'];
    return keywords.some(keyword => command.includes(keyword));
  }

  private handleCellOperations(command: string): any {
    if (command.includes('insert row')) {
      const rowMatch = command.match(/(?:at|after|before)\s+(?:row\s+)?(\d+)/i);
      const row = rowMatch ? parseInt(rowMatch[1]) : 1;
      
      return {
        success: true,
        message: `Inserted row at position ${row}`,
        data: { type: 'insert_row', row }
      };
    }

    if (command.includes('insert column')) {
      const colMatch = command.match(/(?:at|after|before)\s+(?:column\s+)?([A-Z]+)/i);
      const col = colMatch ? colMatch[1] : 'A';
      
      return {
        success: true,
        message: `Inserted column at position ${col}`,
        data: { type: 'insert_column', col }
      };
    }

    if (command.includes('merge cells')) {
      const rangeMatch = command.match(/(?:range|cells)\s+([A-Z]+\d+:[A-Z]+\d+)/i);
      
      if (!rangeMatch) {
        return {
          success: false,
          message: 'Please specify range to merge. Example: "merge cells A1:C1"'
        };
      }

      return {
        success: true,
        message: `Merged cells ${rangeMatch[1]}`,
        data: { type: 'merge_cells', range: rangeMatch[1] }
      };
    }

    return {
      success: false,
      message: 'Cell operation not recognized'
    };
  }

  private isRangeOperationCommand(command: string): boolean {
    const keywords = ['select range', 'highlight range', 'format range', 'calculate range'];
    return keywords.some(keyword => command.includes(keyword));
  }

  private handleRangeOperations(command: string): any {
    const rangeMatch = command.match(/(?:range|cells)\s+([A-Z]+\d+:[A-Z]+\d+)/i);
    
    if (!rangeMatch) {
      return {
        success: false,
        message: 'Please specify a range'
      };
    }

    const range = rangeMatch[1];

    if (command.includes('select')) {
      return {
        success: true,
        message: `Selected range ${range}`,
        data: { type: 'select_range', range }
      };
    }

    if (command.includes('calculate')) {
      const operation = command.includes('sum') ? 'sum' :
                       command.includes('average') ? 'average' :
                       command.includes('count') ? 'count' : 'sum';

      return {
        success: true,
        message: `Calculated ${operation} for range ${range}`,
        data: { type: 'calculate_range', range, operation }
      };
    }

    return {
      success: true,
      message: `Processed range operation for ${range}`,
      data: { type: 'range_operation', range }
    };
  }

  // Helper methods
  private parseRange(range: string): string[] {
    const match = range.match(/([A-Z]+)(\d+):([A-Z]+)(\d+)/);
    if (!match) return [range];

    const [, startCol, startRow, endCol, endRow] = match;
    const startColNum = this.columnToNumber(startCol);
    const endColNum = this.columnToNumber(endCol);
    const cells: string[] = [];

    for (let row = parseInt(startRow); row <= parseInt(endRow); row++) {
      for (let col = startColNum; col <= endColNum; col++) {
        cells.push(this.numberToColumn(col) + row);
      }
    }
    return cells;
  }

  private columnToNumber(column: string): number {
    let result = 0;
    for (let i = 0; i < column.length; i++) {
      result = result * 26 + (column.charCodeAt(i) - 64);
    }
    return result;
  }

  private numberToColumn(num: number): string {
    let result = '';
    while (num > 0) {
      num--;
      result = String.fromCharCode(65 + (num % 26)) + result;
      num = Math.floor(num / 26);
    }
    return result;
  }

  private getRowFromCellId(cellId: string): number {
    const match = cellId.match(/\d+/);
    return match ? parseInt(match[0]) : 1;
  }

  private getColFromCellId(cellId: string): number {
    const match = cellId.match(/[A-Z]+/);
    return match ? this.columnToNumber(match[0]) : 1;
  }

  private getColorCode(color: string): string {
    const colors: { [key: string]: string } = {
      red: '#ffebee',
      green: '#e8f5e8',
      blue: '#e3f2fd',
      yellow: '#fff9c4',
      orange: '#fff3e0',
      purple: '#f3e5f5'
    };
    return colors[color] || colors.yellow;
  }

  private getTextColor(color: string): string {
    const colors: { [key: string]: string } = {
      red: '#c62828',
      green: '#2e7d32',
      blue: '#1565c0',
      yellow: '#f57f17',
      orange: '#ef6c00',
      purple: '#7b1fa2'
    };
    return colors[color] || colors.yellow;
  }

  private evaluateFormula(formula: string): any {
    try {
      const cleanFormula = formula.startsWith('=') ? formula.slice(1) : formula;
      
      // Handle basic Excel functions
      if (cleanFormula.includes('SUM(')) {
        const rangeMatch = cleanFormula.match(/SUM\(([A-Z]+\d+:[A-Z]+\d+)\)/);
        if (rangeMatch) {
          return this.calculateSum(rangeMatch[1]);
        }
      }
      
      if (cleanFormula.includes('AVERAGE(')) {
        const rangeMatch = cleanFormula.match(/AVERAGE\(([A-Z]+\d+:[A-Z]+\d+)\)/);
        if (rangeMatch) {
          return this.calculateAverage(rangeMatch[1]);
        }
      }

      // Basic arithmetic evaluation
      return new Function('return ' + cleanFormula)();
    } catch (error) {
      return '#ERROR!';
    }
  }

  private calculateSum(range: string): number {
    const cellIds = this.parseRange(range);
    return cellIds.reduce((sum, cellId) => {
      const cell = this.cells[cellId];
      const value = cell ? Number(cell.value) : 0;
      return sum + (isNaN(value) ? 0 : value);
    }, 0);
  }

  private calculateAverage(range: string): number {
    const cellIds = this.parseRange(range);
    const values = cellIds.map(cellId => {
      const cell = this.cells[cellId];
      return cell ? Number(cell.value) : 0;
    }).filter(val => !isNaN(val) && val !== 0);
    
    return values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0;
  }
}