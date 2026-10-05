/* Pantallas del pedido del usuario, diseño 2026 (src/handy/app/DISENO.md): la hoja "¿Para cuándo lo necesitás?",
   "Contanos qué pasó", "Programá el turno" y "Buscando" con las propuestas que llegan. Armadas con los componentes de
   app/ui (y ui/ua-paso.ts); estilos en css/ua.css (prefijo ap-ua-).
   Cada función devuelve UNA capa .hd-capa de 414×896 para el `pantalla` de phoneFrame (src/handy/ui/PhoneFrame.ts),
   dibujada en su estado final. Los estados que cambian (apretada, elegida, cantidad de propuestas, texto tipeado, pie)
   son capas apiladas que se cruzan con opacity: las escenas animan solo transform y opacity. Las ayudas de timeline
   (cascadaOpciones, apretarOpcion, cerrarHoja, escribirTexto, elegirFranja, elegirDiaTira, cambiarPie, ponerBuscando,
   llegarPropuesta, latirRadar, menearLupa) reciben la capa y un tiempo absoluto y devuelven su duración.
   Datos: la historia de DISENO.md (Plomería · Urgencia · Hoy, martes 17/11 · Especialista 1/2/3 con sus precios). */
import './ui/comun.ts';
import './css/ua.css';
import { gsap } from 'gsap';
import { encabezado } from './ui/encabezado.ts';
import { hoja } from './ui/hoja.ts';
import { aviso } from './ui/aviso.ts';
import { boton } from './ui/botones.ts';
import { avatar, type TonoAvatar } from './ui/avatar.ts';
import { rotulo } from './ui/textos.ts';
import { mapa } from './ui/mapa.ts';
import { tiraDias, type TiraDia } from './ui/calendario.ts';
import { cabeceraPaso, botonVolver, pieFijo } from './ui/ua-paso.ts';
import { esc, pesos } from './ui/comun.ts';
import { icono, type Icono } from './iconos.ts';

// ── datos de la historia ─────────────────────────────────────────────────────

/** Lo que cuenta el usuario (03-u-describir). */
export const TEXTO_PEDIDO = 'Se rompió el caño de abajo de la pileta de la cocina y pierde agua.';

/** Las tres propuestas, en el orden en que llegan (total final para el usuario). */
export const PROPUESTAS: readonly { n: 1 | 2 | 3; iniciales: string; nombre: string; tono: TonoAvatar; total: number }[] = [
  { n: 1, iniciales: 'E1', nombre: 'Especialista 1', tono: 'azul', total: 47250 },
  { n: 2, iniciales: 'E2', nombre: 'Especialista 2', tono: 'tinta', total: 50925 },
  { n: 3, iniciales: 'E3', nombre: 'Especialista 3', tono: 'medio', total: 53550 },
];

const q = (capa: Element, s: string) => capa.querySelector(s);
const qa = (capa: Element, s: string) => [...capa.querySelectorAll(s)];
const ve = (on: boolean) => `opacity:${on ? 1 : 0}`;
const px = (v: number) => `${Math.round(v * 10) / 10}px`;

// ═════════════════════════════════════════════════════════════════════════════
// 02-u-opciones · hoja "¿Para cuándo lo necesitás?"
// ═════════════════════════════════════════════════════════════════════════════

export type Opcion = 'urgencia' | 'programado' | 'obra';

export const OPCIONES: readonly { id: Opcion; icono: Icono; titulo: string; etiqueta: string; texto: string }[] = [
  { id: 'urgencia', icono: 'alerta', titulo: 'Urgencia', etiqueta: 'Hoy', texto: 'Lo antes posible, para lo que no\npuede esperar' },
  { id: 'programado', icono: 'agenda', titulo: 'Programado', etiqueta: 'Vos elegís', texto: 'Elegís el día y la franja que te\nquedan cómodos' },
  { id: 'obra', icono: 'ladrillos', titulo: 'Obra', etiqueta: 'Con visita', texto: 'Trabajos grandes, con visita para\npresupuestar' },
];

/** Medidas de la hoja (px de la pantalla): borde de arriba, tarjetas (x, primera y, paso, tamaño, canto), caja de info. */
export const PARA_CUANDO = {
  top: 340.5,
  opcion: { x: 34, y: 486.3, paso: 106.05, w: 346, h: 91.7, canto: 5.1 },
  info: { x: 34, y: 807.3, w: 346, h: 68.7 },
} as const;

export interface ParaCuandoProps {
  /** opción que se ve apretada (sin canto, como Urgencia en la foto); false = ninguna. Default 'urgencia'. */
  apretada?: Opcion | false;
  /** borde de arriba de la hoja en la pantalla (default 340,5, el de la foto) */
  top?: number;
}

function tarjetaOpcion(o: (typeof OPCIONES)[number], i: number, apretada: boolean): string {
  const c = PARA_CUANDO.opcion;
  return `<span class="ap-ua-opcion" data-opcion="${o.id}" style="left:${px(c.x - 10.6)};top:${px(c.y + i * c.paso - PARA_CUANDO.top)}">`
    + `<span class="ap-ua-opcion-canto"${apretada ? ' style="opacity:0"' : ''}></span>`
    + '<span class="ap-ua-opcion-cara">'
    + `<span class="ap-ua-opcion-icono">${icono(o.icono, { tam: o.id === 'urgencia' ? 27 : 26, trazo: o.id === 'urgencia' ? 2.3 : 2.2 })}</span>`
    + `<span class="ap-ua-opcion-cabeza"><span class="ap-ua-opcion-titulo ap-display">${esc(o.titulo)}</span>`
    + `<span class="ap-ua-opcion-etiqueta">${esc(o.etiqueta)}</span></span>`
    + `<span class="ap-ua-opcion-texto">${esc(o.texto).replace('\n', '<br>')}</span>`
    + `<span class="ap-ua-opcion-chevron">${icono('chevron-der', { tam: 20, trazo: 2.4 })}</span>`
    + '</span></span>';
}

