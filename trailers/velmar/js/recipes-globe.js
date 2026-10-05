/* ============================================================================
   GLOBE MODULE — a dot globe on the kit canvas, in orthographic projection.
   Land is a baked bit mask of Natural Earth 1:110m (js/data/land.js, public
   domain; rebuild with tools/make-land-mask.mjs): no images, no map tiles.
   One shared globe per trailer (Trailer.geo.globe(D)). Every frame is a pure
   function of tweened params, so scrubbing works:
     view (lon/lat) · radius · morph (sinusoidal flat map ⇄ globe) · reveal ·
     sun (day/night terminator + city lights) · great-circle arcs with altitude ·
     pins (pulse + label) · orbit rings · rim.
   Distances are computed (haversine, mean Earth radius 6371.0088 km): pass real
   coordinates, and real figures with a `source`.
   Recipes: globeintro, globeroutes, globeclock, globepulse, globetitle.
   ========================================================================== */
(() => {
  'use strict';
  const { recipe } = Trailer;
  const DEG = Math.PI / 180, TAU = Math.PI * 2, R_KM = 6371.0088;
  const clamp01 = x => (x < 0 ? 0 : x > 1 ? 1 : x);
  const sstep = (a, b, x) => { const t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t); };
  const wrap180 = d => ((((d + 180) % 360) + 360) % 360) - 180;
  const wrapPi = a => a - TAU * Math.floor((a + Math.PI) / TAU);
  const vec = (lat, lon) => { const p = lat * DEG, l = lon * DEG, c = Math.cos(p); return [c * Math.cos(l), c * Math.sin(l), Math.sin(p)]; };
  const dot3 = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const toLatLon = v => { const n = Math.hypot(v[0], v[1], v[2]) || 1; return { lat: Math.asin(v[2] / n) / DEG, lon: Math.atan2(v[1], v[0]) / DEG }; };
  const nf = (D, d = 0) => new Intl.NumberFormat(D.cfg.locale || 'en-US', { minimumFractionDigits: d, maximumFractionDigits: d });

  /** Great-circle distance in km between two {lat, lon} points (haversine). */
  function distKm(a, b) {
    const p1 = a.lat * DEG, p2 = b.lat * DEG, dp = p2 - p1, dl = (b.lon - a.lon) * DEG;
    const h = Math.sin(dp / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2;
    return 2 * R_KM * Math.asin(Math.min(1, Math.sqrt(h)));
  }
  /** The point at fraction u along the great circle a→b, as {lat, lon}. */
  function along(a, b, u) {
    const A = vec(a.lat, a.lon), B = vec(b.lat, b.lon), om = Math.acos(Math.max(-1, Math.min(1, dot3(A, B))));
    if (om < 1e-6) return { lat: a.lat, lon: a.lon };
    const s = Math.sin(om), k1 = Math.sin((1 - u) * om) / s, k2 = Math.sin(u * om) / s;
    return toLatLon([k1 * A[0] + k2 * B[0], k1 * A[1] + k2 * B[1], k1 * A[2] + k2 * B[2]]);
  }

  // ------------------------------------------------------------------ LAND + LATTICE
  let MASK = null;
  function landMask() {
    if (MASK) return MASK;
    const L = window.KIT_DATA && window.KIT_DATA.land;
    if (!L) throw new Error('recipes-globe.js needs js/data/land.js (window.KIT_DATA.land) loaded before it');
    const bin = atob(L.b64), bits = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bits[i] = bin.charCodeAt(i);
    MASK = (lat, lon) => {
      const c = Math.min(L.w - 1, Math.floor(((lon + 180) / 360) * L.w)), r = Math.min(L.h - 1, Math.floor(((90 - lat) / 180) * L.h)), i = r * L.w + c;
      return (bits[i >> 3] & (128 >> (i & 7))) !== 0;
    };
    return MASK;
  }
  // optional highlight mask (a country): window.KIT_DATA.hl, baked with --countries
  function hlMask() {
    const L = window.KIT_DATA && window.KIT_DATA.hl;
    if (!L) return null;
    const bin = atob(L.b64), bits = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bits[i] = bin.charCodeAt(i);
    return (lat, lon) => {
      const c = Math.min(L.w - 1, Math.floor(((lon + 180) / 360) * L.w)), r = Math.min(L.h - 1, Math.floor(((90 - lat) / 180) * L.h)), i = r * L.w + c;
      return (bits[i >> 3] & (128 >> (i & 7))) !== 0;
    };
  }
  // rows of evenly spaced dots (equal-area-ish), kept where the mask says land
  function lattice(rows) {
    const land = landMask(), hl = hlMask(), ll = [];
    for (let i = 0; i < rows; i++) {
      const lat = -90 + ((i + 0.5) / rows) * 180, n = Math.max(1, Math.round(2 * rows * Math.cos(lat * DEG)));
      for (let j = 0; j < n; j++) {
        const lon = wrap180(-180 + ((j + 0.5 + (i % 2) * 0.5) / n) * 360);
        if (land(lat, lon)) ll.push(lat, lon);
      }
    }
    const N = ll.length / 2, f = () => new Float32Array(N);
    const P = { N, x: f(), y: f(), z: f(), la: f(), lo: f(), cl: f(), h: f(), hl: new Uint8Array(N), hasHl: !!hl };
    for (let k = 0; k < N; k++) {
      const v = vec(ll[2 * k], ll[2 * k + 1]);
      P.x[k] = v[0]; P.y[k] = v[1]; P.z[k] = v[2];
      P.la[k] = ll[2 * k] * DEG; P.lo[k] = ll[2 * k + 1] * DEG; P.cl[k] = Math.cos(P.la[k]);
      const s = Math.sin(k * 12.9898 + 78.233) * 43758.5453;
      P.h[k] = s - Math.floor(s);
      if (hl && hl(ll[2 * k], ll[2 * k + 1])) P.hl[k] = 1;
    }
    return P;
  }
  // graticule every 30°, as runs of unit vectors
  const GRAT = (() => {
    const lines = [];
    for (let lon = -180; lon < 180; lon += 30) { const l = []; for (let lat = -90; lat <= 90; lat += 5) l.push(vec(lat, lon)); lines.push(l); }
    for (let lat = -60; lat <= 60; lat += 30) { const l = []; for (let lon = -180; lon <= 180; lon += 5) l.push(vec(lat, lon)); lines.push(l); }
    return lines;
  })();

  // ------------------------------------------------------------------ THE SHARED GLOBE
  /** The trailer's one globe (created on first use): a state object to tween + its canvas layer. */
  function globe(D) {
    if (D._globe) return D._globe;
    const gc = D.cfg.globe || {};
    const P = lattice(gc.rows || 150);
    const G = {
      alpha: 0, cx: D.CX, cy: D.CY, r: 420, lon: 0, lat: 0,
      morph: 1, mapS: 232, reveal: 1, dot: 3.3, ocean: 1, atmo: 1, grat: 0, rim: 0, rimW: 10, labelMin: 40, labelMax: D.W - 40,
      sun: 0, sunLat: 0, sunLon: 0, term: 0, lights: 0, hl: 0,
      col: {
        land: '#7dd3fc', twilight: '#fb923c', night: '#4a6fe0', ocean: '#03101d', oceanHi: '#0b2944', atmo: '#38bdf8',
        grat: '#7dd3fc', arc: '#f472b6', head: '#ffffff', pin: '#ffffff', label: '#e8f4fd', light: '#fcd34d', rim: D.C.paper, ring: '#e8f4fd', hl: '#ffffff',
        ...(gc.colors || {}),
      },
      arcs: [], pins: [], rings: [], cities: [],
      N: P.N,
      view: { lon: 0, lat: 0 }, // build-time: where the last planned camera move ends (shortest-way turns)
    };
    D._globe = G;
    D.layer(G, g => draw(g, G, P, D));
    return G;
  }

  // ---- build-time helpers (recipes use these; trailers can too via Trailer.geo)
  /** Turn the camera to look at (lon, lat) the short way round; dur 0 = cut. */
  function turn(D, G, lon, lat, at, dur = 1.2, ease = 'power2.inOut') {
    const L = G.view.lon + wrap180(lon - G.view.lon);
    G.view = { lon: L, lat };
    if (dur) D.tl.to(G, { lon: L, lat, duration: dur, ease }, at);
    else D.tl.set(G, { lon: L, lat }, at);
    return L;
  }
  /** Spin the camera by `deg` of longitude (ease 'none' by default). */
  function spin(D, G, deg, at, dur, ease = 'none') {
    G.view = { lon: G.view.lon + deg, lat: G.view.lat };
    D.tl.to(G, { lon: G.view.lon, duration: dur, ease }, at);
  }
  /** A great-circle arc a→b ({lat, lon}); tween its p (0 = at a, 1 = head at b, 1+tail = gone). */
  function mkArc(G, a, b, o = {}) {
    const A = vec(a.lat, a.lon), B = vec(b.lat, b.lon), om = Math.acos(Math.max(-1, Math.min(1, dot3(A, B))));
    const arc = { A, B, om, s: Math.sin(om) || 1, h: o.h ?? 0.04 + 0.12 * Math.sqrt(om / Math.PI), p: 0, tail: o.tail ?? 0.32, alpha: 0, keep: 0, w: o.w ?? 2.4, color: o.color || null };
    G.arcs.push(arc);
    return arc;
  }
  /** A city pin: tween alpha, pulse (0→1 = one ring), la (label alpha). */
  function mkPin(G, c, o = {}) {
    const pin = { v: vec(c.lat, c.lon), alpha: 0, pulse: 0, la: 0, label: o.label ?? c.name ?? '', sub: o.sub || '', side: o.side || 'right', size: o.size || 1, color: o.color || null };
    G.pins.push(pin);
    return pin;
  }
  /** Fly one arc (with an optional persistent trace) and return its arrival time. */
  function fly(D, arc, at, dur = 1.1, keep = 0) {
    D.tl.set(arc, { alpha: 1, keep, p: 0 }, at);
    D.tl.to(arc, { p: 1, duration: dur, ease: 'power1.inOut' }, at);
    D.tl.to(arc, { p: 1 + arc.tail, duration: dur * 0.4, ease: 'power1.out' }, at + dur);
    return at + dur;
  }

  // ------------------------------------------------------------------ RENDER
  let buf = null;
  const AX = new Float32Array(97), AY = new Float32Array(97), AV = new Uint8Array(97);
  function draw(g, G, P, D) {
    const { cx, cy, r } = G, col = G.col, rgba = D.rgba, A0 = g.globalAlpha;
    if (r < 0.5) return;
    if (!buf || buf.n !== P.N) buf = { n: P.N, x: new Float32Array(P.N), y: new Float32Array(P.N), s: new Float32Array(P.N), k: new Uint8Array(P.N), order: new Int32Array(P.N) };
    const la = G.lat * DEG, lo = G.lon * DEG, sa = Math.sin(la), ca = Math.cos(la), so = Math.sin(lo), co = Math.cos(lo);
    const E0 = -so, E1 = co, N0 = -sa * co, N1 = -sa * so, N2 = ca, V0 = ca * co, V1 = ca * so, V2 = sa;
    const m = G.morph, sphere = m >= 0.999, disk = sstep(0.35, 1, m), sz = Math.sqrt(r / 420);
    const B3 = { E0, E1, N0, N1, N2, V0, V1, V2, cx, cy, r };

    for (const ring of G.rings) drawRing(g, G, ring, false, A0, col);

    // atmosphere halo, ocean disk, inner fresnel
    if (G.atmo * disk > 0.003) {
      const ga = G.atmo * disk, hg = g.createRadialGradient(cx, cy, r * 0.9, cx, cy, r * 1.34);
      hg.addColorStop(0, rgba(col.atmo, 0));
      hg.addColorStop(0.2, rgba(col.atmo, 0.3 * ga));
      hg.addColorStop(0.45, rgba(col.atmo, 0.09 * ga));
      hg.addColorStop(1, rgba(col.atmo, 0));
      g.fillStyle = hg;
      g.beginPath(); g.arc(cx, cy, r * 1.34, 0, TAU); g.fill();
    }
    if (G.ocean * disk > 0.003) {
      const og = g.createRadialGradient(cx - r * 0.35, cy - r * 0.42, 0, cx, cy, r * 1.08);
      og.addColorStop(0, col.oceanHi);
      og.addColorStop(1, col.ocean);
      g.globalAlpha = A0 * G.ocean * disk;
      g.fillStyle = og;
      g.beginPath(); g.arc(cx, cy, r, 0, TAU); g.fill();
      const fg = g.createRadialGradient(cx, cy, r * 0.72, cx, cy, r);
      fg.addColorStop(0, rgba(col.atmo, 0));
      fg.addColorStop(1, rgba(col.atmo, 0.26 * G.atmo));
      g.fillStyle = fg;
      g.fill();
      g.globalAlpha = A0;
    }

    // graticule
    if (G.grat * disk > 0.003) {
      g.strokeStyle = col.grat;
      g.globalAlpha = A0 * G.grat * disk * 0.16;
      g.lineWidth = 1;
      g.beginPath();
      for (const line of GRAT) {
        let pen = false;
        for (const v of line) {
          const Z = v[0] * V0 + v[1] * V1 + v[2] * V2;
          if (Z <= 0) { pen = false; continue; }
          const x = cx + (v[0] * E0 + v[1] * E1) * r, y = cy - (v[0] * N0 + v[1] * N1 + v[2] * N2) * r;
          if (pen) g.lineTo(x, y); else { g.moveTo(x, y); pen = true; }
        }
      }
      g.stroke();
      g.globalAlpha = A0;
    }

    // land dots → 4 colours (land, twilight, night, highlight) × 8 brightness buckets, one fill per bucket
    const sunOn = G.sun > 0.001, SV = sunOn ? vec(G.sunLat, G.sunLon) : null, rev = G.reveal, hlOn = P.hasHl && G.hl > 0.001;
    const size0 = G.dot * sz, cnt = new Int32Array(33);
    const X = buf.x, Y = buf.y, S = buf.s, K = buf.k;
    for (let k = 0; k < P.N; k++) {
      const px = P.x[k], py = P.y[k], pz = P.z[k];
      const Xs = px * E0 + py * E1, Ys = px * N0 + py * N1 + pz * N2, Zs = px * V0 + py * V1 + pz * V2;
      let sx, sy, b, s = size0;
      if (sphere) {
        if (Zs <= 0) { K[k] = 32; continue; }
        sx = cx + Xs * r; sy = cy - Ys * r; b = 0.28 + 0.72 * Zs; s = size0 * (0.6 + 0.4 * Zs);
      } else {
        const dl = wrapPi(P.lo[k] - lo);
        const fx = cx + dl * P.cl[k] * G.mapS, fy = cy - P.la[k] * G.mapS;
        const e = sstep(0, 1, m * 1.7 - (Math.abs(dl) / Math.PI) * 0.7);
        const eb = Zs > 0 ? 0.28 + 0.72 * Zs : 0;
        sx = fx + (cx + Xs * r - fx) * e; sy = fy + (cy - Ys * r - fy) * e;
        b = 0.85 + (eb - 0.85) * e;
        if (Zs <= 0) b *= (1 - e);
        s = size0 * (1 - e * 0.3);
        if (rev < 1) b *= sstep(0, 0.1, rev * 1.12 - (((dl + Math.PI) / TAU) * 0.68 + P.h[k] * 0.32));
      }
      let c = 0;
      if (sunOn) {
        const d = px * SV[0] + py * SV[1] + pz * SV[2];
        b *= 1 - G.sun * (1 - (0.42 + 0.58 * sstep(-0.06, 0.1, d)));
        if (G.sun > 0.5) c = d > 0.1 ? 0 : d > -0.06 ? 1 : 2;
      }
      if (hlOn) {
        if (P.hl[k]) { b = Math.min(1, b * (1 + 0.5 * G.hl) + 0.25 * G.hl); if (G.hl > 0.35) c = 3; s *= 1 + 0.2 * G.hl; }
        else b *= 1 - 0.62 * G.hl;
      }
      if (b < 0.03) { K[k] = 32; continue; }
      const lv = Math.min(7, Math.floor(b * 8));
      K[k] = c * 8 + lv; X[k] = sx; Y[k] = sy; S[k] = s;
      cnt[c * 8 + lv]++;
    }
    const start = new Int32Array(33);
    for (let i = 1; i < 33; i++) start[i] = start[i - 1] + cnt[i - 1];
    const fillPos = start.slice(), ord = buf.order;
    for (let k = 0; k < P.N; k++) if (K[k] < 32) ord[fillPos[K[k]]++] = k;
    const cols = [col.land, col.twilight, col.night, col.hl];
    for (let bk = 0; bk < 32; bk++) {
      if (!cnt[bk]) continue;
      g.fillStyle = cols[(bk / 8) | 0];
      g.globalAlpha = A0 * ((bk % 8) + 0.7) / 7.7;
      g.beginPath();
      for (let i = start[bk], e = start[bk] + cnt[bk]; i < e; i++) { const k = ord[i], s = S[k]; g.rect(X[k] - s / 2, Y[k] - s / 2, s, s); }
      g.fill();
    }
    g.globalAlpha = A0;

    // terminator: the great circle 90° from the sun
    if (sunOn && G.term > 0.003) {
      const up = Math.abs(SV[2]) > 0.99 ? [1, 0, 0] : [0, 0, 1];
      let u1 = [SV[1] * up[2] - SV[2] * up[1], SV[2] * up[0] - SV[0] * up[2], SV[0] * up[1] - SV[1] * up[0]];
      const n1 = Math.hypot(...u1); u1 = u1.map(x => x / n1);
      const u2 = [SV[1] * u1[2] - SV[2] * u1[1], SV[2] * u1[0] - SV[0] * u1[2], SV[0] * u1[1] - SV[1] * u1[0]];
      g.strokeStyle = col.twilight;
      g.lineWidth = 1.5;
      g.globalAlpha = A0 * G.term * G.sun * 0.55;
      g.beginPath();
      let pen = false;
      for (let i = 0; i <= 180; i++) {
        const t = (i / 180) * TAU, ct = Math.cos(t), st = Math.sin(t);
        const v0 = ct * u1[0] + st * u2[0], v1 = ct * u1[1] + st * u2[1], v2 = ct * u1[2] + st * u2[2];
        if (v0 * V0 + v1 * V1 + v2 * V2 <= 0) { pen = false; continue; }
        const x = cx + (v0 * E0 + v1 * E1) * r, y = cy - (v0 * N0 + v1 * N1 + v2 * N2) * r;
        if (pen) g.lineTo(x, y); else { g.moveTo(x, y); pen = true; }
      }
      g.stroke();
      g.globalAlpha = A0;
    }

    g.globalCompositeOperation = 'lighter';
    // city lights on the night side
    if (sunOn && G.lights > 0.003) {
      const lr = 11 * sz;
      for (const c of G.cities) {
        const v = c.v, Z = v[0] * V0 + v[1] * V1 + v[2] * V2;
        if (Z <= 0.02) continue;
        const nightK = sstep(0.04, -0.1, dot3(v, SV)) * G.lights * G.sun * sstep(0.02, 0.2, Z);
        if (nightK < 0.01) continue;
        const x = cx + (v[0] * E0 + v[1] * E1) * r, y = cy - (v[0] * N0 + v[1] * N1 + v[2] * N2) * r;
        const lg = g.createRadialGradient(x, y, 0, x, y, lr);
        lg.addColorStop(0, rgba('#ffffff', 0.95 * nightK));
        lg.addColorStop(0.18, rgba(col.light, 0.8 * nightK));
        lg.addColorStop(1, rgba(col.light, 0));
        g.fillStyle = lg;
        g.fillRect(x - lr, y - lr, lr * 2, lr * 2);
      }
    }

    // great-circle arcs: persistent trace, comet trail (glow + core), head
    for (const a of G.arcs) {
      if (a.alpha <= 0.003 || a.p <= 0) continue;
      const ac = a.color || col.arc, p1 = Math.min(1, a.p);
      if (a.keep > 0.003) {
        const n = 64;
        for (let i = 0; i <= n; i++) arcPt(a, (i / n) * p1, B3, i);
        g.strokeStyle = ac;
        g.globalAlpha = A0 * a.alpha * a.keep * 0.42;
        g.lineWidth = 1.3 * sz;
        run(g, 0, n);
      }
      const u0 = Math.max(0, a.p - a.tail);
      if (p1 > u0) {
        const n = 32;
        for (let i = 0; i <= n; i++) arcPt(a, u0 + ((p1 - u0) * i) / n, B3, i);
        for (let j = 0; j < 8; j++) {
          const k = (j + 1) / 8, al = A0 * a.alpha * k ** 1.5;
          g.strokeStyle = ac;
          g.globalAlpha = al * 0.16;
          g.lineWidth = a.w * 4 * sz;
          run(g, j * 4, j * 4 + 4);
          g.globalAlpha = al;
          g.lineWidth = a.w * (0.35 + 0.65 * k) * sz;
          run(g, j * 4, j * 4 + 4);
        }
      }
      if (a.p < 1) {
        arcPt(a, a.p, B3, 0);
        if (AV[0]) {
          const hr = 18 * sz, hx = AX[0], hy = AY[0], hg = g.createRadialGradient(hx, hy, 0, hx, hy, hr);
          hg.addColorStop(0, rgba(col.head, 0.95));
          hg.addColorStop(0.22, rgba(ac, 0.55));
          hg.addColorStop(1, rgba(ac, 0));
          g.globalAlpha = A0 * a.alpha;
          g.fillStyle = hg;
          g.fillRect(hx - hr, hy - hr, hr * 2, hr * 2);
        }
      }
    }
    g.globalCompositeOperation = 'source-over';
    g.globalAlpha = A0;

    // pins: halo, core, pulse ring, label
    if (G.pins.length) {
      const mono = `"${D.cfg.fonts.mono}", monospace`;
      for (const pn of G.pins) {
        if (pn.alpha <= 0.003) continue;
        const v = pn.v, Z = v[0] * V0 + v[1] * V1 + v[2] * V2;
        const vis = sstep(-0.02, 0.14, Z) * pn.alpha;
        if (vis < 0.01) continue;
        const x = cx + (v[0] * E0 + v[1] * E1) * r, y = cy - (v[0] * N0 + v[1] * N1 + v[2] * N2) * r, ps = pn.size * sz, pc = pn.color || col.pin;
        g.fillStyle = pc;
        g.globalAlpha = A0 * vis * 0.22;
        g.beginPath(); g.arc(x, y, 9 * ps, 0, TAU); g.fill();
        g.globalAlpha = A0 * vis;
        g.beginPath(); g.arc(x, y, 4 * ps, 0, TAU); g.fill();
        if (pn.pulse > 0 && pn.pulse < 1) {
          g.strokeStyle = pc;
          g.lineWidth = 2;
          g.globalAlpha = A0 * vis * (1 - pn.pulse) ** 1.4;
          g.beginPath(); g.arc(x, y, (6 + pn.pulse * 46) * ps, 0, TAU); g.stroke();
        }
        if (pn.la > 0.01 && pn.label) {
          g.font = `600 ${Math.round(19 * Math.max(0.8, ps))}px ${mono}`;
          if ('letterSpacing' in g) g.letterSpacing = '3px';
          const tw = g.measureText(pn.label).width + 18 * ps;
          let left = pn.side === 'left';
          if (!left && x + tw > G.labelMax) left = true;
          else if (left && x - tw < G.labelMin) left = false;
          const lx = x + (left ? -18 : 18) * ps;
          g.textAlign = left ? 'right' : 'left';
          g.textBaseline = 'alphabetic';
          g.shadowColor = 'rgba(0,0,0,.85)';
          g.shadowBlur = 10;
          g.fillStyle = col.label;
          g.globalAlpha = A0 * vis * pn.la;
          g.font = `600 ${Math.round(19 * Math.max(0.8, ps))}px ${mono}`;
          g.fillText(pn.label, lx, y - 10 * ps);
          if (pn.sub) {
            g.globalAlpha = A0 * vis * pn.la * 0.65;
            g.font = `500 ${Math.round(15 * Math.max(0.8, ps))}px ${mono}`;
            g.fillText(pn.sub, lx, y + 14 * ps);
          }
          g.shadowBlur = 0;
          if ('letterSpacing' in g) g.letterSpacing = '0px';
        }
      }
      g.globalAlpha = A0;
    }

    for (const ring of G.rings) drawRing(g, G, ring, true, A0, col);
    if (G.rim > 0.003) {
      g.strokeStyle = col.rim;
      g.globalAlpha = A0 * G.rim;
      g.lineWidth = G.rimW;
      g.beginPath(); g.arc(cx, cy, r + G.rimW / 2, 0, TAU); g.stroke();
      g.globalAlpha = A0;
    }
  }
  // one arc sample → AX/AY/AV[i]; elevated points past the limb stay visible
  function arcPt(a, u, B, i) {
    const k1 = Math.sin((1 - u) * a.om) / a.s, k2 = Math.sin(u * a.om) / a.s, lift = 1 + a.h * Math.sin(Math.PI * u);
    const x = (k1 * a.A[0] + k2 * a.B[0]) * lift, y = (k1 * a.A[1] + k2 * a.B[1]) * lift, z = (k1 * a.A[2] + k2 * a.B[2]) * lift;
    const Xs = x * B.E0 + y * B.E1, Ys = x * B.N0 + y * B.N1 + z * B.N2, Zs = x * B.V0 + y * B.V1 + z * B.V2;
    AX[i] = B.cx + Xs * B.r; AY[i] = B.cy - Ys * B.r; AV[i] = Zs > 0 || Xs * Xs + Ys * Ys > 1 ? 1 : 0;
  }
  function run(g, i0, i1) {
    g.beginPath();
    let pen = false;
    for (let i = i0; i <= i1; i++) {
      if (!AV[i]) { pen = false; continue; }
      if (pen) g.lineTo(AX[i], AY[i]); else { g.moveTo(AX[i], AY[i]); pen = true; }
    }
    g.stroke();
  }
  // an orbit ellipse around the globe; the upper half passes behind it
  function drawRing(g, G, ring, front, A0, col) {
    if (ring.alpha <= 0.003) return;
    const n = 144, R = ring.k * G.r, t = ring.tilt * DEG, ct = Math.cos(t), st = Math.sin(t), ro = ring.rot * DEG, cr = Math.cos(ro), sr = Math.sin(ro);
    const at = th => { const lx = R * Math.cos(th), ly = R * Math.sin(th) * ct; return [G.cx + lx * cr - ly * sr, G.cy + lx * sr + ly * cr]; };
    g.strokeStyle = ring.color || col.ring;
    g.lineWidth = ring.w || 2;
    g.globalAlpha = A0 * ring.alpha * (front ? 0.85 : 0.3);
    g.beginPath();
    let pen = false;
    for (let i = 0; i <= n; i++) {
      const th = (i / n) * TAU;
      if ((Math.sin(th) * st >= 0) !== front) { pen = false; continue; }
      const [x, y] = at(th);
      if (pen) g.lineTo(x, y); else { g.moveTo(x, y); pen = true; }
    }
    g.stroke();
    if (ring.sat) {
      const th = ring.phase * TAU;
      if ((Math.sin(th) * st >= 0) === front) {
        const [x, y] = at(th), hr = 16;
        const hg = g.createRadialGradient(x, y, 0, x, y, hr);
        hg.addColorStop(0, D_rgba('#ffffff', 1));
        hg.addColorStop(0.25, D_rgba(ring.color || col.arc, 0.6));
        hg.addColorStop(1, D_rgba(ring.color || col.arc, 0));
        g.globalAlpha = A0 * ring.alpha * (front ? 1 : 0.4);
        g.fillStyle = hg;
        g.fillRect(x - hr, y - hr, hr * 2, hr * 2);
      }
    }
    g.globalAlpha = A0;
  }
  function D_rgba(hex, a) {
    const h = hex.replace('#', ''), n = parseInt(h.length === 3 ? h.replace(/./g, '$&$&') : h, 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
  }

  // ------------------------------------------------------------------ GLOBEINTRO
  // A flat dot map (sinusoidal projection) scans in, then wraps itself into the
  // orthographic globe while the camera starts to turn. Two words, one per state.   8 s
  recipe('globeintro', (D, T, o) => {
    const { tl, C, CX } = D;
    const G = globe(D), dur = o.duration || 8, v0 = o.view || { lon: -30, lat: 0 };
    const fill = t => String(t || '').replace('{n}', nf(D).format(G.N));
    const s = D.scene('globeintro', `
      <div class="gl-kick mono"></div>
      <div class="gl-word v c">${o.map || 'A MAP.'}</div>
      <div class="gl-word v c">${o.world || 'A WORLD.'}</div>`);
    const kick = D.$('.gl-kick', s), words = D.$$('.gl-word', s).map(w => D.split(D.fit(w, 1500), { type: 'chars', mask: 'chars' }));
    words.forEach(w => gsap.set(w.chars, { yPercent: 115 }));

    D.show(s, T);
    D.setBg(C.night, T);
    D.ink(C.paper, T);
    tl.set(D.bars, { height: 540 }, T);
    D.barsTo(96, T + 0.05, 1.6);
    G.view = { lon: v0.lon, lat: 0 };
    tl.set(G, { alpha: 1, morph: 0, reveal: 0, cx: CX, cy: 470, r: 420, lon: v0.lon, lat: 0, mapS: 232, ocean: 1, atmo: 1, grat: 0, sun: 0, lights: 0, rim: 0 }, T);
    if (o.label) D.label(T + 0.6, o.label);
    D.call(() => SFX.pad('globe', [55, 82.41, 110, 164.81], 2.5, 0.05, 700), T + 0.02);

    // 1 · the map scans in, west to east
    tl.to(G, { reveal: 1, duration: 2.2, ease: 'power1.inOut' }, T + 0.3);
    for (let k = 0; k < 11; k++) D.sfx('tick', T + 0.3 + k * 0.2, 0.03);
    D.sfx('swell', T + 0.2, 2.4, 0.12);
    if (o.kicker) tl.to(kick, { duration: 1.1, scrambleText: { text: fill(o.kicker), chars: 'upperCase', speed: 0.6 }, ease: 'none' }, T + 0.5);
    tl.to(words[0].chars, { yPercent: 0, duration: 0.9, ease: 'expo.out', stagger: 0.04 }, T + 1.2);
    D.sfx('bell', T + 1.2, D.N.E5, 0.06);
    tl.to(words[0].chars, { yPercent: -115, duration: 0.45, ease: 'expo.in', stagger: 0.02 }, T + 2.9);

    // 2 · wrap: the map becomes a globe, the camera starts to turn
    const tw = T + 3.1, dw = 2.4;
    tl.to(G, { morph: 1, cy: 505, r: 350, lat: v0.lat, duration: dw, ease: 'power2.inOut' }, tw);
    G.view.lat = v0.lat;
    spin(D, G, o.spin ?? 80, tw, dur - 3.1, 'power1.inOut');
    tl.to(G, { grat: 1, duration: 1.2 }, tw + dw - 0.6);
    if (o.kicker2) tl.to(kick, { duration: 1.1, scrambleText: { text: fill(o.kicker2), chars: 'upperCase', speed: 0.6 }, ease: 'none' }, tw + 0.3);
    D.sfx('whoosh', tw, 1.8, 0.35);
    D.sfx('riser', tw, dw, 0.3);
    D.sfx('boom', tw + dw, 0.7);
    D.flash(tw + dw, 0.22, 0.6, '#bfe6ff');
    D.shake(tw + dw, 0.35, 6);
    tl.to(words[1].chars, { yPercent: 0, duration: 0.9, ease: 'expo.out', stagger: 0.04 }, tw + dw);
    [D.N.A4, D.N.C5, D.N.E5].forEach(f => D.sfx('bell', tw + dw, f, 0.06));
    tl.to(words[1].chars, { yPercent: -115, duration: 0.45, ease: 'expo.in', stagger: 0.02 }, T + dur - 0.6);
    tl.to(kick, { opacity: 0, duration: 0.4 }, T + dur - 0.5);
    D.hide(s, T + dur);
    return dur;
  });

  // ------------------------------------------------------------------ GLOBEROUTES
  // From one city to many: the camera follows each great-circle flight, the pin
  // lands, a departures board fills in the computed distance, a total rolls up.
  recipe('globeroutes', (D, T, o) => {
    const { tl, N } = D;
    const G = globe(D), from = o.from, to = o.to || [], n = to.length, fmt = nf(D), unit = o.unit || 'KM';
    const step = o.step || 1.5, t0 = T + 1.3, dur = o.duration || 1.3 + n * step + 2.4;
    const km = to.map(c => distKm(from, c));
    const s = D.scene('globeroutes', `
      <div class="gr-board">
        ${o.kicker ? `<div class="gr-kick mono">${o.kicker}</div>` : ''}
        <div class="gr-title v">${o.title || from.name}</div>
        ${o.sub ? `<div class="gr-sub mono">${o.sub}</div>` : ''}
        <div class="gr-rows">${to.map(c => `<div class="gr-row"><span class="gr-city v">${c.name}</span><span class="gr-km mono">— — —</span></div>`).join('')}</div>
        <div class="gr-total"><span class="gr-tl mono">${o.total || 'TOTAL'}</span><span class="gr-tv v">0 ${unit}</span></div>
      </div>`);
    const board = D.$('.gr-board', s), rows = D.$$('.gr-row', s), kms = D.$$('.gr-km', s), tv = D.$('.gr-tv', s);
    gsap.set(board.children, { opacity: 0, y: 24 });
    gsap.set(rows, { opacity: 0.28 });

    const hub = mkPin(G, from, { label: from.name.toUpperCase(), size: 1.25 });
    const pins = to.map(c => mkPin(G, c, { label: c.name.toUpperCase(), side: c.side || 'right' }));
    const arcs = to.map(c => mkArc(G, from, c, { tail: 0.34, w: 2.6 }));
    const focus = c => { const f = along(from, c, 0.58); return { lon: f.lon, lat: Math.max(-58, Math.min(58, f.lat * 0.85)) }; };

    D.show(s, T);
    if (o.label) D.label(T, o.label);
    tl.to(G, { cx: o.cx ?? 690, cy: 540, r: o.r ?? 400, grat: 0.6, duration: 1.3, ease: 'expo.inOut' }, T);
    tl.set(G, { labelMax: (o.boardX ?? 1190) - 40 }, T);
    const f0 = focus(to[0]);
    turn(D, G, f0.lon, f0.lat, T, 1.3);
    tl.to(board.children, { opacity: 1, y: 0, duration: 0.8, ease: 'expo.out', stagger: 0.07 }, T + 0.65);
    tl.set(hub, { alpha: 1, la: 1, pulse: 0 }, T + 0.5);
    tl.to(hub, { pulse: 1, duration: 1.2, ease: 'power2.out' }, T + 0.5);
    D.sfx('bell', T + 0.5, N.A4, 0.06);
    D.sfx('whoosh', T, 0.9, 0.2);

    let total = 0;
    const tot = { v: 0 }, paintTot = () => { tv.textContent = `${fmt.format(Math.round(tot.v))} ${unit}`; };
    const notes = [N.C5, N.D5, N.E5, N.G5, N.A5, N.C6];
    to.forEach((c, i) => {
      const at = t0 + i * step;
      if (i > 0) { const f = focus(c); turn(D, G, f.lon, f.lat, at - 0.35, step - 0.1); }
      const land = fly(D, arcs[i], at, 1.05, 1);
      D.sfx('whoosh', at, 0.8, 0.12);
      tl.set(pins[i], { alpha: 1, la: 0, pulse: 0 }, land - 0.02);
      tl.to(pins[i], { pulse: 1, duration: 1.1, ease: 'power2.out' }, land);
      tl.to(pins[i], { la: 1, duration: 0.3 }, land);
      tl.to(rows[i], { opacity: 1, duration: 0.25 }, land);
      tl.to(kms[i], { duration: 0.6, scrambleText: { text: `${fmt.format(Math.round(km[i]))} ${unit}`, chars: '0123456789', speed: 1 }, ease: 'none' }, land);
      total += km[i];
      tl.to(tot, { v: total, duration: 0.8, ease: 'power2.out', onUpdate: paintTot }, land);
      D.sfx('bell', land, notes[i % notes.length], 0.07);
      D.sfx('tick', land, 0.05);
      if (i > 0) tl.to(pins[i - 1], { la: 0, duration: 0.4 }, land);
    });
    // pull back: every route at once
    const tb = t0 + n * step;
    tl.to(G, { r: (o.r ?? 400) * 0.9, duration: 1.8, ease: 'power2.inOut' }, tb);
    turn(D, G, from.lon + (o.endTurn ?? 25), 0, tb, 1.8);
    tl.to(pins, { la: 0, duration: 0.4 }, tb);
    D.sfx('boom', tb + 0.2, 0.4);
    // out
    tl.to(board.children, { opacity: 0, y: -16, duration: 0.4, ease: 'power2.in', stagger: 0.03 }, T + dur - 0.6);
    tl.to([...arcs], { keep: 0, duration: 0.5 }, T + dur - 0.6);
    tl.to([hub, ...pins], { alpha: 0, la: 0, duration: 0.5 }, T + dur - 0.6);
    tl.set(G, { labelMax: D.W - 40 }, T + dur);
    D.hide(s, T + dur);
    return dur;
  });

  // ------------------------------------------------------------------ GLOBECLOCK
  // A day in fast-forward: the Earth turns under a fixed sun, the terminator stays,
  // city lights come on as they cross into the night; a UTC clock rolls.   7.5 s
  recipe('globeclock', (D, T, o) => {
    const { tl } = D;
    const G = globe(D), dur = o.duration || 7.5, decl = o.decl ?? 23.44, h0 = o.from ?? 0, h1 = o.to ?? 24, off = o.offset ?? 78;
    G.cities = (o.cities || []).map(c => ({ v: vec(c.lat, c.lon) }));
    const s = D.scene('globeclock', `
      <div class="gc-copy">
        ${o.kicker ? `<div class="gc-kick mono">${o.kicker}</div>` : ''}
        <div class="gc-text v" style="--accent:${o.accent || G.col.twilight}">${o.text || ''}</div>
        <div class="gc-clock mono"><b>UTC</b><span>00:00</span></div>
      </div>`);
    const copy = D.$('.gc-copy', s), clock = D.$('.gc-clock span', s), lines = D.$('.gc-text', s);
    D.fit(lines, 740);
    const sp = D.split(lines, { type: 'lines,words', mask: 'lines' });
    gsap.set(sp.lines, { yPercent: 110 });
    gsap.set([D.$('.gc-kick', s), D.$('.gc-clock', s)].filter(Boolean), { opacity: 0, y: 20 });
    // camera longitude = sun longitude + offset (+ a blend-in from wherever the camera was)
    const sunLon = h => -15 * (h - 12);
    const H = { h: h0 }, B = { b: wrap180(G.view.lon - (sunLon(h0) + off)) };
    const apply = () => {
      G.sunLon = sunLon(H.h);
      G.lon = G.sunLon + off + B.b;
      const hh = ((Math.floor(H.h) % 24) + 24) % 24, mm = Math.floor((H.h - Math.floor(H.h)) * 60);
      clock.textContent = `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
    };
    G.view = { lon: sunLon(h1) + off, lat: o.lat ?? 16 };

    D.show(s, T);
    if (o.label) D.label(T, o.label);
    tl.set(G, { sunLat: decl }, T);
    tl.to(G, { cx: o.cx ?? 1340, cy: 540, r: o.r ?? 420, lat: o.lat ?? 16, grat: 0.35, duration: 1.3, ease: 'expo.inOut' }, T);
    tl.to(B, { b: 0, duration: 1.3, ease: 'power2.inOut', onUpdate: apply }, T);
    tl.to(H, { h: h1, duration: dur - 0.4, ease: 'none', onUpdate: apply }, T);
    tl.to(G, { sun: 1, duration: 0.9, ease: 'power2.inOut' }, T + 0.3);
    tl.to(G, { lights: 1, term: 1, duration: 1.2 }, T + 0.8);
    tl.to(copy.children[0], { opacity: 1, y: 0, duration: 0.7, ease: 'expo.out' }, T + 0.85);
    tl.to(sp.lines, { yPercent: 0, duration: 0.9, ease: 'expo.out', stagger: 0.12 }, T + 1.0);
    tl.to(D.$('.gc-clock', s), { opacity: 1, y: 0, duration: 0.7, ease: 'expo.out' }, T + 1.4);
    D.sfx('swell', T, 3, 0.14);
    D.sfx('whoosh', T, 1.1, 0.25);
    const hours = Math.round(h1 - h0);
    for (let k = 1; k <= hours; k++) D.sfx('tick', T + ((dur - 0.4) * k) / hours, k % 6 ? 0.025 : 0.06);
    D.sfx('bell', T + 0.8, D.N.E5, 0.05);
    tl.to(G, { sun: 0, lights: 0, term: 0, duration: 0.6 }, T + dur - 0.7);
    tl.to(sp.lines, { yPercent: -110, duration: 0.45, ease: 'expo.in', stagger: 0.05 }, T + dur - 0.7);
    tl.to([D.$('.gc-kick', s), D.$('.gc-clock', s)].filter(Boolean), { opacity: 0, duration: 0.4 }, T + dur - 0.6);
    D.hide(s, T + dur);
    return dur;
  });

  // ------------------------------------------------------------------ GLOBEPULSE
  // A real yearly series drives the globe: the counter and a thin line chart run
  // through the years while great-circle arcs fire at a rate proportional to the
  // value (the arcs are illustrative, their rate is the data). Notes pop as the
  // pen passes them.                                                          9.5 s
  recipe('globepulse', (D, T, o) => {
    const { tl, N } = D;
    const G = globe(D), dur = o.duration || 9.5, data = o.data, fmt = o.format || (v => nf(D).format(Math.round(v)));
    const cities = o.cities || [], y0 = data[0][0], y1 = data[data.length - 1][0], vmax = Math.max(...data.map(p => p[1]));
    const yMax = o.yMax ?? vmax, ticks = o.yTicks || [0, yMax / 2, yMax];
    const X0 = 1040, X1 = 1760, YB = 850, YT = 640;
    const xOf = y => X0 + ((y - y0) / (y1 - y0)) * (X1 - X0), yOf = v => YB - (v / yMax) * (YB - YT);
    const valueAt = y => { for (let i = 1; i < data.length; i++) if (data[i][0] >= y) { const u = (y - data[i - 1][0]) / (data[i][0] - data[i - 1][0]); return data[i - 1][1] + u * (data[i][1] - data[i - 1][1]); } return data[data.length - 1][1]; };
    const d = 'M' + data.map(([y, v]) => `${xOf(y).toFixed(1)},${yOf(v).toFixed(1)}`).join('L');
    const notes = (o.notes || []).map(nt => ({ ...nt, px: xOf(nt.x), py: yOf(valueAt(nt.x)) }));
    const tick = o.tickFormat || (v => nf(D).format(v));
    const s = D.scene('globepulse', `
      <div class="gp-panel">
        ${o.kicker ? `<div class="gp-kick mono">${o.kicker}</div>` : ''}
        <div class="gp-title">${o.title || ''}</div>
        <div class="gp-num v">${fmt(data[0][1])}</div>
        <div class="gp-unit mono">${o.unit || ''}</div>
        <div class="gp-year v">${y0}</div>
      </div>
      <svg class="gl-svg" viewBox="0 0 1920 1080" aria-hidden="true">
        <defs><clipPath id="gp-clip"><rect x="0" y="0" width="0" height="1080"/></clipPath></defs>
        ${ticks.map(v => `<line x1="${X0}" x2="${X1}" y1="${yOf(v)}" y2="${yOf(v)}" stroke="#ffffff" stroke-opacity="${v ? 0.1 : 0.3}" stroke-width="1.5"/>
          ${v ? `<text x="${X0}" y="${yOf(v) - 9}" class="gp-tick" fill="#ffffff" fill-opacity=".5">${tick(v)}</text>` : ''}`).join('')}
        ${[y0, y1].map(y => `<text x="${xOf(y)}" y="${YB + 34}" text-anchor="${y === y0 ? 'start' : 'end'}" class="gp-tick" fill="#ffffff" fill-opacity=".5">${y}</text>`).join('')}
        <path class="gp-line" d="${d}" fill="none" stroke="${o.color || G.col.arc}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round" clip-path="url(#gp-clip)"/>
        ${notes.map(nt => `<g class="gp-note-g"><circle cx="${nt.px}" cy="${nt.py}" r="6" fill="${o.color || G.col.arc}" stroke="${D.C.night}" stroke-width="3"/>
          <text x="${nt.px + (nt.dx ?? 0)}" y="${nt.py + (nt.dy ?? 40)}" text-anchor="${nt.anchor || 'middle'}" class="gp-note" fill="#ffffff">${nt.text}</text></g>`).join('')}
        <circle class="gp-tip" r="7" fill="${o.color || G.col.arc}" stroke="${D.C.night}" stroke-width="3" cx="${xOf(y0)}" cy="${yOf(data[0][1])}"/>
      </svg>
      ${o.source ? `<div class="gp-src mono">${o.source}</div>` : ''}`);
    const panel = D.$('.gp-panel', s), num = D.$('.gp-num', s), year = D.$('.gp-year', s), clipR = D.$('#gp-clip rect', s), tip = D.$('.gp-tip', s);
    const noteG = D.$$('.gp-note-g', s), svgEls = D.$$('.gl-svg > line, .gl-svg > text', s), src = D.$('.gp-src', s);
    gsap.set(panel.children, { opacity: 0, y: 24 });
    gsap.set([...svgEls, tip, src].filter(Boolean), { opacity: 0 });
    gsap.set(noteG, { opacity: 0 });
    const pins = cities.map(c => mkPin(G, c, { label: '', size: 0.55 }));

    D.show(s, T);
    if (o.label) D.label(T, o.label);
    tl.to(G, { cx: o.cx ?? 560, cy: 550, r: o.r ?? 380, lat: 22, grat: 0.4, duration: 1.3, ease: 'expo.inOut' }, T);
    G.view.lat = 22;
    spin(D, G, o.spin ?? 110, T, dur, 'power1.inOut');
    tl.to(panel.children, { opacity: 1, y: 0, duration: 0.8, ease: 'expo.out', stagger: 0.07 }, T + 0.8);
    tl.to([...svgEls, src].filter(Boolean), { opacity: 1, duration: 0.6 }, T + 1.0);
    tl.to(pins, { alpha: 0.75, duration: 0.6, stagger: 0.01 }, T + 0.5);
    D.sfx('whoosh', T, 1, 0.25);

    // the year runs; everything reads from Y
    const ts = T + 1.2, span = dur - 3.0, Y = { y: y0 };
    const paint = () => {
      const v = valueAt(Y.y), px = xOf(Y.y);
      num.textContent = fmt(v);
      year.textContent = String(Math.floor(Y.y + 1e-6));
      clipR.setAttribute('width', px + 4);
      tip.setAttribute('cx', px); tip.setAttribute('cy', yOf(v));
    };
    tl.set(tip, { opacity: 1 }, ts);
    tl.to(Y, { y: y1, duration: span, ease: 'none', onUpdate: paint }, ts);
    for (let k = 0; k < Math.floor(span / 0.5); k++) { D.sfx('kick', ts + k * 0.5, 0.4); D.sfx('hat', ts + 0.25 + k * 0.5, 0.06); }
    notes.forEach((nt, i) => {
      const at = ts + ((nt.x - y0) / (y1 - y0)) * span;
      D.hit(noteG[i], { opacity: 1, scale: 1.5, svgOrigin: `${nt.px} ${nt.py}` }, { scale: 1, duration: 0.5, ease: 'back.out(3)' }, at);
      D.sfx(nt.sfx || 'boom', at, 0.45);
    });
    // arcs: launch rate ∝ the series value at that moment (deterministic via D.rand)
    const rate = o.rate || 24, life = 1.4;
    let acc = 0.6, launched = 0;
    for (let t = 0; t < span; t += 0.04) {
      acc += (valueAt(y0 + (t / span) * (y1 - y0)) / vmax) * rate * 0.04;
      while (acc >= 1 && cities.length > 1) {
        acc -= 1;
        let a = Math.floor(D.rand() * cities.length), b = Math.floor(D.rand() * cities.length), guard = 0;
        while ((b === a || distKm(cities[a], cities[b]) < 1500) && guard++ < 20) b = Math.floor(D.rand() * cities.length);
        const arc = mkArc(G, cities[a], cities[b], { tail: 0.42, w: 2.1 }), at = ts + t;
        fly(D, arc, at, life * 0.72);
        tl.set(arc, { alpha: 0 }, at + life + 0.05);
        if (launched++ % 3 === 0) D.sfx('plip', at, 0.035, 700 + (launched % 5) * 140);
      }
    }
    D.sfx('bell', ts + span, N.A5, 0.07);
    D.sfx('boom', ts + span, 0.45);
    // out
    tl.to([...panel.children, ...svgEls, tip, src, ...noteG].filter(Boolean), { opacity: 0, duration: 0.4, ease: 'power2.in' }, T + dur - 0.55);
    tl.to(D.$('.gp-line', s), { opacity: 0, duration: 0.4 }, T + dur - 0.55);
    tl.to(pins, { alpha: 0, duration: 0.4 }, T + dur - 0.55);
    D.hide(s, T + dur);
    return dur;
  });

  // ------------------------------------------------------------------ GLOBETITLE
  // The globe fills the frame, then drops into the title as its "O"; the letters
  // rise around it, a rim closes the letterform, an orbit ring and a satellite
  // circle it. Falls back to a globe above the word if there is no O.         7 s
  recipe('globetitle', (D, T, o) => {
    const { tl, C, CX, CY } = D;
    const G = globe(D), dur = o.duration || 7, word = o.title || D.cfg.meta.title;
    const oi = o.oIndex ?? word.search(/[OÓ0]/i);
    const pre = oi >= 0 ? word.slice(0, oi) : word, post = oi >= 0 ? word.slice(oi + 1) : '';
    const s = D.scene('globetitle', `
      <div class="gt-word v c"><span class="gt-pre">${pre}</span>${oi >= 0 ? '<span class="gt-o"></span>' : ''}<span class="gt-post">${post}</span></div>
      <div class="gt-sub mono c"></div>`);
    const wEl = D.$('.gt-word', s), slot = D.$('.gt-o', s), sub = D.$('.gt-sub', s);
    // the real "O" of this font at a size: ink box (a circle as tall as the O) + its side bearings
    const mc = document.createElement('canvas').getContext('2d');
    const measure = fs => {
      mc.font = `900 ${fs}px "${D.cfg.fonts.display}"`;
      if (D.cfg.fonts.stretch && 'fontStretch' in mc) mc.fontStretch = 'expanded';
      const m = mc.measureText('O');
      return { asc: m.actualBoundingBoxAscent, desc: m.actualBoundingBoxDescent, ink: m.actualBoundingBoxLeft + m.actualBoundingBoxRight, adv: m.width };
    };
    const fs0 = parseFloat(getComputedStyle(wEl).fontSize), m0 = measure(fs0);
    if (slot) slot.style.width = (m0.asc + m0.desc + (m0.adv - m0.ink)) / fs0 + 'em';
    D.fit(wEl, o.maxWidth || 1560);
    const fs = parseFloat(getComputedStyle(wEl).fontSize), m1 = measure(fs);
    const tp = D.split(D.$('.gt-pre', s), { type: 'chars', mask: 'chars' }), tq = D.split(D.$('.gt-post', s), { type: 'chars', mask: 'chars' });
    gsap.set([...tp.chars, ...tq.chars], { yPercent: 115 });
    let target;
    if (slot) {
      const b = D.box(slot); // zero-height inline-block: its top is the baseline
      const rimW = Math.max(3, fs * (o.rim ?? 0.085));
      target = { cx: b.x + b.w / 2, cy: b.y - (m1.asc - m1.desc) / 2, r: (m1.asc + m1.desc) / 2 - rimW, rimW };
    } else {
      const b = D.box(wEl);
      target = { cx: CX, cy: b.y - 150, r: 110, rimW: 0 };
    }
    const ring = { alpha: 0, k: 1, tilt: 74, rot: -16, phase: 0.1, sat: 1, w: 2 };
    G.rings.push(ring);
    const burst = (o.cities || []).length > 1 ? Array.from({ length: 9 }, (_, i) => {
      const c = o.cities, a = c[Math.floor(D.rand() * c.length)];
      let b = c[Math.floor(D.rand() * c.length)], guard = 0;
      while ((b === a || distKm(a, b) < 2500) && guard++ < 20) b = c[Math.floor(D.rand() * c.length)];
      return mkArc(G, a, b, { tail: 0.45, w: 2.2 });
    }) : [];

    D.show(s, T);
    D.ink(C.paper, T);
    if (o.label) D.label(T + 0.2, o.label);
    tl.to(G, { cx: CX, cy: CY, r: 470, lat: 12, grat: 0.5, duration: 1.1, ease: 'expo.inOut' }, T);
    G.view.lat = 12;
    spin(D, G, o.spin ?? 240, T, dur - 0.2, 'power2.out');
    burst.forEach((a, i) => fly(D, a, T + 0.15 + i * 0.12, 0.9));
    D.sfx('riser', T, 2.4, 0.3);
    D.sfx('whoosh', T, 1.2, 0.3);
    // drop into the O
    const td = T + 1.5, dd = 1.1, ti = td + dd;
    tl.to(G, { cx: target.cx, cy: target.cy, r: target.r, grat: 0, duration: dd, ease: 'expo.inOut' }, td);
    tl.set(G, { rimW: target.rimW }, td);
    tl.to(G, { rim: 1, duration: 0.35, ease: 'power2.out' }, ti - 0.25);
    tl.to([...tp.chars].reverse(), { yPercent: 0, duration: 0.8, ease: 'expo.out', stagger: 0.05 }, ti - 0.2);
    tl.to(tq.chars, { yPercent: 0, duration: 0.8, ease: 'expo.out', stagger: 0.05 }, ti - 0.2);
    D.sfx('braam', ti, 0.75);
    D.sfx('boom', ti, 0.9);
    D.flash(ti, 0.3, 0.6);
    D.shake(ti, 0.45, 9);
    D.call(() => { SFX.padStop('globe', 2); SFX.pad('title', [110, 138.59, 164.81, 220], 1.2, 0.05, 900); }, ti);
    tl.to(ring, { alpha: 1, k: 1.55, duration: 1.2, ease: 'expo.out' }, ti + 0.1);
    tl.to(ring, { phase: 1.6, duration: dur - (ti - T) - 0.1, ease: 'none' }, ti + 0.1);
    if (o.subtitle) tl.to(sub, { duration: 1.3, scrambleText: { text: o.subtitle, chars: 'upperCase', speed: 0.6 }, ease: 'none' }, ti + 0.5);
    D.sfx('bell', ti + 0.5, D.N.E5, 0.06);
    // out: letters drop, the globe collapses to a point
    const to = T + dur - 0.9;
    tl.to([...tp.chars, ...tq.chars], { yPercent: -115, duration: 0.5, ease: 'expo.in', stagger: 0.02 }, to);
    tl.to(sub, { opacity: 0, duration: 0.3 }, to);
    tl.to(ring, { alpha: 0, k: 0.6, duration: 0.5, ease: 'power2.in' }, to);
    tl.to(G, { rim: 0, duration: 0.3 }, to);
    tl.to(G, { r: 0, duration: 0.6, ease: 'back.in(2)' }, to + 0.1);
    tl.set(G, { alpha: 0 }, T + dur);
    D.sfx('whoosh', to, 0.6, 0.2);
    D.hide(s, T + dur);
    return dur;
  });

  // ------------------------------------------------------------------ GLOBESHIP
  // Dive from the whole planet into one country (its dots light up with G.hl), then a
  // burst of great-circle arcs from a hub to every destination; a counter ticks per landing.
  recipe('globeship', (D, T, o) => {
    const { tl, C, N } = D;
    const G = globe(D), dur = o.duration || 7.5, from = o.from, to = o.to || [], v = o.view || { lon: from.lon, lat: from.lat };
    const s = D.scene('globeship', `
      <div class="gs-copy">
        ${o.kicker ? `<div class="gs-kick mono">${o.kicker}</div>` : ''}
        <div class="gs-title v">${o.title || ''}</div>
        <div class="gs-count"><b class="v">${o.startAt ?? 1}</b><span class="mono">${o.unit || ''}</span></div>
      </div>`);
    const num = D.$('.gs-count b', s), title = D.$('.gs-title', s), side = [D.$('.gs-kick', s), D.$('.gs-count', s)].filter(Boolean);
    const sp = D.split(title, { type: 'lines,words', mask: 'lines' });
    gsap.set(sp.lines, { yPercent: 110 });
    gsap.set(side, { opacity: 0, y: 20 });
    const hub = mkPin(G, from, { label: o.hubLabel ?? '', size: 1.3 });
    const pins = to.map(c => mkPin(G, c, { label: '', size: 0.8 }));
    const arcs = to.map(c => mkArc(G, from, c, { tail: 0.4, w: 2.2 }));

    D.show(s, T);
    D.setBg(o.bg || C.night, T);
    D.ink(C.paper, T);
    if (o.label) D.label(T, o.label);
    G.view = { lon: v.lon, lat: v.lat };
    tl.set(G, { alpha: 1, morph: 1, reveal: 1, cx: D.CX, cy: D.CY, r: 380, lon: v.lon + (o.spinIn ?? 40), lat: v.lat * 0.5, hl: 0, grat: 0.4, sun: 0, lights: 0, rim: 0, ocean: 1, atmo: 1 }, T);
    // the dive
    tl.to(G, { lon: v.lon, lat: v.lat, duration: 1.7, ease: 'power2.inOut' }, T + 0.05);
    tl.to(G, { r: o.r ?? 1450, cx: o.cx ?? 1250, cy: o.cy ?? D.CY, grat: 0.15, duration: 1.8, ease: 'expo.inOut' }, T + 0.25);
    tl.to(G, { hl: 1, duration: 0.9, ease: 'power2.inOut' }, T + 1.3);
    D.sfx('whoosh', T + 0.25, 1.5, 0.35);
    D.sfx('riser', T + 0.2, 1.8, 0.25);
    D.sfx('boom', T + 2.0, 0.5);
    tl.to(sp.lines, { yPercent: 0, duration: 0.9, ease: 'expo.out', stagger: 0.1 }, T + 1.2);
    tl.to(side, { opacity: 1, y: 0, duration: 0.7, ease: 'expo.out', stagger: 0.1 }, T + 1.0);
    // the burst
    tl.set(hub, { alpha: 1, la: 1, pulse: 0 }, T + 1.9);
    tl.to(hub, { pulse: 1, duration: 1, ease: 'power2.out' }, T + 1.9);
    const t0 = T + 2.1, gap = o.gap ?? 0.11, fl = o.flight ?? 0.75, C0 = { v: o.startAt ?? 1 };
    to.forEach((c, i) => {
      const land = fly(D, arcs[i], t0 + i * gap, fl, 1);
      tl.set(pins[i], { alpha: 1, pulse: 0 }, land - 0.02);
      tl.to(pins[i], { pulse: 1, duration: 0.8, ease: 'power2.out' }, land);
      tl.to(C0, { v: (o.startAt ?? 1) + i + 1, duration: 0.01, onUpdate: () => { num.textContent = String(Math.round(C0.v)); } }, land);
      if (i % 2 === 0) D.sfx('plip', land, 0.05, 700 + (i % 6) * 110);
    });
    const tEnd = t0 + (to.length - 1) * gap + fl;
    D.hit(num, { scale: 1.25 }, { scale: 1, duration: 0.5, ease: 'back.out(3)' }, tEnd);
    [N.C5, N.E5, N.G5].forEach(f => D.sfx('bell', tEnd, f, 0.06));
    // out: the canvas layer must be gone before a light scene follows
    tl.to(sp.lines, { yPercent: -110, duration: 0.45, ease: 'expo.in', stagger: 0.05 }, T + dur - 0.6);
    tl.to(side, { opacity: 0, duration: 0.3 }, T + dur - 0.5);
    tl.to([...arcs], { keep: 0, duration: 0.4 }, T + dur - 0.6);
    tl.to([hub, ...pins], { alpha: 0, la: 0, duration: 0.4 }, T + dur - 0.6);
    tl.to(G, { alpha: 0, duration: 0.4 }, T + dur - 0.45);
    D.hide(s, T + dur);
    return dur;
  });

  Trailer.geo = { globe, turn, spin, mkArc, mkPin, fly, dist: distKm, along, vec };
})();
