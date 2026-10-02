// Vector building blocks for the Instagram reels. Every piece is HTML/SVG drawn at (or above) its
// display size, so it stays crisp at 1080x1920 — never an upscaled screenshot. Texts, numbers and
// colours follow the app's screens; coins are 3D discs with real thickness, cards have an edge.
'use strict';

const INTER = "'Inter Variable', sans-serif";
// absolutely positioned element inside a Node (or element)
function vEl(parent, style = {}, html = '') {
  const e = document.createElement('div');
  Object.assign(e.style, { position: 'absolute' }, style);
  if (html) e.innerHTML = html;
  (parent.el || parent).appendChild(e);
  return e;
}
const px = v => v.toFixed(2) + 'px';
function shade(hex, a) {
  const n = parseInt(hex.slice(1), 16), c = [n >> 16, (n >> 8) & 255, n & 255];
  const m = c.map(v => Math.round(a > 0 ? v + (255 - v) * a : v * (1 + a)));
  return `rgb(${m.join(',')})`;
}
const SHADOW = (k = 1) => `0 ${px(34 * k)} ${px(70 * k)} -${px(30 * k)} rgba(22,48,104,0.38), 0 ${px(10 * k)} ${px(22 * k)} -${px(12 * k)} rgba(22,48,104,0.18), inset 0 0 0 ${px(1.5)} rgba(255,255,255,0.9)`;
const TEXT = (size, weight = 500, color = '#121317', extra = {}) => ({ fontFamily: INTER, fontVariationSettings: "'opsz' 32", fontSize: px(size), fontWeight: String(weight), color, whiteSpace: 'nowrap', lineHeight: '1', fontVariantNumeric: 'tabular-nums', ...extra });

// ------------------------------------------------------------------ coins
const COIN = {
  usdt: { c: '#26a17b', logo: '<rect x="24" y="23" width="52" height="13" rx="2.5"/><rect x="43.5" y="28" width="13" height="52" rx="2.5"/><ellipse cx="50" cy="51" rx="29" ry="8.6" fill="none" stroke="#fff" stroke-width="4.6"/>' },
  usdc: { c: '#2775ca', logo: '<circle cx="50" cy="50" r="33" fill="none" stroke="#fff" stroke-width="6" stroke-dasharray="80.6 23.1" stroke-dashoffset="40.3"/><text x="50" y="66.5" text-anchor="middle" font-size="47" font-weight="800" font-family="Inter Variable">$</text>' },
  btc: { c: '#f7931a', logo: '<g transform="rotate(14 50 50)"><rect x="38" y="14" width="5.5" height="14" rx="1.5"/><rect x="50" y="14" width="5.5" height="14" rx="1.5"/><rect x="38" y="72" width="5.5" height="14" rx="1.5"/><rect x="50" y="72" width="5.5" height="14" rx="1.5"/><text x="51" y="72" text-anchor="middle" font-size="62" font-weight="800" font-family="Inter Variable">B</text></g>' },
  eth: { c: '#627eea', logo: '<polygon points="50,11 26,51 50,63" fill-opacity="1"/><polygon points="50,11 74,51 50,63" fill-opacity="0.75"/><polygon points="50,68 26,55 50,89" fill-opacity="1"/><polygon points="50,68 74,55 50,89" fill-opacity="0.75"/><polygon points="26,51 50,40 50,63" fill-opacity="0.55"/>' },
  trx: { c: '#ef0027', logo: '<path d="M22 24 L80 35 L46 84 Z M22 24 L59 53 L80 35 M59 53 L46 84" fill="none" stroke="#fff" stroke-width="5.2" stroke-linejoin="round" stroke-linecap="round"/>' },
};
const coinSvg = sym => `<svg viewBox="0 0 100 100" width="100%" height="100%" style="display:block"><g fill="#fff">${COIN[sym].logo}</g></svg>`;
// a flat coin icon (inside pills and rows)
function coinFlat(parent, sym, d, style = {}) {
  const e = vEl(parent, { width: px(d), height: px(d), borderRadius: '50%', background: COIN[sym].c, ...style });
  vEl(e, { left: '16%', top: '16%', width: '68%', height: '68%' }, coinSvg(sym));
  return e;
}

