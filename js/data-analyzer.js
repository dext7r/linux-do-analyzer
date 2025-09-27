/**
 * 完整的数据分析器
 * 支持 Linux.do 论坛导出的所有数据文件分析
 */
class DataAnalyzer {
    constructor(data) {
        this.data = data;
        this.cache = new Map();
    }

    /**
     * 生成完整数据摘要
     */
    generateSummary() {
        const cacheKey = 'summary';
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        const summary = {
            // 用户基本信息
            user: this.getUserInfo(),

            // 核心统计
            totalPosts: this.getTotalPosts(),
            totalLikes: this.getTotalLikes(),
            totalVisits: this.getTotalVisits(),
            totalBadges: this.getTotalBadges(),

            // 活动统计
            totalReadingTime: this.getTotalReadingTime(),
            avgPostsPerDay: this.getAvgPostsPerDay(),
            mostActiveMonth: this.getMostActiveMonth(),
            favoriteCategory: this.getFavoriteCategory(),

            // 新增数据统计
            authTokensCount: this.getAuthTokensCount(),
            bookmarksCount: this.getBookmarksCount(),
            flagsCount: this.getFlagsCount(),
            queuedPostsCount: this.getQueuedPostsCount(),
            categoryPreferencesCount: this.getCategoryPreferencesCount(),

            // 设备使用统计
            mobileUsageRatio: this.getMobileUsageRatio(),

            // 时间跨度统计
            dataDateRange: this.getDataDateRange(),

            // 数据完整性
            dataCompleteness: this.getDataCompleteness()
        };

        this.cache.set(cacheKey, summary);
        return summary;
    }

    /**
     * 获取用户基本信息
     */
    getUserInfo() {
        const user = this.data.user || {};
        return {
            id: user.id || 0,
            username: user.username || '未知用户',
            name: user.name || '',
            email: user.email || '',
            created_at: user.created_at || '',
            trust_level: user.trust_level || 0,
            active: user.active || false,
            admin: user.admin || false,
            moderator: user.moderator || false,
            avatar_template: user.avatar_template || '',
            time_read: user.time_read || 0,
            days_visited: user.days_visited || 0,
            posts_read_count: user.posts_read_count || 0,
            likes_given: user.likes_given || 0,
            likes_received: user.likes_received || 0,
            topics_entered: user.topics_entered || 0,
            post_count: user.post_count || 0,
            can_edit: user.can_edit || false,
            can_edit_username: user.can_edit_username || false,
            can_edit_email: user.can_edit_email || false,
            can_edit_name: user.can_edit_name || false
        };
    }

    /**
     * 获取总发帖数
     */
    getTotalPosts() {
        return this.data.userArchive?.length || 0;
    }

    /**
     * 获取总点赞数（来自用户发帖获得的点赞）
     */
    getTotalLikes() {
        if (!this.data.userArchive) return 0;
        return this.data.userArchive.reduce((total, post) => total + (post.like_count || 0), 0);
    }

    /**
     * 获取总徽章数（已获得的徽章）
     */
    getTotalBadges() {
        return this.data.userBadges?.length || 0;
    }

    /**
     * 获取总访问次数
     */
    getTotalVisits() {
        return this.data.visits?.length || 0;
    }

    /**
     * 计算总阅读时间（来自访问记录）
     */
    getTotalReadingTime() {
        if (!this.data.visits) return 0;
        return this.data.visits.reduce((total, visit) => {
            return total + (parseInt(visit.time_read) || 0);
        }, 0);
    }

    /**
     * 计算平均每日发帖数
     */
    getAvgPostsPerDay() {
        if (!this.data.userArchive || this.data.userArchive.length === 0) return 0;

        const joinDate = new Date(this.data.user?.created_at);
        const now = new Date();
        const daysDiff = Math.max(1, Math.ceil((now - joinDate) / (1000 * 60 * 60 * 24)));

        return (this.data.userArchive.length / daysDiff).toFixed(2);
    }

