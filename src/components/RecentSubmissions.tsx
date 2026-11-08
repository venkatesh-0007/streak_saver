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
    <div className="lc-card p-4 sm:p-6 transition-all space-y-4">
      {/* Header with pill switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.08]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#FFA116]/15 text-[#FFA116] flex items-center justify-center font-bold">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-bold text-white text-base tracking-tight">Recent Activity</h2>
            <p className="text-xs text-[#8A8A8E]">Live submissions and automated streak saves</p>
          </div>
        </div>

        <div className="flex rounded-lg bg-[#282828] p-1 border border-white/[0.06] text-xs font-semibold self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('recent')}
            className={`px-3 py-1 rounded-md transition ${
              activeTab === 'recent'
                ? 'bg-[#FFA116] text-black font-bold shadow'
                : 'text-[#8A8A8E] hover:text-white'
            }`}
          >
            LeetCode Submissions
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1 rounded-md transition flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'bg-[#FFA116] text-black font-bold shadow'
                : 'text-[#8A8A8E] hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Streak Saver Logs</span>
            {history.length > 0 && (
              <span className={`px-1.5 py-0.2 rounded text-[10px] ${
                activeTab === 'history' ? 'bg-black text-[#FFA116]' : 'bg-[#333333] text-white'
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
            <div className="divide-y divide-white/[0.06] max-h-[340px] overflow-y-auto pr-1">
              {profile.recentSubmissions.map((sub) => (
                <div
                  key={sub.id}
                  className="py-3 flex items-center justify-between hover:bg-white/[0.02] px-2.5 rounded-xl transition"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-[#00B8A3] shrink-0" />
                    <div>
                      <a
                        href={`https://leetcode.com/problems/${sub.titleSlug}/`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs sm:text-sm font-semibold text-white hover:text-[#FFA116] transition flex items-center gap-1"
                      >
                        <span>{sub.title}</span>
                        <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
                      </a>
                      <span className="text-[10px] text-[#8A8A8E] font-mono">
                        Submission ID: {sub.id}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-[#8A8A8E] font-mono font-medium">
                    {formatTimeAgo(sub.timestamp)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-[#8A8A8E] text-sm">
              No recent accepted submissions found for this user.
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Streak Saver Tool History */}
      {activeTab === 'history' && (
        <div className="space-y-2">
          {history.length > 0 ? (
            <div className="divide-y divide-white/[0.06] max-h-[340px] overflow-y-auto pr-1">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="py-3 flex items-center justify-between hover:bg-white/[0.02] px-2.5 rounded-xl transition"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`p-1.5 rounded-lg ${
                        item.success ? 'bg-[#00B8A3]/15 text-[#00B8A3]' : 'bg-[#FF375F]/15 text-[#FF375F]'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </span>
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-white">
                        {item.questionTitle}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-[#8A8A8E] font-mono">
                        <span className="text-[#00B8A3] font-bold">{item.statusMsg}</span>
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
                    <span className="text-xs text-white font-mono font-medium">
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <p className="text-[10px] text-[#8A8A8E] font-mono">
                      {new Date(item.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-[#8A8A8E] text-sm">
              No streak saves logged yet. Hit the "Save Streak" button to preserve your streak!
            </div>
          )}
        </div>
      )}
    </div>
  );
};
