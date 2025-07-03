export interface DataAnalytics {
  summary: DataSummary;
  correlations: CorrelationMatrix;
  trends: TrendAnalysis[];
  outliers: OutlierData[];
  distributions: DistributionData[];
}

export interface DataSummary {
  totalRows: number;
  totalColumns: number;
  numericColumns: string[];
  textColumns: string[];
  dateColumns: string[];
  missingValues: { [column: string]: number };
  uniqueValues: { [column: string]: number };
}

export interface CorrelationMatrix {
  columns: string[];
  matrix: number[][];
}

export interface TrendAnalysis {
  column: string;
  trend: 'increasing' | 'decreasing' | 'stable' | 'volatile';
  slope: number;
  rSquared: number;
  forecast: number[];
}

export interface OutlierData {
  column: string;
  outliers: Array<{
    row: number;
    value: number;
    zScore: number;
  }>;
}

export interface DistributionData {
  column: string;
  mean: number;
  median: number;
  mode: number;
  standardDeviation: number;
  variance: number;
  skewness: number;
  kurtosis: number;
  quartiles: [number, number, number];
  histogram: Array<{ bin: string; count: number }>;
}

export interface ChartConfig {
  type: 'line' | 'bar' | 'pie' | 'scatter' | 'histogram' | 'heatmap';
  title: string;
  xAxis: string;
  yAxis: string;
  data: any[];
  colors?: string[];
}