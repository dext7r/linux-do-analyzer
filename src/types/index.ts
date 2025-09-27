export interface UserArchivePost {
  topic_title: string;
  categories: string;
  is_pm: string;
  post_raw: string;
  post_cooked: string;
  like_count: number;
  reply_count: number;
  url: string;
  created_at: string;
}

export interface Visit {
  visited_at: string;
  posts_read: number;
  mobile: boolean;
  time_read: number;
}

export interface Like {
  id: number;
  post_id: number;
  topic_id: number;
  post_number: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  deleted_by?: string;
}

export interface Badge {
  badge_id: number;
  badge_name: string;
  granted_at: string;
  post_id?: number;
  seq: number;
  granted_manually: boolean;
  notification_id?: number;
  featured_rank?: number;
}

export interface AuthToken {
  id: number;
  client_ip: string;
  location: string;
  browser: string;
  device: string;
  os: string;
  icon: string;
  created_at: string;
  seen_at: string;
}

export interface UserData {
  id: number;
  username: string;
  name: string;
  trust_level: number;
  created_at: string;
  time_read: number;
  recent_time_read: number;
  badge_count: number;
  profile_view_count: number;
  gamification_score: number;
  total_followers: number;
  total_following: number;
  accepted_answers: number;
}

export interface AnalysisData {
  userArchive: UserArchivePost[];
  visits: Visit[];
  likes: Like[];
  badges: Badge[];
  authTokens: AuthToken[];
  userData: UserData;
  preferences: any;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
    fill?: boolean;
  }[];
}

export interface AnalysisResult {
  activityAnalysis: {
    dailyVisits: ChartData;
    readingTime: ChartData;
    postsTimeline: ChartData;
  };
  interactionAnalysis: {
    likesGiven: ChartData;
    likesReceived: ChartData;
    topicParticipation: ChartData;
  };
  achievementAnalysis: {
    badgesEarned: ChartData;
    trustLevelProgress: ChartData;
    communityContribution: ChartData;
  };
  deviceAnalysis: {
    deviceDistribution: ChartData;
    locationDistribution: ChartData;
    browserDistribution: ChartData;
  };
  summary: {
    totalPosts: number;
    totalLikes: number;
    totalBadges: number;
    joinDate: string;
    trustLevel: number;
    readingHours: number;
    activeVisitDays: number;
  };
}