import express, { Application } from 'express';
import authRoutes from './routes/authRoutes';
import { authenticateToken } from './middlewares/authMiddleware';
import habitRoutes from './routes/habitRoutes';
// import habitRoutes from './routes/habitRoutes'; // To be created

const app: Application = express();

app.use(express.json());


// Public routes
app.get("/", (req, res) => {
    res.send("Hello World!");
})
app.use('/auth', authRoutes);



// Protected routes 
app.use('/habits', authenticateToken, habitRoutes);


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
