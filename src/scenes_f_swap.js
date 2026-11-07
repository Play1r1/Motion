// «Обмен внутри кошелька» (v4) — Instagram, 9:16, 25.4 s, on one uncut stretch of its own 120 BPM track
// (assets/music/f_swap_edit.json: the groove from the first frame, the fill in bar 4, the brighter section from
// 8 s, the breakdown under the end card and the track's own stop at 24 s with its tail).
// The app's «Обмен» screen, used for real: USDT -> BTC, 1,000 typed in; the rate is the app's own BTC price
// ($83,992.01 on «Кошелек») so you get ≈ 0.0119 BTC (≈ $999.50); the network fee ≈ $5.23 and «Комиссия
// обмена — в курсе» are the app's lines; «Обменять» -> the BTC balance 0.5 -> 0.5119.
//   0.0  hook: the two coins and the glass ⇅ between them; they trade places on the beats
//   4.0  the phone rises; the coins and the ⇅ land in their places on the screen
//   8.0  «Отдаёте» lifts; 1,000 is typed on the beat; «Получаете» follows with ≈ 0.0119 BTC
//  12.0  the fee lines lift: the rate, the network fee, «в курсе», what you get
//  16.0  «Обменять»: a tap, a check, the BTC balance grows
//  20.6  the lock-up over the breakdown; the track stops at 24.0 and rings out
'use strict';

const BT = 60 / 120.014, BAR = 4 * BT;
const S = n => n * BAR;
DURATION = 25.4;
META = { drop: S(4), end: 20.6, bpm: 120, musicEdit: 'assets/music/f_swap_edit.json', sfxGain: 0.4, sfxOnly: ['whoosh', 'tap'] };
const oC = Ease.outCubic, iC = Ease.inCubic, oQ = Ease.outQuint, io = Ease.inOutCubic;
drawBg = t => { LG.reset(); LG.F.white = 1; LG.draw(t); };

const SHOW = { stagger: 0.06, dur: 0.55, dy: 0.3, blur: 8, outDur: 0.2, outStagger: 0.02, outDy: -0.18 };
const HL = (text, size = 104) => { const w = new WText(text, { y: 150, size, fit: 960, track: -0.02 }); w.el.style.zIndex = 10; return w; };
function win(txt, t, tin, tend) {
  if (t >= tend || t < tin - 0.01) { txt.el.style.display = 'none'; return; }
  txt.at(t, tin, tend - 0.22, SHOW);
}
const PH = { x: 540, y: 1113, s: 0.62 };
const HC = { y: 960, dx: 260, d: 230, arc: 250 };            // the hook: coins either side of the ⇅

