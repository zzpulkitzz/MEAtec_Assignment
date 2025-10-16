import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { Frequency } from '@prisma/client';

// Create a new habit
export const createHabit = async (req: Request, res: Response): Promise<void> => {
  const { title, description, frequency, tags, reminderTime } = req.body;
  const userId = req.user?.userId;

  if (!title || !frequency) {
    res.status(400).json({ error: 'Title and frequency are required' });
    return;
  }

  if (!['DAILY', 'WEEKLY'].includes(frequency)) {
    res.status(400).json({ error: 'Frequency must be DAILY or WEEKLY' });
    return;
  }

  try {
    const habit = await prisma.habit.create({
      data: {
        title,
        description: description || null,
        frequency: frequency as Frequency,
        userId: userId!,
        tags: tags || [],
        reminderTime: reminderTime || null,
      },
    });

    res.status(201).json({ message: 'Habit created successfully', habit });
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Failed to create habit' });
  }
};

// Get all habits for the logged-in user
export const getAllHabits = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.userId;
    const { tag, page, limit } = req.query;
  
    // Parse and validate pagination parameters
    const pageNumber = parseInt(page as string) || 1;
    const pageSize = parseInt(limit as string) || 10;
  
    // Ensure positive values
    if (pageNumber < 1 || pageSize < 1) {
      res.status(400).json({ error: 'Page and limit must be positive numbers' });
      return;
    }
  
    // Calculate skip value
    const skip = (pageNumber - 1) * pageSize;
  
    try {
      // Build where clause
      const whereClause: any = {
        userId: userId!,
      };
  
      // Add tag filter if provided
      if (tag) {
        whereClause.tags = { has: tag as string };
      }
  
      // Get total count for pagination metadata
      const totalCount = await prisma.habit.count({
        where: whereClause,
      });
  
      // Fetch paginated habits
      const habits = await prisma.habit.findMany({
        where: whereClause,
        skip: skip,
        take: pageSize,
        include: {
          logs: {
            orderBy: {
              date: 'desc',
            },
            take: 7, // Include last 7 logs for quick overview
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
  
      // Calculate pagination metadata
      const totalPages = Math.ceil(totalCount / pageSize);
      const hasNextPage = pageNumber < totalPages;
      const hasPreviousPage = pageNumber > 1;
  
      res.status(200).json({
        data: habits,
        pagination: {
          currentPage: pageNumber,
          pageSize: pageSize,
          totalCount: totalCount,
          totalPages: totalPages,
          hasNextPage: hasNextPage,
          hasPreviousPage: hasPreviousPage,
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch habits' });
    }
  };

// Get a specific habit by ID
export const getHabitById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const userId = req.user?.userId;

  try {
    const habit = await prisma.habit.findFirst({
      where: {
        id: Number(id),
        userId: userId!,
      },
      include: {
        logs: true,
      },
    });

    if (!habit) {
      res.status(404).json({ error: 'Habit not found' });
      return;
    }

    res.status(200).json({ habit });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch habit' });
  }
};

// Update a habit
export const updateHabit = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { title, description, frequency, tags, reminderTime } = req.body;
  const userId = req.user?.userId;

  try {
    // Check if habit belongs to user
    const existingHabit = await prisma.habit.findFirst({
      where: {
        id: Number(id),
        userId: userId!,
      },
    });

    if (!existingHabit) {
      res.status(404).json({ error: 'Habit not found' });
      return;
    }

    const updatedHabit = await prisma.habit.update({
      where: { id: Number(id) },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(frequency && { frequency: frequency as Frequency }),
        ...(tags && { tags }),
        ...(reminderTime !== undefined && { reminderTime }),
      },
    });

    res.status(200).json({ message: 'Habit updated successfully', habit: updatedHabit });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update habit' });
  }
};

// Delete a habit
export const deleteHabit = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const userId = req.user?.userId;

  try {
    // Check if habit belongs to user
    const existingHabit = await prisma.habit.findFirst({
      where: {
        id: Number(id),
        userId: userId!,
      },
    });

    if (!existingHabit) {
      res.status(404).json({ error: 'Habit not found' });
      return;
    }

    await prisma.habit.delete({
      where: { id: Number(id) },
    });

    res.status(200).json({ message: 'Habit deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete habit' });
  }
};
