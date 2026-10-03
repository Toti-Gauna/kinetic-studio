/* HANDY · App de usuario — escenas 1 y 2 (grupo A).
   Acá se registran (Trailer.recipe), reemplazando a las provisorias de escenas-base.js:
     'hd-gancho'    escena 1 · gancho    0–8 s   (devuelve 8)   "Se rompió algo en casa."
       El Caño, grande, gotea: dos gotitas se forman en el pico, tiemblan y caen con un "plic" en el tiempo
       (1,5 s y 3 s) y arman un charco. A la tercera se forma la Gota (el personaje): abre los ojos, mira para abajo,
       se suelta y cae (5 s): se aplasta, salpica, rebota y mira a los costados; el Caño se asusta y se preocupa.
       La "cámara" se corre a la izquierda y entra el titular a la derecha; al final todo sale por la izquierda.
     'hd-problema'  escena 2 · problema  8–18 s  (devuelve 10)  "Preguntás. Esperás. Nadie confirma."
       Tres grupos de mensajería genéricos (GRUPOS_PROBLEMA) entran desde la derecha y se apilan: la misma pregunta
       con tildes grises, "Visto", respuestas que no sirven y un "¿Alguien?" que nadie lee. Un reloj gira las agujas y
       la hora salta 10:02 → 12:47 → 16:30 → 19:15 (capas de texto que se cruzan con opacidad). El titular entra en tres
       golpes (8,5 · 11,5 · 15 s) y a los 16,9 s todo se cae: a los 18 s el escenario queda gris y vacío.
   Sangrado (src/handy/layout.ts): en pantallas que no son 4:3 se ve más allá del cuadro de 1440×1080. Lo que espera,
   entra o sale "afuera" (las tarjetas a la derecha, el mundo del gancho a la izquierda, lo que se cae) suma afuera():
   arranca y termina más allá del borde de la pantalla, no en el del cuadro. En 4:3 suma 0 y todo queda igual.
   Reglas: solo transform y opacity; todo en D.tl en tiempos absolutos desde T; estados iniciales con gsap.set;
   sin from/fromTo ni azar (los salpicones están puestos a mano). Clases propias con prefijo hd-a1- / hd-a2-. */
import { gsap } from 'gsap';
import { handy, puntoGoteo, anchoHandy } from '../../../src/handy/handys.ts';
import { humor, parpadeo, idle } from '../../../src/handy/handys-anim.ts';
import { titular, prepararTitular, entraTitular, saleTitular } from '../../../src/handy/ui/Headline.ts';
import { burbujaEscribiendo } from '../../../src/handy/ui/ChatBubble.ts';
import { grupoMensajeria, GRUPOS_PROBLEMA } from '../../../src/handy/pantallas/usuario-chat.ts';
import { afuera } from '../../../src/handy/layout.ts';

/* ───────────────────────── estilos de las dos escenas ───────────────────────── */

const AGUA = { relleno: '#92CEFE', trazo: '#66BEF8' }; // los colores de la Gota (handys.ts)

const CSS = `
.hd-a1, .hd-a2 { position: absolute; inset: 0; }
.hd-a1-mundo { position: absolute; inset: 0; will-change: transform; }
.hd-a1-cano, .hd-a1-gota, .hd-a1-charco, .hd-a1-chispa, .hd-a1-anillo { position: absolute; }
.hd-a1-forma { transform-origin: 50% 0%; }
.hd-a1-chispa { border-radius: 50%; background: ${AGUA.relleno}; border: 2px solid ${AGUA.trazo}; }
.hd-a1-tit .hd-tit-grupo, .hd-a2-tit .hd-tit-grupo { display: block; }
.hd-a2-tarjeta { position: absolute; }
.hd-a2-zoom { zoom: 1.4; }
.hd-a2-reloj { position: absolute; }
.hd-a2-reloj svg { display: block; overflow: visible; }
.hd-a2-hora { position: absolute; width: 300px; height: 96px; overflow: hidden; font: 800 72px/96px var(--hd-font);
  letter-spacing: -0.03em; color: var(--hd-tinta-suave); font-variant-numeric: tabular-nums; white-space: nowrap; }
.hd-a2-hora-capa { position: absolute; left: 0; top: 0; }
.hd-a2-escr { position: absolute; left: 0; top: 0; }
`;
if (!document.getElementById('hd-escenas-a')) {
  const st = document.createElement('style');
  st.id = 'hd-escenas-a';
  st.textContent = CSS;
  document.head.appendChild(st);
}

