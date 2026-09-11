import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useProgress } from '../context/ProgressContext';
import { useCurriculum } from '../hooks/useCurriculum';
import { ProgressCard } from '../components/ProgressCard';
import { LevelBadge } from '../components/LevelBadge';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Bot,
  Terminal,
  ArrowRight,
  CheckCircle2,
  Lock,
  Search,
  Clock,
  Compass
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { progress, openTutor, recentAttempts, isLoading: isProgLoading } = useProgress();
  const { modules } = useCurriculum();

  const [quickQuery, setQuickQuery] = useState('');

  const handleQuickAsk = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickQuery.trim()) return;
    openTutor(quickQuery.trim(), user?.currentLevel || 'Basics');
    setQuickQuery('');
  };

  const basicsModule = modules.find((m) => m.level === 'BASICS');
  const interModule = modules.find((m) => m.level === 'INTERMEDIATE');
  const advModule = modules.find((m) => m.level === 'ADVANCED');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Hero Welcome & Quick Ask */}
      <div className="glass-card p-6 md:p-8 border-slate-800/80 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-violet-600/15 via-cyan-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-wider text-violet-400 font-semibold">
                AI Prompt Engineering Academy
              </span>
              {isAuthenticated && user && (
                <LevelBadge level={user.currentLevel || 'BASICS'} size="sm" />
              )}
            </div>
            <h1 className="fluid-h1 font-extrabold text-white tracking-tight">
              {isAuthenticated && user
                ? `Welcome back, ${user.name || user.email.split('@')[0]}!`
                : 'Master Prompt Engineering with AI'}
            </h1>
            <p className="fluid-body text-slate-400 max-w-xl">
              Learn structured prompting through Socratic AI guidance, interactive quizzes, and a real-time evaluation sandbox.
            </p>
          </div>

          {/* Quick Actions (min 44px touch targets) */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => openTutor('What is prompt engineering?', 'Basics')}
              className="min-h-[44px] inline-flex items-center px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 transition-all shadow-sm"
            >
              <Bot className="w-4 h-4 mr-2 text-violet-400" />
              Ask AI Tutor
            </button>
            <Link
              to="/sandbox"
              className="min-h-[44px] inline-flex items-center px-4 py-2.5 rounded-xl text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white shadow-glow-violet transition-all"
            >
              <Terminal className="w-4 h-4 mr-2" />
              Open Sandbox
            </Link>
          </div>
        </div>

        {/* Floating Quick Ask Bar */}
        <div className="mt-6 pt-6 border-t border-slate-800/60">
          <form onSubmit={handleQuickAsk} className="relative flex items-center">
            <Search className="w-4 h-4 absolute left-4 text-slate-500 pointer-events-none" />
            <input
              type="text"
              value={quickQuery}
              onChange={(e) => setQuickQuery(e.target.value)}
              placeholder="Ask PromptMentor anything (e.g. 'what is few-shot prompting?', 'define chain-of-thought')..."
              className="w-full pl-11 pr-32 py-3 rounded-xl bg-slate-950/70 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-500/80 shadow-inner min-h-[44px]"
            />
            <button
              type="submit"
              className="absolute right-1.5 min-h-[36px] px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white transition-all flex items-center gap-1 shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ask Tutor</span>
            </button>
          </form>
        </div>
      </div>

      {/* Progress Card */}
      <ProgressCard progress={progress} isLoading={isProgLoading} />

      {/* 3 Tier Curriculum Roadmaps: auto-fit grid, no forced stretching */}
      <div className="space-y-4">
        <div>
          <h2 className="fluid-h2 font-bold text-white tracking-tight flex items-center gap-2">
            <Compass className="w-5 h-5 text-violet-400 shrink-0" />
            Curriculum Roadmap
          </h2>
          <p className="fluid-body text-slate-400">Content served level by level with sequential mastery</p>
        </div>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,280px),360px))] gap-6 justify-center">
          {/* Tier 1: Basics Card */}
          <div className="glass-card p-6 border-emerald-500/30 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <LevelBadge level="BASICS" isUnlocked={true} />
                <span className="text-xs text-emerald-400 font-mono">6 Lessons</span>
              </div>
              <h3 className="font-bold text-base text-white mb-1">Basics</h3>
              <p className="text-xs text-slate-400 mb-4">
                Tokens, zero-shot vs few-shot, role assignment, clarity & formatting.
              </p>

              <div className="space-y-2 mb-6">
                {basicsModule?.lessons.slice(0, 4).map((les, idx) => (
                  <Link
                    key={les.id || idx}
                    to={`/curriculum/basics?lesson=${les.slug}`}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/40 hover:bg-slate-900 border border-slate-900 text-xs transition-colors min-h-[38px] gap-2 min-w-0"
                  >
                    <span className="truncate text-slate-300 min-w-0 flex-1">{les.title}</span>
                    {les.quizPassed ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    ) : (
                      <ArrowRight className="w-3 h-3 text-slate-500 shrink-0" />
                    )}
                  </Link>
                ))}
              </div>
            </div>

            <Link
              to="/curriculum/basics"
              className="min-h-[44px] w-full inline-flex items-center justify-center py-2.5 rounded-xl text-xs font-semibold bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 transition-all"
            >
              Enter Basics Tier <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Link>
          </div>

          {/* Tier 2: Intermediate Card */}
          <div className="glass-card p-6 border-cyan-500/30 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <LevelBadge
                  level="INTERMEDIATE"
                  isUnlocked={progress?.tiers?.intermediate?.unlocked || false}
                />
                <span className="text-xs text-cyan-400 font-mono">7 Lessons</span>
              </div>
              <h3 className="font-bold text-base text-white mb-1">Intermediate</h3>
              <p className="text-xs text-slate-400 mb-4 break-words">
                Chain-of-thought, prompt chaining, parameters, XML delimiters & anti-hallucination.
              </p>

              <div className="space-y-2 mb-6">
                {interModule?.lessons.slice(0, 4).map((les, idx) => (
                  <div
                    key={les.id || idx}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/40 border border-slate-900 text-xs text-slate-400 min-h-[38px] gap-2 min-w-0"
                  >
                    <span className="truncate min-w-0 flex-1">{les.title}</span>
                    {les.quizPassed ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    ) : progress?.tiers?.intermediate?.unlocked ? (
                      <ArrowRight className="w-3 h-3 text-slate-500 shrink-0" />
                    ) : (
                      <Lock className="w-3 h-3 text-slate-600 shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <Link
              to="/curriculum/intermediate"
              className="min-h-[44px] w-full inline-flex items-center justify-center py-2.5 rounded-xl text-xs font-semibold bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 transition-all"
            >
              Explore Intermediate Tier <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Link>
          </div>

          {/* Tier 3: Advanced Card */}
          <div className="glass-card p-6 border-violet-500/30 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <LevelBadge
                  level="ADVANCED"
                  isUnlocked={progress?.tiers?.advanced?.unlocked || false}
                />
                <span className="text-xs text-violet-400 font-mono">7 Lessons</span>
              </div>
              <h3 className="font-bold text-base text-white mb-1">Advanced</h3>
              <p className="text-xs text-slate-400 mb-4 break-words">
                ReAct, RAG architectures, tool-use schemas, injection defenses & multi-agent systems.
              </p>

              <div className="space-y-2 mb-6">
                {advModule?.lessons.slice(0, 4).map((les, idx) => (
                  <div
                    key={les.id || idx}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/40 border border-slate-900 text-xs text-slate-400 min-h-[38px] gap-2 min-w-0"
                  >
                    <span className="truncate min-w-0 flex-1">{les.title}</span>
                    {progress?.tiers?.advanced?.unlocked ? (
                      <ArrowRight className="w-3 h-3 text-slate-500 shrink-0" />
                    ) : (
                      <Lock className="w-3 h-3 text-slate-600 shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <Link
              to="/curriculum/advanced"
              className="min-h-[44px] w-full inline-flex items-center justify-center py-2.5 rounded-xl text-xs font-semibold bg-violet-500/15 hover:bg-violet-500/25 text-violet-300 border border-violet-500/30 transition-all"
            >
              Explore Advanced Tier <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Sandbox Attempts: auto-fit grid */}
      {recentAttempts.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="fluid-h2 font-bold text-white tracking-tight flex items-center gap-2">
              <Clock className="w-5 h-5 text-cyan-400 shrink-0" />
              Recent Practice Attempts
            </h2>
            <Link to="/sandbox" className="text-xs text-violet-400 hover:text-violet-300 min-h-[36px] inline-flex items-center">
              Go to Sandbox →
            </Link>
          </div>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,260px),360px))] gap-6 justify-center">
            {recentAttempts.slice(0, 3).map((att) => (
              <div key={att.id} className="glass-card p-5 border-slate-800 space-y-2 flex flex-col justify-between min-w-0">
                <div>
                  <div className="flex items-center justify-between mb-1 gap-2 min-w-0">
                    <span className="text-xs font-bold text-slate-200 truncate min-w-0 flex-1">
                      {att.taskTitle}
                    </span>
                    <span
                      className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full shrink-0 ${
                        att.score >= 80
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : att.score >= 60
                          ? 'bg-cyan-500/20 text-cyan-400'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}
                    >
                      {att.score}/100
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2 font-mono bg-slate-950/60 p-2.5 rounded-xl border border-slate-900 break-words">
                    "{att.studentPrompt}"
                  </p>
                </div>
                <div className="text-[10px] text-slate-500 flex items-center justify-between pt-1 font-mono">
                  <span>Tier: {att.level}</span>
                  <span>{new Date(att.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
