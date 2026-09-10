import { Router } from 'express';
import { getCurriculum, getLessonBySlug } from '../controllers/lessons.controller';
import { optionalAuth } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', optionalAuth, getCurriculum);
router.get('/:slug', optionalAuth, getLessonBySlug);

export default router;
