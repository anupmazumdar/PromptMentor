import { Request, Response } from 'express';
import { prisma, isDbConnected, memoryStore } from '../utils/prisma';
import { curriculumData } from '../../../database/seed/seed';

export async function getUserProgress(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ success: false, error: 'Authentication required.' });
      return;
    }

    if (isDbConnected && prisma && !userId.startsWith('guest_')) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          progress: {
            include: {
              lesson: {
                include: { module: true }
              }
            }
          }
        }
      });

      if (!user) {
        res.status(404).json({ success: false, error: 'User not found.' });
        return;
      }

      // Calculate total counts
      const modules = await prisma.module.findMany({
        include: { lessons: true }
      });

      let totalLessons = 0;
      let basicsTotal = 0;
      let intermediateTotal = 0;
      let advancedTotal = 0;

      modules.forEach((m: any) => {
        totalLessons += m.lessons.length;
        if (m.level === 'BASICS') basicsTotal += m.lessons.length;
        if (m.level === 'INTERMEDIATE') intermediateTotal += m.lessons.length;
        if (m.level === 'ADVANCED') advancedTotal += m.lessons.length;
      });

      let basicsCompleted = 0;
      let intermediateCompleted = 0;
      let advancedCompleted = 0;

      user.progress.forEach((p: any) => {
        if (p.status === 'COMPLETED') {
          if (p.lesson.module.level === 'BASICS') basicsCompleted++;
          if (p.lesson.module.level === 'INTERMEDIATE') intermediateCompleted++;
          if (p.lesson.module.level === 'ADVANCED') advancedCompleted++;
        }
      });

      const totalCompleted = basicsCompleted + intermediateCompleted + advancedCompleted;
      const basicsPercentage = basicsTotal > 0 ? Math.round((basicsCompleted / basicsTotal) * 100) : 0;
      const intermediatePercentage = intermediateTotal > 0 ? Math.round((intermediateCompleted / intermediateTotal) * 100) : 0;
      const advancedPercentage = advancedTotal > 0 ? Math.round((advancedCompleted / advancedTotal) * 100) : 0;
      const overallPercentage = totalLessons > 0 ? Math.round((totalCompleted / totalLessons) * 100) : 0;

      // Determine level unlock status
      const intermediateUnlocked = basicsPercentage === 100 || user.currentLevel === 'INTERMEDIATE' || user.currentLevel === 'ADVANCED';
      const advancedUnlocked = intermediatePercentage === 100 || user.currentLevel === 'ADVANCED';

      res.status(200).json({
        success: true,
        data: {
          currentLevel: user.currentLevel,
          overallPercentage,
          totalCompleted,
          totalLessons,
          tiers: {
            basics: {
              completed: basicsCompleted,
              total: basicsTotal,
              percentage: basicsPercentage,
              unlocked: true
            },
            intermediate: {
              completed: intermediateCompleted,
              total: intermediateTotal,
              percentage: intermediatePercentage,
              unlocked: intermediateUnlocked
            },
            advanced: {
              completed: advancedCompleted,
              total: advancedTotal,
              percentage: advancedPercentage,
              unlocked: advancedUnlocked
            }
          }
        }
      });
      return;
    }

    // In-memory fallback
    let basicsTotal = 0;
    let intermediateTotal = 0;
    let advancedTotal = 0;

    curriculumData.forEach((m) => {
      if (m.level === 'BASICS') basicsTotal += m.lessons.length;
      if (m.level === 'INTERMEDIATE') intermediateTotal += m.lessons.length;
      if (m.level === 'ADVANCED') advancedTotal += m.lessons.length;
    });

    let basicsCompleted = 0;
    let intermediateCompleted = 0;
    let advancedCompleted = 0;

    for (const [key, p] of memoryStore.progress.entries()) {
      if (key.startsWith(`${userId}:`) && p.status === 'COMPLETED') {
        // match lesson
        for (const m of curriculumData) {
          const l = m.lessons.find((les) => `${userId}:${les.slug}` === key || `${userId}:${les.title}` === key);
          if (l) {
            if (m.level === 'BASICS') basicsCompleted++;
            if (m.level === 'INTERMEDIATE') intermediateCompleted++;
            if (m.level === 'ADVANCED') advancedCompleted++;
          }
        }
      }
    }

    const totalLessons = basicsTotal + intermediateTotal + advancedTotal;
    const totalCompleted = basicsCompleted + intermediateCompleted + advancedCompleted;
    const basicsPercentage = basicsTotal > 0 ? Math.round((basicsCompleted / basicsTotal) * 100) : 0;
    const intermediatePercentage = intermediateTotal > 0 ? Math.round((intermediateCompleted / intermediateTotal) * 100) : 0;
    const advancedPercentage = advancedTotal > 0 ? Math.round((advancedCompleted / advancedTotal) * 100) : 0;
    const overallPercentage = totalLessons > 0 ? Math.round((totalCompleted / totalLessons) * 100) : 0;

    res.status(200).json({
      success: true,
      data: {
        currentLevel: 'BASICS',
        overallPercentage,
        totalCompleted,
        totalLessons,
        tiers: {
          basics: { completed: basicsCompleted, total: basicsTotal, percentage: basicsPercentage, unlocked: true },
          intermediate: { completed: intermediateCompleted, total: intermediateTotal, percentage: intermediatePercentage, unlocked: basicsPercentage >= 100 },
          advanced: { completed: advancedCompleted, total: advancedTotal, percentage: advancedPercentage, unlocked: intermediatePercentage >= 100 }
        }
      }
    });
  } catch (err: any) {
    console.error('Error calculating progress:', err);
    res.status(500).json({ success: false, error: 'Failed to retrieve progress stats.' });
  }
}

