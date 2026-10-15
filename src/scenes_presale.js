// INCPT token presale — 9:16, 27 s, 120 BPM (beat = 0.5 s), "drive" track. The editing language of
// the promo (word-by-word headlines, real UI lifting off a titanium phone, whips with motion blur),
// on the INCEPTION Coin page of INCPT Wallet. Every fact is on that page: INCPT, $0.50 and the 7-day
// chart, «Основной токен экосистемы INCEPTION», the valuation formula and its example, «Купить на
// пресейле · 0.40 USDT · от $50,000», TRC-20 · TRON, free transfers between users.
'use strict';

DURATION = 27.0;
META = { drop: 4.0, end: 21.0, bpm: 120, music: 'drive', key: 2 };
const B = 0.5;                                  // one beat
const TXT_TOP = 236;
const PHONE_S = 0.64, PHONE_Y = 290;
const PR = () => MANIFEST.reel;
const oC = Ease.outCubic, iC = Ease.inCubic;
const kick = t => (t < 4 || t > 21 ? 0 : Math.exp(-((t - 4) % B) / 0.09));

// phone showing the coin page at a scroll: the long page under the app's fixed header and its two
// frosted bottom buttons (tinted while the presale button sits behind them, white otherwise)
function coinPhone(cam, scroll = 0) {
  const ph = new Phone(cam, 'ps_coin');
  const M = PR(), sc = ph.screenEl, so = MANIFEST.phone.screenOffset;
  sc.innerHTML = '';
  const img = (src, parent, st) => { const im = mkImg(src, 'abs'); Object.assign(im.style, st); parent.appendChild(im); return im; };
  const pg = document.createElement('div');
  Object.assign(pg.style, { position: 'absolute', left: '0px', top: '0px', width: '920px', height: M.page.h + 'px' });
  sc.appendChild(pg);
  img(M.page.src, pg, { left: '0px', top: '0px', width: '920px', height: M.page.h + 'px' });
  const ov = k => { const o = M.overlays[k]; return img(o.src, sc, { left: '0px', top: o.y + 'px', width: '920px', height: o.h + 'px' }); };
  ph.bars = {};
  for (const k of ['recv_a', 'send_a', 'recv_b', 'send_b']) ph.bars[k] = ov('bar_' + k);
  ov('header');
  // tint: the presale button behind the frosted buttons (gone once it scrolls away or lifts off)
  ph.setTint = k => { for (const n of ['recv', 'send']) { ph.bars[n + '_a'].style.opacity = k.toFixed(3); ph.bars[n + '_b'].style.opacity = (1 - k).toFixed(3); } };
  ph.scrollTo = v => {
    ph.scroll = v;
    pg.style.transform = `translateY(${(-v).toFixed(2)}px)`;
    ph.setTint(1 - clamp(v / 120));
  };
  ph.scrollTo(scroll);
  ph.slot = k => { const S = MANIFEST.slots[k]; return img(S.src, pg, { left: S.x + 'px', top: S.y + 'px', width: S.w + 'px', height: S.h + 'px', opacity: '0' }); };
  // a cut-out sitting exactly on its place on the screen (page pieces follow the scroll)
  ph.at = name => {
    const c = MANIFEST.cutouts[name], [bx, by, bw, bh] = c.box;
    return [so[0] + bx + bw / 2, so[1] + by + bh / 2 - (c.fixed ? 0 : ph.scroll)];
  };
  ph.piece = name => new Cut(ph, name, { at: ph.at(name) });
  return ph;
}
// the chart: clean base (labels, dates, grid) + the plot, revealed left to right
function chartCut(parent, opts) {
  const c = new Cut(parent, 'ps_chart_base', opts);
  const P = MANIFEST.cutouts.ps_chart.plot;
  const im = mkImg(P.src, 'abs');
  Object.assign(im.style, { left: P.x + 'px', top: P.y + 'px', width: P.w + 'px', height: P.h + 'px' });
  c.el.appendChild(im);
  c.reveal = p => {
    im.style.display = p <= 0 ? 'none' : '';
    const q = p * 104 - 3, m = `linear-gradient(90deg, #000 ${q.toFixed(2)}%, transparent ${(q + 3).toFixed(2)}%)`;
    im.style.maskImage = m; im.style.webkitMaskImage = m;
  };
  return c;
}
// a lifted piece: rise to `to`, optional land at t1; its slot shows while it is away
function liftPiece(t, cut, slotEl, t0, to, t1 = null, dur = 0.8, pulse = 0.02) {
  lift(cut, t, t0, dur, to, t1 === null ? null : { t: t1, dur: 0.45 });
  cut.set({ vis: t > t0 - 0.01 && (t1 === null || t < t1 + 0.47), s: cut.p.s * (1 + pulse * kick(t) * (t > t0 ? 1 : 0)) });
  if (slotEl) slotO(slotEl, t < t0 ? 0 : Math.min((t - t0) * 12, t1 === null ? 1 : 1 - Ease.inOutCubic(prog(t, t1, t1 + 0.45))));
}

