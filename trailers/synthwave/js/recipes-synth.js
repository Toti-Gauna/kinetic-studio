/* ============================================================================
   SYNTH MODULE — 80s synthwave.
   One shared canvas layer (Trailer.synth.state(D)) paints, as pure functions of its
   tweened params: a gradient sky with twinkling stars, a neon sun with sliding
   stripes and a glow, two ridges of mountains with neon edges, a perspective grid
   scrolling toward the camera (param z), wireframe solids (cube, square pyramid,
   icosahedron — true edge counts), and deterministic TV static.
   VHS: cfg.vhs adds scanlines and rolling tracking bands over the whole film (plugin);
   the OSD ("PLAY ▶", date, counter) shows the viewer's real date (cfg.now / ?now=).
   Chrome type: a CSS gradient clipped to the letters with a travelling shine; neon
   script: serif italic with a flickering glow.
   Recipes: synboot, synride, synchrome, synwire, syntitle, synend.
   ========================================================================== */
(() => {
  'use strict';
  const { recipe } = Trailer;
  const HY = 640; // horizon
  const frac = x => x - Math.floor(x);
  const hash = (a, b) => frac(Math.sin(a * 12.9898 + b * 78.233) * 43758.5453);
  const PHI = (1 + Math.sqrt(5)) / 2;
  const SOLIDS = {
    cubo: (() => { const v = []; for (const x of [-1, 1]) for (const y of [-1, 1]) for (const z of [-1, 1]) v.push([x, y, z]); return v; })(),
    piramide: [[-1, 1, -1], [1, 1, -1], [1, 1, 1], [-1, 1, 1], [0, -1.2, 0]],
    icosaedro: (() => { const v = []; for (const a of [-1, 1]) for (const b of [-PHI, PHI]) v.push([0, a, b], [a, b, 0], [b, 0, a]); return v.map(p => p.map(c => c / PHI)); })(),
  };
  // edges = pairs at the minimum vertex distance (true for these three solids; the pyramid adds its base)
  const EDGES = {};
  for (const [k, v] of Object.entries(SOLIDS)) {
    let min = 1e9;
    const d = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
    for (let i = 0; i < v.length; i++) for (let j = i + 1; j < v.length; j++) min = Math.min(min, d(v[i], v[j]));
    const e = [];
    for (let i = 0; i < v.length; i++) for (let j = i + 1; j < v.length; j++) if (d(v[i], v[j]) < min * 1.01) e.push([i, j]);
    EDGES[k] = e;
  }
  EDGES.piramide = [[0, 1], [1, 2], [2, 3], [3, 0], [0, 4], [1, 4], [2, 4], [3, 4]];

  // ------------------------------------------------------------------ THE SHARED LAYER
  function synth(D) {
    if (D._synth) return D._synth;
    const W = D.W, R = D.rand;
    const ridge = (n, lo, hi, seedK) => Array.from({ length: n + 1 }, (_, i) => {
      const x = (i / n) * W, c = Math.min(1, Math.abs(x - W / 2) / (W * 0.32));
      return [x, HY - (lo + R() * (hi - lo)) * (0.15 + 0.85 * c * c) - seedK];
    });
    const G = {
      stars: Array.from({ length: 170 }, () => ({ x: R() * W, y: R() * (HY - 120), r: 0.6 + R() * 1.8, ph: R() * 6.28 })),
      back: ridge(34, 70, 240, 0), front: ridge(22, 30, 150, -6),
    };
    const S = { alpha: 0, t: 0, z: 0, sun: 0, sunRise: 0, grid: 0, stars: 0, mount: 0, noise: 0, wire: 0, shape: 'cubo', rx: 0, ry: 0, wx: 960, wy: 420, ws: 150, glow: 1, zv: 0 };
    D._synth = S;
    D.layer(S, g => draw(g, S, G, D));
    return S;
  }
  function draw(g, S, G, D) {
    const { W, H } = D, t = S.t, A0 = g.globalAlpha;
    // sky
    const sky = g.createLinearGradient(0, 0, 0, HY);
    sky.addColorStop(0, '#07011a'); sky.addColorStop(0.45, '#2a0a4c'); sky.addColorStop(0.82, '#7b1c6f'); sky.addColorStop(1, '#ff5f6d');
    g.fillStyle = sky; g.fillRect(0, 0, W, HY);
    // stars
    if (S.stars > 0.003) {
      g.fillStyle = '#ffffff';
      for (const s of G.stars) { g.globalAlpha = A0 * S.stars * (0.3 + 0.7 * Math.sin(t * 1.7 + s.ph) ** 2) * (1 - s.y / HY * 0.6); g.beginPath(); g.arc(s.x, s.y, s.r, 0, 6.283); g.fill(); }
      g.globalAlpha = A0;
    }
    // sun: glow, then the disc clipped by sliding stripes (lower half)
    if (S.sun > 0.003) {
      const R = 250, cx = W / 2, cy = HY + 40 - S.sunRise;
      g.save(); g.globalCompositeOperation = 'lighter';
      const gl = g.createRadialGradient(cx, cy, R * 0.6, cx, cy, R * 2.3);
      gl.addColorStop(0, `rgba(255,70,160,${0.45 * S.sun * S.glow})`); gl.addColorStop(1, 'rgba(255,70,160,0)');
      g.fillStyle = gl; g.fillRect(cx - R * 2.3, cy - R * 2.3, R * 4.6, R * 4.6);
      g.restore();
      g.save();
      g.beginPath(); g.rect(0, 0, W, HY); g.clip(); // behind the horizon
      g.beginPath();
      g.rect(cx - R, cy - R, R * 2, R * 1.05);
      const off = frac(t * 0.35);
      for (let k = 0; k < 9; k++) {
        const y0 = cy + R * 0.05 + ((k + off) / 9) * R * 0.95, gap = 2 + ((k + off) / 9) * 16, next = cy + R * 0.05 + ((k + 1 + off) / 9) * R * 0.95;
        g.rect(cx - R, y0 + gap, R * 2, Math.max(0, next - y0 - gap));
      }
      g.clip();
      const sg = g.createLinearGradient(0, cy - R, 0, cy + R);
      sg.addColorStop(0, '#ffe66d'); sg.addColorStop(0.55, '#ff8a3d'); sg.addColorStop(1, '#ff2e97');
      g.globalAlpha = A0 * S.sun; g.fillStyle = sg;
      g.beginPath(); g.arc(cx, cy, R, 0, 6.283); g.fill();
      g.restore();
      g.globalAlpha = A0;
    }
    // mountains
    if (S.mount > 0.003) {
      [[G.back, '#1c0736', '#ff2e97'], [G.front, '#0c0321', '#34e1ff']].forEach(([pts, fill, edge]) => {
        g.beginPath(); g.moveTo(0, HY); pts.forEach(([x, y]) => g.lineTo(x, y)); g.lineTo(W, HY); g.closePath();
        g.globalAlpha = A0 * S.mount; g.fillStyle = fill; g.fill();
        g.save(); g.globalCompositeOperation = 'lighter';
        g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
        g.strokeStyle = edge; g.lineWidth = 6; g.globalAlpha = A0 * S.mount * 0.18; g.stroke();
        g.lineWidth = 2; g.globalAlpha = A0 * S.mount * 0.9; g.stroke();
        g.restore();
      });
      g.globalAlpha = A0;
    }
    // ground + grid
    const gg = g.createLinearGradient(0, HY, 0, H);
    gg.addColorStop(0, '#1b0535'); gg.addColorStop(1, '#040010');
    g.fillStyle = gg; g.fillRect(0, HY, W, H - HY);
    if (S.grid > 0.003) {
      g.save(); g.globalCompositeOperation = 'lighter';
      const lines = () => {
        g.beginPath();
        for (let i = -34; i <= 34; i++) { g.moveTo(W / 2, HY); g.lineTo(W / 2 + i * 190, H + 400); }
        const f = frac(S.z);
        for (let k = 1; k < 44; k++) { const zk = k - f; if (zk < 0.35) continue; const y = HY + (H - HY) * 0.62 / zk; if (y > H + 4) continue; g.moveTo(0, y); g.lineTo(W, y); }
      };
      lines(); g.strokeStyle = '#ff2e97';
      g.lineWidth = 6; g.globalAlpha = A0 * S.grid * 0.16; g.stroke();
      g.lineWidth = 1.8; g.globalAlpha = A0 * S.grid * 0.85; g.stroke();
      // fade the far grid into a horizon haze
      g.restore();
      const hz = g.createLinearGradient(0, HY, 0, HY + 140);
      hz.addColorStop(0, `rgba(40,6,70,${0.95 * S.grid})`); hz.addColorStop(1, 'rgba(40,6,70,0)');
      g.fillStyle = hz; g.fillRect(0, HY, W, 140);
    }
    // horizon line
    g.save(); g.globalCompositeOperation = 'lighter';
    const hl = g.createLinearGradient(0, HY - 30, 0, HY + 30);
    hl.addColorStop(0, 'rgba(255,90,170,0)'); hl.addColorStop(0.5, `rgba(255,90,170,${0.55 * Math.max(S.grid, S.mount)})`); hl.addColorStop(1, 'rgba(255,90,170,0)');
    g.fillStyle = hl; g.fillRect(0, HY - 30, W, 60);
    g.restore();
    // wireframe solid
    if (S.wire > 0.003) {
      const v = SOLIDS[S.shape] || SOLIDS.cubo, e = EDGES[S.shape] || EDGES.cubo;
      const cx = Math.cos(S.rx), sx = Math.sin(S.rx), cy = Math.cos(S.ry), sy = Math.sin(S.ry), f = 5;
      const P = v.map(([x, y, z]) => { const x1 = x * cy + z * sy, z1 = -x * sy + z * cy, y2 = y * cx - z1 * sx, z2 = y * sx + z1 * cx, k = f / (f + z2); return [S.wx + x1 * S.ws * k, S.wy + y2 * S.ws * k]; });
      g.save(); g.globalCompositeOperation = 'lighter';
      g.beginPath(); e.forEach(([a, b]) => { g.moveTo(P[a][0], P[a][1]); g.lineTo(P[b][0], P[b][1]); });
      g.strokeStyle = '#34e1ff'; g.lineJoin = 'round'; g.lineCap = 'round';
      g.lineWidth = 12; g.globalAlpha = A0 * S.wire * 0.12; g.stroke();
      g.lineWidth = 3.5; g.globalAlpha = A0 * S.wire; g.stroke();
      g.fillStyle = '#ffffff';
      P.forEach(([x, y]) => { g.beginPath(); g.arc(x, y, 5, 0, 6.283); g.fill(); });
      g.restore();
    }
    // TV static (deterministic: hashed per 1/24 s)
    if (S.noise > 0.003) {
      const fr = Math.floor(t * 24);
      g.globalAlpha = A0 * S.noise; g.fillStyle = '#0a0a0a'; g.fillRect(0, 0, W, H);
      for (let i = 0; i < 2600; i++) { const x = hash(i, fr) * W, y = hash(fr, i + 0.5) * H, c = Math.floor(hash(i + fr, 3.1) * 255); g.fillStyle = `rgb(${c},${c},${c})`; g.fillRect(x, y, 3 + hash(i, 7) * 10, 2); }
      for (let b = 0; b < 3; b++) { const y = hash(b, fr * 0.13) * H; g.globalAlpha = A0 * S.noise * 0.25; g.fillStyle = '#ffffff'; g.fillRect(0, y, W, 6 + hash(b, fr) * 30); }
      g.globalAlpha = A0;
    }
  }
  /** Scene bookkeeping: the layer on, film time → S.t, grid distance travelled at `speed`. */
  function look(D, S, T, dur, set, speed = 3) {
    D.tl.set(S, { alpha: 1, t: T, noise: 0, wire: 0, ...set }, T);
    D.tl.to(S, { t: T + dur, duration: dur, ease: 'none' }, T);
    const z0 = S.zv; S.zv += speed * dur;
    D.hit(S, { z: z0 }, { z: S.zv, duration: dur, ease: 'none' }, T); // set + to: rewinds cleanly
  }

  // ------------------------------------------------------------------ VHS (plugin) + OSD
  Trailer.plugin({
    done: (D, cfg) => {
      if (!cfg.vhs) return;
      const el = document.createElement('div');
      el.className = 'syn-vhs';
      el.innerHTML = '<i class="syn-scan"></i><i class="syn-band"></i>';
      D.stage.appendChild(el);
      const band = el.querySelector('.syn-band'), dur = D.tl.duration(), every = cfg.vhs.every || 6.5;
      gsap.set(band, { y: -200, opacity: 0 });
      for (let t = cfg.vhs.first ?? 3; t < dur - 1; t += every) {
        D.hit(band, { y: -200, opacity: 0.9 }, { y: D.H + 200, duration: 1.4, ease: 'none' }, t);
        D.tl.set(band, { opacity: 0 }, t + 1.4);
        D.hit(D.camera, { x: 0 }, { keyframes: [{ x: 7, duration: 0.05 }, { x: -5, duration: 0.05 }, { x: 0, duration: 0.08 }] }, t + 0.5);
      }
    },
  });
  function osd(D, s, o = {}) {
    const q = new URLSearchParams(location.search);
    const now = D.cfg.now ? new Date(D.cfg.now) : q.get('now') ? new Date(q.get('now')) : new Date();
    const date = new Intl.DateTimeFormat(D.cfg.locale || 'es-AR', { day: '2-digit', month: 'short', year: 'numeric' }).format(now).toUpperCase().replace(/\./g, '').replace(/ DE /g, ' ');
    const el = document.createElement('div');
    el.className = 'syn-osd';
    el.innerHTML = `<b class="syn-o1">${o.mode || 'PLAY ▶'}</b><b class="syn-o2">SP</b><b class="syn-o3">${date}</b><b class="syn-o4">0:00:00</b>`;
    s.appendChild(el);
    return { el, mode: el.querySelector('.syn-o1'), counter: el.querySelector('.syn-o4') };
  }
  function counter(D, el, T, dur, from = 0, rate = 1) {
    const C = { v: from };
    const paint = () => { const s = Math.max(0, Math.floor(C.v)); el.textContent = `${Math.floor(s / 3600)}:${String(Math.floor(s / 60) % 60).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; };
    paint();
    D.tl.to(C, { v: from + dur * rate, duration: dur, ease: 'none', onUpdate: paint }, T);
  }

  // ------------------------------------------------------------------ SYNBOOT
  recipe('synboot', (D, T, o) => {
    const { tl } = D;
    const S = synth(D), dur = o.duration || 4;
    const s = D.scene('synboot', '');
    const O = osd(D, s, o);
    D.show(s, T);
    D.setBg('#000000', T);
    D.ink('#ffffff', T);
    if (o.label) D.label(T + 0.3, o.label);
    look(D, S, T, dur, { noise: 1, sun: 1, sunRise: 60, grid: 1, stars: 1, mount: 1 }, 2);
    counter(D, O.counter, T, dur, 0, 1);
    for (let k = 0; k < 4; k++) D.hit(O.mode, { opacity: 1 }, { opacity: 0.2, duration: 0.25, yoyo: true, repeat: 1, ease: 'steps(1)' }, T + k * 0.5);
    D.call(() => SFX.hiss('vhs', 0.07, 0.05), T + 0.02);
    D.sfx('glitch', T + 0.3, 0.4, 0.25);
    // the picture locks in
    const tl0 = T + 2.2;
    tl.to(S, { noise: 0, duration: 0.5, ease: 'steps(6)' }, tl0);
    D.hit(D.camera, { y: -300 }, { y: 0, duration: 0.6, ease: 'power3.out' }, tl0);
    D.call(() => SFX.padStop('vhs', 0.3), tl0 + 0.4);
    D.sfx('boom', tl0 + 0.5, 0.6);
    tl.to(O.el, { opacity: 0, duration: 0.3 }, T + dur - 0.4);
    D.hide(s, T + dur);
    return dur;
  });

  // ------------------------------------------------------------------ SYNRIDE
  // The drive: the sun rises behind the mountains, the grid runs, neon script lines.   8 s
  recipe('synride', (D, T, o) => {
    const { tl } = D;
    const S = synth(D), dur = o.duration || 8;
    const s = D.scene('synride', (o.lines || []).map(l => `<div class="syn-neon c">${l}</div>`).join(''));
    const ls = D.$$('.syn-neon', s);
    ls.forEach(e => D.fit(e, 1500));
    gsap.set(ls, { opacity: 0 });
    D.show(s, T);
    if (o.label) D.label(T, o.label);
    look(D, S, T, dur, { sun: 1, grid: 1, stars: 1, mount: 1 }, 2.4);
    D.hit(S, { sunRise: 0 }, { sunRise: 230, duration: dur, ease: 'power1.out' }, T);
    ls.forEach((e, i) => {
      const at = T + (o.at?.[i] ?? 0.8 + i * 3.4);
      // neon ignition: flicker on, hold, off
      tl.to(e, { keyframes: [{ opacity: 1, duration: 0.04 }, { opacity: 0.2, duration: 0.06 }, { opacity: 1, duration: 0.04 }, { opacity: 0.4, duration: 0.1 }, { opacity: 1, duration: 0.2 }] }, at);
      D.sfx('zap', at, 0.12);
      tl.to(e, { opacity: 0, duration: 0.4 }, at + (o.hold ?? 2.8));
    });
    D.hide(s, T + dur);
    return dur;
  });

  // ------------------------------------------------------------------ SYNCHROME
  // Chrome words slam in, one per step, with a travelling shine; the grid speeds up.
  recipe('synchrome', (D, T, o) => {
    const { tl } = D;
    const S = synth(D), words = o.words || [], step = o.step || 1.5, dur = words.length * step;
    const s = D.scene('synchrome', words.map(w => `<div class="syn-chrome v c">${w}</div>`).join(''));
    const els = D.$$('.syn-chrome', s);
    els.forEach(e => D.fit(e, 1500));
    gsap.set(els, { autoAlpha: 0, skewX: -9 });
    D.show(s, T);
    if (o.label) D.label(T, o.label);
    look(D, S, T, dur, { sun: 1, sunRise: 230, grid: 1, stars: 1, mount: 1 }, 6);
    els.forEach((e, i) => {
      const at = T + i * step;
      D.hit(e, { autoAlpha: 1, scale: 1.8, y: -60, '--sh': '-30%' }, { scale: 1, y: 0, duration: 0.35, ease: 'expo.out' }, at);
      tl.to(e, { '--sh': '130%', duration: 0.7, ease: 'power2.inOut' }, at + 0.3);
      tl.to(e, { autoAlpha: 0, scale: 0.9, duration: 0.25, ease: 'power2.in' }, at + step - 0.3);
      D.shake(at, 0.25, 8);
      D.sfx('boom', at, 0.55);
      D.sfx('zap', at + 0.3, 0.1);
    });
    D.hide(s, T + dur);
    return dur;
  });

  // ------------------------------------------------------------------ SYNWIRE
  // Wireframe solids spin over the grid, each with its true vertex and edge count.
  recipe('synwire', (D, T, o) => {
    const { tl } = D;
    const S = synth(D), shapes = o.shapes || ['cubo', 'piramide', 'icosaedro'], step = o.step || 2.5, dur = shapes.length * step;
    const names = o.names || { cubo: 'CUBO', piramide: 'PIRÁMIDE', icosaedro: 'ICOSAEDRO' };
    const s = D.scene('synwire', shapes.map(k => `<div class="syn-lab"><b class="v">${names[k] || k.toUpperCase()}</b><span class="mono">${SOLIDS[k].length} VÉRTICES · ${EDGES[k].length} ARISTAS</span></div>`).join(''));
    const labs = D.$$('.syn-lab', s);
    gsap.set(labs, { opacity: 0, x: 40 });
    D.show(s, T);
    if (o.label) D.label(T, o.label);
    look(D, S, T, dur, { sun: 0.35, sunRise: 230, grid: 1, stars: 1, mount: 1, wire: 0, wx: 700, wy: 390, ws: 170 }, 3);
    D.hit(S, { rx: 0.4, ry: 0 }, { rx: 0.4 + dur * 0.5, ry: dur * 1.1, duration: dur, ease: 'none' }, T);
    shapes.forEach((k, i) => {
      const at = T + i * step;
      tl.set(S, { shape: k }, at);
      D.hit(S, { wire: 0, ws: 40 }, { wire: 1, ws: 170, duration: 0.5, ease: 'back.out(2)' }, at);
      tl.to(S, { wire: 0, ws: 60, duration: 0.3, ease: 'power2.in' }, at + step - 0.35);
      tl.to(labs[i], { opacity: 1, x: 0, duration: 0.5, ease: 'expo.out' }, at + 0.2);
      tl.to(labs[i], { opacity: 0, duration: 0.25 }, at + step - 0.35);
      D.sfx('zap', at, 0.14);
      D.sfx('bell', at + 0.2, [659.25, 783.99, 987.77][i % 3], 0.05);
    });
    D.hide(s, T + dur);
    return dur;
  });

  // ------------------------------------------------------------------ SYNTITLE
  // The logo: a chrome block word, a neon script across it, a tagline, a lens flare.   7 s
  recipe('syntitle', (D, T, o) => {
    const { tl } = D;
    const S = synth(D), dur = o.duration || 7;
    const s = D.scene('syntitle', `<div class="syn-chrome syn-big v c">${o.title || D.cfg.meta.title}</div>
      <div class="syn-script c">${o.script || ''}</div><div class="syn-tag mono c">${o.tagline || ''}</div><i class="syn-flare"></i>`);
    const big = D.$('.syn-big', s), sc = D.$('.syn-script', s), tag = D.$('.syn-tag', s), flare = D.$('.syn-flare', s);
    D.fit(big, 1600);
    gsap.set(big, { skewX: -9, autoAlpha: 0 });
    gsap.set([sc, tag], { opacity: 0 });
    gsap.set(sc, { rotation: -7 });
    gsap.set(flare, { x: -600, opacity: 0 });
    D.show(s, T);
    if (o.label) D.label(T + 0.2, o.label);
    look(D, S, T, dur, { sun: 1, sunRise: 230, grid: 1, stars: 1, mount: 1 }, 2);
    D.hit(big, { autoAlpha: 1, scale: 0.2, y: 200, '--sh': '-30%' }, { scale: 1, y: 0, duration: 0.9, ease: 'expo.out' }, T + 0.2);
    D.sfx('riser', T, 0.9, 0.25);
    D.sfx('braam', T + 0.9, 0.7);
    D.sfx('boom', T + 0.9, 0.9);
    D.flash(T + 0.9, 0.3, 0.5, '#ff9ad5');
    D.call(() => SFX.pad('title', [110, 138.59, 164.81, 220], 1.2, 0.05, 1400), T + 0.9);
    tl.to(sc, { keyframes: [{ opacity: 1, duration: 0.05 }, { opacity: 0.1, duration: 0.07 }, { opacity: 1, duration: 0.05 }, { opacity: 0.3, duration: 0.12 }, { opacity: 1, duration: 0.25 }] }, T + 1.4);
    D.sfx('zap', T + 1.4, 0.2);
    tl.to(big, { '--sh': '130%', duration: 1, ease: 'power2.inOut' }, T + 1.8);
    tl.to(flare, { keyframes: [{ opacity: 1, duration: 0.2 }, { x: 2400, duration: 1.1, ease: 'power1.inOut' }, { opacity: 0, duration: 0.2 }] }, T + 1.9);
    D.sfx('whoosh', T + 1.9, 1.1, 0.15);
    tl.to(tag, { opacity: 0.9, duration: 0.6 }, T + 2.6);
    tl.to([big, sc, tag], { opacity: 0, duration: 0.5 }, T + dur - 0.6);
    D.hide(s, T + dur);
    return dur;
  });

  // ------------------------------------------------------------------ SYNEND
  // ■ STOP, then REW: the grid runs backwards under static bands, and the tape ends.   4.5 s
  recipe('synend', (D, T, o) => {
    const { tl } = D;
    const S = synth(D), dur = o.duration || 4.5;
    const s = D.scene('synend', `<div class="syn-fin v c">${o.fin || ''}</div>`);
    const O = osd(D, s, { mode: '■ STOP' }), fin = D.$('.syn-fin', s);
    gsap.set(fin, { opacity: 0 });
    D.show(s, T);
    if (o.label) D.label(T, o.label);
    look(D, S, T, dur, { sun: 1, sunRise: 230, grid: 1, stars: 1, mount: 1 }, -14); // rewinding
    counter(D, O.counter, T, dur, o.from ?? 40, -9);
    tl.set(O.mode, { textContent: '◀◀ REW' }, T + 0.8);
    D.sfx('key', T, 0.3);
    D.call(() => SFX.padStop('title', 0.8), T);
    D.call(() => SFX.hiss('vhs', 0.05, 0.1), T + 0.8);
    tl.to(S, { noise: 0.55, duration: 0.2 }, T + 0.8);
    D.hit(D.camera, { skewX: 0 }, { keyframes: [{ skewX: 8, duration: 0.08 }, { skewX: -6, duration: 0.08 }, { skewX: 0, duration: 0.1 }] }, T + 0.8);
    tl.to(S, { noise: 1, duration: 0.3 }, T + 2.2);
    D.hit(fin, { opacity: 0, scale: 1.4 }, { opacity: 1, scale: 1, duration: 0.3, ease: 'expo.out' }, T + 2.5);
    D.sfx('boom', T + 2.5, 0.4);
    D.call(() => SFX.padStop('vhs', 0.3), T + dur - 0.5);
    D.barsTo(540, T + dur - 0.45, 0.4);
    D.sfx('boom', T + dur - 0.2, 0.5);
    D.hide(s, T + dur);
    return dur;
  });

  Trailer.synth = { state: synth, SOLIDS, EDGES };
})();
