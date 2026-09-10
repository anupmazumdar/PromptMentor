import { Request, Response, NextFunction } from 'express';

/**
 * Basic HTML tag and control character stripper to prevent stored/reflected XSS.
 */
export function sanitizeString(input: string, maxLength: number = 4000): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Strip script blocks
    .replace(/[<>]/g, (char) => (char === '<' ? '&lt;' : '&gt;')) // Escape raw angle brackets
    .trim()
    .slice(0, maxLength);
}

/**
 * Middleware that inspects and sanitizes text inputs in req.body.
 */
export function inputSanitizerMiddleware(req: Request, res: Response, next: NextFunction): void {
  if (req.body && typeof req.body === 'object') {
    for (const key of Object.keys(req.body)) {
      if (typeof req.body[key] === 'string') {
        // Enforce max bounds depending on field and apply XSS sanitization
        const maxLen = key.includes('prompt') ? 8000 : 2000;
        req.body[key] = sanitizeString(req.body[key], maxLen);
      }
    }
  }
  next();
}
