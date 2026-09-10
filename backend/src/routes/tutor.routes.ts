import { Router } from 'express';
import { handleTutorChat, handleSandboxCritique } from '../controllers/tutor.controller';
import { validateTutorQuery, validateSandboxAttempt } from '../middlewares/validation.middleware';
import { optionalAuth } from '../middlewares/auth.middleware';
import { aiRateLimiter } from '../../../security/rateLimiter';

const router = Router();

router.post('/chat', aiRateLimiter, optionalAuth, validateTutorQuery, handleTutorChat);
router.post('/sandbox', aiRateLimiter, optionalAuth, validateSandboxAttempt, handleSandboxCritique);

export default router;
