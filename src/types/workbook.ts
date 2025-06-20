export interface WorksheetData {
  name: string;
  cells: { [key: string]: Cell };
  isActive: boolean;
  rowCount: number;
  columnCount: number;
}

export interface WorkbookData {
  id: string;
  name: string;
  worksheets: WorksheetData[];
  activeWorksheet: string;
  createdAt: Date;
  lastModified: Date;
}

export interface DocumentConversion {
  originalFormat: 'pdf' | 'docx' | 'doc' | 'txt';
  convertedData: WorkbookData;
  conversionLog: string[];
  success: boolean;
}

import { Cell } from './spreadsheet';