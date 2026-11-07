import React, { useState } from 'react';
import { Flame, RefreshCw, Lock, CheckCircle2, User, Search, ArrowRight } from 'lucide-react';
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
    <header className="sticky top-4 z-40 w-full px-4 sm:px-8 mb-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 floating-pill-nav py-2.5 px-4 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-2xl bg-[#4affbd] text-black shadow-md shadow-[#4affbd]/20 transition-transform duration-300 hover:scale-105">
            <Flame className="w-5 h-5 fill-black text-black" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm sm:text-base tracking-tight text-white">LeetStreak</span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-[#4affbd]/15 text-[#4affbd] border border-[#4affbd]/30 hidden sm:inline-block">
              Expressive
            </span>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* User Switcher Pill */}
          {isEditingUser ? (
            <form onSubmit={handleUserSubmit} className="flex items-center gap-1.5">
              <input
                type="text"
                autoFocus
                placeholder="Username (e.g. lee215)"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                className="bg-white/[0.08] border border-white/[0.15] rounded-full px-3.5 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#4affbd] w-36 sm:w-44 font-mono transition"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-[#4affbd] hover:bg-[#38ef7d] text-black font-semibold rounded-full text-xs transition"
              >
                Go
              </button>
              <button
                type="button"
                onClick={() => setIsEditingUser(false)}
                className="p-1.5 text-slate-400 hover:text-white text-xs"
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
              className="flex items-center gap-2 bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] hover:border-white/[0.16] rounded-full px-3.5 py-1.5 text-xs text-slate-200 transition"
            >
              {profile?.profile.userAvatar ? (
                <img
                  src={profile.profile.userAvatar}
                  alt={currentUsername}
                  className="w-4 h-4 rounded-full ring-1 ring-[#4affbd]/50 object-cover"
                />
              ) : (
                <User className="w-3.5 h-3.5 text-[#4affbd]" />
              )}
              <span className="font-medium max-w-[85px] sm:max-w-[130px] truncate">
                {currentUsername ? `@${currentUsername}` : 'Select User'}
              </span>
              <Search className="w-3 h-3 text-slate-400" />
            </button>
          )}

          {/* Login / Auth Pill */}
          <button
            onClick={onOpenLogin}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-xs font-semibold transition ${
              isAuthenticated
                ? 'bg-[#4affbd]/15 border-[#4affbd]/40 text-[#4affbd] hover:bg-[#4affbd]/25'
                : 'bg-[#ffe855]/15 border-[#ffe855]/40 text-[#ffe855] hover:bg-[#ffe855]/25'
            }`}
          >
            {isAuthenticated ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-[#4affbd] animate-expressive-pulse" />
                <span className="hidden sm:inline">Connected</span>
                <span className="sm:hidden">Active</span>
              </>
            ) : (
              <>
                <Lock className="w-3 h-3 text-[#ffe855]" />
                <span>1-Time Login</span>
              </>
            )}
          </button>

          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={loading}
            title="Refresh profile data"
            className="p-2 rounded-full bg-white/[0.06] border border-white/[0.08] hover:bg-white/[0.1] text-slate-300 hover:text-white transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#4affbd]' : ''}`} />
          </button>
        </div>
      </div>
    </header>
  );
};
