// Render text lines to transparent PNGs with the app's own font (Inter), for swapping personal
// data on screenshots without redrawing anything else.
//   node tools/textpng.mjs spec.json   spec: [{ text, size, weight, color, file }]
import { chromium } from 'playwright-core';
import http from 'http';
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const CHROME = process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const spec = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));

const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  fs.readFile(p, (e, d) => {
    if (e) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { 'content-type': p.endsWith('.css') ? 'text/css' : p.endsWith('.woff2') ? 'font/woff2' : 'text/html' });
    res.end(d);
  });
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
fs.writeFileSync(path.join(ROOT, 'out', '_text.html'), `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="/node_modules/@fontsource-variable/inter/index.css">
<style>html,body{margin:0;background:transparent} span{display:inline-block;padding:8px 6px;line-height:1.4;white-space:pre;font-family:'Inter Variable',sans-serif}</style>
</head><body></body></html>`);
const browser = await chromium.launch({ executablePath: CHROME, args: ['--disable-lcd-text', '--font-render-hinting=none', '--force-color-profile=srgb'] });
const page = await browser.newPage({ viewport: { width: 1600, height: 400 }, deviceScaleFactor: 1 });
await page.goto(`http://127.0.0.1:${server.address().port}/out/_text.html`);
for (const s of spec) {
  await page.evaluate(s => {
    document.body.innerHTML = '';
    const e = document.createElement('span');
    e.textContent = s.text;
    Object.assign(e.style, { fontSize: s.size + 'px', fontWeight: String(s.weight || 400), color: s.color || '#000', letterSpacing: (s.track || 0) + 'em' });
    document.body.appendChild(e);
    return document.fonts.ready;
  }, s);
  await page.locator('span').screenshot({ path: s.file, omitBackground: true });
}
await browser.close();
server.close();
