/* HANDY · App de usuario — escenas 8, 9 y 10 (grupo D).
     'hd-seguimiento'  escena 8 · seguimiento  68–80 s  (devuelve 12)  "Tu teléfono no se comparte. Todo queda en Handy."
     'hd-resena'       escena 9 · reseña       80–85 s  (devuelve 5)   "¿Cómo fue tu experiencia con Martín?"
     'hd-cierre'       escena 10 · cierre      85–90 s  (devuelve 5)   logo · "Mar del Plata · Llegamos el 28/10" · QR

   Escena 8 — seguimiento (arranca del cuadro final de la 7: el teléfono en su lugar con "¡Pedido confirmado!")
     68,0   salto de tiempo: a la izquierda aparece un reloj y sus agujas vuelan de 10:41 a 16:00; la tarjeta de éxito se
            va y la pantalla se funde en el seguimiento (encabezado azul, mapa de la costa). 69,25 "Jueves 15 de octubre".
     68,7   "Buscando a Martín…": el radar late alrededor de la casa y se llena el primer tramo.
     71,0   "Martín está en camino": aparece Martín, la ruta se arma punto a punto y él la recorre (el reloj acompaña
            hasta las 16:12); los puntos que pasa se apagan y se llena el segundo tramo.
     74,0   "¡Martín llegó!": rebota la casa, tilde verde, se llena el último tramo. "Llega entre 16:06 y 16:30" a la
            vista todo el tiempo.
     75,0   el dedo toca el botón de chat: entra el chat con Martín (empuje desde la derecha). Titular "Tu teléfono no
            se comparte." con el aviso del candado (75,5); llegan los mensajes con un "ding" (76,25 · 76,75), la foto
            de la pérdida (77,5) y "Perfecto, ya sé qué llevar." (78,25); 77,25 "Todo queda en Handy."
     79,0   sale el titular · 79,25 el chat se cierra hacia la derecha y vuelve el inicio (así arranca la 9).
   Escena 9 — reseña (golpe a las 80,0)
     80,0   el teléfono va al centro y sube la hoja "¿Cómo fue tu experiencia con Martín?" (sus piezas en cascada).
     81,0   el dedo toca la quinta estrella: se completan las cinco, una por medio tiempo, con campanas ascendentes.
     82,5   toca "Enviar": los Handys saltan a cuadro alrededor del teléfono, desde abajo del borde de la pantalla (la
            gota cae del caño), papelitos de colores salen de atrás del teléfono y cada uno festeja (cara de festejo,
            brazos arriba, salto; el engranaje gira en el aire). A las 84,95 están todos quietos en su lugar, como
            arranca la 10.
   Escena 10 — cierre (golpe a las 85,0; termina la película)
     85,0   el teléfono se levanta apenas y cae; los Handys se juntan al centro a saltitos, en la fila de handys-grupo.png.
     85,9   arriba entra el logo letra por letra y la bajada · 86,75 "Mar del Plata · Llegamos el 28/10".
     87,25  el QR (si D.cfg.qrUrl tiene algo: tarjeta blanca al lado del texto; si no, solo el texto, centrado).
     87,5   saludo final (la lamparita saluda y brilla, el engranaje da una vuelta, parpadeos) · 88,0 acorde final.
     89,0–90,0 todo quieto: es el cuadro que queda bajo "↺ Ver de nuevo" (franja y > 960, x 470–970 libre).

   Contratos de los cortes: a las 68,0 el teléfono está en PHONE_XY (hora 10:41) con pantallaConfirmar() y su éxito (lo
   deja así la escena 7); a las 80,0 el teléfono en PHONE_XY con el inicio (17:10); a las 85,0 el teléfono al centro con la
   reseña completa y los Handys parados alrededor; el cuadro de las 90,0 queda quieto.
   El QR sale de D.cfg.qrUrl (QR_URL en js/trailer.js; en desarrollo ?qr=<url> la pisa).
   Sangrado (src/handy/layout.ts): estas escenas no tienen fondo propio (el gris de #bg ya llega al borde de la
   pantalla) ni recortes del tamaño del cuadro (los papelitos que suben más allá del cuadro siguen en el sangrado). Lo
   único que espera afuera son los Handys de la 9: debajo del cuadro más el sangrado de abajo (afuera('y')), para que
   en una pantalla más alta que 4:3 no se los vea esperando. En 4:3 el sangrado es 0 y todo queda como siempre.
   Solo transform y opacity, todo en D.tl en tiempos absolutos desde T, estados iniciales con gsap.set, azar con D.rand. */
import { gsap } from 'gsap';
import { COLORS, SCREEN } from '../../../src/handy/tokens.ts';
import { PHONE, afuera } from '../../../src/handy/layout.ts';
import { icon } from '../../../src/handy/icons.ts';
import { handyLogo, logoAlto, LETRAS, LOGO_INFO } from '../../../src/handy/logo.ts';
import { qrSvg, qrModulos } from '../../../src/handy/qr.ts';
import { phoneFrame, TELEFONO_EN_CASA } from '../../../src/handy/ui/PhoneFrame.ts';
import { titular, prepararTitular, entraTitular, saleTitular } from '../../../src/handy/ui/Headline.ts';
import { finger, prepararDedo, entrarDedo, tocar, salirDedo, centro } from '../../../src/handy/ui/Finger.ts';
import { prepararEstrellas, llenarEstrellas } from '../../../src/handy/ui/StarRating.ts';
import { moverPorRuta, rutaDelta, RUTA_PUNTOS, MAPA_CASA } from '../../../src/handy/ui/MapView.ts';
import { pantallaInicio, pantallaConfirmar, hojaResena } from '../../../src/handy/pantallas/usuario.ts';
import { pantallaSeguimiento, pantallaChatEspecialista, ESPECIALISTAS } from '../../../src/handy/pantallas/usuario-chat.ts';
import { handy, filaHandys, puntoGoteo } from '../../../src/handy/handys.ts';
import { humor, parpadeo, salto, festejo, saludo, entrarSaltando } from '../../../src/handy/handys-anim.ts';

/** el teléfono en su lugar de las escenas de app y al centro del escenario (x/y del transform de .hd-telefono) */
const TEL = TELEFONO_EN_CASA;
const TEL_CENTRO = { x: 720 - PHONE.w / 2, y: TEL.y };
/** notas (Hz) */
const HZ = { C4: 261.63, G4: 392, C5: 523.25, E5: 659.25, G5: 783.99, A5: 880, C6: 1046.5, D6: 1174.66, E6: 1318.51, G6: 1567.98 };
/** el color de Martín R. (mapa, panel y chat lo usan; la hoja de reseña lo toma de acá) */
const COLOR_MARTIN = ESPECIALISTAS.martin.color;