/* hojaParaCuando({ apretada = 'urgencia', top = 340,5 })   02-u-opciones · [data-pantalla="hoja-para-cuando"]
     UNA capa (velo + hoja) para apilar sobre pantallaInicioUsuario() (usuario.ts). Hoja blanca de ui/hoja.ts sin filete,
     título tinta en dos renglones, X roja chica (40,5), "Tu pedido de" + chip celeste "Plomería", las tres opciones
     azules con canto y la caja de info gris.
     Ganchos y posición medida (px de la pantalla 414×896, x · y · ancho × alto; con otro `top` todo corre igual):
       .ap-velo · .ap-hoja (10,6 · 340,5 · 392,8 × hasta abajo; subirla con subirHoja de ui/hoja.ts, cerrarla con cerrarHoja)
       .ap-hoja-titulo (Archivo 20,4 al 121 %, centrado en x 207; mayúsculas desde 376,5 y 400, renglones cada 26) ·
         .ap-hoja-cerrar (círculo de 40,5, centro 362,6 · 384,3) · .ap-hoja-asa (180,8 · 351,1 · 52,4 × 6)
       .ap-ua-pedido (fila "Tu pedido de" + .ap-ua-pedido-chip: chip 207 · 442,7 · 99,5 × 27,7, centro de la fila y 456,5)
       .ap-ua-opcion[data-opcion="urgencia|programado|obra"] (34 · 486,3 / 592,4 / 698,4 · 346 × 91,7 + canto 5,1):
         .ap-ua-opcion-canto (opacity 0 = apretada) · .ap-ua-opcion-cara (apretarla: y = 5,1) · .ap-ua-opcion-icono
         (cuadrado de 52,5 en x 51, amarillo en Urgencia) · .ap-ua-opcion-titulo · .ap-ua-opcion-etiqueta ·
         .ap-ua-opcion-texto · .ap-ua-opcion-chevron (x 351). Centro de Urgencia para el dedo: (207 , 532).
       .ap-ua-cuando-info (34 · 807,3 · 346 × 68,7) */
export function hojaParaCuando({ apretada = 'urgencia', top = PARA_CUANDO.top }: ParaCuandoProps = {}): string {
  const info = PARA_CUANDO.info;
  // el contenido va en coordenadas de la hoja (.ap-ua-hoja-contenido se corre lo que corre el cuerpo)
  const cuerpo = '<div class="ap-ua-hoja-contenido">'
    + `<span class="ap-ua-pedido"><span>Tu pedido de</span><span class="ap-ua-pedido-chip">${icono('canilla', { tam: 16, trazo: 2.3 })}<span>Plomería</span></span></span>`
    + OPCIONES.map((o, i) => tarjetaOpcion(o, i, o.id === apretada)).join('')
    + `<span class="ap-ua-cuando-info" style="left:${px(info.x - 10.6)};top:${px(info.y - PARA_CUANDO.top)}">${icono('info', { tam: 15, trazo: 2 })}`
    + '<span>En una urgencia les avisamos a los especialistas de<br>tu zona que la toman. Cada uno te dice a qué hora<br>puede ir.</span></span>'
    + '</div>';
  return hoja({ titulo: '¿Para cuándo lo\nnecesitás?', tono: 'tinta', tam: 20.4, ancho: 121, linea: false, top, dato: 'para-cuando', className: 'ap-ua-hoja-cuando', cuerpo });
}

/** Las opciones entran en cascada (de abajo, con opacity) y después la caja de info. Devuelve la duración. */
export function cascadaOpciones(tl: GSAPTimeline, capa: Element, at: number, { paso = 0.08 }: { paso?: number } = {}): number {
  const ops = qa(capa, '.ap-ua-opcion');
  tl.fromTo(ops, { y: 36, opacity: 0 }, { y: 0, opacity: 1, duration: 0.42, ease: 'back.out(1.5)', stagger: paso }, at);
  tl.fromTo(q(capa, '.ap-ua-cuando-info'), { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35, ease: 'power2.out' }, at + paso * 3);
  return paso * 3 + 0.35;
}

/** Aprieta una opción: la cara baja hasta tapar el canto, el canto se apaga y la cara vuelve (queda como en la foto:
    apretada = sin canto). Devuelve la duración. */
export function apretarOpcion(tl: GSAPTimeline, capa: Element, id: Opcion, at: number, { dur = 0.26 }: { dur?: number } = {}): number {
  const op = q(capa, `.ap-ua-opcion[data-opcion="${id}"]`)!;
  const cara = op.querySelector('.ap-ua-opcion-cara');
  tl.to(cara, { y: PARA_CUANDO.opcion.canto, duration: dur * 0.35, ease: 'power2.out' }, at);
  tl.set(op.querySelector('.ap-ua-opcion-canto'), { opacity: 0 }, at + dur * 0.35);
  tl.to(cara, { y: 0, duration: dur * 0.65, ease: 'back.out(2)' }, at + dur * 0.35);
  return dur;
}

/** Cierra una hoja (la baja y apaga el velo). Sirve para cualquier capa de ui/hoja.ts. Devuelve la duración. */
export function cerrarHoja(tl: GSAPTimeline, capa: Element, at: number, { dur = 0.4 }: { dur?: number } = {}): number {
  tl.to(q(capa, '.ap-hoja'), { y: 820, duration: dur, ease: 'power2.in' }, at);
  const velo = q(capa, '.ap-velo');
  if (velo) tl.to(velo, { opacity: 0, duration: dur * 0.8, ease: 'power1.in' }, at + dur * 0.2);
  return dur;
}

// ═════════════════════════════════════════════════════════════════════════════
// 03-u-describir · "Contanos qué pasó"
// ═════════════════════════════════════════════════════════════════════════════

export interface DescribirProps {
  /** lo que escribe el usuario (una <span> por palabra) */
  texto?: string;
  /** número del globito de la campana (default 2) */
  campana?: number | false;
}

