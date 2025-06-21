import { Cell } from '../types/spreadsheet';

interface FormulaResult {
  success: boolean;
  formula: string;
  result: any;
  explanation: string;
  affectedCells: string[];
  conditionalFormatting?: {
    range: string;
    condition: string;
    format: any;
  };
}

export class ExcelFormulaEngine {
  private cells: { [key: string]: Cell };

  constructor(cells: { [key: string]: Cell }) {
    this.cells = cells;
  }

  async processNaturalLanguageRequest(request: string): Promise<FormulaResult> {
    const normalizedRequest = request.toLowerCase().trim();

    try {
      // Basic arithmetic operations
      if (this.isSumRequest(normalizedRequest)) {
        return this.handleSumRequest(request);
      }

      if (this.isAverageRequest(normalizedRequest)) {
        return this.handleAverageRequest(request);
      }

      if (this.isCountRequest(normalizedRequest)) {
        return this.handleCountRequest(request);
      }

      if (this.isMinMaxRequest(normalizedRequest)) {
        return this.handleMinMaxRequest(request);
      }

      // Lookup functions
      if (this.isVlookupRequest(normalizedRequest)) {
        return this.handleVlookupRequest(request);
      }

      if (this.isIndexMatchRequest(normalizedRequest)) {
        return this.handleIndexMatchRequest(request);
      }

      // Conditional logic
      if (this.isIfRequest(normalizedRequest)) {
        return this.handleIfRequest(request);
      }

      if (this.isNestedIfRequest(normalizedRequest)) {
        return this.handleNestedIfRequest(request);
      }

      // Text functions
      if (this.isConcatenateRequest(normalizedRequest)) {
        return this.handleConcatenateRequest(request);
      }

      if (this.isTextManipulationRequest(normalizedRequest)) {
        return this.handleTextManipulationRequest(request);
      }

      // Date functions
      if (this.isDateRequest(normalizedRequest)) {
        return this.handleDateRequest(request);
      }

      // Conditional formatting
      if (this.isConditionalFormattingRequest(normalizedRequest)) {
        return this.handleConditionalFormattingRequest(request);
      }

      // Statistical functions
      if (this.isStatisticalRequest(normalizedRequest)) {
        return this.handleStatisticalRequest(request);
      }

      return {
        success: false,
        formula: '',
        result: null,
        explanation: 'Request not understood. Please try rephrasing or check the examples for supported operations.',
        affectedCells: []
      };

    } catch (error) {
      return {
        success: false,
        formula: '',
        result: null,
        explanation: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        affectedCells: []
      };
    }
  }

  // Detection methods
  private isSumRequest(request: string): boolean {
    return request.includes('sum') || request.includes('total') || request.includes('add up');
  }

  private isAverageRequest(request: string): boolean {
    return request.includes('average') || request.includes('mean');
  }

  private isCountRequest(request: string): boolean {
    return request.includes('count') && !request.includes('countif');
  }

  private isMinMaxRequest(request: string): boolean {
    return request.includes('minimum') || request.includes('maximum') || 
           request.includes('min') || request.includes('max') ||
           request.includes('smallest') || request.includes('largest');
  }

  private isVlookupRequest(request: string): boolean {
    return request.includes('vlookup') || request.includes('lookup') || 
           (request.includes('find') && request.includes('table'));
  }

  private isIndexMatchRequest(request: string): boolean {
    return request.includes('index') && request.includes('match');
  }

  private isIfRequest(request: string): boolean {
    return request.includes('if') && (request.includes('then') || request.includes('else'));
  }

  private isNestedIfRequest(request: string): boolean {
    return request.includes('nested if') || request.includes('multiple conditions') ||
           (request.includes('if') && (request.includes('ifs') || request.includes('categorize')));
  }

  private isConcatenateRequest(request: string): boolean {
    return request.includes('concatenate') || request.includes('combine') || 
           request.includes('join') || request.includes('merge');
  }

  private isTextManipulationRequest(request: string): boolean {
    return request.includes('uppercase') || request.includes('lowercase') ||
           request.includes('extract') || request.includes('substring') ||
           request.includes('left') || request.includes('right') || request.includes('mid');
  }

  private isDateRequest(request: string): boolean {
    return request.includes('date') || request.includes('days') || 
           request.includes('year') || request.includes('month');
  }

  private isConditionalFormattingRequest(request: string): boolean {
    return request.includes('highlight') || request.includes('color') || 
           request.includes('format') || request.includes('background');
  }

