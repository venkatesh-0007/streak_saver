import React, { useState } from 'react';
import { History, CheckCircle2, ArrowUpRight, Activity } from 'lucide-react';
import { UserProfileData, HistoryItem } from '../types';

interface RecentSubmissionsProps {
  profile: UserProfileData;
  history: HistoryItem[];
}

export const RecentSubmissions: React.FC<RecentSubmissionsProps> = ({ profile, history }) => {
  const [activeTab, setActiveTab] = useState<'recent' | 'history'>('recent');

  const formatTimeAgo = (timestampSec: number | string) => {
    const ts = typeof timestampSec === 'string' ? parseInt(timestampSec, 10) : timestampSec;
    const now = Math.floor(Date.now() / 1000);
    const diff = now - ts;

    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return new Date(ts * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="bg-slate-900/60 border border-white/[0.08] rounded-2xl p-5 sm:p-6 backdrop-blur-xl shadow-xl">
      {/* Header with Tabs */}
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-3.5 mb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-amber-400" />
          <h3 className="font-semibold text-slate-100 text-sm tracking-tight">Activity Feed</h3>
        </div>

        <div className="flex rounded-xl bg-slate-950/80 p-1 border border-white/[0.06] text-xs font-medium">
          <button
            onClick={() => setActiveTab('recent')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'recent'
                ? 'bg-amber-500 text-slate-950 font-semibold shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            LeetCode Submissions
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'bg-amber-500 text-slate-950 font-semibold shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Streak Logs</span>
            {history.length > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeTab === 'history' ? 'bg-slate-950 text-amber-300' : 'bg-slate-800 text-slate-300'
              }`}>
                {history.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Tab 1: Live LeetCode Recent Submissions */}
      {activeTab === 'recent' && (
        <div className="space-y-2">
          {profile.recentSubmissions && profile.recentSubmissions.length > 0 ? (
            <div className="divide-y divide-white/[0.04] max-h-[340px] overflow-y-auto pr-1">
              {profile.recentSubmissions.map((sub) => (
                <div
                  key={sub.id}
                  className="py-2.5 flex items-center justify-between hover:bg-white/[0.02] px-2 rounded-xl transition"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <a
                        href={`https://leetcode.com/problems/${sub.titleSlug}/`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs sm:text-sm font-medium text-slate-200 hover:text-amber-400 transition flex items-center gap-1"
                      >
                        <span>{sub.title}</span>
                        <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
                      </a>
                      <span className="text-[10px] text-slate-500 font-mono">
                        Submission ID: {sub.id}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">
                    {formatTimeAgo(sub.timestamp)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500 text-sm">
              No recent accepted submissions found for this user.
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Streak Saver Tool History */}
      {activeTab === 'history' && (
        <div className="space-y-2">
          {history.length > 0 ? (
            <div className="divide-y divide-white/[0.04] max-h-[340px] overflow-y-auto pr-1">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="py-2.5 flex items-center justify-between hover:bg-white/[0.02] px-2 rounded-xl transition"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`p-1 rounded-md ${
                        item.success ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </span>
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-slate-200">
                        {item.questionTitle}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                        <span className="text-emerald-400 font-semibold">{item.statusMsg}</span>
                        {item.runtime && (
                          <>
                            <span>•</span>
                            <span>{item.runtime}</span>
                          </>
                        )}
                        {item.memory && (
                          <>
                            <span>•</span>
                            <span>{item.memory}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 font-mono">
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <p className="text-[10px] text-slate-500 font-mono">
                      {new Date(item.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500 text-sm">
              No streak saves logged yet. Hit the "Save Streak" button to preserve your streak!
            </div>
          )}
        </div>
      )}
    </div>
  );
};
