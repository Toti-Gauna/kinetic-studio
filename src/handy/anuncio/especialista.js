/* HANDY · Anuncios — 'ha-especialista' (película 16–24, dur 8): el lado del que sabe. Arranca en el DROP de la música.
   La misma receta arma los dos anuncios: todo sale de formato(D) (teléfono con telXY, caja del titular, zona segura).

   Guion (r = segundos desde T; película = 16 + r). Acordes: 16 C · 18 G · 20 Am · 22 F (las campanas van con ellos).
     0      DROP: destello amarillo y un golpe de escala de toda la escena. El teléfono ya está en su lugar con el inicio
            del especialista (Trabajando prendido): sale un anillo de pulso desde Martín y la ficha "Trabajando" late.
     0,125  salta la ficha "Si sabés" (arriba del titular).
     0,25   "Te llegan pedidos cerca."
     0,5    ding-dong: salta el pin de la casa de Carla · 0,625 sube la tarjeta del pedido (Plomería · Jue 15 oct · 16:00)
            y sus filas entran de a una (semicorcheas).
     1,5    entra el dedo · 2,125 toca "Mandar presupuesto" · 2,25 sale el titular.
     2,5    sube la hoja "Tu presupuesto" · "Vos ponés el precio."
     2,625  Mano de obra $ 32.000, un dígito por semicorchea (calculadora) · 3,25 Materiales $ 13.000, de corrido.
     3,625  Total $ 45.000: golpe; del total sale la LUPA (una tarjeta grande, legible en el celular) con el total
            · 3,875 "Comisión Handy 10 % · recibís $ 40.500" (se marca con el resaltador amarillo).
     4,75   la lupa vuelve al total, sale el titular y la hoja baja.
     5,0    cae el aviso "¡Te eligieron!" de Carla M. · 5,125 el titular "¡Te eligieron!" · 5,25 el sello y los papelitos.
     6,0    golpe al total del aviso · 6,5 late el avatar de Carla. Desde ≈ 7 el aviso queda quieto hasta el corte (24: el
            golpe "Para el que necesita." barre por encima); de 6,5 a 8 un empuje lento de cámara (escala 1 → 1,03).
   Reglas: solo transform y opacity; todo en D.tl en tiempos absolutos desde T; estados iniciales con gsap.set; sin
   from/fromTo; azar solo con D.rand / D.rnd; devuelve exactamente o.dur. Clases propias con prefijo ha-e-. */
import { gsap } from 'gsap';
import { COLORS, formatARS } from '../tokens.ts';
import { icon } from '../icons.ts';
import { phoneFrame } from '../ui/PhoneFrame.ts';
import { finger, prepararDedo, entrarDedo, tocar, salirDedo, centro } from '../ui/Finger.ts';
import { titular, prepararTitular, entraTitular, saleTitular } from '../ui/Headline.ts';
import {
  pantallaInicioEsp, tarjetaPedido, hojaPresupuesto, avisoElegido, prepararMonto, escribirMonto, prepararPulso, pulsar,
  PRESUPUESTO, HORAS,
} from '../pantallas/especialista.ts';
import { formato, telXY } from './formato.js';

/* ───────────── estilos (una sola vez) ───────────── */