    /**
     * 获取最活跃的月份
     */
    getMostActiveMonth() {
        if (!this.data.userArchive || this.data.userArchive.length === 0) return '无数据';

        const monthlyPosts = {};
        this.data.userArchive.forEach(post => {
            if (post.created_at) {
                try {
                    const date = new Date(post.created_at);
                    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                    monthlyPosts[monthKey] = (monthlyPosts[monthKey] || 0) + 1;
                } catch (e) {
                    // 忽略无效日期
                }
            }
        });

        const maxMonth = Object.keys(monthlyPosts).reduce((a, b) =>
            monthlyPosts[a] > monthlyPosts[b] ? a : b, Object.keys(monthlyPosts)[0]
        );

        return maxMonth || '无数据';
    }

    /**
     * 获取最喜欢的分类
     */
    getFavoriteCategory() {
        if (!this.data.userArchive || this.data.userArchive.length === 0) return '无数据';

        const categoryCount = {};
        this.data.userArchive.forEach(post => {
            if (post.categories) {
                const categories = post.categories.split('|');
                categories.forEach(cat => {
                    const category = cat.trim();
                    if (category) {
                        categoryCount[category] = (categoryCount[category] || 0) + 1;
                    }
                });
            }
        });

        const maxCategory = Object.keys(categoryCount).reduce((a, b) =>
            categoryCount[a] > categoryCount[b] ? a : b, Object.keys(categoryCount)[0]
        );

        return maxCategory || '无数据';
    }

    /**
     * 获取认证令牌数量
     */
    getAuthTokensCount() {
        return this.data.authTokens?.length || 0;
    }

    /**
     * 获取书签数量
     */
    getBookmarksCount() {
        return this.data.bookmarks?.length || 0;
    }

    /**
     * 获取举报数量
     */
    getFlagsCount() {
        return this.data.flags?.length || 0;
    }

    /**
     * 获取待审核帖子数量
     */
    getQueuedPostsCount() {
        return this.data.queuedPosts?.length || 0;
    }

    /**
     * 获取分类偏好数量
     */
    getCategoryPreferencesCount() {
        return this.data.categoryPreferences?.length || 0;
    }

    /**
     * 获取移动端使用比率
     */
    getMobileUsageRatio() {
        if (!this.data.visits || this.data.visits.length === 0) return 0;

        const mobileVisits = this.data.visits.filter(visit =>
            visit.mobile === true || visit.mobile === 'true'
        ).length;

        return ((mobileVisits / this.data.visits.length) * 100).toFixed(1);
    }

    /**
     * 获取数据时间跨度
     */
    getDataDateRange() {
        const dates = [];

        // 收集所有日期
        if (this.data.visits) {
            dates.push(...this.data.visits.map(v => v.visited_at).filter(Boolean));
        }
        if (this.data.userArchive) {
            dates.push(...this.data.userArchive.map(p => p.created_at).filter(Boolean));
        }
        if (this.data.likes) {
            dates.push(...this.data.likes.map(l => l.created_at).filter(Boolean));
        }

        if (dates.length === 0) return '无数据';

        const validDates = dates.map(d => new Date(d)).filter(d => !isNaN(d.getTime()));
        if (validDates.length === 0) return '无数据';

        const earliest = new Date(Math.min(...validDates));
        const latest = new Date(Math.max(...validDates));

        return {
            start: earliest.toLocaleDateString('zh-CN'),
            end: latest.toLocaleDateString('zh-CN'),
            daySpan: Math.ceil((latest - earliest) / (1000 * 60 * 60 * 24))
        };
    }

    /**
     * 获取数据完整性评估
     */
    getDataCompleteness() {
        const expectedFiles = ['preferences', 'userArchive', 'visits', 'likes', 'userBadges', 'badges', 'users'];

        const availableFiles = expectedFiles.filter(file => {
            if (file === 'preferences') {
                // preferences 是对象，检查是否存在且非空
                return this.data[file] && Object.keys(this.data[file]).length > 0;
            } else {
                // 其他文件是数组，检查是否存在且有数据
                return this.data[file] && this.data[file].length > 0;
            }
        });

        return {
            score: Math.round((availableFiles.length / expectedFiles.length) * 100),
            available: availableFiles,
            missing: expectedFiles.filter(file => !availableFiles.includes(file))
        };
    }

