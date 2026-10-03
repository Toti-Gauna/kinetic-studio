/* HANDY · App del especialista — escenas 3, 4 y 5 (grupo b).
   Acá se registran (Trailer.recipe), reemplazando a las provisorias de escenas-esp-base.js:
     'he-entrada'  escena 3 · entrada  escrita 4 s → película 10–15     logo Handy + "Soluciones, no problemas" + "Para especialistas"
     'he-inicio'   escena 4 · inicio   escrita 5 s → película 15–21,25  "Trabajás cuando querés."
     'he-pedido'   escena 5 · pedido   escrita 5 s → película 21,25–27,5 "Te llegan pedidos cerca tuyo." → "Vos ponés el precio."
   Cada receta recibe (D, T, o) y devuelve exactamente o.dur. Están escritas a 120 BPM (un tiempo = 0,5 s) y js/trailer.js
   las corre con 'hdr-corte' LENTO = 1,25 veces más lentas: un tiempo escrito t cae en la película en T + t × 1,25.
   Los golpes y sonidos van en múltiplos de 0,25 (corcheas) o 0,125 (semicorcheas) escritos. Ver STORYBOARD.md.

   Guion (tiempos ESCRITOS desde el inicio de cada escena → película):
   3 · entrada (10–15). La de 'hd-entrada' del tráiler de usuario (trailers/handy-usuario/js/escenas-b.js), igual cuadro
     por cuadro: allá está escrita en 8 s y corre con k = 0,625; acá la receta dura 4 s escritos y corre con k = 1,25, así
     que la coreografía se arma con la fachada aMedias() (cada tiempo y cada duración del original × 0,5): en pantalla va
     a la misma velocidad que en el de usuario. Los tiempos de abajo son del original (u) → escritos (u/2) → película.
     u 0     → 0      → 10,0    golpe del drop: los cinco Handys entran saltando y aterrizan en fila.
     u 2,5–4,5 → 1,25–2,25 → 11,56–12,81  cada uno salta y en lo alto tira su letra de "Handy" (H a n d y, una por tiempo).
     u 4,95–5,5 → 2,475–2,75 → 13,09–13,44  las letras se juntan en el wordmark, encajan (clac) y entra la bajada.
     u 5,5–6,25 → 2,75–3,125  el orgullo: caras de festejo, la lamparita se enciende, el caño saluda (más corto que en el
                              de usuario, para que la ficha de abajo se alcance a leer).
     u 6,0–7,3 → 3,0–3,65     se van por abajo: primero el caño (se deja caer, sin saltito: su arco está donde salta la
                              ficha) y después los demás, de a uno, con un saltito.
     u 6,5 → 3,25 → 14,06     NUEVO: la ficha azul "Para especialistas" salta debajo de la bajada (pop, back.out); quieta
                              desde ≈ 14,4 hasta el corte.
     4,0 → 15,0               queda el logo solo con la ficha (contrato con he-inicio).
   4 · inicio (15–21,25)
     0     → 15,0    match cut (el FLIP de 'hd-inicio', a la misma velocidad en pantalla): la bajada se recoge, el logo
                     vuela al encabezado de la app mientras sube el teléfono con el inicio del especialista APAGADO (mapa
                     dormido, interruptor gris); la ficha "Para especialistas" vuela y se convierte en la ficha "Trabajando".
     0,5   → 15,625  aterrizan (tic); el logo del encabezado reemplaza al del escenario.
     0,625 → 15,78   salta el marcador MR en el mapa y, arriba a la izquierda, la ficha "Martín R." (verificado, ★ 4,9).
     0,75  → 15,94   "Trabajás cuando querés."
     1,25  → 16,56   la cámara se acerca a la ficha "Trabajando" (escala 1,8); 1,5 entra el dedo.
     2,5   → 18,125  el dedo toca el interruptor: se prende (la perilla cruza, el azul se cruza con el gris), la ficha late,
                     el mapa se despierta (se va el velo) y salen dos anillos de pulso desde Martín (2,5 · 3,0).
     3,0   → 18,75   la cámara vuelve (hasta 3,5 = 19,375); 3,5 · 3,75 otros dos anillos.
     4,5   → 20,625  sale el titular. 5,0: el teléfono en PHONE_XY, Trabajando prendido, sin dedo, sin titular ni anillos.
   5 · pedido (21,25–27,5)
     0     → 21,25   suena la notificación (ding-dong); salta el pin de la casa de Carla y sube la tarjeta del pedido.
     0,1875–0,5 → 21,48–21,875  el contenido de la tarjeta, de a uno; 0,25 → 21,56 "Te llegan pedidos cerca tuyo.".
     1,75  → 23,44   el dedo toca "Mandar presupuesto"; sale el titular.
     2,0   → 23,75   se oscurece el inicio y sube la hoja "Tu presupuesto". 2,25: "Vos ponés el precio."
     2,375–3,0 → 24,22–25,0   Mano de obra $ 32.000: un dígito por semicorchea, como en una calculadora ($ 3 → $ 32 →
                              … → $ 32.000, alineado a la derecha), con el cursor que titila.
     3,125–3,4375 → 25,16–25,55  Materiales $ 13.000, de corrido (fusas; un clic por semicorchea).
     3,5   → 25,625  Total $ 45.000: golpe · 3,625 debajo, "Comisión Handy 10 % · recibís $ 40.500".
     3,75  → 25,94   el dedo toca "Enviar presupuesto"; 3,875 entra la tarjeta "Presupuesto enviado" y 4,0 el tilde.
     5,0   → 27,5    el teléfono queda con "Presupuesto enviado" (el golpe "¿Te eligen?" barre desde ≈ 27,3).
   Sangrado (src/handy/layout.ts): en pantallas que no son 4:3 se ve más que el cuadro de 1440×1080, así que lo que
   entra, sale o espera fuera de cuadro lo hace afuera de lo que se ve (afuera()): los Handys entran saltando desde el
   borde de la pantalla y se van por abajo hasta pasarlo, el teléfono de la escena 4 espera debajo del borde de abajo
   y, con la cámara de cerca, el titular se corre ese sangrado más a la izquierda (no asoma en el borde). En 4:3 el
   sangrado es 0 y todo queda como antes.
   Reglas: solo transform y opacity; todo en D.tl en tiempos absolutos desde T (numéricos); estados iniciales con
   gsap.set; sin from/fromTo ni azar. Clases propias con prefijo he-b-. */
