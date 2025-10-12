/**
 * 完整的ZIP文件解析器
 * 支持 Linux.do 论坛导出的所有数据文件
 */
class ZipParser {
    constructor() {
        // 所有支持的文件及其重要性
        this.supportedFiles = {
            // 必需文件
            required: ['preferences.json', 'user_archive.csv'],
            // 可选文件但重要
            optional: [
                'visits.csv',
                'likes.csv',
                'badges.csv',
                'auth_tokens.csv',
                'auth_token_logs.csv',
                'bookmarks.csv',
                'category_preferences.csv',
                'flags.csv',
                'queued_posts.csv'
            ]
        };
        this.maxFileSize = 10 * 1024 * 1024; // 10MB

        // 支持的平台配置
        this.platformCatalog = {
            'linux.do': {
                id: 'linux-do',
                displayName: 'Linux.do 社区',
                domain: 'linux.do',
                baseUrl: 'https://linux.do',
                accentColor: '#2563eb'
            },
            'idcflare.com': {
                id: 'idcflare',
                displayName: 'IDCFlare 社区',
                domain: 'idcflare.com',
                baseUrl: 'https://idcflare.com',
                accentColor: '#f97316'
            }
        };

        this.defaultPlatform = {
            id: 'linux-do',
            displayName: 'Linux.do 社区',
            domain: 'linux.do',
            baseUrl: 'https://linux.do',
            accentColor: '#2563eb'
        };

        this.unknownPlatform = {
            id: 'unknown',
            displayName: '未知平台',
            domain: null,
            baseUrl: '',
            accentColor: '#6b7280'
        };

        this.warnings = [];
    }

    resetWarnings() {
        this.warnings = [];
    }

    addWarning(message) {
        if (!this.warnings) {
            this.warnings = [];
        }
        this.warnings.push(message);
        console.warn(`⚠️ 解析提示: ${message}`);
    }

    /**
     * 解析ZIP文件
     */
    async parseZipFile(file) {
        if (!file.name.toLowerCase().endsWith('.zip')) {
            throw new Error('请选择ZIP格式的文件');
        }

        if (file.size > this.maxFileSize) {
            throw new Error(`文件大小超过${this.formatFileSize(this.maxFileSize)}限制`);
        }

        console.log(`🗂️ 开始解析ZIP文件: ${file.name} (${this.formatFileSize(file.size)})`);

        try {
            this.resetWarnings();

            const zip = new JSZip();
            const zipData = await zip.loadAsync(file);

            const files = {};
            const fileList = [];
            const seenBasenames = new Map();

            // 提取所有文件
            for (const [filename, fileObj] of Object.entries(zipData.files)) {
                if (!fileObj.dir) {
                    console.log(`📄 提取文件: ${filename}`);
                    const content = await fileObj.async('text');

                    // 获取文件名（去除路径）
                    const basename = filename.split('/').pop();
                    const hasSeen = seenBasenames.has(basename);

                    if (!hasSeen) {
                        files[basename] = content;
                        seenBasenames.set(basename, filename);
                    } else {
                        this.addWarning(`检测到重复文件 "${basename}"：优先使用 "${seenBasenames.get(basename)}"，忽略 "${filename}"`);
                    }

                    fileList.push({
                        name: filename,
                        basename: basename,
                        size: content.length,
                        isRequired: this.supportedFiles.required.includes(basename),
                        isOptional: this.supportedFiles.optional.includes(basename),
                        duplicate: hasSeen
                    });
                }
            }

            console.log(`✅ 提取完成，共 ${fileList.length} 个文件`);

            // 验证必需文件
            this.validateRequiredFiles(files);

            // 解析数据
            const parsedData = await this.parseAllData(files);
            const platform = this.detectPlatform(parsedData);

            const metadata = {
                fileName: file.name,
                fileSize: file.size,
                processedAt: new Date().toISOString(),
                fileList,
                totalFiles: fileList.length,
                supportedFiles: fileList.filter(f => f.isRequired || f.isOptional).length,
                platform,
                hostInsights: platform.detectedHosts || [],
                warnings: [...this.warnings]
            };

            return {
                ...parsedData,
                platform,
                metadata
            };

        } catch (error) {
            console.error('❌ ZIP解析失败:', error);
            throw new Error(`ZIP文件解析失败: ${error.message}`);
        }
    }