    /**
     * 获取访问活动图表数据
     */
    getVisitsChartData() {
        const cacheKey = 'visitsChart';
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        if (!this.data.visits || this.data.visits.length === 0) {
            return { labels: [], datasets: [] };
        }

        // 取最近60天的数据或全部数据（如果少于60天）
        const recentVisits = this.data.visits.slice(-60);
        const labels = recentVisits.map(v => v.visited_at);
        const postsRead = recentVisits.map(v => parseInt(v.posts_read) || 0);
        const timeRead = recentVisits.map(v => (parseInt(v.time_read) || 0) / 60); // 转换为分钟

        const chartData = {
            labels,
            datasets: [{
                label: '阅读帖子数',
                data: postsRead,
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                yAxisID: 'y',
                tension: 0.4,
                pointRadius: 2,
                pointHoverRadius: 4
            }, {
                label: '阅读时间(分钟)',
                data: timeRead,
                borderColor: 'rgb(168, 85, 247)',
                backgroundColor: 'rgba(168, 85, 247, 0.1)',
                yAxisID: 'y1',
                tension: 0.4,
                pointRadius: 2,
                pointHoverRadius: 4
            }]
        };

        this.cache.set(cacheKey, chartData);
        return chartData;
    }

    /**
     * 获取徽章获得图表数据
     */
    getBadgesChartData() {
        const cacheKey = 'badgesChart';
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        if (!this.data.userBadges || this.data.userBadges.length === 0) {
            return { labels: [], datasets: [] };
        }

        const badgesByMonth = {};
        this.data.userBadges.forEach(badge => {
            if (badge.granted_at) {
                try {
                    const date = new Date(badge.granted_at);
                    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                    badgesByMonth[monthKey] = (badgesByMonth[monthKey] || 0) + 1;
                } catch (e) {
                    // 忽略无效日期
                }
            }
        });

        const labels = Object.keys(badgesByMonth).sort();
        const data = labels.map(label => badgesByMonth[label]);

        const chartData = {
            labels,
            datasets: [{
                label: '获得徽章数',
                data,
                backgroundColor: 'rgba(34, 197, 94, 0.8)',
                borderColor: 'rgb(34, 197, 94)',
                borderWidth: 1,
                borderRadius: 4
            }]
        };

        this.cache.set(cacheKey, chartData);
        return chartData;
    }

    /**
     * 获取设备使用分布数据
     */
    getDeviceChartData() {
        const cacheKey = 'deviceChart';
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        if (!this.data.visits || this.data.visits.length === 0) {
            return { labels: [], datasets: [] };
        }

        const deviceData = { desktop: 0, mobile: 0 };
        this.data.visits.forEach(visit => {
            if (visit.mobile === true || visit.mobile === 'true') {
                deviceData.mobile++;
            } else {
                deviceData.desktop++;
            }
        });

        const chartData = {
            labels: ['桌面端', '移动端'],
            datasets: [{
                data: [deviceData.desktop, deviceData.mobile],
                backgroundColor: [
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(168, 85, 247, 0.8)'
                ],
                borderColor: [
                    'rgb(59, 130, 246)',
                    'rgb(168, 85, 247)'
                ],
                borderWidth: 2
            }]
        };

        this.cache.set(cacheKey, chartData);
        return chartData;
    }

    /**
     * 获取发帖活动时间分布数据
     */
    getPostsActivityData() {
        const cacheKey = 'postsActivity';
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        if (!this.data.userArchive || this.data.userArchive.length === 0) {
            return { labels: [], datasets: [] };
        }

        const hourlyData = new Array(24).fill(0);
        this.data.userArchive.forEach(post => {
            if (post.created_at) {
                try {
                    const hour = new Date(post.created_at).getHours();
                    if (hour >= 0 && hour < 24) {
                        hourlyData[hour]++;
                    }
                } catch (e) {
                    // 忽略无效日期
                }
            }
        });

        const chartData = {
            labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
            datasets: [{
                label: '发帖数量',
                data: hourlyData,
                backgroundColor: 'rgba(245, 158, 11, 0.6)',
                borderColor: 'rgb(245, 158, 11)',
                borderWidth: 1,
                borderRadius: 2
            }]
        };

        this.cache.set(cacheKey, chartData);
        return chartData;
    }

