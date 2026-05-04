const http = require('http');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const PORT = 3000;
const DIR = path.join(__dirname, 'static');
const MIME = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.ico': 'image/x-icon',
  '.webp': 'image/webp', '.woff2': 'font/woff2', '.woff': 'font/woff',
};
const COMPRESSIBLE = new Set(['.html', '.css', '.js', '.json', '.svg']);

// Simple in-memory cache for static assets
const fileCache = new Map();

http.createServer((req, res) => {
  const url = req.url.split('?')[0];
  let filePath = path.join(DIR, url === '/' ? 'index.html' : url);

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(DIR, 'index.html');
  }

  const ext = path.extname(filePath);
  const contentType = MIME[ext] || 'application/octet-stream';
  const isHTML = ext === '.html';
  const cacheControl = isHTML ? 'no-cache, must-revalidate' : 'public, max-age=31536000, immutable';

  // Read file (with simple cache for non-HTML)
  let fileData;
  if (!isHTML && fileCache.has(filePath)) {
    fileData = fileCache.get(filePath);
  } else {
    try { fileData = fs.readFileSync(filePath); } catch { res.writeHead(404); res.end('Not found'); return; }
    if (!isHTML) fileCache.set(filePath, fileData);
  }

  const headers = {
    'Content-Type': contentType,
    'Cache-Control': cacheControl,
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'SAMEORIGIN',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
  };

  // Gzip compress text-based files
  const acceptEncoding = req.headers['accept-encoding'] || '';
  if (COMPRESSIBLE.has(ext) && acceptEncoding.includes('gzip')) {
    headers['Content-Encoding'] = 'gzip';
    headers['Vary'] = 'Accept-Encoding';
    zlib.gzip(fileData, (err, compressed) => {
      if (err) { res.writeHead(500); res.end(); return; }
      res.writeHead(200, headers);
      res.end(compressed);
    });
  } else {
    res.writeHead(200, headers);
    res.end(fileData);
  }
}).listen(PORT, '0.0.0.0', () => console.log(`OEC Tech Institute static server on port ${PORT}`));
