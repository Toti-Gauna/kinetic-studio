/* Pantallas de la app de usuario, diseño 2026 (src/handy/app/DISENO.md): seguimiento, chat, trabajo terminado, reseña
   y agenda. Armadas con los componentes de app/ui; cada pantalla es UNA capa <div class="hd-capa …"> de 414×896 para
   el `pantalla` de phoneFrame (src/handy/ui/PhoneFrame.ts). Todo se dibuja en el estado pedido; los cambios de estado
   (título, pasos, montos, botones) son capas apiladas que se cruzan con opacity y las ayudas de abajo los animan
   (solo transform y opacity). Estilos en css/uc.css (prefijo ap-uc-).
   Las fotos miden 914 de alto (la pantalla, 896): lo que va pegado abajo sube 18 px para guardar su aire (en el
   seguimiento, el panel azul entero; en el chat, todo lo de abajo del encabezado; en el fin, la botonera y las tarjetas
   — la ilustración sube 8 y el título 12 —; en la reseña, la hoja). La agenda no se corre.
   Posiciones medidas en el DOM: x · y · ancho × alto en px de la pantalla de 414×896 (centro = donde apunta el dedo).

   ── pantallaSeguimiento({ estado = 'confirmado' })   10/11-u-seguimiento · [data-pantalla="u-seguimiento"]
     estado 'confirmado' (10) · 'en-camino' (11) · 'llego' (sin foto: "Especialista 1 llegó", el especialista al lado de
     la casa, la caja de info con la dirección). Usar phoneFrame({ estado: 'claro' }). Una sola capa sirve para los tres:
     cambiarSeguimiento cruza de uno a otro y moverPorRuta lleva al especialista por la ruta.
       .ap-mapa (pantalla entera; ui/mapa.ts con VISTA_SEGUIMIENTO: La Perla ×1,036) · .ap-mapa-ruta (azul de 6: baja por
         x 216,1, dobla en y 166,3 hasta x 159 y sigue bajo el panel)
       .ap-uc-seg-casa (pin rojo de la casa: 172 · 295 · 28 × 36, la punta en 186 · 330; opacity 1 solo en 'llego'; pop
         con scale sobre su svg, el origen ya está en la punta)
       .ap-uc-seg-esp (el especialista: div de 0×0 con left/top en la salida de la ruta, 216,1 · 112 — casi tapado por el
         encabezado, como en 11 —; se mueve con x/y = rutaDelta(t); llega a 159 · 322; opacity 0 en 'confirmado') ·
         .ap-uc-seg-esp-punto (azul r 14 + aro blanco 4) · .ap-uc-seg-esp-precision (anillo rojo r 27 de "poca precisión":
         pulsar con scale/opacity; se apaga en 'llego')
       .ap-encabezado[data-variante="azul"] (0 · 0 · 414 × 124; la campana sola en 336,9 · 54,9)
       .ap-uc-atras (21,1 · 139,3 · 49,5 × 47 + canto 4; centro 45,8 · 162,8) · .ap-uc-atras-cara (apretar: y = 4)
       .ap-uc-seg-franja "Hoy · 16 a 18 h" (269,6 · 128,2 · 128,6 × 26,2)
       .ap-uc-seg-panel (0 · 351,3 · 414 × hasta abajo, radio 36: entrar con y desde abajo) y adentro:
         .ap-uc-seg-asa (181,2 · 363,3 · 51,6 × 6,1)
         .ap-uc-seg-titulo[data-estado="confirmado|en-camino|llego"] (22,9 · 379,9; dos renglones de 23,9; opacity)
         .ap-pasos (24 · 442,5 · 366,4 × 67,2; ui/pasos.ts): barras en y 478,6 · .ap-pasos-tramo[data-tramo] con
           .ap-pasos-relleno (scaleX) y .ap-pasos-completo (opacity) · .ap-pasos-icono (la personita, x = centro − 37:
           centro 135,2 en 'confirmado' → 300,2 en 'en-camino' → 354 en 'llego', y 455,5) · etiquetas en y 493,7 (quedan
           en blanco la del paso actual y las anteriores)
         .ap-uc-seg-info[data-info="azul|amarillo|llego"] (23,6 · 522,6 · 366,8 × 52,6, radio 14; opacity)
         .ap-uc-seg-horario (23,6 · 589,7 · 366,8 × 68,1) · .ap-uc-seg-horario-info (círculo de 49,5, centro 297,2 · 623,6;
           en los otros estados corre x 58,9 → 356,1) · .ap-uc-seg-cancelar (rojo, centro 356,2 · 623,6; solo en
           'confirmado': opacity/scale)
         .ap-uc-seg-total (23,6 · 672,1 · 366,8 × 64 + canto 4,4) · .ap-uc-seg-total-monto · .ap-uc-seg-detalle ("Ver el
           detalle ›": 274,2 · 695,1 · 101,6 × 15; centro 325 · 702,6)
         .ap-uc-seg-privacidad (24,4 · 749,7 · 352 × 36,2) · .ap-uc-seg-linea (y 800,5)
         .ap-uc-seg-avatar (E1 blanco de 40, centro 43,3 · 844,4) · .ap-uc-seg-quien (77,1 · 827)
         .ap-uc-seg-chat (botón amarillo: 336,5 · 817,6 · 54 × 54,6 + canto 4,4; centro de la cara 363,5 · 844,9) ·
           .ap-uc-seg-chat-cara (apretar: y = 4,4) · .ap-uc-seg-globito (el "1", centro 386,5 · 820,5: pop con scale)
   cambiarSeguimiento(tl, capa, estado, at, dur = .5) → duración: cruza título, pasos (rellenos, completos, personita,
     etiquetas), caja de info, botones del horario, el especialista (aparece) y la casa ('llego'). No lo mueve.
   ponerSeguimiento(capa, estado) → lo mismo con gsap.set, y deja al especialista en su punto de la ruta.
   RUTA_SEGUIMIENTO (vértices) · CASA_SEGUIMIENTO · rutaPunto(t) / rutaDelta(t) (t de 0 = salida a 1 = casa) ·
     moverPorRuta(tl, capa, at, { desde = 0, hasta = 1, dur = 3, ease = 'power1.inOut' }) → duración (lleva
     .ap-uc-seg-esp a velocidad pareja; acompañarlo con los pasos: tl.to(relleno, { scaleX }) en el mismo tramo).
   avisoSalio() → capa de aviso azul con la personita: "Especialista 1 salió para tu casa · Llega en la franja que
     declaró: Hoy · 16 a 18 h" (11). Bajarlo con bajarAviso (ui/aviso.ts); quieto: gsap.set(barraDelAviso(capa), { opacity: 0 }).

   ── pantallaChat({ despedida = true })   12-u-chat · [data-pantalla="u-chat"]
     Encabezado blanco (atrás, E1, "Especialista 1 · Plomería · verificado"), fondo #F4F5F8, aviso del chat, los mensajes
     de la historia, acciones rápidas y campo de mensaje. despedida: el último globo de la foto ("De nada. Cualquier
     cosa, escribime por acá."; no está en la historia de DISENO.md).
       .ap-uc-chat-encabezado (0 · 0 · 414 × 119) · .ap-uc-atras[data-tono="gris"] (21,1 · 54,6 · 52,4 × 48 + canto 3,6;
         centro 47,3 · 78,6) · .ap-uc-chat-avatar (E1 de 38,5, centro 107,4 · 78,4) · .ap-uc-chat-nombre · .ap-uc-chat-rubro
       .ap-aviso-chat (37,8 · 239,9 · 338,4 × 126,4)
       .ap-uc-chat-mensaje[data-mensaje] (cada globo, un elemento: entra con recibirMensaje): hola (92 · 380,4 · 306 ×
         55,1) · foto (tarjetaFoto: 138,5 · 445,8 · 259,5 × 124) · respuesta (azul: 16 · 579,2 · 306 × 55,1) · genial
         (264,8 · 644,8 · 133,2 × 35,3) · despedida (azul: 16 · 690,3 · 306 × 55,1). MENSAJES_CHAT: ids y arriba.
       .ap-uc-chat-pie (0 · 758,7: filete y fondo blanco) · .ap-acciones (14,2 · 770,3): .ap-boton[data-accion="programar"]
         (centro 95,9 · 795) · .ap-boton[data-accion="turno-ahora"] (centro 285,9 · 795)
       .ap-campo (13,6 · 832): .ap-campo-adjuntar (centro 38,3 · 858,5) · .ap-campo-entrada (75,8 · 841,5 · 262,3 × 33,9)
         con .ap-campo-placeholder / .ap-campo-escrito (opacity) · .ap-campo-enviar (centro de la cara 375,3 · 856,5)
   recibirMensaje(tl, capa, id, at, { dur = .45 }) → duración (opacity + scale/y desde la esquina del que habla).

   ── pantallaTerminado({ pagado = false })   13/14-u-terminado · [data-pantalla="u-terminado"]
     pagado false (13): TOTAL A PAGAR y la botonera alta con "Pagar $ 47.250" · true (14): PAGASTE, se ve el total final,
     la botonera baja 58,9 y "Calificar" queda sin canto. pagar(tl, capa, at) pasa de uno a otro.
       .ap-encabezado[data-variante="blanco"] (globito 3)
       .ap-uc-fin-ilus (52,5 · 120 · 330 × 186) = ilustracionFin(): .ap-uc-fin-ilus-fondo (tarjeta gris inclinada −3,8°) ·
         .hd-handy[data-handy] (handys.ts, animables con handys-anim.ts): gota 61 · 211,9 · 36,6 × 46,9 · cano 60 · 138,7 ·
         engranaje 184,1 · 231,5 · lamparita 236,3 · 156,7 · llave 299 · 242,6 · .ap-uc-fin-tilde (verde de 62,8 con aro
         blanco, centro 332,6 · 158,2: pop con scale)
       .ap-uc-fin-titulo "¡Listo, quedó / arreglado!" (centrado, top 315,6; .ap-resalte-banda bajo "arreglado":
         109,4 · 361 · 178,5 × 13,5, dibujarla con scaleX)
       .ap-uc-fin-esp (23,6 · 389,5 · 366,8 × 80,1): avatar E1 de 50,5 (centro 64,9 · 429,5) · nombre · Verificado ·
         Plomería · Hoy · 16 a 18 h
       .ap-uc-fin-cuenta (23,6 · 483,7 · 366,8 × 263,3): .ap-uc-fin-rotulo[data-estado="a-pagar|pagaste"] (opacity) ·
         .ap-uc-fin-monto ($ 47.250 verde, 523,7 de alto 41: pop con scale) · .ap-uc-fin-muesca[data-lado] ·
         .ap-uc-fin-punteado · .ap-desglose (43,3 · 599,8; filas .ap-desglose-fila[data-fila] cada 26,2, el total
         .ap-desglose-total en 711)
       .ap-uc-fin-pie (fondo blanco de la botonera: top 700,9; y 0 → 58,9 al pagar)
       .ap-boton[data-accion="pagar"] (23,6 · 716,9 · 366,8 × 52; centro 207 · 742,9) dentro de .ap-uc-fin-pagar (opacity)
       .ap-boton[data-accion="calificar"] (23,6 · 776,9 · 366,8 × 52,4 + canto 4,7; centro de la cara 207 · 803,1) ·
         .ap-uc-fin-calificar-canto (opacity 0 al pagar; apretar: .ap-boton-cara y = 4,7 con apretarBoton)
       .ap-uc-fin-volver "Volver al inicio" (centro 207 · 853,4)
   avisoTerminado() → "Trabajo terminado · Confirmaste que Especialista 1 terminó." (verde, tilde).
   avisoPagaste({ detalle }) → "Pagaste $ 47.250" y el detalle de 14 en dos renglones (verde, billetera).
   pagar(tl, capa, at, dur = .45) → duración.

   ── hojaResena({ estado = 'vacia', elegidos = [] })   15/16/17-u-resena · [data-pantalla="hoja-resena"]
     UNA capa (velo + hoja) para apilar sobre pantallaTerminado({ pagado: true }). 'vacia' (15: estrellas apagadas, "Tocá
     las estrellas…", Enviar apagado) · 'llena' (16: cinco estrellas, ¿QUÉ FUE LO MEJOR?, Enviar prendido; la hoja sube
     80,1) · 'gracias' (17: la Lamparita con el tilde y "¡Gracias por calificar!"; la hoja baja 185,9 desde 'llena').
     elegidos: chips que arrancan elegidos. La hoja (.ap-hoja de ui/hoja.ts, top 287,2) va dentro de .ap-uc-resena-mover,
     que la corre según el estado (y 80,1 · 0 · 185,9); subirHoja (ui/hoja.ts) sigue sirviendo para hacerla entrar. El
     comentario y Enviar (.ap-uc-resena-pie) van en la hoja pero quedan quietos en la pantalla (su y compensa la del estado).
     Posiciones en 'llena' (en 'vacia' lo de arriba del pie está 80,1 más abajo; en 'gracias' la hoja empieza en 473,1):
       .ap-velo · .ap-hoja-titulo "¿Cómo te fue?" (70,6 · 318,4 · 272,8 × 23,8) · .ap-hoja-cerrar (X de 41, centro
         362,1 · 331)
       .ap-uc-resena-avatar (E1 de 88, centro 207 · 406,9) · .ap-uc-resena-nombre · .ap-chip-rubro[data-rubro="plomeria"]
       .ap-estrellas (53,9 · 533,2 · 306,2 × 59): .ap-estrella[data-estrella="1".."5"] (centros x 81,4 · 144,2 · 207 ·
         269,8 · 332,6; y 560,7) → llenarEstrellas(tl, el, at) de ui/estrellas.ts
       .ap-uc-resena-pista ('vacia': "Tocá las estrellas para calificar", y 681,3; opacity)
       .ap-uc-resena-mejor (rótulo + chips; opacity): .ap-chip[data-chip] (31,3 de alto; centros Puntual 114,8 · 642,2 ·
         Prolijo 190,5 · 642,2 · Explicó todo 282,8 · 642,2 · Buen trato 207 · 683,2) → elegirChip (ui/chips.ts)
       .ap-uc-resena-pie: .ap-uc-resena-comentario (34,2 · 714,3 · 345,6 × 72,8) con .ap-uc-resena-placeholder /
         .ap-uc-resena-escrito (opacity) · .ap-boton[data-accion="enviar"] (33,8 · 805,6 · 346,4 × 52; centro 207 · 831,6)
         con .ap-uc-resena-enviar-apagado encima (la versión celeste de 15: opacity)
       .ap-uc-resena-gracias (opacity): .ap-uc-resena-lampara (la Lamparita: 168,6 · 556,6 · 77,6 × 132) ·
         .ap-uc-resena-tilde (centro 244,8 · 660,4: pop) · .ap-uc-resena-gracias-titulo · .ap-uc-resena-gracias-texto ·
         .ap-boton[data-accion="volver"] (33,8 · 803,8 · 346,4 × 52 + canto 4,7; centro 207 · 829,8)
   ponerResena(capa, estado) · cambiarResena(tl, capa, estado, at, dur = .5) → duración (se apaga lo que se va, corre la
     hoja y se prende lo que llega; las estrellas y los chips van aparte).
   avisoGracias() → "¡Gracias por calificar! · Tu calificación le llega a Especialista 1." (verde, estrella).

   ── pantallaAgendaUsuario()   18-u-turnos · [data-pantalla="u-agenda"]
     Encabezado blanco (globito 3), "Tu agenda" (subrayado en "agenda"), noviembre 2026 con el martes 17 elegido (y los
     días con turnos de la foto: 3, 7, 19 y 26), "MARTES 17/11 · 1 TRABAJO", la tarjeta del trabajo y la barra con Agenda.
       .ap-uc-agenda-titulo (23,4 · 129,5) · .ap-cal (23,6 · 176,8 · 366,8 × 349,6; calendarioMes con la grilla de la
         foto: celdas de 41,5 × 43 + canto 2,5 cada 49,4 × 49,5): .ap-cal-dia[data-dia] (el 1 en 38,9 · 271,2; el 17 con
         la cara centrada en 158,4 · 391,7) → elegirDia (ui/calendario.ts)
       .ap-uc-agenda-rotulo (24 · 543,6) · .ap-uc-agenda-trabajo (23,6 · 569,7 · 366,8 × 136,5 + canto 3,6): la tarjeta
         entera es el botón: .ap-uc-agenda-cara (apretar: y = 3,6) con .ap-uc-agenda-cuerpo (icono, Plomería, horario,
         trabajo, .ap-etiqueta "Terminado", .ap-uc-agenda-monto) y .ap-uc-agenda-detalle ("Ver detalle ›", centro
         207 · 686,7)
       .ap-barra (Agenda prendida; la pestaña con centro 157,8 · 854). */
