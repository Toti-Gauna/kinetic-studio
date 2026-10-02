/* HANDY · App del especialista — escenas 8 y 9 (grupo D). Reemplazan a las provisorias de escenas-esp-base.js.
     'he-trabajo'  escena 8 · trabajo  (escrita 6 s → película 42,5–50)    "Todo queda en Handy."
     'he-cobro'    escena 9 · cobro    (escrita 2 s → película 50–52,5)    "Cobrás en tu CBU o alias."
   Escritas a 120 BPM (un tiempo = 0,5 s): js/trailer.js las corre por 'hdr-corte' LENTO = 1,25 veces más lentas. Abajo,
   cada tiempo va escrito → película (T + t·1,25). Todos los golpes y sonidos caen en corcheas o semicorcheas escritas.

   Escena 8 — trabajo (arranca del cuadro final de 'he-camino': el teléfono en PHONE_XY con pantallaEnCamino({ estado:
   'llego' }), encabezado azul y barra de estado clara a las 16:04)
     0,0  → 42,5    entra "Trabajo en curso" empujando al mapa desde la derecha (la barra de estado pasa a oscura, 16:12).
     0,25 → 42,81   el titular "Todo queda en Handy." (en dos líneas, columna izquierda centrada en y 540).
     0,5  → 43,13   el cronómetro corre en saltos, uno por tiempo: 00:00 → 06:40 → 13:25 → 20:10 → 27:45 → 35:00 → 42:15
                    (3,0 → 46,25); el punto de "En curso" late en cada tiempo.
     1,0  → 43,75   entra el detalle: Mano de obra $ 32.000 (1,25), Materiales $ 13.000 (1,5), Total $ 45.000 (1,75)
                    y golpe del total (2,0 → 45,0).
     3,0  → 46,25   el cronómetro llega a 42:15: late el panel; la hora salta a 16:54. Entra el dedo.
     3,5  → 46,88   toca "Terminar trabajo" (se aprieta).
     3,625→ 47,03   "¡Terminaste el trabajo!": la pantalla de fin se prende y sus piezas caen en cascada; 3,75 el Caño
                    asoma en el escenario celeste, 4,0 la Gota se forma en su pico y 4,25 cae a su lugar (4,5).
     4,5  → 48,13   "Ganaste" y los dígitos de $ 45.000, uno por semicorchea; la Gota y el Caño se agachan y saltan con
                    cara de festejo…
     5,0  → 48,75   …y caen en el golpe de "Ganaste $ 45.000" (el monto late, acorde de campanas). 5,25 la tarjeta "Cobrás
                    en tu CBU o alias", 5,375 "Volver al inicio" y sale el titular.
     6,0  → 50,0    cuadro final: pantallaFin() completa, los dos Handys quietos y felices (contrato con 'he-cobro').
   Escena 9 — cobro (arranca de ese cuadro; el golpe del resumen la tapa a las 52,5)
     0,0  → 50,0    titular "Cobrás en tu CBU o alias." (arriba en la columna izquierda) y baja la notificación "Te
                    transferimos $ 45.000 · a martin.r.plomero" (0,25 → 50,31: ding y la hora pasa a 17:10).
     0,5  → 50,63   velo y la reseña de Carla (pop); 0,75–1,25 las cinco estrellas, una por semicorchea (campanas que
                    suben); 1,0 el texto "¡Excelente! Rápido y prolijo.".
     1,0  → 51,25   los cinco Handys saltan a cuadro desde abajo, del centro hacia afuera en semicorcheas (abajo de la
                    columna izquierda: la fila de handys-grupo.png); 1,25 papelitos salen de atrás del teléfono; aterrizan
                    en 1,375–1,625 y dan un saltito de festejo (el engranaje con una vuelta).
     2,0  → 52,5    corte (lo tapa 'hdr-golpe').

   Contratos: entrada de la 8 = teléfono en PHONE_XY con pantallaEnCamino({ estado: 'llego' }), phoneFrame claro, hora
   HORAS.camino (16:04), sin titular. Salida de la 8 = entrada de la 9: teléfono en PHONE_XY, pantallaFin() con la Gota y
   el Caño parados en el escenario (handysFin), "Ganaste $ 45.000" completo, barra oscura a las HORAS.trabajo (16:54), sin
   titular.
   Reglas: solo transform y opacity; todo en D.tl en tiempos absolutos desde T; estados iniciales con gsap.set; azar
   solo con D.rand. Clases propias con prefijo hed- (hed8- / hed9-), estilos inyectados una vez (#he-escenas-esp-d). */
