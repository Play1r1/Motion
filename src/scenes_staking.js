// INCPT Wallet — staking announcement, 9:16, 96 BPM (beat = 0.625 s).
// Same language as the wallet reel. Copy and UI come from the team's prototype
// (assets/staking/source/prototype.mp4): Стейкинг USDT · 20–40% годовых · Liquid Vault ·
// выплаты каждый день · от $10 до $20 000 · один тап · пополнение и вывод в любой момент.
'use strict';

DURATION = 18.125;
META = { drop: 2.5, end: 14.375 };
const TXT_TOP = 236;
const PHONE_S = 0.64;
const PHONE_Y = 290;
const ISLAND = { islandTop: 90 };        // the prototype's status bar sits lower than iOS

// amount panel that flips through the prototype's own counter frames
class FlipCut extends Node {
  constructor(parent, names) {
    const c = MANIFEST.cutouts[names[0]], so = MANIFEST.phone.screenOffset;
    super(parent, { w: c.size[0], h: c.size[1], at: [so[0] + c.box[0] + c.box[2] / 2, so[1] + c.box[1] + c.box[3] / 2], flat: true });
    this.imgs = names.map((n, i) => {
      const im = mkImg(MANIFEST.cutouts[n].src, 'fill');
      im.style.display = i ? 'none' : '';
      this.el.appendChild(im);
      return im;
    });
    this.cur = 0;
  }
  show(i) {
    i = Math.max(0, Math.min(this.imgs.length - 1, i));
    if (i === this.cur) return;
    this.imgs[this.cur].style.display = 'none';
    this.imgs[i].style.display = '';
    this.cur = i;
  }
}
// slot opacity for an element that lifts at t0 and (optionally) lands back over [b0, b0+bd]
const slotLife = (t, t0, b0 = null, bd = 0.35) => Math.min((t - t0) * 14, b0 === null ? 1 : 1 - Ease.inOutCubic(prog(t, b0, b0 + bd)));

// ======================================================================= 1. HOOK
// "НОВОЕ В INCPT WALLET" -> "СТЕЙКИНГ USDT": the vault flies in from depth, UI floats around it
scene({
  init() {
    const cam = $('#cam');
    this.safe = new Cut(cam, 'stk_safe', { onScreen: false });
    this.float = [
      // name,            x,     y,     z,    s,   rz,  tin,  dir, blur
      ['stk_chip_today',  290,  500,  140, 1.15, -3, 0.10, +1, 0],
      ['stk_check',      -330, -210, -500, 0.66,  4, 0.22, -1, 2],
      ['stk_panel_top',  -250,  770, -350, 0.78,  3, 0.16, -1, 1],
      ['stk_button',      270, 1010, -800, 0.74, -4, 0.28, +1, 3],
      ['stk_row0',        330, -260, -950, 0.66, -3, 0.34, +1, 4],
    ].map(c => ({ n: new Cut(cam, c[0], { onScreen: false }), x: c[1], y: c[2], z: c[3], s: c[4], rz: c[5], tin: c[6], dir: c[7], blur: c[8] }));
    this.h0 = new Headline('НОВОЕ\nВ INCPT WALLET', { y: TXT_TOP, size: 104, fit: 990 });
    this.h1 = new Headline('СТЕЙКИНГ\nUSDT', { y: TXT_TOP - 8, size: 150, fit: 990 });
    cue(0.0, 'riser', { dur: 2.45, gain: 0.35 });
    cue(0.02, 'whoosh', { dur: 0.7, gain: 0.6, up: true });
    this.float.forEach(c => cue(Math.max(0, c.tin - 0.08), 'whoosh', { dur: 0.4, gain: 0.18 + c.s * 0.2, pan: c.dir * 0.6 }));
    [0.12, 0.24, 0.36, 0.48].forEach(t => cue(t, 'tick', { gain: 0.3 }));
    cue(1.2, 'whoosh', { dur: 0.45, gain: 0.5 });
    [1.2, 1.32].forEach(t => cue(t, 'tick', { gain: 0.4 }));
    cue(2.32, 'whoosh', { dur: 0.45, gain: 0.85, up: true });
  },
  update(t) {
    this.h0.at(t, 0.12, 1.1, { stagger: 0.1 });
    this.h1.at(t, 1.2, 2.34, { stagger: 0.12, dy: 0.5 });
    const on = t < 2.7;
    this.safe.set({ vis: on });
    this.float.forEach(c => c.n.set({ vis: on && t > c.tin - 0.01 }));
    if (!on) return;
    CAM.s = kf(t, [[0, 1.0], [2.5, 1.05, lin]]);
    // the vault: from deep space, spinning to face camera, then a slow linear turn
    const pin = oX(prog(t, 0.02, 1.05)), up = iX(prog(t, 2.34, 2.62));
    this.safe.set({
      x: 0, y: lerp(260, 170, pin) - up * 2300, z: lerp(-2400, 0, pin), s: 1.34,
      ry: lerp(80, -12, pin) + Math.max(0, t - 1.05) * 9, rx: lerp(-20, 4, pin), rz: lerp(-14, 0, pin),
      blur: (1 - pin) * 6 + up * 6,
    });
    this.float.forEach((c, i) => {
      const pe = oX(prog(t, c.tin, c.tin + 0.9)), age = Math.max(0, t - c.tin), depth = 1 + c.z / 1500;
      const pf = iX(prog(t, 2.24 + i * 0.015, 2.56 + i * 0.015));
      c.n.set({
        x: lerp(c.dir * 1400, c.x, pe) - age * 50 * depth * c.dir - pf * c.dir * 1600,
        y: c.y - age * 14 * depth + pf * (c.y > 0 ? 420 : -420),
        z: c.z, s: c.s, rz: c.rz + age * 1.1 * c.dir, ry: lerp(-c.dir * 40, 0, pe) + age * 2.5 * c.dir,
        blur: c.blur + pf * 4,
      });
    });
  },
});

