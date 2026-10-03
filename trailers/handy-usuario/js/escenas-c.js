/* HANDY · App de usuario — escenas 6 y 7 (grupo C).
     'hd-presupuestos'  escena 6 · presupuestos  46–60 s  (devuelve 14)  "El especialista pone su precio. Vos elegís."
     'hd-confirmacion'  escena 7 · confirmación  60–68 s  (devuelve 8)   "Precio final antes de confirmar."

   Escena 6 — presupuestos (la sección clave del pitch)
     46,0  golpe: en el teléfono, la fecha se va a la izquierda y entra el chat "Presupuestos · Plomería" (la fila del
           logo queda quieta, como una navegación de verdad). Titular a la izquierda: "El especialista pone su precio."
     46,8  aviso "Tu pedido llegó a especialistas verificados."
     47,5 · 49,0 · 50,5  llegan los presupuestos de Martín R., Lucía G. y Diego P. (un "ding" cada uno); la lista se
           desplaza con translateY para que el nuevo quede entero a la vista.
     51,5  anticipación: el teléfono se levanta apenas…
     52,0  …y cae; las tres tarjetas salen de él (en grande, ×1,2, rearmadas con los mismos datos) y se abren en abanico
           lado a lado, con los totales alineados. Las palabras del titular se reacomodan solas arriba al centro.
     53,0  pulso en las insignias Verificado · 53,5 pulso en los tres totales · 54,25 sube "Vos elegís."
     56,0  el dedo toca "Aceptar" en la de Martín R.: se eleva con el sello "Elegido" y las otras dos se apagan.
     57,5  las otras caen, sale el titular y vuelve el teléfono · 58,0 la elegida vuela a su lugar en el chat.
     59–60 el teléfono en su lugar con el chat: Martín R. elegido, las otras atenuadas (así arranca la escena 7).
   Escena 7 — confirmación
     60,0  golpe: del chat entra "Confirmá tu pedido" (los bloques suben en cascada). Titular: "Precio final antes de confirmar."
     61,0 · 61,5 · 62,0  a la izquierda se arma el desglose grande: Presupuesto $ 45.000 · + Tarifa Handy 5% $ 2.250 ·
           = Precio final $ 47.250 (golpe al total). Sin conteos: cada cifra es texto fijo que entra con transform/opacity.
     65,5  el dedo toca "Confirmar" · 66,0 tilde verde "¡Pedido confirmado!" con campana.
     66,6  salen el titular y el desglose: a las 68,0 queda solo el teléfono con el éxito (contrato con la escena 8).

   Contratos de los cortes: a las 46,0 el teléfono está en PHONE_XY con pantallaFecha() en su estado final (lo deja así la
   escena 5); a las 60,0 las dos copias de esta escena muestran el mismo chat; a las 68,0, pantallaConfirmar() con el éxito.
   Sangrado (src/handy/layout.ts): en una pantalla que no es 4:3 se ve el escenario más allá del cuadro. Lo que se va o
   llega "de afuera" por abajo (el teléfono que cae a las 52,0, las tarjetas que caen) suma afuera('y') a su distancia:
   sale y entra por el borde de la pantalla y no queda estacionado a la vista (el dedo lo resuelve ui/Finger.ts). En 4:3
   suma 0.
   Solo transform y opacity, todo en D.tl en tiempos absolutos desde T, estados iniciales con gsap.set. */
import { gsap } from 'gsap';
import { formatARS, priceWithFee, HANDY_FEE, SCREEN } from '../../../src/handy/tokens.ts';
import { phoneFrame, TELEFONO_EN_CASA } from '../../../src/handy/ui/PhoneFrame.ts';
import { titular, prepararTitular, entraTitular, saleTitular } from '../../../src/handy/ui/Headline.ts';
import { finger, prepararDedo, entrarDedo, tocar, salirDedo, centro } from '../../../src/handy/ui/Finger.ts';
import { chatPresupuesto } from '../../../src/handy/ui/ChatPresupuesto.ts';
import { pantallaFecha, pantallaConfirmar } from '../../../src/handy/pantallas/usuario.ts';
import { pantallaPresupuestos, PRESUPUESTOS, presupuestoProps } from '../../../src/handy/pantallas/usuario-chat.ts';
import { afuera } from '../../../src/handy/layout.ts';

