/* VELMAR — "Objetos con alma". Comercial premium de ~33 s armado con componentes reales de la demo
   (capturados con Playwright a 2×, en ./c), escenas en 3D con GSAP, partículas por temporada en canvas,
   grano de película y una banda sonora cinematográfica sintetizada con WebAudio. */
import { gsap } from 'gsap';

const $ = (s: string) => document.querySelector(s) as HTMLElement;
const stage = $('#stage');
const fit = () => { const s = Math.min(innerWidth / 1920, innerHeight / 1080); stage.style.transform = `translate(-50%,-50%) scale(${s})`; };
addEventListener('resize', fit); fit();

export const DURATION = 33.5;
const tl = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' } });

// scene in/out: a soft rack-focus (blur + scale) crossfade
const scene = (id: string, a: number, b: number) => {
  tl.set(id, { visibility: 'visible' }, a)
    .fromTo(id, { opacity: 0, filter: 'blur(18px)', scale: 1.04 }, { opacity: 1, filter: 'blur(0px)', scale: 1, duration: 0.7, ease: 'power2.out' }, a)
    .to(id, { opacity: 0, filter: 'blur(14px)', scale: 0.98, duration: 0.5, ease: 'power2.in' }, b - 0.5)
    .set(id, { visibility: 'hidden' }, b);
};
const copy = (id: string, at: number) => {
  tl.fromTo(`${id} .copy .eyebrow`, { opacity: 0, letterSpacing: '22px' }, { opacity: 1, letterSpacing: '9px', duration: 1.2 }, at)
    .fromTo(`${id} .copy h2`, { opacity: 0, y: 50, filter: 'blur(12px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.1 }, at + 0.15)
    .fromTo(`${id} .copy p`, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.9 }, at + 0.55);
};
const sweep = (at: number) => tl.fromTo('#sweep', { x: '-120%' }, { x: '120%', duration: 1.3, ease: 'power2.inOut' }, at);

// 1 · cold open (0 – 3.6)
scene('#s-open', 0, 3.6);
tl.to('#s-open .hair', { scaleX: 1, duration: 1.6, ease: 'expo.inOut' }, 0.1)
  .to('#s-open .hair', { opacity: 0, duration: 0.6 }, 1.4)
  .fromTo('#s-open .o1', { opacity: 0, y: 30, filter: 'blur(16px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.3 }, 0.5)
  .fromTo('#s-open .o2', { opacity: 0, y: 30, filter: 'blur(16px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.3 }, 1.4)
  .to('#s-open h1', { scale: 1.06, duration: 3.2, ease: 'none' }, 0.4);

// 2 · products (3.6 – 7.2): cards float in depth, slow orbit
scene('#s-prod', 3.6, 7.2); copy('#s-prod', 3.9); sweep(3.7);
tl.fromTo('#s-prod .deck', { rotateY: -28, rotateX: 8, z: -300 }, { rotateY: -10, rotateX: 4, z: 0, duration: 3.6, ease: 'power1.out' }, 3.6)
  .fromTo('#s-prod .pc', { opacity: 0, y: 160, z: (i: number) => [-200, -500, -700, 200][i] },
    { opacity: 1, y: 0, duration: 1.4, stagger: 0.14, ease: 'expo.out' }, 3.7)
  .to('#s-prod .p1', { y: -30, duration: 3, ease: 'sine.inOut' }, 5)
  .to('#s-prod .p2', { y: 25, duration: 3, ease: 'sine.inOut' }, 5)
  .fromTo('#s-prod .p3', { filter: 'blur(0px)' }, { filter: 'blur(3px)', duration: 2 }, 5);

// 3 · live personalization (7.2 – 10.8): the name types itself, the preview answers
scene('#s-live', 7.2, 10.8); copy('#s-live', 8.1);
tl.fromTo('#s-live .namebox', { rotateY: 28, x: -120, z: -200, opacity: 0 }, { rotateY: 14, x: 0, z: 0, opacity: 1, duration: 1.4, ease: 'expo.out' }, 7.3)
  .fromTo('#s-live .preview', { rotateY: -28, x: 120, z: -200, opacity: 0 }, { rotateY: -12, x: 0, z: 80, opacity: 1, duration: 1.4, ease: 'expo.out' }, 7.45)
  .to('#s-live .preview', { rotateY: -4, z: 160, duration: 2.8, ease: 'sine.inOut' }, 8.3)
  .fromTo('#s-live .giant', { opacity: 0, letterSpacing: '120px' }, { opacity: 1, letterSpacing: '30px', duration: 3, ease: 'power2.out' }, 7.4);

// 4 · storefront (10.8 – 14.6): laptop rises, phones flank, light → dark mode
scene('#s-store', 10.8, 14.6); copy('#s-store', 11.0);
tl.fromTo('#s-store .laptop', { rotateX: 32, y: 240, z: -400 }, { rotateX: 8, y: 40, z: 0, duration: 2, ease: 'expo.out' }, 10.8)
  .to('#s-store .laptop', { rotateX: 2, y: 20, duration: 1.8, ease: 'sine.inOut' }, 12.8)
  .fromTo('#s-store .ph1', { x: -260, rotateY: 30, opacity: 0 }, { x: 0, rotateY: 16, opacity: 1, duration: 1.5, ease: 'expo.out' }, 11.2)
  .fromTo('#s-store .ph2', { x: 260, rotateY: -30, opacity: 0 }, { x: 0, rotateY: -16, opacity: 1, duration: 1.5, ease: 'expo.out' }, 11.35)
  .to('#s-store .screen .darkshot', { clipPath: 'inset(0 0% 0 0)', duration: 1, ease: 'expo.inOut' }, 12.9)
  .fromTo('#s-store .glare', { x: '-100%' }, { x: '100%', duration: 1.1, ease: 'power2.inOut' }, 12.9);

// 5 · checkout (14.6 – 17.6): UI pieces cascade in 3D
scene('#s-check', 14.6, 17.6); copy('#s-check', 14.9);
tl.fromTo('#s-check .cmp', { opacity: 0, rotateX: 40, rotateY: 18, y: 140, z: -300 },
    { opacity: 1, rotateX: 10, rotateY: 14, y: 0, z: 0, duration: 1.3, stagger: 0.16, ease: 'expo.out' }, 14.7)
  .to('#s-check .persp', { y: -40, duration: 3, ease: 'none' }, 14.6)
  .to('#s-check .ticket', { z: 140, rotateY: 6, duration: 1.4, ease: 'sine.inOut' }, 15.9);

// 6 · club (17.6 – 20.6): the coupon wheel spins and lands
scene('#s-club', 17.6, 20.6); copy('#s-club', 17.9); sweep(17.7);
tl.fromTo('#s-club .clubhero', { rotateY: 18, rotateX: 6, x: -160, opacity: 0 }, { rotateY: 10, rotateX: 4, x: 0, opacity: .9, duration: 1.4, ease: 'expo.out' }, 17.6)
  .fromTo('#s-club .wheelwrap', { scale: .6, opacity: 0 }, { scale: 1, opacity: 1, duration: 1, ease: 'back.out(1.4)' }, 17.8)
  .fromTo('#s-club .wheel', { rotate: 0 }, { rotate: 1440 + 22, duration: 2.6, ease: 'power4.out' }, 17.8);

// 7 · admin (20.6 – 24.4): the dashboard recedes, its widgets fly out to camera
scene('#s-admin', 20.6, 24.4); copy('#s-admin', 20.8);
tl.fromTo('#s-admin .board', { rotateX: 0, y: 0, z: 0, opacity: 0 }, { rotateX: 42, y: 140, z: -420, opacity: .55, duration: 2.2, ease: 'expo.inOut' }, 20.6)
  .fromTo('#s-admin .cmp', { opacity: 0, z: -500, rotateX: 40 }, { opacity: 1, z: 60, rotateX: 8, duration: 1.4, stagger: 0.15, ease: 'expo.out' }, 21.5)
  .to('#s-admin .k1', { y: -30, rotateY: 10, duration: 2, ease: 'sine.inOut' }, 22.4)
  .to('#s-admin .k2', { y: -20, rotateY: -10, duration: 2, ease: 'sine.inOut' }, 22.4)
  .to('#s-admin .persp', { scale: 1.05, duration: 3.8, ease: 'none' }, 20.6);

// 8 · seasons (24.4 – 27.8): each date regrades the store and changes the particles
scene('#s-season', 24.4, 27.8); copy('#s-season', 26.4);
tl.fromTo('#s-season .bgshot', { scale: 1 }, { scale: 1.12, duration: 3.4, ease: 'none' }, 24.4);
[['.w1', '#ff7a1a', 24.5], ['.w2', '#c0262d', 25.35], ['.w3', '#d2ad69', 26.2]].forEach(([w, c, at]) => {
  const t = at as number;
  tl.to('#s-season .grade', { background: c as string, opacity: 0.55, duration: 0.3 }, t)
    .fromTo(`#s-season ${w}`, { opacity: 0, scale: 1.25, filter: 'blur(20px)' }, { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.5, ease: 'expo.out' }, t)
    .to(`#s-season ${w}`, { opacity: 0, scale: 0.92, filter: 'blur(14px)', duration: 0.35, ease: 'power2.in' }, t + (w === '.w3' ? 2.2 : 0.75));
});
tl.to('#s-season .words', { y: -60, duration: 0.6 }, 26.4);

// 9 · WhatsApp AI (27.8 – 30.6)
scene('#s-wa', 27.8, 30.6); copy('#s-wa', 28.0);
tl.fromTo('#s-wa .chat', { rotateY: 26, y: 300, opacity: 0 }, { rotateY: 12, y: 0, opacity: 1, duration: 1.2, ease: 'expo.out' }, 27.8)
  .to('#s-wa .chat', { rotateY: 4, duration: 2.6, ease: 'sine.inOut' }, 28.6)
  .fromTo('#s-wa .b', { opacity: 0, y: 20, scale: .9 }, { opacity: 1, y: 0, scale: 1, duration: 0.3, stagger: 0.36, ease: 'back.out(2)' }, 28.2)
  .fromTo('#s-wa .typing', { opacity: 0 }, { opacity: 1, duration: 0.2 }, 30.1)
  .to('#s-wa .typing i', { y: -6, duration: 0.2, stagger: { each: 0.08, repeat: 3, yoyo: true } }, 30.1);

// 10 · end card (30.6 – 33.5)
tl.set('#s-end', { visibility: 'visible' }, 30.6)
  .fromTo('#s-end', { opacity: 0 }, { opacity: 1, duration: 0.6 }, 30.6)
  .fromTo('#s-end .chev path', { strokeDasharray: 140, strokeDashoffset: 140 }, { strokeDashoffset: 0, duration: 0.9, stagger: 0.15, ease: 'power2.inOut' }, 30.7)
  .fromTo('#s-end .logo', { opacity: 0, letterSpacing: '30px', filter: 'blur(20px)' }, { opacity: 1, letterSpacing: '-4px', filter: 'blur(0px)', duration: 1.6, ease: 'expo.out' }, 30.9)
  .to('#s-end .rule', { scaleX: 1, duration: 1.2, ease: 'expo.inOut' }, 31.5)
  .fromTo('#s-end .tag', { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.9 }, 31.8)
  .fromTo('#s-end .cta', { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.9 }, 32.2);
sweep(31.2);
tl.set({}, {}, DURATION);

// ---- particles: gold dust most of the time; embers / snow / confetti during the seasons
const cv = $('#dust') as unknown as HTMLCanvasElement, cx = cv.getContext('2d')!;
type P = { x: number; y: number; vx: number; vy: number; r: number; a: number; s: number; c: string };
const rnd = (a: number, b: number) => a + Math.random() * (b - a);
const ps: P[] = Array.from({ length: 140 }, () => ({ x: rnd(0, 1920), y: rnd(0, 1080), vx: 0, vy: 0, r: rnd(.6, 2.6), a: rnd(.15, .7), s: rnd(0, 6.28), c: '' }));
const mode = (t: number) => (t >= 24.5 && t < 25.35 ? 'ember' : t >= 25.35 && t < 26.2 ? 'snow' : t >= 26.2 && t < 27.8 ? 'confetti' : 'dust');
const CONF = ['#d2ad69', '#f0d9a6', '#f6f1e8', '#e88aa0'];
let last = performance.now();
const frame = (now: number) => {
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  const m = mode(tl.time());
  cx.clearRect(0, 0, 1920, 1080);
  for (const p of ps) {
    p.s += dt;
    if (m === 'dust') { p.vx = Math.sin(p.s * .7) * 12; p.vy = -8 - p.r * 4; p.c = '#e9cf98'; }
    else if (m === 'ember') { p.vx = Math.sin(p.s * 3) * 40; p.vy = -90 - p.r * 40; p.c = p.r > 1.6 ? '#ffb15c' : '#ff6a1a'; }
    else if (m === 'snow') { p.vx = Math.sin(p.s) * 30; p.vy = 60 + p.r * 30; p.c = '#ffffff'; }
    else { p.vx = Math.sin(p.s * 2) * 60; p.vy = 140 + p.r * 40; if (!CONF.includes(p.c)) p.c = CONF[Math.floor(Math.random() * 4)]; }
    p.x += p.vx * dt; p.y += p.vy * dt;
    if (p.y < -10) { p.y = 1090; p.x = rnd(0, 1920); } if (p.y > 1090) { p.y = -10; p.x = rnd(0, 1920); }
    if (p.x < -10) p.x = 1930; if (p.x > 1930) p.x = -10;
    cx.globalAlpha = p.a * (m === 'dust' ? .8 : 1);
    cx.fillStyle = p.c;
    if (m === 'confetti') { cx.save(); cx.translate(p.x, p.y); cx.rotate(p.s * 4); cx.fillRect(-p.r * 2, -p.r, p.r * 4, p.r * 2); cx.restore(); }
    else { cx.beginPath(); cx.arc(p.x, p.y, m === 'snow' ? p.r * 1.6 : p.r, 0, 6.283); cx.fill(); }
  }
  requestAnimationFrame(frame);
};
requestAnimationFrame(frame);

// ---- film grain: a few pre-rendered noise tiles cycled every other frame
const tiles = Array.from({ length: 6 }, () => {
  const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d')!, d = g.createImageData(256, 256);
  for (let i = 0; i < d.data.length; i += 4) { const v = Math.random() * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; }
  g.putImageData(d, 0, 0); return `url(${c.toDataURL()})`;
});
let gi = 0; setInterval(() => { $('#grain').style.backgroundImage = tiles[gi++ % tiles.length]; }, 70);

// ---- sound: a cinematic score, fully synthesized
let ac: AudioContext | null = null, master: GainNode;
function score() {
  ac = new AudioContext();
  const t0 = ac.currentTime + 0.08;
  const comp = ac.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 3; comp.connect(ac.destination);
  master = ac.createGain(); master.gain.value = 0.9; master.connect(comp);
  // reverb: a decaying stereo noise impulse
  const ir = ac.createBuffer(2, ac.sampleRate * 3.2, ac.sampleRate);
  for (let ch = 0; ch < 2; ch++) { const d = ir.getChannelData(ch); for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 2.6); }
  const verb = ac.createConvolver(); verb.buffer = ir; const vg = ac.createGain(); vg.gain.value = 0.45; verb.connect(vg).connect(master);
  const bus = (wet: number) => { const g = ac!.createGain(); g.connect(master); const s = ac!.createGain(); s.gain.value = wet; g.connect(s).connect(verb); return g; };
  const dry = bus(0.15), wetBus = bus(0.8);
  const env = (g: AudioParam, at: number, peak: number, a: number, d: number) => {
    g.setValueAtTime(0.0001, at); g.exponentialRampToValueAtTime(peak, at + a); g.exponentialRampToValueAtTime(0.0001, at + a + d);
  };
  const noise = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate); const nd = noise.getChannelData(0); for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
  const hz = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

  // warm pad: detuned saws through a slow low-pass
  const pad = (notes: number[], at: number, len: number, vol = 0.035, cut = 900) => {
    const f = ac!.createBiquadFilter(); f.type = 'lowpass'; f.Q.value = 0.7;
    f.frequency.setValueAtTime(cut * 0.5, t0 + at); f.frequency.linearRampToValueAtTime(cut, t0 + at + len * 0.6);
    const g = ac!.createGain(); g.gain.setValueAtTime(0.0001, t0 + at); g.gain.linearRampToValueAtTime(vol, t0 + at + Math.min(1.2, len * .4));
    g.gain.setValueAtTime(vol, t0 + at + len - 0.6); g.gain.linearRampToValueAtTime(0.0001, t0 + at + len + 0.4);
    f.connect(g).connect(wetBus);
    notes.forEach(n => [-7, 7].forEach(dt => { const o = ac!.createOscillator(); o.type = 'sawtooth'; o.frequency.value = hz(n); o.detune.value = dt; o.connect(f); o.start(t0 + at); o.stop(t0 + at + len + 0.6); }));
  };
  // felt piano: sine + soft harmonics with a long decay
  const piano = (n: number, at: number, vol = 0.12, len = 2.4) => {
    [[1, 1], [2, .35], [3, .12], [4.01, .05]].forEach(([h, v]) => {
      const o = ac!.createOscillator(), g = ac!.createGain(); o.frequency.value = hz(n) * h; env(g.gain, t0 + at, vol * v, 0.006, len / h);
      o.connect(g).connect(wetBus); o.start(t0 + at); o.stop(t0 + at + len + 0.1);
    });
  };
  const bell = (n: number, at: number, vol = 0.08) => { [1, 2.76, 5.4].forEach((h, i) => { const o = ac!.createOscillator(), g = ac!.createGain(); o.frequency.value = hz(n) * h; env(g.gain, t0 + at, vol / (i + 1), 0.004, 2.2 / (i + 1)); o.connect(g).connect(wetBus); o.start(t0 + at); o.stop(t0 + at + 2.5); }); };
  const boom = (at: number, vol = 0.9) => {
    const o = ac!.createOscillator(), g = ac!.createGain(); o.frequency.setValueAtTime(90, t0 + at); o.frequency.exponentialRampToValueAtTime(32, t0 + at + 1.2);
    env(g.gain, t0 + at, vol, 0.01, 1.6); o.connect(g).connect(dry); o.start(t0 + at); o.stop(t0 + at + 1.8);
    const s = ac!.createBufferSource(), f = ac!.createBiquadFilter(), h = ac!.createGain(); s.buffer = noise; f.type = 'lowpass'; f.frequency.value = 1800;
    env(h.gain, t0 + at, 0.35, 0.005, 0.9); s.connect(f).connect(h).connect(wetBus); s.start(t0 + at); s.stop(t0 + at + 1);
  };
  const riser = (at: number, len: number, vol = 0.16) => {
    const s = ac!.createBufferSource(), f = ac!.createBiquadFilter(), g = ac!.createGain(); s.buffer = noise; s.loop = true;
    f.type = 'bandpass'; f.Q.value = 2; f.frequency.setValueAtTime(300, t0 + at); f.frequency.exponentialRampToValueAtTime(7000, t0 + at + len);
    g.gain.setValueAtTime(0.0001, t0 + at); g.gain.exponentialRampToValueAtTime(vol, t0 + at + len); g.gain.exponentialRampToValueAtTime(0.0001, t0 + at + len + 0.08);
    s.connect(f).connect(g).connect(wetBus); s.start(t0 + at); s.stop(t0 + at + len + 0.1);
  };
  const whoosh = (at: number, vol = 0.1) => {
    const s = ac!.createBufferSource(), f = ac!.createBiquadFilter(), g = ac!.createGain(); s.buffer = noise;
    f.type = 'bandpass'; f.Q.value = 1; f.frequency.setValueAtTime(500, t0 + at); f.frequency.exponentialRampToValueAtTime(3500, t0 + at + 0.25); f.frequency.exponentialRampToValueAtTime(400, t0 + at + 0.6);
    env(g.gain, t0 + at, vol, 0.25, 0.4); s.connect(f).connect(g).connect(wetBus); s.start(t0 + at); s.stop(t0 + at + 0.7);
  };
  const tick = (at: number, vol = 0.06) => { const o = ac!.createOscillator(), g = ac!.createGain(); o.type = 'square'; o.frequency.value = 2400; env(g.gain, t0 + at, vol, 0.001, 0.03); o.connect(g).connect(dry); o.start(t0 + at); o.stop(t0 + at + 0.05); };
  const kick = (at: number, vol = 0.45) => { const o = ac!.createOscillator(), g = ac!.createGain(); o.frequency.setValueAtTime(120, t0 + at); o.frequency.exponentialRampToValueAtTime(42, t0 + at + 0.18); env(g.gain, t0 + at, vol, 0.004, 0.32); o.connect(g).connect(dry); o.start(t0 + at); o.stop(t0 + at + 0.4); };
  const shaker = (at: number, vol = 0.03) => { const s = ac!.createBufferSource(), f = ac!.createBiquadFilter(), g = ac!.createGain(); s.buffer = noise; f.type = 'highpass'; f.frequency.value = 7000; env(g.gain, t0 + at, vol, 0.004, 0.06); s.connect(f).connect(g).connect(dry); s.start(t0 + at); s.stop(t0 + at + 0.1); };

  // harmony (D minor → F major at the end): Dm9 · Bbmaj7 · Gm9 · A7sus · F
  const Dm = [50, 57, 60, 64, 65], Bb = [46, 53, 57, 62, 65], Gm = [43, 50, 57, 58, 62], Asus = [45, 52, 55, 62, 64], F = [41, 53, 57, 60, 64, 69];
  pad(Dm, 0, 3.6, 0.03, 600);
  pad(Bb, 3.6, 3.6); pad(Gm, 7.2, 3.6); pad(Dm, 10.8, 3.8, .04, 1300); pad(Bb, 14.6, 3); pad(Gm, 17.6, 3);
  pad(Dm, 20.6, 3.8, .045, 1600); pad(Asus, 24.4, 3.4, .04, 1400); pad(Bb, 27.8, 2.8); pad(F, 30.6, 3.4, .045, 1800);
  // piano motif — sparse in the open, then a recurring figure
  [[74, 0.5], [72, 1.4], [69, 2.2], [77, 2.9]].forEach(([n, t]) => piano(n, t, 0.11, 3));
  const motif = [69, 72, 74, 77, 76, 74, 72, 74];
  for (let bar = 0; bar < 7; bar++) {
    const start = 3.6 + bar * 3.6 * (24.2 / 25.2); if (start > 27.4) break;
    motif.forEach((n, i) => i % 2 === 0 || bar > 1 ? piano(n + (bar % 2 ? -2 : 0), start + i * 0.45, 0.07, 1.6) : null);
  }
  // pulse from the storefront to the seasons (84 BPM, eighth-note shaker)
  const beat = 60 / 84;
  for (let t = 10.8; t < 27.7; t += beat) { kick(t, t > 20.6 ? 0.5 : 0.38); shaker(t + beat / 2); if (t > 20.6) shaker(t + beat / 4, 0.018); }
  // hits & risers on the big moments
  [3.6, 10.8, 20.6, 24.5, 30.6].forEach(t => boom(t, t === 30.6 ? 1 : 0.8));
  [[2.2, 1.4], [9.6, 1.2], [19.3, 1.3], [23.4, 1.1], [29.2, 1.4]].forEach(([a, l]) => riser(a, l));
  [7.2, 14.6, 17.6, 27.8].forEach(t => whoosh(t - 0.2));
  // typing in the live scene and the chat, the wheel clicking, season bells
  [7.6, 7.8, 8.0, 8.2].forEach(t => tick(t));
  for (let i = 0; i < 26; i++) tick(17.8 + 2.6 * (1 - Math.pow(1 - i / 26, 0.35)), 0.04);
  [28.2, 28.56, 28.92, 29.28, 29.64].forEach(t => bell(81, t, 0.04));
  bell(64, 24.5, 0.12); bell(71, 25.35, 0.12); bell(76, 26.2, 0.14);
  // final chord shimmer
  [81, 84, 88, 93].forEach((n, i) => bell(n, 31 + i * 0.12, 0.06));
}

// ---- transport
const gate = $('#gate');
const params = new URLSearchParams(location.search);
const t = params.get('t');
if (t !== null) { gate.remove(); tl.seek(+t); }
const start = () => { gate.classList.add('off'); setTimeout(() => gate.remove(), 700); tl.restart(); ac?.close(); score(); };
$('#play')?.addEventListener('click', start);
addEventListener('keydown', e => {
  if (e.code === 'Space') { e.preventDefault(); if (tl.paused()) { tl.resume(); ac?.resume(); } else { tl.pause(); ac?.suspend(); } }
  if (e.key === 'm' || e.key === 'M') if (master) master.gain.value = master.gain.value > 0 ? 0 : 0.9;
  if (e.key === 'r' || e.key === 'R') start();
  if (e.key === 'f' || e.key === 'F') document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen();
});
