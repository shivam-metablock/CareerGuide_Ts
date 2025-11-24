import { Request, Response } from 'express';
import prisma from '../prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

function signToken(user: { id: string; email: string; isPaid: boolean ,isAdmin: boolean }) {
    return jwt.sign(user, process.env.JWT_SECRET || 'devsecret', { expiresIn: '7d' });
}

export const signup = async (req: Request, res: Response) => {
    try {
        const { name, email, password, other } = req.body as { name: string; email: string; password: string; other?: any };
        if (!name || !email || !password) return res.status(400).json({ error: 'Missing fields' });

        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) return res.status(409).json({ error: 'Email already registered' });

        const passwordHash = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: { name, email, passwordHash, isPaid: false, other: other ?? null },
            select: { id: true, email: true, name: true, isPaid: true,isAdmin:true },
        });

        const token = signToken({ id: user.id, email: user.email, isPaid: user.isPaid,isAdmin:user.isAdmin });
        return res.status(201).json({ user, token });
    } catch (e) {
        console.error('Signup error', e);
        return res.status(500).json({ error: 'Signup failed' });
    }
};
export const signupAdmin = async (req: Request, res: Response) => {
    try {
        const { name, email, password, other } = req.body as { name: string; email: string; password: string; other?: any };
        if (!name || !email || !password) return res.status(400).json({ error: 'Missing fields' });

        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) return res.status(409).json({ error: 'Email already registered' });

        const passwordHash = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: { name, email, passwordHash, isPaid: false, isAdmin: true,other: other ?? null },
            select: { id: true, email: true, name: true, isPaid: true, isAdmin: true },
        });

        const token = signToken({ id: user.id, email: user.email, isPaid: user.isPaid, isAdmin: user.isAdmin });
        return res.status(201).json({ user, token });
    } catch (e) {
        console.error('Signup error', e);
        return res.status(500).json({ error: 'Signup failed' });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body as { email: string; password: string };
        if (!email || !password) return res.status(400).json({ error: 'Missing fields' });

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(401).json({ error: 'Invalid credentials' });

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

        const token = signToken({ id: user.id, email: user.email, isPaid: user.isPaid,isAdmin:user.isAdmin });
        return res.json({ user: { id: user.id, email: user.email, name: user.name, isPaid: user.isPaid,isAdmin:user.isAdmin }, token });
    } catch (e) {
        console.error('Login error', e);
        return res.status(500).json({ error: 'Login failed' });
    }
};
export const Adminlogin = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body as { email: string; password: string };
        if (!email || !password) return res.status(400).json({ error: 'Missing fields' });

        const user = await prisma.user.findUnique({ where: { email ,isAdmin:true} });
        if (!user) return res.status(401).json({ error: 'Invalid credentials' });

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

        const token = signToken({ id: user.id, email: user.email, isPaid: user.isPaid, isAdmin: user.isAdmin });
        return res.json({ user: { id: user.id, email: user.email, name: user.name, isPaid: user.isPaid, isAdmin: user.isAdmin }, token });
    } catch (e) {
        console.error('Login error', e);
        return res.status(500).json({ error: 'Login failed' });
    }
};

