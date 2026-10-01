// Tutorial toolkit shared by every INCPT how-to: the logo-foil highlight ring with a spotlight dim,
// rings for lifted cut-outs, and the pointer (an arrowhead with the logo boomerang's concave back)
// that glides between targets, presses and sends out foil ripples.
// Targets are named rects from the reel's manifest (MANIFEST.reel.rects, 920x2000 screen px).
'use strict';

const TU_FOIL = 'conic-gradient(from VAR, #5fd3c0, #5aa9f2, #8a8bf1, #bf8cf3, #e59ad8, #5fd3c0)';
const tuFoil = a => TU_FOIL.replace('VAR', a.toFixed(1) + 'deg');

// ------------------------------------------------------------------ highlight (foil ring + spotlight)
class Spot {
  constructor(parent) {
    this.hole = document.createElement('div');
    this.hole.className = 'tu-hole';
    this.ring = document.createElement('div');
    this.ring.className = 'tu-ring';
    parent.appendChild(this.hole);
    parent.appendChild(this.ring);
  }
  // keys: [[t, rectName | null], ...] — the ring morphs between targets, fades when null
  at(t, keys, dimMax = 0.4) {
    const RS = MANIFEST.reel.rects;
    let a = null, p = 1;
    for (let i = 0; i < keys.length; i++) {
      if (t >= keys[i][0]) a = keys[i];
    }
    if (!a) a = [0, null];
    const DUR = 0.55;
    const RA = a[1] ? RS[a[1]] : null;
    let rect = RA, o = RA ? 1 : 0;
    // morph from the previous target to this one over DUR after it starts
    const i0 = keys.indexOf(a);
    const prev = i0 > 0 && keys[i0 - 1][1] ? RS[keys[i0 - 1][1]] : null;
    p = Ease.inOutCubic(prog(t, a[0], a[0] + DUR));
    if (RA && prev) rect = RA.map((v, k) => lerp(prev[k], v, p));
    else if (RA) o = p;                                   // appear
    else if (prev) { rect = prev; o = 1 - p; }            // fade out on the last target
    if (!rect || o < 0.002) { this.hole.style.display = this.ring.style.display = 'none'; return; }
    const [x, y, w, h, r] = rect;
    const grow = RA && !prev ? lerp(26, 0, Ease.outExpo(p)) : 0;    // the ring settles onto the element
    Object.assign(this.hole.style, { display: '', left: x + 'px', top: y + 'px', width: w + 'px', height: h + 'px', borderRadius: r + 'px',
      boxShadow: `0 0 0 3000px rgba(12, 18, 48, ${(dimMax * o).toFixed(3)})` });
    const m = 13 + grow;
    Object.assign(this.ring.style, { display: '', left: x - m + 'px', top: y - m + 'px', width: w + 2 * m + 'px', height: h + 2 * m + 'px',
      borderRadius: r + m + 'px', opacity: o.toFixed(3), background: tuFoil(t * 60) });
  }
}

// ring drawn around a lifted cut-out (lives inside the cut-out's node)
function liftRing(cut) {
  const c = cut.meta, m = 13;
  const d = document.createElement('div');
  d.className = 'tu-ring';
  Object.assign(d.style, { left: c.pad - m + 'px', top: c.pad - m + 'px', width: c.box[2] + 2 * m + 'px', height: c.box[3] + 2 * m + 'px', borderRadius: c.r + m + 'px' });
  cut.el.appendChild(d);
  return d;
}

