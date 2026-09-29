/* ============================================================================
   SWARM MODULE — a real flocking simulation (boids) that is still seekable.

   Recipes register behaviour segments (flock params, formations, a predator,
   bursts) on one shared swarm. When every scene is sequenced (plugin `done`), the
   whole flight is simulated ONCE at a fixed 30 Hz step with seeded randomness,
   and every frame is stored (Int16, ¼-px precision). Playback just interpolates
   stored frames → exact seeking and identical replays of genuine emergent motion.

   Each agent steers by its 7 nearest neighbours (topological, like real
   starlings): separation, alignment, cohesion — plus home drift, soft bounds,
   formation targets (words / shapes), predator avoidance and bursts.
   Rendering: dusk-to-night sky, birds as flapping chevrons, faint motion
   trails, and a glow at night (a drone show).
   Recipes: murmuration, flockword, predator, flockshape, flocktitle.
   ========================================================================== */
(() => {
  'use strict';
  const { recipe, plugin } = Trailer;
  const { hex } = Trailer.util;
  const TAU = Math.PI * 2, FPS = 24, DT = 1 / FPS, K = 7, NIL = -32768; // 24 Hz sim, interpolated on playback
  const hash = (a, b = 0) => {
    let h = Math.imul(a | 0, 374761393) + Math.imul(b | 0, 668265263);
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  };
  const sm = t => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));
  const mixC = (a, b, t) => { const A = hex(a), B = hex(b); return A.map((v, i) => Math.round(v + (B[i] - v) * t)); };
  const css = (c, al = 1) => `rgba(${c[0]},${c[1]},${c[2]},${al})`;
  // wCent: pull toward the flock's centre of mass — topological neighbours alone keep groups local,
  // this is what makes one big fluid murmuration instead of scattered bands
  // alignment > cohesion keeps the flock polarised (travelling) instead of settling into a rotating mill
  // R ≈ the radius that holds ~7 neighbours at flock spacing; the grid cell matches it (cheap neighbour search).
  // sep is a direct, distance-weighted repulsion (px/s²) applied outside the steering clamp, so spacing holds.
  const FLOCK = { sep: 2200, sepR: 26, ali: 1.5, coh: 0.4, R: 34, maxV: 300, minV: 170, maxF: 620, wHome: 0.6, wCent: 0.5, home: null };

  let SW = null;
  function swarm(D, o = {}) {
    if (SW) return SW;
    const N = o.count || 1600, W = D.W, H = D.H;
    SW = {
      D, N, segs: [], frames: null, t0: 0, F: 0, ms: 0,
      spawnT: new Float32Array(N), spawnX: new Float32Array(N), spawnY: new Float32Array(N), spawnVX: new Float32Array(N), spawnVY: new Float32Array(N),
      V: { alpha: 0, night: 0, size: 1 },
      sky: {
        day: o.day || ['#1c2150', '#b9546c', '#ffb488'],
        night: o.nightSky || ['#02030b', '#070b24', '#141a44'],
        bird: o.bird || '#120e18', glow: o.glow || '#bdf3ff', sun: o.sun || '#ffcf9a',
      },
      preds: [],
      add(seg) { this.segs.push(seg); return seg; },
    };
    for (let i = 0; i < N; i++) { // default: everyone already in the sky
      SW.spawnT[i] = -1e9;
      SW.spawnX[i] = hash(i, 1) * W; SW.spawnY[i] = hash(i, 2) * H * 0.8;
      const a = hash(i, 3) * TAU; SW.spawnVX[i] = Math.cos(a) * 200; SW.spawnVY[i] = Math.sin(a) * 200;
    }
    const stars = Array.from({ length: 170 }, (_, i) => [hash(i, 61) * W, hash(i, 62) * H * 0.75, 0.6 + hash(i, 63) * 1.4]);
    D.layer(SW.V, g => draw(g, stars));
    return SW;
  }

  // ------------------------------------------------------------------ simulation
  function samplePoints(D, text, size, maxW, cy, want) {
    const c = document.createElement('canvas');
    c.width = D.W; c.height = D.H;
    const x = c.getContext('2d');
    const setFont = sz => { x.font = `900 ${sz}px "${D.cfg.fonts.display}"`; if (D.cfg.fonts.stretch && 'fontStretch' in x) x.fontStretch = 'expanded'; };
    setFont(size);
    const w = x.measureText(text).width;
    if (w > maxW) setFont(size * maxW / w);
    x.fillStyle = '#fff'; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.fillText(text, D.CX, cy);
    const d = x.getImageData(0, 0, D.W, D.H).data;
    const grab = st => { const p = []; for (let y = 0; y < D.H; y += st) for (let xx = 0; xx < D.W; xx += st) if (d[(y * D.W + xx) * 4 + 3] > 128) p.push([xx, y]); return p; };
    let pts = [];
    for (let st = 14; st >= 3; st--) { pts = grab(st); if (pts.length >= want * 0.92) break; }
    return pts;
  }
  function shapePoints(kind, N, cx, cy, sc = 1) {
    return Array.from({ length: N }, (_, k) => {
      const u = k / N, j = (hash(k, 71) - 0.5);
      if (kind === 'ring') return { r: (330 + j * 34) * sc, a: u * TAU };
      if (kind === 'spiral') return { r: (30 + 380 * Math.sqrt(u)) * sc, a: Math.sqrt(u) * TAU * 2.6 + j * 0.05 };
      if (kind === 'heart') {
        const t = u * TAU, hx = 16 * Math.pow(Math.sin(t), 3), hy = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
        const fill = 0.35 + 0.65 * Math.sqrt(hash(k, 72));
        return { x: cx + hx * 20 * fill * sc, y: cy - hy * 20 * fill * sc - 20 };
      }
      return { x: cx + (u - 0.5) * 1500 * sc, y: cy + Math.sin(u * TAU * 2) * 160 * sc + j * 40 }; // wave
    });
  }

  function simulate(D) {
    const S = SW, N = S.N, W = D.W, H = D.H, t0c = performance.now();
    const t0 = Math.min(...S.segs.map(s => s.at)), t1 = Math.max(...S.segs.map(s => s.at + (s.dur || 0)));
    const F = Math.ceil((t1 - t0) * FPS) + 3;
    const out = new Int16Array(F * N * 2);
    const x = new Float32Array(N), y = new Float32Array(N), vx = new Float32Array(N), vy = new Float32Array(N);
    const ax = new Float32Array(N), ay = new Float32Array(N), alive = new Uint8Array(N);
    const M = 520, CS = 34, GW = Math.ceil((W + 2 * M) / CS), GH = Math.ceil((H + 2 * M) / CS);
    const head = new Int32Array(GW * GH), next = new Int32Array(N);
    const nbI = new Int32Array(K), nbD = new Float32Array(K);
    const flocks = S.segs.filter(s => s.kind === 'flock').sort((a, b) => a.at - b.at);
    const forms = S.segs.filter(s => s.kind === 'form'), preds = S.segs.filter(s => s.kind === 'pred'), bursts = S.segs.filter(s => s.kind === 'burst');
    const active = (s, t) => t >= s.at && t < s.at + s.dur;

    function assign(fm) {
      const idx = [];
      for (let i = 0; i < N; i++) if (alive[i]) idx.push(i);
      const n = idx.length || 1, P = fm.points.length;
      fm.tx = new Float32Array(N); fm.ty = new Float32Array(N); fm.tr = new Float32Array(N); fm.ta = new Float32Array(N);
      if (fm.polar) {
        idx.sort((a, b) => Math.atan2(y[a] - fm.cy, x[a] - fm.cx) - Math.atan2(y[b] - fm.cy, x[b] - fm.cx));
        const pts = fm.points.slice().sort((a, b) => a.a - b.a);
        idx.forEach((i, k) => { const p = pts[Math.floor((k * P) / n)]; fm.tr[i] = p.r; fm.ta[i] = p.a; });
      } else {
        idx.sort((a, b) => (x[a] + y[a] * 0.25) - (x[b] + y[b] * 0.25));
        const pts = fm.points.map(p => (Array.isArray(p) ? { x: p[0], y: p[1] } : p)).sort((a, b) => (a.x + a.y * 0.25) - (b.x + b.y * 0.25));
        idx.forEach((i, k) => { const p = pts[Math.floor((k * P) / n)]; fm.tx[i] = p.x; fm.ty[i] = p.y; });
      }
      fm.assigned = true;
    }

    for (let f = 0; f < F; f++) {
      const t = t0 + f * DT;
      for (let i = 0; i < N; i++) {
        if (!alive[i] && t >= S.spawnT[i]) { alive[i] = 1; x[i] = S.spawnX[i]; y[i] = S.spawnY[i]; vx[i] = S.spawnVX[i]; vy[i] = S.spawnVY[i]; }
      }
      let fl = FLOCK;
      for (const s of flocks) if (s.at <= t) fl = s;
      let fm = null, fw = 0;
      for (const s of forms) if (active(s, t)) { fm = s; fw = sm((t - s.at) / s.rin) * (1 - sm((t - (s.at + s.dur - s.rout)) / s.rout)); }
      if (fm && !fm.assigned) assign(fm);
      const pr = preds.find(s => active(s, t)), bu = bursts.find(s => active(s, t));
      const pp = pr ? pr.path(t) : null;
      const home = fl.home ? fl.home(t) : [W / 2, H * 0.45];
      const kf = 1 - fw * 0.85, maxV = fl.maxV * (1 + 0.9 * fw), minV = fl.minV * (1 - fw), maxF = fl.maxF * (1 + 3 * fw);
      const R2 = fl.R * fl.R, sep2 = fl.sepR * fl.sepR;

      let gcx = 0, gcy = 0, gn = 0;
      for (let i = 0; i < N; i++) if (alive[i]) { gcx += x[i]; gcy += y[i]; gn++; }
      if (gn) { gcx /= gn; gcy /= gn; }
      head.fill(-1);
      for (let i = 0; i < N; i++) {
        if (!alive[i]) continue;
        const cx = Math.min(GW - 1, Math.max(0, Math.floor((x[i] + M) / CS))), cy = Math.min(GH - 1, Math.max(0, Math.floor((y[i] + M) / CS)));
        const c = cy * GW + cx;
        next[i] = head[c]; head[c] = i;
      }
      for (let i = 0; i < N; i++) {
        if (!alive[i]) continue;
        const xi = x[i], yi = y[i];
        // K nearest neighbours within R (topological interaction) — skipped while locked in a formation
        let cnt = 0;
        const gx = Math.min(GW - 1, Math.max(0, Math.floor((xi + M) / CS))), gy = Math.min(GH - 1, Math.max(0, Math.floor((yi + M) / CS)));
        if (fw < 0.9) for (let oy = -1; oy <= 1; oy++) {
          const cy = gy + oy; if (cy < 0 || cy >= GH) continue;
          for (let ox = -1; ox <= 1; ox++) {
            const cx = gx + ox; if (cx < 0 || cx >= GW) continue;
            for (let j = head[cy * GW + cx]; j !== -1; j = next[j]) {
              if (j === i) continue;
              const dx = x[j] - xi, dy = y[j] - yi, d2 = dx * dx + dy * dy;
              if (d2 >= R2) continue;
              if (cnt < K) { let k = cnt++; while (k > 0 && nbD[k - 1] > d2) { nbD[k] = nbD[k - 1]; nbI[k] = nbI[k - 1]; k--; } nbD[k] = d2; nbI[k] = j; }
              else if (d2 < nbD[K - 1]) { let k = K - 1; while (k > 0 && nbD[k - 1] > d2) { nbD[k] = nbD[k - 1]; nbI[k] = nbI[k - 1]; k--; } nbD[k] = d2; nbI[k] = j; }
            }
          }
        }
        let fx = 0, fy = 0, rx = 0, ry = 0;
        if (cnt) {
          let avx = 0, avy = 0, cmx = 0, cmy = 0;
          for (let k = 0; k < cnt; k++) {
            const j = nbI[k];
            avx += vx[j]; avy += vy[j]; cmx += x[j]; cmy += y[j];
            if (nbD[k] < sep2) { const d = Math.sqrt(nbD[k]) + 0.01, w = 1 - d / fl.sepR; rx += ((xi - x[j]) / d) * w; ry += ((yi - y[j]) / d) * w; }
          }
          let l = Math.hypot(avx, avy);
          if (l > 0) { fx += fl.ali * kf * ((avx / l) * maxV - vx[i]); fy += fl.ali * kf * ((avy / l) * maxV - vy[i]); }
          cmx = cmx / cnt - xi; cmy = cmy / cnt - yi; l = Math.hypot(cmx, cmy);
          if (l > 0) { fx += fl.coh * kf * ((cmx / l) * maxV - vx[i]); fy += fl.coh * kf * ((cmy / l) * maxV - vy[i]); }
        }
        // global cohesion: only stragglers beyond the flock's natural radius (it grows with √birds) rejoin it
        if (gn > 1 && fl.wCent) {
          const cx = gcx - xi, cy = gcy - yi, cd = Math.hypot(cx, cy), R0 = 15 * Math.sqrt(gn);
          if (cd > R0) { const k = fl.wCent * kf * Math.min(1, (cd - R0) / 300); fx += k * ((cx / cd) * maxV - vx[i]); fy += k * ((cy / cd) * maxV - vy[i]); }
        }
        // drift toward a moving home point (keeps the murmuration on screen, sweeping)
        let hx = home[0] - xi, hy = home[1] - yi, hl = Math.hypot(hx, hy);
        if (hl > 1) { const k = fl.wHome * kf * Math.min(1, hl / 320); fx += k * ((hx / hl) * maxV * 0.7 - vx[i]); fy += k * ((hy / hl) * maxV * 0.7 - vy[i]); }
        // formation target (with a tiny hover orbit so the shape breathes)
        if (fm && fw > 0) {
          let tx, ty;
          if (fm.polar) { const a = fm.ta[i] + fm.spin * (t - fm.at); tx = fm.cx + Math.cos(a) * fm.tr[i]; ty = fm.cy + Math.sin(a) * fm.tr[i] * fm.squash; }
          else { tx = fm.tx[i]; ty = fm.ty[i]; }
          const ph = hash(i, 81) * TAU;
          tx += Math.cos(t * 2.4 + ph) * fm.hover; ty += Math.sin(t * 2.4 + ph) * fm.hover;
          const dx = tx - xi, dy = ty - yi, d = Math.hypot(dx, dy) + 1e-3, sp = Math.min(maxV, d * 2.8);
          fx = fx * (1 - fw) + ((dx / d) * sp - vx[i]) * 4 * fw;
          fy = fy * (1 - fw) + ((dy / d) * sp - vy[i]) * 4 * fw;
        }
        // soft bounds
        if (xi < -40) fx += (-40 - xi) * 5; else if (xi > W + 40) fx -= (xi - W - 40) * 5;
        if (yi < -40) fy += (-40 - yi) * 5; else if (yi > H + 40) fy -= (yi - H - 40) * 5;
        // predator: flee hard
        if (pp) { const dx = xi - pp[0], dy = yi - pp[1], d = Math.hypot(dx, dy) + 1e-3; if (d < pr.R) { const k = pr.flee * (1 - d / pr.R); fx += (dx / d) * k; fy += (dy / d) * k; } }
        if (bu) { const dx = xi - bu.cx, dy = yi - bu.cy, d = Math.hypot(dx, dy) + 1e-3; fx += (dx / d) * bu.force; fy += (dy / d) * bu.force; }
        const fl2 = Math.hypot(fx, fy), lim = maxF * (pp || bu ? 3 : 1);
        if (fl2 > lim) { fx *= lim / fl2; fy *= lim / fl2; }
        ax[i] = fx + rx * fl.sep; ay[i] = fy + ry * fl.sep; // separation sits outside the clamp: spacing always holds
      }
      for (let i = 0; i < N; i++) {
        const b = (f * N + i) * 2;
        if (!alive[i]) { out[b] = NIL; out[b + 1] = NIL; continue; }
        vx[i] += ax[i] * DT; vy[i] += ay[i] * DT;
        let sp = Math.hypot(vx[i], vy[i]);
        const top = maxV * (pp || bu ? 1.5 : 1);
        if (sp > top) { vx[i] *= top / sp; vy[i] *= top / sp; }
        else if (sp < minV) { if (sp < 1e-3) { vx[i] = minV; sp = minV; } else { vx[i] *= minV / sp; vy[i] *= minV / sp; } }
        x[i] += vx[i] * DT; y[i] += vy[i] * DT;
        out[b] = Math.max(-32767, Math.min(32767, Math.round(x[i] * 4)));
        out[b + 1] = Math.max(-32767, Math.min(32767, Math.round(y[i] * 4)));
      }
    }
    S.frames = out; S.t0 = t0; S.F = F; S.ms = Math.round(performance.now() - t0c);
    document.documentElement.dataset.swarmMs = S.ms;
  }
  plugin({ done(D) { if (SW && !SW.frames && SW.segs.length) simulate(D); } });
  /** Inspect the precomputed flight: { frames, t0, F, N, ms } (debugging / tooling). */
  Trailer.swarm = () => SW;

  // ------------------------------------------------------------------ rendering
  function draw(g, stars) {
    const S = SW, D = S.D, V = S.V, W = D.W, H = D.H, n = V.night, sky = S.sky;
    const [c0, c1, c2] = [0, 1, 2].map(k => mixC(sky.day[k], sky.night[k], n));
    const grad = g.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, css(c0)); grad.addColorStop(0.62, css(c1)); grad.addColorStop(1, css(c2));
    g.globalAlpha = V.alpha;
    g.fillStyle = grad;
    g.fillRect(0, 0, W, H);
    const sun = hex(sky.sun);
    if (n < 0.98) {
      const rg = g.createRadialGradient(D.CX, H + 160, 0, D.CX, H + 160, 980);
      rg.addColorStop(0, css(sun, 0.75 * (1 - n))); rg.addColorStop(1, css(sun, 0));
      g.fillStyle = rg; g.fillRect(0, 0, W, H);
    }
    if (n > 0.02) {
      g.fillStyle = `rgba(255,255,255,${0.8 * n})`;
      for (const [sx, sy, sr] of stars) g.fillRect(sx, sy, sr, sr);
    }
    if (!S.frames) return;
    const t = D.tl.time(), f = (t - S.t0) * FPS;
    if (f < 0 || f > S.F - 2) return;
    const N = S.N, O = S.frames, i0 = Math.floor(f), a = f - i0;
    const ib = Math.max(0, i0 - 2), it = Math.max(0, i0 - 4), i1 = i0 + 1;
    const col = mixC(sky.bird, sky.glow, sm((n - 0.45) / 0.45)), s = 7.5 * V.size;
    const trail = new Path2D(), body = new Path2D(), glow = n > 0.5 ? new Path2D() : null;
    for (let i = 0; i < N; i++) {
      const b0 = (i0 * N + i) * 2, b1 = (i1 * N + i) * 2;
      if (O[b0] === NIL) continue;
      const X1 = O[b1] === NIL ? O[b0] : O[b1], Y1 = O[b1] === NIL ? O[b0 + 1] : O[b1 + 1];
      const x = (O[b0] + (X1 - O[b0]) * a) / 4, y = (O[b0 + 1] + (Y1 - O[b0 + 1]) * a) / 4;
      const bb = (ib * N + i) * 2;
      let dx = X1 - (O[bb] === NIL ? O[b0] : O[bb]), dy = Y1 - (O[bb] === NIL ? O[b0 + 1] : O[bb + 1]);
      const l = Math.hypot(dx, dy);
      if (l < 0.5) { dx = 1; dy = 0; } else { dx /= l; dy /= l; }
      const px = -dy, py = dx, span = s * (0.28 + 0.42 * Math.abs(Math.sin(t * 13 + i * 0.77)));
      body.moveTo(x - dx * s * 0.45 + px * span, y - dy * s * 0.45 + py * span);
      body.lineTo(x + dx * s * 0.55, y + dy * s * 0.55);
      body.lineTo(x - dx * s * 0.45 - px * span, y - dy * s * 0.45 - py * span);
      body.lineTo(x - dx * s * 0.12, y - dy * s * 0.12);
      body.closePath();
      const bt = (it * N + i) * 2;
      if (O[bt] !== NIL) { trail.moveTo(O[bt] / 4, O[bt + 1] / 4); trail.lineTo(x, y); }
      if (glow) { glow.moveTo(x + 7, y); glow.arc(x, y, 7, 0, TAU); }
    }
    g.lineWidth = 1.2;
    g.strokeStyle = css(col, 0.16);
    g.stroke(trail);
    g.fillStyle = css(col);
    g.fill(body);
    if (glow) {
      g.globalCompositeOperation = 'lighter';
      g.globalAlpha = V.alpha * sm((n - 0.5) / 0.5) * 0.22;
      g.fillStyle = css(hex(sky.glow));
      g.fill(glow);
      g.globalCompositeOperation = 'source-over';
      g.globalAlpha = V.alpha;
    }
    // the raptor
    for (const p of S.preds) {
      if (t < p.at || t > p.at + p.dur) continue;
      const [hx, hy] = p.path(t), [nx, ny] = p.path(t + 0.03);
      let ux = nx - hx, uy = ny - hy; const ul = Math.hypot(ux, uy) || 1; ux /= ul; uy /= ul;
      const vx = -uy, vy = ux, S2 = 34, sp = S2 * (0.3 + 0.35 * Math.abs(Math.sin(t * 7)));
      g.fillStyle = css(mixC(p.color, '#ffffff', n * 0.3));
      g.beginPath();
      g.moveTo(hx - ux * S2 * 0.45 + vx * sp * 1.5, hy - uy * S2 * 0.45 + vy * sp * 1.5);
      g.lineTo(hx + ux * S2 * 0.6, hy + uy * S2 * 0.6);
      g.lineTo(hx - ux * S2 * 0.45 - vx * sp * 1.5, hy - uy * S2 * 0.45 - vy * sp * 1.5);
      g.lineTo(hx - ux * S2 * 0.1, hy - uy * S2 * 0.1);
      g.closePath();
      g.fill();
    }
  }

  // shared DOM: up to 2 big lines + a mono caption
  function copy(D, name, lines, cls = 'sw-line') {
    const s = D.scene(name, `${lines.map((l, i) => `<div class="${cls} v c" style="top:${lines.length > 1 ? 470 + i * 150 : 540}px">${l}</div>`).join('')}<div class="sw-cap mono"></div>`);
    D.$$('.' + cls, s).forEach(el => D.fit(el, 1600));
    return { s, lines: D.$$('.' + cls, s), cap: D.$('.sw-cap', s) };
  }
  const bezier = (P, u) => { const v = 1 - u; return [0, 1].map(k => v * v * v * P[0][k] + 3 * v * v * u * P[1][k] + 3 * v * u * u * P[2][k] + u * u * u * P[3][k]); };

  // ------------------------------------------------------------------ MURMURATION
  // Dusk. One bird crosses the sky alone ("UNO SOLO / NO ES NADA."), then the rest
  // stream in from every edge and a murmuration takes over the sky.        7 s
  recipe('murmuration', (D, T, o) => {
    const { tl, C, N: NT } = D;
    const S = swarm(D, o), N = S.N, dur = o.duration || 7, arrive = T + (o.arrive ?? 2.3);
    S.spawnT[0] = T; S.spawnX[0] = -30; S.spawnY[0] = 420; S.spawnVX[0] = 240; S.spawnVY[0] = -12;
    // the rest pour in from the left as one long ribbon (two braided bands) that folds into a single flock
    const g2 = (i, k) => Math.sqrt(-2 * Math.log(1 - hash(i, k) * 0.9999)) * Math.cos(TAU * hash(i, k + 1));
    for (let i = 1; i < N; i++) {
      const hi = hash(i, 6) < 0.5, u = hash(i, 5);
      S.spawnT[i] = arrive + u * 1.4;
      S.spawnX[i] = -70 - Math.abs(g2(i, 10)) * 50;
      S.spawnY[i] = (hi ? 330 : 560) + Math.sin(u * 7) * 70 + g2(i, 12) * 55;
      S.spawnVX[i] = 270 + hash(i, 8) * 40;
      S.spawnVY[i] = (hi ? 30 : -30) + (hash(i, 9) - 0.5) * 50;
    }
    S.add({ kind: 'flock', at: T, dur, ...FLOCK, wHome: 0.12, home: () => [D.W + 400, 380] });
    S.add({ kind: 'flock', at: arrive, dur: T + dur - arrive, ...FLOCK, home: t => [D.CX + Math.sin(t * 0.45) * 380, 470 + Math.sin(t * 0.73) * 150] });
    const c = copy(D, 'murmuration', (o.lines || ['UNO SOLO', 'NO ES NADA.']).slice(0, 2));
    gsap.set(c.lines, { opacity: 0, y: 30, filter: 'blur(10px)' });

    D.show(c.s, T);
    tl.set(D.bars, { height: 540 }, T);
    D.barsTo(110, T + 0.05, 1.6);
    D.ink(C.paper, T);
    if (o.label) D.label(T + 0.8, o.label);
    tl.set(S.V, { alpha: 1, night: 0, size: 1 }, T);
    c.lines.forEach((el, i) => tl.to(el, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.9, ease: 'expo.out' }, T + 0.5 + i * 0.9));
    tl.to(c.lines, { opacity: 0, y: -20, filter: 'blur(8px)', duration: 0.4, ease: 'power2.in' }, arrive - 0.2);
    if (o.caption) tl.to(c.cap, { duration: 1, scrambleText: { text: o.caption, chars: '0123456789', speed: 0.8 }, ease: 'none' }, arrive + 1.7);
    tl.to(c.cap, { opacity: 0, duration: 0.4 }, T + dur - 0.5);
    D.call(() => SFX.pad('dusk', [110, 138.59, 164.81, 220], 2, 0.035, 900), T + 0.02);
    D.sfx('flutter', T + 0.2, 1.8, 0.07);
    D.sfx('bell', T + 0.5, NT.E5, 0.06);
    D.sfx('bell', T + 1.4, NT.A4, 0.06);
    D.sfx('flutter', arrive, 2.6, 0.26);
    D.sfx('swell', arrive, 3, 0.18);
    D.sfx('flutter', arrive + 2.6, 2, 0.18);
    D.hide(c.s, T + dur);
    return dur;
  });

  // ------------------------------------------------------------------ FLOCKWORD
  // The flock gathers into a word (birds hovering in place), holds, releases.  6 s
  recipe('flockword', (D, T, o) => {
    const { tl, N: NT } = D;
    const S = swarm(D, o), dur = o.duration || 6;
    const pts = samplePoints(D, o.word || 'JUNTOS', 320, 1560, o.y ?? 520, S.N);
    const tLock = T + 0.3 + (o.gather ?? 1.6);
    S.add({ kind: 'flock', at: T, dur, ...FLOCK, home: t => [D.CX + Math.sin(t * 0.45) * 300, 470 + Math.sin(t * 0.73) * 120] });
    S.add({ kind: 'form', at: T + 0.3, dur: dur - 0.9, rin: o.gather ?? 1.6, rout: 0.8, points: pts, hover: 2.5 });
    const c = copy(D, 'flockword', []);
    D.show(c.s, T);
    if (o.label) D.label(T, o.label);
    if (o.caption) {
      tl.to(c.cap, { duration: 0.9, scrambleText: { text: o.caption, chars: '0123456789', speed: 0.8 }, ease: 'none' }, tLock);
      tl.to(c.cap, { opacity: 0, duration: 0.3 }, T + dur - 1.0);
    }
    D.sfx('flutter', T + 0.3, 1.6, 0.24);
    D.sfx('boom', tLock, 0.6);
    [NT.A4, NT.C5, NT.E5].forEach((f, i) => D.sfx('bell', tLock + i * 0.1, f, 0.07));
    D.sfx('flutter', T + dur - 0.9, 1.4, 0.22);
    D.hide(c.s, T + dur);
    return dur;
  });

  // ------------------------------------------------------------------ PREDATOR
  // A raptor dives through the flock; it bursts open around the hawk ("flash
  // expansion") and closes again behind it. The sun keeps setting.         6 s
  recipe('predator', (D, T, o) => {
    const { tl, C, N: NT } = D;
    const S = swarm(D, o), dur = o.duration || 6;
    const P = o.path || [[2200, -220], [1350, 260], [760, 860], [-300, 340]];
    const tA = T + 0.6, tDur = 3.8;
    const path = t => bezier(P, Math.max(0, Math.min(1, (t - tA) / tDur)));
    S.add({ kind: 'flock', at: T, dur, ...FLOCK, sep: 2600, home: t => [D.CX + Math.sin(t * 0.45) * 300, 480 + Math.sin(t * 0.73) * 120] });
    S.add({ kind: 'pred', at: tA, dur: tDur, path, R: 250, flee: 2600 });
    S.preds.push({ at: tA, dur: tDur, path, color: hex(o.color || '#5c0f16') });
    const c = copy(D, 'predator', (o.lines || ['NADIE MANDA.', 'TODOS REACCIONAN.']).slice(0, 2));
    gsap.set(c.lines, { opacity: 0, y: 30, filter: 'blur(10px)' });
    D.show(c.s, T);
    if (o.label) D.label(T, o.label);
    tl.to(S.V, { night: 0.35, duration: dur, ease: 'none' }, T);
    c.lines.forEach((el, i) => tl.to(el, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.8, ease: 'expo.out' }, T + 2.3 + i * 1.0));
    tl.to(c.lines, { opacity: 0, y: -20, filter: 'blur(8px)', duration: 0.4, ease: 'power2.in' }, T + dur - 0.5);
    D.sfx('cry', tA + 0.2, 0.12);
    D.sfx('whoosh', tA + 0.9, 1.4, 0.45);
    D.sfx('boom', tA + 1.5, 0.5);
    D.shake(tA + 1.5, 0.4, 7);
    D.sfx('flutter', tA + 1.3, 2.2, 0.32);
    D.sfx('cry', tA + 2.6, 0.08);
    D.hide(c.s, T + dur);
    return dur;
  });

  // ------------------------------------------------------------------ FLOCKSHAPE
  // Blue hour: the flock draws shapes in the sky — an orbiting ring, a spiral
  // galaxy of birds, a heart — each named by a caption.        shapes × 1.9 + 0.4 s
  recipe('flockshape', (D, T, o) => {
    const { tl, N: NT } = D;
    const S = swarm(D, o);
    const shapes = o.shapes || [['ring', 'ÓRBITA'], ['spiral', 'ESPIRAL'], ['heart', 'CORAZÓN']];
    const step = 1.9, dur = shapes.length * step + 0.4;
    S.add({ kind: 'flock', at: T, dur, ...FLOCK, home: t => [D.CX, 500] });
    const c = copy(D, 'flockshape', []);
    D.show(c.s, T);
    if (o.label) D.label(T, o.label);
    tl.to(S.V, { night: o.night ?? 0.72, duration: dur, ease: 'none' }, T);
    tl.to(c.s, { color: D.C.paper, duration: 0.01 }, T + dur * 0.45);
    shapes.forEach(([kind, name], k) => {
      const t = T + 0.2 + k * step, polar = kind === 'ring' || kind === 'spiral';
      S.add({
        kind: 'form', at: t, dur: step, rin: 0.8, rout: 0.35, hover: polar ? 0 : 2.5, polar,
        cx: D.CX, cy: 520, squash: kind === 'ring' ? 0.62 : 0.85, spin: kind === 'ring' ? 1.3 : 0.9,
        points: shapePoints(kind, S.N, D.CX, 520),
      });
      tl.to(c.cap, { duration: 0.5, scrambleText: { text: name, chars: 'upperCase', speed: 1 }, ease: 'none' }, t + 0.5);
      D.sfx('whoosh', t, 1.2, 0.3);
      D.sfx('bell', t + 0.8, [NT.C5, NT.E5, NT.G5, NT.A5][k % 4], 0.07);
      D.sfx('flutter', t, 1.6, 0.15);
    });
    tl.to(c.cap, { opacity: 0, duration: 0.3 }, T + dur - 0.3);
    D.hide(c.s, T + dur);
    return dur;
  });

  // ------------------------------------------------------------------ FLOCKTITLE
  // Night. The birds light up and gather into the title (a drone-show finale),
  // hit, subtitle — then they burst outward into the dark.                  7 s
  recipe('flocktitle', (D, T, o) => {
    const { tl, C, N: NT } = D;
    const S = swarm(D, o), dur = o.duration || 7;
    const pts = samplePoints(D, o.word || D.cfg.meta.title, 300, 1600, o.y ?? 500, S.N);
    const tLock = T + 2.1, tBurst = T + dur - 1.9;
    S.add({ kind: 'flock', at: T, dur, ...FLOCK, home: () => [D.CX, 500] });
    S.add({ kind: 'form', at: T + 0.2, dur: tBurst - T - 0.2, rin: 1.7, rout: 0.25, points: pts, hover: 2 });
    S.add({ kind: 'burst', at: tBurst, dur: 0.7, cx: D.CX, cy: 520, force: 1600 });
    const s = D.scene('flocktitle', '<div class="sw-sub mono c"></div>');
    const sub = D.$('.sw-sub', s);
    D.show(s, T);
    D.ink(C.paper, T);
    if (o.label) D.label(T + 0.2, o.label);
    tl.to(S.V, { night: 1, duration: 1.2, ease: 'power1.inOut' }, T);
    D.hit(S.V, { size: 1.5 }, { size: 1, duration: 1.2, ease: 'expo.out' }, tLock);
    D.flash(tLock, 0.25, 0.5);
    D.sfx('riser', T + 0.6, tLock - T - 0.6, 0.3);
    D.sfx('boom', tLock, 0.9);
    D.sfx('crash', tLock, 0.22);
    [NT.A4, NT.C5, NT.E5, NT.A5].forEach((f, i) => D.sfx('bell', tLock + 0.1 + i * 0.11, f, 0.07));
    if (o.subtitle) {
      tl.set(sub, { opacity: 1 }, tLock + 0.4);
      tl.to(sub, { duration: 1.2, scrambleText: { text: o.subtitle, chars: 'upperCase', speed: 0.6 }, ease: 'none' }, tLock + 0.4);
      tl.to(sub, { opacity: 0, duration: 0.3 }, tBurst - 0.1);
    }
    D.sfx('whoosh', tBurst, 1.2, 0.45);
    D.sfx('flutter', tBurst, 1.6, 0.3);
    tl.to(S.V, { alpha: 0, duration: 0.6, ease: 'power2.in' }, T + dur - 0.6);
    D.call(() => SFX.padStop('dusk', 1.5), T + dur - 1);
    D.hide(s, T + dur);
    return dur;
  });
})();