scene({
  init() {
    LG.init();
    this.Lp = AK.layer(1, 2400);
    this.Lh = AK.layer(3);
    this.Ll = AK.layer(4);
    this.Lg = AK.layer(5);
    this.Lx = AK.layer(8);
    this.ph = new AppPhone(this.Lp, { hdr: 'back', h: 2240 });
    AK.swapScreen(this.ph.content);
    const C = this.ph.content, q = k => AK.q(C, k);
    this.p = { give: q('give'), get: q('get'), flip: q('flip'), flipi: q('flipi'), fees: q('fees'), btn: q('btn'), btnon: q('btnon'), btnl: q('btnl') };
    this.pIc = [AK.q(this.p.give, 'ic'), AK.q(this.p.get, 'ic')];
    this.pGiveAmt = AK.q(this.p.give, 'amt'); this.pGiveUsd = AK.q(this.p.give, 'usd');
    this.pGetAmt = AK.q(this.p.get, 'amt'); this.pGetUsd = AK.q(this.p.get, 'usd'); this.pBal = AK.q(this.p.get, 'bal');
    this.pRate = AK.q(this.p.fees, 'rate'); this.pRecv = AK.q(this.p.fees, 'recv');
    // the hook: two coins (vector) and the ⇅ in glass between them
    this.coins = ['usdt', 'btc'].map(k => AK.el(this.Lh, `<div style="position:absolute;left:0;top:0;width:${HC.d}px;height:${HC.d}px;margin:-${HC.d / 2}px 0 0 -${HC.d / 2}px">${AK.coin(k, HC.d)}</div>`));
    this.disc = new GlassCard(this.Lg, `<div class="ak-pill" style="inset:0"><div data-k="di">${AK.ico('swap', AK.blue, 66, 2.2)}</div></div>`, { w: 150, h: 150, r: 75, tint: 0.55 });
    this.discI = AK.q(this.disc.body, 'di');
    // lifts
    this.lGive = new Lift(this.Ll, this.p.give, AK.swapGive(), { w: 836, h: 338, r: 56, tint: 0.7, solid: 0.92 });
    this.lGet = new Lift(this.Ll, this.p.get, AK.swapGet(), { w: 836, h: 320, r: 56, tint: 0.7, solid: 0.92 });
    this.lFees = new Lift(this.Ll, this.p.fees, AK.swapFees(), { w: 836, h: 430, r: 56, tint: 0.72, solid: 0.92 });
    this.l = { giveAmt: AK.q(this.lGive.body, 'amt'), giveUsd: AK.q(this.lGive.body, 'usd'), getAmt: AK.q(this.lGet.body, 'amt'), getUsd: AK.q(this.lGet.body, 'usd'),
      bal: AK.q(this.lGet.body, 'bal'), rate: AK.q(this.lFees.body, 'rate'), recv: AK.q(this.lFees.body, 'recv'), incl: AK.q(this.lFees.body, 'incl') };
    this.gain = new GlassCard(this.Ll, `<div class="ak-pill" style="inset:0;font-size:44px;font-weight:700;color:${AK.green}">+0.0119 BTC</div>`, { w: 360, h: 100, r: 50, tint: 0.75 });
    this.tap = new TapDot(this.Lx);
    this.h = [
      [HL('Обмен\n~внутри кошелька'), 0.15, S(2) - 0.02],
      [HL('Отдаёте USDT —\nполучаете ~BTC', 100), S(2) + 0.04, S(4) - 0.02],
      [HL('Впиши\n~сумму'), S(4) + 0.02, S(6) - 0.02],
      [HL('Комиссия обмена —\n~уже в курсе', 96), S(6) + 0.02, S(8) - 0.02],
      [HL('Один тап —\n~и готово'), S(8) + 0.02, 20.4],
    ];
    cue(BT * 2 - 0.05, 'whoosh', { dur: 0.45, gain: 0.12 });
    cue(BT * 6 - 0.05, 'whoosh', { dur: 0.45, gain: 0.12 });
    cue(S(2) + 0.2, 'whoosh', { dur: 0.8, gain: 0.14, up: true });
    cue(7.0, 'tap', { gain: 0.38 });
    cue(S(8) + 2 * BT, 'tap', { gain: 0.45 });
  },
  update(t) {
    this.h.forEach(([h, a, b]) => win(h, t, a, b));
    // ================================================================ the phone
    const rise = oQ(prog(t, S(2) + 0.1, S(2) + 1.1));
    const exit = Ease.inCubic(prog(t, 20.05, 20.6));
    const kG = io(prog(t, S(4), S(4) + 0.55)) * (1 - io(prog(t, S(6) - 0.5, S(6))));
    const kR = io(prog(t, S(5), S(5) + 0.55)) * (1 - io(prog(t, S(6) - 0.5, S(6))));
    const kF = io(prog(t, S(6) + 0.05, S(6) + 0.6)) * (1 - io(prog(t, S(8) - 0.5, S(8))));
    const kB = io(prog(t, 18.9, 19.45)) * (1 - io(prog(t, 19.95, 20.4)));
    const lifted = Math.max(kG, kR, kF, kB);
    const scroll = kf(t, [[S(8) + 0.05, 0], [S(8) + 0.75, 298, io], [17.9, 298], [18.6, 0, io]]);
    // a slow push towards «Отдаёте» while the amount is waited for; back out for the button
    const ps = kf(t, [[S(2) + 1.4, PH.s], [S(4) - 0.1, 0.68, io], [S(8) - 0.2, 0.68], [S(8) + 0.6, PH.s, io]]);
    const pyy = kf(t, [[S(2) + 1.4, PH.y], [S(4) - 0.1, 1190, io], [S(8) - 0.2, 1190], [S(8) + 0.6, PH.y, io]]);
    this.ph.set({ x: PH.x, y: pyy + (1 - rise) * 1150 + exit * 1000, s: ps, ry: Math.sin(t * 0.5) * 2 * rise, rx: (1 - rise) * 10 + Math.sin(t * 0.37) * 1.2,
      vis: t > S(2) + 0.1 && t < 20.61, blur: lifted * 7, dim: lifted * 0.45, scroll });

    // ================================================================ A. the hook: the coins trade places on beats 2 and 6
    const sw1 = io(prog(t, 2 * BT - 0.06, 2 * BT + 0.42)), sw2 = io(prog(t, 6 * BT - 0.06, 6 * BT + 0.42));
    const side = sw1 - sw2;                                  // 0: USDT left, 1: USDT right
    const dock = io(prog(t, S(2) + 0.45, S(2) + 1.35));
    const cin = oQ(prog(t, 0.0, 0.6));
    ['usdt', 'btc'].forEach((k, i) => {
      const el = this.coins[i];
      if (t > S(2) + 1.36) { el.style.display = 'none'; return; }
      const pos = i === 0 ? side : 1 - side;                 // 0 = left, 1 = right
      const arcSign = i === 0 ? -1 : 1;                      // USDT passes over the top, BTC underneath
      const phase = Math.sin(Math.PI * (i === 0 ? (sw1 > 0 && sw1 < 1 ? sw1 : sw2 > 0 && sw2 < 1 ? sw2 : 0) : (sw1 > 0 && sw1 < 1 ? sw1 : sw2 > 0 && sw2 < 1 ? sw2 : 0)));
      let x = 540 + lerp(-HC.dx, HC.dx, pos), y = HC.y + arcSign * phase * HC.arc + Math.sin(t * 2.1 + i * 2) * 8, s = (1 + arcSign * -phase * 0.08) * lerp(0.7, 1, cin);
      if (dock > 0) { const a = AK.at(this.pIc[i]); x = lerp(x, a.x, dock); y = lerp(y, a.y, dock); s = lerp(s, a.w / HC.d, dock); }
      el.style.display = '';
      el.style.zIndex = arcSign * phase > 0 ? 1 : 2;
      el.style.transform = `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px) perspective(900px) rotateY(${(Math.sin(t * 1.3 + i) * 14 * (1 - dock)).toFixed(2)}deg) scale(${s.toFixed(4)})`;
      el.style.opacity = clamp(cin * 2).toFixed(3);
      el.style.filter = `drop-shadow(0 ${(20 * (1 - dock)).toFixed(1)}px ${(26 * (1 - dock) + 2).toFixed(1)}px rgba(16,24,52,${(0.24 * (1 - dock)).toFixed(3)}))`;
    });
    this.pIc.forEach(e => AK.vis(e, t > S(2) + 1.36));
    // the ⇅: spins half a turn with each trade, then lands on the screen's own ⇅
    const spin = (sw1 + sw2) * 180 + io(prog(t, S(2) + 0.45, S(2) + 1.35)) * 180;
    if (t < S(2) + 1.36) {
      let x = 540, y = HC.y, s = lerp(0.6, 1, oQ(prog(t, 0.15, 0.7)));
      if (dock > 0) { const a = AK.at(this.p.flip); x = lerp(x, a.x, dock); y = lerp(y, a.y, dock); s = lerp(s, a.w / 150, dock); }
      this.disc.set({ x, y, s, o: clamp(prog(t, 0.15, 0.4) * 1.0) });
      this.discI.style.transform = `rotate(${spin.toFixed(2)}deg)`;
    } else this.disc.set({ o: 0 });
    AK.vis(this.p.flip, t > S(2) + 1.36);
    // the fill: a tap on the amount, the caret
    this.tap.at(t, 7.0, t > 6.6 && t < 7.7 ? AK.at(this.pGiveAmt) : t > S(8) + 2 * BT - 0.4 && t < S(8) + 2 * BT + 0.7 ? AK.at(this.p.btn) : null);
    if (t > S(8) + 1) this.tap.at(t, S(8) + 2 * BT, t > S(8) + 2 * BT - 0.4 && t < S(8) + 2 * BT + 0.7 ? AK.at(this.p.btn) : null);

    const fl = Math.sin(t * 1.1) * 6, flr = Math.sin(t * 0.8) * 1.5;
    // ================================================================ C. type the amount (8.0 – 12.0)
    const keys = [S(4) + 1.5 * BT, S(4) + 2 * BT, S(4) + 2.5 * BT, S(4) + 3 * BT];
    const typed = ['1', '10', '100', '1,000'];
    let n = 0; keys.forEach(k => { if (t >= k) n++; });
    const caret = t > 7.05 && t < S(5) + 0.3 && (Math.floor((t - 7.05) / 0.5) % 2 === 0 || (n > 0 && t - keys[n - 1] < 0.5));
    const amt = n ? typed[n - 1] : '0';
    const amtHtml = amt + (caret ? '<span class="ak-caret"></span>' : '');
    for (const e of [this.pGiveAmt, this.l.giveAmt]) { e.innerHTML = amtHtml; e.style.color = n || t > 7.05 ? AK.ink : ''; }
    const usd = n ? [1, 10, 100, 1000][n - 1] : 0;
    for (const e of [this.pGiveUsd, this.l.giveUsd]) e.textContent = '≈ ' + AK.usd(usd);
    // a key press nudges the number
    if (n && t - keys[n - 1] < 0.18) this.l.giveAmt.style.transform = `translateY(${(Math.sin(Math.PI * (t - keys[n - 1]) / 0.18) * -6).toFixed(2)}px)`; else this.l.giveAmt.style.transform = '';
    this.lGive.at(kG, { x: 540, y: (kR > 0 ? lerp(1000, 820, kR) : 1000) + fl, s: 1.08, rx: flr, arc: 30 }, { glass: kG });
    // what you get rolls in when the panel arrives
    const gp = oC(prog(t, S(5) + 0.35, S(5) + 1.15));
    const btc = 0.0119 * gp;
    const getS = gp > 0 ? btc.toFixed(4) : '0';
    for (const e of [this.pGetAmt, this.l.getAmt]) { e.textContent = getS; e.style.color = gp > 0 ? AK.ink : ''; }
    for (const e of [this.pGetUsd, this.l.getUsd]) e.textContent = '≈ ' + AK.usd(999.5 * gp);

    // ================================================================ D. the fee lines (12.0 – 16.0)
    const rv = t > S(6) + 0.7 ? '1 BTC ≈ 83,992.01 USDT' : '—', rc = t > S(6) + 0.7 + BT ? '≈ 0.0119 BTC' : '—';
    for (const e of [this.pRate, this.l.rate]) e.textContent = rv;
    for (const e of [this.pRecv, this.l.recv]) e.textContent = rc;
    for (const e of [this.l.rate, this.l.recv]) { const tt = e === this.l.rate ? S(6) + 0.7 : S(6) + 0.7 + BT, a = oC(prog(t, tt, tt + 0.35)); e.style.opacity = t < tt ? '' : a.toFixed(3); e.style.display = 'inline-block'; e.style.transform = t < tt ? '' : `translateY(${((1 - a) * 14).toFixed(2)}px)`; }
    const hl = prog(t, S(6) + 0.7 + 2 * BT, S(6) + 1.7 + 2 * BT);
    this.l.incl.style.backgroundImage = hl > 0 && hl < 1 ? `linear-gradient(105deg, transparent ${(hl * 160 - 50).toFixed(1)}%, rgba(255,255,255,0.95) ${(hl * 160 - 30).toFixed(1)}%, transparent ${(hl * 160 - 10).toFixed(1)}%)` : '';
    this.l.incl.style.transform = `scale(${(1 + Math.sin(Math.PI * hl) * 0.08).toFixed(4)})`;
    this.lFees.at(kF, { x: 540, y: 1020 + fl, s: 1.1, rx: flr, arc: 30 }, { glass: kF });

    // ================================================================ E. Обменять (16.0 – 20.0)
    this.p.btnon.style.opacity = oC(prog(t, S(5) + 1.2, S(5) + 1.6)).toFixed(3);
    const tapB = S(8) + 2 * BT;
    this.p.btn.style.transform = `scale(${(1 - Math.sin(Math.PI * prog(t, tapB - 0.04, tapB + 0.22)) * 0.03).toFixed(4)})`;
    const ok = oC(prog(t, tapB + 0.12, tapB + 0.45));
    this.p.btnl.innerHTML = ok > 0 ? `<span style="display:inline-block;transform:scale(${lerp(0.5, 1, ok).toFixed(3)});opacity:${ok.toFixed(3)}">${AK.ico('check', '#fff', 56, 2.6)}</span>` : 'Обменять';
    const bp = prog(t, 18.75, 19.15);
    for (const e of [this.pBal, this.l.bal]) { AK.flip(e, 'Баланс: 0.5 BTC', 'Баланс: 0.5119 BTC', bp); e.style.color = bp > 0 ? AK.green : ''; }
    const gIn = oQ(prog(t, 19.15, 19.6)) * (1 - io(prog(t, 19.95, 20.35)));
    this.gain.set({ x: 540, y: 790 + fl - (1 - gIn) * 30, o: clamp(gIn * 2), s: lerp(0.85, 1, gIn) });
    this.lGet.at(Math.max(kR, kB), { x: 540, y: (kB > 0 ? 1010 : 1250) + fl, s: kB > 0 ? 1.15 : 1.08, rx: flr, arc: 30 }, { glass: Math.max(kR, kB) });
  },
});

endCard(20.6, 'Криптокошелёк и обмен в Telegram', DURATION, 0.5);
