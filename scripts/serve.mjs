import http from 'node:http';
import { createReadStream } from 'node:fs';
import { realpath, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pipeline } from 'node:stream/promises';

const root = await realpath(fileURLToPath(new URL('../', import.meta.url)));
const port = Number(process.env.PORT || 4173);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT 必须是 1 至 65535 之间的整数。');
}
const mime = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.ico': 'image/x-icon', '.woff2': 'font/woff2',
  '.md': 'text/plain; charset=utf-8', '.txt': 'text/plain; charset=utf-8'
};
const inside = (candidate) => {
  const relative = path.relative(root, candidate);
  return relative === '' || (!relative.startsWith('..' + path.sep) && relative !== '..' && !path.isAbsolute(relative));
};

const server = http.createServer(async (request, response) => {
  if (!['GET', 'HEAD'].includes(request.method)) {
    response.writeHead(405, { Allow: 'GET, HEAD' }).end('Method not allowed');
    return;
  }
  try {
    const url = new URL(request.url, 'http://127.0.0.1');
    const pathname = decodeURIComponent(url.pathname);
    // 不暴露隐藏文件、依赖目录或经符号链接指向仓库之外的文件。
    const segments = pathname.split(/[\\/]+/).filter(Boolean);
    if (segments.some((part) => part.startsWith('.') || part === 'node_modules') || pathname.includes('\0')) {
      response.writeHead(403).end('Forbidden');
      return;
    }
    if (pathname === '/') {
      response.writeHead(302, { Location: '/demo/' }).end();
      return;
    }
    let target = path.resolve(root, '.' + pathname);
    if (!inside(target)) {
      response.writeHead(403).end('Forbidden');
      return;
    }
    if ((await stat(target)).isDirectory()) target = path.join(target, 'index.html');
    target = await realpath(target);
    if (!inside(target)) {
      response.writeHead(403).end('Forbidden');
      return;
    }
    const info = await stat(target);
    if (!info.isFile()) {
      response.writeHead(404).end('Not found');
      return;
    }
    response.writeHead(200, {
      'Content-Type': mime[path.extname(target).toLowerCase()] || 'application/octet-stream',
      'Content-Length': info.size,
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff'
    });
    if (request.method === 'HEAD') response.end();
    else await pipeline(createReadStream(target), response);
  } catch (error) {
    if (response.headersSent) {
      response.destroy();
      return;
    }
    response.writeHead(error instanceof URIError || error.code === 'ERR_INVALID_URL' ? 400 : 404).end('Not found');
  }
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Arena UI 预览：http://127.0.0.1:${port}/demo/`);
});
server.on('error', (error) => {
  console.error(error.code === 'EADDRINUSE' ? `端口 ${port} 已被占用，可设置 PORT 使用其他端口。` : error.message);
  process.exitCode = 1;
});
