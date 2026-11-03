// Liquid Glass for the 2026 INCPT brand (welcome reel): one WebGL2 pass per frame draws
//   1. the pearl field: off-white with diagonal iridescent "oil" bands (lime -> teal -> violet,
//      the colours of the new logo) seen through vertical flutes, like the ribbed glass of the mark;
//   2. textured quads inside that field (the chrome logo, the safe) with soft contact shadows;
//   3. liquid glass: rounded rects that melt into each other (smooth union) and refract 1-2 at the
//      rim, with chromatic edges, a thin specular line, a frosted option and a soft drop shadow.
// DOM content sits above the canvas; `glassEl` gives DOM elements the same material with a CSS
// backdrop filter (edge lens + blur), so chips can refract the phone and the card behind them.
'use strict';

const LG = {
  F: {}, T: [], S: [], G: {},
  reset() {
    this.F = { oil: 1, rib: 1, dark: 0, sx: 0, sy: 0, warm: 0 };
    this.T = [];
    this.S = [];
    this.G = { refr: 44, frost: 0, tint: 0.1, chroma: 1, rim: 1, shadow: 1, bevel: 70, op: 1, sheen: -9999, mag: 0 };
  },
};
LG.reset();

(() => {
  const VS = `#version 300 es
  void main() { vec2 p = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2); gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0); }`;
  const FS = `#version 300 es
  precision highp float;
  uniform vec2 uRes; uniform float uT;
  uniform vec4 uF; uniform vec4 uF2;
  uniform sampler2D uTex0; uniform sampler2D uTex1; uniform sampler2D uTex2;
  uniform vec4 uTq[3]; uniform vec2 uTr[3]; uniform vec4 uTo[3]; uniform int uTn;
  uniform vec4 uS[10]; uniform vec2 uSr[10]; uniform int uSn;
  uniform vec4 uG; uniform vec4 uG2; uniform vec2 uG3;
  out vec4 outC;
  const vec3 LIME = vec3(0.776, 0.961, 0.243);
  const vec3 TEAL = vec3(0.310, 0.820, 0.741);
  const vec3 VIO2 = vec3(0.608, 0.525, 1.000);
  const vec3 VIO  = vec3(0.451, 0.341, 1.000);
  const vec3 SUN  = vec3(0.953, 0.890, 0.353);

  vec3 oilRamp(float x) {
    vec3 c = mix(LIME, TEAL, smoothstep(0.05, 0.45, x));
    c = mix(c, VIO2, smoothstep(0.4, 0.72, x));
    return mix(c, VIO, smoothstep(0.7, 1.0, x));
  }
  // the field without flutes: base + two iridescent oil bands at -28 deg
  vec3 oil(vec2 q, out float k) {
    float t = uT;
    vec2 dir = vec2(0.8829, -0.4695);           // -28 deg
    vec2 nrm = vec2(0.4695, 0.8829);
    float al = dot(q, dir), ac = dot(q, nrm);
    float c1 = 0.62 + 0.035 * sin(t * 0.41) + 0.05 * sin(al * 3.1 + t * 0.6);
    float v1 = (ac - c1) / (0.13 + 0.02 * sin(al * 2.3 - t * 0.5));
    float i1 = exp(-v1 * v1 * 1.6);
    float c2 = 1.32 + 0.04 * sin(t * 0.33 + 1.7) + 0.04 * sin(al * 2.6 - t * 0.45);
    float v2 = (ac - c2) / 0.11;
    float i2 = exp(-v2 * v2 * 1.8) * 0.42;
    vec3 col1 = oilRamp(clamp(al * 0.9 + 0.32 + 0.08 * sin(t * 0.3), 0.0, 1.0));
    vec3 col2 = mix(LIME, TEAL, smoothstep(0.1, 0.9, al * 0.9 + 0.2));
    k = clamp(i1 + i2, 0.0, 1.0);
    return (col1 * i1 + col2 * i2) / max(i1 + i2, 1e-4);
  }
  vec3 field(vec2 p, float lod) {
    vec2 q = (p + uF2.xy) / uRes.x;
    float aspect = uRes.y / uRes.x;
    // pearl base: a soft radial light, cooler at the edges
    float r = length((q - vec2(0.5, 0.40 * aspect)) * vec2(1.0, 0.62));
    vec3 base = mix(vec3(0.988, 0.988, 0.980), vec3(0.878, 0.882, 0.898), smoothstep(0.05, 0.95, r));
    vec3 dbase = mix(vec3(0.060, 0.060, 0.072), vec3(0.020, 0.020, 0.026), smoothstep(0.0, 0.9, r));
    base = mix(base, dbase, uF.z);
    // flutes: every 30 px column flips the oil behind it a little, with a light and a dark line
    float rib = uF.y * (1.0 - clamp(lod / 3.0, 0.0, 1.0));
    float vm = smoothstep(0.02, 0.24, q.y / aspect) * (1.0 - smoothstep(0.70, 1.0, q.y / aspect) * 0.75);
    float f = fract((p.x + uF2.x) / 30.0);
    float flip = (f - 0.5) * -26.0 * rib * vm;
    float k;
    vec3 oc = oil((p + uF2.xy + vec2(flip, 0.0)) / uRes.x, k);
    float amt = uF.x * k * mix(0.62, 0.9, uF.z);
    vec3 col = mix(base, oc, amt);
    float hi = smoothstep(0.0, 0.05, f) * (1.0 - smoothstep(0.16, 0.26, f));
    float lo = smoothstep(0.5, 0.56, f) * (1.0 - smoothstep(0.68, 0.76, f));
    col += (hi * 0.05 - lo * 0.028) * rib * vm * mix(1.0, 0.5, uF.z);
    return col;
  }
  // a textured quad (premultiplied) and the soft contact shadow it casts below itself
  vec4 quad(sampler2D tx, int i, vec2 p, float lod, out float sh) {
    vec4 q = uTq[i]; vec2 cs = uTr[i];
    vec2 d = p - q.xy;
    d = vec2(cs.x * d.x + cs.y * d.y, -cs.y * d.x + cs.x * d.y);
    vec2 uv = d / q.zw + 0.5;
    vec4 o = uTo[i];
    vec4 c = vec4(0.0);
    sh = 0.0;
    if (uv.x > -0.05 && uv.x < 1.05 && uv.y > -0.05 && uv.y < 1.15) {
      sh = textureLod(tx, uv - vec2(0.0, 0.055), 5.5).a * o.z;
      if (uv.x > 0.0 && uv.x < 1.0 && uv.y > 0.0 && uv.y < 1.0) c = textureLod(tx, uv, max(o.y, lod));
    }
    return c;
  }
  vec3 scene(vec2 p, float lod) {
    vec3 col = field(p, lod);
    for (int i = 0; i < 3; i++) {
      if (i >= uTn) break;
      float sh;
      vec4 c = i == 0 ? quad(uTex0, 0, p, lod, sh) : i == 1 ? quad(uTex1, 1, p, lod, sh) : quad(uTex2, 2, p, lod, sh);
      float o = uTo[i].x;
      col *= 1.0 - sh * 0.26 * o;
      col = col * (1.0 - c.a * o) + c.rgb * o;
    }
    return col;
  }
  float sdRB(vec2 p, vec2 b, float r) { vec2 q = abs(p) - b + r; return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r; }
  float smin(float a, float b, float k) { if (k < 0.5) return min(a, b); float h = max(k - abs(a - b), 0.0) / k; return min(a, b) - h * h * k * 0.25; }
  float sdf(vec2 p) {
    float d = 1e5;
    for (int i = 0; i < 10; i++) {
      if (i >= uSn) break;
      vec4 s = uS[i];
      vec2 hb = max(s.zw * 0.5, vec2(0.01));
      float di = sdRB(p - s.xy, hb, min(uSr[i].x, min(hb.x, hb.y)));
      d = smin(d, di, uSr[i].y);
    }
    return d;
  }
  void main() {
    vec2 p = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y);
    vec3 col = scene(p, 0.0);
    if (uSn > 0) {
      float d = sdf(p);
      // soft drop shadow under the glass
      if (d < 220.0 && uG2.y > 0.0) {
        float ds = sdf(p - vec2(0.0, 34.0));
        float sh = (1.0 - smoothstep(-40.0, 120.0, ds)) * 0.085 * uG2.y * uG2.w;
        col *= 1.0 - sh * (1.0 - clamp(-d / 30.0, 0.0, 1.0) * 0.6);
      }
      if (d < 1.5) {
        float e = 1.0;
        vec2 g = vec2(sdf(p + vec2(e, 0.0)) - sdf(p - vec2(e, 0.0)), sdf(p + vec2(0.0, e)) - sdf(p - vec2(0.0, e)));
        vec2 n = g / max(length(g), 1e-5);                 // outward normal
        float depth = max(-d, 0.0);
        float B = uG2.z;
        float edge = clamp(1.0 - depth / B, 0.0, 1.0);
        float bend = edge * edge * (3.0 - 2.0 * edge);      // 1 at the rim, 0 past the bevel
        vec2 off = -n * bend * uG.x;
        off += -n * edge * uG3.y;                            // extra lensing (magnify toward the rim)
        float fr = uG.y;
        vec3 rc;
        float ch = uG.w * (0.6 + 1.4 * bend);
        rc.r = scene(p + off * (1.0 - 0.06 * ch), fr).r;
        rc.g = scene(p + off, fr).g;
        rc.b = scene(p + off * (1.0 + 0.10 * ch), fr).b;
        rc = mix(rc, vec3(1.0), uG.z);
        // light from the top left: a thin bright rim, a wider soft glow on the lit side, a faint one opposite
        vec2 L = normalize(vec2(-0.55, -0.83));
        float fc = dot(n, L);
        float line = exp(-depth / 1.6);
        float wide = exp(-depth / 16.0);
        float spec = line * (0.42 + 0.48 * max(fc, 0.0) + 0.3 * max(-fc, 0.0)) + wide * (0.30 * max(fc, 0.0) + 0.12 * max(-fc, 0.0));
        rc += spec * uG2.x;
        rc *= 1.0 - 0.05 * bend * max(-fc, 0.0);
        // a slow sheen sweeping across the glass
        float sp = dot(p, normalize(vec2(1.0, 0.55)));
        float sw = (sp - uG3.x) / 120.0;
        rc += exp(-sw * sw) * 0.16 * (0.4 + 0.6 * bend);
        float a = clamp(0.5 - d, 0.0, 1.0) * uG2.w;
        col = mix(col, rc, a);
      }
    }
    outC = vec4(clamp(col, 0.0, 1.0), 1.0);
  }`;

  let gl, prog, U = {}, texCache = new Map(), white;
  function compile(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error('LG shader: ' + gl.getShaderInfoLog(s));
    return s;
  }
  LG.init = function () {
    const cv = document.createElement('canvas');
    cv.id = 'lg';
    cv.width = W; cv.height = H;
    Object.assign(cv.style, { position: 'absolute', left: '0', top: '0', width: W + 'px', height: H + 'px' });
    $('#bg').after(cv);
    gl = cv.getContext('webgl2', { preserveDrawingBuffer: true, antialias: false, alpha: false, premultipliedAlpha: false });
    prog = gl.createProgram();
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VS));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error('LG link: ' + gl.getProgramInfoLog(prog));
    for (const n of ['uRes', 'uT', 'uF', 'uF2', 'uTex0', 'uTex1', 'uTex2', 'uTq', 'uTr', 'uTo', 'uTn', 'uS', 'uSr', 'uSn', 'uG', 'uG2', 'uG3']) U[n] = gl.getUniformLocation(prog, n);
    gl.bindVertexArray(gl.createVertexArray());
    white = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, white);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 0]));
  };
  function tex(img) {
    let t = texCache.get(img);
    if (t) return t;
    t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    texCache.set(img, t);
    return t;
  }
  LG.draw = function (t) {
    const F = LG.F, G = LG.G;
    gl.viewport(0, 0, W, H);
    gl.useProgram(prog);
    gl.uniform2f(U.uRes, W, H);
    gl.uniform1f(U.uT, t);
    gl.uniform4f(U.uF, F.oil, F.rib, F.dark, 0);
    gl.uniform4f(U.uF2, F.sx, F.sy, 0, 0);
    const T = LG.T.filter(q => q.o > 0.002).slice(0, 3);
    const tq = new Float32Array(12), tr = new Float32Array(6), to = new Float32Array(12);
    T.forEach((q, i) => {
      const ar = q.img.naturalWidth / q.img.naturalHeight;
      tq.set([q.x, q.y, q.h * ar, q.h], i * 4);
      const a = (q.rot || 0) * Math.PI / 180;
      tr.set([Math.cos(a), Math.sin(a)], i * 2);
      to.set([q.o, q.lod || 0, q.shadow ?? 0.6, 0], i * 4);
    });
    for (let i = 0; i < 3; i++) {
      gl.activeTexture(gl.TEXTURE0 + i);
      gl.bindTexture(gl.TEXTURE_2D, T[i] ? tex(T[i].img) : white);
      gl.uniform1i(U['uTex' + i], i);
    }
    gl.uniform4fv(U.uTq, tq); gl.uniform2fv(U.uTr, tr); gl.uniform4fv(U.uTo, to); gl.uniform1i(U.uTn, T.length);
    const S = LG.S.filter(s => s.w > 0.5 && s.h > 0.5).slice(0, 10);
    const sa = new Float32Array(40), sr = new Float32Array(20);
    S.forEach((s, i) => { sa.set([s.x, s.y, s.w, s.h], i * 4); sr.set([s.r ?? Math.min(s.w, s.h) / 2, s.k ?? 0], i * 2); });
    gl.uniform4fv(U.uS, sa); gl.uniform2fv(U.uSr, sr); gl.uniform1i(U.uSn, S.length);
    gl.uniform4f(U.uG, G.refr, G.frost, G.tint, G.chroma);
    gl.uniform4f(U.uG2, G.rim, G.shadow, G.bevel, G.op);
    gl.uniform2f(U.uG3, G.sheen, G.mag);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };
})();

