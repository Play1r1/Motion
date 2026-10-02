// Instagram reel «Пусть USDT работают». 9:16, 11 s, 120 BPM.
// USDT coins spiral in, the INCPT safe slams down on them on the drop; 20–40% APY, the total in
// staking, the app's daily forecast with coins rising out of the safe, then the Liquid Vault
// deposit (in and out at any time) while coins fly back out. All pieces from the staking screens.
'use strict';

igSetup(3);

scene({
  init() {
    this.T = new IgTitles([
      ['ПУСТЬ USDT\nРАБОТАЮТ', -0.6, 1.85],
      ['20–40%\nГОДОВЫХ', 2.0, 3.85],
      ['ДОХОД\nКАЖДЫЙ ДЕНЬ', 4.0, 5.85],
      ['ВЫВОД\nВ ЛЮБОЙ МОМЕНТ', 6.0, 7.75],
    ]);
    // coins: 6 that pour into the safe, 3 that rise out of it (income), 3 that fly out (withdrawal)
    this.inC = [0, 1, 2, 3, 4, 5].map(i => ({ n: igCut('coin_usdt'), a: -100 + i * 63, t1: 1.62 + i * 0.05, r0: 360 + (i % 2) * 60 }));
    this.upC = [4.25, 4.75, 5.25].map((t0, i) => ({ n: igCut('coin_usdt'), t0, x: [-120, 110, -20][i] }));
    this.outC = [6.5, 6.75, 7.0].map(t0 => ({ n: igCut('coin_usdt'), t0 }));
    this.safe = igCut('pr_safe');
    this.apy = igCut('pr_apy');
    this.total = igCut('pr_staked');
    this.fc = igCut('pr_forecast');
    this.dep = igCut('st_deposit');
    igCues([4.0, 6.0]);
    this.inC.forEach(c => cue(Math.max(0, c.t1 - 0.6), 'whoosh', { dur: 0.5, gain: 0.18, pan: Math.cos(c.a * Math.PI / 180) * 0.7 }));
    [1.66, 1.78, 1.9].forEach(t => cue(t, 'coin', { gain: 0.3 }));
    cue(1.55, 'whoosh', { dur: 0.45, gain: 0.6 });
    cue(2.5, 'pop', { gain: 0.6, pitch: 0.8 }); cue(2.5, 'tick', { gain: 0.5 });
    cue(3.0, 'pop', { gain: 0.5, pitch: 1.0 });
    cue(4.0, 'whoosh', { dur: 0.4, gain: 0.45, pan: 0.6 }); cue(4.1, 'pop', { gain: 0.5, pitch: 1.1 });
    this.upC.forEach(c => cue(c.t0, 'coin', { gain: 0.45 }));
    cue(6.05, 'whoosh', { dur: 0.5, gain: 0.45, up: true }); cue(6.15, 'pop', { gain: 0.5, pitch: 0.9 });
    this.outC.forEach((c, i) => cue(c.t0, 'whoosh', { dur: 0.35, gain: 0.3, pan: 0.7 }));
    cue(7.75, 'whoosh', { dur: 0.4, gain: 0.8 });
  },
  update(t) {
    this.T.at(t);
    const all = [this.safe, this.apy, this.total, this.fc, this.dep, ...this.inC.map(c => c.n), ...this.upC.map(c => c.n), ...this.outC.map(c => c.n)];
    for (const n of all) n.set({ vis: false });
    if (t > IG.end + 0.15) return;
    const k = igKick(t), out = Ease.inExpo(prog(t, 7.75, 8.05));
    CAM.s = kf(t, [[0, 1.0], [1.9, 1.07, lin], [2.0, 1.0], [7.9, 1.05, lin]]) * (1 + 0.008 * k);
    // the safe: falls on the drop, squashes, settles; moves up a little for the last section
    const SY = 70;
    const up = Ease.inOutCubic(prog(t, 6.0, 6.6));
    const sy0 = lerp(SY, -60, up);
    if (t > 1.5) {
      const fall = Ease.inCubic(prog(t, 1.55, 2.0));
      const sq = t < 2.0 ? 0 : Math.exp(-(t - 2.0) / 0.12) * Math.cos((t - 2.0) * 26);
      this.safe.set({ vis: true, x: 0, y: lerp(-1800, sy0, fall) + out * 1600, z: 0, s: lerp(2.15, 1.75, up) * (1 + 0.012 * k),
        sx: 1 + 0.1 * sq, sy: 1 - 0.1 * sq, rz: Math.sin(t * 1.2) * 1.5 * prog(t, 2.2, 2.6), ry: Math.sin(t * 0.9) * 6 * prog(t, 2.2, 2.6) });
    }
    // hook: coins spiral into the spot where the safe lands
    this.inC.forEach(c => {
      if (t > c.t1 + 0.05) return;
      // they orbit the spot (popping in one by one), then spiral into it
      const pop = outBack(prog(t, -0.3 + c.a / 400, 0.05 + c.a / 400)), p = Ease.inCubic(prog(t, 0.9, c.t1));
      const a = (c.a + t * 70 + p * 160) * Math.PI / 180, r = lerp(c.r0, 0, p);
      c.n.set({ vis: true, x: Math.cos(a) * r, y: SY + (80 + Math.sin(a) * r * 0.75) * (1 - p), z: lerp(150, -40, p), s: lerp(2.5, 0.9, p) * clamp(pop, 0, 1.3), ry: t * 260 + c.a, o: 1 - prog(t, c.t1 - 0.04, c.t1 + 0.05) });
    });
    // 20–40% APY slams next to the safe; the total in staking under it
    if (t > 2.45 && t < 4.3) {
      const pop = outBack(prog(t, 2.5, 2.85)), off = Ease.inExpo(prog(t, 4.0, 4.3));
      this.apy.set({ vis: true, x: 200 + off * 1300, y: -250, z: 300, s: 2.4 * clamp(pop, 0, 1.3) * (1 + 0.015 * k), rz: lerp(-14, -5, pop) });
    }
    if (t > 2.95 && t < 4.3) {
      const pop = outBack(prog(t, 3.0, 3.35)), off = Ease.inExpo(prog(t, 4.0, 4.3));
      this.total.set({ vis: true, x: -off * 1300, y: 430, z: 200, s: 1.35 * clamp(pop, 0, 1.3) * (1 + 0.012 * k), rz: lerp(4, 0, pop) });
    }
    // the app's daily forecast + coins rising out of the safe
    if (t > 4.05 && t < 6.35) {
      const pop = outBack(prog(t, 4.1, 4.45)), off = Ease.inExpo(prog(t, 6.0, 6.3));
      this.fc.set({ vis: true, x: off * 1400, y: 440, z: 220, s: 1.8 * clamp(pop, 0, 1.3) * (1 + 0.012 * k), rz: lerp(-4, 0, pop) });
    }
    this.upC.forEach(c => {
      if (t < c.t0 || t > c.t0 + 1.2) return;
      const p = prog(t, c.t0, c.t0 + 1.2);
      c.n.set({ vis: true, x: c.x, y: lerp(SY - 290, SY - 560, Ease.outCubic(p)), z: 120, s: lerp(0.6, 1.6, Ease.outCubic(prog(p, 0, 0.3))), ry: t * 300, o: 1 - Ease.inCubic(prog(p, 0.6, 1)) });
    });
    // last section: the Liquid Vault deposit, coins fly out of the safe (withdrawal)
    if (t > 6.05) {
      const pop = oX(prog(t, 6.1, 6.6));
      this.dep.set({ vis: true, x: 0, y: lerp(1100, 380, pop) + out * 1600, z: 160, s: 0.98 * (1 + 0.01 * k), rz: lerp(6, 0, pop) });
    }
    this.outC.forEach(c => {
      if (t < c.t0 || t > c.t0 + 0.8) return;
      const p = Ease.inCubic(prog(t, c.t0, c.t0 + 0.8));
      c.n.set({ vis: true, x: lerp(230, 900, p), y: lerp(sy0 - 40, sy0 - 300, Math.sin(p * Math.PI / 2)), z: 300, s: lerp(0.8, 1.9, Math.min(1, p * 3)), ry: t * 320 });
    });
  },
});

endCard(IG.end, 'СТЕЙКИНГ USDT · 20–40% ГОДОВЫХ', IG.dur, 0.7);
