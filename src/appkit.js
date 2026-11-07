// The INCPT mini app rebuilt in vector inside the real phone frame, for the f_ films (v4).
// Every screen follows the app's own screenshot (assets/app/*.jpg, 920 x 2000) to the pixel grid: the same
// panels, texts, numbers and spacing, in Inter (the app's SF is not ours to ship). Because it is vector, the
// phone can be pushed in and any panel can lift out of it at any size and stay sharp; the app's 3D renders
// (the card, the safe, the card holder) are only ever shown at their own pixels or smaller.
// Liquid Glass is used where it sits over content: a panel that lifts out of the phone turns into glass over
// the screen behind it, the tap mark, the notification. No glass blobs on an empty background.
'use strict';

const AK = {
  F: "'Inter Variable', sans-serif",
  ink: '#0f1115', sub: '#8a8f99', sub2: '#6a707b', mid: '#5c6270', green: '#2fae52', blue: '#2a6fe3',
  grad: 'linear-gradient(90deg, #6aa94e 0%, #539f83 30%, #4c9abb 60%, #6577c1 100%)',   // the brand button
  usd: (v, d = 2) => '$' + v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }),
  num: (v, d = 2) => v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }),
};
// the app's pastel sheet: off-white with pink, lavender, blue, mint and warm patches (sampled from the screenshots)
AK.SHEET = `radial-gradient(48% 22% at 100% 24%, rgba(226,212,246,0.95), rgba(226,212,246,0) 100%),
  radial-gradient(42% 20% at 0% 36%, rgba(244,226,242,0.9), rgba(244,226,242,0) 100%),
  radial-gradient(50% 22% at 0% 63%, rgba(216,232,248,0.95), rgba(216,232,248,0) 100%),
  radial-gradient(46% 20% at 100% 62%, rgba(242,228,240,0.8), rgba(242,228,240,0) 100%),
  radial-gradient(52% 20% at 100% 90%, rgba(252,242,226,0.95), rgba(252,242,226,0) 100%),
  radial-gradient(48% 20% at 0% 90%, rgba(210,240,246,0.9), rgba(210,240,246,0) 100%), #eeeff3`;

(() => {
  const st = document.createElement('style');
  st.textContent = `
  .ak { font-family: ${AK.F}; font-variation-settings: 'opsz' 14; color: ${AK.ink}; letter-spacing: 0.01em; }
  .ak * { box-sizing: border-box; }
  .ak-abs { position: absolute; }
  .ak-pan { position: absolute; background: rgba(255,255,255,0.92); border-radius: 56px; box-shadow: 0 18px 40px -26px rgba(19,36,64,0.22); }
  .ak-c { position: absolute; left: 0; width: 100%; text-align: center; line-height: 1; white-space: nowrap; }
  .ak-l { position: absolute; line-height: 1; white-space: nowrap; }
  .ak-r { position: absolute; line-height: 1; white-space: nowrap; text-align: right; }
  .ak-tn { font-variant-numeric: tabular-nums; }
  .ak-pill { position: absolute; display: flex; align-items: center; justify-content: center; white-space: nowrap; }
  .ak-odo { display: inline-block; position: relative; overflow: hidden; vertical-align: top; height: 1em; line-height: 1em; }
  .ak-odo > span { display: block; position: absolute; left: 0; top: 0; width: 100%; text-align: center; }
  .ak-odo > span:first-child { position: relative; }
  .ak-caret { display: inline-block; width: 0.05em; height: 0.82em; margin-left: 0.06em; vertical-align: -0.02em; background: ${AK.blue}; border-radius: 0.02em; }
  .ak-layer { position: absolute; left: 0; top: 0; width: 1080px; height: 1920px; pointer-events: none; }
  .ak-tap { position: absolute; left: 0; top: 0; width: 96px; height: 96px; margin: -48px 0 0 -48px; }
  .ak-tap .d { position: absolute; inset: 0; border-radius: 50%; background: rgba(24,34,64,0.16); border: 3px solid rgba(255,255,255,0.96);
    box-shadow: 0 8px 22px -6px rgba(16,24,52,0.35), inset 0 1px 0 rgba(255,255,255,0.7); backdrop-filter: blur(3px); }
  .ak-tap .r { position: absolute; inset: 0; border-radius: 50%; border: 2.5px solid rgba(24,34,64,0.28); }
  `;
  document.head.appendChild(st);
})();

