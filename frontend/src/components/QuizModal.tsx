import React, { useState } from 'react';
import { QuizQuestion } from '../types';
import { submitQuizApi, QuizSubmissionResult } from '../services/progress.service';
import { useProgress } from '../context/ProgressContext';
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  X,
  Trophy,
  ArrowRight,
  RotateCcw,
  Sparkles
} from 'lucide-react';

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  lessonSlug: string;
  lessonTitle: string;
  quizQuestions: QuizQuestion[];
  onQuizPassed?: () => void;
}

export const QuizModal: React.FC<QuizModalProps> = ({
  isOpen,
  onClose,
  lessonSlug,
  lessonTitle,
  quizQuestions,
  onQuizPassed
}) => {
  const { refreshProgress } = useProgress();
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>(
    new Array(quizQuestions.length).fill(-1)
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [quizResult, setQuizResult] = useState<QuizSubmissionResult | null>(null);

  if (!isOpen) return null;

  const handleSelect = (qIndex: number, optionIndex: number) => {
    if (quizResult) return; // Locked after submitting
    const updated = [...selectedAnswers];
    updated[qIndex] = optionIndex;
    setSelectedAnswers(updated);
  };

  const handleSubmit = async () => {
    if (selectedAnswers.some((a) => a === -1)) {
      alert('Please answer all questions before submitting.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await submitQuizApi(lessonSlug, selectedAnswers);
      setQuizResult(result);
      if (result.passed) {
        refreshProgress();
        if (onQuizPassed) onQuizPassed();
      }
    } catch (err: any) {
      alert(`Quiz submission error: ${err.message || 'Please try again.'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetry = () => {
    setQuizResult(null);
    setSelectedAnswers(new Array(quizQuestions.length).fill(-1));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-[#0B0F19] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Lesson Assessment</h3>
              <p className="text-xs text-slate-400 truncate max-w-sm">{lessonTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Result Banner if graded */}
          {quizResult && (
            <div
              className={`p-4 rounded-xl border flex items-center justify-between ${
                quizResult.passed
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              }`}
            >
              <div className="flex items-center space-x-3">
                {quizResult.passed ? (
                  <Trophy className="w-8 h-8 text-emerald-400" />
                ) : (
                  <XCircle className="w-8 h-8 text-rose-400" />
                )}
                <div>
                  <h4 className="font-bold text-sm">
                    {quizResult.passed ? 'Assessment Passed! 🎓' : 'Score Below 70% Threshold'}
                  </h4>
                  <p className="text-xs opacity-80">
                    {quizResult.passed
                      ? 'You demonstrated strong comprehension. This lesson is now marked completed!'
                      : 'Review the explanations below and give it another try.'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-2xl font-mono font-bold">{quizResult.score}%</span>
                <span className="text-[10px] block opacity-70">
                  {quizResult.correctCount}/{quizResult.totalQuestions} Correct
                </span>
              </div>
            </div>
          )}

          {/* Question List */}
          {quizQuestions.map((q, qIdx) => {
            const resultItem = quizResult?.results?.[qIdx];
            return (
              <div key={q.id || qIdx} className="space-y-3 p-4 rounded-xl bg-slate-950/40 border border-slate-800/80 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-sm font-semibold text-slate-100 flex items-start gap-2 min-w-0 flex-1">
                    <span className="text-violet-400 font-mono text-xs mt-0.5 shrink-0">Q{qIdx + 1}.</span>
                    <span className="min-w-0 flex-1 break-words">{q.question}</span>
                  </h4>
                  {resultItem && (
                    <span className="shrink-0 ml-2">
                      {resultItem.isCorrect ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-400" />
                      )}
                    </span>
                  )}
                </div>

                {/* Options */}
                <div className="space-y-2 min-w-0">
                  {q.options.map((opt, optIdx) => {
                    const isSelected = selectedAnswers[qIdx] === optIdx;
                    let optionStyle = 'border-slate-800 bg-slate-900/40 text-slate-300 hover:border-slate-700';

                    if (quizResult && resultItem) {
                      if (optIdx === resultItem.correctIndex) {
                        optionStyle = 'border-emerald-500/60 bg-emerald-500/15 text-emerald-300 font-medium';
                      } else if (isSelected && !resultItem.isCorrect) {
                        optionStyle = 'border-rose-500/60 bg-rose-500/15 text-rose-300';
                      } else {
                        optionStyle = 'border-slate-800/50 bg-slate-950/20 text-slate-500';
                      }
                    } else if (isSelected) {
                      optionStyle = 'border-violet-500 bg-violet-600/15 text-white font-medium shadow-sm';
                    }

                    return (
                      <button
                        key={optIdx}
                        type="button"
                        onClick={() => handleSelect(qIdx, optIdx)}
                        className={`w-full text-left p-3 rounded-xl border text-xs leading-relaxed transition-all flex items-center justify-between gap-2.5 min-w-0 ${optionStyle}`}
                      >
                        <span className="min-w-0 flex-1 break-words">{opt}</span>
                        <span
                          className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ml-2 text-[9px] ${
                            isSelected
                              ? 'border-violet-400 bg-violet-500 text-white'
                              : 'border-slate-700 bg-slate-950'
                          }`}
                        >
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Explanation if submitted */}
                {resultItem && (
                  <div className="mt-2 p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-300 min-w-0 break-words">
                    <span className="font-bold text-violet-400 block mb-1">Explanation:</span>
                    <p className="leading-relaxed break-words">{resultItem.explanation || q.explanation}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between bg-slate-950/60">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200"
          >
            Close
          </button>

          {!quizResult ? (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || selectedAnswers.some((a) => a === -1)}
              className="inline-flex items-center px-5 py-2.5 rounded-xl text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white shadow-glow-violet disabled:opacity-40 transition-all"
            >
              {isSubmitting ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  Grading Answers...
                </>
              ) : (
                <>
                  Submit Answers <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </>
              )}
            </button>
          ) : (
            <div className="flex items-center space-x-2">
              {!quizResult.passed && (
                <button
                  onClick={handleRetry}
                  className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200"
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Try Again
                </button>
              )}
              <button
                onClick={onClose}
                className="inline-flex items-center px-5 py-2.5 rounded-xl text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white shadow-glow-violet"
              >
                {quizResult.passed ? 'Complete & Continue' : 'Review Lesson'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
