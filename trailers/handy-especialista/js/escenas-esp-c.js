/* HANDY · App del especialista — escenas 6 y 7 (grupo C).
   Acá se registran (Trailer.recipe), reemplazando a las provisorias de escenas-esp-base.js:
     'he-elegido'  escena 6 · te eligieron  escrita 6 s → película 30–37,5   "¡Te eligieron!" → "Tu agenda, en orden."
     'he-camino'   escena 7 · en camino     escrita 4 s → película 37,5–42,5 "Tu número no se comparte."
   Escritas a 120 BPM (un tiempo = 0,5 s, un compás = 2 s); js/trailer.js las corre con 'hdr-corte' LENTO = 1,25 veces
   más lentas: un tiempo escrito t cae en la película en T + t × 1,25. Los golpes y los sonidos van en corcheas (0,25) o
   semicorcheas (0,125) escritas. Abajo, cada tiempo va como "escrito → película".

   Escena 6 — te eligieron (DROP 2: trailer.js le pone el destello y el punch de escala al arrancar)
     0     → 30,0   el golpe "¿Te eligen?" se tira contra la cámara y aparece el teléfono en su lugar con el inicio
                    (Trabajando prendido): cae el aviso grande "¡Te eligieron!" (de grande a su tamaño, con el velo);
                    las piezas de la tarjeta suben en cascada (semicorcheas).
     0,25  → 30,31  salta el sello del festejo y los papelitos salen disparados desde el aviso (campanas de Do mayor);
                    entra el titular "¡Te eligieron!".
     1     → 31,25  golpe al total ($ 45.000) · 1,5 → 31,875 pulso del avatar de Carla.
     1,75  → 32,19  anticipación: la tarjeta se infla apenas…
     2     → 32,5   …y se mete en la pestaña Agenda de la barra (se achica en curva hasta su ícono); sale el titular.
     2,375 → 32,97  la pestaña rebota con un "plip" y la agenda se funde sobre el inicio (misma barra y encabezado: cambia
                    solo el cuerpo); el título, el calendario y la lista suben en cascada.
     2,75  → 33,44  "Tu agenda, en orden."
     3,5   → 34,375 el jueves 15 se marca: pop de la marca azul y un aro que se abre (campanas de Sol).
     4     → 35,0   "Próximas visitas" · 4,25 → 35,31 entra la visita de Carla desde la derecha (Jue 15 oct · 16:00 ·
                    Plomería · $ 45.000) · 5 → 36,25 pulso del monto.
     5,25  → 36,56  sale el titular: a las 6 → 37,5 queda solo el teléfono con la agenda (contrato con 'he-camino').
   Escena 7 — en camino
     0     → 37,5   el chat con Carla entra empujando a la agenda (la fila del logo queda quieta); la barra de estado pasa
                    de 10:41 a 16:05. A la izquierda, "Jueves 15 de octubre" y "Tu número no se comparte."
     0,25  → 37,81  el aviso del candado "Tu número no se comparte".
     0,5 · 0,75 · 1 · 1,5 → 38,125 · 38,44 · 38,75 · 39,375  los mensajes con un "ding" cada uno: Martín "¡Hola! Estoy
                    a unas cuadras." · "¿Me mandás una foto…?" · Carla: la foto del caño (la gota cae) + "Es abajo de la
                    bacha." · Martín "Perfecto, ya sé qué llevar."
     1,75  → 39,69  el chat se cierra hacia la derecha y abajo está "En camino" (encabezado azul, íconos blancos).
     2     → 40,0   se arma la ruta punto a punto · 2,125 → 40,16 Martín la recorre (los puntos que pasa se apagan).
     3     → 41,25  sale el titular.
     3,25  → 41,56  "¡Llegaste!": la casa rebota, el pin late, la hora pasa a 16:12. "Llegás entre 16:06 y 16:30"
                    a la vista todo el tiempo.
     4     → 42,5   corte (contrato con 'he-trabajo').

   Contratos de los cortes:
     30,0  el teléfono en PHONE_XY con pantallaInicioEsp({ trabajando: true }) (lo tapa el golpe "¿Te eligen?").
     37,5  el teléfono en PHONE_XY con pantallaAgenda() completa (hora 10:41), sin titular.
     42,5  el teléfono en PHONE_XY con pantallaEnCamino({ estado: 'llego' }) en su estado final, barra de estado
           phoneFrame({ hora: '16:12', estado: 'claro' }); sin dedo ni titular.
   Solo transform y opacity, todo en D.tl en tiempos absolutos desde T (números), estados iniciales con gsap.set, azar
   solo con D.rand / D.rnd. Clases propias con prefijo he-c6- / he-c7-. */
