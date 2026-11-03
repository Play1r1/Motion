// INCPT token presale — ХРОМ, serious cut. 9:16, 26 s, 120 BPM (bar = 2 s), cut to a generated track
// (assets/music/presale_edit.json). The language of the INCPT reel DNA: the real coin page in the
// titanium phone, real pieces of it lifting off wider than the phone, words one by one, one message
// per frame, cuts only on downbeats, moves on the beat's accents (+0.75 s, +1.5 s), every hold drifts
// slowly in 3D, the camera either stands or commits. No glints, spins, bounces or decorative wipes;
// the logo is never under glass. Every fact is on the INCEPTION Coin page or in the brief.
'use strict';

DURATION = 26.0;
META = { drop: 4.0, end: 22.0, bpm: 120, musicEdit: 'assets/music/presale_edit.json', sfxGain: 0.6 };
const oC = Ease.outCubic, iC = Ease.inCubic;
const PR = () => MANIFEST.reel;
const PHONE_S = 0.66, PHONE_Y = 262;            // phone centre sits 262 px below the frame centre
const TOP = 196;                                // headline top on phone frames
drawBg = t => LG.draw(t);

// ------------------------------------------------------------------ type
// words one by one: 100 ms apart, a short rise and a touch of blur, out fast
const SHOW = { stagger: 0.1, dur: 0.55, dy: 0.28, blur: 6, outDur: 0.16, outStagger: 0.0, outDy: -0.12 };
const T = (text, y, size, o = {}) => new WText(text, { y, size, fit: 960, track: -0.04, ...o });
// on screen from tin; gone at the cut (tend) or fading out from tout
function win(txt, t, tin, tend, tout = null, opts = {}) {
  const gate = opts.gate ?? tin - 0.01;
  if (t >= tend || t < gate) { txt.el.style.display = 'none'; return; }
  txt.at(t, tin, tout, { ...SHOW, ...opts });
}
const LEAD = 0.1;                               // an entrance on a cut is already moving on the cut frame
const onCut = (c, o = {}) => ({ gate: c, ...o });
// a slow linear 3D drift for a block of type (the hold lives)
function drift(el, t, t0, t1, ry0 = -2.5, ry1 = 2.5) {
  const p = prog(t, t0, t1);
  el.style.transform = `perspective(1600px) rotateY(${lerp(ry0, ry1, p).toFixed(3)}deg) rotateX(${lerp(1.5, -1.5, p).toFixed(3)}deg)`;
}
function div(css, html = '') {
  const el = document.createElement('div');
  el.className = 'wl';
  el.style.cssText += css;
  el.innerHTML = html;
  $('#text').appendChild(el);
  return el;
}
// the official chrome mark: a plain image with a soft contact shadow — never under glass
function logoImg(h) {
  const im = mkImg('style/logo_chrome.png', 'abs');
  const w = h * 743 / 1081;
  Object.assign(im.style, { width: w + 'px', height: h + 'px', left: (540 - w / 2) + 'px', filter: 'drop-shadow(0 34px 40px rgba(20,24,60,0.24))', zIndex: '6' });
  $('#text').appendChild(im);
  return im;
}
// the mark lands: from a touch bigger and soft to sharp, then drifts in 3D
function markAt(im, t, t0, t1, cy, h) {
  if (t < t0 || t >= t1) { im.style.display = 'none'; return; }
  im.style.display = '';
  const p = Ease.outExpo(prog(t, t0, t0 + 0.7)), d = prog(t, t0, t1);
  im.style.top = (cy - h / 2) + 'px';
  im.style.opacity = clamp((t - t0) / 0.18).toFixed(3);
  im.style.transform = `perspective(1800px) rotateY(${lerp(-5, 4, d).toFixed(3)}deg) rotateX(${lerp(3, -2, d).toFixed(3)}deg) scale(${lerp(1.09, 1, p).toFixed(4)})`;
  const b = (1 - p) * 12;
  im.style.filter = `drop-shadow(0 34px 40px rgba(20,24,60,0.24))${b > 0.1 ? ` blur(${b.toFixed(2)}px)` : ''}`;
}

