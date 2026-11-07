// «Пусть USDT работает» (v4) — Instagram, 9:16, 31 s, on its own warm 92 BPM track (assets/music/f_stake_edit.json:
// the intro and the build uncut, the drop at 5.22 s, eight bars of the groove, then one cut on a phrase boundary
// into the track's own outro, which carries the end card).
// The story is the app's own screen and numbers. The hook is the top of «Стейкинг» at the app's own size (the safe
// at its pixels, the total, the forecast): four USDT coins land in the safe on the four beats of the build, the
// total rolls to $20,000.00, and on the drop the forecast rolls to $14.42 — then the camera pulls back and it is
// the phone. Then how: Liquid Vault 20–40% APY and its three vaults; the amount (Макс -> $20,000, a year
// ≈ $5,263.30 = $14.42 x 365); «Открыть стейкинг»; the deposit is active with ≈ $14.42 today; the result.
'use strict';

const BT = 60 / 92.012, BAR = 4 * BT;
const S = n => n * BAR;
DURATION = 31.0;
META = { drop: S(2), end: 25.8, bpm: 92, musicEdit: 'assets/music/f_stake_edit.json', sfxGain: 0.4, sfxOnly: ['whoosh', 'tap'] };
const oC = Ease.outCubic, iC = Ease.inCubic, oQ = Ease.outQuint, io = Ease.inOutCubic;
drawBg = t => { LG.reset(); LG.F.white = 1; LG.draw(t); };

const SHOW = { stagger: 0.07, dur: 0.6, dy: 0.3, blur: 8, outDur: 0.22, outStagger: 0.02, outDy: -0.18 };
const HL = (text, size = 104) => { const w = new WText(text, { y: 150, size, fit: 960, track: -0.02 }); w.el.style.zIndex = 10; return w; };
function win(txt, t, tin, tend) {
  if (t >= tend || t < tin - 0.01) { txt.el.style.display = 'none'; return; }
  txt.at(t, tin, tend - 0.24, SHOW);
}
const PH = { x: 540, y: 1113, s: 0.62 };
// the hook: the phone at its own size with only the top of the screen showing; the safe's centre lands at (540, 700)
const HOOK = { x: 540 - (43 + 463 - 503), y: 700 + 1037 - (37 + 560), s: 1 };
const SAFE = { x: 540, y: 700 };
const usd0 = v => AK.usd(v);

