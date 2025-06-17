import { aiLegalService } from '../ai-service';

// Mock OpenAI
jest.mock('openai', () => ({
  OpenAI: jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn()
      }
    }
  }))
}));

describe('AI Legal Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('processLegalQuery', () => {
    it('should process a legal query in English', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              answer: 'In Cameroon, civil cases follow specific procedures...',
              category: 'Civil Law',
              confidence: 0.9,
              references: ['Civil Procedure Code of Cameroon'],
              disclaimer: 'This is general legal information...'
            })
          }
        }]
      };

      const mockCreate = jest.fn().mockResolvedValue(mockResponse);
      const OpenAI = require('openai').OpenAI;
      OpenAI.mockImplementation(() => ({
        chat: {
          completions: {
            create: mockCreate
          }
        }
      }));

      const result = await aiLegalService.processLegalQuery({
        question: 'How do I file a civil case in Cameroon?',
        language: 'en'
      });

      expect(result.answer).toContain('civil cases');
      expect(result.category).toBe('Civil Law');
      expect(result.confidence).toBe(0.9);
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          model: expect.any(String),
          messages: expect.arrayContaining([
            expect.objectContaining({
              role: 'system'
            }),
            expect.objectContaining({
              role: 'user'
            })
          ])
        })
      );
    });

    it('should handle French language queries', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              answer: 'Au Cameroun, les procédures civiles...',
              category: 'Droit Civil',
              confidence: 0.85,
              references: ['Code de Procédure Civile du Cameroun'],
              disclaimer: 'Ceci est une information juridique générale...'
            })
          }
        }]
      };

      const mockCreate = jest.fn().mockResolvedValue(mockResponse);
      const OpenAI = require('openai').OpenAI;
      OpenAI.mockImplementation(() => ({
        chat: {
          completions: {
            create: mockCreate
          }
        }
      }));

      const result = await aiLegalService.processLegalQuery({
        question: 'Comment déposer une plainte civile au Cameroun?',
        language: 'fr'
      });

      expect(result.answer).toContain('procédures');
      expect(result.category).toBe('Droit Civil');
    });

    it('should categorize queries correctly', async () => {
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

      const mockResponse = {
        choices: [{
          message: {
            content: 'Business Law'
          }
        }]
      };

      const mockCreate = jest.fn().mockResolvedValue(mockResponse);
      const OpenAI = require('openai').OpenAI;
      OpenAI.mockImplementation(() => ({
        chat: {
          completions: {
            create: mockCreate
          }
        }
      }));

      const result = await aiLegalService.categorizeQuery('How to register a business in Cameroon?');
      expect(categories).toContain(result);
    });

    it('should handle API errors gracefully', async () => {
      const mockCreate = jest.fn().mockRejectedValue(new Error('API Error'));
      const OpenAI = require('openai').OpenAI;
      OpenAI.mockImplementation(() => ({
        chat: {
          completions: {
            create: mockCreate
          }
        }
      }));

      await expect(aiLegalService.processLegalQuery({
        question: 'Test question'
      })).rejects.toThrow('Failed to process legal query');
    });
  });
});