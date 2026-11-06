// The how-to series in real 3D: the same tutorial data as src/howto.js (steps, screens, flow, scrolls,
// highlights, lifts, notes, pointer path, taps) on a titanium phone with a glass cover, in the white studio.
// - the screen is composed every frame on a 920 × 2000 canvas from the real screenshots, with the app's own
//   transitions (tab fade, iOS push, sheet slide-up, in-place swap), page scrolls, the highlight (dim + the
//   brand-gradient ring) and tap ripples;
// - a lifted piece of UI becomes a Liquid Glass tile carrying that piece, rising off the screen;
// - the pointer is a glass fingertip; notes are glass pills; the step card is a glass slab under the DOM copy;
// - the intro opens on the 3D INCPT mark.
'use strict';

function howto3d(C) {
  DURATION = C.duration;
  META = { drop: 3.0, end: C.outT, bpm: 90, musicEdit: `assets/music/${window.REEL}_edit.json`, sfxGain: 0.45, sfxOnly: ['whoosh', 'tap', 'tick'] };
  const OUT_T = C.outT, SO = () => MANIFEST.phone.screenOffset;
  const KX = 2.78 / 920;                                   // screen px -> phone units
  const GRAD = ['#a4c34f', '#87b87d', '#6fafa3', '#5ba7c4', '#729dca', '#8494cf', '#968cd3'];
  const grad = (g, x0, y0, x1, y1) => { const gr = g.createLinearGradient(x0, y0, x1, y1); GRAD.forEach((c, i) => gr.addColorStop(i / (GRAD.length - 1), c)); return gr; };
  const rr = (g, x, y, w, h, r) => { g.beginPath(); g.roundRect(x, y, w, h, r); };

  // ---- intro (0 – 3): the 3D mark, the chip and the title (DOM over WebGL)
  scene({
    init() {
      K3.init({ camZ: 24, envOpts: { cool: 2.2, front: 0.9 }, keyPos: [-3, 12, 8], keyI: 1.8, fillI: 0.25, shadowOpacity: 0.07, backdropZ: -1.6 });
      this.mark = K3.add(makeLogoMark());
      this.chip = document.createElement('div');
      this.chip.className = 'tu-chip';
      this.chip.textContent = 'ИНСТРУКЦИЯ';
      Object.assign(this.chip.style, { position: 'absolute', left: '50%', top: '800px', fontSize: '30px' });
      $('#text').appendChild(this.chip);
      const lines = C.title.split('\n').length;
      this.h = new Headline(C.title, { y: 880, size: 124, fit: 980 });
      this.s = new Headline(C.sub, { y: 880 + lines * 136 + 24, size: 46, color: '#1d2744', cls: 'sub', fit: 940 });
      Object.assign(this.s.el.style, { fontFamily: "'Inter Variable', sans-serif", fontVariationSettings: "'opsz' 32", fontWeight: '600', letterSpacing: '-0.01em' });
      cue(0.0, 'whoosh', { dur: 0.9, gain: 0.3, up: true });
      cue(2.62, 'whoosh', { dur: 0.7, gain: 0.3, up: true });
    },
    update(t) {
      const pin = oX(prog(t, 0.0, 1.1)), out = Ease.inCubic(prog(t, 2.5, 3.0));
      const P = K3.L(540, 540 - out * 420, 2);
      K3.pose(this.mark, { x: P.x, y: P.y, z: 2, rx: 6, ry: lerp(-120, 0, pin) + Math.sin(t * 1.1) * 10, rz: 0, s: lerp(0.4, 1.25, pin) * (1 - out * 0.4), vis: t < 3.05 });
      const pc = oX(prog(t, 0.45, 1.1));
      Object.assign(this.chip.style, { display: t < 3.05 ? '' : 'none', opacity: (clamp((t - 0.45) * 5) * (1 - out)).toFixed(3),
        transform: `translate(-50%, ${((1 - pc) * 30 - out * 200).toFixed(1)}px)` });
      this.h.at(t, 0.6, 2.55, { stagger: 0.1, dur: 0.7 });
      this.s.at(t, 1.2, 2.6, { stagger: 0.03, dur: 0.7, dy: 0.6, blur: 8 });
    },
  });

  // ---- the walkthrough
  scene({
    init() {
      const R = MANIFEST.reel, HY = R.headerY;
      this.card = new HtCard(C.steps, OUT_T);
      // the step card's glass (the DOM card: 960 × 402 at 60, 150)
      const CU = K3.L(0, 0, 2).u;
      this.cardGlass = K3.add(makeGlass(960 * CU, 402 * CU, { depth: 0.22, radius: 54 * CU, px: 120, frost: 0.72 }));
      // screen compositor
      this.scr = screenCanvas();
      this.phone = K3.add(makePhone(this.scr.tex));
      const im = src => mkImg(src);
      const groupOf = def => {
        const g = { def, imgs: {} };
        const fill = d => {
          if (d.img) g.base = im(R.screens[d.img] || `app/${d.img}.jpg`);
          if (d.page) {
            const P = R.pages[d.page];
            g.page = { img: im(P.src), h: P.h };
            g.fixed = [];
            if (d.bar) g.fixed.push({ img: im(R.overlays[d.bar].src), y: R.overlays[d.bar].y, h: R.overlays[d.bar].h });
            g.fixed.push({ img: im(R.overlays.corners.src), y: R.overlays.corners.y, h: R.overlays.corners.h });
            const hk = d.hdr === 'back' ? 'hdr_back' : 'hdr_close';
            g.hdr = { img: im(R.overlays[hk].src), h: R.overlays[hk].h };
          }
        };
        if (def.sheet) { fill(def.base); const SH = R.sheets[def.sheet]; g.sheet = { img: im(SH.src), y: SH.y, h: SH.h, dim: SH.dim }; }
        else fill(def);
        g.slots = [];
        return g;
      };
      this.G = {};
      for (const [k, def] of Object.entries(C.screens)) this.G[k] = groupOf(def);
      // lifts: a glass tile carrying the piece; its empty slot is patched on the screen
      this.L = (C.lifts || []).map(l => {
        const c = MANIFEST.cutouts[l.cut], [bx, by, bw, bh] = c.box;
        const st = { alt: 0 };
        const a = im(c.src), b = l.alt ? im(MANIFEST.cutouts[l.alt].src) : null;
        const tile = makeGlass(bw * KX, bh * KX, { depth: 0.12, radius: Math.max(0.02, (c.r || 30) * KX), px: 1 / KX, frost: 0, content: (g, w, h) => {
          g.globalAlpha = 1; g.drawImage(a, c.pad, c.pad, bw, bh, 0, 0, w, h);
          if (b && st.alt > 0.001) { g.globalAlpha = st.alt; g.drawImage(b, c.pad, c.pad, bw, bh, 0, 0, w, h); g.globalAlpha = 1; }
        } });
        this.phone.add(tile);
        const groups = l.groups || [l.group];
        if (l.slot) for (const gk of groups) { const S = MANIFEST.slots[l.slot]; this.G[gk].slots.push({ img: im(S.src), x: S.x, y: S.y + this.scrollAt(gk, l.t0), w: S.w, h: S.h, lift: l }); }
        return { ...l, tile, st, home: [bx + bw / 2, by + bh / 2], groups };
      });
      // notes: glass pills
      this.N = (C.notes || []).map(n => {
        const pill = makeGlass(1.5, 0.36, { depth: 0.1, radius: 0.18, px: 520, frost: 0.85, content: (g, w, h) => {
          g.fillStyle = '#132440'; g.font = `600 ${0.4 * h}px "Inter Variable"`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(n.text, w / 2, 0.53 * h);
        } });
        this.phone.add(pill);
        return { ...n, pill };
      });
      // the pointer: a glass fingertip with the brand gradient on its rim
      this.ptr = makeGlass(0.34, 0.34, { depth: 0.14, radius: 0.17, px: 600, frost: 0.35, content: (g, w, h) => {
        g.lineWidth = 0.09 * w; g.strokeStyle = grad(g, 0, 0, w, h); g.beginPath(); g.arc(w / 2, h / 2, w / 2 - 0.06 * w, 0, 7); g.stroke();
      } });
      this.phone.add(this.ptr);
      // the pointer path helpers (phone-local px, as in howto.js)
      const so = SO(), c = (n, dx = 0, dy = 0) => { const r = R.rects[n]; return [so[0] + r[0] + r[2] / 2 + dx, so[1] + r[1] + r[3] / 2 + dy]; };
      const H = {
        at: (t, n, dx = 0, dy = 0, z = 30, dur = 0.9) => [t, ...c(n, dx, dy), z, dur],
        xy: (t, x, y, z = 30, dur = 0.9) => [t, x, y, z, dur],
        onLift: (t, cutName, n, dx = 0, dy = 0, dur = 0.9) => {
          const l = C.lifts.find(q => q.cut === cutName), cb = MANIFEST.cutouts[cutName].box;
          const P = [so[0] + cb[0] + cb[2] / 2, so[1] + cb[1] + cb[3] / 2], Q = c(n, dx, dy), s = l.to.s || 1;
          return [t, P[0] + (Q[0] - P[0]) * s + (l.to.x || 0), P[1] + (Q[1] - P[1]) * s + (l.to.y || 0), (l.to.z || 0) + 20, dur];
        },
      };
      this.path = C.path(H);
      this.taps = C.taps || [];
      this.presses = C.presses || [];
      cue(3.0, 'whoosh', { dur: 0.7, gain: 0.3, up: true });
      C.steps.forEach((st, i) => { if (i) cue(st.t, 'whoosh', { dur: 0.5, gain: 0.14 }); cue(st.t + 0.12, 'tick', { gain: 0.3 }); });
      this.taps.forEach(tt => cue(tt, 'tap', { gain: 0.5 }));
      C.flow.forEach(([t, , kind]) => {
        if (kind === 'push') cue(t + 0.02, 'whoosh', { dur: 0.45, gain: 0.25, pan: -0.5 });
        if (kind === 'sheet') cue(t + 0.02, 'whoosh', { dur: 0.5, gain: 0.25, up: true });
      });
      this.L.forEach(l => cue(l.t0 - 0.05, 'whoosh', { dur: 0.6, gain: 0.12 }));
      (C.spot || []).forEach(([t, n], i) => { if (n && i && C.spot[i - 1][1]) cue(t, 'tick', { gain: 0.16 }); });
      (C.sfx || []).filter(s => ['whoosh', 'tap', 'tick'].includes(s[1])).forEach(s => cue(...s));
      this.HY = HY;
    },
    scrollAt(gk, t) {
      const K = (C.scroll || {})[gk];
      if (!K) return 0;
      if (t <= K[0][0]) return K[0][1];
      for (let i = 1; i < K.length; i++) if (t <= K[i][0]) return lerp(K[i - 1][1], K[i][1], Ease.inOutCubic(prog(t, K[i - 1][0], K[i][0])));
      return K[K.length - 1][1];
    },
    // one screen group on the canvas: body (scroll, slide, shade, sheet) and header (fade)
    drawGroup(g, gk, t, st) {
      const X = this.scr.g, HY = this.HY;
      X.save(); X.globalAlpha = st.alpha;
      X.save(); X.beginPath(); X.rect(0, HY, 920, 2000 - HY); X.clip(); X.translate(st.tx, 0);
      const sc = g.page ? this.scrollAt(gk, t) : 0;
      if (g.base) X.drawImage(g.base, 0, 0, 920, 2000);
      if (g.page) X.drawImage(g.page.img, 0, -sc, 920, g.page.h);
      for (const s of g.slots) if (s.o > 0.002) { X.globalAlpha = st.alpha * s.o; X.drawImage(s.img, s.x, s.y - sc, s.w, s.h); X.globalAlpha = st.alpha; }
      if (g.fixed) for (const f of g.fixed) X.drawImage(f.img, 0, f.y, 920, f.h);
      if (g.sheet) {
        if (st.dim > 0.001) { X.fillStyle = `rgba(0,0,0,${st.dim.toFixed(3)})`; X.fillRect(0, 0, 920, 2000); }
        X.drawImage(g.sheet.img, 0, g.sheet.y + st.sheetY, 920, g.sheet.h);
      }
      if (st.shade > 0.001) { X.fillStyle = `rgba(0,0,0,${st.shade.toFixed(3)})`; X.fillRect(0, 0, 920, 2000); }
      X.restore();
      X.save(); X.beginPath(); X.rect(0, 0, 920, HY); X.clip(); X.globalAlpha = st.alpha * st.hdr;
      if (g.base) X.drawImage(g.base, 0, 0, 920, 2000);
      if (g.hdr) X.drawImage(g.hdr.img, 0, 0, 920, g.hdr.h);
      if (g.sheet && st.dim > 0.001) { X.fillStyle = `rgba(0,0,0,${st.dim.toFixed(3)})`; X.fillRect(0, 0, 920, HY); }
      X.restore();
      X.restore();
    },
    // phone-local px (+ z px above the screen) -> the phone group's units
    loc(x, y, z = 0) { const so = SO(); return { x: (x - so[0] - 460) * KX, y: (1000 - (y - so[1])) * KX, z: 0.16 + 0.004 + z * KX }; },
    update(t) {
      this.card.at(t);
      // the card's glass follows the DOM card's slide
      const cpin = oX(prog(t, 2.85, 3.75)), cpout = Ease.inCubic(prog(t, OUT_T - 0.15, OUT_T + 0.4));
      const CG = K3.L(540, 351 + (1 - cpin) * -420 - cpout * 420, 2);
      K3.pose(this.cardGlass, { x: CG.x, y: CG.y, z: 2, vis: t > 2.85 && t < OUT_T + 0.45 });
      const on = vis(t, 2.4, OUT_T + 0.8);
      const pin = oX(prog(t, 2.55, 3.6)), pout = Ease.inCubic(prog(t, OUT_T - 0.1, OUT_T + 0.5));
      const PP = K3.L(540 - pout * 900, 1140 + (1 - pin) * 1500, 0);
      K3.pose(this.phone, { x: PP.x, y: PP.y, z: 0, rx: (1 - pin) * 24 + Math.sin(t * 0.4) * 1.5, ry: Math.sin(t * 0.3 + 1) * 5 - pout * 25, rz: (1 - pin) * -3, s: 1, vis: on });
      K3.cam.position.set(0, 0, 24 - 0.6 * prog(t, 3, OUT_T));
      K3.cam.lookAt(0, 0, 0);
      if (!on) { K3.render(); return; }
      // ---- the screen flow (as howto.js)
      const F = C.flow, X = this.scr.g;
      let ci = 0;
      F.forEach((f, i) => { if (t >= f[0]) ci = i; });
      const [t0, k, kind = 'cut', dur] = F[ci];
      const p = prog(t, t0, t0 + (dur ?? (kind === 'push' ? 0.55 : kind === 'sheet' ? 0.6 : 0.35)));
      const st0 = () => ({ alpha: 1, tx: 0, hdr: 1, shade: 0, dim: 0, sheetY: 0 });
      // slot patches (empty places of lifted pieces)
      this.L.forEach(l => { const so_ = t < l.t0 ? 0 : Math.min((t - l.t0) * 10, l.t1 == null ? 1 : 1 - Ease.inOutCubic(prog(t, l.t1, l.t1 + 0.5))); for (const gk of l.groups) for (const s of this.G[gk].slots) if (s.lift === l) s.o = so_; });
      X.fillStyle = '#fff'; X.fillRect(0, 0, 920, 2000);
      const cur = this.G[k], cs = st0();
      if (cur.sheet) { const ps = kind === 'sheet' ? p : 1; cs.dim = cur.sheet.dim * Ease.outCubic(prog(ps, 0, 0.6)); cs.sheetY = (1 - oX(ps)) * 1220; }
      if (ci > 0 && p < 1) {
        const pk = F[ci - 1][1], pg = this.G[pk], ps = st0();
        if (pg.sheet) ps.dim = pg.sheet.dim;
        if (kind === 'fade' || kind === 'swap') { this.drawGroup(pg, pk, t, ps); cs.alpha = Ease.outCubic(p); }
        if (kind === 'push') { const e = Ease.inOutCubic(p); ps.tx = -276 * e; ps.shade = 0.18 * e; this.drawGroup(pg, pk, t, ps); cs.tx = 920 * (1 - e); cs.hdr = e; }
      }
      this.drawGroup(cur, k, t, cs);
      // ---- the highlight: dim around the target, the brand-gradient ring settling onto it
      this.spotAt(t, C.spot || []);
      // ---- tap ripples on the glass (under the fingertip)
      const ptrP = this.pointerAt(t);
      const so = SO();
      for (const tp of this.taps.concat(this.presses.map(q => q[0]))) {
        for (let i = 0; i < 2; i++) {
          const a = tp + i * 0.12, q = prog(t, a, a + 0.75);
          if (q <= 0 || q >= 1) continue;
          const r = lerp(20, 150 - i * 25, Ease.outCubic(q));
          X.globalAlpha = 1 - Ease.inCubic(q); X.lineWidth = 7; X.strokeStyle = grad(X, ptrP[0] - so[0] - r, 0, ptrP[0] - so[0] + r, 0);
          X.beginPath(); X.arc(ptrP[0] - so[0], ptrP[1] - so[1], r, 0, 7); X.stroke(); X.globalAlpha = 1;
        }
      }
      this.scr.tex.needsUpdate = true;
      // ---- lifts: glass tiles off the screen
      this.L.forEach(l => {
        const pl = Ease.outExpo(prog(t, l.t0, l.t0 + (l.dur || 0.9))), pb = l.t1 == null ? 0 : Ease.inOutCubic(prog(t, l.t1, l.t1 + 0.5));
        const e = pl * (1 - pb), to = l.to, so_ = SO();
        const P = this.loc(so_[0] + l.home[0] + (to.x || 0) * e, so_[1] + l.home[1] + (to.y || 0) * e, (to.z || 0) * e + 6);
        const shown = t > l.t0 - 0.01 && (l.t1 == null || t < l.t1 + 0.52) && l.groups.includes(k);
        K3.pose(l.tile, { x: P.x, y: P.y, z: P.z, rx: (to.rx || 0) * e, ry: (to.ry || 0) * e, rz: (to.rz || 0) * e, s: lerp(1, to.s || 1, e), vis: shown });
        if (l.alt) {
          let a = 0; for (const [ta, v] of l.altKeys) if (t >= ta) a = v;
          const last = [...l.altKeys].reverse().find(([ta]) => t >= ta);
          const prevV = last ? (l.altKeys[l.altKeys.indexOf(last) - 1] || [0, 0])[1] : 0;
          const ea = last ? Ease.outCubic(prog(t, last[0], last[0] + 0.3)) : 1, v = Math.round(lerp(prevV, a, ea) * 20) / 20;
          if (v !== l.st.alt) { l.st.alt = v; l.tile.print.material.map.redraw(); }
        }
      });
      // ---- notes
      this.N.forEach(n => {
        const r = MANIFEST.reel.rects[n.rect], pe = oX(prog(t, n.t0, n.t0 + 0.5)), q = Ease.inCubic(prog(t, n.t1, n.t1 + 0.3));
        const P = this.loc(so[0] + r[0] + r[2] / 2 + (n.dx || 0), so[1] + r[1] + r[3] / 2 + (n.dy || 0) - (1 - pe) * 30, n.z || 260);
        K3.pose(n.pill, { x: P.x, y: P.y, z: P.z, s: lerp(0.8, 1, pe) * (1 - q * 0.3), vis: t > n.t0 && t < n.t1 + 0.3 && q < 0.95 });
      });
      // ---- the fingertip
      const pv = t > (C.ptrIn || 4.0) && t < OUT_T + 0.2;
      const Pp = this.loc(ptrP[0], ptrP[1], ptrP[2] + 18);
      K3.pose(this.ptr, { x: Pp.x, y: Pp.y, z: Pp.z, s: ptrP[3] * oX(prog(t, C.ptrIn || 4.0, (C.ptrIn || 4.0) + 0.5)), vis: pv });
      K3.render();
    },
    // the pointer's tip (phone-local px), its z and its press scale, as tutorial.js's Pointer
    pointerAt(t) {
      const path = this.path;
      let x = path[0][1], y = path[0][2], z = path[0][3] ?? 30;
      for (let i = 1; i < path.length; i++) {
        const [t1, x1, y1, z1 = 30] = path[i], dur = path[i][4] ?? 0.9;
        if (t >= t1 - dur) {
          const p = Ease.inOutCubic(prog(t, t1 - dur, t1));
          const pz = z1 >= z ? Ease.outCubic(prog(t, t1 - dur, t1 - dur * 0.65)) : Ease.inCubic(prog(t, t1 - dur * 0.3, t1));
          x = lerp(x, x1, p); y = lerp(y, y1, p); z = lerp(z, z1, pz);
        }
      }
      let held = 0;
      for (const [a, b] of this.presses) held = Math.max(held, Math.min(Ease.outCubic(prog(t, a - 0.18, a)), 1 - Ease.outCubic(prog(t, b, b + 0.3))));
      x += Math.sin(t * 1.3) * 5 * (1 - held); y += Math.cos(t * 1.1) * 6 * (1 - held);
      let s = lerp(1, 0.84, held), zz = z * (1 - held * 0.8);
      for (const tp of this.taps) if (t > tp - 0.18 && t < tp + 0.35) {
        const d = t < tp ? Ease.outCubic(prog(t, tp - 0.18, tp)) : 1 - Ease.outCubic(prog(t, tp, tp + 0.35));
        s = lerp(1, 0.84, d); zz = z * (1 - d * 0.85);
      }
      return [x, y, zz, s];
    },
    spotAt(t, keys) {
      const RS = MANIFEST.reel.rects, X = this.scr.g;
      let a = null;
      for (const kk of keys) if (t >= kk[0]) a = kk;
      if (!a) return;
      const i0 = keys.indexOf(a), RA = a[1] ? RS[a[1]] : null, prev = i0 > 0 && keys[i0 - 1][1] ? RS[keys[i0 - 1][1]] : null;
      const p = Ease.inOutCubic(prog(t, a[0], a[0] + 0.55));
      let rect = RA, o = RA ? 1 : 0;
      if (RA && prev) rect = RA.map((v, k) => lerp(prev[k], v, p));
      else if (RA) o = p;
      else if (prev) { rect = prev; o = 1 - p; }
      if (!rect || o < 0.002) return;
      const [x, y, w, h, r] = rect, grow = RA && !prev ? lerp(26, 0, Ease.outExpo(p)) : 0, m = 13 + grow;
      X.save();
      X.fillStyle = `rgba(12,18,48,${(0.4 * o).toFixed(3)})`;
      X.beginPath(); X.rect(0, 0, 920, 2000); X.roundRect(x, y, w, h, r); X.fill('evenodd');
      X.globalAlpha = o; X.lineWidth = 9; X.strokeStyle = grad(X, x - m, y - m, x + w + m, y + h + m);
      rr(X, x - m + 4.5, y - m + 4.5, w + 2 * m - 9, h + 2 * m - 9, r + m - 4.5); X.stroke();
      X.restore();
    },
  });

  endCard(OUT_T, C.tagline, DURATION, 0.55);
}
