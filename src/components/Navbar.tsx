import React, { useState } from 'react';
import { Flame, RefreshCw, Lock, CheckCircle2, User, Search } from 'lucide-react';
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
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-slate-950/70 border-b border-white/[0.06] px-4 lg:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-b from-amber-500 to-amber-600 shadow-lg shadow-amber-500/10 text-slate-950">
            <Flame className="w-5 h-5 fill-slate-950 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base text-slate-100 tracking-tight">LeetStreak</span>
              <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">Automated Daily Streak Preserver</p>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* User Switcher Pill */}
          {isEditingUser ? (
            <form onSubmit={handleUserSubmit} className="flex items-center gap-1.5">
              <input
                type="text"
                autoFocus
                placeholder="Username (e.g. tourist)"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                className="bg-slate-900 border border-white/[0.15] rounded-xl px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/50 w-36 sm:w-44 font-mono"
              />
              <button
                type="submit"
                className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded-xl text-xs transition"
              >
                Go
              </button>
              <button
                type="button"
                onClick={() => setIsEditingUser(false)}
                className="p-1.5 text-slate-400 hover:text-slate-200 text-xs"
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
              className="flex items-center gap-2 bg-slate-900/80 hover:bg-slate-800/80 border border-white/[0.08] hover:border-white/[0.15] rounded-xl px-3 py-1.5 text-xs text-slate-200 transition"
            >
              {profile?.profile.userAvatar ? (
                <img
                  src={profile.profile.userAvatar}
                  alt={currentUsername}
                  className="w-5 h-5 rounded-full ring-1 ring-white/10 object-cover"
                />
              ) : (
                <User className="w-3.5 h-3.5 text-amber-400" />
              )}
              <span className="font-medium max-w-[90px] sm:max-w-[130px] truncate">
                {currentUsername ? `@${currentUsername}` : 'Select User'}
              </span>
              <Search className="w-3 h-3 text-slate-500" />
            </button>
          )}

          {/* Login / Auth Status Pill */}
          <button
            onClick={onOpenLogin}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition ${
              isAuthenticated
                ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300 hover:bg-emerald-950/50'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
            }`}
          >
            {isAuthenticated ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-soft-pulse" />
                <span className="hidden sm:inline">Logged In</span>
                <span className="sm:hidden">Active</span>
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>1-Time Login</span>
              </>
            )}
          </button>

          {/* Refresh Data */}
          <button
            onClick={onRefresh}
            disabled={loading}
            title="Refresh profile data"
            className="p-2 rounded-xl bg-slate-900/80 border border-white/[0.08] hover:border-white/[0.15] text-slate-300 hover:text-white transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-400' : ''}`} />
          </button>
        </div>
      </div>
    </header>
  );
};
