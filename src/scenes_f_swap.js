// «Обмен внутри кошелька» — Instagram, 9:16, 18 s, kinetic from the first frame on the second take of the
// 120 BPM track, which ends on its own stop (assets/music/x_swap_edit.json). Clean build (v3): the swap
// screen rebuilt as vector UI on Liquid Glass (Отдаёте / Получаете, the ↓↑ button, 25% · 50% · 75% · Макс,
// the fee lines), the coins drawn as vectors, one motion per beat. The idea — pairs and turns: USDT and BTC
// orbit in glass bubbles and trade places on the drop, then each lands on its own icon in the panels;
// the button turns on the tap; the fees follow; the screen turns away like a page.
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
// the coins (the app's Tether and Bitcoin icons) as one vector drawing, used both on the canvas and in the panels
const COINV = {
  usdt: { c: '#26a17b', g: '<rect x="24" y="23" width="52" height="13" rx="2.5"/><rect x="43.5" y="28" width="13" height="52" rx="2.5"/><ellipse cx="50" cy="51" rx="29" ry="8.6" fill="none" stroke="#fff" stroke-width="4.6"/>' },
  btc: { c: '#f7931a', g: `<g transform="rotate(14 50 50)"><rect x="38" y="14" width="5.5" height="14" rx="1.5"/><rect x="50" y="14" width="5.5" height="14" rx="1.5"/><rect x="38" y="72" width="5.5" height="14" rx="1.5"/><rect x="50" y="72" width="5.5" height="14" rx="1.5"/><text x="51" y="72" text-anchor="middle" font-size="62" font-weight="800" font-family="Inter Variable">B</text></g>` },
};
const coinVec = (k, d) => `<svg width="${d}" height="${d}" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="${COINV[k].c}"/><g fill="#fff">${COINV[k].g}</g></svg>`;
function coinCanvas(sym) {
  const c = document.createElement('canvas'); c.width = c.height = 600; c.naturalWidth = c.naturalHeight = 600;
  c.draw = () => {
    const g = c.getContext('2d'), s = 6, rr = (x, y, w, h, r) => { g.beginPath(); g.roundRect(x * s, y * s, w * s, h * s, r * s); g.fill(); };
    g.clearRect(0, 0, 600, 600);
    g.fillStyle = COINV[sym].c; g.beginPath(); g.arc(300, 300, 298, 0, 7); g.fill();
    g.fillStyle = g.strokeStyle = '#fff';
    if (sym === 'usdt') { rr(24, 23, 52, 13, 2.5); rr(43.5, 28, 13, 52, 2.5); g.lineWidth = 4.6 * s; g.beginPath(); g.ellipse(50 * s, 51 * s, 29 * s, 8.6 * s, 0, 0, 7); g.stroke(); }
    else {
      g.save(); g.translate(300, 300); g.rotate(14 * Math.PI / 180); g.translate(-300, -300);
      for (const [x, y] of [[38, 14], [50, 14], [38, 72], [50, 72]]) rr(x, y, 5.5, 14, 1.5);
      g.font = `800 ${62 * s}px "Inter Variable"`; g.textAlign = 'center'; g.fillText('B', 51 * s, 72 * s); g.restore();
    }
  };
  return c;
}
// the app's swap panel, as vector UI
const PANEL = (label, note, coin, ticker, amtCol) => `<div style="position:absolute;inset:0;font-family:${UI.F}">
  <div style="position:absolute;left:44px;top:34px;font-size:28px;color:#8a8f99">${label}</div>
  <div style="position:absolute;right:44px;top:36px;font-size:26px;color:#8a8f99">${note}</div>
  <div style="position:absolute;left:36px;top:118px;height:88px;padding:0 26px 0 14px;border-radius:44px;background:rgba(19,36,64,0.06);display:flex;align-items:center;gap:16px">
    <div data-ic style="width:60px;height:60px">${coinVec(coin, 60)}</div><span style="font-size:36px;font-weight:600;color:${UI.ink}">${ticker}</span>
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8a8f99" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg></div>
  <div style="position:absolute;right:44px;top:98px;font-size:96px;font-weight:600;color:${amtCol};line-height:1">0</div>
  <div style="position:absolute;right:44px;top:214px;font-size:28px;color:#8a8f99">≈ $0.00</div></div>`;