// ------------------------------------------------------------------ pointer
// An arrowhead with the INCPT boomerang's concave back, filled with the logo's foil and
// outlined in white; the tip is the hotspot (top-left of the 120-unit box, at 10,10).
const PTR_SVG = `<svg viewBox="0 0 120 120" width="100%" height="100%" style="overflow:visible">
  <defs><linearGradient id="pf" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#6fe0cc"/><stop offset="0.35" stop-color="#63b3f5"/>
    <stop offset="0.7" stop-color="#8f8ef3"/><stop offset="1" stop-color="#c996f2"/></linearGradient>
  <linearGradient id="ps" x1="0" y1="0" x2="1" y2="0.4"><stop offset="0" stop-color="#fff" stop-opacity="0"/>
    <stop offset="0.5" stop-color="#fff" stop-opacity="0.75"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>
  <path d="M10 10 L108 50 Q62 60 50 108 Z" fill="url(#pf)" stroke="#fff" stroke-width="7" stroke-linejoin="round"/>
  <path class="sheen" d="M10 10 L108 50 Q62 60 50 108 Z" fill="url(#ps)" opacity="0.8"/>
</svg>`;
class Pointer {
  // S: size in phone-local px (150 -> ~70 px on screen at the 1:1 tutorial's phone scale)
  constructor(parent, S = 150) {
    this.body = new Node(parent, { w: S, h: S, ax: 10 / 120, ay: 10 / 120, flat: true });
    this.body.el.innerHTML = PTR_SVG;
    this.svg = this.body.el.firstChild;
    this.svg.style.filter = 'drop-shadow(0 10px 14px rgba(22, 48, 104, 0.38)) drop-shadow(0 2px 3px rgba(22, 48, 104, 0.25))';
    this.grad = this.svg.querySelector('#ps');
    this.rips = [0, 1].map(() => {
      const n = new Node(parent, { w: 260 * S / 150, h: 260 * S / 150, flat: true });
      n.el.innerHTML = '<div class="tu-disc"></div><div class="tu-rip"></div>';
      n.rip = n.el.lastChild;
      n.disc = n.el.firstChild;
      return n;
    });
  }
  // path: [[t, x, y, z, dur], ...] phone-local tip positions (glides with ease in/out); taps: [t, ...]
  // presses: [[t0, t1], ...] held presses (drags) — the pointer stays pressed in between
  at(t, path, taps, vis = true, presses = []) {
    let x = path[0][1], y = path[0][2], z = path[0][3] ?? 30, mv = 0;
    for (let i = 1; i < path.length; i++) {
      const [t1, x1, y1, z1 = 30] = path[i];
      const dur = path[i][4] ?? 0.9;
      if (t >= t1 - dur) {
        const p = Ease.inOutCubic(prog(t, t1 - dur, t1));
        x = lerp(x, x1, p); y = lerp(y, y1, p); z = lerp(z, z1, p);
        if (p > 0 && p < 1) mv = Math.sin(p * Math.PI) * Math.sign(x1 - path[i - 1][1] || 1);
      }
    }
    // gentle hover while resting (stilled while a press is held)
    let held = 0;
    for (const [a, b] of presses) held = Math.max(held, Math.min(Ease.outCubic(prog(t, a - 0.18, a)), 1 - Ease.outCubic(prog(t, b, b + 0.3))));
    x += Math.sin(t * 1.3) * 5 * (1 - held); y += Math.cos(t * 1.1) * 6 * (1 - held);
    let s = lerp(1, 0.84, held);
    for (const tp of taps) {
      if (t > tp - 0.18 && t < tp + 0.35) s = t < tp ? lerp(1, 0.84, Ease.outCubic(prog(t, tp - 0.18, tp))) : lerp(0.84, 1, Ease.outCubic(prog(t, tp, tp + 0.35)));
    }
    const rot = mv * 10 * (1 - held);
    this.body.set({ vis, x, y, z: z + 12, rz: rot, s });
    this.grad.setAttribute('gradientTransform', `translate(${(Math.sin(t * 0.9) * 0.5).toFixed(3)} 0)`);
    // ripples: foil rings expanding from the tip (on taps and when a press starts)
    const starts = taps.concat(presses.map(p => p[0]));
    this.rips.forEach((r, i) => {
      let best = null;
      for (const tp of starts) if (t >= tp + i * 0.12 && t < tp + i * 0.12 + 0.75) best = tp + i * 0.12;
      if (best === null || !vis) return r.set({ vis: false });
      const p = prog(t, best, best + 0.75);
      r.rip.style.background = tuFoil(t * 90 + i * 60);
      r.disc.style.opacity = (i === 0 ? 1 - Ease.outCubic(p) : 0).toFixed(3);
      r.set({ vis: true, x, y, z: z + 2, s: lerp(0.25, 1.25 - i * 0.2, Ease.outCubic(p)), o: 1 - Ease.inCubic(p) });
    });
  }
}
