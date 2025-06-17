// Example implementation showing how to integrate your custom AI model
// Copy this file and modify it for your specific model

import { aiLegalService } from './ai-service';
import type { CustomAIModel } from './ai-service';

// Example 1: Local Model Server
export class LocalModelExample implements CustomAIModel {
  private endpoint: string;

  constructor(endpoint: string = 'http://localhost:8000/predict') {
    this.endpoint = endpoint;
  }

  async predict(prompt: string, options?: any): Promise<string> {
    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        max_tokens: options?.max_tokens || 1000,
        temperature: options?.temperature || 0.7,
        language: options?.language || 'en'
      })
    });

    if (!response.ok) {
      throw new Error(`Model request failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.response || data.text || data.output;
  }

  async categorize(text: string): Promise<string> {
    const prompt = `Categorize this legal question: ${text}\nCategory:`;
    const response = await this.predict(prompt);
    return response.trim();
  }
}

// Example 2: Hugging Face Model
export class HuggingFaceExample implements CustomAIModel {
  private apiKey: string;
  private modelName: string;

  constructor(apiKey: string, modelName: string = 'microsoft/DialoGPT-large') {
    this.apiKey = apiKey;
    this.modelName = modelName;
  }

  async predict(prompt: string, options?: any): Promise<string> {
    const response = await fetch(
      `https://api-inference.huggingface.co/models/${this.modelName}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_length: options?.max_tokens || 1000,
            temperature: options?.temperature || 0.7
          }
        })
      }
    );

    const data = await response.json();
    return data[0]?.generated_text || '';
  }
}

// Example 3: Custom REST API
export class CustomAPIExample implements CustomAIModel {
  private baseUrl: string;
  private apiKey?: string;

  constructor(baseUrl: string, apiKey?: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  async predict(prompt: string, options?: any): Promise<string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        messages: [{ role: 'user', content: prompt }],
        max_tokens: options?.max_tokens || 1000,
        temperature: options?.temperature || 0.7
      })
    });

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  }
}

// Initialize your model - UNCOMMENT AND MODIFY ONE OF THESE:

// Option 1: Local model
// const model = new LocalModelExample('http://localhost:8000/predict');

// Option 2: Hugging Face model
// const model = new HuggingFaceExample(process.env.HUGGINGFACE_API_KEY!);

// Option 3: Custom API
// const model = new CustomAPIExample(
//   process.env.CUSTOM_MODEL_URL!,
//   process.env.CUSTOM_MODEL_API_KEY
// );

// Set the model in the service
// aiLegalService.setModel(model);

export default {
  LocalModelExample,
  HuggingFaceExample,
  CustomAPIExample
};