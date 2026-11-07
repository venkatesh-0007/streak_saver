import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { getUserProfile, verifyCredentials, submitSolution } from './leetcode.js';
import { PRESET_QUESTIONS } from './presets.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();

// Determine writable data directory (use /tmp on Vercel/serverless environments)
const IS_VERCEL = Boolean(process.env.VERCEL);
const DATA_DIR = IS_VERCEL
  ? path.join('/tmp', 'streak_saver_data')
  : path.join(__dirname, 'data');

try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
} catch (e) {
  console.warn('Could not create DATA_DIR, will use in-memory fallback:', e.message);
}

const CONFIG_FILE = path.join(DATA_DIR, 'config.json');
const HISTORY_FILE = path.join(DATA_DIR, 'history.json');

// In-memory fallback
let memoryConfig = {};
let memoryHistory = [];

// Helper to read config
function getConfig() {
  let fileConfig = {};
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      fileConfig = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
    }
  } catch (e) {
    fileConfig = memoryConfig;
  }
  return {
    username: process.env.LEETCODE_USERNAME || fileConfig.username || memoryConfig.username || '',
    sessionCookie: process.env.LEETCODE_SESSION || fileConfig.sessionCookie || memoryConfig.sessionCookie || '',
    csrfToken: process.env.LEETCODE_CSRFTOKEN || fileConfig.csrfToken || memoryConfig.csrfToken || '',
  };
}

function saveConfig(newConfig) {
  const current = getConfig();
  const updated = {
    username: newConfig.username !== undefined ? newConfig.username : current.username,
    sessionCookie: newConfig.sessionCookie !== undefined ? newConfig.sessionCookie : current.sessionCookie,
    csrfToken: newConfig.csrfToken !== undefined ? newConfig.csrfToken : current.csrfToken,
  };
  memoryConfig = updated;
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(updated, null, 2), 'utf-8');
  } catch (e) {
    console.warn('Could not write to config file, kept in memory:', e.message);
  }
  return updated;
}

function getHistory() {
  try {
    if (fs.existsSync(HISTORY_FILE)) {
      return JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf-8'));
    }
  } catch (e) {
    return memoryHistory;
  }
  return memoryHistory;
}

function addHistoryEntry(entry) {
  const history = getHistory();
  history.unshift(entry);
  if (history.length > 100) history.pop();
  memoryHistory = history;
  try {
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2), 'utf-8');
  } catch (e) {
    // ignore
  }
}

app.use(cors());
app.use(express.json());

// Helper to parse cookies from raw string or object
function parseCookieInput(input) {
  if (!input) return { sessionCookie: '', csrfToken: '' };
  if (typeof input !== 'string') return input;

  let sessionCookie = '';
  let csrfToken = '';

  const sessionMatch = input.match(/LEETCODE_SESSION=([^;\s]+)/i);
  if (sessionMatch) {
    sessionCookie = sessionMatch[1];
  } else if (!input.includes(';') && !input.includes('=')) {
    sessionCookie = input.trim();
  }

  const csrfMatch = input.match(/csrftoken=([^;\s]+)/i);
  if (csrfMatch) {
    csrfToken = csrfMatch[1];
  }

  return { sessionCookie, csrfToken };
}

