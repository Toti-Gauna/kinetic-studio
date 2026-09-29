/* ============================================================================
   SCENE RECIPES — each one: (D, T, o) => durationSeconds
     D = director API (engine.js), T = scene start time, o = options from trailer.js
   Every tween, sound and cut is placed on the master timeline D.tl at an
   absolute time, so the whole film stays seekable and deterministic.
   Musical grid: 120 BPM → 1 beat = 0.5 s. Cuts and hits land on the grid.
   ========================================================================== */
(() => {
  'use strict';
  const { recipe } = Trailer;

  // ------------------------------------------------------------------ ORIGIN
  // A dot heartbeats, two lines of copy, the dot stretches into a line and the
  // line opens into a full colour frame (o.to).                       5.5 s
  recipe('origin', (D, T, o) => {
    const { tl, C, N } = D;
    const lines = (o.lines || ['EVERYTHING BEGINS', 'WITH A SINGLE <em>POINT</em>']).slice(0, 2);
    const to = o.to || C.paper;
    const s = D.scene('origin', `
      <div class="o-glow c"></div>
      <div class="o-ring c"></div><div class="o-ring c"></div><div class="o-ring c"></div>
      <div class="o-dot c"></div>
      ${lines.map(l => `<div class="o-line v c">${l}</div>`).join('')}`);
    const dot = D.$('.o-dot', s), rings = D.$$('.o-ring', s), glow = D.$('.o-glow', s);
    const splits = D.$$('.o-line', s).map(el => D.split(D.fit(el, 1700), { type: 'chars', mask: 'chars' }));
    gsap.set(splits.flatMap(x => x.chars), { yPercent: 115 });
    gsap.set(dot, { scale: 0 });
    gsap.set(rings, { scale: 0.08, opacity: 0 });
    gsap.set(glow, { opacity: 0, scale: 0.6 });

    D.show(s, T);
    D.setBg(C.night, T);
    D.ink(C.paper, T);
    tl.set(D.bars, { height: 540 }, T);
    D.barsTo(110, T + 0.05, 1.8);
    D.call(() => SFX.pad('drone', [55, 82.41], 3, 0.07, 260), T + 0.02);
    if (o.label) D.label(T + 0.8, o.label);

    const ring = (el, at, size) => D.hit(el, { scale: 0.08, opacity: 0.9 }, { scale: size, opacity: 0, duration: 2, ease: 'expo.out' }, at);
    tl.to(dot, { scale: 1, duration: 0.9, ease: 'elastic.out(1.1, 0.35)' }, T + 0.5);
    tl.to(glow, { opacity: 1, scale: 1, duration: 2.5, ease: 'expo.out' }, T + 0.5);
    ring(rings[0], T + 0.5, 7);
    D.sfx('boom', T + 0.5, 0.9);
    D.hit(dot, { scale: 1.9 }, { scale: 1, duration: 0.9, ease: 'elastic.out(1, 0.32)' }, T + 1.5);
    D.hit(glow, { scale: 1.1 }, { scale: 1, duration: 1.2, ease: 'expo.out' }, T + 1.5);
    ring(rings[1], T + 1.5, 7);
    D.sfx('boom', T + 1.5, 0.65);
    D.hit(dot, { scale: 1.5 }, { scale: 1, duration: 0.8, ease: 'elastic.out(1, 0.32)' }, T + 2.5);
    ring(rings[2], T + 2.5, 5);
    D.sfx('boom', T + 2.5, 0.4);

    const slots = splits.length === 1 ? [[2.0, 4.25]] : [[2.0, 3.05], [3.4, 4.25]];
    splits.forEach((sp, i) => {
      const [a, b] = slots[i];
      tl.to(sp.chars, { yPercent: 0, duration: 0.9, ease: 'expo.out', stagger: 0.028 }, T + a);
      D.sfx('bell', T + a, i ? N.A5 : N.E5, 0.07);
      tl.to(sp.chars, { yPercent: -115, duration: 0.45, ease: 'expo.in', stagger: 0.012 }, T + b);
    });

    // the point becomes a line… and the line becomes a frame
    tl.to(glow, { opacity: 0, duration: 0.8 }, T + 4.2);
    tl.to(dot, { width: 1700, height: 3, duration: 0.85, ease: 'expo.inOut' }, T + 4.2);
    tl.to(dot, { backgroundColor: to, boxShadow: '0 0 0px rgba(255,255,255,0), 0 0 0px rgba(120,110,255,0)', duration: 0.3 }, T + 4.7);
    D.sfx('whoosh', T + 4.2, 0.9, 0.45);
    D.hide(dot, T + 5.0);
    tl.set(D.wipe, { backgroundColor: to, clipPath: 'inset(538.5px 110px 538.5px 110px)', autoAlpha: 1 }, T + 5.0);
    tl.to(D.wipe, { clipPath: 'inset(0px 0px 0px 0px)', duration: 0.5, ease: 'expo.inOut' }, T + 5.0);
    D.barsTo(0, T + 5.0, 0.5);
    D.ink(D.contrast(to), T + 5.2);
    D.sfx('whoosh', T + 5.0, 0.5, 0.3);
    D.call(() => SFX.padStop('drone', 3), T + 5.4);
    D.setBg(to, T + 5.5);
    tl.set(D.wipe, { autoAlpha: 0 }, T + 5.5);
    D.hide(s, T + 5.5);
    return 5.5;
  });

  // ------------------------------------------------------------------ FORMS
  // Bauhaus construction: guides + three shapes draw on, fill, swap with
  // squash & stretch, converge; the circle swallows the frame.         5.5 s
  recipe('forms', (D, T, o) => {
    const { tl, C, N } = D;
    const colors = o.colors || [C.a[0], C.a[1], C.a[2]];
    const labels = o.labels || ['01 — CIRCLE', '02 — SQUARE', '03 — TRIANGLE'];
    const bgc = o.bg || C.paper, fg = D.contrast(bgc);
    const d = [D.shapes.circle(150), D.shapes.poly([[-140, -140], [140, -140], [140, 140], [-140, 140]]), D.shapes.poly(D.shapes.ngon(3, 175))];
    const xs = [560, 960, 1360];
    const s = D.scene('forms', `
      <div class="f-word v c">${o.word || 'FORM'}</div>
      <svg class="f-guides" viewBox="0 0 1920 1080" aria-hidden="true">
        <line class="f-guide" x1="0" y1="540" x2="1920" y2="540"/>
        ${xs.map(x => `<line class="f-guide" x1="${x}" y1="120" x2="${x}" y2="960"/>`).join('')}
        <circle class="f-guide" cx="960" cy="540" r="330"/>
      </svg>
      ${xs.map((x, i) => `<div class="f-shape c" style="left:${x}px"><svg viewBox="-200 -200 400 400"><path class="fill" d="${d[i]}" style="fill:${colors[i]}"/><path class="stroke" d="${d[i]}"/></svg></div>`).join('')}
      ${xs.map(x => `<div class="f-label mono c" style="left:${x}px"></div>`).join('')}`);
    s.style.setProperty('--fg', fg);
    const word = D.fit(D.$('.f-word', s), 2100), guides = D.$$('.f-guide', s), lbls = D.$$('.f-label', s);
    const shapes = D.$$('.f-shape', s), [ci, sq, tr] = shapes;
    const fills = shapes.map(el => D.$('.fill', el)), strokes = shapes.map(el => D.$('.stroke', el)), svgs = shapes.map(el => D.$('svg', el));

    gsap.set(shapes, { rotation: -120, mixBlendMode: D.isLight(bgc) ? 'multiply' : 'screen' });
    gsap.set(guides, { drawSVG: '50% 50%' });
    gsap.set(strokes, { drawSVG: '0% 0%' });
    gsap.set(fills, { scale: 0, transformOrigin: '50% 50%' });
    gsap.set(svgs[0], { transformOrigin: '50% 87.5%' });
    gsap.set(svgs[1], { transformOrigin: '50% 85%' });
    gsap.set(word, { opacity: 0, x: 170 });
    gsap.set(lbls, { opacity: 0 });

    D.show(s, T);
    D.setBg(bgc, T);
    D.ink(fg, T);
    if (o.label) D.label(T, o.label);
    D.sfx('kick', T, 0.8);
    D.sfx('bell', T, N.A4, 0.14);

    tl.to(guides, { drawSVG: '0% 100%', duration: 1.2, ease: 'expo.inOut', stagger: 0.07 }, T);
    tl.to(strokes, { drawSVG: '0% 100%', duration: 1.15, ease: 'expo.inOut', stagger: 0.15 }, T + 0.15);
    tl.to(shapes, { rotation: 0, duration: 1.35, ease: 'expo.inOut', stagger: 0.15 }, T + 0.15);
    [N.C5, N.E5, N.G5].forEach((f, i) => D.sfx('bell', T + 0.35 + i * 0.15, f, 0.1));
    tl.to(word, { opacity: 1, duration: 1.6, ease: 'power2.out' }, T + 0.3);
    tl.to(word, { x: -170, duration: 5.2, ease: 'none' }, T + 0.3);

    fills.forEach((f, i) => {
      const t = T + 1.5 + i * 0.25;
      tl.to(f, { scale: 1, duration: 0.75, ease: 'back.out(1.8)' }, t);
      D.sfx('kick', t, 0.75);
      D.sfx('bell', t, [N.A4, N.C5, N.E5][i], 0.14);
    });
    labels.slice(0, 3).forEach((txt, i) => {
      const t = T + 1.6 + i * 0.25;
      tl.set(lbls[i], { opacity: 1 }, t);
      tl.to(lbls[i], { duration: 0.6, scrambleText: { text: txt, chars: '0123456789', speed: 0.8 }, ease: 'none' }, t);
    });
    tl.to(strokes, { opacity: 0, duration: 0.5, ease: 'power2.out' }, T + 2.3);
    tl.to(guides, { drawSVG: '100% 100%', duration: 0.8, ease: 'expo.inOut', stagger: 0.05 }, T + 2.2);
    for (let k = 0; k < 12; k++) D.sfx('hat', T + 2 + k * 0.25, 0.16);

    // swap: circle arcs over, triangle dives under
    const t1 = T + 2.5;
    tl.to(lbls, { opacity: 0, duration: 0.3 }, t1);
    tl.to(ci, { x: 800, duration: 0.9, ease: 'power3.inOut' }, t1);
    tl.to(ci, { y: -300, duration: 0.45, ease: 'power2.out' }, t1);
    tl.to(ci, { y: 0, duration: 0.45, ease: 'power2.in' }, t1 + 0.45);
    tl.to(tr, { x: -800, rotation: -360, duration: 0.9, ease: 'power3.inOut' }, t1);
    tl.to(tr, { y: 190, duration: 0.45, ease: 'power2.out' }, t1);
    tl.to(tr, { y: 0, duration: 0.45, ease: 'power2.in' }, t1 + 0.45);
    tl.to(sq, { rotation: 90, duration: 0.7, ease: 'back.inOut(2)' }, t1 + 0.1);
    D.hit(svgs[0], { scaleX: 1.3, scaleY: 0.72 }, { scaleX: 1, scaleY: 1, duration: 0.8, ease: 'elastic.out(1, 0.35)' }, t1 + 0.9);
    D.sfx('whoosh', t1, 0.9, 0.45);
    D.sfx('kick', t1 + 0.9, 0.8);

    // hop
    const t2 = T + 3.5;
    tl.to(sq, { y: -240, duration: 0.36, ease: 'power2.out' }, t2);
    tl.to(sq, { y: 0, duration: 0.36, ease: 'power2.in' }, t2 + 0.36);
    tl.to(sq, { rotation: 270, duration: 0.72, ease: 'power2.inOut' }, t2);
    D.hit(svgs[1], { scaleX: 1.25, scaleY: 0.75 }, { scaleX: 1, scaleY: 1, duration: 0.7, ease: 'elastic.out(1, 0.35)' }, t2 + 0.72);
    D.sfx('whoosh', t2, 0.6, 0.35);
    D.sfx('kick', t2 + 0.72, 0.8);

    // converge
    const t3 = T + 4.3;
    tl.to(ci, { x: 400, scale: 1.3, duration: 0.6, ease: 'expo.inOut' }, t3);
    tl.to(tr, { x: -400, scale: 1.3, rotation: -480, duration: 0.6, ease: 'expo.inOut' }, t3);
    tl.to(sq, { scale: 1.3, rotation: 315, duration: 0.6, ease: 'expo.inOut' }, t3);
    D.sfx('whoosh', t3, 0.6, 0.4);
    D.sfx('riser', t3 + 0.2, 1.0, 0.4);
    tl.to(word, { opacity: 0, duration: 0.3 }, T + 4.9);
    tl.to([sq, tr], { scale: 0, duration: 0.32, ease: 'expo.in' }, T + 4.95);
    if (o.exit !== false) {
      tl.set(ci, { mixBlendMode: 'normal' }, T + 4.95);
      tl.to(ci, { scale: 9, duration: 0.55, ease: 'expo.in' }, T + 4.95);
      D.setBg(colors[0], T + 5.5);
    } else {
      tl.to(ci, { scale: 0, duration: 0.32, ease: 'expo.in' }, T + 4.95);
    }
    D.hide(s, T + 5.5);
    return 5.5;
  });

  // ------------------------------------------------------------------ SHIFT
  // One step per 2 beats: colour cut/wipe, shape morph, word with its own
  // entrance personality, figure caption. Ends collapsing to a dot.  n × 1 s
  const WORD_FX = {
    rise: { from: { yPercent: 105, opacity: 0 }, to: { yPercent: 0, opacity: 1, duration: 0.7, ease: 'expo.out', stagger: 0.035 } },
    slide: { from: { x: 280, skewX: -40, opacity: 0 }, to: { x: 0, skewX: 0, opacity: 1, duration: 0.6, ease: 'expo.out', stagger: 0.03 } },
    flip: { from: { rotationX: -100, opacity: 0, transformOrigin: '50% 100%' }, to: { rotationX: 0, opacity: 1, duration: 0.8, ease: 'back.out(1.6)', stagger: 0.05 } },
    break: {
      from: { y: k => [-420, 360, -300, 420, -360][k % 5], rotation: k => [-50, 30, -24, 40, -35][k % 5], opacity: 0 },
      to: { y: 0, rotation: 0, opacity: 1, duration: 0.65, ease: 'power4.out', stagger: 0.03 },
    },
    build: { from: { scaleY: 0, transformOrigin: '50% 100%' }, to: { scaleY: 1, duration: 0.65, ease: 'expo.out', stagger: 0.05 } },
    blur: { from: { opacity: 0, filter: 'blur(28px)', scale: 1.3 }, to: { opacity: 1, filter: 'blur(0px)', scale: 1, duration: 0.6, ease: 'power3.out', stagger: 0.04 } },
    bloom: { from: { scale: 0, opacity: 0 }, to: { scale: 1, opacity: 1, duration: 0.65, ease: 'back.out(3)', stagger: { each: 0.05, from: 'center' } } },
    evolve: { from: { yPercent: 105, opacity: 0 }, to: { yPercent: 0, opacity: 1, duration: 0.7, ease: 'expo.out', stagger: 0.03 } },
  };
  const FX_ORDER = Object.keys(WORD_FX);
  const FORM_ORDER = ['square', 'triangle', 'blob', 'star', 'hexagon', 'cross', 'flower', 'circle'];
  const CUTS = ['right', 'up', 'left', 'down'];
  const MEL = [440, 523.25, 587.33, 659.25, 783.99, 659.25, 880, 1046.5];
  const ROOTS = [55, 55, 43.65, 43.65, 65.41, 65.41, 49, 49];

  recipe('shift', (D, T, o) => {
    const { tl, C } = D;
    const F = D.forms(1);
    const schemes = [[C.a[0], C.paper], [C.a[1], C.a[3]], [C.a[3], C.a[5]], [C.ink, C.a[0]], [C.paper, C.a[1]], [C.a[4], C.a[2]], [C.a[5], C.a[2]], [C.ink, C.paper]];
    const steps = o.steps.map((st, i) => {
      const [sbg, sshape] = schemes[i % schemes.length];
      const bg = st.bg || sbg;
      return {
        fx: FX_ORDER[i % FX_ORDER.length], form: FORM_ORDER[i % FORM_ORDER.length],
        cut: i % 2 ? CUTS[((i - 1) / 2) % 4] : false,
        ...st, bg, fg: st.fg || D.contrast(bg), shape: st.shape || sshape,
      };
    });
    const n = steps.length;
    // the shape turns +spin° per step (cumulative). Use a multiple of 360/steps-symmetry, or 0 when
    // custom paths (arrows, shields, glyphs) must stay upright.
    const spin = o.spin ?? 90;
    const s = D.scene('shift', `
      <div class="sh-count mono"></div>
      <div class="sh-words">${steps.map(st => `<div class="w v">${st.word}</div>`).join('')}</div>
      <div class="sh-meta mono"></div>
      <div class="sh-shape c"><svg viewBox="-250 -250 500 500"><path d="${F.circle}"/></svg></div>`);
    const shape = D.$('.sh-shape', s), path = D.$('path', shape), meta = D.$('.sh-meta', s), count = D.$('.sh-count', s);
    const box = D.$('.sh-words', s), words = D.$$('.w', box);
    words.forEach(w => D.fit(w, 1020));
    const splits = words.map(w => D.split(w, { type: 'chars' }));
    steps.forEach((st, i) => {
      gsap.set(splits[i].chars, (WORD_FX[st.fx] || WORD_FX.rise).from);
      if (st.fx === 'evolve') gsap.set(words[i], { '--wd': 62, '--wg': 100 });
    });
    gsap.set(shape, { scale: 0 });
    gsap.set(path, { fill: C.paper });

    D.show(s, T);
    const num = o.label ? D.label(T, o.label) : '00';
    D.call(() => SFX.pad('shift', [110, 164.81, 220], 1, 0.035, 900), T);
    tl.to(shape, { scale: 1, duration: 0.8, ease: 'back.out(1.6)' }, T);

    steps.forEach((st, i) => {
      const t = T + i, ch = splits[i].chars, fx = WORD_FX[st.fx] || WORD_FX.rise;
      if (i === 0) D.setBg(st.bg, t);
      else if (st.cut) D.wipeTo(st.bg, t - 0.22, st.cut);
      else {
        D.setBg(st.bg, t);
        D.hit(shape, { scale: 1.12 }, { scale: 1, duration: 0.5, ease: 'power3.out' }, t);
      }
      tl.to([D.hud, meta, count, box], { color: st.fg, duration: 0.01, ease: 'none' }, t);
      tl.to(path, { morphSVG: F[st.form] || st.form, fill: st.shape, duration: 0.75, ease: 'expo.inOut' }, t);
      tl.to(shape, { rotation: (i + 1) * spin, duration: 0.9, ease: 'back.inOut(1.3)' }, t);
      tl.to(ch, fx.to, t + (st.cut ? 0.06 : 0));
      if (st.fx === 'evolve') tl.to(words[i], { '--wd': 100, '--wg': 900, duration: 1.0, ease: 'expo.inOut' }, t); // 100 = the width D.fit measured
      if (i < n - 1) tl.to(ch, { yPercent: -40, opacity: 0, duration: 0.22, ease: 'power3.in', stagger: 0.012 }, t + 0.72);
      const name = (st.name || (F[st.form] ? st.form : 'custom')).toUpperCase();
      tl.to(meta, { duration: 0.5, scrambleText: { text: `FIG. ${num}.${i + 1} — ${name} · ${st.shape.toUpperCase()}`, chars: '0123456789ABCDEF', speed: 1 }, ease: 'none' }, t);
      tl.to(count, { duration: 0.35, scrambleText: { text: `${String(i + 1).padStart(2, '0')} / ${String(n).padStart(2, '0')}`, chars: '0123456789' }, ease: 'none' }, t);
      if (st.fx === 'break') D.shake(t, 0.45, 16);

      D.sfx('kick', t, 0.95);
      D.sfx('kick', t + 0.5, 0.8);
      D.sfx('clap', t + 0.5, 0.32);
      D.sfx('hat', t + 0.25);
      D.sfx('hat', t + 0.75);
      D.sfx('bell', t, MEL[i % MEL.length], 0.13);
      [0, 0.25, 0.5, 0.75].forEach((off, k) => D.sfx('bass', t + off, ROOTS[i % ROOTS.length] * (k % 2 ? 2 : 1), 0.3));
    });

    const tEnd = T + n - 0.45;
    tl.to(splits[n - 1].chars, { yPercent: -40, opacity: 0, duration: 0.25, ease: 'power3.in', stagger: 0.012 }, tEnd);
    tl.to([meta, count], { opacity: 0, duration: 0.2 }, tEnd);
    if (o.collapse !== false) {
      tl.to(path, { morphSVG: F.circle, fill: C.paper, duration: 0.4, ease: 'power2.in' }, tEnd);
      tl.to(shape, { x: D.CX - 1420, scale: 0.032, duration: 0.45, ease: 'expo.in' }, tEnd);
      D.sfx('riser', tEnd, 0.45, 0.3);
    } else {
      tl.to(shape, { scale: 0, duration: 0.4, ease: 'back.in(2)' }, tEnd);
    }
    D.call(() => SFX.padStop('shift', 0.6), T + n - 0.1);
    D.hide(s, T + n);
    return n;
  });

  // ------------------------------------------------------------------ RHYTHM
  // 25×13 dot grid: radial colour wave, diamonds sweep, a word pops on the
  // eighth notes, the grid becomes a waveform, then implodes.          6.5 s
  recipe('rhythm', (D, T, o) => {
    const { tl, C, N } = D;
    const COLS = 25, ROWS = 13, GAP = 72;
    const G = { grid: [ROWS, COLS] };
    const x0 = D.CX - ((COLS - 1) / 2) * GAP, y0 = D.CY - ((ROWS - 1) / 2) * GAP;
    const pos = [];
    let tilesHTML = '';
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
      const x = x0 + c * GAP, y = y0 + r * GAP;
      pos.push({ x, y, c, r });
      tilesHTML += `<div class="r-tile" style="left:${x - 28}px;top:${y - 28}px"></div>`;
    }
    const s = D.scene('rhythm', `<div class="r-grid">${tilesHTML}</div><div class="r-word v c">${o.word || 'RHYTHM'}</div>`);
    const grid = D.$('.r-grid', s), tiles = D.$$('.r-tile', s);
    const ws = D.split(D.fit(D.$('.r-word', s), 1750), { type: 'chars' });
    const center = tiles[Math.floor(ROWS / 2) * COLS + Math.floor(COLS / 2)];
    const colorAt = i => D.ramp(C.spectrum, pos[i].c / (COLS - 1) * 0.7 + pos[i].r / (ROWS - 1) * 0.3);
    gsap.set(tiles, { scale: 0, backgroundColor: C.paper, borderRadius: '50%' });
    gsap.set(ws.chars, { scale: 0, opacity: 0 });

    D.show(s, T);
    D.setBg(o.bg || C.ink, T);
    D.ink(C.paper, T);
    if (o.label) D.label(T, o.label);
    tl.set(center, { scale: 0.25 }, T);
    tl.to(tiles, { scale: 0.25, duration: 0.5, ease: 'back.out(3)', stagger: { ...G, from: 'center', amount: 0.8 } }, T + 0.05);
    [N.A4, N.C5, N.E5, N.A5, N.C6].forEach((f, i) => D.sfx('bell', T + i * 0.09, f, 0.08));

    tl.to(tiles, { scale: 0.92, backgroundColor: colorAt, duration: 0.3, ease: 'power2.out', stagger: { ...G, from: 'center', amount: 0.55 } }, T + 1.0);
    tl.to(tiles, { scale: 0.4, duration: 0.6, ease: 'power3.inOut', stagger: { ...G, from: 'center', amount: 0.55 } }, T + 1.3);
    tl.to(tiles, { borderRadius: '10%', rotation: 45, scale: 0.62, duration: 0.7, ease: 'expo.inOut', stagger: { ...G, from: 'start', amount: 0.7 } }, T + 2.0);
    D.sfx('whoosh', T + 2.0, 0.8, 0.35);

    const pop = Math.min(0.25, 1.5 / Math.max(1, ws.chars.length));
    ws.chars.forEach((ch, k) => {
      const t = T + 3 + k * pop;
      tl.to(ch, { scale: 1, opacity: 1, duration: 0.45, ease: 'back.out(2.5)' }, t);
      D.hit(grid, { scale: 1.05 }, { scale: 1, duration: 0.35, ease: 'power3.out' }, t);
      D.sfx('clap', t, 0.36);
    });

    const Wv = { amp: 0, ph: 0 };
    const setY = tiles.map(el => gsap.quickSetter(el, 'y', 'px'));
    const setCY = ws.chars.map(el => gsap.quickSetter(el, 'y', 'px'));
    const wave = () => {
      for (let i = 0; i < tiles.length; i++) setY[i](Wv.amp * Math.sin(pos[i].c * 0.45 - Wv.ph + pos[i].r * 0.12));
      for (let k = 0; k < setCY.length; k++) setCY[k](Wv.amp * 0.35 * Math.sin(k * 0.9 - Wv.ph));
    };
    tl.to(tiles, { borderRadius: '50%', rotation: 90, scale: 0.36, duration: 0.5, ease: 'expo.inOut', stagger: { ...G, from: 'end', amount: 0.3 } }, T + 4.3);
    tl.to(Wv, { amp: 150, duration: 0.6, ease: 'power2.out' }, T + 4.4);
    tl.to(Wv, { amp: 0, duration: 0.4, ease: 'power2.in' }, T + 5.4);
    tl.to(Wv, { ph: Math.PI * 5, duration: 1.4, ease: 'none', onUpdate: wave }, T + 4.4);
    tl.to(ws.chars, { scale: 0, opacity: 0, duration: 0.35, ease: 'power3.in', stagger: { each: 0.03, from: 'center' } }, T + 5.4);

    tl.to(tiles, {
      x: i => D.CX - pos[i].x, y: i => D.CY - pos[i].y, scale: 0,
      duration: 0.55, ease: 'expo.in', stagger: { ...G, from: 'edges', amount: 0.1 },
    }, T + 5.85);
    D.sfx('riser', T + 5.85, 0.62, 0.4);

    for (let k = 0; k < 10; k++) { D.sfx('kick', T + 1 + k * 0.5, 0.85); D.sfx('hat', T + 1.25 + k * 0.5); }
    const root = t => (t < T + 3 ? 55 : t < T + 4.4 ? 43.65 : 49);
    for (let k = 0; k < 19; k++) { const t = T + 1 + k * 0.25; D.sfx('bass', t, root(t) * (k % 2 ? 2 : 1), 0.26); }
    D.hide(s, T + 6.5);
    return 6.5;
  });

  // ------------------------------------------------------------------ PARTICLES
  // 2,800 particles: big-bang burst → spiral galaxy → assemble into a word →
  // light sweep → detonate. Pairs perfectly with 'warp' next.            5.0 s
  recipe('particles', (D, T, o) => {
    const { tl, N } = D;
    const P = D.particles({ word: o.word || 'MOTION', count: o.count });
    const caption = o.caption ?? D.cfg.ui.particles.replace('{n}', D.fmt(P.count));
    const s = D.scene('particles', `<div class="cap mono c" style="top:770px"></div>`);
    const cap = D.$('.cap', s);
    gsap.set(cap, { opacity: 0 });

    D.show(s, T);
    D.ink(D.C.paper, T);
    if (o.label) D.label(T, o.label);
    tl.set(P, { alpha: 1 }, T);
    D.barsTo(110, T, 0.9);
    tl.to(P, { emerge: 1, duration: 1.8, ease: 'expo.out' }, T);
    tl.to(P, { spin: 3.4, duration: 4.2, ease: 'power2.out' }, T);
    D.flash(T, 0.5, 0.5, '#c8b8ff');
    D.shake(T, 0.4, 10);
    D.sfx('boom', T, 1);
    D.sfx('whoosh', T, 1.3, 0.45);
    D.call(() => SFX.pad('space', [220, 329.63, 440], 1.5, 0.035, 2200), T);

    tl.to(P, { form: 1, duration: 1.7, ease: 'none' }, T + 1.6);
    D.sfx('riser', T + 1.7, 1.6, 0.35);
    const tf = T + 3.3;
    D.flash(tf, 0.3, 0.5);
    D.shake(tf, 0.35, 8);
    D.sfx('boom', tf, 0.8);
    D.sfx('crash', tf, 0.22);
    D.sfx('bell', tf, N.A5, 0.12);
    D.sfx('bell', tf, N.E5, 0.1);
    tl.to(P, { shimmer: 1, duration: 0.6 }, tf);
    if (caption) {
      tl.set(cap, { opacity: 1 }, tf + 0.1);
      tl.to(cap, { duration: 0.9, scrambleText: { text: caption, chars: '0123456789', speed: 0.7 }, ease: 'none' }, tf + 0.1);
    }
    tl.set(P, { sweep: -0.1 }, tf + 0.3);
    tl.to(P, { sweep: 1.1, duration: 1.0, ease: 'power1.inOut' }, tf + 0.3);
    tl.set(P, { sweep: -1 }, tf + 1.3);

    const tx = T + 4.7;
    tl.to(cap, { opacity: 0, duration: 0.25 }, tx - 0.1);
    tl.to(P, { explode: 1, duration: 1.6, ease: 'expo.out' }, tx);
    tl.to(P, { alpha: 0, duration: 1.0, ease: 'power2.in' }, tx + 0.4);
    D.flash(tx, 0.4, 0.4);
    D.sfx('boom', tx, 0.9);
    D.sfx('whoosh', tx, 1.0, 0.55);
    D.call(() => SFX.padStop('space', 1.2), tx);
    D.hide(s, T + 5);
    return 5.0;
  });

  // ------------------------------------------------------------------ WARP
  // Accelerating tunnel of glowing rings + star streaks, up to 3 words,
  // a velocity readout, a drum build (8ths → 16ths → 32nds), white flash. 6.5 s
  recipe('warp', (D, T, o) => {
    const { tl, N } = D;
    const words = (o.words || ['DEPTH', 'SPEED', 'LIGHT']).slice(0, 3);
    const Tn = D.tunnel({ sides: o.sides });
    const s = D.scene('warp', `${words.map((w, i) => `<div class="w-word v c w${i}">${w}</div>`).join('')}<div class="cap mono c" style="top:700px"></div>`);
    const [w0, w1, w2] = D.$$('.w-word', s).map(el => D.fit(el, 1650));
    const vel = D.$('.cap', s);
    const readout = o.readout || 'VELOCITY';
    const B = T + 1.0; // beat anchor: the tunnel pre-rolls one second under the previous scene's tail

    if (w0) gsap.set(w0, { opacity: 0, letterSpacing: '1.1em', paddingLeft: '1.1em', filter: 'blur(18px)' });
    if (w1) gsap.set(w1, { opacity: 0, x: 700, skewX: -35 });
    if (w2) gsap.set(w2, { opacity: 0, scale: 0.3, filter: 'blur(0px)' });
    gsap.set(vel, { opacity: 0 });
    vel.textContent = `${readout} 0.000 c`;

    const velText = () => { vel.textContent = `${readout} ${(0.999 * Math.sqrt(Tn.z / 12500)).toFixed(3)} c`; };
    tl.to(Tn, { alpha: 1, duration: 1.0, ease: 'power2.out' }, T);
    tl.to(Tn, { z: 12500, streak: 1500, duration: 6.5, ease: 'power2.in', onUpdate: velText }, T);
    tl.to(Tn, { roll: 1.4, hue: 2, duration: 6.5, ease: 'power1.inOut' }, T);
    tl.to(Tn, { core: 1, duration: 6.5, ease: 'power3.in' }, T);
    D.call(() => SFX.pad('warp', [55, 82.41, 110], 2.5, 0.05, 500), T);
    D.barsTo(110, T, 0.6);
    D.ink(D.C.paper, T);

    D.show(s, B);
    if (o.label) D.label(B, o.label);
    tl.to(vel, { opacity: 1, duration: 0.6 }, B + 0.4);
    if (w0) {
      tl.to(w0, { opacity: 1, letterSpacing: '0.1em', paddingLeft: '0.1em', filter: 'blur(0px)', duration: 1.3, ease: 'expo.out' }, B + 0.1);
      tl.to(w0, { opacity: 0, scale: 1.5, filter: 'blur(14px)', duration: 0.45, ease: 'power2.in' }, B + 1.65);
    }
    if (w1) {
      tl.to(w1, { opacity: 1, x: 0, skewX: -12, duration: 0.55, ease: 'expo.out' }, B + 2.0);
      D.hit(w1, { textShadow: D.chroma(14) }, { textShadow: D.chroma(3, 0.6), duration: 0.6, ease: 'power2.out' }, B + 2.0);
      tl.to(w1, { x: -80, duration: 1.2, ease: 'none' }, B + 2.55);
      tl.to(w1, { x: -1100, skewX: -40, opacity: 0, duration: 0.3, ease: 'expo.in' }, B + 3.75);
    }
    if (w2) {
      tl.to(w2, { opacity: 1, scale: 1, duration: 0.7, ease: 'expo.out' }, B + 4.05);
      tl.to(w2, { scale: 4, opacity: 0, filter: 'blur(10px)', duration: 0.5, ease: 'expo.in' }, B + 4.95);
    }
    tl.to(vel, { opacity: 0, duration: 0.3 }, B + 5.1);
    D.shake(B + 3.4, 2.0, 12, true);

    D.sfx('riser', B, 5.42, 0.5);
    D.sfx('whoosh', B + 0.1, 1.2, 0.4);
    D.sfx('whoosh', B + 2.0, 0.6, 0.45);
    D.sfx('bell', B + 4.05, N.A5, 0.12);
    D.sfx('bell', B + 4.05, N.E5, 0.1);
    for (let k = 0; k < 8; k++) D.sfx('kick', B + k * 0.5, 0.9);
    for (let k = 0; k < 4; k++) D.sfx('clap', B + 2 + k * 0.25, 0.22);
    for (let k = 0; k < 8; k++) D.sfx('clap', B + 3 + k * 0.125, 0.26);
    for (let k = 0; k < 16; k++) D.sfx('clap', B + 4 + k * 0.0625, 0.3);

    D.flash(B + 5.42, 1, 0.35);
    tl.to(Tn, { alpha: 0, duration: 0.08 }, B + 5.42);
    D.call(() => SFX.padStop('warp', 0.08), B + 5.44);
    D.barsTo(0, B + 5.5, 0);
    D.hide(s, B + 5.5);
    return 6.5;
  });

  // ------------------------------------------------------------------ MONTAGE
  // Hard cuts on the 8th notes (0.25 s), then a beat of silence.   n×0.25 + 0.5 s
  const CARD_ANIM = {
    word: { from: { scale: 1.3 }, to: { scale: 1 } },
    glow: { from: { scale: 1.6, opacity: 0.3 }, to: { scale: 1, opacity: 1 } },
    italic: { from: { x: 260, skewX: -32 }, to: { x: 0, skewX: -12 } },
    thin: { from: { scale: 0.86 }, to: { scale: 1 } },
    outline: { from: { letterSpacing: '0em', paddingLeft: '0em' }, to: { letterSpacing: '0.3em', paddingLeft: '0.3em' } },
    circle: { from: { x: 360, scale: 0.7 }, to: { x: 0, scale: 1 } },
    triangle: { from: { rotation: -50, scale: 0.55 }, to: { rotation: 0, scale: 1 } },
    square: { from: { rotation: 0, scale: 0.4 }, to: { rotation: 45, scale: 1 } },
    star: { from: { rotation: -90, scale: 0.3 }, to: { rotation: 0, scale: 1 } },
  };
  const MONT = [440, 523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66];
  function defaultCards(C, w) {
    return [
      { bg: C.a[0], text: w[0] || 'COLOR', color: C.ink },
      { bg: C.ink, kind: 'circle', color: C.paper },
      { bg: C.a[3], text: w[1] || 'TYPE', style: 'italic', color: C.ink },
      { bg: C.a[1], kind: 'triangle', color: C.paper },
      { bg: C.paper, text: w[2] || 'TIME', style: 'thin', color: C.ink },
      { bg: C.a[4], kind: 'square', color: C.ink },
      { bg: C.a[5], text: w[3] || 'LIGHT', style: 'glow', color: C.a[3] },
      { bg: C.ink, text: w[4] || 'SPACE', style: 'outline', color: C.paper },
    ];
  }
  recipe('montage', (D, T, o) => {
    const { tl, C } = D;
    const cards = o.cards || defaultCards(C, o.words || []);
    const beat = o.beat || 0.25;
    const s = D.scene('montage', cards.map(cd => {
      const color = cd.color || C.paper;
      const inner = cd.kind && cd.kind !== 'word'
        ? `<div class="m-${cd.kind} c" style="background:${color}"></div>`
        : `<div class="m-word v c ${cd.style || ''}" style="${cd.style === 'outline' ? `--stroke:${color}` : `color:${color}`}">${cd.text}</div>`;
      return `<div class="m-card" style="background:${cd.bg}">${inner}</div>`;
    }).join(''));
    // fit every word at the widest state it animates to (outline tracks out to 0.3em)
    D.$$('.m-word', s).forEach(el => {
      const wide = el.classList.contains('outline');
      if (wide) Object.assign(el.style, { letterSpacing: '0.3em', paddingLeft: '0.3em' });
      D.fit(el, 1750);
      if (wide) Object.assign(el.style, { letterSpacing: '', paddingLeft: '' });
    });
    const els = D.$$('.m-card', s);

    D.show(s, T);
    tl.to(D.hud, { autoAlpha: 0, duration: 0.01 }, T);
    cards.forEach((cd, k) => {
      const t = T + k * beat;
      const anim = CARD_ANIM[cd.style] || CARD_ANIM[cd.kind] || CARD_ANIM.word;
      D.show(els[k], t);
      D.hide(els[k], t + beat);
      D.hit(els[k].firstElementChild, anim.from, { ...anim.to, duration: beat, ease: 'power3.out' }, t);
      D.sfx('kick', t, 0.9);
      D.sfx('clap', t, 0.3);
      D.sfx('bell', t, MONT[k % MONT.length], 0.12);
    });
    const end = T + cards.length * beat, silence = o.silence ?? 0.5;
    if (silence) {
      D.setBg('#000', end);
      D.call(() => SFX.stopAll(), end);
    }
    D.hide(s, end);
    return cards.length * beat + silence;
  });

  // ------------------------------------------------------------------ TITLE
  // BRAAAM: white flash, title slams in (chromatic split), ring draws, orbiting
  // brand shapes, subtitle scramble, holographic sheen, variable-font breath.  5.6 s
  recipe('title', (D, T, o) => {
    const { tl, C, N } = D;
    const colors = o.colors || [C.a[0], C.a[1], C.a[2]];
    const s = D.scene('title', `
      <div class="t-glow c"></div>
      <svg class="t-svg" viewBox="0 0 1920 1080" aria-hidden="true">
        <circle class="t-ring2" cx="960" cy="540" r="470"/><circle class="t-ring" cx="960" cy="540" r="430"/>
      </svg>
      <div class="t-orbit c">${o.glyphs
        ? o.glyphs.slice(0, 3).map((g, k) => `<i class="t-o t-g v c" style="color:${colors[k]}">${g}</i>`).join('')
        : `<i class="t-o c" style="border-radius:50%;background:${colors[0]}"></i>
        <i class="t-o c" style="background:${colors[1]}"></i>
        <i class="t-o c" style="background:${colors[2]};clip-path:polygon(50% 0,100% 100%,0 100%)"></i>`}
      </div>
      <h1 class="t-title v c">${o.title || D.cfg.meta.title}</h1>
      <div class="t-title t-sheen v c" aria-hidden="true">${o.title || D.cfg.meta.title}</div>
      <div class="t-sub mono c"></div>`);
    const title = D.fit(D.$('.t-title', s), 1500), sheen = D.$('.t-sheen', s), sub = D.$('.t-sub', s);
    sheen.style.fontSize = title.style.fontSize;
    const ring = D.$('.t-ring', s), ring2 = D.$('.t-ring2', s), orbit = D.$('.t-orbit', s), os = D.$$('.t-o', s), glow = D.$('.t-glow', s);
    const st = D.split(title, { type: 'chars' });

    gsap.set(st.chars, { opacity: 0, scale: 2.6, filter: 'blur(16px)' });
    gsap.set(sheen, { opacity: 0, backgroundPosition: '100% 0%' });
    gsap.set(ring, { drawSVG: '0%', rotation: -90, transformOrigin: '50% 50%' });
    gsap.set(ring2, { opacity: 0, rotation: 0, transformOrigin: '50% 50%' });
    gsap.set(os, { scale: 0 });
    os.forEach((el, k) => { const a = -Math.PI / 2 + k * 2.0944; gsap.set(el, { x: Math.cos(a) * 470, y: Math.sin(a) * 470 }); });
    gsap.set(glow, { opacity: 0, scale: 0.6 });
    gsap.set(sub, { autoAlpha: 0 });

    D.show(s, T);
    D.setBg(C.night, T);
    D.ink(C.paper, T);
    D.flash(T, 1, 0.9);
    D.shake(T, 0.7, 22);
    D.sfx('braam', T, 0.85);
    D.sfx('boom', T, 1);
    D.sfx('crash', T, 0.3);
    D.call(() => SFX.pad('title', [110, 130.81, 164.81, 220], 1.2, 0.07, 900), T);

    tl.to(st.chars, { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 1.1, ease: 'expo.out', stagger: { each: 0.05, from: 'center' } }, T);
    D.hit(title, { textShadow: D.chroma(14) }, { textShadow: D.chroma(0, 0), duration: 1.2, ease: 'expo.out' }, T);
    tl.to(glow, { opacity: 1, scale: 1, duration: 2.5, ease: 'expo.out' }, T);
    tl.to(ring, { drawSVG: '0% 100%', duration: 1.8, ease: 'expo.inOut' }, T + 0.2);
    tl.to(ring2, { opacity: 1, duration: 1.5 }, T + 0.8);
    tl.to(ring2, { rotation: 50, duration: 9, ease: 'none' }, T + 0.8);
    tl.to(os, { scale: 1, duration: 0.7, ease: 'back.out(2.5)', stagger: 0.12 }, T + 0.9);
    tl.to(orbit, { rotation: 110, duration: 5.2, ease: 'none' }, T + 0.9);
    [N.A4, N.C5, N.E5].forEach((f, i) => D.sfx('bell', T + 0.9 + i * 0.12, f, 0.1));
    tl.to(D.hud, { autoAlpha: 1, duration: 1 }, T + 1.4);
    if (o.label) D.label(T + 1.4, o.label);

    if (o.subtitle) {
      tl.set(sub, { autoAlpha: 1 }, T + 1.3);
      tl.to(sub, { duration: 1.4, scrambleText: { text: o.subtitle, chars: 'upperCase', speed: 0.5, revealDelay: 0.2 }, ease: 'none' }, T + 1.3);
    }
    tl.set(sheen, { opacity: 1 }, T + 1.8);
    tl.to(sheen, { backgroundPosition: '0% 0%', duration: 1.3, ease: 'power2.inOut' }, T + 1.8);
    tl.set(sheen, { opacity: 0 }, T + 3.1);
    D.sfx('whoosh', T + 1.8, 1.3, 0.25);
    D.barsTo(110, T + 2.4, 1.2);

    if (o.breath !== false) {
      tl.to(title, { '--wd': 62, '--wg': 200, letterSpacing: '0.06em', duration: 0.9, ease: 'expo.inOut' }, T + 3.1);
      tl.to(title, { '--wd': 125, '--wg': 900, letterSpacing: '-0.01em', duration: 0.55, ease: 'expo.out' }, T + 4.1);
      D.hit(orbit, { scale: 1.08 }, { scale: 1, duration: 0.8, ease: 'elastic.out(1, 0.4)' }, T + 4.1);
      D.sfx('whoosh', T + 3.1, 0.9, 0.3);
      D.sfx('kick', T + 4.1, 1);
      D.sfx('bell', T + 4.1, N.A5, 0.12);
    }

    tl.to(st.chars, { opacity: 0, yPercent: -25, filter: 'blur(12px)', duration: 0.45, ease: 'power3.in', stagger: { each: 0.03, from: 'edges' } }, T + 5.0);
    tl.to(sub, { autoAlpha: 0, duration: 0.3 }, T + 5.0);
    tl.to(ring, { drawSVG: '100% 100%', duration: 0.7, ease: 'expo.inOut' }, T + 5.0);
    tl.to([ring2, glow], { opacity: 0, duration: 0.6 }, T + 5.0);
    tl.to(os, { scale: 0, duration: 0.35, ease: 'back.in(2)', stagger: 0.05 }, T + 5.0);
    D.sfx('whoosh', T + 5.0, 0.6, 0.3);
    D.hide(s, T + 5.6);
    return 5.6;
  });

  // ------------------------------------------------------------------ STATEMENT
  // One big line revealed from masks; letters ripple; out. <span> = accent.  3.3 s
  recipe('statement', (D, T, o) => {
    const { tl, C, N } = D;
    const bgc = o.bg || C.night;
    const s = D.scene('statement', `<div class="st-text v c" style="--accent:${o.accent || C.a[0]}">${o.text || 'EVERYTHING <span>MOVES.</span>'}</div>`);
    const el = D.fit(D.$('.st-text', s), 1700);
    el.style.color = D.contrast(bgc);
    const sg = D.split(el, { type: 'chars', mask: 'chars' });
    gsap.set(sg.chars, { yPercent: 115 });

    D.show(s, T);
    D.setBg(bgc, T);
    D.ink(D.contrast(bgc), T);
    if (o.label) D.label(T, o.label);
    tl.to(sg.chars, { yPercent: 0, duration: 0.9, ease: 'expo.out', stagger: Math.min(0.035, 0.6 / sg.chars.length) }, T + 0.1);
    [N.E4, N.A4, N.C5].forEach(f => D.sfx('bell', T + 0.1, f, 0.08));
    tl.to(sg.masks, { y: -16, duration: 0.35, ease: 'sine.inOut', yoyo: true, repeat: 1, stagger: Math.min(0.045, 0.8 / sg.masks.length) }, T + 1.3);
    tl.to(sg.chars, { yPercent: -115, duration: 0.5, ease: 'expo.in', stagger: 0.015 }, T + 2.8);
    D.hide(s, T + 3.3);
    return 3.3;
  });

  // ------------------------------------------------------------------ CREDITS
  // Brand mark + big stats (numbers count up) + a scrambled line, then the
  // letterbox closes like a curtain.                                      3.7 s
  // "12M" "+48.000" "4,9" "$4,200.50" "99.9%" → { value, render(n) } that keeps the author's own
  // separators. One separator used once and followed by exactly 3 digits = thousands; else decimal.
  function parseStat(str) {
    const m = String(str).match(/^([^\d]*)(\d(?:[\d.,  ]*\d)?)(.*)$/);
    if (!m) return null;
    const [, pre, num, post] = m;
    const seps = num.replace(/\d/g, '');
    let dec = '', grp = '';
    if (seps) {
      const last = seps[seps.length - 1];
      if (new Set(seps).size > 1) { dec = last; grp = seps[0]; }
      else if (seps.length > 1 || num.length - num.lastIndexOf(last) - 1 === 3) grp = last;
      else dec = last;
    }
    const clean = num.split(grp || '\u0000').join('').replace(dec || '\u0000', '.');
    const value = parseFloat(clean), decimals = dec ? num.length - num.lastIndexOf(dec) - 1 : 0;
    const render = n => {
      let [i, f] = n.toFixed(decimals).split('.');
      if (grp) i = i.replace(/\B(?=(\d{3})+(?!\d))/g, grp);
      return pre + i + (f ? dec + f : '') + post;
    };
    return { value, render };
  }

  recipe('credits', (D, T, o) => {
    const { tl, C } = D;
    const stats = o.stats || [['0', 'VIDEO FILES'], ['0', 'IMAGES'], ['100%', 'CODE']];
    const colW = Math.min(480, Math.floor(1700 / stats.length));
    const mark = o.mark === false ? ''
      : typeof o.mark === 'string' ? `<div class="cr-mark cr-logo">${o.mark}</div>` // inline <svg> brand logo
      : `<div class="cr-mark"><i style="border-radius:50%;background:${C.a[0]}"></i><i style="background:${C.a[1]}"></i><i style="background:${C.a[2]};clip-path:polygon(50% 0,100% 100%,0 100%)"></i></div>`;
    const s = D.scene('credits', `
      <div class="cr c" style="grid-template-columns:repeat(${stats.length}, ${colW}px)">
        ${mark}
        ${stats.map(([v, l]) => `<div class="cr-stat"><b class="v">${v}</b><span class="mono">${l}</span></div>`).join('')}
        ${o.line ? '<p class="cr-line mono"></p>' : ''}
      </div>`);
    const box = D.$('.cr', s), items = D.$$('.cr-mark, .cr-stat', s), line = D.$('.cr-line', s);
    const vals = D.$$('.cr-stat b', s);
    vals.forEach(b => D.fit(b, colW - 20));
    // one size for every stat, otherwise a single shrunk value breaks the row
    const fsz = Math.min(...vals.map(b => parseFloat(getComputedStyle(b).fontSize)));
    vals.forEach(b => { b.style.fontSize = fsz + 'px'; });
    gsap.set(items, { y: 40, opacity: 0 });

    D.show(s, T);
    if (o.label) D.label(T, o.label);
    tl.to(items, { y: 0, opacity: 1, duration: 0.9, ease: 'expo.out', stagger: 0.12 }, T + 0.1);
    vals.forEach((b, i) => {
      const st = parseStat(stats[i][0]);
      if (!st || !(st.value > 1)) return;
      const c = { v: 0 };
      tl.to(c, { v: st.value, duration: 1.3, ease: 'expo.out', onUpdate: () => { b.textContent = st.render(c.v); } }, T + 0.34);
    });
    [0, 0.12, 0.24].forEach(off => D.sfx('tick', T + 0.1 + off, 0.05));
    if (line) {
      tl.set(line, { opacity: 0.55 }, T + 0.7);
      tl.to(line, { duration: 1.2, scrambleText: { text: o.line, chars: 'upperCase', speed: 0.6 }, ease: 'none' }, T + 0.7);
    }
    if (o.close === false) {
      tl.to(box, { autoAlpha: 0, duration: 0.6 }, T + 2.6);
      D.hide(s, T + 3.2);
      return 3.2;
    }
    tl.to([box, D.hud], { autoAlpha: 0, duration: 0.6 }, T + 2.4);
    D.barsTo(540, T + 2.5, 1.0);
    D.call(() => SFX.padStop('title', 2.5), T + 2.5);
    D.sfx('boom', T + 3.0, 0.55);
    return 3.7;
  });

  // ------------------------------------------------------------------ LOGO
  // Any inline SVG logo: strokes draw on, fills bloom in with a flash,
  // optional caption scramble, then out.                                  4.2 s
  recipe('logo', (D, T, o) => {
    const { tl, C, N } = D;
    const bgc = o.bg || C.night, color = o.color || D.contrast(bgc);
    const s = D.scene('logo', `<div class="lg c"><div class="lg-mark">${o.svg}</div>${o.caption ? '<div class="lg-cap mono"></div>' : ''}</div>`);
    const svg = D.$('svg', s), mark = D.$('.lg-mark', s), cap = D.$('.lg-cap', s);
    if (!svg) throw new Error('logo recipe: o.svg must contain an <svg> element');
    if (!svg.getAttribute('viewBox') && svg.getAttribute('width')) {
      svg.setAttribute('viewBox', `0 0 ${parseFloat(svg.getAttribute('width'))} ${parseFloat(svg.getAttribute('height'))}`);
    }
    svg.removeAttribute('width');
    svg.removeAttribute('height');
    svg.style.height = (o.size || 320) + 'px';
    svg.style.width = 'auto';
    svg.style.overflow = 'visible';
    const all = D.$$('path, circle, rect, ellipse, polygon, polyline, line', svg);
    // stroke-only parts (fill="none": line glyphs, icons) keep their own stroke and simply draw on
    const lined = all.filter(el => { const cs = getComputedStyle(el); return cs.fill === 'none' && cs.stroke !== 'none'; });
    const parts = all.filter(el => !lined.includes(el));
    const texts = D.$$('text', svg);
    if (o.fill) gsap.set(parts, { fill: o.fill });
    gsap.set(parts, { stroke: color, strokeWidth: o.stroke || 2, vectorEffect: 'non-scaling-stroke', fillOpacity: 0, drawSVG: '0%' });
    gsap.set(lined, { drawSVG: '0%' });
    gsap.set(texts, { opacity: 0 });
    if (cap) gsap.set(cap, { opacity: 0, color: D.contrast(bgc) });

    D.show(s, T);
    D.setBg(bgc, T);
    D.ink(D.contrast(bgc), T);
    if (o.label) D.label(T, o.label);
    if (parts.length) tl.to(parts, { drawSVG: '0% 100%', duration: 1.4, ease: 'expo.inOut', stagger: { amount: 0.5 } }, T + 0.1);
    // line glyphs draw with the outlines in an all-line logo, otherwise they sweep over the fresh fill
    if (lined.length) {
      const tLine = parts.length ? T + 1.75 : T + 0.1;
      tl.to(lined, { drawSVG: '0% 100%', duration: parts.length ? 0.9 : 1.4, ease: parts.length ? 'power2.inOut' : 'expo.inOut', stagger: { amount: 0.3 } }, tLine);
      if (parts.length) D.sfx('bell', tLine + 0.4, N.C6, 0.09);
    }
    D.sfx('whoosh', T + 0.1, 1.4, 0.3);
    [N.C5, N.E5, N.G5].forEach((f, i) => D.sfx('bell', T + 0.3 + i * 0.25, f, 0.08));
    const tf = T + 1.6;
    tl.to(parts, { fillOpacity: 1, duration: 0.6, ease: 'power2.out', stagger: { amount: 0.15 } }, tf);
    tl.to(texts, { opacity: 1, duration: 0.6, ease: 'power2.out' }, tf);
    tl.to(parts, { strokeOpacity: 0, duration: 0.8, ease: 'power2.out' }, tf + 0.3);
    D.hit(mark, { scale: 1.06, filter: 'brightness(1.6)' }, { scale: 1, filter: 'brightness(1)', duration: 1.0, ease: 'expo.out' }, tf);
    D.flash(tf, 0.35, 0.5);
    D.sfx('boom', tf, 0.8);
    D.sfx('bell', tf, N.A5, 0.12);
    D.sfx('bell', tf, N.E5, 0.1);
    if (cap) {
      tl.set(cap, { opacity: 1 }, tf + 0.3);
      tl.to(cap, { duration: 1.0, scrambleText: { text: o.caption, chars: 'upperCase', speed: 0.6 }, ease: 'none' }, tf + 0.3);
    }
    tl.to(mark, { scale: 1.04, duration: 2.0, ease: 'none' }, tf + 0.9);
    const out = T + 3.6;
    tl.to(s, { opacity: 0, filter: 'blur(10px)', duration: 0.5, ease: 'power2.in' }, out);
    D.sfx('whoosh', out, 0.6, 0.25);
    D.hide(s, T + 4.2);
    return 4.2;
  });
})();
