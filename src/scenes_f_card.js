// «Из крипты — в карту» — Instagram, 9:16, 22 s, its own airy 110 BPM track (assets/music/x_card_edit.json).
// Clean build (v3): every picture at 1:1 or smaller (the app's card is 764 px wide, shown at 764), the app's
// rows rebuilt as vector UI on one Liquid Glass panel, one motion at a time.
// The idea: a glass lens glides over the Tether row and magnifies the balance; on the drop the lens grows
// over the whole frame, frosts, and as it clears the INCPT card is there; the top-up lands on the panel
// under it; the card dips for a tap and the payments follow; the panel becomes the app's «Добавить карту».
'use strict';

const BAR = 4 * (60 / 110);
const S = n => n * BAR;
DURATION = S(10) + 0.6;
META = { drop: S(2), end: S(8), bpm: 110, musicEdit: 'assets/music/x_card_edit.json', sfxGain: 0.45, sfxOnly: ['whoosh', 'tap', 'tick'] };
const oC = Ease.outCubic, iC = Ease.inCubic;           // oX, ioC from common.js
drawBg = t => LG.draw(t);

const SHOW = { stagger: 0.1, dur: 0.75, dy: 0.25, blur: 6, outDur: 0.24, outStagger: 0.02, outDy: -0.12 };
const T2 = (text, y, size) => new WText(text, { y, size, fit: 960, track: -0.02 });
function win(txt, t, tin, tend, tout) {
  if (t >= tend || t < tin - 0.01) { txt.el.style.display = 'none'; return; }
  txt.at(t, tin, tout, SHOW);
}
// layout (frame px)
const CARD = { x: 540, y: 760 };                       // the card: 764 × 484, 1:1
const PANEL = { x: 540, y: 1245, w: 900, h: 330 };
const LENS = { refr: 50, bevel: 140, mag: 20, tint: 0.03, frost: 0, chroma: 0.3, rim: 1, shadow: 1, op: 1 };

