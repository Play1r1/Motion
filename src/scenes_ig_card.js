// Instagram reel «Из крипты — в карту». 9:16, 11 s, 120 BPM. Every piece is vector (src/vec.js).
// A 3D USDT coin spins in and, edge-on, turns into the holographic INCPT card on the drop; the
// card is topped up from USDT (the app's own operations: −$5,025 TRC-20 sent, +$5,000 received),
// pays (Starbucks, Nike), then the virtual and the metal card fan out.
'use strict';

igSetup(0);

scene({
  init() {
    const cam = $('#cam');
    this.T = new IgTitles([
      ['ИЗ КРИПТЫ —\nВ КАРТУ', -0.6, 1.85],
      ['ПОПОЛНИ\nИЗ USDT', 2.0, 3.85],
      ['ПЛАТИ\nКАРТОЙ INCPT', 4.0, 5.85],
      ['ВИРТУАЛЬНАЯ\nИЛИ МЕТАЛЛИЧЕСКАЯ', 6.0, 7.75, 112],
    ]);
    this.coin = new VCoin(cam, 'usdt', 380);
    this.metal = new VCard(cam, { W: 900, metal: true, sub: 'Металлическая', bal: '$25,000.00', last: '1934' });
    this.card = new VCard(cam, { W: 900 });
    this.send = new VRow(cam, { W: 900, title: 'Пополнение карты', chip: 'TRC-20', date: '1 окт., 16:40 · T9x...4Qp', amount: '−$5,025', status: 'Отправлено', dir: 'out' });
    this.recv = new VRow(cam, { W: 900, title: 'Пополнение', chip: 'Карта', date: '1 окт., 16:41', amount: '+$5,000', status: 'Получено', dir: 'in' });
    this.buy = [
      new VRow(cam, { W: 900, title: 'Starbucks', chip: 'Карта', date: '1 окт., 16:44', amount: '−$18.50', status: 'Оплачено' }),
      new VRow(cam, { W: 900, title: 'Nike', chip: 'Карта', date: '30 сент., 18:25', amount: '−$249.90', status: 'Оплачено' }),
    ];
    this.mini = [0, 1, 2, 3, 4].map(() => new VCoin(cam, 'usdt', 120, { N: 8 }));
    igCues([4.0, 6.0]);
    cue(0.02, 'whoosh', { dur: 0.8, gain: 0.5, up: true });
    cue(0.85, 'coin', { gain: 0.5 });
    cue(1.45, 'whoosh', { dur: 0.5, gain: 0.55, up: true });
    cue(2.1, 'whoosh', { dur: 0.45, gain: 0.5, pan: -0.6 });
    [2.68, 2.75, 2.82, 2.89, 2.96].forEach((t, i) => cue(t + 0.36, 'coin', { gain: 0.3 + i * 0.04 }));
    cue(3.4, 'pop', { gain: 0.55, pitch: 0.9 });
    [4.05, 4.55].forEach((t, i) => { cue(t, 'pop', { gain: 0.55, pitch: 1 + i * 0.12 }); cue(t - 0.05, 'tap', { gain: 0.4 }); });
    cue(6.05, 'whoosh', { dur: 0.5, gain: 0.5, pan: 0.6 });
    cue(6.3, 'whoosh', { dur: 0.6, gain: 0.45, up: true });
    cue(7.75, 'whoosh', { dur: 0.4, gain: 0.8 });
  },
  update(t) {
    this.T.at(t);
    const all = [this.coin, this.card, this.metal, this.send, this.recv, ...this.buy, ...this.mini];
    for (const n of all) n.set({ vis: false });
    if (t > IG.end + 0.15) return;
    const k = igKick(t), out = Ease.inExpo(prog(t, 7.75, 8.05));
    CAM.s = kf(t, [[0, 1.0], [1.9, 1.05, lin], [2.0, 1.0], [7.9, 1.04, lin]]) * (1 + 0.005 * k);

    // ---- hook: the coin flies in spinning (its edge catches the light), then turns edge-on
    const CY = 60;
    if (t < 1.78) {
      const pin = oX(prog(t, -0.3, 0.9));
      let ry = lerp(-900, -20, pin) + Math.sin(t * 2.6) * 22 * prog(t, 0.9, 1.2);
      ry = lerp(ry, 90, Ease.inCubic(prog(t, 1.45, 1.78)));
      this.coin.set({ vis: true, x: 0, y: CY + (1 - pin) * 180 + Math.sin(t * 2.2) * 10, z: lerp(-1600, 0, pin), s: 1, ry, rx: 8 + Math.sin(t * 1.7) * 4, rz: lerp(-30, 0, pin) });
      this.coin.shine(prog(t, 0.6, 1.5));
    }

    // ---- the card: edge-on at 1.75, faces the camera on the drop (overshoot), lives until 8
    if (t >= 1.75) {
      const ry0 = lerp(-90, 0, outBack(prog(t, 1.75, 2.2)));
      const up = Ease.inOutCubic(prog(t, 3.9, 4.35));            // moves up for the purchases
      const fan = Ease.inOutCubic(prog(t, 6.0, 6.7));            // aside for the metal card
      const pulse = Math.exp(-Math.max(0, t - 3.1) / 0.18) * (t > 3.1 ? 1 : 0);
      const tap = Math.sin(Math.PI * prog(t, 3.95, 4.6));         // tap-to-pay tilt
      const x = lerp(0, -130, fan), y = lerp(lerp(CY + 40, CY - 120, up), 40, fan) + out * 1700;
      const ry = ry0 + Math.sin(t * 1.1) * 6 + tap * -14 + fan * 18, rx = -4 + Math.cos(t * 0.9) * 3 + tap * 12;
      this.card.set({ vis: true, x, y, z: lerp(0, -60, fan), s: 0.86 * (1 + 0.04 * pulse) * (1 + 0.008 * k), ry, rx, rz: lerp(-2, -8, fan) });
      this.card.shine(t > 3.0 ? prog(t, 3.1, 3.7) : prog(t, 1.9, 2.5), 40 + ry * 1.6 + t * 6);
    }
    if (t > 6.0) {
      const pin = oX(prog(t, 6.15, 6.9));
      const ry = lerp(-70, -16, pin) + Math.sin(t * 1.2) * 5;
      this.metal.set({ vis: true, x: lerp(900, 105, pin), y: 230 + out * 1700, z: lerp(200, 90, pin), s: 0.74 * (1 + 0.008 * k), ry, rx: 6 + Math.cos(t) * 3, rz: lerp(14, 6, pin) });
      this.metal.shine(prog(t, 6.6, 7.4), 0);
    }

    // ---- top-up: the transfer flies in, collapses into the card while USDT coins pour into it
    if (t > 2.05 && t < 3.15) {
      const pin = oX(prog(t, 2.05, 2.6)), into = Ease.inCubic(prog(t, 2.8, 3.12));
      this.send.set({ vis: true, x: lerp(lerp(-1300, 0, pin), 0, into), y: lerp(CY - 330, CY + 40, into), z: lerp(160, 0, into), s: lerp(0.86, 0.15, into), rz: lerp(-6 * (1 - pin), 0, into), o: 1 - prog(t, 3.0, 3.12) });
    }
    this.mini.forEach((c, i) => {
      const t0 = 2.68 + i * 0.07;
      if (t < t0 || t > t0 + 0.4) return;
      const p = Ease.inCubic(prog(t, t0, t0 + 0.4));
      const sx = (i - 2) * 120;
      c.set({ vis: true, x: lerp(sx, 0, p), y: lerp(CY - 330 + Math.abs(i - 2) * 10, CY + 40, p) - Math.sin(p * Math.PI) * 120, z: lerp(260, 0, p), s: lerp(1, 0.4, p), ry: t * 500 + i * 40, rx: 20 });
    });
    if (t > 3.35 && t < 4.35) {
      const pop = outBack(prog(t, 3.4, 3.8)), off = Ease.inExpo(prog(t, 4.0, 4.32));
      this.recv.set({ vis: true, x: off * 1400, y: CY - 330, z: 220, s: 0.86 * clamp(pop, 0, 1.2) * (1 + 0.012 * k), rz: lerp(5, 0, pop) });
    }
    // ---- purchases: one per beat, out of the card
    this.buy.forEach((n, i) => {
      const t0 = 4.05 + i * 0.5;
      if (t < t0 || t > 6.35) return;
      const pop = outBack(prog(t, t0, t0 + 0.4)), off = Ease.inExpo(prog(t, 6.0 + i * 0.05, 6.3 + i * 0.05));
      n.set({ vis: true, x: (i ? 30 : -30) + (i ? 1 : -1) * off * 1500, y: lerp(CY - 120, CY + 210 + i * 180, Ease.outCubic(prog(t, t0, t0 + 0.4))), z: 240 + i * 30,
        s: 0.84 * clamp(pop, 0, 1.2) * (1 + 0.012 * k), rz: (i ? 1.2 : -1.2) * pop });
    });
  },
});

endCard(IG.end, 'КРИПТОКОШЕЛЁК И КАРТЫ В TELEGRAM', IG.dur, 0.7);
