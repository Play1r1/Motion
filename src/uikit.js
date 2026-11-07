// The app's UI pieces rebuilt as vector DOM in its own style (Inter for the app's SF, its colours, its
// spacing): crisp at any size and all of one family, so nothing looks pasted in. Texts and numbers are
// the app's own, read off its screens. Used by the f_* films on Liquid Glass (glassEl from src/glass.js).
'use strict';

const UI = {
  F: "'Inter Variable', sans-serif",          // single quotes: it goes inside style="..." attributes
  ink: '#121318', grey: '#8a8f99', green: '#2fae52', blue: '#2a6fe3',
  // the app's operation row: arrow, title + chip, date line; amount + status on the right
  row({ dir = 'out', title, chip = '', sub = '', amount, status }) {
    const out = dir === 'out', col = out ? UI.blue : UI.green;
    const arrow = out ? 'M15 9 L9 9 L9 15 M9 9 L19 19' : 'M9 9 L19 19 M19 13 L19 19 L13 19';
    return `<div style="position:relative;height:150px;display:flex;align-items:center;font-family:${UI.F}">
      <div style="width:76px;height:76px;border-radius:38px;background:rgba(19,36,64,0.055);display:flex;align-items:center;justify-content:center;flex:none">
        <svg width="34" height="34" viewBox="0 0 28 28" fill="none" stroke="${col}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="${arrow}"/></svg></div>
      <div style="margin-left:26px;flex:1;min-width:0">
        <div style="display:flex;align-items:center;gap:14px"><span style="font-size:35px;font-weight:600;color:${UI.ink};letter-spacing:-0.01em;white-space:nowrap">${title}</span>${chip ? `<span style="font-size:22px;font-weight:500;color:#6a707b;background:rgba(19,36,64,0.06);padding:5px 12px 6px;border-radius:12px;white-space:nowrap">${chip}</span>` : ''}</div>
        <div style="margin-top:8px;font-size:26px;color:${UI.grey};white-space:nowrap">${sub}</div></div>
      <div style="text-align:right;flex:none;margin-left:16px">
        <div style="font-size:35px;font-weight:600;color:${out ? UI.ink : UI.green};letter-spacing:-0.01em">${amount}</div>
        <div style="margin-top:8px;font-size:26px;color:${UI.grey}">${status}</div></div></div>`;
  },
  // a glass card with free layout inside (glassEl centres its content; this one does not)
  glass(w, h, r = 48, { tint = 0.5, blur = 18 } = {}) {
    const el = glassEl($('#text'), { w, h, r, blur, bevel: 40, scale: 50, tint });
    Object.assign(el.inner.style, { display: 'block', padding: '0', textAlign: 'left' });
    el.style.left = '0px'; el.style.top = '0px'; el.style.transformOrigin = '50% 50%';
    el.w = w; el.h = h;
    // place by the centre, with a 2.5D tilt
    el.set = ({ x = 540, y = 960, s = 1, rx = 0, ry = 0, o = 1, vis = true }) => {
      if (!vis || o < 0.002) { el.style.display = 'none'; return; }
      el.style.display = '';
      el.style.transform = `translate(${(x - w / 2).toFixed(2)}px, ${(y - h / 2).toFixed(2)}px) perspective(1800px) rotateX(${rx.toFixed(3)}deg) rotateY(${ry.toFixed(3)}deg) scale(${s.toFixed(4)})`;
      el.style.opacity = o >= 0.999 ? '' : o.toFixed(3);
    };
    return el;
  },
  // a block of HTML inside a glass card, placed at (x, y) of the card, shown by set({ o, dy })
  part(card, html, { x = 0, y = 0, w = null } = {}) {
    const d = document.createElement('div');
    Object.assign(d.style, { position: 'absolute', left: x + 'px', top: y + 'px', width: (w ?? card.w - 2 * x) + 'px' });
    d.innerHTML = html;
    card.inner.appendChild(d);
    d.set = ({ o = 1, dy = 0 }) => {
      d.style.display = o < 0.002 ? 'none' : '';
      d.style.opacity = o >= 0.999 ? '' : o.toFixed(3);
      d.style.transform = dy ? `translateY(${dy.toFixed(2)}px)` : '';
    };
    return d;
  },
};
// a real image placed by its centre at 1:1 or smaller (never enlarged), in 2.5D, with an optional light sweep
class Still {
  constructor(src, w, h, { z = 4, shadow = 'drop-shadow(0 40px 46px rgba(20,24,60,0.28))', radius = 0, sheen = false } = {}) {
    this.w = w; this.h = h;
    this.el = document.createElement('div');
    Object.assign(this.el.style, { position: 'absolute', left: '0px', top: '0px', width: w + 'px', height: h + 'px', zIndex: z, transformOrigin: '50% 50%' });
    const im = mkImg(src, 'abs');
    Object.assign(im.style, { left: '0px', top: '0px', width: '100%', height: '100%', filter: shadow });
    this.el.appendChild(im);
    if (sheen) {
      this.sheen = document.createElement('div');
      Object.assign(this.sheen.style, { position: 'absolute', inset: '0', borderRadius: radius + 'px', overflow: 'hidden', pointerEvents: 'none', mixBlendMode: 'soft-light' });
      this.el.appendChild(this.sheen);
    }
    $('#text').appendChild(this.el);
  }
  set({ x = 540, y = 960, s = 1, rx = 0, ry = 0, rz = 0, o = 1, vis = true, sheen = null }) {
    const st = this.el.style;
    if (!vis || o < 0.002) { st.display = 'none'; return this; }
    st.display = '';
    st.transform = `translate(${(x - this.w / 2).toFixed(2)}px, ${(y - this.h / 2).toFixed(2)}px) perspective(1800px) rotateX(${rx.toFixed(3)}deg) rotateY(${ry.toFixed(3)}deg) rotateZ(${rz.toFixed(3)}deg) scale(${Math.min(1, s).toFixed(4)})`;
    st.opacity = o >= 0.999 ? '' : o.toFixed(3);
    if (this.sheen) this.sheen.style.background = sheen != null && sheen > 0 && sheen < 1
      ? `linear-gradient(110deg, transparent ${(sheen * 150 - 45).toFixed(1)}%, rgba(255,255,255,0.85) ${(sheen * 150 - 25).toFixed(1)}%, transparent ${(sheen * 150 - 5).toFixed(1)}%)` : 'none';
    return this;
  }
}
