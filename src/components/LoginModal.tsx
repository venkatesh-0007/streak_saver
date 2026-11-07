import React, { useState } from 'react';
import {
  X,
  Lock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  LogOut,
  Sparkles,
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
      'LeetCode protects password logins with Google reCAPTCHA Enterprise. Please use the 1-Time Session Token tab for instant 1-click access.'
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl transition-all">
      <div className="relative w-full max-w-lg expressive-card p-0 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.08] bg-black/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#4affbd]/15 border border-[#4affbd]/30 flex items-center justify-center text-[#4affbd]">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Connect LeetCode
              </h2>
              <p className="text-xs text-slate-400">One-time login to preserve your daily streak</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/[0.08] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Active Account Status Banner if already logged in */}
          {status?.hasCredentials && (
            <div className="p-4 rounded-2xl bg-[#4affbd]/10 border border-[#4affbd]/30 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {profile?.profile.userAvatar ? (
                  <img
                    src={profile.profile.userAvatar}
                    alt={profile.username}
                    className="w-10 h-10 rounded-full ring-2 ring-[#4affbd] object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[#4affbd]/20 flex items-center justify-center text-[#4affbd] font-bold">
                    ✓
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-white">
                      @{status.username || profile?.username || 'Connected'}
                    </span>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#4affbd] text-black">
                      Active
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Ready for 1-tap automated streak saving.
                  </p>
                </div>
              </div>
              <button
                onClick={async () => {
                  await onLogout();
                  setCookieInput('');
                }}
                className="px-3.5 py-1.5 rounded-full bg-white/[0.06] hover:bg-rose-500/20 hover:text-rose-300 text-slate-300 text-xs font-semibold border border-white/[0.1] transition flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Disconnect</span>
              </button>
            </div>
          )}

          {/* Tab Selector */}
          <div className="grid grid-cols-2 p-1 rounded-full bg-black/60 border border-white/[0.08] text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('token')}
              className={`py-2 rounded-full transition ${
                activeTab === 'token'
                  ? 'bg-[#4affbd] text-black font-extrabold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              1-Time Session (Instant)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('credentials')}
              className={`py-2 rounded-full transition ${
                activeTab === 'credentials'
                  ? 'bg-[#4affbd] text-black font-extrabold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Password Login
            </button>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-xs text-rose-200 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Tab 1: 1-Time Session Token */}
          {activeTab === 'token' && (
            <form onSubmit={handleTokenSubmit} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-white">
                    Paste Session Token or Cookie String
                  </label>
                  <span className="text-[11px] text-[#4affbd] font-semibold">
                    Auto-parsed & verified
                  </span>
                </div>
                <textarea
                  rows={3}
                  placeholder="Paste your LEETCODE_SESSION token or entire Cookie string here..."
                  value={cookieInput}
                  onChange={(e) => setCookieInput(e.target.value)}
                  className="w-full bg-black/50 border border-white/[0.1] focus:border-[#4affbd] rounded-2xl p-4 text-xs text-white placeholder-slate-500 font-mono focus:outline-none transition resize-none leading-relaxed"
                />
                <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#4affbd] shrink-0" />
                  <span>Stored securely on your browser. You only need to do this once.</span>
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-6 rounded-full bg-[#4affbd] hover:bg-[#38ef7d] text-black font-extrabold text-xs uppercase tracking-wider mint-glow transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
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
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1">
                  LeetCode Username or Email
                </label>
                <input
                  type="text"
                  placeholder="Username or email"
                  value={userLogin}
                  onChange={(e) => setUserLogin(e.target.value)}
                  className="w-full bg-black/50 border border-white/[0.1] rounded-2xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#4affbd] font-mono"
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
                  className="w-full bg-black/50 border border-white/[0.1] rounded-2xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#4affbd] font-mono"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-black/50 border border-white/[0.08] text-[11px] text-slate-400 leading-relaxed">
                LeetCode requires an interactive reCAPTCHA challenge during password logins. For automated streak saving, the <strong>1-Time Session Token</strong> option is instant and never expires.
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-5 rounded-full bg-white/[0.1] hover:bg-white/[0.16] text-white text-xs font-bold border border-white/[0.15] transition"
              >
                Sign In with Password
              </button>
            </form>
          )}

          {/* How to copy guide */}
          <div className="pt-2 border-t border-white/[0.08]">
            <button
              onClick={() => setShowGuide(!showGuide)}
              className="w-full flex items-center justify-between text-xs text-slate-400 hover:text-white transition"
            >
              <span className="flex items-center gap-2 font-medium">
                <HelpCircle className="w-3.5 h-3.5 text-[#ffe855]" />
                How to copy your session in 20 seconds
              </span>
              <ChevronDown
                className={`w-4 h-4 transform transition-transform ${
                  showGuide ? 'rotate-180' : ''
                }`}
              />
            </button>

            {showGuide && (
              <div className="mt-3 p-4 bg-black/60 border border-white/[0.08] rounded-2xl text-[11px] text-slate-300 space-y-2 leading-relaxed">
                <p>1. Open <a href="https://leetcode.com" target="_blank" rel="noreferrer" className="text-[#4affbd] underline inline-flex items-center gap-0.5">leetcode.com <ExternalLink className="w-3 h-3 inline" /></a> and ensure you are logged in.</p>
                <p>2. Press <kbd className="px-2 py-0.5 rounded-full bg-white/10 font-mono text-[10px] text-white">F12</kbd> (or right click &gt; <em>Inspect</em>).</p>
                <p>3. Go to the <strong>Application</strong> tab &gt; <strong>Cookies</strong> &gt; <code className="text-[#4affbd]">https://leetcode.com</code>.</p>
                <p>4. Double-click and copy the value of <code className="text-[#ffe855] font-mono font-bold">LEETCODE_SESSION</code>.</p>
                <p>5. Paste it in the box above and click <strong>Connect & Save Login</strong>. You will never need to enter it again on this device!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
