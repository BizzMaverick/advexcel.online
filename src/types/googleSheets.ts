export interface GoogleSheetsConfig {
  spreadsheetId: string;
  worksheetName: string;
  promptColumn: string;
  outputColumn: string;
  apiKey: string;
  clientId?: string;
  clientSecret?: string;
}

export interface AIModelConfig {
  provider: 'openai' | 'anthropic' | 'google' | 'custom';
  model: string;
  apiKey: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

export interface ProcessingResult {
  totalRows: number;
  processedRows: number;
  successfulUpdates: number;
  errors: ProcessingError[];
  startTime: Date;
  endTime: Date;
  duration: number;
}

export interface ProcessingError {
  row: number;
  error: string;
  prompt?: string;
  timestamp: Date;
}

export interface SheetRow {
  row: number;
  prompt: string;
  response?: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
}

export interface BatchProcessingOptions {
  batchSize: number;
  delayBetweenBatches: number;
  maxRetries: number;
  skipEmptyPrompts: boolean;
  overwriteExisting: boolean;
}