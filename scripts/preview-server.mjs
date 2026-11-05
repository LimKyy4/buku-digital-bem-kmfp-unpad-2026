import http from 'node:http';
import fs from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const DEFAULT_PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.jfif': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.ico': 'image/x-icon'
};

function getSafeFilePath(urlPath) {
  let cleanPath = decodeURIComponent(urlPath.split('?')[0]);
  if (cleanPath === '/' || cleanPath === '') {
    cleanPath = '/index.html';
  }

  // Normalisasi dan lindungi dari path traversal
  const resolvedPath = path.normalize(path.join(rootDir, cleanPath));
  if (!resolvedPath.startsWith(rootDir)) {
    return null;
  }
  return resolvedPath;
}

const server = http.createServer(async (req, res) => {
  // Hanya layani metode GET dan HEAD
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { 'Content-Type': 'text/plain' });
    res.end('Method Not Allowed');
    return;
  }

  const filePath = getSafeFilePath(req.url);
  if (!filePath) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Forbidden');
    return;
  }

  try {
    const stat = await fs.stat(filePath);

    if (stat.isDirectory()) {
      const indexPath = path.join(filePath, 'index.html');
      try {
        await fs.stat(indexPath);
        serveFile(indexPath, req, res);
      } catch {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Directory listing not allowed');
      }
      return;
    }

    serveFile(filePath, req, res, stat);
  } catch (err) {
    // Coba cari di folder public jika request tidak menyertakan awalan /public/
    if (!req.url.startsWith('/public/')) {
      const publicFallback = path.join(rootDir, 'public', req.url.slice(1));
      try {
        const publicStat = await fs.stat(publicFallback);
        if (publicStat.isFile()) {
          serveFile(publicFallback, req, res, publicStat);
          return;
        }
      } catch {
        // Abaikan dan lanjutkan ke 404
      }
    }

    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(`404 Not Found: ${req.url}`);
  }
});

function serveFile(targetPath, req, res, stat) {
  const ext = path.extname(targetPath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  const headers = {
    'Content-Type': contentType,
    'Cache-Control': 'no-cache, must-revalidate',
    'Access-Control-Allow-Origin': '*'
  };

  if (stat) {
    headers['Content-Length'] = stat.size;
  }

  res.writeHead(200, headers);

  if (req.method === 'HEAD') {
    res.end();
    return;
  }

  const stream = createReadStream(targetPath);
  stream.on('error', () => {
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
    }
    res.end('Internal Server Error');
  });
  stream.pipe(res);
}

server.listen(DEFAULT_PORT, () => {
  console.log('=======================================================================================================');
  console.log(`[SERVER] Server pratinjau buku digital aktif pada: http://localhost:${DEFAULT_PORT}`);
  console.log(`[INFO] Seluruh 25 halaman WebP, font WOFF2, dan audio page-flip siap diakses`);
  console.log(`[INFO] Tekan CTRL+C di terminal untuk menghentikan server`);
  console.log('=======================================================================================================');
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    const fallbackPort = DEFAULT_PORT + 1;
    console.log(`[WARN] Port ${DEFAULT_PORT} sedang digunakan, mencoba port ${fallbackPort}...`);
    server.listen(fallbackPort);
  } else {
    console.error('[ERROR] Terjadi kegagalan server:', err.message);
  }
});
