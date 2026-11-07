const LEETCODE_BASE = 'https://leetcode.com';
const GRAPHQL_URL = `${LEETCODE_BASE}/graphql`;

const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Referer': LEETCODE_BASE,
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
};

/**
 * Fetch full public profile stats and submission calendar for a user
 */
export async function getUserProfile(username) {
  const query = `
    query getUserData($username: String!) {
      matchedUser(username: $username) {
        username
        profile {
          realName
          userAvatar
          ranking
          reputation
          aboutMe
          school
          countryName
        }
        submitStats {
          acSubmissionNum {
            difficulty
            count
            submissions
          }
          totalSubmissionNum {
            difficulty
            count
            submissions
          }
        }
        submissionCalendar
        userCalendar {
          activeYears
          streak
          totalActiveDays
          submissionCalendar
        }
      }
      allQuestionsCount {
        difficulty
        count
      }
      recentAcSubmissionList(username: $username, limit: 12) {
        id
        title
        titleSlug
        timestamp
      }
    }
  `;

  const response = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: DEFAULT_HEADERS,
    body: JSON.stringify({ query, variables: { username } }),
  });

  if (!response.ok) {
    throw new Error(`LeetCode API returned status ${response.status}`);
  }

  const result = await response.json();

  if (result.errors && (!result.data || !result.data.matchedUser)) {
    throw new Error(result.errors[0]?.message || 'User not found on LeetCode');
  }

  const user = result.data.matchedUser;
  if (!user) {
    throw new Error(`LeetCode user "${username}" was not found.`);
  }

  // Parse submission calendar JSON string
  let calendarObj = {};
  try {
    const rawCalendar =
      user.userCalendar?.submissionCalendar || user.submissionCalendar || '{}';
    calendarObj = typeof rawCalendar === 'string' ? JSON.parse(rawCalendar) : rawCalendar;
  } catch (err) {
    console.error('Failed to parse submission calendar:', err);
  }

  // Calculate UTC day start timestamps
  const now = new Date();
  const utcNow = now.getTime();
  const utcYear = now.getUTCFullYear();
  const utcMonth = now.getUTCMonth();
  const utcDate = now.getUTCDate();

  const todayStartUtc = Date.UTC(utcYear, utcMonth, utcDate) / 1000;
  const tomorrowStartUtc = Date.UTC(utcYear, utcMonth, utcDate + 1) / 1000;
  const secondsUntilMidnightUtc = Math.max(0, Math.floor(tomorrowStartUtc - utcNow / 1000));

  // Check if user has submitted today (or in recent submissions within today)
  const submissionsToday = calendarObj[String(todayStartUtc)] || 0;
  
  // Also check recentAcSubmissionList timestamps
  const recentAc = result.data.recentAcSubmissionList || [];
  const hasRecentToday = recentAc.some(sub => {
    const ts = parseInt(sub.timestamp, 10);
    return ts >= todayStartUtc && ts < tomorrowStartUtc;
  });

  const isTodaySolved = submissionsToday > 0 || hasRecentToday;

  return {
    username: user.username,
    profile: user.profile,
    stats: {
      acSubmissionNum: user.submitStats?.acSubmissionNum || [],
      totalSubmissionNum: user.submitStats?.totalSubmissionNum || [],
      allQuestionsCount: result.data.allQuestionsCount || [],
    },
    calendar: {
      streak: user.userCalendar?.streak ?? 0,
      totalActiveDays: user.userCalendar?.totalActiveDays ?? 0,
      submissionCalendar: calendarObj,
      isTodaySolved,
      submissionsToday: Math.max(submissionsToday, hasRecentToday ? 1 : 0),
      todayStartUtc,
      secondsUntilMidnightUtc,
    },
    recentSubmissions: recentAc,
    lastFetchedAt: new Date().toISOString(),
  };
}

/**
 * Fetch a fresh CSRF token from LeetCode
 */
export async function fetchFreshCsrfToken() {
  try {
    const res = await fetch(`${LEETCODE_BASE}/accounts/login/`, {
      headers: {
        'User-Agent': DEFAULT_HEADERS['User-Agent'],
      },
    });
    const setCookie = res.headers.get('set-cookie') || '';
    const match = setCookie.match(/csrftoken=([^;]+)/);
    return match ? match[1] : '';
  } catch (err) {
    console.error('Failed to auto-fetch CSRF token:', err.message);
    return '';
  }
}

/**
 * Verify session cookie and csrf token by querying userStatus
 */
