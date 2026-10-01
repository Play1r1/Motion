// INCPT reel engine: a deterministic, seekable timeline. Nothing animates on its own;
// the renderer calls window.seek(t, frame) and screenshots the result.
'use strict';

const W = (window.STAGE || [1080, 1920])[0], H = (window.STAGE || [1080, 1920])[1], FPS = 30;
const BPM = 96, BEAT = 60 / BPM;

// ------------------------------------------------------------------ math
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, p) => a + (b - a) * p;
const prog = (t, t0, t1) => clamp((t - t0) / (t1 - t0));
const Ease = {
  linear: p => p,
  outExpo: p => (p >= 1 ? 1 : 1 - Math.pow(2, -10 * p)),
  inExpo: p => (p <= 0 ? 0 : Math.pow(2, 10 * p - 10)),
  inOutExpo: p => (p <= 0 ? 0 : p >= 1 ? 1 : p < 0.5 ? Math.pow(2, 20 * p - 10) / 2 : (2 - Math.pow(2, -20 * p + 10)) / 2),
  outCubic: p => 1 - Math.pow(1 - p, 3),
  inCubic: p => p * p * p,
  inOutCubic: p => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2),
  outQuint: p => 1 - Math.pow(1 - p, 5),
  inQuart: p => p * p * p * p,
  inOutSine: p => -(Math.cos(Math.PI * p) - 1) / 2,
  outSine: p => Math.sin((p * Math.PI) / 2),
};
// tween from a to b over [t0,t1]
const tw = (t, t0, t1, a, b, e = Ease.outExpo) => lerp(a, b, e(prog(t, t0, t1)));
// keyframes: [[t, v], [t, v, ease], ...] – ease belongs to the segment arriving at that key
function kf(t, keys) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [t1, v1, e = Ease.outExpo] = keys[i];
    const [t0, v0] = keys[i - 1];
    if (t <= t1) return lerp(v0, v1, e(prog(t, t0, t1)));
  }
  return keys[keys.length - 1][1];
}
// smooth pseudo-noise (sum of sines) – organic, no edges
const sn = (x, y, t, s = 0) =>
  (Math.sin(x * 1.7 + t * 0.31 + s + Math.sin(y * 1.3 + t * 0.17 + s * 2) * 1.2) +
    Math.sin(y * 2.1 - t * 0.23 + s * 3 + Math.sin(x * 1.1 - t * 0.11) * 1.4) * 0.8 +
    Math.sin((x + y) * 1.3 + t * 0.19 + s * 5) * 0.5) / 2.3;

// ------------------------------------------------------------------ sound cues
const CUES = [];
const cue = (t, type, o = {}) => CUES.push({ t: +t.toFixed(4), type, ...o });

// ------------------------------------------------------------------ DOM nodes
let MANIFEST = null;
const $ = s => document.querySelector(s);
const IMGS = [];
function mkImg(src, cls = '') {
  const im = new Image();
  im.decoding = 'sync';
  im.src = src;
  if (cls) im.className = cls;
  IMGS.push(im);
  return im;
}

class Node {
  // A positioned box whose anchor sits at (at[0], at[1]) in its parent's coordinate system.
  constructor(parent, { w, h, at = [0, 0], ax = 0.5, ay = 0.5, cls = '', el = null, flat = false }) {
    this.el = el || document.createElement('div');
    this.el.className = 'node ' + cls + (flat ? ' flat' : '');
    Object.assign(this.el.style, {
      width: w + 'px', height: h + 'px', left: at[0] - ax * w + 'px', top: at[1] - ay * h + 'px',
      transformOrigin: `${ax * w}px ${ay * h}px`,
    });
    (parent.el || parent).appendChild(this.el);
    this.w = w; this.h = h;
    this.p = { x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0, s: 1, sx: 1, sy: 1, o: 1, blur: 0, bright: 1, vis: true };
    this._last = '';
  }
  set(q) {
    Object.assign(this.p, q);
    const p = this.p;
    const vis = p.vis && p.o > 0.001;
    const tf = `translate3d(${p.x.toFixed(2)}px,${p.y.toFixed(2)}px,${p.z.toFixed(2)}px) rotateY(${p.ry.toFixed(3)}deg) rotateX(${p.rx.toFixed(3)}deg) rotateZ(${p.rz.toFixed(3)}deg) scale(${(p.s * p.sx).toFixed(4)},${(p.s * p.sy).toFixed(4)})`;
    const f = [];
    if (p.blur > 0.05) f.push(`blur(${p.blur.toFixed(2)}px)`);
    if (Math.abs(p.bright - 1) > 0.002) f.push(`brightness(${p.bright.toFixed(3)})`);
    const st = this.el.style;
    st.display = vis ? '' : 'none';
    st.transform = tf;
    st.opacity = p.o >= 0.999 ? '' : p.o.toFixed(3);
    st.filter = f.length ? f.join(' ') : '';
    return this;
  }
}

