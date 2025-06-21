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

      // Statistical analysis commands
      if (lowerCommand.includes('correlation') || lowerCommand.includes('regression') || lowerCommand.includes('trend')) {
        return this.handleStatisticalCommand(command);
      }

      // Chart generation commands
      if (lowerCommand.includes('chart') || lowerCommand.includes('graph') || lowerCommand.includes('plot')) {
        return this.handleChartCommand(command);
      }

      // Outlier detection
      if (lowerCommand.includes('outlier') || lowerCommand.includes('anomaly')) {
        return this.handleOutlierCommand(command);
      }

      // Data quality assessment
      if (lowerCommand.includes('quality') || lowerCommand.includes('missing') || lowerCommand.includes('completeness')) {
        return this.handleDataQualityCommand(command);
      }

      // Forecasting
      if (lowerCommand.includes('forecast') || lowerCommand.includes('predict') || lowerCommand.includes('projection')) {
        return this.handleForecastCommand(command);
      }

      // Distribution analysis
      if (lowerCommand.includes('distribution') || lowerCommand.includes('histogram') || lowerCommand.includes('statistics')) {
        return this.handleDistributionCommand(command);
      }

      // Pivot table commands
      if (lowerCommand.includes('pivot')) {
        return this.handlePivotCommand(command);
      }

      // Conditional formatting commands
      if (lowerCommand.includes('conditional format')) {
        return this.handleConditionalFormatCommand(command);
      }

      // Data filtering
      if (lowerCommand.includes('filter')) {
        return this.handleFilterCommand(command);
      }

      return {
        success: false,
        message: 'Command not recognized. Try commands like "perform vlookup", "calculate sum", "apply if formula", "analyze data", "create chart", "find outliers", or "create pivot table".'
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

    // Text functions
    if (lowerCommand.includes('concatenate')) {
      return this.handleConcatenateCommand(command);
    }

    if (lowerCommand.includes('upper')) {
      return this.handleUpperCommand(command);
    }

    if (lowerCommand.includes('lower')) {
      return this.handleLowerCommand(command);
    }

    if (lowerCommand.includes('trim')) {
      return this.handleTrimCommand(command);
    }

    // Date functions
    if (lowerCommand.includes('today')) {
      return this.handleTodayCommand(command);
    }

    if (lowerCommand.includes('date')) {
      return this.handleDateCommand(command);
    }

    // Rounding functions
    if (lowerCommand.includes('round')) {
      return this.handleRoundCommand(command);
    }

    // Conditional functions
    if (lowerCommand.includes('sumif')) {
      return this.handleSumIfCommand(command);
    }

    if (lowerCommand.includes('countif')) {
      return this.handleCountIfCommand(command);
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

  private handleConcatenateCommand(command: string): { success: boolean; message: string; data?: any } {
    return {
      success: true,
      message: 'CONCATENATE formula template: =CONCATENATE(text1, text2, ...). Example: =CONCATENATE(A1, " ", B1) or use & operator: =A1&" "&B1',
      data: { 
        type: 'text_formula', 
        formula: '=CONCATENATE(A1, " ", B1)',
        alternative: '=A1&" "&B1'
      }
    };
  }

  private handleUpperCommand(command: string): { success: boolean; message: string; data?: any } {
    return {
      success: true,
      message: 'UPPER formula template: =UPPER(text). Example: =UPPER(A1) converts text to uppercase',
      data: { type: 'text_formula', formula: '=UPPER(A1)' }
    };
  }

  private handleLowerCommand(command: string): { success: boolean; message: string; data?: any } {
    return {
      success: true,
      message: 'LOWER formula template: =LOWER(text). Example: =LOWER(A1) converts text to lowercase',
      data: { type: 'text_formula', formula: '=LOWER(A1)' }
    };
  }

  private handleTrimCommand(command: string): { success: boolean; message: string; data?: any } {
    return {
      success: true,
      message: 'TRIM formula template: =TRIM(text). Example: =TRIM(A1) removes extra spaces from text',
      data: { type: 'text_formula', formula: '=TRIM(A1)' }
    };
  }

  private handleTodayCommand(command: string): { success: boolean; message: string; data?: any } {
    return {
      success: true,
      message: 'TODAY formula: =TODAY() returns the current date. Example: =TODAY()',
      data: { type: 'date_formula', formula: '=TODAY()', result: new Date().toLocaleDateString() }
    };
  }

  private handleDateCommand(command: string): { success: boolean; message: string; data?: any } {
    return {
      success: true,
      message: 'DATE formula template: =DATE(year, month, day). Example: =DATE(2024, 12, 25) or =DATE(A1, B1, C1)',
      data: { type: 'date_formula', formula: '=DATE(2024, 12, 25)' }
    };
  }

  private handleRoundCommand(command: string): { success: boolean; message: string; data?: any } {
    const digitsMatch = command.match(/(\d+)\s*decimal/i);
    const digits = digitsMatch ? digitsMatch[1] : '2';
    
    return {
      success: true,
      message: `ROUND formula template: =ROUND(number, ${digits}). Example: =ROUND(A1, ${digits}) rounds to ${digits} decimal places`,
      data: { type: 'math_formula', formula: `=ROUND(A1, ${digits})` }
    };
  }

  private handleSumIfCommand(command: string): { success: boolean; message: string; data?: any } {
    const criteriaMatch = command.match(/where\s+(.+)/i);
    const criteria = criteriaMatch ? criteriaMatch[1] : 'criteria';
    
    return {
      success: true,
      message: `SUMIF formula template: =SUMIF(range, "${criteria}", sum_range). Example: =SUMIF(A:A, ">100", B:B)`,
      data: { 
        type: 'conditional_formula', 
        formula: `=SUMIF(A:A, "${criteria}", B:B)`,
        criteria
      }
    };
  }

  private handleCountIfCommand(command: string): { success: boolean; message: string; data?: any } {
    const criteriaMatch = command.match(/where\s+(.+)/i);
    const criteria = criteriaMatch ? criteriaMatch[1] : 'criteria';
    
    return {
      success: true,
      message: `COUNTIF formula template: =COUNTIF(range, "${criteria}"). Example: =COUNTIF(A:A, ">100")`,
      data: { 
        type: 'conditional_formula', 
        formula: `=COUNTIF(A:A, "${criteria}")`,
        criteria
      }
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

  private handleStatisticalCommand(command: string): { success: boolean; message: string; data?: any } {
    try {
      const analytics = this.analyticsEngine.generateAnalytics();
      const correlations = analytics.correlations;
      const trends = analytics.trends;

      let message = '';
      if (correlations.columns.length > 1) {
        const strongCorrelations = correlations.matrix.flatMap((row, i) => 
          row.map((corr, j) => ({ 
            col1: correlations.columns[i], 
            col2: correlations.columns[j], 
            correlation: corr 
          }))
        ).filter(item => Math.abs(item.correlation) > 0.7 && item.col1 !== item.col2);

        message += `Found ${strongCorrelations.length} strong correlations. `;
      }

      if (trends.length > 0) {
        const increasingTrends = trends.filter(t => t.trend === 'increasing').length;
        const decreasingTrends = trends.filter(t => t.trend === 'decreasing').length;
        message += `Trend analysis: ${increasingTrends} increasing, ${decreasingTrends} decreasing trends detected.`;
      }

      return {
        success: true,
        message: message || 'Statistical analysis completed.',
        data: { type: 'statistical', correlations, trends }
      };
    } catch (error) {
      return {
        success: false,
        message: 'Unable to perform statistical analysis.'
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

  private handleOutlierCommand(command: string): { success: boolean; message: string; data?: any } {
    try {
      const analytics = this.analyticsEngine.generateAnalytics();
      const outliers = analytics.outliers;

      const totalOutliers = outliers.reduce((sum, col) => sum + col.outliers.length, 0);

      return {
        success: true,
        message: `Outlier detection complete: Found ${totalOutliers} outliers across ${outliers.length} columns.`,
        data: { type: 'outliers', outliers }
      };
    } catch (error) {
      return {
        success: false,
        message: 'Unable to detect outliers.'
      };
    }
  }

  private handleDataQualityCommand(command: string): { success: boolean; message: string; data?: any } {
    try {
      const analytics = this.analyticsEngine.generateAnalytics();
      const summary = analytics.summary;

      const totalMissing = Object.values(summary.missingValues).reduce((sum, missing) => sum + missing, 0);
      const completenessRate = ((summary.totalRows * summary.totalColumns - totalMissing) / (summary.totalRows * summary.totalColumns)) * 100;

      return {
        success: true,
        message: `Data quality assessment: ${completenessRate.toFixed(1)}% complete, ${totalMissing} missing values detected.`,
        data: { type: 'quality', summary, completenessRate }
      };
    } catch (error) {
      return {
        success: false,
        message: 'Unable to assess data quality.'
      };
    }
  }

  private handleForecastCommand(command: string): { success: boolean; message: string; data?: any } {
    try {
      const analytics = this.analyticsEngine.generateAnalytics();
      const trends = analytics.trends;

      const forecasts = trends.map(trend => ({
        column: trend.column,
        forecast: trend.forecast,
        confidence: trend.rSquared
      }));

      return {
        success: true,
        message: `Forecast generated for ${forecasts.length} columns using trend analysis.`,
        data: { type: 'forecast', forecasts }
      };
    } catch (error) {
      return {
        success: false,
        message: 'Unable to generate forecast.'
      };
    }
  }

  private handleDistributionCommand(command: string): { success: boolean; message: string; data?: any } {
    try {
      const analytics = this.analyticsEngine.generateAnalytics();
      const distributions = analytics.distributions;

      return {
        success: true,
        message: `Distribution analysis complete for ${distributions.length} numeric columns.`,
        data: { type: 'distribution', distributions }
      };
    } catch (error) {
      return {
        success: false,
        message: 'Unable to analyze distributions.'
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

  private handleConditionalFormatCommand(command: string): { success: boolean; message: string; data?: any } {
    const rangeMatch = command.match(/(\w+\d+:\w+\d+)/);
    const conditionMatch = command.match(/where\s+(.+?)(?:\s+format|$)/i);
    
    if (rangeMatch && conditionMatch) {
      const range = rangeMatch[1];
      const condition = conditionMatch[1];
      return {
        success: true,
        message: `Conditional formatting applied to ${range} where ${condition}`,
        data: { type: 'conditional_format', range, condition }
      };
    }
    return { 
      success: true, 
      message: 'Conditional formatting template: Apply to range where condition is met. Example: "apply conditional formatting to B1:B20 where value > 100"',
      data: { type: 'conditional_format', template: 'range where condition' }
    };
  }

  private handleFilterCommand(command: string): { success: boolean; message: string; data?: any } {
    const criteriaMatch = command.match(/where\s+(.+)/i);
    if (criteriaMatch) {
      const criteria = criteriaMatch[1];
      return {
        success: true,
        message: `Filter applied with criteria: ${criteria}`,
        data: { type: 'filter', criteria }
      };
    }
    return { 
      success: true, 
      message: 'Filter template: Specify filter criteria. Example: "filter data where column A contains Sales"',
      data: { type: 'filter', template: 'where condition' }
    };
  }
}