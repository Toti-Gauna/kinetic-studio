/* ============================================================================
   COSMOS MODULE — a WebGL particle universe.

   One shared system of N particles (default 120,000) whose position is a pure
   function, evaluated on the GPU, of per-particle seeds + formation targets +
   uniforms tweened on the master timeline. No simulation state → every frame is
   seekable and replays identically.

   Formations (S.stage 0 → 5, per-particle staggered):
     0 singularity · 1 inflation shell · 2 cosmic web · 3 spiral galaxy
     4 ringed planet · 5 a word written in stars
   ~6% of particles are fixed background stars (parallax with the camera).
   Recipes: bigbang, cosmicweb, galaxy, planet, starword — use them in this order.
   ========================================================================== */
(() => {
  'use strict';
  const { recipe } = Trailer;
  const TAU = Math.PI * 2;
  const hash = (a, b = 0) => {
    let h = Math.imul(a | 0, 374761393) + Math.imul(b | 0, 668265263);
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  };
  const gauss = (i, k) => Math.sqrt(-2 * Math.log(1 - hash(i, k) * 0.9999)) * Math.cos(TAU * hash(i, k + 1));

  const VS = `
precision highp float;
attribute vec4 aSeed; attribute vec3 aWeb; attribute vec3 aGal; attribute vec3 aPla; attribute vec3 aTxt;
uniform float uStage, uHeat, uCollapse, uTime, uYaw, uPitch, uRoll, uDist, uSize, uFocus, uDof, uPx, uF, uTwinkle, uExp, uAlpha;
varying vec3 vCol; varying float vA;

vec3 dirOf(vec4 s) { float z = s.x * 2.0 - 1.0; float a = s.y * 6.2831853; float r = sqrt(max(0.0, 1.0 - z * z)); return vec3(r * cos(a), z, r * sin(a)); }
vec3 rotX(vec3 p, float a) { float c = cos(a), s = sin(a); return vec3(p.x, c * p.y - s * p.z, s * p.y + c * p.z); }
vec3 rotY(vec3 p, float a) { float c = cos(a), s = sin(a); return vec3(c * p.x + s * p.z, p.y, -s * p.x + c * p.z); }
vec3 rotZ(vec3 p, float a) { float c = cos(a), s = sin(a); return vec3(c * p.x - s * p.y, s * p.x + c * p.y, p.z); }

vec3 formation(float k) {
  if (k < 0.5) return dirOf(aSeed) * 3.0 * aSeed.z;
  if (k < 1.5) { // fireball: a clumpy shell (limb-brightened in projection) around a hot interior
    vec3 dir = dirOf(aSeed);
    float R = 330.0 * (1.0 + uExp), z = aSeed.z;
    float rr = z > 0.28 ? R * (0.88 + 0.12 * (z - 0.28) / 0.72) : R * 0.55 * sqrt(z / 0.28);
    rr *= 1.0 + 0.1 * sin(dir.x * 9.0 + dir.y * 7.0) * sin(dir.z * 8.0 - dir.y * 5.0);
    return dir * rr;
  }
  if (k < 2.5) return aWeb;
  if (k < 3.5) {
    float r = aGal.x, th = aGal.y + uTime * 0.32 / (0.22 + r / 380.0);
    return vec3(cos(th) * r, aGal.z, sin(th) * r);
  }
  if (k < 4.5) {
    vec3 p;
    if (aPla.x < 0.5) { float lo = aPla.y + uTime * 0.22, la = aPla.z; p = vec3(cos(la) * cos(lo), sin(la), cos(la) * sin(lo)) * 230.0; }
    else { float rr = aPla.y, a = aPla.z + uTime * 0.5 * (300.0 / rr); p = vec3(cos(a) * rr, (aSeed.w - 0.5) * 4.0, sin(a) * rr); }
    return rotZ(rotX(p, 0.42), 0.12);
  }
  return aTxt;
}
vec3 colorOf(float k) {
  if (k < 1.5) { // fireball: white-hot core → gold/orange/rose shell, with violet sparks
    vec3 shell = aSeed.y > 0.8 ? vec3(0.62, 0.35, 1.0) : mix(vec3(1.0, 0.68, 0.26), vec3(1.0, 0.34, 0.45), aSeed.y / 0.8);
    return mix(vec3(1.0, 0.94, 0.82), shell, smoothstep(0.1, 0.5, aSeed.z));
  }
  if (k < 2.5) return aSeed.x > 0.82 ? vec3(1.0, 0.55, 0.9) : mix(vec3(0.32, 0.42, 1.0), vec3(0.6, 0.4, 1.0), aSeed.y);
  if (k < 3.5) { if (aGal.x < 130.0) return vec3(1.0, 0.84, 0.6); return aSeed.x > 0.93 ? vec3(1.0, 0.45, 0.8) : mix(vec3(0.5, 0.66, 1.0), vec3(0.8, 0.85, 1.0), aSeed.y); }
  if (k < 4.5) { if (aPla.x < 0.5) return mix(vec3(0.98, 0.8, 0.55), vec3(0.72, 0.46, 0.3), 0.5 + 0.5 * sin(aPla.z * 16.0)); return vec3(0.95, 0.88, 0.72); }
  return mix(mix(vec3(0.45, 0.8, 1.0), vec3(0.78, 0.55, 1.0), clamp(aTxt.x / 1400.0 + 0.5, 0.0, 1.0)), vec3(1.0), 0.5);
}
float planetShade; // set in main(): lit + front-facing factor for sphere particles
float gainOf(float k) {
  if (k < 1.5) return 0.7;
  if (k < 2.5) return 0.62;
  if (k < 3.5) return 0.5;
  if (k < 4.5) return aPla.x < 0.5 ? 0.62 * planetShade : 0.34;
  return 0.85;
}

void main() {
  bool star = aSeed.w < 0.06;
  vec3 p; vec3 col; float gain; float grow = 1.0;
  if (star) {
    p = dirOf(aSeed) * (3000.0 + aSeed.z * 2200.0);
    col = vec3(0.82, 0.87, 1.0); gain = 0.55;
  } else {
    // planet sphere: hide the far hemisphere (no depth buffer with additive light) and light it from the upper left
    planetShade = 1.0;
    if (aPla.x < 0.5) {
      vec3 nl = rotZ(rotX(vec3(cos(aPla.z) * cos(aPla.y + uTime * 0.22), sin(aPla.z), cos(aPla.z) * sin(aPla.y + uTime * 0.22)), 0.42), 0.12);
      vec3 nv = rotZ(rotX(rotY(nl, uYaw), uPitch), uRoll);
      float front = smoothstep(-0.05, 0.3, -nv.z);
      float lit = max(0.0, dot(nv, normalize(vec3(-0.55, 0.5, -0.65))));
      planetShade = front * (0.12 + 1.1 * lit);
    }
    float s = clamp(uStage, 0.0, 5.0), k = floor(min(s, 4.999)), f = s - k;
    float d = fract(aSeed.x * 13.37 + aSeed.w * 7.1) * (k < 0.5 ? 0.08 : 0.35); // the bang itself is near-simultaneous
    float g = clamp((f - d) / 0.65, 0.0, 1.0);
    g = k < 0.5 ? 1.0 - pow(1.0 - g, 4.0) : g * g * (3.0 - 2.0 * g);
    p = mix(formation(k), formation(k + 1.0), g);
    // particles swirl while they travel between formations (a flow-field feel)
    float fl = sin(g * 3.14159) * (k < 0.5 ? 0.0 : 150.0);
    p += vec3(sin(p.y * 0.004 + uTime * 0.9 + aSeed.x * 6.0), sin(p.z * 0.004 + uTime * 1.1 + aSeed.y * 6.0), sin(p.x * 0.004 - uTime * 0.8 + aSeed.z * 6.0)) * fl;
    col = mix(colorOf(k), colorOf(k + 1.0), g);
    gain = mix(gainOf(k), gainOf(k + 1.0), g);
    // the planet sphere uses fat points so its lit face reads as a solid surface
    grow = aPla.x < 0.5 ? mix(k > 3.5 && k < 4.5 ? 2.3 : 1.0, k > 2.5 && k < 3.5 ? 2.3 : 1.0, g) : 1.0;
    float cl = clamp((uCollapse - d * 0.6) / 0.6, 0.0, 1.0);
    p *= 1.0 - cl * cl;
    col = mix(col, vec3(1.0, 0.96, 0.9), uHeat * 0.8);
  }
  vec3 v = rotZ(rotX(rotY(p, uYaw), uPitch), uRoll);
  float depth = v.z + uDist;
  if (depth < 12.0) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); gl_PointSize = 0.0; vA = 0.0; vCol = col; return; }
  gl_Position = vec4(v.x * uF / depth / 960.0, v.y * uF / depth / 540.0, 0.0, 1.0);
  float base = (0.7 + fract(aSeed.w * 17.0) * 1.7) * (star ? 0.8 : uSize * grow);
  float coc = star ? 0.0 : abs(depth - uFocus) * uDof;
  float sz = base * uF / depth + coc;
  float tw = 1.0 - uTwinkle * 0.4 * (0.5 + 0.5 * sin(uTime * 5.0 + aSeed.x * 60.0));
  gl_PointSize = clamp(sz, 1.0, 48.0) * uPx;
  vA = gain * uAlpha * tw / (1.0 + coc * 0.3) * (sz < 1.0 ? sz : 1.0);
  vCol = col;
}`;
  const FS = `
precision mediump float;
varying vec3 vCol; varying float vA;
void main() {
  vec2 q = gl_PointCoord * 2.0 - 1.0;
  float r2 = dot(q, q);
  if (r2 > 1.0) discard;
  float a = exp(-r2 * 3.5) * vA;
  gl_FragColor = vec4(vCol * a, a);
}`;

  // ------------------------------------------------------------------ the shared system
  let COS = null;
  function cosmos(D, o = {}) {
    if (COS) return COS;
    const N = o.count || 120000;
    const S = { alpha: 0, stage: 0, heat: 1, collapse: 0, exp: 0, yaw: 0, pitch: 0, roll: 0, dist: 1158, size: 1, focus: 1158, dof: 0, twinkle: 0 };
    COS = { S, N, ok: false, setText: () => {} };
    const cv = document.createElement('canvas');
    cv.className = 'cos-gl';
    D.camera.insertBefore(cv, D.camera.firstChild);
    const gl = cv.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false });
    if (!gl) { console.warn('[cosmos] WebGL unavailable: the cosmos scenes show their text only'); return COS; }

    const sh = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error('[cosmos] shader: ' + gl.getShaderInfoLog(s));
      return s;
    };
    const prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error('[cosmos] link: ' + gl.getProgramInfoLog(prog));
    gl.useProgram(prog);

    // --- per-particle data (16 floats): seed4 · web3 · galaxy3 · planet3 · text3
    const STRIDE = 16, data = new Float32Array(N * STRIDE);
    // cosmic web: nodes joined to their nearest neighbours; particles on filaments + dense clusters at nodes
    const nodes = Array.from({ length: 46 }, (_, i) => [(hash(i, 1) - 0.5) * 2100, (hash(i, 2) - 0.5) * 1150, (hash(i, 3) - 0.5) * 900]);
    const edges = [], seen = new Set();
    nodes.forEach((a, i) => {
      nodes.map((b, j) => [j, Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2])]).filter(([j]) => j !== i)
        .sort((x, y) => x[1] - y[1]).slice(0, 3).forEach(([j, len]) => {
          const key = i < j ? `${i}-${j}` : `${j}-${i}`;
          if (!seen.has(key)) { seen.add(key); edges.push([i, j, len]); }
        });
    });
    const cum = [];
    edges.reduce((acc, e) => { cum.push(acc + e[2]); return acc + e[2]; }, 0);
    const total = cum[cum.length - 1];
    const pickEdge = u => { let lo = 0, hi = cum.length - 1; while (lo < hi) { const m = (lo + hi) >> 1; if (cum[m] < u * total) lo = m + 1; else hi = m; } return edges[lo]; };

    for (let i = 0; i < N; i++) {
      const b = i * STRIDE;
      data[b] = hash(i, 1); data[b + 1] = hash(i, 2); data[b + 2] = hash(i, 3); data[b + 3] = hash(i, 4);
      // web
      if (hash(i, 11) < 0.24) {
        const nd = nodes[Math.floor(hash(i, 12) * nodes.length)];
        data[b + 4] = nd[0] + gauss(i, 13) * 38; data[b + 5] = nd[1] + gauss(i, 15) * 38; data[b + 6] = nd[2] + gauss(i, 17) * 38;
      } else {
        const [a, c] = pickEdge(hash(i, 12)), u = hash(i, 19), A = nodes[a], B = nodes[c];
        const w = 10 + 16 * (1 - Math.abs(u - 0.5) * 2);
        data[b + 4] = A[0] + (B[0] - A[0]) * u + gauss(i, 13) * w;
        data[b + 5] = A[1] + (B[1] - A[1]) * u + gauss(i, 15) * w;
        data[b + 6] = A[2] + (B[2] - A[2]) * u + gauss(i, 17) * w;
      }
      // galaxy (disk in the XZ plane): bulge + two logarithmic arms
      if (hash(i, 21) < 0.15) {
        data[b + 7] = Math.abs(gauss(i, 22)) * 75; data[b + 8] = hash(i, 24) * TAU; data[b + 9] = gauss(i, 25) * 42;
      } else {
        const r = 60 + Math.pow(hash(i, 22), 0.85) * 640, arm = hash(i, 23) < 0.5 ? 0 : Math.PI;
        data[b + 7] = r; data[b + 8] = arm + Math.log(r / 60) * 2.3 + gauss(i, 24) * 0.3; data[b + 9] = gauss(i, 26) * 11 * (1 - r / 820);
      }
      // planet: sphere surface or ring annulus (with a Cassini-style gap)
      if (hash(i, 31) < 0.62) {
        data[b + 10] = 0; data[b + 11] = hash(i, 32) * TAU; data[b + 12] = Math.asin(hash(i, 33) * 2 - 1);
      } else {
        let rr = 300 + hash(i, 32) * 230;
        if (rr > 402 && rr < 422) rr += 20;
        data[b + 10] = 1; data[b + 11] = rr; data[b + 12] = hash(i, 33) * TAU;
      }
    }

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    [['aSeed', 4, 0], ['aWeb', 3, 4], ['aGal', 3, 7], ['aPla', 3, 10], ['aTxt', 3, 13]].forEach(([name, size, off]) => {
      const loc = gl.getAttribLocation(prog, name);
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, size, gl.FLOAT, false, STRIDE * 4, off * 4);
    });
    const U = {};
    ['uStage', 'uHeat', 'uCollapse', 'uTime', 'uYaw', 'uPitch', 'uRoll', 'uDist', 'uSize', 'uFocus', 'uDof', 'uPx', 'uF', 'uTwinkle', 'uExp', 'uAlpha']
      .forEach(n => { U[n] = gl.getUniformLocation(prog, n); });
    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE); // additive light
    gl.clearColor(0, 0, 0, 0);

    // the word written in stars (called by `starword` at build time)
    COS.setText = (text, size = 330) => {
      const c = document.createElement('canvas');
      c.width = D.W; c.height = D.H;
      const x = c.getContext('2d');
      const setFont = sz => { x.font = `900 ${sz}px "${D.cfg.fonts.display}"`; if (D.cfg.fonts.stretch && 'fontStretch' in x) x.fontStretch = 'expanded'; };
      setFont(size);
      const w = x.measureText(text).width;
      if (w > 1640) setFont(size * 1640 / w);
      x.fillStyle = '#fff'; x.textAlign = 'center'; x.textBaseline = 'middle';
      x.fillText(text, D.CX, D.CY);
      const img = x.getImageData(0, 0, D.W, D.H).data, pts = [];
      for (let y = 0; y < D.H; y += 3) for (let xx = 0; xx < D.W; xx += 3) if (img[(y * D.W + xx) * 4 + 3] > 128) pts.push(xx, y);
      const np = pts.length / 2 || 1;
      for (let i = 0; i < N; i++) {
        const b = i * STRIDE, k = Math.floor(hash(i, 41) * np) * 2;
        data[b + 13] = (pts[k] ?? D.CX) - D.CX + (hash(i, 42) - 0.5) * 3;
        data[b + 14] = D.CY - (pts[k + 1] ?? D.CY) + (hash(i, 43) - 0.5) * 3;
        data[b + 15] = gauss(i, 44) * 18;
      }
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    };

    let K = 0, drawn = false;
    function fit() {
      const r = D.stage.getBoundingClientRect(), k = Math.min(1.5, Math.max(1, (r.width / D.W) * (devicePixelRatio || 1)));
      if (Math.abs(k - K) > 0.01) { K = k; cv.width = Math.round(D.W * K); cv.height = Math.round(D.H * K); }
    }
    gsap.ticker.add(() => {
      if (S.alpha < 0.002) {
        if (drawn) { gl.clear(gl.COLOR_BUFFER_BIT); drawn = false; cv.style.visibility = 'hidden'; }
        return;
      }
      if (!drawn) cv.style.visibility = 'visible';
      drawn = true;
      fit();
      gl.viewport(0, 0, cv.width, cv.height);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform1f(U.uTime, D.tl.time());
      gl.uniform1f(U.uPx, K);
      gl.uniform1f(U.uF, 540 / Math.tan((25 * Math.PI) / 180));
      gl.uniform1f(U.uStage, S.stage); gl.uniform1f(U.uHeat, S.heat); gl.uniform1f(U.uCollapse, S.collapse);
      gl.uniform1f(U.uYaw, S.yaw); gl.uniform1f(U.uPitch, S.pitch); gl.uniform1f(U.uRoll, S.roll);
      gl.uniform1f(U.uDist, S.dist); gl.uniform1f(U.uSize, S.size); gl.uniform1f(U.uFocus, S.focus); gl.uniform1f(U.uDof, S.dof);
      gl.uniform1f(U.uTwinkle, S.twinkle); gl.uniform1f(U.uExp, S.exp); gl.uniform1f(U.uAlpha, S.alpha);
      gl.drawArrays(gl.POINTS, 0, N);
    });
    COS.ok = true;
    return COS;
  }

  // shared DOM for the cosmos scenes: a big word + a mono caption
  function copy(D, T, name, o, word, caption) {
    const { tl } = D;
    const s = D.scene(name, `${word ? `<div class="cs-word v c">${word}</div>` : ''}<div class="cs-cap mono"></div>`);
    const w = D.$('.cs-word', s), cap = D.$('.cs-cap', s);
    if (w) D.fit(w, 1600);
    return { s, w, cap, reveal(at, out) {
      if (w) {
        gsap.set(w, { opacity: 0, letterSpacing: '0.6em', paddingLeft: '0.6em', filter: 'blur(14px)' });
        tl.to(w, { opacity: 1, letterSpacing: '0.12em', paddingLeft: '0.12em', filter: 'blur(0px)', duration: 1.4, ease: 'expo.out' }, at);
        tl.to(w, { opacity: 0, filter: 'blur(10px)', duration: 0.5, ease: 'power2.in' }, out);
      }
      if (caption) {
        tl.to(cap, { duration: 0.9, scrambleText: { text: caption, chars: '0123456789', speed: 0.8 }, ease: 'none' }, at + 0.3);
        tl.to(cap, { opacity: 0, duration: 0.4 }, out);
      }
    } };
  }

  // ------------------------------------------------------------------ BIGBANG
  // Darkness. A single point of light pulses like a heartbeat under two lines of
  // copy. Riser → BANG: flash, braam, and 120k particles explode outward while
  // the camera flies into the cooling cloud.                        7.5 s (bang at 4.2)
  recipe('bigbang', (D, T, o) => {
    const { tl, C, N } = D;
    const X = cosmos(D, o), S = X.S;
    const dur = o.duration || 7.5, tb = T + (o.bang ?? 4.2);
    const lines = (o.lines || ['HACE 13.800 MILLONES DE AÑOS', 'NO HABÍA <em>NADA</em>.']).slice(0, 2);
    const s = D.scene('bigbang', `${lines.map((l, i) => `<div class="cs-line v c" style="top:${690 + i * 58}px">${l}</div>`).join('')}<div class="cs-cap mono"></div>`);
    const splits = D.$$('.cs-line', s).map(el => D.split(D.fit(el, 1700), { type: 'chars', mask: 'chars' }));
    const cap = D.$('.cs-cap', s);
    gsap.set(splits.flatMap(x => x.chars), { yPercent: 115 });

    D.show(s, T);
    D.setBg(C.night, T);
    D.ink(C.paper, T);
    tl.set(D.bars, { height: 540 }, T);
    D.barsTo(110, T + 0.05, 1.8);
    if (o.label) D.label(T + 0.8, o.label);
    tl.set(S, { alpha: 1, stage: 0, heat: 1, collapse: 0, exp: 0, size: 0.6, yaw: 0, pitch: 0.12, roll: 0, dist: 1158, focus: 1158, dof: 0, twinkle: 0 }, T);
    D.call(() => SFX.pad('void', [36.71, 55], 3, 0.06, 200), T + 0.02);
    // heartbeat of the singularity
    [[0.6, 2.6, 0.7], [1.6, 2.2, 0.5], [2.6, 1.9, 0.35], [3.3, 1.6, 0.25]].forEach(([dt, sz, v]) => {
      D.hit(S, { size: sz }, { size: 0.6, duration: 0.8, ease: 'expo.out' }, T + dt);
      D.sfx('boom', T + dt, v);
    });
    splits.forEach((sp, i) => {
      tl.to(sp.chars, { yPercent: 0, duration: 0.9, ease: 'expo.out', stagger: 0.025 }, T + 1.0 + i * 1.2);
      D.sfx('bell', T + 1.0 + i * 1.2, [N.E4, N.A4][i], 0.06);
    });
    tl.to(splits.flatMap(x => x.chars), { yPercent: -115, duration: 0.4, ease: 'expo.in', stagger: 0.006 }, tb - 0.55);
    D.sfx('riser', tb - 1.7, 1.7, 0.45);
    // BANG
    D.flash(tb, 1, 1.2);
    D.shake(tb, 0.9, 26);
    D.sfx('braam', tb, 0.9);
    D.sfx('boom', tb, 1);
    D.sfx('crash', tb, 0.35);
    D.call(() => SFX.padStop('void', 0.3), tb);
    D.call(() => SFX.pad('cosmos', [55, 82.41, 110, 164.81], 2, 0.05, 700), tb + 0.05);
    tl.set(S, { size: 1.1 }, tb);
    tl.to(S, { stage: 1, duration: 2.2, ease: 'none' }, tb);
    tl.to(S, { exp: 0.45, duration: T + dur - tb, ease: 'power1.out' }, tb);
    tl.to(S, { heat: 0.2, duration: 3, ease: 'power2.out' }, tb + 0.2);
    tl.to(S, { dist: 1100, yaw: 0.6, pitch: 0.25, duration: T + dur - tb, ease: 'power2.inOut' }, tb);
    tl.to(S, { dof: 0.005, focus: 1100, duration: 1.5 }, tb + 0.8);
    if (o.caption !== false) tl.to(cap, { duration: 0.9, scrambleText: { text: o.caption || '10⁻³² SEGUNDOS · INFLACIÓN', chars: '0123456789', speed: 0.8 }, ease: 'none' }, tb + 1.3);
    tl.to(cap, { opacity: 0, duration: 0.4 }, T + dur - 0.5);
    D.hide(s, T + dur);
    return dur;
  });

  // ------------------------------------------------------------------ COSMICWEB
  // The cloud settles into filaments and dense nodes; the camera pulls back and
  // orbits to reveal the web.                                               5.5 s
  recipe('cosmicweb', (D, T, o) => {
    const { tl, N } = D;
    const S = cosmos(D, o).S, dur = o.duration || 5.5;
    const c = copy(D, T, 'cosmicweb', o, o.word ?? 'LA RED CÓSMICA', o.caption ?? 'MATERIA OSCURA · FILAMENTOS · NODOS');
    D.show(c.s, T);
    if (o.label) D.label(T, o.label);
    tl.to(S, { stage: 2, duration: 2.6, ease: 'none' }, T);
    tl.to(S, { heat: 0, duration: 1.5 }, T);
    tl.to(S, { dist: 1350, yaw: 0.8, pitch: 0.3, size: 1.15, duration: dur, ease: 'power1.inOut' }, T);
    tl.to(S, { focus: 1350, dof: 0.004, duration: 2 }, T);
    c.reveal(T + 1.6, T + dur - 0.6);
    D.sfx('whoosh', T, 1.6, 0.35);
    D.sfx('bell', T + 1.6, N.E5, 0.07);
    D.sfx('bell', T + 1.75, N.A5, 0.05);
    D.hide(c.s, T + dur);
    return dur;
  });

  // ------------------------------------------------------------------ GALAXY
  // Matter spirals into a two-armed galaxy; the camera tilts from edge-on to
  // almost face-on while it rotates (inner stars faster).                   6.5 s
  recipe('galaxy', (D, T, o) => {
    const { tl, N } = D;
    const S = cosmos(D, o).S, dur = o.duration || 6.5;
    const c = copy(D, T, 'galaxy', o, o.word ?? 'GALAXIAS', o.caption ?? '100.000 AÑOS LUZ DE PUNTA A PUNTA');
    D.show(c.s, T);
    if (o.label) D.label(T, o.label);
    tl.to(S, { stage: 3, duration: 2.8, ease: 'none' }, T);
    tl.to(S, { pitch: 0.06, yaw: 1.4, size: 1, duration: 1.4, ease: 'power2.inOut' }, T);
    tl.to(S, { pitch: 1.12, yaw: 2.2, dist: 1050, duration: dur - 1.4, ease: 'power2.inOut' }, T + 1.4);
    tl.to(S, { focus: 1050, dof: 0.006, duration: 2 }, T + 1);
    c.reveal(T + 2.4, T + dur - 0.6);
    D.sfx('whoosh', T, 2, 0.35);
    D.sfx('swell', T + 1.4, 3, 0.18);
    D.sfx('bell', T + 2.4, N.C5, 0.07);
    D.sfx('bell', T + 2.55, N.G5, 0.05);
    D.hide(c.s, T + dur);
    return dur;
  });

  // ------------------------------------------------------------------ PLANET
  // The galaxy collapses into a banded planet with a ring system (and a gap);
  // both spin, the rings faster near the planet.                            5.5 s
  recipe('planet', (D, T, o) => {
    const { tl, N } = D;
    const S = cosmos(D, o).S, dur = o.duration || 5.5;
    const c = copy(D, T, 'planet', o, o.word ?? 'MUNDOS', o.caption ?? 'ANILLOS DE HIELO Y ROCA');
    D.show(c.s, T);
    if (o.label) D.label(T, o.label);
    tl.to(S, { stage: 4, duration: 2.6, ease: 'none' }, T);
    tl.to(S, { pitch: 0.28, yaw: 3.4, dist: 900, duration: dur, ease: 'power2.inOut' }, T);
    tl.to(S, { focus: 900, dof: 0.003, duration: 2 }, T);
    c.reveal(T + 2.2, T + dur - 0.6);
    D.sfx('whoosh', T, 1.8, 0.35);
    D.sfx('bell', T + 2.2, N.A4, 0.07);
    D.sfx('bell', T + 2.35, N.E5, 0.05);
    D.hide(c.s, T + dur);
    return dur;
  });

  // ------------------------------------------------------------------ STARWORD
  // Everything re-forms, face-on, into a word written in stars (twinkling), with a
  // subtitle. Then the universe collapses back into a point and flashes out.   6.5 s
  recipe('starword', (D, T, o) => {
    const { tl, C, N } = D;
    const X = cosmos(D, o), S = X.S, dur = o.duration || 6.5;
    X.setText(o.word || D.cfg.meta.title, o.size || 330);
    const s = D.scene('starword', `<div class="cs-sub mono c"></div>`);
    const sub = D.$('.cs-sub', s);
    const tl0 = T + 2.9;
    D.show(s, T);
    if (o.label) D.label(T + 0.2, o.label);
    tl.to(S, { stage: 5, duration: 3.0, ease: 'none' }, T);
    tl.to(S, { yaw: Math.PI * 2, pitch: 0, roll: 0, dist: 1158, duration: 3.0, ease: 'power3.inOut' }, T);
    tl.to(S, { dof: 0, focus: 1158, size: 1.25, duration: 2.4 }, T);
    tl.to(S, { twinkle: 1, duration: 1 }, tl0);
    D.hit(S, { heat: 0.6, size: 1.9 }, { heat: 0, size: 1.25, duration: 1.2, ease: 'expo.out' }, tl0);
    D.flash(tl0, 0.35, 0.6);
    D.sfx('riser', T + 1.2, tl0 - T - 1.2, 0.35);
    D.sfx('boom', tl0, 0.9);
    D.sfx('crash', tl0, 0.25);
    [N.A4, N.C5, N.E5, N.A5].forEach((f, i) => D.sfx('bell', tl0 + 0.1 + i * 0.11, f, 0.07));
    if (o.subtitle) {
      tl.set(sub, { opacity: 1 }, tl0 + 0.5);
      tl.to(sub, { duration: 1.2, scrambleText: { text: o.subtitle, chars: 'upperCase', speed: 0.6 }, ease: 'none' }, tl0 + 0.5);
      tl.to(sub, { opacity: 0, duration: 0.3 }, T + dur - 1.3);
    }
    // big crunch
    const tc = T + dur - 1.2;
    tl.to(S, { collapse: 1, duration: 0.95, ease: 'power3.in' }, tc);
    tl.to(S, { heat: 1, duration: 0.9, ease: 'power2.in' }, tc);
    D.sfx('riser', tc, 0.95, 0.4);
    D.call(() => SFX.padStop('cosmos', 1), tc);
    D.flash(T + dur - 0.22, 1, 0.5);
    D.sfx('boom', T + dur - 0.22, 0.8);
    tl.set(S, { alpha: 0 }, T + dur - 0.2);
    D.hide(s, T + dur);
    return dur;
  });
})();