// cut-out UI element placed exactly over its location on a phone screen (phone-local px)
class Cut extends Node {
  constructor(parent, name, { onScreen = true, at = null } = {}) {
    const c = MANIFEST.cutouts[name];
    const [bx, by, bw, bh] = c.box;
    const so = MANIFEST.phone.screenOffset;
    const cx = onScreen ? so[0] + bx + bw / 2 : 0;
    const cy = onScreen ? so[1] + by + bh / 2 : 0;
    super(parent, { w: c.size[0], h: c.size[1], at: at || [cx, cy], flat: true });
    this.el.appendChild(mkImg(c.src, 'fill'));
    this.home = [cx, cy];
    this.meta = c;
  }
}

// tap indicator: translucent disc + crisp white ring + soft outer ring (no glow)
class Tap extends Node {
  constructor(parent, size = 124) {
    super(parent, { w: size, h: size, flat: true, cls: 'tap' });
    this.el.innerHTML = '<div class="halo"></div><div class="disc"></div>';
    this.halo = this.el.firstChild;
    this.set({ vis: false });
  }
  // t0 = moment of the press
  at(t, t0, x, y, z = 30) {
    const a = t0 - 0.2, rel = t0 + 0.12, end = t0 + 0.55;
    if (t < a || t > end) return this.set({ vis: false });
    const sIn = tw(t, a, t0, 0.55, 1, Ease.outCubic);
    const press = t < t0 ? 1 : t < rel ? tw(t, t0, rel, 1, 0.84, Ease.outCubic) : tw(t, rel, rel + 0.2, 0.84, 1.0, Ease.outCubic);
    const o = t < t0 ? tw(t, a, a + 0.12, 0, 1, Ease.linear) : tw(t, rel + 0.1, end, 1, 0, Ease.inCubic);
    const hs = t < rel ? 1 : tw(t, rel, end, 1, 1.9, Ease.outCubic);
    const ho = t < rel ? 1 : tw(t, rel, end, 1, 0, Ease.outCubic);
    this.halo.style.transform = `scale(${hs.toFixed(3)})`;
    this.halo.style.opacity = ho.toFixed(3);
    return this.set({ vis: true, x, y, z, s: sIn * press, o });
  }
}

