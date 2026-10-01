/* HANDY · App de usuario — escenas 3, 4 y 5.
   Acá se registran (Trailer.recipe):
     'hd-entrada'          escena 3 · entrada          18–26 s  (devuelve 8)   logo Handy + "Soluciones, no problemas"
     'hd-inicio'           escena 4 · inicio           26–36 s  (devuelve 10)  "Pedís lo que necesitás."
     'hd-tipo-de-trabajo'  escena 5 · tipo de trabajo  36–46 s  (devuelve 10)  "Urgencia, programado u obra."
   Cada receta recibe (D, T, o): T = inicio absoluto de la escena, o = { type, id, titulo, dur } de js/trailer.js; tiene
   que devolver exactamente o.dur (src/handy/player.ts corta el build si no). Ver STORYBOARD.md.

   Guion (tiempos absolutos; 1 tiempo = 0,5 s, 1 compás = 2 s):
   3 · entrada (18–26)
     18,0  golpe: los cinco Handys entran saltando, el caño y la gota desde la izquierda, el engranaje, la lamparita y la
           llave desde la derecha; aterrizan en fila como en handys-grupo.png (pies en una línea común).
     20,5  "cinco Handys, cinco letras": cada uno salta y en lo alto de su salto tira su letra de "Handy" hacia arriba
     …22,5 (H gota · a caño · n engranaje · d lamparita · y llave, una por tiempo, campana pentatónica que sube); las
           letras quedan sobre la línea de base del logo, cada una encima de su Handy.
     23,0  las letras se juntan en el wordmark; 23,5 encaja (clac) y entra la bajada "Soluciones, no problemas".
     23,5  el orgullo: caras de festejo, la lamparita se enciende (rayos), todos respiran y el caño saluda.
     24,85 de izquierda a derecha, cada uno pega un saltito y se va por abajo; a las 26,0 queda solo el logo.
   4 · inicio (26–36)
     26,0  match cut: la bajada se recoge debajo del wordmark y el logo se achica; 26,1 el teléfono sube desde abajo;
           el logo cruza al encabezado de la app (palabraHacia al lockup compacto, con el teléfono en PHONE_XY) y a las
           26,9 el logo del encabezado lo reemplaza.
     26,6  fichas en cascada por filas, los títulos de sección y el botón de urgencia; 27,0 entra "Pedís lo que necesitás.".
     29,0  recorrido: los seis rubros y los seis accesos se levantan uno por corchea (se leen todos); 32,5 late la urgencia.
     33,6  entra el dedo; 35,0 toca Plomería (ficha apretada + capa azul); se va. 35,25 sale el titular.
   5 · tipo de trabajo (36–46)
     36,0  el velo oscurece la app y sube la hoja "Plomería · ¿Qué tipo de trabajo es?"; entran las tres opciones.
     37,0  "Urgencia, programado u obra." entra de a un grupo, y cada grupo ilumina su fila.
     39,5  el dedo toca Programado (capa azul + tilde); 40,0 la pantalla de fecha entra desde la derecha.
     40,75 la rueda de días gira a "Jue 15 oct" y la de horas a "16:00", un tic por fila; 42,0 aparece el resumen.
     44,5  el dedo toca "Pedir presupuestos" y se va; 45,0 sale el titular.
     46,0  cuadro de contrato con el grupo C: el teléfono en PHONE_XY con pantallaFecha() en su estado final, sin dedo
           ni titular.
   Solo transform y opacity, todo en D.tl en tiempos absolutos desde T, estados iniciales con gsap.set. */