// the app's coin icons, vector
AK.COIN = {
  usdt: { c: '#26a17b', g: '<rect x="24" y="23" width="52" height="13" rx="2.5"/><rect x="43.5" y="28" width="13" height="52" rx="2.5"/><ellipse cx="50" cy="51" rx="29" ry="8.6" fill="none" stroke="#fff" stroke-width="4.6"/>' },
  btc: { c: '#f7931a', g: `<g transform="rotate(14 50 50)"><rect x="38" y="14" width="5.5" height="14" rx="1.5"/><rect x="50" y="14" width="5.5" height="14" rx="1.5"/><rect x="38" y="72" width="5.5" height="14" rx="1.5"/><rect x="50" y="72" width="5.5" height="14" rx="1.5"/><text x="51" y="72" text-anchor="middle" font-size="62" font-weight="800" font-family="Inter Variable">B</text></g>` },
};
AK.coin = (k, d) => `<svg width="${d}" height="${d}" viewBox="0 0 100 100" style="display:block"><circle cx="50" cy="50" r="50" fill="${AK.COIN[k].c}"/><g fill="#fff">${AK.COIN[k].g}</g></svg>`;
AK.chev = (s = 22, c = AK.sub) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" style="display:block"><path d="M6 9l6 6 6-6"/></svg>`;
AK.ICO = {
  liquid: '<path d="M12 3.2c2.6 3.3 5.6 6.6 5.6 10.1a5.6 5.6 0 0 1-11.2 0c0-3.5 3-6.8 5.6-10.1z"/>',
  monthly: '<path d="M4.5 16a7.5 7.5 0 0 1 15 0"/><path d="M12 16l3.4-4.4"/>',
  maximum: '<path d="M3.5 17l5.5-5.5 3.5 3.5 7.5-7.5"/><path d="M14.5 7.5h5.5v5.5"/>',
  bolt: '<path d="M13 2.5L5 13.5h6l-1 8 8-11h-6l1-8z" fill="currentColor" stroke="none"/>',
  lock: '<rect x="5" y="11" width="14" height="10" rx="2.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  swap: '<path d="M8 4v15M4.5 15.5L8 19l3.5-3.5"/><path d="M16 20V5M12.5 8.5L16 5l3.5 3.5"/>',
  plus: '<path d="M12 4v16M4 12h16"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  down: '<path d="M12 5v14M6 13l6 6 6-6"/>', up: '<path d="M12 19V5M6 11l6-6 6 6"/>',
};
AK.ico = (k, col, s = 40, w = 2) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" style="display:block;color:${col}">${AK.ICO[k]}</svg>`;

// ------------------------------------------------------------------ small helpers
AK.el = (parent, html, style = {}) => {
  const d = document.createElement('div');
  d.innerHTML = html;
  const e = d.children.length === 1 && !Object.keys(style).length ? d.firstElementChild : d;
  if (e === d) Object.assign(d.style, style);
  parent.appendChild(e);
  return e;
};
AK.q = (root, k) => root.querySelector(`[data-k="${k}"]`);
AK.vis = (e, on) => { e.style.visibility = on ? '' : 'hidden'; };
AK.op = (e, o) => { e.style.opacity = o >= 0.999 ? '' : Math.max(0, o).toFixed(3); e.style.visibility = o < 0.002 ? 'hidden' : ''; };
AK.mv = (e, x, y, s = 1) => { e.style.transform = `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px)${s !== 1 ? ` scale(${s.toFixed(4)})` : ''}`; };
// centre of an element on the frame (works through the phone's 3D transform: the projected box)
AK.at = e => { const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height }; };

// a number whose changed digits roll (only the digits that differ move; the rest stay put)
class Odo {
  constructor(el, str) { this.el = el; this.build(str); }
  build(str) {
    this.str = str;
    this.el.innerHTML = '';
    this.cols = [...str].map(ch => {
      if (!/\d/.test(ch)) { const s = document.createElement('span'); s.textContent = ch; this.el.appendChild(s); return null; }
      const box = document.createElement('span'); box.className = 'ak-odo ak-tn';
      const a = document.createElement('span'), b = document.createElement('span');
      box.append(a, b); this.el.appendChild(box);
      a.textContent = ch; return { box, a, b, d: +ch };
    });
  }
  // from -> to (same length and punctuation), p in 0..1; digits roll upwards, staggered from the left
  set(from, to, p, { stagger = 0.08, down = false } = {}) {
    if (to.length !== this.str.length || [...to].some((c, i) => /\d/.test(c) !== !!this.cols[i])) this.build(to);
    const n = this.cols.filter(Boolean).length; let k = 0;
    this.cols.forEach((c, i) => {
      if (!c) { this.el.children[i].textContent = to[i]; return; }
      const a = +from[i] || 0, b = +to[i];
      const q = Ease.outCubic(clamp((p - (k++ / Math.max(1, n - 1)) * stagger * (n > 1 ? 1 : 0)) / (1 - stagger)));
      if (a === b || q >= 1 || q <= 0) { c.a.textContent = q <= 0 ? a : b; c.a.style.transform = ''; c.b.style.display = 'none'; return; }
      const steps = down ? ((a - b + 10) % 10 || 10) : ((b - a + 10) % 10 || 10), pos = q * steps, i0 = Math.floor(pos), f = pos - i0, dir = down ? -1 : 1;
      c.a.textContent = (a + dir * i0 + 20) % 10; c.b.textContent = (a + dir * (i0 + 1) + 20) % 10; c.b.style.display = '';
      c.a.style.transform = `translateY(${(-f * dir).toFixed(3)}em)`; c.b.style.transform = `translateY(${((1 - f) * dir).toFixed(3)}em)`;
    });
  }
}

