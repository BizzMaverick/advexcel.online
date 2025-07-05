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
    const rowCount = data.length;
    const colCount = data[0]?.length || 0;
    
    return `Spreadsheet with ${rowCount} rows and ${colCount} columns. Headers: ${headers.join(', ')}`;
  }

  private static handleCommonOperations(prompt: string, data: any[][]): { operation: ExcelOperation; newData: any[][] } {
    const lowerPrompt = prompt.toLowerCase();
    
    // Handle sum operations
    if (lowerPrompt.includes('sum') || lowerPrompt.includes('total')) {
      return this.handleSumOperation(prompt, data);
    }
    
    // Handle average operations
    if (lowerPrompt.includes('average') || lowerPrompt.includes('mean')) {
      return this.handleAverageOperation(prompt, data);
    }
    
    // Handle filter operations
    if (lowerPrompt.includes('filter') || lowerPrompt.includes('show only')) {
      return this.handleFilterOperation(prompt, data);
    }
    
    // Handle sort operations
    if (lowerPrompt.includes('sort') || lowerPrompt.includes('order')) {
      return this.handleSortOperation(prompt, data);
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

  private static handleSumOperation(prompt: string, data: any[][]): { operation: ExcelOperation; newData: any[][] } {
    // Simple sum implementation
    const newData = [...data];
    
    // Add a sum row at the bottom
    if (newData.length > 1) {
      const sumRow = newData[0].map((_, colIndex) => {
        if (colIndex === 0) return { value: 'SUM' };
        
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

  private static handleAverageOperation(prompt: string, data: any[][]): { operation: ExcelOperation; newData: any[][] } {
    // Simple average implementation
    const newData = [...data];
    
    // Add an average row at the bottom
    if (newData.length > 1) {
      const avgRow = newData[0].map((_, colIndex) => {
        if (colIndex === 0) return { value: 'AVERAGE' };
        
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
    // Simple filter implementation - keep all data for now
    return {
      operation: {
        type: 'filter',
        description: 'Filter operation requested (showing all data)'
      },
      newData: data
    };
  }

  private static handleSortOperation(prompt: string, data: any[][]): { operation: ExcelOperation; newData: any[][] } {
    // Simple sort implementation - sort by first column
    const newData = [...data];
    
    if (newData.length > 1) {
      const headerRow = newData[0];
      const dataRows = newData.slice(1);
      
      dataRows.sort((a, b) => {
        const aValue = a[0]?.value || '';
        const bValue = b[0]?.value || '';
        return aValue.toString().localeCompare(bValue.toString());
      });
      
      newData.splice(1, dataRows.length, ...dataRows);
    }
    
    return {
      operation: {
        type: 'sort',
        description: 'Sorted data by first column'
      },
      newData
    };
  }
} 