// Simple LLM service that can be easily swapped with different providers
export class LLMService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    // You can use OpenAI, OpenRouter, or any other compatible API
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY || '';
    this.baseUrl = 'https://api.openai.com/v1';
  }

  async generateResponse(messages: Array<{role: string, content: string}>, systemPrompt?: string): Promise<string> {
    try {
      const requestMessages = [];
      
      if (systemPrompt) {
        requestMessages.push({ role: 'system', content: systemPrompt });
      }
      
      requestMessages.push(...messages);

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: requestMessages,
          max_tokens: 1000,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || 'I apologize, but I was unable to generate a response.';
    } catch (error) {
      console.error('LLM API Error:', error);
      return 'I apologize, but I encountered an error while processing your request. Please try again.';
    }
  }
}

export const llmService = new LLMService();