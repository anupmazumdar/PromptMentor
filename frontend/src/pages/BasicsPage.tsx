import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useCurriculum } from '../hooks/useCurriculum';
import { useProgress } from '../context/ProgressContext';
import { getLessonBySlugApi } from '../services/lessons.service';
import { LessonDetail, LessonSummary } from '../types';
import { QuizModal } from '../components/QuizModal';
import { LevelBadge } from '../components/LevelBadge';
import {
  Sparkles,
  BookOpen,
  CheckCircle2,
  Terminal,
  Bot,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  Share2,
  Copy,
  Check
} from 'lucide-react';
import { MarkdownRenderer } from '../components/MarkdownRenderer';

export const BasicsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { getTierModule, isLoading: isCurrLoading } = useCurriculum();
  const { openTutor, refreshProgress } = useProgress();

  const basicsModule = getTierModule('BASICS');
  const [activeLessonSlug, setActiveLessonSlug] = useState<string>('');
  const [lessonDetail, setLessonDetail] = useState<LessonDetail | null>(null);
  const [isLoadingLesson, setIsLoadingLesson] = useState<boolean>(false);
  const [isQuizOpen, setIsQuizOpen] = useState<boolean>(false);
  const [copiedPrompt, setCopiedPrompt] = useState<boolean>(false);

  // Sync active lesson from search param or default to first lesson
  useEffect(() => {
    if (basicsModule && basicsModule.lessons.length > 0) {
      const slugFromUrl = searchParams.get('lesson');
      const targetSlug = slugFromUrl || basicsModule.lessons[0].slug;
      setActiveLessonSlug(targetSlug);
    }
  }, [basicsModule, searchParams]);

  // Load lesson detail
  useEffect(() => {
    if (!activeLessonSlug) return;

    async function loadLesson() {
      setIsLoadingLesson(true);
      try {
        const detail = await getLessonBySlugApi(activeLessonSlug);
        setLessonDetail(detail);
      } catch (err) {
        console.error('Failed to load lesson details:', err);
      } finally {
        setIsLoadingLesson(false);
      }
    }

    loadLesson();
  }, [activeLessonSlug]);

  const handleSelectLesson = (slug: string) => {
    setSearchParams({ lesson: slug });
    setActiveLessonSlug(slug);
  };

  const handleNextLesson = () => {
    if (!basicsModule) return;
    const currentIndex = basicsModule.lessons.findIndex((l) => l.slug === activeLessonSlug);
    if (currentIndex >= 0 && currentIndex < basicsModule.lessons.length - 1) {
      const nextSlug = basicsModule.lessons[currentIndex + 1].slug;
      handleSelectLesson(nextSlug);
    }
  };

  const handlePrevLesson = () => {
    if (!basicsModule) return;
    const currentIndex = basicsModule.lessons.findIndex((l) => l.slug === activeLessonSlug);
    if (currentIndex > 0) {
      const prevSlug = basicsModule.lessons[currentIndex - 1].slug;
      handleSelectLesson(prevSlug);
    }
  };

  const openSandboxWithLesson = () => {
    if (!lessonDetail) return;
    navigate('/sandbox', {
      state: {
        initialPrompt: lessonDetail.practicePrompt,
        initialLevel: 'BASICS',
        initialTopic: lessonDetail.title,
        lessonId: lessonDetail.id
      }
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Tier Header */}
      <div className="glass-card p-6 border-emerald-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <LevelBadge level="BASICS" />
            <span className="text-xs text-emerald-400 font-mono">Tier 1 Curriculum</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight break-words">Foundations of Prompt Engineering</h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl break-words">
            Master the mental models of token generation, role conditioning, zero-shot vs few-shot paradigms, and clarity constraints.
          </p>
        </div>

        <button
          onClick={() => openTutor('Teach me the fundamentals of prompt engineering', 'Basics')}
          className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 shadow-sm transition-all shrink-0"
        >
          <Bot className="w-4 h-4 mr-2 text-emerald-400" />
          Ask Basics AI Tutor
        </button>
      </div>

      {/* Main 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Sidebar: Lesson Directory */}
        <div className="lg:col-span-4 space-y-2 min-w-0">
          <div className="glass-card p-4 border-slate-800">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-2 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              Basics Lessons (6)
            </h3>

            <div className="space-y-1.5">
              {basicsModule?.lessons.map((lesson, idx) => {
                const isActive = lesson.slug === activeLessonSlug;
                return (
                  <button
                    key={lesson.id || idx}
                    onClick={() => handleSelectLesson(lesson.slug)}
                    className={`min-h-[44px] w-full text-left p-3 rounded-xl border transition-all flex items-start justify-between gap-2 text-xs ${
                      isActive
                        ? 'border-emerald-500/60 bg-emerald-500/15 text-white shadow-sm'
                        : 'border-slate-800/80 bg-slate-950/30 text-slate-300 hover:border-slate-700 hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="flex items-start gap-2.5 min-w-0 flex-1">
                      <span className="font-mono text-emerald-400 text-[11px] mt-0.5 shrink-0">0{idx + 1}.</span>
                      <div className="min-w-0 flex-1">
                        <span className="font-semibold block leading-tight truncate">{lesson.title}</span>
                        <span className="text-[11px] text-slate-400 line-clamp-1 mt-0.5 break-words">{lesson.summary}</span>
                      </div>
                    </div>

                    {lesson.quizPassed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 shrink-0 font-mono mt-0.5">
                        Quiz
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Main Reader: Lesson Content */}
        <div className="lg:col-span-8 min-w-0">
          <div className="glass-card p-4 sm:p-6 md:p-8 border-slate-800 min-h-[500px] flex flex-col justify-between min-w-0">
            {isLoadingLesson ? (
              <div className="flex-1 flex flex-col items-center justify-center py-20 space-y-3">
                <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
                <p className="text-xs text-slate-400">Loading lesson content...</p>
              </div>
            ) : lessonDetail ? (
              <div className="space-y-6 min-w-0">
                {/* Lesson Header */}
                <div className="pb-4 border-b border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider block mb-1">
                      Lesson {lessonDetail.orderIndex} of 6
                    </span>
                    <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight break-words">
                      {lessonDetail.title}
                    </h2>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => openTutor(`Explain ${lessonDetail.title}`, 'Basics')}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 border border-slate-700 text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors"
                    >
                      <Bot className="w-3.5 h-3.5 text-emerald-400" />
                      Ask Tutor
                    </button>
                    <button
                      onClick={() => setIsQuizOpen(true)}
                      className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm flex items-center gap-1.5 transition-all"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      Take Quiz
                    </button>
                  </div>
                </div>

                {/* Markdown Content */}
                {lessonDetail.content ? (
                  <MarkdownRenderer content={lessonDetail.content} themeColor="emerald" />
                ) : (
                  <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 text-center space-y-2 my-4">
                    <p className="text-sm font-medium text-amber-300">Full lesson not downloaded yet — open it once while online</p>
                    <p className="text-xs text-slate-400">This lesson's full interactive content and quiz will be saved for offline use once viewed online.</p>
                  </div>
                )}

                {/* Practice Sandbox Goal Box */}
                <div className="p-4 rounded-xl bg-slate-950/70 border border-emerald-500/30 space-y-2.5 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5 shrink-0" /> Hands-on Practice Task
                    </span>
                    <button
                      onClick={openSandboxWithLesson}
                      className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium transition-colors shrink-0"
                    >
                      Open in Sandbox <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-300 break-words">{lessonDetail.practiceGoal}</p>
                  
                  <div className="relative group p-3.5 rounded-lg bg-slate-900 font-mono text-xs text-slate-300 border border-slate-800 overflow-x-auto min-w-0">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/80 text-[11px] text-slate-400 select-none">
                      <span className="font-mono text-slate-400 text-[10px] uppercase tracking-wider">Practice Starter Prompt</span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(lessonDetail.practicePrompt);
                          setCopiedPrompt(true);
                          setTimeout(() => setCopiedPrompt(false), 2000);
                        }}
                        className="text-slate-400 hover:text-white flex items-center gap-1 transition-colors px-1.5 py-0.5 rounded hover:bg-slate-800"
                        title="Copy practice prompt"
                      >
                        {copiedPrompt ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="whitespace-pre-wrap break-words font-mono text-xs text-slate-300 font-inherit m-0">
                      {lessonDetail.practicePrompt}
                    </pre>
                  </div>
                </div>

                {/* Bottom Navigation */}
                <div className="pt-6 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                  <button
                    onClick={handlePrevLesson}
                    disabled={lessonDetail.orderIndex === 1}
                    className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white disabled:opacity-30 transition-colors min-h-[36px]"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Previous Lesson
                  </button>

                  <button
                    onClick={() => setIsQuizOpen(true)}
                    className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 transition-all min-h-[40px]"
                  >
                    Pass Quiz to Complete <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </button>

                  <button
                    onClick={handleNextLesson}
                    disabled={lessonDetail.orderIndex === 6}
                    className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white disabled:opacity-30 transition-colors min-h-[36px]"
                  >
                    Next Lesson <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Quiz Modal */}
      {lessonDetail && (
        <QuizModal
          isOpen={isQuizOpen}
          onClose={() => setIsQuizOpen(false)}
          lessonSlug={lessonDetail.slug}
          lessonTitle={lessonDetail.title}
          quizQuestions={lessonDetail.quizQuestions}
          onQuizPassed={() => {
            refreshProgress();
          }}
        />
      )}
    </div>
  );
};