import { gsap } from 'gsap';
import { esc } from './ui/comun.ts';
import './css/pantallas.css';
import './css/uc.css';
import { encabezado } from './ui/encabezado.ts';
import { barraInferior } from './ui/barra.ts';
import { mapa } from './ui/mapa.ts';
import { pasos } from './ui/pasos.ts';
import { avatar, pildoraVerificado } from './ui/avatar.ts';
import { aviso } from './ui/aviso.ts';
import { boton } from './ui/botones.ts';
import { chip, chipRubro, etiqueta } from './ui/chips.ts';
import { tituloResaltado, rotulo } from './ui/textos.ts';
import { desglose } from './ui/desglose.ts';
import { hoja } from './ui/hoja.ts';
import { estrellas } from './ui/estrellas.ts';
import { calendarioMes, CALENDARIO } from './ui/calendario.ts';
import { burbuja, tarjetaFoto, avisoChat, accionesChat, campoMensaje } from './ui/chat.ts';
import { icono } from './iconos.ts';
import { handy, filaHandys } from '../handys.ts';

const ve = (on: boolean) => `opacity:${on ? 1 : 0}`;
const n1 = (v: number) => Math.round(v * 10) / 10;

/** Botón cuadrado de volver (seguimiento: cara blanca; chat: cara gris), con su canto. */
function botonAtras({ tono = 'blanco', estilo = '' }: { tono?: 'blanco' | 'gris'; estilo?: string } = {}): string {
  return `<span class="ap-uc-atras" data-tono="${tono}" style="${estilo}"><span class="ap-uc-atras-canto"></span>`
    + `<span class="ap-uc-atras-cara">${icono('flecha-izq', { tam: 24, trazo: 2.3 })}</span></span>`;
}

