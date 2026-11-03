// INCPT token presale, ХРОМ — 9:16, 27 s, 96 BPM "calm". Rebuilt from scratch in the welcome reel's
// language: one liquid-glass body flows through the film — a coin (the chrome mark in a lens), a slab
// under the phone, three rows of the valuation sum, one presale ticket, two tiles, the coin again.
// Every fact is on the INCEPTION Coin page of INCPT Wallet: $0.50 (+1.00%), TRC-20 · TRON, «Основной
// токен экосистемы INCEPTION», the valuation example ($50M · 100M INCPT · $0.50), «Купить на пресейле ·
// 0.40 USDT · от $50,000», free transfers to other users, «Обмен откроется после листинга».
'use strict';

DURATION = 27.0;
const B = 60 / 96;
const T1 = 8 * B, T2 = 15 * B, T3 = 22 * B, T4 = 29 * B, T5 = 34 * B;
META = { drop: T1, end: T5, bpm: 96, music: 'calm', key: 2 };
const oC = Ease.outCubic, iC = Ease.inCubic;
drawBg = t => LG.draw(t);

const LENS = { x: 540, y: 800, d: 790 };
const ROWS = [790, 1050, 1310].map(y => ({ x: 540, y, w: 880, h: 220, r: 60 }));
const TICKET = { x: 540, y: 1090, w: 900, h: 900, r: 96 };
const TILES = [{ x: 300, y: 1110, w: 440, h: 560, r: 76 }, { x: 780, y: 1110, w: 440, h: 560, r: 76 }];
const BODY = new LiquidBody([
  { t: 0, shapes: [{ x: LENS.x, y: LENS.y, w: LENS.d, h: LENS.d }], look: GLASS.lens },
  { t: T1 - 0.45, dur: 0.8, shapes: [{ x: 540, y: 1300, w: 860, h: 1120, r: 100 }], look: GLASS.slab },
  { t: T2 - 0.4, dur: 0.9, shapes: ROWS, look: GLASS.tile, k: 0 },
  { t: T3 - 0.4, dur: 0.85, shapes: [TICKET], look: GLASS.panel },
  { t: T4 - 0.35, dur: 0.85, shapes: TILES, look: GLASS.tile, k: 0 },
  { t: T5 - 0.5, dur: 0.45, shapes: [{ x: 540, y: 780, w: 300, h: 300 }], look: GLASS.lens },
]);
const PS_STAR = s => `<svg viewBox="0 0 24 24" width="${s}" height="${s}"><defs><linearGradient id="psc${s}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#a6dc1e"/><stop offset="0.45" stop-color="#45c8b2"/><stop offset="1" stop-color="#7357ff"/></linearGradient></defs><circle cx="12" cy="12" r="12" fill="url(#psc${s})"/><path d="M11 5.2 C11.45 8.6 12.4 9.55 15.8 10 C12.4 10.45 11.45 11.4 11 14.8 C10.55 11.4 9.6 10.45 6.2 10 C9.6 9.55 10.55 8.6 11 5.2 Z M15.6 13.6 C15.78 14.98 16.12 15.32 17.5 15.5 C16.12 15.68 15.78 16.02 15.6 17.4 C15.42 16.02 15.08 15.68 13.7 15.5 C15.08 15.32 15.42 14.98 15.6 13.6 Z" fill="#fff"/></svg>`;
// a block of DOM content that rises in at t0 and lifts out at t1
function block(el, t, t0, t1, { dy = 40, blur = 14 } = {}) {
  const pi = Ease.outExpo(prog(t, t0, t0 + 0.7));
  const po = t1 === null ? 0 : Ease.inCubic(prog(t, t1, t1 + 0.3));
  const o = clamp(prog(t, t0, t0 + 0.7) * 3) * (1 - po);
  if (el._disp === undefined) el._disp = el.style.display;      // keep a flex layout when it shows again
  el.style.display = o > 0.002 ? el._disp : 'none';
  el.style.opacity = o.toFixed(3);
  el.style.transform = `translateY(${((1 - pi) * dy - po * 30).toFixed(2)}px)`;
  const b = (1 - pi) * blur + po * 12;
  el.style.filter = b > 0.1 ? `blur(${b.toFixed(2)}px)` : '';
}
function div(css, html = '') {
  const el = document.createElement('div');
  el.className = 'wl';
  el.style.cssText += css;
  el.innerHTML = html;
  $('#text').appendChild(el);
  return el;
}
const TAG = 'font-weight:600;font-size:30px;letter-spacing:0.24em;text-transform:uppercase;color:#8b8e96;';

