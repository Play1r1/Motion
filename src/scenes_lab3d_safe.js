// A look test: the app's safe in 3D under the stake film's studio, at several turns.
'use strict';
DURATION = 3.0;
META = { drop: 0, end: 3, bpm: 120 };
scene({
  init() {
    K3.init({ envOpts: { warm: 3.0, cool: 3.5, front: 0.15, flag: 1, horizon: 0.22, floor: 0.08 }, keyPos: [-7, 11, 5], keyI: 1.6, fillI: 0 });
    this.s = [0, 1, 2, 3].map(() => K3.add(makeSafe()));
  },
  update(t) {
    const P = [[-1.15, 2.2, 0, 0], [1.15, 2.2, 24, 0], [-1.15, -1.0, 24, 8], [1.15, -1.0, 24, -8]];
    this.s.forEach((o, i) => K3.pose(o, { x: P[i][0], y: P[i][1], z: 0, rx: P[i][3], ry: P[i][2], s: 0.75 }));
    K3.render();
  },
});
