// How-to engine for the 9:16 tutorial series on the new interface. A tutorial is one howto({...})
// call: the copy (steps with plain-language beats), the screens it walks through and how they
// change (tab fade, iOS push, sheet slide-up, in-place swap), page scrolls, highlights, lifted
// pieces, the pointer path and taps. Pointer / ring / ripples come from src/tutorial.js; the
// screens are the cleaned team screenshots (assets/app) and tools/build_howto.py's overlays.
'use strict';

const HT_PH = { y: 180, s: 0.53 };          // phone under the step card (stage centre + 180 px)

// ------------------------------------------------------------------ step card (top of the frame)
class HtCard {
  constructor(steps, outT) {
    this.S = steps; this.outT = outT;
    this.el = document.createElement('div');
    this.el.className = 'tr-panel';
    this.el.innerHTML = `<div class="tr-top"><div class="tu-chip"></div><div class="tu-prog">${steps.map(() => '<div class="tu-seg"><i></i></div>').join('')}</div></div><div class="ht-body"></div>`;
    $('#text').appendChild(this.el);
    this.chip = this.el.querySelector('.tu-chip');
    this.segs = [...this.el.querySelectorAll('.tu-seg i')];
    const body = this.el.querySelector('.ht-body');
    this.beats = [];
    this.steps = steps.map((st, i) => {
      const d = document.createElement('div');
      d.className = 'ht-step';
      d.innerHTML = `<div class="tu-head ht-head"><span class="l">${st.head.split(' ').map(w => `<span class="w">${w}</span>`).join('')}</span></div>`;
      body.appendChild(d);
      const descs = typeof st.desc === 'string' ? [[st.t, st.desc]] : st.desc;
      descs.forEach(([t, html], k) => {
        const e = document.createElement('div');
        e.className = 'ht-desc';
        e.innerHTML = html;
        d.appendChild(e);
        this.beats.push({ el: e, t, first: k === 0, step: i });
      });
      return { el: d, head: d.querySelector('.ht-head'), words: [...d.querySelectorAll('.w')] };
    });
    this.beats.forEach((b, j) => { const n = this.beats[j + 1]; b.tout = n ? n.t - 0.3 : outT + 2; });
  }
  fit() {
    this.fitted = true;
    for (const s of this.steps) {
      const w = s.head.querySelector('.l').offsetWidth;
      if (w > 872) s.head.style.fontSize = 84 * 872 / w + 'px';
    }
  }
  at(t) {
    if (!this.fitted) this.fit();
    const pin = oX(prog(t, 2.85, 3.75)), pout = Ease.inCubic(prog(t, this.outT - 0.15, this.outT + 0.4));
    const o = clamp((t - 2.85) * 5) * (1 - pout);
    this.el.style.display = o > 0.002 ? '' : 'none';
    if (o <= 0.002) return;
    this.el.style.transform = `translateY(${((1 - pin) * -420 - pout * 420).toFixed(1)}px)`;
    this.el.style.opacity = o.toFixed(3);
    let cur = 0;
    this.S.forEach((st, i) => { if (t >= st.t - 0.05) cur = i; });
    this.chip.textContent = `ШАГ ${cur + 1} ИЗ ${this.S.length}`;
    this.segs.forEach((sg, i) => {
      const f = i < cur ? 1 : i > cur ? 0 : Ease.outCubic(prog(t, this.S[i].t + 0.1, this.S[i].t + 0.8));
      sg.style.transform = `scaleX(${f.toFixed(4)})`;
    });
    this.steps.forEach((s, i) => {
      const tin = this.S[i].t + (i === 0 ? 0.55 : 0.25), tout = i + 1 < this.S.length ? this.S[i + 1].t - 0.35 : this.outT + 2;
      let any = false;
      s.words.forEach((w, k) => {
        const p = prog(t, tin + k * 0.09, tin + k * 0.09 + 0.7), e = oX(p);
        const q = Ease.inCubic(prog(t, tout + k * 0.03, tout + k * 0.03 + 0.28));
        const op = clamp(p * 3) * (1 - q);
        if (op > 0.002) any = true;
        w.style.opacity = op.toFixed(3);
        w.style.transform = `translateY(${((1 - e) * 0.42 - q * 0.3).toFixed(4)}em)`;
        w.style.filter = (1 - e) * 14 + q * 10 > 0.1 ? `blur(${((1 - e) * 14 + q * 10).toFixed(2)}px)` : '';
      });
      s.head.style.display = any ? '' : 'none';
    });
    this.beats.forEach(b => {
      const tin = b.t + (b.first ? (b.step === 0 ? 0.85 : 0.55) : 0.2);
      const pd = prog(t, tin, tin + 0.75), ed = oX(pd), qd = Ease.inCubic(prog(t, b.tout, b.tout + 0.28));
      const op = clamp(pd * 2) * (1 - qd);
      b.el.style.display = op > 0.002 ? '' : 'none';
      b.el.style.opacity = op.toFixed(3);
      b.el.style.transform = `translateY(${((1 - ed) * 26 - qd * 14).toFixed(2)}px)`;
      b.el.style.filter = (1 - ed) * 8 + qd * 6 > 0.1 ? `blur(${((1 - ed) * 8 + qd * 6).toFixed(2)}px)` : '';
    });
  }
}

