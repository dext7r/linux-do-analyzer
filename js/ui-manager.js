/**
 * UI管理器 - 完整版
 * 负责界面交互、状态管理和用户体验
 * 支持所有新的数据展示功能
 */
class UIManager {
    constructor() {
        this.$ = $; // jQuery引用
        this.toastContainer = $('#toastContainer');
        this.loadingOverlay = $('#loadingOverlay');
        this.progressContainer = $('#progressContainer');
        this.progressBar = $('#progressBar');
        this.progressText = $('#progressText');
        this.statusContainer = $('#statusContainer');
        this.statusMessage = $('#statusMessage');

        this.toastQueue = [];
        this.isInitialized = false;
        this.currentTabData = null;
        this.activeTab = 'userArchive';

        // 分页状态
        this.pagination = {
            currentPage: 1,
            pageSize: 50,
            totalItems: 0,
            searchQuery: ''
        };
    }

    /**
     * 初始化UI管理器
     */
    init() {
        if (this.isInitialized) return;

        console.log('初始化UI管理器');
        this.bindEvents();
        this.setupDragAndDrop();
        this.setupTabNavigation();
        this.setupMobileOptimizations();
        this.setupThemeSystem();
        this.isInitialized = true;
    }

    /**
     * 绑定事件处理器
     */
    bindEvents() {
        // 文件选择按钮
        $('#selectFileBtn').on('click', () => {
            $('#fileInput').click();
        });

        // 上传区域点击
        $('#uploadArea').on('click', (e) => {
            if (e.target.id !== 'selectFileBtn') {
                $('#fileInput').click();
            }
        });

        // 导出按钮
        $('#exportBtn').on('click', () => {
            window.app?.exportCurrentAnalysis();
        });

        // 查看已存储数据按钮
        $('#viewStoredBtn').on('click', () => {
            window.app?.loadStoredData();
        });

        // 清空数据按钮
        $('#clearDataBtn').on('click', () => {
            this.showConfirmDialog(
                '确定要清空所有数据吗？',
                '此操作不可撤销！',
                () => window.app?.clearAllData()
            );
        });

        // 帮助按钮
        $('#helpBtn').on('click', () => {
            this.showHelpModal();
        });

        // 关闭帮助按钮
        $('#closeHelpBtn').on('click', () => {
            this.hideHelpModal();
        });

        // 点击模态框外部关闭
        $('#helpModal').on('click', (e) => {
            if (e.target.id === 'helpModal') {
                this.hideHelpModal();
            }
        });

        // 键盘快捷键
        $(document).on('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });

        // 按钮点击反馈效果
        $(document).on('mousedown', 'button, .tab-button, .pagination-btn', (e) => {
            $(e.currentTarget).addClass('btn-press');
        });

        $(document).on('mouseup mouseleave', 'button, .tab-button, .pagination-btn', (e) => {
            $(e.currentTarget).removeClass('btn-press');
        });

        console.log('事件绑定完成');
    }

    /**
     * 绑定分页事件
     */
    bindPaginationEvents() {
        // 搜索框
        $(document).on('input', '#searchInput', (e) => {
            this.pagination.searchQuery = e.target.value;
            this.pagination.currentPage = 1;
            this.renderTabContent(this.activeTab);
        });

        // 页面大小选择
        $(document).on('change', '#pageSizeSelect', (e) => {
            this.pagination.pageSize = parseInt(e.target.value);
            this.pagination.currentPage = 1;
            this.renderTabContent(this.activeTab);
        });

        // 分页按钮（使用事件委托）
        $(document).on('click', '.pagination-btn', (e) => {
            const action = $(e.currentTarget).data('action');
            this.handlePaginationAction(action);
        });
    }

    /**
     * 处理分页操作
     */
    handlePaginationAction(action) {
        const totalPages = Math.ceil(this.pagination.totalItems / this.pagination.pageSize);

        switch (action) {
            case 'first':
                this.pagination.currentPage = 1;
                break;
            case 'prev':
                this.pagination.currentPage = Math.max(1, this.pagination.currentPage - 1);
                break;
            case 'next':
                this.pagination.currentPage = Math.min(totalPages, this.pagination.currentPage + 1);
                break;
            case 'last':
                this.pagination.currentPage = totalPages;
                break;
            default:
                // 数字页面
                const page = parseInt(action);
                if (page >= 1 && page <= totalPages) {
                    this.pagination.currentPage = page;
                }
        }

        this.renderTabContent(this.activeTab);
    }

    /**
     * 重置分页状态
     */
    resetPagination() {
        this.pagination.currentPage = 1;
        this.pagination.searchQuery = '';
        // 不能在这里重置搜索框，因为可能还没有渲染
    }

    /**
     * 设置移动端优化
     */
    setupMobileOptimizations() {
        // 检测移动设备
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        if (isMobile) {
            // 移动端特殊处理
            document.body.classList.add('mobile-device');

            // 禁用双击缩放（对于数据表格更友好）
            let lastTouchEnd = 0;
            $(document).on('touchend', (e) => {
                const now = (new Date()).getTime();
                if (now - lastTouchEnd <= 300) {
                    e.preventDefault();
                }
                lastTouchEnd = now;
            });

            // 移动端滑动优化
            this.setupMobileSwipeGestures();
        }

        // 响应式字体大小调整
        this.adjustFontSizeForDevice();

        // 监听屏幕方向变化
        $(window).on('orientationchange resize', () => {
            setTimeout(() => {
                this.handleScreenSizeChange();
            }, 100);
        });
    }

    /**
     * 设置移动端滑动手势
     */
    setupMobileSwipeGestures() {
        let startX = 0;
        let startY = 0;

        $(document).on('touchstart', '.pagination-area', (e) => {
            startX = e.originalEvent.touches[0].clientX;
            startY = e.originalEvent.touches[0].clientY;
        });

        $(document).on('touchend', '.pagination-area', (e) => {
            if (!startX || !startY) return;

            const endX = e.originalEvent.changedTouches[0].clientX;
            const endY = e.originalEvent.changedTouches[0].clientY;

            const deltaX = startX - endX;
            const deltaY = startY - endY;

            // 水平滑动距离大于垂直滑动距离，且滑动距离足够
            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
                if (deltaX > 0) {
                    // 向左滑动 - 下一页
                    this.handlePaginationAction('next');
                } else {
                    // 向右滑动 - 上一页
                    this.handlePaginationAction('prev');
                }
            }

            startX = 0;
            startY = 0;
        });
    }

    /**
     * 调整字体大小适应设备
     */
    adjustFontSizeForDevice() {
        const screenWidth = $(window).width();

        if (screenWidth < 480) {
            // 小屏手机
            document.documentElement.style.fontSize = '14px';
        } else if (screenWidth < 768) {
            // 大屏手机/小平板
            document.documentElement.style.fontSize = '15px';
        } else {
            // 桌面/大平板
            document.documentElement.style.fontSize = '16px';
        }
    }