// ------------------------------------------------------------------ the phone with the coin page
// the long page under the app's fixed header and its two frosted bottom buttons
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
// the phone holds: in place, a slow linear 3D drift across the shot
function holdPhone(ph, t, t0, t1, { rise = false, ry0 = -4, ry1 = 3 } = {}) {
  const on = t >= t0 && t < t1;
  ph.set({ vis: on });
  if (!on) return false;
  const d = prog(t, t0, t1);
  const r = rise ? Ease.outExpo(prog(t, t0 - LEAD, t0 + 0.65)) : 1;
  ph.set({ x: 0, y: PHONE_Y + (1 - r) * 1500, s: PHONE_S, rx: lerp(3, 0.5, d) + (1 - r) * 22, ry: lerp(ry0, ry1, d), rz: (1 - r) * -3 });
  return true;
}
// a piece of the page lifts off (fast start, soft landing) and floats; back home at tb; its slot shows while away
function piece(t, cut, slot, t0, to, tb = null, dur = 0.7) {
  lift(cut, t, t0, dur, to, tb === null ? null : { t: tb, dur: 0.42 });
  const away = t > t0 - 0.01 && (tb === null || t < tb + 0.43);
  cut.set({ vis: away });
  if (away) {                                   // the floating piece keeps turning, slowly
    const a = t - t0;
    cut.set({ ry: cut.p.ry + Math.min(a, 3) * 1.6 * (to.dir || 1), rx: cut.p.rx + Math.min(a, 3) * -0.6 });
  }
  if (slot) slotO(slot, t < t0 ? 0 : Math.min((t - t0) * 12, tb === null ? 1 : 1 - Ease.inOutCubic(prog(t, tb, tb + 0.42))));
}
const whoosh = (t, g = 0.3, pan = 0) => cue(t - 0.09, 'whoosh', { dur: 0.36, gain: g, up: true, pan });

// ======================================================================= 0. FIELD
scene({
  init() {
    LG.init();
    // a soft vignette, like a lens
    div(`left:0px;top:0px;width:${W}px;height:${H}px;z-index:40;background:radial-gradient(120% 90% at 50% 46%, rgba(20,22,40,0) 62%, rgba(20,22,40,0.10) 100%);`);
  },
  update(t) {
    LG.reset();
    LG.F.sy = t * 3;                             // the canvas stands; the flutes barely breathe
  },
});

// ======================================================================= 1. THE MARK (0 – 2)
scene({
  init() {
    this.logo = logoImg(620);
    this.h = T('Пресейл\nтокена', 1196, 132);
  },
  update(t) {
    markAt(this.logo, t, -0.12, 2.0, 790, 620);
    win(this.h, t, 0.55, 2.0);
    drift(this.h.el, t, 0, 2);
  },
});

// ======================================================================= 2. THE NAME (2 – 4)
scene({
  init() {
    this.name = T('~INCPT', 640, 330, { track: -0.05 });
    this.sub = T('Основной токен\nэкосистемы INCEPTION', 1060, 60, { cls: 'wl-s', lh: 1.18, track: -0.01 });
  },
  update(t) {
    win(this.name, t, 2.0 - LEAD, 4.0, null, onCut(2.0, { stagger: 0, dur: 0.6, dy: 0.12, blur: 10 }));
    win(this.sub, t, 2.5, 4.0, null, { stagger: 0.1 });
    drift(this.name.el, t, 2, 4, -3, 3);
    drift(this.sub.el, t, 2, 4, -3, 3);
  },
});