/* pantallaDescribir({ texto = TEXTO_PEDIDO, campana = 2 })   03-u-describir · [data-pantalla="u-describir"]
     Encabezado blanco (solo la campana, a la derecha), cabecera "Contanos qué pasó / Último paso" con Volver, tarjeta
     azul RUBRO (Plomería · Urgencia) y gris CUÁNDO (Hoy, martes 17), la caja CONTALO CON TUS PALABRAS con el texto (una
     <span> por palabra, para tipearlo: escribirTexto), FOTOS (Sumar foto), DIRECCIÓN (Casa · Catamarca 1650, Mar del
     Plata) y el pie blanco con "Pedir presupuestos" y la nota. La foto mide 914 de alto: el pie sube 18 px.
     Ganchos y posición medida (px de la pantalla 414×896, x · y · ancho × alto):
       .ap-encabezado (campana en 336,9 · 54,9) · .ap-ua-paso: .ap-ua-volver (23,6 · 131,5 · 48,8 × 48,5 + canto 3,8) ·
         .ap-ua-paso-titulo (x 87, mayúscula 137,7) · .ap-ua-paso-bajada
       .ap-ua-rubro (23,6 · 200,3 · 178,3 × 102, azul) · .ap-ua-cuando (212,8 · 200,3 · 177,6 × 102, gris)
       .ap-ua-caja-texto (23,6 · 347,3 · 366,9 × 114,4): .ap-ua-texto con .ap-ua-palabra (una por palabra, opacity) y su
         .ap-ua-cursor (palito azul al final de cada palabra; .ap-ua-cursor-inicio = antes de la primera) · .ap-ua-ayuda
       .ap-ua-foto "Sumar foto" (23,6 · 506,5 · 93 × 93,5)
       .ap-ua-lugar (23,6 · 642,7 · 366,9 × 81,3): .ap-ua-lugar-icono (casa) · .ap-ua-lugar-titulo · .ap-ua-lugar-texto
       .ap-ua-pie (desde 777): .ap-boton[data-accion="pedir-presupuestos"] (23,6 · 794 · 366,9 × 52 + canto 4,7; centro
         para el dedo 207 · 820) · .ap-ua-pie-nota "Ves cada precio antes de confirmar." (base 871) */
export function pantallaDescribir({ texto = TEXTO_PEDIDO, campana = 2 }: DescribirProps = {}): string {
  const palabras = texto.split(/\s+/).filter(Boolean)
    .map((p, i, a) => `<span class="ap-ua-palabra" data-palabra="${i}">${esc(p)}<i class="ap-ua-cursor"></i></span>${i < a.length - 1 ? ' ' : ''}`).join('');
  return '<div class="hd-capa ap-pantalla ap-ui ap-ua-describir" data-pantalla="u-describir">'
    + encabezado({ variante: 'blanco', campana, ubicacion: false, className: 'ap-ua-encabezado-solo' })
    + cabeceraPaso({ titulo: 'Contanos qué pasó', bajada: 'Último paso' })
    + '<div class="ap-ua-rubro">'
    + rotulo('Rubro', { className: 'ap-ua-dato-rotulo' })
    + `<span class="ap-ua-dato-valor">${icono('canilla', { tam: 17, trazo: 2.3 })}<span>Plomería</span></span>`
    + '<span class="ap-ua-dato-texto">Urgencia</span></div>'
    + '<div class="ap-ua-cuando">'
    + rotulo('Cuándo', { className: 'ap-ua-dato-rotulo' })
    + '<span class="ap-ua-dato-valor"><span>Hoy, martes 17</span></span>'
    + '<span class="ap-ua-dato-texto">Cada especialista te<br>dice el horario</span></div>'
    + rotulo('Contalo con tus palabras', { className: 'ap-abs ap-ua-rotulo-contalo' })
    + '<div class="ap-ua-caja-texto">'
    + `<p class="ap-ua-texto"><i class="ap-ua-cursor ap-ua-cursor-inicio"></i>${palabras}</p>`
    + `<span class="ap-ua-ayuda">${icono('lapiz', { tam: 10.5, trazo: 2.4 })}<span>Como te salga: el especialista lo lee antes de mandarte<br>su precio.</span></span>`
    + '</div>'
    + rotulo('Fotos (opcional)', { className: 'ap-abs ap-ua-rotulo-fotos' })
    + `<span class="ap-ua-foto">${icono('camara', { tam: 25, trazo: 2.1 })}<span>Sumar foto</span></span>`
    + rotulo('Dirección', { className: 'ap-abs ap-ua-rotulo-direccion' })
    + '<div class="ap-ua-lugar">'
    + `<span class="ap-ua-lugar-icono">${icono('casa', { tam: 24, trazo: 2.2 })}</span>`
    + '<span class="ap-ua-lugar-titulo">Casa</span>'
    + '<span class="ap-ua-lugar-texto">Catamarca 1650, Mar del Plata</span>'
    + `<span class="ap-ua-lugar-chevron">${icono('chevron-der', { tam: 16, trazo: 2.4 })}</span>`
    + '</div>'
    + pieFijo({
      top: 777,
      cuerpo: boton({ texto: 'Pedir presupuestos', icono: 'enviar', ancho: 366.9, accion: 'pedir-presupuestos', className: 'ap-ua-pie-boton' })
        + '<span class="ap-ua-pie-nota">Ves cada precio antes de confirmar.</span>',
    })
    + '</div>';
}

/** Tipea el texto palabra por palabra (opacity de cada .ap-ua-palabra) con el cursor al final de la última; arranca
    con la caja vacía y el cursor al principio (fromTo: el estado vacío queda puesto desde que se arma la escena).
    porPalabra: segundos entre palabras. Devuelve la duración. */
