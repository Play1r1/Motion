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
// The chrome mark in a glass lens, a Geologica title, a tagline, a glass pill and an optional fine
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
        h: lerp(lh * 0.71, lh, pin), rot: lerp(-12, 0, pin) + Math.sin(fl * 0.9) * 1.2, o: clamp(pin * 2), lod: (1 - pin) * 4, shadow: 0.55,
      });
    },
  });
}