// ======================================================================= 3. IN THE WALLET (4 – 6)
scene({
  init() {
    const cam = $('#cam');
    this.ph = coinPhone(cam, 0);
    this.slotHead = this.ph.slot('ps_head');
    this.head = this.ph.piece('ps_head');
    this.h = T('Уже в ~INCPT Wallet', TOP, 112);
    whoosh(4.75, 0.34, -0.3);
  },
  update(t) {
    win(this.h, t, 4.0 - LEAD, 6.0, null, onCut(4.0));
    if (!holdPhone(this.ph, t, 4.0, 6.0, { rise: true })) return;
    piece(t, this.head, this.slotHead, 4.75, { x: 190, y: 160, z: 260, s: 2.45, rz: -1.2, dir: 1 });
    this.ph.flash(0.34 * oC(prog(t, 4.75, 5.2)));
  },
});

// ======================================================================= 3b. THE PRICE, CLOSE (6 – 8)
// the real 7-day chart alone on the canvas: the line draws itself; the price arrives on the accent
scene({
  init() {
    const c = MANIFEST.cutouts.ps_chart_base, P = MANIFEST.cutouts.ps_chart.plot, k = 960 / c.box[2];
    const w = c.size[0] * k, h = c.size[1] * k;
    this.chart = div(`left:${540 - w / 2}px;top:${1130 - h / 2}px;width:${w}px;height:${h}px;z-index:4;`);
    const base = mkImg(c.src, 'abs');
    Object.assign(base.style, { left: '0px', top: '0px', width: w + 'px', height: h + 'px' });
    this.chart.appendChild(base);
    this.plot = mkImg(P.src, 'abs');
    Object.assign(this.plot.style, { left: P.x * k + 'px', top: P.y * k + 'px', width: P.w * k + 'px', height: P.h * k + 'px' });
    this.chart.appendChild(this.plot);
    const q = MANIFEST.cutouts.ps_price, k2 = 600 / q.box[2];
    const w2 = q.size[0] * k2, h2 = q.size[1] * k2;
    this.price = mkImg(q.src, 'abs');
    Object.assign(this.price.style, { width: w2 + 'px', height: h2 + 'px', left: (540 - w2 / 2) + 'px', top: (700 - h2 / 2) + 'px', zIndex: '5' });
    $('#text').appendChild(this.price);
    whoosh(6.0, 0.24); whoosh(6.75, 0.32, 0.2);
  },
  update(t) {
    const on = t >= 6.0 && t < 8.0;
    this.chart.style.display = this.price.style.display = on ? '' : 'none';
    if (!on) return;
    const d = prog(t, 6.0, 8.0), e = Ease.outExpo(prog(t, 6.0 - LEAD, 6.6));
    this.chart.style.transform = `perspective(1800px) translateY(${((1 - e) * 120).toFixed(2)}px) rotateX(${lerp(7, 1, d).toFixed(3)}deg) rotateY(${lerp(-6, 3, d).toFixed(3)}deg)`;
    this.chart.style.opacity = clamp((t - 6.0 + LEAD) / 0.12).toFixed(3);
    const r = Ease.inOutSine(prog(t, 6.05, 7.45)), m = `linear-gradient(90deg, #000 ${(r * 104 - 3).toFixed(2)}%, transparent ${(r * 104).toFixed(2)}%)`;
    this.plot.style.maskImage = m; this.plot.style.webkitMaskImage = m;
    const pe = Ease.outExpo(prog(t, 6.75, 7.35));
    this.price.style.display = t >= 6.75 ? '' : 'none';
    this.price.style.opacity = clamp((t - 6.75) / 0.12).toFixed(3);
    this.price.style.transform = `perspective(1800px) translateY(${((1 - pe) * 70).toFixed(2)}px) rotateX(${lerp(4, -1, d).toFixed(3)}deg) rotateY(${lerp(5, -3, d).toFixed(3)}deg) scale(${lerp(0.94, 1, pe).toFixed(4)})`;
  },
});