// ======================================================================= 2. DROP — 20–40% ГОДОВЫХ
scene({
  init() {
    const cam = $('#cam');
    this.ph = new Phone(cam, 'stk_top', ISLAND);
    this.slotSafe = this.ph.addSlot('top_safe');
    this.slotChip = this.ph.addSlot('top_chip');
    this.safe = new Cut(this.ph, 'stk_safe');
    this.chip = new Cut(this.ph, 'stk_chip_today');
    this.h1 = new Headline('20–40%\nГОДОВЫХ', { y: TXT_TOP - 10, size: 150, fit: 990 });
    this.h2 = new Headline('ВЫПЛАТЫ\nКАЖДЫЙ ДЕНЬ', { y: TXT_TOP, size: 118, fit: 990 });
    cue(2.48, 'impact', { gain: 1.0 });
    [2.56, 2.68].forEach(t => cue(t, 'tick', { gain: 0.5 }));
    cue(2.9, 'whoosh', { dur: 0.35, gain: 0.45, up: true }); cue(2.98, 'pop', { gain: 0.55, pitch: 0.85 });
    cue(3.66, 'whoosh', { dur: 0.4, gain: 0.55 }); cue(3.76, 'pop', { gain: 0.6, pitch: 1.1 });
    [3.8, 3.92].forEach(t => cue(t, 'tick', { gain: 0.4 }));
    cue(4.9, 'whoosh', { dur: 0.45, gain: 0.95, pan: -0.8 });
  },
  update(t) {
    this.h1.at(t, 2.54, 3.68, { stagger: 0.12, dy: 0.5 });
    this.h2.at(t, 3.8, 4.94, { stagger: 0.1 });
    const on = vis(t, 2.3, 5.3);
    this.ph.set({ vis: on });
    if (!on) return;
    CAM.s = kf(t, [[2.5, 1.0], [5.0, 1.07, lin]]);
    this.ph.set({
      x: tw(t, 4.95, 5.21, 0, -1550, iX), y: tw(t, 2.36, 3.15, 1850, PHONE_Y), s: PHONE_S,
      rx: tw(t, 2.36, 3.3, 32, 3) + kf(t, [[3.3, 0], [5.0, 2, lin]]),
      ry: kf(t, [[2.6, -6], [5.0, 5, lin]]) + tw(t, 4.95, 5.21, 0, -22, iX), rz: tw(t, 2.36, 3.2, -4, 0),
    });
    // the vault lifts out of the screen, then lands back so the payout chip has the stage
    lift(this.safe, t, 2.96, 0.75, { y: -30, z: 230, s: 1.3, rz: -3 }, { t: 3.6, dur: 0.36 });
    this.safe.set({ ry: kf(t, [[2.96, 0], [3.6, 8, lin], [3.96, 0, ioC]]) });
    slotO(this.slotSafe, slotLife(t, 2.96, 3.6, 0.36));
    lift(this.chip, t, 3.74, 0.75, { y: 10, z: 300, s: 1.8, rz: 2 });
    slotO(this.slotChip, slotLife(t, 3.74));
  },
});