// ------------------------------------------------------------------ the phone with a vector screen
class AppPhone {
  constructor(layer, { hdr = 'close', bar = null, h = 2000 } = {}) {
    const P = MANIFEST.phone;
    const R = this.root = document.createElement('div');
    Object.assign(R.style, { position: 'absolute', left: '0px', top: '0px', width: P.size[0] + 'px', height: P.size[1] + 'px', transformStyle: 'preserve-3d', transformOrigin: '50% 50%' });
    this.frameEls = [];
    const img = (src, css) => { const im = mkImg(src, 'abs'); Object.assign(im.style, css); R.appendChild(im); this.frameEls.push(im); return im; };
    this.shadow = img(P.shadow, { left: -P.shadowPad + 'px', top: -P.shadowPad + 'px', width: P.size[0] + 2 * P.shadowPad + 'px', height: P.size[1] + 2 * P.shadowPad + 'px', transform: 'translateZ(-40px)' });
    for (let i = 1; i <= 2; i++) img(P.edge, { left: '0px', top: '0px', width: '100%', height: '100%', transform: `translateZ(${-i * 12}px)` });
    const [sx, sy] = P.screenOffset;
    const scr = this.screen = document.createElement('div');
    scr.className = 'ak';
    Object.assign(scr.style, { position: 'absolute', left: sx + 'px', top: sy + 'px', width: '920px', height: '2000px', overflow: 'hidden', borderRadius: P.screenRadius + 'px', transform: 'translateZ(0.2px)' });
    R.appendChild(scr);
    this.bg = AK.el(scr, '<div></div>', {}); Object.assign(this.bg.style, { position: 'absolute', inset: '0', background: AK.SHEET });
    this.content = AK.el(scr, '<div></div>', {});
    Object.assign(this.content.style, { position: 'absolute', left: '0px', top: '0px', width: '920px', height: h + 'px' });
    const ov = MANIFEST.reel.overlays || {};
    this.hdr = mkImg(`howto/build/ov_hdr_${hdr}.png`, 'abs'); Object.assign(this.hdr.style, { left: '0px', top: '0px', width: '920px', height: '302px' }); scr.appendChild(this.hdr);
    if (bar) { this.bar = mkImg(`howto/build/ov_bar_${bar}.png`, 'abs'); Object.assign(this.bar.style, { left: '0px', top: '1700px', width: '920px', height: '210px' }); scr.appendChild(this.bar); }
    this.dim = AK.el(scr, '<div></div>', {}); Object.assign(this.dim.style, { position: 'absolute', inset: '0', background: '#eef0f5', opacity: '0', pointerEvents: 'none' });
    const isl = img(P.island, { left: sx + 460 - P.islandSize[0] / 2 + 'px', top: sy + P.islandTop + 'px', width: P.islandSize[0] + 'px', height: P.islandSize[1] + 'px', transform: 'translateZ(0.4px)' });
    img(P.frame, { left: '0px', top: '0px', width: '100%', height: '100%', transform: 'translateZ(0.5px)' });
    (layer.el || layer).appendChild(R);
    this.W = P.size[0]; this.H = P.size[1]; this.sx = sx; this.sy = sy;
    this.scroll = 0;
  }
  // fade the phone itself (body, frame, sheet, header, tab bar) independently of the screen's content
  chrome(o) {
    const v = o >= 0.999 ? '' : Math.max(0, o).toFixed(3);
    for (const e of [...this.frameEls, this.bg, this.hdr, this.bar].filter(Boolean)) { e.style.opacity = v; e.style.visibility = o < 0.002 ? 'hidden' : ''; }
    this.screen.style.overflow = o < 0.002 ? 'visible' : 'hidden';
  }
  // x, y: centre on the frame; s: scale; blur/dim: depth of field while a panel is lifted
  set({ x = 540, y = 960, s = 0.6, rx = 0, ry = 0, rz = 0, o = 1, blur = 0, dim = 0, scroll = null, vis = true }) {
    const st = this.root.style;
    if (!vis || o < 0.002) { st.display = 'none'; return this; }
    st.display = '';
    st.transform = `translate(${(x - this.W / 2).toFixed(2)}px, ${(y - this.H / 2).toFixed(2)}px) rotateX(${rx.toFixed(3)}deg) rotateY(${ry.toFixed(3)}deg) rotateZ(${rz.toFixed(3)}deg) scale(${s.toFixed(4)})`;
    st.opacity = o >= 0.999 ? '' : o.toFixed(3);
    st.filter = blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : '';
    this.dim.style.opacity = dim.toFixed(3);
    if (scroll !== null) { this.scroll = scroll; this.content.style.transform = `translateY(${(-scroll).toFixed(2)}px)`; }
    return this;
  }
}

// a layer above the phone with its own perspective (the phone lives in one, panels and taps in others)
AK.layer = (z, persp = 0) => {
  const d = document.createElement('div');
  d.className = 'ak-layer';
  d.style.zIndex = z;
  if (persp) { d.style.perspective = persp + 'px'; d.style.perspectiveOrigin = '540px 960px'; d.style.transformStyle = 'preserve-3d'; }
  $('#text').appendChild(d);
  return d;
};