// iPhone mockup with titanium frame, thickness layers and a live screen
class Phone extends Node {
  // opts.screens: extra screen states to pre-decode (switched with setScreen, slots survive);
  // opts.islandTop / opts.islandScale: fit our Dynamic Island to a screen's status-bar layout
  constructor(parent, screen, opts = {}) {
    const P = MANIFEST.phone;
    super(parent, { w: P.size[0], h: P.size[1], cls: 'phone' });
    const [sx, sy] = P.screenOffset;
    // contact shadow sits a little behind the body
    this.shadow = new Node(this, { w: P.size[0] + 2 * P.shadowPad, h: P.size[1] + 2 * P.shadowPad, at: [P.size[0] / 2, P.size[1] / 2], flat: true });
    this.shadow.el.appendChild(mkImg(P.shadow, 'fill'));
    this.shadow.set({ z: -70 });
    // body thickness
    this.edges = [];
    for (let i = 1; i <= 2; i++) {
      const e = new Node(this, { w: P.size[0], h: P.size[1], at: [P.size[0] / 2, P.size[1] / 2], flat: true });
      e.el.appendChild(mkImg(P.edge, 'fill'));
      e.set({ z: -i * 12 });
      this.edges.push(e);
    }
    // screen
    this.screenEl = document.createElement('div');
    this.screenEl.className = 'screen';
    Object.assign(this.screenEl.style, { left: sx + 'px', top: sy + 'px', borderRadius: P.screenRadius + 'px' });
    this.el.appendChild(this.screenEl);
    this.layers = {};
    for (const n of opts.screens || []) this.addLayer(n);
    this.setScreen(screen);
    // island + frame on top
    const isl = mkImg(P.island, 'abs');
    const iS = opts.islandScale ?? 1;
    Object.assign(isl.style, {
      left: sx + 460 - P.islandSize[0] * iS / 2 + 'px', top: sy + (opts.islandTop ?? P.islandTop) + 'px',
      width: P.islandSize[0] * iS + 'px', height: P.islandSize[1] * iS + 'px',
    });
    this.el.appendChild(isl);
    const fr = mkImg(P.frame, 'fill');
    fr.style.transform = 'translateZ(0.5px)';
    this.el.appendChild(fr);
    this.scroll = 0;
  }
  addLayer(name) {
    const im = mkImg(MANIFEST.screens[name], 'fill');
    im.style.display = 'none';
    this.screenEl.insertBefore(im, this.screenEl.firstChild);
    this.layers[name] = im;
  }
  // white flash over the screen content (screen changes happen under it)
  flash(o) {
    if (!this.flashEl) {
      this.flashEl = document.createElement('div');
      Object.assign(this.flashEl.style, { position: 'absolute', inset: '0', background: '#f4f6fb' });
      this.screenEl.appendChild(this.flashEl);
    }
    this.flashEl.style.opacity = clamp(o).toFixed(3);
  }
  setScreen(name) {
    if (this.screenName === name) return;
    if (MANIFEST.screens && MANIFEST.screens[name]) {
      if (!this.layers[name]) this.addLayer(name);
      for (const k in this.layers) this.layers[k].style.display = k === name ? '' : 'none';
      this.screenName = name;
      return;
    }
    this.screenName = name;
    this.screenEl.innerHTML = '';
    if (name === 'home') {
      const G = MANIFEST.page;
      const clip = document.createElement('div');
      clip.className = 'pageclip';
      clip.style.top = G.head + 'px';
      this.page = mkImg(G.src, 'abs');
      clip.appendChild(this.page);
      this.screenEl.appendChild(clip);
      this.screenEl.appendChild(Object.assign(mkImg('build/header.png', 'abs'), { style: 'left:0;top:0' }));
      for (const n of ['tabbar', 'tab_center']) {
        const c = MANIFEST.cutouts[n];
        const im = mkImg(c.src, 'abs');
        Object.assign(im.style, { left: c.box[0] + 'px', top: c.box[1] + 'px' });
        this.screenEl.appendChild(im);
      }
      const cor = mkImg('build/sheet_corners.png', 'abs');
      cor.style.left = '0px'; cor.style.top = 1880 + 'px';
      this.screenEl.appendChild(cor);
    } else {
      this.page = null;
      this.screenEl.appendChild(mkImg(`screens/${name}.jpg`, 'fill'));
    }
  }
  // clean background patch that hides an element's slot on this screen once it lifts off
  addSlot(key) {
    const S = MANIFEST.slots[key];
    const im = mkImg(S.src, 'abs');
    Object.assign(im.style, { left: S.x + 'px', top: S.y + 'px', opacity: '0' });
    this.screenEl.appendChild(im);
    return im;
  }
  setScroll(v) {
    if (this.page) this.page.style.transform = `translateY(${-v.toFixed(2)}px)`;
  }
}