const ESTILO = `<style>
  .hdd { position: absolute; inset: 0; }
  .hdd .hd-titular { margin: 0; }
  .hdd8-reloj { position: absolute; width: 250px; height: 250px; }
  .hdd8-reloj svg { display: block; overflow: visible; }
  .hdd8-tit .hd-tit-grupo[data-i="1"] { display: block; }
  .hdd8-llego { position: absolute; display: flex; align-items: center; justify-content: center; width: 30px; height: 30px;
    margin: -15px 0 0 -15px; border-radius: 50%; border: 2.5px solid #FFFFFF; background: var(--hd-verde); color: #FFFFFF; }
  .hdd8-llego .hd-icon { width: 17px; height: 17px; }
  .hdd-h { position: absolute; }
  .hdd9-confeti { position: absolute; inset: 0; pointer-events: none; }
  .hdd9-c { position: absolute; display: block; }
  .hdd9-c[data-forma="tira"] { width: 10px; height: 18px; margin: -9px 0 0 -5px; border-radius: 2px; background: currentColor; }
  .hdd9-c[data-forma="punto"] { width: 12px; height: 12px; margin: -6px 0 0 -6px; border-radius: 50%; background: currentColor; }
  .hdd9-c[data-forma="tri"] { width: 0; height: 0; margin: -7px 0 0 -8px; border-left: 8px solid transparent;
    border-right: 8px solid transparent; border-bottom: 14px solid currentColor; }
  .hdd10-logo { position: absolute; }
  .hdd10-logo svg { display: block; }
  .hdd10-qr { position: absolute; border-radius: 28px; background: #FFFFFF; }
  .hdd10-qr svg { position: absolute; display: block; }
</style>`;

/* ── utilidades ────────────────────────────────────────────────────────────────────────────────────────────────── */

/** una barra de estado suelta (hora y tema propios), para cambiar la hora o el color de los íconos con opacity */
function barraEstado(hora, estado) {
  const t = document.createElement('div');
  t.innerHTML = phoneFrame({ pantalla: '', hora, estado });
  return t.querySelector('.hd-barra-estado');
}

/** fundido cruzado entre dos capas */
function cruzar(tl, sale, entra, at, dur = 0.3) {
  tl.to(sale, { opacity: 0, duration: dur, ease: 'power1.inOut' }, at);
  tl.to(entra, { opacity: 1, duration: dur, ease: 'power1.inOut' }, at);
}

/** cambio seco (un dígito del reloj de la barra de estado cambia de golpe) */
function cambiar(tl, sale, entra, at) {
  tl.set(sale, { opacity: 0 }, at);
  tl.set(entra, { opacity: 1 }, at);
}

/** apretar un botón de la interfaz en el momento del toque (como en las escenas 6 y 7) */
function apretar(tl, el, toque, escala = 0.94) {
  tl.to(el, { scale: escala, duration: 0.08, ease: 'power2.out' }, toque);
  tl.to(el, { scale: 1, duration: 0.35, ease: 'back.out(3)' }, toque + 0.14);
}

/** pulso: sube y vuelve con rebote */
function pulso(tl, el, at, { escala = 1.14, origen = '50% 50%' } = {}) {
  tl.set(el, { transformOrigin: origen }, at);
  tl.to(el, { scale: escala, duration: 0.16, ease: 'power2.out' }, at);
  tl.to(el, { scale: 1, duration: 0.45, ease: 'back.out(2.6)' }, at + 0.16);
}

/** inversa de power1.inOut: en qué fracción del tiempo el pin pasa por la fracción t de la ruta */
const inversa = t => (t < 0.5 ? Math.sqrt(t / 2) : 1 - Math.sqrt((1 - t) / 2));

/** reloj de agujas (250 px): esfera blanca con aro azul, marcas y dos agujas que giran alrededor de (125, 125) */
const RELOJ_C = 125;
const RELOJ_ORIGEN = `${RELOJ_C} ${RELOJ_C}`;
function reloj() {
  const f = n => n.toFixed(1);
  let marcas = '';
  for (let i = 0; i < 12; i++) {
    const a = (i * Math.PI) / 6, mayor = i % 3 === 0, r1 = mayor ? 82 : 91, r2 = 100;
    marcas += `<line x1="${f(RELOJ_C + r1 * Math.sin(a))}" y1="${f(RELOJ_C - r1 * Math.cos(a))}" x2="${f(RELOJ_C + r2 * Math.sin(a))}" `
      + `y2="${f(RELOJ_C - r2 * Math.cos(a))}" stroke="${mayor ? COLORS.azul : '#A8BBD8'}" stroke-width="${mayor ? 7 : 4.5}" stroke-linecap="round"/>`;
  }
  return '<svg viewBox="0 0 250 250" width="250" height="250" aria-hidden="true">'
    + `<circle cx="125" cy="125" r="116" fill="#FFFFFF" stroke="${COLORS.azul}" stroke-width="12"/>`
    + marcas
    + `<g class="hdd8-ag-h"><line x1="125" y1="125" x2="125" y2="66" stroke="${COLORS.azul}" stroke-width="12" stroke-linecap="round"/></g>`
    + `<g class="hdd8-ag-m"><line x1="125" y1="125" x2="125" y2="38" stroke="${COLORS.azulHandy}" stroke-width="8" stroke-linecap="round"/></g>`
    + `<circle cx="125" cy="125" r="11" fill="${COLORS.azul}"/><circle cx="125" cy="125" r="4" fill="#FFFFFF"/>`
    + '</svg>';
}
/** ángulo de las agujas (0° = las 12) para una hora h:m, sumando vueltas para que siempre avancen */
const anguloHora = (h, m, vueltas = 0) => ((h % 12) + m / 60) * 30 + 360 * vueltas;
const anguloMin = (m, vueltas = 0) => m * 6 + 360 * vueltas;

/* ── los Handys de las escenas 9 y 10 ────────────────────────────────────────────────────────────────────────────
   La fila final es la de handys-grupo.png (filaHandys), centrada, con los pies del caño en PISO. En la 9 el teléfono
   está al centro: la gota y el caño quedan corridos a su izquierda (−DL) y el engranaje, la lamparita y la llave a
   su derecha (+DR); en la 10 se juntan saltando hasta la fila. */
