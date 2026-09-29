/* ============================================================================
   TYPOGRAPHIC RECIPES — typewriter, stack, specimen, rules, ticker.
   Same contract as recipes.js: (D, T, o) => durationSeconds, everything placed
   on D.tl. Inside display text, a bare <i>…</i> renders in the editorial serif
   italic (fonts.serif) — the classic grotesk + italic-serif contrast.
   ========================================================================== */
(() => {
  'use strict';
  const { recipe } = Trailer;
  const pad2 = n => String(n).padStart(2, '0');
  const plain = html => String(html).replace(/<[^>]+>/g, '').replace(/^\*/, '');

  // ------------------------------------------------------------------ TYPEWRITER
  // A caret blinks, the lines are typed with a human rhythm, the <em> word gets
  // selected, everything else is backspaced, and the selection becomes the next
  // frame (o.to).                                                  ≈ 5.5–7 s (by text length)
  recipe('typewriter', (D, T, o) => {
    const { tl, C, N } = D;
    const lines = (o.lines || ['TODO EMPIEZA', 'CON UNA <em>PALABRA</em>.']).slice(0, 3);
    const bgc = o.bg || C.night, to = o.to || C.paper;
    const s = D.scene('typewriter', `<i class="tw-mark"></i><div class="tw mono c">${lines.map(l => `<div class="tw-line">${l}</div>`).join('')}</div><i class="tw-caret"></i>`);
    const box = D.fit(D.$('.tw', s), 1640), caret = D.$('.tw-caret', s), mark = D.$('.tw-mark', s), em = D.$('em', s);
    box.style.color = D.contrast(bgc);
    const chars = D.split(box, { type: 'chars' }).chars;
    const cb = chars.map(c => D.box(c));
    const lineOf = chars.map(c => c.closest('.tw-line'));
    gsap.set(chars, { opacity: 0 });
    gsap.set(caret, { x: cb[0].x - 4, y: cb[0].y, height: cb[0].h, opacity: 0, backgroundColor: D.contrast(bgc) });

    D.show(s, T);
    D.setBg(bgc, T);
    D.ink(D.contrast(bgc), T);
    if (o.label) D.label(T + 0.8, o.label);
    D.call(() => SFX.pad('typewriter', [55, 82.41], 3, 0.05, 240), T + 0.02);
    tl.set(caret, { opacity: 1 }, T + 0.3);

    let t = T + 0.9;
    chars.forEach((c, i) => {
      if (i > 0) {
        if (lineOf[i] !== lineOf[i - 1]) t += 0.45;                                       // new line
        else if (cb[i].x - (cb[i - 1].x + cb[i - 1].w) > cb[i].w * 0.3) t += 0.05;        // a space
      }
      tl.set(c, { opacity: 1 }, t);
      tl.set(caret, { x: cb[i].x + cb[i].w + 3, y: cb[i].y }, t);
      D.sfx('key', t, 0.15);
      t += (0.05 + D.rand() * 0.06) / (o.speed || 1) + (/[.,;:!?]/.test(c.textContent) ? 0.3 : 0);
    });

    let end;
    const tSel = t + 0.35;
    if (em) {
      const eb = D.box(em), m = { x: eb.x - 12, y: eb.y - 6, w: eb.w + 24, h: eb.h + 12 };
      gsap.set(mark, { x: m.x, y: m.y, width: m.w, height: m.h, scaleX: 0, transformOrigin: '0% 50%', backgroundColor: to });
      tl.to(mark, { scaleX: 1, duration: 0.45, ease: 'expo.out' }, tSel);
      tl.to(em, { color: D.contrast(to), duration: 0.01, ease: 'none' }, tSel + 0.08);
      D.sfx('bell', tSel, N.A5, 0.1);
      const rest = chars.filter(c => !em.contains(c)).reverse();
      const tDel = tSel + 0.7;
      tl.set(caret, { opacity: 0 }, tDel);
      rest.forEach((c, k) => {
        tl.set(c, { opacity: 0 }, tDel + k * 0.022);
        if (k % 3 === 0) D.sfx('key', tDel + k * 0.022, 0.08);
      });
      // the selection grows into the next frame
      const tW = tDel + rest.length * 0.022 + 0.3;
      tl.set(D.wipe, { backgroundColor: to, clipPath: `inset(${m.y}px ${D.W - m.x - m.w}px ${D.H - m.y - m.h}px ${m.x}px)`, autoAlpha: 1 }, tW);
      tl.set(mark, { opacity: 0 }, tW);
      tl.to(D.wipe, { clipPath: 'inset(0px 0px 0px 0px)', duration: 0.6, ease: 'expo.inOut' }, tW);
      tl.to(em, { opacity: 0, duration: 0.25 }, tW + 0.25);
      D.sfx('whoosh', tW, 0.7, 0.4);
      D.ink(D.contrast(to), tW + 0.3);
      end = tW + 0.6;
      D.setBg(to, end);
      tl.set(D.wipe, { autoAlpha: 0 }, end);
    } else {
      tl.to(box, { opacity: 0, duration: 0.4 }, tSel + 0.6);
      tl.set(caret, { opacity: 0 }, tSel + 0.6);
      end = tSel + 1.1;
    }
    D.call(() => SFX.padStop('typewriter', 2), end - 0.2);
    D.hide(s, end);
    return end - T;
  });

  // ------------------------------------------------------------------ STACK
  // Swiss-poster word stacks. Every line is justified to the same width with the
  // variable WIDTH axis (short words go wide, long ones condensed); lines slide in
  // from alternating sides while their width expands. '*LINE' = accent colour.
  //                                                                  stacks × hold (2.5 s)
  recipe('stack', (D, T, o) => {
    const { tl, C } = D;
    const bgc = o.bg || C.paper, fg = o.fg || D.contrast(bgc), accent = o.accent || C.a[0];
    const hold = o.hold || 2.5, WT = o.width || 1760, HB = o.height || 860;
    const stacks = o.stacks || [['LA LETRA', 'ES', '*IMAGEN']];
    const s = D.scene('stack', `<div class="sk-cap mono"></div>` + stacks.map(st =>
      `<div class="sk">${st.map(l => `<div class="sk-mask"><div class="sk-line v${l[0] === '*' ? ' is-accent' : ''}">${l.replace(/^\*/, '')}</div></div>`).join('')}</div>`).join(''));
    s.style.color = fg;
    s.style.setProperty('--accent', accent);
    const cap = D.$('.sk-cap', s);

    const width = (el, wd) => { el.style.setProperty('--wd', wd); return el.offsetWidth; };
    const groups = D.$$('.sk', s).map(sk => {
      const ls = D.$$('.sk-line', sk);
      const fs = Math.min(o.maxSize || 280, HB / ls.length / 0.86);
      ls.forEach(el => {
        let size = fs;
        el.style.fontSize = size + 'px';
        let w62 = width(el, 62);
        if (w62 > WT) { size *= WT / w62; el.style.fontSize = size + 'px'; w62 = width(el, 62); }
        const w125 = width(el, 125);
        let wd = w125 <= WT ? 125 : 62 + ((WT - w62) / (w125 - w62)) * 63;
        for (let k = 0; k < 2 && wd > 62 && wd < 125; k++) {           // refine: width isn't linear in wdth
          const w = width(el, wd);
          wd = Math.max(62, Math.min(125, wd + ((WT - w) / (w125 - w62)) * 63));
        }
        el.dataset.wd = wd.toFixed(2);
        el.style.setProperty('--wd', el.dataset.wd);
        // let descenders (g, q, y, commas) show below the tight .86 leading without changing the layout
        const m = el.parentElement, pad = +(size * 0.24).toFixed(1);
        m.style.paddingBottom = pad + 'px';
        m.style.marginBottom = -pad + 'px';
      });
      sk.style.top = ((D.H - sk.offsetHeight) / 2 + (o.offsetY ?? 24)) + 'px';
      return ls;
    });

    D.show(s, T);
    D.setBg(bgc, T);
    D.ink(fg, T);
    const num = o.label ? D.label(T, o.label) : '00';
    // hidden lines park a full stack-width away: a short line shifted by its own width would still sit inside the mask
    const OFF = WT + 240;
    groups.forEach((ls, k) => {
      const t0 = T + k * hold;
      ls.forEach((el, i) => {
        const dir = i % 2 ? 1 : -1;
        gsap.set(el, { x: dir * OFF, '--wd': 62 });
        tl.to(el, { x: 0, duration: 0.75, ease: 'expo.out' }, t0 + i * 0.12);
        tl.to(el, { '--wd': +el.dataset.wd, duration: 1.1, ease: 'expo.inOut' }, t0 + i * 0.12 + 0.1);
        tl.to(el, { x: -dir * OFF, duration: 0.42, ease: 'expo.in' }, t0 + hold - 0.5 + i * 0.04);
        D.sfx('tick', t0 + i * 0.12, 0.05);
      });
      tl.to(cap, { duration: 0.5, scrambleText: { text: `${num}.${k + 1} — ${plain(stacks[k].map(plain).join(' '))}`, chars: 'upperCase', speed: 0.8 }, ease: 'none' }, t0);
      for (let b = 0; b < hold / 0.5; b++) {
        const tb = t0 + b * 0.5;
        D.sfx('kick', tb, b ? 0.75 : 0.95);
        D.sfx('hat', tb + 0.25);
        if (b % 2) D.sfx('clap', tb, 0.3);
        D.sfx('bass', tb, [55, 55, 65.41, 49][k % 4] * (b % 2 ? 2 : 1), 0.26);
      }
    });
    D.hide(s, T + stacks.length * hold);
    return stacks.length * hold;
  });

  // ------------------------------------------------------------------ SPECIMEN
  // A living type-specimen sheet: giant "Aa", a glyph grid and two axis sliders
  // (WDTH, WGHT) whose knobs and readouts drive the font in real time.   6 s
  recipe('specimen', (D, T, o) => {
    const { tl, C, N } = D;
    const bgc = o.bg || C.night, fg = D.contrast(bgc), accent = o.accent || C.a[0];
    const glyphs = [...(o.glyphs || 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ&0123456789?!')].slice(0, 40);
    const COLS = 8, ROWS = Math.ceil(glyphs.length / COLS), TRACK = 520;
    const name = (o.name || D.cfg.fonts.display).toUpperCase();
    const s = D.scene('specimen', `
      <div class="sp-head mono"></div>
      <div class="sp-aa v">${o.sample || 'Aa'}</div>
      <div class="sp-grid">${glyphs.map(g => `<span class="v">${g}</span>`).join('')}</div>
      <div class="sp-axes mono">
        <div class="sp-axis"><span>WDTH</span><i class="sp-track"><b></b></i><em>100</em></div>
        <div class="sp-axis"><span>WGHT</span><i class="sp-track"><b></b></i><em>900</em></div>
      </div>`);
    s.style.color = fg;
    s.style.setProperty('--accent', accent);
    const aa = D.$('.sp-aa', s), cells = D.$$('.sp-grid span', s), head = D.$('.sp-head', s), axes = D.$('.sp-axes', s);
    const [k1, k2] = D.$$('.sp-track b', s), [r1, r2] = D.$$('.sp-axis em', s);
    const kx1 = wd => ((wd - 62) / 63) * TRACK, kx2 = wg => ((wg - 100) / 800) * TRACK;
    const A = { wd: 100, wg: 900 };
    const upd = () => { r1.textContent = pad2(Math.round(A.wd)).padStart(3, '0'); r2.textContent = String(Math.round(A.wg)).padStart(3, '0'); };
    gsap.set(aa, { '--wd': 100, '--wg': 900, opacity: 0, scale: 0.85, transformOrigin: '0% 50%' });
    gsap.set(cells, { '--wd': 100, '--wg': 900, opacity: 0, scale: 0.4 });
    gsap.set(k1, { x: kx1(100) });
    gsap.set(k2, { x: kx2(900) });
    gsap.set(axes, { opacity: 0 });
    const G = { grid: [ROWS, COLS] };
    const axis = (at, wd, wg, dur, ease = 'expo.inOut') => {
      tl.to(aa, { '--wd': wd, '--wg': wg, duration: dur, ease }, at);
      tl.to(A, { wd, wg, duration: dur, ease, onUpdate: upd }, at);
      tl.to(k1, { x: kx1(wd), duration: dur, ease }, at);
      tl.to(k2, { x: kx2(wg), duration: dur, ease }, at);
    };

    D.show(s, T);
    D.setBg(bgc, T);
    D.ink(fg, T);
    if (o.label) D.label(T, o.label);
    tl.to(head, { duration: 0.8, scrambleText: { text: `SPECIMEN — ${name} · VARIABLE`, chars: 'upperCase', speed: 0.8 }, ease: 'none' }, T);
    tl.to(aa, { opacity: 1, scale: 1, duration: 0.9, ease: 'expo.out' }, T + 0.1);
    tl.to(cells, { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(2.5)', stagger: { ...G, from: 'start', amount: 0.7 } }, T + 0.2);
    tl.to(axes, { opacity: 1, duration: 0.6 }, T + 0.5);

    axis(T + 1.0, 62, 900, 0.8);
    axis(T + 1.8, 125, 900, 1.0);
    axis(T + 2.9, 125, 100, 0.8);
    axis(T + 3.7, 100, 900, 0.9);
    axis(T + 4.7, 62, 300, 0.45, 'power3.inOut');
    axis(T + 5.15, 100, 900, 0.35, 'expo.out');
    tl.to(cells, { '--wd': 62, duration: 0.4, ease: 'power2.inOut', stagger: { ...G, from: 'start', amount: 0.6 } }, T + 1.0);
    tl.to(cells, { '--wd': 125, duration: 0.4, ease: 'power2.inOut', stagger: { ...G, from: 'start', amount: 0.6 } }, T + 1.8);
    tl.to(cells, { '--wd': 100, '--wg': 150, duration: 0.4, ease: 'power2.inOut', stagger: { ...G, from: 'center', amount: 0.6 } }, T + 2.9);
    tl.to(cells, { '--wg': 900, duration: 0.4, ease: 'power2.inOut', stagger: { ...G, from: 'center', amount: 0.6 } }, T + 3.7);
    const hi = cells.find(c => c.textContent === (o.highlight || 'Ñ'));
    if (hi) {
      tl.to(hi, { color: accent, duration: 0.01, ease: 'none' }, T + 4.25);
      D.hit(hi, { scale: 1.6 }, { scale: 1, duration: 0.7, ease: 'elastic.out(1, 0.4)' }, T + 4.25);
      D.sfx('bell', T + 4.25, N.A5, 0.12);
    }
    tl.to([aa, head, axes, ...cells], { opacity: 0, duration: 0.35, ease: 'power2.in', stagger: 0.004 }, T + 5.55);

    [1.0, 1.8, 2.9, 3.7].forEach(dt => D.sfx('whoosh', T + dt, 0.8, 0.25));
    for (let b = 0; b < 11; b++) { D.sfx('kick', T + 0.5 + b * 0.5, b % 2 ? 0.6 : 0.85); D.sfx('hat', T + 0.75 + b * 0.5, 0.14); }
    D.hide(s, T + 6);
    return 6;
  });

  // ------------------------------------------------------------------ RULES
  // Numbered manifesto points: a giant rolling odometer number, the statement
  // revealed line by line, a colour cut per point, a progress rail.   n × step (2 s)
  recipe('rules', (D, T, o) => {
    const { tl, C, N } = D;
    const step = o.step || 2;
    const schemes = [[C.paper, C.a[0]], [C.ink, C.a[0]], [C.a[0], C.ink], [C.a[1], C.a[3]], [C.paper, C.a[1]], [C.ink, C.a[3]]];
    const rules = o.rules.map((r, i) => {
      const [sbg, snum] = schemes[i % schemes.length];
      const bg = r.bg || sbg, num = r.num || snum;
      return { cut: i % 2 ? 'up' : false, ...r, bg, num, fg: r.fg || D.contrast(bg), accent: r.accent || num };
    });
    const n = rules.length;
    const strip = Array.from({ length: 10 }, (_, d) => `<span>${d}</span>`).join('');
    const s = D.scene('rules', `
      <div class="ru-head mono"></div>
      <div class="ru-num v"><span class="od"><span class="od-strip">${strip}</span></span><span class="od"><span class="od-strip">${strip}</span></span></div>
      <div class="ru-texts">${rules.map(r => `<div class="ru-text v" style="--accent:${r.accent}">${r.text}</div>`).join('')}</div>
      <div class="ru-prog">${rules.map(() => '<i><b></b></i>').join('')}</div>`);
    const head = D.$('.ru-head', s), numEl = D.$('.ru-num', s), [tens, ones] = D.$$('.od-strip', s);
    const texts = D.$$('.ru-text', s), bars = D.$$('.ru-prog b', s), prog = D.$('.ru-prog', s);
    const splits = texts.map(el => D.split(el, { type: 'lines', mask: 'lines' }));
    splits.forEach(sp => gsap.set(sp.lines, { yPercent: 110 }));
    gsap.set(bars, { scaleX: 0, transformOrigin: '0% 50%' });

    D.show(s, T);
    if (o.label) D.label(T, o.label);
    const title = o.head || 'MANIFIESTO', unit = o.unit || 'REGLA';
    const roots = [55, 43.65, 65.41, 49], mel = [440, 523.25, 659.25, 587.33, 783.99, 880];
    rules.forEach((r, i) => {
      const t = T + i * step, v = i + 1;
      if (i === 0 || !r.cut) D.setBg(r.bg, t); else D.wipeTo(r.bg, t - 0.22, r.cut);
      tl.to([D.hud, head, prog, ...texts], { color: r.fg, duration: 0.01, ease: 'none' }, t);
      tl.to(numEl, { color: r.num, duration: 0.01, ease: 'none' }, t);
      const tr = Math.max(T, t - 0.15);
      tl.to(ones, { yPercent: -(v % 10) * 10, duration: 0.7, ease: 'expo.inOut' }, tr);
      tl.to(tens, { yPercent: -Math.floor(v / 10) * 10, duration: 0.7, ease: 'expo.inOut' }, tr);
      tl.to(splits[i].lines, { yPercent: 0, duration: 0.8, ease: 'expo.out', stagger: 0.08 }, t + 0.05);
      tl.to(splits[i].lines, { yPercent: -110, duration: 0.35, ease: 'expo.in', stagger: 0.03 }, t + step - 0.42);
      tl.to(bars[i], { scaleX: 1, duration: step, ease: 'none' }, t);
      tl.to(head, { duration: 0.45, scrambleText: { text: `${title} · ${unit} ${pad2(v)} / ${pad2(n)}`, chars: '0123456789', speed: 1 }, ease: 'none' }, t);

      [0, 0.08, 0.16, 0.24].forEach(dt => D.sfx('tick', tr + dt, 0.04));
      D.sfx('bell', t, mel[i % mel.length], 0.12);
      for (let b = 0; b < step / 0.5; b++) {
        const tb = t + b * 0.5;
        D.sfx('kick', tb, b ? 0.75 : 0.95);
        D.sfx('hat', tb + 0.25);
        if (b % 2) D.sfx('clap', tb, 0.32);
        D.sfx('bass', tb, roots[i % roots.length] * (b % 2 ? 2 : 1), 0.28);
      }
    });
    const end = T + n * step;
    tl.to([numEl, prog, head], { opacity: 0, duration: 0.3, ease: 'power2.in' }, end - 0.4);
    D.hide(s, end);
    return n * step;
  });

  // ------------------------------------------------------------------ TICKER
  // Tilted marquee rows of one phrase, alternating direction and style
  // (fill / outline / accent), accelerating until a hard freeze-frame hit.   5 s
  recipe('ticker', (D, T, o) => {
    const { tl, C } = D;
    const text = o.text || 'NADA ESTÁ QUIETO';
    const dur = o.duration || 5, rowsN = o.rows || 8, angle = o.angle ?? -8;
    const bgc = o.bg || C.ink, fg = D.contrast(bgc), accent = o.accent || C.a[0];
    const styles = o.styles || ['fill', 'outline', 'accent', 'outline'];
    const unit = `<span>${text}<b class="tk-dot"></b></span>`;
    const center = Math.floor(rowsN / 2);
    const s = D.scene('ticker', `<div class="tk c">${Array.from({ length: rowsN }, (_, r) =>
      `<div class="tk-row v s-${r === center ? 'hero' : styles[r % styles.length]}">${unit}</div>`).join('')}</div>`);
    s.style.color = fg;
    s.style.setProperty('--accent', accent);
    s.style.setProperty('--stroke', fg);
    const wrap = D.$('.tk', s), rows = D.$$('.tk-row', s);
    const uw = rows[0].firstElementChild.offsetWidth;
    rows.forEach(r => { r.innerHTML = unit.repeat(Math.ceil(12000 / uw)); });
    gsap.set(wrap, { rotation: angle });

    D.show(s, T);
    D.setBg(bgc, T);
    D.ink(fg, T);
    if (o.label) D.label(T, o.label);
    const tStop = T + dur - 0.8;
    rows.forEach((r, i) => {
      const dir = i % 2 ? 1 : -1, off = -((i * 0.37) % 1) * uw;
      gsap.set(r, { x: off });
      tl.to(r, { x: off + dir * uw * (o.speed || 2.2), duration: tStop - T, ease: 'power2.in' }, T);
    });
    // freeze frame
    tl.to(rows[center], { color: accent, duration: 0.01, ease: 'none' }, tStop);
    D.hit(wrap, { scale: 1.07 }, { scale: 1, duration: 0.6, ease: 'expo.out' }, tStop);
    D.flash(tStop, 0.35, 0.4);
    D.shake(tStop, 0.4, 14);
    D.sfx('boom', tStop, 0.9);
    D.sfx('crash', tStop, 0.25);
    D.flash(T + dur - 0.12, 0.9, 0.3);

    D.sfx('whoosh', T, 1.2, 0.4);
    D.sfx('riser', T + 0.4, tStop - T - 0.4, 0.35);
    for (let k = 0; k < 4; k++) D.sfx('kick', T + k * 0.5, 0.85);
    for (let k = 0; k < Math.round((tStop - T - 2) / 0.25); k++) D.sfx('kick', T + 2 + k * 0.25, 0.8);
    D.hide(s, T + dur);
    return dur;
  });
})();
