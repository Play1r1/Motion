// «Из крипты — в карту» — Instagram, 9:16, 22 s, its own airy 110 BPM track (assets/music/x_card_edit.json).
// No home-made 3D: the app's own pieces (the Tether row, the INCPT card, the operation rows, the card holder
// illustration from «Мои карты») in the approved language — a white canvas, Liquid Glass, focus pulls.
// Its own idea: a glass lens glides over the Tether row and magnifies the balance; on the drop the lens
// flows into a glass case and the card appears inside it; the top-up rows rise out of depth; the card dips
// for a tap; it slides into the app's card holder. Timed in bars of the track.
'use strict';

const BAR = 4 * (60 / 110);
const S = n => n * BAR;
DURATION = S(10) + 0.6;
META = { drop: S(2), end: S(8), bpm: 110, musicEdit: 'assets/music/x_card_edit.json', sfxGain: 0.45, sfxOnly: ['whoosh', 'tap', 'tick'] };
const oC = Ease.outCubic, iC = Ease.inCubic;           // oX, ioC from common.js
drawBg = t => LG.draw(t);

const SHOW = { stagger: 0.1, dur: 0.75, dy: 0.28, blur: 12, outDur: 0.24, outStagger: 0.02, outDy: -0.14 };
const T2 = (text, y, size) => new WText(text, { y, size, fit: 960, track: -0.02 });
function win(txt, t, tin, tend, tout) {
  if (t >= tend || t < tin - 0.01) { txt.el.style.display = 'none'; return; }
  txt.at(t, tin, tout, SHOW);
}
// a real UI cut-out from the app (with its own shadow), placed by its centre, in 2.5D
const CUT = n => MANIFEST.cutouts[n];
class Piece {
  constructor(name, k, z = 3) {
    const c = CUT(name);
    this.k = k; this.c = c;
    this.el = document.createElement('div');
    Object.assign(this.el.style, { position: 'absolute', left: '0px', top: '0px', width: c.size[0] * k + 'px', height: c.size[1] * k + 'px', zIndex: z,
      transformOrigin: '50% 50%', willChange: 'transform' });
    this.img = mkImg(c.src, 'abs');
    Object.assign(this.img.style, { left: '0px', top: '0px', width: '100%', height: '100%' });
    this.el.appendChild(this.img);
    $('#text').appendChild(this.el);
  }
  set({ x = 540, y = 960, s = 1, rx = 0, ry = 0, rz = 0, o = 1, blur = 0, vis = true }) {
    const st = this.el.style;
    if (!vis || o < 0.002) { st.display = 'none'; return this; }
    st.display = '';
    const w = this.c.size[0] * this.k, h = this.c.size[1] * this.k;
    st.transform = `translate(${(x - w / 2).toFixed(2)}px, ${(y - h / 2).toFixed(2)}px) perspective(1800px) rotateX(${rx.toFixed(3)}deg) rotateY(${ry.toFixed(3)}deg) rotateZ(${rz.toFixed(3)}deg) scale(${s.toFixed(4)})`;
    st.opacity = o >= 0.999 ? '' : o.toFixed(3);
    st.filter = blur > 0.1 ? `blur(${blur.toFixed(2)}px)` : '';
    return this;
  }
}
const setLook = L => Object.assign(LG.G, L);
const LENS = { refr: 52, bevel: 140, mag: 20, tint: 0.03, frost: 0, rim: 1, shadow: 1, op: 1, chroma: 0.35 };
const CASE = { refr: 30, bevel: 56, mag: 0, tint: 0.05, frost: 0, rim: 1, shadow: 1, op: 1, chroma: 0.3 };
const PLINTH = { refr: 40, bevel: 80, mag: 0, tint: 0.14, frost: 1.4, rim: 1, shadow: 1, op: 1, chroma: 0.5 };

// layout (frame px)
const CARD = { x: 540, y: 815, k: 0.92 };                 // the card's centre and scale (card image 1006 × 703 with its shadow)
const CASE_P = { x: 540, y: 815, w: 900, h: 612, r: 72 };
const ROW_Y = [1215, 1398];

