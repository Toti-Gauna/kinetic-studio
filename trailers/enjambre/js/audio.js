/* KINETIC — the score.
   Every sound is synthesized live with the Web Audio API: no audio files.
   Each voice is fire-and-forget and is triggered from the master GSAP timeline. */
window.SFX = (() => {
  const VOL = 0.85;
  let ctx = null, out, verb, noiseBuf, muted = false;
  const pads = new Map();

  const ok = () => ctx && ctx.state === 'running';

  function init() {
    if (ctx) return ctx.resume();
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return Promise.resolve();
    ctx = new AC();

    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14; comp.knee.value = 10; comp.ratio.value = 5;
    comp.attack.value = 0.003; comp.release.value = 0.25;
    out = ctx.createGain();
    out.gain.value = muted ? 0 : VOL;
    out.connect(comp).connect(ctx.destination);

    // Shared hall reverb
    const conv = ctx.createConvolver();
    conv.buffer = impulse(3.4, 3);
    verb = ctx.createGain();
    const wet = ctx.createGain(); wet.gain.value = 0.32;
    verb.connect(conv).connect(wet).connect(out);

    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;

    return ctx.resume();
  }

  function impulse(sec, decay) {
    const len = Math.floor(ctx.sampleRate * sec);
    const buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = buf.getChannelData(c);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
    }
    return buf;
  }

  // ---- building blocks ----
  function bus(wet = 0, pan = 0) {
    const g = ctx.createGain();
    g.gain.value = 0;
    let node = g;
    if (pan && ctx.createStereoPanner) {
      const p = ctx.createStereoPanner();
      p.pan.value = pan;
      g.connect(p);
      node = p;
    }
    node.connect(out);
    if (wet) {
      const s = ctx.createGain();
      s.gain.value = wet;
      node.connect(s);
      s.connect(verb);
    }
    return g;
  }
  function env(param, t, peak, a, d) {
    param.setValueAtTime(0.0001, t);
    param.exponentialRampToValueAtTime(peak, t + a);
    param.exponentialRampToValueAtTime(0.0001, t + a + d);
  }
  function osc(type, freq, t, end, dest) {
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    o.connect(dest);
    o.start(t);
    o.stop(end);
    return o;
  }
  function noise(t, end, dest) {
    const n = ctx.createBufferSource();
    n.buffer = noiseBuf;
    n.loop = true;
    n.connect(dest);
    n.start(t, Math.random() * 1.5);
    n.stop(end);
    return n;
  }
  function filter(type, freq, q = 0.7) {
    const f = ctx.createBiquadFilter();
    f.type = type;
    f.frequency.setValueAtTime(freq, ctx.currentTime);
    f.Q.value = q;
    return f;
  }
  function shaper(k) {
    const n = 1024, c = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const x = (i / (n - 1)) * 2 - 1;
      c[i] = Math.tanh(k * x) / Math.tanh(k);
    }
    const s = ctx.createWaveShaper();
    s.curve = c;
    return s;
  }

  // ---- voices ----
  function kick(v = 1) {
    if (!ok()) return;
    const t = ctx.currentTime;
    const g = bus(0.04);
    env(g.gain, t, v, 0.003, 0.42);
    osc('sine', 165, t, t + 0.5, g).frequency.exponentialRampToValueAtTime(44, t + 0.13);
    const c = bus();
    env(c.gain, t, v * 0.22, 0.001, 0.03);
    osc('triangle', 1400, t, t + 0.05, c);
  }

  function hat(v = 0.2) {
    if (!ok()) return;
    const t = ctx.currentTime;
    const g = bus(0.05, (Math.random() - 0.5) * 0.6);
    env(g.gain, t, v, 0.001, 0.05);
    const f = filter('highpass', 7500);
    f.connect(g);
    noise(t, t + 0.08, f);
  }

  function clap(v = 0.45) {
    if (!ok()) return;
    const t = ctx.currentTime;
    const g = bus(0.25);
    g.gain.setValueAtTime(0.0001, t);
    [0, 0.011, 0.022].forEach(o => {
      g.gain.setValueAtTime(v, t + o);
      g.gain.exponentialRampToValueAtTime(v * 0.25, t + o + 0.009);
    });
    g.gain.setValueAtTime(v, t + 0.033);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.24);
    const f = filter('bandpass', 1400, 0.9);
    f.connect(g);
    noise(t, t + 0.26, f);
  }

  function boom(v = 1) {
    if (!ok()) return;
    const t = ctx.currentTime;
    const g = bus(0.35);
    env(g.gain, t, v, 0.005, 2.4);
    osc('sine', 120, t, t + 2.6, g).frequency.exponentialRampToValueAtTime(30, t + 1.4);
    const n = bus(0.4);
    env(n.gain, t, v * 0.5, 0.002, 0.5);
    const f = filter('lowpass', 900);
    f.frequency.exponentialRampToValueAtTime(70, t + 0.5);
    f.connect(n);
    noise(t, t + 0.6, f);
  }

  // FM bell — glassy, reverberant
  function bell(freq = 440, v = 0.2, len = 1.3) {
    if (!ok()) return;
    const t = ctx.currentTime;
    const g = bus(0.55, (Math.random() - 0.5) * 0.8);
    env(g.gain, t, v, 0.004, len);
    const car = osc('sine', freq, t, t + len + 0.1, g);
    const mg = ctx.createGain();
    mg.gain.setValueAtTime(freq * 2.2, t);
    mg.gain.exponentialRampToValueAtTime(1, t + len);
    mg.connect(car.frequency);
    osc('sine', freq * 3.5, t, t + len + 0.1, mg);
  }

  function bass(freq = 55, v = 0.32) {
    if (!ok()) return;
    const t = ctx.currentTime;
    const g = bus(0.04);
    env(g.gain, t, v, 0.004, 0.22);
    const f = filter('lowpass', 2400, 7);
    f.frequency.exponentialRampToValueAtTime(130, t + 0.2);
    f.connect(g);
    osc('sawtooth', freq, t, t + 0.3, f);
    osc('sine', freq, t, t + 0.3, g);
  }

  function whoosh(dur = 0.9, v = 0.5) {
    if (!ok()) return;
    const t = ctx.currentTime, pk = t + dur * 0.6;
    const g = bus(0.3);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(v, pk);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    const f = filter('bandpass', 250, 1.1);
    f.frequency.exponentialRampToValueAtTime(3200, pk);
    f.frequency.exponentialRampToValueAtTime(400, t + dur);
    if (ctx.createStereoPanner) {
      const p = ctx.createStereoPanner();
      p.pan.setValueAtTime(-0.8, t);
      p.pan.linearRampToValueAtTime(0.8, t + dur);
      f.connect(p).connect(g);
    } else f.connect(g);
    noise(t, t + dur + 0.05, f);
  }

  function riser(dur = 2, v = 0.45) {
    if (!ok()) return;
    const t = ctx.currentTime, e = t + dur;
    const g = bus(0.3);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(v, e);
    g.gain.setValueAtTime(0.0001, e + 0.02);
    const bp = filter('bandpass', 300, 1.4);
    bp.frequency.exponentialRampToValueAtTime(9000, e);
    bp.connect(g);
    noise(t, e + 0.03, bp);

    const tg = bus(0.3);
    tg.gain.setValueAtTime(0.0001, t);
    tg.gain.exponentialRampToValueAtTime(v * 0.16, e);
    tg.gain.setValueAtTime(0.0001, e + 0.02);
    const lp = filter('lowpass', 3000);
    lp.connect(tg);
    osc('sawtooth', 110, t, e + 0.03, lp).frequency.exponentialRampToValueAtTime(880, e);
    osc('sawtooth', 111.3, t, e + 0.03, lp).frequency.exponentialRampToValueAtTime(885, e);
  }

  // The trailer "BRAAAM"
  function braam(v = 0.85) {
    if (!ok()) return;
    const t = ctx.currentTime, e = t + 4.8;
    const g = bus(0.45);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(v, t + 0.05);
    g.gain.exponentialRampToValueAtTime(v * 0.45, t + 1.2);
    g.gain.exponentialRampToValueAtTime(0.0001, e);
    const sh = shaper(6);
    sh.connect(g);
    const lp = filter('lowpass', 150, 4);
    lp.frequency.exponentialRampToValueAtTime(1600, t + 0.12);
    lp.frequency.exponentialRampToValueAtTime(170, t + 3.6);
    lp.connect(sh);
    const pre = ctx.createGain();
    pre.gain.value = 0.35;
    pre.connect(lp);
    [43.65, 43.9, 65.4, 87.3, 87.9, 130.8].forEach(f => osc('sawtooth', f, t, e, pre));
  }

  function crash(v = 0.3) {
    if (!ok()) return;
    const t = ctx.currentTime;
    const g = bus(0.5);
    env(g.gain, t, v, 0.002, 2.6);
    const f = filter('highpass', 3800);
    f.connect(g);
    noise(t, t + 2.7, f);
  }

  // A flock's wings: band-passed noise amplitude-modulated at wingbeat rate
  function flutter(dur = 1.5, v = 0.18) {
    if (!ok()) return;
    const t = ctx.currentTime, e = t + dur;
    const g = bus(0.3, (Math.random() - 0.5) * 0.8);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(v, t + dur * 0.35);
    g.gain.exponentialRampToValueAtTime(0.0001, e);
    const am = ctx.createGain();
    am.gain.value = 0.5;
    am.connect(g);
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 14 + Math.random() * 6;
    const lg = ctx.createGain();
    lg.gain.value = 0.5;
    lfo.connect(lg).connect(am.gain);
    lfo.start(t);
    lfo.stop(e + 0.05);
    const f = filter('bandpass', 1100, 0.7);
    f.connect(am);
    noise(t, e + 0.05, f);
  }

  // A raptor's cry: a high falling glide with vibrato
  function cry(v = 0.12) {
    if (!ok()) return;
    const t = ctx.currentTime, e = t + 0.7;
    const g = bus(0.6, 0.3);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(v, t + 0.06);
    g.gain.exponentialRampToValueAtTime(0.0001, e);
    const f = filter('bandpass', 2400, 3);
    f.connect(g);
    const o = osc('sawtooth', 2600, t, e + 0.05, f);
    o.frequency.exponentialRampToValueAtTime(1500, e);
    const vib = ctx.createOscillator();
    vib.frequency.value = 28;
    const vg = ctx.createGain();
    vg.gain.value = 70;
    vib.connect(vg).connect(o.frequency);
    vib.start(t);
    vib.stop(e + 0.05);
  }

  // Water drop: a sine that glides up fast (the "plip" of a drop hitting water)
  function plip(v = 0.3, f0 = 520) {
    if (!ok()) return;
    const t = ctx.currentTime, f = f0 * (0.85 + Math.random() * 0.3);
    const g = bus(0.55, (Math.random() - 0.5) * 0.6);
    env(g.gain, t, v, 0.002, 0.13);
    osc('sine', f, t, t + 0.18, g).frequency.exponentialRampToValueAtTime(f * 3.2, t + 0.07);
  }

  // A burst of n rising bubbles
  function bubbles(n = 6, v = 0.1) {
    if (!ok()) return;
    const t0 = ctx.currentTime;
    for (let k = 0; k < n; k++) {
      const t = t0 + k * 0.055 + Math.random() * 0.03, f = 700 + Math.random() * 900;
      const g = bus(0.5, (Math.random() - 0.5) * 0.9);
      env(g.gain, t, v * (0.5 + Math.random() * 0.5), 0.002, 0.06);
      osc('sine', f, t, t + 0.09, g).frequency.exponentialRampToValueAtTime(f * 1.9, t + 0.05);
    }
  }

  // Ocean swell: low-passed noise that rises and falls across the stereo field
  function swell(dur = 3, v = 0.22) {
    if (!ok()) return;
    const t = ctx.currentTime, pk = t + dur * 0.55;
    const g = bus(0.4);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(v, pk);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    const f = filter('lowpass', 300, 0.9);
    f.frequency.exponentialRampToValueAtTime(1400, pk);
    f.frequency.exponentialRampToValueAtTime(250, t + dur);
    if (ctx.createStereoPanner) {
      const p = ctx.createStereoPanner();
      p.pan.setValueAtTime(0.6, t);
      p.pan.linearRampToValueAtTime(-0.6, t + dur);
      f.connect(p).connect(g);
    } else f.connect(g);
    noise(t, t + dur + 0.05, f);
  }

  // Digital glitch: bit-crushed noise plus a stuttering square-wave "data chirp"
  function glitch(dur = 0.3, v = 0.35) {
    if (!ok()) return;
    const t = ctx.currentTime, e = t + Math.max(0.06, dur);
    const g = bus(0.08, (Math.random() - 0.5) * 0.8);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(v, t + 0.005);
    g.gain.setValueAtTime(v, e - 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, e);
    const sh = shaper(24);
    sh.connect(g);
    const bp = filter('bandpass', 1800, 0.8);
    bp.connect(sh);
    noise(t, e, bp);
    const sq = ctx.createGain();
    sq.gain.value = 0.35;
    sq.connect(sh);
    const o = osc('square', 200, t, e, sq);
    for (let k = 0; k * 0.03 < e - t; k++) {
      o.frequency.setValueAtTime(80 + Math.random() * 2400, t + k * 0.03);
      bp.frequency.setValueAtTime(400 + Math.random() * 5000, t + k * 0.03);
    }
  }

  // Test-card tone
  function beep(freq = 1000, dur = 0.5, v = 0.1) {
    if (!ok()) return;
    const t = ctx.currentTime;
    const g = bus(0.05);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(v, t + 0.01);
    g.gain.setValueAtTime(v, t + dur - 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc('sine', freq, t, t + dur + 0.05, g);
  }

  // CRT power-off: a falling sine zap with a click
  function zap(v = 0.4) {
    if (!ok()) return;
    const t = ctx.currentTime;
    const g = bus(0.3);
    env(g.gain, t, v, 0.003, 0.5);
    osc('sine', 1400, t, t + 0.55, g).frequency.exponentialRampToValueAtTime(50, t + 0.35);
    const c = bus();
    env(c.gain, t, v * 0.5, 0.001, 0.03);
    osc('square', 3000, t, t + 0.05, c);
  }

  // Sustained TV static (stop it with padStop(id))
  function hiss(id = 'hiss', v = 0.06, fade = 0.05) {
    if (!ok()) return;
    padStop(id, 0.02);
    const t = ctx.currentTime;
    const g = bus(0.2);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(v, t + fade);
    const f = filter('highpass', 1200);
    f.connect(g);
    const n = ctx.createBufferSource();
    n.buffer = noiseBuf;
    n.loop = true;
    n.connect(f);
    n.start(t);
    pads.set(id, { g, oscs: [n] });
  }

  // Typewriter key: a papery click plus a small body thump
  function key(v = 0.16) {
    if (!ok()) return;
    const t = ctx.currentTime;
    const g = bus(0.08, (Math.random() - 0.5) * 0.5);
    env(g.gain, t, v, 0.001, 0.04);
    const f = filter('bandpass', 2600 + Math.random() * 1200, 1.2);
    f.connect(g);
    noise(t, t + 0.06, f);
    const th = bus(0.05);
    env(th.gain, t, v * 0.6, 0.002, 0.05);
    osc('sine', 190 + Math.random() * 40, t, t + 0.07, th);
  }

  function tick(v = 0.05) {
    if (!ok()) return;
    const t = ctx.currentTime;
    const g = bus(0.1, (Math.random() - 0.5));
    env(g.gain, t, v, 0.001, 0.02);
    osc('square', 2600 + Math.random() * 900, t, t + 0.04, g);
  }

  // Sustained detuned-saw pads (drones / chords)
  function pad(id, freqs, fade = 2, v = 0.08, cut = 700) {
    if (!ok()) return;
    padStop(id, 0.05);
    const t = ctx.currentTime;
    const g = bus(0.6);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(v, t + fade);
    const lp = filter('lowpass', cut, 1.2);
    lp.connect(g);
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.15;
    const lg = ctx.createGain();
    lg.gain.value = cut * 0.4;
    lfo.connect(lg).connect(lp.frequency);
    lfo.start(t);
    const oscs = [lfo];
    freqs.forEach(f => [-8, 8].forEach(cents => {
      const o = ctx.createOscillator();
      o.type = 'sawtooth';
      o.frequency.value = f;
      o.detune.value = cents;
      o.connect(lp);
      o.start(t);
      oscs.push(o);
    }));
    pads.set(id, { g, oscs });
  }

  function padStop(id, fade = 1.5) {
    const p = pads.get(id);
    if (!p || !ctx) return;
    pads.delete(id);
    const t = ctx.currentTime;
    p.g.gain.cancelScheduledValues(t);
    p.g.gain.setValueAtTime(Math.max(p.g.gain.value, 0.0001), t);
    p.g.gain.exponentialRampToValueAtTime(0.0001, t + fade);
    p.oscs.forEach(o => o.stop(t + fade + 0.05));
  }

  function stopAll(fade = 0.08) {
    [...pads.keys()].forEach(k => padStop(k, fade));
  }

  function setMuted(m) {
    muted = m;
    if (out) out.gain.setTargetAtTime(m ? 0 : VOL, ctx.currentTime, 0.04);
  }

  return {
    init, kick, hat, clap, boom, bell, bass, whoosh, riser, braam, crash, tick, key, glitch, beep, zap, hiss, plip, bubbles, swell, flutter, cry, pad, padStop, stopAll,
    setMuted,
    isMuted: () => muted,
    suspend: () => ctx && ctx.suspend(),
    resume: () => ctx && ctx.resume(),
  };
})();
