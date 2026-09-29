// INCPT Wallet — 9:16 reel, 96 BPM (beat = 0.625 s). Style: Tangem 6.1 reel language.
// Copy is grounded in the real UI only (OneClick MasterCard NoKYC, Apple/Google Pay,
// Пополнить/Вывести, "онлайн-платежей по всему миру", Telegram mini app).
'use strict';

DURATION = 27.5;
META = { drop: 5.0, end: 22.2 };
const TXT_TOP = 236;                // headline block top when UI sits below
const PHONE_S = 0.64;               // resting phone scale (~644 px wide)
const PHONE_Y = 290;                // resting phone centre (world y; screen = +960)
// ======================================================================= 1–2. HOOK
// "ОПЛАТИТЬ ПОДПИСКУ С КРИПТЫ?" over drifting subscription chips, then "И БЕЗ KYC?"
scene({
  init() {
    const cam = $('#cam');
    this.chips = [
      // name,          x,    y,     z,    s,   rz,  tin,  dir, blur, tray slot
      ['op_ae',        -150, -560,    0, 0.86,  3, -0.14, -1, 0, 0],
      ['op_higgs',      230, -300, -250, 0.68, -4, 0.06, +1, 0.8, 2],
      ['op_apple_out',  290, -850, -950, 0.52, -6, 0.14, +1, 4.0, null],
      ['op_apple_out',  170,  470,   60, 0.90, -3, -0.08, +1, 0, 1],
      ['op_apple_in',  -240,  700, -320, 0.68,  5, 0.12, -1, 1.4, null],
      ['op_topup',      330,  860, -1050, 0.52, -4, 0.20, +1, 5.0, null],
      ['op_higgs',     -300,  830,  240, 0.96,  4, 0.26, -1, 0, null],
    ].map(c => ({ n: new Cut(cam, c[0], { onScreen: false }), x: c[1], y: c[2], z: c[3], s: c[4], rz: c[5], tin: c[6], dir: c[7], blur: c[8], slot: c[9] }));
    this.tray = new Node(cam, { w: 920, h: 700, cls: 'glass', flat: true });
    this.tap = new Tap(cam, 124);
    this.h1 = new Headline('ОПЛАТИТЬ\nПОДПИСКУ\nС КРИПТЫ?', { y: 960 - 159, size: 118 });
    this.h2 = new Headline('И БЕЗ KYC?', { y: TXT_TOP + 40, size: 128 });
    // sound
    cue(0.0, 'riser', { dur: 4.98, gain: 0.35 });
    this.chips.forEach(c => { if (c.tin > -0.05) cue(Math.max(0, c.tin - 0.08), 'whoosh', { dur: 0.45, gain: 0.2 + c.s * 0.25, pan: c.dir * 0.6 }); });
    [0.22, 0.33, 0.44, 0.55].forEach(t => cue(t, 'tick', { gain: 0.35 }));
    cue(2.3, 'whoosh', { dur: 0.6, gain: 0.7 });
    [2.5, 2.6, 2.7].forEach(t => cue(t, 'tick', { gain: 0.35 }));
    cue(3.75, 'tap', { gain: 0.8 });
    cue(4.52, 'whoosh', { dur: 0.5, gain: 0.9, up: true });
  },
  update(t) {
    this.h1.at(t, 0.22, 2.08, { stagger: 0.11 });
    this.h2.at(t, 2.5, 4.52, { stagger: 0.1 });
    const on = t < 5.1;
    if (!on) { this.chips.forEach(c => c.n.set({ vis: false })); this.tray.set({ vis: false }); this.tap.set({ vis: false }); return; }
    CAM.s = kf(t, [[0, 1.0], [2.4, 1.05, lin], [2.4, 1.0], [5, 1.035, lin]]);
    // tray: forms 2.36 -> 3.1, drifts in 3D, whips up 4.55 -> 4.9
    const gRy = kf(t, [[2.6, -7], [4.6, 5, lin]]), gRx = kf(t, [[2.6, 6], [4.6, -3, lin]]);
    const exitY = tw(t, 4.55, 4.9, 0, -2300, iX);
    const GY = 170 + exitY;
    this.tray.set({ vis: t > 2.3, y: GY, ry: gRy, rx: gRx, o: tw(t, 2.4, 2.85, 0, 1, Ease.outCubic), s: tw(t, 2.36, 3.1, 0.84, 1), z: -40 });
    const ROWS = [-214, 0, 214];
    this.chips.forEach((c, i) => {
      // entrance: whip in from the side, then linear parallax drift that keeps the momentum
      const pe = oX(prog(t, c.tin, c.tin + 0.9));
      const depth = 1 + c.z / 1500;
      const age = Math.max(0, t - c.tin);
      let x = lerp(c.dir * 1400, c.x, pe) - age * 58 * depth * c.dir;
      let y = c.y - age * 14 * depth;
      let z = c.z, s = c.s, rz = c.rz + age * 1.1 * c.dir, ry = lerp(-c.dir * 40, 0, pe) + age * 2.5 * c.dir, rx = 0;
      let blur = c.blur;
      if (c.slot !== null) {
        const pa = oX(prog(t, 2.34 + c.slot * 0.06, 3.1 + c.slot * 0.06));
        x = lerp(x, 0, pa); y = lerp(y, GY + ROWS[c.slot], pa); z = lerp(z, 20, pa); s = lerp(s, 0.93, pa);
        rz = lerp(rz, 0, pa); ry = lerp(ry, gRy, pa); rx = lerp(rx, gRx, pa); blur = lerp(blur, 0, pa);
        if (c.slot === 1) s *= 1 - 0.03 * press(t, 3.75);
      } else {
        // leftovers get flung off-frame as the tray forms
        const pf = iX(prog(t, 2.28 + i * 0.012, 2.62 + i * 0.012));
        x -= pf * c.dir * 1600; y += pf * (c.y > 0 ? 420 : -420); blur += pf * 4;
      }
      c.n.set({ vis: t > c.tin - 0.01, x, y, z, s, rz, ry, rx, blur });
    });
    this.tap.at(t, 3.75, 150, GY, 80);
  },
});

