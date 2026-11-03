// ХРОМ — the 2026 brand look chosen for every INCPT film: pearl field with the logo's iridescence
// behind ribbed glass (glass.js), Geologica type with iridescent accents, liquid-glass chips and
// wipes, the chrome mark in a glass lens on the end card. Shared by the welcome and presale reels.
'use strict';

// ------------------------------------------------------------------ text
// Geologica lines; words rise and un-blur one by one. "~word" is drawn in the logo's iridescence,
// spread over the whole line. chars: animate letter by letter (for the wordmark).
class WText {
  constructor(text, { y, size, cls = 'wl-h', lh = 0.92, track = null, chars = false, color = null, fit = 0 }) {
    this.el = document.createElement('div');
    this.el.className = 'wl ' + cls;
    Object.assign(this.el.style, { left: '0px', top: y + 'px', width: W + 'px', textAlign: 'center', fontSize: size + 'px', lineHeight: lh });
    if (track !== null) this.el.style.letterSpacing = track + 'em';
    if (color) this.el.style.color = color;
    this.size = size; this.fit = fit;
    this.words = [];
    this.lines = text.split('\n').map(line => {
      const ld = document.createElement('div');
      const parts = chars ? [...line] : line.split(' ');
      parts.forEach((w, i) => {
        const s = document.createElement('span');
        s.className = 'w' + (w.startsWith('~') ? ' wl-irid' : '');
        s.textContent = w.replace(/^~/, '').replace(/_/g, ' ');
        if (!chars && i < parts.length - 1) s.style.marginRight = '0.24em';
        ld.appendChild(s);
        this.words.push(s);
      });
      this.el.appendChild(ld);
      return ld;
    });
    $('#text').appendChild(this.el);
  }
  // fit the widest line, then one gradient across each line: every iridescent word shows its slice of it
  spread() {
    this.spreadDone = true;
    this.el.style.display = '';
    if (this.fit) {
      const wmax = Math.max(...this.lines.map(ld => [...ld.children].reduce((a, s) => a + s.offsetWidth, 0) * 1.04));
      if (wmax > this.fit) { this.size *= this.fit / wmax; this.el.style.fontSize = this.size + 'px'; }
    }
    for (const ld of this.lines) {
      const ws = [...ld.children].filter(s => s.classList.contains('wl-irid'));
      if (!ws.length) continue;
      const x0 = Math.min(...ws.map(s => s.offsetLeft)), x1 = Math.max(...ws.map(s => s.offsetLeft + s.offsetWidth));
      for (const s of ws) { s.style.backgroundSize = (x1 - x0) + 'px 100%'; s.style.backgroundPosition = (x0 - s.offsetLeft) + 'px 0'; }
    }
  }
  at(t, tin, tout = null, { stagger = 0.09, dur = 0.65, dy = 0.42, blur = 16, outDur = 0.24, outStagger = 0.025, outDy = -0.3 } = {}) {
    if (!this.spreadDone) this.spread();
    let any = false;
    this.words.forEach((w, i) => {
      const ti = tin + i * stagger, pi = prog(t, ti, ti + dur), e = Ease.outExpo(pi);
      let y = (1 - e) * dy, o = clamp(pi * 3), b = (1 - e) * blur;
      if (tout !== null) {
        const po = Ease.inCubic(prog(t, tout + i * outStagger, tout + i * outStagger + outDur));
        y += outDy * po; o *= 1 - po; b += po * 14;
      }
      if (o > 0.002) any = true;
      w.style.transform = `translateY(${y.toFixed(4)}em)`;
      w.style.opacity = o.toFixed(3);
      w.style.filter = b > 0.1 ? `blur(${b.toFixed(2)}px)` : '';
    });
    this.el.style.display = any ? '' : 'none';
  }
}