import { gsap } from 'gsap';
import { COLORS, SCREEN } from '../../../src/handy/tokens.ts';
import { PHONE, PHONE_XY } from '../../../src/handy/layout.ts';
import { phoneFrame } from '../../../src/handy/ui/PhoneFrame.ts';
import { titular, prepararTitular, entraTitular, saleTitular } from '../../../src/handy/ui/Headline.ts';
import { finger, prepararDedo, entrarDedo, tocar, salirDedo, centro } from '../../../src/handy/ui/Finger.ts';
import { ponerCrono, saltarCrono } from '../../../src/handy/ui/Cronometro.ts';
import { prepararEstrellas, llenarEstrellas } from '../../../src/handy/ui/StarRating.ts';
import { handy, anchoHandy, puntoGoteo, filaHandys } from '../../../src/handy/handys.ts';
import { humor, salto, festejo } from '../../../src/handy/handys-anim.ts';
import {
  pantallaEnCamino, pantallaTrabajo, pantallaFin, avisoCobro, resenaCliente,
  prepararMonto, escribirMonto, CRONO, HORAS, FIN_ESCENARIO,
} from '../../../src/handy/pantallas/especialista.ts';

/* ───────────────────────── estilos de las dos escenas ───────────────────────── */

const CSS = `
.hed { position: absolute; inset: 0; }
.hed .hd-titular { position: absolute; margin: 0; }
.hed .hd-tit-grupo { display: block; }
.hed-h { position: absolute; }
.hed9-confeti { position: absolute; inset: 0; pointer-events: none; }
.hed9-c { position: absolute; display: block; }
.hed9-c[data-forma="tira"] { width: 10px; height: 18px; margin: -9px 0 0 -5px; border-radius: 2px; background: currentColor; }
.hed9-c[data-forma="punto"] { width: 12px; height: 12px; margin: -6px 0 0 -6px; border-radius: 50%; background: currentColor; }
.hed9-c[data-forma="tri"] { width: 0; height: 0; margin: -7px 0 0 -8px; border-left: 8px solid transparent;
  border-right: 8px solid transparent; border-bottom: 14px solid currentColor; }
`;
if (!document.getElementById('he-escenas-esp-d')) {
  const st = document.createElement('style');
  st.id = 'he-escenas-esp-d';
  st.textContent = CSS;
  document.head.appendChild(st);
}

/* ───────────────────────── utilidades ───────────────────────── */

/** px con dos decimales para los style inline */
const px = n => `${Math.round(n * 100) / 100}px`;
/** notas (Hz) */
const HZ = { C4: 261.63, G4: 392, C5: 523.25, E5: 659.25, G5: 783.99, A5: 880, C6: 1046.5, D6: 1174.66, E6: 1318.51, G6: 1567.98 };
/** columna del titular (como en las escenas de app del tráiler de usuario: x 110, 76 px) */
const TIT = { x: 110, tamano: 76, ancho: 640 };

/** una barra de estado suelta (hora y tema propios), para cambiar la hora o el color de los íconos con opacity */
function barraEstado(hora, estado) {
  const t = document.createElement('div');
  t.innerHTML = phoneFrame({ pantalla: '', hora, estado });
  return t.querySelector('.hd-barra-estado');
}

/** cambio seco entre dos capas */
function cambiar(tl, sale, entra, at) {
  tl.set(sale, { opacity: 0 }, at);
  tl.set(entra, { opacity: 1 }, at);
}

/** apretar un botón de la interfaz en el momento del toque */
function apretar(tl, el, toque, escala = 0.94) {
  tl.to(el, { scale: escala, duration: 0.08, ease: 'power2.out' }, toque);
  tl.to(el, { scale: 1, duration: 0.35, ease: 'back.out(3)' }, toque + 0.14);
}

/** pulso: sube y vuelve con rebote */
function pulso(tl, el, at, { escala = 1.14, origen = '50% 50%', vuelta = 0.45 } = {}) {
  tl.set(el, { transformOrigin: origen }, at);
  tl.to(el, { scale: escala, duration: 0.12, ease: 'power2.out' }, at);
  tl.to(el, { scale: 1, duration: vuelta, ease: 'back.out(2.6)' }, at + 0.12);
}

