import express from 'express';
import { signup, login, Adminlogin, signupAdmin } from '../controllers/auth.controller';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/admin/login', Adminlogin);
router.post('/admin/signup', signupAdmin);

export default router;
