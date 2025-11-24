import express from 'express';
import { getStreamDetails, getStreamCareers, getCareerDetails, getCareerSalaryInsights, getStreamCareersSalaryInsights } from '../controllers/stream.controller';
import { paidGate } from '../middleware/paidGate';

const router = express.Router();

router.get('/:stream', getStreamDetails);
router.get('/:stream/careers',paidGate("streams-Data"),  getStreamCareers);
router.get('/:stream/careers/:careerId', getStreamCareersSalaryInsights);

router.get('/:stream/careers2/:careerId', paidGate("streams-Data2"), getCareerDetails);
router.get('/:stream/careers/:careerId/salary-insights', getCareerSalaryInsights);

export default router;

