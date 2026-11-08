import React, { useState } from 'react';
import {
  X,
  Lock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  LogOut,
  ExternalLink,
  ChevronDown,
  ShieldCheck,
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
      'LeetCode protects direct password logins with Google reCAPTCHA Enterprise. Please use the 1-Time Session Token tab for instant 1-click access.'
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md transition-all">
      <div className="relative w-full max-w-lg lc-card p-0 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-white/[0.08] bg-[#1a1a1a]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#FFA116]/15 border border-[#FFA116]/30 flex items-center justify-center text-[#FFA116]">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Connect LeetCode Account
              </h2>
              <p className="text-xs text-[#8A8A8E]">One-time setup to preserve your daily streak</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8A8A8E] hover:text-white hover:bg-white/[0.08] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
          {/* Active Account Status Banner if already logged in */}
          {status?.hasCredentials && (
            <div className="p-3.5 rounded-xl bg-[#00B8A3]/10 border border-[#00B8A3]/30 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {profile?.profile.userAvatar ? (
                  <img
                    src={profile.profile.userAvatar}
                    alt={profile.username}
                    className="w-10 h-10 rounded-full ring-2 ring-[#00B8A3] object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[#00B8A3]/20 flex items-center justify-center text-[#00B8A3] font-bold">
                    ✓
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-white">
                      @{status.username || profile?.username || 'Connected'}
                    </span>
                    <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-[#00B8A3] text-black">
                      Active
                    </span>
                  </div>
                  <p className="text-xs text-[#8A8A8E] mt-0.5">
                    Ready for 1-tap automated streak saving.
                  </p>
                  <p className="text-[11px] text-[#00B8A3] mt-1 font-medium">
                    ✓ Permanently saved across page refreshes. No need to connect again!
                  </p>
                </div>
              </div>
              <button
                onClick={async () => {
                  await onLogout();
                  setCookieInput('');
                }}
                className="px-3 py-1.5 rounded-lg bg-[#282828] hover:bg-rose-500/20 hover:text-rose-300 text-[#8A8A8E] text-xs font-semibold border border-white/[0.1] transition flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Disconnect</span>
              </button>
            </div>
          )}

          {/* Tab Selector */}
          <div className="grid grid-cols-2 p-1 rounded-lg bg-[#282828] border border-white/[0.08] text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('token')}
              className={`py-2 rounded-md transition ${
                activeTab === 'token'
                  ? 'bg-[#FFA116] text-black font-extrabold shadow'
                  : 'text-[#8A8A8E] hover:text-white'
              }`}
            >
              1-Time Session (Recommended)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('credentials')}
              className={`py-2 rounded-md transition ${
                activeTab === 'credentials'
                  ? 'bg-[#FFA116] text-black font-extrabold shadow'
                  : 'text-[#8A8A8E] hover:text-white'
              }`}
            >
              Password Login
            </button>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-xs text-rose-200 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Tab 1: 1-Time Session Token */}
          {activeTab === 'token' && (
            <form onSubmit={handleTokenSubmit} className="space-y-3.5">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-white">
                    Paste LEETCODE_SESSION or Cookie String
                  </label>
                  <span className="text-[11px] text-[#FFA116] font-semibold">
                    Auto-parsed
                  </span>
                </div>
                <textarea
                  rows={3}
                  placeholder="Paste your LEETCODE_SESSION token or entire Cookie string here..."
                  value={cookieInput}
                  onChange={(e) => setCookieInput(e.target.value)}
                  className="w-full bg-[#282828] border border-white/[0.1] focus:border-[#FFA116] rounded-xl p-3 text-xs text-white placeholder-slate-500 font-mono focus:outline-none transition resize-none leading-relaxed"
                />
                <p className="text-[11px] text-[#8A8A8E] mt-1.5 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#00B8A3] shrink-0" />
                  <span>Stored securely on your browser. You only need to do this once.</span>
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 rounded-xl bg-[#FFA116] hover:bg-[#ffb43a] text-black font-extrabold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>Verifying with LeetCode...</span>
                  </>
                ) : (
                  <span>Connect & Save Login</span>
                )}
              </button>
            </form>
          )}

          {/* Tab 2: Password Form */}
          {activeTab === 'credentials' && (
            <form onSubmit={handlePasswordSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1">
                  LeetCode Username or Email
                </label>
                <input
                  type="text"
                  placeholder="Username or email"
                  value={userLogin}
                  onChange={(e) => setUserLogin(e.target.value)}
                  className="w-full bg-[#282828] border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#FFA116] font-mono"
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
                  className="w-full bg-[#282828] border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#FFA116] font-mono"
                />
              </div>

              <div className="p-3 rounded-xl bg-[#282828] border border-white/[0.08] text-[11px] text-[#8A8A8E] leading-relaxed">
                LeetCode requires an interactive reCAPTCHA challenge during password logins. For automated streak saving, the <strong>1-Time Session Token</strong> option is instant and permanent.
              </div>

              <button
                type="submit"
                className="w-full py-3 px-5 rounded-xl bg-[#333333] hover:bg-[#3d3d3d] text-white text-xs font-bold transition"
              >
                Sign In with Password
              </button>
            </form>
          )}

          {/* Guide */}
          <div className="pt-2 border-t border-white/[0.08]">
            <button
              onClick={() => setShowGuide(!showGuide)}
              className="w-full flex items-center justify-between text-xs text-[#8A8A8E] hover:text-white transition"
            >
              <span className="flex items-center gap-1.5 font-medium">
                <HelpCircle className="w-3.5 h-3.5 text-[#FFA116]" />
                How to copy your session in 20 seconds
              </span>
              <ChevronDown
                className={`w-4 h-4 transform transition-transform ${
                  showGuide ? 'rotate-180' : ''
                }`}
              />
            </button>

            {showGuide && (
              <div className="mt-2.5 p-3.5 bg-[#282828] border border-white/[0.08] rounded-xl text-[11px] text-slate-300 space-y-1.5 leading-relaxed">
                <p>1. Open <a href="https://leetcode.com" target="_blank" rel="noreferrer" className="text-[#FFA116] underline inline-flex items-center gap-0.5">leetcode.com <ExternalLink className="w-3 h-3 inline" /></a> and ensure you are logged in.</p>
                <p>2. Press <kbd className="px-1.5 py-0.5 rounded bg-black/50 font-mono text-[10px] text-white">F12</kbd> (or right click &gt; <em>Inspect</em>).</p>
                <p>3. Go to the <strong>Application</strong> tab &gt; <strong>Cookies</strong> &gt; <code className="text-[#FFA116]">https://leetcode.com</code>.</p>
                <p>4. Double-click and copy the value of <code className="text-[#FFA116] font-mono font-bold">LEETCODE_SESSION</code>.</p>
                <p>5. Paste it in the box above and click <strong>Connect & Save Login</strong>. You will never need to enter it again on this device!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
