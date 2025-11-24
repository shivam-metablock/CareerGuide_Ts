import { Request, Response } from 'express';
import prisma from '../prisma/client';
import { Stream } from '@prisma/client';
import { cachePaidResponse } from '../middleware/paidGate';
import { cacheSet } from '../utils/redis';

const streamDescriptions = {
  Science: 'Become an engineer, doctor, scientist, or work in technology and research.',
  Commerce: 'Become a CA, banker, business analyst, or work in finance and management.',
  Arts: 'Become a designer, journalist, lawyer, psychologist, or work in creative and social fields.',
};

export const getStreamDetails = async (req: Request, res: Response) => {
  try {
    const { stream } = req.params;

    if (!['Science', 'Commerce', 'Arts'].includes(stream)) {
      return res.status(400).json({ error: 'Invalid stream. Must be Science, Commerce, or Arts' });
    }

    const description = streamDescriptions[stream as Stream];

    res.json({
      stream: stream as Stream,
      description,
    });
  } catch (error) {
    console.error('Error fetching stream details:', error);
    res.status(500).json({ error: 'Failed to fetch stream details' });
  }
};

export const getStreamCareers = async (req: Request, res: Response) => {
  try {
    const { stream } = req.params;

    if (!['Science', 'Commerce', 'Arts'].includes(stream)) {
      return res.status(400).json({ error: 'Invalid stream' });
    }

    
    const careers = await prisma.career.findMany({
      where: {
        stream: stream as Stream,
        level: 'Stream',
      }
    });
    await cacheSet(`paid:${stream}-paid`, careers);
    res.json(careers);
  } catch (error) {
    console.error('Error fetching stream careers:', error);
    res.status(500).json({ error: 'Failed to fetch stream careers' });
  }
};
export const getStreamCareersSalaryInsights = async (req: Request, res: Response) => {
  try {
    const { CareerId } = req.params;

    const salaryInsights = await prisma.salaryInsight.findMany({
      where: {
        careerId: CareerId,
        
      },
      orderBy: {
        year: 'asc',
      },
    });
    await cachePaidResponse(req, salaryInsights);
    res.json({salaryInsights});
  } catch (error) {
    console.error('Error fetching stream careers:', error);
    res.status(500).json({ error: 'Failed to fetch stream careers' });
  }
}

 


export const getCareerDetails = async (req: Request, res: Response) => {
  try {
    const { careerId } = req.params;

    const career = await prisma.career.findUnique({
      where: { id: careerId },
      include: {
        salaryInsights: {
          orderBy: {
            year: 'asc',
          },
        },
        
       coaching:{
        include:{
          coaching:{
            include:{
              pgs:true
            },
           
          }
        }
       }
        },
      },
    );

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
    const { careerId } = req.params;

    const salaryInsights = await prisma.salaryInsight.findMany({
      where: { careerId },
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

