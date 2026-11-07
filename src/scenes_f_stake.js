// «Пусть USDT работает» — Instagram, 9:16, 26 s, its own warm 92 BPM track that breathes before the drop and
// ends on a ringing chord (assets/music/x_stake_edit.json). No home-made 3D: the app's own safe and the
// staking screen's real pieces. Its own idea and motion: precise, mechanical, on the beat — liquid glass
// sockets form out of drops and the real pieces snap into them one beat at a time (the Liquid / Monthly /
// Maximum control, the 20–40% APY chip, the staked total, the deposit card), the yearly range rolls up on
// an odometer, everything drops away in order for the end card.
'use strict';

const BAR = 4 * 60 / 92.29, BT = BAR / 4;
const S = n => n * BAR;
DURATION = 26.3;
META = { drop: S(2), end: S(8), bpm: 92, musicEdit: 'assets/music/x_stake_edit.json', sfxGain: 0.45, sfxOnly: ['whoosh', 'tap', 'tick'] };
const oC = Ease.outCubic, iC = Ease.inCubic;
drawBg = t => LG.draw(t);

const SHOW = { stagger: 0.05, dur: 0.55, dy: 0.5, blur: 0, outDur: 0.2, outStagger: 0.02, outDy: -0.3 };   // crisp, mechanical
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
  // element size on screen (without the shadow padding)
  get w() { return this.c.box[2] * this.k; }
  get h() { return this.c.box[3] * this.k; }
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
const SOCKET = { refr: 34, bevel: 58, mag: 0, tint: 0.14, frost: 1.3, chroma: 0.35, rim: 1, shadow: 1, op: 1 };

// the beats after the drop on which the pieces land (beat index from the drop)
const AT = k => S(2) + k * BT;
const LAND = { tabs: AT(1), apy: AT(3), range: AT(5), staked: S(5) + BT, deposit: S(5) + 2 * BT };