/** el teléfono en su lugar de las escenas de app (x/y del transform de .hd-telefono) */
const TEL = TELEFONO_EN_CASA;
/** notas que no están en D.N (Hz) */
const HZ = { E6: 1318.51, G6: 1567.98, B5: 987.77 };

/* ── navegación dentro del teléfono ─────────────────────────────────────────────────────────────────────────────
   La pantalla nueva entra desde la derecha y la vieja se corre un 30 % a la izquierda (como en iOS). Las dos
   pantallas tienen la misma fila de logo y campana: cada fila se mueve al revés que su capa, así queda quieta. */
const filaLogo = capa => capa.querySelector('.hd-header-fila');

function prepararEmpuje(entra) {
  gsap.set(entra, { x: SCREEN.w });
  gsap.set(filaLogo(entra), { x: -SCREEN.w });
}

function empujar(tl, sale, entra, at, dur = 0.8) {
  const par = Math.round(SCREEN.w * 0.3);
  tl.to(entra, { x: 0, duration: dur, ease: 'expo.out' }, at);
  tl.to(filaLogo(entra), { x: 0, duration: dur, ease: 'expo.out' }, at);
  tl.to(sale, { x: -par, duration: dur, ease: 'expo.out' }, at);
  tl.to(filaLogo(sale), { x: par, duration: dur, ease: 'expo.out' }, at);
  return dur;
}

/** caja de `el` en coordenadas de `ref` (por layout: ignora los transforms) */
function caja(el, ref) {
  const c = centro(el, ref);
  return { x: c.x - el.offsetWidth / 2, y: c.y - el.offsetHeight / 2, w: el.offsetWidth, h: el.offsetHeight };
}

/** pulso de un elemento (sube y vuelve con rebote): dos tweens de scale */
function pulso(tl, el, at, { escala = 1.14, origen = '50% 50%' } = {}) {
  tl.set(el, { transformOrigin: origen }, at);
  tl.to(el, { scale: escala, duration: 0.16, ease: 'power2.out' }, at);
  tl.to(el, { scale: 1, duration: 0.45, ease: 'back.out(2.6)' }, at + 0.16);
}

/** apretar un botón de la interfaz en el momento del toque */
function apretar(tl, el, toque) {
  tl.to(el, { scale: 0.94, duration: 0.08, ease: 'power2.out' }, toque);
  tl.to(el, { scale: 1, duration: 0.35, ease: 'back.out(3)' }, toque + 0.14);
}

const ESTILO = `<style>
  .hdc { position: absolute; inset: 0; }
  .hdc6-v { white-space: nowrap; }
  .hdc6-carta { position: absolute; }
  .hdc6-aro { position: absolute; inset: -2px; border: 4px solid var(--hd-verde); border-radius: 23.6px; pointer-events: none; }
  .hdc7-cuenta { position: absolute; width: 620px; font-family: var(--hd-font); color: var(--hd-tinta); }
  .hdc7-fila, .hdc7-total { display: flex; align-items: baseline; justify-content: space-between; gap: 24px; }
  .hdc7-fila { padding: 6px 0; }
  .hdc7-et { font-size: 34px; font-weight: 600; line-height: 1.15; letter-spacing: -0.01em; color: var(--hd-tinta-suave); white-space: nowrap; }
  .hdc7-et b { font-weight: 800; color: var(--hd-azul-handy); }
  .hdc7-val { font-size: 42px; font-weight: 800; line-height: 1.1; letter-spacing: -0.02em; color: var(--hd-tinta);
    font-variant-numeric: tabular-nums; white-space: nowrap; }
  .hdc7-regla { height: 4px; margin: 16px 0 14px; border-radius: 2px; background: var(--hd-azul); transform-origin: 0 50%; }
  .hdc7-total { display: block; }
  .hdc7-total .hdc7-et { display: block; font-weight: 800; color: var(--hd-azul); }
  .hdc7-total .hdc7-val { display: block; margin-top: 10px; font-size: 124px; line-height: 1.02; letter-spacing: -0.035em;
    text-align: right; color: var(--hd-azul); transform-origin: 100% 75%; }
  .hdc7 .hd-desglose { position: relative; }
  .hdc7-resalte { position: absolute; left: 8px; right: 8px; border-radius: 10px; background: rgba(255, 255, 255, 0.2); pointer-events: none; }
</style>`;