// ======================================================================= 3. DROP — INCPT WALLET
scene({
  init() {
    const cam = $('#cam');
    this.ph = new Phone(cam, 'home');
    this.recv = new Cut(this.ph, 'btn_receive');
    this.send = new Cut(this.ph, 'btn_send');
    this.slotBtns = this.ph.addSlot('s1_buttons');
    this.tap = new Tap(this.ph, 200);
    this.h = new Headline('INCPT\nWALLET', { y: TXT_TOP - 10, size: 150 });
    cue(4.98, 'impact', { gain: 1.0 });
    cue(5.0, 'tick', { gain: 0.5 }); cue(5.12, 'tick', { gain: 0.5 });
    cue(6.17, 'whoosh', { dur: 0.35, gain: 0.5 });
    cue(6.25, 'pop', { gain: 0.6 }); cue(6.33, 'pop', { gain: 0.55, pitch: 1.12 });
    cue(6.88, 'tap', { gain: 0.7 });
    cue(7.14, 'whoosh', { dur: 0.45, gain: 0.95, pan: -0.8 });
  },
  update(t) {
    this.h.at(t, 5.0, 7.2, { stagger: 0.12, dy: 0.5 });
    const on = vis(t, 4.6, 7.55);
    this.ph.set({ vis: on });
    if (!on) return;
    CAM.s = kf(t, [[5.0, 1.0], [7.3, 1.07, lin]]);
    this.ph.set({
      x: tw(t, 7.2, 7.46, 0, -1550, iX), y: tw(t, 4.62, 5.45, 1850, PHONE_Y), s: PHONE_S,
      rx: tw(t, 4.62, 5.6, 32, 3) + kf(t, [[5.6, 0], [7.3, 2, lin]]),
      ry: kf(t, [[5.0, -6], [7.3, 5, lin]]) + tw(t, 7.2, 7.46, 0, -22, iX),
      rz: tw(t, 4.62, 5.5, -4, 0),
    });
    this.ph.setScroll(0);
    // both pills leave their slots (the screen underneath shows clean background)
    slotO(this.slotBtns, (t - 6.25) * 14);
    lift(this.recv, t, 6.25, 0.75, { x: -95, y: -40, z: 170, s: 1.48, rz: -3 });
    lift(this.send, t, 6.33, 0.75, { x: 95, y: -40, z: 210, s: 1.48, rz: 3 });
    if (t > 6.33) this.send.set({ s: this.send.p.s * (1 - 0.04 * press(t, 6.88)) });
    const [sx, sy] = home('btn_send');
    this.tap.at(t, 6.88, sx + 95 + 40, sy - 40, 260);
  },
});

