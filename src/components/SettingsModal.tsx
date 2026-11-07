import React, { useState } from 'react';
import {
  X,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Copy,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { AppStatus } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: AppStatus | null;
  onSaveSettings: (settings: {
    username: string;
    sessionCookie: string;
    csrfToken: string;
  }) => Promise<void>;
  onVerify: (sessionCookie: string, csrfToken: string) => Promise<{
    valid: boolean;
    username?: string;
    message?: string;
  }>;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  status,
  onSaveSettings,
  onVerify,
}) => {
  const [username, setUsername] = useState(
    status?.username || localStorage.getItem('leetcode_username') || ''
  );
  const [sessionCookie, setSessionCookie] = useState(
    localStorage.getItem('leetcode_session') || ''
  );
  const [csrfToken, setCsrfToken] = useState(
    localStorage.getItem('leetcode_csrf') || ''
  );
  const [saving, setSaving] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<{
    valid?: boolean;
    username?: string;
    message?: string;
  } | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);

  if (!isOpen) return null;

  const handleTestVerify = async () => {
    setVerifying(true);
    setVerifyResult(null);
    try {
      const res = await onVerify(sessionCookie, csrfToken);
      setVerifyResult(res);
      if (res.valid && res.username && !username) {
        setUsername(res.username);
      }
    } catch (err: any) {
      setVerifyResult({ valid: false, message: err.message || 'Verification failed' });
    } finally {
      setVerifying(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSaveSettings({ username, sessionCookie, csrfToken });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">LeetCode Credentials</h2>
              <p className="text-xs text-slate-400">Required to submit questions and save streak</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Current status alert */}
          <div
            className={`p-3.5 rounded-xl border flex items-center gap-3 text-xs ${
              status?.hasCredentials
                ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-300'
                : 'bg-amber-950/30 border-amber-800/60 text-amber-300'
            }`}
          >
            {status?.hasCredentials ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <span className="font-semibold">Credentials are saved on server.</span>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    You can one-click submit questions anytime. Enter new cookies below only if your session expired.
                  </p>
                </div>
              </>
            ) : (
              <>
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                <div>
                  <span className="font-semibold">No credentials configured yet.</span>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    LeetCode requires your browser session cookies to accept automated submissions on your behalf.
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                LeetCode Username
              </label>
              <input
                type="text"
                placeholder="e.g. tourist or lee215"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-300">
                  LEETCODE_SESSION cookie
                </label>
                <span className="text-[11px] text-slate-500">From leetcode.com</span>
              </div>
              <input
                type="password"
                placeholder={status?.hasCredentials ? '••••••••••••••••••••••••••••••••' : 'eyJ0eXAiOiJKV1QiLCJhbGci...'}
                value={sessionCookie}
                onChange={(e) => setSessionCookie(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-300">
                  csrftoken cookie
                </label>
                <span className="text-[11px] text-slate-500">From leetcode.com</span>
              </div>
              <input
                type="password"
                placeholder={status?.hasCredentials ? '••••••••••••••••••••••••••••••••' : 'AbCdEf123456...'}
                value={csrfToken}
                onChange={(e) => setCsrfToken(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
              />
            </div>

            {/* Test verify button */}
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={handleTestVerify}
                disabled={verifying || (!sessionCookie && !status?.hasCredentials)}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition flex items-center gap-1.5 disabled:opacity-50"
              >
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                {verifying ? 'Testing...' : 'Verify Session'}
              </button>

              {verifyResult && (
                <span
                  className={`text-xs font-medium ${
                    verifyResult.valid ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {verifyResult.valid
                    ? `✓ Active session: @${verifyResult.username}`
                    : `✗ ${verifyResult.message || 'Invalid session'}`}
                </span>
              )}
            </div>

            {/* Action buttons */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition"
              >
                {saving ? 'Saving...' : 'Save Credentials'}
              </button>
            </div>
          </form>

          {/* Quick Step-by-Step Instructions Collapsible */}
          <div className="pt-2 border-t border-slate-800/80">
            <button
              onClick={() => setShowInstructions(!showInstructions)}
              className="w-full flex items-center justify-between text-xs text-slate-400 hover:text-amber-400 transition"
            >
              <span className="flex items-center gap-1.5 font-medium">
                <HelpCircle className="w-3.5 h-3.5" />
                How to get your cookies in 30 seconds
              </span>
              <ChevronRight
                className={`w-4 h-4 transform transition-transform ${
                  showInstructions ? 'rotate-90' : ''
                }`}
              />
            </button>

            {showInstructions && (
              <div className="mt-3 p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl text-[11px] text-slate-300 space-y-2">
                <p>1. Open <a href="https://leetcode.com" target="_blank" rel="noreferrer" className="text-amber-400 underline">leetcode.com</a> in your browser and ensure you are logged in.</p>
                <p>2. Open Developer Tools (press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 font-mono text-[10px]">F12</kbd> or right-click &gt; <em>Inspect</em>).</p>
                <p>3. Go to the <strong>Application</strong> tab (in Chrome/Brave/Edge) or <strong>Storage</strong> tab (in Firefox).</p>
                <p>4. Under <strong>Storage</strong> &gt; <strong>Cookies</strong>, click on <code className="text-amber-300">https://leetcode.com</code>.</p>
                <p>5. Find and copy the value for:
                  <br />• <code className="text-amber-300 font-mono font-bold">LEETCODE_SESSION</code>
                  <br />• <code className="text-amber-300 font-mono font-bold">csrftoken</code>
                </p>
                <p>6. Paste them above and click <strong>Save Credentials</strong>. Once saved, your laptop or mobile phone can submit with 1 click anytime!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