// ======================================================================= 1. HOOK (0 – 4)
// ПРЕСЕЙЛ · ТОКЕНА · INCPT · В INCPT WALLET — each word brings a piece of the coin page; on the
// last word they fall into one point, where the phone rises on the drop
scene({
  init() {
    const cam = $('#cam');
    const C = (n, o) => ({ n: new Cut(cam, n, { onScreen: false }), ...o });
    this.items = [
      C('ps_presale', { x: 60, y: -440, z: 160, s: 0.84, rz: -4, tin: 0.25, dir: 1, blur: 0, ry: -12 }),
      C('ps_head', { x: -150, y: 470, z: 60, s: 1.0, rz: 3, tin: 1.25, dir: -1, blur: 0 }),
      C('ps_price', { x: -170, y: -660, z: 300, s: 1.15, rz: -4, tin: 2.25, dir: -1, blur: 0, pop: true }),
      C('ps_net', { x: 230, y: 640, z: 240, s: 1.5, rz: 4, tin: 2.37, dir: 1, blur: 0, pop: true }),
    ];
    this.words = [
      [new Headline('ПРЕСЕЙЛ', { y: 800, size: 172, fit: 980 }), 0.25, 1.1],
      [new Headline('ТОКЕНА', { y: 800, size: 172, fit: 980 }), 1.25, 2.1],
      [new Headline('INCPT', { y: 800, size: 190, fit: 980 }), 2.25, 3.1],
      [new Headline('В INCPT\nWALLET', { y: 740, size: 150, fit: 980 }), 3.25, 3.8],
    ];
    cue(0.0, 'riser', { dur: 3.95, gain: 0.5 });
    this.items.forEach(c => cue(Math.max(0, c.tin - 0.06), 'whoosh', { dur: 0.4, gain: 0.3 + c.s * 0.1, pan: c.dir * 0.6 }));
    [0.25, 1.25, 2.25, 3.25].forEach(t => { cue(t, 'tick', { gain: 0.5 }); cue(t, 'pop', { gain: 0.35, pitch: 0.8 }); });
    cue(2.4, 'coin', { gain: 0.4 });
    cue(3.45, 'whoosh', { dur: 0.5, gain: 0.7, up: true });
  },
  update(t) {
    this.words.forEach(([h, a, b]) => h.at(t, a, b, { stagger: 0.07, dur: 0.4, outDur: 0.14, dy: 0.5 }));
    if (t > 4.05) { this.items.forEach(c => c.n.set({ vis: false })); return; }
    CAM.s = kf(t, [[0, 1.0], [3.3, 1.06, lin], [3.95, 1.12, iC]]);
    const conv = Ease.inCubic(prog(t, 3.35, 3.95));               // all pieces fall into one point
    this.items.forEach(c => {
      const pe = oX(prog(t, c.tin, c.tin + 0.75)), age = Math.max(0, t - c.tin), depth = 1 + c.z / 1500;
      let x = c.pop ? c.x : lerp(c.dir * 1300, c.x, pe), y = c.y - age * 22 * depth, z = c.z;
      let s = c.pop ? c.s * lerp(0.15, 1, oX(prog(t, c.tin, c.tin + 0.55))) : c.s;
      x -= age * 30 * c.dir * depth;
      // pieces already on screen step back when the next word arrives
      const back = c.tin < 1.2 ? oC(prog(t, 1.25, 1.8)) * 0.6 + oC(prog(t, 2.25, 2.8)) * 0.4 : c.tin < 2.2 ? oC(prog(t, 2.25, 2.8)) * 0.6 : 0;
      z -= back * 700; const blur = c.blur + back * 3;
      x = lerp(x, 0, conv); y = lerp(y, 300, conv); z = lerp(z, -1800, conv); s = lerp(s, s * 0.2, conv);
      const ry = (c.ry || 0) + lerp(-c.dir * 50, 0, pe) + age * 3 * c.dir;
      c.n.set({ vis: t > c.tin - 0.01, x, y, z, s, rz: c.rz + age * 2 * c.dir, ry, blur: blur + conv * 6, o: 1 - Ease.inCubic(prog(t, 3.75, 3.98)) });
    });
  },
});