/* ═══════════════════════════════ seguimiento ═══════════════════════════════ */

export type EstadoSeguimiento = 'confirmado' | 'en-camino' | 'llego';
type P = readonly [number, number];

/** Vértices de la ruta del especialista (px de la pantalla): de donde sale (debajo del encabezado) a la casa. */
export const RUTA_SEGUIMIENTO: readonly P[] = [[216.1, 112], [216.1, 166.3], [159, 166.3], [159, 322]];
/** La ruta dibujada sigue debajo del panel, como en las fotos (la calle continúa). */
const RUTA_DIBUJO: readonly P[] = [[216.1, 60], [216.1, 166.3], [159, 166.3], [159, 372]];
/** Punta del pin de la casa (al lado del final de la ruta). */
export const CASA_SEGUIMIENTO = { x: 186, y: 330 } as const;
/** Vista del mapa de ui/mapa.ts que coincide con 10/11-u-seguimiento (manzanas, plaza, Av. Luro y la costa). */
export const VISTA_SEGUIMIENTO = { x: -6.3, y: -294.4, escala: 1.0357 } as const;
/** Borde de arriba del panel azul (en la foto, 369,3: sube 18). */
export const PANEL_SEGUIMIENTO = 351.3;

const TRAMOS_RUTA = RUTA_SEGUIMIENTO.slice(1).map((p, i) => Math.hypot(p[0] - RUTA_SEGUIMIENTO[i][0], p[1] - RUTA_SEGUIMIENTO[i][1]));
const LARGO_RUTA = TRAMOS_RUTA.reduce((a, b) => a + b, 0);
const VERTICES_T = TRAMOS_RUTA.reduce<number[]>((acc, l) => [...acc, acc[acc.length - 1] + l / LARGO_RUTA], [0]);

