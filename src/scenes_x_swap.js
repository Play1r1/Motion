// «Обмен внутри кошелька» — Instagram, 9:16, real 3D. Its own world: kinetic from the first frame (no
// breath before the drop), a cool studio with a blue strip, a motion language of pairs and turns: two
// coins, USDT and BTC, orbit each other and trade places on the drop, then dock into the app's swap screen
// built in Liquid Glass (Отдаёте / Получаете, the ↓↑ button, 25% · 50% · 75% · Макс; 50% fills in
// 20,000.20 of the real 40,000.40 USDT), and the app's own line on fees: «Комиссия обмена — в курсе».
// The track: the second take of the energetic 120 BPM piece, ending on its own stop.
'use strict';

const BAR = 4 * 60 / 120.19, BT = BAR / 4;
const S = n => n * BAR;
DURATION = 17.75;
META = { drop: S(2), end: S(6), bpm: 120, musicEdit: 'assets/music/x_swap_edit.json', sfxGain: 0.4, sfxOnly: ['whoosh', 'tap', 'tick'] };
const oE = Ease.outExpo, iC = Ease.inCubic;
const SHOW = { stagger: 0.05, dur: 0.5, dy: -0.4, blur: 0, outDur: 0.2, outStagger: 0.015, outDy: 0.3 };    // words drop in from above
const T2 = (text, y, size) => new WText(text, { y, size, fit: 960, track: -0.02 });
function win(txt, t, tin, tend, tout) {
  if (t >= tend || t < tin - 0.01) { txt.el.style.display = 'none'; return; }
  txt.at(t, tin, tout, SHOW);
}
const F = '"Inter Variable"';
// the app's swap cards, in glass; the coin's slot is left empty: the 3D coin docks into it
function makeSwapCard(o, state) {
  return makeGlass(2.9, 0.95, { depth: 0.13, radius: 0.2, px: 460, frost: 0.8, content: (g, w, h) => {
    g.textBaseline = 'middle';
    g.fillStyle = '#6a707b'; g.font = `400 ${0.13 * h}px ${F}`; g.textAlign = 'left'; g.fillText(o.label, 0.06 * w, 0.2 * h);
    g.textAlign = 'right'; g.fillText(o.note, 0.94 * w, 0.2 * h);
    // the token pill (icon slot, ticker, chevron)
    g.fillStyle = 'rgba(19,36,64,0.06)'; g.beginPath(); g.roundRect(0.06 * w, 0.42 * h, 0.33 * w, 0.36 * h, 0.18 * h); g.fill();
    g.fillStyle = '#121318'; g.font = `600 ${0.17 * h}px ${F}`; g.textAlign = 'left'; g.fillText(o.ticker, 0.06 * w + 0.4 * h, 0.605 * h);
    const cx = 0.06 * w + 0.4 * h + g.measureText(o.ticker).width + 0.12 * h;
    g.strokeStyle = '#6a707b'; g.lineWidth = 0.02 * h; g.lineCap = 'round'; g.beginPath(); g.moveTo(cx, 0.57 * h); g.lineTo(cx + 0.045 * h, 0.625 * h); g.lineTo(cx + 0.09 * h, 0.57 * h); g.stroke();
    // the amount (live: 50% types it in)
    const amt = o.amount ? o.amount(state) : null;
    g.textAlign = 'right';
    g.fillStyle = amt ? '#121318' : '#b9bdc4'; g.font = `600 ${0.3 * h}px ${F}`; g.fillText(amt ? amt[0] : '0', 0.94 * w, 0.54 * h);
    g.fillStyle = '#6a707b'; g.font = `400 ${0.13 * h}px ${F}`; g.fillText('≈ ' + (amt ? amt[1] : '$0.00'), 0.94 * w, 0.83 * h);
  } });
}
function makeSwapButton() {
  return makeGlass(0.42, 0.42, { depth: 0.16, radius: 0.21, px: 600, frost: 0.85, content: (g, w, h) => {
    g.strokeStyle = '#2a6fe3'; g.lineWidth = 0.05 * w; g.lineCap = 'round'; g.lineJoin = 'round';
    const a = (x, y0, y1) => { const d = Math.sign(y1 - y0) * 0.09 * h; g.beginPath(); g.moveTo(x, y0); g.lineTo(x, y1); g.moveTo(x - 0.08 * w, y1 - d); g.lineTo(x, y1); g.lineTo(x + 0.08 * w, y1 - d); g.stroke(); };
    a(0.41 * w, 0.32 * h, 0.66 * h); a(0.59 * w, 0.68 * h, 0.34 * h);
  } });
}
function makeChip(label, state, k) {
  return makeGlass(0.66, 0.34, { depth: 0.12, radius: 0.12, px: 600, frost: 0.6, content: (g, w, h) => {
    const on = state.pick === k;
    if (on) { g.fillStyle = 'rgba(42,111,227,0.12)'; g.beginPath(); g.roundRect(0, 0, w, h, 0.35 * h); g.fill(); }
    g.fillStyle = on ? '#2a6fe3' : '#121318'; g.font = `600 ${0.36 * h}px ${F}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(label, w / 2, 0.53 * h);
  } });
}
// the app's fee lines
function makeFees() {
  return makeGlass(2.9, 1.02, { depth: 0.13, radius: 0.2, px: 460, frost: 0.8, content: (g, w, h) => {
    g.textBaseline = 'middle';
    const row = (y, l) => { g.fillStyle = '#6a707b'; g.font = `400 ${0.13 * h}px ${F}`; g.textAlign = 'left'; g.fillText(l, 0.06 * w, y * h); };
    row(0.3, 'Комиссия сети'); row(0.7, 'Комиссия обмена');
    g.textAlign = 'right'; g.fillStyle = '#121318'; g.font = `500 ${0.135 * h}px ${F}`; g.fillText('≈ $5.23', 0.94 * w, 0.3 * h);
    g.font = `500 ${0.125 * h}px ${F}`; const tw = g.measureText('В курсе').width;
    g.fillStyle = 'rgba(42,111,227,0.12)'; g.beginPath(); g.roundRect(0.94 * w - tw - 0.16 * h, 0.58 * h, tw + 0.16 * h, 0.24 * h, 0.12 * h); g.fill();
    g.fillStyle = '#2a6fe3'; g.fillText('В курсе', 0.94 * w - 0.08 * h, 0.7 * h);
  } });
}

scene({
  init() {
    K3.init({ envOpts: { cool: 4.5 }, shadowOpacity: 0.05 });
    this.usdt = K3.add(makeCoin('usdt'));
    this.btc = K3.add(makeCoin('btc', { metal: 'gold' }));
    this.state = { pick: -1, fill: 0 };
    const amount = st => (st.fill > 0 ? [Math.round(20000.2 * st.fill * 100 / 100).toLocaleString('en-US') + (st.fill >= 1 ? '.20' : ''), '$' + (20000.2 * st.fill).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })] : null);
    this.give = K3.add(makeSwapCard({ label: 'Отдаёте', note: 'Доступно: 40,000.40 USDT', ticker: 'USDT', amount }, this.state));
    this.get = K3.add(makeSwapCard({ label: 'Получаете', note: 'Баланс: 0.5 BTC', ticker: 'BTC' }, this.state));
    this.btn = K3.add(makeSwapButton());
    this.chips = ['25%', '50%', '75%', 'Макс'].map((l, k) => K3.add(makeChip(l, this.state, k)));
    this.fees = K3.add(makeFees());
    this.h = [
      [T2('Обмен\n~внутри кошелька', 190, 124), 0.25, S(2)],
      [T2('Отдаёте ~USDT —\nполучаете ~BTC', 190, 112), S(2) + 0.1, S(4)],
      [T2('Комиссия обмена —\n~уже в курсе', 190, 108), S(4) + 0.1, S(6)],
    ];
    cue(S(2) - 0.1, 'whoosh', { dur: 0.45, gain: 0.35 });                  // the coins trade places
    cue(S(2) + 0.55, 'whoosh', { dur: 0.35, gain: 0.2 });
    cue(S(3) - 0.02, 'tap', { gain: 0.45 });                                 // 50%
    cue(S(4) + 0.05, 'whoosh', { dur: 0.4, gain: 0.22 });
    cue(S(6) - 0.4, 'whoosh', { dur: 0.5, gain: 0.3 });
  },
  update(t) {
    this.h.forEach(([h, a, b]) => win(h, t, a, b, b - 0.25));
    const out = iC(prog(t, S(6) - 0.45, S(6) + 0.1));                       // the UI turns away like a page
    // ---- layout (frame px), the glass at z 2.6; the cards ride up for the fees
    const up = Ease.inOutCubic(prog(t, S(4), S(4) + 0.8));
    const yGive = lerp(730, 600, up), yGet = yGive + 315, Z = 2.6;
    // ---- the coins: a binary pair orbiting (faster on every beat), they trade places on the drop, then dock
    const C = K3.L(540, 900, 0.8);
    const beatK = Math.floor(t / BT), bf = oE(clamp((t - beatK * BT) / 0.3));
    let ang = (Math.min(beatK, 7) + bf * (beatK < 8)) * 0.42 + 0.3;          // steps on the beat
    ang += oE(prog(t, S(2) - 0.12, S(2) + 0.45)) * Math.PI;                  // the swap
    const dock = Ease.inOutCubic(prog(t, S(2) + 0.35, S(2) + 1.25));
    const rad = 1.05;
    const slot = (py) => K3.L(90 + 0.06 * 900 + 0.2 * 295, py + 0.1 * 295, Z + 0.22);   // the pill's icon slot
    const SG = slot(yGive), SB = slot(yGet);
    [[this.usdt, 0, SG], [this.btc, Math.PI, SB]].forEach(([c, ph, D]) => {
      const a = ang + ph, ox = C.x + Math.cos(a) * rad * 0.95, oy = C.y + Math.sin(a) * rad * 0.55, oz = C.z + Math.sin(a) * 0.9;
      K3.pose(c, { x: lerp(ox, D.x, dock) - out * 3, y: lerp(oy, D.y, dock), z: lerp(oz, D.z, dock), rx: lerp(14, 0, dock), ry: lerp(-25 + t * 90 + ph * 30, 0, dock) + out * 70, rz: lerp(-8, 0, dock),
        s: lerp(0.78, 0.118, dock), vis: out < 1 });
    });
    // ---- the swap screen: two cards from opposite sides, the button between them, the percent chips
    const cin = (t0, dir) => { const a = oE(prog(t, t0, t0 + 0.9)); return { dx: (1 - a) * 4.2 * dir, ry: (1 - a) * -40 * dir, a }; };
    const turnOut = (k) => ({ ry: out * 80, dx: -out * (2 + k) });
    const G = K3.L(540, yGive, Z), Bq = K3.L(540, yGet, Z), ci = cin(S(2) + 0.2, -1), cg = cin(S(2) + 0.35, 1), o1 = turnOut(0), o2 = turnOut(0.4);
    K3.pose(this.give, { x: G.x + ci.dx + o1.dx, y: G.y, z: Z, rx: -3 + Math.sin(t * 0.8) * 1.2, ry: ci.ry + o1.ry, s: 1, vis: t > S(2) + 0.2 && out < 1 });
    K3.pose(this.get, { x: Bq.x + cg.dx + o2.dx, y: Bq.y, z: Z, rx: -3 + Math.sin(t * 0.8 + 1) * 1.2, ry: cg.ry + o2.ry, s: 1, vis: t > S(2) + 0.35 && out < 1 });
    const bt = oE(prog(t, S(2) + 0.6, S(2) + 1.2)), BP = K3.L(540, (yGive + yGet) / 2, Z + 0.15);
    const spin = oE(prog(t, S(3.5), S(3.5) + 0.5)) * 180;
    K3.pose(this.btn, { x: BP.x - out * 2.5, y: BP.y, z: Z + 0.15, rx: 0, ry: out * 80, rz: spin, s: bt, vis: bt > 0.001 && out < 1 });
    // chips snap in on the beats after the cards, leave for the fees
    this.chips.forEach((ch, k) => {
      const t0 = S(2) + 1.0 + k * BT * 0.5, a = oE(prog(t, t0, t0 + 0.6)), b = iC(prog(t, S(4) - 0.3 + k * 0.04, S(4) + 0.05 + k * 0.04));
      const P = K3.L(540 + (k - 1.5) * 222, yGet + 260, Z);
      const press = Math.sin(Math.PI * prog(t, S(3) - 0.05, S(3) + 0.25)) * (k === 1);
      K3.pose(ch, { x: P.x, y: P.y - (1 - a) * 0.3 - b * 2, z: Z - press * 0.12, rx: (1 - a) * 30, ry: 0, s: lerp(0.8, 1, a) * (1 - 0.06 * press), vis: t > t0 && b < 1 });
    });
    // 50% picks and types the amount in
    const pick = t > S(3) ? 1 : -1, fill = Ease.outCubic(prog(t, S(3) + 0.05, S(3) + 0.75));
    if (pick !== this.state.pick) { this.state.pick = pick; this.chips.forEach(c => c.print.material.map.redraw()); }
    const fq = Math.round(fill * 40) / 40;
    if (fq !== this.state.fill) { this.state.fill = fq; this.give.print.material.map.redraw(); }
    // the fees card
    const fa = oE(prog(t, S(4) + 0.25, S(4) + 1.1)), FP = K3.L(540, 1255, Z), o3 = turnOut(0.8);
    K3.pose(this.fees, { x: FP.x + o3.dx, y: FP.y - (1 - fa) * 0.7, z: Z, rx: -3 + (1 - fa) * 25, ry: o3.ry, s: 1, vis: t > S(4) + 0.25 && out < 1 });
    K3.cam.position.set(Math.sin(t * 0.3) * 0.1, Math.cos(t * 0.23) * 0.06, 16);
    K3.cam.lookAt(K3.cam.position.x * 0.5, K3.cam.position.y * 0.5, 0);
    K3.render();
  },
});

endCard(S(6), 'Криптокошелёк и обмен в Telegram', DURATION, 0.7);