// ======================================================================= 2. DROP — INCEPTION COIN (4 – 8)
// the phone rises with the chart already off the screen; the line draws in; then the coin's name
// and price leave the page, one per beat
scene({
  init() {
    const cam = $('#cam');
    this.ph = coinPhone(cam, 0);
    this.slotChart = this.ph.slot('ps_chart');
    this.slotHead = this.ph.slot('ps_head');
    this.slotPrice = this.ph.slot('ps_price');
    this.chart = chartCut(this.ph, { at: this.ph.at('ps_chart') });
    this.head = this.ph.piece('ps_head');
    this.price = this.ph.piece('ps_price');
    this.h1 = new Headline('INCEPTION\nCOIN', { y: TXT_TOP - 10, size: 150, fit: 990 });
    this.h2 = new Headline('ТОКЕН\nЭКОСИСТЕМЫ\nINCEPTION', { y: TXT_TOP - 50, size: 112, fit: 990 });
    cue(3.98, 'impact', { gain: 1.0 });
    cue(4.0, 'crash', { gain: 0.8 });
    cue(4.1, 'whoosh', { dur: 0.45, gain: 0.5, up: true });
    cue(4.45, 'riser', { dur: 1.3, gain: 0.22 });
    [4.5, 4.75, 5.0, 5.25, 5.5].forEach((tt, i) => cue(tt, 'tick', { gain: 0.3 + i * 0.04 }));
    cue(5.75, 'pop', { gain: 0.55, pitch: 1.1 });
    cue(6.0, 'crash', { gain: 0.4, pan: 0.4 });
    cue(6.05, 'whoosh', { dur: 0.4, gain: 0.45, up: true }); cue(6.1, 'pop', { gain: 0.55, pitch: 0.85 });
    cue(6.55, 'whoosh', { dur: 0.4, gain: 0.45, up: true }); cue(6.6, 'coin', { gain: 0.5 });
    cue(7.5, 'fill', { n: 4, step: 0.125, gain: 0.6 });
    cue(7.78, 'whoosh', { dur: 0.4, gain: 0.95, pan: -0.8 });
  },
  update(t) {
    this.h1.at(t, 4.0, 5.85, { stagger: 0.12, dy: 0.5 });
    this.h2.at(t, 6.0, 7.75, { stagger: 0.1 });
    const on = vis(t, 3.9, 8.1);
    this.ph.set({ vis: on });
    if (!on) return;
    CAM.s = kf(t, [[4.0, 1.0], [7.9, 1.06, lin]]) * (1 + 0.006 * kick(t));
    this.ph.set({
      x: tw(t, 7.8, 8.06, 0, -1600, iX), y: tw(t, 3.92, 4.6, 1900, PHONE_Y), s: PHONE_S,
      rx: tw(t, 3.92, 4.7, 30, 3) + kf(t, [[4.7, 0], [7.8, 2, lin]]),
      ry: kf(t, [[4.0, -6], [7.8, 5, lin]]) + tw(t, 7.8, 8.06, 0, -24, iX), rz: tw(t, 3.92, 4.6, -4, 0),
    });
    // the chart: off the screen from the drop, wider than the phone; the line draws in; back at 6
    liftPiece(t, this.chart, this.slotChart, 3.95, { y: -150, z: 300, s: 1.3, rz: -1.5 }, 5.95, 0.8, 0.012);
    this.chart.reveal(Ease.inOutSine(prog(t, 4.45, 5.75)));
    liftPiece(t, this.head, this.slotHead, 6.05, { x: 40, y: -80, z: 320, s: 1.6, rz: -2.5 });
    liftPiece(t, this.price, this.slotPrice, 6.55, { x: 60, y: 260, z: 380, s: 1.75, rz: 2 });
  },
});