// ======================================================================= 4. THE VALUE (8 – 12)
// the formula and the example leave «О монете», one line per accent; then the example, alone
scene({
  init() {
    const cam = $('#cam');
    this.ph = coinPhone(cam, PR().page.scrollEnd);
    this.slotF = this.ph.slot('ps_formula');
    this.formula = this.ph.piece('ps_formula');
    this.ex = [1, 2, 3].map(i => ({ n: this.ph.piece('ps_ex' + i), slot: this.ph.slot('ps_ex' + i) }));
    this.h = T('Стоимость —\nот оценки ~компании', TOP - 20, 112);
    whoosh(8.05, 0.3); [8.75, 9.25, 9.5].forEach((tt, i) => whoosh(tt, 0.26, i % 2 ? 0.3 : -0.3));
    // the example on its own
    this.e1 = T('$50M', 560, 230);
    this.e2 = T('÷ 100M INCPT', 845, 150);
    this.e3 = T('= ~$0.50', 1030, 230);
    this.cap = T('Пример со страницы монеты', 1330, 42, { cls: 'wl-s', track: 0 });
  },
  update(t) {
    win(this.h, t, 8.0, 10.0);
    if (holdPhone(this.ph, t, 8.0, 10.0, { ry0: 4, ry1: -2 })) {
      piece(t, this.formula, this.slotF, 8.05, { x: 48, y: -560, z: 280, s: 1.45, rz: -1, dir: -1 }, null, 0.6);
      this.ph.flash(0.36 * oC(prog(t, 8.05, 8.5)));
      this.ex.forEach((e, i) => piece(t, e.n, e.slot, [8.75, 9.25, 9.5][i], { x: [180, 110, 54][i], y: [-330, -175, -20][i], z: 300, s: 1.8, rz: [-1, 0.8, -0.6][i], dir: i % 2 ? -1 : 1 }, null, 0.55));
    }
    win(this.e1, t, 10.0 - LEAD, 12.0, null, onCut(10.0, { stagger: 0, dy: 0.18 }));
    win(this.e2, t, 10.75, 12.0);
    win(this.e3, t, 11.5, 12.0, null, { stagger: 0.08, dy: 0.18 });
    win(this.cap, t, 11.6, 12.0);
    for (const x of [this.e1, this.e2, this.e3, this.cap]) drift(x.el, t, 10, 12, -2.5, 2.5);
  },
});

// ======================================================================= 5. THE PRESALE PRICE (12 – 16)
scene({
  init() {
    const cam = $('#cam');
    this.ph = coinPhone(cam, 0);
    this.slot = this.ph.slot('ps_presale');
    this.btn = this.ph.piece('ps_presale');
    this.h = T('Цена ~пресейла', TOP, 128);
    whoosh(12.75, 0.36);
    this.price = div(`left:0px;top:470px;width:${W}px;text-align:center;font-weight:800;font-size:400px;line-height:1;letter-spacing:-0.06em;`, '<span class="wl-irid" style="display:inline-block"></span>');
    this.pv = this.price.firstChild;
    this.unit = T('USDT', 930, 150);
    this.min = T('Покупка от ~$50,000', 1200, 76, { track: -0.03 });
  },
  update(t) {
    win(this.h, t, 12.05, 14.0);
    if (holdPhone(this.ph, t, 12.0, 14.0, { ry0: -3, ry1: 3 })) {
      piece(t, this.btn, this.slot, 12.75, { y: -620, z: 300, s: 1.45, rz: -1.2, dir: 1 }, null, 0.65);
      this.ph.setTint(1 - oC(prog(t, 12.75, 13.1)));
      this.ph.flash(0.34 * oC(prog(t, 12.75, 13.2)));
    }
    // the price counts up and locks on the accent
    const on = t >= 14.0 && t < 16.0;
    this.price.style.display = on ? '' : 'none';
    if (on) {
      const p = prog(t, 14.0 - LEAD, 14.74);
      this.pv.textContent = (0.4 * Ease.outCubic(p)).toFixed(2);
      const e = Ease.outExpo(prog(t, 14.0 - LEAD, 14.5));
      this.price.style.opacity = clamp((t - 14.0 + LEAD) / 0.12).toFixed(3);
      this.pv.style.transform = `translateY(${((1 - e) * 40).toFixed(2)}px)`;
      drift(this.price, t, 14, 16, -2.5, 2.5);
      this.pv.style.backgroundSize = this.pv.offsetWidth + 'px 100%';
    }
    win(this.unit, t, 14.74, 16.0, null, { stagger: 0 });
    win(this.min, t, 15.0, 16.0);
    drift(this.unit.el, t, 14, 16, -2.5, 2.5); drift(this.min.el, t, 14, 16, -2.5, 2.5);
  },
});

