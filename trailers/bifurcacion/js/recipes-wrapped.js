/* ============================================================================
   WRAPPED MODULE — "your year in numbers" stories, built from data.
   One template, N people: Trailer.wrapped.scenes(profile) turns a JSON profile into the
   scene list, so the same film renders anyone's year. Composed for the vertical stage
   (cfg.stage = { w: 1080, h: 1920 }); the vertical module's Stories bar runs on top and
   follows the card's ink. Vibrant full-bleed cards that wipe in over each other, big
   playful shapes, numbers that count up, a top 5 with honest bars (from zero), a palette,
   a shareable summary card and a deck of everyone else's cards (the same template).
   Text colours are picked by WCAG contrast against each card, never by rule of thumb.
   Profile (every field is data; see README):
     { name, kicker, line1, year, until, colors: [hex…], dark,
       stats: [{ label, kicker, lead, value | text, decimals, unit, sub }],
       top: { kicker, title, unit, decimals, items: [[name, value]] },
       palette: { kicker, title, swatches: [hex | [hex, name]] },
       summary: { kicker, rows: [[label, value]], strip: [hex], cta },
       deck: { kicker, lines: [..], sub, hint, unit, land, cards: [{ name, bg, value, strip, me }] } }
   Recipes: wrcover, wrstat, wrtop, wrcolors, wrsummary, wrdeck.
   ========================================================================== */
