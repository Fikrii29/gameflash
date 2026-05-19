// =====================================================
// GAMEFLASH - Proxy Server (TokoPay + Static Files)
// =====================================================
// Jalankan: node server.js
// =====================================================

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 5500;
const TOKOPAY_BASE = 'api.tokopay.id';

// MIME types untuk static files
const MIME = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.webp': 'image/webp',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
};

const server = http.createServer((req, res) => {
    const parsed = url.parse(req.url, true);
    const pathname = parsed.pathname;

    // ── CORS headers (selalu) ──
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    // ── PROXY: /api/tokopay/* → https://api.tokopay.id/* ──
    if (pathname.startsWith('/api/tokopay/')) {
        const targetPath = pathname.replace('/api/tokopay', '');
        const queryStr = parsed.search || '';

        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            const options = {
                hostname: TOKOPAY_BASE,
                path: targetPath + queryStr,
                method: req.method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': req.headers['authorization'] || '',
                },
            };

            if (body) options.headers['Content-Length'] = Buffer.byteLength(body);

            const proxyReq = https.request(options, (proxyRes) => {
                let data = '';
                proxyRes.on('data', chunk => data += chunk);
                proxyRes.on('end', () => {
                    res.writeHead(proxyRes.statusCode, { 'Content-Type': 'application/json' });
                    res.end(data);
                });
            });

            proxyReq.on('error', (e) => {
                console.error('[Proxy] Error:', e.message);
                res.writeHead(502, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ status: 'error', message: e.message }));
            });

            if (body) proxyReq.write(body);
            proxyReq.end();
        });
        return;
    }

    // ── STATIC FILES ──
    let filePath = path.join(__dirname, pathname === '/' ? 'index.html' : pathname);

    // Cegah path traversal
    if (!filePath.startsWith(__dirname)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
    }

    fs.stat(filePath, (err, stat) => {
        // Kalau folder, cari index.html di dalamnya
        if (!err && stat.isDirectory()) {
            filePath = path.join(filePath, 'index.html');
        }

        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h2>404 - File tidak ditemukan</h2>');
                return;
            }
            const ext = path.extname(filePath).toLowerCase();
            res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
            res.end(data);
        });
    });
});

server.listen(PORT, () => {
    console.log(`\n⚡ Gameflash Server running!`);
    console.log(`   http://127.0.0.1:${PORT}`);
    console.log(`   Proxy TokoPay aktif di /api/tokopay/\n`);
});