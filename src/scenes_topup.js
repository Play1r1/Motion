// INCPT Wallet — how to top up the wallet. 1:1 (1080x1080) tutorial, 80 BPM (beat = 0.75 s).
// Pointer, highlights and taps come from src/tutorial.js (all in the logo's foil colours).
// A glass step card on the right explains every action in plain words.
// UI comes from the team's beta video (assets/topup/source/beta.mp4), never redrawn.
'use strict';

DURATION = 40.5;
META = { drop: 3.0, end: 34.5, bpm: 80, music: 'calm', key: 3 };
const R_ = () => MANIFEST.reel;
const PH_X = -252, PH_S = 0.47;          // phone: left half of the square, 47 % scale
const iO = Ease.inOutCubic, oC = Ease.outCubic, iC = Ease.inCubic;

// ------------------------------------------------------------------ steps (copy)
const STEPS = [
  { t: 3.0, head: 'ОТКРОЙТЕ\nКОШЕЛЁК', desc: 'Внизу экрана нажмите на&nbsp;круглую кнопку с&nbsp;иконкой <b>кошелька</b>.' },
  { t: 9.0, head: 'НАЖМИТЕ\n«ПОЛУЧИТЬ»', desc: 'Эта кнопка открывает <b>пополнение</b> кошелька.' },
  { t: 15.0, head: 'ВЫБЕРИТЕ\nМОНЕТУ', desc: 'Доступны Tether&nbsp;(USDT), USDC, Ethereum и&nbsp;Bitcoin. Для примера выберем <b>Tether&nbsp;(USDT)</b>.' },
  { t: 22.5, head: 'ВЫБЕРИТЕ\nСЕТЬ', desc: '<b>TRC-20</b> или <b>ERC-20</b>. Сеть должна совпадать с&nbsp;той, из&nbsp;которой вы отправляете монеты.' },
  { t: 28.5, head: 'СКОПИРУЙТЕ\nАДРЕС', desc: 'Нажмите на&nbsp;значок копирования и&nbsp;вставьте адрес там, откуда отправляете. Или&nbsp;отсканируйте <b>QR-код</b>.' },
];
const OUT_T = 34.5;                      // tutorial ends, end card starts

// ------------------------------------------------------------------ step card
class Panel {
  constructor() {
    this.el = document.createElement('div');
    this.el.className = 'tu-panel';
    this.el.innerHTML = `<div class="tu-chip">ШАГ 1 ИЗ 5</div><div class="tu-prog">${STEPS.map(() => '<div class="tu-seg"><i></i></div>').join('')}</div><div class="tu-body"></div>`;
    $('#text').appendChild(this.el);
    this.chip = this.el.querySelector('.tu-chip');
    this.segs = [...this.el.querySelectorAll('.tu-seg i')];
    const body = this.el.querySelector('.tu-body');
    this.steps = STEPS.map(st => {
      const d = document.createElement('div');
      d.className = 'tu-step';
      d.innerHTML = `<div class="tu-head">${st.head.split('\n').map(l => `<span class="l">${l.split(' ').map(w => `<span class="w">${w}</span>`).join('')}</span>`).join('')}</div><div class="tu-desc">${st.desc}</div>`;
      body.appendChild(d);
      return { el: d, head: d.querySelector('.tu-head'), words: [...d.querySelectorAll('.w')], desc: d.querySelector('.tu-desc') };
    });
    this.fitted = false;
  }
  fit() {
    this.fitted = true;
    for (const s of this.steps) {
      s.el.style.display = '';
      const w = Math.max(...[...s.head.querySelectorAll('.l')].map(l => l.offsetWidth));
      if (w > 372) s.head.style.fontSize = 60 * 372 / w + 'px';
    }
  }
  at(t) {
    if (!this.fitted) this.fit();
    // card: slides in from the right after the intro, leaves before the end card
    const pin = oX(prog(t, 2.9, 3.7)), pout = iC(prog(t, OUT_T - 0.1, OUT_T + 0.45));
    const o = clamp((t - 2.9) * 5) * (1 - pout);
    this.el.style.display = o > 0.002 ? '' : 'none';
    this.el.style.top = '292px';
    this.el.style.transform = `translate(${((1 - pin) * 520 + pout * 520).toFixed(1)}px, 0)`;
    this.el.style.opacity = o.toFixed(3);
    let cur = 0;
    STEPS.forEach((st, i) => { if (t >= st.t - 0.05) cur = i; });
    this.chip.textContent = `ШАГ ${cur + 1} ИЗ ${STEPS.length}`;
    this.segs.forEach((sg, i) => {
      const f = i < cur ? 1 : i > cur ? 0 : oC(prog(t, STEPS[i].t + 0.1, STEPS[i].t + 0.8));
      sg.style.transform = `scaleX(${f.toFixed(4)})`;
    });
    this.steps.forEach((s, i) => {
      const tin = STEPS[i].t + (i === 0 ? 0.55 : 0.25), tout = i + 1 < STEPS.length ? STEPS[i + 1].t - 0.35 : OUT_T + 2;
      let any = false;
      s.words.forEach((w, k) => {
        const p = prog(t, tin + k * 0.09, tin + k * 0.09 + 0.7), e = oX(p);
        const q = iC(prog(t, tout + k * 0.03, tout + k * 0.03 + 0.28));
        const op = clamp(p * 3) * (1 - q);
        if (op > 0.002) any = true;
        w.style.opacity = op.toFixed(3);
        w.style.transform = `translateY(${((1 - e) * 0.42 - q * 0.3).toFixed(4)}em)`;
        w.style.filter = (1 - e) * 14 + q * 10 > 0.1 ? `blur(${((1 - e) * 14 + q * 10).toFixed(2)}px)` : '';
      });
      const pd = prog(t, tin + 0.35, tin + 1.1), ed = oX(pd), qd = iC(prog(t, tout, tout + 0.28));
      s.desc.style.opacity = (clamp(pd * 2) * (1 - qd)).toFixed(3);
      s.desc.style.transform = `translateY(${((1 - ed) * 26 - qd * 14).toFixed(2)}px)`;
      s.el.style.display = any || clamp(pd * 2) * (1 - qd) > 0.002 ? '' : 'none';
    });
  }
}

