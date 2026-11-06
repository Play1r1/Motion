// A look test: the 3D phone with a real app screen, front and back.
'use strict';
DURATION = 3.0;
META = { drop: 0, end: 3, bpm: 120 };
scene({
  init() {
    K3.init({ envOpts: { cool: 2.0 }, keyPos: [-3, 12, 6], fillI: 0.3 });
    this.p = K3.add(makePhone(imgTex('app/home.jpg')));
    this.b = K3.add(makePhone(imgTex('app/wallet.jpg')));
  },
  update(t) {
    K3.pose(this.p, { x: -0.6, y: -0.2, z: 0, rx: 4, ry: 18, rz: 0, s: 0.95 });
    K3.pose(this.b, { x: 1.9, y: 0.6, z: -3, rx: 6, ry: 200, rz: -8, s: 0.8 });
    K3.render();
  },
});
