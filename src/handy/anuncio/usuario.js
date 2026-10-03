/* HANDY · Anuncios — 'ha-usuario': el lado del que necesita (película 6–14 s, dur 8). La misma receta arma el vertical
   (1080×1920) y el horizontal (1920×1080) con formato(D): el teléfono en L.tel (telXY), los titulares en L.titular.
   Ver STORYBOARD.md (en esta carpeta). Coreografía portada de trailers/handy-usuario (hd-inicio, hd-presupuestos y
   hd-confirmacion), comprimida a 8 s.

   Guion (tiempos desde T; película = T + 6; 1 tiempo = 0,5 s):
     0,0    el teléfono sube desde abajo (afuera de lo que se ve) con el inicio de la app; las fichas en cascada.
            Ficha "Si necesitás" y titular "Pedí lo que necesitás.".
     0,75   entra el dedo · 1,5 toca Plomería (ficha apretada + capa azul).
     2,0    navegación: entra el chat "Presupuestos · Plomería"; 2,25 el aviso de verificados.
     2,25   sale el titular · 2,5 "Te llegan presupuestos." (en horizontal el bloque ficha + titular sube arriba, para
            dejarles la fila a las tarjetas).
     2,75 · 3,25 · 3,75  llegan Martín R., Lucía G. y Diego P.: cada uno aparece en el chat y una copia grande salta
            del teléfono a su lugar (un ding cada uno). Vertical: Lucía y Diego arriba, Martín adelante abajo al centro;
            horizontal: los tres en fila.
     4,0    el teléfono cae fuera de cuadro · 4,25… pulso en los tres totales.
     4,625  sale el titular · 4,875 "Elegí el tuyo." · 4,75 entra el dedo · 5,25 toca Aceptar en el de Martín:
            sello "Elegido", aro verde; las otras dos se apagan y caen (5,625).
     5,625  vuelve el teléfono (el chat arriba de todo, Martín elegido) y la tarjeta de Martín vuela a su lugar en el
            chat (aterriza 6,375). En horizontal el bloque del titular baja a su columna.
     6,5    "¡Pedido confirmado!": velo, tarjeta, tilde verde (6,625) con campanas; queda hasta 8,0 (lo barre el golpe).
   Solo transform y opacity, todo en D.tl en tiempos absolutos desde T, estados iniciales con gsap.set; sonidos en la
   grilla de semicorcheas (0,125 s). */
import { gsap } from 'gsap';
import { formato, telXY } from './formato.js';
import { SCREEN } from '../tokens.ts';
import { PHONE, afuera } from '../layout.ts';
import { icon } from '../icons.ts';
import { phoneFrame } from '../ui/PhoneFrame.ts';
import { finger, prepararDedo, entrarDedo, tocar, salirDedo, centro } from '../ui/Finger.ts';
import { titular, prepararTitular, entraTitular, saleTitular } from '../ui/Headline.ts';
import { chatPresupuesto } from '../ui/ChatPresupuesto.ts';
import { pantallaInicio, pantallaConfirmar } from '../pantallas/usuario.ts';
import { pantallaPresupuestos, PRESUPUESTOS, presupuestoProps } from '../pantallas/usuario-chat.ts';

/* ───────────── estilos (una sola vez) ───────────── */

const CSS = `
  .ha-u { position: absolute; inset: 0; }
  .ha-u-bloque { position: absolute; left: 0; top: 0; }
  .ha-u-ficha { position: absolute; display: inline-flex; align-items: center; gap: 0.42em; padding: 0.34em 0.8em 0.36em 0.62em;
    border-radius: 999px; background: var(--hd-azul); color: #FFFFFF; font: 800 1em/1 var(--hd-font); letter-spacing: -0.01em;
    white-space: nowrap; box-shadow: 0 0.3em 0.8em -0.4em rgba(8, 12, 20, 0.5); }
  .ha-u-ficha .hd-icon { width: 1.05em; height: 1.05em; }
  .ha-u .hd-titular { white-space: normal; }
  .ha-u-carta { position: absolute; }
  .ha-u-carta .hd-presu { box-shadow: 0 1.4em 2.6em -1.2em rgba(8, 12, 20, 0.55), 0 0.1em 0.3em rgba(8, 12, 20, 0.12); }
  .ha-u-aro { position: absolute; inset: -0.15em; border: 0.25em solid var(--hd-verde); border-radius: 1.27em; pointer-events: none; }
`;
let estiloPuesto = false;
function ponerEstilo() {
  if (estiloPuesto) return;
  estiloPuesto = true;
  const st = document.createElement('style');
  st.dataset.ha = 'usuario';
  st.textContent = CSS;
  document.head.appendChild(st);
}

