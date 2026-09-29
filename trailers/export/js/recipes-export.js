/* ============================================================================
   EXPORT MODULE — films about rendering a film: frames, determinism, offline audio, formats.
   Built for EXPORT (tools/export.mjs). Every number comes from real export reports.
   Recipes: xpopen, xpframes, xphash, xpwave, xpformats, xptitle.
   ========================================================================== */
(() => {
  'use strict';
  const { recipe } = Trailer;
  const RED = '#ef4444', PAPER = '#fafafa', DIM = '#a1a1aa';
  const nf = (D, d = 0) => new Intl.NumberFormat(D.cfg.locale || 'es-AR', { minimumFractionDigits: d, maximumFractionDigits: d });
  const pad = (n, k = 2) => String(Math.max(0, Math.floor(n))).padStart(k, '0');
  /** SMPTE-style timecode for frame n at fps */
  const tc = (n, fps = 30) => { const s = Math.floor(n / fps); return `${pad(s / 3600)}:${pad((s / 60) % 60)}:${pad(s % 60)}:${pad(n % fps)}`; };
  const from = v => ({ opacity: 0, y: 40, ...v }); // fresh vars on every call (tl.set mutates them)
  const enter = (D, els, at, st = 0.08) => { gsap.set(els, from()); D.hit(els, from(), { opacity: 1, y: 0, duration: 0.6, ease: 'expo.out', stagger: st }, at); };
  const head = (kicker, title) => `<div class="xp-head"><div class="xp-k mono">${kicker}</div><div class="xp-h">${title}</div></div>`;

  // A tiny KINETIC poster that moves: its pose is a pure function of film time t, so every "captured
  // frame" (the viewfinder, each thumbnail on the strip) is that function sampled at i / fps.
  const pose = t => ({
    cx: 60 + 34 * Math.sin(t * 0.9), cy: 46 + 13 * Math.sin(t * 1.7), r: 16 + 4 * Math.sin(t * 2.3),
    sx: 108 + 16 * Math.cos(t * 0.7), sy: 36 + 9 * Math.sin(t * 1.1), rot: (t * 57) % 360,
    tx: 116 + 14 * Math.sin(t * 0.5 + 2), ty: 60 + 7 * Math.sin(t * 2.1 + 1),
  });
  const MINI = '<rect width="160" height="90" fill="#0e0e10"/><circle class="m-c" fill="#ff4d2e"/><rect class="m-s" width="24" height="24" fill="#2b50ff"/><path class="m-t" fill="#ffc21a"/>';
  function drawMini(svg, t) {
    const p = pose(t);
    const c = svg.querySelector('.m-c'), s = svg.querySelector('.m-s'), tr = svg.querySelector('.m-t');
    c.setAttribute('cx', p.cx.toFixed(2)); c.setAttribute('cy', p.cy.toFixed(2)); c.setAttribute('r', p.r.toFixed(2));
    s.setAttribute('x', (p.sx - 12).toFixed(2)); s.setAttribute('y', (p.sy - 12).toFixed(2)); s.setAttribute('transform', `rotate(${p.rot.toFixed(2)} ${p.sx.toFixed(2)} ${p.sy.toFixed(2)})`);
    tr.setAttribute('d', `M${(p.tx - 15).toFixed(2)} ${(p.ty + 13).toFixed(2)} L${p.tx.toFixed(2)} ${(p.ty - 13).toFixed(2)} L${(p.tx + 15).toFixed(2)} ${(p.ty + 13).toFixed(2)}Z`);
  }
  const mini = (t, cls = '') => { const d = document.createElement('div'); d.innerHTML = `<svg class="${cls}" viewBox="0 0 160 90">${MINI}</svg>`; const s = d.firstChild; drawMini(s, t); return s.outerHTML; };

  // ------------------------------------------------------------------ XPOPEN
  // A still timecode and one statement per beat; the last one starts the clock.
  recipe('xpopen', (D, T, o) => {
    const { tl } = D;
    const dur = o.duration || 4, lines = o.lines || [], beat = o.beat || 0.8;
    const s = D.scene('xpopen', `<div class="xp-open">
      <div class="xp-tc mono"><i class="xp-rec"></i><span>${tc(0)}</span></div>
      ${lines.map(l => `<div class="xp-line v">${l}</div>`).join('')}</div>`);
    const tcEl = D.$('.xp-tc span', s), dot = D.$('.xp-rec', s), ls = D.$$('.xp-line', s), tcBox = D.$('.xp-tc', s);
    ls.forEach(e => D.fit(e, 1500));
    D.show(s, T);
    D.setBg('#09090b', T);
    D.ink(PAPER, T);
    if (o.label) D.label(T, o.label);
    gsap.set(ls, { opacity: 0, scale: 1 });
    gsap.set(dot, { opacity: 0.25 });
    gsap.set(tcBox, { opacity: 0 });
    D.hit(tcBox, { opacity: 0 }, { opacity: 1, duration: 0.5 }, T + 0.1);
    ls.forEach((e, i) => {
      const at = T + 0.3 + i * beat, last = i === ls.length - 1;
      D.hit(e, { opacity: 1, scale: 1.18 }, { scale: 1, duration: 0.5, ease: 'expo.out' }, at);
      if (!last) tl.set(e, { opacity: 0 }, at + beat - 0.02);
      D.sfx(last ? 'boom' : 'kick', at, last ? 0.8 : 0.6);
      if (last) {
        tl.set(dot, { opacity: 1 }, at);
        // the clock starts: frames at 30 fps from here to the end of the scene
        const P = { f: 0 };
        tl.to(P, { f: (T + dur - at) * 30, duration: T + dur - at, ease: 'none', onUpdate: () => { tcEl.textContent = tc(P.f); } }, at);
        D.sfx('bell', at, D.N.A4, 0.06);
      }
    });
    D.hide(s, T + dur);
    return dur;
  });

  // ------------------------------------------------------------------ XPFRAMES
  // Time is a number: the playhead steps frame by frame, the shutter fires, each frame drops onto
  // a film strip; then the counter races to the real total.
  recipe('xpframes', (D, T, o) => {
    const { tl } = D;
    const dur = o.duration || 8, fps = o.fps || 30, N = o.frames, film = o.filmDuration, f0 = nf(D), M = 34, SLOW = 8, SLOT = 212;
    // strip slots: the first 8 are frames 0..7, the rest are spread across the film
    const frameOf = j => (j < SLOW ? j : Math.round(SLOW - 1 + (j - SLOW + 1) / (M - SLOW) * (N - SLOW)));
    const s = D.scene('xpframes', `<div class="xp-frames">
      ${head(o.kicker || '', o.title || '')}
      <div class="xp-code mono">tl.time( <b>0</b> / ${fps} )</div>
      <div class="xp-count mono"><span class="xp-cl">${o.countLabel || 'CUADRO'}</span><b>0001</b><em>/ ${f0.format(N)}</em></div>
      <div class="xp-vf"><div class="xp-vf-in">${mini(0, 'xp-live')}</div><i class="xp-shut"></i>
        <div class="xp-vf-tl mono"><i class="xp-rec"></i>${o.vfLabel || ''}</div><div class="xp-vf-br mono">${tc(0, fps)}</div>
        <i class="xp-cr tl"></i><i class="xp-cr tr"></i><i class="xp-cr bl"></i><i class="xp-cr br"></i></div>
      <div class="xp-ruler"><i class="xp-rline"></i>${Array.from({ length: Math.floor(film) + 1 }, (_, k) => `<i class="xp-tk${k % 10 === 0 ? ' is-big' : ''}" style="left:${(k / film) * 100}%"></i>${k % 10 === 0 ? `<span class="mono" style="left:${(k / film) * 100}%">${k} s</span>` : ''}`).join('')}<span class="mono is-end" style="left:100%">${nf(D, 1).format(film)} s</span><i class="xp-ph"></i></div>
      <div class="xp-stripwin"><div class="xp-strip">${Array.from({ length: M }, (_, j) => `<div class="xp-th" style="left:${j * SLOT}px">${mini(frameOf(j) / fps)}<span class="mono">${f0.format(frameOf(j) + 1)}</span></div>`).join('')}</div><i class="xp-bracket"></i></div>
      <div class="xp-stats">${o.stats || ''}</div>
    </div>`);
    const live = D.$('.xp-live', s), code = D.$('.xp-code b', s), cnt = D.$('.xp-count b', s), vtc = D.$('.xp-vf-br', s), shut = D.$('.xp-shut', s), vf = D.$('.xp-vf', s);
    const ph = D.$('.xp-ph', s), strip = D.$('.xp-strip', s), ths = D.$$('.xp-th', s), stats = D.$('.xp-stats', s), ruler = D.$('.xp-ruler', s);
    const X0 = 1580; // the capture bracket's x: strip slot j sits there when it is the current frame
    const set = i => {
      const k = Math.round(i);
      code.textContent = k; cnt.textContent = pad(k + 1, 4); vtc.textContent = tc(k, fps);
      drawMini(live, k / fps);
      gsap.set(ph, { left: `${(k / fps / film) * 100}%` });
      const slot = k < SLOW ? k : SLOW - 1 + (k - SLOW + 1) / (N - SLOW) * (M - SLOW);
      gsap.set(strip, { x: X0 - slot * SLOT });
    };
    D.show(s, T);
    D.setBg('#111113', T);
    D.ink(PAPER, T);
    if (o.label) D.label(T, o.label);
    enter(D, D.$$('.xp-head > *, .xp-code, .xp-count', s), T + 0.1);
    gsap.set([vf, ruler], { opacity: 0 });
    D.hit(vf, { opacity: 0, scale: 0.94 }, { opacity: 1, scale: 1, duration: 0.7, ease: 'expo.out' }, T + 0.2);
    D.hit(ruler, { opacity: 0, scaleX: 0.3 }, { opacity: 1, scaleX: 1, duration: 0.8, ease: 'expo.out' }, T + 0.3);
    gsap.set(ths.slice(0, SLOW), { opacity: 0 });
    gsap.set(stats, { opacity: 0 });
    // the playhead state is driven by one proxy (so any seek rebuilds it exactly)
    const P = { i: 0 };
    set(0);
    tl.to(P, { i: 0, duration: 0.01, onUpdate: () => set(P.i) }, T);
    for (let k = 1; k < SLOW; k++) {
      const at = T + 0.9 + (k - 1) * 0.36;
      tl.to(P, { i: k, duration: 0.01, ease: 'none', onUpdate: () => set(P.i) }, at);
      D.hit(shut, { opacity: 0.85 }, { opacity: 0, duration: 0.16, ease: 'power2.out' }, at);
      D.hit(ths[k], { opacity: 1, filter: 'brightness(3)' }, { filter: 'brightness(1)', duration: 0.3 }, at);
      D.sfx('key', at, 0.3);
      D.sfx('tick', at + 0.02, 0.05);
    }
    D.hit(ths[0], { opacity: 1, filter: 'brightness(3)' }, { filter: 'brightness(1)', duration: 0.3 }, T + 0.55);
    D.hit(shut, { opacity: 0.85 }, { opacity: 0, duration: 0.16, ease: 'power2.out' }, T + 0.55);
    D.sfx('key', T + 0.55, 0.3);
    // then the race: every frame, to the last one
    const ta = T + 3.6, tb = T + 6.3;
    tl.to(P, { i: N - 1, duration: tb - ta, ease: 'power3.inOut', onUpdate: () => set(P.i) }, ta);
    D.sfx('riser', ta, tb - ta - 0.2, 0.3);
    for (let k = 0; k < 10; k++) D.sfx('tick', ta + 0.5 + k * 0.18, 0.04);
    D.hit(shut, { opacity: 0.6 }, { opacity: 0, duration: 0.5, ease: 'power2.out' }, tb);
    D.sfx('boom', tb, 0.6);
    D.hit(stats, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, ease: 'expo.out' }, tb + 0.15);
    D.hide(s, T + dur);
    return dur;
  });

  // ------------------------------------------------------------------ XPHASH
  // One frame reached three ways; the SHA-256 of each capture, typed; the verdict.
  recipe('xphash', (D, T, o) => {
    const { tl } = D;
    const dur = o.duration || 6, test = o.test, film = o.filmDuration, paths = test.paths;
    const X = t => (t / film) * 100;
    const s = D.scene('xphash', `<div class="xp-hash">
      ${head(o.kicker || '', o.title || '')}
      ${paths.map((p, i) => `<div class="xp-row" style="top:${300 + i * 210}px">
        <div class="xp-rl mono">${p.label}</div>
        <div class="xp-mr"><i class="xp-mr-l"></i><i class="xp-dot is-from" style="left:${X(p.from)}%"></i><i class="xp-dot is-to" style="left:${X(test.t)}%"></i>
          <svg viewBox="0 0 600 90" preserveAspectRatio="none"><path d="M${(X(p.from) * 6).toFixed(1)} 70 Q ${((X(p.from) + X(test.t)) * 3).toFixed(1)} ${p.from === test.t ? 70 : -40} ${(X(test.t) * 6).toFixed(1)} 70"/></svg></div>
        <div class="xp-sha mono"><span>SHA-256</span><b>${p.sha256.slice(0, 32)}</b><b>${p.sha256.slice(32)}</b></div>
      </div>`).join('')}
      <div class="xp-frame">${o.frameHTML || ''}<span class="mono">${o.frameLabel || ''}</span></div>
      <div class="xp-stamp mono">${o.stamp || ''}</div>
      <div class="xp-note">${o.note || ''}</div>
    </div>`);
    const rows = D.$$('.xp-row', s), arcs = D.$$('.xp-mr path', s), shas = D.$$('.xp-sha', s), frame = D.$('.xp-frame', s), stamp = D.$('.xp-stamp', s), note = D.$('.xp-note', s);
    D.show(s, T);
    D.setBg('#111113', T);
    D.ink(PAPER, T);
    if (o.label) D.label(T, o.label);
    enter(D, D.$$('.xp-head > *', s), T + 0.1);
    enter(D, rows.map(r => D.$('.xp-rl', r)), T + 0.3, 0.12);
    gsap.set(arcs, { drawSVG: '0%' });
    gsap.set(frame, { opacity: 0 });
    gsap.set([stamp, note], { opacity: 0 });
    D.hit(frame, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.7, ease: 'expo.out' }, T + 0.4);
    rows.forEach((r, i) => {
      const at = T + 0.6 + i * 0.3;
      D.hit(D.$('.xp-mr', r), { opacity: 0 }, { opacity: 1, duration: 0.3 }, at);
      tl.to(arcs[i], { drawSVG: '100%', duration: 0.6, ease: 'power2.inOut' }, at + 0.15);
      D.sfx('whoosh', at + 0.15, 0.5, 0.15);
      // the hash types itself in (deterministic: a function of the tween's progress)
      const bs = D.$$('b', shas[i]), full = paths[i].sha256, P = { n: 0 };
      bs.forEach(b => { b.textContent = ''; });
      gsap.set(shas[i], { opacity: 0 });
      D.hit(shas[i], { opacity: 0 }, { opacity: 1, duration: 0.2 }, at + 0.7);
      tl.to(P, { n: 64, duration: 0.9, ease: 'none', onUpdate: () => { const k = Math.round(P.n); bs[0].textContent = full.slice(0, Math.min(32, k)); bs[1].textContent = full.slice(32, Math.max(32, k)); } }, at + 0.7);
      for (let k = 0; k < 5; k++) D.sfx('tick', at + 0.75 + k * 0.17, 0.035);
    });
    // the verdict
    const tv = T + 3.4;
    shas.forEach((e, i) => { D.hit(e, { color: PAPER }, { color: o.same ? '#4ade80' : RED, duration: 0.3 }, tv + i * 0.08); });
    D.hit(stamp, { opacity: 0, scale: 1.6, rotation: -14 }, { opacity: 1, scale: 1, rotation: -8, duration: 0.45, ease: 'back.out(2)' }, tv + 0.3);
    D.sfx('boom', tv + 0.3, 0.7);
    D.sfx('bell', tv + 0.3, D.N.E5, 0.07);
    D.hit(note, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: 'expo.out' }, tv + 0.9);
    D.hide(s, T + dur);
    return dur;
  });

  // ------------------------------------------------------------------ XPWAVE
  // The real soundtrack of an export: the waveform (peaks) and every timeline event, revealed by a
  // render cursor that runs faster than the film.
  recipe('xpwave', (D, T, o) => {
    const { tl } = D;
    const dur = o.duration || 6, peaks = o.peaks || [], evs = o.events || [], film = o.filmDuration, W = 1680, Hh = 190;
    const n = Math.max(1, Math.floor(peaks.length / 2)), bw = W / n;
    const bars = Array.from({ length: n }, (_, i) => Math.max(peaks[2 * i] || 0, peaks[2 * i + 1] || 0));
    const s = D.scene('xpwave', `<div class="xp-wave">
      ${head(o.kicker || '', o.title || '')}
      <div class="xp-facts">${(o.facts || []).map(([v, l]) => `<div><b>${v}</b><span class="mono">${l}</span></div>`).join('')}</div>
      <div class="xp-wv"><svg viewBox="0 0 ${W} 520" preserveAspectRatio="none">
        <g class="xp-ev">${evs.map(t => `<rect x="${((t / film) * W).toFixed(1)}" y="0" width="2" height="26"/>`).join('')}</g>
        <g class="xp-bars">${bars.map((p, i) => { const h = Math.max(2, p * Hh * 1.1); return `<rect x="${(i * bw + 0.8).toFixed(1)}" y="${(270 - h).toFixed(1)}" width="${Math.max(1, bw - 1.6).toFixed(1)}" height="${(2 * h).toFixed(1)}" rx="1.5"/>`; }).join('')}</g>
      </svg><i class="xp-cur"><span class="mono">0,0 s</span></i></div>
      <div class="xp-axis mono">${[0, 10, 20, 30, 40, 50].filter(k => k < film - 4).map(k => `<span style="left:${(k / film) * 100}%">${k} s</span>`).join('')}<span style="left:100%">${nf(D, 1).format(film)} s</span></div>
      <div class="xp-file mono">${o.file || ''}</div>
    </div>`);
    const svg = D.$('.xp-wv svg', s), cur = D.$('.xp-cur', s), curT = D.$('.xp-cur span', s), f1 = nf(D, 1);
    D.show(s, T);
    D.setBg('#111113', T);
    D.ink(PAPER, T);
    if (o.label) D.label(T, o.label);
    enter(D, D.$$('.xp-head > *', s), T + 0.1);
    enter(D, D.$$('.xp-facts > div', s), T + 0.3, 0.1);
    enter(D, [D.$('.xp-axis', s)], T + 0.4);
    gsap.set(svg, { clipPath: 'inset(0% 100% 0% 0%)' });
    gsap.set(cur, { opacity: 0, left: '0%' });
    const ta = T + 0.8, tb = T + 4.2, P = { p: 0 };
    D.hit(cur, { opacity: 0 }, { opacity: 1, duration: 0.2 }, ta);
    tl.to(P, { p: 1, duration: tb - ta, ease: 'none', onUpdate: () => {
      svg.style.clipPath = `inset(0% ${(100 - P.p * 100).toFixed(3)}% 0% 0%)`;
      cur.style.left = `${(P.p * 100).toFixed(3)}%`;
      curT.textContent = `${f1.format(P.p * film)} s`;
    } }, ta);
    D.hit(cur, { opacity: 1 }, { opacity: 0, duration: 0.3 }, tb + 0.1);
    D.sfx('swell', ta, tb - ta, 0.12);
    enter(D, [D.$('.xp-file', s)], tb + 0.2);
    D.sfx('bell', tb + 0.2, D.N.G5, 0.06);
    D.hide(s, T + dur);
    return dur;
  });

  // ------------------------------------------------------------------ XPFORMATS
  // The files that came out, drawn at the same scale (a GIF is really that small), sizes counting up.
  recipe('xpformats', (D, T, o) => {
    const { tl } = D;
    const dur = o.duration || 6, files = o.files || [], k = o.scale || 0.3125, gap = 120;
    const total = files.reduce((a, f) => a + f.width * k, 0) + gap * (files.length - 1);
    let x = (1920 - total) / 2;
    const cards = files.map(f => { const w = f.width * k, h = f.height * k, c = { ...f, x, w, h }; x += w + gap; return c; });
    const s = D.scene('xpformats', `<div class="xp-formats">
      ${head(o.kicker || '', o.title || '')}<div class="xp-sub mono">${o.sub || ''}</div>
      ${cards.map(c => `<div class="xp-file-card" style="left:${c.x.toFixed(0)}px;top:${(820 - c.h).toFixed(0)}px;width:${c.w.toFixed(0)}px;height:${c.h.toFixed(0)}px;background:${c.poster.palette[0]};--p0:${c.poster.palette[0]}">
          <svg viewBox="0 0 160 90" preserveAspectRatio="${c.h > c.w ? 'xMidYMid meet' : 'xMidYMid slice'}">${c.poster.svg}</svg><span class="xp-badge mono">${c.badge}</span></div>
        <div class="xp-meta" style="left:${c.x.toFixed(0)}px;top:850px;width:${Math.max(260, c.w).toFixed(0)}px">
          <div class="xp-mt">${c.poster.title}</div><div class="mono">${c.width}×${c.height} · ${c.fps} FPS</div>
          <div class="xp-mb"><b>0</b> MB</div><div class="mono xp-codec">${c.codec}</div></div>`).join('')}
    </div>`);
    const fc = D.$$('.xp-file-card', s), metas = D.$$('.xp-meta', s), sizes = D.$$('.xp-mb b', s), f1 = nf(D, 1);
    D.show(s, T);
    D.setBg('#111113', T);
    D.ink(PAPER, T);
    if (o.label) D.label(T, o.label);
    enter(D, D.$$('.xp-head > *, .xp-sub', s), T + 0.1);
    gsap.set(fc, { opacity: 0 });
    fc.forEach((e, i) => {
      const at = T + 0.6 + i * 0.35;
      D.hit(e, { opacity: 0, y: 120, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: 'back.out(1.4)' }, at);
      enter(D, [metas[i]], at + 0.2);
      const P = { v: 0 }, mb = cards[i].bytes / 1048576;
      tl.to(P, { v: mb, duration: 1.1, ease: 'expo.out', onUpdate: () => { sizes[i].textContent = f1.format(P.v); } }, at + 0.25);
      D.sfx('kick', at, 0.5);
      D.sfx('plip', at + 0.25, 0.08, 600 + i * 150);
    });
    D.hide(s, T + dur);
    return dur;
  });

  // ------------------------------------------------------------------ XPTITLE
  // The title on a running film strip; the command underneath; bars close.
  recipe('xptitle', (D, T, o) => {
    const { tl } = D;
    const dur = o.duration || 6;
    const s = D.scene('xptitle', `<div class="xp-title">
      <div class="xp-film"><i class="xp-perf is-top"></i><i class="xp-perf is-bot"></i></div>
      <div class="xp-tt v">${[...(o.title || 'EXPORT')].map(ch => `<span>${ch}</span>`).join('')}</div>
      <div class="xp-tag mono">${o.tagline || ''}</div>
      <div class="xp-cta mono">${o.cta || ''}</div>
    </div>`);
    const perf = D.$$('.xp-perf', s), chars = D.$$('.xp-tt span', s), tag = D.$('.xp-tag', s), cta = D.$('.xp-cta', s), filmEl = D.$('.xp-film', s);
    D.fit(D.$('.xp-tt', s), 1500);
    D.show(s, T);
    D.setBg('#09090b', T);
    D.ink(PAPER, T);
    if (o.label) D.label(T, o.label);
    gsap.set(filmEl, { scaleY: 0 });
    D.hit(filmEl, { scaleY: 0 }, { scaleY: 1, duration: 0.6, ease: 'expo.out' }, T + 0.05);
    gsap.set(perf, { backgroundPositionX: '0px' });
    tl.to(perf, { backgroundPositionX: '-1400px', duration: dur, ease: 'none' }, T);
    gsap.set(chars, { opacity: 0 });
    chars.forEach((c, i) => {
      const at = T + 0.45 + i * 0.1;
      D.hit(c, { opacity: 1, yPercent: -40, scale: 1.4 }, { yPercent: 0, scale: 1, duration: 0.5, ease: 'expo.out' }, at);
      D.sfx('key', at, 0.35);
    });
    D.sfx('boom', T + 0.45 + chars.length * 0.1, 0.8);
    D.call(() => SFX.pad('xp-title', [110, 164.81, 220, 277.18], 1.2, 0.05, 1100), T + 0.45 + chars.length * 0.1);
    enter(D, [tag], T + 1.3);
    enter(D, [cta], T + 1.8);
    D.barsTo(540, T + dur - 0.9, 0.8);
    D.call(() => SFX.padStop('xp-title', 1.4), T + dur - 0.9);
    D.hide(s, T + dur);
    return dur;
  });

  Trailer.xp = { tc, pose, mini };
})();
