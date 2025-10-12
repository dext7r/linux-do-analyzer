/**
 * 主应用程序
 * 整合所有模块，提供统一的应用入口
 */
class App {
    constructor() {
        this.dataManager = null;
        this.zipParser = null;
        this.chartRenderer = null;
        this.uiManager = null;
        this.dataAnalyzer = null;

        this.currentAnalysis = null;
        this.isProcessing = false;

        this.initializeApp();
    }

    /**
     * 初始化应用程序
     */
    async initializeApp() {
        try {
            console.log('🚀 初始化 Linux.do 数据分析工具');

            // 检查浏览器兼容性
            this.checkBrowserCompatibility();

            // 初始化模块
            this.dataManager = new DataManager();
            this.zipParser = new ZipParser();
            this.chartRenderer = new ChartRenderer();
            this.uiManager = new UIManager();

            // 设置全局变量供其他模块使用
            window.chartRenderer = this.chartRenderer;

            // 初始化数据库
            await this.dataManager.initDB();

            // 初始化UI
            this.uiManager.init();

            // 绑定文件输入事件
            this.bindFileInputEvent();

            // 应用就绪
            this.onAppReady();

            console.log('✅ 应用初始化完成');

        } catch (error) {
            console.error('❌ 应用初始化失败:', error);
            this.handleInitializationError(error);
        }
    }

    /**
     * 检查浏览器兼容性
     */
    checkBrowserCompatibility() {
        const requiredFeatures = {
            'IndexedDB': window.indexedDB,
            'File API': window.File && window.FileReader,
            'Canvas': window.HTMLCanvasElement,
            'JSON': window.JSON,
            'jQuery': window.$
        };

        const missingFeatures = Object.keys(requiredFeatures)
            .filter(feature => !requiredFeatures[feature]);

        if (missingFeatures.length > 0) {
            throw new Error(`浏览器不支持以下功能: ${missingFeatures.join(', ')}`);
        }

        console.log('✅ 浏览器兼容性检查通过');
    }

    /**
     * 绑定文件输入事件
     */
    bindFileInputEvent() {
        $('#fileInput').on('change', (e) => {
            const files = e.target.files;
            if (files.length > 0) {
                this.processFile(files[0]);
            }
        });
    }

    /**
     * 处理文件上传
     */
    async processFile(file) {
        if (this.isProcessing) {
            this.uiManager.showToast('正在处理文件，请稍候...', 'warning');
            return;
        }

        this.isProcessing = true;

        try {
            console.log(`📁 开始处理文件: ${file.name}`);

            // 重置UI状态
            this.uiManager.hideAnalysisResults();
            this.uiManager.hideExportButton();

            // 显示进度
            this.uiManager.showProgress(0, '验证文件...');

            // 解析ZIP文件
            this.uiManager.updateProgress(20, '解析ZIP文件...');
            const parsedData = await this.zipParser.parseZipFile(file);

            // 分析数据
            this.uiManager.updateProgress(50, '分析数据...');
            this.dataAnalyzer = new DataAnalyzer(parsedData);
            const summary = this.dataAnalyzer.generateSummary();

            // 保存到数据库
            this.uiManager.updateProgress(70, '保存到本地数据库...');
            const analysisData = {
                ...parsedData,
                summary: summary,
                analyzedAt: new Date().toISOString()
            };

            const savedId = await this.dataManager.saveAnalysis(analysisData);

            // 渲染结果
            this.uiManager.updateProgress(90, '生成可视化图表...');
            this.currentAnalysis = {
                id: savedId,
                data: parsedData,
                analyzer: this.dataAnalyzer,
                summary: summary,
                platform: parsedData.platform || parsedData.metadata?.platform || null
            };

            await this.renderAnalysisResults();

            // 完成
            this.uiManager.updateProgress(100, '完成！');
            setTimeout(() => {
                this.uiManager.hideProgress();
            }, 1000);

            this.uiManager.showToast('分析完成！数据已保存到本地数据库', 'success');
            this.uiManager.showExportButton();

            console.log('✅ 文件处理完成');

        } catch (error) {
            console.error('❌ 文件处理失败:', error);
            this.uiManager.hideProgress();
            this.uiManager.showStatus(`处理失败: ${error.message}`, 'error');
            this.uiManager.showToast(error.message, 'error');
        } finally {
            this.isProcessing = false;
            // 清空文件输入，允许重新选择同一文件
            $('#fileInput').val('');
        }
    }

