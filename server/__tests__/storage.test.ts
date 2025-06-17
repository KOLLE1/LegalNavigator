import { storage } from '../storage';
import { insertUserSchema, insertChatSessionSchema, insertChatMessageSchema } from '../../shared/schema';

describe('Storage Layer Tests', () => {
  beforeEach(() => {
    // Reset storage state for each test
    (storage as any).users.clear();
    (storage as any).chatSessions.clear();
    (storage as any).chatMessages.clear();
    (storage as any).lawyers.clear();
    (storage as any).verificationCodes.clear();
  });

  describe('User Operations', () => {
    it('should create a new user', async () => {
      const userData = {
        email: 'test@example.com',
        name: 'Test User',
        passwordHash: 'hashedpassword123',
        isLawyer: false,
        twoFactorEnabled: false,
        emailVerified: false
      };

      const user = await storage.createUser(userData);
      
      expect(user.id).toBeDefined();
      expect(user.email).toBe(userData.email);
      expect(user.name).toBe(userData.name);
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
    });

    it('should retrieve user by email', async () => {
      const userData = {
        email: 'test@example.com',
        name: 'Test User',
        passwordHash: 'hashedpassword123',
        isLawyer: false,
        twoFactorEnabled: false,
        emailVerified: false
      };

      const createdUser = await storage.createUser(userData);
      const foundUser = await storage.getUserByEmail('test@example.com');
      
      expect(foundUser).toBeDefined();
      expect(foundUser?.id).toBe(createdUser.id);
    });

    it('should update user information', async () => {
      const userData = {
        email: 'test@example.com',
        name: 'Test User',
        passwordHash: 'hashedpassword123',
        isLawyer: false,
        twoFactorEnabled: false,
        emailVerified: false
      };

      const user = await storage.createUser(userData);
      const updatedUser = await storage.updateUser(user.id, {
        name: 'Updated Name',
        emailVerified: true
      });

      expect(updatedUser.name).toBe('Updated Name');
      expect(updatedUser.emailVerified).toBe(true);
      expect(updatedUser.updatedAt.getTime()).toBeGreaterThan(user.updatedAt.getTime());
    });
  });

  describe('Chat Operations', () => {
    it('should create chat session', async () => {
      const userData = {
        email: 'test@example.com',
        name: 'Test User',
        passwordHash: 'hashedpassword123',
        isLawyer: false,
        twoFactorEnabled: false,
        emailVerified: false
      };

      const user = await storage.createUser(userData);
      const sessionData = {
        userId: user.id,
        title: 'Legal Consultation',
        status: 'active'
      };

      const session = await storage.createChatSession(sessionData);
      
      expect(session.id).toBeDefined();
      expect(session.userId).toBe(user.id);
      expect(session.title).toBe('Legal Consultation');
      expect(session.status).toBe('active');
    });

    it('should create and retrieve chat messages', async () => {
      const userData = {
        email: 'test@example.com',
        name: 'Test User',
        passwordHash: 'hashedpassword123',
        isLawyer: false,
        twoFactorEnabled: false,
        emailVerified: false
      };

      const user = await storage.createUser(userData);
      const session = await storage.createChatSession({
        userId: user.id,
        title: 'Test Session',
        status: 'active'
      });

      const messageData = {
        sessionId: session.id,
        userId: user.id,
        content: 'What are my rights?',
        sender: 'user' as const
      };

      const message = await storage.createChatMessage(messageData);
      const messages = await storage.getChatMessages(session.id);

      expect(message.id).toBeDefined();
      expect(message.content).toBe('What are my rights?');
      expect(messages).toHaveLength(1);
      expect(messages[0].id).toBe(message.id);
    });
  });

  describe('Verification Code Operations', () => {
    it('should create and retrieve verification codes', async () => {
      const userData = {
        email: 'test@example.com',
        name: 'Test User',
        passwordHash: 'hashedpassword123',
        isLawyer: false,
        twoFactorEnabled: false,
        emailVerified: false
      };

      const user = await storage.createUser(userData);
      const codeData = {
        userId: user.id,
        code: '123456',
        type: 'email_verification',
        used: false,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      };

      const verificationCode = await storage.createVerificationCode(codeData);
      const retrievedCode = await storage.getVerificationCode(
        user.id, 
        'email_verification', 
        '123456'
      );

      expect(verificationCode.id).toBeDefined();
      expect(retrievedCode).toBeDefined();
      expect(retrievedCode?.code).toBe('123456');
      expect(retrievedCode?.used).toBe(false);
    });

    it('should mark verification code as used', async () => {
      const userData = {
        email: 'test@example.com',
        name: 'Test User',
        passwordHash: 'hashedpassword123',
        isLawyer: false,
        twoFactorEnabled: false,
        emailVerified: false
      };

      const user = await storage.createUser(userData);
      const codeData = {
        userId: user.id,
        code: '123456',
        type: 'email_verification',
        used: false,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      };

      const verificationCode = await storage.createVerificationCode(codeData);
      await storage.markVerificationCodeUsed(verificationCode.id);

      const retrievedCode = await storage.getVerificationCode(
        user.id, 
        'email_verification', 
        '123456'
      );

      expect(retrievedCode).toBeUndefined(); // Should not find used codes
    });
  });
});