// Real 3D for the INCPT films (three.js, physically based). A studio on the incpt.io canvas: an
// environment of soft boxes for reflections, a key light with a soft shadow on a backdrop, neutral tone
// mapping so the brand colours stay true. Models are built from geometry, not drawn: coins with a
// reeded edge, a raised rim and an embossed enamel face; cards as rounded slabs with an iridescent
// holographic foil or brushed metal and a printed layer; Liquid Glass as refracting rounded slabs
// (transmission) that bend whatever sits behind them. Everything is driven by the reel's timeline.
'use strict';

const K3 = {
  init({ fov = 26, camZ = 16, shadowOpacity = 0.06, exposure = 1.0, env = 'studio', backdropZ = -2.5 } = {}) {
    const T = THREE, X = THREEX;
    const cv = document.createElement('canvas');
    cv.id = 'k3d';
    Object.assign(cv.style, { position: 'absolute', left: '0px', top: '0px', width: W + 'px', height: H + 'px' });
    $('#stage').insertBefore(cv, $('#world'));
    const r = new T.WebGLRenderer({ canvas: cv, antialias: true, alpha: false, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
    r.setPixelRatio(1);
    r.setSize(W, H, false);
    r.outputColorSpace = T.SRGBColorSpace;
    r.toneMapping = T.NeutralToneMapping;
    r.toneMappingExposure = exposure;
    r.shadowMap.enabled = true;
    r.shadowMap.type = T.VSMShadowMap;
    this.r = r;
    const sc = new T.Scene();
    sc.background = new T.Color(0xfaf9f5);           // the incpt.io canvas, also what the glass refracts
    // the brand fonts for the canvas textures (the engine waits for these loads before the first frame)
    for (const f of ['400 64px Poppins', '500 64px Poppins', '600 64px Poppins', '400 64px "Montserrat Variable"', '500 64px "Montserrat Variable"', '600 64px "Montserrat Variable"', '400 64px "Inter Variable"', '500 64px "Inter Variable"', '600 64px "Inter Variable"'])
      document.fonts.load(f, 'Баланс карты Ab 0123');   // a Cyrillic sample, so the Cyrillic subset loads too
    const pm = new T.PMREMGenerator(r);
    sc.environment = pm.fromScene(env === 'room' ? new X.RoomEnvironment() : studioEnv(), 0.02).texture;
    sc.environmentIntensity = 1.0;
    this.scene = sc;
    this.cam = new T.PerspectiveCamera(fov, W / H, 0.1, 400);
    this.cam.position.set(0, 0, camZ);
    // key light from the upper left front, a soft shadow on the backdrop behind
    const key = new T.DirectionalLight(0xffffff, 2.0);
    key.position.set(-1.5, 4, 14);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.radius = 40;
    key.shadow.blurSamples = 24;
    Object.assign(key.shadow.camera, { left: -10, right: 10, top: 14, bottom: -14, near: 1, far: 40 });
    sc.add(key);
    sc.add(new T.HemisphereLight(0xffffff, 0xe9e6df, 0.35));
    // a rim light from behind and above: separates metal and glass edges from the white canvas
    const rim = new T.DirectionalLight(0xffffff, 1.4); rim.position.set(3, 6, -8); sc.add(rim);
    const fill = new T.DirectionalLight(0xf3f1ff, 0.5); fill.position.set(6, -2, 6); sc.add(fill);
    this.key = key;
    // the backdrop: invisible, it only catches the shadow
    const bd = new T.Mesh(new T.PlaneGeometry(80, 120), new T.ShadowMaterial({ opacity: shadowOpacity }));
    bd.position.z = backdropZ;
    bd.receiveShadow = true;
    sc.add(bd);
    this.backdrop = bd;
    this.texJobs = [];
    return this;
  },
  add(o) { this.scene.add(o); return o; },
  // textures drawn on a 2D canvas once the fonts are ready (first render)
  canvasTex(w, h, draw, { srgb = true } = {}) {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const tex = new THREE.CanvasTexture(c);
    if (srgb) tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    this.texJobs.push(() => { draw(c.getContext('2d'), w, h); tex.needsUpdate = true; });
    return tex;
  },
  render() {
    if (this.texJobs.length) { for (const j of this.texJobs) j(); this.texJobs = []; }
    this.r.render(this.scene, this.cam);
  },
  // layout in frame pixels: scene units per pixel at depth z, and the scene point under pixel (px, py) at depth z
  upp(z = 0) { return 2 * (this.cam.position.z - z) * Math.tan(this.cam.fov * Math.PI / 360) / H; },
  at(px, py, z = 0) { const u = this.upp(z); return { x: (px - W / 2) * u + this.cam.position.x, y: (H / 2 - py) * u + this.cam.position.y, z }; },
  // place an object: position (scene units), rotation in degrees, uniform scale
  pose(o, { x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, s = 1, vis = true } = {}) {
    o.visible = vis;
    o.position.set(x, y, z);
    o.rotation.set(rx * Math.PI / 180, ry * Math.PI / 180, rz * Math.PI / 180);
    o.scale.setScalar(s);
    return o;
  },
};

// ------------------------------------------------------------------ the studio the models reflect
// a product-photography set: a white sweep (bright above, a warm grey floor) and soft boxes. A large key
// box upper left, a tall strip on the right that draws the long highlight down glass and metal edges, a
// top panel and a low rim strip behind. HDR values, so the boxes read as light, not as white paint.
function studioEnv() {
  const T = THREE, sc = new T.Scene();
  const sweep = new T.Mesh(new T.SphereGeometry(40, 64, 32), new T.ShaderMaterial({ side: T.BackSide, depthWrite: false,
    vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: 'varying vec3 vP; void main(){ float y = vP.y; vec3 top = vec3(1.0), hor = vec3(0.86, 0.85, 0.83), flo = vec3(0.55, 0.54, 0.52);' +
      'vec3 c = y > 0.0 ? mix(hor, top, smoothstep(0.0, 0.7, y)) : mix(hor, flo, smoothstep(0.0, 0.5, -y)); gl_FragColor = vec4(c * 0.9, 1.0); }' }));
  sc.add(sweep);
  const box = (w, h, k, pos) => {
    const m = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({ color: new T.Color(k, k, k), side: T.DoubleSide }));
    m.position.set(...pos); m.lookAt(0, 0, 0); sc.add(m); return m;
  };
  box(14, 8, 2.6, [-10, 9, 12]);          // key
  box(2.2, 18, 5.0, [14, 1, 3]);          // right strip
  box(16, 10, 1.6, [0, 16, 0]);           // top
  box(14, 1.6, 3.0, [-4, 2, -14]);        // rim, behind
  box(6, 6, 1.2, [6, -2, 14]);            // a soft front fill
  return sc;
}

// ------------------------------------------------------------------ materials
const MAT = {
  silver: () => new THREE.MeshPhysicalMaterial({ color: 0xdfe3ea, metalness: 1, roughness: 0.2, clearcoat: 0.4, clearcoatRoughness: 0.12 }),
  gold: () => new THREE.MeshPhysicalMaterial({ color: 0xe8c47e, metalness: 1, roughness: 0.22, clearcoat: 0.3 }),
  chrome: () => new THREE.MeshPhysicalMaterial({ color: 0xf2f3f6, metalness: 1, roughness: 0.08 }),
  // Liquid Glass: a clear, slightly cool, thick refracting slab with a polished coat
  glass: (o = {}) => new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: 0, roughness: 0.02, transmission: 1, thickness: 1.2, ior: 1.5,
    clearcoat: 1, clearcoatRoughness: 0.02, specularIntensity: 1, dispersion: 0.4, ...o }),
};

