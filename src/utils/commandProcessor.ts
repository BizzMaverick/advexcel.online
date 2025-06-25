import { Cell, SpreadsheetData, PivotConfig } from '../types/spreadsheet';
import { ExcelFunctions } from './excelFunctions';
import { DataAnalyticsEngine } from './dataAnalytics';

export class CommandProcessor {
  private data: SpreadsheetData;
  private excelFunctions: ExcelFunctions;
  private analyticsEngine: DataAnalyticsEngine;

  constructor(data: SpreadsheetData) {
    this.data = data;
    this.excelFunctions = new ExcelFunctions(data.cells);
    this.analyticsEngine = new DataAnalyticsEngine(data.cells);
  }

  processCommand(command: string): { success: boolean; message: string; data?: any } {
    const lowerCommand = command.toLowerCase().trim();

    try {
      // Excel Functions via Natural Language
      if (this.isExcelFunctionCommand(lowerCommand)) {
        return this.handleExcelFunctionCommand(command);
      }

      // Data Analytics commands
      if (lowerCommand.includes('analyze') || lowerCommand.includes('analytics') || lowerCommand.includes('insights')) {
        return this.handleAnalyticsCommand(command);
      }

      // Chart generation commands
      if (lowerCommand.includes('chart') || lowerCommand.includes('graph') || lowerCommand.includes('plot')) {
        return this.handleChartCommand(command);
      }

      // Pivot table commands
      if (lowerCommand.includes('pivot')) {
        return this.handlePivotCommand(command);
      }

      return {
        success: false,
        message: 'Command not recognized. Try commands like "perform vlookup", "calculate sum", "apply if formula", "analyze data", "create chart", or "create pivot table".'
      };

    } catch (error) {
      return {
        success: false,
        message: `Error processing command: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private isExcelFunctionCommand(command: string): boolean {
    const excelFunctions = [
      'vlookup', 'hlookup', 'index', 'match', 'xlookup',
      'sum', 'average', 'count', 'min', 'max', 'median', 'mode',
      'sumif', 'sumifs', 'averageif', 'countif', 'countifs',
      'if', 'ifs', 'and', 'or', 'not', 'iferror', 'ifna',
      'concatenate', 'concat', 'left', 'right', 'mid', 'len', 'find', 'substitute', 'upper', 'lower', 'trim',
      'today', 'now', 'date', 'year', 'month', 'day', 'datedif',
      'pmt', 'pv', 'fv', 'npv', 'irr', 'rate',
      'round', 'roundup', 'rounddown', 'abs', 'sqrt', 'power'
    ];

    return excelFunctions.some(func => 
      command.includes(func) || 
      command.includes(`perform ${func}`) ||
      command.includes(`apply ${func}`) ||
      command.includes(`use ${func}`) ||
      command.includes(`calculate ${func}`) ||
      command.includes(`create ${func}`)
    );
  }

  private handleExcelFunctionCommand(command: string): { success: boolean; message: string; data?: any } {
    const lowerCommand = command.toLowerCase();

    // VLOOKUP
    if (lowerCommand.includes('vlookup')) {
      return this.handleVlookupCommand(command);
    }

    // Mathematical functions
    if (lowerCommand.includes('sum')) {
      return this.handleSumCommand(command);
    }

    if (lowerCommand.includes('average')) {
      return this.handleAverageCommand(command);
    }

    if (lowerCommand.includes('count')) {
      return this.handleCountCommand(command);
    }

    if (lowerCommand.includes('min') || lowerCommand.includes('minimum')) {
      return this.handleMinCommand(command);
    }

    if (lowerCommand.includes('max') || lowerCommand.includes('maximum')) {
      return this.handleMaxCommand(command);
    }

    // Logical functions
    if (lowerCommand.includes('if formula') || lowerCommand.includes('if function')) {
      return this.handleIfCommand(command);
    }

    return {
      success: false,
      message: 'Excel function not recognized. Try specific functions like "perform vlookup", "calculate sum of range A1:A10", "apply if formula", etc.'
    };
  }

  private handleVlookupCommand(command: string): { success: boolean; message: string; data?: any } {
    const match = command.match(/vlookup.*?(\w+\d+:\w+\d+).*?column\s+(\w+)/i);
    if (match) {
      const [, tableRange, targetColumn] = match;
      return {
        success: true,
        message: `VLOOKUP formula template: =VLOOKUP(lookup_value, ${tableRange}, column_index, FALSE). Apply this to column ${targetColumn}.`,
        data: { 
          type: 'vlookup', 
          formula: `=VLOOKUP(A1,${tableRange},2,FALSE)`,
          tableRange, 
          targetColumn 
        }
      };
    }
    return {
      success: true,
      message: 'VLOOKUP formula template: =VLOOKUP(lookup_value, table_array, col_index_num, FALSE). Specify the lookup value, table range, and column index.',
      data: { 
        type: 'vlookup', 
        formula: '=VLOOKUP(A1,B:D,2,FALSE)',
        example: 'Example: =VLOOKUP(A1,B1:D10,2,FALSE)'
      }
    };
  }

  private handleSumCommand(command: string): { success: boolean; message: string; data?: any } {
    const rangeMatch = command.match(/(\w+\d+:\w+\d+)/);
    if (rangeMatch) {
      const range = rangeMatch[1];
      const result = this.excelFunctions.sum(range);
      return {
        success: true,
        message: `SUM of ${range} = ${result}. Formula: =SUM(${range})`,
        data: { type: 'calculation', operation: 'sum', range, result, formula: `=SUM(${range})` }
      };
    }
    return {
      success: true,
      message: 'SUM formula template: =SUM(range). Example: =SUM(A1:A10) or specify a range like "calculate sum of range A1:A10"',
      data: { type: 'formula_template', formula: '=SUM(A1:A10)' }
    };
  }

  private handleAverageCommand(command: string): { success: boolean; message: string; data?: any } {
    const rangeMatch = command.match(/(\w+\d+:\w+\d+)/);
    if (rangeMatch) {
      const range = rangeMatch[1];
      const result = this.excelFunctions.average(range);
      return {
        success: true,
        message: `AVERAGE of ${range} = ${result.toFixed(2)}. Formula: =AVERAGE(${range})`,
        data: { type: 'calculation', operation: 'average', range, result, formula: `=AVERAGE(${range})` }
      };
    }
    return {
      success: true,
      message: 'AVERAGE formula template: =AVERAGE(range). Example: =AVERAGE(A1:A10) or specify a range like "calculate average of range A1:A10"',
      data: { type: 'formula_template', formula: '=AVERAGE(A1:A10)' }
    };
  }

  private handleCountCommand(command: string): { success: boolean; message: string; data?: any } {
    const rangeMatch = command.match(/(\w+\d+:\w+\d+)/);
    if (rangeMatch) {
      const range = rangeMatch[1];
      const result = this.excelFunctions.count(range);
      return {
        success: true,
        message: `COUNT of ${range} = ${result}. Formula: =COUNT(${range})`,
        data: { type: 'calculation', operation: 'count', range, result, formula: `=COUNT(${range})` }
      };
    }
    return {
      success: true,
      message: 'COUNT formula template: =COUNT(range). Example: =COUNT(A1:A10) or specify a range like "count cells in range A1:A10"',
      data: { type: 'formula_template', formula: '=COUNT(A1:A10)' }
    };
  }

  private handleMinCommand(command: string): { success: boolean; message: string; data?: any } {
    const rangeMatch = command.match(/(\w+\d+:\w+\d+)/);
    if (rangeMatch) {
      const range = rangeMatch[1];
      const result = this.excelFunctions.min(range);
      return {
        success: true,
        message: `MIN of ${range} = ${result}. Formula: =MIN(${range})`,
        data: { type: 'calculation', operation: 'min', range, result, formula: `=MIN(${range})` }
      };
    }
    return {
      success: true,
      message: 'MIN formula template: =MIN(range). Example: =MIN(A1:A10) or specify a range like "find minimum in range A1:A10"',
      data: { type: 'formula_template', formula: '=MIN(A1:A10)' }
    };
  }

  private handleMaxCommand(command: string): { success: boolean; message: string; data?: any } {
    const rangeMatch = command.match(/(\w+\d+:\w+\d+)/);
    if (rangeMatch) {
      const range = rangeMatch[1];
      const result = this.excelFunctions.max(range);
      return {
        success: true,
        message: `MAX of ${range} = ${result}. Formula: =MAX(${range})`,
        data: { type: 'calculation', operation: 'max', range, result, formula: `=MAX(${range})` }
      };
    }
    return {
      success: true,
      message: 'MAX formula template: =MAX(range). Example: =MAX(A1:A10) or specify a range like "find maximum in range A1:A10"',
      data: { type: 'formula_template', formula: '=MAX(A1:A10)' }
    };
  }

  private handleIfCommand(command: string): { success: boolean; message: string; data?: any } {
    const conditionMatch = command.match(/where\s+(.+?)(?:\s+then|$)/i);
    if (conditionMatch) {
      const condition = conditionMatch[1];
      return {
        success: true,
        message: `IF formula template: =IF(${condition}, true_value, false_value). Example: =IF(A1>100, "High", "Low")`,
        data: { 
          type: 'if_formula', 
          condition,
          formula: `=IF(${condition}, "True", "False")`,
          template: '=IF(condition, value_if_true, value_if_false)'
        }
      };
    }
    return {
      success: true,
      message: 'IF formula template: =IF(condition, value_if_true, value_if_false). Example: =IF(A1>10, "High", "Low")',
      data: { type: 'if_formula', template: '=IF(A1>10, "High", "Low")' }
    };
  }

  private handleAnalyticsCommand(command: string): { success: boolean; message: string; data?: any } {
    try {
      const analytics = this.analyticsEngine.generateAnalytics();
      return {
        success: true,
        message: `Data analysis complete: ${analytics.summary.totalRows} rows, ${analytics.summary.totalColumns} columns analyzed. Found ${analytics.outliers.length} columns with outliers and ${analytics.trends.length} trend patterns.`,
        data: { type: 'analytics', analytics }
      };
    } catch (error) {
      return {
        success: false,
        message: 'Unable to perform data analysis. Please ensure your data contains numeric values.'
      };
    }
  }

  private handleChartCommand(command: string): { success: boolean; message: string; data?: any } {
    try {
      const analytics = this.analyticsEngine.generateAnalytics();
      const numericColumns = analytics.summary.numericColumns;

      if (numericColumns.length < 2) {
        return {
          success: false,
          message: 'Need at least 2 numeric columns to create a chart.'
        };
      }

      const chartType = command.includes('line') ? 'line' : 
                       command.includes('scatter') ? 'scatter' : 'bar';

      const chart = this.analyticsEngine.generateChart({
        type: chartType,
        xAxis: numericColumns[0],
        yAxis: numericColumns[1]
      });

      return {
        success: true,
        message: `${chartType.charAt(0).toUpperCase() + chartType.slice(1)} chart created with ${chart.data.length} data points.`,
        data: { type: 'chart', chart }
      };
    } catch (error) {
      return {
        success: false,
        message: 'Unable to create chart. Please specify valid column names.'
      };
    }
  }

  private handlePivotCommand(command: string): { success: boolean; message: string; data?: any } {
    const rangeMatch = command.match(/(\w+\d+:\w+\d+)/);
    if (rangeMatch) {
      const range = rangeMatch[1];
      return {
        success: true,
        message: `Pivot table builder opened for range ${range}. Use the Pivot Table panel to configure your analysis.`,
        data: { type: 'pivot', range, showPivotPanel: true }
      };
    }
    return {
      success: true,
      message: 'Pivot table builder opened. Use the Pivot Table panel to configure your analysis.',
      data: { type: 'pivot', showPivotPanel: true }
    };
  }
}