import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

interface JwtPayload {
  userId: number;
  email: string;
}

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  console.log(token)
  if (!token) {
    res.status(401).json({ error: 'Access denied. No token provided' });
    return;
  }

  try {
    console.log(JWT_SECRET)
    const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;
    req.user = payload;
    next();
  } catch (error) {
    res.status(403).json({ error: 'Invalid or expired token' });
  }
};
