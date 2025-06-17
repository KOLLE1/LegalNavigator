import request from 'supertest';
import express from 'express';
import { registerRoutes } from '../../routes';
import { storage } from '../../storage';
import bcrypt from 'bcrypt';

describe('Routes Integration Tests', () => {
  let app: express.Express;
  let server: any;

  beforeAll(async () => {
    app = express();
    app.use(express.json());
    server = await registerRoutes(app);
  });

  afterAll(async () => {
    if (server) {
      server.close();
    }
  });

  beforeEach(async () => {
    // Clear storage before each test
    jest.clearAllMocks();
  });

  describe('Authentication Routes', () => {
    it('should register a new user', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      };

      const response = await request(app)
        .post('/api/register')
        .send(userData)
        .expect(201);

      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user.name).toBe(userData.name);
      expect(response.body.user.id).toBeDefined();
      expect(response.body.user.password).toBeUndefined();
    });

    it('should not register user with existing email', async () => {
      const userData = {
        email: 'existing@example.com',
        password: 'password123',
        name: 'Existing User'
      };

      // Create user first
      await storage.createUser({
        ...userData,
        password: await bcrypt.hash(userData.password, 10),
        isLawyer: false,
        emailVerified: false,
        twoFactorEnabled: false
      });

      // Try to create again
      const response = await request(app)
        .post('/api/register')
        .send(userData)
        .expect(400);

      expect(response.body.message).toContain('already exists');
    });

    it('should login with valid credentials', async () => {
      const userData = {
        email: 'login@example.com',
        password: 'password123',
        name: 'Login User'
      };

      // Create user first
      await storage.createUser({
        ...userData,
        password: await bcrypt.hash(userData.password, 10),
        isLawyer: false,
        emailVerified: true,
        twoFactorEnabled: false
      });

      const response = await request(app)
        .post('/api/login')
        .send({
          email: userData.email,
          password: userData.password
        })
        .expect(200);

      expect(response.body.token).toBeDefined();
      expect(response.body.user.email).toBe(userData.email);
    });

    it('should reject login with invalid credentials', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body.message).toContain('Invalid credentials');
    });
  });

  describe('Health Check Routes', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.status).toBe('healthy');
      expect(response.body.timestamp).toBeDefined();
    });

    it('should return metrics', async () => {
      const response = await request(app)
        .get('/metrics')
        .expect(200);

      expect(response.text).toContain('# HELP');
      expect(response.text).toContain('# TYPE');
    });
  });
});