// ------------------------------------------------------------------ coins
// face artwork: enamel colour + the coin's mark in white; the same drawing (grey) is the emboss
const COIN_FACES = {
  usdt: { bg: ['#2fb38a', '#1c8f6b'], mark: (g, s) => {           // Tether ₮: a T and the ring through its stem
    g.lineCap = 'butt';
    g.fillRect(-0.30 * s, -0.36 * s, 0.60 * s, 0.13 * s);
    g.fillRect(-0.075 * s, -0.36 * s, 0.15 * s, 0.70 * s);
    g.lineWidth = 0.075 * s;
    g.beginPath(); g.ellipse(0, -0.06 * s, 0.34 * s, 0.1 * s, 0, 0, Math.PI * 2); g.stroke();
  } },
  usdc: { bg: ['#3a86d6', '#2366b8'], mark: (g, s) => {
    g.lineWidth = 0.07 * s; g.beginPath(); g.arc(0, 0, 0.42 * s, 0, Math.PI * 2); g.stroke();
    g.font = `700 ${0.62 * s}px Poppins`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('$', 0, 0.02 * s);
  } },
  btc: { bg: ['#f7a23b', '#e8851a'], mark: (g, s) => {
    g.save(); g.rotate(0.24); g.font = `700 ${0.8 * s}px Poppins`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('₿', 0, 0.03 * s); g.restore();
  } },
  eth: { bg: ['#7d8bd8', '#5a67c2'], mark: (g, s) => {
    const p = (pts, a) => { g.globalAlpha = a; g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x * s, y * s) : g.moveTo(x * s, y * s))); g.closePath(); g.fill(); };
    p([[0, -0.46], [0.27, 0.0], [0, 0.14], [-0.27, 0.0]], 1); p([[0, 0.2], [0.27, 0.06], [0, 0.46], [-0.27, 0.06]], 0.85); g.globalAlpha = 1;
  } },
  trx: { bg: ['#ef4a4a', '#cf2d2d'], mark: (g, s) => {
    g.lineWidth = 0.05 * s; g.lineJoin = 'round';
    g.beginPath(); g.moveTo(-0.34 * s, -0.3 * s); g.lineTo(0.38 * s, -0.12 * s); g.lineTo(0.02 * s, 0.4 * s); g.closePath(); g.stroke();
    g.beginPath(); g.moveTo(-0.34 * s, -0.3 * s); g.lineTo(0.02 * s, 0.4 * s); g.moveTo(-0.34 * s, -0.3 * s); g.lineTo(0.16 * s, -0.04 * s); g.lineTo(0.38 * s, -0.12 * s); g.moveTo(0.16 * s, -0.04 * s); g.lineTo(0.02 * s, 0.4 * s); g.stroke();
  } },
};
function coinFaceTex(kind, emboss) {
  const F = COIN_FACES[kind];
  return K3.canvasTex(1024, 1024, (g, w) => {
    g.translate(w / 2, w / 2);
    if (emboss) { g.fillStyle = '#7a7a7a'; g.fillRect(-w, -w, 2 * w, 2 * w); }
    else {
      const gr = g.createRadialGradient(-0.2 * w, -0.25 * w, 0.05 * w, 0, 0, 0.6 * w);
      gr.addColorStop(0, F.bg[0]); gr.addColorStop(1, F.bg[1]);
      g.fillStyle = gr; g.fillRect(-w, -w, 2 * w, 2 * w);
    }
    // a fine engraved ring inside the rim
    g.strokeStyle = emboss ? '#a0a0a0' : 'rgba(255,255,255,0.35)'; g.lineWidth = 6;
    g.beginPath(); g.arc(0, 0, 0.44 * w, 0, Math.PI * 2); g.stroke();
    g.fillStyle = g.strokeStyle = emboss ? '#ffffff' : '#ffffff';
    F.mark(g, 0.8 * w);
  }, { srgb: !emboss });
}
// R = 1, thickness 0.15; the coin's faces look along +z / -z
function makeCoin(kind = 'usdt', { metal = 'silver' } = {}) {
  const T = THREE, g = new T.Group();
  const R = 1, TH = 0.15, RI = 0.86;
  const m = MAT[metal]();
  // reeded edge: an open cylinder whose radius ripples 120 times around
  const edge = new T.CylinderGeometry(R, R, TH * 0.82, 360, 1, true);
  const pos = edge.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i), a = Math.atan2(z, x), k = 1 + 0.0065 * Math.cos(a * 120);
    pos.setXYZ(i, x * k, pos.getY(i), z * k);
  }
  edge.computeVertexNormals();
  const em = new T.Mesh(edge, m); em.rotation.x = Math.PI / 2; g.add(em);
  // raised rim with a bevel, both sides (lathe profile in r, y)
  const prof = [[RI, 0], [RI + 0.012, 0.026], [R - 0.035, 0.03], [R - 0.004, 0.012], [R, -0.005]].map(([r, y]) => new T.Vector2(r, y));
  for (const side of [1, -1]) {
    const lg = new T.LatheGeometry(prof, 256);
    const rim = new T.Mesh(lg, m);
    rim.rotation.x = side * Math.PI / 2;
    rim.position.z = side * TH * 0.41;
    rim.scale.y = 1;
    g.add(rim);
    // the face: enamel and the embossed mark
    const fm = new T.MeshPhysicalMaterial({ map: coinFaceTex(kind, false), bumpMap: coinFaceTex(kind, true), bumpScale: 2.2,
      roughness: 0.3, metalness: 0.05, clearcoat: 1, clearcoatRoughness: 0.06 });
    const face = new T.Mesh(new T.CircleGeometry(RI + 0.005, 160), fm);
    face.position.z = side * TH * 0.41;
    if (side < 0) face.rotation.y = Math.PI;
    g.add(face);
  }
  g.traverse(o => { if (o.isMesh) { o.castShadow = true; } });
  return g;
}

