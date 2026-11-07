// «Пусть USDT работает» — Instagram, 9:16, 26 s, its own warm 92 BPM track that breathes before the drop and
// ends on a ringing chord (assets/music/x_stake_edit.json). Clean build (v3): the app's safe at no more than
// 1.1× of its own pixels, the staking screen's pieces rebuilt as vector UI inside one Liquid Glass card,
// one motion per beat. The idea: glass drops land one per beat and melt into a plinth under the safe; on
// the drop the plinth flows into the staking card and its parts land on the beats (Liquid Vault 20–40% APY,
// the Liquid / Monthly / Maximum control, the yearly range on an odometer); then the card turns to the
// deposit: $20,000.00 in staking, Liquid Vault active, today's forecast counting up to ≈ $14.42.
'use strict';

const BAR = 4 * 60 / 92.29, BT = BAR / 4;
const S = n => n * BAR;
DURATION = 26.3;
META = { drop: S(2), end: S(8), bpm: 92, musicEdit: 'assets/music/x_stake_edit.json', sfxGain: 0.45, sfxOnly: ['whoosh', 'tap', 'tick'] };
const oC = Ease.outCubic, iC = Ease.inCubic;
drawBg = t => LG.draw(t);

const SHOW = { stagger: 0.05, dur: 0.55, dy: 0.5, blur: 0, outDur: 0.2, outStagger: 0.02, outDy: -0.3 };   // crisp, mechanical
const T2 = (text, y, size) => new WText(text, { y, size, fit: 960, track: -0.02 });
function win(txt, t, tin, tend, tout) {
  if (t >= tend || t < tin - 0.01) { txt.el.style.display = 'none'; return; }
  txt.at(t, tin, tout, SHOW);
}
const AT = k => S(2) + k * BT;                      // beats after the drop
const SOCK = { refr: 34, bevel: 58, mag: 0, tint: 0.14, frost: 1.3, chroma: 0.3, rim: 1, shadow: 1, op: 1 };
const CARDP = { x: 540, y: 1215, w: 900, h: 560 };

// the staking screen's pieces as vector UI (the app's texts and numbers)
const ICO = {
  liquid: '<path d="M12 3.2c2.6 3.3 5.6 6.6 5.6 10.1a5.6 5.6 0 0 1-11.2 0c0-3.5 3-6.8 5.6-10.1z"/>',
  monthly: '<path d="M4.5 16a7.5 7.5 0 0 1 15 0"/><path d="M12 16l3.4-4.4"/>',
  maximum: '<path d="M3.5 17l5.5-5.5 3.5 3.5 7.5-7.5"/><path d="M14.5 7.5h5.5v5.5"/>',
};
const ico = (k, col, s = 40) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="${col}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICO[k]}</svg>`;
const TABS = `<div style="position:relative;height:150px;border-radius:36px;background:rgba(19,36,64,0.05);display:flex;align-items:center;padding:0 10px;font-family:${UI.F}">
  ${[['liquid', 'Liquid', true], ['monthly', 'Monthly'], ['maximum', 'Maximum']].map(([k, l, on]) => `<div style="flex:1;height:130px;border-radius:30px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;${on ? 'background:#fff;box-shadow:0 0 0 2.5px rgba(47,174,82,0.55),0 10px 24px -10px rgba(47,174,82,0.45)' : ''}">${ico(k, on ? UI.green : '#8b9099')}<div style="font-size:30px;font-weight:600;color:${on ? UI.green : '#8b9099'}">${l}</div></div>`).join('')}</div>`;
const HEAD = `<div style="display:flex;align-items:center;justify-content:space-between;font-family:${UI.F}"><span style="font-size:36px;font-weight:600;color:#5c6270">Liquid Vault</span><span style="font-size:38px;font-weight:600;color:${UI.green}">20–40% APY</span></div>`;