// a 3D coin: N edge discs between two faces (thickness T x D), radial shading, a sheen
class VCoin extends Node {
  constructor(parent, sym, D = 260, { T = 0.1, N = 12 } = {}) {
    super(parent, { w: D, h: D });
    const C = COIN[sym], th = D * T;
    this.D = D; this.th = th;
    for (let i = 0; i < N; i++) {
      const z = -th / 2 + 0.6 + (th - 1.2) * i / (N - 1);
      vEl(this, { left: '0.6px', top: '0.6px', width: px(D - 1.2), height: px(D - 1.2), borderRadius: '50%', transform: `translateZ(${px(z)})`,
        background: `linear-gradient(90deg, ${shade(C.c, -0.42)}, ${shade(C.c, -0.18)} 50%, ${shade(C.c, -0.42)})` });
    }
    this.sheens = [false, true].map(back => {
      const f = vEl(this, { left: '0px', top: '0px', width: px(D), height: px(D), borderRadius: '50%', backfaceVisibility: 'hidden', overflow: 'hidden',
        transform: `${back ? 'rotateY(180deg) ' : ''}translateZ(${px(th / 2)})`,
        background: `radial-gradient(circle at 34% 28%, ${shade(C.c, 0.3)}, ${C.c} 52%, ${shade(C.c, -0.2)})`,
        boxShadow: `inset 0 0 0 ${px(D * 0.034)} rgba(255,255,255,0.2), inset 0 ${px(-D * 0.04)} ${px(D * 0.09)} rgba(0,0,0,0.18)` });
      vEl(f, { left: '17%', top: '17%', width: '66%', height: '66%', filter: `drop-shadow(0 ${px(D * 0.008)} ${px(D * 0.01)} rgba(0,0,0,0.18))` }, coinSvg(sym));
      return vEl(f, { left: '0px', top: '0px', width: '100%', height: '100%',
        background: 'linear-gradient(115deg, rgba(255,255,255,0) 38%, rgba(255,255,255,0.55) 50%, rgba(255,255,255,0) 62%)', backgroundSize: '300% 100%', mixBlendMode: 'soft-light' });
    });
  }
  shine(p) { for (const s of this.sheens) s.style.backgroundPosition = `${(130 - p * 160).toFixed(1)}% 0`; }
}

// ------------------------------------------------------------------ card (holographic or metal) with an edge
const MC_SVG = '<svg viewBox="0 0 100 62" width="100%" height="100%" style="display:block"><circle cx="31" cy="31" r="31" fill="#eb001b"/><circle cx="69" cy="31" r="31" fill="#f79e1b"/><path d="M50 6.5 A31 31 0 0 1 50 55.5 A31 31 0 0 1 50 6.5 Z" fill="#ff5f00"/></svg>';
class VCard extends Node {
  constructor(parent, { W = 900, metal = false, sub = 'Карта #2', bal = '$25,000.00', last = '4827' } = {}) {
    const k = W / 826, H = Math.round(523 * k), r = 48 * k, th = 7;
    super(parent, { w: W, h: H });
    this.W = W; this.H = H;
    for (let i = 0; i < 6; i++) {
      vEl(this, { left: '0.5px', top: '0.5px', width: px(W - 1), height: px(H - 1), borderRadius: px(r), transform: `translateZ(${px(-th / 2 + 0.4 + (th - 0.8) * i / 5)})`,
        background: metal ? 'linear-gradient(90deg,#1f2226,#4a4f57,#1f2226)' : 'linear-gradient(90deg,#b9bfd8,#eef0f8,#b9bfd8)' });
    }
    const ink = metal ? '#f3f4f6' : '#121317', sub2 = metal ? '#b7bcc5' : '#5d606c';
    this.faces = [false, true].map(back => {
      const f = vEl(this, { left: '0px', top: '0px', width: px(W), height: px(H), borderRadius: px(r), overflow: 'hidden', backfaceVisibility: 'hidden',
        transform: `${back ? 'rotateY(180deg) ' : ''}translateZ(${px(th / 2)})`, boxShadow: `inset 0 0 0 ${px(1.5)} rgba(255,255,255,${metal ? 0.18 : 0.7})` });
      f.className = metal ? 'v-metal' : 'v-holo';
      if (!back) {
        vEl(f, { left: px(46 * k), top: px(40 * k), ...TEXT(46 * k, 700, ink, { letterSpacing: '-0.01em' }) }, 'INCPT');
        vEl(f, { left: px(46 * k), top: px(98 * k), ...TEXT(27 * k, 500, sub2) }, sub);
        vEl(f, { left: px(681 * k), top: px(46 * k), width: px(100 * k), height: px(62 * k) }, MC_SVG);
        this.bal = vEl(f, { left: px(46 * k), top: px(425 * k), ...TEXT(50 * k, 600, ink, { letterSpacing: '-0.01em' }) }, bal);
        vEl(f, { right: px(46 * k), top: px(438 * k), ...TEXT(31 * k, 500, metal ? '#c9cdd4' : '#6c6f7c', { letterSpacing: '0.08em' }) }, '••••&nbsp;' + last);
      } else {
        vEl(f, { left: px(46 * k), top: px(40 * k), ...TEXT(46 * k, 700, ink, { opacity: 0.55 }) }, 'INCPT');
      }
      return f;
    });
  }
  // p: sheen sweep 0..1; hue: iridescence shift (follows the card's turn)
  shine(p, hue = 0) {
    for (const f of this.faces) { f.style.setProperty('--sx', `${(130 - p * 160).toFixed(1)}%`); f.style.setProperty('--hx', `${(hue % 200).toFixed(1)}%`); }
  }
}