// ------------------------------------------------------------------ cards (85.6 × 54 mm, as 3.37 × 2.125)
// The INCPT card as the app shows it: a pastel oil-slick holographic foil in soft vertical waves (colours
// sampled from the app's card), a fine brushed grain, corners of 0.165, the print in the app's font.
const CARD_W = 3.37, CARD_H = 2.125, CARD_R = 0.165;
const CARD_FOIL = ['#dba9e6', '#c1abf6', '#9dbef4', '#dfd3c6', '#c8efdc', '#bfece9', '#b6d4ee', '#a9bff1', '#c3abef', '#e6a5e4', '#efbacb', '#e8d2b6', '#c4dcd6', '#8fc6ea'];
function foilTex(seed = 0) {
  const pal = CARD_FOIL.map(c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16)));
  return K3.canvasTex(2048, 1290, (g, w, h) => {
    const lw = 512, lh = 323, img = new ImageData(lw, lh), d = img.data, n = pal.length;
    for (let j = 0; j < lh; j++) for (let i = 0; i < lw; i++) {
      const x = i / lw, y = j / lh;
      let ph = x * 1.18 + seed + 0.07 * Math.sin(y * 5.0 + x * 4.0) + 0.04 * Math.sin(y * 10.7 - x * 7.0 + 1.0) + 0.018 * Math.sin(x * 23 + y * 6 + 2.0);
      ph = ((ph % 1) + 1) % 1 * n;
      const k = Math.floor(ph), f = ph - k, a = pal[k % n], b = pal[(k + 1) % n], sm = f * f * (3 - 2 * f), o = (j * lw + i) * 4;
      for (let c = 0; c < 3; c++) d[o + c] = a[c] + (b[c] - a[c]) * sm;
      d[o + 3] = 255;
    }
    const c2 = document.createElement('canvas'); c2.width = lw; c2.height = lh; c2.getContext('2d').putImageData(img, 0, 0);
    g.imageSmoothingQuality = 'high'; g.drawImage(c2, 0, 0, w, h);
    // the brushed grain of the foil: fine horizontal streaks
    let r = 12345 + seed * 999; const rnd = () => ((r = (r * 16807) % 2147483647) / 2147483647);
    for (let y = 0; y < h; y++) { g.fillStyle = rnd() > 0.5 ? `rgba(255,255,255,${0.05 * rnd()})` : `rgba(60,60,90,${0.035 * rnd()})`; g.fillRect(0, y, w, 1); }
  });
}
function brushedTex(base = '#202329') {
  return K3.canvasTex(2048, 1290, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#272a31'); gr.addColorStop(1, base);
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    let r = 777; const rnd = () => ((r = (r * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < 16000; i++) { const y = rnd() * h, x = rnd() * w - w * 0.2, l = w * (0.2 + rnd() * 0.8);
      g.fillStyle = rnd() > 0.5 ? `rgba(255,255,255,${0.028 * rnd()})` : `rgba(0,0,0,${0.05 * rnd()})`; g.fillRect(x, y, l, 1); }
  });
}
function cardPrintTex({ title = 'INCPT', sub = 'Карта #2', bal = '$25,000.00', last = '4827', dark = false }) {
  return K3.canvasTex(2048, 1290, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    const ink = dark ? 'rgba(236,238,243,0.94)' : '#121318', grey = dark ? 'rgba(200,205,214,0.78)' : '#555b66';
    const F = '"Inter Variable"';
    g.textBaseline = 'alphabetic';
    g.fillStyle = ink; g.font = `600 ${0.058 * w}px ${F}`; g.fillText(title, 0.055 * w, 0.165 * h);
    g.fillStyle = grey; g.font = `400 ${0.03 * w}px ${F}`; g.fillText(sub, 0.056 * w, 0.24 * h);
    g.fillStyle = ink; g.font = `500 ${0.066 * w}px ${F}`; g.fillText(bal, 0.053 * w, 0.905 * h);
    g.fillStyle = grey; g.font = `400 ${0.037 * w}px ${F}`; g.textAlign = 'right';
    g.letterSpacing = `${0.004 * w}px`; g.fillText(last, 0.943 * w, 0.898 * h); g.letterSpacing = '0px';
    const dw = g.measureText(last).width + 0.035 * w;
    for (let i = 0; i < 4; i++) { g.beginPath(); g.arc(0.943 * w - dw - i * 0.022 * w, 0.886 * h, 0.0058 * w, 0, 7); g.fill(); }
    // the network mark
    const cx = 0.885 * w, cy = 0.142 * h, rr = 0.0377 * w, dx = 0.0245 * w;
    g.fillStyle = '#eb001b'; g.beginPath(); g.arc(cx - dx, cy, rr, 0, 7); g.fill();
    g.fillStyle = '#f79e1b'; g.beginPath(); g.arc(cx + dx, cy, rr, 0, 7); g.fill();
    g.save(); g.beginPath(); g.arc(cx - dx, cy, rr, 0, 7); g.clip(); g.fillStyle = '#ff5f00'; g.beginPath(); g.arc(cx + dx, cy, rr, 0, 7); g.fill(); g.restore();
  });
}
function roundedRectShape(w, h, r) {
  const s = new THREE.Shape(), x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r); s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h); s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
  return s;
}
// a rounded slab with a small bevel, centred on z, uv 0..1 over its face (front and back)
function slabGeometry(w, h, r, depth, bevel = 0.006) {
  const geo = new THREE.ExtrudeGeometry(roundedRectShape(w - 2 * bevel, h - 2 * bevel, r - bevel), { depth: depth - 2 * bevel, bevelEnabled: true,
    bevelThickness: bevel, bevelSize: bevel, bevelSegments: 4, curveSegments: 28 });
  geo.translate(0, 0, -(depth - 2 * bevel) / 2);
  const p = geo.attributes.position, uv = geo.attributes.uv;
  for (let i = 0; i < p.count; i++) uv.setXY(i, (p.getX(i) + w / 2) / w, (p.getY(i) + h / 2) / h);
  geo.computeVertexNormals();
  return geo;
}
function makeCard({ metal = false, ...print } = {}) {
  const T = THREE, g = new T.Group(), D = 0.03;
  const face = metal
    ? new T.MeshPhysicalMaterial({ map: brushedTex(), color: 0xffffff, metalness: 0.9, roughness: 0.3, anisotropy: 0.8, clearcoat: 0.6, clearcoatRoughness: 0.12 })
    : new T.MeshPhysicalMaterial({ map: foilTex(), color: 0xffffff, metalness: 0.18, roughness: 0.3, iridescence: 0.45, iridescenceIOR: 1.6,
      iridescenceThicknessRange: [260, 640], clearcoat: 1, clearcoatRoughness: 0.07, sheen: 0.3, sheenColor: new T.Color(0xf4ecff) });
  // the edge: bright machined metal on the metal card, a pearl edge on the foil card
  const edge = metal ? new T.MeshPhysicalMaterial({ color: 0xc9ccd3, metalness: 1, roughness: 0.18 })
    : new T.MeshPhysicalMaterial({ color: 0xece8f4, metalness: 0.3, roughness: 0.25, iridescence: 0.6, clearcoat: 1 });
  const m = new T.Mesh(slabGeometry(CARD_W, CARD_H, CARD_R, D), [face, edge]);
  m.castShadow = true;
  g.add(m);
  const pr = new T.Mesh(new T.ShapeGeometry(roundedRectShape(CARD_W, CARD_H, CARD_R), 28), new T.MeshStandardMaterial({ map: cardPrintTex({ dark: metal, ...print }),
    transparent: true, roughness: 0.9, metalness: 0, envMapIntensity: 0.15, depthWrite: false }));
  const pp = pr.geometry.attributes.position, pu = pr.geometry.attributes.uv;
  for (let i = 0; i < pp.count; i++) pu.setXY(i, (pp.getX(i) + CARD_W / 2) / CARD_W, (pp.getY(i) + CARD_H / 2) / CARD_H);
  pr.position.z = D / 2 + 0.0015;
  g.add(pr);
  g.face = face;
  return g;
}