import { gsap } from 'gsap';
import { handy, filaHandys, HANDY_INFO } from '../../../src/handy/handys.ts';
import { idle, saludo, salto, humor, parpadeo, entrarSaltando } from '../../../src/handy/handys-anim.ts';
import { handyLogo, LETRAS, LOGO_INFO, letraHacia, logoAlto, palabraHacia } from '../../../src/handy/logo.ts';
import { phoneFrame } from '../../../src/handy/ui/PhoneFrame.ts';
import { finger, prepararDedo, entrarDedo, tocar, salirDedo, centro } from '../../../src/handy/ui/Finger.ts';
import { titular, prepararTitular, entraTitular, saleTitular } from '../../../src/handy/ui/Headline.ts';
import { ponerInterruptor, prenderInterruptor } from '../../../src/handy/ui/Interruptor.ts';
import {
  pantallaInicioEsp, tarjetaPedido, hojaPresupuesto, prepararMonto, escribirMonto, prepararPulso, pulsar, HORAS,
} from '../../../src/handy/pantallas/especialista.ts';
import { HEADLINE, PHONE_XY, afuera } from '../../../src/handy/layout.ts';

/* ───────────── estilos ───────────── */

const CSS = `
.he-b-mundo { position: absolute; inset: 0; will-change: transform; }
.he-b-titular .hd-tit-grupo { display: block; }
.he-b-ficha { position: absolute; display: flex; align-items: center; gap: 14px; height: 74px; padding: 0 32px 0 26px;
  border-radius: 37px; background: var(--hd-azul, #1F57A8); color: #FFFFFF; font: 800 34px/1 var(--hd-font, Inter);
  letter-spacing: -0.01em; white-space: nowrap; box-shadow: 0 10px 24px -12px rgba(16, 30, 64, 0.55);
  will-change: transform; }
.he-b-ficha svg { display: block; flex: none; }
`;
if (!document.getElementById('he-escenas-b')) {
  const st = document.createElement('style');
  st.id = 'he-escenas-b';
  st.textContent = CSS;
  document.head.appendChild(st);
}

/* ───────────── utilidades ───────────── */

const limitar = (v, a, b) => Math.min(b, Math.max(a, v));
/** frecuencia de una nota midi (69 = La 440) */
const hz = m => 440 * Math.pow(2, (m - 69) / 12);
/** pentatónica de Do, de Do6 hacia arriba: las campanas de las letras */
const PENTA = [84, 86, 88, 91, 93, 96].map(hz); // Do6 Re6 Mi6 Sol6 La6 Do7

/** El logo del escenario (lockup amplio), igual en el final de la escena 3 y el principio de la 4 (el del de usuario). */
const LOGO = { width: 800, x: 320, y: 136 };
LOGO.alto = logoAlto(LOGO.width);
/** px del escenario por unidad del viewBox del logo */
const LOGO_K = LOGO.width / LOGO_INFO.viewBox.amplia.w;
/** línea de base del wordmark en el escenario: ahí se apoyan las letras que tiran los Handys */
const LOGO_BASE = LOGO.y + (LOGO_INFO.lineaBase.palabra - LOGO_INFO.viewBox.amplia.y) * LOGO_K;
/** la ficha "Para especialistas": arriba a la izquierda, alineada con la H del wordmark, debajo de la bajada */
const FICHA = { x: LOGO.x + 6, y: Math.round(LOGO.y + LOGO.alto + 34) };

/** maletín (lucide briefcase, ISC), el mismo ícono de la ficha "Trabajando" de la app */
const MALETIN = '<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="2.3"'
  + ' stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>'
  + '<rect width="20" height="14" x="2" y="6" rx="2"/></svg>';
const fichaHtml = () => `<div class="he-b-ficha" style="left:${FICHA.x}px;top:${FICHA.y}px">${MALETIN}<span>Para especialistas</span></div>`;

/** Fachada de D a la mitad del tiempo, anclada en T: cada posición p va a T + (p − T)·0,5 y cada duración, delay y
    stagger se multiplica por 0,5. Así la entrada del tráiler de usuario (escrita en 8 s) entra igual en 4 s escritos. */
function aMedias(D, T) {
  const f = 0.5;
  const at = p => {
    if (typeof p !== 'number' || !Number.isFinite(p)) throw new Error(`he-entrada: posición "${p}" (solo tiempos absolutos)`);
    return T + (p - T) * f;
  };
  const sv = v => {
    const o = { ...v };
    ['duration', 'delay', 'repeatDelay'].forEach(k => { if (typeof o[k] === 'number') o[k] *= f; });
    if (typeof o.stagger === 'number') o.stagger *= f;
    return o;
  };
  const M = Object.create(D);
  M.tl = {
    to: (t, v, p) => D.tl.to(t, sv(v), at(p)),
    set: (t, v, p) => D.tl.set(t, v, at(p)),
  };
  M.sfx = (n, p, ...a) => D.sfx(n, at(p), ...a);
  return M;
}

/** Tiempos de entrarSaltando (misma cuenta que handys-anim.ts): cuándo toca el piso en cada saltito y cuánto dura. */
function saltitos(alto, saltos, altura) {
  const h0 = altura ?? limitar(alto * 0.45, 50, 170);
  const suelos = [];
  let t = 0;
  for (let i = 0; i < saltos; i++) {
    const vuelo = limitar(0.46 * Math.sqrt((h0 * (1 - 0.22 * i)) / 120), 0.26, 0.6);
    t += vuelo;
    suelos.push(t);
    t += i === saltos - 1 ? 0.39 : 0.17;
  }
  return { suelos, dur: t };
}