export function escribirTexto(tl: GSAPTimeline, capa: Element, at: number, { porPalabra = 0.09, cursor = true }: { porPalabra?: number; cursor?: boolean } = {}): number {
  const palabras = qa(capa, '.ap-ua-palabra');
  const inicio = q(capa, '.ap-ua-cursor-inicio');
  const cursores = palabras.map(p => p.querySelector('.ap-ua-cursor'));
  tl.fromTo(palabras, { opacity: 0 }, { opacity: 1, duration: 0.05, ease: 'none', stagger: porPalabra }, at);
  if (cursor) {
    tl.fromTo(inicio, { opacity: 1 }, { opacity: 0, duration: 0.01 }, at);
    cursores.forEach((c, i) => {
      tl.fromTo(c, { opacity: 0 }, { opacity: 1, duration: 0.01, immediateRender: false }, at + i * porPalabra);
      if (i < cursores.length - 1) tl.to(c, { opacity: 0, duration: 0.01 }, at + (i + 1) * porPalabra);
    });
  }
  return palabras.length * porPalabra;
}

// ═════════════════════════════════════════════════════════════════════════════
// 27/29-u-programar · "Programá el turno"
// ═════════════════════════════════════════════════════════════════════════════

/** Los días de la tira (noviembre 2026: hoy es el martes 17). */
export const DIAS_PROGRAMAR: readonly TiraDia[] = [
  { nombre: 'HOY', numero: 17 }, { nombre: 'MIÉ', numero: 18 }, { nombre: 'JUE', numero: 19 },
  { nombre: 'VIE', numero: 20 }, { nombre: 'SÁB', numero: 21 }, { nombre: 'DOM', numero: 22 },
];

/** Las seis franjas (27-u-programar), de izquierda a derecha y de arriba abajo. */
export const FRANJAS: readonly { momento: string; hora: string }[] = [
  { momento: 'Mañana', hora: '8 a 10 h' }, { momento: 'Mañana', hora: '10 a 12 h' }, { momento: 'Mediodía', hora: '12 a 14 h' },
  { momento: 'Tarde', hora: '14 a 16 h' }, { momento: 'Tarde', hora: '16 a 18 h' }, { momento: 'Noche', hora: '18 a 20 h' },
];

export interface ProgramarProps {
  /** día elegido de la tira (índice en DIAS_PROGRAMAR; -1 = ninguno). Default 0 (HOY 17, la historia). */
  dia?: number;
  /** franja elegida (índice en FRANJAS; -1 = ninguna). Default 4 (Tarde 16 a 18 h). */
  franja?: number;
  /** fecha elegida con "Quiero elegir otra fecha": muestra la banda amarilla "Pedís el …" (27: 'Martes 24/11') */
  otraFecha?: string | false;
  /** hora elegida con "Quiero elegir otro horario": banda amarilla "Pedís que vaya a las …" (29: '08:00 h') */
  otraHora?: string | false;
  /** valores del pie "Tu pedido", apilados (uno visible: `actual`). Default: el de la selección. */
  pies?: readonly string[];
  actual?: number;
  campana?: number | false;
}

/** Medidas de la pantalla de programar (px). La foto mide 914: el pie sube 18 px. */
export const PROGRAMAR = {
  tira: { x: 23.6, y: 232.2, paso: 73.4, w: 64, h: 76.8, canto: 4 },
  elegir: { x: 23.6, w: 366.9, h: 48, canto: 4.4 },
  franja: { x: [23.6, 149.55, 275.5], paso: 72, w: 115, h: 61, canto: 4 },
  pie: 776,
} as const;

function cajaElegir(tipo: 'fecha' | 'horario', usado: boolean, y: number): string {
  const ic = tipo === 'fecha' ? icono('agenda', { tam: 18, trazo: 2.2 }) : icono('reloj', { tam: 16.5, trazo: 2.4 });
  return `<span class="ap-ua-elegir" data-elegir="${tipo}"${usado ? ' data-usado' : ''} style="top:${px(y)}">`
    + (usado ? '<span class="ap-ua-elegir-canto"></span>' : '')
    + `<span class="ap-ua-elegir-cara">${ic}<span>${tipo === 'fecha' ? 'Quiero elegir otra fecha' : 'Quiero elegir otro horario'}</span>`
    + `${icono('chevron-der', { tam: 18, trazo: 2.4, clase: 'ap-ua-elegir-chevron' })}</span></span>`;
}

function bandaPedis(tipo: 'fecha' | 'horario', texto: string, y: number): string {
  const ic = tipo === 'fecha' ? icono('agenda', { tam: 18, trazo: 2.2 }) : icono('reloj', { tam: 16.5, trazo: 2.4 });
  return `<span class="ap-ua-pedis" data-pedis="${tipo}" style="top:${px(y)}">${ic}`
    + `<span>${esc(texto)}</span>${icono('cerrar', { tam: 15.5, trazo: 2.4, clase: 'ap-ua-pedis-cerrar' })}</span>`;
}

/** Resumen del pie para una selección ("Martes 17/11 · 16 a 18 h"). */
export function resumenProgramar({ dia = 0, franja = 4, otraFecha, otraHora }: ProgramarProps = {}): string {
  const fecha = otraFecha || (dia >= 0 ? `${['Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'][dia]} ${DIAS_PROGRAMAR[dia].numero}/11` : '');
  const hora = otraHora ? `a las ${otraHora}` : franja >= 0 ? FRANJAS[franja].hora : '';
  return [fecha, hora].filter(Boolean).join(' · ');
}

