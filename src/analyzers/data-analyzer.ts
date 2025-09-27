import type { AnalysisData, AnalysisResult, ChartData } from "../types/index.ts";
import {
  formatDate,
  formatReadingTime,
  groupByDate,
  groupByMonth,
  calculatePercentage,
  sortObjectByValue,
  generateColors
} from "../utils/helpers.ts";

export class DataAnalyzer {
  private data: AnalysisData;

  constructor(data: AnalysisData) {
    this.data = data;
  }

  analyzeActivity(): AnalysisResult['activityAnalysis'] {
    return {
      dailyVisits: this.analyzeDailyVisits(),
      readingTime: this.analyzeReadingTime(),
      postsTimeline: this.analyzePostsTimeline()
    };
  }

  private analyzeDailyVisits(): ChartData {
    const visits = this.data.visits.sort((a, b) =>
      new Date(a.visited_at).getTime() - new Date(b.visited_at).getTime()
    );

    return {
      labels: visits.map(v => formatDate(v.visited_at)),
      datasets: [{
        label: '阅读帖子数',
        data: visits.map(v => v.posts_read),
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 2,
        fill: true
      }]
    };
  }

  private analyzeReadingTime(): ChartData {
    const visits = this.data.visits.sort((a, b) =>
      new Date(a.visited_at).getTime() - new Date(b.visited_at).getTime()
    );

    return {
      labels: visits.map(v => formatDate(v.visited_at)),
      datasets: [{
        label: '阅读时长(分钟)',
        data: visits.map(v => Math.round(v.time_read / 60)),
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 2,
        fill: true
      }]
    };
  }

  private analyzePostsTimeline(): ChartData {
    const groupedPosts = groupByMonth(this.data.userArchive, 'created_at');
    const sortedEntries = Array.from(groupedPosts.entries()).sort();

    return {
      labels: sortedEntries.map(([month]) => month),
      datasets: [{
        label: '发帖数量',
        data: sortedEntries.map(([, posts]) => posts.length),
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 2,
        fill: true
      }]
    };
  }

  analyzeInteraction(): AnalysisResult['interactionAnalysis'] {
    return {
      likesGiven: this.analyzeLikesGiven(),
      likesReceived: this.analyzeLikesReceived(),
      topicParticipation: this.analyzeTopicParticipation()
    };
  }

  private analyzeLikesGiven(): ChartData {
    const groupedLikes = groupByMonth(this.data.likes, 'created_at');
    const sortedEntries = Array.from(groupedLikes.entries()).sort();

    return {
      labels: sortedEntries.map(([month]) => month),
      datasets: [{
        label: '点赞数量',
        data: sortedEntries.map(([, likes]) => likes.length),
        backgroundColor: 'rgba(255, 206, 86, 0.2)',
        borderColor: 'rgba(255, 206, 86, 1)',
        borderWidth: 2,
        fill: true
      }]
    };
  }

  private analyzeLikesReceived(): ChartData {
    const groupedPosts = groupByMonth(this.data.userArchive, 'created_at');
    const sortedEntries = Array.from(groupedPosts.entries()).sort();

    return {
      labels: sortedEntries.map(([month]) => month),
      datasets: [{
        label: '获得点赞',
        data: sortedEntries.map(([, posts]) =>
          posts.reduce((sum, post) => sum + post.like_count, 0)
        ),
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 2,
        fill: true
      }]
    };
  }

  private analyzeTopicParticipation(): ChartData {
    const categoryStats: Record<string, number> = {};

    this.data.userArchive.forEach(post => {
      const category = post.categories || '未分类';
      categoryStats[category] = (categoryStats[category] || 0) + 1;
    });

    const sorted = sortObjectByValue(categoryStats).slice(0, 8);
    const colors = generateColors(sorted.length);

    return {
      labels: sorted.map(([category]) => category),
      datasets: [{
        label: '参与话题数',
        data: sorted.map(([, count]) => count),
        backgroundColor: colors,
        borderWidth: 1
      }]
    };
  }

  analyzeAchievements(): AnalysisResult['achievementAnalysis'] {
    return {
      badgesEarned: this.analyzeBadgesEarned(),
      trustLevelProgress: this.analyzeTrustLevelProgress(),
      communityContribution: this.analyzeCommunityContribution()
    };
  }