// ------------------------------------------------------------------ screen groups inside the phone
// def: { img: 'receive_trc20' }                       a static screenshot
//      { page: 'page_wallet', hdr: 'close', bar: 'bar_wallet' }   a stitched page that can scroll
//      { sheet: 'sheet_receive', base: <def> }           a coin sheet over the dimmed base screen
function htGroup(sc, def) {
  const R = MANIFEST.reel, HY = R.headerY;
  const div = (parent, st) => { const d = document.createElement('div'); Object.assign(d.style, { position: 'absolute', left: '0px', top: '0px', width: '920px' }, st); parent.appendChild(d); return d; };
  const img = (src, parent, st) => { const im = mkImg(src, 'abs'); Object.assign(im.style, { left: '0px', top: '0px', width: '920px', height: '2000px' }, st); parent.appendChild(im); return im; };
  const g = { def, scroll: 0 };
  g.root = div(sc, { height: '2000px', display: 'none' });
  g.body = div(g.root, { top: HY + 'px', height: 2000 - HY + 'px', overflow: 'hidden' });
  g.inner = div(g.body, { top: -HY + 'px', height: '2000px' });
  g.fixed = div(g.body, { top: -HY + 'px', height: '2000px' });
  g.hdr = div(g.root, { height: HY + 'px', overflow: 'hidden' });
  const fill = d => {
    if (d.img) { img(R.screens[d.img] || `app/${d.img}.jpg`, g.inner); img(R.screens[d.img] || `app/${d.img}.jpg`, g.hdr); }
    if (d.page) {
      const P = R.pages[d.page];
      g.inner.style.height = P.h + 'px';
      img(P.src, g.inner, { height: P.h + 'px' });
      const ov = (k, parent) => img(R.overlays[k].src, parent, { top: R.overlays[k].y + 'px', height: R.overlays[k].h + 'px' });
      if (d.bar) ov(d.bar, g.fixed);
      ov('corners', g.fixed);
      ov(d.hdr === 'back' ? 'hdr_back' : 'hdr_close', g.hdr);
    }
  };
  if (def.sheet) {
    fill(def.base);
    const SH = R.sheets[def.sheet];
    g.dim = div(g.fixed, { height: '2000px', background: '#000', opacity: '0' });
    g.hdrDim = div(g.hdr, { height: HY + 'px', background: '#000', opacity: '0' });
    g.sheet = img(SH.src, g.fixed, { top: SH.y + 'px', height: SH.h + 'px' });
    g.sheetDim = SH.dim;
  } else fill(def);
  g.shade = div(g.fixed, { height: '2000px', background: '#000', opacity: '0' });
  return g;
}

