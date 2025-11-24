import { Request, Response } from 'express';
import prisma from '../prisma/client';
import { cachePaidResponse } from '../middleware/paidGate';

export const listColleges = async (req: Request, res: Response) => {
    try {
        const colleges = await prisma.college.findMany({
            select: { id: true, name: true, city: true, state: true, stream: true },
            orderBy: { name: 'asc' },
            take: 100,
        });
        await cachePaidResponse(req, colleges);
        return res.json(colleges);
    } catch (e) {
        console.error('Error listing colleges', e);
        return res.status(500).json({ error: 'Failed to list colleges' });
    }
};