scene({
  init() {
    LG.init();
    this.Lp = AK.layer(1, 2400);
    this.Lh = AK.layer(3);
    this.Ll = AK.layer(4);
    this.Lx = AK.layer(8);
    this.ph = new AppPhone(this.Lp, { hdr: 'close', bar: 'stake', h: 2700 });
    AK.stakeScreen(this.ph.content, { total: '$0.00', fc: '$0.00' });
    const C = this.ph.content, q = k => AK.q(C, k);
    this.p = { title: q('title'), safe: q('safe'), top: q('top'), card: q('card'), apy: q('apy'), mid: q('mid'), btn: q('btn'), btnon: q('btnon'),
      tabs: q('tabs'), dephead: q('dephead'), dep: q('dep'), terms: q('terms') };
    this.totalEl = AK.q(this.p.top, 'total');
    this.fcTop = AK.q(this.p.top, 'fc');
    this.fcDep = AK.q(this.p.dep, 'fc');
    // the coins of the build
    this.coins = [0, 1, 2, 3].map(() => AK.el(this.Lh, `<div style="position:absolute;left:0;top:0;width:170px;height:170px;margin:-85px 0 0 -85px;filter:drop-shadow(0 16px 20px rgba(16,24,52,0.24))">${AK.coin('usdt', 170)}</div>`));
    this.rip = [0, 1, 2, 3].map(() => AK.el(this.Lh, '<div style="position:absolute;left:0;top:0;width:200px;height:200px;margin:-100px 0 0 -100px;border-radius:50%;border:3px solid rgba(255,255,255,0.95);box-shadow:0 2px 14px -4px rgba(19,36,64,0.22)"></div>'));
    // lifts
    this.lApy = new Lift(this.Ll, this.p.apy, `<div class="ak-pill" style="inset:0;font-size:27px;font-weight:600;color:${AK.green}">20–40% APY</div>`, { w: 200, h: 46, r: 23, tint: 0.9, solid: 0 });
    this.lTabs = new Lift(this.Ll, this.p.tabs, `<div style="position:absolute;left:0;top:0">${AK.stakeTabs()}</div>`, { w: 754, h: 150, r: 36, tint: 0.72, solid: 0.9 });
    this.lMid = new Lift(this.Ll, this.p.mid, `<div style="position:absolute;left:0;top:0">${AK.stakeMid()}</div>`, { w: 754, h: 492, r: 44, tint: 0.7, solid: 0 });
    this.lAmt = AK.q(this.lMid.body, 'amt'); this.lYv = AK.q(this.lMid.body, 'yv'); this.lMax = AK.q(this.lMid.body, 'chip3');
    this.pAmt = AK.q(this.p.mid, 'amt'); this.pYv = AK.q(this.p.mid, 'yv');
    this.lDep = new Lift(this.Ll, this.p.dep, `<div style="position:absolute;left:0;top:0">${AK.stakeDeposit('≈ $0.00')}</div>`, { w: 826, h: 236, r: 44, tint: 0.72, solid: 0.92 });
    this.lDepFc = AK.q(this.lDep.body, 'fc');
    this.lTop = new Lift(this.Ll, this.p.top, `<div style="position:absolute;left:0;top:0">${AK.stakeTop('$20,000.00', '$14.42')}</div>`, { w: 920, h: 250, r: 60, tint: 0.62, solid: 0 });
    this.tap = new TapDot(this.Lx);
    this.h = [
      [HL('Пусть ~USDT\nработает'), 0.3, S(2) - 0.02],
      [HL('Liquid Vault —\n~20–40% APY', 100), S(2) + 0.25, S(4) - 0.02],
      [HL('Впиши\n~сумму'), S(4) + 0.12, S(6) - 0.02],
      [HL('Один тап —\n~депозит открыт', 100), S(6) + 0.12, S(8) - 0.02],
      [HL('Доход\n~каждый день'), S(8) + 0.12, 25.6],
    ];
    cue(S(2) + 0.05, 'whoosh', { dur: 1.1, gain: 0.14 });
    cue(S(3) + 0.05, 'whoosh', { dur: 0.6, gain: 0.1, up: true });
    cue(S(4) + 0.12, 'whoosh', { dur: 0.6, gain: 0.1, up: true });
    cue(S(4) + 2 * BT, 'tap', { gain: 0.42 });
    cue(S(6) + 2 * BT, 'tap', { gain: 0.42 });
    cue(S(8) + 0.9, 'whoosh', { dur: 0.7, gain: 0.1 });
  },
  update(t) {
    this.h.forEach(([h, a, b]) => win(h, t, a, b));
    const drop = S(2);
    // ================================================================ the phone: the hook at 1:1, then the pull-back
    const enter = oQ(prog(t, 0.05, 0.95));
    const pull = io(prog(t, drop + 0.08, drop + 1.25));
    const chromeO = oC(prog(t, drop - 0.02, drop + 0.4));
    const exit = Ease.inCubic(prog(t, 25.2, 25.75));
    // scroll stations: the card (B, C, D), the deposits (D), back to the top (E)
    const scroll = kf(t, [[drop + 1.2, 0], [drop + 2.2, 640, io], [S(6) + 2 * BT + 0.3, 640], [S(6) + 2 * BT + 1.15, 1460, io], [S(8) + 0.5, 1460], [S(8) + 1.5, 0, io]]);
    const lifts = Math.max(prog(t, S(3), S(3) + 0.6) * (1 - prog(t, S(4) - 0.6, S(4) - 0.05)), prog(t, S(4) + 0.1, S(4) + 0.7) * (1 - prog(t, S(6) - 0.55, S(6))),
      prog(t, S(7), S(7) + 0.6) * (1 - prog(t, S(8) + 0.2, S(8) + 0.8)), prog(t, 22.6, 23.3));
    const x = lerp(HOOK.x, PH.x, pull), y = lerp(HOOK.y, PH.y, pull) + (1 - enter) * 60 + exit * 1000, s = lerp(HOOK.s, PH.s, pull);
    this.ph.chrome(chromeO);
    this.ph.set({ x, y, s, ry: Math.sin(t * 0.5) * 2 * pull, rx: Math.sin(t * 0.37) * 1.2 * pull, o: 1, blur: lifts * 7 + (1 - enter) * 10, dim: lifts * 0.45, scroll, vis: t < 25.76 });
    // only the top of the screen shows in the hook: the rest of it arrives with the phone
    for (const k of ['title', 'card', 'dephead', 'dep', 'terms']) AK.op(this.p[k], k === 'dep' ? 0 : chromeO);
    AK.op(this.p.safe, clamp(enter * 1.5));
    AK.op(this.p.top, clamp((t - 0.7) * 2.5));
    // the build: a coin lands on each beat; the total rolls by $5,000 each time
    const land = [1, 2, 3, 4].map(k => S(1) + k * BT - 0.02);
    land[3] = drop - 0.01;
    const from = [[-120, 520], [1200, 860], [-120, 1180], [1200, 420]];
    this.coins.forEach((c, i) => {
      const t1 = land[i], t0 = t1 - 0.78, p = prog(t, t0, t1);
      if (p <= 0 || p >= 1) { c.style.display = 'none'; return; }
      const e = Ease.inOutSine(p), [fx, fy] = from[i];
      const cx = lerp(fx, SAFE.x, e), cy = lerp(fy, SAFE.y, e) - Math.sin(Math.PI * e) * 160;
      const sc = lerp(1, 0.25, Ease.inQuart(p));
      c.style.display = '';
      c.style.transform = `translate(${cx.toFixed(2)}px, ${cy.toFixed(2)}px) perspective(900px) rotateY(${(Math.sin(t * 2 + i) * 25).toFixed(2)}deg) rotateZ(${((i % 2 ? -1 : 1) * 20 * e).toFixed(2)}deg) scale(${sc.toFixed(4)})`;
      c.style.opacity = clamp(p * 6).toFixed(3);
    });
    let tv = 0;
    land.forEach((t1, i) => { if (t >= t1) tv = lerp(i * 5000, (i + 1) * 5000, oC(prog(t, t1, t1 + 0.4))); });
    this.totalEl.textContent = AK.usd(tv);
    this.rip.forEach((r, i) => {
      const p = prog(t, land[i], land[i] + 0.8);
      if (p <= 0 || p >= 1) { r.style.display = 'none'; return; }
      r.style.display = '';
      r.style.transform = `translate(${SAFE.x}px, ${SAFE.y}px) scale(${lerp(0.6, 2.6, oC(p)).toFixed(4)})`;
      r.style.opacity = ((1 - p) * 0.8).toFixed(3);
    });
    // the safe takes each coin: a small press
    const bump = land.reduce((a, t1) => a + Math.sin(Math.PI * prog(t, t1, t1 + 0.28)) * 0.035, 0);
    this.p.safe.style.transform = `scale(${(1 - bump).toFixed(4)})`;
    // on the drop the forecast rolls
    const fp = oC(prog(t, drop + 0.05, drop + 0.75));
    this.fcTop.textContent = AK.usd(14.42 * fp);

    // ================================================================ B. Liquid Vault and its vaults (5.22 – 10.43)
    const kT = io(prog(t, S(3), S(3) + 0.6)) * (1 - io(prog(t, S(4) - 0.6, S(4) - 0.05)));
    this.lTabs.at(kT, { x: 540, y: 1110, s: 1.22, arc: 30 }, { glass: kT });
    const kA = io(prog(t, S(3) + 2 * BT, S(3) + 2 * BT + 0.55)) * (1 - io(prog(t, S(4) - 0.6, S(4) - 0.05)));
    this.lApy.at(kA, { x: 540, y: 880, s: 2.3, arc: 20 }, { glass: kA });

    // ================================================================ C. the amount (10.43 – 15.65)
    const kM = io(prog(t, S(4) + 0.1, S(4) + 0.7)) * (1 - io(prog(t, S(6) - 0.55, S(6))));
    this.lMid.at(kM, { x: 540, y: 1060, s: 1.17, arc: 30 }, { glass: kM });
    const tapMax = S(4) + 2 * BT;
    const ap = oC(prog(t, tapMax + 0.05, tapMax + 0.75));
    const amtS = t < tapMax + 0.05 ? '$0' : '$' + Math.round(20000 * ap).toLocaleString('en-US');
    const yS = '≈ ' + AK.usd(5263.3 * oC(prog(t, tapMax + 0.5, tapMax + 1.3)));
    for (const e of [this.lAmt, this.pAmt]) e.textContent = amtS;
    for (const e of [this.lYv, this.pYv]) e.textContent = yS;
    this.lMax.style.background = t > tapMax - 0.02 && t < tapMax + 0.5 ? 'rgba(19,36,64,0.12)' : '';

    // ================================================================ D. open it (15.65 – 20.87)
    const on = oC(prog(t, S(6) + 0.1, S(6) + 0.5));
    this.p.btnon.style.opacity = on.toFixed(3);
    const tapBtn = S(6) + 2 * BT;
    this.tap.at(t, t < tapMax + 1 ? tapMax : tapBtn, t > tapMax + 1 && t > tapBtn - 0.4 && t < tapBtn + 0.7 ? AK.at(this.p.btn) : t < tapMax + 1 && t > tapMax - 0.4 ? AK.at(this.lMax) : null);
    this.p.btn.style.transform = `scale(${(1 - Math.sin(Math.PI * prog(t, tapBtn - 0.04, tapBtn + 0.22)) * 0.03).toFixed(4)})`;
    // the deposit appears in «Ваши депозиты» as the screen gets there, then lifts with today's forecast
    const dIn = oQ(prog(t, tapBtn + 0.75, tapBtn + 1.3));
    AK.op(this.p.dep, dIn);
    this.p.dep.style.transform = `translateY(${((1 - dIn) * 40).toFixed(2)}px)`;
    const kD = io(prog(t, S(7), S(7) + 0.6)) * (1 - io(prog(t, S(8) + 0.2, S(8) + 0.8)));
    this.lDep.at(kD, { x: 540, y: 1000, s: 1.12, arc: 30 }, { glass: kD });
    const dfc = '≈ ' + AK.usd(14.42 * oC(prog(t, S(7) + 0.5, S(7) + 1.3)));
    this.lDepFc.textContent = dfc; this.fcDep.textContent = t > S(7) + 1.3 ? '≈ $14.42' : dfc;

    // ================================================================ E. the result (20.87 – 25.8)
    const kR = io(prog(t, 22.6, 23.35)), rOut = Ease.inCubic(prog(t, 25.15, 25.65));
    this.lTop.at(kR, { x: 540, y: 1030 - rOut * 140, s: 1.06, arc: 30 }, { glass: kR, o: 1 - rOut });
  },
});

endCard(25.8, 'Криптокошелёк и стейкинг в Telegram', DURATION, 0.5);