scene({
  init() {
    LG.init();
    this.row = mkImg(CUT('pr_row_usdt').src);
    this.cardImg = mkImg(CUT('pr_card').src);
    this.card = new Piece('pr_card', CARD.k, 4);
    // the card's sheen: a soft light band that crosses it on the tap
    this.sheen = document.createElement('div');
    const cc = CUT('pr_card'), ins = cc.pad * CARD.k;            // the light stays on the card itself, never on its shadow
    Object.assign(this.sheen.style, { position: 'absolute', left: ins + 'px', top: ins + 'px', width: cc.box[2] * CARD.k + 'px', height: cc.box[3] * CARD.k + 'px',
      borderRadius: cc.r * CARD.k + 'px', overflow: 'hidden', pointerEvents: 'none', mixBlendMode: 'soft-light' });
    this.card.el.appendChild(this.sheen);
    this.rows = ['pr_op_topcard', 'pr_op_topup', 'pr_op_starbucks', 'pr_op_nike'].map(n => new Piece(n, 0.95, 3));
    this.holder = new Piece('pr_holder', 1.9, 5);
    this.h = [
      [T2('Из крипты —\nв ~карту', 190, 124), 0.35, S(2)],
      [T2('Пополни\nиз ~USDT', 190, 124), S(2) + 0.1, S(4)],
      [T2('Плати\nкартой ~INCPT', 190, 124), S(4) + 0.1, S(6)],
      [T2('Виртуальные\nи ~металлическая', 190, 110), S(6) + 0.1, S(8)],
    ];
    cue(0.5, 'whoosh', { dur: 1.4, gain: 0.22 });
    cue(S(2) - 0.15, 'whoosh', { dur: 0.6, gain: 0.4, up: true });
    [S(2.5), S(3), S(4.5), S(5)].forEach(t => cue(t, 'tick', { gain: 0.3 }));
    cue(S(4) + 0.55, 'tap', { gain: 0.5 });
    cue(S(6) + 0.05, 'whoosh', { dur: 0.6, gain: 0.3 });
    cue(S(6) + 1.35, 'tap', { gain: 0.3 });
  },
  update(t) {
    LG.reset();
    LG.F.white = 1;
    this.h.forEach(([h, a, b]) => win(h, t, a, b, b - 0.3));
    const end = iC(prog(t, S(8) - 0.5, S(8) + 0.1));

    // ---- hook: the Tether row, a lens gliding over it and holding on the balance
    const rowIn = oC(prog(t, 0.15, 0.9)), rowOut = iC(prog(t, S(2) - 0.55, S(2) - 0.05));
    if (t < S(2)) LG.T.push({ img: this.row, x: 540, y: 905 + (1 - rowIn) * 40, h: 327 * 1.0 * (0.94 + 0.06 * rowIn), o: rowIn * (1 - rowOut), lod: (1 - rowIn) * 4 + rowOut * 3, shadow: 0 });
    const glide = ioC(prog(t, 0.45, 2.3)), grow = ioC(prog(t, S(2) - 0.75, S(2) + 0.15));
    const lx = lerp(150, 760, glide) + Math.sin(t * 1.6) * 6 * (1 - grow), ly = 905 + Math.cos(t * 1.3) * 5 * (1 - grow);
    // the lens: a drop that lands (a jiggle), glides, then flows into the case around the card
    const born = oC(prog(t, 0.3, 0.9)), tl = t - 0.9, jig = tl > 0 ? Math.exp(-tl * 3.2) * Math.sin(tl * 12) * 0.05 : 0;
    if (t < S(4)) {
      const d = 330 * born;
      const P = { x: lerp(lx, CASE_P.x, grow), y: lerp(ly, CASE_P.y, grow), w: lerp(d * (1 + jig), CASE_P.w, grow), h: lerp(d * (1 - jig), CASE_P.h, grow), r: lerp(d / 2, CASE_P.r, grow) };
      // after the drop: the case breathes, then melts away on the tap
      const melt = iC(prog(t, S(4) - 0.2, S(4) + 0.35)), br = Math.sin(t * 1.4) * 0.004 * grow;
      P.w *= (1 - melt) * (1 + br); P.h *= (1 - melt * 0.6) * (1 - br);
      if (P.w > 2) LG.S.push({ ...P, k: 0 });
      // two droplets pinch off as the lens flows into the case
      for (const s of [-1, 1]) {
        const q = prog(t, S(2) - 0.55, S(2) + 0.5);
        if (q > 0 && q < 1) { const r = Math.pow(Math.sin(Math.PI * q), 0.7) * 46; LG.S.push({ x: P.x + s * lerp(200, 520, oC(q)), y: P.y + lerp(60, 330, oC(q)), w: 2 * r, h: 2 * r, k: 120 }); }
      }
      const g = grow;
      setLook(Object.fromEntries(Object.keys(LENS).map(k => [k, lerp(LENS[k], CASE[k], g)])));
      LG.G.sheen = lerp(-800, 2600, prog(t, S(2) + 0.15, S(2) + 1.6));
    }

    // ---- the card: inside the glass case (drawn in WebGL, so the glass bends its edges), then in 2.5D
    const cin = oX(prog(t, S(2) - 0.2, S(2) + 0.6));
    const asQuad = t < S(4) - 0.05;
    if (asQuad && t > S(2) - 0.2) LG.T.unshift({ img: this.cardImg, x: CARD.x, y: CARD.y + (1 - cin) * 30, h: 703 * CARD.k * lerp(0.86, 1, cin), o: clamp(cin * 1.6), lod: (1 - cin) * 5, shadow: 0 });
    // the tap: the card dips away and back, a light crosses it
    const tap = Math.sin(Math.PI * prog(t, S(4) + 0.15, S(4) + 1.0));
    const sh = prog(t, S(4) + 0.4, S(4) + 1.3);
    this.sheen.style.background = sh > 0 && sh < 1 ? `linear-gradient(105deg, transparent ${(sh * 140 - 40).toFixed(1)}%, rgba(255,255,255,0.9) ${(sh * 140 - 22).toFixed(1)}%, transparent ${(sh * 140 - 4).toFixed(1)}%)` : 'none';
    // into the holder
    const into = ioC(prog(t, S(6) + 0.35, S(6) + 1.35));
    const hold = { x: 540, y: 925, s: 0.6 };
    this.card.el.style.zIndex = into > 0.5 ? '4' : '6';
    this.card.set({ x: lerp(CARD.x, hold.x, into), y: lerp(CARD.y, hold.y, into) + lerp(0, 0, into) + end * 140, s: lerp(1, hold.s, into) * (1 - tap * 0.05),
      rx: tap * 26 + Math.sin(t * 0.8) * 1.5 * (1 - into), ry: Math.sin(t * 0.55) * 4 * (1 - into), rz: lerp(0, -2, into),
      o: 1 - end, blur: end * 10, vis: !asQuad && t < S(8) + 0.1 });

    // ---- rows: two per section, rising out of depth one per accent
    const rowAt = (r, t0, t1, y) => {
      const a = oX(prog(t, t0, t0 + 0.8)), b = iC(prog(t, t1 - 0.4, t1));
      r.set({ x: 540, y: y + (1 - a) * 150 + b * 120, s: lerp(0.88, 1, a) * (1 - b * 0.05), rx: (1 - a) * -30, o: clamp(a * 1.8) * (1 - b), blur: (1 - a) * 14 + b * 10, vis: t > t0 && t < t1 });
    };
    rowAt(this.rows[0], S(2.5), S(4), ROW_Y[0]);
    rowAt(this.rows[1], S(3), S(4), ROW_Y[1]);
    rowAt(this.rows[2], S(4.5), S(6), ROW_Y[0]);
    rowAt(this.rows[3], S(5), S(6), ROW_Y[1]);

    // ---- the app's card holder rises under the card; the card slides into it
    const ha = oX(prog(t, S(6), S(6) + 0.9));
    this.holder.set({ x: 540, y: 1075 + (1 - ha) * 260 + end * 160, s: lerp(0.9, 1, ha), rx: (1 - ha) * -18, ry: Math.sin(t * 0.5) * 3, o: clamp(ha * 1.6) * (1 - end), blur: (1 - ha) * 12 + end * 10, vis: t > S(6) });
    if (t > S(6) - 0.2 && t < S(8)) {                       // a glass plinth under it
      const pa = oC(prog(t, S(6) + 0.2, S(6) + 1.0)) * (1 - end);
      setLook(PLINTH);
      LG.S.push({ x: 540, y: 1390, w: 860 * pa, h: 150 * pa, r: 75 * pa, k: 0 });
    }
  },
});

endCard(S(8), 'Криптокошелёк и карты в Telegram', DURATION, 0.7);
