import React, { useState, useEffect } from 'react';
import {
  Flame,
  Zap,
  CheckCircle2,
  Clock,
  ChevronDown,
  Code2,
  CalendarCheck,
  ShieldCheck,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { UserProfileData, PresetQuestion, AppStatus } from '../types';

interface StreakHeroProps {
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

export const StreakHero: React.FC<StreakHeroProps> = ({
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
  const streak = profile.calendar.streak;
  const totalDays = profile.calendar.totalActiveDays;

  // Countdown timer to UTC midnight
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date();
      const nextUtc = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1)
      );
      const diff = Math.max(0, Math.floor((nextUtc.getTime() - now.getTime()) / 1000));
      const hours = Math.floor(diff / 3600);
      const minutes = Math.floor((diff % 3600) / 60);
      const seconds = diff % 60;
      setTimeLeft({ hours, minutes, seconds });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const format2Digit = (n: number) => String(n).padStart(2, '0');

  return (
    <div className="relative overflow-hidden rounded-3xl bg-slate-900/60 border border-white/[0.08] p-6 sm:p-8 backdrop-blur-2xl ambient-glow-amber">
      {/* Ambient background lighting */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-10 left-10 w-80 h-80 bg-orange-600/5 rounded-full blur-[80px] pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        {/* Left: Streak Counter & Status */}
        <div className="space-y-5">
          {/* Status Badges */}
          <div className="flex flex-wrap items-center gap-2.5">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium tracking-wide ${
                isSafe
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isSafe ? 'bg-emerald-400' : 'bg-amber-400 animate-soft-pulse'
                }`}
              />
              {isSafe ? 'Streak Safe Today' : 'Needs Today\'s Submission'}
            </span>

            {/* Live countdown */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono text-slate-300 bg-slate-950/70 border border-white/[0.06]">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>
                Reset in: <strong className="text-white font-semibold">{format2Digit(timeLeft.hours)}:{format2Digit(timeLeft.minutes)}:{format2Digit(timeLeft.seconds)}</strong> UTC
              </span>
            </div>
          </div>

          {/* Big Streak Numbers */}
          <div className="flex items-center gap-5 sm:gap-6">
            <div className="relative flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-b from-amber-500/20 to-orange-500/10 border border-amber-500/30 text-amber-400 shadow-inner">
              <Flame className="w-10 h-10 sm:w-12 sm:h-12 fill-amber-400 text-amber-400" />
              <div className="absolute inset-0 rounded-2xl bg-amber-400/5 animate-soft-pulse" />
            </div>

            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl sm:text-6xl font-black tracking-tight text-white font-mono">
                  {streak}
                </span>
                <span className="text-lg sm:text-xl font-semibold text-slate-400">
                  {streak === 1 ? 'day streak' : 'days streak'}
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-2 mt-1">
                <span>Active Coding Record</span>
                <span className="text-slate-600">•</span>
                <span className="text-amber-400 font-medium">
                  {totalDays} Total Active Days
                </span>
              </p>
            </div>
          </div>

          {/* Submissions note */}
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <CalendarCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              {profile.calendar.submissionsToday > 0
                ? `${profile.calendar.submissionsToday} submission${profile.calendar.submissionsToday > 1 ? 's' : ''} logged on LeetCode today.`
                : 'Zero submissions recorded today. Tap the button below to preserve your streak!'}
            </span>
          </div>
        </div>

        {/* Right: The 1-Tap Action Card */}
        <div className="w-full lg:max-w-md bg-slate-950/70 border border-white/[0.08] rounded-2xl p-5 sm:p-6 shadow-2xl flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span className="font-semibold text-xs text-slate-200 uppercase tracking-wider">
                Automated Submission
              </span>
            </div>
            {selectedPreset && (
              <button
                onClick={() => onViewCode(selectedPreset)}
                className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium transition"
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Code Preview</span>
              </button>
            )}
          </div>

          {/* Preset Selector */}
          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1.5">
              Target Problem:
            </label>
            <div className="relative">
              <select
                value={selectedPreset?.slug || ''}
                onChange={(e) => {
                  const p = presets.find((item) => item.slug === e.target.value);
                  if (p) onSelectPreset(p);
                }}
                disabled={submitting}
                className="w-full appearance-none bg-slate-900 border border-white/[0.08] hover:border-white/[0.15] rounded-xl px-3.5 py-2.5 text-xs text-slate-200 font-medium focus:outline-none focus:border-amber-500/50 transition cursor-pointer"
              >
                {presets.map((p) => (
                  <option key={p.slug} value={p.slug}>
                    {p.title} ({p.difficulty} • 100% AC)
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>

          {/* THE SAVE STREAK BUTTON */}
          <div className="pt-1">
            {!status?.hasCredentials ? (
              <button
                onClick={onOpenLogin}
                className="w-full py-3.5 px-5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs tracking-wider uppercase transition shadow-lg shadow-amber-500/15 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>One-Time Login to Save Streak</span>
              </button>
            ) : (
              <button
                onClick={onSaveStreak}
                disabled={submitting}
                className={`w-full py-4 px-6 rounded-xl font-bold text-sm tracking-wide transition flex items-center justify-center gap-2.5 shadow-xl ${
                  submitting
                    ? 'bg-amber-600 text-slate-950 cursor-wait'
                    : isSafe
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-emerald-500/20'
                    : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/25'
                }`}
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>{submitProgress || 'Submitting to LeetCode...'}</span>
                  </>
                ) : isSafe ? (
                  <>
                    <Zap className="w-4 h-4 fill-slate-950" />
                    <span>Streak Safe • Submit Extra Solution</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-slate-950" />
                    <span>SAVE STREAK NOW</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Result banner */}
          {lastResult && (
            <div className="p-3 rounded-xl bg-slate-900 border border-emerald-500/30 flex items-center justify-between text-xs transition">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <span className="font-semibold text-emerald-300">
                    {lastResult.statusMsg}
                  </span>
                  <span className="text-slate-400 ml-1.5 font-mono text-[11px]">
                    ({lastResult.runtime || '0 ms'} • {lastResult.memory || 'RAM OK'})
                  </span>
                </div>
              </div>
              <span className="text-[10px] text-emerald-400 font-medium">Verdict Recorded</span>
            </div>
          )}

          <div className="flex items-center justify-between text-[11px] text-slate-500 px-1 pt-0.5">
            <span>Direct LeetCode GraphQL Submission</span>
            <a
              href={`https://leetcode.com/problems/${selectedPreset?.slug || ''}/`}
              target="_blank"
              rel="noreferrer"
              className="text-slate-400 hover:text-amber-400 flex items-center gap-1 transition"
            >
              <span>View Problem</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