/* pantallaProgramar({ dia = 0, franja = 4, otraFecha, otraHora, pies, actual, campana = 3 })   27/29-u-programar ·
     [data-pantalla="u-programar"]. Default = la historia (HOY 17 · Tarde 16 a 18 h, pie "Martes 17/11 · 16 a 18 h").
     La foto 27 es { dia: -1, otraFecha: 'Martes 24/11' } y la 29 { dia: -1, franja: -1, otraFecha: 'Martes 24/11',
     otraHora: '08:00 h' }: con una banda amarilla, su "Quiero elegir…" pasa a tarjeta (borde y canto celeste) y lo de
     abajo baja 56 px (banda de 48,4 + aire 7,6).
     Ganchos y posición medida (px de la pantalla 414×896, x · y · ancho × alto):
       .ap-ua-paso (Volver 23,6 · 131,5; título "Programá el turno"; bajada con la canilla) · .ap-ua-rotulo-dia (cap 202,5)
       .ap-ua-mes "Noviembre 2026" (262 · 199,5 · 128,5 × 19)
       .ap-tira (de ui/calendario.ts, acá agrandada): .ap-tira-dia[data-dia="17".."22"] (x 23,6 + i × 73,4 · y 232,2 ·
         64 × 76,8 + canto 4; centro de HOY 17 = 55,6 · 270,6) con .ap-tira-sel (opacity: elegirDiaTira)
       .ap-ua-elegir[data-elegir="fecha"] (23,6 · 329,1 · 366,9 × 48 [+ canto 4,4 si está usada]) ·
         .ap-ua-pedis[data-pedis="fecha"] (23,6 · 389,1 · 366,9 × 48,4)
       .ap-ua-rotulo-franja · .ap-ua-franja[data-franja="0".."5"] (columnas x 23,6 · 149,55 · 275,5; filas y G y G + 72
         con G = 426,3 sin banda de fecha o 482,3 con banda; 115 × 61 + canto 4; Tarde 16 a 18 h = índice 4, centro
         207 · G + 102,5): .ap-ua-franja-canto · .ap-ua-franja-cara · .ap-ua-franja-sel (opacity: elegirFranja)
       .ap-ua-elegir[data-elegir="horario"] (y H = G + 144,6; con hora elegida, la banda .ap-ua-pedis[data-pedis="horario"]
         en H + 60) · .ap-ua-info (16,4 debajo de lo último; el pie la tapa en el estado 29, como en la foto)
       .ap-ua-pie (desde 776): .ap-ua-pie-rotulo "Tu pedido" · .ap-ua-pie-valor[data-i] (apilados, a la derecha en x 390,5;
         centro y 800) · .ap-boton[data-accion="siguiente"] (23,6 · 820,4 · 366,9 × 52 + 4,4; centro 207 · 846) */
export function pantallaProgramar({
  dia = 0, franja = 4, otraFecha = false, otraHora = false, pies, actual, campana = 3,
}: ProgramarProps = {}): string {
  const P = PROGRAMAR;
  const valores = pies ?? [resumenProgramar({ dia, franja, otraFecha, otraHora })];
  const visible = actual ?? valores.length - 1;
  let y = 329.1;
  let html = cajaElegir('fecha', !!otraFecha, y);
  y += P.elegir.h + P.elegir.canto;
  if (otraFecha) { html += bandaPedis('fecha', `Pedís el ${otraFecha}`, y + 7.6); y += 7.6 + 48.4; }
  const rotFranja = y + 24;
  const grilla = rotFranja + 20.8;
  const franjas = FRANJAS.map((f, i) => {
    const cara = `<b>${esc(f.momento)}</b><span>${esc(f.hora)}</span>`;
    return `<span class="ap-ua-franja" data-franja="${i}" style="left:${P.franja.x[i % 3]}px;top:${px(grilla + Math.floor(i / 3) * P.franja.paso)}">`
      + `<span class="ap-ua-franja-canto"></span><span class="ap-ua-franja-cara">${cara}</span>`
      + `<span class="ap-ua-franja-sel" style="${ve(i === franja)}"><span class="ap-ua-franja-canto"></span><span class="ap-ua-franja-cara">${cara}</span></span>`
      + '</span>';
  }).join('');
  y = grilla + P.franja.paso + P.franja.h + P.franja.canto + 7.6;
  html += `<span class="ap-abs ap-ua-rotulo-franja" style="top:${px(rotFranja - 3.4)}">${rotulo('¿En qué franja?')}</span>`
    + franjas + cajaElegir('horario', !!otraHora, y);
  y += P.elegir.h + P.elegir.canto;
  if (otraHora) { html += bandaPedis('horario', `Pedís que vaya a las ${otraHora}`, y + 7.6); y += 7.6 + 48.4; }
  html += `<span class="ap-ua-info" style="top:${px(y + 16.4)}">${icono('info', { tam: 15.5, trazo: 2 })}<span>Es una solicitud: cada especialista la acepta, la rechaza<br>o te propone otra.</span></span>`;
  const pieValores = valores.map((v, i) => `<span class="ap-ua-pie-valor" data-i="${i}" style="${ve(i === visible)}">${esc(v)}</span>`).join('');
  return '<div class="hd-capa ap-pantalla ap-ui ap-ua-programar" data-pantalla="u-programar">'
    + encabezado({ variante: 'blanco', campana, ubicacion: false, className: 'ap-ua-encabezado-solo' })
    + cabeceraPaso({ titulo: 'Programá el turno', bajada: 'Plomería · Programado', icono: 'canilla' })
    + rotulo('¿Qué día?', { className: 'ap-abs ap-ua-rotulo-dia' })
    + `<span class="ap-ua-mes">${icono('agenda', { tam: 15, trazo: 2.1 })}<span>Noviembre 2026</span></span>`
    + tiraDias({ dias: DIAS_PROGRAMAR, elegido: dia, className: 'ap-ua-tira' })
    + html
    + pieFijo({
      top: P.pie,
      cuerpo: `<span class="ap-ua-pie-rotulo">${icono('agenda', { tam: 18, trazo: 2.1 })}<span>Tu pedido</span></span>${pieValores}`
        + boton({ texto: 'Siguiente', icono: 'flecha-der', iconoLado: 'der', ancho: 366.9, accion: 'siguiente', className: 'ap-ua-pie-boton' }),
    })
    + '</div>';
}

