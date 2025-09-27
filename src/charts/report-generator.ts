import type { AnalysisResult } from "../types/index.ts";
import { ChartRenderer } from "./chart-renderer.ts";

export class ReportGenerator {
  private result: AnalysisResult;
  private chartRenderer: ChartRenderer;

  constructor(result: AnalysisResult) {
    this.result = result;
    this.chartRenderer = new ChartRenderer('report');
  }

  generateActivitySection(): string {
    return `
      <section class="analysis-section">
        <h2>📈 用户活跃度分析</h2>

        <div class="chart-grid">
          <div class="chart-item">
            <h3>每日访问量</h3>
            ${this.chartRenderer.renderLineChart(
              this.result.activityAnalysis.dailyVisits,
              {
                xAxisLabel: '日期',
                yAxisLabel: '阅读帖子数',
                plugins: {
                  title: {
                    display: true,
                    text: '每日阅读帖子数量趋势'
                  }
                }
              }
            )}
          </div>

          <div class="chart-item">
            <h3>阅读时长</h3>
            ${this.chartRenderer.renderLineChart(
              this.result.activityAnalysis.readingTime,
              {
                xAxisLabel: '日期',
                yAxisLabel: '时长(分钟)',
                plugins: {
                  title: {
                    display: true,
                    text: '每日阅读时长趋势'
                  }
                }
              }
            )}
          </div>

          <div class="chart-item">
            <h3>发帖时间线</h3>
            ${this.chartRenderer.renderBarChart(
              this.result.activityAnalysis.postsTimeline,
              {
                xAxisLabel: '月份',
                yAxisLabel: '发帖数量',
                plugins: {
                  title: {
                    display: true,
                    text: '月度发帖数量统计'
                  }
                }
              }
            )}
          </div>
        </div>
      </section>
    `;
  }

  generateInteractionSection(): string {
    return `
      <section class="analysis-section">
        <h2>💝 内容互动分析</h2>

        <div class="chart-grid">
          <div class="chart-item">
            <h3>点赞活动</h3>
            ${this.chartRenderer.renderLineChart(
              this.result.interactionAnalysis.likesGiven,
              {
                xAxisLabel: '月份',
                yAxisLabel: '点赞数量',
                plugins: {
                  title: {
                    display: true,
                    text: '月度点赞活动趋势'
                  }
                }
              }
            )}
          </div>

          <div class="chart-item">
            <h3>获得点赞</h3>
            ${this.chartRenderer.renderLineChart(
              this.result.interactionAnalysis.likesReceived,
              {
                xAxisLabel: '月份',
                yAxisLabel: '获得点赞',
                plugins: {
                  title: {
                    display: true,
                    text: '月度获得点赞趋势'
                  }
                }
              }
            )}
          </div>

          <div class="chart-item">
            <h3>话题参与</h3>
            ${this.chartRenderer.renderDoughnutChart(
              this.result.interactionAnalysis.topicParticipation,
              {
                plugins: {
                  title: {
                    display: true,
                    text: '各版块参与情况'
                  }
                }
              }
            )}
          </div>
        </div>
      </section>
    `;
  }

  generateAchievementSection(): string {
    return `
      <section class="analysis-section">
        <h2>🏆 成就系统分析</h2>

        <div class="chart-grid">
          <div class="chart-item">
            <h3>徽章获得</h3>
            ${this.chartRenderer.renderBarChart(
              this.result.achievementAnalysis.badgesEarned,
              {
                xAxisLabel: '月份',
                yAxisLabel: '徽章数量',
                plugins: {
                  title: {
                    display: true,
                    text: '月度徽章获得情况'
                  }
                }
              }
            )}
          </div>

          <div class="chart-item">
            <h3>信任等级</h3>
            ${this.chartRenderer.renderBarChart(
              this.result.achievementAnalysis.trustLevelProgress,
              {
                xAxisLabel: '等级',
                yAxisLabel: '达成状态',
                plugins: {
                  title: {
                    display: true,
                    text: '信任等级进展'
                  }
                }
              }
            )}
          </div>

          <div class="chart-item">
            <h3>社区贡献</h3>
            ${this.chartRenderer.renderRadarChart(
              this.result.achievementAnalysis.communityContribution,
              {
                plugins: {
                  title: {
                    display: true,
                    text: '社区贡献雷达图'
                  }
                }
              }
            )}
          </div>
        </div>
      </section>
    `;
  }

