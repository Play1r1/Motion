// «Из крипты — в карту» — Instagram, 9:16, real 3D (src/kit3d.js), its own airy 110 BPM track.
// USDT coins spiral into a Liquid Glass lens and the holographic INCPT card (the app's own foil) comes out of
// it on the drop; the app's own operation rows float under it in Liquid Glass (−$5,025 ERC-20 sent,
// +$5,000 received; Starbucks −$18.50, Nike −$249.90); the metal card joins it; the site's lock-up closes.
// Timed in bars of the track; laid out in frame pixels (L), so the safe areas hold.
'use strict';

const BAR = 4 * (60 / 110);                      // the track: 110 BPM, its drop on bar 2 of the edit
const S = n => n * BAR;                          // bar n -> seconds
DURATION = S(10) + 0.6;
META = { drop: S(2), end: S(8), bpm: 110, musicEdit: 'assets/music/x_card_edit.json', sfxGain: 0.4, sfxOnly: ['whoosh', 'tap', 'tick'] };
const oC = Ease.outCubic, iC = Ease.inCubic, oE = Ease.outExpo;
const SHOW = { stagger: 0.12, dur: 0.75, dy: 0.25, blur: 6, outDur: 0.25, outStagger: 0.02, outDy: -0.12 };
const T2 = (text, y, size, o = {}) => new WText(text, { y, size, fit: 960, track: -0.02, ...o });
function win(txt, t, tin, tend, tout = null, opts = {}) {
  if (t >= tend || t < tin - 0.01) { txt.el.style.display = 'none'; return; }
  txt.at(t, tin, tout, { ...SHOW, ...opts });
}
// frame pixels -> scene units at depth z (the camera's rest position: z 16, fov 26)
const CAMZ = 16, L = (px, py, z) => { const u = 2 * (CAMZ - z) * Math.tan(13 * Math.PI / 180) / 1920; return { x: (px - 540) * u, y: (960 - py) * u, u }; };
const wob = (t, t0, a = 0.05, f = 9, d = 3.2) => (t > t0 ? Math.exp(-(t - t0) * d) * Math.sin((t - t0) * f) * a : 0);   // a liquid settle