// ------------------------------------------------------------------ headlines
// words appear one by one (rise + un-blur), leave with a quick lift + blur
class Headline {
  // hl: holographic highlight band (logo gradient) behind every line; align: 'center' | 'left'
  // fit: widest line is scaled down to this many px (measured once fonts are ready)
  constructor(text, { y = 0, size = 118, color = 'var(--ink)', width = 1000, lh = 0.9, weight = 1000, wdth = 125, track = -0.035, cls = '', hl = false, align = 'center', left = null, fit = 0 } = {}) {
    this.el = document.createElement('div');
    this.el.className = 'headline ' + cls;
    Object.assign(this.el.style, {
      top: y + 'px', fontSize: size + 'px', color, lineHeight: lh,
      width: width ? width + 'px' : 'auto', left: (left ?? (W - (width || 0)) / 2) + 'px', textAlign: align,
      fontVariationSettings: `'wght' ${weight}, 'wdth' ${wdth}, 'opsz' 60`, letterSpacing: track + 'em',
    });
    this.words = [];
    this.bands = [];
    for (const line of text.split('\n')) {
      const ld = document.createElement('div');
      ld.className = 'line';
      const inner = document.createElement('span');
      inner.className = 'lineInner';
      if (hl) {
        const band = document.createElement('div');
        band.className = 'band';
        inner.appendChild(band);
        this.bands.push(band);
      }
      for (const w of line.split(' ')) {
        const s = document.createElement('span');
        s.className = 'word';
        s.textContent = w.replace(/_/g, '\u00a0');
        inner.appendChild(s);
        this.words.push(s);
      }
      ld.appendChild(inner);
      this.el.appendChild(ld);
    }
    $('#text').appendChild(this.el);
    this.size = size;
    this.fit = fit;
  }
  fitNow() {
    this.fitted = true;
    const prev = this.el.style.display;
    this.el.style.display = '';
    const w = Math.max(...[...this.el.querySelectorAll('.lineInner')].map(e => e.offsetWidth));
    if (w > this.fit) { this.size *= this.fit / w; this.el.style.fontSize = this.size + 'px'; }
    this.el.style.display = prev;
  }
  // highlight bands wipe in left -> right; the gradient keeps drifting like the logo's foil
  bandsAt(t, tin, tout = null, { stagger = 0.08, dur = 0.5 } = {}) {
    this.bands.forEach((b, i) => {
      const t0 = tin + i * stagger;
      let sx = Ease.outExpo(prog(t, t0, t0 + dur));
      let o = clamp((t - t0) * 12);
      if (tout !== null) { const po = Ease.inCubic(prog(t, tout + i * 0.03, tout + i * 0.03 + 0.22)); o *= 1 - po; }
      b.style.transform = `scaleX(${sx.toFixed(4)})`;
      b.style.opacity = o.toFixed(3);
      b.style.backgroundPosition = `${(20 + t * 14 + i * 30) % 200}% 50%`;
    });
  }
  // tin: time first word lands; stagger: seconds between words; tout: exit start (null = stays)
  at(t, tin, tout = null, { stagger = 0.1, dur = 0.55, outDur = 0.2, outStagger = 0.03, dy = 0.42, outDy = -0.3, blur = 16, from = 'below' } = {}) {
    if (this.fit && !this.fitted) this.fitNow();
    let any = false;
    const n = this.words.length;
    this.words.forEach((w, i) => {
      const ti = tin + i * stagger;
      const pi = prog(t, ti, ti + dur);
      const e = Ease.outExpo(pi);
      let y = (1 - e) * dy, o = clamp(pi * 3), b = (1 - e) * blur, x = 0;
      if (from === 'right') { x = (1 - e) * 0.5; y = 0; }
      if (tout !== null) {
        const to = tout + i * outStagger;
        const po = prog(t, to, to + outDur);
        const eo = Ease.inCubic(po);
        y += outDy * eo; o *= 1 - eo; b += eo * 14;
      }
      if (o > 0.002) any = true;
      w.style.transform = `translate(${x.toFixed(4)}em, ${y.toFixed(4)}em)`;
      w.style.opacity = o.toFixed(3);
      w.style.filter = b > 0.1 ? `blur(${b.toFixed(2)}px)` : '';
    });
    this.el.style.display = any ? '' : 'none';
  }
}

// ------------------------------------------------------------------ brand
// INCPT logo in screen space with its own perspective; a thin sheen sweeps the foil
class LogoMark {
  constructor() {
    const L = MANIFEST.logo;
    this.el = document.createElement('div');
    this.el.className = 'logo3d';
    this.inner = document.createElement('div');
    this.inner.className = 'logoInner';
    Object.assign(this.inner.style, { width: L.size[0] + 'px', height: L.size[1] + 'px' });
    this.shadow = mkImg(L.shadow, 'abs');
    Object.assign(this.shadow.style, { left: -L.shadowPad + 'px', top: -L.shadowPad + 'px' });
    this.inner.appendChild(this.shadow);
    this.inner.appendChild(mkImg(L.src, 'fill'));
    this.sheen = document.createElement('div');
    this.sheen.className = 'sheen';
    const m = `url(${L.src})`;
    Object.assign(this.sheen.style, { maskImage: m, webkitMaskImage: m });
    this.inner.appendChild(this.sheen);
    this.el.appendChild(this.inner);
    $('#text').appendChild(this.el);
    this.w = L.size[0]; this.h = L.size[1];
  }
  // x, y: centre in screen px; h: rendered height; sheen: 0..1 sweep position (null = hidden)
  set({ x = 540, y = 960, h = 300, rx = 0, ry = 0, rz = 0, o = 1, blur = 0, sheen = null, shadow = 1 }) {
    const k = h / this.h;
    const st = this.inner.style;
    this.el.style.display = o > 0.002 ? '' : 'none';
    this.el.style.perspectiveOrigin = `${x.toFixed(1)}px ${y.toFixed(1)}px`;
    st.transform = `translate(${(x - this.w / 2).toFixed(2)}px, ${(y - this.h / 2).toFixed(2)}px) rotateY(${ry.toFixed(3)}deg) rotateX(${rx.toFixed(3)}deg) rotateZ(${rz.toFixed(3)}deg) scale(${k.toFixed(4)})`;
    st.opacity = o >= 0.999 ? '' : o.toFixed(3);
    st.filter = blur > 0.05 ? `blur(${(blur / k).toFixed(2)}px)` : '';
    this.shadow.style.opacity = shadow.toFixed(3);
    this.sheen.style.display = sheen === null ? 'none' : '';
    if (sheen !== null) this.sheen.style.backgroundPosition = `${(120 - sheen * 140).toFixed(2)}% 50%`;
  }
}