// a CSS-glass chip placed by its centre; pop: elastic scale-in at t0, out at t1
function chip(html, w, h, opts = {}) {
  const el = glassEl($('#text'), { w, h, ...opts });
  el.inner.innerHTML = html;
  el.place = (t, t0, t1, x, y, { dx = 0, dy = 60, bob = 6, ph = 0 } = {}) => {
    const pin = prog(t, t0, t0 + 0.75);
    const s = pin <= 0 ? 0 : 1 + (Ease.outExpo(pin) - 1) - Math.sin(pin * Math.PI) * 0.06 * (1 - pin);
    const pout = t1 === null ? 0 : Ease.inCubic(prog(t, t1, t1 + 0.32));
    const o = clamp(pin * 4) * (1 - pout);
    const fx = x + dx * (1 - Ease.outExpo(pin)) + pout * dx * 1.5, fy = y + dy * (1 - Ease.outExpo(pin)) + Math.sin(t * 1.6 + ph) * bob - pout * 40;
    el.style.display = o > 0.002 ? '' : 'none';
    el.style.left = (fx - w / 2).toFixed(2) + 'px';
    el.style.top = (fy - h / 2).toFixed(2) + 'px';
    el.style.transform = `scale(${Math.max(0.001, s * (1 - 0.2 * pout)).toFixed(4)})`;
    el.style.opacity = o.toFixed(3);
  };
  return el;
}
const WL_ARROW = {
  recv: '<path d="M30 14 L14 30 M14 17 V30 H27" />',
  send: '<path d="M14 30 L30 14 M17 14 H30 V27" />',
  swap: '<path d="M12 17 H32 M27 12 L32 17 L27 22 M32 27 H12 M17 22 L12 27 L17 32" />',
};
const icoDot = k => `<svg width="64" height="64" viewBox="0 0 44 44"><circle cx="22" cy="22" r="22" fill="#0b0b0d"/><g fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">${WL_ARROW[k]}</g></svg>`;
const TG_ICON = `<svg viewBox="0 0 24 24" width="72" height="72"><defs><linearGradient id="tgw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2AABEE"/><stop offset="1" stop-color="#229ED9"/></linearGradient></defs><circle cx="12" cy="12" r="12" fill="url(#tgw)"/><path d="${TG_PLANE}" fill="#fff" transform="translate(-0.35 0.2)"/></svg>`;

// ------------------------------------------------------------------ glass wipe
// A tall liquid-glass capsule sweeps across the whole frame and refracts everything under it — the
// cut of a whip transition hides inside it. dir: +1 left -> right, -1 right -> left, 2 bottom -> top.
function glassWipe(t0, dur = 0.55, dir = 1, { w = 560, tilt = 12, sfx = true } = {}) {
  const vert = dir === 2;
  const gw = vert ? 1500 : w, gh = vert ? w : 2600;
  const el = glassEl($('#text'), { w: gw, h: gh, r: Math.min(gw, gh) / 2, blur: 3, bevel: 120, scale: 150, tint: 0.05 });
  el.style.zIndex = '5';                       // above the headlines, so it bends them too
  if (sfx) cue(t0 - 0.05, 'whoosh', { dur: dur + 0.1, gain: 0.55, up: dir === 2, pan: vert ? 0 : dir * 0.5 });
  return t => {
    const p = Ease.inOutCubic(prog(t, t0, t0 + dur));
    const on = p > 0 && p < 1;
    el.style.display = on ? '' : 'none';
    if (!on) return;
    if (vert) {
      el.style.left = (W / 2 - gw / 2) + 'px';
      el.style.top = (lerp(H + 120, -gh - 120, p)).toFixed(2) + 'px';
      el.style.transform = `rotate(${-tilt * 0.4}deg)`;
    } else {
      const x = dir > 0 ? lerp(-gw - 160, W + 160, p) : lerp(W + 160, -gw - 160, p);
      el.style.left = x.toFixed(2) + 'px';
      el.style.top = (H / 2 - gh / 2) + 'px';
      el.style.transform = `rotate(${tilt * dir}deg) scaleX(${(1 + 0.25 * Math.sin(Math.PI * p)).toFixed(3)})`;
    }
  };
}

