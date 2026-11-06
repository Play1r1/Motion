// A look test for the 3D kit: a USDT coin, the holographic INCPT card and a Liquid Glass panel.
'use strict';
DURATION = 3.0;
META = { drop: 0, end: 3, bpm: 120 };
scene({
  init() {
    K3.init();
    this.card = K3.add(makeCard({}));
    this.coin = K3.add(makeCoin('usdt'));
    this.coin2 = K3.add(makeCoin('btc', { metal: 'gold' }));
    this.glass = K3.add(makeGlass(3.6, 1.5, { content: (g, w, h) => {
      g.fillStyle = '#132440'; g.font = `600 ${0.2 * h}px Poppins`; g.textBaseline = 'middle';
      g.fillText('$25,000.00', 0.08 * w, 0.42 * h);
      g.fillStyle = '#5c6270'; g.font = `400 ${0.1 * h}px "Montserrat Variable"`; g.fillText('Баланс карты', 0.08 * w, 0.72 * h);
    } }));
  },
  update(t) {
    K3.pose(this.card, { x: 0.2, y: 1.4, z: -0.6, rx: -14, ry: -22 + t * 8, rz: -6 });
    K3.pose(this.coin, { x: -1.2, y: -1.1, z: 1.2, rx: 12, ry: 28 - t * 10, rz: 4, s: 0.95 });
    K3.pose(this.coin2, { x: 1.5, y: -2.6, z: 0.3, rx: -18, ry: -40 + t * 12, rz: -8, s: 0.8 });
    K3.pose(this.glass, { x: 0.2, y: 0.55, z: 2.2, rx: -8, ry: 14, rz: -2 });
    K3.render();
  },
});
