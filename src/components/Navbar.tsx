import React, { useState } from 'react';
import { RefreshCw, Lock, CheckCircle2, User, Search, Flame } from 'lucide-react';
import { UserProfileData, AppStatus } from '../types';

interface NavbarProps {
  profile: UserProfileData | null;
  status: AppStatus | null;
  loading: boolean;
  onRefresh: () => void;
  onOpenLogin: () => void;
  onSwitchUser: (username: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  profile,
  status,
  loading,
  onRefresh,
  onOpenLogin,
  onSwitchUser,
}) => {
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [usernameInput, setUsernameInput] = useState('');

  const handleUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (usernameInput.trim()) {
      onSwitchUser(usernameInput.trim());
      setIsEditingUser(false);
      setUsernameInput('');
    }
  };

  const isAuthenticated = Boolean(status?.hasCredentials);
  const currentUsername = profile?.username || status?.username || '';

  return (
    <header className="sticky top-0 z-40 w-full bg-[#1e1e1e]/95 backdrop-blur-md border-b border-white/[0.08] px-3.5 sm:px-6 py-2.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2.5">
        {/* Brand: LeetCode Orange Flame & Title */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#FFA116] text-black shadow-md shadow-[#FFA116]/20">
            <Flame className="w-5 h-5 fill-black text-black" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-sm sm:text-base tracking-tight text-white">
              LeetStreak
            </span>
            <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.2 rounded bg-[#FFA116]/20 text-[#FFA116] border border-[#FFA116]/30 hidden sm:inline-block">
              Streak Saver
            </span>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* User Switcher Pill */}
          {isEditingUser ? (
            <form onSubmit={handleUserSubmit} className="flex items-center gap-1">
              <input
                type="text"
                autoFocus
                placeholder="Username (e.g. lee215)"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                className="bg-[#282828] border border-[#FFA116]/50 rounded-lg px-2.5 py-1 text-xs text-white placeholder-slate-500 focus:outline-none w-28 sm:w-40 font-mono transition"
              />
              <button
                type="submit"
                className="px-2.5 py-1 bg-[#FFA116] hover:bg-[#ffb43a] text-black font-bold rounded-lg text-xs transition"
              >
                Go
              </button>
              <button
                type="button"
                onClick={() => setIsEditingUser(false)}
                className="p-1 text-[#8A8A8E] hover:text-white text-xs"
              >
                ✕
              </button>
            </form>
          ) : (
            <button
              onClick={() => {
                setUsernameInput(currentUsername);
                setIsEditingUser(true);
              }}
              title="Click to switch LeetCode user"
              className="flex items-center gap-1.5 bg-[#282828] hover:bg-[#333333] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-xs text-[#eff0f6] transition max-w-[130px] sm:max-w-[180px]"
            >
              {profile?.profile.userAvatar ? (
                <img
                  src={profile.profile.userAvatar}
                  alt={currentUsername}
                  className="w-4 h-4 rounded-full ring-1 ring-[#FFA116]/60 object-cover shrink-0"
                />
              ) : (
                <User className="w-3.5 h-3.5 text-[#FFA116] shrink-0" />
              )}
              <span className="font-semibold truncate text-[11px] sm:text-xs">
                {currentUsername ? `@${currentUsername}` : 'User'}
              </span>
              <Search className="w-3 h-3 text-[#8A8A8E] shrink-0" />
            </button>
          )}

          {/* Login / Auth Pill */}
          <button
            onClick={onOpenLogin}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg border text-xs font-semibold transition shrink-0 ${
              isAuthenticated
                ? 'bg-[#00B8A3]/15 border-[#00B8A3]/40 text-[#00B8A3] hover:bg-[#00B8A3]/25'
                : 'bg-[#FFA116]/15 border-[#FFA116]/40 text-[#FFA116] hover:bg-[#FFA116]/25'
            }`}
          >
            {isAuthenticated ? (
              <>
                <span className="w-2 h-2 rounded-full bg-[#00B8A3]" />
                <span className="hidden sm:inline">Active</span>
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5 text-[#FFA116]" />
                <span className="hidden sm:inline">Login</span>
                <span className="sm:hidden">Auth</span>
              </>
            )}
          </button>

          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={loading}
            title="Refresh profile data"
            className="p-1.5 sm:p-2 rounded-lg bg-[#282828] border border-white/[0.08] hover:bg-[#333333] text-[#8A8A8E] hover:text-white transition disabled:opacity-50 shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#FFA116]' : ''}`} />
          </button>
        </div>
      </div>
    </header>
  );
};
