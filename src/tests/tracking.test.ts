import request from 'supertest';
import app from '../app';
import prisma from '../utils/prisma';

describe('Habit Tracking Endpoints', () => {
  let authToken: string;
  let userId: number;
  let habitId: number;

  beforeAll(async () => {
    await prisma.habitLog.deleteMany();
    await prisma.habit.deleteMany();
    await prisma.user.deleteMany();

    // Register user
    const registerResponse = await request(app).post('/auth/register').send({
      name: 'Tracker User',
      email: 'tracker@test.com',
      password: 'password123',
    });

    userId = registerResponse.body.userId;

    // Login
    const loginResponse = await request(app).post('/auth/login').send({
      email: 'tracker@test.com',
      password: 'password123',
    });

    authToken = loginResponse.body.token;

    // Create a habit
    const habitResponse = await request(app)
      .post('/habits')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Daily Reading',
        frequency: 'DAILY',
      });

    habitId = habitResponse.body.habit.id;
  });

  beforeEach(async () => {
    await prisma.habitLog.deleteMany({ where: { habitId } });
  });

  describe('POST /habits/:id/track', () => {
    it('should track habit completion successfully', async () => {
      const response = await request(app)
        .post(`/habits/${habitId}/track`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(201);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('log');
      expect(response.body.log.completed).toBe(true);
    });

    it('should prevent duplicate tracking for same day', async () => {
      // Track once
      await request(app)
        .post(`/habits/${habitId}/track`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(201);

      // Try to track again
      const response = await request(app)
        .post(`/habits/${habitId}/track`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(response.body.error).toBe('Habit already tracked for today');
    });

    it('should fail for non-existent habit', async () => {
      await request(app)
        .post('/habits/99999/track')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('GET /habits/:id/history', () => {
    it('should return habit history', async () => {
      // Track the habit
      await request(app)
        .post(`/habits/${habitId}/track`)
        .set('Authorization', `Bearer ${authToken}`);

      const response = await request(app)
        .get(`/habits/${habitId}/history`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('habit');
      expect(response.body).toHaveProperty('history');
      expect(response.body).toHaveProperty('count');
      expect(response.body.history.length).toBeGreaterThan(0);
    });
  });

  describe('GET /habits/:id/streak', () => {
    it('should calculate streak correctly', async () => {
      // Track the habit
      await request(app)
        .post(`/habits/${habitId}/track`)
        .set('Authorization', `Bearer ${authToken}`);

      const response = await request(app)
        .get(`/habits/${habitId}/streak`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('currentStreak');
      expect(response.body.currentStreak).toBeGreaterThanOrEqual(0);
    });
  });
});