  private analyzeBadgesEarned(): ChartData {
    const groupedBadges = groupByMonth(this.data.badges, 'granted_at');
    const sortedEntries = Array.from(groupedBadges.entries()).sort();

    return {
      labels: sortedEntries.map(([month]) => month),
      datasets: [{
        label: '获得徽章',
        data: sortedEntries.map(([, badges]) => badges.length),
        backgroundColor: 'rgba(255, 159, 64, 0.2)',
        borderColor: 'rgba(255, 159, 64, 1)',
        borderWidth: 2,
        fill: true
      }]
    };
  }

  private analyzeTrustLevelProgress(): ChartData {
    const currentLevel = this.data.userData.trust_level;
    const levels = ['新手', '基础', '成员', '活跃', '导师'];

    return {
      labels: levels,
      datasets: [{
        label: '信任等级',
        data: levels.map((_, index) => index <= currentLevel ? 1 : 0),
        backgroundColor: levels.map((_, index) =>
          index <= currentLevel ? 'rgba(75, 192, 192, 0.8)' : 'rgba(201, 203, 207, 0.3)'
        ),
        borderWidth: 1
      }]
    };
  }

  private analyzeCommunityContribution(): ChartData {
    const metrics = [
      '发帖数', '获得点赞', '回复数', '关注者', '徽章数', '阅读时长(小时)'
    ];

    const values = [
      this.data.userArchive.length,
      this.data.userArchive.reduce((sum, post) => sum + post.like_count, 0),
      this.data.userArchive.reduce((sum, post) => sum + post.reply_count, 0),
      this.data.userData.total_followers,
      this.data.userData.badge_count,
      Math.round(this.data.userData.time_read / 3600)
    ];

    return {
      labels: metrics,
      datasets: [{
        label: '社区贡献',
        data: values,
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)',
          'rgba(255, 159, 64, 0.8)'
        ],
        borderWidth: 1
      }]
    };
  }

  analyzeDevices(): AnalysisResult['deviceAnalysis'] {
    return {
      deviceDistribution: this.analyzeDeviceDistribution(),
      locationDistribution: this.analyzeLocationDistribution(),
      browserDistribution: this.analyzeBrowserDistribution()
    };
  }

  private analyzeDeviceDistribution(): ChartData {
    const deviceStats: Record<string, number> = {};

    this.data.authTokens.forEach(token => {
      const device = token.device || 'Unknown';
      deviceStats[device] = (deviceStats[device] || 0) + 1;
    });

    const sorted = sortObjectByValue(deviceStats);
    const colors = generateColors(sorted.length);

    return {
      labels: sorted.map(([device]) => device),
      datasets: [{
        label: '设备类型',
        data: sorted.map(([, count]) => count),
        backgroundColor: colors,
        borderWidth: 1
      }]
    };
  }

  private analyzeLocationDistribution(): ChartData {
    const locationStats: Record<string, number> = {};

    this.data.authTokens.forEach(token => {
      const location = token.location || 'Unknown';
      locationStats[location] = (locationStats[location] || 0) + 1;
    });

    const sorted = sortObjectByValue(locationStats).slice(0, 8);
    const colors = generateColors(sorted.length);

    return {
      labels: sorted.map(([location]) => location),
      datasets: [{
        label: '访问地点',
        data: sorted.map(([, count]) => count),
        backgroundColor: colors,
        borderWidth: 1
      }]
    };
  }

  private analyzeBrowserDistribution(): ChartData {
    const browserStats: Record<string, number> = {};

    this.data.authTokens.forEach(token => {
      const browser = token.browser || 'Unknown';
      browserStats[browser] = (browserStats[browser] || 0) + 1;
    });

    const sorted = sortObjectByValue(browserStats);
    const colors = generateColors(sorted.length);

    return {
      labels: sorted.map(([browser]) => browser),
      datasets: [{
        label: '浏览器',
        data: sorted.map(([, count]) => count),
        backgroundColor: colors,
        borderWidth: 1
      }]
    };
  }

  generateSummary(): AnalysisResult['summary'] {
    return {
      totalPosts: this.data.userArchive.length,
      totalLikes: this.data.userArchive.reduce((sum, post) => sum + post.like_count, 0),
      totalBadges: this.data.userData.badge_count,
      joinDate: formatDate(this.data.userData.created_at),
      trustLevel: this.data.userData.trust_level,
      readingHours: Math.round(this.data.userData.time_read / 3600),
      activeVisitDays: this.data.visits.filter(v => v.posts_read > 0).length
    };
  }

  analyze(): AnalysisResult {
    return {
      activityAnalysis: this.analyzeActivity(),
      interactionAnalysis: this.analyzeInteraction(),
      achievementAnalysis: this.analyzeAchievements(),
      deviceAnalysis: this.analyzeDevices(),
      summary: this.generateSummary()
    };
  }
}