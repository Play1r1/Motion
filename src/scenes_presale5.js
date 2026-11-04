// INCPT token presale — 9:16, 38 s, 120 BPM (bar = 2 s), in the incpt.io brand (white canvas, navy type,
// the site's gradient, the Poppins wordmark). Cut to the generated track (assets/music/presale5_edit.json):
// the hook on take 1's boom and ticking pulse, the drop into take 2's groove, take 1's calm cinematic
// middle for the valuation, take 2's full drive for the price, take 1's closing hits for the end card.
// Every message stays 3–6 s after it has fully appeared. The shots change kind on purpose — a focus
// pull, the logo folding into the site's lock-up, a pull-back from a macro of the screen, a zoom through
// the screen, the valuation as a receipt, the price on an odometer that hands over to the real button —
// so the rhythm never repeats. Real UI only; every fact is on the INCEPTION Coin page or in the brief.
'use strict';

DURATION = 38.0;
META = { drop: 6.0, end: 34.0, bpm: 120, musicEdit: 'assets/music/presale5_edit.json', sfxGain: 0.55 };
const oC = Ease.outCubic, iC = Ease.inCubic;   // oX, ioC come from common.js
const PR = () => MANIFEST.reel;
const PHONE_S = 0.66, PHONE_Y = 262;
const TOP = 190;
drawBg = t => LG.draw(t);

// ------------------------------------------------------------------ type
const SHOW = { stagger: 0.11, dur: 0.7, dy: 0.25, blur: 6, outDur: 0.22, outStagger: 0.02, outDy: -0.12 };
const T = (text, y, size, o = {}) => new WText(text, { y, size, fit: 960, track: -0.02, ...o });
function win(txt, t, tin, tend, tout = null, opts = {}) {
  const gate = opts.gate ?? tin - 0.01;
  if (t >= tend || t < gate) { txt.el.style.display = 'none'; return; }
  txt.at(t, tin, tout, { ...SHOW, ...opts });
}
const LEAD = 0.1;
const onCut = (c, o = {}) => ({ gate: c, ...o });
function drift(el, t, t0, t1, ry0 = -2, ry1 = 2, extra = '') {
  const p = prog(t, t0, t1);
  el.style.transform = `perspective(1600px) rotateY(${lerp(ry0, ry1, p).toFixed(3)}deg) rotateX(${lerp(1.2, -1.2, p).toFixed(3)}deg)${extra}`;
}
function div(css, html = '', cls = 'wl') {
  const el = document.createElement('div');
  el.className = cls;
  el.style.cssText += css;
  el.innerHTML = html;
  $('#text').appendChild(el);
  return el;
}
const show = (el, on, disp = '') => { el.style.display = on ? disp : 'none'; return on; };
const whoosh = (t, g = 0.3, pan = 0, up = true) => cue(t - 0.09, 'whoosh', { dur: 0.4, gain: g, up, pan });
const MARK_SHADOW = 'drop-shadow(0 30px 38px rgba(19,36,64,0.18))';

// ------------------------------------------------------------------ the mark and the site's lock-up
const LOGO_AR = 743 / 1081;
function logoImg() {
  const im = mkImg('style/logo_chrome.png', 'abs');
  Object.assign(im.style, { width: '1000px', height: (1000 / LOGO_AR) + 'px', left: '0px', top: '0px', transformOrigin: '0 0', zIndex: '6' });
  $('#text').appendChild(im);
  return im;
}
// place the mark by its centre and height (px); blur for a focus pull
function placeMark(im, x, y, h, { o = 1, blur = 0, ry = 0, rx = 0 } = {}) {
  const k = h / (1000 / LOGO_AR);
  im.style.opacity = o.toFixed(3);
  im.style.transform = `translate(${(x - 500 * k).toFixed(2)}px, ${(y - h / 2).toFixed(2)}px) perspective(1800px) rotateY(${ry.toFixed(2)}deg) rotateX(${rx.toFixed(2)}deg) scale(${k.toFixed(5)})`;
  im.style.filter = `${MARK_SHADOW}${blur > 0.1 ? ` blur(${(blur / k).toFixed(2)}px)` : ''}`;
}
// the wordmark as on incpt.io: Poppins SemiBold, uppercase, tracked, navy
function wordmark(size) {
  const el = div(`left:0px;top:0px;font-size:${size}px;`, 'INCPT', 'wl wl-mark');
  el.style.zIndex = '6';
  return el;
}
// the lock-up's geometry: mark of height h, a gap, the wordmark; centred on x = 540
function lockup(wm, h, gapK = 0.17) {
  const lw = h * LOGO_AR, ww = wm.offsetWidth, gap = h * gapK;
  const left = 540 - (lw + gap + ww) / 2;
  return { logoX: left + lw / 2, wordX: left + lw + gap, ww };
}

