/**
 * 图表渲染器
 * 负责使用Chart.js和ECharts渲染各种数据可视化图表
 */
class ChartRenderer {
    constructor() {
        this.charts = new Map();
        this.echartsInstances = new Map();
        this.defaultOptions = this.getDefaultOptions();
    }

    /**
     * 获取默认图表配置
     */
    getDefaultOptions() {
        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true,
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: 'white',
                    bodyColor: 'white',
                    borderColor: 'rgba(102, 126, 234, 0.5)',
                    borderWidth: 1,
                    cornerRadius: 8,
                    displayColors: true,
                    mode: 'index',
                    intersect: false
                }
            },
            interaction: {
                mode: 'index',
                intersect: false
            }
        };
    }

    /**
     * 渲染访问活动图表
     */
    renderVisitsChart(data) {
        // 渲染到两个位置：总览页和图表页
        const chartIds = ['visitsChart', 'visitsChartDetail'];

        chartIds.forEach(chartId => {
            this.destroyChart(chartId);
            const ctx = document.getElementById(chartId);
            if (!ctx) {
                return; // 如果元素不存在，跳过
            }

            const options = {
            ...this.defaultOptions,
            plugins: {
                ...this.defaultOptions.plugins,
                title: {
                    display: true,
                    text: '最近30天访问活动趋势',
                    font: {
                        size: 16,
                        weight: 'bold'
                    },
                    color: '#374151'
                }
            },
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: '日期',
                        color: '#6B7280'
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        maxTicksLimit: 10,
                        color: '#6B7280'
                    }
                },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: '阅读帖子数',
                        color: '#667eea'
                    },
                    grid: {
                        color: 'rgba(102, 126, 234, 0.1)'
                    },
                    ticks: {
                        color: '#667eea'
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: '阅读时间(分钟)',
                        color: '#a855f7'
                    },
                    grid: {
                        drawOnChartArea: false
                    },
                    ticks: {
                        color: '#a855f7'
                    }
                }
            }
        };

            this.charts.set(chartId, new Chart(ctx, {
                type: 'line',
                data: data,
                options: options
            }));

            // 添加导出按钮
            this.addExportButton(chartId, ctx.canvas);
        });

        console.log('访问活动图表渲染完成');
    }

    /**
     * 渲染徽章获得图表
     */
    renderBadgesChart(data) {
        const chartId = 'badgesChart';
        this.destroyChart(chartId);

        const ctx = document.getElementById(chartId);
        if (!ctx) {
            console.error('找不到图表容器:', chartId);
            return;
        }

        const options = {
            ...this.defaultOptions,
            plugins: {
                ...this.defaultOptions.plugins,
                title: {
                    display: true,
                    text: '每月获得徽章统计',
                    font: {
                        size: 16,
                        weight: 'bold'
                    },
                    color: '#374151'
                }
            },
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: '月份',
                        color: '#6B7280'
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        color: '#6B7280'
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: '徽章数量',
                        color: '#6B7280'
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        color: '#6B7280',
                        stepSize: 1
                    }
                }
            }
        };

        this.charts.set(chartId, new Chart(ctx, {
            type: 'bar',
            data: data,
            options: options
        }));

        // 添加导出按钮
        this.addExportButton(chartId, ctx.canvas);

        console.log('徽章获得图表渲染完成');
    }

    /**
     * 渲染设备使用分布图表
     */
    renderDeviceChart(data) {
        const chartId = 'deviceChart';
        this.destroyChart(chartId);

        const ctx = document.getElementById(chartId);
        if (!ctx) {
            console.error('找不到图表容器:', chartId);
            return;
        }

        const total = data.datasets[0].data.reduce((a, b) => a + b, 0);

        const options = {
            ...this.defaultOptions,
            plugins: {
                ...this.defaultOptions.plugins,
                title: {
                    display: true,
                    text: '设备使用分布',
                    font: {
                        size: 16,
                        weight: 'bold'
                    },
                    color: '#374151'
                },
                tooltip: {
                    ...this.defaultOptions.plugins.tooltip,
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed;
                            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
                            return `${label}: ${value} 次 (${percentage}%)`;
                        }
                    }
                }
            }
        };

        this.charts.set(chartId, new Chart(ctx, {
            type: 'doughnut',
            data: data,
            options: options
        }));

        // 添加导出按钮
        this.addExportButton(chartId, ctx.canvas);

        console.log('设备使用分布图表渲染完成');
    }

    /**
     * 渲染发帖活动时间分布图表
     */
    renderPostsChart(data) {
        const chartId = 'postsChart';
        this.destroyChart(chartId);

        const ctx = document.getElementById(chartId);
        if (!ctx) {
            console.error('找不到图表容器:', chartId);
            return;
        }

        const options = {
            ...this.defaultOptions,
            plugins: {
                ...this.defaultOptions.plugins,
                title: {
                    display: true,
                    text: '24小时发帖活动分布',
                    font: {
                        size: 16,
                        weight: 'bold'
                    },
                    color: '#374151'
                }
            },
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: '时间(小时)',
                        color: '#6B7280'
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        color: '#6B7280'
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: '发帖数量',
                        color: '#6B7280'
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        color: '#6B7280',
                        stepSize: 1
                    }
                }
            }
        };

        this.charts.set(chartId, new Chart(ctx, {
            type: 'bar',
            data: data,
            options: options
        }));

        // 添加导出按钮
        this.addExportButton(chartId, ctx.canvas);

        console.log('发帖活动分布图表渲染完成');
    }

    /**
     * 渲染点赞活动趋势图表
     */
    renderLikesChart(data) {
        const chartId = 'likesChart';
        this.destroyChart(chartId);

        const ctx = document.getElementById(chartId);
        if (!ctx) {
            console.error('找不到图表容器:', chartId);
            return;
        }

        const options = {
            ...this.defaultOptions,
            plugins: {
                ...this.defaultOptions.plugins,
                title: {
                    display: true,
                    text: '每月点赞活动趋势',
                    font: {
                        size: 16,
                        weight: 'bold'
                    },
                    color: '#374151'
                }
            },
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: '月份',
                        color: '#6B7280'
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        color: '#6B7280'
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: '点赞数量',
                        color: '#6B7280'
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        color: '#6B7280'
                    }
                }
            }
        };

        this.charts.set(chartId, new Chart(ctx, {
            type: 'line',
            data: data,
            options: options
        }));

        // 添加导出按钮
        this.addExportButton(chartId, ctx.canvas);

        console.log('点赞活动趋势图表渲染完成');
    }

    /**
     * 渲染分类活动图表
     */
    renderCategoryChart(categoryData) {
        const chartId = 'categoryChart';
        this.destroyChart(chartId);

        const ctx = document.getElementById(chartId);
        if (!ctx) {
            console.warn('找不到分类图表容器:', chartId);
            return;
        }

        if (!categoryData || categoryData.length === 0) {
            console.warn('分类数据为空');
            return;
        }

        const data = {
            labels: categoryData.map(cat => cat.name),
            datasets: [{
                label: '发帖数',
                data: categoryData.map(cat => cat.posts),
                backgroundColor: 'rgba(102, 126, 234, 0.8)',
                borderColor: 'rgb(102, 126, 234)',
                borderWidth: 1
            }]
        };

        const options = {
            ...this.defaultOptions,
            indexAxis: 'y',
            plugins: {
                ...this.defaultOptions.plugins,
                title: {
                    display: true,
                    text: '热门分类发帖统计',
                    font: {
                        size: 16,
                        weight: 'bold'
                    },
                    color: '#374151'
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: '发帖数量',
                        color: '#6B7280'
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        color: '#6B7280'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: '分类',
                        color: '#6B7280'
                    },
                    ticks: {
                        color: '#6B7280'
                    }
                }
            }
        };

        this.charts.set(chartId, new Chart(ctx, {
            type: 'bar',
            data: data,
            options: options
        }));

        // 添加导出按钮
        this.addExportButton(chartId, ctx.canvas);

        console.log('分类活动图表渲染完成');
    }

    /**
     * 渲染综合活动趋势图表
     */
    renderActivityTrendChart(data) {
        const chartId = 'activityTrendChart';
        this.destroyChart(chartId);

        const ctx = document.getElementById(chartId);
        if (!ctx) {
            console.warn('找不到综合活动趋势图表容器:', chartId);
            return;
        }

        // 准备图表数据
        const chartData = {
            labels: data.labels || [],
            datasets: [
                {
                    label: '发帖',
                    data: data.posts || [],
                    borderColor: '#6366f1',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    tension: 0.4
                },
                {
                    label: '点赞',
                    data: data.likes || [],
                    borderColor: '#ec4899',
                    backgroundColor: 'rgba(236, 72, 153, 0.1)',
                    tension: 0.4
                },
                {
                    label: '访问',
                    data: data.visits || [],
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4
                }
            ]
        };

        const options = {
            ...this.defaultOptions,
            plugins: {
                ...this.defaultOptions.plugins,
                title: {
                    display: false
                },
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        color: '#6B7280',
                        padding: 15,
                        font: {
                            size: 12
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(156, 163, 175, 0.1)'
                    },
                    ticks: {
                        color: '#6B7280'
                    }
                },
                y: {
                    grid: {
                        color: 'rgba(156, 163, 175, 0.1)'
                    },
                    ticks: {
                        color: '#6B7280'
                    }
                }
            }
        };

        this.charts.set(chartId, new Chart(ctx, {
            type: 'line',
            data: chartData,
            options: options
        }));

        // 添加导出按钮
        this.addExportButton(chartId, ctx.canvas);

        console.log('综合活动趋势图表渲染完成');
    }

    /**
     * 销毁指定图表
     */
    destroyChart(chartId) {
        if (this.charts.has(chartId)) {
            this.charts.get(chartId).destroy();
            this.charts.delete(chartId);
            console.log(`销毁Chart.js图表: ${chartId}`);
        }
        if (this.echartsInstances.has(chartId)) {
            this.echartsInstances.get(chartId).dispose();
            this.echartsInstances.delete(chartId);
            console.log(`销毁ECharts图表: ${chartId}`);
        }
    }

    /**
     * 销毁所有图表
     */
    destroyAllCharts() {
        this.charts.forEach((chart, id) => {
            chart.destroy();
            console.log(`销毁Chart.js图表: ${id}`);
        });
        this.charts.clear();
        
        this.echartsInstances.forEach((chart, id) => {
            chart.dispose();
            console.log(`销毁ECharts图表: ${id}`);
        });
        this.echartsInstances.clear();
        
        console.log('所有图表已销毁');
    }

    /**
     * 更新图表数据
     */
    updateChart(chartId, newData) {
        if (this.charts.has(chartId)) {
            const chart = this.charts.get(chartId);
            chart.data = newData;
            chart.update('active');
            console.log(`更新图表: ${chartId}`);
        } else {
            console.warn(`图表不存在: ${chartId}`);
        }
    }

    /**
     * 获取图表实例
     */
    getChart(chartId) {
        return this.charts.get(chartId);
    }

    /**
     * 检查图表是否存在
     */
    hasChart(chartId) {
        return this.charts.has(chartId);
    }

    /**
     * 导出图表为图片（支持Chart.js和ECharts）
     */
    exportChartAsImage(chartId, filename = 'chart.png', format = 'png') {
        // 检查Chart.js图表
        if (this.charts.has(chartId)) {
            const chart = this.charts.get(chartId);
            const canvas = chart.canvas;
            const url = canvas.toDataURL(`image/${format}`);
            this.downloadImage(url, filename);
            console.log(`导出Chart.js图表: ${chartId} -> ${filename}`);
            return;
        }

        // 检查ECharts图表
        if (this.echartsInstances.has(chartId)) {
            const chart = this.echartsInstances.get(chartId);
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
        
        // 导出Chart.js图表
        this.charts.forEach((chart, id) => {
            const filename = `chart_${id}_${timestamp}.${format}`;
            this.exportChartAsImage(id, filename, format);
        });

        // 导出ECharts图表
        this.echartsInstances.forEach((chart, id) => {
            const filename = `chart_${id}_${timestamp}.${format}`;
            this.exportChartAsImage(id, filename, format);
        });

        console.log(`批量导出完成，格式: ${format}`);
    }

    /**
     * 创建ECharts图表
     */
    createEChart(chartId, option) {
        const container = document.getElementById(chartId);
        if (!container) {
            console.error('找不到图表容器:', chartId);
            return null;
        }

        // 销毁已存在的图表
        this.destroyChart(chartId);

        // 创建新的ECharts实例
        const chart = echarts.init(container);
        chart.setOption(option);
        
        this.echartsInstances.set(chartId, chart);
        
        // 添加导出按钮
        this.addExportButton(chartId, container);
        
        console.log(`ECharts图表创建完成: ${chartId}`);
        return chart;
    }

    /**
     * 为图表容器添加导出按钮
     */
    addExportButton(chartId, container) {
        // 如果传入的是canvas元素，获取其父容器
        if (container.tagName === 'CANVAS') {
            container = container.parentElement;
        }
        
        // 检查是否已存在导出按钮
        const existingButton = container.querySelector('.export-btn');
        if (existingButton) {
            existingButton.remove();
        }

        // 创建导出按钮
        const exportBtn = document.createElement('button');
        exportBtn.className = 'export-btn absolute top-2 right-2 bg-blue-500 hover:bg-blue-600 text-white text-xs px-2 py-1 rounded shadow-lg z-10';
        exportBtn.innerHTML = '📥 导出';
        exportBtn.title = '导出图表为PNG图片';
        
        exportBtn.onclick = () => {
            const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
            const filename = `${chartId}_${timestamp}.png`;
            this.exportChartAsImage(chartId, filename);
        };

        // 确保父容器有相对定位
        container.style.position = 'relative';
        container.appendChild(exportBtn);
    }

    /**
     * 调整所有图表大小（移动端优化）
     */
    resizeAllCharts() {
        // 调整Chart.js图表
        this.charts.forEach((chart, id) => {
            try {
                chart.resize();
                console.log(`调整Chart.js图表大小: ${id}`);
            } catch (error) {
                console.warn(`调整Chart.js图表 ${id} 大小失败:`, error);
            }
        });

        // 调整ECharts图表
        this.echartsInstances.forEach((chart, id) => {
            try {
                chart.resize();
                console.log(`调整ECharts图表大小: ${id}`);
            } catch (error) {
                console.warn(`调整ECharts图表 ${id} 大小失败:`, error);
            }
        });
    }

    /**
     * 获取所有图表状态
     */
    getChartsStatus() {
        const status = {};
        
        // Chart.js图表状态
        this.charts.forEach((chart, id) => {
            status[id] = {
                library: 'Chart.js',
                type: chart.config.type,
                datasets: chart.data.datasets.length,
                dataPoints: chart.data.labels.length
            };
        });

        // ECharts图表状态
        this.echartsInstances.forEach((chart, id) => {
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