import { handy, filaHandys, HANDY_INFO } from '../../../src/handy/handys.ts';
import { idle, saludo, salto, humor, parpadeo, entrarSaltando } from '../../../src/handy/handys-anim.ts';
import { handyLogo, LETRAS, LOGO_INFO, letraHacia, logoAlto, palabraHacia } from '../../../src/handy/logo.ts';
import { phoneFrame } from '../../../src/handy/ui/PhoneFrame.ts';
import { finger, prepararDedo, entrarDedo, tocar, salirDedo, centro } from '../../../src/handy/ui/Finger.ts';
import { ponerRueda, girarRueda } from '../../../src/handy/ui/DateWheel.ts';
import { titular, prepararTitular, entraTitular, saleTitular } from '../../../src/handy/ui/Headline.ts';
import { pantallaInicio, hojaTipoTrabajo, pantallaFecha, FECHA } from '../../../src/handy/pantallas/usuario.ts';
import { HEADLINE, PHONE_XY } from '../../../src/handy/layout.ts';

/* ───────────── utilidades ───────────── */

const limitar = (v, a, b) => Math.min(b, Math.max(a, v));
/** frecuencia de una nota midi (69 = La 440) */
const hz = m => 440 * Math.pow(2, (m - 69) / 12);
/** pentatónica de Do, de Do6 hacia arriba: las campanas de las letras y de los recorridos */
const PENTA = [84, 86, 88, 91, 93, 96].map(hz); // Do6 Re6 Mi6 Sol6 La6 Do7

/** El logo del escenario (lockup amplio), igual en el final de la escena 3 y el principio de la 4. */
const LOGO = { width: 800, x: 320, y: 136 };
LOGO.alto = logoAlto(LOGO.width);
/** px del escenario por unidad del viewBox del logo */
const LOGO_K = LOGO.width / LOGO_INFO.viewBox.amplia.w;
/** línea de base del wordmark en el escenario: ahí se apoyan las letras que tiran los Handys */
const LOGO_BASE = LOGO.y + (LOGO_INFO.lineaBase.palabra - LOGO_INFO.viewBox.amplia.y) * LOGO_K;

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
  tl.to(el, { scale: escala, duration: 0.08, ease: 'power2.out' }, at);
  tl.to(el, { scale: 1, duration: 0.35, ease: 'back.out(3)' }, at + 0.14);
}

/** "Mirá acá": el elemento crece un poco y vuelve rebotando. */
function latido(tl, el, at, escala = 1.2) {
  tl.to(el, { scale: escala, duration: 0.12, ease: 'power2.out' }, at);
  tl.to(el, { scale: 1, duration: 0.5, ease: 'elastic.out(1, 0.45)' }, at + 0.12);
}

/** Titular de la columna izquierda, centrado en vertical sobre el teléfono. */
function ponerTitular(s, texto) {
  s.insertAdjacentHTML('beforeend', titular({ texto, className: 'hd-b-titular' }));
  const el = s.querySelector('.hd-b-titular');
  el.style.left = HEADLINE.x + 'px';
  el.style.top = Math.round(540 - el.offsetHeight / 2) + 'px';
  prepararTitular(el);
  return el;
}

/** El teléfono de las escenas de app, en PHONE_XY, con el dedo adentro (se mueve con él y no lo recorta la pantalla). */
function armarTelefono(s, pantalla) {
  s.insertAdjacentHTML('beforeend', phoneFrame({ pantalla }));
  const tel = s.querySelector('.hd-telefono');
  gsap.set(tel, { x: PHONE_XY.x, y: PHONE_XY.y });
  tel.insertAdjacentHTML('beforeend', finger());
  const dedo = tel.querySelector('.hd-dedo');
  dedo.style.willChange = 'transform';
  prepararDedo(dedo);
  return { tel, dedo };
}

/* ───────────── 3 · entrada ───────────── */

/** cómo entra cada uno (orden de handys-grupo.png): lado, saltitos, cuándo aterriza (s desde T), su letra y su salto */
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

