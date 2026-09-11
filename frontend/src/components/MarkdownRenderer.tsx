import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Copy, Check } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
  themeColor?: 'emerald' | 'cyan' | 'violet';
  className?: string;
}

// Helper to extract plain text from React nodes for the copy button
const extractText = (node: any): string => {
  if (!node) return '';
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(extractText).join('');
  if (node.props && node.props.children) return extractText(node.props.children);
  return '';
};

// Sleek code block container with header and copy button
const CodeBlockContainer: React.FC<{
  children: React.ReactNode;
  themeColor: 'emerald' | 'cyan' | 'violet';
}> = ({ children, themeColor }) => {
  const [copied, setCopied] = useState(false);

  const dotColors = {
    emerald: 'bg-emerald-400',
    cyan: 'bg-cyan-400',
    violet: 'bg-violet-400'
  };

  const handleCopy = () => {
    const rawText = extractText(children).trim();
    if (rawText) {
      navigator.clipboard.writeText(rawText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="relative group my-4 rounded-xl border border-slate-800/90 bg-slate-950/90 shadow-sm overflow-hidden min-w-0">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-3.5 py-1.5 border-b border-slate-800/80 bg-slate-900/60 text-[11px] text-slate-400 font-mono select-none">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${dotColors[themeColor]} inline-block`} />
          <span className="font-semibold text-slate-300">Prompt / Example</span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="min-h-[28px] px-2 py-0.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 flex items-center gap-1 transition-colors text-[11px]"
          title="Copy to clipboard"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400 font-medium">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Content: explicitly wraps text & preserves formatting */}
      <pre className="p-3.5 sm:p-4 overflow-x-auto text-xs font-mono text-slate-200 whitespace-pre-wrap break-words leading-relaxed font-inherit selection:bg-violet-500/30 min-w-0">
        {children}
      </pre>
    </div>
  );
};

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  themeColor = 'emerald',
  className = ''
}) => {
  const borderQuoteColors = {
    emerald: 'border-emerald-500/60 bg-emerald-950/20 text-emerald-100/90',
    cyan: 'border-cyan-500/60 bg-cyan-950/20 text-cyan-100/90',
    violet: 'border-violet-500/60 bg-violet-950/20 text-violet-100/90'
  };

  return (
    <div className={`prose-mentor prose-mentor-${themeColor} ${className} min-w-0 break-words`}>
      <ReactMarkdown
        components={{
          pre: ({ children }) => {
            return (
              <CodeBlockContainer themeColor={themeColor}>
                {children}
              </CodeBlockContainer>
            );
          },
          code: ({ className, children, ...props }: any) => {
            const isBlock = className && /language-/.test(className);
            if (!isBlock) {
              return (
                <code
                  className="px-1.5 py-0.5 rounded-md bg-slate-800/90 border border-slate-700/60 font-mono text-xs text-violet-300 break-words whitespace-pre-wrap inline-block align-baseline"
                  {...props}
                >
                  {children}
                </code>
              );
            }
            return (
              <code className="font-mono text-xs text-slate-200 break-words whitespace-pre-wrap font-inherit" {...props}>
                {children}
              </code>
            );
          },
          p: ({ children, ...props }) => (
            <p className="text-sm leading-relaxed text-slate-200 my-3 break-words" {...props}>
              {children}
            </p>
          ),
          h1: ({ children, ...props }) => (
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-6 mb-3 break-words" {...props}>
              {children}
            </h1>
          ),
          h2: ({ children, ...props }) => (
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight mt-5 mb-2.5 break-words" {...props}>
              {children}
            </h2>
          ),
          h3: ({ children, ...props }) => (
            <h3 className="text-base sm:text-lg font-semibold text-white tracking-tight mt-4 mb-2 break-words" {...props}>
              {children}
            </h3>
          ),
          h4: ({ children, ...props }) => (
            <h4 className="text-sm sm:text-base font-semibold text-slate-200 mt-3.5 mb-1.5 break-words" {...props}>
              {children}
            </h4>
          ),
          ul: ({ children, ...props }) => (
            <ul className="list-disc list-outside ml-5 space-y-1.5 my-3 text-sm text-slate-300 break-words" {...props}>
              {children}
            </ul>
          ),
          ol: ({ children, ...props }) => (
            <ol className="list-decimal list-outside ml-5 space-y-1.5 my-3 text-sm text-slate-300 break-words" {...props}>
              {children}
            </ol>
          ),
          li: ({ children, ...props }) => (
            <li className="leading-relaxed break-words text-slate-300" {...props}>
              {children}
            </li>
          ),
          blockquote: ({ children, ...props }) => (
            <blockquote
              className={`border-l-4 pl-4 py-2 my-4 rounded-r-xl italic text-sm break-words ${borderQuoteColors[themeColor]}`}
              {...props}
            >
              {children}
            </blockquote>
          ),
          table: ({ children, ...props }) => (
            <div className="overflow-x-auto my-4 rounded-xl border border-slate-800">
              <table className="min-w-full divide-y divide-slate-800 text-left text-xs text-slate-300" {...props}>
                {children}
              </table>
            </div>
          ),
          a: ({ children, href, ...props }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-violet-400 hover:text-violet-300 underline underline-offset-2 break-all"
              {...props}
            >
              {children}
            </a>
          )
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