// ------------------------------------------------------------------ app panels (white, rounded, contour shadow)
function vPanel(node, W, H, r, bg = '#fbfbfc') {
  return vEl(node, { left: '0px', top: '0px', width: px(W), height: px(H), borderRadius: px(r), background: bg, boxShadow: SHADOW(W / 900) });
}
const ARROW = {
  out: (c, w) => `<svg viewBox="0 0 100 100" width="100%" height="100%"><path d="M66 66 L34 34 M34 34 L34 58 M34 34 L58 34" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>`,
  in: (c, w) => `<svg viewBox="0 0 100 100" width="100%" height="100%"><path d="M34 34 L66 66 M66 66 L66 42 M66 66 L42 66" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>`,
  recv: (c, w) => `<svg viewBox="0 0 100 100" width="100%" height="100%"><path d="M70 30 L30 70 M30 70 L30 44 M30 70 L56 70" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>`,
  send: (c, w) => `<svg viewBox="0 0 100 100" width="100%" height="100%"><path d="M30 70 L70 30 M70 30 L44 30 M70 30 L70 56" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>`,
  swap: (c, w) => `<svg viewBox="0 0 100 100" width="100%" height="100%"><path d="M38 26 L38 74 M38 74 L26 62 M38 74 L50 62 M62 74 L62 26 M62 26 L50 38 M62 26 L74 38" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>`,
};

// an operation row from «Операции»
class VRow extends Node {
  constructor(parent, { W = 900, title, chip, date, amount, status, dir = 'out' }) {
    const k = W / 846, H = Math.round(186 * k);
    super(parent, { w: W, h: H, flat: true });
    vPanel(this, W, H, 44 * k);
    const ic = vEl(this, { left: px(32 * k), top: px(43 * k), width: px(100 * k), height: px(100 * k), borderRadius: '50%', background: '#f2f3f6', boxShadow: `inset 0 0 0 ${px(1.5)} rgba(255,255,255,0.9)` });
    vEl(ic, { left: '22%', top: '22%', width: '56%', height: '56%' }, ARROW[dir](dir === 'in' ? '#2fa55a' : '#2f6fe8', 7));
    const line = vEl(this, { left: px(163 * k), top: px(38 * k), display: 'flex', alignItems: 'center', gap: px(18 * k) });
    vEl(line, { position: 'relative', ...TEXT(34 * k, 600) }, title);
    vEl(line, { position: 'relative', ...TEXT(22 * k, 500, '#4b4e58'), padding: `${px(8 * k)} ${px(16 * k)}`, borderRadius: px(20 * k), background: '#eeeff3' }, chip);
    vEl(this, { left: px(163 * k), top: px(110 * k), ...TEXT(27 * k, 450, '#8b8d96') }, date);
    vEl(this, { right: px(38 * k), top: px(40 * k), ...TEXT(36 * k, 600, dir === 'in' ? '#2fa55a' : '#121317') }, amount);
    vEl(this, { right: px(38 * k), top: px(110 * k), ...TEXT(27 * k, 450, '#8b8d96') }, status);
  }
}