// ------------------------------------------------------------------ CSS liquid glass for DOM pieces
// The rim of a w x h rounded rect bends what is behind it inward (an SVG displacement map made for
// that exact size, split per colour channel for chromatic edges), the middle is lightly frosted.
let LG_SVG = null, LG_N = 0;
function glassFilter(w, h, r, bevel = 40, scale = 70) {
  if (!LG_SVG) {
    LG_SVG = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    Object.assign(LG_SVG.style, { position: 'absolute', width: '0', height: '0' });
    document.body.appendChild(LG_SVG);
  }
  const cv = document.createElement('canvas');
  cv.width = w; cv.height = h;
  const cx = cv.getContext('2d'), im = cx.createImageData(w, h), d = im.data;
  const hb = [w / 2, h / 2];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const px = x + 0.5 - hb[0], py = y + 0.5 - hb[1];
      const qx = Math.abs(px) - hb[0] + r, qy = Math.abs(py) - hb[1] + r;
      const out = Math.hypot(Math.max(qx, 0), Math.max(qy, 0)), inn = Math.min(Math.max(qx, qy), 0);
      const sd = out + inn - r;                       // < 0 inside
      // outward normal of the rounded rect
      let nx, ny;
      if (qx > 0 && qy > 0) { const l = Math.hypot(qx, qy) || 1; nx = qx / l * Math.sign(px); ny = qy / l * Math.sign(py); }
      else if (qx > qy) { nx = Math.sign(px); ny = 0; } else { nx = 0; ny = Math.sign(py); }
      const e = clamp(1 - -sd / bevel), b = e * e * (3 - 2 * e);
      const k = (y * w + x) * 4;
      d[k] = 128 + (-nx * b) * 127;   // sample inward
      d[k + 1] = 128 + (-ny * b) * 127;
      d[k + 2] = 128; d[k + 3] = 255;
    }
  }
  cx.putImageData(im, 0, 0);
  const id = 'lgf' + LG_N++;
  const url = cv.toDataURL('image/png');
  // past the edge of the frame the backdrop is empty: fill it with pearl so the bent rim never pulls in
  // transparent pixels (they would split into a coloured line where the glass meets the frame edge)
  const ch = (c, s) => `<feDisplacementMap in="src" in2="m" scale="${s}" xChannelSelector="R" yChannelSelector="G" result="d${c}"/>
    <feColorMatrix in="d${c}" type="matrix" values="${c === 'r' ? '1 0 0 0 0' : '0 0 0 0 0'} ${c === 'g' ? '0 1 0 0 0' : '0 0 0 0 0'} ${c === 'b' ? '0 0 1 0 0' : '0 0 0 0 0'} 0 0 0 1 0" result="c${c}"/>`;
  LG_SVG.insertAdjacentHTML('beforeend', `<filter id="${id}" x="0" y="0" width="${w}" height="${h}" filterUnits="userSpaceOnUse" primitiveUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
    <feImage href="${url}" x="0" y="0" width="${w}" height="${h}" result="m" preserveAspectRatio="none"/>
    <feFlood flood-color="#efefec" result="pearl"/><feMerge result="src"><feMergeNode in="pearl"/><feMergeNode in="SourceGraphic"/></feMerge>
    ${ch('r', scale * 0.94)}${ch('g', scale)}${ch('b', scale * 1.1)}
    <feBlend in="cr" in2="cg" mode="screen" result="rg"/><feBlend in="rg" in2="cb" mode="screen"/></filter>`);
  return id;
}
// a DOM element in liquid glass: el gets the backdrop filter, a gradient rim and a soft shadow
function glassEl(parent, { w, h, r = Math.min(w, h) / 2, blur = 6, bevel = 36, scale = 60, tint = 0.16, cls = '' }) {
  const el = document.createElement('div');
  el.className = 'lgc ' + cls;
  const id = glassFilter(w, h, r, bevel, scale);
  Object.assign(el.style, {
    width: w + 'px', height: h + 'px', borderRadius: r + 'px',
    backdropFilter: `url(#${id}) blur(${blur}px) saturate(1.5) brightness(1.04)`,
    background: `linear-gradient(180deg, rgba(255,255,255,${tint + 0.08}), rgba(255,255,255,${tint * 0.6}))`,
  });
  el.innerHTML = '<div class="lgc-rim"></div><div class="lgc-in"></div>';
  (parent.el || parent).appendChild(el);
  el.inner = el.lastChild;
  return el;
}