scene({
  init() {
    K3.init({ camZ: CAMZ, shadowOpacity: 0.07 });
    this.lens = K3.add(makeLens(1.5, { thick: 0.95 }));
    this.coins = [0, 1, 2, 3, 4].map(() => K3.add(makeCoin('usdt')));
    this.card = K3.add(makeCard({}));
    this.metal = K3.add(makeCard({ metal: true, sub: 'Металлическая', last: '1934' }));
    // the app's operations (its list, verbatim)
    this.rows = [
      makeOpRow({ title: 'Пополнение карты', chip: 'ERC-20', chipX: 0.62, sub: '8 окт., 16:42 · 0x7...F2c', amount: '−$5,025', status: 'Отправлено' }),
      makeOpRow({ title: 'Пополнение', chip: 'Карта', sub: '8 окт., 16:43', amount: '+$5,000', status: 'Получено', dir: 'in' }),
      makeOpRow({ title: 'Starbucks', chip: 'Карта', sub: '10 окт., 16:35', amount: '−$18.50', status: 'Отправлено' }),
      makeOpRow({ title: 'Nike', chip: 'Карта', sub: '9 окт., 17:06', amount: '−$249.90', status: 'Отправлено' }),
    ].map(r => K3.add(r));
    this.h = [
      [T2('Из крипты —\nв ~карту', 190, 120), -0.1, S(2)],
      [T2('Пополни\nиз ~USDT', 190, 120), S(2), S(4)],
      [T2('Плати\nкартой ~INCPT', 190, 120), S(4), S(6)],
      [T2('Виртуальные\nи ~металлическая', 190, 108), S(6), S(8)],
    ];
    cue(0.2, 'whoosh', { dur: 1.2, gain: 0.2, up: true });
    cue(S(2) - 0.12, 'whoosh', { dur: 0.6, gain: 0.4, up: true });
    [S(2.5), S(3)].forEach(t => cue(t - 0.1, 'whoosh', { dur: 0.4, gain: 0.2 }));
    cue(S(4) + 0.3, 'tap', { gain: 0.45 });
    [S(4.5), S(5)].forEach(t => cue(t - 0.1, 'whoosh', { dur: 0.4, gain: 0.2 }));
    cue(S(6) + 0.1, 'whoosh', { dur: 0.6, gain: 0.3 });
  },
  update(t) {
    this.h.forEach(([h, a, b], i) => win(h, t, a + (i ? 0.1 : 0.35), b, b - 0.3));
    const end = iC(prog(t, S(8) - 0.5, S(8) + 0.12));               // the cards part and open the end card
    // ---- the lens: forms like a drop, holds while the coins spiral in, gives way to the card on the drop
    const LP = L(540, 930, 1.2);
    const lf = oE(prog(t, 0.0, 1.2)), lo = iC(prog(t, S(2) + 0.05, S(2) + 0.8));
    const lw = wob(t, 0.3, 0.07) + wob(t, S(2) - 0.2, 0.05, 11);
    K3.pose(this.lens, { x: LP.x, y: LP.y, z: 1.2, rx: 5 * Math.sin(t * 0.7), ry: 7 * Math.sin(t * 0.5), s: lerp(0.3, 1, lf) * (1 - lo), vis: lo < 0.999 });
    this.lens.scale.set(this.lens.scale.x * (1 + lw), this.lens.scale.y * (1 - lw), this.lens.scale.z);
    // ---- USDT coins spiral in behind the lens and are absorbed (the lens bends them as they pass)
    this.coins.forEach((c, i) => {
      const t0 = 0.25 + i * 0.3, t1 = S(2) - 0.3 - (4 - i) * 0.05, p = prog(t, t0, t1), e = Ease.inOutSine(p);
      const ang = i * 1.256 + 1.7 - e * 3.6, rad = lerp(3.0, 0.04, oC(p));
      K3.pose(c, { x: LP.x + Math.cos(ang) * rad * 0.8, y: LP.y + Math.sin(ang) * rad, z: lerp(-0.4, -1.8, e), rx: 16, ry: 30 + t * 150 + i * 50, rz: 8,
        s: lerp(0.46, 0.12, Ease.inCubic(p)), vis: p > 0 && p < 1 });
    });
    // ---- the holographic card: out of the lens on the drop, then the hero
    const cin = oE(prog(t, S(2) - 0.15, S(2) + 1.2));
    const tap = Math.sin(Math.PI * prog(t, S(4) + 0.05, S(4) + 0.95));         // the tap-to-pay dip
    const fan = Ease.inOutCubic(prog(t, S(6), S(6) + 1.1));
    const HERO = L(540, 745, 1.6), FAN = L(420, 790, 1.6);
    K3.pose(this.card, {
      x: lerp(LP.x, HERO.x, cin) * (1 - fan) + FAN.x * fan - end * 3.2,
      y: lerp(LP.y, HERO.y, cin) * (1 - fan) + FAN.y * fan + end * 2.6,
      z: lerp(-2.4, 1.6, cin) + tap * 0.45 - fan * 0.4 + end * 4,
      rx: lerp(-35, -9, cin) - tap * 24 + Math.sin(t * 0.8) * 2.5,
      ry: lerp(210, -14, cin) + Math.sin(t * 0.55) * 7 + fan * 10,
      rz: lerp(-25, -3, cin) - fan * 5,
      s: lerp(0.3, 0.78, cin) * lerp(1, 0.9, fan), vis: t > S(2) - 0.15 && end < 1 });
    // ---- the metal card slides out from behind it for «виртуальные и металлическая»
    const mi = oE(prog(t, S(6) + 0.25, S(6) + 1.6)), MET = L(640, 1130, 2.0);
    K3.pose(this.metal, { x: lerp(FAN.x, MET.x, mi) + end * 3.2, y: lerp(FAN.y, MET.y, mi) - end * 3.2, z: lerp(0.4, 2.0, mi) + end * 4, rx: -9 + Math.sin(t * 0.7) * 2,
      ry: lerp(-30, -18, mi) + Math.sin(t * 0.5 + 1) * 6, rz: lerp(-5, 6, mi), s: 0.66, vis: t > S(6) + 0.25 && end < 1 });
    // ---- glass rows: two per section, one per accent; out before the next section
    const rowAt = (r, t0, t1, py) => {
      const P = L(540, py, 2.6), a = oE(prog(t, t0, t0 + 1.0)), b = iC(prog(t, t1 - 0.4, t1));
      K3.pose(r, { x: P.x + (1 - a) * 3.6 - b * 3.6, y: P.y + (1 - a) * -0.15, z: 2.6, rx: -3 + Math.sin(t * 0.9) * 1.2, ry: (1 - a) * -28 + b * 18 - 3 + Math.sin(t * 0.6) * 2, rz: 0,
        s: 0.95, vis: t > t0 && t < t1 });
    };
    rowAt(this.rows[0], S(2.5), S(4), 1205);
    rowAt(this.rows[1], S(3), S(4), 1405);
    rowAt(this.rows[2], S(4.5), S(6), 1205);
    rowAt(this.rows[3], S(5), S(6), 1405);
    // a slow camera breath
    K3.cam.position.set(Math.sin(t * 0.25) * 0.12, Math.cos(t * 0.2) * 0.08, CAMZ - Math.sin(Math.PI * prog(t, 0, S(8))) * 0.5);
    K3.cam.lookAt(K3.cam.position.x * 0.5, K3.cam.position.y * 0.5, 0);
    K3.render();
  },
});

endCard(S(8), 'Криптокошелёк и карты в Telegram', DURATION, 0.7);