    /**
     * 渲染分析结果 - 新版本支持完整数据展示
     */
    async renderAnalysisResults() {
        if (!this.currentAnalysis) {
            console.warn('没有可渲染的分析数据');
            return;
        }

        const { analyzer } = this.currentAnalysis;

        try {
            // 获取完整分析数据
            const fullAnalysis = analyzer.exportAnalysis();

            if (!fullAnalysis.metadata) {
                fullAnalysis.metadata = {};
            }

            if (!fullAnalysis.metadata.platform) {
                fullAnalysis.metadata.platform = this.currentAnalysis.platform
                    || this.currentAnalysis.data.platform
                    || this.currentAnalysis.data.metadata?.platform
                    || null;
            }

            // 使用新的UI管理器渲染完整结果
            this.uiManager.renderAnalysisResults(fullAnalysis);

            // 渲染图表
            await this.renderCharts(analyzer);

            console.log('✅ 完整分析结果渲染完成');

        } catch (error) {
            console.error('❌ 渲染分析结果失败:', error);
            this.uiManager.showToast('界面渲染失败', 'error');
        }
    }

    /**
     * 渲染所有图表 - 新版本支持更多图表类型
     */
    async renderCharts(analyzer = null) {
        // 使用传入的analyzer或当前的dataAnalyzer
        const dataAnalyzer = analyzer || this.dataAnalyzer;

        if (!dataAnalyzer) {
            console.warn('⚠️ 没有可用的数据分析器');
            return;
        }

        const renderPromises = [
            this.renderChart('visits', () =>
                this.chartRenderer.renderVisitsChart(dataAnalyzer.getVisitsChartData())
            ),
            this.renderChart('badges', () =>
                this.chartRenderer.renderBadgesChart(dataAnalyzer.getBadgesChartData())
            ),
            this.renderChart('device', () =>
                this.chartRenderer.renderDeviceChart(dataAnalyzer.getDeviceChartData())
            ),
            this.renderChart('posts', () =>
                this.chartRenderer.renderPostsChart(dataAnalyzer.getPostsActivityData())
            ),
            this.renderChart('likes', () =>
                this.chartRenderer.renderLikesChart(dataAnalyzer.getLikesActivityData())
            ),
            this.renderChart('activityTrend', () =>
                this.chartRenderer.renderActivityTrendChart(dataAnalyzer.getActivityTrendData())
            ),
            this.renderChart('category', () =>
                this.chartRenderer.renderCategoryChart(dataAnalyzer.getCategoryChartData())
            )
        ];

        await Promise.allSettled(renderPromises);
        
        // 更新批量导出按钮状态
        if (this.uiManager && this.uiManager.updateExportAllChartsButton) {
            setTimeout(() => {
                this.uiManager.updateExportAllChartsButton();
            }, 200);
        }
    }

    /**
     * 安全渲染单个图表
     */
    async renderChart(name, renderFunction) {
        try {
            await renderFunction();
            console.log(`✅ ${name} 图表渲染成功`);
        } catch (error) {
            console.error(`❌ ${name} 图表渲染失败:`, error);
        }
    }

    /**
     * 加载已存储的数据
     */
    async loadStoredData() {
        try {
            console.log('📚 加载已存储的数据');
            const analyses = await this.dataManager.getAllAnalyses();
            this.uiManager.renderStoredDataList(analyses);

            if (analyses.length === 0) {
                this.uiManager.showToast('暂无存储的数据', 'info');
            }

        } catch (error) {
            console.error('❌ 加载存储数据失败:', error);
            this.uiManager.showToast('加载数据失败', 'error');
        }
    }

