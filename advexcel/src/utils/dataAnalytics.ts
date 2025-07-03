import { Cell } from '../types/spreadsheet';
import { DataAnalytics, DataSummary, CorrelationMatrix, TrendAnalysis, OutlierData, DistributionData, ChartConfig } from '../types/analytics';

export class DataAnalyticsEngine {
  private cells: { [key: string]: Cell };
  private data: any[][] = [];
  private headers: string[] = [];

  constructor(cells: { [key: string]: Cell }) {
    this.cells = cells;
    this.processData();
  }

  private processData() {
    // Convert cells to structured data array
    const cellEntries = Object.entries(this.cells);
    if (cellEntries.length === 0) return;

    // Find data boundaries
    const rows = new Set<number>();
    const cols = new Set<number>();
    
    cellEntries.forEach(([_, cell]) => {
      rows.add(cell.row);
      cols.add(cell.col);
    });

    const maxRow = Math.max(...rows);
    const maxCol = Math.max(...cols);

    // Initialize data array
    this.data = Array(maxRow).fill(null).map(() => Array(maxCol).fill(null));

    // Fill data array
    cellEntries.forEach(([_, cell]) => {
      const value = cell.formula ? this.evaluateFormula(cell.formula) : cell.value;
      this.data[cell.row - 1][cell.col - 1] = value;
    });

    // Extract headers (first row)
    this.headers = this.data[0]?.map((val, idx) => val || `Column ${idx + 1}`) || [];
  }

  generateAnalytics(): DataAnalytics {
    return {
      summary: this.generateSummary(),
      correlations: this.calculateCorrelations(),
      trends: this.analyzeTrends(),
      outliers: this.detectOutliers(),
      distributions: this.analyzeDistributions()
    };
  }

  private generateSummary(): DataSummary {
    const numericColumns: string[] = [];
    const textColumns: string[] = [];
    const dateColumns: string[] = [];
    const missingValues: { [column: string]: number } = {};
    const uniqueValues: { [column: string]: number } = {};

    this.headers.forEach((header, colIndex) => {
      const columnData = this.data.slice(1).map(row => row[colIndex]).filter(val => val !== null && val !== undefined);
      
      // Determine column type
      const numericCount = columnData.filter(val => typeof val === 'number' || !isNaN(Number(val))).length;
      const dateCount = columnData.filter(val => this.isDate(val)).length;
      
      if (numericCount > columnData.length * 0.7) {
        numericColumns.push(header);
      } else if (dateCount > columnData.length * 0.7) {
        dateColumns.push(header);
      } else {
        textColumns.push(header);
      }

      // Count missing values
      missingValues[header] = this.data.length - 1 - columnData.length;

      // Count unique values
      uniqueValues[header] = new Set(columnData).size;
    });

    return {
      totalRows: this.data.length - 1, // Exclude header
      totalColumns: this.headers.length,
      numericColumns,
      textColumns,
      dateColumns,
      missingValues,
      uniqueValues
    };
  }

  private calculateCorrelations(): CorrelationMatrix {
    const summary = this.generateSummary();
    const numericColumns = summary.numericColumns;
    const matrix: number[][] = [];

    numericColumns.forEach((col1, i) => {
      const row: number[] = [];
      numericColumns.forEach((col2, j) => {
        const col1Index = this.headers.indexOf(col1);
        const col2Index = this.headers.indexOf(col2);
        
        const data1 = this.data.slice(1).map(row => Number(row[col1Index])).filter(val => !isNaN(val));
        const data2 = this.data.slice(1).map(row => Number(row[col2Index])).filter(val => !isNaN(val));
        
        row.push(this.calculatePearsonCorrelation(data1, data2));
      });
      matrix.push(row);
    });

    return {
      columns: numericColumns,
      matrix
    };
  }