// "Доступен в Telegram" store-style badge
const TG_PLANE = 'M16.906 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z';
class TgBadge {
  constructor(small, big) {
    this.el = document.createElement('div');
    this.el.className = 'tgbadge';
    this.el.innerHTML = `<svg viewBox="0 0 24 24" width="100" height="100"><defs><linearGradient id="tgg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2AABEE"/><stop offset="1" stop-color="#229ED9"/></linearGradient></defs><circle cx="12" cy="12" r="12" fill="url(#tgg)"/><path d="${TG_PLANE}" fill="#fff" transform="translate(-0.35 0.2)"/></svg><div class="tgtext"><div class="tgsmall">${small}</div><div class="tgbig">${big}</div></div>`;
    $('#text').appendChild(this.el);
  }
  set({ y = 1200, o = 1, dy = 0, s = 1, blur = 0 }) {
    const st = this.el.style;
    st.display = o > 0.002 ? '' : 'none';
    st.top = y + 'px';
    st.transform = `translate(-50%, ${dy.toFixed(2)}px) scale(${s.toFixed(4)})`;
    st.opacity = o.toFixed(3);
    st.filter = blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : '';
  }
}

// ------------------------------------------------------------------ background
const CAM = { x: 0, y: 0, s: 1, rz: 0 };
const BGP = { deep: 0, white: 0 };   // deep: end-card blue; white: brand off-white (logo sheet)
let bgCtx, fieldCv, fieldCtx, fieldImg, dotsCv, dotsCtx;
const FW_ = 72, FH_ = H === 1920 ? 128 : Math.round(72 * H / W);
const VS_ = H === 1920 ? 3.9 : 2.2 * H / W;      // background field height in noise units
let VIG;
function initBg() {
  const cv = $('#bg');
  cv.width = W; cv.height = H;
  bgCtx = cv.getContext('2d');
  fieldCv = document.createElement('canvas');
  fieldCv.width = FW_; fieldCv.height = FH_;
  fieldCtx = fieldCv.getContext('2d');
  fieldImg = fieldCtx.createImageData(FW_, FH_);
  VIG = bgCtx.createRadialGradient(W / 2, H * 0.46, H * 0.3, W / 2, H * 0.46, H * 0.62);
  VIG.addColorStop(0, 'rgba(58,64,140,0)');
  VIG.addColorStop(1, 'rgba(58,64,140,0.16)');
}
const RAMP_L = [[0, [241, 247, 255]], [0.38, [214, 231, 252]], [0.66, [160, 198, 247]], [1, [88, 146, 234]]];
const RAMP_W = [[0, [250, 249, 246]], [0.45, [247, 247, 244]], [0.8, [240, 242, 245]], [1, [231, 236, 244]]];
const RAMP_D = [[0, [92, 142, 236]], [0.4, [54, 104, 214]], [0.7, [30, 70, 172]], [1, [14, 36, 104]]];
function ramp(R, v) {
  v = clamp(v);
  for (let i = 1; i < R.length; i++) {
    if (v <= R[i][0]) {
      const p = (v - R[i - 1][0]) / (R[i][0] - R[i - 1][0]);
      return R[i - 1][1].map((c, k) => c + (R[i][1][k] - c) * p);
    }
  }
  return R[R.length - 1][1];
}
// Brand background: a slow holographic foil field in the INCPT logo palette
// (mint -> sky -> periwinkle -> lavender -> lilac), deepening toward the edges.
const FOIL = [[168, 232, 218], [160, 214, 242], [170, 184, 240], [200, 188, 244], [226, 200, 244]];
const FOIL_DEEP = [120, 150, 222];
function foil(h) {
  const n = FOIL.length;
  h = (((h % 1) + 1) % 1) * n;
  const i0 = Math.floor(h), f = h - i0, e = f * f * (3 - 2 * f);
  const a = FOIL[i0], b = FOIL[(i0 + 1) % n];
  return [lerp(a[0], b[0], e), lerp(a[1], b[1], e), lerp(a[2], b[2], e)];
}
function drawBg(t) {
  // parallax: background moves ~35% of the camera and scales a third as much
  const px = -CAM.x * 0.35 / W * 2.2, py = -CAM.y * 0.35 / H * VS_, ps = 1 / (1 + (CAM.s - 1) * 0.3);
  const d = fieldImg.data;
  for (let j = 0; j < FH_; j++) {
    for (let i = 0; i < FW_; i++) {
      const u = (i / FW_ - 0.5) * 2.2 * ps + px, v = (j / FH_ - 0.5) * VS_ * ps + py;
      // hue flows along diagonal bands like the logo's foil
      const h = 0.3 + 0.34 * sn(u * 0.8, v * 0.55, t * 0.7, 1.3) + 0.16 * sn(u * 1.7 + 2, v * 1.3, t * 1.1, 3.7) + (u * 0.5 + v * 0.35) * 0.2;
      let c = foil(h);
      // soft light pools (keeps dark headlines readable) and deeper foil at the frame edges
      const L = clamp(0.5 + 0.5 * sn(u * 0.6 + 5, v * 0.45, t * 0.5, 6.1));
      const lift = 0.1 + 0.3 * L * (1 - Math.abs(v) / 3.2);
      const deep = clamp(0.08 + 0.22 * (v / 1.95) + 0.16 * Math.abs(u) / 1.1 - 0.12 * L) * 0.45;
      const cw = ramp(RAMP_W, 0.5 + v * 0.1);
      const k = (j * FW_ + i) * 4;
      for (let q = 0; q < 3; q++) {
        let x = lerp(c[q], [246, 248, 255][q], lift);
        x = lerp(x, FOIL_DEEP[q], deep);
        d[k + q] = lerp(x, cw[q], BGP.white);
      }
      d[k + 3] = 255;
    }
  }
  fieldCtx.putImageData(fieldImg, 0, 0);
  bgCtx.imageSmoothingEnabled = true;
  bgCtx.imageSmoothingQuality = 'high';
  bgCtx.drawImage(fieldCv, 0, 0, W, H);
  bgCtx.globalAlpha = 1 - 0.75 * BGP.white;
  bgCtx.fillStyle = VIG;
  bgCtx.fillRect(0, 0, W, H);
  bgCtx.globalAlpha = 1;
}

