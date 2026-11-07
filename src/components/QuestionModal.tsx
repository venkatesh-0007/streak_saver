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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl transition-all">
      <div className="relative w-full max-w-xl expressive-card p-0 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.08] bg-black/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#4affbd]/15 border border-[#4affbd]/30 text-[#4affbd] flex items-center justify-center">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">{question.title}</h2>
              <span className="text-[11px] text-[#4affbd] font-bold uppercase tracking-wider">{question.difficulty} • 100% Accepted</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/[0.08] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Code Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-medium text-slate-400">
              Language: <span className="text-[#ffe855] font-bold uppercase">{question.lang}</span>
            </span>
            <button
              onClick={handleCopy}
              className="text-xs text-black bg-[#4affbd] hover:bg-[#38ef7d] font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Code'}</span>
            </button>
          </div>

          <pre className="p-4 rounded-2xl bg-black/60 border border-white/[0.08] text-xs text-[#ffe855]/90 font-mono overflow-x-auto leading-relaxed shadow-inner">
            <code>{question.code}</code>
          </pre>

          <div className="flex items-center justify-between pt-2 text-xs text-slate-400">
            <span>Guaranteed streak-preserving snippet</span>
            <a
              href={`https://leetcode.com/problems/${question.slug}/`}
              target="_blank"
              rel="noreferrer"
              className="text-[#4affbd] hover:underline flex items-center gap-1 font-semibold transition"
            >
              <span>View on LeetCode</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
