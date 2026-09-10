import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '../../../auth/jwt.strategy';

// Extend Express Request interface to include authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export function authenticateToken(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    res.status(401).json({
      success: false,
      error: 'Access token required. Please log in.'
    });
    return;
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch (err: any) {
    const isExpired = err?.name === 'TokenExpiredError';
    res.status(401).json({
      success: false,
      error: isExpired ? 'Access token expired. Please refresh session.' : 'Invalid access token.',
      code: isExpired ? 'TOKEN_EXPIRED' : 'TOKEN_INVALID'
    });
  }
}

/**
 * Optional authentication: if token is present and valid, attaches user; otherwise proceeds as guest.
 */
export function optionalAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (token) {
    try {
      req.user = verifyAccessToken(token);
    } catch {
      // Ignore token failure for optional auth
    }
  }
  next();
}
