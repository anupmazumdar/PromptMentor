import { generateAccessToken, generateRefreshToken, verifyRefreshToken, TokenPayload } from './jwt.strategy';
import { prisma, isDbConnected } from '../backend/src/utils/prisma';

// Fallback in-memory store if DB is offline/unconfigured during quick local boot
interface StoredToken {
  id: string;
  token: string;
  userId: string;
  expiresAt: Date;
  revoked: boolean;
  createdAt: Date;
}
const memoryRefreshTokens = new Map<string, StoredToken>();

export async function storeRefreshToken(userId: string, token: string): Promise<void> {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  if (isDbConnected && prisma && !userId.startsWith('guest_')) {
    try {
      await prisma.refreshToken.create({
        data: {
          token,
          userId,
          expiresAt,
          revoked: false
        }
      });
      return;
    } catch (err) {
      console.warn('⚠️ Could not store refresh token in database, falling back to in-memory store:', err);
    }
  }

  memoryRefreshTokens.set(token, {
    id: `mem-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    token,
    userId,
    expiresAt,
    revoked: false,
    createdAt: new Date()
  });
}

export async function rotateRefreshToken(oldToken: string): Promise<{ accessToken: string; refreshToken: string } | null> {
  // 1. Verify cryptographic validity
  let payload: TokenPayload;
  try {
    payload = verifyRefreshToken(oldToken);
  } catch (err) {
    return null;
  }

  // 2. Check token in DB or memory store
  let isRevoked = false;
  let isExpired = false;

  if (isDbConnected && prisma) {
    try {
      const stored = await prisma.refreshToken.findUnique({
        where: { token: oldToken }
      });

      if (!stored || stored.revoked || stored.expiresAt < new Date()) {
        return null;
      }

      // Revoke old token (one-time use rotation)
      await prisma.refreshToken.update({
        where: { id: stored.id },
        data: { revoked: true }
      });
    } catch (err) {
      console.warn('⚠️ DB error during token rotation, rejecting token:', err);
      return null;
    }
  } else {
    const stored = memoryRefreshTokens.get(oldToken);
    if (!stored || stored.revoked || stored.expiresAt < new Date()) {
      return null;
    }
    stored.revoked = true;
  }

  // 3. Issue fresh token pair
  const cleanPayload: TokenPayload = {
    userId: payload.userId,
    email: payload.email,
    role: payload.role
  };

  const newAccessToken = generateAccessToken(cleanPayload);
  const newRefreshToken = generateRefreshToken(cleanPayload);

  await storeRefreshToken(payload.userId, newRefreshToken);

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken
  };
}

export async function revokeRefreshToken(token: string): Promise<boolean> {
  if (isDbConnected && prisma) {
    try {
      await prisma.refreshToken.updateMany({
        where: { token },
        data: { revoked: true }
      });
      return true;
    } catch (err) {
      console.warn('⚠️ DB error revoking token, checking memory store:', err);
    }
  }

  const stored = memoryRefreshTokens.get(token);
  if (stored) {
    stored.revoked = true;
    return true;
  }
  return false;
}