export async function verifyCredentials(sessionCookie, csrfToken) {
  if (!sessionCookie) {
    return { valid: false, message: 'Missing LEETCODE_SESSION token' };
  }

  // If CSRF token is not provided, automatically fetch a fresh one
  let activeCsrf = csrfToken;
  if (!activeCsrf) {
    activeCsrf = await fetchFreshCsrfToken();
  }

  const query = `
    query userStatus {
      userStatus {
        isSignedIn
        username
        avatar
      }
    }
  `;

  try {
    const response = await fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: {
        ...DEFAULT_HEADERS,
        'Cookie': `LEETCODE_SESSION=${sessionCookie}; csrftoken=${activeCsrf};`,
        'x-csrftoken': activeCsrf,
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      return { valid: false, message: `LeetCode returned HTTP ${response.status}` };
    }

    const data = await response.json();
    const status = data?.data?.userStatus;

    if (status && status.isSignedIn) {
      return {
        valid: true,
        username: status.username,
        avatar: status.avatar,
        csrfToken: activeCsrf,
      };
    }

    return {
      valid: false,
      message: 'Session is invalid or expired. Please provide a fresh LEETCODE_SESSION.',
    };
  } catch (error) {
    return { valid: false, message: error.message };
  }
}

/**
 * Submit solution to LeetCode and poll until verdict
 */
export async function submitSolution({
  slug,
  questionId,
  lang = 'python3',
  code,
  sessionCookie,
  csrfToken,
}) {
  if (!sessionCookie) {
    throw new Error('LEETCODE_SESSION is required to submit code.');
  }

  let activeCsrf = csrfToken;
  if (!activeCsrf) {
    activeCsrf = await fetchFreshCsrfToken();
  }

  const submitUrl = `${LEETCODE_BASE}/problems/${slug}/submit/`;

  const headers = {
    'Content-Type': 'application/json',
    'Origin': LEETCODE_BASE,
    'Referer': `${LEETCODE_BASE}/problems/${slug}/`,
    'x-csrftoken': activeCsrf,
    'Cookie': `LEETCODE_SESSION=${sessionCookie}; csrftoken=${activeCsrf};`,
    'User-Agent':
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
  };

  const payload = {
    lang,
    question_id: String(questionId),
    typed_code: code,
  };

  const res = await fetch(submitUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Submission request failed (HTTP ${res.status}): ${errorText.slice(0, 200)}`);
  }

  const submitData = await res.json();
  const submissionId = submitData.submission_id;

  if (!submissionId) {
    throw new Error(
      submitData.error || submitData.detail || 'LeetCode did not return a submission ID'
    );
  }

  // Poll for submission check
  const checkUrl = `${LEETCODE_BASE}/submissions/detail/${submissionId}/check/`;
  const maxAttempts = 20;
  const pollIntervalMs = 1200;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    await new Promise(r => setTimeout(r, pollIntervalMs));

    const checkRes = await fetch(checkUrl, {
      method: 'GET',
      headers: {
        'x-requested-with': 'XMLHttpRequest',
        'Cookie': `LEETCODE_SESSION=${sessionCookie}; csrftoken=${csrfToken};`,
        'User-Agent': headers['User-Agent'],
      },
    });

    if (!checkRes.ok) continue;

    const checkData = await checkRes.json();

    if (checkData.state === 'SUCCESS') {
      const isAccepted = checkData.status_msg === 'Accepted' || checkData.status_code === 10;
      return {
        success: isAccepted,
        submissionId,
        statusMsg: checkData.status_msg || (isAccepted ? 'Accepted' : 'Failed'),
        statusCode: checkData.status_code,
        runtime: checkData.status_runtime || checkData.runtime_percentile ? `${checkData.status_runtime || '0 ms'}` : 'N/A',
        memory: checkData.status_memory || 'N/A',
        totalCorrect: checkData.total_correct,
        totalTestcases: checkData.total_testcases,
        compareResult: checkData.compare_result,
        submissionTime: new Date().toISOString(),
      };
    }

    if (checkData.state === 'FAILURE') {
      return {
        success: false,
        submissionId,
        statusMsg: checkData.status_msg || 'Evaluation Failed',
        runtimeError: checkData.runtime_error || checkData.compile_error,
        submissionTime: new Date().toISOString(),
      };
    }
  }

  return {
    success: false,
    submissionId,
    statusMsg: 'Evaluation timed out waiting for LeetCode judgment',
    submissionTime: new Date().toISOString(),
  };
}

