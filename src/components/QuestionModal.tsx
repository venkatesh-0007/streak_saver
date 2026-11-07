import React from 'react';
import { X, Code2, ExternalLink, Check } from 'lucide-react';
import { PresetQuestion } from '../types';

interface QuestionModalProps {
  question: PresetQuestion | null;
  isOpen: boolean;
  onClose: () => void;
}

export const QuestionModal: React.FC<QuestionModalProps> = ({ question, isOpen, onClose }) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !question) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(question.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100">{question.title}</h2>
              <span className="text-[11px] text-teal-400 font-semibold">{question.difficulty} • Verified Solution</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Code Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold text-slate-400 uppercase">
              Language: {question.lang}
            </span>
            <button
              onClick={handleCopy}
              className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : null}
              <span>{copied ? 'Copied' : 'Copy Code'}</span>
            </button>
          </div>

          <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-amber-200/90 font-mono overflow-x-auto leading-relaxed">
            <code>{question.code}</code>
          </pre>

          <div className="flex items-center justify-between pt-2 text-xs text-slate-400">
            <span>Guaranteed 100% Accepted solution</span>
            <a
              href={`https://leetcode.com/problems/${question.slug}/`}
              target="_blank"
              rel="noreferrer"
              className="text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium transition"
            >
              <span>Open on LeetCode</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

