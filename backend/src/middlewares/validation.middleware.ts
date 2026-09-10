import { Request, Response, NextFunction } from 'express';

export function validateRegister(req: Request, res: Response, next: NextFunction): void {
  const { email, password, name } = req.body;

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    res.status(400).json({ success: false, error: 'A valid email address is required.' });
    return;
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    res.status(400).json({ success: false, error: 'Password must be at least 6 characters.' });
    return;
  }

  if (name && typeof name !== 'string') {
    res.status(400).json({ success: false, error: 'Name must be a valid string.' });
    return;
  }

  next();
}

export function validateLogin(req: Request, res: Response, next: NextFunction): void {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ success: false, error: 'Email and password are required.' });
    return;
  }

  next();
}

export function validateTutorQuery(req: Request, res: Response, next: NextFunction): void {
  const { query, level, topic } = req.body;

  if (!query || typeof query !== 'string' || query.trim().length === 0) {
    res.status(400).json({ success: false, error: 'Query string is required.' });
    return;
  }

  if (query.length > 1000) {
    res.status(400).json({ success: false, error: 'Query exceeds maximum limit of 1,000 characters.' });
    return;
  }

  next();
}

export function validateSandboxAttempt(req: Request, res: Response, next: NextFunction): void {
  const { studentPrompt } = req.body;

  if (!studentPrompt || typeof studentPrompt !== 'string' || studentPrompt.trim().length === 0) {
    res.status(400).json({ success: false, error: 'Student prompt is required for sandbox evaluation.' });
    return;
  }

  if (studentPrompt.length > 5000) {
    res.status(400).json({ success: false, error: 'Prompt exceeds maximum limit of 5,000 characters.' });
    return;
  }

  next();
}
