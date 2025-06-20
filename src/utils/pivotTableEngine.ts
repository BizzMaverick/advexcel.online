import { Cell } from '../types/spreadsheet';

export interface PivotConfig {
  rows: string[];
  columns: string[];
  values: string[];
  aggregation: 'sum' | 'count' | 'average' | 'min' | 'max';
}

export interface PivotResult {
  data: any[];
  summary: {
    totalRows: number;
    uniqueGroups: number;
    aggregation: string;
  };
}

export class PivotTableEngine {
  private cells: { [key: string]: Cell };
  private data: any[][] = [];
  private headers: string[] = [];

  constructor(cells: { [key: string]: Cell }) {
    this.cells = cells;
    this.processData();
  }

  private processData() {
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
    this.headers = this.data[0]?.map((val, idx) => 
      val ? String(val) : `Column ${idx + 1}`
    ) || [];
  }

  getAvailableFields(): string[] {
    return this.headers.filter(header => header && header.trim() !== '');
  }

  generatePivotTable(config: PivotConfig): PivotResult {
    if (this.data.length <= 1) {
      return {
        data: [],
        summary: {
          totalRows: 0,
          uniqueGroups: 0,
          aggregation: config.aggregation
        }
      };
    }

    // Convert data to objects
    const dataObjects = this.data.slice(1).map(row => {
      const obj: any = {};
      this.headers.forEach((header, index) => {
        obj[header] = row[index];
      });
      return obj;
    }).filter(obj => Object.values(obj).some(val => val !== null && val !== undefined && val !== ''));

    // Group data based on configuration
    const grouped = this.groupData(dataObjects, config);
    
    // Generate pivot table structure
    const pivotData = this.generatePivotStructure(grouped, config);

    return {
      data: pivotData,
      summary: {
        totalRows: pivotData.length,
        uniqueGroups: Object.keys(grouped).length,
        aggregation: config.aggregation
      }
    };
  }

  private groupData(data: any[], config: PivotConfig): { [key: string]: any[] } {
    const grouped: { [key: string]: any[] } = {};

    data.forEach(row => {
      // Create grouping key from row and column fields
      const rowKeys = config.rows.map(field => row[field] || 'Unknown').join('|');
      const colKeys = config.columns.map(field => row[field] || 'Unknown').join('|');
      const groupKey = `${rowKeys}${config.columns.length > 0 ? '::' + colKeys : ''}`;

      if (!grouped[groupKey]) {
        grouped[groupKey] = [];
      }
      grouped[groupKey].push(row);
    });

    return grouped;
  }

  private generatePivotStructure(grouped: { [key: string]: any[] }, config: PivotConfig): any[] {
    const pivotData: any[] = [];

    Object.entries(grouped).forEach(([groupKey, groupData]) => {
      const [rowPart, colPart] = groupKey.split('::');
      const rowValues = rowPart.split('|');
      const colValues = colPart ? colPart.split('|') : [];

      const pivotRow: any = {};

      // Add row dimension values
      config.rows.forEach((field, index) => {
        pivotRow[field] = rowValues[index] || 'Unknown';
      });

      // Add column dimension values
      config.columns.forEach((field, index) => {
        pivotRow[field] = colValues[index] || 'Unknown';
      });

      // Calculate aggregated values
      config.values.forEach(valueField => {
        const values = groupData
          .map(row => row[valueField])
          .filter(val => val !== null && val !== undefined && val !== '')
          .map(val => Number(val))
          .filter(val => !isNaN(val));

        let aggregatedValue = 0;

        switch (config.aggregation) {
          case 'sum':
            aggregatedValue = values.reduce((sum, val) => sum + val, 0);
            break;
          case 'count':
            aggregatedValue = groupData.length;
            break;
          case 'average':
            aggregatedValue = values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0;
            break;
          case 'min':
            aggregatedValue = values.length > 0 ? Math.min(...values) : 0;
            break;
          case 'max':
            aggregatedValue = values.length > 0 ? Math.max(...values) : 0;
            break;
        }

        const fieldName = config.values.length > 1 ? 
          `${config.aggregation}(${valueField})` : 
          config.aggregation === 'count' ? 'Count' : valueField;
        
        pivotRow[fieldName] = aggregatedValue;
      });

      // If no value fields specified, just count records
      if (config.values.length === 0) {
        pivotRow['Count'] = groupData.length;
      }

      pivotData.push(pivotRow);
    });

    // Sort the results
    pivotData.sort((a, b) => {
      for (const field of config.rows) {
        const aVal = String(a[field] || '');
        const bVal = String(b[field] || '');
        if (aVal !== bVal) {
          return aVal.localeCompare(bVal);
        }
      }
      for (const field of config.columns) {
        const aVal = String(a[field] || '');
        const bVal = String(b[field] || '');
        if (aVal !== bVal) {
          return aVal.localeCompare(bVal);
        }
      }
      return 0;
    });

    return pivotData;
  }

  private evaluateFormula(formula: string): any {
    try {
      const cleanFormula = formula.startsWith('=') ? formula.slice(1) : formula;
      return new Function('return ' + cleanFormula)();
    } catch {
      return formula;
    }
  }
}