import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY || '',
  dangerouslyAllowBrowser: true // Note: In production, this should be handled server-side
});

export interface ExcelOperation {
  type: 'sum' | 'average' | 'filter' | 'sort' | 'formula' | 'format' | 'custom';
  description: string;
  result?: any;
}

export class AIService {
  static async processExcelPrompt(
    prompt: string, 
    spreadsheetData: any[][], 
    currentData: any[][]
  ): Promise<{ operation: ExcelOperation; newData: any[][] }> {
    try {
      // Convert spreadsheet data to a format that's easier for AI to understand
      const dataDescription = this.formatDataForAI(spreadsheetData);
      
      const systemPrompt = `You are an Excel AI assistant. You can perform various operations on spreadsheet data.
      
Available operations:
- SUM: Sum values in a column or range
- AVERAGE: Calculate average of values
- FILTER: Filter rows based on conditions
- SORT: Sort data by columns
- FORMULA: Apply formulas to cells
- FORMAT: Format cells (bold, italic, etc.)
- CUSTOM: Any other Excel operation

Current data structure: ${dataDescription}

IMPORTANT: Analyze the user's request carefully and identify the specific operation they want.
- If they mention a specific column (A, B, C, or 1, 2, 3), focus on that column
- If they want to sum/average specific columns, only process those columns
- If they want to sort, identify the column to sort by
- If they want to filter, identify the condition

Respond with a JSON object containing:
{
  "operation": {
    "type": "sum|average|filter|sort|formula|format|custom",
    "description": "What operation was performed"
  },
  "instructions": "Step-by-step instructions for the user",
  "newData": [array of arrays representing the modified spreadsheet data]
}

Only return valid JSON.`;

      const userPrompt = `User request: "${prompt}"

Current spreadsheet data:
${JSON.stringify(currentData, null, 2)}

Please perform the requested operation and return the result.`;

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.1,
        max_tokens: 2000
      });

      const response = completion.choices[0]?.message?.content;
      
      if (!response) {
        throw new Error('No response from AI');
      }

      // Parse the AI response
      const result = JSON.parse(response);
      
