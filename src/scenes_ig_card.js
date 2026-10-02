// Instagram reel «Из крипты — в карту». 9:16, 11 s, 120 BPM.
// A USDT coin spins in and, edge-on, turns into the INCPT card on the drop; the card is topped up
// from USDT (the app's own operations: −$5,025 TRC-20 sent, +$5,000 received), pays (Starbucks,
// Nike) and slides into the card holder: virtual or metal.
'use strict';

igSetup(0);

scene({
  init() {
    this.T = new IgTitles([
      ['ИЗ КРИПТЫ —\nВ КАРТУ', -0.6, 1.85],
      ['ПОПОЛНИ\nИЗ USDT', 2.0, 3.85],
      ['ПЛАТИ\nКАРТОЙ INCPT', 4.0, 5.85],
      ['ВИРТУАЛЬНАЯ\nИЛИ МЕТАЛЛИЧЕСКАЯ', 6.0, 7.75, 112],
    ]);
    this.coin = igCut('coin_usdt');
    this.holder = igCut('pr_holder');
    this.card = igCut('pr_card');
    this.send = igCut('pr_op_topcard');
    this.recv = igCut('pr_op_topup');
    this.buy = [igCut('pr_op_starbucks'), igCut('pr_op_nike')];
    igCues([4.0, 6.0]);
    cue(0.02, 'whoosh', { dur: 0.8, gain: 0.5, up: true });
    cue(0.9, 'coin', { gain: 0.45 });
    cue(1.45, 'whoosh', { dur: 0.5, gain: 0.55, up: true });
    cue(2.1, 'whoosh', { dur: 0.45, gain: 0.5, pan: -0.6 });
    cue(2.9, 'whoosh', { dur: 0.35, gain: 0.45 });
    cue(3.2, 'coin', { gain: 0.55 }); cue(3.2, 'pop', { gain: 0.5, pitch: 0.9 });
    [4.0, 4.5].forEach((t, i) => { cue(t, 'pop', { gain: 0.55, pitch: 1 + i * 0.12 }); cue(t, 'tap', { gain: 0.45 }); });
    cue(6.0, 'whoosh', { dur: 0.45, gain: 0.5, pan: 0.6 });
    cue(6.1, 'whoosh', { dur: 0.6, gain: 0.45, up: true });
    cue(6.95, 'pop', { gain: 0.5, pitch: 0.75 });
    cue(7.75, 'whoosh', { dur: 0.4, gain: 0.8 });
  },
  update(t) {
    this.T.at(t);
    const on = t < IG.end + 0.15;
    for (const n of [this.coin, this.holder, this.card, this.send, this.recv, ...this.buy]) n.set({ vis: false });
    if (!on) return;
    const k = igKick(t);
    CAM.s = kf(t, [[0, 1.0], [1.9, 1.06, lin], [2.0, 1.0], [7.9, 1.05, lin]]) * (1 + 0.006 * k);
    const CY = 60, out = Ease.inExpo(prog(t, 7.75, 8.05));

    // ---- hook: the coin flies in spinning, settles, turns edge-on at 1.75
    if (t < 1.76) {
      const pin = oX(prog(t, -0.25, 0.9));
      let ry = lerp(-720, 0, pin) + Math.sin(t * 3.2) * 18 * prog(t, 0.9, 1.1);
      ry = lerp(ry, 90, Ease.inCubic(prog(t, 1.45, 1.75)));
      this.coin.set({ vis: true, x: 0, y: CY + (1 - pin) * 160 + Math.sin(t * 2.4) * 10, z: lerp(-1400, 0, pin), s: 3.7, ry, rz: lerp(-30, 0, pin), blur: (1 - pin) * 6 });
    }
    // ---- the card: edge-on at 1.75, faces the camera with an overshoot on the drop
    if (t >= 1.75 && t < 7.1) {
      let ry = lerp(-90, 0, outBack(prog(t, 1.75, 2.15)));
      const tilt = Math.sin(t * 1.3) * 4;
      // 6.3 – 7.0: down into the holder (behind its front)
      const pinH = Ease.inOutCubic(prog(t, 6.3, 7.0));
      this.card.set({ vis: true, x: 0, y: lerp(CY, 150, pinH), z: lerp(0, -60, pinH), s: lerp(0.95, 0.5, pinH) * (1 + 0.015 * k),
        ry: ry + tilt * (1 - pinH), rx: lerp(-6 + Math.cos(t * 1.1) * 3, 0, pinH), rz: lerp(-2, 3, pinH) });
    }
    // ---- top-up: the transfer flies in from the left and into the card; the received amount pops out
    if (t > 2.05 && t < 3.25) {
      const pin = oX(prog(t, 2.05, 2.6)), into = Ease.inCubic(prog(t, 2.9, 3.2));
      this.send.set({ vis: true, x: lerp(lerp(-1300, -30, pin), 0, into), y: lerp(-330, CY, into), z: lerp(220, -10, into), s: lerp(0.8, 0.2, into), rz: lerp(-8 * (1 - pin) - 2, 0, into), o: 1 - prog(t, 3.1, 3.2) });
    }
    if (t > 3.15 && t < 6.35) {
      const pop = outBack(prog(t, 3.15, 3.55)), off = Ease.inExpo(prog(t, 6.0, 6.3));
      this.recv.set({ vis: true, x: 20 + off * 1400, y: lerp(CY, -330, Ease.outCubic(prog(t, 3.15, 3.55))), z: 240, s: 0.82 * clamp(pop, 0, 1.2) * (1 + 0.015 * k), rz: lerp(4, -1.5, pop) });
    }
    // ---- purchases pop out of the card, one per beat
    this.buy.forEach((n, i) => {
      const t0 = 4.0 + i * 0.5;
      if (t < t0 || t > 6.35) return;
      const pop = outBack(prog(t, t0, t0 + 0.4)), off = Ease.inExpo(prog(t, 6.0 + i * 0.04, 6.3 + i * 0.04));
      n.set({ vis: true, x: lerp(0, i ? 40 : -40, pop) + (i ? 1 : -1) * off * 1500, y: lerp(CY, 320 + i * 140, Ease.outCubic(prog(t, t0, t0 + 0.4))), z: 260 + i * 40,
        s: 0.8 * clamp(pop, 0, 1.2) * (1 + 0.015 * k), rz: (i ? 1.5 : -1.5) * pop });
    });
    // ---- the holder rises from below for the last section, then everything leaves for the end card
    if (t > 6.0) {
      const rise = oX(prog(t, 6.0, 6.6));
      this.holder.set({ vis: true, x: 0, y: lerp(1300, 230, rise) + out * 1400, z: 0, s: 1.75 * (1 + 0.012 * k), rz: lerp(8, 0, rise) + Math.sin(t * 1.4) * 1.5, ry: Math.sin(t * 1.1) * 5 });
    }
  },
});

endCard(IG.end, 'КРИПТОКОШЕЛЁК И КАРТЫ В TELEGRAM', IG.dur, 0.7);
