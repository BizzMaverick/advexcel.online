import { Cell } from '../types/spreadsheet';
import { ExcelFunctions } from './excelFunctions';

export class ExcelCommandProcessor {
  private cells: { [key: string]: Cell };
  private excelFunctions: ExcelFunctions;

  constructor(cells: { [key: string]: Cell }) {
    this.cells = cells;
    this.excelFunctions = new ExcelFunctions(cells);
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

      // Function-specific commands
      if (this.isSpecificFunctionCommand(lowerCommand)) {
        return this.handleSpecificFunction(command);
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
    const fontWeightMatch = command.match(/(?:font|text)\s+(bold|normal)/i);
    const alignmentMatch = command.match(/(?:align|alignment)\s+(left|center|right)/i);

    if (!rangeMatch) {
      return {
        success: false,
        message: 'Please specify a range. Example: "format range A1:A10 if value > 100 with red background"'
      };
    }

    const range = rangeMatch[1];
    const condition = conditionMatch ? conditionMatch[1] : 'value > 0';
    const color = colorMatch ? colorMatch[1] : 'yellow';
    const fontWeight = fontWeightMatch ? fontWeightMatch[1] : undefined;
    const alignment = alignmentMatch ? alignmentMatch[1] : undefined;

    const format: any = {
      backgroundColor: this.getColorCode(color),
      textColor: this.getTextColor(color)
    };

    if (fontWeight) {
      format.fontWeight = fontWeight;
    }

    if (alignment) {
      format.alignment = alignment;
    }

    try {
      const cellIds = this.parseRange(range);
      const formatting = cellIds.map(cellId => ({ cellId, format }));

      return {
        success: true,
        message: `Applied conditional formatting to ${range} where ${condition}`,
        formatting
      };
    } catch (error) {
      return {
        success: false,
        message: `Error applying formatting: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
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
    
    try {
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
    } catch (error) {
      return {
        success: false,
        message: `Error clearing range: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
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

  private isSpecificFunctionCommand(command: string): boolean {
    const functionKeywords = [
      'vlookup', 'hlookup', 'index match', 'sumif', 'countif', 'averageif',
      'concatenate', 'left', 'right', 'mid', 'upper', 'lower', 'trim',
      'round', 'roundup', 'rounddown', 'pmt', 'fv', 'pv',
      'today', 'now', 'date', 'datedif', 'year', 'month', 'day',
      'and', 'or', 'not', 'if', 'ifs'
    ];
    
    return functionKeywords.some(keyword => command.includes(keyword));
  }

  private handleSpecificFunction(command: string): any {
    const lowerCommand = command.toLowerCase();
    
    // Lookup functions
    if (lowerCommand.includes('vlookup')) {
      return this.handleVlookupCommand(command);
    }
    
    if (lowerCommand.includes('hlookup')) {
      return this.handleHlookupCommand(command);
    }
    
    if (lowerCommand.includes('index match')) {
      return this.handleIndexMatchCommand(command);
    }
    
    // Conditional aggregation functions
    if (lowerCommand.includes('sumif')) {
      return this.handleSumifCommand(command);
    }
    
    if (lowerCommand.includes('countif')) {
      return this.handleCountifCommand(command);
    }
    
    if (lowerCommand.includes('averageif')) {
      return this.handleAverageifCommand(command);
    }
    
    // Text functions
    if (lowerCommand.includes('concatenate')) {
      return this.handleConcatenateCommand(command);
    }
    
    if (lowerCommand.includes('left')) {
      return this.handleLeftCommand(command);
    }
    
    if (lowerCommand.includes('right')) {
      return this.handleRightCommand(command);
    }
    
    if (lowerCommand.includes('mid')) {
      return this.handleMidCommand(command);
    }
    
    if (lowerCommand.includes('upper') || lowerCommand.includes('uppercase')) {
      return this.handleUpperCommand(command);
    }
    
    if (lowerCommand.includes('lower') || lowerCommand.includes('lowercase')) {
      return this.handleLowerCommand(command);
    }
    
    // Date functions
    if (lowerCommand.includes('today')) {
      return this.handleTodayCommand(command);
    }
    
    if (lowerCommand.includes('now')) {
      return this.handleNowCommand(command);
    }
    
    if (lowerCommand.includes('datedif')) {
      return this.handleDatedifCommand(command);
    }
    
    // Math functions
    if (lowerCommand.includes('round')) {
      if (lowerCommand.includes('roundup')) {
        return this.handleRoundupCommand(command);
      }
      if (lowerCommand.includes('rounddown')) {
        return this.handleRounddownCommand(command);
      }
      return this.handleRoundCommand(command);
    }
    
    // Financial functions
    if (lowerCommand.includes('pmt')) {
      return this.handlePmtCommand(command);
    }
    
    // Logical functions
    if (lowerCommand.includes('and')) {
      return this.handleAndCommand(command);
    }
    
    if (lowerCommand.includes('or')) {
      return this.handleOrCommand(command);
    }
    
    if (lowerCommand.includes('not')) {
      return this.handleNotCommand(command);
    }
    
    if (lowerCommand.includes('if')) {
      if (lowerCommand.includes('ifs')) {
        return this.handleIfsCommand(command);
      }
      return this.handleIfCommand(command);
    }
    
    return {
      success: false,
      message: 'Function not recognized'
    };
  }

  private handleVlookupCommand(command: string): any {
    const cellMatch = command.match(/(?:in|to|at)\s+(?:cell\s+)?([A-Z]+\d+)/i);
    const lookupValueMatch = command.match(/(?:lookup|find)\s+(?:value\s+)?['"]?([^'"]+)['"]?/i);
    const tableRangeMatch = command.match(/(?:in|from)\s+(?:table|range)\s+([A-Z]+\d+:[A-Z]+\d+)/i);
    const columnIndexMatch = command.match(/(?:column|col)\s+(\d+)/i);
    const exactMatchText = command.includes('exact') ? 'FALSE' : 'TRUE';

    if (!cellMatch) {
      return {
        success: false,
        message: 'Please specify target cell. Example: "apply VLOOKUP to cell C1"'
      };
    }

    const cellId = cellMatch[1].toUpperCase();
    const lookupValue = lookupValueMatch ? lookupValueMatch[1] : 'A1';
    const tableRange = tableRangeMatch ? tableRangeMatch[1] : 'A1:B10';
    const columnIndex = columnIndexMatch ? columnIndexMatch[1] : '2';

    const formula = `=VLOOKUP(${lookupValue}, ${tableRange}, ${columnIndex}, ${exactMatchText})`;
    
    const cell: Cell = {
      id: cellId,
      row: this.getRowFromCellId(cellId),
      col: this.getColFromCellId(cellId),
      value: '#N/A', // Placeholder value
      formula: formula,
      type: 'formula'
    };

    return {
      success: true,
      message: `Applied VLOOKUP formula to cell ${cellId}`,
      cellUpdates: { [cellId]: cell }
    };
  }

  private handleHlookupCommand(command: string): any {
    const cellMatch = command.match(/(?:in|to|at)\s+(?:cell\s+)?([A-Z]+\d+)/i);
    const lookupValueMatch = command.match(/(?:lookup|find)\s+(?:value\s+)?['"]?([^'"]+)['"]?/i);
    const tableRangeMatch = command.match(/(?:in|from)\s+(?:table|range)\s+([A-Z]+\d+:[A-Z]+\d+)/i);
    const rowIndexMatch = command.match(/(?:row)\s+(\d+)/i);
    const exactMatchText = command.includes('exact') ? 'FALSE' : 'TRUE';

    if (!cellMatch) {
      return {
        success: false,
        message: 'Please specify target cell. Example: "apply HLOOKUP to cell C1"'
      };
    }

    const cellId = cellMatch[1].toUpperCase();
    const lookupValue = lookupValueMatch ? lookupValueMatch[1] : 'A1';
    const tableRange = tableRangeMatch ? tableRangeMatch[1] : 'A1:J2';
    const rowIndex = rowIndexMatch ? rowIndexMatch[1] : '2';

    const formula = `=HLOOKUP(${lookupValue}, ${tableRange}, ${rowIndex}, ${exactMatchText})`;
    
    const cell: Cell = {
      id: cellId,
      row: this.getRowFromCellId(cellId),
      col: this.getColFromCellId(cellId),
      value: '#N/A', // Placeholder value
      formula: formula,
      type: 'formula'
    };

    return {
      success: true,
      message: `Applied HLOOKUP formula to cell ${cellId}`,
      cellUpdates: { [cellId]: cell }
    };
  }

  private handleIndexMatchCommand(command: string): any {
    const cellMatch = command.match(/(?:in|to|at)\s+(?:cell\s+)?([A-Z]+\d+)/i);
    const lookupValueMatch = command.match(/(?:lookup|find)\s+(?:value\s+)?['"]?([^'"]+)['"]?/i);
    const lookupRangeMatch = command.match(/(?:in|from)\s+(?:range)\s+([A-Z]+:[A-Z]+)/i);
    const returnRangeMatch = command.match(/(?:return|get)\s+(?:from)\s+(?:range)\s+([A-Z]+:[A-Z]+)/i);

    if (!cellMatch) {
      return {
        success: false,
        message: 'Please specify target cell. Example: "apply INDEX MATCH to cell C1"'
      };
    }

    const cellId = cellMatch[1].toUpperCase();
    const lookupValue = lookupValueMatch ? lookupValueMatch[1] : 'A1';
    const lookupRange = lookupRangeMatch ? lookupRangeMatch[1] : 'A:A';
    const returnRange = returnRangeMatch ? returnRangeMatch[1] : 'B:B';

    const formula = `=INDEX(${returnRange}, MATCH(${lookupValue}, ${lookupRange}, 0))`;
    
    const cell: Cell = {
      id: cellId,
      row: this.getRowFromCellId(cellId),
      col: this.getColFromCellId(cellId),
      value: '#N/A', // Placeholder value
      formula: formula,
      type: 'formula'
    };

    return {
      success: true,
      message: `Applied INDEX MATCH formula to cell ${cellId}`,
      cellUpdates: { [cellId]: cell }
    };
  }

  private handleSumifCommand(command: string): any {
    const cellMatch = command.match(/(?:in|to|at)\s+(?:cell\s+)?([A-Z]+\d+)/i);
    const rangeMatch = command.match(/(?:range)\s+([A-Z]+\d+:[A-Z]+\d+)/i);
    const criteriaMatch = command.match(/(?:criteria|where|if)\s+['"]?([^'"]+)['"]?/i);
    const sumRangeMatch = command.match(/(?:sum range|sum from)\s+([A-Z]+\d+:[A-Z]+\d+)/i);

    if (!cellMatch || !rangeMatch) {
      return {
        success: false,
        message: 'Please specify target cell and range. Example: "apply SUMIF to cell C1 range A1:A10 criteria >0"'
      };
    }

    const cellId = cellMatch[1].toUpperCase();
    const range = rangeMatch[1];
    const criteria = criteriaMatch ? criteriaMatch[1] : '>0';
    const sumRange = sumRangeMatch ? sumRangeMatch[1] : '';

    const formula = sumRange ? 
      `=SUMIF(${range}, "${criteria}", ${sumRange})` : 
      `=SUMIF(${range}, "${criteria}")`;
    
    const cell: Cell = {
      id: cellId,
      row: this.getRowFromCellId(cellId),
      col: this.getColFromCellId(cellId),
      value: 0, // Placeholder value
      formula: formula,
      type: 'formula'
    };

    return {
      success: true,
      message: `Applied SUMIF formula to cell ${cellId}`,
      cellUpdates: { [cellId]: cell }
    };
  }

  private handleCountifCommand(command: string): any {
    const cellMatch = command.match(/(?:in|to|at)\s+(?:cell\s+)?([A-Z]+\d+)/i);
    const rangeMatch = command.match(/(?:range)\s+([A-Z]+\d+:[A-Z]+\d+)/i);
    const criteriaMatch = command.match(/(?:criteria|where|if)\s+['"]?([^'"]+)['"]?/i);

    if (!cellMatch || !rangeMatch) {
      return {
        success: false,
        message: 'Please specify target cell and range. Example: "apply COUNTIF to cell C1 range A1:A10 criteria >0"'
      };
    }

    const cellId = cellMatch[1].toUpperCase();
    const range = rangeMatch[1];
    const criteria = criteriaMatch ? criteriaMatch[1] : '>0';

    const formula = `=COUNTIF(${range}, "${criteria}")`;
    
    const cell: Cell = {
      id: cellId,
      row: this.getRowFromCellId(cellId),
      col: this.getColFromCellId(cellId),
      value: 0, // Placeholder value
      formula: formula,
      type: 'formula'
    };

    return {
      success: true,
      message: `Applied COUNTIF formula to cell ${cellId}`,
      cellUpdates: { [cellId]: cell }
    };
  }

  private handleAverageifCommand(command: string): any {
    const cellMatch = command.match(/(?:in|to|at)\s+(?:cell\s+)?([A-Z]+\d+)/i);
    const rangeMatch = command.match(/(?:range)\s+([A-Z]+\d+:[A-Z]+\d+)/i);
    const criteriaMatch = command.match(/(?:criteria|where|if)\s+['"]?([^'"]+)['"]?/i);
    const avgRangeMatch = command.match(/(?:average range|average from)\s+([A-Z]+\d+:[A-Z]+\d+)/i);

    if (!cellMatch || !rangeMatch) {
      return {
        success: false,
        message: 'Please specify target cell and range. Example: "apply AVERAGEIF to cell C1 range A1:A10 criteria >0"'
      };
    }

    const cellId = cellMatch[1].toUpperCase();
    const range = rangeMatch[1];
    const criteria = criteriaMatch ? criteriaMatch[1] : '>0';
    const avgRange = avgRangeMatch ? avgRangeMatch[1] : '';

    const formula = avgRange ? 
      `=AVERAGEIF(${range}, "${criteria}", ${avgRange})` : 
      `=AVERAGEIF(${range}, "${criteria}")`;
    
    const cell: Cell = {
      id: cellId,
      row: this.getRowFromCellId(cellId),
      col: this.getColFromCellId(cellId),
      value: 0, // Placeholder value
      formula: formula,
      type: 'formula'
    };

    return {
      success: true,
      message: `Applied AVERAGEIF formula to cell ${cellId}`,
      cellUpdates: { [cellId]: cell }
    };
  }

  private handleConcatenateCommand(command: string): any {
    const cellMatch = command.match(/(?:in|to|at)\s+(?:cell\s+)?([A-Z]+\d+)/i);
    const textMatch = command.match(/(?:text|value|string)\s+['"]?([^'"]+)['"]?/i);
    const cellRefMatches = command.match(/(?:cell|cells)\s+([A-Z]+\d+)/gi);
    
    if (!cellMatch) {
      return {
        success: false,
        message: 'Please specify target cell. Example: "apply CONCATENATE to cell C1 with A1 and B1"'
      };
    }

    const cellId = cellMatch[1].toUpperCase();
    
    let formula = '=CONCATENATE(';
    
    if (cellRefMatches && cellRefMatches.length >= 2) {
      const cells = cellRefMatches.map(match => match.replace(/(?:cell|cells)\s+/i, ''));
      formula += cells.join(', ');
    } else if (textMatch) {
      formula += `"${textMatch[1]}"`;
    } else {
      formula += 'A1, " ", B1';
    }
    
    formula += ')';
    
    const cell: Cell = {
      id: cellId,
      row: this.getRowFromCellId(cellId),
      col: this.getColFromCellId(cellId),
      value: '', // Placeholder value
      formula: formula,
      type: 'formula'
    };

    return {
      success: true,
      message: `Applied CONCATENATE formula to cell ${cellId}`,
      cellUpdates: { [cellId]: cell }
    };
  }

  private handleLeftCommand(command: string): any {
    const cellMatch = command.match(/(?:in|to|at)\s+(?:cell\s+)?([A-Z]+\d+)/i);
    const sourceMatch = command.match(/(?:from|of)\s+(?:cell\s+)?([A-Z]+\d+)/i);
    const numCharsMatch = command.match(/(\d+)\s+(?:characters|chars)/i);

    if (!cellMatch || !sourceMatch) {
      return {
        success: false,
        message: 'Please specify target and source cells. Example: "apply LEFT to cell C1 from A1 5 characters"'
      };
    }

    const cellId = cellMatch[1].toUpperCase();
    const sourceCell = sourceMatch[1].toUpperCase();
    const numChars = numCharsMatch ? numCharsMatch[1] : '1';

    const formula = `=LEFT(${sourceCell}, ${numChars})`;
    
    const cell: Cell = {
      id: cellId,
      row: this.getRowFromCellId(cellId),
      col: this.getColFromCellId(cellId),
      value: '', // Placeholder value
      formula: formula,
      type: 'formula'
    };

    return {
      success: true,
      message: `Applied LEFT formula to cell ${cellId}`,
      cellUpdates: { [cellId]: cell }
    };
  }

  private handleRightCommand(command: string): any {
    const cellMatch = command.match(/(?:in|to|at)\s+(?:cell\s+)?([A-Z]+\d+)/i);
    const sourceMatch = command.match(/(?:from|of)\s+(?:cell\s+)?([A-Z]+\d+)/i);
    const numCharsMatch = command.match(/(\d+)\s+(?:characters|chars)/i);

    if (!cellMatch || !sourceMatch) {
      return {
        success: false,
        message: 'Please specify target and source cells. Example: "apply RIGHT to cell C1 from A1 5 characters"'
      };
    }

    const cellId = cellMatch[1].toUpperCase();
    const sourceCell = sourceMatch[1].toUpperCase();
    const numChars = numCharsMatch ? numCharsMatch[1] : '1';

    const formula = `=RIGHT(${sourceCell}, ${numChars})`;
    
    const cell: Cell = {
      id: cellId,
      row: this.getRowFromCellId(cellId),
      col: this.getColFromCellId(cellId),
      value: '', // Placeholder value
      formula: formula,
      type: 'formula'
    };

    return {
      success: true,
      message: `Applied RIGHT formula to cell ${cellId}`,
      cellUpdates: { [cellId]: cell }
    };
  }

  private handleMidCommand(command: string): any {
    const cellMatch = command.match(/(?:in|to|at)\s+(?:cell\s+)?([A-Z]+\d+)/i);
    const sourceMatch = command.match(/(?:from|of)\s+(?:cell\s+)?([A-Z]+\d+)/i);
    const startPosMatch = command.match(/(?:start|position)\s+(\d+)/i);
    const numCharsMatch = command.match(/(\d+)\s+(?:characters|chars)/i);

    if (!cellMatch || !sourceMatch) {
      return {
        success: false,
        message: 'Please specify target and source cells. Example: "apply MID to cell C1 from A1 start 2 for 3 characters"'
      };
    }

    const cellId = cellMatch[1].toUpperCase();
    const sourceCell = sourceMatch[1].toUpperCase();
    const startPos = startPosMatch ? startPosMatch[1] : '1';
    const numChars = numCharsMatch ? numCharsMatch[1] : '1';

    const formula = `=MID(${sourceCell}, ${startPos}, ${numChars})`;
    
    const cell: Cell = {
      id: cellId,
      row: this.getRowFromCellId(cellId),
      col: this.getColFromCellId(cellId),
      value: '', // Placeholder value
      formula: formula,
      type: 'formula'
    };

    return {
      success: true,
      message: `Applied MID formula to cell ${cellId}`,
      cellUpdates: { [cellId]: cell }
    };
  }

  private handleUpperCommand(command: string): any {
    const cellMatch = command.match(/(?:in|to|at)\s+(?:cell\s+)?([A-Z]+\d+)/i);
    const sourceMatch = command.match(/(?:from|of)\s+(?:cell\s+)?([A-Z]+\d+)/i);

    if (!cellMatch) {
      return {
        success: false,
        message: 'Please specify target cell. Example: "apply UPPER to cell C1 from A1"'
      };
    }

    const cellId = cellMatch[1].toUpperCase();
    const sourceCell = sourceMatch ? sourceMatch[1].toUpperCase() : 'A1';

    const formula = `=UPPER(${sourceCell})`;
    
    const cell: Cell = {
      id: cellId,
      row: this.getRowFromCellId(cellId),
      col: this.getColFromCellId(cellId),
      value: '', // Placeholder value
      formula: formula,
      type: 'formula'
    };

    return {
      success: true,
      message: `Applied UPPER formula to cell ${cellId}`,
      cellUpdates: { [cellId]: cell }
    };
  }

  private handleLowerCommand(command: string): any {
    const cellMatch = command.match(/(?:in|to|at)\s+(?:cell\s+)?([A-Z]+\d+)/i);
    const sourceMatch = command.match(/(?:from|of)\s+(?:cell\s+)?([A-Z]+\d+)/i);

    if (!cellMatch) {
      return {
        success: false,
        message: 'Please specify target cell. Example: "apply LOWER to cell C1 from A1"'
      };
    }

    const cellId = cellMatch[1].toUpperCase();
    const sourceCell = sourceMatch ? sourceMatch[1].toUpperCase() : 'A1';

    const formula = `=LOWER(${sourceCell})`;
    
    const cell: Cell = {
      id: cellId,
      row: this.getRowFromCellId(cellId),
      col: this.getColFromCellId(cellId),
      value: '', // Placeholder value
      formula: formula,
      type: 'formula'
    };

    return {
      success: true,
      message: `Applied LOWER formula to cell ${cellId}`,
      cellUpdates: { [cellId]: cell }
    };
  }

  private handleTodayCommand(command: string): any {
    const cellMatch = command.match(/(?:in|to|at)\s+(?:cell\s+)?([A-Z]+\d+)/i);

    if (!cellMatch) {
      return {
        success: false,
        message: 'Please specify target cell. Example: "apply TODAY to cell C1"'
      };
    }

    const cellId = cellMatch[1].toUpperCase();
    const formula = `=TODAY()`;
    
    const cell: Cell = {
      id: cellId,
      row: this.getRowFromCellId(cellId),
      col: this.getColFromCellId(cellId),
      value: new Date().toLocaleDateString(), // Placeholder value
      formula: formula,
      type: 'formula'
    };

    return {
      success: true,
      message: `Applied TODAY formula to cell ${cellId}`,
      cellUpdates: { [cellId]: cell }
    };
  }

  private handleNowCommand(command: string): any {
    const cellMatch = command.match(/(?:in|to|at)\s+(?:cell\s+)?([A-Z]+\d+)/i);

    if (!cellMatch) {
      return {
        success: false,
        message: 'Please specify target cell. Example: "apply NOW to cell C1"'
      };
    }

    const cellId = cellMatch[1].toUpperCase();
    const formula = `=NOW()`;
    
    const cell: Cell = {
      id: cellId,
      row: this.getRowFromCellId(cellId),
      col: this.getColFromCellId(cellId),
      value: new Date().toLocaleString(), // Placeholder value
      formula: formula,
      type: 'formula'
    };

    return {
      success: true,
      message: `Applied NOW formula to cell ${cellId}`,
      cellUpdates: { [cellId]: cell }
    };
  }

  private handleDatedifCommand(command: string): any {
    const cellMatch = command.match(/(?:in|to|at)\s+(?:cell\s+)?([A-Z]+\d+)/i);
    const startDateMatch = command.match(/(?:start date|from)\s+(?:cell\s+)?([A-Z]+\d+)/i);
    const endDateMatch = command.match(/(?:end date|to)\s+(?:cell\s+)?([A-Z]+\d+)/i);
    const unitMatch = command.match(/(?:unit|in)\s+['"]?([YMD])['"]?/i);

    if (!cellMatch || !startDateMatch || !endDateMatch) {
      return {
        success: false,
        message: 'Please specify target cell, start date, and end date. Example: "apply DATEDIF to cell C1 from A1 to B1 in days"'
      };
    }

    const cellId = cellMatch[1].toUpperCase();
    const startDate = startDateMatch[1].toUpperCase();
    const endDate = endDateMatch[1].toUpperCase();
    const unit = unitMatch ? unitMatch[1].toUpperCase() : 'D';

    const formula = `=DATEDIF(${startDate}, ${endDate}, "${unit}")`;
    
    const cell: Cell = {
      id: cellId,
      row: this.getRowFromCellId(cellId),
      col: this.getColFromCellId(cellId),
      value: 0, // Placeholder value
      formula: formula,
      type: 'formula'
    };

    return {
      success: true,
      message: `Applied DATEDIF formula to cell ${cellId}`,
      cellUpdates: { [cellId]: cell }
    };
  }

  private handleRoundCommand(command: string): any {
    const cellMatch = command.match(/(?:in|to|at)\s+(?:cell\s+)?([A-Z]+\d+)/i);
    const sourceMatch = command.match(/(?:from|of)\s+(?:cell\s+)?([A-Z]+\d+)/i);
    const digitsMatch = command.match(/(?:to|with)\s+(\d+)\s+(?:digits|decimals)/i);

    if (!cellMatch) {
      return {
        success: false,
        message: 'Please specify target cell. Example: "apply ROUND to cell C1 from A1 with 2 digits"'
      };
    }

    const cellId = cellMatch[1].toUpperCase();
    const sourceCell = sourceMatch ? sourceMatch[1].toUpperCase() : 'A1';
    const digits = digitsMatch ? digitsMatch[1] : '0';

    const formula = `=ROUND(${sourceCell}, ${digits})`;
    
    const cell: Cell = {
      id: cellId,
      row: this.getRowFromCellId(cellId),
      col: this.getColFromCellId(cellId),
      value: 0, // Placeholder value
      formula: formula,
      type: 'formula'
    };

    return {
      success: true,
      message: `Applied ROUND formula to cell ${cellId}`,
      cellUpdates: { [cellId]: cell }
    };
  }

  private handleRoundupCommand(command: string): any {
    const cellMatch = command.match(/(?:in|to|at)\s+(?:cell\s+)?([A-Z]+\d+)/i);
    const sourceMatch = command.match(/(?:from|of)\s+(?:cell\s+)?([A-Z]+\d+)/i);
    const digitsMatch = command.match(/(?:to|with)\s+(\d+)\s+(?:digits|decimals)/i);

    if (!cellMatch) {
      return {
        success: false,
        message: 'Please specify target cell. Example: "apply ROUNDUP to cell C1 from A1 with 2 digits"'
      };
    }

    const cellId = cellMatch[1].toUpperCase();
    const sourceCell = sourceMatch ? sourceMatch[1].toUpperCase() : 'A1';
    const digits = digitsMatch ? digitsMatch[1] : '0';

    const formula = `=ROUNDUP(${sourceCell}, ${digits})`;
    
    const cell: Cell = {
      id: cellId,
      row: this.getRowFromCellId(cellId),
      col: this.getColFromCellId(cellId),
      value: 0, // Placeholder value
      formula: formula,
      type: 'formula'
    };

    return {
      success: true,
      message: `Applied ROUNDUP formula to cell ${cellId}`,
      cellUpdates: { [cellId]: cell }
    };
  }

  private handleRounddownCommand(command: string): any {
    const cellMatch = command.match(/(?:in|to|at)\s+(?:cell\s+)?([A-Z]+\d+)/i);
    const sourceMatch = command.match(/(?:from|of)\s+(?:cell\s+)?([A-Z]+\d+)/i);
    const digitsMatch = command.match(/(?:to|with)\s+(\d+)\s+(?:digits|decimals)/i);

    if (!cellMatch) {
      return {
        success: false,
        message: 'Please specify target cell. Example: "apply ROUNDDOWN to cell C1 from A1 with 2 digits"'
      };
    }

    const cellId = cellMatch[1].toUpperCase();
    const sourceCell = sourceMatch ? sourceMatch[1].toUpperCase() : 'A1';
    const digits = digitsMatch ? digitsMatch[1] : '0';

    const formula = `=ROUNDDOWN(${sourceCell}, ${digits})`;
    
    const cell: Cell = {
      id: cellId,
      row: this.getRowFromCellId(cellId),
      col: this.getColFromCellId(cellId),
      value: 0, // Placeholder value
      formula: formula,
      type: 'formula'
    };

    return {
      success: true,
      message: `Applied ROUNDDOWN formula to cell ${cellId}`,
      cellUpdates: { [cellId]: cell }
    };
  }

  private handlePmtCommand(command: string): any {
    const cellMatch = command.match(/(?:in|to|at)\s+(?:cell\s+)?([A-Z]+\d+)/i);
    const rateMatch = command.match(/(?:rate|interest)\s+(\d+(?:\.\d+)?)/i);
    const periodsMatch = command.match(/(?:periods|nper|months|years)\s+(\d+)/i);
    const principalMatch = command.match(/(?:principal|pv|loan|amount)\s+(\d+)/i);

    if (!cellMatch) {
      return {
        success: false,
        message: 'Please specify target cell. Example: "apply PMT to cell C1 rate 5% periods 36 principal 10000"'
      };
    }

    const cellId = cellMatch[1].toUpperCase();
    const rate = rateMatch ? parseFloat(rateMatch[1]) / 100 / 12 : 0.05 / 12; // Monthly rate
    const periods = periodsMatch ? periodsMatch[1] : '36';
    const principal = principalMatch ? principalMatch[1] : '10000';

    const formula = `=PMT(${rate}, ${periods}, ${principal})`;
    
    const cell: Cell = {
      id: cellId,
      row: this.getRowFromCellId(cellId),
      col: this.getColFromCellId(cellId),
      value: 0, // Placeholder value
      formula: formula,
      type: 'formula'
    };

    return {
      success: true,
      message: `Applied PMT formula to cell ${cellId}`,
      cellUpdates: { [cellId]: cell }
    };
  }

  private handleAndCommand(command: string): any {
    const cellMatch = command.match(/(?:in|to|at)\s+(?:cell\s+)?([A-Z]+\d+)/i);
    const conditionMatches = command.match(/(?:condition|check)\s+([^,]+)/gi);

    if (!cellMatch) {
      return {
        success: false,
        message: 'Please specify target cell. Example: "apply AND to cell C1 condition A1>0 condition B1>0"'
      };
    }

    const cellId = cellMatch[1].toUpperCase();
    
    let formula = '=AND(';
    
    if (conditionMatches && conditionMatches.length >= 1) {
      const conditions = conditionMatches.map(match => 
        match.replace(/(?:condition|check)\s+/i, '').trim()
      );
      formula += conditions.join(', ');
    } else {
      formula += 'A1>0, B1>0';
    }
    
    formula += ')';
    
    const cell: Cell = {
      id: cellId,
      row: this.getRowFromCellId(cellId),
      col: this.getColFromCellId(cellId),
      value: false, // Placeholder value
      formula: formula,
      type: 'formula'
    };

    return {
      success: true,
      message: `Applied AND formula to cell ${cellId}`,
      cellUpdates: { [cellId]: cell }
    };
  }

  private handleOrCommand(command: string): any {
    const cellMatch = command.match(/(?:in|to|at)\s+(?:cell\s+)?([A-Z]+\d+)/i);
    const conditionMatches = command.match(/(?:condition|check)\s+([^,]+)/gi);

    if (!cellMatch) {
      return {
        success: false,
        message: 'Please specify target cell. Example: "apply OR to cell C1 condition A1>0 condition B1>0"'
      };
    }

    const cellId = cellMatch[1].toUpperCase();
    
    let formula = '=OR(';
    
    if (conditionMatches && conditionMatches.length >= 1) {
      const conditions = conditionMatches.map(match => 
        match.replace(/(?:condition|check)\s+/i, '').trim()
      );
      formula += conditions.join(', ');
    } else {
      formula += 'A1>0, B1>0';
    }
    
    formula += ')';
    
    const cell: Cell = {
      id: cellId,
      row: this.getRowFromCellId(cellId),
      col: this.getColFromCellId(cellId),
      value: false, // Placeholder value
      formula: formula,
      type: 'formula'
    };

    return {
      success: true,
      message: `Applied OR formula to cell ${cellId}`,
      cellUpdates: { [cellId]: cell }
    };
  }

  private handleNotCommand(command: string): any {
    const cellMatch = command.match(/(?:in|to|at)\s+(?:cell\s+)?([A-Z]+\d+)/i);
    const conditionMatch = command.match(/(?:condition|check)\s+([^,]+)/i);

    if (!cellMatch) {
      return {
        success: false,
        message: 'Please specify target cell. Example: "apply NOT to cell C1 condition A1>0"'
      };
    }

    const cellId = cellMatch[1].toUpperCase();
    const condition = conditionMatch ? conditionMatch[1].trim() : 'A1>0';

    const formula = `=NOT(${condition})`;
    
    const cell: Cell = {
      id: cellId,
      row: this.getRowFromCellId(cellId),
      col: this.getColFromCellId(cellId),
      value: false, // Placeholder value
      formula: formula,
      type: 'formula'
    };

    return {
      success: true,
      message: `Applied NOT formula to cell ${cellId}`,
      cellUpdates: { [cellId]: cell }
    };
  }

  private handleIfCommand(command: string): any {
    const cellMatch = command.match(/(?:in|to|at)\s+(?:cell\s+)?([A-Z]+\d+)/i);
    const conditionMatch = command.match(/(?:if|condition)\s+([^,]+?)\s+(?:then)/i);
    const trueValueMatch = command.match(/(?:then)\s+['"]?([^'"]+?)['"]?(?:\s+else|$)/i);
    const falseValueMatch = command.match(/(?:else)\s+['"]?([^'"]+?)['"]?$/i);

    if (!cellMatch) {
      return {
        success: false,
        message: 'Please specify target cell. Example: "apply IF to cell C1 if A1>0 then Yes else No"'
      };
    }

    const cellId = cellMatch[1].toUpperCase();
    const condition = conditionMatch ? conditionMatch[1].trim() : 'A1>0';
    const trueValue = trueValueMatch ? trueValueMatch[1].trim() : '"Yes"';
    const falseValue = falseValueMatch ? falseValueMatch[1].trim() : '"No"';

    // Add quotes if values don't have them and aren't cell references
    const formattedTrueValue = trueValue.match(/^[A-Z]+\d+$/) || trueValue.startsWith('"') ? trueValue : `"${trueValue}"`;
    const formattedFalseValue = falseValue.match(/^[A-Z]+\d+$/) || falseValue.startsWith('"') ? falseValue : `"${falseValue}"`;

    const formula = `=IF(${condition}, ${formattedTrueValue}, ${formattedFalseValue})`;
    
    const cell: Cell = {
      id: cellId,
      row: this.getRowFromCellId(cellId),
      col: this.getColFromCellId(cellId),
      value: '', // Placeholder value
      formula: formula,
      type: 'formula'
    };

    return {
      success: true,
      message: `Applied IF formula to cell ${cellId}`,
      cellUpdates: { [cellId]: cell }
    };
  }

  private handleIfsCommand(command: string): any {
    const cellMatch = command.match(/(?:in|to|at)\s+(?:cell\s+)?([A-Z]+\d+)/i);
    const conditionValuePairs = command.match(/(?:if|condition)\s+([^,]+?)\s+(?:then)\s+['"]?([^'"]+?)['"]?(?:\s+(?:else|if|condition)|$)/gi);

    if (!cellMatch) {
      return {
        success: false,
        message: 'Please specify target cell. Example: "apply IFS to cell C1 if A1>90 then A if A1>80 then B else F"'
      };
    }

    const cellId = cellMatch[1].toUpperCase();
    
    let formula = '=IFS(';
    
    if (conditionValuePairs && conditionValuePairs.length >= 1) {
      const pairs = [];
      
      for (const pair of conditionValuePairs) {
        const match = pair.match(/(?:if|condition)\s+([^,]+?)\s+(?:then)\s+['"]?([^'"]+?)['"]?(?:\s+(?:else|if|condition)|$)/i);
        if (match) {
          const condition = match[1].trim();
          const value = match[2].trim();
          const formattedValue = value.match(/^[A-Z]+\d+$/) || value.startsWith('"') ? value : `"${value}"`;
          pairs.push(`${condition}, ${formattedValue}`);
        }
      }
      
      formula += pairs.join(', ');
      
      // Add default case
      const elseMatch = command.match(/(?:else)\s+['"]?([^'"]+?)['"]?$/i);
      if (elseMatch) {
        const defaultValue = elseMatch[1].trim();
        const formattedDefault = defaultValue.match(/^[A-Z]+\d+$/) || defaultValue.startsWith('"') ? defaultValue : `"${defaultValue}"`;
        formula += `, TRUE, ${formattedDefault}`;
      } else {
        formula += ', TRUE, ""';
      }
    } else {
      // Default IFS formula
      formula += 'A1>90, "A", A1>80, "B", A1>70, "C", A1>60, "D", TRUE, "F"';
    }
    
    formula += ')';
    
    const cell: Cell = {
      id: cellId,
      row: this.getRowFromCellId(cellId),
      col: this.getColFromCellId(cellId),
      value: '', // Placeholder value
      formula: formula,
      type: 'formula'
    };

    return {
      success: true,
      message: `Applied IFS formula to cell ${cellId}`,
      cellUpdates: { [cellId]: cell }
    };
  }

  // Helper methods
  private parseRange(range: string): string[] {
    try {
      const match = range.match(/([A-Z]+)(\d+):([A-Z]+)(\d+)/);
      if (!match) return [range];

      const [, startCol, startRow, endCol, endRow] = match;
      const startColNum = this.columnToNumber(startCol);
      const endColNum = this.columnToNumber(endCol);
      
      // Safety check for large ranges
      const rowCount = parseInt(endRow) - parseInt(startRow) + 1;
      const colCount = endColNum - startColNum + 1;
      
      if (rowCount * colCount > 10000) {
        console.warn(`Large range detected: ${rowCount} rows x ${colCount} columns. This may impact performance.`);
      }
      
      const cells: string[] = [];
      
      // Limit to reasonable size to prevent stack overflow
      const maxRows = Math.min(rowCount, 1000);
      const maxCols = Math.min(colCount, 100);
      
      for (let row = parseInt(startRow); row < parseInt(startRow) + maxRows; row++) {
        for (let col = startColNum; col < startColNum + maxCols; col++) {
          cells.push(this.numberToColumn(col) + row);
        }
      }
      
      return cells;
    } catch (error) {
      console.error('Error parsing range:', error);
      return [range];
    }
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
    return result || 'A'; // Fallback to 'A' if calculation fails
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
          return this.excelFunctions.sum(rangeMatch[1]);
        }
      }
      
      if (cleanFormula.includes('AVERAGE(')) {
        const rangeMatch = cleanFormula.match(/AVERAGE\(([A-Z]+\d+:[A-Z]+\d+)\)/);
        if (rangeMatch) {
          return this.excelFunctions.average(rangeMatch[1]);
        }
      }

      if (cleanFormula.includes('COUNT(')) {
        const rangeMatch = cleanFormula.match(/COUNT\(([A-Z]+\d+:[A-Z]+\d+)\)/);
        if (rangeMatch) {
          return this.excelFunctions.count(rangeMatch[1]);
        }
      }

      if (cleanFormula.includes('MAX(')) {
        const rangeMatch = cleanFormula.match(/MAX\(([A-Z]+\d+:[A-Z]+\d+)\)/);
        if (rangeMatch) {
          return this.excelFunctions.max(rangeMatch[1]);
        }
      }

      if (cleanFormula.includes('MIN(')) {
        const rangeMatch = cleanFormula.match(/MIN\(([A-Z]+\d+:[A-Z]+\d+)\)/);
        if (rangeMatch) {
          return this.excelFunctions.min(rangeMatch[1]);
        }
      }

      if (cleanFormula.includes('TODAY()')) {
        return new Date().toLocaleDateString();
      }

      if (cleanFormula.includes('NOW()')) {
        return new Date().toLocaleString();
      }

      // Basic arithmetic evaluation with safety
      try {
        // Create a safe evaluation function with timeout
        const evalWithTimeout = (code: string, timeout: number = 1000) => {
          return new Promise((resolve, reject) => {
            const worker = new Worker(
              URL.createObjectURL(new Blob([
                `onmessage = function(e) {
                  try {
                    const result = eval(e.data);
                    postMessage({ result });
                  } catch (error) {
                    postMessage({ error: error.message });
                  }
                }`
              ], { type: 'application/javascript' }))
            );
            
            const timeoutId = setTimeout(() => {
              worker.terminate();
              reject(new Error('Evaluation timed out'));
            }, timeout);
            
            worker.onmessage = (e) => {
              clearTimeout(timeoutId);
              worker.terminate();
              if (e.data.error) {
                reject(new Error(e.data.error));
              } else {
                resolve(e.data.result);
              }
            };
            
            worker.onerror = (error) => {
              clearTimeout(timeoutId);
              worker.terminate();
              reject(error);
            };
            
            worker.postMessage(code);
          });
        };
        
        // Try to evaluate with worker first
        try {
          return evalWithTimeout(`(${cleanFormula})`);
        } catch {
          // Fallback to direct evaluation with simple expressions
          if (/^[\d\s\+\-\*\/\(\)\.]+$/.test(cleanFormula)) {
            return new Function('return ' + cleanFormula)();
          } else {
            throw new Error('Formula contains unsupported operations');
          }
        }
      } catch (evalError) {
        console.warn('Formula evaluation error:', evalError);
        return '#ERROR!';
      }
    } catch (error) {
      console.warn('Formula processing error:', error);
      return '#ERROR!';
    }
  }
}