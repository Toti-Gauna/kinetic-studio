/* ============================================================================
   TRAILER ENGINE — reusable core for code-only cinematic trailers.

   A fixed 1920×1080 stage scaled to fit, ONE master GSAP timeline, a canvas FX
   layer (particles / warp tunnel), a film HUD and playback controls.
   Scenes are "recipes" (recipes.js) sequenced by Trailer.run(config) (trailer.js).

   Everything is deterministic and seekable: open index.html?t=SECONDS to freeze
   any frame. Docs: ~/.claude/trailer-kit/README.md
   ========================================================================== */
(() => {
  'use strict';

  gsap.registerPlugin(SplitText, MorphSVGPlugin, DrawSVGPlugin, ScrambleTextPlugin);

  const W = 1920, H = 1080, CX = W / 2, CY = H / 2;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const recipes = {};
  const plugins = []; // { setup(D, cfg), scene(D, T, sceneOptions, dur), done(D, cfg) } — e.g. recipes-glitch.js

  const NOTES = { E4: 329.63, A4: 440, C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99, A5: 880, C6: 1046.5, D6: 1174.66 };
  const DEFAULTS = {
    meta: { title: 'UNTITLED', subtitle: 'A MOTION STUDY', hud: 'MOTION STUDY' },
    palette: {
      night: '#07070a', ink: '#0e0e10', paper: '#f2ede4',
      accents: ['#ff4d2e', '#2b50ff', '#ffc21a', '#d4ff3a', '#ff2e88', '#6a2bff'],
    },
    fonts: { display: 'Archivo', mono: 'JetBrains Mono', serif: 'Instrument Serif', stretch: true },
    seed: 7,
    locale: 'en-US',
    // every player / intro string, so a trailer can be fully localised
    ui: {
      play: 'PRESS PLAY', seconds: 'SECONDS', sound: 'SOUND ON', replay: 'REPLAY', back: 'BACK',
      keys: 'SPACE PAUSE · M MUTE · R REPLAY · F FULLSCREEN',
      paused: 'PAUSED', soundOn: 'SOUND ON', soundOff: 'SOUND OFF',
      particles: '{n} PARTICLES · 1 CANVAS · 0 IMAGES',
    },
  };

  // ---------------------------------------------------------------- colour
  function hex(h) {
    h = String(h).replace('#', '');
    if (h.length === 3) h = h.split('').map(c => c + c).join('');
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  }
  const rgba = (h, a = 1) => { const [r, g, b] = hex(h); return `rgba(${r},${g},${b},${a})`; };
  function ramp(stops, t) {
    t = Math.max(0, Math.min(1, t));
    const s = t * (stops.length - 1), i = Math.min(stops.length - 2, Math.floor(s)), f = s - i;
    const a = hex(stops[i]), b = hex(stops[i + 1]);
    return `rgb(${Math.round(a[0] + (b[0] - a[0]) * f)},${Math.round(a[1] + (b[1] - a[1]) * f)},${Math.round(a[2] + (b[2] - a[2]) * f)})`;
  }
  function luminance(h) {
    const [r, g, b] = hex(h).map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }
  const contrastRatio = (a, b) => { const la = luminance(a), lb = luminance(b); return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05); };
  const isLight = h => luminance(h) > 0.18; // WCAG crossover: dark text reads better above this

  // ---------------------------------------------------------------- seeded RNG
  function rng(seed) {
    let s = seed | 0;
    return () => {
      s = (s + 0x6d2b79f5) | 0;
      let t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // ---------------------------------------------------------------- shape paths (centred on 0,0)
  const r2 = n => Math.round(n * 100) / 100;
  const poly = pts => 'M' + pts.map(p => r2(p[0]) + ',' + r2(p[1])).join('L') + 'Z';
  const ngon = (n, r, rot = -Math.PI / 2) =>
    Array.from({ length: n }, (_, i) => { const a = rot + (i * 2 * Math.PI) / n; return [Math.cos(a) * r, Math.sin(a) * r]; });
  const starPts = (n, R, r) =>
    Array.from({ length: n * 2 }, (_, i) => { const a = -Math.PI / 2 + (i * Math.PI) / n, d = i % 2 ? r : R; return [Math.cos(a) * d, Math.sin(a) * d]; });
  const polar = (n, fn) =>
    Array.from({ length: n }, (_, i) => { const a = -Math.PI / 2 + (i * 2 * Math.PI) / n, d = fn(a); return [Math.cos(a) * d, Math.sin(a) * d]; });
  function smooth(pts) { // closed Catmull-Rom → cubic Béziers
    const n = pts.length;
    let d = `M${r2(pts[0][0])},${r2(pts[0][1])}`;
    for (let i = 0; i < n; i++) {
      const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
      d += `C${r2(p1[0] + (p2[0] - p0[0]) / 6)},${r2(p1[1] + (p2[1] - p0[1]) / 6)} ` +
           `${r2(p2[0] - (p3[0] - p1[0]) / 6)},${r2(p2[1] - (p3[1] - p1[1]) / 6)} ${r2(p2[0])},${r2(p2[1])}`;
    }
    return d + 'Z';
  }
  function circle(r) {
    const k = r2(r * 0.5523);
    return `M0,${-r}C${k},${-r} ${r},${-k} ${r},0C${r},${k} ${k},${r} 0,${r}C${-k},${r} ${-r},${k} ${-r},0C${-r},${-k} ${-k},${-r} 0,${-r}Z`;
  }
  const CROSS = [[-66, -218], [66, -218], [66, -66], [218, -66], [218, 66], [66, 66], [66, 218], [-66, 218], [-66, 66], [-218, 66], [-218, -66], [-66, -66]];
  // Morph library, sized for a viewBox of -250..250 at k = 1
  function forms(k = 1) {
    const sc = pts => pts.map(p => [p[0] * k, p[1] * k]);
    return {
      circle: circle(200 * k),
      square: poly(sc([[-180, -180], [180, -180], [180, 180], [-180, 180]])),
      triangle: poly(ngon(3, 240 * k)),
      blob: smooth(polar(9, a => (188 + 36 * Math.sin(3 * a + 0.6) + 18 * Math.cos(5 * a)) * k)),
      star: poly(starPts(5, 245 * k, 108 * k)),
      hexagon: poly(ngon(6, 222 * k, 0)),
      cross: poly(sc(CROSS)),
      flower: smooth(polar(48, a => (168 + 52 * Math.cos(6 * a)) * k)),
    };
  }

  // ================================================================ RUN
  function run(userCfg = {}) {
    const cfg = {
      ...DEFAULTS, ...userCfg,
      meta: { ...DEFAULTS.meta, ...(userCfg.meta || {}) },
      palette: { ...DEFAULTS.palette, ...(userCfg.palette || {}) },
      fonts: { ...DEFAULTS.fonts, ...(userCfg.fonts || {}) },
      ui: { ...DEFAULTS.ui, ...(userCfg.ui || {}) },
    };
    const p = cfg.palette;
    const a = Array.from({ length: 6 }, (_, i) => p.accents[i % p.accents.length]);
    const C = {
      night: p.night, ink: p.ink, paper: p.paper, a,
      spectrum: p.spectrum || [a[1], a[5], a[4], a[0], a[2]],
      glow: p.glow || a[5],
    };

    const css = document.documentElement.style;
    css.setProperty('--night', C.night);
    css.setProperty('--ink', C.ink);
    css.setProperty('--paper', C.paper);
    css.setProperty('--glow', C.glow);
    a.forEach((c, i) => css.setProperty(`--a${i + 1}`, c));
    css.setProperty('--display', `'${cfg.fonts.display}', system-ui, sans-serif`);
    css.setProperty('--mono', `'${cfg.fonts.mono}', ui-monospace, monospace`);
    css.setProperty('--serif', `'${cfg.fonts.serif}', Georgia, serif`); // <i> inside display text = editorial italic
    document.title = cfg.meta.pageTitle || `${cfg.meta.title} — ${cfg.meta.subtitle}`;
    $('#intro-title').textContent = cfg.meta.title;
    $('#hud-brand').textContent = cfg.meta.hud;
    const setText = (sel, txt) => { const el = $(sel); if (el) el.textContent = txt; };
    setText('#intro-keys', cfg.ui.keys);
    setText('#replay', '↺  ' + cfg.ui.replay);
    if (cfg.lang) document.documentElement.lang = cfg.lang;
    // meta.back: a URL (e.g. a trailer hub) shown as a back link on the intro and end screens; Esc goes there too
    if (cfg.meta.back) {
      ['#intro-back', '#end-back'].forEach(sel => { const a = $(sel); if (a) { a.href = cfg.meta.back; a.hidden = false; a.textContent = '← ' + cfg.ui.back; } });
      addEventListener('keydown', e => { if (e.key === 'Escape' && !document.fullscreenElement) location.href = cfg.meta.back; });
    }

    const loads = [`900 100px "${cfg.fonts.display}"`, `300 30px "${cfg.fonts.display}"`, `400 16px "${cfg.fonts.mono}"`, `italic 400 40px "${cfg.fonts.serif}"`]
      .map(f => document.fonts.load(f));
    Promise.race([Promise.all(loads).then(() => document.fonts.ready), new Promise(r => setTimeout(r, 5000))])
      .catch(() => {})
      .then(() => { try { build(cfg, C); } catch (err) { fail(err); } });
  }

  function fail(err) {
    console.error(err);
    document.documentElement.dataset.trailer = 'error: ' + ((err && err.message) || err);
    const st = $('#intro-state');
    if (st) st.textContent = 'ERROR — SEE CONSOLE';
  }
  addEventListener('error', e => { document.documentElement.dataset.trailer = 'error: ' + e.message; });

  // ================================================================ BUILD
  function build(cfg, C) {
    const stage = $('#stage'), camera = $('#camera'), bg = $('#bg'), wipe = $('#wipe'), flashEl = $('#flash');
    const bars = $$('.bar'), hud = $('#hud'), hudScene = $('#hud-scene'), hudTC = $('#hud-tc'), hudNum = $('#hud-num');
    const cvs = $('#fx'), g = cvs.getContext('2d');
    const progressBar = $('#progress i');
    const intro = $('#intro'), playBtn = $('#play'), introState = $('#intro-state'), introSub = $('#intro-sub');
    const endEl = $('#end'), replayBtn = $('#replay'), uiState = $('#ui-state');
    const query = new URLSearchParams(location.search);
    const embed = query.has('embed'); // silent, chrome-less preview driven by postMessage (used by a hub)
    const seekTo = query.has('t') || embed ? parseFloat(query.get('t')) || 0 : null;
    if (embed) document.body.classList.add('embed');

    // ---- stage fit
    let K = 1;
    function fitStage() {
      const s = Math.min(innerWidth / W, innerHeight / H);
      stage.style.transform = `translate(-50%, -50%) scale(${s})`;
      const k = Math.min(1.5, Math.max(1, s * (devicePixelRatio || 1)));
      if (Math.abs(k - K) > 0.01) { K = k; cvs.width = Math.round(W * K); cvs.height = Math.round(H * K); }
    }
    addEventListener('resize', fitStage);
    fitStage();

    // ---- film grain
    (() => {
      const c = document.createElement('canvas');
      c.width = c.height = 256;
      const x = c.getContext('2d'), img = x.createImageData(256, 256);
      for (let i = 0; i < img.data.length; i += 4) {
        const v = Math.random() * 255;
        img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
        img.data[i + 3] = 255;
      }
      x.putImageData(img, 0, 0);
      $('#grain').style.backgroundImage = `url(${c.toDataURL()})`;
    })();

    const rand = rng(cfg.seed);
    const rnd = (lo, hi) => lo + (hi - lo) * rand();
    const tl = gsap.timeline({ paused: true, onUpdate: tick, onComplete: ended });

    // ============================================================ DIRECTOR API (passed to recipes)
    let sceneCount = 0, labelCount = 0;
    const D = {
      W, H, CX, CY, C, N: NOTES, cfg, tl, rand, rnd, ramp, rgba, isLight, $, $$,
      /** ink or paper, whichever reads better on `bg` (WCAG contrast ratio) */
      contrast: bg => (contrastRatio(bg, C.ink) >= contrastRatio(bg, C.paper) ? C.ink : C.paper),
      /** chromatic-aberration text-shadow in palette colours; px = split distance (0 = settled) */
      chroma: (px, a = 0.9) => `${-px}px 0 0 ${rgba(C.a[4], a)}, ${px}px 0 0 ${rgba(C.a[1], a)}`,
      fmt: n => n.toLocaleString(cfg.locale),
      forms,
      shapes: { poly, ngon, star: starPts, polar, smooth, circle },
      stage, camera, bg, wipe, flashEl, hud, bars,

      /** Create a <section class="scene"> inside the camera. `.c` children get centred. */
      scene(name, html) {
        const s = document.createElement('section');
        s.className = 'scene';
        s.id = `s${++sceneCount}-${name}`;
        s.innerHTML = html;
        camera.appendChild(s);
        gsap.set($$('.c', s), { xPercent: -50, yPercent: -50 });
        return s;
      },
      split: (el, vars) => SplitText.create(el, vars),
      /** An element's box in stage coordinates (1920×1080), measured at build time. */
      box(el) {
        const sr = stage.getBoundingClientRect(), k = sr.width / W, r = el.getBoundingClientRect();
        return { x: (r.left - sr.left) / k, y: (r.top - sr.top) / k, w: r.width / k, h: r.height / k };
      },
      /** Shrink an element's font-size so its rendered width is <= maxW. Call before splitting. */
      fit(el, maxW) {
        const w = el.offsetWidth;
        if (w > maxW) el.style.fontSize = (parseFloat(getComputedStyle(el).fontSize) * maxW / w).toFixed(1) + 'px';
        return el;
      },
      sfx: (name, at, ...args) => tl.call(() => SFX[name](...args), null, at),
      call: (fn, at) => tl.call(fn, null, at),
      show: (el, at) => tl.set(el, { autoAlpha: 1 }, at),
      hide: (el, at) => tl.set(el, { autoAlpha: 0 }, at),
      /** set + to at the same position: a fromTo that rewinds cleanly on replay/seek. */
      hit(el, from, to, at) { tl.set(el, from, at); tl.to(el, to, at); },
      ink: (color, at) => tl.to(hud, { color, duration: 0.01, ease: 'none' }, at),
      setBg: (color, at) => tl.set(bg, { backgroundColor: color }, at),
      barsTo(h, at, dur = 0.9, ease = 'expo.inOut') {
        return dur ? tl.to(bars, { height: h, duration: dur, ease }, at) : tl.set(bars, { height: h }, at);
      },
      flash(at, peak = 1, dur = 0.6, color = '#ffffff') {
        tl.set(flashEl, { backgroundColor: color, opacity: peak }, at);
        tl.to(flashEl, { opacity: 0, duration: dur, ease: 'power2.out' }, at);
      },
      shake(at, dur = 0.5, amp = 14, grow = false) {
        const n = Math.max(2, Math.round(dur / 0.045)), kf = [];
        for (let i = 0; i < n; i++) {
          const k = grow ? (i + 1) / n : 1 - i / n;
          kf.push({ x: rnd(-amp, amp) * k, y: rnd(-amp, amp) * k, rotation: rnd(-0.5, 0.5) * k, duration: dur / n, ease: 'none' });
        }
        kf.push({ x: 0, y: 0, rotation: 0, duration: 0.06, ease: 'power2.out' });
        tl.to(camera, { keyframes: kf }, at);
      },
      /** HUD scene label ("03 — SHIFT"), auto-numbered. Returns the number string. */
      label(at, text) {
        const num = String(++labelCount).padStart(2, '0');
        tl.to(hudScene, { duration: 0.7, scrambleText: { text: `${num} — ${text}`, chars: 'upperCase', speed: 0.8 }, ease: 'none' }, at);
        tl.to(hudNum, { duration: 0.4, scrambleText: { text: num, chars: '0123456789' }, ease: 'none' }, at);
        D.sfx('tick', at, 0.04);
        return num;
      },
      /** Colour wipe of the whole background (under the scenes). */
      wipeTo(color, at, dir = 'right', dur = 0.44) {
        const from = { right: 'inset(0% 0% 0% 100%)', left: 'inset(0% 100% 0% 0%)', up: 'inset(100% 0% 0% 0%)', down: 'inset(0% 0% 100% 0%)' }[dir];
        tl.set(wipe, { backgroundColor: color, clipPath: from, autoAlpha: 1 }, at);
        tl.to(wipe, { clipPath: 'inset(0% 0% 0% 0%)', duration: dur, ease: 'expo.inOut' }, at);
        tl.set(bg, { backgroundColor: color }, at + dur);
        tl.set(wipe, { autoAlpha: 0 }, at + dur);
      },
      particles: o => makeParticles(o),
      tunnel: o => makeTunnel(o),
      /** Register a custom canvas layer: state must have `alpha`; draw(ctx, nowSeconds, playheadJumped). */
      layer(state, draw) { layers.push({ s: state, draw: (now, jump) => draw(g, now, jump) }); return state; },
    };

    // ============================================================ CANVAS ENGINE
    // Layers are pure functions of tweened params, so scrubbing the timeline scrubs the canvas.
    const layers = [];
    let canvasDirty = false;

    function sampleText(text, size, step) {
      const c = document.createElement('canvas');
      c.width = W; c.height = H;
      const x = c.getContext('2d');
      const setFont = sz => {
        x.font = `900 ${sz}px "${cfg.fonts.display}"`;
        if (cfg.fonts.stretch && 'fontStretch' in x) x.fontStretch = 'expanded';
      };
      setFont(size);
      const w = x.measureText(text).width;
      if (w > 1600) setFont(size * 1600 / w);
      x.fillStyle = '#fff';
      x.textAlign = 'center';
      x.textBaseline = 'middle';
      x.fillText(text, CX, CY + 8);
      const d = x.getImageData(0, 0, W, H).data, pts = [];
      for (let y = 0; y < H; y += step) for (let xx = 0; xx < W; xx += step) if (d[(y * W + xx) * 4 + 3] > 128) pts.push([xx, y]);
      return pts;
    }

    function makeParticles(o = {}) {
      let pts = sampleText(o.word || 'MOTION', o.size || 290, 4);
      if (!pts.length) pts = [[CX, CY]];
      // density scales with the word's ink area so long words don't look sparse
      const NP = o.count || Math.round(Math.min(4200, Math.max(2800, pts.length * 0.55)) / 100) * 100;
      const P = { alpha: 0, emerge: 0, spin: 0, form: 0, explode: 0, shimmer: 0, sweep: -1, count: NP };
      for (let i = pts.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [pts[i], pts[j]] = [pts[j], pts[i]]; }
      let minX = Infinity, maxX = -Infinity;
      pts.forEach(q => { minX = Math.min(minX, q[0]); maxX = Math.max(maxX, q[0]); });

      const A = () => new Float32Array(NP);
      const p = { tx: A(), ty: A(), a0: A(), rr: A(), sp: A(), dl: A(), dx: A(), dy: A(), ds: A(), px: A(), py: A(), buckets: [] };
      for (let i = 0; i < NP; i++) {
        const t = pts[i % pts.length], extra = i >= pts.length;
        p.tx[i] = t[0] + (extra ? rnd(-2, 2) : 0);
        p.ty[i] = t[1] + (extra ? rnd(-2, 2) : 0);
        const arm = Math.floor(rand() * 3), r = Math.pow(rand(), 0.7) * 760 + 10;
        p.rr[i] = r;
        p.a0[i] = arm * 2.094 + r * 0.0065 + rnd(-0.35, 0.35);
        p.sp[i] = 1.4 / (0.35 + r / 500);
        p.dl[i] = rand() * 0.33 + ((p.tx[i] - minX) / (maxX - minX + 1)) * 0.12;
        const ang = Math.atan2(p.ty[i] - CY, p.tx[i] - CX) + rnd(-0.5, 0.5);
        p.dx[i] = Math.cos(ang);
        p.dy[i] = Math.sin(ang);
        p.ds[i] = rnd(900, 2800);
        p.px[i] = CX;
        p.py[i] = CY;
      }
      const NB = 16, b = Array.from({ length: NB * 2 }, () => []);
      for (let i = 0; i < NP; i++) {
        const ci = Math.min(NB - 1, Math.floor(((p.tx[i] - minX) / (maxX - minX + 1)) * NB));
        b[ci * 2 + (rand() < 0.22 ? 1 : 0)].push(i);
      }
      p.buckets = b.map((idx, k) => ({ idx, color: ramp(C.spectrum, Math.floor(k / 2) / (NB - 1)), w: k % 2 ? 3.4 : 1.9 }));
      layers.push({ s: P, draw: (now, jump) => drawParticles(p, P, now, jump) });
      return P;
    }

    function drawParticles(p, P, time, jump) {
      const E = P.emerge, F = P.form, X = P.explode, sh = P.shimmer * 2.2, sw = P.sweep;
      const lit = [];
      g.globalCompositeOperation = 'lighter';
      g.globalAlpha = P.alpha;
      g.lineCap = 'round';
      for (const b of p.buckets) {
        g.strokeStyle = b.color;
        g.lineWidth = b.w * (1 + X * 1.4);
        g.beginPath();
        for (const i of b.idx) {
          const ang = p.a0[i] + P.spin * p.sp[i], r = p.rr[i] * E;
          let x = CX + Math.cos(ang) * r * 1.25, y = CY + Math.sin(ang) * r * 0.5;
          let f = (F - p.dl[i]) / 0.55;
          f = f < 0 ? 0 : f > 1 ? 1 : f;
          f = f < 0.5 ? 4 * f * f * f : 1 - Math.pow(-2 * f + 2, 3) / 2;
          x += (p.tx[i] - x) * f;
          y += (p.ty[i] - y) * f;
          if (sh) { x += Math.sin(time * 2.1 + i) * sh; y += Math.cos(time * 1.7 + i * 1.3) * sh; }
          if (X) { const e = X * p.ds[i]; x += p.dx[i] * e; y += p.dy[i] * e; }
          const ox = p.px[i], oy = p.py[i], dd = (x - ox) * (x - ox) + (y - oy) * (y - oy);
          if (jump || dd > 360000 || dd < 0.5) { g.moveTo(x, y); g.lineTo(x + 0.1, y); }
          else { g.moveTo(ox, oy); g.lineTo(x, y); } // motion-blur streak from the previous frame
          p.px[i] = x;
          p.py[i] = y;
          if (sw > -0.5 && f > 0.9 && Math.abs(p.tx[i] / W - sw) < 0.035) lit.push(x, y);
        }
        g.stroke();
      }
      if (lit.length) {
        g.strokeStyle = '#fff';
        g.lineWidth = 3.2;
        g.beginPath();
        for (let k = 0; k < lit.length; k += 2) { g.moveTo(lit[k], lit[k + 1]); g.lineTo(lit[k] + 0.1, lit[k + 1]); }
        g.stroke();
      }
    }

    const RN = 30, RS = 230, RL = RN * RS, FOC = 640;
    const fog = z => Math.max(0, Math.min(1, (z - 40) / 380, (RL - z) / (RL * 0.45)));
    function shapePath(sides, r, rot) {
      g.beginPath();
      if (!sides) { g.arc(0, 0, r, 0, Math.PI * 2); return; }
      for (let j = 0; j < sides; j++) {
        const a = rot + (j * Math.PI * 2) / sides;
        j ? g.lineTo(Math.cos(a) * r, Math.sin(a) * r) : g.moveTo(Math.cos(a) * r, Math.sin(a) * r);
      }
      g.closePath();
    }

    function makeTunnel(o = {}) {
      const Tn = { alpha: 0, z: 0, streak: 30, roll: 0, hue: 0, core: 0 };
      const stars = Array.from({ length: o.stars || 460 }, () => {
        const a = rand() * Math.PI * 2, r = rnd(90, 1000);
        return { x: Math.cos(a) * r, y: Math.sin(a) * r, z: rand() * RL };
      });
      const cols = Array.from({ length: 72 }, (_, i) => ramp([...C.spectrum, C.a[3], C.spectrum[0]], i / 71));
      const sides = o.sides || [0, 4, 3, 6];
      layers.push({ s: Tn, draw: () => drawTunnel(Tn, stars, cols, sides) });
      return Tn;
    }

    function drawTunnel(Tn, stars, cols, sides) {
      g.translate(CX, CY);
      g.rotate(Tn.roll);
      g.globalCompositeOperation = 'lighter';
      const core = g.createRadialGradient(0, 0, 0, 0, 0, 560);
      core.addColorStop(0, `rgba(255,255,255,${0.4 * Tn.core})`);
      core.addColorStop(0.18, rgba(C.glow, 0.3 * Tn.core));
      core.addColorStop(1, 'rgba(0,0,0,0)');
      g.globalAlpha = Tn.alpha;
      g.fillStyle = core;
      g.fillRect(-600, -600, 1200, 1200);

      g.lineCap = 'round';
      g.strokeStyle = '#fff';
      g.lineWidth = 1.6;
      for (let band = 0; band < 3; band++) {
        g.globalAlpha = Tn.alpha * [0.22, 0.5, 0.9][band];
        g.beginPath();
        for (const s of stars) {
          const z = RL - ((s.z + Tn.z * 1.6) % RL);
          const zone = z > RL * 0.6 ? 0 : z > RL * 0.25 ? 1 : 2;
          if (zone !== band || z < 30) continue;
          const z2 = z + Tn.streak;
          g.moveTo((s.x * FOC) / z, (s.y * FOC) / z);
          g.lineTo((s.x * FOC) / z2, (s.y * FOC) / z2);
        }
        g.stroke();
      }
      for (let i = 0; i < RN; i++) {
        const z = RL - ((i * RS + Tn.z) % RL);
        if (z < 40) continue;
        const k = FOC / z, a = fog(z) * Tn.alpha;
        if (a <= 0.01) continue;
        g.strokeStyle = cols[Math.floor(i * 2.4 + Tn.hue * 72) % 72];
        shapePath(sides[i % sides.length], 540 * k, i * 0.4 + Tn.z * 0.00022 * (i % 2 ? 1 : -1));
        g.globalAlpha = a * 0.16;
        g.lineWidth = Math.max(2, 22 * k);
        g.stroke(); // soft bloom pass
        g.globalAlpha = a;
        g.lineWidth = Math.max(1, 4 * k);
        g.stroke();
      }
    }

    let lastT = -1;
    function render() {
      // a playhead jump (seek / replay) must not draw motion-blur streaks from stale positions
      const now = performance.now() / 1000, tt = tl.time(), jump = Math.abs(tt - lastT) > 0.25;
      lastT = tt;
      let a = 0;
      for (const L of layers) if (L.s.alpha > a) a = L.s.alpha;
      if (a < 0.005) {
        if (canvasDirty) { g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, cvs.width, cvs.height); canvasDirty = false; }
        return;
      }
      canvasDirty = true;
      g.setTransform(1, 0, 0, 1, 0, 0);
      g.clearRect(0, 0, cvs.width, cvs.height);
      g.setTransform(K, 0, 0, K, 0, 0);
      g.globalCompositeOperation = 'source-over';
      g.globalAlpha = a;
      g.fillStyle = C.night;
      g.fillRect(0, 0, W, H);
      const neb = g.createRadialGradient(CX, CY, 0, CX, CY, 950);
      neb.addColorStop(0, rgba(C.glow, 0.22));
      neb.addColorStop(1, rgba(C.glow, 0));
      g.fillStyle = neb;
      g.fillRect(0, 0, W, H);
      for (const L of layers) {
        if (L.s.alpha <= 0.005) continue;
        g.save();
        L.draw(now, jump);
        g.restore();
      }
    }

    // ============================================================ SEQUENCE THE SCENES
    gsap.set(hud, { autoAlpha: 0 });
    gsap.set(bars, { height: 0 });
    const scenes = (cfg.scenes || []).filter(s => s && !s.skip);
    $('#hud-total').textContent = String(scenes.filter(s => s.label).length).padStart(2, '0');
    tl.to(hud, { autoAlpha: 1, duration: 1.2, ease: 'power2.out' }, cfg.hudAt ?? 0.7);
    plugins.forEach(p => p.setup && p.setup(D, cfg));

    let t = 0;
    const map = [];
    for (const s of scenes) {
      const fn = recipes[s.type];
      if (!fn) throw new Error(`Unknown scene type "${s.type}". Available: ${Object.keys(recipes).join(', ')}`);
      const dur = fn(D, t, s);
      if (!(dur > 0)) throw new Error(`Recipe "${s.type}" must return its duration in seconds`);
      plugins.forEach(p => p.scene && p.scene(D, t, s, dur));
      map.push({ type: s.type, label: s.label || '', start: +t.toFixed(3), dur: +dur.toFixed(3) });
      t += dur;
    }
    tl.set({}, {}, t + (cfg.tail || 0));
    plugins.forEach(p => p.done && p.done(D, cfg)); // after every scene is sequenced (e.g. precomputed simulations)
    gsap.ticker.add(render);

    // ============================================================ PLAYBACK
    let started = false, autoPaused = false, idleTimer;
    const UI = cfg.ui, KEYS = UI.keys;

    function tick() {
      const tt = tl.time(), s = Math.floor(tt), f = Math.floor((tt - s) * 24);
      const mm = Math.floor(s / 60);
      hudTC.textContent = `00:${String(mm).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}:${String(f).padStart(2, '0')}`;
      progressBar.style.transform = `scaleX(${tl.progress()})`;
    }
    let loopFrom = 0;
    function ended() {
      if (embed) { tl.play(loopFrom); return; } // previews loop silently
      SFX.stopAll(1);
      gsap.to(endEl, { autoAlpha: 1, duration: 1, delay: 0.3 });
      setState('');
    }
    async function start() {
      if (started) return;
      started = true;
      playBtn.disabled = true;
      // never let a blocked/absent audio device hold the picture hostage
      await Promise.race([SFX.init(), new Promise(r => setTimeout(r, 500))]).catch(() => {});
      gsap.to(intro, { autoAlpha: 0, duration: 0.9, ease: 'power2.inOut', onComplete: () => intro.remove() });
      tl.play(0);
    }
    function replay() {
      if (!started) return;
      SFX.stopAll();
      SFX.resume();
      gsap.to(endEl, { autoAlpha: 0, duration: 0.3 });
      tl.restart();
      setState('');
    }
    function togglePause() {
      if (!started || tl.progress() === 1) return;
      if (tl.paused()) { tl.resume(); SFX.resume(); setState(''); }
      else { tl.pause(); SFX.suspend(); setState(UI.paused); }
    }
    function setState(msg) {
      uiState.textContent = msg ? msg + '  —  ' + KEYS : KEYS;
      if (msg) poke();
    }
    function poke() {
      document.body.classList.add('show-ui');
      document.body.classList.remove('idle');
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        document.body.classList.remove('show-ui');
        if (started) document.body.classList.add('idle');
      }, 1800);
    }
    function toggleFullscreen() {
      if (document.fullscreenElement) document.exitFullscreen();
      else document.documentElement.requestFullscreen?.().catch(() => {});
    }

    addEventListener('mousemove', poke);
    addEventListener('keydown', e => {
      if (e.repeat || e.metaKey || e.ctrlKey || e.altKey) return;
      const k = e.key.toLowerCase();
      if (k === ' ') { e.preventDefault(); started ? togglePause() : !playBtn.disabled && start(); }
      else if (k === 'r') replay();
      else if (k === 'm') { SFX.setMuted(!SFX.isMuted()); setState(SFX.isMuted() ? UI.soundOff : UI.soundOn); }
      else if (k === 'f') toggleFullscreen();
    });
    document.addEventListener('visibilitychange', () => {
      if (!started || tl.progress() === 1) return;
      if (document.hidden && !tl.paused()) { tl.pause(); SFX.suspend(); autoPaused = true; }
      else if (!document.hidden && autoPaused) { autoPaused = false; tl.resume(); SFX.resume(); }
    });
    playBtn.addEventListener('click', start);
    replayBtn.addEventListener('click', replay);
    setState('');

    // instrumentation read by tools/shoot.mjs
    const root = document.documentElement;
    root.dataset.duration = tl.duration().toFixed(2);
    root.dataset.scenes = JSON.stringify(map);
    if (!String(root.dataset.trailer || '').startsWith('error')) root.dataset.trailer = 'ready';
    window.trailer = { tl, map, D };

    introSub.innerHTML = `${cfg.meta.subtitle} <span>·</span> ${Math.round(tl.duration())} ${UI.seconds} <span>·</span> ${UI.sound}`;
    if (seekTo !== null) {
      intro.remove();
      started = true;
      tl.seek(Math.min(seekTo, tl.duration() - 0.01), false);
      if (embed) {
        // parent → { type: 'trailer:seek', t } | { type: 'trailer:play', t } | { type: 'trailer:pause' }
        addEventListener('message', e => {
          const d = e.data;
          if (!d || typeof d !== 'object') return;
          if (d.type === 'trailer:seek') { tl.pause(); tl.seek(Math.min(+d.t || 0, tl.duration() - 0.01), false); }
          else if (d.type === 'trailer:play') { loopFrom = Math.min(+d.t || 0, tl.duration() - 0.5); tl.play(loopFrom); }
          else if (d.type === 'trailer:pause') tl.pause();
        });
        if (parent !== window) parent.postMessage({ type: 'trailer:ready', duration: tl.duration(), scenes: map }, '*');
      }
      return;
    }
    playBtn.disabled = false;
    introState.textContent = UI.play;
    playBtn.focus({ preventScroll: true });
  }

  window.Trailer = {
    run,
    /** Register a scene recipe: fn(D, T, options) => durationSeconds */
    recipe: (name, fn) => { recipes[name] = fn; },
    /** Register a plugin: { setup(D, cfg) before the scenes, scene(D, T, options, dur) after each one, done(D, cfg) after all }. */
    plugin: p => { plugins.push(p); },
    recipes,
    util: { hex, rgba, ramp, isLight, contrastRatio, forms, poly, ngon, star: starPts, polar, smooth, circle },
  };
})();
