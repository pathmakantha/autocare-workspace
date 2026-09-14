import crypto from 'crypto';
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import prisma from '../prisma';
import { signResetToken, signToken, verifyResetToken } from '../utils/jwt';
import { buildResetCodeEmail, sendMail } from '../utils/mailer';
import { toUserDto } from '../utils/userDto';

const CODE_TTL_MINUTES = 15;
const MAX_VERIFY_ATTEMPTS = 5;
const RESEND_COOLDOWN_SECONDS = 60;
const MIN_PASSWORD_LENGTH = 6;

const forgotSchema = z.object({ email: z.string().email() });
const verifySchema = z.object({
  email: z.string().email(),
  code: z.string().regex(/^\d{6}$/, 'Enter the 6-digit code'),
});
const resetSchema = z.object({
  resetToken: z.string().min(1),
  password: z.string().min(MIN_PASSWORD_LENGTH),
});
const setPasswordSchema = z.object({ password: z.string().min(MIN_PASSWORD_LENGTH) });

/** Cryptographically random 6-digit code — Math.random() is not acceptable here. */
function generateCode(): string {
  return String(crypto.randomInt(0, 1_000_000)).padStart(6, '0');
}

export async function forgotPassword(req: Request, res: Response) {
  const parsed = forgotSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.issues[0]?.message || 'Invalid input' });
  }
  const { email } = parsed.data;

  // Always answer identically whether or not the address is registered. Anything else
  // turns this endpoint into an account-enumeration oracle.
  const genericResponse = {
    message: 'If that email has an account, a reset code is on its way.',
  };

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.json(genericResponse);

  const latest = await prisma.passwordResetCode.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  });
  // Throttle silently — telling the caller they're being rate limited would also
  // confirm the address exists.
  if (latest && Date.now() - latest.createdAt.getTime() < RESEND_COOLDOWN_SECONDS * 1000) {
    return res.json(genericResponse);
  }

  // Issuing a new code voids every earlier one for this account.
  await prisma.passwordResetCode.deleteMany({ where: { userId: user.id } });

  const code = generateCode();
  const codeHash = await bcrypt.hash(code, 10);
  await prisma.passwordResetCode.create({
    data: {
      userId: user.id,
      codeHash,
      expiresAt: new Date(Date.now() + CODE_TTL_MINUTES * 60_000),
    },
  });

  try {
    const result = await sendMail({ to: user.email, ...buildResetCodeEmail(code, CODE_TTL_MINUTES) });
    if (!result.delivered) {
      console.warn(`[password] reset code for ${user.email} was generated but not emailed (SMTP off).`);
    }
  } catch (err) {
    // A mail failure must not reveal anything to the caller, but we do want it in the logs.
    console.error('[password] failed to send reset code email:', err);
  }

  return res.json(genericResponse);
}

export async function verifyResetCode(req: Request, res: Response) {
  const parsed = verifySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.issues[0]?.message || 'Invalid input' });
  }
  const { email, code } = parsed.data;

  // One message for every failure mode, so a caller can't tell "no such account" from
  // "wrong code" from "expired".
  const invalid = () => res.status(400).json({ message: 'That code is not valid or has expired.' });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return invalid();

  const record = await prisma.passwordResetCode.findFirst({
    where: { userId: user.id, consumedAt: null },
    orderBy: { createdAt: 'desc' },
  });
  if (!record) return invalid();
  if (record.expiresAt < new Date()) return invalid();
  if (record.attempts >= MAX_VERIFY_ATTEMPTS) return invalid();

  const matches = await bcrypt.compare(code, record.codeHash);
  if (!matches) {
    await prisma.passwordResetCode.update({
      where: { id: record.id },
      data: { attempts: { increment: 1 } },
    });
    return invalid();
  }

  // The code itself is now spent as far as the client is concerned — it trades it for a
  // short-lived token bound to this exact code row, so the final step can't be replayed
  // with a guessed code.
  const resetToken = signResetToken({
    userId: user.id,
    purpose: 'password-reset',
    codeId: record.id,
  });
  return res.json({ resetToken });
}

export async function resetPassword(req: Request, res: Response) {
  const parsed = resetSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.issues[0]?.message || 'Invalid input' });
  }
  const { resetToken, password } = parsed.data;

  const expired = () =>
    res.status(400).json({ message: 'This reset session has expired. Please start again.' });

  let payload;
  try {
    payload = verifyResetToken(resetToken);
  } catch {
    return expired();
  }

  const record = await prisma.passwordResetCode.findUnique({ where: { id: payload.codeId } });
  if (!record || record.userId !== payload.userId || record.consumedAt || record.expiresAt < new Date()) {
    return expired();
  }

  const hashed = await bcrypt.hash(password, 10);
  const [user] = await prisma.$transaction([
    prisma.user.update({ where: { id: payload.userId }, data: { password: hashed } }),
    prisma.passwordResetCode.update({ where: { id: record.id }, data: { consumedAt: new Date() } }),
  ]);

  const token = signToken({ userId: user.id });
  return res.json({ token, user: toUserDto(user) });
}

/**
 * Used by the mandatory "create a password" step after a Google sign-up. Deliberately
 * only works while the account has no password — changing an existing one has to go
 * through the reset flow (which proves control of the mailbox).
 */
export async function setPassword(req: Request, res: Response) {
  const parsed = setPasswordSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.issues[0]?.message || 'Invalid input' });
  }

  const user = await prisma.user.findUnique({ where: { id: req.userId } });
  if (!user) return res.status(404).json({ message: 'User not found' });
  if (user.password) {
    return res.status(409).json({ message: 'This account already has a password.' });
  }

  const hashed = await bcrypt.hash(parsed.data.password, 10);
  const updated = await prisma.user.update({ where: { id: user.id }, data: { password: hashed } });
  return res.json({ user: toUserDto(updated) });
}
