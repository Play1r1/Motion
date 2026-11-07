// «Обмен внутри кошелька» — Instagram, 9:16, 18 s, kinetic from the first frame on the second take of the
// 120 BPM track, which ends on its own stop (assets/music/x_swap_edit.json). No home-made 3D: the app's swap
// screen in real pieces (Отдаёте / Получаете, the ↓↑ button, 25% · 50% · 75% · Макс, the fee lines). Its own
// idea and motion — pairs and turns: USDT and BTC orbit inside two liquid-glass lenses and trade places on
// the drop; the lenses stretch into the panels' sockets and each coin lands exactly on its icon in the real
// panel; the button spins on the beat; the screen turns away like a page at the end.
'use strict';

const BAR = 4 * 60 / 120.19, BT = BAR / 4;
const S = n => n * BAR;
DURATION = 17.75;
META = { drop: S(2), end: S(6), bpm: 120, musicEdit: 'assets/music/x_swap_edit.json', sfxGain: 0.45, sfxOnly: ['whoosh', 'tap', 'tick'] };
const oC = Ease.outCubic, iC = Ease.inCubic;
drawBg = t => LG.draw(t);

const SHOW = { stagger: 0.045, dur: 0.45, dy: -0.4, blur: 0, outDur: 0.18, outStagger: 0.015, outDy: 0.3 };   // words drop in from above
const T2 = (text, y, size) => new WText(text, { y, size, fit: 960, track: -0.02 });
function win(txt, t, tin, tend, tout) {
  if (t >= tend || t < tin - 0.01) { txt.el.style.display = 'none'; return; }
  txt.at(t, tin, tout, SHOW);
}
const CUT = n => MANIFEST.cutouts[n];
class Piece {
  constructor(name, k, z = 3) {
    const c = CUT(name);
    this.k = k; this.c = c;
    this.el = document.createElement('div');
    Object.assign(this.el.style, { position: 'absolute', left: '0px', top: '0px', width: c.size[0] * k + 'px', height: c.size[1] * k + 'px', zIndex: z, transformOrigin: '50% 50%' });
    const im = mkImg(c.src, 'abs');
    Object.assign(im.style, { left: '0px', top: '0px', width: '100%', height: '100%' });
    this.el.appendChild(im);
    $('#text').appendChild(this.el);
  }
  get w() { return this.c.box[2] * this.k; }
  get h() { return this.c.box[3] * this.k; }
  set({ x = 540, y = 960, s = 1, rx = 0, ry = 0, rz = 0, o = 1, blur = 0, vis = true }) {
    const st = this.el.style;
    if (!vis || o < 0.002) { st.display = 'none'; return this; }
    st.display = '';
    const w = this.c.size[0] * this.k, h = this.c.size[1] * this.k;
    st.transform = `translate(${(x - w / 2).toFixed(2)}px, ${(y - h / 2).toFixed(2)}px) perspective(1600px) rotateX(${rx.toFixed(3)}deg) rotateY(${ry.toFixed(3)}deg) rotateZ(${rz.toFixed(3)}deg) scale(${s.toFixed(4)})`;
    st.opacity = o >= 0.999 ? '' : o.toFixed(3);
    st.filter = blur > 0.1 ? `blur(${blur.toFixed(2)}px)` : '';
    return this;
  }
}
// the coins' flat icons (the app's own: Tether and Bitcoin), drawn crisp at any size from src/vec.js's shapes
function coinCanvas(sym) {
  const c = document.createElement('canvas'); c.width = c.height = 600;
  c.naturalWidth = c.naturalHeight = 600;
  c.draw = () => {
    const g = c.getContext('2d'), s = 6;
    g.clearRect(0, 0, 600, 600);
    g.fillStyle = sym === 'usdt' ? '#26a17b' : '#f7931a'; g.beginPath(); g.arc(300, 300, 296, 0, 7); g.fill();
    g.fillStyle = '#fff'; g.strokeStyle = '#fff';
    const rr = (x, y, w, h, r) => { g.beginPath(); g.roundRect(x * s, y * s, w * s, h * s, r * s); g.fill(); };
    if (sym === 'usdt') {
      rr(24, 23, 52, 13, 2.5); rr(43.5, 28, 13, 52, 2.5);
      g.lineWidth = 4.6 * s; g.beginPath(); g.ellipse(50 * s, 51 * s, 29 * s, 8.6 * s, 0, 0, 7); g.stroke();
    } else {
      g.save(); g.translate(300, 300); g.rotate(14 * Math.PI / 180); g.translate(-300, -300);
      for (const [x, y] of [[38, 14], [50, 14], [38, 72], [50, 72]]) rr(x, y, 5.5, 14, 1.5);
      g.font = `800 ${62 * s}px "Inter Variable"`; g.textAlign = 'center'; g.textBaseline = 'alphabetic'; g.fillText('B', 51 * s, 72 * s);
      g.restore();
    }
  };
  return c;
}
const LENS = { refr: 26, bevel: 46, mag: 0, tint: 0.06, frost: 0.4, chroma: 0.3, rim: 1, shadow: 1, op: 1 };
const SOCK = { refr: 34, bevel: 60, mag: 0, tint: 0.14, frost: 1.3, chroma: 0.35, rim: 1, shadow: 1, op: 1 };
const mixL = (a, b, p) => Object.fromEntries(Object.keys(a).map(k => [k, lerp(a[k], b[k], p)]));
const ICON = { give: [-331.7, 38.3], get: [-331.9, 36.7], r: 33.5 };   // the coin icons inside the panel cut-outs (px from the image centre)

