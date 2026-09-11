import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useProgress } from '../context/ProgressContext';
import { askTutorApi } from '../services/tutor.service';
import { isOnline, subscribeNetworkStatus, queueOfflineChat } from '../services/offlineSync.service';
import { offlineDb } from '../db/offlineDb';
import { ChatMessage } from '../types';
import { useNavigate } from 'react-router-dom';
import {
  Bot,
  Send,
  X,
  Sparkles,
  Copy,
  Check,
  RotateCcw,
  ArrowUpRight,
  WifiOff,
  Clock
} from 'lucide-react';
import { MarkdownRenderer } from './MarkdownRenderer';

export const TutorChat: React.FC = () => {
  const { isTutorOpen, closeTutor, tutorLevel, tutorTopic } = useProgress();
  const navigate = useNavigate();

  const [level, setLevel] = useState<string>(tutorLevel || 'Basics');
  const [topic, setTopic] = useState<string>(tutorTopic || 'General Prompt Engineering');
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [online, setOnline] = useState<boolean>(isOnline());

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `### Welcome to PromptMentor!
I am your interactive AI tutor. Ask me short queries (*"tell me about few-shot"*, *"what is chain-of-thought?"*, *"define prompt injection"*).

I'll teach you with:
1. **A clear definition**
2. **One real example**
3. **One practice task**`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync props when drawer opens
  useEffect(() => {
    if (tutorLevel) setLevel(tutorLevel);
    if (tutorTopic) setTopic(tutorTopic);
  }, [tutorLevel, tutorTopic, isTutorOpen]);

  // Subscribe to network connectivity
  useEffect(() => {
    const unsubscribe = subscribeNetworkStatus(async (isNetOnline) => {
      setOnline(isNetOnline);
      if (isNetOnline) {
        // Check if there are queued tutor messages to send automatically
        const pending = await offlineDb.queuedChat.where('synced').equals(0).toArray();
        for (const item of pending) {
          if (!item.id) continue;
          await offlineDb.queuedChat.update(item.id, { synced: true });
          handleSend(item.query);
        }
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (!isTutorOpen) return null;

  const quickPrompts = [
    'What is tokenization?',
    'Zero-shot vs Few-shot?',
    'Show a Chain-of-Thought example',
    'How to prevent prompt injection?'
  ];

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');

    // Offline check: Queue message if offline
    if (!online || !isOnline()) {
      await queueOfflineChat(textToSend.trim(), level, topic);
      const queuedNotice: ChatMessage = {
        id: `offline-${Date.now()}`,
        role: 'assistant',
        content: `📡 **You're offline — tutor chat will resume when you're back online.**\n\nYour query *"**${textToSend.trim()}**"* has been safely queued and will automatically be sent to the AI tutor once your internet connection returns.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, queuedNotice]);
      return;
    }

    setIsLoading(true);

    try {
      const historyPayload = messages
        .filter((m) => m.id !== 'welcome' && !m.id.startsWith('offline-'))
        .slice(-4)
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await askTutorApi({
        query: textToSend.trim(),
        level,
        topic,
        history: historyPayload
      });

      const assistantMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `⚠️ Sorry, I encountered an issue: ${err.message || 'Please check your connection and try again.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const openInSandbox = (taskText: string) => {
    closeTutor();
    navigate('/sandbox', { state: { initialPrompt: taskText, level, topic } });
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm transition-opacity">
      {/* Slide-in Drawer */}
      <div className="w-full max-w-lg h-full bg-[#0B0F19] border-l border-slate-800 flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-white">PromptMentor Tutor</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20 font-mono">
                  Socratic AI
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">Level-aware • &lt;150 words</p>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => setMessages([messages[0]])}
              title="Reset Chat"
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={closeTutor}
              aria-label="Close tutor drawer"
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Offline Notice Banner */}
        {!online && (
          <div className="px-4 py-2 bg-amber-500/15 border-b border-amber-500/30 flex items-center gap-2 text-xs text-amber-300">
            <WifiOff className="w-4 h-4 shrink-0 text-amber-400" />
            <span className="leading-tight">
              You're offline — tutor chat will resume and auto-send queries when you're back online.
            </span>
          </div>
        )}

        {/* Level and Topic Context Bar */}
        <div className="px-4 py-2.5 bg-slate-900/60 border-b border-slate-800/80 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <span className="text-slate-400 text-[11px]">Level:</span>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-2 py-1 focus:outline-none focus:border-violet-500 min-h-[36px]"
            >
              <option value="Basics">Basics (Tier 1)</option>
              <option value="Intermediate">Intermediate (Tier 2)</option>
              <option value="Advanced">Advanced (Tier 3)</option>
            </select>
          </div>

          <div className="flex items-center space-x-1 text-slate-400 text-[11px] truncate max-w-[200px]">
            <span>Topic:</span>
            <span className="text-violet-300 font-medium truncate">{topic}</span>
          </div>
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((m) => {
            const isUser = m.role === 'user';
            return (
              <div key={m.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} min-w-0`}>
                <div
                  className={`max-w-[92%] sm:max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed min-w-0 break-words ${
                    isUser
                      ? 'bg-violet-600 text-white rounded-br-xs shadow-md'
                      : m.id.startsWith('offline-')
                      ? 'bg-amber-950/30 border border-amber-500/40 text-amber-200 rounded-bl-xs'
                      : 'bg-slate-900/90 border border-slate-800/90 text-slate-200 rounded-bl-xs shadow-sm'
                  }`}
                >
                  {isUser ? (
                    <p className="whitespace-pre-wrap break-words">{m.content}</p>
                  ) : (
                    <MarkdownRenderer content={m.content} themeColor="violet" className="text-xs space-y-2" />
                  )}

                  {!isUser && m.id !== 'welcome' && !m.id.startsWith('offline-') && (
                    <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                      <span>{m.timestamp}</span>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleCopy(m.content, m.id)}
                          className="min-h-[32px] px-2 rounded hover:text-slate-200 flex items-center gap-1 transition-colors"
                        >
                          {copiedId === m.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" /> Copied
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" /> Copy
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => openInSandbox(m.content)}
                          className="min-h-[32px] px-2 rounded hover:text-violet-300 text-violet-400 flex items-center gap-0.5 transition-colors"
                        >
                          Test in Sandbox <ArrowUpRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-start">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 rounded-bl-xs text-xs text-slate-400 flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-violet-400 animate-spin" />
                <span>PromptMentor is formulating your structured lesson...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick prompt suggestions */}
        <div className="px-4 py-2 bg-slate-950/40 border-t border-slate-800/60 overflow-x-auto whitespace-nowrap scrollbar-none flex space-x-2">
          {quickPrompts.map((qp, i) => (
            <button
              key={i}
              onClick={() => handleSend(qp)}
              className="min-h-[36px] inline-flex items-center text-[11px] px-3 py-1.5 rounded-full bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white transition-colors"
            >
              <Sparkles className="w-3 h-3 mr-1 text-violet-400" />
              {qp}
            </button>
          ))}
        </div>

        {/* Query Input with min 44x44px target on send */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/70">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder={online ? "Ask anything (e.g. 'explain delimiters', 'define few-shot')..." : "Enter query (will auto-send when back online)..."}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-500 min-h-[44px]"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !inputQuery.trim()}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white transition-all shadow-glow-violet shrink-0"
              aria-label="Send query"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