// ======================================================================= 3. VALUATION (8 – 12)
// СТОИМОСТЬ — ОТ ОЦЕНКИ КОМПАНИИ: «О монете»; the formula leaves the card, then the example,
// one line per beat
scene({
  init() {
    const cam = $('#cam');
    this.ph = coinPhone(cam, PR().page.scrollEnd);
    this.slotF = this.ph.slot('ps_formula');
    this.formula = this.ph.piece('ps_formula');
    this.ex = [1, 2, 3].map(i => ({ n: this.ph.piece('ps_ex' + i), slot: this.ph.slot('ps_ex' + i) }));
    this.h = new Headline('СТОИМОСТЬ —\nОТ ОЦЕНКИ\nКОМПАНИИ', { y: TXT_TOP - 50, size: 118, fit: 990 });
    cue(8.0, 'crash', { gain: 0.6 });
    cue(8.4, 'whoosh', { dur: 0.5, gain: 0.55, up: true }); cue(8.5, 'pop', { gain: 0.6, pitch: 0.8 });
    cue(9.85, 'whoosh', { dur: 0.4, gain: 0.35, up: true });
    [10.0, 10.5, 11.0].forEach((tt, i) => { cue(tt - 0.05, 'whoosh', { dur: 0.35, gain: 0.45, up: true, pan: i % 2 ? 0.4 : -0.4 }); cue(tt + 0.05, 'pop', { gain: 0.6, pitch: 0.9 + i * 0.12 }); });
    cue(11.05, 'coin', { gain: 0.5 });
    cue(11.5, 'fill', { n: 4, step: 0.125, gain: 0.6 });
    cue(11.78, 'whoosh', { dur: 0.4, gain: 0.95, pan: 0.8 });
  },
  update(t) {
    this.h.at(t, 8.0, 11.72, { stagger: 0.1 });
    const on = vis(t, 7.8, 12.1);
    this.ph.set({ vis: on });
    if (!on) return;
    CAM.s = kf(t, [[8.0, 1.0], [11.9, 1.07, lin]]) * (1 + 0.006 * kick(t));
    this.ph.set({
      x: tw(t, 7.82, 8.36, 1600, 0) + tw(t, 11.8, 12.06, 0, 1600, iX), y: PHONE_Y, s: PHONE_S,
      ry: tw(t, 7.82, 8.36, 24, 0) + kf(t, [[8.3, -5], [11.8, 5, lin]]) + tw(t, 11.8, 12.06, 0, 24, iX), rx: kf(t, [[8.0, 4], [11.8, -2, lin]]),
    });
    // formula: to the middle, then up to make room for the example
    // the screen steps back (a light veil) while its pieces are up
    this.ph.flash(0.3 * oC(prog(t, 8.45, 8.9)) + 0.2 * oC(prog(t, 9.9, 10.3)) - 0.5 * iC(prog(t, 11.6, 11.8)));
    lift(this.formula, t, 8.45, 0.8, { y: -577, z: 300, s: 1.45, rz: -1.5 }, { t: 9.85, dur: 0.5, ease: oX, to: { y: -1092, z: 300, s: 1.4, rz: -1 } });
    this.formula.set({ vis: t > 8.44, s: this.formula.p.s * (1 + 0.012 * kick(t) * (t > 8.45 ? 1 : 0)) });
    slotO(this.slotF, (t - 8.45) * 12);
    this.ex.forEach((e, i) => {
      const t0 = 10.0 + i * 0.5;
      liftPiece(t, e.n, e.slot, t0, { x: [-20, 16, -12][i], y: [-882, -726, -570][i], z: 300, s: 1.65, rz: [-1.5, 1.2, -1][i] }, null, 0.7, 0.015);
    });
  },
});

