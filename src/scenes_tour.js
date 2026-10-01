// INCPT Wallet — app tour ("Знакомство с INCPT Wallet"). 9:16 tutorial, 80 BPM (beat = 0.75 s).
// The bottom menu is the map: it lifts off with a label on every tab, then the pointer opens the
// five sections one by one. A glass step card on top names the section (with its real tab icon)
// and explains in plain words what lives there. Pointer, rings and taps: src/tutorial.js.
// Screens: assets/app (team screenshots, personal data swapped) -> tools/build_tour.py.
'use strict';

DURATION = 57.0;
META = { drop: 3.0, end: 51.0, bpm: 80, music: 'calm', key: 5 };
const OUT_T = 51.0;                       // tour ends, end card starts
const TR = () => MANIFEST.reel;
const PH = { y: 180, s: 0.53 };           // phone under the step card (stage centre + 180 px)
const iO = Ease.inOutCubic, oC = Ease.outCubic, iC = Ease.inCubic;

// ------------------------------------------------------------------ copy
const SECS = [
  { head: 'НИЖНЕЕ МЕНЮ', chip: 'ОБЗОР ПРИЛОЖЕНИЯ' },
  { head: 'ГЛАВНАЯ', icon: 'home' },
  { head: 'КАРТЫ', icon: 'cards' },
  { head: 'КОШЕЛЁК', icon: 'wallet' },
  { head: 'СТЕЙКИНГ', icon: 'stake' },
  { head: 'ПРОФИЛЬ', icon: 'profile' },
];
const BEATS = [
  { t: 3.0, sec: 0, desc: 'Всё приложение — это <b>5&nbsp;разделов</b>. Пройдёмся по&nbsp;каждому.' },
  { t: 8.25, sec: 1, desc: 'Здесь виден <b>общий баланс</b> всех ваших кошельков и&nbsp;карт.' },
  { t: 11.25, sec: 1, desc: '<b>Получить</b> и&nbsp;<b>Отправить</b> — пополнение и&nbsp;переводы в&nbsp;один тап.' },
  { t: 14.25, sec: 1, desc: 'Ниже — <b>DeFi-кошелёк</b>, ваши <b>карты</b> и&nbsp;история <b>операций</b>.' },
  { t: 18.75, sec: 2, desc: 'Второй значок в&nbsp;меню открывает ваши <b>карты</b>.' },
  { t: 21.75, sec: 2, desc: 'У&nbsp;каждой карты: <b>пополнить</b>, <b>вывести</b>, <b>детали</b> и&nbsp;<b>настройки</b>.' },
  { t: 24.75, sec: 2, desc: 'Листайте вправо, чтобы <b>добавить новую карту</b>.' },
  { t: 28.5, sec: 3, desc: 'Круглая кнопка в&nbsp;центре — ваш <b>криптокошелёк</b>.' },
  { t: 31.5, sec: 3, desc: 'Ваши монеты: <b>USDT, USDC, ETH и&nbsp;BTC</b> — курс и&nbsp;баланс каждой.' },
  { t: 36.0, sec: 4, desc: 'Раздел <b>Stake</b> — стейкинг ваших USDT. Он&nbsp;появится <b>совсем скоро</b>.' },
  { t: 40.5, sec: 5, desc: 'Последний значок — <b>профиль</b>: ваш Telegram&nbsp;ID и&nbsp;email.' },
  { t: 44.25, sec: 5, desc: '<b>PIN</b>, <b>биометрия</b> и&nbsp;<b>сид-фраза</b> защищают ваш кошелёк.' },
  { t: 47.25, sec: 5, desc: 'Ниже — <b>язык</b>, уведомления, <b>поддержка</b> и&nbsp;FAQ.' },
];
const SEC_T = SECS.map((_, k) => BEATS.find(b => b.sec === k).t);
const secEnd = k => (k + 1 < SECS.length ? SEC_T[k + 1] : OUT_T + 2);

