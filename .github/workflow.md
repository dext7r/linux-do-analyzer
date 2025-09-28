# GitHub Actions 和 Release 配置

## 📁 工作流文件

本项目包含以下 GitHub Actions 工作流：

### 1. 🔄 CI/CD 工作流 (.github/workflows/ci.yml)
- **触发条件**: 推送到 main/master/develop 分支，或 PR 到 main/master
- **测试矩阵**: Ubuntu, Windows, macOS × Node.js 18/20/22
- **功能**:
  - 运行测试套件
  - 验证 CLI 功能
  - 测试服务器启动
  - 包完整性检查
  - 代码检查和格式化

### 2. 📦 NPM 发布工作流 (.github/workflows/npm-publish.yml)
- **触发条件**: 推送版本标签 (v*) 或手动触发
- **功能**:
  - 多 Node.js 版本测试
  - 自动发布到 NPM
  - 发布验证
  - 成功/失败通知

### 3. 🚀 GitHub Release 工作流 (.github/workflows/release.yml)
- **触发条件**: 推送版本标签 (v*) 或手动触发
- **功能**:
  - 自动生成变更日志
  - 创建多种发布资源
  - 上传到 GitHub Releases

## 📦 发布资源

每次 Release 会自动创建以下资源：

### 1. NPM 包 (`linux-do-analyzer-{version}.tgz`)
- 标准 NPM 包格式
- 包含所有运行时文件
- 可通过 `npm install` 安装

### 2. 独立 Web 应用 (`linux-do-analyzer-standalone.zip`)
- 完整的静态网站文件
- 包含部署说明
- 适用于任何静态托管服务

### 3. 文档包 (`linux-do-analyzer-docs.zip`)
- 完整文档和安装指南
- GitHub 工作流配置
- 部署和使用说明

### 4. CLI 工具包 (`linux-do-analyzer-cli.zip`)
- 命令行工具专用包
- 包含安装脚本 (install.sh/install.bat)
- 跨平台支持

### 5. 源代码包 (`linux-do-analyzer-source.zip`)
- Git 归档格式源代码
- 包含所有项目文件
- 适用于离线开发

## 🔧 本地测试发布流程

### 1. 使用发布脚本
```bash
# 运行发布准备脚本
./scripts/prepare-release.sh

# 查看生成的资源
ls -la release-assets/
```

### 2. 验证包完整性
```bash
# 验证 NPM 包
npm pack --dry-run

# 测试 CLI 功能
node bin/cli.js --help

# 测试服务器
node server.js --port 8081
```

## 📋 发布清单

在创建新版本前，请确保：

- [ ] 更新 `package.json` 中的版本号
- [ ] 更新 `README.md` 中的相关信息
- [ ] 运行本地测试：`npm test`
- [ ] 验证 CLI 功能正常
- [ ] 检查所有必要文件是否包含在 `package.json` 的 `files` 字段中

## 🚀 发布流程

### 自动发布（推荐）
1. 创建版本标签：
   ```bash
   git tag v2.0.1
   git push origin v2.0.1
   ```
2. GitHub Actions 会自动：
   - 运行测试
   - 发布到 NPM
   - 创建 GitHub Release
   - 上传所有资源

### 手动发布
1. 在 GitHub 的 Actions 页面
2. 选择对应的工作流
3. 点击 "Run workflow"
4. 填写必要参数

## 🔐 必要的 Secrets

确保在 GitHub 仓库设置中配置：

- `NPM_TOKEN`: NPM 发布令牌
- `GITHUB_TOKEN`: 自动提供，用于创建 Release

## 📊 发布后验证

发布完成后，验证以下内容：

1. **NPM 包**: 访问 https://www.npmjs.com/package/linux-do-analyzer
2. **GitHub Release**: 检查 https://github.com/dext7r/linux-do-analyzer/releases
3. **资源完整性**: 下载并验证各种包格式
4. **安装测试**: 使用不同方式安装和测试

## ⚠️ 注意事项

- 版本标签必须以 `v` 开头 (如：v2.0.1)
- NPM 包名称必须唯一，已发布的版本无法覆盖
- Release 创建后可以编辑但无法删除
- 确保所有敏感信息已从代码中移除

## 🔄 回滚策略

如果发布出现问题：

1. **NPM 包**: 使用 `npm unpublish` (24小时内)
2. **GitHub Release**: 标记为 draft 或删除
3. **版本标签**: 删除错误的标签
   ```bash
   git tag -d v2.0.1
   git push origin :refs/tags/v2.0.1
   ```