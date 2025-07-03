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
  private columnTypes: { [key: string]: 'text' | 'number' | 'date' | 'boolean' } = {};

  constructor(cells: { [key: string]: Cell }) {
    this.cells = cells;
    this.processData();
    this.inferColumnTypes();
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

  private inferColumnTypes() {
    if (this.data.length <= 1) return; // No data or only headers
    
    this.headers.forEach((header, colIndex) => {
      const values = this.data.slice(1).map(row => row[colIndex]).filter(val => val !== null && val !== undefined && val !== '');
      
      // Check if column contains mostly numbers
      const numericCount = values.filter(val => !isNaN(Number(val))).length;
      if (numericCount / values.length > 0.7) {
        this.columnTypes[header] = 'number';
        return;
      }
      
      // Check if column contains mostly dates
      const dateCount = values.filter(val => this.isDateString(String(val))).length;
      if (dateCount / values.length > 0.7) {
        this.columnTypes[header] = 'date';
        return;
      }
      
      // Check if column contains mostly booleans
      const boolCount = values.filter(val => 
        typeof val === 'boolean' || 
        String(val).toLowerCase() === 'true' || 
        String(val).toLowerCase() === 'false' ||
        String(val).toLowerCase() === 'yes' ||
        String(val).toLowerCase() === 'no'
      ).length;
      
      if (boolCount / values.length > 0.7) {
        this.columnTypes[header] = 'boolean';
        return;
      }
      
      // Default to text
      this.columnTypes[header] = 'text';
    });
  }

  processQuery(query: string): QueryResult {
    const normalizedQuery = query.toLowerCase().trim();

    try {
      // First, check if this is a chart generation query
      if (this.isChartQuery(normalizedQuery)) {
        return this.handleChartQuery(normalizedQuery);
      }
      
      // Check for specific query types
      if (this.isRegionQuery(normalizedQuery)) {
        return this.handleRegionQuery(normalizedQuery);
      }

      if (this.isProductQuery(normalizedQuery)) {
        return this.handleProductQuery(normalizedQuery);
      }

      if (this.isDateQuery(normalizedQuery)) {
        return this.handleDateQuery(normalizedQuery);
      }

      if (this.isSalesQuery(normalizedQuery)) {
        return this.handleSalesQuery(normalizedQuery);
      }

      if (this.isRankingQuery(normalizedQuery)) {
        return this.handleRankingQuery(normalizedQuery);
      }

      if (this.isComparisonQuery(normalizedQuery)) {
        return this.handleComparisonQuery(normalizedQuery);
      }

      if (this.isAggregationQuery(normalizedQuery)) {
        return this.handleAggregationQuery(normalizedQuery);
      }

      if (this.isFilterQuery(normalizedQuery)) {
        return this.handleFilterQuery(normalizedQuery);
      }

      if (this.isSheetQuery(normalizedQuery)) {
        return this.handleSheetQuery(normalizedQuery);
      }

      // If no specific query type is detected, try a general filter approach
      return this.handleGeneralQuery(normalizedQuery);

    } catch (error) {
      console.error("Error processing query:", error);
      return {
        success: false,
        message: `Error processing query: ${error instanceof Error ? error.message : 'Unknown error'}`,
        data: []
      };
    }
  }

  private isChartQuery(query: string): boolean {
    const chartKeywords = ['chart', 'graph', 'plot', 'visualize', 'visualization', 'bar chart', 'line chart', 'pie chart'];
    return chartKeywords.some(keyword => query.includes(keyword));
  }

  private handleChartQuery(query: string): QueryResult {
    // Determine chart type
    const chartType = this.determineChartType(query);
    
    // Find numeric columns for the chart
    const numericColumns = Object.entries(this.columnTypes)
      .filter(([_, type]) => type === 'number')
      .map(([header]) => header);
    
    if (numericColumns.length < 1) {
      return {
        success: false,
        message: 'No numeric columns found for chart creation',
        data: []
      };
    }
    
    // Find category column (non-numeric)
    const categoryColumns = Object.entries(this.columnTypes)
      .filter(([_, type]) => type !== 'number')
      .map(([header]) => header);
    
    const categoryColumn = this.findMentionedColumn(query, categoryColumns) || categoryColumns[0];
    const valueColumn = this.findMentionedColumn(query, numericColumns) || numericColumns[0];
    
    if (!categoryColumn || !valueColumn) {
      return {
        success: false,
        message: 'Could not determine appropriate columns for chart',
        data: []
      };
    }
    
    // Prepare data for chart
    const categoryIndex = this.headers.indexOf(categoryColumn);
    const valueIndex = this.headers.indexOf(valueColumn);
    
    if (categoryIndex === -1 || valueIndex === -1) {
      return {
        success: false,
        message: 'Could not find specified columns in data',
        data: []
      };
    }
    
    // Aggregate data by category
    const aggregatedData: { [key: string]: number } = {};
    
    this.data.slice(1).forEach(row => {
      const category = String(row[categoryIndex] || 'Unknown');
      const value = Number(row[valueIndex]);
      
      if (!isNaN(value)) {
        if (aggregatedData[category]) {
          aggregatedData[category] += value;
        } else {
          aggregatedData[category] = value;
        }
      }
    });
    
    // Convert to array format for chart
    const chartData = Object.entries(aggregatedData).map(([category, value]) => ({
      category,
      value,
      [valueColumn]: value,
      [categoryColumn]: category
    }));
    
    return {
      success: true,
      message: `Created ${chartType} chart of ${valueColumn} by ${categoryColumn}`,
      data: chartData,
      summary: {
        totalRows: chartData.length,
        columns: [categoryColumn, valueColumn],
        filters: []
      }
    };
  }

  private determineChartType(query: string): string {
    if (query.includes('bar') || query.includes('column')) return 'bar';
    if (query.includes('line')) return 'line';
    if (query.includes('pie')) return 'pie';
    if (query.includes('scatter')) return 'scatter';
    return 'bar'; // Default
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
    const productKeywords = ['product', 'item', 'category', 'brand', 'model', 'type'];
    let targetProduct = '';
    
    for (const keyword of productKeywords) {
      if (query.includes(keyword)) {
        const regex = new RegExp(`${keyword}\\s+([\\w\\s]+)`, 'i');
        const match = query.match(regex);
        if (match && match[1]) {
          targetProduct = match[1].trim();
          break;
        }
      }
    }

    let filteredData = this.data.slice(1);
    
    if (targetProduct) {
      filteredData = filteredData.filter(row => {
        const productValue = String(row[productColumnIndex] || '').toLowerCase();
        return productValue.includes(targetProduct.toLowerCase());
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
    const years = ['2020', '2021', '2022', '2023', '2024', '2025'];
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

    // Check if we need to group by something
    const groupByMatch = query.match(/by\s+(\w+)/i);
    let groupByColumn = '';
    let groupByColumnIndex = -1;
    
    if (groupByMatch) {
      groupByColumn = groupByMatch[1].toLowerCase();
      groupByColumnIndex = this.headers.findIndex(h => h.includes(groupByColumn));
    }

    // If grouping is requested and valid
    if (groupByColumnIndex !== -1) {
      const groupedData: { [key: string]: { sum: number; count: number; values: number[] } } = {};
      
      this.data.slice(1).forEach(row => {
        const groupKey = String(row[groupByColumnIndex] || 'Unknown');
        const salesValue = Number(row[salesColumnIndex]);
        
        if (!isNaN(salesValue)) {
          if (!groupedData[groupKey]) {
            groupedData[groupKey] = { sum: 0, count: 0, values: [] };
          }
          
          groupedData[groupKey].sum += salesValue;
          groupedData[groupKey].count++;
          groupedData[groupKey].values.push(salesValue);
        }
      });
      
      const result = Object.entries(groupedData).map(([group, data]) => ({
        [this.headers[groupByColumnIndex]]: group,
        [this.headers[salesColumnIndex]]: data.sum,
        count: data.count,
        average: data.sum / data.count
      }));
      
      return {
        success: true,
        message: `Grouped ${this.headers[salesColumnIndex]} by ${this.headers[groupByColumnIndex]}`,
        data: result,
        summary: {
          totalRows: result.length,
          columns: [this.headers[groupByColumnIndex], this.headers[salesColumnIndex], 'count', 'average'],
          filters: []
        }
      };
    }

    // If no grouping, just filter sales data
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
    const numericColumns = Object.entries(this.columnTypes)
      .filter(([_, type]) => type === 'number')
      .map(([header]) => header);
    
    // Try to find the mentioned column
    const mentionedColumn = this.findMentionedColumn(query, numericColumns);
    const salesColumnIndex = mentionedColumn ? 
      this.headers.indexOf(mentionedColumn) : 
      this.findColumnIndex(['sales', 'revenue', 'income', 'profit', 'earnings', 'amount', 'value', 'price']);
    
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
    // Try to identify what we're comparing
    const compareValues: string[] = [];
    
    // Look for "X vs Y" pattern
    const vsMatch = query.match(/(\w+)\s+(?:vs|versus|against|compared to)\s+(\w+)/i);
    if (vsMatch) {
      compareValues.push(vsMatch[1].toLowerCase());
      compareValues.push(vsMatch[2].toLowerCase());
    }
    
    // If we found comparison values
    if (compareValues.length === 2) {
      // Find column that might contain these values
      let comparisonColumnIndex = -1;
      
      for (let colIndex = 0; colIndex < this.headers.length; colIndex++) {
        const columnValues = this.data.slice(1).map(row => String(row[colIndex] || '').toLowerCase());
        
        if (columnValues.some(val => val.includes(compareValues[0])) && 
            columnValues.some(val => val.includes(compareValues[1]))) {
          comparisonColumnIndex = colIndex;
          break;
        }
      }
      
      if (comparisonColumnIndex !== -1) {
        // Find numeric columns for comparison
        const numericColumns = Object.entries(this.columnTypes)
          .filter(([_, type]) => type === 'number')
          .map(([header]) => header);
        
        const numericColumnIndex = this.findColumnIndex(numericColumns);
        
        if (numericColumnIndex !== -1) {
          // Filter data for each comparison value
          const firstGroup = this.data.slice(1).filter(row => 
            String(row[comparisonColumnIndex] || '').toLowerCase().includes(compareValues[0])
          );
          
          const secondGroup = this.data.slice(1).filter(row => 
            String(row[comparisonColumnIndex] || '').toLowerCase().includes(compareValues[1])
          );
          
          // Calculate aggregates for each group
          const firstValues = firstGroup.map(row => Number(row[numericColumnIndex])).filter(val => !isNaN(val));
          const secondValues = secondGroup.map(row => Number(row[numericColumnIndex])).filter(val => !isNaN(val));
          
          const firstSum = firstValues.reduce((sum, val) => sum + val, 0);
          const secondSum = secondValues.reduce((sum, val) => sum + val, 0);
          
          const firstAvg = firstValues.length > 0 ? firstSum / firstValues.length : 0;
          const secondAvg = secondValues.length > 0 ? secondSum / secondValues.length : 0;
          
          // Create comparison result
          const comparisonResult = [
            {
              comparison: 'Summary',
              [compareValues[0]]: {
                count: firstValues.length,
                sum: firstSum,
                average: firstAvg
              },
              [compareValues[1]]: {
                count: secondValues.length,
                sum: secondSum,
                average: secondAvg
              },
              difference: {
                count: firstValues.length - secondValues.length,
                sum: firstSum - secondSum,
                average: firstAvg - secondAvg
              },
              percentDifference: {
                count: secondValues.length ? ((firstValues.length - secondValues.length) / secondValues.length * 100) : 0,
                sum: secondSum ? ((firstSum - secondSum) / secondSum * 100) : 0,
                average: secondAvg ? ((firstAvg - secondAvg) / secondAvg * 100) : 0
              }
            }
          ];
          
          return {
            success: true,
            message: `Comparison of ${compareValues[0]} vs ${compareValues[1]} by ${this.headers[numericColumnIndex]}`,
            data: comparisonResult,
            summary: {
              totalRows: 1,
              columns: ['comparison', compareValues[0], compareValues[1], 'difference', 'percentDifference'],
              filters: []
            }
          };
        }
      }
    }

    // If specific comparison failed, return all data for manual comparison
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
    // Determine aggregation function
    const aggregationType = this.determineAggregationType(query);
    
    // Find numeric columns for aggregation
    const numericColumns = Object.entries(this.columnTypes)
      .filter(([_, type]) => type === 'number')
      .map(([header]) => header);

    if (numericColumns.length === 0) {
      return {
        success: false,
        message: 'No numeric columns found for aggregation',
        data: []
      };
    }

    // Try to find mentioned column
    const mentionedColumn = this.findMentionedColumn(query, numericColumns);
    const targetColumns = mentionedColumn ? [mentionedColumn] : numericColumns;

    // Check if we need to group by something
    const groupByMatch = query.match(/by\s+(\w+)/i);
    let groupByColumn = '';
    let groupByColumnIndex = -1;
    
    if (groupByMatch) {
      groupByColumn = groupByMatch[1].toLowerCase();
      groupByColumnIndex = this.headers.findIndex(h => h.includes(groupByColumn));
    }

    // If grouping is requested and valid
    if (groupByColumnIndex !== -1) {
      const groupedResults: any[] = [];
      const groupedData: { [key: string]: { [column: string]: number[] } } = {};
      
      // Collect values by group
      this.data.slice(1).forEach(row => {
        const groupKey = String(row[groupByColumnIndex] || 'Unknown');
        
        if (!groupedData[groupKey]) {
          groupedData[groupKey] = {};
          targetColumns.forEach(column => {
            groupedData[groupKey][column] = [];
          });
        }
        
        targetColumns.forEach(column => {
          const columnIndex = this.headers.indexOf(column);
          if (columnIndex !== -1) {
            const value = Number(row[columnIndex]);
            if (!isNaN(value)) {
              groupedData[groupKey][column].push(value);
            }
          }
        });
      });
      
      // Calculate aggregations for each group
      Object.entries(groupedData).forEach(([group, columnData]) => {
        const resultRow: any = {
          [this.headers[groupByColumnIndex]]: group
        };
        
        Object.entries(columnData).forEach(([column, values]) => {
          if (values.length > 0) {
            switch (aggregationType) {
              case 'sum':
                resultRow[`sum_${column}`] = values.reduce((sum, val) => sum + val, 0);
                break;
              case 'average':
                resultRow[`avg_${column}`] = values.reduce((sum, val) => sum + val, 0) / values.length;
                break;
              case 'count':
                resultRow[`count_${column}`] = values.length;
                break;
              case 'max':
                resultRow[`max_${column}`] = Math.max(...values);
                break;
              case 'min':
                resultRow[`min_${column}`] = Math.min(...values);
                break;
            }
          }
        });
        
        groupedResults.push(resultRow);
      });
      
      return {
        success: true,
        message: `${aggregationType.toUpperCase()} of ${targetColumns.join(', ')} grouped by ${this.headers[groupByColumnIndex]}`,
        data: groupedResults,
        summary: {
          totalRows: groupedResults.length,
          columns: [this.headers[groupByColumnIndex], ...targetColumns.map(col => `${aggregationType}_${col}`)],
          filters: []
        }
      };
    }

    // If no grouping, calculate aggregates for the whole dataset
    const aggregations: any = {};
    
    targetColumns.forEach(column => {
      const columnIndex = this.headers.indexOf(column);
      if (columnIndex !== -1) {
        const values = this.data.slice(1)
          .map(row => Number(row[columnIndex]))
          .filter(val => !isNaN(val));
        
        if (values.length > 0) {
          switch (aggregationType) {
            case 'sum':
              aggregations[`sum_${column}`] = values.reduce((sum, val) => sum + val, 0);
              break;
            case 'average':
              aggregations[`avg_${column}`] = values.reduce((sum, val) => sum + val, 0) / values.length;
              break;
            case 'count':
              aggregations[`count_${column}`] = values.length;
              break;
            case 'max':
              aggregations[`max_${column}`] = Math.max(...values);
              break;
            case 'min':
              aggregations[`min_${column}`] = Math.min(...values);
              break;
          }
        }
      }
    });

    return {
      success: true,
      message: `${aggregationType.toUpperCase()} calculation for ${targetColumns.join(', ')}`,
      data: [aggregations],
      summary: {
        totalRows: 1,
        columns: Object.keys(aggregations),
        filters: []
      }
    };
  }

  private determineAggregationType(query: string): 'sum' | 'average' | 'count' | 'max' | 'min' {
    if (query.includes('sum') || query.includes('total')) return 'sum';
    if (query.includes('average') || query.includes('mean') || query.includes('avg')) return 'average';
    if (query.includes('count')) return 'count';
    if (query.includes('max') || query.includes('maximum') || query.includes('highest')) return 'max';
    if (query.includes('min') || query.includes('minimum') || query.includes('lowest')) return 'min';
    return 'sum'; // Default
  }

  private isFilterQuery(query: string): boolean {
    const filterKeywords = ['filter', 'where', 'show', 'find', 'get', 'extract', 'select'];
    return filterKeywords.some(keyword => query.includes(keyword));
  }

  private handleFilterQuery(query: string): QueryResult {
    // Extract filter criteria from query
    const filters: Array<{ column: string; operator: string; value: any }> = [];
    
    // Look for comparison operators
    const comparisonPatterns = [
      { regex: /(\w+)\s*(>|greater than)\s*(\d+(?:\.\d+)?)/gi, operator: '>' },
      { regex: /(\w+)\s*(<|less than)\s*(\d+(?:\.\d+)?)/gi, operator: '<' },
      { regex: /(\w+)\s*(>=|greater than or equal to)\s*(\d+(?:\.\d+)?)/gi, operator: '>=' },
      { regex: /(\w+)\s*(<=|less than or equal to)\s*(\d+(?:\.\d+)?)/gi, operator: '<=' },
      { regex: /(\w+)\s*(=|equals|is)\s*(\w+)/gi, operator: '=' },
      { regex: /(\w+)\s*(contains|has|includes)\s*['"]?([^'"]+)['"]?/gi, operator: 'contains' }
    ];
    
    comparisonPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.regex.exec(query)) !== null) {
        const column = match[1].toLowerCase();
        const value = match[3];
        
        // Find the actual column that matches
        const matchedColumn = this.headers.find(header => header.includes(column));
        
        if (matchedColumn) {
          filters.push({
            column: matchedColumn,
            operator: pattern.operator,
            value: pattern.operator === '>' || pattern.operator === '<' || 
                   pattern.operator === '>=' || pattern.operator === '<=' ? 
                   Number(value) : value
          });
        }
      }
    });
    
    // If no specific filters found, look for keywords
    if (filters.length === 0) {
      const words = query.split(' ');
      words.forEach(word => {
        if (word.length > 2 && !['filter', 'where', 'show', 'find', 'get', 'extract', 'select', 'data', 'records'].includes(word.toLowerCase())) {
          // Check if this word appears in any column header
          const matchedColumn = this.headers.find(header => header.includes(word.toLowerCase()));
          
          if (matchedColumn) {
            // This might be a column name, look for a value to filter by
            const valueIndex = words.indexOf(word) + 1;
            if (valueIndex < words.length) {
              filters.push({
                column: matchedColumn,
                operator: '=',
                value: words[valueIndex]
              });
            }
          } else {
            // This might be a value to search for across all columns
            filters.push({
              column: '*',
              operator: 'contains',
              value: word
            });
          }
        }
      });
    }

    // Apply filters
    let filteredData = this.data.slice(1);
    const appliedFilters: string[] = [];
    
    filters.forEach(filter => {
      const originalLength = filteredData.length;
      
      if (filter.column === '*') {
        // Search across all columns
        filteredData = filteredData.filter(row => {
          return row.some(cell => 
            String(cell || '').toLowerCase().includes(filter.value.toLowerCase())
          );
        });
      } else {
        // Filter specific column
        const columnIndex = this.headers.indexOf(filter.column);
        if (columnIndex !== -1) {
          filteredData = filteredData.filter(row => {
            const cellValue = row[columnIndex];
            
            switch (filter.operator) {
              case '>':
                return Number(cellValue) > filter.value;
              case '<':
                return Number(cellValue) < filter.value;
              case '>=':
                return Number(cellValue) >= filter.value;
              case '<=':
                return Number(cellValue) <= filter.value;
              case '=':
                return String(cellValue).toLowerCase() === String(filter.value).toLowerCase();
              case 'contains':
                return String(cellValue || '').toLowerCase().includes(String(filter.value).toLowerCase());
              default:
                return true;
            }
          });
        }
      }
      
      if (filteredData.length < originalLength) {
        appliedFilters.push(`${filter.column} ${filter.operator} ${filter.value}`);
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

  private isSheetQuery(query: string): boolean {
    return query.includes('sheet') || query.includes('worksheet') || query.includes('tab');
  }

  private handleSheetQuery(query: string): QueryResult {
    // This is a placeholder since we don't have actual sheet data in this context
    // In a real implementation, this would interact with the workbook data
    
    return {
      success: false,
      message: 'Sheet-specific queries are handled at a higher level',
      data: []
    };
  }

  private handleGeneralQuery(query: string): QueryResult {
    // This is a fallback for queries that don't match specific patterns
    // We'll try to extract meaningful keywords and search across all columns
    
    const stopWords = ['show', 'me', 'get', 'find', 'display', 'list', 'the', 'all', 'and', 'or', 'with', 'without', 'from', 'to', 'in', 'on', 'at', 'by', 'for', 'of', 'that', 'have', 'has'];
    
    const words = query.split(/\s+/)
      .map(word => word.toLowerCase())
      .filter(word => word.length > 2 && !stopWords.includes(word));
    
    if (words.length === 0) {
      // No meaningful keywords found, return all data
      const result = this.data.slice(1).map(row => {
        const obj: any = {};
        this.headers.forEach((header, index) => {
          obj[header] = row[index];
        });
        return obj;
      });
      
      return {
        success: true,
        message: `Showing all ${result.length} records`,
        data: result,
        summary: {
          totalRows: result.length,
          columns: this.headers,
          filters: []
        }
      };
    }
    
    // Search for each keyword across all columns
    let filteredData = this.data.slice(1);
    const appliedFilters: string[] = [];
    
    words.forEach(word => {
      const originalLength = filteredData.length;
      
      filteredData = filteredData.filter(row => {
        return row.some(cell => 
          String(cell || '').toLowerCase().includes(word)
        );
      });
      
      if (filteredData.length < originalLength) {
        appliedFilters.push(`contains "${word}"`);
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
      message: `Found ${result.length} records matching your query`,
      data: result,
      summary: {
        totalRows: result.length,
        columns: this.headers,
        filters: appliedFilters
      }
    };
  }

  // Helper methods
  private findColumnIndex(possibleNames: string[]): number {
    for (const name of possibleNames) {
      const index = this.headers.findIndex(header => 
        header.includes(name)
      );
      if (index !== -1) return index;
    }
    return -1;
  }

  private findMentionedColumn(query: string, columns: string[]): string | null {
    for (const column of columns) {
      if (query.includes(column)) {
        return column;
      }
    }
    return null;
  }

  private evaluateFormula(formula: string): any {
    try {
      const cleanFormula = formula.startsWith('=') ? formula.slice(1) : formula;
      return new Function('return ' + cleanFormula)();
    } catch {
      return formula;
    }
  }

  private isDateString(value: string): boolean {
    // Check common date formats
    const datePatterns = [
      /^\d{4}-\d{2}-\d{2}$/, // YYYY-MM-DD
      /^\d{2}\/\d{2}\/\d{4}$/, // MM/DD/YYYY
      /^\d{2}-\d{2}-\d{4}$/, // MM-DD-YYYY
      /^\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}$/i // 1 Jan 2023
    ];
    
    return datePatterns.some(pattern => pattern.test(value)) || !isNaN(Date.parse(value));
  }
}