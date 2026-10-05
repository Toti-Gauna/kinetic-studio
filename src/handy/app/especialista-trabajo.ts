/* Pantallas del especialista, segunda parte (diseño 2026, src/handy/app/DISENO.md): desde que el cliente lo elige hasta
   que cobra y lo califican. Cada función devuelve UNA capa <div class="hd-capa ap-pantalla" data-pantalla="…"> de
   414×896 para el `pantalla` de phoneFrame (src/handy/ui/PhoneFrame.ts); los avisos y la hoja son capas transparentes
   para apilar encima. Todo se dibuja en su estado final; los cambios de estado (mensajes que llegan, el cronómetro,
   «Llegaste», estrellas) son capas o tiras apiladas que la escena mueve SOLO con transform y opacity: hay ayudas para
   cada uno (ponerX = gsap.set al construir, el resto agrega tweens a un timeline y devuelve la duración).
   Medidas en px de la pantalla (x · y, ancho × alto). Las fotos miden 914 de alto: lo pegado abajo (campo del chat,
   botonera del trabajo y del fin) sube 18 px para dejar el mismo aire que en la foto.

   avisoTeEligio() → capa del aviso «¡El cliente te eligió! · Plomería en La Perla. Ya podés ir para allá.» (11-e-chat)
   avisoCobro()    → capa del aviso «Cobro registrado · $ 40.500 directo a tu cuenta.» (19-e-fin)
     Píldora negra de ui/aviso.ts (17,1 · 13,1 · 379,4 × 74,6), círculo verde (centro 53,6 · 50,4). Bajarla con bajarAviso
     y subirla con subirAviso (ui/aviso.ts: apagan y prenden la barra de estado); en una pantalla quieta,
     gsap.set(barraDelAviso(capa), { opacity: 0 }).

   pantallaAgendaEsp()                           20/21-e-turnos · [data-pantalla="e-agenda"]
   pantallaChatCliente({ paso = 2 })             11/12-e-chat   · [data-pantalla="e-chat-cliente"]
     ponerChatCliente(capa, paso) · avanzarChatCliente(tl, capa, 1 | 2, at) → duración
   pantallaEnCamino({ estado = 'camino' })       13/14-e-en-camino · [data-pantalla="e-en-camino"]
     ponerEnCamino(capa, estado) · llegarEnCamino(tl, capa, at, { dur = 1,4 }) → duración
   pantallaTrabajo({ segundos = 1, apretado })   15-e-trabajo · [data-pantalla="e-trabajo"]
     cronometro({ segundos }) · ponerCronometro(el, s) · correrCronometro(tl, el, desde, hasta, at, { paso, giro }) →
     duración · latirCronometro(tl, el, at, { veces, periodo }) → duración · «Terminar trabajo»: apretarBoton (ui/botones.ts)
   pantallaFin()                                 19-e-fin · [data-pantalla="e-fin"] · entrarFin(tl, capa, at) → duración
   pantallaCobros()                              41-e-caja · [data-pantalla="e-cobros"]
   hojaResenaCliente({ llenas = 5 })             hoja «Te calificaron» al estilo de 16-u-resena-2 ·
     [data-pantalla="hoja-resena-cliente"] · calificarResena(tl, capa, at) → duración
   dibujoCano({ ancho = 158,4 })                 la «foto» del caño (U con la gota) en SVG
   (ganchos y posiciones en el comentario de cada una) */
import './ui/comun.ts';
import './css/pantallas.css';
import './css/eb.css';
import { gsap } from 'gsap';
import { encabezado } from './ui/encabezado.ts';
import { barraInferior } from './ui/barra.ts';
import { aviso } from './ui/aviso.ts';
import { boton } from './ui/botones.ts';
import { chip, chipRubro, etiqueta } from './ui/chips.ts';
import { avatar } from './ui/avatar.ts';
import { tituloResaltado, rotulo } from './ui/textos.ts';
import { desglose, type FilaDesglose, type TotalDesglose } from './ui/desglose.ts';
import { pasos } from './ui/pasos.ts';
import { mapa } from './ui/mapa.ts';
import { calendarioMes } from './ui/calendario.ts';
import { burbuja, tarjetaFoto, fechaChat, campoMensaje } from './ui/chat.ts';
import { estrellas, llenarEstrellas } from './ui/estrellas.ts';
import { hoja, subirHoja } from './ui/hoja.ts';
import { icono, type Icono } from './iconos.ts';
import { cls, esc, pesos } from './ui/comun.ts';
import { handy, filaHandys } from '../handys.ts';

/* ───────────────────────────── la historia ───────────────────────────── */

/** Los números del trabajo (DISENO.md): presupuesto $ 45.000, Handy retiene su 10 % y el especialista recibe $ 40.500. */
export const CUENTA_TRABAJO = { mano: 32000, materiales: 13000, presupuesto: 45000, tarifa: 4500, recibis: 40500 } as const;

const FILAS_CUENTA: readonly FilaDesglose[] = [
  { texto: 'Mano de obra', monto: CUENTA_TRABAJO.mano },
  { texto: 'Materiales', monto: CUENTA_TRABAJO.materiales },
  { texto: 'Tu presupuesto', monto: CUENTA_TRABAJO.presupuesto, fuerte: true, antes: 'punteado' },
  { texto: 'Tarifa Handy (10%)', monto: -CUENTA_TRABAJO.tarifa, tono: 'rojo', dato: 'tarifa' },
];

/* ───────────────────────────── piezas chicas ───────────────────────────── */

const capa = (dato: string, clase: string, html: string) =>
  `<div class="hd-capa ap-pantalla ap-ui ap-eb ${clase}" data-pantalla="${dato}">${html}</div>`;

/** Botón volver (flecha): 'gris' con canto (chat), 'blanco' con canto y sombra (sobre el mapa), 'claro' plano (Cobros). */
function botonVolver({ tono, x, y, w, h, canto = 0, className = '' }: { tono: 'gris' | 'blanco' | 'claro'; x: number; y: number; w: number; h: number; canto?: number; className?: string }): string {
  return `<span class="${cls('ap-eb-volver', className)}" data-tono="${tono}" data-boton="volver" style="left:${x}px;top:${y}px;width:${w}px;height:${h + canto}px">`
    + (canto ? `<span class="ap-eb-volver-canto" style="top:${canto}px;height:${h}px"></span>` : '')
    + `<span class="ap-eb-volver-cara" style="height:${h}px">${icono('flecha-izq', { tam: 24, trazo: 2.3 })}</span></span>`;
}

/** Cuadrito con ícono azul: ficha gris con canto (tarjetas de trabajo y movimientos), celeste o verde planos. */
function cuadroIcono(ic: Icono, { tono = 'gris', h, canto = 0, tam = 24, trazo = 2.1 }: { tono?: 'gris' | 'celeste' | 'verde' | 'celeste-canto'; h: number; canto?: number; tam?: number; trazo?: number }): string {
  return `<span class="ap-eb-cuadro" data-tono="${tono}">`
    + (canto ? `<span class="ap-eb-cuadro-canto" style="top:${canto}px;height:${h}px"></span>` : '')
    + `<span class="ap-eb-cuadro-cara" style="height:${h}px">${icono(ic, { tam, trazo })}</span></span>`;
}

/** El dibujo de la "foto" del caño (U con la gota), en la grilla de 158,4 × 119,3 de 12-e-chat-2; se escala con `ancho`.
    Ganchos: .ap-eb-cano · .ap-eb-cano-gota / .ap-eb-cano-gotita (las gotas: caen con y/opacity, origen al centro). */
export function dibujoCano({ ancho = 158.4, className = '' }: { ancho?: number; className?: string } = {}): string {
  const alto = (ancho * 119.3) / 158.4;
  const caño = 'M79.6 28.6V54.3a14.5 14.5 0 0 0 14.5 14.5h17.3v23.6';
  return `<svg class="${cls('ap-eb-cano', className)}" viewBox="0 0 158.4 119.3" width="${ancho.toFixed(1)}" height="${alto.toFixed(1)}" aria-hidden="true">`
    + '<rect width="158.4" height="119.3" fill="#DCE3EC"/><rect width="158.4" height="29.1" fill="#C9D2DE"/>'
    + `<path d="${caño}" fill="none" stroke="#F4F6F9" stroke-width="14.6" stroke-linecap="round"/>`
    + `<path d="${caño}" fill="none" stroke="#9AA6B6" stroke-width="2.6" stroke-linecap="round"/>`
    + '<circle class="ap-eb-cano-gota" cx="111.4" cy="103.4" r="3.9" fill="#6FB5FF" style="transform-box:fill-box;transform-origin:50% 50%"/>'
    + '<circle class="ap-eb-cano-gotita" cx="103.4" cy="111.4" r="2.6" fill="#6FB5FF" style="transform-box:fill-box;transform-origin:50% 50%"/>'
    + '</svg>';
}

