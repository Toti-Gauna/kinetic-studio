/* ============================================================================
   INTERACTIVE MODE — cfg.interactive: the film as a web experience.
   · the viewer picks the path at a fork: a click on a [data-choose="a"] element, or its key;
   · the pointer moves the camera: [data-depth] layers parallax (GSAP Observer);
   · the scroll is the time: the page scrolls through the chosen path and ScrollTrigger maps
     scroll → film time, back and forth. Left alone, the film plays on by itself at 1×.
   The master timeline holds every branch in its own region (engine: branches, D.segs, D.hold). The
   driver keeps a "path time" p and maps it to master time. Moving forward continuously fires the
   timeline's callbacks (the sound); a jump, or going back, doesn't. Back before the fork undoes the
   choice. Linear playback (?path=b, ?t=, embed, exports) never starts this driver.
   Needs ScrollTrigger and Observer (GSAP 3.13, free) loaded before it.
   cfg.interactive: { hint (HTML), names: { a: 'LA FORMA', … }, other: '⑂ OTRO CAMINO' }
   ========================================================================== */
(() => {
  'use strict';
  const PX = 120;       // scroll pixels per second of film
  const RESUME = 1.1;   // seconds after the last scroll before the film plays on by itself

  Trailer.interactive = {
    create(X) {
      const { tl, D, cfg, segs, holds, branches, endEl, replayBtn, camera } = X;
      const opt = typeof cfg.interactive === 'object' ? cfg.interactive : {};
      gsap.registerPlugin(ScrollTrigger, Observer);
      const root = document.documentElement;
      root.classList.add('is-interactive');
      const holdAt = holds.length ? holds[0].t : Infinity;
      const firstB = segs.findIndex(s => s.branch);
      const spacer = document.createElement('div');
      spacer.id = 'ix-scroll';
      document.body.appendChild(spacer);
      const hint = document.createElement('div');
      hint.id = 'ix-hint';
      hint.className = 'mono';
      hint.innerHTML = opt.hint || 'SCROLL · TIEMPO &nbsp;&nbsp; MOUSE · CÁMARA &nbsp;&nbsp; A / B · CAMINO';
      document.body.appendChild(hint);
      const other = document.createElement('button');
      other.id = 'ix-other';
      other.hidden = true;
      replayBtn.after(other);

      let started = false, playing = false, visible = true, done = false, branch = null;
      let p = 0, target = 0, pPrev = 0, lastM = 0, lastSeg = 0, userUntil = 0, expectY = -1;

      // ---- the path: which regions of the master timeline, in order
      const route = (b = branch) => (b ? segs.filter(s => !s.branch || s.branch === b) : segs.slice(0, firstB < 0 ? segs.length : firstB));
      const length = (b = branch) => route(b).reduce((a, s) => a + s.end - s.start, 0);
      const cap = () => (branch ? length() : Math.min(length(), holdAt)); // before a choice, time stops at the fork
      function locate(pp) {
        const r = route();
        let acc = 0;
        for (let i = 0; i < r.length; i++) {
          const d = r[i].end - r[i].start;
          if (pp <= acc + d || i === r.length - 1) return [i, r[i].start + Math.min(d, Math.max(0, pp - acc))];
          acc += d;
        }
        return [0, 0];
      }
      /** show path time pp: play on (callbacks fire) when moving forward a little, jump silently otherwise */
      function apply(pp) {
        const r = route(), [i, m0] = locate(pp), m = Math.min(m0, tl.duration() - 0.001), step = pp - pPrev;
        if (i === lastSeg && m > lastM && m - lastM < 0.35) tl.time(m, false);
        else if (i === lastSeg + 1 && step > 0 && step < 0.35) {
          // across a cut of the path: finish the region, then continue from the start of the next one
          tl.time(r[lastSeg].end - 1e-4, false);
          SFX.stopAll(0.4);
          tl.time(r[i].start - 1e-4, true);
          tl.time(m, false);
        } else {
          if (m < lastM) SFX.stopAll(0.25);
          tl.time(m, true);
        }
        lastM = m; lastSeg = i; pPrev = pp;
      }

      // ---- the scroll is the time (ScrollTrigger)
      function layout() {
        spacer.style.height = `${Math.ceil(cap() * PX + innerHeight)}px`;
        ScrollTrigger.refresh();
      }
      ScrollTrigger.create({
        trigger: spacer, start: 'top top', end: 'bottom bottom',
        onUpdate: self => {
          if (!started) return;
          const y = self.scroll();
          if (Math.abs(y - expectY) <= 2) return; // our own autoscroll
          target = Math.max(0, Math.min(cap(), y / PX));
          userUntil = performance.now() + RESUME * 1000;
        },
      });
      addEventListener('resize', () => { if (started) layout(); });

      // ---- the pointer moves the camera (Observer)
      const aim = { x: 0, y: 0 };
      Observer.create({
        target: window, type: 'pointer,touch',
        onMove: self => { aim.x = (self.x / innerWidth - 0.5) * 2; aim.y = (self.y / innerHeight - 0.5) * 2; },
      });

      // ---- choices
      function choose(id) {
        if (!started || !branches.includes(id)) return;
        if (branch === id && !done) return;
        if (branch || p < holdAt - 0.05 || done) { SFX.stopAll(0.3); p = target = pPrev = holdAt; apply(holdAt); }
        branch = id;
        root.dataset.path = id;
        lastSeg = 0; lastM = Math.min(holdAt, tl.duration()); pPrev = p;
        done = false;
        gsap.to(endEl, { autoAlpha: 0, duration: 0.3 });
        playing = true; userUntil = 0;
        layout();
        expectY = Math.round(p * PX); scrollTo(0, expectY);
      }
      function unchoose() { branch = null; root.dataset.path = ''; layout(); }
      const otherOf = b => branches.find(x => x !== b);
      document.addEventListener('click', e => {
        const c = e.target.closest('[data-choose]');
        if (c) { choose(c.dataset.choose); return; }
        if (e.target.closest('[data-choose-other]') || e.target === other) choose(otherOf(branch));
      });
      addEventListener('keydown', e => {
        if (e.repeat || e.metaKey || e.ctrlKey || e.altKey) return;
        const k = e.key.toLowerCase();
        if (branches.includes(k)) choose(k);
      });
      function finish() {
        done = true; playing = false;
        SFX.stopAll(1.2);
        const o = otherOf(branch);
        other.textContent = `⑂  ${(opt.names && opt.names[o]) || o.toUpperCase()}`;
        other.hidden = !o;
        gsap.to(endEl, { autoAlpha: 1, duration: 1, delay: 0.3 });
      }
      function unfinish() { done = false; gsap.to(endEl, { autoAlpha: 0, duration: 0.3 }); }

      // ---- every frame: autoplay, scrub, camera, fork, end
      gsap.ticker.add((time, dtMs) => {
        if (!started) return;
        const dt = Math.min(0.1, dtMs / 1000), user = performance.now() < userUntil;
        if (playing && visible && !user && !done) target = Math.min(cap(), target + dt);
        if (user) { p += (target - p) * Math.min(1, dt * 9); if (Math.abs(target - p) < 0.002) p = target; }
        else p = target;
        if (p !== pPrev) apply(p);
        if (!user) { const y = Math.round(p * PX); if (Math.abs(scrollY - y) > 1) { expectY = y; scrollTo(0, y); } }
        // the camera eases toward the pointer (looking right slides the layers left)
        D.pointer.x += (-aim.x * 70 - D.pointer.x) * 0.07;
        D.pointer.y += (-aim.y * 42 - D.pointer.y) * 0.07;
        camera.style.translate = `${(D.pointer.x * 0.12).toFixed(2)}px ${(D.pointer.y * 0.12).toFixed(2)}px`;
        if (branch && p < holdAt - 0.05) unchoose();
        root.classList.toggle('ix-waiting', !branch && p >= holdAt - 0.01);
        if (branch && !done && p >= length() - 0.01) finish();
        else if (done && p < length() - 0.3) unfinish();
      });

      return {
        start() {
          started = true; playing = true;
          p = target = pPrev = 0; lastM = 0; lastSeg = 0;
          tl.pause(); tl.time(0, true);
          layout(); scrollTo(0, 0);
          root.classList.add('ix-show');
          gsap.delayedCall(6, () => root.classList.remove('ix-show'));
        },
        restart() {
          SFX.stopAll();
          SFX.resume();
          branch = null; root.dataset.path = ''; done = false;
          p = target = pPrev = 0; lastM = 0; lastSeg = 0;
          tl.time(0, true);
          playing = true;
          layout(); expectY = 0; scrollTo(0, 0);
        },
        toggle() { playing = !playing; if (playing) SFX.resume(); else SFX.suspend(); return playing; },
        visible(v) { visible = v; if (v) SFX.resume(); else SFX.suspend(); },
        choose,
        time: () => p,
        progress: () => Math.min(1, p / length(branch || branches[0])),
        state: () => ({ p, branch, playing, done, length: length(), cap: cap() }),
      };
    },
  };
})();
