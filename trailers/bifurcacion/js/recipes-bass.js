/* ============================================================================
   BASS MODULE — opening-title sequences in the spirit of Saul Bass (an homage, not
   copies): flat colour fields, paper cut-outs with scissor-rough edges (clip-path
   polygons with deterministic jitter), hand-cut type (every letter slightly off:
   rotation, baseline), sliding bars, a spiral, a perspective grid, paper grain.
   Credits follow film convention: "presenta", "una película", the title, the cast
   ("NAME como ROLE"), the crew (role small, name big) and "dirigida por".
   Theme: cfg.bass = { orange, black, cream, red }.
   Recipes: sbopen, sbcutout, sbspiral, sbcast, sbgrid, sbend.
   ========================================================================== */
(() => {
  'use strict';
  const { recipe } = Trailer;
  const TH = D => ({ orange: '#f26b1d', black: '#141414', cream: '#efe6d2', red: '#d7263d', ...(D.cfg.bass || {}) });
  // paper grain: an inline SVG turbulence (code, not an image file)
  const GRAIN = `url("data:image/svg+xml;utf8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="3" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .55 0"/></filter><rect width="300" height="300" filter="url(#n)"/></svg>')}")`;

  /** A scissor-cut rectangle: a clip-path polygon (in %) with jagged edges. */
  function rough(D, jag = 1.4, step = 3.5) {
    const R = D.rand, p = [];
    for (let x = 0; x <= 100; x += step) p.push([x, R() * jag]);
    for (let y = step; y <= 100; y += step) p.push([100 - R() * jag, y]);
    for (let x = 100 - step; x >= 0; x -= step) p.push([x, 100 - R() * jag]);
    for (let y = 100 - step; y > 0; y -= step) p.push([R() * jag, y]);
    return `polygon(${p.map(([x, y]) => `${x.toFixed(2)}% ${y.toFixed(2)}%`).join(',')})`;
  }
  /** Hand-cut type: every letter a little rotated and off the baseline. */
  function cut(D, text, amt = 1) {
    return [...String(text)].map(ch => (ch === ' ' ? '<span class="sb-sp"> </span>'
      : `<span class="sb-ch" style="top:${((D.rand() - 0.5) * 8 * amt).toFixed(1)}px" data-r="${((D.rand() - 0.5) * 6 * amt).toFixed(2)}">${ch}</span>`)).join(''); // baseline jitter on top: GSAP owns transforms
  }
  function scene(D, name, html, bg) {
    const th = TH(D);
    const s0 = D.scene(name, `<div class="sb-root" style="background:${bg};--sb-o:${th.orange};--sb-b:${th.black};--sb-c:${th.cream};--sb-r:${th.red}">${html}<i class="sb-grain" style="background-image:${GRAIN}"></i></div>`);
    D.$$('.sb-ch', s0).forEach(c => gsap.set(c, { rotation: +c.dataset.r })); // GSAP owns the tilt from the start
    return s0;
  }
  function inChars(D, el, at, o = {}) {
    const ch = D.$$('.sb-ch', el);
    D.hit(ch, { opacity: 0, y: o.y ?? 40, scale: o.scale ?? 1.4 }, { opacity: 1, y: 0, scale: 1, duration: o.dur ?? 0.45, ease: o.ease || 'back.out(2.2)', stagger: o.stagger ?? 0.035 }, at);
    return ch;
  }

  // ------------------------------------------------------------------ SBOPEN
  // Orange field; a torn black shape sweeps in carrying the company name; "presenta".   5 s
  recipe('sbopen', (D, T, o) => {
    const { tl } = D;
    const th = TH(D), dur = o.duration || 5;
    const scraps = Array.from({ length: 7 }, (_, i) => `<i class="sb-scrap" style="left:${120 + i * 250}px;top:${i % 2 ? 150 : 820}px;width:${90 + (i % 3) * 50}px;height:${40 + (i % 4) * 22}px;background:${[th.cream, th.black, th.red][i % 3]};clip-path:${rough(D, 6, 12)}"></i>`).join('');
    const s = scene(D, 'sbopen', `${scraps}<div class="sb-tear" style="background:${th.black};clip-path:${rough(D, 2.2, 2.5)}"></div>
      <div class="sb-co c">${cut(D, o.company || 'KINETIC STUDIO')}</div><div class="sb-pres c">${cut(D, o.presents || 'presenta', 0.6)}</div>`, th.orange);
    const tear = D.$('.sb-tear', s), co = D.$('.sb-co', s), pres = D.$('.sb-pres', s), sc = D.$$('.sb-scrap', s);
    D.fit(co, 1300);
    gsap.set(tear, { xPercent: -110, rotation: -3 });
    gsap.set(D.$$('.sb-ch', s), { opacity: 0 });
    D.show(s, T);
    D.setBg(th.orange, T);
    D.ink(th.black, T);
    if (o.label) D.label(T + 0.2, o.label);
    sc.forEach((e, i) => D.hit(e, { x: (i % 2 ? 1 : -1) * 1400, rotation: (i % 2 ? 120 : -120) }, { x: 0, rotation: (i - 3) * 8, duration: 0.9, ease: 'expo.out' }, T + 0.1 + i * 0.06));
    tl.to(tear, { xPercent: 0, rotation: 0, duration: 0.8, ease: 'expo.inOut' }, T + 0.5);
    D.sfx('whoosh', T + 0.5, 0.7, 0.3);
    inChars(D, co, T + 1.1);
    inChars(D, pres, T + 1.9, { y: 20, scale: 1.2, stagger: 0.05 });
    D.sfx('clap', T + 1.1, 0.3);
    D.sfx('bell', T + 1.9, D.N.E5, 0.05);
    tl.to(tear, { xPercent: 110, rotation: 3, duration: 0.7, ease: 'expo.in' }, T + dur - 0.8);
    tl.to([co, pres], { x: 1400, duration: 0.7, ease: 'expo.in' }, T + dur - 0.8);
    tl.to(sc, { opacity: 0, duration: 0.3 }, T + dur - 0.4);
    D.hide(s, T + dur);
    return dur;
  });

  // ------------------------------------------------------------------ SBCUTOUT
  // A figure assembled from paper pieces that fly in, spin and settle (a movie camera by
  // default), with a two-line credit beside it.                               5 s
  const CAMERA = [ // [left, top, w, h, colour key, shape] in px, a 560 × 420 box
    [120, 150, 300, 170, 'black', 'rect'], [80, 20, 150, 150, 'orange', 'circle'], [250, 20, 150, 150, 'red', 'circle'],
    [410, 190, 130, 100, 'black', 'tri'], [150, 320, 30, 100, 'black', 'rect'], [340, 320, 30, 100, 'black', 'rect'], [110, 400, 290, 20, 'black', 'rect'],
  ];
  recipe('sbcutout', (D, T, o) => {
    const { tl } = D;
    const th = TH(D), dur = o.duration || 5, pieces = o.pieces || CAMERA;
    const shape = sh => (sh === 'circle' ? 'circle(48% at 50% 50%)' : sh === 'tri' ? 'polygon(0% 50%, 100% 0%, 100% 100%)' : rough(D, 2.5, 6));
    const s = scene(D, 'sbcutout', `<div class="sb-fig">${pieces.map(([x, y, w, h, c, sh]) => `<i class="sb-pc" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px;background:${th[c] || c};clip-path:${shape(sh)}"></i>`).join('')}</div>
      <div class="sb-cl"><div class="sb-l1">${cut(D, o.line1 || '', 0.7)}</div><div class="sb-l2">${cut(D, o.line2 || '')}</div></div>`, th.cream);
    const pcs = D.$$('.sb-pc', s), l1 = D.$('.sb-l1', s), l2 = D.$('.sb-l2', s);
    D.fit(l2, 800);
    gsap.set(D.$$('.sb-ch', s), { opacity: 0 });
    D.show(s, T);
    D.setBg(th.cream, T);
    D.ink(th.black, T);
    if (o.label) D.label(T + 0.2, o.label);
    pcs.forEach((p, i) => {
      const a = (i / pcs.length) * Math.PI * 2 + 0.6;
      D.hit(p, { x: Math.cos(a) * 1300, y: Math.sin(a) * 900, rotation: (i % 2 ? 1 : -1) * (180 + i * 40), scale: 1.3 }, { x: 0, y: 0, rotation: 0, scale: 1, duration: 0.9, ease: 'expo.out' }, T + 0.15 + i * 0.12);
      D.sfx('fold', T + 0.4 + i * 0.12, 0.12);
    });
    inChars(D, l1, T + 1.4, { y: 20, scale: 1.1 });
    inChars(D, l2, T + 1.9);
    D.sfx('clap', T + 1.9, 0.3);
    tl.to(pcs, { y: -1200, rotation: 60, duration: 0.6, ease: 'expo.in', stagger: 0.03 }, T + dur - 0.8);
    tl.to([l1, l2], { opacity: 0, duration: 0.3 }, T + dur - 0.5);
    D.hide(s, T + dur);
    return dur;
  });

  // ------------------------------------------------------------------ SBSPIRAL
  // A spiral draws itself and turns; the main title comes out of its centre.   7 s
  recipe('sbspiral', (D, T, o) => {
    const { tl } = D;
    const th = TH(D), dur = o.duration || 7;
    let d = '';
    for (let i = 0; i <= 720; i++) { const a = (i / 720) * Math.PI * 2 * 7, r = 8 + (i / 720) * 520; d += `${i ? 'L' : 'M'}${(Math.cos(a) * r).toFixed(1)},${(Math.sin(a) * r).toFixed(1)}`; }
    const s = scene(D, 'sbspiral', `<svg class="sb-spiral" viewBox="-560 -560 1120 1120"><path d="${d}" stroke="${th.cream}"/><circle r="40" fill="${th.red}"/></svg>
      <div class="sb-title c">${cut(D, o.title || D.cfg.meta.title, 1.2)}</div><div class="sb-tsub c">${cut(D, o.subtitle || '', 0.5)}</div>`, th.black);
    const sp = D.$('.sb-spiral', s), path = D.$('.sb-spiral path', s), dot = D.$('.sb-spiral circle', s), title = D.$('.sb-title', s), sub = D.$('.sb-tsub', s);
    D.fit(title, 1500);
    gsap.set(path, { drawSVG: '0%' });
    gsap.set(dot, { scale: 0, transformOrigin: '50% 50%' });
    gsap.set(D.$$('.sb-ch', s), { opacity: 0 });
    D.show(s, T);
    D.setBg(th.black, T);
    D.ink(th.cream, T);
    if (o.label) D.label(T + 0.2, o.label);
    tl.to(path, { drawSVG: '100%', duration: 2.2, ease: 'power2.inOut' }, T + 0.1);
    D.hit(sp, { rotation: 0 }, { rotation: 300, duration: dur, ease: 'none' }, T);
    tl.to(dot, { scale: 1, duration: 0.5, ease: 'back.out(3)' }, T + 0.4);
    D.sfx('riser', T + 0.1, 2.4, 0.25);
    // the title out of the centre
    const tt = T + 2.5;
    tl.to(sp, { scale: 2.4, opacity: 0.25, duration: 1.2, ease: 'expo.in' }, tt - 0.3);
    tl.to(dot, { scale: 0, duration: 0.4, ease: 'back.in(2)' }, tt - 0.3); // the title takes the centre
    D.hit(title, { scale: 0.05, rotation: -200 }, { scale: 1, rotation: 0, duration: 1, ease: 'expo.out' }, tt);
    inChars(D, title, tt + 0.1, { y: 0, scale: 1, dur: 0.2, stagger: 0.03, ease: 'none' });
    D.sfx('braam', tt + 0.2, 0.7);
    D.sfx('boom', tt + 0.2, 0.8);
    D.flash(tt + 0.2, 0.25, 0.5, th.cream);
    D.call(() => SFX.pad('title', [110, 138.59, 164.81, 220], 1.2, 0.05, 900), tt + 0.2);
    inChars(D, sub, tt + 1.2, { y: 16, scale: 1, stagger: 0.03 });
    tl.to([title, sub], { opacity: 0, scale: 0.9, duration: 0.5, ease: 'power2.in' }, T + dur - 0.6);
    D.hide(s, T + dur);
    return dur;
  });

  // ------------------------------------------------------------------ SBCAST
  // Cast cards: bars sweep across and leave the names behind — "NAME como ROLE", two a card.
  recipe('sbcast', (D, T, o) => {
    const { tl } = D;
    const th = TH(D), cards = o.cards || [], step = o.step || 3.5, dur = cards.length * step;
    const bg = [th.black, th.orange, th.cream];
    const s = scene(D, 'sbcast', cards.map((pair, ci) => `<div class="sb-card" style="background:${bg[ci % 3]};color:${D.contrast(bg[ci % 3])}">
        ${Array.from({ length: 7 }, (_, i) => `<i class="sb-bar" style="top:${i * 160 - 20}px;background:${[th.cream, th.orange, th.red, th.black][(i + ci) % 4]}"></i>`).join('')}
        ${pair.map(([name, role], k) => `<div class="sb-cast ${k ? 'is-b' : 'is-a'}"><div class="sb-cn">${cut(D, name)}</div><div class="sb-cr"><em>${o.as || 'como'}</em> ${cut(D, role, 0.5)}</div></div>`).join('')}
      </div>`).join(''), th.black);
    const cardEls = D.$$('.sb-card', s);
    cardEls.forEach(c => D.$$('.sb-cn', c).forEach(n => D.fit(n, 820)));
    gsap.set(cardEls, { autoAlpha: 0 });
    D.show(s, T);
    if (o.label) D.label(T, o.label);
    cardEls.forEach((c, ci) => {
      const at = T + ci * step, bars = D.$$('.sb-bar', c), casts = D.$$('.sb-cast', c);
      tl.set(c, { autoAlpha: 1 }, at);
      if (ci) tl.set(cardEls[ci - 1], { autoAlpha: 0 }, at);
      D.setBg(bg[ci % 3], at);
      // bars sweep through (alternating sides) and leave the names
      bars.forEach((b, i) => D.hit(b, { xPercent: i % 2 ? 110 : -110 }, { xPercent: i % 2 ? -110 : 110, duration: 0.9, ease: 'power3.inOut' }, at + i * 0.04));
      casts.forEach((el, k) => {
        inChars(D, D.$('.sb-cn', el), at + 0.45 + k * 0.5, { y: 30, scale: 1.3, stagger: 0.03 });
        inChars(D, D.$('.sb-cr', el), at + 0.75 + k * 0.5, { y: 12, scale: 1, stagger: 0.02 });
        D.hit(D.$('.sb-cr em', el), { opacity: 0 }, { opacity: 1, duration: 0.3 }, at + 0.75 + k * 0.5);
      });
      D.sfx('whoosh', at, 0.8, 0.2);
      D.sfx('clap', at + 0.45, 0.25);
      D.sfx('clap', at + 0.95, 0.2);
      tl.to(casts, { opacity: 0, x: -40, duration: 0.35, ease: 'power2.in', stagger: 0.05 }, at + step - 0.45);
    });
    D.hide(s, T + dur);
    return dur;
  });

  // ------------------------------------------------------------------ SBGRID
  // A perspective grid draws itself; crew credits (role small, name big) slide along it.
  recipe('sbgrid', (D, T, o) => {
    const { tl } = D;
    const th = TH(D), credits = o.credits || [], step = o.step || 1.6, dur = 1 + credits.length * step + 0.6;
    const vx = 960, vy = -600;
    let lines = '';
    for (let i = -8; i <= 8; i++) lines += `<line x1="${vx}" y1="${vy}" x2="${960 + i * 260}" y2="1200"/>`;
    for (let k = 0; k < 9; k++) { const y = 200 + k * k * 12; lines += `<line x1="-100" y1="${y}" x2="2020" y2="${y}"/>`; }
    const s = scene(D, 'sbgrid', `<svg class="sb-grid" viewBox="0 0 1920 1080" stroke="${th.black}">${lines}</svg>
      ${credits.map(([role, name]) => `<div class="sb-crew c"><div class="sb-role">${role}</div><div class="sb-name">${cut(D, name)}</div></div>`).join('')}`, th.orange);
    const ls = D.$$('.sb-grid line', s), crews = D.$$('.sb-crew', s);
    crews.forEach(c => D.fit(D.$('.sb-name', c), 1500));
    gsap.set(ls, { drawSVG: '0%' });
    gsap.set(crews, { autoAlpha: 0 });
    D.show(s, T);
    D.setBg(th.orange, T);
    D.ink(th.black, T);
    if (o.label) D.label(T, o.label);
    tl.to(ls, { drawSVG: '100%', duration: 0.8, ease: 'power2.inOut', stagger: 0.02 }, T + 0.05);
    D.sfx('whoosh', T, 0.8, 0.2);
    crews.forEach((c, i) => {
      const at = T + 1 + i * step, dir = i % 2 ? 1 : -1;
      D.hit(c, { autoAlpha: 1, x: dir * 900, skewX: dir * -20 }, { x: 0, skewX: 0, duration: 0.55, ease: 'expo.out' }, at);
      tl.to(c, { x: -dir * 900, skewX: dir * 20, autoAlpha: 0, duration: 0.4, ease: 'expo.in' }, at + step - 0.4);
      D.sfx('kick', at, 0.5);
      D.sfx('tick', at + 0.2, 0.05);
    });
    tl.to(ls, { drawSVG: '100% 100%', duration: 0.5, ease: 'power2.in', stagger: 0.01 }, T + dur - 0.6);
    D.hide(s, T + dur);
    return dur;
  });

  // ------------------------------------------------------------------ SBEND
  // "dirigida por" + the name; a red paper dot drops like a full stop; a torn black sheet
  // covers everything.                                                          5 s
  recipe('sbend', (D, T, o) => {
    const { tl } = D;
    const th = TH(D), dur = o.duration || 5;
    const s = scene(D, 'sbend', `<div class="sb-by c">${cut(D, o.by || 'dirigida por', 0.6)}</div><div class="sb-dir c">${cut(D, o.name || '')}</div>
      <i class="sb-dot" style="background:${th.red}"></i><div class="sb-cover" style="background:${th.black};clip-path:${rough(D, 2.2, 2.5)}"></div>`, th.cream);
    const by = D.$('.sb-by', s), dir = D.$('.sb-dir', s), dot = D.$('.sb-dot', s), cover = D.$('.sb-cover', s);
    D.fit(dir, 1500);
    const db = D.box(dir);
    gsap.set(dot, { left: db.x + db.w + 14, top: db.y + db.h - 70, y: -900 });
    gsap.set(D.$$('.sb-ch', s), { opacity: 0 });
    gsap.set(cover, { yPercent: 110 });
    D.show(s, T);
    D.setBg(th.cream, T);
    D.ink(th.black, T);
    if (o.label) D.label(T + 0.2, o.label);
    inChars(D, by, T + 0.2, { y: 16, scale: 1.1, stagger: 0.04 });
    inChars(D, dir, T + 0.8);
    tl.to(dot, { y: 0, duration: 0.7, ease: 'bounce.out' }, T + 1.8);
    D.sfx('plip', T + 2.1, 0.08, 500);
    D.sfx('bell', T + 1.8, D.N.A5, 0.06);
    tl.to(cover, { yPercent: 0, duration: 0.9, ease: 'expo.inOut' }, T + dur - 1.2);
    D.sfx('whoosh', T + dur - 1.2, 0.9, 0.3);
    D.call(() => SFX.padStop('title', 1.5), T + dur - 1.2);
    D.sfx('boom', T + dur - 0.3, 0.6);
    D.hide(s, T + dur);
    return dur;
  });

  Trailer.bass = { rough, cut, TH };
})();