// a white pill button (Получить / Обменять / Отправить)
class VPill extends Node {
  constructor(parent, { icon, text, W = 500, H = 150 }) {
    super(parent, { w: W, h: H, flat: true });
    vPanel(this, W, H, H / 2, '#ffffff');
    const row = vEl(this, { left: '0px', top: '0px', width: px(W), height: px(H), display: 'flex', alignItems: 'center', justifyContent: 'center', gap: px(H * 0.12) });
    vEl(row, { position: 'relative', width: px(H * 0.36), height: px(H * 0.36) }, ARROW[icon]('#15161a', 7.5));
    vEl(row, { position: 'relative', ...TEXT(H * 0.3, 560) }, text);
  }
}

// a chip (20–40% APY, the daily forecast, ...)
class VChip extends Node {
  constructor(parent, { html, size = 40, color = '#23a455', bg = '#e8f6ec', W = 0, H = 0, r = 0 }) {
    const h = H || Math.round(size * 1.9);
    super(parent, { w: W || 600, h, flat: true });
    const e = vEl(this, { left: '50%', top: '0px', height: px(h), transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', padding: `0 ${px(size * 0.6)}`,
      borderRadius: px(r || h / 2), background: bg, boxShadow: SHADOW(0.7), ...TEXT(size, 650, color) }, html);
    this.box = e;
  }
}

// the swap screen: a panel shell (Отдаёте / Получаете) and the coin content that moves between
// the two panels when ⇅ is pressed (in the app the coins trade places, the labels stay)
const SWAP_K = W => W / 834;
class VSwapShell extends Node {
  constructor(parent, { W = 900, label }) {
    const k = SWAP_K(W), H = Math.round(337 * k);
    super(parent, { w: W, h: H, flat: true });
    vPanel(this, W, H, 46 * k, '#ffffff');
    vEl(this, { left: px(37 * k), top: px(46 * k), ...TEXT(30 * k, 500, '#6d6f78') }, label);
  }
}
class VSwapContent extends Node {
  constructor(parent, { W = 900, right, sym, code }) {
    const k = SWAP_K(W), H = Math.round(337 * k);
    super(parent, { w: W, h: H, flat: true });
    vEl(this, { right: px(37 * k), top: px(48 * k), ...TEXT(27 * k, 450, '#7b7d86') }, right);
    const pill = vEl(this, { left: px(37 * k), top: px(155 * k), height: px(102 * k), display: 'flex', alignItems: 'center', gap: px(16 * k), padding: `0 ${px(26 * k)} 0 ${px(16 * k)}`, borderRadius: px(51 * k), background: '#f0f0f3' });
    this.icon = coinFlat(pill, sym, 68 * k, { position: 'relative' });
    vEl(pill, { position: 'relative', ...TEXT(33 * k, 600) }, code);
    vEl(pill, { position: 'relative', width: px(26 * k), height: px(26 * k) }, '<svg viewBox="0 0 24 24" width="100%" height="100%"><path d="M5 9 L12 16 L19 9" stroke="#8b8d96" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>');
    this.amt = vEl(this, { right: px(37 * k), top: px(140 * k), ...TEXT(88 * k, 700, '#121317', { letterSpacing: '-0.02em' }) }, '0');
    this.usd = vEl(this, { right: px(37 * k), top: px(252 * k), ...TEXT(30 * k, 450, '#7b7d86') }, '≈ $0.00');
    this.iconAt = [(37 + 16 + 34) * k - W / 2, (155 + 51) * k - H / 2];   // coin icon centre, from the node's centre
  }
  value(a, usd, dim = false) {
    if (this.amt.innerHTML !== a) this.amt.innerHTML = a;
    if (this.usd.innerHTML !== usd) this.usd.innerHTML = usd;
    this.amt.style.color = dim ? '#c3c4ca' : '#121317';
  }
}

// the round ⇅ button
class VSwapBtn extends Node {
  constructor(parent, D = 150) {
    super(parent, { w: D, h: D, flat: true });
    vEl(this, { left: '0px', top: '0px', width: px(D), height: px(D), borderRadius: '50%', background: '#fff',
      boxShadow: `0 ${px(D * 0.1)} ${px(D * 0.3)} -${px(D * 0.04)} rgba(47,111,232,0.5), inset 0 0 0 ${px(1.5)} rgba(255,255,255,0.9)` });
    this.ic = vEl(this, { left: '25%', top: '25%', width: '50%', height: '50%' }, ARROW.swap('#2f6fe8', 8));
  }
}

