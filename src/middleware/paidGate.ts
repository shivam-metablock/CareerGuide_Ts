import { Request, Response, NextFunction } from 'express';
import { cacheGet, cacheSet } from '../utils/redis';
import prisma from '../prisma/client';

import { Stream } from '@prisma/client';


export function paidGate(routeKey: 'class10' | 'streams' | 'colleges' | 'coaching' | "any" | "streams-Data" | "streams-Data2") {
    return async (req: Request, res: Response, next: NextFunction) => {
        const isPaid = req.user?.isPaid === true||req.user?.isAdmin===true;
        if (isPaid) {
            
            const cacheKey = `paid:${routeKey}-paid`;
            const cached = await cacheGet(cacheKey);
            if (cached) return res.json(cached);
            
            (req as any)._cacheKey = cacheKey;
            return next();
        }

        
        switch (routeKey) {
            case 'class10': {
                const cacheKey = `free:${routeKey}-free`;
                const cached = await cacheGet(cacheKey);
                if (cached) return res.json(cached);
                const data = await prisma.career.findMany({
                    where: {
                        level: 'Class10',
                        isPaid: false
                    }
                });

                await cacheSet(`free:${routeKey}-free`,data)
            return res.json(data)
            }
            case 'streams': {
                return res.json([
                    { name: 'Science', subjects: ['Physics', 'Chemistry', 'Maths'] },
                    { name: 'Commerce', subjects: ['Accounts', 'Economics', 'Business'] },
                    { name: 'Arts', subjects: ['History', 'Political Science', 'Geography'] },
                ]);
            }
            case 'colleges': {
                return res.json([
                    { id: 'c1', name: 'City Engineering College', city: 'Pune' },
                    { id: 'c2', name: 'National Commerce College', city: 'Ahmedabad' },
                ]);
            }
            case 'coaching': {
                return res.json([
                    { id: 'k1', name: 'Apex Coaching' },
                    { id: 'k2', name: 'Elite Academy' },
                    { id: 'k3', name: 'Focus Institute' },
                ]);
            }
            case "streams-Data": {
                const { stream } = req.params;
                const cacheKey = `free:${routeKey}-free-${stream}`;
                const cached = await cacheGet(cacheKey);
                if (cached) return res.json(cached);
                const data = await prisma.career.findMany({
                    where: {                            
                        // level: 'Stream',
                        isPaid: false,
                        stream: stream as Stream
                    },
                    select:{
                        id:true,
                        name:true,
                        description:true,
                        stream:true,
                        level:true,
                        createdAt:true,
                        updatedAt:true,
                        salaryInsights:true,
                        coaching:true,     
                    }
                });
                await cacheSet(`free:${routeKey}-free-${stream}`, data)
                return res.json(data)
            }
            case "streams-Data2": {
                const { careerId } = req.params;
                const cacheKey = `free:${routeKey}-free-${careerId}`;
                const cached = await cacheGet(cacheKey);
                if (cached) return res.json(cached);
                const career = await prisma.career.findUnique({
                    where: { id: careerId ,isPaid:false},
                    include: {
                        salaryInsights: {
                            orderBy: {
                                year: 'asc',
                            },
                        },

                        coaching: {
                            include: {
                                coaching: {
                                    select: {
                                        id:true,
                                        name:true,
                                        isPaid:false,
                                        address:true,
                                        city:true,
                                        state:true,
                                        pincode:true,
                                        description:true,
                                        phone:true,
                                        email:true,
                                        website:true,
                                        pgs: {
                                            where: {
                                                isPaid: false
                                            }
                                        }
                                    },

                                }
                            }
                        }
                    },
                },
                );
                await cacheSet(`free:${routeKey}-free-${careerId}`, career)
                return res.json(career)
            }
            default:
                return res.status(403).json({ error: 'Restricted for unpaid users' });
        }
    };
}

export async function cachePaidResponse(req: Request, data: any) {
    const key = (req as any)._cacheKey as string | undefined;
    if (key) {
        await cacheSet(key, data, 300);
    }
}
