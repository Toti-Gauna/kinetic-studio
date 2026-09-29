/* ============================================================================
   3D MODULE — a real Three.js layer (lit geometry, custom shaders, bloom).

   REQUIRES these scripts before recipes-3d.js (Three.js r147, UMD build):
     three@0.147.0/build/three.min.js
     three@0.147.0/examples/js/shaders/CopyShader.js
     three@0.147.0/examples/js/shaders/LuminosityHighPassShader.js
     three@0.147.0/examples/js/postprocessing/EffectComposer.js
     three@0.147.0/examples/js/postprocessing/RenderPass.js
     three@0.147.0/examples/js/postprocessing/ShaderPass.js
     three@0.147.0/examples/js/postprocessing/UnrealBloomPass.js

   Each recipe registers a SHOT {t0, t1, groups, update(localTime)}. Every frame,
   the active shot sets the camera and animates its objects as a pure function of
   the master-timeline time → exact seeking and identical replays. A fixed light
   rig (ambient + 2 directional + 2 point) is re-aimed per shot so shader programs
   never recompile at a cut, and every material is compiled once up front.
   Recipes: corridor, jump, hypertunnel, planet3d, asteroids, gate, voxeltitle.
   ========================================================================== */
(() => {
  'use strict';
  const { recipe, plugin } = Trailer;
  const TAU = Math.PI * 2;
  const hash = (a, b = 0) => {
    let h = Math.imul(a | 0, 374761393) + Math.imul(b | 0, 668265263);
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  };
  const clamp01 = x => (x < 0 ? 0 : x > 1 ? 1 : x);
  const E = name => gsap.parseEase(name);
  const eIO = E('sine.inOut'), eXO = E('expo.out'), eP2in = E('power2.in'), eP3in = E('power3.in'), eP2io = E('power2.inOut');

  const NOISE = `
float h3(vec3 p) { p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float n3(vec3 x) {
  vec3 i = floor(x), f = fract(x); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(h3(i), h3(i + vec3(1,0,0)), f.x), mix(h3(i + vec3(0,1,0)), h3(i + vec3(1,1,0)), f.x), f.y),
             mix(mix(h3(i + vec3(0,0,1)), h3(i + vec3(1,0,1)), f.x), mix(h3(i + vec3(0,1,1)), h3(i + vec3(1,1,1)), f.x), f.y), f.z);
}
float fbm(vec3 p) { float a = 0.5, s = 0.0; for (int k = 0; k < 5; k++) { s += a * n3(p); p *= 2.03; a *= 0.5; } return s; }`;

  // ------------------------------------------------------------------ the shared renderer
  let X = null;
  function x3(D) {
    if (X) return X;
    const T3 = window.THREE;
    if (!T3 || !T3.EffectComposer || !T3.UnrealBloomPass) {
      throw new Error('recipes-3d needs Three.js r147 + its postprocessing scripts loaded before it (see README → 3D module)');
    }
    const cv = document.createElement('canvas');
    cv.className = 'x3-gl';
    D.camera.insertBefore(cv, D.camera.firstChild);
    const renderer = new T3.WebGLRenderer({ canvas: cv, antialias: false, powerPreference: 'high-performance' });
    renderer.setClearColor(0x000000, 1);
    const scene = new T3.Scene();
    scene.fog = new T3.Fog(0x000000, 1e6, 2e6); // always present (stable shaders); shots move near/far
    const cam = new T3.PerspectiveCamera(50, D.W / D.H, 1, 40000);
    const composer = new T3.EffectComposer(renderer);
    const renderPass = new T3.RenderPass(scene, cam);
    composer.addPass(renderPass);
    const bloom = new T3.UnrealBloomPass(new T3.Vector2(D.W, D.H), 1, 0.5, 0.2);
    composer.addPass(bloom);

    // a far starfield that follows the camera
    const NS = 5000, sp = new Float32Array(NS * 3), sc = new Float32Array(NS * 3);
    for (let i = 0; i < NS; i++) {
      const z = hash(i, 1) * 2 - 1, a = hash(i, 2) * TAU, r = Math.sqrt(1 - z * z), b = 0.25 + Math.pow(hash(i, 3), 3) * 0.9;
      sp.set([r * Math.cos(a) * 9000, z * 9000, r * Math.sin(a) * 9000], i * 3);
      const warm = hash(i, 4);
      sc.set(warm < 0.15 ? [b, b * 0.85, b * 0.7] : warm > 0.85 ? [b * 0.75, b * 0.85, b] : [b, b, b], i * 3);
    }
    const sg = new T3.BufferGeometry();
    sg.setAttribute('position', new T3.BufferAttribute(sp, 3));
    sg.setAttribute('color', new T3.BufferAttribute(sc, 3));
    const stars = new T3.Points(sg, new T3.PointsMaterial({ size: 1.7, sizeAttenuation: false, vertexColors: true, fog: false, depthWrite: false }));
    stars.frustumCulled = false;
    scene.add(stars);

    const amb = new T3.AmbientLight(0xffffff, 0.05);
    const sun = new T3.DirectionalLight(0xffffff, 0), rim = new T3.DirectionalLight(0xffffff, 0);
    const p1 = new T3.PointLight(0xffffff, 0, 1000, 1), p2 = new T3.PointLight(0xffffff, 0, 1000, 1);
    scene.add(amb, sun, rim, p1, p2);

    X = { D, T3, cv, renderer, scene, cam, composer, renderPass, bloom, stars, amb, sun, rim, p1, p2, shots: [], groups: new Set(), fx: [], K: 0, key: '', opacity: 1, clear: new T3.Color(0, 0, 0) };
    /** Extra post pass (inserted before bloom), disabled every frame unless a shot enables it. */
    X.addFx = pass => { composer.insertPass(pass, composer.passes.length - 1); pass.enabled = false; X.fx.push(pass); return pass; };
    fit();
    gsap.ticker.add(frame);
    return X;
  }
  function fit() {
    const r = X.D.stage.getBoundingClientRect();
    const k = Math.min(1, Math.max(0.5, (r.width / X.D.W) * (devicePixelRatio || 1)));
    if (Math.abs(k - X.K) > 0.02) {
      X.K = k;
      const w = Math.round(X.D.W * k), h = Math.round(X.D.H * k);
      X.renderer.setSize(w, h, false);
      X.composer.setSize(w, h);
    }
  }
  function frame() {
    const t = X.D.tl.time();
    const shot = X.shots.find(s => t >= s.t0 && t < s.t1);
    if (!shot) {
      if (X.cv.style.visibility !== 'hidden') X.cv.style.visibility = 'hidden';
      X.key = '';
      return;
    }
    fit();
    const key = t.toFixed(4) + '|' + X.K;
    if (key === X.key) return; // paused / frozen: nothing to redraw
    X.key = key;
    X.cv.style.visibility = 'visible';
    X.groups.forEach(g => { g.visible = false; });
    shot.groups.forEach(g => { g.visible = true; });
    // defaults a shot may override
    const { cam } = X;
    cam.fov = 50;
    X.stars.visible = true;
    X.scene.fog.near = 1e6; X.scene.fog.far = 2e6;
    X.amb.intensity = 0.05; X.amb.color.set(0xffffff);
    X.sun.intensity = 0; X.rim.intensity = 0; X.p1.intensity = 0; X.p2.intensity = 0;
    X.sun.color.set(0xffffff); X.rim.color.set(0xffffff);
    X.bloom.strength = 1; X.bloom.radius = 0.5; X.bloom.threshold = 0.2;
    X.opacity = 1;
    X.clear.setRGB(0, 0, 0);
    X.fx.forEach(p => { p.enabled = false; });
    shot.update(t - shot.t0, t);
    X.renderer.setClearColor(X.clear, 1);
    X.stars.position.copy(cam.position);
    cam.updateProjectionMatrix();
    X.cv.style.opacity = X.opacity;
    X.composer.render();
  }
  function shot(D, T, dur, groups, update) {
    const S = x3(D);
    groups.forEach(g => { g.visible = false; S.groups.add(g); S.scene.add(g); });
    S.shots.push({ t0: T, t1: T + dur, groups, update });
    return S;
  }
  // compile every material once, with the full light rig, so no cut hitches
  plugin({
    done() {
      if (!X) return;
      X.groups.forEach(g => { g.visible = true; });
      X.renderer.compile(X.scene, X.cam);
      X.groups.forEach(g => { g.visible = false; });
    },
  });
  /** Inspect the 3D layer: { renderer, scene, cam, shots, … } (debugging / tooling). */
  Trailer.x3 = () => X;

  // ------------------------------------------------------------------ shared helpers
  function radialTexture(T3) {
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const g = c.getContext('2d'), gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    gr.addColorStop(0, 'rgba(255,255,255,1)');
    gr.addColorStop(0.18, 'rgba(255,255,255,0.55)');
    gr.addColorStop(0.5, 'rgba(255,255,255,0.1)');
    gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr;
    g.fillRect(0, 0, 128, 128);
    return new T3.CanvasTexture(c);
  }
  function copy(D, name, items) {
    const s = D.scene(name, items.map(it => `<div class="${it.cls} v c" style="top:${it.y}px">${it.text}</div>`).join('') + '<div class="x3-cap mono"></div>');
    const els = D.$$('.v', s);
    els.forEach(el => D.fit(el, 1650));
    return { s, els, cap: D.$('.x3-cap', s) };
  }
  function rise(D, el, at, out) {
    const sp = D.split(el, { type: 'chars', mask: 'chars' });
    gsap.set(sp.chars, { yPercent: 115 });
    D.tl.to(sp.chars, { yPercent: 0, duration: 0.9, ease: 'expo.out', stagger: 0.03 }, at);
    if (out) D.tl.to(sp.chars, { yPercent: -115, duration: 0.45, ease: 'expo.in', stagger: 0.012 }, out);
  }
  function caption(D, cap, text, at, out) {
    if (!text) return;
    D.tl.to(cap, { duration: 0.9, scrambleText: { text, chars: '0123456789', speed: 0.8 }, ease: 'none' }, at);
    if (out) D.tl.to(cap, { opacity: 0, duration: 0.35 }, out);
  }

  // ------------------------------------------------------------------ CORRIDOR
  // A dark hexagonal launch corridor. Light rings switch on one by one into the
  // distance (with a flicker), runway lights start chasing, the far door slides
  // open onto white light and the camera accelerates into it.         6.5 s
  recipe('corridor', (D, T, o) => {
    const { tl, C, N } = D;
    const S = x3(D), T3 = S.T3, dur = o.duration || 6.5, go = 2.9;
    const accent = new T3.Color(o.color || C.a[0]), warm = new T3.Color(o.warm || C.a[2]);
    const R = 62, SEG = 44, NF = 30, L = SEG * NF;
    const g = new T3.Group();
    const wallGeo = new T3.CylinderGeometry(R, R, L + 240, 6, 1, true, Math.PI / 6);
    wallGeo.rotateX(Math.PI / 2);
    wallGeo.translate(0, 0, -(L + 240) / 2 + 120);
    g.add(new T3.Mesh(wallGeo, new T3.MeshStandardMaterial({ color: 0x0a0f1c, metalness: 0.35, roughness: 0.6, side: T3.BackSide, flatShading: true })));
    const verts = Array.from({ length: 6 }, (_, k) => { const th = Math.PI / 6 + (k * Math.PI) / 3; return [0.97 * R * Math.sin(th), -0.97 * R * Math.cos(th)]; });
    const side = Math.hypot(verts[1][0] - verts[0][0], verts[1][1] - verts[0][1]);
    const NB = (NF + 1) * 6;
    const beams = new T3.InstancedMesh(new T3.BoxGeometry(side, 5, 7), new T3.MeshStandardMaterial({ color: 0x1a2238, metalness: 0.5, roughness: 0.35 }), NB);
    const lamps = new T3.InstancedMesh(new T3.BoxGeometry(side * 0.7, 1.4, 1.4), new T3.MeshBasicMaterial({ color: 0xffffff }), NB);
    const m = new T3.Object3D(), black = new T3.Color(0, 0, 0);
    for (let f = 0; f <= NF; f++) for (let k = 0; k < 6; k++) {
      const a = verts[k], b = verts[(k + 1) % 6], i = f * 6 + k;
      m.position.set((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, -f * SEG);
      m.rotation.set(0, 0, Math.atan2(b[1] - a[1], b[0] - a[0]));
      m.updateMatrix();
      beams.setMatrixAt(i, m.matrix);
      m.position.multiplyScalar(0.93);
      m.position.z = -f * SEG;
      m.updateMatrix();
      lamps.setMatrixAt(i, m.matrix);
      lamps.setColorAt(i, black);
    }
    const nRun = Math.floor(L / 22), run = new T3.InstancedMesh(new T3.BoxGeometry(5, 1, 9), new T3.MeshBasicMaterial({ color: 0xffffff }), nRun * 2);
    for (let k = 0; k < nRun * 2; k++) {
      m.rotation.set(0, 0, 0);
      m.position.set((k % 2 ? 1 : -1) * R * 0.28, -0.866 * R * 0.99 + 1, -Math.floor(k / 2) * 22 - 10);
      m.updateMatrix();
      run.setMatrixAt(k, m.matrix);
      run.setColorAt(k, black);
    }
    const doorMat = new T3.MeshStandardMaterial({ color: 0x2a3550, metalness: 0.5, roughness: 0.4 });
    const doorL = new T3.Mesh(new T3.BoxGeometry(R * 1.1, R * 1.9, 6), doorMat), doorR = doorL.clone();
    doorL.position.set(-R * 0.55, 0, -L); doorR.position.set(R * 0.55, 0, -L);
    const light = new T3.Mesh(new T3.PlaneGeometry(R * 3, R * 3), new T3.MeshBasicMaterial({ color: 0xffffff }));
    light.position.z = -L - 50;
    g.add(beams, lamps, run, doorL, doorR, light);

    const col = new T3.Color();
    shot(D, T, dur, [g], lt => {
      const cam = S.cam, u = clamp01((lt - go) / (dur - go)), z = 20 - (L + 60) * eP2in(u);
      const sway = Math.sin(lt * 0.9) * 2;
      cam.fov = 70;
      cam.position.set(sway, -8 + Math.sin(lt * 1.3) * 1.5, z);
      cam.lookAt(sway * 0.5, -10, z - 300);
      cam.rotateZ(Math.sin(lt * 0.5) * 0.02 + u * u * 0.3);
      S.stars.visible = false;
      S.amb.intensity = 0.14;
      S.p1.color.copy(accent); S.p1.intensity = 1.1; S.p1.distance = 260;
      S.p1.position.set(0, 26, z - 60);
      // light rings: on one by one, flicker, then an overshoot that settles
      for (let f = 0; f <= NF; f++) {
        const on = 0.45 + f * 0.075, dt = lt - on;
        let b = dt < 0 ? 0.02 : dt < 0.12 ? (Math.floor(dt * 40) % 2 ? 0.2 : 1.3) : 0.85 + 1.1 * Math.exp(-(dt - 0.12) * 6);
        if (u > 0) b *= 1 + u * 0.8;
        col.copy(accent).multiplyScalar(b);
        for (let k = 0; k < 6; k++) lamps.setColorAt(f * 6 + k, col);
      }
      lamps.instanceColor.needsUpdate = true;
      // runway lights chase toward the door once everything is on
      const chase = clamp01((lt - 2.6) / 0.4);
      for (let k = 0; k < nRun * 2; k++) {
        const zz = Math.floor(k / 2) * 22, b = chase * (0.12 + 2.2 * Math.pow(Math.max(0, Math.sin(zz * 0.03 + lt * 10)), 16));
        run.setColorAt(k, col.copy(warm).multiplyScalar(b));
      }
      run.instanceColor.needsUpdate = true;
      const od = eP2io(clamp01((lt - 3.4) / 1.3));
      doorL.position.x = -R * 0.55 - od * R * 1.15;
      doorR.position.x = R * 0.55 + od * R * 1.15;
      light.material.color.setScalar(0.25 + 2.4 * od);
      S.bloom.strength = 1.0; S.bloom.radius = 0.5; S.bloom.threshold = 0.38;
    });

    const c = copy(D, 'corridor', (o.lines || ['PREPARADOS', 'PARA EL SALTO.']).map((text, i) => ({ text, cls: 'x3-big', y: 470 + i * 150 })));
    D.show(c.s, T);
    D.setBg(C.night, T);
    D.ink(C.paper, T);
    tl.set(D.bars, { height: 540 }, T);
    D.barsTo(110, T + 0.05, 1.6);
    if (o.label) D.label(T + 0.8, o.label);
    const P = { n: 0 }, status = o.status || 'SISTEMAS EN LÍNEA';
    c.cap.textContent = `${status} · 00/${NF + 1}`;
    tl.to(P, { n: NF + 1, duration: NF * 0.075 + 0.1, ease: 'none', onUpdate: () => { c.cap.textContent = `${status} · ${String(Math.round(P.n)).padStart(2, '0')}/${NF + 1}`; } }, T + 0.45);
    tl.to(c.cap, { opacity: 0, duration: 0.3 }, T + dur - 0.8);
    c.els.forEach((el, i) => rise(D, el, T + 3.3 + i * 0.35, T + dur - 0.75));
    D.call(() => SFX.pad('hangar', [41.2, 61.74, 82.41], 2, 0.05, 280), T + 0.02);
    for (let f = 0; f <= NF; f += 3) D.sfx('tick', T + 0.45 + f * 0.075, 0.05);
    D.sfx('kick', T + 0.45, 0.7);
    D.sfx('boom', T + go, 0.5);
    D.sfx('whoosh', T + 3.4, 1.3, 0.25);
    D.sfx('riser', T + 3.6, dur - 3.6, 0.4);
    D.call(() => SFX.padStop('hangar', 0.4), T + dur - 0.3);
    D.flash(T + dur - 0.12, 1, 0.6);
    D.hide(c.s, T + dur);
    return dur;
  });

  // ------------------------------------------------------------------ JUMP
  // Open space, a countdown… then the jump: every star stretches into a streak,
  // the field of view kicks wide, a flare blooms at the vanishing point.    5 s
  recipe('jump', (D, T, o) => {
    const { tl, C, N } = D;
    const S = x3(D), T3 = S.T3, dur = o.duration || 5, J = o.at ?? 2.4;
    const NSt = 4200, ZL = 9000, accent = new T3.Color(o.color || C.a[0]), hot = new T3.Color(o.hot || C.a[4]);
    const pos = new Float32Array(NSt * 6), colr = new Float32Array(NSt * 6);
    const px = new Float32Array(NSt), py = new Float32Array(NSt), z0 = new Float32Array(NSt), br = new Float32Array(NSt), tint = [];
    for (let i = 0; i < NSt; i++) {
      const a = hash(i, 11) * TAU, r = 30 + Math.pow(hash(i, 12), 0.6) * 1400;
      px[i] = Math.cos(a) * r; py[i] = Math.sin(a) * r; z0[i] = -hash(i, 13) * ZL; br[i] = 0.35 + hash(i, 14) * 0.9;
      const k = hash(i, 15);
      tint.push(k < 0.12 ? accent : k > 0.94 ? hot : new T3.Color(0.78, 0.86, 1));
    }
    const geo = new T3.BufferGeometry();
    geo.setAttribute('position', new T3.BufferAttribute(pos, 3).setUsage(T3.DynamicDrawUsage));
    geo.setAttribute('color', new T3.BufferAttribute(colr, 3).setUsage(T3.DynamicDrawUsage));
    const lines = new T3.LineSegments(geo, new T3.LineBasicMaterial({ vertexColors: true, transparent: true, blending: T3.AdditiveBlending, depthWrite: false, fog: false }));
    lines.frustumCulled = false;
    const flare = new T3.Sprite(new T3.SpriteMaterial({ map: radialTexture(T3), color: accent, blending: T3.AdditiveBlending, transparent: true, depthWrite: false, fog: false }));
    flare.position.set(0, 0, -4000);
    const g = new T3.Group();
    g.add(lines, flare);
    const K = 2.4, V = 16000;
    const travel = u => (u < J ? 60 * u : 60 * J + 60 * (u - J) + V * ((u - J) - (1 - Math.exp(-K * (u - J))) / K));
    const speed = u => (u < J ? 60 : 60 + V * (1 - Math.exp(-K * (u - J))));

    shot(D, T, dur, [g], lt => {
      const tr = travel(lt), v = speed(lt), streak = Math.min(3400, 4 + v * 0.1);
      for (let i = 0; i < NSt; i++) {
        const z = (((z0[i] + tr) % ZL) + ZL) % ZL - ZL, f = Math.pow(1 - -z / ZL, 1.6) * br[i], c = tint[i], b = i * 6;
        pos[b] = px[i]; pos[b + 1] = py[i]; pos[b + 2] = z;
        pos[b + 3] = px[i]; pos[b + 4] = py[i]; pos[b + 5] = z - streak;
        colr[b] = c.r * f; colr[b + 1] = c.g * f; colr[b + 2] = c.b * f;
        colr[b + 3] = c.r * f * 0.05; colr[b + 4] = c.g * f * 0.05; colr[b + 5] = c.b * f * 0.05;
      }
      geo.attributes.position.needsUpdate = true;
      geo.attributes.color.needsUpdate = true;
      const kj = clamp01((lt - J) / 1.4);
      S.cam.fov = 50 + 48 * eXO(kj);
      S.cam.position.set(0, 0, 0);
      S.cam.lookAt(0, 0, -1);
      S.cam.rotateZ(lt * 0.08 + eP2io(kj) * 0.5);
      flare.scale.setScalar(80 + (lt > J ? 1400 * eXO(clamp01((lt - J) / 0.7)) : Math.sin(lt * 6) * 10));
      S.stars.visible = lt < J + 0.25;
      S.bloom.strength = lt < J ? 1 : 1 + 1.5 * clamp01((lt - J) / 0.5);
      S.bloom.radius = 0.6; S.bloom.threshold = 0.05;
    });

    const counts = (o.count || ['3', '2', '1']);
    const s = D.scene('jump', counts.map(n => `<div class="x3-count v c">${n}</div>`).join('') + '<div class="x3-cap mono"></div>');
    const nums = D.$$('.x3-count', s), cap = D.$('.x3-cap', s);
    gsap.set(nums, { opacity: 0, scale: 1.4 });
    D.show(s, T);
    if (o.label) D.label(T + 0.1, o.label);
    nums.forEach((el, i) => {
      const t = T + 0.15 + i * 0.7;
      tl.to(el, { opacity: 1, scale: 1, duration: 0.35, ease: 'expo.out' }, t);
      tl.to(el, { opacity: 0, scale: 0.9, duration: 0.2, ease: 'power2.in' }, t + 0.5);
      D.sfx('beep', t, i === counts.length - 1 ? 1320 : 880, 0.18, 0.1);
    });
    D.flash(T + J, 0.7, 0.8);
    D.shake(T + J, 0.9, 18);
    D.sfx('braam', T + J, 0.8);
    D.sfx('boom', T + J, 1);
    D.sfx('crash', T + J, 0.3);
    D.sfx('whoosh', T + J, 1.6, 0.5);
    caption(D, cap, o.caption || 'SALTO ACTIVADO', T + J + 0.4, T + dur - 0.4);
    D.flash(T + dur - 0.12, 1, 0.6);
    D.hide(s, T + dur);
    return dur;
  });

  // ------------------------------------------------------------------ HYPERTUNNEL
  // Inside hyperspace: a winding tube of light (custom shader: racing rings +
  // twisting lanes, bloom), the camera banks through its curves.       6 s
  recipe('hypertunnel', (D, T, o) => {
    const { tl, C, N } = D;
    const S = x3(D), T3 = S.T3, dur = o.duration || 6;
    const pts = Array.from({ length: 16 }, (_, k) => new T3.Vector3(Math.sin(k * 0.85) * 300, Math.cos(k * 0.62) * 200, -k * 750));
    const curve = new T3.CatmullRomCurve3(pts);
    const mat = new T3.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 }, uFlash: { value: 0 },
        uA: { value: new T3.Color(o.colors?.[0] || C.a[0]) }, uB: { value: new T3.Color(o.colors?.[1] || C.a[4]) },
      },
      vertexShader: 'varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: `
uniform float uTime, uFlash; uniform vec3 uA, uB; varying vec2 vUv;
void main() {
  float x = vUv.x * 170.0 - uTime * 14.0;
  float ring = pow(0.5 + 0.5 * cos(x * 6.2831), 40.0);
  float lane = pow(0.5 + 0.5 * cos(vUv.y * 6.2831 * 10.0 + sin(vUv.x * 80.0 + uTime) * 0.8), 22.0);
  float spark = pow(0.5 + 0.5 * sin(vUv.x * 900.0 - uTime * 60.0 + vUv.y * 40.0), 30.0);
  vec3 c = mix(uA, uB, 0.5 + 0.5 * sin(vUv.x * 18.0 - uTime * 1.5));
  float i = ring * 1.25 + lane * (0.25 + 0.55 * (0.5 + 0.5 * sin(vUv.x * 300.0 - uTime * 30.0))) + spark * 0.45 + 0.03;
  gl_FragColor = vec4(c * i + vec3(uFlash), 1.0);
}`,
      side: T3.BackSide, fog: false,
    });
    const tube = new T3.Mesh(new T3.TubeGeometry(curve, 1200, 80, 24, false), mat);
    tube.frustumCulled = false;
    const g = new T3.Group();
    g.add(tube);
    const A = new T3.Vector3(), B = new T3.Vector3(), t1 = new T3.Vector3(), t2 = new T3.Vector3();

    shot(D, T, dur, [g], lt => {
      const u = lt / dur, s = 0.01 + 0.86 * (0.62 * u + 0.38 * u * u);
      curve.getPointAt(s, A);
      curve.getPointAt(Math.min(1, s + 0.015), B);
      curve.getTangentAt(s, t1);
      curve.getTangentAt(Math.min(1, s + 0.03), t2);
      S.cam.fov = 72;
      S.cam.position.copy(A);
      S.cam.lookAt(B);
      S.cam.rotateZ(Math.max(-0.7, Math.min(0.7, (t2.x - t1.x) * 28)) + lt * 0.12);
      S.stars.visible = false;
      mat.uniforms.uTime.value = lt;
      mat.uniforms.uFlash.value = Math.pow(clamp01((lt - (dur - 0.6)) / 0.6), 2) * 1.4;
      S.bloom.strength = 1.25; S.bloom.radius = 0.65; S.bloom.threshold = 0.16;
    });

    const lines = o.lines || ['MÁS RÁPIDO', 'QUE LA LUZ.'];
    const c = copy(D, 'hypertunnel', lines.map(text => ({ text, cls: 'x3-big', y: 540 })));
    D.show(c.s, T);
    if (o.label) D.label(T, o.label);
    const half = (dur - 0.6) / lines.length;
    c.els.forEach((el, i) => rise(D, el, T + 0.4 + i * half, T + 0.4 + (i + 1) * half - 0.5));
    const P = { v: 1 }, unit = o.unit || 'c';
    tl.to(P, { v: o.peak || 42, duration: dur - 0.5, ease: 'power2.in', onUpdate: () => { c.cap.textContent = `${o.readout || 'VELOCIDAD'} ${P.v.toFixed(1).replace('.', ',')} ${unit}`; } }, T + 0.2);
    tl.to(c.cap, { opacity: 0, duration: 0.3 }, T + dur - 0.5);
    D.call(() => SFX.pad('hyper', [55, 82.41, 110, 164.81], 1.2, 0.045, 900), T + 0.02);
    for (let k = 0; k < dur - 1; k++) D.sfx('whoosh', T + 0.3 + k, 1.1, 0.22);
    D.sfx('riser', T + dur - 2, 1.9, 0.4);
    D.call(() => SFX.padStop('hyper', 0.3), T + dur - 0.2);
    D.flash(T + dur - 0.12, 1, 0.7);
    D.hide(c.s, T + dur);
    return dur;
  });

  // ------------------------------------------------------------------ PLANET3D
  // Out of hyperspace, beside a banded ice giant (procedural shader, lit from the
  // side, atmosphere halo), a ring system with a gap and the planet's shadow, a
  // moon and a distant sun. The camera glides past.                    6.5 s
  recipe('planet3d', (D, T, o) => {
    const { tl, C, N } = D;
    const S = x3(D), T3 = S.T3, dur = o.duration || 6.5, R = 300;
    const pal = (o.colors || ['#0b2a6b', '#2aa7c9', '#bdf3ff', '#ff5ea8']).map(c => new T3.Color(c));
    const atm = new T3.Color(o.atmosphere || C.a[0]);
    const sunDir = new T3.Vector3(-1, 0.32, -0.3).normalize();
    const planet = new T3.Mesh(new T3.SphereGeometry(R, 160, 80), new T3.ShaderMaterial({
      uniforms: { uTime: { value: 0 }, uSun: { value: sunDir }, uC1: { value: pal[0] }, uC2: { value: pal[1] }, uC3: { value: pal[2] }, uC4: { value: pal[3] }, uAtm: { value: atm } },
      vertexShader: `varying vec3 vP; varying vec3 vWN; varying vec3 vWP;
void main() { vP = normalize(position); vWN = normalize(mat3(modelMatrix) * normal); vec4 wp = modelMatrix * vec4(position, 1.0); vWP = wp.xyz; gl_Position = projectionMatrix * viewMatrix * wp; }`,
      fragmentShader: `uniform float uTime; uniform vec3 uSun, uC1, uC2, uC3, uC4, uAtm; varying vec3 vP; varying vec3 vWN; varying vec3 vWP;
${NOISE}
void main() {
  vec3 p = vP;
  float w = fbm(p * 2.6 + vec3(0.0, 0.0, uTime * 0.03));
  float lat = p.y + (w - 0.5) * 0.22;
  float band = 0.5 + 0.5 * sin(lat * 24.0 + sin(lat * 7.0) * 1.5);
  float band2 = 0.5 + 0.5 * sin(lat * 61.0 + w * 4.0);
  vec3 col = mix(uC1, uC2, band);
  col = mix(col, uC3, band2 * 0.35);
  float st = smoothstep(0.2, 0.0, distance(p, normalize(vec3(0.55, -0.28, 0.79))) + (fbm(p * 9.0) - 0.5) * 0.08);
  col = mix(col, uC4, st * 0.85);
  vec3 N = normalize(vWN);
  float d = dot(N, uSun), lit = smoothstep(-0.12, 0.5, d);
  vec3 V = normalize(cameraPosition - vWP);
  float fres = pow(1.0 - max(dot(N, V), 0.0), 2.5);
  gl_FragColor = vec4(col * (0.02 + 1.1 * lit) + uAtm * fres * smoothstep(-0.3, 0.4, d) * 0.9, 1.0);
}`,
      fog: false,
    }));
    const halo = new T3.Mesh(new T3.SphereGeometry(R * 1.07, 96, 48), new T3.ShaderMaterial({
      uniforms: { uAtm: { value: atm }, uSun: { value: sunDir } },
      vertexShader: 'varying vec3 vN; varying vec3 vWN; void main() { vN = normalize(normalMatrix * normal); vWN = normalize(mat3(modelMatrix) * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: `uniform vec3 uAtm, uSun; varying vec3 vN; varying vec3 vWN;
void main() { float i = pow(clamp(-vN.z / 0.36, 0.0, 1.0), 2.2) * smoothstep(-0.35, 0.35, dot(vWN, uSun)); gl_FragColor = vec4(uAtm * i * 1.3, 1.0); }`,
      side: T3.BackSide, transparent: true, blending: T3.AdditiveBlending, depthWrite: false, fog: false,
    }));
    const ringGeo = new T3.RingGeometry(R * 1.45, R * 2.35, 256, 1);
    ringGeo.rotateX(-Math.PI / 2);
    const rings = new T3.Mesh(ringGeo, new T3.ShaderMaterial({
      uniforms: { uSun: { value: sunDir }, uR0: { value: R * 1.45 }, uR1: { value: R * 2.35 }, uPR: { value: R }, uC: { value: new T3.Color(o.ringColor || '#d8e6ff') } },
      vertexShader: 'varying float vR; varying vec3 vW; void main() { vR = length(position.xz); vec4 wp = modelMatrix * vec4(position, 1.0); vW = wp.xyz; gl_Position = projectionMatrix * viewMatrix * wp; }',
      fragmentShader: `uniform float uR0, uR1, uPR; uniform vec3 uSun, uC; varying float vR; varying vec3 vW;
void main() {
  float r = (vR - uR0) / (uR1 - uR0);
  float b = 0.5 + 0.5 * sin(r * 70.0) * sin(r * 23.0 + 1.3);
  float fine = 0.85 + 0.15 * sin(r * 260.0);
  float a = (0.1 + 0.36 * b) * fine * smoothstep(0.0, 0.05, r) * smoothstep(1.0, 0.8, r);
  a *= 1.0 - 0.92 * (smoothstep(0.58, 0.6, r) - smoothstep(0.64, 0.66, r));
  float s = dot(vW, uSun);
  float sh = (s < 0.0 && length(vW - uSun * s) < uPR) ? 0.1 : 1.0;
  gl_FragColor = vec4(uC * (0.3 + 0.32 * b) * sh, a);
}`,
      side: T3.DoubleSide, transparent: true, depthWrite: false, fog: false,
    }));
    const moon = new T3.Mesh(new T3.SphereGeometry(30, 48, 24), new T3.MeshStandardMaterial({ color: 0x9aa4b8, roughness: 0.9, metalness: 0 }));
    const sunGlow = new T3.Sprite(new T3.SpriteMaterial({ map: radialTexture(T3), color: new T3.Color(3, 2.6, 2), blending: T3.AdditiveBlending, transparent: true, depthWrite: false, fog: false }));
    sunGlow.position.copy(sunDir).multiplyScalar(8000);
    sunGlow.scale.setScalar(1500);
    const tilt = new T3.Group();
    tilt.rotation.set(0.28, 0, 0.32);
    tilt.add(planet, halo, rings);
    const g = new T3.Group();
    g.add(tilt, moon, sunGlow);

    shot(D, T, dur, [g], lt => {
      const u = eIO(clamp01(lt / dur)), a = 1.05 - 1.3 * u, rad = 1250 + 450 * u, h = 170 - 110 * u;
      S.cam.position.set(Math.sin(a) * rad, h, Math.cos(a) * rad);
      S.cam.lookAt(-90 * (1 - u), -90, 0);
      S.cam.rotateZ(0.06 - 0.1 * u);
      planet.rotation.y = lt * 0.06;
      rings.rotation.y = lt * 0.02;
      planet.material.uniforms.uTime.value = lt;
      const ma = 2.2 + lt * 0.18;
      moon.position.set(Math.cos(ma) * 820, 90, Math.sin(ma) * 820);
      S.sun.position.copy(sunDir).multiplyScalar(1000);
      S.sun.intensity = 2.2;
      S.amb.intensity = 0.02;
      S.bloom.strength = 0.9; S.bloom.radius = 0.6; S.bloom.threshold = 0.32;
      S.opacity = 1;
    });

    const c = copy(D, 'planet3d', [{ text: o.word || 'NUEVOS MUNDOS', cls: 'x3-thin', y: 830 }]);
    gsap.set(c.els, { opacity: 0, letterSpacing: '0.8em', paddingLeft: '0.8em', filter: 'blur(12px)' });
    D.show(c.s, T);
    if (o.label) D.label(T, o.label);
    tl.to(c.els, { opacity: 1, letterSpacing: '0.3em', paddingLeft: '0.3em', filter: 'blur(0px)', duration: 1.6, ease: 'expo.out' }, T + 0.9);
    tl.to(c.els, { opacity: 0, filter: 'blur(10px)', duration: 0.5, ease: 'power2.in' }, T + dur - 0.7);
    caption(D, c.cap, o.caption, T + 1.4, T + dur - 0.6);
    D.call(() => SFX.pad('planet', [110, 164.81, 220, 329.63], 1.5, 0.035, 1400), T + 0.02);
    D.sfx('boom', T + 0.05, 0.6);
    [N.E4, N.A4, N.E5].forEach((f, i) => D.sfx('bell', T + 0.9 + i * 0.25, f, 0.07));
    D.sfx('swell', T + 2, 3.5, 0.15);
    D.call(() => SFX.padStop('planet', 1), T + dur - 0.6);
    D.hide(c.s, T + dur);
    return dur;
  });

  // ------------------------------------------------------------------ ASTEROIDS
  // Weaving through an asteroid field: 450 unique lit rocks (3 procedural shapes,
  // each instance scaled and tumbling), dust, three near misses, distance fog.   5.5 s
  recipe('asteroids', (D, T, o) => {
    const { tl, C, N } = D;
    const S = x3(D), T3 = S.T3, dur = o.duration || 5.5, NA = o.count || 450, SPD = 1100;
    const pathX = z => Math.sin(z * 0.0009) * 260, pathY = z => Math.cos(z * 0.0007) * 140 - 20;
    function rock(seed) {
      const geo = new T3.IcosahedronGeometry(1, 2), p = geo.attributes.position, v = new T3.Vector3();
      const f1 = 1.5 + hash(seed, 1) * 1.5, f2 = 2.5 + hash(seed, 2) * 2, ph = hash(seed, 3) * 10;
      for (let i = 0; i < p.count; i++) {
        v.fromBufferAttribute(p, i);
        const n1 = Math.sin(v.x * f1 + ph) * Math.sin(v.y * f1 * 1.3 + ph * 0.7) * Math.sin(v.z * f1 * 0.9 + ph * 1.3);
        const n2 = Math.sin(v.x * f2 + ph * 2) * Math.sin(v.y * f2 + 1.1) * Math.sin(v.z * f2 * 1.2 + 0.4);
        v.multiplyScalar(1 + 0.34 * n1 + 0.13 * n2);
        v.x *= 1 + hash(seed, 4) * 0.45;
        p.setXYZ(i, v.x, v.y, v.z);
      }
      geo.computeVertexNormals();
      return geo;
    }
    const mat = new T3.MeshStandardMaterial({ color: o.rock || 0x5a534d, roughness: 0.95, metalness: 0.05, flatShading: true });
    const kinds = [0, 1, 2].map(k => new T3.InstancedMesh(rock(k * 17 + 3), mat, Math.ceil(NA / 3)));
    const data = [];
    const tMiss = o.misses || [1.35, 2.75, 4.05];
    for (let i = 0; i < NA; i++) {
      let x, y, z, s;
      if (i < tMiss.length) {
        z = 400 - tMiss[i] * SPD - 60;
        const side = [[1, 0.25], [-1, 0.4], [0.3, 1]][i];
        x = pathX(z) + side[0] * 135; y = pathY(z) + side[1] * 110; s = 55 + i * 12;
      } else {
        z = 300 - hash(i, 21) * 6800;
        const a = hash(i, 22) * TAU, r = 120 + Math.pow(hash(i, 23), 0.8) * 950;
        x = pathX(z) + Math.cos(a) * r; y = pathY(z) + Math.sin(a) * r * 0.7;
        s = 8 + Math.pow(hash(i, 24), 3) * 110;
      }
      const ax = new T3.Vector3(hash(i, 25) - 0.5, hash(i, 26) - 0.5, hash(i, 27) - 0.5).normalize();
      data.push({ mesh: kinds[i % 3], idx: Math.floor(i / 3), p: new T3.Vector3(x, y, z), s: new T3.Vector3(s, s * (0.7 + hash(i, 28) * 0.5), s), ax, w: 0.2 + hash(i, 29) * 1.2, a0: hash(i, 30) * TAU });
    }
    kinds.forEach(k => { k.count = data.filter(d => d.mesh === k).length; });
    const ND = 2500, dp = new Float32Array(ND * 3);
    for (let i = 0; i < ND; i++) {
      const z = 300 - hash(i, 41) * 6800, a = hash(i, 42) * TAU, r = 20 + hash(i, 43) * 700;
      dp.set([pathX(z) + Math.cos(a) * r, pathY(z) + Math.sin(a) * r, z], i * 3);
    }
    const dg = new T3.BufferGeometry();
    dg.setAttribute('position', new T3.BufferAttribute(dp, 3));
    const dust = new T3.Points(dg, new T3.PointsMaterial({ color: 0x8a90a0, size: 1.6, sizeAttenuation: false, transparent: true, opacity: 0.7, depthWrite: false }));
    dust.frustumCulled = false;
    const g = new T3.Group();
    kinds.forEach(k => g.add(k));
    g.add(dust);
    const q = new T3.Quaternion(), mtx = new T3.Matrix4();
    const rimCol = new T3.Color(o.rim || C.a[0]), sunCol = new T3.Color(o.sunColor || '#ffd9a8');

    shot(D, T, dur, [g], lt => {
      for (const d of data) {
        q.setFromAxisAngle(d.ax, d.a0 + lt * d.w);
        mtx.compose(d.p, q, d.s);
        d.mesh.setMatrixAt(d.idx, mtx);
      }
      kinds.forEach(k => { k.instanceMatrix.needsUpdate = true; });
      const z = 400 - lt * SPD, x = pathX(z), y = pathY(z), zf = z - 320;
      S.cam.fov = 62;
      S.cam.position.set(x, y, z);
      S.cam.lookAt(pathX(zf), pathY(zf), zf);
      S.cam.rotateZ(-(pathX(zf) - x) * 0.004 + Math.sin(lt * 1.3) * 0.05);
      S.scene.fog.near = 700; S.scene.fog.far = 4400;
      S.sun.color.copy(sunCol); S.sun.position.set(-0.6, 0.5, 0.4).multiplyScalar(1000); S.sun.intensity = 1.25;
      S.rim.color.copy(rimCol); S.rim.position.set(0.5, -0.2, -1).multiplyScalar(1000); S.rim.intensity = 0.9;
      S.amb.intensity = 0.07;
      S.bloom.strength = 0.5; S.bloom.radius = 0.5; S.bloom.threshold = 0.85;
    });

    const c = copy(D, 'asteroids', (o.lines || ['NAVEGAR', 'EL CAOS.']).map((text, i) => ({ text, cls: 'x3-big', y: 470 + i * 150 })));
    D.show(c.s, T);
    if (o.label) D.label(T, o.label);
    c.els.forEach((el, i) => rise(D, el, T + 1.8 + i * 0.3, T + dur - 0.8));
    caption(D, c.cap, o.caption, T + 0.5, T + dur - 0.5);
    D.call(() => SFX.pad('rocks', [36.71, 55, 73.42], 1, 0.05, 260), T + 0.02);
    tMiss.forEach(tm => { D.sfx('whoosh', T + tm - 0.45, 0.8, 0.5); D.sfx('boom', T + tm, 0.35); });
    D.call(() => SFX.padStop('rocks', 0.5), T + dur - 0.4);
    D.hide(c.s, T + dur);
    return dur;
  });

  // ------------------------------------------------------------------ GATE
  // A colossal ring gate: metal torus, 48 lights chasing around it, a swirling
  // energy disc. The camera accelerates straight through it (flash).        5 s
  recipe('gate', (D, T, o) => {
    const { tl, C, N } = D;
    const S = x3(D), T3 = S.T3, dur = o.duration || 5, RG = 380, Z0 = 1900;
    const accent = new T3.Color(o.color || C.a[0]), hot = new T3.Color(o.hot || C.a[4]);
    const torus = new T3.Mesh(new T3.TorusGeometry(RG, 26, 24, 200), new T3.MeshStandardMaterial({ color: 0x2a3144, metalness: 0.6, roughness: 0.32 }));
    const NL = 48, lamps = new T3.InstancedMesh(new T3.BoxGeometry(30, 12, 8), new T3.MeshBasicMaterial({ color: 0xffffff }), NL);
    const m = new T3.Object3D(), col = new T3.Color();
    for (let k = 0; k < NL; k++) {
      const a = (k / NL) * TAU;
      m.position.set(Math.cos(a) * (RG + 1), Math.sin(a) * (RG + 1), 22);
      m.rotation.set(0, 0, a + Math.PI / 2);
      m.updateMatrix();
      lamps.setMatrixAt(k, m.matrix);
      lamps.setColorAt(k, col.setRGB(0, 0, 0));
    }
    const clamps = new T3.InstancedMesh(new T3.BoxGeometry(60, 110, 70), new T3.MeshStandardMaterial({ color: 0x1c2233, metalness: 0.6, roughness: 0.4 }), 4);
    for (let k = 0; k < 4; k++) {
      const a = (k / 4) * TAU + Math.PI / 4;
      m.position.set(Math.cos(a) * (RG + 40), Math.sin(a) * (RG + 40), 0);
      m.rotation.set(0, 0, a);
      m.updateMatrix();
      clamps.setMatrixAt(k, m.matrix);
    }
    const disc = new T3.Mesh(new T3.CircleGeometry(RG - 16, 128), new T3.ShaderMaterial({
      uniforms: { uTime: { value: 0 }, uCharge: { value: 0 }, uA: { value: accent }, uB: { value: hot } },
      vertexShader: 'varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: `uniform float uTime, uCharge; uniform vec3 uA, uB; varying vec2 vUv;
void main() {
  vec2 p = vUv * 2.0 - 1.0; float r = length(p), a = atan(p.y, p.x);
  float sw = 0.5 + 0.5 * sin(a * 6.0 + r * 18.0 - uTime * 5.0);
  float sw2 = 0.5 + 0.5 * sin(a * 11.0 - r * 30.0 + uTime * 7.0);
  float glow = 1.0 - r;
  vec3 c = mix(uA, uB, sw) * (0.2 + 0.9 * sw * sw2) * (0.35 + glow) + vec3(1.0) * pow(max(glow, 0.0), 5.0) * (0.8 + 2.0 * uCharge);
  gl_FragColor = vec4(c * smoothstep(1.0, 0.96, r) * (0.55 + 0.6 * uCharge), 1.0);
}`,
      transparent: true, blending: T3.AdditiveBlending, depthWrite: false, side: T3.DoubleSide, fog: false,
    }));
    const g = new T3.Group();
    g.add(torus, lamps, clamps, disc);
    const zOf = u => Z0 - (Z0 + 300) * eP3in(u), tPass = Math.cbrt(Z0 / (Z0 + 300)) * dur; // camera crosses z = 0 at tPass

    shot(D, T, dur, [g], lt => {
      const u = clamp01(lt / dur), z = zOf(u), k = 1 - u;
      S.cam.fov = 55 + 18 * eP2in(u);
      S.cam.position.set(420 * k * k, 70 * k, z);
      S.cam.lookAt(0, 0, z - 900);
      S.cam.rotateZ(-0.12 * k + 0.25 * eP3in(u));
      const charge = clamp01(lt / (dur * 0.85));
      for (let q = 0; q < NL; q++) {
        const b = (0.15 + 0.6 * charge) + 2.4 * Math.pow(Math.max(0, Math.sin((q / NL) * TAU * 3 - lt * (4 + 6 * charge))), 8);
        lamps.setColorAt(q, col.copy(q % 2 ? accent : hot).multiplyScalar(b));
      }
      lamps.instanceColor.needsUpdate = true;
      disc.material.uniforms.uTime.value = lt;
      disc.material.uniforms.uCharge.value = charge;
      torus.rotation.z = lt * 0.05;
      S.sun.position.set(0.4, 0.6, 1).multiplyScalar(1000); S.sun.intensity = 1.4; S.sun.color.set(0xffffff);
      S.p1.color.copy(accent); S.p1.intensity = 3; S.p1.distance = 1100; S.p1.position.set(0, 0, 60);
      S.amb.intensity = 0.06;
      S.bloom.strength = 1.35; S.bloom.radius = 0.6; S.bloom.threshold = 0.15;
    });

    const c = copy(D, 'gate', (o.lines || ['EL ÚLTIMO', 'SALTO.']).map((text, i) => ({ text, cls: 'x3-big', y: 470 + i * 150 })));
    D.show(c.s, T);
    if (o.label) D.label(T, o.label);
    c.els.forEach((el, i) => rise(D, el, T + 0.6 + i * 0.3, T + 2.9));
    caption(D, c.cap, o.caption, T + 0.4, T + 2.9);
    D.call(() => SFX.pad('gate', [55, 73.42, 110], 1, 0.05, 500), T + 0.02);
    D.sfx('riser', T + 1.4, tPass - 1.4, 0.45);
    D.call(() => SFX.padStop('gate', 0.2), T + tPass);
    D.sfx('boom', T + tPass, 0.8);
    D.sfx('whoosh', T + tPass - 0.5, 0.9, 0.5);
    D.flash(T + tPass, 1, 0.7);
    D.hide(c.s, T + dur);
    return dur;
  });

  // ------------------------------------------------------------------ VOXELTITLE
  // The title as lit 3D blocks: they fly in from deep space and lock into place
  // (left to right), breathe, then part as the camera flies straight through it.  7.5 s
  recipe('voxeltitle', (D, T, o) => {
    const { tl, C, N } = D;
    const S = x3(D), T3 = S.T3, dur = o.duration || 7.5, STEP = o.step || 11;
    const cvs = document.createElement('canvas');
    cvs.width = D.W; cvs.height = D.H;
    const x = cvs.getContext('2d');
    const setFont = sz => { x.font = `900 ${sz}px "${D.cfg.fonts.display}"`; if (o.stretch && 'fontStretch' in x) x.fontStretch = 'expanded'; };
    const word = o.word || D.cfg.meta.title;
    setFont(300);
    const tw = x.measureText(word).width;
    if (tw > 1560) setFont(300 * 1560 / tw);
    x.fillStyle = '#fff'; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.fillText(word, D.CX, D.CY);
    const img = x.getImageData(0, 0, D.W, D.H).data, cells = [];
    for (let yy = STEP / 2; yy < D.H; yy += STEP) for (let xx = STEP / 2; xx < D.W; xx += STEP) if (img[(Math.floor(yy) * D.W + Math.floor(xx)) * 4 + 3] > 128) cells.push([xx - D.CX, D.CY - yy]);
    const NV = cells.length;
    const vox = new T3.InstancedMesh(new T3.BoxGeometry(STEP - 1.5, STEP - 1.5, STEP * 2.6), new T3.MeshStandardMaterial({ color: 0xffffff, metalness: 0.35, roughness: 0.32, emissive: new T3.Color(o.emissive || C.a[5]).multiplyScalar(0.22) }), NV);
    const spec = (o.colors || [C.a[0], C.a[5], C.a[4]]).map(c => new T3.Color(c)), col = new T3.Color();
    const V = cells.map(([cx, cy], i) => {
      const f = (cx + 800) / 1600, k = Math.min(1, Math.max(0, f)) * (spec.length - 1), j = Math.min(spec.length - 2, Math.floor(k));
      vox.setColorAt(i, col.copy(spec[j]).lerp(spec[j + 1], k - j));
      return {
        tx: cx, ty: cy, sx: cx + (hash(i, 51) - 0.5) * 1400, sy: cy + (hash(i, 52) - 0.5) * 900, sz: -2600 - hash(i, 53) * 2600,
        d: 0.25 + Math.min(1, Math.max(0, f)) * 1.05 + hash(i, 54) * 0.35,
        ax: new T3.Vector3(hash(i, 55) - 0.5, hash(i, 56) - 0.5, hash(i, 57) - 0.5).normalize(), sp: 2 + hash(i, 58) * 5,
      };
    });
    const g = new T3.Group();
    g.add(vox);
    const q = new T3.Quaternion(), P = new T3.Vector3(), SC = new T3.Vector3(1, 1, 1), mtx = new T3.Matrix4();
    const tFly = 5.1, dist = 540 / Math.tan((25 * Math.PI) / 180);

    shot(D, T, dur, [g], lt => {
      const fly = eP3in(clamp01((lt - tFly) / (dur - tFly - 0.2)));
      const part = eP2in(clamp01((lt - tFly) / 1.3));
      for (let i = 0; i < NV; i++) {
        const v = V[i], p = eXO(clamp01((lt - v.d) / 0.9));
        P.set(v.sx + (v.tx - v.sx) * p, v.sy + (v.ty - v.sy) * p, v.sz * (1 - p));
        if (p >= 1) P.z += Math.sin(v.tx * 0.02 - lt * 3) * 5;
        if (part > 0) { P.x += Math.sign(v.tx || 1) * part * (360 + Math.abs(v.tx) * 0.35); P.z += part * 260 * hash(i, 59); }
        q.setFromAxisAngle(v.ax, (1 - p) * v.sp + part * v.sp * 0.6);
        mtx.compose(P, q, SC);
        vox.setMatrixAt(i, mtx);
      }
      vox.instanceMatrix.needsUpdate = true;
      // orbit in from the side → frontal hold with a slow push → fly straight through
      const orbit = 1 - eP2io(clamp01(lt / 3.2)), push = eIO(clamp01((lt - 3) / 2.1));
      const r = dist + 350 * orbit - 160 * push, yaw = 0.42 * orbit;
      S.cam.fov = 50 + 25 * fly;
      if (fly <= 0) {
        S.cam.position.set(Math.sin(yaw) * r, 60 * orbit, Math.cos(yaw) * r);
        S.cam.lookAt(0, 0, 0);
      } else {
        S.cam.position.set(0, 0, r - (dist + 700) * fly);
        S.cam.lookAt(0, 0, S.cam.position.z - 1000);
      }
      S.sun.position.set(0.3, 0.7, 1).multiplyScalar(1000); S.sun.intensity = 1.5; S.sun.color.set(0xffffff);
      S.p1.color.copy(spec[0]); S.p1.intensity = 2.5; S.p1.distance = 2600; S.p1.position.set(-900, 300, 500);
      S.p2.color.copy(spec[spec.length - 1]); S.p2.intensity = 2.5; S.p2.distance = 2600; S.p2.position.set(900, -250, 500);
      S.amb.intensity = 0.12;
      const land = Math.exp(-Math.max(0, lt - 1.65) * 3) * (lt > 1.65 ? 1 : 0);
      S.bloom.strength = 1.1 + land * 1.2; S.bloom.radius = 0.55; S.bloom.threshold = 0.3;
      S.opacity = 1 - clamp01((lt - (dur - 0.5)) / 0.4);
    });

    const s = D.scene('voxeltitle', '<div class="x3-sub mono c"></div>');
    const sub = D.$('.x3-sub', s);
    D.show(s, T);
    if (o.label) D.label(T + 0.2, o.label);
    for (let k = 0; k < 14; k++) D.sfx('tick', T + 0.3 + k * 0.09, 0.04);
    D.flash(T + 1.65, 0.3, 0.6);
    D.sfx('braam', T + 1.65, 0.75);
    D.sfx('boom', T + 1.65, 0.9);
    D.call(() => SFX.pad('title', [110, 130.81, 164.81, 220], 1.2, 0.06, 900), T + 1.65);
    if (o.subtitle) {
      tl.set(sub, { opacity: 1 }, T + 2.6);
      tl.to(sub, { duration: 1.2, scrambleText: { text: o.subtitle, chars: 'upperCase', speed: 0.6 }, ease: 'none' }, T + 2.6);
      tl.to(sub, { opacity: 0, duration: 0.3 }, T + tFly - 0.1);
    }
    D.sfx('riser', T + tFly - 0.9, 1.2, 0.4);
    D.sfx('whoosh', T + tFly + 0.3, 1.2, 0.55);
    D.sfx('boom', T + dur - 0.45, 0.7);
    D.call(() => SFX.padStop('title', 2), T + dur - 0.5);
    D.hide(s, T + dur);
    return dur;
  });
  // toolkit for other 3D modules (recipes-city.js …)
  Trailer.three = { x3, shot, copy, rise, caption, radialTexture, hash, clamp01, E, NOISE };
})();
