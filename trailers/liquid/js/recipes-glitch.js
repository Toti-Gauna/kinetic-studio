/* ============================================================================
   GLITCH MODULE — digital-error aesthetics.

   Plugin (always on once this file is loaded):
     • D.glitch(at, { dur = 0.3, amt = 1, tear, split, blocks, sound })
       a burst over the whole camera: banded horizontal tearing (SVG
       displacement), RGB channel split and "difference" interference blocks,
       frame-stepped at 24 fps and fully deterministic (hash of burst × frame).
     • any scene can add bursts: `glitch: [{ at, dur, amt }]` (seconds from its start).
       Bursts must not overlap each other.
     • `crt: true` in the config adds scanlines, flicker and a rolling VHS band.
   Recipes: boot, testcard, corrupt, datamosh, bsod.
   ========================================================================== */
(() => {
  'use strict';
  const { recipe, plugin } = Trailer;
  const FPS = 24;
  const pad2 = n => String(n).padStart(2, '0');
  const hash = (a, b = 0) => {
    let h = Math.imul(a | 0, 374761393) + Math.imul(b | 0, 668265263);
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  };
  const SCRAMBLE = '!<>-_\\/[]{}=+*^?#01';

  // ------------------------------------------------------------------ PLUGIN
  plugin({
    setup(D, cfg) {
      const { tl, camera } = D;
      const holder = document.createElement('div');
      holder.innerHTML = `<svg width="0" height="0" style="position:absolute" aria-hidden="true">
        <filter id="gl-f" x="-5%" y="-5%" width="110%" height="110%" color-interpolation-filters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.00001 0.05" numOctaves="1" seed="1" result="n"/>
          <feComponentTransfer in="n" result="q"><feFuncR type="discrete" tableValues="0.5 0.5 0.15 0.5 0.85 0.5 0.5 0.3 0.5 0.7 0.5"/></feComponentTransfer>
          <feColorMatrix in="q" type="matrix" values="1 0 0 0 0  0 0 0 0 0.5  0 0 0 0 0  0 0 0 0 1" result="map"/>
          <feDisplacementMap in="SourceGraphic" in2="map" scale="0" xChannelSelector="R" yChannelSelector="G" result="d"/>
          <feColorMatrix in="d" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="r"/>
          <feOffset in="r" dx="0" dy="0" result="ro"/>
          <feColorMatrix in="d" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0" result="gb"/>
          <feOffset in="gb" dx="0" dy="0" result="gbo"/>
          <feBlend in="ro" in2="gbo" mode="screen"/>
        </filter></svg>`;
      document.body.appendChild(holder.firstElementChild);
      const turb = document.querySelector('#gl-f feTurbulence'), disp = document.querySelector('#gl-f feDisplacementMap');
      const [offR, offGB] = document.querySelectorAll('#gl-f feOffset');

      const blocks = document.createElement('div');
      blocks.className = 'gl-blocks';
      blocks.innerHTML = '<i></i>'.repeat(14);
      camera.after(blocks);
      const bl = Array.from(blocks.children);
      gsap.set(blocks, { autoAlpha: 0 });

      if (cfg.crt) {
        const crt = document.createElement('div');
        crt.className = 'gl-crt';
        crt.innerHTML = '<i class="gl-band"></i>';
        D.hud.before(crt);
      }

      const colors = ['#ffffff', D.C.a[0], D.C.a[1], D.C.a[2]];
      function frame(id, k, amt, o) {
        const r = i => hash(id * 977 + k * 31, i);
        turb.setAttribute('seed', String(1 + Math.floor(r(1) * 997)));
        turb.setAttribute('baseFrequency', `0.00001 ${(0.008 + r(2) * 0.07).toFixed(4)}`);
        disp.setAttribute('scale', o.tear === false ? '0' : ((30 + r(3) * 170) * amt).toFixed(1));
        const sx = o.split === false ? 0 : (r(4) - 0.5) * 36 * amt;
        offR.setAttribute('dx', sx.toFixed(1));
        offR.setAttribute('dy', ((r(5) - 0.5) * 6 * amt).toFixed(1));
        offGB.setAttribute('dx', (-sx * 0.6).toFixed(1));
        bl.forEach((b, i) => {
          const on = o.blocks !== false && r(10 + i) < 0.45 * amt;
          b.style.display = on ? 'block' : 'none';
          if (!on) return;
          b.style.transform = `translate(${Math.round(r(30 + i) * 1920)}px, ${Math.round(r(50 + i) * 1080)}px)`;
          b.style.width = Math.round(30 + r(70 + i) * 560) + 'px';
          b.style.height = Math.round(4 + r(90 + i) * 80) + 'px';
          b.style.background = colors[Math.floor(r(110 + i) * colors.length)];
        });
      }
      let bursts = 0;
      D.glitch = (at, o = {}) => {
        const id = ++bursts, dur = o.dur ?? 0.3, amt = o.amt ?? 1;
        const frames = Math.max(1, Math.round(dur * FPS)), P = { f: 0 };
        tl.set(camera, { filter: 'url(#gl-f)' }, at);
        tl.set(blocks, { autoAlpha: 1 }, at);
        tl.to(P, { f: frames, duration: dur, ease: 'none', onUpdate: () => frame(id, Math.min(frames - 1, Math.floor(P.f)), amt, o) }, at);
        tl.set(camera, { filter: 'none' }, at + dur);
        tl.set(blocks, { autoAlpha: 0 }, at + dur);
        if (o.sound !== false) D.sfx('glitch', at, dur, 0.28 * Math.min(1.2, amt + 0.2));
      };
    },
    scene(D, T, s) {
      if (Array.isArray(s.glitch) && D.glitch) s.glitch.forEach(g => D.glitch(T + (g.at || 0), g));
    },
  });

  // ------------------------------------------------------------------ BOOT
  // A system boot log: lines typed in, [ OK ] / [AVISO] / [FALLA] statuses, a
  // progress bar, a big status message that gets corrupted into its opposite.
  //                                                         ≈ 0.6 + lines × step + 1.8 s
  recipe('boot', (D, T, o) => {
    const { tl, C, N } = D;
    const bgc = o.bg || C.night, fg = D.contrast(bgc);
    const col = { ok: o.ok || C.a[0], warn: o.warn || C.a[3], fail: o.fail || '#ff3b30' };
    const lab = { ok: ' OK ', warn: 'AVISO', fail: 'FALLA', ...(o.labels || {}) };
    const lines = o.lines || [['BOOT', ''], ['MEMORIA', 'ok']];
    const step = o.step || 0.26;
    const s = D.scene('boot', `
      <div class="bt mono">${lines.map(([txt, st]) => `<div class="bt-l"><span class="bt-t">${txt}</span>${st ? `<span class="bt-s" style="color:${col[st]}">[${lab[st]}]</span>` : ''}</div>`).join('')}</div>
      <div class="bt-foot mono"><div class="bt-bar"><b></b></div><span class="bt-pct">000%</span></div>
      <div class="bt-msg v c">${o.message || 'SEÑAL ESTABLE'}</div>`);
    s.style.color = fg;
    const rows = D.$$('.bt-l', s), bar = D.$('.bt-bar b', s), pct = D.$('.bt-pct', s), msg = D.fit(D.$('.bt-msg', s), 1700);
    const log = D.$('.bt', s), foot = D.$('.bt-foot', s);
    gsap.set(rows, { autoAlpha: 0 });
    gsap.set(D.$$('.bt-t', s), { clipPath: 'inset(0% 100% 0% 0%)' });
    gsap.set(D.$$('.bt-s', s), { opacity: 0 });
    gsap.set(bar, { scaleX: 0, transformOrigin: '0% 50%' });
    gsap.set(msg, { opacity: 0, color: col.ok });

    D.show(s, T);
    D.setBg(bgc, T);
    D.ink(fg, T);
    if (o.label) D.label(T + 0.2, o.label);
    D.call(() => SFX.pad('boot', [55, 110], 1.5, 0.03, 300), T + 0.02);
    const P = { v: 0 };
    let t = T + 0.6;
    rows.forEach((row, i) => {
      const txt = D.$('.bt-t', row), st = D.$('.bt-s', row), status = lines[i][1];
      tl.set(row, { autoAlpha: 1 }, t);
      tl.to(txt, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.16, ease: `steps(${Math.min(24, txt.textContent.length)})` }, t);
      D.sfx('key', t, 0.07);
      if (st) {
        tl.set(st, { opacity: 1 }, t + 0.18);
        D.sfx(status === 'fail' ? 'beep' : 'tick', t + 0.18, status === 'fail' ? 220 : 0.05, ...(status === 'fail' ? [0.18, 0.12] : []));
        if (status === 'fail' && D.glitch) D.glitch(t + 0.18, { dur: 0.17, amt: 0.55 });
      }
      tl.to(bar, { scaleX: (i + 1) / rows.length, duration: step, ease: 'power2.out' }, t);
      tl.to(P, { v: Math.round(((i + 1) / rows.length) * 100), duration: step, ease: 'none', onUpdate: () => { pct.textContent = String(Math.round(P.v)).padStart(3, '0') + '%'; } }, t);
      t += step;
    });

    // the verdict… and its corruption
    const tm = t + 0.25;
    tl.to([log, foot], { opacity: 0.12, duration: 0.2 }, tm);
    tl.to(msg, { opacity: 1, duration: 0.01 }, tm);
    D.hit(msg, { scale: 1.12 }, { scale: 1, duration: 0.5, ease: 'expo.out' }, tm);
    D.sfx('beep', tm, 1000, 0.35, 0.1);
    const tc = tm + 0.75;
    if (D.glitch) D.glitch(tc, { dur: 0.5, amt: 1.1 });
    tl.to(msg, { duration: 0.45, scrambleText: { text: o.corrupt || 'SEÑAL PERDIDA', chars: SCRAMBLE, speed: 1 }, ease: 'none' }, tc);
    tl.to(msg, { color: col.fail, duration: 0.01 }, tc + 0.2);
    D.call(() => SFX.hiss('boot-hiss', 0.05), tc);
    D.call(() => { SFX.padStop('boot', 0.3); SFX.padStop('boot-hiss', 0.4); }, tc + 0.8);
    const end = tc + 0.85;
    D.hide(s, end);
    return end - T;
  });

  // ------------------------------------------------------------------ TESTCARD
  // SMPTE colour bars + "NO SIGNAL" box, a 1 kHz tone, glitch hits, vertical-hold
  // roll, then a CRT power-off (collapse to a line, then to a dot).        5 s
  recipe('testcard', (D, T, o) => {
    const { tl } = D;
    const top = ['#c0c0c0', '#c0c000', '#00c0c0', '#00c000', '#c000c0', '#c00000', '#0000c0'];
    const mid = ['#0000c0', '#131313', '#c000c0', '#131313', '#00c0c0', '#131313', '#c0c0c0'];
    const bot = [['#00214c', 5], ['#ffffff', 5], ['#32006a', 5], ['#131313', 6.5], ['#090909', 1.5], ['#131313', 1.5], ['#1d1d1d', 1.5], ['#131313', 4]];
    const card = `<div class="tc-card">
      <div class="tc-row tc-top">${top.map(c => `<i style="background:${c}"></i>`).join('')}</div>
      <div class="tc-row tc-mid">${mid.map(c => `<i style="background:${c}"></i>`).join('')}</div>
      <div class="tc-row tc-bot">${bot.map(([c, f]) => `<i style="background:${c};flex:${f}"></i>`).join('')}</div></div>`;
    const s = D.scene('testcard', `<div class="tc-roll">${card}${card}</div>
      <div class="tc-box mono c"><b>${o.text || 'SIN SEÑAL'}</b><span>${o.sub || 'CANAL 03'}</span></div>`);
    const dotScene = D.scene('testcard-dot', '<i class="tc-dot"></i>');
    const roll = D.$('.tc-roll', s), box = D.$('.tc-box b', s), dot = D.$('.tc-dot', dotScene);
    gsap.set(s, { transformOrigin: '50% 50%', filter: 'brightness(1)' });
    gsap.set(dot, { scale: 0 });

    D.show(s, T);
    D.setBg('#000', T);
    D.ink('#ffffff', T);
    if (o.label) D.label(T, o.label);
    D.sfx('beep', T + 0.05, 1000, 1.7, 0.09);
    if (D.glitch) {
      D.glitch(T + 1.0, { dur: 0.15, amt: 0.5 });
      D.glitch(T + 1.6, { dur: 0.25, amt: 0.85 });
      D.glitch(T + 2.15, { dur: 0.12, amt: 0.5 });
    }
    tl.to(box, { duration: 0.3, scrambleText: { text: box.textContent, chars: SCRAMBLE, speed: 1 }, ease: 'none' }, T + 1.6);
    // vertical hold lost: the picture rolls, faster each time
    D.call(() => SFX.hiss('tc-hiss', 0.06), T + 2.4);
    [[2.4, 0.6, 'power1.in'], [3.0, 0.35, 'none'], [3.35, 0.22, 'none']].forEach(([dt, d, ease]) => {
      tl.set(roll, { yPercent: 0 }, T + dt);
      tl.to(roll, { yPercent: -50, duration: d, ease }, T + dt);
    });
    tl.set(roll, { yPercent: 0 }, T + 3.57);
    // CRT power-off
    const off = T + 3.6;
    tl.to(s, { scaleY: 0.004, filter: 'brightness(4)', duration: 0.16, ease: 'power4.in' }, off);
    tl.to(s, { scaleX: 0, duration: 0.2, ease: 'expo.in' }, off + 0.17);
    D.show(dotScene, off + 0.3);
    tl.set(dot, { scale: 1 }, off + 0.35);
    tl.to(dot, { scale: 0, opacity: 0, duration: 0.5, ease: 'power2.in' }, off + 0.4);
    D.sfx('zap', off, 0.45);
    D.call(() => SFX.padStop('tc-hiss', 0.05), off + 0.15);
    D.hide(s, off + 0.4);
    D.hide(dotScene, T + 5);
    return 5;
  });

  // ------------------------------------------------------------------ CORRUPT
  // One word per 2 beats, each one "decoded" by a scramble, then torn: the word
  // splits into horizontal slices that jump sideways, with RGB ghosts; hard colour
  // cuts and a fake error code per word.                              n × step (1 s)
  recipe('corrupt', (D, T, o) => {
    const { tl, C } = D;
    const words = o.words || ['SEÑAL', 'RUIDO', 'ERROR'];
    const step = o.step || 1, SL = 6, n = words.length;
    const ghosts = o.split || [C.a[1], C.a[2]];
    const schemes = [[C.night, C.paper], [C.a[0], C.ink], [C.paper, C.ink], [C.a[1], C.ink], [C.ink, C.a[0]], [C.a[4], C.paper]];
    const slice = w => Array.from({ length: SL }, (_, k) =>
      `<span class="cw-sl" style="clip-path:inset(${((k * 100) / SL).toFixed(2)}% 0 ${(100 - ((k + 1) * 100) / SL).toFixed(2)}% 0)">${w}</span>`).join('');
    const s = D.scene('corrupt', `<div class="co-idx mono"></div>${words.map(w => `
      <div class="cw v c"><span class="cw-size">${w}</span><span class="cw-gh" style="color:${ghosts[0]}">${w}</span><span class="cw-gh" style="color:${ghosts[1]}">${w}</span><span class="cw-main"></span>${slice(w)}</div>`).join('')}
      <div class="co-code mono"></div>`);
    const idx = D.$('.co-idx', s), code = D.$('.co-code', s), els = D.$$('.cw', s);
    els.forEach(el => D.fit(el, 1650));
    gsap.set(els, { autoAlpha: 0 });
    gsap.set(D.$$('.cw-gh, .cw-sl', s), { opacity: 0 });

    D.show(s, T);
    if (o.label) D.label(T, o.label);
    words.forEach((w, i) => {
      const t = T + i * step, el = els[i], [bg, fg] = schemes[i % schemes.length];
      const main = D.$('.cw-main', el), gh = D.$$('.cw-gh', el), sl = D.$$('.cw-sl', el);
      const r = j => hash(i * 7919 + 13, j);
      D.setBg(bg, t);
      tl.to([s, D.hud], { color: fg, duration: 0.01, ease: 'none' }, t);
      D.show(el, t);
      D.hide(el, t + step);
      tl.to(main, { duration: 0.3, scrambleText: { text: w, chars: SCRAMBLE, speed: 1 }, ease: 'none' }, t);
      // tear: main hides, slices jump for 6 frames, ghosts split
      const tb = t + 0.32;
      tl.set(main, { opacity: 0 }, tb);
      tl.set(sl, { opacity: 1 }, tb);
      tl.set(gh, { opacity: 0.9 }, tb);
      for (let f = 0; f < 6; f++) {
        const tf = tb + f / FPS, amp = 1 - f / 7;
        sl.forEach((x, k) => tl.set(x, { x: Math.round((r(f * 17 + k) - 0.5) * 300 * amp) }, tf));
        tl.set(gh[0], { x: Math.round(-8 - r(f * 5 + 90) * 28 * amp), y: Math.round((r(f + 60) - 0.5) * 10) }, tf);
        tl.set(gh[1], { x: Math.round(8 + r(f * 5 + 91) * 28 * amp), y: Math.round((r(f + 61) - 0.5) * 10) }, tf);
      }
      const ts = tb + 6 / FPS;
      tl.set(sl, { opacity: 0, x: 0 }, ts);
      tl.set(main, { opacity: 1 }, ts);
      tl.set(gh[0], { x: -4, y: 0, opacity: 0.8 }, ts);
      tl.set(gh[1], { x: 4, y: 0, opacity: 0.8 }, ts);
      // aftershock
      const ta = t + 0.78;
      tl.set(main, { opacity: 0 }, ta);
      tl.set(sl, { opacity: 1 }, ta);
      sl.forEach((x, k) => tl.set(x, { x: Math.round((r(200 + k) - 0.5) * 140) }, ta));
      tl.set(sl, { opacity: 0, x: 0 }, ta + 2 / FPS);
      tl.set(main, { opacity: 1 }, ta + 2 / FPS);

      const hex = Math.floor(r(999) * 0xffff).toString(16).toUpperCase().padStart(4, '0');
      tl.to(code, { duration: 0.4, scrambleText: { text: `ERR 0x${hex} · ${(o.codes && o.codes[i]) || 'E_' + w.replace(/[^A-ZÑ]/gi, '')}`, chars: '0123456789ABCDEF', speed: 1 }, ease: 'none' }, t);
      tl.to(idx, { duration: 0.3, scrambleText: { text: `${pad2(i + 1)} / ${pad2(n)}`, chars: '0123456789' }, ease: 'none' }, t);
      if (D.glitch) D.glitch(t, { dur: 0.16, amt: 0.7, sound: false });
      D.sfx('kick', t, 0.95);
      D.sfx('glitch', tb, 0.25, 0.3);
      D.sfx('clap', t + 0.5, 0.3);
      D.sfx('kick', t + 0.5, 0.75);
      D.sfx('hat', t + 0.25);
      D.sfx('hat', t + 0.75);
      [0, 0.25, 0.5, 0.75].forEach((dt, k) => D.sfx('bass', t + dt, [55, 43.65, 65.41, 49][i % 4] * (k % 2 ? 2 : 1), 0.28));
    });
    D.hide(s, T + n * step);
    return n * step;
  });

  // ------------------------------------------------------------------ DATAMOSH
  // A canvas composition (spectrum bars + giant word) "melts" like a video that
  // lost its I-frame: macroblocks drift along motion vectors, pixel-sort streaks
  // drip, scanlines jitter — then a clean I-frame rebuilds it.         5 s
  recipe('datamosh', (D, T, o) => {
    const { tl, C } = D;
    const W = 1920, H = 1080, BW = 120, BH = 120, COLS = 16, ROWS = 9;
    const src = document.createElement('canvas');
    src.width = W; src.height = H;
    const x = src.getContext('2d');
    x.fillStyle = C.night;
    x.fillRect(0, 0, W, H);
    for (let i = 0; i < 24; i++) { x.globalAlpha = 0.55; x.fillStyle = D.ramp(C.spectrum, i / 23); x.fillRect(i * 80, 0, 80, H); }
    x.globalAlpha = 1;
    x.fillStyle = C.a[1];
    x.beginPath(); x.arc(W * 0.66, H * 0.42, 250, 0, Math.PI * 2); x.fill();
    const word = o.word || 'DATAMOSH';
    let size = 330;
    const setFont = sz => { x.font = `900 ${sz}px "${D.cfg.fonts.display}"`; if (D.cfg.fonts.stretch && 'fontStretch' in x) x.fontStretch = 'expanded'; };
    setFont(size);
    const w = x.measureText(word).width;
    if (w > 1700) { size *= 1700 / w; setFont(size); }
    x.textAlign = 'center'; x.textBaseline = 'middle';
    x.lineWidth = 6; x.strokeStyle = C.night; x.strokeText(word, W / 2, H / 2);
    x.fillStyle = C.paper; x.fillText(word, W / 2, H / 2);

    const M = { alpha: 0, mosh: 0, sort: 0, jit: 0, frame: 0 };
    const s = D.scene('datamosh', '<div class="dm-cap mono"></div>');
    const cap = D.$('.dm-cap', s);
    const phase = () => (M.mosh > 0.02 ? o.lost || 'PERDIDO' : M.frame < 0.6 * FPS ? o.ok || 'OK' : o.found || 'RECUPERADO');
    let capText = '';
    D.layer(M, g => {
      // caption is written at render time, after every tween of this frame has applied (seek-safe)
      const txt = `P-FRAMES ${String(Math.floor(M.frame)).padStart(3, '0')} · I-FRAME ${phase()}`;
      if (txt !== capText) cap.textContent = capText = txt;
      g.globalAlpha = M.alpha;
      g.drawImage(src, 0, 0);
      if (M.mosh > 0.001) {
        for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
          const i = r * COLS + c;
          if (hash(i, 7) > 0.58) continue;
          const dx = (hash(i, 1) - 0.5) * 900 * M.mosh, dy = (hash(i, 2) - 0.5) * 320 * M.mosh;
          const sx = Math.max(0, Math.min(W - BW, c * BW - dx)), sy = Math.max(0, Math.min(H - BH, r * BH - dy));
          g.drawImage(src, sx, sy, BW, BH, c * BW, r * BH, BW, BH);
        }
      }
      if (M.sort > 0.001) {
        for (let k = 0; k < 80; k++) {
          const sx = Math.floor(hash(k, 11) * 1880), sw = 4 + hash(k, 12) * 40, y0 = hash(k, 13) * 900;
          g.drawImage(src, sx, y0, sw, 2, sx, y0, sw, M.sort * (80 + hash(k, 14) * 760));
        }
      }
      if (M.jit > 0.001) {
        const f = Math.floor(M.frame);
        for (let k = 0; k < 12; k++) {
          const key = f * 13 + k, y = hash(key, 21) * 1060, h = 4 + hash(key, 22) * 60;
          g.drawImage(src, 0, y, W, h, (hash(key, 23) - 0.5) * 320 * M.jit, y, W, h);
        }
      }
    });

    const dur = o.duration || 5;
    D.show(s, T);
    D.ink(C.paper, T);
    tl.to(s, { color: C.paper, duration: 0.01 }, T);
    if (o.label) D.label(T, o.label);
    tl.set(M, { alpha: 1 }, T);
    tl.to(M, { frame: dur * FPS, duration: dur, ease: 'none' }, T);
    tl.to(M, { mosh: 1, duration: 2.7, ease: 'power2.in' }, T + 0.6);
    tl.to(M, { sort: 1, duration: 1.8, ease: 'power2.in' }, T + 1.5);
    tl.to(M, { jit: 1, duration: 0.3 }, T + 2.6);
    D.call(() => SFX.pad('mosh', [41.2, 61.7, 82.4], 1, 0.04, 380), T + 0.02);
    D.sfx('riser', T + 1.3, 2.3, 0.35);
    if (D.glitch) { D.glitch(T + 1.1, { dur: 0.15, amt: 0.5 }); D.glitch(T + 2.2, { dur: 0.2, amt: 0.7 }); }
    // a clean I-frame arrives
    const tr = T + 3.6;
    tl.set(M, { mosh: 0, sort: 0, jit: 0 }, tr);
    D.flash(tr, 0.6, 0.35);
    D.shake(tr, 0.3, 12);
    D.sfx('boom', tr, 0.85);
    D.call(() => SFX.padStop('mosh', 0.4), tr);
    tl.to(M, { alpha: 0, duration: 0.35 }, T + dur - 0.45);
    D.hide(s, T + dur);
    return dur;
  });

  // ------------------------------------------------------------------ BSOD
  // A (brand-free) blue screen of panic: sad face, apology, % counter with
  // irregular jumps, a pseudo QR and a stop code — then it gets glitched out.   4.6 s
  recipe('bsod', (D, T, o) => {
    const { tl } = D;
    const bgc = o.bg || '#0a4fd6';
    let qr = '';
    for (let yy = 0; yy < 25; yy++) for (let xx = 0; xx < 25; xx++) {
      const finder = (a, b) => a >= 0 && a < 7 && b >= 0 && b < 7;
      const inF = finder(xx, yy) || finder(xx - 18, yy) || finder(xx, yy - 18);
      let on;
      if (inF) { const fx = xx >= 18 ? xx - 18 : xx, fy = yy >= 18 ? yy - 18 : yy; on = fx === 0 || fx === 6 || fy === 0 || fy === 6 || (fx >= 2 && fx <= 4 && fy >= 2 && fy <= 4); }
      else on = hash(xx * 31 + yy, 5) < 0.48;
      if (on) qr += `<rect x="${xx}" y="${yy}" width="1" height="1"/>`;
    }
    const s = D.scene('bsod', `<div class="bs">
      <div class="bs-face">:(</div>
      <p class="bs-p">${o.text || 'Tu tráiler se encontró con un problema y tiene que reiniciarse. Estamos juntando información sobre el error y enseguida lo reiniciamos.'}</p>
      <p class="bs-pct"><b>0</b>% ${o.done || 'completado'}</p>
      <div class="bs-row"><svg class="bs-qr" viewBox="-1 -1 27 27"><rect x="-1" y="-1" width="27" height="27" fill="#fff"/><g fill="${bgc}">${qr}</g></svg>
        <div class="bs-info"><p>${o.info || 'Para más información sobre este problema, buscá en internet:'}</p><p>${o.code || 'Código de detención: GLITCH_NO_ES_UN_ERROR'}</p></div></div>
    </div>`);
    const num = D.$('.bs-pct b', s), para = D.$('.bs-p', s), face = D.$('.bs-face', s);
    D.show(s, T);
    D.setBg(bgc, T);
    D.ink('#ffffff', T);
    tl.to(s, { color: '#ffffff', duration: 0.01 }, T);
    if (o.label) D.label(T, o.label);
    D.sfx('beep', T, 440, 0.25, 0.1);
    [[0.7, 12], [1.3, 38], [1.9, 51], [2.6, 83], [3.1, 100]].forEach(([dt, v]) => {
      tl.to(num, { duration: 0.01, scrambleText: { text: String(v), chars: '0123456789' }, ease: 'none' }, T + dt);
      D.sfx('tick', T + dt, 0.05);
    });
    const tg = T + 3.45;
    if (D.glitch) D.glitch(tg, { dur: 0.55, amt: 1.2 });
    tl.to(para, { duration: 0.5, scrambleText: { text: para.textContent, chars: SCRAMBLE, speed: 2 }, ease: 'none' }, tg);
    tl.to(face, { duration: 0.3, scrambleText: { text: ':)', chars: SCRAMBLE }, ease: 'none' }, tg + 0.2);
    D.hide(s, T + 4.6);
    return 4.6;
  });
})();
