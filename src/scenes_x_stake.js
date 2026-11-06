// «Пусть USDT работает» — Instagram, 9:16, real 3D. Its own world: the warm studio (an amber wall on the
// left, a cool strip on the right, as the app's safe is lit), a precise, mechanical motion language (the
// dial ticks on the beat, tiles snap in on the beat), its own 92 BPM track that breathes before the drop and
// ends on a ringing chord. The app's safe, modelled in 3D: a macro on its dial pulls back to the whole safe
// on the drop; the app's Liquid / Monthly / Maximum control in Liquid Glass; the app's deposit card with its
// forecast counting up. Timed in bars of the track, laid out in frame pixels (K3.L).
'use strict';

const BAR = 4 * 60 / 92.29, BT = BAR / 4;
const S = n => n * BAR;
DURATION = 26.3;
META = { drop: S(2), end: S(8), bpm: 92, musicEdit: 'assets/music/x_stake_edit.json', sfxGain: 0.4, sfxOnly: ['whoosh', 'tap', 'tick'] };
const oE = Ease.outExpo, iC = Ease.inCubic;
const SHOW = { stagger: 0.06, dur: 0.6, dy: 0.5, blur: 0, outDur: 0.22, outStagger: 0.02, outDy: -0.25 };   // crisp, mechanical
const T2 = (text, y, size) => new WText(text, { y, size, fit: 960, track: -0.02 });
function win(txt, t, tin, tend, tout) {
  if (t >= tend || t < tin - 0.01) { txt.el.style.display = 'none'; return; }
  txt.at(t, tin, tout, SHOW);
}

// the app's segmented control, one Liquid Glass tile per mode (Liquid is the one selected, as in the app)
const ICON = {
  liquid: (g, s) => { g.beginPath(); g.moveTo(0, -0.5 * s); g.bezierCurveTo(0.12 * s, -0.3 * s, 0.38 * s, -0.05 * s, 0.38 * s, 0.14 * s);
    g.arc(0, 0.14 * s, 0.38 * s, 0, Math.PI); g.bezierCurveTo(-0.38 * s, -0.05 * s, -0.12 * s, -0.3 * s, 0, -0.5 * s); g.stroke(); },
  monthly: (g, s) => { g.beginPath(); g.arc(0, 0.2 * s, 0.45 * s, Math.PI * 1.08, Math.PI * 1.92); g.stroke();
    g.beginPath(); g.moveTo(0, 0.2 * s); g.lineTo(0.2 * s, -0.08 * s); g.stroke(); },
  maximum: (g, s) => { g.beginPath(); g.moveTo(-0.5 * s, 0.3 * s); g.lineTo(-0.12 * s, -0.06 * s); g.lineTo(0.1 * s, 0.14 * s); g.lineTo(0.48 * s, -0.26 * s); g.stroke();
    g.beginPath(); g.moveTo(0.22 * s, -0.27 * s); g.lineTo(0.49 * s, -0.27 * s); g.lineTo(0.49 * s, 0.0); g.stroke(); },
};
function makeTile(kind, label, on) {
  return makeGlass(0.9, 0.64, { depth: 0.16, radius: 0.13, px: 560, frost: on ? 0.82 : 0.5, content: (g, w, h) => {
    const col = on ? '#2fae52' : '#8b9099';
    if (on) { g.strokeStyle = 'rgba(47,174,82,0.55)'; g.lineWidth = 0.035 * h; g.beginPath(); g.roundRect(0.035 * h, 0.035 * h, w - 0.07 * h, h - 0.07 * h, 0.17 * h); g.stroke(); }
    g.save(); g.translate(w / 2, 0.36 * h); g.strokeStyle = col; g.lineWidth = 0.045 * h; g.lineCap = 'round'; g.lineJoin = 'round'; ICON[kind](g, 0.3 * h); g.restore();
    g.fillStyle = col; g.font = `${on ? 600 : 500} ${0.17 * h}px "Inter Variable"`; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText(label, w / 2, 0.72 * h);
  } });
}
// the app's «Ваши депозиты» card; its forecast line is live (counts up)
function makeDeposit(state) {
  return makeGlass(2.9, 1.36, { depth: 0.2, radius: 0.2, px: 470, frost: 0.78, content: (g, w, h) => {
    const F = '"Inter Variable"';
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillStyle = '#121318'; g.font = `600 ${0.115 * h}px ${F}`; g.fillText('Liquid Vault', w / 2, 0.2 * h);
    g.font = `700 ${0.17 * h}px ${F}`; g.fillText('20,000.00 USDT', w / 2, 0.41 * h);
    g.fillStyle = '#5c6270'; g.font = `400 ${0.105 * h}px ${F}`; g.fillText('Депозит активен', w / 2, 0.61 * h);
    g.fillStyle = '#2fae52'; g.font = `500 ${0.112 * h}px ${F}`; g.fillText('Прогноз сегодня ≈ $' + state.fc.toFixed(2), w / 2, 0.8 * h);
  } });
}

