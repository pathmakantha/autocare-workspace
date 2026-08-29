import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import prisma from '../prisma';
import { signToken } from '../utils/jwt';
import { getFirebaseAuth } from '../firebaseAdmin';

const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const googleAuthSchema = z.object({
  idToken: z.string().min(1),
});

const updateProfileSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
});

function toUserDto(user: { id: string; name: string; email: string; phone?: string | null }) {
  return { id: user.id, name: user.name, email: user.email, phone: user.phone ?? '' };
}

export async function register(req: Request, res: Response) {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.issues[0]?.message || 'Invalid input' });
  }
  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json({ message: 'An account with this email already exists' });
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { name, email, password: hashed } });
  const token = signToken({ userId: user.id });
  return res.status(201).json({ token, user: toUserDto(user) });
}

export async function login(req: Request, res: Response) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.issues[0]?.message || 'Invalid input' });
  }
  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.password) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }
  const token = signToken({ userId: user.id });
  return res.json({ token, user: toUserDto(user) });
}

export async function googleAuth(req: Request, res: Response) {
  const parsed = googleAuthSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.issues[0]?.message || 'Invalid input' });
  }
  const { idToken } = parsed.data;

  let decoded;
  try {
    const auth = await getFirebaseAuth();
    decoded = await auth.verifyIdToken(idToken);
  } catch {
    return res.status(401).json({ message: 'Invalid or expired Google sign-in token' });
  }

  const { uid, email, name } = decoded;
  if (!email) {
    return res.status(400).json({ message: 'Google account has no email' });
  }

  let user = await prisma.user.findUnique({ where: { firebaseUid: uid } });
  if (!user) {
    user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      user = await prisma.user.update({ where: { id: user.id }, data: { firebaseUid: uid } });
    } else {
      user = await prisma.user.create({
        data: { name: name || email.split('@')[0], email, firebaseUid: uid },
      });
    }
  }

  const token = signToken({ userId: user.id });
  return res.json({ token, user: toUserDto(user) });
}

export async function me(req: Request, res: Response) {
  const user = await prisma.user.findUnique({ where: { id: req.userId } });
  if (!user) return res.status(404).json({ message: 'User not found' });
  return res.json({ user: toUserDto(user) });
}

export async function updateMe(req: Request, res: Response) {
  const parsed = updateProfileSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.issues[0]?.message || 'Invalid input' });
  }
  const { name, email, phone } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing && existing.id !== req.userId) {
    return res.status(409).json({ message: 'An account with this email already exists' });
  }

  const user = await prisma.user.update({
    where: { id: req.userId },
    data: { name, email, phone: phone ?? null },
  });
  return res.json({ user: toUserDto(user) });
}