/* ───────────── utilidades ───────────── */

/** frecuencia de una nota midi (69 = La 440) */
const hz = m => 440 * Math.pow(2, (m - 69) / 12);

/** apretar un elemento de la interfaz en el momento del toque (escala y vuelve con rebote) */
function apretar(tl, el, at, escala = 0.94) {
  tl.to(el, { scale: escala, duration: 0.08, ease: 'power2.out' }, at);
  tl.to(el, { scale: 1, duration: 0.35, ease: 'back.out(3)' }, at + 0.14);
}

/** pulso de un elemento (sube y vuelve con rebote) */
function pulso(tl, el, at, { escala = 1.14, origen = '50% 50%' } = {}) {
  tl.set(el, { transformOrigin: origen }, at);
  tl.to(el, { scale: escala, duration: 0.14, ease: 'power2.out' }, at);
  tl.to(el, { scale: 1, duration: 0.45, ease: 'back.out(2.6)' }, at + 0.14);
}

/* Navegación dentro del teléfono: la pantalla nueva entra desde la derecha y la vieja se corre un 30 % a la izquierda;
   la fila del logo de cada una se mueve al revés que su capa, así queda quieta (como en hd-presupuestos). */
const filaLogo = capa => capa.querySelector('.hd-header-fila');
function prepararEmpuje(entra) {
  gsap.set(entra, { x: SCREEN.w });
  const f = filaLogo(entra);
  if (f) gsap.set(f, { x: -SCREEN.w });
}
function empujar(tl, sale, entra, at, dur = 0.7) {
  const par = Math.round(SCREEN.w * 0.3);
  const fe = filaLogo(entra), fs = filaLogo(sale);
  tl.to(entra, { x: 0, duration: dur, ease: 'expo.out' }, at);
  if (fe) tl.to(fe, { x: 0, duration: dur, ease: 'expo.out' }, at);
  tl.to(sale, { x: -par, duration: dur, ease: 'expo.out' }, at);
  if (fs) tl.to(fs, { x: par, duration: dur, ease: 'expo.out' }, at);
}

/** caja de `el` en coordenadas de `ref` (por layout: ignora los transforms) */
function caja(el, ref) {
  const c = centro(el, ref);
  return { x: c.x - el.offsetWidth / 2, y: c.y - el.offsetHeight / 2, w: el.offsetWidth, h: el.offsetHeight };
}

/* ───────────── composición de cada formato ───────────── */

/** Dónde va cada cosa: la ficha, los titulares y las tres tarjetas grandes (escala k de chatPresupuesto). */
function composicion(D, L) {
  const S = L.seguro;
  if (L.vertical) {
    // vertical: ficha y titular centrados arriba del teléfono; las tarjetas, dos arriba (Lucía, Diego) y Martín
    // adelante, abajo al centro, pisando apenas los botones de las de arriba
    const k = 1.25, w = 340 * k, h = 397 * k, hueco = 40;
    const yArriba = 600;
    const xIzq = Math.round(L.CX - hueco / 2 - w), xDer = Math.round(L.CX + hueco / 2);
    return {
      ficha: { tamano: 46, alinear: 'center' },
      bloque: { y0: S.arriba + 12, y1: S.arriba + 12 },
      anchos: [L.titular.ancho, L.titular.ancho, L.titular.ancho],
      k,
      slots: {
        martin: { x: Math.round(L.CX - w / 2), y: Math.round(yArriba + h - 52 * k), z: 3 },
        lucia: { x: xIzq, y: yArriba, z: 1 },
        diego: { x: xDer, y: yArriba, z: 2 },
      },
      dedoEscala: 1.3,
      telFila: null,
      arco: 90,
    };
  }
  // horizontal: con el teléfono, ficha + titular en la columna izquierda (centrados en y); con las tarjetas, el bloque
  // sube arriba y los tres presupuestos quedan en fila debajo
  const hueco = 44;
  const yFila = 316;
  const k = Math.min((S.der - S.izq - 2 * hueco - 40) / (3 * 340), (S.abajo - yFila - 20) / 397);
  const w = 340 * k, x0 = Math.round(L.CX - (3 * w + 2 * hueco) / 2);
  return {
    ficha: { tamano: 40, alinear: 'left' },
    bloque: { y0: null, y1: S.arriba },
    anchos: [L.titular.ancho, S.der - S.izq - 100, L.titular.ancho + 160],
    k,
    slots: {
      martin: { x: x0, y: yFila, z: 1 },
      lucia: { x: Math.round(x0 + w + hueco), y: yFila, z: 1 },
      diego: { x: Math.round(x0 + 2 * (w + hueco)), y: yFila, z: 1 },
    },
    dedoEscala: 1,
    // mientras llegan los presupuestos el teléfono se corre al centro, más chico, debajo del titular: las tarjetas
    // saltan de él a la izquierda, al centro y a la derecha
    telFila: { cx: L.CX, cy: yFila + 0.74 * 920 / 2 + 6, escala: 0.74 },
    arco: 0,
  };
}