// ======================================================================= 0. FIELD + BODY
scene({
  init() { LG.init(); this.logo = mkImg('style/logo_chrome.png'); LG.IMG = { logo: this.logo }; },
  update(t) {
    LG.reset();
    LG.F.sy = t * 9;
    if (t < T1 - 0.45) liquidIntro(t, LENS);
    else if (t < T5) BODY.at(t);
  },
});

// ======================================================================= 1. THE COIN (0 – 5.0)
scene({
  init() {
    this.tag = new WText('Пресейл токена', { y: 1262, size: 30, cls: 'wl-tag', track: 0.24 });
    this.name = new WText('INCPT', { y: 1308, size: 236, chars: true, track: -0.05 });
    this.sub = new WText('Основной токен экосистемы INCEPTION', { y: 1570, size: 40, cls: 'wl-s' });
    cue(0.05, 'shimmer', { gain: 0.3 });
    cue(0.4, 'whoosh', { dur: 1.6, gain: 0.35 });
    cue(2.15, 'impact', { gain: 0.6, soft: true });
    cue(2.3, 'coin', { gain: 0.45 });
    [0, 1, 2, 3, 4].forEach(i => cue(3.05 + i * 0.07, 'tick', { gain: 0.25 }));
    cue(3.6, 'pop', { gain: 0.4, pitch: 0.9 });
  },
  update(t) {
    this.tag.at(t, 2.7, T1 - 0.55, { dur: 0.7 });
    this.name.at(t, 2.95, T1 - 0.5, { stagger: 0.07, dur: 0.8, dy: 0.32, blur: 22 });
    this.sub.at(t, 3.5, T1 - 0.45, { stagger: 0.05 });
    const pin = oC(prog(t, 1.75, 2.9)), pout = iC(prog(t, T1 - 0.6, T1 - 0.1)), fl = Math.max(0, t - 2.9);
    if (pin > 0 && pout < 1) {
      LG.T.push({
        img: LG.IMG.logo, x: LENS.x + Math.sin(fl * 0.8) * 4, y: LENS.y + 10 - fl * 3 + (1 - pin) * 40 + pout * 60,
        h: lerp(470, 610, pin) * (1 - 0.25 * pout), rot: lerp(-10, 0, pin) + Math.sin(fl * 0.9) * 1.2,
        o: clamp(pin * 2) * (1 - pout), lod: (1 - pin) * 4 + pout * 3, shadow: 0.55, front: true,   // on the lens, never bent by it
      });
    }
  },
});

// ======================================================================= 2. IN THE APP (5.0 – 9.4)
scene({
  init() {
    this.head = new WText('INCEPTION ~Coin', { y: 196, size: 118, fit: 1000 });
    this.sub = new WText('уже в INCPT Wallet', { y: 318, size: 50, cls: 'wl-s' });
    this.phone = new Phone($('#cam'), 'ps_coin');
    this.phone.set({ vis: false });
    this.chips = [
      chip(`<span class="wl-chip" style="font-size:54px;font-weight:800;letter-spacing:-0.03em">$0.50</span><span style="font:600 28px 'Geologica Variable';color:#2f9e5b;background:rgba(60,190,110,0.14);padding:7px 14px;border-radius:999px">+1.00%</span>`, 360, 124, { tint: 0.42, blur: 10 }),
      chip(`<span style="width:22px;height:22px;border-radius:50%;background:#0b0b0d"></span><span class="wl-chip">TRC-20 · TRON</span>`, 400, 112, { tint: 0.42, blur: 10 }),
      chip(`${PS_STAR(60)}<span class="wl-chip">Купить на пресейле</span>`, 470, 116, { tint: 0.42, blur: 10 }),
    ];
    cue(T1 - 0.45, 'whoosh', { dur: 0.7, gain: 0.5 });
    cue(T1 + 0.05, 'impact', { gain: 0.6, soft: true });
    [0, 1, 2].forEach(i => cue(T1 + 0.95 + i * B * 1.5, 'pop', { gain: 0.5, pitch: 0.9 + i * 0.1 }));
    cue(T2 - 0.45, 'whoosh', { dur: 0.55, gain: 0.45 });
  },
  update(t) {
    this.head.at(t, T1 + 0.15, T2 - 0.5);
    this.sub.at(t, T1 + 0.45, T2 - 0.48, { stagger: 0.06 });
    const on = t > T1 - 0.3 && t < T2 + 0.2;
    if (!on) { this.phone.set({ vis: false }); this.chips.forEach(c => (c.style.display = 'none')); return; }
    const pin = Ease.outExpo(prog(t, T1 - 0.1, T1 + 0.9)), pout = iC(prog(t, T2 - 0.45, T2)), fl = t - T1;
    this.phone.set({
      vis: true, x: Math.sin(fl * 0.7) * 6, y: 340 + (1 - pin) * 1250 + pout * 1300,
      s: 0.5, rx: lerp(22, 4, pin) + Math.sin(fl * 0.8) * 1.2 + pout * 18, ry: lerp(-14, -5, pin) + Math.sin(fl * 0.55) * 2.5, rz: lerp(-3, 0, pin),
    });
    const tout = T2 - 0.5;
    this.chips[0].place(t, T1 + 0.95, tout, 222, 985, { dx: -120, ph: 0 });
    this.chips[1].place(t, T1 + 0.95 + 1.5 * B, tout + 0.06, 846, 1235, { dx: 120, ph: 1.4 });
    this.chips[2].place(t, T1 + 0.95 + 3 * B, tout + 0.12, 300, 1480, { dx: -120, ph: 2.6 });
  },
});

