import React from 'react';
import { OverallProgress } from '../types';
import { Sparkles, Zap, Shield, Trophy, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ProgressCardProps {
  progress: OverallProgress | null;
  isLoading?: boolean;
}

export const ProgressCard: React.FC<ProgressCardProps> = ({ progress, isLoading }) => {
  if (isLoading) {
    return (
      <div className="glass-card p-6 md:p-8 animate-pulse border-slate-800">
        <div className="h-4 bg-slate-800 rounded w-1/4 mb-4" />
        <div className="h-8 bg-slate-800 rounded w-1/2 mb-6" />
        <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,360px))] gap-6 justify-center">
          <div className="h-28 bg-slate-800 rounded-2xl" />
          <div className="h-28 bg-slate-800 rounded-2xl" />
          <div className="h-28 bg-slate-800 rounded-2xl" />
        </div>
      </div>
    );
  }

  const overall = progress?.overallPercentage || 0;
  const basics = progress?.tiers?.basics || { completed: 0, total: 6, percentage: 0, unlocked: true };
  const intermediate = progress?.tiers?.intermediate || { completed: 0, total: 7, percentage: 0, unlocked: false };
  const advanced = progress?.tiers?.advanced || { completed: 0, total: 7, percentage: 0, unlocked: false };

  return (
    <div className="glass-card p-6 md:p-8 border-slate-800/80 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute -top-24 -right-24 w-60 h-60 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header with overall percentage & fluid text */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Trophy className="w-5 h-5 text-amber-400 shrink-0" />
            <h2 className="fluid-h2 font-bold text-white tracking-tight">Curriculum Mastery</h2>
          </div>
          <p className="fluid-body text-slate-400">
            {progress?.totalCompleted || 0} of {progress?.totalLessons || 20} prompt engineering competencies mastered
          </p>
        </div>

        <div className="flex items-center gap-4 self-start sm:self-auto">
          <div className="text-right">
            <span className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">
              {overall}%
            </span>
            <span className="text-[11px] text-slate-400 block -mt-1 font-mono">Total Progress</span>
          </div>

          {/* Radial meter */}
          <div className="relative w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-800"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-violet-500 transition-all duration-1000 ease-out"
                strokeDasharray={`${overall}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* 3 Tier progress blocks: auto-fit with max-w-[360px], no forced stretching */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,260px),360px))] gap-6 justify-center">
        {/* Tier 1: Basics */}
        <Link
          to="/curriculum/basics"
          className="group block p-5 rounded-2xl bg-slate-950/40 border border-emerald-500/20 hover:border-emerald-500/50 hover:bg-slate-900/60 transition-all min-h-[140px] flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span className="text-sm font-bold text-slate-200">Basics</span>
              </div>
              <span className="text-xs font-mono text-emerald-400 font-semibold">{basics.percentage}%</span>
            </div>

            <div className="w-full bg-slate-800 rounded-full h-2 mb-3 overflow-hidden">
              <div
                className="bg-emerald-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${basics.percentage}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{basics.completed}/{basics.total} Lessons</span>
            <span className="group-hover:text-emerald-400 flex items-center gap-1 transition-colors font-medium">
              Continue <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </Link>

        {/* Tier 2: Intermediate */}
        <Link
          to="/curriculum/intermediate"
          className={`group block p-5 rounded-2xl bg-slate-950/40 border transition-all min-h-[140px] flex flex-col justify-between ${
            intermediate.unlocked
              ? 'border-cyan-500/20 hover:border-cyan-500/50 hover:bg-slate-900/60'
              : 'border-slate-800/80 opacity-75'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                  <Zap className="w-4 h-4" />
                </div>
                <span className="text-sm font-bold text-slate-200">Intermediate</span>
              </div>
              <span className="text-xs font-mono text-cyan-400 font-semibold">
                {intermediate.unlocked ? `${intermediate.percentage}%` : 'LOCKED'}
              </span>
            </div>

            <div className="w-full bg-slate-800 rounded-full h-2 mb-3 overflow-hidden">
              <div
                className="bg-cyan-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${intermediate.percentage}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{intermediate.completed}/{intermediate.total} Lessons</span>
            <span className="group-hover:text-cyan-400 flex items-center gap-1 transition-colors font-medium">
              {intermediate.unlocked ? 'Explore' : 'Unlock Tier 1'} <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </Link>

        {/* Tier 3: Advanced */}
        <Link
          to="/curriculum/advanced"
          className={`group block p-5 rounded-2xl bg-slate-950/40 border transition-all min-h-[140px] flex flex-col justify-between ${
            advanced.unlocked
              ? 'border-violet-500/20 hover:border-violet-500/50 hover:bg-slate-900/60'
              : 'border-slate-800/80 opacity-75'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-400">
                  <Shield className="w-4 h-4" />
                </div>
                <span className="text-sm font-bold text-slate-200">Advanced</span>
              </div>
              <span className="text-xs font-mono text-violet-400 font-semibold">
                {advanced.unlocked ? `${advanced.percentage}%` : 'LOCKED'}
              </span>
            </div>

            <div className="w-full bg-slate-800 rounded-full h-2 mb-3 overflow-hidden">
              <div
                className="bg-violet-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${advanced.percentage}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{advanced.completed}/{advanced.total} Lessons</span>
            <span className="group-hover:text-violet-400 flex items-center gap-1 transition-colors font-medium">
              {advanced.unlocked ? 'Explore' : 'Unlock Tier 2'} <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </Link>
      </div>
    </div>
  );
};