// ======================================================================= 4. PRESALE PRICE (12 – 16)
// ЦЕНА ПРЕСЕЙЛА 0.40 USDT · ПОКУПКА ОТ $50,000 — the presale button leaves the screen
scene({
  init() {
    const cam = $('#cam');
    this.ph = coinPhone(cam, 0);
    this.slot = this.ph.slot('ps_presale');
    this.btn = this.ph.piece('ps_presale');
    this.h1 = new Headline('ЦЕНА ПРЕСЕЙЛА\n0.40 USDT', { y: TXT_TOP, size: 124, fit: 990 });
    this.h2 = new Headline('ПОКУПКА\nОТ $50,000', { y: TXT_TOP, size: 136, fit: 990 });
    cue(12.0, 'crash', { gain: 0.6 });
    cue(12.4, 'whoosh', { dur: 0.6, gain: 0.6, up: true }); cue(12.5, 'pop', { gain: 0.6, pitch: 0.75 });
    cue(12.62, 'shimmer', { gain: 0.3 });
    cue(14.0, 'crash', { gain: 0.4, pan: -0.4 }); cue(14.05, 'coin', { gain: 0.5 });
    cue(15.5, 'fill', { n: 4, step: 0.125, gain: 0.6 });
    cue(15.78, 'whoosh', { dur: 0.4, gain: 0.95, up: true });
  },
  update(t) {
    this.h1.at(t, 12.0, 13.85, { stagger: 0.1 });
    this.h2.at(t, 14.0, 15.75, { stagger: 0.12, dy: 0.5 });
    const on = vis(t, 11.8, 16.05);
    this.ph.set({ vis: on });
    if (!on) return;
    CAM.s = kf(t, [[12.0, 1.0], [15.9, 1.08, lin]]) * (1 + 0.006 * kick(t));
    this.ph.set({
      x: tw(t, 11.82, 12.36, -1600, 0), y: PHONE_Y + tw(t, 15.78, 16.04, 0, -2400, iX), s: PHONE_S,
      ry: tw(t, 11.82, 12.36, -24, 0) + kf(t, [[12.3, 5], [15.8, -4, lin]]), rx: kf(t, [[12.0, 3], [15.8, -2, lin]]),
    });
    liftPiece(t, this.btn, this.slot, 12.45, { y: -900, z: 320, s: 1.34, rz: -2 }, null, 0.9, 0.012);
    this.ph.setTint(1 - oC(prog(t, 12.45, 12.9)));
    // a breath on the second line, the button keeps turning slowly in 3D
    this.btn.set({ ry: kf(t, [[12.45, -8], [15.8, 8, lin]]), rx: 6 * Math.sin((t - 12.45) * 1.3) * prog(t, 12.45, 13.2),
      s: this.btn.p.s * (1 + 0.04 * Math.exp(-Math.max(0, t - 14.0) / 0.2) * (t > 14.0 ? 1 : 0)) });
  },
});

