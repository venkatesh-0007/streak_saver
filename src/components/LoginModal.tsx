import React, { useState } from 'react';
import {
  X,
  Lock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  LogOut,
  Sparkles,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  Shield,
} from 'lucide-react';
import { AppStatus, UserProfileData } from '../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: AppStatus | null;
  profile: UserProfileData | null;
  onLogin: (cookieInput: string) => Promise<{ ok: boolean; username?: string; error?: string }>;
  onLogout: () => Promise<void>;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  status,
  profile,
  onLogin,
  onLogout,
}) => {
  const [cookieInput, setCookieInput] = useState(
    localStorage.getItem('leetcode_session') || ''
  );
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  const [activeTab, setActiveTab] = useState<'token' | 'credentials'>('token');

  // Username/Password tab state
  const [userLogin, setUserLogin] = useState('');
  const [password, setPassword] = useState('');

  if (!isOpen) return null;

  const handleTokenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cookieInput.trim()) {
      setErrorMessage('Please paste your session token or cookies.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await onLogin(cookieInput.trim());
      if (res.ok) {
        onClose();
      } else {
        setErrorMessage(res.error || 'Failed to authenticate session with LeetCode.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred during login.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(
      'LeetCode enforces Google reCAPTCHA Enterprise on password logins. Please use the 1-Time Session Token tab for instant 1-click access.'
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md transition-opacity">
      <div className="relative w-full max-w-lg bg-slate-900/95 border border-white/[0.08] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06] bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-100 tracking-tight">
                LeetCode Account Login
              </h2>
              <p className="text-xs text-slate-400">One-time login to automate your daily streak</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-white/[0.05] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Active Account Status Banner if already logged in */}
          {status?.hasCredentials && (
            <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/20 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {profile?.profile.userAvatar ? (
                  <img
                    src={profile.profile.userAvatar}
                    alt={profile.username}
                    className="w-10 h-10 rounded-full ring-2 ring-emerald-500/40 object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
                    ✓
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold text-white">
                      @{status.username || profile?.username || 'Authenticated'}
                    </span>
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                      Active
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Connected & ready for 1-tap streak saves.
                  </p>
                </div>
              </div>
              <button
                onClick={async () => {
                  await onLogout();
                  setCookieInput('');
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-rose-950/40 hover:border-rose-800/60 hover:text-rose-300 text-slate-300 text-xs font-medium border border-white/[0.08] transition flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          )}

          {/* Tab Selector */}
          <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-950/60 border border-white/[0.06] text-xs font-medium">
            <button
              type="button"
              onClick={() => setActiveTab('token')}
              className={`py-2 rounded-xl transition ${
                activeTab === 'token'
                  ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              1-Time Session (Recommended)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('credentials')}
              className={`py-2 rounded-xl transition ${
                activeTab === 'credentials'
                  ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Account Password
            </button>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-200 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Tab 1: 1-Time Session Token (Recommended) */}
          {activeTab === 'token' && (
            <form onSubmit={handleTokenSubmit} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-slate-200">
                    Paste Session Token or Full Cookies
                  </label>
                  <span className="text-[11px] text-amber-400/90 font-medium">
                    Auto-parsed & verified
                  </span>
                </div>
                <textarea
                  rows={3}
                  placeholder="Paste your LEETCODE_SESSION token or your entire Cookie string here..."
                  value={cookieInput}
                  onChange={(e) => setCookieInput(e.target.value)}
                  className="w-full bg-slate-950/80 border border-white/[0.08] focus:border-amber-500/50 rounded-2xl p-3.5 text-xs text-slate-100 placeholder-slate-500 font-mono focus:outline-none transition resize-none leading-relaxed"
                />
                <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Stored securely on your browser. You only need to do this once.</span>
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs tracking-wide shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Verifying with LeetCode...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Connect & Save Login</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Tab 2: Password Form */}
          {activeTab === 'credentials' && (
            <form onSubmit={handlePasswordSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1">
                  LeetCode Username or Email
                </label>
                <input
                  type="text"
                  placeholder="Username or email"
                  value={userLogin}
                  onChange={(e) => setUserLogin(e.target.value)}
                  className="w-full bg-slate-950/80 border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/50 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950/80 border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/50 font-mono"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-white/[0.06] text-[11px] text-slate-400 leading-relaxed">
                LeetCode requires an interactive reCAPTCHA check during password authentication. For headless automation, the <strong>1-Time Session</strong> token is the official standard.
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-white/[0.08] transition"
              >
                Sign In with Password
              </button>
            </form>
          )}

          {/* Where to find token guide */}
          <div className="pt-2 border-t border-white/[0.06]">
            <button
              onClick={() => setShowGuide(!showGuide)}
              className="w-full flex items-center justify-between text-xs text-slate-400 hover:text-slate-200 transition"
            >
              <span className="flex items-center gap-1.5 font-medium">
                <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                How to copy your session in 20 seconds
              </span>
              <ChevronDown
                className={`w-4 h-4 transform transition-transform ${
                  showGuide ? 'rotate-180' : ''
                }`}
              />
            </button>

            {showGuide && (
              <div className="mt-3 p-4 bg-slate-950/70 border border-white/[0.06] rounded-2xl text-[11px] text-slate-300 space-y-2 leading-relaxed">
                <p>1. Open <a href="https://leetcode.com" target="_blank" rel="noreferrer" className="text-amber-400 underline inline-flex items-center gap-0.5">leetcode.com <ExternalLink className="w-3 h-3 inline" /></a> and ensure you are logged in.</p>
                <p>2. Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 font-mono text-[10px] text-slate-200 border border-white/10">F12</kbd> (or right click &gt; <em>Inspect</em>).</p>
                <p>3. Go to the <strong>Application</strong> tab &gt; <strong>Cookies</strong> &gt; <code className="text-amber-300">https://leetcode.com</code>.</p>
                <p>4. Double-click and copy the value of <code className="text-amber-300 font-mono font-bold">LEETCODE_SESSION</code>.</p>
                <p>5. Paste it in the box above and click <strong>Connect & Save Login</strong>. You will never need to enter it again on this device!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
