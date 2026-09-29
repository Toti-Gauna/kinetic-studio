/* ============================================================================
   LOWER THIRDS MODULE — reusable broadcast graphics for any video.
   Every component is a recipe with an IN, a HOLD and an OUT, placed inside the
   title-safe area (10 % margins). Render one alone with a transparent background
   (cfg.transparent / ?alpha) or on a chroma key (?chroma=00b140) and export a PNG
   sequence with tools/frames.mjs for Premiere, Resolve, After Effects or Final Cut.
   A "plate" (cfg.plate) paints stand-in footage behind them for a showreel.
   Theme: cfg.lower = { accent, accent2, ink, paper, glass }.
   Recipes: ltreel, ltname (bar · line · block · pill), ltlocation, ltsocial,
   ltlive, ltchapter, ltcallout, ltwipe (iris · bars · shapes · blinds), ltindex.
   ========================================================================== */
(() => {
  'use strict';
  const { recipe } = Trailer;
  const TH = D => ({ accent: D.C.a[0], accent2: D.C.a[1], ink: D.C.ink, paper: D.C.paper, glass: 'rgba(12, 12, 16, .72)', ...(D.cfg.lower || {}) });
  const vars = th => Object.entries(th).map(([k, v]) => `--l-${k}:${v}`).join(';');
  const PIN = '<svg viewBox="0 0 40 52"><path class="lt-pinp" d="M20 50 C20 50 4 30 4 18 A16 16 0 1 1 36 18 C36 30 20 50 20 50 Z"/><circle cx="20" cy="18" r="6"/></svg>';
  const AT = '<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="8" fill="none" stroke="currentColor" stroke-width="4"/><path d="M28 20v3a5 5 0 0 0 10 0v-3A18 18 0 1 0 30 35" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg>';

  // ------------------------------------------------------------------ PLATE (showreel backdrop)
  // Stand-in "footage" on the canvas: slow soft light blobs, depth vignette; `split` shows a
  // checkerboard (= transparency) on the right part of the frame. Pure function of P.t.
  let P = null;
  Trailer.plugin({
    setup: (D, cfg) => {
      P = null;
      if (!cfg.plate || document.documentElement.classList.contains('is-alpha')) return;
      P = { alpha: 0, t: 0, split: 0 };
      const pal = cfg.plate.colors || ['#12324a', '#1d6b73', '#c9803a', '#6d3b7a'];
      D.layer(P, g => {
        const { W, H } = D, t = P.t;
        g.fillStyle = pal[0];
        g.fillRect(0, 0, W, H);
        pal.slice(1).forEach((c, i) => {
          const x = W * (0.3 + 0.4 * Math.sin(t * 0.13 + i * 2.1)), y = H * (0.45 + 0.3 * Math.cos(t * 0.11 + i * 1.7)), r = 520 + 140 * Math.sin(t * 0.2 + i);
          const gr = g.createRadialGradient(x, y, 0, x, y, r);
          gr.addColorStop(0, D.rgba(c, 0.85)); gr.addColorStop(1, D.rgba(c, 0));
          g.fillStyle = gr; g.fillRect(0, 0, W, H);
        });
        for (let i = 0; i < 14; i++) { // bokeh
          const x = ((i * 283 + t * (18 + i * 3)) % (W + 200)) - 100, y = 200 + ((i * 97) % 600), r = 30 + (i % 5) * 16;
          g.fillStyle = D.rgba('#ffffff', 0.05 + (i % 3) * 0.02);
          g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
        }
        const v = g.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.95);
        v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.55)');
        g.fillStyle = v; g.fillRect(0, 0, W, H);
        if (P.split > 0.001) { // checkerboard = "this is transparent"
          const x0 = W * (1 - P.split), S = 40;
          for (let y = 0; y < H; y += S) for (let x = Math.floor(x0 / S) * S; x < W; x += S) {
            g.fillStyle = ((x / S + y / S) % 2) ? '#d9d9d9' : '#ffffff';
            g.fillRect(Math.max(x, x0), y, S - Math.max(0, x0 - x), S);
          }
          g.fillStyle = 'rgba(255,255,255,.9)'; g.fillRect(x0 - 2, 0, 4, H);
        }
      });
    },
  });
  /** Showreel helpers: show the plate for a scene, and a small spec tag top-left. */
  function plateOn(D, T, dur, split) {
    if (!P) return;
    D.tl.set(P, { alpha: 1, split: split || 0 }, T);
    D.tl.to(P, { t: T + dur, duration: dur, ease: 'none' }, T);
  }
  function specTag(D, s, o, T, dur) {
    if (!o.tag) return;
    const el = document.createElement('div');
    el.className = 'lt-tag mono';
    el.innerHTML = o.tag;
    s.appendChild(el);
    gsap.set(el, { opacity: 0 });
    D.tl.to(el, { opacity: 1, duration: 0.3 }, T + 0.05);
    D.tl.to(el, { opacity: 0, duration: 0.3 }, T + dur - 0.35);
  }
  function scene(D, name, o, html) {
    const s = D.scene(name, `<div class="lt-root" style="${vars(TH(D))}">${html}</div>`);
    return { s, r: D.$('.lt-root', s) };
  }
  const HOLD = o => o.duration || 3.5;
  /** A scramble that is a pure function of its progress (same frames on every export):
   *  letters settle left to right; the rest cycle through `chars` by a hash of (index, step). */
  function scramble(D, el, text, at, dur, chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ') {
    const P = { p: 0 }, n = text.length;
    const paint = () => {
      const k = Math.floor(P.p * n), step = Math.floor(P.p * dur * 20);
      let out = text.slice(0, k);
      for (let i = k; i < n; i++) out += text[i] === ' ' ? ' ' : chars[Math.abs(Math.floor(Math.sin((i + 1) * 12.9898 + step * 78.233) * 43758.5453)) % chars.length];
      el.textContent = P.p >= 1 ? text : out;
    };
    el.textContent = '';
    D.tl.to(P, { p: 1, duration: dur, ease: 'none', onUpdate: paint }, at);
  }

  // ------------------------------------------------------------------ LTREEL (pack opener)
  recipe('ltreel', (D, T, o) => {
    const { tl } = D;
    const dur = o.duration || 4, th = TH(D);
    const { s } = scene(D, 'ltreel', o, `
      <div class="lt-rk mono c">${o.kicker || ''}</div>
      <div class="lt-rt v c">${o.title || D.cfg.meta.title}</div>
      <div class="lt-rs mono c">${o.sub || ''}</div>
      <div class="lt-rbar c"><i></i><i></i><i></i></div>`);
    const t = D.fit(D.$('.lt-rt', s), 1500), ch = D.split(t, { type: 'chars', mask: 'chars' }).chars, bars = D.$$('.lt-rbar i', s), k = D.$('.lt-rk', s), sub = D.$('.lt-rs', s);
    gsap.set(ch, { yPercent: 115 });
    gsap.set(bars, { scaleX: 0, transformOrigin: '0% 50%' });
    gsap.set([k, sub], { opacity: 0 });
    D.show(s, T);
    D.setBg(o.bg || th.ink, T);
    if (P) tl.set(P, { alpha: 0 }, T);
    if (o.open !== false) { tl.set(D.bars, { height: 540 }, T); D.barsTo(96, T + 0.05, 1.1); }
    if (o.label) D.label(T, o.label);
    tl.to(bars, { scaleX: 1, duration: 0.6, ease: 'expo.inOut', stagger: 0.1 }, T + 0.2);
    tl.to(ch, { yPercent: 0, duration: 0.8, ease: 'expo.out', stagger: 0.03 }, T + 0.5);
    tl.to(k, { opacity: 0.75, duration: 0.4 }, T + 0.4);
    const subText = o.subText || sub.textContent;
    tl.to(sub, { opacity: 0.8, duration: 0.2 }, T + 1.2);
    scramble(D, sub, subText, T + 1.2, 1.1);
    D.sfx('whoosh', T + 0.2, 0.7, 0.2);
    D.sfx('boom', T + 0.5, 0.6);
    tl.to(ch, { yPercent: -115, duration: 0.45, ease: 'expo.in', stagger: 0.015 }, T + dur - 0.6);
    tl.to([k, sub, ...bars], { opacity: 0, duration: 0.3 }, T + dur - 0.5);
    D.hide(s, T + dur);
    return dur;
  });

  // ------------------------------------------------------------------ LTNAME
  // Name + role in four styles: bar (colour block wipe), line (a rule draws, text slides out
  // of it), block (Bauhaus shapes + panel), pill (glass capsule grows out of an avatar).
  recipe('ltname', (D, T, o) => {
    const { tl } = D;
    const dur = HOLD(o), st = o.style || 'bar', side = o.align === 'right' ? 'is-right' : '';
    const initials = (o.name || '').split(/\s+/).map(w => w[0] || '').join('').slice(0, 2);
    const inner = {
      bar: `<div class="lt-n lt-bar ${side}"><div class="lt-nm"><span class="v">${o.name}</span></div><div class="lt-rl"><span>${o.role}</span></div></div>`,
      line: `<div class="lt-n lt-line ${side}"><i class="lt-rule"></i><div class="lt-mask"><div class="lt-nm v">${o.name}</div><div class="lt-rl">${o.role}</div></div></div>`,
      block: `<div class="lt-n lt-block ${side}"><div class="lt-sh"><i class="lt-sq"></i><i class="lt-ci"></i><i class="lt-tr"></i></div><div class="lt-pan"><div class="lt-nm v">${o.name}</div><div class="lt-rl mono">${o.role}</div></div></div>`,
      pill: `<div class="lt-n lt-pill ${side}"><div class="lt-av">${initials}</div><div class="lt-pb"><div class="lt-nm">${o.name}</div><div class="lt-rl">${o.role}</div></div></div>`,
    }[st];
    const { s, r } = scene(D, 'ltname', o, inner);
    const n = D.$('.lt-n', r);
    D.show(s, T);
    if (o.label) D.label(T, o.label);
    plateOn(D, T, dur, o.split);
    specTag(D, s, o, T, dur);
    const tIn = T + 0.15, tOut = T + dur - 0.8;
    if (st === 'bar') {
      const nm = D.$('.lt-nm', n), rl = D.$('.lt-rl', n), a = D.$('.lt-nm span', n), b = D.$('.lt-rl span', n);
      gsap.set([nm, rl], { clipPath: 'inset(0% 100% 0% 0%)' });
      gsap.set([a, b], { yPercent: 110 });
      tl.to(nm, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.5, ease: 'expo.inOut' }, tIn);
      tl.to(a, { yPercent: 0, duration: 0.6, ease: 'expo.out' }, tIn + 0.25);
      tl.to(rl, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.5, ease: 'expo.inOut' }, tIn + 0.2);
      tl.to(b, { yPercent: 0, duration: 0.6, ease: 'expo.out' }, tIn + 0.45);
      tl.to([a, b], { yPercent: -110, duration: 0.35, ease: 'expo.in', stagger: 0.05 }, tOut);
      tl.to([rl, nm], { clipPath: 'inset(0% 0% 0% 100%)', duration: 0.45, ease: 'expo.inOut', stagger: 0.06 }, tOut + 0.2);
    } else if (st === 'line') {
      const rule = D.$('.lt-rule', n), mask = D.$('.lt-mask', n), nm = D.$('.lt-nm', n), rl = D.$('.lt-rl', n);
      gsap.set(rule, { scaleY: 0, transformOrigin: '50% 100%' });
      gsap.set([nm, rl], { xPercent: -105 }); // they slide out of the rule (the mask clips them)
      tl.to(rule, { scaleY: 1, duration: 0.45, ease: 'expo.out' }, tIn);
      tl.to(nm, { xPercent: 0, duration: 0.7, ease: 'expo.out' }, tIn + 0.2);
      tl.to(rl, { xPercent: 0, duration: 0.7, ease: 'expo.out' }, tIn + 0.32);
      tl.to([rl, nm], { xPercent: -105, duration: 0.45, ease: 'expo.in', stagger: 0.05 }, tOut);
      tl.to(rule, { scaleY: 0, transformOrigin: '50% 0%', duration: 0.35, ease: 'expo.in' }, tOut + 0.35);
    } else if (st === 'block') {
      const shapes = D.$$('.lt-sh i', n), pan = D.$('.lt-pan', n), txt = D.$$('.lt-pan > *', n);
      gsap.set(shapes, { scale: 0, rotation: -90 });
      gsap.set(pan, { clipPath: 'inset(0% 100% 0% 0%)' });
      gsap.set(txt, { opacity: 0, x: -20 });
      tl.to(shapes, { scale: 1, rotation: 0, duration: 0.5, ease: 'back.out(2.2)', stagger: 0.08 }, tIn);
      tl.to(pan, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.55, ease: 'expo.inOut' }, tIn + 0.25);
      tl.to(txt, { opacity: 1, x: 0, duration: 0.5, ease: 'expo.out', stagger: 0.08 }, tIn + 0.5);
      tl.to(txt, { opacity: 0, duration: 0.25 }, tOut);
      tl.to(pan, { clipPath: 'inset(0% 0% 0% 100%)', duration: 0.45, ease: 'expo.inOut' }, tOut + 0.1);
      tl.to(shapes, { scale: 0, rotation: 90, duration: 0.35, ease: 'back.in(2)', stagger: 0.05 }, tOut + 0.3);
    } else {
      const av = D.$('.lt-av', n), pb = D.$('.lt-pb', n), txt = D.$$('.lt-pb > *', n);
      gsap.set(av, { scale: 0 });
      gsap.set(pb, { clipPath: 'inset(0% 100% 0% 0%)' });
      gsap.set(txt, { opacity: 0, y: 12 });
      tl.to(av, { scale: 1, duration: 0.45, ease: 'back.out(2.5)' }, tIn);
      tl.to(pb, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.6, ease: 'expo.inOut' }, tIn + 0.2);
      tl.to(txt, { opacity: 1, y: 0, duration: 0.45, ease: 'expo.out', stagger: 0.08 }, tIn + 0.55);
      tl.to(txt, { opacity: 0, duration: 0.2 }, tOut);
      tl.to(pb, { clipPath: 'inset(0% 100% 0% 0%)', duration: 0.45, ease: 'expo.inOut' }, tOut + 0.1);
      tl.to(av, { scale: 0, duration: 0.3, ease: 'back.in(2)' }, tOut + 0.45);
    }
    D.sfx('whoosh', tIn, 0.5, 0.12);
    D.sfx('tick', tIn + 0.3, 0.05);
    D.sfx('whoosh', tOut, 0.4, 0.08);
    D.hide(s, T + dur);
    return dur;
  });

  // ------------------------------------------------------------------ LTLOCATION
  recipe('ltlocation', (D, T, o) => {
    const { tl } = D;
    const dur = HOLD(o);
    const { s, r } = scene(D, 'ltlocation', o, `<div class="lt-loc"><div class="lt-pin">${PIN}</div><i class="lt-lr"></i><div class="lt-lt"><div class="lt-place v">${o.place}</div><div class="lt-det mono">${o.detail || ''}</div></div></div>`);
    const pin = D.$('.lt-pin', r), pinP = D.$('.lt-pinp', r), rule = D.$('.lt-lr', r), place = D.$('.lt-place', r), det = D.$('.lt-det', r);
    const ch = D.split(place, { type: 'chars', mask: 'chars' }).chars;
    gsap.set(pinP, { drawSVG: '0%' });
    gsap.set(pin, { y: -120, opacity: 0 });
    gsap.set(rule, { scaleY: 0 });
    gsap.set(ch, { yPercent: 115 });
    gsap.set(det, { opacity: 0 });
    D.show(s, T);
    if (o.label) D.label(T, o.label);
    plateOn(D, T, dur, o.split);
    specTag(D, s, o, T, dur);
    const tIn = T + 0.15, tOut = T + dur - 0.8;
    tl.to(pin, { y: 0, opacity: 1, duration: 0.6, ease: 'bounce.out' }, tIn);
    tl.to(pinP, { drawSVG: '100%', duration: 0.6, ease: 'power2.inOut' }, tIn + 0.1);
    tl.to(rule, { scaleY: 1, duration: 0.4, ease: 'expo.out' }, tIn + 0.4);
    tl.to(ch, { yPercent: 0, duration: 0.6, ease: 'expo.out', stagger: 0.025 }, tIn + 0.5);
    tl.to(det, { opacity: 1, duration: 0.2 }, tIn + 0.8);
    scramble(D, det, o.detail || '', tIn + 0.8, 0.9, '0123456789°′');
    D.sfx('plip', tIn + 0.55, 0.06, 800);
    tl.to(ch, { yPercent: -115, duration: 0.35, ease: 'expo.in', stagger: 0.01 }, tOut);
    tl.to([det, pin], { opacity: 0, duration: 0.3 }, tOut + 0.1);
    tl.to(rule, { scaleY: 0, duration: 0.3 }, tOut + 0.3);
    D.hide(s, T + dur);
    return dur;
  });

  // ------------------------------------------------------------------ LTSOCIAL
  recipe('ltsocial', (D, T, o) => {
    const { tl } = D;
    const dur = HOLD(o), handle = o.handle || '@usuario';
    const { s, r } = scene(D, 'ltsocial', o, `<div class="lt-soc"><div class="lt-sic">${AT}</div><div class="lt-stx"><div class="lt-sk mono">${o.kicker || ''}</div><div class="lt-sh2 v"><span class="lt-hv"></span><i class="lt-sc"></i></div><i class="lt-su"></i></div></div>`);
    const ic = D.$('.lt-sic', r), hv = D.$('.lt-hv', r), caret = D.$('.lt-sc', r), under = D.$('.lt-su', r), kick = D.$('.lt-sk', r), box = D.$('.lt-sh2', r);
    hv.textContent = handle; box.style.width = box.offsetWidth + 20 + 'px'; hv.textContent = '';
    gsap.set(ic, { scale: 0, rotation: -120 });
    gsap.set(under, { scaleX: 0, transformOrigin: '0% 50%' });
    gsap.set([kick, caret], { opacity: 0 });
    D.show(s, T);
    if (o.label) D.label(T, o.label);
    plateOn(D, T, dur, o.split);
    specTag(D, s, o, T, dur);
    const tIn = T + 0.15, tOut = T + dur - 0.8;
    tl.to(ic, { scale: 1, rotation: 0, duration: 0.6, ease: 'back.out(2)' }, tIn);
    tl.to(kick, { opacity: 0.8, duration: 0.3 }, tIn + 0.3);
    tl.set(caret, { opacity: 1 }, tIn + 0.35);
    const TT = { n: 0 };
    tl.to(TT, { n: handle.length, duration: handle.length * 0.05, ease: 'none', onUpdate: () => { hv.textContent = handle.slice(0, Math.round(TT.n)); } }, tIn + 0.4);
    for (let i = 0; i < handle.length; i += 2) D.sfx('key', tIn + 0.4 + i * 0.05, 0.12);
    tl.to(under, { scaleX: 1, duration: 0.5, ease: 'expo.inOut' }, tIn + 0.45 + handle.length * 0.05);
    tl.set(caret, { opacity: 0 }, tIn + 0.9 + handle.length * 0.05);
    tl.to([kick, box, under], { opacity: 0, y: 10, duration: 0.3, stagger: 0.04 }, tOut);
    tl.to(ic, { scale: 0, rotation: 120, duration: 0.35, ease: 'back.in(2)' }, tOut + 0.2);
    D.hide(s, T + dur);
    return dur;
  });

  // ------------------------------------------------------------------ LTLIVE
  // An "EN VIVO" badge with a pulsing dot + clock, and a news ticker crawling along the bottom.
  recipe('ltlive', (D, T, o) => {
    const { tl } = D;
    const dur = o.duration || 5, items = o.items || [];
    const crawl = items.map(x => `<span>${x}</span><i></i>`).join('');
    const { s, r } = scene(D, 'ltlive', o, `
      <div class="lt-live"><i class="lt-dot"></i><b>${o.badge || 'EN VIVO'}</b><span class="mono lt-lc">${o.clock || ''}</span></div>
      <div class="lt-tick"><div class="lt-tl v">${o.tickerLabel || 'ÚLTIMO'}</div><div class="lt-tw"><div class="lt-tc">${crawl}${crawl}</div></div></div>`);
    const badge = D.$('.lt-live', r), dot = D.$('.lt-dot', r), tick = D.$('.lt-tick', r), tc = D.$('.lt-tc', r), lab = D.$('.lt-tl', r);
    gsap.set(badge, { clipPath: 'inset(0% 100% 0% 0%)' });
    gsap.set(tick, { yPercent: 120 });
    gsap.set(lab, { xPercent: -100 });
    D.show(s, T);
    if (o.label) D.label(T, o.label);
    plateOn(D, T, dur, o.split);
    specTag(D, s, o, T, dur);
    const tIn = T + 0.15, tOut = T + dur - 0.7;
    tl.to(badge, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.5, ease: 'expo.inOut' }, tIn);
    for (let k = 0; k < Math.floor(dur / 0.5); k++) D.hit(dot, { opacity: 1, scale: 1.25 }, { opacity: 0.35, scale: 1, duration: 0.45, ease: 'sine.out' }, tIn + 0.3 + k * 0.5);
    tl.to(tick, { yPercent: 0, duration: 0.55, ease: 'expo.out' }, tIn + 0.2);
    tl.to(lab, { xPercent: 0, duration: 0.5, ease: 'expo.out' }, tIn + 0.5);
    tl.to(tc, { xPercent: -50, duration: Math.max(dur, 8), ease: 'none' }, tIn + 0.4);
    D.sfx('beep', tIn, 880, 0.12, 0.05);
    tl.to(badge, { clipPath: 'inset(0% 0% 0% 100%)', duration: 0.4, ease: 'expo.inOut' }, tOut);
    tl.to(tick, { yPercent: 120, duration: 0.45, ease: 'expo.in' }, tOut + 0.1);
    D.hide(s, T + dur);
    return dur;
  });

  // ------------------------------------------------------------------ LTCHAPTER
  recipe('ltchapter', (D, T, o) => {
    const { tl } = D;
    const dur = HOLD(o);
    const { s, r } = scene(D, 'ltchapter', o, `<div class="lt-ch c"><i class="lt-cl"></i><div class="lt-cn v">${o.num || '01'}</div><div class="lt-ct v">${o.title || ''}</div><i class="lt-cl"></i></div>`);
    const lines = D.$$('.lt-cl', r), num = D.$('.lt-cn', r), title = D.$('.lt-ct', r);
    D.fit(title, 1300);
    const ch = D.split(title, { type: 'chars', mask: 'chars' }).chars;
    gsap.set(lines, { scaleX: 0 });
    gsap.set(num, { opacity: 0, scale: 1.6 });
    gsap.set(ch, { yPercent: 115 });
    D.show(s, T);
    if (o.label) D.label(T, o.label);
    plateOn(D, T, dur, o.split);
    specTag(D, s, o, T, dur);
    const tIn = T + 0.15, tOut = T + dur - 0.8;
    tl.to(lines, { scaleX: 1, duration: 0.6, ease: 'expo.inOut' }, tIn);
    tl.to(num, { opacity: 1, scale: 1, duration: 0.6, ease: 'expo.out' }, tIn + 0.2);
    tl.to(ch, { yPercent: 0, duration: 0.7, ease: 'expo.out', stagger: 0.03 }, tIn + 0.4);
    D.sfx('boom', tIn + 0.2, 0.4);
    tl.to(ch, { yPercent: -115, duration: 0.4, ease: 'expo.in', stagger: 0.012 }, tOut);
    tl.to(num, { opacity: 0, scale: 0.8, duration: 0.35 }, tOut + 0.1);
    tl.to(lines, { scaleX: 0, duration: 0.4, ease: 'expo.in' }, tOut + 0.25);
    D.hide(s, T + dur);
    return dur;
  });

  // ------------------------------------------------------------------ LTCALLOUT
  // Point at something in the shot: a ring draws around the target, an elbow leader, a label.
  recipe('ltcallout', (D, T, o) => {
    const { tl } = D;
    const dur = HOLD(o), x = o.x ?? 1180, y = o.y ?? 420, lx = o.lx ?? x + 260, ly = o.ly ?? y - 180;
    const { s, r } = scene(D, 'ltcallout', o, `<svg class="lt-cso" viewBox="0 0 1920 1080"><circle class="lt-cr" cx="${x}" cy="${y}" r="${o.r || 70}"/><path class="lt-cp" d="M${x + (o.r || 70) * 0.72},${y - (o.r || 70) * 0.72} L${lx - 60},${ly} L${lx},${ly}"/></svg>
      <div class="lt-cb" style="left:${lx + 16}px;top:${ly - 36}px"><b class="v">${o.text || ''}</b>${o.sub ? `<span class="mono">${o.sub}</span>` : ''}</div>`);
    const ring = D.$('.lt-cr', r), path = D.$('.lt-cp', r), box = D.$('.lt-cb', r);
    gsap.set([ring, path], { drawSVG: '0%' });
    gsap.set(box, { clipPath: 'inset(0% 100% 0% 0%)' });
    D.show(s, T);
    if (o.label) D.label(T, o.label);
    plateOn(D, T, dur, o.split);
    specTag(D, s, o, T, dur);
    const tIn = T + 0.15, tOut = T + dur - 0.7;
    tl.to(ring, { drawSVG: '100%', duration: 0.5, ease: 'power2.inOut' }, tIn);
    tl.to(path, { drawSVG: '100%', duration: 0.4, ease: 'power2.inOut' }, tIn + 0.4);
    tl.to(box, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.5, ease: 'expo.out' }, tIn + 0.75);
    for (let k = 0; k < 2; k++) D.hit(ring, { scale: 1, svgOrigin: `${x} ${y}` }, { scale: 1.12, duration: 0.3, yoyo: true, repeat: 1, ease: 'sine.inOut' }, tIn + 1.2 + k * 0.8);
    D.sfx('tick', tIn, 0.06);
    D.sfx('plip', tIn + 0.75, 0.05, 900);
    tl.to(box, { clipPath: 'inset(0% 0% 0% 100%)', duration: 0.35, ease: 'expo.in' }, tOut);
    tl.to(path, { drawSVG: '100% 100%', duration: 0.3 }, tOut + 0.2);
    tl.to(ring, { drawSVG: '100% 100%', duration: 0.35 }, tOut + 0.3);
    D.hide(s, T + dur);
    return dur;
  });

  // ------------------------------------------------------------------ LTWIPE
  // Full-frame transitions: fully covered at the midpoint (cut your clips there).
  recipe('ltwipe', (D, T, o) => {
    const { tl, W, H } = D;
    const dur = o.duration || 1.5, st = o.style || 'iris', th = TH(D), mid = T + dur / 2, cols = o.colors || [th.accent, th.accent2, th.paper, th.ink];
    let html = '';
    if (st === 'iris') html = `<div class="lt-iris" style="background:${cols[0]}"></div>`;
    if (st === 'bars') html = Array.from({ length: 7 }, (_, i) => `<i class="lt-wb" style="left:${-300 + i * 340}px;background:${cols[i % 3]}"></i>`).join('');
    if (st === 'shapes') html = `<i class="lt-ws lt-w1" style="background:${cols[0]}"></i><i class="lt-ws lt-w2" style="background:${cols[1]}"></i><i class="lt-ws lt-w3" style="border-bottom-color:${cols[2]}"></i><i class="lt-ws lt-w4" style="background:${cols[3]}"></i>`;
    if (st === 'blinds') html = Array.from({ length: 9 }, (_, i) => `<i class="lt-wl" style="top:${(i * H) / 9}px;height:${H / 9 + 1}px;background:${cols[i % 2]}"></i>`).join('');
    const { s, r } = scene(D, 'ltwipe', o, `<div class="lt-wipe">${html}</div>`);
    const els = D.$$('.lt-wipe > *', r), a = dur / 2 - 0.05;
    D.show(s, T);
    if (o.label) D.label(T, o.label);
    plateOn(D, T, dur, o.split);
    specTag(D, s, o, T, dur);
    if (st === 'iris') {
      const e = els[0], R = Math.hypot(W, H);
      gsap.set(e, { left: W * 0.3, top: H * 0.6, scale: 0 });
      tl.to(e, { scale: R / 50 * 1.1, duration: a, ease: 'expo.in' }, T);
      tl.set(e, { left: W * 0.7, top: H * 0.4 }, mid);
      tl.to(e, { scale: 0, duration: a, ease: 'expo.out' }, mid);
    } else if (st === 'bars') {
      gsap.set(els, { xPercent: -260, skewX: -18 });
      tl.to(els, { xPercent: 0, duration: a, ease: 'expo.inOut', stagger: 0.03 }, T);
      tl.to(els, { xPercent: 260, duration: a, ease: 'expo.inOut', stagger: 0.03 }, mid);
    } else if (st === 'shapes') {
      gsap.set(els, { scale: 0, rotation: -45 });
      tl.to(els, { scale: 1, rotation: 0, duration: a, ease: 'back.out(1.2)', stagger: 0.06 }, T);
      tl.to(els, { scale: 0, rotation: 45, duration: a, ease: 'back.in(1.2)', stagger: 0.06 }, mid);
    } else {
      gsap.set(els, { scaleY: 0, transformOrigin: '50% 0%' });
      tl.to(els, { scaleY: 1, duration: a, ease: 'power3.in', stagger: 0.03 }, T);
      tl.to(els, { scaleY: 0, transformOrigin: '50% 100%', duration: a, ease: 'power3.out', stagger: 0.03 }, mid);
    }
    D.sfx('whoosh', T, dur * 0.8, 0.3);
    D.sfx('boom', mid, 0.35);
    D.hide(s, T + dur);
    return dur;
  });

  // ------------------------------------------------------------------ LTINDEX
  // The pack's contents, with the id to render each one alone.
  recipe('ltindex', (D, T, o) => {
    const { tl } = D;
    const dur = o.duration || 6, items = o.items || [];
    const { s } = scene(D, 'ltindex', o, `
      <div class="lt-ih"><div class="mono">${o.kicker || ''}</div><div class="v">${o.title || ''}</div></div>
      <div class="lt-il">${items.map(([id, name], i) => `<div class="lt-ii"><b class="mono">${String(i + 1).padStart(2, '0')}</b><span class="v">${name}</span><em class="mono">${id}</em></div>`).join('')}</div>
      ${o.cmd ? `<div class="lt-icmd mono"><span>$</span> ${o.cmd}</div>` : ''}`);
    const head = D.$$('.lt-ih > *', s), rows = D.$$('.lt-ii', s), cmd = D.$('.lt-icmd', s);
    gsap.set([...head, ...rows, cmd].filter(Boolean), { opacity: 0, x: -30 });
    D.show(s, T);
    D.setBg(o.bg || TH(D).ink, T);
    if (P) tl.set(P, { alpha: 0 }, T);
    if (o.label) D.label(T, o.label);
    tl.to(head, { opacity: 1, x: 0, duration: 0.6, ease: 'expo.out', stagger: 0.08 }, T + 0.1);
    tl.to(rows, { opacity: 1, x: 0, duration: 0.45, ease: 'expo.out', stagger: 0.07 }, T + 0.4);
    rows.forEach((_, i) => { if (i % 2 === 0) D.sfx('tick', T + 0.4 + i * 0.07, 0.04); });
    if (cmd) tl.to(cmd, { opacity: 1, x: 0, duration: 0.5, ease: 'expo.out' }, T + 0.5 + rows.length * 0.07);
    tl.to([...head, ...rows, cmd].filter(Boolean), { opacity: 0, duration: 0.4, stagger: 0.01 }, T + dur - 0.7);
    if (o.close !== false) { D.barsTo(540, T + dur - 0.9, 0.8); D.sfx('boom', T + dur - 0.1, 0.5); }
    D.hide(s, T + dur);
    return dur;
  });

  Trailer.lower = { TH, scramble };
})();
