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
            // 基本身份信息
            id: user.id || 0,
            username: user.username || '未知用户',
            name: user.name || '',
            email: user.email || '',
            created_at: user.created_at || '',
            last_seen_at: user.last_seen_at || '',
            last_posted_at: user.last_posted_at || '',

            // 头像信息
            avatar_template: user.avatar_template || '',
            custom_avatar_template: user.custom_avatar_template || '',

            // 信任和权限
            trust_level: user.trust_level || 0,
            active: user.active || false,
            admin: user.admin || false,
            moderator: user.moderator || false,
            title: user.title || '',

            // 个人资料
            bio_raw: user.bio_raw || '',
            bio_cooked: user.bio_cooked || '',
            location: user.location || '',
            birthdate: user.birthdate || '',
            cakedate: user.cakedate || '',
            locale: user.locale || '',

            // 统计数据
            time_read: user.time_read || 0,
            recent_time_read: user.recent_time_read || 0,
            days_visited: user.days_visited || 0,
            posts_read_count: user.posts_read_count || 0,
            likes_given: user.likes_given || 0,
            likes_received: user.likes_received || 0,
            topics_entered: user.topics_entered || 0,
            post_count: user.post_count || 0,
            profile_view_count: user.profile_view_count || 0,
            total_followers: user.total_followers || 0,
            total_following: user.total_following || 0,
            badge_count: user.badge_count || 0,
            accepted_answers: user.accepted_answers || 0,
            gamification_score: user.gamification_score || 0,

            // 权限开关
            can_edit: user.can_edit || false,
            can_edit_username: user.can_edit_username || false,
            can_edit_email: user.can_edit_email || false,
            can_edit_name: user.can_edit_name || false,
            can_send_private_messages: user.can_send_private_messages || false,
            can_upload_profile_header: user.can_upload_profile_header || false,
            can_upload_user_card_background: user.can_upload_user_card_background || false,

            // 隐私设置
            can_see_following: user.can_see_following || false,
            can_see_followers: user.can_see_followers || false,
            can_see_network_tab: user.can_see_network_tab || false,

            // 安全设置
            second_factor_enabled: user.second_factor_enabled || false,
            second_factor_backup_enabled: user.second_factor_backup_enabled || false,

            // 分类设置
            watched_category_ids: user.watched_category_ids || [],
            muted_category_ids: user.muted_category_ids || [],
            tracked_category_ids: user.tracked_category_ids || [],
            sidebar_category_ids: user.sidebar_category_ids || [],
            sidebar_tags: user.sidebar_tags || [],

            // 其他用户设置
            muted_usernames: user.muted_usernames || [],
            ignored_usernames: user.ignored_usernames || [],
            featured_user_badge_ids: user.featured_user_badge_ids || [],

            // 邀请信息
            invited_by: user.invited_by || null,

            // 通知设置
            user_notification_schedule: user.user_notification_schedule || {},

            // 自定义字段
            custom_fields: user.custom_fields || {},
            user_fields: user.user_fields || {}
        };
    }

    /**
     * 获取徽章详细分析
     */
    getBadgeDetailedAnalysis() {
        const cacheKey = 'badgeDetailedAnalysis';
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        const result = {
            userBadges: [],
            badgeTypes: {},
            badgesByType: {},
            totalBadges: 0,
            uniqueBadges: 0,
            badgeTimeline: []
        };

        // 处理徽章类型
        if (this.data.badge_types) {
            this.data.badge_types.forEach(type => {
                result.badgeTypes[type.id] = {
                    id: type.id,
                    name: type.name,
                    sort_order: type.sort_order
                };
                result.badgesByType[type.name] = [];
            });
        }

        // 处理系统徽章定义
        const badgeDefinitions = {};
        if (this.data.badges) {
            this.data.badges.forEach(badge => {
                badgeDefinitions[badge.id] = {
                    id: badge.id,
                    name: badge.name,
                    description: badge.description,
                    grant_count: badge.grant_count,
                    allow_title: badge.allow_title,
                    multiple_grant: badge.multiple_grant,
                    icon: badge.icon,
                    image_url: badge.image_url,
                    listable: badge.listable,
                    enabled: badge.enabled,
                    badge_type_id: badge.badge_type_id,
                    system: badge.system,
                    slug: badge.slug
                };
            });
        }

        // 处理用户获得的徽章
        if (this.data.user_badges) {
            this.data.user_badges.forEach(userBadge => {
                const badgeDefinition = badgeDefinitions[userBadge.badge_id] || {};
                const badgeTypeName = result.badgeTypes[badgeDefinition.badge_type_id]?.name || '未知类型';

                const enrichedBadge = {
                    id: userBadge.id,
                    granted_at: userBadge.granted_at,
                    created_at: userBadge.created_at,
                    count: userBadge.count || 1,
                    badge_id: userBadge.badge_id,
                    user_id: userBadge.user_id,
                    granted_by_id: userBadge.granted_by_id,
                    // 从徽章定义中获取的信息
                    name: badgeDefinition.name || '未知徽章',
                    description: badgeDefinition.description || '',
                    icon: badgeDefinition.icon || '',
                    image_url: badgeDefinition.image_url || '',
                    badge_type: badgeTypeName,
                    allow_title: badgeDefinition.allow_title || false,
                    multiple_grant: badgeDefinition.multiple_grant || false
                };

                result.userBadges.push(enrichedBadge);
                result.badgesByType[badgeTypeName] = result.badgesByType[badgeTypeName] || [];
                result.badgesByType[badgeTypeName].push(enrichedBadge);

                // 构建时间线
                if (userBadge.granted_at) {
                    result.badgeTimeline.push({
                        date: userBadge.granted_at,
                        badge_name: enrichedBadge.name,
                        badge_type: badgeTypeName,
                        count: enrichedBadge.count
                    });
                }

                result.totalBadges += enrichedBadge.count;
            });

            // 计算独特徽章数量
            const uniqueBadgeIds = new Set(this.data.user_badges.map(b => b.badge_id));
            result.uniqueBadges = uniqueBadgeIds.size;

            // 按时间排序徽章时间线
            result.badgeTimeline.sort((a, b) => new Date(a.date) - new Date(b.date));
        }

        this.cache.set(cacheKey, result);
        return result;
    }

    /**
     * 获取用户权限和设置详细分析
     */
    getUserPermissionsAndSettings() {
        const cacheKey = 'userPermissionsAndSettings';
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        const user = this.data.user || {};

        const result = {
            // 基本权限
            permissions: {
                admin: user.admin || false,
                moderator: user.moderator || false,
                trust_level: user.trust_level || 0,
                can_edit: user.can_edit || false,
                can_edit_email: user.can_edit_email || false,
                can_edit_name: user.can_edit_name || false,
                can_send_private_messages: user.can_send_private_messages || false,
                can_upload_profile_header: user.can_upload_profile_header || false,
                can_upload_user_card_background: user.can_upload_user_card_background || false
            },

            // 隐私设置
            privacy: {
                email_private: user.email_private || false,
                profile_hidden: user.profile_hidden || false,
                can_see_following: user.can_see_following !== false,
                can_see_followers: user.can_see_followers !== false,
                can_see_network_tab: user.can_see_network_tab !== false,
                muted_usernames: (user.muted_usernames || []).length,
                ignored_usernames: (user.ignored_usernames || []).length
            },

            // 通知设置
            notifications: {
                email_digests: user.email_digests || false,
                email_private_messages: user.email_private_messages || false,
                email_direct: user.email_direct || false,
                email_always: user.email_always || false,
                notification_schedule_enabled: user.user_notification_schedule?.enabled || false,
                digest_after_minutes: user.digest_after_minutes || 0,
                automatically_unpin_topics: user.automatically_unpin_topics || false,
                homepage_id: user.homepage_id || null
            },

            // 个性化设置
            preferences: {
                locale: user.locale || 'zh_CN',
                timezone: user.timezone || null,
                theme_ids: user.theme_ids || [],
                color_scheme_id: user.color_scheme_id || null,
                text_size: user.text_size || 'normal',
                text_size_seq: user.text_size_seq || 0,
                title_count_mode: user.title_count_mode || 'notifications',
                enable_quoting: user.enable_quoting !== false,
                enable_defer: user.enable_defer !== false,
                external_links_in_new_tab: user.external_links_in_new_tab !== false,
                dynamic_favicon: user.dynamic_favicon !== false
            },

            // 分类偏好
            categoryPreferences: {
                watched_category_ids: user.watched_category_ids || [],
                tracked_category_ids: user.tracked_category_ids || [],
                muted_category_ids: user.muted_category_ids || [],
                regular_category_ids: user.regular_category_ids || [],
                sidebar_category_ids: user.sidebar_category_ids || [],
                sidebar_tags: user.sidebar_tags || []
            },

            // 安全设置
            security: {
                second_factor_enabled: user.second_factor_enabled || false,
                second_factor_backup_enabled: user.second_factor_backup_enabled || false,
                active_auth_tokens: (user.user_auth_tokens || []).length,
                last_password_change: user.last_password_change_at || null,
                password_expires_at: user.password_expires_at || null
            },

            // 自定义字段
            customFields: user.custom_fields || {},
            userFields: user.user_fields || {}
        };

        this.cache.set(cacheKey, result);
        return result;
    }

    /**
     * 获取设备登录历史详细分析
     */
    getDeviceLoginHistory() {
        const cacheKey = 'deviceLoginHistory';
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        const user = this.data.user || {};
        const authTokens = user.user_auth_tokens || [];

        const result = {
            totalDevices: authTokens.length,
            activeDevices: 0,
            recentDevices: [],
            devicesByType: {},
            loginTimeline: [],
            deviceSummary: []
        };

        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        authTokens.forEach(token => {
            const createdAt = new Date(token.created_at);
            const seenAt = new Date(token.seen_at);
            const isRecent = seenAt >= thirtyDaysAgo;

            if (isRecent) {
                result.activeDevices++;
            }

            // 设备类型分析（基于User-Agent或其他信息推断）
            let deviceType = '未知设备';
            let deviceName = token.client_ip || '未知IP';

            if (token.user_agent) {
                if (token.user_agent.includes('Mobile') || token.user_agent.includes('Android') || token.user_agent.includes('iPhone')) {
                    deviceType = '移动设备';
                } else if (token.user_agent.includes('Chrome')) {
                    deviceType = 'Chrome浏览器';
                } else if (token.user_agent.includes('Firefox')) {
                    deviceType = 'Firefox浏览器';
                } else if (token.user_agent.includes('Safari')) {
                    deviceType = 'Safari浏览器';
                } else if (token.user_agent.includes('Edge')) {
                    deviceType = 'Edge浏览器';
                } else {
                    deviceType = '桌面浏览器';
                }
            }

            // 设备类型统计
            if (!result.devicesByType[deviceType]) {
                result.devicesByType[deviceType] = {
                    count: 0,
                    lastSeen: seenAt,
                    devices: []
                };
            }
            result.devicesByType[deviceType].count++;

            if (seenAt > result.devicesByType[deviceType].lastSeen) {
                result.devicesByType[deviceType].lastSeen = seenAt;
            }

            // 最近活跃设备
            if (isRecent) {
                result.recentDevices.push({
                    id: token.id,
                    ip: token.client_ip,
                    userAgent: token.user_agent || '未知',
                    createdAt: createdAt,
                    seenAt: seenAt,
                    deviceType: deviceType,
                    isActive: true
                });
            }

            // 登录时间线
            result.loginTimeline.push({
                date: createdAt,
                type: 'login',
                ip: token.client_ip,
                deviceType: deviceType,
                userAgent: token.user_agent
            });

            // 设备摘要
            result.deviceSummary.push({
                id: token.id,
                ip: token.client_ip,
                deviceType: deviceType,
                createdAt: createdAt,
                seenAt: seenAt,
                daysSinceLastSeen: Math.floor((now - seenAt) / (24 * 60 * 60 * 1000)),
                isRecent: isRecent,
                userAgent: token.user_agent || '未知'
            });
        });

        // 按最后活跃时间排序
        result.recentDevices.sort((a, b) => b.seenAt - a.seenAt);
        result.deviceSummary.sort((a, b) => b.seenAt - a.seenAt);
        result.loginTimeline.sort((a, b) => b.date - a.date);

        this.cache.set(cacheKey, result);
        return result;
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
            badgeDetailedAnalysis: this.getBadgeDetailedAnalysis(), // 新添加的徽章详细分析
            userPermissionsAndSettings: this.getUserPermissionsAndSettings(), // 用户权限和设置分析
            deviceLoginHistory: this.getDeviceLoginHistory(), // 设备登录历史分析
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

    /**
     * 获取综合活动趋势数据
     */
    getActivityTrendData() {
        const cacheKey = 'activityTrendData';
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        // 获取最近30天的日期
        const dates = [];
        const today = new Date();
        for (let i = 29; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            dates.push(date.toISOString().split('T')[0]);
        }

        // 统计每天的活动数据
        const postsData = new Array(30).fill(0);
        const likesData = new Array(30).fill(0);
        const visitsData = new Array(30).fill(0);

        // 统计发帖数据
        if (this.data.userArchive) {
            this.data.userArchive.forEach(post => {
                const postDate = post.created_at?.split('T')[0];
                const index = dates.indexOf(postDate);
                if (index !== -1) {
                    postsData[index]++;
                }
            });
        }

        // 统计点赞数据
        if (this.data.likes) {
            this.data.likes.forEach(like => {
                const likeDate = like.created_at?.split('T')[0];
                const index = dates.indexOf(likeDate);
                if (index !== -1) {
                    likesData[index]++;
                }
            });
        }

        // 统计访问数据
        if (this.data.visits) {
            this.data.visits.forEach(visit => {
                const visitDate = visit.visited_at?.split('T')[0];
                const index = dates.indexOf(visitDate);
                if (index !== -1) {
                    visitsData[index] = visit.posts_read || 0;
                }
            });
        }

        const data = {
            labels: dates.map(d => d.substr(5)), // MM-DD格式
            posts: postsData,
            likes: likesData,
            visits: visitsData
        };

        this.cache.set(cacheKey, data);
        return data;
    }

    /**
     * 获取分类活动图表数据
     */
    getCategoryChartData() {
        const cacheKey = 'categoryChartData';
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        const categoryData = this.getCategoryData();
        if (!categoryData || categoryData.length === 0) {
            return [];
        }

        // 取前10个最活跃的分类
        const topCategories = categoryData
            .sort((a, b) => b.posts - a.posts)
            .slice(0, 10)
            .map(cat => ({
                name: cat.name,
                posts: cat.posts
            }));

        this.cache.set(cacheKey, topCategories);
        return topCategories;
    }
}

// 导出为全局变量
window.DataAnalyzer = DataAnalyzer;