/* ════════════════════════════════════════════════════════════════════════════════════════════════════════════════
   Escena 6 · presupuestos (46–60 s)
   ════════════════════════════════════════════════════════════════════════════════════════════════════════════════ */
/** escala de las tarjetas grandes de la comparación (408×476) y su fila centrada en el escenario */
const K = 1.2;
const CARTA_W = Math.round(340 * K);
const HUECO = 24;
const FILA_X0 = (1440 - (3 * CARTA_W + 2 * HUECO)) / 2;
const SLOT_X = [0, 1, 2].map(i => FILA_X0 + i * (CARTA_W + HUECO));
/** titular: "El especialista pone su precio." a la izquierda durante el chat; en la comparación sube entero (sin
    reacomodar palabras) y forma, con "Vos elegís." grande al lado, un bloque centrado arriba de las tarjetas */
const TIT_L = { x: 110, tamano: 76 };   // como los titulares de las escenas 4 y 5: 76 px, centrado en y 540
const TAM_V = 104;
const BLOQUE = { y: 176, hueco: 52 };
/** línea de base de la última línea de un titular (Inter, interlineado 1,06): desde el borde de arriba */
const baseTitular = (lineas, tamano) => (lineas - 1) * 1.06 * tamano + 0.8933 * tamano;

Trailer.recipe('hd-presupuestos', (D, T, o) => {
  const tl = D.tl;
  const s = D.scene('presupuestos', `${ESTILO}<div class="hdc hd-ui">
      ${phoneFrame({ pantalla: pantallaFecha() + pantallaPresupuestos() })}
      ${titular({ texto: 'El especialista pone su precio.', tamano: TIT_L.tamano, className: 'hdc6-l' })}
      ${titular({ texto: '*Vos elegís.*', tamano: TAM_V, ancho: 900, className: 'hdc6-v' })}
      ${PRESUPUESTOS.map(d => `<div class="hdc6-carta" data-id="${d.id}">`
        + chatPresupuesto(presupuestoProps(d, { escala: K })) + '<span class="hdc6-aro"></span></div>').join('')}
      ${finger()}
    </div>`);
  const raiz = D.$('.hdc', s);

  // ── teléfono: la fecha (como la deja la escena 5) y, encima, el chat de presupuestos fuera de cuadro a la derecha
  const tel = D.$('.hd-telefono', s);
  gsap.set(tel, { x: TEL.x, y: TEL.y });
  const fecha = D.$('[data-pantalla="fecha"]', tel);
  const pres = D.$('[data-pantalla="presupuestos"]', tel);
  prepararEmpuje(pres);
  const cuerpo = D.$('.hd-chat-cuerpo', pres);
  const lista = D.$('.hd-chat-lista', pres);
  const chip = D.$('.hd-chip-sistema', pres);
  const enTel = Object.fromEntries(PRESUPUESTOS.map(d => [d.id, D.$(`.hd-presu[data-id="${d.id}"]`, pres)]));
  const telCartas = PRESUPUESTOS.map(d => enTel[d.id]);
  gsap.set(chip, { opacity: 0, scale: 0.7 });
  gsap.set(telCartas, { opacity: 0, y: 46, scale: 0.94, transformOrigin: '0% 100%' });

  // desplazamiento de la lista para que la tarjeta nueva quede entera abajo de la ventana del chat
  const padAbajo = parseFloat(getComputedStyle(lista).paddingBottom) || 0;
  const scrollPara = el => Math.min(0, cuerpo.clientHeight - padAbajo - (el.offsetTop + el.offsetHeight));

  // ── titular: L a la izquierda durante el chat; en la comparación L sube entero y, con V ("Vos elegís.") a su
  //    derecha sobre la misma línea de base, queda un bloque centrado arriba de las tarjetas
  const L = D.$('.hdc6-l', s), V = D.$('.hdc6-v', s);
  const yL = Math.round(540 - L.offsetHeight / 2);
  Object.assign(L.style, { left: `${TIT_L.x}px`, top: `${yL}px` });
  const anchoTexto = el => {
    const b0 = D.box(el);
    return Math.max(...D.$$('.hd-tit-palabra', el).map(p => { const b = D.box(p); return b.x + b.w - b0.x; }));
  };
  const lineasL = Math.round(L.offsetHeight / (1.06 * TIT_L.tamano));
  const wL = anchoTexto(L), wV = anchoTexto(V);
  const x0 = Math.round((1440 - (wL + BLOQUE.hueco + wV)) / 2);
  const subeL = { x: x0 - TIT_L.x, y: BLOQUE.y - yL };
  const baseBloque = BLOQUE.y + baseTitular(lineasL, TIT_L.tamano);
  Object.assign(V.style, { left: `${x0 + wL + BLOQUE.hueco}px`, top: `${Math.round(baseBloque - baseTitular(1, TAM_V))}px` });
  prepararTitular(L);
  prepararTitular(V);

  // ── tarjetas grandes en fila debajo del titular; arrancan exactamente sobre la de Diego en el teléfono
  //    (la ×1,2 achicada 1/1,2 calza sobre la ×1)
  const SLOT_Y = Math.round(BLOQUE.y + L.offsetHeight + 56);
  const cartas = D.$$('.hdc6-carta', s);
  cartas.forEach((c, i) => Object.assign(c.style, { left: `${SLOT_X[i]}px`, top: `${SLOT_Y}px` }));
  const [cM, cL, cD] = cartas;
  const aros = cartas.map(c => D.$('.hdc6-aro', c));
  const sello = D.$('.hd-presu-sello', cM), pildora = D.$('.hd-presu-sello-pildora', cM);
  const aceptar = D.$('.hd-presu-btn[data-accion="aceptar"]', cM);
  const H6 = cM.offsetHeight;
  gsap.set(aros, { opacity: 0 });
  gsap.set(sello, { opacity: 0 });
  gsap.set(pildora, { scale: 0, transformOrigin: '50% 50%' });

  // ── dedo en el escenario (toca la tarjeta grande de Martín)
  const dedo = D.$('.hd-dedo', raiz);
  prepararDedo(dedo);

  // ════════ tiempos
  const tPush = T;             // 46,0 golpe
  const tTit = T + 0.5;        // 46,5
  const tChip = T + 0.8;       // 46,8
  const tLlega = [T + 1.5, T + 3, T + 4.5];   // 47,5 · 49,0 · 50,5
  const tAnticipa = T + 5.5;   // 51,5
  const tSubeTit = T + 5.6;    // 51,6
  const tSale = T + 6;         // 52,0
  const tSellos = T + 7;       // 53,0
  const tTotales = T + 7.5;    // 53,5
  const tElegis = T + 8.25;    // 54,25
  const tDedo = T + 8.75;      // 54,75
  const tToque = T + 10;       // 56,0
  const tVuelve = T + 11.6;    // 57,6
  const tTelVuelve = T + 12.2; // 58,2 (cuando las otras dos ya salieron de cuadro)
  const tVuela = T + 12.35;    // 58,35
  const tAterriza = T + 13.15; // 59,15

  D.show(s, T);

  // 46,0 · la fecha se va, entra el chat
  empujar(tl, fecha, pres, tPush);
  D.sfx('whoosh', tPush, 0.5, 0.1);

  // 46,5 · "El especialista pone su precio."
  entraTitular(tl, L, tTit);

  // 46,8 · aviso del sistema
  tl.to(chip, { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(2.2)' }, tChip);
  D.sfx('plip', tChip, 0.06, 1300);

  // 47,5 · 49,0 · 50,5 · llegan los tres presupuestos (ding ascendente: La – Do – Re)
  const dings = [D.N.A5, D.N.C6, D.N.D6];
  telCartas.forEach((c, i) => {
    const at = tLlega[i];
    const y = scrollPara(c);
    if (y < 0) tl.to(lista, { y, duration: 0.7, ease: 'power3.out' }, at - 0.05);
    tl.to(c, { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'expo.out' }, at);
    D.sfx('bell', at, dings[i], 0.085, 1.1);
  });
  const scrollFinal = scrollPara(enTel.diego);

  // 51,5 · anticipación: el teléfono se levanta apenas antes de caer
  const ALZA = -14;
  tl.to(tel, { y: TEL.y + ALZA, duration: 0.5, ease: 'power2.out' }, tAnticipa);

  // 52,0 · el teléfono cae y las tarjetas salen en abanico desde la de Diego
  const bD = caja(enTel.diego, tel);
  const origen = { x: TEL.x + bD.x, y: TEL.y + ALZA + bD.y + scrollFinal };
  cartas.forEach((c, i) => gsap.set(c, {
    x: origen.x - SLOT_X[i], y: origen.y - SLOT_Y, scale: 1 / K, transformOrigin: '0 0', autoAlpha: 0,
  }));
  tl.set(cartas, { autoAlpha: 1 }, tSale);
  tl.set(enTel.diego, { opacity: 0 }, tSale);
  tl.to(lista, { opacity: 0, duration: 0.2, ease: 'power1.out' }, tSale);
  // (cae más allá del borde de abajo de lo que se ve: ahí espera hasta las 58,2 sin asomar en el sangrado)
  tl.to(tel, { y: 1180 + afuera('y'), rotation: 3, duration: 0.55, ease: 'power3.in' }, tSale);
  D.sfx('whoosh', tSale, 0.7, 0.2);
  const desfase = [0.14, 0.07, 0];   // Martín sale último y viaja más lejos
  const giro = [-5, -3, 2.5];
  cartas.forEach((c, i) => {
    const t0 = tSale + desfase[i];
    tl.to(c, { x: 0, y: 0, scale: 1, duration: 0.85, ease: 'expo.out' }, t0);
    tl.to(c, { rotation: giro[i], duration: 0.3, ease: 'power2.out' }, t0);
    tl.to(c, { rotation: 0, duration: 0.7, ease: 'back.out(2)' }, t0 + 0.3);
    D.sfx('fold', t0 + 0.04, 0.1);
  });

  // 51,6 · el titular sube entero a su lugar arriba (antes de que las tarjetas crucen la columna izquierda)
  tl.to(L, { x: subeL.x, y: subeL.y, duration: 0.7, ease: 'expo.inOut' }, tSubeTit);

  // 53,0 · tres especialistas verificados · 53,5 · tres precios
  cartas.forEach((c, i) => {
    pulso(tl, D.$('.hd-verificado', c), tSellos + i * 0.15, { escala: 1.22, origen: '0% 50%' });
    D.sfx('tick', tSellos + i * 0.15, 0.035);
    pulso(tl, D.$('.hd-presu-total-valor', c), tTotales + i * 0.25, { escala: 1.14, origen: '100% 50%' });
  });
  D.sfx('bell', tTotales, D.N.A5, 0.04, 0.7);
  D.sfx('bell', tTotales + 0.25, D.N.C6, 0.04, 0.7);
  D.sfx('bell', tTotales + 0.5, HZ.E6, 0.04, 0.7);

  // 54,25 · "Vos elegís."
  entraTitular(tl, V, tElegis, { stagger: 0.09 });

  // 54,75 · el dedo entra y toca "Aceptar" en la de Martín (56,0)
  const pA = centro(aceptar, raiz);
  entrarDedo(tl, dedo, pA.x + 70, pA.y + 120, tDedo, { dur: 0.6 });
  const toque = tocar(tl, dedo, pA.x, pA.y, tToque - 0.55).toque;
  apretar(tl, aceptar, toque);
  D.sfx('key', toque, 0.22);
  salirDedo(tl, dedo, toque + 0.42);

  // 56,2 · elegido: sello, aro que se expande, se eleva; las otras se apagan
  const tSel = toque + 0.2;
  tl.to(sello, { opacity: 1, duration: 0.25, ease: 'power1.out' }, tSel);
  tl.to(pildora, { scale: 1, duration: 0.5, ease: 'back.out(2.4)' }, tSel + 0.05);
  tl.set(aros[0], { opacity: 0.9, scale: 1, transformOrigin: '50% 50%' }, tSel);
  tl.to(aros[0], { opacity: 0, scale: 1.07, duration: 0.7, ease: 'power2.out' }, tSel);
  const LEVANTA = 1.03;
  tl.to(cM, {
    x: -CARTA_W * (LEVANTA - 1) / 2, y: -22 - H6 * (LEVANTA - 1) / 2, scale: LEVANTA, duration: 0.5, ease: 'expo.out',
  }, tSel);
  tl.to([cL, cD], { opacity: 0.4, duration: 0.45, ease: 'power1.out' }, tSel + 0.05);
  D.sfx('bell', tSel, D.N.C6, 0.08, 1.4);
  D.sfx('bell', tSel + 0.07, HZ.G6, 0.05, 1.4);

  // mientras el teléfono está fuera de cuadro: la lista vuelve arriba, Martín vacío (llega volando), las otras atenuadas
  const tReset = tSale + 2;
  tl.set(lista, { y: 0, opacity: 1 }, tReset);
  tl.set(enTel.martin, { opacity: 0 }, tReset);
  tl.set([enTel.lucia, enTel.diego], { opacity: 0.45 }, tReset);
  tl.set(D.$('.hd-presu-sello', enTel.martin), { opacity: 1 }, tReset);
  tl.set(tel, { rotation: 0 }, tReset);

  // 57,35 · sale el titular y las otras dos caen (Diego primero: deja libre la columna del teléfono) · 57,95 vuelve el teléfono
  saleTitular(tl, L, tVuelve);
  saleTitular(tl, V, tVuelve + 0.08);
  tl.to(cD, { x: 50, y: 880 + afuera('y'), rotation: 11, duration: 0.5, ease: 'power3.in' }, tVuelve);
  tl.to(cL, { x: -40, y: 880 + afuera('y'), rotation: -9, duration: 0.5, ease: 'power3.in' }, tVuelve + 0.1);
  tl.set([cL, cD], { autoAlpha: 0 }, tVuelve + 0.65);
  D.sfx('whoosh', tVuelve, 0.6, 0.15);
  tl.to(tel, { y: TEL.y, duration: 0.85, ease: 'expo.out' }, tTelVuelve);

  // 58,0 · la elegida vuela a su lugar en el chat (×1,2 → ×1) y el teléfono la recibe
  const bMt = caja(enTel.martin, tel);
  const destino = { x: TEL.x + bMt.x - SLOT_X[0], y: TEL.y + bMt.y - SLOT_Y };
  tl.to(cM, { x: destino.x, scale: 1 / K, duration: 0.8, ease: 'power3.inOut' }, tVuela);
  tl.to(cM, { y: -110, duration: 0.4, ease: 'sine.out' }, tVuela);
  tl.to(cM, { y: destino.y, duration: 0.4, ease: 'sine.in' }, tVuela + 0.4);
  D.sfx('whoosh', tVuela, 0.6, 0.1);
  tl.set(cM, { autoAlpha: 0 }, tAterriza);
  tl.set(enTel.martin, { opacity: 1 }, tAterriza);
  tl.to(tel, { y: TEL.y + 7, duration: 0.1, ease: 'power2.out' }, tAterriza);
  tl.to(tel, { y: TEL.y, duration: 0.45, ease: 'back.out(2.5)' }, tAterriza + 0.1);
  D.sfx('plip', tAterriza, 0.1, 700);
  D.sfx('tick', tAterriza, 0.03);

  D.hide(s, T + o.dur);
  return o.dur;
});

/* ════════════════════════════════════════════════════════════════════════════════════════════════════════════════
   Escena 7 · confirmación (60–68 s)
   ════════════════════════════════════════════════════════════════════════════════════════════════════════════════ */
const TIT7 = { x: 110, tamano: 76, ancho: 660 };

Trailer.recipe('hd-confirmacion', (D, T, o) => {
  const tl = D.tl;
  const p = priceWithFee(45000);
  const pct = `${Math.round(HANDY_FEE * 100)}%`;
  const s = D.scene('confirmacion', `${ESTILO}<div class="hdc hdc7 hd-ui">
      ${phoneFrame({ pantalla: pantallaPresupuestos({ elegido: true }) + pantallaConfirmar() })}
      ${titular({ texto: 'Precio final antes de confirmar.', tamano: TIT7.tamano, ancho: TIT7.ancho, className: 'hdc7-tit' })}
      <div class="hdc7-cuenta">
        <div class="hdc7-fila" data-i="0"><span class="hdc7-et">Presupuesto</span><span class="hdc7-val">${formatARS(p.budget)}</span></div>
        <div class="hdc7-fila" data-i="1"><span class="hdc7-et"><b>+</b> Tarifa Handy ${pct}</span><span class="hdc7-val">${formatARS(p.fee)}</span></div>
        <div class="hdc7-regla"></div>
        <div class="hdc7-total"><div class="hdc7-et"><b>=</b> Precio final</div><div class="hdc7-val">${formatARS(p.total)}</div></div>
      </div>
    </div>`);
  const raiz = D.$('.hdc', s);

  // ── teléfono: el chat como lo deja la escena 6 y, encima, "Confirmá tu pedido" fuera de cuadro a la derecha
  const tel = D.$('.hd-telefono', s);
  gsap.set(tel, { x: TEL.x, y: TEL.y });
  const pres = D.$('[data-pantalla="presupuestos"]', tel);
  const conf = D.$('[data-pantalla="confirmar"]', tel);
  gsap.set([D.$('.hd-presu[data-id="lucia"]', pres), D.$('.hd-presu[data-id="diego"]', pres)], { opacity: 0.45 });
  prepararEmpuje(conf);
  const bloques = [...D.$$('.hd-bloque', conf), D.$('.hd-pie', conf)];
  gsap.set(bloques, { opacity: 0, y: 26 });
  const confirmar = D.$('.hd-boton[data-accion="confirmar"]', conf);
  const exito = D.$('.hd-exito', conf);
  const velo = D.$('.hd-velo', exito), tarjeta = D.$('.hd-exito-tarjeta', exito), check = D.$('.hd-exito-check', exito);
  const textosExito = [D.$('.hd-exito-titulo', exito), D.$('.hd-exito-detalle', exito)];
  gsap.set(velo, { opacity: 0 });
  gsap.set(tarjeta, { opacity: 0, scale: 0.86, y: 18, transformOrigin: '50% 50%' });
  gsap.set(check, { scale: 0, transformOrigin: '50% 50%' });
  gsap.set(textosExito, { opacity: 0, y: 12 });

  // franjas de resalte sobre las filas del desglose del teléfono: se encienden junto con cada línea del escenario
  const desglose = D.$('.hd-desglose', conf);
  const filasTel = [...D.$$('.hd-desglose-fila', desglose), D.$('.hd-desglose-total', desglose)];
  const resaltes = filasTel.map((f, i) => {
    const r = document.createElement('span');
    r.className = 'hdc7-resalte';
    const extra = i === filasTel.length - 1 ? 8 : 0; // el total lleva un filete arriba: la franja arranca debajo
    Object.assign(r.style, { top: `${f.offsetTop - 2 + extra}px`, height: `${f.offsetHeight + 4 - extra}px` });
    desglose.appendChild(r);
    return r;
  });
  gsap.set(resaltes, { opacity: 0 });

  // dedo dentro del teléfono (se mueve con él y no lo recorta la pantalla)
  tel.insertAdjacentHTML('beforeend', finger());
  const dedo = D.$('.hd-dedo', tel);
  prepararDedo(dedo);

  // ── titular y desglose grande a la izquierda, centrados en vertical como bloque
  const tit = D.$('.hdc7-tit', s), cuenta = D.$('.hdc7-cuenta', s);
  const hTit = tit.offsetHeight, hCuenta = cuenta.offsetHeight, aire = 64;
  const y0 = Math.round(530 - (hTit + aire + hCuenta) / 2);
  Object.assign(tit.style, { left: `${TIT7.x}px`, top: `${y0}px` });
  Object.assign(cuenta.style, { left: `${TIT7.x}px`, top: `${y0 + hTit + aire}px` });
  prepararTitular(tit);
  const filas = D.$$('.hdc7-fila', cuenta);
  const regla = D.$('.hdc7-regla', cuenta);
  const total = D.$('.hdc7-total', cuenta);
  const totalEt = D.$('.hdc7-et', total), totalVal = D.$('.hdc7-val', total);
  const partesFila = filas.map(f => [D.$('.hdc7-et', f), D.$('.hdc7-val', f)]);
  gsap.set(partesFila.flat(), { opacity: 0, x: -36 });
  gsap.set(regla, { scaleX: 0 });
  gsap.set(totalEt, { opacity: 0, x: -36 });
  gsap.set(totalVal, { opacity: 0, scale: 0.55 });

  // ════════ tiempos
  const tPush = T;            // 60,0 golpe
  const tTit = T + 0.3;       // 60,3
  const tFila = [T + 1, T + 1.5];  // 61,0 · 61,5
  const tRegla = T + 1.85;    // 61,85
  const tTotal = T + 2;       // 62,0 golpe al total
  const tDedo = T + 4.4;      // 64,4
  const tToque = T + 5.5;     // 65,5
  const tCheck = T + 6;       // 66,0
  const tSalida = T + 6.6;    // 66,6

  D.show(s, T);

  // 60,0 · entra "Confirmá tu pedido"; los bloques suben en cascada
  empujar(tl, pres, conf, tPush);
  D.sfx('whoosh', tPush, 0.5, 0.1);
  tl.to(bloques, { opacity: 1, y: 0, duration: 0.6, ease: 'expo.out', stagger: 0.08 }, tPush + 0.3);

  // 60,3 · "Precio final antes de confirmar."
  entraTitular(tl, tit, tTit);

  // 61,0 · 61,5 · las dos filas · 62,0 · el total grande, con golpe
  const resaltar = (r, at) => {
    tl.to(r, { opacity: 1, duration: 0.15, ease: 'power1.out' }, at);
    tl.to(r, { opacity: 0, duration: 0.7, ease: 'power1.inOut' }, at + 0.45);
  };
  partesFila.forEach(([et, val], i) => {
    tl.to(et, { opacity: 1, x: 0, duration: 0.6, ease: 'expo.out' }, tFila[i]);
    tl.to(val, { opacity: 1, x: 0, duration: 0.6, ease: 'expo.out' }, tFila[i] + 0.08);
    resaltar(resaltes[i], tFila[i]);
    D.sfx('key', tFila[i], 0.12);
  });
  resaltar(resaltes[2], tTotal);
  tl.to(regla, { scaleX: 1, duration: 0.5, ease: 'expo.out' }, tRegla);
  D.sfx('tick', tRegla, 0.03);
  tl.to(totalEt, { opacity: 1, x: 0, duration: 0.6, ease: 'expo.out' }, tTotal - 0.1);
  tl.to(totalVal, { opacity: 1, scale: 1, duration: 0.7, ease: 'back.out(1.7)' }, tTotal);
  D.sfx('kick', tTotal, 0.55);
  D.sfx('boom', tTotal, 0.12);
  D.sfx('bell', tTotal, D.N.C6, 0.07, 1.6);
  D.sfx('bell', tTotal + 0.04, D.N.A5, 0.05, 1.6);

  // 64,4 · el dedo entra y toca "Confirmar" (65,5)
  const pC = centro(confirmar, tel);
  entrarDedo(tl, dedo, pC.x + 50, pC.y + 70, tDedo, { dur: 0.6 });
  const toque = tocar(tl, dedo, pC.x, pC.y, tToque - 0.5, { viaje: 0.5 }).toque;
  apretar(tl, confirmar, toque);
  D.sfx('key', toque, 0.22);
  salirDedo(tl, dedo, toque + 0.4);

  // 65,6 · aparece el éxito: velo, tarjeta, tilde (66,0) con campana de confirmación
  tl.to(velo, { opacity: 1, duration: 0.35, ease: 'power1.out' }, toque + 0.1);
  tl.to(tarjeta, { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: 'back.out(1.6)' }, tCheck - 0.2);
  tl.to(check, { scale: 1, duration: 0.55, ease: 'back.out(2.4)' }, tCheck);
  tl.to(textosExito, { opacity: 1, y: 0, duration: 0.5, ease: 'expo.out', stagger: 0.08 }, tCheck + 0.1);
  [D.N.G5, HZ.B5, D.N.D6, HZ.G6].forEach((f, i) => D.sfx('bell', tCheck + i * 0.08, f, 0.07 - i * 0.008, 1.5));

  // 66,6 · salen el titular y el desglose: a las 68,0 queda solo el teléfono con el éxito
  saleTitular(tl, tit, tSalida);
  const piezas = [...partesFila.flat(), regla, totalEt, totalVal];
  tl.to(piezas, { opacity: 0, x: -48, duration: 0.4, ease: 'power3.in', stagger: 0.04 }, tSalida + 0.1);
  D.sfx('whoosh', tSalida + 0.1, 0.5, 0.06);

  D.hide(s, T + o.dur);
  return o.dur;
});
