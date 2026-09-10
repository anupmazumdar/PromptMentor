import jwt, { SignOptions, Secret } from 'jsonwebtoken';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}
import dotenv from 'dotenv';

// Load environment variables if running independently or before server.ts
dotenv.config();

function getRequiredJwtSecret(varName: 'JWT_ACCESS_SECRET' | 'JWT_REFRESH_SECRET'): Secret {
  const secret = process.env[varName];
  if (!secret || typeof secret !== 'string' || secret.trim().length === 0) {
    throw new Error(
      `[FATAL CONFIG ERROR] Missing required environment variable: ${varName}. ` +
      `PromptMentor requires secure, non-empty secret keys for JWT authentication. ` +
      `Please set ${varName} in your environment or .env file before starting the server.`
    );
  }
  return secret;
}

const JWT_ACCESS_SECRET: Secret = getRequiredJwtSecret('JWT_ACCESS_SECRET');
const JWT_REFRESH_SECRET: Secret = getRequiredJwtSecret('JWT_REFRESH_SECRET');

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
