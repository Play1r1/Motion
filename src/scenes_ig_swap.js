// Instagram reel «Обмен в один тап». 9:16, 11 s, 120 BPM. Every piece is vector (src/vec.js).
// The wallet's five coins orbit in 3D; on the drop USDT and BTC land in the swap screen's coin
// pills. The amount is typed (1,000 USDT ≈ 0.0119 BTC at the app's BTC price $83,992.01); every tap
// on ⇅ makes the coins trade places, as in the app. Then the rate and fees, row by row, and the
// wallet's three actions, one per beat.
'use strict';

igSetup(-2);

scene({
  init() {
    const cam = $('#cam');
    this.T = new IgTitles([
      ['5 МОНЕТ —\nОДИН КОШЕЛЁК', -0.6, 1.85],
      ['ОБМЕН\nВ ОДИН ТАП', 2.0, 3.85],
      ['КУРС И КОМИССИИ\nСРАЗУ ВИДНЫ', 4.0, 5.85, 116],
      ['ПОЛУЧАЙ\nОБМЕНИВАЙ\nОТПРАВЛЯЙ', 6.0, 7.75, 104, 0.5],
    ]);
    this.coins = ['usdt', 'usdc', 'btc', 'eth', 'trx'].map((sym, i) => ({ sym, n: new VCoin(cam, sym, 240), t0: -0.4 + i * 0.3, a: 90 + i * 72 }));
    this.shellA = new VSwapShell(cam, { W: 900, label: 'Отдаёте' });
    this.shellB = new VSwapShell(cam, { W: 900, label: 'Получаете' });
    this.usdt = new VSwapContent(cam, { W: 900, right: 'Баланс: 40,000.40 USDT', sym: 'usdt', code: 'USDT' });
    this.btc = new VSwapContent(cam, { W: 900, right: 'Баланс: 0.5 BTC', sym: 'btc', code: 'BTC' });
    this.btn = new VSwapBtn(cam, 150);
    this.table = new VTable(cam, { W: 900, rows: [
      ['Курс', '1 BTC ≈ 83,992.01 USDT'],
      ['Комиссия сети', '≈ $5.23 · нужно ≈ $6.28'],
      ['Комиссия обмена', 'В курсе', true],
      ['Вы получите', '≈ 0.0118 BTC'],
    ] });
    this.acts = [['recv', 'Получить'], ['swap', 'Обменять'], ['send', 'Отправить']].map(([icon, text], i) => ({ n: new VPill(cam, { icon, text, W: 560, H: 168 }), t0: 6.0 + i * 0.5 }));
    this.tap = new Tap(cam, 150);
    igCues([4.0, 6.0]);
    this.coins.forEach((c, i) => { if (c.t0 >= 0) { cue(c.t0, 'pop', { gain: 0.45, pitch: 0.9 + i * 0.08 }); cue(c.t0 + 0.05, 'coin', { gain: 0.25 }); } });
    cue(1.7, 'whoosh', { dur: 0.35, gain: 0.5 });
    [2.3, 2.42, 2.54, 2.66].forEach(t => cue(t, 'tick', { gain: 0.45 }));
    [3.0, 3.5].forEach(t => { cue(t, 'tap', { gain: 0.7 }); cue(t + 0.04, 'whoosh', { dur: 0.35, gain: 0.4 }); cue(t + 0.22, 'tick', { gain: 0.5 }); cue(t + 0.4, 'coin', { gain: 0.35 }); });
    cue(4.05, 'whoosh', { dur: 0.45, gain: 0.45, up: true });
    [4.25, 4.75, 5.25, 5.75].forEach(t => cue(t, 'tick', { gain: 0.4 }));
    this.acts.forEach((a, i) => { cue(a.t0, 'whoosh', { dur: 0.35, gain: 0.4, up: true, pan: -0.5 + i * 0.5 }); cue(a.t0 + 0.05, 'pop', { gain: 0.55, pitch: 0.9 + i * 0.1 }); cue(a.t0 + 0.32, 'tap', { gain: 0.35 }); });
    cue(7.75, 'whoosh', { dur: 0.4, gain: 0.8 });
  },
  update(t) {
    this.T.at(t);
    const parts = [this.shellA, this.shellB, this.usdt, this.btc, this.btn, this.table, ...this.coins.map(c => c.n), ...this.acts.map(a => a.n)];
    for (const n of parts) n.set({ vis: false });
    if (t > IG.end + 0.15) { this.tap.set({ vis: false }); return; }
    const k = igKick(t), out = Ease.inExpo(prog(t, 7.75, 8.05));
    CAM.s = kf(t, [[0, 1.0], [1.9, 1.05, lin], [2.0, 1.0], [7.9, 1.04, lin]]) * (1 + 0.005 * k);

    // ---- swap screen layout (shared by the hook's landing): panels around PY, shrink up for the table
    const S0 = 0.92, lift = Ease.inOutCubic(prog(t, 4.0, 4.5)), off = Ease.inExpo(prog(t, 6.0, 6.3));
    const sc = lerp(S0, 0.7, lift), PY = lerp(60, -150, lift), dy = 182 * sc;
    const yA = PY - dy, yB = PY + dy;
    const pin = outBack(prog(t, 1.95, 2.35)), ps = clamp(pin, 0, 1.15);
    const iconAt = (y, s) => [this.usdt.iconAt[0] * s, y + this.usdt.iconAt[1] * s];

    // ---- hook: the five coins pop in on a tilted orbit, spinning; USDT and BTC fly into the pills
    const CY = 70;
    this.coins.forEach(c => {
      if (t < c.t0 || t > 2.12) return;
      const pop = outBack(prog(t, c.t0, c.t0 + 0.4)), col = Ease.inCubic(prog(t, 1.7, 2.05));
      const a = (c.a + t * 55) * Math.PI / 180;
      let x = Math.cos(a) * 320, y = CY + Math.sin(a) * 150, z = Math.sin(a) * 260, s = clamp(pop, 0, 1.3);
      const ry = t * 140 + c.a, rx = 12;
      if (c.sym === 'usdt' || c.sym === 'btc') {
        const [tx, ty] = iconAt(c.sym === 'usdt' ? yA : yB, S0);
        x = lerp(x, tx, col); y = lerp(y, ty, col); z = lerp(z, 120, col); s = lerp(s, 68 * SWAP_K(900) * S0 / 240, col);
        c.n.set({ vis: true, x, y, z, s, ry: lerp(ry, Math.round(ry / 360) * 360, col), rx: lerp(rx, 0, col), o: 1 - prog(t, 2.04, 2.12) });
      } else {
        c.n.set({ vis: true, x: lerp(x, 0, col), y: lerp(y, CY, col), z: lerp(z, -400, col), s: s * (1 - col), ry, rx });
      }
      c.n.shine((t * 0.7 + c.a / 360) % 1);
    });

    if (t > 1.95 && t < 6.35) {
      // panels: burst in on the drop, then live; the coin content trades places on each tap
      const tilt = Math.sin(t * 1.1) * 3;
      this.shellA.set({ vis: true, x: -off * 1500, y: yA, z: 0, s: sc * ps * (1 + 0.006 * k), ry: tilt, rx: 2 });
      this.shellB.set({ vis: true, x: off * 1500, y: yB, z: 0, s: sc * ps * (1 + 0.006 * k), ry: tilt, rx: 2 });
      // each tap flips both panels' contents like a split-flap: out to 90°, the coins trade places, back in
      const flip = q => (q < 0.5 ? q * 2 : (1 - q) * 2);
      const q1 = Ease.inOutCubic(prog(t, 3.02, 3.42)), q2 = Ease.inOutCubic(prog(t, 3.52, 3.92));
      const q = q1 < 1 ? q1 : q2, swapped = (q1 >= 0.5) !== (q2 >= 0.5), ang = flip(q) * 90 * (q < 0.5 ? 1 : -1);
      const typed = ['0', '1', '10', '100', '1,000'][Math.min(4, Math.max(0, Math.floor((t - 2.3) / 0.12) + 1))];
      const done = t > 2.7;
      this.usdt.value(typed, typed === '0' ? '≈ $0.00' : `≈ $${typed}.00`, typed === '0');
      this.btc.value(done ? '0.0119' : '0', done ? '≈ $1,000.00' : '≈ $0.00', !done);
      const cs = sc * ps * (1 + 0.006 * k);
      this.usdt.set({ vis: true, x: -off * 1500, y: swapped ? yB : yA, z: 12, s: cs, sy: Math.max(0.02, Math.cos(ang * Math.PI / 180)), ry: tilt, rx: 2 });
      this.btc.set({ vis: true, x: off * 1500, y: swapped ? yA : yB, z: 12, s: cs, sy: Math.max(0.02, Math.cos(ang * Math.PI / 180)), ry: tilt, rx: 2 });
      const rot = 180 * (Ease.inOutCubic(prog(t, 3.0, 3.38)) + Ease.inOutCubic(prog(t, 3.5, 3.88)));
      const bp = outBack(prog(t, 2.05, 2.4));
      this.btn.set({ vis: true, x: 0, y: PY, z: 40, s: lerp(1, 0.75, lift) * clamp(bp, 0, 1.2) * (1 - 0.1 * (press(t, 3.0) + press(t, 3.5))) * (1 - off), rz: rot });
      this.tap.at(t, t < 3.25 ? 3.0 : 3.5, 0, PY, 60);
    } else this.tap.set({ vis: false });

    // ---- rate and fees: the table slides up, a highlight walks its rows on the beat
    if (t > 4.0 && t < 6.35) {
      const tp = oX(prog(t, 4.05, 4.55));
      this.table.set({ vis: true, x: 0, y: lerp(1300, 400, tp) + off * 1500, z: 30, s: 0.84 * (1 + 0.006 * k), ry: Math.sin(t * 1.1) * 2, rx: 2 });
      const row = Math.floor((t - 4.25) / 0.5), glide = Ease.inOutCubic(prog((t - 4.25) % 0.5, 0, 0.22));
      this.table.mark(row <= 0 ? 0 : row - 1 + glide, t < 4.25 ? 0 : 1 - prog(t, 5.95, 6.1));
    }
    // ---- Получай · Обменивай · Отправляй: one big button per beat, each pressed
    this.acts.forEach((a, i) => {
      if (t < a.t0) return;
      const pop = outBack(prog(t, a.t0, a.t0 + 0.35));
      a.n.set({ vis: true, x: [-150, 0, 150][i], y: [-140, 90, 320][i] + out * 1600, z: 120 + i * 30,
        s: 0.9 * clamp(pop, 0, 1.3) * (1 - 0.05 * press(t, a.t0 + 0.32)) * (1 + 0.012 * k), rz: [-4, 2, -2][i] * pop, ry: Math.sin(t * 1.3 + i) * 6 });
    });
  },
});

endCard(IG.end, 'ОБМЕН КРИПТЫ В ПАРУ ТАПОВ', IG.dur, 0.7);