// ------------------------------------------------------------------ the phone with the coin page
function coinPhone(cam, scroll = 0) {
  const ph = new Phone(cam, 'ps_coin');
  const M = PR(), sc = ph.screenEl, so = MANIFEST.phone.screenOffset;
  sc.innerHTML = '';
  const img = (src, parent, st) => { const im = mkImg(src, 'abs'); Object.assign(im.style, st); parent.appendChild(im); return im; };
  const pg = document.createElement('div');
  Object.assign(pg.style, { position: 'absolute', left: '0px', top: '0px', width: '920px', height: M.page.h + 'px' });
  sc.appendChild(pg);
  img(M.page.src, pg, { left: '0px', top: '0px', width: '920px', height: M.page.h + 'px' });
  const ov = k => { const o = M.overlays[k]; return img(o.src, sc, { left: '0px', top: o.y + 'px', width: '920px', height: o.h + 'px' }); };
  ph.bars = {};
  for (const k of ['recv_a', 'send_a', 'recv_b', 'send_b']) ph.bars[k] = ov('bar_' + k);
  ov('header');
  ph.setTint = k => { for (const n of ['recv', 'send']) { ph.bars[n + '_a'].style.opacity = k.toFixed(3); ph.bars[n + '_b'].style.opacity = (1 - k).toFixed(3); } };
  ph.scrollTo = v => { ph.scroll = v; pg.style.transform = `translateY(${(-v).toFixed(2)}px)`; ph.setTint(1 - clamp(v / 120)); };
  ph.scrollTo(scroll);
  ph.slot = k => { const S = MANIFEST.slots[k]; return img(S.src, pg, { left: S.x + 'px', top: S.y + 'px', width: S.w + 'px', height: S.h + 'px', opacity: '0' }); };
  ph.at = name => {
    const c = MANIFEST.cutouts[name], [bx, by, bw, bh] = c.box;
    return [so[0] + bx + bw / 2, so[1] + by + bh / 2 - (c.fixed ? 0 : ph.scroll)];
  };
  ph.piece = name => new Cut(ph, name, { at: ph.at(name) });
  // frame offset (from the frame centre) of a phone-local point while the phone rests
  ph.frame = ([x, y]) => [(x - MANIFEST.phone.size[0] / 2) * PHONE_S, PHONE_Y + (y - MANIFEST.phone.size[1] / 2) * PHONE_S];
  return ph;
}
function piece(t, cut, slot, t0, to, tb = null, dur = 0.8) {
  lift(cut, t, t0, dur, to, tb === null ? null : { t: tb, dur: 0.45 });
  const away = t > t0 - 0.01 && (tb === null || t < tb + 0.46);
  cut.set({ vis: away });
  if (away) {
    const a = t - t0;
    cut.set({ ry: cut.p.ry + Math.min(a, 4) * 1.2 * (to.dir || 1), rx: cut.p.rx + Math.min(a, 4) * -0.5 });
  }
  if (slot) slotO(slot, t < t0 ? 0 : Math.min((t - t0) * 12, tb === null ? 1 : 1 - ioC(prog(t, tb, tb + 0.45))));
}
// a real cut-out shown on its own on the canvas (not on the phone), its content `w` px wide
function cutImg(name, w, z = '5') {
  const c = MANIFEST.cutouts[name], k = w / c.box[2];
  const im = mkImg(c.src, 'abs');
  Object.assign(im.style, { width: c.size[0] * k + 'px', height: c.size[1] * k + 'px', zIndex: z });
  im._w = c.size[0] * k; im._h = c.size[1] * k; im._k = k; im._c = c;
  $('#text').appendChild(im);
  return im;
}
const placeAt = (im, cx, cy, tf = '') => { im.style.left = (cx - im._w / 2) + 'px'; im.style.top = (cy - im._h / 2) + 'px'; im.style.transform = tf; };

