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
      <div className="md:col-span-2 bg-slate-900/60 border border-white/[0.08] rounded-2xl p-5 sm:p-6 backdrop-blur-xl shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-amber-400" />
            <h3 className="font-semibold text-slate-100 text-sm tracking-tight">Solved Problems</h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {totalSolved} / {totalQuestions} Solved ({overallPercent}%)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 items-center">
          {/* Radial Total Gauge */}
          <div className="flex flex-col items-center justify-center p-4 bg-slate-950/70 rounded-2xl border border-white/[0.06]">
            <div className="relative w-28 h-28 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className="stroke-slate-800/80"
                  strokeWidth="7"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className="stroke-amber-500 transition-all duration-1000 ease-out"
                  strokeWidth="7"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - overallPercent / 100)}`}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-black text-white font-mono">{totalSolved}</span>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Total</span>
              </div>
            </div>
            <div className="text-[11px] text-slate-400 mt-2 font-mono">
              Acceptance: <span className="text-slate-200 font-semibold">{acceptanceRate}%</span>
            </div>
          </div>

          {/* Easy, Medium, Hard breakdown bars */}
          <div className="sm:col-span-3 space-y-3.5">
            {/* Easy */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-teal-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                  Easy
                </span>
                <span className="font-mono text-slate-300 text-xs">
                  <strong className="text-white">{easySolved}</strong>
                  <span className="text-slate-500"> / {easyTotal}</span>
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-white/[0.04]">
                <div
                  className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(100, (easySolved / easyTotal) * 100)}%` }}
                />
              </div>
            </div>

            {/* Medium */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-amber-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  Medium
                </span>
                <span className="font-mono text-slate-300 text-xs">
                  <strong className="text-white">{medSolved}</strong>
                  <span className="text-slate-500"> / {medTotal}</span>
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-white/[0.04]">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-400 rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(100, (medSolved / medTotal) * 100)}%` }}
                />
              </div>
            </div>

            {/* Hard */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-rose-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                  Hard
                </span>
                <span className="font-mono text-slate-300 text-xs">
                  <strong className="text-white">{hardSolved}</strong>
                  <span className="text-slate-500"> / {hardTotal}</span>
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-white/[0.04]">
                <div
                  className="h-full bg-gradient-to-r from-rose-500 to-pink-500 rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(100, (hardSolved / hardTotal) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Global Ranking & Profile Card */}
      <div className="bg-slate-900/60 border border-white/[0.08] rounded-2xl p-5 sm:p-6 backdrop-blur-xl shadow-xl flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-4 h-4 text-amber-400" />
            <h3 className="font-semibold text-slate-100 text-sm tracking-tight">LeetCode Standing</h3>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 bg-slate-950/70 border border-white/[0.06] rounded-xl flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Global Ranking</p>
                <p className="text-xl font-bold text-white font-mono mt-0.5">
                  ~{profile.profile.ranking ? profile.profile.ranking.toLocaleString() : 'N/A'}
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                <Award className="w-4 h-4" />
              </div>
            </div>

            <div className="p-3.5 bg-slate-950/70 border border-white/[0.06] rounded-xl flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Reputation Points</p>
                <p className="text-xl font-bold text-white font-mono mt-0.5">
                  {profile.profile.reputation?.toLocaleString() ?? 0}
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-400 pt-1 flex items-center justify-between border-t border-white/[0.06]">
          <span>{profile.profile.countryName || 'Global Coder'}</span>
          <span className="text-slate-500 font-mono text-[11px]">Synced via GraphQL</span>
        </div>
      </div>
    </div>
  );
};
