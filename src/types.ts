export interface QuestionCount {
  difficulty: 'All' | 'Easy' | 'Medium' | 'Hard';
  count: number;
  submissions?: number;
}

export interface UserProfileData {
  username: string;
  profile: {
    realName: string;
    userAvatar: string;
    ranking: number;
    reputation: number;
    aboutMe: string;
    school: string | null;
    countryName: string | null;
  };
  stats: {
    acSubmissionNum: QuestionCount[];
    totalSubmissionNum: QuestionCount[];
    allQuestionsCount: QuestionCount[];
  };
  calendar: {
    streak: number;
    totalActiveDays: number;
    submissionCalendar: Record<string, number>;
    isTodaySolved: boolean;
    submissionsToday: number;
    todayStartUtc: number;
    secondsUntilMidnightUtc: number;
  };
  recentSubmissions: Array<{
    id: string;
    title: string;
    titleSlug: string;
    timestamp: string;
  }>;
  lastFetchedAt: string;
}

export interface PresetQuestion {
  id: string;
  frontendId: string;
  slug: string;
  title: string;
  difficulty: string;
  lang: string;
  code: string;
}

export interface HistoryItem {
  id: string;
  questionTitle: string;
  questionSlug: string;
  success: boolean;
  statusMsg: string;
  runtime?: string;
  memory?: string;
  timestamp: string;
}

export interface AppStatus {
  username: string;
  hasCredentials: boolean;
  serverTimeUtc: string;
}

