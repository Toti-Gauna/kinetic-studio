/* ============================================================================
   NOIR MODULE — black-and-white thrillers.
   One shared canvas layer (Trailer.noir.state(D)) paints, as pure functions of its
   tweened params: rain (slanted streaks, brighter inside a streetlamp's volumetric
   cone), puddle ripples, drifting fog, smoke wisps, venetian-blind light bands on a
   wall with volumetric shafts and dust motes, rain drops sliding down a window over
   out-of-focus city lights, a lightning bolt, and serif text that can be lit only
   where the blind bands fall. Titles in a serif (Instrument Serif), not Bauhaus.
   Recipes: nrstreet, nrcards, nrblinds, nrwindow, nrtitle, nrcredits.
   ========================================================================== */
(() => {
  'use strict';
  const { recipe } = Trailer;
  const RAIN_N = 1400, GLASS_N = 70, DOTS_N = 320, BOKEH_N = 26, DUST_N = 180, WISPS = 5;
  const frac = x => x - Math.floor(x);
  const SERIF = D => `"${D.cfg.fonts.serif || 'Instrument Serif'}"`;

  // ------------------------------------------------------------------ THE SHARED LAYER
  function noir(D) {
    if (D._noir) return D._noir;
    const { W, H } = D, R = D.rand;
    const S = {
      drops: Array.from({ length: RAIN_N }, () => ({ x: R() * (W + 600) - 300, y: R() * (H + 200), sp: 1500 + R() * 900, len: 26 + R() * 60, a: 0.15 + R() * 0.35, z: R() })),
      ripples: Array.from({ length: 60 }, () => ({ x: R() * W, y: H - 150 + R() * 140, ph: R(), rate: 0.8 + R() * 1.4, s: 0.6 + R() * 0.8 })),
      glass: Array.from({ length: GLASS_N }, () => ({ x: R() * W, y0: R() * H, r: 6 + R() * 14, f: 0.3 + R() * 0.8, ph: R() * 6.28, v: 40 + R() * 140 })),
      dots: Array.from({ length: DOTS_N }, () => ({ x: R() * W, y: R() * H, r: 1 + R() * 4 })),
      bokeh: Array.from({ length: BOKEH_N }, () => ({ x: R() * W, y: 160 + R() * 760, r: 40 + R() * 120, a: 0.05 + R() * 0.16, sp: 4 + R() * 12, g: Math.round(150 + R() * 105) })),
      dust: Array.from({ length: DUST_N }, () => ({ x: R() * W, y: R() * H, sp: 6 + R() * 14, ph: R() * 6.28, r: 0.8 + R() * 2 })),
      bolt: (() => { const p = [[420 + R() * 300, -20]]; for (let i = 0; i < 14; i++) { const [x, y] = p[p.length - 1]; p.push([x + (R() - 0.45) * 90, y + 34 + R() * 26]); } return p; })(),
    };
    const N = {
      alpha: 0, t: 0, rain: 0, wind: 0.16, lamp: 0, lampX: 1340, lampY: 170, ground: 0, fog: 0,
      wall: 0, blinds: 0, shift: 0, dust: 0, glass: 0, bokeh: 0, smoke: 0, smokeX: 1560, smokeY: 900,
      bolt: 0, flash: 0, search: 0, searchX: 960, texts: [], counts: { rain: RAIN_N, glass: GLASS_N, wisps: WISPS },
    };
    D._noir = N;
    D.layer(N, g => draw(g, N, S, D));
    return N;
  }
  // the blind bands: slanted stripes (path in stage space)
  function bandsPath(g, N, W, H) {
    const P = 70, bw = 42, off = frac(N.shift / P) * P;
    g.save();
    g.translate(W * 0.56, H * 0.5);
    g.rotate(-0.33);
    g.beginPath();
    for (let y = -1000 + off; y < 1000; y += P) g.rect(-760, y, 1520, bw);
    g.restore();
  }
  function litAt(N, W, H, x, y) { // is (x, y) inside a band?
    const dx = x - W * 0.56, dy = y - H * 0.5, c = Math.cos(0.33), s = Math.sin(0.33);
    const u = dx * c - dy * s, v = dx * s + dy * c; // rotate by +0.33
    if (Math.abs(u) > 760) return false;
    return frac((v + 1000 - frac(N.shift / 70) * 70) / 70) * 70 < 42;
  }
  function draw(g, N, S, D) {
    const { W, H } = D, t = N.t, A0 = g.globalAlpha;
    // wall (interior)
    if (N.wall > 0.003) {
      const wg = g.createLinearGradient(0, 0, W, H);
      wg.addColorStop(0, '#1d1d1d'); wg.addColorStop(1, '#0b0b0b');
      g.globalAlpha = A0 * N.wall; g.fillStyle = wg; g.fillRect(0, 0, W, H); g.globalAlpha = A0;
    }
    // out-of-focus city lights behind a window
    if (N.bokeh > 0.003) {
      for (const b of S.bokeh) {
        const x = frac((b.x + b.sp * t) / (W + 300)) * (W + 300) - 150, gr = g.createRadialGradient(x, b.y, 0, x, b.y, b.r);
        gr.addColorStop(0, `rgba(${b.g},${b.g},${b.g},${b.a * N.bokeh * 1.6})`); gr.addColorStop(0.7, `rgba(${b.g},${b.g},${b.g},${b.a * N.bokeh})`); gr.addColorStop(1, `rgba(${b.g},${b.g},${b.g},0)`);
        g.fillStyle = gr; g.fillRect(x - b.r, b.y - b.r, b.r * 2, b.r * 2);
      }
    }
    // venetian-blind light on the wall + volumetric shafts
    if (N.blinds > 0.003) {
      g.save();
      g.globalCompositeOperation = 'lighter';
      for (let k = 0; k < 6; k++) { // shafts from the window (off frame, top left)
        const sg = g.createLinearGradient(-200, -200, W * 0.6, H * 0.7);
        sg.addColorStop(0, `rgba(255,255,255,${0.07 * N.blinds})`); sg.addColorStop(1, 'rgba(255,255,255,0)');
        g.fillStyle = sg;
        const o = k * 150 + frac(N.shift / 70) * 40;
        g.beginPath(); g.moveTo(-200, -150 + k * 40); g.lineTo(-200, -110 + k * 40); g.lineTo(W * 0.35 + o, H * 0.95); g.lineTo(W * 0.35 + o - 60, H * 0.95); g.closePath(); g.fill();
      }
      bandsPath(g, N, W, H);
      const bg = g.createLinearGradient(0, 0, W, 0);
      bg.addColorStop(0, `rgba(255,255,255,${0.5 * N.blinds})`); bg.addColorStop(1, `rgba(255,255,255,${0.12 * N.blinds})`);
      g.fillStyle = bg;
      g.filter = 'blur(6px)';
      g.fill();
      g.filter = 'none';
      g.restore();
    }
    // streetlamp: head halo, volumetric cone, pool of light
    if (N.lamp > 0.003) {
      const { lampX: lx, lampY: ly } = N;
      g.save();
      g.globalCompositeOperation = 'lighter';
      const cg = g.createLinearGradient(0, ly, 0, H);
      cg.addColorStop(0, `rgba(255,255,255,${0.24 * N.lamp})`); cg.addColorStop(1, `rgba(255,255,255,${0.04 * N.lamp})`);
      g.fillStyle = cg;
      g.beginPath(); g.moveTo(lx - 18, ly); g.lineTo(lx - 360, H); g.lineTo(lx + 360, H); g.lineTo(lx + 18, ly); g.closePath(); g.fill();
      const hg = g.createRadialGradient(lx, ly, 0, lx, ly, 110);
      hg.addColorStop(0, `rgba(255,255,255,${0.9 * N.lamp})`); hg.addColorStop(0.15, `rgba(255,255,255,${0.5 * N.lamp})`); hg.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = hg; g.fillRect(lx - 110, ly - 110, 220, 220);
      const pg = g.createRadialGradient(lx, H - 70, 0, lx, H - 70, 400);
      pg.addColorStop(0, `rgba(255,255,255,${0.2 * N.lamp})`); pg.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = pg; g.save(); g.translate(0, H - 70); g.scale(1, 0.16); g.translate(0, -(H - 70)); g.fillRect(lx - 400, H - 470, 800, 800); g.restore();
      g.restore();
    }
    // fog (behind the rain)
    if (N.fog > 0.003) {
      for (let i = 0; i < 6; i++) {
        const x = W * (frac(0.012 * t * (1 + i * 0.3) + i * 0.37) * 1.4 - 0.2), y = H * (0.35 + 0.1 * i % 0.6), r = 420 + i * 60;
        const fg = g.createRadialGradient(x, y, 0, x, y, r);
        fg.addColorStop(0, `rgba(190,190,190,${0.09 * N.fog})`); fg.addColorStop(1, 'rgba(190,190,190,0)');
        g.fillStyle = fg; g.fillRect(x - r, y - r, r * 2, r * 2);
      }
    }
    // text (serif) — optionally lit only inside the blind bands
    for (const tx of N.texts) {
      if (tx.alpha <= 0.003) continue;
      g.font = `${tx.italic ? 'italic ' : ''}400 ${tx.size}px ${SERIF(D)}`;
      g.textAlign = tx.align || 'left';
      g.textBaseline = 'alphabetic';
      if (N.blinds > 0.003 && tx.lit) {
        g.globalAlpha = A0 * tx.alpha * 0.34; g.fillStyle = '#ffffff'; g.fillText(tx.text, tx.x, tx.y);
        g.save(); bandsPath(g, N, W, H); g.clip(); g.globalAlpha = A0 * tx.alpha; g.fillText(tx.text, tx.x, tx.y); g.restore();
      } else { g.globalAlpha = A0 * tx.alpha; g.fillStyle = '#ffffff'; g.fillText(tx.text, tx.x, tx.y); }
      g.globalAlpha = A0;
    }
    // rain: far thin streaks, near bright ones; brighter inside the lamp cone and on a flash
    if (N.rain > 0.003) {
      const levels = [[], [], []], wind = N.wind, boost = 1 + N.flash * 2.5;
      for (const d of S.drops) {
        const y = frac((d.y + d.sp * t) / (H + 200)) * (H + 200) - 100, x = d.x + wind * y;
        let a = d.a * N.rain * boost;
        if (N.lamp > 0.003 && y > N.lampY) { const half = 18 + ((y - N.lampY) / (H - N.lampY)) * 360; if (Math.abs(x - N.lampX) < half) a *= 1 + 2.5 * N.lamp; }
        const lv = a > 0.6 ? 2 : a > 0.3 ? 1 : 0;
        levels[lv].push(x, y, d.len * (0.6 + d.z * 0.6), d.z);
      }
      g.save();
      g.globalCompositeOperation = 'lighter';
      [[0.22, 1], [0.45, 1.4], [0.8, 1.8]].forEach(([al, lw], k) => {
        const L = levels[k];
        if (!L.length) return;
        g.strokeStyle = '#ffffff'; g.globalAlpha = A0 * al; g.lineWidth = lw;
        g.beginPath();
        for (let i = 0; i < L.length; i += 4) { const x = L[i], y = L[i + 1], len = L[i + 2]; g.moveTo(x, y); g.lineTo(x - wind * len, y - len); }
        g.stroke();
      });
      g.restore();
      g.globalAlpha = A0;
    }
    // puddle ripples
    if (N.ground > 0.003) {
      g.strokeStyle = '#ffffff';
      g.lineWidth = 1.4;
      for (const r of S.ripples) {
        const p = frac(t * r.rate + r.ph), rx = 6 + p * 34 * r.s;
        g.globalAlpha = A0 * N.ground * (1 - p) * 0.4;
        g.beginPath(); g.ellipse(r.x, r.y, rx, rx * 0.22, 0, 0, Math.PI * 2); g.stroke();
      }
      g.globalAlpha = A0;
    }
    // rain on the glass: beads + sliding drops with trails
    if (N.glass > 0.003) {
      for (const d of S.dots) {
        g.globalAlpha = A0 * N.glass * 0.5;
        const gr = g.createRadialGradient(d.x - d.r * 0.3, d.y - d.r * 0.3, 0, d.x, d.y, d.r);
        gr.addColorStop(0, 'rgba(255,255,255,.55)'); gr.addColorStop(1, 'rgba(0,0,0,.25)');
        g.fillStyle = gr; g.beginPath(); g.arc(d.x, d.y, d.r, 0, Math.PI * 2); g.fill();
      }
      for (const d of S.glass) {
        const y = frac((d.y0 + d.v * t + 40 * Math.sin(t * d.f + d.ph)) / (H + 200)) * (H + 200) - 100, x = d.x + Math.sin(y * 0.01 + d.ph) * 6;
        g.globalAlpha = A0 * N.glass * 0.18;
        g.strokeStyle = '#ffffff'; g.lineWidth = d.r * 0.45;
        g.beginPath(); g.moveTo(x, y - 40 - d.v * 0.8); g.lineTo(x, y); g.stroke();
        g.globalAlpha = A0 * N.glass * 0.85;
        const gr = g.createRadialGradient(x - d.r * 0.3, y - d.r * 0.35, 0, x, y, d.r);
        gr.addColorStop(0, 'rgba(255,255,255,.75)'); gr.addColorStop(0.6, 'rgba(160,160,160,.25)'); gr.addColorStop(1, 'rgba(0,0,0,.45)');
        g.fillStyle = gr; g.beginPath(); g.arc(x, y, d.r, 0, Math.PI * 2); g.fill();
      }
      g.globalAlpha = A0;
    }
    // smoke / steam wisps rising and curling
    if (N.smoke > 0.003) {
      for (let i = 0; i < WISPS; i++) for (let k = 0; k < 26; k++) {
        const kk = k + frac(t * 0.9 + i * 0.2), y = N.smokeY - kk * 22, x = N.smokeX + i * 7 - 14 + Math.sin(kk * 0.32 + t * 0.9 + i * 1.3) * (6 + kk * 2.4), r = 10 + kk * 1.6;
        const al = N.smoke * 0.11 * (1 - kk / 26);
        if (al <= 0) continue;
        const gr = g.createRadialGradient(x, y, 0, x, y, r);
        gr.addColorStop(0, `rgba(230,230,230,${al})`); gr.addColorStop(1, 'rgba(230,230,230,0)');
        g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2);
      }
    }
    // dust motes: bright only inside the light bands
    if (N.dust > 0.003) {
      g.fillStyle = '#ffffff';
      for (const d of S.dust) {
        const y = frac((d.y - d.sp * t) / H) * H, x = d.x + Math.sin(t * 0.5 + d.ph) * 20, lit = N.blinds > 0.003 && litAt(N, W, H, x, y);
        g.globalAlpha = A0 * N.dust * (lit ? 0.85 : 0.08);
        g.beginPath(); g.arc(x, y, d.r, 0, Math.PI * 2); g.fill();
      }
      g.globalAlpha = A0;
    }
    // searchlight cone (title)
    if (N.search > 0.003) {
      g.save();
      g.globalCompositeOperation = 'lighter';
      const sg = g.createLinearGradient(0, H, 0, 0);
      sg.addColorStop(0, `rgba(255,255,255,${0.02 * N.search})`); sg.addColorStop(0.6, `rgba(255,255,255,${0.12 * N.search})`); sg.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = sg;
      g.beginPath(); g.moveTo(W / 2 - 30, H + 20); g.lineTo(N.searchX - 260, 0); g.lineTo(N.searchX + 260, 0); g.lineTo(W / 2 + 30, H + 20); g.closePath(); g.fill();
      g.restore();
    }
    // ground fog band (in front)
    if (N.fog > 0.003) {
      const gf = g.createLinearGradient(0, H * 0.62, 0, H);
      gf.addColorStop(0, 'rgba(200,200,200,0)'); gf.addColorStop(1, `rgba(200,200,200,${0.14 * N.fog})`);
      g.fillStyle = gf; g.fillRect(0, H * 0.62, W, H * 0.38);
    }
    // lightning
    if (N.bolt > 0.003) {
      g.save();
      g.globalCompositeOperation = 'lighter';
      g.strokeStyle = '#ffffff'; g.lineJoin = 'round';
      [[14, 0.12], [5, 0.4], [2, 1]].forEach(([lw, al]) => {
        g.lineWidth = lw; g.globalAlpha = A0 * N.bolt * al;
        g.beginPath(); S.bolt.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke();
      });
      g.restore();
    }
  }
  /** Scene bookkeeping: the layer on, film time drives N.t, and the look for this scene. */
  function look(D, N, T, dur, set) {
    D.tl.set(N, { alpha: 1, rain: 0, lamp: 0, ground: 0, fog: 0, wall: 0, blinds: 0, dust: 0, glass: 0, bokeh: 0, smoke: 0, bolt: 0, flash: 0, search: 0, t: T, ...set }, T);
    D.tl.to(N, { t: T + dur, duration: dur, ease: 'none' }, T);
  }
  function thunder(D, N, at, strength = 1) {
    D.hit(N, { bolt: 1, flash: 1 }, { bolt: 0, flash: 0, duration: 0.5, ease: 'power2.out' }, at);
    D.flash(at, 0.55 * strength, 0.5);
    D.flash(at + 0.18, 0.3 * strength, 0.35);
    D.sfx('boom', at, 0.9 * strength);
    D.sfx('crash', at + 0.05, 0.12 * strength);
    D.sfx('boom', at + 0.35, 0.5 * strength);
  }
  function lines(D, s, arr, cls) {
    const els = arr.map(l => { const e = document.createElement('div'); e.className = cls; e.innerHTML = l.text; if (l.style) e.setAttribute('style', l.style); s.appendChild(e); return e; });
    return els;
  }

  // ------------------------------------------------------------------ NRSTREET
  // A rainy night street: streetlamp, a silhouette under it, thunder, two serif lines.   9 s
  recipe('nrstreet', (D, T, o) => {
    const { tl } = D;
    const N = noir(D), dur = o.duration || 9;
    const s = D.scene('nrstreet', `<svg class="nr-man" viewBox="0 0 200 520"><path d="M100 18c-30 0-52 8-58 20h-22l-4 10h168l-4-10h-22c-6-12-28-20-58-20z M72 58c0 16 12 34 28 34s28-18 28-34z M60 96c-26 8-40 30-42 60l-8 250c0 20 16 30 36 30l6 76h20l8-70h40l8 70h20l6-76c20 0 36-10 36-30l-8-250c-2-30-16-52-42-60l-40 16z"/></svg>`);
    const man = D.$('.nr-man', s), ls = lines(D, s, o.lines || [], 'nr-line');
    gsap.set(ls, { opacity: 0, y: 14 });
    gsap.set(man, { opacity: 0 });
    D.show(s, T);
    D.setBg(D.C.night, T);
    D.ink(D.C.paper, T);
    tl.set(D.bars, { height: 540 }, T);
    D.barsTo(o.bars ?? 138, T + 0.05, 1.8, 'power2.inOut');
    if (o.label) D.label(T + 0.6, o.label);
    look(D, N, T, dur, { rain: 1, lamp: 0, ground: 1, fog: 0.6 });
    // the bulb struggles on
    tl.to(N, { keyframes: [{ lamp: 1, duration: 0.05 }, { lamp: 0.15, duration: 0.09 }, { lamp: 0.9, duration: 0.05 }, { lamp: 0.3, duration: 0.12 }, { lamp: 1, duration: 0.5, ease: 'power2.out' }] }, T + 0.4);
    D.sfx('tick', T + 0.4, 0.08); D.sfx('tick', T + 0.54, 0.05);
    tl.to(man, { opacity: 1, duration: 1.4, ease: 'power1.inOut' }, T + 1.2);
    D.call(() => SFX.hiss('rain', 0.05, 1.2), T + 0.02);
    ls.forEach((e, i) => {
      const at = T + (o.at?.[i] ?? 1.2 + i * 3.4);
      tl.to(e, { opacity: 1, y: 0, duration: 1, ease: 'power2.out' }, at);
      tl.to(e, { opacity: 0, duration: 0.7 }, at + 2.6);
    });
    thunder(D, N, T + (o.thunderAt ?? 3.4));
    D.hide(s, T + dur);
    return dur;
  });

  // ------------------------------------------------------------------ NRCARDS
  // Classic intertitles over near-black and faint rain, one per step.        n × step
  recipe('nrcards', (D, T, o) => {
    const { tl, N: NT } = D;
    const N = noir(D), cards = o.cards || [], step = o.step || 2, dur = cards.length * step;
    const s = D.scene('nrcards', cards.map(c => `<div class="nr-card c">${c}</div>`).join(''));
    const els = D.$$('.nr-card', s);
    els.forEach(e => D.fit(e, 1500));
    gsap.set(els, { opacity: 0 });
    D.show(s, T);
    if (o.label) D.label(T, o.label);
    look(D, N, T, dur, { rain: 0.35, fog: 0.3 });
    els.forEach((e, i) => {
      const at = T + i * step;
      D.hit(e, { opacity: 0, scale: 1.06 }, { opacity: 1, scale: 1, duration: 0.6, ease: 'power2.out' }, at + 0.1);
      tl.to(e, { opacity: 0, duration: 0.45, ease: 'power1.in' }, at + step - 0.5);
      D.sfx('boom', at + 0.1, 0.35);
      D.sfx('bell', at + 0.1, [NT.A4, NT.E4, NT.A4][i % 3] / 2, 0.05, 2.2);
    });
    D.hide(s, T + dur);
    return dur;
  });

  // ------------------------------------------------------------------ NRBLINDS
  // An office at night: blind light on the wall, dust in the beams, steam from a cup; the
  // lines are lit only where the light falls; a car passes and the bands sweep.    9 s
  recipe('nrblinds', (D, T, o) => {
    const { tl } = D;
    const N = noir(D), dur = o.duration || 9;
    const s = D.scene('nrblinds', `<svg class="nr-cup" viewBox="0 0 160 120"><path d="M20 20h100v50c0 28-22 46-50 46S20 98 20 70z M120 34h12c14 0 20 10 20 20s-8 22-24 22h-10v-12h10c6 0 12-4 12-10s-4-8-8-8h-12z"/></svg>`);
    const texts = (o.lines || []).map((l, i) => ({ text: l.text, x: l.x ?? 250, y: l.y ?? 500 + i * 150, size: l.size ?? 96, italic: l.italic ?? true, alpha: 0, lit: true }));
    N.texts.push(...texts); // drawn by the layer while their alpha > 0
    D.show(s, T);
    if (o.label) D.label(T, o.label);
    look(D, N, T, dur, { wall: 1, blinds: 1, dust: 1, smoke: 1, smokeX: 1550, smokeY: 800, fog: 0.12 });
    // one keyframed track for the bands: a slow drift, then a car passing (a fast sweep), then drift again
    const drift = o.drift ?? 90, ca = o.carAt ?? 4.2, cs = 1.1, v = drift / dur;
    tl.set(N, { shift: 0 }, T);
    tl.to(N, { keyframes: [{ shift: v * ca, duration: ca, ease: 'none' }, { shift: v * ca + 260, duration: cs, ease: 'sine.inOut' }, { shift: drift + 260, duration: dur - ca - cs, ease: 'none' }] }, T);
    const tc = T + ca;
    D.sfx('whoosh', tc, 1.2, 0.2);
    D.call(() => SFX.hiss('rain', 0.018, 0.4), T + 0.05);
    texts.forEach((x, i) => {
      const at = T + (o.at?.[i] ?? 1 + i * 3.6);
      tl.to(x, { alpha: 1, duration: 1.2, ease: 'power1.inOut' }, at);
      tl.to(x, { alpha: 0, duration: 0.7 }, T + dur - 0.9);
    });
    for (let k = 0; k < dur * 2; k++) D.sfx('tick', T + k * 0.5, k % 2 ? 0.02 : 0.035); // a clock on the wall
    D.hide(s, T + dur);
    return dur;
  });

  // ------------------------------------------------------------------ NRWINDOW
  // Rain running down a window; the city is out of focus behind it.         7 s
  recipe('nrwindow', (D, T, o) => {
    const { tl } = D;
    const N = noir(D), dur = o.duration || 7;
    const s = D.scene('nrwindow', '');
    const ls = lines(D, s, o.lines || [], 'nr-wline c');
    ls.forEach(e => D.fit(e, 1500));
    gsap.set(ls, { opacity: 0, filter: 'blur(10px)' });
    D.show(s, T);
    if (o.label) D.label(T, o.label);
    look(D, N, T, dur, { glass: 1, bokeh: 1, rain: 0.45, fog: 0.25 });
    D.call(() => SFX.hiss('rain', 0.04, 0.5), T + 0.05);
    ls.forEach((e, i) => {
      const at = T + (o.at?.[i] ?? 0.8 + i * 1.6);
      tl.to(e, { opacity: 1, filter: 'blur(0px)', duration: 1.2, ease: 'power2.out' }, at);
    });
    tl.to(ls, { opacity: 0, filter: 'blur(8px)', duration: 0.8 }, T + dur - 1);
    D.sfx('bell', T + 0.8, 293.66, 0.04, 2.5);
    D.sfx('bell', T + 2.4, 349.23, 0.04, 2.5);
    D.hide(s, T + dur);
    return dur;
  });

  // ------------------------------------------------------------------ NRTITLE
  // A searchlight sweeps across fog and reveals the title; then it's fully lit, a thin red
  // line draws under it (the only colour in the film), thunder.              8 s
  recipe('nrtitle', (D, T, o) => {
    const { tl } = D;
    const N = noir(D), dur = o.duration || 8, word = o.title || D.cfg.meta.title;
    const s = D.scene('nrtitle', `
      <div class="nr-t nr-tdim c">${word}</div>
      <div class="nr-t nr-tlit c">${word}</div>
      <div class="nr-red c" style="background:${o.red || '#c1121f'}"></div>
      <div class="nr-sub c">${o.subtitle || ''}</div>`);
    const dim = D.$('.nr-tdim', s), lit = D.$('.nr-tlit', s), red = D.$('.nr-red', s), sub = D.$('.nr-sub', s);
    D.fit(dim, 1600); lit.style.fontSize = dim.style.fontSize;
    const lb = D.box(lit), ty = lb.y + lb.h / 2; // the lit copy's mask follows where the cone crosses the title
    gsap.set(red, { scaleX: 0 });
    gsap.set(sub, { opacity: 0, y: 12 });
    gsap.set([dim, lit], { opacity: 0 });
    D.show(s, T);
    if (o.label) D.label(T, o.label);
    look(D, N, T, dur, { rain: 0.55, fog: 0.9, search: 1, searchX: -700 });
    D.call(() => SFX.hiss('rain', 0.04, 0.5), T + 0.05);
    tl.to(dim, { opacity: 1, duration: 1.5 }, T + 0.2);
    tl.set(lit, { opacity: 1 }, T + 0.2);
    const S = { x: -700 }, f = (D.H + 20 - ty) / (D.H + 20);
    const apply = () => { N.searchX = S.x; lit.style.setProperty('--lx', (D.W / 2 + (S.x - D.W / 2) * f - lb.x) + 'px'); };
    gsap.set(lit, { '--lr': '380px' });
    apply();
    tl.to(S, { x: 2700, duration: 3, ease: 'sine.inOut', onUpdate: apply }, T + 0.3);
    D.sfx('riser', T + 0.3, 3, 0.25);
    // fully lit
    const tr = T + 3.4;
    tl.to(lit, { '--lr': '2400px', duration: 0.6, ease: 'expo.in' }, tr - 0.4);
    tl.to(N, { search: 0, duration: 0.8 }, tr);
    thunder(D, N, tr, 0.8);
    D.sfx('braam', tr, 0.7);
    D.call(() => SFX.pad('title', [73.42, 87.31, 110, 146.83], 1.5, 0.05, 700), tr);
    tl.to(red, { scaleX: 1, duration: 1.2, ease: 'expo.inOut' }, tr + 0.3);
    tl.to(sub, { opacity: 0.85, y: 0, duration: 1, ease: 'power2.out' }, tr + 0.9);
    tl.to([dim, lit, red, sub], { opacity: 0, duration: 0.8 }, T + dur - 1);
    D.hide(s, T + dur);
    return dur;
  });

  // ------------------------------------------------------------------ NRCREDITS
  // A condensed billing block (use true credits) and a serif "coming soon".   6 s
  recipe('nrcredits', (D, T, o) => {
    const { tl } = D;
    const N = noir(D), dur = o.duration || 6;
    const s = D.scene('nrcredits', `
      <div class="nr-cr c">
        <div class="nr-pre mono">${o.presents || ''}</div>
        <div class="nr-ct">${o.title || D.cfg.meta.title}</div>
        <div class="nr-bill v">${(o.billing || []).join(' <i>·</i> ')}</div>
        <div class="nr-soon">${o.soon || ''}</div>
        <div class="nr-where mono">${o.where || ''}</div>
      </div>`);
    const kids = D.$$('.nr-cr > *', s);
    D.fit(D.$('.nr-bill', s), 1500);
    gsap.set(kids, { opacity: 0, y: 16 });
    D.show(s, T);
    if (o.label) D.label(T, o.label);
    look(D, N, T, dur, { rain: 0.3, fog: 0.4 });
    tl.to(kids, { opacity: 1, y: 0, duration: 0.9, ease: 'power2.out', stagger: 0.35 }, T + 0.2);
    tl.to(kids, { opacity: 0, duration: 0.6 }, T + dur - 1.1);
    D.barsTo(540, T + dur - 0.9, 0.9);
    tl.to(N, { alpha: 0, duration: 0.8 }, T + dur - 0.9);
    D.call(() => { SFX.padStop('rain', 1.2); SFX.padStop('title', 1.5); }, T + dur - 0.9);
    D.sfx('boom', T + dur - 0.1, 0.5);
    D.hide(s, T + dur);
    return dur;
  });

  Trailer.noir = { state: noir, thunder, counts: { rain: RAIN_N, glass: GLASS_N, wisps: WISPS } };
})();