// ------------------------------------------------------------------ end card
// The chrome mark resting on a glass lens (drawn in front of it, never refracted), a Geologica title, a tagline, a glass pill and an optional fine
// print. T0: the lens starts to grow (from `from` of its size); everything else is timed from it.
function chromeEnd(T0, { title = 'INCPT', tag, pill, pillW = 560, risk = null, from = 0.4, lens = { x: 540, y: 780, d: 760 }, titleSize = 236, y = { title: 1236, tag: 1498, pill: 1690, risk: 1800 } } = {}) {
  scene({
    init() {
      this.logo = mkImg('style/logo_chrome.png');
      this.name = new WText(title, { y: y.title, size: titleSize, chars: !/[ ~]/.test(title), track: -0.05, fit: 960 });
      this.tag = new WText(tag, { y: y.tag, size: 42, cls: 'wl-s' });
      this.pill = chip(pill, pillW, 124);
      if (risk) {
        this.risk = document.createElement('div');
        this.risk.className = 'wl wl-s';
        Object.assign(this.risk.style, { left: '0px', top: y.risk + 'px', width: W + 'px', textAlign: 'center', fontSize: '27px', color: '#8b8e96' });
        this.risk.textContent = risk;
        $('#text').appendChild(this.risk);
      }
      cue(T0 + 0.05, 'impact', { gain: 0.7, soft: true });
      cue(T0 + 0.15, 'shimmer', { gain: 0.45 });
      [0, 1, 2, 3, 4].forEach(i => cue(T0 + 0.75 + i * 0.07, 'tick', { gain: 0.3 }));
      cue(T0 + 1.75, 'pop', { gain: 0.55, pitch: 0.85 });
      cue(T0 + 3.3, 'shimmer', { gain: 0.25 });
    },
    update(t) {
      this.name.at(t, T0 + 0.7, null, { stagger: 0.07, dur: 0.8, dy: 0.32, blur: 22 });
      this.tag.at(t, T0 + 1.2, null, { stagger: 0.05 });
      this.pill.place(t, T0 + 1.7, null, W / 2, y.pill, { dy: 40, bob: 4 });
      if (this.risk) {
        const p = prog(t, T0 + 2.0, T0 + 2.6);
        this.risk.style.display = p > 0 ? '' : 'none';
        this.risk.style.opacity = p.toFixed(3);
      }
      if (t < T0 - 0.05) return;
      const g = Ease.outCubic(prog(t, T0 - 0.05, T0 + 0.55));
      const tl = t - (T0 + 0.4);
      const j = tl > 0 ? Math.exp(-tl * 3.0) * Math.sin(tl * 12) * 0.045 : 0;
      const br = Math.sin(t * 1.3) * 0.006;
      const D = lens.d * lerp(from, 1, g);
      LG.S.unshift({ x: lens.x, y: lens.y, w: D * (1 + j + br), h: D * (1 - j - br), k: 0 });
      Object.assign(LG.G, { refr: 58, bevel: 170, mag: 22, tint: 0.03, frost: 0 });
      LG.G.sheen = t < T0 + 2.5 ? lerp(-600, 2600, prog(t, T0 + 0.9, T0 + 2.4)) : lerp(-600, 2600, prog(t, T0 + 3.4, T0 + 4.6));
      const pin = Ease.outCubic(prog(t, T0 + 0.1, T0 + 1.0)), fl = Math.max(0, t - (T0 + 1.0));
      const lh = lens.d * 0.776;
      LG.T.push({
        img: this.logo, x: lens.x + Math.sin(fl * 0.8) * 4, y: lens.y + 10 - fl * 3 + (1 - pin) * 50,
        h: lerp(lh * 0.71, lh, pin), rot: lerp(-12, 0, pin) + Math.sin(fl * 0.9) * 1.2, o: clamp(pin * 2), lod: (1 - pin) * 4, shadow: 0.55, front: true,   // on the lens, never bent by it
      });
    },
  });
}

