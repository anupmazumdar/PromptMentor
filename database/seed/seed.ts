import { PrismaClient } from '@prisma/client';
import { curriculumData, SeedLesson, SeedModule } from './curriculumData';

export { curriculumData, SeedLesson, SeedModule };

export async function seedCurriculum() {
  const prisma = new PrismaClient();
  console.log('🌱 Starting curriculum database seed...');

  for (const modData of curriculumData) {
    console.log(`Processing Module: [${modData.level}] ${modData.title}`);

    // Upsert Module
    const existingModule = await prisma.module.findFirst({
      where: { level: modData.level, title: modData.title }
    });

    const moduleRecord = existingModule
      ? await prisma.module.update({
          where: { id: existingModule.id },
          data: {
            description: modData.description,
            orderIndex: modData.orderIndex
          }
        })
      : await prisma.module.create({
          data: {
            level: modData.level,
            title: modData.title,
            description: modData.description,
            orderIndex: modData.orderIndex
          }
        });

    // Upsert Lessons
    for (const lessonData of modData.lessons) {
      const existingLesson = await prisma.lesson.findUnique({
        where: { slug: lessonData.slug }
      });

      const lessonRecord = existingLesson
        ? await prisma.lesson.update({
            where: { id: existingLesson.id },
            data: {
              moduleId: moduleRecord.id,
              title: lessonData.title,
              summary: lessonData.summary,
              content: lessonData.content,
              practiceGoal: lessonData.practiceGoal,
              practicePrompt: lessonData.practicePrompt,
              orderIndex: lessonData.orderIndex
            }
          })
        : await prisma.lesson.create({
            data: {
              moduleId: moduleRecord.id,
              title: lessonData.title,
              slug: lessonData.slug,
              summary: lessonData.summary,
              content: lessonData.content,
              practiceGoal: lessonData.practiceGoal,
              practicePrompt: lessonData.practicePrompt,
              orderIndex: lessonData.orderIndex
            }
          });

      // Clear existing questions and re-insert
      await prisma.quizQuestion.deleteMany({
        where: { lessonId: lessonRecord.id }
      });

      for (const q of lessonData.quizQuestions) {
        await prisma.quizQuestion.create({
          data: {
            lessonId: lessonRecord.id,
            question: q.question,
            options: JSON.stringify(q.options),
            correctIndex: q.correctIndex,
            explanation: q.explanation
          }
        });
      }
    }
  }

  // Upsert Default Demo Student User
  await prisma.user.upsert({
    where: { email: 'student@promptmentor.ai' },
    update: {},
    create: {
      email: 'student@promptmentor.ai',
      passwordHash: '$2b$10$5uDSuScnyffgu6oB8/Y8q.ur1M04LJUkmDghVoiOznj57tYTZhoVy',
      name: 'Demo Student',
      role: 'STUDENT',
      currentLevel: 'BASICS'
    }
  });

  console.log('✅ Curriculum and demo student account seeded successfully!');
  await prisma.$disconnect();
}

if (typeof require !== 'undefined' && require.main === module) {
  seedCurriculum()
    .catch((err) => {
      console.error('❌ Error during seeding:', err);
      process.exit(1);
    });
}