/** Elige una franja (cruza las capas azules; -1 apaga todas). Devuelve la duración. */
export function elegirFranja(tl: GSAPTimeline, capa: Element, i: number, at: number, dur = 0.2): number {
  qa(capa, '.ap-ua-franja').forEach((f, k) => tl.to(f.querySelector('.ap-ua-franja-sel'), { opacity: k === i ? 1 : 0, duration: dur, ease: 'power1.out' }, at));
  return dur;
}

/** Elige un día de la tira (índice; -1 apaga todos). Devuelve la duración. */
export function elegirDiaTira(tl: GSAPTimeline, capa: Element, i: number, at: number, dur = 0.2): number {
  qa(capa, '.ap-tira-dia').forEach((d, k) => tl.to(d.querySelector('.ap-tira-sel'), { opacity: k === i ? 1 : 0, duration: dur, ease: 'power1.out' }, at));
  return dur;
}

/** Cambia el valor visible del pie "Tu pedido" (capas de pantallaProgramar({ pies })). Devuelve la duración. */
export function cambiarPie(tl: GSAPTimeline, capa: Element, i: number, at: number, dur = 0.25): number {
  qa(capa, '.ap-ua-pie-valor').forEach((v, k) => {
    if (k === i) tl.fromTo(v, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: dur, ease: 'power2.out', immediateRender: false }, at);
    else tl.to(v, { opacity: 0, duration: dur * 0.6, ease: 'power1.out' }, at);
  });
  return dur;
}

// ═════════════════════════════════════════════════════════════════════════════
// 04-u-buscando · mapa + "Te llegó 1 propuesta 1/3"
// ═════════════════════════════════════════════════════════════════════════════

/** Medidas (px de la pantalla). El panel azul de la foto arranca en 519: acá sube 18 (la foto mide 914). */
export const BUSCANDO = {
  /** la ciudad de mapa.ts corrida y acercada para que La Perla quede como en la foto */
  vista: { x: -8, y: -106.5, escala: 1.036 },
  casa: { x: 215.75, y: 294.5 },
  radar: { x: 216, y: 280 },
  puntos: [{ x: 64, y: 183.7 }, { x: 58.5, y: 357 }, { x: 164.3, y: 446 }],
  panel: 501,
  progreso: { x: 24, w: 366, chico: 83.7, grande: 182.6, hueco: 8 },
  mini: { x: [23.6, 149.55, 275.5], w: 115 },
} as const;

/** Títulos del panel por cantidad de propuestas. */
export const TITULOS_BUSCANDO = ['Esperando propuestas', 'Te llegó 1 propuesta', 'Te llegaron 2 propuestas', 'Te llegaron 3 propuestas'] as const;

/** Relleno del segmento que se está buscando (1/3 en la foto: 61,1 de 182,2). */
const RELLENO = 0.335;

/** Segmentos de la barra para el estado n: [x, ancho, relleno (1 = lleno, 0…1 = buscando, 0 = vacío)]. */
function segmentos(n: number): [number, number, number][] {
  const p = BUSCANDO.progreso;
  if (n >= 3) { const w = (p.w - 2 * p.hueco) / 3; return [0, 1, 2].map(i => [i * (w + p.hueco), w, 1]); }
  let x = 0;
  return [0, 1, 2].map(i => {
    const w = i === n ? p.grande : p.chico;
    const s: [number, number, number] = [x, w, i < n ? 1 : i === n ? RELLENO : 0];
    x += w + p.hueco;
    return s;
  });
}

function miniTarjeta(p: (typeof PROPUESTAS)[number], visible: boolean): string {
  return `<span class="ap-ua-mini" data-n="${p.n}" style="${ve(visible)}">`
    + '<span class="ap-ua-mini-canto"></span><span class="ap-ua-mini-cara">'
    + `<span class="ap-ua-mini-avatar">${avatar({ iniciales: p.iniciales, tono: p.tono, tam: 39.5, tilde: true })}</span>`
    + `<span class="ap-ua-mini-nombre">${esc(p.nombre)}</span>`
    + `<span class="ap-ua-mini-precio ap-display">${esc(pesos(p.total))}</span>`
    + '</span></span>';
}

export interface BuscandoProps {
  /** propuestas que ya llegaron (0…3; default 1, como la foto). Todos los estados vienen apilados. */
  n?: 0 | 1 | 2 | 3;
}

