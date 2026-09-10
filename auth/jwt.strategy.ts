import jwt, { SignOptions, Secret } from 'jsonwebtoken';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

const JWT_ACCESS_SECRET: Secret = process.env.JWT_ACCESS_SECRET || 'promptmentor_super_secret_access_key_123';
const JWT_REFRESH_SECRET: Secret = process.env.JWT_REFRESH_SECRET || 'promptmentor_super_secret_refresh_key_456';

const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

/**
 * Generate a short-lived JWT access token (15m).
 */
export function generateAccessToken(payload: TokenPayload): string {
  const options: SignOptions = { expiresIn: ACCESS_TOKEN_EXPIRY };
  return jwt.sign(payload, JWT_ACCESS_SECRET, options);
}

/**
 * Generate a long-lived JWT refresh token (7d).
 */
export function generateRefreshToken(payload: TokenPayload): string {
  const options: SignOptions = { expiresIn: REFRESH_TOKEN_EXPIRY };
  return jwt.sign(payload, JWT_REFRESH_SECRET, options);
}

/**
 * Verify an access token. Throws if invalid or expired.
 */
export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_ACCESS_SECRET) as TokenPayload;
}

/**
 * Verify a refresh token. Throws if invalid or expired.
 */
export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_REFRESH_SECRET) as TokenPayload;
}