export async function submitQuiz(req: Request, res: Response): Promise<void> {
  try {
    const { lessonSlug, answers } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ success: false, error: 'Authentication required.' });
      return;
    }

    if (!answers || !Array.isArray(answers)) {
      res.status(400).json({ success: false, error: 'Answers array is required.' });
      return;
    }

    if (isDbConnected && prisma && !userId.startsWith('guest_')) {
      const lesson = await prisma.lesson.findUnique({
        where: { slug: lessonSlug },
        include: {
          module: true,
          quizQuestions: { orderBy: { id: 'asc' } }
        }
      });

      if (!lesson) {
        res.status(404).json({ success: false, error: 'Lesson not found.' });
        return;
      }

      let correctCount = 0;
      const questionResults = lesson.quizQuestions.map((q: any, idx: number) => {
        const studentChoice = answers[idx];
        const isCorrect = studentChoice === q.correctIndex;
        if (isCorrect) correctCount++;
        return {
          questionId: q.id,
          isCorrect,
          correctIndex: q.correctIndex,
          explanation: q.explanation
        };
      });

      const totalQuestions = lesson.quizQuestions.length;
      const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 100;
      const passed = score >= 70;

      // Upsert progress
      await prisma.progress.upsert({
        where: {
          userId_lessonId: {
            userId,
            lessonId: lesson.id
          }
        },
        create: {
          userId,
          lessonId: lesson.id,
          status: passed ? 'COMPLETED' : 'IN_PROGRESS',
          quizPassed: passed,
          quizScore: score,
          completedAt: passed ? new Date() : null
        },
        update: {
          status: passed ? 'COMPLETED' : 'IN_PROGRESS',
          quizPassed: passed,
          quizScore: Math.max(score, 0),
          completedAt: passed ? new Date() : null
        }
      });

      res.status(200).json({
        success: true,
        data: {
          passed,
          score,
          correctCount,
          totalQuestions,
          results: questionResults
        }
      });
      return;
    }

    // In-memory grading
    let targetLesson: any = null;
    for (const mod of curriculumData) {
      const l = mod.lessons.find((item) => item.slug === lessonSlug);
      if (l) {
        targetLesson = l;
        break;
      }
    }

    if (!targetLesson) {
      res.status(404).json({ success: false, error: 'Lesson not found.' });
      return;
    }

    let correctCount = 0;
    const results = targetLesson.quizQuestions.map((q: any, idx: number) => {
      const studentChoice = answers[idx];
      const isCorrect = studentChoice === q.correctIndex;
      if (isCorrect) correctCount++;
      return {
        questionId: `q-${idx}`,
        isCorrect,
        correctIndex: q.correctIndex,
        explanation: q.explanation
      };
    });

    const totalQuestions = targetLesson.quizQuestions.length;
    const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 100;
    const passed = score >= 70;

    memoryStore.progress.set(`${userId}:${lessonSlug}`, {
      userId,
      lessonId: targetLesson.slug,
      status: passed ? 'COMPLETED' : 'IN_PROGRESS',
      quizPassed: passed,
      quizScore: score,
      completedAt: passed ? new Date() : undefined
    });

    res.status(200).json({
      success: true,
      data: {
        passed,
        score,
        correctCount,
        totalQuestions,
        results
      }
    });
  } catch (err: any) {
    console.error('Error submitting quiz:', err);
    res.status(500).json({ success: false, error: 'Failed to evaluate quiz submission.' });
  }
}

export async function getUserAttempts(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(200).json({ success: true, data: [] });
      return;
    }

    if (isDbConnected && prisma && !userId.startsWith('guest_')) {
      const attempts = await prisma.promptAttempt.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 20
      });
      res.status(200).json({ success: true, data: attempts });
      return;
    }

    const userAttempts = memoryStore.attempts
      .filter((a) => a.userId === userId)
      .slice(0, 20);

    res.status(200).json({ success: true, data: userAttempts });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to retrieve attempts.' });
  }
}