  generateDeviceSection(): string {
    return `
      <section class="analysis-section">
        <h2>🌍 设备和地理分析</h2>

        <div class="chart-grid">
          <div class="chart-item">
            <h3>设备分布</h3>
            ${this.chartRenderer.renderPieChart(
              this.result.deviceAnalysis.deviceDistribution,
              {
                plugins: {
                  title: {
                    display: true,
                    text: '访问设备类型分布'
                  }
                }
              }
            )}
          </div>

          <div class="chart-item">
            <h3>地理分布</h3>
            ${this.chartRenderer.renderDoughnutChart(
              this.result.deviceAnalysis.locationDistribution,
              {
                plugins: {
                  title: {
                    display: true,
                    text: '访问地点分布'
                  }
                }
              }
            )}
          </div>

          <div class="chart-item">
            <h3>浏览器分布</h3>
            ${this.chartRenderer.renderPieChart(
              this.result.deviceAnalysis.browserDistribution,
              {
                plugins: {
                  title: {
                    display: true,
                    text: '使用浏览器分布'
                  }
                }
              }
            )}
          </div>
        </div>
      </section>
    `;
  }

  generateSummarySection(): string {
    const summary = this.result.summary;

    return `
      <section class="summary-section">
        <h2>📊 数据概览</h2>

        <div class="summary-grid">
          <div class="summary-card">
            <div class="summary-icon">📝</div>
            <div class="summary-content">
              <h3>${summary.totalPosts}</h3>
              <p>总发帖数</p>
            </div>
          </div>

          <div class="summary-card">
            <div class="summary-icon">👍</div>
            <div class="summary-content">
              <h3>${summary.totalLikes}</h3>
              <p>获得点赞</p>
            </div>
          </div>

          <div class="summary-card">
            <div class="summary-icon">🏆</div>
            <div class="summary-content">
              <h3>${summary.totalBadges}</h3>
              <p>拥有徽章</p>
            </div>
          </div>

          <div class="summary-card">
            <div class="summary-icon">⭐</div>
            <div class="summary-content">
              <h3>等级 ${summary.trustLevel}</h3>
              <p>信任等级</p>
            </div>
          </div>

          <div class="summary-card">
            <div class="summary-icon">⏰</div>
            <div class="summary-content">
              <h3>${summary.readingHours}h</h3>
              <p>阅读时长</p>
            </div>
          </div>

          <div class="summary-card">
            <div class="summary-icon">📅</div>
            <div class="summary-content">
              <h3>${summary.activeVisitDays}</h3>
              <p>活跃天数</p>
            </div>
          </div>

          <div class="summary-card">
            <div class="summary-icon">🎂</div>
            <div class="summary-content">
              <h3>${summary.joinDate}</h3>
              <p>加入日期</p>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  generateFullReport(): string {
    return `
      <!DOCTYPE html>
      <html lang="zh-CN">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Linux.do 论坛数据分析报告</title>
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
        <link rel="stylesheet" href="./public/css/report.css">
      </head>
      <body>
        <div class="container">
          <header class="report-header">
            <h1>🐧 Linux.do 论坛数据分析报告</h1>
            <p class="report-subtitle">基于个人数据导出的深度分析</p>
            <div class="report-meta">
              <span>生成时间: ${new Date().toLocaleString('zh-CN')}</span>
            </div>
          </header>

          <main class="report-content">
            ${this.generateSummarySection()}
            ${this.generateActivitySection()}
            ${this.generateInteractionSection()}
            ${this.generateAchievementSection()}
            ${this.generateDeviceSection()}
          </main>

          <footer class="report-footer">
            <p>🦕 Powered by Deno & Chart.js</p>
            <p>📊 Generated by Linux.do Data Analyzer</p>
          </footer>
        </div>
      </body>
      </html>
    `;
  }
}