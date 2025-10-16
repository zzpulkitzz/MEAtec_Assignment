import request from 'supertest';
import app from '../app';
import prisma from '../utils/prisma';

describe('Habit Management Endpoints', () => {
  let authToken: string;
  let userId: number;

  // Setup: Create user and get token before all tests
  beforeAll(async () => {
    await prisma.habitLog.deleteMany();
    await prisma.habit.deleteMany();
    await prisma.user.deleteMany();

    // Register and login
    const registerResponse = await request(app).post('/auth/register').send({
      name: 'Test User',
      email: 'habit@test.com',
      password: 'password123',
    });

    userId = registerResponse.body.userId;

    const loginResponse = await request(app).post('/auth/login').send({
      email: 'habit@test.com',
      password: 'password123',
    });

    authToken = loginResponse.body.token;
  });

  // Clean habits before each test
  beforeEach(async () => {
    await prisma.habitLog.deleteMany();
    await prisma.habit.deleteMany({ where: { userId } });
  });

  describe('POST /habits', () => {
    it('should create a new habit successfully', async () => {
      const response = await request(app)
        .post('/habits')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Morning Exercise',
          description: '30 minutes workout',
          frequency: 'DAILY',
          tags: ['health', 'fitness'],
        })
        .expect(201);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('habit');
      expect(response.body.habit.title).toBe('Morning Exercise');
      expect(response.body.habit.frequency).toBe('DAILY');
    });

    it('should fail without authentication token', async () => {
      const response = await request(app)
        .post('/habits')
        .send({
          title: 'Morning Exercise',
          frequency: 'DAILY',
        })
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    it('should fail with invalid frequency', async () => {
      const response = await request(app)
        .post('/habits')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Morning Exercise',
          frequency: 'MONTHLY', // Invalid
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Frequency must be DAILY or WEEKLY');
    });
  });

  describe('GET /habits', () => {
    beforeEach(async () => {
      // Create test habits
      await request(app).post('/habits').set('Authorization', `Bearer ${authToken}`).send({
        title: 'Habit 1',
        frequency: 'DAILY',
        tags: ['health'],
      });

      await request(app).post('/habits').set('Authorization', `Bearer ${authToken}`).send({
        title: 'Habit 2',
        frequency: 'WEEKLY',
        tags: ['work'],
      });
    });

    it('should get all habits for authenticated user', async () => {
      const response = await request(app)
        .get('/habits')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.data.length).toBe(2);
    });

    it('should filter habits by tag', async () => {
      const response = await request(app)
        .get('/habits?tag=health')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].title).toBe('Habit 1');
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/habits?page=1&limit=1')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.pagination.pageSize).toBe(1);
      expect(response.body.pagination.totalCount).toBe(2);
      expect(response.body.pagination.totalPages).toBe(2);
    });
  });

  describe('PUT /habits/:id', () => {
    let habitId: number;

    beforeEach(async () => {
      const response = await request(app)
        .post('/habits')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Original Habit',
          frequency: 'DAILY',
        });

      habitId = response.body.habit.id;
    });

    it('should update habit successfully', async () => {
      const response = await request(app)
        .put(`/habits/${habitId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Updated Habit',
          description: 'New description',
        })
        .expect(200);

      expect(response.body.habit.title).toBe('Updated Habit');
      expect(response.body.habit.description).toBe('New description');
    });

    it('should fail when updating non-existent habit', async () => {
      await request(app)
        .put('/habits/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Updated',
        })
        .expect(404);
    });
  });

  describe('DELETE /habits/:id', () => {
    let habitId: number;

    beforeEach(async () => {
      const response = await request(app)
        .post('/habits')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Habit to Delete',
          frequency: 'DAILY',
        });

      habitId = response.body.habit.id;
    });

    it('should delete habit successfully', async () => {
      await request(app)
        .delete(`/habits/${habitId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Verify it's deleted
      await request(app)
        .get(`/habits/${habitId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });
});