/** px con dos decimales para los style inline */
const px = n => `${Math.round(n * 100) / 100}px`;

/* ══════════════════════════ ESCENA 1 · GANCHO (0–8 s) ══════════════════════════ */

const A1 = {
  altoCano: 700,
  cano: { x: 100, y: 186 },     // esquina del wrapper del caño en el cuadro final (después del paneo)
  altoGota: 160,                // la Gota, personaje
  altoGotita: 46,               // las dos gotitas
  paneo: 312,                   // x del "mundo" al arrancar: el caño queda centrado
  tit: { x: 800, y: 436, tamano: 80, ancho: 580 },
};
A1.piso = A1.cano.y + A1.altoCano;                         // 886: los pies del caño
A1.pico = (() => { const g = puntoGoteo(A1.altoCano); return { x: A1.cano.x + g.x, y: A1.cano.y + g.y }; })();

/** salpicones puestos a mano: [x de salida (desde el centro del impacto), dx, alto del arco, radio, duración].
    Salen de los costados del pie de la gota y van detrás de ella, así nunca le pasan por la cara. */
const SALPICON_CHICO = [
  [[-10, -24, -30, 4.5, 0.36], [10, 28, -40, 4, 0.4], [-4, -8, -50, 3.2, 0.42]],
  [[10, 22, -34, 4.5, 0.36], [-10, -28, -44, 4, 0.4], [4, 8, -54, 3.2, 0.42]],
];
const SALPICON_GRANDE = [[-50, -66, -80, 9, 0.52], [-44, -40, -128, 7, 0.58], [-38, -16, -70, 5.5, 0.44],
  [38, 16, -112, 6.5, 0.54], [44, 42, -136, 8, 0.6], [50, 66, -78, 9, 0.52]];

function htmlGancho() {
  const { pico, piso } = A1;
  const gota = (cls, alto, arriba) => {
    const ancho = anchoHandy('gota', alto);
    return `<div class="hd-a1-gota ${cls}" style="left:${px(pico.x - ancho / 2)};top:${px(pico.y - arriba)};width:${px(ancho)};height:${px(alto)}">`
      + `<div class="hd-a1-forma">${handy('gota', { altura: alto, humor: 'preocupado' })}</div></div>`;
  };
  const chispas = (cls, defs) => defs.map(([x0, , , r]) =>
    `<i class="hd-a1-chispa ${cls}" style="left:${px(pico.x + x0 - r)};top:${px(piso - 10 - r)};width:${px(r * 2)};height:${px(r * 2)}"></i>`).join('');
  // orden de pintado: charco y onda › salpicones › gotas (detrás del pico del caño) › caño
  return `<div class="hd-a1 hd-ui">
    <div class="hd-a1-mundo">
      <svg class="hd-a1-charco" width="220" height="48" viewBox="-110 -24 220 48" style="left:${px(pico.x - 110)};top:${px(piso - 4 - 24)}" aria-hidden="true">
        <ellipse rx="92" ry="15" fill="${AGUA.relleno}" stroke="${AGUA.trazo}" stroke-width="4"/>
        <ellipse cx="-40" cy="-3" rx="17" ry="4" fill="#FFFFFF" opacity=".75"/>
      </svg>
      <svg class="hd-a1-anillo" width="260" height="60" viewBox="-130 -30 260 60" style="left:${px(pico.x - 130)};top:${px(piso - 4 - 30)}" aria-hidden="true">
        <ellipse rx="112" ry="20" fill="none" stroke="${AGUA.trazo}" stroke-width="4"/>
      </svg>
      ${chispas('hd-a1-chispa-0', SALPICON_CHICO[0])}${chispas('hd-a1-chispa-1', SALPICON_CHICO[1])}${chispas('hd-a1-chispa-2', SALPICON_GRANDE)}
      ${gota('hd-a1-gotita', A1.altoGotita, 3)}
      ${gota('hd-a1-gotita', A1.altoGotita, 3)}
      ${gota('hd-a1-heroe', A1.altoGota, 5)}
      <div class="hd-a1-cano" style="left:${px(A1.cano.x)};top:${px(A1.cano.y)}">${handy('cano', { altura: A1.altoCano })}</div>
    </div>
    <div style="position:absolute;left:${px(A1.tit.x)};top:${px(A1.tit.y)}">${titular({ texto: 'Se rompió algo|en casa.', tamano: A1.tit.tamano, ancho: A1.tit.ancho, className: 'hd-a1-tit' })}</div>
  </div>`;
}

