import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key",
});

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

export class AILegalService {
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

  async processLegalQuery(query: LegalQuery): Promise<LegalResponse> {
    try {
      const prompt = this.buildPrompt(query);
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: this.cameroonLawContext,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
        max_tokens: 1500,
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      
      return {
        answer: result.answer || "I apologize, but I couldn't generate a proper response to your legal question.",
        category: result.category || "General Legal",
        confidence: Math.max(0, Math.min(1, result.confidence || 0.7)),
        references: result.references || [],
        disclaimer: result.disclaimer || "This information is for general guidance only and does not constitute legal advice. Please consult with a qualified Cameroon lawyer for your specific situation.",
      };
    } catch (error) {
      console.error("AI Legal Service Error:", error);
      
      return {
        answer: "I apologize, but I'm experiencing technical difficulties. Please try again later or consult with a qualified lawyer directly.",
        category: "System Error",
        confidence: 0,
        references: [],
        disclaimer: "This system is currently unavailable. Please seek professional legal advice for your questions.",
      };
    }
  }

  private buildPrompt(query: LegalQuery): string {
    const language = query.language === 'fr' ? 'French' : 'English';
    
    return `
Please provide legal information about the following question related to Cameroon law. 

Question: "${query.question}"
${query.context ? `Additional Context: "${query.context}"` : ''}

Respond in ${language} and format your response as JSON with these exact fields:
{
  "answer": "Detailed legal information addressing the question (3-5 paragraphs)",
  "category": "Primary legal category (e.g., Criminal Law, Family Law, Property Law, Business Law, Employment Law)",
  "confidence": 0.8,
  "references": ["List of relevant Cameroon legal codes or articles"],
  "disclaimer": "Clear disclaimer that this is general information, not legal advice"
}

Focus on:
1. Accurate information based on Cameroon law
2. Practical steps or procedures when applicable
3. Required documents or legal requirements
4. Relevant legal codes and articles
5. Clear explanation of rights and obligations

Always include the standard disclaimer about seeking professional legal advice.
`;
  }

  async categorizeQuery(question: string): Promise<string> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "Categorize this legal question into one of these categories: Criminal Law, Family Law, Property Law, Business Law, Employment Law, Constitutional Law, or General Legal. Respond with just the category name.",
          },
          {
            role: "user",
            content: question,
          },
        ],
        temperature: 0.1,
        max_tokens: 20,
      });

      return response.choices[0].message.content?.trim() || "General Legal";
    } catch (error) {
      console.error("Query categorization error:", error);
      return "General Legal";
    }
  }
}

export const aiLegalService = new AILegalService();