// ======================================================================= 5. NETWORK, TRANSFERS, CTA (16 – 21)
// СЕТЬ TRC-20 · TRON — ПЕРЕВОДЫ БЕСПЛАТНО — КУПИТЬ НА ПРЕСЕЙЛЕ (tap), the button flies into the end card
scene({
  init() {
    const cam = $('#cam');
    this.ph = coinPhone(cam, 675);
    for (const k of ['ps_net', 'ps_note', 'ps_presale']) this['slot_' + k] = this.ph.slot(k);
    this.net = this.ph.piece('ps_net');
    this.note = this.ph.piece('ps_note');
    this.send = this.ph.piece('ps_send');
    this.btn = this.ph.piece('ps_presale');
    this.tap = new Tap(this.ph, 200);
    this.h1 = new Headline('СЕТЬ\nTRC-20 · TRON', { y: TXT_TOP, size: 124, fit: 990 });
    this.h2 = new Headline('ПЕРЕВОДЫ\nБЕСПЛАТНО', { y: TXT_TOP, size: 136, fit: 990 });
    this.h3 = new Headline('КУПИТЬ\nНА ПРЕСЕЙЛЕ', { y: TXT_TOP, size: 136, fit: 990 });
    cue(16.0, 'crash', { gain: 0.5 });
    cue(16.38, 'whoosh', { dur: 0.45, gain: 0.5, up: true }); cue(16.45, 'pop', { gain: 0.6, pitch: 0.8 });
    cue(17.5, 'crash', { gain: 0.35, pan: 0.4 });
    cue(17.5, 'whoosh', { dur: 0.45, gain: 0.5, up: true }); cue(17.6, 'pop', { gain: 0.55, pitch: 1.0 });
    cue(18.0, 'whoosh', { dur: 0.4, gain: 0.45, up: true, pan: 0.5 }); cue(18.1, 'pop', { gain: 0.55, pitch: 1.15 });
    cue(19.0, 'crash', { gain: 0.55 });
    cue(19.28, 'whoosh', { dur: 0.5, gain: 0.55, up: true }); cue(19.38, 'pop', { gain: 0.6, pitch: 0.8 });
    cue(19.95, 'tap', { gain: 0.9 }); cue(20.0, 'confirm', { gain: 0.5 });
    cue(20.5, 'fill', { n: 4, step: 0.125, gain: 0.65 });
    cue(20.6, 'whoosh', { dur: 0.45, gain: 0.95, up: true });
  },
  update(t) {
    this.h1.at(t, 16.0, 17.35, { stagger: 0.1 });
    this.h2.at(t, 17.5, 18.85, { stagger: 0.12, dy: 0.5 });
    this.h3.at(t, 19.0, 20.62, { stagger: 0.12, dy: 0.5 });
    const on = vis(t, 15.8, 21.3);
    this.ph.set({ vis: on });
    if (!on) { this.tap.set({ vis: false }); return; }
    CAM.s = kf(t, [[16.0, 1.0], [20.4, 1.08, lin], [21.0, 1.16, iC]]) * (1 + 0.006 * kick(t));
    this.ph.set({
      x: tw(t, 15.82, 16.36, 1600, 0), y: PHONE_Y + tw(t, 20.55, 21.0, 0, 2400, iX), s: PHONE_S,
      ry: tw(t, 15.82, 16.36, 24, 0) + kf(t, [[16.3, -5], [20.5, 4, lin]]), rx: kf(t, [[16.0, 3], [20.5, -2, lin]]),
    });
    liftPiece(t, this.net, this.slot_ps_net, 16.42, { x: 150, y: -330, z: 340, s: 2.0, rz: -3 }, 17.45, 0.8, 0.02);
    liftPiece(t, this.note, this.slot_ps_note, 17.55, { y: -420, z: 300, s: 1.4, rz: 1.5 }, 18.9, 0.8, 0.012);
    this.ph.flash(0.35 * (oC(prog(t, 17.55, 18.0)) - Ease.inOutCubic(prog(t, 18.9, 19.3))));
    // «Отправить» leaves the fixed bar (its overlay hides while it is away)
    lift(this.send, t, 18.05, 0.8, { x: 60, y: -360, z: 360, s: 1.45, rz: -3 }, { t: 18.9, dur: 0.45 });
    this.send.set({ vis: t > 18.04 && t < 19.37, s: this.send.p.s * (1 + 0.02 * kick(t) * (t > 18.05 ? 1 : 0)) });
    this.ph.bars.send_b.style.visibility = t > 18.04 && t < 19.37 ? 'hidden' : '';
    // the presale button: lifts, is tapped, then flies at the camera into the end card
    const go = Ease.inCubic(prog(t, 20.45, 21.25));            // carries the cut over the end card's first frames
    lift(this.btn, t, 19.33, 0.8, { y: -640, z: 330, s: 1.3, rz: -1.5 });
    // it stays put on the canvas while the phone drops away under it
    const drop = tw(t, 20.55, 21.0, 0, 2400, iX) / PHONE_S;
    this.btn.set({ vis: t > 19.32, y: this.btn.p.y - drop - go * 250, s: this.btn.p.s * (1 - 0.06 * press(t, 19.95)) * (1 + go * 2.2), z: this.btn.p.z + go * 900,
      o: 1 - Ease.inCubic(prog(t, 20.95, 21.28)), blur: go * 12 });
    slotO(this.slot_ps_presale, (t - 19.33) * 12);
    const [bx, by] = this.ph.at('ps_presale');
    this.tap.at(t, 19.95, bx, by - 640, 420);
  },
});