// ======================================================================= 6. NETWORK, TRANSFERS (16 – 20)
scene({
  init() {
    const cam = $('#cam');
    this.ph = coinPhone(cam, 675);
    this.slotNet = this.ph.slot('ps_net');
    this.slotNote = this.ph.slot('ps_note');
    this.net = this.ph.piece('ps_net');
    this.note = this.ph.piece('ps_note');
    this.h1 = T('Сеть ~TRC-20 · ~TRON', TOP, 118);
    this.h2 = T('Переводы\n~бесплатно', TOP - 20, 124);
    whoosh(16.75, 0.36); whoosh(17.5, 0.2); whoosh(18.0, 0.34); whoosh(19.5, 0.2);
  },
  update(t) {
    win(this.h1, t, 16.05, 20.0, 17.82);
    win(this.h2, t, 18.0, 20.0);
    if (!holdPhone(this.ph, t, 16.0, 20.0, { ry0: 3, ry1: -3 })) return;
    piece(t, this.net, this.slotNet, 16.75, { x: 330, y: -260, z: 300, s: 3.1, rz: -1.5, dir: 1 }, 17.5);
    piece(t, this.note, this.slotNote, 18.0, { y: -360, z: 300, s: 1.5, rz: 1, dir: -1 }, 19.5);
    this.ph.flash(0.34 * (oC(prog(t, 16.75, 17.2)) - Ease.inOutCubic(prog(t, 17.5, 17.8))) + 0.34 * (oC(prog(t, 18.0, 18.4)) - Ease.inOutCubic(prog(t, 19.5, 19.9))));
  },
});

// ======================================================================= 7. CALL TO ACTION (20 – 22)
// the real presale button alone on the canvas, wider than a phone; one tap
scene({
  init() {
    const c = MANIFEST.cutouts.ps_presale, k = 940 / c.box[2];   // the button itself 940 px wide
    this.bw = c.size[0] * k; this.bh = c.size[1] * k;
    this.btn = mkImg(c.src, 'abs');
    Object.assign(this.btn.style, { width: this.bw + 'px', height: this.bh + 'px', left: (540 - this.bw / 2) + 'px', top: (1040 - this.bh / 2) + 'px', zIndex: '5' });
    $('#text').appendChild(this.btn);
    // the star icon on the button, in frame px (the tap lands on it, not on the words)
    this.star = [540 - this.bw / 2 + (c.pad + 0.272 * c.box[2]) * k, 1040];
    this.tap = new Tap($('#text'), 190);
    this.tap.el.style.zIndex = '7';
    this.h = T('Купить\nна ~пресейле', TOP - 20, 124);
    whoosh(20.0, 0.3);
    cue(20.73, 'tap', { gain: 0.7 });
  },
  update(t) {
    win(this.h, t, 20.0 - LEAD, 22.0, null, onCut(20.0));
    drift(this.h.el, t, 20, 22, -2, 2);
    const on = t >= 20.0 && t < 22.0;
    this.btn.style.display = on ? '' : 'none';
    if (!on) { this.tap.set({ vis: false }); return; }
    const e = Ease.outExpo(prog(t, 20.0 - LEAD, 20.6)), d = prog(t, 20.0, 22.0);
    const s = lerp(0.92, 1, e) * (1 - 0.045 * press(t, 20.75));
    this.btn.style.opacity = clamp((t - 20.0 + LEAD) / 0.14).toFixed(3);
    this.btn.style.transform = `perspective(1800px) translateY(${((1 - e) * 220).toFixed(2)}px) rotateX(${lerp(8, -2, d).toFixed(3)}deg) rotateY(${lerp(-5, 4, d).toFixed(3)}deg) rotateZ(${lerp(-1.5, -0.6, e).toFixed(3)}deg) scale(${s.toFixed(4)})`;
    this.tap.at(t, 20.75, this.star[0], this.star[1], 0);
  },
});

