import React from 'react';
import { useLocation } from 'react-router-dom';
import { PracticeSandbox } from '../components/PracticeSandbox';
import { Terminal, Cpu, Sparkles, Sliders } from 'lucide-react';

export const SandboxPage: React.FC = () => {
  const location = useLocation();
  const state = location.state as {
    initialPrompt?: string;
    initialLevel?: string;
    initialTopic?: string;
    lessonId?: string;
  } | null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Sandbox Header */}
      <div className="glass-card p-6 border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-lg bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400">
              <Terminal className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-mono text-violet-400 font-bold uppercase tracking-wider">
              Prompt Engineering Studio
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Interactive Practice Sandbox</h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Compose and iterate on prompts with live AI critiques. Our evaluator analyzes role assignment, constraints,
            formatting schemas, delimiters, and level-specific strategies to score your prompt and provide an optimized rewrite.
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs text-slate-400 bg-slate-950/60 border border-slate-800 px-4 py-2 rounded-xl">
          <Cpu className="w-4 h-4 text-cyan-400" />
          <span>Evaluator: <strong>OpenRouter / Fallback AI</strong></span>
        </div>
      </div>

      {/* Main Sandbox Component */}
      <PracticeSandbox
        initialPrompt={state?.initialPrompt}
        initialLevel={state?.initialLevel}
        initialTopic={state?.initialTopic}
        lessonId={state?.lessonId}
      />
    </div>
  );
};