/* pantallaBuscando({ n = 1 })   04-u-buscando · [data-pantalla="u-buscando"] (con phoneFrame({ estado: 'claro' }))
     Mapa de La Perla (mapa.ts con la vista corrida: BUSCANDO.vista) con el radar azul y el pin rojo en la casa, los
     puntos de los especialistas, el encabezado azul (solo la campana), Volver blanco, la píldora "Buscando en La Perla"
     y el panel azul de abajo. TODOS los estados 0/3 → 3/3 vienen apilados (los de otro n en opacity 0): títulos,
     contador, barras de progreso, mini tarjetas sobre sus lugares vacíos. ponerBuscando(capa, n) deja un estado y
     llegarPropuesta(tl, capa, n, at) pasa de n − 1 a n. El aviso negro va aparte: avisoPropuesta(n).
     Ganchos y posición medida (px de la pantalla 414×896, x · y · ancho × alto):
       .ap-mapa (pantalla entera) · .ap-ua-radar (centro 216 · 280): .ap-ua-radar-anillo[data-anillo="1|2|3"] (r 26 ·
         88 · 131; latir con scale/opacity, el origen es el centro) · .ap-ua-pin (la punta en 215,75 · 294,5; cabeza roja
         de r 13,25 con centro en 215,75 · 267,8 y aro blanco: soltarlo con y desde arriba, el svg tiene la punta abajo al
         centro) · .ap-ua-punto[data-punto="1|2|3"] (centros 64 · 183,7 / 58,5 · 357 / 164,3 · 446)
       .ap-encabezado[data-variante="azul"] (0 · 0 · 414 × 124; campana translúcida en 336,9 · 54,9)
       .ap-ua-volver[data-tono="blanco"] (21 · 137,5 · 49,5 × 49,7 + canto 3,6)
       .ap-ua-buscando "Buscando en La Perla" (pegada a la derecha en 398 · y 128 · ≈ 168 × 26) con .ap-ua-buscando-punto
       .ap-ua-panel (0 · 501 · 414 × 395, azul, radio 38 arriba; subirlo con y desde 400):
         .ap-ua-panel-asa (181 · 514) · .ap-ua-panel-titulo[data-n="0".."3"] (x 23,6; mayúscula 545,6 → 560; los de 2 y
         3 propuestas, más chicos para no pisar el contador)
         .ap-ua-contador (328,7 · 534,5 · 61,5 × 38) con .ap-ua-contador-n[data-n] (el número, apilado) · .ap-ua-contador-de "/3"
         .ap-ua-progreso (24 · 622,6 · 366 × 7,6): .ap-ua-progreso-capa[data-n] · .ap-ua-seg[data-seg] ·
           .ap-ua-seg-relleno (scaleX desde la izquierda; quieto en 0,335) · .ap-ua-lupa (en n = 1: 116,5 · 588,9, 27 × 27)
         .ap-ua-panel-texto (x 23,6; dos renglones, base 659,4 y 677,4)
         .ap-ua-mini-lugar[data-n="1|2|3"] (x 23,6 · 149,55 · 275,5 · y 697,6 · 115 × 111): .ap-ua-mini-vacia (el
           gris de espera) y encima .ap-ua-mini (cara blanca de 107 + canto 4: avatar, nombre, precio). Centro de la
           de Especialista 1: 81 · 751.
         .ap-ua-ver "Ver propuestas →" (23,6 · 819,4 · 366,9 × 53,1 + canto 4,4; centro para el dedo 207 · 846) */
export function pantallaBuscando({ n = 1 }: BuscandoProps = {}): string {
  const B = BUSCANDO;
  const puntos = B.puntos.map((p, i) => `<span class="ap-ua-punto" data-punto="${i + 1}" style="left:${p.x}px;top:${p.y}px"></span>`).join('');
  const radar = `<span class="ap-ua-radar" style="left:${B.radar.x}px;top:${B.radar.y}px">`
    + ['3', '2', '1'].map(a => `<span class="ap-ua-radar-anillo" data-anillo="${a}"></span>`).join('') + '</span>';
  // pin de la foto: cabeza roja de r 13,25 con aro blanco de 2,5 por fuera (paint-order) y la punta en (casa.x, casa.y)
  const pin = `<span class="ap-ua-pin" style="left:${B.casa.x}px;top:${B.casa.y}px"><svg viewBox="0 0 32 46" width="32" height="46" aria-hidden="true">`
    + '<path d="M16 42C10 34.5 2.75 27 2.75 15.5a13.25 13.25 0 0 1 26.5 0C29.25 27 22 34.5 16 42z" fill="#E53935" stroke="#FFFFFF" stroke-width="5" stroke-linejoin="round" paint-order="stroke"/>'
    + '<circle cx="16" cy="15" r="6" fill="#FFFFFF"/></svg></span>';
  const titulos = TITULOS_BUSCANDO.map((t, i) => `<span class="ap-ua-panel-titulo ap-display" data-n="${i}" style="${ve(i === n)}">${esc(t)}</span>`).join('');
  const numeros = [0, 1, 2, 3].map(i => `<span class="ap-ua-contador-n ap-display" data-n="${i}" style="${ve(i === n)}">${i}</span>`).join('');
  const progreso = [0, 1, 2, 3].map(k => {
    const segs = segmentos(k);
    const actual = segs.findIndex(s => s[2] > 0 && s[2] < 1);
    return `<span class="ap-ua-progreso-capa" data-n="${k}" style="${ve(k === n)}">`
      + segs.map(([x, w, r], i) => `<span class="ap-ua-seg" data-seg="${i}"${r === 1 ? ' data-lleno' : ''} style="left:${px(x)};width:${px(w)}">`
        + (r > 0 && r < 1 ? `<span class="ap-ua-seg-relleno" style="transform:scaleX(${r})"></span>` : '') + '</span>').join('')
      + (actual >= 0 ? `<span class="ap-ua-lupa" style="left:${px(segs[actual][0] + 0.8)}">${icono('buscar', { tam: 27, trazo: 2.4 })}</span>` : '')
      + '</span>';
  }).join('');
  const minis = PROPUESTAS.map((p, i) => `<span class="ap-ua-mini-lugar" data-n="${p.n}" style="left:${B.mini.x[i]}px">`
    + `<span class="ap-ua-mini-vacia" style="${ve(n < p.n)}"><i></i><b></b><b></b></span>${miniTarjeta(p, n >= p.n)}</span>`).join('');
  return '<div class="hd-capa ap-pantalla ap-ui ap-ua-buscando-pantalla" data-pantalla="u-buscando">'
    + mapa({ estado: 'color', ambos: false, vista: B.vista, yo: false, className: 'ap-ua-mapa' })
    + radar + puntos + pin
    + encabezado({ variante: 'azul', campana: false, ubicacion: false, className: 'ap-ua-encabezado-solo' })
    + botonVolver({ tono: 'blanco', estilo: 'left:21px;top:137.5px' })
    + '<span class="ap-ua-buscando"><span class="ap-ua-buscando-punto"></span><span>Buscando en La Perla</span></span>'
    + `<div class="ap-ua-panel" style="top:${B.panel}px">`
    + '<span class="ap-ua-panel-asa"></span>'
    + titulos
    + `<span class="ap-ua-contador">${numeros}<span class="ap-ua-contador-de ap-display">/3</span></span>`
    + `<span class="ap-ua-progreso">${progreso}</span>`
    + '<span class="ap-ua-panel-texto">Cada especialista verificado revisa tu pedido y te manda<br>su precio.</span>'
    + minis
    + `<span class="ap-ua-ver" data-accion="ver-propuestas"><span class="ap-ua-ver-canto"></span><span class="ap-ua-ver-cara"><span>Ver propuestas</span>${icono('flecha-der', { tam: 22, trazo: 2.4 })}</span></span>`
    + '</div>'
    + '</div>';
}

