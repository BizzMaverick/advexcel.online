import { Cell } from '../types/spreadsheet';

export interface QueryResult {
  success: boolean;
  message: string;
  data: any[];
  summary?: {
    totalRows: number;
    columns: string[];
    filters: string[];
  };
}

export class NaturalLanguageProcessor {
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
      val ? String(val).toLowerCase() : `column_${idx + 1}`
    ) || [];
  }

  processQuery(query: string): QueryResult {
    const normalizedQuery = query.toLowerCase().trim();

    try {
      // Extract region queries
      if (this.isRegionQuery(normalizedQuery)) {
        return this.handleRegionQuery(normalizedQuery);
      }

      // Extract product/category queries
      if (this.isProductQuery(normalizedQuery)) {
        return this.handleProductQuery(normalizedQuery);
      }

      // Extract date/time queries
      if (this.isDateQuery(normalizedQuery)) {
        return this.handleDateQuery(normalizedQuery);
      }

      // Extract sales/revenue queries
      if (this.isSalesQuery(normalizedQuery)) {
        return this.handleSalesQuery(normalizedQuery);
      }

      // Extract top/bottom queries
      if (this.isRankingQuery(normalizedQuery)) {
        return this.handleRankingQuery(normalizedQuery);
      }

      // Extract comparison queries
      if (this.isComparisonQuery(normalizedQuery)) {
        return this.handleComparisonQuery(normalizedQuery);
      }

      // Extract aggregation queries
      if (this.isAggregationQuery(normalizedQuery)) {
        return this.handleAggregationQuery(normalizedQuery);
      }

      // Extract filter queries
      if (this.isFilterQuery(normalizedQuery)) {
        return this.handleFilterQuery(normalizedQuery);
      }

      return {
        success: false,
        message: 'Query not understood. Try queries like "extract west region data", "show top 10 sales", "filter by product category", etc.',
        data: []
      };

    } catch (error) {
      return {
        success: false,
        message: `Error processing query: ${error instanceof Error ? error.message : 'Unknown error'}`,
        data: []
      };
    }
  }

  private isRegionQuery(query: string): boolean {
    const regionKeywords = ['region', 'area', 'zone', 'territory', 'location', 'state', 'country', 'city'];
    const regionValues = ['west', 'east', 'north', 'south', 'central', 'northeast', 'northwest', 'southeast', 'southwest'];
    
    return regionKeywords.some(keyword => query.includes(keyword)) || 
           regionValues.some(value => query.includes(value));
  }

  private handleRegionQuery(query: string): QueryResult {
    const regions = ['west', 'east', 'north', 'south', 'central', 'northeast', 'northwest', 'southeast', 'southwest'];
    const targetRegion = regions.find(region => query.includes(region));
    
    if (!targetRegion) {
      return {
        success: false,
        message: 'No specific region found in query',
        data: []
      };
    }

    // Find region column
    const regionColumnIndex = this.findColumnIndex(['region', 'area', 'zone', 'territory', 'location']);
    
    if (regionColumnIndex === -1) {
      return {
        success: false,
        message: 'No region column found in the data',
        data: []
      };
    }

    // Filter data by region
    const filteredData = this.data.slice(1).filter(row => {
      const regionValue = String(row[regionColumnIndex] || '').toLowerCase();
      return regionValue.includes(targetRegion);
    });

    const result = filteredData.map(row => {
      const obj: any = {};
      this.headers.forEach((header, index) => {
        obj[header] = row[index];
      });
      return obj;
    });

    return {
      success: true,
      message: `Found ${result.length} records for ${targetRegion} region`,
      data: result,
      summary: {
        totalRows: result.length,
        columns: this.headers,
        filters: [`region = ${targetRegion}`]
      }
    };
  }

  private isProductQuery(query: string): boolean {
    const productKeywords = ['product', 'item', 'category', 'brand', 'model', 'type'];
    return productKeywords.some(keyword => query.includes(keyword));
  }

  private handleProductQuery(query: string): QueryResult {
    const productColumnIndex = this.findColumnIndex(['product', 'item', 'category', 'brand', 'model', 'type']);
    
    if (productColumnIndex === -1) {
      return {
        success: false,
        message: 'No product column found in the data',
        data: []
      };
    }

    // Extract product name from query
    const words = query.split(' ');
    const productKeywordIndex = words.findIndex(word => 
      ['product', 'item', 'category', 'brand'].includes(word)
    );
    
    let targetProduct = '';
    if (productKeywordIndex !== -1 && productKeywordIndex < words.length - 1) {
      targetProduct = words[productKeywordIndex + 1];
    }

    let filteredData = this.data.slice(1);
    
    if (targetProduct) {
      filteredData = filteredData.filter(row => {
        const productValue = String(row[productColumnIndex] || '').toLowerCase();
        return productValue.includes(targetProduct);
      });
    }

    const result = filteredData.map(row => {
      const obj: any = {};
      this.headers.forEach((header, index) => {
        obj[header] = row[index];
      });
      return obj;
    });

    return {
      success: true,
      message: targetProduct 
        ? `Found ${result.length} records for product containing "${targetProduct}"`
        : `Found ${result.length} product records`,
      data: result,
      summary: {
        totalRows: result.length,
        columns: this.headers,
        filters: targetProduct ? [`product contains ${targetProduct}`] : []
      }
    };
  }

  private isDateQuery(query: string): boolean {
    const dateKeywords = ['date', 'month', 'year', 'quarter', 'week', 'day', 'time', 'period'];
    const dateValues = ['january', 'february', 'march', 'april', 'may', 'june', 
                       'july', 'august', 'september', 'october', 'november', 'december',
                       '2023', '2024', '2025', 'q1', 'q2', 'q3', 'q4'];
    
    return dateKeywords.some(keyword => query.includes(keyword)) ||
           dateValues.some(value => query.includes(value));
  }

  private handleDateQuery(query: string): QueryResult {
    const dateColumnIndex = this.findColumnIndex(['date', 'month', 'year', 'quarter', 'time', 'period']);
    
    if (dateColumnIndex === -1) {
      return {
        success: false,
        message: 'No date column found in the data',
        data: []
      };
    }

    // Extract date criteria from query
    const months = ['january', 'february', 'march', 'april', 'may', 'june', 
                   'july', 'august', 'september', 'october', 'november', 'december'];
    const years = ['2023', '2024', '2025'];
    const quarters = ['q1', 'q2', 'q3', 'q4'];

    let targetCriteria = '';
    
    for (const month of months) {
      if (query.includes(month)) {
        targetCriteria = month;
        break;
      }
    }
    
    if (!targetCriteria) {
      for (const year of years) {
        if (query.includes(year)) {
          targetCriteria = year;
          break;
        }
      }
    }
    
    if (!targetCriteria) {
      for (const quarter of quarters) {
        if (query.includes(quarter)) {
          targetCriteria = quarter;
          break;
        }
      }
    }

    let filteredData = this.data.slice(1);
    
    if (targetCriteria) {
      filteredData = filteredData.filter(row => {
        const dateValue = String(row[dateColumnIndex] || '').toLowerCase();
        return dateValue.includes(targetCriteria);
      });
    }

    const result = filteredData.map(row => {
      const obj: any = {};
      this.headers.forEach((header, index) => {
        obj[header] = row[index];
      });
      return obj;
    });

    return {
      success: true,
      message: targetCriteria 
        ? `Found ${result.length} records for ${targetCriteria}`
        : `Found ${result.length} date-related records`,
      data: result,
      summary: {
        totalRows: result.length,
        columns: this.headers,
        filters: targetCriteria ? [`date contains ${targetCriteria}`] : []
      }
    };
  }

  private isSalesQuery(query: string): boolean {
    const salesKeywords = ['sales', 'revenue', 'income', 'profit', 'earnings', 'amount', 'value', 'price'];
    return salesKeywords.some(keyword => query.includes(keyword));
  }

  private handleSalesQuery(query: string): QueryResult {
    const salesColumnIndex = this.findColumnIndex(['sales', 'revenue', 'income', 'profit', 'earnings', 'amount', 'value', 'price']);
    
    if (salesColumnIndex === -1) {
      return {
        success: false,
        message: 'No sales/revenue column found in the data',
        data: []
      };
    }

    const filteredData = this.data.slice(1).filter(row => {
      const salesValue = row[salesColumnIndex];
      return salesValue !== null && salesValue !== undefined && salesValue !== '';
    });

    // Calculate summary statistics
    const salesValues = filteredData.map(row => Number(row[salesColumnIndex])).filter(val => !isNaN(val));
    const totalSales = salesValues.reduce((sum, val) => sum + val, 0);
    const avgSales = salesValues.length > 0 ? totalSales / salesValues.length : 0;
    const maxSales = salesValues.length > 0 ? Math.max(...salesValues) : 0;
    const minSales = salesValues.length > 0 ? Math.min(...salesValues) : 0;

    const result = filteredData.map(row => {
      const obj: any = {};
      this.headers.forEach((header, index) => {
        obj[header] = row[index];
      });
      return obj;
    });

    return {
      success: true,
      message: `Sales analysis: ${result.length} records, Total: ${totalSales.toFixed(2)}, Average: ${avgSales.toFixed(2)}, Max: ${maxSales.toFixed(2)}, Min: ${minSales.toFixed(2)}`,
      data: result,
      summary: {
        totalRows: result.length,
        columns: this.headers,
        filters: ['sales data only']
      }
    };
  }

  private isRankingQuery(query: string): boolean {
    const rankingKeywords = ['top', 'bottom', 'highest', 'lowest', 'best', 'worst', 'maximum', 'minimum'];
    return rankingKeywords.some(keyword => query.includes(keyword));
  }

  private handleRankingQuery(query: string): QueryResult {
    const isTop = query.includes('top') || query.includes('highest') || query.includes('best') || query.includes('maximum');
    const isBottom = query.includes('bottom') || query.includes('lowest') || query.includes('worst') || query.includes('minimum');
    
    // Extract number
    const numberMatch = query.match(/\d+/);
    const limit = numberMatch ? parseInt(numberMatch[0]) : 10;

    // Find numeric column to sort by
    const salesColumnIndex = this.findColumnIndex(['sales', 'revenue', 'income', 'profit', 'earnings', 'amount', 'value', 'price']);
    
    if (salesColumnIndex === -1) {
      return {
        success: false,
        message: 'No numeric column found for ranking',
        data: []
      };
    }

    let sortedData = this.data.slice(1).filter(row => {
      const value = row[salesColumnIndex];
      return value !== null && value !== undefined && value !== '' && !isNaN(Number(value));
    });

    // Sort data
    sortedData.sort((a, b) => {
      const aVal = Number(a[salesColumnIndex]);
      const bVal = Number(b[salesColumnIndex]);
      return isTop ? bVal - aVal : aVal - bVal;
    });

    // Limit results
    sortedData = sortedData.slice(0, limit);

    const result = sortedData.map(row => {
      const obj: any = {};
      this.headers.forEach((header, index) => {
        obj[header] = row[index];
      });
      return obj;
    });

    const direction = isTop ? 'top' : 'bottom';
    const columnName = this.headers[salesColumnIndex];

    return {
      success: true,
      message: `Found ${direction} ${limit} records by ${columnName}`,
      data: result,
      summary: {
        totalRows: result.length,
        columns: this.headers,
        filters: [`${direction} ${limit} by ${columnName}`]
      }
    };
  }

  private isComparisonQuery(query: string): boolean {
    const comparisonKeywords = ['compare', 'vs', 'versus', 'against', 'between', 'difference'];
    return comparisonKeywords.some(keyword => query.includes(keyword));
  }

  private handleComparisonQuery(query: string): QueryResult {
    // This is a simplified comparison - in a real implementation, you'd parse more complex comparisons
    const result = this.data.slice(1).map(row => {
      const obj: any = {};
      this.headers.forEach((header, index) => {
        obj[header] = row[index];
      });
      return obj;
    });

    return {
      success: true,
      message: `Comparison data prepared with ${result.length} records`,
      data: result,
      summary: {
        totalRows: result.length,
        columns: this.headers,
        filters: ['comparison query']
      }
    };
  }

  private isAggregationQuery(query: string): boolean {
    const aggregationKeywords = ['sum', 'total', 'average', 'mean', 'count', 'max', 'min', 'aggregate'];
    return aggregationKeywords.some(keyword => query.includes(keyword));
  }

  private handleAggregationQuery(query: string): QueryResult {
    const numericColumns = this.headers.map((header, index) => ({ header, index }))
      .filter(({ index }) => {
        const values = this.data.slice(1).map(row => row[index]);
        return values.some(val => !isNaN(Number(val)) && val !== null && val !== '');
      });

    if (numericColumns.length === 0) {
      return {
        success: false,
        message: 'No numeric columns found for aggregation',
        data: []
      };
    }

    const aggregations: any = {};
    
    numericColumns.forEach(({ header, index }) => {
      const values = this.data.slice(1)
        .map(row => Number(row[index]))
        .filter(val => !isNaN(val));
      
      if (values.length > 0) {
        aggregations[header] = {
          sum: values.reduce((sum, val) => sum + val, 0),
          average: values.reduce((sum, val) => sum + val, 0) / values.length,
          count: values.length,
          max: Math.max(...values),
          min: Math.min(...values)
        };
      }
    });

    return {
      success: true,
      message: `Aggregation complete for ${Object.keys(aggregations).length} numeric columns`,
      data: [aggregations],
      summary: {
        totalRows: 1,
        columns: Object.keys(aggregations),
        filters: ['aggregation summary']
      }
    };
  }

  private isFilterQuery(query: string): boolean {
    const filterKeywords = ['filter', 'where', 'show', 'find', 'get', 'extract', 'select'];
    return filterKeywords.some(keyword => query.includes(keyword));
  }

  private handleFilterQuery(query: string): QueryResult {
    // Extract filter criteria from query
    const words = query.split(' ');
    let filteredData = this.data.slice(1);
    const appliedFilters: string[] = [];

    // Look for specific values to filter by
    words.forEach(word => {
      if (word.length > 2 && !['filter', 'where', 'show', 'find', 'get', 'extract', 'select', 'data', 'records'].includes(word.toLowerCase())) {
        const originalLength = filteredData.length;
        filteredData = filteredData.filter(row => {
          return row.some(cell => 
            String(cell || '').toLowerCase().includes(word.toLowerCase())
          );
        });
        
        if (filteredData.length < originalLength) {
          appliedFilters.push(`contains "${word}"`);
        }
      }
    });

    const result = filteredData.map(row => {
      const obj: any = {};
      this.headers.forEach((header, index) => {
        obj[header] = row[index];
      });
      return obj;
    });

    return {
      success: true,
      message: `Filter applied: Found ${result.length} matching records`,
      data: result,
      summary: {
        totalRows: result.length,
        columns: this.headers,
        filters: appliedFilters
      }
    };
  }

  private findColumnIndex(possibleNames: string[]): number {
    for (const name of possibleNames) {
      const index = this.headers.findIndex(header => 
        header.toLowerCase().includes(name.toLowerCase())
      );
      if (index !== -1) return index;
    }
    return -1;
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