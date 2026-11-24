import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.json': 'application/json', '.txt': 'text/plain' };
export async function serve(port = 0) {
  await fs.mkdir(path.join(root, 'docs'), { recursive: true });
  const server = http.createServer(async (request, response) => {
    try {
      const url = new URL(request.url, 'http://localhost');
      if (url.pathname === '/favicon.ico') return response.writeHead(204).end();
      const relative = decodeURIComponent(url.pathname).slice(1) || 'index.html';
      const file = path.resolve(root, relative);
      if (path.relative(root, file).split(path.sep).some(part => part.startsWith('.'))) throw Error('Invalid path');
      const data = await fs.readFile(file);
      response.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' }).end(data);
    } catch { response.writeHead(404).end('Not found'); }
  });
  await new Promise((resolve, reject) => server.once('error', reject).listen(port, '127.0.0.1', resolve));
  return { server, base: 'http://127.0.0.1:' + server.address().port + '/' };
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  console.log('StaseraVolley V005: ' + (await serve(Number(process.argv[2] || 4197))).base);
}