/** cuánto tarda salto() (handys-anim.ts) de que arranca a que toca el piso: así su aterrizaje cae en un tiempo */
const hastaElPiso = altura => 0.12 + 1.9 * Math.min(0.55, Math.max(0.16, 0.3 * Math.sqrt(altura / 120)));

/* ── la Gota y el Caño adentro de la pantalla de fin ──────────────────────────────────────────────────────────────
   En coordenadas del escenario celeste (FIN_ESCENARIO: 370×344, piso en y 300). El Caño, a la derecha, con el pico
   hacia la izquierda; la Gota, parada en el piso a su izquierda, un poco corrida del pico (en la escena 8 se forma en el
   pico y cae en diagonal hasta su lugar, así no tapa la tuerca). */
const FIN = (() => {
  const altoCano = 230, altoGota = 150, piso = FIN_ESCENARIO.piso;
  const cano = { x: 166, y: piso - altoCano, w: anchoHandy('cano', altoCano), h: altoCano };
  const goteo = puntoGoteo(altoCano);
  const pico = { x: cano.x + goteo.x, y: cano.y + goteo.y };
  const wGota = anchoHandy('gota', altoGota);
  const gota = { x: 50, y: piso - altoGota, w: wGota, h: altoGota };
  return { cano, gota, pico };
})();

/** las cajas de la Gota y el Caño (la escena mueve la caja; los helpers animan el .hd-handy de adentro) */
function handysFin() {
  return ['gota', 'cano'].map(tipo => {
    const p = FIN[tipo];
    return `<div class="hed-h" data-tipo="${tipo}" style="left:${px(p.x)};top:${px(p.y)};width:${px(p.w)};height:${px(p.h)}">`
      + handy(tipo, { altura: p.h }) + '</div>';
  }).join('');
}

/** el teléfono de una escena: lo arma, lo pone en PHONE_XY y mete la Gota y el Caño en el escenario de pantallaFin */
function armarTelefono(D, s) {
  const tel = D.$('.hd-telefono', s);
  gsap.set(tel, { x: PHONE_XY.x, y: PHONE_XY.y });
  const fin = D.$('[data-pantalla="fin"]', tel);
  D.$('.hd-esp-fin-escenario', fin).insertAdjacentHTML('beforeend', handysFin());
  return { tel, pant: D.$('.hd-pantalla', tel), fin };
}

/** ubica un titular en la columna izquierda con su centro vertical en `cy` */
function ubicarTitular(el, cy) {
  Object.assign(el.style, { left: px(TIT.x), top: px(Math.round(cy - el.offsetHeight / 2)) });
  prepararTitular(el);
}

/* ════════════════════════════════════════════════════════════════════════════════════════════════════════════════
   Escena 8 · trabajo (escrita 6 s → 42,5–50)
   ════════════════════════════════════════════════════════════════════════════════════════════════════════════════ */
/** los saltos del cronómetro, uno por tiempo desde 0,5 (el último, 42:15, en 3,0) */
const SALTOS_CRONO = ['06:40', '13:25', '20:10', '27:45', '35:00', CRONO.final];

