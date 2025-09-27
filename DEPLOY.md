# 🚀 Deno Deploy 部署指南

## 📦 项目准备

项目已完成所有Web应用功能开发，包括：

- ✅ ZIP文件上传和解析
- ✅ 在线数据分析
- ✅ 交互式报告生成
- ✅ 响应式Web界面
- ✅ 会话管理和自动清理

## 🔧 Deno Deploy 部署步骤

### 1. 准备代码仓库

```bash
# 1. 将代码推送到 GitHub
git init
git add .
git commit -m "Initial commit: Linux.do data analyzer web app"
git remote add origin <your-github-repo-url>
git push -u origin main
```

### 2. 在 Deno Deploy 创建项目

1. 访问 [Deno Deploy Console](https://dash.deno.com)
2. 点击 "New Project"
3. 连接 GitHub 仓库
4. 配置部署设置：
   - **Entry Point**: `main.ts`
   - **Environment**: Production
   - **Build Command**: 留空（Deno 不需要构建步骤）

### 3. 环境变量配置

在 Deno Deploy 项目设置中添加环境变量：

```
PORT=8000  # 可选，Deno Deploy 会自动分配
```

### 4. 域名配置

Deno Deploy 会自动分配一个 `.deno.dev` 域名，如：
`https://your-project-name.deno.dev`

## 📁 关键文件说明

### `main.ts` - Deno Deploy 入口文件
- 包含完整的Web服务器逻辑
- 内嵌了上传界面HTML
- 处理ZIP文件分析API
- 自动会话管理

### `src/` 目录结构
```
src/
├── web-analyzer.ts      # Web分析器核心
├── analyzers/           # 数据分析模块
├── charts/              # 图表生成器
├── types/               # TypeScript类型
└── utils/               # 工具函数
    ├── zip-loader.ts    # ZIP文件处理
    └── data-loader.ts   # 数据加载器
```

## 🔗 API 端点

部署后可用的API端点：

- `GET /` - 上传界面
- `POST /api/analyze` - 分析ZIP文件
- `GET /report/{id}` - 查看分析报告
- `GET /api/report/{id}` - 下载报告
- `GET /api/status` - 服务状态
- `GET /demo` - 使用教程

## 🛠️ 本地开发

```bash
# 启动开发服务器
deno task web-dev

# 启动生产服务器
deno task web

# 测试分析功能
deno task analyze
```

## 📊 使用流程

1. **上传数据**: 用户拖拽或选择ZIP文件
2. **文件验证**: 检查必需文件（user_archive.csv, preferences.json）
3. **数据解析**: 使用JSZip解压，CSV/JSON解析数据
4. **数据分析**: 多维度分析生成图表数据
5. **报告生成**: 生成包含Chart.js图表的HTML报告
6. **会话管理**: 24小时后自动清理临时数据

## 🔒 安全特性

- ✅ 文件类型验证（仅允许ZIP）
- ✅ 内存中临时处理，不持久化存储
- ✅ 自动会话过期（24小时）
- ✅ 无服务器架构，天然安全隔离
- ✅ HTTPS 自动启用

## 🎯 性能优化

- 并发文件处理
- 内存高效的数据流处理
- Chart.js CDN加载
- 响应式图表渲染
- 自动垃圾回收

## 📱 功能特色

- **拖拽上传**: 现代化文件上传体验
- **实时进度**: 分析进度条显示
- **自动跳转**: 分析完成后自动查看报告
- **移动友好**: 完全响应式设计
- **离线可用**: 生成的报告可下载保存

## 🌐 部署后的用户流程

1. 访问 `https://your-project.deno.dev`
2. 上传从 Linux.do 导出的ZIP文件
3. 等待几秒钟完成分析
4. 查看包含多种图表的详细报告
5. 可选择下载报告保存本地

---

🎉 **部署完成后，你将拥有一个功能完整的Linux.do论坛数据分析Web应用！**