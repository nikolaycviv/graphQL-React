import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const SALT_ROUNDS = 10;
const DEVELOPMENT_SECRET = 'dev-only-change-me';

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET must be set before the server starts');
  }
  if (
    process.env.NODE_ENV === 'production' &&
    (secret === DEVELOPMENT_SECRET || Buffer.byteLength(secret) < 32)
  ) {
    throw new Error('Production JWT_SECRET must be a unique secret of at least 32 bytes');
  }
  return secret;
}

export function assertJwtSecret(): void {
  getJwtSecret();
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(userId: string): string {
  return jwt.sign({ sub: userId }, getJwtSecret(), { expiresIn: '7d' });
}

export function verifyToken(token: string): { sub: string } | null {
  const secret = getJwtSecret();
  try {
    const payload = jwt.verify(token, secret);
    if (typeof payload !== 'object' || typeof payload.sub !== 'string' || !payload.sub) {
      return null;
    }
    return { sub: payload.sub };
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return null;
    }
    throw error;
  }
}