// ======================================================================= 4–6. CARD ISSUE
// КАРТА В ОДИН КЛИК  ->  БЕЗ KYC  ->  APPLE PAY И GOOGLE PAY
scene({
  init() {
    const cam = $('#cam');
    this.ph = new Phone(cam, '5');
    this.card = new Cut(this.ph, 'card_issue');
    this.btn = new Cut(this.ph, 'btn_issue');
    this.title = new Cut(this.ph, 'title_oneclick');
    this.apay = new Cut(this.ph, 'row_applepay');
    this.gpay = new Cut(this.ph, 'row_googlepay');
    this.slotCard = this.ph.addSlot('s5_card');
    this.slotTitle = this.ph.addSlot('s5_title');
    this.slotApay = this.ph.addSlot('s5_applepay');
    this.slotGpay = this.ph.addSlot('s5_googlepay');
    this.tap = new Tap(this.ph, 200);
    this.h1 = new Headline('КАРТА\nВ ОДИН КЛИК', { y: TXT_TOP, size: 118 });
    this.h2 = new Headline('БЕЗ KYC', { y: TXT_TOP + 40, size: 150 });
    this.h3 = new Headline('APPLE PAY\nИ GOOGLE PAY', { y: TXT_TOP, size: 112 });
    [7.5, 7.6, 7.7, 7.8].forEach(t => cue(t, 'tick', { gain: 0.35 }));
    cue(7.66, 'whoosh', { dur: 0.5, gain: 0.55, up: true });
    cue(7.76, 'pop', { gain: 0.5, pitch: 0.8 });
    cue(8.72, 'tap', { gain: 0.8 });
    cue(8.84, 'confirm', { gain: 0.5 });
    cue(9.3, 'whoosh', { dur: 0.4, gain: 0.5 });
    cue(9.36, 'pop', { gain: 0.6, pitch: 0.9 });
    cue(10.55, 'whoosh', { dur: 0.45, gain: 0.55 });
    cue(10.66, 'pop', { gain: 0.6 }); cue(10.8, 'pop', { gain: 0.6, pitch: 1.12 });
    cue(12.22, 'whoosh', { dur: 0.45, gain: 0.95, up: true });
  },
  update(t) {
    this.h1.at(t, 7.5, 9.1, { stagger: 0.1 });
    this.h2.at(t, 9.38, 10.36, { stagger: 0.1, dy: 0.5 });
    this.h3.at(t, 10.62, 12.18, { stagger: 0.09 });
    const on = vis(t, 7.25, 12.7);
    this.ph.set({ vis: on });
    if (!on) return;
    CAM.s = kf(t, [[7.5, 1.0], [9.375, 1.04, lin], [10.625, 1.06, lin], [12.4, 1.08, lin]]);
    this.ph.set({
      x: tw(t, 7.28, 7.95, 1550, 0), y: PHONE_Y + tw(t, 12.28, 12.54, 0, -2400, iX), s: PHONE_S,
      ry: tw(t, 7.28, 7.95, 24, 0) + kf(t, [[7.8, -5], [12.4, 5, lin]]), rx: kf(t, [[7.5, 4], [12.4, -2, lin]]),
    });
    // card lifts out of its slot, then settles back into it before the KYC title rises
    lift(this.card, t, 7.7, 0.8, { y: -150, z: 280, s: 1.5, ry: -9, rx: 7, rz: -2 }, { t: 9.14, dur: 0.38 });
    this.card.set({ vis: t < 9.53, ry: this.card.p.ry + kf(t, [[8.5, 0], [9.14, 4, lin], [9.52, 0, ioC]]) });
    slotO(this.slotCard, (t - 7.7) * 14 * (t < 9.52 ? 1 : 0));
    // issue button: rise, press
    lift(this.btn, t, 8.4, 0.5, { z: 110, s: 1.12 }, { t: 9.28, dur: 0.4 });
    this.btn.set({ s: this.btn.p.s * (1 - 0.05 * press(t, 8.72)) });
    const [bx, by] = home('btn_issue');
    this.tap.at(t, 8.72, bx + 110, by, 190);
    // NoKYC title chip (flat to the screen: tilted neighbours would intersect in 3D)
    lift(this.title, t, 9.5, 0.7, { y: -130, z: 300, s: 1.95 }, { t: 10.44, dur: 0.4 });
    this.title.set({ rz: kf(t, [[9.5, -1], [10.6, 1, lin]]) });
    slotO(this.slotTitle, Math.min((t - 9.5) * 14, 1 - Ease.inOutCubic(prog(t, 10.44, 10.84))));
    // wallet rows
    lift(this.apay, t, 10.6, 0.75, { x: -24, y: -170, z: 230, s: 1.36, rz: -1.5 });
    lift(this.gpay, t, 10.74, 0.75, { x: 24, y: -100, z: 300, s: 1.36, rz: 1.5 });
    slotO(this.slotApay, (t - 10.6) * 14);
    slotO(this.slotGpay, (t - 10.74) * 14);
  },
});

