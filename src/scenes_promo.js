// INCPT Wallet — product promo on the new interface. 9:16, 120 BPM (beat = 0.5 s), "drive" track.
// Same editing language as the first reel (word-by-word headlines, real UI lifting off a titanium
// phone, whip transitions with motion blur) at a faster cut. Every claim is on the screens:
// «Активы под защитой», Получить / Обменять / Отправить, the swap screen, «Виртуальные и
// металлическая», card payments, Liquid Vault 20–40% APY, the Telegram mini app.
'use strict';

DURATION = 29.0;
META = { drop: 4.0, end: 23.0, bpm: 120, music: 'drive' };
const B = 0.5;                            // one beat
const TXT_TOP = 236;
const PHONE_S = 0.64, PHONE_Y = 290;
const PR = () => MANIFEST.reel;
const oC = Ease.outCubic, iC = Ease.inCubic;
// a short swell on every kick after the drop (lifted pieces and the camera breathe with the track)
const kick = t => (t < 4 || t > 23 ? 0 : Math.exp(-((t - 4) % B) / 0.09));

// phone whose screen is a stack built by hand (a scrolling page + fixed overlays), or a plain state
function stackPhone(cam, base) {
  const ph = new Phone(cam, base);
  const M = PR(), sc = ph.screenEl, HY = M.headerY;
  const img = (src, parent, st = {}) => { const im = mkImg(src, 'abs'); Object.assign(im.style, { left: '0px', top: '0px', width: '920px', height: '2000px' }, st); parent.appendChild(im); return im; };
  ph.page = key => {
    sc.innerHTML = '';
    const clip = document.createElement('div');
    Object.assign(clip.style, { position: 'absolute', left: '0px', top: HY + 'px', width: '920px', height: 2000 - HY + 'px', overflow: 'hidden' });
    sc.appendChild(clip);
    const pg = document.createElement('div');
    Object.assign(pg.style, { position: 'absolute', left: '0px', top: -HY + 'px', width: '920px', height: M.overlays[key].h + 'px' });
    clip.appendChild(pg);
    img(M.overlays[key].src, pg, { height: M.overlays[key].h + 'px' });
    ph.pg = pg;
  };
  ph.ov = (k, st = {}) => img(M.overlays[k].src, sc, { top: M.overlays[k].y + 'px', height: M.overlays[k].h + 'px', ...st });
  ph.slot = k => { const S = M.slots[k]; return img(S.src, sc, { left: S.x + 'px', top: S.y + 'px', width: S.w + 'px', height: S.h + 'px', opacity: '0' }); };
  ph.scrollTo = v => { if (ph.pg) ph.pg.style.transform = `translateY(${(-v).toFixed(1)}px)`; };
  return ph;
}
// a lifted piece: rise to `to`, optional land at t1; its slot shows while it is away
function liftPiece(t, cut, slotEl, t0, to, t1 = null, dur = 0.8, pulse = 0.02) {
  lift(cut, t, t0, dur, to, t1 === null ? null : { t: t1, dur: 0.45 });
  cut.set({ vis: t > t0 - 0.01 && (t1 === null || t < t1 + 0.47), s: cut.p.s * (1 + pulse * kick(t) * (t > t0 ? 1 : 0)) });
  if (slotEl) slotO(slotEl, t < t0 ? 0 : Math.min((t - t0) * 12, t1 === null ? 1 : 1 - Ease.inOutCubic(prog(t, t1, t1 + 0.45))));
}