// ======================================================================= 3. ВЫБЕРИТЕ СУММУ — counter $100 -> $600
scene({
  init() {
    const cam = $('#cam');
    this.ph = new Phone(cam, 'stk_amount', { ...ISLAND, screens: ['stk_amount600'] });
    this.slotPanel = this.ph.addSlot('amt_panel');
    this.slotChip = this.ph.addSlot('amt_chip500');
    this.slotProfit = this.ph.addSlot('amt_profit');
    this.panel = new FlipCut(this.ph, MANIFEST.flip.amount);
    this.chip = new Cut(this.ph, 'stk_chip500');
    this.profit = new Cut(this.ph, 'stk_profit780');
    this.tap = new Tap(this.ph, 200);
    this.h1 = new Headline('ВЫБЕРИТЕ\nСУММУ', { y: TXT_TOP, size: 136, fit: 990 });
    this.h2 = new Headline('ОТ $10\nДО $20 000', { y: TXT_TOP, size: 136, fit: 990 });
    this.n = MANIFEST.flip.amount.length;
    cue(5.08, 'tick', { gain: 0.5 }); cue(5.2, 'tick', { gain: 0.5 });
    cue(5.44, 'whoosh', { dur: 0.4, gain: 0.5, up: true }); cue(5.52, 'pop', { gain: 0.55, pitch: 0.8 });
    cue(5.9, 'whoosh', { dur: 0.3, gain: 0.35 }); cue(5.96, 'pop', { gain: 0.5, pitch: 1.15 });
    cue(6.28, 'tick', { gain: 0.45 }); cue(6.4, 'tick', { gain: 0.45 });
    cue(6.36, 'tap', { gain: 0.8 });
    for (let i = 1; i < this.n; i++) cue(6.42 + (i - 1) * (0.6 / (this.n - 1)), 'tick', { gain: 0.16 + 0.1 * (i / this.n) });
    cue(7.06, 'whoosh', { dur: 0.4, gain: 0.55, up: true }); cue(7.14, 'coin', { gain: 0.6 });
    cue(8.62, 'whoosh', { dur: 0.45, gain: 0.95, up: true });
  },
  update(t) {
    this.h1.at(t, 5.08, 6.2, { stagger: 0.12 });
    this.h2.at(t, 6.28, 8.62, { stagger: 0.12 });
    const on = vis(t, 4.95, 9.0);
    this.ph.set({ vis: on });
    if (!on) return;
    CAM.s = kf(t, [[5.0, 1.02], [8.75, 1.1, lin]]);
    const up = iX(prog(t, 8.64, 8.92));
    this.ph.set({
      x: tw(t, 5.0, 5.66, 1550, 0), y: PHONE_Y - up * 2400, s: PHONE_S,
      ry: tw(t, 5.0, 5.66, 24, 0) + kf(t, [[5.4, -5], [8.75, 5, lin]]), rx: kf(t, [[5.0, 4], [8.75, -2, lin]]),
    });
    this.ph.setScreen(t < 7.02 ? 'stk_amount' : 'stk_amount600');
    // amount panel lifts; the prototype's own frames count it up after the +$500 tap
    lift(this.panel, t, 5.5, 0.75, { y: -120, z: 230, s: 1.3, rz: -1.5 });
    this.panel.show(t < 6.42 ? 0 : 1 + Math.floor(prog(t, 6.42, 7.02) * (this.n - 1)));
    slotO(this.slotPanel, slotLife(t, 5.5));
    lift(this.chip, t, 5.94, 0.6, { x: 30, y: 10, z: 300, s: 1.5, rz: 2.5 }, { t: 6.9, dur: 0.36 });
    this.chip.set({ s: this.chip.p.s * (1 - 0.06 * press(t, 6.36)) });
    slotO(this.slotChip, slotLife(t, 5.94, 6.9, 0.36));
    const [cx, cy] = home('stk_chip500');
    this.tap.at(t, 6.36, cx + 30, cy + 10, 330);
    // yearly projection updates to the new amount and lifts
    lift(this.profit, t, 7.1, 0.75, { y: -10, z: 300, s: 1.36, rz: 1.5 });
    this.profit.set({ vis: t > 7.08 });
    slotO(this.slotProfit, slotLife(t, 7.1));
  },
});

