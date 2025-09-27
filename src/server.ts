const port = 8000;

console.log(`🚀 启动 Linux.do 数据分析服务器`);
console.log(`📡 服务地址: http://localhost:${port}`);

const handler = async (request: Request): Promise<Response> => {
  const url = new URL(request.url);
  const pathname = url.pathname;

  try {
    if (pathname === "/" || pathname === "/index.html") {
      try {
        const html = await Deno.readTextFile("./analysis-report.html");
        return new Response(html, {
          headers: { "content-type": "text/html; charset=utf-8" }
        });
      } catch {
        const welcomeHtml = `
          <!DOCTYPE html>
          <html lang="zh-CN">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Linux.do 数据分析工具</title>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0;
                color: white;
              }
              .container {
                text-align: center;
                background: rgba(255, 255, 255, 0.1);
                padding: 50px;
                border-radius: 20px;
                backdrop-filter: blur(10px);
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
              }
              h1 { font-size: 3rem; margin-bottom: 20px; }
              p { font-size: 1.2rem; margin-bottom: 30px; opacity: 0.9; }
              .actions {
                display: flex;
                gap: 20px;
                justify-content: center;
                flex-wrap: wrap;
              }
              .btn {
                padding: 15px 30px;
                background: rgba(255, 255, 255, 0.2);
                border: 2px solid rgba(255, 255, 255, 0.3);
                border-radius: 10px;
                color: white;
                text-decoration: none;
                transition: all 0.3s ease;
                font-weight: 600;
              }
              .btn:hover {
                background: rgba(255, 255, 255, 0.3);
                transform: translateY(-2px);
              }
              .code {
                background: rgba(0, 0, 0, 0.3);
                padding: 2px 6px;
                border-radius: 4px;
                font-family: monospace;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>🐧 Linux.do 论坛数据分析工具</h1>
              <p>还没有生成分析报告</p>
              <div class="actions">
                <a href="/analyze" class="btn">📊 开始分析</a>
                <a href="https://github.com" class="btn">📚 查看文档</a>
              </div>
              <br>
              <p>或在终端运行: <span class="code">deno task analyze</span></p>
            </div>
          </body>
          </html>
        `;
        return new Response(welcomeHtml, {
          headers: { "content-type": "text/html; charset=utf-8" }
        });
      }
    }

    if (pathname === "/analyze") {
      try {
        const { analyzeData } = await import("./main.ts");
        await analyzeData();
        return Response.redirect("/", 302);
      } catch (error) {
        const errorHtml = `
          <!DOCTYPE html>
          <html lang="zh-CN">
          <head>
            <meta charset="UTF-8">
            <title>分析失败</title>
            <style>
              body { font-family: sans-serif; padding: 50px; background: #f5f5f5; }
              .error { background: #fff; padding: 30px; border-radius: 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); }
              h1 { color: #e74c3c; }
              pre { background: #f8f9fa; padding: 15px; border-radius: 5px; overflow-x: auto; }
            </style>
          </head>
          <body>
            <div class="error">
              <h1>❌ 分析失败</h1>
              <p>错误信息：</p>
              <pre>${(error as Error).message}</pre>
              <p><a href="/">← 返回首页</a></p>
            </div>
          </body>
          </html>
        `;
        return new Response(errorHtml, {
          status: 500,
          headers: { "content-type": "text/html; charset=utf-8" }
        });
      }
    }

    if (pathname.startsWith("/public/")) {
      try {
        const filePath = `.${pathname}`;
        const file = await Deno.readFile(filePath);
        const contentType = pathname.endsWith(".css") ? "text/css" :
                           pathname.endsWith(".js") ? "application/javascript" :
                           pathname.endsWith(".png") ? "image/png" :
                           pathname.endsWith(".jpg") ? "image/jpeg" :
                           "text/plain";
        return new Response(file, {
          headers: { "content-type": contentType }
        });
      } catch {
        return new Response("File not found", { status: 404 });
      }
    }

    return new Response("Not Found", { status: 404 });
  } catch (error) {
    console.error("服务器错误:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
};

Deno.serve({ port }, handler);