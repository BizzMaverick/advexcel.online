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

      // VLOOKUP commands
      if (lowerCommand.includes('vlookup')) {
        return this.handleVlookupCommand(command);
      }

      // Pivot table commands
      if (lowerCommand.includes('pivot')) {
        return this.handlePivotCommand(command);
      }

      // Conditional formatting commands
      if (lowerCommand.includes('conditional format')) {
        return this.handleConditionalFormatCommand(command);
      }

      // Mathematical operations
      if (lowerCommand.includes('sum') || lowerCommand.includes('average') || 
          lowerCommand.includes('count') || lowerCommand.includes('min') || 
          lowerCommand.includes('max')) {
        return this.handleMathCommand(command);
      }

      // IF statements
      if (lowerCommand.includes('if formula') || lowerCommand.includes('if statement')) {
        return this.handleIfCommand(command);
      }

      // Data filtering
      if (lowerCommand.includes('filter')) {
        return this.handleFilterCommand(command);
      }

      // Advanced Excel functions
      if (lowerCommand.includes('nested if') || lowerCommand.includes('complex formula')) {
        return this.handleAdvancedFormulaCommand(command);
      }

      return {
        success: false,
        message: 'Command not recognized. Try commands like "analyze data", "create chart", "find outliers", "calculate correlation", "create pivot table", or traditional Excel operations.'
      };

    } catch (error) {
      return {
        success: false,
        message: `Error processing command: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
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

  private handleAdvancedFormulaCommand(command: string): { success: boolean; message: string; data?: any } {
    const templates = {
      'nested_if': '=IF(A1>100,"High",IF(A1>50,"Medium",IF(A1>10,"Low","Very Low")))',
      'vlookup_if': '=IF(ISERROR(VLOOKUP(A1,B:D,2,FALSE)),"Not Found",VLOOKUP(A1,B:D,2,FALSE))',
      'complex_sum': '=SUMIFS(C:C,A:A,"Sales",B:B,">100")',
      'array_formula': '=SUM(IF(A1:A10>AVERAGE(A1:A10),A1:A10,0))'
    };

    return {
      success: true,
      message: 'Advanced formula templates available for complex calculations.',
      data: { type: 'advanced_formula', templates }
    };
  }

  private handleVlookupCommand(command: string): { success: boolean; message: string; data?: any } {
    const match = command.match(/vlookup.*?(\w+\d+:\w+\d+).*?column\s+(\w+)/i);
    if (match) {
      const [, tableRange, targetColumn] = match;
      return {
        success: true,
        message: `VLOOKUP applied to ${targetColumn} using table range ${tableRange}`,
        data: { type: 'vlookup', tableRange, targetColumn }
      };
    }
    return { success: false, message: 'Invalid VLOOKUP syntax. Use: "VLOOKUP in column C using table A1:B10"' };
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
    return { success: false, message: 'Use format: "Apply conditional formatting to B1:B20 where value > 100"' };
  }

  private handleMathCommand(command: string): { success: boolean; message: string; data?: any } {
    const rangeMatch = command.match(/(\w+\d+:\w+\d+)/);
    const operation = command.match(/(sum|average|count|min|max)/i)?.[1].toLowerCase();
    
    if (rangeMatch && operation) {
      const range = rangeMatch[1];
      let result;
      
      switch (operation) {
        case 'sum':
          result = this.excelFunctions.sum(range);
          break;
        case 'average':
          result = this.excelFunctions.average(range);
          break;
        case 'count':
          result = this.excelFunctions.count(range);
          break;
        case 'min':
          result = this.excelFunctions.min(range);
          break;
        case 'max':
          result = this.excelFunctions.max(range);
          break;
        default:
          result = 0;
      }
      
      return {
        success: true,
        message: `${operation.toUpperCase()} of ${range} = ${result}`,
        data: { type: 'calculation', operation, range, result }
      };
    }
    return { success: false, message: 'Specify range for calculation. Use: "Calculate SUM of range E1:E20"' };
  }

  private handleIfCommand(command: string): { success: boolean; message: string; data?: any } {
    return {
      success: true,
      message: 'IF formula template: =IF(condition, true_value, false_value)',
      data: { type: 'if_formula', template: '=IF(A1>10,"High","Low")' }
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
    return { success: false, message: 'Specify filter criteria. Use: "Filter data where column A contains Sales"' };
  }
}