/** las tres capas de una gota del pico: posición (y de la caída) › forma (crece desde el pico) › cuerpo (aplasta desde abajo) */
function partesGota(el) {
  return {
    pos: el,
    forma: el.querySelector('.hd-a1-forma'),
    cuerpo: el.querySelector('.hd-handy'),
    cara: el.querySelector('.hd-h-cara'),
    ojos: el.querySelector('.hd-h-humor[data-humor="preocupado"] .hd-h-ojos'),
  };
}

/** crece en el pico: pasos [duración, scaleX, scaleY, ease?] encadenados; devuelve la duración */
function crecer(tl, forma, at, pasos) {
  let t = at;
  for (const [d, sx, sy, ease] of pasos) {
    tl.to(forma, { scaleX: sx, scaleY: sy, duration: d, ease: ease || 'sine.inOut' }, t);
    t += d;
  }
  return t - at;
}

/** se estira, se suelta y cae `dy` px en `dur` s: la forma vuelve a 1 en el aire y el cuerpo se estira desde abajo */
function soltar(tl, g, at, dy, dur, estira = 1.18) {
  tl.to(g.forma, { scaleX: 0.86, scaleY: estira, duration: 0.12, ease: 'power2.in' }, at - 0.12);
  tl.to(g.pos, { y: dy, duration: dur, ease: 'power2.in' }, at);
  tl.to(g.forma, { scaleX: 1, scaleY: 1, duration: dur, ease: 'power1.out' }, at);
  tl.to(g.cuerpo, { scaleX: 0.9, scaleY: 1.12, duration: dur * 0.7, ease: 'power1.in' }, at);
}

/** salpicón: cada chispa vuela en arco desde el punto de impacto y se apaga */
function salpicar(tl, chispas, defs, at) {
  chispas.forEach((c, i) => {
    const [, dx, alto, , dur] = defs[i];
    tl.set(c, { opacity: 1 }, at);
    tl.to(c, { x: dx, duration: dur, ease: 'power1.out' }, at);
    tl.to(c, { y: alto, duration: dur * 0.45, ease: 'power2.out' }, at);
    tl.to(c, { y: 12, duration: dur * 0.55, ease: 'power2.in' }, at + dur * 0.45);
    tl.to(c, { scale: 0.3, opacity: 0, duration: dur * 0.35, ease: 'power1.in' }, at + dur * 0.65);
  });
}

