/* ============================================================================
   SHOP MODULE — e-commerce product films, driven by one mouse.
   A storefront (header, hero, product grid with flat SVG products), login, a
   circular light → dark theme switch, add-to-cart with products flying into the
   cart, a checkout drawer (postcode shipping + payment methods + pay + Bauhaus
   confetti), an admin upload (drag a photo from the desktop into a dropzone),
   a sales-analytics view (area chart with a hover crosshair, payment-mix bars)
   and a finale where a giant cursor clicks the brand.
   Needs recipes-ui.js (cursor, typing, the admin window). The store is `shop` in
   the config; the admin window is `app` (see the UI module).
   Store data on screen (prices, sales) is DEMO data: label it so (the default
   copy does) — never present it as real statistics.
   Recipes: shopfront, shoplogin, shoptheme, shopcart, shopcheckout, shopupload,
   shopsales, shopfinale — each also takes fit (final length in s, the scene is time-warped
   to it) or tempo (time factor), camera (keyframed camera, see Trailer.ui.camera) and
   whipIn / whipOut ('left' | 'right').
   Remix recipes: clickopen, remixtitle, slam, statpunch.
   ========================================================================== */
(() => {
  'use strict';
  const { recipe } = Trailer;
  const UI = () => { if (!Trailer.ui) throw new Error('recipes-shop.js needs recipes-ui.js loaded before it'); return Trailer.ui; };
  const TH = {
    light: { bg: '#f6f8fb', panel: '#ffffff', soft: '#eef3f9', ink: '#0f1b2d', ink2: '#43536b', muted: '#7a889c', line: '#e3e9f1', accent: '#1f7bc6', sun: '#f6b40e', good: '#12a150', hot: '#e63922', hero: 'linear-gradient(115deg, #74acdf 0%, #a8cdec 58%, #f4f9fe 100%)', heroInk: '#0f1b2d', shadow: '0 40px 120px rgba(10,30,60,.35)' },
    dark: { bg: '#0b1220', panel: '#121b2d', soft: '#172338', ink: '#eef4ff', ink2: '#b8c6dc', muted: '#7f90ab', line: '#223150', accent: '#5aa9e6', sun: '#f6b40e', good: '#34d399', hot: '#ff6b5a', hero: 'linear-gradient(115deg, #1b5d97 0%, #173e66 58%, #0f2139 100%)', heroInk: '#ffffff', shadow: '0 40px 120px rgba(0,0,0,.6)' },
  };
  const vars = th => Object.entries(th).map(([k, v]) => `--s-${k}:${v}`).join(';');
  const ico = d => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
  const I = {
    search: ico('<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>'),
    cart: ico('<path d="M3 4h2.5l2.2 10.2a1.5 1.5 0 0 0 1.5 1.2h8.6a1.5 1.5 0 0 0 1.5-1.1L21 8H6.2"/><circle cx="10" cy="20" r="1.4"/><circle cx="17.5" cy="20" r="1.4"/>'),
    sun: ico('<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/>'),
    moon: ico('<path d="M19 14.5A7.5 7.5 0 0 1 9.5 5a7.5 7.5 0 1 0 9.5 9.5z"/>'),
    truck: ico('<path d="M2.5 6.5h11v9h-11zM13.5 9.5h4l3 3v3h-7"/><circle cx="6.5" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>'),
    upload: ico('<path d="M12 16V5M7.5 9.5L12 5l4.5 4.5M4 16v3h16v-3"/>'),
    card: ico('<rect x="2.5" y="5.5" width="19" height="13" rx="2"/><path d="M2.5 10h19M6 15h4"/>'),
    debit: ico('<rect x="2.5" y="5.5" width="19" height="13" rx="2"/><path d="M6 14h5M15 14h3"/>'),
    bank: ico('<path d="M3 9.5L12 4l9 5.5M5 10v7M9.5 10v7M14.5 10v7M19 10v7M3 20h18"/>'),
    qr: ico('<rect x="3.5" y="3.5" width="6" height="6" rx="1"/><rect x="14.5" y="3.5" width="6" height="6" rx="1"/><rect x="3.5" y="14.5" width="6" height="6" rx="1"/><path d="M14.5 14.5h2.5v2.5M20.5 14.5v6h-3M14.5 20.5h.01"/>'),
    cash: ico('<rect x="2.5" y="6" width="19" height="12" rx="2"/><circle cx="12" cy="12" r="2.6"/><path d="M6 9.5v5M18 9.5v5"/>'),
  };
  // the store mark: a pointer clicking inside a celeste tile
  const LOGO = '<svg viewBox="0 0 40 40"><rect width="40" height="40" rx="11" fill="#1f7bc6"/><circle cx="29" cy="11" r="5" fill="#f6b40e"/><path d="M12 9v19l5-4.6 3.3 7.6 3.4-1.4-3.3-7.4H27z" fill="#fff"/></svg>';
  // flat, Bauhaus-leaning product art (viewBox 0 0 200 200)
  const ART = {
    mate: '<svg viewBox="0 0 200 200"><path d="M112 70L150 16" stroke="#cfd6de" stroke-width="7" stroke-linecap="round"/><path d="M60 84C56 134 72 172 100 174C128 172 144 134 140 84Z" fill="#a0522d"/><path d="M76 104C74 132 84 152 100 156" stroke="#c2703f" stroke-width="7" fill="none" stroke-linecap="round"/><rect x="56" y="72" width="88" height="16" rx="5" fill="#cfd6de"/><ellipse cx="100" cy="72" rx="40" ry="8" fill="#7a9a2e"/></svg>',
    termo: '<svg viewBox="0 0 200 200"><path d="M130 76h14a9 9 0 0 1 9 9v56a9 9 0 0 1-9 9h-14" stroke="#1f2a3a" stroke-width="9" fill="none"/><rect x="66" y="50" width="66" height="132" rx="16" fill="#3a4a60"/><rect x="76" y="62" width="10" height="104" rx="5" fill="#6b7f99"/><rect x="72" y="26" width="54" height="30" rx="8" fill="#1f2a3a"/><rect x="60" y="100" width="78" height="22" fill="#74acdf"/></svg>',
    yerba: '<svg viewBox="0 0 200 200"><path d="M60 38L140 38L130 62L70 62Z" fill="#d49b08"/><path d="M58 60L142 60L152 182L48 182Z" fill="#f6b40e"/><circle cx="100" cy="122" r="30" fill="#2e7d32"/><path d="M100 104C88 116 88 132 100 142C112 132 112 116 100 104Z" fill="#b9e28c"/><path d="M100 110V140" stroke="#2e7d32" stroke-width="3"/></svg>',
    alfajor: '<svg viewBox="0 0 200 200">' + [0, 1, 2].map(i => { const y = 140 - i * 36, x = 38 + (i % 2) * 8; return `<rect x="${x}" y="${y}" width="124" height="30" rx="15" fill="#4e3322"/><rect x="${x + 6}" y="${y + 12}" width="112" height="6" rx="3" fill="#e9c38b"/><rect x="${x + 14}" y="${y + 4}" width="60" height="4" rx="2" fill="#6d4a33"/>`; }).join('') + '</svg>',
    dulce: '<svg viewBox="0 0 200 200"><rect x="60" y="70" width="80" height="108" rx="14" fill="#c8793a"/><rect x="66" y="80" width="10" height="84" rx="5" fill="#e0a06a"/><rect x="56" y="46" width="88" height="28" rx="7" fill="#e63922"/><rect x="60" y="112" width="80" height="34" fill="#fff"/><circle cx="100" cy="129" r="10" fill="#74acdf"/></svg>',
  };
  const ARROW = '<svg viewBox="0 0 30 42"><path d="M3 3v29l7.3-6.8 5 11.6 5.1-2.1-5-11.4H25z" fill="#0b0b12" stroke="#fff" stroke-width="2.2" stroke-linejoin="round"/></svg>';
  const HERO = '<svg viewBox="0 0 520 230"><g class="sh-rays" transform="translate(372 112) rotate(90)">' + Array.from({ length: 16 }, (_, i) => `<rect x="-3" y="-104" width="6" height="22" rx="3" fill="#f6b40e" transform="rotate(${i * 22.5})"/>`).join('') + '</g><circle cx="372" cy="112" r="68" fill="#f6b40e"/><rect x="24" y="36" width="170" height="30" rx="15" fill="#fff" opacity=".9"/><rect x="24" y="84" width="170" height="30" rx="15" fill="#74acdf"/><rect x="24" y="132" width="170" height="30" rx="15" fill="#fff" opacity=".9"/><path d="M226 186l36-62 36 62z" fill="#e63922"/><rect x="226" y="40" width="54" height="54" rx="4" fill="#1d4ed8"/></svg>';

  function storeHTML(S, o = {}) {
    const th = TH[o.theme || 'light'];
    return `<div class="sh-win ${o.cls || ''}" style="${vars(th)}">
      <div class="sh-chrome"><i></i><i></i><i></i><span>${S.window || S.name}</span></div>
      <header class="sh-head">
        <div class="sh-logo">${LOGO}<b>${S.name}</b></div>
        <nav class="sh-nav">${(S.nav || []).map((n, i) => `<span class="${i ? '' : 'is-on'}">${n}</span>`).join('')}</nav>
        <div class="sh-search">${I.search}<span>${S.search || ''}</span></div>
        <div class="sh-toggle"><span class="sh-ts">${I.sun}</span><span class="sh-tm">${I.moon}</span><i class="sh-knob"${o.dark ? ' style="transform:translate(34px,0)"' : ''}></i></div>
        <div class="sh-acct"><span class="sh-login"${o.logged ? ' style="opacity:0"' : ''}>${S.loginLabel || 'Log in'}</span><span class="sh-user"${o.logged ? '' : ' style="opacity:0"'}><i>${S.user.initial}</i>${S.user.hello}</span></div>
        <span class="sh-cart">${I.cart}<b class="sh-badge"${o.cart ? '' : ' style="transform:scale(0,0)"'}>${o.cart || 0}</b></span>
      </header>
      <section class="sh-hero">
        <div class="sh-hc"><div class="sh-hk">${S.hero.kicker}</div><div class="sh-ht">${S.hero.title}</div><div class="sh-hs">${S.hero.sub}</div><span class="sh-hb">${S.hero.cta} →</span></div>
        <div class="sh-hart">${HERO}</div>
      </section>
      <div class="sh-sec"><b>${S.section || ''}</b><span>${S.seeAll || ''} →</span></div>
      <section class="sh-grid">${S.products.slice(0, 4).map((p, i) => {
        const done = i < (o.added || 0);
        return `<article class="sh-card"><div class="sh-img" style="background:${p.bg}">${ART[p.art]}</div><div class="sh-info"><div><div class="sh-pn">${p.name}</div><div class="sh-pp">${p.price}</div></div><span class="sh-add${done ? ' is-done' : ''}"><span class="sh-add-a"${done ? ' style="opacity:0"' : ''}>${S.addLabel || 'Add'}</span><span class="sh-add-b"${done ? '' : ' style="opacity:0"'}>✓ ${S.addedLabel || ''}</span></span></div></article>`;
      }).join('')}</section>
    </div>`;
  }
  let last = null; // the scene + camera wrapper the running shop recipe built (for camera / whip)
  /** Scene skeleton: a coloured stage (light or dark), a camera with the window(s) and the cursor. */
  function stage(D, name, inner, dark) {
    const s = D.scene(name, `<div class="sh-bg${dark ? ' is-dark' : ''}"><i class="sh-b1"></i><i class="sh-b2"></i><i class="sh-b3"></i></div><div class="sh-cam">${inner}</div>`);
    last = { s, cam: D.$('.sh-cam', s) };
    return last;
  }
  /** Register a shop recipe with the remix options: fit | tempo (time-warp the whole scene),
   *  camera (keyframes over the final length), whipIn / whipOut. */
  function shopRecipe(name, base, fn) {
    recipe(name, (D, T, o) => {
      const b = o.duration || base, k = o.fit ? o.fit / b : o.tempo || 1;
      last = null;
      const d = fn(k === 1 ? D : UI().warp(D, T, k), T, o) * k;
      if (last) { UI().camera(D, last.cam, T, d, o.camera, last.s); UI().whip(D, last.s, T, d, o); }
      return d;
    });
  }
  /** Keystroke schedule at a fixed speed (s per key, ±30 %, longer after spaces). */
  function fastSeq(D, str, speed) {
    const st = [{ t: 0, s: '' }];
    let t = 0;
    [...str].forEach((ch, i) => { t += speed * (0.7 + D.rand() * 0.6) + (ch === ' ' ? speed * 0.5 : 0); st.push({ t, s: str.slice(0, i + 1) }); });
    return { st, total: t };
  }
  const center = (D, el, dx = 0, dy = 0) => { const b = D.box(el); return { x: b.x + b.w / 2 + dx, y: b.y + b.h / 2 + dy }; };
  /** Caption under the window, coloured for its stage; a bare <i> = serif italic accent. */
  function cap(D, s, html, at, out, dark, accent) {
    if (!html) return;
    const el = document.createElement('div');
    el.className = 'sh-cap v';
    el.style.color = dark ? '#eef4ff' : '#0f1b2d';
    el.style.setProperty('--accent', accent || (dark ? '#74acdf' : '#1f7bc6'));
    el.innerHTML = html;
    s.appendChild(el);
    D.fit(el, 1500);
    gsap.set(el, { xPercent: -50 });
    const sp = D.split(el, { type: 'words', mask: 'words' });
    gsap.set(sp.words, { yPercent: 115 });
    D.tl.to(sp.words, { yPercent: 0, duration: 0.8, ease: 'expo.out', stagger: 0.06 }, at);
    D.tl.to(sp.words, { yPercent: -115, duration: 0.4, ease: 'expo.in', stagger: 0.02 }, out);
  }
  /** Type into a field: the text span and an optional caret. `mask` shows dots (passwords);
   *  `speed` (seconds per key, default human ≈ 0.09) for a fast typist. */
  function typeField(D, field, text, at, o = {}) {
    const U = UI(), v = field.querySelector('.v'), c = field.querySelector('.sh-caret'), str = o.mask ? '•'.repeat(text.length) : text;
    const seq = o.speed ? fastSeq(D, str, o.speed) : U.typing(D, str, null);
    if (c) { gsap.set(c, { opacity: 0 }); D.tl.set(c, { opacity: 1 }, at - 0.05); }
    const end = U.typeInto(D, v, seq, at);
    if (c) D.tl.set(c, { opacity: 0 }, o.caretOff ?? end + 0.5);
    return end;
  }
  /** A button that goes label → spinner → check. */
  function busy(D, btn, at, wait = 0.8, good) {
    const a = btn.querySelector('.a'), b = btn.querySelector('.b'), c = btn.querySelector('.c'), sp = btn.querySelector('.sh-spin');
    gsap.set([b, c], { opacity: 0 });
    D.tl.to(a, { opacity: 0, duration: 0.12 }, at);
    D.tl.to(b, { opacity: 1, duration: 0.12 }, at);
    D.tl.to(sp, { rotation: 360 * 3, duration: wait, ease: 'none' }, at);
    D.tl.to(b, { opacity: 0, duration: 0.1 }, at + wait);
    D.hit(c, { opacity: 0, scale: 0.4 }, { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(3)' }, at + wait);
    D.tl.to(btn, { backgroundColor: good || '#12a150', duration: 0.2 }, at + wait);
    D.sfx('bell', at + wait, D.N.A5, 0.06);
    return at + wait;
  }
  const BTN = (cls, label) => `<span class="sh-btn ${cls}"><span class="a">${label}</span><span class="b"><i class="sh-spin"></i></span><span class="c">✓</span></span>`;

  // ------------------------------------------------------------------ SHOPFRONT
  // The storefront assembles itself on the beat; the cursor walks in.        6.5 s
  shopRecipe('shopfront', 6.5, (D, T, o) => {
    const { tl, N } = D;
    const S = D.cfg.shop, dur = o.duration || 6.5;
    const { s, cam } = stage(D, 'shopfront', storeHTML(S, { theme: 'light' }));
    const w = D.$('.sh-win', s), head = D.$$('.sh-head > *', w), hero = D.$('.sh-hero', w), heroKids = D.$$('.sh-hc > *', w);
    const cards = D.$$('.sh-card', w), sec = D.$('.sh-sec', w), rays = D.$('.sh-rays', w), heroShapes = D.$$('.sh-hart svg > *:not(.sh-rays)', w);
    const rest = center(D, D.$('.sh-login', w), -40, 110);
    gsap.set(w, { opacity: 0, y: 40, scale: 0.97 });
    gsap.set(head, { opacity: 0, y: -16 });
    gsap.set(hero, { clipPath: 'inset(0% 100% 0% 0% round 20px)' });
    gsap.set(heroKids, { opacity: 0, x: -24 });
    gsap.set(heroShapes, { scale: 0, transformOrigin: '50% 50%' });
    gsap.set([sec, ...cards], { opacity: 0, y: 40 });
    gsap.set(rays, { attr: { transform: 'translate(372 112) rotate(0)' } });

    D.show(s, T);
    D.setBg('#dcebf8', T);
    D.ink('#eef4ff', T) /* the HUD sits on the black letterbox: always light */;
    if (o.label) D.label(T, o.label);
    tl.to(w, { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'expo.out' }, T + 0.05);
    tl.to(head, { opacity: 1, y: 0, duration: 0.6, ease: 'expo.out', stagger: 0.05 }, T + 0.4);
    tl.to(hero, { clipPath: 'inset(0% 0% 0% 0% round 20px)', duration: 0.9, ease: 'expo.inOut' }, T + 0.7);
    tl.to(heroKids, { opacity: 1, x: 0, duration: 0.7, ease: 'expo.out', stagger: 0.08 }, T + 1.2);
    tl.to(heroShapes, { scale: 1, duration: 0.6, ease: 'back.out(2)', stagger: 0.08 }, T + 1.3);
    tl.to(rays, { attr: { transform: 'translate(372 112) rotate(90)' }, duration: dur - 1, ease: 'none' }, T + 0.8);
    tl.to(sec, { opacity: 1, y: 0, duration: 0.6, ease: 'expo.out' }, T + 1.8);
    tl.to(cards, { opacity: 1, y: 0, duration: 0.8, ease: 'back.out(1.4)', stagger: 0.12 }, T + 1.9);
    cards.forEach((c, i) => D.sfx('plip', T + 1.9 + i * 0.12, 0.05, [600, 750, 900, 1100][i]));
    D.sfx('whoosh', T, 0.8, 0.2);
    D.sfx('bell', T + 1.3, N.E5, 0.05);
    cap(D, s, o.caption, T + 2.6, T + dur - 0.5, false, o.accent);
    const c = UI().mkCursor(D, cam, T, { x: 1720, y: 1010 });
    gsap.set(c.el, { opacity: 0 });
    tl.to(c.el, { opacity: 1, duration: 0.3 }, T + dur - 2.3);
    c.move(rest, T + dur - 2.3, 1.1);
    D.hide(s, T + dur);
    return dur;
  });

  // ------------------------------------------------------------------ SHOPLOGIN
  // Click "log in", type the e-mail and a masked password, spinner → check, and the
  // header greets the user.                                                    6 s
  shopRecipe('shoplogin', 6, (D, T, o) => {
    const { tl } = D;
    const S = D.cfg.shop, L = S.login || {}, dur = o.duration || 6;
    const { s, cam } = stage(D, 'shoplogin', storeHTML(S, { theme: 'light' }));
    const w = D.$('.sh-win', s);
    w.insertAdjacentHTML('beforeend', `<div class="sh-veil"></div><div class="sh-modal">
      <div class="sh-mh">${L.title || ''}</div><div class="sh-ms">${L.sub || ''}</div>
      <div class="sh-lab">${L.emailLabel || 'E-mail'}</div><div class="sh-in sh-email"><span class="v"></span><i class="sh-caret"></i></div>
      <div class="sh-lab">${L.passLabel || 'Password'}</div><div class="sh-in sh-pass"><span class="v"></span><i class="sh-caret"></i></div>
      ${BTN('sh-go', L.go || 'Log in')}
      <div class="sh-alt">${L.alt || ''}</div></div>`);
    const login = D.$('.sh-login', w), user = D.$('.sh-user', w), veil = D.$('.sh-veil', w), modal = D.$('.sh-modal', w);
    const email = D.$('.sh-email', w), pass = D.$('.sh-pass', w), go = D.$('.sh-go', w);
    const P = { login: center(D, login), email: center(D, email, -80, 2), pass: center(D, pass, -80, 2), go: center(D, go) };
    gsap.set(veil, { opacity: 0 });
    gsap.set(modal, { opacity: 0, y: 24, scale: 0.96 });

    D.show(s, T);
    D.setBg('#dcebf8', T);
    if (o.label) D.label(T, o.label);
    const c = UI().mkCursor(D, cam, T);
    let t = c.move(P.login, T + 0.2, 0.6);
    c.click(t + 0.05, login);
    tl.to(veil, { opacity: 1, duration: 0.3 }, t + 0.15);
    tl.to(modal, { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'expo.out' }, t + 0.15);
    D.sfx('whoosh', t + 0.15, 0.5, 0.12);
    t = c.move(P.email, t + 0.5, 0.45);
    c.click(t + 0.03, email);
    t = typeField(D, email, L.email || 'user@example.com', t + 0.15, { caretOff: t + 1.6 });
    t = c.move(P.pass, t + 0.1, 0.35);
    c.click(t + 0.03, pass);
    t = typeField(D, pass, L.password || '12345678', t + 0.12, { mask: true });
    t = c.move(P.go, t + 0.1, 0.4);
    c.click(t + 0.03, go);
    const ok = busy(D, go, t + 0.08, 0.6);
    tl.to(modal, { scale: 0.94, duration: 0.2, ease: 'power2.in' }, ok + 0.35);
    tl.to(modal, { opacity: 0, duration: 0.14, ease: 'power1.in' }, ok + 0.41);
    tl.to(veil, { opacity: 0, duration: 0.3 }, ok + 0.4);
    tl.to(login, { opacity: 0, duration: 0.2 }, ok + 0.5);
    D.hit(user, { opacity: 0, x: 16 }, { opacity: 1, x: 0, duration: 0.5, ease: 'back.out(2)' }, ok + 0.55);
    D.sfx('plip', ok + 0.55, 0.06, 1200);
    c.move({ x: P.login.x - 260, y: P.login.y + 360 }, ok + 0.6, 0.9);
    cap(D, s, o.caption, T + 1.2, T + dur - 0.5, false, o.accent);
    D.hide(s, T + dur);
    return dur;
  });

  // ------------------------------------------------------------------ SHOPTHEME
  // The toggle: the dark store opens as a circle from it.                     4 s
  shopRecipe('shoptheme', 4, (D, T, o) => {
    const { tl } = D;
    const S = D.cfg.shop, dur = o.duration || 4;
    const { s, cam } = stage(D, 'shoptheme', storeHTML(S, { theme: 'light', logged: true }) + storeHTML(S, { theme: 'dark', logged: true, dark: true }));
    const [wl, wd] = D.$$('.sh-win', s), bg = D.$('.sh-bg', s), dk = document.createElement('div');
    dk.className = 'sh-bg is-dark';
    dk.innerHTML = '<i class="sh-b1"></i><i class="sh-b2"></i><i class="sh-b3"></i>';
    bg.after(dk);
    gsap.set(dk, { opacity: 0 });
    const tg = D.$('.sh-toggle', wl), knob = D.$('.sh-knob', wl), P = center(D, tg), wb = D.box(wl), ox = P.x - wb.x, oy = P.y - wb.y;
    gsap.set(wd, { clipPath: `circle(0px at ${ox}px ${oy}px)` });

    D.show(s, T);
    if (o.label) D.label(T, o.label);
    const c = UI().mkCursor(D, cam, T);
    const t = c.move(P, T + 0.15, 0.7);
    c.click(t + 0.05, tg);
    tl.to(knob, { x: 34, duration: 0.3, ease: 'back.out(2)' }, t + 0.08);
    const tr = t + 0.22;
    tl.to(wd, { clipPath: `circle(${Math.hypot(1400, 740) + 60}px at ${ox}px ${oy}px)`, duration: 1.1, ease: 'power2.inOut' }, tr);
    tl.to(dk, { opacity: 1, duration: 1.1, ease: 'power2.inOut' }, tr);
    D.setBg('#0b1220', tr + 1.1);
    D.ink('#eef4ff', tr + 0.6);
    D.sfx('whoosh', tr, 1.1, 0.3);
    D.sfx('swell', tr, 1.4, 0.1);
    c.move({ x: P.x - 180, y: P.y + 260 }, tr + 0.5, 1.1);
    cap(D, s, o.caption, tr + 0.3, T + dur - 0.45, true, o.accent);
    D.hide(s, T + dur);
    return dur;
  });

  // ------------------------------------------------------------------ SHOPCART
  // Add products: each button confirms, a copy of the product flies into the cart
  // on an arc and the badge bumps.                                            6 s
  shopRecipe('shopcart', 6, (D, T, o) => {
    const { tl, N } = D;
    const S = D.cfg.shop, dur = o.duration || 6, n = o.count || 3;
    const { s, cam } = stage(D, 'shopcart', storeHTML(S, { theme: 'dark', logged: true, dark: true }), true);
    const w = D.$('.sh-win', s), cards = D.$$('.sh-card', w), cart = D.$('.sh-cart', w), badge = D.$('.sh-badge', w);
    const cartP = center(D, cart);
    gsap.set(badge, { scale: 0 });

    D.show(s, T);
    D.setBg('#0b1220', T);
    if (o.label) D.label(T, o.label);
    const c = UI().mkCursor(D, cam, T);
    let t = T + 0.25;
    for (let i = 0; i < n; i++) {
      const card = cards[i], btn = D.$('.sh-add', card), img = D.$('.sh-img', card), a = D.$('.sh-add-a', btn), b = D.$('.sh-add-b', btn);
      const P = center(D, btn), ib = D.box(img);
      t = c.move(P, t, i ? 0.45 : 0.6);
      c.click(t + 0.03, btn);
      tl.to(a, { opacity: 0, duration: 0.12 }, t + 0.06);
      tl.to(b, { opacity: 1, duration: 0.15 }, t + 0.08);
      tl.to(btn, { backgroundColor: '#12a150', duration: 0.2 }, t + 0.06);
      D.sfx('plip', t + 0.05, 0.07, 900 + i * 180);
      // the flyer: a copy of the product image, on an arc into the cart
      const fl = document.createElement('div');
      fl.className = 'sh-fly';
      fl.style.cssText = `left:${ib.x}px;top:${ib.y}px;width:${ib.w}px;height:${ib.h}px;background:${S.products[i].bg}`;
      fl.innerHTML = ART[S.products[i].art];
      cam.appendChild(fl);
      gsap.set(fl, { opacity: 0 });
      const dx = cartP.x - (ib.x + ib.w / 2), dy = cartP.y - (ib.y + ib.h / 2), fd = 0.75, tf = t + 0.12;
      tl.set(fl, { opacity: 1, x: 0, y: 0, scale: 1, rotation: 0 }, tf);
      tl.to(fl, { x: dx, duration: fd, ease: 'power1.in' }, tf);
      tl.to(fl, { keyframes: [{ y: Math.min(0, dy) - 160, duration: fd * 0.45, ease: 'power2.out' }, { y: dy, duration: fd * 0.55, ease: 'power2.in' }] }, tf);
      tl.to(fl, { scale: 0.12, rotation: 30, borderRadius: 60, duration: fd, ease: 'power2.in' }, tf);
      tl.set(fl, { opacity: 0 }, tf + fd);
      D.sfx('whoosh', tf, 0.6, 0.08);
      // landing: the badge bumps and counts
      const land = tf + fd;
      if (i === 0) tl.to(badge, { scale: 1, duration: 0.01 }, land);
      D.hit(badge, { scale: 1.6 }, { scale: 1, duration: 0.45, ease: 'back.out(3)' }, land);
      const K = { v: i };
      tl.to(K, { v: i + 1, duration: 0.01, onUpdate: () => { badge.textContent = String(Math.round(K.v)); } }, land);
      D.hit(cart, { y: -4 }, { y: 0, duration: 0.4, ease: 'back.out(3)' }, land);
      D.sfx('bell', land, [N.C5, N.E5, N.G5, N.C6][i % 4], 0.06);
      t += 1.05;
    }
    c.move({ x: cartP.x - 60, y: cartP.y + 150 }, t, 0.7);
    cap(D, s, o.caption, T + 1.0, T + dur - 0.5, true, o.accent);
    D.hide(s, T + dur);
    return dur;
  });

  // ------------------------------------------------------------------ SHOPCHECKOUT
  // The cart drawer: items, postcode → shipping, choose a payment method, pay
  // (spinner → check), confirmation and Bauhaus confetti.                     8 s
  shopRecipe('shopcheckout', 8, (D, T, o) => {
    const { tl, N } = D;
    const S = D.cfg.shop, K = S.checkout || {}, n = o.count || 3, dur = o.duration || 8;
    const items = S.products.slice(0, n);
    const { s, cam } = stage(D, 'shopcheckout', storeHTML(S, { theme: 'dark', logged: true, dark: true, cart: n, added: n }), true);
    const w = D.$('.sh-win', s);
    w.insertAdjacentHTML('beforeend', `<div class="sh-veil"></div><aside class="sh-drawer">
      <div class="sh-dh"><b>${K.title || 'Cart'}</b><span>${K.count ? K.count(n) : n}</span></div>
      <div class="sh-items">${items.map(p => `<div class="sh-item"><span class="sh-ith" style="background:${p.bg}">${ART[p.art]}</span><span class="sh-itx"><b>${p.name}</b><em>${K.unit || '1 u.'}</em></span><span class="sh-itp">${p.price}</span></div>`).join('')}</div>
      <div class="sh-ship"><div class="sh-lab">${K.shipLabel || ''}</div>
        <div class="sh-row"><div class="sh-in sh-cp"><span class="v"></span><i class="sh-caret"></i></div><span class="sh-btn2">${K.calc || 'OK'}</span></div>
        <div class="sh-shipres">${I.truck}<span><b>${K.shipTo || ''}</b><em>${K.shipSub || ''}</em></span><strong>${K.shipPrice || ''}</strong></div></div>
      <div class="sh-pay"><div class="sh-lab">${K.payLabel || ''}</div>${(K.methods || []).map(m => `<div class="sh-pm"><i class="sh-radio"><i></i></i><span class="sh-pmi">${I[m.icon] || I.card}</span><b>${m.name}</b><em>${m.sub || ''}</em></div>`).join('')}</div>
      <div class="sh-tot"><span>${K.totalLabel || 'Total'}</span><b>${K.total}</b></div>
      ${BTN('sh-paygo', `${K.payGo || 'Pay'} ${K.total}`)}
      <div class="sh-done"><svg viewBox="0 0 120 120" class="sh-ok"><circle cx="60" cy="60" r="54"/><path d="M36 62l16 16 32-36"/></svg><b>${K.doneTitle || ''}</b><span>${K.doneSub || ''}</span></div>
    </aside>`);
    const cart = D.$('.sh-cart', w), veil = D.$('.sh-veil', w), dr = D.$('.sh-drawer', w), rows = D.$$('.sh-dh, .sh-item, .sh-ship, .sh-pay, .sh-tot, .sh-paygo', dr);
    const cp = D.$('.sh-cp', dr), calc = D.$('.sh-btn2', dr), res = D.$('.sh-shipres', dr), pms = D.$$('.sh-pm', dr), pay = D.$('.sh-paygo', dr);
    const done = D.$('.sh-done', dr), okC = D.$('.sh-ok circle', dr), okP = D.$('.sh-ok path', dr), doneTx = D.$$('.sh-done b, .sh-done span', dr);
    const pick = pms[o.pick ?? 0], P = { cart: center(D, cart), cp: center(D, cp, -40, 2), calc: center(D, calc), pm: center(D, pick, -120, 0), pay: center(D, pay) };
    gsap.set(veil, { opacity: 0 });
    gsap.set(dr, { xPercent: 105 });
    gsap.set(rows, { opacity: 0, x: 30 });
    gsap.set(res, { opacity: 0, height: 0 });
    gsap.set(D.$$('.sh-radio i', dr), { scale: 0 });
    gsap.set(done, { opacity: 0 });
    gsap.set([okC, okP], { drawSVG: '0%' });
    gsap.set(doneTx, { opacity: 0, y: 14 });

    D.show(s, T);
    D.setBg('#0b1220', T);
    if (o.label) D.label(T, o.label);
    const c = UI().mkCursor(D, cam, T);
    let t = c.move(P.cart, T + 0.15, 0.55);
    c.click(t + 0.03, cart);
    tl.to(veil, { opacity: 1, duration: 0.3 }, t + 0.1);
    tl.to(dr, { xPercent: 0, duration: 0.6, ease: 'expo.out' }, t + 0.1);
    tl.to(rows, { opacity: 1, x: 0, duration: 0.5, ease: 'expo.out', stagger: 0.05 }, t + 0.3);
    D.sfx('whoosh', t + 0.1, 0.6, 0.15);
    t = c.move(P.cp, t + 0.7, 0.5);
    c.click(t + 0.03, cp);
    t = typeField(D, cp, K.postcode || '5000', t + 0.12);
    t = c.move(P.calc, t + 0.1, 0.35);
    c.click(t + 0.03, calc);
    tl.to(res, { opacity: 1, height: 50, duration: 0.45, ease: 'expo.out' }, t + 0.15);
    D.hit(D.$('svg', res), { x: -30 }, { x: 0, duration: 0.6, ease: 'expo.out' }, t + 0.2);
    D.sfx('plip', t + 0.15, 0.06, 1000);
    t = c.move(P.pm, t + 0.4, 0.5);
    c.click(t + 0.03, pick);
    D.hit(D.$('.sh-radio i', pick), { scale: 0 }, { scale: 1, duration: 0.3, ease: 'back.out(3)' }, t + 0.06);
    tl.to(pick, { borderColor: '#5aa9e6', backgroundColor: 'rgba(90,169,230,.12)', duration: 0.2 }, t + 0.06);
    t = c.move(P.pay, t + 0.3, 0.45);
    c.click(t + 0.03, pay);
    const ok = busy(D, pay, t + 0.08, 0.75);
    // confirmation
    const tc = ok + 0.3;
    tl.to(rows, { opacity: 0, duration: 0.25, stagger: 0.02 }, tc);
    tl.to(done, { opacity: 1, duration: 0.2 }, tc + 0.2);
    tl.to(okC, { drawSVG: '100%', duration: 0.5, ease: 'power2.inOut' }, tc + 0.25);
    tl.to(okP, { drawSVG: '100%', duration: 0.35, ease: 'power2.out' }, tc + 0.6);
    tl.to(doneTx, { opacity: 1, y: 0, duration: 0.5, ease: 'expo.out', stagger: 0.08 }, tc + 0.55);
    [N.C5, N.E5, N.G5, N.C6].forEach((f, i) => D.sfx('bell', tc + 0.3 + i * 0.07, f, 0.06));
    // Bauhaus confetti from the confirmation
    const from = center(D, dr, 0, -40), cols = ['#74acdf', '#f6b40e', '#e63922', '#1d4ed8', '#ffffff'];
    for (let i = 0; i < 46; i++) {
      const el = document.createElement('i'), k = i % 3, sz = 12 + D.rand() * 16;
      el.className = 'sh-conf';
      el.style.cssText = `left:${from.x - sz / 2}px;top:${from.y - sz / 2}px;width:${sz}px;height:${sz}px;background:${k === 2 ? 'none' : cols[i % 5]};border-radius:${k === 0 ? '50%' : '2px'};${k === 2 ? `border-left:${sz / 2}px solid transparent;border-right:${sz / 2}px solid transparent;border-bottom:${sz}px solid ${cols[i % 5]};width:0;height:0` : ''}`;
      cam.appendChild(el);
      gsap.set(el, { opacity: 0 });
      const ang = -Math.PI / 2 + (D.rand() - 0.5) * 2.4, sp = 260 + D.rand() * 420, px = Math.cos(ang) * sp, py = Math.sin(ang) * sp, at = tc + 0.3 + D.rand() * 0.08;
      tl.set(el, { opacity: 1, x: 0, y: 0, rotation: 0 }, at);
      tl.to(el, { x: px * 1.4, duration: 1.8, ease: 'power2.out' }, at);
      tl.to(el, { keyframes: [{ y: py, duration: 0.55, ease: 'power2.out' }, { y: py + 520, duration: 1.25, ease: 'power2.in' }] }, at);
      tl.to(el, { rotation: (D.rand() - 0.5) * 900, duration: 1.8, ease: 'none' }, at);
      tl.to(el, { opacity: 0, duration: 0.3 }, at + 1.5);
    }
    D.sfx('crash', tc + 0.3, 0.2);
    D.sfx('boom', tc + 0.3, 0.5);
    cap(D, s, o.caption, T + 1.2, T + dur - 0.5, true, o.accent);
    D.hide(s, T + dur);
    return dur;
  });

  // ------------------------------------------------------------------ SHOPUPLOAD
  // Admin: "new product", drag a photo from the desktop into the dropzone, type
  // name / price / stock, publish; a toast confirms and the new row slides in.   7 s
  shopRecipe('shopupload', 7, (D, T, o) => {
    const { tl, N } = D;
    const U = UI(), A = { ...(D.cfg.app || {}), ...(o.app || {}) }, M = o.product || {}, dur = o.duration || 7;
    const s = D.scene('shopupload', `<div class="sh-bg"><i class="sh-b1"></i><i class="sh-b2"></i><i class="sh-b3"></i></div><div class="sh-cam">${U.appHTML(A, { theme: 'light' })}
      <div class="sh-file"><div class="sh-fimg" style="background:${M.bg}">${ART[M.art] || ''}</div><span>${M.file || 'photo.png'}</span></div></div>`);
    const cam = D.$('.sh-cam', s), w = D.$('.ui-win', s), file = D.$('.sh-file', s);
    last = { s, cam };
    w.insertAdjacentHTML('beforeend', `<div class="ui-veil"></div><div class="sh-up" style="${vars(TH.light)}">
      <div class="sh-mh">${M.title || 'New product'}</div>
      <div class="sh-drop"><span class="sh-dropt">${I.upload}<span>${M.drop || 'Drop a photo'}</span></span><div class="sh-dimg" style="background:${M.bg}">${ART[M.art] || ''}</div></div>
      <div class="sh-lab">${M.nameLabel || 'Name'}</div><div class="sh-in sh-un"><span class="v"></span><i class="sh-caret"></i></div>
      <div class="sh-2"><div><div class="sh-lab">${M.priceLabel || 'Price'}</div><div class="sh-in sh-upr"><span class="v"></span><i class="sh-caret"></i></div></div><div><div class="sh-lab">${M.stockLabel || 'Stock'}</div><div class="sh-in sh-ust"><span class="v"></span><i class="sh-caret"></i></div></div></div>
      ${BTN('sh-pub', M.publish || 'Publish')}
    </div><div class="sh-toast"><span>✓</span><b>${M.toast || ''}</b></div>`);
    const newBtn = D.$('.ui-new', w), veil = D.$('.ui-veil', w), up = D.$('.sh-up', w), drop = D.$('.sh-drop', w), dimg = D.$('.sh-dimg', w), dropt = D.$('.sh-dropt', w);
    const un = D.$('.sh-un', w), upr = D.$('.sh-upr', w), ust = D.$('.sh-ust', w), pub = D.$('.sh-pub', w), toast = D.$('.sh-toast', w), selfRow = D.$('.ui-row.is-self', w);
    const P = { btn: center(D, newBtn), file: center(D, file, 0, -14), drop: center(D, drop), un: center(D, un, -60, 2), upr: center(D, upr, -30, 2), ust: center(D, ust, -20, 2), pub: center(D, pub) };
    gsap.set(veil, { opacity: 0 });
    gsap.set(up, { opacity: 0, y: 24, scale: 0.96 });
    gsap.set(dimg, { opacity: 0, scale: 0.6 });
    gsap.set(toast, { opacity: 0, y: -16 });
    gsap.set(file, { opacity: 0, x: -140 });

    D.show(s, T);
    D.setBg('#dcebf8', T);
    D.ink('#eef4ff', T) /* the HUD sits on the black letterbox: always light */;
    if (o.label) D.label(T, o.label);
    const c = U.mkCursor(D, cam, T);
    let t = c.move(P.btn, T + 0.15, 0.6);
    c.click(t + 0.03, newBtn);
    tl.to(veil, { opacity: 1, duration: 0.3 }, t + 0.1);
    tl.to(up, { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'expo.out' }, t + 0.1);
    tl.to(file, { opacity: 1, x: 0, duration: 0.6, ease: 'expo.out' }, t + 0.2);
    // drag the photo in
    t = c.move(P.file, t + 0.4, 0.5);
    tl.to(c.el, { scale: 0.88, duration: 0.1 }, t);
    tl.to(file, { scale: 1.06, rotation: -4, boxShadow: '0 30px 60px rgba(10,30,60,.35)', duration: 0.2 }, t);
    const dd = 0.7, dx = P.drop.x - P.file.x, dy = P.drop.y - P.file.y;
    c.move(P.drop, t + 0.15, dd);
    tl.to(file, { x: dx, duration: dd, ease: 'power2.inOut' }, t + 0.15);
    tl.to(file, { y: dy, duration: dd, ease: 'power3.inOut' }, t + 0.15);
    tl.to(drop, { borderColor: '#1f7bc6', backgroundColor: '#eef5fc', duration: 0.2 }, t + 0.15 + dd * 0.6);
    t += 0.15 + dd;
    tl.to(c.el, { scale: 1, duration: 0.15 }, t);
    tl.to(file, { opacity: 0, scale: 0.7, duration: 0.2 }, t);
    tl.to(dropt, { opacity: 0, duration: 0.15 }, t);
    tl.to(dimg, { opacity: 1, scale: 1, duration: 0.45, ease: 'back.out(2)' }, t + 0.05);
    D.sfx('plip', t, 0.07, 800);
    // fields
    const fast = o.typeSpeed ?? 0.045;
    t = c.move(P.un, t + 0.2, 0.35);
    c.click(t + 0.03, un);
    t = typeField(D, un, M.name || '', t + 0.08, { speed: fast });
    t = c.move(P.upr, t + 0.06, 0.28);
    c.click(t + 0.03, upr);
    t = typeField(D, upr, M.price || '', t + 0.08, { speed: fast });
    t = c.move(P.ust, t + 0.06, 0.25);
    c.click(t + 0.03, ust);
    t = typeField(D, ust, M.stock || '', t + 0.08, { speed: fast });
    t = c.move(P.pub, t + 0.08, 0.3);
    c.click(t + 0.03, pub);
    const ok = busy(D, pub, t + 0.08, 0.5);
    tl.to(up, { scale: 0.94, duration: 0.2, ease: 'power2.in' }, ok + 0.3);
    tl.to(up, { opacity: 0, duration: 0.14, ease: 'power1.in' }, ok + 0.36);
    tl.to(veil, { opacity: 0, duration: 0.3 }, ok + 0.35);
    tl.to(toast, { opacity: 1, y: 0, duration: 0.45, ease: 'expo.out' }, ok + 0.3);
    D.sfx('bell', ok + 0.3, N.E5, 0.06);
    if (selfRow) {
      tl.to(selfRow, { height: 56, opacity: 1, duration: 0.6, ease: 'expo.inOut' }, ok + 0.45);
      D.hit(selfRow, { backgroundColor: 'rgba(246,180,14,.22)' }, { backgroundColor: 'rgba(246,180,14,0)', duration: 1.6, ease: 'power2.out' }, ok + 0.9);
    }
    c.move({ x: 420, y: 640 }, ok + 0.5, 0.8);
    cap(D, s, o.caption, T + 1.0, T + dur - 0.5, false, o.accent);
    D.hide(s, T + dur);
    return dur;
  });

  // ------------------------------------------------------------------ SHOPSALES
  // Analytics: stats count up, the daily-sales area chart draws, payment-mix bars grow,
  // and the cursor scrubs the chart with a crosshair + tooltip.            6.5 s
  shopRecipe('shopsales', 6.5, (D, T, o) => {
    const { tl } = D;
    const A = o.analytics || {}, series = A.series || [], dur = o.duration || 6.5, th = TH.light;
    const fmt = A.format || (v => String(Math.round(v)));
    const CW = 852, CH = 360, PL = 70, PB = 36, PT = 14, max = A.max || Math.max(...series) * 1.15, ticks = A.ticks || [0, max / 2, max];
    const xOf = i => PL + (i / (series.length - 1)) * (CW - PL - 10), yOf = v => PT + (1 - v / max) * (CH - PT - PB);
    const line = 'M' + series.map((v, i) => `${xOf(i).toFixed(1)},${yOf(v).toFixed(1)}`).join('L');
    const area = line + `L${xOf(series.length - 1)},${yOf(0)}L${xOf(0)},${yOf(0)}Z`;
    const s = D.scene('shopsales', `<div class="sh-bg"><i class="sh-b1"></i><i class="sh-b2"></i><i class="sh-b3"></i></div><div class="sh-cam"><div class="sh-win sh-an" style="${vars(th)}">
      <div class="sh-chrome"><i></i><i></i><i></i><span>${A.window || ''}</span></div>
      <div class="sh-anh"><b>${A.title || ''}</b><span class="sh-chips">${(A.ranges || []).map((r, i) => `<i class="${i === (A.range ?? 1) ? 'is-on' : ''}">${r}</i>`).join('')}</span><span class="sh-demo">${A.demo || ''}</span></div>
      <div class="sh-stats">${(A.stats || []).map(x => `<div class="sh-stat"><span>${x.label}</span><b data-v="${x.value}">${x.format(0)}</b></div>`).join('')}</div>
      <div class="sh-anc"><div class="sh-ct">${A.chartTitle || ''}</div><div class="sh-cs">${A.chartSub || ''}</div>
        <div class="sh-cw"><svg class="sh-chart" viewBox="0 0 ${CW} ${CH}" width="${CW}" height="${CH}">
          <defs><linearGradient id="sh-ag" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="${th.accent}" stop-opacity=".28"/><stop offset="1" stop-color="${th.accent}" stop-opacity="0"/></linearGradient><clipPath id="sh-clip"><rect x="0" y="0" width="0" height="${CH}"/></clipPath></defs>
          ${ticks.map(v => `<line x1="${PL}" x2="${CW - 10}" y1="${yOf(v)}" y2="${yOf(v)}" stroke="${th.line}" stroke-width="1.5"/><text x="${PL - 12}" y="${yOf(v) + 5}" text-anchor="end" class="sh-tk">${A.tickFormat ? A.tickFormat(v) : v}</text>`).join('')}
          ${(A.xTicks || []).map(i => `<text x="${xOf(i)}" y="${CH - 8}" text-anchor="middle" class="sh-tk">${i + 1}</text>`).join('')}
          <path d="${area}" fill="url(#sh-ag)" clip-path="url(#sh-clip)"/>
          <path class="sh-line" d="${line}" fill="none" stroke="${th.accent}" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round"/>
          <line class="sh-xh" x1="0" x2="0" y1="${PT}" y2="${yOf(0)}" stroke="${th.ink}" stroke-opacity=".35" stroke-dasharray="4 5"/>
          <circle class="sh-dot" r="7" fill="${th.accent}" stroke="#fff" stroke-width="3"/>
        </svg>
        <div class="sh-tip"><em></em><b></b></div></div></div>
      <div class="sh-anr"><div class="sh-ct">${A.mixTitle || ''}</div><div class="sh-cs">${A.mixSub || ''}</div>
        ${(A.mix || []).map(([l, v]) => `<div class="sh-mx"><span>${l}</span><b>${v} %</b><i><i style="width:${v / Math.max(...A.mix.map(m => m[1])) * 100}%"></i></i></div>`).join('')}</div>
    </div></div>`);
    last = { s, cam: D.$('.sh-cam', s) };
    const cam = D.$('.sh-cam', s), w = D.$('.sh-win', s), ln = D.$('.sh-line', s), clipR = D.$('#sh-clip rect', s), xh = D.$('.sh-xh', s), dot = D.$('.sh-dot', s), tip = D.$('.sh-tip', s);
    const tipE = D.$('.sh-tip em', s), tipB = D.$('.sh-tip b', s), bars = D.$$('.sh-mx i i', s), stats = D.$$('.sh-stat b', s), svg = D.$('.sh-chart', s);
    const sb = D.box(svg), toStage = (x, y) => ({ x: sb.x + x, y: sb.y + y });
    gsap.set(w, { opacity: 0, y: 30, scale: 0.97 });
    gsap.set(ln, { drawSVG: '0%' });
    gsap.set([xh, dot, tip], { opacity: 0 });
    gsap.set(bars, { scaleX: 0, transformOrigin: '0% 50%' });

    D.show(s, T);
    D.setBg('#dcebf8', T);
    D.ink('#eef4ff', T) /* the HUD sits on the black letterbox: always light */;
    if (o.label) D.label(T, o.label);
    tl.to(w, { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: 'expo.out' }, T + 0.05);
    stats.forEach((b, i) => { const x = A.stats[i], P = { v: 0 }; tl.to(P, { v: x.value, duration: 1.3, ease: 'power3.out', onUpdate: () => { b.textContent = x.format(P.v); } }, T + 0.4 + i * 0.1); });
    const P = { p: 0 };
    tl.to(P, { p: 1, duration: 1.8, ease: 'power1.inOut', onUpdate: () => { gsap.set(ln, { drawSVG: `0% ${P.p * 100}%` }); clipR.setAttribute('width', PL + P.p * (CW - PL)); } }, T + 0.6);
    tl.to(bars, { scaleX: 1, duration: 0.8, ease: 'expo.out', stagger: 0.08 }, T + 0.9);
    for (let k = 0; k < 6; k++) D.sfx('tick', T + 0.6 + k * 0.3, 0.04);
    // hover scrub
    const i0 = A.hoverFrom ?? 6, i1 = A.hoverTo ?? series.length - 5, th0 = T + 2.7, hd = dur - 3.6;
    const c = UI().mkCursor(D, cam, T);
    const at = i => toStage(xOf(i), yOf(series[i]) - 26);
    c.move(at(i0), T + 1.7, 0.9);
    tl.to([xh, dot, tip], { opacity: 1, duration: 0.2 }, th0 - 0.1);
    const H = { i: i0 }, paint = () => {
      const f = H.i, a = Math.floor(f), b = Math.min(series.length - 1, a + 1), u = f - a, v = series[a] + (series[b] - series[a]) * u, x = xOf(f), y = yOf(v);
      xh.setAttribute('x1', x); xh.setAttribute('x2', x); dot.setAttribute('cx', x); dot.setAttribute('cy', y);
      const k = Math.round(f);
      tipE.textContent = A.dayLabel ? A.dayLabel(k) : `#${k + 1}`;
      tipB.textContent = fmt(series[k]);
      tip.style.left = x + 'px'; tip.style.top = y + 'px';
    };
    paint();
    tl.to(H, { i: i1, duration: hd, ease: 'sine.inOut', onUpdate: paint }, th0);
    // the cursor follows the line (sampled, so it rides the curve)
    const steps = 8;
    for (let k = 1; k <= steps; k++) { const f = i0 + ((i1 - i0) * k) / steps, idx = Math.round(f); tl.to(c.el, { x: at(idx).x, y: at(idx).y, duration: hd / steps, ease: 'none' }, th0 + ((k - 1) * hd) / steps); }
    cap(D, s, o.caption, T + 1.4, T + dur - 0.5, false, o.accent);
    D.hide(s, T + dur);
    return dur;
  });

  // ------------------------------------------------------------------ SHOPFINALE
  // The brand slams letter by letter through colour cuts; a giant cursor clicks it —
  // shockwave, flash — and the line lands. The letterbox closes.            5.5 s
  shopRecipe('shopfinale', 5.5, (D, T, o) => {
    const { tl, C, N } = D;
    const dur = o.duration || 5.5, cuts = o.colors || ['#0f1b2d', '#f6b40e', '#e63922', '#1d4ed8', '#74acdf'];
    const s = D.scene('shopfinale', `<svg class="sf-ring" viewBox="-100 -100 200 200"><circle r="60"/></svg>
      <div class="sf-word v c">${o.title || 'ECOMMERCE'}</div>
      <div class="sf-sub v c">${o.subtitle || ''}</div>
      <div class="sf-cursor"><svg viewBox="0 0 30 42"><path d="M3 3v29l7.3-6.8 5 11.6 5.1-2.1-5-11.4H25z" fill="#0b0b12" stroke="#fff" stroke-width="2.2" stroke-linejoin="round"/></svg></div>`);
    const word = D.fit(D.$('.sf-word', s), 1640), sub = D.$('.sf-sub', s), ring = D.$('.sf-ring', s), cur = D.$('.sf-cursor', s);
    const ch = D.split(word, { type: 'chars' }), sc = D.split(sub, { type: 'chars', mask: 'chars' });
    gsap.set(ch.chars, { opacity: 0, scale: 1.8, yPercent: -20 });
    gsap.set(sc.chars, { yPercent: 115 });
    gsap.set(ring, { scale: 0, opacity: 0 });
    const wb = D.box(word), hitP = { x: wb.x + wb.w * 0.62, y: wb.y + wb.h * 0.55 };
    gsap.set(cur, { x: 1980, y: 1180, scale: 3.2, transformOrigin: '3px 3px' });

    D.show(s, T);
    D.setBg(cuts[0], T);
    D.ink(D.contrast(cuts[0]), T);
    if (o.label) D.label(T, o.label);
    tl.to(ch.chars, { opacity: 1, scale: 1, yPercent: 0, duration: 0.45, ease: 'expo.out', stagger: 0.05 }, T + 0.05);
    ch.chars.forEach((c, i) => { if (i % 2 === 0) D.sfx('key', T + 0.05 + i * 0.05, 0.2); });
    D.sfx('braam', T + 0.05, 0.6);
    // colour cuts on the beat; the word flips ink/paper to stay readable
    cuts.slice(1).forEach((bg, i) => {
      const at = T + 0.75 + i * 0.5;
      D.setBg(bg, at);
      tl.set(word, { color: D.contrast(bg) }, at);
      tl.set(word, { '--wd': [125, 80, 125, 100][i % 4] }, at);
      D.sfx('clap', at, 0.2);
    });
    tl.set(word, { textShadow: D.chroma(10) }, T + 0.75);
    tl.to(word, { textShadow: D.chroma(0), duration: 1.6, ease: 'power2.out' }, T + 0.8);
    // the click
    const tc = T + 3.0;
    tl.to(cur, { x: hitP.x, duration: 0.85, ease: 'power2.inOut' }, tc - 0.9);
    tl.to(cur, { y: hitP.y, duration: 0.85, ease: 'power3.inOut' }, tc - 0.9);
    tl.to(cur, { scale: 2.6, duration: 0.07 }, tc);
    tl.to(cur, { scale: 3.2, duration: 0.25, ease: 'back.out(3)' }, tc + 0.07);
    gsap.set(ring, { x: hitP.x - D.CX, y: hitP.y - D.CY });
    D.hit(ring, { scale: 0.1, opacity: 1 }, { scale: 9, opacity: 0, duration: 1.1, ease: 'power2.out' }, tc);
    D.hit(word, { scaleY: 0.86, scaleX: 1.05 }, { scaleY: 1, scaleX: 1, duration: 0.6, ease: 'elastic.out(1, 0.4)' }, tc);
    D.flash(tc, 0.35, 0.5);
    D.shake(tc, 0.35, 8);
    D.sfx('key', tc, 0.35);
    D.sfx('boom', tc, 0.9);
    [N.C5, N.E5, N.G5, N.C6].forEach(f => D.sfx('bell', tc + 0.05, f, 0.07));
    tl.to(sc.chars, { yPercent: 0, duration: 0.8, ease: 'expo.out', stagger: 0.035 }, tc + 0.15);
    tl.to(cur, { x: 2100, y: 1250, duration: 0.8, ease: 'power2.in' }, tc + 0.6);
    // close
    D.call(() => SFX.pad('title', [110, 138.59, 164.81, 220], 1, 0.05, 900), tc);
    D.barsTo(540, T + dur - 0.95, 0.9);
    D.call(() => SFX.padStop('title', 1.5), T + dur - 0.9);
    D.sfx('boom', T + dur - 0.1, 0.5);
    D.hide(s, T + dur);
    return dur;
  });

  // ------------------------------------------------------------------ CLICKOPEN
  // Cold open: a question types itself in the dark, the cursor glides onto one small
  // button and clicks it — rings, a flash, and the button's colour floods the frame.   4 s
  recipe('clickopen', (D, T, o) => {
    const { tl } = D;
    const dur = o.duration || 4, lines = o.lines || ['what if…', '…it was one click?'], col = o.color || '#74acdf', tc = T + (o.clickAt ?? 2.9);
    const s = D.scene('clickopen', `<div class="co-grid"></div>
      <div class="co-lines">${lines.map(() => '<div class="co-l"><span class="v"></span><i class="co-caret"></i></div>').join('')}</div>
      <div class="co-btn" style="background:${col}"></div>
      <svg class="co-rings" viewBox="-100 -100 200 200">${[0, 1, 2].map(() => `<circle r="40" stroke="${col}"/>`).join('')}</svg>
      <div class="co-fill" style="background:${col}"></div>
      <div class="sf-cursor">${ARROW}</div>`);
    const U = UI(), ls = D.$$('.co-l', s), btn = D.$('.co-btn', s), rings = D.$$('.co-rings circle', s), fill = D.$('.co-fill', s), cur = D.$('.sf-cursor', s), grid = D.$('.co-grid', s);
    gsap.set(cur, { x: 1760, y: 1040, scale: 1.8, transformOrigin: '3px 3px' });
    gsap.set(btn, { scale: 0 });
    gsap.set(rings, { opacity: 0, transformOrigin: '50% 50%' });
    gsap.set(fill, { scale: 0 });
    gsap.set(grid, { opacity: 0 });

    D.show(s, T);
    D.setBg(o.bg || '#05070d', T);
    D.ink('#eef4ff', T);
    tl.set(D.bars, { height: 540 }, T);
    D.barsTo(96, T + 0.05, 1.3);
    if (o.label) D.label(T + 0.4, o.label);
    tl.to(grid, { opacity: 1, duration: 1.2 }, T + 0.2);
    D.sfx('swell', T + 0.1, 2.6, 0.12);
    // the question
    let t = T + 0.45;
    ls.forEach((l, i) => {
      const v = l.querySelector('.v'), c = l.querySelector('.co-caret');
      gsap.set(c, { opacity: 0 });
      tl.set(c, { opacity: 1 }, t - 0.05);
      t = U.typeInto(D, v, fastSeq(D, lines[i], o.speed ?? 0.034), t);
      tl.set(c, { opacity: 0 }, i < ls.length - 1 ? t + 0.1 : tc);
      t += 0.18;
    });
    // the button, the cursor
    tl.to(btn, { scale: 1, duration: 0.5, ease: 'back.out(3)' }, T + 0.8);
    tl.to(cur, { x: 966, duration: 1.4, ease: 'power3.out' }, T + 0.9);
    tl.to(cur, { y: 606, duration: 1.4, ease: 'power2.out' }, T + 0.9);
    D.sfx('whoosh', T + 0.9, 1.1, 0.12);
    D.sfx('riser', T + 1.1, tc - T - 1.1, 0.2);
    tl.to(btn, { scale: 1.35, boxShadow: '0 0 0 14px rgba(116,172,223,.18), 0 0 60px rgba(116,172,223,.7)', duration: 0.35, ease: 'back.out(3)' }, T + 2.3);
    // the click
    tl.to(cur, { scale: 1.5, duration: 0.07 }, tc);
    tl.to(cur, { scale: 1.8, duration: 0.22, ease: 'back.out(3)' }, tc + 0.07);
    D.hit(btn, { scale: 0.85 }, { scale: 1.2, duration: 0.25, ease: 'back.out(3)' }, tc);
    rings.forEach((r, i) => D.hit(r, { opacity: 1, scale: 0.3 }, { opacity: 0, scale: 7 + i * 3, duration: 0.9, ease: 'power2.out' }, tc + i * 0.07));
    tl.set(fill, { scale: 0 }, tc + 0.1);
    tl.to(fill, { scale: 120, duration: 0.8, ease: 'expo.in' }, tc + 0.1);
    tl.to(ls, { opacity: 0, duration: 0.25 }, tc + 0.1);
    tl.to(cur, { opacity: 0, duration: 0.2 }, tc + 0.55);
    D.flash(tc, 0.25, 0.4);
    D.shake(tc, 0.3, 6);
    D.sfx('key', tc, 0.45);
    D.sfx('boom', tc, 0.7);
    D.hide(s, T + dur);
    return dur;
  });

  // ------------------------------------------------------------------ REMIXTITLE
  // The drop: the brand slams with a chromatic split, the background cuts on every beat,
  // ghost echoes and bouncing letters make it "remix", a stamp lands, then it zooms through.   4 s
  recipe('remixtitle', (D, T, o) => {
    const { tl } = D;
    const dur = o.duration || 4, word = o.title || D.cfg.meta.title, cuts = o.colors || ['#0f1b2d', '#74acdf', '#f6b40e', '#e63922', '#1d4ed8', '#ffffff'];
    const s = D.scene('remixtitle', `<div class="rt-echo v c">${word}</div><div class="rt-echo v c">${word}</div>
      <div class="rt-word v c">${word}</div>
      <div class="rt-stamp"><span class="v">${o.stamp || 'REMIX'}</span></div>`);
    const w = D.fit(D.$('.rt-word', s), o.maxWidth || 1640), echoes = D.$$('.rt-echo', s), stamp = D.$('.rt-stamp', s);
    echoes.forEach(e => { e.style.fontSize = w.style.fontSize; });
    const b = D.box(w);
    Object.assign(stamp.style, { left: b.x + b.w - 360 + 'px', top: b.y + b.h - 30 + 'px' });
    const ch = D.split(w, { type: 'chars' }).chars;
    gsap.set(echoes, { opacity: 0 });
    gsap.set(stamp, { opacity: 0 });

    D.show(s, T);
    D.setBg(cuts[0], T);
    tl.set(w, { color: D.contrast(cuts[0]) }, T);
    tl.to(D.hud, { autoAlpha: 1, duration: 0.3 }, T + 0.1);
    if (o.label) D.label(T + 0.1, o.label);
    D.hit(w, { scale: 1.45, opacity: 0, textShadow: D.chroma(18) }, { scale: 1, opacity: 1, textShadow: D.chroma(0), duration: 0.55, ease: 'expo.out' }, T);
    D.flash(T, 0.5, 0.5);
    D.shake(T, 0.45, 14);
    D.sfx('braam', T, 0.8);
    D.sfx('boom', T, 0.9);
    const beats = Math.floor((dur - 0.6) / 0.5);
    for (let i = 1; i <= beats; i++) {
      const at = T + i * 0.5, bg = cuts[i % cuts.length];
      D.setBg(bg, at);
      tl.set(w, { color: D.contrast(bg), '--wd': [125, 88, 125, 104, 125, 94][i % 6] }, at);
      echoes.forEach((e, j) => {
        tl.set(e, { color: cuts[(i + 1 + j) % cuts.length], '--wd': [125, 88, 125, 104, 125, 94][i % 6] }, at);
        D.hit(e, { opacity: 0.6, x: (j ? -1 : 1) * 38, y: (j ? 1 : -1) * 14 }, { opacity: 0, x: 0, y: 0, duration: 0.42, ease: 'power2.out' }, at);
      });
      D.hit(ch.filter((c, k) => k % 2 === i % 2), { yPercent: -16 }, { yPercent: 0, duration: 0.34, ease: 'bounce.out' }, at);
    }
    D.hit(stamp, { opacity: 1, scale: 3, rotation: -34 }, { scale: 1, rotation: -8, duration: 0.45, ease: 'back.out(2.2)' }, T + 1.0);
    D.shake(T + 1.05, 0.25, 8);
    D.sfx('clap', T + 1.0, 0.4);
    D.sfx('boom', T + 1.0, 0.45);
    // zoom through
    const to = T + dur - 0.55;
    tl.to([w, ...echoes], { scale: 5, opacity: 0, filter: 'blur(12px)', duration: 0.5, ease: 'expo.in' }, to);
    tl.to(stamp, { scale: 3, opacity: 0, duration: 0.4, ease: 'expo.in' }, to);
    D.sfx('whoosh', to, 0.5, 0.3);
    D.flash(T + dur - 0.06, 0.3, 0.35);
    D.hide(s, T + dur);
    return dur;
  });

  // ------------------------------------------------------------------ SLAM
  // Full-frame words, one per beat: a hard colour cut, the word skew-slides in, a Bauhaus
  // shape pops behind it.                                                  words × beat
  recipe('slam', (D, T, o) => {
    const { tl } = D;
    const words = o.words || [], beat = o.beat || 0.5, dur = words.length * beat;
    const s = D.scene('slam', words.map(x => `<div class="sl-card" style="background:${x.bg}">${x.shape ? `<i class="sl-shape sl-${x.shape}" style="${x.shape === 'triangle' ? `border-bottom-color:${x.sc}` : `background:${x.sc}`}"></i>` : ''}<div class="sl-word v c" style="color:${x.fg || D.contrast(x.bg)}">${x.text}</div></div>`).join(''));
    const cards = D.$$('.sl-card', s);
    cards.forEach(c => D.fit(c.querySelector('.sl-word'), o.maxWidth || 1600));
    gsap.set(cards, { autoAlpha: 0 });
    D.show(s, T);
    if (o.label) D.label(T, o.label);
    cards.forEach((c, i) => {
      const at = T + i * beat, wd = c.querySelector('.sl-word'), sh = c.querySelector('.sl-shape');
      tl.set(c, { autoAlpha: 1 }, at);
      if (i) tl.set(cards[i - 1], { autoAlpha: 0 }, at);
      D.setBg(words[i].bg, at);
      D.hit(wd, { x: i % 2 ? 120 : -120, skewX: i % 2 ? -14 : 14, scale: 1.12 }, { x: 0, skewX: 0, scale: 1, duration: 0.24, ease: 'expo.out' }, at);
      if (sh) D.hit(sh, { scale: 0, rotation: -60 }, { scale: 1, rotation: 0, duration: 0.45, ease: 'back.out(2)' }, at);
      D.sfx('kick', at, 0.5);
      D.sfx('whoosh', at, 0.25, 0.12);
    });
    D.hide(s, T + dur);
    return dur;
  });

  // ------------------------------------------------------------------ STATPUNCH
  // One number per step: a colour cut, the figure slams and counts up, its label, optional
  // chips (a list) and a source note. Use REAL figures only.              stats × step
  recipe('statpunch', (D, T, o) => {
    const { tl, N } = D;
    const stats = o.stats || [], step = o.step || 1, dur = stats.length * step;
    const fmt = (st, v) => (st.format ? st.format(v) : String(Math.round(v)));
    const s = D.scene('statpunch', stats.map(st => `<div class="sp-card" style="background:${st.bg};color:${st.fg || D.contrast(st.bg)}">
        <div class="sp-num v">${fmt(st, 0)}</div>
        <div class="sp-lab mono">${st.label}</div>
        ${st.list ? `<div class="sp-list">${st.list.map(x => `<span class="mono">${x}</span>`).join('')}</div>` : ''}
        ${st.note ? `<div class="sp-note mono">${st.note}</div>` : ''}
      </div>`).join(''));
    const cards = D.$$('.sp-card', s);
    gsap.set(cards, { autoAlpha: 0 });
    D.show(s, T);
    if (o.label) D.label(T, o.label);
    cards.forEach((c, i) => {
      const st = stats[i], at = T + i * step, num = c.querySelector('.sp-num'), lab = c.querySelector('.sp-lab'), items = [...c.querySelectorAll('.sp-list span')], note = c.querySelector('.sp-note');
      tl.set(c, { autoAlpha: 1 }, at);
      if (i) tl.set(cards[i - 1], { autoAlpha: 0 }, at);
      D.setBg(st.bg, at);
      D.hit(num, { scale: 1.35, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.35, ease: 'expo.out' }, at);
      const P = { v: 0 };
      tl.to(P, { v: st.value, duration: Math.min(0.55, step * 0.55), ease: 'expo.out', onUpdate: () => { num.textContent = fmt(st, P.v); } }, at);
      D.hit(lab, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.35, ease: 'expo.out' }, at + 0.12);
      items.forEach((it, j) => D.hit(it, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.25, ease: 'expo.out' }, at + 0.2 + j * 0.07));
      if (note) D.hit(note, { opacity: 0 }, { opacity: 0.75, duration: 0.3 }, at + 0.25);
      D.sfx('kick', at, 0.55);
      D.sfx('bell', at + 0.3, [N.A4, N.C5, N.E5, N.A5][i % 4], 0.05);
    });
    D.hide(s, T + dur);
    return dur;
  });

  Trailer.shop = { TH, ART, I, LOGO, ARROW, storeHTML, typeField, busy, cap, fastSeq, shopRecipe };
})();