import { gsap } from 'gsap';
import { COLORS, SCREEN } from '../../../src/handy/tokens.ts';
import { PHONE, PHONE_XY, HEADLINE } from '../../../src/handy/layout.ts';
import { phoneFrame } from '../../../src/handy/ui/PhoneFrame.ts';
import { titular, prepararTitular, entraTitular, saleTitular } from '../../../src/handy/ui/Headline.ts';
import { moverPorRuta, rutaDelta, RUTA_PUNTOS } from '../../../src/handy/ui/MapView.ts';
import {
  pantallaInicioEsp, avisoElegido, pantallaAgenda, pantallaChatCliente, pantallaEnCamino, HORAS,
} from '../../../src/handy/pantallas/especialista.ts';

/* ───────────────────────── estilos de las dos escenas ───────────────────────── */

const CSS = `
.he-c6, .he-c7 { position: absolute; inset: 0; }
.he-c6 .hd-titular, .he-c7 .hd-titular { position: absolute; margin: 0; }
.he-c6-confeti { position: absolute; inset: 0; pointer-events: none; }
.he-c6-c { position: absolute; display: block; }
.he-c6-c[data-forma="tira"] { width: 14px; height: 26px; margin: -13px 0 0 -7px; border-radius: 2px; background: currentColor; }
.he-c6-c[data-forma="punto"] { width: 17px; height: 17px; margin: -8.5px 0 0 -8.5px; border-radius: 50%; background: currentColor; }
.he-c6-c[data-forma="tri"] { width: 0; height: 0; margin: -10px 0 0 -11px; border-left: 11px solid transparent;
  border-right: 11px solid transparent; border-bottom: 20px solid currentColor; }
.he-c6-aro { position: absolute; inset: -3px; border: 3px solid ${COLORS.azulHandy}; border-radius: 14px; pointer-events: none; }
.he-c7-tit .hd-tit-grupo { display: block; }
`;
if (!document.getElementById('he-escenas-esp-c')) {
  const st = document.createElement('style');
  st.id = 'he-escenas-esp-c';
  st.textContent = CSS;
  document.head.appendChild(st);
}

/* ── utilidades ────────────────────────────────────────────────────────────────────────────────────────────────── */

/** el teléfono en su lugar de las escenas de app (x/y del transform de .hd-telefono) */
const TEL = PHONE_XY;
/** notas (Hz): Do mayor, la tonalidad de la música */
const HZ = { G5: 783.99, A5: 880, B5: 987.77, C6: 1046.5, D6: 1174.66, E6: 1318.51, G6: 1567.98 };
/** la pantalla corrida un 30 % cuando otra la empuja (como en iOS) */
const PAR = Math.round(SCREEN.w * 0.3);

/** una barra de estado suelta (hora y tema propios), para cambiar la hora o el color de los íconos con opacity */
function barraEstado(hora, estado) {
  const t = document.createElement('div');
  t.innerHTML = phoneFrame({ pantalla: '', hora, estado });
  return t.querySelector('.hd-barra-estado');
}

/** fundido cruzado entre dos capas */
function cruzar(tl, sale, entra, at, dur = 0.15) {
  tl.to(sale, { opacity: 0, duration: dur, ease: 'power1.inOut' }, at);
  tl.to(entra, { opacity: 1, duration: dur, ease: 'power1.inOut' }, at);
}

/** pulso: sube y vuelve con rebote */
function pulso(tl, el, at, { escala = 1.14, origen = '50% 50%' } = {}) {
  tl.set(el, { transformOrigin: origen }, at);
  tl.to(el, { scale: escala, duration: 0.08, ease: 'power2.out' }, at);
  tl.to(el, { scale: 1, duration: 0.28, ease: 'back.out(2.6)' }, at + 0.08);
}