// ======================================================================= 0. CANVAS
scene({
  init() { LG.init(); },
  update() { LG.reset(); LG.F.white = 1; },
});

// ======================================================================= 1. HOOK (0 – 6)
// a focus pull onto the mark · «Пресейл токена»; then the mark folds into the site's lock-up,
// the wordmark slides out from behind it · «Основной токен экосистемы INCEPTION»
scene({
  init() {
    this.logo = logoImg();
    this.wm = wordmark(150);
    this.h = T('Пресейл\nтокена', 1196, 132);
    this.sub = T('Основной токен\nэкосистемы INCEPTION', 1010, 54, { cls: 'wl-s', lh: 1.25, track: 0 });
    cue(3.0, 'whoosh', { dur: 0.6, gain: 0.32 });
  },
  update(t) {
    const on = t < 6.0;
    show(this.logo, on); show(this.wm, on && t > 3.2);
    win(this.h, t, 0.6, 3.25, 2.95);
    win(this.sub, t, 3.75, 6.0);
    drift(this.h.el, t, 0, 3, -2, 2); drift(this.sub.el, t, 3, 6, -2, 2);
    if (!on) return;
    const L = lockup(this.wm, 250);
    const f = oX(prog(t, -0.05, 1.1));                         // the focus pull
    const m = ioC(prog(t, 3.0, 3.7));                          // into the lock-up
    const d = prog(t, 0, 6);
    placeMark(this.logo, lerp(540, L.logoX, m), lerp(760, 820, m), lerp(lerp(860, 640, f), 250, m),
      { o: clamp((t + 0.05) / 0.25), blur: (1 - f) * 34, ry: lerp(-6, 5, d), rx: lerp(3, -2, d) });
    // the wordmark slides out from behind the mark
    const r = oX(prog(t, 3.3, 4.1));
    this.wm.style.left = (L.wordX - (1 - r) * 120) + 'px';
    this.wm.style.top = (820 - 75) + 'px';
    this.wm.style.clipPath = `inset(-20px ${((1 - r) * 100).toFixed(2)}% -20px 0)`;
    this.wm.style.opacity = clamp((t - 3.3) / 0.2).toFixed(3);
  },
});

// ======================================================================= 2. IN THE WALLET (6 – 12)
// the drop: the camera pulls back from a macro of the coin page to the whole phone; the price, then the
// coin's header lift off; at the end the camera dives through the screen into the next shot
scene({
  init() {
    const cam = $('#cam');
    this.ph = coinPhone(cam, 0);
    this.slotPrice = this.ph.slot('ps_price'); this.price = this.ph.piece('ps_price');
    this.slotHead = this.ph.slot('ps_head'); this.head = this.ph.piece('ps_head');
    this.h = T('Уже в ~INCPT ~Wallet', TOP, 116);
    whoosh(6.0, 0.3, 0, false); whoosh(8.0, 0.3, 0.3); whoosh(9.5, 0.28, -0.3);
    cue(11.4, 'whoosh', { dur: 0.6, gain: 0.55, up: true });
  },
  update(t) {
    win(this.h, t, 7.0, 11.55, 11.3);
    drift(this.h.el, t, 6, 12, -2, 2);
    const on = t >= 6.0 && t < 12.0;
    this.ph.set({ vis: on });
    if (!on) return;
    const d = prog(t, 6, 12);
    this.ph.set({ x: 0, y: PHONE_Y, s: PHONE_S, rx: lerp(4, 0.5, d), ry: lerp(-5, 3, d), rz: 0 });
    // pull back from the coin's header (phone-local ~ (500, 420)) to the whole phone
    const [hx, hy] = this.ph.frame([503, 430]);
    const pb = ioC(prog(t, 6.25, 7.9));                         // hold the macro a beat, then pull back
    const dive = Ease.inExpo(prog(t, 11.4, 12.0));             // into the screen
    const s = lerp(2.4, 1, pb) * (1 + dive * 5.5);
    const k = 1 - pb;                                           // how far the macro still aims at the header
    const ax = hx * k, ay = hy * k + (PHONE_Y - 150) * dive;    // then the dive aims at the middle of the screen
    CAM.s = s;
    CAM.x = -ax * s;
    CAM.y = -ay * s;
    piece(t, this.price, this.slotPrice, 8.0, { x: 250, y: 470, z: 300, s: 2.5, rz: 1.0, dir: -1 });
    piece(t, this.head, this.slotHead, 9.5, { x: 190, y: 110, z: 260, s: 2.4, rz: -1.2, dir: 1 });
    this.ph.flash(0.34 * oC(prog(t, 8.0, 8.5)));
  },
});