// a panel that lifts out of the phone: a vector copy of the app's panel that leaves its place on the screen
// (the original hides), grows towards the camera and turns into Liquid Glass over the screen behind it
class Lift {
  constructor(layer, src, html, { w, h, r = 56, tint = 0.5, solid = 0.92, glass = true } = {}) {
    this.src = src; this.w = w; this.h = h; this.solid = solid; this.isGlass = glass;
    let g;
    if (glass) {
      g = glassEl(layer, { w, h, r, blur: 22, bevel: 44, scale: 54, tint });
      Object.assign(g.inner.style, { display: 'block', padding: '0', textAlign: 'left' });
    } else {
      g = document.createElement('div'); g.inner = g; (layer.el || layer).appendChild(g);
      Object.assign(g.style, { position: 'absolute', width: w + 'px', height: h + 'px', borderRadius: r + 'px', overflow: 'hidden' });
    }
    this.g = g;
    g.classList.add('ak');
    Object.assign(g.style, { left: '0px', top: '0px', transformOrigin: '50% 50%', display: 'none' });
    this.back = AK.el(g.inner, '<div></div>', {}); Object.assign(this.back.style, { position: 'absolute', inset: '0', background: '#fff', borderRadius: r + 'px' });
    if (!glass) this.back.style.display = 'none';
    this.body = AK.el(g.inner, html);
    Object.assign(this.body.style, { position: 'absolute', left: '0px', top: '0px', width: w + 'px', height: h + 'px' });
  }
  // k: 0 = in its place on the phone, 1 = at `to` ({x, y, s, rx, ry, rz, arc}); glass: 0 = the app's white panel, 1 = glass
  at(k, to, { glass = k, hide = true, o = 1 } = {}) {
    const st = this.g.style;
    if (k <= 0.0005 || o < 0.002) { st.display = 'none'; if (this.hid) { AK.vis(this.src, true); this.hid = false; } return null; }
    const a = AK.at(this.src), s0 = a.w / this.w;
    const x = lerp(a.x, to.x, k), y = lerp(a.y, to.y, k) - Math.sin(Math.PI * k) * (to.arc || 0), s = lerp(s0, to.s, k);
    st.display = '';
    st.opacity = o >= 0.999 ? '' : o.toFixed(3);
    st.transform = `translate(${(x - this.w / 2).toFixed(2)}px, ${(y - this.h / 2).toFixed(2)}px) perspective(1800px) rotateX(${((to.rx || 0) * k).toFixed(3)}deg) rotateY(${((to.ry || 0) * k).toFixed(3)}deg) rotateZ(${((to.rz || 0) * k).toFixed(3)}deg) scale(${s.toFixed(4)})`;
    st.boxShadow = `0 ${(10 + 40 * k).toFixed(1)}px ${(30 + 60 * k).toFixed(1)}px ${(-20 - 6 * k).toFixed(1)}px rgba(18,24,52,${(0.12 + 0.2 * k).toFixed(3)})`;
    if (this.isGlass) this.back.style.opacity = (this.solid * (1 - glass)).toFixed(3);
    if (hide) { AK.vis(this.src, false); this.hid = true; }
    return { x, y, s };
  }
}

// a glass card placed by its centre on the frame (toasts, the operations sheet, chips)
class GlassCard {
  constructor(layer, html, { w, h, r = 48, tint = 0.55, z = null } = {}) {
    const g = this.g = glassEl(layer, { w, h, r, blur: 20, bevel: 40, scale: 50, tint });
    Object.assign(g.inner.style, { display: 'block', padding: '0', textAlign: 'left' });
    g.classList.add('ak');
    Object.assign(g.style, { left: '0px', top: '0px', transformOrigin: '50% 50%', display: 'none' });
    if (z !== null) g.style.zIndex = z;
    this.body = AK.el(g.inner, html);
    Object.assign(this.body.style, { position: 'absolute', left: '0px', top: '0px', width: w + 'px', height: h + 'px' });
    this.w = w; this.h = h;
  }
  set({ x = 540, y = 960, s = 1, rx = 0, ry = 0, o = 1, blur = 0, vis = true }) {
    const st = this.g.style;
    if (!vis || o < 0.002) { st.display = 'none'; return this; }
    st.display = '';
    st.transform = `translate(${(x - this.w / 2).toFixed(2)}px, ${(y - this.h / 2).toFixed(2)}px) perspective(1800px) rotateX(${rx.toFixed(3)}deg) rotateY(${ry.toFixed(3)}deg) scale(${s.toFixed(4)})`;
    st.opacity = o >= 0.999 ? '' : o.toFixed(3);
    st.filter = blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : '';
    return this;
  }
}

// text that changes: the old value slides up and out, the new one rises in (lengths may differ)
AK.flip = (el, a, b, p) => {
  if (!el._f) { el.innerHTML = '<span style="display:inline-block"></span><span style="display:inline-block;position:absolute;left:0;top:0"></span>'; const cs = getComputedStyle(el); if (cs.position === 'static') el.style.position = 'relative'; if (cs.display === 'inline') el.style.display = 'inline-block'; el._f = [el.firstChild, el.lastChild]; }
  const [x, y] = el._f, e = Ease.outCubic(clamp(p));
  if (e <= 0) { x.textContent = a; y.textContent = ''; x.style.cssText = 'display:inline-block'; return; }
  if (e >= 1) { x.textContent = b; y.textContent = ''; x.style.cssText = 'display:inline-block'; return; }
  x.textContent = b; x.style.cssText = `display:inline-block;opacity:${e.toFixed(3)};transform:translateY(${((1 - e) * 0.5).toFixed(3)}em)`;
  y.textContent = a; y.style.cssText = `display:inline-block;position:absolute;left:0;top:0;opacity:${(1 - e).toFixed(3)};transform:translateY(${(-e * 0.5).toFixed(3)}em)`;
};

