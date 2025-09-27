# CLAUDE.md

此文件为 Claude Code (claude.ai/code) 在此代码仓库中工作时提供指导。

## 项目概述

Linux.do 数据分析工具是一个纯前端 Web 应用程序，用于分析 Linux.do 论坛个人数据导出文件。该应用程序处理包含 CSV 和 JSON 数据文件的 ZIP 压缩包，生成交互式可视化图表和详细报告。

## 核心开发命令

```bash
# 开发服务器（支持文件监听）
deno task dev

# 生产服务器
deno task serve

# 预览服务器（3000端口）
deno task preview

# 代码格式化
deno task fmt

# 代码检查
deno task lint

# 类型检查
deno task check

# 清理临时文件
deno task clean

# 生产构建
deno task bundle
```

## 架构概览

### 核心模块系统

应用程序采用模块化架构，包含六个主要 JavaScript 类：

1. **App** (`js/app.js`) - 主应用程序协调器和入口点
   - 初始化所有其他模块
   - 管理应用程序生命周期和错误处理
   - 协调文件处理工作流

2. **DataManager** (`js/data-manager.js`) - IndexedDB 存储层
   - 使用 IndexedDB 处理浏览器本地存储
   - 管理分析数据的持久化和检索
   - 提供数据清理和导出功能

3. **ZipParser** (`js/zip-parser.js`) - 文件处理引擎
   - 使用 JSZip 库解析 ZIP 压缩包
   - 支持 Linux.do 导出的多种 CSV/JSON 文件格式
   - 验证文件类型并强制执行大小限制（10MB）

4. **DataAnalyzer** (`js/data-analyzer.js`) - 分析计算引擎
   - 将解析的数据处理为统计摘要
   - 生成指标、趋势和用户行为模式
   - 缓存计算结果以提高性能

5. **ChartRenderer** (`js/chart-renderer.js`) - 可视化层
   - 使用 Chart.js 创建交互式图表
   - 支持多种图表类型（折线图、柱状图、饼图、环形图）
   - 处理响应式设计和主题适配

6. **UIManager** (`js/ui-manager.js`) - 用户界面控制器
   - 管理 DOM 交互和状态
   - 处理拖拽文件上传
   - 提供分页、搜索和主题切换
   - 协调移动端响应式行为

### 数据流架构

```
ZIP 文件上传 → ZipParser → DataAnalyzer → ChartRenderer + UIManager
                     ↓
                DataManager (IndexedDB 存储)
```

### 支持的数据文件

应用程序处理 Linux.do 导出文件：

**必需文件：**
- `user_archive.csv` - 帖子和主题数据
- `preferences.json` - 用户配置信息

**可选文件：**
- `visits.csv` - 每日访问记录
- `likes.csv` - 点赞活动记录
- `user_badges.csv` - 徽章成就
- `auth_tokens.csv` - 登录设备信息
- `bookmarks.csv` - 书签记录
- `user_flags.csv` - 举报/标记记录
- `queued_posts.csv` - 审核队列数据

## 开发指南

### 文件组织

- 主 HTML 文件在 `index.html`，内嵌 TailwindCSS 配置
- JavaScript 模块在 `js/` 目录中，功能职责分离明确
- CSS 自定义样式在 `css/style.css`，使用 CSS 自定义属性实现主题化
- Deno 配置在 `deno.json`，包含完整的任务定义

### 错误处理

- 每个模块都实现全面的错误处理和用户友好的错误消息
- 网络和文件处理错误通过 toast 通知显示
- 应用程序初始化时执行浏览器兼容性检查

### 性能考虑

- 大数据集通过分页处理（可配置页面大小：25、50、100、200）
- 图表渲染通过缓存和响应式更新优化
- 文件处理使用流式处理提高内存效率
- IndexedDB 操作为异步非阻塞

### 浏览器兼容性

- 需要现代浏览器 API：IndexedDB、File API、ES6+ 特性
- 移动端优化，支持触摸手势和响应式设计
- 对旧版浏览器采用渐进增强

### 主题系统

- 三个预定义主题：苹果（默认）、小米、华为
- 使用 CSS 自定义属性实现一致的主题化
- 通过 localStorage 持久化主题设置
- 图表颜色动态适配

## 测试和质量

- 提交前使用 `deno fmt` 保持一致的代码风格
- 运行 `deno lint` 检查潜在问题
- 使用各种 Linux.do 导出文件格式进行测试
- 验证跨浏览器兼容性，特别是文件处理功能

## 常见开发模式

### 添加新图表类型

1. 在 `ChartRenderer.generateChartConfig()` 中扩展新图表类型
2. 在 `DataAnalyzer` 中添加图表数据准备逻辑
3. 在 `UIManager.renderAnalysisResults()` 中更新 UI 渲染

### 添加新数据文件支持

1. 更新 `ZipParser.supportedFiles` 对象
2. 在 `ZipParser.parseSpecificFile()` 中添加解析逻辑
3. 在 `DataAnalyzer` 方法中扩展分析功能
4. 在 `UIManager` 中添加对应的 UI 组件

### 扩展存储功能

1. 修改 `DataManager.initDB()` 以支持新的对象存储
2. 在 `DataManager` 中添加相应的 CRUD 方法
3. 在主 `App` 类中更新分析数据持久化

## 部署说明

- 纯客户端应用程序 - 可作为静态文件部署
- 无需服务器端处理
- 所有数据处理在浏览器中进行，保护隐私

### 兼容的部署平台

**免费静态托管平台：**

- **GitHub Pages** - 直接从 GitHub 仓库部署
- **Vercel** - 零配置部署，支持自动构建
- **Netlify** - 拖拽部署或 Git 集成
- **Surge.sh** - 命令行工具快速部署
- **GitLab Pages** - GitLab 内置静态托管
- **Cloudflare Pages** - 全球 CDN 加速
- **Firebase Hosting** - Google 云平台静态托管
- **Azure Static Web Apps** - 微软云静态应用
- **Render** - 现代化部署平台

**CDN 和云存储平台：**

- **AWS S3 + CloudFront** - 亚马逊云服务
- **阿里云 OSS** - 国内访问优化
- **腾讯云 COS** - 腾讯云对象存储
- **七牛云** - 国内 CDN 服务商
- **又拍云** - 专业 CDN 服务

**专业托管服务：**

- **Deno Deploy** - Deno 官方部署平台（推荐）
- **Railway** - 简单快速的部署服务
- **Fly.io** - 全球边缘计算平台

### 部署步骤示例

```bash
# GitHub Pages
git push origin main
# 在仓库设置中启用 Pages

# Vercel
npm i -g vercel
vercel --prod

# Netlify
npm i -g netlify-cli
netlify deploy --prod --dir .

# Surge.sh
npm i -g surge
surge . your-domain.surge.sh

# Deno Deploy
deno task serve
# 连接 GitHub 仓库到 Deno Deploy
```

### 域名配置

大多数平台都支持自定义域名：

- 添加 CNAME 记录指向平台提供的地址
- 配置 SSL 证书（大多数平台自动提供）
- 设置重定向规则（可选）