// ------------------------------------------------------------------ step card (top of the frame)
class TourPanel {
  constructor() {
    const M = TR();
    this.el = document.createElement('div');
    this.el.className = 'tr-panel';
    this.el.innerHTML = `<div class="tr-top"><div class="tu-chip"></div><div class="tu-prog">${[1, 2, 3, 4, 5].map(() => '<div class="tu-seg"><i></i></div>').join('')}</div></div>
      <div class="tr-body"><div class="tr-headrow"><div class="tr-ico"></div><div class="tr-heads"></div></div></div>`;
    $('#text').appendChild(this.el);
    this.chip = this.el.querySelector('.tu-chip');
    this.segs = [...this.el.querySelectorAll('.tu-seg i')];
    const ico = this.el.querySelector('.tr-ico'), heads = this.el.querySelector('.tr-heads'), body = this.el.querySelector('.tr-body');
    this.secs = SECS.map((s, k) => {
      const h = document.createElement('div');
      h.className = 'tr-head';
      h.innerHTML = `<div class="tu-head"><span class="l">${s.head.split(' ').map(w => `<span class="w">${w}</span>`).join('')}</span></div>`;
      if (!s.icon) h.style.left = '-122px';                       // no icon: the heading starts at the card's edge
      heads.appendChild(h);
      let im = null;
      if (s.icon) { im = mkImg(M.icons[s.icon]); ico.appendChild(im); }
      return { el: h, words: [...h.querySelectorAll('.w')], icon: im };
    });
    this.descs = BEATS.map(b => {
      const d = document.createElement('div');
      d.className = 'tr-desc';
      d.innerHTML = b.desc;
      body.appendChild(d);
      return d;
    });
  }
  at(t) {
    const pin = oX(prog(t, 2.85, 3.75)), pout = iC(prog(t, OUT_T - 0.15, OUT_T + 0.4));
    const o = clamp((t - 2.85) * 5) * (1 - pout);
    this.el.style.display = o > 0.002 ? '' : 'none';
    if (o <= 0.002) return;
    this.el.style.transform = `translateY(${((1 - pin) * -420 - pout * 420).toFixed(1)}px)`;
    this.el.style.opacity = o.toFixed(3);
    let sec = 0;
    SEC_T.forEach((st, k) => { if (t >= st - 0.05) sec = k; });
    this.chip.textContent = sec ? `РАЗДЕЛ ${sec} ИЗ 5` : SECS[0].chip;
    this.segs.forEach((sg, i) => {
      const k = i + 1, f = k < sec ? 1 : k > sec ? 0 : oC(prog(t, SEC_T[k] + 0.1, SEC_T[k] + 0.8));
      sg.style.transform = `scaleX(${f.toFixed(4)})`;
    });
    // section heading: words rise in, leave with a lift + blur; the tab icon pops in beside it
    this.secs.forEach((s, k) => {
      const tin = SEC_T[k] + (k === 0 ? 0.55 : 0.25), tout = secEnd(k) - 0.35;
      let any = false;
      s.words.forEach((w, i) => {
        const p = prog(t, tin + i * 0.09, tin + i * 0.09 + 0.7), e = oX(p);
        const q = iC(prog(t, tout + i * 0.03, tout + i * 0.03 + 0.28));
        const op = clamp(p * 3) * (1 - q);
        if (op > 0.002) any = true;
        w.style.opacity = op.toFixed(3);
        w.style.transform = `translateY(${((1 - e) * 0.42 - q * 0.3).toFixed(4)}em)`;
        w.style.filter = (1 - e) * 14 + q * 10 > 0.1 ? `blur(${((1 - e) * 14 + q * 10).toFixed(2)}px)` : '';
      });
      s.el.style.display = any ? '' : 'none';
      if (s.icon) {
        const pi = oX(prog(t, SEC_T[k] + 0.1, SEC_T[k] + 0.75)), qi = iC(prog(t, tout, tout + 0.28));
        const io = clamp(prog(t, SEC_T[k] + 0.1, SEC_T[k] + 0.3)) * (1 - qi);
        s.icon.style.display = io > 0.002 ? '' : 'none';
        s.icon.style.opacity = io.toFixed(3);
        s.icon.style.transform = `scale(${(lerp(0.55, 1, pi) - qi * 0.2).toFixed(4)}) rotate(${((1 - pi) * -24).toFixed(2)}deg)`;
      }
    });
    // plain-language line for every beat
    this.descs.forEach((d, j) => {
      const b = BEATS[j], first = j === 0 || BEATS[j - 1].sec !== b.sec;
      const tin = b.t + (first ? 0.6 : 0.2), tout = j + 1 < BEATS.length ? BEATS[j + 1].t - 0.3 : OUT_T + 2;
      const pd = prog(t, tin, tin + 0.75), ed = oX(pd), qd = iC(prog(t, tout, tout + 0.28));
      const op = clamp(pd * 2) * (1 - qd);
      d.style.display = op > 0.002 ? '' : 'none';
      d.style.opacity = op.toFixed(3);
      d.style.transform = `translateY(${((1 - ed) * 26 - qd * 14).toFixed(2)}px)`;
      d.style.filter = (1 - ed) * 8 + qd * 6 > 0.1 ? `blur(${((1 - ed) * 8 + qd * 6).toFixed(2)}px)` : '';
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
    Object.assign(this.chip.style, { position: 'absolute', left: '50%', top: '800px', fontSize: '30px' });
    $('#text').appendChild(this.chip);
    this.h = new Headline('ЗНАКОМСТВО\nС INCPT WALLET', { y: 880, size: 124, fit: 980 });
    this.s = new Headline('5 разделов приложения за минуту', { y: 1124, size: 46, color: '#1d2744', cls: 'sub', fit: 940 });
    Object.assign(this.s.el.style, { fontFamily: "'Inter Variable', sans-serif", fontVariationSettings: "'opsz' 32", fontWeight: '600', letterSpacing: '-0.01em' });
    cue(0.0, 'whoosh', { dur: 0.9, gain: 0.3, up: true });
    cue(0.62, 'shimmer', { gain: 0.25 });
    cue(2.62, 'whoosh', { dur: 0.7, gain: 0.3, up: true });
  },
  update(t) {
    const pin = oX(prog(t, 0.05, 0.85)), out = iC(prog(t, 2.55, 3.0));
    this.logo.set({ x: 540, y: 600 - out * 320, h: lerp(70, 250, pin), ry: lerp(-150, -6, pin) + t * 4, rz: lerp(-30, -2, pin), o: clamp(t * 7) * (1 - out), blur: (1 - pin) * 10 + out * 8, sheen: vis(t, 0.8, 1.9) ? prog(t, 0.8, 1.9) : null, shadow: 0.5 });
    const pc = oX(prog(t, 0.45, 1.1));
    Object.assign(this.chip.style, { display: t < 3.05 ? '' : 'none', opacity: (clamp((t - 0.45) * 5) * (1 - out)).toFixed(3),
      transform: `translate(-50%, ${((1 - pc) * 30 - out * 200).toFixed(1)}px)` });
    this.h.at(t, 0.6, 2.55, { stagger: 0.1, dur: 0.7 });
    this.s.at(t, 1.2, 2.6, { stagger: 0.03, dur: 0.7, dy: 0.6, blur: 8 });
  },
});

// ======================================================================= TOUR (3.0 – 51.0)
scene({
  init() {
    const cam = $('#cam'), M = TR(), HY = M.headerY;
    this.panel = new TourPanel();
    this.ph = new Phone(cam, 'tr_cards');
    const sc = this.ph.screenEl;
    sc.innerHTML = '';
    const div = (parent, style = {}) => { const d = document.createElement('div'); Object.assign(d.style, { position: 'absolute', left: '0px', top: '0px', width: '920px', height: '2000px' }, style); parent.appendChild(d); return d; };
    const img = (src, parent, style = {}) => { const im = mkImg(src, 'abs'); Object.assign(im.style, { left: '0px', top: '0px', width: '920px', height: '2000px' }, style); parent.appendChild(im); return im; };
    const ov = (k, parent, style = {}) => img(M.overlays[k].src, parent, { top: M.overlays[k].y + 'px', height: M.overlays[k].h + 'px', ...style });
    const slot = (k, parent) => { const S = M.slots[k]; return img(S.src, parent, { left: S.x + 'px', top: S.y + 'px', width: S.w + 'px', height: S.h + 'px', opacity: '0' }); };
    const cutImg = (k, parent) => { const c = M.cutouts[k]; return img(c.src, parent, { left: c.box[0] - c.pad + 'px', top: c.box[1] - c.pad + 'px', width: c.size[0] + 'px', height: c.size[1] + 'px' }); };
    const page = (k, parent) => {
      const clip = div(parent, { top: HY + 'px', height: 2000 - HY + 'px', overflow: 'hidden' });
      const pg = div(clip, { top: -HY + 'px', height: M.overlays[k].h + 'px' });
      img(M.overlays[k].src, pg, { height: M.overlays[k].h + 'px' });
      return pg;
    };
    // one group per section; tab switches crossfade the groups
    this.g = {};
    this.g.home = div(sc);
    this.pgHome = page('page_home', this.g.home);
    this.slotBal = slot('balance', this.pgHome);
    this.barH1 = ov('bar_home', this.g.home);
    this.barH2 = ov('bar_home2', this.g.home, { opacity: '0' });
    this.g.cards = div(sc);
    img(M.screens.tr_cards, this.g.cards);
    this.cardsLow = img(M.screens.tr_cards_add, this.g.cards, { clipPath: 'inset(952px 0 0 0)', opacity: '0' });
    ov('card_band', this.g.cards);
    this.card2 = cutImg('tr_card2', this.g.cards);
    this.cardAdd = cutImg('tr_cardadd', this.g.cards);
    this.cardAdd.style.transform = `translateX(${M.cardPitch}px)`;
    this.slotAct = slot('actions', this.g.cards);
    this.g.wallet = div(sc);
    img(M.screens.tr_wallet, this.g.wallet);
    this.g.stake = div(sc);
    img(M.screens.tr_stake, this.g.stake);
    this.slotSoon = slot('soon', this.g.stake);
    this.g.profile = div(sc);
    this.pgProf = page('page_profile', this.g.profile);
    this.slotSec = slot('secure', this.pgProf);
    this.barP1 = ov('bar_profile', this.g.profile);
    this.barP2 = ov('bar_profile2', this.g.profile, { opacity: '0' });
    ov('header', sc);
    ov('corners', sc);
    this.dimAll = div(sc, { background: 'rgb(12, 18, 48)', opacity: '0' });
    this.spot = new Spot(sc);
    this.switches = [[0, 'home'], [20.5, 'cards'], [30.2, 'wallet'], [37.6, 'stake'], [42.1, 'profile']];

    // pieces that lift off the screen (each leaves a clean slot behind)
    this.cBar = new Cut(this.ph, 'tr_tabbar');
    this.cBal = new Cut(this.ph, 'tr_balance');
    this.cAct = new Cut(this.ph, 'tr_actions');
    this.cSoon = new Cut(this.ph, 'tr_soon');
    this.cSec = new Cut(this.ph, 'tr_secure');
    this.rings = [this.cBal, this.cAct, this.cSoon, this.cSec].map(liftRing);
    // the lifted menu gets a label under (or over) every tab, alternating so they never collide
    const cb = this.cBar.meta, by = cb.box[1];
    this.labels = [['Главная', 114.5, 1], ['Карты', 270, -1], ['Кошелёк', 459.5, 1], ['Stake', 650, -1], ['Профиль', 805, 1]].map(([s, x, side]) => {
      const d = document.createElement('div');
      d.className = 'tr-label';
      d.textContent = s;
      d.style.left = cb.pad + x + 'px';
      d.style.top = (side > 0 ? cb.pad + 1897 - by + 22 : cb.pad + 1732 - by - 22 - 62) + 'px';
      this.cBar.el.appendChild(d);
      d.side = side;
      return d;
    });
    this.LB = { y: -410, z: 200, s: 1.5 };
    this.LBal = { y: -40, z: 170, s: 1.5 };
    this.LAct = { y: -90, z: 170, s: 1.24 };
    this.LSoon = { y: -30, z: 180, s: 1.4 };
    this.LSec = { y: -150, z: 170, s: 1.18 };

    // ------------------------------------------------ pointer (phone-local = screen offset + screen px)
    this.ptr = new Pointer(this.ph);
    const so = MANIFEST.phone.screenOffset, R = M.rects;
    const c = (n, dx = 0, dy = 0) => [so[0] + R[n][0] + R[n][2] / 2 + dx, so[1] + R[n][1] + R[n][3] / 2 + dy];
    const at = (t, n, dx, dy, z = 30, dur = 0.9) => { const [x, y] = c(n, dx, dy); return [t, x, y, z, dur]; };
    const onLift = (n, lf, dx = 0, dy = 0) => { const P = c(n), Q = c(n, dx, dy); return [P[0] + (Q[0] - P[0]) * lf.s + (lf.x || 0), P[1] + (Q[1] - P[1]) * lf.s + lf.y]; };
    const card = c('addcard');
    this.drag = [25.45, 26.05];
    const act = onLift('actions', this.LAct, -300, -30);
    this.path = [
      [10.6, 1500, 2600, 30],
      at(11.9, 'buttons', -215, 10, 30, 1.2),
      at(12.9, 'buttons', 215, 10, 30, 0.8),
      at(15.9, 'defi', 250, 0, 30, 0.9),
      at(16.8, 'card', 150, 40, 30, 0.8),
      at(17.7, 'ops', 200, -140, 30, 0.8),
      at(19.9, 'tab_cards', 8, 8, 30, 1.1),
      [22.9, act[0], act[1], this.LAct.z + 20, 1.1],
      [25.35, card[0] + 160, card[1] + 40, 30, 1.0],
      [26.05, card[0] - 140, card[1] + 40, 30, 0.6],
      [26.9, card[0] + 60, card[1] + 330, 30, 0.8],
      at(29.6, 'tab_wallet', 10, 10, 30, 1.2),
      at(32.1, 'row_usdt', 300, 0, 30, 1.0),
      at(32.9, 'row_usdc', 300, 0, 30, 0.6),
      at(33.7, 'row_eth', 300, 0, 30, 0.6),
      at(34.5, 'row_btc', 300, -20, 30, 0.6),
      at(37.0, 'tab_stake', 8, 8, 30, 1.2),
      at(38.9, 'soon', 210, 150, this.LSoon.z + 20, 0.9),
      at(41.5, 'tab_profile', 8, 8, 30, 1.3),
      at(43.2, 'idcard', 250, 30, 30, 1.0),
      [45.4, ...onLift('secure', this.LSec, 300, -40), this.LSec.z + 20, 1.0],
      at(49.1, 'lang', 280, 0, 30, 1.0),
      at(50.0, 'settings', 280, 40, 30, 0.8),
    ];
    this.taps = [20.4, 30.1, 37.5, 42.0];
    this.spotKeys = [
      [11.6, 'buttons'], [13.9, null],
      [15.6, 'defi'], [16.5, 'card'], [17.4, 'ops'], [18.4, null],
      [19.1, 'tab_cards'], [20.55, null],
      [26.9, 'addcard'], [28.2, null],
      [28.8, 'tab_wallet'], [30.25, null],
      [31.8, 'row_usdt'], [32.6, 'row_usdc'], [33.4, 'row_eth'], [34.2, 'row_btc'], [35.3, null],
      [36.3, 'tab_stake'], [37.65, null],
      [40.8, 'tab_profile'], [42.15, null],
      [42.8, 'idcard'], [44.1, null],
      [48.8, 'lang'], [49.7, 'settings'], [50.7, null],
    ];

    // ------------------------------------------------ sound
    cue(3.0, 'whoosh', { dur: 0.7, gain: 0.3, up: true });
    BEATS.forEach((b, i) => { if (i) cue(b.t, 'whoosh', { dur: 0.5, gain: 0.12 }); cue(b.t + 0.12, 'tick', { gain: 0.26 }); });
    cue(4.0, 'whoosh', { dur: 0.8, gain: 0.22, up: true });
    this.labels.forEach((_, i) => cue(4.6 + i * 0.28, 'tick', { gain: 0.22, pan: -0.5 + i * 0.25 }));
    cue(7.5, 'pop', { gain: 0.25, pitch: 0.85 });
    [8.9, 22.1, 38.3, 44.6].forEach(tt => cue(tt, 'whoosh', { dur: 0.8, gain: 0.14, up: true }));
    [10.9, 24.3, 40.0, 46.8].forEach(tt => cue(tt + 0.35, 'pop', { gain: 0.22, pitch: 0.9 }));
    [14.5, 47.5].forEach(tt => cue(tt, 'whoosh', { dur: 1.0, gain: 0.1 }));
    [15.6, 16.5, 17.4, 31.8, 32.6, 33.4, 34.2, 48.8, 49.7].forEach(tt => cue(tt, 'tick', { gain: 0.16 }));
    this.taps.forEach(tt => { cue(tt, 'tap', { gain: 0.5 }); cue(tt + 0.02, 'pop', { gain: 0.22, pitch: 1.2 }); });
    cue(this.drag[0], 'tap', { gain: 0.35 });
    cue(26.05, 'whoosh', { dur: 0.5, gain: 0.25, pan: -0.5 });
  },
  update(t) {
    this.panel.at(t);
    const on = vis(t, 2.4, OUT_T + 0.8);
    this.ph.set({ vis: on });
    if (!on) { this.ptr.at(t, this.path, this.taps, false); return; }
    const M = TR();
    CAM.s = kf(t, [[3.0, 1.0], [OUT_T, 1.03, lin]]);
    const pin = oX(prog(t, 2.55, 3.6)), pout = iC(prog(t, OUT_T - 0.1, OUT_T + 0.5));
    this.ph.set({
      x: -pout * 900, y: PH.y + (1 - pin) * 1500, s: PH.s,
      rx: (1 - pin) * 24 + Math.sin(t * 0.4) * 1.2, ry: Math.sin(t * 0.3 + 1) * 2 - pout * 20, rz: (1 - pin) * -3,
    });

    // --- tab switches: the new section's group fades in over the old one
    let cur = 0;
    this.switches.forEach(([ts], i) => { if (t >= ts) cur = i; });
    this.switches.forEach(([ts, k], i) => {
      const p = i === cur ? (i ? oC(prog(t, ts, ts + 0.35)) : 1) : i === cur - 1 && t < this.switches[cur][0] + 0.35 ? 1 : 0;
      this.g[k].style.display = p > 0 ? '' : 'none';
      this.g[k].style.opacity = p >= 1 ? '' : p.toFixed(3);
    });

    // --- scrolling pages (the frosted tab bar picks up what scrolls under it)
    const hs = iO(prog(t, 14.5, 15.7)), ps = iO(prog(t, 47.5, 48.7));
    this.pgHome.style.transform = `translateY(${(-hs * M.homeScroll).toFixed(1)}px)`;
    this.pgProf.style.transform = `translateY(${(-ps * M.overlays.page_profile.scroll).toFixed(1)}px)`;
    this.barH2.style.opacity = hs.toFixed(3);
    this.barP2.style.opacity = ps.toFixed(3);

    // --- cards carousel: the finger drags card #2 left, it snaps to the "add card" tile
    const [d0, d1] = this.drag;
    const fx = iO(prog(t, d0 + 0.05, d1)) * -300;
    const off = t < d1 ? fx : lerp(-300, -M.cardPitch, oC(prog(t, d1, d1 + 0.7)));
    this.card2.style.transform = `translateX(${off.toFixed(1)}px)`;
    this.cardAdd.style.transform = `translateX(${(M.cardPitch + off).toFixed(1)}px)`;
    this.cardsLow.style.opacity = oC(prog(t, d1 + 0.05, d1 + 0.5)).toFixed(3);

    // --- highlights on the screen
    this.spot.at(t, this.spotKeys);

    // --- lifts: menu (with labels), balance, card actions, "coming soon", security
    const L = (cut, ring, slotEl, t0, t1, to) => {
      lift(cut, t, t0, 0.9, to, { t: t1, dur: 0.5 });
      cut.set({ vis: t > t0 - 0.01 && t < t1 + 0.52 });
      const life = t < t0 ? 0 : Math.min((t - t0) * 10, 1 - ioC(prog(t, t1, t1 + 0.5)));
      if (slotEl) slotO(slotEl, life);
      if (ring) {
        ring.style.opacity = clamp(Math.min(oC(prog(t, t0 + 0.2, t0 + 0.7)), 1 - prog(t, t1 - 0.25, t1))).toFixed(3);
        ring.style.background = tuFoil(t * 60);
      }
      return life;
    };
    const lb = L(this.cBar, null, null, 4.0, 7.5, this.LB);
    this.barH1.style.opacity = (clamp(1 - lb) * (1 - hs)).toFixed(3);
    this.dimAll.style.opacity = (0.34 * Math.min(oC(prog(t, 4.0, 4.5)), 1 - prog(t, 7.4, 7.9))).toFixed(3);
    this.labels.forEach((d, i) => {
      const p = oX(prog(t, 4.6 + i * 0.28, 4.6 + i * 0.28 + 0.6)), q = iC(prog(t, 7.05 + i * 0.03, 7.35 + i * 0.03));
      d.style.opacity = (clamp((t - 4.6 - i * 0.28) * 6) * (1 - q)).toFixed(3);
      d.style.transform = `translate(-50%, ${((1 - p) * 26 * d.side).toFixed(1)}px) scale(${lerp(0.7, 1, p).toFixed(3)})`;
    });
    L(this.cBal, this.rings[0], this.slotBal, 8.9, 10.9, this.LBal);
    L(this.cAct, this.rings[1], this.slotAct, 22.1, 24.3, this.LAct);
    L(this.cSoon, this.rings[2], this.slotSoon, 38.3, 40.0, this.LSoon);
    L(this.cSec, this.rings[3], this.slotSec, 44.6, 46.8, this.LSec);

    // --- the pointer: glides between targets, taps the tabs, drags the cards
    this.ptr.at(t, this.path, this.taps, t > 10.6 && t < OUT_T + 0.2, [this.drag]);
  },
});

// ======================================================================= END CARD (51.0 – 57.0)
endCard(OUT_T, 'ВАШ КРИПТОКОШЕЛЁК В TELEGRAM', DURATION, 0.55);
