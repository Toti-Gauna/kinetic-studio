/* ============================================================================
   DEV MODULE — developer films: terminal, code editor, deploy pipeline, a treemap
   of files, and a monospace title. GitHub-dark look, JetBrains Mono.
   · terminal: commands typed with human rhythm, output streaming line by line,
     scrolling when it overflows, a caret that blinks on the timeline;
   · code: a real excerpt with its real line numbers, syntax-highlighted by a tiny
     JS tokenizer; some lines are typed live (auto-indent, autocomplete bursts),
     with the caret, active line, Ln/Col status bar, a minimap and an inline value;
   · pipeline: stages (spinner → check) + a row per job with its own progress bar;
   · treemap: squarified, area ∝ value, grouped colours with a legend;
   · devtitle: a word typed in huge mono, each letter "compiling" through symbols,
     and an ASCII progress bar.
   Rule: show REAL output and REAL code (inject them with a script), never invented logs.
   Recipes: terminal, code, pipeline, treemap, devtitle.
   ========================================================================== */
(() => {
  'use strict';
  const { recipe } = Trailer;
  const WIN = { x: 260, y: 116, w: 1400, h: 740 };
  const GH = { bg: '#0d1117', panel: '#161b22', line: '#30363d', ink: '#e6edf3', muted: '#8b949e', green: '#3fb950', blue: '#58a6ff', purple: '#d2a8ff', red: '#ff7b72', orange: '#ffa657', cyan: '#79c0ff', str: '#a5d6ff', yellow: '#e3b341' };
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const SYMS = '{}[]()<>/\\=+*#%$&;:~^|01';

  // ------------------------------------------------------------------ JS TOKENIZER
  const KW = new Set('const let var function return if else for while do new this true false null undefined of in typeof instanceof async await class extends import export from default switch case break continue try catch finally throw yield delete void'.split(' '));
  /** One line of JS → [[text, class]]: c comment · s string · n number/CONSTANT · k keyword · o operator · f function · p property */
  function tokenize(line) {
    const out = [], re = /(\/\/.*$|\/\*.*?\*\/)|('(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"|`(?:\\.|[^`\\])*`)|(\b\d+(?:\.\d+)?(?:e-?\d+)?\b)|([A-Za-z_$][\w$]*)|(\s+)|(=>|\*\*|[=+\-*/<>!?:%&|^~]+)|([^\s])/g;
    let m;
    while ((m = re.exec(line))) {
      const [tok, com, str, num, id, , op] = m;
      let c = '';
      if (com) c = 'c';
      else if (str) c = 's';
      else if (num) c = 'n';
      else if (id) c = KW.has(id) ? 'k' : /^\s*\(/.test(line.slice(re.lastIndex)) ? 'f' : line[m.index - 1] === '.' ? 'p' : /^[A-Z][A-Z0-9_]+$/.test(id) ? 'n' : '';
      else if (op) c = 'o';
      out.push([tok, c]);
    }
    return out;
  }
  /** The first n characters of a tokenized line, as highlighted HTML. */
  function prefixHTML(toks, n) {
    let html = '', left = n;
    for (const [t, c] of toks) {
      if (left <= 0) break;
      const part = t.slice(0, left);
      left -= part.length;
      html += c ? `<span class="tk-${c}">${esc(part)}</span>` : esc(part);
    }
    return html;
  }

  // ------------------------------------------------------------------ KEYS · CARET · CAPTION
  /** Keystroke schedule for a string: jitter, longer after spaces, instant auto-indent,
   *  and (o.complete) long identifiers that finish in one burst after 3 letters. */
  function keys(D, text, o = {}) {
    const base = o.base ?? 0.045, jit = o.jitter ?? 0.06, st = [{ t: 0, n: 0 }];
    let t = 0, i = 0;
    const lead = o.indent ? text.match(/^\s*/)[0].length : 0;
    if (lead) { t += 0.04; i = lead; st.push({ t, n: i, silent: true }); }
    while (i < text.length) {
      const word = /^[A-Za-z_$][\w$]*/.exec(text.slice(i));
      if (o.complete && word && word[0].length >= 7 && (i === 0 || !/[\w$]/.test(text[i - 1]))) {
        for (let k = 0; k < 3; k++) { t += base + D.rand() * jit; i++; st.push({ t, n: i }); }
        t += 0.1; i += word[0].length - 3; st.push({ t, n: i, burst: true });
        continue;
      }
      t += base + D.rand() * jit + (text[i] === ' ' ? base * 0.6 : 0);
      i++; st.push({ t, n: i });
    }
    return { st, total: t };
  }
  /** Drive paint(n) from a keystroke schedule placed at `at`; returns the end time. */
  function play(D, seq, at, paint, vol = 0.12) {
    const P = { t: 0 };
    let k = 0;
    D.tl.to(P, {
      t: seq.total, duration: Math.max(0.01, seq.total), ease: 'none',
      onUpdate: () => { k = 0; while (k + 1 < seq.st.length && seq.st[k + 1].t <= P.t + 1e-6) k++; paint(seq.st[k].n); },
    }, at);
    seq.st.forEach(s => { if (s.silent || !s.t) return; D.sfx(s.burst ? 'tick' : 'key', at + s.t, s.burst ? 0.07 : vol); });
    return at + seq.total;
  }
  function blink(D, el, from, to, period = 0.5) {
    let k = 0;
    for (let t = from; t < to - 0.01; t += period, k++) D.tl.set(el, { opacity: k % 2 ? 0 : 1 }, t);
    D.tl.set(el, { opacity: 1 }, to);
  }
  /** `// caption` typed in mono under the window. */
  function caption(D, s, text, at, out) {
    if (!text) return;
    const el = document.createElement('div');
    el.className = 'dx-cap';
    el.innerHTML = '<span class="dx-cap-s">//</span> <span class="dx-cap-t"></span><i class="dx-cap-c"></i>';
    s.appendChild(el);
    const t = el.querySelector('.dx-cap-t'), c = el.querySelector('.dx-cap-c');
    t.textContent = text; // freeze the final width: the line types from a fixed start
    el.style.width = el.offsetWidth + 2 + 'px';
    t.textContent = '';
    gsap.set(el, { xPercent: -50, opacity: 0 });
    D.tl.set(el, { opacity: 1 }, at);
    const end = play(D, keys(D, text, { base: 0.022, jitter: 0.025 }), at + 0.15, n => { t.textContent = text.slice(0, n); }, 0.05);
    blink(D, c, end, out);
    D.tl.to(el, { opacity: 0, duration: 0.35 }, out);
  }
  const chrome = (title, extra = '') => `<div class="dx-bar"><i></i><i></i><i></i><span class="dx-bar-t">${title}</span>${extra}</div>`;
  function stage(D, name, inner) {
    const s = D.scene(name, `<div class="dx-bg"></div><div class="dx-cam">${inner}</div>`);
    return { s, cam: D.$('.dx-cam', s) };
  }
  function windowIn(D, w, at, from = {}) {
    D.hit(w, { opacity: 0, y: 30, scale: 0.96, ...from }, { opacity: 1, y: 0, scale: 1, rotationX: 0, rotationY: 0, duration: 1.1, ease: 'expo.out' }, at);
  }

  // ------------------------------------------------------------------ TERMINAL
  // Commands typed at a prompt, real output streaming in, the view scrolling.
  recipe('terminal', (D, T, o) => {
    const { tl } = D;
    const cmds = o.cmds || [], prompt = o.prompt || '<span class="tt-g">➜</span> <span class="tt-b">~</span> <span class="tt-m">$</span> ';
    const rows = [];
    cmds.forEach(c => { rows.push({ kind: 'cmd', c }); (c.out || []).forEach(h => rows.push({ kind: 'out', h, c })); });
    rows.push({ kind: 'end' });
    const { s, cam } = stage(D, 'terminal', `<div class="dx-win dx-term">${chrome(o.title || 'zsh')}<div class="dx-tb"><div class="dx-tc">${rows.map(r => r.kind === 'out'
      ? `<div class="dx-tl">${r.h || '&nbsp;'}</div>`
      : `<div class="dx-tl">${r.c && r.c.prompt != null ? r.c.prompt : prompt}<span class="dx-cmd"></span><i class="dx-caret"></i></div>`).join('')}</div></div></div>`);
    const w = D.$('.dx-win', s), content = D.$('.dx-tc', s), lines = D.$$('.dx-tl', s);
    const lh = 38, maxRows = o.rows || 17; // = .dx-tl height
    gsap.set(lines, { opacity: 0 });
    gsap.set(D.$$('.dx-caret', s), { opacity: 0 });
    gsap.set(cam, { transformOrigin: '960px 486px' });

    D.show(s, T);
    D.setBg(GH.bg, T);
    D.ink(GH.ink, T);
    if (o.open !== false) { tl.set(D.bars, { height: 540 }, T); D.barsTo(96, T + 0.05, 1.4); }
    if (o.label) D.label(T + 0.4, o.label);
    D.call(() => SFX.pad('dev', [55, 82.41, 110, 130.81], 2.5, 0.045, 700), T + 0.02);
    windowIn(D, w, T + 0.2);
    tl.to(cam, { scale: 1.04, duration: (o.duration || 10) - 0.4, ease: 'sine.inOut' }, T + 0.3);
    let t = T + 1.1;
    const scroll = (i, at) => { if (i >= maxRows) tl.to(content, { y: -(i - maxRows + 1) * lh, duration: 0.14, ease: 'power2.out' }, at); };
    rows.forEach((r, i) => {
      const line = lines[i];
      if (r.kind === 'out') {
        t += (r.c && r.c.dt) || 0.06 + D.rand() * 0.07;
        tl.set(line, { opacity: 1 }, t);
        scroll(i, t);
        if (i % 2 === 0) D.sfx('tick', t, 0.03);
        return;
      }
      const caret = D.$('.dx-caret', line);
      tl.set(line, { opacity: 1 }, t);
      scroll(i, t);
      if (r.kind === 'end') { blink(D, caret, t, T + (o.duration || 10)); return; }
      const cmd = D.$('.dx-cmd', line), text = r.c.cmd;
      blink(D, caret, t, t + (r.c.wait ?? 0.55));
      t = play(D, keys(D, text, { base: r.c.base ?? 0.04, jitter: r.c.jitter ?? 0.05 }), t + (r.c.wait ?? 0.55), n => { cmd.textContent = text.slice(0, n); });
      blink(D, caret, t, t + 0.35);
      t += 0.35;
      tl.set(caret, { opacity: 0 }, t);
      D.sfx('key', t, 0.3);
      t += r.c.think ?? 0.25; // the command "runs"
    });
    const dur = o.duration || Math.max(8, t - T + 2.2);
    caption(D, s, o.caption, T + (o.captionAt ?? 1.2), T + dur - 0.5);
    tl.to(w, { opacity: 0, y: -20, duration: 0.4, ease: 'power2.in' }, T + dur - 0.45);
    D.hide(s, T + dur);
    return dur;
  });

  // ------------------------------------------------------------------ CODE
  // A real file excerpt in an editor: highlighted, some lines typed live, an inline value.
  recipe('code', (D, T, o) => {
    const { tl } = D;
    const L = o.lines || [], typed = new Set(o.typed || []) // (not "type": that is the scene type);
    const toks = L.map(l => tokenize(l.text));
    const tabs = [o.file || 'main.js', ...(o.tabs || [])];
    const { s, cam } = stage(D, 'code', `<div class="dx-win dx-code">
      ${chrome(o.title || o.file || '', '')}
      <div class="dx-tabs">${tabs.map((t, i) => `<span class="dx-tab ${i ? '' : 'is-on'}"><i></i>${t}</span>`).join('')}</div>
      <div class="dx-ed">
        <div class="dx-act"></div>
        ${L.map((l, i) => `<div class="dx-row"><span class="dx-num">${l.n}</span><span class="dx-src">${typed.has(l.n) ? '' : prefixHTML(toks[i], l.text.length)}</span></div>`).join('')}
        <i class="dx-ecaret"></i>
        <div class="dx-mini">${L.map((l, i) => { let x = 0; return `<div class="dx-mrow${typed.has(l.n) ? ' is-typed' : ''}" style="top:${i * 6}px">${toks[i].map(([tx, c]) => { const wv = tx.length * 1.5, h = /^\s+$/.test(tx) ? '' : `<i class="tk-${c || 'x'}" style="left:${x}px;width:${wv}px"></i>`; x += wv; return h; }).join('')}</div>`; }).join('')}</div>
      </div>
      <div class="dx-status"><span>${o.branch || 'main'}</span><span class="dx-lc">Ln 1, Col 1</span><span>${o.lang || 'JavaScript'}</span><span>UTF-8</span></div>
    </div>`);
    const w = D.$('.dx-win', s), rows = D.$$('.dx-row', s), srcs = D.$$('.dx-src', s), caret = D.$('.dx-ecaret', s), act = D.$('.dx-act', s), lc = D.$('.dx-lc', s);
    const minis = D.$$('.dx-mrow', s), ed = D.$('.dx-ed', s);
    // measure the monospace grid
    const probe = document.createElement('span');
    probe.className = 'dx-src';
    probe.style.cssText = 'position:absolute;visibility:hidden';
    probe.textContent = 'M'.repeat(100);
    ed.appendChild(probe);
    const cw = probe.offsetWidth / 100; // layout px = stage px (the stage is scaled with a transform)
    probe.remove();
    const rh = 34, x0 = rows[0].querySelector('.dx-src').offsetLeft, y0 = rows[0].offsetTop;
    const place = (row, col) => {
      gsap.set(caret, { x: x0 + col * cw, y: y0 + row * rh });
      gsap.set(act, { y: y0 + row * rh });
      lc.textContent = `Ln ${L[row].n}, Col ${col + 1}`;
    };
    const firstTyped = Math.max(0, L.findIndex(l => typed.has(l.n)));
    place(firstTyped, 0);
    gsap.set(rows.filter((r, i) => !typed.has(L[i].n)), { opacity: 0, x: -12 });
    gsap.set(minis.filter(m => m.classList.contains('is-typed')), { opacity: 0 });
    cam.style.perspective = '2200px';

    D.show(s, T);
    D.setBg(GH.bg, T);
    D.ink(GH.ink, T);
    if (o.label) D.label(T, o.label);
    windowIn(D, w, T + 0.1, { rotationY: -18, rotationX: 8, scale: 0.9 });
    D.sfx('whoosh', T + 0.1, 1, 0.2);
    tl.to(rows.filter((r, i) => !typed.has(L[i].n)), { opacity: 1, x: 0, duration: 0.5, ease: 'expo.out', stagger: 0.03 }, T + 0.4);
    // type the chosen lines, in order
    let t = T + 1.7;
    const order = L.map((l, i) => i).filter(i => typed.has(L[i].n));
    const tz = t;
    order.forEach((i, k) => {
      const text = L[i].text;
      t = play(D, keys(D, text, { base: o.speed ?? 0.03, jitter: 0.035, indent: true, complete: true }), t, n => {
        srcs[i].innerHTML = prefixHTML(toks[i], n);
        place(i, n);
      }, 0.09);
      tl.to(minis[i], { opacity: 1, duration: 0.2 }, t);
      if (k < order.length - 1) { t += 0.22; D.sfx('key', t, 0.2); }
    });
    blink(D, caret, t, T + (o.duration || 10));
    // the camera leans toward the typed block
    const fr = order.length ? order[Math.floor(order.length / 2)] : 0;
    const eb = D.box(ed);
    gsap.set(cam, { transformOrigin: `${eb.x + x0 + 380}px ${eb.y + y0 + fr * rh}px` });
    tl.to(cam, { scale: o.zoom || 1.08, duration: t - tz + 1, ease: 'sine.inOut' }, tz);
    // inline value (a "live eval" hint at the end of a line)
    if (o.eval) {
      const i = L.findIndex(l => l.n === o.eval.n), pill = document.createElement('span');
      pill.className = 'dx-eval';
      pill.textContent = o.eval.text;
      rows[i].appendChild(pill);
      gsap.set(pill, { opacity: 0 });
      D.hit(pill, { opacity: 0, x: -10 }, { opacity: 1, x: 0, duration: 0.5, ease: 'expo.out' }, t + 0.35);
      D.sfx('beep', t + 0.35, 1320, 0.12, 0.06);
      t += 0.35;
    }
    const dur = o.duration || t - T + 2.2;
    caption(D, s, o.caption, T + (o.captionAt ?? 1.0), T + dur - 0.5);
    tl.to(w, { opacity: 0, duration: 0.4, ease: 'power2.in' }, T + dur - 0.45);
    D.hide(s, T + dur);
    return dur;
  });

  // ------------------------------------------------------------------ PIPELINE
  // Stages on the left (idle → spinner → check), one progress row per job on the right,
  // an overall bar and counter; the header pill flips to done at the end.
  recipe('pipeline', (D, T, o) => {
    const { tl, N } = D;
    const stages = o.stages || [], jobs = o.rows || [], n = jobs.length;
    const spin = '<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="12" fill="none" stroke-width="3" class="dx-sp-t"/><circle cx="16" cy="16" r="12" fill="none" stroke-width="3" stroke-linecap="round" stroke-dasharray="20 100" class="dx-sp-a"/></svg>';
    const check = '<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="14"/><path d="M10 16.5l4 4 8-9" fill="none" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    const { s, cam } = stage(D, 'pipeline', `<div class="dx-win dx-pipe">
      ${chrome(o.window || 'deploy')}
      <div class="dx-ph"><div><div class="dx-pt">${o.title || 'Deploy'}</div><div class="dx-ps">${o.sub || ''}</div></div>
        <span class="dx-pill"><span class="dx-pill-a"><i class="dx-dot"></i>${o.running || 'Running'}</span><span class="dx-pill-b">✓ ${o.doneLabel || 'Done'}</span></span></div>
      <div class="dx-stages">${stages.map((st, i) => `<div class="dx-st"><span class="dx-node"><span class="dx-n0"></span><span class="dx-n1">${spin}</span><span class="dx-n2">${check}</span></span><span><b>${st.name}</b><em>${st.detail || ''}</em></span>${i < stages.length - 1 ? '<i class="dx-link"><i></i></i>' : ''}</div>`).join('')}</div>
      <div class="dx-jobs">
        <div class="dx-jh">${(o.cols || ['JOB', 'PROGRESS', 'VALUE', 'STATUS']).map(c => `<span>${c}</span>`).join('')}</div>
        ${jobs.map(j => `<div class="dx-job"${o.rowH ? ` style="height:${o.rowH}px"` : ''}><b>${j.name}</b><span class="dx-jt"><i></i></span><span class="dx-jv">${j.value}</span><span class="dx-js">${j.status || '✓'}</span></div>`).join('')}
      </div>
      <div class="dx-pf"><span class="dx-pc">0/${n}</span><span class="dx-pb"><i></i></span><span class="dx-pl">${o.total || ''}</span></div>
    </div>`);
    const w = D.$('.dx-win', s), sts = D.$$('.dx-st', s), fills = D.$$('.dx-jt i', s), vals = D.$$('.dx-jv', s), stat = D.$$('.dx-js', s);
    const pc = D.$('.dx-pc', s), pb = D.$('.dx-pb i', s), pillA = D.$('.dx-pill-a', s), pillB = D.$('.dx-pill-b', s), pill = D.$('.dx-pill', s), links = D.$$('.dx-link i', s);
    gsap.set(fills, { scaleX: 0, transformOrigin: '0% 50%' });
    gsap.set([...vals, ...stat], { opacity: 0 });
    gsap.set(pb, { scaleX: 0, transformOrigin: '0% 50%' });
    gsap.set(links, { scaleY: 0, transformOrigin: '50% 0%' });
    gsap.set(pillB, { opacity: 0 });
    sts.forEach(st => { gsap.set(D.$('.dx-n1', st), { opacity: 0 }); gsap.set(D.$('.dx-n2', st), { opacity: 0, scale: 0.4 }); });

    D.show(s, T);
    D.setBg(GH.bg, T);
    if (o.label) D.label(T, o.label);
    windowIn(D, w, T + 0.1);
    gsap.set(cam, { transformOrigin: '960px 486px' });
    const dur = o.duration || 10;
    tl.to(cam, { scale: 1.03, duration: dur - 0.3, ease: 'sine.inOut' }, T + 0.2);
    // stage helpers
    const run = (i, at) => {
      const st = sts[i];
      tl.to(D.$('.dx-n0', st), { opacity: 0, duration: 0.2 }, at);
      tl.to(D.$('.dx-n1', st), { opacity: 1, duration: 0.2 }, at);
      tl.to(D.$('.dx-sp-a', st), { rotation: 360 * 4, svgOrigin: '16 16', duration: 4, ease: 'none' }, at);
      tl.to(st, { color: GH.ink, duration: 0.2 }, at);
    };
    const done = (i, at) => {
      const st = sts[i];
      tl.to(D.$('.dx-n1', st), { opacity: 0, duration: 0.15 }, at);
      tl.to(D.$('.dx-n2', st), { opacity: 1, scale: 1, duration: 0.45, ease: 'back.out(3)' }, at);
      if (links[i]) tl.to(links[i], { scaleY: 1, duration: 0.35, ease: 'power2.inOut' }, at + 0.1);
      D.sfx('bell', at, [N.C5, N.E5, N.G5, N.C6][i % 4], 0.06);
    };
    // 1 · the jobs, one after another (overlapping)
    const t0 = T + 0.9, gap = o.gap ?? 0.4, each = 0.55;
    run(0, t0 - 0.2);
    const C = { v: 0 };
    jobs.forEach((j, i) => {
      const at = t0 + i * gap;
      tl.to(fills[i], { scaleX: 1, duration: each, ease: 'power1.inOut' }, at);
      tl.to([vals[i], stat[i]], { opacity: 1, duration: 0.2 }, at + each);
      tl.to(C, { v: i + 1, duration: 0.01, onUpdate: () => { pc.textContent = `${Math.round(C.v)}/${n}`; } }, at + each);
      D.sfx('beep', at + each, i % 2 ? 1568 : 1319, 0.06, 0.04);
    });
    const tj = t0 + (n - 1) * gap + each;
    tl.to(pb, { scaleX: 1, duration: tj - t0, ease: 'none' }, t0);
    done(0, tj + 0.05);
    // 2… · the remaining stages
    let t = tj + 0.05;
    for (let i = 1; i < stages.length; i++) { run(i, t + 0.1); t += stages[i].time || 0.9; done(i, t); }
    tl.to(pillA, { opacity: 0, duration: 0.2 }, t + 0.1);
    tl.to(pillB, { opacity: 1, duration: 0.25 }, t + 0.15);
    tl.to(pill, { backgroundColor: 'rgba(63,185,80,.16)', borderColor: 'rgba(63,185,80,.5)', color: GH.green, duration: 0.3 }, t + 0.1);
    D.sfx('bell', t + 0.15, N.G5, 0.07);
    D.sfx('bell', t + 0.25, N.C6, 0.07);
    D.sfx('boom', t + 0.15, 0.4);
    for (let k = 0; k < Math.floor((tj - t0) / 0.5); k++) D.sfx('kick', t0 + k * 0.5, 0.3);
    caption(D, s, o.caption, T + (o.captionAt ?? 1.0), T + dur - 0.5);
    tl.to(w, { opacity: 0, duration: 0.4, ease: 'power2.in' }, T + dur - 0.45);
    D.hide(s, T + dur);
    return dur;
  });

  // ------------------------------------------------------------------ TREEMAP
  // Squarified treemap: area ∝ value, colour = group (with a legend), labels where they fit.
  function squarify(items, x, y, w, h) {
    const out = [];
    let rest = items.slice();
    while (rest.length) {
      const short = Math.min(w, h);
      const worst = r => { const sum = r.reduce((a, b) => a + b.a, 0), mx = Math.max(...r.map(q => q.a)), mn = Math.min(...r.map(q => q.a)); return Math.max((short * short * mx) / (sum * sum), (sum * sum) / (short * short * mn)); };
      const row = [rest[0]];
      let i = 1;
      while (i < rest.length && worst([...row, rest[i]]) <= worst(row)) row.push(rest[i++]);
      const sum = row.reduce((a, b) => a + b.a, 0);
      if (w >= h) { const cw = sum / h; let yy = y; row.forEach(r => { const ch = r.a / cw; out.push({ ...r, x, y: yy, w: cw, h: ch }); yy += ch; }); x += cw; w -= cw; }
      else { const ch = sum / w; let xx = x; row.forEach(r => { const cw = r.a / ch; out.push({ ...r, x: xx, y, w: cw, h: ch }); xx += cw; }); y += ch; h -= ch; }
      rest = rest.slice(i);
    }
    return out;
  }
  recipe('treemap', (D, T, o) => {
    const { tl } = D;
    const dur = o.duration || 7.5, box = o.box || { x: 210, y: 300, w: 1500, h: 560 }, G = o.groups || {};
    const fmt = o.format || (v => String(Math.round(v)));
    const data = (o.data || []).slice().sort((a, b) => b.value - a.value), total = data.reduce((a, b) => a + b.value, 0);
    const cells = squarify(data.map(d => ({ ...d, a: (d.value / total) * box.w * box.h })), box.x, box.y, box.w, box.h);
    const gap = 3;
    const { s } = stage(D, 'treemap', `
      <div class="dx-head">${o.kicker ? `<div class="dx-kick">${o.kicker}</div>` : ''}<div class="dx-title">${o.title || ''}</div>${o.sub ? `<div class="dx-sub">${o.sub}</div>` : ''}</div>
      <div class="dx-legend">${Object.entries(G).map(([k, c]) => `<span><i style="background:${c}"></i>${k}</span>`).join('')}</div>
      ${cells.map(c => {
        const bg = G[c.group] || GH.blue, ink = D.contrast(bg), big = c.w > 150 && c.h > 78, mid = !big && c.w > 92 && c.h > 40;
        return `<div class="dx-cell" style="left:${c.x + gap / 2}px;top:${c.y + gap / 2}px;width:${c.w - gap}px;height:${c.h - gap}px;background:${bg};color:${ink}">${big || mid ? `<span class="dx-cn">${c.name}</span>` : ''}${big ? `<b class="dx-cv" data-v="${c.value}">${fmt(0)}</b>` : ''}</div>`;
      }).join('')}
      ${o.source ? `<div class="dx-note">${o.source}</div>` : ''}`);
    const els = D.$$('.dx-cell', s), head = D.$$('.dx-head > *, .dx-legend', s), src = D.$('.dx-note', s);
    gsap.set(els, { opacity: 0, scale: 0.6, transformOrigin: '50% 50%' });
    gsap.set(head, { opacity: 0, y: 20 });
    if (src) gsap.set(src, { opacity: 0 });

    D.show(s, T);
    D.setBg(GH.bg, T);
    if (o.label) D.label(T, o.label);
    tl.to(head, { opacity: 1, y: 0, duration: 0.8, ease: 'expo.out', stagger: 0.08 }, T + 0.1);
    if (src) tl.to(src, { opacity: 1, duration: 0.6 }, T + 0.8);
    els.forEach((el, i) => {
      const at = T + 0.7 + i * 0.07;
      tl.to(el, { opacity: 1, scale: 1, duration: 0.7, ease: 'expo.out' }, at);
      const v = el.querySelector('.dx-cv');
      if (v) { const P = { v: 0 }, target = +v.dataset.v; tl.to(P, { v: target, duration: 1.1, ease: 'power3.out', onUpdate: () => { v.textContent = fmt(P.v); } }, at + 0.1); }
      if (i % 2 === 0) D.sfx('tick', at, 0.04);
    });
    D.sfx('whoosh', T + 0.6, 0.8, 0.15);
    D.sfx('bell', T + 0.7 + els.length * 0.07 + 0.4, D.N.E5, 0.05);
    caption(D, s, o.caption, T + (o.captionAt ?? 2.2), T + dur - 0.5);
    tl.to([...els, ...head, src].filter(Boolean), { opacity: 0, duration: 0.4, ease: 'power2.in', stagger: 0.004 }, T + dur - 0.55);
    D.hide(s, T + dur);
    return dur;
  });

  // ------------------------------------------------------------------ DEVTITLE
  // A word typed in huge mono; each letter "compiles" through symbols before it settles;
  // an ASCII progress bar fills; a green ✓ line; a scrambled tagline.        6.5 s
  recipe('devtitle', (D, T, o) => {
    const { tl, N } = D;
    const dur = o.duration || 6.5, word = o.title || D.cfg.meta.title, BARN = o.barWidth || 30;
    const { s } = stage(D, 'devtitle', `
      <div class="dx-big c"><span class="dx-bp">${o.prompt || '$'}</span><span class="dx-bw"></span><i class="dx-bc"></i></div>
      <div class="dx-ascii c"></div>
      <div class="dx-ok c">${o.done || '✓ done'}</div>
      <div class="dx-tag c"></div>`);
    const big = D.$('.dx-big', s), bw = D.$('.dx-bw', s), bc = D.$('.dx-bc', s), ascii = D.$('.dx-ascii', s), ok = D.$('.dx-ok', s), tag = D.$('.dx-tag', s);
    // lay the final word out once, so the line never reflows while it types
    // lay the final line out once and freeze its box: the word then grows to the right from a fixed start
    bw.textContent = word;
    D.fit(big, 1600);
    big.style.width = big.offsetWidth + 6 + 'px';
    bw.textContent = '';
    // per letter: when it appears + a fixed run of symbols to flip through
    const at0 = T + 0.7, glyph = [...word].map((ch, i) => ({ ch, t: i * 0.16 + D.rand() * 0.05, sy: Array.from({ length: 8 }, () => SYMS[Math.floor(D.rand() * SYMS.length)]) }));
    const P = { t: 0 }, span = glyph[glyph.length - 1].t + 0.45;
    const paint = () => { bw.textContent = glyph.map(g => (P.t < g.t ? '' : P.t < g.t + 0.4 ? g.sy[Math.floor((P.t - g.t) / 0.05) % 8] : g.ch)).join(''); };
    const B = { v: 0 }, bar = () => { const k = Math.round(B.v * BARN); ascii.textContent = `[${'█'.repeat(k)}${'░'.repeat(BARN - k)}] ${String(Math.round(B.v * 100)).padStart(3, ' ')} %`; };
    bar();
    gsap.set([ascii, ok], { opacity: 0 });
    gsap.set(big, { opacity: 0 });

    D.show(s, T);
    D.setBg(GH.bg, T);
    D.ink(GH.ink, T);
    if (o.label) D.label(T + 0.1, o.label);
    tl.set(big, { opacity: 1 }, T + 0.2);
    blink(D, bc, T + 0.2, at0);
    tl.to(P, { t: span, duration: span, ease: 'none', onUpdate: paint }, at0);
    glyph.forEach(g => { D.sfx('key', at0 + g.t, 0.22); D.sfx('glitch', at0 + g.t + 0.05, 0.12, 0.05); });
    const tb = at0 + span + 0.1;
    blink(D, bc, tb, T + dur - 0.8);
    tl.to(ascii, { opacity: 1, duration: 0.2 }, tb);
    tl.to(B, { v: 1, duration: 1.4, ease: 'power2.inOut', onUpdate: bar }, tb + 0.1);
    for (let k = 0; k < 10; k++) D.sfx('tick', tb + 0.1 + k * 0.14, 0.04);
    const tk = tb + 1.6;
    D.hit(ok, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.5, ease: 'expo.out' }, tk);
    D.sfx('boom', tk, 0.8);
    D.sfx('braam', tk, 0.5);
    D.flash(tk, 0.14, 0.6, GH.green);
    D.call(() => { SFX.padStop('dev', 1.5); SFX.pad('title', [110, 138.59, 164.81, 220], 1.2, 0.05, 900); }, tk);
    [N.C5, N.E5, N.G5].forEach(f => D.sfx('bell', tk, f, 0.06));
    if (o.tagline) tl.to(tag, { duration: 1.1, scrambleText: { text: o.tagline, chars: 'upperCase', speed: 0.6 }, ease: 'none' }, tk + 0.4);
    const to = T + dur - 0.7;
    tl.to([big, ascii, ok, tag], { opacity: 0, duration: 0.45, ease: 'power2.in', stagger: 0.05 }, to);
    D.hide(s, T + dur);
    return dur;
  });

  Trailer.dev = { GH, tokenize, prefixHTML, keys, play, blink, caption, squarify };
})();
