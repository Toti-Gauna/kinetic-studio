/* ============================================================================
   COUNTDOWN MODULE — countdowns in real time.
   Digits are a stroke font of our own (one centre-line path per digit, viewBox
   0 0 100 160) so MorphSVG can turn any digit into any other. "Real time" comes
   from cfg.now (a Date — default: the viewer's clock when the page loaded) plus the
   film's own elapsed time, so the timeline stays seekable and every frame is a
   function of it. cfg.target is the moment counted down to.
   Recipes: cdmorph, cdclock, cdflip, cdyear, cdfinal.
   ========================================================================== */
(() => {
  'use strict';
  const { recipe } = Trailer;
  // centre-line digits, drawn with a thick round stroke
  const DIG = [
    'M50,10 C80,10 90,40 90,80 C90,120 80,150 50,150 C20,150 10,120 10,80 C10,40 20,10 50,10 Z',
    'M28,36 L56,10 L56,150',
    'M14,44 C14,22 32,10 51,10 C72,10 88,23 88,45 C88,76 16,108 12,150 L90,150',
    'M14,26 C24,14 37,10 50,10 C72,10 86,24 86,42 C86,62 70,76 44,76 C75,76 90,92 90,112 C90,135 72,150 50,150 C32,150 18,142 10,128',
    'M68,150 L68,10 L10,108 L94,108',
    'M86,10 L24,10 L17,72 C29,62 41,60 53,60 C76,60 90,78 90,103 C90,130 72,150 48,150 C32,150 18,143 10,130',
    'M80,20 C71,13 61,10 51,10 C25,10 10,40 10,84 C10,125 26,150 51,150 C76,150 90,130 90,105 C90,80 75,62 52,62 C32,62 16,75 11,96',
    'M10,10 L90,10 L40,150',
    'M50,76 C28,76 15,62 15,43 C15,24 30,10 50,10 C70,10 85,24 85,43 C85,62 72,76 50,76 C25,76 10,92 10,112 C10,134 28,150 50,150 C72,150 90,134 90,112 C90,92 75,76 50,76 Z',
    'M89,64 C84,85 68,98 48,98 C25,98 10,82 10,55 C10,28 26,10 50,10 C76,10 90,35 90,76 C90,120 75,150 50,150 C40,150 30,147 21,141',
  ];
  const digitSVG = (d, cls = '') => `<svg class="cd-dig ${cls}" viewBox="-12 -12 124 184" aria-hidden="true"><path class="cd-dp" d="${DIG[d]}"/></svg>`;
  const pad = (n, w = 2) => String(Math.max(0, Math.floor(n))).padStart(w, '0');
  const clock = D => {
    const q = new URLSearchParams(location.search);
    const now = D.cfg.now ? new Date(D.cfg.now) : q.get('now') ? new Date(q.get('now')) : new Date();
    const target = D.cfg.target ? new Date(D.cfg.target) : q.get('to') ? new Date(q.get('to')) : new Date(now.getFullYear() + 1, 0, 1);
    return { now, target, at: filmT => new Date(now.getTime() + filmT * 1000) };
  };
  const fmt = (D, d, o) => new Intl.DateTimeFormat(D.cfg.locale || 'es-AR', o).format(d).toUpperCase();

  // ------------------------------------------------------------------ CDMORPH
  // Giant stroke digits count down, morphing into each other; a ring drains per number;
  // the steps speed up; at zero the frame fills with the accent.
  recipe('cdmorph', (D, T, o) => {
    const { tl, N } = D;
    const from = o.from ?? 10, steps = [], cols = o.colors || [D.C.night, D.C.a[0], D.C.ink, D.C.a[1] || D.C.a[0]];
    for (let n = from; n >= 0; n--) steps.push(n);
    const lens = o.steps || steps.map((_, i) => (i < 2 ? 1 : i < 4 ? 0.75 : 0.5));
    const dur = lens.reduce((a, b) => a + b, 0) + (o.tail ?? 0.5);
    const s = D.scene('cdmorph', `
      <div class="cd-kick mono c">${o.kicker || ''}</div>
      <svg class="cd-ring" viewBox="-110 -110 220 220"><circle r="100" class="cd-ring-t"/><circle r="100" class="cd-ring-a"/></svg>
      <div class="cd-pair c">${digitSVG(1, 'cd-tens')}${digitSVG(from % 10, 'cd-ones')}</div>
      <div class="cd-fill c"></div>`);
    const tens = D.$('.cd-tens', s), ones = D.$('.cd-ones path', s), onesSvg = D.$('.cd-ones', s), ringA = D.$('.cd-ring-a', s), fill = D.$('.cd-fill', s), kick = D.$('.cd-kick', s);
    const twoDigits = from >= 10;
    gsap.set(tens, { display: twoDigits ? 'block' : 'none' });
    const pair = D.$('.cd-pair', s);
    gsap.set(pair, { scale: twoDigits ? 0.78 : 1 }); // two digits fit inside the ring
    gsap.set(fill, { scale: 0 });
    D.show(s, T);
    D.setBg(cols[0], T);
    D.ink(D.C.paper, T);
    if (o.open !== false) { tl.set(D.bars, { height: 540 }, T); D.barsTo(96, T + 0.05, 1.0); }
    if (o.label) D.label(T + 0.2, o.label);
    if (o.kicker) { gsap.set(kick, { opacity: 0 }); tl.to(kick, { opacity: 0.7, duration: 0.4 }, T + 0.2); }
    D.hit([tens, onesSvg], { scale: 1.3, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, ease: 'expo.out' }, T);
    D.sfx('riser', T, dur - 0.6, 0.25);
    let t = T;
    steps.forEach((n, i) => {
      const len = lens[i], bg = cols[i % cols.length], ink = D.contrast(bg);
      if (i > 0) {
        tl.to(ones, { morphSVG: { shape: DIG[n % 10], type: 'linear' }, duration: Math.min(0.32, len * 0.6), ease: 'expo.inOut' }, t);
        if (twoDigits && n === 9) { tl.to(tens, { width: 0, marginRight: 0, opacity: 0, duration: 0.3, ease: 'power2.inOut' }, t); tl.to(pair, { scale: 1, duration: 0.3, ease: 'power2.inOut' }, t); } // the ones slide to the centre
        D.setBg(bg, t);
        tl.set(s, { color: ink }, t);
        D.hit(onesSvg, { scale: 1.12 }, { scale: 1, duration: 0.3, ease: 'expo.out' }, t);
      } else tl.set(s, { color: D.contrast(cols[0]) }, t);
      D.hit(ringA, { drawSVG: '0% 100%' }, { drawSVG: '100% 100%', duration: len, ease: 'none' }, t);
      D.sfx('tick', t, 0.08);
      D.sfx('kick', t, n <= 3 ? 0.6 : 0.35);
      if (n <= 3) D.sfx('bell', t, [N.A5, N.E5, N.C5, N.A4][n], 0.06);
      t += len;
    });
    // zero: the frame floods with the accent
    const tz = t - lens[lens.length - 1] + 0.15;
    tl.to(fill, { scale: 40, duration: 0.6, ease: 'expo.in' }, tz);
    D.flash(tz + 0.55, 0.4, 0.4);
    D.sfx('boom', tz + 0.55, 0.9);
    D.sfx('braam', tz + 0.55, 0.5);
    D.hide(s, T + dur);
    return dur;
  });

  // ------------------------------------------------------------------ CDCLOCK
  // The viewer's real local time: an analogue clock with a sweeping second hand, the
  // digital time and today's date spelled out.                                  7 s
  recipe('cdclock', (D, T, o) => {
    const { tl } = D;
    const dur = o.duration || 7, C = clock(D);
    const ticks = Array.from({ length: 60 }, (_, i) => { const a = (i / 60) * Math.PI * 2, r0 = i % 5 ? 262 : 240; return `<line x1="${(Math.sin(a) * r0).toFixed(1)}" y1="${(-Math.cos(a) * r0).toFixed(1)}" x2="${(Math.sin(a) * 280).toFixed(1)}" y2="${(-Math.cos(a) * 280).toFixed(1)}" class="${i % 5 ? 'cd-tk' : 'cd-tk5'}"/>`; }).join('');
    const s = D.scene('cdclock', `
      <svg class="cd-face" viewBox="-310 -310 620 620"><circle r="300" class="cd-fc"/>${ticks}
        <line class="cd-h cd-hh" x1="0" y1="24" x2="0" y2="-150"/><line class="cd-h cd-hm" x1="0" y1="30" x2="0" y2="-222"/>
        <line class="cd-h cd-hs" x1="0" y1="44" x2="0" y2="-250"/><circle r="12" class="cd-hub"/></svg>
      <div class="cd-copy">
        <div class="cd-k mono">${o.kicker || 'HORA LOCAL'}</div>
        <div class="cd-time v">00:00:00</div>
        <div class="cd-date v"></div>
        <div class="cd-note mono">${o.note || ''}</div>
      </div>`);
    const face = D.$('.cd-face', s), hh = D.$('.cd-hh', s), hm = D.$('.cd-hm', s), hs = D.$('.cd-hs', s), timeEl = D.$('.cd-time', s), dateEl = D.$('.cd-date', s), copy = D.$$('.cd-copy > *', s);
    const setHands = ft => {
      const d = C.at(ft), sec = d.getSeconds() + d.getMilliseconds() / 1000, min = d.getMinutes() + sec / 60, hr = (d.getHours() % 12) + min / 60;
      gsap.set(hs, { rotation: sec * 6, svgOrigin: '0 0' });
      gsap.set(hm, { rotation: min * 6, svgOrigin: '0 0' });
      gsap.set(hh, { rotation: hr * 30, svgOrigin: '0 0' });
      timeEl.textContent = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
      dateEl.textContent = fmt(D, d, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).replace(',', '');
    };
    setHands(T);
    D.fit(dateEl, 900);
    gsap.set(copy, { opacity: 0, x: 40 });
    D.show(s, T);
    D.setBg(o.bg || D.C.night, T);
    D.ink(D.C.paper, T);
    if (o.label) D.label(T, o.label);
    D.hit(face, { scale: 0.6, opacity: 0, rotation: -40 }, { scale: 1, opacity: 1, rotation: 0, duration: 1, ease: 'expo.out' }, T);
    tl.to(copy, { opacity: 1, x: 0, duration: 0.8, ease: 'expo.out', stagger: 0.1 }, T + 0.3);
    const P = { t: T };
    tl.to(P, { t: T + dur, duration: dur, ease: 'none', onUpdate: () => setHands(P.t) }, T);
    const ms = C.at(T).getMilliseconds() / 1000, first = ms ? 1 - ms : 0; // ticks on the real second edges
    for (let k = 0; k < dur; k++) D.sfx('tick', T + first + k, 0.07);
    tl.to([face, ...copy], { opacity: 0, duration: 0.4, stagger: 0.04 }, T + dur - 0.5);
    D.hide(s, T + dur);
    return dur;
  });

  // ------------------------------------------------------------------ CDFLIP
  // A split-flap board with the real time left until the target: days, hours, minutes,
  // seconds; the seconds flip every second of the film.                        8 s
  recipe('cdflip', (D, T, o) => {
    const { tl } = D;
    const dur = o.duration || 8, C = clock(D);
    const left = ft => Math.max(0, Math.floor((C.target - C.at(ft)) / 1000));
    const split = sec => ({ d: Math.floor(sec / 86400), h: Math.floor(sec / 3600) % 24, m: Math.floor(sec / 60) % 60, s: sec % 60 });
    const v0 = split(left(T)), dw = String(v0.d).length > 2 ? 3 : 2;
    const units = [['d', dw, o.labels?.[0] || 'DÍAS'], ['h', 2, o.labels?.[1] || 'HORAS'], ['m', 2, o.labels?.[2] || 'MINUTOS'], ['s', 2, o.labels?.[3] || 'SEGUNDOS']];
    const card = c => `<div class="cd-card"><div class="cd-top"><span>${c}</span></div><div class="cd-bot"><span>${c}</span></div><div class="cd-ftop"><span>${c}</span></div><div class="cd-fbot"><span>${c}</span></div></div>`;
    const s = D.scene('cdflip', `
      <div class="cd-fk mono c">${o.kicker || ''}</div>
      <div class="cd-board c">${units.map(([k, w, lab]) => `<div class="cd-unit" data-u="${k}"><div class="cd-cards">${pad(v0[k], w).split('').map(card).join('')}</div><div class="cd-ul mono">${lab}</div></div>`).join('<div class="cd-colon">:</div>')}</div>
      <div class="cd-fl v c"></div>`);
    const board = D.$('.cd-board', s), kick = D.$('.cd-fk', s), line = D.$('.cd-fl', s);
    line.innerHTML = o.line ? o.line(C.target) : '';
    D.fit(line, 1500);
    const cards = {};
    units.forEach(([k]) => { cards[k] = D.$$(`.cd-unit[data-u="${k}"] .cd-card`, s); });
    gsap.set(board.children, { opacity: 0, y: 40 });
    gsap.set([kick, line], { opacity: 0 });
    D.show(s, T);
    D.setBg(o.bg || D.C.night, T);
    if (o.label) D.label(T, o.label);
    tl.to(board.children, { opacity: 1, y: 0, duration: 0.7, ease: 'expo.out', stagger: 0.06 }, T + 0.1);
    tl.to(kick, { opacity: 0.75, duration: 0.5 }, T + 0.3);
    tl.to(line, { opacity: 1, duration: 0.6 }, T + 0.9);
    // every second boundary inside the scene: flip the cards whose digit changes
    const flip = (el, a, b, at) => {
      const top = el.querySelector('.cd-top span'), bot = el.querySelector('.cd-bot span'), ft = el.querySelector('.cd-ftop'), fb = el.querySelector('.cd-fbot');
      tl.set(ft.firstChild, { textContent: a }, at);
      tl.set(fb.firstChild, { textContent: b }, at);
      tl.set(top, { textContent: b }, at);
      D.hit(ft, { rotationX: 0, autoAlpha: 1 }, { rotationX: -90, duration: 0.14, ease: 'power2.in' }, at);
      D.hit(fb, { rotationX: 90, autoAlpha: 1 }, { rotationX: 0, duration: 0.16, ease: 'power2.out' }, at + 0.14);
      tl.set(bot, { textContent: b }, at + 0.3);
      tl.set([ft, fb], { autoAlpha: 0 }, at + 0.31);
    };
    D.$$('.cd-ftop, .cd-fbot', s).forEach(e => gsap.set(e, { autoAlpha: 0 }));
    const ms = C.at(T).getMilliseconds() / 1000, firstEdge = ms ? 1 - ms : 1;
    let prev = v0;
    for (let e = firstEdge; e < dur - 0.2; e += 1) {
      const at = T + e, v = split(left(at + 0.001));
      units.forEach(([k, w]) => {
        const a = pad(prev[k], w), b = pad(v[k], w);
        for (let i = 0; i < w; i++) if (a[i] !== b[i]) flip(cards[k][i], a[i], b[i], at);
      });
      D.sfx('tick', at, 0.08);
      D.sfx('key', at + 0.14, 0.12);
      prev = v;
    }
    tl.to([...board.children, kick, line], { opacity: 0, duration: 0.4, stagger: 0.03 }, T + dur - 0.5);
    D.hide(s, T + dur);
    return dur;
  });

  // ------------------------------------------------------------------ CDYEAR
  // The year as dots: one row per month, one dot per day; the days already lived fill in,
  // today pulses; the percentage and the days left count up.                   7 s
  recipe('cdyear', (D, T, o) => {
    const { tl } = D;
    const dur = o.duration || 7, C = clock(D), now = C.at(T), Y = now.getFullYear();
    const start = new Date(Y, 0, 1), end = new Date(Y + 1, 0, 1), days = Math.round((end - start) / 86400000);
    const dayIdx = Math.floor((new Date(Y, now.getMonth(), now.getDate()) - start) / 86400000); // 0-based, today
    const pct = ((now - start) / (end - start)) * 100;
    const months = Array.from({ length: 12 }, (_, m) => new Date(Y, m + 1, 0).getDate());
    const mNames = Array.from({ length: 12 }, (_, m) => fmt(D, new Date(Y, m, 1), { month: 'short' }).replace('.', ''));
    const GX = 330, GY = 300, SP = 34;
    let dots = '', k = 0;
    months.forEach((n, m) => {
      for (let d = 0; d < n; d++, k++) dots += `<circle cx="${GX + d * SP}" cy="${GY + m * 44}" r="10" class="cd-dot${k < dayIdx ? ' is-past' : k === dayIdx ? ' is-today' : ''}" data-k="${k}"/>`;
    });
    const s = D.scene('cdyear', `
      <div class="cd-yh"><div class="cd-k mono">${o.kicker || ''}</div><div class="cd-yt v">${(o.title || '{Y} en puntos').replace('{Y}', Y)}</div></div>
      <svg class="cd-ysvg" viewBox="0 0 1920 1080">${mNames.map((n, m) => `<text x="${GX - 34}" y="${GY + m * 44 + 7}" text-anchor="end" class="cd-mn">${n}</text>`).join('')}${dots}</svg>
      <div class="cd-ystats"><div><b class="v cd-pct">0</b><span class="mono">${o.pctLabel || 'DEL AÑO YA PASÓ'}</span></div><div><b class="v cd-left">0</b><span class="mono">${o.leftLabel || 'DÍAS POR DELANTE'}</span></div></div>
      ${o.source ? `<div class="cd-ysrc mono">${o.source}</div>` : ''}`);
    const past = D.$$('.cd-dot.is-past', s), today = D.$('.cd-dot.is-today', s), all = D.$$('.cd-dot', s), head = D.$$('.cd-yh > *, .cd-ystats > div, .cd-ysrc', s);
    const pctEl = D.$('.cd-pct', s), leftEl = D.$('.cd-left', s), nf1 = new Intl.NumberFormat(D.cfg.locale || 'es-AR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    gsap.set(all, { scale: 0, transformOrigin: '50% 50%' });
    gsap.set(head, { opacity: 0, y: 24 });
    D.show(s, T);
    D.setBg(o.bg || D.C.night, T);
    if (o.label) D.label(T, o.label);
    tl.to(head, { opacity: 1, y: 0, duration: 0.7, ease: 'expo.out', stagger: 0.08 }, T + 0.1);
    tl.to(all, { scale: 1, duration: 0.3, ease: 'back.out(2)', stagger: { each: 1.4 / days, from: 'start' } }, T + 0.3);
    tl.to(past, { attr: { class: 'cd-dot is-past is-on' }, duration: 0.01, stagger: { each: 1.6 / Math.max(1, past.length) } }, T + 1.2);
    if (today) D.hit(today, { scale: 2.4 }, { scale: 1.5, duration: 0.8, ease: 'elastic.out(1, 0.4)', repeat: 3, yoyo: true }, T + 2.9);
    const P = { p: 0, l: 0 }, daysLeft = days - dayIdx - 1;
    tl.to(P, { p: pct, l: daysLeft, duration: 1.8, ease: 'power2.out', onUpdate: () => { pctEl.textContent = `${nf1.format(P.p)} %`; leftEl.textContent = String(Math.round(P.l)); } }, T + 1.2);
    for (let i = 0; i < 12; i++) D.sfx('tick', T + 1.2 + i * 0.13, 0.04);
    D.sfx('bell', T + 2.9, D.N.E5, 0.06);
    tl.to([...head, ...all], { opacity: 0, duration: 0.4, stagger: 0 }, T + dur - 0.5);
    D.hide(s, T + dur);
    return dur;
  });

  // ------------------------------------------------------------------ CDFINAL
  // 3 · 2 · 1 in stroke digits, then the target year draws itself with fireworks and a
  // call to action.                                                               7 s
  recipe('cdfinal', (D, T, o) => {
    const { tl, N } = D;
    const dur = o.duration || 7, C = clock(D), year = String(o.year || C.target.getFullYear());
    const s = D.scene('cdfinal', `
      <div class="cd-pair cd-final c">${digitSVG(3, 'cd-ones')}</div>
      <div class="cd-year c">${[...year].map(ch => digitSVG(+ch, 'cd-yd')).join('')}</div>
      <div class="cd-cta c"><span class="cd-cal"><i></i><b>${pad(C.target.getDate())}</b></span><span>${o.cta || ''}</span></div>
      <div class="cd-sub mono c">${o.sub || ''}</div>`);
    const one = D.$('.cd-final .cd-ones path', s), oneSvg = D.$('.cd-final .cd-ones', s), yd = D.$$('.cd-yd path', s), ydSvg = D.$$('.cd-yd', s), cta = D.$('.cd-cta', s), sub = D.$('.cd-sub', s);
    gsap.set(yd, { drawSVG: '0%' });
    gsap.set([cta, sub], { opacity: 0, y: 20 });
    // fireworks: a canvas layer, every spark a pure function of F.t
    const F = { alpha: 0, t: 0 }, bursts = [], cols = o.fireworks || [D.C.a[0], D.C.paper, '#ffc21a', '#2b50ff', '#ff2e88'];
    const t0 = 3.3;
    for (let b = 0; b < 9; b++) bursts.push({ t: t0 + b * 0.32 + D.rand() * 0.15, x: 260 + D.rand() * 1400, y: 160 + D.rand() * 360, c: cols[b % cols.length], n: 64, v: 380 + D.rand() * 220, seed: D.rand() * 6.28 });
    D.layer(F, g => {
      g.globalCompositeOperation = 'lighter';
      for (const b of bursts) {
        const e = F.t - b.t;
        if (e < 0 || e > 2.2) continue;
        const fade = Math.max(0, 1 - e / 2.2);
        g.fillStyle = b.c;
        for (let i = 0; i < b.n; i++) {
          const a = (i / b.n) * Math.PI * 2 + b.seed, sp = b.v * (0.6 + 0.4 * Math.sin(i * 7.3 + b.seed) ** 2);
          const x = b.x + Math.cos(a) * sp * (1 - Math.exp(-e * 2.4)) / 1.2, y = b.y + Math.sin(a) * sp * (1 - Math.exp(-e * 2.4)) / 1.2 + 60 * e * e;
          g.globalAlpha = F.alpha * fade * (0.6 + 0.4 * Math.sin(e * 30 + i));
          g.beginPath(); g.arc(x, y, 5 * fade + 1.2, 0, Math.PI * 2); g.fill();
        }
      }
      g.globalCompositeOperation = 'source-over';
    });
    D.show(s, T);
    D.setBg(o.bg || D.C.night, T);
    D.ink(D.C.paper, T);
    if (o.label) D.label(T, o.label);
    // 3 · 2 · 1
    D.hit(oneSvg, { scale: 1.4, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.4, ease: 'expo.out' }, T);
    [3, 2, 1].forEach((n, i) => {
      const at = T + i * 0.75;
      if (i) tl.to(one, { morphSVG: { shape: DIG[n], type: 'linear' }, duration: 0.3, ease: 'expo.inOut' }, at);
      D.hit(oneSvg, { scale: 1.15 }, { scale: 1, duration: 0.35, ease: 'expo.out' }, at);
      D.sfx('kick', at, 0.6);
      D.sfx('bell', at, [N.E5, N.C5, N.A4][i], 0.07);
    });
    const ty = T + 2.25;
    tl.to(oneSvg, { scale: 0, opacity: 0, duration: 0.3, ease: 'power2.in' }, ty);
    // the year draws itself
    yd.forEach((p, i) => tl.to(p, { drawSVG: '100%', duration: 0.6, ease: 'power2.inOut' }, ty + 0.35 + i * 0.12));
    D.hit(ydSvg, { scale: 0.9 }, { scale: 1, duration: 1.2, ease: 'expo.out', stagger: 0.12 }, ty + 0.35);
    D.flash(ty + 0.75, 0.35, 0.6); // the impact lands on the beat (T + 3)
    D.shake(ty + 0.75, 0.5, 12);
    D.sfx('braam', ty + 0.75, 0.7);
    D.sfx('boom', ty + 0.75, 0.9);
    D.sfx('crash', ty + 0.75, 0.3);
    D.call(() => SFX.pad('title', [110, 138.59, 164.81, 220], 1.2, 0.05, 900), ty + 0.75);
    tl.set(F, { alpha: 1 }, T);
    tl.to(F, { t: dur, duration: dur, ease: 'none' }, T);
    bursts.forEach(b => { D.sfx('boom', T + b.t, 0.25); D.sfx('crash', T + b.t + 0.05, 0.08); });
    tl.to(cta, { opacity: 1, y: 0, duration: 0.7, ease: 'back.out(2)' }, ty + 1.6);
    tl.to(sub, { opacity: 0.7, y: 0, duration: 0.6 }, ty + 2.0);
    D.sfx('bell', ty + 1.6, N.A5, 0.07);
    // close
    tl.to([...ydSvg, cta, sub], { opacity: 0, duration: 0.5, stagger: 0.03 }, T + dur - 0.9);
    tl.to(F, { alpha: 0, duration: 0.5 }, T + dur - 0.6);
    D.barsTo(540, T + dur - 0.9, 0.8);
    D.call(() => SFX.padStop('title', 1.5), T + dur - 0.9);
    D.hide(s, T + dur);
    return dur;
  });

  Trailer.countdown = { DIG, digitSVG, clock };
})();