scene({
  init() {
    LG.init();
    this.safe = new Piece('pr_safe', 1.55, 4);
    this.tabs = new Piece('pr_tabs', 1.12, 4);
    this.apy = new Piece('pr_apy', 1.35, 5);
    this.staked = new Piece('pr_staked', 1.3, 4);
    this.deposit = new Piece('pr_deposit', 1.02, 4);
    // the yearly range on an odometer: «20–100%» in the site's gradient, «годовых» under it
    this.range = document.createElement('div');
    this.range.className = 'wl wl-h';
    Object.assign(this.range.style, { left: '0px', top: '1232px', width: W + 'px', textAlign: 'center', fontSize: '176px', letterSpacing: '-0.035em', zIndex: 4, lineHeight: '1' });
    this.range.innerHTML = '<span class="wl-irid" style="font-variant-numeric: tabular-nums"></span><div class="wl-s" style="position: static; font-size: 44px; letter-spacing: 0; margin-top: 4px">годовых</div>';
    this.rangeTxt = this.range.firstChild;
    $('#text').appendChild(this.range);
    this.h = [
      [T2('Пусть ~USDT\nработает', 190, 124), 0.4, S(2)],
      [T2('Три тарифа\n~на выбор', 190, 124), S(2) + 0.1, S(5)],
      [T2('Прогноз дохода\n~каждый день', 190, 116), S(5) + 0.1, S(8)],
    ];
    this.rangeTxt.style.backgroundSize = '100% 100%';
    cue(0.3, 'whoosh', { dur: 1.4, gain: 0.2 });
    cue(S(2) - 0.06, 'tap', { gain: 0.45 });
    Object.values(LAND).forEach(t => cue(t, 'tick', { gain: 0.35 }));
    [0, 1, 2, 3].forEach(k => cue(0.15 + k * BT + 0.85, 'tick', { gain: 0.22 }));          // the drops melting into the plinth
    for (let k = 0; k < 4; k++) cue(LAND.range + 0.35 + k * 0.16, 'tick', { gain: 0.18 });
    cue(S(8) - 0.5, 'whoosh', { dur: 0.6, gain: 0.3 });
  },
  update(t) {
    LG.reset();
    LG.F.white = 1;
    Object.assign(LG.G, SOCKET);
    this.h.forEach(([h, a, b]) => win(h, t, a, b, b - 0.3));
    const out = k => iC(prog(t, S(8) - 0.55 + k * 0.08, S(8) - 0.15 + k * 0.08));     // everything drops away in order
    // ---- the safe: a focus pull in the quiet bars, a breath before the drop, a click up on it, a lift for the deposit
    const fin = oX(prog(t, 0.1, 1.6)), breath = Math.sin(Math.PI * prog(t, S(1) + 0.3, S(2) - 0.05));
    const up = oX(prog(t, S(2) - 0.04, S(2) + 0.55)), lift = ioC(prog(t, S(5) - 0.2, S(5) + 0.6));
    const sy = lerp(lerp(862, 690, up), 640, lift), ss = lerp(lerp(1.0, 0.72, up), 0.62, lift) * lerp(1.12, 1, fin) * (1 - breath * 0.04);
    const so = out(0);
    this.safe.set({ x: 540, y: sy + so * 900, s: ss, ry: Math.sin(t * 0.6) * 6, rx: Math.sin(t * 0.45) * 2, o: clamp(fin * 2), blur: (1 - fin) * 18, vis: t < S(8) + 0.1 });
    // ---- the hook: one glass drop per beat flies in and they melt into a plinth under the safe; it breathes
    // with the music's pause and, on the drop, flows into the socket of the plans
    if (t < S(2) + 0.45) {
      const PL = { x: 540, y: 1150 }, flowTo = oX(prog(t, S(2) - 0.05, S(2) + 0.4));
      const from = [[-140, 760], [1220, 980], [-120, 1420], [1200, 1560]];
      let n = 0;
      from.forEach(([fx, fy], k) => {
        const t0 = 0.15 + k * BT, p = ioC(prog(t, t0, t0 + 0.85)), born = oC(prog(t, t0, t0 + 0.3));
        if (p >= 1) { n++; return; }
        const r = 58 * born;
        if (r > 1) LG.S.push({ x: lerp(fx, PL.x + (k % 2 ? 140 : -140), p), y: lerp(fy, PL.y, p) + Math.sin(p * Math.PI) * -90, w: 2 * r, h: 2 * r, k: 160 });
      });
      const nn = n + clamp(Math.max(...from.map((_, k) => ioC(prog(t, 0.15 + k * BT, 1.0 + k * BT)))));
      const inhale = Math.sin(Math.PI * prog(t, S(1) + 0.3, S(2) - 0.05)) * 0.12;
      const pw = Math.min(680, 140 + n * 135) * (1 - inhale), ph = 118 * (1 - inhale * 0.5);
      const TS_ = { x: 540, y: 1035, w: this.tabs.w + 52, h: this.tabs.h + 52 };
      if (n > 0) LG.S.push({ x: PL.x, y: lerp(PL.y, TS_.y, flowTo), w: lerp(pw, TS_.w, flowTo), h: lerp(ph, TS_.h, flowTo), r: lerp(ph / 2, 60, flowTo), k: 160 });
    }
    // ---- liquid sockets: a drop grows into a frosted glass slab a beat before its piece lands
    const sock = (t0, x, y, w, h, r, t1, k = 0) => {
      const g = oX(prog(t, t0 - BT, t0 + 0.2)), q = iC(prog(t, t1 - 0.35, t1));
      if (g <= 0 || q >= 1) return;
      const jt = t - (t0 + 0.2), j = jt > 0 ? Math.exp(-jt * 4) * Math.sin(jt * 13) * 0.03 : 0;
      const ww = lerp(Math.min(w, h) * 0.5, w, g) * (1 + j) * (1 - q), hh = lerp(Math.min(w, h) * 0.5, h, g) * (1 - j) * (1 - q);
      LG.S.push({ x, y: y + q * 220, w: ww, h: hh, r: Math.min(r, ww / 2, hh / 2), k });
    };
    // ---- the pieces snap in on their beat (a fast settle, no bounce)
    const snap = (p, t0, x, y, t1, k) => {
      const a = oX(prog(t, t0, t0 + 0.32)), b = iC(prog(t, t1 - 0.35, t1)), d = out(k);
      p.set({ x, y: y - (1 - a) * 46 + b * 160 + d * 900, s: lerp(1.08, 1, a) * (1 - b * 0.06), o: clamp(a * 3) * (1 - b), blur: (1 - a) * 8 + b * 8, vis: t > t0 && t < t1 && d < 1 });
    };
    // section 2: the plans, the Liquid rate, the yearly range
    sock(LAND.tabs, 540, 1035, this.tabs.w + 52, this.tabs.h + 52, 60, S(5));
    snap(this.tabs, LAND.tabs, 540, 1035, S(5), 1);
    snap(this.apy, LAND.apy, 540 - this.tabs.w / 3 + 18, 1035 - this.tabs.h / 2 - 40, S(5), 1);
    // the odometer: 0 → 20, then the upper bound rolls 20 → 100
    const r1 = oC(prog(t, LAND.range, LAND.range + 0.5)), r2 = oC(prog(t, LAND.range + 0.45, LAND.range + 1.25));
    const lo = Math.round(20 * r1), hi = Math.round(lerp(20, 100, r2));
    const rb = iC(prog(t, S(5) - 0.35, S(5)));
    this.range.style.display = t > LAND.range - 0.01 && rb < 1 ? '' : 'none';
    this.rangeTxt.textContent = `${lo}–${hi}%`;
    Object.assign(this.range.style, { opacity: (clamp(r1 * 3) * (1 - rb)).toFixed(3), transform: `translateY(${((1 - oX(prog(t, LAND.range, LAND.range + 0.4))) * 40 + rb * 120).toFixed(1)}px)`, filter: rb > 0.01 ? `blur(${(rb * 8).toFixed(1)}px)` : '' });
    sock(LAND.range, 540, 1352, 900, 300, 120, S(5), 150);
    // section 3: the staked total and the deposit card (its forecast: ≈ $14.42 today)
    sock(LAND.staked, 540, 975, this.staked.w + 52, this.staked.h + 52, 64, S(8) - 0.3, 0);
    snap(this.staked, LAND.staked, 540, 975, S(8) + 0.2, 1);
    sock(LAND.deposit, 540, 1238, this.deposit.w + 52, this.deposit.h + 52, 70, S(8) - 0.2, 0);
    snap(this.deposit, LAND.deposit, 540, 1238, S(8) + 0.2, 2);
    LG.G.sheen = lerp(-800, 2800, prog(t, S(5) + 1.6, S(5) + 3.4));
  },
});

endCard(S(8), 'Криптокошелёк и стейкинг в Telegram', DURATION, 0.7);
