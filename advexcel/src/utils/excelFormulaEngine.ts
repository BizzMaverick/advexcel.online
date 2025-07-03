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

      if (this.isHlookupRequest(normalizedRequest)) {
        return this.handleHlookupRequest(request);
      }

      // Conditional logic
      if (this.isIfRequest(normalizedRequest)) {
        return this.handleIfRequest(request);
      }

      if (this.isNestedIfRequest(normalizedRequest)) {
        return this.handleNestedIfRequest(request);
      }

      if (this.isIfsRequest(normalizedRequest)) {
        return this.handleIfsRequest(request);
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

      // Financial functions
      if (this.isFinancialRequest(normalizedRequest)) {
        return this.handleFinancialRequest(request);
      }

      // Logical functions
      if (this.isLogicalRequest(normalizedRequest)) {
        return this.handleLogicalRequest(request);
      }

      // Conditional aggregation
      if (this.isConditionalAggregationRequest(normalizedRequest)) {
        return this.handleConditionalAggregationRequest(request);
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
    return request.includes('vlookup') || 
           (request.includes('lookup') && request.includes('vertical')) || 
           (request.includes('find') && request.includes('table'));
  }

  private isHlookupRequest(request: string): boolean {
    return request.includes('hlookup') || 
           (request.includes('lookup') && request.includes('horizontal'));
  }

  private isIndexMatchRequest(request: string): boolean {
    return (request.includes('index') && request.includes('match')) || 
           request.includes('index match');
  }

  private isIfRequest(request: string): boolean {
    return request.includes('if') && (request.includes('then') || request.includes('else'));
  }

  private isNestedIfRequest(request: string): boolean {
    return request.includes('nested if') || request.includes('multiple conditions') ||
           (request.includes('if') && request.includes('else if'));
  }

  private isIfsRequest(request: string): boolean {
    return request.includes('ifs') || 
           (request.includes('multiple') && request.includes('conditions')) ||
           (request.includes('if') && request.includes('categorize'));
  }

  private isConcatenateRequest(request: string): boolean {
    return request.includes('concatenate') || request.includes('combine') || 
           request.includes('join') || request.includes('merge');
  }

  private isTextManipulationRequest(request: string): boolean {
    return request.includes('uppercase') || request.includes('lowercase') ||
           request.includes('extract') || request.includes('substring') ||
           request.includes('left') || request.includes('right') || request.includes('mid') ||
           request.includes('trim') || request.includes('text');
  }

  private isDateRequest(request: string): boolean {
    return request.includes('date') || request.includes('days') || 
           request.includes('year') || request.includes('month') ||
           request.includes('today') || request.includes('now');
  }

  private isConditionalFormattingRequest(request: string): boolean {
    return request.includes('highlight') || request.includes('color') || 
           request.includes('format') || request.includes('background');
  }

  private isStatisticalRequest(request: string): boolean {
    return request.includes('median') || request.includes('mode') || 
           request.includes('standard deviation') || request.includes('variance') ||
           request.includes('percentile') || request.includes('quartile');
  }

  private isFinancialRequest(request: string): boolean {
    return request.includes('pmt') || request.includes('payment') ||
           request.includes('loan') || request.includes('interest') ||
           request.includes('fv') || request.includes('future value') ||
           request.includes('pv') || request.includes('present value') ||
           request.includes('npv') || request.includes('irr');
  }

  private isLogicalRequest(request: string): boolean {
    return request.includes('and') || request.includes('or') || 
           request.includes('not') || request.includes('xor') ||
           request.includes('logical');
  }

  private isConditionalAggregationRequest(request: string): boolean {
    return request.includes('sumif') || request.includes('countif') || 
           request.includes('averageif') || request.includes('sumifs') ||
           request.includes('countifs') || request.includes('averageifs');
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
    const exactMatch = request.includes('exact') ? 'FALSE' : 'TRUE';

    if (!tableRange) {
      throw new Error('Could not identify the lookup table range. Please specify like A1:C10');
    }

    const formula = `=VLOOKUP(${lookupValue || 'A1'}, ${tableRange}, ${columnIndex || 2}, ${exactMatch})`;

    return {
      success: true,
      formula,
      result: 'VLOOKUP formula created',
      explanation: `Created VLOOKUP formula to find ${lookupValue || 'lookup value'} in table ${tableRange}, column ${columnIndex || 2}, with ${exactMatch === 'FALSE' ? 'exact' : 'approximate'} matching`,
      affectedCells: targetCell ? [targetCell] : []
    };
  }

  private handleHlookupRequest(request: string): FormulaResult {
    const lookupValue = this.extractLookupValue(request);
    const tableRange = this.extractTableRange(request);
    const rowIndex = this.extractRowIndex(request);
    const targetCell = this.extractTargetCell(request);
    const exactMatch = request.includes('exact') ? 'FALSE' : 'TRUE';

    if (!tableRange) {
      throw new Error('Could not identify the lookup table range. Please specify like A1:C10');
    }

    const formula = `=HLOOKUP(${lookupValue || 'A1'}, ${tableRange}, ${rowIndex || 2}, ${exactMatch})`;

    return {
      success: true,
      formula,
      result: 'HLOOKUP formula created',
      explanation: `Created HLOOKUP formula to find ${lookupValue || 'lookup value'} in table ${tableRange}, row ${rowIndex || 2}, with ${exactMatch === 'FALSE' ? 'exact' : 'approximate'} matching`,
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
      explanation: `Created INDEX MATCH formula to lookup ${lookupValue || 'value'} in ${lookupArray || 'column A'} and return corresponding value from ${returnArray || 'column B'}`,
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
      explanation: `Created IF formula with condition: ${condition || 'A1>100'}, returning "${trueValue || 'High'}" if true, otherwise "${falseValue || 'Low'}"`,
      affectedCells: targetCell ? [targetCell] : []
    };
  }

  private handleNestedIfRequest(request: string): FormulaResult {
    const targetCell = this.extractTargetCell(request);
    
    // Handle score categorization example
    if (request.includes('score') || request.includes('grade')) {
      const formula = `=IF(A1>=90, "A", IF(A1>=80, "B", IF(A1>=70, "C", IF(A1>=60, "D", "F"))))`;
      return {
        success: true,
        formula,
        result: 'Grade categorization formula created',
        explanation: 'Created nested IF formula for grade categorization (90+=A, 80+=B, 70+=C, 60+=D, <60=F)',
        affectedCells: targetCell ? [targetCell] : []
      };
    }

    const formula = `=IF(A1>100, "High", IF(A1>50, "Medium", "Low"))`;
    return {
      success: true,
      formula,
      result: 'Nested IF formula created',
      explanation: 'Created nested IF formula with multiple conditions',
      affectedCells: targetCell ? [targetCell] : []
    };
  }

  private handleIfsRequest(request: string): FormulaResult {
    const targetCell = this.extractTargetCell(request);
    
    // Extract conditions from request
    const conditions = this.extractMultipleConditions(request);
    
    if (conditions.length > 0) {
      const conditionPairs = conditions.map(c => `${c.condition}, "${c.value}"`).join(', ');
      const formula = `=IFS(${conditionPairs}, TRUE, "Other")`;
      
      return {
        success: true,
        formula,
        result: 'IFS formula created',
        explanation: `Created IFS formula with ${conditions.length} conditions`,
        affectedCells: targetCell ? [targetCell] : []
      };
    }
    
    // Default IFS formula
    const formula = `=IFS(A1>100, "High", A1>50, "Medium", A1>0, "Low", TRUE, "N/A")`;
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
      explanation: `Created CONCATENATE formula to join ${cells.length >= 2 ? cells.join(' and ') : 'A1 and B1'} with "${separator}" separator`,
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

    if (request.includes('right') || request.includes('last')) {
      const numChars = this.extractNumber(request) || 5;
      const formula = `=RIGHT(${sourceCell || 'A1'}, ${numChars})`;
      return {
        success: true,
        formula,
        result: 'RIGHT formula created',
        explanation: `Created RIGHT formula to extract last ${numChars} characters from ${sourceCell || 'A1'}`,
        affectedCells: targetCell ? [targetCell] : []
      };
    }

    if (request.includes('mid') || request.includes('middle') || request.includes('extract')) {
      const startPos = this.extractStartPosition(request) || 2;
      const numChars = this.extractNumber(request) || 3;
      const formula = `=MID(${sourceCell || 'A1'}, ${startPos}, ${numChars})`;
      return {
        success: true,
        formula,
        result: 'MID formula created',
        explanation: `Created MID formula to extract ${numChars} characters from position ${startPos} in ${sourceCell || 'A1'}`,
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
    
    if (request.includes('days between') || request.includes('difference between')) {
      const cells = this.extractCellReferences(request);
      const formula = cells.length >= 2 ? 
        `=DATEDIF(${cells[0]}, ${cells[1]}, "D")` :
        `=DATEDIF(A1, B1, "D")`;
      
      return {
        success: true,
        formula,
        result: 'DATEDIF formula created',
        explanation: `Created DATEDIF formula to calculate days between dates in ${cells.length >= 2 ? cells.join(' and ') : 'A1 and B1'}`,
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

    if (request.includes('month')) {
      const sourceCell = this.extractSourceCell(request);
      const formula = `=MONTH(${sourceCell || 'A1'})`;
      
      return {
        success: true,
        formula,
        result: 'MONTH formula created',
        explanation: `Created MONTH formula to extract month from ${sourceCell || 'A1'}`,
        affectedCells: targetCell ? [targetCell] : []
      };
    }

    if (request.includes('day')) {
      const sourceCell = this.extractSourceCell(request);
      const formula = `=DAY(${sourceCell || 'A1'})`;
      
      return {
        success: true,
        formula,
        result: 'DAY formula created',
        explanation: `Created DAY formula to extract day from ${sourceCell || 'A1'}`,
        affectedCells: targetCell ? [targetCell] : []
      };
    }

    if (request.includes('today')) {
      const formula = `=TODAY()`;
      return {
        success: true,
        formula,
        result: new Date().toLocaleDateString(),
        explanation: 'Created TODAY formula to get current date',
        affectedCells: targetCell ? [targetCell] : []
      };
    }

    if (request.includes('now')) {
      const formula = `=NOW()`;
      return {
        success: true,
        formula,
        result: new Date().toLocaleString(),
        explanation: 'Created NOW formula to get current date and time',
        affectedCells: targetCell ? [targetCell] : []
      };
    }

    const formula = `=TODAY()`;
    return {
      success: true,
      formula,
      result: new Date().toLocaleDateString(),
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

    if (request.includes('standard deviation') || request.includes('stdev')) {
      const formula = `=STDEV(${range})`;
      return {
        success: true,
        formula,
        result: 'STDEV formula created',
        explanation: `Created STDEV formula for range ${range}`,
        affectedCells: targetCell ? [targetCell] : []
      };
    }

    if (request.includes('variance') || request.includes('var')) {
      const formula = `=VAR(${range})`;
      return {
        success: true,
        formula,
        result: 'VAR formula created',
        explanation: `Created VAR formula for range ${range}`,
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

  private handleFinancialRequest(request: string): FormulaResult {
    const targetCell = this.extractTargetCell(request);
    
    if (request.includes('pmt') || request.includes('payment') || request.includes('loan')) {
      const rate = this.extractRate(request) || 0.05;
      const nper = this.extractPeriods(request) || 36;
      const pv = this.extractPrincipal(request) || 10000;
      
      const formula = `=PMT(${rate}/12, ${nper}, ${pv})`;
      return {
        success: true,
        formula,
        result: 'PMT formula created',
        explanation: `Created PMT formula to calculate monthly payment for a loan of ${pv} over ${nper} months at ${rate*100}% annual interest`,
        affectedCells: targetCell ? [targetCell] : []
      };
    }

    if (request.includes('fv') || request.includes('future value')) {
      const rate = this.extractRate(request) || 0.05;
      const nper = this.extractPeriods(request) || 36;
      const pmt = this.extractPayment(request) || 100;
      
      const formula = `=FV(${rate}/12, ${nper}, ${pmt})`;
      return {
        success: true,
        formula,
        result: 'FV formula created',
        explanation: `Created FV formula to calculate future value of ${pmt} monthly payments over ${nper} months at ${rate*100}% annual interest`,
        affectedCells: targetCell ? [targetCell] : []
      };
    }

    if (request.includes('pv') || request.includes('present value')) {
      const rate = this.extractRate(request) || 0.05;
      const nper = this.extractPeriods(request) || 36;
      const pmt = this.extractPayment(request) || 100;
      
      const formula = `=PV(${rate}/12, ${nper}, ${pmt})`;
      return {
        success: true,
        formula,
        result: 'PV formula created',
        explanation: `Created PV formula to calculate present value of ${pmt} monthly payments over ${nper} months at ${rate*100}% annual interest`,
        affectedCells: targetCell ? [targetCell] : []
      };
    }

    // Default to PMT
    const formula = `=PMT(0.05/12, 36, 10000)`;
    return {
      success: true,
      formula,
      result: 'PMT formula created',
      explanation: 'Created PMT formula to calculate monthly payment for a loan',
      affectedCells: targetCell ? [targetCell] : []
    };
  }

  private handleLogicalRequest(request: string): FormulaResult {
    const targetCell = this.extractTargetCell(request);
    const conditions = this.extractMultipleConditions(request);
    
    if (request.includes('and')) {
      const formula = conditions.length >= 2 ? 
        `=AND(${conditions.map(c => c.condition).join(', ')})` :
        `=AND(A1>0, B1>0)`;
      
      return {
        success: true,
        formula,
        result: 'AND formula created',
        explanation: `Created AND formula to check if all conditions are true`,
        affectedCells: targetCell ? [targetCell] : []
      };
    }

    if (request.includes('or')) {
      const formula = conditions.length >= 2 ? 
        `=OR(${conditions.map(c => c.condition).join(', ')})` :
        `=OR(A1>0, B1>0)`;
      
      return {
        success: true,
        formula,
        result: 'OR formula created',
        explanation: `Created OR formula to check if any condition is true`,
        affectedCells: targetCell ? [targetCell] : []
      };
    }

    if (request.includes('not')) {
      const condition = conditions.length > 0 ? conditions[0].condition : 'A1>0';
      const formula = `=NOT(${condition})`;
      
      return {
        success: true,
        formula,
        result: 'NOT formula created',
        explanation: `Created NOT formula to negate the condition`,
        affectedCells: targetCell ? [targetCell] : []
      };
    }

    // Default to AND
    const formula = `=AND(A1>0, B1>0)`;
    return {
      success: true,
      formula,
      result: 'AND formula created',
      explanation: 'Created AND formula to check if all conditions are true',
      affectedCells: targetCell ? [targetCell] : []
    };
  }

  private handleConditionalAggregationRequest(request: string): FormulaResult {
    const range = this.extractRange(request);
    const criteria = this.extractCriteria(request);
    const targetCell = this.extractTargetCell(request);
    const sumRange = this.extractSumRange(request);
    
    if (!range) {
      throw new Error('Could not identify the range. Please specify a range like A1:A10');
    }

    if (request.includes('sumif')) {
      const formula = sumRange ? 
        `=SUMIF(${range}, "${criteria || '>0'}", ${sumRange})` :
        `=SUMIF(${range}, "${criteria || '>0'}")`;
      
      return {
        success: true,
        formula,
        result: 'SUMIF formula created',
        explanation: `Created SUMIF formula to sum values in ${sumRange || range} where ${range} meets criteria: ${criteria || '>0'}`,
        affectedCells: targetCell ? [targetCell] : []
      };
    }

    if (request.includes('countif')) {
      const formula = `=COUNTIF(${range}, "${criteria || '>0'}")`;
      
      return {
        success: true,
        formula,
        result: 'COUNTIF formula created',
        explanation: `Created COUNTIF formula to count cells in ${range} that meet criteria: ${criteria || '>0'}`,
        affectedCells: targetCell ? [targetCell] : []
      };
    }

    if (request.includes('averageif')) {
      const formula = sumRange ? 
        `=AVERAGEIF(${range}, "${criteria || '>0'}", ${sumRange})` :
        `=AVERAGEIF(${range}, "${criteria || '>0'}")`;
      
      return {
        success: true,
        formula,
        result: 'AVERAGEIF formula created',
        explanation: `Created AVERAGEIF formula to average values in ${sumRange || range} where ${range} meets criteria: ${criteria || '>0'}`,
        affectedCells: targetCell ? [targetCell] : []
      };
    }

    // Default to SUMIF
    const formula = `=SUMIF(${range}, ">0")`;
    return {
      success: true,
      formula,
      result: 'SUMIF formula created',
      explanation: `Created SUMIF formula to sum values in ${range} where values are greater than 0`,
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

  private extractRowIndex(request: string): number | null {
    const indexMatch = request.match(/row\s+(\d+)/i);
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

  private extractMultipleConditions(request: string): Array<{ condition: string; value: string }> {
    const conditions: Array<{ condition: string; value: string }> = [];
    
    // Try to extract condition-value pairs
    const conditionValuePairs = request.match(/if\s+(.+?)\s+then\s+(.+?)(?:\s+else\s+if|$)/gi);
    
    if (conditionValuePairs) {
      conditionValuePairs.forEach(pair => {
        const match = pair.match(/if\s+(.+?)\s+then\s+(.+?)$/i);
        if (match) {
          conditions.push({
            condition: match[1].trim(),
            value: match[2].trim().replace(/^["']|["']$/g, '') // Remove quotes
          });
        }
      });
    }
    
    // If no conditions found, try to extract from categorization language
    if (conditions.length === 0 && request.includes('categorize')) {
      const categories = [
        { condition: 'A1>=90', value: 'A' },
        { condition: 'A1>=80', value: 'B' },
        { condition: 'A1>=70', value: 'C' },
        { condition: 'A1>=60', value: 'D' }
      ];
      return categories;
    }
    
    return conditions;
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

  private extractStartPosition(request: string): number | null {
    const posMatch = request.match(/(?:position|start|from)\s+(\d+)/i);
    return posMatch ? parseInt(posMatch[1]) : null;
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

  private extractRate(request: string): number | null {
    const rateMatch = request.match(/(?:rate|interest)\s+(\d+(?:\.\d+)?)/i);
    return rateMatch ? parseFloat(rateMatch[1]) / 100 : null;
  }

  private extractPeriods(request: string): number | null {
    const periodMatch = request.match(/(?:periods|months|years|nper)\s+(\d+)/i);
    return periodMatch ? parseInt(periodMatch[1]) : null;
  }

  private extractPrincipal(request: string): number | null {
    const principalMatch = request.match(/(?:principal|loan|amount|pv)\s+(\d+)/i);
    return principalMatch ? parseInt(principalMatch[1]) : null;
  }

  private extractPayment(request: string): number | null {
    const paymentMatch = request.match(/(?:payment|pmt)\s+(\d+)/i);
    return paymentMatch ? parseInt(paymentMatch[1]) : null;
  }

  private extractCriteria(request: string): string | null {
    const criteriaMatch = request.match(/(?:criteria|where|if)\s+(.+?)(?:\s+in|\s+to|\s+from|$)/i);
    return criteriaMatch ? criteriaMatch[1].trim() : null;
  }

  private extractSumRange(request: string): string | null {
    const sumRangeMatch = request.match(/(?:sum range|sum from)\s+([A-Z]+\d+:[A-Z]+\d+)/i);
    return sumRangeMatch ? sumRangeMatch[1] : null;
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