import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { storage } from '../../server/storage-pg';
import { nanoid } from 'nanoid';

describe('Storage Layer', () => {
  let testUserId: string;
  let testChatSessionId: string;

  beforeEach(() => {
    testUserId = nanoid();
    testChatSessionId = nanoid();
  });

  afterEach(async () => {
    // Clean up test data
  });

  describe('User Operations', () => {
    it('should create a new user', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        passwordHash: 'hashed_password',
        isLawyer: false
      };

      const user = await storage.createUser(userData);
      
      expect(user).toBeDefined();
      expect(user.email).toBe(userData.email);
      expect(user.name).toBe(userData.name);
      expect(user.isLawyer).toBe(false);
    });

    it('should get user by email', async () => {
      const userData = {
        name: 'Test User',
        email: 'unique@example.com',
        passwordHash: 'hashed_password',
        isLawyer: false
      };

      await storage.createUser(userData);
      const user = await storage.getUserByEmail(userData.email);
      
      expect(user).toBeDefined();
      expect(user?.email).toBe(userData.email);
    });

    it('should update user information', async () => {
      const userData = {
        name: 'Test User',
        email: 'update@example.com',
        passwordHash: 'hashed_password',
        isLawyer: false
      };

      const user = await storage.createUser(userData);
      const updatedUser = await storage.updateUser(user.id, {
        name: 'Updated Name',
        emailVerified: true
      });

      expect(updatedUser.name).toBe('Updated Name');
      expect(updatedUser.emailVerified).toBe(true);
    });
  });

  describe('Chat Operations', () => {
    it('should create a chat session', async () => {
      const userData = {
        name: 'Test User',
        email: 'chat@example.com',
        passwordHash: 'hashed_password',
        isLawyer: false
      };

      const user = await storage.createUser(userData);
      const sessionData = {
        userId: user.id,
        title: 'Test Legal Question'
      };

      const session = await storage.createChatSession(sessionData);

      expect(session).toBeDefined();
      expect(session.userId).toBe(user.id);
      expect(session.title).toBe(sessionData.title);
    });

    it('should create chat messages', async () => {
      const userData = {
        name: 'Test User',
        email: 'chatmsg@example.com',
        passwordHash: 'hashed_password',
        isLawyer: false
      };

      const user = await storage.createUser(userData);
      const session = await storage.createChatSession({
        userId: user.id,
        title: 'Test Session'
      });

      const messageData = {
        sessionId: session.id,
        content: 'What are my rights in a contract dispute?',
        role: 'user' as const
      };

      const message = await storage.createChatMessage(messageData);

      expect(message).toBeDefined();
      expect(message.content).toBe(messageData.content);
      expect(message.role).toBe('user');
    });

    it('should retrieve chat messages for a session', async () => {
      const userData = {
        name: 'Test User',
        email: 'retrieve@example.com',
        passwordHash: 'hashed_password',
        isLawyer: false
      };

      const user = await storage.createUser(userData);
      const session = await storage.createChatSession({
        userId: user.id,
        title: 'Test Session'
      });

      await storage.createChatMessage({
        sessionId: session.id,
        content: 'User message',
        role: 'user'
      });

      await storage.createChatMessage({
        sessionId: session.id,
        content: 'AI response',
        role: 'assistant'
      });

      const messages = await storage.getChatMessages(session.id);

      expect(messages).toHaveLength(2);
      expect(messages[0].content).toBe('User message');
      expect(messages[1].content).toBe('AI response');
    });
  });

  describe('Lawyer Operations', () => {
    it('should create a lawyer profile', async () => {
      const userData = {
        name: 'Test Lawyer',
        email: 'lawyer@example.com',
        passwordHash: 'hashed_password',
        isLawyer: true
      };

      const user = await storage.createUser(userData);
      const lawyerData = {
        userId: user.id,
        specialization: 'Contract Law',
        location: 'Yaoundé',
        licenseNumber: 'BAR12345',
        experience: 5,
        languages: ['French', 'English']
      };

      const lawyer = await storage.createLawyer(lawyerData);

      expect(lawyer).toBeDefined();
      expect(lawyer.specialization).toBe(lawyerData.specialization);
      expect(lawyer.location).toBe(lawyerData.location);
      expect(lawyer.experience).toBe(5);
    });

    it('should filter lawyers by specialization', async () => {
      // Create test lawyers with different specializations
      const contractLawyerUser = await storage.createUser({
        name: 'Contract Lawyer',
        email: 'contract@example.com',
        passwordHash: 'hash',
        isLawyer: true
      });

      const criminalLawyerUser = await storage.createUser({
        name: 'Criminal Lawyer',
        email: 'criminal@example.com',
        passwordHash: 'hash',
        isLawyer: true
      });

      await storage.createLawyer({
        userId: contractLawyerUser.id,
        specialization: 'Contract Law',
        location: 'Yaoundé',
        licenseNumber: 'BAR1',
        experience: 3,
        languages: ['French']
      });

      await storage.createLawyer({
        userId: criminalLawyerUser.id,
        specialization: 'Criminal Law',
        location: 'Douala',
        licenseNumber: 'BAR2',
        experience: 7,
        languages: ['English']
      });

      const contractLawyers = await storage.getLawyers({
        specialization: 'Contract Law'
      });

      expect(contractLawyers).toHaveLength(1);
      expect(contractLawyers[0].specialization).toBe('Contract Law');
    });
  });

  describe('Verification Operations', () => {
    it('should create and retrieve verification codes', async () => {
      const userData = {
        name: 'Test User',
        email: 'verify@example.com',
        passwordHash: 'hashed_password',
        isLawyer: false
      };

      const user = await storage.createUser(userData);
      const codeData = {
        userId: user.id,
        type: 'email_verification',
        code: '123456'
      };

      const verificationCode = await storage.createVerificationCode(codeData);

      expect(verificationCode).toBeDefined();
      expect(verificationCode.code).toBe(codeData.code);
      expect(verificationCode.type).toBe(codeData.type);

      const retrievedCode = await storage.getVerificationCode(
        user.id,
        'email_verification',
        '123456'
      );

      expect(retrievedCode).toBeDefined();
      expect(retrievedCode?.code).toBe('123456');
    });
  });

  describe('Performance Tests', () => {
    it('should handle concurrent user creation', async () => {
      const promises = Array.from({ length: 10 }, (_, i) =>
        storage.createUser({
          name: `User ${i}`,
          email: `user${i}@example.com`,
          passwordHash: 'hash',
          isLawyer: false
        })
      );

      const users = await Promise.all(promises);
      expect(users).toHaveLength(10);
      
      // Verify all users have unique IDs
      const ids = users.map(u => u.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(10);
    });
  });
});