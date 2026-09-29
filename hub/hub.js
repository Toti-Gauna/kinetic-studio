/* Trailer Hub — renders hub/catalog.js: a featured trailer with a live, silent hover preview
   (the real trailer running in embed mode, driven by postMessage) and a filterable library. */
(() => {
  'use strict';

  const catalog = window.HUB_CATALOG || [];
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  // ?still skips the entrance animation (deterministic screenshots / tests); reduced-motion users get it too
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches || new URLSearchParams(location.search).has('still');

  const STATUS = { kit: 'LISTO CON EL KIT', recetas: 'RECETAS NUEVAS', tech: 'TECNOLOGÍA NUEVA' };
  const num = it => String(catalog.indexOf(it) + 1).padStart(2, '0');
  const fmtDur = s => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  const { textOn, MOTIFS } = window.HUB_ART; // hub/motifs.js

  // ---------------------------------------------------------------- library
  const grid = $('#grid'), filters = $('#filters');
  grid.innerHTML = catalog.map(it => {
    const [p0, p1, p2] = it.palette, fg = textOn(p0);
    const motif = (MOTIFS[it.motif] || MOTIFS.shapes)({ a: p1, b: p2, fg });
    const state = it.enabled ? 'disponible' : 'próximamente';
    return `<li data-cat="${esc(it.category)}">
      <button class="card ${it.enabled ? 'is-ready' : 'is-locked'}" data-id="${it.id}" style="--p0:${p0};--p1:${p1}" aria-label="${esc(it.title)}, ${state}. ${esc(it.logline)}">
        <div class="poster" style="color:${fg}">
          <svg class="motif" viewBox="0 0 160 90" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${motif}</svg>
          <span class="p-num mono">${num(it)}</span>
          <span class="p-badge mono ${it.enabled ? 'ready' : ''}">${it.enabled ? '▶ DISPONIBLE' : 'PRÓXIMAMENTE'}</span>
          <span class="p-word v">${esc(it.title)}</span>
        </div>
        <div class="card-body">
          <div class="card-top mono"><span><i class="st st-${it.status}"></i>${esc(it.category)}</span><span>${it.enabled ? fmtDur(it.duration) : STATUS[it.status]}</span></div>
          <p class="logline">${esc(it.logline)}</p>
          <p class="card-tags">${it.tags.map(esc).join(' · ')}</p>
        </div>
      </button>
    </li>`;
  }).join('');

  const ready = catalog.filter(it => it.enabled);
  $('#count-ready').textContent = String(ready.length).padStart(2, '0');
  $('#count-soon').textContent = String(catalog.length - ready.length).padStart(2, '0');
  $('#lib-count').textContent = `— ${catalog.length} TRÁILERS`;

  const cats = ['Todos', ...new Set(catalog.map(it => it.category))];
  filters.innerHTML = cats.map((c, i) => `<button type="button" data-cat="${esc(c)}" aria-pressed="${i === 0}">${esc(c)}</button>`).join('');
  filters.addEventListener('click', e => {
    const btn = e.target.closest('button');
    if (!btn) return;
    $$('button', filters).forEach(b => b.setAttribute('aria-pressed', String(b === btn)));
    const cat = btn.dataset.cat;
    const shown = [];
    $$('li', grid).forEach(li => { li.hidden = cat !== 'Todos' && li.dataset.cat !== cat; if (!li.hidden) shown.push(li); });
    fitPosters();
    if (!reduceMotion) gsap.fromTo(shown, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.6, ease: 'expo.out', stagger: 0.035 });
  });

  // ---------------------------------------------------------------- toast
  const toast = $('#toast');
  let toastTimer;
  function say(msg) {
    toast.textContent = msg;
    gsap.to(toast, { opacity: 1, y: 0, duration: 0.45, ease: 'expo.out' });
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => gsap.to(toast, { opacity: 0, y: 20, duration: 0.35, ease: 'power2.in' }), 3200);
  }

  // ---------------------------------------------------------------- featured trailer + live preview
  const screen = $('#screen'), frame = $('#preview'), cta = $('#f-cta');
  let current = null, previewReady = false;

  // shrink a one-line title until it fits its column (titles vary a lot in length)
  function fitTitle() {
    const el = $('#f-title');
    el.style.fontSize = '';
    const max = el.parentElement.clientWidth, w = el.scrollWidth;
    if (w > max) el.style.fontSize = (parseFloat(getComputedStyle(el).fontSize) * max / w).toFixed(1) + 'px';
  }
  // same for every poster word inside its card
  function fitPosters() {
    $$('.p-word', grid).forEach(el => {
      el.style.fontSize = '';
      const max = el.parentElement.clientWidth - 24, w = el.scrollWidth;
      if (max > 0 && w > max) el.style.fontSize = (parseFloat(getComputedStyle(el).fontSize) * max / w).toFixed(1) + 'px';
    });
  }
  const refit = () => { fitTitle(); fitPosters(); };
  addEventListener('resize', refit);
  document.fonts.ready.then(refit);

  function feature(it) {
    current = it;
    previewReady = false;
    screen.classList.remove('is-ready');
    frame.src = `${it.path}?embed&t=${it.poster}`;
    screen.href = cta.href = it.path;
    $('#f-kicker').textContent = `${num(it)} — ${it.category.toUpperCase()}`;
    $('#f-title').textContent = it.title;
    fitTitle();
    $('#f-logline').textContent = it.logline;
    $('#f-meta').innerHTML = `<dt>DURACIÓN</dt><dd>${fmtDur(it.duration)}</dd><dt>ESCENAS</dt><dd>${it.scenes}</dd><dt>ESTADO</dt><dd>DISPONIBLE</dd>`;
    $('#f-tags').innerHTML = it.tags.map(t => `<li>${esc(t)}</li>`).join('');
    $$('.card', grid).forEach(c => c.classList.toggle('is-selected', c.dataset.id === it.id));
  }

  addEventListener('message', e => {
    if (e.source !== frame.contentWindow || !e.data || e.data.type !== 'trailer:ready') return;
    previewReady = true;
    screen.classList.add('is-ready');
  });
  const send = msg => { if (previewReady) frame.contentWindow.postMessage(msg, '*'); };
  screen.addEventListener('mouseenter', () => send({ type: 'trailer:play', t: current.preview }));
  screen.addEventListener('mouseleave', () => send({ type: 'trailer:seek', t: current.poster }));

  grid.addEventListener('click', e => {
    const card = e.target.closest('.card');
    if (!card) return;
    const it = catalog.find(x => x.id === card.dataset.id);
    if (!it.enabled) {
      if (!reduceMotion) gsap.fromTo(card, { x: -6 }, { x: 0, duration: 0.5, ease: 'elastic.out(1.2, 0.3)' });
      say(`«${it.title}» todavía está en producción · pedíselo al agente trailer-director`);
      return;
    }
    if (current !== it) feature(it);
    $('#feature').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
  });

  if (ready.length) feature(ready[0]);

  // ---------------------------------------------------------------- film grain (generated, no image files)
  (() => {
    const c = document.createElement('canvas');
    c.width = c.height = 200;
    const x = c.getContext('2d'), img = x.createImageData(200, 200);
    for (let i = 0; i < img.data.length; i += 4) { const v = Math.random() * 255; img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255; }
    x.putImageData(img, 0, 0);
    $('#grain').style.backgroundImage = `url(${c.toDataURL()})`;
  })();

  // ---------------------------------------------------------------- entrance
  const parts = '.top, .intro, .feature, .library, .foot';
  if (reduceMotion) return;
  gsap.set(parts, { autoAlpha: 0 });
  document.fonts.ready.then(() => {
    gsap.set(parts, { autoAlpha: 1 });
    const title = SplitText.create('#hub-title', { type: 'chars', mask: 'chars' });
    gsap.timeline({ defaults: { ease: 'expo.out' } })
      .from('.top', { y: -16, opacity: 0, duration: 1 })
      .from('.eyebrow', { y: 12, opacity: 0, duration: 0.8 }, 0.1)
      .from(title.chars, { yPercent: 115, duration: 1.2, stagger: 0.035 }, 0.15)
      .fromTo('#hub-title', { '--wd': 62, '--wg': 300 }, { '--wd': 125, '--wg': 900, duration: 1.6, ease: 'expo.inOut' }, 0.2)
      .from('.lede', { y: 16, opacity: 0, duration: 1 }, 0.7)
      .fromTo('.screen', { clipPath: 'inset(0% 100% 0% 0% round 14px)' }, { clipPath: 'inset(0% 0% 0% 0% round 14px)', duration: 1.4, ease: 'expo.inOut', clearProps: 'clipPath' }, 0.55)
      .from('.info > *', { y: 24, opacity: 0, duration: 1, stagger: 0.06 }, 0.95)
      .from('.lib-head, .legend', { y: 20, opacity: 0, duration: 0.8 }, 1.15)
      .from('.grid > li', { y: 40, opacity: 0, duration: 1, stagger: 0.035 }, 1.25)
      .from('.foot', { opacity: 0, duration: 0.8 }, 1.6);
  });
})();
