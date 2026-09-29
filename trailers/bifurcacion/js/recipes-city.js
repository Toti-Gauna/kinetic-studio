/* ============================================================================
   CITY MODULE — a papercraft city diorama (needs recipes-3d.js + Three.js r147).

   One shared, procedurally laid-out city on a paper card: a 7×7 block grid,
   ~250 pastel buildings (windows are procedural, injected into the standard
   material → lit at night), roofs, trees, street lamps, 60 cars, real soft
   sun shadows, a blueprint overlay, pop-up paper title letters, and a two-pass
   tilt-shift (miniature) post effect. Every shot sets the whole city state from
   its local time → exact seeking.
   Recipes: blueprint, citybuild, traffic, daynight, citytitle (in this order).
   ========================================================================== */
(() => {
  'use strict';
  const { recipe } = Trailer;
  const TK = () => {
    if (!Trailer.three) throw new Error('recipes-city needs recipes-3d.js (and Three.js r147) loaded before it');
    return Trailer.three;
  };
  const TAU = Math.PI * 2;
  const GRID = 7, BLOCK = 110, ROAD = 34, P = BLOCK + ROAD, HALF = (GRID * P - ROAD) / 2;
  const roadC = k => -HALF - ROAD / 2 + k * P;           // road centre lines, k = 0..GRID (perimeter included)
  const RL = 2 * HALF + 2 * ROAD;                         // road length, edge to edge
  const CX0 = -580, CX1 = 580, CZ0 = -580, CZ1 = 940;    // the paper card (front margin holds the title)
  const CW = CX1 - CX0, CD = CZ1 - CZ0, CZM = (CZ0 + CZ1) / 2;
  const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

  let CITY = null;
  function city(D, o = {}) {
    if (CITY) return CITY;
    const { x3, hash, clamp01, E, NOISE } = TK();
    const S = x3(D), T3 = S.T3;
    const eBack = E('back.out(1.6)'), ePop = E('back.out(2.4)');

    // ---- renderer: soft sun shadows for the whole diorama
    S.renderer.shadowMap.enabled = true;
    S.renderer.shadowMap.type = T3.PCFSoftShadowMap;
    S.sun.castShadow = true;
    const shc = S.sun.shadow;
    shc.mapSize.set(2048, 2048);
    Object.assign(shc.camera, { left: -1000, right: 1000, top: 1000, bottom: -1000, near: 10, far: 4000 });
    shc.camera.updateProjectionMatrix();
    shc.bias = -0.0006;
    shc.normalBias = 0.6;

    // ---- layout
    const pal = o.buildings || ['#f6d6c3', '#f4b69c', '#fbe3a1', '#bfe0d4', '#c9d7f2', '#e3cdea', '#f8efe2', '#ffd08a', '#9fc9ea'];
    const accent = o.accent || '#f97316';
    const blds = [], roofs = [], trees = [], parks = [];
    for (let bi = 0; bi < GRID; bi++) for (let bj = 0; bj < GRID; bj++) {
      const x0 = -HALF + bi * P, z0 = -HALF + bj * P, id = bi * GRID + bj;
      const dist = Math.hypot(x0 + BLOCK / 2, z0 + BLOCK / 2);
      if (hash(id, 1) < 0.12 && dist > 170) {
        parks.push([x0, z0]);
        for (let k = 0; k < 16; k++) {
          const tx = x0 + 16 + (k % 4) * 26 + (hash(id * 31 + k, 2) - 0.5) * 10, tz = z0 + 16 + Math.floor(k / 4) * 26 + (hash(id * 31 + k, 3) - 0.5) * 10;
          trees.push({ x: tx, z: tz, s: 7 + hash(id * 31 + k, 4) * 6, d: Math.hypot(tx, tz) });
        }
        continue;
      }
      const r = hash(id, 2), lots = r < 0.1 ? [[0, 0, 1, 1]] : r < 0.36 ? (hash(id, 3) < 0.5 ? [[0, 0, 0.5, 1], [0.5, 0, 0.5, 1]] : [[0, 0, 1, 0.5], [0, 0.5, 1, 0.5]])
        : [[0, 0, 0.5, 0.5], [0.5, 0, 0.5, 0.5], [0, 0.5, 0.5, 0.5], [0.5, 0.5, 0.5, 0.5]];
      lots.forEach(([u, v, w, d], k) => {
        const q = id * 13 + k, bw = BLOCK * w - 10, bd = BLOCK * d - 10;
        const x = x0 + BLOCK * (u + w / 2), z = z0 + BLOCK * (v + d / 2), dd = Math.hypot(x, z);
        const centre = Math.exp(-Math.pow(dd / 300, 2));
        const h = 14 + hash(q, 5) * 30 + centre * (40 + hash(q, 6) * 150);
        const color = hash(q, 7) < 0.06 ? accent : pal[Math.floor(hash(q, 8) * pal.length)];
        blds.push({ x, z, w: bw, d: bd, h, color, delay: 0.1 + (dd / 700) * 2.7 + hash(q, 9) * 0.3 });
        if (h > 60 && hash(q, 10) < 0.6) roofs.push({ b: blds.length - 1, w: bw * 0.32, d: bd * 0.32, h: 6 + hash(q, 11) * 6, ox: (hash(q, 12) - 0.5) * bw * 0.3, oz: (hash(q, 13) - 0.5) * bd * 0.3 });
      });
    }
    for (let k = 1; k < GRID; k++) for (let m = 0; m < GRID * 3; m++) { // street trees along the sidewalks
      if (hash(k * 97 + m, 21) > 0.32) continue;
      const along = -HALF + m * (2 * HALF / (GRID * 3)) + 12, side = hash(k * 97 + m, 22) < 0.5 ? -1 : 1, horiz = hash(k * 97 + m, 23) < 0.5;
      const x = horiz ? along : roadC(k) + side * 14, z = horiz ? roadC(k) + side * 14 : along;
      trees.push({ x, z, s: 5 + hash(k * 97 + m, 24) * 3, d: Math.hypot(x, z) });
    }
    trees.forEach((t, i) => { t.delay = 2.0 + (t.d / 700) * 1.4 + hash(i, 25) * 0.3; });
    const lamps = [];
    for (let a = 1; a < GRID; a++) for (let b = 1; b < GRID; b++) lamps.push({ x: roadC(a) + 14, z: roadC(b) + 14, k: hash(a * 7 + b, 31) });
    const cars = Array.from({ length: o.cars || 60 }, (_, i) => ({
      axis: i % 2, k: Math.floor(hash(i, 41) * (GRID + 1)), dir: hash(i, 42) < 0.5 ? 1 : -1,
      speed: 45 + hash(i, 43) * 35, phase: hash(i, 44) * RL, color: ['#e85d4a', '#3f7cf0', '#f6c343', '#ffffff', '#2c3446', '#6fcf97', accent][Math.floor(hash(i, 45) * 7)],
    }));

    // ---- paper ground + blueprint textures
    const TW = 2048, s = TW / CW, TH = Math.round(CD * s);
    const px = x => (x - CX0) * s, pz = z => (z - CZ0) * s;
    const paper = document.createElement('canvas');
    paper.width = TW; paper.height = TH;
    const g = paper.getContext('2d');
    g.fillStyle = '#f3ebdd'; g.fillRect(0, 0, TW, TH);
    for (let bi = 0; bi < GRID; bi++) for (let bj = 0; bj < GRID; bj++) {
      const x0 = -HALF + bi * P, z0 = -HALF + bj * P, park = parks.some(p => p[0] === x0 && p[1] === z0);
      g.fillStyle = park ? '#b9d7a1' : '#ecdfca';
      g.fillRect(px(x0), pz(z0), BLOCK * s, BLOCK * s);
    }
    const band = (c, w) => { const a = c - w / 2; return [a, w]; };
    for (const pass of ['walk', 'asphalt']) for (let k = 0; k <= GRID; k++) {
      const w = pass === 'walk' ? ROAD : ROAD - 12, [a, ww] = band(roadC(k), w);
      g.fillStyle = pass === 'walk' ? '#d7cebe' : '#48505f';
      g.fillRect(px(-HALF - ROAD), pz(a), RL * s, ww * s);
      g.fillRect(px(a), pz(-HALF - ROAD), ww * s, RL * s);
    }
    g.strokeStyle = '#f2c14e'; g.lineWidth = 1.3 * s; g.setLineDash([9 * s, 9 * s]);
    for (let k = 0; k <= GRID; k++) {
      g.beginPath(); g.moveTo(px(-HALF - ROAD), pz(roadC(k))); g.lineTo(px(HALF + ROAD), pz(roadC(k))); g.stroke();
      g.beginPath(); g.moveTo(px(roadC(k)), pz(-HALF - ROAD)); g.lineTo(px(roadC(k)), pz(HALF + ROAD)); g.stroke();
    }
    g.setLineDash([]);
    g.fillStyle = 'rgba(255,255,255,0.85)';
    for (let a = 0; a <= GRID; a++) for (let b = 0; b <= GRID; b++) for (let q = -2; q <= 2; q++) {
      g.fillRect(px(roadC(a) + q * 4.4 - 1.4), pz(roadC(b) - ROAD / 2 - 9), 2.8 * s, 7 * s);
      g.fillRect(px(roadC(a) + ROAD / 2 + 2), pz(roadC(b) + q * 4.4 - 1.4), 7 * s, 2.8 * s);
    }
    g.fillStyle = 'rgba(40,40,50,0.45)';
    g.font = `500 ${Math.round(11 * s)}px "${D.cfg.fonts.mono}"`;
    g.fillText(o.sheet || 'PAPER CITY · HOJA 01 · ESC 1:1000', px(CX0 + 24), pz(CZ1 - 22));

    const blue = document.createElement('canvas');
    blue.width = TW; blue.height = TH;
    const b2 = blue.getContext('2d');
    b2.strokeStyle = 'rgba(255,255,255,0.13)'; b2.lineWidth = 1;
    for (let x = CX0; x <= CX1; x += 20) { b2.beginPath(); b2.moveTo(px(x), 0); b2.lineTo(px(x), TH); b2.stroke(); }
    for (let z = CZ0; z <= CZ1; z += 20) { b2.beginPath(); b2.moveTo(0, pz(z)); b2.lineTo(TW, pz(z)); b2.stroke(); }
    b2.strokeStyle = 'rgba(255,255,255,0.95)'; b2.lineWidth = 2.4;
    for (let bi = 0; bi < GRID; bi++) for (let bj = 0; bj < GRID; bj++) b2.strokeRect(px(-HALF + bi * P), pz(-HALF + bj * P), BLOCK * s, BLOCK * s);
    b2.lineWidth = 1.6; b2.strokeStyle = 'rgba(255,255,255,0.75)';
    blds.forEach(b => {
      b2.strokeRect(px(b.x - b.w / 2), pz(b.z - b.d / 2), b.w * s, b.d * s);
      b2.save(); b2.globalAlpha = 0.3; b2.beginPath();
      b2.moveTo(px(b.x - b.w / 2), pz(b.z - b.d / 2)); b2.lineTo(px(b.x + b.w / 2), pz(b.z + b.d / 2)); b2.stroke(); b2.restore();
    });
    b2.strokeStyle = 'rgba(255,255,255,0.6)';
    trees.forEach(t => { b2.beginPath(); b2.arc(px(t.x), pz(t.z), t.s * 0.9 * s, 0, TAU); b2.stroke(); });
    b2.fillStyle = 'rgba(255,255,255,0.9)';
    b2.font = `500 ${Math.round(12 * s)}px "${D.cfg.fonts.mono}"`;
    b2.fillText('PLANO GENERAL · ESC 1:1000', px(-HALF), pz(-HALF - ROAD - 16));
    b2.fillText(`${Math.round(RL)} M`, px(-20), pz(HALF + ROAD + 26));
    b2.strokeRect(px(CX1 - 250), pz(CZ1 - 120), 220 * s, 90 * s);
    b2.font = `500 ${Math.round(10 * s)}px "${D.cfg.fonts.mono}"`;
    ['PAPER CITY', 'PLANO 01 / 01', 'KINETIC STUDIO'].forEach((l, i) => b2.fillText(l, px(CX1 - 236), pz(CZ1 - 96 + i * 24)));

    // ---- geometry
    const gCity = new T3.Group(), gBlue = new T3.Group(), gTitle = new T3.Group();
    const paperTex = new T3.CanvasTexture(paper);
    paperTex.anisotropy = S.renderer.capabilities.getMaxAnisotropy();
    const ground = new T3.Mesh(new T3.PlaneGeometry(CW, CD).rotateX(-Math.PI / 2), new T3.MeshStandardMaterial({ map: paperTex, roughness: 0.95 }));
    ground.position.set(0, 0, CZM);
    ground.receiveShadow = true;
    const slab = new T3.Mesh(new T3.BoxGeometry(CW, 10, CD), new T3.MeshStandardMaterial({ color: 0xe6dccb, roughness: 1 }));
    slab.position.set(0, -5.1, CZM);
    slab.receiveShadow = true;
    gCity.add(ground, slab);

    const U = { uNight: { value: 0 } };
    const bMat = new T3.MeshStandardMaterial({ color: 0xffffff, roughness: 0.92, metalness: 0 });
    bMat.onBeforeCompile = sh => {
      sh.uniforms.uNight = U.uNight;
      sh.vertexShader = sh.vertexShader
        .replace('#include <common>', '#include <common>\nvarying vec3 vCWP; varying vec3 vCWN;')
        .replace('#include <worldpos_vertex>', `#include <worldpos_vertex>
  vec4 cwp = vec4(transformed, 1.0);
  vec3 cwn = objectNormal;
  #ifdef USE_INSTANCING
    cwp = instanceMatrix * cwp;
    cwn = mat3(instanceMatrix) * cwn;
  #endif
  vCWP = (modelMatrix * cwp).xyz;
  vCWN = normalize(mat3(modelMatrix) * cwn);`);
      sh.fragmentShader = sh.fragmentShader
        .replace('#include <common>', '#include <common>\nuniform float uNight; varying vec3 vCWP; varying vec3 vCWN;\nfloat chash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }')
        .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
  {
    float side = 1.0 - step(0.5, abs(vCWN.y));
    float hc = dot(vCWP.xz, vec2(abs(vCWN.z), abs(vCWN.x)));
    vec2 cell = vec2(hc / 8.0, vCWP.y / 10.0);
    vec2 fw = fract(cell);
    float win = side * step(0.2, fw.x) * step(fw.x, 0.8) * step(0.3, fw.y) * step(fw.y, 0.82) * step(6.0, vCWP.y);
    diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * vec3(0.42, 0.5, 0.62), win * 0.85);
    float on = step(1.0 - uNight * 0.8, chash(floor(cell) + vec2(sign(vCWN.x) * 17.0, sign(vCWN.z) * 31.0)));
    totalEmissiveRadiance += vec3(1.0, 0.72, 0.38) * win * on * smoothstep(0.35, 0.8, uNight) * 1.5;
  }`);
    };
    const unitBox = new T3.BoxGeometry(1, 1, 1).translate(0, 0.5, 0);
    const bld = new T3.InstancedMesh(unitBox, bMat, blds.length);
    const col = new T3.Color();
    blds.forEach((b, i) => bld.setColorAt(i, col.set(b.color)));
    bld.castShadow = bld.receiveShadow = true;
    const roof = new T3.InstancedMesh(unitBox, new T3.MeshStandardMaterial({ color: 0xd9d2c6, roughness: 0.9 }), Math.max(1, roofs.length));
    roof.castShadow = roof.receiveShadow = true;
    const crown = new T3.InstancedMesh(new T3.ConeGeometry(1, 2.4, 7).translate(0, 1.7, 0), new T3.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9, flatShading: true }), trees.length);
    const trunk = new T3.InstancedMesh(new T3.CylinderGeometry(0.16, 0.22, 0.6, 5).translate(0, 0.3, 0), new T3.MeshStandardMaterial({ color: 0x8a6a52, roughness: 1 }), trees.length);
    const greens = ['#7fb77e', '#5f9e6e', '#9ccc7a', '#4d8c5a', '#a8d08d'];
    trees.forEach((t, i) => crown.setColorAt(i, col.set(greens[Math.floor(hash(i, 26) * greens.length)])));
    crown.castShadow = trunk.castShadow = true;
    const pole = new T3.InstancedMesh(new T3.BoxGeometry(1.2, 16, 1.2).translate(0, 8, 0), new T3.MeshStandardMaterial({ color: 0x5b6270, roughness: 0.7 }), lamps.length);
    const bulb = new T3.InstancedMesh(new T3.SphereGeometry(2.3, 10, 8), new T3.MeshBasicMaterial({ color: 0xffffff }), lamps.length);
    const body = new T3.InstancedMesh(new T3.BoxGeometry(15, 5, 7.5).translate(0, 3.5, 0), new T3.MeshStandardMaterial({ color: 0xffffff, roughness: 0.55 }), cars.length);
    const cabin = new T3.InstancedMesh(new T3.BoxGeometry(7.5, 4.2, 6.6).translate(-1, 8.1, 0), new T3.MeshStandardMaterial({ color: 0xdfe8f2, roughness: 0.35 }), cars.length);
    const head = new T3.InstancedMesh(new T3.BoxGeometry(0.8, 1.6, 6).translate(7.7, 4.2, 0), new T3.MeshBasicMaterial({ color: 0xffffff }), cars.length);
    const tail = new T3.InstancedMesh(new T3.BoxGeometry(0.8, 1.6, 6).translate(-7.7, 4.2, 0), new T3.MeshBasicMaterial({ color: 0xffffff }), cars.length);
    cars.forEach((c, i) => { body.setColorAt(i, col.set(c.color)); head.setColorAt(i, col.setRGB(0, 0, 0)); tail.setColorAt(i, col.setRGB(0, 0, 0)); });
    body.castShadow = cabin.castShadow = true;
    lamps.forEach((l, i) => bulb.setColorAt(i, col.setRGB(0, 0, 0)));
    const M = new T3.Matrix4(), Q = new T3.Quaternion(), V = new T3.Vector3(), SC = new T3.Vector3(), Y = new T3.Vector3(0, 1, 0);
    lamps.forEach((l, i) => { pole.setMatrixAt(i, M.compose(V.set(l.x, 0, l.z), Q.identity(), SC.set(1, 1, 1))); bulb.setMatrixAt(i, M.compose(V.set(l.x, 17, l.z), Q, SC)); });
    gCity.add(bld, roof, crown, trunk, pole, bulb, body, cabin, head, tail);

    // blueprint overlay (drawn radially, then dissolved to reveal the paper)
    const blueTex = new T3.CanvasTexture(blue);
    const bpMat = new T3.ShaderMaterial({
      uniforms: { uMap: { value: blueTex }, uDraw: { value: 0 }, uFade: { value: 0 }, uBlue: { value: new T3.Color(o.blueprint || '#1d4e9e') } },
      vertexShader: 'varying vec2 vUv; varying vec3 vW; void main() { vUv = uv; vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }',
      fragmentShader: `uniform sampler2D uMap; uniform float uDraw, uFade; uniform vec3 uBlue; varying vec2 vUv; varying vec3 vW;
${NOISE}
void main() {
  float r = length(vW.xz) / 600.0, n = n3(vec3(vW.xz * 0.012, 1.7));
  float rr = r + (n - 0.5) * 0.35;
  float drawn = 1.0 - smoothstep(uDraw * 2.1 - 0.06, uDraw * 2.1, rr);
  float line = texture2D(uMap, vUv).a * drawn;
  vec3 c = uBlue * (0.9 + 0.12 * n) + vec3(0.85, 0.93, 1.0) * line;
  float F = uFade * 2.2 - 0.1;
  float a = smoothstep(F - 0.03, F + 0.01, rr);
  float edge = smoothstep(F - 0.03, F, rr) - smoothstep(F, F + 0.05, rr);
  gl_FragColor = vec4(c + vec3(1.0, 0.95, 0.85) * edge * 0.8, a);
}`,
      transparent: true, depthWrite: false, fog: false,
    });
    const bp = new T3.Mesh(new T3.PlaneGeometry(CW, CD).rotateX(-Math.PI / 2), bpMat);
    bp.position.set(0, 0.8, CZM);
    bp.renderOrder = 5;
    gBlue.add(bp);

    // pop-up paper title letters (hinged at the bottom, lying flat toward the city)
    const letters = [];
    function makeTitle(word, colors) {
      if (letters.length) return;
      const FS = 360, meas = document.createElement('canvas').getContext('2d');
      meas.font = `900 ${FS}px "${D.cfg.fonts.display}"`;
      const adv = [...word].map(ch => meas.measureText(ch).width + FS * 0.05);
      const total = adv.reduce((a, b) => a + b, 0), k = Math.min(150 / (0.72 * FS), 980 / total);
      let x = -total * k / 2, ci = 0;
      [...word].forEach((ch, i) => {
        const w = adv[i];
        if (ch !== ' ') {
          const c = document.createElement('canvas');
          c.width = Math.ceil(w + 40); c.height = Math.ceil(FS * 0.82);
          const cx = c.getContext('2d');
          cx.font = `900 ${FS}px "${D.cfg.fonts.display}"`;
          cx.fillStyle = '#fff'; cx.textBaseline = 'alphabetic'; cx.textAlign = 'center';
          cx.fillText(ch, c.width / 2, c.height - 8);
          const tex = new T3.CanvasTexture(c);
          const pw = c.width * k, ph = c.height * k;
          const mat = new T3.MeshStandardMaterial({ map: tex, alphaTest: 0.5, side: T3.DoubleSide, color: new T3.Color(colors[ci % colors.length]), roughness: 0.85, emissive: new T3.Color('#ffb36b'), emissiveMap: tex, emissiveIntensity: 0 });
          const mesh = new T3.Mesh(new T3.PlaneGeometry(pw, ph).translate(0, ph / 2, 0), mat);
          mesh.customDepthMaterial = new T3.MeshDepthMaterial({ depthPacking: T3.RGBADepthPacking, map: tex, alphaTest: 0.5 });
          mesh.castShadow = true;
          mesh.position.set(x + (w * k) / 2, 0.5, 720);
          gTitle.add(mesh);
          letters.push(mesh);
        } else ci++;
        x += w * k;
      });
    }

    // ---- state setters (all pure functions of their inputs)
    function setBuild(bt) {
      blds.forEach((b, i) => {
        const p = bt < 0 ? 0 : eBack(clamp01((bt - b.delay) / 0.55));
        bld.setMatrixAt(i, M.compose(V.set(b.x, 0, b.z), Q.identity(), p > 0 ? SC.set(b.w, Math.max(0.001, b.h * p), b.d) : SC.set(0.0001, 0.0001, 0.0001)));
      });
      bld.instanceMatrix.needsUpdate = true;
      roofs.forEach((r, i) => {
        const b = blds[r.b], p = bt < 0 ? 0 : ePop(clamp01((bt - b.delay - 0.45) / 0.35));
        roof.setMatrixAt(i, M.compose(V.set(b.x + r.ox, b.h * 0.999, b.z + r.oz), Q.identity(), SC.set(Math.max(0.001, r.w * p), Math.max(0.001, r.h * p), Math.max(0.001, r.d * p))));
      });
      roof.instanceMatrix.needsUpdate = true;
      trees.forEach((t, i) => {
        const p = bt < 0 ? 0 : ePop(clamp01((bt - t.delay) / 0.4)), sc = Math.max(0.001, t.s * p);
        crown.setMatrixAt(i, M.compose(V.set(t.x, 0, t.z), Q.identity(), SC.set(sc, sc, sc)));
        trunk.setMatrixAt(i, M.compose(V, Q, SC.set(sc * 1.4, sc * 2.2, sc * 1.4)));
      });
      crown.instanceMatrix.needsUpdate = trunk.instanceMatrix.needsUpdate = true;
      const lp = bt < 0 ? 0 : ePop(clamp01((bt - 2.4) / 0.5));
      lamps.forEach((l, i) => { pole.setMatrixAt(i, M.compose(V.set(l.x, 0, l.z), Q.identity(), SC.set(1, Math.max(0.001, lp), 1))); bulb.setMatrixAt(i, M.compose(V.set(l.x, 17 * lp, l.z), Q, SC.set(lp || 0.001, lp || 0.001, lp || 0.001))); });
      pole.instanceMatrix.needsUpdate = bulb.instanceMatrix.needsUpdate = true;
    }
    function setCars(t, vis, n) {
      cars.forEach((c, i) => {
        const along = (((c.phase + c.speed * t) % RL) + RL) % RL, sPos = c.dir > 0 ? -RL / 2 + along : RL / 2 - along;
        const fade = vis * sm(0, 40, Math.min(sPos + RL / 2, RL / 2 - sPos)), lane = 5.5 * c.dir;
        if (c.axis === 0) { V.set(sPos, 0, roadC(c.k) + lane); Q.setFromAxisAngle(Y, c.dir > 0 ? 0 : Math.PI); }
        else { V.set(roadC(c.k) - lane, 0, sPos); Q.setFromAxisAngle(Y, c.dir > 0 ? -Math.PI / 2 : Math.PI / 2); }
        const f = Math.max(0.001, fade);
        M.compose(V, Q, SC.set(f, f, f));
        body.setMatrixAt(i, M); cabin.setMatrixAt(i, M); head.setMatrixAt(i, M); tail.setMatrixAt(i, M);
        const L = sm(0.4, 0.7, n);
        head.setColorAt(i, col.setRGB(1, 0.92, 0.7).multiplyScalar(0.15 + 2.4 * L));
        tail.setColorAt(i, col.setRGB(1, 0.12, 0.08).multiplyScalar(0.15 + 1.8 * L));
      });
      [body, cabin, head, tail].forEach(m => { m.instanceMatrix.needsUpdate = true; });
      head.instanceColor.needsUpdate = tail.instanceColor.needsUpdate = true;
    }
    function setNight(n) {
      U.uNight.value = n;
      lamps.forEach((l, i) => bulb.setColorAt(i, col.setRGB(1, 0.8, 0.5).multiplyScalar(0.12 + 2.6 * sm(0.5 + l.k * 0.2, 0.62 + l.k * 0.2, n))));
      bulb.instanceColor.needsUpdate = true;
      letters.forEach(m => { m.material.emissiveIntensity = 0.42 * sm(0.6, 1, n); });
    }
    function setBlueprint(draw, fade) { bpMat.uniforms.uDraw.value = draw; bpMat.uniforms.uFade.value = fade; }
    function setTitle(tt) {
      letters.forEach((m, i) => { m.rotation.x = -Math.PI / 2 * (1 - (tt < 0 ? 0 : eBack(clamp01((tt - i * 0.11) / 0.7)))); });
    }
    const sky = [[0, '#efe3cf'], [0.45, '#f2b27f'], [0.72, '#5c4f86'], [1, '#0f1730']].map(([k, c]) => [k, new T3.Color(c)]);
    const skyAt = (n, out) => { for (let i = 0; i < sky.length - 1; i++) if (n <= sky[i + 1][0]) return out.copy(sky[i][1]).lerp(sky[i + 1][1], (n - sky[i][0]) / (sky[i + 1][0] - sky[i][0])); return out.copy(sky[sky.length - 1][1]); };
    const warm = new T3.Color('#fff2dc'), dusk = new T3.Color('#ffae6b'), moon = new T3.Color('#8fa8ff'), ambDay = new T3.Color('#ffffff'), ambNight = new T3.Color('#5d6fd6');
    function light(n, az, el) {
      skyAt(n, S.clear);
      S.stars.visible = false;
      S.sun.position.set(Math.cos(el) * Math.sin(az), Math.sin(el), Math.cos(el) * Math.cos(az)).multiplyScalar(1400);
      S.sun.color.copy(warm).lerp(dusk, sm(0.15, 0.55, n));
      S.sun.intensity = 0.95 * (1 - sm(0.45, 0.78, n)) * sm(-0.05, 0.25, el);
      S.amb.color.copy(ambDay).lerp(ambNight, n);
      S.amb.intensity = 0.44 - 0.18 * n;
      S.rim.color.copy(moon); S.rim.position.set(-0.5, 0.8, -0.4).multiplyScalar(1000); S.rim.intensity = 0.35 * sm(0.5, 1, n);
      S.bloom.strength = 0.2 + 0.9 * n; S.bloom.radius = 0.5; S.bloom.threshold = 0.92 - 0.52 * n;
    }
    // two-pass tilt-shift (miniature look) + a saturation lift
    const tsShader = dir => ({
      uniforms: { tDiffuse: { value: null }, uDir: { value: new T3.Vector2(...dir) }, uRes: { value: new T3.Vector2(1920, 1080) }, uFocus: { value: 0.5 }, uBand: { value: 0.1 }, uAmount: { value: 12 }, uSat: { value: 0 } },
      vertexShader: 'varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: `uniform sampler2D tDiffuse; uniform vec2 uDir, uRes; uniform float uFocus, uBand, uAmount, uSat; varying vec2 vUv;
void main() {
  float d = clamp((abs(vUv.y - uFocus) - uBand) / (0.5 - uBand), 0.0, 1.0);
  vec2 st = uDir / uRes * d * uAmount;
  vec4 c = texture2D(tDiffuse, vUv) * 0.227027;
  c += (texture2D(tDiffuse, vUv + st * 1.3846) + texture2D(tDiffuse, vUv - st * 1.3846)) * 0.3162162;
  c += (texture2D(tDiffuse, vUv + st * 3.2307) + texture2D(tDiffuse, vUv - st * 3.2307)) * 0.0702702;
  float l = dot(c.rgb, vec3(0.299, 0.587, 0.114));
  c.rgb = mix(vec3(l), c.rgb, 1.0 + uSat);
  gl_FragColor = c;
}`,
    });
    const tsH = S.addFx(new T3.ShaderPass(tsShader([1, 0]))), tsV = S.addFx(new T3.ShaderPass(tsShader([0, 1])));
    function tilt(amount, focus = 0.5, bandW = 0.1, sat = 0.25) {
      const w = S.renderer.domElement.width, h = S.renderer.domElement.height;
      [tsH, tsV].forEach((p, i) => {
        p.enabled = amount > 0;
        p.uniforms.uRes.value.set(w, h);
        p.uniforms.uAmount.value = amount * (h / 1080);
        p.uniforms.uFocus.value = focus; p.uniforms.uBand.value = bandW;
        p.uniforms.uSat.value = i ? sat : 0;
      });
    }
    function view(target, az, el, dist, fov) {
      S.cam.fov = fov;
      S.cam.position.set(target[0] + Math.cos(el) * Math.sin(az) * dist, target[1] + Math.sin(el) * dist, target[2] + Math.cos(el) * Math.cos(az) * dist);
      S.cam.lookAt(target[0], target[1], target[2]);
    }

    CITY = { S, T3, gCity, gBlue, gTitle, blds, trees, cars, setBuild, setCars, setNight, setBlueprint, setTitle, makeTitle, light, tilt, view, roadC };
    return CITY;
  }

  // shared copy (ink on paper by day, paper at night)
  function copy(D, name, lines, color, y0 = 470) {
    const s = D.scene(name, lines.map((l, i) => `<div class="pc-big v c" style="top:${y0 + i * 150}px;color:${color}">${l}</div>`).join('') + `<div class="pc-cap mono" style="color:${color}"></div>`);
    const els = D.$$('.pc-big', s);
    els.forEach(el => D.fit(el, 1650));
    return { s, els, cap: D.$('.pc-cap', s) };
  }
  const lerp = (a, b, t) => a + (b - a) * t;
  const lerp3 = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);

  // ------------------------------------------------------------------ BLUEPRINT
  // Top-down over a blueprint that draws itself outward from the centre (grid,
  // blocks, lots, trees, a title block), then dissolves to reveal the paper.   6 s
  recipe('blueprint', (D, T, o) => {
    const { tl, C, N } = D;
    const Ct = city(D, o), { E, clamp01, rise, caption } = TK(), eIO = E('sine.inOut');
    const dur = o.duration || 6, blueBg = new Ct.T3.Color(o.table || '#0f2c5c'), paperBg = new Ct.T3.Color('#efe3cf');
    TK().shot(D, T, dur, [Ct.gCity, Ct.gBlue], lt => {
      const draw = eIO(clamp01((lt - 0.3) / 3.3)), fade = eIO(clamp01((lt - 4.3) / 1.6));
      Ct.setBlueprint(draw, fade); Ct.setBuild(-1); Ct.setCars(0, 0, 0); Ct.setNight(0); Ct.setTitle(-1);
      Ct.light(0, 2.3, 0.75);
      Ct.S.clear.copy(blueBg).lerp(paperBg, fade);
      const tilt = eIO(clamp01((lt - 4.1) / 1.9));
      Ct.view([0, 0, 0], -0.14 + 0.22 * (lt / dur), lerp(1.553, 1.22, tilt), 2050 - 140 * (lt / dur), 30);
      Ct.S.bloom.threshold = 0.97;
    });
    const c = copy(D, 'blueprint', o.lines || ['TODA CIUDAD', 'EMPIEZA EN UN PAPEL.'], C.paper);
    D.show(c.s, T);
    D.setBg(C.night, T);
    D.ink(C.paper, T);
    tl.set(D.bars, { height: 540 }, T);
    D.barsTo(110, T + 0.05, 1.6);
    if (o.label) D.label(T + 0.8, o.label);
    c.els.forEach((el, i) => rise(D, el, T + 1.0 + i * 0.35, T + 4.1));
    caption(D, c.cap, o.caption || 'PLANO GENERAL · ESCALA 1:1000', T + 0.6, T + 4.2);
    D.call(() => SFX.pad('plan', [110, 164.81, 220], 2, 0.03, 700), T + 0.02);
    for (let k = 0; k < 22; k++) D.sfx('key', T + 0.35 + k * 0.15, 0.05);
    D.sfx('bell', T + 1.0, N.E5, 0.06);
    D.sfx('bell', T + 1.35, N.A5, 0.05);
    D.sfx('whoosh', T + 4.3, 1.6, 0.3);
    D.hide(c.s, T + dur);
    return dur;
  });

  // ------------------------------------------------------------------ CITYBUILD
  // The camera tilts down to an isometric view while ~250 buildings rise floor by
  // floor in a ripple from the centre, then roofs, trees, lamps and cars.   7.5 s
  recipe('citybuild', (D, T, o) => {
    const { tl, C, N } = D;
    const Ct = city(D, o), { E, clamp01, rise } = TK(), eX = E('expo.inOut'), eP = E('power2.inOut');
    const dur = o.duration || 7.5, NB = Ct.blds.length;
    const c = copy(D, 'citybuild', o.lines || ['BLOQUE', 'A BLOQUE.'], C.ink);
    TK().shot(D, T, dur, [Ct.gCity], lt => {
      const bt = lt - 0.3;
      Ct.setBuild(bt); Ct.setCars(T + lt, clamp01((lt - 5.4) / 0.9), 0); Ct.setNight(0); Ct.setTitle(-1);
      Ct.light(0, 2.3, 0.75);
      const a = eX(clamp01(lt / 2.6)), b = eP(clamp01(lt / 3));
      Ct.view([0, 30 * b, 0], lerp(0.08, 0.79, b) + 0.22 * clamp01((lt - 3) / (dur - 3)), lerp(1.22, 0.62, a), lerp(1910, 3050, b), lerp(30, 22, a));
      let up = 0;
      for (const bd of Ct.blds) if (bt >= bd.delay + 0.55) up++;
      c.cap.textContent = `${o.counter || 'EDIFICIOS'} ${String(up).padStart(3, '0')} / ${NB}`;
    });
    D.show(c.s, T);
    if (o.label) D.label(T, o.label);
    c.els.forEach((el, i) => rise(D, el, T + 0.9 + i * 0.35, T + 4.6));
    tl.to(c.cap, { opacity: 0, duration: 0.3 }, T + dur - 0.5);
    const pent = [N.A4, N.C5, N.D5, N.E5, N.G5, N.A5, N.C6, N.D6];
    for (let k = 0; k < 14; k++) D.sfx('bell', T + 0.5 + k * 0.23, pent[k % pent.length] * (k >= 8 ? 1 : 1), 0.05);
    for (let k = 0; k < 10; k++) { D.sfx('kick', T + 0.5 + k * 0.5, 0.55); D.sfx('hat', T + 0.75 + k * 0.5, 0.12); }
    for (let k = 0; k < 8; k++) D.sfx('fold', T + 2.3 + k * 0.18, 0.14);
    D.sfx('boom', T + 3.6, 0.5);
    D.hide(c.s, T + dur);
    return dur;
  });

  // ------------------------------------------------------------------ TRAFFIC
  // Close to a crossing, tilt-shift on: the city becomes a toy, cars flow.   6 s
  recipe('traffic', (D, T, o) => {
    const { tl, C, N } = D;
    const Ct = city(D, o), { clamp01, rise, caption } = TK();
    const dur = o.duration || 6, tgt = [Ct.roadC(3), 6, Ct.roadC(4)];
    TK().shot(D, T, dur, [Ct.gCity], lt => {
      Ct.setBuild(99); Ct.setCars(T + lt, 1, 0.05); Ct.setNight(0.05); Ct.setTitle(-1);
      Ct.light(0.05, 2.3, 0.72);
      const u = lt / dur;
      Ct.view(tgt, lerp(1.0, 1.4, u), lerp(0.6, 0.5, u), lerp(1080, 880, u), 24);
      Ct.tilt(o.blur ?? 16, 0.5, 0.08, 0.35);
    });
    const c = copy(D, 'traffic', o.lines || ['UNA CIUDAD', 'EN MINIATURA.'], C.ink);
    D.show(c.s, T);
    if (o.label) D.label(T, o.label);
    c.els.forEach((el, i) => rise(D, el, T + 0.6 + i * 0.35, T + dur - 0.9));
    caption(D, c.cap, o.caption || `${Ct.cars.length} AUTOS EN CIRCULACIÓN`, T + 1.2, T + dur - 0.6);
    for (let k = 0; k < 12; k++) { D.sfx('hat', T + 0.25 + k * 0.5, 0.1); if (k % 2 === 0) D.sfx('kick', T + k * 0.5, 0.45); }
    D.sfx('beep', T + 2.1, 523, 0.1, 0.05);
    D.sfx('beep', T + 2.25, 523, 0.14, 0.05);
    D.sfx('swell', T + 0.2, 4, 0.12);
    D.hide(c.s, T + dur);
    return dur;
  });

  // ------------------------------------------------------------------ DAYNIGHT
  // Time-lapse: the sun sweeps and sets, shadows swing, the sky grades from paper
  // to golden to violet to navy; windows, lamps and car lights come on.      8 s
  recipe('daynight', (D, T, o) => {
    const { tl, C, N } = D;
    const Ct = city(D, o), { E, clamp01, rise } = TK(), eIO = E('sine.inOut');
    const dur = o.duration || 8;
    const night = lt => eIO(clamp01((lt - 0.5) / 6.2));
    const c = copy(D, 'daynight', [], C.ink);
    const [l1, l2] = o.lines || ['DE DÍA…', '…Y DE NOCHE.'];
    const s2 = D.scene('daynight-b', `<div class="pc-big v c" style="top:470px;color:${C.ink}">${l1}</div><div class="pc-big v c" style="top:620px;color:${C.paper}">${l2}</div>`);
    const [e1, e2] = D.$$('.pc-big', s2).map(el => D.fit(el, 1650));
    const h0 = o.from ?? 13, h1 = o.to ?? 23.5;
    TK().shot(D, T, dur, [Ct.gCity], lt => {
      const n = night(lt), u = clamp01(lt / 6.6);
      Ct.setBuild(99); Ct.setCars(T + lt, 1, n); Ct.setNight(n); Ct.setTitle(-1);
      Ct.light(n, 2.3 + 1.3 * u, 0.75 - 0.95 * u);
      Ct.view([0, 30, 40], lerp(1.3, 2.1, lt / dur), lerp(0.6, 0.5, lt / dur), lerp(2900, 2650, lt / dur), 22);
      Ct.tilt(8, 0.5, 0.14, 0.2);
      const hrs = h0 + (h1 - h0) * n, hh = Math.floor(hrs), mm = Math.floor((hrs - hh) * 6) * 10;
      c.cap.textContent = `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
    });
    c.cap.classList.add('pc-clock');
    D.show(c.s, T);
    D.show(s2, T);
    if (o.label) D.label(T, o.label);
    rise(D, e1, T + 0.6, T + 3.1);
    rise(D, e2, T + 4.4, T + dur - 0.6);
    tl.to(c.cap, { color: C.paper, duration: 0.6 }, T + 4.2);
    D.ink(C.paper, T + 4.4);
    D.call(() => SFX.padStop('plan', 1.5), T + 0.2);
    D.call(() => SFX.pad('dusk', [98, 146.83, 196, 246.94], 2.5, 0.035, 800), T + 0.3);
    D.sfx('swell', T + 1, 5, 0.14);
    [N.E5, N.C5, N.A4, N.E4].forEach((f, i) => D.sfx('bell', T + 1.2 + i * 1.3, f, 0.06));
    D.sfx('bell', T + 5.2, N.A5, 0.07);
    D.sfx('bell', T + 5.35, N.E5, 0.05);
    D.hide(c.s, T + dur);
    D.hide(s2, T + dur);
    return dur;
  });

  // ------------------------------------------------------------------ CITYTITLE
  // Night. The camera swings to the front margin of the sheet where the title
  // pops up letter by letter like a pop-up book, lit by two warm spots.       8 s
  recipe('citytitle', (D, T, o) => {
    const { tl, C, N } = D;
    const Ct = city(D, o), { E, clamp01 } = TK(), eX = E('expo.inOut');
    const dur = o.duration || 8, word = o.word || D.cfg.meta.title;
    Ct.makeTitle(word, o.colors || [C.a[0], C.a[2]]);
    const nL = [...word].filter(ch => ch !== ' ').length, tPop = 1.9, tLast = tPop + (nL - 1) * 0.11 + 0.55;
    const spotA = new Ct.T3.Color('#ffc58a');
    TK().shot(D, T, dur, [Ct.gCity, Ct.gTitle], lt => {
      Ct.setBuild(99); Ct.setCars(T + lt, 1, 1); Ct.setNight(1); Ct.setTitle(lt - tPop);
      Ct.light(1, 3.6, -0.2);
      const a = eX(clamp01(lt / 2.7)), p = clamp01((lt - 2.7) / (dur - 2.7));
      Ct.view(lerp3([0, 30, 40], [0, 55, 720], a), lerp(2.1, 0, a) - 0.12 * p, lerp(0.5, 0.24, a), lerp(2650, 1450, a) - 150 * p, lerp(22, 26, a));
      const spot = clamp01((lt - 1.6) / 0.8);
      Ct.S.p1.color.copy(spotA); Ct.S.p1.intensity = 0.3 * spot; Ct.S.p1.distance = 1600; Ct.S.p1.position.set(-340, 620, 900);
      Ct.S.p2.color.copy(spotA); Ct.S.p2.intensity = 0.3 * spot; Ct.S.p2.distance = 1600; Ct.S.p2.position.set(340, 620, 900);
      Ct.S.bloom.strength = 0.8; Ct.S.bloom.threshold = 0.84;
      Ct.tilt(10, 0.56, 0.16, 0.25);
      Ct.S.opacity = 1 - clamp01((lt - (dur - 0.6)) / 0.5);
    });
    const s = D.scene('citytitle', '<div class="pc-sub mono c"></div>');
    const sub = D.$('.pc-sub', s);
    D.show(s, T);
    D.ink(C.paper, T);
    if (o.label) D.label(T + 0.3, o.label);
    const up = [N.C5, N.D5, N.E5, N.G5, N.A5, N.C6, N.D6, N.E5 * 2, N.G5 * 2];
    for (let i = 0; i < nL; i++) { D.sfx('fold', T + tPop + i * 0.11 + 0.1, 0.22); D.sfx('bell', T + tPop + i * 0.11 + 0.1, up[i % up.length], 0.04); }
    D.sfx('boom', T + tLast, 0.8);
    D.sfx('crash', T + tLast, 0.18);
    D.flash(T + tLast, 0.15, 0.5, '#ffd9a8');
    D.call(() => SFX.padStop('dusk', 1), T + 1.5);
    D.call(() => SFX.pad('title', [110, 138.59, 164.81, 220], 1.5, 0.05, 900), T + tLast);
    if (o.subtitle) {
      tl.set(sub, { opacity: 1 }, T + tLast + 0.4);
      tl.to(sub, { duration: 1.2, scrambleText: { text: o.subtitle, chars: 'upperCase', speed: 0.6 }, ease: 'none' }, T + tLast + 0.4);
      tl.to(sub, { opacity: 0, duration: 0.4 }, T + dur - 0.8);
    }
    D.call(() => SFX.padStop('title', 2), T + dur - 0.5);
    D.hide(s, T + dur);
    return dur;
  });
})();
