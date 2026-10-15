import { afterEach, describe, expect, it, vi } from 'vitest';
import { assertJwtSecret, signToken, verifyToken } from './auth';

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('JWT authentication', () => {
  it('signs and verifies a user token', () => {
    vi.stubEnv('JWT_SECRET', 'test-secret');
    const token = signToken('user-123');

    expect(verifyToken(token)).toEqual({ sub: 'user-123' });
  });

  it('rejects invalid tokens', () => {
    vi.stubEnv('JWT_SECRET', 'test-secret');

    expect(verifyToken('invalid')).toBeNull();
  });

  it('requires a secret and rejects weak production secrets', () => {
    vi.stubEnv('JWT_SECRET', '');
    expect(() => assertJwtSecret()).toThrow('JWT_SECRET must be set');

    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('JWT_SECRET', 'short');
    expect(() => assertJwtSecret()).toThrow(
      'Production JWT_SECRET must be a unique secret of at least 32 bytes',
    );
  });
});