// API: One-Time Login endpoint
app.post('/api/login', async (req, res) => {
  const { raw, cookieString, sessionCookie: directSession, csrfToken: directCsrf, username: loginUsername, password } = req.body;

  // 1. Direct password login attempt
  if (loginUsername && password) {
    return res.status(400).json({
      ok: false,
      error: 'LeetCode protects password logins with Google reCAPTCHA. Please use the 1-Time Session Login option.',
      needSessionLogin: true,
    });
  }

  // 2. Cookie / Session Token login
  const parsed = parseCookieInput(raw || cookieString || directSession);
  const session = parsed.sessionCookie || directSession;
  const csrf = parsed.csrfToken || directCsrf;

  if (!session) {
    return res.status(400).json({
      ok: false,
      error: 'Please paste your LEETCODE_SESSION token or full cookie string.',
    });
  }

  try {
    const verified = await verifyCredentials(session, csrf);
    if (!verified.valid) {
      return res.status(401).json({
        ok: false,
        error: verified.message || 'Invalid or expired LeetCode session token.',
      });
    }

    const updated = saveConfig({
      username: verified.username,
      sessionCookie: session,
      csrfToken: verified.csrfToken || csrf,
    });

    res.json({
      ok: true,
      username: verified.username,
      avatar: verified.avatar,
      sessionCookie: session,
      csrfToken: verified.csrfToken || csrf,
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// API: Logout
app.post('/api/logout', (req, res) => {
  saveConfig({ username: '', sessionCookie: '', csrfToken: '' });
  res.json({ ok: true });
});
  const config = getConfig();
  // Also check request headers for client-passed credentials
  const headerSession = req.headers['x-leetcode-session'];
  const headerCsrf = req.headers['x-leetcode-csrftoken'];
  const hasCreds = Boolean(
    (config.sessionCookie && config.csrfToken) || (headerSession && headerCsrf)
  );

  res.json({
    username: config.username,
    hasCredentials: hasCreds,
    serverTimeUtc: new Date().toISOString(),
    isVercel: IS_VERCEL,
  });
});

// API: Get preset questions
app.get('/api/presets', (req, res) => {
  res.json(PRESET_QUESTIONS);
});

// API: Get public LeetCode user profile & heatmap
app.get('/api/profile/:username', async (req, res) => {
  const { username } = req.params;
  try {
    const profile = await getUserProfile(username);
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Verify credentials
app.post('/api/verify', async (req, res) => {
  const config = getConfig();
  const sessionCookie =
    req.body.sessionCookie || req.headers['x-leetcode-session'] || config.sessionCookie;
  const csrfToken =
    req.body.csrfToken || req.headers['x-leetcode-csrftoken'] || config.csrfToken;

  if (!sessionCookie || !csrfToken) {
    return res.status(400).json({
      valid: false,
      message: 'LEETCODE_SESSION and csrftoken are required.',
    });
  }

  const result = await verifyCredentials(sessionCookie, csrfToken);
  res.json(result);
});

// API: Save streak by submitting a problem
app.post('/api/save-streak', async (req, res) => {
  try {
    const config = getConfig();
    const sessionCookie =
      req.body.sessionCookie || req.headers['x-leetcode-session'] || config.sessionCookie;
    const csrfToken =
      req.body.csrfToken || req.headers['x-leetcode-csrftoken'] || config.csrfToken;

    if (!sessionCookie || !csrfToken) {
      return res.status(401).json({
        error: 'Missing credentials. Please configure your LEETCODE_SESSION and csrftoken.',
        needCredentials: true,
      });
    }

    // Determine question to submit
    let question = PRESET_QUESTIONS[0]; // Default: Add Two Integers
    if (req.body.slug) {
      const found = PRESET_QUESTIONS.find(p => p.slug === req.body.slug);
      if (found) {
        question = found;
      } else if (req.body.questionId && req.body.code) {
        question = {
          slug: req.body.slug,
          id: req.body.questionId,
          title: req.body.title || req.body.slug,
          code: req.body.code,
          lang: req.body.lang || 'python3',
        };
      }
    }

    const customCode = req.body.code || question.code;
    const customLang = req.body.lang || question.lang;

    console.log(`Submitting solution for "${question.title}" (slug: ${question.slug})...`);

    const result = await submitSolution({
      slug: question.slug,
      questionId: question.id,
      lang: customLang,
      code: customCode,
      sessionCookie,
      csrfToken,
    });

    // Record history
    const historyEntry = {
      id: result.submissionId || Date.now().toString(),
      questionTitle: question.title,
      questionSlug: question.slug,
      success: result.success,
      statusMsg: result.statusMsg,
      runtime: result.runtime,
      memory: result.memory,
      timestamp: new Date().toISOString(),
    };
    addHistoryEntry(historyEntry);

    res.json({
      ok: true,
      result,
      question: {
        title: question.title,
        slug: question.slug,
        frontendId: question.frontendId,
      },
      savedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Error submitting solution:', err);
    res.status(500).json({ error: err.message });
  }
});

// API: Save settings
app.post('/api/settings', (req, res) => {
  const { username, sessionCookie, csrfToken } = req.body;
  const updated = saveConfig({ username, sessionCookie, csrfToken });
  res.json({
    ok: true,
    username: updated.username,
    hasCredentials: Boolean(updated.sessionCookie && updated.csrfToken),
  });
});

// API: Get streak save history
app.get('/api/history', (req, res) => {
  res.json(getHistory());
});

// Serve static frontend build if present (for local/production Node server)
const distPath = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

export default app;