Trailer.recipe('hd-gancho', (D, T, o) => {
  const tl = D.tl;
  const s = D.scene('gancho', htmlGancho());
  const mundo = D.$('.hd-a1-mundo', s);
  const cano = D.$('.hd-a1-cano .hd-handy', s);
  const canoCara = cano.querySelector('.hd-h-cara');
  const brazos = ['izq', 'der'].map(l => cano.querySelector(`.hd-h-brazo[data-lado="${l}"]`));
  const [g0, g1] = D.$$('.hd-a1-gotita', s).map(partesGota);
  const heroe = partesGota(D.$('.hd-a1-heroe', s));
  const charco = D.$('.hd-a1-charco', s);
  const anillo = D.$('.hd-a1-anillo', s);
  const chispas = [0, 1, 2].map(i => D.$$(`.hd-a1-chispa-${i}`, s));
  const tit = D.$('.hd-a1-tit', s);
  const { piso, pico, altoGota, altoGotita } = A1;
  const caidaGotita = piso - altoGotita - (pico.y - 3);   // 340 px
  const caidaGota = piso - altoGota - (pico.y - 5);       // 228 px

  // ── estados iniciales ──
  gsap.set(mundo, { x: A1.paneo });
  gsap.set([g0.cara, g1.cara, heroe.cara], { opacity: 0 });              // gotitas lisas; la Gota todavía sin cara
  gsap.set(heroe.ojos, { scaleY: 0.1, svgOrigin: heroe.ojos.getAttribute('data-origen') });
  gsap.set(g0.forma, { scaleX: 0.22, scaleY: 0.2 });                      // cuadro 0: ya hay una gotita asomando
  gsap.set([g1.forma, heroe.forma], { scale: 0 });
  gsap.set(charco, { scale: 0, transformOrigin: '50% 50%' });
  gsap.set(anillo, { scale: 0.3, opacity: 0, transformOrigin: '50% 50%' });
  gsap.set(chispas.flat(), { opacity: 0 });
  prepararTitular(tit);

  // primera escena: visible desde el armado, así el cuadro 0 ya está compuesto cuando se desvanece la
  // pantalla inicial (un tl.set justo en t = 0 recién se aplica cuando el cabezal se mueve)
  gsap.set(s, { autoAlpha: 1 });
  D.show(s, T);

  // ── el Caño: respira tranquilo hasta que cae la Gota ──
  idle(tl, cano, T, 5, { amp: 0.018 });
  const mira = (x, y, at, dur = 0.25, ease = 'power2.out') => tl.to(canoCara, { x, y, duration: dur, ease }, at);

  // ── gotita 1: ya está en el cuadro 0; cae en el tiempo 3 (1,5 s) ──
  crecer(tl, g0.forma, T, [[0.36, 0.4, 0.36], [0.34, 0.62, 0.64], [0.28, 0.86, 0.8], [0.12, 1, 1, 'sine.out']]);
  soltar(tl, g0, T + 1.22, caidaGotita, 0.28);
  const plic1 = T + 1.5;
  tl.to(g0.cuerpo, { scaleX: 1.9, scaleY: 0.28, duration: 0.07, ease: 'power2.out' }, plic1);
  tl.to(g0.cuerpo, { opacity: 0, duration: 0.16, ease: 'power1.in' }, plic1 + 0.05);
  salpicar(tl, chispas[0], SALPICON_CHICO[0], plic1);
  tl.to(charco, { scale: 0.36, duration: 0.4, ease: 'back.out(2)' }, plic1);
  D.sfx('plip', plic1, 0.22, 560);
  mira(-2.5, 4, plic1 + 0.05);
  mira(0, 0, T + 2.25, 0.3, 'power2.inOut');

  // ── la cámara se corre: lugar para el titular ──
  tl.to(mundo, { x: 0, duration: 0.95, ease: 'expo.inOut' }, T + 1.95);
  entraTitular(tl, tit, T + 2.45, { dur: 0.8, stagger: 0.07 });

  // ── gotita 2: cae en el tiempo 6 (3 s) ──
  crecer(tl, g1.forma, T + 1.36, [[0.3, 0.3, 0.26], [0.34, 0.55, 0.56], [0.32, 0.8, 0.76], [0.24, 1, 1]]);
  soltar(tl, g1, T + 2.72, caidaGotita, 0.28);
  const plic2 = T + 3;
  tl.to(g1.cuerpo, { scaleX: 1.9, scaleY: 0.28, duration: 0.07, ease: 'power2.out' }, plic2);
  tl.to(g1.cuerpo, { opacity: 0, duration: 0.16, ease: 'power1.in' }, plic2 + 0.05);
  salpicar(tl, chispas[1], SALPICON_CHICO[1], plic2);
  tl.to(charco, { scale: 0.62, duration: 0.4, ease: 'back.out(2)' }, plic2);
  D.sfx('plip', plic2, 0.24, 500);
  mira(-2.5, 4, plic2 + 0.05, 0.2);

  // ── la tercera es la Gota: crece, abre los ojos, mira abajo y se suelta ──
  crecer(tl, heroe.forma, T + 3.1, [[0.28, 0.3, 0.26], [0.26, 0.5, 0.5], [0.26, 0.72, 0.7], [0.22, 0.92, 0.95],
    [0.2, 1.04, 0.97], [0.12, 0.98, 1.02], [0.1, 1, 1]]);
  D.sfx('swell', T + 3.1, 1.6, 0.07);
  mira(-2.5, -4, T + 3.55, 0.3, 'power2.inOut');                          // el Caño mira el pico
  tl.to(heroe.cara, { opacity: 1, duration: 0.25, ease: 'none' }, T + 3.75);
  tl.to(heroe.ojos, { scaleY: 1, duration: 0.14, ease: 'back.out(3)', svgOrigin: heroe.ojos.getAttribute('data-origen') }, T + 4.02);
  D.sfx('bubbles', T + 4.02, 2, 0.05);
  tl.to(heroe.cara, { y: 5, duration: 0.16, ease: 'power2.out' }, T + 4.28);      // mira el piso…
  tl.to(heroe.cara, { y: -1, duration: 0.18, ease: 'power2.inOut' }, T + 4.5);    // …traga saliva
  tl.to(heroe.forma, { rotation: 4, duration: 0.14, ease: 'sine.out' }, T + 4.2);  // se hamaca colgada del pico
  tl.to(heroe.forma, { rotation: -3, duration: 0.2, ease: 'sine.inOut' }, T + 4.34);
  tl.to(heroe.forma, { rotation: 0, duration: 0.14, ease: 'sine.in' }, T + 4.54);
  soltar(tl, heroe, T + 4.72, caidaGota, 0.28, 1.1);
  D.sfx('plip', T + 4.72, 0.08, 300);
  mira(-2.5, 4, T + 4.75, 0.22, 'power2.in');                              // la sigue con la vista

  // ── aterriza en el tiempo 10 (5 s): se aplasta, salpica y rebota como gelatina ──
  const golpe = T + 5;
  tl.to(heroe.cuerpo, { scaleX: 1.34, scaleY: 0.64, duration: 0.07, ease: 'power2.out' }, golpe);
  tl.to(heroe.cuerpo, { scaleX: 1, scaleY: 1, duration: 0.62, ease: 'elastic.out(1, 0.45)' }, golpe + 0.07);
  tl.to(heroe.cara, { y: 0, duration: 0.2, ease: 'power2.out' }, golpe);
  salpicar(tl, chispas[2], SALPICON_GRANDE, golpe);
  tl.to(anillo, { opacity: 1, duration: 0.05, ease: 'none' }, golpe);
  tl.to(anillo, { scale: 1.25, duration: 0.55, ease: 'power2.out' }, golpe);
  tl.to(anillo, { opacity: 0, duration: 0.4, ease: 'power1.in' }, golpe + 0.15);
  tl.to(charco, { scale: 1, duration: 0.5, ease: 'back.out(1.6)' }, golpe);
  D.shake(golpe, 0.22, 5);
  D.sfx('plip', golpe, 0.3, 420);
  D.sfx('kick', golpe, 0.32);

  // ── la Gota mira a los costados, preocupada ──
  parpadeo(tl, heroe.cuerpo, golpe + 0.4);
  tl.to(heroe.cara, { x: -6, duration: 0.16, ease: 'power2.out' }, golpe + 0.55);
  tl.to(heroe.cuerpo, { rotation: -7, duration: 0.3, ease: 'power2.out' }, golpe + 0.55);
  tl.to(heroe.cara, { x: 6, duration: 0.22, ease: 'power2.inOut' }, golpe + 1.05);
  tl.to(heroe.cuerpo, { rotation: 7, duration: 0.35, ease: 'power2.inOut' }, golpe + 1.05);
  tl.to(heroe.cara, { x: 0, duration: 0.25, ease: 'power2.inOut' }, golpe + 1.5);
  tl.to(heroe.cuerpo, { rotation: 0, duration: 0.3, ease: 'power2.inOut' }, golpe + 1.5);
  parpadeo(tl, heroe.cuerpo, golpe + 1.62);
  D.sfx('tick', golpe + 0.55, 0.03);
  D.sfx('tick', golpe + 1.05, 0.03);

  // ── el Caño se asusta: respingo, cara de preocupado y manos arriba ──
  tl.to(cano, { scaleX: 1.05, scaleY: 0.93, duration: 0.07, ease: 'power2.out' }, golpe + 0.05);
  tl.to(cano, { scaleX: 1, scaleY: 1, duration: 0.35, ease: 'back.out(2.5)' }, golpe + 0.12);
  humor(tl, cano, 'preocupado', golpe + 0.1, 0.15);
  brazos.forEach((b, i) => {
    const s1 = i ? -1 : 1, svgOrigin = b.getAttribute('data-hombro');
    tl.to(b, { rotation: 62 * s1, duration: 0.22, ease: 'back.out(2)', svgOrigin }, golpe + 0.12);
    tl.to(b, { rotation: 52 * s1, duration: 0.1, ease: 'sine.inOut', svgOrigin }, golpe + 0.4);
    tl.to(b, { rotation: 64 * s1, duration: 0.1, ease: 'sine.inOut', svgOrigin }, golpe + 0.5);
    tl.to(b, { rotation: 54 * s1, duration: 0.1, ease: 'sine.inOut', svgOrigin }, golpe + 0.6);
    tl.to(b, { rotation: 0, duration: 0.3, ease: 'power2.inOut', svgOrigin }, golpe + 1.3);
  });
  parpadeo(tl, cano, golpe + 1.15);

  // ── salida: sale el titular y los personajes se corren de cuadro (escenario gris a los 7,65 s); salen más allá
  //    del borde de la pantalla (sangrado), no del cuadro ──
  saleTitular(tl, tit, T + 6.85, { dur: 0.45, stagger: 0.04 });
  tl.to(mundo, { x: 16, duration: 0.2, ease: 'power2.out' }, T + 6.95);
  tl.to(mundo, { x: -1560 - afuera('x'), duration: 0.5, ease: 'power3.in' }, T + 7.15);
  D.sfx('whoosh', T + 7.1, 0.6, 0.14);

  D.hide(s, T + o.dur);
  return o.dur;
});

