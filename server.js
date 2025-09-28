import { createServer } from 'http';
import { readFile, access } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class LinuxDoAnalyzerServer {
    constructor(options = {}) {
        this.port = options.port || 8080;
        this.isDev = options.dev || false;
        this.baseDir = __dirname;

        // 路由映射
        this.routes = new Map([
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
    }

    async init() {
        this.server = createServer(this.handleRequest.bind(this));
    }

    async handleRequest(req, res) {
        const url = new URL(req.url, `http://${req.headers.host}`);
        const pathname = url.pathname;

        // Security: prevent directory traversal
        if (pathname.includes('..')) {
            this.sendError(res, 400, 'Bad Request');
            return;
        }

        try {
            // 检查是否为静态资源
            if (pathname.startsWith("/js/") || pathname.startsWith("/css/") ||
                pathname.endsWith(".js") || pathname.endsWith(".css") ||
                pathname.endsWith(".png") || pathname.endsWith(".jpg") ||
                pathname.endsWith(".ico") || pathname.endsWith(".svg")) {
                await this.serveStaticFile(res, `.${pathname}`);
                return;
            }

            // 路由匹配
            const filePath = this.routes.get(pathname);
            if (filePath) {
                await this.serveStaticFile(res, filePath);
                return;
            }

            // 404 处理 - 返回首页
            await this.serveStaticFile(res, "./index.html");

        } catch (error) {
            if (this.isDev) {
                console.log(`Error serving ${pathname}:`, error.message);
            }
            this.sendError(res, 404, 'Not Found');
        }
    }

    async serveStaticFile(res, filePath) {
        const fullPath = join(this.baseDir, filePath);

        try {
            await access(fullPath);
            const content = await readFile(fullPath);
            const contentType = this.getContentType(filePath);

            res.writeHead(200, {
                'Content-Type': contentType,
                'Cache-Control': this.isDev ? 'no-cache' : 'public, max-age=3600'
            });
            res.end(content);
        } catch (error) {
            throw error;
        }
    }

    getContentType(filePath) {
        const ext = filePath.split('.').pop().toLowerCase();
        const mimeTypes = {
            'html': 'text/html; charset=utf-8',
            'js': 'application/javascript; charset=utf-8',
            'css': 'text/css; charset=utf-8',
            'json': 'application/json; charset=utf-8',
            'png': 'image/png',
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'gif': 'image/gif',
            'svg': 'image/svg+xml',
            'ico': 'image/x-icon'
        };
        return mimeTypes[ext] || 'text/plain; charset=utf-8';
    }

    sendError(res, statusCode, message) {
        res.writeHead(statusCode, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end(message);
    }

    async start() {
        await this.init();

        this.server.listen(this.port, () => {
            console.log(`🚀 Linux.do Analyzer Server running at http://localhost:${this.port}`);
            if (this.isDev) {
                console.log('📝 Development mode enabled');
            }
        });

        // Graceful shutdown
        process.on('SIGTERM', () => this.shutdown());
        process.on('SIGINT', () => this.shutdown());
    }

    shutdown() {
        console.log('\n🔄 Shutting down server...');
        this.server.close(() => {
            console.log('✅ Server closed');
            process.exit(0);
        });
    }
}

// Parse command line arguments
function parseArgs() {
    const args = process.argv.slice(2);
    const options = {};

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (arg.startsWith('--port=')) {
            options.port = parseInt(arg.split('=')[1]);
        } else if (arg === '--dev') {
            options.dev = true;
        } else if (arg.startsWith('--port') && args[i + 1]) {
            options.port = parseInt(args[i + 1]);
            i++;
        }
    }

    return options;
}

// Start server if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const options = parseArgs();
    const server = new LinuxDoAnalyzerServer(options);
    server.start().catch(console.error);
}

export { LinuxDoAnalyzerServer };