scene({
  init() {
    K3.init({ envOpts: { warm: 4.6, cool: 3.5, front: 0.15, flag: 1, horizon: 0.22, floor: 0.08 }, keyPos: [-3, 14, 3.5], keyI: 1.6, fillI: 0, shadowOpacity: 0.0 });
    K3.backdrop.visible = false;
    // a floor that only catches the safe's shadow: it stands on something
    this.safe = K3.add(makeSafe());
    this.floor = new THREE.Mesh(new THREE.PlaneGeometry(12, 9), new THREE.ShadowMaterial({ opacity: 0.16, depthWrite: false }));
    this.floor.rotation.x = -Math.PI / 2; this.floor.position.set(0.4, -1.16, -0.2); this.floor.receiveShadow = true;
    this.safe.add(this.floor);          // it tilts with the safe, so its contact shadow reads as a soft pool
    this.tiles = [['liquid', 'Liquid', true], ['monthly', 'Monthly', false], ['maximum', 'Maximum', false]].map(a => K3.add(makeTile(...a)));
    this.state = { fc: 0, shown: '' };
    this.dep = K3.add(makeDeposit(this.state));
    this.h = [
      [T2('Пусть ~USDT\nработает', 190, 124), 0.35, S(2)],
      [T2('От ~20 ~до ~100%\nгодовых', 190, 124), S(2) + 0.1, S(5)],
      [T2('Прогноз дохода\n~каждый день', 190, 116), S(5) + 0.1, S(8)],
    ];
    for (let k = 0; k < 8; k++) cue(k * BT + 0.02, 'tick', { gain: k % 4 ? 0.22 : 0.32 });   // the dial, on the beat
    cue(S(2) - 0.05, 'tap', { gain: 0.4 });                                                     // it unlocks on the drop
    [0, 1, 2].forEach(k => cue(S(2) + (1 + k) * BT, 'tick', { gain: 0.3 }));                 // the tiles snap in
    cue(S(5) + 0.1, 'whoosh', { dur: 0.5, gain: 0.25 });
    cue(S(8) - 0.45, 'whoosh', { dur: 0.6, gain: 0.3 });
  },
  update(t) {
    this.h.forEach(([h, a, b]) => win(h, t, a, b, b - 0.3));
    const end = iC(prog(t, S(8) - 0.5, S(8) + 0.15));
    // ---- the safe: a macro on the dial (it ticks on every beat), a decisive pull-back to the whole safe that
    // lands on the drop, a slow turn on the hold, a lift for the deposit card, then it drops away
    const pull = ioC(prog(t, S(1) + 0.1, S(2) + 0.05)), lift = ioC(prog(t, S(5), S(5) + 1.0));
    const MAC = K3.L(540, 1110, 8.2 + 1.15), HERO = K3.L(540, 800, 0), UP = K3.L(540, 690, 0);
    const hx = lerp(HERO.x, UP.x, lift), hy = lerp(HERO.y, UP.y, lift), hs = lerp(1, 0.84, lift);
    const sy = lerp(MAC.y, hy, pull) - end * 6;
    K3.pose(this.safe, { x: lerp(MAC.x, hx, pull), y: sy, z: lerp(8.2, 0, pull), rx: lerp(0, 8, pull) + end * 25,
      ry: lerp(0, 27, pull) - 9 * prog(t, S(2), S(8)) + Math.sin(t * 0.5) * 1.5 * pull, rz: 0, s: lerp(1, hs, pull), vis: end < 1 });
    const k = Math.floor(t / BT), f = oE(clamp((t - k * BT) / 0.16));
    const ticks = Math.min(k + f, 8);                                           // ticks stop for the pull-back
    this.safe.dial.rotation.z = -ticks * Math.PI / 12 - oE(prog(t, S(2) - 0.05, S(2) + 0.9)) * Math.PI * 4 / 3;   // 8 ticks of 15° + the unlock = one full turn: the mark ends upright, as in the app
    // ---- the three modes snap in on the beats after the drop, and step away for the deposit
    this.tiles.forEach((tl, i) => {
      const t0 = S(2) + (1 + i) * BT, a = oE(prog(t, t0, t0 + 0.7)), b = iC(prog(t, S(5) - 0.4 + i * 0.06, S(5) + i * 0.06));
      const P = K3.L(540 + (i - 1) * 300, 1310, 2.6);
      K3.pose(tl, { x: P.x, y: P.y - (1 - a) * 0.45 - b * 2.5, z: 2.6, rx: -6 + (1 - a) * 30, ry: (i - 1) * -6 + Math.sin(t * 0.7 + i) * 2, rz: 0,
        s: lerp(0.86, 1, a), vis: t > t0 && b < 1 });
    });
    // ---- the deposit card rises in front, its forecast counts up to today's
    const da = oE(prog(t, S(5) + 0.2, S(5) + 1.2)), DP = K3.L(540, 1225, 2.6);
    K3.pose(this.dep, { x: DP.x, y: DP.y - (1 - da) * 0.8 - end * 6, z: 2.6, rx: -5 + (1 - da) * 25 + end * 20, ry: Math.sin(t * 0.6) * 2.5, rz: 0, s: 0.98,
      vis: t > S(5) + 0.2 && end < 1 });
    this.state.fc = 14.42 * Ease.outCubic(prog(t, S(5) + 0.9, S(5) + 2.6));
    const shown = this.state.fc.toFixed(2);
    if (shown !== this.state.shown) { this.state.shown = shown; this.dep.print.material.map.redraw(); }
    // a slow camera drift
    K3.cam.position.set(Math.sin(t * 0.21) * 0.1, Math.cos(t * 0.17) * 0.06, 16);
    K3.cam.lookAt(K3.cam.position.x * 0.5, K3.cam.position.y * 0.5, 0);
    K3.render();
  },
});

endCard(S(8), 'Криптокошелёк и стейкинг в Telegram', DURATION, 0.7);