// ------------------------------------------------------------------ the liquid body
// One glass body that flows through a film. states: [{ t, dur, shapes: [{x, y, w, h, r}], look, k }] —
// at `t` the shapes of the previous state start flowing into these (matched by index; a shape with no
// partner is born from / melts into the first one), staying joined while they flow (smooth union),
// pinching apart as they land, then jiggling once. look: glass optics for the state (refr, bevel,
// mag, tint, frost). k: the union radius the state rests with (0 = separate pieces).
const GLASS = {
  lens: { refr: 58, bevel: 170, mag: 22, tint: 0.03, frost: 0 },
  slab: { refr: 40, bevel: 80, mag: 0, tint: 0.16, frost: 1.6 },
  tile: { refr: 36, bevel: 64, mag: 0, tint: 0.17, frost: 1.6 },
  panel: { refr: 44, bevel: 90, mag: 0, tint: 0.12, frost: 1.2 },
};
class LiquidBody {
  constructor(states) { this.S = states; }
  at(t) {
    const S = this.S;
    if (t < S[0].t) return false;
    let i = 0;
    while (i + 1 < S.length && t >= S[i + 1].t) i++;
    const cur = S[i], prev = S[i - 1] || cur;
    const dur = cur.dur || 0;
    const n = Math.max(prev.shapes.length, cur.shapes.length);
    const look = {};
    const p0 = dur ? Ease.inOutCubic(prog(t, cur.t, cur.t + dur)) : 1;
    for (const k in cur.look) look[k] = lerp(prev.look[k], cur.look[k], p0);
    Object.assign(LG.G, look);
    const dot = s => ({ x: s.x, y: s.y, w: Math.min(s.w, s.h) * 0.3, h: Math.min(s.w, s.h) * 0.3, r: Math.min(s.w, s.h) * 0.15 });
    for (let j = 0; j < n; j++) {
      const a = prev.shapes[j] || dot(prev.shapes[0]);
      const b = cur.shapes[j] || dot(cur.shapes[0]);
      const st = n > 1 ? (j / (n - 1)) * 0.22 : 0;          // pieces leave one after another
      const pr = dur ? prog(t, cur.t + st * dur, cur.t + dur * (0.78 + st)) : 1;
      const p = Ease.inOutCubic(pr);
      const g = { x: lerp(a.x, b.x, p), y: lerp(a.y, b.y, p), w: lerp(a.w, b.w, p), h: lerp(a.h, b.h, p), r: lerp(a.r ?? Math.min(a.w, a.h) / 2, b.r ?? Math.min(b.w, b.h) / 2, p) };
      // stretch along the flow, then one decaying jiggle after landing
      const flow = Math.sin(Math.PI * p) * 0.06;
      const tl = t - (cur.t + dur * (0.78 + st));
      const jg = tl > 0 && dur ? Math.exp(-tl * 3.4) * Math.sin(tl * 12.5) * 0.035 : 0;
      const br = Math.sin(t * 1.3 + j) * 0.004;
      const gone = !cur.shapes[j] && p >= 0.999;
      if (gone) continue;
      const kk = j === 0 ? 0 : lerp(prev.k ?? 0, cur.k ?? 0, Ease.outCubic(prog(t, cur.t + dur * 0.55, cur.t + dur + 0.25))) + Math.sin(Math.PI * clamp(pr)) * 170;
      LG.S.push({ x: g.x, y: g.y, w: g.w * (1 - flow * 0.6 + jg + br), h: g.h * (1 + flow - jg - br), r: g.r, k: kk });
    }
    return true;
  }
}