  private analyzeTrends(): TrendAnalysis[] {
    const summary = this.generateSummary();
    const trends: TrendAnalysis[] = [];

    summary.numericColumns.forEach(column => {
      const colIndex = this.headers.indexOf(column);
      const values = this.data.slice(1)
        .map(row => Number(row[colIndex]))
        .filter(val => !isNaN(val));

      if (values.length < 3) return;

      const { slope, rSquared } = this.calculateLinearRegression(values);
      const trend = this.determineTrend(slope, rSquared);
      const forecast = this.generateForecast(values, 5);

      trends.push({
        column,
        trend,
        slope,
        rSquared,
        forecast
      });
    });

    return trends;
  }

  private detectOutliers(): OutlierData[] {
    const summary = this.generateSummary();
    const outliers: OutlierData[] = [];

    summary.numericColumns.forEach(column => {
      const colIndex = this.headers.indexOf(column);
      const values = this.data.slice(1)
        .map((row, index) => ({ value: Number(row[colIndex]), row: index + 2 }))
        .filter(item => !isNaN(item.value));

      const mean = values.reduce((sum, item) => sum + item.value, 0) / values.length;
      const stdDev = Math.sqrt(values.reduce((sum, item) => sum + Math.pow(item.value - mean, 2), 0) / values.length);

      const columnOutliers = values
        .map(item => ({
          ...item,
          zScore: Math.abs((item.value - mean) / stdDev)
        }))
        .filter(item => item.zScore > 2) // Z-score threshold for outliers
        .sort((a, b) => b.zScore - a.zScore);

      if (columnOutliers.length > 0) {
        outliers.push({
          column,
          outliers: columnOutliers
        });
      }
    });

    return outliers;
  }

  private analyzeDistributions(): DistributionData[] {
    const summary = this.generateSummary();
    const distributions: DistributionData[] = [];

    summary.numericColumns.forEach(column => {
      const colIndex = this.headers.indexOf(column);
      const values = this.data.slice(1)
        .map(row => Number(row[colIndex]))
        .filter(val => !isNaN(val))
        .sort((a, b) => a - b);

      if (values.length === 0) return;

      const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
      const median = this.calculateMedian(values);
      const mode = this.calculateMode(values);
      const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
      const standardDeviation = Math.sqrt(variance);
      const skewness = this.calculateSkewness(values, mean, standardDeviation);
      const kurtosis = this.calculateKurtosis(values, mean, standardDeviation);
      const quartiles = this.calculateQuartiles(values);
      const histogram = this.generateHistogram(values);

      distributions.push({
        column,
        mean,
        median,
        mode,
        standardDeviation,
        variance,
        skewness,
        kurtosis,
        quartiles,
        histogram
      });
    });

    return distributions;
  }

  generateChart(config: Partial<ChartConfig>): ChartConfig {
    const { type = 'bar', xAxis, yAxis, title } = config;
    
    if (!xAxis || !yAxis) {
      throw new Error('X-axis and Y-axis must be specified');
    }

    const xIndex = this.headers.indexOf(xAxis);
    const yIndex = this.headers.indexOf(yAxis);

    if (xIndex === -1 || yIndex === -1) {
      throw new Error('Specified columns not found');
    }

    const data = this.data.slice(1).map(row => ({
      [xAxis]: row[xIndex],
      [yAxis]: row[yIndex]
    })).filter(item => item[xAxis] !== null && item[yAxis] !== null);

    return {
      type,
      title: title || `${yAxis} vs ${xAxis}`,
      xAxis,
      yAxis,
      data,
      colors: ['#2563EB', '#059669', '#EA580C', '#7C3AED', '#DC2626']
    };
  }

  // Helper methods
  private evaluateFormula(formula: string): any {
    // Basic formula evaluation
    try {
      const cleanFormula = formula.startsWith('=') ? formula.slice(1) : formula;
      return new Function('return ' + cleanFormula)();
    } catch {
      return formula;
    }
  }

  private isDate(value: any): boolean {
    return value instanceof Date || (!isNaN(Date.parse(value)) && isNaN(Number(value)));
  }