// ======================================================================= INTRO (0 – 3.0)
scene({
  init() {
    this.logo = new LogoMark();
    this.chip = document.createElement('div');
    this.chip.className = 'tu-chip';
    this.chip.textContent = 'ИНСТРУКЦИЯ';
    Object.assign(this.chip.style, { position: 'absolute', left: '50%', top: '430px', fontSize: '26px' });
    $('#text').appendChild(this.chip);
    this.h = new Headline('КАК ПОПОЛНИТЬ\nКОШЕЛЁК', { y: 506, size: 104, fit: 980 });
    this.s = new Headline('5 простых шагов в INCPT Wallet', { y: 730, size: 40, color: '#1d2744', cls: 'sub', fit: 900 });
    Object.assign(this.s.el.style, { fontFamily: "'Inter Variable', sans-serif", fontVariationSettings: "'opsz' 32", fontWeight: '600', letterSpacing: '-0.01em' });
    cue(0.0, 'whoosh', { dur: 0.9, gain: 0.3, up: true });
    cue(0.62, 'shimmer', { gain: 0.25 });
    cue(2.62, 'whoosh', { dur: 0.7, gain: 0.3, up: true });
  },
  update(t) {
    const pin = oX(prog(t, 0.05, 0.85)), out = iC(prog(t, 2.55, 3.0));
    this.logo.set({ x: 540, y: 290 - out * 260, h: lerp(60, 200, pin), ry: lerp(-150, -6, pin) + t * 4, rz: lerp(-30, -2, pin), o: clamp(t * 7) * (1 - out), blur: (1 - pin) * 10 + out * 8, sheen: vis(t, 0.8, 1.9) ? prog(t, 0.8, 1.9) : null, shadow: 0.5 });
    const pc = oX(prog(t, 0.45, 1.1));
    Object.assign(this.chip.style, { display: t < 3.05 ? '' : 'none', opacity: (clamp((t - 0.45) * 5) * (1 - out)).toFixed(3),
      transform: `translate(-50%, ${((1 - pc) * 30 - out * 200).toFixed(1)}px)` });
    this.h.at(t, 0.6, 2.55, { stagger: 0.1, dur: 0.7 });
    this.s.at(t, 1.2, 2.6, { stagger: 0.03, dur: 0.7, dy: 0.6, blur: 8 });
  },
});

