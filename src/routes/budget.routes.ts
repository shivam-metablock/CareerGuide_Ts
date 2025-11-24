import express from 'express';
import { calculateBudget, getBudgetRecommendations } from '../controllers/budget.controller';
import { paidOnly } from '../middleware/paidOnly';

const router = express.Router();

router.post('/calculate', paidOnly, calculateBudget);
router.post('/recommendations', paidOnly, getBudgetRecommendations);

export default router;