/** Punto de la ruta a la fracción t (0 = salida, 1 = casa), en px de la pantalla. */
export function rutaPunto(t: number): { x: number; y: number } {
  const k = Math.min(1, Math.max(0, t));
  for (let i = 0; i < TRAMOS_RUTA.length; i++) {
    if (k <= VERTICES_T[i + 1] || i === TRAMOS_RUTA.length - 1) {
      const f = (k - VERTICES_T[i]) / (VERTICES_T[i + 1] - VERTICES_T[i] || 1);
      const a = RUTA_SEGUIMIENTO[i], b = RUTA_SEGUIMIENTO[i + 1];
      return { x: a[0] + (b[0] - a[0]) * f, y: a[1] + (b[1] - a[1]) * f };
    }
  }
  const u = RUTA_SEGUIMIENTO[RUTA_SEGUIMIENTO.length - 1];
  return { x: u[0], y: u[1] };
}

/** x/y que hay que darle a .ap-uc-seg-esp para ponerlo a la fracción t (su left/top es la salida de la ruta). */
export function rutaDelta(t: number): { x: number; y: number } {
  const p = rutaPunto(t);
  return { x: n1(p.x - RUTA_SEGUIMIENTO[0][0]), y: n1(p.y - RUTA_SEGUIMIENTO[0][1]) };
}

/** Lleva al especialista por la ruta de `desde` a `hasta` (fracciones) a velocidad pareja, con un ease global.
    Tiene que estar ya en rutaDelta(desde). Devuelve la duración. */
export function moverPorRuta(tl: GSAPTimeline, capa: Element, at: number,
  { desde = 0, hasta = 1, dur = 3, ease = 'power1.inOut' }: { desde?: number; hasta?: number; dur?: number; ease?: string } = {}): number {
  const el = capa.classList.contains('ap-uc-seg-esp') ? capa : capa.querySelector('.ap-uc-seg-esp');
  const cortes = [...VERTICES_T.filter(t => t > desde && t < hasta), hasta];
  const keyframes: Record<string, unknown> = { easeEach: 'none' };
  for (const t of cortes) keyframes[`${n1(((t - desde) / (hasta - desde)) * 100)}%`] = rutaDelta(t);
  tl.to(el, { keyframes, duration: dur, ease }, at);
  return dur;
}

/** Cómo queda cada estado (pasos, personita, etiqueta prendida, botones del horario). */
const SEG: Record<EstadoSeguimiento, { relleno: number[]; completo: number[]; persona: number; prendida: number; info: string; esp: number; casa: number; horarioX: number; cancelar: number; ruta: number }> = {
  'confirmado': { relleno: [0, 0.855, 0], completo: [1, 0, 0], persona: 111.2, prendida: 0, info: 'azul', esp: 0, casa: 0, horarioX: 0, cancelar: 1, ruta: 0 },
  'en-camino': { relleno: [0, 1, 0.648], completo: [1, 1, 0], persona: 276.2, prendida: 1, info: 'amarillo', esp: 1, casa: 0, horarioX: 58.9, cancelar: 0, ruta: 0 },
  'llego': { relleno: [0, 1, 1], completo: [1, 1, 0], persona: 330, prendida: 2, info: 'llego', esp: 1, casa: 1, horarioX: 58.9, cancelar: 0, ruta: 1 },
};

const TITULOS_SEG: Record<EstadoSeguimiento, string> = {
  'confirmado': 'Especialista 1 confirmó\ntu turno',
  'en-camino': 'Especialista 1 va para\ntu casa',
  'llego': 'Especialista 1 llegó',
};

const INFOS_SEG: readonly { info: string; texto: string }[] = [
  { info: 'azul', texto: 'Cuando salga para tu casa, vas a ver su recorrido acá.' },
  { info: 'amarillo', texto: 'La ubicación del especialista llega con poca precisión. Marcamos la llegada cuando mejore.' },
  // sin foto de 'llego': el texto sale de la historia (la dirección de DISENO.md)
  { info: 'llego', texto: 'Llegó a tu casa: Catamarca 1650, La Perla.' },
];

export interface SeguimientoProps {
  estado?: EstadoSeguimiento;
}