// ======================================================================= 7. ПОПОЛНЯЙ / ПЛАТИ / ВЫВОДИ
scene({
  init() {
    const cam = $('#cam');
    this.ph = new Phone(cam, '4');
    this.card = new Cut(this.ph, 'card_main');
    this.bTop = new Cut(this.ph, 'btn_topup');
    this.bOut = new Cut(this.ph, 'btn_withdraw');
    const so = MANIFEST.phone.screenOffset;
    this.rTop = new Cut(this.ph, 'op_topup', { at: [so[0] + 460, so[1] + 1330] });
    this.slotCard = this.ph.addSlot('s4_card');
    this.slotAe = this.ph.addSlot('s4_op_ae');
    this.slotAp = this.ph.addSlot('s4_op_apple');
    // payments: AE + Apple lift from their real spots on this screen; Higgsfield joins from below
    this.rows = [
      [new Cut(this.ph, 'op_ae', { at: [so[0] + 460, so[1] + 1355 + 91] }), 13.8, -40, -580, 280, -2.5, 0],
      [new Cut(this.ph, 'op_apple_out', { at: [so[0] + 460, so[1] + 1552 + 91] }), 13.87, 40, -537, 340, 1.5, 0],
      [new Cut(this.ph, 'op_higgs', { at: [so[0] + 460, so[1] + 1760 + 91] }), 13.94, -24, -505, 400, -1, 700],
    ];
    this.tap = new Tap(this.ph, 200);
    this.w1 = new Headline('ПОПОЛНЯЙ', { y: TXT_TOP + 40, size: 136 });
    this.w2 = new Headline('ПЛАТИ', { y: TXT_TOP + 40, size: 136 });
    this.w3 = new Headline('ВЫВОДИ', { y: TXT_TOP + 40, size: 136 });
    cue(12.52, 'tick', { gain: 0.5 });
    cue(12.62, 'whoosh', { dur: 0.4, gain: 0.45, up: true });
    cue(13.12, 'tap', { gain: 0.75 });
    cue(13.2, 'whoosh', { dur: 0.4, gain: 0.55, up: true }); cue(13.3, 'coin', { gain: 0.5 });
    cue(13.76, 'tick', { gain: 0.5 });
    cue(13.72, 'whoosh', { dur: 0.45, gain: 0.6 });
    [13.8, 13.87, 13.94].forEach((t, i) => cue(t, 'pop', { gain: 0.5, pitch: 1 + i * 0.1 }));
    cue(14.82, 'whoosh', { dur: 0.45, gain: 0.7, pan: 0.8 });
    cue(15.0, 'tick', { gain: 0.5 });
    cue(15.42, 'tap', { gain: 0.75 });
    cue(15.94, 'whoosh', { dur: 0.5, gain: 0.95, pan: -0.8 });
  },
  update(t) {
    const o = { dur: 0.45, outDur: 0.16, outDy: -0.5 };
    this.w1.at(t, 12.52, 13.56, o);
    this.w2.at(t, 13.76, 14.8, o);
    this.w3.at(t, 15.0, 15.98, o);
    const on = vis(t, 12.28, 16.35);
    this.ph.set({ vis: on });
    if (!on) return;
    CAM.s = kf(t, [[12.5, 1.02], [16.2, 1.1, lin]]);
    this.ph.set({
      x: tw(t, 15.98, 16.26, 0, -1600, iX), y: tw(t, 12.3, 12.95, 2400, PHONE_Y), s: PHONE_S,
      ry: kf(t, [[12.6, 6], [16.1, -5, lin]]) + tw(t, 15.98, 16.26, 0, -22, iX),
      rx: tw(t, 12.3, 13.0, -20, 3) + kf(t, [[13.0, 0], [16, -2, lin]]),
    });
    // card hovers above the action buttons, steps back while the payments fan out
    // (all lifted pieces stay parallel to the screen; the phone's own drift gives the 3D)
    lift(this.card, t, 12.66, 0.8, { y: -150, z: 170, s: 1.38, rz: -1.5 },
      { t: 13.66, dur: 0.5, to: { y: -250, z: 150, s: 1.18, rz: -1 } });
    slotO(this.slotCard, (t - 12.66) * 14);
    // 1. top-up: button rises + press, then the +$22 row slides up over the phone
    lift(this.bTop, t, 12.92, 0.5, { z: 120, s: 1.3, y: -10 }, { t: 13.62, dur: 0.35 });
    this.bTop.set({ s: this.bTop.p.s * (1 - 0.06 * press(t, 13.12)) });
    const r1in = oX(prog(t, 13.2, 13.9)), r1out = iX(prog(t, 13.6, 13.84));
    this.rTop.set({ vis: t > 13.18 && t < 13.9, x: -r1out * 1700, y: (1 - r1in) * 1300, z: 260, s: 1.3, rz: -2 + r1in * 1.5 });
    // 2. payments fan out from the list
    this.rows.forEach(([n, t0, dx, dy, dz, rz, below], i) => {
      const pin = oX(prog(t, t0, t0 + 0.75));
      const pout = iX(prog(t, 14.8 + i * 0.03, 15.06 + i * 0.03));
      n.set({ vis: t > t0 - 0.01 && t < 15.2, x: lerp(0, dx, pin) + pout * 1700, y: lerp(below, dy, pin), z: lerp(0, dz, pin), s: lerp(1, 1.25, pin), rz: lerp(0, rz, pin) + (t - t0) * 0.6 });
    });
    slotO(this.slotAe, (t - 13.8) * 14);
    slotO(this.slotAp, (t - 13.87) * 14);
    // 3. withdraw: button rises big, press
    lift(this.bOut, t, 15.04, 0.6, { z: 230, s: 1.95, y: -40, x: 10 });
    this.bOut.set({ s: this.bOut.p.s * (1 - 0.06 * press(t, 15.42)) });
    const [tx, ty] = home('btn_topup'), [wx, wy] = home('btn_withdraw');
    if (t < 14) this.tap.at(t, 13.12, tx, ty - 10, 180);
    else this.tap.at(t, 15.42, wx + 10, wy - 40, 290);
  },
});

