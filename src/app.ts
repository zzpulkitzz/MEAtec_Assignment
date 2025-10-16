import express, { Application } from 'express';
import authRoutes from './routes/authRoutes';
import { authenticateToken } from './middlewares/authMiddleware';
import habitRoutes from './routes/habitRoutes';
import { generalLimiter, authLimiter, apiLimiter } from './middlewares/ratelimiter';
// import habitRoutes from './routes/habitRoutes'; // To be created

const app: Application = express();

app.use(express.json());
// Conditionally apply rate limiters (disable in test environment)
if (process.env.NODE_ENV !== 'test') {
    app.use(generalLimiter);
  }

// Public routes
app.get("/", (req, res) => {
    res.send("Hello World!");
})
app.use('/auth', process.env.NODE_ENV !== 'test' ? authLimiter : [], authRoutes);

// Protected routes 
app.use('/habits', authenticateToken, process.env.NODE_ENV !== 'test' ? apiLimiter : [], habitRoutes);

export default app;