/** Altura del primer saltito para que el último aterrizaje caiga `objetivo` s después de arrancar (bisección). */
function alturaPara(alto, saltos, objetivo) {
  let a = 20, b = 600;
  for (let i = 0; i < 40; i++) {
    const m = (a + b) / 2, s = saltitos(alto, saltos, m).suelos;
    if (s[s.length - 1] < objetivo) a = m; else b = m;
  }
  return (a + b) / 2;
}

/** Subida de salto() de handys-anim.ts: la cima del salto llega en at + 0,12 + subida(h). */
const subida = h => limitar(0.3 * Math.sqrt(h / 120), 0.16, 0.55);
/** Duración total de salto() con esa altura. */
const durSalto = h => 0.12 + subida(h) * 1.9 + 0.08 + 0.3;

/** Sale de cuadro por abajo: se agacha, pega un saltito y se deja caer hasta y = caida (px; parte de y = 0, parado).
    Recoge las piernas en el aire y se estira al caer. Devuelve la duración. */
function salirPorAbajo(tl, el, at, { altura = 90, caida = 760 } = {}) {
  const piernas = Array.from(el.querySelectorAll('.hd-h-pierna'));
  const agacha = 0.1, sube = 0.22, baja = 0.42, t0 = at + agacha;
  tl.to(el, { scaleY: 0.82, scaleX: 1.12, duration: agacha, ease: 'power2.out' }, at);
  tl.to(el, { y: -altura, duration: sube, ease: 'power2.out' }, t0);
  tl.to(el, { scaleY: 1.12, scaleX: 0.9, duration: sube * 0.5, ease: 'power2.out' }, t0);
  tl.to(el, { scaleY: 1, scaleX: 1, duration: sube * 0.5, ease: 'sine.inOut' }, t0 + sube * 0.5);
  tl.to(el, { y: caida, duration: baja, ease: 'power2.in' }, t0 + sube);
  tl.to(el, { scaleY: 1.1, scaleX: 0.93, duration: baja * 0.6, ease: 'sine.in' }, t0 + sube + baja * 0.4);
  for (const p of piernas) {
    const r = parseFloat(p.getAttribute('data-recoger') ?? '0');
    tl.to(p, { y: -r, duration: sube * 0.6, ease: 'power2.out' }, t0 + 0.02);
  }
  return agacha + sube + baja;
}

/** Aprieta un elemento de la interfaz (escala y vuelve con rebote). */
function apretar(tl, el, at, escala = 0.94) {
  tl.to(el, { scale: escala, duration: 0.05, ease: 'power2.out' }, at);
  tl.to(el, { scale: 1, duration: 0.25, ease: 'back.out(3)' }, at + 0.07);
}

/** "Mirá acá": el elemento crece un poco y vuelve rebotando. */
function latido(tl, el, at, escala = 1.2) {
  tl.to(el, { scale: escala, duration: 0.08, ease: 'power2.out' }, at);
  tl.to(el, { scale: 1, duration: 0.35, ease: 'elastic.out(1, 0.45)' }, at + 0.08);
}

/** Titulares a la velocidad en pantalla del tráiler de usuario (allá entran en 0,8 escritos con k = 0,625). */
const ENTRA = { dur: 0.4, stagger: 0.03 };
const SALE = { dur: 0.225, stagger: 0.015 };

/** Titular de la columna izquierda, centrado en vertical sobre el teléfono. "|" = salto de línea. */
function ponerTitular(cont, texto) {
  cont.insertAdjacentHTML('beforeend', titular({ texto, className: 'he-b-titular' }));
  const el = cont.lastElementChild;
  el.style.left = HEADLINE.x + 'px';
  el.style.top = Math.round(540 - el.offsetHeight / 2) + 'px';
  prepararTitular(el);
  return el;
}

/** El teléfono de las escenas de app, en PHONE_XY, con el dedo adentro (se mueve con él y no lo recorta la pantalla). */
function armarTelefono(cont, pantalla) {
  cont.insertAdjacentHTML('beforeend', phoneFrame({ pantalla, hora: HORAS.pedido }));
  const tel = cont.querySelector('.hd-telefono');
  gsap.set(tel, { x: PHONE_XY.x, y: PHONE_XY.y });
  tel.insertAdjacentHTML('beforeend', finger());
  const dedo = tel.querySelector('.hd-dedo');
  dedo.style.willChange = 'transform';
  prepararDedo(dedo);
  return { tel, dedo };
}

/** Punto de la pantalla del teléfono (centro de `el`) en coordenadas del escenario, con el teléfono en PHONE_XY. */
const enEscenario = (el, tel) => { const p = centro(el, tel); return { x: PHONE_XY.x + p.x, y: PHONE_XY.y + p.y }; };

/* ───────────── 3 · entrada ───────────── */

/** cómo entra cada uno (orden de handys-grupo.png): lado, saltitos, cuándo aterriza (u desde T), su letra y su salto */
const ENTRADA = {
  gota: { lado: -1, saltos: 2, llega: 1.5, letra: 'H', salto: 100, voz: 640 },
  cano: { lado: -1, saltos: 2, llega: 1.0, letra: 'a', salto: 80, voz: 150 },
  engranaje: { lado: 1, saltos: 3, llega: 1.5, letra: 'n', salto: 110, voz: 330 },
  lamparita: { lado: 1, saltos: 2, llega: 1.75, letra: 'd', salto: 90, voz: 240 },
  llave: { lado: 1, saltos: 2, llega: 2.0, letra: 'y', salto: 110, voz: 420 },
};
/** el caño mide esto: la fila queda de ~1094 px de ancho */
const ALTO_CANO = 560;
/** piso común de los cinco (px del escenario) */
const PISO = 950;