Trailer.recipe('he-trabajo', (D, T, o) => {
  const tl = D.tl;
  const s = D.scene('trabajo', `<div class="hed hd-ui">
      ${phoneFrame({ pantalla: pantallaEnCamino({ estado: 'llego' }) + pantallaTrabajo() + pantallaFin(), hora: HORAS.camino, estado: 'claro' })}
      ${titular({ texto: 'Todo queda|en Handy.', tamano: TIT.tamano, ancho: TIT.ancho, className: 'hed8-tit' })}
    </div>`);

  // ── teléfono: de abajo hacia arriba en camino (a la vista, como lo deja la escena 7) · trabajo (afuera, a la derecha)
  //    · fin (apagada)
  const { tel, pant, fin } = armarTelefono(D, s);
  const camino = D.$('[data-pantalla="en-camino"]', tel);
  const trabajo = D.$('[data-pantalla="trabajo"]', tel);
  gsap.set(trabajo, { x: SCREEN.w });
  gsap.set(fin, { autoAlpha: 0 });

  // barras de estado: a = la del marco (16:04, clara, sobre el azul) · b 16:12 y c 16:54 oscuras, sobre blanco
  const isla = D.$('.hd-isla', pant);
  const barras = { a: D.$('.hd-barra-estado', pant) };
  for (const [k, hora] of [['b', '16:12'], ['c', HORAS.trabajo]]) {
    barras[k] = barraEstado(hora, 'oscuro');
    pant.insertBefore(barras[k], isla);
    gsap.set(barras[k], { opacity: 0 });
  }

  // trabajo: cronómetro en 00:00, el detalle escondido, el punto de "En curso"
  const crono = D.$('.hd-crono', trabajo);
  ponerCrono(crono, CRONO.inicio);
  const panelCrono = D.$('.hd-esp-crono-panel', trabajo);
  const punto = D.$('.hd-esp-en-curso-punto', trabajo);
  const rotulo = D.$('.hd-esp-detalle-rotulo', trabajo);
  const desglose = D.$('.hd-desglose', trabajo);
  const filas = D.$$('.hd-desglose-fila', desglose);
  const total = D.$('.hd-desglose-total', desglose);
  const totalValor = D.$('.hd-desglose-total-valor', desglose);
  gsap.set([rotulo, desglose], { opacity: 0, y: 24 });
  gsap.set([...filas, total], { opacity: 0, x: -18 });
  const terminar = D.$('.hd-boton[data-accion="terminar"]', trabajo);

  // fin: piezas en cascada, monto escondido, Gota y Caño escondidos
  const finTitulo = D.$('.hd-esp-fin-titulo', fin);
  const escenario = D.$('.hd-esp-fin-escenario', fin);
  const ganaste = D.$('.hd-esp-fin-ganaste', fin);
  const monto = D.$('.hd-esp-monto[data-monto="ganaste"]', fin);
  const finDetalle = D.$('.hd-esp-fin-detalle', fin);
  const finCobro = D.$('.hd-esp-fin-cobro', fin);
  gsap.set(finTitulo, { opacity: 0, y: 18 });
  gsap.set(escenario, { scale: 0.92, transformOrigin: '50% 60%' });
  gsap.set([ganaste, finDetalle], { opacity: 0, y: 16 });
  const volver = D.$('.hd-boton[data-accion="volver"]', fin);
  gsap.set([finCobro, volver], { opacity: 0, y: 22 });
  prepararMonto(monto);
  const caja = tipo => D.$(`.hed-h[data-tipo="${tipo}"]`, fin);
  const cuerpo = tipo => D.$('.hd-handy', caja(tipo));
  gsap.set(caja('cano'), { scale: 0, transformOrigin: '50% 100%' });
  // la Gota arranca colgada del pico del Caño, sin tamaño: crece y cae hasta su lugar en el piso
  const gotaDx = FIN.pico.x - (FIN.gota.x + FIN.gota.w / 2), gotaDy = FIN.pico.y - FIN.gota.y;
  gsap.set(caja('gota'), { x: gotaDx, y: gotaDy, scale: 0, transformOrigin: '50% 0%' });

  // dedo dentro del teléfono
  tel.insertAdjacentHTML('beforeend', finger());
  const dedo = D.$('.hd-dedo', tel);
  prepararDedo(dedo);
  const pT = centro(terminar, tel);

  // titular en la columna izquierda, centrado en y 540
  const tit = D.$('.hed8-tit', s);
  ubicarTitular(tit, 540);

  // ════════ tiempos (escritos)
  const tTit = T + 0.25;
  const tCrono = T + 0.5;
  const tDetalle = T + 1;
  const tLlega = T + 3;       // 42:15
  const tToque = T + 3.5;
  const tFin = T + 3.625;
  const tCano = T + 3.75;
  const tGota = T + 4;
  const tGanaste = T + 4.5;
  const tGolpe = T + 5;
  const tSale = T + 5.375;

  D.show(s, T);

  // 0,0 · entra "Trabajo en curso" empujando al mapa (la barra de estado: de clara a oscura, 16:12)
  tl.to(trabajo, { x: 0, duration: 0.6, ease: 'expo.out' }, T);
  tl.to(camino, { x: -Math.round(SCREEN.w * 0.3), duration: 0.6, ease: 'expo.out' }, T);
  tl.to(barras.a, { opacity: 0, duration: 0.2, ease: 'power1.inOut' }, T + 0.05);
  tl.to(barras.b, { opacity: 1, duration: 0.2, ease: 'power1.inOut' }, T + 0.05);
  tl.set(camino, { autoAlpha: 0 }, T + 0.75);
  D.sfx('whoosh', T, 0.5, 0.09);

  // 0,25 · "Todo queda en Handy."
  entraTitular(tl, tit, tTit, { stagger: 0.07 });

  // 0,5 · el cronómetro corre en saltos secos, uno por tiempo (las tiras ruedan en una fusa; tic en cada uno); el punto
  //       de "En curso" late
  SALTOS_CRONO.forEach((v, i) => {
    const at = tCrono + i * 0.5;
    saltarCrono(tl, crono, v, at, { dur: 0.16, ease: 'power3.out' });
    D.sfx('tick', at, 0.045);
    D.sfx('tick', at + 0.125, 0.022);
  });
  for (let i = 0; i < 6; i++) {
    const at = tCrono + i * 0.5;
    tl.to(punto, { opacity: 0.2, duration: 0.1, ease: 'power1.in' }, at);
    tl.to(punto, { opacity: 1, duration: 0.3, ease: 'power1.out' }, at + 0.12);
  }

  // 1,0 · el detalle: el panel, Mano de obra (1,25), Materiales (1,5), Total (1,75) y su golpe (2,0)
  tl.to([rotulo, desglose], { opacity: 1, y: 0, duration: 0.5, ease: 'expo.out', stagger: 0.06 }, tDetalle);
  [...filas, total].forEach((f, i) => {
    const at = tDetalle + 0.25 * (i + 1);
    tl.to(f, { opacity: 1, duration: 0.2, ease: 'power1.out' }, at);
    tl.to(f, { x: 0, duration: 0.45, ease: 'expo.out' }, at);
  });
  D.sfx('plip', tDetalle + 0.25, 0.05, 660);
  D.sfx('plip', tDetalle + 0.5, 0.05, 784);
  pulso(tl, totalValor, tDetalle + 1, { escala: 1.18, origen: '100% 60%' });
  D.sfx('bell', tDetalle + 1, HZ.G5, 0.05, 1.1);
  D.sfx('bell', tDetalle + 1.125, HZ.C6, 0.04, 1.2);

  // 3,0 · 42:15: el panel late y la hora salta a las 16:54; entra el dedo
  pulso(tl, panelCrono, tLlega, { escala: 1.04 });
  cambiar(tl, barras.b, barras.c, tLlega);
  D.sfx('bell', tLlega, HZ.E6, 0.04, 0.9);
  entrarDedo(tl, dedo, pT.x + 40, pT.y + 60, tLlega - 0.05, { dur: 0.3 });

  // 3,5 · toca "Terminar trabajo"
  const toque = tocar(tl, dedo, pT.x, pT.y, tToque - 0.25, { viaje: 0.25 }).toque;
  apretar(tl, terminar, toque);
  D.sfx('key', toque, 0.2);
  salirDedo(tl, dedo, toque + 0.125, { dur: 0.35 });

  // 3,625 · "¡Terminaste el trabajo!": la pantalla de fin se prende y sus piezas caen en cascada
  tl.to(fin, { autoAlpha: 1, duration: 0.12, ease: 'power1.out' }, tFin);
  tl.to(escenario, { scale: 1, duration: 0.55, ease: 'back.out(1.8)' }, tFin);
  tl.to(finTitulo, { opacity: 1, y: 0, duration: 0.45, ease: 'expo.out' }, tFin + 0.125);
  D.sfx('whoosh', tFin, 0.3, 0.05);
  D.sfx('bell', tFin + 0.125, HZ.C6, 0.05, 1.2);
  D.sfx('bell', tFin + 0.125, HZ.G5, 0.035, 1.2);

  // 3,75 · el Caño asoma en el escenario
  tl.to(caja('cano'), { scale: 1, duration: 0.45, ease: 'back.out(2)' }, tCano);
  D.sfx('plip', tCano, 0.08, 392);
  // 4,0 · la Gota se forma en el pico… 4,25 y cae en diagonal hasta su lugar (toca el piso en 4,5: el agachón del
  //       festejo, que arranca enseguida, hace de aplastón)
  tl.to(caja('gota'), { scale: 0.5, duration: 0.25, ease: 'power2.out' }, tGota);
  tl.to(caja('gota'), { scale: 1, duration: 0.25, ease: 'power2.in' }, tGota + 0.25);
  tl.to(caja('gota'), { y: 0, duration: 0.25, ease: 'power2.in' }, tGota + 0.25);
  tl.to(caja('gota'), { x: 0, duration: 0.25, ease: 'power1.out' }, tGota + 0.25);
  D.sfx('plip', tGota + 0.5, 0.07, 660);

  // 4,5 · "Ganaste" y los dígitos, uno por semicorchea (fusa escrita: 0,0625)
  tl.to(ganaste, { opacity: 1, y: 0, duration: 0.4, ease: 'expo.out' }, tGanaste);
  escribirMonto(tl, monto, tGanaste, { paso: 0.0625 }).forEach((t, i) => { if (i % 2 === 0) D.sfx('key', t, 0.07); });
  // la Gota y el Caño se agachan y saltan con cara de festejo: caen en el golpe (5,0)
  const finales = [];
  const ALTO_FIESTA = { cano: 62, gota: 46 };
  ['cano', 'gota'].forEach(tipo => {
    const at = tGolpe - hastaElPiso(ALTO_FIESTA[tipo]) - 0.08;
    finales.push(at + festejo(tl, cuerpo(tipo), at, { saltos: 1, altura: ALTO_FIESTA[tipo] }));
  });
  D.sfx('whoosh', tGolpe - 0.5, 0.35, 0.04);

  // 5,0 · golpe: "Ganaste $ 45.000"
  pulso(tl, monto, tGolpe, { escala: 1.22, origen: '0% 60%', vuelta: 0.5 });
  tl.to(finDetalle, { opacity: 1, y: 0, duration: 0.4, ease: 'expo.out' }, tGolpe);
  [[HZ.C5, 0.045], [HZ.E5, 0.04], [HZ.G5, 0.04], [HZ.C6, 0.035]].forEach(([f, v]) => D.sfx('bell', tGolpe, f, v, 1.6));
  D.sfx('kick', tGolpe, 0.12);

  // 5,25 · la tarjeta del cobro y "Volver al inicio" (recién ahora: el dedo ya se fue, no parece que lo toca)
  //        · 5,375 sale el titular
  tl.to(finCobro, { opacity: 1, y: 0, duration: 0.45, ease: 'expo.out' }, tGolpe + 0.25);
  tl.to(volver, { opacity: 1, y: 0, duration: 0.45, ease: 'expo.out' }, tGolpe + 0.375);
  D.sfx('plip', tGolpe + 0.25, 0.05, 880);
  saleTitular(tl, tit, tSale);

  const ultimo = Math.max(...finales);
  if (ultimo > T + o.dur - 0.05) console.warn(`[he-trabajo] el festejo termina a las ${ultimo.toFixed(2)} (corte ${T + o.dur})`);

  D.hide(s, T + o.dur);
  return o.dur;
});

