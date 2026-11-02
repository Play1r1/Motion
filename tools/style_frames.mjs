// Render the style frames (src/style/frames.html) to PNG and a board.
//   node tools/style_frames.mjs [A1,A2,...]   -> out/style/<id>.png
import { chromium } from 'playwright-core';
import http from 'http';
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const CHROME = process.env.CHROME || fs.readdirSync('/opt/pw-browsers').filter(d => /^chromium-\d+$/.test(d)).sort((a, b) => +b.split('-')[1] - +a.split('-')[1])
  .flatMap(d => ['chrome-linux64', 'chrome-linux'].map(s => `/opt/pw-browsers/${d}/${s}/chrome`)).find(p => fs.existsSync(p));
const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.woff2': 'font/woff2', '.woff': 'font/woff', '.png': 'image/png', '.jpg': 'image/jpeg', '.json': 'application/json' };
const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  fs.readFile(p, (e, d) => { if (e) { res.writeHead(404); res.end(); return; } res.writeHead(200, { 'content-type': MIME[path.extname(p)] || 'application/octet-stream' }); res.end(d); });
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const ids = (process.argv[2] || 'A1,A2,A3,B1,B2,B3,C1,C2,C3').split(',');
const out = path.join(ROOT, 'out', 'style');
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: CHROME, args: ['--disable-lcd-text', '--font-render-hinting=none', '--force-color-profile=srgb'] });
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
page.on('pageerror', e => console.error('PAGE ERROR', e.message));
page.on('console', m => { if (m.type() === 'error' && !/favicon|404/.test(m.text())) console.error('console:', m.text()); });
for (const id of ids) {
  await page.goto(`http://127.0.0.1:${server.address().port}/src/style/frames.html?f=${id}`);
  await page.waitForFunction(() => window.READY === true, null, { timeout: 60000 });
  await page.screenshot({ path: path.join(out, `${id}.png`) });
  console.log('frame', id);
}
await browser.close();
server.close();