    /**
     * 处理屏幕尺寸变化
     */
    handleScreenSizeChange() {
        this.adjustFontSizeForDevice();

        // 重新渲染当前标签页以适应新的屏幕尺寸
        if (this.currentTabData && this.activeTab) {
            this.renderTabContent(this.activeTab);
        }

        // 调整图表大小
        if (window.app && window.app.chartRenderer) {
            // 延迟调整以确保DOM已更新
            setTimeout(() => {
                window.app.chartRenderer.resizeAllCharts();
            }, 200);
        }
    }

    /**
     * 设置主题系统
     */
    setupThemeSystem() {
        // 从本地存储获取保存的主题，默认为苹果主题
        const savedTheme = localStorage.getItem('app-theme') || 'apple';
        this.setTheme(savedTheme, false);

        // 绑定主题切换事件 - 支持新的select元素
        $('#themeSelector').on('change', (e) => {
            const theme = e.target.value;
            this.setTheme(theme, true);
        });

        // 兼容原有的按钮方式
        $('.theme-btn').on('click', (e) => {
            const theme = $(e.currentTarget).data('theme');
            this.setTheme(theme, true);
        });

        console.log('主题系统设置完成');
    }

    /**
     * 设置主题
     */
    setTheme(theme, animate = true) {
        // 移除之前的主题
        document.documentElement.removeAttribute('data-theme');

        // 设置新主题
        if (theme !== 'apple') {
            document.documentElement.setAttribute('data-theme', theme);
        }

        // 更新选择器状态
        $('#themeSelector').val(theme);

        // 更新主题按钮状态（如果存在）
        $('.theme-btn').removeClass('active');
        $(`.theme-btn[data-theme="${theme}"]`).addClass('active');

        // 保存到本地存储
        localStorage.setItem('app-theme', theme);

        // 如果需要动画效果
        if (animate) {
            // 添加切换动画
            document.body.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';

            // 显示主题切换提示
            this.showToast(`已切换到${this.getThemeName(theme)}主题`, 'success');

            // 重新渲染图表以适应新主题
            setTimeout(() => {
                if (window.app && window.app.chartRenderer) {
                    this.updateChartsForTheme(theme);
                }
            }, 300);
        }

        console.log(`主题已切换到: ${theme}`);
    }

    /**
     * 获取主题显示名称
     */
    getThemeName(theme) {
        const names = {
            apple: '苹果',
            xiaomi: '小米',
            huawei: '华为'
        };
        return names[theme] || theme;
    }

    /**
     * 为新主题更新图表样式
     */
    updateChartsForTheme(theme) {
        if (!window.app || !window.app.chartRenderer) return;

        const themeColors = this.getThemeColors(theme);

        // 更新所有现有图表的颜色
        window.app.chartRenderer.charts.forEach((chart, id) => {
            this.updateChartColors(chart, themeColors);
        });
    }

    /**
     * 获取主题颜色配置
     */
    getThemeColors(theme) {
        const colors = {
            apple: {
                primary: '#007AFF',
                secondary: '#5856D6',
                accent: '#FF2D92',
                success: '#30D158',
                warning: '#FF9500',
                gradients: ['#007AFF', '#5856D6', '#FF2D92', '#30D158', '#FF9500']
            },
            xiaomi: {
                primary: '#FF6900',
                secondary: '#FFB800',
                accent: '#FF4081',
                success: '#4CAF50',
                warning: '#FF9800',
                gradients: ['#FF6900', '#FFB800', '#FF4081', '#4CAF50', '#FF9800']
            },
            huawei: {
                primary: '#C5282F',
                secondary: '#2D3748',
                accent: '#E53E3E',
                success: '#38A169',
                warning: '#D69E2E',
                gradients: ['#C5282F', '#2D3748', '#E53E3E', '#38A169', '#D69E2E']
            }
        };
        return colors[theme] || colors.apple;
    }

    /**
     * 更新单个图表的颜色
     */
    updateChartColors(chart, themeColors) {
        if (!chart || !chart.data) return;

        try {
            // 更新数据集颜色
            chart.data.datasets.forEach((dataset, index) => {
                const colorIndex = index % themeColors.gradients.length;
                const color = themeColors.gradients[colorIndex];

                if (dataset.backgroundColor) {
                    if (Array.isArray(dataset.backgroundColor)) {
                        dataset.backgroundColor = dataset.backgroundColor.map(() =>
                            color.replace('#', 'rgba(').replace('#', '').match(/.{2}/g).map(hex => parseInt(hex, 16)).join(', ') + ', 0.8)'
                        );
                    } else {
                        dataset.backgroundColor = color + '80'; // 50% 透明度
                    }
                }

                if (dataset.borderColor) {
                    dataset.borderColor = color;
                }
            });

            // 更新图表
            chart.update('resize');
        } catch (error) {
            console.warn('更新图表颜色失败:', error);
        }
    }

    /**
     * 设置标签页导航
     */
    setupTabNavigation() {
        $('#dataTableTabs').on('click', '.tab-button', (e) => {
            const $button = $(e.currentTarget);
            const tabName = $button.data('tab');

            // 更新活动状态
            $('.tab-button').removeClass('active');
            $button.addClass('active');

            // 切换内容
            this.activeTab = tabName;
            this.resetPagination();
            this.renderTabContent(tabName);
        });

        // 绑定分页控件事件
        this.bindPaginationEvents();
    }

    /**
     * 设置拖拽上传
     */
    setupDragAndDrop() {
        const uploadArea = $('#uploadArea');

        uploadArea.on('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
            uploadArea.addClass('drag-over');
        });

        uploadArea.on('dragleave', (e) => {
            e.preventDefault();
            e.stopPropagation();
            uploadArea.removeClass('drag-over');
        });

