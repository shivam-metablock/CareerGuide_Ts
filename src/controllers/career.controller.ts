import { Request, Response } from 'express';
import prisma from '../prisma/client';
import { cachePaidResponse } from '../middleware/paidGate';

export const getClass10Careers = async (req: Request, res: Response) => {
  try {
    const careers = await prisma.career.findMany({
      where: {
        level: 'Class10',
      },
      include: {
        salaryInsights: {
          orderBy: {
            year: 'asc',
          },
        },
      },
    });
    await cachePaidResponse(req, careers);
    res.json(careers);
  } catch (error) {
    console.error('Error fetching Class 10 careers:', error);
    res.status(500).json({ error: 'Failed to fetch careers' });
  }
};

export const getCareerDetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const career = await prisma.career.findUnique({
      where: { id },
      include: {
        salaryInsights: {
          orderBy: {
            year: 'asc',
          },
        },
        coaching: true,
      },
    });

    if (!career) {
      return res.status(404).json({ error: 'Career not found' });
    }

    res.json(career);
  } catch (error) {
    console.error('Error fetching career details:', error);
    res.status(500).json({ error: 'Failed to fetch career details' });
  }
};

export const getCareerSalaryInsights = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const salaryInsights = await prisma.salaryInsight.findMany({
      where: { careerId: id },
      orderBy: {
        year: 'asc',
      },
    });

    res.json(salaryInsights);
  } catch (error) {
    console.error('Error fetching salary insights:', error);
    res.status(500).json({ error: 'Failed to fetch salary insights' });
  }
};