/** Tarjeta-ticket de la cuenta (15-e-trabajo «Tu cuenta del trabajo», 19-e-fin «Plomería · La Perla»): cuadrito con
    ícono, título, detalle, etiqueta opcional, muescas con punteado y el desglose (ui/desglose.ts). Relativo a la tarjeta:
    cuadrito (18,3 · 15,7 · 52,3 × 51 + canto 4) · título x 84,6 · punteado y 82,1 · primera fila con la base a 115. */
function tarjetaCuenta({ titulo, detalle, ic, etiquetaHtml = '', total, className = '', estilo = '' }:
  { titulo: string; detalle: string; ic: Icono; etiquetaHtml?: string; total?: TotalDesglose; className?: string; estilo?: string }): string {
  return `<div class="${cls('ap-eb-cuenta', 'ap-tarjeta', className)}" style="${estilo}">`
    + cuadroIcono(ic, { h: 51, canto: 4, tam: ic === 'canilla' ? 25 : 27, trazo: 2.1 })
    + `<span class="ap-eb-cuenta-titulo">${esc(titulo)}</span><span class="ap-eb-cuenta-detalle">${esc(detalle)}</span>`
    + (etiquetaHtml ? `<span class="ap-eb-cuenta-etiqueta">${etiquetaHtml}</span>` : '')
    + '<span class="ap-eb-cuenta-muesca" data-lado="izq"></span><span class="ap-eb-cuenta-muesca" data-lado="der"></span>'
    + '<span class="ap-eb-cuenta-punteado"></span>'
    + `<div class="ap-eb-cuenta-desglose">${desglose({ filas: FILAS_CUENTA, total })}</div>`
    + '</div>';
}

/** Hace entrar algo de abajo (y + opacity) con un rebote corto. Es una entrada: queda oculto desde que se arma el timeline. */
const entrar = (tl: GSAPTimeline, el: Element | null, at: number, { y = 24, dur = 0.4 }: { y?: number; dur?: number } = {}) => {
  if (el) tl.fromTo(el, { y, opacity: 0 }, { y: 0, opacity: 1, duration: dur, ease: 'back.out(1.4)' }, at);
};

/* ───────────────────────────── avisos ───────────────────────────── */

/** Aviso «¡El cliente te eligió!» (11-e-chat): círculo verde con la tilde. Capa [data-pantalla="aviso-te-eligio"]. */
export function avisoTeEligio(): string {
  return aviso({ titulo: '¡El cliente te eligió!', detalle: 'Plomería en La Perla. Ya podés ir para allá.', icono: 'tilde', tono: 'verde', dato: 'te-eligio' });
}

/** Aviso «Cobro registrado» (19-e-fin): círculo verde con la billetera. Capa [data-pantalla="aviso-cobro"]. */
export function avisoCobro(): string {
  return aviso({ titulo: 'Cobro registrado', detalle: `${pesos(CUENTA_TRABAJO.recibis)} directo a tu cuenta.`, icono: 'billetera', tono: 'verde', dato: 'cobro' });
}

/* ───────────────────────────── 20/21-e-turnos · Tu agenda ───────────────────────────── */

/* pantallaAgendaEsp()   20/21-e-turnos · [data-pantalla="e-agenda"]
     Encabezado blanco (campana y pin, sin globito), «Tu agenda» con «agenda» subrayado, noviembre 2026 con el martes 17
     elegido (ui/calendario.ts), «MARTES 17/11 · 1 TRABAJO» y la tarjeta del trabajo; pestaña Agenda prendida.
     Ganchos y posición medida (px de la pantalla 414×896):
       .ap-encabezado (0 · 0 · 414 × 124) — campana (273,9 · 54,9) y pin (336,9 · 54,9), 53,5 + canto 4,4
       .ap-eb-ag-titulo «Tu agenda» (24 · 132,4 · 167,3 × 28; tinta de 136 a 160) · .ap-resalte-banda bajo «agenda»
         (66,7 · 146,4 · 127,5 × 12,6; dibujarla con scaleX)
       .ap-cal.ap-eb-ag-cal (23 · 178,3 · 368 × 362) — .ap-cal-dia[data-dia="17"] (131,7 · 375,8 · 47,5 × 45 + canto 3,5;
         centro 155,5 · 398,3) con su .ap-cal-sel en 1 · [data-dia="19"] (234,2 · 375,8; centro 258 · 398,3) · elegirDia
         (ui/calendario.ts) cruza la elegida
       .ap-eb-ag-rotulo «MARTES 17/11 · 1 TRABAJO» (24,7 · 556,6 · 174,6 × 12)
       .ap-eb-ag-turno (23,7 · 582,7 · 367 × 146,3 + canto 4,3; para que entre: y/opacity) — .ap-eb-cuadro con la canilla
         (39,3 · 606 · 51 × 51,3 + canto 3,4) · .ap-eb-ag-turno-titulo «Arreglo de caño de / cocina» (104,7 · 594,8 ·
         134,6 × 34,6) · .ap-eb-ag-turno-lugar · .ap-eb-ag-turno-hora · .ap-eb-ag-turno-monto «+ $ 40.500» (verde,
         292 · 615,3 · 84 × 16) · .ap-eb-ag-turno-estado «Confirmado» (312,5 · 634,9) · .ap-eb-ag-turno-mas «Ver más
         información» (23,7 · 681 · 367 × 48; centro 207 · 705)
       .ap-barra (0 · 812 · 414 × 84) con Agenda prendida (.ap-barra-item[data-tab="agenda"] 108,5 → 207; ícono centro 157,8 · 839,5) */
export function pantallaAgendaEsp(): string {
  const turno = '<div class="ap-eb-ag-turno ap-abs" data-turno="17">'
    + '<span class="ap-eb-ag-turno-canto"></span>'
    + '<div class="ap-eb-ag-turno-cara">'
    + cuadroIcono('canilla', { h: 51.3, canto: 3.4, tam: 25, trazo: 2.1 })
    + '<span class="ap-eb-ag-turno-titulo">Arreglo de caño de<br>cocina</span>'
    + '<span class="ap-eb-ag-turno-lugar">Plomería · La Perla</span>'
    + `<span class="ap-eb-ag-turno-hora">${icono('reloj', { tam: 13, trazo: 2.2 })}<span>de 16 a 18 h</span></span>`
    + `<span class="ap-eb-ag-turno-monto">+ ${pesos(CUENTA_TRABAJO.recibis)}</span>`
    + '<span class="ap-eb-ag-turno-estado">Confirmado</span>'
    + '<span class="ap-eb-ag-turno-mas">Ver más información</span>'
    + '</div></div>';
  return capa('e-agenda', 'ap-eb-agenda',
    encabezado({ variante: 'blanco', campana: false })
    + tituloResaltado({ texto: 'Tu agenda', resaltar: 'agenda', tam: 28, ancho: 110, className: 'ap-abs ap-eb-ag-titulo' })
    + calendarioMes({ className: 'ap-abs ap-eb-ag-cal' })
    + rotulo('Martes 17/11 · 1 trabajo', { className: 'ap-abs ap-eb-ag-rotulo' })
    + turno
    + barraInferior({ activa: 'agenda' }));
}

/* ───────────────────────────── 11/12-e-chat · chat con el cliente ───────────────────────────── */

/** Mensajes del chat (lado del especialista), con el `top` de cada fila en el paso 2 (12-e-chat-2, −18). */
const MENSAJES = [
  { dato: 'hola', top: 267.6, html: () => burbuja({ texto: '¡Hola! Te elegí para arreglar la pérdida de la cocina.', lado: 'izq', app: 'especialista' }) },
  { dato: 'foto', top: 335.4, html: () => tarjetaFoto({ lado: 'izq', app: 'especialista' }) },
  { dato: 'venis', top: 505.6, html: () => burbuja({ texto: '¿Venís hoy? Te espero.', lado: 'izq', app: 'especialista' }) },
  { dato: 'salgo', top: 554.3, html: () => burbuja({ texto: '¡Hola! Salgo para allá en la franja que te marqué.', lado: 'der', tono: 'azul', app: 'especialista' }) },
  { dato: 'genial', top: 622.4, html: () => burbuja({ texto: '¡Genial! Te espero.', lado: 'izq', app: 'especialista' }) },
] as const;

/** Corrimiento del hilo en cada paso (el chat está pegado abajo: lo nuevo empuja lo viejo hacia arriba). */
export const CHAT_CLIENTE = { corrimiento: [116.3, 46, 0] as readonly number[], atajo: 130.3, fecha: 234.7 } as const;