scene({
  init() {
    LG.init();
    this.rowImg = mkImg(MANIFEST.cutouts.pr_row_usdt.src);           // the wallet's Tether row (984 × 327 with its shadow), 1:1
    this.cardImg = mkImg('style/card_holo.png');                      // the app's card, 764 × 484
    this.card = new Still('style/card_holo.png', 764, 484, { radius: 44, sheen: true, shadow: 'drop-shadow(0 40px 46px rgba(20,24,60,0.26))' });
    // the panel: one glass card, the app's rows inside it
    this.panel = UI.glass(PANEL.w, PANEL.h, 52, { tint: 0.55 });
    const R = [
      { dir: 'out', title: 'Пополнение карты', chip: 'TRC-20', sub: '1 окт., 16:40 · T9x...4Qp', amount: '−$5,025', status: 'Отправлено' },
      { dir: 'in', title: 'Пополнение', chip: 'Карта', sub: '1 окт., 16:41', amount: '+$5,000', status: 'Получено' },
      { dir: 'out', title: 'Starbucks', chip: 'Карта', sub: '1 окт., 16:44', amount: '−$18.50', status: 'Оплачено' },
      { dir: 'out', title: 'Nike', chip: 'Карта', sub: '30 сент., 18:25', amount: '−$249.90', status: 'Оплачено' },
    ];
    this.rows = R.map((r, i) => UI.part(this.panel, UI.row(r), { x: 40, y: 15 + (i % 2) * 150 }));
    this.sep = UI.part(this.panel, '<div style="height:2px;background:rgba(19,36,64,0.07);border-radius:1px"></div>', { x: 142, y: 164 });
    // the app's «Добавить карту» tile, in the same panel at the end
    this.add = UI.part(this.panel, `<div style="height:300px;border:3px dashed rgba(19,36,64,0.16);border-radius:40px;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:${UI.F}">
      <div style="width:84px;height:84px;border-radius:42px;background:rgba(19,36,64,0.06);display:flex;align-items:center;justify-content:center"><svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="${UI.ink}" stroke-width="2.4" stroke-linecap="round"><path d="M12 4v16M4 12h16"/></svg></div>
      <div style="margin-top:22px;font-size:38px;font-weight:600;color:${UI.ink}">Добавить карту</div>
      <div style="margin-top:10px;font-size:30px;color:${UI.grey}">Виртуальные и металлическая</div></div>`, { x: 15, y: 15 });
    this.h = [
      [T2('Из крипты —\nв ~карту', 190, 124), 0.35, S(2)],
      [T2('Пополни\nиз ~USDT', 190, 124), S(2) + 0.2, S(4)],
      [T2('Плати\nкартой ~INCPT', 190, 124), S(4) + 0.1, S(6)],
      [T2('Виртуальные\nи ~металлическая', 190, 110), S(6) + 0.1, S(8)],
    ];
    cue(0.5, 'whoosh', { dur: 1.4, gain: 0.2 });
    cue(S(2) - 0.5, 'whoosh', { dur: 0.6, gain: 0.35, up: true });
    [S(2.5), S(3), S(4.5), S(5)].forEach(t => cue(t, 'tick', { gain: 0.3 }));
    cue(S(4) + 0.5, 'tap', { gain: 0.5 });
    cue(S(6) + 0.05, 'whoosh', { dur: 0.5, gain: 0.25 });
  },
  update(t) {
    LG.reset();
    LG.F.white = 1;
    Object.assign(LG.G, LENS);
    this.h.forEach(([h, a, b]) => win(h, t, a, b, b - 0.3));
    const end = iC(prog(t, S(8) - 0.45, S(8) + 0.05));

    // ---- hook: the Tether row; a lens drops onto it, glides to the balance and holds there
    const rowIn = oC(prog(t, 0.1, 0.8));
    const iris = ioC(prog(t, S(2) - 0.55, S(2) + 0.05)), clear = oC(prog(t, S(2) + 0.05, S(2) + 0.85));
    if (t < S(2)) LG.T.push({ img: this.rowImg, x: 540, y: 905 + (1 - rowIn) * 30, h: 327, o: clamp(rowIn * 1.5), lod: (1 - rowIn) * 3, shadow: 0 });
    const born = oC(prog(t, 0.35, 0.95)), tl = t - 0.95, jig = tl > 0 ? Math.exp(-tl * 3.2) * Math.sin(tl * 12) * 0.045 : 0;
    const glide = ioC(prog(t, 0.6, 2.2));
    const lx = lerp(180, 778, glide) + Math.sin(t * 1.5) * 5 * glide, ly = 902 + Math.cos(t * 1.2) * 4;
    // the drop: the lens grows over the frame and frosts (the row dissolves in it); it clears on the card
    if (clear < 1) {
      const d = lerp(320 * born, 2600, iris);
      const cx = lerp(lx, 540, iris), cy = lerp(ly, 860, iris);
      LG.S.push({ x: cx, y: cy, w: d * (1 + jig * (1 - iris)), h: d * (1 - jig * (1 - iris)), r: d / 2, k: 0 });
      Object.assign(LG.G, { frost: 2.6 * Math.sin(Math.PI * Math.min(1, iris * 0.5 + clear * 0.5)), refr: lerp(50, 20, iris), mag: lerp(20, 0, iris), tint: lerp(0.03, 0.12, iris) * (1 - clear),
        op: 1 - clear, shadow: 1 - iris, rim: 1 - clear });
    }
    // under the frosted glass the card takes the row's place (drawn in WebGL until the glass has cleared)
    const asQuad = t >= S(2) - 0.05 && t < S(2) + 0.9;
    if (asQuad) LG.T.push({ img: this.cardImg, x: CARD.x, y: CARD.y, h: 484, o: 1, shadow: 0 });

    // ---- the card (DOM, 1:1): a slow sway; the tap dips it and a light crosses it; it rises for the add tile
    const tap = Math.sin(Math.PI * prog(t, S(4) + 0.1, S(4) + 0.9));
    const raise = ioC(prog(t, S(6), S(6) + 0.8));
    const cy = CARD.y - raise * 40;
    this.card.set({ x: CARD.x, y: cy + end * 60, rx: tap * 18 + Math.sin(t * 0.8) * 1.6 * (t > S(2) + 0.9 ? 1 : 0), ry: Math.sin(t * 0.55) * 3 * (t > S(2) + 0.9 ? 1 : 0),
      s: 1 - tap * 0.03, o: 1 - end, vis: t >= S(2) + 0.9 && t < S(8) + 0.1, sheen: prog(t, S(4) + 0.35, S(4) + 1.25) });

    // ---- the panel: rises once the card is clear; rows in on their beats; the payments replace the top-up
    const pa = oX(prog(t, S(2) + 0.55, S(2) + 1.35));
    const toAdd = ioC(prog(t, S(6) - 0.1, S(6) + 0.6));
    this.panel.set({ x: PANEL.x, y: PANEL.y - (1 - pa) * 70 + end * 60, o: clamp(pa * 2) * (1 - end), vis: t > S(2) + 0.55 && t < S(8) + 0.1 });
    const rowAt = (r, t0, t1) => {
      const a = oX(prog(t, t0, t0 + 0.6)), b = iC(prog(t, t1 - 0.3, t1));
      r.set({ o: clamp(a * 2) * (1 - b), dy: (1 - a) * 26 - b * 26 });
    };
    // each payment takes the place of a top-up row as it lands (the panel is never empty)
    rowAt(this.rows[0], S(2.5), S(4.5) + 0.05);
    rowAt(this.rows[1], S(3), S(5) + 0.05);
    rowAt(this.rows[2], S(4.5), S(6) - 0.05);
    rowAt(this.rows[3], S(5), S(6) - 0.05);
    const sepO = clamp((t - S(3)) * 4) * (1 - prog(t, S(6) - 0.35, S(6) - 0.05));
    this.sep.set({ o: sepO });
    this.add.set({ o: oC(prog(t, S(6) + 0.25, S(6) + 0.8)), dy: (1 - oX(prog(t, S(6) + 0.25, S(6) + 0.9))) * 20 });
  },
});

endCard(S(8), 'Криптокошелёк и карты в Telegram', DURATION, 0.7);