/** titular en la columna izquierda, centrado en y 540 (como las escenas de app del tráiler de usuario) */
function ubicarTitular(el, cy = 540) {
  Object.assign(el.style, { left: `${HEADLINE.x}px`, top: `${Math.round(cy - el.offsetHeight / 2)}px` });
  prepararTitular(el);
}

/** las entradas y salidas de titular, al pulso de estas escenas (el doble de rápido que los valores del kit) */
const entra = (tl, el, at, op = {}) => entraTitular(tl, el, at, { dur: 0.4, stagger: 0.03, ...op });
const sale = (tl, el, at) => saleTitular(tl, el, at, { dur: 0.22, stagger: 0.015 });

/* ════════════════════════════════════════════════════════════════════════════════════════════════════════════════
   Escena 6 · te eligieron (escrita 6 s → película 30–37,5)
   ════════════════════════════════════════════════════════════════════════════════════════════════════════════════ */
const N_PAPELITOS = 44;
const COLORES_PAPELITOS = [COLORS.azul, COLORS.azulHandy, COLORS.amarilloAlerta, COLORS.amarillo, COLORS.blanco, '#8EC5FF'];
const FORMAS = ['tira', 'tira', 'punto', 'tri'];
/** px de la pantalla: centro de la tarjeta del aviso, su sello y la pestaña Agenda de la barra (ver especialista.ts) */
const AVISO_C = { x: 207, y: 421.5 };
const SELLO = { x: 207, y: 274 };
const TAB_AGENDA = { x: 157, y: 844 };
/** de px de la pantalla a px del escenario (con el teléfono en su lugar) */
const enEscenario = p => ({ x: TEL.x + PHONE.bezel + p.x, y: TEL.y + PHONE.bezel + p.y });