// the tap mark: a small glass disc that presses and leaves a ring
class TapDot {
  constructor(layer) {
    this.el = AK.el(layer, '<div class="ak-tap"><div class="r"></div><div class="d"></div></div>');
    this.r = this.el.firstChild; this.d = this.el.lastChild;
    this.el.style.display = 'none';
  }
  at(t, t0, p) {   // p: {x, y} on the frame at the moment of the press
    const a = t0 - 0.28, end = t0 + 0.6;
    if (t < a || t > end || !p) { this.el.style.display = 'none'; return; }
    const sIn = tw(t, a, t0 - 0.04, 0.6, 1, Ease.outCubic);
    const press = t < t0 - 0.04 ? 1 : t < t0 + 0.1 ? tw(t, t0 - 0.04, t0 + 0.08, 1, 0.82, Ease.outCubic) : tw(t, t0 + 0.1, t0 + 0.32, 0.82, 1, Ease.outCubic);
    const o = t < t0 ? tw(t, a, a + 0.14, 0, 1, Ease.linear) : tw(t, t0 + 0.22, end, 1, 0, Ease.inCubic);
    const rs = t < t0 ? 1 : tw(t, t0, end, 1, 2.2, Ease.outCubic), ro = t < t0 ? 0 : tw(t, t0, end, 0.9, 0, Ease.outCubic);
    this.el.style.display = '';
    this.el.style.transform = `translate(${p.x.toFixed(2)}px, ${p.y.toFixed(2)}px)`;
    this.el.style.opacity = o.toFixed(3);
    this.d.style.transform = `scale(${(sIn * press).toFixed(4)})`;
    this.r.style.transform = `scale(${rs.toFixed(4)})`; this.r.style.opacity = ro.toFixed(3);
  }
}

// the app's operation row (as in «Операции»): arrow in a light circle, title + chip, date; amount + status
AK.row = ({ dir = 'out', title, chip = '', sub = '', amount, status, w = 846 }) => {
  const out = dir === 'out', col = out ? AK.blue : AK.green;
  const arrow = out ? 'M15 9 L9 9 L9 15 M9 9 L19 19' : 'M9 9 L19 19 M19 13 L19 19 L13 19';
  return `<div style="position:relative;width:${w}px;height:150px;display:flex;align-items:center;padding:0 34px">
    <div style="width:84px;height:84px;border-radius:42px;background:rgba(19,36,64,0.055);display:flex;align-items:center;justify-content:center;flex:none">
      <svg width="38" height="38" viewBox="0 0 28 28" fill="none" stroke="${col}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="${arrow}"/></svg></div>
    <div style="margin-left:26px;flex:1;min-width:0">
      <div style="display:flex;align-items:center;gap:14px"><span style="font-size:35px;font-weight:600;letter-spacing:-0.01em;white-space:nowrap">${title}</span>${chip ? `<span style="font-size:23px;font-weight:500;color:${AK.sub2};background:rgba(19,36,64,0.06);padding:5px 12px 6px;border-radius:12px;white-space:nowrap">${chip}</span>` : ''}</div>
      <div style="margin-top:9px;font-size:27px;color:${AK.sub};white-space:nowrap">${sub}</div></div>
    <div style="text-align:right;flex:none;margin-left:16px">
      <div style="font-size:35px;font-weight:600;letter-spacing:-0.01em;color:${out ? AK.ink : AK.green}">${amount}</div>
      <div style="margin-top:9px;font-size:27px;color:${AK.sub}">${status}</div></div></div>`;
};

// ------------------------------------------------------------------ screens (content coordinates = the screenshot's)
// «Обмен» (assets/app/swap.jpg; the button below the fold, as on page_swap)
AK.swapGive = (amt = '0') => `<div class="ak" style="position:absolute;left:0;top:0;width:836px;height:338px">
    <div class="ak-l" style="left:38px;top:50px;font-size:27px;color:${AK.sub}">Отдаёте</div>
    <div class="ak-r" style="right:38px;top:50px;font-size:27px;color:#9da1aa">Доступно: 40,000.40 USDT</div>
    <div class="ak-pill" style="left:38px;top:156px;width:265px;height:99px;border-radius:50px;background:rgba(19,36,64,0.05);justify-content:flex-start;padding-left:15px">
      <span data-k="ic" style="display:block;width:68px;height:68px">${AK.coin('usdt', 68)}</span><span style="margin-left:20px;font-size:33px;font-weight:600">USDT</span><span style="margin-left:22px">${AK.chev(24)}</span></div>
    <div class="ak-r ak-tn" data-k="amt" style="right:38px;top:132px;font-size:91px;font-weight:700;letter-spacing:-0.01em">${amt}</div>
    <div class="ak-r ak-tn" data-k="usd" style="right:38px;top:251px;font-size:29px;color:#9da1aa">≈ $0.00</div></div>`;
