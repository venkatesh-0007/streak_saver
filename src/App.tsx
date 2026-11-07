import React, { useState, useEffect, useCallback } from 'react';
import {
  Flame,
  ArrowRight,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { Navbar } from './components/Navbar';
import { StreakHero } from './components/StreakHero';
import { SolvedStats } from './components/SolvedStats';
import { HeatmapCalendar } from './components/HeatmapCalendar';
import { RecentSubmissions } from './components/RecentSubmissions';
import { LoginModal } from './components/LoginModal';
import { QuestionModal } from './components/QuestionModal';
import { UserProfileData, PresetQuestion, AppStatus, HistoryItem } from './types';

export function App() {
  const [status, setStatus] = useState<AppStatus | null>(null);
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [presets, setPresets] = useState<PresetQuestion[]>([]);
  const [selectedPreset, setSelectedPreset] = useState<PresetQuestion | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Streak Save Submission state
  const [submitting, setSubmitting] = useState(false);
  const [submitProgress, setSubmitProgress] = useState('');
  const [lastResult, setLastResult] = useState<{
    statusMsg: string;
    runtime?: string;
    memory?: string;
    questionTitle?: string;
  } | null>(null);

  // Modals
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [viewingQuestion, setViewingQuestion] = useState<PresetQuestion | null>(null);

  // Username input state for initial screen if empty
  const [initUsername, setInitUsername] = useState('');

  // 1. Initial Load
  useEffect(() => {
    const initApp = async () => {
      try {
        const localSession = localStorage.getItem('leetcode_session');
        const localCsrf = localStorage.getItem('leetcode_csrf');

        const [statusRes, presetsRes, historyRes] = await Promise.all([
          fetch('/api/status', {
            headers: {
              ...(localSession ? { 'x-leetcode-session': localSession } : {}),
              ...(localCsrf ? { 'x-leetcode-csrftoken': localCsrf } : {}),
            },
          }).then((r) => r.json()),
          fetch('/api/presets').then((r) => r.json()),
          fetch('/api/history').then((r) => r.json()),
        ]);

        const hasCreds = statusRes.hasCredentials || Boolean(localSession && localCsrf);
        setStatus({ ...statusRes, hasCredentials: hasCreds });

        setPresets(presetsRes);
        if (presetsRes.length > 0) {
          setSelectedPreset(presetsRes[0]);
        }
        setHistory(historyRes);

        const savedUser = statusRes.username || localStorage.getItem('leetcode_username');
        if (savedUser) {
          loadUserProfile(savedUser);
        }
      } catch (err: any) {
        console.error('Failed to initialize app:', err);
      }
    };

    initApp();
  }, []);

  // 2. Load User Profile Data
  const loadUserProfile = useCallback(async (username: string) => {
    if (!username) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/profile/${encodeURIComponent(username)}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch user profile');
      }
      setProfile(data);
      localStorage.setItem('leetcode_username', username);
    } catch (err: any) {
      setError(err.message || 'Error fetching LeetCode profile');
    } finally {
      setLoading(false);
    }
  }, []);

  // 3. Trigger One-Click Streak Save
  const handleSaveStreak = async () => {
    if (!selectedPreset) return;
    setSubmitting(true);
    setSubmitProgress('Connecting to LeetCode API...');
    setError(null);

    try {
      setSubmitProgress(`Submitting "${selectedPreset.title}"...`);

      const localSession = localStorage.getItem('leetcode_session');
      const localCsrf = localStorage.getItem('leetcode_csrf');

      const res = await fetch('/api/save-streak', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(localSession ? { 'x-leetcode-session': localSession } : {}),
          ...(localCsrf ? { 'x-leetcode-csrftoken': localCsrf } : {}),
        },
        body: JSON.stringify({
          slug: selectedPreset.slug,
          questionId: selectedPreset.id,
          code: selectedPreset.code,
          lang: selectedPreset.lang,
          sessionCookie: localSession || undefined,
          csrfToken: localCsrf || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.needCredentials) {
          setIsLoginOpen(true);
          throw new Error('Please login with your LeetCode account to enable automated streak saves.');
        }
        throw new Error(data.error || 'Submission failed');
      }

      setSubmitProgress('Waiting for LeetCode verdict...');

      if (data.result && data.result.success) {
        setLastResult({
          statusMsg: data.result.statusMsg,
          runtime: data.result.runtime,
          memory: data.result.memory,
          questionTitle: data.question?.title,
        });

        // Smoothly refresh profile & history
        if (profile?.username) {
          setTimeout(() => {
            loadUserProfile(profile.username);
            fetch('/api/history')
              .then((r) => r.json())
              .then((h) => setHistory(h))
              .catch(() => {});
          }, 1000);
        }
      } else {
        throw new Error(data.result?.statusMsg || 'LeetCode rejected submission');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save streak');
    } finally {
      setSubmitting(false);
      setSubmitProgress('');
    }
  };

  // 4. One-time Login handler
  const handleLogin = async (cookieInput: string) => {
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cookieString: cookieInput }),
      });
      const data = await res.json();

      if (data.ok && data.sessionCookie) {
        localStorage.setItem('leetcode_session', data.sessionCookie);
        if (data.csrfToken) {
          localStorage.setItem('leetcode_csrf', data.csrfToken);
        }
        if (data.username) {
          localStorage.setItem('leetcode_username', data.username);
          loadUserProfile(data.username);
        }
        setStatus({
          username: data.username,
          hasCredentials: true,
          serverTimeUtc: new Date().toISOString(),
        });
        return { ok: true, username: data.username };
      }

      return { ok: false, error: data.error || 'Authentication failed' };
    } catch (err: any) {
      return { ok: false, error: err.message };
    }
  };

  // 5. Logout handler
  const handleLogout = async () => {
    localStorage.removeItem('leetcode_session');
    localStorage.removeItem('leetcode_csrf');
    await fetch('/api/logout', { method: 'POST' }).catch(() => {});
    setStatus((prev) => (prev ? { ...prev, hasCredentials: false } : null));
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-['Google_Sans_Flex','Plus_Jakarta_Sans',system-ui,sans-serif] selection:bg-[#4affbd] selection:text-black">
      {/* Top Floating Navbar Island */}
      <Navbar
        profile={profile}
        status={status}
        loading={loading}
        onRefresh={() => profile && loadUserProfile(profile.username)}
        onOpenLogin={() => setIsLoginOpen(true)}
        onSwitchUser={(user) => loadUserProfile(user)}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-7">
        {/* Error notification banner */}
        {error && (
          <div className="p-4 rounded-3xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs sm:text-sm flex items-center justify-between gap-3 animate-in fade-in backdrop-blur-xl">
            <div className="flex items-center gap-2.5">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-rose-400 hover:text-white font-semibold px-2 py-1 text-xs"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* First time setup prompt if no user is set */}
        {!profile && !loading && (
          <div className="max-w-md mx-auto my-14 p-9 rounded-[32px] expressive-card text-center space-y-6 shadow-2xl">
            <div className="w-16 h-16 mx-auto rounded-[24px] bg-[#4affbd] flex items-center justify-center text-black shadow-xl shadow-[#4affbd]/25 transition-transform duration-300 hover:scale-105">
              <Flame className="w-9 h-9 fill-black text-black" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold text-white tracking-tight">Enter LeetCode Username</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Connect your account to view live solved stats, global ranking, interactive activity calendar, and enable 1-tap automated streak preservation.
              </p>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (initUsername.trim()) {
                  loadUserProfile(initUsername.trim());
                }
              }}
              className="space-y-3.5"
            >
              <input
                type="text"
                placeholder="LeetCode username (e.g. lee215)"
                value={initUsername}
                onChange={(e) => setInitUsername(e.target.value)}
                className="w-full bg-black/50 border border-white/[0.1] focus:border-[#4affbd] rounded-full px-5 py-3.5 text-sm text-white placeholder-slate-500 focus:outline-none transition font-mono"
              />
              <button
                type="submit"
                className="w-full py-4 px-6 bg-[#4affbd] hover:bg-[#38ef7d] text-black font-extrabold text-xs uppercase tracking-wider rounded-full shadow-lg shadow-[#4affbd]/20 transition flex items-center justify-center gap-2 mint-glow"
              >
                <span>Load Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* Dashboard when profile is loaded */}
        {profile && (
          <>
            {/* 1. Primary Hero */}
            <StreakHero
              profile={profile}
              status={status}
              presets={presets}
              selectedPreset={selectedPreset}
              onSelectPreset={(p) => setSelectedPreset(p)}
              onSaveStreak={handleSaveStreak}
              submitting={submitting}
              submitProgress={submitProgress}
              onOpenLogin={() => setIsLoginOpen(true)}
              onViewCode={(p) => setViewingQuestion(p)}
              lastResult={lastResult}
            />

            {/* 2. Questions Solved & Stats */}
            <SolvedStats profile={profile} />

            {/* 3. Heatmap Activity Calendar */}
            <HeatmapCalendar profile={profile} />

            {/* 4. Recent Solutions & History Log */}
            <RecentSubmissions profile={profile} history={history} />
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-white/[0.04] py-8 text-center text-xs text-slate-500">
        <p className="flex items-center justify-center gap-2">
          <span>LeetStreak</span>
          <span>•</span>
          <span className="text-[#4affbd] font-semibold">Material Expressive Aesthetics</span>
        </p>
      </footer>

      {/* Login & Code Preview Modals */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        status={status}
        profile={profile}
        onLogin={handleLogin}
        onLogout={handleLogout}
      />

      <QuestionModal
        isOpen={Boolean(viewingQuestion)}
        question={viewingQuestion}
        onClose={() => setViewingQuestion(null)}
      />
    </div>
  );
}

export default App;