// ======================================================================= 6. END CARD (21 – 27)
// INCEPTION COIN, the presale address, one line of risk disclosure
class UrlBadge {
  constructor(small, big) {
    this.el = document.createElement('div');
    this.el.className = 'tgbadge';
    this.el.innerHTML = `<svg viewBox="0 0 24 24" width="100" height="100"><defs><linearGradient id="psg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#68a3e2"/><stop offset="0.55" stop-color="#5fa9c3"/><stop offset="1" stop-color="#72c59b"/></linearGradient></defs><circle cx="12" cy="12" r="12" fill="url(#psg)"/><path d="M11 5.2 C11.45 8.6 12.4 9.55 15.8 10 C12.4 10.45 11.45 11.4 11 14.8 C10.55 11.4 9.6 10.45 6.2 10 C9.6 9.55 10.55 8.6 11 5.2 Z M15.6 13.6 C15.78 14.98 16.12 15.32 17.5 15.5 C16.12 15.68 15.78 16.02 15.6 17.4 C15.42 16.02 15.08 15.68 13.7 15.5 C15.08 15.32 15.42 14.98 15.6 13.6 Z" fill="#fff"/></svg><div class="tgtext"><div class="tgsmall">${small}</div><div class="tgbig">${big}</div></div>`;
    $('#text').appendChild(this.el);
  }
}
UrlBadge.prototype.set = TgBadge.prototype.set;

endCard(21.0, 'ТОКЕН ЭКОСИСТЕМЫ INCEPTION', DURATION, 1, {
  title: '<span class="lk-w lk-incpt">INCEPTION</span><span class="lk-w lk-io">COIN</span>',
  badge: () => new UrlBadge('Пресейл', 'presale.incpt.fi'),
});
scene({
  init() {
    this.el = document.createElement('div');
    this.el.className = 'ps-risk';
    this.el.textContent = 'Не является инвестиционной рекомендацией';
    $('#text').appendChild(this.el);
  },
  update(t) {
    const p = prog(t, 22.9, 23.5);
    this.el.style.display = p > 0 ? '' : 'none';
    this.el.style.opacity = p.toFixed(3);
  },
});
