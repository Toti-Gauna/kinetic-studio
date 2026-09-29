/* ============================================================================
   BEAT MODULE — music videos where the score moves the picture.
   The visuals read the SCORE itself (Trailer.music.events(cfg.music): every kick,
   snare, hat and note with its exact time), so the sync is exact and every frame is
   a pure function of time — seekable and exportable. A live spectrum meter shows the
   real AnalyserNode output while the film plays with sound, and a spectrum computed
   from the score when it is silent (muted, seeking, exporting) — labelled as such.
   One canvas layer, three looks weighted by params: pulse (heartbeat disc, kick
   ripples, bass waveform), grid (a 16-step sequencer of the real pattern: played
   notes light up, the coming ones are outlined), ring (12 pitch-class spokes, snare
   colour cuts, hat sparks). Lyrics pop word by word on the beat.
   Recipes: bxpulse, bxgrid, bxring, bxtitle.
   ========================================================================== */
(() => {
  'use strict';
  const { recipe } = Trailer;
  const NAMES = ['DO', 'DO#', 'RE', 'RE#', 'MI', 'FA', 'FA#', 'SOL', 'SOL#', 'LA', 'LA#', 'SI'];
  const midi = f => 69 + 12 * Math.log2(f / 440);
  // WCAG contrast: text colours are chosen against the current background, never by rule of thumb
  const lum = h => { const n = parseInt(h.slice(1), 16), c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
  const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  const INK = ['#0c0c10', '#f2ede4'], HOTS = ['#d4ff3a', '#1b1bd6', '#ff2e88', '#35d0ff', '#ff4d2e', '#f2ede4', '#0c0c10'];
  const inkOn = bg => (ratio(bg, INK[0]) >= ratio(bg, INK[1]) ? INK[0] : INK[1]);
  /** the most colourful highlight that still reads on bg and differs from the ink */
  const hotOn = (bg, ink) => HOTS.filter(c => c !== bg && c !== ink && ratio(c, bg) >= 2.2).sort((a, b) => ratio(b, bg) - ratio(a, bg))[0] || (ink === INK[0] ? INK[1] : INK[0]);
  const hash = (a, b) => { const x = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453; return x - Math.floor(x); };

  // ------------------------------------------------------------------ THE SCORE, AS DATA
  function score(D) {
    if (D._score) return D._score;
    const M = D.cfg.music || {}, ev = Trailer.music ? Trailer.music.events(M) : [];
    const pick = (fn) => ev.filter(fn).map(e => e);
    const S = {
      bpm: M.bpm || 120, anchor: M.anchor || 0,
      kick: pick(e => e.voice === 'kick').map(e => ({ t: e.t, v: e.a[0] ?? 0.5 })),
      snare: pick(e => e.voice === 'clap').map(e => ({ t: e.t, v: e.a[0] ?? 0.3 })),
      hat: pick(e => e.voice === 'hat').map(e => ({ t: e.t, v: e.a[0] ?? 0.05 })),
      bass: pick(e => e.voice === 'bass').map(e => ({ t: e.t, v: e.a[1] ?? 0.25, m: midi(e.a[0] || 55) })),
      notes: pick(e => e.voice === 'plip' || e.voice === 'bell').map(e => ({ t: e.t, v: e.voice === 'plip' ? (e.a[0] ?? 0.03) * 6 : (e.a[1] ?? 0.05) * 4, m: midi(e.voice === 'plip' ? e.a[1] || 520 : e.a[0] || 440) })),
    };
    S.all = ev;
    D._score = S;
    return S;
  }
  // last index with t <= time (binary search)
  const upto = (arr, t) => { let lo = 0, hi = arr.length - 1, r = -1; while (lo <= hi) { const mid = (lo + hi) >> 1; if (arr[mid].t <= t + 1e-6) { r = mid; lo = mid + 1; } else hi = mid - 1; } return r; };
  /** envelope: max over recent events of v·e^(−age/decay), normalised by the list's loudest */
  function env(arr, t, decay, norm) {
    let m = 0;
    for (let i = upto(arr, t); i >= 0; i--) { const age = t - arr[i].t; if (age > decay * 6) break; m = Math.max(m, arr[i].v * Math.exp(-age / decay)); }
    return norm ? Math.min(1, m / norm) : m;
  }
  const loudest = arr => arr.reduce((a, e) => Math.max(a, e.v), 1e-6);
  function ctx(D) {
    const S = score(D);
    if (!S.n) S.n = { kick: loudest(S.kick), snare: loudest(S.snare), hat: loudest(S.hat), bass: loudest(S.bass), notes: loudest(S.notes) };
    return {
      S,
      kick: t => env(S.kick, t, 0.12, S.n.kick),
      snare: t => env(S.snare, t, 0.16, S.n.snare),
      hat: t => env(S.hat, t, 0.05, S.n.hat),
      bass: t => env(S.bass, t, 0.3, S.n.bass),
      bassMidi: t => { const i = upto(S.bass, t); return i >= 0 ? S.bass[i].m : 33; },
      snareCount: t => upto(S.snare, t) + 1,
      pcEnv: t => { const pc = new Array(12).fill(0); for (const L of [S.notes, S.bass]) for (let i = upto(L, t); i >= 0; i--) { const age = t - L[i].t; if (age > 2) break; const k = ((Math.round(L[i].m) % 12) + 12) % 12; pc[k] = Math.max(pc[k], Math.min(1, (L[i].v / (L === S.bass ? S.n.bass : S.n.notes)) * Math.exp(-age / 0.4))); } return pc; },
    };
  }

  // ------------------------------------------------------------------ THE LAYER
  function beat(D) {
    if (D._beat) return D._beat;
    const B = { alpha: 0, t: 0, pulse: 0, grid: 0, ring: 0, meter: 0, dim: 0, rx: D.CX, ry: D.CY, rr: 360, palette: D.cfg.beat?.palette || ['#0c0c10', '#ff4d2e', '#1b1bd6', '#d4ff3a', '#f2ede4', '#ff2e88'] };
    D._beat = B;
    const E = ctx(D);
    const live = { data: null };
    D.layer(B, g => draw(g, B, E, D, live));
    return B;
  }
  function draw(g, B, E, D, live) {
    const { W, H, CX, CY } = D, t = B.t, A0 = g.globalAlpha, S = E.S, pal = B.palette, acc = '#d4ff3a', hot = '#ff4d2e';
    const k = E.kick(t), sn = E.snare(t), ht = E.hat(t), bs = E.bass(t);
    // background: dark, or a colour cut on every snare in ring mode
    const cut = pal[E.snareCount(t) % pal.length];
    g.fillStyle = '#0c0c10'; g.fillRect(0, 0, W, H);
    if (B.ring > 0.003) { g.globalAlpha = A0 * B.ring; g.fillStyle = cut; g.fillRect(0, 0, W, H); g.globalAlpha = A0; }
    const ink = B.ring > 0.5 ? inkOn(cut) : '#f2ede4';
    g.save();
    // --- pulse: heartbeat disc, ripples per kick, bass waveform
    if (B.pulse > 0.003) {
      const a = A0 * B.pulse;
      g.globalAlpha = a;
      g.strokeStyle = '#f2ede4';
      for (let i = upto(S.kick, t); i >= 0; i--) { const age = t - S.kick[i].t; if (age > 1.6) break; g.globalAlpha = a * (1 - age / 1.6) * 0.7; g.lineWidth = 3; g.beginPath(); g.arc(CX, CY, 110 + age * 620, 0, 6.283); g.stroke(); }
      const r = 90 + 110 * k, gr = g.createRadialGradient(CX, CY, 0, CX, CY, r * 2.2);
      gr.addColorStop(0, D.rgba(hot, 0.55 * B.pulse)); gr.addColorStop(1, D.rgba(hot, 0));
      g.globalAlpha = A0; g.fillStyle = gr; g.fillRect(CX - r * 2.2, CY - r * 2.2, r * 4.4, r * 4.4);
      g.globalAlpha = a; g.fillStyle = hot; g.beginPath(); g.arc(CX, CY, r, 0, 6.283); g.fill();
      const bm = E.bassMidi(t), cyc = 2 + (bm - 28) * 0.18, amp = 20 + 110 * bs;
      g.globalAlpha = a * 0.9; g.strokeStyle = acc; g.lineWidth = 3;
      g.beginPath();
      for (let x = 0; x <= W; x += 6) { const y = CY + 250 + amp * Math.sin((x / W) * 6.283 * cyc - t * 9) * Math.sin((x / W) * Math.PI); x ? g.lineTo(x, y) : g.moveTo(x, y); }
      g.stroke();
    }
    // --- grid: the real 16-step pattern of the current bar
    if (B.grid > 0.003) {
      const a = A0 * B.grid, bar = 4 * 60 / S.bpm, b0 = S.anchor + Math.floor((t - S.anchor) / bar) * bar, step = bar / 16;
      const rows = [['BOMBO', S.kick, hot], ['CAJA', S.snare, '#ff2e88'], ['HI-HAT', S.hat, '#f2ede4'], ['BAJO', S.bass, acc], ['NOTAS', S.notes, '#35d0ff']];
      const cw = 84, ch = 70, gx = CX - (16 * cw) / 2 + 60, gy = CY - (rows.length * ch) / 2 + 30;
      g.font = `600 18px "${D.cfg.fonts.mono}"`; g.textAlign = 'right'; g.textBaseline = 'middle';
      const ph = Math.floor((t - b0) / step);
      g.globalAlpha = a * 0.12; g.fillStyle = '#f2ede4'; g.fillRect(gx + ph * cw, gy - 12, cw - 8, rows.length * ch + 4);
      rows.forEach(([name, L, col], r) => {
        const y = gy + r * ch;
        g.globalAlpha = a * 0.75; g.fillStyle = '#f2ede4'; g.fillText(name, gx - 24, y + (ch - 14) / 2);
        for (let c = 0; c < 16; c++) { g.globalAlpha = a * 0.1; g.fillStyle = '#f2ede4'; g.fillRect(gx + c * cw, y, cw - 8, ch - 14); }
        for (let i = Math.max(0, upto(L, b0 - 1e-3) + 1); i < L.length && L[i].t < b0 + bar - 1e-3; i++) {
          const c = Math.round((L[i].t - b0) / step), x = gx + c * cw, age = t - L[i].t;
          if (age >= 0) { g.globalAlpha = a * (0.45 + 0.55 * Math.exp(-age / 0.18)); g.fillStyle = col; g.fillRect(x, y, cw - 8, ch - 14);
            if (L[i].m != null && name !== 'NOTAS') { g.globalAlpha = a; g.fillStyle = '#0c0c10'; g.textAlign = 'center'; g.fillText(NAMES[((Math.round(L[i].m) % 12) + 12) % 12], x + (cw - 8) / 2, y + (ch - 14) / 2); g.textAlign = 'right'; } }
          else { g.globalAlpha = a * 0.6; g.strokeStyle = col; g.lineWidth = 2; g.strokeRect(x + 1, y + 1, cw - 10, ch - 16); }
        }
      });
    }
    // --- ring: 12 pitch-class spokes, kick disc, hat sparks
    if (B.ring > 0.003) {
      const a = A0 * B.ring, pc = E.pcEnv(t), sc = 1 + 0.035 * k;
      g.translate(B.rx, B.ry); g.scale(sc, sc);
      g.lineCap = 'round';
      for (let i = 0; i < 12; i++) {
        const ang = -Math.PI / 2 + (i / 12) * Math.PI * 2, len = 120 + (B.rr - 170) * pc[i], x = Math.cos(ang), y = Math.sin(ang);
        g.globalAlpha = a * (0.25 + 0.75 * pc[i]); g.strokeStyle = ink; g.lineWidth = 18;
        g.beginPath(); g.moveTo(x * 100, y * 100); g.lineTo(x * len, y * len); g.stroke();
        g.globalAlpha = a * 0.8; g.fillStyle = ink; g.font = `600 20px "${D.cfg.fonts.mono}"`; g.textAlign = 'center'; g.textBaseline = 'middle';
        g.fillText(NAMES[i], x * B.rr, y * B.rr);
      }
      g.globalAlpha = a; g.fillStyle = ink; g.beginPath(); g.arc(0, 0, 56 + 44 * k, 0, 6.283); g.fill();
      for (let i = upto(S.hat, t); i >= 0; i--) {
        const age = t - S.hat[i].t; if (age > 0.6) break;
        for (let p = 0; p < 6; p++) { const an = hash(i, p) * 6.283, rr = 150 + age * 700; g.globalAlpha = a * (1 - age / 0.6); g.fillStyle = ink; g.beginPath(); g.arc(Math.cos(an) * rr, Math.sin(an) * rr, 4, 0, 6.283); g.fill(); }
      }
    }
    g.restore();
    g.globalAlpha = A0;
    // --- the spectrum meter: live AnalyserNode while playing with sound, else the score
    if (B.meter > 0.003) {
      const N = 48, x0 = 190, x1 = W - 190, base = H - 104, hmax = 84, bw = (x1 - x0) / N;
      const an = window.SFX && SFX.live && SFX.live() && !D.tl.paused() ? SFX.analyser() : null;
      let vals;
      if (an) {
        if (!live.data || live.data.length !== an.frequencyBinCount) live.data = new Uint8Array(an.frequencyBinCount);
        an.getByteFrequencyData(live.data);
        const ny = 22050;
        vals = Array.from({ length: N }, (_, b) => { const f = 40 * 2 ** (b / 5.2), bin = Math.min(live.data.length - 1, Math.round((f / ny) * live.data.length)); return live.data[bin] / 255; });
      } else {
        const bm = E.bassMidi(t), bf = 440 * 2 ** ((bm - 69) / 12), pc = E.pcEnv(t);
        vals = Array.from({ length: N }, (_, b) => {
          const f = 40 * 2 ** (b / 5.2), lf = Math.log2(f);
          let v = k * Math.exp(-((lf - Math.log2(60)) ** 2) / 0.5) + bs * Math.exp(-((lf - Math.log2(bf)) ** 2) / 0.2);
          v += sn * 0.7 * Math.exp(-((lf - Math.log2(1500)) ** 2) / 3) + ht * 0.8 * Math.exp(-((lf - Math.log2(9000)) ** 2) / 0.8);
          for (let i = 0; i < 12; i++) if (pc[i] > 0.05) v += pc[i] * 0.6 * Math.exp(-((lf - Math.log2(440 * 2 ** ((i - 9) / 12 + 1))) ** 2) / 0.05);
          return Math.min(1, v);
        });
      }
      g.globalAlpha = A0 * B.meter;
      vals.forEach((v, i) => { g.fillStyle = i < N * 0.3 ? hot : i < N * 0.7 ? acc : '#35d0ff'; g.fillRect(x0 + i * bw + 2, base - 4 - v * hmax, bw - 4, 4 + v * hmax); });
      g.font = `600 14px "${D.cfg.fonts.mono}"`; g.textAlign = 'left'; g.textBaseline = 'top'; g.fillStyle = B.ring > 0.5 ? ink : '#f2ede4';
      g.globalAlpha = A0 * B.meter * 0.75;
      g.fillText(an ? (D.cfg.beat?.liveLabel || 'ESPECTRO EN VIVO · ANALYSERNODE') : (D.cfg.beat?.scoreLabel || 'ESPECTRO CALCULADO DE LA PARTITURA'), x0, base + 12);
      g.globalAlpha = A0;
    }
  }

  // ------------------------------------------------------------------ LYRICS (DOM) + scene bookkeeping
  /** lines: [{ words: 'Cada golpe', at: seconds from T, per: 0.5, until }] — each word pops on its beat */
  function lyrics(D, s, T, lines, o = {}) {
    const box = document.createElement('div'), pos = o.lyricsAt || { x: D.CX, y: 150 };
    box.className = 'bx-lyr';
    box.style.setProperty('--bx-hot', o.hot || '#d4ff3a');
    box.style.left = pos.x + 'px';
    box.style.top = pos.y + 'px';
    s.appendChild(box);
    lines.forEach(L => {
      const words = String(L.words).split(/\s+/).filter(Boolean), per = L.per ?? 0.5;
      const el = document.createElement('div');
      el.className = 'bx-line v';
      el.innerHTML = words.map(w => `<span>${w}</span>`).join(' ');
      box.appendChild(el);
      D.fit(el, o.maxW || 1600);
      gsap.set(el, { xPercent: -50, autoAlpha: 0 });
      const spans = [...el.children], at = T + L.at;
      D.tl.set(el, { autoAlpha: 1 }, at);
      spans.forEach((sp, i) => {
        gsap.set(sp, { opacity: 0, transformOrigin: '50% 100%' });
        D.hit(sp, { opacity: 1, scale: 1.25, attr: { 'data-on': 1 } }, { scale: 1, duration: 0.25, ease: 'back.out(3)' }, at + i * per);
        D.tl.set(sp, { attr: { 'data-on': 0 } }, at + (i + 1) * per);
      });
      D.tl.set(el, { autoAlpha: 0 }, T + (L.until ?? L.at + words.length * per + 1));
    });
    return box;
  }
  function look(D, B, T, dur, set) {
    D.tl.set(B, { alpha: 1, pulse: 0, grid: 0, ring: 0, meter: 1, ...set, t: T }, T);
    D.tl.to(B, { t: T + dur, duration: dur, ease: 'none' }, T);
  }
  function shell(D, name, o, T, dur, set) {
    const B = beat(D), s = D.scene(name, '');
    D.show(s, T);
    if (o.label) D.label(T, o.label);
    look(D, B, T, dur, set);
    if (o.lyrics) lyrics(D, s, T, o.lyrics, o);
    D.hide(s, T + dur);
    return { B, s };
  }

  recipe('bxpulse', (D, T, o) => {
    const dur = o.duration || 8;
    const { B } = shell(D, 'bxpulse', o, T, dur, { pulse: 0 });
    D.tl.set(D.bars, { height: 540 }, T);
    D.barsTo(0, T + 0.05, 1.2);
    D.setBg('#0c0c10', T);
    D.ink('#f2ede4', T);
    D.tl.to(B, { pulse: 1, duration: 1.2 }, T + 0.1);
    return dur;
  });
  recipe('bxgrid', (D, T, o) => {
    const dur = o.duration || 8;
    const { B } = shell(D, 'bxgrid', o, T, dur, { pulse: 1 });
    D.tl.to(B, { pulse: 0, grid: 1, duration: 0.6, ease: 'power2.inOut' }, T);
    return dur;
  });
  recipe('bxring', (D, T, o) => {
    const dur = o.duration || 12;
    const { B, s } = shell(D, 'bxring', o, T, dur, { grid: 1, rx: o.ring?.x ?? 1320, ry: o.ring?.y ?? 500, rr: o.ring?.r ?? 350 });
    const box = D.$('.bx-lyr', s), E = ctx(D);
    if (box) {
      const P = { t: T }, paint = () => {
        const bg = B.palette[E.snareCount(P.t) % B.palette.length], ink = inkOn(bg);
        box.style.color = ink;
        box.style.setProperty('--bx-hot', hotOn(bg, ink));
        box.style.setProperty('--bx-sh', ink === '#0c0c10' ? 'none' : '0 6px 30px rgba(0,0,0,.45)');
      };
      paint();
      D.tl.to(P, { t: T + dur, duration: dur, ease: 'none', onUpdate: paint }, T);
    }
    D.tl.to(B, { grid: 0, ring: 1, duration: 0.5, ease: 'power2.inOut' }, T);
    return dur;
  });

  // ------------------------------------------------------------------ BXTITLE
  // Each letter is bound to a voice of the score: it moves only when its instrument plays.
  recipe('bxtitle', (D, T, o) => {
    const { tl } = D;
    const dur = o.duration || 6, word = o.title || 'BEAT', voices = o.voices || ['kick', 'snare', 'hat', 'bass'];
    const labels = o.voiceLabels || { kick: 'BOMBO', snare: 'CAJA', hat: 'HI-HAT', bass: 'BAJO' };
    const { B, s } = shell(D, 'bxtitle', o, T, dur, { ring: 1, rx: D.CX, ry: D.CY - 20, rr: 420 });
    s.insertAdjacentHTML('beforeend', `<div class="bx-title c">${[...word].map((ch, i) => `<div class="bx-l"><b class="v">${ch}</b><span class="mono">${labels[voices[i % voices.length]] || ''}</span></div>`).join('')}</div>
      <div class="bx-sub mono c">${o.subtitle || ''}</div>`);
    const L = D.$$('.bx-l b', s), title = D.$('.bx-title', s), sub = D.$('.bx-sub', s), E = ctx(D);
    gsap.set([title, sub], { xPercent: -50, yPercent: -50 });
    tl.to(B, { ring: 0.25, duration: 0.6 }, T);
    gsap.set(title, { opacity: 0 });
    gsap.set(sub, { opacity: 0 });
    D.hit(title, { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(2)' }, T + 0.1);
    tl.to(sub, { opacity: 0.8, duration: 0.6 }, T + 1.2);
    const P = { t: T }, paint = () => {
      voices.forEach((v, i) => {
        const e = E[v] ? E[v](P.t) : 0, el = L[i];
        if (!el) return;
        el.style.transform = `scale(${1 + 0.35 * e}) translateY(${v === 'hat' ? -24 * e : 0}px)`;
        el.style.color = e > 0.45 ? '#d4ff3a' : '#f2ede4';
        if (v === 'bass') el.style.setProperty('--wd', String(80 + 45 * e));
      });
    };
    paint();
    tl.to(P, { t: T + dur, duration: dur, ease: 'none', onUpdate: paint }, T);
    tl.to([title, sub], { opacity: 0, duration: 0.5 }, T + dur - 0.9);
    D.barsTo(540, T + dur - 0.8, 0.7);
    D.call(() => SFX.stopAll(1), T + dur - 0.8);
    return dur;
  });

  Trailer.beat = { score, ctx, env, lyrics, NAMES };
})();