/** Al construir la escena: deja la pantalla de buscando en el estado n (gsap.set de títulos, contador, barra,
    tarjetas y lugares vacíos). */
export function ponerBuscando(capa: Element, n: number): void {
  const por = (s: string, f: (k: number) => boolean) => qa(capa, s).forEach(e => gsap.set(e, { opacity: f(Number((e as HTMLElement).dataset.n)) ? 1 : 0 }));
  por('.ap-ua-panel-titulo', k => k === n);
  por('.ap-ua-contador-n', k => k === n);
  por('.ap-ua-progreso-capa', k => k === n);
  qa(capa, '.ap-ua-mini-lugar').forEach(l => {
    const k = Number((l as HTMLElement).dataset.n);
    gsap.set(l.querySelector('.ap-ua-mini'), { opacity: n >= k ? 1 : 0, scale: 1, y: 0 });
    gsap.set(l.querySelector('.ap-ua-mini-vacia'), { opacity: n >= k ? 0 : 1 });
  });
}

/** Llega la propuesta n (de n − 1 a n): cruza el título y el número del contador (con un saltito del contador), pasa a
    la barra del estado n (el segmento que busca se llena desde 0) y la mini tarjeta n aparece con pop sobre su lugar
    vacío. Devuelve la duración. Para el aviso de arriba: bajarAviso(tl, capa de avisoPropuesta(n), at) (ui/aviso.ts). */
export function llegarPropuesta(tl: GSAPTimeline, capa: Element, n: 1 | 2 | 3, at: number): number {
  const cruzar = (s: string, dy: number) => {
    tl.to(q(capa, `${s}[data-n="${n - 1}"]`), { opacity: 0, y: -dy, duration: 0.2, ease: 'power1.in' }, at);
    tl.fromTo(q(capa, `${s}[data-n="${n}"]`), { opacity: 0, y: dy }, { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out', immediateRender: false }, at + 0.12);
  };
  cruzar('.ap-ua-panel-titulo', 10);
  cruzar('.ap-ua-contador-n', 12);
  tl.fromTo(q(capa, '.ap-ua-contador'), { scale: 1 }, { scale: 1.12, duration: 0.14, ease: 'power2.out', yoyo: true, repeat: 1, immediateRender: false }, at + 0.1);
  tl.to(q(capa, `.ap-ua-progreso-capa[data-n="${n - 1}"]`), { opacity: 0, duration: 0.2, ease: 'power1.out' }, at);
  tl.fromTo(q(capa, `.ap-ua-progreso-capa[data-n="${n}"]`), { opacity: 0 }, { opacity: 1, duration: 0.2, ease: 'power1.out', immediateRender: false }, at);
  const relleno = q(capa, `.ap-ua-progreso-capa[data-n="${n}"] .ap-ua-seg-relleno`);
  if (relleno) tl.fromTo(relleno, { scaleX: 0 }, { scaleX: RELLENO, duration: 0.9, ease: 'power1.out', immediateRender: false }, at + 0.2);
  const lugar = q(capa, `.ap-ua-mini-lugar[data-n="${n}"]`)!;
  tl.to(lugar.querySelector('.ap-ua-mini-vacia'), { opacity: 0, duration: 0.2, ease: 'power1.out' }, at + 0.05);
  tl.fromTo(lugar.querySelector('.ap-ua-mini'), { opacity: 0, scale: 0.7, y: 14 }, { opacity: 1, scale: 1, y: 0, duration: 0.45, ease: 'back.out(1.8)', immediateRender: false }, at + 0.05);
  return 0.5;
}

/** El radar late `veces` veces (los anillos crecen desde 0,8 y se apagan un poco). Devuelve la duración. */
export function latirRadar(tl: GSAPTimeline, capa: Element, at: number, { veces = 2, dur = 1.2 }: { veces?: number; dur?: number } = {}): number {
  const anillos = qa(capa, '.ap-ua-radar-anillo');
  for (let i = 0; i < veces; i++) {
    tl.fromTo(anillos, { scale: 0.82, opacity: 0.35 }, { scale: 1, opacity: 1, duration: dur, ease: 'power2.out', stagger: 0.12, immediateRender: i === 0 }, at + i * dur);
  }
  return veces * dur;
}

/** La lupa del segmento que busca se mueve de un lado al otro (estado n). Devuelve la duración. */
export function menearLupa(tl: GSAPTimeline, capa: Element, n: number, at: number, { dur = 1.6, ancho = 40 }: { dur?: number; ancho?: number } = {}): number {
  const lupa = q(capa, `.ap-ua-progreso-capa[data-n="${n}"] .ap-ua-lupa`);
  if (!lupa) return 0;
  tl.to(lupa, { x: ancho, rotation: 8, duration: dur / 2, ease: 'sine.inOut', yoyo: true, repeat: 1 }, at);
  return dur;
}

/** Aviso negro "Te llegó una propuesta · Especialista N · $ X final para vos" (04/05-u). capa false = solo la píldora.
    Ganchos de ui/aviso.ts (.ap-aviso-capa[data-pantalla="aviso-propuesta-N"] · .ap-aviso · .ap-aviso-circulo); entra
    con bajarAviso y sale con subirAviso. Mientras está quieto en pantalla: gsap.set(barraDelAviso(capa), { opacity: 0 }). */
export function avisoPropuesta(n: 1 | 2 | 3, { capa = true }: { capa?: boolean } = {}): string {
  const p = PROPUESTAS[n - 1];
  return aviso({ titulo: 'Te llegó una propuesta', detalle: `${p.nombre} · ${pesos(p.total)} final para vos`, icono: 'billetera', tono: 'azul', capa, dato: `propuesta-${n}` });
}