Trailer.recipe('he-elegido', (D, T, o) => {
  const tl = D.tl;
  // papelitos: forma, color y trayectoria con el azar de la película. Salen del sello hacia arriba y a los costados;
  // del lado izquierdo viajan menos, así no tapan el titular.
  const papelitos = Array.from({ length: N_PAPELITOS }, (_, i) => {
    const lado = i % 2 ? 1 : -1;
    return {
      lado,
      forma: FORMAS[Math.floor(D.rand() * FORMAS.length)],
      color: COLORES_PAPELITOS[Math.floor(D.rand() * COLORES_PAPELITOS.length)],
      ang: D.rnd(22, 84),
      dist: lado < 0 ? D.rnd(170, 290) : D.rnd(200, 420),
      cae: D.rnd(380, 600),
      deriva: D.rnd(-60, 60),
      giro: D.rnd(240, 620) * (D.rand() < 0.5 ? -1 : 1),
      giro0: D.rnd(0, 360),
      t0: D.rnd(0, 0.06),
      flip: D.rnd(0.1, 0.16),
    };
  });
  const origen = enEscenario(SELLO);
  const s = D.scene('elegido', `<div class="he-c6 hd-ui">
      ${phoneFrame({ pantalla: pantallaInicioEsp({ trabajando: true }) + pantallaAgenda() + avisoElegido(), hora: HORAS.manana })}
      ${titular({ texto: '¡Te *eligieron!*', tamano: 104, className: 'he-c6-tit1' })}
      ${titular({ texto: 'Tu agenda, en orden.', tamano: 76, className: 'he-c6-tit2' })}
      <div class="he-c6-confeti">${papelitos.map(p =>
        `<i class="he-c6-c" data-forma="${p.forma}" style="left:${origen.x}px;top:${origen.y}px;color:${p.color}"></i>`).join('')}</div>
    </div>`);

  // ── teléfono: inicio (abajo) · agenda (apagada) · aviso (arriba, todavía sin aparecer)
  const tel = D.$('.hd-telefono', s);
  gsap.set(tel, { x: TEL.x, y: TEL.y });
  const inicio = D.$('[data-pantalla="inicio-esp"]', tel);
  const agenda = D.$('[data-pantalla="agenda"]', tel);
  const capaAviso = D.$('[data-pantalla="elegido"]', tel);
  gsap.set(agenda, { opacity: 0 });

  // aviso: velo apagado, tarjeta grande e invisible; sus piezas un poco abajo; el sello chico y girado
  const velo = D.$('.hd-velo', capaAviso);
  const tarjeta = D.$('.hd-esp-aviso', capaAviso);
  const sello = D.$('.hd-esp-aviso-sello', tarjeta);
  const cliente = D.$('.hd-esp-aviso-cliente', tarjeta);
  const avatarCarla = D.$('.hd-avatar', cliente);
  const filasAviso = D.$$('.hd-esp-fila', tarjeta);
  const totalAviso = D.$('.hd-esp-aviso-total', tarjeta);
  const montoAviso = D.$('.hd-esp-monto', totalAviso);
  const piezasAviso = [cliente, ...filasAviso, totalAviso];
  gsap.set(velo, { opacity: 0 });
  gsap.set(tarjeta, { opacity: 0, scale: 1.45, transformOrigin: '50% 50%' });
  gsap.set(sello, { scale: 0, rotation: -40, transformOrigin: '50% 50%' });
  gsap.set(piezasAviso, { opacity: 0, y: 18 });

  // la pestaña Agenda del inicio (adonde se mete el aviso)
  const tabInicio = D.$('.hd-nav-item[data-tab="agenda"]', inicio);

  // agenda: título, calendario, subtítulo y visita escondidos; la marca del 15 apagada, con su aro
  const agTitulo = D.$('.hd-esp-agenda-titulo', agenda);
  const cal = D.$('.hd-calendario', agenda);
  const dia15 = D.$('.hd-cal-dia[data-dia="15"]', agenda);
  const marca = D.$('.hd-cal-marca', dia15);
  dia15.insertAdjacentHTML('beforeend', '<span class="he-c6-aro"></span>');
  const aro = D.$('.he-c6-aro', dia15);
  const agSub = D.$('.hd-esp-subtitulo', agenda);
  const visita = D.$('.hd-esp-visita', agenda);
  const visitaMonto = D.$('.hd-esp-visita-monto', visita);
  gsap.set([agTitulo, cal, agSub], { opacity: 0, y: 22 });
  gsap.set(marca, { scale: 0, opacity: 0 });
  gsap.set(aro, { scale: 1, opacity: 0, transformOrigin: '50% 50%' });
  gsap.set(visita, { opacity: 0, x: 70 });

  // ── titulares a la izquierda, centrados en y 540
  const tit1 = D.$('.he-c6-tit1', s), tit2 = D.$('.he-c6-tit2', s);
  ubicarTitular(tit1);
  ubicarTitular(tit2);

  // ── papelitos: escondidos detrás del sello
  const conf = D.$$('.he-c6-c', s);
  conf.forEach((el, i) => gsap.set(el, { x: 0, y: 0, rotation: papelitos[i].giro0, opacity: 0 }));

  // ════════ tiempos (escritos)
  const tCae = T;                // 30,0 cae el aviso (drop)
  const tSello = T + 0.25;       // 30,31 sello + papelitos + titular
  const tTotal = T + 1;          // 31,25 golpe al total
  const tAnticipa = T + 1.75;    // 32,19
  const tSeMete = T + 2;         // 32,5 el aviso se mete en la pestaña Agenda
  const tTab = T + 2.375;        // 32,97 rebota la pestaña y se funde la agenda
  const tTit2 = T + 2.75;        // 33,44 "Tu agenda, en orden."
  const tMarca = T + 3.5;        // 34,375 el 15 se marca
  const tSub = T + 4;            // 35,0 "Próximas visitas"
  const tVisita = T + 4.25;      // 35,31 la visita de Carla
  const tSale = T + 5.25;        // 36,56 sale el titular

  D.show(s, T);

  // 0 → 30,0 · cae el aviso grande sobre el inicio (el velo oscurece el mapa)
  tl.to(velo, { opacity: 1, duration: 0.2, ease: 'power1.out' }, tCae);
  tl.to(tarjeta, { opacity: 1, duration: 0.08, ease: 'none' }, tCae);
  tl.to(tarjeta, { scale: 1, duration: 0.42, ease: 'back.out(1.5)' }, tCae);
  tl.to(piezasAviso, { opacity: 1, y: 0, duration: 0.35, ease: 'expo.out', stagger: 0.0625 }, tCae + 0.125);
  D.sfx('whoosh', tCae, 0.35, 0.08);

  // 0,25 → 30,31 · el sello salta y los papelitos salen disparados (campanas de Do mayor)
  tl.to(sello, { scale: 1, rotation: 0, duration: 0.4, ease: 'back.out(2.6)' }, tSello);
  conf.forEach((el, i) => {
    const p = papelitos[i], a = (p.ang * Math.PI) / 180;
    const x1 = p.lado * Math.cos(a) * p.dist, y1 = -Math.sin(a) * p.dist;
    const t0 = tSello + p.t0, tBaja = t0 + 0.28, dBaja = 1.05 - p.t0;
    tl.set(el, { opacity: 1 }, t0);
    tl.to(el, { x: x1, y: y1, rotation: p.giro0 + p.giro * 0.35, duration: 0.28, ease: 'power2.out' }, t0);
    tl.to(el, { x: x1 + p.deriva, y: y1 + p.cae, rotation: p.giro0 + p.giro, duration: dBaja, ease: 'power1.in' }, tBaja);
    tl.to(el, { scaleX: -1, duration: p.flip, ease: 'sine.inOut', repeat: Math.floor(dBaja / p.flip) - 1, yoyo: true }, tBaja);
    tl.to(el, { opacity: 0, duration: 0.18, ease: 'power1.in' }, tBaja + dBaja - 0.18);
  });
  D.sfx('clap', tSello, 0.16);
  D.sfx('bubbles', tSello, 8, 0.035);
  [HZ.C6, HZ.E6, HZ.G6].forEach((f, i) => D.sfx('bell', tSello + i * 0.125, f, 0.06 - i * 0.008, 1.3));

  // 0,25 → 30,31 · "¡Te eligieron!"
  entra(tl, tit1, tSello);

  // 1 → 31,25 · golpe al total · 1,5 → 31,875 pulso del avatar de Carla
  pulso(tl, montoAviso, tTotal, { escala: 1.2, origen: '100% 70%' });
  D.sfx('bell', tTotal, HZ.C6, 0.06, 1.1);
  D.sfx('bell', tTotal, HZ.G5, 0.04, 1.1);
  pulso(tl, avatarCarla, tTotal + 0.5, { escala: 1.16 });
  D.sfx('tick', tTotal + 0.5, 0.03);

  // 1,75 → 32,19 · anticipación · 2 → 32,5 el aviso se mete en la pestaña Agenda (en curva: x e y con eases distintos)
  tl.to(tarjeta, { scale: 1.05, duration: 0.2, ease: 'power2.out' }, tAnticipa);
  tl.to(tarjeta, { x: TAB_AGENDA.x - AVISO_C.x, duration: 0.38, ease: 'power2.in' }, tSeMete);
  tl.to(tarjeta, { y: TAB_AGENDA.y - AVISO_C.y, duration: 0.38, ease: 'power3.in' }, tSeMete);
  tl.to(tarjeta, { scale: 0.06, duration: 0.38, ease: 'power2.in' }, tSeMete);
  tl.to(tarjeta, { opacity: 0, duration: 0.08, ease: 'power1.in' }, tSeMete + 0.3);
  tl.to(velo, { opacity: 0, duration: 0.3, ease: 'power1.inOut' }, tSeMete + 0.05);
  D.sfx('whoosh', tSeMete, 0.35, 0.07);
  sale(tl, tit1, tSeMete);

  // 2,375 → 32,97 · la pestaña rebota y la agenda se funde sobre el inicio (misma barra: cambia el cuerpo)
  pulso(tl, tabInicio, tTab, { escala: 1.3 });
  D.sfx('plip', tTab, 0.08, 660);
  tl.to(agenda, { opacity: 1, duration: 0.2, ease: 'power1.inOut' }, tTab + 0.125);
  tl.to([agTitulo, cal], { opacity: 1, y: 0, duration: 0.4, ease: 'expo.out', stagger: 0.0625 }, tTab + 0.125);
  D.sfx('fold', tTab + 0.125, 0.08);

  // 2,75 → 33,44 · "Tu agenda, en orden."
  entra(tl, tit2, tTit2);

  // 3,5 → 34,375 · el jueves 15 se marca: pop y un aro que se abre (campanas de Sol)
  tl.to(marca, { opacity: 1, duration: 0.08, ease: 'none' }, tMarca);
  tl.to(marca, { scale: 1, duration: 0.4, ease: 'back.out(3)' }, tMarca);
  tl.set(aro, { opacity: 0.9, scale: 1 }, tMarca + 0.06);
  tl.to(aro, { opacity: 0, scale: 1.75, duration: 0.5, ease: 'power2.out' }, tMarca + 0.06);
  D.sfx('bell', tMarca, HZ.G5, 0.06, 1.2);
  D.sfx('bell', tMarca + 0.125, HZ.D6, 0.05, 1.2);

  // 4 → 35,0 · "Próximas visitas" · 4,25 → 35,31 la visita de Carla entra desde la derecha · 5 → 36,25 pulso del monto
  tl.to(agSub, { opacity: 1, y: 0, duration: 0.4, ease: 'expo.out' }, tSub);
  tl.to(visita, { opacity: 1, duration: 0.15, ease: 'power1.out' }, tVisita);
  tl.to(visita, { x: 0, duration: 0.45, ease: 'expo.out' }, tVisita);
  D.sfx('bell', tVisita, HZ.A5, 0.06, 1.1);
  D.sfx('bell', tVisita + 0.125, HZ.E6, 0.04, 1.1);
  pulso(tl, visitaMonto, tVisita + 0.75, { escala: 1.18, origen: '100% 60%' });
  D.sfx('tick', tVisita + 0.75, 0.03);

  // 5,25 → 36,56 · sale el titular: a las 37,5 queda solo el teléfono con la agenda
  sale(tl, tit2, tSale);

  D.hide(s, T + o.dur);
  return o.dur;
});

