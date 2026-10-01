/* Panel azul de seguimiento (abajo del mapa), como las pantallas originales: asa, estado con su ícono sobre la barra
   de tres tramos, la llegada declarada en una píldora + botón de información, y la fila "Tu especialista" con el
   botón de chat.
   trackingPanel({ especialista = 'Martín', nombre, llegada = 'Llega entre 16:06 y 16:30', estado = 'en-camino',
     avatar = { iniciales: 'MR' }, verificado = true, ancho = 414, className }) → string <section class="hd-seguimiento">.
   Alto: 294 px. Los tres estados están apilados en el mismo lugar; el activo sale con opacity 1 y los otros con 0
   (en línea): la escena los cruza con opacity.
     buscando  → "Buscando a Martín…"     (persona quieta sobre el 1.er tramo) · rellenos [1, 0, 0]
     en-camino → "Martín está en camino"  (persona caminando sobre el 2.º tramo) · rellenos [1, 1, 0]
     llego     → "¡Martín llegó!"         (persona festejando sobre el 3.er tramo) · rellenos [1, 1, 1]
   Ganchos: .hd-seguimiento[data-estado] · .hd-seg-estado[data-estado="buscando|en-camino|llego"] (título + ícono) ·
   .hd-seg-titulo · .hd-seg-icono · .hd-seg-barra > .hd-seg-tramo[data-i="0|1|2"] > .hd-seg-relleno (scaleX 0 → 1,
   transformOrigin a la izquierda ya puesto en el CSS) · .hd-seg-llegada · .hd-seg-btn[data-accion="info|chat"] ·
   .hd-seg-especialista. */
import '../css/base.css';
import '../css/chat.css';
import { icon, type IconName } from '../icons.ts';
import { avatar as avatarHtml } from './Avatar.ts';
import { selloVerificado } from './VerifiedBadge.ts';
import type { EstadoSeguimiento } from './MapView.ts';

export interface TrackingPanelProps {
  /** nombre de pila para los títulos ("Martín") */
  especialista?: string;
  /** nombre de la fila del especialista (default `especialista`; p. ej. "Martín R.") */
  nombre?: string;
  /** "Llega entre 16:06 y 16:30" (tal como lo declara el especialista) */
  llegada?: string;
  estado?: EstadoSeguimiento;
  avatar?: { iniciales: string; color?: string };
  /** sello Verificado al lado del nombre (default true) */
  verificado?: boolean;
  ancho?: number;
  className?: string;
}

const ESC: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };
const esc = (s: string) => s.replace(/[&<>"]/g, c => ESC[c] ?? c);

/** proporciones de los tres tramos de la barra (como el original: corto, largo, corto) */
const TRAMOS = [1, 2.1, 0.95] as const;
const HUECO = 10;
const ESTADOS: readonly EstadoSeguimiento[] = ['buscando', 'en-camino', 'llego'];
const ICONOS: Record<EstadoSeguimiento, IconName> = { 'buscando': 'persona', 'en-camino': 'persona-camina', 'llego': 'persona-festeja' };
const RELLENOS: Record<EstadoSeguimiento, readonly number[]> = { 'buscando': [1, 0, 0], 'en-camino': [1, 1, 0], 'llego': [1, 1, 1] };

export function trackingPanel({
  especialista = 'Martín', nombre, llegada = 'Llega entre 16:06 y 16:30', estado = 'en-camino',
  avatar = { iniciales: 'MR' }, verificado = true, ancho = 414, className = '',
}: TrackingPanelProps = {}): string {
  const cls = ['hd-seguimiento', className].filter(Boolean).join(' ');
  const n = esc(especialista);
  const titulos: Record<EstadoSeguimiento, string> = {
    'buscando': `Buscando a ${n}…`,
    'en-camino': `${n} está en camino`,
    'llego': `¡${n} llegó!`,
  };

  // barra centrada: el ícono de cada estado va sobre el centro de su tramo
  const anchoBarra = Math.round(ancho * 0.725);
  const izqBarra = (ancho - anchoBarra) / 2;
  const util = anchoBarra - HUECO * (TRAMOS.length - 1);
  const suma = TRAMOS.reduce((a, b) => a + b, 0);
  const centros: number[] = [];
  let x = 0;
  for (const t of TRAMOS) { const w = (util * t) / suma; centros.push(izqBarra + x + w / 2); x += w + HUECO; }

  const capas = ESTADOS.map((e, i) =>
    `<div class="hd-seg-estado" data-estado="${e}"${e === estado ? '' : ' style="opacity:0"'}>`
    + `<div class="hd-seg-titulo">${titulos[e]}</div>`
    + `<span class="hd-seg-icono" style="left:${Math.round(centros[i] - 17)}px">${icon(ICONOS[e], { size: 34, stroke: 2.2 })}</span>`
    + '</div>').join('');

  const barra = `<div class="hd-seg-barra" style="width:${anchoBarra}px;gap:${HUECO}px">`
    + TRAMOS.map((t, i) => `<span class="hd-seg-tramo" data-i="${i}" style="flex:${t}"><span class="hd-seg-relleno" style="transform:scaleX(${RELLENOS[estado][i]})"></span></span>`).join('')
    + '</div>';

  const fila = '<div class="hd-seg-fila">'
    + `<span class="hd-seg-llegada">${icon('reloj', { size: 21, stroke: 2.3 })}<span>${esc(llegada)}</span></span>`
    + `<span class="hd-seg-btn" data-accion="info">${icon('info', { size: 26, stroke: 2.1 })}</span>`
    + '</div>';

  const quien = '<div class="hd-seg-especialista">'
    + avatarHtml({ iniciales: avatar.iniciales, color: avatar.color ?? '#EE7A30', tamano: 46, anillo: true })
    + '<div class="hd-seg-quien"><span class="hd-seg-quien-etiqueta">Tu especialista</span>'
    + `<span class="hd-seg-quien-nombre">${esc(nombre ?? especialista)}${verificado ? selloVerificado(17, true) : ''}</span></div>`
    + `<span class="hd-seg-btn" data-accion="chat">${icon('mensajes', { size: 26, stroke: 2.1 })}</span>`
    + '</div>';

  return `<section class="${cls}" data-estado="${estado}" style="width:${ancho}px">`
    + '<span class="hd-seg-asa"></span>'
    + `<div class="hd-seg-estados">${capas}</div>`
    + barra + fila + quien
    + '</section>';
}