/* pantallaChatCliente({ paso = 2 })   11/12-e-chat · [data-pantalla="e-chat-cliente"]
     paso 0 = 11-e-chat (el cliente escribió: hola, la foto y «¿Venís hoy? Te espero.»; atajo «Salgo para allá» a mano) ·
     1 = el especialista contestó «¡Hola! Salgo para allá…» (el atajo se fue) · 2 = 12-e-chat-2 (el cliente: «¡Genial! Te espero.»).
     La capa trae TODO: los mensajes que faltan en el paso están en opacity 0 y el hilo corrido en y; avanzarChatCliente los cruza.
     Ganchos y posición medida (paso 2; en el paso 0 el hilo baja 116,3 y en el 1, 46: sumar a las y del hilo):
       .ap-eb-chat-cabeza (0 · 0 · 414 × 119, esquinas de abajo r 28) — .ap-eb-volver[data-boton="volver"] (21,3 · 52,4 ·
         52 × 52,4 + canto 4; centro 47,3 · 78,6; apretar: .ap-eb-volver-cara y = 4) · .ap-eb-chat-avatar LP (87,7 · 58,9 ·
         39,3) · .ap-eb-chat-nombre «Cliente · La Perla» (141 · 61,4 · 139,6 × 17,3) · .ap-eb-chat-detalle «Plomería · hoy,
         de 16 a 18 h» (141 · 83,9 · 156,4 × 13)
       .ap-eb-chat-hilo (y = corrimiento del paso) — .ap-eb-chat-msj[data-msj="fecha|hola|foto|venis|salgo|genial"] (fila
         absoluta de x 20 a 394,4 con la .ap-burbuja adentro; entrar: opacity de la fila + scale de la burbuja):
         fecha «Hoy» (188,2 · 234,7 · 37,7 × 19,5) · hola (20 · 267,6 · 300 × 58,5) · foto (20 · 335,4 · 270,6 × 159,9;
         .ap-foto-gota / .ap-foto-gotita caen) · venis (20 · 505,6 · 179,2 × 36,9) · salgo (azul, 94,4 · 554,3 · 300 × 58,5) ·
         genial (20 · 622,4 · 149,6 × 36,9)
       .ap-eb-chat-panel (0 · 672 · 414 × 224, arriba r 28) — .ap-eb-chat-acciones:
         .ap-boton[data-accion="programar"] (19,6 · 685,3 · 158,9 × 50,7) · [data-accion="turno-ahora"] (186,5 · 685,3 ·
         195,3 × 50,7) · .ap-eb-chat-atajo[data-atajo="salgo"] (19,6 · 756 · 121,1 × 49,4; centro 80,2 · 780,7; apretado:
         su .ap-chip-sel) · [data-atajo="llave"] (149,7 · 756 · 115,4) · [data-atajo="timbre"] (274,1 · 756 · 114,6); en los
         pasos 1 y 2 llave y timbre van con x −130,3 (CHAT_CLIENTE.atajo)
       .ap-eb-chat-campo (19,6 · 823): .ap-campo-adjuntar (19,6 · 823 · 52) · .ap-campo-entrada (81,6 · 823 · 250,4 × 50)
         con .ap-campo-placeholder / .ap-campo-escrito (opacity) · .ap-campo-enviar (342 · 823 · 52,4 + canto 4; centro
         368,2 · 849,2; apretar: .ap-campo-enviar-cara y = 4) */
export function pantallaChatCliente({ paso = 2 }: { paso?: 0 | 1 | 2 } = {}): string {
  const ve = (i: number) => (i < 3 || (i === 3 && paso >= 1) || (i === 4 && paso >= 2) ? 1 : 0);
  const hilo = `<div class="ap-eb-chat-hilo" style="transform:translate(0px, ${CHAT_CLIENTE.corrimiento[paso]}px)">`
    + `<div class="ap-eb-chat-msj ap-eb-chat-fecha" data-msj="fecha" style="top:${CHAT_CLIENTE.fecha}px">${fechaChat('Hoy')}</div>`
    + MENSAJES.map((m, i) => `<div class="ap-eb-chat-msj" data-msj="${m.dato}" style="top:${m.top}px;opacity:${ve(i)}">${m.html()}</div>`).join('')
    + '</div>';
  const corre = paso >= 1 ? -CHAT_CLIENTE.atajo : 0;
  const atajo = (dato: string, texto: string, estilo: string) =>
    `<span class="ap-eb-chat-atajo" data-atajo="${dato}" style="${estilo}">${chip({ texto, tono: 'celeste', tam: 'm', className: 'ap-acciones-chip' })}</span>`;
  const acciones = '<div class="ap-acciones">'
    + '<div class="ap-acciones-fila">'
    + boton({ texto: 'Programar turno', icono: 'agenda', variante: 'azul', tam: 'pildora', alto: 50.7, canto: 0, accion: 'programar' })
    + boton({ texto: 'Quiero un turno ahora', icono: 'alerta', variante: 'amarillo', tam: 'pildora', alto: 50.7, canto: 0, accion: 'turno-ahora' })
    + '</div><div class="ap-acciones-fila" data-fila="2">'
    + atajo('salgo', 'Salgo para allá', `opacity:${paso >= 1 ? 0 : 1}`)
    + atajo('llave', 'Llave de paso', `transform:translate(${corre}px, 0px)`)
    + atajo('timbre', '¿Qué timbre?', `transform:translate(${corre}px, 0px)`)
    + '</div></div>';
  return capa('e-chat-cliente', 'ap-eb-chat',
    hilo
    + '<div class="ap-eb-chat-cabeza">'
    + botonVolver({ tono: 'gris', x: 21.3, y: 52.4, w: 52, h: 52.4, canto: 4 })
    + `<span class="ap-eb-chat-avatar">${avatar({ iniciales: 'LP', tono: 'azul', tam: 39.3 })}</span>`
    + '<span class="ap-eb-chat-nombre">Cliente · La Perla</span>'
    + '<span class="ap-eb-chat-detalle">Plomería · hoy, de 16 a 18 h</span>'
    + '</div>'
    + `<div class="ap-eb-chat-panel"><div class="ap-eb-chat-acciones">${acciones}</div>`
    + `<div class="ap-eb-chat-campo">${campoMensaje({ boton: 'imagen' })}</div></div>`);
}

/** Al construir la escena: deja el chat en un paso (gsap.set). */
export function ponerChatCliente(capaEl: Element, paso: 0 | 1 | 2): void {
  const q = (s: string) => capaEl.querySelector(s);
  gsap.set(q('.ap-eb-chat-hilo'), { y: CHAT_CLIENTE.corrimiento[paso] });
  gsap.set(q('[data-msj="salgo"]'), { opacity: paso >= 1 ? 1 : 0 });
  gsap.set(q('[data-msj="genial"]'), { opacity: paso >= 2 ? 1 : 0 });
  gsap.set(q('[data-atajo="salgo"]'), { opacity: paso >= 1 ? 0 : 1, scale: 1 });
  gsap.set([q('[data-atajo="llave"]'), q('[data-atajo="timbre"]')], { x: paso >= 1 ? -CHAT_CLIENTE.atajo : 0 });
}

/** Avanza el chat UN paso hasta `paso`: 1 = el especialista toca «Salgo para allá» (el atajo se aprieta y se va, los otros
    se corren, su burbuja azul entra y el hilo sube) · 2 = llega «¡Genial! Te espero.» (entra y el hilo sube). Devuelve la duración. */
export function avanzarChatCliente(tl: GSAPTimeline, capaEl: Element, paso: 1 | 2, at: number): number {
  const q = (s: string) => capaEl.querySelector(s);
  const hilo = q('.ap-eb-chat-hilo');
  const sube = (t: number) => tl.fromTo(hilo, { y: CHAT_CLIENTE.corrimiento[paso - 1] }, { y: CHAT_CLIENTE.corrimiento[paso], duration: 0.4, ease: 'power2.out', immediateRender: false }, t);
  const llega = (fila: Element | null, t: number) => {
    if (!fila) return;
    tl.fromTo(fila, { opacity: 0 }, { opacity: 1, duration: 0.18, ease: 'power1.out', immediateRender: false }, t);
    tl.fromTo(fila.querySelector('.ap-burbuja'), { scale: 0.8, y: 12 }, { scale: 1, y: 0, duration: 0.4, ease: 'back.out(1.8)', immediateRender: false }, t);
  };
  if (paso === 1) {
    const salgo = q('[data-atajo="salgo"]');
    tl.fromTo(salgo?.querySelector('.ap-chip-sel') ?? null, { opacity: 0 }, { opacity: 1, duration: 0.12, ease: 'power1.out', immediateRender: false }, at);
    tl.fromTo(salgo, { scale: 1 }, { scale: 0.92, duration: 0.12, ease: 'power2.out', yoyo: true, repeat: 1, immediateRender: false }, at);
    tl.fromTo(salgo, { opacity: 1 }, { opacity: 0, duration: 0.2, ease: 'power1.in', immediateRender: false }, at + 0.3);
    tl.fromTo([q('[data-atajo="llave"]'), q('[data-atajo="timbre"]')], { x: 0 }, { x: -CHAT_CLIENTE.atajo, duration: 0.4, ease: 'power3.inOut', immediateRender: false }, at + 0.42);
    sube(at + 0.3);
    llega(q('[data-msj="salgo"]'), at + 0.36);
    return 0.82;
  }
  sube(at);
  llega(q('[data-msj="genial"]'), at + 0.06);
  return 0.46;
}

