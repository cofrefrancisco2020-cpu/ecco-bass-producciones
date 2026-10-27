
import http from 'node:http';
import path from 'node:path';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const root = path.dirname(fileURLToPath(import.meta.url));
const base = process.env.PREVIEW_DIR ? path.resolve(root, process.env.PREVIEW_DIR) : root;
const port = Number(process.env.PORT || 4173);
const types = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.ttf':'font/ttf','.woff2':'font/woff2','.xml':'application/xml; charset=utf-8','.txt':'text/plain; charset=utf-8'};
const server = http.createServer(async (request, response) => {
 try {
  const pathname = decodeURIComponent(new URL(request.url, 'http://127.0.0.1').pathname);
  const file = path.resolve(base, '.' + (pathname === '/' ? '/index.html' : pathname));
  if (file !== base && !file.startsWith(base + path.sep)) { response.writeHead(403); response.end(); return; }
  const ext = path.extname(file);
  if (!types[ext] || /\.pdf$/i.test(file)) { response.writeHead(404); response.end('No encontrado'); return; }
  const content = await readFile(file);
  response.writeHead(200, {'Content-Type': types[ext], 'Cache-Control':'no-store', 'X-Content-Type-Options':'nosniff'});
  response.end(content);
 } catch { response.writeHead(404); response.end('No encontrado'); }
});
server.listen(port, '127.0.0.1', () => console.log('Vista previa: http://127.0.0.1:' + port + '/'));