/* ════════════════════════════════════════════════════════════════════════════════════════════════════════════════
   Escena 9 · cobro (escrita 2 s → 50–52,5)
   ════════════════════════════════════════════════════════════════════════════════════════════════════════════════ */
/** los cinco Handys: la fila de handys-grupo.png abajo de la columna izquierda, centrada en COL_CX, pies en PISO9 */
const COL_CX = 455;
const PISO9 = 930;
const ALTO9 = (() => { const k = filaHandys(100).ancho / 100; return Math.min(330, Math.floor(650 / k)); })();
const FILA9 = filaHandys(ALTO9);
const POS9 = Object.fromEntries(FILA9.handys.map(h => [h.tipo, {
  x: COL_CX - FILA9.ancho / 2 + h.x, y: PISO9 - ALTO9 + h.y, w: h.ancho, h: h.altura,
}]));
const TIPOS9 = FILA9.handys.map(h => h.tipo);
/** cuándo salta cada uno (escrito, desde T): en semicorcheas, del centro hacia afuera */
const SALTA9 = { engranaje: 1, cano: 1.125, lamparita: 1.125, gota: 1.25, llave: 1.25 };
const N_PAPELITOS = 30;
const COLORES_PAPELITOS = [COLORS.azul, COLORS.azulHandy, COLORS.amarilloAlerta, COLORS.blanco, '#8EC5FF', COLORS.verde];
const FORMAS = ['tira', 'tira', 'punto', 'tri'];