        uploadArea.on('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
            uploadArea.removeClass('drag-over');

            const files = e.originalEvent.dataTransfer.files;
            if (files.length > 0) {
                window.app?.processFile(files[0]);
            }
        });

        console.log('拖拽上传设置完成');
    }

    /**
     * 处理键盘快捷键
     */
    handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + O: 打开文件
        if ((e.ctrlKey || e.metaKey) && e.key === 'o') {
            e.preventDefault();
            $('#fileInput').click();
        }

        // Ctrl/Cmd + E: 导出数据
        if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
            e.preventDefault();
            window.app?.exportCurrentAnalysis();
        }

        // Escape: 关闭模态框或覆盖层
        if (e.key === 'Escape') {
            this.hideLoading();
            this.hideAllToasts();
        }
    }

    /**
     * 显示进度条
     */
    showProgress(percent = 0, text = '处理中...') {
        this.progressContainer.removeClass('hidden');
        this.progressBar.css('width', `${percent}%`);
        this.progressText.text(text);

        if (percent > 0) {
            this.progressBar.addClass('progress-bar-animated');
        }
    }

    /**
     * 隐藏进度条
     */
    hideProgress() {
        this.progressContainer.addClass('hidden');
        this.progressBar.removeClass('progress-bar-animated');
    }

    /**
     * 更新进度
     */
    updateProgress(percent, text) {
        this.progressBar.css('width', `${percent}%`);
        if (text) {
            this.progressText.text(text);
        }
    }

    /**
     * 显示状态消息
     */
    showStatus(message, type = 'info', duration = 5000) {
        this.statusContainer.removeClass('hidden');

        // 移除之前的样式类
        this.statusMessage.removeClass('bg-green-100 text-green-800 border-green-200');
        this.statusMessage.removeClass('bg-red-100 text-red-800 border-red-200');
        this.statusMessage.removeClass('bg-blue-100 text-blue-800 border-blue-200');
        this.statusMessage.removeClass('bg-yellow-100 text-yellow-800 border-yellow-200');

        // 应用新的样式类
        switch (type) {
            case 'success':
                this.statusMessage.addClass('bg-green-100 text-green-800 border-green-200');
                break;
            case 'error':
                this.statusMessage.addClass('bg-red-100 text-red-800 border-red-200');
                break;
            case 'warning':
                this.statusMessage.addClass('bg-yellow-100 text-yellow-800 border-yellow-200');
                break;
            default:
                this.statusMessage.addClass('bg-blue-100 text-blue-800 border-blue-200');
        }

        this.statusMessage.text(message);

        // 自动隐藏
        if (duration > 0) {
            setTimeout(() => {
                this.hideStatus();
            }, duration);
        }
    }

    /**
     * 隐藏状态消息
     */
    hideStatus() {
        this.statusContainer.addClass('hidden');
    }

    /**
     * 显示加载覆盖层
     */
    showLoading(text = '处理中...') {
        this.loadingOverlay.find('span').text(text);
        this.loadingOverlay.removeClass('hidden');
    }

    /**
     * 隐藏加载覆盖层
     */
    hideLoading() {
        this.loadingOverlay.addClass('hidden');
    }

    /**
     * 显示Toast通知
     */
    showToast(message, type = 'info', duration = 4000) {
        const toast = this.createToast(message, type);
        this.toastContainer.append(toast);

        // 触发入场动画
        setTimeout(() => {
            toast.addClass('toast-enter-active').removeClass('toast-enter');
        }, 10);

        // 自动移除
        setTimeout(() => {
            this.removeToast(toast);
        }, duration);

        this.toastQueue.push(toast);

        // 限制Toast数量
        if (this.toastQueue.length > 3) {
            this.removeToast(this.toastQueue.shift());
        }
    }

    /**
     * 创建Toast元素
     */
    createToast(message, type) {
        const iconMap = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };

        const colorMap = {
            success: 'bg-green-500',
            error: 'bg-red-500',
            warning: 'bg-yellow-500',
            info: 'bg-blue-500'
        };

        const toast = $(`
            <div class="toast-enter ${colorMap[type]} text-white px-6 py-4 rounded-lg shadow-lg mb-2 max-w-sm">
                <div class="flex items-center">
                    <span class="text-xl mr-3">${iconMap[type]}</span>
                    <span class="flex-1">${message}</span>
                    <button class="ml-3 text-white hover:text-gray-200 font-bold text-lg leading-none" onclick="$(this).parent().parent().remove()">×</button>
                </div>
            </div>
        `);

        return toast;
    }

    /**
     * 移除Toast
     */
    removeToast(toast) {
        if (toast && toast.length) {
            toast.addClass('toast-exit-active').removeClass('toast-enter-active');
            setTimeout(() => {
                toast.remove();
            }, 300);

            // 从队列中移除
            const index = this.toastQueue.indexOf(toast);
            if (index > -1) {
                this.toastQueue.splice(index, 1);
            }
        }
    }

    /**
     * 隐藏所有Toast
     */
    hideAllToasts() {
        this.toastQueue.forEach(toast => this.removeToast(toast));
        this.toastQueue = [];
    }

    /**
     * 显示确认对话框
     */
    showConfirmDialog(title, message, onConfirm, onCancel) {
        if (confirm(`${title}\\n\\n${message}`)) {
            if (onConfirm) onConfirm();
        } else {
            if (onCancel) onCancel();
        }
    }

    /**
     * 显示帮助模态框
     */
    showHelpModal() {
        $('#helpModal').removeClass('hidden');
        // 防止页面滚动
        $('body').css('overflow', 'hidden');
    }

    /**
     * 隐藏帮助模态框
     */
    hideHelpModal() {
        $('#helpModal').addClass('hidden');
        // 恢复页面滚动
        $('body').css('overflow', 'auto');
    }

    /**
     * 渲染用户信息
     */
    renderUserInfo(userInfo) {
        const container = $('#userInfoContent');

        const formatValue = (value, type = 'text') => {
            if (value === null || value === undefined || value === '') return '未知';

            switch (type) {
                case 'date':
                    try {
                        return new Date(value).toLocaleDateString('zh-CN');
                    } catch {
                        return value;
                    }
                case 'time':
                    return Math.round(value / 3600) + ' 小时';
                case 'boolean':
                    return value ? '是' : '否';
                default:
                    return value;
            }
        };

        const infoItems = [
            { label: '用户名', value: formatValue(userInfo.username), icon: '👤' },
            { label: '显示名称', value: formatValue(userInfo.name), icon: '📝' },
            { label: '用户ID', value: formatValue(userInfo.id), icon: '🔢' },
            { label: '信任等级', value: `TL${userInfo.trust_level}`, icon: '⭐' },
            { label: '加入时间', value: formatValue(userInfo.created_at, 'date'), icon: '📅' },
            { label: '总阅读时间', value: formatValue(userInfo.time_read, 'time'), icon: '📚' },
            { label: '访问天数', value: formatValue(userInfo.days_visited), icon: '🗓️' },
            { label: '阅读帖子数', value: formatValue(userInfo.posts_read_count), icon: '📖' },
            { label: '发帖数', value: formatValue(userInfo.post_count), icon: '✍️' },
            { label: '点赞给出', value: formatValue(userInfo.likes_given), icon: '👍' },
            { label: '点赞收到', value: formatValue(userInfo.likes_received), icon: '❤️' },
            { label: '进入主题数', value: formatValue(userInfo.topics_entered), icon: '🔍' },
            { label: '活跃状态', value: formatValue(userInfo.active, 'boolean'), icon: '🟢' },
            { label: '管理员', value: formatValue(userInfo.admin, 'boolean'), icon: '👑' },
            { label: '版主', value: formatValue(userInfo.moderator, 'boolean'), icon: '🛡️' },
            { label: '可编辑资料', value: formatValue(userInfo.can_edit, 'boolean'), icon: '✏️' }
        ];

        const html = infoItems.map(item => `
            <div class="user-info-item">
                <div class="user-info-label">
                    <span class="mr-2">${item.icon}</span>
                    ${item.label}
                </div>
                <div class="user-info-value">${item.value}</div>
            </div>
        `).join('');

        container.html(html);
    }

    /**
     * 渲染数据完整性
     */
    renderDataCompleteness(completeness) {
        const container = $('#dataCompletenessContent');

        const getScoreColor = (score) => {
            if (score >= 80) return 'bg-green-500';
            if (score >= 60) return 'bg-yellow-500';
            if (score >= 40) return 'bg-orange-500';
            return 'bg-red-500';
        };

        const html = `
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="text-center">
                    <div class="text-3xl font-bold text-gray-800 mb-2">${completeness.score}%</div>
                    <div class="text-sm text-gray-600 mb-4">数据完整性评分</div>
                    <div class="completeness-bar">
                        <div class="completeness-fill ${getScoreColor(completeness.score)}"
                             style="width: ${completeness.score}%"></div>
                    </div>
                </div>
                <div>
                    <h4 class="font-semibold text-green-700 mb-3">✅ 可用数据文件</h4>
                    <ul class="text-sm space-y-1">
                        ${completeness.available.map(file => `<li class="text-green-600">• ${file}</li>`).join('')}
                    </ul>
                </div>
                <div>
                    <h4 class="font-semibold text-red-700 mb-3">❌ 缺失数据文件</h4>
                    <ul class="text-sm space-y-1">
                        ${completeness.missing.length > 0 ?
                            completeness.missing.map(file => `<li class="text-red-600">• ${file}</li>`).join('') :
                            '<li class="text-gray-500">无缺失文件</li>'
                        }
                    </ul>
                </div>
            </div>
        `;

        container.html(html);
    }

    /**
     * 渲染摘要卡片 - 新版本支持更多数据
     */
    renderSummaryCards(summary) {
        const cardsContainer = $('#summaryCards');

        const cards = [
            { label: '总发帖数', value: summary.totalPosts, icon: '📝', color: 'from-blue-500 to-blue-600' },
            { label: '获得点赞', value: summary.totalLikes, icon: '👍', color: 'from-red-500 to-red-600' },
            { label: '获得徽章', value: summary.totalBadges, icon: '🏆', color: 'from-yellow-500 to-yellow-600' },
            { label: '总访问', value: summary.totalVisits, icon: '📊', color: 'from-green-500 to-green-600' },
            { label: '认证令牌', value: summary.authTokensCount, icon: '🔐', color: 'from-purple-500 to-purple-600' },
            { label: '书签数', value: summary.bookmarksCount, icon: '📑', color: 'from-indigo-500 to-indigo-600' },
            { label: '举报数', value: summary.flagsCount, icon: '🚩', color: 'from-pink-500 to-pink-600' },
            { label: '移动端使用', value: `${summary.mobileUsageRatio}%`, icon: '📱', color: 'from-teal-500 to-teal-600' }
        ];

        const cardHTML = cards.map(card => `
            <div class="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl
                        transition-all duration-300 transform hover:-translate-y-1 summary-card">
                <div class="text-center">
                    <div class="w-16 h-16 mx-auto mb-4 bg-gradient-to-r ${card.color} rounded-full
                                flex items-center justify-center text-white text-2xl">
                        ${card.icon}
                    </div>
                    <div class="text-2xl font-bold text-gray-800 mb-1">${card.value}</div>
                    <div class="text-sm text-gray-600">${card.label}</div>
                </div>
            </div>
        `).join('');

        cardsContainer.html(cardHTML);
    }

    /**
     * 渲染分类活动数据
     */
    renderCategoryData(categoryData) {
        const container = $('#categoryContent');

        if (!categoryData || categoryData.length === 0) {
            container.html(`
                <div class="text-center py-8 text-gray-500">
                    <div class="text-4xl mb-4">📂</div>
                    <p>暂无分类数据</p>
                </div>
            `);
            return;
        }

        const tableHTML = `
            <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>分类名称</th>
                            <th>发帖数</th>
                            <th>获得点赞</th>
                            <th>获得回复</th>
                            <th>平均点赞/帖</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${categoryData.map(cat => `
                            <tr>
                                <td class="font-medium">${cat.name}</td>
                                <td class="text-blue-600 font-semibold">${cat.posts}</td>
                                <td class="text-red-500 font-semibold">${cat.likes}</td>
                                <td class="text-green-600 font-semibold">${cat.replies}</td>
                                <td class="text-purple-600 font-semibold">${(cat.likes / cat.posts).toFixed(1)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;

        container.html(tableHTML);
    }

    /**
     * 渲染徽章统计
     */
    renderBadgeStats(badgeStats) {
        const container = $('#badgeStatsContent');

        if (!badgeStats || badgeStats.length === 0) {
            container.html(`
                <div class="text-center py-8 text-gray-500 col-span-full">
                    <div class="text-4xl mb-4">🏆</div>
                    <p>暂无徽章数据</p>
                </div>
            `);
            return;
        }

        const html = badgeStats.map(badge => `
            <div class="badge-item">
                <div class="text-2xl mb-2">🏆</div>
                <div class="font-semibold text-gray-800 text-sm mb-1">${badge.name}</div>
                <div class="text-lg font-bold text-yellow-600">${badge.count}</div>
            </div>
        `).join('');

        container.html(html);
    }

    /**
     * 渲染认证令牌分析
     */
    renderAuthTokensAnalysis(analysis) {
        const container = $('#authTokensContent');

        if (!analysis) {
            container.html(`
                <div class="text-center py-8 text-gray-500">
                    <div class="text-4xl mb-4">🔐</div>
                    <p>暂无认证令牌数据</p>
                </div>
            `);
            return;
        }

        const html = `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="analysis-item">
                    <div class="analysis-header">总令牌数</div>
                    <div class="analysis-value">${analysis.totalTokens}</div>
                    <div class="analysis-description">登录会话总数</div>
                </div>
                <div class="analysis-item">
                    <div class="analysis-header">唯一IP数</div>
                    <div class="analysis-value">${analysis.uniqueIPs}</div>
                    <div class="analysis-description">使用的IP地址数量</div>
                </div>
                <div class="md:col-span-2">
                    <h4 class="font-semibold text-gray-700 mb-3">常用设备类型</h4>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
                        ${analysis.userAgentStats.map(agent => `
                            <div class="bg-gray-50 p-3 rounded-lg text-center">
                                <div class="font-semibold text-gray-800">${agent.agent}</div>
                                <div class="text-sm text-gray-600">${agent.count} 次</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        container.html(html);
    }

    /**
     * 渲染书签分析
     */
    renderBookmarksAnalysis(analysis) {
        const container = $('#bookmarksContent');

        if (!analysis) {
            container.html(`
                <div class="text-center py-8 text-gray-500">
                    <div class="text-4xl mb-4">📑</div>
                    <p>暂无书签数据</p>
                </div>
            `);
            return;
        }

        const html = `
            <div class="space-y-4">
                <div class="analysis-item">
                    <div class="analysis-header">总书签数</div>
                    <div class="analysis-value">${analysis.total}</div>
                </div>
                <div>
                    <h4 class="font-semibold text-gray-700 mb-3">书签类型分布</h4>
                    <div class="space-y-2">
                        ${analysis.byType.map(type => `
                            <div class="flex justify-between items-center bg-gray-50 p-2 rounded">
                                <span>${type.type}</span>
                                <span class="font-semibold">${type.count}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        container.html(html);
    }

    /**
     * 渲染举报分析
     */
    renderFlagsAnalysis(analysis) {
        const container = $('#flagsContent');

        if (!analysis) {
            container.html(`
                <div class="text-center py-8 text-gray-500">
                    <div class="text-4xl mb-4">🚩</div>
                    <p>暂无举报数据</p>
                </div>
            `);
            return;
        }

        const html = `
            <div class="space-y-4">
                <div class="analysis-item">
                    <div class="analysis-header">总举报数</div>
                    <div class="analysis-value">${analysis.total}</div>
                </div>
                <div>
                    <h4 class="font-semibold text-gray-700 mb-3">举报类型分布</h4>
                    <div class="space-y-2">
                        ${analysis.byType.map(type => `
                            <div class="flex justify-between items-center bg-gray-50 p-2 rounded">
                                <span>${type.type}</span>
                                <span class="font-semibold">${type.count}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        container.html(html);
    }

    /**
     * 更新标签计数
     */
    updateTabCounts(detailedData) {
        const counts = {
            userArchive: detailedData.userArchive?.length || 0,
            visits: detailedData.visits?.length || 0,
            likes: detailedData.likes?.length || 0,
            userBadges: detailedData.userBadges?.length || 0,
            authTokens: detailedData.authTokens?.length || 0,
            bookmarks: detailedData.bookmarks?.length || 0,
            flags: detailedData.flags?.length || 0,
            queuedPosts: detailedData.queuedPosts?.length || 0
        };

        Object.keys(counts).forEach(tab => {
            $(`#${tab}Count`).text(counts[tab]);
        });
    }

    /**
     * 渲染标签内容
     */
    renderTabContent(tabName) {
        if (!this.currentTabData) return;

        const allData = this.currentTabData[tabName] || [];
        const container = $('#dataTableContent');

        if (allData.length === 0) {
            container.html(`
                <div class="text-center py-8 text-gray-500">
                    <div class="text-4xl mb-4">📄</div>
                    <p>暂无 ${this.getTabDisplayName(tabName)} 数据</p>
                </div>
            `);
            return;
        }

        // 应用搜索过滤
        const filteredData = this.filterData(allData, this.pagination.searchQuery);
        this.pagination.totalItems = filteredData.length;

        // 计算分页数据
        const startIndex = (this.pagination.currentPage - 1) * this.pagination.pageSize;
        const endIndex = startIndex + this.pagination.pageSize;
        const pageData = filteredData.slice(startIndex, endIndex);

        // 生成表格HTML
        const tableHTML = this.generateTableHTML(tabName, pageData, filteredData.length);
        container.html(tableHTML);
    }

    /**
     * 获取标签显示名称
     */
    getTabDisplayName(tabName) {
        const names = {
            userArchive: '发帖记录',
            visits: '访问记录',
            likes: '点赞记录',
            userBadges: '徽章记录',
            authTokens: '认证令牌',
            bookmarks: '书签记录',
            flags: '举报记录',
            queuedPosts: '待审核帖子'
        };
        return names[tabName] || tabName;
    }

    /**
     * 生成表格HTML
     */
    generateTableHTML(tabName, pageData, totalCount) {
        const columns = this.getTableColumns(tabName);
        const totalPages = Math.ceil(this.pagination.totalItems / this.pagination.pageSize);
        const startItem = (this.pagination.currentPage - 1) * this.pagination.pageSize + 1;
        const endItem = Math.min(startItem + pageData.length - 1, this.pagination.totalItems);

        return `
            <div class="space-y-4">
                <!-- 数据统计和搜索 -->
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white/80 backdrop-blur-sm rounded-lg p-4">
                    <div class="text-sm text-gray-600">
                        显示第 ${startItem}-${endItem} 条，共 ${this.pagination.totalItems} 条记录
                    </div>
                    <div class="flex items-center gap-3">
                        <div class="relative">
                            <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                            <input type="text" id="searchInput"
                                   class="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                   placeholder="搜索数据..." value="${this.pagination.searchQuery}">
                        </div>
                        <select id="pageSizeSelect"
                                class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                            <option value="25" ${this.pagination.pageSize === 25 ? 'selected' : ''}>25条/页</option>
                            <option value="50" ${this.pagination.pageSize === 50 ? 'selected' : ''}>50条/页</option>
                            <option value="100" ${this.pagination.pageSize === 100 ? 'selected' : ''}>100条/页</option>
                            <option value="200" ${this.pagination.pageSize === 200 ? 'selected' : ''}>200条/页</option>
                        </select>
                    </div>
                </div>

                <!-- 数据表格 -->
                <div class="table-container bg-white/95 backdrop-blur-sm rounded-lg shadow-sm overflow-hidden">
                    <div class="overflow-x-auto">
                        <table class="data-table w-full">
                            <thead class="bg-gray-50">
                                <tr>
                                    ${columns.map(col => `<th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">${col.label}</th>`).join('')}
                                </tr>
                            </thead>
                            <tbody class="bg-white divide-y divide-gray-200">
                                ${pageData.map((row, index) => `
                                    <tr class="hover:bg-gray-50 transition-colors duration-150">
                                        ${columns.map(col => `
                                            <td class="px-4 py-3 text-sm">${this.formatTableValue(row[col.key], col.type, row, tabName)}</td>
                                        `).join('')}
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- 分页控件 -->
                ${totalPages > 1 ? this.generatePaginationHTML(totalPages) : ''}
            </div>
        `;
    }

    /**
     * 生成分页控件HTML
     */
    generatePaginationHTML(totalPages) {
        const current = this.pagination.currentPage;
        const showPages = 5; // 显示的页码数量
        let startPage = Math.max(1, current - Math.floor(showPages / 2));
        let endPage = Math.min(totalPages, startPage + showPages - 1);

        // 调整起始页
        if (endPage - startPage + 1 < showPages) {
            startPage = Math.max(1, endPage - showPages + 1);
        }

        let paginationHTML = `
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white/80 backdrop-blur-sm rounded-lg p-4">
                <div class="text-sm text-gray-600">
                    第 ${current} 页，共 ${totalPages} 页
                </div>
                <div class="flex items-center space-x-1">
        `;

        // 首页按钮
        paginationHTML += `
            <button class="pagination-btn px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-50 hover:text-gray-700 transition-colors duration-150 ${current === 1 ? 'opacity-50 cursor-not-allowed' : ''}"
                    data-action="first" ${current === 1 ? 'disabled' : ''}>
                <i class="fas fa-angle-double-left"></i>
            </button>
            <button class="pagination-btn px-3 py-2 text-sm font-medium text-gray-500 bg-white border-t border-b border-gray-300 hover:bg-gray-50 hover:text-gray-700 transition-colors duration-150 ${current === 1 ? 'opacity-50 cursor-not-allowed' : ''}"
                    data-action="prev" ${current === 1 ? 'disabled' : ''}>
                <i class="fas fa-angle-left"></i>
            </button>
        `;

        // 页码按钮
        for (let i = startPage; i <= endPage; i++) {
            const isActive = i === current;
            paginationHTML += `
                <button class="pagination-btn px-3 py-2 text-sm font-medium border-t border-b border-gray-300 transition-colors duration-150 ${
                    isActive
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'text-gray-500 bg-white hover:bg-gray-50 hover:text-gray-700'
                }" data-action="${i}">
                    ${i}
                </button>
            `;
        }

        // 末页按钮
        paginationHTML += `
            <button class="pagination-btn px-3 py-2 text-sm font-medium text-gray-500 bg-white border-t border-b border-gray-300 hover:bg-gray-50 hover:text-gray-700 transition-colors duration-150 ${current === totalPages ? 'opacity-50 cursor-not-allowed' : ''}"
                    data-action="next" ${current === totalPages ? 'disabled' : ''}>
                <i class="fas fa-angle-right"></i>
            </button>
            <button class="pagination-btn px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-50 hover:text-gray-700 transition-colors duration-150 ${current === totalPages ? 'opacity-50 cursor-not-allowed' : ''}"
                    data-action="last" ${current === totalPages ? 'disabled' : ''}>
                <i class="fas fa-angle-double-right"></i>
            </button>
        `;

        paginationHTML += `
                </div>
            </div>
        `;

        return paginationHTML;
    }

    /**
     * 过滤数据
     */
    filterData(data, searchQuery) {
        if (!searchQuery || searchQuery.trim() === '') {
            return data;
        }

        const query = searchQuery.toLowerCase().trim();
        return data.filter(row => {
            return Object.values(row).some(value => {
                if (value === null || value === undefined) return false;
                return value.toString().toLowerCase().includes(query);
            });
        });
    }

    /**
     * 获取表格列定义
     */
    getTableColumns(tabName) {
        const columns = {
            userArchive: [
                { key: 'topic_title', label: '主题标题', type: 'text' },
                { key: 'categories', label: '分类', type: 'text' },
                { key: 'like_count', label: '点赞数', type: 'number' },
                { key: 'reply_count', label: '回复数', type: 'number' },
                { key: 'created_at', label: '发布时间', type: 'datetime' },
                { key: 'is_pm', label: '私信', type: 'boolean' },
                { key: 'actions', label: '操作', type: 'actions' }
            ],
            visits: [
                { key: 'visited_at', label: '访问日期', type: 'date' },
                { key: 'posts_read', label: '阅读帖数', type: 'number' },
                { key: 'time_read', label: '阅读时长(秒)', type: 'number' },
                { key: 'mobile', label: '移动端', type: 'boolean' }
            ],
            likes: [
                { key: 'id', label: 'ID', type: 'number' },
                { key: 'post_id', label: '帖子ID', type: 'number' },
                { key: 'topic_id', label: '主题ID', type: 'number' },
                { key: 'post_number', label: '帖子编号', type: 'number' },
                { key: 'created_at', label: '点赞时间', type: 'datetime' },
                { key: 'actions', label: '操作', type: 'actions' }
            ],
            userBadges: [
                { key: 'badge_name', label: '徽章名称', type: 'text' },
                { key: 'granted_at', label: '获得时间', type: 'datetime' },
                { key: 'granted_manually', label: '手动授予', type: 'boolean' },
                { key: 'seq', label: '序号', type: 'number' },
                { key: 'actions', label: '操作', type: 'actions' }
            ],
            authTokens: [
                { key: 'id', label: 'ID', type: 'number' },
                { key: 'client_ip', label: 'IP地址', type: 'text' },
                { key: 'user_agent', label: '用户代理', type: 'text' },
                { key: 'created_at', label: '创建时间', type: 'datetime' },
                { key: 'seen_at', label: '最后使用', type: 'datetime' }
            ],
            bookmarks: [
                { key: 'name', label: '书签名称', type: 'text' },
                { key: 'bookmarkable_type', label: '类型', type: 'text' },
                { key: 'created_at', label: '创建时间', type: 'datetime' },
                { key: 'reminder_at', label: '提醒时间', type: 'datetime' },
                { key: 'actions', label: '操作', type: 'actions' }
            ],
            flags: [
                { key: 'id', label: 'ID', type: 'number' },
                { key: 'post_id', label: '帖子ID', type: 'number' },
                { key: 'flag_type', label: '举报类型', type: 'text' },
                { key: 'created_at', label: '举报时间', type: 'datetime' },
                { key: 'targets_topic', label: '针对主题', type: 'boolean' },
                { key: 'actions', label: '操作', type: 'actions' }
            ],
            queuedPosts: [
                { key: 'id', label: 'ID', type: 'number' },
                { key: 'verdict', label: '审核结果', type: 'text' },
                { key: 'category_id', label: '分类ID', type: 'number' },
                { key: 'topic_id', label: '主题ID', type: 'number' }
            ]
        };

        return columns[tabName] || [];
    }

    /**
     * 格式化表格值
     */
    formatTableValue(value, type, row = null, tabName = null) {
        if (value === null || value === undefined || value === '') {
            return '<span class="text-gray-400">-</span>';
        }

        switch (type) {
            case 'datetime':
                try {
                    return new Date(value).toLocaleString('zh-CN');
                } catch {
                    return value;
                }
            case 'date':
                try {
                    return new Date(value).toLocaleDateString('zh-CN');
                } catch {
                    return value;
                }
            case 'boolean':
                return value ? '<span class="text-green-600">是</span>' : '<span class="text-gray-400">否</span>';
            case 'number':
                return typeof value === 'number' ? value.toLocaleString() : value;
            case 'text':
                if (typeof value === 'string' && value.length > 50) {
                    return `<span title="${value.replace(/"/g, '&quot;')}">${value.substring(0, 50)}...</span>`;
                }
                return value;
            case 'actions':
                return this.generateActionButtons(row, tabName);
            default:
                return value;
        }
    }

    /**
     * 生成操作按钮
     */
    generateActionButtons(row, tabName) {
        const buttons = [];

        switch (tabName) {
            case 'userArchive':
                // 主题链接
                if (row.topic_id) {
                    buttons.push(`
                        <a href="https://linux.do/t/topic/${row.topic_id}" target="_blank"
                           class="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded-md hover:bg-blue-200 transition-colors duration-200">
                            <i class="fas fa-external-link-alt mr-1"></i>
                            查看主题
                        </a>
                    `);
                }
                // 如果有帖子ID，添加帖子链接
                if (row.post_id && row.post_number) {
                    buttons.push(`
                        <a href="https://linux.do/t/topic/${row.topic_id}/${row.post_number}" target="_blank"
                           class="inline-flex items-center px-2 py-1 text-xs font-medium text-green-600 bg-green-100 rounded-md hover:bg-green-200 transition-colors duration-200 ml-1">
                            <i class="fas fa-link mr-1"></i>
                            查看帖子
                        </a>
                    `);
                }
                break;

            case 'likes':
                // 点赞的帖子链接
                if (row.topic_id && row.post_number) {
                    buttons.push(`
                        <a href="https://linux.do/t/topic/${row.topic_id}/${row.post_number}" target="_blank"
                           class="inline-flex items-center px-2 py-1 text-xs font-medium text-red-600 bg-red-100 rounded-md hover:bg-red-200 transition-colors duration-200">
                            <i class="fas fa-heart mr-1"></i>
                            查看帖子
                        </a>
                    `);
                } else if (row.topic_id) {
                    buttons.push(`
                        <a href="https://linux.do/t/topic/${row.topic_id}" target="_blank"
                           class="inline-flex items-center px-2 py-1 text-xs font-medium text-red-600 bg-red-100 rounded-md hover:bg-red-200 transition-colors duration-200">
                            <i class="fas fa-external-link-alt mr-1"></i>
                            查看主题
                        </a>
                    `);
                }
                break;

            case 'flags':
                // 举报的帖子链接
                if (row.post_id && row.topic_id) {
                    buttons.push(`
                        <a href="https://linux.do/p/${row.post_id}" target="_blank"
                           class="inline-flex items-center px-2 py-1 text-xs font-medium text-orange-600 bg-orange-100 rounded-md hover:bg-orange-200 transition-colors duration-200">
                            <i class="fas fa-flag mr-1"></i>
                            查看帖子
                        </a>
                    `);
                }
                break;

            case 'userBadges':
                // 徽章信息链接
                if (row.badge_id) {
                    buttons.push(`
                        <a href="https://linux.do/badges/${row.badge_id}" target="_blank"
                           class="inline-flex items-center px-2 py-1 text-xs font-medium text-yellow-600 bg-yellow-100 rounded-md hover:bg-yellow-200 transition-colors duration-200">
                            <i class="fas fa-medal mr-1"></i>
                            查看徽章
                        </a>
                    `);
                }
                break;

            case 'bookmarks':
                // 书签链接
                if (row.bookmarkable_type === 'Post' && row.bookmarkable_id) {
                    buttons.push(`
                        <a href="https://linux.do/p/${row.bookmarkable_id}" target="_blank"
                           class="inline-flex items-center px-2 py-1 text-xs font-medium text-purple-600 bg-purple-100 rounded-md hover:bg-purple-200 transition-colors duration-200">
                            <i class="fas fa-bookmark mr-1"></i>
                            查看帖子
                        </a>
                    `);
                } else if (row.bookmarkable_type === 'Topic' && row.bookmarkable_id) {
                    buttons.push(`
                        <a href="https://linux.do/t/topic/${row.bookmarkable_id}" target="_blank"
                           class="inline-flex items-center px-2 py-1 text-xs font-medium text-purple-600 bg-purple-100 rounded-md hover:bg-purple-200 transition-colors duration-200">
                            <i class="fas fa-external-link-alt mr-1"></i>
                            查看主题
                        </a>
                    `);
                }
                break;

            default:
                // 通用的用户主页链接（如果有用户ID）
                if (row.user_id) {
                    buttons.push(`
                        <a href="https://linux.do/u/user/${row.user_id}" target="_blank"
                           class="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors duration-200">
                            <i class="fas fa-user mr-1"></i>
                            查看用户
                        </a>
                    `);
                }
        }

        return buttons.length > 0 ?
            `<div class="flex flex-wrap gap-1">${buttons.join('')}</div>` :
            '<span class="text-gray-400">-</span>';
    }

    /**
     * 渲染完整分析结果
     */
    renderAnalysisResults(analysisData) {
        console.log('🎨 渲染完整分析结果');

        // 保存当前数据
        this.currentTabData = analysisData.detailedData;

        // 渲染各个部分
        this.renderUserInfo(analysisData.summary.user);
        this.renderDataCompleteness(analysisData.summary.dataCompleteness);
        this.renderSummaryCards(analysisData.summary);
        this.renderCategoryData(analysisData.categoryData);
        this.renderBadgeStats(analysisData.badgeStats);

        // 渲染新增的分析部分
        this.renderAuthTokensAnalysis(analysisData.authTokensAnalysis);
        this.renderBookmarksAnalysis(analysisData.bookmarksAnalysis);
        this.renderFlagsAnalysis(analysisData.flagsAnalysis);

        // 更新标签计数
        this.updateTabCounts(analysisData.detailedData);

        // 渲染默认标签内容
        this.renderTabContent(this.activeTab);

        // 显示分析结果区域
        this.showAnalysisResults();
        this.showExportButton();
    }

    /**
     * 渲染已存储数据列表
     */
    renderStoredDataList(analyses) {
        const listContainer = $('#storedDataList');
        const section = $('#storedDataSection');

        if (!analyses || analyses.length === 0) {
            listContainer.html(`
                <div class="text-center py-8 text-gray-500">
                    <div class="text-4xl mb-4">📭</div>
                    <p>暂无存储的数据</p>
                </div>
            `);
        } else {
            const listHTML = analyses.map(analysis => {
                const timestamp = new Date(analysis.timestamp).toLocaleString('zh-CN');
                const username = analysis.summary?.user?.username || '未知用户';
                const posts = analysis.summary?.totalPosts || 0;
                const badges = analysis.summary?.totalBadges || 0;

                return `
                    <div class="bg-white/80 rounded-xl p-4 border border-gray-200
                                hover:bg-white hover:shadow-md transition-all duration-200">
                        <div class="flex items-center justify-between">
                            <div class="flex-1">
                                <h4 class="font-semibold text-gray-800">${username}</h4>
                                <p class="text-sm text-gray-600 mt-1">
                                    📝 ${posts} 篇帖子 · 🏆 ${badges} 个徽章
                                </p>
                                <p class="text-xs text-gray-500 mt-1">${timestamp}</p>
                            </div>
                            <div class="flex space-x-2 ml-4">
                                <button onclick="window.app.loadAnalysis(${analysis.id})"
                                        class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1
                                               rounded-full text-sm transition-colors duration-200">
                                    查看
                                </button>
                                <button onclick="window.app.deleteAnalysis(${analysis.id})"
                                        class="bg-red-500 hover:bg-red-600 text-white px-3 py-1
                                               rounded-full text-sm transition-colors duration-200">
                                    删除
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');

            listContainer.html(listHTML);
        }

        section.removeClass('hidden');
    }

    // ==== 保持原有的基础功能 ====

    /**
     * 设置拖拽上传
     */
    setupDragAndDrop() {
        const uploadArea = $('#uploadArea');

        uploadArea.on('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
            uploadArea.addClass('drag-over');
        });

        uploadArea.on('dragleave', (e) => {
            e.preventDefault();
            e.stopPropagation();
            uploadArea.removeClass('drag-over');
        });

        uploadArea.on('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
            uploadArea.removeClass('drag-over');

            const files = e.originalEvent.dataTransfer.files;
            if (files.length > 0) {
                window.app?.processFile(files[0]);
            }
        });

        console.log('拖拽上传设置完成');
    }

    /**
     * 处理键盘快捷键
     */
    handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + O: 打开文件
        if ((e.ctrlKey || e.metaKey) && e.key === 'o') {
            e.preventDefault();
            $('#fileInput').click();
        }

        // Ctrl/Cmd + E: 导出数据
        if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
            e.preventDefault();
            window.app?.exportCurrentAnalysis();
        }

        // Escape: 关闭模态框或覆盖层
        if (e.key === 'Escape') {
            this.hideLoading();
            this.hideAllToasts();
        }
    }

    /**
     * 显示进度条
     */
    showProgress(percent = 0, text = '处理中...') {
        this.progressContainer.removeClass('hidden');
        this.progressBar.css('width', `${percent}%`);
        this.progressText.text(text);

        if (percent > 0) {
            this.progressBar.addClass('progress-bar-animated');
        }
    }

    /**
     * 隐藏进度条
     */
    hideProgress() {
        this.progressContainer.addClass('hidden');
        this.progressBar.removeClass('progress-bar-animated');
    }

    /**
     * 更新进度
     */
    updateProgress(percent, text) {
        this.progressBar.css('width', `${percent}%`);
        if (text) {
            this.progressText.text(text);
        }
    }

    /**
     * 显示状态消息
     */
    showStatus(message, type = 'info', duration = 5000) {
        this.statusContainer.removeClass('hidden');

        // 移除之前的样式类
        this.statusMessage.removeClass('bg-green-100 text-green-800 border-green-200');
        this.statusMessage.removeClass('bg-red-100 text-red-800 border-red-200');
        this.statusMessage.removeClass('bg-blue-100 text-blue-800 border-blue-200');
        this.statusMessage.removeClass('bg-yellow-100 text-yellow-800 border-yellow-200');

        // 应用新的样式类
        switch (type) {
            case 'success':
                this.statusMessage.addClass('bg-green-100 text-green-800 border-green-200');
                break;
            case 'error':
                this.statusMessage.addClass('bg-red-100 text-red-800 border-red-200');
                break;
            case 'warning':
                this.statusMessage.addClass('bg-yellow-100 text-yellow-800 border-yellow-200');
                break;
            default:
                this.statusMessage.addClass('bg-blue-100 text-blue-800 border-blue-200');
        }

        this.statusMessage.text(message);

        // 自动隐藏
        if (duration > 0) {
            setTimeout(() => {
                this.hideStatus();
            }, duration);
        }
    }

    /**
     * 隐藏状态消息
     */
    hideStatus() {
        this.statusContainer.addClass('hidden');
    }

    /**
     * 显示加载覆盖层
     */
    showLoading(text = '处理中...') {
        this.loadingOverlay.find('span').text(text);
        this.loadingOverlay.removeClass('hidden');
    }

    /**
     * 隐藏加载覆盖层
     */
    hideLoading() {
        this.loadingOverlay.addClass('hidden');
    }

    /**
     * 显示Toast通知
     */
    showToast(message, type = 'info', duration = 4000) {
        const toast = this.createToast(message, type);
        this.toastContainer.append(toast);

        // 触发入场动画
        setTimeout(() => {
            toast.addClass('toast-enter-active').removeClass('toast-enter');
        }, 10);

        // 自动移除
        setTimeout(() => {
            this.removeToast(toast);
        }, duration);

        this.toastQueue.push(toast);

        // 限制Toast数量
        if (this.toastQueue.length > 3) {
            this.removeToast(this.toastQueue.shift());
        }
    }

    /**
     * 创建Toast元素
     */
    createToast(message, type) {
        const iconMap = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };

        const colorMap = {
            success: 'bg-green-500',
            error: 'bg-red-500',
            warning: 'bg-yellow-500',
            info: 'bg-blue-500'
        };

        const toast = $(`
            <div class="toast-enter ${colorMap[type]} text-white px-6 py-4 rounded-lg shadow-lg mb-2 max-w-sm">
                <div class="flex items-center">
                    <span class="text-xl mr-3">${iconMap[type]}</span>
                    <span class="flex-1">${message}</span>
                    <button class="ml-3 text-white hover:text-gray-200 font-bold text-lg leading-none" onclick="$(this).parent().parent().remove()">×</button>
                </div>
            </div>
        `);

        return toast;
    }

    /**
     * 移除Toast
     */
    removeToast(toast) {
        if (toast && toast.length) {
            toast.addClass('toast-exit-active').removeClass('toast-enter-active');
            setTimeout(() => {
                toast.remove();
            }, 300);

            // 从队列中移除
            const index = this.toastQueue.indexOf(toast);
            if (index > -1) {
                this.toastQueue.splice(index, 1);
            }
        }
    }

    /**
     * 隐藏所有Toast
     */
    hideAllToasts() {
        this.toastQueue.forEach(toast => this.removeToast(toast));
        this.toastQueue = [];
    }

    /**
     * 显示确认对话框
     */
    showConfirmDialog(title, message, onConfirm, onCancel) {
        if (confirm(`${title}\n\n${message}`)) {
            if (onConfirm) onConfirm();
        } else {
            if (onCancel) onCancel();
        }
    }

    /**
     * 显示分析结果
     */
    showAnalysisResults() {
        const section = $('#analysisSection');
        section.removeClass('hidden');

        // 滚动到结果区域
        $('html, body').animate({
            scrollTop: section.offset().top - 50
        }, 800);
    }

    /**
     * 隐藏分析结果
     */
    hideAnalysisResults() {
        $('#analysisSection').addClass('hidden');
    }

    /**
     * 显示导出按钮
     */
    showExportButton() {
        $('#exportBtn').removeClass('hidden');
    }

    /**
     * 隐藏导出按钮
     */
    hideExportButton() {
        $('#exportBtn').addClass('hidden');
    }

    /**
     * 重置UI状态
     */
    resetUI() {
        this.hideProgress();
        this.hideStatus();
        this.hideLoading();
        this.hideAnalysisResults();
        this.hideExportButton();
        this.hideAllToasts();
        $('#storedDataSection').addClass('hidden');
        this.currentTabData = null;
        this.activeTab = 'userArchive';
        this.resetPagination();
    }

    /**
     * 获取UI状态
     */
    getUIState() {
        return {
            progressVisible: !this.progressContainer.hasClass('hidden'),
            statusVisible: !this.statusContainer.hasClass('hidden'),
            loadingVisible: !this.loadingOverlay.hasClass('hidden'),
            analysisVisible: !$('#analysisSection').hasClass('hidden'),
            exportButtonVisible: !$('#exportBtn').hasClass('hidden'),
            storedDataVisible: !$('#storedDataSection').hasClass('hidden'),
            toastCount: this.toastQueue.length,
            activeTab: this.activeTab
        };
    }

    /**
     * 设置主题（兼容性方法）
     */
    setAppTheme(theme = 'apple') {
        // 调用新的主题设置方法
        this.setTheme(theme, true);
    }

    /**
     * 获取当前主题
     */
    getTheme() {
        return localStorage.getItem('app-theme') || 'apple';
    }
}

// 导出为全局变量
window.UIManager = UIManager;