    /**
     * 验证必需文件
     */
    validateRequiredFiles(files) {
        const missingFiles = this.supportedFiles.required.filter(filename => !files[filename]);

        if (missingFiles.length > 0) {
            throw new Error(`缺少必要文件: ${missingFiles.join(', ')}`);
        }

        console.log('✅ 文件验证通过');
    }

    /**
     * 解析所有数据
     */
    async parseAllData(files) {
        console.log('📊 开始解析所有数据...');

        const data = {
            // JSON数据
            preferences: {},
            userBadges: [],
            badges: [],
            users: [],
            user: {},

            // CSV数据
            userArchive: [],
            visits: [],
            likes: [],
            badgesCsv: [],
            authTokens: [],
            authTokenLogs: [],
            bookmarks: [],
            categoryPreferences: [],
            flags: [],
            queuedPosts: []
        };

        try {
            // 解析 preferences.json (最重要的文件)
            if (files['preferences.json']) {
                console.log('🔧 解析 preferences.json');
                const prefs = JSON.parse(files['preferences.json']);

                data.preferences = prefs;
                data.userBadges = prefs.user_badges || [];
                data.badges = prefs.badges || [];
                data.users = prefs.users || [];
                data.user = prefs.user || {};

                console.log(`👤 用户信息: ${data.user.username} (ID: ${data.user.id})`);
                console.log(`🏆 徽章数量: ${data.userBadges.length} 个已获得, ${data.badges.length} 个可用`);
            }

            // 解析所有CSV文件
            await this.parseAllCSVFiles(files, data);

            console.log('✅ 数据解析完成');
            this.logDataSummary(data);

            return data;

        } catch (error) {
            console.error('❌ 数据解析失败:', error);
            throw new Error(`数据解析失败: ${error.message}`);
        }
    }

    /**
     * 解析所有CSV文件
     */
    async parseAllCSVFiles(files, data) {
        const csvMappings = [
            { file: 'user_archive.csv', target: 'userArchive', mapper: this.mapUserArchive },
            { file: 'visits.csv', target: 'visits', mapper: this.mapVisits },
            { file: 'likes.csv', target: 'likes', mapper: this.mapLikes },
            { file: 'badges.csv', target: 'badgesCsv', mapper: this.mapBadgesCsv },
            { file: 'auth_tokens.csv', target: 'authTokens', mapper: this.mapAuthTokens },
            { file: 'auth_token_logs.csv', target: 'authTokenLogs', mapper: this.mapAuthTokenLogs },
            { file: 'bookmarks.csv', target: 'bookmarks', mapper: this.mapBookmarks },
            { file: 'category_preferences.csv', target: 'categoryPreferences', mapper: this.mapCategoryPreferences },
            { file: 'flags.csv', target: 'flags', mapper: this.mapFlags },
            { file: 'queued_posts.csv', target: 'queuedPosts', mapper: this.mapQueuedPosts }
        ];

        for (const { file, target, mapper } of csvMappings) {
            if (files[file]) {
                console.log(`📊 解析 ${file}`);
                try {
                    data[target] = this.parseCSV(files[file], mapper.bind(this), file);
                    console.log(`✅ ${file}: ${data[target].length} 条记录`);
                } catch (error) {
                    console.warn(`⚠️ ${file} 解析失败:`, error.message);
                    this.addWarning(`${file} 解析失败: ${error.message}`);
                    data[target] = [];
                }
            }
        }
    }

