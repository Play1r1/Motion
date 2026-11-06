// «Всё для крипты — в одном кошельке» — the product promo, 9:16, real 3D. Its own world: one continuous camera
// that trucks along a shelf of the product, station by station, whip-fast on the bar lines and still on the
// holds. It opens on the INCPT mark in 3D (the logo's silhouette and fluting, iridescent chrome) ringed by the
// five coins of the wallet; on the drop the camera whips to the cards, then to the staking safe, then to the
// swap; at the end the mark comes back and lands exactly where the end card's logo appears, and hands over.
// Its own track: the first take of the 120 BPM piece (a build, the drop on bar 4), the groove looped once on
// the swap, its own decay under the end card.
'use strict';

const BAR = 4 * 60 / 120.19, BT = BAR / 4;
const S = n => n * BAR;
DURATION = 30.0;
META = { drop: S(4), end: S(12), bpm: 120, musicEdit: 'assets/music/x_promo_edit.json', sfxGain: 0.4, sfxOnly: ['whoosh', 'tap', 'tick'] };
const oE = Ease.outExpo, iC = Ease.inCubic;
const SHOW = { stagger: 0.07, dur: 0.6, dy: 0.0, blur: 10, outDur: 0.18, outStagger: 0.0, outDy: 0.0 };   // a focus pull, no travel: the camera moves enough
const T2 = (text, y, size) => new WText(text, { y, size, fit: 960, track: -0.02 });
function win(txt, t, tin, tend, tout) {
  if (t >= tend || t < tin - 0.01) { txt.el.style.display = 'none'; return; }
  txt.at(t, tin, tout, SHOW);
}
const SX = 9;                                         // the stations, along x
const STATIONS = [0, S(4), S(6), S(9), S(12) - 0.6];  // the whips land on these bar lines (the last one early: the mark lands on the end card's bar line)
const F = '"Inter Variable"';
function makePill(text, col = '#2fae52', w = 2.5) {
  return makeGlass(w, 0.5, { depth: 0.14, radius: 0.25, px: 520, frost: 0.82, content: (g, w, h) => {
    g.fillStyle = col; g.font = `500 ${0.36 * h}px ${F}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, w / 2, 0.53 * h);
  } });
}

scene({
  init() {
    K3.init({ envOpts: { warm: 3.6, cool: 3.5, front: 0.3, flag: 1, horizon: 0.3, floor: 0.1 }, keyPos: [-3, 14, 3.5], keyI: 1.7, fillI: 0, shadowOpacity: 0.0 });
    K3.backdrop.visible = false;
    this.mark = K3.add(makeLogoMark());
    this.coins = ['usdt', 'usdc', 'btc', 'eth', 'trx'].map(k => K3.add(makeCoin(k, { metal: k === 'btc' ? 'gold' : 'silver' })));
    this.card = K3.add(makeCard({}));
    this.metal = K3.add(makeCard({ metal: true, sub: 'Металлическая', last: '1934' }));
    this.row = K3.add(makeOpRow({ title: 'Starbucks', chip: 'Карта', sub: '10 окт., 16:35', amount: '−$18.50', status: 'Отправлено' }));
    this.safe = K3.add(makeSafe());
    const fl = new THREE.Mesh(new THREE.PlaneGeometry(12, 9), new THREE.ShadowMaterial({ opacity: 0.16, depthWrite: false }));
    fl.rotation.x = -Math.PI / 2; fl.position.set(0.4, -1.16, -0.2); fl.receiveShadow = true; this.safe.add(fl);
    this.pill = K3.add(makePill('⚡ прогноз $14.42 сегодня'));
    this.pair = [K3.add(makeCoin('usdt')), K3.add(makeCoin('btc', { metal: 'gold' }))];
    this.swapPill = K3.add(makePill('Отдаёте USDT ⇅ получаете BTC', '#121318', 3.0));
    this.h = [
      [T2('Всё для крипты —\n~в одном кошельке', 190, 112), 0.4, S(4)],
      [T2('Карты ~INCPT', 220, 124), S(4) + 0.15, S(6)],
      [T2('Стейкинг: от ~20\n~до ~100% годовых', 190, 112), S(6) + 0.15, S(9)],
      [T2('Обмен\n~внутри кошелька', 190, 120), S(9) + 0.15, S(12)],
    ];
    STATIONS.slice(1).forEach(t => cue(t - 0.3, 'whoosh', { dur: 0.5, gain: 0.35 }));
    cue(S(9) + 0.55, 'tap', { gain: 0.35 });
  },
  update(t) {
    this.h.forEach(([h, a, b]) => win(h, t, a, b, b - 0.22));
    // ---- the camera: holds at a station, whips to the next on the bar line (0.7 s, centred on it)
    let cx = 0;
    STATIONS.forEach((t0, k) => { if (k) cx += SX * Ease.inOutCubic(prog(t, t0 - 0.35, t0 + 0.35)); });
    const br = 1 - prog(t, S(12) - 1.6, S(12) - 0.7);      // the breath settles before the hand-over, so the mark lands on the pixel
    K3.cam.position.set(cx + Math.sin(t * 0.25) * 0.08 * br, Math.cos(t * 0.2) * 0.05 * br, 16 + 2.2 * (1 - Ease.outCubic(prog(t, 0, S(4)))));
    K3.cam.lookAt(K3.cam.position.x, K3.cam.position.y * 0.5, 0);
    K3.key.position.set(cx - 3, 14, 3.5); K3.key.target.position.set(cx, 0, 0); K3.key.target.updateMatrixWorld();
    const at = (k, px, py, z) => { const p = K3.L(px, py, z); return { x: p.x + k * SX, y: p.y, z }; };
    const vis = k => t > STATIONS[k] - 0.8 && (k === 4 || t < STATIONS[k + 1] + 0.8);
    // ---- station 0: the mark, ringed by the wallet's five coins
    const M0 = at(0, 540, 900, 0), sp = oE(prog(t, S(4) - 0.4, S(4) + 0.6));
    const land = Ease.outCubic(prog(t, S(12) - 0.7, S(12))), M4 = at(4, 272, 760, 4);
    const markOn = t < S(4) + 0.6 || t > S(12) - 0.8;
    if (t < S(8)) K3.pose(this.mark, { x: M0.x, y: M0.y, z: 0, rx: 4, ry: Math.sin(t * 0.6) * 28 + sp * 360, rz: 0, s: 1.6, vis: markOn && vis(0) });
    else K3.pose(this.mark, { x: lerp(M4.x + 1.5, M4.x, land), y: lerp(M4.y - 2.2, M4.y, land), z: lerp(-6, 4, land), rx: lerp(25, 0, land), ry: lerp(-200, 0, land), rz: 0,
      s: 0.65, vis: markOn && t < S(12) + 0.25 });
    this.coins.forEach((c, i) => {
      const a = i / 5 * Math.PI * 2 + t * 0.55, R = 1.75 + oE(prog(t, S(4) - 0.35, S(4) + 0.4)) * 6;
      K3.pose(c, { x: M0.x + Math.cos(a) * R, y: M0.y + Math.sin(a) * R * 0.28, z: Math.sin(a) * R * 0.9, rx: 10, ry: -a * 57 + 90 + t * 40, rz: 6, s: 0.42, vis: vis(0) && t < S(4) + 0.4 });
    });
    // ---- station 1: the cards, a payment row under them
    const C1 = at(1, 540, 760, 1.6), M1 = at(1, 650, 860, 0.6), fan = oE(prog(t, S(4) + 0.2, S(4) + 1.4));
    K3.pose(this.card, { x: C1.x - fan * 0.35, y: C1.y + fan * 0.1, z: 1.6, rx: -9 + Math.sin(t * 0.8) * 2, ry: -14 + Math.sin(t * 0.55) * 7, rz: -3 - fan * 4, s: 0.74, vis: vis(1) });
    K3.pose(this.metal, { x: M1.x + fan * 0.25, y: M1.y - fan * 0.25, z: 0.6, rx: -8, ry: -22 + Math.sin(t * 0.5 + 1) * 5, rz: 4 + fan * 4, s: 0.66 * (0.6 + 0.4 * fan), vis: vis(1) && fan > 0.01 });
    const R1 = at(1, 540, 1290, 2.6), ra = oE(prog(t, S(4) + 0.6, S(4) + 1.5));
    K3.pose(this.row, { x: R1.x, y: R1.y - (1 - ra) * 0.5, z: 2.6, rx: -4 + (1 - ra) * 25, ry: Math.sin(t * 0.6) * 2, s: 0.95, vis: vis(1) && ra > 0.01 });
    // ---- station 2: the safe and its forecast
    const SF = at(2, 540, 800, 0);
    this.safe.dial.rotation.z = -oE(prog(t, S(6), S(6) + 1.0)) * Math.PI * 2;
    K3.pose(this.safe, { x: SF.x, y: SF.y, z: 0, rx: 8, ry: 24 - 6 * prog(t, S(6), S(9)) + Math.sin(t * 0.5) * 1.5, s: 1, vis: vis(2) });
    const P2 = at(2, 540, 1290, 2.6), pa = oE(prog(t, S(6) + 0.5, S(6) + 1.4));
    K3.pose(this.pill, { x: P2.x, y: P2.y - (1 - pa) * 0.5, z: 2.6, rx: -4 + (1 - pa) * 25, ry: Math.sin(t * 0.6) * 2, s: 1, vis: vis(2) && pa > 0.01 });
    // ---- station 3: USDT and BTC trade places
    const C3 = at(3, 540, 830, 0.8), tr = oE(prog(t, S(9) + 0.5, S(9) + 1.3)) * Math.PI;
    this.pair.forEach((c, i) => {
      const a = tr + i * Math.PI + Math.sin(t * 0.7) * 0.06;
      K3.pose(c, { x: C3.x + Math.cos(a) * 0.95, y: C3.y + Math.sin(a) * 0.25, z: 0.8 + Math.sin(a) * 1.0, rx: 10, ry: -20 + Math.sin(t * 0.8 + i) * 12, rz: 0, s: 0.68, vis: vis(3) });
    });
    const P3 = at(3, 540, 1290, 2.6), qa = oE(prog(t, S(9) + 0.9, S(9) + 1.8));
    K3.pose(this.swapPill, { x: P3.x, y: P3.y - (1 - qa) * 0.5, z: 2.6, rx: -4 + (1 - qa) * 25, ry: Math.sin(t * 0.6) * 2, s: 1, vis: vis(3) && qa > 0.01 });
    K3.render();
  },
});

endCard(S(12), 'Криптокошелёк, карты и стейкинг в Telegram', DURATION, 0.7, { sharp: true });
