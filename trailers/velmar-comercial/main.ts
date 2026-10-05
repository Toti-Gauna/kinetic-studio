/* VELMAR — comercial de 30 s con capturas reales de la demo (trailers/velmar-comercial/shots). */
import { gsap } from 'gsap';

const stage = document.getElementById('stage')!;
const fit = () => { const s = Math.min(innerWidth / 1920, innerHeight / 1080); stage.style.transform = `translate(-50%,-50%) scale(${s})`; };
addEventListener('resize', fit); fit();

const tl = gsap.timeline({ paused: true });
const show = (id: string, at: number, len: number) => {
  tl.fromTo(id, { opacity: 0 }, { opacity: 1, duration: 0.35 }, at).to(id, { opacity: 0, duration: 0.35 }, at + len - 0.35);
};
// screenshot scene: window slides in and slowly pushes in, caption rises
const shot = (id: string, at: number, len: number) => {
  show(id, at, len);
  tl.fromTo(`${id} .win`, { y: 120, rotate: -1.5 }, { y: 0, rotate: 0, duration: 0.9, ease: 'expo.out', stagger: 0.25 }, at)
    .fromTo(`${id} .win img`, { scale: 1 }, { scale: 1.08, duration: len, ease: 'none', transformOrigin: '30% 30%' }, at)
    .fromTo(`${id} h2`, { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out' }, at + 0.3);
};

show('#s-intro', 0, 2.5);
tl.fromTo('#s-intro .logo', { scale: 1.3, opacity: 0, filter: 'blur(20px)' }, { scale: 1, opacity: 1, filter: 'blur(0px)', duration: 1.4, ease: 'expo.out' }, 0.1)
  .fromTo('#s-intro .tag', { opacity: 0, letterSpacing: '30px' }, { opacity: 1, letterSpacing: '8px', duration: 1.2 }, 0.8);
// act I — the store
shot('#s-home', 2.5, 2.5);
shot('#s-crear', 5, 2.5);
shot('#s-cat', 7.5, 2.5);
shot('#s-pay', 10, 2.5);
shot('#s-club', 12.5, 2);
// act II — the admin dashboard
shot('#s-admin', 14.5, 2.5);
shot('#s-ped', 17, 2.5);
shot('#s-prod', 19.5, 2);
shot('#s-mkt', 21.5, 2);
show('#s-season', 23.5, 3);
tl.to('#s-season .sw', { clipPath: 'inset(0 0% 0 0)', duration: 0.4, ease: 'expo.inOut', stagger: 0.7 }, 23.6)
  .fromTo('#s-season .sw', { fontSize: 200 }, { fontSize: 250, duration: 1.2, stagger: 0.7 }, 23.6)
  .to('#s-season .sw', { clipPath: 'inset(0 0 0 100%)', duration: 0.4, ease: 'expo.inOut' }, 25.5)
  .fromTo('#s-season .kick', { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 }, 25.6);
show('#s-wa', 26.5, 2.4);
tl.fromTo('#s-wa .phone', { y: 300 }, { y: 0, duration: 0.7, ease: 'expo.out' }, 26.5)
  .to('#s-wa .b', { opacity: 1, duration: 0.2, stagger: 0.38 }, 26.9)
  .fromTo('#s-wa .wa-t', { x: 80, opacity: 0 }, { x: 0, opacity: 1, duration: 0.6 }, 26.8);
show('#s-end', 28.9, 1.1);
tl.set('#s-end', { opacity: 1 }, 30)
  .fromTo('#s-end .logo', { y: 40 }, { y: 0, duration: 0.8, ease: 'expo.out' }, 28.9);

// ?t=SECONDS freezes a frame (same convention as the rest of the hub)
const t = new URLSearchParams(location.search).get('t');
const btn = document.getElementById('play')!;
if (t !== null) { btn.remove(); tl.seek(+t); }
else btn.addEventListener('click', () => { btn.remove(); tl.restart(); score(); });

// ---- sound: everything synthesized with WebAudio (warm pad + soft beat at 100 BPM, whooshes on cuts, chime at the end)
function score() {
  const ac = new AudioContext(), t0 = ac.currentTime + 0.05, out = ac.createGain();
  out.gain.value = 0.8; out.connect(ac.destination);
  const env = (g: GainNode, at: number, peak: number, a: number, d: number) => {
    g.gain.setValueAtTime(0.0001, at); g.gain.exponentialRampToValueAtTime(peak, at + a); g.gain.exponentialRampToValueAtTime(0.0001, at + a + d);
  };
  const tone = (f: number, at: number, len: number, vol: number, type: OscillatorType = 'sine', a = 0.01) => {
    const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.value = f;
    env(g, t0 + at, vol, a, len); o.connect(g).connect(out); o.start(t0 + at); o.stop(t0 + at + a + len + 0.05);
  };
  const noise = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
  noise.getChannelData(0).forEach((_, i, d) => (d[i] = Math.random() * 2 - 1));
  const hiss = (at: number, len: number, vol: number, from: number, to: number) => {
    const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(); s.buffer = noise;
    f.type = 'bandpass'; f.Q.value = 1.2; f.frequency.setValueAtTime(from, t0 + at); f.frequency.exponentialRampToValueAtTime(to, t0 + at + len);
    env(g, t0 + at, vol, len * 0.6, len * 0.4); s.connect(f).connect(g).connect(out); s.start(t0 + at); s.stop(t0 + at + len + 0.05);
  };
  const beat = 0.6, chords = [[220, 277.2, 329.6], [185, 220, 277.2], [146.8, 185, 220], [164.8, 207.7, 246.9]]; // A – F#m – D – E
  for (let bar = 0; bar < 12; bar++) {
    const at = bar * beat * 4;
    chords[bar % 4].forEach(f => { tone(f, at, beat * 4, 0.05, 'triangle', 0.4); tone(f / 2, at, beat * 4, 0.04, 'sine', 0.3); });
    for (let b = 0; b < 4; b++) {
      const bt = at + b * beat; if (bt > 29) break;
      if (bt >= 2.4) { // kick
        const o = ac.createOscillator(), g = ac.createGain(); o.frequency.setValueAtTime(140, t0 + bt); o.frequency.exponentialRampToValueAtTime(45, t0 + bt + 0.15);
        env(g, t0 + bt, 0.5, 0.005, 0.25); o.connect(g).connect(out); o.start(t0 + bt); o.stop(t0 + bt + 0.3);
        hiss(bt + beat / 2, 0.05, 0.05, 8000, 9000); // off-beat hat
      }
      if (bt >= 2.4) tone(chords[bar % 4][(b * 2) % 3] * 2, bt + beat / 2, 0.25, 0.04, 'sine'); // pluck arp
    }
  }
  [2.5, 5, 7.5, 10, 12.5, 14.5, 17, 19.5, 21.5, 23.5, 26.5, 28.9].forEach(c => hiss(c - 0.3, 0.4, 0.12, 400, 4000)); // cut whooshes
  [23.6, 24.3, 25].forEach((c, i) => tone([440, 554.4, 659.3][i], c, 0.5, 0.15, 'square')); // season stabs
  [880, 1108.7, 1318.5, 1760].forEach((f, i) => tone(f, 28.9 + i * 0.08, 1.6, 0.08, 'sine')); // end chime
}