/* ───────────────────────────── 13/14-e-en-camino ───────────────────────────── */

export type EstadoCamino = 'camino' | 'llegaste';

/** Geometría del en camino (px de la pantalla): el «Vos» va sobre la ruta (x fija) y sube una cuadra al llegar. */
export const EN_CAMINO = {
  vos: { x: 158.7, y: 234, llegaste: -57 },
  ruta: [[158.7, 100], [158.7, 330]] as const,
  vista: { x: -8.5, y: -431.8, escala: 1.04 },
  // personita: x de su centro relativa a la barra de pasos (que arranca en x 23,7)
  persona: { camino: 110.5, llegaste: 354 },
  progreso: 0.858,
} as const;

/* pantallaEnCamino({ estado = 'camino' })   13/14-e-en-camino · [data-pantalla="e-en-camino"]
     El mapa acercado (vista de 14-e-en-camino-2) con la ruta azul vertical, el «Vos», la píldora «a 2,3 km», el volver y el
     encabezado azul con la campana sola; el panel azul VAS PARA ALLÁ · Catamarca 1650, La Perla · Hoy, de 16 a 18 h, los
     pasos Saliste · En camino · Llegaste, la tarjeta «Vas en camino» y la del cliente. Sin las cajas SIMULAR (DEMO).
     estado 'camino' = 14-e-en-camino-2 · 'llegaste' = los tres tramos llenos, la personita en «Llegaste», el «Vos» una
     cuadra más arriba, la píldora «Llegaste» y la tarjeta «¡Llegaste!». Los dos estados vienen apilados: llegarEnCamino
     los cruza y ponerEnCamino los pone.
     Ganchos y posición medida:
       .ap-mapa (pantalla entera; vista x −8,5 · y −431,8 · ×1,04) — .ap-mapa-ruta (x 158,7, de 100 a 330, 6 de grueso)
       .ap-eb-cam-vos (centro 158,7 · 234; disco azul de 28,5 con «Vos» y halo blanco de 40): moverlo con y por la ruta
         (llegar: y −57 → centro 158,7 · 177)
       .ap-encabezado[data-variante="azul"] (0 · 0 · 414 × 124) — campana sola (336,9 · 54,9 · 53,5)
       .ap-eb-volver[data-boton="volver"] (17 · 140 · 49,7 × 50 + canto 4; centro 41,9 · 165)
       .ap-eb-cam-distancia[data-estado="camino"] «a 2,3 km» (307,5 · 128,3 · 94,5 × 27,4) / [data-estado="llegaste"]
         «Llegaste» (305,2 · 128,3 · 96,8 × 27,4), apiladas (opacity)
       .ap-eb-cam-panel (0 · 306 → abajo, r 40; para que suba: y) — .ap-eb-cam-asa (178,3 · 318,3 · 57,7 × 4,7) ·
         .ap-eb-cam-rotulo «VAS PARA ALLÁ» (24 · 341,4) · .ap-eb-cam-titulo (24 · 360,4 · 260 × 52,6) · .ap-eb-cam-hora
         (24,8 · 418,4 · 131 × 15,4) · .ap-pasos.ap-eb-cam-pasos (23,7 · 453,6 · 366,4 × 59,4; tramos en y 484,3 de 7,3:
         [data-tramo="0"] 23,7 → 107,1 · "1" 115,1 → 298,6 · "2" 306,7 → 390; .ap-pasos-relleno scaleX ·
         .ap-pasos-completo opacity · .ap-pasos-icono 23,7 × 23,7 en x 122,4 (camino) → 365,8 (llegaste), y 453,6 ·
         .ap-pasos-etiqueta[data-etiqueta="2"] con su capa prendida en «Llegaste»)
         .ap-eb-cam-aviso[data-estado="camino|llegaste"] (23,7 · 530,7 · 366,3 × 86; apiladas, opacity) ·
         .ap-eb-cam-cliente (23,7 · 635,3 · 366,3 × 83,4) — .ap-eb-cam-cliente-avatar LP (38,3 · 650,8 · 51,7) ·
         .ap-eb-cam-cliente-chat (botón redondo azul 326 · 651,7 · 50; centro 351 · 676,7) */
export function pantallaEnCamino({ estado = 'camino' }: { estado?: EstadoCamino } = {}): string {
  const lleg = estado === 'llegaste';
  const ve = (e: EstadoCamino) => `opacity:${e === estado ? 1 : 0}`;
  const tarjeta = (e: EstadoCamino, ic: Icono, tono: 'celeste' | 'verde', titulo: string, texto: string) =>
    `<div class="ap-eb-cam-aviso" data-estado="${e}" style="${ve(e)}">`
    + cuadroIcono(ic, { tono, h: 45.3, tam: 22.5, trazo: 2.1 })
    + `<span class="ap-eb-cam-aviso-titulo">${titulo}</span><p class="ap-eb-cam-aviso-texto">${texto}</p></div>`;
  return capa('e-en-camino', 'ap-eb-camino',
    mapa({ estado: 'color', ambos: false, vista: EN_CAMINO.vista, yo: false, ruta: EN_CAMINO.ruta })
    + `<span class="ap-eb-cam-vos" style="left:${EN_CAMINO.vos.x}px;top:${EN_CAMINO.vos.y}px;transform:translate(0px, ${lleg ? EN_CAMINO.vos.llegaste : 0}px)">`
    + '<span class="ap-eb-cam-vos-halo"></span><span class="ap-eb-cam-vos-disco"><span class="ap-eb-cam-vos-texto">Vos</span></span></span>'
    + encabezado({ variante: 'azul', campana: false, ubicacion: false })
    + botonVolver({ tono: 'blanco', x: 17, y: 140, w: 49.7, h: 50, canto: 4 })
    + `<span class="ap-eb-cam-distancia" data-estado="camino" style="${ve('camino')}">${icono('pin', { tam: 15, trazo: 2.3 })}<span>a 2,3 km</span></span>`
    + `<span class="ap-eb-cam-distancia" data-estado="llegaste" style="${ve('llegaste')}">${icono('verificado', { tam: 15.5, trazo: 2.3 })}<span>Llegaste</span></span>`
    + '<div class="ap-eb-cam-panel">'
    + '<span class="ap-eb-cam-asa"></span>'
    + rotulo('Vas para allá', { className: 'ap-eb-cam-rotulo' })
    + '<span class="ap-eb-cam-titulo ap-display">Catamarca 1650,<br>La Perla</span>'
    + `<span class="ap-eb-cam-hora">${icono('reloj', { tam: 15.4, trazo: 2.2 })}<span>Hoy, de 16 a 18 h</span></span>`
    + pasos({
      etiquetas: ['Saliste', 'En camino', 'Llegaste'], variante: 'especialista', actual: lleg ? 2 : 1, progreso: lleg ? 1 : EN_CAMINO.progreso,
      persona: lleg ? EN_CAMINO.persona.llegaste : EN_CAMINO.persona.camino, prendida: lleg ? 2 : -1, className: 'ap-eb-cam-pasos',
    })
    + tarjeta('camino', 'caminando', 'celeste', 'Vas en camino', 'Cuando llegues al domicilio, el trabajo<br>empieza solo y le avisamos al cliente.')
    + tarjeta('llegaste', 'tilde', 'verde', '¡Llegaste!', 'Ya empezó el trabajo y le avisamos al<br>cliente. ¡A darle!')
    + '<div class="ap-eb-cam-cliente">'
    + `<span class="ap-eb-cam-cliente-avatar">${avatar({ iniciales: 'LP', tono: 'azul', tam: 51.7 })}</span>`
    + '<span class="ap-eb-cam-cliente-nombre">Cliente · La Perla</span>'
    + '<p class="ap-eb-cam-cliente-texto">Hablan por el chat de Handy, sin<br>pasarse los teléfonos.</p>'
    + `<span class="ap-eb-cam-cliente-chat" data-boton="chat">${icono('mensajes', { tam: 25, trazo: 2.1 })}</span>`
    + '</div></div>');
}

const partesCamino = (capaEl: Element) => {
  const q = (s: string) => capaEl.querySelector(s);
  const pas = q('.ap-pasos');
  return {
    vos: q('.ap-eb-cam-vos'),
    icono: pas?.querySelector('.ap-pasos-icono') ?? null,
    relleno1: pas?.querySelector('[data-tramo="1"] .ap-pasos-relleno') ?? null,
    completo1: pas?.querySelector('[data-tramo="1"] .ap-pasos-completo') ?? null,
    relleno2: pas?.querySelector('[data-tramo="2"] .ap-pasos-relleno') ?? null,
    etiquetaOn: pas?.querySelector('[data-etiqueta="2"] .ap-pasos-etiqueta-prendida') ?? null,
    etiquetaOff: pas?.querySelector('[data-etiqueta="2"] .ap-pasos-etiqueta-apagada') ?? null,
    camino: [...capaEl.querySelectorAll('[data-estado="camino"]')],
    llegaste: [...capaEl.querySelectorAll('[data-estado="llegaste"]')],
  };
};