// ======================================================================= 8. END CARD (22 – 26)
const PS_STAR = `<svg viewBox="0 0 24 24" width="64" height="64"><defs><linearGradient id="ps4" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#a6dc1e"/><stop offset="0.45" stop-color="#45c8b2"/><stop offset="1" stop-color="#7357ff"/></linearGradient></defs><circle cx="12" cy="12" r="12" fill="url(#ps4)"/><path d="M11 5.2 C11.45 8.6 12.4 9.55 15.8 10 C12.4 10.45 11.45 11.4 11 14.8 C10.55 11.4 9.6 10.45 6.2 10 C9.6 9.55 10.55 8.6 11 5.2 Z M15.6 13.6 C15.78 14.98 16.12 15.32 17.5 15.5 C16.12 15.68 15.78 16.02 15.6 17.4 C15.42 16.02 15.08 15.68 13.7 15.5 C15.08 15.32 15.42 14.98 15.6 13.6 Z" fill="#fff"/></svg>`;
scene({
  init() {
    this.logo = logoImg(560);
    this.title = T('INCEPTION ~Coin', 1078, 132);
    this.tag = T('Токен экосистемы INCEPTION', 1236, 46, { cls: 'wl-s', track: -0.01 });
    this.pill = div(`left:${540 - 290}px;top:1372px;width:580px;height:120px;border-radius:60px;background:#fff;display:flex;align-items:center;justify-content:center;gap:22px;box-shadow:0 22px 44px -20px rgba(20,24,60,0.32), 0 2px 6px rgba(20,24,60,0.06);`,
      `${PS_STAR}<div style="text-align:left;line-height:1.05"><div style="font-weight:500;font-size:26px;color:#6b6e76">Пресейл</div><div style="font-weight:700;font-size:44px;letter-spacing:-0.02em;color:#0b0b0d">presale.incpt.fi</div></div>`);
    this.risk = div(`left:0px;top:1560px;width:${W}px;text-align:center;font-weight:500;font-size:27px;color:#8b8e96;`, 'Не является инвестиционной рекомендацией');
    whoosh(23.5, 0.2);
  },
  update(t) {
    markAt(this.logo, t, 22.0 - LEAD, 99, 700, 560);
    if (t < 22.0) this.logo.style.display = 'none';
    win(this.title, t, 22.75, 99);
    win(this.tag, t, 23.0, 99);
    drift(this.title.el, t, 22, 26, -2, 2); drift(this.tag.el, t, 22, 26, -2, 2);
    const p = Ease.outExpo(prog(t, 23.5, 24.1));
    this.pill.style.display = t >= 23.5 ? 'flex' : 'none';      // keep the flex layout
    this.pill.style.opacity = clamp((t - 23.5) / 0.15).toFixed(3);
    this.pill.style.transform = `translateY(${((1 - p) * 34).toFixed(2)}px)`;
    const r = prog(t, 24.0, 24.5);
    this.risk.style.display = r > 0 ? '' : 'none';
    this.risk.style.opacity = r.toFixed(3);
  },
});
