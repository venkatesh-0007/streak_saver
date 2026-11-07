import React, { useState } from 'react';
import { X, Code2, ExternalLink, Check, Copy } from 'lucide-react';
import { PresetQuestion } from '../types';

interface QuestionModalProps {
  question: PresetQuestion | null;
  isOpen: boolean;
  onClose: () => void;
}

export const QuestionModal: React.FC<QuestionModalProps> = ({ question, isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !question) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(question.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in transition-opacity">
      <div className="relative w-full max-w-xl bg-slate-900/95 border border-white/[0.08] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center">
              <Code2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-100">{question.title}</h2>
              <span className="text-[11px] text-teal-400 font-medium">{question.difficulty} • Guaranteed 100% Accepted</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-white/[0.05] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Code Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-medium text-slate-400">
              Language: <span className="text-amber-300 font-bold uppercase">{question.lang}</span>
            </span>
            <button
              onClick={handleCopy}
              className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1.5 font-medium transition px-2.5 py-1 rounded-lg hover:bg-amber-400/10"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Code'}</span>
            </button>
          </div>

          <pre className="p-4 rounded-2xl bg-slate-950/80 border border-white/[0.06] text-xs text-amber-200/90 font-mono overflow-x-auto leading-relaxed shadow-inner">
            <code>{question.code}</code>
          </pre>

          <div className="flex items-center justify-between pt-2 text-xs text-slate-500">
            <span>Pre-tested lightweight streak saver</span>
            <a
              href={`https://leetcode.com/problems/${question.slug}/`}
              target="_blank"
              rel="noreferrer"
              className="text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium transition"
            >
              <span>LeetCode Problem URL</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
