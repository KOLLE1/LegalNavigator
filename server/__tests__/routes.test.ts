import request from 'supertest';
import express from 'express';
import { registerRoutes } from '../routes';
import { storage } from '../storage';
import bcrypt from 'bcrypt';

describe('API Routes Integration Tests', () => {
  let app: express.Application;
  let server: any;

  beforeAll(async () => {
    app = express();
    app.use(express.json());
    server = await registerRoutes(app);
  });

  beforeEach(() => {
    // Reset storage state for each test
    (storage as any).users.clear();
    (storage as any).chatSessions.clear();
    (storage as any).chatMessages.clear();
    (storage as any).verificationCodes.clear();
  });

  afterAll(() => {
    server?.close();
  });

  describe('Authentication Routes', () => {
    describe('POST /api/auth/register', () => {
      it('should register a new user successfully', async () => {
        const userData = {
          email: 'test@example.com',
          name: 'Test User',
          passwordHash: 'password123'
        };

        const response = await request(app)
          .post('/api/auth/register')
          .send(userData)
          .expect(201);

        expect(response.body.message).toContain('registered successfully');
        expect(response.body.userId).toBeDefined();
      });

      it('should reject duplicate email registration', async () => {
        const userData = {
          email: 'test@example.com',
          name: 'Test User',
          passwordHash: 'password123'
        };

        // First registration
        await request(app)
          .post('/api/auth/register')
          .send(userData)
          .expect(201);

        // Second registration with same email
        await request(app)
          .post('/api/auth/register')
          .send(userData)
          .expect(400);
      });

      it('should validate required fields', async () => {
        const incompleteData = {
          email: 'test@example.com'
          // Missing name and password
        };

        await request(app)
          .post('/api/auth/register')
          .send(incompleteData)
          .expect(400);
      });
    });

    describe('POST /api/auth/login', () => {
      beforeEach(async () => {
        // Create a test user
        const passwordHash = await bcrypt.hash('password123', 12);
        await storage.createUser({
          email: 'test@example.com',
          name: 'Test User',
          passwordHash,
          isLawyer: false,
          twoFactorEnabled: false,
          emailVerified: true
        });
      });

      it('should login with valid credentials', async () => {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            email: 'test@example.com',
            password: 'password123'
          })
          .expect(200);

        expect(response.body.token).toBeDefined();
        expect(response.body.user).toBeDefined();
        expect(response.body.user.email).toBe('test@example.com');
      });

      it('should reject invalid credentials', async () => {
        await request(app)
          .post('/api/auth/login')
          .send({
            email: 'test@example.com',
            password: 'wrongpassword'
          })
          .expect(401);
      });

      it('should reject non-existent user', async () => {
        await request(app)
          .post('/api/auth/login')
          .send({
            email: 'nonexistent@example.com',
            password: 'password123'
          })
          .expect(401);
      });
    });
  });

  describe('Chat Routes', () => {
    let authToken: string;
    let userId: string;

    beforeEach(async () => {
      // Create and login a test user
      const passwordHash = await bcrypt.hash('password123', 12);
      const user = await storage.createUser({
        email: 'test@example.com',
        name: 'Test User',
        passwordHash,
        isLawyer: false,
        twoFactorEnabled: false,
        emailVerified: true
      });
      userId = user.id;

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      authToken = loginResponse.body.token;
    });

    describe('POST /api/chat/sessions', () => {
      it('should create a new chat session', async () => {
        const response = await request(app)
          .post('/api/chat/sessions')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            title: 'Legal Consultation'
          })
          .expect(201);

        expect(response.body.id).toBeDefined();
        expect(response.body.title).toBe('Legal Consultation');
        expect(response.body.userId).toBe(userId);
      });

      it('should require authentication', async () => {
        await request(app)
          .post('/api/chat/sessions')
          .send({
            title: 'Legal Consultation'
          })
          .expect(401);
      });
    });

    describe('GET /api/chat/sessions', () => {
      it('should retrieve user chat sessions', async () => {
        // Create a chat session first
        await storage.createChatSession({
          userId,
          title: 'Test Session',
          status: 'active'
        });

        const response = await request(app)
          .get('/api/chat/sessions')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body).toHaveLength(1);
        expect(response.body[0].title).toBe('Test Session');
      });
    });
  });

  describe('AI Legal Query Route', () => {
    let authToken: string;

    beforeEach(async () => {
      // Create and login a test user
      const passwordHash = await bcrypt.hash('password123', 12);
      await storage.createUser({
        email: 'test@example.com',
        name: 'Test User',
        passwordHash,
        isLawyer: false,
        twoFactorEnabled: false,
        emailVerified: true
      });

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      authToken = loginResponse.body.token;
    });

    describe('POST /api/ai/legal-query', () => {
      it('should process legal query', async () => {
        const response = await request(app)
          .post('/api/ai/legal-query')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            question: 'What are the requirements for marriage in Cameroon?',
            language: 'en'
          })
          .expect(200);

        expect(response.body.answer).toBeDefined();
        expect(response.body.category).toBeDefined();
        expect(response.body.confidence).toBeDefined();
        expect(response.body.disclaimer).toBeDefined();
      });

      it('should require authentication', async () => {
        await request(app)
          .post('/api/ai/legal-query')
          .send({
            question: 'What are the requirements for marriage in Cameroon?'
          })
          .expect(401);
      });

      it('should validate query format', async () => {
        await request(app)
          .post('/api/ai/legal-query')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            // Missing question field
            language: 'en'
          })
          .expect(400);
      });
    });
  });

  describe('Lawyer Directory Routes', () => {
    let authToken: string;
    let userId: string;

    beforeEach(async () => {
      // Create and login a test user
      const passwordHash = await bcrypt.hash('password123', 12);
      const user = await storage.createUser({
        email: 'lawyer@example.com',
        name: 'Test Lawyer',
        passwordHash,
        isLawyer: true,
        twoFactorEnabled: false,
        emailVerified: true
      });
      userId = user.id;

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'lawyer@example.com',
          password: 'password123'
        });

      authToken = loginResponse.body.token;
    });

    describe('GET /api/lawyers', () => {
      beforeEach(async () => {
        // Create a lawyer profile
        await storage.createLawyer({
          userId,
          licenseNumber: 'LAW123456',
          specialization: 'Criminal Law',
          experienceYears: 5,
          practiceAreas: ['Criminal Defense', 'Civil Rights'],
          languages: ['English', 'French'],
          verified: true,
          rating: 450,
          totalReviews: 10
        });
      });

      it('should retrieve lawyers list', async () => {
        const response = await request(app)
          .get('/api/lawyers')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body).toHaveLength(1);
        expect(response.body[0].specialization).toBe('Criminal Law');
        expect(response.body[0].user).toBeDefined();
      });

      it('should filter lawyers by specialization', async () => {
        const response = await request(app)
          .get('/api/lawyers?specialization=Criminal')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body).toHaveLength(1);
        expect(response.body[0].specialization).toContain('Criminal');
      });
    });
  });
});