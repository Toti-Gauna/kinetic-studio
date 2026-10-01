/* Calificación con cinco estrellas: cada estrella tiene la capa vacía (contorno gris) y encima la llena (ámbar #FFC21A
   con borde ámbar oscuro). Por defecto se dibujan llenas las primeras `valor` (estado final).
   starRating({ valor = 5, tamano = 40, separacion, className, id }) → string <div class="hd-estrellas">.
   Para completarlas en escena: prepararEstrellas(el) al construir (apaga las capas llenas) y
   llenarEstrellas(tl, el, at, { paso }) en el timeline: una por paso con un "pop" (scale + opacity). Devuelve la duración;
   la estrella i se completa en at + i × paso (para el sonido).
   Ganchos: .hd-estrellas · .hd-estrella[data-i][data-llena] · .hd-estrella-vacia · .hd-estrella-llena. */
import { gsap } from 'gsap';
import '../css/base.css';
import '../css/ui.css';
import { icon } from '../icons.ts';

export interface StarRatingProps {
  /** estrellas llenas, 0–5 (default 5) */
  valor?: number;
  /** lado de cada estrella en px (default 40) */
  tamano?: number;
  /** espacio entre estrellas en px (default 0,25 × tamano) */
  separacion?: number;
  className?: string;
  id?: string;
}

const ESC: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };
const esc = (s: string) => s.replace(/[&<>"]/g, c => ESC[c] ?? c);

export function starRating({ valor = 5, tamano = 40, separacion, className = '', id }: StarRatingProps = {}): string {
  const cls = ['hd-estrellas', 'hd-ui', className].filter(Boolean).join(' ');
  const gap = separacion ?? Math.round(tamano * 0.25);
  const vacia = icon('estrella', { size: tamano, stroke: 1.5, fill: '#FFFFFF' });
  const llena = icon('estrella', { size: tamano, stroke: 1.5, fill: 'currentColor' });
  const estrellas = Array.from({ length: 5 }, (_, i) =>
    `<span class="hd-estrella" data-i="${i}" data-llena="${i < valor ? 1 : 0}" style="width:${tamano}px;height:${tamano}px">`
    + `<span class="hd-estrella-vacia">${vacia}</span><span class="hd-estrella-llena">${llena}</span></span>`).join('');
  return `<div class="${cls}"${id ? ` id="${esc(id)}"` : ''} style="gap:${gap}px">${estrellas}</div>`;
}

const llenas = (el: Element) => Array.from(el.querySelectorAll<HTMLElement>('.hd-estrella-llena'));

/** Estado inicial (al construir la escena): todas las estrellas vacías. */
export function prepararEstrellas(el: Element): void {
  gsap.set(llenas(el), { opacity: 0, scale: 0.3 });
}

/** Completa las estrellas desde `desde` hasta `hasta` (excluida), una por `paso` segundos, con un pop. Devuelve la duración. */
export function llenarEstrellas(
  tl: GSAPTimeline, el: Element, at: number,
  { paso = 0.5, desde = 0, hasta = 5 }: { paso?: number; desde?: number; hasta?: number } = {},
): number {
  const capas = llenas(el).slice(desde, hasta);
  capas.forEach((capa, k) => {
    const t = at + k * paso;
    tl.to(capa, { opacity: 1, duration: 0.12, ease: 'power1.out' }, t);
    tl.to(capa, { scale: 1, duration: 0.45, ease: 'back.out(3)' }, t);
  });
  return capas.length ? (capas.length - 1) * paso + 0.45 : 0;
}
