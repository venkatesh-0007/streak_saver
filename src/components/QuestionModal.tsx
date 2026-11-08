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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md transition-all">
      <div className="relative w-full max-w-xl lc-card p-0 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-white/[0.08] bg-[#1a1a1a]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#FFA116]/15 border border-[#FFA116]/30 text-[#FFA116] flex items-center justify-center">
              <Code2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">{question.title}</h2>
              <span className="text-[11px] text-[#00B8A3] font-bold uppercase tracking-wider">{question.difficulty} • 100% Accepted</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8A8A8E] hover:text-white hover:bg-white/[0.08] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Code Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-medium text-[#8A8A8E]">
              Language: <span className="text-[#FFA116] font-bold uppercase">{question.lang}</span>
            </span>
            <button
              onClick={handleCopy}
              className="text-xs text-black bg-[#FFA116] hover:bg-[#ffb43a] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Code'}</span>
            </button>
          </div>

          <pre className="p-4 rounded-xl bg-[#141414] border border-white/[0.08] text-xs text-[#FFA116]/95 font-mono overflow-x-auto leading-relaxed shadow-inner">
            <code>{question.code}</code>
          </pre>

          <div className="flex items-center justify-between pt-2 text-xs text-[#8A8A8E]">
            <span>Guaranteed streak-preserving snippet</span>
            <a
              href={`https://leetcode.com/problems/${question.slug}/`}
              target="_blank"
              rel="noreferrer"
              className="text-[#FFA116] hover:underline flex items-center gap-1 font-semibold transition"
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
