/* Rueda de selección (día y horario) estilo iOS: cinco filas visibles, banda gris detrás de la fila elegida
   y bordes que se desvanecen con degradés fijos (sin máscaras animadas).
   dateWheel({ columnas: [{ id, items, indice, ancho, alinear }], filaAlto = 44, fondo = '#FFFFFF', className, id })
     → string <div class="hd-rueda">.
   Cada columna lleva dos listas que se mueven juntas: la gris (.hd-rueda-lista) y una copia en negro y negrita recortada a la
   banda (.hd-rueda-lista.hd-rueda-lista-sel), así la fila que cae en la banda se ve elegida sin animar colores.
   Las dos tienen la clase .hd-rueda-lista: para cambiar la elección se anima la y de AMBAS a ruedaY(indice, filaAlto).
   Más simple: ponerRueda(rueda, 'dia', 0) al construir (estado inicial) y girarRueda(tl, rueda, 'dia', 2, at) en el timeline
   (los dos leen el alto de fila de data-fila). Sin eso, cada columna arranca en la y de su `indice`.
   `fondo` = color de lo que está detrás (para los degradés de los bordes): '#FFFFFF' en pantalla, var de hoja en una hoja gris.
   Alto: 5 × filaAlto (220 px por defecto).
   Ganchos: .hd-rueda[data-fila] · .hd-rueda-banda · .hd-rueda-col[data-col] · .hd-rueda-lista · .hd-rueda-lista-sel ·
   .hd-rueda-item[data-i] · .hd-rueda-fade-arriba / -abajo. */
import { gsap } from 'gsap';
import '../css/base.css';
import '../css/ui.css';

export interface RuedaColumna {
  /** identificador de la columna (data-col), p. ej. 'dia' u 'hora' */
  id: string;
  items: string[];
  /** fila elegida (0 = primera) */
  indice: number;
  /** peso del ancho de la columna (flex-grow, default 1) */
  ancho?: number;
  /** alineación del texto (default 'centro') */
  alinear?: 'izquierda' | 'centro' | 'derecha';
}

export interface DateWheelProps {
  columnas: RuedaColumna[];
  /** alto de cada fila en px (default 44) */
  filaAlto?: number;
  /** color sólido del fondo (hex #RRGGBB) para los degradés de los bordes (default '#FFFFFF') */
  fondo?: string;
  className?: string;
  id?: string;
}

const ESC: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };
const esc = (s: string) => s.replace(/[&<>"]/g, c => ESC[c] ?? c);

/** y (px) de las listas de una columna para que la fila `indice` quede en la banda del medio. */
export function ruedaY(indice: number, filaAlto = 44): number {
  return (2 - indice) * filaAlto;
}

function transparente(hex: string): string {
  const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex.trim());
  return m ? `rgba(${parseInt(m[1], 16)}, ${parseInt(m[2], 16)}, ${parseInt(m[3], 16)}, 0)` : 'rgba(255, 255, 255, 0)';
}

export function dateWheel({ columnas, filaAlto = 44, fondo = '#FFFFFF', className = '', id }: DateWheelProps): string {
  const cls = ['hd-rueda', 'hd-ui', className].filter(Boolean).join(' ');
  const estilo = `--hd-fila:${filaAlto}px;--hd-rueda-fondo:${fondo};--hd-rueda-fondo-0:${transparente(fondo)}`;
  const cols = columnas.map(c => {
    const items = c.items.map((t, i) => `<div class="hd-rueda-item" data-i="${i}">${esc(t)}</div>`).join('');
    const y = `transform:translate(0px, ${ruedaY(c.indice, filaAlto)}px)`;
    return `<div class="hd-rueda-col" data-col="${esc(c.id)}" data-alinear="${c.alinear ?? 'centro'}" style="flex-grow:${c.ancho ?? 1}">`
      + `<div class="hd-rueda-lista" style="${y}">${items}</div>`
      + `<div class="hd-rueda-ventana"><div class="hd-rueda-lista hd-rueda-lista-sel" style="${y}">${items}</div></div>`
      + '</div>';
  }).join('');
  return `<div class="${cls}"${id ? ` id="${esc(id)}"` : ''} data-fila="${filaAlto}" style="${estilo}">`
    + '<div class="hd-rueda-banda"></div>'
    + cols
    + '<div class="hd-rueda-fade hd-rueda-fade-arriba"></div><div class="hd-rueda-fade hd-rueda-fade-abajo"></div>'
    + '</div>';
}

const listasDe = (rueda: Element, col: string) => rueda.querySelectorAll(`.hd-rueda-col[data-col="${col}"] .hd-rueda-lista`);
const filaDe = (rueda: Element) => Number((rueda as HTMLElement).dataset?.fila) || 44;

/** Al construir la escena: deja la columna `col` en la fila `indice` (gsap.set de sus dos listas). */
export function ponerRueda(rueda: Element, col: string, indice: number): void {
  gsap.set(listasDe(rueda, col), { y: ruedaY(indice, filaDe(rueda)) });
}

/** Gira la columna `col` hasta la fila `indice` (anima la y de sus dos listas). Devuelve la duración. */
export function girarRueda(
  tl: GSAPTimeline, rueda: Element, col: string, indice: number, at: number,
  { dur = 0.8, ease = 'power3.out' }: { dur?: number; ease?: string } = {},
): number {
  tl.to(listasDe(rueda, col), { y: ruedaY(indice, filaDe(rueda)), duration: dur, ease }, at);
  return dur;
}