AK.swapGet = () => `<div class="ak" style="position:absolute;left:0;top:0;width:836px;height:320px">
    <div class="ak-l" style="left:38px;top:51px;font-size:27px;color:${AK.sub}">Получаете</div>
    <div class="ak-r" data-k="bal" style="right:38px;top:51px;font-size:27px;color:#9da1aa">Баланс: 0.5 BTC</div>
    <div class="ak-pill" style="left:38px;top:148px;width:240px;height:99px;border-radius:50px;background:rgba(19,36,64,0.05);justify-content:flex-start;padding-left:15px">
      <span data-k="ic" style="display:block;width:68px;height:68px">${AK.coin('btc', 68)}</span><span style="margin-left:20px;font-size:33px;font-weight:600">BTC</span><span style="margin-left:22px">${AK.chev(24)}</span></div>
    <div class="ak-r ak-tn" data-k="amt" style="right:38px;top:122px;font-size:91px;font-weight:700;letter-spacing:-0.01em;color:#c3c6cd">0</div>
    <div class="ak-r ak-tn" data-k="usd" style="right:38px;top:233px;font-size:29px;color:#9da1aa">≈ $0.00</div></div>`;
AK.swapFees = () => `<div class="ak" style="position:absolute;left:0;top:0;width:836px;height:430px;font-size:30px">
    ${[['Курс', '<span data-k="rate">—</span>'], ['Комиссия сети', '≈ $5.23 · нужно ≈ $6.28'],
       ['Комиссия обмена', `<span data-k="incl" style="display:inline-block;font-size:27px;font-weight:600;color:${AK.blue};background:rgba(42,111,227,0.12);padding:8px 22px 9px;border-radius:24px">В курсе</span>`],
       ['Вы получите', '<span data-k="recv">—</span>']]
      .map(([l, r], i) => `<div style="position:absolute;left:38px;right:38px;top:${67 + i * 98.5 - 24}px;height:48px;display:flex;align-items:center;justify-content:space-between">
        <span style="color:${AK.sub}">${l}</span><span style="font-weight:500">${r}</span></div>`).join('')}</div>`;
AK.swapScreen = root => {
  root.innerHTML = `
  <div class="ak-pill" style="left:302px;top:330px;width:316px;height:82px;border-radius:41px;background:rgba(255,255,255,0.92);box-shadow:0 10px 24px -16px rgba(19,36,64,0.3);justify-content:flex-start;padding-left:13px">
    ${AK.coin('usdt', 54)}<span style="margin-left:16px;font-size:29px;font-weight:600">Кошелек 1</span><span style="margin-left:18px">${AK.chev(24, AK.ink)}</span></div>
  <div class="ak-c" style="top:482px;font-size:35px;font-weight:700">Обмен</div>
  <div class="ak-pan" data-k="give" style="left:42px;top:557px;width:836px;height:338px">${AK.swapGive()}</div>
  <div class="ak-pan" data-k="get" style="left:42px;top:918px;width:836px;height:320px">${AK.swapGet()}</div>
  <div data-k="flip" style="position:absolute;left:409px;top:847px;width:102px;height:102px;border-radius:51px;background:#fff;box-shadow:0 10px 26px -10px rgba(19,36,64,0.35);display:flex;align-items:center;justify-content:center">
    <div data-k="flipi">${AK.ico('swap', AK.blue, 44, 2.2)}</div></div>
  ${['25%', '50%', '75%', 'Макс'].map((l, i) => `<div class="ak-pill" data-k="pct${i}" style="left:${[43, 256, 469, 682][i]}px;top:1276px;width:${i === 3 ? 195 : 194}px;height:94px;border-radius:30px;background:rgba(19,36,64,0.045);font-size:31px;font-weight:600">${l}</div>`).join('')}
  <div class="ak-pan" data-k="fees" style="left:42px;top:1408px;width:836px;height:430px">${AK.swapFees()}</div>
  <div class="ak-c" style="top:1885px;left:80px;width:760px;font-size:25px;line-height:1.48;color:#9da1aa;white-space:normal">Чтобы обменять, мы отправляем депозит на биржу — это один перевод с комиссией сети. Комиссия обмена уже в курсе.</div>
  <div data-k="btn" style="position:absolute;left:42px;top:2075px;width:836px;height:123px;border-radius:62px;overflow:hidden;background:#c6c8ce">
    <div data-k="btnon" style="position:absolute;inset:0;background:${AK.grad};opacity:0"></div>
    <div data-k="btnl" class="ak-pill" style="inset:0;font-size:33px;font-weight:600;color:#fff">Обменять</div></div>`;
  return root;
};

// «Стейкинг» (assets/app/stake.jpg; the deposits as on page_stake below the fold)
AK.stakeAmount = (v = '$0') => `<div class="ak" style="position:absolute;left:0;top:0;width:754px;height:266px;border-radius:44px;overflow:hidden;
    background:radial-gradient(60% 90% at 8% 30%, rgba(238,206,236,0.95), rgba(238,206,236,0) 70%), radial-gradient(50% 90% at 42% 80%, rgba(214,238,214,0.9), rgba(214,238,214,0) 70%),
      radial-gradient(40% 80% at 64% 30%, rgba(246,236,202,0.9), rgba(246,236,202,0) 70%), radial-gradient(50% 90% at 88% 60%, rgba(214,226,250,0.95), rgba(214,226,250,0) 70%), radial-gradient(40% 80% at 100% 20%, rgba(240,212,238,0.9), rgba(240,212,238,0) 70%), #eef0f6">
    <div style="position:absolute;inset:0;background:linear-gradient(180deg, rgba(255,255,255,0.35), rgba(255,255,255,0.15))"></div>
    <div class="ak-c ak-tn" data-k="amt" style="top:63px;font-size:122px;font-weight:700;letter-spacing:-0.02em">${v}</div>
    <div class="ak-c" style="top:206px;font-size:24px;color:${AK.sub2}">Доступно 40,000.40 USDT · мин. $10 · макс. $20,000</div></div>`;