    /**
     * 解析CSV文件通用方法
     */
    parseCSV(csvContent, mapper, source = 'CSV') {
        const rows = this.parseCSVRows(csvContent);
        if (rows.length < 2) return [];

        const headers = rows[0].map(header => header.trim().replace(/^\ufeff/, ''));
        const result = [];
        const label = source || 'CSV';

        for (let i = 1; i < rows.length; i++) {
            const values = rows[i];

            // 跳过空行
            if (!values || values.every(value => value === '' || value === undefined)) {
                continue;
            if (values.length < headers.length) {
                this.addWarning(`${label} 第${i + 1}行: 列数量不足（${values.length}/${headers.length}），已跳过`);
                continue;
            }

            const row = {};
            headers.forEach((header, index) => {
                const rawValue = values[index] !== undefined ? values[index] : '';
                row[header] = typeof rawValue === 'string' ? rawValue.trim() : rawValue;
            });

            try {
                if (mapper) {
                    result.push(mapper(row));
                } else {
                    result.push(row);
                }
            } catch (error) {
                console.warn(`行 ${i + 1} 解析失败:`, error.message);
            }
        }

        return result;
    }

    /**
     * 逐字符解析CSV，支持多行文本和转义
     */
    parseCSVRows(csvContent) {
        const rows = [];
        let currentField = '';
        let currentRow = [];
        let inQuotes = false;

        const pushField = () => {
            currentRow.push(currentField);
            currentField = '';
        };

        const pushRow = () => {
            // 避免因末尾空行导致生成多余行
            if (currentRow.length > 0) {
                rows.push(currentRow);
            }
            currentRow = [];
        };

        for (let i = 0; i < csvContent.length; i++) {
            const char = csvContent[i];

            if (char === '"') {
                if (inQuotes && csvContent[i + 1] === '"') {
                    currentField += '"';
                    i++;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if ((char === '\n' || char === '\r') && !inQuotes) {
                pushField();
                pushRow();

                // 处理 Windows 风格换行
                if (char === '\r' && csvContent[i + 1] === '\n') {
                    i++;
                }
            } else if (char === ',' && !inQuotes) {
                pushField();
            } else {
                currentField += char;
            }
        }

        // 处理最后一个字段
        pushField();
        if (currentRow.length > 1 || (currentRow.length === 1 && currentRow[0] !== '')) {
            rows.push(currentRow);
        }

        return rows;
    }

    // ===== CSV映射函数 =====

    mapUserArchive(row) {
        return {
            topic_title: row.topic_title || '',
            categories: row.categories || '',
            is_pm: this.parseBoolean(row.is_pm, 'user_archive.is_pm'),
            post_raw: row.post_raw || '',
            post_cooked: row.post_cooked || '',
            like_count: this.parseInteger(row.like_count, 0, 'user_archive.like_count'),
            reply_count: this.parseInteger(row.reply_count, 0, 'user_archive.reply_count'),
            url: row.url || '',
            created_at: this.normalizeDateTime(row.created_at, 'user_archive.created_at')
        };
    }

    mapVisits(row) {
        const visitedAt = this.normalizeDateTime(row.visited_at, 'visits.visited_at');
        return {
            visited_at: visitedAt || (row.visited_at || ''),
            posts_read: this.parseInteger(row.posts_read, 0, 'visits.posts_read'),
            mobile: this.parseBoolean(row.mobile, 'visits.mobile'),
            time_read: this.parseInteger(row.time_read, 0, 'visits.time_read')
        };
    }

    mapLikes(row) {
        return {
            id: this.parseInteger(row.id, null, 'likes.id'),
            post_id: this.parseInteger(row.post_id, null, 'likes.post_id'),
            topic_id: this.parseInteger(row.topic_id, null, 'likes.topic_id'),
            post_number: this.parseInteger(row.post_number, null, 'likes.post_number'),
            created_at: this.normalizeDateTime(row.created_at, 'likes.created_at'),
            updated_at: this.normalizeDateTime(row.updated_at, 'likes.updated_at'),
            deleted_at: this.normalizeDateTime(row.deleted_at, 'likes.deleted_at') || null,
            deleted_by: row.deleted_by || null
        };
    }

    mapBadgesCsv(row) {
        return {
            badge_id: this.parseInteger(row.badge_id, null, 'badges.badge_id'),
            badge_name: row.badge_name || '',
            granted_at: this.normalizeDateTime(row.granted_at, 'badges.granted_at'),
            post_id: row.post_id ? this.parseInteger(row.post_id, null, 'badges.post_id') : null,
            seq: this.parseInteger(row.seq, 0, 'badges.seq'),
            granted_manually: this.parseBoolean(row.granted_manually, 'badges.granted_manually'),
            notification_id: row.notification_id ? this.parseInteger(row.notification_id, null, 'badges.notification_id') : null,
            featured_rank: row.featured_rank ? this.parseInteger(row.featured_rank, null, 'badges.featured_rank') : null
        };
    }

    mapAuthTokens(row) {
        return {
            id: this.parseInteger(row.id, null, 'auth_tokens.id'),
            auth_token_hash: row.auth_token_hash || '',
            prev_auth_token_hash: row.prev_auth_token_hash || '',
            auth_token_seen: this.parseBoolean(row.auth_token_seen, 'auth_tokens.auth_token_seen'),
            client_ip: row.client_ip || '',
            user_agent: row.user_agent || '',
            seen_at: this.normalizeDateTime(row.seen_at, 'auth_tokens.seen_at'),
            rotated_at: this.normalizeDateTime(row.rotated_at, 'auth_tokens.rotated_at'),
            created_at: this.normalizeDateTime(row.created_at, 'auth_tokens.created_at'),
            updated_at: this.normalizeDateTime(row.updated_at, 'auth_tokens.updated_at')
        };
    }

    mapAuthTokenLogs(row) {
        return {
            id: this.parseInteger(row.id, null, 'auth_token_logs.id'),
            action: row.action || '',
            user_auth_token_id: this.parseInteger(row.user_auth_token_id, null, 'auth_token_logs.user_auth_token_id'),
            client_ip: row.client_ip || '',
            auth_token_hash: row.auth_token_hash || '',
            created_at: this.normalizeDateTime(row.created_at, 'auth_token_logs.created_at'),
            path: row.path || '',
            user_agent: row.user_agent || ''
        };
    }

    mapBookmarks(row) {
        return {
            bookmarkable_id: this.parseInteger(row.bookmarkable_id, null, 'bookmarks.bookmarkable_id'),
            bookmarkable_type: row.bookmarkable_type || '',
            link: row.link || '',
            name: row.name || '',
            created_at: this.normalizeDateTime(row.created_at, 'bookmarks.created_at'),
            updated_at: this.normalizeDateTime(row.updated_at, 'bookmarks.updated_at'),
            reminder_at: this.normalizeDateTime(row.reminder_at, 'bookmarks.reminder_at') || null,
            reminder_last_sent_at: this.normalizeDateTime(row.reminder_last_sent_at, 'bookmarks.reminder_last_sent_at') || null,
            reminder_set_at: this.normalizeDateTime(row.reminder_set_at, 'bookmarks.reminder_set_at') || null,
            auto_delete_preference: row.auto_delete_preference || ''
        };
    }

    mapCategoryPreferences(row) {
        return {
            category_id: this.parseInteger(row.category_id, null, 'category_preferences.category_id'),
            category_names: row.category_names || '',
            notification_level: this.parseInteger(row.notification_level, null, 'category_preferences.notification_level'),
            dismiss_new_timestamp: this.normalizeDateTime(row.dismiss_new_timestamp, 'category_preferences.dismiss_new_timestamp') || null
        };
    }

    mapFlags(row) {
        return {
            id: this.parseInteger(row.id, null, 'flags.id'),
            post_id: this.parseInteger(row.post_id, null, 'flags.post_id'),
            flag_type: row.flag_type || '',
            created_at: this.normalizeDateTime(row.created_at, 'flags.created_at'),
            updated_at: this.normalizeDateTime(row.updated_at, 'flags.updated_at'),
            deleted_at: this.normalizeDateTime(row.deleted_at, 'flags.deleted_at') || null,
            deleted_by: row.deleted_by || null,
            related_post_id: this.parseInteger(row.related_post_id, null, 'flags.related_post_id'),
            targets_topic: this.parseBoolean(row.targets_topic, 'flags.targets_topic'),
            was_take_action: this.parseBoolean(row.was_take_action, 'flags.was_take_action')
        };
    }

    mapQueuedPosts(row) {
        return {
            id: this.parseInteger(row.id, null, 'queued_posts.id'),
            verdict: row.verdict || '',
            category_id: this.parseInteger(row.category_id, null, 'queued_posts.category_id'),
            topic_id: this.parseInteger(row.topic_id, null, 'queued_posts.topic_id'),
            post_raw: row.post_raw || '',
            other_json: row.other_json || ''
        };
    }

    /**
     * 识别数据来源平台
     */
    detectPlatform(data) {
        const hostCounts = new Map();

        const collectFromUrl = (url) => {
            if (!url || typeof url !== 'string') return;
            try {
                const parsed = new URL(url);
                const normalized = this.normalizeHost(parsed.hostname);
                if (!normalized) return;
                hostCounts.set(normalized, (hostCounts.get(normalized) || 0) + 1);
            } catch (_) {
                // 忽略无法解析的链接
            }
        };

        const collectFromText = (text) => {
            if (!text || typeof text !== 'string') return;
            const matches = text.match(/https?:\/\/[\w.-]+[^\s"'>)]+/g);
            if (!matches) return;
            matches.forEach(collectFromUrl);
        };

        if (Array.isArray(data.userArchive)) {
            data.userArchive.forEach(post => {
                collectFromUrl(post?.url);
                collectFromText(post?.post_cooked);
                collectFromText(post?.post_raw);
            });
        }

        if (Array.isArray(data.bookmarks)) {
            data.bookmarks.forEach(bookmark => collectFromUrl(bookmark?.link));
        }

        if (Array.isArray(data.badges)) {
            data.badges.forEach(badge => collectFromUrl(badge?.image_url));
        }

        const avatarCandidates = [data.user?.avatar_template, data.user?.custom_avatar_template];
        avatarCandidates.forEach(candidate => {
            if (candidate && typeof candidate === 'string' && candidate.startsWith('http')) {
                collectFromUrl(candidate);
            }
        });

        let primaryDomain = null;
        if (hostCounts.size > 0) {
            const sortedHosts = Array.from(hostCounts.entries()).sort((a, b) => b[1] - a[1]);
            primaryDomain = sortedHosts[0][0];
        }

        if (!primaryDomain) {
            this.addWarning('未检测到任何平台域名信息，已标记为未知平台');
            return {
                ...this.unknownPlatform,
                detectedHosts: []
            };
        }

        const normalizedDomain = this.normalizeHost(primaryDomain);
        let basePlatform = this.platformCatalog[normalizedDomain];

        if (!basePlatform) {
            this.addWarning(`未识别的平台域名 "${primaryDomain}"，请确认导出来源`);
            basePlatform = {
                id: normalizedDomain ? normalizedDomain.replace(/\./g, '-') : 'unknown',
                displayName: primaryDomain,
                domain: normalizedDomain || null,
                baseUrl: normalizedDomain ? `https://${normalizedDomain}` : '',
                accentColor: this.defaultPlatform.accentColor
            };
        }

        return {
            ...basePlatform,
            detectedHosts: Array.from(hostCounts.entries())
                .map(([host, count]) => ({ host, count }))
                .sort((a, b) => b.count - a.count)
        };
    }

    /**
     * 规范化域名
     */
    normalizeHost(hostname) {
        if (!hostname || typeof hostname !== 'string') return '';
        let normalized = hostname.toLowerCase().trim();
        if (normalized.startsWith('www.')) {
            normalized = normalized.slice(4);
        }

        if (this.platformCatalog[normalized]) {
            return normalized;
        }

        const parts = normalized.split('.');
        if (parts.length > 2) {
            const candidate = parts.slice(parts.length - 2).join('.');
            return candidate;
        }

        return normalized;
    }

    /**
     * 记录数据摘要
     */
    logDataSummary(data) {
        console.log('\n📊 数据解析摘要:');
        console.log(`👤 用户: ${data.user.username} (${data.user.name})`);
        console.log(`📝 发帖: ${data.userArchive.length} 篇`);
        console.log(`👍 点赞: ${data.likes.length} 个`);
        console.log(`🏆 徽章: ${data.userBadges.length} 个`);
        console.log(`📅 访问: ${data.visits.length} 天`);
        console.log(`🔒 认证令牌: ${data.authTokens.length} 个`);
        console.log(`📑 书签: ${data.bookmarks.length} 个`);
        console.log(`🏷️ 分类偏好: ${data.categoryPreferences.length} 个`);

        if (data.authTokenLogs.length > 0) {
            console.log(`📋 令牌日志: ${data.authTokenLogs.length} 条`);
        }
        if (data.flags.length > 0) {
            console.log(`🚩 举报: ${data.flags.length} 个`);
        }
        if (data.queuedPosts.length > 0) {
            console.log(`⏳ 待审核帖子: ${data.queuedPosts.length} 个`);
        }
    }

    /**
     * 格式化文件大小
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    parseBoolean(value, context = 'boolean') {
        if (typeof value === 'boolean') return value;
        if (value === null || value === undefined) return false;

        const normalized = String(value).trim().toLowerCase();
        if (normalized === '') return false;

        const truthy = ['true', 't', '1', 'yes', 'y', '是', 'on', '真'];
        const falsy = ['false', 'f', '0', 'no', 'n', '否', 'off'];

        if (truthy.includes(normalized)) {
            return true;
        }
        if (falsy.includes(normalized)) {
            return false;
        }

        this.addWarning(`${context}: 未识别的布尔值 "${value}", 已按 false 处理`);
        return false;
    }

    parseInteger(value, fallback = null, context = 'integer') {
        if (value === null || value === undefined) {
            return fallback;
        }
        const normalized = String(value).trim();
        if (normalized === '') {
            return fallback;
        }
        const number = parseInt(normalized, 10);
        if (Number.isNaN(number)) {
            this.addWarning(`${context}: 无法解析数值 "${value}"`);
            return fallback;
        }
        return number;
    }

    normalizeDateTime(value, context = 'datetime') {
        if (value === null || value === undefined) return null;
        const raw = String(value).trim();
        if (raw === '') return null;

        let candidate = raw;

        if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2} UTC$/i.test(raw)) {
            candidate = raw.replace(' UTC', 'Z').replace(' ', 'T');
        } else if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(raw)) {
            candidate = `${raw.replace(' ', 'T')}Z`;
        } else if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
            candidate = `${raw}T00:00:00Z`;
        } else if (/^\d{4}\/\d{2}\/\d{2}$/.test(raw)) {
            candidate = `${raw.replace(/\//g, '-')}T00:00:00Z`;
        }

        let parsed = new Date(candidate);
        if (Number.isNaN(parsed.getTime())) {
            parsed = new Date(raw);
        }

        if (!Number.isNaN(parsed.getTime())) {
            return parsed.toISOString();
        }

        this.addWarning(`${context}: 未识别的时间格式 "${value}"`);
        return null;
    }
}

// 导出为全局变量
window.ZipParser = ZipParser;
