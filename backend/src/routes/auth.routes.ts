import { Router } from 'express';
import { register, login, refresh, logout, getMe } from '../controllers/auth.controller';
import { validateRegister, validateLogin } from '../middlewares/validation.middleware';
import { authenticateToken } from '../middlewares/auth.middleware';
import { authRateLimiter } from '../../../security/rateLimiter';

const router = Router();

router.post('/register', authRateLimiter, validateRegister, register);
router.post('/login', authRateLimiter, validateLogin, login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/me', authenticateToken, getMe);

export default router;
