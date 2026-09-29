// INCPT Wallet — staking announcement, 9:16, 80 BPM (beat = 0.75 s), calm cut.
// Built as a short how-to: what it is -> what it earns -> step 1 -> example -> step 2 -> done ->
// withdraw anytime -> where to find it. Every big line has a plain-language subline.
// Copy and UI come from the team's prototype (assets/staking/source/prototype.mp4).
'use strict';

DURATION = 27.0;
META = { drop: 3.0, end: 22.5, bpm: 80, music: 'calm' };
const PHONE_S = 0.6;
const PHONE_Y = 400;                     // phone sits lower: headline + subline live above it
const ISLAND = { islandTop: 90 };        // the prototype's status bar sits lower than iOS
const HEAD_Y = 200;

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

// big headline + one plain-language subline under it (placed after the headline is fitted)
class Title {
  constructor(head, sub, { size = 124, subSize = 54 } = {}) {
    this.h = new Headline(head, { y: HEAD_Y, size, fit: 990 });
    this.s = new Headline(sub, { y: 0, size: subSize, color: '#18213d', cls: 'sub', lh: 1.15, fit: 980 });
    Object.assign(this.s.el.style, { fontFamily: "'Inter Variable', sans-serif", fontVariationSettings: "'opsz' 32", fontWeight: '600', letterSpacing: '-0.01em' });
    this.lines = head.split('\n').length;
    this.nw = head.split(/\s+/).length;
  }
  at(t, tin, tout) {
    if (!this.placed) {
      this.h.fitNow();
      this.s.el.style.top = HEAD_Y + this.lines * this.h.size * 0.9 + 34 + 'px';
      this.placed = true;
    }
    this.h.at(t, tin, tout, { stagger: 0.13, dur: 0.85, outDur: 0.4, outStagger: 0.04, dy: 0.38, outDy: -0.25 });
    this.s.at(t, tin + 0.25 + this.nw * 0.1, tout === null ? null : tout + 0.05, { stagger: 0.035, dur: 0.9, outDur: 0.35, outStagger: 0.01, dy: 0.5, blur: 8, outDy: -0.2 });
  }
}

// slot opacity for an element that lifts at t0 and (optionally) lands back over [b0, b0+bd]
const slotLife = (t, t0, b0 = null, bd = 0.5) => Math.min((t - t0) * 10, b0 === null ? 1 : 1 - Ease.inOutCubic(prog(t, b0, b0 + bd)));
const oC = Ease.outCubic, iC = Ease.inCubic;

// ======================================================================= 1. WHAT IT IS (0 – 3.0)
scene({
  init() {
    const cam = $('#cam');
    this.safe = new Cut(cam, 'stk_safe', { onScreen: false });
    this.float = [
      // name,            x,     y,     z,    s,   rz,  tin,  dir, blur
      ['stk_chip_today',  290,  560,  140, 1.1, -3, 0.2, +1, 0],
      ['stk_check',      -330, -120, -500, 0.66,  4, 0.35, -1, 2],
      ['stk_panel_top',  -250,  820, -350, 0.74,  3, 0.28, -1, 1],
      ['stk_button',      270, 1050, -800, 0.7, -4, 0.45, +1, 3],
      ['stk_row0',        330, -160, -950, 0.64, -3, 0.5, +1, 4],
    ].map(c => ({ n: new Cut(cam, c[0], { onScreen: false }), x: c[1], y: c[2], z: c[3], s: c[4], rz: c[5], tin: c[6], dir: c[7], blur: c[8] }));
    this.t = new Title('СТЕЙКИНГ\nUSDT', 'Новое в INCPT Wallet', { size: 150 });
    cue(0.0, 'riser', { dur: 2.9, gain: 0.18 });
    cue(0.05, 'whoosh', { dur: 1.0, gain: 0.3, up: true });
    this.float.forEach(c => cue(c.tin, 'whoosh', { dur: 0.7, gain: 0.08 + c.s * 0.08, pan: c.dir * 0.5 }));
    cue(2.75, 'whoosh', { dur: 0.7, gain: 0.35, up: true });
  },
  update(t) {
    this.t.at(t, 0.4, 2.7);
    const on = t < 3.4;
    this.safe.set({ vis: on });
    this.float.forEach(c => c.n.set({ vis: on && t > c.tin - 0.01 }));
    if (!on) return;
    CAM.s = kf(t, [[0, 1.0], [3.0, 1.035, lin]]);
    // the vault drifts in from depth and turns slowly to face the camera
    const pin = oX(prog(t, 0.05, 1.7)), up = iC(prog(t, 2.72, 3.3));
    this.safe.set({
      x: 0, y: lerp(320, 250, pin) - up * 2200, z: lerp(-2200, 0, pin), s: 1.3,
      ry: lerp(70, -10, pin) + Math.max(0, t - 1.7) * 5, rx: lerp(-18, 4, pin), rz: lerp(-12, 0, pin), blur: (1 - pin) * 5,
    });
    this.float.forEach((c, i) => {
      const pe = oX(prog(t, c.tin, c.tin + 1.4)), age = Math.max(0, t - c.tin), depth = 1 + c.z / 1500;
      const pf = iC(prog(t, 2.62 + i * 0.03, 3.2 + i * 0.03));
      c.n.set({
        x: lerp(c.dir * 1300, c.x, pe) - age * 22 * depth * c.dir - pf * c.dir * 1400,
        y: c.y - age * 8 * depth + pf * (c.y > 0 ? 360 : -360),
        z: c.z, s: c.s, rz: c.rz + age * 0.6 * c.dir, ry: lerp(-c.dir * 30, 0, pe) + age * 1.2 * c.dir, blur: c.blur + pf * 3,
      });
    });
  },
});