/* ════════════════════════════════════════════════════════════════════════════════════════════════════════════════
   Escena 7 · en camino (escrita 4 s → película 37,5–42,5)
   ════════════════════════════════════════════════════════════════════════════════════════════════════════════════ */
/** hora del final (la llegada, dentro de "entre 16:06 y 16:30"): la barra de estado del corte con 'he-trabajo' */
const HORA_LLEGO = '16:12';
/** inversa de power1.inOut: en qué fracción del tiempo el pin pasa por la fracción t de la ruta */
const inversa = t => (t < 0.5 ? Math.sqrt(t / 2) : 1 - Math.sqrt((1 - t) / 2));

Trailer.recipe('he-camino', (D, T, o) => {
  const tl = D.tl;
  const s = D.scene('camino', `<div class="he-c7 hd-ui">
      ${phoneFrame({ pantalla: pantallaEnCamino({ estado: 'llego' }) + pantallaAgenda() + pantallaChatCliente(), hora: HORA_LLEGO, estado: 'claro' })}
      ${titular({ texto: 'Jueves 15 de octubre', tamano: 46, className: 'he-c7-fecha' })}
      ${titular({ texto: 'Tu número no|se comparte.', tamano: 76, className: 'he-c7-tit' })}
    </div>`);

  // ── teléfono: en camino (abajo, en su estado final) · agenda (como la deja la escena 6) · chat (fuera, a la derecha)
  const tel = D.$('.hd-telefono', s);
  gsap.set(tel, { x: TEL.x, y: TEL.y });
  const pant = D.$('.hd-pantalla', tel);
  const camino = D.$('[data-pantalla="en-camino"]', tel);
  const agenda = D.$('[data-pantalla="agenda"]', tel);
  const chat = D.$('[data-pantalla="chat-cliente"]', tel);
  const filaChat = D.$('.hd-header-fila', chat), filaAgenda = D.$('.hd-header-fila', agenda);
  const ubicacionAgenda = D.$('.hd-header-boton[data-boton="ubicacion"]', agenda);
  gsap.set(camino, { autoAlpha: 0, x: -PAR });
  gsap.set(chat, { x: SCREEN.w });
  gsap.set(filaChat, { x: -SCREEN.w });

  // barras de estado: la del marco (16:12, íconos blancos) es la del final; encima, a = 10:41 sobre blanco (agenda),
  // b = 16:05 sobre blanco (chat), c = 16:05 sobre el azul de "En camino"
  const isla = D.$('.hd-isla', pant);
  const barraFinal = D.$('.hd-barra-estado', pant);
  const barras = {};
  for (const [k, hora, estado] of [['a', HORAS.manana, 'oscuro'], ['b', HORAS.chat, 'oscuro'], ['c', HORAS.chat, 'claro']]) {
    barras[k] = barraEstado(hora, estado);
    pant.insertBefore(barras[k], isla);
    gsap.set(barras[k], { opacity: k === 'a' ? 1 : 0 });
  }
  gsap.set(barraFinal, { opacity: 0 });

  // chat: el aviso del candado y los cuatro mensajes, escondidos en su lugar (la lista entra sin desplazarse)
  const chip = D.$('.hd-chip-sistema', chat);
  gsap.set(chip, { opacity: 0, scale: 0.6, transformOrigin: '50% 50%' });
  const globo = id => D.$(`.hd-burbuja[data-id="${id}"] .hd-burbuja-cuerpo`, chat);
  const MSJ = [['hola', 0.5], ['pide-foto', 0.75], ['foto', 1], ['perfecto', 1.5]];
  MSJ.forEach(([id]) => {
    const saliente = D.$(`.hd-burbuja[data-id="${id}"]`, chat).dataset.lado === 'saliente';
    gsap.set(globo(id), { opacity: 0, scale: 0.5, y: 16, transformOrigin: saliente ? '100% 100%' : '0% 100%' });
  });
  const gotaFoto = D.$('.hd-foto-gota[data-i="1"]', chat);
  if (gotaFoto) gsap.set(gotaFoto, { transformOrigin: '50% 0%' });

  // en camino: Martín al principio de la ruta, los puntos apagados, el estado "En camino…" prendido
  const pin = D.$('.hd-pin-especialista', camino);
  const casa = D.$('.hd-pin-casa', camino);
  const puntos = D.$$('.hd-ruta-punto', camino);
  const estado = e => D.$(`.hd-esp-camino-estado[data-estado="${e}"]`, camino);
  gsap.set(pin, { ...rutaDelta(0), scale: 1 });
  gsap.set(puntos, { opacity: 0, scale: 0 });
  gsap.set(estado('en-camino'), { opacity: 1 });
  gsap.set(estado('llego'), { opacity: 0 });

  // ── columna izquierda: la fecha arriba del titular, centrados como bloque en y 540
  const fecha = D.$('.he-c7-fecha', s), tit = D.$('.he-c7-tit', s);
  const AIRE = 26;
  const y0 = Math.round(540 - (fecha.offsetHeight + AIRE + tit.offsetHeight) / 2);
  Object.assign(fecha.style, { left: `${HEADLINE.x}px`, top: `${y0}px` });
  Object.assign(tit.style, { left: `${HEADLINE.x}px`, top: `${y0 + fecha.offsetHeight + AIRE}px` });
  prepararTitular(fecha);
  prepararTitular(tit);

  // ════════ tiempos (escritos)
  const tPush = T;               // 37,5 entra el chat
  const tChip = T + 0.25;        // 37,81 candado
  const tCierra = T + 1.75;      // 39,69 se cierra el chat
  const tRuta = T + 2;           // 40,0 se arma la ruta
  const tViaje = T + 2.125;      // 40,16 Martín la recorre
  const tLlego = T + 3.25;       // 41,56 "¡Llegaste!"
  const DUR_VIAJE = tLlego - tViaje;
  const tSale = T + 3;           // 41,25 sale el titular

  D.show(s, T);

  // 0 → 37,5 · el chat entra empujando a la agenda (las filas del logo quedan quietas; el botón de ubicación de la
  // agenda se apaga, el chat no lo tiene); la hora salta a las 16:05 del jueves
  tl.to(chat, { x: 0, duration: 0.45, ease: 'expo.out' }, tPush);
  tl.to(filaChat, { x: 0, duration: 0.45, ease: 'expo.out' }, tPush);
  tl.to(agenda, { x: -PAR, duration: 0.45, ease: 'expo.out' }, tPush);
  tl.to(filaAgenda, { x: PAR, duration: 0.45, ease: 'expo.out' }, tPush);
  tl.to(ubicacionAgenda, { opacity: 0, duration: 0.1, ease: 'power1.out' }, tPush);
  cruzar(tl, barras.a, barras.b, tPush + 0.0625, 0.15);
  D.sfx('whoosh', tPush, 0.4, 0.08);
  tl.set(agenda, { autoAlpha: 0 }, tPush + 0.5);
  entra(tl, fecha, tPush);

  // 0,25 → 37,81 · el candado y "Tu número no se comparte."
  tl.to(chip, { opacity: 1, scale: 1, duration: 0.3, ease: 'back.out(2.2)' }, tChip);
  D.sfx('plip', tChip, 0.06, 1300);
  entra(tl, tit, tChip);
  pulso(tl, chip, tChip + 1, { escala: 1.12 });

  // 0,5 · 0,75 · 1 · 1,5 → los mensajes, uno por uno, con un "ding" cada uno (La – Do – Mi – Re sobre el Fa)
  const dings = { 'hola': HZ.A5, 'pide-foto': HZ.C6, 'foto': HZ.E6, 'perfecto': HZ.D6 };
  MSJ.forEach(([id, dt]) => {
    const at = T + dt;
    tl.to(globo(id), { opacity: 1, duration: 0.1, ease: 'power1.out' }, at);
    tl.to(globo(id), { scale: 1, y: 0, duration: 0.3, ease: 'back.out(1.7)' }, at);
    D.sfx('bell', at, dings[id], 0.065, 1);
  });
  D.sfx('fold', T + 1, 0.08);
  // la gota de la foto se suelta y cae (la pérdida)
  if (gotaFoto) {
    tl.to(gotaFoto, { y: 26, duration: 0.3, ease: 'power2.in' }, T + 1.25);
    tl.to(gotaFoto, { opacity: 0, duration: 0.08, ease: 'none' }, T + 1.5);
  }

  // 1,75 → 39,69 · el chat se cierra hacia la derecha y abajo está "En camino" (íconos de la barra: blancos)
  tl.set(camino, { autoAlpha: 1 }, tCierra);
  tl.to(chat, { x: SCREEN.w, duration: 0.35, ease: 'power3.inOut' }, tCierra);
  tl.to(camino, { x: 0, duration: 0.35, ease: 'power3.inOut' }, tCierra);
  cruzar(tl, barras.b, barras.c, tCierra + 0.1, 0.15);
  D.sfx('whoosh', tCierra, 0.4, 0.07);

  // 2 → 40,0 · la ruta se arma punto a punto y Martín late · 2,125 → 40,16 la recorre (los puntos que pasa se apagan)
  tl.to(puntos, { opacity: 1, scale: 1, duration: 0.15, ease: 'back.out(2.5)', stagger: 0.008 }, tRuta);
  D.sfx('bubbles', tRuta, 6, 0.03);
  pulso(tl, pin, tRuta, { escala: 1.2 });
  D.sfx('plip', tRuta, 0.07, 620);
  moverPorRuta(tl, pin, tViaje, { dur: DUR_VIAJE });
  puntos.forEach((p, i) => tl.to(p, { opacity: 0, scale: 0.4, duration: 0.1, ease: 'power1.in' },
    tViaje + DUR_VIAJE * inversa(RUTA_PUNTOS[i].t) - 0.02));

  // 3 → 41,25 · sale el titular
  sale(tl, fecha, tSale);
  sale(tl, tit, tSale + 0.0625);

  // 3,25 → 41,56 · "¡Llegaste!": la casa rebota, el pin late y la hora pasa a 16:12 (campanas de Sol)
  cruzar(tl, estado('en-camino'), estado('llego'), tLlego, 0.15);
  tl.to(casa, { scale: 1.22, duration: 0.08, ease: 'power2.out', transformOrigin: '50% 100%' }, tLlego);
  tl.to(casa, { scale: 1, duration: 0.3, ease: 'back.out(3)' }, tLlego + 0.08);
  pulso(tl, pin, tLlego + 0.03, { escala: 1.16 });
  tl.set(barras.c, { opacity: 0 }, tLlego);
  tl.set(barraFinal, { opacity: 1 }, tLlego);
  D.sfx('bell', tLlego, HZ.G5, 0.065, 1.2);
  D.sfx('bell', tLlego + 0.125, HZ.B5, 0.05, 1.3);
  D.sfx('bell', tLlego + 0.25, HZ.D6, 0.05, 1.4);

  D.hide(s, T + o.dur);
  return o.dur;
});