// rate and fees (the table under the swap panels)
class VTable extends Node {
  constructor(parent, { W = 900, rows }) {
    const k = W / 834, rh = 92 * k, pad = 34 * k, H = Math.round(rows.length * rh + 2 * pad);
    super(parent, { w: W, h: H, flat: true });
    vPanel(this, W, H, 46 * k, '#ffffff');
    this.hl = vEl(this, { left: px(18 * k), width: px(W - 36 * k), height: px(rh - 8 * k), borderRadius: px(26 * k), opacity: '0', background: 'linear-gradient(95deg, rgba(95,211,192,0.18), rgba(90,169,242,0.18) 40%, rgba(138,139,241,0.18) 70%, rgba(191,140,243,0.18))' });
    this.rows = rows.map(([l, v, pill], i) => {
      const y = pad + i * rh;
      vEl(this, { left: px(37 * k), top: px(y + rh / 2 - 15 * k), ...TEXT(30 * k, 500, '#6d6f78') }, l);
      const st = pill ? { padding: `${px(8 * k)} ${px(18 * k)}`, borderRadius: px(20 * k), background: '#e7effd', ...TEXT(26 * k, 600, '#2f6fe8') } : TEXT(30 * k, 600, '#121317');
      vEl(this, { right: px(37 * k), top: px(y + rh / 2 - (pill ? 21 : 15) * k), ...st }, v);
      return y;
    });
    this.rh = rh; this.k = k;
  }
  // highlight row i (fractional values glide between rows; < 0 hides)
  mark(i, o = 1) {
    this.hl.style.opacity = clamp(o).toFixed(3);
    if (o > 0) this.hl.style.top = px(this.rows[0] + Math.max(0, i) * this.rh + 4 * this.k);
  }
}

// the Liquid Vault deposit card
class VDeposit extends Node {
  constructor(parent, { W = 900 } = {}) {
    const k = W / 826, H = Math.round(232 * k);
    super(parent, { w: W, h: H, flat: true });
    vPanel(this, W, H, 44 * k, '#ffffff');
    const ic = vEl(this, { left: px(37 * k), top: px(52 * k), width: px(110 * k), height: px(110 * k), borderRadius: '50%', background: '#e6f6ea' });
    vEl(ic, { left: '27%', top: '22%', width: '46%', height: '56%' }, '<svg viewBox="0 0 40 50" width="100%" height="100%"><path d="M20 4 C 13 15 6 23 6 31 A14 14 0 0 0 34 31 C 34 23 27 15 20 4 Z" fill="none" stroke="#33b456" stroke-width="4.2" stroke-linejoin="round"/></svg>');
    vEl(this, { left: px(175 * k), top: px(48 * k), ...TEXT(34 * k, 650) }, 'Liquid Vault');
    vEl(this, { left: px(175 * k), top: px(102 * k), ...TEXT(30 * k, 450, '#6d6f78') }, '20,000.00 USDT');
    vEl(this, { left: px(175 * k), top: px(152 * k), ...TEXT(28 * k, 500, '#2fa55a'), display: 'flex', alignItems: 'center', gap: px(14 * k) },
      `<span style="display:inline-block;width:${px(16 * k)};height:${px(16 * k)};border-radius:50%;background:#33b456"></span>Депозит активен`);
    vEl(this, { left: px(500 * k), top: px(45 * k), width: px(2), height: px(145 * k), background: '#e7e8ec' });
    vEl(this, { left: px(540 * k), top: px(62 * k), ...TEXT(27 * k, 450, '#6d6f78') }, 'Прогноз сегодня');
    vEl(this, { left: px(540 * k), top: px(110 * k), ...TEXT(42 * k, 650, '#2fa55a') }, '≈ $14.42');
  }
}

// a big number with its caption on a white panel ($20,000.00 · Всего в стейкинге)
class VStat extends Node {
  constructor(parent, { W = 640, value, caption }) {
    const H = Math.round(W * 0.34);
    super(parent, { w: W, h: H, flat: true });
    vPanel(this, W, H, H * 0.28, '#ffffff');
    vEl(this, { left: '0px', width: px(W), top: px(H * 0.17), textAlign: 'center', ...TEXT(H * 0.4, 650, '#121317', { letterSpacing: '-0.02em' }) }, value);
    vEl(this, { left: '0px', width: px(W), top: px(H * 0.66), textAlign: 'center', ...TEXT(H * 0.15, 450, '#6d6f78') }, caption);
  }
}