Trailer.recipe('hd-entrada', (D, T, o) => {
  const tl = D.tl;
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
    + `<div class="hd-b-logo" style="position:absolute;left:${LOGO.x}px;top:${LOGO.y}px;width:${LOGO.width}px;height:${LOGO.alto.toFixed(2)}px">`
    + handyLogo({ width: LOGO.width, split: true }) + '</div>');

  const el = {};
  s.querySelectorAll('.hd-handy').forEach(e => {
    el[e.dataset.handy] = e;
    e.style.willChange = 'transform';
  });
  const logo = s.querySelector('.hd-b-logo');
  const letras = LETRAS.map(l => logo.querySelector(`.hd-logo-letra[data-letra="${l}"]`));
  const palabrasBajada = Array.from(logo.querySelectorAll('.hd-logo-bajada-palabra'));

  // estados iniciales: la bajada abajo y apagada; cada letra chiquita sobre la cabeza de su Handy
  gsap.set(palabrasBajada, { opacity: 0, y: 40 });
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

  // ── entran saltando (18,0–20,0) ────────────────────────────────────────────
  const listos = {}; // cuándo termina la entrada de cada uno (ya asentado)
  hs.forEach(h => {
    const fuera = h.lado < 0 ? -(h.left + h.ancho + 20) : D.W + 20 - h.left; // recién afuera: aparecen enseguida
    const aterriza = T + h.llega;
    // el caño arranca justo en el golpe; los demás, cuando les toca para caer en su tiempo
    const arranque = h.tipo === 'cano' || h.tipo === 'engranaje' ? T : aterriza - saltitos(h.altura, h.saltos).suelos.at(-1);
    const altura = alturaPara(h.altura, h.saltos, aterriza - arranque);
    const { suelos, dur } = saltitos(h.altura, h.saltos, altura);
    entrarSaltando(tl, el[h.tipo], { desdeX: fuera, hastaX: 0, saltos: h.saltos, altura }, arranque);
    suelos.forEach((t, i) => {
      const ultimo = i === suelos.length - 1;
      D.sfx('plip', arranque + t, ultimo ? 0.1 : 0.05, h.voz * (ultimo ? 1 : 1.25));
    });
    listos[h.tipo] = arranque + dur;
  });
  D.sfx('fold', T + ENTRADA.cano.llega, 0.24); // el caño pesa: golpe sordo al aterrizar

  // ── cinco Handys, cinco letras (20,5–22,5) ────────────────────────────────
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
    D.sfx('plip', cima - 0.24, 0.07, 300); // el impulso
    D.sfx('bell', cima, PENTA[i], 0.07, 1.4);
  });

  // ── se juntan en el wordmark (23,0) y encajan (23,5) ──────────────────────
  const tJunta = T + 4.95;
  LETRAS.forEach((l, i) => {
    // anticipación: se abren un poquito antes de juntarse. Arrancan de izquierda a derecha (la H va a la derecha y las
    // demás a la izquierda: así ninguna alcanza a la de al lado en el camino)
    tl.to(letras[i], { x: enLinea[l].x * 1.04, duration: 0.2, ease: 'power2.out' }, tJunta - 0.2);
    tl.to(letras[i], { x: 0, y: 0, duration: 0.55, ease: 'expo.inOut' }, tJunta + i * 0.012);
  });
  const encaja = T + 5.5;
  tl.to(letras, { scaleY: 0.9, scaleX: 1.06, duration: 0.07, ease: 'power2.out' }, encaja);
  tl.to(letras, { scaleY: 1, scaleX: 1, duration: 0.45, ease: 'back.out(3)' }, encaja + 0.07);
  tl.to(palabrasBajada, { opacity: 1, y: 0, duration: 0.6, ease: 'expo.out', stagger: 0.12 }, encaja + 0.05);
  D.sfx('whoosh', tJunta - 0.2, 0.7, 0.14);
  D.sfx('fold', encaja, 0.2);
  [72, 76, 79].forEach((n, k) => D.sfx('bell', encaja + k * 0.02, hz(n + 12), 0.04, 2));

  // ── el orgullo (23,5–24,85): caras de festejo, la lamparita se enciende, respiran y el caño saluda ──
  const tSale = {};
  hs.forEach((h, k) => {
    tSale[h.tipo] = T + 6.85 + k * 0.08; // salen de izquierda a derecha, una corchea corta entre cada uno
    humor(tl, el[h.tipo], 'festejo', encaja + k * 0.04);
    idle(tl, el[h.tipo], finSalto[h.tipo], tSale[h.tipo] - finSalto[h.tipo], { amp: 0.03 });
  });
  const rayos = el.lamparita.querySelector('.hd-h-rayos');
  if (rayos) {
    const svgOrigin = rayos.getAttribute('data-origen') ?? '0 0';
    tl.to(rayos, { scale: 1.3, duration: 0.14, ease: 'power2.out', svgOrigin }, encaja);
    tl.to(rayos, { scale: 1, duration: 0.7, ease: 'elastic.out(1, 0.4)', svgOrigin }, encaja + 0.14);
  }
  saludo(tl, el.cano, T + 5.7, { lado: 'izq', veces: 2 });
  parpadeo(tl, el.llave, T + 6.2);

  // ── saltan y se van por abajo (24,85–25,9); a las 26,0 queda el logo solo ──
  hs.forEach((h, k) => {
    // el saltito no llega a la bajada del logo: el caño y la lamparita, que son los altos, saltan menos
    const altura = { cano: 25, lamparita: 50 }[h.tipo] ?? 85;
    // cae hasta que la cabeza pasa el borde de abajo, contando el estirón de la caída (scaleY 1,1 desde los pies)
    salirPorAbajo(tl, el[h.tipo], tSale[h.tipo], { altura, caida: D.H - h.top + h.altura * 0.12 + 40 });
    D.sfx('plip', tSale[h.tipo] + 0.1, 0.05, h.voz * 1.4);
  });
  D.sfx('whoosh', T + 7.0, 0.7, 0.12);

  D.hide(s, T + o.dur);
  return o.dur;
});