  private isStatisticalRequest(request: string): boolean {
    return request.includes('median') || request.includes('mode') || 
           request.includes('standard deviation') || request.includes('variance');
  }

  // Handler methods
  private handleSumRequest(request: string): FormulaResult {
    const range = this.extractRange(request);
    const targetCell = this.extractTargetCell(request);
    
    if (!range) {
      throw new Error('Could not identify the range to sum. Please specify a range like A1:A10');
    }

    const formula = `=SUM(${range})`;
    const result = this.calculateSum(range);

    return {
      success: true,
      formula,
      result,
      explanation: `Created SUM formula for range ${range}. Result: ${result}`,
      affectedCells: targetCell ? [targetCell] : []
    };
  }

  private handleAverageRequest(request: string): FormulaResult {
    const range = this.extractRange(request);
    const targetCell = this.extractTargetCell(request);
    
    if (!range) {
      throw new Error('Could not identify the range to average. Please specify a range like A1:A10');
    }

    const formula = `=AVERAGE(${range})`;
    const result = this.calculateAverage(range);

    return {
      success: true,
      formula,
      result: parseFloat(result.toFixed(2)),
      explanation: `Created AVERAGE formula for range ${range}. Result: ${result.toFixed(2)}`,
      affectedCells: targetCell ? [targetCell] : []
    };
  }

  private handleCountRequest(request: string): FormulaResult {
    const range = this.extractRange(request);
    const targetCell = this.extractTargetCell(request);
    
    if (!range) {
      throw new Error('Could not identify the range to count. Please specify a range like A1:A10');
    }

    const formula = request.includes('non-empty') || request.includes('filled') ? 
      `=COUNTA(${range})` : `=COUNT(${range})`;
    const result = request.includes('non-empty') || request.includes('filled') ? 
      this.calculateCountA(range) : this.calculateCount(range);

    return {
      success: true,
      formula,
      result,
      explanation: `Created ${request.includes('non-empty') ? 'COUNTA' : 'COUNT'} formula for range ${range}. Result: ${result}`,
      affectedCells: targetCell ? [targetCell] : []
    };
  }

  private handleMinMaxRequest(request: string): FormulaResult {
    const range = this.extractRange(request);
    const targetCell = this.extractTargetCell(request);
    const isMax = request.includes('max') || request.includes('maximum') || request.includes('largest');
    
    if (!range) {
      throw new Error('Could not identify the range. Please specify a range like A1:A10');
    }

    const formula = isMax ? `=MAX(${range})` : `=MIN(${range})`;
    const result = isMax ? this.calculateMax(range) : this.calculateMin(range);

    return {
      success: true,
      formula,
      result,
      explanation: `Created ${isMax ? 'MAX' : 'MIN'} formula for range ${range}. Result: ${result}`,
      affectedCells: targetCell ? [targetCell] : []
    };
  }

  private handleVlookupRequest(request: string): FormulaResult {
    const lookupValue = this.extractLookupValue(request);
    const tableRange = this.extractTableRange(request);
    const columnIndex = this.extractColumnIndex(request);
    const targetCell = this.extractTargetCell(request);

    if (!tableRange) {
      throw new Error('Could not identify the lookup table range. Please specify like A1:C10');
    }

    const formula = `=VLOOKUP(${lookupValue || 'A1'}, ${tableRange}, ${columnIndex || 2}, FALSE)`;

    return {
      success: true,
      formula,
      result: 'VLOOKUP formula created',
      explanation: `Created VLOOKUP formula to find ${lookupValue || 'lookup value'} in table ${tableRange}`,
      affectedCells: targetCell ? [targetCell] : []
    };
  }

  private handleIndexMatchRequest(request: string): FormulaResult {
    const lookupValue = this.extractLookupValue(request);
    const lookupArray = this.extractLookupArray(request);
    const returnArray = this.extractReturnArray(request);
    const targetCell = this.extractTargetCell(request);

    const formula = `=INDEX(${returnArray || 'B:B'}, MATCH(${lookupValue || 'A1'}, ${lookupArray || 'A:A'}, 0))`;

    return {
      success: true,
      formula,
      result: 'INDEX MATCH formula created',
      explanation: `Created INDEX MATCH formula to lookup ${lookupValue || 'value'} in ${lookupArray || 'column A'}`,
      affectedCells: targetCell ? [targetCell] : []
    };
  }