const ALTO_CANO = 360;
const FILA = filaHandys(ALTO_CANO);
const PISO = 948;
const FILA_X0 = 720 - FILA.ancho / 2;
const FILA_Y0 = PISO - ALTO_CANO;
const POS = Object.fromEntries(FILA.handys.map(h => [h.tipo, { x: FILA_X0 + h.x, y: FILA_Y0 + h.y, w: h.ancho, h: h.altura }]));
const MARGEN_TEL = 26;
const DL = Math.round(POS.cano.x + POS.cano.w - (TEL_CENTRO.x - MARGEN_TEL));
const DR = Math.round(TEL_CENTRO.x + PHONE.w + MARGEN_TEL - POS.engranaje.x);
const corrimiento = tipo => (tipo === 'gota' || tipo === 'cano' ? -DL : DR);
/** orden de la fila (y del DOM: el caño tapa a la gota cuando cae, la lamparita va detrás de la llave) */
const TIPOS = FILA.handys.map(h => h.tipo);

/** los cinco, cada uno en una caja posicionada (la escena mueve la caja; los helpers animan el .hd-handy de adentro) */
function handysHtml(corridos) {
  return TIPOS.map(tipo => {
    const p = POS[tipo], x = p.x + (corridos ? corrimiento(tipo) : 0);
    return `<div class="hdd-h" data-tipo="${tipo}" style="left:${x.toFixed(1)}px;top:${p.y.toFixed(1)}px;width:${p.w.toFixed(1)}px;height:${p.h.toFixed(1)}px">`
      + handy(tipo, { altura: p.h }) + '</div>';
  }).join('');
}

/* ════════════════════════════════════════════════════════════════════════════════════════════════════════════════
   Escena 8 · seguimiento (68–80 s)
   ════════════════════════════════════════════════════════════════════════════════════════════════════════════════ */
const TEXTO8 = 'Tu teléfono no se comparte.|Todo queda en Handy.';
const COLUMNA_X = 110;
const COLUMNA_CY = 530;

