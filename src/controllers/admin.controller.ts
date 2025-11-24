import { Request, Response } from 'express';
import prisma from '../prisma/client';

export const setUserPaid = async (req: Request, res: Response) => {
    try {
        const { userId, isPaid, planStart, planEnd } = req.body as { userId: string; isPaid: boolean; planStart?: string; planEnd?: string };
        
    
        const user = await prisma.user.findUnique({
            where: { email: userId }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const result = await prisma.$transaction(async (tx) => {
            // 1. Update User
            const updatedUser = await tx.user.update({
                where: { id: user.id },
                data: {
                    isPaid,
                    planStart: planStart ? new Date(planStart) : null,
                    planEnd: planEnd ? new Date(planEnd) : null,
                },
                select: { id: true, email: true, name: true, isPaid: true, planStart: true, planEnd: true },
            });

            // 2. Create Plan record if isPaid is true
            if (isPaid) {
                await tx.plan.create({
                    data: {
                        userId: user.id,
                        email: user.email,
                        planName: 'Premium Subscription', // Default name
                        startTime: planStart ? new Date(planStart) : new Date(),
                        endTime: planEnd ? new Date(planEnd) : null,
                        count: 1
                    }
                });
            }

            return updatedUser;
        });

        return res.json(result);
    } catch (e) {
        console.error('Admin setUserPaid error', e);
        return res.status(500).json({ error: 'Failed to update user' });
    }
};

// Minimal study content CRUD for paid/unpaid flags using Career as example
export const upsertCareer = async (req: Request, res: Response) => {
    try {
        const { id, name, description, stream, level } = req.body;
        const career = await prisma.career.upsert({
            where: {
                name: name
            },
            update: { name, description, stream, level },
            create: { name, description, stream, level },
        });
        return res.json(career);
    } catch (e) {
        console.error('Admin upsertCareer error', e);
        return res.status(500).json({ error: 'Failed to upsert career' });
    }
};

export const upsertCollege = async (req: Request, res: Response) => {
    try {
        const { id, name, description, website, address, city, state, pincode, phone, email, stream, courses, fees } = req.body;
        const college = await prisma.college.upsert({
            where: { name: name },
            update: { name, description, website, address, city, state, pincode, phone, email, stream, courses, fees },
            create: { name, description, website, address, city, state, pincode, phone, email, stream, courses, fees },
        });
        return res.json(college);
    } catch (e) {
        console.error('Admin upsertCollege error', e);
        return res.status(500).json({ error: 'Failed to upsert college' });
    }
};

export const deleteCollege = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.college.delete({ where: { id } });
        return res.json({ ok: true });
    } catch (e) {
        console.error('Admin deleteCollege error', e);
        return res.status(500).json({ error: 'Failed to delete college' });
    }
};

export const upsertCoaching = async (req: Request, res: Response) => {
    try {
        const { id, name, description, website, address, city, state, pincode, phone, email, courses } = req.body;
        const coaching = await prisma.coaching.upsert({
            where: { name: name },
            update: { name, description, website, address, city, state, pincode, phone, email, careers: { deleteMany: {}, create: [{ career: { connect: { id: courses } } }] } },
            create: { name, description, website, address, city, state, pincode, phone, email, careers: { create: [{ career: { connect: { id: courses } } }] } },
        });
        return res.json(coaching);
    } catch (e) {
        console.error('Admin upsertCoaching error', e);
        return res.status(500).json({ error: 'Failed to upsert coaching' });
    }
};


export const deleteCoaching = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.coaching.delete({ where: { id } });
        return res.json({ ok: true });
    } catch (e) {
        console.error('Admin deleteCoaching error', e);
        return res.status(500).json({ error: 'Failed to delete coaching' });
    }
};

export const FindCourse = async (req: Request, res: Response) => {
    try {

        const course = await prisma.career.findMany();
        return res.json(course);
    } catch (e) {
        console.error('Admin FindCourse error', e);
        return res.status(500).json({ error: 'Failed to find course' });
    }
}

export const upsertSalaryInsights = async (req: Request, res: Response) => {
    try {
        const { careerId, insights } = req.body; // insights: { year, min, avg, max }[]

        // Transaction to ensure atomicity
        await prisma.$transaction(async (tx) => {
            // 1. Delete existing insights for this career
            await tx.salaryInsight.deleteMany({
                where: { careerId }
            });

            // 2. Create new insights
            if (insights && insights.length > 0) {
                await tx.salaryInsight.createMany({
                    data: insights.map((i: any) => ({
                        careerId,
                        year: i.year,
                        minSalary: parseFloat(i.min),
                        avgSalary: parseFloat(i.avg),
                        maxSalary: parseFloat(i.max)
                    }))
                });
            }
        });

        return res.json({ success: true });
    } catch (e) {
        return res.status(500).json({ error: 'Failed to upsert salary insights' });
    }
};

export const getAdminStats = async (req: Request, res: Response) => {
    try {
        const [totalUsers, unpaidUsers, totalPlans] = await Promise.all([
            prisma.user.findMany({select:{id:true}}),
            prisma.user.findMany({ where: { isPaid: false },select:{id:true}}),
            prisma.plan.findMany({select:{id:true}})
        ])
       
        return res.json({
            totalUsers:totalUsers.length,
            paidUsers:totalUsers.length-unpaidUsers.length,
            unpaidUsers:unpaidUsers.length,
            totalPlans:totalPlans.length
        });
    } catch (e) {
        console.error('Admin getAdminStats error', e);
        return res.status(500).json({ error: 'Failed to fetch admin stats' });
    }
};
