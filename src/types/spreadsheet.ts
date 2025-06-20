export interface Cell {
  id: string;
  row: number;
  col: number;
  value: any;
  formula?: string;
  type: 'text' | 'number' | 'formula' | 'date';
  format?: CellFormat;
  dependencies?: string[];
}

export interface CellFormat {
  backgroundColor?: string;
  textColor?: string;
  fontWeight?: 'normal' | 'bold';
  fontSize?: number;
  border?: string;
  alignment?: 'left' | 'center' | 'right';
}

export interface SpreadsheetData {
  cells: { [key: string]: Cell };
  selectedCell?: string;
  selectedRange?: string[];
}

export interface PivotConfig {
  rows: string[];
  columns: string[];
  values: string[];
  aggregation: 'sum' | 'count' | 'average' | 'min' | 'max';
}

export interface ConditionalFormat {
  range: string;
  condition: string;
  format: CellFormat;
}