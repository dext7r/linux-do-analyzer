export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("zh-CN");
}

export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString("zh-CN");
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}小时${minutes}分钟`;
  }
  return `${minutes}分钟`;
}

export function formatReadingTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  return `${hours.toFixed(1)}小时`;
}

export function groupByDate(items: any[], dateKey: string): Map<string, any[]> {
  const grouped = new Map<string, any[]>();

  items.forEach(item => {
    const date = formatDate(item[dateKey]);
    if (!grouped.has(date)) {
      grouped.set(date, []);
    }
    grouped.get(date)!.push(item);
  });

  return grouped;
}

export function groupByMonth(items: any[], dateKey: string): Map<string, any[]> {
  const grouped = new Map<string, any[]>();

  items.forEach(item => {
    const date = new Date(item[dateKey]);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    if (!grouped.has(monthKey)) {
      grouped.set(monthKey, []);
    }
    grouped.get(monthKey)!.push(item);
  });

  return grouped;
}

export function calculatePercentage(value: number, total: number): number {
  return total > 0 ? Math.round((value / total) * 100) : 0;
}

export function sortObjectByValue(obj: Record<string, number>): [string, number][] {
  return Object.entries(obj).sort(([,a], [,b]) => b - a);
}

export function generateColors(count: number): string[] {
  const colors = [
    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
    '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF',
    '#4BC0C0', '#FF6384', '#36A2EB', '#FFCE56'
  ];

  const result = [];
  for (let i = 0; i < count; i++) {
    result.push(colors[i % colors.length]);
  }

  return result;
}

export function extractFromUserAgent(userAgent: string): { browser: string; os: string; device: string } {
  const browser = userAgent.includes('Chrome') ? 'Chrome' :
                 userAgent.includes('Firefox') ? 'Firefox' :
                 userAgent.includes('Safari') ? 'Safari' : 'Other';

  const os = userAgent.includes('Windows') ? 'Windows' :
            userAgent.includes('Mac') ? 'macOS' :
            userAgent.includes('Linux') ? 'Linux' :
            userAgent.includes('Android') ? 'Android' :
            userAgent.includes('iOS') ? 'iOS' : 'Other';

  const device = userAgent.includes('Mobile') ? 'Mobile' :
                userAgent.includes('Tablet') ? 'Tablet' : 'Desktop';

  return { browser, os, device };
}