// «Из крипты — в карту» (v4) — Instagram, 9:16, 24.6 s, on one uncut stretch of its own 110 BPM track
// (assets/music/f_card_edit.json: the intro and its riser, the drop at 4.36 s, the groove, and the music ending
// on the downbeat of the next section with a hall tail under the logo).
// The story is the app's own data and it adds up: the card had $20,018.50; 5,000 USDT goes in (the wallet sends
// −$5,025 over TRC-20, the card receives +$5,000) -> $25,018.50; a Starbucks payment of $18.50 -> $25,000.00,
// exactly the card balance and «Сегодня ↓ $5,000 ↑ $18.50» on the app's «Мои карты» screen.
//   0.00  hook: the INCPT card (the app's render, 1:1) and a USDT coin; on the riser the coin flies into the card;
//         on the drop the card takes it — a ripple, +$5,000, the balance rolls to $25,018.50
//   4.36  the card drops into its place on the phone (the «Мои карты» screen, vector); the two operations arrive
//   8.73  the card lifts out of the phone, pays (Starbucks −$18.50), the balance rolls to $25,000.00, goes back
//  13.09  the operations sheet: today in and out, the three operations
//  17.45  the screen scrolls to «Добавить карту», a tap, the tile lifts: virtual and metal cards
//  21.5   the lock-up lands on the music's last downbeat
'use strict';

const BT = 60 / 110, BAR = 4 * BT;
const S = n => n * BAR;
DURATION = 24.6;
META = { drop: S(2), end: 21.5, bpm: 110, musicEdit: 'assets/music/f_card_edit.json', sfxGain: 0.4, sfxOnly: ['whoosh', 'tap'] };
const oC = Ease.outCubic, iC = Ease.inCubic, oQ = Ease.outQuint, io = Ease.inOutCubic, oE = Ease.outExpo;
drawBg = t => { LG.reset(); LG.F.white = 1; LG.draw(t); };

const SHOW = { stagger: 0.07, dur: 0.6, dy: 0.3, blur: 8, outDur: 0.22, outStagger: 0.02, outDy: -0.18 };
const HL = (text, size = 104) => { const w = new WText(text, { y: 150, size, fit: 960, track: -0.02 }); w.el.style.zIndex = 10; return w; };
function win(txt, t, tin, tend) {
  if (t >= tend || t < tin - 0.01) { txt.el.style.display = 'none'; return; }
  txt.at(t, tin, tend - 0.24, SHOW);
}
const PH = { x: 540, y: 1113, s: 0.62 };          // the phone at rest
const HERO = { x: 540, y: 1040 };                  // the card in the hook (764 x 484, its own pixels)

