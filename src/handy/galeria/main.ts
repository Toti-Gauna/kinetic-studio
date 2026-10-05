/* Galería de componentes de Handy — solo para desarrollo, no se publica.
   npm run dev → http://localhost:5173/src/handy/galeria.html
   ?seccion=logo|handys|app|chat|especialista|app2026|app2026-ua…eb muestra una sola sección · ?t=SEGUNDOS congela las demos animadas en ese segundo. */
import { gsap } from 'gsap';
import '../css/base.css';
import './galeria.css';
import type { Seccion } from './tipos.ts';
import logo from './logo.ts';
import handys from './handys.ts';
import app from './app.ts';
import chat from './chat.ts';
import especialista from './especialista.ts';
import app2026 from './app2026.ts';
import app2026ua from './app2026-ua.ts';
import app2026ub from './app2026-ub.ts';
import app2026uc from './app2026-uc.ts';
import app2026ea from './app2026-ea.ts';
import app2026eb from './app2026-eb.ts';

const SECCIONES: Seccion[] = [logo, handys, app, chat, especialista, app2026, app2026ua, app2026ub, app2026uc, app2026ea, app2026eb];
const q = new URLSearchParams(location.search);
const solo = q.get('seccion');
const root = document.getElementById('galeria')!;
const tl = gsap.timeline({ paused: true });

for (const s of SECCIONES) {
  if (solo && s.id !== solo) continue;
  const sec = document.createElement('section');
  sec.className = 'hd-gal-seccion';
  sec.id = s.id;
  sec.innerHTML = `<h2 class="hd-gal-titulo">${s.titulo}</h2><div class="hd-gal-cuerpo hd-ui"></div>`;
  root.appendChild(sec);
  s.render(sec.querySelector<HTMLElement>('.hd-gal-cuerpo')!, tl);
}

document.fonts.ready.then(() => {
  const t = q.get('t');
  if (t !== null) tl.seek(parseFloat(t) || 0);
  else if (tl.duration() > 0) tl.repeat(-1).repeatDelay(0.6).play(0);
  document.documentElement.dataset.galeria = 'lista';
});
