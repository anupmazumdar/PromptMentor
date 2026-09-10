import { Request, Response } from 'express';
import crypto from 'crypto';
import { hashPassword, comparePassword } from '../../../auth/passwordHash.util';
import { generateAccessToken, generateRefreshToken, TokenPayload } from '../../../auth/jwt.strategy';
import { storeRefreshToken, rotateRefreshToken, revokeRefreshToken } from '../../../auth/refreshToken.service';
import { prisma, isDbConnected, memoryStore, MemoryUser } from '../utils/prisma';

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { email, password, name } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    // 1. Check existing user
    if (isDbConnected && prisma) {
      const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
      if (existing) {
        res.status(409).json({ success: false, error: 'An account with this email already exists.' });
        return;
      }
    } else {
      if (memoryStore.users.has(normalizedEmail)) {
        res.status(409).json({ success: false, error: 'An account with this email already exists.' });
        return;
      }
    }

    // 2. Hash password
    const passwordHash = await hashPassword(password);
    const userId = `user_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

    let createdUser: { id: string; email: string; name: string | null; role: string; currentLevel: string };

    if (isDbConnected && prisma) {
      createdUser = await prisma.user.create({
        data: {
          email: normalizedEmail,
          passwordHash,
          name: name || null,
          role: 'STUDENT',
          currentLevel: 'BASICS'
        },
        select: { id: true, email: true, name: true, role: true, currentLevel: true }
      });
    } else {
      const memUser: MemoryUser = {
        id: userId,
        email: normalizedEmail,
        passwordHash,
        name: name || 'Student',
        role: 'STUDENT',
        currentLevel: 'BASICS',
        createdAt: new Date()
      };
      memoryStore.users.set(normalizedEmail, memUser);
      createdUser = {
        id: memUser.id,
        email: memUser.email,
        name: memUser.name,
        role: memUser.role,
        currentLevel: memUser.currentLevel
      };
    }

    // 3. Issue tokens
    const tokenPayload: TokenPayload = {
      userId: createdUser.id,
      email: createdUser.email,
      role: createdUser.role
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    await storeRefreshToken(createdUser.id, refreshToken);

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      data: {
        user: createdUser,
        accessToken,
        refreshToken
      }
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    res.status(500).json({ success: false, error: 'Failed to create user account.' });
  }
}

// Precomputed bcrypt dummy hash for constant-time email enumeration mitigation (Task 3)
const DUMMY_BCRYPT_HASH = '$2b$10$MuIIy13ulo242ehy4RMntO0tfGfaG8O8gUjhr7IXXwb/9HOMYFNLW';

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    let user: { id: string; email: string; passwordHash: string; name: string | null; role: string; currentLevel: string } | null = null;

    if (isDbConnected && prisma) {
      user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    } else {
      const memUser = memoryStore.users.get(normalizedEmail);
      if (memUser) {
        user = memUser;
      }
    }

    if (!user) {
      // Execute bcrypt compare against dummy hash to ensure constant response time
      await comparePassword(password, DUMMY_BCRYPT_HASH);
      res.status(401).json({ success: false, error: 'Invalid email or password.' });
      return;
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ success: false, error: 'Invalid email or password.' });
      return;
    }

    const tokenPayload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    await storeRefreshToken(user.id, refreshToken);

    res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          currentLevel: user.currentLevel
        },
        accessToken,
        refreshToken
      }
    });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, error: 'Failed to authenticate user.' });
  }
}

export async function refresh(req: Request, res: Response): Promise<void> {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken || typeof refreshToken !== 'string') {
      res.status(400).json({ success: false, error: 'Refresh token is required.' });
      return;
    }

    const newTokens = await rotateRefreshToken(refreshToken);
    if (!newTokens) {
      res.status(401).json({ success: false, error: 'Refresh token expired or revoked. Please log in again.' });
      return;
    }

    res.status(200).json({
      success: true,
      data: newTokens
    });
  } catch (err: any) {
    console.error('Token refresh error:', err);
    res.status(500).json({ success: false, error: 'Failed to refresh authentication session.' });
  }
}

export async function logout(req: Request, res: Response): Promise<void> {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await revokeRefreshToken(refreshToken);
    }
    res.status(200).json({ success: true, message: 'Logged out successfully.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to logout properly.' });
  }
}

export async function getMe(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Not authenticated.' });
      return;
    }

    let user: any = null;
    if (isDbConnected && prisma && !userId.startsWith('guest_')) {
      user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, name: true, role: true, currentLevel: true, createdAt: true }
      });
    } else {
      for (const u of memoryStore.users.values()) {
        if (u.id === userId) {
          user = { id: u.id, email: u.email, name: u.name, role: u.role, currentLevel: u.currentLevel, createdAt: u.createdAt };
          break;
        }
      }
    }

    if (!user) {
      res.status(404).json({ success: false, error: 'User profile not found.' });
      return;
    }

    res.status(200).json({ success: true, data: user });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to fetch user profile.' });
  }
}

/**
 * Purge expired guest sessions, progress, and attempts older than 24 hours.
 */
export function cleanupExpiredGuests(): void {
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  for (const [email, u] of memoryStore.users.entries()) {
    if (u.id.startsWith('guest_') && u.createdAt.getTime() < cutoff) {
      memoryStore.users.delete(email);
    }
  }
  for (const [key, p] of memoryStore.progress.entries()) {
    if (key.startsWith('guest_') && p.completedAt && p.completedAt.getTime() < cutoff) {
      memoryStore.progress.delete(key);
    }
  }
  memoryStore.attempts = memoryStore.attempts.filter(
    (a) => !(a.userId.startsWith('guest_') && a.createdAt.getTime() < cutoff)
  );
}

export async function demoLogin(req: Request, res: Response): Promise<void> {
  try {
    cleanupExpiredGuests();

    const guestSuffix = crypto.randomUUID().slice(0, 8);
    const guestId = `guest_${guestSuffix}_${Date.now().toString(36)}`;
    const guestEmail = `${guestId}@promptmentor.demo`;

    const guestUser: MemoryUser = {
      id: guestId,
      email: guestEmail,
      passwordHash: '', // guest accounts cannot be accessed via login form
      name: `Guest Student (${guestSuffix})`,
      role: 'STUDENT',
      currentLevel: 'BASICS',
      createdAt: new Date()
    };

    memoryStore.users.set(guestEmail, guestUser);

    const user = {
      id: guestUser.id,
      email: guestUser.email,
      name: guestUser.name,
      role: guestUser.role,
      currentLevel: guestUser.currentLevel
    };

    const tokenPayload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    await storeRefreshToken(user.id, refreshToken);

    res.status(200).json({
      success: true,
      message: 'Demo login successful.',
      data: {
        user,
        accessToken,
        refreshToken
      }
    });
  } catch (err: any) {
    console.error('Demo login error:', err);
    res.status(500).json({ success: false, error: 'Failed to authenticate demo account.' });
  }
}