/** Al construir la escena: deja el en camino en un estado (gsap.set; la x de la personita es su borde izquierdo). */
export function ponerEnCamino(capaEl: Element, estado: EstadoCamino): void {
  const p = partesCamino(capaEl), lleg = estado === 'llegaste';
  gsap.set(p.vos, { y: lleg ? EN_CAMINO.vos.llegaste : 0 });
  gsap.set(p.icono, { x: (lleg ? EN_CAMINO.persona.llegaste : EN_CAMINO.persona.camino) - 11.85, y: 0 });
  gsap.set(p.relleno1, { scaleX: lleg ? 1 : EN_CAMINO.progreso });
  gsap.set(p.completo1, { opacity: lleg ? 1 : 0 });
  gsap.set(p.relleno2, { scaleX: lleg ? 1 : 0 });
  gsap.set(p.etiquetaOn, { opacity: lleg ? 1 : 0 });
  gsap.set(p.etiquetaOff, { opacity: lleg ? 0 : 1 });
  gsap.set(p.camino, { opacity: lleg ? 0 : 1 });
  gsap.set(p.llegaste, { opacity: lleg ? 1 : 0 });
}

/** De «En camino» a «Llegaste»: el «Vos» sube por la ruta, la personita camina hasta el final llenando los tramos, se
    prende «Llegaste» y se cruzan la píldora y la tarjeta. Devuelve la duración (≈ dur + 0,45). */
export function llegarEnCamino(tl: GSAPTimeline, capaEl: Element, at: number, { dur = 1.4 }: { dur?: number } = {}): number {
  const p = partesCamino(capaEl);
  const o = { immediateRender: false };
  tl.fromTo(p.vos, { y: 0 }, { y: EN_CAMINO.vos.llegaste, duration: dur, ease: 'power1.inOut', ...o }, at);
  tl.fromTo(p.icono, { x: EN_CAMINO.persona.camino - 11.85 }, { x: EN_CAMINO.persona.llegaste - 11.85, duration: dur, ease: 'power1.inOut', ...o }, at);
  const t1 = dur * 0.22;
  tl.fromTo(p.relleno1, { scaleX: EN_CAMINO.progreso }, { scaleX: 1, duration: t1, ease: 'none', ...o }, at);
  tl.fromTo(p.completo1, { opacity: 0 }, { opacity: 1, duration: 0.15, ease: 'power1.out', ...o }, at + t1);
  tl.fromTo(p.relleno2, { scaleX: 0 }, { scaleX: 1, duration: dur - t1 - 0.05, ease: 'power1.inOut', ...o }, at + t1 + 0.05);
  tl.fromTo(p.etiquetaOn, { opacity: 0 }, { opacity: 1, duration: 0.2, ...o }, at + dur);
  tl.fromTo(p.etiquetaOff, { opacity: 1 }, { opacity: 0, duration: 0.2, ...o }, at + dur);
  // lo nuevo entra encima (va después en el DOM) y recién cuando está entero se apaga lo viejo: no se transparenta el azul
  tl.fromTo(p.llegaste, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'power1.out', ...o }, at + dur);
  tl.fromTo(p.camino, { opacity: 1 }, { opacity: 0, duration: 0.05, ...o }, at + dur + 0.3);
  const card = p.llegaste.find(e => e.classList.contains('ap-eb-cam-aviso'));
  if (card) tl.fromTo(card, { scale: 0.94 }, { scale: 1, duration: 0.4, ease: 'back.out(2)', ...o }, at + dur);
  return dur + 0.45;
}

/* ───────────────────────────── 15-e-trabajo ───────────────────────────── */

/** Alto de cada dígito del cronómetro (paso de las tiras, px). */
export const CRONO_DIGITO = 19;
/** Cuántos dígitos tiene cada rueda antes de volver a 0 (decenas de minuto y de segundo hasta 5). */
const RUEDAS = [6, 10, 6, 10] as const;
const digitos = (seg: number) => {
  const m = Math.floor(seg / 60) % 60, s = seg % 60;
  return [Math.floor(m / 10), m % 10, Math.floor(s / 10), s % 10];
};

/** Píldora del cronómetro (15-e-trabajo): punto rojo que late + «mm:ss». Cada dígito es una rueda (.ap-eb-crono-rueda,
    ventana de 9,9 × 19) con su tira vertical 0…9,0 (.ap-eb-crono-tira, y = −dígito × 19): la escena gira los dígitos solo
    con transform (correrCronometro). Ganchos: .ap-eb-crono · .ap-eb-crono-punto · .ap-eb-crono-halo (late: scale/opacity) ·
    .ap-eb-crono-rueda[data-rueda="0..3"] · .ap-eb-crono-tira. */
export function cronometro({ segundos = 1, className = '' }: { segundos?: number; className?: string } = {}): string {
  const d = digitos(segundos);
  const rueda = (i: number) => `<span class="ap-eb-crono-rueda" data-rueda="${i}"><span class="ap-eb-crono-tira" style="transform:translate(0px, ${-d[i] * CRONO_DIGITO}px)">`
    + Array.from({ length: RUEDAS[i] + 1 }, (_, k) => `<span>${k % RUEDAS[i]}</span>`).join('') + '</span></span>';
  return `<span class="${cls('ap-eb-crono', className)}" data-segundos="${segundos}">`
    + '<span class="ap-eb-crono-halo"></span><span class="ap-eb-crono-punto"></span>'
    + `<span class="ap-eb-crono-digitos">${rueda(0)}${rueda(1)}<span class="ap-eb-crono-dos">:</span>${rueda(2)}${rueda(3)}</span></span>`;
}

const tiras = (el: Element) => [...el.querySelectorAll<HTMLElement>('.ap-eb-crono-tira')];

/** Al construir la escena: pone el cronómetro en `segundos` (gsap.set). */
export function ponerCronometro(el: Element, segundos: number): void {
  const d = digitos(segundos);
  tiras(el).forEach((t, i) => gsap.set(t, { y: -d[i] * CRONO_DIGITO }));
}

/** Corre el cronómetro de `desde` a `hasta` segundos: un tic cada `paso` s del timeline (paso < 1 = tiempo acelerado), cada
    dígito que cambia gira hacia arriba en `giro` s y llega justo en el tic. Devuelve la duración ((hasta − desde) × paso). */
export function correrCronometro(tl: GSAPTimeline, el: Element, desde: number, hasta: number, at: number, { paso = 1, giro = 0.16 }: { paso?: number; giro?: number } = {}): number {
  const t = tiras(el);
  const g = Math.min(giro, paso * 0.8);
  for (let s = desde + 1; s <= hasta; s++) {
    const antes = digitos(s - 1), ahora = digitos(s), cuando = at + (s - desde) * paso - g;
    ahora.forEach((d, i) => {
      if (d === antes[i] || !t[i]) return;
      const vuelta = d === 0; // 9 → 0 (o 5 → 0): gira hasta el 0 de abajo de la tira y salta al de arriba
      const hastaY = -(vuelta ? RUEDAS[i] : d) * CRONO_DIGITO;
      tl.fromTo(t[i], { y: -antes[i] * CRONO_DIGITO }, { y: hastaY, duration: g, ease: 'power2.out', immediateRender: false }, cuando);
      if (vuelta) tl.set(t[i], { y: 0 }, cuando + g);
    });
  }
  return (hasta - desde) * paso;
}

/** El punto rojo late `veces` veces (el halo crece y se apaga). Devuelve la duración. */
export function latirCronometro(tl: GSAPTimeline, el: Element, at: number, { veces = 3, periodo = 1 }: { veces?: number; periodo?: number } = {}): number {
  const halo = el.querySelector('.ap-eb-crono-halo'), punto = el.querySelector('.ap-eb-crono-punto');
  for (let k = 0; k < veces; k++) {
    const t = at + k * periodo;
    tl.fromTo(halo, { scale: 1, opacity: 1 }, { scale: 1.9, opacity: 0, duration: periodo * 0.8, ease: 'power1.out', immediateRender: false }, t);
    tl.fromTo(punto, { scale: 1.12 }, { scale: 0.8, duration: periodo * 0.8, ease: 'power1.inOut', immediateRender: false }, t);
  }
  return veces * periodo;
}

