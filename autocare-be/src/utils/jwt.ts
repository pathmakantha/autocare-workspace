import jwt from 'jsonwebtoken';

const secretFromEnv = process.env.JWT_SECRET;
if (!secretFromEnv) {
  throw new Error('JWT_SECRET environment variable is required');
}
const JWT_SECRET: string = secretFromEnv;

export interface JwtPayload {
  userId: string;
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}