// ======================================================================= 3. THE VALUE (12 – 20) — the calm middle
// out of the dive, the page's own rule as a fraction: «последняя подтверждённая оценка компании» over
// «фиксированное количество valuation units»; then its words give way to the page's example:
// $50M over 100M INCPT = $0.50
scene({
  init() {
    this.h = T('Стоимость —\nот оценки ~компании', TOP - 10, 104);
    this.num = T('Последняя подтверждённая\nоценка компании', 740, 64, { lh: 1.15 });
    this.den = T('Фиксированное количество\nvaluation units', 1020, 64, { lh: 1.15 });
    this.bar = div(`left:${540 - 420}px;top:976px;width:840px;height:6px;border-radius:3px;background:var(--brand-grad);transform-origin:50% 50%;`);
    const val = (y, size, cls = '') => div(`left:0px;top:${y}px;width:${W}px;text-align:center;font-weight:600;font-size:${size}px;letter-spacing:-0.02em;line-height:1;`, `<span class="${cls}" style="display:inline-block"></span>`);
    this.vNum = val(780, 170); this.vDen = val(1030, 150); this.vRes = val(1300, 190, 'wl-irid');
    this.lNum = T('Оценка компании', 726, 38, { cls: 'wl-s', track: 0 });
    this.lDen = T('Всего valuation units', 1196, 38, { cls: 'wl-s', track: 0 });
    this.cap = T('Пример со страницы монеты в INCPT Wallet', 1590, 36, { cls: 'wl-s', track: 0 });
    whoosh(12.0, 0.25, 0, false);
    [15.5, 16.25].forEach(tt => cue(tt, 'tick', { gain: 0.4 }));
    cue(17.5, 'whoosh', { dur: 0.45, gain: 0.3, up: true });
  },
  update(t) {
    const on = t >= 12.0 && t < 20.0;
    win(this.h, t, 12.35, 20.0);
    drift(this.h.el, t, 12, 20, -1.5, 1.5);
    // the rule in words (arrives out of the dive: big and soft to sharp), leaves for the numbers
    const a = oX(prog(t, 12.0 - LEAD, 13.0));
    win(this.num, t, 12.0 - LEAD, 20.0, 15.2, onCut(12.0, { stagger: 0.06, blur: 14 }));
    win(this.den, t, 13.2, 20.0, 15.95);
    drift(this.num.el, t, 12, 16, -1.5, 1.5, ` scale(${lerp(1.35, 1, a).toFixed(4)})`);
    drift(this.den.el, t, 12, 16, -1.5, 1.5);
    // the fraction bar draws from the middle out and stays through the example
    const b = ioC(prog(t, 12.9, 13.6));
    show(this.bar, on && b > 0);
    this.bar.style.transform = `scaleX(${b.toFixed(4)})`;
    // the numbers take the words' places, counting up; the result lands under the fraction
    const nums = [[this.vNum, 15.5, 50, v => `$${Math.round(v)}M`, this.lNum], [this.vDen, 16.25, 100, v => `${Math.round(v)}M INCPT`, this.lDen], [this.vRes, 17.5, 0.5, v => `= $${v.toFixed(2)}`, null]];
    for (const [el, t0, to, fmt, lab] of nums) {
      const vis = on && t >= t0;
      show(el, vis);
      if (lab) win(lab, t, t0 + 0.15, 20.0);
      if (!vis) continue;
      const e = oX(prog(t, t0, t0 + 0.7));
      el.style.opacity = clamp((t - t0) / 0.2).toFixed(3);
      drift(el, t, 12, 20, -1.5, 1.5, ` translateY(${((1 - e) * 40).toFixed(2)}px)`);
      const sp = el.firstChild;
      sp.textContent = fmt(to * oC(prog(t, t0 + 0.05, t0 + 0.75)));
      if (el === this.vRes) sp.style.backgroundSize = sp.offsetWidth + 'px 100%';
    }
    win(this.cap, t, 18.4, 20.0);
  },
});