/* pantallaTrabajo({ segundos = 1, apretado = false })   15-e-trabajo · [data-pantalla="e-trabajo"]
     Logo solo (sin campana ni pin) y el cronómetro arriba a la derecha; TRABAJO EN CURSO, «Plomería / en La Perla» (con
     «La Perla» subrayado), etiquetas Urgencia · Hoy, de 16 a 18 h, «Lo que pidió el cliente» con la foto del caño,
     REPUESTOS Y MANO DE OBRA con el punteado «Agregar…», la tarjeta «Tu cuenta del trabajo» (Recibís $ 40.500), Centro de
     ayuda · Cancelar trabajo y la botonera (chat + «Terminar trabajo»). apretado: «Terminar trabajo» con la cara abajo.
     Ganchos y posición medida:
       .ap-eb-crono (306,7 · 63,3 · 83,3 × 37,4) — .ap-eb-crono-punto (318,3 · 76,7 · 10; centro 323,3 · 81,7) ·
         .ap-eb-crono-halo (late) · .ap-eb-crono-rueda[data-rueda="0".."3"] (ventanas de 9,9 × 19 en x 334,1 · 344 · 359 ·
         368,9, y 72,6) con su .ap-eb-crono-tira (ver cronometro())
       .ap-eb-trab-rotulo «TRABAJO EN CURSO» (24 · 134,3 · 137 × 12) · .ap-eb-trab-titulo (24 · 154,6 · 205 × 63,2; tinta
         159 → 216) con .ap-resalte-banda bajo «La Perla» (74,7 · 202,6 · 157 × 13; scaleX)
       .ap-eb-trab-tags (23,7 · 231 · 212,8 × 19): .ap-etiqueta[data-tono="amarillo"] «Urgencia» (82,1 de ancho) ·
         [data-tono="celeste"] «Hoy, de 16 a 18 h»
       .ap-eb-trab-pedido (23,7 · 268,3 · 366,3 × 96,7) — .ap-eb-trab-foto (35,7 · 280 · 98 × 74,3) con .ap-eb-cano-gota /
         .ap-eb-cano-gotita (caen: y/opacity)
       .ap-eb-trab-rotulo-2 (24 · 387,1) · .ap-eb-trab-agregar[data-accion="agregar"] (23,7 · 411,7 · 366,3 × 54,
         punteado; centro 207 · 438,7)
       .ap-eb-cuenta.ap-eb-trab-cuenta (23,7 · 486 · 366,3 × 264) — .ap-desglose-fila[data-fila="mano-de-obra|materiales|
         tu-presupuesto|tarifa"] (filas de 26,2 desde 44,3 · 582,9) · .ap-desglose-total «Recibís $ 40.500» (44,3 · 699,7 ·
         325 × 36,8) con .ap-desglose-total-monto
       .ap-eb-trab-link[data-link="ayuda"] (44,3 · 771 · 143,7 × 20) · [data-link="cancelar"] (226,3 · 771 · 144,3 × 20)
       .ap-eb-pie.ap-eb-trab-pie (0 · 795,3 · 414 × 100,7) — .ap-eb-pie-chat[data-boton="chat"] (23,7 · 812,3 · 60 × 59,7 +
         canto 5) · .ap-boton[data-accion="terminar-trabajo"] (94,3 · 815 · 296 × 53,7 + canto 4,7; centro 242,3 · 841,9;
         apretarBoton de ui/botones.ts) */
export function pantallaTrabajo({ segundos = 1, apretado = false }: { segundos?: number; apretado?: boolean } = {}): string {
  const terminar = boton({ texto: 'Terminar trabajo', icono: 'tilde', iconoLado: 'der', variante: 'azul', tam: 'grande', ancho: 296, alto: 53.7, canto: 4.7, accion: 'terminar-trabajo', className: 'ap-eb-trab-terminar' })
    // apretado: la cara ya baja el canto (como al final de la primera mitad de apretarBoton)
    .replace('class="ap-boton-cara" style="height:53.7px"', `class="ap-boton-cara" style="height:53.7px${apretado ? ';transform:translate(0px, 4.7px)' : ''}"`);
  return capa('e-trabajo', 'ap-eb-trabajo ap-eb-sin-botones',
    encabezado({ variante: 'blanco', campana: false, ubicacion: false })
    + cronometro({ segundos })
    + rotulo('Trabajo en curso', { className: 'ap-abs ap-eb-trab-rotulo' })
    + tituloResaltado({ texto: 'Plomería\nen La Perla', resaltar: 'La Perla', tam: 28.8, alto: '31.6px', ancho: 125, className: 'ap-abs ap-eb-trab-titulo' })
    + `<div class="ap-eb-trab-tags ap-abs">${etiqueta({ texto: 'Urgencia', icono: 'alerta' })}${etiqueta({ texto: 'Hoy, de 16 a 18 h', icono: 'reloj', tono: 'celeste' })}</div>`
    + '<div class="ap-eb-trab-pedido ap-abs">'
    + `<span class="ap-eb-trab-foto">${dibujoCano({ ancho: 98.6 })}</span>`
    + '<span class="ap-eb-trab-pedido-rotulo">Lo que pidió el cliente</span>'
    + '<p class="ap-eb-trab-pedido-texto">«Se rompió el caño de abajo de la<br>pileta de la cocina y pierde agua.»</p>'
    + '</div>'
    + rotulo('Repuestos y mano de obra', { className: 'ap-abs ap-eb-trab-rotulo-2' })
    + '<div class="ap-eb-trab-agregar ap-abs" data-accion="agregar">'
    + cuadroIcono('mas-circulo', { tono: 'celeste', h: 36.7, tam: 21, trazo: 2.1 })
    + '<span class="ap-eb-trab-agregar-texto">Agregar repuestos y/o mano de obra</span></div>'
    + tarjetaCuenta({
      titulo: 'Tu cuenta del trabajo', detalle: 'Tarifa Handy (10%)', ic: 'billetera',
      total: { texto: 'Recibís', monto: CUENTA_TRABAJO.recibis, tono: 'verde', display: false },
      className: 'ap-eb-trab-cuenta', estilo: 'left:23.7px;top:486px;height:264px',
    })
    + '<div class="ap-eb-trab-links ap-abs">'
    + `<span class="ap-eb-trab-link" data-link="ayuda">${icono('ayuda', { tam: 17, trazo: 2.2 })}<span>Centro de ayuda</span></span>`
    + `<span class="ap-eb-trab-link" data-link="cancelar">${icono('prohibido', { tam: 17, trazo: 2.4 })}<span>Cancelar trabajo</span></span>`
    + '</div>'
    + '<div class="ap-eb-pie ap-eb-trab-pie" style="top:795.3px;height:100.7px">'
    + `<span class="ap-eb-pie-chat" data-boton="chat">${cuadroIcono('mensajes', { tono: 'celeste-canto', h: 59.7, canto: 5, tam: 27, trazo: 2.1 })}</span>`
    + terminar
    + '</div>');
}

/* ───────────────────────────── 19-e-fin ───────────────────────────── */

/** Alto del caño de la ilustración del fin (px); la gota sale de filaHandys (ubicada como en handys-grupo.png). */
const FIN_CANO = 139;

/* pantallaFin()   19-e-fin · [data-pantalla="e-fin"]
     Encabezado blanco, la caja amarilla inclinada (−5°) con el Caño y la Gota (handys.ts) y el tilde verde, TRABAJO
     TERMINADO, «¡Terminaste / el trabajo!» («trabajo» subrayado), «Ganaste» y «$ 40.500» en Archivo verde, la tarjeta
     Plomería · La Perla · Hoy, 17/11 · «A tu cuenta» con el desglose (sin adicional) y la botonera Ver mi agenda /
     Volver al inicio. Va con avisoCobro() encima. entrarFin hace la entrada.
     Ganchos y posición medida:
       .ap-eb-fin-ilustracion (capa de 414 × 320) — .ap-eb-fin-cuadro (caja amarilla 156 × 148 con r 34 y rotate −5°,
         centro 206,4 · 226,4; caja exterior 122,2 · 145,9 · 168,3 × 161) · .ap-eb-fin-handys (grupo, para moverlos juntos):
         .hd-handy--cano (151,2 · 156 · 122,4 × 139, pies en 295) y .hd-handy--gota (132,1 · 227,1 · 39,1 × 50,2); sus
         partes (.hd-h-brazo, .hd-h-cara, .hd-h-humor…) se animan con handys-anim.ts · .ap-eb-fin-tilde (241,9 · 128 · 68;
         centro 275,9 · 162; disco verde de 55,2 con aro blanco de 6,4; pop con scale)
       .ap-eb-fin-rotulo «TRABAJO TERMINADO» (centrado, y 318,2 · 12) · .ap-eb-fin-titulo (centrado, 339,2 → 399,2; tinta de
         97,5 a 317,5) con .ap-resalte-banda bajo «trabajo» (152,1 · 384,6 · 139,3 × 13) · .ap-eb-fin-ganaste (y 418,4) ·
         .ap-eb-fin-monto «$ 40.500» (centrado, caja 438,5 → 485,5; tinta 92 → 321,5 · 445,5 → 484,5)
       .ap-eb-cuenta.ap-eb-fin-cuenta (24 · 506 · 366,3; sigue debajo de la botonera) — .ap-eb-cuenta-etiqueta «A tu
         cuenta» (264,6 · 536,4 · 107,4 × 17,6) · .ap-desglose-fila[data-fila] (filas de 26,2 desde 44,6 · 602,9)
       .ap-eb-pie.ap-eb-fin-pie (0 · 736 → abajo) — .ap-boton[data-accion="ver-agenda"] (24 · 752,2 · 366 × 52, plano;
         centro 207 · 778,2) · .ap-boton[data-accion="volver-inicio"] (24 · 818,7 · 366 × 53,5 + canto 4,4; centro 207 · 845,5) */
