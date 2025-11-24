import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import careerRoutes from './routes/career.routes';
import streamRoutes from './routes/stream.routes';
import budgetRoutes from './routes/budget.routes';
import aiRoutes from './routes/ai.routes';
import coachingRoutes from './routes/coaching.routes';
import authRoutes from './routes/auth.routes';
import planRoutes from './routes/plan.routes';
import adminRoutes from './routes/admin.routes';
import collegesRoutes from './routes/colleges.routes';
import { authOptional } from './middleware/auth';

dotenv.config();

// Validate Gemini API key on startup
const geminiApiKey = process.env.GEMINI_API_KEY;

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(authOptional);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/colleges', collegesRoutes);
app.use('/api/careers', careerRoutes);
app.use('/api/streams', streamRoutes);
app.use('/api/budget', budgetRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/coaching', coachingRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Coaching API is running' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

