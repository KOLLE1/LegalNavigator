import { aiLegalService } from '../ai-service';

// Mock custom AI model
const mockCustomModel = {
  predict: jest.fn(),
  categorize: jest.fn()
};

describe('AI Legal Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Set up the mock model before each test
    aiLegalService.setModel(mockCustomModel);
  });

  describe('processLegalQuery', () => {
    it('should process a legal query in English', async () => {
      const mockResponse = JSON.stringify({
        answer: 'In Cameroon, civil cases follow specific procedures...',
        category: 'Civil Law',
        confidence: 0.9,
        references: ['Civil Procedure Code of Cameroon'],
        disclaimer: 'This is general legal information...'
      });

      mockCustomModel.predict.mockResolvedValue(mockResponse);

      const result = await aiLegalService.processLegalQuery({
        question: 'How do I file a civil case in Cameroon?',
        language: 'en'
      });

      expect(result.answer).toContain('civil cases');
      expect(result.category).toBe('Civil Law');
      expect(result.confidence).toBe(0.9);
      expect(mockCustomModel.predict).toHaveBeenCalledWith(
        expect.stringContaining('How do I file a civil case in Cameroon?'),
        expect.objectContaining({
          max_tokens: 1000,
          temperature: 0.7,
          language: 'en'
        })
      );
    });

    it('should handle French language queries', async () => {
      const mockResponse = JSON.stringify({
        answer: 'Au Cameroun, les procédures civiles...',
        category: 'Droit Civil',
        confidence: 0.85,
        references: ['Code de Procédure Civile du Cameroun'],
        disclaimer: 'Ceci est une information juridique générale...'
      });

      mockCustomModel.predict.mockResolvedValue(mockResponse);

      const result = await aiLegalService.processLegalQuery({
        question: 'Comment déposer une plainte civile au Cameroun?',
        language: 'fr'
      });

      expect(result.answer).toContain('procédures');
      expect(result.category).toBe('Droit Civil');
      expect(mockCustomModel.predict).toHaveBeenCalledWith(
        expect.stringContaining('Comment déposer une plainte civile au Cameroun?'),
        expect.objectContaining({
          language: 'fr'
        })
      );
    });

    it('should categorize queries correctly', async () => {
      mockCustomModel.categorize.mockResolvedValue('Business Law');

      const result = await aiLegalService.categorizeQuery('How to register a business in Cameroon?');
      
      expect(result).toBe('Business Law');
      expect(mockCustomModel.categorize).toHaveBeenCalledWith('How to register a business in Cameroon?');
    });

    it('should handle model errors gracefully', async () => {
      mockCustomModel.predict.mockRejectedValue(new Error('Model API Error'));

      await expect(aiLegalService.processLegalQuery({
        question: 'Test question'
      })).rejects.toThrow('Failed to process legal query with custom model');
    });

    it('should throw error when model is not set', async () => {
      // Create a new service without setting the model
      const { AILegalService } = require('../ai-service');
      const newService = new AILegalService();

      await expect(newService.processLegalQuery({
        question: 'Test question'
      })).rejects.toThrow('AI model not initialized');
    });

    it('should handle non-JSON responses from model', async () => {
      mockCustomModel.predict.mockResolvedValue('This is a plain text response about Cameroon law.');

      const result = await aiLegalService.processLegalQuery({
        question: 'Test question'
      });

      expect(result.answer).toBe('This is a plain text response about Cameroon law.');
      expect(result.category).toBe('General Legal Information');
      expect(result.confidence).toBe(0.8);
    });
  });
});