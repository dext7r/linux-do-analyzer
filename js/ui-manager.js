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
        // 初始化为'overview'标签
        this.activeTab = 'overview';

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

        // 新建分析按钮
        $('#newAnalysisBtn').on('click', () => {
            // 重置UI状态
            this.hideAnalysisResults();
            this.hideExportButton();
            $('#newAnalysisBtn').addClass('hidden');
            $('#storedDataSection').addClass('hidden');
            $('#upload').removeClass('hidden');
            $('#hero').removeClass('hidden');
            // 滚动到上传区域
            $('html, body').animate({
                scrollTop: $('#upload').offset().top - 100
            }, 500);
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

        // 分析结果标签页切换事件
        $(document).on('click', '.analysis-tab', (e) => {
            const tab = $(e.currentTarget).data('tab');
            this.switchAnalysisTab(tab);
        });

        console.log('事件绑定完成');
    }

    /**
     * 切换分析结果标签页
     */
    switchAnalysisTab(tabName) {
        // 更新标签按钮状态
        $('.analysis-tab').removeClass('active');
        $(`.analysis-tab[data-tab="${tabName}"]`).addClass('active');

        // 切换内容显示
        $('.tab-content').addClass('hidden').removeClass('active');
        $(`#tab-${tabName}`).removeClass('hidden').addClass('active');

        // 如果是charts标签，重新渲染图表以确保尺寸正确
        if (tabName === 'charts') {
            setTimeout(() => {
                // 触发图表重新渲染
                window.dispatchEvent(new Event('resize'));
            }, 100);
        }
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
    /**
     * 渲染用户信息 - 重新设计版本
     */
    renderUserInfo(userInfo) {
        const container = $('#userInfoContent');

        if (!userInfo) {
            container.html(`
                <div class="flex items-center justify-center h-64">
                    <div class="text-center">
                        <div class="text-6xl mb-4">👤</div>
                        <p class="text-gray-500 text-lg">暂无用户信息</p>
                    </div>
                </div>
            `);
            return;
        }

        const formatDate = (dateStr) => {
            if (!dateStr) return '未知';
            try {
                return new Date(dateStr).toLocaleDateString('zh-CN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
            } catch {
                return dateStr;
            }
        };

        const formatTime = (seconds) => {
            if (!seconds) return '0 分钟';
            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            return hours > 0 ? `${hours} 小时 ${minutes} 分钟` : `${minutes} 分钟`;
        };

        // 定义分类数据，使用更美观的布局
        const sections = [
            {
                title: '基本信息',
                icon: '👤',
                gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                items: [
                    { label: '🆔 用户ID', value: userInfo.id || '未知' },
                    { label: '👨‍💼 用户名', value: userInfo.username || '未设置' },
                    { label: '✨ 显示名称', value: userInfo.name || '未设置' },
                    { label: '📧 邮箱地址', value: userInfo.email || '未设置' },
                    { label: '🌍 所在地区', value: userInfo.location || '未设置' },
                    { label: '📅 注册时间', value: formatDate(userInfo.created_at) }
                ]
            },
            {
                title: '权限与角色',
                icon: '🛡️',
                gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                items: [
                    { label: '⭐ 信任等级', value: `等级 ${userInfo.trust_level || 0}` },
                    { label: '👑 用户头衔', value: userInfo.title || '无' },
                    { label: '🔧 管理员', value: userInfo.admin ? '✅ 是' : '❌ 否' },
                    { label: '🛡️ 版主权限', value: userInfo.moderator ? '✅ 是' : '❌ 否' },
                    { label: '✏️ 可编辑资料', value: userInfo.can_edit ? '✅ 是' : '❌ 否' },
                    { label: '💌 可发私信', value: userInfo.can_send_private_messages ? '✅ 是' : '❌ 否' }
                ]
            },
            {
                title: '活动统计',
                icon: '📊',
                gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                items: [
                    { label: '🏆 徽章总数', value: `${userInfo.badge_count || 0} 个` },
                    { label: '💡 被采纳回答', value: `${userInfo.accepted_answers || 0} 个` },
                    { label: '👀 资料浏览量', value: `${userInfo.profile_view_count || 0} 次` },
                    { label: '📖 阅读时长', value: formatTime(userInfo.time_read) },
                    { label: '🎮 积分', value: `${userInfo.gamification_score || 0} 分` },
                    { label: '🕐 最后在线', value: formatDate(userInfo.last_seen_at) }
                ]
            },
            {
                title: '社交网络',
                icon: '🤝',
                gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                items: [
                    { label: '👥 关注数量', value: `${userInfo.total_following || 0} 人` },
                    { label: '❤️ 粉丝数量', value: `${userInfo.total_followers || 0} 人` },
                    { label: '🔇 屏蔽用户', value: `${userInfo.muted_usernames?.length || 0} 人` },
                    { label: '👁️ 忽略用户', value: `${userInfo.ignored_usernames?.length || 0} 人` },
                    { label: '🌐 显示关注列表', value: userInfo.can_see_following ? '✅ 公开' : '❌ 隐藏' },
                    { label: '📊 显示粉丝列表', value: userInfo.can_see_followers ? '✅ 公开' : '❌ 隐藏' }
                ]
            },
            {
                title: '隐私与安全',
                icon: '🔒',
                gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
                items: [
                    { label: '🔐 双因子认证', value: userInfo.second_factor_enabled ? '✅ 已启用' : '❌ 未启用' },
                    { label: '🛡️ 备用认证码', value: userInfo.second_factor_backup_enabled ? '✅ 已启用' : '❌ 未启用' },
                    { label: '📧 邮箱隐私', value: userInfo.email_private ? '🔒 私有' : '🌐 公开' },
                    { label: '👤 资料可见性', value: userInfo.profile_hidden ? '🔒 隐藏' : '🌐 公开' },
                    { label: '🖼️ 自定义背景', value: userInfo.can_upload_user_card_background ? '✅ 允许' : '❌ 禁止' },
                    { label: '🎨 上传头像', value: userInfo.can_upload_profile_header ? '✅ 允许' : '❌ 禁止' }
                ]
            },
            {
                title: '个性化设置',
                icon: '🎨',
                gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
                items: [
                    { label: '🌏 语言设置', value: userInfo.locale || '默认' },
                    { label: '🕰️ 时区设置', value: userInfo.timezone || '未设置' },
                    { label: '📝 文字大小', value: userInfo.text_size || '普通' },
                    { label: '🎯 主题配色', value: userInfo.color_scheme_id ? `方案 ${userInfo.color_scheme_id}` : '默认' },
                    { label: '💬 启用引用', value: userInfo.enable_quoting ? '✅ 启用' : '❌ 禁用' },
                    { label: '🔗 新窗口打开链接', value: userInfo.external_links_in_new_tab ? '✅ 启用' : '❌ 禁用' }
                ]
            }
        ];

        const html = `
            <div class="w-full max-w-7xl mx-auto space-y-8">
                <!-- 用户头像和基本信息卡片 -->
                <div class="relative overflow-hidden rounded-3xl shadow-2xl" style="background: ${sections[0].gradient}">
                    <div class="absolute inset-0 bg-black bg-opacity-10"></div>
                    <div class="relative p-8 text-white">
                        <div class="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
                            <div class="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-4xl backdrop-blur-sm">
                                👤
                            </div>
                            <div class="flex-1 text-center md:text-left">
                                <h2 class="text-3xl font-bold mb-2">${userInfo.name || userInfo.username || '用户'}</h2>
                                <p class="text-white text-opacity-90 text-lg">${userInfo.title || '论坛成员'}</p>
                                <div class="flex flex-wrap justify-center md:justify-start items-center gap-3 mt-4">
                                    <span class="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm backdrop-blur-sm">
                                        🆔 ${userInfo.id}
                                    </span>
                                    <span class="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm backdrop-blur-sm">
                                        ⭐ 等级 ${userInfo.trust_level || 0}
                                    </span>
                                    <span class="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm backdrop-blur-sm">
                                        🏆 ${userInfo.badge_count || 0} 徽章
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 信息分类展示 -->
                <div class="space-y-6">
                    ${sections.map((section, index) => `
                        <div class="user-info-section animate-fade-in w-full" style="animation-delay: ${index * 0.1}s">
                            <div class="user-info-section-title" style="background: ${section.gradient}; color: white;">
                                <span class="text-2xl mr-3">${section.icon}</span>
                                <span class="text-lg font-semibold">${section.title}</span>
                            </div>
                            <div class="user-info-section-content">
                                <div class="space-y-3">
                                    ${section.items.map(item => `
                                        <div class="user-info-item">
                                            <span class="user-info-label text-sm">${item.label}</span>
                                            <span class="user-info-value text-sm font-medium">${item.value}</span>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>

                <!-- 个人简介区域 -->
                ${userInfo.bio_cooked ? `
                <div class="user-info-section">
                    <div class="user-info-section-title" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
                        <span class="text-2xl mr-3">📝</span>
                        <span>个人简介</span>
                    </div>
                    <div class="user-info-section-content">
                        <div class="prose prose-sm max-w-none">
                            ${userInfo.bio_cooked}
                        </div>
                    </div>
                </div>
                ` : ''}

                <!-- 时间信息 -->
                <div class="user-info-section">
                    <div class="user-info-section-title" style="background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); color: white;">
                        <span class="text-2xl mr-3">⏰</span>
                        <span>时间记录</span>
                    </div>
                    <div class="user-info-section-content">
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div class="stats-card">
                                <div class="stats-card-icon">📅</div>
                                <div class="stats-card-value">${formatDate(userInfo.created_at)}</div>
                                <div class="stats-card-label">注册时间</div>
                            </div>
                            <div class="stats-card">
                                <div class="stats-card-icon">👀</div>
                                <div class="stats-card-value">${formatDate(userInfo.last_seen_at)}</div>
                                <div class="stats-card-label">最后在线</div>
                            </div>
                            <div class="stats-card">
                                <div class="stats-card-icon">✍️</div>
                                <div class="stats-card-value">${formatDate(userInfo.last_posted_at)}</div>
                                <div class="stats-card-label">最后发帖</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

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
     * 渲染徽章详细分析
     */
    /**
     * 渲染徽章详细分析 - 重新设计版本
     */
    renderBadgeDetailedAnalysis(badgeAnalysis) {
        const container = $('#badgeDetailedContent');

        if (!badgeAnalysis || badgeAnalysis.totalBadges === 0) {
            container.html(`
                <div class="flex items-center justify-center h-64">
                    <div class="text-center">
                        <div class="text-6xl mb-4">🏆</div>
                        <p class="text-gray-500 text-lg">暂无徽章详细数据</p>
                    </div>
                </div>
            `);
            return;
        }

        const formatDate = (dateStr) => {
            try {
                return new Date(dateStr).toLocaleDateString('zh-CN', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                });
            } catch {
                return dateStr;
            }
        };

        // 按类型分组显示徽章
        const badgeTypesSummary = Object.entries(badgeAnalysis.badgesByType)
            .map(([type, badges]) => {
                const totalCount = badges.reduce((sum, badge) => sum + badge.count, 0);
                return { type, count: badges.length, totalCount };
            })
            .filter(item => item.count > 0);

        // 获取最新的徽章记录
        const recentBadges = badgeAnalysis.badgeTimeline.slice(-8).reverse();

        const html = `
            <div class="space-y-8">
                <!-- 徽章统计概览 -->
                <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div class="stats-card" style="background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);">
                        <div class="stats-card-icon">🏆</div>
                        <div class="stats-card-value">${badgeAnalysis.totalBadges}</div>
                        <div class="stats-card-label">徽章总数</div>
                    </div>
                    <div class="stats-card" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
                        <div class="stats-card-icon">🎖️</div>
                        <div class="stats-card-value">${badgeAnalysis.uniqueBadges}</div>
                        <div class="stats-card-label">独特徽章</div>
                    </div>
                    <div class="stats-card" style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);">
                        <div class="stats-card-icon">📅</div>
                        <div class="stats-card-value">${badgeAnalysis.badgeTimeline.length}</div>
                        <div class="stats-card-label">获得记录</div>
                    </div>
                    <div class="stats-card" style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);">
                        <div class="stats-card-icon">🏷️</div>
                        <div class="stats-card-value">${badgeTypesSummary.length}</div>
                        <div class="stats-card-label">徽章类型</div>
                    </div>
                </div>

                <!-- 按类型分组的徽章 -->
                ${badgeTypesSummary.length > 0 ? `
                <div class="user-info-section">
                    <div class="user-info-section-title" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
                        <span class="text-2xl mr-3">🏅</span>
                        <span>徽章类型分布</span>
                    </div>
                    <div class="user-info-section-content">
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            ${badgeTypesSummary.map((typeGroup, index) => `
                                <div class="badge-card animate-fade-in" style="animation-delay: ${index * 0.1}s">
                                    <div class="flex items-center justify-between mb-4">
                                        <div class="flex items-center space-x-3">
                                            <div class="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                                                <span class="text-white text-xl font-bold">${typeGroup.count}</span>
                                            </div>
                                            <div>
                                                <h4 class="font-bold text-gray-800 text-lg">${typeGroup.type}</h4>
                                                <p class="text-sm text-gray-600">${typeGroup.count} 种徽章</p>
                                            </div>
                                        </div>
                                        <div class="text-right">
                                            <div class="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                                                ${typeGroup.totalCount}
                                            </div>
                                            <div class="text-xs text-gray-500">总获得数</div>
                                        </div>
                                    </div>
                                    <div class="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                        <div class="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"
                                             style="width: ${Math.min((typeGroup.totalCount / badgeAnalysis.totalBadges) * 100, 100)}%"></div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
                ` : ''}

                <!-- 最近获得的徽章 -->
                ${recentBadges.length > 0 ? `
                <div class="user-info-section">
                    <div class="user-info-section-title" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white;">
                        <span class="text-2xl mr-3">⭐</span>
                        <span>最近获得的徽章</span>
                    </div>
                    <div class="user-info-section-content">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            ${recentBadges.map((item, index) => `
                                <div class="badge-timeline-item animate-slide-up" style="animation-delay: ${index * 0.05}s">
                                    <div class="flex items-center space-x-4">
                                        <div class="relative">
                                            <div class="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                                                <span class="text-white text-xl font-bold">${item.count || 1}</span>
                                            </div>
                                            <div class="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-pink-400 to-red-500 rounded-full flex items-center justify-center">
                                                <span class="text-white text-xs">🏆</span>
                                            </div>
                                        </div>
                                        <div class="flex-1">
                                            <h4 class="font-bold text-gray-800 text-lg">${item.badge_name}</h4>
                                            <p class="text-sm text-gray-600">${item.badge_type}</p>
                                            <div class="flex items-center space-x-2 mt-2">
                                                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    📅 ${formatDate(item.date)}
                                                </span>
                                                ${item.count > 1 ? `
                                                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    🔄 ${item.count}次
                                                </span>
                                                ` : ''}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
                ` : ''}

                <!-- 徽章获得时间线 -->
                ${badgeAnalysis.badgeTimeline.length > 0 ? `
                <div class="user-info-section">
                    <div class="user-info-section-title" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white;">
                        <span class="text-2xl mr-3">📈</span>
                        <span>徽章获得历程</span>
                    </div>
                    <div class="user-info-section-content">
                        <div class="relative">
                            <!-- 时间线背景线 -->
                            <div class="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-400 to-purple-500 rounded-full"></div>

                            <div class="space-y-6 max-h-96 overflow-y-auto">
                                ${badgeAnalysis.badgeTimeline.slice(-12).reverse().map((event, index) => `
                                    <div class="relative flex items-center space-x-6 animate-fade-in" style="animation-delay: ${index * 0.1}s">
                                        <!-- 时间线节点 -->
                                        <div class="relative z-10 w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                                            <span class="text-white text-lg">🏆</span>
                                        </div>

                                        <!-- 事件卡片 -->
                                        <div class="flex-1 bg-gradient-to-r from-white to-gray-50 rounded-xl p-4 shadow-md border border-gray-100">
                                            <div class="flex items-center justify-between">
                                                <div>
                                                    <h4 class="font-bold text-gray-800">${event.badge_name}</h4>
                                                    <p class="text-sm text-gray-600">${event.badge_type}</p>
                                                </div>
                                                <div class="text-right">
                                                    <div class="text-sm font-medium text-gray-800">${formatDate(event.date)}</div>
                                                    ${event.count > 1 ? `
                                                    <div class="text-xs text-green-600">第 ${event.count} 次获得</div>
                                                    ` : ''}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>
                ` : ''}

                <!-- 徽章成就总览 -->
                <div class="user-info-section">
                    <div class="user-info-section-title" style="background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); color: white;">
                        <span class="text-2xl mr-3">🎯</span>
                        <span>成就总览</span>
                    </div>
                    <div class="user-info-section-content">
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div class="text-center p-6 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
                                <div class="text-4xl mb-3">🥇</div>
                                <div class="text-2xl font-bold text-yellow-700">${badgeAnalysis.totalBadges}</div>
                                <div class="text-sm text-yellow-600 font-medium">总徽章数量</div>
                                <div class="text-xs text-gray-500 mt-1">包含重复获得</div>
                            </div>
                            <div class="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                                <div class="text-4xl mb-3">🎖️</div>
                                <div class="text-2xl font-bold text-blue-700">${badgeAnalysis.uniqueBadges}</div>
                                <div class="text-sm text-blue-600 font-medium">独特徽章种类</div>
                                <div class="text-xs text-gray-500 mt-1">不同类型的徽章</div>
                            </div>
                            <div class="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
                                <div class="text-4xl mb-3">📊</div>
                                <div class="text-2xl font-bold text-green-700">${Math.round((badgeAnalysis.uniqueBadges / Math.max(badgeAnalysis.totalBadges, 1)) * 100)}%</div>
                                <div class="text-sm text-green-600 font-medium">徽章多样性</div>
                                <div class="text-xs text-gray-500 mt-1">独特徽章占比</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        container.html(html);
    }

    /**
     * 渲染用户权限和设置信息
     */
    /**
     * 渲染用户权限和设置信息 - 重新设计版本
     */
    renderUserPermissionsAndSettings(permissionsData) {
        const container = $('#userPermissionsContent');

        if (!permissionsData) {
            container.html(`
                <div class="flex items-center justify-center h-64">
                    <div class="text-center">
                        <div class="text-6xl mb-4">⚙️</div>
                        <p class="text-gray-500 text-lg">暂无权限和设置数据</p>
                    </div>
                </div>
            `);
            return;
        }

        const formatBoolean = (value) => value ? '✅ 启用' : '❌ 禁用';
        const formatNumber = (value) => value || 0;
        const formatArray = (arr) => Array.isArray(arr) ? arr.length : 0;

        // 权限等级映射
        const trustLevelInfo = {
            0: { name: '新手用户', color: 'from-gray-400 to-gray-500', icon: '🌱' },
            1: { name: '基础用户', color: 'from-blue-400 to-blue-500', icon: '🌿' },
            2: { name: '成员用户', color: 'from-green-400 to-green-500', icon: '🌿' },
            3: { name: '常规用户', color: 'from-yellow-400 to-yellow-500', icon: '🌳' },
            4: { name: '领导者', color: 'from-purple-400 to-purple-500', icon: '🏆' }
        };

        const currentTrustLevel = trustLevelInfo[permissionsData.permissions.trust_level] || trustLevelInfo[0];

        const html = `
            <div class="space-y-8">
                <!-- 用户权限概览卡片 -->
                <div class="relative overflow-hidden rounded-3xl bg-gradient-to-br ${currentTrustLevel.color}">
                    <div class="absolute inset-0 bg-black bg-opacity-10"></div>
                    <div class="relative p-8 text-white">
                        <div class="flex items-center space-x-6">
                            <div class="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-3xl backdrop-blur-sm">
                                ${currentTrustLevel.icon}
                            </div>
                            <div class="flex-1">
                                <h2 class="text-2xl font-bold mb-2">${currentTrustLevel.name}</h2>
                                <p class="text-white text-opacity-90">信任等级 ${permissionsData.permissions.trust_level}</p>
                                <div class="flex items-center space-x-4 mt-4">
                                    ${permissionsData.permissions.admin ? `
                                    <span class="bg-red-500 bg-opacity-90 px-3 py-1 rounded-full text-sm font-medium">
                                        👑 管理员
                                    </span>
                                    ` : ''}
                                    ${permissionsData.permissions.moderator ? `
                                    <span class="bg-blue-500 bg-opacity-90 px-3 py-1 rounded-full text-sm font-medium">
                                        🛡️ 版主
                                    </span>
                                    ` : ''}
                                    <span class="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm backdrop-blur-sm">
                                        🔐 ${formatNumber(permissionsData.security.active_auth_tokens)} 活跃会话
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 权限设置网格 -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <!-- 基本权限 -->
                    <div class="permission-card">
                        <div class="flex items-center space-x-3 mb-6">
                            <div class="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
                                <span class="text-white text-xl">🛡️</span>
                            </div>
                            <div>
                                <h3 class="text-xl font-bold text-gray-800">基本权限</h3>
                                <p class="text-gray-600 text-sm">账户操作和内容权限</p>
                            </div>
                        </div>
                        <div class="space-y-4">
                            <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <span class="flex items-center space-x-2">
                                    <span class="text-lg">✏️</span>
                                    <span class="font-medium text-gray-700">编辑资料</span>
                                </span>
                                <span class="font-semibold ${permissionsData.permissions.can_edit ? 'text-green-600' : 'text-red-600'}">
                                    ${formatBoolean(permissionsData.permissions.can_edit)}
                                </span>
                            </div>
                            <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <span class="flex items-center space-x-2">
                                    <span class="text-lg">📧</span>
                                    <span class="font-medium text-gray-700">修改邮箱</span>
                                </span>
                                <span class="font-semibold ${permissionsData.permissions.can_edit_email ? 'text-green-600' : 'text-red-600'}">
                                    ${formatBoolean(permissionsData.permissions.can_edit_email)}
                                </span>
                            </div>
                            <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <span class="flex items-center space-x-2">
                                    <span class="text-lg">💌</span>
                                    <span class="font-medium text-gray-700">发送私信</span>
                                </span>
                                <span class="font-semibold ${permissionsData.permissions.can_send_private_messages ? 'text-green-600' : 'text-red-600'}">
                                    ${formatBoolean(permissionsData.permissions.can_send_private_messages)}
                                </span>
                            </div>
                            <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <span class="flex items-center space-x-2">
                                    <span class="text-lg">🖼️</span>
                                    <span class="font-medium text-gray-700">上传头像</span>
                                </span>
                                <span class="font-semibold ${permissionsData.permissions.can_upload_profile_header ? 'text-green-600' : 'text-red-600'}">
                                    ${formatBoolean(permissionsData.permissions.can_upload_profile_header)}
                                </span>
                            </div>
                        </div>
                    </div>

                    <!-- 隐私设置 -->
                    <div class="permission-card">
                        <div class="flex items-center space-x-3 mb-6">
                            <div class="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center">
                                <span class="text-white text-xl">🔒</span>
                            </div>
                            <div>
                                <h3 class="text-xl font-bold text-gray-800">隐私设置</h3>
                                <p class="text-gray-600 text-sm">个人信息可见性控制</p>
                            </div>
                        </div>
                        <div class="space-y-4">
                            <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <span class="flex items-center space-x-2">
                                    <span class="text-lg">📧</span>
                                    <span class="font-medium text-gray-700">邮箱私有</span>
                                </span>
                                <span class="font-semibold ${permissionsData.privacy.email_private ? 'text-green-600' : 'text-orange-600'}">
                                    ${permissionsData.privacy.email_private ? '🔒 私有' : '🌐 公开'}
                                </span>
                            </div>
                            <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <span class="flex items-center space-x-2">
                                    <span class="text-lg">👤</span>
                                    <span class="font-medium text-gray-700">个人资料</span>
                                </span>
                                <span class="font-semibold ${permissionsData.privacy.profile_hidden ? 'text-red-600' : 'text-green-600'}">
                                    ${permissionsData.privacy.profile_hidden ? '🔒 隐藏' : '🌐 公开'}
                                </span>
                            </div>
                            <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <span class="flex items-center space-x-2">
                                    <span class="text-lg">👥</span>
                                    <span class="font-medium text-gray-700">关注列表</span>
                                </span>
                                <span class="font-semibold ${permissionsData.privacy.can_see_following ? 'text-green-600' : 'text-red-600'}">
                                    ${permissionsData.privacy.can_see_following ? '🌐 公开' : '🔒 隐藏'}
                                </span>
                            </div>
                            <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <span class="flex items-center space-x-2">
                                    <span class="text-lg">❤️</span>
                                    <span class="font-medium text-gray-700">粉丝列表</span>
                                </span>
                                <span class="font-semibold ${permissionsData.privacy.can_see_followers ? 'text-green-600' : 'text-red-600'}">
                                    ${permissionsData.privacy.can_see_followers ? '🌐 公开' : '🔒 隐藏'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <!-- 通知设置 -->
                    <div class="permission-card">
                        <div class="flex items-center space-x-3 mb-6">
                            <div class="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center">
                                <span class="text-white text-xl">🔔</span>
                            </div>
                            <div>
                                <h3 class="text-xl font-bold text-gray-800">通知设置</h3>
                                <p class="text-gray-600 text-sm">消息和提醒偏好</p>
                            </div>
                        </div>
                        <div class="space-y-4">
                            <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <span class="flex items-center space-x-2">
                                    <span class="text-lg">📬</span>
                                    <span class="font-medium text-gray-700">邮件摘要</span>
                                </span>
                                <span class="font-semibold ${permissionsData.notifications.email_digests ? 'text-green-600' : 'text-gray-600'}">
                                    ${formatBoolean(permissionsData.notifications.email_digests)}
                                </span>
                            </div>
                            <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <span class="flex items-center space-x-2">
                                    <span class="text-lg">💌</span>
                                    <span class="font-medium text-gray-700">私信通知</span>
                                </span>
                                <span class="font-semibold ${permissionsData.notifications.email_private_messages ? 'text-green-600' : 'text-gray-600'}">
                                    ${formatBoolean(permissionsData.notifications.email_private_messages)}
                                </span>
                            </div>
                            <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <span class="flex items-center space-x-2">
                                    <span class="text-lg">⏰</span>
                                    <span class="font-medium text-gray-700">通知计划</span>
                                </span>
                                <span class="font-semibold ${permissionsData.notifications.notification_schedule_enabled ? 'text-green-600' : 'text-gray-600'}">
                                    ${formatBoolean(permissionsData.notifications.notification_schedule_enabled)}
                                </span>
                            </div>
                            <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <span class="flex items-center space-x-2">
                                    <span class="text-lg">⏱️</span>
                                    <span class="font-medium text-gray-700">摘要延迟</span>
                                </span>
                                <span class="font-semibold text-blue-600">
                                    ${formatNumber(permissionsData.notifications.digest_after_minutes)} 分钟
                                </span>
                            </div>
                        </div>
                    </div>

                    <!-- 个性化设置 -->
                    <div class="permission-card">
                        <div class="flex items-center space-x-3 mb-6">
                            <div class="w-12 h-12 bg-gradient-to-br from-pink-400 to-pink-600 rounded-xl flex items-center justify-center">
                                <span class="text-white text-xl">🎨</span>
                            </div>
                            <div>
                                <h3 class="text-xl font-bold text-gray-800">个性化设置</h3>
                                <p class="text-gray-600 text-sm">界面和功能偏好</p>
                            </div>
                        </div>
                        <div class="space-y-4">
                            <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <span class="flex items-center space-x-2">
                                    <span class="text-lg">🌏</span>
                                    <span class="font-medium text-gray-700">语言设置</span>
                                </span>
                                <span class="font-semibold text-indigo-600">
                                    ${permissionsData.preferences.locale || '默认'}
                                </span>
                            </div>
                            <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <span class="flex items-center space-x-2">
                                    <span class="text-lg">🕰️</span>
                                    <span class="font-medium text-gray-700">时区设置</span>
                                </span>
                                <span class="font-semibold text-indigo-600">
                                    ${permissionsData.preferences.timezone || '未设置'}
                                </span>
                            </div>
                            <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <span class="flex items-center space-x-2">
                                    <span class="text-lg">📝</span>
                                    <span class="font-medium text-gray-700">文字大小</span>
                                </span>
                                <span class="font-semibold text-indigo-600">
                                    ${permissionsData.preferences.text_size || '普通'}
                                </span>
                            </div>
                            <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <span class="flex items-center space-x-2">
                                    <span class="text-lg">🔗</span>
                                    <span class="font-medium text-gray-700">新窗口链接</span>
                                </span>
                                <span class="font-semibold ${permissionsData.preferences.external_links_in_new_tab ? 'text-green-600' : 'text-gray-600'}">
                                    ${formatBoolean(permissionsData.preferences.external_links_in_new_tab)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 安全设置卡片 -->
                <div class="user-info-section">
                    <div class="user-info-section-title" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
                        <span class="text-2xl mr-3">🔐</span>
                        <span>安全设置总览</span>
                    </div>
                    <div class="user-info-section-content">
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div class="text-center p-6 bg-gradient-to-br ${permissionsData.security.second_factor_enabled ? 'from-green-50 to-green-100 border-green-200' : 'from-red-50 to-red-100 border-red-200'} rounded-xl border">
                                <div class="text-3xl mb-3">${permissionsData.security.second_factor_enabled ? '🔐' : '🔓'}</div>
                                <div class="text-lg font-bold ${permissionsData.security.second_factor_enabled ? 'text-green-700' : 'text-red-700'}">${permissionsData.security.second_factor_enabled ? '已启用' : '未启用'}</div>
                                <div class="text-sm ${permissionsData.security.second_factor_enabled ? 'text-green-600' : 'text-red-600'} font-medium">双因子认证</div>
                            </div>
                            <div class="text-center p-6 bg-gradient-to-br ${permissionsData.security.second_factor_backup_enabled ? 'from-blue-50 to-blue-100 border-blue-200' : 'from-gray-50 to-gray-100 border-gray-200'} rounded-xl border">
                                <div class="text-3xl mb-3">${permissionsData.security.second_factor_backup_enabled ? '🛡️' : '🔒'}</div>
                                <div class="text-lg font-bold ${permissionsData.security.second_factor_backup_enabled ? 'text-blue-700' : 'text-gray-700'}">${permissionsData.security.second_factor_backup_enabled ? '已配置' : '未配置'}</div>
                                <div class="text-sm ${permissionsData.security.second_factor_backup_enabled ? 'text-blue-600' : 'text-gray-600'} font-medium">备用认证码</div>
                            </div>
                            <div class="text-center p-6 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl border border-indigo-200">
                                <div class="text-3xl mb-3">📱</div>
                                <div class="text-lg font-bold text-indigo-700">${formatNumber(permissionsData.security.active_auth_tokens)}</div>
                                <div class="text-sm text-indigo-600 font-medium">活跃会话</div>
                            </div>
                            <div class="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                                <div class="text-3xl mb-3">🔑</div>
                                <div class="text-lg font-bold text-purple-700">安全</div>
                                <div class="text-sm text-purple-600 font-medium">账户状态</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 分类偏好统计 -->
                <div class="user-info-section">
                    <div class="user-info-section-title" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white;">
                        <span class="text-2xl mr-3">📂</span>
                        <span>分类偏好统计</span>
                    </div>
                    <div class="user-info-section-content">
                        <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
                            <div class="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                                <div class="text-2xl mb-2">👁️</div>
                                <div class="text-xl font-bold text-blue-700">${formatArray(permissionsData.categoryPreferences.watched_category_ids)}</div>
                                <div class="text-xs text-blue-600">关注分类</div>
                            </div>
                            <div class="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                                <div class="text-2xl mb-2">📍</div>
                                <div class="text-xl font-bold text-green-700">${formatArray(permissionsData.categoryPreferences.tracked_category_ids)}</div>
                                <div class="text-xs text-green-600">跟踪分类</div>
                            </div>
                            <div class="text-center p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-xl">
                                <div class="text-2xl mb-2">🔇</div>
                                <div class="text-xl font-bold text-red-700">${formatArray(permissionsData.categoryPreferences.muted_category_ids)}</div>
                                <div class="text-xs text-red-600">屏蔽分类</div>
                            </div>
                            <div class="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                                <div class="text-2xl mb-2">📋</div>
                                <div class="text-xl font-bold text-purple-700">${formatArray(permissionsData.categoryPreferences.sidebar_category_ids)}</div>
                                <div class="text-xs text-purple-600">侧边栏</div>
                            </div>
                            <div class="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl">
                                <div class="text-2xl mb-2">🏷️</div>
                                <div class="text-xl font-bold text-orange-700">${formatArray(permissionsData.categoryPreferences.sidebar_tags)}</div>
                                <div class="text-xs text-orange-600">标签</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        container.html(html);
    }

    /**
     * 渲染设备登录历史
     */
    /**
     * 渲染设备登录历史 - 重新设计版本
     */
    renderDeviceLoginHistory(loginHistory) {
        const container = $('#deviceLoginHistoryContent');

        if (!loginHistory || loginHistory.totalDevices === 0) {
            container.html(`
                <div class="flex items-center justify-center h-64">
                    <div class="text-center">
                        <div class="text-6xl mb-4">📱</div>
                        <p class="text-gray-500 text-lg">暂无设备登录历史数据</p>
                    </div>
                </div>
            `);
            return;
        }

        const formatDate = (dateStr) => {
            try {
                return new Date(dateStr).toLocaleDateString('zh-CN', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            } catch {
                return dateStr;
            }
        };

        const formatRelativeTime = (days) => {
            if (days === 0) return '今天';
            if (days === 1) return '昨天';
            if (days < 7) return `${days} 天前`;
            if (days < 30) return `${Math.floor(days / 7)} 周前`;
            if (days < 365) return `${Math.floor(days / 30)} 个月前`;
            return `${Math.floor(days / 365)} 年前`;
        };

        const getDeviceInfo = (deviceType) => {
            const deviceMap = {
                '移动设备': { icon: '📱', color: 'from-blue-400 to-blue-600', bgColor: 'from-blue-50 to-blue-100' },
                'Chrome浏览器': { icon: '🌐', color: 'from-green-400 to-green-600', bgColor: 'from-green-50 to-green-100' },
                'Firefox浏览器': { icon: '🦊', color: 'from-orange-400 to-orange-600', bgColor: 'from-orange-50 to-orange-100' },
                'Safari浏览器': { icon: '🧭', color: 'from-cyan-400 to-cyan-600', bgColor: 'from-cyan-50 to-cyan-100' },
                'Edge浏览器': { icon: '🔷', color: 'from-purple-400 to-purple-600', bgColor: 'from-purple-50 to-purple-100' },
                '桌面浏览器': { icon: '💻', color: 'from-gray-400 to-gray-600', bgColor: 'from-gray-50 to-gray-100' },
                '未知设备': { icon: '❓', color: 'from-gray-400 to-gray-500', bgColor: 'from-gray-50 to-gray-100' }
            };
            return deviceMap[deviceType] || deviceMap['未知设备'];
        };

        const deviceTypesArray = Object.entries(loginHistory.devicesByType);

        const html = `
            <div class="space-y-8">
                <!-- 设备统计概览 -->
                <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div class="stats-card" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
                        <div class="stats-card-icon">📱</div>
                        <div class="stats-card-value">${loginHistory.totalDevices}</div>
                        <div class="stats-card-label">总设备数</div>
                    </div>
                    <div class="stats-card" style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);">
                        <div class="stats-card-icon">🟢</div>
                        <div class="stats-card-value">${loginHistory.activeDevices}</div>
                        <div class="stats-card-label">活跃设备</div>
                    </div>
                    <div class="stats-card" style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);">
                        <div class="stats-card-icon">🔗</div>
                        <div class="stats-card-value">${deviceTypesArray.length}</div>
                        <div class="stats-card-label">设备类型</div>
                    </div>
                    <div class="stats-card" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                        <div class="stats-card-icon">⏰</div>
                        <div class="stats-card-value">${loginHistory.recentDevices.length}</div>
                        <div class="stats-card-label">近期活跃</div>
                    </div>
                </div>

                <!-- 设备类型分布 -->
                ${deviceTypesArray.length > 0 ? `
                <div class="user-info-section">
                    <div class="user-info-section-title" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
                        <span class="text-2xl mr-3">📊</span>
                        <span>设备类型分布</span>
                    </div>
                    <div class="user-info-section-content">
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            ${deviceTypesArray.map(([type, data], index) => {
                                const deviceInfo = getDeviceInfo(type);
                                const percentage = Math.round((data.count / loginHistory.totalDevices) * 100);
                                return `
                                <div class="device-card animate-fade-in" style="animation-delay: ${index * 0.1}s">
                                    <div class="flex items-center space-x-4 mb-4">
                                        <div class="w-16 h-16 bg-gradient-to-br ${deviceInfo.color} rounded-2xl flex items-center justify-center shadow-lg">
                                            <span class="text-white text-2xl">${deviceInfo.icon}</span>
                                        </div>
                                        <div class="flex-1">
                                            <h4 class="font-bold text-gray-800 text-lg">${type}</h4>
                                            <p class="text-sm text-gray-600">${data.count} 个设备</p>
                                        </div>
                                        <div class="text-right">
                                            <div class="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${deviceInfo.color.replace('from-', 'from-').replace('to-', 'to-')}">${percentage}%</div>
                                        </div>
                                    </div>
                                    <div class="mb-3">
                                        <div class="flex justify-between text-sm text-gray-600 mb-1">
                                            <span>使用占比</span>
                                            <span>${data.count}/${loginHistory.totalDevices}</span>
                                        </div>
                                        <div class="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                            <div class="h-full bg-gradient-to-r ${deviceInfo.color} rounded-full transition-all duration-500"
                                                 style="width: ${percentage}%"></div>
                                        </div>
                                    </div>
                                    <div class="text-sm text-gray-600">
                                        <span class="inline-flex items-center">
                                            <span class="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                            最后活跃: ${formatDate(data.lastSeen)}
                                        </span>
                                    </div>
                                </div>`;
                            }).join('')}
                        </div>
                    </div>
                </div>
                ` : ''}

                <!-- 最近活跃设备 -->
                ${loginHistory.recentDevices.length > 0 ? `
                <div class="user-info-section">
                    <div class="user-info-section-title" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white;">
                        <span class="text-2xl mr-3">🔄</span>
                        <span>最近活跃设备 (30天内)</span>
                    </div>
                    <div class="user-info-section-content">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            ${loginHistory.recentDevices.slice(0, 8).map((device, index) => {
                                const deviceInfo = getDeviceInfo(device.deviceType);
                                const daysSince = Math.floor((new Date() - new Date(device.seenAt)) / (24 * 60 * 60 * 1000));
                                return `
                                <div class="relative p-4 bg-gradient-to-br ${deviceInfo.bgColor} rounded-xl border border-gray-200 animate-slide-up" style="animation-delay: ${index * 0.1}s">
                                    <div class="flex items-center space-x-4">
                                        <div class="relative">
                                            <div class="w-14 h-14 bg-gradient-to-br ${deviceInfo.color} rounded-xl flex items-center justify-center shadow-md">
                                                <span class="text-white text-xl">${deviceInfo.icon}</span>
                                            </div>
                                            <div class="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                                                <div class="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
                                            </div>
                                        </div>
                                        <div class="flex-1 min-w-0">
                                            <h4 class="font-bold text-gray-800 text-base truncate">${device.deviceType}</h4>
                                            <p class="text-sm text-gray-600 truncate">${device.ip}</p>
                                            <p class="text-xs text-gray-500 mt-1 truncate">${device.userAgent}</p>
                                        </div>
                                    </div>
                                    <div class="mt-4 flex items-center justify-between">
                                        <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            ✅ 活跃
                                        </span>
                                        <span class="text-xs text-gray-600">
                                            ${daysSince === 0 ? '今天活跃' : formatRelativeTime(daysSince)}
                                        </span>
                                    </div>
                                </div>`;
                            }).join('')}
                        </div>
                    </div>
                </div>
                ` : ''}

                <!-- 设备管理表格 -->
                <div class="user-info-section">
                    <div class="user-info-section-title" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white;">
                        <span class="text-2xl mr-3">📋</span>
                        <span>设备管理概览</span>
                    </div>
                    <div class="user-info-section-content">
                        <div class="overflow-x-auto">
                            <table class="modern-table">
                                <thead>
                                    <tr>
                                        <th class="text-left">设备信息</th>
                                        <th class="text-left">IP地址</th>
                                        <th class="text-left">首次登录</th>
                                        <th class="text-left">最后活跃</th>
                                        <th class="text-center">状态</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${loginHistory.deviceSummary.slice(0, 15).map(device => {
                                        const deviceInfo = getDeviceInfo(device.deviceType);
                                        return `
                                        <tr class="hover:bg-gray-50 transition-colors">
                                            <td class="py-4 px-6">
                                                <div class="flex items-center space-x-3">
                                                    <div class="w-10 h-10 bg-gradient-to-br ${deviceInfo.color} rounded-lg flex items-center justify-center">
                                                        <span class="text-white text-sm">${deviceInfo.icon}</span>
                                                    </div>
                                                    <div>
                                                        <div class="font-medium text-gray-800">${device.deviceType}</div>
                                                        <div class="text-xs text-gray-500 truncate max-w-xs">${device.userAgent}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td class="py-4 px-6">
                                                <span class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                                                    📍 ${device.ip}
                                                </span>
                                            </td>
                                            <td class="py-4 px-6">
                                                <div class="text-sm text-gray-600">${formatDate(device.createdAt)}</div>
                                            </td>
                                            <td class="py-4 px-6">
                                                <div class="text-sm text-gray-600">${formatDate(device.seenAt)}</div>
                                            </td>
                                            <td class="py-4 px-6 text-center">
                                                <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                                    device.isRecent
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                }">
                                                    ${device.isRecent ? '🟢 活跃' : '⚪ ' + formatRelativeTime(device.daysSinceLastSeen)}
                                                </span>
                                            </td>
                                        </tr>`;
                                    }).join('')}
                                </tbody>
                            </table>
                        </div>
                        ${loginHistory.deviceSummary.length > 15 ? `
                        <div class="mt-4 text-center">
                            <span class="text-sm text-gray-600">
                                显示前 15 个设备，共 ${loginHistory.deviceSummary.length} 个设备
                            </span>
                        </div>
                        ` : ''}
                    </div>
                </div>

                <!-- 登录时间线 -->
                ${loginHistory.loginTimeline.length > 0 ? `
                <div class="user-info-section">
                    <div class="user-info-section-title" style="background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); color: white;">
                        <span class="text-2xl mr-3">📅</span>
                        <span>最近登录时间线</span>
                    </div>
                    <div class="user-info-section-content">
                        <div class="relative">
                            <!-- 时间线背景 -->
                            <div class="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-blue-400 to-purple-500 rounded-full"></div>

                            <div class="space-y-4 max-h-96 overflow-y-auto">
                                ${loginHistory.loginTimeline.slice(0, 20).map((event, index) => {
                                    const deviceInfo = getDeviceInfo(event.deviceType);
                                    return `
                                    <div class="relative flex items-center space-x-4 animate-fade-in" style="animation-delay: ${index * 0.05}s">
                                        <!-- 时间线节点 -->
                                        <div class="relative z-10 w-12 h-12 bg-gradient-to-br ${deviceInfo.color} rounded-full flex items-center justify-center shadow-md">
                                            <span class="text-white text-sm">${deviceInfo.icon}</span>
                                        </div>

                                        <!-- 事件内容 -->
                                        <div class="flex-1 bg-gradient-to-r from-white to-gray-50 rounded-lg p-4 shadow-sm border border-gray-100">
                                            <div class="flex items-center justify-between">
                                                <div>
                                                    <h4 class="font-medium text-gray-800">${event.deviceType}</h4>
                                                    <p class="text-sm text-gray-600">从 ${event.ip} 登录</p>
                                                </div>
                                                <div class="text-right">
                                                    <div class="text-sm font-medium text-gray-800">${formatDate(event.date)}</div>
                                                    <div class="text-xs text-gray-500">登录事件</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>`;
                                }).join('')}
                            </div>
                        </div>
                    </div>
                </div>
                ` : ''}

                <!-- 安全建议 -->
                <div class="user-info-section">
                    <div class="user-info-section-title" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
                        <span class="text-2xl mr-3">🛡️</span>
                        <span>安全状态评估</span>
                    </div>
                    <div class="user-info-section-content">
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div class="text-center p-6 bg-gradient-to-br ${loginHistory.activeDevices > 5 ? 'from-yellow-50 to-orange-50 border-yellow-200' : 'from-green-50 to-green-100 border-green-200'} rounded-xl border">
                                <div class="text-3xl mb-3">${loginHistory.activeDevices > 5 ? '⚠️' : '✅'}</div>
                                <div class="text-lg font-bold ${loginHistory.activeDevices > 5 ? 'text-yellow-700' : 'text-green-700'}">${loginHistory.activeDevices} 活跃设备</div>
                                <div class="text-sm ${loginHistory.activeDevices > 5 ? 'text-yellow-600' : 'text-green-600'} font-medium">
                                    ${loginHistory.activeDevices > 5 ? '建议检查异常设备' : '设备数量正常'}
                                </div>
                            </div>
                            <div class="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                                <div class="text-3xl mb-3">📱</div>
                                <div class="text-lg font-bold text-blue-700">${Math.round((loginHistory.recentDevices.length / loginHistory.totalDevices) * 100)}%</div>
                                <div class="text-sm text-blue-600 font-medium">设备活跃率</div>
                            </div>
                            <div class="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                                <div class="text-3xl mb-3">🔒</div>
                                <div class="text-lg font-bold text-purple-700">安全</div>
                                <div class="text-sm text-purple-600 font-medium">登录状态</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

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
                return (typeof value === 'number' && !isNaN(value)) ? value.toLocaleString() : (value || 0);
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
     * 更新产品预览区域
     * 显示用户的真实数据而不是演示数据
     */
    updateProductPreview(analysisData) {
        console.log('🎨 更新产品预览区域');

        const previewContent = document.getElementById('previewContent');
        if (!previewContent) {
            console.warn('预览区域未找到');
            return;
        }

        try {
            const summary = analysisData.summary || {};
            const user = summary.user || {};

            // 使用现有的用户信息格式化逻辑
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

            // 构建用户信息预览（类似于用户数据概览）
            const previewHtml = `
                <!-- 真实数据导航栏 -->
                <div class="flex justify-between items-center mb-6">
                    <div class="flex items-center space-x-3">
                        <div class="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <i class="fas fa-chart-bar text-white text-sm"></i>
                        </div>
                        <div class="text-sm font-semibold text-gray-700"><a href="index.html" class="hover:text-indigo-600 transition-colors">Linux.do Analyzer</a></div>
                    </div>
                    <div class="flex items-center space-x-2">
                        <div class="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
                        <div class="text-xs text-gray-600">${formatValue(user.username)}</div>
                    </div>
                </div>

                <!-- 用户信息预览卡片 -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                    <div class="bg-white p-4 rounded-xl shadow-sm border-l-4 border-blue-500">
                        <div class="flex items-center justify-between mb-2">
                            <div class="text-xs text-blue-600 font-medium">👤 用户信息</div>
                            <i class="fas fa-user text-blue-500"></i>
                        </div>
                        <div class="text-sm space-y-1">
                            <div><span class="font-medium">用户名:</span> ${formatValue(user.username)}</div>
                            <div><span class="font-medium">显示名:</span> ${formatValue(user.name)}</div>
                            <div><span class="font-medium">信任等级:</span> TL${formatValue(user.trust_level)}</div>
                        </div>
                    </div>

                    <div class="bg-white p-4 rounded-xl shadow-sm border-l-4 border-green-500">
                        <div class="flex items-center justify-between mb-2">
                            <div class="text-xs text-green-600 font-medium">📊 活动数据</div>
                            <i class="fas fa-chart-line text-green-500"></i>
                        </div>
                        <div class="text-sm space-y-1">
                            <div><span class="font-medium">发帖数:</span> ${formatValue(user.post_count)}</div>
                            <div><span class="font-medium">点赞收到:</span> ${formatValue(user.likes_received)}</div>
                            <div><span class="font-medium">阅读帖子:</span> ${formatValue(user.posts_read_count)}</div>
                        </div>
                    </div>

                    <div class="bg-white p-4 rounded-xl shadow-sm border-l-4 border-purple-500">
                        <div class="flex items-center justify-between mb-2">
                            <div class="text-xs text-purple-600 font-medium">⏱️ 时间统计</div>
                            <i class="fas fa-clock text-purple-500"></i>
                        </div>
                        <div class="text-sm space-y-1">
                            <div><span class="font-medium">加入时间:</span> ${formatValue(user.created_at, 'date')}</div>
                            <div><span class="font-medium">阅读时间:</span> ${formatValue(user.time_read, 'time')}</div>
                            <div><span class="font-medium">访问天数:</span> ${formatValue(user.days_visited)}</div>
                        </div>
                    </div>

                    <div class="bg-white p-4 rounded-xl shadow-sm border-l-4 border-orange-500">
                        <div class="flex items-center justify-between mb-2">
                            <div class="text-xs text-orange-600 font-medium">🏆 数据完整性</div>
                            <i class="fas fa-database text-orange-500"></i>
                        </div>
                        <div class="text-sm space-y-1">
                            <div><span class="font-medium">评分:</span> ${summary.dataCompleteness?.score || 0}%</div>
                            <div><span class="font-medium">文件数:</span> ${summary.dataCompleteness?.available?.length || 0}</div>
                            <div class="text-xs text-green-600 font-medium">✅ 真实数据已加载</div>
                        </div>
                    </div>
                </div>

                <!-- 提示信息 -->
                <div class="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl border border-blue-200">
                    <div class="text-center">
                        <div class="text-sm text-blue-700 mb-1">
                            <i class="fas fa-check-circle text-green-500 mr-2"></i>
                            您的数据已成功加载并分析！
                        </div>
                        <div class="text-xs text-blue-600">滚动下方查看完整的分析报告</div>
                    </div>
                </div>
            `;

            // 更新预览内容
            previewContent.innerHTML = previewHtml;

            // 添加平滑过渡效果
            previewContent.style.opacity = '0';
            setTimeout(() => {
                previewContent.style.transition = 'opacity 0.5s ease-in-out';
                previewContent.style.opacity = '1';
            }, 100);

            console.log('✅ 预览区域更新完成');

        } catch (error) {
            console.error('❌ 预览更新失败:', error);
            // 如果出错，显示错误信息而不是崩溃
            previewContent.innerHTML = `
                <div class="bg-red-50 border border-red-200 rounded-xl p-4">
                    <div class="text-center">
                        <i class="fas fa-exclamation-triangle text-red-500 text-2xl mb-2"></i>
                        <div class="text-sm text-red-600">预览更新失败</div>
                        <div class="text-xs text-red-500 mt-1">请检查数据格式</div>
                    </div>
                </div>
            `;
        }
    }

    /**
     * 渲染完整分析结果 - 增强版
     */
    renderAnalysisResults(analysisData) {
        console.log('🎨 渲染完整分析结果');

        // 保存当前数据
        this.currentTabData = analysisData.detailedData;

        // 更新产品预览区域（如果存在）
        this.updateProductPreview(analysisData);

        // 渲染增强的用户信息卡片
        if (this.renderEnhancedUserInfo) {
            this.renderEnhancedUserInfo(analysisData);
        } else {
            this.renderUserInfo(analysisData.summary.user);
        }

        // 渲染数据完整性评估
        if (this.renderEnhancedDataCompleteness) {
            this.renderEnhancedDataCompleteness(analysisData);
        } else {
            this.renderDataCompleteness(analysisData.summary.dataCompleteness);
        }

        // 渲染摘要卡片
        this.renderSummaryCards(analysisData.summary);

        // 渲染分类数据
        this.renderCategoryData(analysisData.categoryData);

        // 渲染徽章统计
        this.renderBadgeStats(analysisData.badgeStats);

        // 渲染徽章详细分析
        if (analysisData.badgeDetailedAnalysis) {
            this.renderBadgeDetailedAnalysis(analysisData.badgeDetailedAnalysis);
        }

        // 渲染用户权限和设置
        if (analysisData.userPermissionsAndSettings) {
            this.renderUserPermissionsAndSettings(analysisData.userPermissionsAndSettings);
        }

        // 渲染设备登录历史
        if (analysisData.deviceLoginHistory) {
            this.renderDeviceLoginHistory(analysisData.deviceLoginHistory);
        }

        // 渲染新增的分析部分
        this.renderAuthTokensAnalysis(analysisData.authTokensAnalysis);
        this.renderBookmarksAnalysis(analysisData.bookmarksAnalysis);
        this.renderFlagsAnalysis(analysisData.flagsAnalysis);

        // 初始化数据表格标签
        this.initializeDataTableTabs(analysisData.detailedData);

        // 更新标签计数
        this.updateTabCounts(analysisData.detailedData);

        // 渲染默认标签内容
        this.renderTabContent(this.activeTab);

        // 显示分析结果区域
        this.showAnalysisResults();
        this.showExportButton();
    }

    /**
     * 初始化数据表格标签
     */
    initializeDataTableTabs(detailedData) {
        const tabs = [
            { name: 'userArchive', label: '帖子主题', icon: 'fas fa-comment' },
            { name: 'visits', label: '访问记录', icon: 'fas fa-eye' },
            { name: 'likes', label: '点赞记录', icon: 'fas fa-heart' },
            { name: 'userBadges', label: '徽章记录', icon: 'fas fa-trophy' },
            { name: 'authTokens', label: '认证令牌', icon: 'fas fa-key' },
            { name: 'bookmarks', label: '书签记录', icon: 'fas fa-bookmark' },
            { name: 'flags', label: '举报记录', icon: 'fas fa-flag' },
            { name: 'queuedPosts', label: '队列帖子', icon: 'fas fa-hourglass' }
        ];

        // 生成标签按钮HTML
        const tabButtons = tabs.map(tab => {
            const count = detailedData[tab.name]?.length || 0;
            const activeClass = tab.name === this.activeTab ? 'active' : '';
            return `
                <button class="tab-button ${activeClass}" data-tab="${tab.name}">
                    <i class="${tab.icon} mr-1"></i>
                    ${tab.label}
                    <span class="ml-1 text-xs opacity-75" id="${tab.name}Count">(${count})</span>
                </button>
            `;
        }).join('');

        // 插入到DOM
        $('#dataTableTabs').html(tabButtons);

        // 设置默认活动标签
        if (!this.activeTab || !detailedData[this.activeTab]) {
            // 找到第一个有数据的标签
            for (const tab of tabs) {
                if (detailedData[tab.name] && detailedData[tab.name].length > 0) {
                    this.activeTab = tab.name;
                    break;
                }
            }
        }
    }

    /**
     * 渲染已存储数据列表 - 带分页功能
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
            // 初始化分页参数
            if (!this.storedDataPagination) {
                this.storedDataPagination = {
                    currentPage: 1,
                    pageSize: 5,
                    totalItems: analyses.length
                };
            }

            this.storedDataPagination.totalItems = analyses.length;
            const totalPages = Math.ceil(analyses.length / this.storedDataPagination.pageSize);
            const startIndex = (this.storedDataPagination.currentPage - 1) * this.storedDataPagination.pageSize;
            const endIndex = Math.min(startIndex + this.storedDataPagination.pageSize, analyses.length);
            const currentPageData = analyses.slice(startIndex, endIndex);

            // 生成列表HTML
            const listHTML = currentPageData.map(analysis => {
                const timestamp = new Date(analysis.timestamp).toLocaleString('zh-CN');
                const username = analysis.summary?.user?.username || '未知用户';
                const posts = analysis.summary?.totalPosts || 0;
                const badges = analysis.summary?.totalBadges || 0;
                const visits = analysis.summary?.totalVisits || 0;
                const likes = analysis.summary?.totalLikes || 0;

                return `
                    <div class="stored-data-item bg-white/90 rounded-xl p-4 border border-gray-200
                                hover:bg-white hover:shadow-lg transition-all duration-200 cursor-pointer"
                         data-analysis-id="${analysis.id}"
                         onclick="window.app.loadAnalysis(${analysis.id})">
                        <div class="flex items-center justify-between">
                            <div class="flex-1">
                                <h4 class="font-semibold text-gray-800 text-lg">${username}</h4>
                                <div class="grid grid-cols-2 gap-2 mt-2">
                                    <p class="text-sm text-gray-600">
                                        <i class="fas fa-comment text-blue-500 mr-1"></i>
                                        ${posts} 篇帖子
                                    </p>
                                    <p class="text-sm text-gray-600">
                                        <i class="fas fa-trophy text-yellow-500 mr-1"></i>
                                        ${badges} 个徽章
                                    </p>
                                    <p class="text-sm text-gray-600">
                                        <i class="fas fa-eye text-green-500 mr-1"></i>
                                        ${visits} 次访问
                                    </p>
                                    <p class="text-sm text-gray-600">
                                        <i class="fas fa-heart text-red-500 mr-1"></i>
                                        ${likes} 个点赞
                                    </p>
                                </div>
                                <p class="text-xs text-gray-500 mt-2">
                                    <i class="fas fa-clock mr-1"></i>
                                    ${timestamp}
                                </p>
                            </div>
                            <div class="flex flex-col space-y-2 ml-4">
                                <button onclick="event.stopPropagation(); window.app.loadAnalysis(${analysis.id})"
                                        class="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700
                                               text-white px-4 py-2 rounded-lg text-sm transition-all duration-200
                                               shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                                    <i class="fas fa-chart-line mr-1"></i>
                                    查看分析
                                </button>
                                <button onclick="event.stopPropagation(); window.app.deleteAnalysis(${analysis.id})"
                                        class="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700
                                               text-white px-4 py-2 rounded-lg text-sm transition-all duration-200
                                               shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                                    <i class="fas fa-trash mr-1"></i>
                                    删除数据
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');

            // 生成分页控件HTML
            const paginationHTML = totalPages > 1 ? `
                <div class="flex items-center justify-between mt-6 px-2">
                    <div class="text-sm text-gray-600">
                        显示 ${startIndex + 1} - ${endIndex} 项，共 ${analyses.length} 项
                    </div>
                    <div class="flex items-center space-x-2">
                        <button onclick="window.uiManager.changeStoredDataPage(-1)"
                                class="px-3 py-1 bg-white border border-gray-300 rounded-lg text-gray-600
                                       hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed
                                       transition-all duration-200"
                                ${this.storedDataPagination.currentPage === 1 ? 'disabled' : ''}>
                            <i class="fas fa-chevron-left"></i>
                        </button>

                        <div class="flex space-x-1">
                            ${this.generatePageNumbers(this.storedDataPagination.currentPage, totalPages)}
                        </div>

                        <button onclick="window.uiManager.changeStoredDataPage(1)"
                                class="px-3 py-1 bg-white border border-gray-300 rounded-lg text-gray-600
                                       hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed
                                       transition-all duration-200"
                                ${this.storedDataPagination.currentPage === totalPages ? 'disabled' : ''}>
                            <i class="fas fa-chevron-right"></i>
                        </button>
                    </div>
                </div>
            ` : '';

            // 组合HTML
            const fullHTML = `
                <div class="space-y-4">
                    ${listHTML}
                </div>
                ${paginationHTML}
            `;

            listContainer.html(fullHTML);
        }

        section.removeClass('hidden');
    }

    /**
     * 生成页码按钮
     */
    generatePageNumbers(currentPage, totalPages) {
        let pages = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage <= 3) {
                pages = [1, 2, 3, 4, '...', totalPages];
            } else if (currentPage >= totalPages - 2) {
                pages = [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
            } else {
                pages = [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
            }
        }

        return pages.map(page => {
            if (page === '...') {
                return `<span class="px-3 py-1 text-gray-400">...</span>`;
            }
            const isActive = page === currentPage;
            return `
                <button onclick="window.uiManager.goToStoredDataPage(${page})"
                        class="px-3 py-1 rounded-lg transition-all duration-200
                               ${isActive
                                   ? 'bg-blue-500 text-white font-semibold'
                                   : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'}">
                    ${page}
                </button>
            `;
        }).join('');
    }

    /**
     * 切换已存储数据页面
     */
    changeStoredDataPage(direction) {
        if (!this.storedDataPagination) return;

        const newPage = this.storedDataPagination.currentPage + direction;
        const totalPages = Math.ceil(this.storedDataPagination.totalItems / this.storedDataPagination.pageSize);

        if (newPage >= 1 && newPage <= totalPages) {
            this.storedDataPagination.currentPage = newPage;
            window.app?.loadStoredData();
        }
    }

    /**
     * 跳转到指定页
     */
    goToStoredDataPage(page) {
        if (!this.storedDataPagination) return;

        this.storedDataPagination.currentPage = page;
        window.app?.loadStoredData();
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
        // 初始化为'overview'标签
        this.activeTab = 'overview';
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

    /**
     * 渲染增强的用户信息卡片
     */
    renderEnhancedUserInfo(analysisData) {
        const user = analysisData.summary.user;
        const prefs = analysisData.detailedData.preferences || {};

        // 基本信息部分
        const basicInfoHTML = `
            <div class="flex items-start space-x-6">
                <!-- 头像 -->
                <div class="flex-shrink-0">
                    <div class="w-24 h-24 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                        ${user.username ? user.username.charAt(0).toUpperCase() : '👤'}
                    </div>
                </div>

                <!-- 用户基本信息 -->
                <div class="flex-grow grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <div class="text-white/60 text-sm mb-1">用户名</div>
                        <div class="text-white font-semibold text-lg">${user.username || '未知'}</div>
                    </div>
                    <div>
                        <div class="text-white/60 text-sm mb-1">用户ID</div>
                        <div class="text-white font-semibold">#${user.id || 0}</div>
                    </div>
                    <div>
                        <div class="text-white/60 text-sm mb-1">信任等级</div>
                        <div class="flex items-center">
                            <span class="text-white font-semibold mr-2">TL${user.trust_level || 0}</span>
                            ${user.trust_level >= 3 ? '<span class="text-yellow-400">⭐</span>' : ''}
                        </div>
                    </div>
                    <div>
                        <div class="text-white/60 text-sm mb-1">注册时间</div>
                        <div class="text-white">${user.created_at ? new Date(user.created_at).toLocaleDateString('zh-CN') : '未知'}</div>
                    </div>
                    <div>
                        <div class="text-white/60 text-sm mb-1">最后活跃</div>
                        <div class="text-white">${user.last_seen_at ? new Date(user.last_seen_at).toLocaleDateString('zh-CN') : '未知'}</div>
                    </div>
                    <div>
                        <div class="text-white/60 text-sm mb-1">头衔</div>
                        <div class="text-white">${user.title || '无'}</div>
                    </div>
                </div>
            </div>
        `;

        // 统计数据卡片
        const statsCards = [
            { icon: 'fa-edit', label: '发帖数', value: user.post_count || 0, color: 'blue' },
            { icon: 'fa-heart', label: '获赞数', value: user.likes_received || 0, color: 'red' },
            { icon: 'fa-thumbs-up', label: '送赞数', value: user.likes_given || 0, color: 'pink' },
            { icon: 'fa-medal', label: '徽章数', value: user.badge_count || 0, color: 'yellow' },
            { icon: 'fa-clock', label: '阅读时长', value: this.formatReadTime(user.time_read || 0), color: 'green' },
            { icon: 'fa-calendar-check', label: '访问天数', value: user.days_visited || 0, color: 'purple' },
            { icon: 'fa-eye', label: '主页访问', value: user.profile_view_count || 0, color: 'indigo' },
            { icon: 'fa-users', label: '关注者', value: user.total_followers || 0, color: 'cyan' },
            { icon: 'fa-user-plus', label: '关注中', value: user.total_following || 0, color: 'teal' },
            { icon: 'fa-trophy', label: '积分', value: user.gamification_score || 0, color: 'orange' }
        ];

        const statsHTML = statsCards.map(card => `
            <div class="bg-white/10 rounded-xl p-4 backdrop-blur-sm hover:bg-white/15 transition-all duration-200">
                <div class="flex items-center justify-between mb-2">
                    <i class="fas ${card.icon} text-${card.color}-400"></i>
                    <span class="text-white/60 text-xs">${card.label}</span>
                </div>
                <div class="text-white text-xl font-bold">${typeof card.value === 'number' ? card.value.toLocaleString() : card.value}</div>
            </div>
        `).join('');

        // 权限和设置
        const permissions = [
            { key: 'admin', label: '管理员', icon: 'fa-user-shield' },
            { key: 'moderator', label: '版主', icon: 'fa-user-tie' },
            { key: 'can_send_private_messages', label: '私信', icon: 'fa-envelope' },
            { key: 'can_edit', label: '编辑', icon: 'fa-edit' },
            { key: 'can_upload_profile_header', label: '上传背景', icon: 'fa-image' },
            { key: 'second_factor_enabled', label: '二次验证', icon: 'fa-shield-alt' }
        ];

        const permissionsHTML = permissions.map(perm => {
            const enabled = user[perm.key] || false;
            return `
                <div class="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div class="flex items-center space-x-3">
                        <i class="fas ${perm.icon} text-white/60"></i>
                        <span class="text-white/80">${perm.label}</span>
                    </div>
                    <span class="${enabled ? 'text-green-400' : 'text-gray-500'}">
                        <i class="fas ${enabled ? 'fa-check-circle' : 'fa-times-circle'}"></i>
                    </span>
                </div>
            `;
        }).join('');

        // 更新DOM
        $('#userBasicInfo').html(basicInfoHTML);
        $('#userStatsGrid').html(statsHTML);
        $('#userPermissions').html(permissionsHTML);
    }

    /**
     * 渲染增强的数据完整性评估
     */
    renderEnhancedDataCompleteness(analysisData) {
        const files = analysisData.metadata?.fileList || [];
        const totalPossibleFiles = 14; // 所有可能的文件数
        const foundFiles = files.filter(f => f.isRequired || f.isOptional).length;
        const completeness = Math.round((foundFiles / totalPossibleFiles) * 100);

        // 进度条
        const progressHTML = `
            <div class="mb-4">
                <div class="flex justify-between items-center mb-2">
                    <span class="text-white font-semibold">整体完整度</span>
                    <span class="text-white/80">${completeness}%</span>
                </div>
                <div class="w-full bg-white/20 rounded-full h-3">
                    <div class="bg-gradient-to-r from-green-400 to-emerald-500 h-3 rounded-full transition-all duration-500"
                         style="width: ${completeness}%"></div>
                </div>
            </div>
        `;

        // 文件列表
        const requiredFiles = [
            'preferences.json', 'user_archive.csv'
        ];

        const optionalFiles = [
            'visits.csv', 'likes.csv', 'badges.csv', 'auth_tokens.csv',
            'auth_token_logs.csv', 'bookmarks.csv', 'category_preferences.csv',
            'flags.csv', 'queued_posts.csv', 'user_badges.csv'
        ];

        const fileStatusHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <h5 class="text-white/80 font-semibold mb-3 text-sm">必需文件</h5>
                    <div class="space-y-2">
                        ${requiredFiles.map(fileName => {
                            const found = files.some(f => f.basename === fileName);
                            return `
                                <div class="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                                    <span class="text-white/70 text-sm">${fileName}</span>
                                    ${found ?
                                        '<i class="fas fa-check-circle text-green-400"></i>' :
                                        '<i class="fas fa-times-circle text-red-400"></i>'}
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>

                <div>
                    <h5 class="text-white/80 font-semibold mb-3 text-sm">可选文件</h5>
                    <div class="space-y-2 max-h-48 overflow-y-auto">
                        ${optionalFiles.map(fileName => {
                            const file = files.find(f => f.basename === fileName);
                            const found = !!file;
                            return `
                                <div class="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                                    <span class="text-white/70 text-sm">${fileName}</span>
                                    ${found ?
                                        `<span class="text-green-400 text-xs">${this.formatFileSize(file.size)}</span>` :
                                        '<i class="fas fa-minus-circle text-gray-500"></i>'}
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            </div>
        `;

        $('#completenessProgress').html(progressHTML);
        $('#filesList').html(fileStatusHTML);
    }

    /**
     * 格式化阅读时间
     */
    formatReadTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const days = Math.floor(hours / 24);
        if (days > 0) {
            return `${days}天${hours % 24}小时`;
        }
        return `${hours}小时`;
    }

    /**
     * 格式化文件大小
     */
    formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }
}

// 导出为全局变量
window.UIManager = UIManager;