export function pantallaFin(): string {
  const [gotaFila, cano] = filaHandys(FIN_CANO).handys;
  // el caño con el borde izquierdo en x 151,2 y los pies en y 295 (medido); la gota, un poco más grande y más a la izquierda
  // que en la fila de handys-grupo.png (en 19-e-fin cuelga entre la tuerca y el borde de la caja)
  const ox = 151.2 - cano.x, oy = 295 - (cano.y + cano.altura);
  const k = 1.14;
  const gota = {
    ...gotaFila, altura: gotaFila.altura * k, ancho: gotaFila.ancho * k,
    x: gotaFila.x - (gotaFila.ancho * (k - 1)) / 2 - 17.6, y: gotaFila.y - (gotaFila.altura * (k - 1)) / 2 + 5.5,
  };
  const ubicar = (h: { x: number; y: number }) => `left:${(h.x + ox).toFixed(1)}px;top:${(h.y + oy).toFixed(1)}px`;
  return capa('e-fin', 'ap-eb-fin',
    encabezado({ variante: 'blanco', campana: false })
    + '<div class="ap-eb-fin-ilustracion">'
    + '<span class="ap-eb-fin-cuadro"></span>'
    + '<span class="ap-eb-fin-handys">'
    + handy('gota', { altura: gota.altura, className: 'ap-eb-fin-gota' }).replace('style="', `style="position:absolute;${ubicar(gota)};`)
    + handy('cano', { altura: cano.altura, className: 'ap-eb-fin-cano' }).replace('style="', `style="position:absolute;${ubicar(cano)};`)
    + '</span>'
    + `<span class="ap-eb-fin-tilde"><span class="ap-eb-fin-tilde-disco">${icono('tilde', { tam: 30, trazo: 3.4 })}</span></span>`
    + '</div>'
    + rotulo('Trabajo terminado', { className: 'ap-abs ap-eb-fin-rotulo' })
    + tituloResaltado({ texto: '¡Terminaste\nel trabajo!', resaltar: 'trabajo', tam: 28.8, alto: '30px', ancho: 125, className: 'ap-abs ap-eb-fin-titulo' })
    + '<span class="ap-eb-fin-ganaste ap-abs">Ganaste</span>'
    + `<span class="ap-eb-fin-monto ap-abs ap-display">${pesos(CUENTA_TRABAJO.recibis)}</span>`
    + tarjetaCuenta({
      titulo: 'Plomería · La Perla', detalle: 'Hoy, 17/11', ic: 'canilla',
      etiquetaHtml: etiqueta({ texto: 'A tu cuenta', tono: 'verde', icono: 'tilde' }),
      total: { texto: 'Recibís', monto: CUENTA_TRABAJO.recibis, tono: 'verde', display: false },
      className: 'ap-eb-fin-cuenta',
    })
    + '<div class="ap-eb-pie ap-eb-fin-pie">'
    + boton({ texto: 'Ver mi agenda', icono: 'agenda', variante: 'azul', tam: 'grande', ancho: 366, alto: 52, canto: 0, accion: 'ver-agenda' })
    + boton({ texto: 'Volver al inicio', variante: 'gris', tam: 'grande', ancho: 366, alto: 53.5, canto: 4.4, accion: 'volver-inicio' })
    + '</div>');
}

/** Entrada del fin: la caja amarilla crece, los Handys saltan adentro, el tilde hace pop, aparecen los textos, el monto
    late y sube la tarjeta. Devuelve la duración. */
