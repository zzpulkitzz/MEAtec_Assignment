import request from 'supertest';
import app from '../app';
import prisma from '../utils/prisma';

describe('Authentication Endpoints', () => {
  // Clean up test data before each test
  beforeEach(async () => {
    await prisma.habitLog.deleteMany();
    await prisma.habit.deleteMany();
    await prisma.user.deleteMany();
  });

  describe('POST /auth/register', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
        })
        .expect(201);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('userId');
      expect(response.body.message).toBe('User registered successfully');
    });

    it('should fail when email already exists', async () => {
      // Create a user first
      await request(app).post('/auth/register').send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      });

      // Try to register with same email
      const response = await request(app)
        .post('/auth/register')
        .send({
          name: 'Another User',
          email: 'test@example.com',
          password: 'password456',
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Email already exists');
    });

    it('should fail when required fields are missing', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          name: 'Test User',
          // missing email and password
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Please provide all fields');
    });
  });

  describe('POST /auth/login', () => {
    beforeEach(async () => {
      // Create a test user before login tests
      await request(app).post('/auth/register').send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      });
    });

    it('should login successfully with correct credentials', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        })
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe('test@example.com');
    });

    it('should fail with incorrect password', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword',
        })
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Invalid credentials');
    });

    it('should fail with non-existent email', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123',
        })
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Invalid credentials');
    });
  });
});
