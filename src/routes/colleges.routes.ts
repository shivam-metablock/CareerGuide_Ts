import express from 'express';
import { listColleges } from '../controllers/colleges.controller';
import { paidGate } from '../middleware/paidGate';

const router = express.Router();

router.get('/', paidGate('colleges'), listColleges);

export default router;
