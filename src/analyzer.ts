import { analyzeData } from "./main.ts";

async function main() {
  console.log("🐧 Linux.do 论坛数据分析器");
  console.log("========================");

  try {
    const result = await analyzeData();
    console.log("\n🎉 分析完成！你可以:");
    console.log("1. 打开 analysis-report.html 查看完整报告");
    console.log("2. 运行 'deno task serve' 启动 Web 服务查看");
    console.log("3. 在浏览器中访问 http://localhost:8000");
  } catch (error) {
    console.error("❌ 分析失败:", error.message);
    console.log("\n请确保:");
    console.log("1. 数据文件在当前目录");
    console.log("2. 文件格式正确");
    console.log("3. 有读写权限");
  }
}

if (import.meta.main) {
  await main();
}