  private handleIfRequest(request: string): FormulaResult {
    const condition = this.extractCondition(request);
    const trueValue = this.extractTrueValue(request);
    const falseValue = this.extractFalseValue(request);
    const targetCell = this.extractTargetCell(request);

    const formula = `=IF(${condition || 'A1>100'}, "${trueValue || 'High'}", "${falseValue || 'Low'}")`;

    return {
      success: true,
      formula,
      result: 'IF formula created',
      explanation: `Created IF formula with condition: ${condition || 'A1>100'}`,
      affectedCells: targetCell ? [targetCell] : []
    };
  }

  private handleNestedIfRequest(request: string): FormulaResult {
    const targetCell = this.extractTargetCell(request);
    
    // Handle score categorization example
    if (request.includes('score') || request.includes('grade')) {
      const formula = `=IFS(A1>=90, "A", A1>=80, "B", A1>=70, "C", A1>=60, "D", TRUE, "F")`;
      return {
        success: true,
        formula,
        result: 'Grade categorization formula created',
        explanation: 'Created IFS formula for grade categorization (90+=A, 80+=B, 70+=C, 60+=D, <60=F)',
        affectedCells: targetCell ? [targetCell] : []
      };
    }

    const formula = `=IFS(A1>100, "High", A1>50, "Medium", TRUE, "Low")`;
    return {
      success: true,
      formula,
      result: 'IFS formula created',
      explanation: 'Created IFS formula with multiple conditions',
      affectedCells: targetCell ? [targetCell] : []
    };
  }

  private handleConcatenateRequest(request: string): FormulaResult {
    const cells = this.extractCellReferences(request);
    const separator = this.extractSeparator(request);
    const targetCell = this.extractTargetCell(request);

    const formula = cells.length >= 2 ? 
      `=CONCATENATE(${cells[0]}, "${separator}", ${cells[1]})` :
      `=CONCATENATE(A1, " ", B1)`;

    return {
      success: true,
      formula,
      result: 'CONCATENATE formula created',
      explanation: `Created CONCATENATE formula to join ${cells.length >= 2 ? cells.join(' and ') : 'A1 and B1'}`,
      affectedCells: targetCell ? [targetCell] : []
    };
  }

  private handleTextManipulationRequest(request: string): FormulaResult {
    const targetCell = this.extractTargetCell(request);
    const sourceCell = this.extractSourceCell(request);
    
    if (request.includes('uppercase') || request.includes('upper')) {
      const formula = `=UPPER(${sourceCell || 'A1'})`;
      return {
        success: true,
        formula,
        result: 'UPPER formula created',
        explanation: `Created UPPER formula to convert ${sourceCell || 'A1'} to uppercase`,
        affectedCells: targetCell ? [targetCell] : []
      };
    }

    if (request.includes('lowercase') || request.includes('lower')) {
      const formula = `=LOWER(${sourceCell || 'A1'})`;
      return {
        success: true,
        formula,
        result: 'LOWER formula created',
        explanation: `Created LOWER formula to convert ${sourceCell || 'A1'} to lowercase`,
        affectedCells: targetCell ? [targetCell] : []
      };
    }

    if (request.includes('left') || request.includes('first')) {
      const numChars = this.extractNumber(request) || 5;
      const formula = `=LEFT(${sourceCell || 'A1'}, ${numChars})`;
      return {
        success: true,
        formula,
        result: 'LEFT formula created',
        explanation: `Created LEFT formula to extract first ${numChars} characters from ${sourceCell || 'A1'}`,
        affectedCells: targetCell ? [targetCell] : []
      };
    }

    const formula = `=TRIM(${sourceCell || 'A1'})`;
    return {
      success: true,
      formula,
      result: 'TRIM formula created',
      explanation: `Created TRIM formula to remove extra spaces from ${sourceCell || 'A1'}`,
      affectedCells: targetCell ? [targetCell] : []
    };
  }

