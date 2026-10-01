/* Ficha de la grilla de inicio (rubros y accesos "Quiero…"): cuadrado gris #EDEDED redondeado, ícono de línea negro
   de 40 px y el nombre en negrita (hasta 2 líneas).
   tile({ id, icono, texto, seleccionada = false, className }) → string <div class="hd-ficha" data-id>.
   Suelta mide 112×112; dentro de una grilla .hd-fichas (3 columnas) toma el ancho de la columna.
   Capa de selección .hd-ficha-sel: la misma ficha en azul con ícono y texto blancos, apagada (opacity 0) salvo con
   seleccionada; la escena la prende con opacity (nada de tweens de color).
   Ganchos: .hd-ficha[data-id] · .hd-ficha-icono · .hd-ficha-texto · .hd-ficha-sel. */
import '../css/base.css';
import '../css/ui.css';
import { icon, type IconName } from '../icons.ts';

export interface TileProps {
  /** identificador estable (data-id), p. ej. 'plomeria' */
  id: string;
  icono: IconName;
  texto: string;
  /** dibujarla ya seleccionada (azul) */
  seleccionada?: boolean;
  className?: string;
}

const ESC: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };
const esc = (s: string) => s.replace(/[&<>"]/g, c => ESC[c] ?? c);

export function tile({ id, icono, texto, seleccionada = false, className = '' }: TileProps): string {
  const cls = ['hd-ficha', 'hd-ui', className].filter(Boolean).join(' ');
  const dentro = `<span class="hd-ficha-icono">${icon(icono, { size: 40, stroke: 2.1 })}</span><span class="hd-ficha-texto">${esc(texto)}</span>`;
  return `<div class="${cls}" data-id="${esc(id)}"${seleccionada ? ' data-sel' : ''}>${dentro}<span class="hd-ficha-sel">${dentro}</span></div>`;
}
