import { DataLoader } from "./utils/data-loader.ts";
import { DataAnalyzer } from "./analyzers/data-analyzer.ts";
import { ReportGenerator } from "./charts/report-generator.ts";

export async function analyzeData(dataPath: string = "./") {
  console.log("🔍 开始加载数据...");

  try {
    const loader = new DataLoader(dataPath);
    const data = await loader.loadAllData();

    console.log("📊 开始分析数据...");
    const analyzer = new DataAnalyzer(data);
    const result = analyzer.analyze();

    console.log("📈 生成分析报告...");
    const reportGenerator = new ReportGenerator(result);
    const htmlReport = reportGenerator.generateFullReport();

    console.log("💾 保存报告...");
    await Deno.writeTextFile("./analysis-report.html", htmlReport);

    console.log("✅ 分析完成！");
    console.log("📄 报告已保存为: analysis-report.html");

    console.log("\n📊 数据概览:");
    console.log(`📝 总发帖数: ${result.summary.totalPosts}`);
    console.log(`👍 获得点赞: ${result.summary.totalLikes}`);
    console.log(`🏆 拥有徽章: ${result.summary.totalBadges}`);
    console.log(`⭐ 信任等级: ${result.summary.trustLevel}`);
    console.log(`⏰ 阅读时长: ${result.summary.readingHours}小时`);
    console.log(`📅 活跃天数: ${result.summary.activeVisitDays}天`);
    console.log(`🎂 加入日期: ${result.summary.joinDate}`);

    return result;
  } catch (error) {
    console.error("❌ 分析过程中出现错误:", error.message);
    throw error;
  }
}

export async function startServer(port: number = 8000) {
  console.log(`🚀 启动 Web 服务器，端口: ${port}`);

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
          return new Response(
            `
            <!DOCTYPE html>
            <html>
            <head>
              <title>Linux.do 数据分析</title>
              <meta charset="utf-8">
            </head>
            <body>
              <h1>🐧 Linux.do 论坛数据分析工具</h1>
              <p>请先运行数据分析：<code>deno task analyze</code></p>
              <p>或访问：<a href="/analyze">/analyze</a> 开始分析</p>
            </body>
            </html>
            `,
            { headers: { "content-type": "text/html; charset=utf-8" } }
          );
        }
      }

      if (pathname === "/analyze") {
        await analyzeData();
        return Response.redirect("/", 302);
      }

      if (pathname.startsWith("/public/")) {
        try {
          const filePath = `.${pathname}`;
          const file = await Deno.readFile(filePath);
          const contentType = pathname.endsWith(".css") ? "text/css" :
                             pathname.endsWith(".js") ? "application/javascript" :
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
}

if (import.meta.main) {
  const command = Deno.args[0];

  switch (command) {
    case "analyze":
      await analyzeData();
      break;
    case "serve":
      await startServer();
      break;
    default:
      console.log(`
🐧 Linux.do 论坛数据分析工具

使用方法:
  deno run --allow-read --allow-write main.ts analyze  # 分析数据
  deno run --allow-read --allow-net main.ts serve     # 启动服务

或使用 deno task:
  deno task analyze  # 分析数据
  deno task serve    # 启动服务
  deno task start    # 分析并启动服务
      `);
  }
}