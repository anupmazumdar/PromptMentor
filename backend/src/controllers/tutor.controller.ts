import { Request, Response } from 'express';
import { askTutorAI, critiqueStudentPrompt } from '../services/openrouter.service';
import { prisma, isDbConnected, memoryStore } from '../utils/prisma';

export async function handleTutorChat(req: Request, res: Response): Promise<void> {
  try {
    const { query, level, topic, history } = req.body;

    const reply = await askTutorAI(
      query,
      level || 'Basics',
      topic || 'Prompt Engineering Basics',
      history || []
    );

    res.status(200).json({
      success: true,
      data: {
        reply,
        level: level || 'Basics',
        topic: topic || 'General Prompt Engineering'
      }
    });
  } catch (err: any) {
    console.error('Tutor chat controller error:', err);
    res.status(500).json({ success: false, error: 'Failed to process AI tutor request.' });
  }
}

export async function handleSandboxCritique(req: Request, res: Response): Promise<void> {
  try {
    const { studentPrompt, level, topic, practiceGoal, lessonId } = req.body;
    const userId = req.user?.userId || 'guest_student';

    const critique = await critiqueStudentPrompt(
      studentPrompt,
      level || 'Basics',
      topic || 'Prompt Construction',
      practiceGoal || 'Create a robust prompt'
    );

    // Persist attempt (guests stay strictly in-memory)
    if (isDbConnected && prisma && req.user?.userId && !req.user.userId.startsWith('guest_')) {
      try {
        await prisma.promptAttempt.create({
          data: {
            userId: req.user.userId,
            lessonId: lessonId || null,
            level: level || 'Basics',
            taskTitle: topic || practiceGoal || 'Sandbox Practice',
            studentPrompt,
            systemPromptUsed: `Level: ${level}, Goal: ${practiceGoal}`,
            aiCritique: JSON.stringify(critique),
            score: critique.score
          }
        });
      } catch (dbErr) {
        console.warn('⚠️ Could not persist prompt attempt to DB:', dbErr);
      }
    } else {
      memoryStore.attempts.unshift({
        id: `att-${Date.now()}`,
        userId,
        lessonId,
        level: level || 'Basics',
        taskTitle: topic || practiceGoal || 'Sandbox Practice',
        studentPrompt,
        systemPromptUsed: `Level: ${level}, Goal: ${practiceGoal}`,
        aiCritique: JSON.stringify(critique),
        score: critique.score,
        createdAt: new Date()
      });
    }

    res.status(200).json({
      success: true,
      data: {
        ...critique,
        submittedAt: new Date().toISOString()
      }
    });
  } catch (err: any) {
    console.error('Sandbox critique controller error:', err);
    res.status(500).json({ success: false, error: 'Failed to evaluate prompt.' });
  }
}
