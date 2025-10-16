import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma';
import dotenv from 'dotenv';
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
console.log(JWT_SECRET)
// User Registration
export const register = async (req: Request, res: Response): Promise<void> => {
  console.log(JWT_SECRET)
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400).json({ error: 'Please provide all fields' });
    return;
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword }
    });

    res.status(201).json({ 
      message: 'User registered successfully', 
      userId: user.id 
    });
  } catch (error: any) {
    if (error.code === 'P2002') {
      res.status(400).json({ error: 'Email already exists' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

// User Login
export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '3d' }
    );

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email }
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
