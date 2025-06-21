import { GoogleSheetsConfig, SheetRow, ProcessingError } from '../types/googleSheets';

export class GoogleSheetsService {
  private config: GoogleSheetsConfig;
  private accessToken: string | null = null;

  constructor(config: GoogleSheetsConfig) {
    this.config = config;
  }

  async authenticate(): Promise<boolean> {
    try {
      // For API key authentication (read-only access)
      if (this.config.apiKey && !this.config.clientId) {
        this.accessToken = this.config.apiKey;
        return true;
      }

      // For OAuth authentication (read-write access)
      if (this.config.clientId) {
        return await this.authenticateOAuth();
      }

      throw new Error('No authentication method provided');
    } catch (error) {
      console.error('Authentication failed:', error);
      return false;
    }
  }

  private async authenticateOAuth(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      // Load Google API
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => {
        (window as any).gapi.load('auth2', () => {
          (window as any).gapi.auth2.init({
            client_id: this.config.clientId
          }).then(() => {
            const authInstance = (window as any).gapi.auth2.getAuthInstance();
            
            if (authInstance.isSignedIn.get()) {
              this.accessToken = authInstance.currentUser.get().getAuthResponse().access_token;
              resolve(true);
            } else {
              authInstance.signIn({
                scope: 'https://www.googleapis.com/auth/spreadsheets'
              }).then(() => {
                this.accessToken = authInstance.currentUser.get().getAuthResponse().access_token;
                resolve(true);
              }).catch(reject);
            }
          }).catch(reject);
        });
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  async getSheetData(): Promise<SheetRow[]> {
    if (!this.accessToken) {
      throw new Error('Not authenticated');
    }

    try {
      const range = `${this.config.worksheetName}!A:Z`;
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.config.spreadsheetId}/values/${range}?key=${this.config.apiKey}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const rows = data.values || [];
      
      if (rows.length === 0) {
        throw new Error('No data found in worksheet');
      }

      // Find column indices
      const headers = rows[0];
      const promptColIndex = this.getColumnIndex(headers, this.config.promptColumn);
      const outputColIndex = this.getColumnIndex(headers, this.config.outputColumn);

      if (promptColIndex === -1) {
        throw new Error(`Prompt column '${this.config.promptColumn}' not found`);
      }

      if (outputColIndex === -1) {
        throw new Error(`Output column '${this.config.outputColumn}' not found`);
      }

      // Process rows
      const sheetRows: SheetRow[] = [];
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        const prompt = row[promptColIndex]?.trim() || '';
        const response = row[outputColIndex]?.trim() || '';
        
        if (prompt) {
          sheetRows.push({
            row: i + 1, // 1-based row number
            prompt,
            response,
            status: response ? 'completed' : 'pending'
          });
        }
      }

      return sheetRows;
    } catch (error) {
      console.error('Error reading sheet data:', error);
      throw error;
    }
  }

  async updateCell(row: number, column: string, value: string): Promise<boolean> {
    if (!this.accessToken) {
      throw new Error('Not authenticated');
    }

    try {
      const range = `${this.config.worksheetName}!${column}${row}`;
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.config.spreadsheetId}/values/${range}?valueInputOption=RAW`;
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          values: [[value]]
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Error updating cell:', error);
      return false;
    }
  }

  async batchUpdateCells(updates: Array<{ row: number; column: string; value: string }>): Promise<boolean> {
    if (!this.accessToken) {
      throw new Error('Not authenticated');
    }

    try {
      const requests = updates.map(update => ({
        range: `${this.config.worksheetName}!${update.column}${update.row}`,
        values: [[update.value]]
      }));

      const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.config.spreadsheetId}/values:batchUpdate`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          valueInputOption: 'RAW',
          data: requests
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Error batch updating cells:', error);
      return false;
    }
  }

  private getColumnIndex(headers: string[], columnName: string): number {
    return headers.findIndex(header => 
      header.toLowerCase().trim() === columnName.toLowerCase().trim()
    );
  }

  private columnNumberToLetter(columnNumber: number): string {
    let result = '';
    while (columnNumber > 0) {
      columnNumber--;
      result = String.fromCharCode(65 + (columnNumber % 26)) + result;
      columnNumber = Math.floor(columnNumber / 26);
    }
    return result;
  }

  async validateConfig(): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    if (!this.config.spreadsheetId) {
      errors.push('Spreadsheet ID is required');
    }

    if (!this.config.worksheetName) {
      errors.push('Worksheet name is required');
    }

    if (!this.config.promptColumn) {
      errors.push('Prompt column is required');
    }

    if (!this.config.outputColumn) {
      errors.push('Output column is required');
    }

    if (!this.config.apiKey && !this.config.clientId) {
      errors.push('API key or OAuth client ID is required');
    }

    // Test connection if config is valid
    if (errors.length === 0) {
      try {
        await this.authenticate();
        await this.getSheetData();
      } catch (error) {
        errors.push(`Connection test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}