/* ============================================================================
   VERTICAL MODULE — 9:16 films for Reels, TikTok and Stories (cfg.stage = { w: 1080, h: 1920 }).
   Composed for a phone: key content stays inside the platform-safe zone (clear of the top
   bar, the right action rail and the bottom caption area). Brings:
   · a Stories-style segmented progress bar (one segment per labelled scene; plugin);
   · a touch finger: tap (ripple), drag / swipe, double tap, long press (ring), two-finger pinch;
   · big auto-captions: words pop in groups, the active word lights up;
   · a social feed of posts (poster art, title, action rail, hashtags, a spinning "sound" disc)
     with swipes that speed up into a flick; a profile grid with pinch-out, tap-to-open,
     double-tap heart and a long-press sheet; full-screen stat cards; a stacked title + CTA.
   Posts are data: { title, category, duration, scenes, palette [bg, a, b], fg, tags, svg }.
   Recipes: vhook, vfeed, vgrid, vstats, vtitle.
   ========================================================================== */
(() => {
  'use strict';
  const { recipe } = Trailer;
  const mmss = s => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`;
  const tagOf = t => '#' + String(t).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9ñ]+/g, '');
  const ico = d => `<svg viewBox="0 0 24 24" fill="currentColor">${d}</svg>`;
  const I = {
    heart: ico('<path d="M12 21s-7.5-4.6-10-9.3C.4 8.6 2.4 4.5 6.3 4.5c2.2 0 3.7 1.2 4.7 2.6 1-1.4 2.5-2.6 4.7-2.6 3.9 0 5.9 4.1 4.3 7.2C19.5 16.4 12 21 12 21z"/>'),
    film: ico('<path d="M4 4h16a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1zm1 2v2h2V6H5zm12 0v2h2V6h-2zM5 10v4h2v-4H5zm12 0v4h2v-4h-2zM5 16v2h2v-2H5zm12 0v2h2v-2h-2zM9 6v12h6V6H9z"/>'),
    clock: ico('<path d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20zm-1 5v6l5 3 1-1.6-4-2.4V7h-2z"/>'),
    share: ico('<path d="M14 4l8 8-8 8v-5c-6 0-9.5 1.8-12 6 1-6 4-11.5 12-12V4z"/>'),
    note: ico('<path d="M9 18.5a2.5 2.5 0 1 1-2-2.45V5l12-2v11.5a2.5 2.5 0 1 1-2-2.45V6.4L9 7.8v10.7z"/>'),
  };

  // ------------------------------------------------------------------ STORIES BAR (plugin)
  let segs = [];
  Trailer.plugin({
    setup: () => { segs = []; },
    scene: (D, T, s, dur) => { if (s.label && s.story !== false) segs.push({ T, dur }); },
    done: (D, cfg) => {
      if (D.H <= D.W || cfg.stories === false || !segs.length) return;
      const bar = document.createElement('div');
      bar.className = 'vt-story';
      bar.innerHTML = segs.map(() => '<i><b></b></i>').join('');
      D.stage.appendChild(bar);
      gsap.set(bar, { autoAlpha: 0 });
      D.tl.to(bar, { autoAlpha: 1, duration: 0.4 }, 0.2);
      D.$$('b', bar).forEach((b, i) => {
        gsap.set(b, { scaleX: 0, transformOrigin: '0% 50%' });
        D.tl.to(b, { scaleX: 1, duration: segs[i].dur, ease: 'none' }, segs[i].T);
      });
    },
  });

  // ------------------------------------------------------------------ FINGER · CAPTIONS
  /** A touch point: down/up, move, tap (ripple), long press (ring). */
  function finger(D, root, x = 560, y = 1500) {
    const { tl } = D;
    const el = document.createElement('div');
    el.className = 'vt-touch';
    el.innerHTML = '<svg viewBox="-60 -60 120 120"><circle class="vt-lp" r="54"/></svg>';
    root.appendChild(el);
    gsap.set(el, { x, y, opacity: 0, scale: 1 });
    const ring = el.querySelector('.vt-lp');
    gsap.set(ring, { drawSVG: '0%' });
    const api = {
      el,
      set: (t, px, py) => { tl.set(el, { x: px, y: py }, t); },
      down: (t, px, py) => { if (px != null) tl.set(el, { x: px, y: py }, t); D.hit(el, { opacity: 0, scale: 1.5 }, { opacity: 1, scale: 1, duration: 0.1, ease: 'power2.out' }, t); },
      up: t => { tl.to(el, { opacity: 0, scale: 1.25, duration: 0.14, ease: 'power1.in' }, t); },
      move: (t, px, py, dur, ease = 'power2.inOut') => { tl.to(el, { x: px, y: py, duration: dur, ease }, t); },
      ripple: (t, px, py) => {
        const r = document.createElement('i');
        r.className = 'vt-ripple';
        root.appendChild(r);
        gsap.set(r, { x: px, y: py, scale: 0, opacity: 0 });
        D.hit(r, { scale: 0.3, opacity: 0.9 }, { scale: 1.6, opacity: 0, duration: 0.5, ease: 'power2.out' }, t);
      },
      tap: (t, px, py) => { api.down(t, px, py); api.ripple(t + 0.05, px, py); D.sfx('key', t + 0.05, 0.25); api.up(t + 0.16); return t + 0.2; },
      press: (t, dur) => { D.hit(ring, { drawSVG: '0%', opacity: 1 }, { drawSVG: '100%', duration: dur, ease: 'none' }, t); tl.to(ring, { opacity: 0, duration: 0.15 }, t + dur); },
      /** a swipe: down at (x, y0), travel to y1, up; returns the time the finger lifts */
      swipe: (t, px, y0, y1, dur = 0.32) => { api.down(t, px, y0); api.move(t + 0.04, px, y1, dur, 'power2.in'); api.up(t + 0.04 + dur); D.sfx('whoosh', t, 0.35, 0.12); return t + 0.04 + dur; },
    };
    return api;
  }
  /** Big auto-captions: words in groups (≤ words per group), the active word lights up.
   *  Returns the time the last word finishes. */
  function captions(D, root, text, at, o = {}) {
    const { tl } = D;
    const words = String(text).split(/\s+/).filter(Boolean), per = o.per || 0.25, n = o.words || 3;
    const hot = o.hot || '#fde047';
    const box = document.createElement('div');
    box.className = 'vt-cap';
    box.style.top = (o.y ?? 1420) + 'px';
    root.appendChild(box);
    let t = at;
    const groups = [];
    for (let i = 0; i < words.length; i += n) groups.push(words.slice(i, i + n));
    groups.forEach((g, gi) => {
      const line = document.createElement('div');
      line.className = 'vt-capl v';
      line.innerHTML = g.map(w => `<span>${w}</span>`).join(' ');
      box.appendChild(line);
      D.fit(line, o.maxW || 900);
      gsap.set(line, { xPercent: -50, opacity: 0 });
      const spans = [...line.children];
      D.hit(line, { opacity: 1, scale: 0.72 }, { scale: 1, duration: 0.2, ease: 'back.out(3)' }, t);
      spans.forEach((sp, k) => {
        tl.set(sp, { color: hot, scale: 1.12 }, t + k * per);
        tl.set(sp, { color: '#ffffff', scale: 1 }, t + (k + 1) * per);
      });
      t += g.length * per;
      const last = gi === groups.length - 1;
      tl.set(line, { opacity: 0 }, last ? Math.max(t + 0.15, o.until ?? t + 0.5) : t);
    });
    return t;
  }

  // ------------------------------------------------------------------ POSTS
  /** One full-screen post (1080×1920): poster art, title, action rail, handle, hashtags, sound. */
  function postHTML(p, o = {}) {
    const [p0] = p.palette, fg = p.fg || '#ffffff';
    return `<article class="vt-post" style="--p0:${p0};--fg:${fg};background:linear-gradient(180deg, ${p0} 0%, color-mix(in srgb, ${p0} 72%, #000) 100%);color:${fg}">
      <svg class="vt-art" viewBox="56 0 104 90" preserveAspectRatio="xMidYMid meet" aria-hidden="true">${p.svg}</svg>
      <div class="vt-ttl v">${p.title}</div>
      <aside class="vt-rail">
        <span class="vt-act vt-like">${I.heart}<em>${o.likeLabel || 'Me gusta'}</em></span>
        <span class="vt-act">${I.film}<em>${p.scenes} escenas</em></span>
        <span class="vt-act">${I.clock}<em>${mmss(p.duration)}</em></span>
        <span class="vt-act">${I.share}<em>${o.shareLabel || 'Compartir'}</em></span>
      </aside>
      <div class="vt-info">
        <b>${o.handle || '@kinetic.studio'} <i>· ${p.category}</i></b>
        <p>${(p.tags || []).map(tagOf).join(' ')}</p>
        <div class="vt-sound">${I.note}<span class="vt-mq"><span class="vt-marq"><span>${o.sound || 'sonido original'} · ${o.sound || 'sonido original'} · </span></span></span></div>
      </div>
      <div class="vt-disc" style="background:conic-gradient(from 0deg, ${p.palette[1]}, ${p.palette[2]}, ${p.palette[1]})"><i></i></div>
    </article>`;
  }
  const fitTitles = (D, root) => D.$$('.vt-ttl', root).forEach(t => D.fit(t, 860));

  // ------------------------------------------------------------------ VHOOK
  // The first seconds decide the scroll: full-frame words, one per beat, hard colour cuts.
  recipe('vhook', (D, T, o) => {
    const { tl } = D;
    const slams = o.slams || [], beat = o.beat || 0.5, dur = slams.length * beat + (o.tail || 0);
    const s = D.scene('vhook', slams.map(x => `<div class="vt-slam" style="background:${x.bg}"><div class="vt-sw v c" style="color:${x.fg}">${x.text}</div></div>`).join(''));
    const cards = D.$$('.vt-slam', s);
    cards.forEach((c, i) => {
      const w = c.querySelector('.vt-sw');
      if (slams[i].size) w.style.fontSize = slams[i].size + 'px';
      D.fit(w, o.maxW || 980);
    });
    gsap.set(cards, { autoAlpha: 0 });
    D.show(s, T);
    D.setBg(slams[0] ? slams[0].bg : '#000', T);
    if (o.label) D.label(T, o.label);
    cards.forEach((c, i) => {
      const at = T + i * beat, w = c.querySelector('.vt-sw');
      tl.set(c, { autoAlpha: 1 }, at);
      if (i) tl.set(cards[i - 1], { autoAlpha: 0 }, at);
      D.hit(w, { scale: 1.5, rotation: i % 2 ? 4 : -4 }, { scale: 1, rotation: 0, duration: 0.3, ease: 'expo.out' }, at);
      D.shake(at, 0.2, 10);
      D.sfx('kick', at, 0.6);
      if (i % 2) D.sfx('clap', at, 0.25);
    });
    D.flash(T, 0.4, 0.4);
    D.sfx('boom', T, 0.7);
    D.hide(s, T + dur);
    return dur;
  });

  // ------------------------------------------------------------------ VFEED
  // A feed of posts; the finger swipes up, dwell times shrink (speed ramp) into a flick.
  recipe('vfeed', (D, T, o) => {
    const { tl, N } = D;
    const posts = o.posts || [], n = posts.length;
    const dwell = o.dwell || posts.map((_, i) => [2.5, 2, 2, 1.5, 1, 0.75][i] ?? 0.5);
    if (o.lastDwell) dwell[n - 1] = o.lastDwell;
    const s = D.scene('vfeed', `<div class="vt-feed">${posts.map(p => postHTML(p, o)).join('')}</div>`);
    const feed = D.$('.vt-feed', s), items = D.$$('.vt-post', s);
    fitTitles(D, s);
    const f = finger(D, s);
    D.show(s, T);
    D.setBg(posts[0] ? posts[0].palette[0] : '#000', T);
    D.ink('#ffffff', T);
    if (o.label) D.label(T, o.label);
    gsap.set(feed, { y: 0 });
    let t = T;
    posts.forEach((p, i) => {
      const item = items[i], art = D.$('.vt-art', item), disc = D.$('.vt-disc', item), marq = D.$('.vt-marq span', item), dw = dwell[i];
      // life while on screen: art breathes, disc spins, the sound line scrolls
      D.hit(art, { scale: 1 }, { scale: 1.06, duration: dw + 0.5, ease: 'sine.inOut' }, t);
      tl.to(disc, { rotation: '+=' + Math.round(dw * 140), duration: dw + 0.5, ease: 'none' }, t);
      tl.to(marq, { xPercent: -50, duration: Math.max(1, dw * 1.5), ease: 'none' }, t);
      D.hit(D.$('.vt-ttl', item), { yPercent: 40, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.35, ease: 'expo.out' }, t + 0.05);
      const cap = o.captions && o.captions[p.id];
      if (cap && dw >= 1.5) captions(D, item, cap, t + 0.25, { per: Math.min(0.26, (dw - 0.7) / cap.split(/\s+/).length) });
      if (i < n - 1) {
        const ts = t + dw - 0.45;
        f.swipe(ts, 560, 1500, 700, dw >= 1 ? 0.3 : 0.22);
        tl.to(feed, { y: -(i + 1) * D.H, duration: dw >= 1 ? 0.5 : 0.36, ease: 'power3.out' }, ts + 0.08);
        D.setBg(posts[i + 1].palette[0], ts + 0.2);
        if (dw < 1) D.sfx('tick', ts + 0.1, 0.05);
      }
      t += dw;
    });
    D.sfx('bell', T + 0.2, N.E5, 0.05);
    D.hide(s, T + dwell.reduce((a, b) => a + b, 0));
    return dwell.reduce((a, b) => a + b, 0);
  });

  // ------------------------------------------------------------------ VGRID
  // Pinch out of the last post into a profile grid; swipe down to the profile header;
  // tap a tile (it opens full screen); double tap = heart; long press = a sheet.
  recipe('vgrid', (D, T, o) => {
    const { tl, N, W, H } = D;
    const posts = o.posts || [], n = posts.length, P = o.profile || {};
    const G = 6, TW = (W - 2 * G) / 3, TH = TW * (H / W), HEAD = 480, k = TW / W;
    const rows = Math.ceil(n / 3), last = n - 1, openI = o.open ?? 0;
    const tileXY = i => ({ x: (i % 3) * (TW + G), y: HEAD + Math.floor(i / 3) * (TH + G) });
    const scroll0 = Math.max(0, tileXY(last).y + TH + 40 - H);
    const s = D.scene('vgrid', `<div class="vt-page">
        <header class="vt-prof">
          <div class="vt-av">${P.avatar || ''}</div>
          <div class="vt-ph"><b>${P.handle || '@kinetic.studio'}</b><span>${P.bio || ''}</span></div>
          <div class="vt-pstats">${(P.stats || []).map(([v, l]) => `<div><b class="v">${v}</b><span>${l}</span></div>`).join('')}</div>
          <div class="vt-tabs"><i class="is-on"></i><i></i><i></i></div>
        </header>
        <div class="vt-grid">${posts.map((p, i) => { const { x, y } = tileXY(i); return `<div class="vt-tile" style="left:${x}px;top:${y}px;width:${TW}px;height:${TH}px"><div class="vt-tin" style="transform:scale(${k})">${postHTML(p, o)}</div></div>`; }).join('')}</div>
      </div>
      <div class="vt-big vt-big-a">${postHTML(posts[last], o)}</div>
      <div class="vt-big vt-big-b">${postHTML(posts[openI], o)}</div>
      <div class="vt-hearts"></div>
      <div class="vt-sheet"><i></i>${(o.sheet || ['Abrir']).map((x, j) => `<div class="vt-sh-i${j === 0 ? ' is-main' : ''}">${x}</div>`).join('')}</div>`);
    fitTitles(D, s);
    const page = D.$('.vt-page', s), tiles = D.$$('.vt-tile', s), bigA = D.$('.vt-big-a', s), bigB = D.$('.vt-big-b', s), sheet = D.$('.vt-sheet', s), hearts = D.$('.vt-hearts', s);
    const mainItem = D.$('.vt-sh-i.is-main', sheet), mbx = D.box(mainItem), mb = { x: mbx.x + mbx.w / 2, y: mbx.y + mbx.h / 2 }; // before the sheet is hidden
    const f1 = finger(D, s), f2 = finger(D, s);
    // start: the last post full screen (continuity with vfeed), the page scrolled to its tile
    gsap.set(page, { y: -scroll0 });
    gsap.set(tiles, { opacity: 0, scale: 0.85, transformOrigin: '50% 50%' });
    gsap.set([bigA, bigB], { transformOrigin: '0% 0%' });
    gsap.set(bigB, { autoAlpha: 0 });
    gsap.set(sheet, { yPercent: 110 });
    D.show(s, T);
    D.setBg(o.bg || '#0b0b0f', T);
    if (o.label) D.label(T, o.label);
    // 1 · pinch in: two fingers close, the post shrinks into its tile
    const la = tileXY(last);
    f1.down(T + 0.1, 360, 1180); f2.down(T + 0.1, 740, 720);
    f1.move(T + 0.15, 500, 1000, 0.55, 'power2.inOut'); f2.move(T + 0.15, 600, 880, 0.55, 'power2.inOut');
    f1.up(T + 0.72); f2.up(T + 0.72);
    tl.to(bigA, { x: la.x, y: la.y - scroll0, scale: k, borderRadius: 30, duration: 0.7, ease: 'power3.inOut' }, T + 0.2);
    tl.to(tiles.filter((_, i) => i !== last), { opacity: 1, scale: 1, duration: 0.5, ease: 'expo.out', stagger: { each: 0.03, from: 'end' } }, T + 0.5);
    tl.set(tiles[last], { opacity: 1, scale: 1 }, T + 0.9);
    tl.set(bigA, { autoAlpha: 0 }, T + 0.9);
    D.sfx('whoosh', T + 0.2, 0.6, 0.2);
    // 2 · swipe down: the grid scrolls back to the profile header
    const t2 = T + 1.3;
    f1.swipe(t2, 560, 700, 1500, 0.35);
    tl.to(page, { y: 0, duration: 0.9, ease: 'power3.out' }, t2 + 0.1);
    D.$$('.vt-pstats b', s).forEach(b => {
      const v = parseFloat(String(b.textContent).replace(/\./g, '')) || 0, txt = b.textContent, C = { v: 0 };
      if (!v) return;
      tl.set(b, { textContent: '0' }, t2 + 0.35);
      tl.to(C, { v, duration: 0.8, ease: 'power2.out', onUpdate: () => { b.textContent = C.v >= v ? txt : String(Math.round(C.v)); } }, t2 + 0.4);
    });
    // 3 · tap a tile: it opens full screen
    const t3 = t2 + 1.4, op = tileXY(openI), tc = { x: op.x + TW / 2, y: op.y + TH / 2 };
    f1.tap(t3, tc.x, tc.y);
    D.hit(bigB, { autoAlpha: 1, x: op.x, y: op.y, scale: k, borderRadius: 30 }, { x: 0, y: 0, scale: 1, borderRadius: 0, duration: 0.6, ease: 'expo.inOut' }, t3 + 0.12);
    D.sfx('whoosh', t3 + 0.12, 0.5, 0.2);
    // 4 · double tap: heart
    const t4 = t3 + 1.3, hx = 560, hy = 700;
    f1.tap(t4, hx, hy);
    f1.tap(t4 + 0.22, hx, hy);
    const big = document.createElement('div');
    big.className = 'vt-heart';
    big.innerHTML = I.heart;
    hearts.appendChild(big);
    gsap.set(big, { x: hx, y: hy, scale: 0, opacity: 0, rotation: -12 });
    D.hit(big, { opacity: 1, scale: 0.2 }, { scale: 1.25, rotation: 0, duration: 0.35, ease: 'back.out(3)' }, t4 + 0.3);
    tl.to(big, { scale: 1.5, y: hy - 160, opacity: 0, duration: 0.5, ease: 'power2.in' }, t4 + 0.9);
    for (let i = 0; i < 10; i++) {
      const m = document.createElement('div');
      m.className = 'vt-heart vt-mini';
      m.innerHTML = I.heart;
      hearts.appendChild(m);
      const a = (i / 10) * Math.PI * 2 + D.rand() * 0.4, r = 180 + D.rand() * 120;
      gsap.set(m, { x: hx, y: hy, scale: 0, opacity: 0 });
      D.hit(m, { opacity: 1, scale: 0.4 }, { x: hx + Math.cos(a) * r, y: hy + Math.sin(a) * r, scale: 0.8, opacity: 0, duration: 0.8, ease: 'power2.out' }, t4 + 0.34);
    }
    const like = D.$('.vt-like', bigB);
    tl.to(like, { color: '#ff2e88', duration: 0.1 }, t4 + 0.3);
    D.hit(like, { scale: 1.5 }, { scale: 1, duration: 0.4, ease: 'back.out(3)' }, t4 + 0.3);
    D.sfx('plip', t4 + 0.3, 0.08, 1200);
    [N.E5, N.A5].forEach((fq, i) => D.sfx('bell', t4 + 0.3 + i * 0.08, fq, 0.06));
    // 5 · long press: ring fills, the sheet slides up
    const t5 = t4 + 1.3;
    f1.down(t5, 560, 1000);
    f1.press(t5 + 0.05, 0.55);
    D.sfx('swell', t5, 0.6, 0.08);
    f1.up(t5 + 0.65);
    tl.to(bigB, { scale: 0.94, x: W * 0.03, y: H * 0.02, borderRadius: 40, filter: 'brightness(.55)', duration: 0.45, ease: 'expo.out' }, t5 + 0.6);
    tl.to(sheet, { yPercent: 0, duration: 0.5, ease: 'expo.out' }, t5 + 0.6);
    D.sfx('plip', t5 + 0.6, 0.06, 700);
    f1.tap(t5 + 1.4, mb.x, mb.y);
    tl.to(mainItem, { backgroundColor: '#ff2e88', color: '#ffffff', duration: 0.15 }, t5 + 1.45);
    const dur = o.duration || t5 + 2.1 - T;
    D.hide(s, T + dur);
    return dur;
  });

  // ------------------------------------------------------------------ VSTATS
  // Full-screen stat cards; each swipe brings the next one up. Use REAL figures.
  recipe('vstats', (D, T, o) => {
    const { tl, H } = D;
    const cards = o.stats || [], step = o.step || 1.5, dur = cards.length * step;
    const s = D.scene('vstats', cards.map(c => `<div class="vt-stat" style="background:${c.bg};color:${c.fg}"><div class="vt-sn v c">${c.format ? c.format(0) : 0}</div><div class="vt-sl mono c">${c.label}</div>${c.note ? `<div class="vt-sno mono c">${c.note}</div>` : ''}</div>`).join(''));
    const els = D.$$('.vt-stat', s), f = finger(D, s);
    els.forEach((e, i) => { const nEl = e.querySelector('.vt-sn'); nEl.textContent = cards[i].format ? cards[i].format(cards[i].value) : cards[i].value; D.fit(nEl, 960); nEl.textContent = cards[i].format ? cards[i].format(0) : 0; });
    gsap.set(els, { y: H });
    gsap.set(els[0], { y: 0 });
    D.show(s, T);
    if (o.label) D.label(T, o.label);
    els.forEach((e, i) => {
      const at = T + i * step, c = cards[i], nEl = e.querySelector('.vt-sn');
      if (i) {
        f.swipe(at - 0.3, 560, 1500, 800, 0.24);
        tl.to(e, { y: 0, duration: 0.45, ease: 'power3.out' }, at - 0.12);
        tl.to(els[i - 1], { y: -H * 0.25, filter: 'brightness(.4)', duration: 0.45, ease: 'power3.out' }, at - 0.12);
      }
      D.setBg(c.bg, at);
      const P = { v: 0 };
      tl.to(P, { v: c.value, duration: Math.min(0.8, step * 0.6), ease: 'expo.out', onUpdate: () => { nEl.textContent = c.format ? c.format(P.v) : String(Math.round(P.v)); } }, at + 0.05);
      D.hit(nEl, { scale: 1.3 }, { scale: 1, duration: 0.4, ease: 'expo.out' }, at + 0.05);
      D.sfx('kick', at, 0.55);
    });
    if (o.caption) captions(D, s, o.caption, T + 0.3, { y: 1500, per: Math.min(0.3, (dur - 0.6) / o.caption.split(/\s+/).length), until: T + dur - 0.1 });
    D.hide(s, T + dur);
    return dur;
  });

  // ------------------------------------------------------------------ VTITLE
  // The brand stacked big, a tagline, a swipe-up CTA; the finger swipes and it all flies up.
  recipe('vtitle', (D, T, o) => {
    const { tl, N } = D;
    const dur = o.duration || 6, lines = o.lines || [D.cfg.meta.title];
    const s = D.scene('vtitle', `<div class="vt-tstack">${lines.map(l => `<div class="vt-tl v">${l}</div>`).join('')}</div>
      <div class="vt-tsub mono c"></div>
      <div class="vt-cta c"><i></i><i></i><i></i><span class="mono">${o.cta || ''}</span></div>`);
    const tls = D.$$('.vt-tl', s), stack = D.$('.vt-tstack', s), sub = D.$('.vt-tsub', s), cta = D.$('.vt-cta', s), chev = D.$$('.vt-cta i', s);
    tls.forEach(e => D.fit(e, 980));
    const sp = tls.map(e => D.split(e, { type: 'chars', mask: 'chars' }));
    sp.forEach(x => gsap.set(x.chars, { yPercent: 115 }));
    gsap.set(cta, { opacity: 0 });
    const f = finger(D, s);
    D.show(s, T);
    D.setBg(o.bg || '#ff2e88', T);
    D.ink('#ffffff', T);
    if (o.label) D.label(T, o.label);
    sp.forEach((x, i) => tl.to(x.chars, { yPercent: 0, duration: 0.8, ease: 'expo.out', stagger: 0.04 }, T + 0.1 + i * 0.25));
    D.sfx('braam', T + 0.1, 0.6);
    D.sfx('boom', T + 0.1, 0.8);
    D.flash(T + 0.1, 0.25, 0.5);
    D.call(() => SFX.pad('title', [110, 138.59, 164.81, 220], 1.2, 0.05, 900), T + 0.1);
    if (o.tagline) tl.to(sub, { duration: 1.1, scrambleText: { text: o.tagline, chars: 'upperCase', speed: 0.6 }, ease: 'none' }, T + 1.0);
    tl.to(cta, { opacity: 1, duration: 0.4 }, T + 1.6);
    for (let k = 0; k < 4; k++) chev.forEach((c, i) => D.hit(c, { opacity: 0.25, y: 0 }, { opacity: 1, y: -14, duration: 0.25, yoyo: true, repeat: 1, ease: 'sine.inOut' }, T + 1.7 + k * 0.6 + i * 0.1));
    D.sfx('bell', T + 1.6, N.E5, 0.05);
    // the swipe: everything flies up
    const ts = T + dur - 1.3;
    f.swipe(ts, 560, 1560, 520, 0.35);
    tl.to([stack, sub, cta], { y: -D.H, duration: 0.7, ease: 'expo.in', stagger: 0.04 }, ts + 0.15);
    D.sfx('whoosh', ts + 0.15, 0.7, 0.3);
    D.call(() => SFX.padStop('title', 1.2), ts + 0.3);
    D.setBg('#000000', T + dur - 0.3);
    D.hide(s, T + dur);
    return dur;
  });

  Trailer.vertical = { finger, captions, postHTML, I, mmss, tagOf };
})();