// drops drift in from the edges and melt into a lens; two droplets pinch off it (t: 0 -> ~3.8 s)
function liquidIntro(t, L = { x: 540, y: 800, d: 790 }, t0 = 0) {
  t -= t0;
  const drops = [
    { sx: 140, sy: 330, r0: 70, r1: 175, a: 0.1, b: 2.15, ph: 0.3 },
    { sx: 960, sy: 520, r0: 56, r1: 150, a: 0.3, b: 1.95, ph: 1.7 },
    { sx: 610, sy: 1460, r0: 86, r1: 205, a: 0.0, b: 2.3, ph: 2.9 },
    { sx: 250, sy: 1150, r0: 34, r1: 95, a: 0.55, b: 1.85, ph: 4.1 },
    { sx: 860, sy: 1260, r0: 26, r1: 70, a: 0.75, b: 2.05, ph: 5.3 },
  ];
  const g = Ease.outCubic(prog(t, 1.65, 2.6));
  const tl = t - 2.45;
  const j = tl > 0 ? Math.exp(-tl * 3.0) * Math.sin(tl * 12) * 0.05 : 0;
  const br = Math.sin(t * 1.3) * 0.006;
  if (L.d * g > 1) LG.S.push({ x: L.x, y: L.y, w: L.d * g * (1 + j + br), h: L.d * g * (1 - j - br), k: 0 });
  for (const d of drops) {
    const p = Ease.inOutCubic(prog(t, d.a, d.b));
    const r = lerp(d.r0, d.r1, p) * Ease.outCubic(prog(t, d.a, d.a + 0.8)) * (1 - prog(t, 2.25, 2.75));
    if (r < 0.5) continue;
    LG.S.push({ x: lerp(d.sx, L.x, p) + Math.sin(t * 2.1 + d.ph) * 16 * (1 - p), y: lerp(d.sy, L.y, p) + Math.cos(t * 1.7 + d.ph) * 14 * (1 - p), w: 2 * r, h: 2 * r, k: 140 });
  }
  for (const s of [-1, 1]) {
    const q = prog(t, 2.55, 3.8);
    if (q <= 0 || q >= 1) continue;
    const r = Math.pow(Math.sin(Math.PI * q), 0.6) * 54;
    LG.S.push({ x: L.x + s * lerp(300, 470, Ease.outCubic(q)), y: L.y + lerp(150, 330, Ease.outCubic(q)) * (s > 0 ? 0.7 : 1), w: 2 * r, h: 2 * r, k: 110 });
  }
  Object.assign(LG.G, GLASS.lens);
  LG.G.sheen = lerp(-600, 2600, prog(t, 3.0, 4.6));
}

// ================================================================== INCPT MOTION SIGNATURE
// The mark is a ribbed chrome boomerang, so the motion language comes from it:
//   - boomerang arcs: things fly in on a curve, spinning, are caught with a little wobble, and fly back out;
//   - the rib shutter: diagonal chrome ribs at the logo's −28° fan across the frame and hide every cut;
//   - kinetic type: letters slam in, numbers count up, glints flash on chrome.
// The logo itself is never put under glass or bent.

// a point on a boomerang arc from A to Bp: a quadratic curve bowed sideways by `bend`, spinning down to rest
function arcAt(t, t0, dur, A, Bp, { bend = 0.35, spin = 540, ease = Ease.outCubic, catchAmp = 7 } = {}) {
  const raw = prog(t, t0, t0 + dur), p = ease(raw);
  const dx = Bp.x - A.x, dy = Bp.y - A.y;
  const cx = (A.x + Bp.x) / 2 - dy * bend, cy = (A.y + Bp.y) / 2 + dx * bend;
  const u = 1 - p;
  const x = u * u * A.x + 2 * u * p * cx + p * p * Bp.x, y = u * u * A.y + 2 * u * p * cy + p * p * Bp.y;
  const tl = t - (t0 + dur);
  const wob = tl > 0 ? Math.exp(-tl * 4.2) * Math.sin(tl * 13) : 0;    // the catch
  return { x, y, rot: (1 - p) * spin + wob * catchAmp, s: (A.s ?? 1) + ((Bp.s ?? 1) - (A.s ?? 1)) * p, squash: wob * 0.035, p: raw };
}
// fly a DOM element (w x h) along arcs: in at t0, out at t1 (null = stays); opts.in / opts.out: {from, to, ...}
function flyEl(el, w, h, t, legs) {
  let q = null, cur = null;
  for (const L of legs) if (t >= L.t0 - 1e-6) { q = arcAt(t, L.t0, L.dur, L.from, L.to, L); cur = L; }
  const vis = q && !(cur.exit && q.p >= 1);
  el.style.display = vis ? '' : 'none';
  if (!vis) return null;
  el.style.left = (q.x - w / 2).toFixed(2) + 'px';
  el.style.top = (q.y - h / 2).toFixed(2) + 'px';
  el.style.transform = `rotate(${q.rot.toFixed(3)}deg) scale(${(q.s * (1 + q.squash)).toFixed(4)}, ${(q.s * (1 - q.squash)).toFixed(4)})`;
  el.style.transformOrigin = '50% 50%';
  return q;
}

