import express from 'express';
import { getCoachingForCareer, getCoachingDetails, getNearbyPGs } from '../controllers/coaching.controller';
import { paidGate } from '../middleware/paidGate';

const router = express.Router();

router.get('/career/:careerId', paidGate('coaching'), getCoachingForCareer);
router.get('/:id', paidGate('coaching'), getCoachingDetails);
router.get('/:id/pgs', paidGate('any'), getNearbyPGs);

export default router;