/* ══════════════════════════ ESCENA 2 · PROBLEMA (8–18 s) ══════════════════════════ */

const A2 = {
  tit: { x: 110, y: 152, tamano: 80, ancho: 640 },
  reloj: { x: 110, y: 516, d: 220 },
  hora: { x: 362, y: 578 },     // la caja de 96 px queda centrada con el reloj (centro y 626)
  tarjetas: [{ x: 792, y: 160, rot: -1.6 }, { x: 832, y: 422, rot: 1.3 }, { x: 772, y: 684, rot: -0.9 }],
};
const HORAS = ['10:02', '12:47', '16:30', '19:15'];
/** ángulo de las agujas a m minutos de las 10:02 (giran de corrido, varias vueltas) */
const agujas = m => ({ h: 301 + m * 0.5, m: 12 + m * 6 });
const MINUTOS = [0, 165, 388, 553]; // 10:02 · 12:47 · 16:30 · 19:15

function relojSvg(d) {
  const marcas = Array.from({ length: 12 }, (_, i) => {
    const a = (i * Math.PI) / 6, q = i % 3 === 0;
    const p = r => `${(Math.sin(a) * r).toFixed(2)} ${(-Math.cos(a) * r).toFixed(2)}`;
    return `<path d="M${p(q ? 68 : 76)}L${p(86)}" stroke-width="${q ? 7 : 4}"/>`;
  }).join('');
  return `<svg viewBox="-120 -120 240 240" width="${d}" height="${d}" aria-hidden="true">
    <circle r="106" fill="#FFFFFF" stroke="#1F57A8" stroke-width="14"/>
    <g stroke="#141414" stroke-linecap="round" fill="none">${marcas}</g>
    <g class="hd-a2-aguja" data-aguja="h"><path d="M0 12L0 -46" stroke="#141414" stroke-width="12" stroke-linecap="round"/></g>
    <g class="hd-a2-aguja" data-aguja="m"><path d="M0 14L0 -72" stroke="#141414" stroke-width="7" stroke-linecap="round"/></g>
    <circle r="10" fill="#1F57A8"/><circle r="3.6" fill="#FFFFFF"/>
  </svg>`;
}

