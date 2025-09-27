# Linux.do 论坛数据分析工具

这是一个基于 Deno 开发的 Linux.do 论坛个人数据分析工具，用于分析 Discourse 论坛导出的个人数据并生成可视化报告。

## 功能特性

- 📊 用户活跃度分析（访问量、阅读时长、发帖趋势）
- 💝 内容互动分析（点赞情况、话题参与度）
- 🏆 成就系统分析（徽章获得、信任等级进展）
- 🌍 设备和地理分析（访问设备分布、地理位置）
- 📈 交互式图表展示
- 📄 HTML 报告生成

## 使用方法

1. 将论坛导出的数据文件放在项目根目录
2. 运行分析工具：

```bash
# 启动分析服务
deno task start

# 开发模式
deno task dev

# 直接分析数据
deno task analyze

# 启动 Web 服务查看报告
deno task serve
```

## 数据文件说明

- `user_archive.csv` - 用户发帖和话题数据
- `visits.csv` - 每日访问记录
- `likes.csv` - 点赞记录
- `badges.csv` - 徽章获得记录
- `preferences.json` - 用户偏好和详细信息
- `auth_tokens.csv` - 登录设备信息

## 技术栈

- 🦕 Deno Runtime
- 📊 Chart.js / Plotly.js 图表库
- 🎨 原生 HTML/CSS/JavaScript
- 📈 数据可视化

## 许可证

MIT License