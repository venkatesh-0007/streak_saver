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
    <div className="expressive-card p-6 sm:p-7 shadow-xl">
      {/* Header with pill switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-4 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#4affbd]/15 text-[#4affbd] flex items-center justify-center font-bold">
            <Activity className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-white text-base tracking-tight">Recent Activity</h3>
        </div>

        <div className="flex rounded-full bg-black/50 p-1 border border-white/[0.08] text-xs font-semibold self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('recent')}
            className={`px-4 py-1.5 rounded-full transition ${
              activeTab === 'recent'
                ? 'bg-[#4affbd] text-black font-extrabold shadow'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            LeetCode Submissions
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-1.5 rounded-full transition flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'bg-[#4affbd] text-black font-extrabold shadow'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Streak Logs</span>
            {history.length > 0 && (
              <span className={`px-2 py-0.2 rounded-full text-[10px] ${
                activeTab === 'history' ? 'bg-black text-[#4affbd]' : 'bg-white/10 text-white'
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
                  className="py-3 flex items-center justify-between hover:bg-white/[0.03] px-3 rounded-2xl transition"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-[#4affbd] shrink-0" />
                    <div>
                      <a
                        href={`https://leetcode.com/problems/${sub.titleSlug}/`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs sm:text-sm font-semibold text-white hover:text-[#4affbd] transition flex items-center gap-1"
                      >
                        <span>{sub.title}</span>
                        <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
                      </a>
                      <span className="text-[10px] text-slate-500 font-mono">
                        ID: {sub.id}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-slate-400 font-mono font-medium">
                    {formatTimeAgo(sub.timestamp)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400 text-sm">
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
                  className="py-3 flex items-center justify-between hover:bg-white/[0.03] px-3 rounded-2xl transition"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`p-1.5 rounded-xl ${
                        item.success ? 'bg-[#4affbd]/15 text-[#4affbd]' : 'bg-[#ff64f9]/15 text-[#ff64f9]'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </span>
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-white">
                        {item.questionTitle}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                        <span className="text-[#4affbd] font-bold">{item.statusMsg}</span>
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
                    <span className="text-xs text-slate-300 font-mono font-medium">
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
            <div className="text-center py-8 text-slate-400 text-sm">
              No streak saves logged yet. Hit the "Save Streak" button to preserve your streak!
            </div>
          )}
        </div>
      )}
    </div>
  );
};