AK.stakeTabs = () => `<div class="ak" style="position:absolute;left:0;top:0;width:754px;height:150px;border-radius:36px;background:rgba(19,36,64,0.045);display:flex;align-items:center;padding:0 10px">
    ${[['liquid', 'Liquid', true], ['monthly', 'Monthly'], ['maximum', 'Maximum', false, true]].map(([k, l, on, lock]) => `<div data-k="tab_${k}" style="flex:1;height:130px;border-radius:30px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;${on ? 'background:#fff;box-shadow:0 0 0 2.5px rgba(47,174,82,0.5),0 12px 26px -12px rgba(47,174,82,0.5)' : ''}">
      ${AK.ico(k, on ? AK.green : '#9da1aa', 40)}<div style="display:flex;align-items:center;gap:6px;font-size:27px;font-weight:600;color:${on ? AK.green : '#9da1aa'}">${lock ? AK.ico('lock', '#b4b8c0', 24) : ''}${l}</div></div>`).join('')}</div>`;
AK.stakeDeposit = (fc = '≈ $14.42') => `<div class="ak" style="position:absolute;left:0;top:0;width:826px;height:236px;display:flex;align-items:center;padding:0 40px">
    <div style="width:96px;height:96px;border-radius:48px;background:rgba(47,174,82,0.12);display:flex;align-items:center;justify-content:center;flex:none">${AK.ico('liquid', AK.green, 48)}</div>
    <div style="margin-left:30px;flex:1"><div style="font-size:35px;font-weight:600">Liquid Vault</div><div style="margin-top:10px;font-size:30px;color:${AK.sub2}">20,000.00 USDT</div>
      <div style="margin-top:10px;font-size:27px;color:${AK.green};display:flex;align-items:center"><span style="display:inline-block;width:14px;height:14px;border-radius:7px;background:${AK.green};margin-right:12px"></span>Депозит активен</div></div>
    <div style="width:2px;align-self:stretch;margin:46px 32px;background:rgba(19,36,64,0.08)"></div>
    <div><div style="font-size:27px;color:${AK.sub2}">Прогноз сегодня</div><div data-k="fc" class="ak-tn" style="margin-top:12px;font-size:42px;font-weight:700;color:${AK.green}">${fc}</div></div></div>`;
AK.stakeTop = (total = '$0.00', fc = '$0.00') => `<div class="ak" style="position:absolute;left:0;top:0;width:920px;height:250px">
    <div class="ak-c ak-tn" data-k="total" style="top:11px;font-size:80px;font-weight:700;letter-spacing:-0.015em">${total}</div>
    <div class="ak-c" style="top:102px;font-size:30px;color:${AK.sub}">Всего в стейкинге</div>
    <div class="ak-pill" style="left:242px;top:168px;width:436px;height:70px;border-radius:35px;background:rgba(47,174,82,0.13);color:${AK.green};font-size:27px;font-weight:600">
      ${AK.ico('bolt', AK.green, 28)}<span style="margin-left:12px">прогноз <span data-k="fc" class="ak-tn">${fc}</span> сегодня</span></div></div>`;
AK.stakeMid = (amt = '$0', yv = '≈ $0.00') => `<div class="ak" style="position:absolute;left:0;top:0;width:754px;height:492px">
    <div style="position:absolute;left:0;top:0;width:754px;height:266px">${AK.stakeAmount(amt)}</div>
    ${['+$50', '+$100', '+$500', 'Макс'].map((l, i) => `<div class="ak-pill" data-k="chip${i}" style="left:${[0, 193, 385, 577][i]}px;top:294px;width:${i === 3 ? 177 : 175}px;height:70px;border-radius:35px;background:rgba(19,36,64,0.055);font-size:26px;font-weight:600;color:${AK.mid}">${l}</div>`).join('')}
    <div class="ak-pill" style="left:0;top:393px;width:754px;height:99px;border-radius:30px;background:rgba(47,174,82,0.09);font-size:28px;font-weight:500">Через год получите&nbsp;<span data-k="yv" class="ak-tn">${yv}</span></div></div>`;