// ======================================================================= 8. ПО ВСЕМУ МИРУ
scene({
  init() {
    const cam = $('#cam');
    this.card = new Cut(cam, 'card_main', { onScreen: false });
    this.rows = [
      ['op_ae', -170, 380, -700, 0.7, 2.6],
      ['op_apple_out', 330, 860, 400, 0.78, 0],
      ['op_higgs', 200, 120, -1100, 0.62, 4.2],
      ['op_apple_in', -330, 1150, 360, 0.74, 0],
      ['op_topup', 180, 1300, -1200, 0.58, 4.8],
      ['op_higgs', 350, 1650, 440, 0.82, 0],
      ['op_ae', -200, 1750, -800, 0.66, 3],
      ['op_apple_out', -350, 2150, 400, 0.8, 0],
    ].map(r => ({ n: new Cut(cam, r[0], { onScreen: false }), x: r[1], y: r[2], z: r[3], s: r[4], blur: r[5] }));
    this.h = new Headline('ПО ВСЕМУ\nМИРУ', { y: TXT_TOP, size: 136 });
    cue(16.2, 'whoosh', { dur: 0.6, gain: 0.7, pan: 0.6 });
    cue(16.26, 'tick', { gain: 0.5 }); cue(16.38, 'tick', { gain: 0.5 });
    cue(18.3, 'whoosh', { dur: 0.5, gain: 0.8, up: true });
  },
  update(t) {
    this.h.at(t, 16.26, 18.4, { stagger: 0.12, dy: 0.5 });
    const on = vis(t, 16.0, 18.72);
    this.card.set({ vis: on });
    this.rows.forEach(r => r.n.set({ vis: on }));
    if (!on) return;
    CAM.s = kf(t, [[16.25, 1.0], [18.5, 1.1, lin]]);
    const xin = tw(t, 16.05, 16.8, 1550, 0);
    const up = tw(t, 18.36, 18.68, 0, -2600, iX);
    this.card.set({
      x: xin, y: 140 + up, z: 0, s: 1.02,
      ry: tw(t, 16.05, 16.8, -45, -14) + kf(t, [[16.8, 0], [18.6, 20, lin]]),
      rx: 12 + kf(t, [[16.8, 0], [18.6, -6, lin]]), rz: -6 + kf(t, [[16.8, 0], [18.6, 3, lin]]),
    });
    this.rows.forEach((r, i) => {
      const depth = 1 + r.z / 1600;
      r.n.set({
        x: r.x + xin * (0.75 + 0.25 * depth), y: r.y - (t - 16.05) * 330 * depth + up * depth, z: r.z, s: r.s, blur: r.blur,
        rz: (i % 2 ? 1 : -1) * (2 + (t - 16) * 1.2), ry: (i % 2 ? -8 : 8),
      });
    });
  },
});

