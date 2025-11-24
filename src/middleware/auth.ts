import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthUser {
    id: string;
    email: string;
    isPaid: boolean;
    isAdmin: boolean;
}

declare global {
    namespace Express {
        interface Request {
            user?: AuthUser;

        }
    }
}

export function authOptional(req: Request, _res: Response, next: NextFunction) {
    const header = req.headers.authorization;
    if (!header) return next();
    const token = header.replace('Bearer ', '');
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET || 'devsecret') as AuthUser;
        req.user = payload;
    } catch (_) { }
    next();
}

export function authRequired(req: Request, res: Response, next: NextFunction) {
    const header = req.headers.authorization;
    if (!header) return res.status(401).json({ error: 'Unauthorized' });
    try {
        const token = header.replace('Bearer ', '');
        const payload = jwt.verify(token, process.env.JWT_SECRET || 'devsecret') as AuthUser;
        req.user = payload;

        return next();
    } catch (e) {
        return res.status(401).json({ error: 'Invalid token' });
    }
}
