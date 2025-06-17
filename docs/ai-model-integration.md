# Custom AI Model Integration Guide

## Overview

The LawHelp application has been configured to work with your custom AI model instead of OpenAI. This guide shows you exactly where to integrate your model.

## Integration Steps

### 1. Implement Your Model Interface

Your AI model needs to implement the `CustomAIModel` interface defined in `server/ai-service.ts`:

```typescript
interface CustomAIModel {
  predict(prompt: string, options?: any): Promise<string>;
  categorize?(text: string): Promise<string>; // Optional method
}
```

### 2. Create Your Model Class

Create a new file `server/your-model.ts` (replace with your model name):

```typescript
import { CustomAIModel } from './ai-service';

export class YourCustomLegalModel implements CustomAIModel {
  private modelEndpoint: string;
  private apiKey?: string;

  constructor(config: { endpoint: string; apiKey?: string }) {
    this.modelEndpoint = config.endpoint;
    this.apiKey = config.apiKey;
  }

  async predict(prompt: string, options?: any): Promise<string> {
    try {
      // Replace this with your actual model API call
      const response = await fetch(this.modelEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
        },
        body: JSON.stringify({
          prompt: prompt,
          max_tokens: options?.max_tokens || 1000,
          temperature: options?.temperature || 0.7,
          language: options?.language || 'en'
        })
      });

      if (!response.ok) {
        throw new Error(`Model API error: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Adjust this based on your model's response format
      return data.text || data.response || data.output;
    } catch (error) {
      console.error('Error calling custom model:', error);
      throw new Error('Failed to get response from custom model');
    }
  }

  // Optional: Implement categorization if your model supports it
  async categorize(text: string): Promise<string> {
    const categoriesPrompt = `Categorize this legal question into one of these categories: Civil Law, Criminal Law, Business Law, Family Law, Labor Law, Property Law, Constitutional Law, Administrative Law, General Legal Information.\n\nQuestion: ${text}\n\nCategory:`;
    
    const response = await this.predict(categoriesPrompt);
    return response.trim();
  }
}
```

### 3. Initialize Your Model

In `server/index.ts` or wherever you initialize your services, add:

```typescript
import { aiLegalService } from './ai-service';
import { YourCustomLegalModel } from './your-model';

// Initialize your model
const customModel = new YourCustomLegalModel({
  endpoint: process.env.CUSTOM_MODEL_ENDPOINT || 'http://localhost:8000/predict',
  apiKey: process.env.CUSTOM_MODEL_API_KEY // Optional
});

// Set the model in the AI service
aiLegalService.setModel(customModel);
```

### 4. Environment Variables

Add these to your `.env` file:

```env
# Your Custom AI Model Configuration
CUSTOM_MODEL_ENDPOINT=http://your-model-api-endpoint.com/predict
CUSTOM_MODEL_API_KEY=your-api-key-if-needed

# Remove these OpenAI variables since they're no longer needed
# OPENAI_API_KEY=removed
```

## Integration Examples

### Example 1: Local Model Server

If you're running a local model server:

```typescript
const customModel = new YourCustomLegalModel({
  endpoint: 'http://localhost:8000/generate',
  // No API key needed for local models
});
```

### Example 2: Hugging Face Model

```typescript
export class HuggingFaceModel implements CustomAIModel {
  private apiKey: string;
  private modelName: string;

  constructor(config: { apiKey: string; modelName: string }) {
    this.apiKey = config.apiKey;
    this.modelName = config.modelName;
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
```

### Example 3: Custom REST API

```typescript
export class CustomRESTModel implements CustomAIModel {
  private baseUrl: string;
  private headers: Record<string, string>;

  constructor(config: { baseUrl: string; headers?: Record<string, string> }) {
    this.baseUrl = config.baseUrl;
    this.headers = config.headers || {};
  }

  async predict(prompt: string, options?: any): Promise<string> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.headers
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: prompt }],
        max_tokens: options?.max_tokens || 1000,
        temperature: options?.temperature || 0.7
      })
    });

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  }
}
```

## File Locations

Here's exactly where to place your files:

```
server/
├── ai-service.ts          # ✅ Already updated - no changes needed
├── your-model.ts          # 📍 CREATE THIS - Your model implementation
├── index.ts               # 📍 MODIFY THIS - Initialize your model
└── routes.ts              # ✅ Already working - no changes needed
```

## Testing Your Integration

1. **Start the application**: `npm run dev`
2. **Check the console**: You should see "Custom AI model has been set"
3. **Test via API**: Send a POST request to `/api/chat/ask` with:
   ```json
   {
     "question": "What are the requirements for business registration in Cameroon?",
     "language": "en"
   }
   ```

## Error Handling

The service includes comprehensive error handling:

- If your model is not set, users get a clear error message
- If your model API fails, the error is logged and a user-friendly message is returned
- The service automatically falls back to structured responses if your model doesn't return JSON

## Expected Model Response Format

Your model can return either:

1. **Plain Text**: The service will automatically structure it
2. **JSON Format** (recommended):
   ```json
   {
     "answer": "Detailed legal information about the question",
     "category": "Business Law",
     "confidence": 0.9,
     "references": ["Commercial Code of Cameroon", "Business Registration Law"],
     "disclaimer": "This is general legal information..."
   }
   ```

## Model Performance Considerations

- **Response Time**: Target under 3 seconds for good user experience
- **Concurrent Requests**: Ensure your model can handle multiple simultaneous requests
- **Rate Limiting**: Implement rate limiting if your model has usage limits
- **Caching**: Consider caching common legal questions for better performance

## Next Steps

1. Create your model implementation file
2. Initialize it in the server startup
3. Add your environment variables
4. Test the integration
5. Deploy and monitor performance

Your custom AI model is now fully integrated into the LawHelp legal assistant!