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
    <div className="relative overflow-hidden rounded-[32px] expressive-card p-6 sm:p-9 shadow-2xl">
      {/* Soft Material ambient lighting */}
      <div className="absolute top-0 right-10 w-96 h-96 bg-[#4affbd]/10 rounded-full blur-[110px] pointer-events-none" />
      <div className="absolute -bottom-10 left-10 w-80 h-80 bg-[#ffe855]/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        {/* Left: Streak Counter & Status */}
        <div className="space-y-6">
          {/* Status Badges */}
          <div className="flex flex-wrap items-center gap-2.5">
            <span
              className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide border transition ${
                isSafe
                  ? 'bg-[#4affbd]/15 text-[#4affbd] border-[#4affbd]/40'
                  : 'bg-[#ffe855]/15 text-[#ffe855] border-[#ffe855]/40'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isSafe ? 'bg-[#4affbd]' : 'bg-[#ffe855] animate-expressive-pulse'
                }`}
              />
              <span>{isSafe ? 'Streak Safe Today' : 'Needs Today\'s Submission'}</span>
            </span>

            {/* Countdown pill widget */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-mono text-slate-200 bg-white/[0.06] border border-white/[0.08]">
              <Clock className="w-3.5 h-3.5 text-[#ffe855]" />
              <span>
                Reset in: <strong className="text-white font-bold">{format2Digit(timeLeft.hours)}:{format2Digit(timeLeft.minutes)}:{format2Digit(timeLeft.seconds)}</strong> UTC
              </span>
            </div>
          </div>

          {/* Hero Streak Numbers */}
          <div className="flex items-center gap-6">
            <div className="relative flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-[26px] bg-[#4affbd]/10 border border-[#4affbd]/30 text-[#4affbd] shadow-lg shadow-[#4affbd]/10 transition-transform duration-500 hover:scale-105">
              <Flame className="w-10 h-10 sm:w-12 sm:h-12 fill-[#4affbd] text-[#4affbd]" />
              <div className="absolute inset-0 rounded-[26px] bg-[#4affbd]/5 animate-expressive-pulse" />
            </div>

            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl sm:text-7xl font-extrabold tracking-tight text-white font-['Google_Sans_Flex',sans-serif]">
                  {streak}
                </span>
                <span className="text-lg sm:text-2xl font-bold text-slate-400">
                  {streak === 1 ? 'day' : 'days'}
                </span>
              </div>
              <p className="text-xs text-slate-300 flex items-center gap-2 mt-1">
                <span className="font-medium">Active LeetCode Streak</span>
                <span className="text-slate-600">•</span>
                <span className="text-[#4affbd] font-semibold">
                  {totalDays} Active {totalDays === 1 ? 'Day' : 'Days'} Total
                </span>
              </p>
            </div>
          </div>

          {/* Submissions note */}
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <CalendarCheck className="w-4 h-4 text-[#4affbd] shrink-0" />
            <span>
              {profile.calendar.submissionsToday > 0
                ? `${profile.calendar.submissionsToday} submission${profile.calendar.submissionsToday > 1 ? 's' : ''} logged on LeetCode today.`
                : 'No submission registered yet today. Tap the button to submit and preserve your streak!'}
            </span>
          </div>
        </div>

        {/* Right: The 1-Tap Action Card */}
        <div className="w-full lg:max-w-md expressive-subcard p-6 shadow-2xl flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#4affbd]" />
              <span className="font-bold text-xs text-white uppercase tracking-wider">
                Instant Streak Saver
              </span>
            </div>
            {selectedPreset && (
              <button
                onClick={() => onViewCode(selectedPreset)}
                className="text-xs text-[#4affbd] hover:text-[#5bff89] flex items-center gap-1 font-semibold transition"
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Code Preview</span>
              </button>
            )}
          </div>

          {/* Preset Selector */}
          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1.5">
              Select Problem to Submit:
            </label>
            <div className="relative">
              <select
                value={selectedPreset?.slug || ''}
                onChange={(e) => {
                  const p = presets.find((item) => item.slug === e.target.value);
                  if (p) onSelectPreset(p);
                }}
                disabled={submitting}
                className="w-full appearance-none bg-black/40 border border-white/[0.1] hover:border-white/[0.2] rounded-2xl px-4 py-3 text-xs text-white font-medium focus:outline-none focus:border-[#4affbd] transition cursor-pointer"
              >
                {presets.map((p) => (
                  <option key={p.slug} value={p.slug} className="bg-slate-900 text-white">
                    {p.title} ({p.difficulty} • 100% AC)
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
            </div>
          </div>

          {/* THE MAIN ACTION BUTTON */}
          <div className="pt-1">
            {!status?.hasCredentials ? (
              <button
                onClick={onOpenLogin}
                className="w-full py-4 px-6 rounded-full bg-[#ffe855] hover:bg-[#ffd159] text-black font-extrabold text-xs uppercase tracking-wider transition shadow-lg shadow-[#ffe855]/20 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>One-Time Login to Save Streak</span>
              </button>
            ) : (
              <button
                onClick={onSaveStreak}
                disabled={submitting}
                className={`w-full py-4 px-6 rounded-full font-extrabold text-sm tracking-wide transition flex items-center justify-center gap-2.5 shadow-xl ${
                  submitting
                    ? 'bg-[#4affbd]/70 text-black cursor-wait'
                    : isSafe
                    ? 'bg-white/[0.1] hover:bg-white/[0.16] text-white border border-white/[0.12]'
                    : 'bg-[#4affbd] hover:bg-[#38ef7d] text-black mint-glow'
                }`}
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>{submitProgress || 'Submitting to LeetCode...'}</span>
                  </>
                ) : isSafe ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-[#4affbd]" />
                    <span>Streak Safe • Submit Extra Solution</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-black text-black" />
                    <span>SAVE STREAK NOW</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Result banner */}
          {lastResult && (
            <div className="p-3.5 rounded-2xl bg-black/50 border border-[#4affbd]/40 flex items-center justify-between text-xs transition">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#4affbd] shrink-0" />
                <div>
                  <span className="font-bold text-[#4affbd]">
                    {lastResult.statusMsg}
                  </span>
                  <span className="text-slate-300 ml-1.5 font-mono text-[11px]">
                    ({lastResult.runtime || '0 ms'} • {lastResult.memory || 'RAM OK'})
                  </span>
                </div>
              </div>
              <span className="text-[10px] uppercase font-bold text-[#4affbd] px-2 py-0.5 rounded-full bg-[#4affbd]/10 border border-[#4affbd]/20">
                Verified
              </span>
            </div>
          )}

          <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 pt-0.5">
            <span>Direct LeetCode Submission</span>
            <a
              href={`https://leetcode.com/problems/${selectedPreset?.slug || ''}/`}
              target="_blank"
              rel="noreferrer"
              className="text-[#4affbd] hover:underline flex items-center gap-1 font-medium transition"
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
