/**
 * 图表渲染器 - ECharts 版本
 * 使用 ECharts 渲染各种数据可视化图表，支持完整的导出功能
 */
class ChartRenderer {
    constructor() {
        this.charts = new Map();
        this.defaultTheme = this.getDefaultTheme();
        
        // 初始化窗口大小监听
        this.initResizeListener();
    }

    /**
     * 获取默认主题配置
     */
    getDefaultTheme() {
        return {
            backgroundColor: 'transparent',
            textStyle: {
                color: '#374151',
                fontFamily: 'ui-sans-serif, system-ui, -apple-system, sans-serif'
            },
            grid: {
                left: '10%',
                right: '10%',
                top: '15%',
                bottom: '15%',
                containLabel: true
            },
            color: ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444'],
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                borderColor: 'rgba(102, 126, 234, 0.5)',
                borderWidth: 1,
                textStyle: {
                    color: '#fff'
                }
            },
            legend: {
                textStyle: {
                    color: '#6b7280'
                },
                bottom: 0
            }
        };
    }

    /**
     * 渲染访问活动图表
     */
    renderVisitsChart(data) {
        const chartId = 'visitsChartDetail';
        const option = {
            ...this.defaultTheme,
            title: {
                text: '每日访问活动',
                left: 'center',
                textStyle: { color: '#374151', fontSize: 16, fontWeight: 'bold' }
            },
            xAxis: {
                type: 'category',
                data: data.labels,
                axisLabel: { color: '#6b7280' },
                axisLine: { lineStyle: { color: '#e5e7eb' } }
            },
            yAxis: [
                {
                    type: 'value',
                    name: '阅读帖子数',
                    nameTextStyle: { color: '#6b7280' },
                    axisLabel: { color: '#6b7280' },
                    axisLine: { lineStyle: { color: '#e5e7eb' } },
                    splitLine: { lineStyle: { color: '#f3f4f6' } },
                    position: 'left'
                },
                {
                    type: 'value',
                    name: '阅读时间(分钟)',
                    nameTextStyle: { color: '#6b7280' },
                    axisLabel: { color: '#6b7280' },
                    axisLine: { lineStyle: { color: '#e5e7eb' } },
                    splitLine: { show: false },
                    position: 'right'
                }
            ],
            series: data.datasets.map((dataset, index) => ({
                name: dataset.label,
                data: dataset.data,
                type: 'line',
                smooth: true,
                lineStyle: { width: 3 },
                areaStyle: { opacity: 0.2 },
                symbol: 'circle',
                symbolSize: 6,
                yAxisIndex: index // 使用不同的Y轴
            })),
            legend: {
                ...this.defaultTheme.legend,
                data: data.datasets.map(dataset => dataset.label)
            },
            toolbox: {
                right: 20,
                feature: {
                    saveAsImage: {
                        title: '保存为图片',
                        pixelRatio: 2
                    }
                }
            }
        };

        this.createEChart(chartId, option);
        console.log('访问活动图表渲染完成');
    }

    /**
     * 渲染徽章获得图表
     */
    renderBadgesChart(data) {
        const chartId = 'badgesChart';
        const option = {
            ...this.defaultTheme,
            title: {
                text: '徽章获得统计',
                left: 'center',
                textStyle: { color: '#374151', fontSize: 16, fontWeight: 'bold' }
            },
            xAxis: {
                type: 'category',
                data: data.labels,
                axisLabel: { color: '#6b7280', rotate: 45 },
                axisLine: { lineStyle: { color: '#e5e7eb' } }
            },
            yAxis: {
                type: 'value',
                name: '徽章数量',
                nameTextStyle: { color: '#6b7280' },
                axisLabel: { color: '#6b7280' },
                axisLine: { lineStyle: { color: '#e5e7eb' } },
                splitLine: { lineStyle: { color: '#f3f4f6' } },
                minInterval: 1
            },
            series: [{
                data: data.datasets[0].data,
                type: 'bar',
                itemStyle: {
                    borderRadius: [4, 4, 0, 0]
                }
            }],
            toolbox: {
                right: 20,
                feature: {
                    saveAsImage: {
                        title: '保存为图片',
                        pixelRatio: 2
                    }
                }
            }
        };

        this.createEChart(chartId, option);
        console.log('徽章获得图表渲染完成');
    }

    /**
     * 渲染设备使用分布图表
     */
    renderDeviceChart(data) {
        const chartId = 'deviceChart';
        const total = data.datasets[0].data.reduce((a, b) => a + b, 0);
        
        const seriesData = data.labels.map((label, index) => ({
            name: label,
            value: data.datasets[0].data[index]
        }));

        const option = {
            ...this.defaultTheme,
            title: {
                text: '设备使用分布',
                left: 'center',
                textStyle: { color: '#374151', fontSize: 16, fontWeight: 'bold' }
            },
            tooltip: {
                ...this.defaultTheme.tooltip,
                formatter: (params) => {
                    const percentage = total > 0 ? ((params.value / total) * 100).toFixed(1) : '0';
                    return `${params.name}: ${params.value} 次 (${percentage}%)`;
                }
            },
            series: [{
                type: 'pie',
                radius: ['40%', '70%'],
                center: ['50%', '60%'],
                data: seriesData,
                itemStyle: {
                    borderRadius: 8,
                    borderColor: '#fff',
                    borderWidth: 2
                },
                label: {
                    show: true,
                    formatter: '{b}: {c}',
                    color: '#6b7280'
                },
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.3)'
                    }
                }
            }],
            toolbox: {
                right: 20,
                feature: {
                    saveAsImage: {
                        title: '保存为图片',
                        pixelRatio: 2
                    }
                }
            }
        };

        this.createEChart(chartId, option);
        console.log('设备使用分布图表渲染完成');
    }

    /**
     * 渲染发帖活动时间分布图表
     */
    renderPostsChart(data) {
        const chartId = 'postsChart';
        const option = {
            ...this.defaultTheme,
            title: {
                text: '24小时发帖活动分布',
                left: 'center',
                textStyle: { color: '#374151', fontSize: 16, fontWeight: 'bold' }
            },
            xAxis: {
                type: 'category',
                data: data.labels,
                name: '时间(小时)',
                nameLocation: 'middle',
                nameGap: 30,
                nameTextStyle: { color: '#6b7280' },
                axisLabel: { color: '#6b7280' },
                axisLine: { lineStyle: { color: '#e5e7eb' } }
            },
            yAxis: {
                type: 'value',
                name: '发帖数量',
                nameTextStyle: { color: '#6b7280' },
                axisLabel: { color: '#6b7280' },
                axisLine: { lineStyle: { color: '#e5e7eb' } },
                splitLine: { lineStyle: { color: '#f3f4f6' } }
            },
            series: [{
                data: data.datasets[0].data,
                type: 'bar',
                itemStyle: {
                    borderRadius: [4, 4, 0, 0]
                }
            }],
            toolbox: {
                right: 20,
                feature: {
                    saveAsImage: {
                        title: '保存为图片',
                        pixelRatio: 2
                    }
                }
            }
        };

        this.createEChart(chartId, option);
        console.log('发帖活动分布图表渲染完成');
    }

    /**
     * 渲染点赞活动趋势图表
     */
    renderLikesChart(data) {
        const chartId = 'likesChart';
        const option = {
            ...this.defaultTheme,
            title: {
                text: '点赞活动趋势',
                left: 'center',
                textStyle: { color: '#374151', fontSize: 16, fontWeight: 'bold' }
            },
            xAxis: {
                type: 'category',
                data: data.labels,
                name: '月份',
                nameLocation: 'middle',
                nameGap: 30,
                nameTextStyle: { color: '#6b7280' },
                axisLabel: { color: '#6b7280' },
                axisLine: { lineStyle: { color: '#e5e7eb' } }
            },
            yAxis: {
                type: 'value',
                name: '点赞数量',
                nameTextStyle: { color: '#6b7280' },
                axisLabel: { color: '#6b7280' },
                axisLine: { lineStyle: { color: '#e5e7eb' } },
                splitLine: { lineStyle: { color: '#f3f4f6' } }
            },
            series: [{
                data: data.datasets[0].data,
                type: 'line',
                smooth: true,
                lineStyle: { width: 3 },
                symbol: 'circle',
                symbolSize: 8
            }],
            toolbox: {
                right: 20,
                feature: {
                    saveAsImage: {
                        title: '保存为图片',
                        pixelRatio: 2
                    }
                }
            }
        };

        this.createEChart(chartId, option);
        console.log('点赞活动趋势图表渲染完成');
    }

    /**
     * 渲染分类活动图表
     */
    renderCategoryChart(categoryData) {
        const chartId = 'categoryChart';
        const option = {
            ...this.defaultTheme,
            title: {
                text: '分类活动分布',
                left: 'center',
                textStyle: { color: '#374151', fontSize: 16, fontWeight: 'bold' }
            },
            xAxis: {
                type: 'category',
                data: categoryData.labels,
                axisLabel: { 
                    color: '#6b7280',
                    rotate: 45,
                    formatter: function(value) {
                        return value.length > 10 ? value.substring(0, 10) + '...' : value;
                    }
                },
                axisLine: { lineStyle: { color: '#e5e7eb' } }
            },
            yAxis: {
                type: 'value',
                name: '活动数量',
                nameTextStyle: { color: '#6b7280' },
                axisLabel: { color: '#6b7280' },
                axisLine: { lineStyle: { color: '#e5e7eb' } },
                splitLine: { lineStyle: { color: '#f3f4f6' } }
            },
            series: [{
                data: categoryData.datasets[0].data,
                type: 'bar',
                itemStyle: {
                    borderRadius: [4, 4, 0, 0]
                }
            }],
            toolbox: {
                right: 20,
                feature: {
                    saveAsImage: {
                        title: '保存为图片',
                        pixelRatio: 2
                    }
                }
            }
        };

        this.createEChart(chartId, option);
        console.log('分类活动图表渲染完成');
    }

    /**
     * 渲染综合活动趋势图表
     */
    renderActivityTrendChart(data) {
        const chartId = 'activityTrendChart';
        const option = {
            ...this.defaultTheme,
            title: {
                text: '综合活动趋势',
                left: 'center',
                textStyle: { color: '#374151', fontSize: 16, fontWeight: 'bold' }
            },
            xAxis: {
                type: 'category',
                data: data.labels,
                axisLabel: { color: '#6b7280' },
                axisLine: { lineStyle: { color: '#e5e7eb' } }
            },
            yAxis: {
                type: 'value',
                name: '活动数量',
                nameTextStyle: { color: '#6b7280' },
                axisLabel: { color: '#6b7280' },
                axisLine: { lineStyle: { color: '#e5e7eb' } },
                splitLine: { lineStyle: { color: '#f3f4f6' } }
            },
            series: data.datasets.map((dataset, index) => ({
                name: dataset.label,
                data: dataset.data,
                type: 'line',
                smooth: true,
                lineStyle: { width: 3 },
                symbol: 'circle',
                symbolSize: 6
            })),
            legend: {
                ...this.defaultTheme.legend,
                data: data.datasets.map(dataset => dataset.label)
            },
            toolbox: {
                right: 20,
                feature: {
                    saveAsImage: {
                        title: '保存为图片',
                        pixelRatio: 2
                    }
                }
            }
        };

        this.createEChart(chartId, option);
        console.log('综合活动趋势图表渲染完成');
    }

    /**
     * 创建ECharts图表
     */
    createEChart(chartId, option) {
        // 检查ECharts是否已加载
        if (typeof echarts === 'undefined') {
            console.error('ECharts库未加载');
            return null;
        }

        const container = document.getElementById(chartId);
        if (!container) {
            console.error('找不到图表容器:', chartId);
            return null;
        }

        // 确保容器可见且有尺寸
        const parentElement = container.parentElement;
        if (parentElement) {
            parentElement.style.minHeight = '300px';
        }

        // 销毁已存在的图表
        this.destroyChart(chartId);

        // 延迟初始化，确保容器已完全渲染
        setTimeout(() => {
            try {
                // 再次检查容器尺寸
                const rect = container.getBoundingClientRect();
                if (rect.width === 0 || rect.height === 0) {
                    console.warn(`图表容器尺寸为0: ${chartId}, width: ${rect.width}, height: ${rect.height}`);
                    container.style.width = '100%';
                    container.style.height = '300px';
                }

                // 创建新的ECharts实例
                const chart = echarts.init(container);
                chart.setOption(option);
                
                this.charts.set(chartId, chart);
                
                console.log(`ECharts图表创建完成: ${chartId}`);
            } catch (error) {
                console.error(`ECharts图表创建失败: ${chartId}`, error);
            }
        }, 200);
        
        return null;
    }

    /**
     * 销毁指定图表
     */
    destroyChart(chartId) {
        if (this.charts.has(chartId)) {
            this.charts.get(chartId).dispose();
            this.charts.delete(chartId);
            console.log(`销毁ECharts图表: ${chartId}`);
        }
    }

    /**
     * 销毁所有图表
     */
    destroyAllCharts() {
        this.charts.forEach((chart, id) => {
            chart.dispose();
            console.log(`销毁ECharts图表: ${id}`);
        });
        this.charts.clear();
        
        console.log('所有图表已销毁');
    }

    /**
     * 导出图表为图片
     */
    exportChartAsImage(chartId, filename = 'chart.png', format = 'png') {
        if (this.charts.has(chartId)) {
            const chart = this.charts.get(chartId);
            const url = chart.getDataURL({
                type: format,
                pixelRatio: 2,
                backgroundColor: '#fff'
            });
            this.downloadImage(url, filename);
            console.log(`导出ECharts图表: ${chartId} -> ${filename}`);
            return;
        }

        console.error('图表不存在:', chartId);
    }

    /**
     * 下载图片
     */
    downloadImage(url, filename) {
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    /**
     * 批量导出所有图表
     */
    exportAllCharts(format = 'png') {
        const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
        
        // 导出ECharts图表
        this.charts.forEach((chart, id) => {
            const filename = `chart_${id}_${timestamp}.${format}`;
            this.exportChartAsImage(id, filename, format);
        });

        console.log(`批量导出完成，格式: ${format}`);
    }

    /**
     * 调整所有图表大小（移动端优化）
     */
    resizeAllCharts() {
        // 调整ECharts图表
        this.charts.forEach((chart, id) => {
            try {
                chart.resize();
                console.log(`调整ECharts图表大小: ${id}`);
            } catch (error) {
                console.warn(`调整ECharts图表 ${id} 大小失败:`, error);
            }
        });
    }

    /**
     * 初始化窗口大小监听
     */
    initResizeListener() {
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.resizeAllCharts();
            }, 100);
        });
    }

    /**
     * 获取所有图表状态
     */
    getChartsStatus() {
        const status = {};
        
        // ECharts图表状态
        this.charts.forEach((chart, id) => {
            const option = chart.getOption();
            status[id] = {
                library: 'ECharts',
                type: option.series?.[0]?.type || 'unknown',
                series: option.series?.length || 0,
                dataPoints: option.xAxis?.[0]?.data?.length || option.series?.[0]?.data?.length || 0
            };
        });
        
        return status;
    }
}

// 导出为全局变量
window.ChartRenderer = ChartRenderer;