// ------------------------------------------------------------------ the tutorial
function howto(C) {
  DURATION = C.duration;
  META = { drop: 3.0, end: C.outT, bpm: 80, music: 'calm', key: C.key || 0 };
  const OUT_T = C.outT;

  // ---- intro (0 – 3)
  scene({
    init() {
      this.logo = new LogoMark();
      this.chip = document.createElement('div');
      this.chip.className = 'tu-chip';
      this.chip.textContent = 'ИНСТРУКЦИЯ';
      Object.assign(this.chip.style, { position: 'absolute', left: '50%', top: '800px', fontSize: '30px' });
      $('#text').appendChild(this.chip);
      const lines = C.title.split('\n').length;
      this.h = new Headline(C.title, { y: 880, size: 124, fit: 980 });
      this.s = new Headline(C.sub, { y: 880 + lines * 112 + 24, size: 46, color: '#1d2744', cls: 'sub', fit: 940 });
      Object.assign(this.s.el.style, { fontFamily: "'Inter Variable', sans-serif", fontVariationSettings: "'opsz' 32", fontWeight: '600', letterSpacing: '-0.01em' });
      cue(0.0, 'whoosh', { dur: 0.9, gain: 0.3, up: true });
      cue(0.62, 'shimmer', { gain: 0.25 });
      cue(2.62, 'whoosh', { dur: 0.7, gain: 0.3, up: true });
    },
    update(t) {
      const pin = oX(prog(t, 0.05, 0.85)), out = Ease.inCubic(prog(t, 2.55, 3.0));
      this.logo.set({ x: 540, y: 600 - out * 320, h: lerp(70, 250, pin), ry: lerp(-150, -6, pin) + t * 4, rz: lerp(-30, -2, pin), o: clamp(t * 7) * (1 - out), blur: (1 - pin) * 10 + out * 8, sheen: vis(t, 0.8, 1.9) ? prog(t, 0.8, 1.9) : null, shadow: 0.5 });
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
      const R = MANIFEST.reel, so = MANIFEST.phone.screenOffset;
      this.card = new HtCard(C.steps, OUT_T);
      this.ph = new Phone($('#cam'), Object.keys(MANIFEST.screens)[0]);
      const sc = this.ph.screenEl;
      sc.innerHTML = '';
      this.G = {};
      for (const [k, def] of Object.entries(C.screens)) this.G[k] = htGroup(sc, def);
      this.spot = new Spot(sc);
      this.spot.hole.style.zIndex = this.spot.ring.style.zIndex = '10';   // above every screen group
      // lifted pieces: a slot in their group (page coordinates on scrolled pages), a ring on the piece
      this.L = (C.lifts || []).map(l => {
        const cut = new Cut(this.ph, l.cut);
        let alt = null;
        if (l.alt) { alt = mkImg(MANIFEST.cutouts[l.alt].src, 'fill'); alt.style.opacity = '0'; cut.el.insertBefore(alt, cut.el.children[1] || null); }
        const ring = l.ring === false ? null : liftRing(cut);
        const groups = l.groups || [l.group];
        const slots = !l.slot ? [] : groups.map(gk => {
          const S = MANIFEST.slots[l.slot], g = this.G[gk];
          const im = mkImg(S.src, 'abs');
          Object.assign(im.style, { left: S.x + 'px', top: S.y + this.scrollAt(gk, l.t0) + 'px', width: S.w + 'px', height: S.h + 'px', opacity: '0' });
          g.inner.appendChild(im);
          return im;
        });
        cut.set({ vis: false });
        return { ...l, n: cut, alt, ring, slots, groups };
      });
      // notes: small foil captions next to an action ("Адрес скопирован")
      this.N = (C.notes || []).map(n => {
        const node = new Node(this.ph, { w: 0, h: 0, flat: true });
        node.el.innerHTML = `<div class="tr-label" style="transform: translate(-50%, -50%)">${n.text}</div>`;
        node.set({ vis: false });
        return { ...n, node };
      });
      // pointer
      this.ptr = new Pointer(this.ph, 150);
      const c = (n, dx = 0, dy = 0) => { const r = R.rects[n]; return [so[0] + r[0] + r[2] / 2 + dx, so[1] + r[1] + r[3] / 2 + dy]; };
      const H = {
        at: (t, n, dx = 0, dy = 0, z = 30, dur = 0.9) => [t, ...c(n, dx, dy), z, dur],
        xy: (t, x, y, z = 30, dur = 0.9) => [t, x, y, z, dur],
        // a point of rect `n` on the lifted piece `cutName` (centre moves with the lift, the rest scales)
        onLift: (t, cutName, n, dx = 0, dy = 0, dur = 0.9) => {
          const l = C.lifts.find(q => q.cut === cutName), cb = MANIFEST.cutouts[cutName].box;
          const P = [so[0] + cb[0] + cb[2] / 2, so[1] + cb[1] + cb[3] / 2], Q = c(n, dx, dy), s = l.to.s || 1;
          return [t, P[0] + (Q[0] - P[0]) * s + (l.to.x || 0), P[1] + (Q[1] - P[1]) * s + (l.to.y || 0), (l.to.z || 0) + 20, dur];
        },
      };
      this.H = H;
      this.path = C.path(H);
      this.taps = C.taps || [];
      this.presses = C.presses || [];
      // sound: steps, taps, screen changes, lifts
      cue(3.0, 'whoosh', { dur: 0.7, gain: 0.3, up: true });
      C.steps.forEach((st, i) => { if (i) cue(st.t, 'whoosh', { dur: 0.5, gain: 0.14 }); cue(st.t + 0.12, 'tick', { gain: 0.3 }); });
      this.taps.forEach(tt => { cue(tt, 'tap', { gain: 0.5 }); cue(tt + 0.02, 'pop', { gain: 0.22, pitch: 1.2 }); });
      C.flow.forEach(([t, , kind]) => {
        if (kind === 'push') cue(t + 0.02, 'whoosh', { dur: 0.45, gain: 0.25, pan: -0.5 });
        if (kind === 'sheet') cue(t + 0.02, 'whoosh', { dur: 0.5, gain: 0.25, up: true });
      });
      this.L.forEach(l => { cue(l.t0, 'pop', { gain: 0.28, pitch: 0.9 }); cue(l.t0 - 0.05, 'whoosh', { dur: 0.6, gain: 0.08 }); });
      (C.spot || []).forEach(([t, n], i) => { if (n && i && C.spot[i - 1][1]) cue(t, 'tick', { gain: 0.16 }); });
      this.N.forEach(n => cue(n.t0, 'confirm', { gain: 0.3 }));
      (C.sfx || []).forEach(s => cue(...s));
    },
    scrollAt(gk, t) {
      const K = (C.scroll || {})[gk];
      if (!K) return 0;
      if (t <= K[0][0]) return K[0][1];
      for (let i = 1; i < K.length; i++) if (t <= K[i][0]) return lerp(K[i - 1][1], K[i][1], Ease.inOutCubic(prog(t, K[i - 1][0], K[i][0])));
      return K[K.length - 1][1];
    },
    update(t) {
      this.card.at(t);
      const on = vis(t, 2.4, OUT_T + 0.8);
      this.ph.set({ vis: on });
      if (!on) { this.ptr.at(t, this.path, this.taps, false); return; }
      CAM.s = kf(t, [[3.0, 1.0], [OUT_T, 1.03, lin]]);
      const pin = oX(prog(t, 2.55, 3.6)), pout = Ease.inCubic(prog(t, OUT_T - 0.1, OUT_T + 0.5));
      this.ph.set({
        x: -pout * 900, y: HT_PH.y + (1 - pin) * 1500, s: HT_PH.s,
        rx: (1 - pin) * 24 + Math.sin(t * 0.4) * 1.2, ry: Math.sin(t * 0.3 + 1) * 2 - pout * 20, rz: (1 - pin) * -3,
      });

      // ---- screen flow
      const F = C.flow;
      let ci = 0;
      F.forEach((f, i) => { if (t >= f[0]) ci = i; });
      for (const k in this.G) { const g = this.G[k]; g.root.style.display = 'none'; g.root.style.zIndex = ''; }
      const show = (k, z, o = 1) => { const g = this.G[k]; g.root.style.display = ''; g.root.style.zIndex = z; g.root.style.opacity = o >= 0.999 ? '' : o.toFixed(3); return g; };
      const reset = g => { g.body.style.transform = ''; g.hdr.style.opacity = ''; g.shade.style.opacity = '0'; };
      const [t0, k, kind = 'cut', dur] = F[ci];
      const p = prog(t, t0, t0 + (dur ?? (kind === 'push' ? 0.55 : kind === 'sheet' ? 0.6 : 0.35)));
      const cur = show(k, 2);
      reset(cur);
      if (ci > 0 && p < 1) {
        const prevK = F[ci - 1][1];
        if (kind === 'fade' || kind === 'swap') { reset(show(prevK, 1)); cur.root.style.opacity = Ease.outCubic(p).toFixed(3); }
        if (kind === 'push') {
          const e = Ease.inOutCubic(p), pg = show(prevK, 1);
          pg.body.style.transform = `translateX(${(-276 * e).toFixed(1)}px)`;
          pg.shade.style.opacity = (0.18 * e).toFixed(3);
          pg.hdr.style.opacity = '';
          cur.body.style.transform = `translateX(${(920 * (1 - e)).toFixed(1)}px)`;
          cur.hdr.style.opacity = e.toFixed(3);
        }
      }
      if (cur.sheet) {
        const ps = kind === 'sheet' ? p : 1;
        cur.dim.style.opacity = cur.hdrDim.style.opacity = '0';
        cur.dim.style.opacity = (cur.sheetDim * Ease.outCubic(prog(ps, 0, 0.6))).toFixed(3);
        cur.sheet.style.transform = `translateY(${((1 - oX(ps)) * 1220).toFixed(1)}px)`;
      }
      for (const gk in this.G) {
        const g = this.G[gk];
        if (g.root.style.display !== 'none' && g.def.page) g.inner.style.transform = `translateY(${(-this.scrollAt(gk, t)).toFixed(1)}px)`;
      }
      // the outgoing group of a push keeps its sheet state
      if (ci > 0 && p < 1 && kind === 'push') { const pg = this.G[F[ci - 1][1]]; if (pg.sheet) { pg.dim.style.opacity = pg.sheetDim.toFixed(3); pg.sheet.style.transform = ''; } }

      // ---- highlights, lifts, notes, pointer
      this.spot.at(t, C.spot || []);
      this.L.forEach(l => {
        lift(l.n, t, l.t0, l.dur || 0.9, l.to, l.t1 == null ? null : { t: l.t1, dur: 0.5 });
        l.n.set({ vis: t > l.t0 - 0.01 && (l.t1 == null || t < l.t1 + 0.52) && l.groups.some(gk => this.G[gk].root.style.display !== 'none') });
        const so_ = t < l.t0 ? 0 : Math.min((t - l.t0) * 10, l.t1 == null ? 1 : 1 - Ease.inOutCubic(prog(t, l.t1, l.t1 + 0.5)));
        l.slots.forEach(im => slotO(im, so_));
        if (l.ring) {
          l.ring.style.opacity = clamp(Math.min(Ease.outCubic(prog(t, l.t0 + 0.2, l.t0 + 0.7)), l.t1 == null ? 1 : 1 - prog(t, l.t1 - 0.25, l.t1))).toFixed(3);
          l.ring.style.background = tuFoil(t * 60);
        }
        if (l.alt) {
          let a = 0;
          for (const [ta, v] of l.altKeys) if (t >= ta) a = v;
          const last = [...l.altKeys].reverse().find(([ta]) => t >= ta);
          const prevV = last ? (l.altKeys[l.altKeys.indexOf(last) - 1] || [0, 0])[1] : 0;
          const e = last ? Ease.outCubic(prog(t, last[0], last[0] + 0.3)) : 1;
          l.alt.style.opacity = lerp(prevV, a, e).toFixed(3);
        }
      });
      const so = MANIFEST.phone.screenOffset;
      this.N.forEach(n => {
        const r = MANIFEST.reel.rects[n.rect];
        const pe = oX(prog(t, n.t0, n.t0 + 0.5)), q = Ease.inCubic(prog(t, n.t1, n.t1 + 0.3));
        n.node.set({ vis: t > n.t0 && t < n.t1 + 0.3, x: so[0] + r[0] + r[2] / 2 + (n.dx || 0), y: so[1] + r[1] + r[3] / 2 + (n.dy || 0) - (1 - pe) * 30, z: n.z || 260, s: (n.s || 1.9) * lerp(0.8, 1, pe), o: (1 - q) * clamp(pe * 2) });
      });
      this.ptr.at(t, this.path, this.taps, t > (C.ptrIn || 4.0) && t < OUT_T + 0.2, this.presses);
    },
  });

  endCard(OUT_T, C.tagline, DURATION, 0.55);
}