// ------------------------------------------------------------------ Liquid Glass panels
// a refracting rounded slab; `content` draws the UI that sits on its front surface (canvas 2D, px)
function makeGlass(w, h, { depth = 0.4, radius = 0.32, content = null, px = 380, frost = 0, rough = 0.05 } = {}) {
  const T = THREE, g = new T.Group(), b = Math.min(depth * 0.45, radius * 0.8);
  // the slab: a rounded rim all the way round (the bevel is the "liquid" edge that bends the light)
  const slab = new T.Mesh(slabGeometry(w, h, radius, depth, b), MAT.glass({ roughness: rough, thickness: depth * 2.2 }));
  g.add(slab);
  const plane = (pw, ph, pr, mat) => {
    const geo = new T.ShapeGeometry(roundedRectShape(pw, ph, pr), 24), p = geo.attributes.position, uv = geo.attributes.uv;
    for (let i = 0; i < p.count; i++) uv.setXY(i, (p.getX(i) + pw / 2) / pw, (p.getY(i) + ph / 2) / ph);
    const m = new T.Mesh(geo, mat); m.position.z = depth / 2 + 0.002; m.renderOrder = 2; g.add(m); return m;
  };
  // a milky layer on the flat of the face, as the app's light glass, so the print reads on any background
  if (frost) g.frost = plane(w - 2 * b, h - 2 * b, Math.max(0.01, radius - b), new T.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: frost, depthWrite: false, toneMapped: false }));
  if (content) {
    const tex = K3.canvasTex(Math.round(w * px), Math.round(h * px), content);
    g.print = plane(w, h, radius, new T.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, toneMapped: false }));
    g.print.position.z += 0.002; g.print.renderOrder = 3;
  }
  g.slab = slab;
  return g;
}

