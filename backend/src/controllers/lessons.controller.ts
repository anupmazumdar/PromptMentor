import { Request, Response } from 'express';
import { prisma, isDbConnected, memoryStore } from '../utils/prisma';
import { curriculumData } from '../../../database/seed/seed';

export async function getCurriculum(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;

    if (isDbConnected && prisma) {
      const modules = await prisma.module.findMany({
        orderBy: { orderIndex: 'asc' },
        include: {
          lessons: {
            orderBy: { orderIndex: 'asc' },
            select: {
              id: true,
              title: true,
              slug: true,
              summary: true,
              orderIndex: true,
              practiceGoal: true,
              progress: userId ? { where: { userId } } : false
            }
          }
        }
      });

      // Compute tier unlock status
      const formatted = modules.map((mod: any) => {
        return {
          id: mod.id,
          level: mod.level,
          title: mod.title,
          description: mod.description,
          orderIndex: mod.orderIndex,
          lessons: mod.lessons.map((lesson: any) => {
            const userProg = lesson.progress?.[0];
            return {
              id: lesson.id,
              title: lesson.title,
              slug: lesson.slug,
              summary: lesson.summary,
              orderIndex: lesson.orderIndex,
              practiceGoal: lesson.practiceGoal,
              status: userProg?.status || 'LOCKED',
              quizPassed: userProg?.quizPassed || false,
              quizScore: userProg?.quizScore || 0
            };
          })
        };
      });

      res.status(200).json({ success: true, data: formatted });
      return;
    }

    // In-memory fallback
    const formatted = curriculumData.map((mod, modIdx) => ({
      id: `mod-${mod.level.toLowerCase()}`,
      level: mod.level,
      title: mod.title,
      description: mod.description,
      orderIndex: mod.orderIndex,
      lessons: mod.lessons.map((lesson, lesIdx) => {
        let status = mod.level === 'BASICS' ? 'IN_PROGRESS' : 'LOCKED';
        let quizPassed = false;
        let quizScore = 0;

        if (userId) {
          const progKey = `${userId}:${lesson.slug}`;
          const p = memoryStore.progress.get(progKey);
          if (p) {
            status = p.status;
            quizPassed = p.quizPassed;
            quizScore = p.quizScore;
          }
        }

        return {
          id: `les-${lesson.slug}`,
          title: lesson.title,
          slug: lesson.slug,
          summary: lesson.summary,
          orderIndex: lesson.orderIndex,
          practiceGoal: lesson.practiceGoal,
          status,
          quizPassed,
          quizScore
        };
      })
    }));

    res.status(200).json({ success: true, data: formatted });
  } catch (err: any) {
    console.error('Error fetching curriculum:', err);
    res.status(500).json({ success: false, error: 'Failed to load curriculum.' });
  }
}

export async function getLessonBySlug(req: Request, res: Response): Promise<void> {
  try {
    const { slug } = req.params;
    const userId = req.user?.userId;

    if (isDbConnected && prisma) {
      const lesson = await prisma.lesson.findUnique({
        where: { slug },
        include: {
          module: true,
          quizQuestions: {
            select: {
              id: true,
              question: true,
              options: true,
              explanation: true,
              correctIndex: true
            }
          },
          progress: userId ? { where: { userId } } : false
        }
      });

      if (!lesson) {
        res.status(404).json({ success: false, error: 'Lesson not found.' });
        return;
      }

      const userProg = lesson.progress?.[0];

      res.status(200).json({
        success: true,
        data: {
          id: lesson.id,
          level: lesson.module.level,
          moduleTitle: lesson.module.title,
          title: lesson.title,
          slug: lesson.slug,
          summary: lesson.summary,
          content: lesson.content,
          practiceGoal: lesson.practiceGoal,
          practicePrompt: lesson.practicePrompt,
          orderIndex: lesson.orderIndex,
          status: userProg?.status || 'IN_PROGRESS',
          quizPassed: userProg?.quizPassed || false,
          quizScore: userProg?.quizScore || 0,
          quizQuestions: lesson.quizQuestions.map((q: any) => ({
            id: q.id,
            question: q.question,
            options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
            correctIndex: q.correctIndex,
            explanation: q.explanation
          }))
        }
      });
      return;
    }

    // In-memory lookup
    let targetLesson: any = null;
    let targetModule: any = null;

    for (const mod of curriculumData) {
      const found = mod.lessons.find((l) => l.slug === slug);
      if (found) {
        targetLesson = found;
        targetModule = mod;
        break;
      }
    }

    if (!targetLesson) {
      res.status(404).json({ success: false, error: 'Lesson not found.' });
      return;
    }

    let status = targetModule.level === 'BASICS' ? 'IN_PROGRESS' : 'LOCKED';
    let quizPassed = false;
    let quizScore = 0;

    if (userId) {
      const p = memoryStore.progress.get(`${userId}:${slug}`);
      if (p) {
        status = p.status;
        quizPassed = p.quizPassed;
        quizScore = p.quizScore;
      }
    }

    res.status(200).json({
      success: true,
      data: {
        id: `les-${targetLesson.slug}`,
        level: targetModule.level,
        moduleTitle: targetModule.title,
        title: targetLesson.title,
        slug: targetLesson.slug,
        summary: targetLesson.summary,
        content: targetLesson.content,
        practiceGoal: targetLesson.practiceGoal,
        practicePrompt: targetLesson.practicePrompt,
        orderIndex: targetLesson.orderIndex,
        status,
        quizPassed,
        quizScore,
        quizQuestions: targetLesson.quizQuestions.map((q: any, idx: number) => ({
          id: `q-${idx}`,
          question: q.question,
          options: q.options,
          correctIndex: q.correctIndex,
          explanation: q.explanation
        }))
      }
    });
  } catch (err: any) {
    console.error('Error fetching lesson:', err);
    res.status(500).json({ success: false, error: 'Failed to retrieve lesson details.' });
  }
}