// ======================================================================= 4. THE PRICE (20 – 26) — the drive comes back
// «ЦЕНА ПРЕСЕЙЛА»: 0.40 rolls in on an odometer and locks on the accent · USDT · «Покупка от $50,000»;
// the real presale button rises under it
scene({
  init() {
    this.kick = div(`left:0px;top:440px;width:${W}px;text-align:center;font-size:40px;`, 'Цена пресейла', 'wl wl-kick');
    // odometer: one column per digit, each a strip of digits that rolls and stops
    this.odo = div(`left:0px;top:520px;width:${W}px;height:360px;text-align:center;font-weight:600;font-size:340px;line-height:360px;letter-spacing:-0.02em;`);
    const chars = '0.40'.split('');
    this.cols = chars.map(ch => {
      const col = document.createElement('span');
      Object.assign(col.style, { display: 'inline-block', height: '360px', overflow: 'hidden', verticalAlign: 'top' });
      const strip = document.createElement('span');
      strip.className = 'wl-irid';
      Object.assign(strip.style, { display: 'block', whiteSpace: 'pre' });
      if (ch === '.') strip.textContent = '.';
      else { const seq = []; for (let r = 0; r < 3; r++) for (let n = 0; n < 10; n++) seq.push(n); seq.push(+ch); strip.textContent = seq.join('\n'); }
      col.appendChild(strip); this.odo.appendChild(col);
      return { col, strip, dot: ch === '.' };
    });
    this.unit = T('USDT', 905, 120);
    this.min = T('Покупка от ~$50,000', 1075, 74);
    this.btn = cutImg('ps_presale', 900);
    cue(20.0, 'whoosh', { dur: 0.5, gain: 0.3 });
    [20.15, 20.3, 20.45, 20.6].forEach((tt, i) => cue(tt, 'tick', { gain: 0.25 + i * 0.05 }));
    whoosh(24.0, 0.3);
  },
  update(t) {
    const on = t >= 20.0 && t < 26.0;
    show(this.kick, on); show(this.odo, on); show(this.btn, on && t >= 24.0);
    win(this.unit, t, 20.75, 26.0, null, { stagger: 0 });
    win(this.min, t, 22.0, 26.0);
    drift(this.unit.el, t, 20, 26, -2, 2); drift(this.min.el, t, 20, 26, -2, 2);
    if (!on) return;
    const ke = oX(prog(t, 20.0 - LEAD, 20.6));
    this.kick.style.opacity = clamp((t - 20.0 + LEAD) / 0.2).toFixed(3);
    this.kick.style.transform = `translateY(${((1 - ke) * 20).toFixed(2)}px)`;
    drift(this.odo, t, 20, 26, -2, 2);
    this.odo.style.opacity = clamp((t - 20.0 + LEAD) / 0.15).toFixed(3);
    // each digit rolls through three turns and lands; the last lands on the accent at 20.75
    const lands = [20.35, 0, 20.55, 20.75];
    let x0 = Infinity, x1 = -Infinity;
    this.cols.forEach(c => { x0 = Math.min(x0, c.col.offsetLeft); x1 = Math.max(x1, c.col.offsetLeft + c.col.offsetWidth); });
    this.cols.forEach((c, i) => {
      c.strip.style.backgroundSize = (x1 - x0) + 'px 100%';
      c.strip.style.backgroundPosition = (x0 - c.col.offsetLeft) + 'px 0';
      if (c.dot) return;
      const p = oC(prog(t, 20.0 - LEAD, lands[i]));
      const idx = 30 * p;                                       // 30 = three turns, then the target (index 30)
      c.strip.style.transform = `translateY(${(-idx * 360).toFixed(1)}px)`;
      const blur = (1 - p) * 10;
      c.col.style.filter = blur > 0.2 ? `blur(${blur.toFixed(2)}px)` : '';
    });
    // the real presale button rises under the price
    const be = oX(prog(t, 24.0, 24.75)), d = prog(t, 24, 26);
    placeAt(this.btn, 540, 1340, `perspective(1800px) translateY(${((1 - be) * 140).toFixed(2)}px) rotateX(${lerp(10, 0, be).toFixed(2)}deg) rotateY(${lerp(-3, 3, d).toFixed(2)}deg)`);
    this.btn.style.opacity = clamp((t - 24.0) / 0.15).toFixed(3);
  },
});