    /**
     * 加载指定的分析数据
     */
    async loadAnalysis(id) {
        try {
            console.log(`📖 加载分析数据: ${id}`);

            this.uiManager.showLoading('加载数据...');

            const analysisData = await this.dataManager.getAnalysisById(id);
            if (!analysisData) {
                throw new Error('分析数据不存在');
            }

            // 确保数据结构完整
            const parsedData = analysisData.data || analysisData;

            // 重建分析器
            this.dataAnalyzer = new DataAnalyzer(parsedData);

            // 生成新的分析摘要
            const summary = analysisData.summary || this.dataAnalyzer.generateSummary();

            this.currentAnalysis = {
                id: id,
                data: parsedData,
                analyzer: this.dataAnalyzer,
                summary: summary,
                platform: parsedData.platform
                    || parsedData.metadata?.platform
                    || analysisData.platform
                    || analysisData.metadata?.platform
                    || null
            };

            // 准备完整的分析数据用于渲染
            const analysisResultData = {
                summary: summary,
                detailedData: parsedData,
                categoryData: this.dataAnalyzer.getCategoryData ? this.dataAnalyzer.getCategoryData() : [],
                badgeStats: this.dataAnalyzer.getBadgeStats ? this.dataAnalyzer.getBadgeStats() : [],
                badgeDetailedAnalysis: this.dataAnalyzer.getBadgeDetailedAnalysis ? this.dataAnalyzer.getBadgeDetailedAnalysis() : null,
                userPermissionsAndSettings: this.dataAnalyzer.getUserPermissionsAndSettings ? this.dataAnalyzer.getUserPermissionsAndSettings() : null,
                deviceLoginHistory: this.dataAnalyzer.getDeviceLoginHistory ? this.dataAnalyzer.getDeviceLoginHistory() : null,
                authTokensAnalysis: this.dataAnalyzer.getAuthTokensAnalysis ? this.dataAnalyzer.getAuthTokensAnalysis() : null,
                bookmarksAnalysis: this.dataAnalyzer.getBookmarksAnalysis ? this.dataAnalyzer.getBookmarksAnalysis() : null,
                flagsAnalysis: this.dataAnalyzer.getFlagsAnalysis ? this.dataAnalyzer.getFlagsAnalysis() : null,
                hundredDayBadge: this.dataAnalyzer.getHundredDayBadgeAnalysis ? this.dataAnalyzer.getHundredDayBadgeAnalysis() : null,
                metadata: {
                    ...(analysisData.metadata || {}),
                    ...(parsedData.metadata || {}),
                    platform: parsedData.platform
                        || parsedData.metadata?.platform
                        || analysisData.platform
                        || analysisData.metadata?.platform
                        || null
                }
            };

            // 渲染分析结果
            this.uiManager.renderAnalysisResults(analysisResultData);

            // 渲染图表
            await this.renderCharts();

            this.uiManager.hideLoading();
            this.uiManager.showToast('历史数据加载完成', 'success');
            this.uiManager.showExportButton();

            // 显示新建分析按钮，隐藏已存储数据列表和上传区域
            $('#newAnalysisBtn').removeClass('hidden');
            $('#storedDataSection').addClass('hidden');
            $('#upload').addClass('hidden');
            $('#hero').addClass('hidden');

            console.log('✅ 分析数据加载完成');

        } catch (error) {
            console.error('❌ 加载分析数据失败:', error);
            this.uiManager.hideLoading();
            this.uiManager.showToast(`加载失败: ${error.message}`, 'error');
        }
    }

    /**
     * 删除分析数据
     */
    async deleteAnalysis(id) {
        try {
            console.log(`🗑️ 删除分析数据: ${id}`);

            await this.dataManager.deleteAnalysis(id);

            // 如果删除的是当前显示的分析，清空界面
            if (this.currentAnalysis && this.currentAnalysis.id === id) {
                this.currentAnalysis = null;
                this.uiManager.hideAnalysisResults();
                this.uiManager.hideExportButton();
                this.chartRenderer.destroyAllCharts();
            }

            // 刷新存储数据列表
            await this.loadStoredData();

            this.uiManager.showToast('删除成功', 'success');
            console.log('✅ 分析数据删除完成');

        } catch (error) {
            console.error('❌ 删除分析数据失败:', error);
            this.uiManager.showToast(`删除失败: ${error.message}`, 'error');
        }
    }

    /**
     * 清空所有数据
     */
    async clearAllData() {
        try {
            console.log('🧹 清空所有数据');

            this.uiManager.showLoading('清空数据...');

            await this.dataManager.clearAllData();

            // 重置应用状态
            this.currentAnalysis = null;
            this.dataAnalyzer = null;
            this.chartRenderer.destroyAllCharts();
            this.uiManager.resetUI();

            this.uiManager.hideLoading();
            this.uiManager.showToast('所有数据已清空', 'success');

            console.log('✅ 数据清空完成');

        } catch (error) {
            console.error('❌ 清空数据失败:', error);
            this.uiManager.hideLoading();
            this.uiManager.showToast(`清空失败: ${error.message}`, 'error');
        }
    }

