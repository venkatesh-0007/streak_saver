import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  Flame,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { Navbar } from './components/Navbar';
import { StreakHero } from './components/StreakHero';
import { SolvedStats } from './components/SolvedStats';
import { HeatmapCalendar } from './components/HeatmapCalendar';
import { RecentSubmissions } from './components/RecentSubmissions';
import { SettingsModal } from './components/SettingsModal';
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
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [viewingQuestion, setViewingQuestion] = useState<PresetQuestion | null>(null);

  // Username input state for initial screen if empty
  const [initUsername, setInitUsername] = useState('');

  // 1. Initial Load: Status & Presets
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

        // If status or localStorage has username, load it
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
    setSubmitProgress('Connecting to LeetCode...');
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
          setIsSettingsOpen(true);
          throw new Error('Please enter your LEETCODE_SESSION and csrftoken in Settings.');
        }
        throw new Error(data.error || 'Submission failed');
      }

      setSubmitProgress('Evaluating code verdict...');

      if (data.result && data.result.success) {
        // Trigger celebratory confetti!
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#f59e0b', '#10b981', '#3b82f6', '#ec4899'],
        });

        setLastResult({
          statusMsg: data.result.statusMsg,
          runtime: data.result.runtime,
          memory: data.result.memory,
          questionTitle: data.question?.title,
        });

        // Refresh profile & history
        if (profile?.username) {
          setTimeout(() => {
            loadUserProfile(profile.username);
            fetch('/api/history')
              .then((r) => r.json())
              .then((h) => setHistory(h))
              .catch(() => {});
          }, 1200);
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

  // 4. Save settings
  const handleSaveSettings = async (newSettings: {
    username: string;
    sessionCookie: string;
    csrfToken: string;
  }) => {
    if (newSettings.username) {
      localStorage.setItem('leetcode_username', newSettings.username);
    }
    if (newSettings.sessionCookie) {
      localStorage.setItem('leetcode_session', newSettings.sessionCookie);
    }
    if (newSettings.csrfToken) {
      localStorage.setItem('leetcode_csrf', newSettings.csrfToken);
    }

    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSettings),
    });
    const updated = await res.json();
    const hasCreds = Boolean(
      updated.hasCredentials || (localStorage.getItem('leetcode_session') && localStorage.getItem('leetcode_csrf'))
    );
    setStatus({
      username: updated.username || newSettings.username,
      hasCredentials: hasCreds,
      serverTimeUtc: new Date().toISOString(),
    });

    if (newSettings.username) {
      loadUserProfile(newSettings.username);
    }
  };

  // 5. Verify credentials
  const handleVerify = async (sessionCookie: string, csrfToken: string) => {
    const res = await fetch('/api/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionCookie, csrfToken }),
    });
    return await res.json();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Navbar */}
      <Navbar
        profile={profile}
        status={status}
        loading={loading}
        onRefresh={() => profile && loadUserProfile(profile.username)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onSwitchUser={(user) => loadUserProfile(user)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Error notification banner */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-800/80 text-rose-200 text-xs sm:text-sm flex items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-rose-400 hover:text-rose-200 font-bold px-2 py-1"
            >
              ✕
            </button>
          </div>
        )}

        {/* First time setup prompt if no user is set */}
        {!profile && !loading && (
          <div className="max-w-md mx-auto my-12 p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-5 shadow-2xl">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-xl shadow-orange-500/20">
              <Flame className="w-9 h-9 fill-white" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-extrabold text-white">Enter Your LeetCode Username</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Connect your profile to view your live stats, streak counter, heatmap, and enable one-tap streak saving.
              </p>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (initUsername.trim()) {
                  loadUserProfile(initUsername.trim());
                }
              }}
              className="space-y-3"
            >
              <input
                type="text"
                placeholder="LeetCode username (e.g. lee215)"
                value={initUsername}
                onChange={(e) => setInitUsername(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <button
                type="submit"
                className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-sm rounded-xl shadow-lg transition flex items-center justify-center gap-2"
              >
                <span>Load LeetCode Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* Dashboard when profile is loaded */}
        {profile && (
          <>
            {/* 1. Primary Hero: Streak status, countdown & SAVE STREAK button */}
            <StreakHero
              profile={profile}
              status={status}
              presets={presets}
              selectedPreset={selectedPreset}
              onSelectPreset={(p) => setSelectedPreset(p)}
              onSaveStreak={handleSaveStreak}
              submitting={submitting}
              submitProgress={submitProgress}
              onOpenSettings={() => setIsSettingsOpen(true)}
              onViewCode={(p) => setViewingQuestion(p)}
              lastResult={lastResult}
            />

            {/* 2. Questions Solved & Acceptance Stats */}
            <SolvedStats profile={profile} />

            {/* 3. LeetCode Heatmap Activity Calendar */}
            <HeatmapCalendar profile={profile} />

            {/* 4. Recent Solutions & Streak Saver Log */}
            <RecentSubmissions profile={profile} history={history} />
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        <p className="flex items-center justify-center gap-1.5">
          <span>LeetCode Streak Saver</span>
          <span>•</span>
          <span>Designed for quick mobile & desktop streak preservation</span>
        </p>
      </footer>

      {/* Modals */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        status={status}
        onSaveSettings={handleSaveSettings}
        onVerify={handleVerify}
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