function htmlProblema() {
  const [vecinos, familia, futbol] = GRUPOS_PROBLEMA;
  // los vecinos vieron la pregunta y nadie contestó: más tarde, un "¿Alguien?" que tampoco lee nadie
  const grupos = [
    { ...vecinos, mensajes: [...vecinos.mensajes, { lado: 'saliente', texto: '¿Alguien?', hora: '16:30', tildes: 'entregado' }] },
    familia,
    futbol,
  ];
  const tarjetas = grupos.map((g, i) => {
    const p = A2.tarjetas[i];
    return `<div class="hd-a2-tarjeta" data-id="${g.id}" style="left:${px(p.x)};top:${px(p.y)};z-index:${i + 1}"><div class="hd-a2-zoom">${grupoMensajeria(g)}</div></div>`;
  }).join('');
  return `<div class="hd-a2 hd-ui">
    <div style="position:absolute;left:${px(A2.tit.x)};top:${px(A2.tit.y)}">${titular({ texto: 'Preguntás.|Esperás.|Nadie confirma.', tamano: A2.tit.tamano, ancho: A2.tit.ancho, className: 'hd-a2-tit' })}</div>
    <div class="hd-a2-reloj" style="left:${px(A2.reloj.x)};top:${px(A2.reloj.y)}">${relojSvg(A2.reloj.d)}</div>
    <div class="hd-a2-hora" style="left:${px(A2.hora.x)};top:${px(A2.hora.y)}">${HORAS.map((h, i) => `<span class="hd-a2-hora-capa" data-i="${i}">${h}</span>`).join('')}</div>
    ${tarjetas}
  </div>`;
}

