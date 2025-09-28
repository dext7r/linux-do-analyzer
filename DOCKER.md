# Docker 部署指南

本文档提供了 Linux.do 数据分析工具的 Docker 部署方案。

## 快速开始

### 基本部署

```bash
# 构建并运行
docker build -t linux-do-analyzer .
docker run -d --name linux-do-analyzer -p 8080:8080 linux-do-analyzer

# 访问应用
open http://localhost:8080
```

### Docker Compose 部署

```bash
# 基本部署
docker-compose up -d

# 带 Nginx 反向代理
docker-compose --profile nginx up -d
```

## 文件说明

### Dockerfile

基于官方 Deno 2.0.6 镜像构建，包含：
- 依赖预缓存
- 健康检查
- 最小权限运行

### docker-compose.yml

提供两种部署模式：
1. **基本模式**：直接运行应用服务器
2. **Nginx 模式**：包含反向代理和静态文件优化

### nginx.conf

生产级 Nginx 配置，包含：
- Gzip 压缩
- 静态文件缓存
- 安全头设置
- SSL 支持（可选）

## 环境变量

- `PORT`: 应用端口（默认 8080）
- `DENO_DIR`: Deno 缓存目录

## 生产部署建议

1. **使用反向代理**：提高性能和安全性
2. **配置 SSL**：生产环境必须使用 HTTPS
3. **设置资源限制**：避免资源过度消耗
4. **启用日志轮转**：管理日志文件大小
5. **配置健康检查**：自动重启失败的容器

## 故障排除

```bash
# 查看日志
docker-compose logs -f

# 检查容器状态
docker-compose ps

# 重启服务
docker-compose restart

# 清理资源
docker-compose down
docker system prune -f
```