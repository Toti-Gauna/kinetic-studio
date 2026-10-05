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
else btn.addEventListener('click', () => { btn.remove(); tl.restart(); });