/* ───────────── la receta ───────────── */

Trailer.recipe('ha-usuario', (D, T, o) => {
  ponerEstilo();
  const tl = D.tl;
  const L = formato(D);
  const C = composicion(D, L);
  const TX = L.titular;
  const textos = ['Pedí lo que necesitás.', 'Te llegan presupuestos.', 'Elegí el tuyo.'];

  const s = D.scene('usuario', `<div class="ha-u hd-ui">
      ${phoneFrame({ pantalla: pantallaInicio() + pantallaPresupuestos() })}
      ${PRESUPUESTOS.map(d => `<div class="ha-u-carta" data-id="${d.id}" style="font-size:${(16 * C.k).toFixed(2)}px">`
        + chatPresupuesto(presupuestoProps(d, { escala: C.k })) + '<span class="ha-u-aro"></span></div>').join('')}
      <div class="ha-u-bloque">
        <div class="ha-u-ficha" style="font-size:${C.ficha.tamano}px">${icon('casa', { size: 24, stroke: 2.4 })}<span>Si necesitás</span></div>
        ${textos.map((t, i) => titular({ texto: t, tamano: TX.tamano, ancho: C.anchos[i], alinear: TX.alinear, className: `ha-u-tit ha-u-tit${i}` })).join('')}
      </div>
      ${finger({ className: 'ha-u-dedo-escena' })}
    </div>`);
  const raiz = D.$('.ha-u', s);

  // ── teléfono en L.tel (escalado desde su esquina), con el dedo adentro (se mueve con él)
  const tel = D.$('.hd-telefono', s);
  const casa = telXY(L);
  const e = casa.scale;
  gsap.set(tel, { ...casa, transformOrigin: '0 0' });
  tel.insertAdjacentHTML('beforeend', finger());
  const dedoTel = D.$('.hd-dedo', tel);
  prepararDedo(dedoTel);

  // inicio de la app
  const inicio = D.$('[data-pantalla="inicio"]', tel);
  const titulosInicio = D.$$('.hd-titulo-seccion', inicio);
  const rubros = D.$$('.hd-fichas[data-grupo="rubros"] .hd-ficha', inicio);
  const accesos = D.$$('.hd-fichas[data-grupo="accesos"] .hd-ficha', inicio);
  const urgencia = D.$('.hd-urgencia', inicio);
  const plomeria = D.$('.hd-ficha[data-id="plomeria"]', inicio);
  const pPlomeria = centro(plomeria, tel);

  // chat de presupuestos (fuera de la pantalla, a la derecha)
  const pres = D.$('[data-pantalla="presupuestos"]', tel);
  prepararEmpuje(pres);
  const cuerpo = D.$('.hd-chat-cuerpo', pres);
  const lista = D.$('.hd-chat-lista', pres);
  const aviso = D.$('.hd-chip-sistema', pres);
  const enTel = Object.fromEntries(PRESUPUESTOS.map(d => [d.id, D.$(`.hd-presu[data-id="${d.id}"]`, pres)]));
  const telCartas = PRESUPUESTOS.map(d => enTel[d.id]);
  // el éxito de "Confirmá tu pedido" (velo + tarjeta ¡Pedido confirmado!) se monta directo sobre el chat
  const tmp = document.createElement('div');
  tmp.innerHTML = pantallaConfirmar();
  const exito = tmp.querySelector('.hd-exito');
  pres.appendChild(exito);
  const velo = D.$('.hd-velo', exito), tarjetaExito = D.$('.hd-exito-tarjeta', exito), check = D.$('.hd-exito-check', exito);
  const textosExito = [D.$('.hd-exito-titulo', exito), D.$('.hd-exito-detalle', exito)];

  // desplazamiento de la lista para que la tarjeta nueva quede entera a la vista (como hd-presupuestos)
  const padAbajo = parseFloat(getComputedStyle(lista).paddingBottom) || 0;
  const scrollPara = el => Math.min(0, cuerpo.clientHeight - padAbajo - (el.offsetTop + el.offsetHeight));

  // ── bloque: ficha + titulares (los tres en el mismo lugar, uno por vez)
  const bloque = D.$('.ha-u-bloque', s);
  const ficha = D.$('.ha-u-ficha', s);
  const tits = D.$$('.ha-u-tit', s);
  const hFicha = ficha.offsetHeight, wFicha = ficha.offsetWidth, aire = L.vertical ? 34 : 30;
  ficha.style.left = `${Math.round(TX.alinear === 'center' ? TX.x + TX.ancho / 2 - wFicha / 2 : TX.x)}px`;
  ficha.style.top = '0px';
  tits.forEach((t, i) => {
    const ancho = C.anchos[i];
    t.style.left = `${Math.round(TX.alinear === 'center' ? TX.x + TX.ancho / 2 - ancho / 2 : TX.x)}px`;
    t.style.top = `${hFicha + aire}px`;
  });
  // en horizontal el bloque (ficha + el titular más alto de los de la columna) queda centrado en y = TX.y
  const hBloque = hFicha + aire + Math.max(tits[0].offsetHeight, tits[2].offsetHeight);
  const y0 = C.bloque.y0 ?? Math.round(TX.y - hBloque / 2);
  const y1 = C.bloque.y1;
  gsap.set(bloque, { y: y0 });
  gsap.set(ficha, { opacity: 0, scale: 0.6, transformOrigin: TX.alinear === 'center' ? '50% 50%' : '0% 50%' });
  tits.forEach(t => prepararTitular(t));

  // ── tarjetas grandes en sus lugares (arrancan escondidas)
  const cartas = Object.fromEntries(D.$$('.ha-u-carta', s).map(c => [c.dataset.id, c]));
  for (const d of PRESUPUESTOS) {
    const c = cartas[d.id], p = C.slots[d.id];
    Object.assign(c.style, { left: `${p.x}px`, top: `${p.y}px`, zIndex: String(p.z) });
  }
  const cM = cartas.martin, cL = cartas.lucia, cD = cartas.diego;
  const aroM = D.$('.ha-u-aro', cM);
  const selloM = D.$('.hd-presu-sello', cM), pildoraM = D.$('.hd-presu-sello-pildora', cM);
  const aceptar = D.$('.hd-presu-btn[data-accion="aceptar"]', cM);
  const wCarta = cM.offsetWidth, hCarta = cM.offsetHeight;
  gsap.set(Object.values(cartas), { autoAlpha: 0, transformOrigin: '0 0' });
  gsap.set(D.$$('.ha-u-aro', s), { opacity: 0 });
  gsap.set(selloM, { opacity: 0 });
  gsap.set(pildoraM, { scale: 0, transformOrigin: '50% 50%' });

  // dedo del escenario (toca la tarjeta grande)
  const dedo = D.$('.ha-u-dedo-escena', raiz);
  prepararDedo(dedo);
  gsap.set(dedo, { scale: C.dedoEscala });

  // ── estados iniciales del teléfono: abajo, más allá de lo que se ve; el contenido del inicio apagado
  const telAfuera = D.H + 60 + afuera('y');
  gsap.set(tel, { y: telAfuera });
  gsap.set(titulosInicio, { opacity: 0, y: 16 });
  gsap.set([...rubros, ...accesos], { opacity: 0, scale: 0.6 });
  gsap.set(urgencia, { opacity: 0, scale: 0.3 });
  gsap.set(aviso, { opacity: 0, scale: 0.7 });
  gsap.set(telCartas, { opacity: 0, y: 46, scale: 0.94, transformOrigin: '0% 100%' });
  gsap.set(velo, { opacity: 0 });
  gsap.set(tarjetaExito, { opacity: 0, scale: 0.86, y: 18, transformOrigin: '50% 50%' });
  gsap.set(check, { scale: 0, transformOrigin: '50% 50%' });
  gsap.set(textosExito, { opacity: 0, y: 12 });

  D.show(s, T);

  // ════════ 1 · Pedí lo que necesitás (0–2,5) ═════════════════════════════════════════════════════════════════
  // el teléfono sube desde abajo; las fichas en cascada mientras sube
  tl.to(tel, { y: casa.y, duration: 0.85, ease: 'expo.out' }, T);
  D.sfx('whoosh', T, 0.5, 0.14);
  tl.to(titulosInicio, { opacity: 1, y: 0, duration: 0.45, ease: 'expo.out', stagger: 0.25 }, T + 0.2);
  const fichaEn = (k, t0) => t0 + Math.floor(k / 3) * 0.12 + (k % 3) * 0.04;
  rubros.forEach((f, k) => tl.to(f, { opacity: 1, scale: 1, duration: 0.45, ease: 'back.out(1.7)' }, fichaEn(k, T + 0.25)));
  accesos.forEach((f, k) => tl.to(f, { opacity: 1, scale: 1, duration: 0.45, ease: 'back.out(1.7)' }, fichaEn(k, T + 0.5)));
  tl.to(urgencia, { opacity: 1, duration: 0.2, ease: 'power1.out' }, T + 0.75);
  tl.to(urgencia, { scale: 1, duration: 0.5, ease: 'back.out(2.6)' }, T + 0.75);
  [0.25, 0.375, 0.5, 0.625].forEach(t => D.sfx('key', T + t, 0.06));

  // la ficha "Si necesitás" y el titular
  tl.to(ficha, { opacity: 1, duration: 0.2, ease: 'power1.out' }, T + 0.125);
  tl.to(ficha, { scale: 1, duration: 0.55, ease: 'back.out(2.4)' }, T + 0.125);
  D.sfx('plip', T + 0.125, 0.08, 900);
  entraTitular(tl, tits[0], T + 0.25, { dur: 0.7 });

  // el dedo toca Plomería (1,5)
  entrarDedo(tl, dedoTel, pPlomeria.x + 90, pPlomeria.y + 260, T + 0.75, { dur: 0.5 });
  const t1 = tocar(tl, dedoTel, pPlomeria.x, pPlomeria.y, T + 1.1, { viaje: 0.4, mantener: 0.1 }).toque; // = T + 1,5
  apretar(tl, plomeria, t1);
  tl.to(D.$('.hd-ficha-sel', plomeria), { opacity: 1, duration: 0.15, ease: 'power1.out' }, t1);
  D.sfx('tick', t1, 0.07);
  D.sfx('key', t1, 0.12);
  salirDedo(tl, dedoTel, t1 + 0.25, { dx: 200, dy: 420 });

  // 2,0 · entra el chat de presupuestos; 2,25 el aviso
  empujar(tl, inicio, pres, T + 2.0);
  D.sfx('whoosh', T + 2.0, 0.45, 0.1);
  tl.to(aviso, { opacity: 1, scale: 1, duration: 0.45, ease: 'back.out(2.2)' }, T + 2.25);
  D.sfx('plip', T + 2.25, 0.05, 1300);

  // ════════ 2 · Te llegan presupuestos (2,5–4,875) ════════════════════════════════════════════════════════════
  saleTitular(tl, tits[0], T + 2.1, { dur: 0.35 });
  if (y1 !== y0) tl.to(bloque, { y: y1, duration: 0.6, ease: 'expo.inOut' }, T + 2.1);
  // (horizontal) el teléfono se corre al centro, más chico, para que las tarjetas salten a los dos lados
  const fila = C.telFila ? telXY(L, C.telFila) : casa;
  if (C.telFila) tl.to(tel, { ...fila, duration: 0.6, ease: 'expo.inOut' }, T + 2.1);
  const ef = fila.scale;
  entraTitular(tl, tits[1], T + 2.5, { dur: 0.7 });

  // llegan los tres (ding ascendente): aparecen en el chat y una copia grande salta del teléfono a su lugar
  const tLlega = [T + 2.75, T + 3.25, T + 3.75];
  const dings = [hz(81), hz(84), hz(86)]; // La5 · Do6 · Re6
  const giro = { martin: -4, lucia: -6, diego: 5 };
  let scroll = 0;
  PRESUPUESTOS.forEach((d, i) => {
    const at = tLlega[i], c = cartas[d.id], p = C.slots[d.id];
    const y = scrollPara(enTel[d.id]);
    if (y < scroll) {
      tl.to(lista, { y, duration: 0.5, ease: 'power3.out' }, at - 0.05);
      scroll = y;
    }
    tl.to(enTel[d.id], { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'expo.out' }, at);
    // la copia grande arranca exactamente sobre la del chat (del tamaño de la pantalla) y salta a su lugar
    const b = caja(enTel[d.id], tel);
    const ox = fila.x + b.x * ef, oy = fila.y + (b.y + scroll) * ef;
    tl.set(c, { x: ox - p.x, y: oy - p.y, scale: ef / C.k, rotation: 0, autoAlpha: 1 }, at + 0.06);
    tl.to(c, { x: 0, duration: 0.75, ease: 'expo.out' }, at + 0.06);
    tl.to(c, { y: 0, duration: 0.75, ease: 'back.out(1.15)' }, at + 0.06);
    tl.to(c, { scale: 1, duration: 0.7, ease: 'expo.out' }, at + 0.06);
    tl.to(c, { rotation: giro[d.id], duration: 0.25, ease: 'power2.out' }, at + 0.06);
    tl.to(c, { rotation: 0, duration: 0.6, ease: 'back.out(2)' }, at + 0.31);
    D.sfx('bell', at, dings[i], 0.085, 1.1);
    D.sfx('whoosh', at, 0.35, 0.06);
  });

  // 4,0 · el teléfono cae fuera de cuadro (las tarjetas quedan solas)
  tl.to(tel, { y: telAfuera, duration: 0.5, ease: 'power3.in' }, T + 4.0);
  D.sfx('fold', T + 4.0, 0.12);
  // 4,125… · los tres totales, uno por corchea
  PRESUPUESTOS.forEach((d, i) => {
    pulso(tl, D.$('.hd-presu-total-valor', cartas[d.id]), T + 4.125 + i * 0.25, { escala: 1.16, origen: '100% 50%' });
    D.sfx('tick', T + 4.125 + i * 0.25, 0.04);
  });

  // ════════ 3 · Elegí el tuyo (4,875–8) ═══════════════════════════════════════════════════════════════════════
  saleTitular(tl, tits[1], T + 4.5, { dur: 0.35 });
  entraTitular(tl, tits[2], T + 4.875, { dur: 0.7 });

  // el dedo toca Aceptar en la de Martín (5,25)
  const pA = centro(aceptar, raiz);
  entrarDedo(tl, dedo, pA.x + 60, pA.y + 140, T + 4.75, { dur: 0.45 });
  const toque = tocar(tl, dedo, pA.x, pA.y, T + 4.9, { viaje: 0.35, mantener: 0.1 }).toque; // = T + 5,25
  apretar(tl, aceptar, toque);
  D.sfx('key', toque, 0.22);
  D.sfx('tick', toque, 0.06);
  salirDedo(tl, dedo, toque + 0.3, { dx: 180, dy: 380 });

  // 5,375 · elegido: sello, aro que se abre, se eleva; las otras se apagan y caen (5,625)
  const tSel = T + 5.375;
  tl.to(selloM, { opacity: 1, duration: 0.2, ease: 'power1.out' }, tSel);
  tl.to(pildoraM, { scale: 1, duration: 0.45, ease: 'back.out(2.4)' }, tSel + 0.04);
  tl.set(aroM, { opacity: 0.9, scale: 1, transformOrigin: '50% 50%' }, tSel);
  tl.to(aroM, { opacity: 0, scale: 1.08, duration: 0.6, ease: 'power2.out' }, tSel);
  const LEVANTA = 1.04;
  tl.to(cM, { x: -wCarta * (LEVANTA - 1) / 2, y: -18 - hCarta * (LEVANTA - 1) / 2, scale: LEVANTA, duration: 0.4, ease: 'expo.out' }, tSel);
  tl.to([cL, cD], { opacity: 0.4, duration: 0.25, ease: 'power1.out' }, tSel);
  D.sfx('bell', tSel, hz(84), 0.08, 1.4);
  D.sfx('bell', tSel, hz(91), 0.05, 1.4);
  const caida = D.H + afuera('y') + 40;
  tl.to(cL, { y: caida - C.slots.lucia.y, x: -40, rotation: -10, duration: 0.5, ease: 'power3.in' }, T + 5.625);
  tl.to(cD, { y: caida - C.slots.diego.y, x: 50, rotation: 11, duration: 0.5, ease: 'power3.in' }, T + 5.625);
  tl.set([cL, cD], { autoAlpha: 0 }, T + 6.2);
  D.sfx('whoosh', T + 5.625, 0.5, 0.1);

  // mientras el teléfono está afuera: el chat vuelve arriba, Martín vacío (llega volando), las otras atenuadas
  const tReset = T + 4.75;
  tl.set(lista, { y: 0 }, tReset);
  if (C.telFila) tl.set(tel, { x: casa.x, scale: e }, tReset);
  tl.set(enTel.martin, { opacity: 0 }, tReset);
  tl.set([enTel.lucia, enTel.diego], { opacity: 0.45 }, tReset);
  tl.set(D.$('.hd-presu-sello', enTel.martin), { opacity: 1 }, tReset);

  // 5,625 · vuelve el teléfono; en horizontal el bloque del titular baja a su columna
  tl.to(tel, { y: casa.y, duration: 0.75, ease: 'expo.out' }, T + 5.625);
  // (después de que la tarjeta de Martín cruzó por debajo del bloque)
  if (y1 !== y0) tl.to(bloque, { y: y0, duration: 0.6, ease: 'expo.inOut' }, T + 6.125);

  // 5,75 · la elegida vuela a su lugar en el chat (×k → tamaño de la pantalla) y el teléfono la recibe (6,375)
  const bMt = caja(enTel.martin, tel);
  const pM = C.slots.martin;
  const dest = { x: casa.x + bMt.x * e - pM.x, y: casa.y + bMt.y * e - pM.y };
  const tVuela = T + 5.75, tAterriza = T + 6.375;
  tl.to(cM, { x: dest.x, scale: e / C.k, duration: 0.625, ease: 'power3.inOut' }, tVuela);
  tl.to(cM, { y: Math.min(dest.y, -18) - C.arco, duration: 0.3, ease: 'sine.out' }, tVuela);
  tl.to(cM, { y: dest.y, duration: 0.325, ease: 'sine.in' }, tVuela + 0.3);
  D.sfx('whoosh', tVuela, 0.45, 0.08);
  tl.set(cM, { autoAlpha: 0 }, tAterriza);
  tl.set(enTel.martin, { opacity: 1 }, tAterriza);
  tl.to(tel, { y: casa.y + 8, duration: 0.08, ease: 'power2.out' }, tAterriza);
  tl.to(tel, { y: casa.y, duration: 0.4, ease: 'back.out(2.5)' }, tAterriza + 0.08);
  D.sfx('plip', tAterriza, 0.09, 700);

  // 6,5 · ¡Pedido confirmado!
  const tExito = T + 6.5;
  tl.to(velo, { opacity: 1, duration: 0.3, ease: 'power1.out' }, tExito);
  tl.to(tarjetaExito, { opacity: 1, scale: 1, y: 0, duration: 0.45, ease: 'back.out(1.6)' }, tExito);
  tl.to(check, { scale: 1, duration: 0.5, ease: 'back.out(2.4)' }, tExito + 0.125);
  tl.to(textosExito, { opacity: 1, y: 0, duration: 0.45, ease: 'expo.out', stagger: 0.07 }, tExito + 0.2);
  // el teléfono se acerca un poco a la cámara, con la tarjeta del éxito quieta en su lugar (se lee más grande)
  const ACERCA = 1.14;
  const fijo = centro(tarjetaExito, tel);
  const fx = casa.x + fijo.x * e, fy = casa.y + fijo.y * e;
  tl.to(tel, {
    scale: e * ACERCA, x: fx - (fx - casa.x) * ACERCA, y: fy - (fy - casa.y) * ACERCA, duration: 0.9, ease: 'expo.out',
  }, tExito);
  [hz(79), hz(83), hz(86), hz(91)].forEach((f, i) => D.sfx('bell', tExito + 0.125 + i * 0.125, f, 0.07 - i * 0.008, 1.5));

  D.hide(s, T + o.dur);
  return o.dur;
});
