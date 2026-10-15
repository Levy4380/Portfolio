import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, sep } from 'node:path';

const root = join(process.cwd(), 'dist');
const indexFile = join(root, 'index.html');
const port = Number(process.env.PORT) || 3000;

if (!existsSync(indexFile)) {
  console.error('dist/index.html is missing. Run npm run build before npm start.');
  process.exit(1);
}

const types = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

function fileFor(urlPath) {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(urlPath, 'http://localhost').pathname);
  } catch {
    return null;
  }

  const file = join(root, pathname);
  if (file !== root && !file.startsWith(`${root}${sep}`)) return null;
  return file;
}

const server = createServer((req, res) => {
  const candidate = fileFor(req.url ?? '/');
  if (!candidate) {
    res.writeHead(400).end();
    return;
  }

  let file = candidate;
  if (existsSync(file) && statSync(file).isDirectory()) {
    file = join(file, 'index.html');
  }

  const missing = !existsSync(file) || statSync(file).isDirectory();
  if (missing) {
    if (extname(candidate)) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Not found');
      return;
    }
    file = indexFile;
  }

  res.writeHead(200, {
    'Content-Type': types[extname(file)] ?? 'application/octet-stream',
  });
  createReadStream(file).pipe(res);
});

// Omit the host so Node listens on :: when IPv6 is available. Laravel Cloud
// health checks reach the app over IPv6, and an IPv4-only bind stays unreachable.
server.listen(port, () => {
  console.log(`Serving dist on port ${port}`);
});
