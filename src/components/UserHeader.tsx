import React, { useState, useEffect } from 'react';
import { Flame, Clock, CheckCircle2, AlertCircle, Award, Trophy, User } from 'lucide-react';
import { UserProfileData } from '../types';

interface UserHeaderProps {
  profile: UserProfileData;
  onOpenLogin: () => void;
}

export const UserHeader: React.FC<UserHeaderProps> = ({ profile }) => {
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
    <div className="lc-card p-4 sm:p-6 transition-all">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* User Info Left */}
        <div className="flex items-center gap-3.5">
          {profile.profile.userAvatar ? (
            <img
              src={profile.profile.userAvatar}
              alt={profile.username}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl ring-2 ring-[#FFA116]/40 object-cover bg-[#282828]"
            />
          ) : (
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#FFA116]/15 border border-[#FFA116]/30 flex items-center justify-center text-[#FFA116]">
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
                <span>Rank #{profile.profile.ranking?.toLocaleString() || 'N/A'}</span>
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

        {/* Streak & Status Right */}
        <div className="flex flex-wrap items-center gap-3 self-start md:self-auto">
          {/* Flame Streak Pill */}
          <div className="lc-subcard px-4 py-2.5 flex items-center gap-3 border-[#FFA116]/30">
            <div className="w-9 h-9 rounded-xl bg-[#FFA116]/15 text-[#FFA116] flex items-center justify-center">
              <Flame className="w-5 h-5 fill-[#FFA116]" />
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-black text-white font-mono">{streak}</span>
                <span className="text-xs text-[#8A8A8E] font-semibold">
                  {streak === 1 ? 'day' : 'days'}
                </span>
              </div>
              <p className="text-[10px] text-[#8A8A8E] uppercase tracking-wider font-bold">
                Daily Streak
              </p>
            </div>
          </div>

          {/* Status badge & Countdown */}
          <div className="flex flex-col gap-1.5">
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
                  <span>Needs Submission Today</span>
                </>
              )}
            </span>

            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[11px] font-mono text-[#8A8A8E] bg-[#282828] border border-white/[0.06]">
              <Clock className="w-3 h-3 text-[#FFA116]" />
              <span>
                Reset: <strong className="text-white">{format2Digit(timeLeft.hours)}:{format2Digit(timeLeft.minutes)}:{format2Digit(timeLeft.seconds)}</strong> UTC
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
