import React from 'react';
import { Target, Award, CheckCircle2, TrendingUp } from 'lucide-react';
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
    <div className="lc-card p-4 sm:p-6 transition-all space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#FFA116]/15 text-[#FFA116] flex items-center justify-center font-bold">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-bold text-white text-base tracking-tight">Solved Questions</h2>
            <p className="text-xs text-[#8A8A8E]">Overall problem-solving progress & breakdown</p>
          </div>
        </div>
        <span className="text-xs font-mono text-[#8A8A8E] px-2.5 py-1 rounded-md bg-[#282828] border border-white/[0.06]">
          {overallPercent}% Complete
        </span>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
        {/* Left: Total Gauge & Acceptance (4 cols on desktop) */}
        <div className="lg:col-span-4 lc-subcard p-5 flex flex-col items-center justify-center text-center">
          <div className="relative w-32 h-32 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                className="stroke-[#2c2c2c]"
                strokeWidth="8"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                className="stroke-[#FFA116] transition-all duration-1000 ease-out"
                strokeWidth="8"
                strokeDasharray={`${2 * Math.PI * 40}`}
                strokeDashoffset={`${2 * Math.PI * 40 * (1 - overallPercent / 100)}`}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-white font-mono">{totalSolved}</span>
              <span className="text-[10px] text-[#8A8A8E] uppercase tracking-wider font-bold">
                / {totalQuestions}
              </span>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-center gap-4 text-xs font-medium text-[#8A8A8E]">
            <div>
              Acceptance: <strong className="text-white font-bold">{acceptanceRate}%</strong>
            </div>
            <span>•</span>
            <div>
              Total: <strong className="text-white font-bold">{totalSubmissions.toLocaleString()}</strong>
            </div>
          </div>
        </div>

        {/* Center: Easy, Medium, Hard Progress Bars (8 cols on desktop) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Easy */}
          <div className="lc-subcard p-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00B8A3]" />
                <span className="font-bold text-[#00B8A3] text-sm">Easy</span>
              </div>
              <span className="font-mono text-xs">
                <strong className="text-white text-sm">{easySolved}</strong>
                <span className="text-[#8A8A8E]"> / {easyTotal}</span>
                <span className="text-[#00B8A3] ml-2 font-bold">
                  ({Math.round((easySolved / easyTotal) * 100)}%)
                </span>
              </span>
            </div>
            <div className="w-full h-2 bg-[#1c1c1c] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#00B8A3] rounded-full transition-all duration-700"
                style={{ width: `${Math.min(100, (easySolved / easyTotal) * 100)}%` }}
              />
            </div>
          </div>

          {/* Medium */}
          <div className="lc-subcard p-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FFC01E]" />
                <span className="font-bold text-[#FFC01E] text-sm">Medium</span>
              </div>
              <span className="font-mono text-xs">
                <strong className="text-white text-sm">{medSolved}</strong>
                <span className="text-[#8A8A8E]"> / {medTotal}</span>
                <span className="text-[#FFC01E] ml-2 font-bold">
                  ({Math.round((medSolved / medTotal) * 100)}%)
                </span>
              </span>
            </div>
            <div className="w-full h-2 bg-[#1c1c1c] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#FFC01E] rounded-full transition-all duration-700"
                style={{ width: `${Math.min(100, (medSolved / medTotal) * 100)}%` }}
              />
            </div>
          </div>

          {/* Hard */}
          <div className="lc-subcard p-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF375F]" />
                <span className="font-bold text-[#FF375F] text-sm">Hard</span>
              </div>
              <span className="font-mono text-xs">
                <strong className="text-white text-sm">{hardSolved}</strong>
                <span className="text-[#8A8A8E]"> / {hardTotal}</span>
                <span className="text-[#FF375F] ml-2 font-bold">
                  ({Math.round((hardSolved / hardTotal) * 100)}%)
                </span>
              </span>
            </div>
            <div className="w-full h-2 bg-[#1c1c1c] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#FF375F] rounded-full transition-all duration-700"
                style={{ width: `${Math.min(100, (hardSolved / hardTotal) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