Trailer.recipe('he-entrada', (D, T, o) => {
  // M: la entrada del de usuario tal cual, en sus tiempos (u = 2 × escrito); ver aMedias
  const M = aMedias(D, T);
  const tl = M.tl;
  const fila = filaHandys(ALTO_CANO);
  const x0 = Math.round((D.W - fila.ancho) / 2);
  const hs = fila.handys.map(h => {
    const info = HANDY_INFO[h.tipo];
    const left = x0 + h.x, top = PISO - h.altura;
    return { ...h, ...ENTRADA[h.tipo], left, top, cx: left + h.ancho * info.pies };
  });

  const s = D.scene('entrada',
    hs.map(h => `<div style="position:absolute;left:${h.left.toFixed(1)}px;top:${h.top.toFixed(1)}px">`
      + handy(h.tipo, { altura: h.altura }) + '</div>').join('')
    + `<div class="he-b-logo" style="position:absolute;left:${LOGO.x}px;top:${LOGO.y}px;width:${LOGO.width}px;height:${LOGO.alto.toFixed(2)}px">`
    + handyLogo({ width: LOGO.width, split: true }) + '</div>'
    + fichaHtml());

  const el = {};
  s.querySelectorAll('.hd-handy').forEach(e => {
    el[e.dataset.handy] = e;
    e.style.willChange = 'transform';
  });
  const logo = s.querySelector('.he-b-logo');
  const letras = LETRAS.map(l => logo.querySelector(`.hd-logo-letra[data-letra="${l}"]`));
  const palabrasBajada = Array.from(logo.querySelectorAll('.hd-logo-bajada-palabra'));
  const ficha = s.querySelector('.he-b-ficha');

  // estados iniciales: la bajada abajo y apagada; cada letra chiquita sobre la cabeza de su Handy; la ficha apagada
  gsap.set(palabrasBajada, { opacity: 0, y: 40 });
  gsap.set(ficha, { opacity: 0, scale: 0.4, transformOrigin: '30% 50%' });
  const caja = { x: LOGO.x, y: LOGO.y, width: LOGO.width };
  const enLinea = {};
  hs.forEach(h => {
    const i = LETRAS.indexOf(h.letra), b = LOGO_INFO.letras[h.letra];
    // la cabeza: arriba del todo del Handy (el caño: la curva de su tubo, encima de la cara)
    const cabeza = { x: h.cx, y: h.tipo === 'cano' ? h.top + h.altura * 0.18 : h.top + 16 };
    enLinea[h.letra] = letraHacia(h.letra, caja, { x: h.cx, y: LOGO_BASE }, 'base');
    gsap.set(letras[i], {
      ...letraHacia(h.letra, caja, cabeza, 'base'),
      scale: 0, rotation: -18 * h.lado,
      svgOrigin: `${b.x + b.w / 2} ${LOGO_INFO.lineaBase.palabra}`,
    });
  });

  D.show(s, T);

  // ── entran saltando (u 0–2 → escrito 0–1) ─────────────────────────────────
  const listos = {}; // cuándo termina la entrada de cada uno (ya asentado)
  hs.forEach(h => {
    // recién afuera de lo que se ve (el cuadro más el sangrado): aparecen enseguida, desde el borde de la pantalla
    const fuera = h.lado < 0 ? -(h.left + h.ancho + 20 + afuera('x')) : D.W + 20 + afuera('x') - h.left;
    const aterriza = T + h.llega;
    // el caño arranca justo en el golpe; los demás, cuando les toca para caer en su tiempo
    const arranque = h.tipo === 'cano' || h.tipo === 'engranaje' ? T : aterriza - saltitos(h.altura, h.saltos).suelos.at(-1);
    const altura = alturaPara(h.altura, h.saltos, aterriza - arranque);
    const { suelos, dur } = saltitos(h.altura, h.saltos, altura);
    entrarSaltando(tl, el[h.tipo], { desdeX: fuera, hastaX: 0, saltos: h.saltos, altura }, arranque);
    suelos.forEach((t, i) => {
      const ultimo = i === suelos.length - 1;
      M.sfx('plip', arranque + t, ultimo ? 0.1 : 0.05, h.voz * (ultimo ? 1 : 1.25));
    });
    listos[h.tipo] = arranque + dur;
  });
  M.sfx('fold', T + ENTRADA.cano.llega, 0.24); // el caño pesa: golpe sordo al aterrizar

  // ── cinco Handys, cinco letras (u 2,5–4,5 → escrito 1,25–2,25) ───────────
  const finSalto = {};
  hs.forEach(h => {
    const i = LETRAS.indexOf(h.letra);
    const cima = T + 2.5 + i * 0.5; // la letra sale en la cima, sobre el tiempo
    const arranque = cima - 0.12 - subida(h.salto);
    if (arranque - listos[h.tipo] >= 0.9) idle(tl, el[h.tipo], listos[h.tipo], arranque - listos[h.tipo], { amp: 0.025 });
    salto(tl, el[h.tipo], arranque, { altura: h.salto });
    finSalto[h.tipo] = arranque + durSalto(h.salto);
    // la letra: sale de la cabeza, sube girando, se pasa un poquito y se planta en la línea de base del logo
    tl.to(letras[i], { scale: 1, duration: 0.32, ease: 'back.out(2.2)' }, cima);
    tl.to(letras[i], { ...enLinea[h.letra], duration: 0.6, ease: 'back.out(1.5)' }, cima);
    tl.to(letras[i], { rotation: 0, duration: 0.65, ease: 'back.out(2.5)' }, cima);
    M.sfx('plip', cima - 0.24, 0.07, 300); // el impulso
    M.sfx('bell', cima, PENTA[i], 0.07, 1.4);
  });

  // ── se juntan en el wordmark (u 4,95) y encajan (u 5,5 → escrito 2,75) ────
  const tJunta = T + 4.95;
  LETRAS.forEach((l, i) => {
    // anticipación: se abren un poquito antes de juntarse, de izquierda a derecha
    tl.to(letras[i], { x: enLinea[l].x * 1.04, duration: 0.2, ease: 'power2.out' }, tJunta - 0.2);
    tl.to(letras[i], { x: 0, y: 0, duration: 0.55, ease: 'expo.inOut' }, tJunta + i * 0.012);
  });
  const encaja = T + 5.5;
  tl.to(letras, { scaleY: 0.9, scaleX: 1.06, duration: 0.07, ease: 'power2.out' }, encaja);
  tl.to(letras, { scaleY: 1, scaleX: 1, duration: 0.45, ease: 'back.out(3)' }, encaja + 0.07);
  tl.to(palabrasBajada, { opacity: 1, y: 0, duration: 0.6, ease: 'expo.out', stagger: 0.12 }, encaja + 0.05);
  M.sfx('whoosh', tJunta - 0.2, 0.7, 0.14);
  M.sfx('fold', encaja, 0.2);
  [72, 76, 79].forEach((n, k) => M.sfx('bell', encaja + k * 0.02, hz(n + 12), 0.04, 2));

  // ── el orgullo (u 5,5–6,25): caras de festejo, la lamparita se enciende, respiran y el caño saluda ──
  // salen de izquierda a derecha; el caño primero (u 6,0) y sin saltito: su arco está donde salta la ficha
  const tSale = {};
  hs.filter(h => h.tipo !== 'cano').forEach((h, k) => { tSale[h.tipo] = T + 6.25 + k * 0.08; });
  tSale.cano = T + 6.0;
  hs.forEach((h, k) => {
    humor(tl, el[h.tipo], 'festejo', encaja + k * 0.04);
    idle(tl, el[h.tipo], finSalto[h.tipo], tSale[h.tipo] - finSalto[h.tipo], { amp: 0.03 });
  });
  const rayos = el.lamparita.querySelector('.hd-h-rayos');
  if (rayos) {
    const svgOrigin = rayos.getAttribute('data-origen') ?? '0 0';
    tl.to(rayos, { scale: 1.3, duration: 0.14, ease: 'power2.out', svgOrigin }, encaja);
    tl.to(rayos, { scale: 1, duration: 0.7, ease: 'elastic.out(1, 0.4)', svgOrigin }, encaja + 0.14);
  }
  saludo(tl, el.cano, T + 5.5, { lado: 'izq', veces: 1 });
  parpadeo(tl, el.llave, T + 5.9);

  // ── saltan y se van por abajo (u 6,25–7,3) ────────────────────────────────
  hs.forEach(h => {
    // el saltito no llega a la bajada del logo ni a la ficha: el caño se deja caer y la lamparita salta menos
    const altura = { cano: 0, lamparita: 50 }[h.tipo] ?? 85;
    // cae hasta que la cabeza pasa el borde de abajo de lo que se ve (con el sangrado), contando el estirón de la
    // caída (scaleY 1,1 desde los pies)
    salirPorAbajo(tl, el[h.tipo], tSale[h.tipo], { altura, caida: D.H - h.top + h.altura * 0.12 + 40 + afuera('y') });
    M.sfx('plip', tSale[h.tipo] + 0.1, 0.05, h.voz * 1.4);
  });
  M.sfx('whoosh', T + 6.4, 0.7, 0.12);

  // ── "Para especialistas" (u 6,5 → escrito 3,25 → película 14,06): pop debajo de la bajada ──
  const tFicha = T + 6.5;
  tl.to(ficha, { opacity: 1, duration: 0.12, ease: 'power1.out' }, tFicha);
  tl.to(ficha, { scale: 1, duration: 0.5, ease: 'back.out(2.6)' }, tFicha);
  M.sfx('plip', tFicha, 0.07, 880);
  M.sfx('bell', tFicha, hz(91), 0.05, 1.4);

  D.hide(s, T + o.dur);
  return o.dur;
});

