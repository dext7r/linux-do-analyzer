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
            const zip = new JSZip();
            const zipData = await zip.loadAsync(file);

            const files = {};
            const fileList = [];

            // 提取所有文件
            for (const [filename, fileObj] of Object.entries(zipData.files)) {
                if (!fileObj.dir) {
                    console.log(`📄 提取文件: ${filename}`);
                    const content = await fileObj.async('text');

                    // 获取文件名（去除路径）
                    const basename = filename.split('/').pop();

                    // 同时保存完整路径和基础文件名的映射
                    files[filename] = content;
                    files[basename] = content;

                    fileList.push({
                        name: filename,
                        basename: basename,
                        size: content.length,
                        isRequired: this.supportedFiles.required.includes(basename),
                        isOptional: this.supportedFiles.optional.includes(basename)
                    });
                }
            }

            console.log(`✅ 提取完成，共 ${fileList.length} 个文件`);

            // 验证必需文件
            this.validateRequiredFiles(files);

            // 解析数据
            const parsedData = await this.parseAllData(files);

            return {
                ...parsedData,
                metadata: {
                    fileName: file.name,
                    fileSize: file.size,
                    processedAt: new Date().toISOString(),
                    fileList,
                    totalFiles: fileList.length,
                    supportedFiles: fileList.filter(f => f.isRequired || f.isOptional).length
                }
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
                    data[target] = this.parseCSV(files[file], mapper.bind(this));
                    console.log(`✅ ${file}: ${data[target].length} 条记录`);
                } catch (error) {
                    console.warn(`⚠️ ${file} 解析失败:`, error.message);
                    data[target] = [];
                }
            }
        }
    }

    /**
     * 解析CSV文件通用方法
     */
    parseCSV(csvContent, mapper) {
        const lines = csvContent.trim().split('\n');
        if (lines.length < 2) return [];

        const headers = this.parseCSVLine(lines[0]);
        const result = [];

        for (let i = 1; i < lines.length; i++) {
            const values = this.parseCSVLine(lines[i]);
            if (values.length >= headers.length) {
                const row = {};
                headers.forEach((header, index) => {
                    row[header.trim()] = (values[index] || '').trim();
                });

                try {
                    if (mapper) {
                        result.push(mapper(row));
                    } else {
                        result.push(row);
                    }
                } catch (error) {
                    console.warn(`行 ${i+1} 解析失败:`, error.message);
                }
            }
        }

        return result;
    }

    /**
     * 解析CSV行 (处理引号和逗号)
     */
    parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;
        let i = 0;

        while (i < line.length) {
            const char = line[i];

            if (char === '"') {
                if (inQuotes && line[i + 1] === '"') {
                    current += '"';
                    i += 2;
                } else {
                    inQuotes = !inQuotes;
                    i++;
                }
            } else if (char === ',' && !inQuotes) {
                result.push(current);
                current = '';
                i++;
            } else {
                current += char;
                i++;
            }
        }

        result.push(current);
        return result;
    }

    // ===== CSV映射函数 =====

    mapUserArchive(row) {
        return {
            topic_title: row.topic_title || '',
            categories: row.categories || '',
            is_pm: row.is_pm === '是' || row.is_pm === 'true',
            post_raw: row.post_raw || '',
            post_cooked: row.post_cooked || '',
            like_count: parseInt(row.like_count) || 0,
            reply_count: parseInt(row.reply_count) || 0,
            url: row.url || '',
            created_at: row.created_at || ''
        };
    }

    mapVisits(row) {
        return {
            visited_at: row.visited_at || '',
            posts_read: parseInt(row.posts_read) || 0,
            mobile: row.mobile === 'true',
            time_read: parseInt(row.time_read) || 0
        };
    }

    mapLikes(row) {
        return {
            id: parseInt(row.id) || 0,
            post_id: parseInt(row.post_id) || 0,
            topic_id: parseInt(row.topic_id) || 0,
            post_number: parseInt(row.post_number) || 0,
            created_at: row.created_at || '',
            updated_at: row.updated_at || '',
            deleted_at: row.deleted_at || null,
            deleted_by: row.deleted_by || null
        };
    }

    mapBadgesCsv(row) {
        return {
            badge_id: parseInt(row.badge_id) || 0,
            badge_name: row.badge_name || '',
            granted_at: row.granted_at || '',
            post_id: row.post_id ? parseInt(row.post_id) : null,
            seq: parseInt(row.seq) || 0,
            granted_manually: row.granted_manually === 'true',
            notification_id: row.notification_id ? parseInt(row.notification_id) : null,
            featured_rank: row.featured_rank ? parseInt(row.featured_rank) : null
        };
    }

    mapAuthTokens(row) {
        return {
            id: parseInt(row.id) || 0,
            auth_token_hash: row.auth_token_hash || '',
            prev_auth_token_hash: row.prev_auth_token_hash || '',
            auth_token_seen: row.auth_token_seen === 'true',
            client_ip: row.client_ip || '',
            user_agent: row.user_agent || '',
            seen_at: row.seen_at || '',
            rotated_at: row.rotated_at || '',
            created_at: row.created_at || '',
            updated_at: row.updated_at || ''
        };
    }

    mapAuthTokenLogs(row) {
        return {
            id: parseInt(row.id) || 0,
            action: row.action || '',
            user_auth_token_id: parseInt(row.user_auth_token_id) || 0,
            client_ip: row.client_ip || '',
            auth_token_hash: row.auth_token_hash || '',
            created_at: row.created_at || '',
            path: row.path || '',
            user_agent: row.user_agent || ''
        };
    }

    mapBookmarks(row) {
        return {
            bookmarkable_id: parseInt(row.bookmarkable_id) || 0,
            bookmarkable_type: row.bookmarkable_type || '',
            link: row.link || '',
            name: row.name || '',
            created_at: row.created_at || '',
            updated_at: row.updated_at || '',
            reminder_at: row.reminder_at || null,
            reminder_last_sent_at: row.reminder_last_sent_at || null,
            reminder_set_at: row.reminder_set_at || null,
            auto_delete_preference: parseInt(row.auto_delete_preference) || 0
        };
    }

    mapCategoryPreferences(row) {
        return {
            category_id: parseInt(row.category_id) || 0,
            category_names: row.category_names || '',
            notification_level: parseInt(row.notification_level) || 0,
            dismiss_new_timestamp: row.dismiss_new_timestamp || null
        };
    }

    mapFlags(row) {
        return {
            id: parseInt(row.id) || 0,
            post_id: parseInt(row.post_id) || 0,
            flag_type: row.flag_type || '',
            created_at: row.created_at || '',
            updated_at: row.updated_at || '',
            deleted_at: row.deleted_at || null,
            deleted_by: row.deleted_by || null,
            related_post_id: parseInt(row.related_post_id) || null,
            targets_topic: row.targets_topic === 'true',
            was_take_action: row.was_take_action === 'true'
        };
    }

    mapQueuedPosts(row) {
        return {
            id: parseInt(row.id) || 0,
            verdict: row.verdict || '',
            category_id: parseInt(row.category_id) || 0,
            topic_id: parseInt(row.topic_id) || 0,
            post_raw: row.post_raw || '',
            other_json: row.other_json || ''
        };
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
}

// 导出为全局变量
window.ZipParser = ZipParser;