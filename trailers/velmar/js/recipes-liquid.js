/* ============================================================================
   LIQUID MODULE — everything flows.
   Recipes: drop, metaballs, melt, flood, underwater, mesh.
   They chain naturally: a drop hits the centre → a metaball blob pops from that
   point → it shrinks away → a solid word melts and drips down → liquid rises from
   the bottom and floods the frame → we are underwater → (any cut) → mesh calm.
   Canvas scenes (metaballs, underwater, mesh) are pure functions of tweened
   params (D.layer); DOM scenes use one proxy tween per animated system, so every
   frame is seek-safe.
   ========================================================================== */
(() => {
  'use strict';
  const { recipe } = Trailer;
  const { hex, rgba } = Trailer.util;
  const TAU = Math.PI * 2;
  const hash = (a, b = 0) => {
    let h = Math.imul(a | 0, 374761393) + Math.imul(b | 0, 668265263);
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  };
  const clamp01 = x => (x < 0 ? 0 : x > 1 ? 1 : x);
  const eOut3 = t => 1 - Math.pow(1 - clamp01(t), 3);
  const eIn3 = t => Math.pow(clamp01(t), 3);
  const eInOut = t => { t = clamp01(t); return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };

  // Gooey filter: blur + alpha threshold, crisp source composited on top.
  let gooReady = false;
  function goo() {
    if (!gooReady) {
      const holder = document.createElement('div');
      holder.innerHTML = `<svg width="0" height="0" style="position:absolute" aria-hidden="true">
        <filter id="lq-goo" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
          <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="b"/>
          <feColorMatrix in="b" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 24 -10" result="g"/>
          <feComposite in="SourceGraphic" in2="g" operator="atop"/>
        </filter></svg>`;
      document.body.appendChild(holder.firstElementChild);
      gooReady = true;
    }
    return 'url(#lq-goo)';
  }

  // Render a word into an offscreen canvas (display font), fitted to maxW.
  function wordCanvas(D, text, size, maxW, color, h = 420) {
    const c = document.createElement('canvas');
    c.width = D.W; c.height = h;
    const x = c.getContext('2d');
    const setFont = sz => { x.font = `900 ${sz}px "${D.cfg.fonts.display}"`; if (D.cfg.fonts.stretch && 'fontStretch' in x) x.fontStretch = 'expanded'; };
    setFont(size);
    const w = x.measureText(text).width;
    if (w > maxW) setFont(size * maxW / w);
    x.textAlign = 'center';
    x.textBaseline = 'middle';
    x.fillStyle = color;
    x.fillText(text, D.W / 2, h / 2);
    return c;
  }

  // ------------------------------------------------------------------ DROP
  // Cold open: drops fall onto a dark surface at the centre; each impact throws a
  // crown of droplets, a rebound jet and perspective ripples. Copy is revealed
  // under the surface. Optional o.to floods the frame from the last impact.  ≈5 s
  recipe('drop', (D, T, o) => {
    const { tl, C, N } = D;
    const bgc = o.bg || C.night, fg = D.contrast(bgc), accent = o.accent || C.a[0];
    const lines = (o.lines || ['TODO EMPIEZA', 'CON UNA <em>GOTA</em>.']).slice(0, 2);
    const SX = D.CX, SY = o.y ?? D.CY, FALL = 0.55;
    const drops = o.drops || [{ at: 0.35, s: 0.8 }, { at: 1.95, s: 1 }, { at: 3.45, s: 1.3 }];
    const dropSvg = `<svg viewBox="-30 -50 60 96"><defs><linearGradient id="lq-dg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="${accent}"/></linearGradient></defs>
      <path d="M0,-46C10,-26 26,-8 26,12C26,30 14,42 0,42C-14,42 -26,30 -26,12C-26,-8 -10,-26 0,-46Z" fill="url(#lq-dg)"/>
      <ellipse cx="-9" cy="10" rx="5" ry="9" fill="#ffffff" opacity=".7"/></svg>`;
    const s = D.scene('drop', `
      <div class="dp-glow c" style="top:${SY}px"></div>
      <div class="dp-surface c" style="top:${SY}px"></div>
      <svg class="dp-rings" viewBox="0 0 1920 1080" aria-hidden="true">${'<ellipse/>'.repeat(drops.length * 3)}</svg>
      ${drops.map(() => `<div class="dp-drop c" style="top:${SY}px">${dropSvg}</div><i class="dp-jet c" style="top:${SY}px"></i>`).join('')}
      ${`<i class="dp-sp c" style="top:${SY}px"></i>`.repeat(drops.length * 8)}
      ${o.to ? `<i class="dp-fill c" style="top:${SY}px;background:${o.to}"></i>` : ''}
      ${lines.map((l, i) => `<div class="dp-line v c" style="top:${SY + 150 + i * 62}px">${l}</div>`).join('')}`);
    s.style.color = fg;
    s.style.setProperty('--accent', accent);
    const glow = D.$('.dp-glow', s), surface = D.$('.dp-surface', s), rings = D.$$('.dp-rings ellipse', s);
    const dEls = D.$$('.dp-drop', s), jets = D.$$('.dp-jet', s), sps = D.$$('.dp-sp', s), fill = D.$('.dp-fill', s);
    const splits = D.$$('.dp-line', s).map(el => D.split(D.fit(el, 1700), { type: 'chars', mask: 'chars' }));
    gsap.set(splits.flatMap(x => x.chars), { yPercent: 115 });
    gsap.set(rings, { attr: { cx: SX, cy: SY, rx: 1, ry: 1, 'stroke-width': 3 }, opacity: 0 });
    gsap.set(dEls, { autoAlpha: 0 });
    gsap.set([...jets, ...sps], { autoAlpha: 0, x: 0, y: 0 });
    gsap.set(glow, { opacity: 0, scale: 0.5 });
    gsap.set(surface, { opacity: 0, scaleX: 0.2 });
    if (fill) gsap.set(fill, { scale: 0 });

    D.show(s, T);
    D.setBg(bgc, T);
    D.ink(fg, T);
    if (o.label) D.label(T + 0.8, o.label);
    D.call(() => SFX.pad('drop', [55, 82.41, 110], 2.5, 0.045, 320), T + 0.02);
    tl.to(surface, { opacity: 0.45, scaleX: 1, duration: 1.4, ease: 'expo.out' }, T + 0.2);

    let tLast = T;
    drops.forEach((d, i) => {
      const tf = T + d.at, ti = tf + FALL, sc = d.s || 1;
      tLast = ti;
      const el = dEls[i];
      gsap.set(el, { y: -(SY + 160), scaleX: sc, scaleY: sc * 1.3 });
      tl.set(el, { autoAlpha: 1 }, tf);
      tl.to(el, { y: -44 * sc, duration: FALL, ease: 'power2.in' }, tf);
      tl.set(el, { autoAlpha: 0 }, ti);
      // crown of droplets
      for (let j = 0; j < 8; j++) {
        const sp = sps[i * 8 + j], r = k => hash(i * 97 + j * 13, k);
        const dx = (r(1) - 0.5) * 2 * (50 + r(2) * 150) * sc, h = (50 + r(3) * 120) * sc, du = 0.45 + r(4) * 0.25;
        gsap.set(sp, { scale: (0.45 + r(5) * 0.9) * sc });
        tl.set(sp, { autoAlpha: 1, x: 0, y: 0 }, ti);
        tl.to(sp, { x: dx, duration: du, ease: 'power1.out' }, ti);
        tl.to(sp, { y: -h, duration: du * 0.45, ease: 'power2.out' }, ti);
        tl.to(sp, { y: 4, duration: du * 0.55, ease: 'power2.in' }, ti + du * 0.45);
        tl.set(sp, { autoAlpha: 0 }, ti + du);
      }
      // rebound jet (Worthington)
      const jet = jets[i];
      gsap.set(jet, { scale: 0.3 * sc });
      tl.set(jet, { autoAlpha: 1, y: 0, scale: 0.3 * sc }, ti + 0.12);
      tl.to(jet, { y: -95 * sc, scale: sc, duration: 0.3, ease: 'power2.out' }, ti + 0.12);
      tl.to(jet, { y: 0, scale: 0.4 * sc, duration: 0.3, ease: 'power2.in' }, ti + 0.42);
      tl.set(jet, { autoAlpha: 0 }, ti + 0.72);
      // perspective ripples
      for (let k = 0; k < 3; k++) {
        D.hit(rings[i * 3 + k],
          { attr: { rx: 6 * sc, ry: 2 * sc, 'stroke-width': 3 }, opacity: 0.95 },
          { attr: { rx: (300 + k * 150) * sc * 1.3, ry: (38 + k * 16) * sc, 'stroke-width': 0.6 }, opacity: 0, duration: 1.9, ease: 'expo.out' }, ti + k * 0.14);
      }
      D.hit(glow, { opacity: 0.95, scale: 0.55 + sc * 0.2 }, { opacity: 0.3, scale: 1.1 + sc * 0.2, duration: 1.3, ease: 'expo.out' }, ti);
      D.sfx('plip', ti, 0.32 + sc * 0.08, 560 / sc);
      if (i === drops.length - 1) { D.sfx('boom', ti, 0.55); D.shake(ti, 0.3, 6 * sc); D.flash(ti, 0.18, 0.4, accent); }
      else D.sfx('bell', ti + 0.05, i ? N.E5 : N.A4, 0.06);
    });

    // copy: line i appears after impact i
    splits.forEach((sp, i) => {
      const at = T + (drops[i] ? drops[i].at : drops[drops.length - 1].at) + FALL + 0.2;
      tl.to(sp.chars, { yPercent: 0, duration: 0.9, ease: 'expo.out', stagger: 0.028 }, at);
    });
    tl.to(splits.flatMap(x => x.chars), { yPercent: -115, duration: 0.45, ease: 'expo.in', stagger: 0.008 }, tLast + 0.25);
    tl.to([glow, surface], { opacity: 0, duration: 0.6 }, tLast + 0.3);

    let end = tLast + 1.0;
    if (fill) {
      tl.to(fill, { scale: 26, duration: 0.75, ease: 'expo.in' }, tLast + 0.15);
      D.sfx('whoosh', tLast + 0.15, 0.8, 0.35);
      end = tLast + 0.95;
      D.setBg(o.to, end);
    }
    D.call(() => SFX.padStop('drop', 1.5), end - 0.2);
    D.hide(s, end);
    return end - T;
  });

  // ------------------------------------------------------------------ METABALLS
  // Glossy 3D blobs that merge, split and remerge, blending their colours where
  // they touch. Computed per pixel at 1/4 resolution with an analytic field
  // gradient (anti-aliased edge + diffuse/specular shading), upscaled.   6 s
  recipe('metaballs', (D, T, o) => {
    const { tl, C, N } = D;
    const dur = o.duration || 6, n = o.count || 8, SC = 4, RW = D.W / SC, RH = D.H / SC;
    const cols = (o.colors || [C.a[0], C.a[1], C.a[2], C.a[4]]).map(hex);
    const buf = document.createElement('canvas');
    buf.width = RW; buf.height = RH;
    const bctx = buf.getContext('2d'), img = bctx.createImageData(RW, RH), px = img.data;
    const balls = Array.from({ length: n }, (_, i) => ({
      r: (i === 0 ? 125 : 52 + hash(i, 1) * 70) / SC,
      ax: (160 + hash(i, 2) * 560) / SC, ay: (80 + hash(i, 3) * 240) / SC,
      w1: 0.55 + hash(i, 4) * 0.8, w2: 0.5 + hash(i, 5) * 0.9, p1: hash(i, 6) * TAU, p2: hash(i, 7) * TAU,
      c: cols[i % cols.length],
    }));
    const nrm = v => { const l = Math.hypot(...v); return v.map(x => x / l); };
    const [Lx, Ly, Lz] = nrm([-0.45, -0.6, 0.66]);
    const [Hx, Hy, Hz] = nrm([Lx, Ly, Lz + 1]);
    const bx = new Float32Array(n), by = new Float32Array(n), r2 = new Float32Array(n);
    const cr = new Float32Array(n), cg = new Float32Array(n), cb = new Float32Array(n);
    balls.forEach((b, i) => { cr[i] = b.c[0]; cg[i] = b.c[1]; cb[i] = b.c[2]; });

    const M = { alpha: 0, t: 0, spread: 0, size: 0 };
    function compute() {
      // even fully merged, the balls keep a small orbit: the blob stays marbled instead of averaging to grey
      const sp = 0.16 + M.spread * 0.84;
      for (let i = 0; i < n; i++) {
        const b = balls[i], r = b.r * M.size;
        bx[i] = RW / 2 + Math.cos(M.t * b.w1 + b.p1) * b.ax * sp;
        by[i] = RH / 2 + Math.sin(M.t * b.w2 + b.p2) * b.ay * sp;
        r2[i] = r * r;
      }
      let p = 0;
      for (let y = 0; y < RH; y++) {
        for (let x = 0; x < RW; x++, p += 4) {
          let F = 0, gx = 0, gy = 0, R = 0, G = 0, B = 0, ws = 0;
          for (let i = 0; i < n; i++) {
            const dx = x - bx[i], dy = y - by[i], d2 = dx * dx + dy * dy + 0.5, f = r2[i] / d2, k = (2 * f) / d2, w = f * f * f; // cubed: crisper colour regions
            F += f; gx -= k * dx; gy -= k * dy;
            R += w * cr[i]; G += w * cg[i]; B += w * cb[i]; ws += w;
          }
          if (F < 0.5) { px[p + 3] = 0; continue; }
          const gl = Math.sqrt(gx * gx + gy * gy) + 1e-6;
          const a = clamp01((F - 1) / gl + 0.5); // signed distance → 1-px anti-aliased edge
          if (a <= 0) { px[p + 3] = 0; continue; }
          const u = clamp01((F - 1) * 0.7), sl = (1 - u) * 0.95;
          let nx = (-gx / gl) * sl, ny = (-gy / gl) * sl, nz = 0.3 + u;
          const nl = Math.sqrt(nx * nx + ny * ny + nz * nz);
          nx /= nl; ny /= nl; nz /= nl;
          const dif = Math.max(0, nx * Lx + ny * Ly + nz * Lz);
          const spec = Math.pow(Math.max(0, nx * Hx + ny * Hy + nz * Hz), 40) * 235;
          const sh = (0.42 + 0.72 * dif) / ws;
          px[p] = R * sh + spec; px[p + 1] = G * sh + spec; px[p + 2] = B * sh + spec;
          px[p + 3] = a * 255;
        }
      }
      bctx.putImageData(img, 0, 0);
    }
    let key = '';
    D.layer(M, g => {
      const k = `${M.t.toFixed(4)}|${M.spread.toFixed(4)}|${M.size.toFixed(4)}`;
      if (k !== key) { key = k; compute(); }
      g.globalAlpha = M.alpha;
      g.imageSmoothingEnabled = true;
      g.imageSmoothingQuality = 'high';
      g.drawImage(buf, 0, 0, D.W, D.H);
    });

    const words = (o.words || ['SEPARAR', 'UNIR', 'FLUIR']).slice(0, 3);
    const s = D.scene('metaballs', `${words.map(w => `<div class="mb-word v c">${w}</div>`).join('')}<div class="mb-cap mono"></div>`);
    const wEls = D.$$('.mb-word', s).map(el => D.fit(el, 1500)), cap = D.$('.mb-cap', s);
    gsap.set(wEls, { opacity: 0, filter: 'blur(24px)', scale: 1.15 });

    D.show(s, T);
    D.ink(C.paper, T);
    tl.to(s, { color: C.paper, duration: 0.01 }, T);
    if (o.label) D.label(T, o.label);
    tl.set(M, { alpha: 1 }, T);
    tl.to(M, { t: dur * 1.4, duration: dur, ease: 'none' }, T);
    tl.to(M, { size: 1, duration: 0.8, ease: 'back.out(1.8)' }, T);
    tl.to(M, { spread: 1, duration: 1.5, ease: 'power2.inOut' }, T + 0.9);
    tl.to(M, { spread: 0.2, duration: 1.0, ease: 'power3.inOut' }, T + 2.6);
    tl.to(M, { spread: 0.85, duration: 1.3, ease: 'power2.inOut' }, T + 3.75);
    tl.to(M, { spread: 0, duration: 0.5, ease: 'power2.in' }, T + dur - 0.95);
    tl.to(M, { size: 0, duration: 0.4, ease: 'back.in(2)' }, T + dur - 0.5);
    tl.set(M, { alpha: 0 }, T + dur);
    [1.0, 2.7, 3.95].forEach((dt, i) => {
      if (!wEls[i]) return;
      tl.to(wEls[i], { opacity: 1, filter: 'blur(0px)', scale: 1, duration: 0.5, ease: 'power3.out' }, T + dt);
      tl.to(wEls[i], { opacity: 0, filter: 'blur(16px)', scale: 0.94, duration: 0.3, ease: 'power2.in' }, T + dt + 0.95);
      D.sfx('bell', T + dt, [N.E5, N.A4, N.C5][i], 0.08);
    });
    if (o.caption) tl.to(cap, { duration: 0.9, scrambleText: { text: o.caption, chars: '0123456789', speed: 0.8 }, ease: 'none' }, T + 0.6);
    tl.to(cap, { opacity: 0, duration: 0.3 }, T + dur - 0.5);

    D.sfx('plip', T + 0.05, 0.4, 380);
    D.sfx('boom', T + 0.05, 0.5);
    D.sfx('swell', T + 0.9, 1.7, 0.2);
    D.sfx('bubbles', T + 2.6, 8, 0.09);
    D.sfx('swell', T + 3.75, 1.4, 0.18);
    D.sfx('bubbles', T + dur - 0.95, 6, 0.09);
    D.sfx('plip', T + dur - 0.35, 0.3, 700);
    D.call(() => SFX.pad('metaballs', [110, 164.81, 220, 277.18], 1.5, 0.03, 1400), T + 0.02);
    D.call(() => SFX.padStop('metaballs', 1), T + dur - 0.4);
    D.hide(s, T + dur);
    return dur;
  });

  // ------------------------------------------------------------------ MELT
  // A solid word softens, sags and drips: blobs grow from each glyph's baseline,
  // stretch and fall, joined to the letters by a gooey SVG filter. At the end the
  // whole liquid word drains downward (hand-off to `flood`).          4.5 s
  recipe('melt', (D, T, o) => {
    const { tl, C, N } = D;
    const dur = o.duration || 4.5;
    const bgc = o.bg || C.night, fg = o.color || D.contrast(bgc);
    const caps = o.captions || ['ESTADO · SÓLIDO', 'ESTADO · LÍQUIDO'];
    const s = D.scene('melt', `<div class="ml-goo"><div class="ml-word v">${o.word || 'SÓLIDO'}</div></div><div class="ml-cap mono"></div>`);
    const box = D.$('.ml-goo', s), word = D.$('.ml-word', s), cap = D.$('.ml-cap', s);
    box.style.filter = goo();
    s.style.color = fg;
    D.fit(word, 1640);
    const chars = D.split(word, { type: 'chars' }).chars;
    const bb = D.box(box);
    const drips = [];
    chars.forEach((c, i) => {
      const cb = D.box(c);
      if (cb.w < 30) return;
      const count = 1 + (hash(i, 3) > 0.4 ? 1 : 0);
      for (let j = 0; j < count; j++) {
        const sz = 30 + hash(i * 7 + j, 5) * 26;
        drips.push({
          x: cb.x - bb.x + cb.w * (0.22 + (count > 1 ? j * 0.5 : 0.28) + hash(i * 7 + j, 4) * 0.12),
          y: cb.y - bb.y + cb.h * 0.7, sz, hang: 40 + hash(i * 7 + j, 6) * 70, t0: 1.0 + hash(i * 7 + j, 7) * 1.4,
        });
      }
    });
    drips.forEach(d => {
      d.head = document.createElement('i');
      d.tail = document.createElement('i');
      [d.head, d.tail].forEach((el, k) => {
        const z = k ? d.sz * 0.75 : d.sz; // a fat tail keeps head, neck and glyph bridged with a small blur
        el.className = 'ml-drip';
        Object.assign(el.style, { left: d.x - z / 2 + 'px', top: d.y - z / 2 + 'px', width: z + 'px', height: z + 'px' });
        box.appendChild(el);
      });
    });
    gsap.set(chars, { opacity: 0, scale: 1.25, transformOrigin: '50% 0%' });
    gsap.set(drips.flatMap(d => [d.head, d.tail]), { scale: 0.2, y: 0 });

    D.show(s, T);
    D.setBg(bgc, T);
    D.ink(fg, T);
    if (o.label) D.label(T, o.label);
    tl.to(chars, { opacity: 1, scale: 1, duration: 0.5, ease: 'expo.out', stagger: 0.04 }, T + 0.1);
    D.sfx('kick', T + 0.1, 0.9);
    D.sfx('boom', T + 0.1, 0.4);
    tl.to(cap, { duration: 0.6, scrambleText: { text: caps[0], chars: 'upperCase', speed: 0.8 }, ease: 'none' }, T + 0.2);
    tl.to(cap, { duration: 0.6, scrambleText: { text: caps[1], chars: 'upperCase', speed: 0.8 }, ease: 'none' }, T + 2.1);
    // the letters sag
    chars.forEach((c, i) => tl.to(c, { y: 14 + hash(i, 9) * 22, scaleY: 1.1 + hash(i, 10) * 0.12, duration: 2.2, ease: 'power1.in' }, T + 0.9 + hash(i, 11) * 0.3));
    // the drips grow, hang and fall
    drips.forEach((d, k) => {
      const t0 = T + d.t0, tFall = t0 + 0.8;
      tl.to(d.head, { y: d.hang, scale: 1, scaleY: 1.2, duration: 0.8, ease: 'sine.in' }, t0);
      tl.to(d.tail, { y: d.hang * 0.45, scale: 0.9, duration: 0.8, ease: 'sine.in' }, t0);
      tl.to(d.head, { y: 1000, scaleY: 1.45, duration: 0.75, ease: 'power2.in' }, tFall);
      tl.to(d.tail, { y: d.hang + 150, scale: 0, duration: 0.6, ease: 'power2.in' }, tFall);
      if (k % 2 === 0) D.sfx('plip', tFall + 0.5, 0.18, 620 + k * 40);
    });
    // everything drains away
    tl.to(box, { y: 1150, duration: 0.95, ease: 'power2.in' }, T + dur - 1.15);
    tl.to(cap, { opacity: 0, duration: 0.3 }, T + dur - 1.0);
    D.sfx('swell', T + 1.0, 2.6, 0.18);
    D.sfx('whoosh', T + dur - 1.1, 0.9, 0.35);
    D.call(() => SFX.pad('melt', [49, 73.42, 98], 1, 0.04, 260), T + 0.02);
    D.call(() => SFX.padStop('melt', 0.8), T + dur - 0.5);
    D.hide(s, T + dur);
    return dur;
  });

  // ------------------------------------------------------------------ FLOOD
  // Liquid rises from the bottom in two wave layers; a word floats on the front
  // surface (half submerged, tilting with the slope), bubbles rise, then the tide
  // covers the whole frame in o.to.                                     4 s
  recipe('flood', (D, T, o) => {
    const { tl, C, N } = D;
    const dur = o.duration || 4, W = D.W, H = D.H;
    const bgc = o.bg || C.night, fg = D.contrast(bgc), to = o.to || C.a[0], back = o.back || C.a[4];
    const s = D.scene('flood', `
      <svg class="fl-svg" viewBox="0 0 1920 1080" preserveAspectRatio="none" aria-hidden="true"><path class="fl-back" fill="${back}"/></svg>
      <div class="fl-word v">${o.word || 'FLOTAR'}</div>
      <svg class="fl-svg" viewBox="0 0 1920 1080" preserveAspectRatio="none" aria-hidden="true"><path class="fl-front" fill="${to}"/><g class="fl-bub">${'<circle/>'.repeat(22)}</g></svg>`);
    const backP = D.$('.fl-back', s), frontP = D.$('.fl-front', s), bub = D.$$('.fl-bub circle', s), word = D.fit(D.$('.fl-word', s), 1500);
    word.style.color = fg;
    const ww = word.offsetWidth, wh = word.offsetHeight;
    const MID = D.CY + 110;
    const level = p => (p < 0.35 ? H + 90 - (H + 90 - MID) * eOut3(p / 0.35)
      : p < 0.66 ? MID + Math.sin(((p - 0.35) / 0.31) * Math.PI) * 12
      : MID - (MID + 160) * eIn3((p - 0.66) / 0.3));
    const surf = (x, L, ph, amp) => L + amp * Math.sin(x * 0.0055 + ph) + amp * 0.45 * Math.sin(x * 0.0131 - ph * 1.5);
    const path = (L, ph, amp) => {
      let d = `M0,${surf(0, L, ph, amp).toFixed(1)}`;
      for (let x = 32; x <= W; x += 32) d += `L${x},${surf(x, L, ph, amp).toFixed(1)}`;
      return d + `L${W},${H + 20}L0,${H + 20}Z`;
    };
    const B = bub.map((c, i) => ({ c, x: 60 + hash(i, 1) * 1800, r: 3 + hash(i, 2) * 8, sp: 0.5 + hash(i, 3) * 1.2, off: hash(i, 4) }));
    const F = { p: 0 };
    const draw = () => {
      const p = F.p, L = level(p), ph = p * 9, amp = 20 + (1 - Math.abs(p - 0.5) * 2) * 14;
      frontP.setAttribute('d', path(L, ph, amp));
      backP.setAttribute('d', path(L - 34, ph + 1.7, amp * 0.8));
      const yS = surf(D.CX, L, ph, amp), slope = (surf(D.CX + 20, L, ph, amp) - surf(D.CX - 20, L, ph, amp)) / 40;
      const sink = eIn3((p - 0.64) / 0.28) * (wh * 1.2);
      word.style.transform = `translate(${(D.CX - ww / 2).toFixed(1)}px, ${(yS - wh * 0.62 + sink).toFixed(1)}px) rotate(${(Math.atan(slope) * 57.3 * 0.8).toFixed(2)}deg)`;
      B.forEach(b => {
        const y = H + 30 - (((p * b.sp * 2.4 + b.off) % 1) * (H + 60 - L));
        const on = y > surf(b.x, L, ph, amp) + 14;
        b.c.setAttribute('cx', (b.x + Math.sin(p * 20 + b.off * 9) * 10).toFixed(1));
        b.c.setAttribute('cy', y.toFixed(1));
        b.c.setAttribute('r', on ? b.r : 0);
      });
    };
    draw();

    D.show(s, T);
    D.setBg(bgc, T);
    D.ink(fg, T);
    if (o.label) D.label(T, o.label);
    tl.to(F, { p: 1, duration: dur, ease: 'none', onUpdate: draw }, T);
    D.sfx('swell', T, dur * 0.9, 0.26);
    D.sfx('bubbles', T + 0.4, 7, 0.08);
    D.sfx('plip', T + 0.35 * dur, 0.25, 480);
    D.sfx('bell', T + 0.36 * dur, N.A5, 0.07);
    D.sfx('bubbles', T + 0.7 * dur, 10, 0.09);
    D.sfx('whoosh', T + 0.66 * dur, 0.9, 0.3);
    D.ink(D.contrast(to), T + dur * 0.9);
    D.setBg(to, T + dur);
    D.hide(s, T + dur);
    return dur;
  });

  // ------------------------------------------------------------------ UNDERWATER
  // Beneath the surface: a water-column gradient, swaying god rays, rising
  // bubbles, and a word drawn in horizontal slices with sine offsets (a wavy,
  // refracted read) that clears up, wobbles, then dissolves.           4.5 s
  recipe('underwater', (D, T, o) => {
    const { tl, C, N } = D;
    const dur = o.duration || 4.5, W = D.W, H = D.H;
    const top = o.top || C.a[0], bottom = o.bottom || C.night;
    const TH = 420, tc = wordCanvas(D, o.word || 'PROFUNDO', 300, 1600, o.color || '#ffffff', TH);
    const bubs = Array.from({ length: 48 }, (_, i) => ({ x: hash(i, 1) * W, r: 2 + hash(i, 2) * 10, sp: 0.35 + hash(i, 3) * 0.9, off: hash(i, 4), wob: hash(i, 5) * TAU }));
    const U = { alpha: 0, p: 0, wob: 1.8, word: 0 };
    D.layer(U, g => {
      g.globalAlpha = U.alpha;
      const col = g.createLinearGradient(0, 0, 0, H);
      col.addColorStop(0, top);
      col.addColorStop(1, bottom);
      g.fillStyle = col;
      g.fillRect(0, 0, W, H);
      g.globalCompositeOperation = 'lighter';
      for (let k = 0; k < 7; k++) {
        const cx = 120 + k * 290 + Math.sin(U.p * 4 + k * 1.7) * 70, sw = 50 + hash(k, 8) * 70;
        const ray = g.createLinearGradient(0, 0, 0, H * 0.9);
        ray.addColorStop(0, 'rgba(255,255,255,0.16)');
        ray.addColorStop(1, 'rgba(255,255,255,0)');
        g.fillStyle = ray;
        g.beginPath();
        g.moveTo(cx - sw * 0.5, 0);
        g.lineTo(cx + sw * 0.5, 0);
        g.lineTo(cx + sw * 2.6 + 180, H);
        g.lineTo(cx + 180 - sw, H);
        g.closePath();
        g.fill();
      }
      g.globalCompositeOperation = 'source-over';
      // the word, refracted in slices
      const A = U.wob * 30, ph = U.p * 13;
      g.globalAlpha = U.alpha * U.word;
      for (let y = 0; y < TH; y += 4) {
        const dx = Math.sin(y * 0.045 + ph) * A + Math.sin(y * 0.11 - ph * 1.7) * A * 0.35;
        const dy = Math.sin(y * 0.03 + ph * 0.8) * A * 0.12;
        g.drawImage(tc, 0, y, W, 4, dx, (H - TH) / 2 + y + dy, W, 4);
      }
      // bubbles
      g.globalAlpha = U.alpha;
      g.lineWidth = 1.6;
      g.strokeStyle = 'rgba(255,255,255,0.55)';
      g.fillStyle = 'rgba(255,255,255,0.12)';
      for (const b of bubs) {
        const y = H + 40 - (((U.p * b.sp * 1.6 + b.off) % 1) * (H + 80));
        const x = b.x + Math.sin(U.p * 14 + b.wob) * 12;
        g.beginPath();
        g.arc(x, y, b.r, 0, TAU);
        g.fill();
        g.stroke();
      }
    });
    const s = D.scene('underwater', '<div class="uw-cap mono"></div>');
    const cap = D.$('.uw-cap', s);

    D.show(s, T);
    D.ink('#ffffff', T);
    tl.to(s, { color: '#ffffff', duration: 0.01 }, T);
    if (o.label) D.label(T, o.label);
    tl.set(U, { alpha: 1 }, T);
    tl.to(U, { p: 1, duration: dur, ease: 'none' }, T);
    tl.to(U, { word: 1, duration: 0.8, ease: 'power2.out' }, T + 0.3);
    tl.to(U, { wob: 0.28, duration: 1.3, ease: 'power3.out' }, T + 0.3);
    tl.to(U, { wob: 2.4, word: 0, duration: 0.9, ease: 'power2.in' }, T + dur - 1.1);
    if (o.caption) {
      tl.to(cap, { duration: 0.8, scrambleText: { text: o.caption, chars: '0123456789', speed: 0.8 }, ease: 'none' }, T + 1.0);
      tl.to(cap, { opacity: 0, duration: 0.3 }, T + dur - 0.9);
    }
    tl.set(U, { alpha: 0 }, T + dur);
    D.call(() => SFX.pad('deep', [41.2, 61.74, 82.41], 1.2, 0.05, 240), T + 0.02);
    D.call(() => SFX.padStop('deep', 0.8), T + dur - 0.5);
    D.sfx('bubbles', T + 0.2, 9, 0.08);
    D.sfx('bell', T + 1.0, N.E4, 0.08);
    D.sfx('bubbles', T + 2.2, 6, 0.07);
    D.sfx('swell', T + dur - 1.4, 1.4, 0.2);
    D.hide(s, T + dur);
    return dur;
  });

  // ------------------------------------------------------------------ MESH
  // A calm flowing mesh gradient (big soft colour fields drifting on Lissajous
  // paths — the film grain on top makes it expensive) with 1–2 lines of copy.
  // <b> inside a line = heavy weight.                                   4 s
  recipe('mesh', (D, T, o) => {
    const { tl, C, N } = D;
    const dur = o.duration || 4, W = D.W, H = D.H;
    const base = o.base || C.night;
    const blobs = (o.colors || [C.a[1], C.a[2], C.a[0], C.a[4], C.a[5]]).map((c, i) => ({
      c, r: 650 + hash(i, 1) * 500, ax: 280 + hash(i, 2) * 520, ay: 140 + hash(i, 3) * 300,
      w1: 0.6 + hash(i, 4) * 0.8, w2: 0.5 + hash(i, 5) * 0.8, p1: hash(i, 6) * TAU, p2: hash(i, 7) * TAU,
    }));
    const G = { alpha: 0, p: 0 };
    D.layer(G, g => {
      g.globalAlpha = G.alpha;
      g.fillStyle = base;
      g.fillRect(0, 0, W, H);
      for (const b of blobs) {
        const x = D.CX + Math.cos(G.p * b.w1 * 3 + b.p1) * b.ax, y = D.CY + Math.sin(G.p * b.w2 * 3 + b.p2) * b.ay;
        const rg = g.createRadialGradient(x, y, 0, x, y, b.r);
        rg.addColorStop(0, rgba(b.c, 0.9));
        rg.addColorStop(0.55, rgba(b.c, 0.35));
        rg.addColorStop(1, rgba(b.c, 0));
        g.fillStyle = rg;
        g.fillRect(0, 0, W, H);
      }
    });
    const lines = (o.lines || ['SIN <b>BORDES.</b>', 'SIN <b>FORMA FIJA.</b>']).slice(0, 2);
    const s = D.scene('mesh', `<div class="me-lines c">${lines.map(l => `<div class="me-line v">${l}</div>`).join('')}</div>`);
    const els = D.$$('.me-line', s);
    els.forEach(el => D.fit(el, 1650));
    gsap.set(els, { opacity: 0, filter: 'blur(20px)', letterSpacing: '0.3em' });

    D.show(s, T);
    D.ink('#ffffff', T);
    tl.to(s, { color: '#ffffff', duration: 0.01 }, T);
    if (o.label) D.label(T, o.label);
    tl.to(G, { alpha: 1, duration: 0.7, ease: 'power2.out' }, T);
    tl.to(G, { p: 1, duration: dur, ease: 'none' }, T);
    els.forEach((el, i) => {
      tl.to(el, { opacity: 1, filter: 'blur(0px)', letterSpacing: '-0.01em', duration: 1.2, ease: 'expo.out' }, T + 0.4 + i * 1.0);
      D.sfx('bell', T + 0.4 + i * 1.0, [N.A4, N.E5][i], 0.07);
    });
    tl.to(els, { opacity: 0, filter: 'blur(14px)', duration: 0.4, ease: 'power2.in', stagger: 0.08 }, T + dur - 0.6);
    tl.set(G, { alpha: 0 }, T + dur);
    D.call(() => SFX.pad('mesh', [220, 277.18, 329.63, 415.3], 1.5, 0.028, 1600), T + 0.02);
    D.call(() => SFX.padStop('mesh', 0.6), T + dur - 0.4);
    D.hide(s, T + dur);
    return dur;
  });
})();