// ======================================================================= 2. WHAT IT EARNS (3.0 – 7.5)
scene({
  init() {
    const cam = $('#cam');
    this.ph = new Phone(cam, 'stk_top', ISLAND);
    this.slotSafe = this.ph.addSlot('top_safe');
    this.slotChip = this.ph.addSlot('top_chip');
    this.safe = new Cut(this.ph, 'stk_safe');
    this.chip = new Cut(this.ph, 'stk_chip_today');
    this.t1 = new Title('20–40%\nГОДОВЫХ', 'Ваши USDT начинают приносить доход', { size: 150 });
    this.t2 = new Title('ВЫПЛАТЫ\nКАЖДЫЙ ДЕНЬ', 'Профит начисляется ежедневно', { size: 124 });
    cue(2.98, 'impact', { gain: 0.45, soft: true });
    cue(3.9, 'whoosh', { dur: 0.6, gain: 0.25, up: true }); cue(4.0, 'pop', { gain: 0.35, pitch: 0.85 });
    cue(5.4, 'whoosh', { dur: 0.6, gain: 0.3 }); cue(5.5, 'coin', { gain: 0.4 });
    cue(7.2, 'whoosh', { dur: 0.7, gain: 0.4, pan: -0.7 });
  },
  update(t) {
    this.t1.at(t, 3.15, 5.05);
    this.t2.at(t, 5.35, 7.25);
    const on = vis(t, 2.8, 7.9);
    this.ph.set({ vis: on });
    if (!on) return;
    CAM.s = kf(t, [[3.0, 1.0], [7.5, 1.05, lin]]);
    const out = iC(prog(t, 7.25, 7.85));
    this.ph.set({
      x: -out * 1500, y: tw(t, 2.85, 4.0, 1900, PHONE_Y), s: PHONE_S,
      rx: tw(t, 2.85, 4.1, 26, 3) + kf(t, [[4.1, 0], [7.5, 2, lin]]),
      ry: kf(t, [[3.0, -5], [7.5, 4, lin]]) - out * 18, rz: tw(t, 2.85, 4.0, -3, 0),
    });
    lift(this.safe, t, 3.95, 1.1, { y: -40, z: 220, s: 1.28, rz: -2.5 }, { t: 5.15, dur: 0.5 });
    this.safe.set({ ry: kf(t, [[3.95, 0], [5.15, 7, lin], [5.65, 0, ioC]]) });
    slotO(this.slotSafe, slotLife(t, 3.95, 5.15));
    lift(this.chip, t, 5.45, 1.1, { y: 0, z: 300, s: 1.75, rz: 1.5 });
    slotO(this.slotChip, slotLife(t, 5.45));
  },
});

