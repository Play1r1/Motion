// Instagram reel «Пусть USDT работают». 9:16, 11 s, 120 BPM. Every piece is vector (src/vec.js).
// 3D USDT coins drop onto a stack on a slowly turning platform; on the drop two more stacks grow
// into a bar chart (20–40% APY, $20,000 in staking); every beat a coin lands with the app's daily
// forecast (+$14.42); then the Liquid Vault deposit while coins fly back out (withdraw any time).
'use strict';

igSetup(3);

const ST = { D: 250, gap: 300 };
ST.th = ST.D * 0.1 + 0.6;

scene({
  init() {
    const cam = $('#cam');
    this.T = new IgTitles([
      ['ПУСТЬ USDT\nРАБОТАЮТ', -0.6, 1.85],
      ['20–40%\nГОДОВЫХ', 2.0, 3.85],
      ['ДОХОД\nКАЖДЫЙ ДЕНЬ', 4.0, 5.85],
      ['ВЫВОД\nВ ЛЮБОЙ МОМЕНТ', 6.0, 7.75],
    ]);
    // the platform: a tilted plane the stacks stand on (coins live in its coordinates: z = up the stack)
    this.plat = new Node(cam, { w: 2, h: 2 });
    const C = [];
    const add = (stack, t0, from) => { const idx = C.filter(c => c.stack === stack).length; C.push({ stack, idx, t0, from, n: new VCoin(this.plat, 'usdt', ST.D, { N: 8 }) }); };
    for (let i = 0; i < 8; i++) add(1, -0.15 + i * 0.22, [Math.cos(i * 2.1) * 470, Math.sin(i * 2.1) * 300]);   // hook: the centre stack
    add(1, 2.05, [0, -200]);
    for (let i = 0; i < 5; i++) add(0, 2.1 + i * 0.1, [-160, -200]);
    for (let i = 0; i < 12; i++) add(2, 2.15 + i * 0.07, [160, -200]);
    [[2, 4.25], [1, 4.75], [0, 5.25], [2, 5.75]].forEach(([s, t]) => add(s, t, [0, -260]));
    this.coins = C;
    // withdrawals: the top coin of a stack flies out
    const top = s => C.filter(c => c.stack === s).slice(-1)[0];
    [[2, 6.25], [1, 6.75], [0, 7.25]].forEach(([s, t]) => { top(s).out = t; });
    this.apy = new VChip(cam, { html: '20–40% APY', size: 64, W: 700 });
    this.stat = new VStat(cam, { W: 600, value: '$20,000.00', caption: 'Всего в стейкинге' });
    this.fc = new VChip(cam, { html: '⚡&nbsp;прогноз $14.42 сегодня', size: 40, W: 760 });
    this.plus = [0, 1, 2, 3].map(() => new VChip(cam, { html: '+$14.42', size: 34, W: 300 }));
    this.dep = new VDeposit(cam, { W: 900 });
    igCues([4.0, 6.0]);
    C.forEach(c => { if ((c.t0 < 2 || c.t0 > 4) && c.t0 > -0.4) cue(Math.max(0, c.t0 + 0.42), 'coin', { gain: c.t0 < 2 ? 0.32 : 0.45 }); });
    [2.4, 2.75, 3.05].forEach(t => cue(t, 'coin', { gain: 0.35 }));
    cue(2.5, 'pop', { gain: 0.6, pitch: 0.8 });
    cue(3.0, 'pop', { gain: 0.5, pitch: 1.0 });
    cue(4.05, 'pop', { gain: 0.5, pitch: 1.1 });
    cue(6.05, 'whoosh', { dur: 0.5, gain: 0.45, up: true });
    C.filter(c => c.out).forEach(c => cue(c.out, 'whoosh', { dur: 0.35, gain: 0.32, pan: 0.7 }));
    cue(7.75, 'whoosh', { dur: 0.4, gain: 0.8 });
  },
  update(t) {
    this.T.at(t);
    const parts = [this.apy, this.stat, this.fc, this.dep, ...this.plus, ...this.coins.map(c => c.n)];
    for (const n of parts) n.set({ vis: false });
    if (t > IG.end + 0.15) { this.plat.set({ vis: false }); return; }
    const k = igKick(t), out = Ease.inExpo(prog(t, 7.75, 8.05));
    CAM.s = kf(t, [[0, 1.0], [1.9, 1.05, lin], [2.0, 1.0], [7.9, 1.04, lin]]) * (1 + 0.005 * k);
    // platform: slow turntable, rises for the deposit card, leaves with the cut
    const lift = Ease.inOutCubic(prog(t, 6.0, 6.5));
    this.plat.set({ vis: true, x: 0, y: lerp(230, 90, lift) + out * 1700, z: 0, rx: 64, rz: -12 + t * 3.2 });

    // coins: drop from above (spinning, tilted), land with a small bounce; some fly out at the end
    this.coins.forEach(c => {
      if (t < c.t0) return;
      const fall = prog(t, c.t0, c.t0 + 0.45), e = Ease.inCubic(fall);
      const zt = c.idx * ST.th, bounce = fall >= 1 ? Math.exp(-(t - c.t0 - 0.45) / 0.07) * Math.sin((t - c.t0 - 0.45) * 40) * 6 : 0;
      const sx = (c.stack - 1) * ST.gap;
      let x = lerp(sx + c.from[0], sx, e), y = lerp(c.from[1], 0, e), z = lerp(zt + 430, zt, e) + bounce;
      let rz = lerp(-260, 0, Ease.outCubic(fall)), rx = lerp(35, 0, Ease.outCubic(fall)), s = 1;
      if (c.out && t > c.out) {
        const p = Ease.inCubic(prog(t, c.out, c.out + 0.7));
        z += p * 700; x += p * 900; rx = p * -70; rz += p * 400;
        if (p >= 1) return;
      }
      c.n.set({ vis: true, x, y, z, rx, rz, s, o: clamp(fall * 4) });
      c.n.shine((t * 0.6 + c.idx * 0.13) % 1);
    });

    // 20–40% APY slams above the stacks; the total in staking under them
    if (t > 2.45 && t < 4.3) {
      const pop = outBack(prog(t, 2.5, 2.9)), off = Ease.inExpo(prog(t, 4.0, 4.3));
      this.apy.set({ vis: true, x: off * 1400, y: -300, z: 260, s: clamp(pop, 0, 1.25) * (1 + 0.02 * k), rz: lerp(-12, -3, pop) });
    }
    if (t > 2.95 && t < 4.3) {
      const pop = outBack(prog(t, 3.0, 3.4)), off = Ease.inExpo(prog(t, 4.0, 4.3));
      this.stat.set({ vis: true, x: -off * 1400, y: 470, z: 200, s: 0.95 * clamp(pop, 0, 1.25) * (1 + 0.012 * k), rz: lerp(4, 0, pop) });
    }
    // the daily forecast; a +$14.42 rises from the stack each coin lands on
    if (t > 4.0 && t < 6.35) {
      const pop = outBack(prog(t, 4.05, 4.45)), off = Ease.inExpo(prog(t, 6.0, 6.3));
      this.fc.set({ vis: true, x: off * 1400, y: 470, z: 220, s: clamp(pop, 0, 1.25) * (1 + 0.012 * k), rz: lerp(-4, 0, pop) });
    }
    [[2, 4.25], [1, 4.75], [0, 5.25], [2, 5.75]].forEach(([st, t0], i) => {
      const p = prog(t, t0 + 0.4, t0 + 1.3);
      if (p <= 0 || p >= 1) return;
      this.plus[i].set({ vis: true, x: (st - 1) * ST.gap * 0.98, y: lerp(-60, -300, Ease.outCubic(p)), z: 300, s: lerp(0.6, 1, Ease.outCubic(prog(p, 0, 0.3))), o: 1 - Ease.inCubic(prog(p, 0.65, 1)) });
    });
    // the Liquid Vault deposit
    if (t > 6.05) {
      const pin = oX(prog(t, 6.1, 6.6));
      this.dep.set({ vis: true, x: 0, y: lerp(1200, 430, pin) + out * 1700, z: 160, s: 0.92 * (1 + 0.01 * k), rz: lerp(6, 0, pin) });
    }
  },
});

endCard(IG.end, 'СТЕЙКИНГ USDT · 20–40% ГОДОВЫХ', IG.dur, 0.7);