// ======================================================================= 4. ОДИН ТАП — И ДЕПОЗИТ РАБОТАЕТ
// 5. ПОПОЛНЕНИЕ И ВЫВОД / В ЛЮБОЙ МОМЕНТ / БЕЗ БЛОКИРОВКИ СРЕДСТВ
scene({
  init() {
    const cam = $('#cam');
    this.ph = new Phone(cam, 'stk_amount600', { ...ISLAND, screens: ['stk_success'] });
    this.slotBtn = this.ph.addSlot('amt_button');
    this.slotCheck = this.ph.addSlot('succ_check');
    this.slotCard = this.ph.addSlot('succ_card');
    this.slotRows = [0, 1].map(i => this.ph.addSlot(`succ_row${i}`));
    this.btn = new Cut(this.ph, 'stk_button');
    this.check = new Cut(this.ph, 'stk_check');
    this.card = new Cut(this.ph, 'stk_card600');
    this.rows = [0, 1].map(i => new Cut(this.ph, `stk_row${i}`));
    this.tap = new Tap(this.ph, 200);
    this.h1 = new Headline('ОДИН ТАП —\nИ ДЕПОЗИТ\nРАБОТАЕТ', { y: TXT_TOP - 20, size: 112, fit: 990 });
    this.h2 = new Headline('ПОПОЛНЕНИЕ\nИ ВЫВОД', { y: TXT_TOP, size: 136, fit: 990 });
    this.h3 = new Headline('В ЛЮБОЙ\nМОМЕНТ', { y: TXT_TOP, size: 136, fit: 990 });
    this.h4 = new Headline('БЕЗ БЛОКИРОВКИ\nСРЕДСТВ', { y: TXT_TOP + 10, size: 118, fit: 990 });
    [8.84, 8.94, 9.04].forEach(t => cue(t, 'tick', { gain: 0.35 }));
    cue(9.2, 'whoosh', { dur: 0.35, gain: 0.45, up: true }); cue(9.28, 'pop', { gain: 0.5, pitch: 0.8 });
    cue(9.62, 'tap', { gain: 0.9 });
    cue(9.9, 'confirm', { gain: 0.6 });
    cue(10.3, 'whoosh', { dur: 0.4, gain: 0.5, up: true }); cue(10.38, 'pop', { gain: 0.6, pitch: 0.9 });
    cue(11.2, 'whoosh', { dur: 0.4, gain: 0.55 });
    cue(11.3, 'pop', { gain: 0.55 }); cue(11.42, 'pop', { gain: 0.55, pitch: 1.12 });
    [11.3, 11.42].forEach(t => cue(t, 'tick', { gain: 0.4 }));
    [12.2, 12.32].forEach(t => cue(t, 'tick', { gain: 0.45 }));
    cue(13.1, 'whoosh', { dur: 0.4, gain: 0.5 }); cue(13.2, 'pop', { gain: 0.55, pitch: 0.85 });
    [13.2, 13.32].forEach(t => cue(t, 'tick', { gain: 0.45 }));
    cue(14.2, 'whoosh', { dur: 0.5, gain: 0.9, up: true });
  },
  update(t) {
    this.h1.at(t, 8.84, 11.16, { stagger: 0.1 });
    this.h2.at(t, 11.28, 12.14, { stagger: 0.12 });
    this.h3.at(t, 12.2, 13.12, { stagger: 0.12 });
    this.h4.at(t, 13.2, 14.26, { stagger: 0.12 });
    const on = vis(t, 8.6, 14.6);
    this.ph.set({ vis: on });
    if (!on) return;
    CAM.s = kf(t, [[8.75, 1.0], [11.25, 1.05, lin], [14.3, 1.1, lin]]);
    this.ph.set({
      x: 0, y: tw(t, 8.7, 9.36, 2300, PHONE_Y + 36) + tw(t, 14.24, 14.52, 0, -2500, iX), s: PHONE_S,
      rx: tw(t, 8.7, 9.45, 26, 2) + kf(t, [[9.45, 0], [14.3, -2, lin]]), ry: kf(t, [[8.9, -5], [14.3, 5, lin]]),
    });
    // one tap: the button lifts, gets pressed, the screen flashes over to "Стейкинг открыт"
    lift(this.btn, t, 9.22, 0.5, { z: 160, s: 1.16 }, { t: 9.7, dur: 0.14 });
    this.btn.set({ vis: t < 9.84, s: this.btn.p.s * (1 - 0.05 * press(t, 9.62)) });
    slotO(this.slotBtn, t < 9.84 ? slotLife(t, 9.22, 9.7, 0.14) : 0);
    const [bx, by] = home('stk_button');
    if (t < 9.84) this.tap.at(t, 9.62, bx + 120, by, 200); else this.tap.set({ vis: false });
    this.ph.flash(t < 9.72 ? 0 : t < 9.84 ? prog(t, 9.72, 9.84) : 1 - Ease.outCubic(prog(t, 9.84, 10.1)));
    this.ph.setScreen(t < 9.84 ? 'stk_amount600' : 'stk_success');
    // check pops out of its slot, then the $600 USDT card
    const pc = oX(prog(t, 9.92, 10.6));
    const cb = Ease.inOutCubic(prog(t, 10.34, 10.72));
    this.check.set({ vis: t > 9.9, z: lerp(0, 260, pc) * (1 - cb), s: lerp(0.35, 1.45, pc) * (1 - cb) + cb, y: -20 * pc * (1 - cb), o: clamp((t - 9.9) * 10) });
    slotO(this.slotCheck, t > 9.84 ? 1 - cb : 0);
    lift(this.card, t, 10.36, 0.75, { y: -10, z: 240, s: 1.12, rz: -1 }, { t: 11.14, dur: 0.36 });
    this.card.set({ vis: t > 9.84 });
    const card2 = t > 13.1;                    // lifts again for "без блокировки средств"
    if (card2) lift(this.card, t, 13.2, 0.75, { y: -30, z: 240, s: 1.14, rz: 1.5 });
    slotO(this.slotCard, t < 9.84 ? 0 : card2 ? slotLife(t, 13.2) : slotLife(t, 10.36, 11.14, 0.36));
    // anytime: the two checklist rows lift in a stagger and go back before the last line
    [[11.3, -30, -40, 220, -1.5], [11.42, 30, -10, 270, 1.5]].forEach(([t0, x, y, z, rz], i) => {
      lift(this.rows[i], t, t0, 0.75, { x, y, z, s: 1.4, rz }, { t: 13.02 + i * 0.05, dur: 0.34 });
      this.rows[i].set({ vis: t > 9.84 });
      slotO(this.slotRows[i], t < 9.84 ? 0 : slotLife(t, t0, 13.02 + i * 0.05, 0.34));
    });
  },
});

// ======================================================================= 6. END CARD
endCard(14.375, 'СТЕЙКИНГ USDT · 20–40% ГОДОВЫХ');