(() => {
  'use strict';
  const { recipe } = Trailer;
  const nf = (D, d = 0) => new Intl.NumberFormat(D.cfg.locale || 'es-AR', { minimumFractionDigits: d, maximumFractionDigits: d });

  // ---------------------------------------------------------------- colour (WCAG)
  const rgbOf = h => { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
  const lum = h => { const c = rgbOf(h).map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
  const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  const DARK = '#121212', LIGHT = '#ffffff';
  const inkOn = bg => (ratio(bg, DARK) >= ratio(bg, LIGHT) ? DARK : LIGHT);
  /** HSL saturation (0–1): how "vibrant" a colour is */
  const sat = h => { const [r, g, b] = rgbOf(h).map(v => v / 255), mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2; return mx === mn ? 0 : (mx - mn) / (1 - Math.abs(2 * l - 1)); };
  /** the most vibrant colour of a palette (ties: the one that reads best on dark) */
  const vivid = pal => [...pal].sort((a, b) => (sat(b) - sat(a)) || (ratio(b, DARK) - ratio(a, DARK)))[0];
  /** accent colours for shapes and bars on `bg`: visible on it and not confusable with the text ink */
  const accents = (cols, bg) => {
    const ink = inkOn(bg), ok = cols.filter(c => c !== bg && ratio(c, bg) >= 1.35);
    const far = ok.filter(c => ratio(c, ink) >= 1.8);
    return (far.length ? far : ok).sort((a, b) => sat(b) - sat(a));
  };
  const rgba = (h, a) => { const [r, g, b] = rgbOf(h); return `rgba(${r},${g},${b},${a})`; };

  // ---------------------------------------------------------------- cards
  // big playful shapes, kept to the top and bottom bands so they never sit under the text
  function shapes(cols, bg, k) {
    const o = accents(cols, bg), ink = inkOn(bg), a = o[0] || rgba(ink, 0.14), b = o[1] || a, c = o[2] || b;
    const kinds = [
      `<i class="wr-sh wr-circ" style="background:${a};left:-190px;top:1440px"></i><i class="wr-sh wr-ring" style="border-color:${b};right:-150px;top:110px"></i>`,
      `<svg class="wr-sh wr-zig" viewBox="0 0 1200 220" style="left:-60px;top:1580px"><path d="M0 110 L100 30 L200 190 L300 30 L400 190 L500 30 L600 190 L700 30 L800 190 L900 30 L1000 190 L1100 30 L1200 110" stroke="${a}"/></svg><i class="wr-sh wr-sq" style="background:${b};right:-110px;top:150px"></i>`,
      `<i class="wr-sh wr-blob" style="background:${a};right:-270px;top:1400px"></i><i class="wr-sh wr-pill" style="background:${c};left:-150px;top:240px"></i>`,
      `<i class="wr-sh wr-half" style="background:${a};left:-40px;top:1520px"></i><i class="wr-sh wr-dots" style="color:${b};right:40px;top:150px"></i>`,
    ];
    return kinds[k % kinds.length];
  }
  const WIPES = [
    ['inset(100% 0% 0% 0%)', 'inset(0% 0% 0% 0%)'],
    ['inset(0% 0% 0% 100%)', 'inset(0% 0% 0% 0%)'],
    ['circle(0% at 50% 55%)', 'circle(100% at 50% 55%)'],
    ['inset(0% 100% 0% 0%)', 'inset(0% 0% 0% 0%)'],
  ];
  /** build a card scene; returns { s, card, sh, inn, ink, bg, k } */
  function card(D, name, o, inner, extra = '') {
    const bg = o.bg, ink = inkOn(bg), k = o.k || 0;
    const s = D.scene(name, `<div class="wr-card" style="background:${bg};color:${ink}">${o.shapes === false ? '' : shapes(o.colors || [bg], bg, k)}${extra}<div class="wr-in">${inner}</div></div>`);
    return { s, card: D.$('.wr-card', s), sh: D.$$('.wr-sh', s), inn: D.$('.wr-in', s), ink, bg, k };
  }
  /** open a card at T: wipe in over the previous one, set page + HUD + Stories ink */
  function open(D, T, c, o) {
    D.show(c.s, T);
    if (T > 0.01) {
      const w = WIPES[c.k % WIPES.length];
      D.hit(c.card, { clipPath: w[0] }, { clipPath: w[1], duration: 0.5, ease: 'expo.inOut' }, T);
      D.sfx('whoosh', T, 0.45, 0.22);
    }
    D.tl.set(D.stage, { '--vt-ink': c.ink }, T);
    D.setBg(c.bg, T + 0.5);
    D.ink(c.ink, T);
    if (o.label) D.label(T, o.label);
  }
  /** the previous card's content drifts up while the next one wipes in, then the scene hides */
  function close(D, T, dur, c, last = false) {
    if (last) { D.hide(c.s, T + dur); return; }
    gsap.set(c.inn, { y: 0 }); // a transform from the start: identical state whichever way it's reached
    D.tl.to(c.inn, { y: -140, opacity: 0.4, duration: 0.5, ease: 'expo.inOut' }, T + dur);
    D.hide(c.s, T + dur + 0.52);
  }
  /** shapes pop in, then drift for the rest of the card */
  function motion(D, T, dur, sh) {
    gsap.set(sh, { scale: 0 });
    sh.forEach((e, i) => {
      D.hit(e, { scale: 0, rotation: i ? -40 : 40 }, { scale: 1, rotation: 0, duration: 0.8, ease: 'back.out(1.6)' }, T + 0.25 + i * 0.1);
      D.tl.to(e, { rotation: i % 2 ? -22 : 22, y: i % 2 ? 36 : -36, duration: Math.max(0.5, dur - 0.6), ease: 'sine.inOut' }, T + 1.05 + i * 0.1);
    });
  }
  // fresh vars on every call: tl.set() mutates its vars object (parent, duration, immediateRender)
  const from = () => ({ opacity: 0, y: 70 });
  const enter = (D, els, at, st = 0.08) => { gsap.set(els, from()); D.hit(els, from(), { opacity: 1, y: 0, duration: 0.6, ease: 'expo.out', stagger: st }, at); };

  // ------------------------------------------------------------------ WRCOVER
  recipe('wrcover', (D, T, o) => {
    const dur = o.duration || 4;
    const c = card(D, 'wrcover', o, `
      <div class="wr-k mono">${o.kicker || ''}</div>
      <div class="wr-big v"><span>${o.line1 || 'TU'}</span><span>${o.year || ''}</span></div>
      <div class="wr-name v">${o.name || ''}</div>
      <div class="wr-sub">${o.until || ''}</div>`);
    const bigs = D.$$('.wr-big span', c.s), rest = D.$$('.wr-k, .wr-name, .wr-sub', c.s);
    bigs.forEach(e => D.fit(e, 920));
    D.fit(D.$('.wr-name', c.s), 920);
    open(D, T, c, o);
    motion(D, T, dur, c.sh);
    gsap.set(bigs, { yPercent: 110, opacity: 0 });
    D.hit(bigs, { yPercent: 110, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.9, ease: 'expo.out', stagger: 0.14 }, T + 0.3);
    enter(D, rest, T + 0.85);
    D.sfx('boom', T + 0.3, 0.7);
    D.sfx('bell', T + 0.85, D.N.E5, 0.07);
    close(D, T, dur, c);
    return dur;
  });

  // ------------------------------------------------------------------ WRSTAT
  recipe('wrstat', (D, T, o) => {
    const { tl } = D;
    const dur = o.duration || 3, f = nf(D, o.decimals || 0), isText = o.text != null;
    const c = card(D, 'wrstat', o, `
      <div class="wr-k mono">${o.kicker || ''}</div>
      <div class="wr-lead">${o.lead || ''}</div>
      <div class="wr-num v${isText ? ' is-text' : ''}">${isText ? o.text : f.format(o.value)}</div>
      ${o.unit ? `<div class="wr-unit v">${o.unit}</div>` : ''}
      ${o.sub ? `<div class="wr-sub">${o.sub}</div>` : ''}`);
    const num = D.$('.wr-num', c.s), els = D.$$('.wr-in > *', c.s).filter(e => e !== num);
    D.fit(num, 920);                             // fitted at the final value
    if (o.unit) D.fit(D.$('.wr-unit', c.s), 920);
    if (!isText) num.textContent = f.format(0);
    open(D, T, c, o);
    motion(D, T, dur, c.sh);
    enter(D, els, T + 0.3);
    gsap.set(num, { opacity: 0 });
    D.hit(num, { opacity: 1, scale: 1.3 }, { scale: 1, duration: 0.7, ease: 'expo.out' }, T + 0.45);
    if (!isText) {
      const P = { v: 0 };
      tl.to(P, { v: o.value, duration: 1.1, ease: 'expo.out', onUpdate: () => { num.textContent = f.format(P.v); } }, T + 0.45);
      for (let i = 0; i < 6; i++) D.sfx('tick', T + 0.45 + i * 0.08, 0.04);
    }
    D.sfx('kick', T + 0.45, 0.5);
    D.sfx('bell', T + 1.5, [D.N.C5, D.N.E5, D.N.G5, D.N.A5][(o.k || 0) % 4], 0.06);
    close(D, T, dur, c);
    return dur;
  });

  // ------------------------------------------------------------------ WRTOP
  recipe('wrtop', (D, T, o) => {
    const { tl } = D;
    const dur = o.duration || 5.5, items = (o.items || []).slice(0, 5), max = Math.max(...items.map(i => i[1]), 1e-9), f = nf(D, o.decimals || 0);
    const bar = accents(o.colors || [], o.bg).filter(x => ratio(x, o.bg) >= 2)[0] || inkOn(o.bg);
    const c = card(D, 'wrtop', o, `
      <div class="wr-k mono">${o.kicker || ''}</div>
      <div class="wr-title v">${o.title || ''}</div>
      <div class="wr-list">${items.map(([n, v], i) => `<div class="wr-row"><b class="v">${i + 1}</b><div class="wr-rt"><span class="wr-rn v">${n}</span><i class="wr-bar"><i style="background:${bar};width:${(v / max) * 100}%"></i></i></div><em class="v">${f.format(v)}${o.unit ? `<small>${o.unit}</small>` : ''}</em></div>`).join('')}</div>`);
    const head = D.$$('.wr-k, .wr-title', c.s), rows = D.$$('.wr-row', c.s), fills = D.$$('.wr-bar i', c.s);
    D.fit(D.$('.wr-title', c.s), 920);
    D.$$('.wr-rn', c.s).forEach(e => D.fit(e, 560));
    gsap.set(fills, { scaleX: 0, transformOrigin: '0% 50%' });
    gsap.set(rows, { opacity: 0 });
    open(D, T, c, o);
    motion(D, T, dur, c.sh);
    enter(D, head, T + 0.3);
    rows.forEach((r, i) => {
      const at = T + 0.8 + i * 0.3;
      D.hit(r, { opacity: 0, x: 140 }, { opacity: 1, x: 0, duration: 0.55, ease: 'expo.out' }, at);
      tl.to(fills[i], { scaleX: 1, duration: 0.8, ease: 'expo.out' }, at + 0.12);
      D.sfx('plip', at, 0.08, 520 + i * 130);
    });
    close(D, T, dur, c);
    return dur;
  });

  // ------------------------------------------------------------------ WRCOLORS
  recipe('wrcolors', (D, T, o) => {
    const { tl } = D;
    const dur = o.duration || 4.5, sw = (o.swatches || []).map(x => (Array.isArray(x) ? x : [x, ''])), many = sw.length > 8;
    const c = card(D, 'wrcolors', { ...o, shapes: false }, `
      <div class="wr-k mono">${o.kicker || ''}</div>
      <div class="wr-title v">${o.title || ''}</div>
      <div class="wr-sw${many ? ' is-many' : ''}">${sw.map(([hex, n]) => `<div class="wr-s" style="background:${hex};color:${inkOn(hex)}"><span class="mono">${n}</span><span class="mono">${hex.toUpperCase()}</span></div>`).join('')}</div>`);
    const head = D.$$('.wr-k, .wr-title', c.s), sws = D.$$('.wr-s', c.s), step = Math.min(0.28, 1.3 / Math.max(1, sws.length));
    D.fit(D.$('.wr-title', c.s), 920);
    gsap.set(sws, { scaleX: 0, transformOrigin: '0% 50%' });
    open(D, T, c, o);
    enter(D, head, T + 0.3);
    sws.forEach((e, i) => {
      tl.to(e, { scaleX: 1, duration: 0.6, ease: 'expo.inOut' }, T + 0.7 + i * step);
      if (i % 2 === 0) D.sfx('plip', T + 0.7 + i * step, 0.05, 480 + (i % 12) * 60);
    });
    close(D, T, dur, c);
    return dur;
  });

  // ------------------------------------------------------------------ WRSUMMARY
  recipe('wrsummary', (D, T, o) => {
    const dur = o.duration || 5.5, cardBg = o.cardBg || DARK, cardInk = inkOn(cardBg);
    const c = card(D, 'wrsummary', o, `
      <div class="wr-sum" style="background:${cardBg};color:${cardInk}">
        <div class="wr-k mono">${o.kicker || ''}</div>
        <div class="wr-sname v">${o.name || ''}</div>
        <div class="wr-grid">${(o.rows || []).map(([l, v]) => `<div><span class="mono">${l}</span><b class="v">${v}</b></div>`).join('')}</div>
        <div class="wr-strip">${(o.strip || []).map(h => `<i style="background:${h}"></i>`).join('')}</div>
      </div>
      ${o.cta ? `<div class="wr-btn mono" style="background:${cardBg};color:${cardInk}"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 4l8 8-8 8v-5c-6 0-9.5 1.8-12 6 1-6 4-11.5 12-12V4z"/></svg>${o.cta}</div>` : ''}`);
    const sum = D.$('.wr-sum', c.s), kids = D.$$('.wr-sum > *', c.s), btn = D.$('.wr-btn', c.s);
    D.fit(D.$('.wr-sname', c.s), 750);
    D.$$('.wr-grid b', c.s).forEach(e => D.fit(e, 370));
    open(D, T, c, o);
    motion(D, T, dur, c.sh);
    gsap.set(sum, { opacity: 0 });
    D.hit(sum, { opacity: 0, y: 260, rotation: -8, scale: 0.9 }, { opacity: 1, y: 0, rotation: -2, scale: 1, duration: 0.9, ease: 'back.out(1.3)' }, T + 0.3);
    enter(D, kids, T + 0.7, 0.09);
    if (btn) { gsap.set(btn, { opacity: 0 }); D.hit(btn, { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(2.4)' }, T + 1.9); D.sfx('key', T + 1.9, 0.3); }
    D.sfx('braam', T + 0.3, 0.45);
    D.sfx('boom', T + 0.3, 0.6);
    close(D, T, dur, c);
    return dur;
  });

  // ------------------------------------------------------------------ WRDECK
  // everyone's card, dealt fast: the same template with other data. Then the closing line.
  recipe('wrdeck', (D, T, o) => {
    const { tl } = D;
    const dur = o.duration || 8, cards = o.cards || [], f = nf(D, o.decimals || 0);
    const c = card(D, 'wrdeck', { ...o, shapes: false }, `
      <div class="wr-deck">${cards.map(x => `<div class="wr-mini${x.me ? ' is-me' : ''}" style="background:${x.bg};color:${inkOn(x.bg)}">
        <div class="wr-k mono">${o.kicker || ''}</div>
        <div class="wr-mname v">${x.name}</div>
        <div class="wr-mnum v">${f.format(x.value)}</div>
        <div class="wr-munit mono">${o.unit || ''}</div>
        <div class="wr-strip">${(x.strip || []).map(h => `<i style="background:${h}"></i>`).join('')}</div></div>`).join('')}</div>
      <div class="wr-end">${(o.lines || []).map(l => `<div class="wr-eline v">${l}</div>`).join('')}
        ${o.sub ? `<div class="wr-sub">${o.sub}</div>` : ''}${o.hint ? `<div class="wr-hint mono">${o.hint}</div>` : ''}</div>`,
      `<div class="wr-band">${cards.map(x => `<i style="background:${x.bg}"></i>`).join('')}</div>`);
    const band = D.$$('.wr-band i', c.s), minis = D.$$('.wr-mini', c.s), lines = D.$$('.wr-eline', c.s), endRest = D.$$('.wr-end .wr-sub, .wr-end .wr-hint', c.s), deck = D.$('.wr-deck', c.s);
    minis.forEach(m => D.fit(D.$('.wr-mname', m), 520));
    lines.forEach(e => D.fit(e, 940));
    open(D, T, c, o);
    // deal: slow at first, then a flurry, timed so the closing line lands at T + land (put it on a
    // bar). Deterministic: the angles come from the seeded rng.
    const land = o.land || 4, raw = minis.map((_, i) => Math.max(0.09, 0.34 * Math.pow(0.84, i)));
    const k = (land - 1.4) / Math.max(1e-6, raw.slice(0, -1).reduce((a, b) => a + b, 0));
    gsap.set(minis, { y: 1500, opacity: 0 });
    let at = T + 0.45;
    minis.forEach((m, i) => {
      const r = D.rnd(-9, 9);
      D.hit(m, { y: 1500, x: D.rnd(-120, 120), rotation: r * 3, opacity: 1 }, { y: 0, x: D.rnd(-40, 40), rotation: r, duration: 0.42, ease: 'expo.out' }, at);
      D.sfx('tick', at, 0.05);
      if (i % 3 === 0) D.sfx('plip', at, 0.05, 700 + (i % 9) * 50);
      at += raw[i] * k;
    });
    const L = T + land;
    // the stack flies off, the line lands
    tl.to(deck, { y: -1700, rotation: -12, duration: 0.6, ease: 'expo.in' }, L - 0.6);
    D.sfx('whoosh', L - 0.6, 0.6, 0.4);
    gsap.set(lines, { yPercent: 110, opacity: 0 });
    D.hit(lines, { yPercent: 110, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.8, ease: 'expo.out', stagger: 0.12 }, L);
    D.sfx('boom', L, 0.8);
    D.call(() => SFX.pad('wr-end', [130.81, 164.81, 196, 261.63], 1, 0.045, 1400), L);
    enter(D, endRest, L + 0.6, 0.15);
    // everyone's colour, one equal stripe each (identity, not data)
    gsap.set(band, { scaleY: 0, transformOrigin: '50% 100%' });
    tl.to(band, { scaleY: 1, duration: 0.8, ease: 'expo.out', stagger: { each: 0.03, from: 'center' } }, L + 0.2);
    const end = Math.max(dur, land + 3.8);
    D.barsTo(960, T + end - 0.9, 0.8);
    D.call(() => SFX.padStop('wr-end', 1.4), T + end - 0.9);
    close(D, T, end, c, true);
    return end;
  });

  /** JSON profile → scene list: the same film for anyone. Card colours cycle through
   *  profile.colors (never the same colour twice in a row). */
  function scenes(p) {
    const cols = p.colors, n = cols.length, dark = p.dark || DARK, out = [];
    let i = 0;
    const next = () => cols[i++ % n];
    out.push({ type: 'wrcover', label: p.coverLabel || 'PORTADA', colors: cols, bg: next(), k: 0, kicker: p.kicker, line1: p.line1, year: p.year, name: p.name, until: p.until });
    p.stats.forEach((x, k) => out.push({ type: 'wrstat', label: x.label || `CIFRA ${k + 1}`, colors: cols, bg: next(), k: k + 1, ...x }));
    if (p.top) out.push({ type: 'wrtop', label: 'TOP 5', colors: cols, bg: next(), k: out.length, ...p.top });
    if (p.palette) out.push({ type: 'wrcolors', label: 'COLORES', bg: dark, k: out.length, ...p.palette });
    if (p.summary) out.push({ type: 'wrsummary', label: 'RESUMEN', colors: cols, bg: next(), cardBg: dark, k: out.length, name: p.name, ...p.summary });
    if (p.deck) out.push({ type: 'wrdeck', label: 'TODOS', bg: dark, k: out.length, ...p.deck });
    return out;
  }

  Trailer.wrapped = { scenes, inkOn, ratio, vivid, sat };
})();
