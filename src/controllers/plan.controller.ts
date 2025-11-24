import { Request, Response } from 'express';
import prisma from '../prisma/client';

export const assignPlan = async (req: Request, res: Response) => {
    try {
        const { userId, email, planName, count, startTime, endTime } = req.body as {
            userId: string; email: string; planName: string; count?: number; startTime?: string; endTime?: string;
        };
        if (!userId || !email || !planName) return res.status(400).json({ error: 'Missing fields' });

        const plan = await prisma.plan.create({
            data: { userId, email, planName, count: count ?? 1, startTime: startTime ? new Date(startTime) : null, endTime: endTime ? new Date(endTime) : null },
        });

        await prisma.user.update({
            where: { id: userId },
            data: { isPaid: true, planStart: startTime ? new Date(startTime) : new Date(), planEnd: endTime ? new Date(endTime) : null },
        });

        return res.status(201).json(plan);
    } catch (e) {
        console.error('Assign plan error', e);
        return res.status(500).json({ error: 'Failed to assign plan' });
    }
};

export const incrementPlanUsage = async (req: Request, res: Response) => {
    try {
        const { planId, amount } = req.body as { planId: string; amount?: number };
        if (!planId) return res.status(400).json({ error: 'Missing planId' });
        const plan = await prisma.plan.update({ where: { id: planId }, data: { count: { increment: amount ?? 1 } } });
        return res.json(plan);
    } catch (e) {
        console.error('Increment plan error', e);
        return res.status(500).json({ error: 'Failed to increment plan' });
    }
};
