import React, { useState } from 'react';
import { Flame, RefreshCw, KeyRound, CheckCircle2, AlertTriangle, UserCheck, Search } from 'lucide-react';
import { UserProfileData, AppStatus } from '../types';

interface NavbarProps {
  profile: UserProfileData | null;
  status: AppStatus | null;
  loading: boolean;
  onRefresh: () => void;
  onOpenSettings: () => void;
  onSwitchUser: (username: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  profile,
  status,
  loading,
  onRefresh,
  onOpenSettings,
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

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-slate-950/80 border-b border-slate-800/80 px-4 lg:px-8 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-orange-500/20 text-white font-extrabold text-xl">
            <Flame className="w-6 h-6 fill-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-slate-100 tracking-tight">LeetStreak</span>
              <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Streak Saver
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">Never lose your daily coding streak</p>
          </div>
        </div>

        {/* User Search & Switcher */}
        <div className="flex items-center gap-2 sm:gap-4">
          {isEditingUser ? (
            <form onSubmit={handleUserSubmit} className="flex items-center gap-1.5">
              <input
                type="text"
                autoFocus
                placeholder="LeetCode username"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                className="bg-slate-900 border border-amber-500/50 rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500 w-36 sm:w-48"
              />
              <button
                type="submit"
                className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold rounded-lg text-xs"
              >
                Go
              </button>
              <button
                type="button"
                onClick={() => setIsEditingUser(false)}
                className="px-2 py-1.5 text-slate-400 hover:text-slate-200 text-xs"
              >
                ✕
              </button>
            </form>
          ) : (
            <button
              onClick={() => {
                setUsernameInput(profile?.username || status?.username || '');
                setIsEditingUser(true);
              }}
              title="Click to change LeetCode user"
              className="flex items-center gap-2 bg-slate-900/90 hover:bg-slate-850 hover:border-slate-700 transition border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200"
            >
              {profile?.profile.userAvatar ? (
                <img
                  src={profile.profile.userAvatar}
                  alt={profile.username}
                  className="w-5 h-5 rounded-full ring-1 ring-slate-700 object-cover"
                />
              ) : (
                <UserCheck className="w-4 h-4 text-amber-400" />
              )}
              <span className="font-semibold max-w-[100px] sm:max-w-[140px] truncate">
                {profile?.username || status?.username || 'Enter Username'}
              </span>
              <Search className="w-3.5 h-3.5 text-slate-400" />
            </button>
          )}

          {/* Auth Credentials Status Indicator */}
          <button
            onClick={onOpenSettings}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-medium transition ${
              status?.hasCredentials
                ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-400 hover:bg-emerald-900/30'
                : 'bg-amber-950/40 border-amber-800/60 text-amber-400 hover:bg-amber-900/30'
            }`}
          >
            {status?.hasCredentials ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden md:inline">Cookies Ready</span>
                <span className="md:hidden">Ready</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span className="hidden md:inline">Configure Auth</span>
                <span className="md:hidden">Auth</span>
              </>
            )}
          </button>

          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={loading}
            title="Refresh LeetCode data"
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-400' : ''}`} />
          </button>

          {/* Settings Trigger */}
          <button
            onClick={onOpenSettings}
            title="Settings & Credentials"
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition"
          >
            <KeyRound className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

