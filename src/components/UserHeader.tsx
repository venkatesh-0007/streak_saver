import React, { useState, useEffect } from 'react';
import {
  Flame,
  Clock,
  CheckCircle2,
  AlertCircle,
  Trophy,
  User,
  Zap,
  Code2,
  ChevronDown,
  Lock,
} from 'lucide-react';
import { UserProfileData, PresetQuestion, AppStatus } from '../types';

interface UserHeaderProps {
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

export const UserHeader: React.FC<UserHeaderProps> = ({
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
  const isAuthenticated = Boolean(status?.hasCredentials);

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
    <div className="lc-card p-4 sm:p-6 transition-all border-white/[0.08] shadow-2xl space-y-4 sm:space-y-5">
      {/* Top Profile & Streak Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: User Profile Details */}
        <div className="flex items-center gap-3.5 sm:gap-4 shrink-0">
          {profile.profile.userAvatar ? (
            <img
              src={profile.profile.userAvatar}
              alt={profile.username}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl ring-2 ring-[#FFA116]/50 object-cover bg-[#282828] shrink-0"
            />
          ) : (
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#FFA116]/15 border border-[#FFA116]/30 flex items-center justify-center text-[#FFA116] shrink-0">
              <User className="w-7 h-7" />
            </div>
          )}

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {profile.profile.realName || profile.username}
              </h1>
              <span className="text-xs text-[#8A8A8E] font-mono">@{profile.username}</span>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs text-[#8A8A8E] mt-1">
              <span className="flex items-center gap-1 text-[#FFA116] font-semibold">
                <Trophy className="w-3.5 h-3.5" />
                <span>Rank #{profile.profile.ranking ? profile.profile.ranking.toLocaleString() : 'N/A'}</span>
              </span>
              <span>•</span>
              <span>{totalDays} Active Days</span>
              {profile.profile.countryName && (
                <>
                  <span>•</span>
                  <span>{profile.profile.countryName}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right: Streak & Status Badges */}
        <div className="flex items-center gap-2.5 sm:gap-3 self-start sm:self-auto">
          {/* Flame Streak Pill */}
          <div className="lc-subcard px-3.5 py-2 flex items-center gap-2.5 border-[#FFA116]/30 shrink-0">
            <div className="w-8 h-8 rounded-xl bg-[#FFA116]/15 text-[#FFA116] flex items-center justify-center shrink-0">
              <Flame className="w-4 h-4 fill-[#FFA116]" />
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-lg sm:text-xl font-black text-white font-mono">{streak}</span>
                <span className="text-[11px] text-[#8A8A8E] font-semibold">days</span>
              </div>
              <p className="text-[8px] text-[#8A8A8E] uppercase tracking-wider font-extrabold">
                DAILY STREAK
              </p>
            </div>
          </div>

          {/* Status badge & Countdown */}
          <div className="flex flex-col gap-1 shrink-0">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold tracking-wide border ${
                isSafe
                  ? 'bg-[#00B8A3]/15 text-[#00B8A3] border-[#00B8A3]/40'
                  : 'bg-[#FFA116]/15 text-[#FFA116] border-[#FFA116]/40'
              }`}
            >
              {isSafe ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#00B8A3]" />
                  <span>Streak Safe Today</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-3.5 h-3.5 text-[#FFA116] animate-lc-pulse" />
                  <span>Needs Submission</span>
                </>
              )}
            </span>

            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-mono text-[#8A8A8E] bg-[#282828] border border-white/[0.06]">
              <Clock className="w-3 h-3 text-[#FFA116]" />
              <span>
                Reset: <strong className="text-white">{format2Digit(timeLeft.hours)}:{format2Digit(timeLeft.minutes)}:{format2Digit(timeLeft.seconds)}</strong> UTC
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* PROMINENT STREAK SAVER ACTION CARD (Focused & Much Bigger on Mobile) */}
      <div className="pt-2 border-t border-white/[0.06] space-y-3">
        {/* Preset Selector & Code Trigger */}
        <div className="flex items-center justify-between gap-2">
          <div className="relative flex-1">
            <select
              value={selectedPreset?.slug || ''}
              onChange={(e) => {
                const p = presets.find((item) => item.slug === e.target.value);
                if (p) onSelectPreset(p);
              }}
              disabled={submitting}
              className="w-full appearance-none bg-[#282828] border border-white/[0.1] hover:border-[#FFA116]/50 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white font-medium focus:outline-none focus:border-[#FFA116] transition cursor-pointer pr-8"
            >
              {presets.map((p) => (
                <option key={p.slug} value={p.slug} className="bg-[#1e1e1e] text-white">
                  Auto-Submit: {p.title} ({p.difficulty} • 100% AC)
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-[#8A8A8E] absolute right-3 top-3 pointer-events-none" />
          </div>

          {selectedPreset && (
            <button
              onClick={() => onViewCode(selectedPreset)}
              title="Inspect Python code solution"
              className="px-3.5 py-2.5 rounded-xl bg-[#282828] hover:bg-[#333333] border border-white/[0.08] hover:border-[#FFA116]/40 text-xs font-semibold text-[#FFA116] flex items-center gap-1.5 transition shrink-0"
            >
              <Code2 className="w-4 h-4" />
              <span className="hidden sm:inline">Inspect Code</span>
            </button>
          )}
        </div>

        {/* THE BIG ACTION BUTTON - FOCUSED, TALL & BOLD ON MOBILE */}
        <div>
          {!isAuthenticated ? (
            <button
              onClick={onOpenLogin}
              className="w-full py-4 sm:py-3.5 px-6 rounded-2xl bg-[#FFA116] hover:bg-[#ffb43a] text-black font-black text-sm sm:text-base tracking-wide uppercase transition shadow-lg shadow-[#FFA116]/20 flex items-center justify-center gap-2.5 active:scale-[0.99]"
            >
              <Lock className="w-5 h-5 fill-black" />
              <span>Connect Account to Enable 1-Tap Save</span>
            </button>
          ) : (
            <button
              onClick={onSaveStreak}
              disabled={submitting}
              className={`w-full py-4 sm:py-4 px-6 rounded-2xl font-black text-sm sm:text-base tracking-wide transition flex items-center justify-center gap-2.5 shadow-xl active:scale-[0.99] ${
                submitting
                  ? 'bg-[#FFA116]/80 text-black cursor-wait'
                  : isSafe
                  ? 'bg-[#282828] hover:bg-[#333333] text-[#00B8A3] border-2 border-[#00B8A3]/50'
                  : 'bg-gradient-to-r from-[#FFA116] to-[#ffb43a] text-black shadow-lg shadow-[#FFA116]/25 hover:brightness-105'
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

        {/* Real-time Verdict Result */}
        {lastResult && (
          <div className="p-3 rounded-xl bg-[#282828] border border-[#00B8A3]/50 flex items-center justify-between text-xs transition animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#00B8A3] shrink-0" />
              <div>
                <span className="font-bold text-[#00B8A3] text-sm">{lastResult.statusMsg}</span>
                <span className="text-[#8A8A8E] ml-2 font-mono text-xs">
                  ({lastResult.runtime || '0 ms'} • {lastResult.memory || 'low mem'})
                </span>
              </div>
            </div>
            <span className="text-[10px] uppercase font-bold text-[#00B8A3] px-2 py-0.5 rounded bg-[#00B8A3]/15 border border-[#00B8A3]/30">
              Verified
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
