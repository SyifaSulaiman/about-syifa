import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputRoot = path.join(projectRoot, 'dist');
const prefix = '/portfolio';
const mimeTypes = new Map([
    ['.css', 'text/css; charset=utf-8'], ['.gif', 'image/gif'], ['.html', 'text/html; charset=utf-8'],
    ['.ico', 'image/x-icon'], ['.jpeg', 'image/jpeg'], ['.jpg', 'image/jpeg'], ['.js', 'text/javascript; charset=utf-8'],
    ['.otf', 'font/otf'], ['.png', 'image/png'], ['.svg', 'image/svg+xml'], ['.ttf', 'font/ttf'],
    ['.txt', 'text/plain; charset=utf-8'], ['.avif', 'image/avif'], ['.webp', 'image/webp'],
    ['.woff', 'font/woff'], ['.woff2', 'font/woff2'],
]);

if (!fs.existsSync(path.join(outputRoot, 'index.html'))) {
    throw new Error('dist/index.html is missing. Run npm run build:static first.');
}

http.createServer((request, response) => {
    const requestUrl = new URL(request.url ?? '/', 'http://127.0.0.1');
    if (requestUrl.pathname === prefix) {
        response.writeHead(302, { Location: `${prefix}/` }).end();
        return;
    }
    if (!requestUrl.pathname.startsWith(`${prefix}/`)) {
        response.writeHead(404).end('Not found');
        return;
    }

    let requestedPath;
    try {
        requestedPath = decodeURIComponent(requestUrl.pathname.slice(prefix.length + 1));
    } catch {
        response.writeHead(400).end('Bad path');
        return;
    }

    let filePath = path.resolve(outputRoot, requestedPath || 'index.html');
    if (!filePath.startsWith(`${outputRoot}${path.sep}`) && filePath !== outputRoot) {
        response.writeHead(403).end('Forbidden');
        return;
    }
    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) filePath = path.join(filePath, 'index.html');
    if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
        response.writeHead(404).end('Not found');
        return;
    }

    response.writeHead(200, {
        'Content-Type': mimeTypes.get(path.extname(filePath).toLowerCase()) ?? 'application/octet-stream',
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'no-store',
    });
    fs.createReadStream(filePath).pipe(response);
}).listen(4173, '127.0.0.1', () => {
    console.log('Static preview available at http://127.0.0.1:4173/portfolio/');
});
