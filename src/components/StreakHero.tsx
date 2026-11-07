import React, { useState, useEffect } from 'react';
import {
  Flame,
  Zap,
  CheckCircle,
  AlertCircle,
  Clock,
  ChevronDown,
  Code2,
  CalendarCheck,
  ShieldCheck,
  Sparkles,
  ExternalLink,
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
  onOpenSettings: () => void;
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
  onOpenSettings,
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
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-slate-800 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
      {/* Background glow effects */}
      <div className="absolute -top-24 -left-24 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        {/* Left: Streak Metrics & User Summary */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                isSafe
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse'
              }`}
            >
              {isSafe ? (
                <>
                  <CheckCircle className="w-3.5 h-3.5" />
                  Streak Safe Today
                </>
              ) : (
                <>
                  <AlertCircle className="w-3.5 h-3.5" />
                  Needs Submission Today
                </>
              )}
            </span>

            {/* UTC Midnight Countdown */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium text-slate-300 bg-slate-800/80 border border-slate-700/60">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>
                Resets in: <strong className="text-white font-mono">{format2Digit(timeLeft.hours)}h {format2Digit(timeLeft.minutes)}m {format2Digit(timeLeft.seconds)}s</strong> (UTC)
              </span>
            </div>
          </div>

          {/* Huge Streak Number & Flame */}
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="relative flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-amber-600 to-orange-500 shadow-xl shadow-orange-500/25">
              <Flame className="w-12 h-12 sm:w-14 sm:h-14 text-white fill-white animate-flame" />
              <div className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500"></span>
              </div>
            </div>

            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl sm:text-6xl font-black tracking-tight text-white font-mono">
                  {streak}
                </span>
                <span className="text-xl sm:text-2xl font-bold text-slate-400">
                  {streak === 1 ? 'day' : 'days'}
                </span>
              </div>
              <p className="text-sm text-slate-300 flex items-center gap-2 mt-1">
                <span>Current LeetCode Streak</span>
                <span className="text-slate-600">•</span>
                <span className="text-amber-400/90 font-medium">
                  {totalDays} Total Active {totalDays === 1 ? 'Day' : 'Days'}
                </span>
              </p>
            </div>
          </div>

          {/* Submissions today note */}
          <p className="text-xs text-slate-400 flex items-center gap-2">
            <CalendarCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              {profile.calendar.submissionsToday > 0
                ? `${profile.calendar.submissionsToday} submission${profile.calendar.submissionsToday > 1 ? 's' : ''} recorded today.`
                : 'Zero submissions recorded today. Tap the button to submit and preserve your streak!'}
            </span>
          </p>
        </div>

        {/* Right: The Save Streak Action Card */}
        <div className="w-full lg:max-w-md bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-inner flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
              <span className="font-bold text-sm text-slate-200">1-Tap Streak Saver</span>
            </div>
            {selectedPreset && (
              <button
                onClick={() => onViewCode(selectedPreset)}
                className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium transition"
              >
                <Code2 className="w-3.5 h-3.5" />
                View Code
              </button>
            )}
          </div>

          {/* Preset Selector */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Select Question to Auto-Submit:
            </label>
            <div className="relative">
              <select
                value={selectedPreset?.slug || ''}
                onChange={(e) => {
                  const p = presets.find((item) => item.slug === e.target.value);
                  if (p) onSelectPreset(p);
                }}
                disabled={submitting}
                className="w-full appearance-none bg-slate-950 border border-slate-700/80 hover:border-slate-600 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 font-medium focus:outline-none focus:ring-1 focus:ring-amber-500 transition cursor-pointer"
              >
                {presets.map((p) => (
                  <option key={p.slug} value={p.slug}>
                    {p.title} ({p.difficulty} • Verified 100% AC)
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>

          {/* THE MAIN ACTION BUTTON */}
          <div className="pt-1">
            {!status?.hasCredentials ? (
              <button
                onClick={onOpenSettings}
                className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold text-base tracking-wide shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition transform active:scale-[0.98]"
              >
                <Sparkles className="w-5 h-5" />
                Configure Cookies to Save Streak
              </button>
            ) : (
              <button
                onClick={onSaveStreak}
                disabled={submitting}
                className={`w-full py-4 px-6 rounded-xl font-extrabold text-base tracking-wide shadow-lg flex items-center justify-center gap-2.5 transition transform active:scale-[0.98] ${
                  submitting
                    ? 'bg-amber-600 text-slate-950 cursor-wait'
                    : isSafe
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-emerald-500/20'
                    : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-amber-500/30'
                }`}
              >
                {submitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>{submitProgress || 'Submitting to LeetCode...'}</span>
                  </>
                ) : isSafe ? (
                  <>
                    <Zap className="w-5 h-5 fill-slate-950" />
                    <span>Streak Safe • Submit Extra Question</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 fill-slate-950" />
                    <span>⚡ SAVE STREAK NOW</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Submission feedback banner if available */}
          {lastResult && (
            <div className="p-3 rounded-xl bg-slate-950 border border-emerald-500/30 flex items-center justify-between text-xs animate-in fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <span className="font-semibold text-emerald-300">
                    {lastResult.statusMsg}
                  </span>
                  <span className="text-slate-400 ml-1.5">
                    ({lastResult.runtime || 'fast'} • {lastResult.memory || 'low mem'})
                  </span>
                </div>
              </div>
              <span className="text-[11px] text-slate-500">Streak Updated!</span>
            </div>
          )}

          <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
            <span>Submits securely via LeetCode Session</span>
            <a
              href={`https://leetcode.com/problems/${selectedPreset?.slug || ''}/`}
              target="_blank"
              rel="noreferrer"
              className="text-slate-400 hover:text-amber-400 flex items-center gap-1 transition"
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

