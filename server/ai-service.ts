interface LegalQuery {
  question: string;
  context?: string;
  language?: 'en' | 'fr';
}

interface LegalResponse {
  answer: string;
  category: string;
  confidence: number;
  references: string[];
  disclaimer: string;
}

interface CustomAIModel {
  predict(prompt: string, options?: any): Promise<string>;
  categorize?(text: string): Promise<string>;
}

export class AILegalService {
  private model: CustomAIModel | null = null;
  private readonly cameroonLawContext = `
You are a specialized AI legal assistant focused on Cameroon law. You provide accurate, helpful information about:

LEGAL DOMAINS:
- Criminal Law: Penal Code, criminal procedures, penalties
- Family Law: Marriage, divorce, inheritance, child custody
- Property Law: Land ownership, real estate, property rights
- Business Law: Company registration, contracts, commercial law
- Employment Law: Labor code, worker rights, employment contracts
- Constitutional Law: Citizens' rights, government procedures

IMPORTANT GUIDELINES:
1. Always specify that this is general legal information, not legal advice
2. Recommend consulting with a qualified Cameroon lawyer for specific cases
3. Reference relevant Cameroon legal codes when applicable
4. Be clear about legal procedures and requirements
5. Explain both English and French legal traditions where relevant (Cameroon's dual legal system)

LEGAL REFERENCES:
- Cameroon Civil Code
- Cameroon Penal Code
- Labor Code of Cameroon
- Commercial Code
- Constitution of Cameroon (1996)
`;

  constructor() {
    // Model will be initialized when setModel is called
    console.log('AI Legal Service initialized - waiting for custom model');
  }

  /**
   * Set your custom AI model
   * @param model Your custom AI model that implements the CustomAIModel interface
   */
  setModel(model: CustomAIModel) {
    this.model = model;
    console.log('Custom AI model has been set');
  }

  async processLegalQuery(query: LegalQuery): Promise<LegalResponse> {
    if (!this.model) {
      throw new Error('AI model not initialized. Please set your custom model using setModel() method.');
    }

    try {
      const prompt = this.buildPrompt(query);
      
      // Call your custom model
      const response = await this.model.predict(prompt, {
        max_tokens: 1000,
        temperature: 0.7,
        language: query.language || 'en'
      });

      // Parse the response (you may need to adjust this based on your model's output format)
      let parsedResponse: any;
      try {
        parsedResponse = JSON.parse(response);
      } catch {
        // If response is not JSON, create a structured response
        parsedResponse = {
          answer: response,
          category: 'General Legal Information',
          confidence: 0.8,
          references: ['Cameroon Legal System'],
          disclaimer: 'This is general legal information and not legal advice.'
        };
      }

      return {
        answer: parsedResponse.answer || response,
        category: parsedResponse.category || await this.categorizeQuery(query.question),
        confidence: parsedResponse.confidence || 0.8,
        references: parsedResponse.references || ['Cameroon Legal System'],
        disclaimer: parsedResponse.disclaimer || this.getDisclaimer(query.language)
      };
    } catch (error) {
      console.error('Error processing legal query:', error);
      throw new Error('Failed to process legal query with custom model');
    }
  }

  private buildPrompt(query: LegalQuery): string {
    const contextSection = query.context ? `\nContext: ${query.context}` : '';
    const languageInstruction = query.language === 'fr' 
      ? '\nPlease respond in French.' 
      : '\nPlease respond in English.';

    return `${this.cameroonLawContext}

USER QUESTION: ${query.question}${contextSection}${languageInstruction}

Please provide a comprehensive response in JSON format with the following structure:
{
  "answer": "detailed legal information",
  "category": "relevant legal category",
  "confidence": 0.8,
  "references": ["relevant legal codes or sources"],
  "disclaimer": "appropriate disclaimer"
}`;
  }

  async categorizeQuery(question: string): Promise<string> {
    if (!this.model) {
      return 'General Legal Information';
    }

    try {
      // Use the categorize method if available, otherwise use predict
      if (this.model.categorize) {
        return await this.model.categorize(question);
      } else {
        const categories = [
          'Civil Law',
          'Criminal Law', 
          'Business Law',
          'Family Law',
          'Labor Law',
          'Property Law',
          'Constitutional Law',
          'Administrative Law',
          'General Legal Information'
        ];

        const prompt = `Categorize this legal question into one of these categories: ${categories.join(', ')}\n\nQuestion: ${question}\n\nCategory:`;
        const response = await this.model.predict(prompt);
        
        // Extract the category from the response
        const category = categories.find(cat => 
          response.toLowerCase().includes(cat.toLowerCase())
        );
        
        return category || 'General Legal Information';
      }
    } catch (error) {
      console.error('Error categorizing query:', error);
      return 'General Legal Information';
    }
  }

  private getDisclaimer(language?: string): string {
    if (language === 'fr') {
      return 'Ceci est une information juridique générale et non un conseil juridique. Consultez un avocat qualifié au Cameroun pour des conseils juridiques spécifiques.';
    }
    return 'This is general legal information and not legal advice. Consult with a qualified lawyer in Cameroon for specific legal advice.';
  }
}

export const aiLegalService = new AILegalService();