const CSS = `
.ha-e { position: absolute; inset: 0; }
.ha-e .hd-titular { margin: 0; white-space: nowrap; }
.ha-e .hd-tit-grupo { display: block; width: fit-content; }
.ha-e-tit[data-alinear="center"] .hd-tit-grupo { margin-inline: auto; }
.ha-e-ficha { position: absolute; left: 0; top: 0; display: flex; align-items: center; gap: 0.36em; padding: 0 0.85em 0 0.7em;
  border-radius: 999px; background: ${COLORS.amarillo}; color: ${COLORS.azul}; font: 800 var(--ha-e-ficha, 38px)/1 var(--hd-font, Inter);
  letter-spacing: -0.01em; white-space: nowrap; box-shadow: 0 12px 26px -14px rgba(16, 30, 64, 0.55), inset 0 0 0 3px rgba(31, 87, 168, 0.14);
  will-change: transform; }
.ha-e-ficha svg { display: block; flex: none; width: 1.05em; height: 1.05em; }
.ha-e-lupa { position: absolute; left: 0; top: 0; box-sizing: border-box; padding: 0.7em 0.95em 0.8em; border-radius: 0.9em;
  background: #FFFFFF; color: ${COLORS.tinta}; font: 800 var(--ha-e-lupa, 40px)/1.1 var(--hd-font, Inter);
  box-shadow: 0 34px 60px -26px rgba(16, 30, 64, 0.6), 0 0 0 4px rgba(31, 87, 168, 0.12); will-change: transform; }
.ha-e-lupa-fila { display: flex; align-items: baseline; justify-content: space-between; gap: 0.6em; }
.ha-e-lupa-etiqueta { font-size: 1em; }
.ha-e-lupa-total { font-size: 1.75em; letter-spacing: -0.02em; color: ${COLORS.azul}; transform-origin: 100% 60%; }
.ha-e-lupa-recibis { position: relative; margin-top: 0.42em; font-weight: 700; font-size: 0.74em; color: #3D3D3D; white-space: nowrap; }
.ha-e-lupa-recibis b { font-weight: 900; color: ${COLORS.azul}; }
.ha-e-lupa-resalta { position: absolute; left: -0.3em; right: -0.3em; top: 0.02em; bottom: -0.08em; border-radius: 0.3em;
  background: ${COLORS.amarillo}; transform-origin: 0 50%; z-index: -1; }
.ha-e-lupa-recibis span { position: relative; }
.ha-e-confeti { position: absolute; inset: 0; pointer-events: none; }
.ha-e-c { position: absolute; display: block; will-change: transform; }
.ha-e-c[data-forma="tira"] { width: 15px; height: 28px; margin: -14px 0 0 -7.5px; border-radius: 2px; background: currentColor; }
.ha-e-c[data-forma="punto"] { width: 18px; height: 18px; margin: -9px 0 0 -9px; border-radius: 50%; background: currentColor; }
.ha-e-c[data-forma="tri"] { width: 0; height: 0; margin: -11px 0 0 -12px; border-left: 12px solid transparent;
  border-right: 12px solid transparent; border-bottom: 22px solid currentColor; }
`;
if (!document.getElementById('ha-e-estilos')) {
  const st = document.createElement('style');
  st.id = 'ha-e-estilos';
  st.textContent = CSS;
  document.head.appendChild(st);
}

/* ───────────── utilidades ───────────── */

/** frecuencias (Hz) de las campanas: Do mayor, para ir con C – G – Am – F */
const HZ = { F5: 698.46, G5: 783.99, A5: 880, B5: 987.77, C6: 1046.5, D6: 1174.66, E6: 1318.51, F6: 1396.91, G6: 1567.98, A6: 1760 };
/** titulares a la velocidad de los anuncios */
const ENTRA = { dur: 0.4, stagger: 0.03 };
const SALE = { dur: 0.22, stagger: 0.015 };

/** Aprieta un elemento de la interfaz (escala y vuelve con rebote). */
function apretar(tl, el, at, escala = 0.94) {
  tl.to(el, { scale: escala, duration: 0.05, ease: 'power2.out' }, at);
  tl.to(el, { scale: 1, duration: 0.25, ease: 'back.out(3)' }, at + 0.07);
}

/** "Mirá acá": crece un poco y vuelve rebotando. */
function latido(tl, el, at, escala = 1.15, origen = '50% 50%') {
  tl.set(el, { transformOrigin: origen }, at);
  tl.to(el, { scale: escala, duration: 0.08, ease: 'power2.out' }, at);
  tl.to(el, { scale: 1, duration: 0.35, ease: 'elastic.out(1, 0.45)' }, at + 0.08);
}

/** El titular de la escena: agrega el div, achica el cuerpo si una línea no entra en el ancho y lo deja escondido. */
function ponerTitular(cont, L, texto, k = 1) {
  const { tamano, ancho, alinear } = L.titular;
  cont.insertAdjacentHTML('beforeend', titular({ texto, tamano: Math.round(tamano * k), ancho, alinear, className: 'ha-e-tit' }));
  const el = cont.lastElementChild;
  el.dataset.alinear = alinear;
  const mas = Math.max(...Array.from(el.querySelectorAll('.hd-tit-grupo')).map(g => g.offsetWidth));
  if (mas > ancho) el.style.fontSize = ((tamano * k * ancho) / mas).toFixed(1) + 'px';
  el.style.left = L.titular.x + 'px';
  prepararTitular(el);
  return el;
}

/* ───────────── la receta ───────────── */

