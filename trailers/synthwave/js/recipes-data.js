/* ============================================================================
   DATA MODULE — animated, honest charts for data stories.
   Built on the dataviz rules: one job per chart, a single series (the title names
   it, no legend), thin marks with 4px rounded data-ends, hairline solid grids,
   selective direct labels, text in ink tokens (never the series colour), emphasis
   = one highlighted mark + grey for the rest. Palette validated with the dataviz
   validator on the default surface (#f3efe6): accent #2356d1 + hot #e0570f pass all
   checks; waffle track #8ea6e2 passes the ordinal check.
   Recipes: datahero, dataline, databars, datawaffle, datatitle.
   Always pass REAL data and a `source` — never invented numbers.
   ========================================================================== */
(() => {
  'use strict';
  const { recipe } = Trailer;
  const TH = { surface: '#f3efe6', ink: '#16181d', ink2: '#4a4d55', muted: '#7a7870', grid: '#dcd6ca', accent: '#2356d1', hot: '#e0570f', gray: '#9a968d', track: '#8ea6e2' };
  const theme = (D, o) => ({ ...TH, ...(D.cfg.dataTheme || {}), ...(o.theme || {}) });
  const nf = (D, d = 0) => new Intl.NumberFormat(D.cfg.locale || 'en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
  const clamp01 = x => (x < 0 ? 0 : x > 1 ? 1 : x);
  const X0 = 210, X1 = 1700, YB = 830, YT = 330; // plot box (stage px)

  // editorial chart frame: kicker, title (sentence case), subtitle, source
  function frame(D, name, o, th, inner) {
    const s = D.scene(name, `
      <div class="dv-head" style="color:${th.ink}">
        ${o.kicker ? `<div class="dv-kicker mono" style="color:${th.muted}">${o.kicker}</div>` : ''}
        <div class="dv-title v">${o.title || ''}</div>
        ${o.subtitle ? `<div class="dv-sub" style="color:${th.ink2}">${o.subtitle}</div>` : ''}
      </div>
      <svg class="dv-svg" viewBox="0 0 1920 1080" aria-hidden="true">${inner}</svg>
      ${o.source ? `<div class="dv-src mono" style="color:${th.muted}">${o.source}</div>` : ''}`);
    return s;
  }
  function enterFrame(D, s, T, o, th) {
    const { tl } = D;
    D.show(s, T);
    D.setBg(th.surface, T);
    const head = D.$$('.dv-head > *', s), src = D.$('.dv-src', s);
    gsap.set(head, { opacity: 0, y: 24 });
    tl.to(head, { opacity: 1, y: 0, duration: 0.8, ease: 'expo.out', stagger: 0.08 }, T + 0.1);
    if (src) { gsap.set(src, { opacity: 0 }); tl.to(src, { opacity: 1, duration: 0.6 }, T + 0.6); }
    if (o.label) D.label(T, o.label);
    D.sfx('whoosh', T, 0.6, 0.18);
  }
  function exitFrame(D, s, T, dur) {
    D.tl.to(s, { opacity: 0, duration: 0.4, ease: 'power2.in' }, T + dur - 0.45);
    D.hide(s, T + dur);
  }
  const barPath = (x, w, top, base, r = 4) => {
    const h = base - top;
    if (h <= 0.5) return `M${x},${base}H${x + w}Z`;
    const rr = Math.min(r, h, w / 2);
    return `M${x},${base}V${top + rr}Q${x},${top} ${x + rr},${top}H${x + w - rr}Q${x + w},${top} ${x + w},${top + rr}V${base}Z`;
  };
  const gridSVG = (th, ticks, yOf, fmt) => ticks.map(v => `
    <line x1="${X0}" x2="${X1}" y1="${yOf(v)}" y2="${yOf(v)}" stroke="${th.grid}" stroke-width="1.5"/>
    <text x="${X0 - 22}" y="${yOf(v) + 7}" text-anchor="end" class="dv-tick" fill="${th.muted}">${fmt(v)}</text>`).join('');

  // ------------------------------------------------------------------ DATAHERO
  // One enormous figure on rolling odometer digits, between two lines of copy.   5.5 s
  recipe('datahero', (D, T, o) => {
    const { tl, C } = D;
    const th = theme(D, o), dur = o.duration || 5.5, value = String(o.value || '0');
    let cols = '';
    for (const ch of value) {
      if (/\d/.test(ch)) cols += `<span class="od dh-od"><span class="od-strip">${Array.from({ length: 30 }, (_, k) => `<span>${k % 10}</span>`).join('')}</span></span>`;
      else cols += `<span class="dh-sep">${ch}</span>`;
    }
    const s = D.scene('datahero', `
      <div class="dh-pre v c" style="color:${th.ink2}">${o.pre || ''}</div>
      <div class="dh-num v c" style="color:${th.ink}">${cols}</div>
      <div class="dh-post v c" style="color:${th.ink}">${o.post || ''}</div>
      ${o.source ? `<div class="dv-src mono" style="color:${th.muted}">${o.source}</div>` : ''}`);
    const num = D.fit(D.$('.dh-num', s), 1680), strips = D.$$('.od-strip', s);
    const pre = D.split(D.fit(D.$('.dh-pre', s), 1600), { type: 'chars', mask: 'chars' });
    const post = D.split(D.fit(D.$('.dh-post', s), 1600), { type: 'chars', mask: 'chars' });
    gsap.set([...pre.chars, ...post.chars], { yPercent: 115 });
    gsap.set(num, { opacity: 0 });
    const src = D.$('.dv-src', s);
    if (src) gsap.set(src, { opacity: 0 });

    D.show(s, T);
    D.setBg(th.surface, T);
    D.ink(C.paper, T);
    tl.set(D.bars, { height: 540 }, T);
    D.barsTo(110, T + 0.05, 1.5);
    if (o.label) D.label(T + 0.6, o.label);
    tl.to(pre.chars, { yPercent: 0, duration: 0.8, ease: 'expo.out', stagger: 0.025 }, T + 0.35);
    tl.set(num, { opacity: 1 }, T + 0.9);
    const digits = [...value].filter(ch => /\d/.test(ch));
    strips.forEach((st, i) => {
      const d = +digits[i];
      tl.to(st, { yPercent: -((20 + d) / 30) * 100, duration: 1.1 + i * 0.07, ease: 'power3.out' }, T + 0.9);
    });
    for (let k = 0; k < 16; k++) D.sfx('key', T + 0.9 + k * 0.09, 0.07);
    D.sfx('boom', T + 0.9 + 1.1 + strips.length * 0.07, 0.6);
    tl.to(post.chars, { yPercent: 0, duration: 0.8, ease: 'expo.out', stagger: 0.025 }, T + 2.5);
    if (src) tl.to(src, { opacity: 1, duration: 0.6 }, T + 2.8);
    D.call(() => SFX.pad('data', [110, 164.81, 220], 2, 0.03, 900), T + 0.02);
    D.sfx('bell', T + 2.5, D.N.E5, 0.06);
    tl.to([...pre.chars, ...post.chars], { yPercent: -115, duration: 0.45, ease: 'expo.in', stagger: 0.008 }, T + dur - 0.7);
    tl.to(num, { opacity: 0, y: -30, duration: 0.45, ease: 'power2.in' }, T + dur - 0.6);
    if (src) tl.to(src, { opacity: 0, duration: 0.3 }, T + dur - 0.6);
    D.hide(s, T + dur);
    return dur;
  });

  // ------------------------------------------------------------------ DATALINE
  // A single series drawn by a pen: area wash follows the tip, a live readout
  // (x · value), milestone dots + labels as the pen passes them.            8 s
  recipe('dataline', (D, T, o) => {
    const { tl } = D;
    const th = theme(D, o), dur = o.duration || 8, data = o.data;
    const xs = data.map(p => p[0]), xMin = o.xMin ?? xs[0], xMax = o.xMax ?? xs[xs.length - 1];
    const yMax = o.yMax ?? Math.max(...data.map(p => p[1])), ticks = o.yTicks || [0, yMax / 2, yMax];
    const xOf = x => X0 + ((x - xMin) / (xMax - xMin)) * (X1 - X0), yOf = y => YB - (y / yMax) * (YB - YT);
    const fmtY = o.yFormat || (v => nf(D).format(v)), fmtX = o.xFormat || (v => String(Math.round(v)));
    const pts = data.map(([x, y]) => [xOf(x), yOf(y)]);
    const d = 'M' + pts.map(p => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join('L');
    const area = d + `L${pts[pts.length - 1][0].toFixed(1)},${YB}L${pts[0][0].toFixed(1)},${YB}Z`;
    const ms = (o.milestones || []).map(m => ({ ...m, px: xOf(m.x), py: yOf(m.y) }));
    const inner = `
      <defs><clipPath id="dl-clip"><rect x="0" y="0" width="0" height="1080"/></clipPath></defs>
      ${gridSVG(th, ticks, yOf, fmtY)}
      ${(o.xTicks || [xMin, xMax]).map(x => `<text x="${xOf(x)}" y="${YB + 44}" text-anchor="middle" class="dv-tick" fill="${th.muted}">${fmtX(x)}</text>`).join('')}
      <line x1="${X0}" x2="${X1}" y1="${YB}" y2="${YB}" stroke="${th.ink}" stroke-opacity=".35" stroke-width="1.5"/>
      <path class="dl-area" d="${area}" fill="${th.accent}" fill-opacity="0.1" clip-path="url(#dl-clip)"/>
      <path class="dl-line" d="${d}" fill="none" stroke="${th.accent}" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round"/>
      ${ms.map(m => `<g class="dl-ms"><circle cx="${m.px}" cy="${m.py}" r="6.5" fill="${th.accent}" stroke="${th.surface}" stroke-width="3"/>
        <text x="${m.px + (m.dx ?? -14)}" y="${m.py - 20}" text-anchor="${m.anchor || 'end'}" class="dv-ms" fill="${th.ink}">${m.label}</text></g>`).join('')}
      <circle class="dl-tip" r="8" fill="${th.accent}" stroke="${th.surface}" stroke-width="3" cx="${pts[0][0]}" cy="${pts[0][1]}"/>`;
    const s = frame(D, 'dataline', o, th, inner);
    const line = D.$('.dl-line', s), tip = D.$('.dl-tip', s), clipR = D.$('#dl-clip rect', s), msG = D.$$('.dl-ms', s);
    const readout = document.createElement('div');
    readout.className = 'dv-readout v';
    readout.style.color = th.ink;
    s.appendChild(readout);
    const len = line.getTotalLength();
    const samples = Array.from({ length: 401 }, (_, k) => line.getPointAtLength((len * k) / 400));
    const pAtX = px => { const k = samples.findIndex(p => p.x >= px - 0.5); return (k < 0 ? 400 : k) / 400; };
    const valueAt = px => { for (let i = 1; i < pts.length; i++) if (pts[i][0] >= px) { const u = (px - pts[i - 1][0]) / (pts[i][0] - pts[i - 1][0] || 1); return { x: data[i - 1][0] + u * (data[i][0] - data[i - 1][0]), y: data[i - 1][1] + u * (data[i][1] - data[i - 1][1]) }; } return { x: data[data.length - 1][0], y: data[data.length - 1][1] }; };
    const readFmt = o.readout || (v => `${fmtX(v.x)} · ${fmtY(v.y)}`);
    gsap.set(line, { drawSVG: '0%' });
    gsap.set(msG, { opacity: 0 });
    gsap.set(tip, { opacity: 0 });
    const P = { p: 0 }, tDraw = T + 1.0, drawDur = dur - 2.6;
    const paint = () => {
      gsap.set(line, { drawSVG: `0% ${P.p * 100}%` });
      const pt = line.getPointAtLength(len * P.p);
      tip.setAttribute('cx', pt.x); tip.setAttribute('cy', pt.y);
      clipR.setAttribute('width', pt.x);
      readout.textContent = readFmt(valueAt(pt.x));
    };
    readout.textContent = readFmt(valueAt(pts[0][0]));

    enterFrame(D, s, T, o, th);
    tl.set(tip, { opacity: 1 }, tDraw);
    tl.to(P, { p: 1, duration: drawDur, ease: o.ease || 'power1.in', onUpdate: paint }, tDraw);
    const ease = gsap.parseEase(o.ease || 'power1.in');
    ms.forEach((m, i) => {
      const target = pAtX(m.px);
      let lo = 0, hi = 1; // invert the ease: when does the pen reach this milestone?
      for (let k = 0; k < 30; k++) { const mid = (lo + hi) / 2; if (ease(mid) < target) lo = mid; else hi = mid; }
      const at = tDraw + hi * drawDur;
      D.hit(msG[i], { opacity: 1, scale: 1.6, transformOrigin: `${m.px}px ${m.py}px` }, { scale: 1, duration: 0.5, ease: 'back.out(3)' }, at);
      D.sfx('bell', at, [D.N.A4, D.N.C5, D.N.E5, D.N.A5, D.N.C6][i % 5], 0.06);
    });
    for (let k = 0; k < Math.floor(drawDur / 0.5); k++) { D.sfx('kick', tDraw + k * 0.5, 0.45); D.sfx('hat', tDraw + 0.25 + k * 0.5, 0.08); }
    exitFrame(D, s, T, dur);
    return dur;
  });

  // ------------------------------------------------------------------ DATABARS
  // Columns growing from one baseline (left to right), values at the caps where
  // it matters, one emphasised bar + an optional callout with a leader.    6.5 s
  recipe('databars', (D, T, o) => {
    const { tl } = D;
    const th = theme(D, o), dur = o.duration || 6.5, data = o.data, n = data.length;
    const yMax = o.yMax ?? Math.max(...data.map(p => p[1])), ticks = o.yTicks || [0, yMax / 2, yMax];
    const yOf = y => YB - (y / yMax) * (YB - YT), fmtY = o.yFormat || (v => nf(D).format(v)), fmtV = o.valueFormat || fmtY;
    const slot = (X1 - X0) / n, bw = Math.min(o.barWidth || 56, slot * 0.55);
    const hi = o.highlight ?? (o.emphasis === false ? -1 : n - 1);
    const colorOf = i => (o.color ? o.color : hi < 0 ? th.accent : i === hi ? th.hot : th.gray);
    const showVal = i => o.values === 'all' || (o.values === 'ends' ? i === 0 || i === n - 1 : i === hi || i === 0);
    const every = o.labelEvery || 1;
    const inner = `${gridSVG(th, ticks, yOf, fmtY)}
      ${data.map(([lab], i) => (i % every === 0 || i === n - 1) ? `<text x="${X0 + slot * (i + 0.5)}" y="${YB + 44}" text-anchor="middle" class="dv-tick" fill="${i === hi ? th.ink : th.muted}">${lab}</text>` : '').join('')}
      ${data.map((_, i) => `<path class="db-bar" fill="${colorOf(i)}" d=""/>`).join('')}
      ${data.map((_, i) => showVal(i) ? `<text class="db-val dv-val" data-i="${i}" x="${X0 + slot * (i + 0.5)}" text-anchor="middle" fill="${th.ink}"></text>` : '').join('')}
      <line x1="${X0}" x2="${X1}" y1="${YB}" y2="${YB}" stroke="${th.ink}" stroke-opacity=".35" stroke-width="1.5"/>
      ${o.callout && hi >= 0 ? `<path class="db-lead" d="" fill="none" stroke="${th.hot}" stroke-width="2"/>` : ''}`;
    const s = frame(D, 'databars', o, th, inner);
    const bars = D.$$('.db-bar', s), vals = D.$$('.db-val', s), lead = D.$('.db-lead', s);
    let call = null;
    if (o.callout) {
      call = document.createElement('div');
      call.className = 'dv-callout v';
      call.style.color = th.ink;
      call.innerHTML = o.callout;
      s.appendChild(call);
    }
    enterFrame(D, s, T, o, th);
    const t0 = T + 0.9, span = o.growSpan ?? Math.min(2.8, 0.25 * n), each = 0.7;
    data.forEach(([, v], i) => {
      const x = X0 + slot * (i + 0.5) - bw / 2, P = { h: 0 }, vt = vals.find(t => +t.dataset.i === i);
      const draw = () => {
        bars[i].setAttribute('d', barPath(x, bw, yOf(v * P.h), YB));
        if (vt) { vt.setAttribute('y', yOf(v * P.h) - 16); vt.textContent = fmtV(v * P.h); }
      };
      draw();
      const at = t0 + (n > 1 ? (i / (n - 1)) * span : 0);
      if (vt) { gsap.set(vt, { opacity: 0 }); tl.set(vt, { opacity: 1 }, at + 0.05); } // no "0,0" before the bar exists
      tl.to(P, { h: 1, duration: each, ease: 'expo.out', onUpdate: draw }, at);
      if (i % Math.max(1, Math.round(n / 8)) === 0 || i === n - 1) D.sfx('tick', at, 0.05);
    });
    const tEnd = t0 + span + each;
    D.sfx('kick', t0, 0.5);
    D.sfx('bell', tEnd - 0.3, D.N.A5, 0.07);
    if (call) {
      const bx = o.calloutX ?? 1180, by = o.calloutY ?? 380;
      Object.assign(call.style, { left: bx + 'px', top: by + 'px' });
      // leader: from the right edge of the callout's first line to just left of the value label
      // (or the bar cap) — it must never run through text
      const cx = X0 + slot * (hi + 0.5), capY = yOf(data[hi][1]);
      const labW = showVal(hi) ? String(fmtV(data[hi][1])).length * 15 : 0;
      const ex = cx - (labW ? labW / 2 + 14 : bw / 2 + 8), ey = showVal(hi) ? capY - 24 : capY;
      const sx = bx + call.offsetWidth + 18, sy = by + 30;
      gsap.set(call, { opacity: 0, y: 20 });
      tl.to(call, { opacity: 1, y: 0, duration: 0.7, ease: 'expo.out' }, tEnd);
      if (lead) {
        lead.setAttribute('d', `M${sx},${sy}L${Math.max(sx + 20, ex - 40)},${sy}L${ex},${ey}`);
        gsap.set(lead, { drawSVG: '0%' });
        tl.to(lead, { drawSVG: '100%', duration: 0.6, ease: 'power2.inOut' }, tEnd + 0.1);
      }
      D.sfx('boom', tEnd, 0.4);
    }
    exitFrame(D, s, T, dur);
    return dur;
  });

  // ------------------------------------------------------------------ DATAWAFFLE
  // "N out of 100": a 10×10 grid of people fills to the first value, then the
  // clock runs and it fills to the second value; big numbers count along.   7 s
  recipe('datawaffle', (D, T, o) => {
    const { tl } = D;
    const th = theme(D, o), dur = o.duration || 7;
    const a = o.from, b = o.to, na = Math.round(a.value), nb = Math.round(b.value);
    const S = 46, G = 9, GX = 1180, GY = 330;
    let cells = '';
    for (let k = 0; k < 100; k++) {
      const r = 9 - Math.floor(k / 10), c = k % 10; // fill from the bottom row, left to right
      cells += `<rect class="dw-cell" x="${GX + c * (S + G)}" y="${GY + r * (S + G)}" width="${S}" height="${S}" rx="7" fill="${th.track}"/>`;
    }
    const s = frame(D, 'datawaffle', o, th, cells);
    const els = D.$$('.dw-cell', s);
    const big = document.createElement('div');
    big.className = 'dw-big';
    big.innerHTML = `<div class="dw-num v" style="color:${th.ink}">0</div><div class="dw-of v" style="color:${th.ink}">${o.of || 'DE CADA 100'}</div><div class="dw-what" style="color:${th.ink2}">${o.what || ''}</div><div class="dw-year mono" style="color:${th.muted}"></div>`;
    s.appendChild(big);
    const numEl = D.$('.dw-num', big), yearEl = D.$('.dw-year', big);
    gsap.set(els, { scale: 0, transformOrigin: '50% 50%' });
    gsap.set(big.children, { opacity: 0, y: 20 });
    const F = { v: 0 }, Y = { y: +a.year };
    const paint = () => {
      const n = Math.round(F.v);
      numEl.textContent = String(n);
      els.forEach((e, k) => e.setAttribute('fill', k < n ? th.accent : th.track));
    };
    enterFrame(D, s, T, o, th);
    tl.to(els, { scale: 1, duration: 0.35, ease: 'back.out(2.5)', stagger: { grid: [10, 10], from: 'start', amount: 0.8 } }, T + 0.5);
    tl.to(big.children, { opacity: 1, y: 0, duration: 0.7, ease: 'expo.out', stagger: 0.1 }, T + 0.7);
    yearEl.textContent = String(a.year);
    tl.to(F, { v: na, duration: 0.9, ease: 'power2.out', onUpdate: paint }, T + 1.5);
    const t2 = T + 3.0, d2 = 2.2;
    tl.to(F, { v: nb, duration: d2, ease: 'power1.inOut', onUpdate: paint }, t2);
    tl.to(Y, { y: +b.year, duration: d2, ease: 'power1.inOut', onUpdate: () => { yearEl.textContent = `${a.year} → ${Math.round(Y.y)}`; } }, t2);
    D.sfx('bell', T + 1.5, D.N.C5, 0.06);
    for (let k = 0; k < 11; k++) D.sfx('tick', t2 + k * 0.2, 0.04);
    D.sfx('boom', t2 + d2, 0.45);
    D.sfx('bell', t2 + d2, D.N.A5, 0.07);
    exitFrame(D, s, T, dur);
    return dur;
  });

  // ------------------------------------------------------------------ DATATITLE
  // The title rises out of a baseline in thin vertical bars (a histogram that
  // spells the name), a sparkline of the story draws underneath.          6.5 s
  recipe('datatitle', (D, T, o) => {
    const { tl, C } = D;
    const th = theme(D, o), dur = o.duration || 6.5, word = o.title || D.cfg.meta.title, NS = 64;
    const bg = o.bg || C.night, ink = D.contrast(bg);
    const slices = Array.from({ length: NS }, (_, i) => {
      const L = (i / NS) * 100, R = 100 - ((i + 1) / NS) * 100;
      return `<div class="dt-slice v" style="clip-path:inset(100% ${R.toFixed(3)}% 0% ${Math.max(0, L - 0.05).toFixed(3)}%)">${word}</div>`;
    }).join('');
    const spark = o.spark || [];
    const sx = i => 560 + (i / Math.max(1, spark.length - 1)) * 800, smax = Math.max(1, ...spark);
    const sd = spark.length ? 'M' + spark.map((v, i) => `${sx(i).toFixed(1)},${(760 - (v / smax) * 90).toFixed(1)}`).join('L') : '';
    const s = D.scene('datatitle', `
      <div class="dt-wrap c" style="color:${ink}">${slices}<div class="dt-ghost v">${word}</div></div>
      <svg class="dv-svg" viewBox="0 0 1920 1080" aria-hidden="true">
        <line class="dt-base" x1="300" x2="1620" y1="604" y2="604" stroke="${ink}" stroke-opacity=".5" stroke-width="2"/>
        ${sd ? `<path class="dt-spark" d="${sd}" fill="none" stroke="${o.color || th.hot}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>` : ''}
      </svg>
      <div class="dt-sub mono c" style="color:${ink}"></div>`);
    const wrap = D.$('.dt-wrap', s), sl = D.$$('.dt-slice', s), base = D.$('.dt-base', s), sp = D.$('.dt-spark', s), sub = D.$('.dt-sub', s);
    D.fit(D.$('.dt-ghost', s), 1500);
    sl.forEach(e => { e.style.fontSize = D.$('.dt-ghost', s).style.fontSize; });
    gsap.set(base, { drawSVG: '50% 50%' });
    if (sp) gsap.set(sp, { drawSVG: '0%' });

    D.show(s, T);
    D.setBg(bg, T);
    D.ink(C.paper, T);
    if (o.label) D.label(T + 0.2, o.label);
    tl.to(base, { drawSVG: '0% 100%', duration: 0.8, ease: 'expo.inOut' }, T + 0.1);
    // histogram order: a bell curve of delays, the centre rises first
    sl.forEach((e, i) => {
      const u = (i + 0.5) / NS - 0.5, delay = 0.25 + Math.abs(u) * 1.1 + ((i * 37) % 11) * 0.012;
      const R = 100 - ((i + 1) / NS) * 100, L = Math.max(0, (i / NS) * 100 - 0.05);
      tl.to(e, { clipPath: `inset(0% ${R.toFixed(3)}% 0% ${L.toFixed(3)}%)`, duration: 0.55, ease: 'expo.out' }, T + 0.6 + delay);
      if (i % 8 === 0) D.sfx('tick', T + 0.6 + delay, 0.04);
    });
    const tDone = T + 0.6 + 0.25 + 0.55 + 0.6;
    D.sfx('braam', tDone, 0.6);
    D.sfx('boom', tDone, 0.8);
    D.flash(tDone, 0.2, 0.5);
    D.call(() => SFX.pad('title', [110, 138.59, 164.81, 220], 1.2, 0.05, 900), tDone);
    if (sp) tl.to(sp, { drawSVG: '0% 100%', duration: 1.6, ease: 'power1.inOut' }, tDone + 0.2);
    if (o.subtitle) {
      tl.to(sub, { duration: 1.2, scrambleText: { text: o.subtitle, chars: 'upperCase', speed: 0.6 }, ease: 'none' }, tDone + 0.4);
    }
    // out: the bars drop back into the baseline
    sl.forEach((e, i) => {
      const R = 100 - ((i + 1) / NS) * 100, L = Math.max(0, (i / NS) * 100 - 0.05);
      tl.to(e, { clipPath: `inset(100% ${R.toFixed(3)}% 0% ${L.toFixed(3)}%)`, duration: 0.4, ease: 'expo.in' }, T + dur - 0.9 + (i / NS) * 0.3);
    });
    tl.to([sub, base, sp].filter(Boolean), { opacity: 0, duration: 0.4 }, T + dur - 0.7);
    D.call(() => SFX.padStop('data', 1), T + 0.3);
    D.hide(s, T + dur);
    return dur;
  });
})();
