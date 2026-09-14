import jwt from 'jsonwebtoken';

const secretFromEnv = process.env.JWT_SECRET;
if (!secretFromEnv) {
  throw new Error('JWT_SECRET environment variable is required');
}
const JWT_SECRET: string = secretFromEnv;

export interface JwtPayload {
  userId: string;
}

export interface ResetTokenPayload {
  userId: string;
  purpose: 'password-reset';
  /** The specific PasswordResetCode row this token was minted from. */
  codeId: string;
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });
}

export function verifyToken(token: string): JwtPayload {
  const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload & { purpose?: string };
  // Reset tokens are signed with the same secret and also carry a userId, so a session
  // check must refuse anything with a purpose claim - otherwise a 15-minute reset token
  // would be accepted as a 30-day login token.
  if (decoded.purpose) {
    throw new Error('Token is not a session token');
  }
  return { userId: decoded.userId };
}

/** Short-lived, single-purpose token proving the user just passed the emailed code check. */
export function signResetToken(payload: ResetTokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
}

export function verifyResetToken(token: string): ResetTokenPayload {
  const decoded = jwt.verify(token, JWT_SECRET) as ResetTokenPayload;
  if (decoded.purpose !== 'password-reset') {
    throw new Error('Token is not a password-reset token');
  }
  return decoded;
}