// ======================================================================= 9. ВСЁ ПРЯМО В TELEGRAM (scroll)
scene({
  init() {
    const cam = $('#cam');
    this.ph = new Phone(cam, 'home');
    this.hdr = new Cut(this.ph, 'tg_header');
    this.h = new Headline('ВСЁ ПРЯМО\nВ TELEGRAM', { y: TXT_TOP, size: 118 });
    [18.74, 18.84, 18.94].forEach(t => cue(t, 'tick', { gain: 0.35 }));
    cue(19.3, 'scroll', { dur: 1.95, gain: 0.35 });
    cue(21.22, 'whoosh', { dur: 0.4, gain: 0.5 }); cue(21.32, 'pop', { gain: 0.6, pitch: 0.9 });
    cue(22.06, 'whoosh', { dur: 0.5, gain: 0.9, up: true });
  },
  update(t) {
    this.h.at(t, 18.74, 22.16, { stagger: 0.1 });
    const on = vis(t, 18.4, 22.5);
    this.ph.set({ vis: on });
    if (!on) return;
    CAM.s = kf(t, [[18.75, 1.0], [22.3, 1.06, lin]]);
    this.ph.set({
      x: 0, y: tw(t, 18.45, 19.2, 2300, PHONE_Y) + tw(t, 22.14, 22.44, 0, -2500, iX), s: PHONE_S,
      rx: tw(t, 18.45, 19.3, 26, 2) + kf(t, [[19.3, 0], [22.2, -2, lin]]), ry: kf(t, [[18.8, -5], [22.3, 5, lin]]),
    });
    this.ph.setScroll(tw(t, 19.3, 21.2, 0, 1300, ioC));
    lift(this.hdr, t, 21.26, 0.75, { y: 40, z: 260, s: 1.3, rx: 4, ry: 3 });
  },
});

// ======================================================================= 10. END CARD
endCard(22.2, 'AI-КРИПТОКОШЕЛЁК И КАРТЫ');
