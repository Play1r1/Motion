// Frame-accurate renderer: headless Chromium seeks the timeline, sub-frame samples are
// averaged for real motion blur (180° shutter), frames stream into ffmpeg.
//
//   node tools/render.mjs stills 1.0,2.5,5.2 [--mb]      -> out/stills/*.png
//   node tools/render.mjs sheet 0:8:0.25                -> out/sheet_0-8.jpg (contact sheet)
//   node tools/render.mjs video [--workers 3] [--from 0 --to 30] [--scale 1]
//   add --reel staking to any mode for another reel (outputs go to out/<reel>/)
import { chromium } from 'playwright-core';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const CHROME = process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const W = 1080, H = 1920;
const args = process.argv.slice(2);
const mode = args[0];
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const flag = k => args.includes('--' + k);
const REEL = opt('reel', 'wallet');
const OUTD = REEL === 'wallet' ? path.join(ROOT, 'out') : path.join(ROOT, 'out', REEL);
fs.mkdirSync(OUTD, { recursive: true });

// ---------------------------------------------------------------- static server
const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.woff2': 'font/woff2', '.woff': 'font/woff', '.png': 'image/png', '.jpg': 'image/jpeg', '.json': 'application/json' };
const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  fs.readFile(p, (e, d) => {
    if (e) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { 'content-type': MIME[path.extname(p)] || 'application/octet-stream' });
    res.end(d);
  });
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const URL_ = `http://127.0.0.1:${server.address().port}/src/index.html?reel=${REEL}`;

async function openPage() {
  const browser = await chromium.launch({ executablePath: CHROME, args: ['--disable-lcd-text', '--font-render-hinting=none', '--force-color-profile=srgb'] });
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  page.on('pageerror', e => console.error('PAGE ERROR', e.message));
  page.on('console', m => { if (m.type() === 'error') console.error('console:', m.text()); });
  await page.goto(URL_);
  await page.waitForFunction(() => window.READY === true, null, { timeout: 60000 });
  const cdp = await page.context().newCDPSession(page);
  const info = await page.evaluate(() => ({ dur: window.DURATION, fps: window.FPS, cues: window.CUES, meta: window.META }));
  return { browser, page, cdp, info };
}

async function capture(ctx, t, frame) {
  // one rAF lets the compositor finish rasterising every tile before the grab
  await ctx.page.evaluate(([t, f]) => { window.seek(t, f); return new Promise(r => requestAnimationFrame(() => r())); }, [t, frame]);
  const r = await ctx.cdp.send('Page.captureScreenshot', { format: 'png', optimizeForSpeed: true, captureBeyondViewport: false });
  const { data } = await sharp(Buffer.from(r.data, 'base64')).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  return data; // Buffer rgb24
}

function meanDiff(a, b) {
  let s = 0, n = 0;
  for (let i = 0; i < a.length; i += 3 * 7) { s += Math.abs(a[i] - b[i]) + Math.abs(a[i + 1] - b[i + 1]); n += 2; }
  return s / n;
}

// motion-blurred frame: probe shutter endpoints, add samples in proportion to motion
async function renderFrame(ctx, frame, fps, mb = true) {
  const t = frame / fps;
  if (!mb) return { buf: await capture(ctx, t, frame), n: 1 };
  const sh = 0.5 / fps;
  const a = await capture(ctx, t - sh / 2, frame);
  const b = await capture(ctx, t + sh / 2, frame);
  const d = meanDiff(a, b);
  const n = d < 0.08 ? 1 : Math.min(40, Math.max(3, Math.ceil(2 + d * 1.7)));
  if (n === 1) return { buf: await capture(ctx, t, frame), n: 1, d };
  const acc = new Float32Array(a.length);
  const add = buf => { for (let i = 0; i < buf.length; i++) acc[i] += buf[i]; };
  add(a); add(b);
  for (let k = 1; k < n - 1; k++) add(await capture(ctx, t + sh * (k / (n - 1) - 0.5), frame));
  const out = Buffer.alloc(a.length);
  for (let i = 0; i < acc.length; i++) out[i] = Math.round(acc[i] / n);
  return { buf: out, n, d };
}

const toPng = (buf, file, scale = 1) =>
  sharp(buf, { raw: { width: W, height: H, channels: 3 } }).resize(Math.round(W * scale)).png().toFile(file);