Trailer.recipe('ha-especialista', (D, T, o) => {
  const tl = D.tl;
  const L = formato(D);
  const P = telXY(L);
  const esc = P.scale;

  // ── papelitos: forma, color y trayectoria con el azar de la película (salen del sello del aviso)
  const FORMAS = ['tira', 'tira', 'punto', 'tri'];
  const COLORES = [COLORS.azul, COLORS.azulHandy, COLORS.amarilloAlerta, COLORS.amarillo, COLORS.blanco, '#8EC5FF'];
  const papelitos = Array.from({ length: 48 }, (_, i) => {
    const lado = i % 2 ? 1 : -1;
    return {
      lado,
      forma: FORMAS[Math.floor(D.rand() * FORMAS.length)],
      color: COLORES[Math.floor(D.rand() * COLORES.length)],
      ang: D.rnd(18, 82),
      // en horizontal, del lado del titular (izquierda) viajan menos; en vertical, se abren a los dos lados por igual
      dist: (lado < 0 && !L.vertical ? D.rnd(180, 300) : D.rnd(220, 460)) * Math.max(1, esc),
      cae: D.rnd(420, 640) * Math.max(1, esc),
      deriva: D.rnd(-70, 70),
      giro: D.rnd(240, 620) * (D.rand() < 0.5 ? -1 : 1),
      giro0: D.rnd(0, 360),
      t0: D.rnd(0, 0.06),
      flip: D.rnd(0.1, 0.16),
    };
  });

  const s = D.scene('especialista', '<div class="ha-e hd-ui"></div>');
  const raiz = s.querySelector('.ha-e');

  // ── el teléfono: inicio prendido · pedido · hoja del presupuesto · aviso "¡Te eligieron!" (de abajo hacia arriba)
  raiz.insertAdjacentHTML('beforeend', phoneFrame({
    pantalla: pantallaInicioEsp({ trabajando: true }) + tarjetaPedido() + hojaPresupuesto({ enviado: false }) + avisoElegido(),
    hora: HORAS.pedido,
  }));
  const tel = raiz.querySelector('.hd-telefono');
  gsap.set(tel, { x: P.x, y: P.y, scale: esc, transformOrigin: '0 0' });
  tel.insertAdjacentHTML('beforeend', finger());
  const dedo = tel.querySelector('.hd-dedo');
  prepararDedo(dedo);
  /** punto del teléfono (coordenadas de su layout, con el marco) → escenario */
  const aEscenario = p => ({ x: P.x + p.x * esc, y: P.y + p.y * esc });

  const inicio = tel.querySelector('[data-pantalla="inicio-esp"]');
  const trabajando = inicio.querySelector('.hd-esp-trabajando');
  const yo = inicio.querySelector('.hd-esp-yo');
  const capaPedido = tel.querySelector('[data-pantalla="pedido"]');
  const pin = capaPedido.querySelector('.hd-esp-pedido-pin');
  const tarjeta = capaPedido.querySelector('.hd-esp-pedido');
  const rubroIcono = tarjeta.querySelector('.hd-esp-rubro-icono');
  const filas = Array.from(tarjeta.querySelectorAll('.hd-esp-fila'));
  const mandar = tarjeta.querySelector('.hd-boton[data-accion="mandar-presupuesto"]');
  const ahoraNo = tarjeta.querySelector('.hd-boton[data-accion="ahora-no"]');
  const capaPresu = tel.querySelector('[data-pantalla="presupuesto"]');
  const veloHoja = capaPresu.querySelector('.hd-velo');
  const hoja = capaPresu.querySelector('.hd-hoja');
  const campo = c => capaPresu.querySelector(`.hd-esp-campo[data-campo="${c}"]`);
  const montoMano = campo('mano-de-obra').querySelector('.hd-esp-monto');
  const montoMat = campo('materiales').querySelector('.hd-esp-monto');
  const cursorMano = campo('mano-de-obra').querySelector('.hd-esp-cursor');
  const cursorMat = campo('materiales').querySelector('.hd-esp-cursor');
  const total = capaPresu.querySelector('.hd-esp-total');
  const montoTotal = total.querySelector('.hd-esp-monto');
  const carsTotal = Array.from(montoTotal.querySelectorAll('.hd-esp-car'));
  const recibis = capaPresu.querySelector('.hd-esp-recibis');
  const enviado = capaPresu.querySelector('.hd-esp-enviado');
  const capaAviso = tel.querySelector('[data-pantalla="elegido"]');
  const veloAviso = capaAviso.querySelector('.hd-velo');
  const aviso = capaAviso.querySelector('.hd-esp-aviso');
  const sello = aviso.querySelector('.hd-esp-aviso-sello');
  const cliente = aviso.querySelector('.hd-esp-aviso-cliente');
  const avatarCarla = cliente.querySelector('.hd-avatar');
  const filasAviso = Array.from(aviso.querySelectorAll('.hd-esp-fila'));
  const totalAviso = aviso.querySelector('.hd-esp-aviso-total');
  const montoAviso = totalAviso.querySelector('.hd-esp-monto');
  const piezasAviso = [cliente, ...filasAviso, totalAviso];
  const pMandar = centro(mandar, tel);
  const pTotal = aEscenario(centro(total, tel));
  const pSello = aEscenario(centro(sello, tel));

  // ── la ficha "Si sabés" y los tres titulares
  const fichaPx = L.vertical ? 44 : 36;
  raiz.insertAdjacentHTML('beforeend',
    `<div class="ha-e-ficha" style="--ha-e-ficha:${fichaPx}px;height:${Math.round(fichaPx * 1.9)}px">${icon('herramienta', { size: 24, stroke: 2.4 })}<span>Si sabés</span></div>`);
  const ficha = raiz.lastElementChild;
  const tit1 = ponerTitular(raiz, L, 'Te llegan|pedidos *cerca.*');
  const tit2 = ponerTitular(raiz, L, 'Vos ponés|*el precio.*');
  const tit3 = ponerTitular(raiz, L, L.vertical ? '¡Te *eligieron!*' : '¡Te|*eligieron!*', 1.18);
  const tits = [tit1, tit2, tit3];
  // bloque ficha + titular: en vertical, arriba del teléfono desde titular.y; en horizontal, centrado en titular.y
  const gap = Math.round(fichaPx * 0.75);
  const fichaH = ficha.offsetHeight, fichaW = ficha.offsetWidth;
  const altoMax = Math.max(...tits.map(t => t.offsetHeight));
  const arriba = L.vertical ? L.titular.y : Math.round(L.titular.y - (fichaH + gap + altoMax) / 2);
  const fichaX = L.titular.alinear === 'center' ? Math.round(L.titular.x + (L.titular.ancho - fichaW) / 2) : L.titular.x;
  gsap.set(ficha, { x: fichaX, y: arriba });
  tits.forEach(t => { t.style.top = `${arriba + fichaH + gap}px`; });

  // ── la lupa: el total y lo que recibe, grande, sobre el teléfono (en el celular la hoja se lee chiquita)
  const lupaPx = 46;
  raiz.insertAdjacentHTML('beforeend', `<div class="ha-e-lupa" style="--ha-e-lupa:${lupaPx}px">`
    + `<div class="ha-e-lupa-fila"><span class="ha-e-lupa-etiqueta">Total</span><span class="ha-e-lupa-total">${formatARS(PRESUPUESTO.total)}</span></div>`
    + `<div class="ha-e-lupa-recibis"><i class="ha-e-lupa-resalta"></i><span>Comisión Handy ${PRESUPUESTO.porcentaje} · recibís <b>${formatARS(PRESUPUESTO.neto)}</b></span></div>`
    + '</div>');
  const lupa = raiz.lastElementChild;
  const lupaTotal = lupa.querySelector('.ha-e-lupa-total');
  const lupaRecibis = lupa.querySelector('.ha-e-lupa-recibis');
  const resalta = lupa.querySelector('.ha-e-lupa-resalta');
  const lupaW = lupa.offsetWidth, lupaH = lupa.offsetHeight;
  // centrada en el teléfono, a la altura del total (sin pasarse de la zona segura de abajo)
  const lupaC = { x: L.tel.cx, y: Math.min(pTotal.y - 10, L.seguro.abajo - lupaH / 2 - 20) };
  const lupaXY = { x: Math.round(lupaC.x - lupaW / 2), y: Math.round(lupaC.y - lupaH / 2) };

  // ── papelitos, escondidos detrás del sello
  raiz.insertAdjacentHTML('beforeend', `<div class="ha-e-confeti">${papelitos.map(p =>
    `<i class="ha-e-c" data-forma="${p.forma}" style="left:${pSello.x.toFixed(1)}px;top:${pSello.y.toFixed(1)}px;color:${p.color}"></i>`).join('')}</div>`);
  const conf = Array.from(raiz.querySelectorAll('.ha-e-c'));

  // ── estados iniciales
  gsap.set(s, { transformOrigin: `${L.CX}px ${L.CY}px` });
  prepararPulso(inicio);
  gsap.set(ficha, { scale: 0, opacity: 0, transformOrigin: L.titular.alinear === 'center' ? '50% 50%' : '0% 50%' });
  gsap.set(pin, { scale: 0, transformOrigin: '50% 100%' });
  gsap.set(tarjeta, { y: 520 });
  gsap.set([...filas, mandar, ahoraNo], { opacity: 0, y: 18 });
  gsap.set(veloHoja, { opacity: 0 });
  gsap.set(hoja, { yPercent: 100 });
  [montoMano, montoMat].forEach(prepararMonto);
  gsap.set(carsTotal, { opacity: 0, y: 14 });
  gsap.set([cursorMano, cursorMat], { opacity: 0 });
  gsap.set(recibis, { opacity: 0, y: 10 });
  gsap.set(enviado, { opacity: 0 });
  gsap.set(lupa, { x: pTotal.x - lupaW / 2, y: pTotal.y - lupaH / 2, scale: 0.3, opacity: 0, transformOrigin: '50% 50%' });
  gsap.set(lupaRecibis, { opacity: 0, y: 14 });
  gsap.set(resalta, { scaleX: 0 });
  gsap.set(veloAviso, { opacity: 0 });
  gsap.set(aviso, { opacity: 0, scale: 1.45, transformOrigin: '50% 50%' });
  gsap.set(sello, { scale: 0, rotation: -40, transformOrigin: '50% 50%' });
  gsap.set(piezasAviso, { opacity: 0, y: 18 });
  conf.forEach((el, i) => gsap.set(el, { x: 0, y: 0, rotation: papelitos[i].giro0, opacity: 0 }));

  D.show(s, T);

  // ════════ 0 → 16,0 · DROP: destello amarillo + golpe de escala; el mapa late
  D.flash(T, 1, 0.5, COLORS.amarillo);
  tl.set(s, { scale: 1.09 }, T);
  tl.to(s, { scale: 1, duration: 0.45, ease: 'expo.out' }, T);
  pulsar(tl, inicio, T + 0.125, { dur: 1.125, paso: 0.375 });
  latido(tl, trabajando, T + 0.125, 1.08);
  latido(tl, yo, T + 0.25, 1.25);
  D.sfx('whoosh', T, 0.4, 0.08);

  // 0,125 · la ficha "Si sabés" · 0,25 "Te llegan pedidos cerca."
  tl.to(ficha, { opacity: 1, duration: 0.1, ease: 'power1.out' }, T + 0.125);
  tl.to(ficha, { scale: 1, duration: 0.45, ease: 'back.out(2.6)' }, T + 0.125);
  D.sfx('plip', T + 0.125, 0.06, 880);
  D.sfx('bell', T + 0.125, HZ.G6, 0.04, 1.2);
  entraTitular(tl, tit1, T + 0.25, ENTRA);

  // ════════ 0,5 → 16,5 · llega el pedido: ding-dong, el pin de la casa y la tarjeta que sube
  const tPedido = T + 0.5;
  D.sfx('bell', tPedido, HZ.G6, 0.08, 1.2);
  D.sfx('bell', tPedido + 0.125, HZ.E6, 0.08, 1.4);
  tl.to(pin, { scale: 1, duration: 0.35, ease: 'back.out(2.8)' }, tPedido);
  tl.to(tarjeta, { y: 0, duration: 0.45, ease: 'expo.out' }, tPedido + 0.125);
  D.sfx('whoosh', tPedido + 0.125, 0.4, 0.08);
  [...filas, mandar, ahoraNo].forEach((e, k) =>
    tl.to(e, { opacity: 1, y: 0, duration: 0.35, ease: 'expo.out' }, tPedido + 0.25 + k * 0.0625));
  latido(tl, rubroIcono, tPedido + 0.375, 1.2);
  [HZ.C6, HZ.E6, HZ.G6].forEach((f, k) => D.sfx('plip', tPedido + 0.25 + k * 0.125, 0.035, f / 2));

  // ════════ 1,5–2,125 → 17,5–18,125 · el dedo toca "Mandar presupuesto"; sale el titular
  entrarDedo(tl, dedo, pMandar.x + 60, pMandar.y + 120, T + 1.5, { dur: 0.35 });
  const t1 = tocar(tl, dedo, pMandar.x, pMandar.y, T + 1.875, { viaje: 0.25, mantener: 0.06 }).toque; // = T + 2,125
  apretar(tl, mandar, t1);
  D.sfx('tick', t1, 0.07);
  D.sfx('key', t1, 0.1);
  salirDedo(tl, dedo, t1 + 0.125, { dur: 0.3, dx: 160, dy: 300 });
  saleTitular(tl, tit1, T + 2.25, SALE);

  // ════════ 2,5 → 18,5 · sube la hoja "Tu presupuesto" · "Vos ponés el precio."
  const tHoja = T + 2.5;
  tl.to(veloHoja, { opacity: 1, duration: 0.25, ease: 'power1.out' }, tHoja - 0.125);
  tl.to(hoja, { yPercent: 0, duration: 0.42, ease: 'expo.out' }, tHoja - 0.125);
  D.sfx('whoosh', tHoja - 0.25, 0.4, 0.08);
  D.sfx('fold', tHoja, 0.12);
  entraTitular(tl, tit2, tHoja, ENTRA);

  // 2,625 · Mano de obra, un dígito por semicorchea, con el cursor
  const titilar = (c, desde, hasta) => {
    for (let t = desde, on = true; t < hasta - 1e-6; t += 0.125, on = !on) tl.set(c, { opacity: on ? 1 : 0 }, t);
    tl.set(c, { opacity: 0 }, hasta);
  };
  tl.set(cursorMano, { opacity: 1 }, T + 2.5);
  escribirMonto(tl, montoMano, T + 2.625).forEach(t => D.sfx('key', t, 0.05));
  titilar(cursorMano, T + 3.125, T + 3.25);
  // 3,25 · Materiales de corrido (fusas; un clic por semicorchea)
  tl.set(cursorMat, { opacity: 1 }, T + 3.25);
  escribirMonto(tl, montoMat, T + 3.25, { paso: 0.0625 });
  [3.25, 3.375, 3.5].forEach(t => D.sfx('key', T + t, 0.045));
  titilar(cursorMat, T + 3.625, T + 3.875);

  // ════════ 3,625 → 19,625 · Total $ 45.000: golpe (Sol mayor) y la lupa sale del total
  const tTotal = T + 3.625;
  tl.to(carsTotal, { opacity: 1, duration: 0.05, ease: 'none' }, tTotal);
  tl.to(carsTotal, { y: 0, duration: 0.3, ease: 'back.out(3)' }, tTotal);
  tl.set(montoTotal, { scale: 1.28 }, tTotal);
  tl.to(montoTotal, { scale: 1, duration: 0.4, ease: 'elastic.out(1, 0.5)' }, tTotal + 0.02);
  tl.to(recibis, { opacity: 1, y: 0, duration: 0.3, ease: 'expo.out' }, tTotal + 0.125);
  D.sfx('fold', tTotal, 0.16);
  [HZ.G5, HZ.B5, HZ.D6].forEach((f, k) => D.sfx('bell', tTotal + k * 0.02, f, 0.045, 1.6));
  tl.to(lupa, { opacity: 1, duration: 0.1, ease: 'power1.out' }, tTotal);
  tl.to(lupa, { x: lupaXY.x, y: lupaXY.y, duration: 0.4, ease: 'expo.out' }, tTotal);
  tl.to(lupa, { scale: 1, duration: 0.45, ease: 'back.out(1.8)' }, tTotal);
  latido(tl, lupaTotal, tTotal + 0.125, 1.14, '100% 60%');
  D.sfx('whoosh', tTotal, 0.3, 0.06);
  // 3,875 · la comisión y lo que recibe, con el resaltador
  const tRecibis = T + 3.875;
  tl.to(lupaRecibis, { opacity: 1, y: 0, duration: 0.35, ease: 'expo.out' }, tRecibis);
  tl.to(resalta, { scaleX: 1, duration: 0.3, ease: 'power3.out' }, tRecibis + 0.125);
  D.sfx('bell', tRecibis, HZ.D6, 0.05, 1.4);
  D.sfx('bell', tRecibis + 0.125, HZ.G6, 0.045, 1.6);

  // ════════ 4,75 → 20,75 · la lupa vuelve al total, sale el titular, baja la hoja
  const tCierra = T + 4.75;
  tl.to(lupa, { x: pTotal.x - lupaW / 2, y: pTotal.y - lupaH / 2, scale: 0.3, duration: 0.25, ease: 'power3.in' }, tCierra);
  tl.to(lupa, { opacity: 0, duration: 0.1, ease: 'power1.in' }, tCierra + 0.15);
  saleTitular(tl, tit2, tCierra, SALE);
  tl.to(hoja, { yPercent: 100, duration: 0.3, ease: 'power3.in' }, tCierra + 0.05);
  tl.to(veloHoja, { opacity: 0, duration: 0.25, ease: 'power1.inOut' }, tCierra + 0.1);
  // el pedido ya está respondido: su tarjeta baja con la hoja (queda el pin de la casa en el mapa)
  tl.to(tarjeta, { y: 560, duration: 0.3, ease: 'power3.in' }, tCierra + 0.05);
  D.sfx('whoosh', tCierra, 0.3, 0.06);

  // ════════ 5,0 → 21,0 · cae el aviso "¡Te eligieron!" (La menor: La · Do · Mi)
  const tAviso = T + 5.0;
  tl.to(veloAviso, { opacity: 1, duration: 0.2, ease: 'power1.out' }, tAviso);
  tl.to(aviso, { opacity: 1, duration: 0.08, ease: 'none' }, tAviso);
  tl.to(aviso, { scale: 1, duration: 0.42, ease: 'back.out(1.5)' }, tAviso);
  tl.to(piezasAviso, { opacity: 1, y: 0, duration: 0.35, ease: 'expo.out', stagger: 0.0625 }, tAviso + 0.125);
  D.sfx('whoosh', tAviso - 0.125, 0.35, 0.08);
  D.sfx('fold', tAviso + 0.125, 0.14);
  entraTitular(tl, tit3, tAviso + 0.125, ENTRA);

  // 5,25 → 21,25 · el sello salta y los papelitos salen disparados
  const tSello = T + 5.25;
  const techo = L.vertical ? Math.max(120, pSello.y - (tit3.offsetTop + tit3.offsetHeight) - 60) : Infinity;
  tl.to(sello, { scale: 1, rotation: 0, duration: 0.4, ease: 'back.out(2.6)' }, tSello);
  conf.forEach((el, i) => {
    const p = papelitos[i], a = (p.ang * Math.PI) / 180;
    // en vertical el titular está arriba del teléfono: los papelitos no suben más que techo
    const x1 = p.lado * Math.cos(a) * p.dist, y1 = -Math.min(Math.sin(a) * p.dist, techo);
    const t0 = tSello + p.t0, tBaja = t0 + 0.3, dBaja = 1.2 - p.t0;
    tl.set(el, { opacity: 1 }, t0);
    tl.to(el, { x: x1, y: y1, rotation: p.giro0 + p.giro * 0.35, duration: 0.3, ease: 'power2.out' }, t0);
    tl.to(el, { x: x1 + p.deriva, y: y1 + p.cae, rotation: p.giro0 + p.giro, duration: dBaja, ease: 'power1.in' }, tBaja);
    tl.to(el, { scaleX: -1, duration: p.flip, ease: 'sine.inOut', repeat: Math.floor(dBaja / p.flip) - 1, yoyo: true }, tBaja);
    tl.to(el, { opacity: 0, duration: 0.2, ease: 'power1.in' }, tBaja + dBaja - 0.2);
  });
  D.sfx('clap', tSello, 0.16);
  D.sfx('bubbles', tSello, 8, 0.035);
  [HZ.A5, HZ.C6, HZ.E6].forEach((f, k) => D.sfx('bell', tSello + k * 0.125, f, 0.06 - k * 0.008, 1.3));

  // 6,0 → 22,0 · golpe al total del aviso (Fa: La · Fa) · 6,5 late el avatar de Carla
  latido(tl, montoAviso, T + 6.0, 1.2, '100% 70%');
  D.sfx('bell', T + 6.0, HZ.A5, 0.05, 1.1);
  D.sfx('bell', T + 6.0, HZ.F6, 0.04, 1.1);
  latido(tl, avatarCarla, T + 6.5, 1.16);
  D.sfx('tick', T + 6.5, 0.03);
  // 6,5–8 · un empuje lento de cámara, para que el cuadro quieto respire hasta el golpe
  tl.to(s, { scale: 1.03, duration: 1.5, ease: 'sine.inOut' }, T + 6.5);

  D.hide(s, T + o.dur);
  return o.dur;
});