// ======================================================================= 5. NETWORK AND TRANSFERS (26 – 30)
// the real TRC-20 · TRON pill is laid on the canvas; free transfers in the page's own words
scene({
  init() {
    this.kick = div(`left:0px;top:500px;width:${W}px;text-align:center;font-size:40px;`, 'Сеть', 'wl wl-kick');
    this.pill = cutImg('ps_net', 560);
    this.h = T('Переводы другим\nпользователям — ~бесплатно', 1000, 72, { lh: 1.18 });
    this.note = T('Обмен откроется после листинга', 1270, 42, { cls: 'wl-s', track: 0 });
    whoosh(26.0, 0.32, 0.4, false);
  },
  update(t) {
    const on = t >= 26.0 && t < 30.0;
    show(this.kick, on); show(this.pill, on);
    win(this.h, t, 26.75, 30.0);
    win(this.note, t, 28.0, 30.0);
    drift(this.h.el, t, 26, 30, -2, 2); drift(this.note.el, t, 26, 30, -2, 2);
    if (!on) return;
    this.kick.style.opacity = clamp((t - 26.0 + LEAD) / 0.2).toFixed(3);
    const e = oX(prog(t, 26.0 - LEAD, 26.8)), d = prog(t, 26, 30);
    placeAt(this.pill, 540 + (1 - e) * 700, 720, `perspective(1800px) rotateZ(${lerp(-6, -1, e).toFixed(2)}deg) rotateY(${lerp(-4, 4, d).toFixed(2)}deg)`);
    this.pill.style.opacity = clamp((t - 26.0 + LEAD) / 0.15).toFixed(3);
  },
});

// ======================================================================= 6. CALL TO ACTION (30 – 34)
// back in the app: the phone rises with the presale button; one tap
scene({
  init() {
    const cam = $('#cam');
    this.ph = coinPhone(cam, 675);
    this.btn = this.ph.piece('ps_presale');
    this.tap = new Tap(this.ph, 210);
    this.h = T('Купить\nна ~пресейле', TOP - 10, 124);
    whoosh(30.0, 0.3, 0, false);
    cue(31.45, 'tap', { gain: 0.7 });
  },
  update(t) {
    win(this.h, t, 30.0 - LEAD, 34.0, null, onCut(30.0));
    const on = t >= 30.0 && t < 34.0;
    this.ph.set({ vis: on });
    if (!on) { this.tap.set({ vis: false }); this.btn.set({ vis: false }); return; }
    const r = oX(prog(t, 30.0 - LEAD, 30.7)), d = prog(t, 30, 34);
    this.ph.set({ x: 0, y: PHONE_Y + (1 - r) * 1400, s: PHONE_S, rx: lerp(3, 0.5, d) + (1 - r) * 20, ry: lerp(-3, 2, d), rz: (1 - r) * -3 });
    this.btn.set({ vis: true, s: 1 - 0.045 * press(t, 31.5), z: 2 });
    const [bx, by] = this.ph.at('ps_presale');
    this.tap.at(t, 31.5, bx - 193, by, 30);           // on the button's star
  },
});