// ---------------------------------------------------------------- modes
if (mode === 'stills') {
  const ctx = await openPage();
  const fps = ctx.info.fps;
  const dir = path.join(OUTD, 'stills');
  fs.mkdirSync(dir, { recursive: true });
  for (const s of args[1].split(',')) {
    const f = Math.round(parseFloat(s) * fps);
    const r = await renderFrame(ctx, f, fps, flag('mb'));
    await toPng(r.buf, path.join(dir, `t${(f / fps).toFixed(2)}.png`), parseFloat(opt('scale', '0.5')));
    console.log('still', (f / fps).toFixed(2), 'samples', r.n, r.d ? r.d.toFixed(2) : '');
  }
  await ctx.browser.close();
} else if (mode === 'sheet') {
  const [a, b, st] = args[1].split(':').map(parseFloat);
  const ctx = await openPage();
  const fps = ctx.info.fps;
  const tiles = [];
  const tw = 270, th = 480;
  for (let t = a; t <= b + 1e-6; t += st) {
    const f = Math.round(t * fps);
    const r = await renderFrame(ctx, f, fps, flag('mb'));
    tiles.push({ t: f / fps, png: await sharp(r.buf, { raw: { width: W, height: H, channels: 3 } }).resize(tw, th).png().toBuffer() });
  }
  const cols = Math.min(6, tiles.length), rows = Math.ceil(tiles.length / cols);
  const comps = [];
  tiles.forEach((tl, i) => {
    const x = (i % cols) * tw, y = Math.floor(i / cols) * (th + 24);
    comps.push({ input: tl.png, left: x, top: y + 24 });
    const svg = `<svg width="${tw}" height="24"><rect width="100%" height="100%" fill="white"/><text x="6" y="17" font-size="15" font-family="monospace">${tl.t.toFixed(2)}s</text></svg>`;
    comps.push({ input: Buffer.from(svg), left: x, top: y });
  });
  const out = path.join(OUTD, `sheet_${a}-${b}.jpg`);
  await sharp({ create: { width: cols * tw, height: rows * (th + 24), channels: 3, background: '#fff' } }).composite(comps).jpeg({ quality: 88 }).toFile(out);
  console.log('sheet', out);
  await ctx.browser.close();
} else if (mode === 'video') {
  const workers = parseInt(opt('workers', '3'));
  const probe = await openPage();
  const fps = probe.info.fps;
  const from = parseFloat(opt('from', '0')), to = parseFloat(opt('to', String(probe.info.dur)));
  fs.writeFileSync(path.join(OUTD, 'cues.json'), JSON.stringify({ duration: probe.info.dur, fps, meta: probe.info.meta, cues: probe.info.cues }, null, 1));
  await probe.browser.close();
  const F0 = Math.round(from * fps), F1 = Math.round(to * fps);
  const per = Math.ceil((F1 - F0) / workers);
  const segDir = path.join(OUTD, 'seg');
  fs.mkdirSync(segDir, { recursive: true });
  const t0 = Date.now();
  let done = 0, samples = 0;
  const jobs = [];
  for (let w = 0; w < workers; w++) {
    const a = F0 + w * per, b = Math.min(F1, a + per);
    if (a >= b) continue;
    jobs.push((async () => {
      const ctx = await openPage();
      const file = path.join(segDir, `seg_${String(w).padStart(2, '0')}.mkv`);
      const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', `${W}x${H}`, '-r', String(fps), '-i', '-', '-c:v', 'ffv1', '-level', '3', '-pix_fmt', 'yuv444p', file], { stdio: ['pipe', 'inherit', 'inherit'] });
      for (let f = a; f < b; f++) {
        const r = await renderFrame(ctx, f, fps, !flag('nomb'));
        samples += r.n;
        if (!ff.stdin.write(r.buf)) await new Promise(res => ff.stdin.once('drain', res));
        done++;
        if (done % 30 === 0) {
          const el = (Date.now() - t0) / 1000;
          console.log(`frames ${done}/${F1 - F0}  ${(done / el).toFixed(2)} f/s  avg samples ${(samples / done).toFixed(2)}  eta ${((F1 - F0 - done) / (done / el)).toFixed(0)}s`);
        }
      }
      ff.stdin.end();
      await new Promise(r => ff.on('close', r));
      await ctx.browser.close();
      return file;
    })());
  }
  const files = (await Promise.all(jobs)).sort();
  fs.writeFileSync(path.join(segDir, 'list.txt'), files.map(f => `file '${f}'`).join('\n'));
  console.log('segments done in', ((Date.now() - t0) / 1000).toFixed(0), 's');
}
server.close();
