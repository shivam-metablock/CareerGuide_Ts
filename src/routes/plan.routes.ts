import express from 'express';
import { assignPlan, incrementPlanUsage } from '../controllers/plan.controller';
import { authRequired } from '../middleware/auth';

const router = express.Router();

router.post('/assign', authRequired, assignPlan);
router.post('/increment', authRequired, incrementPlanUsage);

export default router;
