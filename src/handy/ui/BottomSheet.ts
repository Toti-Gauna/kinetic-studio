/* Hoja inferior de la app: velo oscuro sobre la pantalla + panel gris que sube desde abajo (radio 28 arriba, asa),
   con título azul centrado, subtítulo, línea divisoria azul y el contenido. Como las hojas de las pantallas originales.
   bottomSheet({ titulo, subtitulo, contenido, cerrar = false, className, id }) → string <div class="hd-hoja-capa">.
   La capa ocupa toda la pantalla (absolute, inset 0): va dentro de una .hd-capa del teléfono, encima de otra pantalla.
   Para animarla: gsap.set(velo, { opacity: 0 }) y gsap.set(hoja, { yPercent: 100 }) al construir; después
   tl.to(velo, { opacity: 1 }) + tl.to(hoja, { yPercent: 0, ease: 'expo.out' }).
   Ganchos: .hd-hoja-capa · .hd-velo · .hd-hoja · .hd-hoja-asa · .hd-hoja-cabeza · .hd-hoja-titulo · .hd-hoja-subtitulo ·
   .hd-hoja-cerrar (botón rojo con la cruz) · .hd-hoja-cuerpo.

   opcionTrabajo({ id, icono, titulo, detalle, seleccionada = false }) → string <div class="hd-opcion" data-id>:
   fila blanca con ícono en un cuadrado gris, título, detalle y una marca redonda a la derecha.
   Capa de selección .hd-opcion-sel: la misma fila en azul con texto blanco y la marca con tilde; apagada (opacity 0)
   salvo con seleccionada. La escena la prende con opacity y puede hacer "pop" de su marca (.hd-opcion-sel .hd-opcion-marca).
   Varias opciones van dentro de <div class="hd-opciones"> (columna con 12 px de separación).
   Ganchos: .hd-opcion[data-id] · .hd-opcion-icono · .hd-opcion-titulo · .hd-opcion-detalle · .hd-opcion-marca · .hd-opcion-sel. */
import '../css/base.css';
import '../css/ui.css';
import { icon, type IconName } from '../icons.ts';

export interface BottomSheetProps {
  titulo: string;
  subtitulo?: string;
  /** HTML del cuerpo de la hoja */
  contenido: string;
  /** botón rojo redondo con la cruz, arriba a la derecha (default false) */
  cerrar?: boolean;
  className?: string;
  id?: string;
}

export interface OpcionTrabajoProps {
  id: string;
  icono: IconName;
  titulo: string;
  detalle?: string;
  /** dibujarla ya elegida (fila azul) */
  seleccionada?: boolean;
}

const ESC: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };
const esc = (s: string) => s.replace(/[&<>"]/g, c => ESC[c] ?? c);

export function bottomSheet({ titulo, subtitulo, contenido, cerrar = false, className = '', id }: BottomSheetProps): string {
  const cls = ['hd-hoja-capa', 'hd-ui', className].filter(Boolean).join(' ');
  return `<div class="${cls}"${id ? ` id="${esc(id)}"` : ''}>`
    + '<div class="hd-velo"></div>'
    + '<div class="hd-hoja">'
    + '<div class="hd-hoja-asa"></div>'
    + '<div class="hd-hoja-cabeza">'
    + `<h3 class="hd-hoja-titulo">${esc(titulo)}</h3>`
    + (subtitulo ? `<p class="hd-hoja-subtitulo">${esc(subtitulo)}</p>` : '')
    + (cerrar ? `<span class="hd-hoja-cerrar">${icon('cerrar', { size: 22, stroke: 3 })}</span>` : '')
    + '</div>'
    + `<div class="hd-hoja-cuerpo">${contenido}</div>`
    + '</div></div>';
}

export function opcionTrabajo({ id, icono, titulo, detalle, seleccionada = false }: OpcionTrabajoProps): string {
  const fila = (sel: boolean) =>
    `<span class="hd-opcion-icono">${icon(icono, { size: 30, stroke: 1.9 })}</span>`
    + `<span class="hd-opcion-textos"><span class="hd-opcion-titulo">${esc(titulo)}</span>`
    + (detalle ? `<span class="hd-opcion-detalle">${esc(detalle)}</span>` : '')
    + '</span>'
    + `<span class="hd-opcion-marca">${sel ? icon('tilde', { size: 18, stroke: 3.2 }) : ''}</span>`;
  return `<div class="hd-opcion" data-id="${esc(id)}"${seleccionada ? ' data-sel' : ''}>${fila(false)}<div class="hd-opcion-sel">${fila(true)}</div></div>`;
}
