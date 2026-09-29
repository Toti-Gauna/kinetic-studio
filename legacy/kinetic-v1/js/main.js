/* KINETIC — a motion study.
   One master GSAP timeline drives every scene, the canvas engine and the score,
   so the film is deterministic and seekable: add ?t=SECONDS to the URL to jump to a frame. */
(() => {
  'use strict';

  gsap.registerPlugin(SplitText, MorphSVGPlugin, DrawSVGPlugin, ScrambleTextPlugin);

  // ---------------------------------------------------------------- constants
  const W = 1920, H = 1080, CX = W / 2, CY = H / 2;
  const C = {
    night: '#07070a', ink: '#0e0e10', cream: '#f2ede4', white: '#ffffff',
    coral: '#ff4d2e', blue: '#2b50ff', lime: '#d4ff3a', magenta: '#ff2e88', violet: '#6a2bff', gold: '#ffc21a',
  };
  const SPECTRUM = [C.blue, C.violet, C.magenta, C.coral, C.gold];
  const N = { E4: 329.63, A4: 440, C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99, A5: 880, C6: 1046.5, D6: 1174.66 };

  // Seeded RNG: every playback is frame-identical
  let seed = 0x5eed;
  function rand() {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  const rnd = (a, b) => a + (b - a) * rand();

  const hex = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  function ramp(stops, t) {
    t = Math.max(0, Math.min(1, t));
    const s = t * (stops.length - 1), i = Math.min(stops.length - 2, Math.floor(s)), f = s - i;
    const a = hex(stops[i]), b = hex(stops[i + 1]);
    return `rgb(${Math.round(a[0] + (b[0] - a[0]) * f)},${Math.round(a[1] + (b[1] - a[1]) * f)},${Math.round(a[2] + (b[2] - a[2]) * f)})`;
  }

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  const stage = $('#stage'), camera = $('#camera'), bg = $('#bg'), wipe = $('#wipe'), flashEl = $('#flash');
  const bars = $$('.bar'), hud = $('#hud'), hudScene = $('#hud-scene'), hudTC = $('#hud-tc'), hudNum = $('#hud-num');
  const cvs = $('#fx'), g = cvs.getContext('2d');
  const progressBar = $('#progress i');
  const intro = $('#intro'), playBtn = $('#play'), introState = $('#intro-state');
  const endEl = $('#end'), replayBtn = $('#replay'), uiState = $('#ui-state');

  const query = new URLSearchParams(location.search);
  const seekTo = query.has('t') ? parseFloat(query.get('t')) || 0 : null;

  // ---------------------------------------------------------------- stage fit
  let K = 1;
  function fit() {
    const s = Math.min(innerWidth / W, innerHeight / H);
    stage.style.transform = `translate(-50%, -50%) scale(${s})`;
    const k = Math.min(1.5, Math.max(1, s * (devicePixelRatio || 1)));
    if (Math.abs(k - K) > 0.01) {
      K = k;
      cvs.width = Math.round(W * K);
      cvs.height = Math.round(H * K);
    }
  }
  addEventListener('resize', fit);
  fit();

  (function grain() {
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

  // ---------------------------------------------------------------- shape paths
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
  const FORMS = {
    circle: circle(200),
    square: poly([[-180, -180], [180, -180], [180, 180], [-180, 180]]),
    triangle: poly(ngon(3, 240)),
    blob: smooth(polar(9, a => 188 + 36 * Math.sin(3 * a + 0.6) + 18 * Math.cos(5 * a))),
    star: poly(starPts(5, 245, 108)),
    hexagon: poly(ngon(6, 222, 0)),
    cross: poly([[-66, -218], [66, -218], [66, -66], [218, -66], [218, 66], [66, 66], [66, 218], [-66, 218], [-66, 66], [-218, 66], [-218, -66], [-66, -66]]),
    flower: smooth(polar(48, a => 168 + 52 * Math.cos(6 * a))),
  };

  // ---------------------------------------------------------------- scene data
  const STEPS = [
    { bg: C.coral,   fg: C.ink,   shape: C.cream,  word: 'SHAPE',  form: 'square' },
    { bg: C.blue,    fg: C.cream, shape: C.lime,   word: 'SHIFT',  form: 'triangle', cut: 'right' },
    { bg: C.lime,    fg: C.ink,   shape: C.violet, word: 'BEND',   form: 'blob' },
    { bg: C.ink,     fg: C.cream, shape: C.coral,  word: 'BREAK',  form: 'star',     cut: 'up' },
    { bg: C.cream,   fg: C.ink,   shape: C.blue,   word: 'BUILD',  form: 'hexagon' },
    { bg: C.magenta, fg: C.ink,   shape: C.gold,   word: 'BLEND',  form: 'cross',    cut: 'left' },
    { bg: C.violet,  fg: C.cream, shape: C.gold,   word: 'BLOOM',  form: 'flower' },
    { bg: C.ink,     fg: C.cream, shape: C.cream,  word: 'EVOLVE', form: 'circle',   cut: 'down' },
  ];
  const MEL = [N.A4, N.C5, N.D5, N.E5, N.G5, N.E5, N.A5, N.C6];
  const ROOTS = [55, 55, 43.65, 43.65, 65.41, 65.41, 49, 49];

  // Each word in scene 03 enters with its own personality
  const WORD_IN = [
    { from: { yPercent: 105, opacity: 0 }, to: { yPercent: 0, opacity: 1, duration: 0.7, ease: 'expo.out', stagger: 0.035 } },
    { from: { x: 280, skewX: -40, opacity: 0 }, to: { x: 0, skewX: 0, opacity: 1, duration: 0.6, ease: 'expo.out', stagger: 0.03 } },
    { from: { rotationX: -100, opacity: 0, transformOrigin: '50% 100%' }, to: { rotationX: 0, opacity: 1, duration: 0.8, ease: 'back.out(1.6)', stagger: 0.05 } },
    { from: { y: k => [-420, 360, -300, 420, -360][k % 5], rotation: k => [-50, 30, -24, 40, -35][k % 5], opacity: 0 },
      to: { y: 0, rotation: 0, opacity: 1, duration: 0.65, ease: 'power4.out', stagger: 0.03 } },
    { from: { scaleY: 0, transformOrigin: '50% 100%' }, to: { scaleY: 1, duration: 0.65, ease: 'expo.out', stagger: 0.05 } },
    { from: { opacity: 0, filter: 'blur(28px)', scale: 1.3 }, to: { opacity: 1, filter: 'blur(0px)', scale: 1, duration: 0.6, ease: 'power3.out', stagger: 0.04 } },
    { from: { scale: 0, opacity: 0 }, to: { scale: 1, opacity: 1, duration: 0.65, ease: 'back.out(3)', stagger: { each: 0.05, from: 'center' } } },
    { from: { yPercent: 105, opacity: 0 }, to: { yPercent: 0, opacity: 1, duration: 0.7, ease: 'expo.out', stagger: 0.03 } },
  ];

  const CARDS = [
    { bg: C.coral,   html: `<div class="m-word v c" style="color:${C.ink}">COLOR</div>`, from: { scale: 1.3 }, to: { scale: 1 } },
    { bg: C.ink,     html: `<div class="m-circle c" style="background:${C.cream}"></div>`, from: { x: 360, scale: 0.7 }, to: { x: 0, scale: 1 } },
    { bg: C.lime,    html: `<div class="m-word v c" style="color:${C.ink}">TYPE</div>`, from: { x: 260, skewX: -32 }, to: { x: 0, skewX: -12 } },
    { bg: C.blue,    html: `<div class="m-tri c" style="background:${C.cream}"></div>`, from: { rotation: -50, scale: 0.55 }, to: { rotation: 0, scale: 1 } },
    { bg: C.cream,   html: `<div class="m-word thin v c" style="color:${C.ink}">TIME</div>`, from: { scale: 0.86 }, to: { scale: 1 } },
    { bg: C.magenta, html: `<div class="m-sq c" style="background:${C.ink}"></div>`, from: { rotation: 0, scale: 0.4 }, to: { rotation: 45, scale: 1 } },
    { bg: C.violet,  html: `<div class="m-word v c" style="color:${C.lime}">LIGHT</div>`, from: { scale: 1.6, opacity: 0.3 }, to: { scale: 1, opacity: 1 } },
    { bg: C.ink,     html: `<div class="m-word outline v c">SPACE</div>`, from: { letterSpacing: '0em', paddingLeft: '0em' }, to: { letterSpacing: '0.3em', paddingLeft: '0.3em' } },
  ];
  const MONT = [N.A4, N.C5, N.D5, N.E5, N.G5, N.A5, N.C6, N.D6];

  const GRID = { cols: 25, rows: 13, gap: 72 };
  const tiles = [], tilePos = [];

  function prepareDOM() {
    const box = $('#s3-words');
    STEPS.forEach(st => {
      const d = document.createElement('div');
      d.className = 'w v';
      d.textContent = st.word;
      box.appendChild(d);
    });

    const grid = $('#grid');
    const x0 = CX - ((GRID.cols - 1) / 2) * GRID.gap, y0 = CY - ((GRID.rows - 1) / 2) * GRID.gap;
    for (let r = 0; r < GRID.rows; r++) {
      for (let c = 0; c < GRID.cols; c++) {
        const el = document.createElement('div');
        const x = x0 + c * GRID.gap, y = y0 + r * GRID.gap;
        el.className = 'tile';
        el.style.left = x - 28 + 'px';
        el.style.top = y - 28 + 'px';
        grid.appendChild(el);
        tiles.push(el);
        tilePos.push({ x, y, c, r });
      }
    }

    const s7 = $('#s7');
    CARDS.forEach(cd => {
      const el = document.createElement('div');
      el.className = 'card';
      el.style.background = cd.bg;
      el.innerHTML = cd.html;
      s7.appendChild(el);
    });
  }

  // ================================================================ CANVAS ENGINE
  // Particles (scene 05) and the warp tunnel (scene 06) are pure functions of
  // these tweened parameters, so scrubbing the timeline scrubs the canvas too.
  const P = { alpha: 0, emerge: 0, spin: 0, form: 0, explode: 0, shimmer: 0, sweep: -1 };
  const Tn = { alpha: 0, z: 0, streak: 30, roll: 0, hue: 0, core: 0 };
  const NP = 2800;
  let parts = null;

  function sampleText(text, size, step) {
    const c = document.createElement('canvas');
    c.width = W; c.height = H;
    const x = c.getContext('2d');
    x.fillStyle = '#fff';
    x.font = `900 ${size}px Archivo`;
    if ('fontStretch' in x) x.fontStretch = 'expanded';
    x.textAlign = 'center';
    x.textBaseline = 'middle';
    x.fillText(text, CX, CY + 8);
    const d = x.getImageData(0, 0, W, H).data, pts = [];
    for (let y = 0; y < H; y += step) for (let xx = 0; xx < W; xx += step) if (d[(y * W + xx) * 4 + 3] > 128) pts.push([xx, y]);
    return pts;
  }

  function buildParticles() {
    let pts = sampleText('MOTION', 290, 4);
    if (!pts.length) pts = [[CX, CY]];
    for (let i = pts.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [pts[i], pts[j]] = [pts[j], pts[i]]; }
    let minX = Infinity, maxX = -Infinity;
    pts.forEach(p => { minX = Math.min(minX, p[0]); maxX = Math.max(maxX, p[0]); });

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
    // Batch by colour × size to keep canvas state changes low
    const NB = 16, b = Array.from({ length: NB * 2 }, () => []);
    for (let i = 0; i < NP; i++) {
      const ci = Math.min(NB - 1, Math.floor(((p.tx[i] - minX) / (maxX - minX + 1)) * NB));
      b[ci * 2 + (rand() < 0.22 ? 1 : 0)].push(i);
    }
    p.buckets = b.map((idx, k) => ({ idx, color: ramp(SPECTRUM, Math.floor(k / 2) / (NB - 1)), w: k % 2 ? 3.4 : 1.9 }));
    parts = p;
  }

  function drawParticles(time) {
    const p = parts, E = P.emerge, F = P.form, X = P.explode, sh = P.shimmer * 2.2, sw = P.sweep;
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
        if (dd > 360000 || dd < 0.5) { g.moveTo(x, y); g.lineTo(x + 0.1, y); }
        else { g.moveTo(ox, oy); g.lineTo(x, y); }  // motion-blur streak from last frame
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
  const stars = Array.from({ length: 460 }, () => {
    const a = rand() * Math.PI * 2, r = rnd(90, 1000);
    return { x: Math.cos(a) * r, y: Math.sin(a) * r, z: rand() * RL };
  });
  const ringCols = Array.from({ length: 72 }, (_, i) => ramp([...SPECTRUM, C.lime, C.blue], i / 71));
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

  function drawTunnel() {
    g.save();
    g.translate(CX, CY);
    g.rotate(Tn.roll);
    g.globalCompositeOperation = 'lighter';

    const core = g.createRadialGradient(0, 0, 0, 0, 0, 560);
    core.addColorStop(0, `rgba(255,255,255,${0.4 * Tn.core})`);
    core.addColorStop(0.18, `rgba(150,110,255,${0.28 * Tn.core})`);
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
      g.strokeStyle = ringCols[Math.floor(i * 2.4 + Tn.hue * 72) % 72];
      shapePath([0, 4, 3, 6][i % 4], 540 * k, i * 0.4 + Tn.z * 0.00022 * (i % 2 ? 1 : -1));
      g.globalAlpha = a * 0.16;
      g.lineWidth = Math.max(2, 22 * k);
      g.stroke();  // soft bloom pass
      g.globalAlpha = a;
      g.lineWidth = Math.max(1, 4 * k);
      g.stroke();
    }
    g.restore();
  }

  let canvasDirty = false;
  function render() {
    if (P.alpha < 0.005 && Tn.alpha < 0.005) {
      if (canvasDirty) { g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, cvs.width, cvs.height); canvasDirty = false; }
      return;
    }
    canvasDirty = true;
    g.setTransform(K, 0, 0, K, 0, 0);
    g.globalAlpha = 1;
    g.globalCompositeOperation = 'source-over';
    g.fillStyle = '#060609';
    g.fillRect(0, 0, W, H);
    const neb = g.createRadialGradient(CX, CY, 0, CX, CY, 950);
    neb.addColorStop(0, `rgba(70,40,160,${0.34 * Math.max(P.alpha, Tn.alpha)})`);
    neb.addColorStop(1, 'rgba(6,6,9,0)');
    g.fillStyle = neb;
    g.fillRect(0, 0, W, H);
    if (Tn.alpha > 0.005) drawTunnel();
    if (P.alpha > 0.005 && parts) drawParticles(performance.now() / 1000);
    g.globalAlpha = 1;
    g.globalCompositeOperation = 'source-over';
  }

  // ================================================================ TIMELINE
  let tl;
  const sfx = (name, at, ...args) => tl.call(() => SFX[name](...args), null, at);
  const show = (el, at) => tl.set(el, { autoAlpha: 1 }, at);
  const hide = (el, at) => tl.set(el, { autoAlpha: 0 }, at);
  // set + to at the same position = a fromTo that rewinds cleanly on replay/seek
  const hit = (el, from, to, at) => { tl.set(el, from, at); tl.to(el, to, at); };
  const ink = (color, at) => tl.to(hud, { color, duration: 0.01, ease: 'none' }, at);

  function flash(at, peak = 1, dur = 0.6, color = '#ffffff') {
    tl.set(flashEl, { backgroundColor: color, opacity: peak }, at);
    tl.to(flashEl, { opacity: 0, duration: dur, ease: 'power2.out' }, at);
  }
  function shake(at, dur = 0.5, amp = 14, grow = false) {
    const n = Math.max(2, Math.round(dur / 0.045)), kf = [];
    for (let i = 0; i < n; i++) {
      const k = grow ? (i + 1) / n : 1 - i / n;
      kf.push({ x: rnd(-amp, amp) * k, y: rnd(-amp, amp) * k, rotation: rnd(-0.5, 0.5) * k, duration: dur / n, ease: 'none' });
    }
    kf.push({ x: 0, y: 0, rotation: 0, duration: 0.06, ease: 'power2.out' });
    tl.to(camera, { keyframes: kf }, at);
  }
  function label(at, text, num) {
    tl.to(hudScene, { duration: 0.7, scrambleText: { text, chars: 'upperCase', speed: 0.8 }, ease: 'none' }, at);
    tl.to(hudNum, { duration: 0.4, scrambleText: { text: num, chars: '0123456789' }, ease: 'none' }, at);
    sfx('tick', at, 0.04);
  }
  function wipeTo(color, at, dir = 'right', dur = 0.44) {
    const from = { right: 'inset(0% 0% 0% 100%)', left: 'inset(0% 100% 0% 0%)', up: 'inset(100% 0% 0% 0%)', down: 'inset(0% 0% 100% 0%)' }[dir];
    tl.set(wipe, { backgroundColor: color, clipPath: from, autoAlpha: 1 }, at);
    tl.to(wipe, { clipPath: 'inset(0% 0% 0% 0%)', duration: dur, ease: 'expo.inOut' }, at);
    tl.set(bg, { backgroundColor: color }, at + dur);
    tl.set(wipe, { autoAlpha: 0 }, at + dur);
  }

  // ---------------------------------------------------------------- 01 ORIGIN
  function scene1(T) {
    const s = $('#s1'), dot = $('#s1-dot'), rings = $$('#s1 .ring'), glow = $('#s1 .s1-glow');
    const a = SplitText.create('#s1-a', { type: 'chars', mask: 'chars' });
    const b = SplitText.create('#s1-b', { type: 'chars', mask: 'chars' });
    gsap.set([a.chars, b.chars], { yPercent: 115 });
    gsap.set(dot, { scale: 0 });
    gsap.set(rings, { scale: 0.08, opacity: 0 });
    gsap.set(glow, { opacity: 0, scale: 0.6 });

    show(s, T);
    tl.call(() => SFX.pad('drone', [55, 82.41], 3, 0.07, 260), null, T + 0.02);
    tl.to(bars, { height: 110, duration: 1.8, ease: 'expo.inOut' }, T + 0.05);
    tl.to(hud, { autoAlpha: 1, duration: 1.2, ease: 'power2.out' }, T + 0.7);
    label(T + 0.8, '01 — ORIGIN', '01');

    // heartbeat
    const ring = (el, at, size) => hit(el, { scale: 0.08, opacity: 0.9 }, { scale: size, opacity: 0, duration: 2, ease: 'expo.out' }, at);
    tl.to(dot, { scale: 1, duration: 0.9, ease: 'elastic.out(1.1, 0.35)' }, T + 0.5);
    tl.to(glow, { opacity: 1, scale: 1, duration: 2.5, ease: 'expo.out' }, T + 0.5);
    ring(rings[0], T + 0.5, 7);
    sfx('boom', T + 0.5, 0.9);

    hit(dot, { scale: 1.9 }, { scale: 1, duration: 0.9, ease: 'elastic.out(1, 0.32)' }, T + 1.5);
    hit(glow, { scale: 1.1 }, { scale: 1, duration: 1.2, ease: 'expo.out' }, T + 1.5);
    ring(rings[1], T + 1.5, 7);
    sfx('boom', T + 1.5, 0.65);

    hit(dot, { scale: 1.5 }, { scale: 1, duration: 0.8, ease: 'elastic.out(1, 0.32)' }, T + 2.5);
    ring(rings[2], T + 2.5, 5);
    sfx('boom', T + 2.5, 0.4);

    // copy
    tl.to(a.chars, { yPercent: 0, duration: 0.9, ease: 'expo.out', stagger: 0.028 }, T + 2.0);
    sfx('bell', T + 2.0, N.E5, 0.07);
    tl.to(a.chars, { yPercent: -115, duration: 0.45, ease: 'expo.in', stagger: 0.012 }, T + 3.05);
    tl.to(b.chars, { yPercent: 0, duration: 0.9, ease: 'expo.out', stagger: 0.028 }, T + 3.4);
    sfx('bell', T + 3.4, N.A5, 0.07);
    tl.to(b.chars, { yPercent: -115, duration: 0.45, ease: 'expo.in', stagger: 0.01 }, T + 4.25);

    // the point becomes a line…
    tl.to(glow, { opacity: 0, duration: 0.8 }, T + 4.2);
    tl.to(dot, { width: 1700, height: 3, duration: 0.85, ease: 'expo.inOut' }, T + 4.2);
    tl.to(dot, { backgroundColor: C.cream, boxShadow: '0 0 0px rgba(255,255,255,0), 0 0 0px rgba(120,110,255,0)', duration: 0.3 }, T + 4.7);
    sfx('whoosh', T + 4.2, 0.9, 0.45);

    // …and the line becomes a frame
    hide(dot, T + 5.0);
    tl.set(wipe, { backgroundColor: C.cream, clipPath: 'inset(538.5px 110px 538.5px 110px)', autoAlpha: 1 }, T + 5.0);
    tl.to(wipe, { clipPath: 'inset(0px 0px 0px 0px)', duration: 0.5, ease: 'expo.inOut' }, T + 5.0);
    tl.to(bars, { height: 0, duration: 0.5, ease: 'expo.inOut' }, T + 5.0);
    ink(C.ink, T + 5.2);
    sfx('whoosh', T + 5.0, 0.5, 0.3);
    tl.set(bg, { backgroundColor: C.cream }, T + 5.5);
    tl.set(wipe, { autoAlpha: 0 }, T + 5.5);
    hide(s, T + 5.5);
  }

  // ---------------------------------------------------------------- 02 FORM
  function scene2(T) {
    const s = $('#s2'), word = $('#s2-word'), guides = $$('#s2 .guide'), labels = $$('#s2 .s2-label');
    const shapes = ['#f-circle', '#f-square', '#f-tri'].map(q => $(q));
    const [ci, sq, tr] = shapes;
    const d = [circle(150), poly([[-140, -140], [140, -140], [140, 140], [-140, 140]]), poly(ngon(3, 175))];
    shapes.forEach((el, i) => $$('path', el).forEach(p => p.setAttribute('d', d[i])));
    const fills = shapes.map(el => $('.fill', el)), strokes = shapes.map(el => $('.stroke', el)), svgs = shapes.map(el => $('svg', el));

    gsap.set(guides, { drawSVG: '50% 50%' });
    gsap.set(strokes, { drawSVG: '0% 0%' });
    gsap.set(fills, { scale: 0, transformOrigin: '50% 50%' });
    gsap.set(shapes, { rotation: -120 });
    gsap.set(svgs[0], { transformOrigin: '50% 87.5%' });
    gsap.set(svgs[1], { transformOrigin: '50% 85%' });
    gsap.set(word, { opacity: 0, x: 170 });
    gsap.set(labels, { opacity: 0 });

    show(s, T);
    label(T, '02 — FORM', '02');
    sfx('kick', T, 0.8);
    sfx('bell', T, N.A4, 0.14);

    // construction
    tl.to(guides, { drawSVG: '0% 100%', duration: 1.2, ease: 'expo.inOut', stagger: 0.07 }, T);
    tl.to(strokes, { drawSVG: '0% 100%', duration: 1.15, ease: 'expo.inOut', stagger: 0.15 }, T + 0.15);
    tl.to(shapes, { rotation: 0, duration: 1.35, ease: 'expo.inOut', stagger: 0.15 }, T + 0.15);
    [N.C5, N.E5, N.G5].forEach((f, i) => sfx('bell', T + 0.35 + i * 0.15, f, 0.1));
    tl.to(word, { opacity: 1, duration: 1.6, ease: 'power2.out' }, T + 0.3);
    tl.to(word, { x: -170, duration: 5.2, ease: 'none' }, T + 0.3);

    // colour
    fills.forEach((f, i) => {
      const t = T + 1.5 + i * 0.25;
      tl.to(f, { scale: 1, duration: 0.75, ease: 'back.out(1.8)' }, t);
      sfx('kick', t, 0.75);
      sfx('bell', t, [N.A4, N.C5, N.E5][i], 0.14);
    });
    ['01 — CIRCLE', '02 — SQUARE', '03 — TRIANGLE'].forEach((txt, i) => {
      const t = T + 1.6 + i * 0.25;
      tl.set(labels[i], { opacity: 1 }, t);
      tl.to(labels[i], { duration: 0.6, scrambleText: { text: txt, chars: '0123456789', speed: 0.8 }, ease: 'none' }, t);
    });
    tl.to(strokes, { opacity: 0, duration: 0.5, ease: 'power2.out' }, T + 2.3);
    tl.to(guides, { drawSVG: '100% 100%', duration: 0.8, ease: 'expo.inOut', stagger: 0.05 }, T + 2.2);
    for (let t = T + 2; t < T + 4.9; t += 0.25) sfx('hat', t, 0.16);

    // choreography: swap
    const t1 = T + 2.5;
    tl.to(labels, { opacity: 0, duration: 0.3 }, t1);
    tl.to(ci, { x: 800, duration: 0.9, ease: 'power3.inOut' }, t1);
    tl.to(ci, { y: -300, duration: 0.45, ease: 'power2.out' }, t1);
    tl.to(ci, { y: 0, duration: 0.45, ease: 'power2.in' }, t1 + 0.45);
    tl.to(tr, { x: -800, rotation: -360, duration: 0.9, ease: 'power3.inOut' }, t1);
    tl.to(tr, { y: 190, duration: 0.45, ease: 'power2.out' }, t1);
    tl.to(tr, { y: 0, duration: 0.45, ease: 'power2.in' }, t1 + 0.45);
    tl.to(sq, { rotation: 90, duration: 0.7, ease: 'back.inOut(2)' }, t1 + 0.1);
    hit(svgs[0], { scaleX: 1.3, scaleY: 0.72 }, { scaleX: 1, scaleY: 1, duration: 0.8, ease: 'elastic.out(1, 0.35)' }, t1 + 0.9);
    sfx('whoosh', t1, 0.9, 0.45);
    sfx('kick', t1 + 0.9, 0.8);

    // hop
    const t2 = T + 3.5;
    tl.to(sq, { y: -240, duration: 0.36, ease: 'power2.out' }, t2);
    tl.to(sq, { y: 0, duration: 0.36, ease: 'power2.in' }, t2 + 0.36);
    tl.to(sq, { rotation: 270, duration: 0.72, ease: 'power2.inOut' }, t2);
    hit(svgs[1], { scaleX: 1.25, scaleY: 0.75 }, { scaleX: 1, scaleY: 1, duration: 0.7, ease: 'elastic.out(1, 0.35)' }, t2 + 0.72);
    sfx('whoosh', t2, 0.6, 0.35);
    sfx('kick', t2 + 0.72, 0.8);

    // converge → the circle swallows the frame
    const t3 = T + 4.3;
    tl.to(ci, { x: 400, scale: 1.3, duration: 0.6, ease: 'expo.inOut' }, t3);
    tl.to(tr, { x: -400, scale: 1.3, rotation: -480, duration: 0.6, ease: 'expo.inOut' }, t3);
    tl.to(sq, { scale: 1.3, rotation: 315, duration: 0.6, ease: 'expo.inOut' }, t3);
    sfx('whoosh', t3, 0.6, 0.4);
    sfx('riser', t3 + 0.2, 1.0, 0.4);
    tl.to(word, { opacity: 0, duration: 0.3 }, T + 4.9);
    tl.to([sq, tr], { scale: 0, duration: 0.32, ease: 'expo.in' }, T + 4.95);
    tl.set(ci, { mixBlendMode: 'normal' }, T + 4.95);
    tl.to(ci, { scale: 9, duration: 0.55, ease: 'expo.in' }, T + 4.95);
    tl.call(() => SFX.padStop('drone', 1.2), null, T + 5.1);
    tl.set(bg, { backgroundColor: C.coral }, T + 5.5);
    hide(s, T + 5.5);
  }

  // ---------------------------------------------------------------- 03 SHIFT
  function scene3(T) {
    const s = $('#s3'), shape = $('#s3-shape'), path = $('#s3-path'), meta = $('#s3-meta'), count = $('#s3-count');
    const wordsBox = $('#s3-words'), words = $$('.w', wordsBox);
    path.setAttribute('d', FORMS.circle);
    const splits = words.map(w => SplitText.create(w, { type: 'chars' }));
    STEPS.forEach((st, i) => gsap.set(splits[i].chars, WORD_IN[i].from));
    gsap.set(words[7], { '--wd': 62, '--wg': 100 });
    gsap.set(shape, { scale: 0 });
    gsap.set(path, { fill: C.cream });

    show(s, T);
    label(T, '03 — SHIFT', '03');
    tl.call(() => SFX.pad('s3', [110, 164.81, 220], 1, 0.035, 900), null, T);
    tl.to(shape, { scale: 1, duration: 0.8, ease: 'back.out(1.6)' }, T);

    STEPS.forEach((st, i) => {
      const t = T + i, ch = splits[i].chars;
      if (i > 0) {
        if (st.cut) wipeTo(st.bg, t - 0.22, st.cut);
        else {
          tl.set(bg, { backgroundColor: st.bg }, t);
          hit(shape, { scale: 1.12 }, { scale: 1, duration: 0.5, ease: 'power3.out' }, t);
        }
      }
      tl.to([hud, meta, count, wordsBox], { color: st.fg, duration: 0.01, ease: 'none' }, t);
      tl.to(path, { morphSVG: FORMS[st.form], fill: st.shape, duration: 0.75, ease: 'expo.inOut' }, t);
      tl.to(shape, { rotation: (i + 1) * 90, duration: 0.9, ease: 'back.inOut(1.3)' }, t);
      tl.to(ch, WORD_IN[i].to, t + (st.cut ? 0.06 : 0));
      if (i === 7) tl.to(words[7], { '--wd': 112, '--wg': 900, duration: 1.0, ease: 'expo.inOut' }, t);
      if (i < 7) tl.to(ch, { yPercent: -40, opacity: 0, duration: 0.22, ease: 'power3.in', stagger: 0.012 }, t + 0.72);
      tl.to(meta, { duration: 0.5, scrambleText: { text: `FIG. 03.${i + 1} — ${st.form.toUpperCase()} · ${st.shape.toUpperCase()}`, chars: '0123456789ABCDEF', speed: 1 }, ease: 'none' }, t);
      tl.to(count, { duration: 0.35, scrambleText: { text: `0${i + 1} / 08`, chars: '0123456789' }, ease: 'none' }, t);
      if (st.word === 'BREAK') shake(t, 0.45, 16);

      sfx('kick', t, 0.95);
      sfx('kick', t + 0.5, 0.8);
      sfx('clap', t + 0.5, 0.32);
      sfx('hat', t + 0.25);
      sfx('hat', t + 0.75);
      sfx('bell', t, MEL[i], 0.13);
      [0, 0.25, 0.5, 0.75].forEach((o, k) => sfx('bass', t + o, ROOTS[i] * (k % 2 ? 2 : 1), 0.3));
    });

    // everything collapses into a single dot
    const tEnd = T + 7.55;
    tl.to(splits[7].chars, { yPercent: -40, opacity: 0, duration: 0.25, ease: 'power3.in', stagger: 0.012 }, tEnd);
    tl.to([meta, count], { opacity: 0, duration: 0.2 }, tEnd);
    tl.to(shape, { x: CX - 1420, scale: 0.032, duration: 0.45, ease: 'expo.in' }, tEnd);
    sfx('riser', tEnd, 0.45, 0.3);
    tl.call(() => SFX.padStop('s3', 0.6), null, T + 7.9);
    hide(s, T + 8);
  }

  // ---------------------------------------------------------------- 04 RHYTHM
  function scene4(T) {
    const s = $('#s4'), grid = $('#grid'), word = $('#s4-word');
    const G = { grid: [GRID.rows, GRID.cols] };
    const center = tiles[Math.floor(GRID.rows / 2) * GRID.cols + Math.floor(GRID.cols / 2)];
    const colorAt = i => ramp(SPECTRUM, tilePos[i].c / (GRID.cols - 1) * 0.7 + tilePos[i].r / (GRID.rows - 1) * 0.3);
    const ws = SplitText.create(word, { type: 'chars' });
    gsap.set(tiles, { scale: 0, backgroundColor: C.cream, borderRadius: '50%' });
    gsap.set(ws.chars, { scale: 0, opacity: 0 });

    show(s, T);
    ink(C.cream, T);
    label(T, '04 — RHYTHM', '04');
    tl.set(center, { scale: 0.25 }, T);
    tl.to(tiles, { scale: 0.25, duration: 0.5, ease: 'back.out(3)', stagger: { ...G, from: 'center', amount: 0.8 } }, T + 0.05);
    [N.A4, N.C5, N.E5, N.A5, N.C6].forEach((f, i) => sfx('bell', T + i * 0.09, f, 0.08));

    // wave of colour
    tl.to(tiles, { scale: 0.92, backgroundColor: colorAt, duration: 0.3, ease: 'power2.out', stagger: { ...G, from: 'center', amount: 0.55 } }, T + 1.0);
    tl.to(tiles, { scale: 0.4, duration: 0.6, ease: 'power3.inOut', stagger: { ...G, from: 'center', amount: 0.55 } }, T + 1.3);

    // circles → diamonds, swept from the corner
    tl.to(tiles, { borderRadius: '10%', rotation: 45, scale: 0.62, duration: 0.7, ease: 'expo.inOut', stagger: { ...G, from: 'start', amount: 0.7 } }, T + 2.0);
    sfx('whoosh', T + 2.0, 0.8, 0.35);

    // R-H-Y-T-H-M on the eighth notes
    ws.chars.forEach((ch, k) => {
      const t = T + 3 + k * 0.25;
      tl.to(ch, { scale: 1, opacity: 1, duration: 0.45, ease: 'back.out(2.5)' }, t);
      hit(grid, { scale: 1.05 }, { scale: 1, duration: 0.35, ease: 'power3.out' }, t);
      sfx('clap', t, 0.36);
    });

    // the grid becomes a waveform
    const Wv = { amp: 0, ph: 0 };
    const setY = tiles.map(el => gsap.quickSetter(el, 'y', 'px'));
    const setCY = ws.chars.map(el => gsap.quickSetter(el, 'y', 'px'));
    const wave = () => {
      for (let i = 0; i < tiles.length; i++) setY[i](Wv.amp * Math.sin(tilePos[i].c * 0.45 - Wv.ph + tilePos[i].r * 0.12));
      for (let k = 0; k < setCY.length; k++) setCY[k](Wv.amp * 0.35 * Math.sin(k * 0.9 - Wv.ph));
    };
    tl.to(tiles, { borderRadius: '50%', rotation: 90, scale: 0.36, duration: 0.5, ease: 'expo.inOut', stagger: { ...G, from: 'end', amount: 0.3 } }, T + 4.3);
    tl.to(Wv, { amp: 150, duration: 0.6, ease: 'power2.out' }, T + 4.4);
    tl.to(Wv, { amp: 0, duration: 0.4, ease: 'power2.in' }, T + 5.4);
    tl.to(Wv, { ph: Math.PI * 5, duration: 1.4, ease: 'none', onUpdate: wave }, T + 4.4);
    tl.to(ws.chars, { scale: 0, opacity: 0, duration: 0.35, ease: 'power3.in', stagger: { each: 0.03, from: 'center' } }, T + 5.4);

    // implode to the centre
    tl.to(tiles, {
      x: i => CX - tilePos[i].x, y: i => CY - tilePos[i].y, scale: 0,
      duration: 0.55, ease: 'expo.in', stagger: { ...G, from: 'edges', amount: 0.1 },
    }, T + 5.85);
    sfx('riser', T + 5.85, 0.62, 0.4);

    for (let t = T + 1; t < T + 5.9; t += 0.5) { sfx('kick', t, 0.85); sfx('hat', t + 0.25); }
    const root = t => (t < T + 3 ? 55 : t < T + 4.4 ? 43.65 : 49);
    for (let k = 0; T + 1 + k * 0.25 < T + 5.8; k++) sfx('bass', T + 1 + k * 0.25, root(T + 1 + k * 0.25) * (k % 2 ? 2 : 1), 0.26);
    hide(s, T + 6.5);
  }

  // ---------------------------------------------------------------- 05 MOTION
  function scene5(T) {
    const s = $('#s5'), cap = $('#s5-cap');
    gsap.set(cap, { opacity: 0 });

    show(s, T);
    show(cvs, T);
    label(T, '05 — MOTION', '05');
    tl.set(P, { alpha: 1 }, T);
    tl.to(bars, { height: 110, duration: 0.9, ease: 'expo.inOut' }, T);
    tl.to(P, { emerge: 1, duration: 1.8, ease: 'expo.out' }, T);
    tl.to(P, { spin: 3.4, duration: 4.2, ease: 'power2.out' }, T);
    flash(T, 0.5, 0.5, '#c8b8ff');
    shake(T, 0.4, 10);
    sfx('boom', T, 1);
    sfx('whoosh', T, 1.3, 0.45);
    tl.call(() => SFX.pad('space', [220, 329.63, 440], 1.5, 0.035, 2200), null, T);

    // the galaxy assembles into a word
    tl.to(P, { form: 1, duration: 1.7, ease: 'none' }, T + 1.6);
    sfx('riser', T + 1.7, 1.6, 0.35);
    const tf = T + 3.3;
    flash(tf, 0.3, 0.5);
    shake(tf, 0.35, 8);
    sfx('boom', tf, 0.8);
    sfx('crash', tf, 0.22);
    sfx('bell', tf, N.A5, 0.12);
    sfx('bell', tf, N.E5, 0.1);
    tl.to(P, { shimmer: 1, duration: 0.6 }, tf);
    tl.set(cap, { opacity: 1 }, tf + 0.1);
    tl.to(cap, { duration: 0.9, scrambleText: { text: '2,800 PARTICLES · 1 CANVAS · 0 IMAGES', chars: '0123456789', speed: 0.7 }, ease: 'none' }, tf + 0.1);
    tl.set(P, { sweep: -0.1 }, tf + 0.3);
    tl.to(P, { sweep: 1.1, duration: 1.0, ease: 'power1.inOut' }, tf + 0.3);
    tl.set(P, { sweep: -1 }, tf + 1.3);

    // …and detonates
    const tx = T + 4.7;
    tl.to(cap, { opacity: 0, duration: 0.25 }, tx - 0.1);
    tl.to(P, { explode: 1, duration: 1.6, ease: 'expo.out' }, tx);
    tl.to(P, { alpha: 0, duration: 1.0, ease: 'power2.in' }, tx + 0.4);
    flash(tx, 0.4, 0.4);
    sfx('boom', tx, 0.9);
    sfx('whoosh', tx, 1.0, 0.55);
    tl.call(() => SFX.padStop('space', 1.2), null, tx);
    hide(s, T + 6);
  }

  // ---------------------------------------------------------------- 06 DEPTH
  function scene6(T) {
    const s = $('#s6'), depth = $('#s6-depth'), speed = $('#s6-speed'), light = $('#s6-light'), vel = $('#s6-vel');
    gsap.set(depth, { opacity: 0, letterSpacing: '1.1em', paddingLeft: '1.1em', filter: 'blur(18px)' });
    gsap.set(speed, { opacity: 0, x: 700, skewX: -35 });
    gsap.set(light, { opacity: 0, scale: 0.3, filter: 'blur(0px)' });
    gsap.set(vel, { opacity: 0 });

    // the warp starts underneath the particle explosion so the two read as one move
    const t0 = T - 1.25, dur = T + 5.5 - t0;
    const velText = () => { vel.textContent = `VELOCITY ${(0.999 * Math.sqrt(Tn.z / 12500)).toFixed(3)} c`; };
    tl.to(Tn, { alpha: 1, duration: 1.0, ease: 'power2.out' }, t0);
    tl.to(Tn, { z: 12500, streak: 1500, duration: dur, ease: 'power2.in', onUpdate: velText }, t0);
    tl.to(Tn, { roll: 1.4, hue: 2, duration: dur, ease: 'power1.inOut' }, t0);
    tl.to(Tn, { core: 1, duration: dur, ease: 'power3.in' }, t0);
    tl.call(() => SFX.pad('warp', [55, 82.41, 110], 2.5, 0.05, 500), null, t0);

    show(s, T);
    label(T, '06 — DEPTH', '06');
    tl.to(depth, { opacity: 1, letterSpacing: '0.1em', paddingLeft: '0.1em', filter: 'blur(0px)', duration: 1.3, ease: 'expo.out' }, T + 0.1);
    tl.to(vel, { opacity: 1, duration: 0.6 }, T + 0.4);
    tl.to(depth, { opacity: 0, scale: 1.5, filter: 'blur(14px)', duration: 0.45, ease: 'power2.in' }, T + 1.65);

    tl.to(speed, { opacity: 1, x: 0, skewX: -12, duration: 0.55, ease: 'expo.out' }, T + 2.0);
    hit(speed,
      { textShadow: '-14px 0 0 rgba(255,46,136,0.9), 14px 0 0 rgba(43,80,255,0.9)' },
      { textShadow: '-3px 0 0 rgba(255,46,136,0.6), 3px 0 0 rgba(43,80,255,0.6)', duration: 0.6, ease: 'power2.out' }, T + 2.0);
    tl.to(speed, { x: -80, duration: 1.2, ease: 'none' }, T + 2.55);
    tl.to(speed, { x: -1100, skewX: -40, opacity: 0, duration: 0.3, ease: 'expo.in' }, T + 3.75);

    tl.to(light, { opacity: 1, scale: 1, duration: 0.7, ease: 'expo.out' }, T + 4.05);
    tl.to(light, { scale: 4, opacity: 0, filter: 'blur(10px)', duration: 0.5, ease: 'expo.in' }, T + 4.95);
    tl.to(vel, { opacity: 0, duration: 0.3 }, T + 5.1);
    shake(T + 3.4, 2.0, 12, true);

    // build-up: kicks → 8ths → 16ths → 32nds
    sfx('riser', T, 5.42, 0.5);
    sfx('whoosh', T + 0.1, 1.2, 0.4);
    sfx('whoosh', T + 2.0, 0.6, 0.45);
    sfx('bell', T + 4.05, N.A5, 0.12);
    sfx('bell', T + 4.05, N.E5, 0.1);
    for (let t = T; t < T + 4; t += 0.5) sfx('kick', t, 0.9);
    for (let k = 0; k < 4; k++) sfx('clap', T + 2 + k * 0.25, 0.22);
    for (let k = 0; k < 8; k++) sfx('clap', T + 3 + k * 0.125, 0.26);
    for (let k = 0; k < 16; k++) sfx('clap', T + 4 + k * 0.0625, 0.3);

    flash(T + 5.42, 1, 0.35);
    tl.to(Tn, { alpha: 0, duration: 0.08 }, T + 5.42);
    tl.call(() => SFX.padStop('warp', 0.08), null, T + 5.44);
    tl.set(bars, { height: 0 }, T + 5.5);
    hide(s, T + 5.5);
    hide(cvs, T + 5.5);
  }

  // ---------------------------------------------------------------- 07 MONTAGE
  function scene7(T) {
    const s = $('#s7'), cards = $$('#s7 .card');
    show(s, T);
    tl.to(hud, { autoAlpha: 0, duration: 0.01 }, T);
    CARDS.forEach((cd, k) => {
      const t = T + k * 0.25, el = cards[k];
      show(el, t);
      hide(el, t + 0.25);
      hit(el.firstElementChild, cd.from, { ...cd.to, duration: 0.25, ease: 'power3.out' }, t);
      sfx('kick', t, 0.9);
      sfx('clap', t, 0.3);
      sfx('bell', t, MONT[k], 0.12);
    });
    // one beat of pure silence before the title
    tl.set(bg, { backgroundColor: '#000' }, T + 2.0);
    tl.call(() => SFX.stopAll(), null, T + 2.0);
    hide(s, T + 2.0);
  }

  // ---------------------------------------------------------------- 08 KINETIC
  function scene8(T) {
    const s = $('#s8'), title = $('#title'), sheen = $('#title-sheen'), sub = $('#subtitle');
    const ring = $('#s8-ring'), ring2 = $('#s8-ring2'), orbit = $('#s8-orbit'), os = $$('#s8 .o'), glow = $('#s8-glow');
    const tag = $('#tagline'), cred = $('#credits'), line = $('#cr-line'), pctEl = $('#pct');
    const stats = [$('#cr-mark'), ...$$('#credits .stat')];
    const st = SplitText.create(title, { type: 'chars' });
    const sg = SplitText.create(tag, { type: 'chars', mask: 'chars' });

    gsap.set(st.chars, { opacity: 0, scale: 2.6, filter: 'blur(16px)' });
    gsap.set(sheen, { opacity: 0, backgroundPosition: '100% 0%' });
    gsap.set(ring, { drawSVG: '0%', rotation: -90, transformOrigin: '50% 50%' });
    gsap.set(ring2, { opacity: 0, rotation: 0, transformOrigin: '50% 50%' });
    gsap.set(os, { scale: 0 });
    os.forEach((o, k) => { const a = -Math.PI / 2 + k * 2.0944; gsap.set(o, { x: Math.cos(a) * 470, y: Math.sin(a) * 470 }); });
    gsap.set(glow, { opacity: 0, scale: 0.6 });
    gsap.set(sg.chars, { yPercent: 115 });
    gsap.set(sub, { autoAlpha: 0 });
    gsap.set(stats, { y: 40, opacity: 0 });
    gsap.set(line, { opacity: 0 });

    // BRAAAM
    show(s, T);
    tl.set(bg, { backgroundColor: C.night }, T);
    ink(C.cream, T);
    flash(T, 1, 0.9);
    shake(T, 0.7, 22);
    sfx('braam', T, 0.85);
    sfx('boom', T, 1);
    sfx('crash', T, 0.3);
    tl.call(() => SFX.pad('title', [110, 130.81, 164.81, 220], 1.2, 0.07, 900), null, T);

    tl.to(st.chars, { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 1.1, ease: 'expo.out', stagger: { each: 0.05, from: 'center' } }, T);
    hit(title,
      { textShadow: '-14px 0 0 rgba(255,46,136,0.9), 14px 0 0 rgba(43,80,255,0.9)' },
      { textShadow: '0px 0 0 rgba(255,46,136,0), 0px 0 0 rgba(43,80,255,0)', duration: 1.2, ease: 'expo.out' }, T);
    tl.to(glow, { opacity: 1, scale: 1, duration: 2.5, ease: 'expo.out' }, T);
    tl.to(ring, { drawSVG: '0% 100%', duration: 1.8, ease: 'expo.inOut' }, T + 0.2);
    tl.to(ring2, { opacity: 1, duration: 1.5 }, T + 0.8);
    tl.to(ring2, { rotation: 50, duration: 9, ease: 'none' }, T + 0.8);
    tl.to(os, { scale: 1, duration: 0.7, ease: 'back.out(2.5)', stagger: 0.12 }, T + 0.9);
    tl.to(orbit, { rotation: 110, duration: 5.2, ease: 'none' }, T + 0.9);
    [N.A4, N.C5, N.E5].forEach((f, i) => sfx('bell', T + 0.9 + i * 0.12, f, 0.1));
    tl.to(hud, { autoAlpha: 1, duration: 1 }, T + 1.4);
    label(T + 1.4, '08 — KINETIC', '08');

    tl.set(sub, { autoAlpha: 1 }, T + 1.3);
    tl.to(sub, { duration: 1.4, scrambleText: { text: 'A MOTION STUDY IN FORM, COLOR & TIME', chars: 'upperCase', speed: 0.5, revealDelay: 0.2 }, ease: 'none' }, T + 1.3);

    // holographic sheen
    tl.set(sheen, { opacity: 1 }, T + 1.8);
    tl.to(sheen, { backgroundPosition: '0% 0%', duration: 1.3, ease: 'power2.inOut' }, T + 1.8);
    tl.set(sheen, { opacity: 0 }, T + 3.1);
    sfx('whoosh', T + 1.8, 1.3, 0.25);

    tl.to(bars, { height: 110, duration: 1.2, ease: 'expo.inOut' }, T + 2.4);

    // the title breathes: wide/black → condensed/thin → back
    tl.to(title, { '--wd': 62, '--wg': 200, letterSpacing: '0.06em', duration: 0.9, ease: 'expo.inOut' }, T + 3.1);
    tl.to(title, { '--wd': 125, '--wg': 900, letterSpacing: '-0.01em', duration: 0.55, ease: 'expo.out' }, T + 4.1);
    hit(orbit, { scale: 1.08 }, { scale: 1, duration: 0.8, ease: 'elastic.out(1, 0.4)' }, T + 4.1);
    sfx('whoosh', T + 3.1, 0.9, 0.3);
    sfx('kick', T + 4.1, 1);
    sfx('bell', T + 4.1, N.A5, 0.12);

    // out
    tl.to(st.chars, { opacity: 0, yPercent: -25, filter: 'blur(12px)', duration: 0.45, ease: 'power3.in', stagger: { each: 0.03, from: 'edges' } }, T + 5.0);
    tl.to(sub, { autoAlpha: 0, duration: 0.3 }, T + 5.0);
    tl.to(ring, { drawSVG: '100% 100%', duration: 0.7, ease: 'expo.inOut' }, T + 5.0);
    tl.to([ring2, glow], { opacity: 0, duration: 0.6 }, T + 5.0);
    tl.to(os, { scale: 0, duration: 0.35, ease: 'back.in(2)', stagger: 0.05 }, T + 5.0);
    sfx('whoosh', T + 5.0, 0.6, 0.3);

    // EVERYTHING MOVES.
    tl.to(sg.chars, { yPercent: 0, duration: 0.9, ease: 'expo.out', stagger: 0.035 }, T + 5.7);
    [N.E4, N.A4, N.C5].forEach(f => sfx('bell', T + 5.7, f, 0.08));
    tl.to(sg.masks, { y: -16, duration: 0.35, ease: 'sine.inOut', yoyo: true, repeat: 1, stagger: 0.045 }, T + 6.9);
    tl.to(sg.chars, { yPercent: -115, duration: 0.5, ease: 'expo.in', stagger: 0.015 }, T + 8.4);

    // credits
    const pct = { v: 0 };
    tl.set(cred, { autoAlpha: 1 }, T + 9.0);
    tl.to(stats, { y: 0, opacity: 1, duration: 0.9, ease: 'expo.out', stagger: 0.12 }, T + 9.0);
    tl.to(pct, { v: 100, duration: 1.3, ease: 'expo.out', onUpdate: () => { pctEl.textContent = Math.round(pct.v) + '%'; } }, T + 9.24);
    tl.set(line, { opacity: 0.55 }, T + 9.6);
    tl.to(line, { duration: 1.2, scrambleText: { text: 'HTML · CSS · JAVASCRIPT — RENDERED LIVE, FRAME BY FRAME', chars: 'upperCase', speed: 0.6 }, ease: 'none' }, T + 9.6);
    [0, 0.12, 0.24].forEach(o => sfx('tick', T + 9.0 + o, 0.05));

    // fade to black: curtains close
    tl.to([cred, hud], { autoAlpha: 0, duration: 0.6 }, T + 11.3);
    tl.to(bars, { height: 540, duration: 1.0, ease: 'expo.inOut' }, T + 11.4);
    tl.call(() => SFX.padStop('title', 2.5), null, T + 11.4);
    sfx('boom', T + 11.9, 0.55);
    tl.set({}, {}, T + 12.6);
  }

  // ================================================================ PLAYBACK
  let started = false, autoPaused = false;

  function tick() {
    const t = tl.time(), s = Math.floor(t), f = Math.floor((t - s) * 24);
    hudTC.textContent = `00:00:${String(s).padStart(2, '0')}:${String(f).padStart(2, '0')}`;
    progressBar.style.transform = `scaleX(${tl.progress()})`;
  }

  function ended() {
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
    else { tl.pause(); SFX.suspend(); setState('PAUSED'); }
  }

  const KEYS = 'SPACE PAUSE · M MUTE · R REPLAY · F FULLSCREEN';
  function setState(msg) {
    uiState.textContent = msg ? msg + '  —  ' + KEYS : KEYS;
    if (msg) poke();
  }

  let idleTimer;
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
    else if (k === 'm') { SFX.setMuted(!SFX.isMuted()); setState(SFX.isMuted() ? 'SOUND OFF' : 'SOUND ON'); }
    else if (k === 'f') toggleFullscreen();
  });
  document.addEventListener('visibilitychange', () => {
    if (!started || !tl || tl.progress() === 1) return;
    if (document.hidden && !tl.paused()) { tl.pause(); SFX.suspend(); autoPaused = true; }
    else if (!document.hidden && autoPaused) { autoPaused = false; tl.resume(); SFX.resume(); }
  });
  playBtn.addEventListener('click', start);
  replayBtn.addEventListener('click', replay);

  // ================================================================ BOOT
  function build() {
    prepareDOM();
    gsap.set('.c', { xPercent: -50, yPercent: -50 });
    gsap.set(hud, { autoAlpha: 0 });
    gsap.set(bars, { height: 540 });
    buildParticles();

    tl = gsap.timeline({ paused: true, onUpdate: tick, onComplete: ended });
    scene1(0);
    scene2(5.5);
    scene3(11);
    scene4(19);
    scene5(25.5);
    scene6(31.5);
    scene7(37);
    scene8(39.5);

    gsap.ticker.add(render);
    setState('');

    if (seekTo !== null) {
      intro.remove();
      started = true;
      tl.seek(Math.min(seekTo, tl.duration() - 0.01), false);
      return;
    }
    playBtn.disabled = false;
    introState.textContent = 'PRESS PLAY';
    playBtn.focus({ preventScroll: true });
  }

  const fontsReady = Promise.race([
    Promise.all([
      document.fonts.load('900 100px Archivo'),
      document.fonts.load('300 30px Archivo'),
      document.fonts.load('400 16px "JetBrains Mono"'),
    ]).then(() => document.fonts.ready),
    new Promise(r => setTimeout(r, 5000)),
  ]);
  fontsReady.catch(() => {}).then(build);
})();