// ======================================================================= 3. THE VALUE (9.4 – 13.75)
// the slab splits into three rows: $50M ÷ 100M INCPT = $0.50, the example from the coin page
scene({
  init() {
    this.head = new WText('Стоимость —\nот ~оценки ~компании', { y: 196, size: 112, fit: 1000 });
    const R = [['Оценка компании', '$50M', ''], ['Valuation units', '100M INCPT', ''], ['Стоимость INCPT', '$0.50', 'wl-irid']];
    this.rows = R.map(([l, v, c], i) => {
      const g = ROWS[i];
      return div(`left:${g.x - g.w / 2 + 64}px;top:${g.y - 60}px;width:${g.w - 128}px;height:120px;display:flex;align-items:center;justify-content:space-between;`,
        `<span style="font-weight:500;font-size:36px;color:#5f626b">${l}</span><span class="${c}" style="font-weight:800;font-size:${i === 2 ? 84 : 66}px;letter-spacing:-0.04em;color:${c ? 'transparent' : '#0b0b0d'}">${v}</span>`);
    });
    this.ops = ['÷', '='].map(s => chip(`<span style="font:700 50px 'Geologica Variable';color:#0b0b0d;margin-top:-6px">${s}</span>`, 100, 100));
    this.note = div(`left:0px;top:1455px;width:${W}px;text-align:center;font-weight:500;font-size:31px;color:#8b8e96;`, 'Пример расчёта со страницы монеты в приложении');
    cue(T2 + 0.05, 'impact', { gain: 0.45, soft: true });
    [0, 1, 2].forEach(i => cue(T2 + 0.55 + i * B, 'pop', { gain: 0.5, pitch: 0.85 + i * 0.15 }));
    cue(T2 + 0.55 + 2 * B + 0.05, 'coin', { gain: 0.5 });
    cue(T3 - 0.45, 'whoosh', { dur: 0.6, gain: 0.45 });
  },
  update(t) {
    this.head.at(t, T2 + 0.1, T3 - 0.5);
    this.rows.forEach((el, i) => block(el, t, T2 + 0.55 + i * B, T3 - 0.55 + i * 0.05));
    this.ops[0].place(t, T2 + 0.55 + 0.5 * B, T3 - 0.5, 540, 920, { dy: 0, bob: 2 });
    this.ops[1].place(t, T2 + 0.55 + 1.5 * B, T3 - 0.45, 540, 1180, { dy: 0, bob: 2, ph: 1 });
    block(this.note, t, T2 + 2.0, T3 - 0.5, { dy: 20 });
  },
});