export function entrarFin(tl: GSAPTimeline, capaEl: Element, at: number): number {
  const q = (s: string) => capaEl.querySelector(s);
  const o = {};
  tl.fromTo(q('.ap-eb-fin-cuadro'), { scale: 0.4, opacity: 0, rotation: -25 }, { scale: 1, opacity: 1, rotation: -5, duration: 0.5, ease: 'back.out(1.6)', ...o }, at);
  tl.fromTo(q('.ap-eb-fin-handys'), { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, ease: 'back.out(1.8)', ...o }, at + 0.15);
  tl.fromTo(q('.ap-eb-fin-tilde'), { scale: 0 }, { scale: 1, duration: 0.4, ease: 'back.out(2.6)', ...o }, at + 0.4);
  [q('.ap-eb-fin-rotulo'), q('.ap-eb-fin-titulo'), q('.ap-eb-fin-ganaste')].forEach((e, i) => entrar(tl, e, at + 0.45 + i * 0.08, { y: 16 }));
  tl.fromTo(q('.ap-eb-fin-titulo .ap-resalte-banda'), { scaleX: 0 }, { scaleX: 1, duration: 0.35, ease: 'power2.out', ...o }, at + 0.75);
  tl.fromTo(q('.ap-eb-fin-monto'), { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(2.2)', ...o }, at + 0.8);
  entrar(tl, q('.ap-eb-fin-cuenta'), at + 0.95, { y: 60, dur: 0.5 });
  return 1.45;
}

/* ───────────────────────────── 41-e-caja · Cobros ───────────────────────────── */

/* pantallaCobros()   41-e-caja · [data-pantalla="e-cobros"]
     Encabezado blanco, volver + «Cobros», la tarjeta oscura TU CUENTA DE COBRO (CBU / CVU •••• •••• •••• •••• 4521 ·
     Alias tu.alias.de.siempre · Editar), la línea de info y la hoja azul «Tus movimientos» con Plomería · Hoy, 17/11 ·
     + $ 40.500 · A tu cuenta abierta (desglose sin adicional, total «A tu cuenta») y el movimiento anterior asomando.
     Ganchos y posición medida:
       .ap-eb-volver.ap-eb-cob-volver (23,7 · 129,3 · 55 × 56,4, plano; centro 51,2 · 157,5) · .ap-eb-cob-titulo «Cobros»
         (96,7 · 147,4 · 91 × 20,5)
       .ap-eb-cob-tarjeta (23,7 · 201,7 · 366,6 × 194 + canto 5,3) — .ap-eb-cob-esquina (la cuña azul de arriba a la
         derecha) · .ap-boton.ap-eb-cob-editar[data-accion="editar"] (278 · 221 · 91,3 × 49 + canto 4; centro 323,7 · 245,5) ·
         .ap-eb-cob-numero (•••• × 4 + «4521»: 44,7 · 300,5 · 240 × 20,4) · .ap-eb-cob-alias (amarillo, 44,7 · 355,5 · 153,6)
       .ap-eb-cob-info (25,4 · 409,2 · 343 × 38,6; dos renglones)
       .ap-eb-cob-hoja (0 · 468,8 → abajo, #4A73B3, r 40; para que suba: y) — .ap-eb-cob-hoja-titulo «Tus movimientos»
         (centrado, y 496,9) · .ap-eb-cob-mov[data-mov="plomeria"] (17,2 · 529,2 · 379,6 × 301,2 + canto 4; entra de abajo) —
         .ap-eb-cob-mov-monto «+ $ 40.500» (296,8 · 550,6 · 84 × 16) · .ap-eb-cob-mov-detalle (32,8 · 604 · 348 × 164,4;
         .ap-desglose-fila[data-fila] y el total «A tu cuenta $ 40.500») · .ap-eb-cob-mov-menos «Ver menos» (17,2 · 780,8 ·
         379,6 × 49,6) · .ap-eb-cob-mov[data-mov="gas"] (el anterior, 17,2 · 844,1, asoma abajo) */
export function pantallaCobros(): string {
  const puntos = '<span class="ap-eb-cob-puntos">' + '<i></i>'.repeat(4) + '</span>';
  const tarjeta = '<div class="ap-eb-cob-tarjeta ap-abs">'
    + '<span class="ap-eb-cob-tarjeta-canto"></span><div class="ap-eb-cob-tarjeta-cara">'
    + '<svg class="ap-eb-cob-esquina" viewBox="0 0 366.6 194" width="366.6" height="194" aria-hidden="true">'
    + '<path d="M286.4 0H366.6V88.6Q355 91.6 343 88.2L262.4 61.7Z" fill="#1F57A8"/></svg>'
    + rotulo('Tu cuenta de cobro', { className: 'ap-eb-cob-rotulo' })
    + '<span class="ap-eb-cob-clave" data-clave="cbu">CBU / CVU</span>'
    + `<span class="ap-eb-cob-numero">${puntos.repeat(4)}<span class="ap-eb-cob-ultimos">4521</span></span>`
    + '<span class="ap-eb-cob-clave" data-clave="alias">Alias</span>'
    + '<span class="ap-eb-cob-alias">tu.alias.de.siempre</span>'
    + boton({ texto: 'Editar', icono: 'lapiz', variante: 'blanco', tam: 'pildora', ancho: 91.3, alto: 49, canto: 4, accion: 'editar', className: 'ap-eb-cob-editar' })
    + '</div></div>';
  const mov = ({ dato, top, titulo, fecha, monto, ic, abierto }: { dato: string; top: number; titulo: string; fecha: string; monto: number; ic: Icono; abierto: boolean }) => {
    const alto = abierto ? 301.2 : 78;
    return `<div class="ap-eb-cob-mov" data-mov="${dato}" style="top:${top}px;height:${alto + 4}px">`
      + `<span class="ap-eb-cob-mov-canto" style="top:4px;height:${alto}px"></span>`
      + `<div class="ap-eb-cob-mov-cara" style="height:${alto}px">`
      + cuadroIcono(ic, { h: 48, canto: 4, tam: 24, trazo: 2.1 })
      + `<span class="ap-eb-cob-mov-titulo">${esc(titulo)}</span><span class="ap-eb-cob-mov-fecha">${esc(fecha)}</span>`
      + `<span class="ap-eb-cob-mov-monto">+ ${pesos(monto)}</span><span class="ap-eb-cob-mov-estado">A tu cuenta</span>`
      + (abierto
        ? `<div class="ap-eb-cob-mov-detalle">${desglose({ filas: FILAS_CUENTA, total: { texto: 'A tu cuenta', monto, tono: 'verde', display: false } })}</div>`
          + '<span class="ap-eb-cob-mov-menos">Ver menos</span>'
        : '')
      + '</div></div>';
  };
  return capa('e-cobros', 'ap-eb-cobros',
    encabezado({ variante: 'blanco', campana: false })
    + botonVolver({ tono: 'claro', x: 23.7, y: 129.3, w: 55, h: 56.4, className: 'ap-eb-cob-volver' })
    + '<span class="ap-eb-cob-titulo ap-abs ap-display">Cobros</span>'
    + tarjeta
    + `<div class="ap-eb-cob-info ap-abs">${icono('info', { tam: 17, trazo: 2.1 })}<p>La plata de cada trabajo va directo a esta cuenta.<br>Handy retiene solo su tarifa del 10%.</p></div>`
    + '<div class="ap-eb-cob-hoja ap-abs"><span class="ap-eb-cob-hoja-asa"></span>'
    + '<span class="ap-eb-cob-hoja-titulo ap-display">Tus movimientos</span>'
    + mov({ dato: 'plomeria', top: 60.4, titulo: 'Plomería', fecha: 'Hoy, 17/11', monto: CUENTA_TRABAJO.recibis, ic: 'canilla', abierto: true })
    + mov({ dato: 'gas', top: 375.3, titulo: 'Gas', fecha: 'Jue 12/11', monto: 34200, ic: 'llama', abierto: false })
    + '</div>');
}

/* ───────────────────────────── reseña del cliente ───────────────────────────── */

/* hojaResenaCliente({ llenas = 5 })   [data-pantalla="hoja-resena-cliente"] (capa con velo, para apilar sobre e-fin)
     La hoja «Te calificaron» al estilo de 16-u-resena-2, del lado del especialista: avatar LP, «Cliente · La Perla», el
     chip Plomería, las cinco estrellas (llenas = cuántas se ven llenas), LO QUE MÁS VALORÓ con Puntual · Prolijo
     (elegidos), el comentario «¡Excelente! Rápido y prolijo.» y el botón «Listo». La hoja arranca en y 353,8 (más baja que
     la del usuario: tiene menos cosas). calificarResena hace todo de una.
     Ganchos y posición medida:
       .ap-velo (opacity) · .ap-hoja (10,6 · 353,8 → abajo; subirHoja de ui/hoja.ts) · .ap-hoja-titulo «Te calificaron»
         (70,6 · 384,2 · 272,8 × 23,8, centrado) · .ap-hoja-cerrar (X roja 342 · 377,1 · 40,5; centro 362,2 · 397,4)
       .ap-eb-res-avatar (163,6 · 430,1 · 86,7; pop con scale) · .ap-eb-res-nombre (centrado, 526,2 · 23,1 de alto) ·
         .ap-eb-res-rubro .ap-chip-rubro (157 · 558,1 · 99,9 × 27,4)
       .ap-estrellas.ap-eb-res-estrellas (53,5 · 599,8 · 306,2 × 59): .ap-estrella[data-estrella="1".."5"] (55 × 55 + canto
         4 cada 62,8: centros x 81 · 143,8 · 206,6 · 269,4 · 332,2, y 627,3) con .ap-estrella-llena (opacity; llenarEstrellas
         de ui/estrellas.ts)
       .ap-eb-res-rotulo «LO QUE MÁS VALORÓ» (centrado, y 669,7) · .ap-eb-res-chips: .ap-chip[data-chip="Puntual"]
         (134,6 · 693,2 · 72,5 × 31,2) · [data-chip="Prolijo"] (216,7 · 693,2 · 62,7 × 31,2), cada uno con su .ap-chip-sel en 1
         (elegirChip de ui/chips.ts) · .ap-eb-res-comentario (34,4 · 739,2 · 344,8 × 60; entra)
       .ap-boton[data-accion="listo"] (34,4 · 818 · 345,2 × 52, plano; centro 207 · 844) */
export function hojaResenaCliente({ llenas = 5 }: { llenas?: number } = {}): string {
  const cuerpo = '<div class="ap-eb-res">'
    + `<span class="ap-eb-res-avatar">${avatar({ iniciales: 'LP', tono: 'azul', tam: 86.7 })}</span>`
    + '<span class="ap-eb-res-nombre ap-display">Cliente · La Perla</span>'
    + `<span class="ap-eb-res-rubro">${chipRubro({ rubro: 'plomeria', tam: 'm' })}</span>`
    + estrellas({ llenas, className: 'ap-eb-res-estrellas' })
    + rotulo('Lo que más valoró', { className: 'ap-eb-res-rotulo' })
    + `<span class="ap-eb-res-chips">${chip({ texto: 'Puntual', elegido: true })}${chip({ texto: 'Prolijo', elegido: true })}</span>`
    + `<span class="ap-eb-res-comentario">${icono('mensajes', { tam: 20, trazo: 2.1 })}<p>«¡Excelente! Rápido y prolijo.»</p></span>`
    + boton({ texto: 'Listo', variante: 'azul', tam: 'grande', ancho: 345.2, alto: 52, canto: 0, accion: 'listo', className: 'ap-eb-res-listo' })
    + '</div>';
  return hoja({ titulo: 'Te calificaron', tono: 'tinta', top: 353.8, tam: 22, ancho: 112, linea: false, cuerpo, dato: 'resena-cliente', className: 'ap-eb-resena' });
}

/** La reseña completa: sube la hoja, el avatar hace pop, las estrellas se llenan de a una, se eligen Puntual y Prolijo y
    entra el comentario. Para ver el llenado, armar la hoja con hojaResenaCliente({ llenas: 0 }). Devuelve la duración. */
export function calificarResena(tl: GSAPTimeline, capaEl: Element, at: number): number {
  const q = (s: string) => capaEl.querySelector(s);
  const o = {};
  const sube = subirHoja(tl, capaEl, at);
  tl.fromTo(q('.ap-eb-res-avatar'), { scale: 0.6 }, { scale: 1, duration: 0.4, ease: 'back.out(2.2)', ...o }, at + sube * 0.6);
  const est = q('.ap-eb-res-estrellas');
  const t0 = at + sube + 0.1;
  const llenado = est ? llenarEstrellas(tl, est, t0, { hasta: 5, paso: 0.14 }) : 0;
  capaEl.querySelectorAll('.ap-eb-res-chips .ap-chip').forEach((c, i) => {
    tl.fromTo(c.querySelector('.ap-chip-sel'), { opacity: 0 }, { opacity: 1, duration: 0.2, ease: 'power1.out', ...o }, t0 + llenado + 0.1 + i * 0.18);
    tl.fromTo(c, { scale: 0.9 }, { scale: 1, duration: 0.3, ease: 'back.out(2.4)', ...o }, t0 + llenado + 0.1 + i * 0.18);
  });
  entrar(tl, q('.ap-eb-res-comentario'), t0 + llenado + 0.5, { y: 14 });
  return t0 + llenado + 0.9 - at;
}
