import express from 'express';
import { getAIGuidance, getAISalaryInsights, streamAIGuidance } from '../controllers/ai.controller';
import { paidOnly } from '../middleware/paidOnly';

const router = express.Router();

router.post('/guidance', paidOnly, getAIGuidance);
router.post('/guidance/stream', paidOnly, streamAIGuidance);
router.get('/salary-insights/:careerId', paidOnly, getAISalaryInsights);

export default router;

