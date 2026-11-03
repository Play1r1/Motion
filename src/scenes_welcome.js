// INCPT welcome reel — 9:16, 27 s, 90 BPM, "calm" track. The 2026 brand (pearl, ribbed iridescent
// chrome, Geologica) in a liquid-glass language: one glass body flows through the whole film —
// drops that meet into a lens around the logo, a slab under the phone, a column for the coins, a
// case for the card, a sphere for the vault, four tiles for the services, and the lens again.
// Every claim is in the app: Получить / Отправить / Обменять, 14 coins, the INCPT card (virtual and
// metal), Liquid Vault 20–40 % APY, eSIM / Бизнес-лаунж / Фаст-лайн / Real-World Assets marked «скоро».
'use strict';

DURATION = 27.0;
const B = 60 / 90;
const T2 = 8 * B, T3 = 14 * B, T4 = 19 * B, T5 = 24 * B, T6 = 29 * B, TE = 33 * B;
META = { drop: T2, end: TE, bpm: 90, music: 'calm', key: 0 };
const oC = Ease.outCubic, iC = Ease.inCubic;
drawBg = t => LG.draw(t);                  // the WebGL field replaces the old foil background

// ------------------------------------------------------------------ text
// Geologica lines; words rise and un-blur one by one. "~word" is drawn in the logo's iridescence,
// spread over the whole line. chars: animate letter by letter (for the wordmark).
class WText {
  constructor(text, { y, size, cls = 'wl-h', lh = 0.92, track = null, chars = false, color = null }) {
    this.el = document.createElement('div');
    this.el.className = 'wl ' + cls;
    Object.assign(this.el.style, { left: '0px', top: y + 'px', width: W + 'px', textAlign: 'center', fontSize: size + 'px', lineHeight: lh });
    if (track !== null) this.el.style.letterSpacing = track + 'em';
    if (color) this.el.style.color = color;
    this.words = [];
    this.lines = text.split('\n').map(line => {
      const ld = document.createElement('div');
      const parts = chars ? [...line] : line.split(' ');
      parts.forEach((w, i) => {
        const s = document.createElement('span');
        s.className = 'w' + (w.startsWith('~') ? ' wl-irid' : '');
        s.textContent = w.replace(/^~/, '');
        if (!chars && i < parts.length - 1) s.style.marginRight = '0.24em';
        ld.appendChild(s);
        this.words.push(s);
      });
      this.el.appendChild(ld);
      return ld;
    });
    $('#text').appendChild(this.el);
  }
  // one gradient across each line: every iridescent word shows its own slice of it
  spread() {
    this.spreadDone = true;
    this.el.style.display = '';
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

// ------------------------------------------------------------------ the glass body
// One shape flows through the film: key poses, liquid morphs between them (with two droplets that
// lag behind and melt back in), a jiggle after every landing.
const POSE = {
  lens: { x: 540, y: 800, w: 790, h: 790, r: 395 },
  slab: { x: 540, y: 1300, w: 860, h: 1120, r: 100 },
  column: { x: 540, y: 1225, w: 880, h: 1170, r: 90 },
  case_: { x: 540, y: 1135, w: 900, h: 640, r: 72 },
  sphere: { x: 540, y: 860, w: 640, h: 640, r: 320 },
  end: { x: 540, y: 780, w: 760, h: 760, r: 380 },
};
// [time the morph starts, pose, morph duration]
const PATH = [[0, 'lens', 0], [T2 - 0.45, 'slab', 0.8], [T3 - 0.4, 'column', 0.75], [T4 - 0.35, 'case_', 0.7], [T5 - 0.35, 'sphere', 0.75]];
const LOOK = {   // glass optics per pose
  lens: { refr: 58, bevel: 170, mag: 22, tint: 0.03, frost: 0 },
  slab: { refr: 40, bevel: 80, mag: 0, tint: 0.16, frost: 1.6 },
  column: { refr: 40, bevel: 80, mag: 0, tint: 0.16, frost: 1.6 },
  case_: { refr: 44, bevel: 90, mag: 0, tint: 0.12, frost: 1.2 },
  sphere: { refr: 46, bevel: 120, mag: 8, tint: 0.04, frost: 0 },
  tiles: { refr: 36, bevel: 64, mag: 0, tint: 0.17, frost: 1.6 },
  end: { refr: 58, bevel: 170, mag: 22, tint: 0.03, frost: 0 },
};
const mixPose = (a, b, p) => ({ x: lerp(a.x, b.x, p), y: lerp(a.y, b.y, p), w: lerp(a.w, b.w, p), h: lerp(a.h, b.h, p), r: lerp(a.r, b.r, p) });
const mixLook = (a, b, p) => Object.fromEntries(Object.keys(a).map(k => [k, lerp(a[k], b[k], p)]));
function body(t) {
  let i = 0;
  while (i + 1 < PATH.length && t >= PATH[i + 1][0]) i++;
  const [t0, name, dur] = PATH[i];
  const prev = i > 0 ? PATH[i - 1][1] : name;
  const p = dur ? ioC(prog(t, t0, t0 + dur)) : 1;
  const ps = mixPose(POSE[prev], POSE[name], p);
  const look = mixLook(LOOK[prev], LOOK[name], p);
  // squash and stretch: stretch along the move while it flows, jiggle once it lands
  const flow = Math.sin(Math.PI * p) * 0.07;
  const tl = t - (t0 + dur);
  const j = tl > 0 ? Math.exp(-tl * 3.4) * Math.sin(tl * 12.5) * 0.04 : 0;
  ps.w *= 1 - flow * 0.6 + j; ps.h *= 1 + flow - j;
  const sats = [];
  if (dur && p > 0 && p < 1) {
    const a = POSE[prev], b = POSE[name], q = Math.pow(p, 1.7), sz = Math.sin(Math.PI * p) * 120;
    for (const side of [-1, 1]) {
      sats.push({ x: lerp(a.x, b.x, q) + side * (ps.w * 0.36), y: lerp(a.y, b.y, q) + side * 40, w: sz, h: sz, k: 150 });
    }
  }
  return { ps, look, sats, name, p };
}
const setLook = L => Object.assign(LG.G, { refr: L.refr, bevel: L.bevel, mag: L.mag, tint: L.tint, frost: L.frost });

// ======================================================================= 0. FIELD + GLASS BODY
scene({
  init() {
    LG.init();
    this.logo = mkImg('style/logo_chrome.png');
    this.safe = mkImg('bank/icons/icon_safe.png');
    LG.IMG = { logo: this.logo, safe: this.safe };
  },
  update(t) {
    LG.reset();
    // the field drifts slowly upward over the film; a gentle push in the end card
    LG.F.sy = t * 9;
    if (t >= T6 - 0.4) return;            // services and the end card place their own glass
    const b = body(t);
    if (t < T2 - 0.45) return;            // the intro builds its lens itself
    setLook(b.look);
    LG.S.push({ ...b.ps, k: 0 }, ...b.sats);
  },
});

// ======================================================================= 1. INTRO (0 – 5.3)
// four drops drift in and melt into a lens; the logo surfaces inside it; «Добро пожаловать в INCPT»
scene({
  init() {
    this.hello = new WText('Добро пожаловать в', { y: 1262, size: 50, cls: 'wl-s' });
    this.name = new WText('INCPT', { y: 1318, size: 236, cls: 'wl-h', chars: true, track: -0.05 });
    this.tag = new WText('Криптокошелёк и карты в Telegram', { y: 1580, size: 40, cls: 'wl-s' });
    cue(0.05, 'shimmer', { gain: 0.3 });
    cue(0.4, 'whoosh', { dur: 1.6, gain: 0.35 });
    cue(2.15, 'impact', { gain: 0.55, soft: true });
    cue(2.3, 'shimmer', { gain: 0.4 });
    cue(2.95, 'tick', { gain: 0.35 });
    [0, 1, 2, 3, 4].forEach(i => cue(3.2 + i * 0.07, 'tick', { gain: 0.25 }));
    cue(3.75, 'pop', { gain: 0.4, pitch: 0.9 });
  },
  update(t) {
    const show = t < T2 + 0.1;
    this.hello.at(t, 2.85, T2 - 0.55, { dur: 0.7 });
    this.name.at(t, 3.15, T2 - 0.5, { stagger: 0.07, dur: 0.8, dy: 0.32, blur: 22 });
    this.tag.at(t, 3.7, T2 - 0.45, { stagger: 0.05 });
    if (!show) return;
    const C = POSE.lens;
    if (t < T2 - 0.45) {
      // drops: from the edges toward the centre, wobbling, absorbed by the lens
      const drops = [
        { sx: 140, sy: 330, r0: 70, r1: 175, t0: 0.1, t1: 2.15, ph: 0.3 },
        { sx: 960, sy: 520, r0: 56, r1: 150, t0: 0.3, t1: 1.95, ph: 1.7 },
        { sx: 610, sy: 1460, r0: 86, r1: 205, t0: 0.0, t1: 2.3, ph: 2.9 },
        { sx: 250, sy: 1150, r0: 34, r1: 95, t0: 0.55, t1: 1.85, ph: 4.1 },
        { sx: 860, sy: 1260, r0: 26, r1: 70, t0: 0.75, t1: 2.05, ph: 5.3 },
      ];
      for (const d of drops) {
        const p = ioC(prog(t, d.t0, d.t1));
        const x = lerp(d.sx, C.x, p) + Math.sin(t * 2.1 + d.ph) * 16 * (1 - p);
        const y = lerp(d.sy, C.y, p) + Math.cos(t * 1.7 + d.ph) * 14 * (1 - p);
        const r = lerp(d.r0, d.r1, p) * oC(prog(t, d.t0, d.t0 + 0.8)) * (1 - prog(t, 2.25, 2.75));
        LG.S.push({ x, y, w: 2 * r, h: 2 * r, k: 140 });
      }
      // the lens grows where they meet and jiggles like a drop of liquid, then breathes
      const g = Ease.outCubic(prog(t, 1.65, 2.6));
      const tl = t - 2.45;
      const j = tl > 0 ? Math.exp(-tl * 3.0) * Math.sin(tl * 12) * 0.05 : 0;
      const br = Math.sin(t * 1.3) * 0.006;
      const D = C.w * g;
      if (D > 1) LG.S.unshift({ x: C.x, y: C.y, w: D * (1 + j + br), h: D * (1 - j - br), k: 0 });
      // two droplets pinch off the lens and drift away
      for (const s of [-1, 1]) {
        const q = prog(t, 2.55, 3.8);
        if (q <= 0 || q >= 1) continue;
        const r = Math.pow(Math.sin(Math.PI * q), 0.6) * 54;
        LG.S.push({ x: C.x + s * lerp(300, 470, oC(q)), y: C.y + lerp(150, 330, oC(q)) * (s > 0 ? 0.7 : 1), w: 2 * r, h: 2 * r, k: 110 });
      }
      setLook(LOOK.lens);
      LG.G.sheen = lerp(-600, 2600, prog(t, 3.0, 4.6));
    }
    // the logo surfaces inside the lens, sharpens, then floats; it sinks away as the lens flows on
    const pin = oC(prog(t, 1.75, 2.9));
    const pout = iC(prog(t, T2 - 0.6, T2 - 0.1));
    const fl = Math.max(0, t - 2.9);
    if (pin > 0 && pout < 1) {
      LG.T.push({
        img: LG.IMG.logo, x: C.x + Math.sin(fl * 0.8) * 4, y: C.y + 10 - fl * 3 + (1 - pin) * 40 + pout * 60,
        h: lerp(470, 610, pin) * (1 - 0.25 * pout), rot: lerp(-10, 0, pin) + Math.sin(fl * 0.9) * 1.2,
        o: clamp(pin * 2) * (1 - pout), lod: (1 - pin) * 4 + pout * 3, shadow: 0.55,
      });
    }
  },
});

// ======================================================================= 2. ALL IN ONE (5.3 – 9.3)
// the phone rises onto the glass slab; Получить / Отправить / Обменять float off it in glass
scene({
  init() {
    this.head = new WText('Крипта и карты\n~в ~одном ~месте', { y: 196, size: 118 });
    this.phone = new Phone($('#cam'), 'home_v3');
    this.phone.set({ vis: false });
    this.chips = [
      chip(`${icoDot('recv')}<span class="wl-chip">Получить</span>`, 330, 112),
      chip(`${icoDot('send')}<span class="wl-chip">Отправить</span>`, 350, 112),
      chip(`${icoDot('swap')}<span class="wl-chip">Обменять</span>`, 340, 112),
    ];
    cue(T2 - 0.45, 'whoosh', { dur: 0.7, gain: 0.5 });
    cue(T2 + 0.05, 'impact', { gain: 0.6, soft: true });
    [0, 1, 2].forEach(i => cue(T2 + 0.95 + i * B, 'pop', { gain: 0.5, pitch: 0.9 + i * 0.1 }));
    cue(T3 - 0.45, 'whoosh', { dur: 0.5, gain: 0.45 });
  },
  update(t) {
    this.head.at(t, T2 + 0.15, T3 - 0.5);
    const on = t > T2 - 0.3 && t < T3 + 0.2;
    if (!on) { this.phone.set({ vis: false }); this.chips.forEach(c => (c.style.display = 'none')); return; }
    const pin = Ease.outExpo(prog(t, T2 - 0.1, T2 + 0.9));
    const pout = iC(prog(t, T3 - 0.45, T3));
    const fl = t - T2;
    this.phone.set({
      vis: true, x: Math.sin(fl * 0.7) * 6, y: 340 + (1 - pin) * 1250 + pout * 1300, z: 0,
      s: 0.5, rx: lerp(22, 4, pin) + Math.sin(fl * 0.8) * 1.2 + pout * 18, ry: lerp(-14, -5, pin) + Math.sin(fl * 0.55) * 2.5, rz: lerp(-3, 0, pin),
    });
    const tout = T3 - 0.5;
    this.chips[0].place(t, T2 + 0.95, tout, 238, 1040, { dx: -120, ph: 0 });
    this.chips[1].place(t, T2 + 0.95 + B, tout + 0.06, 842, 1250, { dx: 120, ph: 1.4 });
    this.chips[2].place(t, T2 + 0.95 + 2 * B, tout + 0.12, 250, 1468, { dx: -120, ph: 2.6 });
  },
});

// ======================================================================= 3. 14 COINS (9.3 – 12.7)
// the slab becomes a column; the wallet's 14 coins roll through it like a wheel
const COINS = ['usdt', 'usdc', 'incpt', 'btc', 'eth', 'trx', 'sol', 'hype', 'ton', 'xmr', 'zec', 'bnb', 'doge', 'xrp'];
scene({
  init() {
    this.head = new WText('~14 монет.\nОдин кошелёк.', { y: 196, size: 118 });
    const clip = document.createElement('div');
    Object.assign(clip.style, { position: 'absolute', left: '120px', top: '660px', width: '840px', height: '1130px', overflow: 'hidden' });
    const m = 'linear-gradient(180deg, transparent 0%, #000 12%, #000 86%, transparent 100%)';
    clip.style.maskImage = m; clip.style.webkitMaskImage = m;
    $('#text').appendChild(clip);
    this.clip = clip;
    this.rows = COINS.map(n => {
      const im = mkImg(`style/coin_${n}.png`, 'abs');
      Object.assign(im.style, { left: '37px', width: '765px', height: '159px', transformOrigin: '50% 50%' });
      clip.appendChild(im);
      return im;
    });
    cue(T3 + 0.2, 'scroll', { dur: 2.6, gain: 0.45 });
    [0, 1, 2, 3, 4, 5].forEach(i => cue(T3 + 0.1 + i * 0.09, 'tick', { gain: 0.22 }));
    cue(T4 - 0.4, 'whoosh', { dur: 0.5, gain: 0.45 });
  },
  update(t) {
    this.head.at(t, T3 + 0.05, T4 - 0.45);
    const on = t > T3 - 0.1 && t < T4 + 0.1;
    this.clip.style.display = on ? '' : 'none';
    if (!on) return;
    const STEP = 176;
    // rows arrive from below in a cascade, then the list rolls on, slowing down
    const roll = kf(t, [[T3 + 0.55, 0], [T4 - 0.35, 7.2 * STEP, Ease.inOutSine]]);
    const pout = iC(prog(t, T4 - 0.42, T4 - 0.02));
    this.rows.forEach((im, i) => {
      const pin = Ease.outExpo(prog(t, T3 - 0.05 + i * 0.045, T3 + 0.75 + i * 0.045));
      const y = 70 + i * STEP - roll + (1 - pin) * (500 + i * 40) - pout * 260;
      const c = y + 80 - 565;                       // distance from the column centre
      const k = clamp(Math.abs(c) / 640);
      const s = 1 - 0.12 * k * k;
      const o = clamp(pin * 2) * (1 - pout) * (1 - 0.35 * k * k);
      im.style.display = o > 0.002 && y > -200 && y < 1300 ? '' : 'none';
      im.style.transform = `translateY(${y.toFixed(2)}px) scale(${s.toFixed(4)})`;
      im.style.opacity = o.toFixed(3);
    });
  },
});

// ======================================================================= 4. THE CARD (12.7 – 16.0)
// the holographic card lands on a glass case; a glass capsule sweeps over it and bends its foil
scene({
  init() {
    this.head = new WText('Карта ~INCPT', { y: 196, size: 128 });
    this.sub = new WText('Виртуальная и металлическая', { y: 340, size: 46, cls: 'wl-s' });
    this.card = new Node($('#cam'), { w: 764, h: 484, flat: true });
    const cim = mkImg('style/card_holo.png', 'fill');
    cim.style.filter = 'drop-shadow(0 40px 46px rgba(20,24,60,0.30))';
    this.card.el.appendChild(cim);
    this.shine = document.createElement('div');
    Object.assign(this.shine.style, { position: 'absolute', inset: '0', borderRadius: '44px', mixBlendMode: 'soft-light',
      background: 'linear-gradient(115deg, rgba(255,255,255,0) 35%, rgba(255,255,255,0.85) 48%, rgba(255,255,255,0) 61%)', backgroundSize: '300% 100%' });
    this.card.el.appendChild(this.shine);
    this.cap = glassEl($('#text'), { w: 200, h: 700, r: 100, blur: 2, bevel: 70, scale: 110, tint: 0.06 });
    cue(T4 + 0.05, 'whoosh', { dur: 0.6, gain: 0.5, up: true });
    cue(T4 + 0.55, 'impact', { gain: 0.45, soft: true });
    cue(T4 + 0.6, 'shimmer', { gain: 0.45 });
    cue(T4 + 1.15, 'whoosh', { dur: 1.4, gain: 0.35 });
    cue(T5 - 0.4, 'whoosh', { dur: 0.5, gain: 0.45 });
  },
  update(t) {
    this.head.at(t, T4 + 0.1, T5 - 0.45);
    this.sub.at(t, T4 + 0.45, T5 - 0.42, { stagger: 0.05 });
    const on = t > T4 - 0.2 && t < T5 + 0.1;
    if (!on) { this.card.set({ vis: false }); this.cap.style.display = 'none'; return; }
    const pin = Ease.outExpo(prog(t, T4 - 0.1, T4 + 0.85));
    const pout = iC(prog(t, T5 - 0.45, T5));
    const fl = t - T4;
    this.card.set({
      vis: true, x: 0, y: 1135 - 960 + (1 - pin) * 260 - Math.sin(fl * 1.1) * 8, z: lerp(-900, 0, pin) + pout * 300,
      s: 1.02 * (1 - 0.4 * pout), rx: lerp(38, 7, pin) + Math.sin(fl * 0.9) * 2, ry: lerp(-48, -10, pin) + fl * 3.5 + pout * 70, rz: lerp(-12, -4, pin),
      o: clamp(pin * 3) * (1 - pout),
    });
    this.shine.style.backgroundPosition = `${lerp(130, -40, prog(t, T4 + 0.5, T4 + 1.6)).toFixed(1)}% 0`;
    // the capsule: in from the left, across the card, out to the right
    const pc = Ease.inOutSine(prog(t, T4 + 1.1, T5 - 0.55));
    const cx = lerp(-160, 1240, pc);
    const vis = pc > 0 && pc < 1;
    this.cap.style.display = vis ? '' : 'none';
    if (vis) {
      this.cap.style.left = (cx - 100).toFixed(2) + 'px';
      this.cap.style.top = (1135 - 350 + Math.sin(pc * Math.PI) * -20).toFixed(2) + 'px';
      this.cap.style.transform = `rotate(${lerp(14, 8, pc).toFixed(2)}deg)`;
    }
  },
});

// ======================================================================= 5. LIQUID VAULT (16.0 – 19.3)
// the case rounds into a sphere with the vault inside; 20–40 % годовых
scene({
  init() {
    this.pill = chip('<span class="wl-chip" style="font-size:31px;letter-spacing:0.16em;font-weight:700;color:#3a3d46">LIQUID VAULT · USDT</span>', 520, 86);
    this.big = new WText('~20–40%', { y: 1318, size: 236, track: -0.06 });
    this.sub = new WText('годовых в стейкинге', { y: 1560, size: 50, cls: 'wl-s' });
    cue(T5 + 0.1, 'impact', { gain: 0.5, soft: true });
    cue(T5 + 0.4, 'coin', { gain: 0.55 });
    cue(T5 + 0.9, 'pop', { gain: 0.45, pitch: 1.1 });
    cue(T5 + 1.3, 'shimmer', { gain: 0.4 });
    cue(T6 - 0.45, 'whoosh', { dur: 0.55, gain: 0.5 });
  },
  update(t) {
    this.pill.place(t, T5 + 0.75, T6 - 0.5, 540, 1258, { dy: 30, bob: 3 });
    this.big.at(t, T5 + 0.95, T6 - 0.48, { dur: 0.8, blur: 20 });
    this.sub.at(t, T5 + 1.3, T6 - 0.45, { stagger: 0.06 });
    const on = t > T5 - 0.2 && t < T6;
    if (!on) return;
    const pin = oC(prog(t, T5 - 0.05, T5 + 0.9));
    const pout = iC(prog(t, T6 - 0.5, T6 - 0.1));
    const fl = t - T5;
    const C = POSE.sphere;
    LG.T.push({
      img: LG.IMG.safe, x: C.x + Math.sin(fl * 0.9) * 5, y: C.y + 18 + (1 - pin) * 60 - Math.sin(fl * 1.2) * 8 + pout * 40,
      h: lerp(260, 370, pin) * (1 - 0.3 * pout), rot: lerp(12, 0, pin) + Math.sin(fl * 0.8) * 2.5,
      o: clamp(pin * 2.5) * (1 - pout), lod: (1 - pin) * 3 + pout * 2, shadow: 0.5,
    });
    if (t > T5 + 0.3) LG.G.sheen = lerp(-500, 2400, prog(t, T5 + 0.6, T5 + 2.2));
  },
});

// ======================================================================= 6. SERVICES (19.3 – 22.0)
// the sphere splits into four tiles: eSIM, Бизнес-лаунж, Фаст-лайн, Real-World Assets — «скоро»
const TILES = [
  { x: 300, y: 905, ico: 'esim', label: 'eSIM' },
  { x: 780, y: 905, ico: 'lounge', label: 'Бизнес-лаунж' },
  { x: 300, y: 1385, ico: 'fastline', label: 'Фаст-лайн' },
  { x: 780, y: 1385, ico: 'rwa', label: 'Real-World Assets' },
];
scene({
  init() {
    this.head = new WText('И это только\n~начало', { y: 196, size: 118 });
    this.items = TILES.map(T => {
      const el = document.createElement('div');
      Object.assign(el.style, { position: 'absolute', left: (T.x - 220) + 'px', top: (T.y - 220) + 'px', width: '440px', height: '440px' });
      const im = mkImg(`bank/icons/icon_${T.ico}.png`, 'abs');
      Object.assign(im.style, { left: '100px', top: '28px', width: '240px', height: '240px' });
      const lab = document.createElement('div');
      lab.className = 'wl';
      Object.assign(lab.style, { left: '0px', top: '282px', width: '440px', textAlign: 'center', fontSize: '36px', fontWeight: '600', letterSpacing: '-0.015em' });
      lab.textContent = T.label;
      const soon = document.createElement('div');
      Object.assign(soon.style, { position: 'absolute', left: '0px', top: '342px', width: '440px', textAlign: 'center' });
      soon.innerHTML = '<span class="wl-soon">скоро</span>';
      el.append(im, lab, soon);
      $('#text').appendChild(el);
      return { el, im, lab, soon };
    });
    cue(T6 - 0.1, 'impact', { gain: 0.4, soft: true });
    [0, 1, 2, 3].forEach(i => cue(T6 + 0.35 + i * 0.16, 'pop', { gain: 0.5, pitch: 0.85 + i * 0.1 }));
    cue(TE - 0.45, 'whoosh', { dur: 0.6, gain: 0.5, up: true });
  },
  update(t) {
    this.head.at(t, T6 + 0.1, TE - 0.5);
    const on = t > T6 - 0.4 && t < TE + 0.2;
    this.items.forEach(it => (it.el.style.display = on ? '' : 'none'));
    if (!on) return;
    const S = POSE.sphere, E = POSE.end;
    setLook(mixLook(LOOK.sphere, LOOK.tiles, oC(prog(t, T6 - 0.4, T6 + 0.4))));
    const pg = iC(prog(t, TE - 0.55, TE - 0.05));         // tiles gather into the end lens
    TILES.forEach((T, i) => {
      const p = Ease.outExpo(prog(t, T6 - 0.4 + i * 0.07, T6 + 0.7 + i * 0.07));
      const ps = { x: lerp(S.x, T.x, p), y: lerp(S.y, T.y, p), w: lerp(S.w, 440, p), h: lerp(S.h, 440, p), r: lerp(S.r, 76, p) };
      const tl = t - (T6 + 0.5 + i * 0.07);
      const j = tl > 0 ? Math.exp(-tl * 3.6) * Math.sin(tl * 13) * 0.035 : 0;
      const g = mixPose(ps, { x: E.x, y: E.y, w: 300, h: 300, r: 150 }, pg);
      LG.S.push({ ...g, w: g.w * (1 + j), h: g.h * (1 - j), k: lerp(150, 0, oC(prog(t, T6 - 0.1, T6 + 0.6))) + pg * 170 });
      // content: icon pops, label and «скоро» follow
      const it = this.items[i], t0 = T6 + 0.3 + i * 0.16;
      const pi = prog(t, t0, t0 + 0.7), e = Ease.outExpo(pi);
      const s = pi <= 0 ? 0.001 : 1 + (e - 1) - Math.sin(pi * Math.PI) * 0.08 * (1 - pi);
      const fo = 1 - iC(prog(t, TE - 0.6 + i * 0.03, TE - 0.3 + i * 0.03));
      it.im.style.transform = `translateY(${(Math.sin(t * 1.5 + i) * 5).toFixed(2)}px) scale(${(s * (0.7 + 0.3 * fo)).toFixed(4)})`;
      it.im.style.opacity = (clamp(pi * 3) * fo).toFixed(3);
      for (const [k, el] of [[0.12, it.lab], [0.22, it.soon]]) {
        const q = Ease.outExpo(prog(t, t0 + k, t0 + k + 0.6));
        el.style.transform = `translateY(${((1 - q) * 24).toFixed(2)}px)`;
        el.style.opacity = (clamp(q * 2) * fo).toFixed(3);
      }
    });
    if (pg > 0) LG.S.push({ x: E.x, y: E.y, w: E.w * pg, h: E.h * pg, k: 170 });
  },
});

// ======================================================================= 7. END CARD (22.0 – 27.0)
scene({
  init() {
    this.name = new WText('INCPT', { y: 1236, size: 236, chars: true, track: -0.05 });
    this.tag = new WText('Криптокошелёк и карты в Telegram', { y: 1498, size: 42, cls: 'wl-s' });
    const tg = `<svg viewBox="0 0 24 24" width="72" height="72"><defs><linearGradient id="tgw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2AABEE"/><stop offset="1" stop-color="#229ED9"/></linearGradient></defs><circle cx="12" cy="12" r="12" fill="url(#tgw)"/><path d="${TG_PLANE}" fill="#fff" transform="translate(-0.35 0.2)"/></svg>`;
    this.badge = chip(`${tg}<span class="wl-chip" style="font-size:40px;font-weight:650">Открыть в Telegram</span>`, 560, 124);
    cue(TE + 0.05, 'impact', { gain: 0.7, soft: true });
    cue(TE + 0.15, 'shimmer', { gain: 0.45 });
    [0, 1, 2, 3, 4].forEach(i => cue(TE + 0.75 + i * 0.07, 'tick', { gain: 0.3 }));
    cue(TE + 1.75, 'pop', { gain: 0.55, pitch: 0.85 });
    cue(TE + 3.3, 'shimmer', { gain: 0.25 });
  },
  update(t) {
    this.name.at(t, TE + 0.7, null, { stagger: 0.07, dur: 0.8, dy: 0.32, blur: 22 });
    this.tag.at(t, TE + 1.2, null, { stagger: 0.05 });
    this.badge.place(t, TE + 1.7, null, 540, 1690, { dy: 40, bob: 4 });
    if (t < TE - 0.05) return;
    const E = POSE.end;
    const g = oC(prog(t, TE - 0.05, TE + 0.55));
    const tl = t - (TE + 0.4);
    const j = tl > 0 ? Math.exp(-tl * 3.0) * Math.sin(tl * 12) * 0.045 : 0;
    const br = Math.sin(t * 1.3) * 0.006;
    LG.S.unshift({ x: E.x, y: E.y, w: E.w * lerp(0.4, 1, g) * (1 + j + br), h: E.h * lerp(0.4, 1, g) * (1 - j - br), k: 0 });
    setLook(LOOK.end);
    LG.G.sheen = t < TE + 2.5 ? lerp(-600, 2600, prog(t, TE + 0.9, TE + 2.4)) : lerp(-600, 2600, prog(t, TE + 3.4, TE + 4.6));
    const pin = oC(prog(t, TE + 0.1, TE + 1.0)), fl = Math.max(0, t - (TE + 1.0));
    LG.T.push({
      img: LG.IMG.logo, x: E.x + Math.sin(fl * 0.8) * 4, y: E.y + 10 - fl * 3 + (1 - pin) * 50,
      h: lerp(420, 590, pin), rot: lerp(-12, 0, pin) + Math.sin(fl * 0.9) * 1.2, o: clamp(pin * 2), lod: (1 - pin) * 4, shadow: 0.55,
    });
  },
});