  private calculatePearsonCorrelation(x: number[], y: number[]): number {
    const n = Math.min(x.length, y.length);
    if (n === 0) return 0;

    const sumX = x.slice(0, n).reduce((a, b) => a + b, 0);
    const sumY = y.slice(0, n).reduce((a, b) => a + b, 0);
    const sumXY = x.slice(0, n).reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.slice(0, n).reduce((sum, xi) => sum + xi * xi, 0);
    const sumY2 = y.slice(0, n).reduce((sum, yi) => sum + yi * yi, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    return denominator === 0 ? 0 : numerator / denominator;
  }

  private calculateLinearRegression(values: number[]): { slope: number; rSquared: number } {
    const n = values.length;
    const x = values.map((_, i) => i);
    const y = values;

    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Calculate R-squared
    const yMean = sumY / n;
    const ssRes = y.reduce((sum, yi, i) => sum + Math.pow(yi - (slope * x[i] + intercept), 2), 0);
    const ssTot = y.reduce((sum, yi) => sum + Math.pow(yi - yMean, 2), 0);
    const rSquared = 1 - (ssRes / ssTot);

    return { slope, rSquared };
  }

  private determineTrend(slope: number, rSquared: number): 'increasing' | 'decreasing' | 'stable' | 'volatile' {
    if (rSquared < 0.3) return 'volatile';
    if (Math.abs(slope) < 0.1) return 'stable';
    return slope > 0 ? 'increasing' : 'decreasing';
  }

  private generateForecast(values: number[], periods: number): number[] {
    const { slope } = this.calculateLinearRegression(values);
    const lastValue = values[values.length - 1];
    const forecast: number[] = [];

    for (let i = 1; i <= periods; i++) {
      forecast.push(lastValue + slope * i);
    }

    return forecast;
  }

  private calculateMedian(values: number[]): number {
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
  }

  private calculateMode(values: number[]): number {
    const frequency: { [key: number]: number } = {};
    values.forEach(val => frequency[val] = (frequency[val] || 0) + 1);
    
    let maxFreq = 0;
    let mode = values[0];
    
    Object.entries(frequency).forEach(([val, freq]) => {
      if (freq > maxFreq) {
        maxFreq = freq;
        mode = Number(val);
      }
    });

    return mode;
  }

  private calculateSkewness(values: number[], mean: number, stdDev: number): number {
    const n = values.length;
    const sum = values.reduce((acc, val) => acc + Math.pow((val - mean) / stdDev, 3), 0);
    return (n / ((n - 1) * (n - 2))) * sum;
  }

  private calculateKurtosis(values: number[], mean: number, stdDev: number): number {
    const n = values.length;
    const sum = values.reduce((acc, val) => acc + Math.pow((val - mean) / stdDev, 4), 0);
    return ((n * (n + 1)) / ((n - 1) * (n - 2) * (n - 3))) * sum - (3 * Math.pow(n - 1, 2)) / ((n - 2) * (n - 3));
  }

  private calculateQuartiles(values: number[]): [number, number, number] {
    const sorted = [...values].sort((a, b) => a - b);
    const q1Index = Math.floor(sorted.length * 0.25);
    const q2Index = Math.floor(sorted.length * 0.5);
    const q3Index = Math.floor(sorted.length * 0.75);
    
    return [sorted[q1Index], sorted[q2Index], sorted[q3Index]];
  }

  private generateHistogram(values: number[], bins: number = 10): Array<{ bin: string; count: number }> {
    const min = Math.min(...values);
    const max = Math.max(...values);
    const binWidth = (max - min) / bins;
    
    const histogram: Array<{ bin: string; count: number }> = [];
    
    for (let i = 0; i < bins; i++) {
      const binStart = min + i * binWidth;
      const binEnd = min + (i + 1) * binWidth;
      const count = values.filter(val => val >= binStart && (i === bins - 1 ? val <= binEnd : val < binEnd)).length;
      
      histogram.push({
        bin: `${binStart.toFixed(1)}-${binEnd.toFixed(1)}`,
        count
      });
    }
    
    return histogram;
  }
}