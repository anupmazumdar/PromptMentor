import React from 'react';
import { TierLevel } from '../types';
import { Shield, Sparkles, Zap, Lock, CheckCircle2 } from 'lucide-react';

interface LevelBadgeProps {
  level: TierLevel | string;
  isUnlocked?: boolean;
  isCompleted?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const LevelBadge: React.FC<LevelBadgeProps> = ({
  level,
  isUnlocked = true,
  isCompleted = false,
  size = 'md',
  showIcon = true
}) => {
  const normalized = level.toUpperCase();

  const getStyle = () => {
    if (!isUnlocked) {
      return 'bg-slate-800/80 text-slate-400 border-slate-700/80';
    }
    if (normalized === 'BASICS') {
      return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 shadow-[0_0_15px_-3px_rgba(16,185,129,0.2)]';
    }
    if (normalized === 'INTERMEDIATE') {
      return 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30 shadow-[0_0_15px_-3px_rgba(6,182,212,0.2)]';
    }
    return 'bg-violet-500/15 text-violet-300 border-violet-500/30 shadow-[0_0_15px_-3px_rgba(139,92,246,0.25)]';
  };

  const getIcon = () => {
    if (!isUnlocked) return <Lock className="w-3.5 h-3.5 mr-1 text-slate-400" />;
    if (isCompleted) return <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-400" />;
    if (normalized === 'BASICS') return <Sparkles className="w-3.5 h-3.5 mr-1" />;
    if (normalized === 'INTERMEDIATE') return <Zap className="w-3.5 h-3.5 mr-1" />;
    return <Shield className="w-3.5 h-3.5 mr-1" />;
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs font-semibold px-2.5 py-1',
    lg: 'text-sm font-semibold px-3 py-1.5'
  }[size];

  return (
    <span className={`inline-flex items-center rounded-full border transition-all ${getStyle()} ${sizeClasses}`}>
      {showIcon && getIcon()}
      <span>{normalized}</span>
    </span>
  );
};