// the rib shutter: chrome ribs fan in, cover the frame exactly at each time in `times`, fan out
class RibShutter {
  constructor(times, { n = 34, step = 118 } = {}) {
    this.times = times; this.n = n;
    this.el = document.createElement('div');
    Object.assign(this.el.style, { position: 'absolute', left: (W / 2 - 1800) + 'px', top: (H / 2 - 1800) + 'px', width: '3600px', height: '3600px',
      transform: 'rotate(-28deg)', zIndex: '30', pointerEvents: 'none', overflow: 'hidden' });
    this.bars = [];
    const y0 = 1800 - (n * step) / 2;
    for (let i = 0; i < n; i++) {
      const b = document.createElement('div');
      b.className = 'rib';
      Object.assign(b.style, { position: 'absolute', left: '0px', top: (y0 + i * step) + 'px', width: '3600px', height: (step + 6) + 'px' });
      b.style.backgroundPosition = `0 0, ${(i * 173) % 1100}px 0, 0 0`;
      this.el.appendChild(b);
      this.bars.push(b);
    }
    $('#text').appendChild(this.el);
    for (const tc of times) if (tc > 0.3) { cue(tc - 0.3, 'whoosh', { dur: 0.5, gain: 0.65, up: true }); cue(tc - 0.02, 'crash', { gain: 0.45 }); }
  }
  at(t) {
    const tc = this.times.find(c => t > c - 0.42 && t < c + 0.46);
    this.el.style.display = tc === undefined ? 'none' : '';
    if (tc === undefined) return;
    this.bars.forEach((b, i) => {
      const s = ((i * 7) % this.n) / this.n * 0.12;            // a fan: neighbours a little apart
      const dir = i % 2 ? 1 : -1;
      const pin = Ease.inOutCubic(prog(t, tc - 0.38 + s, tc - 0.14 + s));
      const pout = Ease.inOutCubic(prog(t, tc + 0.04 + s, tc + 0.3 + s));
      const x = dir * (1 - pin) * 3700 + -dir * pout * 3700;
      b.style.transform = `translateX(${x.toFixed(1)}px)`;
    });
  }
}

