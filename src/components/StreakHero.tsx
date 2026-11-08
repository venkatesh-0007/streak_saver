import React from 'react';
import {
  Zap,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  Code2,
  ShieldCheck,
  ExternalLink,
  Sparkles,
  Lock,
} from 'lucide-react';
import { PresetQuestion, AppStatus, UserProfileData } from '../types';

interface SubmissionCardProps {
  profile: UserProfileData;
  status: AppStatus | null;
  presets: PresetQuestion[];
  selectedPreset: PresetQuestion | null;
  onSelectPreset: (preset: PresetQuestion) => void;
  onSaveStreak: () => Promise<void>;
  submitting: boolean;
  submitProgress: string;
  onOpenLogin: () => void;
  onViewCode: (preset: PresetQuestion) => void;
  lastResult: {
    statusMsg: string;
    runtime?: string;
    memory?: string;
    questionTitle?: string;
  } | null;
}

export const StreakHero: React.FC<SubmissionCardProps> = ({
  profile,
  status,
  presets,
  selectedPreset,
  onSelectPreset,
  onSaveStreak,
  submitting,
  submitProgress,
  onOpenLogin,
  onViewCode,
  lastResult,
}) => {
  const isSafe = profile.calendar.isTodaySolved;
  const isAuthenticated = Boolean(status?.hasCredentials);

  return (
    <div className="lc-card p-4 sm:p-6 transition-all border-[#FFA116]/30 lc-glow-accent space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-white/[0.08]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#FFA116] text-black flex items-center justify-center font-bold">
            <Zap className="w-4 h-4 fill-black" />
          </div>
          <div>
            <h2 className="font-bold text-white text-base tracking-tight flex items-center gap-2">
              <span>Save LeetCode Streak</span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#FFA116]/20 text-[#FFA116]">
                1-Tap Action
              </span>
            </h2>
            <p className="text-xs text-[#8A8A8E]">Automated guaranteed submission to keep your streak alive</p>
          </div>
        </div>

        {/* Safety state pill */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
              isSafe
                ? 'bg-[#00B8A3]/15 text-[#00B8A3] border-[#00B8A3]/40'
                : 'bg-[#FFA116]/15 text-[#FFA116] border-[#FFA116]/40'
            }`}
          >
            {isSafe ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Streak Safe Today</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-3.5 h-3.5 animate-lc-pulse" />
                <span>Streak At Risk (Needs Submission)</span>
              </>
            )}
          </span>
        </div>
      </div>

      {/* Preset Problem Selector & Code Preview */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
        <div className="sm:col-span-8">
          <label className="block text-xs font-bold text-[#8A8A8E] mb-1.5">
            Select Question for Auto-Submission:
          </label>
          <div className="relative">
            <select
              value={selectedPreset?.slug || ''}
              onChange={(e) => {
                const p = presets.find((item) => item.slug === e.target.value);
                if (p) onSelectPreset(p);
              }}
              disabled={submitting}
              className="w-full appearance-none bg-[#282828] border border-white/[0.1] hover:border-[#FFA116]/50 rounded-xl px-4 py-3 text-xs sm:text-sm text-white font-medium focus:outline-none focus:border-[#FFA116] transition cursor-pointer"
            >
              {presets.map((p) => (
                <option key={p.slug} value={p.slug} className="bg-[#1e1e1e] text-white">
                  {p.title} ({p.difficulty} • 100% Accepted)
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-[#8A8A8E] absolute right-3.5 top-3.5 pointer-events-none" />
          </div>
        </div>

        <div className="sm:col-span-4 flex sm:justify-end items-end h-full pt-1 sm:pt-6">
          {selectedPreset && (
            <button
              onClick={() => onViewCode(selectedPreset)}
              className="w-full sm:w-auto px-4 py-3 rounded-xl bg-[#282828] hover:bg-[#333333] border border-white/[0.08] hover:border-[#FFA116]/40 text-xs font-semibold text-[#FFA116] flex items-center justify-center gap-1.5 transition"
            >
              <Code2 className="w-4 h-4" />
              <span>Inspect Code Solution</span>
            </button>
          )}
        </div>
      </div>

      {/* THE BIG ACTION BUTTON */}
      <div className="pt-2">
        {!isAuthenticated ? (
          <button
            onClick={onOpenLogin}
            className="w-full py-4 px-6 rounded-xl bg-[#FFA116] hover:bg-[#ffb43a] text-black font-extrabold text-sm sm:text-base tracking-wide uppercase transition shadow-lg flex items-center justify-center gap-2.5 active:scale-[0.99]"
          >
            <Lock className="w-5 h-5 fill-black" />
            <span>Connect Account to Enable 1-Tap Save</span>
          </button>
        ) : (
          <button
            onClick={onSaveStreak}
            disabled={submitting}
            className={`w-full py-4 sm:py-4.5 px-6 rounded-xl font-black text-sm sm:text-base tracking-wide transition flex items-center justify-center gap-2.5 shadow-xl active:scale-[0.99] ${
              submitting
                ? 'bg-[#FFA116]/80 text-black cursor-wait'
                : isSafe
                ? 'bg-[#282828] hover:bg-[#333333] text-[#00B8A3] border border-[#00B8A3]/40'
                : 'bg-[#FFA116] hover:bg-[#ffb43a] text-black shadow-lg shadow-[#FFA116]/20'
            }`}
          >
            {submitting ? (
              <>
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                <span>{submitProgress || 'Submitting to LeetCode...'}</span>
              </>
            ) : isSafe ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-[#00B8A3]" />
                <span>Streak Already Safe • Submit Extra Solution</span>
              </>
            ) : (
              <>
                <Zap className="w-5 h-5 fill-black text-black" />
                <span>⚡ SAVE STREAK NOW</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Real-time Verdict Banner */}
      {lastResult && (
        <div className="p-3.5 rounded-xl bg-[#282828] border border-[#00B8A3]/50 flex items-center justify-between text-xs transition animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#00B8A3] shrink-0" />
            <div>
              <span className="font-bold text-[#00B8A3] text-sm">
                {lastResult.statusMsg}
              </span>
              <span className="text-[#8A8A8E] ml-2 font-mono text-xs">
                ({lastResult.runtime || '0 ms'} • {lastResult.memory || 'RAM OK'})
              </span>
            </div>
          </div>
          <span className="text-[10px] uppercase font-bold text-[#00B8A3] px-2 py-0.5 rounded bg-[#00B8A3]/15 border border-[#00B8A3]/30">
            Streak Recorded
          </span>
        </div>
      )}

      {/* Footer details */}
      <div className="flex items-center justify-between text-[11px] text-[#8A8A8E] pt-1 px-1">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-[#00B8A3]" />
          <span>Direct LeetCode GraphQL Submission</span>
        </span>
        <a
          href={`https://leetcode.com/problems/${selectedPreset?.slug || ''}/`}
          target="_blank"
          rel="noreferrer"
          className="text-[#FFA116] hover:underline flex items-center gap-1 font-medium transition"
        >
          <span>Open on LeetCode</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};
