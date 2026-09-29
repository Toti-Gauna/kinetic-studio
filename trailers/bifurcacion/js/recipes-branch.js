/* ============================================================================
   BRANCH MODULE — a film that forks. Built for BIFURCACIÓN (engine branches + interactive.js).
   A commit line (the hub's trailers), a fork with two clickable options ([data-choose]), two worlds
   of parallax layers ([data-depth]: the pointer moves the camera in interactive mode, D.cam is
   scripted for linear playback and exports), a morph, a scrub, a merge and the title.
   Text that depends on the path or the mode: .if-a / .if-b ([data-path]), .if-ix / .if-lin.
   Recipes: brline, brfork, brworld, brmorph, brscrub, brmerge, brtitle.
   ========================================================================== */
(() => {
  'use strict';
  const { recipe } = Trailer;
  const Y = 640, X0 = 150, X1 = 1050, FORK = 1100;
  const nf = (D, d = 0) => new Intl.NumberFormat(D.cfg.locale || 'es-AR', { minimumFractionDigits: d, maximumFractionDigits: d });
  const from = v => ({ opacity: 0, y: 40, ...v }); // fresh vars on every call (tl.set mutates them)
  const enter = (D, els, at, st = 0.08) => { gsap.set(els, from()); D.hit(els, from(), { opacity: 1, y: 0, duration: 0.6, ease: 'expo.out', stagger: st }, at); };
  /** a local seeded generator: a scene looks the same whichever branches were built before it */
  const rng = seed => () => { seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const mix = (a, b, k) => { const p = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)); const x = p(a), y = p(b); return '#' + x.map((v, i) => Math.round(v + (y[i] - v) * k).toString(16).padStart(2, '0')).join(''); };
  const commits = n => Array.from({ length: n }, (_, i) => X0 + (n > 1 ? (i * (X1 - X0)) / (n - 1) : 0));
  const graph = (n, extra = '') => `<svg class="br-g" viewBox="0 0 1920 1080"><path class="br-main" d="M${X0 - 90} ${Y} L${FORK} ${Y}"/>${commits(n).map(x => `<circle class="br-c" cx="${x.toFixed(1)}" cy="${Y}" r="9"/>`).join('')}${extra}</svg>`;

  // ------------------------------------------------------------------ BRLINE
  // Every trailer of the hub as a commit on one straight line; then "not this one".
  recipe('brline', (D, T, o) => {
    const { tl } = D;
    const dur = o.duration || 6, names = o.commits || [], xs = commits(names.length);
    const s = D.scene('brline', `<div class="br-line">
      <div class="br-head"><div class="br-k mono">${o.kicker || ''}</div><div class="br-t br-t1">${o.lines[0]}</div><div class="br-t br-t2">${o.lines[1]}</div></div>
      ${graph(names.length)}
      ${names.map((nm, i) => `<span class="br-cl mono" style="left:${xs[i].toFixed(1)}px;top:${Y - 30}px">${nm}</span>`).join('')}
    </div>`);
    const main = D.$('.br-main', s), cs = D.$$('.br-c', s), labels = D.$$('.br-cl', s), t1 = D.$('.br-t1', s), t2 = D.$('.br-t2', s), k = D.$('.br-k', s);
    D.show(s, T);
    D.setBg('#0e0e10', T);
    D.ink('#f4f4f5', T);
    if (o.label) D.label(T, o.label);
    enter(D, [k, t1], T + 0.2);
    gsap.set(main, { drawSVG: '0%' });
    tl.to(main, { drawSVG: '100%', duration: 3.4, ease: 'none' }, T + 0.3);
    gsap.set(cs, { attr: { r: 0 } });
    gsap.set(labels, { opacity: 0 });
    cs.forEach((c, i) => {
      const at = T + 0.3 + 3.4 * ((xs[i] - (X0 - 90)) / (FORK - (X0 - 90)));
      D.hit(c, { attr: { r: 0 } }, { attr: { r: 9 }, duration: 0.35, ease: 'back.out(3)' }, at);
      D.hit(labels[i], { opacity: 0 }, { opacity: 1, duration: 0.25 }, at);
      if (i % 2 === 0) D.sfx('tick', at, 0.045);
    });
    // HEAD pulses, the names go, the line turns out to be this one
    const th = T + 4.1;
    tl.to(cs[cs.length - 1], { attr: { r: 15 }, duration: 0.2, yoyo: true, repeat: 1 }, th - 0.3);
    tl.to(labels, { opacity: 0, duration: 0.4 }, th);
    tl.to(t1, { opacity: 0, y: -30, duration: 0.3 }, th);
    gsap.set(t2, { opacity: 0, scale: 1 });
    D.hit(t2, { opacity: 1, scale: 1.2 }, { scale: 1, duration: 0.6, ease: 'expo.out' }, th + 0.2);
    D.sfx('boom', th + 0.2, 0.7);
    D.hide(s, T + dur);
    return dur;
  });

  // ------------------------------------------------------------------ BRFORK
  // The line splits in two; each end is a clickable option. Interactive films wait here (D.hold);
  // the start of each branch resolves the choice (D.post), so linear paths show the same.
  recipe('brfork', (D, T, o) => {
    const { tl } = D;
    const dur = o.duration || 4, opts = o.options || [], n = o.commits || 0;
    const nodes = opts.map((op, i) => ({ ...op, nx: 1450, ny: i ? 800 : 380 }));
    const curves = nodes.map(nd => `<path class="br-arm" data-arm="${nd.id}" style="stroke:${nd.color}" d="M${FORK} ${Y} C ${FORK + 170} ${Y}, ${nd.nx - 190} ${nd.ny}, ${nd.nx} ${nd.ny}"/><circle class="br-node" data-node="${nd.id}" cx="${nd.nx}" cy="${nd.ny}" r="15" style="fill:${nd.color}"/>`).join('');
    const s = D.scene('brfork', `<div class="br-fork"><div class="br-in">
      <div class="br-head"><div class="br-k mono">${o.kicker || ''}</div><div class="br-t">${o.title || ''}</div><div class="br-sub mono">${o.sub || ''}</div></div>
      ${graph(n, curves)}
      ${nodes.map(nd => `<button class="br-opt" data-choose="${nd.id}" style="--c:${nd.color};left:1500px;top:${nd.ny - 80}px"><b class="mono">${nd.key}</b><span class="br-ot">${nd.title}</span><span class="br-os mono">${nd.sub}</span></button>`).join('')}
    </div></div>`);
    const inner = D.$('.br-in', s), arms = D.$$('.br-arm', s), nodeEls = D.$$('.br-node', s), cards = D.$$('.br-opt', s);
    const byId = Object.fromEntries(nodes.map((nd, i) => [nd.id, { ...nd, arm: arms[i], node: nodeEls[i], card: cards[i] }]));
    D.show(s, T);
    D.setBg('#0e0e10', T);
    D.ink('#f4f4f5', T);
    if (o.label) D.label(T, o.label);
    enter(D, D.$$('.br-head > *', s), T + 0.2);
    gsap.set(arms, { drawSVG: '0%' });
    tl.to(arms, { drawSVG: '100%', duration: 0.8, ease: 'power2.inOut', stagger: 0.12 }, T + 0.15);
    gsap.set(nodeEls, { attr: { r: 0 } });
    nodeEls.forEach((nd, i) => D.hit(nd, { attr: { r: 0 } }, { attr: { r: 15 }, duration: 0.4, ease: 'back.out(3)' }, T + 0.85 + i * 0.12));
    gsap.set(cards, { opacity: 0 });
    cards.forEach((c, i) => D.hit(c, { opacity: 0, x: 60 }, { opacity: 1, x: 0, duration: 0.6, ease: 'expo.out' }, T + 0.95 + i * 0.15));
    D.sfx('whoosh', T + 0.15, 0.8, 0.3);
    D.sfx('bell', T + 0.95, D.N.E5, 0.06);
    D.sfx('bell', T + 1.1, D.N.A5, 0.06);
    D.call(() => SFX.pad('br-fork', [110, 130.81, 164.81, 220], 1.4, 0.05, 800), T + 0.2);
    D.hold(T + dur - 0.02, { start: T });
    D.hide(s, T + dur);
    // the start of every branch: the chosen option lights up and the camera dives into its node
    D.post((D2, segs) => segs.filter(g => g.branch && byId[g.branch]).forEach(g => {
      const S = g.start, me = byId[g.branch], rest = nodes.filter(nd => nd.id !== me.id).map(nd => byId[nd.id]);
      tl.set(s, { autoAlpha: 1 }, S);
      tl.set(inner, { scale: 1, opacity: 1, transformOrigin: `${me.nx}px ${me.ny}px` }, S);
      tl.set(cards, { opacity: 1, scale: 1 }, S);
      tl.set(arms, { opacity: 1 }, S);
      D.hit(me.card, { scale: 1 }, { scale: 1.08, duration: 0.3, ease: 'back.out(3)' }, S);
      tl.to(rest.flatMap(r => [r.card, r.arm, r.node]), { opacity: 0.15, duration: 0.25 }, S);
      tl.to(inner, { scale: 3.2, opacity: 0, duration: 0.7, ease: 'power3.in' }, S + 0.35);
      D.hide(s, S + 1.05);
      D.call(() => SFX.padStop('br-fork', 0.6), S);
      D.sfx('key', S, 0.4);
      D.sfx('whoosh', S + 0.3, 0.7, 0.35);
    }));
    return dur;
  });

  // ------------------------------------------------------------------ BRWORLD
  // A world of parallax layers that opens as a circle from the chosen node.
  // kind 'shapes': geometry at five depths. kind 'data': real numbers at depth, a skyline of bars far away.
  recipe('brworld', (D, T, o) => {
    const { tl } = D;
    const dur = o.duration || 6, c = o.color, r = rng(o.seed || 11), f0 = nf(D);
    let layers = '';
    if (o.kind === 'data') {
      const bars = o.bars || [], mx = Math.max(...bars, 1), bw = 2160 / Math.max(1, bars.length);
      layers += `<div class="br-lyr" data-depth="0.15"><div class="br-sky">${bars.map((v, i) => `<i style="left:${(i * bw + 6).toFixed(1)}px;width:${(bw - 12).toFixed(1)}px;height:${((v / mx) * 420).toFixed(1)}px"></i>`).join('')}</div></div>`;
      const slots = [[1180, 170, 1.3, 150], [1290, 590, 0.9, 110], [640, 500, 0.6, 88], [150, 690, 1.1, 124], [900, 800, 0.45, 70], [1640, 880, 0.35, 56]];
      (o.items || []).slice(0, slots.length).forEach(([v, l, d], i) => {
        const [x, y, dp, size] = slots[i];
        layers += `<div class="br-lyr" data-depth="${dp}"><div class="br-num" style="left:${x}px;top:${y}px"><b class="v" data-v="${v}" data-d="${d || 0}" style="font-size:${size}px">${f0.format(0)}</b><span class="mono">${l}</span></div></div>`;
      });
    } else {
      const kinds = ['circle', 'square', 'tri', 'ring'], tints = o.tints || [c, '#ffffff'];
      [[0.15, 26, 14, 40, 0.18], [0.4, 14, 40, 110, 0.35], [0.8, 9, 90, 220, 0.6], [1.4, 5, 180, 380, 0.9]].forEach(([dp, count, s0, s1, a], li) => {
        let h = '';
        for (let i = 0; i < count; i++) {
          const k = kinds[Math.floor(r() * kinds.length)], sz = s0 + r() * (s1 - s0), x = -120 + r() * 2160, y = -120 + r() * 1320, col = tints[Math.floor(r() * tints.length)];
          const fill = li < 1 || k === 'ring' ? 'none' : col, stroke = fill === 'none' ? col : 'none';
          const shape = k === 'circle' || k === 'ring' ? `<circle cx="50" cy="50" r="${k === 'ring' ? 40 : 46}"/>` : k === 'square' ? '<rect x="8" y="8" width="84" height="84" rx="6"/>' : '<path d="M50 6 L94 90 L6 90Z"/>';
          h += `<svg class="br-sh" viewBox="0 0 100 100" style="left:${x.toFixed(0)}px;top:${y.toFixed(0)}px;width:${sz.toFixed(0)}px;height:${sz.toFixed(0)}px;opacity:${a};fill:${fill};stroke:${stroke};stroke-width:${k === 'ring' ? 10 : 4}" data-spin="${((r() - 0.5) * 160).toFixed(0)}">${shape}</svg>`;
        }
        layers += `<div class="br-lyr" data-depth="${dp}">${h}</div>`;
      });
    }
    const s = D.scene('brworld', `<div class="br-world" style="--c:${c};background:${o.bg || '#0e0e10'}">
      ${layers}
      <div class="br-copy" data-depth="0.22"><div class="br-k mono" style="color:${c}">${o.kicker || ''}</div><div class="br-t">${o.title || ''}</div>
        <div class="br-hint mono"><span class="if-ix">${o.hintIx || ''}</span><span class="if-lin">${o.hintLin || ''}</span></div></div>
      ${o.source ? `<div class="br-src mono">${o.source}</div>` : ''}
    </div>`);
    const world = D.$('.br-world', s), spins = D.$$('.br-sh', s), nums = D.$$('.br-num b', s), sky = D.$$('.br-sky i', s);
    const at = o.from || { x: 960, y: 540 };
    D.show(s, T);
    D.ink('#f4f4f5', T);
    if (o.label) D.label(T, o.label);
    gsap.set(world, { clipPath: `circle(0px at ${at.x}px ${at.y}px)` });
    D.hit(world, { clipPath: `circle(0px at ${at.x}px ${at.y}px)` }, { clipPath: `circle(2300px at ${at.x}px ${at.y}px)`, duration: 0.95, ease: 'power3.inOut' }, T + 0.5);
    D.setBg(o.base || '#0e0e10', T + 1.45);
    D.sfx('boom', T + 0.5, 0.6);
    enter(D, D.$$('.br-copy > *', s), T + 1.0, 0.1);
    if (o.source) enter(D, [D.$('.br-src', s)], T + 1.6);
    spins.forEach(e => { gsap.set(e, { rotation: 0 }); tl.to(e, { rotation: +e.dataset.spin, duration: dur, ease: 'none' }, T); });
    // numbers count up (the real ones), bars rise from zero
    nums.forEach((e, i) => {
      const v = +e.dataset.v, d = +e.dataset.d, f = nf(D, d), P = { v: 0 };
      tl.to(P, { v, duration: 1.2, ease: 'expo.out', onUpdate: () => { e.textContent = f.format(P.v); } }, T + 1.1 + i * 0.12);
      if (i % 2 === 0) D.sfx('tick', T + 1.1 + i * 0.12, 0.04);
    });
    if (sky.length) { gsap.set(sky, { scaleY: 0, transformOrigin: '50% 100%' }); tl.to(sky, { scaleY: 1, duration: 0.9, ease: 'expo.out', stagger: 0.025 }, T + 1.0); }
    // the scripted camera (what the pointer does in interactive mode)
    tl.set(D.cam, { x: 0, y: 0 }, T);
    tl.to(D.cam, { keyframes: [{ x: 130, y: -55, duration: 2.1, ease: 'sine.inOut' }, { x: -120, y: 45, duration: 2.2, ease: 'sine.inOut' }, { x: 0, y: 0, duration: dur - 4.6, ease: 'sine.inOut' }] }, T + 0.3);
    D.hide(s, T + dur);
    return dur;
  });

  // ------------------------------------------------------------------ BRMORPH
  // One path, many forms: a single SVG trail morphing on the beat, with its name typed below.
  recipe('brmorph', (D, T, o) => {
    const { tl } = D;
    const dur = o.duration || 6, c = o.color, F = D.forms(1), seq = o.forms || [['circle', 'círculo'], ['square', 'cuadrado'], ['triangle', 'triángulo'], ['star', 'estrella'], ['flower', 'flor']];
    const s = D.scene('brmorph', `<div class="br-morph" style="--c:${c};background:${o.bg || '#0e0e10'}">
      <div class="br-lyr" data-depth="0.3"><div class="br-big v">${o.word || ''}</div></div>
      <div class="br-lyr" data-depth="0.85"><svg class="br-mo" viewBox="-260 -260 520 520"><defs><linearGradient id="br-grad" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c}"/><stop offset="1" stop-color="${o.color2 || '#ffffff'}"/></linearGradient></defs><path d="${F[seq[0][0]]}" fill="url(#br-grad)"/></svg></div>
      <div class="br-lyr" data-depth="1.5">${[[240, 200, 60], [1620, 260, 90], [1500, 860, 50], [330, 820, 110]].map(([x, y, z]) => `<i class="br-sat" style="left:${x}px;top:${y}px;width:${z}px;height:${z}px"></i>`).join('')}</div>
      <div class="br-copy" data-depth="0.22"><div class="br-k mono" style="color:${c}">${o.kicker || ''}</div><div class="br-t">${o.title || ''}</div></div>
      <div class="br-names mono">${seq.map(([, l]) => `<span>${l}</span>`).join('')}</div>
    </div>`);
    const path = D.$('.br-mo path', s), names = D.$$('.br-names span', s), mo = D.$('.br-mo', s), sats = D.$$('.br-sat', s);
    D.show(s, T);
    D.setBg(o.base || '#0e0e10', T);
    D.ink('#f4f4f5', T);
    if (o.label) D.label(T, o.label);
    enter(D, D.$$('.br-copy > *', s), T + 0.2, 0.1);
    gsap.set(names, { opacity: 0 });
    D.hit(names[0], { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.3 }, T + 0.5);
    gsap.set(mo, { scale: 0 });
    D.hit(mo, { scale: 0, rotation: -90 }, { scale: 1, rotation: 0, duration: 0.9, ease: 'back.out(1.6)' }, T + 0.15);
    gsap.set(sats, { scale: 0 });
    D.hit(sats, { scale: 0 }, { scale: 1, duration: 0.6, ease: 'back.out(2)', stagger: 0.08 }, T + 0.4);
    tl.to(mo, { rotation: 60, duration: dur - 1.1, ease: 'none' }, T + 1.05);
    seq.slice(1).forEach(([k, label], i) => {
      const at = T + 1.0 + i;
      tl.to(path, { morphSVG: F[k], duration: 0.55, ease: 'expo.inOut' }, at);
      tl.set(names[i], { opacity: 0 }, at + 0.2);
      D.hit(names[i + 1], { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.3 }, at + 0.2);
      D.sfx('kick', at, 0.5);
      D.sfx('bell', at + 0.1, [D.N.C5, D.N.E5, D.N.G5, D.N.A5][i % 4], 0.05);
    });
    tl.set(D.cam, { x: 0, y: 0 }, T);
    tl.to(D.cam, { keyframes: [{ x: -100, y: 30, duration: 2.5, ease: 'sine.inOut' }, { x: 90, y: -40, duration: 2.3, ease: 'sine.inOut' }, { x: 0, y: 0, duration: dur - 4.8, ease: 'sine.inOut' }] }, T);
    D.hide(s, T + dur);
    return dur;
  });

  // ------------------------------------------------------------------ BRSCRUB
  // Time that goes back and forth: a ruler, a playhead, a timecode and a mouse wheel.
  recipe('brscrub', (D, T, o) => {
    const { tl } = D;
    const dur = o.duration || 6, c = o.color, L = o.length || 34, fps = 30;
    const tc = v => { const f = Math.max(0, Math.round(v * fps)), sec = Math.floor(f / fps); return `00:00:${String(sec).padStart(2, '0')}:${String(f % fps).padStart(2, '0')}`; };
    const s = D.scene('brscrub', `<div class="br-scrub" style="--c:${c};background:${o.bg || '#0e0e10'}">
      <div class="br-copy" data-depth="0.22"><div class="br-k mono" style="color:${c}">${o.kicker || ''}</div><div class="br-t">${o.title || ''}</div>
        <div class="br-hint mono"><span class="if-ix">${o.hintIx || ''}</span><span class="if-lin">${o.hintLin || ''}</span></div></div>
      <div class="br-tc mono" data-depth="0.5">${tc(0)}</div>
      <svg class="br-wheel" data-depth="0.7" viewBox="0 0 120 180"><rect x="6" y="6" width="108" height="168" rx="54"/><line x1="60" y1="6" x2="60" y2="70"/><rect class="br-wd" x="52" y="30" width="16" height="30" rx="8"/><path class="br-up" d="M60 -26 l-14 16 h28z"/><path class="br-dn" d="M60 206 l-14 -16 h28z"/></svg>
      <div class="br-ruler" data-depth="0.9"><i class="br-rl"></i>${Array.from({ length: L + 1 }, (_, k) => `<i class="br-tk${k % 5 === 0 ? ' is-big' : ''}" style="left:${(k / L) * 100}%"></i>${k % 5 === 0 ? `<span class="mono" style="left:${(k / L) * 100}%">${k} s</span>` : ''}`).join('')}<i class="br-ph"></i></div>
    </div>`);
    const tcEl = D.$('.br-tc', s), ph = D.$('.br-ph', s), wd = D.$('.br-wd', s), up = D.$('.br-up', s), dn = D.$('.br-dn', s), ruler = D.$('.br-ruler', s);
    D.show(s, T);
    D.setBg(o.base || '#0e0e10', T);
    D.ink('#f4f4f5', T);
    if (o.label) D.label(T, o.label);
    enter(D, D.$$('.br-copy > *', s), T + 0.2, 0.1);
    enter(D, [tcEl, D.$('.br-wheel', s)], T + 0.35, 0.1);
    gsap.set(ruler, { opacity: 0 });
    D.hit(ruler, { opacity: 0, scaleX: 0.4 }, { opacity: 1, scaleX: 1, duration: 0.8, ease: 'expo.out' }, T + 0.4);
    // the scrub: forward, back, forward again (each move with its wheel direction)
    const P = { v: 0 }, set = () => { tcEl.textContent = tc(P.v); ph.style.left = `${(P.v / L) * 100}%`; };
    set();
    gsap.set([up, dn], { opacity: 0.15 });
    [[1.0, 14, 1.3, dn, 1], [2.5, 5, 1.1, up, -1], [3.8, 24, 1.5, dn, 1]].forEach(([t0, v, d, arrow, dir]) => {
      tl.to(P, { v, duration: d, ease: 'power2.inOut', onUpdate: set }, T + t0);
      D.hit(arrow, { opacity: 1 }, { opacity: 0.15, duration: d, ease: 'power2.in' }, T + t0);
      tl.to(wd, { y: dir * 14, duration: d / 4, yoyo: true, repeat: 3, ease: 'sine.inOut' }, T + t0);
      D.sfx('whoosh', T + t0, d, 0.18);
      for (let k = 0; k < 4; k++) D.sfx('tick', T + t0 + k * d / 4, 0.04);
    });
    D.hide(s, T + dur);
    return dur;
  });

  // ------------------------------------------------------------------ BRMERGE
  // The branches meet again; the text names the path you took, and offers the other one.
  recipe('brmerge', (D, T, o) => {
    const { tl } = D;
    const dur = o.duration || 6, opts = o.options || [];
    const yA = 520, yB = 840, xs = 160, xf = 560, xm = 1320, xe = 1780, yM = 680;
    const arm = (id, y, col) => `<path class="br-marm" data-arm="${id}" style="stroke:${col}" d="M${xf} ${yM} C ${xf + 150} ${yM}, ${xf + 150} ${y}, ${xf + 300} ${y} L ${xm - 300} ${y} C ${xm - 150} ${y}, ${xm - 150} ${yM}, ${xm} ${yM}"/>`;
    const s = D.scene('brmerge', `<div class="br-merge">
      <div class="br-head"><div class="br-k mono">${o.kicker || ''}</div>
        <div class="br-t">${o.lead || ''} ${opts.map(op => `<span class="if-${op.id}" style="color:${op.color}">${op.key} · ${op.title}</span>`).join('')}.</div>
        <div class="br-sub2">${o.sub || ''}</div>
        <div class="br-again"><button class="br-btn if-ix" data-choose-other>${o.button || ''}</button><span class="br-lin mono if-lin">${o.linear || ''}</span></div></div>
      <svg class="br-g" viewBox="0 0 1920 1080"><path class="br-main" d="M${xs} ${yM} L${xf} ${yM}"/>${opts.map((op, i) => arm(op.id, i ? yB : yA, op.color)).join('')}<path class="br-main br-tail" d="M${xm} ${yM} L${xe} ${yM}"/><circle class="br-merge-n" cx="${xm}" cy="${yM}" r="22"/></svg>
    </div>`);
    const arms = D.$$('.br-marm', s), mains = D.$$('.br-main', s), mn = D.$('.br-merge-n', s);
    D.show(s, T);
    D.setBg('#0e0e10', T);
    D.ink('#f4f4f5', T);
    if (o.label) D.label(T, o.label);
    tl.set(D.cam, { x: 0, y: 0 }, T);
    gsap.set([mains[0], ...arms, mains[1]], { drawSVG: '0%' });
    tl.to(mains[0], { drawSVG: '100%', duration: 0.5, ease: 'none' }, T + 0.2);
    tl.to(arms, { drawSVG: '100%', duration: 1.2, ease: 'power1.inOut' }, T + 0.7);
    gsap.set(mn, { attr: { r: 0 } });
    D.hit(mn, { attr: { r: 0 } }, { attr: { r: 22 }, duration: 0.5, ease: 'back.out(3)' }, T + 1.9);
    tl.to(mains[1], { drawSVG: '100%', duration: 0.6, ease: 'none' }, T + 2.0);
    D.sfx('boom', T + 1.9, 0.6);
    D.sfx('bell', T + 1.9, D.N.E5, 0.07);
    enter(D, D.$$('.br-head > *', s), T + 0.4, 0.3);
    D.hide(s, T + dur);
    return dur;
  });

  // ------------------------------------------------------------------ BRTITLE
  recipe('brtitle', (D, T, o) => {
    const { tl } = D;
    const dur = o.duration || 6;
    const s = D.scene('brtitle', `<div class="br-title">
      <svg class="br-icon" viewBox="0 0 200 100"><path d="M10 50 H80 C110 50 110 18 140 18 H190" style="stroke:${o.colors[0]}"/><path d="M80 50 C110 50 110 82 140 82 H190" style="stroke:${o.colors[1]}"/><circle cx="80" cy="50" r="8"/></svg>
      <div class="br-tt v">${[...(o.title || '')].map((ch, i, all) => `<span style="color:${mix(o.colors[0], o.colors[1], all.length > 1 ? i / (all.length - 1) : 0)}">${ch}</span>`).join('')}</div>
      <div class="br-tag mono">${o.tagline || ''}</div>
      <div class="br-legend">${(o.legend || []).map(([k, l]) => `<span class="mono"><b>${k}</b>${l}</span>`).join('')}</div>
    </div>`);
    const chars = D.$$('.br-tt span', s), icon = D.$$('.br-icon path', s);
    D.fit(D.$('.br-tt', s), 1600);
    D.show(s, T);
    D.setBg('#0e0e10', T);
    D.ink('#f4f4f5', T);
    if (o.label) D.label(T, o.label);
    gsap.set(icon, { drawSVG: '0%' });
    tl.to(icon, { drawSVG: '100%', duration: 0.8, ease: 'power2.inOut', stagger: 0.1 }, T + 0.1);
    gsap.set(chars, { opacity: 0 });
    D.hit(chars, { opacity: 0, yPercent: 60 }, { opacity: 1, yPercent: 0, duration: 0.6, ease: 'expo.out', stagger: 0.05 }, T + 0.5);
    D.sfx('boom', T + 0.5, 0.8);
    D.call(() => SFX.pad('br-title', [110, 164.81, 220, 277.18], 1.2, 0.05, 1100), T + 0.5);
    enter(D, [D.$('.br-tag', s)], T + 1.4);
    enter(D, D.$$('.br-legend > span', s), T + 1.8, 0.12);
    D.barsTo(540, T + dur - 0.9, 0.8);
    D.call(() => SFX.padStop('br-title', 1.4), T + dur - 0.9);
    D.hide(s, T + dur);
    return dur;
  });
})();