export function pantallaSeguimiento({ estado = 'confirmado' }: SeguimientoProps = {}): string {
  const s = SEG[estado];
  const d = rutaDelta(s.ruta);
  const casa = mapa({ ambos: false, vista: VISTA_SEGUIMIENTO, yo: false, ruta: RUTA_DIBUJO, pin: CASA_SEGUIMIENTO })
    .replace('class="ap-mapa-pin" style="', `class="ap-mapa-pin ap-uc-seg-casa" style="${ve(!!s.casa)};`);
  const actual = estado === 'confirmado' ? 1 : 2;
  const panel = '<div class="ap-uc-seg-panel">'
    + '<span class="ap-uc-seg-asa"></span>'
    + (Object.keys(TITULOS_SEG) as EstadoSeguimiento[]).map(e => `<span class="ap-uc-seg-titulo" data-estado="${e}" style="${ve(e === estado)}">`
      + tituloResaltado({ texto: TITULOS_SEG[e], tam: 22, alto: '23.9px', ancho: 107, color: 'var(--ap-blanco)', etiqueta: 'span' })
      + '</span>').join('')
    // en las fotos quedan en blanco la etiqueta del paso actual y las anteriores (pasos() prende una sola)
    + pasos({ actual, progreso: s.relleno[actual], persona: s.persona, prendida: s.prendida, className: 'ap-uc-seg-pasos' })
      .replace(/data-etiqueta="(\d)"><span class="ap-pasos-etiqueta-apagada" style="opacity:\d">([^<]*)<\/span><span class="ap-pasos-etiqueta-prendida" style="opacity:\d">/g,
        (_m, i: string, t: string) => `data-etiqueta="${i}"><span class="ap-pasos-etiqueta-apagada" style="opacity:${+i <= s.prendida ? 0 : 1}">${t}</span><span class="ap-pasos-etiqueta-prendida" style="opacity:${+i <= s.prendida ? 1 : 0}">`)
    + INFOS_SEG.map(i => `<div class="ap-uc-seg-info" data-info="${i.info}" style="${ve(i.info === s.info)}">`
      + `${icono('pin', { tam: 17.5, trazo: 2.1 })}<p>${esc(i.texto)}</p></div>`).join('')
    + '<div class="ap-uc-seg-horario"><span class="ap-uc-seg-horario-rotulo">Horario que declaró</span>'
    + '<span class="ap-uc-seg-horario-valor ap-display">Hoy · 16 a 18 h</span>'
    + `<span class="ap-uc-seg-horario-info" style="transform:translate(${s.horarioX}px, 0px)">${icono('info', { tam: 20.8, trazo: 2.2 })}</span>`
    + `<span class="ap-uc-seg-cancelar" style="${ve(!!s.cancelar)}">${icono('prohibido', { tam: 20.8, trazo: 2.2 })}</span></div>`
    + '<div class="ap-uc-seg-total"><span class="ap-uc-seg-total-canto"></span><span class="ap-uc-seg-total-cara">'
    + '<span class="ap-uc-seg-total-rotulo">Total vigente para vos</span>'
    + '<span class="ap-uc-seg-total-monto ap-display">$ 47.250</span>'
    + `<span class="ap-uc-seg-detalle">Ver el detalle${icono('chevron-der', { tam: 15, trazo: 2.6 })}</span></span></div>`
    + `<div class="ap-uc-seg-privacidad">${icono('escudo', { tam: 17, trazo: 2 })}<p>Solo ves la ubicación del especialista de este trabajo y solo mientras viaja a tu casa.</p></div>`
    + '<span class="ap-uc-seg-linea"></span>'
    + `<span class="ap-uc-seg-avatar">${avatar({ iniciales: 'E1', tam: 40, tono: 'azul', tilde: true, className: 'ap-uc-avatar-blanco' })}</span>`
    + '<span class="ap-uc-seg-quien"><span class="ap-uc-seg-quien-rotulo">Tu especialista es</span><span class="ap-uc-seg-quien-nombre">Especialista 1</span></span>'
    + '<span class="ap-uc-seg-chat"><span class="ap-uc-seg-chat-canto"></span>'
    + `<span class="ap-uc-seg-chat-cara">${icono('mensajes', { tam: 30, trazo: 2.4 })}</span>`
    + '<span class="ap-uc-seg-globito">1</span></span>'
    + '</div>';
  return `<div class="hd-capa ap-pantalla ap-ui ap-uc-seg" data-pantalla="u-seguimiento" data-estado="${estado}">`
    + casa
    + `<span class="ap-uc-seg-esp" style="left:${RUTA_SEGUIMIENTO[0][0]}px;top:${RUTA_SEGUIMIENTO[0][1]}px;${ve(!!s.esp)};transform:translate(${d.x}px, ${d.y}px)">`
    + `<span class="ap-uc-seg-esp-precision" style="${ve(estado !== 'llego')}"></span><span class="ap-uc-seg-esp-punto"></span></span>`
    + encabezado({ variante: 'azul', campana: false, ubicacion: false, className: 'ap-uc-seg-encabezado' })
    + botonAtras({ estilo: 'left:21.1px;top:139.3px' })
    + `<span class="ap-uc-seg-franja">${icono('reloj', { tam: 13.6, trazo: 2.4 })}<span>Hoy · 16 a 18 h</span></span>`
    + panel
    + '</div>';
}

/** Las partes del seguimiento que cambian con el estado, con su valor de destino. */
function destinosSeguimiento(capa: Element, a: EstadoSeguimiento): [Element | null, gsap.TweenVars][] {
  const s = SEG[a];
  const q = (sel: string) => capa.querySelector(sel);
  const out: [Element | null, gsap.TweenVars][] = [];
  capa.querySelectorAll<HTMLElement>('.ap-uc-seg-titulo').forEach(t => out.push([t, { opacity: t.dataset.estado === a ? 1 : 0 }]));
  capa.querySelectorAll<HTMLElement>('.ap-uc-seg-info').forEach(t => out.push([t, { opacity: t.dataset.info === s.info ? 1 : 0 }]));
  for (let i = 0; i < 3; i++) {
    out.push([q(`.ap-pasos-tramo[data-tramo="${i}"] .ap-pasos-relleno`), { scaleX: s.relleno[i] }]);
    out.push([q(`.ap-pasos-tramo[data-tramo="${i}"] .ap-pasos-completo`), { opacity: s.completo[i] }]);
  }
  capa.querySelectorAll<HTMLElement>('.ap-pasos-etiqueta').forEach(e => {
    const on = Number(e.dataset.etiqueta) <= s.prendida;
    out.push([e.querySelector('.ap-pasos-etiqueta-prendida'), { opacity: on ? 1 : 0 }]);
    out.push([e.querySelector('.ap-pasos-etiqueta-apagada'), { opacity: on ? 0 : 1 }]);
  });
  out.push([q('.ap-pasos-icono'), { x: n1(s.persona - 13), y: 0 }]);
  out.push([q('.ap-uc-seg-horario-info'), { x: s.horarioX }]);
  out.push([q('.ap-uc-seg-cancelar'), { opacity: s.cancelar, scale: s.cancelar ? 1 : 0.6 }]);
  out.push([q('.ap-uc-seg-esp'), { opacity: s.esp }]);
  out.push([q('.ap-uc-seg-esp-precision'), { opacity: a === 'llego' ? 0 : 1 }]);
  out.push([q('.ap-uc-seg-casa'), { opacity: s.casa }]);
  return out;
}

/** Al construir la escena: deja el seguimiento en un estado (gsap.set; el especialista va a su lugar de la ruta). */
export function ponerSeguimiento(capa: Element, a: EstadoSeguimiento): void {
  for (const [el, v] of destinosSeguimiento(capa, a)) if (el) gsap.set(el, v);
  gsap.set(capa.querySelector('.ap-uc-seg-esp'), rutaDelta(SEG[a].ruta));
}

/** Cruza el seguimiento al estado pedido (título, pasos, info, botones del horario, especialista y casa). El
    especialista NO se mueve: para eso, moverPorRuta. Devuelve la duración. */
export function cambiarSeguimiento(tl: GSAPTimeline, capa: Element, a: EstadoSeguimiento, at: number, dur = 0.5): number {
  for (const [el, v] of destinosSeguimiento(capa, a)) {
    if (!el) continue;
    const mueve = 'x' in v || 'scaleX' in v;
    tl.to(el, { ...v, duration: mueve ? dur : dur * 0.6, ease: mueve ? 'power2.inOut' : 'power1.inOut' }, at);
  }
  return dur;
}

/** "Especialista 1 salió para tu casa" (11-u-seguimiento): capa de aviso azul con la personita. */
export function avisoSalio(): string {
  return aviso({ titulo: 'Especialista 1 salió para tu casa', detalle: 'Llega en la franja que declaró: Hoy · 16 a 18 h', icono: 'caminando', tono: 'azul', dato: 'salio' });
}

/* ═══════════════════════════════ chat ═══════════════════════════════ */

/** Los mensajes del chat (12-u-chat), en orden: id (data-mensaje) y borde de arriba en px de la pantalla. */
export const MENSAJES_CHAT = [
  { id: 'hola', top: 380.4 },
  { id: 'foto', top: 445.8 },
  { id: 'respuesta', top: 579.2 },
  { id: 'genial', top: 644.8 },
  { id: 'despedida', top: 690.3 },
] as const;

