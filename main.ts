import { serveFile } from "jsr:@std/http/file-server";

const routes = new Map([
    ["/", "./index.html"],
    ["/index.html", "./index.html"],
    ["/about", "./about.html"],
    ["/about.html", "./about.html"],
    ["/help", "./help.html"],
    ["/help.html", "./help.html"],
    ["/faq", "./faq.html"],
    ["/faq.html", "./faq.html"],
    ["/privacy", "./privacy.html"],
    ["/privacy.html", "./privacy.html"]
]);

// 获取端口（从命令行参数或环境变量）
const port = Deno.args[0] ? parseInt(Deno.args[0]) : parseInt(Deno.env.get("PORT") || "8888");

console.log(`🚀 服务器启动在端口 ${port}`);
console.log(`📎 访问: http://localhost:${port}`);

Deno.serve({ port }, (req: Request) => {
    const url = new URL(req.url);
    const pathname = url.pathname;

    // 检查是否为静态资源
    if (pathname.startsWith("/js/") || pathname.startsWith("/css/") ||
        pathname.endsWith(".js") || pathname.endsWith(".css") ||
        pathname.endsWith(".png") || pathname.endsWith(".jpg") ||
        pathname.endsWith(".ico") || pathname.endsWith(".svg")) {
        return serveFile(req, `.${pathname}`);
    }

    // 路由匹配
    const filePath = routes.get(pathname);
    if (filePath) {
        return serveFile(req, filePath);
    }

    // 404 处理 - 返回首页
    return serveFile(req, "./index.html");
});