    /**
     * 获取点赞活动趋势数据
     */
    getLikesActivityData() {
        const cacheKey = 'likesActivity';
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        if (!this.data.likes || this.data.likes.length === 0) {
            return { labels: [], datasets: [] };
        }

        const likesByMonth = {};
        this.data.likes.forEach(like => {
            if (like.created_at) {
                try {
                    const date = new Date(like.created_at);
                    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                    likesByMonth[monthKey] = (likesByMonth[monthKey] || 0) + 1;
                } catch (e) {
                    // 忽略无效日期
                }
            }
        });

        const labels = Object.keys(likesByMonth).sort();
        const data = labels.map(label => likesByMonth[label]);

        const chartData = {
            labels,
            datasets: [{
                label: '点赞数量',
                data,
                borderColor: 'rgb(239, 68, 68)',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                tension: 0.4,
                fill: true
            }]
        };

        this.cache.set(cacheKey, chartData);
        return chartData;
    }

    /**
     * 获取认证令牌使用分析
     */
    getAuthTokensAnalysis() {
        const cacheKey = 'authTokensAnalysis';
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        if (!this.data.authTokens || this.data.authTokens.length === 0) {
            return null;
        }

        const deviceTypes = {};
        const ipAddresses = {};
        const userAgents = {};

        this.data.authTokens.forEach(token => {
            // 统计IP地址
            if (token.client_ip) {
                ipAddresses[token.client_ip] = (ipAddresses[token.client_ip] || 0) + 1;
            }

            // 统计用户代理
            if (token.user_agent) {
                // 简化用户代理信息
                let simplified = 'Unknown';
                if (token.user_agent.includes('Mobile') || token.user_agent.includes('Android')) {
                    simplified = 'Mobile';
                } else if (token.user_agent.includes('Chrome')) {
                    simplified = 'Chrome';
                } else if (token.user_agent.includes('Firefox')) {
                    simplified = 'Firefox';
                } else if (token.user_agent.includes('Safari')) {
                    simplified = 'Safari';
                }
                userAgents[simplified] = (userAgents[simplified] || 0) + 1;
            }
        });

        this.cache.set(cacheKey, {
            totalTokens: this.data.authTokens.length,
            uniqueIPs: Object.keys(ipAddresses).length,
            topIPs: Object.entries(ipAddresses)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5)
                .map(([ip, count]) => ({ ip, count })),
            userAgentStats: Object.entries(userAgents)
                .map(([agent, count]) => ({ agent, count }))
                .sort((a, b) => b.count - a.count)
        });