    /**
     * 导出当前分析数据
     */
    exportCurrentAnalysis() {
        if (!this.currentAnalysis) {
            this.uiManager.showToast('没有可导出的数据', 'warning');
            return;
        }

        try {
            console.log('📤 导出分析数据');

            const platformInfo = this.currentAnalysis.platform
                || this.currentAnalysis.data.platform
                || this.currentAnalysis.data.metadata?.platform
                || {
                    id: 'linux-do',
                    displayName: 'Linux.do 社区',
                    domain: 'linux.do',
                    baseUrl: 'https://linux.do'
                };

            const exportData = {
                metadata: {
                    exportedAt: new Date().toISOString(),
                    version: '1.1',
                    source: 'Linux.do Analyzer',
                    platform: platformInfo,
                    baseUrl: platformInfo.baseUrl
                },
                summary: this.currentAnalysis.summary,
                userData: this.currentAnalysis.summary?.user
                    || this.currentAnalysis.data.user
                    || this.currentAnalysis.data.userData
                    || {},
                analysis: this.dataAnalyzer.exportAnalysis()
            };

            const blob = new Blob([JSON.stringify(exportData, null, 2)], {
                type: 'application/json'
            });

            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const username = exportData.summary?.user?.username
                || exportData.userData?.username
                || this.currentAnalysis.data.user?.username
                || 'unknown';
            const platformSlug = platformInfo?.id
                || platformInfo?.domain
                || 'forum';
            a.download = `${platformSlug}-analysis-${username}-${Date.now()}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            this.uiManager.showToast('数据导出成功', 'success');
            console.log('✅ 数据导出完成');

        } catch (error) {
            console.error('❌ 数据导出失败:', error);
            this.uiManager.showToast('导出失败', 'error');
        }
    }

    /**
     * 应用就绪回调
     */
    onAppReady() {
        // 显示欢迎信息
        console.log(`
    🎉 Linux.do 数据分析工具已就绪!

    功能特性:
    • 🗂️  支持 ZIP 文件拖拽上传
    • 📊  多维度数据可视化
    • 💾  浏览器本地数据存储
    • 📈  实时图表渲染
    • 📤  分析结果导出

    开始使用: 拖拽您的数据文件到上传区域
        `);

        // 检查是否有现有数据
        this.loadStoredData();
    }

    /**
     * 处理初始化错误
     */
    handleInitializationError(error) {
        const errorMessage = `应用初始化失败: ${error.message}`;

        // 显示错误信息
        document.body.innerHTML = `
            <div class="min-h-screen bg-red-50 flex items-center justify-center p-4">
                <div class="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
                    <div class="text-6xl mb-4">❌</div>
                    <h1 class="text-2xl font-bold text-red-600 mb-4">初始化失败</h1>
                    <p class="text-gray-600 mb-6">${errorMessage}</p>
                    <button onclick="location.reload()"
                            class="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg">
                        重新加载
                    </button>
                </div>
            </div>
        `;

        console.error('应用初始化失败:', error);
    }

    /**
     * 获取应用状态
     */
    getAppState() {
        return {
            isProcessing: this.isProcessing,
            hasCurrentAnalysis: !!this.currentAnalysis,
            currentAnalysisId: this.currentAnalysis?.id,
            chartsStatus: this.chartRenderer?.getChartsStatus(),
            uiState: this.uiManager?.getUIState()
        };
    }

    /**
     * 销毁应用
     */
    destroy() {
        console.log('🧹 销毁应用');

        if (this.chartRenderer) {
            this.chartRenderer.destroyAllCharts();
        }

        if (this.uiManager) {
            this.uiManager.resetUI();
        }

        this.currentAnalysis = null;
        this.dataAnalyzer = null;
        this.isProcessing = false;

        console.log('✅ 应用销毁完成');
    }
}

// 应用入口点
$(document).ready(() => {
    // 创建全局应用实例
    window.app = new App();

    // 全局错误处理
    window.addEventListener('error', (event) => {
        console.error('全局错误:', event.error);
        if (window.app && window.app.uiManager) {
            window.app.uiManager.showToast('发生了意外错误', 'error');
        }
    });

    // 全局未处理的Promise拒绝
    window.addEventListener('unhandledrejection', (event) => {
        console.error('未处理的Promise拒绝:', event.reason);
        if (window.app && window.app.uiManager) {
            window.app.uiManager.showToast('异步操作失败', 'error');
        }
    });

    console.log('🎯 应用启动完成');
});