scene({
  init() {
    LG.init();
    this.Lp = AK.layer(1, 2400);
    this.Lh = AK.layer(3);
    this.Ll = AK.layer(4);
    this.Lt = AK.layer(6);
    this.Lx = AK.layer(8);
    // the phone: «Мои карты»
    this.ph = new AppPhone(this.Lp, { hdr: 'close', bar: 'cards', h: 2300 });
    AK.cardsScreen(this.ph.content, { bal: '$25,018.50' });
    const C = this.ph.content;
    this.pBal = AK.q(C, 'bal'); this.pCard = AK.q(C, 'card'); this.pToday = AK.q(C, 'today'); this.pAdd = AK.q(C, 'add');
    this.pCardBal = new Odo(AK.q(this.pCard, 'cbal'), '$25,018.50');
    this.pBalO = new Odo(this.pBal, '$25,018.50');
    this.pTin = AK.q(this.pToday, 'tin'); this.pTout = AK.q(this.pToday, 'tout');
    // the hook card: the app's render with its balance as live text
    this.card = AK.el(this.Lh, `<div style="position:absolute;left:0;top:0;width:764px;height:484px;border-radius:44px;overflow:hidden">${AK.cardFace('$20,018.50')}
      <div data-k="sheen" style="position:absolute;inset:0;mix-blend-mode:soft-light;pointer-events:none"></div></div>`);
    this.cardBal = new Odo(AK.q(this.card, 'cbal'), '$20,018.50');
    this.cardSheen = AK.q(this.card, 'sheen');
    this.ripple = [0, 1].map(() => AK.el(this.Lh, '<div style="position:absolute;left:0;top:0;width:200px;height:200px;margin:-100px 0 0 -100px;border-radius:50%;border:3px solid rgba(255,255,255,0.95);box-shadow:0 0 0 1px rgba(19,36,64,0.06), inset 0 0 18px rgba(255,255,255,0.5)"></div>'));
    // the coin and its amount
    this.coin = AK.el(this.Lh, `<div style="position:absolute;left:0;top:0;width:220px;height:220px;margin:-110px 0 0 -110px;filter:drop-shadow(0 22px 26px rgba(16,24,52,0.25))">${AK.coin('usdt', 220)}</div>`);
    this.coinChip = new GlassCard(this.Lh, `<div class="ak-pill" style="inset:0;font-size:34px;font-weight:600">5,000 USDT</div>`, { w: 270, h: 84, r: 42, tint: 0.7 });
    this.plus = new GlassCard(this.Lh, `<div class="ak-pill" style="inset:0;font-size:46px;font-weight:700;color:${AK.green}">+$5,000</div>`, { w: 280, h: 104, r: 52, tint: 0.7 });
    // the card lifted out of the phone to pay (plain, it is a card, not a panel)
    this.lcard = new Lift(this.Ll, this.pCard, `<div style="position:absolute;left:0;top:0;width:764px;height:484px;transform:scale(${(826 / 764).toFixed(5)});transform-origin:0 0">${AK.cardFace('$25,018.50')}</div>`, { w: 826, h: 523, r: 50, glass: false });
    this.lcardBal = new Odo(AK.q(this.lcard.body, 'cbal'), '$25,018.50');
    this.nfc = [0, 1, 2].map(() => AK.el(this.Ll, '<div style="position:absolute;left:0;top:0;width:300px;height:300px;margin:-150px 0 0 -150px;border-radius:50%;border:3px solid rgba(255,255,255,0.95);box-shadow:0 4px 18px -6px rgba(19,36,64,0.25)"></div>'));
    // notifications: the app's operation rows on glass
    const toast = r => new GlassCard(this.Lt, `<div style="position:absolute;left:12px;top:10px">${AK.row({ ...r, w: 856 })}</div>`, { w: 880, h: 170, r: 52, tint: 0.62 });
    this.t1 = toast({ dir: 'out', title: 'Пополнение карты', chip: 'TRC-20', sub: '1 окт., 16:40 · T9x...4Qp', amount: '−$5,025', status: 'Отправлено' });
    this.t2 = toast({ dir: 'in', title: 'Пополнение', chip: 'Карта', sub: '1 окт., 16:41', amount: '+$5,000', status: 'Получено' });
    this.t3 = toast({ dir: 'out', title: 'Starbucks', chip: 'Карта', sub: '1 окт., 16:44', amount: '−$18.50', status: 'Оплачено' });
    // the operations sheet
    const rows = [
      { dir: 'out', title: 'Starbucks', chip: 'Карта', sub: '1 окт., 16:44', amount: '−$18.50', status: 'Оплачено' },
      { dir: 'in', title: 'Пополнение', chip: 'Карта', sub: '1 окт., 16:41', amount: '+$5,000', status: 'Получено' },
      { dir: 'out', title: 'Пополнение карты', chip: 'TRC-20', sub: '1 окт., 16:40 · T9x...4Qp', amount: '−$5,025', status: 'Отправлено' },
    ];
    this.ops = new GlassCard(this.Ll, `<div style="position:absolute;left:0;top:0;width:900px;height:640px">
      <div class="ak-l" style="left:46px;top:46px;font-size:36px;font-weight:700">Операции</div>
      <div style="position:absolute;right:40px;top:30px;width:515px;height:68px">${AK.cardsToday('$5,000', '$18.50')}</div>
      ${rows.map((r, i) => `<div data-k="r${i}" style="position:absolute;left:22px;top:${128 + i * 162}px">${AK.row({ ...r, w: 856 })}</div>
        ${i < 2 ? `<div data-k="s${i}" style="position:absolute;left:150px;right:44px;top:${128 + i * 162 + 156}px;height:2px;background:rgba(19,36,64,0.07)"></div>` : ''}`).join('')}</div>`, { w: 900, h: 640, r: 56, tint: 0.66 });
    this.opsRows = [0, 1, 2].map(i => AK.q(this.ops.body, 'r' + i));
    this.opsSeps = [0, 1].map(i => AK.q(this.ops.body, 's' + i));
    // «Добавить карту» lifted
    this.ladd = new Lift(this.Ll, this.pAdd, `<div style="position:absolute;left:0;top:0">${AK.cardsAdd()}</div>`, { w: 826, h: 470, r: 50, tint: 0.78, solid: 0 });
    this.tap = new TapDot(this.Lx);
    this.h = [
      [HL('Из крипты —\nв ~карту'), 0.25, S(2) - 0.02],
      [HL('Пополни\nиз ~USDT'), S(2) + 0.04, S(4) - 0.02],
      [HL('Плати\nкартой ~INCPT'), S(4) + 0.02, S(6) - 0.02],
      [HL('Все операции —\n~на виду', 100), S(6) + 0.02, S(8) - 0.02],
      [HL('Виртуальные\nи ~металлическая', 100), S(8) + 0.02, 21.3],
    ];
    // sound: only what the picture does (taps, the big moves); the music carries the rest
    cue(2.2, 'whoosh', { dur: 2.0, gain: 0.12, up: true });
    cue(S(2) + 0.62, 'whoosh', { dur: 0.7, gain: 0.16 });
    cue(8.95, 'whoosh', { dur: 0.6, gain: 0.14, up: true });
    cue(10.09, 'tap', { gain: 0.45 });
    cue(13.2, 'whoosh', { dur: 0.6, gain: 0.12, up: true });
    cue(18.82, 'tap', { gain: 0.4 });
  },
  update(t) {
    this.h.forEach(([h, a, b]) => win(h, t, a, b));
    const drop = S(2);
    // ================================================================ A. the hook (0 – 4.36)
    const cin = oQ(prog(t, 0.05, 0.9));
    const toPhone = io(prog(t, 4.95, 5.9));                     // the hero card flies into the phone's slot
    const pulse = Math.sin(Math.PI * prog(t, drop, drop + 0.42)) * 0.03;
    // where the phone's card is (the phone is set below; take last frame's rect only after it is placed)
    let slot = null;
    // ---- the phone (set first so the hero can aim at its card slot)
    const rise = oQ(prog(t, 4.85, 5.95));
    const lifted = prog(t, 8.9, 9.7) * (1 - prog(t, 11.6, 12.4));
    const sheet = oQ(prog(t, 13.12, 13.75)) * (1 - iC(prog(t, 16.85, 17.4)));
    const tileUp = oC(prog(t, 19.0, 19.8));
    const exit = Ease.inCubic(prog(t, 20.9, 21.45));
    const push = io(prog(t, 17.5, 18.6));
    const scroll = lerp(0, 600, io(prog(t, 17.55, 18.55)));
    const ps = lerp(PH.s, 0.66, push) + 0.012 * io(prog(t, 5.9, 8.7)) * (1 - push);
    const py = PH.y + (1 - rise) * 1150 + push * 40 + exit * 900;
    const depth = Math.max(lifted, sheet, tileUp);
    this.ph.set({ x: PH.x, y: py, s: ps, ry: Math.sin(t * 0.5) * 2.2 * rise, rx: (1 - rise) * 10 + Math.sin(t * 0.37) * 1.2,
      o: 1, vis: t > 4.85 && t < 21.46, blur: depth * 5, dim: depth * 0.3, scroll });
    // the hero card
    const showHero = t < 5.92;
    if (showHero) {
      const fl = Math.max(0, t - 0.9);
      let x = HERO.x, y = HERO.y + (1 - cin) * 90, s = 1, rx = (1 - cin) * 16 + Math.sin(fl * 0.8) * 2.4, ry = Math.sin(fl * 0.55) * 4;
      if (toPhone > 0 && t > 4.9) {
        slot = AK.at(this.pCard);
        x = lerp(x, slot.x, toPhone); y = lerp(y, slot.y, toPhone); s = lerp(1, slot.w / 764, toPhone);
        rx *= 1 - toPhone; ry *= 1 - toPhone;
      }
      s *= 1 + pulse;
      this.card.style.display = '';
      this.card.style.transform = `translate(${(x - 382).toFixed(2)}px, ${(y - 242).toFixed(2)}px) perspective(1800px) rotateX(${rx.toFixed(3)}deg) rotateY(${ry.toFixed(3)}deg) scale(${s.toFixed(4)})`;
      this.card.style.opacity = clamp(cin * 1.6).toFixed(3);
      this.card.style.filter = `drop-shadow(0 ${lerp(40, 14, toPhone).toFixed(1)}px ${lerp(46, 20, toPhone).toFixed(1)}px rgba(20,24,60,${lerp(0.26, 0.16, toPhone).toFixed(3)}))${cin < 0.98 ? ` blur(${((1 - cin) * 10).toFixed(2)}px)` : ''}`;
      // light across the card: once as it lands, once on the drop
      const sh = vis(t, 1.0, 2.0) ? prog(t, 1.0, 2.0) : vis(t, drop + 0.05, drop + 0.85) ? prog(t, drop + 0.05, drop + 0.85) : -1;
      this.cardSheen.style.background = sh > 0 && sh < 1 ? `linear-gradient(112deg, transparent ${(sh * 150 - 45).toFixed(1)}%, rgba(255,255,255,0.9) ${(sh * 150 - 25).toFixed(1)}%, transparent ${(sh * 150 - 5).toFixed(1)}%)` : 'none';
      this.cardBal.set('$20,018.50', '$25,018.50', prog(t, drop + 0.04, drop + 0.85));
    } else this.card.style.display = 'none';
    AK.vis(this.pCard, !showHero || t < 4.85);
    // the coin: pops in on beat 2, floats with its amount, then rides the riser into the card
    const cp = oC(prog(t, 2 * BT, 2 * BT + 0.45));
    const fly = io(prog(t, S(1), drop - 0.03));
    const C0 = { x: 280, y: 560 }, C1 = { x: HERO.x + 60, y: HERO.y - 10 };
    if (t > 2 * BT - 0.02 && t < drop + 0.02) {
      const hov = Math.sin((t - 1) * 2.4) * 10 * (1 - fly);
      const cx = lerp(C0.x, C1.x, fly) + Math.sin(Math.PI * fly) * -60, cy = lerp(C0.y, C1.y, fly) - Math.sin(Math.PI * fly) * 170 + hov;
      const cs = lerp(0.6, 1, cp) * lerp(1, 0.3, Ease.inQuart(fly)) * (1 - prog(t, drop - 0.16, drop - 0.02) * 0.7);
      this.coin.style.display = '';
      this.coin.style.transform = `translate(${cx.toFixed(2)}px, ${cy.toFixed(2)}px) perspective(900px) rotateY(${(Math.sin(t * 1.7) * 22 + fly * 40).toFixed(2)}deg) rotateZ(${(-8 + fly * 30).toFixed(2)}deg) scale(${cs.toFixed(4)})`;
      this.coin.style.opacity = clamp(cp * 2.5).toFixed(3);
      const chipO = oC(prog(t, 2.5 * BT, 2.5 * BT + 0.4)) * (1 - prog(t, S(1) + 0.2, S(1) + 0.7));
      this.coinChip.set({ x: cx + 10, y: cy + 168 * lerp(0.6, 1, cp), o: chipO, s: 0.9 + 0.1 * chipO });
    } else { this.coin.style.display = 'none'; this.coinChip.set({ o: 0 }); }
    // the drop: a ripple through the card and +$5,000 above it
    this.ripple.forEach((r, i) => {
      const p = prog(t, drop + i * 0.12, drop + 0.9 + i * 0.12);
      if (p <= 0 || p >= 1) { r.style.display = 'none'; return; }
      r.style.display = '';
      r.style.transform = `translate(${(C1.x).toFixed(2)}px, ${(C1.y).toFixed(2)}px) scale(${lerp(0.2, 3.6, oC(p)).toFixed(4)})`;
      r.style.opacity = ((1 - p) * 0.9).toFixed(3);
    });
    const pl = oQ(prog(t, drop + 0.1, drop + 0.6)), plOut = iC(prog(t, 4.75, 5.15));
    this.plus.set({ x: HERO.x, y: HERO.y - 330 - pl * 20 - plOut * 40, o: clamp(pl * 2) * (1 - plOut), s: lerp(0.85, 1, pl) });

    // ================================================================ B. in the app: the two operations (4.36 – 8.73)
    const tIn = (a) => oQ(prog(t, a, a + 0.5));
    const tOut = (b) => iC(prog(t, b, b + 0.35));
    const t1 = tIn(6.0), t2 = tIn(S(3) - 0.04), to12 = tOut(8.25);
    this.t1.set({ x: 540, y: 600 + (1 - t1) * -60 + t2 * 0 - to12 * 60, o: clamp(t1 * 2) * (1 - to12), s: lerp(0.94, 0.92, t2), blur: (1 - t1) * 6 });
    this.t2.set({ x: 540, y: 600 + 182 * t2 + (1 - t2) * -30 - to12 * 60, o: clamp(t2 * 2) * (1 - to12), s: 0.92, blur: (1 - t2) * 6 });
    // today's line on the phone: in $0 -> $5,000 when the card receives it (the hook already showed the balance)
    AK.flip(this.pTin, '$0', '$5,000', prog(t, S(3), S(3) + 0.4));

    // ================================================================ C. pay with the card (8.73 – 13.09)
    const kL = io(prog(t, 8.9, 9.7)) * (1 - io(prog(t, 11.6, 12.4)));
    const payT = 10.09, pay = Math.sin(Math.PI * prog(t, payT - 0.28, payT + 0.42));
    const fl2 = Math.max(0, t - 9.7);
    this.lcard.at(kL, { x: 540, y: 1000 - pay * 20, s: 764 / 826 * (1 - pay * 0.05), rx: 8 + pay * 22 + Math.sin(fl2 * 0.9) * 2, ry: Math.sin(fl2 * 0.6) * 3, arc: 60 }, { hide: true });
    if (kL > 0) this.lcardBal.set('$25,018.50', '$25,000.00', prog(t, 10.4, 11.15), { down: true });
    this.nfc.forEach((r, i) => {
      const p = prog(t, payT + i * 0.14, payT + 0.95 + i * 0.14);
      if (p <= 0 || p >= 1) { r.style.display = 'none'; return; }
      r.style.display = '';
      r.style.transform = `translate(540px, ${(1000).toFixed(2)}px) scale(${lerp(0.5, 3.2, oC(p)).toFixed(4)})`;
      r.style.opacity = ((1 - p) * 0.85).toFixed(3);
    });
    const t3 = tIn(payT + 0.06), t3o = tOut(12.3);
    this.t3.set({ x: 540, y: 520 - (1 - t3) * 60 - t3o * 60, o: clamp(t3 * 2) * (1 - t3o), s: 0.92, blur: (1 - t3) * 6 });
    // the phone catches up when the card is back: balance and today's out
    const back = prog(t, 12.25, 12.95);
    this.pCardBal.set('$25,018.50', '$25,000.00', t < 11.0 ? 0 : 1, { down: true });
    this.pBalO.set('$25,018.50', '$25,000.00', back, { down: true });
    AK.flip(this.pTout, '$0', '$18.50', prog(t, 12.45, 12.85));

    // ================================================================ D. the operations (13.09 – 17.45)
    this.ops.set({ x: 540, y: lerp(1260, 1060, sheet), o: clamp(sheet * 2.5), s: lerp(0.92, 0.98, sheet), blur: (1 - clamp(sheet * 2)) * 4 });
    this.opsRows.forEach((r, i) => { const a = oQ(prog(t, S(6) + 0.2 + i * BT, S(6) + 0.7 + i * BT)); r.style.opacity = a.toFixed(3); r.style.transform = `translateY(${((1 - a) * 26).toFixed(2)}px)`; });
    this.opsSeps.forEach((r, i) => { r.style.opacity = clamp((t - (S(6) + 0.45 + (i + 1) * BT)) * 3).toFixed(3); });

    // ================================================================ E. add a card (17.45 – 21.82)
    const tapT = 18.82;
    this.tap.at(t, tapT, t > tapT - 0.4 && t < tapT + 0.7 ? AK.at(this.pAdd) : null);
    const kA = io(prog(t, 19.0, 19.85)), aOut = Ease.inCubic(prog(t, 20.9, 21.4));
    this.ladd.at(kA, { x: 540, y: 1040 - aOut * 160, s: 1.1 - aOut * 0.06, arc: 40 }, { glass: kA, o: 1 - aOut, hide: true });
  },
});

endCard(21.5, 'Криптокошелёк и карты в Telegram', DURATION, 0.5);
