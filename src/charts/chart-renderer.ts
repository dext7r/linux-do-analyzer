import type { ChartData } from "../types/index.ts";

export class ChartRenderer {
  private containerId: string;

  constructor(containerId: string) {
    this.containerId = containerId;
  }

  renderLineChart(data: ChartData, options: any = {}): string {
    const chartId = `chart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const defaultOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top'
        },
        tooltip: {
          mode: 'index',
          intersect: false
        }
      },
      scales: {
        x: {
          display: true,
          title: {
            display: true,
            text: options.xAxisLabel || ''
          }
        },
        y: {
          display: true,
          title: {
            display: true,
            text: options.yAxisLabel || ''
          },
          beginAtZero: true
        }
      },
      elements: {
        line: {
          tension: 0.4
        }
      }
    };

    const config = {
      type: 'line',
      data: data,
      options: { ...defaultOptions, ...options }
    };

    return `
      <div class="chart-container">
        <canvas id="${chartId}" width="400" height="200"></canvas>
      </div>
      <script>
        (function() {
          const ctx = document.getElementById('${chartId}').getContext('2d');
          new Chart(ctx, ${JSON.stringify(config)});
        })();
      </script>
    `;
  }

  renderBarChart(data: ChartData, options: any = {}): string {
    const chartId = `chart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const defaultOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top'
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: options.xAxisLabel || ''
          }
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: options.yAxisLabel || ''
          }
        }
      }
    };

    const config = {
      type: 'bar',
      data: data,
      options: { ...defaultOptions, ...options }
    };

    return `
      <div class="chart-container">
        <canvas id="${chartId}" width="400" height="200"></canvas>
      </div>
      <script>
        (function() {
          const ctx = document.getElementById('${chartId}').getContext('2d');
          new Chart(ctx, ${JSON.stringify(config)});
        })();
      </script>
    `;
  }

  renderPieChart(data: ChartData, options: any = {}): string {
    const chartId = `chart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const defaultOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right'
        },
        tooltip: {
          callbacks: {
            label: function(context: any) {
              const label = context.label || '';
              const value = context.parsed;
              const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
              const percentage = Math.round((value / total) * 100);
              return `${label}: ${value} (${percentage}%)`;
            }
          }
        }
      }
    };

    const config = {
      type: 'pie',
      data: data,
      options: { ...defaultOptions, ...options }
    };

    return `
      <div class="chart-container">
        <canvas id="${chartId}" width="400" height="200"></canvas>
      </div>
      <script>
        (function() {
          const ctx = document.getElementById('${chartId}').getContext('2d');
          new Chart(ctx, ${JSON.stringify(config)});
        })();
      </script>
    `;
  }

  renderDoughnutChart(data: ChartData, options: any = {}): string {
    const chartId = `chart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const defaultOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right'
        },
        tooltip: {
          callbacks: {
            label: function(context: any) {
              const label = context.label || '';
              const value = context.parsed;
              const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
              const percentage = Math.round((value / total) * 100);
              return `${label}: ${value} (${percentage}%)`;
            }
          }
        }
      }
    };

    const config = {
      type: 'doughnut',
      data: data,
      options: { ...defaultOptions, ...options }
    };

    return `
      <div class="chart-container">
        <canvas id="${chartId}" width="400" height="200"></canvas>
      </div>
      <script>
        (function() {
          const ctx = document.getElementById('${chartId}').getContext('2d');
          new Chart(ctx, ${JSON.stringify(config)});
        })();
      </script>
    `;
  }

  renderRadarChart(data: ChartData, options: any = {}): string {
    const chartId = `chart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const defaultOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top'
        }
      },
      scales: {
        r: {
          beginAtZero: true,
          title: {
            display: true,
            text: options.title || ''
          }
        }
      }
    };

    const config = {
      type: 'radar',
      data: data,
      options: { ...defaultOptions, ...options }
    };

    return `
      <div class="chart-container">
        <canvas id="${chartId}" width="400" height="200"></canvas>
      </div>
      <script>
        (function() {
          const ctx = document.getElementById('${chartId}').getContext('2d');
          new Chart(ctx, ${JSON.stringify(config)});
        })();
      </script>
    `;
  }
}