  private handleDateRequest(request: string): FormulaResult {
    const targetCell = this.extractTargetCell(request);
    
    if (request.includes('days between')) {
      const cells = this.extractCellReferences(request);
      const formula = cells.length >= 2 ? 
        `=DATEDIF(${cells[0]}, ${cells[1]}, "D")` :
        `=DATEDIF(A1, B1, "D")`;
      
      return {
        success: true,
        formula,
        result: 'DATEDIF formula created',
        explanation: `Created DATEDIF formula to calculate days between dates`,
        affectedCells: targetCell ? [targetCell] : []
      };
    }

    if (request.includes('add') && request.includes('days')) {
      const days = this.extractNumber(request) || 30;
      const sourceCell = this.extractSourceCell(request);
      const formula = `=${sourceCell || 'A1'}+${days}`;
      
      return {
        success: true,
        formula,
        result: 'Date addition formula created',
        explanation: `Created formula to add ${days} days to ${sourceCell || 'A1'}`,
        affectedCells: targetCell ? [targetCell] : []
      };
    }

    if (request.includes('year')) {
      const sourceCell = this.extractSourceCell(request);
      const formula = `=YEAR(${sourceCell || 'A1'})`;
      
      return {
        success: true,
        formula,
        result: 'YEAR formula created',
        explanation: `Created YEAR formula to extract year from ${sourceCell || 'A1'}`,
        affectedCells: targetCell ? [targetCell] : []
      };
    }

    const formula = `=TODAY()`;
    return {
      success: true,
      formula,
      result: 'TODAY formula created',
      explanation: 'Created TODAY formula to get current date',
      affectedCells: targetCell ? [targetCell] : []
    };
  }

  private handleConditionalFormattingRequest(request: string): FormulaResult {
    const range = this.extractRange(request);
    const condition = this.extractFormattingCondition(request);
    const color = this.extractColor(request);
    
    if (!range) {
      throw new Error('Could not identify the range to format. Please specify a range like A1:A10');
    }

    const format = {
      backgroundColor: color === 'red' ? '#ffebee' : 
                      color === 'green' ? '#e8f5e8' : 
                      color === 'yellow' ? '#fff9c4' : '#e3f2fd',
      textColor: color === 'red' ? '#c62828' : 
                 color === 'green' ? '#2e7d32' : 
                 color === 'yellow' ? '#f57f17' : '#1565c0'
    };

    return {
      success: true,
      formula: `Conditional formatting applied`,
      result: 'Formatting applied',
      explanation: `Applied ${color || 'blue'} formatting to ${range} where ${condition || 'condition is met'}`,
      affectedCells: this.parseRange(range),
      conditionalFormatting: {
        range,
        condition: condition || 'value > 0',
        format
      }
    };
  }

  private handleStatisticalRequest(request: string): FormulaResult {
    const range = this.extractRange(request);
    const targetCell = this.extractTargetCell(request);
    
    if (!range) {
      throw new Error('Could not identify the range. Please specify a range like A1:A10');
    }

    if (request.includes('median')) {
      const formula = `=MEDIAN(${range})`;
      return {
        success: true,
        formula,
        result: 'MEDIAN formula created',
        explanation: `Created MEDIAN formula for range ${range}`,
        affectedCells: targetCell ? [targetCell] : []
      };
    }

    if (request.includes('mode')) {
      const formula = `=MODE(${range})`;
      return {
        success: true,
        formula,
        result: 'MODE formula created',
        explanation: `Created MODE formula for range ${range}`,
        affectedCells: targetCell ? [targetCell] : []
      };
    }

    const formula = `=STDEV(${range})`;
    return {
      success: true,
      formula,
      result: 'STDEV formula created',
      explanation: `Created STDEV formula for range ${range}`,
      affectedCells: targetCell ? [targetCell] : []
    };
  }

  // Utility methods for extraction
  private extractRange(request: string): string | null {
    const rangeMatch = request.match(/([A-Z]+\d+:[A-Z]+\d+)/i);
    if (rangeMatch) return rangeMatch[1];
    
    const columnMatch = request.match(/column\s+([A-Z]+)/i);
    if (columnMatch) return `${columnMatch[1]}:${columnMatch[1]}`;
    
    const rangePattern = request.match(/range\s+([A-Z]+\d+)\s+to\s+([A-Z]+\d+)/i);
    if (rangePattern) return `${rangePattern[1]}:${rangePattern[2]}`;
    
    return null;
  }

  private extractTargetCell(request: string): string | null {
    const cellMatch = request.match(/(?:in|to|put.*in|result.*in|display.*in)\s+(?:cell\s+)?([A-Z]+\d+)/i);
    return cellMatch ? cellMatch[1] : null;
  }

  private extractSourceCell(request: string): string | null {
    const cellMatch = request.match(/(?:from|in)\s+(?:cell\s+)?([A-Z]+\d+)/i);
    return cellMatch ? cellMatch[1] : null;
  }

  private extractTableRange(request: string): string | null {
    const tableMatch = request.match(/table\s+([A-Z]+\d+:[A-Z]+\d+)/i);
    return tableMatch ? tableMatch[1] : null;
  }

  private extractLookupValue(request: string): string | null {
    const valueMatch = request.match(/(?:based on|lookup|find)\s+(.+?)\s+(?:in|from)/i);
    return valueMatch ? valueMatch[1].trim() : null;
  }

