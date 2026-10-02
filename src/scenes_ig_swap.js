// Instagram reel «Обмен в один тап». 9:16, 11 s, 120 BPM.
// The five coins of the wallet orbit in, collapse on the drop into the swap screen's two panels,
// which trade places on every tap of the ⇅ button; the rate and fees; then Получай · Обменивай ·
// Отправляй, one button per beat. All pieces from the new interface.
'use strict';

igSetup(-2);

scene({
  init() {
    this.T = new IgTitles([
      ['5 МОНЕТ —\nОДИН КОШЕЛЁК', -0.6, 1.85],
      ['ОБМЕН\nВ ОДИН ТАП', 2.0, 3.85],
      ['КУРС И КОМИССИИ\nСРАЗУ ВИДНЫ', 4.0, 5.85, 116],
      ['ПОЛУЧАЙ\nОБМЕНИВАЙ\nОТПРАВЛЯЙ', 6.0, 7.75, 104, 0.5],
    ]);
    this.coins = ['usdt', 'usdc', 'btc', 'eth', 'trx'].map((n, i) => ({ n: igCut('coin_' + n), t0: -0.3 + i * 0.3, a: i * 72 }));
    this.get = igCut('pr_get');
    this.give = igCut('pr_give');
    this.btn = igCut('pr_swapbtn');
    this.table = igCut('sw_table');
    this.acts = ['recv', 'swap', 'send'].map((n, i) => ({ n: igCut('pr_btn_' + n), t0: 6.0 + i * 0.5 }));
    this.tap = new Tap($('#cam'), 150);
    igCues([4.0, 6.0]);
    this.coins.forEach((c, i) => { if (c.t0 >= 0) { cue(c.t0, 'pop', { gain: 0.45, pitch: 0.9 + i * 0.08 }); cue(c.t0, 'coin', { gain: 0.25 }); } });
    cue(1.7, 'whoosh', { dur: 0.35, gain: 0.5 });
    [2.5, 3.5].forEach(t => { cue(t, 'tap', { gain: 0.7 }); cue(t + 0.05, 'whoosh', { dur: 0.4, gain: 0.45 }); cue(t + 0.4, 'coin', { gain: 0.4 }); });
    cue(4.0, 'whoosh', { dur: 0.45, gain: 0.45, up: true });
    cue(4.15, 'pop', { gain: 0.45, pitch: 0.85 });
    this.acts.forEach((a, i) => { cue(a.t0, 'whoosh', { dur: 0.35, gain: 0.4, up: true, pan: -0.5 + i * 0.5 }); cue(a.t0 + 0.05, 'pop', { gain: 0.55, pitch: 0.9 + i * 0.1 }); });
    cue(7.75, 'whoosh', { dur: 0.4, gain: 0.8 });
  },
  update(t) {
    this.T.at(t);
    const all = [this.get, this.give, this.btn, this.table, ...this.coins.map(c => c.n), ...this.acts.map(a => a.n)];
    for (const n of all) n.set({ vis: false });
    if (t > IG.end + 0.15) { this.tap.set({ vis: false }); return; }
    const k = igKick(t), out = Ease.inExpo(prog(t, 7.75, 8.05));
    CAM.s = kf(t, [[0, 1.0], [1.9, 1.06, lin], [2.0, 1.0], [7.9, 1.05, lin]]) * (1 + 0.006 * k);
    // hook: the coins pop in on an orbit (a tilted ring in depth), collapse into the centre at the drop
    const CY = 90;
    this.coins.forEach(c => {
      if (t < c.t0 || t > 2.0) return;
      const pop = outBack(prog(t, c.t0, c.t0 + 0.35)), col = Ease.inCubic(prog(t, 1.7, 2.0));
      const a = (c.a + t * 50) * Math.PI / 180, r = 330 * (1 - col);
      c.n.set({ vis: true, x: Math.cos(a) * r, y: CY + Math.sin(a) * r * 0.55, z: Math.sin(a) * 260 * (1 - col), s: 2.3 * clamp(pop, 0, 1.3) * (1 - col * 0.8), ry: Math.cos(a) * 25 });
    });
    // swap panels: burst in on the drop, trade places on each tap, step up for the rate table
    if (t > 1.98 && t < 6.35) {
      const pin = outBack(prog(t, 2.0, 2.4)), off = Ease.inExpo(prog(t, 6.0, 6.3));
      const lift = Ease.inOutCubic(prog(t, 4.0, 4.5));
      const sc = lerp(0.92, 0.68, lift) * clamp(pin, 0, 1.2), Ys = lerp(CY - 30, -150, lift);
      const p1 = Ease.inOutCubic(prog(t, 2.55, 2.95)), p2 = Ease.inOutCubic(prog(t, 3.55, 3.95));
      const sw = p1 - p2, arc = Math.sin(Math.PI * (p1 < 1 ? p1 : p2));
      const gY = Ys - 173.5 * sc, rY = Ys + 180 * sc;
      this.give.set({ vis: true, x: off * -1500, y: lerp(gY, rY, sw), z: 60 + arc * 160, s: sc * (1 + 0.012 * k), rz: -1 * arc });
      this.get.set({ vis: true, x: off * 1500, y: lerp(rY, gY, sw), z: 60 - arc * 100, s: sc * (1 + 0.012 * k), rz: 1 * arc });
      const rot = 180 * (Ease.inOutCubic(prog(t, 2.5, 2.9)) + Ease.inOutCubic(prog(t, 3.5, 3.9)));
      this.btn.set({ vis: true, x: 0, y: Ys, z: 240, s: 1.55 * clamp(pin, 0, 1.2) * (1 - 0.1 * (press(t, 2.5) + press(t, 3.5))) * (1 - lift * 0.3) * (1 - off), rz: rot });
      this.tap.at(t, t < 3.0 ? 2.5 : 3.5, 0, Ys, 300);
    } else this.tap.set({ vis: false });
    if (t > 4.0 && t < 6.35) {
      const pin = oX(prog(t, 4.05, 4.55)), off = Ease.inExpo(prog(t, 6.0, 6.3));
      this.table.set({ vis: true, x: 0, y: lerp(1300, 330, pin) + off * 1500, z: 140, s: 0.86 * (1 + 0.01 * k), rz: lerp(5, 0, pin) });
    }
    // Получай · Обменивай · Отправляй: one button per beat, on a diagonal
    this.acts.forEach((a, i) => {
      if (t < a.t0) return;
      const pop = outBack(prog(t, a.t0, a.t0 + 0.35));
      a.n.set({ vis: true, x: [-170, 0, 170][i], y: [-130, 90, 310][i] + out * 1500, z: 200 + i * 30, s: 1.75 * clamp(pop, 0, 1.3) * (1 + 0.015 * k), rz: [-4, 2, -2][i] * pop });
    });
  },
});

endCard(IG.end, 'ОБМЕН КРИПТЫ В ПАРУ ТАПОВ', IG.dur, 0.7);
