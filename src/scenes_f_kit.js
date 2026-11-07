// test bench: each vector screen over its screenshot at 50% (t=0 swap, 1 stake, 2 cards, 3 swap below the fold)
'use strict';
DURATION = 8; META = {};
drawBg = t => { const c = $('#bg'), g = c.getContext('2d'); c.width = 1080; c.height = 1920; g.fillStyle = '#fff'; g.fillRect(0, 0, 1080, 1920); };
scene({
  init() {
    const L = AK.layer(1);
    this.v = ['swap', 'stake', 'cards'].map(k => {
      const box = AK.el(L, '<div></div>'); Object.assign(box.style, { position: 'absolute', left: '0px', top: '0px', width: '920px', height: '2000px', overflow: 'hidden', background: AK.SHEET, transformOrigin: '0 0', transform: 'scale(0.96)' });
      box.className = 'ak';
      const c = AK.el(box, '<div></div>'); Object.assign(c.style, { position: 'absolute', left: '0px', top: '0px', width: '920px', height: '2600px' });
      AK[k + 'Screen'](c);
      const hdr = mkImg(`howto/build/ov_hdr_${k === 'swap' ? 'back' : 'close'}.png`, 'abs'); hdr.style.left = '0px'; hdr.style.top = '0px'; box.appendChild(hdr);
      const shot = mkImg(`app/${k}.jpg`, 'abs'); Object.assign(shot.style, { left: '0px', top: '0px', width: '920px', height: '2000px', opacity: '0.5' }); box.appendChild(shot);
      return { box, c, shot };
    });
  },
  update(t) {
    const raw = t >= 4, i = raw ? Math.min(2, Math.floor(t - 4 + 0.001)) : Math.min(2, Math.floor(t + 0.001)), below = t >= 3 && t < 4;
    this.v.forEach((v, k) => { v.box.style.display = (below ? k === 0 : k === i) ? '' : 'none'; v.shot.style.opacity = raw ? '0' : '0.5'; v.box.style.transform = raw ? '' : 'scale(0.96)'; });
    if (below) { this.v[0].c.style.transform = 'translateY(-298px)'; this.v[0].shot.src = 'howto/build/page_swap.jpg'; Object.assign(this.v[0].shot.style, { top: '-298px', height: '2298px' }); }
  },
});