  private extractColumnIndex(request: string): number | null {
    const indexMatch = request.match(/column\s+(\d+)/i);
    return indexMatch ? parseInt(indexMatch[1]) : null;
  }

  private extractLookupArray(request: string): string | null {
    const arrayMatch = request.match(/from\s+(?:range\s+)?([A-Z]+:[A-Z]+)/i);
    return arrayMatch ? arrayMatch[1] : null;
  }

  private extractReturnArray(request: string): string | null {
    const returnMatch = request.match(/return\s+(?:from\s+)?([A-Z]+:[A-Z]+)/i);
    return returnMatch ? returnMatch[1] : null;
  }

  private extractCondition(request: string): string | null {
    const conditionMatch = request.match(/if\s+(.+?)\s+then/i);
    return conditionMatch ? conditionMatch[1].trim() : null;
  }

  private extractTrueValue(request: string): string | null {
    const trueMatch = request.match(/then\s+['"]?(.+?)['"]?(?:\s+else|$)/i);
    return trueMatch ? trueMatch[1].trim() : null;
  }

  private extractFalseValue(request: string): string | null {
    const falseMatch = request.match(/else\s+['"]?(.+?)['"]?$/i);
    return falseMatch ? falseMatch[1].trim() : null;
  }

  private extractCellReferences(request: string): string[] {
    const cellMatches = request.match(/([A-Z]+\d+)/gi);
    return cellMatches || [];
  }

  private extractSeparator(request: string): string {
    if (request.includes('space')) return ' ';
    if (request.includes('comma')) return ', ';
    if (request.includes('dash')) return ' - ';
    return ' ';
  }

  private extractNumber(request: string): number | null {
    const numberMatch = request.match(/(\d+)/);
    return numberMatch ? parseInt(numberMatch[1]) : null;
  }

  private extractFormattingCondition(request: string): string | null {
    const conditionMatch = request.match(/(?:above|greater than|>)\s+(\d+)/i);
    if (conditionMatch) return `value > ${conditionMatch[1]}`;
    
    const containsMatch = request.match(/contain(?:s)?\s+['"](.+?)['"]/i);
    if (containsMatch) return `contains "${containsMatch[1]}"`;
    
    return null;
  }

  private extractColor(request: string): string {
    if (request.includes('red')) return 'red';
    if (request.includes('green')) return 'green';
    if (request.includes('yellow')) return 'yellow';
    if (request.includes('blue')) return 'blue';
    return 'blue';
  }

  // Calculation methods
  private calculateSum(range: string): number {
    const cells = this.parseRange(range);
    return cells.reduce((sum, cellId) => {
      const cell = this.cells[cellId];
      const value = cell ? Number(cell.value) : 0;
      return sum + (isNaN(value) ? 0 : value);
    }, 0);
  }

  private calculateAverage(range: string): number {
    const cells = this.parseRange(range);
    const values = cells.map(cellId => {
      const cell = this.cells[cellId];
      return cell ? Number(cell.value) : 0;
    }).filter(val => !isNaN(val) && val !== 0);
    
    return values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0;
  }

  private calculateCount(range: string): number {
    const cells = this.parseRange(range);
    return cells.filter(cellId => {
      const cell = this.cells[cellId];
      return cell && !isNaN(Number(cell.value));
    }).length;
  }

  private calculateCountA(range: string): number {
    const cells = this.parseRange(range);
    return cells.filter(cellId => {
      const cell = this.cells[cellId];
      return cell && cell.value !== null && cell.value !== undefined && cell.value !== '';
    }).length;
  }

  private calculateMax(range: string): number {
    const cells = this.parseRange(range);
    const values = cells.map(cellId => {
      const cell = this.cells[cellId];
      return cell ? Number(cell.value) : -Infinity;
    }).filter(val => !isNaN(val) && val !== -Infinity);
    
    return values.length > 0 ? Math.max(...values) : 0;
  }

  private calculateMin(range: string): number {
    const cells = this.parseRange(range);
    const values = cells.map(cellId => {
      const cell = this.cells[cellId];
      return cell ? Number(cell.value) : Infinity;
    }).filter(val => !isNaN(val) && val !== Infinity);
    
    return values.length > 0 ? Math.min(...values) : 0;
  }

  parseRange(range: string): string[] {
    const match = range.match(/([A-Z]+)(\d+):([A-Z]+)(\d+)/i);
    if (!match) return [];

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
}