// ------------------------------------------------------------------ a Liquid Glass lens (a thick biconvex drop)
function makeLens(R = 2.2, { thick = 0.9 } = {}) {
  const T = THREE, pts = [];
  for (let i = 0; i <= 48; i++) {                      // profile: a rounded biconvex section, r from 0 to R
    const a = (i / 48) * Math.PI;
    const r = R * Math.sin(a), y = (thick / 2) * Math.cos(a) * (0.55 + 0.45 * Math.pow(Math.sin(a), 0.35));
    pts.push(new T.Vector2(Math.max(0.0001, r), y));
  }
  const m = new T.Mesh(new T.LatheGeometry(pts, 192), MAT.glass({ thickness: thick * 1.4, dispersion: 0.6 }));
  m.rotation.x = Math.PI / 2;
  const g = new T.Group(); g.add(m);
  return g;
}

// ------------------------------------------------------------------ an operation row, as the app draws it, in Liquid Glass
// { title, chip, sub, amount, status, dir: 'out' | 'in' }; the app's layout (measured from its screen): arrow, title + chip,
// date below; amount and status on the right; blue ↖ out, green ↘ in
function makeOpRow(o, { w = 2.9, h = 0.63 } = {}) {
  return makeGlass(w, h, { depth: 0.16, radius: 0.079, px: 520, frost: 0.62, content: (g, W_, H_) => {
    const F = '"Inter Variable"', out = o.dir !== 'in';
    // the arrow (a stroked line and its head)
    const ax = 0.099 * W_, ay = 0.5 * H_, a = 0.075 * H_;
    g.strokeStyle = out ? '#2a6fe3' : '#2fae52'; g.lineWidth = 0.022 * H_; g.lineCap = 'round'; g.lineJoin = 'round';
    g.save(); g.translate(ax, ay); if (!out) g.rotate(Math.PI);
    g.beginPath(); g.moveTo(a, a); g.lineTo(-a, -a); g.moveTo(-a, -a + 1.15 * a); g.lineTo(-a, -a); g.lineTo(-a + 1.15 * a, -a); g.stroke(); g.restore();
    g.textBaseline = 'middle'; g.textAlign = 'left';
    g.fillStyle = '#121318'; g.font = `500 ${0.205 * H_}px ${F}`; g.fillText(o.title, 0.192 * W_, 0.335 * H_);
    if (o.chip) { g.fillStyle = '#6a707b'; g.font = `400 ${0.135 * H_}px ${F}`; g.fillText(o.chip, (o.chipX || 0.592) * W_, 0.33 * H_); }
    g.fillStyle = '#6a707b'; g.font = `400 ${0.158 * H_}px ${F}`; g.fillText(o.sub || '', 0.192 * W_, 0.69 * H_);
    g.textAlign = 'right';
    g.fillStyle = out ? '#121318' : '#2fae52'; g.font = `500 ${0.205 * H_}px ${F}`; g.fillText(o.amount, 0.962 * W_, 0.335 * H_);
    g.fillStyle = '#6a707b'; g.font = `400 ${0.158 * H_}px ${F}`; g.fillText(o.status || '', 0.962 * W_, 0.69 * H_);
  } });
}