// ------------------------------------------------------------------ bootstrap
const SCENES = [];
const scene = s => SCENES.push(s);
let DURATION = 30;
let META = {};                 // timing landmarks for the soundtrack (drop, end card)

async function boot() {
  MANIFEST = await (await fetch('manifest.json')).json();
  if (window.REEL && window.REEL !== 'wallet') {
    const R = await (await fetch(`manifest_${window.MANIFEST_NAME || window.REEL}.json`)).json();
    for (const k of ['cutouts', 'slots']) Object.assign(MANIFEST[k] = MANIFEST[k] || {}, R[k] || {});
    MANIFEST.screens = R.screens || {};
    MANIFEST.flip = R.flip || {};
    MANIFEST.reel = R;           // reel-specific extras (rects, pointer, sheet, ...)
  }
  initBg();
  for (const s of SCENES) s.init && s.init();
  await document.fonts.ready;
  await Promise.all(IMGS.map(im => (im.complete ? im.decode().catch(() => {}) : new Promise(r => { im.onload = () => im.decode().then(r, r); im.onerror = r; }))));
  window.CUES = CUES.sort((a, b) => a.t - b.t);
  window.DURATION = DURATION;
  window.META = META;
  window.FPS = FPS;
  window.READY = true;
}

window.seek = (t, frame = Math.round(t * FPS)) => {
  CAM.x = 0; CAM.y = 0; CAM.s = 1; CAM.rz = 0; BGP.deep = 0; BGP.white = 0;
  for (const s of SCENES) s.update(t);
  $('#cam').style.transform = `translate(${CAM.x.toFixed(2)}px, ${CAM.y.toFixed(2)}px) scale(${CAM.s.toFixed(4)}) rotateZ(${CAM.rz.toFixed(3)}deg)`;
  drawBg(t);
  return true;
};
