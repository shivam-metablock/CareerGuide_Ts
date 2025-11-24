import express from 'express';
import { getClass10Careers, getCareerDetails, getCareerSalaryInsights } from '../controllers/career.controller';
import { paidGate } from '../middleware/paidGate';

const router = express.Router();

router.get('/class10', paidGate('class10'), getClass10Careers);
router.get('/:id', getCareerDetails);
router.get('/:id/salary-insights', getCareerSalaryInsights);

export default router;

