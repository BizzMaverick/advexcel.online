import * as XLSX from 'xlsx';
import { Cell } from '../types/spreadsheet';
import { WorkbookData, WorksheetData, DocumentConversion } from '../types/workbook';

export class DocumentConverter {
  static async convertPdfToExcel(file: File): Promise<DocumentConversion> {
    const conversionLog: string[] = [];
    
    try {
      conversionLog.push('Starting PDF conversion...');
      
      // For demo purposes, we'll simulate PDF conversion with sample data
      const text = await this.extractTextFromPdf(file);
      conversionLog.push('Text extracted from PDF');
      
      const workbookData = this.textToWorkbook(text, file.name);
      conversionLog.push('Converted text to workbook format');
      
      return {
        originalFormat: 'pdf',
        convertedData: workbookData,
        conversionLog,
        success: true
      };
    } catch (error) {
      conversionLog.push(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw new Error('PDF conversion failed');
    }
  }

  static async convertWordToExcel(file: File): Promise<DocumentConversion> {
    const conversionLog: string[] = [];
    
    try {
      conversionLog.push('Starting Word document conversion...');
      
      // For demo purposes, we'll simulate Word conversion with sample data
      const text = await this.extractTextFromWord(file);
      conversionLog.push('Text extracted from Word document');
      
      const workbookData = this.textToWorkbook(text, file.name);
      conversionLog.push('Converted text to workbook format');
      
      return {
        originalFormat: file.name.endsWith('.docx') ? 'docx' : 'doc',
        convertedData: workbookData,
        conversionLog,
        success: true
      };
    } catch (error) {
      conversionLog.push(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw new Error('Word document conversion failed');
    }
  }

  private static async extractTextFromPdf(file: File): Promise<string> {
    // Simulate PDF text extraction with realistic sample data
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(`Sales Report - Q4 2024
Product,Sales,Region,Date,Revenue
Laptop,1200,North,2024-01-15,85000
Mouse,25,South,2024-01-16,1250
Keyboard,75,East,2024-01-17,5625
Monitor,300,West,2024-01-18,45000
Tablet,800,North,2024-01-19,64000
Smartphone,450,South,2024-01-20,67500
Headphones,120,East,2024-01-21,14400
Webcam,80,West,2024-01-22,8000
Speaker,200,North,2024-01-23,20000
Printer,150,South,2024-01-24,22500`);
      }, 1500);
    });
  }

  private static async extractTextFromWord(file: File): Promise<string> {
    // Simulate Word text extraction with realistic sample data
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(`Employee Performance Report
Employee,Department,Salary,Location,Performance Score
John Doe,Engineering,75000,New York,4.5
Jane Smith,Marketing,65000,Los Angeles,4.8
Bob Johnson,Sales,55000,Chicago,4.2
Alice Brown,HR,60000,Houston,4.6
Charlie Wilson,Finance,70000,Miami,4.3
Diana Davis,Engineering,78000,Seattle,4.7
Frank Miller,Marketing,62000,Boston,4.1
Grace Lee,Sales,58000,Denver,4.4
Henry Taylor,HR,63000,Phoenix,4.5
Ivy Chen,Finance,72000,Portland,4.6`);
      }, 1200);
    });
  }

  private static textToWorkbook(text: string, fileName: string): WorkbookData {
    const lines = text.split('\n').filter(line => line.trim());
    const cells: { [key: string]: Cell } = {};
    
    lines.forEach((line, rowIndex) => {
      const values = line.split(',').map(val => val.trim());
      values.forEach((value, colIndex) => {
        if (value) {
          const cellId = `${this.numberToColumn(colIndex + 1)}${rowIndex + 1}`;
          const numValue = Number(value);
          
          cells[cellId] = {
            id: cellId,
            row: rowIndex + 1,
            col: colIndex + 1,
            value: isNaN(numValue) ? value : numValue,
            type: isNaN(numValue) ? 'text' : 'number',
          };
        }
      });
    });

    const worksheet: WorksheetData = {
      name: 'Converted Data',
      cells,
      isActive: true,
      rowCount: lines.length,
      columnCount: Math.max(...lines.map(line => line.split(',').length))
    };

    return {
      id: Date.now().toString(),
      name: fileName.replace(/\.[^/.]+$/, '') + '_converted',
      worksheets: [worksheet],
      activeWorksheet: 'Converted Data',
      createdAt: new Date(),
      lastModified: new Date()
    };
  }

  private static numberToColumn(num: number): string {
    let result = '';
    while (num > 0) {
      num--;
      result = String.fromCharCode(65 + (num % 26)) + result;
      num = Math.floor(num / 26);
    }
    return result;
  }

  static getSupportedFormats(): string[] {
    return ['.pdf', '.doc', '.docx', '.txt'];
  }

  static isDocumentFile(filename: string): boolean {
    const extension = filename.toLowerCase().split('.').pop();
    return ['pdf', 'doc', 'docx', 'txt'].includes(extension || '');
  }

  static async convertTextToExcel(file: File): Promise<DocumentConversion> {
    const conversionLog: string[] = [];
    
    try {
      conversionLog.push('Reading text file...');
      
      const text = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const result = e.target?.result as string;
            resolve(result || '');
          } catch (error) {
            reject(error);
          }
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsText(file);
      });
      
      conversionLog.push('Text file read successfully');
      
      // If the text doesn't contain comma-separated data, create a simple structure
      let processedText = text;
      if (!text.includes(',')) {
        // Convert plain text to a simple table format
        const lines = text.split('\n').filter(line => line.trim());
        processedText = 'Line Number,Content\n' + 
          lines.map((line, index) => `${index + 1},"${line.replace(/"/g, '""')}"`).join('\n');
      }
      
      const workbookData = this.textToWorkbook(processedText, file.name);
      conversionLog.push('Converted text to workbook format');
      
      return {
        originalFormat: 'txt',
        convertedData: workbookData,
        conversionLog,
        success: true
      };
    } catch (error) {
      conversionLog.push(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw new Error('Text file conversion failed');
    }
  }
}