// kinetic type: letters slam in (big and blurred -> sharp), leave upward; "~word" in the iridescence
class KText {
  constructor(text, { y, size, cls = 'wl-h', lh = 0.9, track = -0.045, fit = 0, color = null }) {
    this.el = document.createElement('div');
    this.el.className = 'wl ' + cls;
    Object.assign(this.el.style, { left: '0px', top: y + 'px', width: W + 'px', textAlign: 'center', fontSize: size + 'px', lineHeight: lh, letterSpacing: track + 'em' });
    if (color) this.el.style.color = color;
    this.size = size; this.fit = fit;
    this.chars = [];
    this.lines = text.split('\n').map(line => {
      const ld = document.createElement('div');
      line.split(' ').forEach((wd, wi, arr) => {
        const irid = wd.startsWith('~');
        const ws = document.createElement('span');
        ws.style.display = 'inline-block';
        ws.style.whiteSpace = 'nowrap';
        if (wi < arr.length - 1) ws.style.marginRight = '0.24em';
        for (const ch of wd.replace(/^~/, '').replace(/_/g, ' ')) {
          const c = document.createElement('span');
          c.className = 'c' + (irid ? ' wl-irid' : '');
          c.style.display = 'inline-block';
          c.textContent = ch;
          ws.appendChild(c);
          this.chars.push(c);
        }
        ld.appendChild(ws);
      });
      this.el.appendChild(ld);
      return ld;
    });
    $('#text').appendChild(this.el);
  }
  prep() {
    this.ready = true;
    this.el.style.display = '';
    if (this.fit) {
      const wmax = Math.max(...this.lines.map(ld => ld.scrollWidth));
      if (wmax > this.fit) { this.size *= this.fit / wmax; this.el.style.fontSize = this.size + 'px'; }
    }
    for (const ld of this.lines) {
      const cs = [...ld.querySelectorAll('.wl-irid')];
      if (!cs.length) continue;
      const r0 = ld.getBoundingClientRect().left;
      const xs = cs.map(c => c.getBoundingClientRect().left - r0), x0 = Math.min(...xs), x1 = Math.max(...cs.map((c, i) => xs[i] + c.offsetWidth));
      cs.forEach((c, i) => { c.style.backgroundSize = (x1 - x0) + 'px 100%'; c.style.backgroundPosition = (x0 - xs[i]) + 'px 0'; });
    }
  }
  at(t, tin, tout = null, { stagger = 0.028, dur = 0.42, from = 1.9, blur = 20, outDur = 0.22 } = {}) {
    if (!this.ready) this.prep();
    let any = false;
    const n = this.chars.length;
    this.chars.forEach((c, i) => {
      const ti = tin + i * stagger, pi = prog(t, ti, ti + dur), e = Ease.outExpo(pi);
      let s = lerp(from, 1, e), y = (1 - e) * -0.06, o = clamp(pi * 4), b = (1 - e) * blur, r = (1 - e) * (i % 2 ? 6 : -6);
      if (tout !== null) {
        const po = Ease.inCubic(prog(t, tout + (n - 1 - i) * 0.008, tout + (n - 1 - i) * 0.008 + outDur));
        y -= po * 0.5; o *= 1 - po; b += po * 16; s *= 1 + po * 0.2;
      }
      if (o > 0.002) any = true;
      c.style.transform = `translateY(${y.toFixed(4)}em) scale(${s.toFixed(4)}) rotate(${r.toFixed(2)}deg)`;
      c.style.opacity = o.toFixed(3);
      c.style.filter = b > 0.1 ? `blur(${b.toFixed(2)}px)` : '';
    });
    this.el.style.display = any ? '' : 'none';
  }
}

// four-point chrome glints that flash on edges: list of [x, y, t, size]
class Glints {
  constructor(list) {
    this.list = list.map(([x, y, t0, s = 90]) => {
      const el = document.createElement('div');
      Object.assign(el.style, { position: 'absolute', left: (x - s / 2) + 'px', top: (y - s / 2) + 'px', width: s + 'px', height: s + 'px', zIndex: '12', pointerEvents: 'none' });
      el.innerHTML = `<svg viewBox="-50 -50 100 100" width="${s}" height="${s}"><defs><radialGradient id="gl${x}_${y}"><stop offset="0" stop-color="#fff"/><stop offset="0.35" stop-color="#f4ffd0" stop-opacity="0.9"/><stop offset="1" stop-color="#9b86ff" stop-opacity="0"/></radialGradient></defs><circle r="26" fill="url(#gl${x}_${y})" opacity="0.6"/><path d="M0 -50 C3 -8 8 -3 50 0 C8 3 3 8 0 50 C-3 8 -8 3 -50 0 C-8 -3 -3 -8 0 -50 Z" fill="#fff"/></svg>`;
      $('#text').appendChild(el);
      cue(t0, 'tick', { gain: 0.25 });
      return { el, t0 };
    });
  }
  at(t) {
    for (const g of this.list) {
      const p = prog(t, g.t0, g.t0 + 0.55);
      const on = p > 0 && p < 1;
      g.el.style.display = on ? '' : 'none';
      if (on) g.el.style.transform = `scale(${Math.sin(Math.PI * p).toFixed(3)}) rotate(${(p * 90).toFixed(1)}deg)`;
    }
  }
}
// a number that counts up: el.textContent = fmt(value)
const countTo = (el, t, t0, dur, to, fmt) => { el.textContent = fmt(to * Ease.outCubic(prog(t, t0, t0 + dur))); };