      return {
        operation: result.operation,
        newData: result.newData || currentData
      };

    } catch (error) {
      console.error('AI processing error:', error);
      
      // Fallback: Try to handle common operations manually
      return this.handleCommonOperations(prompt, currentData);
    }
  }

  private static formatDataForAI(data: any[][]): string {
    if (!data || data.length === 0) return 'Empty spreadsheet';
    
    const headers = data[0]?.map((cell, index) => `Column ${index + 1}: ${cell?.value || 'empty'}`) || [];
    const rowCount = data.length - 1; // Subtract 1 for header row
    const colCount = data[0]?.length || 0;
    
    return `Spreadsheet with ${rowCount} data rows and ${colCount} columns. Headers: ${headers.join(', ')}. First row contains column headers.`;
  }

  private static handleCommonOperations(prompt: string, data: any[][]): { operation: ExcelOperation; newData: any[][] } {
    const lowerPrompt = prompt.toLowerCase();
    
    // Handle sum operations with more specific matching
    if (lowerPrompt.includes('sum') || lowerPrompt.includes('total') || lowerPrompt.includes('add up')) {
      return this.handleSumOperation(prompt, data);
    }
    
    // Handle average operations with more specific matching
    if (lowerPrompt.includes('average') || lowerPrompt.includes('mean') || lowerPrompt.includes('avg')) {
      return this.handleAverageOperation(prompt, data);
    }
    
    // Handle filter operations with more specific matching
    if (lowerPrompt.includes('filter') || lowerPrompt.includes('show only') || lowerPrompt.includes('where') || lowerPrompt.includes('find')) {
      return this.handleFilterOperation(prompt, data);
    }
    
    // Handle sort operations with more specific matching
    if (lowerPrompt.includes('sort') || lowerPrompt.includes('order') || lowerPrompt.includes('arrange') || lowerPrompt.includes('alphabetical')) {
      return this.handleSortOperation(prompt, data);
    }
    
    // Handle specific column operations
    if (lowerPrompt.includes('column') || lowerPrompt.includes('col')) {
      return this.handleColumnSpecificOperation(prompt, data);
    }
    
    // Handle row operations
    if (lowerPrompt.includes('row')) {
      return this.handleRowOperation(prompt, data);
    }
    
    // Handle formula operations
    if (lowerPrompt.includes('formula') || lowerPrompt.includes('calculate') || lowerPrompt.includes('compute')) {
      return this.handleFormulaOperation(prompt, data);
    }
    
    // Default: return original data with custom operation
    return {
      operation: {
        type: 'custom',
        description: `Processed: ${prompt}`
      },
      newData: data
    };
  }

  private static handleSumOperation(_prompt: string, data: any[][]): { operation: ExcelOperation; newData: any[][] } {
    // Simple sum implementation
    const newData = [...data];
    
    // Add a sum row at the bottom (preserving headers)
    if (newData.length > 1) {
      const sumRow = newData[0].map((_, colIndex) => {
        if (colIndex === 0) return { value: 'SUM' };
        
        // Sum only numeric values from data rows (skip header row)
        const sum = newData.slice(1).reduce((acc, row) => {
          const cellValue = row[colIndex]?.value;
          const numValue = parseFloat(cellValue);
          return acc + (isNaN(numValue) ? 0 : numValue);
        }, 0);
        
        return { value: sum };
      });
      
      newData.push(sumRow);
    }
    
    return {
      operation: {
        type: 'sum',
        description: 'Added sum row for all numeric columns'
      },
      newData
    };
  }

  private static handleAverageOperation(_prompt: string, data: any[][]): { operation: ExcelOperation; newData: any[][] } {
    // Simple average implementation
    const newData = [...data];
    
    // Add an average row at the bottom (preserving headers)
    if (newData.length > 1) {
      const avgRow = newData[0].map((_, colIndex) => {
        if (colIndex === 0) return { value: 'AVERAGE' };
        
        // Calculate average only from data rows (skip header row)
        const numericRows = newData.slice(1).filter(row => {
          const cellValue = row[colIndex]?.value;
          return !isNaN(parseFloat(cellValue));
        });
        
        if (numericRows.length === 0) return { value: 0 };
        
        const sum = numericRows.reduce((acc, row) => {
          const cellValue = row[colIndex]?.value;
          return acc + parseFloat(cellValue);
        }, 0);
        
        const average = sum / numericRows.length;
        return { value: Math.round(average * 100) / 100 };
      });
      
      newData.push(avgRow);
    }
    
    return {
      operation: {
        type: 'average',
        description: 'Added average row for all numeric columns'
      },
      newData
    };
  }

  private static handleFilterOperation(prompt: string, data: any[][]): { operation: ExcelOperation; newData: any[][] } {
    const lowerPrompt = prompt.toLowerCase();
    const newData = [...data];
    
    // Extract filter conditions from prompt
    const greaterThanMatch = lowerPrompt.match(/>\s*([0-9]+)/);
    const lessThanMatch = lowerPrompt.match(/<\s*([0-9]+)/);
    const equalsMatch = lowerPrompt.match(/=\s*([a-z0-9]+)/i);
    
    if (greaterThanMatch) {
      const threshold = parseFloat(greaterThanMatch[1]);
      const filteredData = [newData[0]]; // Keep header
      
      // Filter rows where any numeric value is greater than threshold
      for (let i = 1; i < newData.length; i++) {
        const row = newData[i];
        const hasValueAboveThreshold = row.some(cell => {
          const numValue = parseFloat(cell?.value);
          return !isNaN(numValue) && numValue > threshold;
        });
        
        if (hasValueAboveThreshold) {
          filteredData.push(row);
        }
      }
      
      return {
        operation: {
          type: 'filter',
          description: `Filtered rows with values greater than ${threshold}`
        },
        newData: filteredData
      };
    }
    
    if (lessThanMatch) {
      const threshold = parseFloat(lessThanMatch[1]);
      const filteredData = [newData[0]]; // Keep header
      
      // Filter rows where any numeric value is less than threshold
      for (let i = 1; i < newData.length; i++) {
        const row = newData[i];
        const hasValueBelowThreshold = row.some(cell => {
          const numValue = parseFloat(cell?.value);
          return !isNaN(numValue) && numValue < threshold;
        });
        
        if (hasValueBelowThreshold) {
          filteredData.push(row);
        }
      }
      
      return {
        operation: {
          type: 'filter',
          description: `Filtered rows with values less than ${threshold}`
        },
        newData: filteredData
      };
    }
    
    if (equalsMatch) {
      const searchValue = equalsMatch[1];
      const filteredData = [newData[0]]; // Keep header
      
      // Filter rows containing the search value
      for (let i = 1; i < newData.length; i++) {
        const row = newData[i];
        const containsValue = row.some(cell => 
          cell?.value?.toString().toLowerCase().includes(searchValue.toLowerCase())
        );
        
        if (containsValue) {
          filteredData.push(row);
        }
      }
      
      return {
        operation: {
          type: 'filter',
          description: `Filtered rows containing "${searchValue}"`
        },
        newData: filteredData
      };
    }
    
    // Default: return original data
    return {
      operation: {
        type: 'filter',
        description: 'Filter operation requested (showing all data)'
      },
      newData: data
    };
  }

  private static handleSortOperation(prompt: string, data: any[][]): { operation: ExcelOperation; newData: any[][] } {
    const lowerPrompt = prompt.toLowerCase();
    const newData = [...data];
    
    // Extract column information from prompt
    const columnMatch = lowerPrompt.match(/column\s*([a-z]|[0-9]+)/i);
    const headingMatch = lowerPrompt.match(/heading\s+([a-z]+)/i) || lowerPrompt.match(/under\s+([a-z]+)/i);
    
    let colIndex = 0;
    
    if (columnMatch) {
      colIndex = this.parseColumnReference(columnMatch[1]);
    } else if (headingMatch && newData[0]) {
      // Find column by heading name
      const headingName = headingMatch[1].toLowerCase();
      colIndex = newData[0].findIndex(cell => 
        cell?.value?.toString().toLowerCase().includes(headingName)
      );
      if (colIndex === -1) colIndex = 0; // Default to first column if not found
    }
    
    if (newData.length > 1) {
      // Always treat first row as headers and sort from second row onwards
      const dataRows = newData.slice(1);
      
      dataRows.sort((a, b) => {
        const aValue = a[colIndex]?.value || '';
        const bValue = b[colIndex]?.value || '';
        
        // Try numeric comparison first
        const aNum = parseFloat(aValue);
        const bNum = parseFloat(bValue);
        
        if (!isNaN(aNum) && !isNaN(bNum)) {
          return aNum - bNum;
        }
        
        // Fall back to string comparison
        return aValue.toString().localeCompare(bValue.toString());
      });
      
      // Reconstruct the data with headers preserved
      newData.splice(1, dataRows.length, ...dataRows);
    }
    
    const columnName = this.getColumnName(colIndex);
    return {
      operation: {
        type: 'sort',
        description: `Sorted data by column ${columnName}`
      },
      newData
    };
  }

  private static handleColumnSpecificOperation(prompt: string, data: any[][]): { operation: ExcelOperation; newData: any[][] } {
    const lowerPrompt = prompt.toLowerCase();
    const newData = [...data];
    
    // Extract column information from prompt
    const columnMatch = lowerPrompt.match(/column\s*([a-z]|[0-9]+)/i);
    const headingMatch = lowerPrompt.match(/heading\s+([a-z]+)/i) || lowerPrompt.match(/under\s+([a-z]+)/i);
    
    let colIndex = 1;
    
    if (columnMatch) {
      colIndex = this.parseColumnReference(columnMatch[1]);
    } else if (headingMatch && newData[0]) {
      // Find column by heading name
      const headingName = headingMatch[1].toLowerCase();
      colIndex = newData[0].findIndex(cell => 
        cell?.value?.toString().toLowerCase().includes(headingName)
      );
      if (colIndex === -1) colIndex = 1; // Default to second column if not found
    }
    
    if (lowerPrompt.includes('sum') || lowerPrompt.includes('total')) {
      // Sum specific column
      if (newData.length > 1 && colIndex < newData[0].length) {
        // Sum only numeric values from data rows (skip header row)
        const sum = newData.slice(1).reduce((acc, row) => {
          const cellValue = row[colIndex]?.value;
          const numValue = parseFloat(cellValue);
          return acc + (isNaN(numValue) ? 0 : numValue);
        }, 0);
        
        // Add sum row
        const sumRow = newData[0].map((_, index) => 
          index === colIndex ? { value: sum } : { value: index === 0 ? 'SUM' : '' }
        );
        newData.push(sumRow);
        
        return {
          operation: {
            type: 'sum',
            description: `Added sum for column ${this.getColumnName(colIndex)}: ${sum}`
          },
          newData
        };
      }
    }
    
    if (lowerPrompt.includes('average') || lowerPrompt.includes('mean')) {
      // Average specific column
      if (newData.length > 1 && colIndex < newData[0].length) {
        // Calculate average only from data rows (skip header row)
        const numericRows = newData.slice(1).filter(row => {
          const cellValue = row[colIndex]?.value;
          return !isNaN(parseFloat(cellValue));
        });
        
        if (numericRows.length > 0) {
          const sum = numericRows.reduce((acc, row) => {
            const cellValue = row[colIndex]?.value;
            return acc + parseFloat(cellValue);
          }, 0);
          
          const average = sum / numericRows.length;
          
          // Add average row
          const avgRow = newData[0].map((_, index) => 
            index === colIndex ? { value: Math.round(average * 100) / 100 } : { value: index === 0 ? 'AVERAGE' : '' }
          );
          newData.push(avgRow);
          
          return {
            operation: {
              type: 'average',
              description: `Added average for column ${this.getColumnName(colIndex)}: ${Math.round(average * 100) / 100}`
            },
            newData
          };
        }
      }
    }
    
    return {
      operation: {
        type: 'custom',
        description: `Processed column operation: ${prompt}`
      },
      newData
    };
  }

  private static handleRowOperation(prompt: string, data: any[][]): { operation: ExcelOperation; newData: any[][] } {
    const lowerPrompt = prompt.toLowerCase();
    const newData = [...data];
    
    if (lowerPrompt.includes('add') || lowerPrompt.includes('insert')) {
      // Add a new row
      const newRow = newData[0].map(() => ({ value: '' }));
      newData.push(newRow);
      
      return {
        operation: {
          type: 'custom',
          description: 'Added a new row to the spreadsheet'
        },
        newData
      };
    }
    
    if (lowerPrompt.includes('delete') || lowerPrompt.includes('remove')) {
      // Remove last row (if it's not the header)
      if (newData.length > 1) {
        newData.pop();
        
        return {
          operation: {
            type: 'custom',
            description: 'Removed the last row from the spreadsheet'
          },
          newData
        };
      }
    }
    
    return {
      operation: {
        type: 'custom',
        description: `Processed row operation: ${prompt}`
      },
      newData
    };
  }

  private static handleFormulaOperation(prompt: string, data: any[][]): { operation: ExcelOperation; newData: any[][] } {
    const lowerPrompt = prompt.toLowerCase();
    const newData = [...data];
    
    if (lowerPrompt.includes('sum') || lowerPrompt.includes('total')) {
      // Add SUM formula to a new column
      
      // Add header for formula column
      newData.forEach((row, rowIndex) => {
        if (rowIndex === 0) {
          row.push({ value: 'SUM' });
        } else {
          // Calculate sum of numeric values in the row
          const sum = row.reduce((acc, cell) => {
            const numValue = parseFloat(cell?.value);
            return acc + (isNaN(numValue) ? 0 : numValue);
          }, 0);
          row.push({ value: sum });
        }
      });
      
      return {
        operation: {
          type: 'formula',
          description: 'Added SUM formula column to calculate row totals'
        },
        newData
      };
    }
    
    return {
      operation: {
        type: 'formula',
        description: `Processed formula operation: ${prompt}`
      },
      newData
    };
  }

  private static parseColumnReference(ref: string): number {
    // Convert column reference (A, B, C or 1, 2, 3) to 0-based index
    if (/^[a-z]$/i.test(ref)) {
      return ref.toUpperCase().charCodeAt(0) - 65; // A=0, B=1, C=2, etc.
    }
    return parseInt(ref) - 1; // 1=0, 2=1, 3=2, etc.
  }

  private static getColumnName(index: number): string {
    // Convert 0-based index to column name (A, B, C, etc.)
    return String.fromCharCode(65 + index);
  }
} 