        return this.cache.get(cacheKey);
    }

    /**
     * 获取分类活动数据
     */
    getCategoryData() {
        const cacheKey = 'categoryData';
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        if (!this.data.userArchive || this.data.userArchive.length === 0) {
            return [];
        }

        const categoryStats = {};
        this.data.userArchive.forEach(post => {
            if (post.categories) {
                const categories = post.categories.split('|');
                categories.forEach(cat => {
                    const category = cat.trim();
                    if (category) {
                        if (!categoryStats[category]) {
                            categoryStats[category] = {
                                name: category,
                                posts: 0,
                                likes: 0,
                                replies: 0
                            };
                        }
                        categoryStats[category].posts++;
                        categoryStats[category].likes += post.like_count || 0;
                        categoryStats[category].replies += post.reply_count || 0;
                    }
                });
            }
        });

        const result = Object.values(categoryStats)
            .sort((a, b) => b.posts - a.posts)
            .slice(0, 20); // 取前20个分类

        this.cache.set(cacheKey, result);
        return result;
    }

    /**
     * 获取徽章统计
     */
    getBadgeStats() {
        const cacheKey = 'badgeStats';
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        if (!this.data.userBadges || this.data.userBadges.length === 0) {
            return [];
        }

        const badgeCount = {};
        this.data.userBadges.forEach(badge => {
            const name = badge.badge_name || '未知徽章';
            badgeCount[name] = (badgeCount[name] || 0) + 1;
        });

        const result = Object.entries(badgeCount)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count);

        this.cache.set(cacheKey, result);
        return result;
    }

    /**
     * 获取书签分析
     */
    getBookmarksAnalysis() {
        const cacheKey = 'bookmarksAnalysis';
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        if (!this.data.bookmarks || this.data.bookmarks.length === 0) {
            return null;
        }

        const typeCount = {};
        const bookmarksByMonth = {};

        this.data.bookmarks.forEach(bookmark => {
            // 统计类型
            const type = bookmark.bookmarkable_type || 'Unknown';
            typeCount[type] = (typeCount[type] || 0) + 1;

            // 按月统计
            if (bookmark.created_at) {
                try {
                    const date = new Date(bookmark.created_at);
                    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                    bookmarksByMonth[monthKey] = (bookmarksByMonth[monthKey] || 0) + 1;
                } catch (e) {
                    // 忽略无效日期
                }
            }
        });

        this.cache.set(cacheKey, {
            total: this.data.bookmarks.length,
            byType: Object.entries(typeCount).map(([type, count]) => ({ type, count })),
            byMonth: Object.entries(bookmarksByMonth)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([month, count]) => ({ month, count }))
        });

        return this.cache.get(cacheKey);
    }

    /**
     * 获取举报分析
     */
    getFlagsAnalysis() {
        const cacheKey = 'flagsAnalysis';
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        if (!this.data.flags || this.data.flags.length === 0) {
            return null;
        }

        const typeCount = {};
        const flagsByMonth = {};

        this.data.flags.forEach(flag => {
            // 统计举报类型
            const type = flag.flag_type || 'Unknown';
            typeCount[type] = (typeCount[type] || 0) + 1;

            // 按月统计
            if (flag.created_at) {
                try {
                    const date = new Date(flag.created_at);
                    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                    flagsByMonth[monthKey] = (flagsByMonth[monthKey] || 0) + 1;
                } catch (e) {
                    // 忽略无效日期
                }
            }
        });

        this.cache.set(cacheKey, {
            total: this.data.flags.length,
            byType: Object.entries(typeCount).map(([type, count]) => ({ type, count })),
            byMonth: Object.entries(flagsByMonth)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([month, count]) => ({ month, count }))
        });

        return this.cache.get(cacheKey);
    }

    /**
     * 获取所有详细数据表格
     */
    getDetailedData() {
        return {
            userArchive: this.data.userArchive || [],
            visits: this.data.visits || [],
            likes: this.data.likes || [],
            userBadges: this.data.userBadges || [],
            authTokens: this.data.authTokens || [],
            authTokenLogs: this.data.authTokenLogs || [],
            bookmarks: this.data.bookmarks || [],
            categoryPreferences: this.data.categoryPreferences || [],
            flags: this.data.flags || [],
            queuedPosts: this.data.queuedPosts || []
        };
    }

    /**
     * 清空缓存
     */
    clearCache() {
        this.cache.clear();
    }

    /**
     * 导出完整分析结果
     */
    exportAnalysis() {
        return {
            summary: this.generateSummary(),
            categoryData: this.getCategoryData(),
            badgeStats: this.getBadgeStats(),
            authTokensAnalysis: this.getAuthTokensAnalysis(),
            bookmarksAnalysis: this.getBookmarksAnalysis(),
            flagsAnalysis: this.getFlagsAnalysis(),
            detailedData: this.getDetailedData(),
            chartData: {
                visits: this.getVisitsChartData(),
                badges: this.getBadgesChartData(),
                device: this.getDeviceChartData(),
                posts: this.getPostsActivityData(),
                likes: this.getLikesActivityData()
            },
            metadata: {
                analyzedAt: new Date().toISOString(),
                dataPoints: {
                    posts: this.data.userArchive?.length || 0,
                    visits: this.data.visits?.length || 0,
                    likes: this.data.likes?.length || 0,
                    userBadges: this.data.userBadges?.length || 0,
                    authTokens: this.data.authTokens?.length || 0,
                    authTokenLogs: this.data.authTokenLogs?.length || 0,
                    bookmarks: this.data.bookmarks?.length || 0,
                    flags: this.data.flags?.length || 0,
                    queuedPosts: this.data.queuedPosts?.length || 0,
                    categoryPreferences: this.data.categoryPreferences?.length || 0
                }
            }
        };
    }
}

// 导出为全局变量
window.DataAnalyzer = DataAnalyzer;