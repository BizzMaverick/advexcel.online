import { GoogleSheetsService } from './googleSheetsService';
import { AIModelService } from './aiModelService';
import { 
  GoogleSheetsConfig, 
  AIModelConfig, 
  BatchProcessingOptions, 
  ProcessingResult, 
  ProcessingError, 
  SheetRow 
} from '../types/googleSheets';

export class BatchProcessor {
  private sheetsService: GoogleSheetsService;
  private aiService: AIModelService;
  private options: BatchProcessingOptions;
  private isProcessing = false;
  private shouldStop = false;

  constructor(
    sheetsConfig: GoogleSheetsConfig,
    aiConfig: AIModelConfig,
    options: BatchProcessingOptions
  ) {
    this.sheetsService = new GoogleSheetsService(sheetsConfig);
    this.aiService = new AIModelService(aiConfig);
    this.options = options;
  }

  async process(
    onProgress?: (progress: { processed: number; total: number; currentRow: number }) => void,
    onError?: (error: ProcessingError) => void
  ): Promise<ProcessingResult> {
    if (this.isProcessing) {
      throw new Error('Processing is already in progress');
    }

    this.isProcessing = true;
    this.shouldStop = false;

    const startTime = new Date();
    const errors: ProcessingError[] = [];
    let processedRows = 0;
    let successfulUpdates = 0;

    try {
      // Authenticate and get data
      const authenticated = await this.sheetsService.authenticate();
      if (!authenticated) {
        throw new Error('Failed to authenticate with Google Sheets');
      }

      const rows = await this.sheetsService.getSheetData();
      const totalRows = rows.length;

      // Filter rows based on options
      const rowsToProcess = rows.filter(row => {
        if (this.options.skipEmptyPrompts && !row.prompt.trim()) {
          return false;
        }
        if (!this.options.overwriteExisting && row.response) {
          return false;
        }
        return true;
      });

      // Process in batches
      for (let i = 0; i < rowsToProcess.length; i += this.options.batchSize) {
        if (this.shouldStop) break;

        const batch = rowsToProcess.slice(i, i + this.options.batchSize);
        const batchResults = await this.processBatch(batch);

        // Update progress
        processedRows += batch.length;
        successfulUpdates += batchResults.successful;
        errors.push(...batchResults.errors);

        // Report progress
        if (onProgress) {
          onProgress({
            processed: processedRows,
            total: rowsToProcess.length,
            currentRow: batch[batch.length - 1]?.row || 0
          });
        }

        // Report errors
        batchResults.errors.forEach(error => {
          if (onError) onError(error);
        });

        // Delay between batches to respect rate limits
        if (i + this.options.batchSize < rowsToProcess.length) {
          await this.delay(this.options.delayBetweenBatches);
        }
      }

      const endTime = new Date();
      return {
        totalRows,
        processedRows,
        successfulUpdates,
        errors,
        startTime,
        endTime,
        duration: endTime.getTime() - startTime.getTime()
      };

    } catch (error) {
      const processingError: ProcessingError = {
        row: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      };
      errors.push(processingError);

      const endTime = new Date();
      return {
        totalRows: 0,
        processedRows,
        successfulUpdates,
        errors,
        startTime,
        endTime,
        duration: endTime.getTime() - startTime.getTime()
      };
    } finally {
      this.isProcessing = false;
    }
  }

  private async processBatch(batch: SheetRow[]): Promise<{ successful: number; errors: ProcessingError[] }> {
    const errors: ProcessingError[] = [];
    let successful = 0;

    const updates: Array<{ row: number; column: string; value: string }> = [];

    // Process prompts in parallel within the batch
    const promises = batch.map(async (row) => {
      let retries = 0;
      
      while (retries <= this.options.maxRetries) {
        try {
          const response = await this.aiService.processPrompt(row.prompt);
          updates.push({
            row: row.row,
            column: this.getOutputColumnLetter(),
            value: response
          });
          return { success: true, row: row.row };
        } catch (error) {
          retries++;
          if (retries > this.options.maxRetries) {
            const processingError: ProcessingError = {
              row: row.row,
              error: error instanceof Error ? error.message : 'Unknown error',
              prompt: row.prompt,
              timestamp: new Date()
            };
            errors.push(processingError);
            return { success: false, row: row.row };
          }
          
          // Exponential backoff for retries
          await this.delay(Math.pow(2, retries) * 1000);
        }
      }
    });

    const results = await Promise.all(promises);
    successful = results.filter(r => r.success).length;

    // Batch update the sheet
    if (updates.length > 0) {
      try {
        await this.sheetsService.batchUpdateCells(updates);
      } catch (error) {
        // If batch update fails, try individual updates
        for (const update of updates) {
          try {
            await this.sheetsService.updateCell(update.row, update.column, update.value);
          } catch (individualError) {
            errors.push({
              row: update.row,
              error: `Failed to update cell: ${individualError instanceof Error ? individualError.message : 'Unknown error'}`,
              timestamp: new Date()
            });
            successful--;
          }
        }
      }
    }

    return { successful, errors };
  }

  private getOutputColumnLetter(): string {
    // This would need to be implemented based on the actual column mapping
    // For now, assuming it's provided in the configuration
    return 'B'; // Placeholder
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  stop(): void {
    this.shouldStop = true;
  }

  isRunning(): boolean {
    return this.isProcessing;
  }

  async validateConfiguration(): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    // Validate Google Sheets configuration
    const sheetsValidation = await this.sheetsService.validateConfig();
    if (!sheetsValidation.valid) {
      errors.push(...sheetsValidation.errors);
    }

    // Validate AI model configuration
    const aiValidation = await this.aiService.validateConfig();
    if (!aiValidation.valid) {
      errors.push(aiValidation.error || 'AI model validation failed');
    }

    // Validate processing options
    if (this.options.batchSize <= 0) {
      errors.push('Batch size must be greater than 0');
    }

    if (this.options.delayBetweenBatches < 0) {
      errors.push('Delay between batches cannot be negative');
    }

    if (this.options.maxRetries < 0) {
      errors.push('Max retries cannot be negative');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}