# 使用官方 Deno 镜像作为基础镜像
FROM denoland/deno:2.0.6

# 设置工作目录
WORKDIR /app

# 设置环境变量
ENV DENO_DIR=/deno-dir/
ENV PORT=8080

# 创建 deno 缓存目录
RUN mkdir -p /deno-dir

# 复制 deno 配置文件
COPY deno.json deno.lock* ./

# 预缓存依赖项以提高启动速度
RUN deno cache --reload main.ts

# 复制源代码
COPY . .

# 暴露端口
EXPOSE 8080

# 设置健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD deno eval "fetch('http://localhost:8080').then(r => r.status === 200 ? Deno.exit(0) : Deno.exit(1))" || exit 1

# 运行应用程序
CMD ["deno", "run", "--allow-net", "--allow-read", "main.ts"]