Trailer.recipe('he-cobro', (D, T, o) => {
  const tl = D.tl;
  // papelitos: forma, color y trayectoria con el azar de la película
  const papelitos = Array.from({ length: N_PAPELITOS }, (_, i) => ({
    lado: i % 2 ? 1 : -1,
    forma: FORMAS[Math.floor(D.rand() * FORMAS.length)],
    color: COLORES_PAPELITOS[Math.floor(D.rand() * COLORES_PAPELITOS.length)],
    ang: D.rnd(30, 80),
    dist: D.rnd(150, 330),
    cae: D.rnd(420, 640),
    deriva: D.rnd(-80, 80),
    giro: D.rnd(240, 620) * (D.rand() < 0.5 ? -1 : 1),
    giro0: D.rnd(0, 360),
    t0: D.rnd(0, 0.06),
    flip: D.rnd(0.1, 0.16),
  }));
  // salen de atrás de las esquinas de arriba del teléfono
  const ORIGEN = { '-1': { x: PHONE_XY.x + 30, y: PHONE_XY.y + 170 }, '1': { x: PHONE_XY.x + PHONE.w - 30, y: PHONE_XY.y + 170 } };
  const s = D.scene('cobro', `<div class="hed hd-ui">
      <div class="hed9-handys">${TIPOS9.map(tipo => {
        const p = POS9[tipo];
        return `<div class="hed-h" data-tipo="${tipo}" style="left:${px(p.x)};top:${px(p.y)};width:${px(p.w)};height:${px(p.h)}">`
          + handy(tipo, { altura: p.h }) + '</div>';
      }).join('')}</div>
      <div class="hed9-confeti">${papelitos.map(p => {
        const o0 = ORIGEN[String(p.lado)];
        return `<i class="hed9-c" data-forma="${p.forma}" style="left:${px(o0.x)};top:${px(o0.y)};color:${p.color}"></i>`;
      }).join('')}</div>
      ${phoneFrame({ pantalla: pantallaFin() + resenaCliente() + avisoCobro(), hora: HORAS.trabajo })}
      ${titular({ texto: 'Cobrás en tu|CBU o alias.', tamano: TIT.tamano, ancho: TIT.ancho, className: 'hed9-tit' })}
    </div>`);

  // ── teléfono: la pantalla de fin como la deja la escena 8; encima la reseña (apagada) y arriba de todo la notificación
  //    (afuera, sobre el borde de arriba: el velo de la reseña no la oscurece)
  const { tel, pant } = armarTelefono(D, s);
  const cobro = D.$('[data-pantalla="cobro"]', tel);
  const aviso = D.$('.hd-esp-cobro', cobro);
  const montoCobro = D.$('.hd-esp-monto[data-monto="cobro"]', cobro);
  gsap.set(aviso, { y: -170, opacity: 0 });
  gsap.set(montoCobro, { transformOrigin: '0% 60%' });
  const resena = D.$('[data-pantalla="resena-cliente"]', tel);
  const velo = D.$('.hd-velo', resena);
  const tarjeta = D.$('.hd-esp-resena', resena);
  const estrellas = D.$('.hd-estrellas', tarjeta);
  const texto = D.$('.hd-esp-resena-texto', tarjeta);
  gsap.set(velo, { opacity: 0 });
  gsap.set(tarjeta, { opacity: 0, scale: 0.86, y: 30, transformOrigin: '50% 50%' });
  gsap.set(texto, { opacity: 0, y: 12 });
  prepararEstrellas(estrellas);

  // barra de estado: 16:54 (la del marco) → 17:10 con la notificación
  const isla = D.$('.hd-isla', pant);
  const barra0 = D.$('.hd-barra-estado', pant);
  const barra1 = barraEstado(HORAS.cobro, 'oscuro');
  pant.insertBefore(barra1, isla);
  gsap.set(barra1, { opacity: 0 });

  // ── Handys del escenario: escondidos debajo del cuadro
  const caja = tipo => D.$(`.hed9-handys .hed-h[data-tipo="${tipo}"]`, s);
  const cuerpo = tipo => D.$('.hd-handy', caja(tipo));
  TIPOS9.forEach(tipo => gsap.set(caja(tipo), { y: 1080 - POS9[tipo].y + 30 }));

  // ── papelitos: escondidos detrás del teléfono
  const conf = D.$$('.hed9-c', s);
  conf.forEach((el, i) => gsap.set(el, { x: 0, y: 0, rotation: papelitos[i].giro0, opacity: 0 }));

  // ── titular arriba en la columna izquierda (abajo van los Handys)
  const tit = D.$('.hed9-tit', s);
  const yFila = Math.min(...TIPOS9.map(t => POS9[t].y));
  ubicarTitular(tit, Math.round((90 + yFila - 40) / 2));

  // ════════ tiempos (escritos)
  const tAviso = T;
  const tResena = T + 0.5;
  const tEstrellas = T + 0.75;
  const tFiesta = T + 1.25;

  D.show(s, T);

  // 0,0 · titular y la notificación del cobro (0,25: ding; la hora pasa a 17:10; late el monto en 0,5)
  entraTitular(tl, tit, T, { stagger: 0.06 });
  tl.to(aviso, { opacity: 1, duration: 0.15, ease: 'power1.out' }, tAviso);
  tl.to(aviso, { y: 0, duration: 0.5, ease: 'back.out(1.4)' }, tAviso);
  D.sfx('whoosh', tAviso, 0.3, 0.06);
  D.sfx('bell', tAviso + 0.25, HZ.C6, 0.06, 1.2);
  D.sfx('bell', tAviso + 0.375, HZ.E6, 0.05, 1.3);
  cambiar(tl, barra0, barra1, tAviso + 0.25);
  pulso(tl, montoCobro, tAviso + 0.5, { escala: 1.22, origen: '0% 60%' });

  // 0,5 · la reseña de Carla: velo y la tarjeta (pop)
  tl.to(velo, { opacity: 1, duration: 0.3, ease: 'power1.out' }, tResena);
  tl.to(tarjeta, { opacity: 1, duration: 0.15, ease: 'power1.out' }, tResena);
  tl.to(tarjeta, { scale: 1, y: 0, duration: 0.5, ease: 'back.out(1.8)' }, tResena);
  D.sfx('fold', tResena, 0.1);

  // 0,75 · las cinco estrellas, una por semicorchea (campanas que suben) · 1,0 el texto
  llenarEstrellas(tl, estrellas, tEstrellas, { paso: 0.125 });
  [HZ.G5, HZ.A5, HZ.C6, HZ.D6, HZ.E6].forEach((f, i) => D.sfx('bell', tEstrellas + i * 0.125, f, 0.04 + i * 0.006, 1.2));
  tl.to(texto, { opacity: 1, y: 0, duration: 0.4, ease: 'expo.out' }, tEstrellas + 0.25);

  // 1,0 · los Handys saltan a cuadro (un "bloop" cada uno) y aterrizan en semicorcheas; al tocar el piso, festejan
  const notas = { engranaje: HZ.C5, cano: HZ.E5, lamparita: HZ.E5, gota: HZ.G5, llave: HZ.G5 };
  TIPOS9.forEach(tipo => {
    const at = T + SALTA9[tipo], c = caja(tipo), el = cuerpo(tipo);
    humor(tl, el, 'festejo', at, 0.1);
    tl.to(c, { y: -64, duration: 0.24, ease: 'power2.out' }, at);
    tl.to(c, { y: 0, duration: 0.135, ease: 'power2.in' }, at + 0.24);
    const piso = at + 0.375;
    tl.to(el, { scaleY: 0.82, scaleX: 1.14, duration: 0.06, ease: 'power2.out' }, piso);
    tl.to(el, { scaleY: 1, scaleX: 1, duration: 0.12, ease: 'power2.out' }, piso + 0.06);
    // rebote de festejo: un saltito con giro para el engranaje
    salto(tl, el, piso + 0.18, { altura: tipo === 'gota' ? 26 : 40, rot: tipo === 'engranaje' ? 360 : 0 });
  });
  [0, 0.125, 0.25].forEach((dt, i) => D.sfx('plip', T + 1 + dt, 0.07, [HZ.C5, HZ.E5, HZ.G5][i] / 2));
  D.sfx('kick', T + 1.375, 0.12);

  // 1,25 · papelitos: salen disparados desde atrás del teléfono, hacia afuera y arriba, y caen girando
  conf.forEach((el, i) => {
    const p = papelitos[i], a = (p.ang * Math.PI) / 180;
    const x1 = p.lado * Math.cos(a) * p.dist, y1 = -Math.sin(a) * p.dist;
    const t0 = tFiesta + p.t0, tCae = t0 + 0.3, dCae = 0.8;
    tl.set(el, { opacity: 1 }, t0);
    tl.to(el, { x: x1, y: y1, rotation: p.giro0 + p.giro * 0.35, duration: 0.3, ease: 'power2.out' }, t0);
    tl.to(el, { x: x1 + p.deriva, y: y1 + p.cae, rotation: p.giro0 + p.giro, duration: dCae, ease: 'power1.in' }, tCae);
    tl.to(el, { scaleX: -1, duration: p.flip, ease: 'sine.inOut', repeat: Math.floor(dCae / p.flip) - 1, yoyo: true }, tCae);
  });
  D.sfx('clap', tFiesta, 0.16);
  D.sfx('bubbles', tFiesta, 7, 0.035);

  D.hide(s, T + o.dur);
  return o.dur;
});