/* ───────────── 4 · inicio ───────────── */

Trailer.recipe('hd-inicio', (D, T, o) => {
  const tl = D.tl;
  const s = D.scene('inicio', '');
  const { tel, dedo } = armarTelefono(s, pantallaInicio());
  // el logo del escenario, donde lo dejó la escena 3 (encima del teléfono)
  s.insertAdjacentHTML('beforeend',
    `<div class="hd-b-logo" style="position:absolute;left:${LOGO.x}px;top:${LOGO.y}px;width:${LOGO.width}px;height:${LOGO.alto.toFixed(2)}px">`
    + handyLogo({ width: LOGO.width }) + '</div>');
  const logo = s.querySelector('.hd-b-logo');
  const bajada = logo.querySelector('.hd-logo-bajada');
  const tit = ponerTitular(s, 'Pedís lo que necesitás.');

  const inicio = tel.querySelector('[data-pantalla="inicio"]');
  const logoHeader = inicio.querySelector('.hd-header-logo');
  const titulos = Array.from(inicio.querySelectorAll('.hd-titulo-seccion'));
  const rubros = Array.from(inicio.querySelectorAll('.hd-fichas[data-grupo="rubros"] .hd-ficha'));
  const accesos = Array.from(inicio.querySelectorAll('.hd-fichas[data-grupo="accesos"] .hd-ficha'));
  const urgencia = inicio.querySelector('.hd-urgencia');
  const plomeria = inicio.querySelector('.hd-ficha[data-id="plomeria"]');
  const icono = f => f.querySelector(':scope > .hd-ficha-icono');

  // el FLIP del logo: caja del lockup compacto del encabezado con el teléfono ya en su lugar
  const b = D.box(logoHeader.querySelector('svg'));
  const flip = palabraHacia({ x: LOGO.x, y: LOGO.y, width: LOGO.width }, { x: b.x, y: b.y, width: b.w, tagline: 'compacta' });
  const pPlomeria = centro(plomeria, tel);

  // estados iniciales: teléfono abajo, fuera de cuadro; el contenido de la pantalla apagado
  gsap.set(tel, { y: D.H + 40 });
  gsap.set(logoHeader, { opacity: 0 });
  gsap.set(titulos, { opacity: 0, y: 16 });
  gsap.set([...rubros, ...accesos], { opacity: 0, scale: 0.6 });
  gsap.set(urgencia, { opacity: 0, scale: 0.3 });
  logo.style.willChange = 'transform';

  D.show(s, T);

  // ── el teléfono sube y el logo se mete en su encabezado (26,0–26,9) ───────
  // En el golpe la bajada se recoge debajo del wordmark (lockup compacto) y el logo empieza a achicarse hacia su
  // esquina; el teléfono sube 0,1 s después (expo.out: está quieto antes de que el logo lo cruce) y recién entonces
  // el logo viaja a la derecha y aterriza en el encabezado. Así nunca pisa la barra de estado ni la isla del teléfono.
  // Al llegar, el logo del encabezado, exactamente debajo, lo reemplaza.
  const llega = T + 0.9;
  gsap.set(logo, { transformOrigin: '0 0' });
  tl.to(bajada, { ...LOGO_INFO.bajadaCompacta, svgOrigin: '0 0', duration: 0.35, ease: 'power2.inOut' }, T);
  tl.to(logo, { scale: flip.scale, duration: 0.9, ease: 'power3.inOut' }, T);
  tl.to(logo, { y: flip.y, duration: 0.9, ease: 'power3.inOut' }, T);
  tl.to(logo, { x: flip.x, duration: 0.75, ease: 'power3.inOut' }, T + 0.15);
  tl.to(tel, { y: PHONE_XY.y, duration: 0.8, ease: 'expo.out' }, T + 0.1);
  tl.set(logoHeader, { opacity: 1 }, llega);
  tl.set(logo, { autoAlpha: 0 }, llega);
  D.sfx('whoosh', T, 0.6, 0.16);
  D.sfx('tick', llega - 0.02, 0.06);

  // ── cascada (26,6–28,0) y titular (27,0) ──────────────────────────────────
  const fichaEn = (k, t0) => t0 + Math.floor(k / 3) * 0.25 + (k % 3) * 0.06; // por fila, y de izquierda a derecha
  tl.to(titulos[0], { opacity: 1, y: 0, duration: 0.5, ease: 'expo.out' }, T + 0.6);
  rubros.forEach((f, k) => tl.to(f, { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(1.7)' }, fichaEn(k, T + 0.75)));
  tl.to(titulos[1], { opacity: 1, y: 0, duration: 0.5, ease: 'expo.out' }, T + 1.25);
  accesos.forEach((f, k) => tl.to(f, { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(1.7)' }, fichaEn(k, T + 1.4)));
  tl.to(urgencia, { opacity: 1, duration: 0.2, ease: 'power1.out' }, T + 2.0);
  tl.to(urgencia, { scale: 1, duration: 0.55, ease: 'back.out(2.6)' }, T + 2.0);
  [0.75, 1.0, 1.4, 1.65].forEach(t => D.sfx('key', T + t, 0.07));
  D.sfx('plip', T + 2.0, 0.07, 700);
  entraTitular(tl, tit, T + 1.0);

  // ── recorrido: una ficha por corchea (29,0–32,0): se levanta y su ícono salta ──
  const resaltar = (f, t) => {
    latido(tl, f, t, 1.07);
    latido(tl, icono(f), t + 0.03, 1.24);
  };
  rubros.forEach((f, k) => {
    const t = T + 3.0 + k * 0.25;
    resaltar(f, t);
    D.sfx('plip', t, 0.035, PENTA[k]);
  });
  accesos.forEach((f, k) => {
    const t = T + 4.75 + k * 0.25;
    resaltar(f, t);
    D.sfx('plip', t, 0.035, PENTA[5 - k]);
  });
  latido(tl, urgencia, T + 6.5, 1.12);

  // ── el dedo toca Plomería (35,0) ──────────────────────────────────────────
  entrarDedo(tl, dedo, 300, 600, T + 7.6);
  const toque = tocar(tl, dedo, pPlomeria.x, pPlomeria.y, T + 8.45).toque; // = T + 9,0
  apretar(tl, plomeria, toque);
  tl.to(plomeria.querySelector('.hd-ficha-sel'), { opacity: 1, duration: 0.18, ease: 'power1.out' }, toque);
  D.sfx('tick', toque, 0.07);
  D.sfx('key', toque, 0.1);
  salirDedo(tl, dedo, toque + 0.3, { dx: 240, dy: 520 });
  saleTitular(tl, tit, T + 9.25);

  D.hide(s, T + o.dur);
  return o.dur;
});

/* ───────────── 5 · tipo de trabajo ───────────── */

Trailer.recipe('hd-tipo-de-trabajo', (D, T, o) => {
  const tl = D.tl;
  const s = D.scene('tipo-de-trabajo', '');
  // las tres capas en un mismo teléfono: inicio (Plomería ya elegida, como quedó en la escena 4), la hoja y la fecha
  const { tel, dedo } = armarTelefono(s, pantallaInicio({ seleccion: 'plomeria' }) + hojaTipoTrabajo() + pantallaFecha());
  const tit = ponerTitular(s, 'Urgencia,|programado|u obra.');

  const inicio = tel.querySelector('[data-pantalla="inicio"]');
  const capaHoja = tel.querySelector('[data-pantalla="tipo-de-trabajo"]');
  const velo = capaHoja.querySelector('.hd-velo');
  const hoja = capaHoja.querySelector('.hd-hoja');
  const opciones = ['urgencia', 'programado', 'obra'].map(id => capaHoja.querySelector(`.hd-opcion[data-id="${id}"]`));
  const programado = opciones[1];
  const selProgramado = programado.querySelector('.hd-opcion-sel');
  const marca = selProgramado.querySelector('.hd-opcion-marca');
  const fecha = tel.querySelector('[data-pantalla="fecha"]');
  const rueda = fecha.querySelector('.hd-rueda');
  const resumen = fecha.querySelector('.hd-resumen');
  const nota = fecha.querySelector('.hd-nota');
  const pedir = fecha.querySelector('.hd-boton[data-accion="pedir-presupuestos"]');
  const pProgramado = centro(programado, tel);
  const pPedir = centro(pedir, tel);

  // estados iniciales
  gsap.set(velo, { opacity: 0 });
  gsap.set(hoja, { yPercent: 100 });
  gsap.set(opciones, { opacity: 0, y: 28 });
  gsap.set(marca, { scale: 0.3 });
  gsap.set(fecha, { xPercent: 100 });
  ponerRueda(rueda, 'dia', 0);
  ponerRueda(rueda, 'hora', 4);
  gsap.set([resumen, nota], { opacity: 0, y: 14 });

  D.show(s, T);

  // ── se oscurece la app y sube la hoja (36,0) ──────────────────────────────
  tl.to(velo, { opacity: 1, duration: 0.4, ease: 'power1.out' }, T);
  tl.to(hoja, { yPercent: 0, duration: 0.75, ease: 'expo.out' }, T);
  tl.to(opciones, { opacity: 1, y: 0, duration: 0.55, ease: 'expo.out', stagger: 0.1 }, T + 0.3);
  D.sfx('whoosh', T - 0.05, 0.5, 0.1);
  D.sfx('fold', T + 0.2, 0.12);

  // ── titular de a un grupo, y cada grupo ilumina su fila (37,0–38,0) ───────
  [0, 1, 2].forEach(g => {
    const t = T + 1.0 + g * 0.5;
    entraTitular(tl, tit, t, { grupo: g });
    latido(tl, opciones[g].querySelector(':scope > .hd-opcion-icono'), t + 0.05, 1.16);
    D.sfx('plip', t + 0.05, 0.04, PENTA[g * 2]);
  });

  // ── el dedo elige Programado (39,5) ───────────────────────────────────────
  entrarDedo(tl, dedo, 330, 860, T + 2.2);
  const t1 = tocar(tl, dedo, pProgramado.x, pProgramado.y, T + 2.95).toque; // = T + 3,5
  apretar(tl, programado, t1, 0.96);
  tl.to(selProgramado, { opacity: 1, duration: 0.18, ease: 'power1.out' }, t1);
  tl.to(marca, { scale: 1, duration: 0.45, ease: 'back.out(3)' }, t1 + 0.06);
  D.sfx('tick', t1, 0.07);
  D.sfx('plip', t1 + 0.06, 0.05, 1100);
  salirDedo(tl, dedo, t1 + 0.3, { dx: 220, dy: 480 });

  // ── entra la pantalla de fecha (40,0) ─────────────────────────────────────
  const tFecha = T + 4.0;
  tl.to(fecha, { xPercent: 0, duration: 0.7, ease: 'expo.inOut' }, tFecha);
  tl.to([inicio, capaHoja], { x: -120, duration: 0.7, ease: 'expo.inOut' }, tFecha);
  D.sfx('whoosh', tFecha - 0.05, 0.55, 0.1);

  // ── la rueda: días 0 → 2 y horas 4 → 2, con un tic por fila (40,75–42,0) ──
  const tDia = T + 4.75, tHora = T + 5.25, durDia = 0.9, durHora = 0.8;
  girarRueda(tl, rueda, 'dia', FECHA.dia, tDia, { dur: durDia });
  girarRueda(tl, rueda, 'hora', FECHA.hora, tHora, { dur: durHora });
  // power3.out: la fila del medio de cada salto cambia en p = .5 (1 - .5^(1/3) del tiempo) y la última encaja cerca del final
  const cruce = p => 1 - Math.pow(1 - p, 1 / 3);
  [[tDia, durDia], [tHora, durHora]].forEach(([t0, d]) => {
    D.sfx('tick', t0 + cruce(0.25) * d, 0.05);
    D.sfx('tick', t0 + cruce(0.75) * d, 0.05);
    D.sfx('key', t0 + cruce(0.97) * d, 0.06);
  });

  // ── el resumen (42,0) ─────────────────────────────────────────────────────
  tl.to(resumen, { opacity: 1, y: 0, duration: 0.55, ease: 'expo.out' }, T + 6.0);
  latido(tl, resumen.querySelector('.hd-resumen-pildora'), T + 6.05, 1.05);
  tl.to(nota, { opacity: 1, y: 0, duration: 0.55, ease: 'expo.out' }, T + 6.2);
  D.sfx('bell', T + 6.0, hz(86), 0.05, 1.6);
  D.sfx('bell', T + 6.04, hz(91), 0.035, 1.6);

  // ── el dedo toca "Pedir presupuestos" (44,5) y se va ───────────────────────
  entrarDedo(tl, dedo, 290, 900, T + 7.35);
  const t2 = tocar(tl, dedo, pPedir.x, pPedir.y, T + 8.1, { viaje: 0.4 }).toque; // = T + 8,5
  apretar(tl, pedir, t2);
  D.sfx('tick', t2, 0.07);
  D.sfx('plip', t2 + 0.04, 0.06, 1300);
  salirDedo(tl, dedo, t2 + 0.35, { dx: 220, dy: 480 });
  saleTitular(tl, tit, T + 9.0);

  D.hide(s, T + o.dur);
  return o.dur;
});
