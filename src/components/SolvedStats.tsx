import React from 'react';
import { Trophy, Target, Award, CheckCircle2 } from 'lucide-react';
import { UserProfileData } from '../types';

interface SolvedStatsProps {
  profile: UserProfileData;
}

export const SolvedStats: React.FC<SolvedStatsProps> = ({ profile }) => {
  const acList = profile.stats.acSubmissionNum || [];
  const totalList = profile.stats.allQuestionsCount || [];
  const totalSubmissionsList = profile.stats.totalSubmissionNum || [];

  const getAcCount = (diff: string) => acList.find((item) => item.difficulty === diff)?.count ?? 0;
  const getTotalCount = (diff: string) => totalList.find((item) => item.difficulty === diff)?.count ?? 1;

  const totalSolved = getAcCount('All');
  const totalQuestions = getTotalCount('All');

  const easySolved = getAcCount('Easy');
  const easyTotal = getTotalCount('Easy');

  const medSolved = getAcCount('Medium');
  const medTotal = getTotalCount('Medium');

  const hardSolved = getAcCount('Hard');
  const hardTotal = getTotalCount('Hard');

  // Acceptance rate calculation
  const totalSubmissions = totalSubmissionsList.find((item) => item.difficulty === 'All')?.submissions || 0;
  const acSubmissions = acList.find((item) => item.difficulty === 'All')?.submissions || 0;
  const acceptanceRate = totalSubmissions > 0 ? ((acSubmissions / totalSubmissions) * 100).toFixed(1) : 'N/A';

  const overallPercent = Math.min(100, Math.round((totalSolved / totalQuestions) * 100));

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {/* 1. Solved Problems Radial & Breakdown */}
      <div className="md:col-span-2 expressive-card p-6 sm:p-7 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#4affbd]/15 text-[#4affbd] flex items-center justify-center font-bold">
              <Target className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-white text-base tracking-tight">Solved Problems</h3>
          </div>
          <span className="text-xs font-mono text-slate-300 px-3 py-1 rounded-full bg-white/[0.06] border border-white/[0.08]">
            {totalSolved} / {totalQuestions} ({overallPercent}%)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 items-center">
          {/* Radial Total Gauge */}
          <div className="flex flex-col items-center justify-center p-5 expressive-subcard">
            <div className="relative w-28 h-28 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className="stroke-white/[0.08]"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className="stroke-[#4affbd] transition-all duration-1000 ease-out"
                  strokeWidth="8"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - overallPercent / 100)}`}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-3xl font-extrabold text-white font-['Google_Sans_Flex',sans-serif]">{totalSolved}</span>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Total</span>
              </div>
            </div>
            <div className="text-[11px] text-slate-400 mt-2 font-mono">
              Acceptance: <span className="text-[#4affbd] font-bold">{acceptanceRate}%</span>
            </div>
          </div>

          {/* Easy, Medium, Hard breakdown bars with sameerasw colors */}
          <div className="sm:col-span-3 space-y-4">
            {/* Easy */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#4affbd] flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#4affbd]" />
                  Easy
                </span>
                <span className="font-mono text-slate-300 text-xs">
                  <strong className="text-white">{easySolved}</strong>
                  <span className="text-slate-500"> / {easyTotal}</span>
                </span>
              </div>
              <div className="w-full h-2 bg-black/50 rounded-full overflow-hidden border border-white/[0.06]">
                <div
                  className="h-full bg-[#4affbd] rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(100, (easySolved / easyTotal) * 100)}%` }}
                />
              </div>
            </div>

            {/* Medium */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#ffe855] flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#ffe855]" />
                  Medium
                </span>
                <span className="font-mono text-slate-300 text-xs">
                  <strong className="text-white">{medSolved}</strong>
                  <span className="text-slate-500"> / {medTotal}</span>
                </span>
              </div>
              <div className="w-full h-2 bg-black/50 rounded-full overflow-hidden border border-white/[0.06]">
                <div
                  className="h-full bg-[#ffe855] rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(100, (medSolved / medTotal) * 100)}%` }}
                />
              </div>
            </div>

            {/* Hard */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#ff64f9] flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#ff64f9]" />
                  Hard
                </span>
                <span className="font-mono text-slate-300 text-xs">
                  <strong className="text-white">{hardSolved}</strong>
                  <span className="text-slate-500"> / {hardTotal}</span>
                </span>
              </div>
              <div className="w-full h-2 bg-black/50 rounded-full overflow-hidden border border-white/[0.06]">
                <div
                  className="h-full bg-[#ff64f9] rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(100, (hardSolved / hardTotal) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Global Ranking & Profile Card */}
      <div className="expressive-card p-6 sm:p-7 shadow-xl flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-8 h-8 rounded-xl bg-[#ffe855]/15 text-[#ffe855] flex items-center justify-center font-bold">
              <Trophy className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-white text-base tracking-tight">Standing</h3>
          </div>

          <div className="space-y-3.5">
            <div className="p-4 expressive-subcard flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Global Ranking</p>
                <p className="text-2xl font-bold text-white font-mono mt-0.5">
                  ~{profile.profile.ranking ? profile.profile.ranking.toLocaleString() : 'N/A'}
                </p>
              </div>
              <div className="p-2.5 rounded-2xl bg-[#ffe855]/15 text-[#ffe855]">
                <Award className="w-5 h-5" />
              </div>
            </div>

            <div className="p-4 expressive-subcard flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Reputation Points</p>
                <p className="text-2xl font-bold text-white font-mono mt-0.5">
                  {profile.profile.reputation?.toLocaleString() ?? 0}
                </p>
              </div>
              <div className="p-2.5 rounded-2xl bg-[#4affbd]/15 text-[#4affbd]">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-400 pt-2 flex items-center justify-between border-t border-white/[0.06]">
          <span>{profile.profile.countryName || 'Global Coder'}</span>
          <span className="text-[#4affbd] font-mono text-[11px] font-semibold">Live Synced</span>
        </div>
      </div>
    </div>
  );
};