/* ───────────── 4 · inicio ───────────── */

/** cámara de la escena 4: escala y punto del escenario que queda en el centro del cuadro */
const pose = (escala, [fx, fy]) => ({ scale: escala, x: 720 - escala * fx, y: 540 - escala * fy });
/** escala de la cámara de cerca (la ficha "Trabajando" y Martín) */
const CERCA = 1.8;

Trailer.recipe('he-inicio', (D, T, o) => {
  const tl = D.tl;
  const s = D.scene('inicio', '<div class="he-b-mundo"></div>');
  const mundo = s.querySelector('.he-b-mundo');
  const { tel, dedo } = armarTelefono(mundo, pantallaInicioEsp({ trabajando: true }));
  // el logo y la ficha del escenario, donde los dejó la escena 3 (encima del teléfono)
  mundo.insertAdjacentHTML('beforeend',
    `<div class="he-b-logo" style="position:absolute;left:${LOGO.x}px;top:${LOGO.y}px;width:${LOGO.width}px;height:${LOGO.alto.toFixed(2)}px">`
    + handyLogo({ width: LOGO.width }) + '</div>' + fichaHtml());
  const logo = mundo.querySelector('.he-b-logo');
  const bajada = logo.querySelector('.hd-logo-bajada');
  const fichaEsc = mundo.querySelector('.he-b-ficha');
  const tit = ponerTitular(mundo, 'Trabajás|cuando querés.');

  const inicio = tel.querySelector('[data-pantalla="inicio-esp"]');
  const logoHeader = inicio.querySelector('.hd-header-logo');
  const velo = inicio.querySelector('.hd-esp-mapa-velo');
  const yo = inicio.querySelector('.hd-esp-yo');
  const quien = inicio.querySelector('.hd-esp-quien');
  const trabajando = inicio.querySelector('.hd-esp-trabajando');
  const llave = trabajando.querySelector('.hd-interruptor');
  const pLlave = centro(llave, tel);

  // el FLIP del logo: caja del lockup compacto del encabezado con el teléfono ya en su lugar
  const b = D.box(logoHeader.querySelector('svg'));
  const flip = palabraHacia({ x: LOGO.x, y: LOGO.y, width: LOGO.width }, { x: b.x, y: b.y, width: b.w, tagline: 'compacta' });
  // la ficha del escenario vuela a la ficha "Trabajando" (centro con centro, misma caja)
  const fb = D.box(fichaEsc), tb = D.box(trabajando);
  const fichaVuelo = { x: tb.x + tb.w / 2 - (fb.x + fb.w / 2), y: tb.y + tb.h / 2 - (fb.y + fb.h / 2), scaleX: tb.w / fb.w, scaleY: tb.h / fb.h };
  // la cámara: de cerca, la ficha "Trabajando" y Martín en el mapa
  const pT = enEscenario(trabajando, tel);
  const foco = [pT.x, pT.y + 70]; // el borde izquierdo del cuadro queda a la derecha del titular

  // estados iniciales: teléfono abajo, fuera de lo que se ve (con el sangrado); la app APAGADA (interruptor gris, mapa
  // dormido); la ficha y el marcador de Martín apagados hasta que llega la ficha del escenario
  gsap.set(tel, { y: D.H + 40 + afuera('y') });
  gsap.set(logoHeader, { opacity: 0 });
  ponerInterruptor(llave, false);
  gsap.set(velo, { opacity: 1 });
  prepararPulso(inicio);
  gsap.set(trabajando, { opacity: 0 });
  gsap.set(yo, { scale: 0 });
  gsap.set(quien, { opacity: 0, scale: 0.6, transformOrigin: '0% 50%' });
  gsap.set(logo, { transformOrigin: '0 0' });
  gsap.set(fichaEsc, { transformOrigin: '50% 50%' });
  gsap.set(mundo, { transformOrigin: '0 0', ...pose(1, [720, 540]) });
  logo.style.willChange = 'transform';

  D.show(s, T);

  // ── el teléfono sube y el logo se mete en su encabezado (0–0,5 → 15,0–15,625) ──
  // Como en 'hd-inicio', a la misma velocidad en pantalla: la bajada se recoge, el logo se achica hacia su esquina y
  // viaja a la derecha cuando el teléfono ya subió; al llegar, el logo del encabezado (exactamente debajo) lo reemplaza.
  const llega = T + 0.5;
  tl.to(bajada, { ...LOGO_INFO.bajadaCompacta, svgOrigin: '0 0', duration: 0.2, ease: 'power2.inOut' }, T);
  tl.to(logo, { scale: flip.scale, duration: 0.5, ease: 'power3.inOut' }, T);
  tl.to(logo, { y: flip.y, duration: 0.5, ease: 'power3.inOut' }, T);
  tl.to(logo, { x: flip.x, duration: 0.42, ease: 'power3.inOut' }, T + 0.08);
  tl.to(tel, { y: PHONE_XY.y, duration: 0.45, ease: 'expo.out' }, T + 0.05);
  tl.set(logoHeader, { opacity: 1 }, llega);
  tl.set(logo, { autoAlpha: 0 }, llega);
  // la ficha "Para especialistas" baja a la ficha "Trabajando" y se cruzan
  tl.to(fichaEsc, { x: fichaVuelo.x, duration: 0.5, ease: 'power3.inOut' }, T);
  tl.to(fichaEsc, { y: fichaVuelo.y, duration: 0.5, ease: 'power3.inOut' }, T);
  tl.to(fichaEsc, { scaleX: fichaVuelo.scaleX, scaleY: fichaVuelo.scaleY, duration: 0.5, ease: 'power3.inOut' }, T);
  tl.to(trabajando, { opacity: 1, duration: 0.12, ease: 'power1.out' }, llega - 0.08);
  tl.to(fichaEsc, { opacity: 0, duration: 0.12, ease: 'power1.in' }, llega - 0.06);
  latido(tl, trabajando, llega, 1.06);
  D.sfx('whoosh', T, 0.6, 0.16);
  D.sfx('tick', llega, 0.06);
  // Martín aparece en el mapa (todavía dormido)
  tl.to(yo, { scale: 1, duration: 0.35, ease: 'back.out(2.6)' }, T + 0.625);
  tl.to(quien, { opacity: 1, duration: 0.1, ease: 'power1.out' }, T + 0.625);
  tl.to(quien, { scale: 1, duration: 0.4, ease: 'back.out(2.4)' }, T + 0.625);
  D.sfx('plip', T + 0.625, 0.05, 520);

  // ── titular (0,75 → 15,94) ────────────────────────────────────────────────
  entraTitular(tl, tit, T + 0.75, ENTRA);

  // ── la cámara se acerca (1,25 → 16,56) y el dedo prende el interruptor (2,5 → 18,125) ──
  tl.to(mundo, { ...pose(CERCA, foco), duration: 0.25, ease: 'power3.inOut' }, T + 1.25);
  // de cerca, el titular queda a la izquierda del cuadro; con sangrado se corre ese sangrado más (en px del mundo, que
  // está a escala CERCA) para quedar afuera de lo que se ve y no asomar en el borde. Vuelve con la cámara (3,0).
  const corrido = afuera('x') / CERCA;
  if (corrido > 0) tl.to(tit, { x: -corrido, duration: 0.25, ease: 'power3.inOut' }, T + 1.25);
  D.sfx('whoosh', T + 1.125, 0.35, 0.07);
  entrarDedo(tl, dedo, pLlave.x + 70, pLlave.y + 230, T + 1.5, { dur: 0.4 });
  const toque = tocar(tl, dedo, pLlave.x, pLlave.y, T + 2.2, { viaje: 0.3, mantener: 0.06 }).toque; // = T + 2,5
  prenderInterruptor(tl, llave, toque, { dur: 0.25 });
  latido(tl, trabajando, toque + 0.02, 1.07);
  tl.to(velo, { opacity: 0, duration: 0.5, ease: 'power2.out' }, toque);
  latido(tl, yo, toque + 0.125, 1.25);
  pulsar(tl, inicio, toque, { dur: 1.25, paso: 0.5 }); // anillos en 2,5 y 3,0
  D.sfx('tick', toque, 0.07);
  D.sfx('key', toque, 0.1);
  D.sfx('fold', toque, 0.1); // la perilla que cruza
  // el mapa se despierta: tres campanas que suben, en Sol mayor como el pad de acá (Re · Sol · Si)
  [86, 91, 95].forEach((n, k) => D.sfx('bell', toque + 0.125 * k, hz(n), 0.045, 1.4));
  D.sfx('plip', toque + 0.5, 0.04, 700);
  salirDedo(tl, dedo, toque + 0.25, { dur: 0.3, dx: 160, dy: 300 });

  // ── la cámara vuelve (3,0–3,5 → 18,75–19,375) y el mapa sigue latiendo ────
  tl.to(mundo, { ...pose(1, [720, 540]), duration: 0.5, ease: 'expo.inOut' }, T + 3.0);
  if (corrido > 0) tl.to(tit, { x: 0, duration: 0.5, ease: 'expo.inOut' }, T + 3.0);
  D.sfx('whoosh', T + 2.875, 0.45, 0.06);
  pulsar(tl, inicio, T + 3.5, { dur: 1.125, paso: 0.25 }); // anillos en 3,5 y 3,75: apagados antes del corte (4,875)
  D.sfx('plip', T + 3.5, 0.035, 620);
  D.sfx('plip', T + 3.75, 0.03, 780);

  // ── sale el titular (4,5 → 20,625) ────────────────────────────────────────
  saleTitular(tl, tit, T + 4.5, SALE);

  D.hide(s, T + o.dur);
  return o.dur;
});