// ======================================================================= TUTORIAL (3.0 – 34.5)
scene({
  init() {
    const cam = $('#cam'), M = R_();
    this.panel = new Panel();
    this.ph = new Phone(cam, 'tu_home');
    const sc = this.ph.screenEl;
    sc.innerHTML = '';
    const img = (src, parent, style = {}) => { const im = mkImg(src, 'abs'); Object.assign(im.style, { left: '0px', top: '0px', width: '920px', height: '2000px' }, style); parent.appendChild(im); return im; };
    const div = (parent, style) => { const d = document.createElement('div'); Object.assign(d.style, { position: 'absolute' }, style); parent.appendChild(d); return d; };
    const HY = M.headerY;
    // Telegram header (fixed), web content below it (pages push / crossfade inside a clip)
    this.hdrA = img(M.screens.tu_wallet, sc, { clipPath: `inset(0 0 ${2000 - HY}px 0)` });
    this.hdrB = img(M.screens.tu_qr, sc, { clipPath: `inset(0 0 ${2000 - HY}px 0)`, opacity: '0' });
    const cc = div(sc, { left: '0px', top: HY + 'px', width: '920px', height: 2000 - HY + 'px', overflow: 'hidden' });
    this.pageA = div(cc, { left: '0px', top: -HY + 'px', width: '920px', height: '2000px' });
    this.home = img(M.screens.tu_home, this.pageA);
    this.wallet = img(M.screens.tu_wallet, this.pageA, { opacity: '0' });
    this.dim = div(this.pageA, { left: '0px', top: HY + 'px', width: '920px', height: 2000 - HY + 'px', background: '#000', opacity: '0' });
    this.sheet = img(M.sheet.src, this.pageA, { top: M.sheet.y + 'px', height: M.sheet.h + 'px' });
    this.pageB = div(cc, { left: '0px', top: -HY + 'px', width: '920px', height: '2000px' });
    this.qr = img(M.screens.tu_qr, this.pageB);
    this.pushDim = div(this.pageA, { left: '0px', top: '0px', width: '920px', height: '2000px', background: '#000', opacity: '0' });
    this.slots = {};
    for (const k of ['qr_toggle', 'qr_addr', 'qr_warn']) {
      const S = M.slots[k];
      this.slots[k] = img(S.src, this.pageB, { left: S.x + 'px', top: S.y + 'px', width: S.w + 'px', height: S.h + 'px', opacity: '0' });
    }
    this.spot = new Spot(sc);
    // lifted pieces of the QR screen (the slot patches keep the screen from showing them twice)
    this.toggle = new Cut(this.ph, 'tu_toggle');
    this.warn = new Cut(this.ph, 'tu_warn');
    this.addr = new Cut(this.ph, 'tu_addr');
    this.rings = { toggle: liftRing(this.toggle), warn: liftRing(this.warn), addr: liftRing(this.addr) };
    this.ptr = new Pointer(this.ph);
    // pointer path (phone-local = screenOffset + screen coords)
    const so = MANIFEST.phone.screenOffset, R = M.rects;
    const c = (n, dx = 0, dy = 0) => [so[0] + R[n][0] + R[n][2] / 2 + dx, so[1] + R[n][1] + R[n][3] / 2 + dy];
    const at = (t, n, dx, dy, z = 30, dur = 0.9) => { const [x, y] = c(n, dx, dy); return [t, x, y, z, dur]; };
    // the address row is lifted in step 5: its copy icon moves with it
    const A = this.LA = { x: 44, y: -80, z: 110, s: 1.14 };
    this.LT = { y: -60, z: 230, s: 1.85 };
    this.LW = { y: -140, z: 230, s: 1.25 };
    // a point on a lifted element: its centre moves by the lift offset, the rest scales around it
    const onLift = (parent, n, lf, dx = 0, dy = 0) => {
      const P = c(parent), Q = c(n, dx, dy);
      return [P[0] + (Q[0] - P[0]) * lf.s + (lf.x || 0), P[1] + (Q[1] - P[1]) * lf.s + lf.y];
    };
    const copyLift = onLift('addr', 'copy', A), trcLift = onLift('toggle', 'trc', this.LT, 46, 22), warnLift = onLift('warn', 'warn', this.LW, 250, 30);
    this.path = [
      [3.0, 2400, 1500, 30],
      at(5.4, 'home_tab', 10, 10, 30, 1.3),
      at(10.8, 'recv', 60, 10, 30, 1.1),
      at(16.3, 'row_tether', 250, 0),
      at(17.1, 'row_usdc', 250, 0, 30, 0.6),
      at(17.9, 'row_eth', 250, 0, 30, 0.6),
      at(18.7, 'row_btc', 250, 0, 30, 0.6),
      at(19.9, 'row_tether', 250, 0, 30, 0.9),
      [24.2, trcLift[0], trcLift[1], this.LT.z + 20, 1.0],
      [26.6, warnLift[0], warnLift[1], this.LW.z + 20, 0.9],
      [30.6, copyLift[0], copyLift[1], A.z + 20, 1.0],
      at(32.9, 'qr', 150, 160, 30, 1.0),
    ];
    this.taps = [6.6, 12.0, 20.4, 24.9, 31.2];
    this.spotKeys = [
      [4.9, 'home_tab'], [6.9, null],
      [10.2, 'recv'], [12.15, null],
      [15.9, 'row_tether'], [16.7, 'row_usdc'], [17.5, 'row_eth'], [18.3, 'row_btc'], [19.3, 'row_tether'], [20.55, null],
      [32.4, 'qr'], [34.3, null],
    ];
    // sound
    cue(3.0, 'whoosh', { dur: 0.7, gain: 0.3, up: true });
    STEPS.forEach((st, i) => { if (i) cue(st.t, 'whoosh', { dur: 0.5, gain: 0.14 }); cue(st.t + 0.12, 'tick', { gain: 0.3 }); });
    [4.1, 9.9, 15.4, 23.2, 29.6, 31.9].forEach(tt => cue(tt, 'whoosh', { dur: 0.8, gain: 0.08 }));
    [16.6, 17.4, 18.2, 19.2].forEach(tt => cue(tt, 'tick', { gain: 0.18 }));
    this.taps.forEach(tt => { cue(tt, 'tap', { gain: 0.5 }); cue(tt + 0.02, 'pop', { gain: 0.22, pitch: 1.2 }); });
    cue(12.25, 'whoosh', { dur: 0.5, gain: 0.25, up: true });
    cue(20.6, 'whoosh', { dur: 0.45, gain: 0.25, pan: -0.5 });
    cue(23.3, 'pop', { gain: 0.3, pitch: 0.85 }); cue(25.9, 'pop', { gain: 0.3, pitch: 0.95 }); cue(29.3, 'pop', { gain: 0.3, pitch: 0.9 });
    cue(31.25, 'confirm', { gain: 0.35 });
  },
  update(t) {
    this.panel.at(t);
    const on = vis(t, 2.4, OUT_T + 0.8);
    this.ph.set({ vis: on });
    if (!on) { this.ptr.at(t, this.path, this.taps, false); return; }
    CAM.s = kf(t, [[3.0, 1.0], [OUT_T, 1.04, lin]]);
    const pin = oX(prog(t, 2.55, 3.6)), pout = iC(prog(t, OUT_T - 0.1, OUT_T + 0.5));
    this.ph.set({
      x: PH_X - pout * 900, y: (1 - pin) * 1500, s: PH_S,
      rx: (1 - pin) * 24 + Math.sin(t * 0.4) * 1.2, ry: (1 - pin) * -10 + Math.sin(t * 0.3 + 1) * 2 - pout * 20, rz: (1 - pin) * -3,
    });

    // --- screen flow: home -> wallet (crossfade), sheet up, push to the QR page
    const xf = oC(prog(t, 6.75, 7.1));
    this.wallet.style.opacity = xf.toFixed(3);
    this.home.style.opacity = (1 - xf).toFixed(3);
    const sh = oX(prog(t, 12.2, 13.0));
    this.dim.style.opacity = (R_().dim * oC(prog(t, 12.15, 12.5))).toFixed(3);
    this.sheet.style.transform = `translateY(${((1 - sh) * 1010).toFixed(1)}px)`;
    const push = Ease.inOutCubic(prog(t, 20.55, 21.1));
    this.pageA.style.transform = `translateX(${(-0.3 * 920 * push).toFixed(1)}px)`;
    this.pushDim.style.opacity = (0.18 * push).toFixed(3);
    this.pageB.style.transform = `translateX(${((1 - push) * 920).toFixed(1)}px)`;
    this.pageB.style.display = push > 0 ? '' : 'none';
    this.hdrB.style.opacity = oC(prog(t, 20.7, 21.05)).toFixed(3);

    // --- highlights on the phone screen
    this.spot.at(t, this.spotKeys);

    // --- step 4: the network toggle lifts, then the warning; step 5: the address row
    const L = (n, cut, slotK, t0, t1, to) => {
      lift(cut, t, t0, 0.9, to, { t: t1, dur: 0.5 });
      cut.set({ vis: t > t0 - 0.01 && t < t1 + 0.52 });
      slotO(this.slots[slotK], t < t0 ? 0 : Math.min((t - t0) * 10, 1 - Ease.inOutCubic(prog(t, t1, t1 + 0.5))));
      const ro = Math.min(oC(prog(t, t0 + 0.2, t0 + 0.7)), 1 - prog(t, t1 - 0.25, t1));
      this.rings[n].style.opacity = clamp(ro).toFixed(3);
      this.rings[n].style.background = tuFoil(t * 60);
    };
    L('toggle', this.toggle, 'qr_toggle', 23.3, 25.7, this.LT);
    L('warn', this.warn, 'qr_warn', 25.9, 28.25, this.LW);
    L('addr', this.addr, 'qr_addr', 29.3, 32.2, this.LA);
    // the pointer: glides between targets, presses, ripples in the logo's foil colours
    this.ptr.at(t, this.path, this.taps, t > 3.2 && t < OUT_T + 0.2);
  },
});

// ======================================================================= END CARD (34.5 – 40.5)
endCard(OUT_T, 'ПОПОЛНИТЬ КОШЕЛЁК СТАЛО ПРОЩЕ', DURATION, 0.55, { logoY: 330, logoH: 330, lockTop: 560, badgeY: 770 });