// ======================================================================= 4. THE PRESALE (13.75 – 18.1)
// the rows run together into one ticket: 0.40 USDT, purchase from $50,000
scene({
  init() {
    this.head = new WText('Купить\n~на ~пресейле', { y: 196, size: 118 });
    const T = TICKET, top = T.y - T.h / 2;
    this.tag = div(`left:0px;top:${top + 92}px;width:${W}px;text-align:center;${TAG}`, 'Цена пресейла');
    this.price = div(`left:0px;top:${top + 140}px;width:${W}px;text-align:center;font-weight:800;font-size:300px;line-height:1;letter-spacing:-0.06em;`, '<span class="wl-irid">0.40</span>');
    this.unit = div(`left:0px;top:${top + 440}px;width:${W}px;text-align:center;font-weight:800;font-size:92px;letter-spacing:-0.04em;`, 'USDT');
    this.rule = div(`left:${T.x - 300}px;top:${top + 600}px;width:600px;height:2px;background:linear-gradient(90deg,rgba(11,11,13,0),rgba(11,11,13,0.18),rgba(11,11,13,0));`);
    this.min = div(`left:0px;top:${top + 650}px;width:${W}px;text-align:center;font-weight:500;font-size:52px;color:#5f626b;`, 'Покупка от <b style="font-weight:800;color:#0b0b0d">$50,000</b>');
    cue(T3 + 0.1, 'impact', { gain: 0.55, soft: true });
    cue(T3 + 0.4, 'shimmer', { gain: 0.45 });
    [0, 1, 2, 3].forEach(i => cue(T3 + 0.55 + i * 0.07, 'tick', { gain: 0.25 }));
    cue(T3 + 1.5, 'pop', { gain: 0.5, pitch: 0.9 });
    cue(T4 - 0.4, 'whoosh', { dur: 0.55, gain: 0.45 });
  },
  update(t) {
    this.head.at(t, T3 + 0.1, T4 - 0.5);
    block(this.tag, t, T3 + 0.4, T4 - 0.55);
    block(this.price, t, T3 + 0.5, T4 - 0.52, { dy: 70, blur: 24 });
    block(this.unit, t, T3 + 0.75, T4 - 0.5);
    block(this.rule, t, T3 + 1.2, T4 - 0.5, { dy: 0 });
    block(this.min, t, T3 + 1.35, T4 - 0.48);
    if (t > T3 + 0.2 && t < T4) LG.G.sheen = lerp(-600, 2800, prog(t, T3 + 0.9, T3 + 2.6));
  },
});

// ======================================================================= 5. NETWORK + TRANSFERS (18.1 – 21.25)
scene({
  init() {
    this.head = new WText('Переводы\n~бесплатно', { y: 196, size: 118 });
    const [L, R] = TILES, top = L.y - L.h / 2;
    this.left = div(`left:${L.x - L.w / 2}px;top:${top}px;width:${L.w}px;height:${L.h}px;text-align:center;`,
      `<div style="margin-top:96px;${TAG}">Сеть</div><div style="margin-top:46px;font-weight:800;font-size:88px;letter-spacing:-0.045em;line-height:1">TRC-20</div><div class="wl-irid" style="display:inline-block;margin-top:26px;font-weight:800;font-size:72px;letter-spacing:-0.04em;line-height:1">TRON</div>`);
    this.right = div(`left:${R.x - R.w / 2}px;top:${top}px;width:${R.w}px;height:${R.h}px;text-align:center;`,
      `<div style="margin-top:72px;display:inline-block;transform:scale(1.6)">${icoDot('send')}</div><div style="margin-top:66px;font-weight:800;font-size:66px;letter-spacing:-0.04em;line-height:1">Бесплатно</div><div style="margin-top:24px;font-weight:500;font-size:33px;color:#5f626b;line-height:1.25">другим<br>пользователям</div>`);
    this.note = div(`left:0px;top:1442px;width:${W}px;text-align:center;font-weight:500;font-size:33px;color:#8b8e96;`, 'Обмен откроется после листинга');
    cue(T4 + 0.05, 'impact', { gain: 0.4, soft: true });
    [0, 1].forEach(i => cue(T4 + 0.5 + i * 0.25, 'pop', { gain: 0.5, pitch: 0.9 + i * 0.15 }));
    cue(T5 - 0.5, 'whoosh', { dur: 0.6, gain: 0.5, up: true });
  },
  update(t) {
    this.head.at(t, T4 + 0.1, T5 - 0.55);
    block(this.left, t, T4 + 0.5, T5 - 0.6);
    block(this.right, t, T4 + 0.75, T5 - 0.56);
    block(this.note, t, T4 + 1.3, T5 - 0.55, { dy: 20 });
  },
});

// ======================================================================= 6. END CARD (21.25 – 27)
chromeEnd(T5, {
  title: 'INCEPTION ~COIN', titleSize: 150, tag: 'Токен экосистемы INCEPTION', from: 0.4,
  pill: `${PS_STAR(76)}<div style="text-align:left;line-height:1.05"><div class="wl wl-s" style="position:static;font-size:26px">Пресейл</div><div class="wl-chip" style="font-size:42px;font-weight:700">presale.incpt.fi</div></div>`,
  pillW: 600, risk: 'Не является инвестиционной рекомендацией',
  y: { title: 1238, tag: 1420, pill: 1585, risk: 1745 },
});