Trailer.recipe('hd-problema', (D, T, o) => {
  const tl = D.tl;
  const s = D.scene('problema', htmlProblema());
  const tit = D.$('.hd-a2-tit', s);
  const reloj = D.$('.hd-a2-reloj', s);
  const aguja = { h: D.$('.hd-a2-aguja[data-aguja="h"]', reloj), m: D.$('.hd-a2-aguja[data-aguja="m"]', reloj) };
  const hora = D.$('.hd-a2-hora', s);
  const capas = D.$$('.hd-a2-hora-capa', s);
  const [vecinos, familia, futbol] = ['vecinos', 'familia', 'futbol'].map(id => D.$(`.hd-a2-tarjeta[data-id="${id}"]`, s));
  const globo = (card, i) => card.querySelector(`.hd-burbuja[data-i="${i}"] .hd-burbuja-cuerpo`);
  const visto = vecinos.querySelector('.hd-burbuja-visto');

  // "escribiendo…" encima del lugar de cada respuesta (en la misma burbuja, así no hay que medir con el zoom)
  const escribiendo = [familia, futbol].map(card => {
    const fila = card.querySelector('.hd-burbuja[data-i="1"]');
    fila.style.position = 'relative';
    fila.insertAdjacentHTML('beforeend', `<div class="hd-a2-escr">${burbujaEscribiendo({ tema: 'mensajeria' })}</div>`);
    return fila.querySelector('.hd-a2-escr');
  });

  // ── estados iniciales ──
  gsap.set([vecinos, familia, futbol], { x: 760 + afuera('x'), rotation: 9 }); // afuera, a la derecha (y del sangrado)
  D.$$('.hd-grupo-lista > .hd-burbuja > .hd-burbuja-cuerpo', s).forEach(c => { // los mensajes (no el "escribiendo…")
    const sale = c.closest('.hd-burbuja').getAttribute('data-lado') === 'saliente';
    gsap.set(c, { opacity: 0, scale: 0.3, transformOrigin: sale ? '100% 0%' : '0% 0%' });
  });
  gsap.set(visto, { opacity: 0, y: 6 });
  gsap.set(escribiendo, { opacity: 0, scale: 0.6, transformOrigin: '0% 100%' });
  gsap.set(reloj, { scale: 0, rotation: -25, transformOrigin: '50% 50%' });
  const a0 = agujas(0);
  gsap.set(aguja.h, { rotation: a0.h, svgOrigin: '0 0' });
  gsap.set(aguja.m, { rotation: a0.m, svgOrigin: '0 0' });
  gsap.set(capas, { yPercent: 100 });                                       // debajo de la ventana del contador
  prepararTitular(tit);

  D.show(s, T);

  const entrar = (card, i, at) => {
    tl.to(card, { x: 0, rotation: A2.tarjetas[i].rot, duration: 0.75, ease: 'expo.out' }, at);
    D.sfx('whoosh', at, 0.45, 0.09);
  };
  const pop = (el, at, sale = true) => {
    tl.to(el, { opacity: 1, duration: 0.1, ease: 'none' }, at);
    tl.to(el, { scale: 1, duration: 0.45, ease: 'back.out(2.2)' }, at);
    D.sfx('plip', at, sale ? 0.12 : 0.1, sale ? 980 : 640);
  };
  const tipea = (el, desde, hasta) => {
    tl.to(el, { opacity: 1, scale: 1, duration: 0.2, ease: 'back.out(2)' }, desde);
    const puntos = el.querySelectorAll('.hd-escribiendo-punto');
    for (let t = desde + 0.1; t < hasta - 0.15; t += 0.3) {
      tl.to(puntos, { y: -4, duration: 0.12, ease: 'sine.out', stagger: 0.06 }, t);
      tl.to(puntos, { y: 0, duration: 0.12, ease: 'sine.in', stagger: 0.06 }, t + 0.12);
    }
    tl.to(el, { opacity: 0, scale: 0.8, duration: 0.1, ease: 'power1.in' }, hasta - 0.05);
  };
  /** las agujas corren de la hora i-1 a la i (con tics de reloj) y la hora digital cambia al llegar */
  const barrido = (i, at, dur) => {
    const a = agujas(MINUTOS[i]);
    tl.to(aguja.h, { rotation: a.h, duration: dur, ease: 'power2.inOut', svgOrigin: '0 0' }, at);
    tl.to(aguja.m, { rotation: a.m, duration: dur, ease: 'power2.inOut', svgOrigin: '0 0' }, at);
    for (let t = at + 0.04; t < at + dur - 0.02; t += 0.08) D.sfx('tick', t, 0.022);
    // contador: la hora vieja sube y sale por arriba de la ventana mientras la nueva entra desde abajo
    const fin = at + dur - 0.1;
    tl.to(capas[i - 1], { yPercent: -100, duration: 0.36, ease: 'power3.inOut' }, fin);
    tl.to(capas[i], { yPercent: 0, duration: 0.36, ease: 'power3.inOut' }, fin);
    D.sfx('key', fin + 0.18, 0.07);
  };

  // ── 1 · Preguntás. (10:02, vecinos) ──
  entrar(vecinos, 0, T);
  tl.to(reloj, { scale: 1, rotation: 0, duration: 0.55, ease: 'back.out(1.8)' }, T + 0.15);
  D.sfx('fold', T + 0.15, 0.12);
  tl.to(capas[0], { yPercent: 0, duration: 0.5, ease: 'expo.out' }, T + 0.3);
  pop(globo(vecinos, 0), T + 0.5);
  entraTitular(tl, tit, T + 0.5, { grupo: 0 });
  D.sfx('kick', T + 0.5, 0.2);
  tl.to(visto, { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }, T + 1.1);
  D.sfx('tick', T + 1.1, 0.035);

  // ── 12:47: la familia (respuesta que no sirve) ──
  barrido(1, T + 1.4, 0.8);
  entrar(familia, 1, T + 2);
  pop(globo(familia, 0), T + 2.4);
  tipea(escribiendo[0], T + 2.75, T + 3.2);
  pop(globo(familia, 1), T + 3.2, false);

  // ── 2 · Esperás. (16:30: el fútbol y un "¿Alguien?" a los vecinos) ──
  entraTitular(tl, tit, T + 3.5, { grupo: 1 });
  D.sfx('kick', T + 3.5, 0.2);
  barrido(2, T + 3.5, 1.1);
  entrar(futbol, 2, T + 4.4);
  pop(globo(futbol, 0), T + 4.85);
  pop(globo(vecinos, 1), T + 5.25);

  // ── 19:15: "Ni idea, che." ──
  barrido(3, T + 5.6, 0.9);
  tipea(escribiendo[1], T + 6.2, T + 6.7);
  pop(globo(futbol, 1), T + 6.7, false);

  // ── 3 · Nadie confirma. Quietud: solo el tic del reloj ──
  entraTitular(tl, tit, T + 7, { grupo: 2 });
  D.sfx('kick', T + 7, 0.24);
  D.sfx('boom', T + 7, 0.1);
  [7.5, 8, 8.5].forEach(t => {                                               // tic… tic… tic…
    tl.to(reloj, { scale: 1.04, duration: 0.07, ease: 'power2.out' }, T + t);
    tl.to(reloj, { scale: 1, duration: 0.22, ease: 'power2.inOut' }, T + t + 0.07);
    D.sfx('tick', T + t, 0.035);
  });

  // ── la pila flota apenas mientras se espera (nada queda muerto en la pausa) ──
  [vecinos, familia, futbol].forEach((card, i) => {
    const desde = T + [0.75, 2.75, 5.15][i];
    tl.to(card, { y: -10 - 4 * i, duration: T + 8.75 - desde, ease: 'sine.inOut' }, desde);
  });

  // ── todo se cae (16,75 s) y queda el gris vacío desde los 17,55 s: cae más allá del borde de abajo de la pantalla
  //    (el sangrado de abajo, con la pantalla vertical), no solo del cuadro ──
  const cae = T + 8.75;
  const caer = (el, at, rot, dy = 1150) => {
    tl.to(el, { y: '-=14', duration: 0.14, ease: 'power2.out' }, at);
    tl.to(el, { y: dy + afuera('y'), rotation: rot, duration: 0.6, ease: 'power2.in' }, at + 0.14);
  };
  caer(futbol, cae, 10);
  caer(familia, cae + 0.05, -8);
  caer(vecinos, cae + 0.1, 12);
  caer(reloj, cae + 0.03, 40, 900);
  caer(hora, cae + 0.07, -6, 900);
  tl.to(tit.querySelectorAll('.hd-tit-in'), { yPercent: 115, duration: 0.42, ease: 'power3.in', stagger: 0.035 }, cae);
  D.sfx('zap', cae + 0.1, 0.06);
  D.sfx('whoosh', cae, 0.65, 0.1);

  D.hide(s, T + o.dur);
  return o.dur;
});
