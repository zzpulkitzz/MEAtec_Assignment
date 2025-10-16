import { Request, Response } from 'express';
import prisma from '../utils/prisma';

// Mark habit as completed for today
export const trackHabit = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const userId = req.user?.userId;

  try {
    // Verify habit belongs to user
    const habit = await prisma.habit.findFirst({
      where: {
        id: Number(id),
        userId: userId!,
      },
    });

    if (!habit) {
      res.status(404).json({ error: 'Habit not found' });
      return;
    }

    // Get today's date at midnight (start of day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if already tracked today
    const existingLog = await prisma.habitLog.findUnique({
      where: {
        habitId_date: {
            date: today,
          habitId: Number(id)
          
        },
      },
    });

    if (existingLog) {
      res.status(400).json({ error: 'Habit already tracked for today' });
      return;
    }

    // Create new log entry
    const log = await prisma.habitLog.create({
      data: {
        habitId: Number(id),
        date: today,
        completed: true,
      },
    });

    res.status(201).json({ 
      message: 'Habit tracked successfully', 
      log 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to track habit' });
  }
};

// Get last 7 days of habit tracking history
export const getHabitHistory = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const userId = req.user?.userId;

  try {
    // Verify habit belongs to user
    const habit = await prisma.habit.findFirst({
      where: {
        id: Number(id),
        userId: userId!,
      },
    });

    if (!habit) {
      res.status(404).json({ error: 'Habit not found' });
      return;
    }

    // Calculate date 7 days ago
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    // Fetch logs from last 7 days
    const logs = await prisma.habitLog.findMany({
      where: {
        habitId: Number(id),
        date: {
          gte: sevenDaysAgo,
        },
      },
      orderBy: {
        date: 'desc',
      },
    });

    res.status(200).json({ 
      habit: {
        id: habit.id,
        title: habit.title,
      },
      history: logs,
      count: logs.length 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch habit history' });
  }
};

// Calculate current streak for a habit (Bonus feature)
export const getHabitStreak = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const userId = req.user?.userId;

  try {
    // Verify habit belongs to user
    const habit = await prisma.habit.findFirst({
      where: {
        id: Number(id),
        userId: userId!,
      },
    });

    if (!habit) {
      res.status(404).json({ error: 'Habit not found' });
      return;
    }

    // Fetch all completed logs ordered by date descending
    const logs = await prisma.habitLog.findMany({
      where: {
        habitId: Number(id),
        completed: true,
      },
      orderBy: {
        date: 'desc',
      },
    });

    // Calculate current streak
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < logs.length; i++) {
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - i);
      expectedDate.setHours(0, 0, 0, 0);

      const logDate = new Date(logs[i].date);
      logDate.setHours(0, 0, 0, 0);

      if (logDate.getTime() === expectedDate.getTime()) {
        streak++;
      } else {
        break;
      }
    }

    res.status(200).json({
      habit: {
        id: habit.id,
        title: habit.title,
      },
      currentStreak: streak,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to calculate streak' });
  }
};
