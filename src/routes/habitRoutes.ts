import { Router } from 'express';
import {
  createHabit,
  getAllHabits,
  getHabitById,
  updateHabit,
  deleteHabit,
} from '../controllers/habitController';
import {
  trackHabit,
  getHabitHistory,
  getHabitStreak,
} from '../controllers/trackingController';

const router = Router();

// Habit CRUD routes
router.post('/', createHabit);
router.get('/', getAllHabits);
router.get('/:id', getHabitById);
router.put('/:id', updateHabit);
router.delete('/:id', deleteHabit);

// Habit tracking routes
router.post('/:id/track', trackHabit);
router.get('/:id/history', getHabitHistory);
router.get('/:id/streak', getHabitStreak); // Bonus feature

export default router;
