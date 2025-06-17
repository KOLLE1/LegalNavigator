import { beforeAll, afterAll, beforeEach, afterEach } from '@jest/globals';
import { db } from '../server/db-pg';

// Global test setup
beforeAll(async () => {
  // Set test environment
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL;
  
  // Initialize test database
  console.log('Setting up test database...');
});

afterAll(async () => {
  // Clean up database connections
  console.log('Cleaning up test database...');
});

beforeEach(async () => {
  // Clean up test data before each test
  // This ensures test isolation
});

afterEach(async () => {
  // Clean up any remaining test data
});

// Mock external services for testing
jest.mock('../server/ai-service', () => ({
  aiLegalService: {
    processLegalQuery: jest.fn().mockResolvedValue({
      answer: 'Test legal response',
      category: 'contract',
      confidence: 0.85,
      references: ['Test Reference 1'],
      disclaimer: 'This is a test response'
    }),
    categorizeQuery: jest.fn().mockResolvedValue('contract')
  }
}));

jest.mock('../server/2fa-service', () => ({
  twoFactorService: {
    generateTOTPSecret: jest.fn().mockResolvedValue({
      secret: 'test-secret',
      qrCodeUrl: 'test-qr-url',
      backupCodes: ['123456', '654321']
    }),
    verifyTOTP: jest.fn().mockReturnValue(true),
    generateEmailCode: jest.fn().mockReturnValue('123456'),
    sendEmailCode: jest.fn().mockResolvedValue(undefined),
    isValidEmailCode: jest.fn().mockReturnValue(true),
    isValidTOTPCode: jest.fn().mockReturnValue(true)
  }
}));

// Global test utilities
global.createTestUser = async () => {
  const testUser = {
    name: 'Test User',
    email: `test-${Date.now()}@example.com`,
    passwordHash: 'hashed-password',
    isLawyer: false,
    emailVerified: true
  };
  
  // Return test user data for use in tests
  return testUser;
};

global.createTestLawyer = async () => {
  const testLawyer = {
    name: 'Test Lawyer',
    email: `lawyer-${Date.now()}@example.com`,
    passwordHash: 'hashed-password',
    isLawyer: true,
    emailVerified: true,
    specialization: 'Contract Law',
    location: 'Yaoundé',
    licenseNumber: 'TEST123',
    experience: 5,
    rating: 4.5,
    languages: ['French', 'English']
  };
  
  return testLawyer;
};