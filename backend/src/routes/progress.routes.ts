import { Router } from 'express';
import { getUserProgress, submitQuiz, getUserAttempts } from '../controllers/progress.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', authenticateToken, getUserProgress);
router.post('/quiz', authenticateToken, submitQuiz);
router.get('/attempts', authenticateToken, getUserAttempts);

export default router;