export function pantallaChat({ despedida = true }: { despedida?: boolean } = {}): string {
  const html: Record<string, string> = {
    hola: burbuja({ texto: '¡Hola! Te elegí para arreglar la pérdida de la cocina.', lado: 'der' }),
    foto: tarjetaFoto({ pie: 'Así está el caño de abajo de la pileta' }),
    respuesta: burbuja({ texto: '¡Hola! Gracias. Voy en la franja que te marqué.', lado: 'izq', tono: 'azul' }),
    genial: burbuja({ texto: '¡Genial, gracias!', lado: 'der' }),
    despedida: burbuja({ texto: 'De nada. Cualquier cosa, escribime por acá.', lado: 'izq', tono: 'azul' }),
  };
  const mensajes = MENSAJES_CHAT.filter(m => despedida || m.id !== 'despedida')
    .map(m => `<div class="ap-uc-chat-mensaje" data-mensaje="${m.id}" style="top:${m.top}px">${html[m.id]}</div>`).join('');
  return '<div class="hd-capa ap-pantalla ap-ui ap-uc-chat" data-pantalla="u-chat">'
    + avisoChat({ className: 'ap-uc-chat-aviso' })
    + mensajes
    + '<div class="ap-uc-chat-pie"></div>'
    + accionesChat({ className: 'ap-uc-chat-acciones' })
    + campoMensaje({ className: 'ap-uc-chat-campo' })
    + '<div class="ap-uc-chat-encabezado">'
    + botonAtras({ tono: 'gris', estilo: 'left:21.1px;top:54.6px' })
    + `<span class="ap-uc-chat-avatar">${avatar({ iniciales: 'E1', tam: 38.5, tono: 'azul', tilde: true })}</span>`
    + '<span class="ap-uc-chat-nombre">Especialista 1</span>'
    + '<span class="ap-uc-chat-rubro">Plomería · verificado</span>'
    + '</div></div>';
}

/** Hace entrar un mensaje del chat (el globo crece desde su esquina de abajo, del lado del que habla). Antes, la escena
    lo deja escondido: gsap.set(globo, { opacity: 0 }). Devuelve la duración. */
export function recibirMensaje(tl: GSAPTimeline, capa: Element, id: string, at: number, { dur = 0.45 }: { dur?: number } = {}): number {
  const globo = capa.querySelector(`.ap-uc-chat-mensaje[data-mensaje="${id}"] > *`);
  if (!globo) return 0;
  tl.fromTo(globo, { opacity: 0 }, { opacity: 1, duration: dur * 0.35, ease: 'power1.out' }, at);
  tl.fromTo(globo, { scale: 0.6, y: 14 }, { scale: 1, y: 0, duration: dur, ease: 'back.out(1.7)' }, at);
  return dur;
}

/* ═══════════════════════════════ trabajo terminado ═══════════════════════════════ */

/** Alto del caño de la fila de Handys de la ilustración (13-u-terminado). */
const ALTO_CANO_FIN = 148.1;

/** La ilustración de "¡Listo, quedó arreglado!": la tarjeta gris inclinada, los cinco Handys y el tilde verde. */
export function ilustracionFin({ estilo = '' }: { estilo?: string } = {}): string {
  const fila = filaHandys(ALTO_CANO_FIN);
  const handys = fila.handys.map(h => `<span class="ap-uc-fin-handy" data-handy="${h.tipo}" style="left:${n1(h.x)}px;top:${n1(h.y)}px">${handy(h.tipo, { altura: h.altura })}</span>`).join('');
  return `<div class="ap-uc-fin-ilus" style="${estilo}"><span class="ap-uc-fin-ilus-fondo"></span>`
    + `<div class="ap-uc-fin-handys" style="width:${n1(fila.ancho)}px;height:${n1(fila.alto)}px">${handys}</div>`
    + `<span class="ap-uc-fin-tilde">${icono('tilde', { tam: 34, trazo: 3.4 })}</span></div>`;
}

export function pantallaTerminado({ pagado = false }: { pagado?: boolean } = {}): string {
  const cuenta = '<div class="ap-uc-fin-cuenta ap-tarjeta">'
    + `<span class="ap-uc-fin-rotulo" data-estado="a-pagar" style="${ve(!pagado)}">${rotulo('Total a pagar')}</span>`
    + `<span class="ap-uc-fin-rotulo" data-estado="pagaste" style="${ve(pagado)}">${rotulo('Pagaste')}</span>`
    + '<span class="ap-uc-fin-monto ap-display">$ 47.250</span>'
    + '<span class="ap-uc-fin-muesca" data-lado="izq"></span><span class="ap-uc-fin-muesca" data-lado="der"></span>'
    + '<span class="ap-uc-fin-punteado"></span>'
    + desglose({
      filas: [{ texto: 'Mano de obra', monto: 32000 }, { texto: 'Materiales', monto: 13000 }, { texto: 'Subtotal', monto: 45000, fuerte: true }, { texto: 'Tarifa de Handy · cliente (5%)', monto: 2250, dato: 'tarifa' }],
      total: { texto: 'Total final para vos', monto: 47250, tono: 'tinta', display: false },
      className: 'ap-uc-fin-desglose',
    })
    + '</div>';
  return `<div class="hd-capa ap-pantalla ap-ui ap-uc-fin" data-pantalla="u-terminado" data-pagado="${pagado ? 1 : 0}">`
    + ilustracionFin()
    + tituloResaltado({ texto: '¡Listo, quedó\narreglado!', resaltar: 'arreglado', tam: 30, alto: '30.4px', ancho: 117, className: 'ap-abs ap-uc-fin-titulo' })
    + '<div class="ap-uc-fin-esp ap-tarjeta">'
    + `<span class="ap-uc-fin-esp-avatar">${avatar({ iniciales: 'E1', tam: 50.5, tono: 'azul', tilde: true })}</span>`
    + '<span class="ap-uc-fin-esp-nombre">Especialista 1</span>'
    + `<span class="ap-uc-fin-esp-verificado">${pildoraVerificado()}</span>`
    + `<span class="ap-uc-fin-esp-rubro">${icono('canilla', { tam: 15.5, trazo: 2.3 })}<span>Plomería</span></span>`
    + '<span class="ap-uc-fin-esp-cuando">Hoy · 16 a 18 h</span>'
    + '</div>'
    + cuenta
    + `<div class="ap-uc-fin-pie" style="transform:translate(0px, ${pagado ? 58.9 : 0}px)"></div>`
    + `<span class="ap-uc-fin-pagar" style="${ve(!pagado)}">${boton({ texto: 'Pagar $ 47.250', variante: 'verde', tam: 'grande', ancho: 366.8, accion: 'pagar' })}</span>`
    + `<span class="ap-uc-fin-calificar">${boton({ texto: 'Calificar a Especialista 1', icono: 'estrella', variante: 'azul', tam: 'grande', alto: 52.4, ancho: 366.8, accion: 'calificar' })
      .replace('class="ap-boton-canto"', 'class="ap-boton-canto ap-uc-fin-calificar-canto"').replace(/style="top:4\.7px/, `style="${ve(!pagado)};top:4.7px`)}</span>`
    + '<span class="ap-uc-fin-volver">Volver al inicio</span>'
    + encabezado({ variante: 'blanco', campana: 3 })
    + '</div>';
}

