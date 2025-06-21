import { AIModelConfig } from '../types/googleSheets';

export class AIModelService {
  private config: AIModelConfig;

  constructor(config: AIModelConfig) {
    this.config = config;
  }

  async processPrompt(prompt: string): Promise<string> {
    try {
      switch (this.config.provider) {
        case 'openai':
          return await this.processOpenAI(prompt);
        case 'anthropic':
          return await this.processAnthropic(prompt);
        case 'google':
          return await this.processGoogle(prompt);
        case 'custom':
          return await this.processCustom(prompt);
        default:
          throw new Error(`Unsupported AI provider: ${this.config.provider}`);
      }
    } catch (error) {
      console.error('Error processing prompt:', error);
      throw error;
    }
  }

  private async processOpenAI(prompt: string): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: this.config.model || 'gpt-3.5-turbo',
        messages: [
          ...(this.config.systemPrompt ? [{ role: 'system', content: this.config.systemPrompt }] : []),
          { role: 'user', content: prompt }
        ],
        temperature: this.config.temperature || 0.7,
        max_tokens: this.config.maxTokens || 1000
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'No response generated';
  }

  private async processAnthropic(prompt: string): Promise<string> {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': this.config.apiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: this.config.model || 'claude-3-sonnet-20240229',
        max_tokens: this.config.maxTokens || 1000,
        messages: [
          { role: 'user', content: prompt }
        ],
        system: this.config.systemPrompt
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Anthropic API error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.content[0]?.text || 'No response generated';
  }

  private async processGoogle(prompt: string): Promise<string> {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${this.config.model || 'gemini-pro'}:generateContent?key=${this.config.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: this.config.systemPrompt ? `${this.config.systemPrompt}\n\n${prompt}` : prompt
          }]
        }],
        generationConfig: {
          temperature: this.config.temperature || 0.7,
          maxOutputTokens: this.config.maxTokens || 1000
        }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Google AI API error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.candidates[0]?.content?.parts[0]?.text || 'No response generated';
  }

  private async processCustom(prompt: string): Promise<string> {
    // For custom API endpoints
    const response = await fetch(this.config.apiKey, { // Using apiKey as endpoint URL for custom
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt,
        model: this.config.model,
        temperature: this.config.temperature,
        max_tokens: this.config.maxTokens,
        system_prompt: this.config.systemPrompt
      })
    });

    if (!response.ok) {
      throw new Error(`Custom API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.response || data.text || data.content || 'No response generated';
  }

  async validateConfig(): Promise<{ valid: boolean; error?: string }> {
    try {
      // Test with a simple prompt
      const testPrompt = 'Hello, this is a test. Please respond with "Test successful".';
      const response = await this.processPrompt(testPrompt);
      
      return {
        valid: response.length > 0,
        error: response.length === 0 ? 'No response received from AI model' : undefined
      };
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}