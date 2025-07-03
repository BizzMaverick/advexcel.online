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

  // HLOOKUP implementation
  hlookup(lookupValue: any, tableArray: string, rowIndex: number, exactMatch: boolean = false): any {
    const range = this.parseRange(tableArray);
    if (!range) return '#REF!';

    // Get the first row of the table
    const firstRow = range.filter(cellId => {
      const cell = this.cells[cellId];
      return cell && cell.row === this.getRowFromCellId(range[0]);
    });

    for (let i = 0; i < firstRow.length; i++) {
      const cell = this.cells[firstRow[i]];
      if (!cell) continue;

      const cellValue = this.getCellValue(cell);
      if (exactMatch ? cellValue === lookupValue : cellValue >= lookupValue) {
        const resultCellId = this.getCellId(cell.row + rowIndex - 1, cell.col);
        const resultCell = this.cells[resultCellId];
        return resultCell ? this.getCellValue(resultCell) : '#N/A';
      }
    }
    return '#N/A';
  }

  // INDEX MATCH implementation
  indexMatch(returnRange: string, lookupValue: any, lookupRange: string): any {
    const returnCells = this.parseRange(returnRange);
    const lookupCells = this.parseRange(lookupRange);
    if (!returnCells || !lookupCells) return '#REF!';

    // Find the position of lookupValue in lookupRange
    let matchIndex = -1;
    for (let i = 0; i < lookupCells.length; i++) {
      const cell = this.cells[lookupCells[i]];
      if (!cell) continue;

      const cellValue = this.getCellValue(cell);
      if (cellValue === lookupValue) {
        matchIndex = i;
        break;
      }
    }

    if (matchIndex === -1) return '#N/A';

    // Return the value at the same position in returnRange
    if (matchIndex < returnCells.length) {
      const resultCell = this.cells[returnCells[matchIndex]];
      return resultCell ? this.getCellValue(resultCell) : '#N/A';
    }

    return '#N/A';
  }

  // IF function implementation
  ifFunction(condition: any, trueValue: any, falseValue: any): any {
    return this.evaluateCondition(condition) ? trueValue : falseValue;
  }

  // IFS function implementation
  ifsFunction(conditions: Array<{ condition: any; value: any }>): any {
    for (const { condition, value } of conditions) {
      if (this.evaluateCondition(condition)) {
        return value;
      }
    }
    return '';
  }

  // SUMIF implementation
  sumif(range: string, criteria: any, sumRange?: string): number {
    const cells = this.parseRange(range);
    const sumCells = sumRange ? this.parseRange(sumRange) : cells;
    
    if (!cells || !sumCells) return 0;
    
    let total = 0;
    for (let i = 0; i < cells.length; i++) {
      const cell = this.cells[cells[i]];
      if (!cell) continue;
      
      const cellValue = this.getCellValue(cell);
      const matches = this.matchesCriteria(cellValue, criteria);
      
      if (matches && i < sumCells.length) {
        const sumCell = this.cells[sumCells[i]];
        if (sumCell && typeof this.getCellValue(sumCell) === 'number') {
          total += this.getCellValue(sumCell);
        }
      }
    }
    
    return total;
  }

  // COUNTIF implementation
  countif(range: string, criteria: any): number {
    const cells = this.parseRange(range);
    if (!cells) return 0;
    
    let count = 0;
    for (const cellId of cells) {
      const cell = this.cells[cellId];
      if (!cell) continue;
      
      const cellValue = this.getCellValue(cell);
      if (this.matchesCriteria(cellValue, criteria)) {
        count++;
      }
    }
    
    return count;
  }

  // AVERAGEIF implementation
  averageif(range: string, criteria: any, averageRange?: string): number {
    const cells = this.parseRange(range);
    const avgCells = averageRange ? this.parseRange(averageRange) : cells;
    
    if (!cells || !avgCells) return 0;
    
    let sum = 0;
    let count = 0;
    
    for (let i = 0; i < cells.length; i++) {
      const cell = this.cells[cells[i]];
      if (!cell) continue;
      
      const cellValue = this.getCellValue(cell);
      const matches = this.matchesCriteria(cellValue, criteria);
      
      if (matches && i < avgCells.length) {
        const avgCell = this.cells[avgCells[i]];
        if (avgCell && typeof this.getCellValue(avgCell) === 'number') {
          sum += this.getCellValue(avgCell);
          count++;
        }
      }
    }
    
    return count > 0 ? sum / count : 0;
  }

  // CONCATENATE function
  concatenate(...args: any[]): string {
    return args.join('');
  }

  // LEFT function
  left(text: string, numChars: number): string {
    return String(text).substring(0, numChars);
  }

  // RIGHT function
  right(text: string, numChars: number): string {
    const str = String(text);
    return str.substring(str.length - numChars);
  }

  // MID function
  mid(text: string, startPos: number, numChars: number): string {
    return String(text).substring(startPos - 1, startPos - 1 + numChars);
  }

  // UPPER function
  upper(text: string): string {
    return String(text).toUpperCase();
  }

  // LOWER function
  lower(text: string): string {
    return String(text).toLowerCase();
  }

  // TRIM function
  trim(text: string): string {
    return String(text).trim();
  }

  // DATE function
  dateFunction(year: number, month: number, day: number): Date {
    return new Date(year, month - 1, day);
  }

  // DATEDIF function
  datedif(startDate: Date, endDate: Date, unit: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const diffTime = Math.abs(end.getTime() - start.getTime());
    
    switch (unit.toUpperCase()) {
      case 'Y': // Years
        return end.getFullYear() - start.getFullYear();
      case 'M': // Months
        return (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
      case 'D': // Days
        return Math.floor(diffTime / (1000 * 60 * 60 * 24));
      default:
        return 0;
    }
  }

  // ROUND function
  round(number: number, digits: number): number {
    const factor = Math.pow(10, digits);
    return Math.round(number * factor) / factor;
  }

  // ROUNDUP function
  roundup(number: number, digits: number): number {
    const factor = Math.pow(10, digits);
    return Math.ceil(number * factor) / factor;
  }

  // ROUNDDOWN function
  rounddown(number: number, digits: number): number {
    const factor = Math.pow(10, digits);
    return Math.floor(number * factor) / factor;
  }

  // PMT function (loan payment calculation)
  pmt(rate: number, nper: number, pv: number, fv: number = 0, type: number = 0): number {
    if (rate === 0) return -(pv + fv) / nper;
    
    const pvif = Math.pow(1 + rate, nper);
    let pmt = rate / (pvif - 1) * -(pv * pvif + fv);
    
    if (type === 1) {
      pmt = pmt / (1 + rate);
    }
    
    return pmt;
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
      return cell && typeof this.getCellValue(cell) === 'number';
    }).length || 0;
  }

  // COUNTA function (counts non-empty cells)
  counta(range: string): number {
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

  // MEDIAN function
  median(range: string): number {
    const cells = this.parseRange(range);
    const values: number[] = [];
    
    for (const cellId of cells || []) {
      const cell = this.cells[cellId];
      if (cell && typeof this.getCellValue(cell) === 'number') {
        values.push(this.getCellValue(cell));
      }
    }
    
    if (values.length === 0) return 0;
    
    values.sort((a, b) => a - b);
    const mid = Math.floor(values.length / 2);
    
    return values.length % 2 === 0 ? (values[mid - 1] + values[mid]) / 2 : values[mid];
  }

  // Helper methods
  parseRange(range: string): string[] | null {
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

  columnToNumber(column: string): number {
    let result = 0;
    for (let i = 0; i < column.length; i++) {
      result = result * 26 + (column.charCodeAt(i) - 64);
    }
    return result;
  }

  getCellId(row: number, col: number): string {
    return `${this.numberToColumn(col)}${row}`;
  }

  getRowFromCellId(cellId: string): number {
    const match = cellId.match(/\d+/);
    return match ? parseInt(match[0]) : 1;
  }

  numberToColumn(num: number): string {
    let result = '';
    while (num > 0) {
      num--;
      result = String.fromCharCode(65 + (num % 26)) + result;
      num = Math.floor(num / 26);
    }
    return result;
  }

  getCellValue(cell: Cell): any {
    if (cell.formula) {
      return this.evaluateFormula(cell.formula);
    }
    return cell.value;
  }

  evaluateCondition(condition: any): boolean {
    if (typeof condition === 'boolean') return condition;
    if (typeof condition === 'string') {
      return condition.toLowerCase() === 'true' || condition !== '' && condition !== '0';
    }
    return !!condition;
  }

  matchesCriteria(value: any, criteria: any): boolean {
    if (typeof criteria === 'string') {
      // Handle operators in criteria string
      if (criteria.startsWith('>')) {
        return value > parseFloat(criteria.substring(1));
      } else if (criteria.startsWith('<')) {
        return value < parseFloat(criteria.substring(1));
      } else if (criteria.startsWith('>=')) {
        return value >= parseFloat(criteria.substring(2));
      } else if (criteria.startsWith('<=')) {
        return value <= parseFloat(criteria.substring(2));
      } else if (criteria.startsWith('<>')) {
        return value != criteria.substring(2);
      } else if (criteria.includes('*') || criteria.includes('?')) {
        // Wildcard matching
        const regex = new RegExp('^' + criteria.replace(/\*/g, '.*').replace(/\?/g, '.') + '$', 'i');
        return regex.test(String(value));
      } else {
        return value == criteria;
      }
    }
    
    return value == criteria;
  }

  evaluateFormula(formula: string): any {
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
      
      if (cleanFormula.includes('AVERAGE')) {
        const match = cleanFormula.match(/AVERAGE\(([^)]+)\)/);
        if (match) {
          return this.average(match[1]);
        }
      }
      
      if (cleanFormula.includes('IF')) {
        const match = cleanFormula.match(/IF\(([^,]+),([^,]+),([^)]+)\)/);
        if (match) {
          const [, condition, trueValue, falseValue] = match;
          return this.ifFunction(condition.trim(), trueValue.trim(), falseValue.trim());
        }
      }
      
      // Basic arithmetic evaluation
      return new Function('return ' + cleanFormula)();
    } catch (error) {
      console.warn('Formula evaluation error:', error);
      return '#ERROR!';
    }
  }
}