Trailer.recipe('hd-seguimiento', (D, T, o) => {
  const tl = D.tl;
  const s = D.scene('seguimiento', `${ESTILO}<div class="hdd hd-ui">
      ${phoneFrame({ pantalla: pantallaInicio() + pantallaSeguimiento('buscando') + pantallaChatEspecialista() + pantallaConfirmar() })}
      <div class="hdd8-reloj">${reloj()}</div>
      ${titular({ texto: 'Jueves 15 de octubre', tamano: 46, className: 'hdd8-fecha' })}
      ${titular({ texto: TEXTO8, tamano: 72, className: 'hdd8-tit' })}
    </div>`);

  // ── teléfono: de abajo hacia arriba inicio · seguimiento · chat · confirmar (arriba, como lo deja la escena 7)
  const tel = D.$('.hd-telefono', s);
  gsap.set(tel, { x: TEL.x, y: TEL.y });
  const pant = D.$('.hd-pantalla', tel);
  const inicio = D.$('[data-pantalla="inicio"]', tel);
  const seg = D.$('[data-pantalla="seguimiento"]', tel);
  const chat = D.$('[data-pantalla="chat-especialista"]', tel);
  const conf = D.$('[data-pantalla="confirmar"]', tel);
  const tarjetaExito = D.$('.hd-exito-tarjeta', conf);
  gsap.set([inicio, seg], { autoAlpha: 0 });
  gsap.set(chat, { x: SCREEN.w });

  // barras de estado: a = la del marco (10:41, íconos oscuros) · b/c sobre el azul del seguimiento · d/e sobre blanco
  const isla = D.$('.hd-isla', pant);
  const barras = { a: D.$('.hd-barra-estado', pant) };
  for (const [k, hora, estado] of [['b', '16:00', 'claro'], ['c', '16:12', 'claro'], ['d', '16:12', 'oscuro'], ['e', '17:10', 'oscuro']]) {
    barras[k] = barraEstado(hora, estado);
    pant.insertBefore(barras[k], isla);
    gsap.set(barras[k], { opacity: 0 });
  }

  // seguimiento: radar, ruta, pines, estados del panel y tramos de la barra
  const anillos = D.$$('.hd-radar', seg);
  const puntos = D.$$('.hd-ruta-punto', seg);
  const pin = D.$('.hd-pin-especialista', seg);
  const casa = D.$('.hd-pin-casa', seg);
  const estado = e => D.$(`.hd-seg-estado[data-estado="${e}"]`, seg);
  const relleno = i => D.$(`.hd-seg-tramo[data-i="${i}"] .hd-seg-relleno`, seg);
  const btnChat = D.$('.hd-seg-btn[data-accion="chat"]', seg);
  gsap.set(anillos, { scale: 0.15, opacity: 0 });
  gsap.set(puntos, { opacity: 0, scale: 0 });
  gsap.set(pin, { ...rutaDelta(0), opacity: 0, scale: 0.4 });
  gsap.set([relleno(0), relleno(1), relleno(2)], { scaleX: 0 });
  gsap.set(estado('buscando'), { opacity: 1 });
  gsap.set([estado('en-camino'), estado('llego')], { opacity: 0 });
  // tilde de llegada, arriba a la derecha del pin de la casa (px del mapa)
  D.$('.hd-mapa-capa', seg).insertAdjacentHTML('beforeend',
    `<span class="hdd8-llego" style="left:${MAPA_CASA.x + 22}px;top:${MAPA_CASA.y - 50}px">${icon('tilde', { size: 17, stroke: 3.4 })}</span>`);
  const tilde = D.$('.hdd8-llego', seg);
  gsap.set(tilde, { scale: 0, opacity: 0 });

  // chat: el aviso del candado y los cuatro mensajes, escondidos en su lugar (la lista entra sin desplazarse)
  const chip = D.$('.hd-chip-sistema', chat);
  gsap.set(chip, { opacity: 0, scale: 0.6, transformOrigin: '50% 50%' });
  const globo = id => D.$(`.hd-burbuja[data-id="${id}"] .hd-burbuja-cuerpo`, chat);
  const MENSAJES = ['hola', 'pide-foto', 'foto', 'perfecto'];
  MENSAJES.forEach(id => {
    const saliente = id === 'foto';
    gsap.set(globo(id), { opacity: 0, scale: 0.5, y: 16, transformOrigin: saliente ? '100% 100%' : '0% 100%' });
  });
  // la fila del logo queda quieta cuando el chat se cierra y vuelve el inicio (como las navegaciones de la escena 6)
  const filaChat = D.$('.hd-header-fila', chat), filaInicio = D.$('.hd-header-fila', inicio);

  // dedo dentro del teléfono
  tel.insertAdjacentHTML('beforeend', finger());
  const dedo = D.$('.hd-dedo', tel);
  prepararDedo(dedo);
  const pChat = centro(btnChat, tel);

  // ── columna izquierda: reloj + fecha (salto de tiempo) y después el titular, centrados en vertical
  const relojEl = D.$('.hdd8-reloj', s);
  const fecha = D.$('.hdd8-fecha', s);
  const tit = D.$('.hdd8-tit', s);
  const yReloj = Math.round(COLUMNA_CY - (250 + 30 + fecha.offsetHeight) / 2);
  Object.assign(relojEl.style, { left: `${COLUMNA_X}px`, top: `${yReloj}px` });
  Object.assign(fecha.style, { left: `${COLUMNA_X}px`, top: `${yReloj + 280}px` });
  Object.assign(tit.style, { left: `${COLUMNA_X}px`, top: `${Math.round(COLUMNA_CY - tit.offsetHeight / 2)}px` });
  prepararTitular(fecha);
  prepararTitular(tit);
  const agH = D.$('.hdd8-ag-h', relojEl), agM = D.$('.hdd8-ag-m', relojEl);
  gsap.set(relojEl, { scale: 0, opacity: 0, transformOrigin: '50% 50%' });
  gsap.set(agH, { rotation: anguloHora(10, 41), svgOrigin: RELOJ_ORIGEN });
  gsap.set(agM, { rotation: anguloMin(41), svgOrigin: RELOJ_ORIGEN });

  // ════════ tiempos
  const tGiro = T + 0.25;     // 68,25 las agujas vuelan a las 16:00
  const tFunde = T + 0.3;     // 68,3 confirmar → seguimiento
  const tFecha = T + 1.25;    // 69,25 "Jueves 15 de octubre"
  const tCamino = T + 3;      // 71,0 en camino
  const tRuta = T + 3.75;     // 71,75 recorre la ruta
  const DUR_RUTA = 2.25;
  const tLlego = T + 6;       // 74,0 llegó
  const tDedo = T + 6.4;      // 74,4
  const tChatTit = T + 7.5;   // 75,5 candado + titular
  const tMsj = { 'hola': T + 8.25, 'pide-foto': T + 8.75, 'foto': T + 9.5, 'perfecto': T + 10.25 };
  const tTit2 = T + 9.25;     // 77,25 "Todo queda en Handy."
  const tSale = T + 11;       // 79,0
  const tCierra = T + 11.25;  // 79,25

  D.show(s, T);

  // 68,0 · el reloj aparece y las agujas vuelan de 10:41 a 16:00 (un tic por semicorchea)
  tl.to(relojEl, { scale: 1, opacity: 1, duration: 0.55, ease: 'back.out(1.8)' }, T);
  D.sfx('whoosh', T, 0.45, 0.07);
  D.sfx('plip', T + 0.04, 0.06, 880);
  tl.to(tarjetaExito, { opacity: 0, scale: 0.9, duration: 0.3, ease: 'power2.in' }, T + 0.1);
  tl.to(agM, { rotation: anguloMin(0, 5), duration: 1, ease: 'power2.inOut', svgOrigin: RELOJ_ORIGEN }, tGiro);
  tl.to(agH, { rotation: anguloHora(16, 0, 1), duration: 1, ease: 'power2.inOut', svgOrigin: RELOJ_ORIGEN }, tGiro);
  for (let i = 0; i < 16; i++) D.sfx('tick', tGiro + i * 0.0625, 0.022 + 0.014 * Math.sin((i / 15) * Math.PI));

  // 68,3 · la confirmación se apaga y se prende el seguimiento (un parpadeo en blanco, sin doble exposición de dos
  // pantallas cargadas); los íconos de la barra de estado pasan de oscuros a blancos con su pantalla
  tl.to([conf, barras.a], { autoAlpha: 0, duration: 0.22, ease: 'power1.in' }, tFunde);
  tl.to([seg, barras.b], { autoAlpha: 1, duration: 0.38, ease: 'power1.out' }, tFunde + 0.24);

  // 69,25 · son las 16:00 del jueves 15
  entraTitular(tl, fecha, tFecha, { dur: 0.7 });
  D.sfx('bell', tFecha, HZ.C6, 0.05, 1.4);
  D.sfx('bell', tFecha + 0.06, HZ.G5, 0.035, 1.4);

  // 68,7 · "Buscando a Martín…": cinco pulsos de radar alrededor de la casa (tres anillos que se turnan)
  [0.7, 1.05, 1.4, 1.75, 2.1].forEach((p, j) => {
    const a = anillos[j % 3];
    tl.set(a, { scale: 0.15, opacity: 0.85 }, T + p);
    tl.to(a, { scale: 1, opacity: 0, duration: 1, ease: 'power1.out' }, T + p);
  });
  [0.7, 1.4, 2.1].forEach(p => D.sfx('bell', T + p, HZ.G6, 0.018, 0.6));
  tl.to(relleno(0), { scaleX: 1, duration: 1.9, ease: 'power1.inOut' }, T + 1);

  // 71,0 · "Martín está en camino": aparece, se arma la ruta y la recorre
  cruzar(tl, estado('buscando'), estado('en-camino'), tCamino);
  tl.to(pin, { opacity: 1, duration: 0.2, ease: 'power1.out' }, tCamino);
  tl.to(pin, { scale: 1, duration: 0.5, ease: 'back.out(2.2)' }, tCamino);
  D.sfx('plip', tCamino, 0.08, 620);
  tl.to(puntos, { opacity: 1, scale: 1, duration: 0.25, ease: 'back.out(2.5)', stagger: 0.022 }, tCamino + 0.15);
  D.sfx('bubbles', tCamino + 0.15, 7, 0.035);
  moverPorRuta(tl, pin, tRuta, { dur: DUR_RUTA });
  tl.to(relleno(1), { scaleX: 1, duration: DUR_RUTA, ease: 'power1.inOut' }, tRuta);
  puntos.forEach((p, i) => tl.to(p, { opacity: 0, scale: 0.4, duration: 0.2, ease: 'power1.in' }, tRuta + DUR_RUTA * inversa(RUTA_PUNTOS[i].t)));
  // el reloj acompaña el viaje: de 16:00 a 16:12
  tl.to(agM, { rotation: anguloMin(12, 5), duration: DUR_RUTA, ease: 'power1.inOut', svgOrigin: RELOJ_ORIGEN }, tRuta);
  tl.to(agH, { rotation: anguloHora(16, 12, 1), duration: DUR_RUTA, ease: 'power1.inOut', svgOrigin: RELOJ_ORIGEN }, tRuta);

  // 74,0 · "¡Martín llegó!"
  cruzar(tl, estado('en-camino'), estado('llego'), tLlego);
  tl.to(relleno(2), { scaleX: 1, duration: 0.45, ease: 'power2.out' }, tLlego);
  tl.to(casa, { scale: 1.2, duration: 0.16, ease: 'power2.out', transformOrigin: '50% 100%' }, tLlego);
  tl.to(casa, { scale: 1, duration: 0.5, ease: 'back.out(3)' }, tLlego + 0.16);
  pulso(tl, pin, tLlego + 0.05, { escala: 1.16 });
  tl.to(tilde, { scale: 1, opacity: 1, duration: 0.45, ease: 'back.out(2.6)' }, tLlego + 0.12);
  cambiar(tl, barras.b, barras.c, tLlego);
  D.sfx('bell', tLlego, HZ.G5, 0.07, 1.2);
  D.sfx('bell', tLlego + 0.12, HZ.C6, 0.08, 1.6);

  // 74,4 · el reloj y la fecha se van; el dedo toca el botón de chat (75,0)
  tl.to(relojEl, { scale: 0.75, opacity: 0, y: -26, duration: 0.4, ease: 'power3.in' }, tLlego + 0.5);
  saleTitular(tl, fecha, tLlego + 0.55);
  D.sfx('whoosh', tLlego + 0.5, 0.4, 0.04);
  entrarDedo(tl, dedo, pChat.x + 34, pChat.y + 46, tDedo, { dur: 0.35 });
  const toque = tocar(tl, dedo, pChat.x, pChat.y, tDedo + 0.35, { viaje: 0.25 }).toque;
  apretar(tl, btnChat, toque, 0.88);
  D.sfx('key', toque, 0.2);
  salirDedo(tl, dedo, toque + 0.3);

  // 75,1 · entra el chat empujando al seguimiento (íconos de la barra: de blancos a oscuros)
  tl.to(chat, { x: 0, duration: 0.7, ease: 'expo.out' }, toque + 0.1);
  tl.to(seg, { x: -Math.round(SCREEN.w * 0.3), duration: 0.7, ease: 'expo.out' }, toque + 0.1);
  cruzar(tl, barras.c, barras.d, toque + 0.15, 0.3);
  D.sfx('whoosh', toque + 0.1, 0.5, 0.09);
  // detrás del chat, el inicio queda listo para la vuelta (corrido un 30 %, con su fila del logo en su lugar)
  tl.set(seg, { autoAlpha: 0 }, toque + 0.95);
  tl.set(inicio, { autoAlpha: 1, x: -Math.round(SCREEN.w * 0.3) }, toque + 0.95);
  tl.set(filaInicio, { x: Math.round(SCREEN.w * 0.3) }, toque + 0.95);

  // 75,5 · el candado y "Tu teléfono no se comparte."
  tl.to(chip, { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(2.2)' }, tChatTit);
  D.sfx('plip', tChatTit, 0.06, 1300);
  D.sfx('key', tChatTit + 0.02, 0.08);
  entraTitular(tl, tit, tChatTit, { grupo: 0 });
  pulso(tl, chip, tChatTit + 0.75, { escala: 1.12 });

  // 76,25 · los mensajes, uno por uno (ding A – C – D como los presupuestos; la foto sale con su envío)
  MENSAJES.forEach(id => {
    const at = tMsj[id];
    tl.to(globo(id), { opacity: 1, duration: 0.18, ease: 'power1.out' }, at);
    tl.to(globo(id), { scale: 1, y: 0, duration: 0.5, ease: 'back.out(1.7)' }, at);
  });
  D.sfx('bell', tMsj.hola, HZ.A5, 0.075, 1.1);
  D.sfx('bell', tMsj['pide-foto'], HZ.C6, 0.075, 1.1);
  D.sfx('whoosh', tMsj.foto - 0.05, 0.3, 0.07);
  D.sfx('fold', tMsj.foto + 0.05, 0.1);
  D.sfx('bell', tMsj.perfecto, HZ.D6, 0.08, 1.3);

  // 77,25 · "Todo queda en Handy."
  entraTitular(tl, tit, tTit2, { grupo: 1, stagger: 0.07 });

  // 79,0 · sale el titular · 79,25 el chat se cierra hacia la derecha y vuelve el inicio (la fila del logo, quieta)
  saleTitular(tl, tit, tSale);
  tl.to(chat, { x: SCREEN.w, duration: 0.6, ease: 'power3.inOut' }, tCierra);
  tl.to(filaChat, { x: -SCREEN.w, duration: 0.6, ease: 'power3.inOut' }, tCierra);
  tl.to(inicio, { x: 0, duration: 0.6, ease: 'power3.inOut' }, tCierra);
  tl.to(filaInicio, { x: 0, duration: 0.6, ease: 'power3.inOut' }, tCierra);
  cambiar(tl, barras.d, barras.e, tCierra + 0.3);
  D.sfx('whoosh', tCierra, 0.55, 0.08);

  D.hide(s, T + o.dur);
  return o.dur;
});

/* ════════════════════════════════════════════════════════════════════════════════════════════════════════════════
   Escena 9 · reseña (80–85 s)
   ════════════════════════════════════════════════════════════════════════════════════════════════════════════════ */
const N_PAPELITOS = 36;
const COLORES_PAPELITOS = [COLORS.azul, COLORS.azulHandy, COLORS.amarilloAlerta, COLORS.blanco, '#8EC5FF', COLORS.azul];
const FORMAS = ['tira', 'tira', 'punto', 'tri'];

/** hoja de reseña con el avatar de Martín en su color (como en el mapa y el chat) */
function telefonoResena(D, s) {
  const tel = D.$('.hd-telefono', s);
  const capa = D.$('[data-pantalla="resena"]', tel);
  D.$('.hd-avatar', capa).style.background = COLOR_MARTIN;
  return { tel, capa };
}

Trailer.recipe('hd-resena', (D, T, o) => {
  const tl = D.tl;
  // papelitos: forma, color y trayectoria con el azar de la película (D.rand)
  const papelitos = Array.from({ length: N_PAPELITOS }, (_, i) => ({
    lado: i % 2 ? 1 : -1,
    forma: FORMAS[Math.floor(D.rand() * FORMAS.length)],
    color: COLORES_PAPELITOS[Math.floor(D.rand() * COLORES_PAPELITOS.length)],
    ang: D.rnd(28, 78),     // grados sobre la horizontal, hacia afuera
    dist: D.rnd(170, 380),
    cae: D.rnd(520, 760),
    deriva: D.rnd(-90, 90),
    giro: D.rnd(240, 620) * (D.rand() < 0.5 ? -1 : 1),
    giro0: D.rnd(0, 360),
    t0: D.rnd(0, 0.09),
    flip: D.rnd(0.18, 0.3),
  }));
  // salen de atrás de las esquinas de arriba del teléfono centrado
  const ORIGEN = { '-1': { x: TEL_CENTRO.x + 24, y: TEL_CENTRO.y + 150 }, '1': { x: TEL_CENTRO.x + PHONE.w - 24, y: TEL_CENTRO.y + 150 } };
  const s = D.scene('resena', `${ESTILO}<div class="hdd hd-ui">
      <div class="hdd-handys">${handysHtml(true)}</div>
      <div class="hdd9-confeti">${papelitos.map(p => {
        const o0 = ORIGEN[String(p.lado)];
        return `<i class="hdd9-c" data-forma="${p.forma}" style="left:${o0.x}px;top:${o0.y}px;color:${p.color}"></i>`;
      }).join('')}</div>
      ${phoneFrame({ pantalla: pantallaInicio() + hojaResena(), hora: '17:10' })}
    </div>`);

  // ── teléfono: el inicio como lo deja la escena 8 y la hoja de reseña escondida abajo
  const { tel, capa } = telefonoResena(D, s);
  gsap.set(tel, { x: TEL.x, y: TEL.y });
  const velo = D.$('.hd-velo', capa), hoja = D.$('.hd-hoja', capa);
  const estrellas = D.$('.hd-estrellas', capa);
  const enviar = D.$('.hd-boton[data-accion="enviar-resena"]', capa);
  const piezasHoja = [D.$('.hd-hoja-cabeza', capa), D.$('.hd-avatar', capa), D.$('.hd-resena-nombre', capa),
    D.$('.hd-resena-rubro', capa), estrellas, enviar];
  gsap.set(velo, { opacity: 0 });
  gsap.set(hoja, { yPercent: 100 });
  gsap.set(piezasHoja, { opacity: 0, y: 26 });
  prepararEstrellas(estrellas);
  tel.insertAdjacentHTML('beforeend', finger());
  const dedo = D.$('.hd-dedo', tel);
  prepararDedo(dedo);
  const p5 = centro(D.$$('.hd-estrella', estrellas)[4], tel);
  const pE = centro(enviar, tel);

  // ── Handys (cajas ya corridas a los costados del teléfono centrado): escondidos debajo de lo que se ve, el cuadro
  //    más el sangrado de abajo (en una pantalla más alta que 4:3, si no, se los ve esperando abajo del cuadro); el
  //    salto llega igual a su lugar en el mismo tiempo, solo que desde el borde de la pantalla
  const caja = tipo => D.$(`.hdd-h[data-tipo="${tipo}"]`, s);
  const cuerpo = tipo => D.$('.hd-handy', caja(tipo));
  const SALTAN = [['cano', 2.55], ['lamparita', 2.67], ['engranaje', 2.79], ['llave', 2.91]];
  const abajo = afuera('y');
  for (const [tipo] of SALTAN) gsap.set(caja(tipo), { y: 1080 - POS[tipo].y + 40 + abajo });
  // la gota se forma en el pico del caño y cae hasta su lugar de la fila
  const goteo = puntoGoteo(POS.cano.h);
  const gotaDx = POS.cano.x - DL + goteo.x - (POS.gota.x - DL + POS.gota.w / 2);
  const gotaDy = POS.cano.y + goteo.y - POS.gota.y;
  gsap.set(caja('gota'), { x: gotaDx, y: gotaDy, scale: 0, transformOrigin: '50% 0%' });

  // ── papelitos: escondidos detrás del teléfono
  const conf = D.$$('.hdd9-c', s);
  conf.forEach((el, i) => gsap.set(el, { x: 0, y: 0, rotation: papelitos[i].giro0, opacity: 0 }));

  // ════════ tiempos
  const tHoja = T + 0.1;       // 80,1
  const tDedo = T + 0.4;       // 80,4
  const tEnviar = T + 2.1;     // 82,1 el dedo viaja a "Enviar" (toque 82,5)
  const tFiesta = T + 2.6;     // 82,6 papelitos

  D.show(s, T);

  // 80,0 · golpe: el teléfono va al centro y sube la hoja
  tl.to(tel, { x: TEL_CENTRO.x, duration: 0.85, ease: 'power4.out' }, T);
  tl.to(velo, { opacity: 1, duration: 0.4, ease: 'power1.out' }, T + 0.05);
  tl.to(hoja, { yPercent: 0, duration: 0.75, ease: 'expo.out' }, tHoja);
  tl.to(piezasHoja, { opacity: 1, y: 0, duration: 0.55, ease: 'expo.out', stagger: 0.05 }, tHoja + 0.15);
  D.sfx('whoosh', T + 0.05, 0.5, 0.1);

  // 81,0 · el dedo toca la quinta estrella y se completan las cinco (una por medio tiempo, campanas que suben)
  entrarDedo(tl, dedo, p5.x + 30, p5.y + 50, tDedo, { dur: 0.35 });
  const t5 = tocar(tl, dedo, p5.x, p5.y, tDedo + 0.35, { viaje: 0.25 }).toque;
  D.sfx('key', t5, 0.16);
  llenarEstrellas(tl, estrellas, t5, { paso: 0.25 });
  [HZ.G5, HZ.A5, HZ.C6, HZ.D6, HZ.E6].forEach((f, i) => D.sfx('bell', t5 + i * 0.25, f, 0.05 + i * 0.007, 1.3));

  // 82,5 · "Enviar"
  const tE = tocar(tl, dedo, pE.x, pE.y, tEnviar, { viaje: 0.4 }).toque;
  apretar(tl, enviar, tE);
  D.sfx('key', tE, 0.2);
  salirDedo(tl, dedo, tE + 0.3);

  // 82,55 · los Handys saltan a cuadro alrededor del teléfono (un "bloop" cada uno, en arpegio). El aterrizaje es la
  // anticipación del festejo: el aplastón de salto() arranca justo cuando la caja toca el piso.
  const notasSalto = [HZ.C5, HZ.E5, HZ.G5, HZ.A5];
  const aterriza = {};
  SALTAN.forEach(([tipo, dt], i) => {
    const at = T + dt, c = caja(tipo);
    tl.to(c, { y: -70, duration: 0.34, ease: 'power2.out' }, at);
    tl.to(c, { y: 0, duration: 0.24, ease: 'power2.in' }, at + 0.34);
    aterriza[tipo] = at + 0.58;
    D.sfx('plip', at, 0.1, notasSalto[i] / 2);
    D.sfx('kick', at + 0.58, 0.16);
  });
  // 83,05 · la gota se forma en el pico del caño y cae hasta su lugar (flota, como en el dibujo original)
  const tGota = T + 3.05;
  tl.to(caja('gota'), { scale: 0.55, duration: 0.3, ease: 'power2.out' }, tGota);
  tl.to(caja('gota'), { scale: 1, duration: 0.32, ease: 'power2.in' }, tGota + 0.3);
  tl.to(caja('gota'), { x: 0, y: 0, duration: 0.32, ease: 'power2.in' }, tGota + 0.3);
  aterriza.gota = tGota + 0.62;
  D.sfx('plip', tGota + 0.62, 0.12, 520);

  // 82,6 · papelitos: salen disparados hacia afuera y arriba, caen girando y se apagan antes del corte
  conf.forEach((el, i) => {
    const p = papelitos[i], a = (p.ang * Math.PI) / 180;
    const x1 = p.lado * Math.cos(a) * p.dist, y1 = -Math.sin(a) * p.dist;
    const t0 = tFiesta + p.t0, tCae = t0 + 0.5, dCae = 1.62 - p.t0;
    tl.set(el, { opacity: 1 }, t0);
    tl.to(el, { x: x1, y: y1, rotation: p.giro0 + p.giro * 0.35, duration: 0.5, ease: 'power2.out' }, t0);
    tl.to(el, { x: x1 + p.deriva, y: y1 + p.cae, rotation: p.giro0 + p.giro, duration: dCae, ease: 'power1.in' }, tCae);
    tl.to(el, { scaleX: -1, duration: p.flip, ease: 'sine.inOut', repeat: Math.floor(dCae / p.flip) - 1, yoyo: true }, tCae);
    tl.to(el, { opacity: 0, duration: 0.3, ease: 'power1.in' }, tCae + dCae - 0.3);
  });
  D.sfx('clap', tFiesta, 0.2);
  D.sfx('bubbles', tFiesta + 0.04, 9, 0.045);

  // cada uno festeja al aterrizar (cara de festejo, brazos arriba, salto; el engranaje con una vuelta en el aire).
  // festejo() salta 0,08 s después de empezar: arranca 0,08 antes de tocar el piso. Todos quietos antes de las 84,95.
  const fin = T + o.dur - 0.05;
  const fiestas = [];
  const fiesta = (tipo, altura) => { const at = aterriza[tipo] - 0.08; fiestas.push(at + festejo(tl, cuerpo(tipo), at, { saltos: 1, altura })); };
  fiesta('cano', 96);
  fiesta('lamparita', 92);
  const tEng = aterriza.engranaje;
  humor(tl, cuerpo('engranaje'), 'festejo', tEng - 0.08, 0.12);
  const dEng = salto(tl, cuerpo('engranaje'), tEng, { altura: 96, rot: 360 });
  humor(tl, cuerpo('engranaje'), 'feliz', tEng + dEng - 0.15, 0.15);
  fiestas.push(tEng + dEng);
  fiesta('llave', 80);
  fiesta('gota', 54);
  D.sfx('bell', aterriza.cano + 0.2, HZ.C5, 0.035, 1.6);
  D.sfx('bell', aterriza.cano + 0.24, HZ.E5, 0.03, 1.6);
  D.sfx('bell', aterriza.cano + 0.28, HZ.G5, 0.03, 1.6);
  if (Math.max(...fiestas) > fin) console.warn(`[escena 9] el festejo termina a las ${Math.max(...fiestas).toFixed(2)} s (corte ${T + o.dur} s)`);

  D.hide(s, T + o.dur);
  return o.dur;
});

/* ════════════════════════════════════════════════════════════════════════════════════════════════════════════════
   Escena 10 · cierre (85–90 s): el último cuadro queda quieto
   ════════════════════════════════════════════════════════════════════════════════════════════════════════════════ */
const TEXTO10 = 'Mar del Plata · Llegamos el 28/10';
/** zona de arriba (logo + texto + QR), entre el margen seguro y la fila de Handys */
const ZONA = { y0: 72, y1: FILA_Y0 - 30 };

Trailer.recipe('hd-cierre', (D, T, o) => {
  const tl = D.tl;
  const url = String(D.cfg.qrUrl || '').trim();
  const modulos = url ? qrModulos(url) : 0;
  const qrLado = modulos ? modulos * Math.max(4, Math.floor(176 / modulos)) : 0;
  const qr = url ? qrSvg(url, { size: qrLado, color: COLORS.azul }) : '';
  const conQr = !!qr;
  const LOGO_W = conQr ? 580 : 640;
  const TXT = conQr ? 50 : 56;
  const s = D.scene('cierre', `${ESTILO}<div class="hdd hd-ui">
      ${phoneFrame({ pantalla: pantallaInicio() + hojaResena(), hora: '17:10' })}
      <div class="hdd-handys">${handysHtml(false)}</div>
      <div class="hdd10-logo">${handyLogo({ width: LOGO_W, split: true })}</div>
      ${titular({ texto: TEXTO10, tamano: TXT, ancho: 1296, alinear: conQr ? 'left' : 'center', className: 'hdd10-txt' })}
      ${conQr ? `<div class="hdd10-qr">${qr}</div>` : ''}
    </div>`);

  // ── teléfono: como lo deja la escena 9 (al centro, reseña completa)
  const { tel } = telefonoResena(D, s);
  gsap.set(tel, { x: TEL_CENTRO.x, y: TEL_CENTRO.y });

  // ── Handys: en su lugar de la fila, con el cuerpo corrido a los costados (entrarSaltando lo fija al armar)
  const caja = tipo => D.$(`.hdd-h[data-tipo="${tipo}"]`, s);
  const cuerpo = tipo => D.$('.hd-handy', caja(tipo));
  const JUNTA = { cano: 0.28, gota: 0.3, engranaje: 0.3, lamparita: 0.36, llave: 0.42 };
  const llegadas = TIPOS.map(tipo => {
    const at = T + JUNTA[tipo];
    return at + entrarSaltando(tl, cuerpo(tipo), { desdeX: corrimiento(tipo), hastaX: 0, saltos: 2, altura: 42 }, at);
  });

  // ── logo, texto y QR: medidos y ubicados en la zona de arriba
  const logoEl = D.$('.hdd10-logo', s);
  const LOGO_H = logoAlto(LOGO_W);
  const txt = D.$('.hdd10-txt', s);
  const palabras = D.$$('.hd-tit-palabra', txt);
  const anchoTxt = palabras[palabras.length - 1].offsetLeft + palabras[palabras.length - 1].offsetWidth - palabras[0].offsetLeft;
  const altoTxt = txt.offsetHeight;
  const qrEl = conQr ? D.$('.hdd10-qr', s) : null;
  if (!conQr) {
    // logo arriba y la línea abajo, todo centrado
    const GAP = 40, alto = LOGO_H + GAP + altoTxt;
    const y0 = Math.round((ZONA.y0 + ZONA.y1) / 2 - alto / 2) + 10;
    Object.assign(logoEl.style, { left: `${720 - LOGO_W / 2}px`, top: `${y0}px`, width: `${LOGO_W}px`, height: `${LOGO_H}px` });
    Object.assign(txt.style, { left: '72px', top: `${y0 + LOGO_H + GAP}px` });
  } else {
    // logo centrado arriba; abajo, la línea y la tarjeta del QR lado a lado, el par centrado
    const PAD = 16, CARD = qrLado + 2 * PAD, GAP_H = 44, GAP_V = 30;
    const anchoPar = anchoTxt + GAP_H + CARD;
    const x0 = Math.round(720 - anchoPar / 2);
    const alto = LOGO_H + GAP_V + CARD;
    const y0 = Math.round((ZONA.y0 + ZONA.y1) / 2 - alto / 2);
    const yPar = y0 + LOGO_H + GAP_V;
    Object.assign(logoEl.style, { left: `${720 - LOGO_W / 2}px`, top: `${y0}px`, width: `${LOGO_W}px`, height: `${LOGO_H}px` });
    Object.assign(txt.style, { left: `${x0}px`, top: `${Math.round(yPar + CARD / 2 - altoTxt / 2)}px`, width: `${Math.ceil(anchoTxt) + 4}px` });
    Object.assign(qrEl.style, { left: `${x0 + anchoPar - CARD}px`, top: `${yPar}px`, width: `${CARD}px`, height: `${CARD}px` });
    Object.assign(D.$('svg', qrEl).style, { left: `${PAD}px`, top: `${PAD}px` });
    gsap.set(qrEl, { opacity: 0, scale: 0.84, transformOrigin: '50% 50%' });
  }
  const letras = LETRAS.map(l => D.$(`.hd-logo-letra[data-letra="${l}"]`, logoEl));
  const bajada = D.$('.hd-logo-bajada', logoEl);
  LETRAS.forEach((l, i) => {
    const b = LOGO_INFO.letras[l];
    gsap.set(letras[i], { scale: 0, svgOrigin: `${b.x + b.w / 2} ${LOGO_INFO.lineaBase.palabra}` });
  });
  gsap.set(bajada, { opacity: 0, y: 34 });
  prepararTitular(txt);

  // ════════ tiempos
  const tLogo = T + 0.9;     // 85,9
  const tTxt = T + 1.75;     // 86,75
  const tQr = T + 2.25;      // 87,25
  const tSaludo = T + 2.5;   // 87,5
  const tAcorde = T + 3;     // 88,0
  const quieto = T + 4;      // 89,0: desde acá, nada se mueve

  D.show(s, T);

  // 85,0 · golpe: el teléfono se levanta apenas y cae
  tl.to(tel, { y: TEL_CENTRO.y - 16, duration: 0.18, ease: 'power2.out' }, T);
  tl.to(tel, { y: 1200, rotation: 4, duration: 0.55, ease: 'power3.in' }, T + 0.18);
  tl.set(tel, { autoAlpha: 0 }, T + 0.8);
  D.sfx('whoosh', T + 0.15, 0.6, 0.12);

  // 85,3 · los Handys se juntan a saltitos (un pique suave al llegar cada uno)
  llegadas.forEach((t, i) => D.sfx('plip', t - 0.39, 0.06, [330, 392, 440, 523, 587][i]));

  // 85,9 · el logo, letra por letra, y la bajada
  letras.forEach((el, i) => tl.to(el, { scale: 1, duration: 0.55, ease: 'back.out(2.2)' }, tLogo + i * 0.07));
  [HZ.C6, HZ.D6, HZ.E6, HZ.G6, HZ.C6 * 2].forEach((f, i) => D.sfx('bell', tLogo + i * 0.07, f, 0.03, 0.9));
  tl.to(bajada, { opacity: 1, y: 0, duration: 0.6, ease: 'expo.out' }, tLogo + 0.45);

  // 86,75 · "Mar del Plata · Llegamos el 28/10"
  entraTitular(tl, txt, tTxt, { dur: 0.8, stagger: 0.05 });
  D.sfx('whoosh', tTxt - 0.05, 0.45, 0.05);
  D.sfx('bell', tTxt + 0.25, HZ.G5, 0.04, 1.2);

  // 87,25 · el QR
  if (qrEl) {
    tl.to(qrEl, { opacity: 1, duration: 0.25, ease: 'power1.out' }, tQr);
    tl.to(qrEl, { scale: 1, duration: 0.6, ease: 'back.out(1.8)' }, tQr);
    D.sfx('fold', tQr, 0.1);
  }

  // 87,5 · saludo final: la lamparita saluda y brilla, el engranaje da una vuelta, la gota y la llave saltan, parpadeos
  const lamp = cuerpo('lamparita');
  const rayos = D.$('.hd-h-rayos', lamp);
  const finales = [];
  finales.push(tSaludo + saludo(tl, lamp, tSaludo, { lado: 'der', veces: 2 }));
  if (rayos) {
    const svgOrigin = rayos.getAttribute('data-origen') || '0 0';
    tl.to(rayos, { scale: 1.22, duration: 0.18, ease: 'power2.out', svgOrigin }, tSaludo + 0.1);
    tl.to(rayos, { scale: 1, duration: 0.55, ease: 'back.out(2.5)', svgOrigin }, tSaludo + 0.28);
  }
  finales.push(tSaludo + 0.1 + salto(tl, cuerpo('engranaje'), tSaludo + 0.1, { altura: 54, rot: 360 }));
  finales.push(tSaludo + 0.45 + salto(tl, cuerpo('gota'), tSaludo + 0.45, { altura: 30 }));
  finales.push(tSaludo + 0.3 + salto(tl, cuerpo('llave'), tSaludo + 0.3, { altura: 36 }));
  parpadeo(tl, cuerpo('cano'), tSaludo + 0.35);
  parpadeo(tl, cuerpo('gota'), tSaludo + 1.2);
  parpadeo(tl, cuerpo('llave'), tSaludo + 1.05);
  parpadeo(tl, cuerpo('cano'), tSaludo + 1.3);
  D.sfx('plip', tSaludo + 0.1, 0.05, 700);

  // 88,0 · acorde final (Do mayor abierto) que suena hasta el final
  [[HZ.C4, 0.05], [HZ.G4, 0.045], [HZ.C5, 0.045], [HZ.E5, 0.04], [HZ.C6, 0.03]].forEach(([f, v], i) => D.sfx('bell', tAcorde + i * 0.02, f, v, 3.2));

  const ultimo = Math.max(...finales, ...llegadas);
  if (ultimo > quieto) console.warn(`[escena 10] algo se mueve hasta las ${ultimo.toFixed(2)} s (quieto desde ${quieto} s)`);

  // sin salida: el cuadro de las 90,0 queda bajo los botones del final
  return o.dur;
});