scene({
  init() {
    LG.init();
    this.coin = { usdt: coinCanvas('usdt'), btc: coinCanvas('btc') };
    this.give = new Piece('pr_give', 1.0, 4);
    this.get = new Piece('pr_get', 1.0, 4);
    this.btn = new Piece('pr_swapbtn', 1.15, 6);
    this.pcts = ['25', '50', '75', 'max'].map(n => new Piece('pr_pct_' + n, 1.0, 4));
    this.fees = new Piece('pr_fees', 0.92, 4);
    this.h = [
      [T2('Обмен\n~внутри кошелька', 190, 124), 0.2, S(2)],
      [T2('Отдаёте ~USDT —\nполучаете ~BTC', 190, 112), S(2) + 0.1, S(4)],
      [T2('Комиссия обмена —\n~уже в курсе', 190, 108), S(4) + 0.1, S(6)],
    ];
    for (let k = 1; k < 8; k++) cue(k * BT - 0.02, 'tick', { gain: 0.14 });
    cue(S(2) - 0.12, 'whoosh', { dur: 0.4, gain: 0.4 });
    cue(S(3) - 0.02, 'tap', { gain: 0.45 });
    [0, 1, 2, 3].forEach(k => cue(S(3) + BT + k * BT / 2, 'tick', { gain: 0.25 }));
    cue(S(4) + 0.05, 'whoosh', { dur: 0.4, gain: 0.25 });
    cue(S(6) - 0.4, 'whoosh', { dur: 0.5, gain: 0.35 });
  },
  update(t) {
    if (!this.drawn) { this.coin.usdt.draw(); this.coin.btc.draw(); this.drawn = true; }
    LG.reset();
    LG.F.white = 1;
    this.h.forEach(([h, a, b]) => win(h, t, a, b, b - 0.25));
    const out = iC(prog(t, S(6) - 0.45, S(6) + 0.1));                 // the screen turns away like a page
    // layout: the panels, then everything rides up for the fees
    const up = ioC(prog(t, S(4), S(4) + 0.7)), ks = lerp(1, 0.86, up);
    const GY = lerp(745, 622, up), gy2 = GY + (this.give.h / 2 + 20 + this.get.h / 2) * ks;
    // ---- the pair: two lenses with a coin each, orbiting (a step on every beat), trading places on the drop
    const k = Math.floor(t / BT), f = oX(clamp((t - k * BT) / 0.28));
    let ang = (Math.min(k, 7) + (k < 8 ? f : 0)) * 0.55 + 0.2 + t * 0.15;
    ang += oX(prog(t, S(2) - 0.14, S(2) + 0.36)) * Math.PI;
    const dock = ioC(prog(t, S(2) + 0.2, S(2) + 0.95));
    const C = { x: 540, y: 930 };
    const pair = [['usdt', 0, 'give'], ['btc', Math.PI, 'get']];
    pair.forEach(([sym, ph, slot]) => {
      const a = ang + ph, ox = C.x + Math.cos(a) * 232, oy = C.y + Math.sin(a) * 64, depth = (Math.sin(a) + 1) / 2;
      const P = slot === 'give' ? { x: 540 + ICON.give[0], y: GY + ICON.give[1] } : { x: 540 + ICON.get[0] * ks, y: gy2 + ICON.get[1] * ks };
      const d = lerp(206 * (0.88 + 0.24 * depth), ICON.r * 2, dock);
      const x = lerp(ox, P.x, dock), y = lerp(oy, P.y, dock);
      const coinO = 1 - prog(t, S(2) + 0.9, S(2) + 1.05);           // hands over to the panel's own icon
      if (coinO > 0) LG.T.push({ img: this.coin[sym], x, y, h: d, o: coinO, shadow: 0.5 * (1 - dock), front: true });   // the coin sits in its bubble, crisp
      // the lens around it: shrinks onto the coin as it docks
      const ld = lerp(290 * (0.88 + 0.24 * depth), 0, oX(prog(t, S(2) + 0.1, S(2) + 0.6)));
      if (ld > 2) LG.S.push({ x, y, w: ld, h: ld, k: 120 });
    });
    // the sockets of the panels: born from the lenses' glass as they shrink
    const sk = (x, y, w, h, t0, t1) => {
      const g = oX(prog(t, t0, t0 + 0.45)), q = Math.max(iC(prog(t, t1 - 0.3, t1)), out);
      if (g <= 0 || q >= 1) return;
      LG.S.push({ x: x - out * 900, y, w: lerp(h, w, g) * (1 - q * 0.3), h: h * (1 - q * 0.3), r: Math.min(64, h / 2), k: 0 });
    };
    const lensLook = t < S(2) + 0.6 ? 0 : 1;
    Object.assign(LG.G, mixL(LENS, SOCK, lensLook));
    sk(540, GY, (this.give.w + 40) * ks, (this.give.h + 40) * ks, S(2) + 0.3, S(6) + 0.2);
    sk(540, gy2, (this.get.w + 40) * ks, (this.get.h + 40) * ks, S(2) + 0.42, S(6) + 0.2);
    // ---- the panels land in them (from the sides, as a pair)
    const land = (p, t0, y, dir, kk) => {
      const a = oX(prog(t, t0, t0 + 0.55));
      p.set({ x: 540 + (1 - a) * 260 * dir - out * 900, y, s: ks * lerp(0.94, 1, a), ry: (1 - a) * -35 * dir + out * 70, o: clamp(a * 2.5), blur: (1 - a) * 8, vis: t > t0 && out < 1 });
    };
    land(this.give, S(2) + 0.45, GY, -1);
    land(this.get, S(2) + 0.55, gy2, 1);
    // the ↓↑ button between them: pops on the beat, spins on the tap
    const ba = oX(prog(t, S(2) + 0.85, S(2) + 1.25)), spin = oX(prog(t, S(3), S(3) + 0.5)) * 180;
    const tap = Math.sin(Math.PI * prog(t, S(3) - 0.06, S(3) + 0.22));
    this.btn.set({ x: 540 - out * 900, y: (GY + this.give.h / 2 * ks + gy2 - this.get.h / 2 * ks) / 2, s: ba * (1 - tap * 0.12) * ks, rz: spin, o: clamp(ba * 3), vis: ba > 0.01 && out < 1 });
    // the percent chips, one per half beat, gone for the fees
    this.pcts.forEach((p, i) => {
      const t0 = S(3) + BT + i * BT / 2, a = oX(prog(t, t0, t0 + 0.4)), b = iC(prog(t, S(4) - 0.3 + i * 0.04, S(4) + 0.05 + i * 0.04));
      p.set({ x: 540 + (i - 1.5) * 216, y: gy2 + this.get.h / 2 + 105 - (1 - a) * 40 + b * 160, s: lerp(0.86, 1, a), o: clamp(a * 3) * (1 - b), blur: b * 8, vis: t > t0 && b < 1 });
    });
    // ---- the fee lines (the app's own: Комиссия обмена — «В курсе»)
    const fy = gy2 + this.get.h / 2 * ks + 40 + this.fees.h / 2, fa = oX(prog(t, S(4) + 0.35, S(4) + 0.95));
    sk(540, fy, this.fees.w + 40, this.fees.h + 40, S(4) + 0.2, S(6) + 0.2);
    this.fees.set({ x: 540 - out * 900, y: fy + (1 - fa) * 60, s: lerp(0.95, 1, fa), ry: out * 70, o: clamp(fa * 2.5), blur: (1 - fa) * 8, vis: t > S(4) + 0.35 && out < 1 });
    LG.G.sheen = lerp(-800, 2800, prog(t, S(4) + 1.2, S(4) + 2.8));
  },
});

endCard(S(6), 'Криптокошелёк и обмен в Telegram', DURATION, 0.7);