scene({
  init() {
    LG.init();
    this.safe = new Still(MANIFEST.cutouts.pr_safe.src, 422, 424, { shadow: 'none', z: 4 });   // the app's safe, its own pixels
    this.card = UI.glass(CARDP.w, CARDP.h, 56, { tint: 0.55 });
    this.head = UI.part(this.card, HEAD, { x: 52, y: 44 });
    this.tabs = UI.part(this.card, TABS, { x: 40, y: 118 });
    this.range = UI.part(this.card, `<div style="text-align:center;font-family:${UI.F}"><div class="wl-irid" data-r style="display:inline-block;font-size:150px;font-weight:700;letter-spacing:-0.04em;line-height:1;font-variant-numeric:tabular-nums;background-size:100% 100%">20–20%</div><div style="margin-top:6px;font-size:36px;color:#5c6270">годовых</div></div>`, { x: 0, y: 312 });
    this.rangeTxt = this.range.querySelector('[data-r]');
    // the deposit side of the card
    this.total = UI.part(this.card, `<div style="text-align:center;font-family:${UI.F}"><div style="font-size:104px;font-weight:700;letter-spacing:-0.035em;color:${UI.ink};line-height:1">$20,000.00</div><div style="margin-top:12px;font-size:36px;color:#5c6270">Всего в стейкинге</div></div>`, { x: 0, y: 58 });
    this.dep = UI.part(this.card, `<div style="display:flex;align-items:center;height:210px;border-radius:40px;background:rgba(255,255,255,0.78);box-shadow:0 1px 0 rgba(19,36,64,0.04);padding:0 40px;font-family:${UI.F}">
      <div style="width:92px;height:92px;border-radius:46px;background:rgba(47,174,82,0.12);display:flex;align-items:center;justify-content:center;flex:none">${ico('liquid', UI.green, 46)}</div>
      <div style="margin-left:28px;flex:1"><div style="font-size:36px;font-weight:600;color:${UI.ink}">Liquid Vault</div><div style="margin-top:8px;font-size:30px;color:#6a707b">20,000.00 USDT</div>
        <div style="margin-top:8px;font-size:28px;color:${UI.green}"><span style="display:inline-block;width:14px;height:14px;border-radius:7px;background:${UI.green};margin-right:10px;vertical-align:1px"></span>Депозит активен</div></div>
      <div style="width:2px;align-self:stretch;margin:44px 30px;background:rgba(19,36,64,0.08)"></div>
      <div><div style="font-size:28px;color:#6a707b">Прогноз сегодня</div><div data-f style="margin-top:10px;font-size:46px;font-weight:700;color:${UI.green};font-variant-numeric:tabular-nums">≈ $0.00</div></div></div>`, { x: 40, y: 300 });
    this.fc = this.dep.querySelector('[data-f]');
    this.h = [
      [T2('Пусть ~USDT\nработает', 190, 124), 0.4, S(2)],
      [T2('Три тарифа\n~на выбор', 190, 124), S(2) + 0.1, S(5)],
      [T2('Прогноз дохода\n~каждый день', 190, 116), S(5) + 0.1, S(8)],
    ];
    cue(0.3, 'whoosh', { dur: 1.4, gain: 0.2 });
    [0, 1, 2, 3].forEach(k => cue(0.15 + k * BT + 0.85, 'tick', { gain: 0.22 }));           // the drops melting into the plinth
    cue(S(2) - 0.06, 'tap', { gain: 0.4 });
    [AT(1), AT(2), AT(4), S(5) + 0.15, S(5) + BT + 0.15].forEach(t => cue(t, 'tick', { gain: 0.32 }));
    for (let k = 0; k < 4; k++) cue(AT(4) + 0.35 + k * 0.16, 'tick', { gain: 0.16 });
    cue(S(8) - 0.5, 'whoosh', { dur: 0.6, gain: 0.3 });
  },
  update(t) {
    LG.reset();
    LG.F.white = 1;
    Object.assign(LG.G, SOCK);
    this.h.forEach(([h, a, b]) => win(h, t, a, b, b - 0.3));
    const out = k => iC(prog(t, S(8) - 0.55 + k * 0.1, S(8) - 0.1 + k * 0.1));
    // ---- the safe: a focus pull, a breath with the music's pause, a click up on the drop, smaller for the card
    const fin = oX(prog(t, 0.1, 1.5)), breath = Math.sin(Math.PI * prog(t, S(1) + 0.3, S(2) - 0.05));
    const up = oX(prog(t, S(2) - 0.04, S(2) + 0.6));
    const sy = lerp(812, 668, up), ss = lerp(1.1, 0.78, up) * (1 - breath * 0.03);
    this.safe.set({ x: 540, y: sy + out(0) * 1000, s: ss, ry: Math.sin(t * 0.6) * 5, o: clamp(fin * 2), vis: t < S(8) + 0.2 });
    this.safe.el.style.filter = fin < 0.99 ? `blur(${((1 - fin) * 14).toFixed(2)}px)` : '';
    // ---- the hook: one glass drop per beat flies in; they melt into a plinth under the safe
    const flow = oX(prog(t, S(2) - 0.05, S(2) + 0.55));
    if (t < S(2) + 0.6) {
      const PL = { x: 540, y: 1020 };
      const from = [[-140, 760], [1220, 980], [-120, 1420], [1200, 1560]];
      let n = 0;
      from.forEach(([fx, fy], k) => {
        const t0 = 0.15 + k * BT, p = ioC(prog(t, t0, t0 + 0.85)), born = oC(prog(t, t0, t0 + 0.3));
        if (p >= 1) { n++; return; }
        const r = 56 * born;
        if (r > 1) LG.S.push({ x: lerp(fx, PL.x + (k % 2 ? 120 : -120), p), y: lerp(fy, PL.y, p) + Math.sin(p * Math.PI) * -80, w: 2 * r, h: 2 * r, k: 160 });
      });
      const inhale = Math.sin(Math.PI * prog(t, S(1) + 0.3, S(2) - 0.05)) * 0.1;
      const pw = Math.min(600, 150 + n * 112) * (1 - inhale), ph = 104 * (1 - inhale * 0.5);
      // on the drop the plinth flows into the shape of the staking card (the DOM card takes over as it lands)
      const P = { x: 540, y: lerp(PL.y, CARDP.y, flow), w: lerp(pw, CARDP.w, flow), h: lerp(ph, CARDP.h, flow), r: lerp(ph / 2, 56, flow) };
      if (n > 0 && flow < 1) LG.S.push({ ...P, k: 160 });
    }
    // ---- the staking card (glass DOM), and its parts on the beats
    const ca = prog(t, S(2) + 0.4, S(2) + 0.6);
    this.card.set({ x: CARDP.x, y: CARDP.y + out(1) * 1000, o: ca, vis: t > S(2) + 0.4 && t < S(8) + 0.3 });
    const part = (p, t0, t1) => { const a = oX(prog(t, t0, t0 + 0.45)), b = iC(prog(t, t1 - 0.3, t1)); p.set({ o: clamp(a * 2.5) * (1 - b), dy: (1 - a) * 22 - b * 22 }); };
    part(this.head, AT(1), S(5) + 0.1);                   // the plans leave just as the deposit arrives (the card is never empty)
    part(this.tabs, AT(2), S(5) + 0.1);
    part(this.range, AT(4), S(5) + 0.1);
    const r1 = oC(prog(t, AT(4), AT(4) + 0.5)), r2 = oC(prog(t, AT(4) + 0.45, AT(4) + 1.25));
    this.rangeTxt.textContent = `${Math.round(20 * r1)}–${Math.round(lerp(20, 100, r2))}%`;
    part(this.total, S(5) + 0.15, S(8) + 1);
    part(this.dep, S(5) + BT + 0.15, S(8) + 1);
    const f = 14.42 * Ease.outCubic(prog(t, S(5) + BT + 0.55, S(5) + BT + 2.2));
    this.fc.textContent = '≈ $' + f.toFixed(2);
    LG.G.sheen = lerp(-800, 2800, prog(t, S(5) + 1.6, S(5) + 3.4));
  },
});

endCard(S(8), 'Криптокошелёк и стейкинг в Telegram', DURATION, 0.7);
