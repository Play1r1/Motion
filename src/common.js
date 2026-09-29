// Shared by every INCPT reel: timing helpers, lift/press, slots and the brand end card.
'use strict';

const vis = (t, a, b) => t >= a && t < b;
const lin = Ease.linear, oX = Ease.outExpo, iX = Ease.inExpo, ioC = Ease.inOutCubic;

// lift a cut-out off the phone: rest -> target (outExpo), optional move to a second pose
function lift(node, t, t0, dur, to, back = null) {
  const p = Ease.outExpo(prog(t, t0, t0 + dur));
  const st = { x: 0, y: 0, z: 0, s: 1, rx: 0, ry: 0, rz: 0 };
  const q = {};
  for (const k in st) q[k] = lerp(st[k], to[k] ?? st[k], p);
  if (back) {
    const pb = (back.ease || Ease.inOutCubic)(prog(t, back.t, back.t + back.dur));
    const tgt = back.to || st;
    for (const k in st) q[k] = lerp(q[k], tgt[k] ?? st[k], pb);
  }
  return node.set(q);
}
// press: 0 -> 1 -> 0 around a tap
const press = (t, t0) => (t < t0 ? 0 : t < t0 + 0.12 ? prog(t, t0, t0 + 0.12) : 1 - prog(t, t0 + 0.12, t0 + 0.34));
// show/hide an empty-slot patch
const slotO = (im, o) => { im.style.opacity = clamp(o).toFixed(3); };
// centre of a cut-out in phone-local px
const home = n => { const c = MANIFEST.cutouts[n], so = MANIFEST.phone.screenOffset; return [so[0] + c.box[0] + c.box[2] / 2, so[1] + c.box[1] + c.box[3] / 2]; };


// ======================================================================= END CARD
// Brand lock-up in the style of the INCPT IO logo sheet: logo, "INCPT WALLET" (WALLET in the
// logo gradient), a tracked grey tagline, then the "Доступен в Telegram" badge — on brand off-white.
// T0 is when the background starts turning white; everything else is timed from it.
// L: layout (logo centre / height, lock-up top, badge top) — defaults are the 9:16 frame
function endCard(T0, tagline, END = DURATION, sfx = 1, L = {}) {
  L = { logoY: 640, logoH: 520, lockTop: 968, badgeY: 1300, ...L };
  scene({
    init() {
      this.logo = new LogoMark();
      this.lock = document.createElement('div');
      this.lock.className = 'lockup';
      this.lock.innerHTML = `<div class="lk-title"><span class="lk-w lk-incpt">INCPT</span><span class="lk-w lk-io">WALLET</span></div><div class="lk-tag">${tagline}</div>`;
      $('#text').appendChild(this.lock);
      if (L.lockTop !== 968) this.lock.style.top = L.lockTop + 'px';
      this.title = this.lock.querySelector('.lk-title');
      this.words = [...this.lock.querySelectorAll('.lk-w')];
      this.tag = this.lock.querySelector('.lk-tag');
      this.badge = new TgBadge('Доступен в', 'Telegram');
      this.badge.el.classList.add('dark');
      const c = T0;
      cue(c + 0.2, 'whoosh', { dur: 0.5, gain: 0.6 * sfx, up: true });
      cue(c + 0.62, 'impact', { gain: 0.8 * sfx, soft: true });
      cue(c + 0.7, 'shimmer', { gain: 0.4 * sfx });
      cue(c + 0.8, 'tick', { gain: 0.4 * sfx }); cue(c + 0.94, 'tick', { gain: 0.4 * sfx });
      cue(c + 1.66, 'pop', { gain: 0.65 * sfx, pitch: 0.85 });
      cue(c + 3.4, 'shimmer', { gain: 0.22 * sfx });
    },
    update(t) {
      const c = T0, on = t >= c;
      this.lock.style.display = on ? '' : 'none';
      if (!on) { this.logo.set({ o: 0 }); this.badge.set({ o: 0 }); return; }
      BGP.white = tw(t, c, c + 0.75, 0, 1, ioC);
      CAM.s = kf(t, [[c + 0.4, 1.0], [END, 1.05, lin]]);
      // logo flies in from depth, spinning to face camera, then floats
      const pin = oX(prog(t, c + 0.16, c + 0.8));
      const fl = Math.max(0, t - (c + 0.8));
      this.logo.set({
        x: W / 2, y: L.logoY + (1 - pin) * 120 - fl * 5, h: lerp(80, L.logoH, pin),
        ry: lerp(-160, -6, pin) + fl * 3, rz: lerp(-40, -2, pin) + fl * 0.4,
        rx: Math.sin(fl * 0.9) * 3, o: clamp((t - (c + 0.16)) * 7), blur: (1 - pin) * 12,
        sheen: vis(t, c + 0.75, c + 1.7) ? prog(t, c + 0.75, c + 1.7) : vis(t, c + 3.3, c + 4.2) ? prog(t, c + 3.3, c + 4.2) : null, shadow: 0.55,
      });
      // "INCPT WALLET": words rise + un-blur while the tracking settles from wide to the logo's spacing
      const ls = lerp(0.34, 0.12, Ease.outCubic(prog(t, c + 0.78, c + 1.8)));
      Object.assign(this.title.style, { letterSpacing: ls + 'em', paddingLeft: ls + 'em' });
      this.words.forEach((w, i) => {
        const p = prog(t, c + 0.78 + i * 0.14, c + 0.78 + i * 0.14 + 0.6), e = Ease.outExpo(p);
        w.style.opacity = clamp(p * 3).toFixed(3);
        w.style.transform = `translateY(${((1 - e) * 0.45).toFixed(4)}em)`;
        w.style.filter = e < 0.99 ? `blur(${((1 - e) * 12).toFixed(2)}px)` : '';
      });
      this.words[1].style.backgroundPosition = `${(t * 18) % 200}% 50%`;
      const ts = lerp(0.62, 0.3, Ease.outCubic(prog(t, c + 1.25, c + 2.3)));
      const pt = prog(t, c + 1.25, c + 1.9);
      Object.assign(this.tag.style, { letterSpacing: ts + 'em', paddingLeft: ts + 'em', opacity: clamp(pt * 1.6).toFixed(3) });
      const pb = oX(prog(t, c + 1.62, c + 2.3));
      this.badge.set({ y: L.badgeY, o: clamp((t - (c + 1.62)) * 6), dy: (1 - pb) * 60, s: lerp(0.92, 1, pb), blur: (1 - pb) * 8 });
    },
  });
}
