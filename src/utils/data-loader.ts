import { parse } from "@std/csv";
import type {
  UserArchivePost,
  Visit,
  Like,
  Badge,
  AuthToken,
  UserData,
  AnalysisData
} from "../types/index.ts";

export class DataLoader {
  private basePath: string;

  constructor(basePath: string = "./") {
    this.basePath = basePath;
  }

  async loadUserArchive(): Promise<UserArchivePost[]> {
    const content = await Deno.readTextFile(`${this.basePath}/user_archive.csv`);
    const parsed = parse(content, { skipFirstRow: true });

    return parsed.map(row => ({
      topic_title: row[0] || "",
      categories: row[1] || "",
      is_pm: row[2] || "",
      post_raw: row[3] || "",
      post_cooked: row[4] || "",
      like_count: parseInt(row[5]) || 0,
      reply_count: parseInt(row[6]) || 0,
      url: row[7] || "",
      created_at: row[8] || ""
    }));
  }

  async loadVisits(): Promise<Visit[]> {
    const content = await Deno.readTextFile(`${this.basePath}/visits.csv`);
    const parsed = parse(content, { skipFirstRow: true });

    return parsed.map(row => ({
      visited_at: row[0],
      posts_read: parseInt(row[1]) || 0,
      mobile: row[2] === "true",
      time_read: parseInt(row[3]) || 0
    }));
  }

  async loadLikes(): Promise<Like[]> {
    const content = await Deno.readTextFile(`${this.basePath}/likes.csv`);
    const parsed = parse(content, { skipFirstRow: true });

    return parsed.map(row => ({
      id: parseInt(row[0]) || 0,
      post_id: parseInt(row[1]) || 0,
      topic_id: parseInt(row[2]) || 0,
      post_number: parseInt(row[3]) || 0,
      created_at: row[4],
      updated_at: row[5],
      deleted_at: row[6] || undefined,
      deleted_by: row[7] || undefined
    }));
  }

  async loadBadges(): Promise<Badge[]> {
    const content = await Deno.readTextFile(`${this.basePath}/badges.csv`);
    const parsed = parse(content, { skipFirstRow: true });

    return parsed.map(row => ({
      badge_id: parseInt(row[0]) || 0,
      badge_name: row[1] || "",
      granted_at: row[2] || "",
      post_id: row[3] ? parseInt(row[3]) : undefined,
      seq: parseInt(row[4]) || 0,
      granted_manually: row[5] === "true",
      notification_id: row[6] ? parseInt(row[6]) : undefined,
      featured_rank: row[7] ? parseInt(row[7]) : undefined
    }));
  }

  async loadAuthTokens(): Promise<AuthToken[]> {
    try {
      const content = await Deno.readTextFile(`${this.basePath}/auth_tokens.csv`);
      const parsed = parse(content, { skipFirstRow: true });

      return parsed.map(row => ({
        id: parseInt(row[0]) || 0,
        client_ip: row[1] || "",
        location: row[2] || "",
        browser: row[3] || "",
        device: row[4] || "",
        os: row[5] || "",
        icon: row[6] || "",
        created_at: row[7] || "",
        seen_at: row[8] || ""
      }));
    } catch {
      return [];
    }
  }

  async loadPreferences(): Promise<any> {
    try {
      const content = await Deno.readTextFile(`${this.basePath}/preferences.json`);
      return JSON.parse(content);
    } catch {
      return {};
    }
  }

  async loadAllData(): Promise<AnalysisData> {
    const [userArchive, visits, likes, badges, authTokens, preferences] = await Promise.all([
      this.loadUserArchive(),
      this.loadVisits(),
      this.loadLikes(),
      this.loadBadges(),
      this.loadAuthTokens(),
      this.loadPreferences()
    ]);

    const userData: UserData = {
      id: preferences.user?.id || 0,
      username: preferences.user?.username || "",
      name: preferences.user?.name || "",
      trust_level: preferences.user?.trust_level || 0,
      created_at: preferences.user?.created_at || "",
      time_read: preferences.user?.time_read || 0,
      recent_time_read: preferences.user?.recent_time_read || 0,
      badge_count: preferences.user?.badge_count || 0,
      profile_view_count: preferences.user?.profile_view_count || 0,
      gamification_score: preferences.user?.gamification_score || 0,
      total_followers: preferences.user?.total_followers || 0,
      total_following: preferences.user?.total_following || 0,
      accepted_answers: preferences.user?.accepted_answers || 0
    };

    return {
      userArchive,
      visits,
      likes,
      badges,
      authTokens,
      userData,
      preferences
    };
  }
}