// ======================================================================= 3. STEP 1 -> EXAMPLE -> STEP 2 -> DONE -> WITHDRAW (7.5 – 22.5)
// One phone for the whole flow, like the real app: the button of step 2 is on the same screen.
scene({
  init() {
    const cam = $('#cam');
    this.ph = new Phone(cam, 'stk_amount', { ...ISLAND, screens: ['stk_amount600', 'stk_success'] });
    this.slotPanel = this.ph.addSlot('amt_panel');
    this.slotChip = this.ph.addSlot('amt_chip500');
    this.slotProfit = this.ph.addSlot('amt_profit');
    this.slotBtn = this.ph.addSlot('amt_button');
    this.slotCheck = this.ph.addSlot('succ_check');
    this.slotCard = this.ph.addSlot('succ_card');
    this.slotRows = [0, 1].map(i => this.ph.addSlot(`succ_row${i}`));
    this.panel = new FlipCut(this.ph, MANIFEST.flip.amount);
    this.chip = new Cut(this.ph, 'stk_chip500');
    this.profit = new Cut(this.ph, 'stk_profit780');
    this.btn = new Cut(this.ph, 'stk_button');
    this.check = new Cut(this.ph, 'stk_check');
    this.card = new Cut(this.ph, 'stk_card600');
    this.rows = [0, 1].map(i => new Cut(this.ph, `stk_row${i}`));
    this.tap = new Tap(this.ph, 200);
    this.t1 = new Title('ШАГ 1\nВЫБЕРИТЕ СУММУ', 'От $10 до $20 000', { size: 118 });
    this.t2 = new Title('+$180\nЗА ГОД', 'Пример: $600 → ≈ $780 через год', { size: 150 });
    this.t3 = new Title('ШАГ 2\nОДИН ТАП', 'Нажмите «Открыть стейкинг»', { size: 136 });
    this.t4 = new Title('ГОТОВО —\nДЕПОЗИТ РАБОТАЕТ', '$600 USDT под 20–40% годовых', { size: 112 });
    this.t5 = new Title('ВЫВОД\nВ ЛЮБОЙ МОМЕНТ', 'Пополнение и вывод без блокировки средств', { size: 118 });
    this.n = MANIFEST.flip.amount.length;
    cue(8.35, 'whoosh', { dur: 0.6, gain: 0.25, up: true }); cue(8.45, 'pop', { gain: 0.35, pitch: 0.8 });
    cue(9.15, 'pop', { gain: 0.3, pitch: 1.15 });
    cue(9.9, 'tap', { gain: 0.55 });
    for (let i = 1; i < this.n; i++) cue(10.0 + (i - 1) * (1.2 / (this.n - 1)), 'tick', { gain: 0.1 + 0.06 * (i / this.n) });
    cue(11.45, 'whoosh', { dur: 0.6, gain: 0.3, up: true }); cue(11.55, 'coin', { gain: 0.45 });
    cue(13.0, 'whoosh', { dur: 0.6, gain: 0.18 });
    cue(14.45, 'whoosh', { dur: 0.5, gain: 0.22, up: true }); cue(14.55, 'pop', { gain: 0.3, pitch: 0.8 });
    cue(15.4, 'tap', { gain: 0.6 });
    cue(15.7, 'confirm', { gain: 0.45 });
    cue(16.6, 'whoosh', { dur: 0.6, gain: 0.25, up: true }); cue(16.7, 'pop', { gain: 0.35, pitch: 0.9 });
    cue(18.95, 'whoosh', { dur: 0.6, gain: 0.25 });
    cue(19.05, 'pop', { gain: 0.3 }); cue(19.3, 'pop', { gain: 0.3, pitch: 1.12 });
    cue(22.2, 'whoosh', { dur: 0.7, gain: 0.4, up: true });
  },
  update(t) {
    this.t1.at(t, 7.7, 11.05);
    this.t2.at(t, 11.35, 13.25);
    this.t3.at(t, 13.5, 16.3);
    this.t4.at(t, 16.55, 18.6);
    this.t5.at(t, 18.85, 22.2);
    const on = vis(t, 7.3, 22.9);
    this.ph.set({ vis: on });
    if (!on) return;
    CAM.s = kf(t, [[7.5, 1.0], [13.5, 1.05, lin], [18.75, 1.03, ioC], [22.5, 1.08, lin]]);
    this.ph.set({
      x: tw(t, 7.35, 8.4, 1500, 0), y: PHONE_Y - iC(prog(t, 22.2, 22.8)) * 2400, s: PHONE_S,
      ry: tw(t, 7.35, 8.4, 20, 0) + kf(t, [[8.0, -4], [15.0, 4, lin], [22.5, -3, lin]]), rx: kf(t, [[7.5, 3], [22.5, -2, lin]]),
    });
    const done = t >= 15.64;
    this.ph.setScreen(t < 11.2 ? 'stk_amount' : done ? 'stk_success' : 'stk_amount600');

    // step 1: the amount panel lifts; after the +$500 tap the prototype's own frames count it up, slowly
    lift(this.panel, t, 8.4, 1.1, { y: -110, z: 230, s: 1.3, rz: -1.2 }, { t: 12.95, dur: 0.55 });
    this.panel.show(t < 10.0 ? 0 : 1 + Math.floor(prog(t, 10.0, 11.2) * (this.n - 1)));
    this.panel.set({ vis: !done });
    slotO(this.slotPanel, done ? 0 : slotLife(t, 8.4, 12.95, 0.55));
    lift(this.chip, t, 9.1, 0.9, { x: 30, y: 10, z: 300, s: 1.5, rz: 2 }, { t: 10.55, dur: 0.5 });
    this.chip.set({ vis: !done, s: this.chip.p.s * (1 - 0.06 * press(t, 9.9)) });
    slotO(this.slotChip, done ? 0 : slotLife(t, 9.1, 10.55));
    // the yearly projection for the new amount
    lift(this.profit, t, 11.5, 1.1, { y: -10, z: 300, s: 1.36, rz: 1.2 }, { t: 13.0, dur: 0.55 });
    this.profit.set({ vis: t > 11.48 && !done });
    slotO(this.slotProfit, done ? 0 : slotLife(t, 11.5, 13.0, 0.55));

    // step 2: the button lifts, a beat to read it, then the tap; the screen flashes to "Стейкинг открыт"
    lift(this.btn, t, 14.5, 0.8, { z: 160, s: 1.16 }, { t: 15.5, dur: 0.14 });
    this.btn.set({ vis: !done, s: this.btn.p.s * (1 - 0.05 * press(t, 15.4)) });
    slotO(this.slotBtn, done ? 0 : slotLife(t, 14.5, 15.5, 0.14));
    const [cx, cy] = home('stk_chip500'), [bx, by] = home('stk_button');
    if (t < 12) this.tap.at(t, 9.9, cx + 30, cy + 10, 330);
    else if (!done) this.tap.at(t, 15.4, bx + 120, by, 200);
    else this.tap.set({ vis: false });
    this.ph.flash(t < 15.52 ? 0 : t < 15.64 ? prog(t, 15.52, 15.64) : 1 - Ease.outCubic(prog(t, 15.64, 16.0)));

    // done: the check pops, then the $600 USDT card
    const pc = oX(prog(t, 15.72, 16.6)), cb = Ease.inOutCubic(prog(t, 16.45, 16.95));
    this.check.set({ vis: t > 15.7, z: lerp(0, 260, pc) * (1 - cb), s: lerp(0.35, 1.45, pc) * (1 - cb) + cb, y: -20 * pc * (1 - cb), o: clamp((t - 15.7) * 8) });
    slotO(this.slotCheck, done ? 1 - cb : 0);
    lift(this.card, t, 16.65, 1.1, { y: -10, z: 240, s: 1.12, rz: -0.8 }, { t: 18.5, dur: 0.5 });
    this.card.set({ vis: done });
    slotO(this.slotCard, done ? slotLife(t, 16.65, 18.5) : 0);
    // withdraw anytime: the two checklist rows, big enough to read
    [[19.0, -20, -170, 240, -1.0], [19.25, 20, -120, 300, 1.0]].forEach(([t0, x, y, z, rz], i) => {
      lift(this.rows[i], t, t0, 1.1, { x, y, z, s: 1.75, rz });
      this.rows[i].set({ vis: done });
      slotO(this.slotRows[i], done ? slotLife(t, t0) : 0);
    });
  },
});

// ======================================================================= 5. WHERE TO FIND IT (22.5 – 27.0)
endCard(22.5, 'СТЕЙКИНГ USDT · 20–40% ГОДОВЫХ', DURATION, 0.55);