/** "Trabajo terminado" (13-u-terminado). */
export function avisoTerminado(): string {
  return aviso({ titulo: 'Trabajo terminado', detalle: 'Confirmaste que Especialista 1 terminó.', icono: 'tilde', tono: 'verde', dato: 'terminado' });
}

/** "Pagaste $ 47.250" (14-u-terminado-2): el detalle va en dos renglones (la píldora mide lo mismo). */
export function avisoPagaste({ detalle = 'Demo: no se cobró nada. En la app, lo del trabajo va directo a la cuenta de Especialista 1.' }: { detalle?: string } = {}): string {
  return aviso({ titulo: 'Pagaste $ 47.250', detalle, icono: 'billetera', tono: 'verde', dato: 'pagaste', className: 'ap-uc-aviso-2' });
}

/** Paga: cruza TOTAL A PAGAR → PAGASTE, se va "Pagar", la botonera baja y "Calificar" pierde el canto. Devuelve la duración. */
export function pagar(tl: GSAPTimeline, capa: Element, at: number, dur = 0.45): number {
  const q = (s: string) => capa.querySelector(s);
  tl.to(q('.ap-uc-fin-rotulo[data-estado="a-pagar"]'), { opacity: 0, duration: dur * 0.4, ease: 'power1.in' }, at);
  tl.to(q('.ap-uc-fin-rotulo[data-estado="pagaste"]'), { opacity: 1, duration: dur * 0.4, ease: 'power1.out' }, at + dur * 0.3);
  tl.to(q('.ap-uc-fin-pagar'), { opacity: 0, y: 12, duration: dur * 0.5, ease: 'power2.in' }, at);
  tl.to(q('.ap-uc-fin-pie'), { y: 58.9, duration: dur, ease: 'power2.inOut' }, at + dur * 0.2);
  tl.to(q('.ap-uc-fin-calificar-canto'), { opacity: 0, duration: dur * 0.4, ease: 'power1.inOut' }, at + dur * 0.4);
  return dur * 1.2;
}

/* ═══════════════════════════════ reseña ═══════════════════════════════ */

export type EstadoResena = 'vacia' | 'llena' | 'gracias';

/** Borde de arriba de la hoja en 'llena' (16-u-resena-2: 305,2; sube 18) y cuánto baja en cada estado. */
export const HOJA_RESENA = { top: 287.2, corre: { vacia: 80.1, llena: 0, gracias: 185.9 } as Record<EstadoResena, number> } as const;

export const CHIPS_RESENA = ['Puntual', 'Prolijo', 'Explicó todo', 'Buen trato'] as const;

export interface ResenaProps {
  estado?: EstadoResena;
  /** chips elegidos (los de CHIPS_RESENA) */
  elegidos?: readonly string[];
}

export function hojaResena({ estado = 'vacia', elegidos = [] }: ResenaProps = {}): string {
  const corre = HOJA_RESENA.corre[estado];
  const calificar = estado !== 'gracias';
  const llena = estado === 'llena';
  const chips = (lista: readonly string[]) => lista.map(c => chip({ texto: c, tono: 'gris', tam: 'm', elegido: elegidos.includes(c), className: 'ap-uc-resena-chip' })).join('');
  const contenido = '<div class="ap-uc-resena-contenido">'
    + `<div class="ap-uc-resena-calificar" style="${ve(calificar)}">`
    + `<span class="ap-uc-resena-avatar">${avatar({ iniciales: 'E1', tam: 88, tono: 'azul', tilde: true })}</span>`
    + '<span class="ap-uc-resena-nombre ap-display">Especialista 1</span>'
    + `<span class="ap-uc-resena-rubro">${chipRubro({ rubro: 'plomeria', tam: 'm' })}</span>`
    + estrellas({ llenas: llena ? 5 : 0, className: 'ap-uc-resena-estrellas' })
    + `<span class="ap-uc-resena-pista" style="${ve(estado === 'vacia')}">Tocá las estrellas para calificar</span>`
    + `<div class="ap-uc-resena-mejor" style="${ve(llena)}">${rotulo('¿Qué fue lo mejor?', { className: 'ap-uc-resena-mejor-rotulo' })}`
    + `<div class="ap-uc-resena-chips">${chips(CHIPS_RESENA.slice(0, 3))}</div><div class="ap-uc-resena-chips" data-fila="2">${chips(CHIPS_RESENA.slice(3))}</div></div>`
    + `<div class="ap-uc-resena-pie" style="transform:translate(0px, ${-corre}px)">`
    + `<div class="ap-uc-resena-comentario">${icono('lapiz', { tam: 15, trazo: 2.1 })}<span class="ap-uc-resena-placeholder">Contá algo más, si querés...</span>`
    + '<span class="ap-uc-resena-escrito" style="opacity:0"></span></div>'
    + `<span class="ap-uc-resena-enviar">${boton({ texto: 'Enviar', icono: 'enviar', variante: 'azul', tam: 'grande', ancho: 346.4, canto: 0, accion: 'enviar', className: 'ap-uc-resena-enviar-boton' })}`
    + `<span class="ap-uc-resena-enviar-apagado" style="${ve(estado === 'vacia')}"><span class="ap-uc-resena-enviar-apagado-canto"></span>`
    + `<span class="ap-uc-resena-enviar-apagado-cara">${icono('enviar', { tam: 19, trazo: 2.3 })}<span>Enviar</span></span></span></span>`
    + '</div></div>'
    + `<div class="ap-uc-resena-gracias" style="${ve(!calificar)}">`
    + `<span class="ap-uc-resena-lampara">${handy('lamparita', { altura: 132 })}</span>`
    + `<span class="ap-uc-resena-tilde">${icono('tilde', { tam: 30, trazo: 3.4 })}</span>`
    + tituloResaltado({ texto: '¡Gracias por calificar!', tam: 23.4, ancho: 118, etiqueta: 'h3', className: 'ap-uc-resena-gracias-titulo' })
    + '<p class="ap-uc-resena-gracias-texto">Tu calificación nos ayuda a cuidar la calidad de cada trabajo.</p>'
    + boton({ texto: 'Volver al inicio', variante: 'azul', tam: 'grande', ancho: 346.4, accion: 'volver', className: 'ap-uc-resena-volver' })
    + '</div></div>';
  const laHoja = hoja({ titulo: '¿Cómo te fue?', tono: 'tinta', tam: 22, ancho: 110, linea: false, top: HOJA_RESENA.top, capa: false, cuerpo: contenido, className: 'ap-uc-resena-hoja' });
  return `<div class="hd-capa ap-hoja-capa ap-ui ap-uc-resena" data-pantalla="hoja-resena" data-estado="${estado}">`
    + '<div class="ap-velo"></div>'
    + `<div class="ap-uc-resena-mover" style="transform:translate(0px, ${corre}px)">${laHoja}</div>`
    + '</div>';
}