// ======================================================================= 1. HOOK (0 – 4)
// КРИПТА · КАРТЫ · СТЕЙКИНГ · В ОДНОМ МЕСТЕ — each word brings its piece; at the end they all
// converge into one point, where the phone rises on the drop
scene({
  init() {
    const cam = $('#cam');
    const C = (n, o) => ({ n: new Cut(cam, n, { onScreen: false }), ...o });
    this.items = [
      C('pr_row_usdt', { x: -170, y: -430, z: 140, s: 0.82, rz: -3, tin: 0.25, dir: -1, blur: 0 }),
      C('pr_row_btc', { x: 230, y: 420, z: -140, s: 0.74, rz: 3, tin: 0.31, dir: 1, blur: 0.6 }),
      C('pr_row_eth', { x: -260, y: 640, z: -520, s: 0.64, rz: -4, tin: 0.37, dir: -1, blur: 2 }),
      C('pr_row_trx', { x: 310, y: -700, z: -800, s: 0.56, rz: 4, tin: 0.43, dir: 1, blur: 3.2 }),
      C('pr_card', { x: 90, y: -360, z: 260, s: 0.74, rz: -6, tin: 1.25, dir: 1, blur: 0, ry: -16 }),
      C('pr_safe', { x: -230, y: 470, z: 300, s: 1.25, rz: 4, tin: 2.25, dir: -1, blur: 0, pop: true }),
      C('pr_apy', { x: 250, y: 610, z: 380, s: 1.9, rz: -3, tin: 2.37, dir: 1, blur: 0, pop: true }),
    ];
    this.words = [
      [new Headline('КРИПТА', { y: 800, size: 172, fit: 980 }), 0.25, 1.1],
      [new Headline('КАРТЫ', { y: 800, size: 172, fit: 980 }), 1.25, 2.1],
      [new Headline('СТЕЙКИНГ', { y: 800, size: 172, fit: 980 }), 2.25, 3.1],
      [new Headline('В ОДНОМ\nМЕСТЕ', { y: 740, size: 150, fit: 980 }), 3.25, 3.8],
    ];
    cue(0.0, 'riser', { dur: 3.95, gain: 0.5 });
    this.items.forEach(c => cue(Math.max(0, c.tin - 0.06), 'whoosh', { dur: 0.4, gain: 0.25 + c.s * 0.12, pan: c.dir * 0.6 }));
    [0.25, 1.25, 2.25, 3.25].forEach(t => { cue(t, 'tick', { gain: 0.5 }); cue(t, 'pop', { gain: 0.35, pitch: 0.8 }); });
    cue(3.45, 'whoosh', { dur: 0.5, gain: 0.7, up: true });
  },
  update(t) {
    this.words.forEach(([h, a, b]) => h.at(t, a, b, { stagger: 0.07, dur: 0.4, outDur: 0.14, dy: 0.5 }));
    const on = t < 4.05;
    if (!on) { this.items.forEach(c => c.n.set({ vis: false })); return; }
    CAM.s = kf(t, [[0, 1.0], [3.3, 1.06, lin], [3.95, 1.12, iC]]);
    const conv = Ease.inCubic(prog(t, 3.35, 3.95));               // all pieces fall into one point
    this.items.forEach(c => {
      const pe = oX(prog(t, c.tin, c.tin + 0.75));
      const age = Math.max(0, t - c.tin);
      const depth = 1 + c.z / 1500;
      let x = c.pop ? c.x : lerp(c.dir * 1300, c.x, pe), y = c.y - age * 22 * depth, z = c.z;
      let s = c.pop ? c.s * lerp(0.15, 1, oX(prog(t, c.tin, c.tin + 0.55))) : c.s;   // safe and APY pop in place
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

// ======================================================================= 2. DROP — INCPT WALLET (4 – 7)
scene({
  init() {
    const cam = $('#cam');
    this.ph = new Phone(cam, 'pr_home');
    this.bal = new Cut(this.ph, 'pr_balance');
    this.slotBal = this.ph.addSlot('balance');
    this.h = new Headline('INCPT\nWALLET', { y: TXT_TOP - 10, size: 150 });
    cue(3.98, 'impact', { gain: 1.0 });
    cue(4.0, 'crash', { gain: 0.8 });
    cue(4.72, 'whoosh', { dur: 0.45, gain: 0.5, up: true }); cue(4.8, 'pop', { gain: 0.6, pitch: 0.9 });
    cue(6.5, 'fill', { n: 4, step: 0.125, gain: 0.7 });
    cue(6.86, 'whoosh', { dur: 0.4, gain: 0.95, pan: -0.8 });
  },
  update(t) {
    this.h.at(t, 4.0, 6.75, { stagger: 0.12, dy: 0.5 });
    const on = vis(t, 3.9, 7.15);
    this.ph.set({ vis: on });
    if (!on) return;
    CAM.s = kf(t, [[4.0, 1.0], [6.9, 1.06, lin]]) * (1 + 0.006 * kick(t));
    this.ph.set({
      x: tw(t, 6.88, 7.12, 0, -1600, iX), y: tw(t, 3.92, 4.6, 1900, PHONE_Y), s: PHONE_S,
      rx: tw(t, 3.92, 4.7, 30, 3) + kf(t, [[4.7, 0], [6.9, 2, lin]]),
      ry: kf(t, [[4.0, -6], [6.9, 5, lin]]) + tw(t, 6.88, 7.12, 0, -24, iX), rz: tw(t, 3.92, 4.6, -4, 0),
    });
    liftPiece(t, this.bal, this.slotBal, 4.75, { y: -40, z: 230, s: 1.36, rz: -1.5 });
  },
});

// ======================================================================= 3. WALLET + ACTIONS (7 – 12)
// АКТИВЫ ПОД ЗАЩИТОЙ (shield leaves the screen, page scrolls, the coins fan out)
// ПОЛУЧАЙ · ОБМЕНИВАЙ · ОТПРАВЛЯЙ (one button per beat), tap on «Обменять»
scene({
  init() {
    const cam = $('#cam');
    const M = PR();
    this.ph = stackPhone(cam, 'pr_wallet');
    this.ph.page('page_wallet');
    this.slots = {};
    for (const k of ['pr_shield', 'row_usdt', 'row_usdc', 'row_btc', 'row_eth', 'row_trx', 'btn_recv', 'btn_swap', 'btn_send']) this.slots[k] = this.ph.slot(k);
    this.ph.ov('bar_wallet');
    this.ph.ov('header');
    this.ph.ov('corners');
    this.shield = new Cut(this.ph, 'pr_shield');
    this.rows = ['usdt', 'usdc', 'btc', 'eth', 'trx'].map(n => new Cut(this.ph, 'pr_row_' + n));
    this.btns = ['recv', 'swap', 'send'].map(n => new Cut(this.ph, 'pr_btn_' + n));
    this.tap = new Tap(this.ph, 200);
    this.h1 = new Headline('АКТИВЫ\nПОД ЗАЩИТОЙ', { y: TXT_TOP, size: 124, fit: 990 });
    this.h2 = new Headline('ПОЛУЧАЙ\nОБМЕНИВАЙ\nОТПРАВЛЯЙ', { y: TXT_TOP - 60, size: 112, fit: 990 });
    cue(7.0, 'crash', { gain: 0.45, pan: 0.4 });
    cue(7.38, 'whoosh', { dur: 0.6, gain: 0.55, up: true }); cue(7.5, 'pop', { gain: 0.6, pitch: 0.8 });
    cue(8.6, 'scroll', { dur: 0.6, gain: 0.5 });
    [9.25, 9.37, 9.49, 9.61, 9.73].forEach((tt, i) => cue(tt, 'pop', { gain: 0.42, pitch: 1 + i * 0.08 }));
    cue(9.5, 'fill', { n: 4, step: 0.125, gain: 0.6 });
    [10.0, 10.5, 11.0].forEach((tt, i) => { cue(tt, 'whoosh', { dur: 0.35, gain: 0.5, up: true, pan: -0.5 + i * 0.5 }); cue(tt + 0.05, 'pop', { gain: 0.6, pitch: 0.9 + i * 0.1 }); });
    cue(11.5, 'tap', { gain: 0.85 });
    cue(11.75, 'whoosh', { dur: 0.4, gain: 0.95, up: true });
  },
  update(t) {
    this.h1.at(t, 7.0, 9.9, { stagger: 0.1 });
    this.h2.at(t, 10.0, 11.72, { stagger: 0.5, dur: 0.4, dy: 0.5, outStagger: 0.02 });
    const on = vis(t, 6.85, 12.05);
    this.ph.set({ vis: on });
    if (!on) return;
    CAM.s = kf(t, [[7.0, 1.0], [11.9, 1.07, lin]]) * (1 + 0.006 * kick(t));
    this.ph.set({
      x: tw(t, 6.9, 7.45, 1600, 0), y: PHONE_Y + tw(t, 11.76, 12.02, 0, -2400, iX), s: PHONE_S,
      ry: tw(t, 6.9, 7.45, 24, 0) + kf(t, [[7.4, -5], [11.8, 5, lin]]), rx: kf(t, [[7.0, 4], [11.8, -2, lin]]),
    });
    const M = PR();
    this.ph.scrollTo(Ease.inOutCubic(prog(t, 8.6, 9.15)) * M.overlays.page_wallet.scroll);
    // shield leaves the hero and comes back before the page scrolls
    liftPiece(t, this.shield, this.slots.pr_shield, 7.4, { y: -60, z: 320, s: 1.5, rz: -3 }, 8.1, 0.9, 0.03);
    // the five coins fan out of the list, then settle back
    this.rows.forEach((r, i) => {
      const t0 = 9.25 + i * 0.12;
      liftPiece(t, r, this.slots['row_' + ['usdt', 'usdc', 'btc', 'eth', 'trx'][i]], t0, { x: (i % 2 ? 1 : -1) * 30, y: -40 - i * 6, z: 120 + i * 40, s: 1.12, rz: (i % 2 ? 1.5 : -1.5) }, 9.9 + i * 0.02, 0.6, 0.015);
    });
    // actions: one button per beat
    this.btns.forEach((b, i) => {
      const t0 = 10.0 + i * 0.5;
      liftPiece(t, b, this.slots['btn_' + ['recv', 'swap', 'send'][i]], t0, { y: -120, z: 220 + (i === 1 ? 80 : 0), s: i === 1 ? 1.24 : 1.15, x: (i - 1) * 40 });
    });
    const sw = this.btns[1];
    if (t > 11.3) sw.set({ s: sw.p.s * (1 - 0.06 * press(t, 11.5)) });
    const [bx, by] = home('pr_btn_swap');
    this.tap.at(t, 11.5, bx, by - 120, 330);
  },
});

// ======================================================================= 4. SWAP (12 – 15)
// ОБМЕН В ОДИН ТАП — the two panels lift, the arrows button turns and they trade places
scene({
  init() {
    const cam = $('#cam');
    this.ph = new Phone(cam, 'pr_swap');
    this.slot = this.ph.addSlot('swap_panels');
    this.give = new Cut(this.ph, 'pr_give');
    this.get = new Cut(this.ph, 'pr_get');
    this.btn = new Cut(this.ph, 'pr_swapbtn');
    this.tap = new Tap(this.ph, 170);
    this.h = new Headline('ОБМЕН\nВ ОДИН ТАП', { y: TXT_TOP, size: 124, fit: 990 });
    cue(12.0, 'crash', { gain: 0.6 });
    cue(12.48, 'whoosh', { dur: 0.45, gain: 0.5, up: true }); cue(12.55, 'pop', { gain: 0.5 }); cue(12.62, 'pop', { gain: 0.5, pitch: 1.12 });
    [13.0, 14.0].forEach(tt => { cue(tt, 'tap', { gain: 0.8 }); cue(tt + 0.05, 'whoosh', { dur: 0.45, gain: 0.55 }); cue(tt + 0.45, 'coin', { gain: 0.45 }); });
    cue(14.5, 'fill', { n: 4, step: 0.125, gain: 0.6 });
    cue(14.78, 'whoosh', { dur: 0.4, gain: 0.95, pan: 0.8 });
  },
  update(t) {
    this.h.at(t, 12.0, 14.72, { stagger: 0.1 });
    const on = vis(t, 11.8, 15.1);
    this.ph.set({ vis: on });
    if (!on) return;
    CAM.s = kf(t, [[12.0, 1.0], [14.9, 1.06, lin]]) * (1 + 0.006 * kick(t));
    this.ph.set({
      x: tw(t, 14.8, 15.06, 0, 1600, iX), y: tw(t, 11.82, 12.4, 2400, PHONE_Y), s: PHONE_S,
      rx: tw(t, 11.82, 12.5, -22, 3) + kf(t, [[12.5, 0], [14.8, -2, lin]]),
      ry: kf(t, [[12.0, 5], [14.8, -5, lin]]) + tw(t, 14.8, 15.06, 0, 24, iX),
    });
    // panels trade places on each tap (an arc in depth keeps them from crossing each other)
    const D = 363;                                          // centre distance between the panels
    const sw = Ease.inOutCubic(prog(t, 13.05, 13.55)) - Ease.inOutCubic(prog(t, 14.05, 14.55));
    const arc = Math.sin(Math.PI * (prog(t, 13.05, 13.55) + prog(t, 14.05, 14.55)) % Math.PI);
    const up = oX(prog(t, 12.5, 13.1));
    slotO(this.slot, (t - 12.5) * 12);
    const pk = 1 + 0.015 * kick(t) * (t > 12.5 ? 1 : 0);
    this.give.set({ y: lerp(0, -30, up) + sw * D, z: lerp(0, 170, up) + arc * 140, s: lerp(1, 1.1, up) * pk, rz: -1 * up });
    this.get.set({ y: lerp(0, 30, up) - sw * D, z: lerp(0, 170, up) - arc * 90, s: lerp(1, 1.1, up) * pk, rz: 1 * up });
    const rot = 180 * (Ease.inOutCubic(prog(t, 13.0, 13.45)) + Ease.inOutCubic(prog(t, 14.0, 14.45)));
    this.btn.set({ z: lerp(0, 300, up), s: lerp(1, 1.35, up) * (1 - 0.08 * (press(t, 13.0) + press(t, 14.0))), rz: rot });
    const [bx, by] = home('pr_swapbtn');
    this.tap.at(t, t < 13.6 ? 13.0 : 14.0, bx, by, 330);
  },
});

// ======================================================================= 5. CARDS (15 – 18)
// ВИРТУАЛЬНЫЕ И МЕТАЛЛИЧЕСКИЕ КАРТЫ (the card holder leaves the screen), ПЛАТИ КРИПТОЙ
// (the card lifts, the real operations stream past it: crypto top-up -> card -> purchases)
scene({
  init() {
    const cam = $('#cam');
    this.ph = new Phone(cam, 'pr_cards');
    this.slotHolder = this.ph.addSlot('pr_holder');
    this.slotCard = this.ph.addSlot('card');
    this.holder = new Cut(this.ph, 'pr_holder');
    this.card = new Cut(this.ph, 'pr_card');
    const so = MANIFEST.phone.screenOffset;
    this.ops = ['topcard', 'topup', 'starbucks', 'nike'].map((n, i) => ({ n: new Cut(this.ph, 'pr_op_' + n, { at: [so[0] + 460, so[1] + 1000] }), t0: 16.75 + i * 0.25, dx: (i % 2 ? 1 : -1) * 40 }));
    this.h1 = new Headline('ВИРТУАЛЬНЫЕ\nИ МЕТАЛЛИЧЕСКИЕ\nКАРТЫ', { y: TXT_TOP - 50, size: 104, fit: 990 });
    this.h2 = new Headline('ПЛАТИ\nКРИПТОЙ', { y: TXT_TOP, size: 136, fit: 990 });
    cue(15.0, 'crash', { gain: 0.45, pan: -0.4 });
    cue(15.28, 'whoosh', { dur: 0.6, gain: 0.55, up: true }); cue(15.4, 'pop', { gain: 0.6, pitch: 0.8 });
    cue(16.5, 'whoosh', { dur: 0.5, gain: 0.6, up: true });
    this.ops.forEach((o, i) => { cue(o.t0, 'whoosh', { dur: 0.35, gain: 0.35, pan: o.dx > 0 ? 0.5 : -0.5 }); cue(o.t0 + 0.1, i === 1 ? 'coin' : 'tick', { gain: 0.45 }); });
    cue(17.5, 'fill', { n: 4, step: 0.125, gain: 0.6 });
    cue(17.78, 'whoosh', { dur: 0.4, gain: 0.95, up: true });
  },
  update(t) {
    this.h1.at(t, 15.0, 16.4, { stagger: 0.08 });
    this.h2.at(t, 16.5, 17.75, { stagger: 0.1, dy: 0.5 });
    const on = vis(t, 14.8, 18.05);
    this.ph.set({ vis: on });
    if (!on) return;
    CAM.s = kf(t, [[15.0, 1.0], [17.9, 1.08, lin]]) * (1 + 0.006 * kick(t));
    this.ph.set({
      x: tw(t, 14.82, 15.36, -1600, 0), y: PHONE_Y + tw(t, 17.78, 18.04, 0, -2400, iX), s: PHONE_S,
      ry: tw(t, 14.82, 15.36, -24, 0) + kf(t, [[15.3, 5], [17.9, -4, lin]]), rx: kf(t, [[15.0, 3], [17.9, -2, lin]]),
    });
    liftPiece(t, this.holder, this.slotHolder, 15.3, { y: -50, z: 300, s: 1.55, rz: 3 }, 16.25, 0.9, 0.03);
    liftPiece(t, this.card, this.slotCard, 16.5, { y: -470, z: 200, s: 0.92, rz: -2 });
    // the real operations fan out under the card, one per beat (top-up from USDT -> card -> purchases)
    this.ops.forEach((o, i) => {
      const e = oX(prog(t, o.t0, o.t0 + 0.6));
      o.n.set({ vis: t > o.t0 && t < 18.05, x: o.dx * 0.6, y: lerp(1700, 240 + i * 190, e), z: 260 + i * 30,
        s: 1.0 * (1 + 0.015 * kick(t)), rz: (o.dx > 0 ? 1 : -1) * lerp(6, 1.2, e) });
    });
  },
});

// ======================================================================= 6. STAKING (18 – 21)
scene({
  init() {
    const cam = $('#cam');
    this.ph = new Phone(cam, 'pr_stake');
    this.slotSafe = this.ph.addSlot('pr_safe');
    this.slotApy = this.ph.addSlot('apy');
    this.slotFc = this.ph.addSlot('forecast');
    this.safe = new Cut(this.ph, 'pr_safe');
    this.apy = new Cut(this.ph, 'pr_apy');
    this.fc = new Cut(this.ph, 'pr_forecast');
    this.h = new Headline('СТЕЙКИНГ\n20–40% APY', { y: TXT_TOP, size: 124, fit: 990 });
    cue(18.0, 'crash', { gain: 0.6 });
    cue(18.35, 'whoosh', { dur: 0.6, gain: 0.55, up: true }); cue(18.45, 'pop', { gain: 0.6, pitch: 0.75 });
    cue(19.0, 'whoosh', { dur: 0.4, gain: 0.5, up: true }); cue(19.05, 'pop', { gain: 0.6, pitch: 1.1 });
    cue(19.5, 'whoosh', { dur: 0.4, gain: 0.45, up: true }); cue(19.55, 'coin', { gain: 0.5 });
    cue(20.5, 'fill', { n: 4, step: 0.125, gain: 0.6 });
    cue(20.78, 'whoosh', { dur: 0.4, gain: 0.95, pan: -0.8 });
  },
  update(t) {
    this.h.at(t, 18.0, 20.72, { stagger: 0.1 });
    const on = vis(t, 17.8, 21.1);
    this.ph.set({ vis: on });
    if (!on) return;
    CAM.s = kf(t, [[18.0, 1.0], [20.9, 1.06, lin]]) * (1 + 0.006 * kick(t));
    this.ph.set({
      x: tw(t, 20.8, 21.06, 0, -1600, iX), y: tw(t, 17.82, 18.4, -2400, PHONE_Y), s: PHONE_S,
      rx: tw(t, 17.82, 18.5, -26, 2) + kf(t, [[18.5, 0], [20.8, 2, lin]]),
      ry: kf(t, [[18.0, -5], [20.8, 5, lin]]) + tw(t, 20.8, 21.06, 0, -24, iX),
    });
    liftPiece(t, this.safe, this.slotSafe, 18.4, { x: -120, y: -30, z: 320, s: 1.35, rz: -3 }, null, 0.9, 0.03);
    liftPiece(t, this.apy, this.slotApy, 19.0, { x: -40, y: -470, z: 380, s: 2.0, rz: -3 });
    liftPiece(t, this.fc, this.slotFc, 19.5, { y: -20, z: 280, s: 1.5, rz: 1.5 });
  },
});

// ======================================================================= 7. ВСЁ ПРЯМО В TELEGRAM (21 – 23)
scene({
  init() {
    const cam = $('#cam');
    this.ph = stackPhone(cam, 'pr_home');
    this.ph.page('page_home');
    this.b1 = this.ph.ov('bar_home');
    this.b2 = this.ph.ov('bar_home2', { opacity: '0' });
    this.ph.ov('header');
    this.ph.ov('corners');
    this.h = new Headline('ВСЁ ПРЯМО\nВ TELEGRAM', { y: TXT_TOP, size: 124, fit: 990 });
    cue(21.0, 'crash', { gain: 0.45, pan: 0.4 });
    cue(21.3, 'scroll', { dur: 1.1, gain: 0.45 });
    cue(22.8, 'whoosh', { dur: 0.45, gain: 0.95, up: true });
  },
  update(t) {
    this.h.at(t, 21.0, 22.85, { stagger: 0.1 });
    const on = vis(t, 20.8, 23.1);
    this.ph.set({ vis: on });
    if (!on) return;
    CAM.s = kf(t, [[21.0, 1.0], [22.9, 1.05, lin]]) * (1 + 0.006 * kick(t));
    this.ph.set({
      x: tw(t, 20.82, 21.36, 1600, 0), y: PHONE_Y + tw(t, 22.82, 23.08, 0, -2500, iX), s: PHONE_S,
      ry: tw(t, 20.82, 21.36, 24, 0) + kf(t, [[21.3, -4], [22.9, 4, lin]]), rx: kf(t, [[21.0, 3], [22.9, -2, lin]]),
    });
    const sp = Ease.inOutCubic(prog(t, 21.3, 22.45));
    this.ph.scrollTo(sp * PR().overlays.page_home.scroll);
    this.b2.style.opacity = sp.toFixed(3);
  },
});

// ======================================================================= 8. END CARD (23 – 29)
endCard(23.0, 'AI-КРИПТОКОШЕЛЁК И КАРТЫ');
