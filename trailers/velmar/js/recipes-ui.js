/* ============================================================================
   UI MODULE — product-film choreography with a real HTML/CSS interface.
   A dashboard (window chrome, sidebar, KPI cards, bar chart, list, theme toggle)
   built from `app` in the config, a fake cursor that moves on curved paths and
   clicks with ripples, human-rhythm typing, a modal flow with a progress bar,
   stacked notifications, layout moves (FLIP-style: a row slides in and pushes the
   others), a circular light → dark theme reveal, and an exploded 3D view.
   Everything is placed on the master timeline with set + to pairs, so it seeks.
   Values that depend on the finished film (its own length, scene count) are
   filled after sequencing: {dur} / {scenes} placeholders and `after(S)` hooks.
   Recipes: uiprompt, uibuild, uiflow, uinotify, uitheme, uiexplode, uititle.
   ========================================================================== */
(() => {
  'use strict';
  const { recipe } = Trailer;
  const WIN = { x: 260, y: 116, w: 1400, h: 740 };
  const THEMES = {
    light: { win: '#f8f9fc', side: '#f2f3f9', panel: '#ffffff', ink: '#12142a', ink2: '#474b66', muted: '#80859e', line: '#e3e5ef', chip: '#eceeff', accent: '#6366f1', good: '#12a150', hot: '#db2777', shadow: '0 40px 120px rgba(8,10,40,.42)' },
    dark: { win: '#0e1022', side: '#111429', panel: '#161a31', ink: '#eef0ff', ink2: '#b4b8d6', muted: '#7c81a3', line: '#262a48', chip: '#1f2445', accent: '#818cf8', good: '#34d399', hot: '#f472b6', shadow: '0 40px 120px rgba(0,0,0,.65)' },
  };
  const cur = { x: 1560, y: 960 }; // build-time cursor position, carried from scene to scene
  const later = [];                // fills that need the finished film (its length, scene count)
  Trailer.plugin({ done: D => { later.splice(0).forEach(f => f(D)); } });
  /** box-shadow in one fixed shape (colour x y blur spread [inset]) so GSAP can interpolate any two of them;
   *  pass every tweened shadow through this, start and end, with the same number of layers */
  const shadow = (...L) => L.map(([x, y, b, sp, c, inset]) => `${c} ${x}px ${y}px ${b}px ${sp}px${inset ? ' inset' : ''}`).join(', ');
  const SH = {
    cmd: shadow([0, 30, 80, 0, 'rgba(0, 0, 0, 0.5)'], [0, 1, 0, 0, 'rgba(255, 255, 255, 0.1)', 1]),
    win: shadow([0, 40, 120, 0, 'rgba(8, 10, 40, 0.42)'], [0, 1, 0, 0, 'rgba(255, 255, 255, 0)', 1]),
    btn: shadow([0, 6, 16, 0, 'rgba(99, 102, 241, 0.35)']),
    btnHover: shadow([0, 12, 28, 0, 'rgba(99, 102, 241, 0.55)']),
    btnGood: shadow([0, 8, 20, 0, 'rgba(18, 161, 80, 0.35)']),
    focus0: shadow([0, 0, 0, 0, 'rgba(99, 102, 241, 0)']),
    focus: shadow([0, 0, 0, 4, 'rgba(99, 102, 241, 0.18)']),
    flat: shadow([0, 0, 0, 0, 'rgba(0, 0, 0, 0)'], [0, 0, 0, 0, 'rgba(165, 180, 252, 0)']),
    lift: shadow([0, 30, 60, 0, 'rgba(0, 0, 0, 0.5)'], [0, 0, 0, 1, 'rgba(165, 180, 252, 0.45)']),
    win3d0: shadow([0, 40, 120, 0, 'rgba(0, 0, 0, 0.65)'], [0, 0, 0, 1, 'rgba(165, 180, 252, 0)']),
    win3d: shadow([0, 60, 140, 0, 'rgba(0, 0, 0, 0.7)'], [0, 0, 0, 1, 'rgba(165, 180, 252, 0.3)']),
    cta: shadow([0, 12, 34, 0, 'rgba(99, 102, 241, 0.5)']),
    ctaHover: shadow([0, 18, 50, 0, 'rgba(99, 102, 241, 0.7)']),
  };
  const self = D => ({ dur: Math.round(D.tl.duration()), scenes: (D.cfg.scenes || []).filter(s => s && !s.skip).length });

  // ------------------------------------------------------------------ SVG bits
  const ico = d => `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
  const ICONS = [
    ico('<rect x="3" y="3" width="6" height="6" rx="1.5"/><rect x="11" y="3" width="6" height="6" rx="1.5"/><rect x="3" y="11" width="6" height="6" rx="1.5"/><rect x="11" y="11" width="6" height="6" rx="1.5"/>'),
    ico('<rect x="2.5" y="4" width="15" height="12" rx="2"/><path d="M8.5 7.5v5l4-2.5z" fill="currentColor"/>'),
    ico('<path d="M4 5h12M4 10h12M4 15h8"/>'),
    ico('<path d="M10 2.5l6.5 3.75v7.5L10 17.5l-6.5-3.75v-7.5z"/><path d="M10 10l6.5-3.75M10 10v7.5M10 10L3.5 6.25"/>'),
    ico('<path d="M4 6h7M15 6h1M4 14h1M9 14h7"/><circle cx="13" cy="6" r="2"/><circle cx="7" cy="14" r="2"/>'),
  ];
  const SEARCH = ico('<circle cx="9" cy="9" r="5.5"/><path d="M13.2 13.2L17 17"/>');
  const SUN = ico('<circle cx="10" cy="10" r="3.4"/><path d="M10 2.5v1.8M10 15.7v1.8M2.5 10h1.8M15.7 10h1.8M4.7 4.7l1.3 1.3M14 14l1.3 1.3M4.7 15.3L6 14M14 6l1.3-1.3"/>');
  const MOON = ico('<path d="M15.5 12.5A6.5 6.5 0 017.5 4.5a6.5 6.5 0 108 8z"/>');
  const TOAST_ICONS = {
    check: ['#12a150', ico('<path d="M5 10.5l3.2 3.2L15 7"/>')],
    up: ['#6366f1', ico('<path d="M10 15V5M5.5 9.5L10 5l4.5 4.5"/>')],
    spark: ['#db2777', ico('<path d="M10 3l1.8 5.2L17 10l-5.2 1.8L10 17l-1.8-5.2L3 10l5.2-1.8z"/>')],
  };
  // KINETIC's trio (circle · square · triangle) on a dark tile
  const MARK = (a = ['#a5f3fc', '#6366f1', '#ec4899'], bg = '#0b0b12') => `<svg viewBox="0 0 40 40"><rect width="40" height="40" rx="10" fill="${bg}"/><circle cx="12.5" cy="14" r="5.5" fill="${a[0]}"/><rect x="21.5" y="8.5" width="11" height="11" rx="1.5" fill="${a[1]}"/><path d="M20 21.5l7 11.5H13z" fill="${a[2]}"/></svg>`;
  const CURSOR = '<svg viewBox="0 0 30 42" width="30" height="42"><path d="M3 3v29l7.3-6.8 5 11.6 5.1-2.1-5-11.4H25z" fill="#0b0b12" stroke="#fff" stroke-width="2.2" stroke-linejoin="round"/></svg>';

  // ------------------------------------------------------------------ THE APP
  const appCfg = (D, o) => ({ ...(D.cfg.app || {}), ...(o.app || {}) });
  const fillTpl = (str, S) => String(str).replace(/\{(\w+)\}/g, (m, k) => (k in S ? S[k] : m));
  const lateTpl = str => (/\{\w+\}/.test(String(str)) ? ` data-tpl="${String(str).replace(/"/g, '&quot;')}"` : '');

  /** The whole dashboard window as HTML. pub = the new item is in (list row, chart bar, KPI `after`). */
  function appHTML(A, o = {}) {
    const th = THEMES[o.theme || 'light'], pub = !!o.pub;
    const vars = Object.entries(th).map(([k, v]) => `--u-${k}:${v}`).join(';');
    const kpis = (A.kpis || []).map((k, i) => {
      const lateV = pub && typeof k.after === 'function';
      const v = pub && typeof k.after === 'number' ? k.after : k.value;
      return `<div class="ui-card ui-kpi"><div class="ui-kl">${k.label}</div><div class="ui-kv"${lateV ? ` data-kpi="${i}"` : ''}>${lateV ? '' : k.format(v)}</div><div class="ui-ks">${k.sub || ''}</div>${k.delta ? `<span class="ui-delta"${pub ? '' : ' style="opacity:0"'}>${k.delta}</span>` : ''}</div>`;
    }).join('');
    const C = A.chart || { data: [] }, max = C.max || Math.max(...C.data.map(d => d[1]));
    const bar = (lab, v, cls = '', style = '', late = false) => `<div class="ui-br ${cls}"${style}><span class="ui-bl">${lab}</span><span class="ui-bt"><i class="ui-bf"${late ? ' data-selfw' : ` style="width:${((v / max) * 100).toFixed(2)}%"`}></i></span><span class="ui-bv"${late ? ' data-selfv' : ''}>${late ? '' : C.format ? C.format(v) : v}</span></div>`;
    const bars = C.data.map(([l, v]) => bar(l, v)).join('') + (C.self ? bar(C.self, 0, 'is-self', pub ? '' : ' style="height:0;opacity:0"', true) : '');
    const L = A.list || { rows: [] };
    const row = (r, cls = '', style = '') => `<div class="ui-row ${cls}"${style}><span class="ui-thumb" style="background:linear-gradient(135deg,${(r.colors || ['#6366f1', '#a5f3fc']).join(',')})"></span><span class="ui-rtx"><b class="ui-rt">${r.title}</b><span class="ui-rm"${lateTpl(r.meta)}>${/\{\w+\}/.test(String(r.meta)) ? '' : r.meta}</span></span><span class="ui-pill ${r.hot ? 'is-new' : ''}">${r.pill || ''}</span></div>`;
    const rows = (L.self ? row({ ...L.self, hot: true }, 'is-self', pub ? '' : ' style="height:0;opacity:0"') : '') + L.rows.map(r => row(r)).join('');
    return `
      <div class="ui-win ${o.cls || ''}" style="${vars}">
        <div class="ui-bar"><i></i><i></i><i></i><span class="ui-bar-t">${A.window || A.name || ''}</span></div>
        <aside class="ui-side">
          <div class="ui-brand">${MARK()}<b>${A.name || ''}</b></div>
          <nav class="ui-nav">${(A.nav || []).map((n, i) => `<div class="ui-nav-i ${i === 0 ? 'is-on' : ''}">${ICONS[i % ICONS.length]}<span>${n}</span></div>`).join('')}</nav>
          <div class="ui-side-b"><div class="ui-toggle"><span class="ui-sun">${SUN}</span><span class="ui-moon">${MOON}</span><i class="ui-knob"${o.dark ? ' style="transform:translateX(38px)"' : ''}></i></div><div class="ui-user">${A.user || 'KS'}</div></div>
        </aside>
        <main class="ui-main">
          <header class="ui-top"><div class="ui-h1">${A.page || ''}</div><div class="ui-search">${SEARCH}<span>${A.search || 'Search…'}</span></div><button class="ui-btn ui-new"><span>＋</span>${A.button || 'New'}</button></header>
          <section class="ui-kpis">${kpis}</section>
          <section class="ui-grid">
            <div class="ui-card ui-chart"><div class="ui-ct">${C.title || ''}</div><div class="ui-cs">${C.sub || ''}</div><div class="ui-bars">${bars}</div></div>
            <div class="ui-card ui-list"><div class="ui-ct">${L.title || ''}</div><div class="ui-cs">${L.sub || ''}</div><div class="ui-rows">${rows}</div></div>
          </section>
        </main>
      </div>`;
  }
  /** Register the fills that need the finished film for one app instance. */
  function bindLate(root, A) {
    later.push(D => {
      const S = self(D), C = A.chart || {}, max = C.max || 1;
      root.querySelectorAll('[data-kpi]').forEach(el => { const k = A.kpis[+el.dataset.kpi]; el.textContent = k.format(k.after(S)); });
      root.querySelectorAll('[data-selfw]').forEach(el => { el.style.width = ((S.dur / max) * 100).toFixed(2) + '%'; });
      root.querySelectorAll('[data-selfv]').forEach(el => { el.textContent = C.format ? C.format(S.dur) : S.dur; });
      root.querySelectorAll('[data-tpl]').forEach(el => { el.textContent = fillTpl(el.dataset.tpl, S); });
    });
  }
  /** Scene skeleton: glow (or a custom backdrop), a camera wrapper holding the window(s) and the cursor. */
  function stage(D, name, inner, backdrop) {
    const s = D.scene(name, `${backdrop || '<div class="ui-glow"></div>'}<div class="ui-cam">${inner}</div>`);
    return { s, cam: D.$('.ui-cam', s) };
  }
  const center = (D, el, dx = 0, dy = 0) => { const b = D.box(el); return { x: b.x + b.w / 2 + dx, y: b.y + b.h / 2 + dy }; };

  // ------------------------------------------------------------------ CURSOR · TYPING · CAPTIONS
  function mkCursor(D, cam, T, from) {
    const { tl } = D;
    const el = document.createElement('div');
    el.className = 'ui-cursor';
    el.innerHTML = CURSOR;
    cam.appendChild(el);
    if (from) { cur.x = from.x; cur.y = from.y; }
    gsap.set(el, { x: cur.x, y: cur.y });
    tl.set(el, { x: cur.x, y: cur.y }, T);
    return {
      el,
      /** glide to p on a curved path (x and y use different eases); returns the arrival time */
      move(p, at, dur = 0.7) {
        tl.to(el, { x: p.x, duration: dur, ease: 'power2.inOut' }, at);
        tl.to(el, { y: p.y, duration: dur, ease: 'power3.inOut' }, at);
        cur.x = p.x; cur.y = p.y;
        return at + dur;
      },
      /** press + ripple (+ the target presses too) */
      click(at, target) {
        tl.to(el, { scale: 0.8, duration: 0.07, ease: 'power2.out', transformOrigin: '3px 3px' }, at);
        tl.to(el, { scale: 1, duration: 0.22, ease: 'back.out(3)' }, at + 0.07);
        const rp = document.createElement('i');
        rp.className = 'ui-ripple';
        cam.appendChild(rp);
        gsap.set(rp, { x: cur.x, y: cur.y, scale: 0, opacity: 0 });
        D.hit(rp, { scale: 0.15, opacity: 0.7 }, { scale: 1, opacity: 0, duration: 0.55, ease: 'power2.out' }, at);
        if (target) { tl.to(target, { scale: 0.95, duration: 0.07 }, at); tl.to(target, { scale: 1, duration: 0.3, ease: 'back.out(3)' }, at + 0.07); }
        D.sfx('key', at, 0.22);
        D.sfx('tick', at, 0.06);
      },
    };
  }
  /** Human typing: per-key jitter, longer after spaces, an optional typo that gets backspaced. */
  function typing(D, text, typo) {
    const st = [{ t: 0, s: '' }];
    let t = 0, s = '';
    const step = ch => 0.05 + D.rand() * 0.075 + (ch === ' ' ? 0.06 : 0);
    [...text].forEach((ch, i) => {
      if (typo && i === typo.at) { t += step('x'); s += typo.char; st.push({ t, s }); t += 0.28; s = s.slice(0, -1); st.push({ t, s, back: true }); t += 0.12; }
      t += step(ch); s += ch; st.push({ t, s });
    });
    return { st, total: t };
  }
  function typeInto(D, el, seq, at) {
    const P = { t: 0 };
    el.textContent = '';
    const paint = () => { let k = 0; while (k + 1 < seq.st.length && seq.st[k + 1].t <= P.t + 1e-6) k++; el.textContent = seq.st[k].s; };
    D.tl.to(P, { t: seq.total, duration: seq.total, ease: 'none', onUpdate: paint }, at);
    seq.st.slice(1).forEach(x => D.sfx('key', at + x.t, x.back ? 0.1 : 0.15));
    return at + seq.total;
  }
  function blink(D, el, from, to, period = 0.53) {
    let k = 0;
    for (let t = from; t < to - 0.01; t += period, k++) D.tl.set(el, { opacity: k % 2 ? 0 : 1 }, t);
    D.tl.set(el, { opacity: 1 }, to);
  }
  function count(D, el, from, to, at, dur, fmt) {
    const P = { v: from };
    el.textContent = fmt(from);
    D.tl.to(P, { v: to, duration: dur, ease: 'power3.out', onUpdate: () => { el.textContent = fmt(P.v); } }, at);
  }
  /** Caption under the window: words rise out of masks, drop at `out`. HTML; a bare <i> = serif italic accent. */
  function caption(D, s, html, at, out, accent, color) {
    if (!html) return;
    const el = document.createElement('div');
    el.className = 'ui-cap v';
    if (color) el.style.color = color;
    el.style.setProperty('--accent', accent || '#a5b4fc');
    el.innerHTML = html;
    s.appendChild(el);
    D.fit(el, 1500);
    gsap.set(el, { xPercent: -50 });
    const sp = D.split(el, { type: 'words', mask: 'words' });
    gsap.set(sp.words, { yPercent: 115 });
    D.tl.to(sp.words, { yPercent: 0, duration: 0.8, ease: 'expo.out', stagger: 0.06 }, at);
    D.tl.to(sp.words, { yPercent: -115, duration: 0.4, ease: 'expo.in', stagger: 0.02 }, out);
  }
  // ------------------------------------------------------------------ WARP · CAMERA · WHIP
  /** A facade of D where every time position after T and every duration is scaled by k:
   *  run an unchanged recipe faster (k < 1) or slower (k > 1). Numbers only: positions like
   *  '<' pass through untouched. Sound lengths are not scaled (they are voices, not motion). */
  function warp(D, T, k) {
    if (!k || k === 1) return D;
    const at = x => (typeof x === 'number' ? T + (x - T) * k : x);
    const sv = v => {
      if (!v || typeof v !== 'object' || Array.isArray(v)) return v;
      const o = { ...v };
      ['duration', 'delay', 'repeatDelay'].forEach(f => { if (typeof o[f] === 'number') o[f] *= k; });
      if (typeof o.stagger === 'number') o.stagger *= k;
      else if (o.stagger && typeof o.stagger === 'object') { o.stagger = { ...o.stagger }; ['each', 'amount'].forEach(f => { if (typeof o.stagger[f] === 'number') o.stagger[f] *= k; }); }
      if (Array.isArray(o.keyframes)) o.keyframes = o.keyframes.map(sv);
      return o;
    };
    const tl = D.tl;
    const W = Object.create(D);
    Object.defineProperty(W, '_globe', { get: () => D._globe, set: v => { D._globe = v; } });
    W.tl = {
      to: (t, v, pos) => tl.to(t, sv(v), at(pos)),
      set: (t, v, pos) => tl.set(t, v, at(pos)),
      fromTo: (t, a, b, pos) => tl.fromTo(t, a, sv(b), at(pos)),
      call: (f, a, pos) => tl.call(f, a, at(pos)),
      duration: () => tl.duration(), time: (...a) => tl.time(...a),
    };
    W.sfx = (name, pos, ...a) => D.sfx(name, at(pos), ...a);
    W.call = (f, pos) => D.call(f, at(pos));
    W.show = (el, pos) => D.show(el, at(pos));
    W.hide = (el, pos) => D.hide(el, at(pos));
    W.hit = (el, a, b, pos) => D.hit(el, a, sv(b), at(pos));
    W.setBg = (c, pos) => D.setBg(c, at(pos));
    W.ink = (c, pos) => D.ink(c, at(pos));
    W.label = (pos, text) => D.label(at(pos), text);
    W.flash = (pos, peak, dur = 0.6, c) => D.flash(at(pos), peak, dur * k, c);
    W.shake = (pos, dur = 0.5, amp, grow) => D.shake(at(pos), dur * k, amp, grow);
    W.barsTo = (h, pos, dur = 0.9, ease) => D.barsTo(h, at(pos), dur && dur * k, ease);
    W.wipeTo = (c, pos, dir, dur = 0.44) => D.wipeTo(c, at(pos), dir, dur * k);
    return W;
  }
  /** Keyframed camera on a scene's camera wrapper: spec = { focus: selector | origin: [x, y],
   *  persp, ease, keys: [{ t (0..1 of the scene), s, x, y, rx, ry, rz, ease }] }. Call it AFTER the
   *  recipe measured its targets (the wrapper starts at identity). */
  function camera(D, cam, T, dur, spec, scene) {
    if (!spec || !cam) return;
    const keys = spec.keys || [];
    let origin = spec.origin;
    if (!origin && spec.focus && scene) { const el = scene.querySelector(spec.focus); if (el) { const b = D.box(el); origin = [b.x + b.w / 2, b.y + b.h / 2]; } }
    origin = origin || [D.CX, D.CY];
    if (scene) { scene.style.perspective = (spec.persp || 2200) + 'px'; scene.style.perspectiveOrigin = `${origin[0]}px ${origin[1]}px`; }
    const P = k => ({ scale: k.s ?? 1, x: k.x ?? 0, y: k.y ?? 0, rotationX: k.rx ?? 0, rotationY: k.ry ?? 0, rotation: k.rz ?? 0 });
    gsap.set(cam, { transformOrigin: `${origin[0]}px ${origin[1]}px` });
    D.tl.set(cam, P(keys[0] || {}), T);
    for (let i = 1; i < keys.length; i++) {
      D.tl.to(cam, { ...P(keys[i]), duration: Math.max(0.01, (keys[i].t - keys[i - 1].t) * dur), ease: keys[i].ease || spec.ease || 'power2.inOut' }, T + keys[i - 1].t * dur);
    }
  }
  /** Whip-pan in/out with motion blur on a whole scene: o.whipIn / o.whipOut = 'left' | 'right'
   *  (the direction the frame travels). */
  function whip(D, el, T, dur, o) {
    const off = d => (d === 'left' ? -440 : 440);
    if (o.whipIn) { D.hit(el, { x: -off(o.whipIn), filter: 'blur(18px)' }, { x: 0, filter: 'blur(0px)', duration: 0.32, ease: 'power3.out' }, T); D.sfx('whoosh', T, 0.35, 0.18); }
    if (o.whipOut) D.tl.to(el, { x: off(o.whipOut), filter: 'blur(18px)', duration: 0.24, ease: 'power2.in' }, T + dur - 0.24);
  }

  // the parts of the dashboard, for choreography
  const parts = (D, w) => ({
    bar: D.$('.ui-bar', w), lights: D.$$('.ui-bar i', w), barT: D.$('.ui-bar-t', w), side: D.$('.ui-side', w),
    brand: D.$('.ui-brand', w), nav: D.$$('.ui-nav-i', w), sideB: D.$('.ui-side-b', w), top: D.$$('.ui-top > *', w),
    kpis: D.$$('.ui-kpi', w), kv: D.$$('.ui-kv', w), chart: D.$('.ui-chart', w), list: D.$('.ui-list', w),
    fills: D.$$('.ui-br:not(.is-self) .ui-bf', w), bvals: D.$$('.ui-br:not(.is-self) .ui-bv', w), rows: D.$$('.ui-row:not(.is-self)', w),
    newBtn: D.$('.ui-new', w), toggle: D.$('.ui-toggle', w), knob: D.$('.ui-knob', w),
  });

  // ------------------------------------------------------------------ UIPROMPT
  // A command bar types a request (with a human typo), Enter, and the bar expands
  // into the app window — the next scene (uibuild) starts on that empty frame.
  recipe('uiprompt', (D, T, o) => {
    const { tl, C } = D;
    const th = THEMES.light;
    const s = D.scene('uiprompt', `<div class="ui-glow"></div>
      ${o.kicker ? `<div class="ui-kick mono">${o.kicker}</div>` : ''}
      <div class="ui-cmd"><span class="ui-cmd-ic">${SEARCH}</span><span class="ui-cmd-t"><span class="ui-cmd-v"></span><i class="ui-cmd-caret"></i><span class="ui-cmd-ph">${o.placeholder || 'Search…'}</span></span><span class="ui-cmd-k mono">${o.enter || 'ENTER ⏎'}</span></div>`);
    const cmd = D.$('.ui-cmd', s), val = D.$('.ui-cmd-v', s), ph = D.$('.ui-cmd-ph', s), caret = D.$('.ui-cmd-caret', s), key = D.$('.ui-cmd-k', s), kick = D.$('.ui-kick', s);
    const seq = typing(D, o.text || 'Create a launch trailer', o.typo);
    const t0 = T + 1.2, tEnter = t0 + seq.total + 0.5, dur = o.duration || tEnter - T + 1.5;
    gsap.set(cmd, { opacity: 0, boxShadow: SH.cmd });
    if (kick) gsap.set(kick, { opacity: 0, y: 12 });

    D.show(s, T);
    D.setBg(C.night, T);
    D.ink(C.paper, T);
    tl.set(D.bars, { height: 540 }, T);
    D.barsTo(96, T + 0.05, 1.4);
    if (o.label) D.label(T + 0.5, o.label);
    D.call(() => SFX.pad('ui', [110, 164.81, 220, 277.18], 2.5, 0.045, 900), T + 0.02);
    D.hit(cmd, { opacity: 0, y: 30, scale: 0.94 }, { opacity: 1, y: 0, scale: 1, duration: 1, ease: 'expo.out' }, T + 0.35);
    if (kick) tl.to(kick, { opacity: 0.6, y: 0, duration: 0.8, ease: 'expo.out' }, T + 0.6);
    D.sfx('swell', T + 0.2, 1.6, 0.1);
    blink(D, caret, T + 0.4, t0);
    tl.set(ph, { display: 'none' }, t0);
    const tDone = typeInto(D, val, seq, t0);
    blink(D, caret, tDone + 0.05, tEnter);
    // Enter → the bar becomes the window
    tl.to(key, { scale: 0.88, backgroundColor: 'rgba(99,102,241,.9)', duration: 0.08 }, tEnter);
    tl.to(key, { scale: 1, duration: 0.25, ease: 'back.out(3)' }, tEnter + 0.08);
    D.sfx('key', tEnter, 0.3);
    D.sfx('whoosh', tEnter + 0.1, 0.9, 0.3);
    D.sfx('boom', tEnter + 1.0, 0.35);
    tl.to([...cmd.children], { opacity: 0, duration: 0.18 }, tEnter + 0.14);
    if (kick) tl.to(kick, { opacity: 0, duration: 0.3 }, tEnter);
    tl.to(cmd, {
      left: WIN.x, top: WIN.y, width: WIN.w, height: WIN.h, borderRadius: 18, backgroundColor: th.win, borderColor: 'rgba(255,255,255,0)',
      boxShadow: SH.win, duration: 1.05, ease: 'expo.inOut',
    }, tEnter + 0.16);
    D.hide(s, T + dur);
    return dur;
  });

  // ------------------------------------------------------------------ UIBUILD
  // The dashboard assembles itself on the beat: chrome, sidebar, header, KPI cards
  // counting up, bars growing, rows sliding in. The cursor arrives at the end.   9 s
  recipe('uibuild', (D, T, o) => {
    const { tl, N } = D;
    const A = appCfg(D, o), dur = o.duration || 9;
    const { s, cam } = stage(D, 'uibuild', appHTML(A, { theme: 'light' }), o.backdrop);
    const w = D.$('.ui-win', s), p = parts(D, w);
    const rest = center(D, p.newBtn, 70, 120);
    gsap.set([p.bar, p.barT], { opacity: 0 });
    gsap.set(p.lights, { scale: 0 });
    gsap.set(p.side, { opacity: 0, x: -30 });
    gsap.set([p.brand, ...p.nav, p.sideB], { opacity: 0, x: -16 });
    gsap.set(p.top, { opacity: 0, y: 14 });
    gsap.set([...p.kpis, p.chart, p.list], { opacity: 0, y: 30, scale: 0.97 });
    gsap.set(p.fills, { scaleX: 0, transformOrigin: '0% 50%' });
    gsap.set(p.bvals, { opacity: 0 });
    gsap.set(p.rows, { opacity: 0, x: 24 });

    D.show(s, T);
    if (o.bg) D.setBg(o.bg, T);
    if (o.label) D.label(T, o.label);
    tl.to(p.bar, { opacity: 1, duration: 0.3 }, T + 0.05);
    tl.to(p.lights, { scale: 1, duration: 0.4, ease: 'back.out(3)', stagger: 0.07 }, T + 0.1);
    tl.to(p.barT, { opacity: 1, duration: 0.4 }, T + 0.3);
    tl.to(p.side, { opacity: 1, x: 0, duration: 0.8, ease: 'expo.out' }, T + 0.35);
    tl.to([p.brand, ...p.nav, p.sideB], { opacity: 1, x: 0, duration: 0.6, ease: 'expo.out', stagger: 0.06 }, T + 0.55);
    tl.to(p.top, { opacity: 1, y: 0, duration: 0.7, ease: 'expo.out', stagger: 0.08 }, T + 0.8);
    tl.to(p.kpis, { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'expo.out', stagger: 0.1 }, T + 1.15);
    (A.kpis || []).forEach((k, i) => count(D, p.kv[i], 0, k.value, T + 1.35 + i * 0.1, 1.5, k.format));
    tl.to(p.chart, { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'expo.out' }, T + 1.7);
    tl.to(p.list, { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'expo.out' }, T + 1.85);
    p.fills.forEach((f, i) => {
      const at = T + 2.05 + i * 0.07;
      tl.to(f, { scaleX: 1, duration: 0.7, ease: 'expo.out' }, at);
      tl.to(p.bvals[i], { opacity: 1, duration: 0.3 }, at + 0.35);
      if (i % 2 === 0) D.sfx('tick', at, 0.04);
    });
    tl.to(p.rows, { opacity: 1, x: 0, duration: 0.6, ease: 'expo.out', stagger: 0.08 }, T + 2.3);
    for (let k = 0; k < 14; k++) { D.sfx('kick', T + 0.35 + k * 0.5, 0.4); D.sfx('hat', T + 0.6 + k * 0.5, 0.05); }
    D.sfx('bell', T + 2.9, N.E5, 0.05);
    caption(D, s, o.caption, T + 2.9, T + dur - 0.55, o.accent, o.captionColor);
    // the cursor walks in and waits near the primary button
    const c = mkCursor(D, cam, T, { x: 1740, y: 1010 });
    gsap.set(c.el, { opacity: 0 });
    tl.to(c.el, { opacity: 1, duration: 0.3 }, T + dur - 2.4);
    c.move(rest, T + dur - 2.4, 1.1);
    camera(D, cam, T, dur, o.camera, s);
    whip(D, s, T, dur, o);
    D.hide(s, T + dur);
    return dur;
  });

  // ------------------------------------------------------------------ UIFLOW
  // One scripted task: click the primary button, a modal opens (the camera leans
  // in), type a name, pick a chip, flip a switch, render with a progress bar.
  recipe('uiflow', (D, T, o) => {
    const { tl, N } = D;
    const A = appCfg(D, o), M = o.modal || {}, chips = M.chips || ['A', 'B', 'C'];
    const { s, cam } = stage(D, 'uiflow', appHTML(A, { theme: 'light' }));
    const w = D.$('.ui-win', s), p = parts(D, w);
    w.insertAdjacentHTML('beforeend', `
      <div class="ui-veil"></div>
      <div class="ui-modal">
        <div class="ui-mh">${M.title || 'New'}</div>
        <div class="ui-msub">${M.sub || ''}</div>
        <div class="ui-lab">${M.nameLabel || 'Name'}</div>
        <div class="ui-in"><span class="ui-in-v"></span><i class="ui-in-caret"></i></div>
        <div class="ui-lab">${M.chipsLabel || 'Template'}</div>
        <div class="ui-chips">${chips.map(c => `<span class="ui-chip">${c}</span>`).join('')}</div>
        <div class="ui-mrow"><span>${M.switchLabel || 'Sound'}</span><span class="ui-sw"><i></i></span></div>
        <div class="ui-mfoot">
          <div class="ui-prog"><div class="ui-prog-t mono"><span class="ui-prog-l"></span><span class="ui-prog-p">0 %</span></div><div class="ui-prog-b"><i></i></div></div>
          <button class="ui-btn ui-go"><span class="ui-go-a">${M.go || 'Render'}</span><span class="ui-go-b">${M.done || 'Done'} ✓</span></button>
        </div>
      </div>`);
    const veil = D.$('.ui-veil', w), modal = D.$('.ui-modal', w), input = D.$('.ui-in', w), inV = D.$('.ui-in-v', w), inC = D.$('.ui-in-caret', w);
    const chipEls = D.$$('.ui-chip', w), sw = D.$('.ui-sw', w), swK = D.$('.ui-sw i', w), go = D.$('.ui-go', w), goA = D.$('.ui-go-a', w), goB = D.$('.ui-go-b', w);
    const progL = D.$('.ui-prog-l', w), progP = D.$('.ui-prog-p', w), progB = D.$('.ui-prog-b i', w), prog = D.$('.ui-prog', w);
    // measure every target in the final layout, before anything is hidden
    const P = { btn: center(D, p.newBtn), inp: center(D, input, -60, 4), chip: center(D, chipEls[M.pick || 0]), sw: center(D, sw), go: center(D, go), mc: center(D, modal) };
    gsap.set(cam, { transformOrigin: `${P.mc.x}px ${P.mc.y}px` });
    gsap.set(veil, { opacity: 0 });
    gsap.set(modal, { opacity: 0, y: 26, scale: 0.96 });
    gsap.set([prog, goB], { opacity: 0 });
    gsap.set(progB, { scaleX: 0, transformOrigin: '0% 50%' });
    gsap.set(inC, { opacity: 0 });
    gsap.set([p.newBtn, go], { boxShadow: SH.btn });
    gsap.set(input, { boxShadow: SH.focus0 });

    D.show(s, T);
    if (o.label) D.label(T, o.label);
    const c = mkCursor(D, cam, T);
    // 1 · the primary button
    let t = c.move(P.btn, T + 0.25, 0.8);
    tl.to(p.newBtn, { y: -2, boxShadow: SH.btnHover, duration: 0.2 }, t - 0.15);
    c.click(t + 0.12, p.newBtn);
    // 2 · the modal, and the camera leans in
    const tm = t + 0.25;
    tl.to(veil, { opacity: 1, duration: 0.35 }, tm);
    tl.to(modal, { opacity: 1, y: 0, scale: 1, duration: 0.55, ease: 'expo.out' }, tm);
    tl.to(cam, { scale: o.zoom || 1.1, duration: 1.1, ease: 'power2.inOut' }, tm);
    D.sfx('whoosh', tm, 0.6, 0.15);
    // 3 · name
    t = c.move(P.inp, tm + 0.55, 0.6);
    c.click(t + 0.05, input);
    tl.to(input, { borderColor: THEMES.light.accent, boxShadow: SH.focus, duration: 0.2 }, t + 0.05);
    const seq = typing(D, M.name || 'LAUNCH', null);
    tl.set(inC, { opacity: 1 }, t + 0.1);
    const tTyped = typeInto(D, inV, seq, t + 0.2);
    blink(D, inC, tTyped, tTyped + 1.4);
    // 4 · chip
    t = c.move(P.chip, tTyped + 0.15, 0.55);
    c.click(t + 0.05, chipEls[M.pick || 0]);
    tl.to(chipEls[M.pick || 0], { backgroundColor: THEMES.light.accent, color: '#ffffff', borderColor: THEMES.light.accent, duration: 0.2 }, t + 0.08);
    // 5 · switch
    t = c.move(P.sw, t + 0.3, 0.45);
    c.click(t + 0.05, sw);
    tl.to(sw, { backgroundColor: THEMES.light.accent, duration: 0.2 }, t + 0.08);
    tl.to(swK, { x: 18, duration: 0.25, ease: 'back.out(2)' }, t + 0.08);
    tl.set(inC, { opacity: 0 }, t);
    // 6 · render
    t = c.move(P.go, t + 0.3, 0.5);
    c.click(t + 0.05, go);
    const tp = t + 0.2, pd = o.renderTime || 1.9;
    tl.to(prog, { opacity: 1, duration: 0.25 }, tp);
    const scenes = (D.cfg.scenes || []).filter(x => x && !x.skip).length, PR = { v: 0 };
    const paint = () => { progP.textContent = `${Math.round(PR.v * 100)} %`; progL.textContent = `${M.progress || 'Scene'} ${Math.max(1, Math.ceil(PR.v * scenes))}/${scenes}`; };
    paint();
    tl.to(PR, { v: 1, duration: pd, ease: 'power1.inOut', onUpdate: paint }, tp);
    tl.to(progB, { scaleX: 1, duration: pd, ease: 'power1.inOut' }, tp);
    for (let k = 0; k < scenes; k++) D.sfx('tick', tp + ((k + 1) / scenes) * pd, 0.05);
    tl.to(goA, { opacity: 0, duration: 0.15 }, tp + pd);
    tl.to(goB, { opacity: 1, duration: 0.2 }, tp + pd + 0.05);
    tl.to(go, { backgroundColor: THEMES.light.good, boxShadow: SH.btnGood, duration: 0.25 }, tp + pd);
    D.sfx('bell', tp + pd, N.A5, 0.07);
    D.sfx('bell', tp + pd + 0.08, N.E5, 0.05);
    // 7 · close, lean back out
    const tc = tp + pd + 0.55;
    tl.to(modal, { scale: 0.94, y: 10, duration: 0.2, ease: 'power2.in' }, tc);
    tl.to(modal, { opacity: 0, duration: 0.14, ease: 'power1.in' }, tc + 0.06);
    tl.to(veil, { opacity: 0, duration: 0.35 }, tc + 0.1);
    tl.to(cam, { scale: 1, duration: 0.9, ease: 'power2.inOut' }, tc);
    tl.to(p.newBtn, { y: 0, boxShadow: SH.btn, duration: 0.3 }, tc);
    c.move(o.restAt || { x: 400, y: 640 }, tc + 0.1, 0.9); // an empty spot in the sidebar: never over data
    const dur = o.duration || tc + 1.2 - T;
    caption(D, s, o.caption, tm + 0.4, T + dur - 0.5, o.accent);
    D.hide(s, T + dur);
    return dur;
  });

  // ------------------------------------------------------------------ UINOTIFY
  // The result lands: toasts stack in (newest on top), the new row slides into the
  // list and pushes the others down, a KPI ticks up, a new bar grows.        6.5 s
  recipe('uinotify', (D, T, o) => {
    const { tl, N } = D;
    const A = appCfg(D, o), dur = o.duration || 6.5, toasts = o.toasts || [];
    const { s, cam } = stage(D, 'uinotify', appHTML(A, { theme: 'light' }));
    const w = D.$('.ui-win', s), p = parts(D, w);
    w.insertAdjacentHTML('beforeend', `<div class="ui-toasts">${toasts.map(x => {
      const [bg, svg] = TOAST_ICONS[x.icon || 'check'];
      return `<div class="ui-toast"><span class="ui-ti" style="background:${bg}">${svg}</span><span><b>${x.title}</b><span${lateTpl(x.sub)}>${/\{\w+\}/.test(String(x.sub)) ? '' : x.sub || ''}</span></span></div>`;
    }).join('')}</div>`);
    bindLate(w, A);
    const tEls = D.$$('.ui-toast', w), selfRow = D.$('.ui-row.is-self', w), selfBar = D.$('.ui-br.is-self', w), selfFill = D.$('.ui-br.is-self .ui-bf', w), selfV = D.$('.ui-br.is-self .ui-bv', w);
    const deltas = D.$$('.ui-delta', w);
    gsap.set(tEls, { opacity: 0, x: 60 });
    gsap.set(selfFill, { scaleX: 0, transformOrigin: '0% 50%' });
    gsap.set(selfV, { opacity: 0 });

    D.show(s, T);
    if (o.label) D.label(T, o.label);
    const c = mkCursor(D, cam, T);
    c.move({ x: cur.x - 40, y: cur.y + 30 }, T + 0.3, 2.5);
    // toasts: newest on top, older ones step down
    const step = 82;
    tEls.forEach((el, i) => {
      const at = T + 0.35 + i * 0.95;
      D.hit(el, { opacity: 0, x: 60, y: 0 }, { opacity: 1, x: 0, duration: 0.6, ease: 'expo.out' }, at);
      for (let j = 0; j < i; j++) tl.to(tEls[j], { y: (i - j) * step, duration: 0.5, ease: 'expo.out' }, at);
      D.sfx('bell', at, [N.E5, N.A5, N.C6][i % 3], 0.06);
      D.sfx('plip', at, 0.05, 900);
    });
    // the new row pushes the list down; the new bar opens and grows
    const tr = T + 0.8;
    if (selfRow) {
      tl.to(selfRow, { height: 56, opacity: 1, duration: 0.7, ease: 'expo.inOut' }, tr);
      D.hit(selfRow, { backgroundColor: 'rgba(219,39,119,.16)' }, { backgroundColor: 'rgba(219,39,119,0)', duration: 1.8, ease: 'power2.out' }, tr + 0.5);
      D.sfx('whoosh', tr, 0.6, 0.1);
    }
    if (selfBar) {
      tl.to(selfBar, { height: 28, opacity: 1, duration: 0.5, ease: 'expo.inOut' }, tr + 0.9);
      tl.to(selfFill, { scaleX: 1, duration: 0.9, ease: 'expo.out' }, tr + 1.3);
      tl.to(selfV, { opacity: 1, duration: 0.3 }, tr + 1.7);
      D.sfx('tick', tr + 1.3, 0.06);
    }
    // KPIs: numeric `after` counts now, function `after(S)` counts once the film length is known
    (A.kpis || []).forEach((k, i) => {
      if (k.after == null) return;
      const at = tr + 0.5 + i * 0.15;
      if (typeof k.after === 'number') count(D, p.kv[i], k.value, k.after, at, 0.9, k.format);
      else later.push(() => { const S = self(D); count(D, p.kv[i], k.value, k.after(S), at, 0.9, k.format); });
      tl.to(p.kpis[i], { y: -4, duration: 0.2, ease: 'power2.out' }, at);
      tl.to(p.kpis[i], { y: 0, duration: 0.5, ease: 'back.out(3)' }, at + 0.2);
    });
    deltas.forEach(d => D.hit(d, { opacity: 0, scale: 0.4 }, { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(3)' }, tr + 0.6));
    caption(D, s, o.caption, T + 1.2, T + dur - 0.55, o.accent);
    tl.to(tEls, { opacity: 0, x: 40, duration: 0.4, ease: 'power2.in', stagger: 0.05 }, T + dur - 0.8);
    D.hide(s, T + dur);
    return dur;
  });

  // ------------------------------------------------------------------ UITHEME
  // Click the theme toggle: the dark interface opens as a circle from the toggle.   5 s
  recipe('uitheme', (D, T, o) => {
    const { tl } = D;
    const A = appCfg(D, o), dur = o.duration || 5;
    const { s, cam } = stage(D, 'uitheme', appHTML(A, { theme: 'light', pub: true }) + appHTML(A, { theme: 'dark', pub: true, dark: true }));
    const [wl, wd] = D.$$('.ui-win', s);
    bindLate(wl, A); bindLate(wd, A);
    const pl = parts(D, wl), tg = center(D, pl.toggle), wb = D.box(wl);
    const ox = tg.x - wb.x, oy = tg.y - wb.y;
    gsap.set(wd, { clipPath: `circle(0px at ${ox}px ${oy}px)` });

    D.show(s, T);
    if (o.label) D.label(T, o.label);
    const c = mkCursor(D, cam, T);
    const t = c.move(tg, T + 0.25, 0.9);
    c.click(t + 0.1, pl.toggle);
    tl.to(pl.knob, { x: 38, duration: 0.3, ease: 'back.out(2)' }, t + 0.12);
    const tr = t + 0.3;
    tl.to(wd, { clipPath: `circle(${Math.hypot(WIN.w, WIN.h) + 80}px at ${ox}px ${oy}px)`, duration: 1.25, ease: 'power2.inOut' }, tr);
    D.sfx('whoosh', tr, 1.2, 0.3);
    D.sfx('swell', tr, 1.6, 0.12);
    D.sfx('bass', tr + 1.1, 41.2, 0.3);
    caption(D, s, o.caption, tr + 0.5, T + dur - 0.5, o.accent);
    c.move({ x: tg.x + 320, y: tg.y - 140 }, tr + 0.6, 1.4);
    D.hide(s, T + dur);
    return dur;
  });

  // ------------------------------------------------------------------ UIEXPLODE
  // The dark app tilts into 3D and separates into its layers (CSS 3D), drifts,
  // then folds away into a point: the hand-off to the title.              6.5 s
  recipe('uiexplode', (D, T, o) => {
    const { tl } = D;
    const A = appCfg(D, o), dur = o.duration || 6.5;
    const { s, cam } = stage(D, 'uiexplode', appHTML(A, { theme: o.theme || 'dark', pub: true, dark: true, cls: 'is-3d' }));
    const w = D.$('.ui-win', s), p = parts(D, w);
    bindLate(w, A);
    cam.style.perspective = '2600px';
    cam.style.perspectiveOrigin = '50% 42%';
    // the far layers (top of the window) rise the most, so the near ones never hide them
    const layers = [[p.side, 60], [p.chart, 110], [p.list, 130], ...p.kpis.map((k, i) => [k, 170 + i * 10]), [D.$('.ui-top', w), 230], [p.bar, 260]];
    gsap.set(layers.map(l => l[0]), { boxShadow: SH.flat });
    gsap.set(w, { boxShadow: SH.win3d0 });

    D.show(s, T);
    if (o.label) D.label(T, o.label);
    const t0 = T + 0.25, d0 = 1.9;
    tl.to(w, { rotationX: 50, rotationZ: -30, scale: 0.68, y: 72, boxShadow: SH.win3d, duration: d0, ease: 'power3.inOut' }, t0);
    layers.forEach(([el, z], i) => tl.to(el, { z, boxShadow: SH.lift, duration: 1.4, ease: 'expo.inOut' }, t0 + 0.45 + i * 0.05));
    tl.to(w, { rotationZ: -24, duration: dur - d0 - 1.4, ease: 'sine.inOut' }, t0 + d0);
    D.sfx('riser', t0, d0, 0.22);
    D.sfx('boom', t0 + d0, 0.45);
    for (let k = 0; k < layers.length; k++) D.sfx('tick', t0 + 0.45 + k * 0.05 + 0.6, 0.03);
    caption(D, s, o.caption, t0 + 1.2, T + dur - 1.3, o.accent);
    // fold away
    const tf = T + dur - 1.05;
    layers.forEach(([el]) => tl.to(el, { z: 0, duration: 0.5, ease: 'power2.in' }, tf));
    tl.to(w, { rotationX: 0, rotationZ: 0, scale: 0.08, y: -80, opacity: 0, duration: 1.0, ease: 'expo.in' }, tf);
    D.sfx('whoosh', tf, 0.9, 0.3);
    D.hide(s, T + dur);
    return dur;
  });

  // ------------------------------------------------------------------ UITITLE
  // App icon + wordmark + tagline + a call-to-action button the cursor clicks.   6 s
  recipe('uititle', (D, T, o) => {
    const { tl, C, N } = D;
    const dur = o.duration || 6;
    const { s, cam } = stage(D, 'uititle', `
      <div class="ui-icon c">${MARK(o.mark || ['#e0f2fe', '#ffffff', '#fbcfe8'], 'transparent')}</div>
      <div class="ui-word v c">${o.title || D.cfg.meta.title}</div>
      <div class="ui-tag mono c"></div>
      <div class="ui-cta c"><span>${o.cta || 'Open'}</span><i>→</i></div>`);
    const icon = D.$('.ui-icon', s), word = D.$('.ui-word', s), tag = D.$('.ui-tag', s), cta = D.$('.ui-cta', s), arrow = D.$('.ui-cta i', s);
    D.fit(word, 1560);
    const ch = D.split(word, { type: 'chars', mask: 'chars' });
    gsap.set(ch.chars, { yPercent: 115 });
    const target = center(D, cta, 10, 4);
    gsap.set(icon, { scale: 0.2, opacity: 0 });
    gsap.set(cta, { scale: 0.6, opacity: 0, boxShadow: SH.cta });

    D.show(s, T);
    D.ink(C.paper, T);
    if (o.label) D.label(T + 0.1, o.label);
    tl.to(icon, { scale: 1, opacity: 1, duration: 1.0, ease: 'back.out(1.6)' }, T + 0.05);
    D.flash(T + 0.1, 0.16, 0.6, '#c7d2fe');
    D.sfx('boom', T + 0.1, 0.8);
    D.sfx('braam', T + 0.1, 0.55);
    D.call(() => { SFX.padStop('ui', 1.5); SFX.pad('title', [110, 138.59, 164.81, 220], 1.2, 0.05, 900); }, T + 0.1);
    tl.to(ch.chars, { yPercent: 0, duration: 0.9, ease: 'expo.out', stagger: 0.035 }, T + 0.55);
    if (o.tagline) tl.to(tag, { duration: 1.2, scrambleText: { text: o.tagline, chars: 'upperCase', speed: 0.6 }, ease: 'none' }, T + 1.2);
    tl.to(cta, { scale: 1, opacity: 1, duration: 0.7, ease: 'back.out(2)' }, T + 1.8);
    D.sfx('bell', T + 1.8, N.E5, 0.06);
    // the cursor comes for the button
    const c = mkCursor(D, cam, T, { x: 1560, y: 1000 });
    gsap.set(c.el, { opacity: 0 });
    tl.to(c.el, { opacity: 1, duration: 0.3 }, T + 2.3);
    const t = c.move(target, T + 2.3, 1.0);
    tl.to(cta, { scale: 1.04, boxShadow: SH.ctaHover, duration: 0.25 }, t - 0.2);
    tl.to(arrow, { x: 6, duration: 0.25 }, t - 0.2);
    c.click(t + 0.15, cta);
    D.flash(t + 0.2, 0.12, 0.5, '#c7d2fe');
    D.sfx('bell', t + 0.2, N.A5, 0.07);
    // out
    const to = T + dur - 0.8;
    tl.to([icon, cta, tag, c.el], { opacity: 0, duration: 0.5, ease: 'power2.in' }, to);
    tl.to(ch.chars, { yPercent: -115, duration: 0.5, ease: 'expo.in', stagger: 0.015 }, to);
    D.hide(s, T + dur);
    return dur;
  });

  Trailer.ui = { THEMES, WIN, appHTML, mkCursor, typing, typeInto, blink, count, caption, MARK, warp, camera, whip };
})();