// ======================================================================= 7. END CARD (34 – 38)
// the site's lock-up in focus · «Пресейл INCEPTION Coin» · presale.incpt.fi · the risk line
const PS_STAR = `<svg viewBox="0 0 24 24" width="64" height="64"><defs><linearGradient id="ps5" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#a4c34f"/><stop offset="0.5" stop-color="#5ba7c4"/><stop offset="1" stop-color="#968cd3"/></linearGradient></defs><circle cx="12" cy="12" r="12" fill="url(#ps5)"/><path d="M11 5.2 C11.45 8.6 12.4 9.55 15.8 10 C12.4 10.45 11.45 11.4 11 14.8 C10.55 11.4 9.6 10.45 6.2 10 C9.6 9.55 10.55 8.6 11 5.2 Z M15.6 13.6 C15.78 14.98 16.12 15.32 17.5 15.5 C16.12 15.68 15.78 16.02 15.6 17.4 C15.42 16.02 15.08 15.68 13.7 15.5 C15.08 15.32 15.42 14.98 15.6 13.6 Z" fill="#fff"/></svg>`;
scene({
  init() {
    this.logo = logoImg();
    this.wm = wordmark(150);
    this.kick = div(`left:0px;top:1000px;width:${W}px;text-align:center;font-size:38px;`, 'Пресейл INCEPTION Coin', 'wl wl-kick');
    this.pill = div(`left:${540 - 300}px;top:1120px;width:600px;height:124px;border-radius:62px;background:#fff;display:flex;align-items:center;justify-content:center;gap:22px;box-shadow:0 22px 44px -20px rgba(19,36,64,0.30), 0 2px 6px rgba(19,38,64,0.06);`,
      `${PS_STAR}<div style="font-weight:600;font-size:46px;letter-spacing:-0.01em;color:#132440">presale.incpt.fi</div>`);
    this.risk = div(`left:0px;top:1330px;width:${W}px;text-align:center;font-weight:400;font-size:28px;color:#8a8f9a;`, 'Не является инвестиционной рекомендацией');
    whoosh(35.0, 0.2);
  },
  update(t) {
    const on = t >= 34.0;
    show(this.logo, on); show(this.wm, on); show(this.kick, on && t >= 34.75); show(this.pill, on && t >= 35.25, 'flex'); show(this.risk, on && t >= 35.75);
    if (!on) return;
    const L = lockup(this.wm, 250);
    const f = oX(prog(t, 34.0 - LEAD, 34.9)), d = prog(t, 34, 38);
    placeMark(this.logo, L.logoX, 760, lerp(330, 250, f), { o: clamp((t - 34.0 + LEAD) / 0.2), blur: (1 - f) * 24, ry: lerp(-4, 4, d), rx: lerp(2, -2, d) });
    const r = oX(prog(t, 34.25, 35.0));
    this.wm.style.left = (L.wordX - (1 - r) * 120) + 'px';
    this.wm.style.top = (760 - 75) + 'px';
    this.wm.style.clipPath = `inset(-20px ${((1 - r) * 100).toFixed(2)}% -20px 0)`;
    this.wm.style.opacity = clamp((t - 34.25) / 0.2).toFixed(3);
    const k = oX(prog(t, 34.75, 35.4));
    this.kick.style.opacity = clamp((t - 34.75) / 0.25).toFixed(3);
    this.kick.style.transform = `translateY(${((1 - k) * 20).toFixed(2)}px)`;
    const p = oX(prog(t, 35.25, 35.9));
    this.pill.style.opacity = clamp((t - 35.25) / 0.15).toFixed(3);
    this.pill.style.transform = `translateY(${((1 - p) * 34).toFixed(2)}px)`;
    this.risk.style.opacity = prog(t, 35.75, 36.3).toFixed(3);
  },
});
