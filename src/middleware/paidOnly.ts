import { Request, Response, NextFunction } from 'express';

export function paidOnly(req: Request, res: Response, next: NextFunction) {
    if (req.user?.isPaid||req.user?.isAdmin) return next();
    return res.status(403).json({ error: 'Paid plan required' });
}