/* ───────────── 5 · pedido ───────────── */

Trailer.recipe('he-pedido', (D, T, o) => {
  const tl = D.tl;
  const s = D.scene('pedido', '');
  // tres capas en un mismo teléfono: el inicio prendido (como quedó en la escena 4), el pedido y la hoja del presupuesto
  const { tel, dedo } = armarTelefono(s, pantallaInicioEsp({ trabajando: true }) + tarjetaPedido() + hojaPresupuesto());
  const tit1 = ponerTitular(s, 'Te llegan|pedidos|cerca tuyo.');
  const tit2 = ponerTitular(s, 'Vos ponés|*el precio.*');

  const inicio = tel.querySelector('[data-pantalla="inicio-esp"]');
  const capaPedido = tel.querySelector('[data-pantalla="pedido"]');
  const pin = capaPedido.querySelector('.hd-esp-pedido-pin');
  const tarjeta = capaPedido.querySelector('.hd-esp-pedido');
  const rubroIcono = tarjeta.querySelector('.hd-esp-rubro-icono');
  const filas = Array.from(tarjeta.querySelectorAll('.hd-esp-fila'));
  const mandar = tarjeta.querySelector('.hd-boton[data-accion="mandar-presupuesto"]');
  const ahoraNo = tarjeta.querySelector('.hd-boton[data-accion="ahora-no"]');
  const capaPresu = tel.querySelector('[data-pantalla="presupuesto"]');
  const velo = capaPresu.querySelector('.hd-hoja-capa > .hd-velo') ?? capaPresu.querySelector('.hd-velo');
  const hoja = capaPresu.querySelector('.hd-hoja');
  const campo = c => capaPresu.querySelector(`.hd-esp-campo[data-campo="${c}"]`);
  const montoMano = campo('mano-de-obra').querySelector('.hd-esp-monto');
  const montoMat = campo('materiales').querySelector('.hd-esp-monto');
  const cursorMano = campo('mano-de-obra').querySelector('.hd-esp-cursor');
  const cursorMat = campo('materiales').querySelector('.hd-esp-cursor');
  const total = capaPresu.querySelector('.hd-esp-total');
  const montoTotal = total.querySelector('.hd-esp-monto');
  const recibis = capaPresu.querySelector('.hd-esp-recibis');
  const enviar = capaPresu.querySelector('.hd-boton[data-accion="enviar-presupuesto"]');
  const enviado = capaPresu.querySelector('.hd-esp-enviado');
  const exitoVelo = enviado.querySelector('.hd-velo');
  const exitoTarjeta = enviado.querySelector('.hd-exito-tarjeta');
  const exitoCheck = enviado.querySelector('.hd-exito-check');
  const pMandar = centro(mandar, tel);
  const pEnviar = centro(enviar, tel);

  // estados iniciales: el inicio prendido sin anillos; el pin y la tarjeta afuera; la hoja abajo con los montos vacíos;
  // "Presupuesto enviado" apagado
  prepararPulso(inicio);
  gsap.set(pin, { scale: 0, transformOrigin: '50% 100%' });
  gsap.set(tarjeta, { y: 520 });
  gsap.set([...filas, mandar, ahoraNo], { opacity: 0, y: 18 });
  gsap.set(velo, { opacity: 0 });
  gsap.set(hoja, { yPercent: 100 });
  // los montos se tipean como en una calculadora (prepararMonto); el total aparece de golpe (hasta entonces, apagado)
  [montoMano, montoMat].forEach(prepararMonto);
  const carsTotal = Array.from(montoTotal.querySelectorAll('.hd-esp-car'));
  gsap.set(carsTotal, { opacity: 0, y: 14 });
  gsap.set([cursorMano, cursorMat], { opacity: 0 });
  gsap.set(recibis, { opacity: 0, y: 10 });
  gsap.set(enviado, { opacity: 0 });
  gsap.set(exitoVelo, { opacity: 0 });
  gsap.set(exitoTarjeta, { scale: 0.6, opacity: 0 });
  gsap.set(exitoCheck, { scale: 0 });

  D.show(s, T);

  // ── llega el pedido (0 → 21,25): ding-dong, el pin de la casa y la tarjeta que sube ──
  D.sfx('bell', T, hz(88), 0.08, 1.2);
  D.sfx('bell', T + 0.125, hz(93), 0.08, 1.4);
  tl.to(pin, { scale: 1, duration: 0.35, ease: 'back.out(2.8)' }, T);
  pulsar(tl, inicio, T, { dur: 1.125, paso: 0.25 });
  tl.to(tarjeta, { y: 0, duration: 0.45, ease: 'expo.out' }, T + 0.125);
  D.sfx('whoosh', T + 0.125, 0.4, 0.08);
  // la cabeza sube con la tarjeta; el resto entra de a uno por fusa: fecha, trabajo, lugar y los dos botones
  [...filas, mandar, ahoraNo].forEach((e, k) =>
    tl.to(e, { opacity: 1, y: 0, duration: 0.35, ease: 'expo.out' }, T + 0.1875 + k * 0.0625));
  latido(tl, rubroIcono, T + 0.375, 1.2);
  D.sfx('plip', T + 0.25, 0.04, PENTA[2]);
  D.sfx('plip', T + 0.375, 0.035, PENTA[3]);
  D.sfx('plip', T + 0.5, 0.03, PENTA[4]);
  entraTitular(tl, tit1, T + 0.25, ENTRA);

  // ── el dedo toca "Mandar presupuesto" (1,75 → 23,44) ─────────────────────
  entrarDedo(tl, dedo, pMandar.x + 60, pMandar.y + 120, T + 1.1, { dur: 0.4 });
  const t1 = tocar(tl, dedo, pMandar.x, pMandar.y, T + 1.45, { viaje: 0.3, mantener: 0.06 }).toque; // = T + 1,75
  apretar(tl, mandar, t1);
  D.sfx('tick', t1, 0.07);
  D.sfx('key', t1, 0.1);
  salirDedo(tl, dedo, t1 + 0.2, { dur: 0.3, dx: 160, dy: 300 });
  saleTitular(tl, tit1, t1, SALE);

  // ── sube la hoja "Tu presupuesto" (2,0 → 23,75) y "Vos ponés el precio." (2,25) ──
  const tHoja = T + 2.0;
  tl.to(velo, { opacity: 1, duration: 0.25, ease: 'power1.out' }, tHoja);
  tl.to(hoja, { yPercent: 0, duration: 0.45, ease: 'expo.out' }, tHoja);
  D.sfx('whoosh', tHoja - 0.125, 0.45, 0.09);
  D.sfx('fold', tHoja + 0.125, 0.12);
  entraTitular(tl, tit2, T + 2.25, ENTRA);

  // ── Mano de obra: un dígito por semicorchea (2,375–3,0), con el cursor que titila ──
  const titilar = (c, desde, hasta) => {
    for (let t = desde, on = true; t < hasta - 1e-6; t += 0.125, on = !on) tl.set(c, { opacity: on ? 1 : 0 }, t);
    tl.set(c, { opacity: 0 }, hasta);
  };
  tl.set(cursorMano, { opacity: 1 }, T + 2.25);
  escribirMonto(tl, montoMano, T + 2.375).forEach(t => D.sfx('key', t, 0.05));
  titilar(cursorMano, T + 3.0, T + 3.125);
  // ── Materiales de corrido (3,125–3,4375; un clic por semicorchea) ─────────
  tl.set(cursorMat, { opacity: 1 }, T + 3.125);
  escribirMonto(tl, montoMat, T + 3.125, { paso: 0.0625 });
  [3.125, 3.25, 3.375].forEach(t => D.sfx('key', T + t, 0.045));
  titilar(cursorMat, T + 3.5, T + 3.75);

  // ── Total $ 45.000: golpe (3,5 → 25,625) ──────────────────────────────────
  const tTotal = T + 3.5;
  tl.to(carsTotal, { opacity: 1, duration: 0.05, ease: 'none' }, tTotal);
  tl.to(carsTotal, { y: 0, duration: 0.3, ease: 'back.out(3)' }, tTotal);
  tl.set(montoTotal, { scale: 1.28 }, tTotal);
  tl.to(montoTotal, { scale: 1, duration: 0.4, ease: 'elastic.out(1, 0.5)' }, tTotal + 0.02);
  latido(tl, total, tTotal, 1.03);
  D.sfx('fold', tTotal, 0.16);
  [79, 83, 86].forEach((n, k) => D.sfx('bell', tTotal + k * 0.02, hz(n), 0.045, 1.6)); // Sol mayor
  // 3,625 · debajo, la comisión de Handy (10 %) y lo que recibe: $ 40.500
  tl.to(recibis, { opacity: 1, y: 0, duration: 0.35, ease: 'expo.out' }, tTotal + 0.125);

  // ── el dedo toca "Enviar presupuesto" (3,75 → 25,94) ──────────────────────
  entrarDedo(tl, dedo, pEnviar.x + 60, pEnviar.y + 120, T + 3.2, { dur: 0.35 });
  const t2 = tocar(tl, dedo, pEnviar.x, pEnviar.y, T + 3.5, { viaje: 0.25, mantener: 0.06 }).toque; // = T + 3,75
  apretar(tl, enviar, t2);
  D.sfx('tick', t2, 0.07);
  D.sfx('key', t2, 0.1);
  salirDedo(tl, dedo, t2 + 0.2, { dur: 0.3, dx: 160, dy: 300 });

  // ── "Presupuesto enviado" (3,875) con su tilde (4,0) ──────────────────────
  const tOk = T + 3.875;
  tl.set(enviado, { opacity: 1 }, tOk);
  tl.to(exitoVelo, { opacity: 1, duration: 0.2, ease: 'power1.out' }, tOk);
  tl.to(exitoTarjeta, { opacity: 1, duration: 0.12, ease: 'power1.out' }, tOk);
  tl.to(exitoTarjeta, { scale: 1, duration: 0.4, ease: 'back.out(2.2)' }, tOk);
  tl.to(exitoCheck, { scale: 1, duration: 0.4, ease: 'back.out(3)' }, tOk + 0.125);
  D.sfx('whoosh', tOk, 0.3, 0.06);
  D.sfx('bell', tOk + 0.125, hz(86), 0.06, 1.6);
  D.sfx('bell', tOk + 0.25, hz(91), 0.05, 1.8);

  D.hide(s, T + o.dur);
  return o.dur;
});
