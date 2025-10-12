# 🐧 Linux.do 论坛数据分析工具

🌟 **一个现代化的 Linux.do 论坛个人数据分析工具，提供全面的数据可视化和深度分析功能。**

<div align="center">

### 📦 核心信息

[![npm version](https://badge.fury.io/js/linux-do-analyzer.svg)](https://badge.fury.io/js/linux-do-analyzer)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

### 📊 下载和社交统计

[![Downloads](https://img.shields.io/npm/dt/linux-do-analyzer.svg)](https://www.npmjs.com/package/linux-do-analyzer)
[![GitHub Stars](https://img.shields.io/github/stars/dext7r/linux-do-analyzer?style=social)](https://github.com/dext7r/linux-do-analyzer)
[![GitHub Forks](https://img.shields.io/github/forks/dext7r/linux-do-analyzer?style=social)](https://github.com/dext7r/linux-do-analyzer/fork)

### ✅ 构建和安全状态

[![Build Status](https://github.com/dext7r/linux-do-analyzer/workflows/CI/badge.svg)](https://github.com/dext7r/linux-do-analyzer/actions)
[![CodeQL](https://github.com/dext7r/linux-do-analyzer/workflows/CodeQL/badge.svg)](https://github.com/dext7r/linux-do-analyzer/actions)
[![Security Rating](https://img.shields.io/badge/security-A+-green)](https://github.com/dext7r/linux-do-analyzer/security)

### 🌐 平台和兼容性

[![Platform Support](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-blue)](https://github.com/dext7r/linux-do-analyzer)
[![Browser Support](https://img.shields.io/badge/browsers-Chrome%20%7C%20Firefox%20%7C%20Safari%20%7C%20Edge-orange)](https://github.com/dext7r/linux-do-analyzer)
[![Privacy First](https://img.shields.io/badge/privacy-100%25%20local-success)](https://github.com/dext7r/linux-do-analyzer)

### 📅 维护和发布信息

[![GitHub release](https://img.shields.io/github/release/dext7r/linux-do-analyzer.svg)](https://github.com/dext7r/linux-do-analyzer/releases)
[![GitHub last commit](https://img.shields.io/github/last-commit/dext7r/linux-do-analyzer)](https://github.com/dext7r/linux-do-analyzer/commits)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://github.com/dext7r/linux-do-analyzer/graphs/commit-activity)

---

### 🚀 快速开始

**🌐 在线体验**: [https://linux-do-analyzer.jhun.edu.kg/](https://linux-do-analyzer.jhun.edu.kg/)

**📦 NPM 安装**: `npm install -g linux-do-analyzer`

**🔧 NPX 使用**: `npx linux-do-analyzer`

</div>

## ✨ 项目概述

这是一个专为 Linux.do 论坛用户设计的数据分析工具，采用纯前端技术栈构建，支持本地 ZIP 文件上传和实时数据分析。用户可以将从论坛导出的个人数据包上传到工具中，获得详细的多维度数据分析报告和精美的可视化图表。现在工具已适配 [Linux.do](https://linux.do) 与 [IDCFlare](https://idcflare.com) 双平台导出的个人数据，无需额外转换即可直接分析。

## 🚀 安装和使用

### 🌐 在线直接使用

**无需安装，直接访问：[https://linux-do-analyzer.jhun.edu.kg/](https://linux-do-analyzer.jhun.edu.kg/)**

⚡ 打开即用，支持所有浏览器，完全免费！

<details>
<summary><strong>📦 NPM 包安装</strong></summary>

### 全局安装

```bash
npm install -g linux-do-analyzer
# 或使用 yarn
yarn global add linux-do-analyzer
# 或使用 pnpm
pnpm add -g linux-do-analyzer
```

### 使用 CLI 命令

```bash
# 启动服务器（默认端口 8080）
linux-do-analyzer

# 指定端口启动
linux-do-analyzer --port 3000

# 开发模式启动
linux-do-analyzer --dev

# 查看帮助
linux-do-analyzer --help

# 查看版本
linux-do-analyzer --version
```

</details>

<details>
<summary><strong>🔧 NPX 一键使用</strong></summary>

无需安装，直接使用：

```bash
# 使用 npx 启动（默认端口 8080）
npx linux-do-analyzer

# 指定端口
npx linux-do-analyzer --port 3000

# 开发模式
npx linux-do-analyzer --dev
```

</details>

<details>
<summary><strong>📎 PNPX 快速启动</strong></summary>

使用 pnpm 的 npx 等价工具：

```bash
# 使用 pnpx 启动
pnpx linux-do-analyzer

# 指定端口
pnpx linux-do-analyzer --port 3000

# 开发模式
pnpx linux-do-analyzer --dev
```

</details>

<details>
<summary><strong>💻 本地开发</strong></summary>

### 克隆项目

```bash
git clone https://github.com/dext7r/linux-do-analyzer.git
cd linux-do-analyzer
```

### 使用 Node.js

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 启动生产服务器
npm start

# 指定端口启动
npm run serve -- --port 3000
```

### 使用 Deno

```bash
# 启动开发服务器（支持文件监听）
deno task dev

# 启动生产服务器
deno task serve

# 预览服务器（3000端口）
deno task preview
```

### 使用其他工具

```bash
# 使用 Python
python -m http.server 8080

# 使用 live-server
npx live-server --port=8080

# 使用 serve
npx serve -p 8080
```

</details>

## 🎯 核心特性

<details>
<summary><strong>📊 全面数据分析</strong></summary>

- **👥 用户活跃度分析** - 访问量趋势、阅读时长统计、发帖活动分布
- **💬 社交互动分析** - 点赞给出/收到分析、话题参与度评估
- **🏆 成就系统分析** - 徽章获得时间线、信任等级进展追踪
- **📱 设备使用分析** - 访问设备类型、浏览器分布、地理位置统计
- **📂 内容分类分析** - 各板块活跃度、发帖主题分布

</details>

<details>
<summary><strong>🎨 现代化界面设计</strong></summary>

- **📱 响应式设计** - 完美适配桌面端、平板和移动设备
- **🌈 渐变背景** - 科技感十足的深色主题和动态背景效果
- **🎮 交互式图表** - 基于 ECharts 的高质量数据可视化
- **🎯 卡片式布局** - 清晰的信息层级和优雅的视觉呈现
- **✨ 动画效果** - 流畅的页面加载和交互动画

</details>

<details>
<summary><strong>🔒 隐私安全保护</strong></summary>

- **💯 100% 本地处理** - 所有数据分析完全在浏览器中进行
- **🚫 无服务器上传** - 文件不会被上传到任何服务器
- **⚡ 即时分析** - 实时解析和分析，无需等待
- **🔍 数据完整性** - 全面验证数据文件的完整性和有效性

</details>

## 🛠️ 技术架构

<details>
<summary><strong>📚 前端技术栈</strong></summary>

- **🎨 TailwindCSS** - 现代化 CSS 框架，快速构建响应式界面
- **📊 ECharts** - 专业的企业级图表可视化库
- **🗂️ JSZip** - 客户端 ZIP 文件解析和处理
- **💫 jQuery** - DOM 操作和事件处理
- **🎯 FontAwesome** - 丰富的图标库

</details>

<details>
<summary><strong>🧩 核心模块</strong></summary>

```text
js/
├── app.js              # 主应用程序入口和初始化
├── data-manager.js     # 数据存储和管理（IndexedDB）
├── zip-parser.js       # ZIP 文件解析和数据提取
├── data-analyzer.js    # 多维度数据分析引擎
├── chart-renderer.js   # 图表渲染和可视化
└── ui-manager.js       # 用户界面管理和交互控制
```

</details>

<details>
<summary><strong>🏭 架构特点</strong></summary>

- **🧩 模块化设计** - 清晰的功能模块分离，便于维护和扩展
- **🔄 异步处理** - 非阻塞的文件处理和数据分析
- **📦 内存优化** - 高效的数据处理和垃圾回收机制
- **⚠️ 错误处理** - 完善的错误捕获和用户友好的错误提示

</details>

## 📋 使用指南

<details>
<summary><strong>1️⃣ 导出论坛数据</strong></summary>

1. **📝 访问个人设置页面**
   - 登录 [Linux.do](https://linux.do) 论坛
   - 进入 [账户设置页面](https://linux.do/my/preferences/account)

2. **📤 请求数据导出**
   - 滚动到页面底部，找到 **"下载我的档案"** 部分
   - 点击 **"请求下载"** 按钮
   - 等待系统处理（通常几分钟内完成）

3. **下载数据包**
   - 查收邮件通知（检查垃圾邮件箱）
   - 点击邮件中的下载链接
   - 下载 ZIP 格式的数据包（注意：文件大小需小于 10MB）

</details>

<details>
<summary><strong>2️⃣ 上传和分析</strong></summary>

1. **访问分析工具**
   - 使用上述任一方式启动服务器
   - 在浏览器中访问对应地址

2. **上传数据文件**
   - **拖拽方式**：直接将 ZIP 文件拖拽到上传区域
   - **点击选择**：点击上传区域选择文件
   - 支持的文件类型：仅限 `.zip` 格式

3. **等待分析完成**
   - 上传后自动开始解析和分析
   - 显示实时进度条和处理状态
   - 整个过程通常在几秒内完成

4. **查看分析报告**
   - 分析完成后自动展示结果
   - 包含多个维度的数据可视化图表
   - 支持交互式图表操作

</details>

<details>
<summary><strong>3️⃣ 数据管理功能</strong></summary>

- **📊 查看已存储数据** - 查看之前分析过的数据
- **📤 导出分析结果** - 将分析数据导出为 JSON 格式
- **🗑️ 清空所有数据** - 清除本地存储的所有分析数据

</details>

## 📂 支持的数据文件

<details>
<summary><strong>📂 数据文件列表</strong></summary>

| 文件名 | 状态 | 包含内容 | 分析功能 |
|--------|------|----------|----------|
| `user_archive.csv` | **必需** | 用户发帖和话题数据 | 发帖统计、主题分析、分类活跃度 |
| `preferences.json` | **必需** | 用户偏好和个人信息 | 用户信息展示、基础统计 |
| `visits.csv` | 可选 | 每日访问记录 | 访问趋势图表、活跃度分析 |
| `likes.csv` | 可选 | 点赞行为记录 | 点赞活动分析、互动统计 |
| `user_badges.csv` | 可选 | 徽章获得记录 | 成就时间线、徽章统计 |
| `auth_tokens.csv` | 可选 | 登录设备信息 | 设备分析、安全统计 |
| `bookmarks.csv` | 可选 | 书签收藏记录 | 收藏行为分析 |
| `user_flags.csv` | 可选 | 举报记录 | 举报行为统计 |

</details>

## 📈 分析报告内容

<details>
<summary><strong>🏷️ 数据概览卡片</strong></summary>

- **📝 发帖总数** - 用户发布的帖子和回复数量
- **👍 点赞统计** - 给出和收到的点赞数量
- **🏆 徽章成就** - 获得的各类徽章数量
- **📊 访问统计** - 论坛访问天数和频率
- **🎆 信任等级** - 当前信任级别和进展

</details>

<details>
<summary><strong>📊 可视化图表</strong></summary>

1. **每日访问活动图** - 最近 60 天的访问趋势线图
2. **徽章获得时间线** - 徽章获得的时间分布图
3. **设备使用分布图** - 访问设备类型的饼图统计
4. **发帖活动热力图** - 24 小时发帖活动分布
5. **点赞活动趋势图** - 点赞行为的时间趋势分析

</details>

<details>
<summary><strong>📋 详细数据表格</strong></summary>

- **发帖记录** - 完整的帖子和回复列表
- **访问记录** - 详细的每日访问数据
- **点赞记录** - 点赞和被点赞的详细记录
- **徽章记录** - 徽章获得的完整时间线
- **认证令牌** - 登录设备和会话信息
- **书签和举报** - 收藏和举报的详细记录

</details>

<details>
<summary><strong>🔍 高级分析功能</strong></summary>

- **分类活动分析** - 各个板块的参与度统计
- **数据完整性评估** - 数据文件的完整性检查
- **用户行为模式** - 活跃时间段和使用习惯分析

</details>

## 🌐 部署选项

<details>
<summary><strong>🔗 在线部署</strong></summary>

### GitHub Pages

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/username/repository-name.git
git push -u origin main
```

### Vercel/Netlify

- 连接 Git 仓库自动部署
- 零配置，支持自动构建

### 更多平台

- **Deno Deploy** - 推荐使用
- **Cloudflare Pages**
- **Firebase Hosting**
- **AWS S3 + CloudFront**

</details>

## 🔒 隐私安全

<details>
<summary><strong>🛡️ 数据安全保障</strong></summary>

- **✅ 100% 本地处理** - 所有数据分析完全在浏览器中进行，不会上传到任何服务器
- **✅ 零数据收集** - 工具不收集、存储或传输任何用户数据
- **✅ 离线可用** - 分析功能完全离线，无需网络连接
- **✅ 即时删除** - 关闭浏览器标签页后，所有数据自动清除
- **✅ 开源透明** - 所有源代码公开，可自行审查和部署

</details>

<details>
<summary><strong>🔐 技术安全措施</strong></summary>

- **文件类型验证** - 严格验证上传文件格式，仅接受 ZIP 文件
- **内存处理** - 数据仅在浏览器内存中临时处理，不写入磁盘
- **沙盒环境** - 浏览器天然的安全沙盒环境保护
- **无第三方追踪** - 不使用任何第三方分析或追踪工具

</details>

## 🛠️ 开发信息

<details>
<summary><strong>开发命令</strong></summary>

### Node.js 环境

```bash
npm run start      # 启动服务器
npm run dev        # 开发模式
npm run serve      # 生产模式
```

### Deno 环境

```bash
deno task serve    # 启动静态文件服务器
deno task dev      # 开发模式（支持文件监听）
deno task preview  # 预览服务器（3000端口）
deno task fmt      # 代码格式化
deno task lint     # 代码检查
deno task check    # 类型检查
```

</details>

<details>
<summary><strong>项目结构</strong></summary>

```text
📁 linux-do-analyzer/
├── 📄 server.js               # Node.js 服务器
├── 📄 package.json            # NPM 包配置
├── 📁 bin/                    # CLI 可执行文件
│   └── 📄 cli.js              # 命令行接口
├── 📄 index.html              # 主界面文件
├── 📄 deno.json               # Deno 配置文件
├── 📄 README.md               # 项目说明文档
├── 📁 js/                     # JavaScript 模块
│   ├── 📄 app.js              # 主应用程序
│   ├── 📄 data-manager.js     # 数据管理模块
│   ├── 📄 zip-parser.js       # ZIP 文件解析器
│   ├── 📄 data-analyzer.js    # 数据分析引擎
│   ├── 📄 chart-renderer.js   # 图表渲染器
│   └── 📄 ui-manager.js       # 界面管理器
└── 📁 css/                    # 样式文件
    └── 📄 style.css           # 自定义样式
```

</details>

<details>
<summary><strong>核心功能模块</strong></summary>

| 模块 | 功能描述 | 主要特性 |
|------|----------|----------|
| `app.js` | 应用主入口 | 模块初始化、事件绑定、错误处理 |
| `data-manager.js` | 数据存储管理 | IndexedDB 操作、数据持久化 |
| `zip-parser.js` | 文件解析器 | ZIP 解压、CSV/JSON 解析 |
| `data-analyzer.js` | 数据分析引擎 | 统计计算、趋势分析、模式识别 |
| `chart-renderer.js` | 图表渲染器 | ECharts 集成、可视化生成 |
| `ui-manager.js` | 界面管理器 | DOM 操作、用户交互、状态管理 |

</details>

## 🤝 参与贡献

<details>
<summary><strong>🎯 贡献方式</strong></summary>

- **🐛 报告问题** - 在 Issues 页面报告 Bug 或提出改进建议
- **💡 功能请求** - 提出新功能需求和改进意见
- **🔧 代码贡献** - 提交 Pull Request 改进代码
- **📝 文档完善** - 改进项目文档和使用说明

</details>

<details>
<summary><strong>🚀 开发指南</strong></summary>

1. **Fork 项目**到你的 GitHub 账户
2. **创建功能分支** `git checkout -b feature/your-feature-name`
3. **提交更改** `git commit -m "Add your feature"`
4. **推送分支** `git push origin feature/your-feature-name`
5. **创建 Pull Request**

</details>

<details>
<summary><strong>📋 代码规范</strong></summary>

- 使用 **ES6+** 语法和现代 JavaScript 特性
- 遵循 **函数式编程** 和 **模块化设计** 原则
- 添加必要的 **注释** 和 **文档说明**
- 确保代码的 **可读性** 和 **可维护性**

</details>

## 📞 支持与反馈

<details>
<summary><strong>🔗 相关链接</strong></summary>

- **📁 项目仓库**: [GitHub Repository](https://github.com/dext7r/linux-do-analyzer)
- **📦 NPM 包**: [linux-do-analyzer](https://www.npmjs.com/package/linux-do-analyzer)
- **🐛 问题反馈**: [GitHub Issues](https://github.com/dext7r/linux-do-analyzer/issues)
- **💬 社区讨论**: [Linux.do 论坛](https://linux.do)

</details>

<details>
<summary><strong>📧 联系方式</strong></summary>

- **作者**: dext7r (GitHub: [@dext7r](https://github.com/dext7r))
- **邮箱**: 欢迎通过 GitHub Issues 联系

</details>

## 📄 开源许可

<details>
<summary><strong>MIT 许可证</strong></summary>

本项目采用 **MIT 许可证**，详情请查看 [LICENSE](LICENSE) 文件。

### 许可说明

- ✅ **自由使用** - 可用于个人和商业用途
- ✅ **修改分发** - 可自由修改和重新分发
- ✅ **私有使用** - 可在私有项目中使用
- ❗ **保留版权** - 需保留原作者版权声明

</details>

---

## 🙏 致谢

<details>
<summary><strong>开源项目</strong></summary>

感谢以下开源项目和技术栈的支持：

- **📊 [ECharts](https://echarts.apache.org/)** - 专业的企业级图表可视化库
- **🎨 [TailwindCSS](https://tailwindcss.com/)** - 现代化 CSS 框架
- **🗂️ [JSZip](https://stuk.github.io/jszip/)** - JavaScript ZIP 文件处理库
- **💫 [jQuery](https://jquery.com/)** - 简化 DOM 操作的 JavaScript 库
- **🎯 [FontAwesome](https://fontawesome.com/)** - 丰富的图标字体库
- **🦕 [Deno](https://deno.land/)** - 现代 JavaScript 运行时
- **🟢 [Node.js](https://nodejs.org/)** - JavaScript 运行时环境

</details>

<details>
<summary><strong>🙏 特别感谢</strong></summary>

- **🐧 Linux.do 社区** - 提供优质的技术交流平台
- **👥 社区贡献者** - 所有为项目做出贡献的开发者
- **🔬 测试用户** - 提供宝贵的测试反馈和改进建议

</details>

---

<div align="center">

## 🌟 如果这个项目对你有帮助，请给个 Star ⭐

## 🐧 为 Linux.do 社区用户量身打造 | 🔒 隐私优先 | 🎨 现代化设计

[![NPM](https://nodei.co/npm/linux-do-analyzer.png?downloads=true&downloadRank=true&stars=true)](https://www.npmjs.com/package/linux-do-analyzer)

</div>
