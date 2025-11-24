import express, { NextFunction, Request, Response } from 'express';
import {
    setUserPaid, upsertCareer, upsertCollege, deleteCollege,
    upsertCoaching, deleteCoaching, FindCourse, upsertSalaryInsights,
    getAdminStats
} from '../controllers/admin.controller';
import { authRequired } from '../middleware/auth';
import { redis } from '../utils/redis';  // your createClient instance

const router = express.Router();

// Middleware: clear Redis only for POST/PUT/PATCH/DELETE
const clearCacheOnUpdate = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
            await redis.flushAll();  // <--- correct for createClient()
        }
        next();
    } catch (err) {
        console.error("Redis flush error:", err);
        next();
    }
};

router.use(authRequired);        // require admin auth
// router.use(clearCacheOnUpdate);  // clear redis only on updates

router.post('/user/paid', setUserPaid);
router.post('/career/upsert', upsertCareer);
router.post('/college/upsert', upsertCollege);
router.delete('/college/:id', deleteCollege);
router.post('/coaching/upsert', upsertCoaching);
router.delete('/coaching/:id', deleteCoaching);
router.post('/career/salary-insights', upsertSalaryInsights);

// GET doesn't clear Redis
router.get('/career', FindCourse);
router.get('/stats', getAdminStats);

export default router;