const FEES = `<div style="position:absolute;inset:0;padding:22px 44px;font-family:${UI.F};font-size:31px">
  ${[['Курс', '—'], ['Комиссия сети', '≈ $5.23 · нужно ≈ $6.28'], ['Комиссия обмена', '<span style="font-size:28px;font-weight:600;color:#2a6fe3;background:rgba(42,111,227,0.12);padding:7px 18px 8px;border-radius:22px">В курсе</span>'], ['Вы получите', '—']]
    .map(([l, r]) => `<div style="height:86px;display:flex;align-items:center;justify-content:space-between"><span style="color:#8a8f99">${l}</span><span style="color:${UI.ink};font-weight:500">${r}</span></div>`).join('')}</div>`;
const LENS = { refr: 26, bevel: 46, mag: 0, tint: 0.06, frost: 0.4, chroma: 0.3, rim: 1, shadow: 1, op: 1 };
const GIVE = { w: 900, h: 300 }, GET = { w: 900, h: 300 };
const ICON_AT = { x: -450 + 36 + 14 + 30, y: -150 + 118 + 44 };     // the coin's icon centre in a panel, from the panel's centre

scene({
  init() {
    LG.init();
    // the coins: vector, above everything (so they never pass under the frosted panels); their bubbles are glass on the canvas
    this.coinEl = ['usdt', 'btc'].map(k => { const d = document.createElement('div'); d.innerHTML = coinVec(k, 300);
      Object.assign(d.style, { position: 'absolute', left: '0px', top: '0px', width: '300px', height: '300px', zIndex: 8, filter: 'drop-shadow(0 18px 22px rgba(20,24,60,0.22))' });
      d.firstChild.setAttribute('width', '100%'); d.firstChild.setAttribute('height', '100%'); $('#text').appendChild(d); return d; });
    this.give = UI.glass(GIVE.w, GIVE.h, 48, { tint: 0.6 }); this.give.inner.innerHTML = PANEL('Отдаёте', 'Доступно: 40,000.40 USDT', 'usdt', 'USDT', UI.ink);
    this.get = UI.glass(GET.w, GET.h, 48, { tint: 0.6 }); this.get.inner.innerHTML = PANEL('Получаете', 'Баланс: 0.5 BTC', 'btc', 'BTC', '#b9bdc4');
    this.icons = [this.give.inner.querySelector('[data-ic]'), this.get.inner.querySelector('[data-ic]')];
    this.btn = UI.glass(116, 116, 58, { tint: 0.85 });
    this.btn.inner.innerHTML = `<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center"><svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="#2a6fe3" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 4v15M4.5 15.5L8 19l3.5-3.5"/><path d="M16 20V5M12.5 8.5L16 5l3.5 3.5"/></svg></div>`;
    this.btn.style.zIndex = '6';
    this.pcts = ['25%', '50%', '75%', 'Макс'].map(l => { const c = UI.glass(196, 92, 30, { tint: 0.6 }); c.inner.innerHTML = `<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-family:${UI.F};font-size:32px;font-weight:600;color:${UI.ink}">${l}</div>`; return c; });
    this.fees = UI.glass(900, 388, 48, { tint: 0.6 }); this.fees.inner.innerHTML = FEES;
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
    LG.reset();
    LG.F.white = 1;
    Object.assign(LG.G, LENS);
    this.h.forEach(([h, a, b]) => win(h, t, a, b, b - 0.25));
    const out = iC(prog(t, S(6) - 0.45, S(6) + 0.1));                      // the screen turns away like a page
    const up = ioC(prog(t, S(4), S(4) + 0.7)), ks = lerp(1, 0.86, up);
    const gy = lerp(735, 600, up), gy2 = gy + (GIVE.h / 2 + 22 + GET.h / 2) * ks;
    // ---- the pair: two bubbles with a coin each, orbiting a step on every beat, trading places on the drop
    const k = Math.floor(t / BT), f = oX(clamp((t - k * BT) / 0.28));
    let ang = (Math.min(k, 7) + (k < 8 ? f : 0)) * 0.55 + 0.2 + t * 0.15;
    ang += oX(prog(t, S(2) - 0.14, S(2) + 0.36)) * Math.PI;
    const dock = ioC(prog(t, S(2) + 0.25, S(2) + 1.0));
    const pin = oX(prog(t, S(2) + 0.35, S(2) + 0.95));                    // the panels slide in from the sides
    [['usdt', 0, 0], ['btc', Math.PI, 1]].forEach(([sym, ph, i]) => {
      const a = ang + ph, ox = 540 + Math.cos(a) * 232, oy = 930 + Math.sin(a) * 64, depth = (Math.sin(a) + 1) / 2;
      const px = 540 + (1 - pin) * 300 * (i ? 1 : -1);
      const P = { x: px + ICON_AT.x * ks, y: (i ? gy2 : gy) + ICON_AT.y * ks };
      const d = lerp(206 * (0.88 + 0.24 * depth), 60 * ks, dock);
      const handed = t > S(2) + 1.0;                                     // the panel's own icon takes over, same drawing
      const ce = this.coinEl[i], cx = lerp(ox, P.x, dock), cy = lerp(oy, P.y, dock);
      ce.style.display = handed ? 'none' : '';
      ce.style.transform = `translate(${(cx - 150).toFixed(2)}px, ${(cy - 150).toFixed(2)}px) scale(${(d / 300).toFixed(4)})`;
      ce.style.filter = `drop-shadow(0 ${(18 * (1 - dock)).toFixed(1)}px ${(22 * (1 - dock) + 2).toFixed(1)}px rgba(20,24,60,${(0.22 * (1 - dock)).toFixed(3)}))`;
      const ld = lerp(290 * (0.88 + 0.24 * depth), 0, oX(prog(t, S(2) + 0.15, S(2) + 0.6)));
      if (ld > 2) LG.S.push({ x: lerp(ox, P.x, dock), y: lerp(oy, P.y, dock), w: ld, h: ld, k: 120 });
      this.icons[i].style.visibility = handed ? 'visible' : 'hidden';
    });
    // ---- the panels (from opposite sides), the button between them, the percent chips
    const slide = (p, dir) => ({ x: 540 + (1 - pin) * 300 * dir - out * 900, ry: (1 - pin) * -30 * dir + out * 70 });
    const sg = slide(this.give, -1), sg2 = slide(this.get, 1);
    this.give.set({ ...sg, y: gy, s: ks, o: clamp(pin * 2.5), vis: t > S(2) + 0.35 && out < 1 });
    this.get.set({ ...sg2, y: gy2, s: ks, o: clamp(pin * 2.5), vis: t > S(2) + 0.35 && out < 1 });
    const ba = oX(prog(t, S(2) + 0.8, S(2) + 1.2)), spin = oX(prog(t, S(3), S(3) + 0.5)) * 180, tap = Math.sin(Math.PI * prog(t, S(3) - 0.06, S(3) + 0.22));
    this.btn.set({ x: 540 - out * 900, y: (gy + gy2) / 2, s: Math.max(0.001, ba * ks * (1 - tap * 0.1)), o: clamp(ba * 3), vis: ba > 0.01 && out < 1 });
    this.btn.inner.style.transform = `rotate(${spin.toFixed(2)}deg)`;
    this.pcts.forEach((c, i) => {
      const t0 = S(3) + BT + i * BT / 2, a = oX(prog(t, t0, t0 + 0.4)), b = iC(prog(t, S(4) - 0.25 + i * 0.04, S(4) + 0.05 + i * 0.04));
      c.set({ x: 540 + (i - 1.5) * 222, y: gy2 + GET.h / 2 + 96 - (1 - a) * 34 + b * 60, o: clamp(a * 3) * (1 - b), vis: t > t0 && b < 1 });
    });
    // ---- the fee lines
    const fy = gy2 + GET.h / 2 * ks + 30 + 388 / 2 * ks, fa = oX(prog(t, S(4) + 0.3, S(4) + 0.9));
    this.fees.set({ x: 540 - out * 900, y: fy + (1 - fa) * 50, s: ks, ry: out * 70, o: clamp(fa * 2.5), vis: t > S(4) + 0.3 && out < 1 });
  },
});

endCard(S(6), 'Криптокошелёк и обмен в Telegram', DURATION, 0.7);