AK.stakeScreen = (root, { total = '$0.00', fc = '$0.00' } = {}) => {
  root.innerHTML = `
  <div class="ak-c" data-k="title" style="top:340px;font-size:37px;font-weight:700">Стейкинг</div>
  <img data-k="safe" src="promo/build/pr_safe.png" style="position:absolute;left:252px;top:348px;width:422px;height:424px">
  <div data-k="top" style="position:absolute;left:0;top:760px;width:920px;height:250px">${AK.stakeTop(total, fc)}</div>
  <div class="ak-pan" data-k="card" style="left:47px;top:1028px;width:826px;height:950px;border-radius:50px">
    <div class="ak-l" style="left:36px;top:45px;font-size:27px;font-weight:600;color:${AK.mid}">Liquid Vault</div>
    <div class="ak-r" data-k="apy" style="right:37px;top:45px;font-size:27px;font-weight:600;color:${AK.green}">20–40% APY</div>
    <div data-k="mid" style="position:absolute;left:36px;top:110px;width:754px;height:492px">${AK.stakeMid()}</div>
    <div data-k="btn" style="position:absolute;left:36px;top:629px;width:754px;height:112px;border-radius:36px;overflow:hidden;background:#a3a5ab">
      <div data-k="btnon" style="position:absolute;inset:0;background:${AK.grad};opacity:0"></div>
      <div data-k="btnl" class="ak-pill" style="inset:0;font-size:29px;font-weight:600;color:#fff">Открыть стейкинг</div></div>
    <div data-k="tabs" style="position:absolute;left:36px;top:765px;width:754px;height:150px">${AK.stakeTabs()}</div></div>
  <div class="ak-l" data-k="dephead" style="left:47px;top:2030px;font-size:31px;font-weight:600">Ваши депозиты</div>
  <div class="ak-pan" data-k="dep" style="left:47px;top:2088px;width:826px;height:236px;border-radius:44px">${AK.stakeDeposit()}</div>
  <div data-k="terms" style="position:absolute;left:47px;top:2370px;width:826px;font-size:23px;line-height:1.5;color:#9da1aa">Доходность любого типа стейкинга определяется рыночными условиями и обеспечивается третьей стороной в рамках соответствующего смарт-контракта.<br><br>Пополнять и выводить средства на постоянной основе можно только в Liquid Vault в пределах лимита 20 000 USDT.</div>`;
  return root;
};

// «Мои карты» (assets/app/cards.jpg)
AK.cardFace = (bal = '$25,000.00') => `<div style="position:absolute;left:0;top:0;width:764px;height:484px">
    <img src="style/card_holo_blank.png" style="position:absolute;left:0;top:0;width:764px;height:484px">
    <div data-k="cbal" class="ak ak-tn" style="position:absolute;left:43px;top:398px;font-size:41px;font-weight:400;letter-spacing:-0.005em;color:#0d0e12;line-height:1;white-space:nowrap">${bal}</div></div>`;
AK.cardsToday = (inn = '$0', out = '$0') => `<div class="ak" style="position:absolute;left:0;top:0;width:515px;height:68px;border-radius:34px;background:rgba(19,36,64,0.06);display:flex;align-items:center;justify-content:center;font-size:27px;font-weight:600;white-space:nowrap">
    <span style="color:${AK.sub}">Сегодня</span>
    <span style="margin-left:18px;display:flex;align-items:center;color:${AK.green}">${AK.ico('down', AK.green, 26, 2.6)}<span data-k="tin" class="ak-tn" style="margin-left:4px">${inn}</span></span>
    <span style="margin-left:18px;display:flex;align-items:center;color:${AK.mid}">${AK.ico('up', AK.mid, 26, 2.6)}<span data-k="tout" class="ak-tn" style="margin-left:4px">${out}</span></span>
    <span style="margin-left:14px">${AK.chev(24, AK.sub)}</span></div>`;
AK.cardsAdd = () => `<div class="ak" style="position:absolute;left:0;top:0;width:826px;height:470px;border-radius:50px;border:3px dashed rgba(19,36,64,0.17);display:flex;flex-direction:column;align-items:center;justify-content:center">
    <div style="width:88px;height:88px;border-radius:44px;background:rgba(19,36,64,0.06);display:flex;align-items:center;justify-content:center">${AK.ico('plus', AK.ink, 38, 2.4)}</div>
    <div style="margin-top:26px;font-size:34px;font-weight:600">Добавить карту</div>
    <div style="margin-top:14px;font-size:28px;color:${AK.sub}">Виртуальные и металлическая</div></div>`;
AK.cardsScreen = (root, { bal = '$25,000.00' } = {}) => {
  root.innerHTML = `
  <div class="ak-c" style="top:351px;font-size:35px;font-weight:700">Мои карты</div>
  <img data-k="holder" src="promo/build/pr_holder.png" style="position:absolute;left:206px;top:382px;width:524px;height:470px">
  <div class="ak-c ak-tn" data-k="bal" style="top:829px;font-size:80px;font-weight:700;letter-spacing:-0.015em">${bal}</div>
  <div class="ak-c" style="top:918px;font-size:30px;color:${AK.sub}">Баланс карт</div>
  <div data-k="today" style="position:absolute;left:203px;top:983px;width:515px;height:68px">${AK.cardsToday()}</div>
  <div data-k="card" style="position:absolute;left:47px;top:1078px;width:826px;height:523px;border-radius:50px;overflow:hidden;box-shadow:0 20px 40px -26px rgba(19,36,64,0.35)">
    <div style="position:absolute;left:0;top:0;width:764px;height:484px;transform:scale(${(826 / 764).toFixed(5)});transform-origin:0 0">${AK.cardFace(bal)}</div></div>
  <div data-k="add" style="position:absolute;left:47px;top:1636px;width:826px;height:470px">${AK.cardsAdd()}</div>`;
  return root;
};

// a counter that formats on the fly
AK.count = (el, v, fmt) => { el.textContent = fmt(v); };
