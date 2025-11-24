import { Request, Response } from 'express';
import prisma from '../prisma/client';
import { cachePaidResponse } from '../middleware/paidGate';

export const getCoachingForCareer = async (req: Request, res: Response) => {
  try {
    const { careerId } = req.params;

    const coaching = await prisma.coaching.findMany({
      where: {
        careers: {
          some: {
            careerId: careerId,
          },
        },
      },
      include: {
        careers: {
          include: {
            career: true,
          },
        },
      },
    });

    // Transform to include career details
    const transformed = coaching.map((c) => ({
      ...c,
      careers: c.careers.map((cc) => cc.career),
    }));
    await cachePaidResponse(req, transformed);
    res.json(transformed);
  } catch (error) {
    console.error('Error fetching coaching for career:', error);
    res.status(500).json({ error: 'Failed to fetch coaching' });
  }
};

export const getCoachingDetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const coaching = await prisma.coaching.findUnique({
      where: { id },
      include: {
        careers: {
          include: {
            career: {
              include: {
                salaryInsights: {
                  orderBy: {
                    year: 'asc',
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!coaching) {
      return res.status(404).json({ error: 'Coaching not found' });
    }

    // Get average salary insight for associated careers
    const allSalaryInsights = coaching.careers.flatMap((cc) => cc.career.salaryInsights);
    const salaryByYear: Record<number, { min: number[]; avg: number[]; max: number[] }> = {};

    allSalaryInsights.forEach((insight) => {
      if (!salaryByYear[insight.year]) {
        salaryByYear[insight.year] = { min: [], avg: [], max: [] };
      }
      salaryByYear[insight.year].min.push(insight.minSalary);
      salaryByYear[insight.year].avg.push(insight.avgSalary);
      salaryByYear[insight.year].max.push(insight.maxSalary);
    });

    const aggregatedInsights = Object.entries(salaryByYear).map(([year, values]) => ({
      year: parseInt(year),
      minSalary: values.min.reduce((a, b) => a + b, 0) / values.min.length,
      avgSalary: values.avg.reduce((a, b) => a + b, 0) / values.avg.length,
      maxSalary: values.max.reduce((a, b) => a + b, 0) / values.max.length,
    }));

    res.json({
      ...coaching,
      careers: coaching.careers.map((cc) => cc.career),
      salaryInsights: aggregatedInsights.sort((a, b) => a.year - b.year),
    });
  } catch (error) {
    console.error('Error fetching coaching details:', error);
    res.status(500).json({ error: 'Failed to fetch coaching details' });
  }
};

export const getNearbyPGs = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const coaching = await prisma.coaching.findUnique({
      where: { id },
    });

    if (!coaching) {
      return res.status(404).json({ error: 'Coaching not found' });
    }

    const pgs = await prisma.pG.findMany({
      where: {
        coachingId: id,
        OR: [
          { city: coaching.city },
          { state: coaching.state },
        ],
      },
      orderBy: {
        distance: 'asc',
      },
    });

    res.json(pgs);
  } catch (error) {
    console.error('Error fetching nearby PGs:', error);
    res.status(500).json({ error: 'Failed to fetch nearby PGs' });
  }
};