/** Cada parte de la reseña con su valor en el estado `a` y cuándo se mueve dentro del cambio (desde, largo: fracciones
    de la duración): primero se apaga lo que se va, después corre la hoja y al final se prende lo que llega. */
function destinosResena(capa: Element, a: EstadoResena): [Element | null, gsap.TweenVars, number, number][] {
  const q = (s: string) => capa.querySelector(s);
  const corre = HOJA_RESENA.corre[a];
  const gracias = a === 'gracias';
  return [
    [q('.ap-uc-resena-calificar'), { opacity: gracias ? 0 : 1 }, gracias ? 0 : 0.5, 0.35],
    [q('.ap-uc-resena-pista'), { opacity: a === 'vacia' ? 1 : 0 }, a === 'vacia' ? 0.6 : 0, 0.3],
    [q('.ap-uc-resena-enviar-apagado'), { opacity: a === 'vacia' ? 1 : 0 }, 0.2, 0.4],
    [q('.ap-uc-resena-mover'), { y: corre }, gracias ? 0.15 : 0, 1],
    [q('.ap-uc-resena-pie'), { y: -corre }, gracias ? 0.15 : 0, 1],
    [q('.ap-uc-resena-mejor'), { opacity: a === 'llena' ? 1 : 0 }, a === 'llena' ? 0.55 : 0, 0.4],
    [q('.ap-uc-resena-gracias'), { opacity: gracias ? 1 : 0 }, gracias ? 0.6 : 0, 0.4],
  ];
}

/** Al construir la escena: deja la reseña en un estado (gsap.set; las estrellas y los chips no se tocan). */
export function ponerResena(capa: Element, a: EstadoResena): void {
  for (const [el, v] of destinosResena(capa, a)) if (el) gsap.set(el, v);
}

/** Cruza la reseña al estado pedido: se apaga lo que se va, la hoja sube o baja (el pie queda quieto en la pantalla) y
    se prende lo que llega. Las estrellas se llenan aparte (llenarEstrellas) y los chips con elegirChip. Devuelve la
    duración. */
export function cambiarResena(tl: GSAPTimeline, capa: Element, a: EstadoResena, at: number, dur = 0.5): number {
  for (const [el, v, desde, largo] of destinosResena(capa, a)) {
    if (!el) continue;
    const mueve = 'y' in v;
    tl.to(el, { ...v, duration: dur * largo, ease: mueve ? 'power3.inOut' : 'power1.inOut' }, at + dur * desde);
  }
  return dur * 1.15;
}

/** "¡Gracias por calificar!" (17-u-resena-3). */
export function avisoGracias(): string {
  return aviso({ titulo: '¡Gracias por calificar!', detalle: 'Tu calificación le llega a Especialista 1.', icono: 'estrella', tono: 'verde', dato: 'gracias' });
}

/* ═══════════════════════════════ agenda ═══════════════════════════════ */

/** Calendario de 18-u-turnos: celdas de 41,5 × 43 + canto 2,5 cada 49,4 (el de ui/calendario.ts está medido en
    20-e-turnos: 47,5 × 45 cada 51,25). Se arma con calendarioMes y se corren las celdas a la grilla de la foto. */
export const CAL_USUARIO = { paso: { x: 49.4, y: 49.5 }, celda: { w: 41.5, h: 43, canto: 2.5 } } as const;

function calendarioUsuario(): string {
  const p = CALENDARIO.paso;
  const cal = calendarioMes({ eventos: { 3: 1, 7: 1, 17: 1, 19: 1, 26: 2 }, ancho: 366.8, className: 'ap-uc-cal' });
  return cal
    .replace(/(class="ap-cal-dia"[^>]*?style=")left:([\d.]+)px;top:([\d.]+)px/g, (_m, a: string, x: string, y: string) =>
      `${a}left:${n1(Math.round(+x / p) * CAL_USUARIO.paso.x)}px;top:${n1(Math.round(+y / p) * CAL_USUARIO.paso.y)}px`)
    .replace(/<span style="left:([\d.]+)px">/g, (_m, x: string) => `<span style="left:${n1(Math.round(+x / p) * CAL_USUARIO.paso.x)}px">`)
    .replace(/(class="ap-cal ap-caja ap-uc-cal" style="width:[\d.]+px;)height:[\d.]+px/, '$1height:349.6px');
}

export function pantallaAgendaUsuario(): string {
  return '<div class="hd-capa ap-pantalla ap-ui ap-uc-agenda" data-pantalla="u-agenda">'
    + encabezado({ variante: 'blanco', campana: 3 })
    + tituloResaltado({ texto: 'Tu agenda', resaltar: 'agenda', tam: 29.5, ancho: 117, className: 'ap-abs ap-uc-agenda-titulo' })
    + calendarioUsuario()
    + rotulo('Martes 17/11 · 1 trabajo', { className: 'ap-abs ap-uc-agenda-rotulo' })
    + '<div class="ap-uc-agenda-trabajo"><span class="ap-uc-agenda-canto"></span><span class="ap-uc-agenda-cara">'
    + `<span class="ap-uc-agenda-detalle"><span>Ver detalle</span>${icono('chevron-der', { tam: 14, trazo: 2.6 })}</span>`
    + '<span class="ap-uc-agenda-cuerpo">'
    + `<span class="ap-uc-agenda-icono">${icono('canilla', { tam: 27, trazo: 2.3 })}</span>`
    + '<span class="ap-uc-agenda-rubro">Plomería</span>'
    + '<span class="ap-uc-agenda-cuando">16 a 18 h · Especialista 1</span>'
    + '<span class="ap-uc-agenda-que">Cambiar el caño de abajo de la pileta de la cocina</span>'
    + `<span class="ap-uc-agenda-estado">${etiqueta({ texto: 'Terminado', tono: 'verde' })}</span>`
    + '<span class="ap-uc-agenda-monto ap-display">$ 47.250</span>'
    + '</span></span></div>'
    + barraInferior({ activa: 'agenda' })
    + '</div>';
}
