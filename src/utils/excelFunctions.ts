import { Cell } from '../types/spreadsheet';

export class ExcelFunctions {
  private cells: { [key: string]: Cell };

  constructor(cells: { [key: string]: Cell }) {
    this.cells = cells;
  }

  // VLOOKUP implementation
  vlookup(lookupValue: any, tableArray: string, colIndex: number, exactMatch: boolean = false): any {
    const range = this.parseRange(tableArray);
    if (!range) return '#REF!';

    for (const cellId of range) {
      const cell = this.cells[cellId];
      if (!cell) continue;

      const cellValue = this.getCellValue(cell);
      if (exactMatch ? cellValue === lookupValue : cellValue >= lookupValue) {
        const resultCellId = this.getCellId(cell.row, cell.col + colIndex - 1);
        const resultCell = this.cells[resultCellId];
        return resultCell ? this.getCellValue(resultCell) : '#N/A';
      }
    }
    return '#N/A';
  }

  // IF function implementation
  ifFunction(condition: any, trueValue: any, falseValue: any): any {
    return this.evaluateCondition(condition) ? trueValue : falseValue;
  }

  // Nested IF implementation
  nestedIf(conditions: Array<{ condition: any; value: any }>): any {
    for (const { condition, value } of conditions) {
      if (this.evaluateCondition(condition)) {
        return value;
      }
    }
    return '';
  }

  // SUM function
  sum(range: string): number {
    const cells = this.parseRange(range);
    let total = 0;
    
    for (const cellId of cells || []) {
      const cell = this.cells[cellId];
      if (cell && typeof this.getCellValue(cell) === 'number') {
        total += this.getCellValue(cell);
      }
    }
    return total;
  }

  // AVERAGE function
  average(range: string): number {
    const cells = this.parseRange(range);
    if (!cells || cells.length === 0) return 0;
    
    const sum = this.sum(range);
    const count = cells.filter(cellId => {
      const cell = this.cells[cellId];
      return cell && typeof this.getCellValue(cell) === 'number';
    }).length;
    
    return count > 0 ? sum / count : 0;
  }

  // COUNT function
  count(range: string): number {
    const cells = this.parseRange(range);
    return cells?.filter(cellId => {
      const cell = this.cells[cellId];
      return cell && this.getCellValue(cell) !== null && this.getCellValue(cell) !== '';
    }).length || 0;
  }

  // MIN function
  min(range: string): number {
    const cells = this.parseRange(range);
    let min = Infinity;
    
    for (const cellId of cells || []) {
      const cell = this.cells[cellId];
      if (cell && typeof this.getCellValue(cell) === 'number') {
        min = Math.min(min, this.getCellValue(cell));
      }
    }
    return min === Infinity ? 0 : min;
  }

  // MAX function
  max(range: string): number {
    const cells = this.parseRange(range);
    let max = -Infinity;
    
    for (const cellId of cells || []) {
      const cell = this.cells[cellId];
      if (cell && typeof this.getCellValue(cell) === 'number') {
        max = Math.max(max, this.getCellValue(cell));
      }
    }
    return max === -Infinity ? 0 : max;
  }

  // Helper methods
  private parseRange(range: string): string[] | null {
    const match = range.match(/([A-Z]+)(\d+):([A-Z]+)(\d+)/);
    if (!match) return null;

    const [, startCol, startRow, endCol, endRow] = match;
    const startColNum = this.columnToNumber(startCol);
    const endColNum = this.columnToNumber(endCol);
    const cells: string[] = [];

    for (let row = parseInt(startRow); row <= parseInt(endRow); row++) {
      for (let col = startColNum; col <= endColNum; col++) {
        cells.push(this.getCellId(row, col));
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

  private getCellId(row: number, col: number): string {
    return `${this.numberToColumn(col)}${row}`;
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

  private getCellValue(cell: Cell): any {
    if (cell.formula) {
      return this.evaluateFormula(cell.formula);
    }
    return cell.value;
  }

  private evaluateCondition(condition: any): boolean {
    if (typeof condition === 'boolean') return condition;
    if (typeof condition === 'string') {
      return condition.toLowerCase() === 'true' || condition !== '' && condition !== '0';
    }
    return !!condition;
  }

  private evaluateFormula(formula: string): any {
    // Basic formula evaluation - in a real implementation, this would be more robust
    try {
      // Remove the = sign if present
      const cleanFormula = formula.startsWith('=') ? formula.slice(1) : formula;
      
      // Handle function calls
      if (cleanFormula.includes('VLOOKUP')) {
        const match = cleanFormula.match(/VLOOKUP\(([^)]+)\)/);
        if (match) {
          const args = match[1].split(',').map(arg => arg.trim());
          return this.vlookup(args[0], args[1], parseInt(args[2]), args[3] === 'TRUE');
        }
      }
      
      if (cleanFormula.includes('SUM')) {
        const match = cleanFormula.match(/SUM\(([^)]+)\)/);
        if (match) {
          return this.sum(match[1]);
        }
      }
      
      // Basic arithmetic evaluation
      return new Function('return ' + cleanFormula)();
    } catch (error) {
      return '#ERROR!';
    }
  }
}