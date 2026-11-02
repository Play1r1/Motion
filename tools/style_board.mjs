// Lay the rendered style frames out on one labelled board (src/style/board.html).
//   node tools/style_board.mjs [out.jpg]   -> renders/style/board.jpg
import { chromium } from 'playwright-core';
import http from 'http'; import fs from 'fs'; import path from 'path';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const MIME = { '.html': 'text/html', '.css': 'text/css', '.woff2': 'font/woff2', '.png': 'image/png', '.jpg': 'image/jpeg' };
const server = http.createServer((req, res) => { const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0])); fs.readFile(p, (e, d) => { if (e) { res.writeHead(404); res.end(); return; } res.writeHead(200, { 'content-type': MIME[path.extname(p)] || 'application/octet-stream' }); res.end(d); }); });
await new Promise(r => server.listen(0, '127.0.0.1', r));
const CHROME = fs.readdirSync('/opt/pw-browsers').filter(d => /^chromium-\d+$/.test(d)).map(d => `/opt/pw-browsers/${d}/chrome-linux64/chrome`).find(p => fs.existsSync(p));
const b = await chromium.launch({ executablePath: CHROME, args: ['--disable-lcd-text', '--font-render-hinting=none', '--force-color-profile=srgb'] });
const pg = await b.newPage({ viewport: { width: 2160, height: 1000 }, deviceScaleFactor: 1 });
await pg.goto(`http://127.0.0.1:${server.address().port}/src/style/board.html`);
await pg.waitForFunction(() => window.READY === true, null, { timeout: 60000 });
await pg.screenshot({ path: process.argv[2] || path.join(ROOT, 'renders', 'style', 'board.jpg'), fullPage: true, type: 'jpeg', quality: 90 });
await b.close(); server.close();
