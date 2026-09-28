// INCPT reel engine: a deterministic, seekable timeline. Nothing animates on its own;
// the renderer calls window.seek(t, frame) and screenshots the result.
'use strict';

const W = 1080, H = 1920, FPS = 30;
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
  constructor(parent, screen) {
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
    this.setScreen(screen);
    // island + frame on top
    const isl = mkImg(P.island, 'abs');
    Object.assign(isl.style, { left: sx + 460 - P.islandSize[0] / 2 + 'px', top: sy + P.islandTop + 'px' });
    this.el.appendChild(isl);
    const fr = mkImg(P.frame, 'fill');
    fr.style.transform = 'translateZ(0.5px)';
    this.el.appendChild(fr);
    this.scroll = 0;
  }
  setScreen(name) {
    if (this.screenName === name) return;
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
  setScroll(v) {
    if (this.page) this.page.style.transform = `translateY(${-v.toFixed(2)}px)`;
  }
}

// ------------------------------------------------------------------ headlines
// words appear one by one (rise + un-blur), leave with a quick lift + blur
class Headline {
  constructor(text, { y = 0, size = 118, color = 'var(--ink)', width = 1000, lh = 0.9, weight = 1000, wdth = 125, track = -0.035, cls = '' } = {}) {
    this.el = document.createElement('div');
    this.el.className = 'headline ' + cls;
    Object.assign(this.el.style, {
      top: y + 'px', fontSize: size + 'px', color, lineHeight: lh, width: width + 'px', left: (W - width) / 2 + 'px',
      fontVariationSettings: `'wght' ${weight}, 'wdth' ${wdth}, 'opsz' 60`, letterSpacing: track + 'em',
    });
    this.words = [];
    for (const line of text.split('\n')) {
      const ld = document.createElement('div');
      ld.className = 'line';
      for (const w of line.split(' ')) {
        const s = document.createElement('span');
        s.className = 'word';
        s.textContent = w.replace(/_/g, ' ');
        ld.appendChild(s);
        this.words.push(s);
      }
      this.el.appendChild(ld);
    }
    $('#text').appendChild(this.el);
    this.size = size;
  }
  // tin: time first word lands; stagger: seconds between words; tout: exit start (null = stays)
  at(t, tin, tout = null, { stagger = 0.1, dur = 0.55, outDur = 0.2, outStagger = 0.03, dy = 0.42, outDy = -0.3, blur = 16, from = 'below' } = {}) {
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

// ------------------------------------------------------------------ background
const CAM = { x: 0, y: 0, s: 1, rz: 0 };
const BGP = { deep: 0 };   // 0 = light brand gradient, 1 = deep end-card blue
let bgCtx, fieldCv, fieldCtx, fieldImg, dotsCv, dotsCtx;
const FW_ = 72, FH_ = 128;
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
  VIG.addColorStop(0, 'rgba(18,46,110,0)');
  VIG.addColorStop(1, 'rgba(18,46,110,0.22)');
}
const RAMP_L = [[0, [241, 247, 255]], [0.38, [214, 231, 252]], [0.66, [160, 198, 247]], [1, [88, 146, 234]]];
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
function drawBg(t) {
  // parallax: background moves ~35% of the camera and scales a third as much
  const px = -CAM.x * 0.35 / W * 2.2, py = -CAM.y * 0.35 / H * 3.9, ps = 1 / (1 + (CAM.s - 1) * 0.3);
  const d = fieldImg.data;
  for (let j = 0; j < FH_; j++) {
    for (let i = 0; i < FW_; i++) {
      const u = (i / FW_ - 0.5) * 2.2 * ps + px, v = (j / FH_ - 0.5) * 3.9 * ps + py;
      let f = 0.5 + 0.34 * sn(u * 0.9, v * 0.62, t * 0.9, 0.7) + 0.16 * sn(u * 1.9 + 3, v * 1.4, t * 1.3, 2.1);
      // brand bias: deeper blue toward the lower-left and the edges
      f += 0.16 * (v / 3.9) + 0.1 * Math.abs(u) / 2.2 - 0.06 * (u / 2.2);
      const cl = ramp(RAMP_L, f), cd = ramp(RAMP_D, f);
      const k = (j * FW_ + i) * 4;
      d[k] = lerp(cl[0], cd[0], BGP.deep); d[k + 1] = lerp(cl[1], cd[1], BGP.deep); d[k + 2] = lerp(cl[2], cd[2], BGP.deep); d[k + 3] = 255;
    }
  }
  fieldCtx.putImageData(fieldImg, 0, 0);
  bgCtx.imageSmoothingEnabled = true;
  bgCtx.imageSmoothingQuality = 'high';
  bgCtx.drawImage(fieldCv, 0, 0, W, H);
  // drifting dot grid (visible in soft patches, like the reference)
  const G = 22 * (1 + (CAM.s - 1) * 0.3);
  const ox = ((-CAM.x * 0.35) % G + G) % G, oy = ((-CAM.y * 0.35 - t * 6) % G + G) % G;
  bgCtx.fillStyle = '#ffffff';
  for (let y = oy - G; y < H + G; y += G) {
    for (let x = ox - G; x < W + G; x += G) {
      const a = clamp((sn(x / 260 + 0.3, y / 300, t * 0.6, 4.2) - 0.12) * 2.1) * (0.55 - 0.3 * BGP.deep);
      if (a < 0.02) continue;
      bgCtx.globalAlpha = a;
      bgCtx.fillRect(x - 1.5, y - 1.5, 3, 3);
    }
  }
  bgCtx.globalAlpha = 1;
  bgCtx.fillStyle = VIG;
  bgCtx.fillRect(0, 0, W, H);
}

// ------------------------------------------------------------------ bootstrap
const SCENES = [];
const scene = s => SCENES.push(s);
let DURATION = 30;

async function boot() {
  MANIFEST = await (await fetch('manifest.json')).json();
  initBg();
  for (const s of SCENES) s.init && s.init();
  await document.fonts.ready;
  await Promise.all(IMGS.map(im => (im.complete ? im.decode().catch(() => {}) : new Promise(r => { im.onload = () => im.decode().then(r, r); im.onerror = r; }))));
  window.CUES = CUES.sort((a, b) => a.t - b.t);
  window.DURATION = DURATION;
  window.FPS = FPS;
  window.READY = true;
}

window.seek = (t, frame = Math.round(t * FPS)) => {
  CAM.x = 0; CAM.y = 0; CAM.s = 1; CAM.rz = 0; BGP.deep = 0;
  for (const s of SCENES) s.update(t);
  $('#cam').style.transform = `translate(${CAM.x.toFixed(2)}px, ${CAM.y.toFixed(2)}px) scale(${CAM.s.toFixed(4)}) rotateZ(${CAM.rz.toFixed(3)}deg)`;
  drawBg(t);
  return true;
};
